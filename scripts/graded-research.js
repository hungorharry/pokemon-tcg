const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const DATA_PATH = path.join(__dirname, 'snorlax-munchlax-investment-research/data/graded-research.json');
const SOURCE_ORIGIN = 'https://scrydex.com';

const clean = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/pok[eé]mon|nintendo|\bex\b/g, '').replace(/[^a-z0-9]/g, '');
function parsePublicCard(html) {
  const match = html.match(/data-terminal-trigger-json-value="([^"]+)"/);
  if (!match) throw new Error('Nguồn chưa trả về dữ liệu thẻ công khai.');
  const json = match[1].replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const card = JSON.parse(json).data;
  if (!card?.id || !Array.isArray(card.variants)) throw new Error('Dữ liệu nguồn không đúng cấu trúc.');
  return card;
}

// Exact set + printed number + language + normalized subject. Never merge artwork variants.
function identityMatches(local, remote) {
  if (local.scope === 'OUT_OF_SCOPE' || local.is_standard_tcg === false) return false;
  if (String(local.card_number).split('/')[0].replace(/^0+/, '') !== String(remote.number).split('/')[0].replace(/^0+/, '')) return false;
  const lang = { en: 'en', ja: 'ja', jp: 'ja' };
  if (!lang[local.language] || lang[local.language] !== lang[String(remote.language_code).toLowerCase()]) return false;
  const localName = local.name.replace(/\[[^\]]+\]/g, '').replace(/#.*$/, '');
  const subjects = { 'カビゴン': 'Snorlax', 'ゴンベ': 'Munchlax', 'ホップのカビゴン': "Hop's Snorlax", 'ロケット団のカビゴン': "Rocket's Snorlax", 'カビゴン LV.X': 'Snorlax LV.X', 'カビゴンGX': 'Snorlax GX', 'カビゴンVMAX': 'Snorlax VMAX', 'カビゴンV': 'Snorlax V', 'イーブイ&カビゴンGX': 'Eevee & Snorlax GX', 'ラルースのゴンベ': "LaRousse's Munchlax", 'ロータのゴンベ': "Rota's Munchlax" };
  if (clean(localName) !== clean(subjects[remote.name] || remote.name)) return false;
  const aliases = { scarletviolet151: '151', swordshield: 'swordshield',
    fireredleafgreen: 'fireredleafgreen', legendarycollection: 'legendarycollection' };
  let set = clean(local.set), target = clean(remote.expansion?.name);
  set = set.replace(/^japanese/, '');
  const japaneseSets = { sv2a_ja: 'scarletviolet151', sv4a_ja: 'shinytreasure', swsh10a_ja: 'darkphantasma', sm10_ja: 'doubleblaze', sm12a_ja: 'tagallstars', sm10a_ja: 'ggend', pt2_ja: 'bondstotheendoftime', vnd1_ja: 'vending', m2a_ja: 'megadream', base2_ja: 'jungle', sm9_ja: 'tagbolt', swsh1h_ja: 'shield' };
  if (local.language === 'ja' && japaneseSets[remote.expansion?.id] === set) return true;
  if (local.language === 'ja' && set === 'promo' && ['dpp_ja','smp_ja','pcgp_ja'].includes(remote.expansion?.id)) return true;
  if (set === 'promo' && /Black Star Promos$/.test(remote.expansion?.name || '')) return true;
  if (set === 'lostorigin' && target === 'lostorigintrainergallery' && /^TG/.test(String(local.card_number))) return true;
  return set === target || aliases[set] === target || set === clean((remote.expansion?.series || '') + (remote.expansion?.name || ''));
}

