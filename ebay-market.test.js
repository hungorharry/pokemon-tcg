const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMarket, normalizeListing, assessMatch } = require('./ebay-market');
const card = { id: 'fixture', name: 'Snorlax #11', pokemon_species: 'Snorlax', card_number: '11', set: 'Pokemon Jungle', edition: 'Unlimited', foil: 'Holo', language: 'en' };
const item = { itemId: 'v1|123|0', title: 'Snorlax Jungle #11 PSA 10 Holo', itemWebUrl: 'https://www.ebay.com/itm/123', image: { imageUrl: 'https://i.ebayimg.com/images/test.jpg' }, price: { value: '123.45', currency: 'USD' }, seller: { username: 'fixture-seller' }, buyingOptions: ['FIXED_PRICE'] };
test('photo, price, currency and seller remain attached to the same listing', () => {
  const listing = normalizeListing(item, card, '2026-10-19T00:00:00Z');
  assert.equal(listing.price.value, 123.45); assert.equal(listing.image, item.image.imageUrl);
  assert.equal(listing.seller.username, 'fixture-seller'); assert.equal(listing.shipping, null);
  assert.equal(listing.match.status, 'TITLE_MATCH');
});
test('reject unsafe links and malformed prices; never synthesize shipping', () => {
  assert.equal(normalizeListing({ ...item, itemWebUrl: 'https://www.ebay.com.evil.test/itm/123' }, card), null);
  assert.equal(normalizeListing({ ...item, price: { value: 'oops', currency: 'USD' } }, card), null);
  assert.equal(normalizeListing({ ...item, image: { imageUrl: 'javascript:alert(1)' } }, card).image, null);
});
test('wrong number, species, grade, edition and reverse foil require review', () => {
  for (const title of ['Munchlax Jungle #11 PSA 10', 'Snorlax Jungle #27 PSA 10', 'Snorlax Jungle #11 PSA 9', 'Snorlax Jungle #11 PSA 10 1st Edition', 'Snorlax Jungle #11 PSA 10 Reverse Holo', 'Japanese Snorlax Jungle #11 PSA 10']) {
    assert.equal(assessMatch(card, title).status, 'REVIEW_REQUIRED', title);
  }
});
test('missing credentials never produces sample or local prices', async () => {
  const market = createMarket({ env: {}, fetchImpl: () => { throw Error('Must not request'); } });
  await assert.rejects(market.search(card), { code: 'EBAY_NOT_CONFIGURED', status: 503 });
});
test('concurrent requests share one search; cache expires after 60 seconds', async () => {
  let clock = 100000, calls = [];
  const market = createMarket({ env: { EBAY_CLIENT_ID: 'fixture', EBAY_CLIENT_SECRET: 'fixture' }, now: () => clock,
    fetchImpl: async (url, options) => {
      calls.push(url);
      if (url.includes('/oauth2/')) return { ok: true, json: async () => ({ access_token: 'fixture-token', expires_in: 7200 }) };
      assert.equal(options.headers['X-EBAY-C-MARKETPLACE-ID'], 'EBAY_US');
      assert.equal(new URL(url).searchParams.get('filter'), 'buyingOptions:{FIXED_PRICE}');
      return { ok: true, json: async () => ({ itemSummaries: [item] }) };
    } });
  const [a, b] = await Promise.all([market.search(card), market.search(card)]);
  assert.equal(a.listings[0].itemId, b.listings[0].itemId); assert.equal(calls.length, 2);
  assert.equal((await market.search(card)).cached, true); assert.equal(calls.length, 2);
  clock += 61000; assert.equal((await market.search(card)).cached, false); assert.equal(calls.length, 3);
});
test('eBay errors are surfaced instead of replacing them with old values', async () => {
  const market = createMarket({ env: { EBAY_CLIENT_ID: 'fixture', EBAY_CLIENT_SECRET: 'fixture' }, fetchImpl: async url => url.includes('/oauth2/') ? { ok: true, json: async () => ({ access_token: 'fixture', expires_in: 7200 }) } : { ok: false, status: 429 } });
  await assert.rejects(market.search(card), { status: 429 });
});
