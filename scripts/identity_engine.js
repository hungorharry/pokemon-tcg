/**
 * IDENTITY ENGINE v2.0
 * Conforms to IMAGE_SCRAPING_RULES_v2.md
 */

// Known OUT_OF_SCOPE keywords
const OUT_OF_SCOPE_RULES = [
  { match: /Jumbo/i, type: 'JUMBO', reason: 'Thẻ Jumbo kích thước lớn, tách khỏi TCG standard' },
  { match: /Doll/i, type: 'TRAINER_ITEM', reason: 'Thẻ Trainer/Item Snorlax Doll, không phải Pokemon card' },
  { match: /Old Maid/i, type: 'NON_TCG_GAME', reason: 'Bài Old Maid không thuộc TCG tiêu chuẩn' },
  { match: /Mini Tin/i, type: 'SEALED_PRODUCT', reason: 'Hộp thiếc / sản phẩm đóng gói' },
  { match: /LEGO/i, type: 'MERCHANDISE', reason: 'Sản phẩm mô hình LEGO' },
  { match: /Funko/i, type: 'MERCHANDISE', reason: 'Mô hình đồ chơi Funko POP' },
];

/**
 * Classify product into standard TCG or OUT_OF_SCOPE
 */
function classifyItem(exactTitle, setName) {
  const combined = `${exactTitle} ${setName}`;
  for (const rule of OUT_OF_SCOPE_RULES) {
    if (rule.match.test(combined)) {
      return {
        is_standard_tcg: false,
        item_type: rule.type,
        scope: 'OUT_OF_SCOPE',
        reason: rule.reason
      };
    }
  }
  return {
    is_standard_tcg: true,
    item_type: 'POKEMON_TCG_CARD',
    scope: 'IN_SCOPE',
    reason: 'Thẻ bài Pokemon TCG kích thước tiêu chuẩn'
  };
}

/**
 * Extract Subjects
 */
function extractSubjects(exactTitle) {
  const titleLower = exactTitle.toLowerCase();
  const subjects = [];
  if (titleLower.includes('snorlax')) subjects.push('Snorlax');
  if (titleLower.includes('munchlax')) subjects.push('Munchlax');
  if (titleLower.includes('eevee')) subjects.push('Eevee');
  return subjects;
}

/**
 * Normalize Edition, Foil, and Variant from Title and Set
 */
function extractVariantDetails(exactTitle, setName) {
  const title = exactTitle;
  
  let edition = 'Unlimited';
  if (/1st\s+Edition/i.test(title)) edition = '1st Edition';
  else if (/Shadowless/i.test(title)) edition = 'Shadowless';

  let foil = 'Non-Holo';
  if (/Reverse\s+Holo/i.test(title)) foil = 'Reverse Holo';
  else if (/Cosmos\s+Holo/i.test(title)) foil = 'Cosmos Holo';
  else if (/Master\s+Ball/i.test(title)) foil = 'Master Ball Holo';
  else if (/Holo/i.test(title) || /Holo/i.test(setName)) foil = 'Holo';

  let stamp = 'none';
  if (/No\s+Symbol/i.test(title)) stamp = 'No Symbol Error';
  else if (/Highlighter\s+Error/i.test(title)) stamp = 'Highlighter Error';
  else if (/Staff/i.test(title)) stamp = 'Staff';
  else if (/Prerelease/i.test(title)) stamp = 'Prerelease';
  else if (/Pokemon\s+Center/i.test(title)) stamp = 'Pokemon Center';
  else if (/EB\s+Games/i.test(title)) stamp = 'EB Games';
  else if (/Gamestop/i.test(title)) stamp = 'Gamestop';
  else if (/Stamped/i.test(title)) stamp = 'Stamped Promo';

  let language = 'en';
  if (/Japanese/i.test(setName) || /Japanese/i.test(title)) language = 'ja';
  else if (/Chinese/i.test(setName) || /Chinese/i.test(title)) language = 'zh';

  let format = 'standard';
  if (/Jumbo/i.test(title)) format = 'jumbo';

  return { edition, foil, stamp, language, format };
}

/**
 * Extract printed number token
 */
function extractPrintedNumber(exactTitle, numberToken) {
  if (numberToken && numberToken.trim()) return numberToken.trim();
  const match = exactTitle.match(/#([A-Za-z0-9\/-]+)/);
  if (match) return match[1].trim();
  return 'UNNUMBERED';
}

/**
 * Create immutable Identity Key
 * Format: species|set_name_slug|printed_number|language|edition|foil|stamp|format
 */
function createCardKey(params) {
  const species = params.subjects.sort().join('+');
  const setSlug = (params.set_name || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const numSlug = (params.printed_number || 'none').toLowerCase().replace(/[^a-z0-9\/-]+/g, '-');
  const lang = params.language || 'en';
  const ed = (params.edition || 'unlimited').toLowerCase().replace(/\s+/g, '-');
  const foil = (params.foil || 'normal').toLowerCase().replace(/\s+/g, '-');
  const stamp = (params.stamp || 'none').toLowerCase().replace(/\s+/g, '-');
  const format = params.format || 'standard';

  return `${species}|${setSlug}|${numSlug}|${lang}|${ed}|${foil}|${stamp}|${format}`;
}

/**
 * Build Full Identity Record from CSV/Listing candidate
 */
function buildCardIdentity(candidate) {
  const exactTitle = candidate.listed_exact_title || candidate.title || candidate.name || '';
  const setName = candidate.listed_set || candidate.set || '';
  const numToken = candidate.listed_number_token || candidate.card_number || '';
  
  const classification = classifyItem(exactTitle, setName);
  const subjects = extractSubjects(exactTitle);
  const variants = extractVariantDetails(exactTitle, setName);
  const printedNumber = extractPrintedNumber(exactTitle, numToken);

  const cardKey = createCardKey({
    subjects,
    set_name: setName,
    printed_number: printedNumber,
    ...variants
  });

  return {
    card_key: cardKey,
    subjects: subjects,
    exact_title: exactTitle,
    set_name: setName,
    printed_number: printedNumber,
    language: variants.language,
    edition: variants.edition,
    foil: variants.foil,
    stamp: variants.stamp,
    format: variants.format,
    is_standard_tcg: classification.is_standard_tcg,
    item_type: classification.item_type,
    scope: classification.scope,
    scope_reason: classification.reason,
    pricecharting_product_id: candidate.pricecharting_product_id || candidate.productId || null,
    source_product_url: candidate.source_product_url || candidate.link || null
  };
}

module.exports = {
  classifyItem,
  extractSubjects,
  extractVariantDetails,
  extractPrintedNumber,
  createCardKey,
  buildCardIdentity
};
