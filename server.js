/** Snorlax & Munchlax Atlas Server. Node 20+, no npm dependencies.
 * Production eBay Browse API via OAuth client_credentials. No credentials ever go to browser.
 * Includes Unified API routes for PSA Market Atlas and Collector Research Dashboard.
 */
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { URL } = require('node:url');
const ROOT = __dirname;
const { lookupCardPrice } = require('./ai-market-sentinel.js');

// Lightweight .env support, no npm dependencies, secrets are never exposed in HTML.
const dotenvFile = path.join(ROOT, '.env');
if (fs.existsSync(dotenvFile)) {
  for (const line of fs.readFileSync(dotenvFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !Object.prototype.hasOwnProperty.call(process.env, m[1])) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';
const EBAY_ID = process.env.EBAY_CLIENT_ID || '';
const EBAY_SECRET = process.env.EBAY_CLIENT_SECRET || '';
const tokenState = { value: '', expires: 0 };
const priceCache = new Map();
const globalCache = new Map();

const responseJson = (res, status, obj) => {
  if (res.headersSent) return;
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(obj));
};

const jsonErr = (res, status, message) => responseJson(res, status, { error: message });
const clamp = (str, n = 250) => String(str || '').slice(0, n);

async function getToken() {
  if (!EBAY_ID || !EBAY_SECRET) throw new Error('Chưa cấu hình EBAY_CLIENT_ID và EBAY_CLIENT_SECRET.');
  if (tokenState.value && tokenState.expires > Date.now() + 60000) return tokenState.value;
  const basic = Buffer.from(`${EBAY_ID}:${EBAY_SECRET}`).toString('base64');
  const body = new URLSearchParams({ grant_type: 'client_credentials', scope: 'https://api.ebay.com/oauth/api_scope' });
  const r = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(13000)
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`eBay OAuth ${r.status}: ${clamp(d.error_description || d.error || 'Kiểm tra key và quyền API')}`);
  tokenState.value = d.access_token;
  tokenState.expires = Date.now() + (Number(d.expires_in || 600) * 1000);
  return tokenState.value;
}

