const API = 'https://api.ebay.com';
const TTL = 60 * 1000;

function safeUrl(value, image = false) {
  try {
    const u = new URL(value);
    const hosts = image ? ['i.ebayimg.com'] : ['www.ebay.com', 'ebay.com'];
    return u.protocol === 'https:' && hosts.includes(u.hostname) ? u.href : null;
  } catch { return null; }
}

// Title evidence is only a candidate match; it cannot certify the slab or artwork.
function assessMatch(card, title) {
  const t = title.toLowerCase();
  const reasons = [];
  const species = (card.pokemon_species || '').toLowerCase();
  for (const subject of species.split(/\s*(?:&|and|\/)\s*/).filter(s => !['tag team', 'related'].includes(s))) {
    if (subject && !t.includes(subject)) reasons.push('Khác tên Pokémon');
  }
  const number = String(card.card_number || '').split('/')[0];
  if (!number || !new RegExp(`(?:^|[^a-z0-9])#?${number.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^a-z0-9]|$)`, 'i').test(title)) reasons.push('Chưa khớp số thẻ');
  const company = card.grading_company === 'CGC' ? 'CGC' : 'PSA';
  if (!new RegExp(`\\b${company}\\s*10\\b`, 'i').test(title)) reasons.push(`Chưa khớp ${company} 10`);
  if (/\b(lot|proxy|replica|reprint|digital|empty|case only)\b/i.test(title)) reasons.push('Có dấu hiệu sản phẩm khác');
  const first = /1st|first/i.test(card.edition || '');
  if (first !== /1st\s*(ed|edition)?|first edition/i.test(title)) reasons.push('Chưa khớp edition');
  const reverse = /reverse/i.test(card.foil || card.name || '');
  if (reverse !== /reverse/i.test(title)) reasons.push('Chưa khớp Reverse Holo');
  if (/non.?holo/i.test(card.foil || '') && /\bholo(?:graphic)?\b/i.test(title) && !/non.?holo/i.test(title)) reasons.push('Khác foil');
  if (card.language === 'en' && /japanese|japan|\bjpn?\b|korean|chinese|german|french/i.test(title)) reasons.push('Khác ngôn ngữ');
  if (card.language === 'ja' && !/japanese|japan|\bjpn?\b/i.test(title)) reasons.push('Chưa khớp tiếng Nhật');
  // A set name omitted from a seller title remains ambiguous.
  const setWords = (card.set || '').toLowerCase().replace(/pok[eé]mon/g, '').match(/[a-z0-9]+/g) || [];
  if (!setWords.length || !setWords.every(w => t.includes(w))) reasons.push('Cần đối chiếu bộ thẻ');
  return { status: reasons.length ? 'REVIEW_REQUIRED' : 'TITLE_MATCH', reasons, note: 'Cần đối chiếu ảnh, nhãn slab và chứng thư trước khi mua.' };
}

function normalizeListing(item, card, fetchedAt) {
  const url = safeUrl(item.itemWebUrl);
  const amount = Number(item.price?.value);
  if (!url || !item.itemId || !item.price?.currency || !Number.isFinite(amount) || amount < 0) return null;
  const shipping = item.shippingOptions?.[0]?.shippingCost;
  return {
    itemId: item.itemId, title: item.title || '', url,
    image: safeUrl(item.image?.imageUrl, true),
    images: [item.image, ...(item.additionalImages || [])].map(i => safeUrl(i?.imageUrl, true)).filter(Boolean),
    price: { value: amount, currency: item.price.currency },
    shipping: shipping && Number.isFinite(Number(shipping.value)) ? { value: Number(shipping.value), currency: shipping.currency } : null,
    seller: { username: item.seller?.username || 'Không rõ', feedbackPercentage: item.seller?.feedbackPercentage ?? null, feedbackScore: item.seller?.feedbackScore ?? null },
    condition: item.condition || null, location: item.itemLocation?.country || null,
    buyingOptions: item.buyingOptions || [], fetchedAt, match: assessMatch(card, item.title || '')
  };
}

function createMarket({ env = process.env, fetchImpl = fetch, now = Date.now } = {}) {
  let token, expires = 0, tokenPending;
  const cache = new Map(), pending = new Map();
  const configured = () => Boolean(env.EBAY_CLIENT_ID && env.EBAY_CLIENT_SECRET);
  async function accessToken() {
    if (token && now() < expires) return token;
    if (tokenPending) return tokenPending;
    tokenPending = (async () => {
      const response = await fetchImpl(`${API}/identity/v1/oauth2/token`, {
        method: 'POST', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Basic ${Buffer.from(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'https://api.ebay.com/oauth/api_scope' }).toString()
      });
      if (!response.ok) throw Object.assign(new Error('eBay chưa cấp quyền truy cập. Kiểm tra khóa Production và quyền Browse API.'), { status: 502 });
      const data = await response.json();
      if (!data.access_token) throw Object.assign(new Error('eBay không trả về access token.'), { status: 502 });
      token = data.access_token; expires = now() + Math.max(0, Number(data.expires_in || 0) - 60) * 1000;
      return token;
    })();
    try { return await tokenPending; } finally { tokenPending = null; }
  }
  async function search(card) {
    if (!configured()) throw Object.assign(new Error('Chưa kết nối eBay. Cần cấu hình khóa eBay Production trên máy chủ để lấy ảnh và giá tin rao thật.'), { status: 503, code: 'EBAY_NOT_CONFIGURED' });
    if (cache.has(card.id) && now() - cache.get(card.id).cachedAt < TTL) return { ...cache.get(card.id).data, cached: true };
    if (pending.has(card.id)) return pending.get(card.id);
    const task = (async () => {
      const query = [card.name, card.set, card.edition, card.language === 'ja' ? 'Japanese' : '', card.grading_company === 'CGC' ? 'CGC 10' : 'PSA 10'].filter(Boolean).join(' ').slice(0, 100);
      const url = new URL(`${API}/buy/browse/v1/item_summary/search`);
      url.search = new URLSearchParams({ q: query, filter: 'buyingOptions:{FIXED_PRICE}', limit: '50' });
      let response;
      for (let attempt = 0; attempt < 2; attempt++) {
        response = await fetchImpl(url.href, { signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${await accessToken()}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' } });
        if (response.status !== 401 || attempt) break;
        token = null;
      }
      if (!response.ok) throw Object.assign(new Error(response.status === 429 ? 'eBay đang giới hạn lượt truy vấn. Vui lòng thử lại sau.' : 'Chưa lấy được tin rao từ eBay. Vui lòng thử lại.'), { status: response.status === 429 ? 429 : 502 });
      const raw = await response.json();
      const fetchedAt = new Date(now()).toISOString();
      const listings = (raw.itemSummaries || []).map(i => normalizeListing(i, card, fetchedAt)).filter(Boolean);
      const data = { cardId: card.id, source: 'eBay Browse API', marketplace: 'EBAY_US', query, fetchedAt, cached: false, returnedCount: listings.length, listings };
      cache.set(card.id, { cachedAt: now(), data });
      return data;
    })();
    pending.set(card.id, task);
    try { return await task; } finally { pending.delete(card.id); }
  }
  return { configured, search };
}
module.exports = { createMarket, normalizeListing, assessMatch };