function chooseVariant(local, remote) {
  const name = local.name.toLowerCase(), stamp = String(local.stamp || '').toLowerCase();
  const variants = remote.variants;
  let desired;
  if (/no symbol/.test(name) || /no-symbol/.test(stamp)) desired = 'noSymbol';
  else if (/master ball/i.test(name + local.foil)) desired = 'masterBall';
  else if (/pokemon center/i.test(name + stamp)) desired = 'pokemonCenter';
  else if (/1st/i.test(local.edition || '')) desired = '1stEdition';
  else if (/cosmos/i.test(name)) desired = 'cosmosHolofoil';
  else if (/staff.*pre-release/i.test(name)) desired = 'expansionStaffStamp';
  else if (/prerelease/i.test(name)) desired = 'expansionStamp';
  else if (/eb games/i.test(name)) desired = 'ebGamesStamp';
  else if (/gamestop/i.test(name)) desired = 'gamestopStamp';
  else if (/snowflake/i.test(name)) desired = 'snowflakeStamp';
  else if (remote.expansion?.id === 'vnd1_ja' && /series 1/i.test(name)) desired = 'normal';
  else if (/reverse/i.test(name + local.foil)) desired = 'reverseHolofoil';
  else if (/error|staff|series|cosmos|crosshatch|league/i.test(name) || (stamp !== 'none' && stamp !== '')) return null;
  else desired = /holo/i.test(local.foil || '') && !/non/i.test(local.foil || '') ? 'holofoil' : 'normal';
  // Source uses combinations such as 1stEditionHolofoil, unlimitedHolofoil.
  const names = variants.map(v => v.name);
  const exact = variants.find(v => v.name === desired);
  if (exact) return exact;
  const aliases = {
    normal: ['unlimited', 'unlimitedNormal', 'unlimitedNonHolofoil'],
    holofoil: ['unlimitedHolofoil'],
    '1stEdition': ['firstEdition', 'firstEditionHolofoil', '1stEditionHolofoil', '1stEditionNormal', '1stEditionNonHolofoil'],
    noSymbol: ['noSymbolHolofoil', 'noSymbolError'], masterBall: ['masterBallHolofoil', 'masterBallReverseHolofoil'], pokemonCenter: ['pokemonCenterHolofoil', 'pokemonCenterStamp']
  };
  const candidates = variants.filter(v => (aliases[desired] || []).includes(v.name));
  if (candidates.length === 1) return candidates[0];
  // Legacy catalog marks some holo-only numbers Non-Holo. Keep the conflict explicit.
  if (desired === 'normal' && variants.length === 1 && names[0] === 'holofoil') return variants[0];
  if (desired === 'normal' && names.includes('unlimitedHolofoil') && !names.includes('normal') && !names.includes('unlimited')) return variants.find(v => v.name === 'unlimitedHolofoil');
  if (desired === 'normal' && !names.includes('normal') && !names.includes('unlimited') && names.includes('holofoil')) return variants.find(v => v.name === 'holofoil');
  return null;
}