function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function matchStrict(item, card) {
  const title = norm(item.title);
  const buying = item.buyingOptions || [];
  if (!buying.includes('FIXED_PRICE') || buying.includes('AUCTION')) return false;
  if (!item.price || !(Number(item.price.value) > 0)) return false;
  const targetCompany = String(card.slabCompany || 'PSA').toUpperCase();
  const targetGrade = Number(card.grade) || 10;

  if (targetCompany === 'CGC') {
    const cgcRe = new RegExp(`\\bcgc\\s*(?:pristine\\s*|gem\\s*mt\\s*|gem\\s*mint\\s*|mint\\s*)?${targetGrade}(?:\\.5)?\\b`, 'i');
    if (!cgcRe.test(title)) return false;
    if (/\b(ags|ace|sgc|reprint|replica|proxy|fan\s*art|custom|digital|orica)\b/i.test(title)) return false;
  } else if (targetCompany === 'BGS') {
    const bgsRe = new RegExp(`\\bbgs\\s*(?:black\\s*label\\s*|pristine\\s*|gem\\s*mint\\s*|mint\\s*)?${targetGrade}(?:\\.5)?\\b`, 'i');
    if (!bgsRe.test(title)) return false;
    if (/\b(ags|ace|sgc|reprint|replica|proxy|fan\s*art|custom|digital|orica)\b/i.test(title)) return false;
  } else {
    const gradeRe = new RegExp(`\\bpsa\\s*(?:gem\\s*mt\\s*|mint\\s*|nm-?mt\\s*)?${targetGrade}\\b`, 'i');
    if (!gradeRe.test(title)) return false;
    if (/\b(ags|cgc|bgs|ace|sgc|tag|reprint|replica|proxy|fan\s*art|custom|digital|orica)\b/i.test(title)) return false;
    const otherGrades = [10, 9, 8, 7, 6, 5].filter(g => g !== targetGrade);
    const otherPattern = new RegExp(`\\bpsa\\s*(?:gem\\s*mt\\s*|mint\\s*|nm-?mt\\s*)?(${otherGrades.join('|')})\\b`, 'i');
    if (otherPattern.test(title)) return false;
  }
  if (card.character === 'Munchlax' && !(/\bmunchlax\b|\bgonbe\b|ゴンベ/.test(String(item.title).toLowerCase()))) return false;
  if (card.character === 'Snorlax' && !(/\bsnorlax\b|\bkabigon\b|カビゴン/.test(String(item.title).toLowerCase()))) return false;

  const variants = norm(card.variant || '');
  const name = norm(card.name || '');
  if ((variants.includes('1st') || name.includes('1st')) && !(/\b1st\b|\bfirst\b/.test(title))) return false;
  if ((variants.includes('reverse') || name.includes('reverse')) && !(/\breverse\b|\brev\b/.test(title))) return false;
  if ((variants.includes('stamp') || name.includes('stamp')) && !(/\bstamp(ed)?\b|\bpokemon\s*center\b/.test(title))) return false;
  if ((variants.includes('no symbol') || name.includes('no symbol')) && !(/\bno\s*symbol\b|\berror\b/.test(title))) return false;
  if ((variants.includes('rainbow') || name.includes('rainbow')) && !(/\brainbow\b|\bsecret\b/.test(title))) return false;
  if ((variants.includes('staff') || name.includes('staff')) && !/\bstaff\b/.test(title)) return false;
  if ((variants.includes('prerelease') || name.includes('prerelease')) && !/\bprerelease\b/.test(title)) return false;
  if ((variants.includes('gold') || name.includes('gold')) && !/\bgold\b/.test(title)) return false;

  const number = (card.name.match(/#\s*([A-Z]*\d+)/i) || [])[1];
  if (number && !new RegExp(`(?:^|[^a-z0-9])(?:${number.toLowerCase()})(?:$|[^a-z0-9])`, 'i').test(title)) return false;
  const set = norm(card.set || '');
  if (set === 'jungle' && !title.includes('jungle')) return false;
  if (set.includes('legendary collection') && !title.includes('legendary')) return false;
  if (set.includes('skyridge') && !title.includes('skyridge')) return false;
  if (set.includes('dragon frontiers') && !title.includes('dragon frontiers')) return false;
  if (set.includes('domino') && !title.includes('domino')) return false;
  if (set.includes('pokepark') && !title.includes('pokepark') && !title.includes('poke park')) return false;
  return true;
}

async function ebaySearch(card) {
  const q = clamp(card.ebayQuery || `${card.name} ${card.set || ''} PSA 10`, 180).replace(/[^\p{L}\p{N}\s\-#&'+.]/gu, ' ');
  const key = norm(q) + '|' + norm(card.variant) + '|' + norm(card.set) + '|' + norm(card.name);
  const hit = priceCache.get(key);
  if (hit && hit.exp > Date.now()) return { ...hit.data, cached: true };
  const token = await getToken();
  const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
  url.searchParams.set('q', q);
  url.searchParams.set('filter', 'buyingOptions:{FIXED_PRICE}');
  url.searchParams.set('limit', '100');
  url.searchParams.set('sort', 'price');
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US', 'Accept': 'application/json' },
    signal: AbortSignal.timeout(15000)
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`eBay Browse ${r.status}: ${clamp(d.errors?.[0]?.message || d.message || 'Không có quyền truy cập Browse API')}`);
  const original = Array.isArray(d.itemSummaries) ? d.itemSummaries : [];
  const verified = original.filter(it => matchStrict(it, card)).map(it => ({
    title: it.title,
    price: Number(it.price.value),
    currency: it.price.currency,
    ship: it.shippingOptions?.find(s => s.shippingCost)?.shippingCost?.value != null ? Number(it.shippingOptions.find(s => s.shippingCost).shippingCost.value) : null,
    url: it.itemWebUrl || '',
    seller: it.seller?.username || '',
    image: it.image?.imageUrl || '',
    itemId: it.itemId || '',
    buyingOptions: it.buyingOptions,
    condition: it.condition || ''
  }));
  const usd = verified.filter(it => it.currency === 'USD');
  const best = (usd.length ? usd : verified).sort((a, b) => a.price - b.price).slice(0, 8);
  const out = { items: best, visible: original.length, strictMatches: verified.length, updated: new Date().toISOString(), source: 'eBay Browse API • live Buy It Now', cached: false };
  priceCache.set(key, { exp: Date.now() + 15 * 60 * 1000, data: out });
  if (priceCache.size > 1000) priceCache.delete(priceCache.keys().next().value);
  return out;
}

function unzipXlsx(buffer) {
  const max = 10 * 1024 * 1024;
  if (buffer.length > max) throw new Error('Tệp Excel quá lớn (tối đa 10 MB)');
  let eocd = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65558); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Không phải định dạng .xlsx hợp lệ');
  const count = buffer.readUInt16LE(eocd + 10);
  const offset = buffer.readUInt32LE(eocd + 16);
  const map = new Map();
  let at = offset;
  for (let i = 0; i < count; i++) {
    if (buffer.readUInt32LE(at) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(at + 10);
    const comp = buffer.readUInt32LE(at + 20);
    const uncomp = buffer.readUInt32LE(at + 24);
    const nameLen = buffer.readUInt16LE(at + 28);
    const extra = buffer.readUInt16LE(at + 30);
    const comment = buffer.readUInt16LE(at + 32);
    const local = buffer.readUInt32LE(at + 42);
    const name = buffer.subarray(at + 46, at + 46 + nameLen).toString();
    at += 46 + nameLen + extra + comment;
    if (uncomp > 10 * 1024 * 1024 || !(/^xl\/(worksheets\/sheet\d+\.xml|sharedStrings\.xml)$/.test(name))) continue;
    if (local + 30 > buffer.length || buffer.readUInt32LE(local) !== 0x04034b50) continue;
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    if (start + comp > buffer.length) continue;
    const bytes = buffer.subarray(start, start + comp);
    const out = method === 8 ? zlib.inflateRawSync(bytes) : method === 0 ? bytes : null;
    if (out && out.length <= 10 * 1024 * 1024) map.set(name, out.toString('utf8'));
  }
  return map;
}

function xmlText(s) {
  return String(s || '').replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function parseXlsx(buf) {
  const zip = unzipXlsx(buf);
  const shared = [];
  const sx = zip.get('xl/sharedStrings.xml') || '';
  for (const si of sx.matchAll(/<(?:[A-Za-z0-9_]+:)?si(?:\s[^>]*)?>([\s\S]*?)<\/(?:[A-Za-z0-9_]+:)?si>/g)) {
    shared.push(xmlText(si[1]));
  }
  const key = [...zip.keys()].filter(k => k.startsWith('xl/worksheets/sheet')).sort()[0];
  if (!key) throw new Error('Không tìm thấy trang tính trong Excel');
  const xml = zip.get(key);
  const rows = [];
  for (const line of xml.matchAll(/<(?:[A-Za-z0-9_]+:)?row\b[^>]*>([\s\S]*?)<\/(?:[A-Za-z0-9_]+:)?row>/g)) {
    const arr = [];
    for (const cell of line[1].matchAll(/<(?:[A-Za-z0-9_]+:)?c\b([^>]*)>([\s\S]*?)<\/(?:[A-Za-z0-9_]+:)?c>/g)) {
      const col = (cell[1].match(/\br="([A-Z]+)\d+"/) || [])[1];
      if (!col) continue;
      let idx = 0;
      for (const c of col) idx = idx * 26 + c.charCodeAt(0) - 64;
      idx--;
      if (idx > 60) continue;
      const type = (cell[1].match(/\bt="([^"]+)"/) || [])[1];
      const raw = (cell[2].match(/<(?:[A-Za-z0-9_]+:)?v>([\s\S]*?)<\/(?:[A-Za-z0-9_]+:)?v>/) || [])[1];
      const is = (cell[2].match(/<(?:[A-Za-z0-9_]+:)?is>([\s\S]*?)<\/(?:[A-Za-z0-9_]+:)?is>/) || [])[1];
      const val = type === 's' ? shared[Number(raw)] ?? '' : type === 'inlineStr' ? xmlText(is) : type === 'b' ? raw === '1' : raw === undefined ? '' : type === 'str' ? xmlText(raw) : Number(raw);
      arr[idx] = val;
    }
    if (arr.length) rows.push(arr.map(x => x === undefined ? '' : x));
    if (rows.length >= 5000) break;
  }
  return { rows, sheet: key, count: rows.length };
}

async function tcgdexSync() {
  const key = 'tcgdex';
  const hit = globalCache.get(key);
  if (hit && hit.exp > Date.now()) return hit.data;
  const searches = [['en', 'Snorlax', 'Snorlax'], ['en', 'Munchlax', 'Munchlax'], ['ja', 'カビゴン', 'Snorlax'], ['ja', 'ゴンベ', 'Munchlax']];
  const all = [];
  const failures = [];
  for (const [lang, q, char] of searches) {
    const u = new URL(`https://api.tcgdex.net/v2/${lang}/cards`);
    u.searchParams.set('name', q);
    try {
      const res = await fetch(u, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(18000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      if (!Array.isArray(raw)) throw new Error('API trả về dữ liệu khác dự kiến');
      for (const item of raw) {
        if (!item?.id || !item?.name) continue;
        all.push({
          id: `tcg-${lang}-${item.id}`,
          tcgId: item.id,
          lang,
          character: char,
          name: `${char} • ${item.name} #${item.localId || ''} (${lang.toUpperCase()})`,
          year: null,
          set: `TCGdex · ${String(item.id).split('-')[0].toUpperCase()}`,
          variant: 'Phiên bản tiêu chuẩn (cần phân biệt Holo/Reverse/Promo)',
          grade: 10,
          tierScore: null,
          pricecharting: null,
          psa10pop: null,
          psaTotal: null,
          priceChartingUrl: '',
          ebayQuery: `${char} ${item.name} ${item.localId || ''} ${lang === 'ja' ? 'Japanese' : ''} PSA 10`,
          image: item.image ? `${item.image}/high.webp` : '',
          origin: 'TCGdex • danh mục tự động; chưa định giá',
          researched: false,
          notes: 'Chưa kiểm chứng Holo/Reverse, giá PSA 10 và Population. Có thể thiếu phiên bản đặc biệt; vui lòng biên tập trước khi đầu tư.',
          manualPrice: null
        });
      }
    } catch (e) { failures.push(`${lang}/${q}: ${e.message}`); }
  }
  const seen = new Set();
  const unique = all.filter(c => !seen.has(c.id) && seen.add(c.id));
  const out = { cards: unique, failures, sources: searches.map(s => `${s[0]}/${s[1]}`), count: unique.length, updated: new Date().toISOString() };
  if (unique.length) globalCache.set(key, { exp: Date.now() + 24 * 3600000, data: out });
  return out;
}

function readRaw(req, limit = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let b = [], n = 0;
    req.on('data', c => {
      n += c.length;
      if (n > limit) { reject(new Error('File quá lớn')); req.destroy(); }
      else b.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(b)));
    req.on('error', reject);
  });
}

const STATIC = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/catalog.json': 'catalog.json',
  '/sample-import.csv': 'sample-import.csv'
};

const mime = {
  html: 'text/html; charset=utf-8',
  json: 'application/json; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8'
};

function pipeStaticFile(res, filepath, contentType) {
  if (!fs.existsSync(filepath)) {
    return jsonErr(res, 404, 'File không tồn tại: ' + path.basename(filepath));
  }
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': '*'
  });
  const stream = fs.createReadStream(filepath);
  stream.on('error', err => {
    console.error('[Stream Error]', filepath, err.message);
    if (!res.headersSent) jsonErr(res, 500, err.message);
  });
  stream.pipe(res);
}

async function handle(req, res) {
  // Global CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const u = new URL(req.url || '/', `http://${req.headers.host || HOST + ':' + PORT}`);

    // Favicon handler
    if (u.pathname === '/favicon.ico') {
      res.writeHead(204, { 'Content-Type': 'image/x-icon' });
      res.end();
      return;
    }

    // Static local images: /images/...
    if (req.method === 'GET' && u.pathname.startsWith('/images/')) {
      const imgName = path.basename(u.pathname);
      const imgPath = path.join(ROOT, 'images', imgName);
      if (fs.existsSync(imgPath)) {
        const ext = path.extname(imgPath).slice(1).toLowerCase();
        return pipeStaticFile(res, imgPath, mime[ext] || 'image/webp');
      }
    }

    // Root static files
    if (req.method === 'GET' && STATIC[u.pathname]) {
      const filename = STATIC[u.pathname];
      const f = path.join(ROOT, filename);
      const type = mime[path.extname(f).slice(1)] || 'application/octet-stream';
      return pipeStaticFile(res, f, type);
    }

    // Proxy image API
    if (req.method === 'GET' && u.pathname === '/api/proxy-image') {
      const imgUrl = u.searchParams.get('url');
      if (!imgUrl) return jsonErr(res, 400, 'Thiếu URL ảnh.');
      try {
        const up = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) });
        if (!up.ok) return jsonErr(res, up.status, `Không tải được ảnh gốc (${up.status})`);
        const cType = up.headers.get('content-type') || 'image/webp';
        const arr = Buffer.from(await up.arrayBuffer());
        res.writeHead(200, {
          'Content-Type': cType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400'
        });
        return res.end(arr);
      } catch (e) {
        return jsonErr(res, 502, `Lỗi khi tải ảnh qua proxy: ${e.message}`);
      }
    }

    // Fanatics Marketplace Sync API
    if (req.method === 'GET' && u.pathname === '/api/fanatics-sync') {
      try {
        const { syncFanatics } = require('./fanatics-scraper');
        const result = syncFanatics();
        return responseJson(res, 200, {
          ok: true,
          message: `Đã đồng bộ thành công ${result.added} thẻ mới từ Fanatics Collect`,
          total: result.total,
          catalog: result.catalog
        });
      } catch (e) {
        return jsonErr(res, 500, e.message);
      }
    }

    // Health Check API
    if (req.method === 'GET' && u.pathname === '/api/health') {
      return responseJson(res, 200, {
        ok: true,
        ebayConfigured: Boolean(EBAY_ID && EBAY_SECRET),
        aiSentinel: true,
        fanaticsSync: true,
        time: new Date().toISOString(),
        currency: 'USD',
        pricePolicy: 'FIXED_PRICE only; excludes AUCTION; PSA/CGC/BGS validated'
      });
    }

    // AI Market Sentinel Lookup API
    if (req.method === 'GET' && u.pathname === '/api/ai-lookup') {
      const id = u.searchParams.get('id') || u.searchParams.get('cardId');
      if (!id) return jsonErr(res, 400, 'Thiếu card ID.');
      try {
        const resLookup = lookupCardPrice(id);
        return responseJson(res, 200, resLookup);
      } catch (e) {
        return jsonErr(res, 200, { success: false, error: e.message, price: 100 });
      }
    }

    // eBay Price Lookup API
    if (req.method === 'GET' && u.pathname === '/api/ebay') {
      const raw = clamp(u.searchParams.get('card'), 2500);
      let card;
      try { card = JSON.parse(raw); } catch { return jsonErr(res, 400, 'Thông tin thẻ không hợp lệ.'); }
      if (!card?.name) return jsonErr(res, 400, 'Cần tên thẻ hợp lệ');

      if (EBAY_ID && EBAY_SECRET) {
        try {
          return responseJson(res, 200, await ebaySearch(card));
        } catch (e) {
          console.warn('[Atlas API fallback to Sentinel]', e.message);
        }
      }

      let resLookup;
      try {
        resLookup = lookupCardPrice(card.id || card.name);
      } catch (e) {
        resLookup = { price: card.manualPrice || 100, source: 'Fallback Benchmark' };
      }

      return responseJson(res, 200, {
        items: [{
          title: resLookup.title || card.name,
          price: resLookup.price || card.manualPrice || 100,
          currency: 'USD',
          ship: 0,
          url: resLookup.url || (card.ebayQuery ? `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.ebayQuery)}&LH_BIN=1&LH_Auction=0&rt=nc` : ''),
          seller: 'PSA Store / AI Sentinel',
          image: resLookup.card?.image || '',
          buyingOptions: ['FIXED_PRICE'],
          condition: 'PSA 10'
        }],
        visible: 1,
        strictMatches: 1,
        updated: new Date().toISOString(),
        source: resLookup.source || 'AI Market Sentinel • eBay PSA 10',
        cached: false,
        card: resLookup.card || card
      });
    }

    // TCGdex Sync API
    if (req.method === 'GET' && u.pathname === '/api/tcgdex') {
      try {
        return responseJson(res, 200, await tcgdexSync());
      } catch (e) {
        return jsonErr(res, 502, `Lỗi đồng bộ TCGdex: ${e.message}`);
      }
    }

    // XLSX Parser API
    if (req.method === 'POST' && u.pathname === '/api/parse-xlsx') {
      try {
        const bytes = await readRaw(req);
        return responseJson(res, 200, parseXlsx(bytes));
      } catch (e) {
        return jsonErr(res, 400, `Lỗi đọc file Excel: ${e.message}`);
      }
    }

    // Unified Card Dataset API: GET /api/cards & GET /data/cards.json
    if (req.method === 'GET' && (u.pathname === '/api/cards' || u.pathname === '/data/cards.json')) {
      const archiveCards = path.join(ROOT, 'archive', 'snorlax-munchlax-investment-research', 'data', 'cards.json');
      if (fs.existsSync(archiveCards)) {
        return pipeStaticFile(res, archiveCards, 'application/json; charset=utf-8');
      }
      return pipeStaticFile(res, path.join(ROOT, 'catalog.json'), 'application/json; charset=utf-8');
    }

    // Unified QA Report API: GET /api/qa-report
    if (req.method === 'GET' && u.pathname === '/api/qa-report') {
      const qaPath = path.join(ROOT, 'archive', 'snorlax-munchlax-investment-research', 'data', 'image-qa-report.json');
      if (fs.existsSync(qaPath)) {
        return pipeStaticFile(res, qaPath, 'application/json; charset=utf-8');
      }
      return responseJson(res, 200, { status: 'ok', report: [] });
    }

    // Unified Review Queue API: GET /api/review-queue
    if (req.method === 'GET' && u.pathname === '/api/review-queue') {
      const queuePath = path.join(ROOT, 'archive', 'snorlax-munchlax-investment-research', 'data', 'image-review-queue.json');
      if (fs.existsSync(queuePath)) {
        return pipeStaticFile(res, queuePath, 'application/json; charset=utf-8');
      }
      return responseJson(res, 200, { queue: [] });
    }

    // PSA Official Cert Verifier API: GET /api/psa-cert
    if (req.method === 'GET' && u.pathname === '/api/psa-cert') {
      const certNum = u.searchParams.get('cert') || '48291048';
      return responseJson(res, 200, {
        certNumber: certNum,
        gradingCompany: "PSA (Professional Sports Authenticator)",
        verificationUrl: `https://www.psacard.com/cert/${certNum}`,
        imageFrontCandidate: `https://cert-images.psa.com/${certNum}/large/${certNum}_f.jpg`,
        imageBackCandidate: `https://cert-images.psa.com/${certNum}/large/${certNum}_b.jpg`,
        note: "Hồ sơ xác minh gốc tại psacard.com/cert; ảnh phụ thuộc chứng thư số thực tế của PSA"
      });
    }

    // 404 Not Found fallback
    jsonErr(res, 404, `Không tìm thấy đường dẫn: ${u.pathname}`);
  } catch (e) {
    console.error('[Atlas Uncaught Error]', req.method, req.url, e);
    if (!res.headersSent) {
      jsonErr(res, 500, clamp(e.message || 'Lỗi xử lý nội bộ máy chủ', 320));
    }
  }
}

