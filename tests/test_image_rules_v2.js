/**
 * TEST SUITE: IMAGE_SCRAPING_RULES v2.0
 * Verifies all 9 mandatory test cases from CODEX_FIX_PROMPT.md & IMAGE_SCRAPING_RULES_v2.md
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { buildCardIdentity, classifyItem } = require('../scripts/identity_engine');
const { validateImageUrlFormat, evaluateImageCandidate, ALLOWED_HOSTNAMES } = require('../scripts/image_validator');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  âœ… PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  âŒ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
  }
}

console.log('\n======================================================');
console.log('ðŸ§ª RUNNING IMAGE SCRAPING RULES v2 TEST SUITE');
console.log('======================================================\n');

// Case 1: Snorlax Jungle #11 vs [1st Edition] #11 vs [No Symbol] #11
runTest('Case 1: Snorlax Jungle #11 standard vs 1st Edition #11 vs [No Symbol] #11 must have distinct identities', () => {
  const std = buildCardIdentity({ listed_exact_title: 'Snorlax #11', listed_set: 'Pokemon Jungle', listed_number_token: '11' });
  const firstEd = buildCardIdentity({ listed_exact_title: 'Snorlax [1st Edition] #11', listed_set: 'Pokemon Jungle', listed_number_token: '11' });
  const noSymbol = buildCardIdentity({ listed_exact_title: 'Snorlax [No Symbol] #11', listed_set: 'Pokemon Jungle', listed_number_token: '11' });

  assert.notStrictEqual(std.card_key, firstEd.card_key, 'Standard #11 and 1st Edition #11 must have different keys');
  assert.notStrictEqual(std.card_key, noSymbol.card_key, 'Standard #11 and No Symbol #11 must have different keys');
  assert.notStrictEqual(firstEd.card_key, noSymbol.card_key, '1st Edition #11 and No Symbol #11 must have different keys');

  assert.strictEqual(std.edition, 'Unlimited');
  assert.strictEqual(firstEd.edition, '1st Edition');
  assert.strictEqual(noSymbol.stamp, 'No Symbol Error');
});

// Case 2: Munchlax Rising Rivals #69 vs #70 vs [Reverse Holo] #69
runTest('Case 2: Munchlax Rising Rivals #69 vs #70 and [Reverse Holo] #69 must not swap', () => {
  const m69 = buildCardIdentity({ listed_exact_title: 'Munchlax #69', listed_set: 'Pokemon Rising Rivals', listed_number_token: '69' });
  const m70 = buildCardIdentity({ listed_exact_title: 'Munchlax #70', listed_set: 'Pokemon Rising Rivals', listed_number_token: '70' });
  const m69Rev = buildCardIdentity({ listed_exact_title: 'Munchlax [Reverse Holo] #69', listed_set: 'Pokemon Rising Rivals', listed_number_token: '69' });

  assert.notStrictEqual(m69.card_key, m70.card_key, '#69 and #70 must have different card_keys');
  assert.notStrictEqual(m69.card_key, m69Rev.card_key, 'Normal and Reverse Holo must have different card_keys');
  assert.strictEqual(m69Rev.foil, 'Reverse Holo');
  assert.strictEqual(m69.foil, 'Non-Holo');
});

// Case 3: Eevee & Snorlax GX #SM169 must contain Snorlax & Eevee, NEVER Munchlax
runTest('Case 3: Eevee & Snorlax GX #SM169 subjects check', () => {
  const tag = buildCardIdentity({ listed_exact_title: 'Eevee & Snorlax GX #SM169', listed_set: 'Pokemon Promo', listed_number_token: 'SM169' });
  assert(tag.subjects.includes('Snorlax'), 'Must include Snorlax');
  assert(tag.subjects.includes('Eevee'), 'Must include Eevee');
  assert(!tag.subjects.includes('Munchlax'), 'Must NEVER claim Munchlax');
});

// Case 4: Japanese 151 Snorlax #181 vs English 151 Snorlax #143
runTest('Case 4: Japanese 151 #181 must not match English 151 #143', () => {
  const ja181 = buildCardIdentity({ listed_exact_title: 'Snorlax #181', listed_set: 'Pokemon Japanese Scarlet & Violet 151', listed_number_token: '181' });
  const en143 = buildCardIdentity({ listed_exact_title: 'Snorlax #143', listed_set: 'Pokemon Scarlet & Violet 151', listed_number_token: '143' });

  assert.notStrictEqual(ja181.card_key, en143.card_key, 'Japanese and English must have distinct card_keys');
  assert.strictEqual(ja181.language, 'ja');
  assert.strictEqual(en143.language, 'en');
});

// Case 5: LEGO / Funko / Mini Tin / Snorlax Doll / Old Maid / Jumbo marked OUT_OF_SCOPE
runTest('Case 5: Non-standard items must be classified as OUT_OF_SCOPE and rejected', () => {
  const lego = buildCardIdentity({ listed_exact_title: 'Munchlax #72150', listed_set: 'LEGO Pokemon' });
  const funko = buildCardIdentity({ listed_exact_title: 'Munchlax #885', listed_set: 'Funko POP Games' });
  const tin = buildCardIdentity({ listed_exact_title: 'Sinnoh Stars Mini Tin [Munchlax]', listed_set: 'Pokemon Promo' });
  const doll = buildCardIdentity({ listed_exact_title: 'Snorlax Doll #175', listed_set: 'Pokemon Paradox Rift' });
  const oldMaid = buildCardIdentity({ listed_exact_title: 'Snorlax [Super High Tension]', listed_set: 'Pokemon Japanese Old Maid' });
  const jumbo = buildCardIdentity({ listed_exact_title: 'Snorlax VMAX [Jumbo] #142', listed_set: 'Pokemon Sword & Shield' });

  const items = [lego, funko, tin, doll, oldMaid, jumbo];
  for (const item of items) {
    assert.strictEqual(item.is_standard_tcg, false, `${item.exact_title} must not be standard TCG`);
    assert.strictEqual(item.scope, 'OUT_OF_SCOPE', `${item.exact_title} must be OUT_OF_SCOPE`);
    
    // Evaluate image rejection
    const res = evaluateImageCandidate(item, 'https://storage.googleapis.com/images.pricecharting.com/valid/1600.jpg');
    assert.strictEqual(res.status, 'REJECTED', `${item.exact_title} must be REJECTED`);
    assert(res.reason.includes('ERR_OUT_OF_SCOPE'), 'Reason must indicate OUT_OF_SCOPE');
  }
});

// Case 6: 60x60 thumbnail rejected; 1600 candidate without variant proof requires review
runTest('Case 6: Thumbnail 60.jpg is rejected; Special variants require review', () => {
  const std = buildCardIdentity({ listed_exact_title: 'Snorlax #11', listed_set: 'Pokemon Jungle', listed_number_token: '11' });
  const thumbRes = validateImageUrlFormat('https://storage.googleapis.com/images.pricecharting.com/test/60.jpg');
  assert.strictEqual(thumbRes.valid, false);
  assert.strictEqual(thumbRes.reason, 'ERR_THUMBNAIL_TOO_SMALL');

  const firstEd = buildCardIdentity({ listed_exact_title: 'Snorlax [1st Edition] #11', listed_set: 'Pokemon Jungle', listed_number_token: '11' });
  const evalFirstEd = evaluateImageCandidate(firstEd, 'https://storage.googleapis.com/images.pricecharting.com/test/1600.jpg');
  assert.strictEqual(evalFirstEd.status, 'REVIEW_REQUIRED', '1st Edition must require specialized review');
  assert(evalFirstEd.reason.includes('ERR_VARIANT_UNVERIFIED'));
});

// Case 7: Fake domains, malformed markdown strings and insecure protocols rejected
runTest('Case 7: Strict hostname allowlist and syntax validation', () => {
  const fakeHost = validateImageUrlFormat('https://fake-phishing-site.com/snorlax/1600.jpg');
  assert.strictEqual(fakeHost.valid, false);
  assert(fakeHost.reason.includes('ERR_HOSTNAME_NOT_ALLOWED'));

  const mdString = validateImageUrlFormat('[https://storage.googleapis.com/images.pricecharting.com/test/1600.jpg](https://storage.googleapis.com)');
  assert.strictEqual(mdString.valid, false);
  assert.strictEqual(mdString.reason, 'ERR_MALFORMED_MARKDOWN_URL');

  const httpInsecure = validateImageUrlFormat('http://storage.googleapis.com/images.pricecharting.com/test/1600.jpg');
  assert.strictEqual(httpInsecure.valid, false);
  assert.strictEqual(httpInsecure.reason, 'ERR_INSECURE_PROTOCOL');
});

// Case 8: Candidate URL Dimensions check (< 600x840 must be rejected)
runTest('Case 8: Actual image pixel test result < 600x840 rejected', () => {
  const std = buildCardIdentity({ listed_exact_title: 'Snorlax #11', listed_set: 'Pokemon Jungle', listed_number_token: '11' });
  const smallPixelRes = evaluateImageCandidate(std, 'https://storage.googleapis.com/images.pricecharting.com/test/1600.jpg', {
    statusCode: 200,
    width: 240,
    height: 330
  });
  assert.strictEqual(smallPixelRes.status, 'REJECTED');
  assert(smallPixelRes.reason.includes('ERR_DIMENSIONS_TOO_SMALL'));
});

// Case 9: Parse accurately 100 Snorlax rows and 33 Munchlax rows from CSV candidates
runTest('Case 9: Correctly parse 100 Snorlax and 33 Munchlax rows from PRICECHARTING_CANDIDATES.csv', () => {
  const candidateCsvPaths = [path.join(__dirname, '..', 'data', 'PRICECHARTING_CANDIDATES.csv'), path.join(__dirname, '..', 'archive', 'snorlax-munchlax-investment-research', 'data', 'PRICECHARTING_CANDIDATES.csv')]; const csvPath = candidateCsvPaths.find(p => fs.existsSync(p)) || candidateCsvPaths[0];
  assert(fs.existsSync(csvPath), 'Candidate CSV must exist');
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n').slice(1);
  const snorlaxRows = lines.filter(l => l.startsWith('Snorlax,'));
  const munchlaxRows = lines.filter(l => l.startsWith('Munchlax,'));

  assert.strictEqual(snorlaxRows.length, 100, 'Must have exactly 100 Snorlax candidates');
  assert.strictEqual(munchlaxRows.length, 33, 'Must have exactly 33 Munchlax candidates');
  assert.strictEqual(lines.length, 133, 'Total candidate rows must be 133');
});

console.log('\n======================================================');
console.log(`ðŸ“Š RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
if (passedTests === totalTests) {
  console.log('ðŸŽ‰ ALL V2 IMAGE SCRAPING RULES VERIFIED & PASSED');
} else {
  console.log('âŒ SOME TESTS FAILED');
  process.exit(1);
}
console.log('======================================================\n');