function normalizeResearch(local, remote, variant, url, fetchedAt = new Date().toISOString()) {
  const report = (variant.pop_reports || []).find(p => p.company === 'PSA');
  let population = null;
  if (report) {
    const total = report.total;
    if (!Number.isSafeInteger(total) || total < 0) throw new Error('Population tổng không hợp lệ.');
    const grades = (report.grades || []).map(g => {
      if (!Number.isSafeInteger(g.count) || g.count < 0 || !/^(?:(?:10|[1-9](?:\.5)?)(?:Q)?|auth)$/.test(String(g.grade))) throw new Error('Population theo điểm không hợp lệ.');
      return { grade: String(g.grade), count: g.count, percent: total ? g.count / total * 100 : null };
    }).sort((a, b) => (parseFloat(b.grade) || -1) - (parseFloat(a.grade) || -1) || a.grade.localeCompare(b.grade));
    if (new Set(grades.map(g => g.grade)).size !== grades.length) throw new Error('Trùng grade trong population.');
    const sum = grades.reduce((n,g) => n + g.count, 0);
    if (sum > total) throw new Error('Tổng các điểm lớn hơn population.');
    const count10 = grades.find(g => g.grade === '10')?.count ?? 0;
    const high = grades.filter(g => !g.grade.endsWith('Q') && Number(g.grade) >= 9).reduce((n,g) => n + g.count, 0);
    population = { total, grades, unclassified: total - sum, psa10: count10, gemRate: total ? count10 / total * 100 : null, highGradeCount: high, highGradeRate: total ? high / total * 100 : null, specId: /^\d+$/.test(String(report.external_id)) ? String(report.external_id) : null };
  }
  const prices = (variant.prices || []).filter(p => p.company === 'PSA' && p.type === 'graded' && !p.is_signed && !p.is_error && !p.is_perfect && Number.isFinite(p.market) && p.market > 0 && /^[A-Z]{3}$/.test(p.currency || '') && Number(p.grade) >= 1 && Number(p.grade) <= 10).map(p => ({ grade: String(p.grade), market: p.market, currency: p.currency, source: 'Scrydex', kind: 'THIRD_PARTY_MARKET_ESTIMATE' })).sort((a,b) => Number(b.grade) - Number(a.grade));
  const img = [...(variant.images || []), ...(remote.images || [])].find(i => i.type === 'front');
  let image = null;
  try { const parsedImage = new URL(img?.large); if (parsedImage.protocol === 'https:' && parsedImage.hostname === 'images.scrydex.com') image = parsedImage.href; } catch {}
  return { cardId: local.id, cardKey: local.card_key, status: population || prices.length ? 'AVAILABLE' : 'NO_DATA', source: 'Scrydex public card page', sourceUrl: url, fetchedAt, sourceUpdatedAt: null, remoteId: remote.id, variant: variant.name, sourceIdentity: { name: remote.name, set: remote.expansion?.name, number: remote.printed_number || remote.number, language: remote.language_code }, population, prices, image, imageCaption: 'Ảnh artwork tham khảo từ Scrydex; không phải ảnh slab hay chứng thư.', identityNotes: /holofoil/i.test(variant.name) && /non-holo/i.test(local.foil || '') ? ['Hồ sơ cũ ghi Non-Holo, nguồn phân loại Holofoil. Cần đối chiếu finish.'] : [], evidenceHash: crypto.createHash('sha256').update(JSON.stringify({ remoteId: remote.id, variant })).digest('hex') };
}

async function fetchPublicCard(url) {
  const parsed = new URL(url);
  if (parsed.origin !== SOURCE_ORIGIN || !parsed.pathname.startsWith('/pokemon/cards/')) throw new Error('Nguồn không hợp lệ.');
  const response = await fetch(parsed.href, { redirect: 'error', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'CollectorResearch/1.0 (personal research; public pages)' } });
  if (!response.ok) throw new Error(`Nguồn trả HTTP ${response.status}.`);
  const html = await response.text();
  if (html.length > 4000000) throw new Error('Trang nguồn quá lớn.');
  return parsePublicCard(html);
}
function loadResearch() { try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); } catch { return { records: {}, errors: [] }; } }
function createResearchService() {
  const pending = new Map();
  async function get(card, refresh = false) {
    const dataset = loadResearch(), saved = dataset.records[card.id];
    if (!saved || !refresh) return saved || { cardId: card.id, status: 'UNMAPPED', population: null, prices: [], sourceUrl: null, message: 'Chưa tìm được nguồn công khai khớp đủ bộ thẻ, số, ngôn ngữ và phiên bản. Không dùng số liệu ước đoán.' };
    if (Date.now() - new Date(saved.fetchedAt).getTime() < 3600000) return { ...saved, cached: true };
    if (pending.has(card.id)) return pending.get(card.id);
    const task = (async () => {
      try {
        const remote = await fetchPublicCard(saved.sourceUrl);
        if (!identityMatches(card, remote)) throw new Error('Danh tính trang nguồn thay đổi.');
        const variant = remote.variants.find(v => v.name === saved.variant);
        if (!variant) throw new Error('Nguồn thiếu đúng phiên bản.');
        const fresh = normalizeResearch(card, remote, variant, saved.sourceUrl);
        const latest = loadResearch(); latest.records[card.id] = fresh;
        const temp = DATA_PATH + '.tmp'; fs.writeFileSync(temp, JSON.stringify(latest, null, 2)); fs.renameSync(temp, DATA_PATH);
        return fresh;
      } catch (error) { return { ...saved, stale: true, refreshError: error.message }; }
    })();
    pending.set(card.id, task); try { return await task; } finally { pending.delete(card.id); }
  }
  return { get };
}
module.exports = { parsePublicCard, identityMatches, chooseVariant, normalizeResearch, fetchPublicCard, loadResearch, createResearchService, DATA_PATH };