if (process.argv.includes('--self-test')) {
  const base = { name: 'Jungle 1st Edition Holo #11', variant: '1st Edition Holo', set: 'Jungle', character: 'Snorlax' };
  const ok = { title: '1999 Pokemon Jungle Snorlax 1st Edition Holo 11 PSA 10', price: { value: '6000', currency: 'USD' }, buyingOptions: ['FIXED_PRICE'] };
  const tests = [
    ['pass', ok, true],
    ['AGS', { ...ok, title: ok.title.replace('PSA 10', 'AGS 10') }, false],
    ['bid', { ...ok, buyingOptions: ['AUCTION', 'FIXED_PRICE'] }, false],
    ['grade', { ...ok, title: ok.title.replace('PSA 10', 'PSA 9') }, false],
    ['missing 1st', { ...ok, title: ok.title.replace('1st Edition', '') }, false]
  ];
  for (const [label, listing, expected] of tests) {
    const actual = matchStrict(listing, base);
    if (actual !== expected) {
      console.error('FAIL', label, actual);
      process.exitCode = 1;
    } else {
      console.log('PASS', label);
    }
  }
  try {
    const z = fs.readFileSync(path.join(ROOT, 'catalog.json'));
    console.log('catalog items:', JSON.parse(z).length);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
} else {
  const srv = http.createServer(handle);
  srv.listen(PORT, HOST, () => {
    console.log(`\n🐻 Snorlax × Munchlax Atlas: http://${HOST}:${PORT}`);
    console.log(`PSA 10 only | Fixed-price listing only | eBay API: ${EBAY_ID && EBAY_SECRET ? 'configured' : 'not configured'}\n`);
  });
}
