const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'catalog.json');
const BUYNOW_PATH = path.join(__dirname, 'fanatics_buynow_all.json');
const PARSED_ALL_PATH = path.join(__dirname, 'fanatics_parsed_all.json');
const INDEX_PATH = path.join(__dirname, '..', 'index.html');

// 1. Read existing catalog to keep the 58 core cards
const currentCatalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
const coreCards = currentCatalog.filter(c => !c.id.startsWith('fc-'));
console.log('Core curated cards count:', coreCards.length);

// Clean up core cards: make sure manualPrice matches listingPriceUSD if set
for (const c of coreCards) {
  if (c.listingPriceUSD && c.listingPriceUSD > 0) {
    c.manualPrice = c.listingPriceUSD;
  }
}

// 2. Read all 513 verified Fanatics Buy Now cards
const fanaticsBuyNow = JSON.parse(fs.readFileSync(BUYNOW_PATH, 'utf8'));
console.log('Fanatics Buy Now cards count:', fanaticsBuyNow.length);

// Ensure target card is 100% accurate
const target = fanaticsBuyNow.find(c => c.fanaticsId === '3ce1c684-7c20-43ad-9167-231249aaaaff' || c.listingUrl.includes('3ce1c684'));
if (target) {
  target.listingPriceUSD = 135;
  target.manualPrice = 135;
  target.grade = 9.5;
  target.gradeLabel = 'CGC 9.5 MINT+';
  target.slabCompany = 'CGC';
  target.listingUrl = 'https://www.fanaticscollect.com/buy-now/3ce1c684-7c20-43ad-9167-231249aaaaff/2009-pokemon-platinum-rising-rivals-league-crosshatch-holo-snorlax-33-cgc-95-mint';
  console.log('Target card verified:', target.name, target.listingPriceUSD, target.listingUrl);
}

// 3. Merge: 58 core + 513 Fanatics Buy Now
const merged = [...coreCards, ...fanaticsBuyNow];
console.log('Total merged cards count:', merged.length);

// 4. Save catalog.json & fanatics_parsed_all.json
fs.writeFileSync(CATALOG_PATH, JSON.stringify(merged, null, 2), 'utf8');
fs.writeFileSync(PARSED_ALL_PATH, JSON.stringify(fanaticsBuyNow, null, 2), 'utf8');
console.log('Saved catalog.json and fanatics_parsed_all.json successfully!');

// 5. Sync to index.html SEED_DATA and bump cache key to snoratlas-catalog-v30
let html = fs.readFileSync(INDEX_PATH, 'utf8');

// Replace SEED_DATA
const startTag = '<script id="SEED_DATA" type="application/json">';
const endTag = '</script>';
const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag, startIndex);
if (startIndex !== -1 && endIndex !== -1) {
  html = html.substring(0, startIndex + startTag.length) + JSON.stringify(merged) + html.substring(endIndex);
}

// Bump cache key
html = html.replace(/snoratlas-catalog-v\d+/g, 'snoratlas-catalog-v30');

fs.writeFileSync(INDEX_PATH, html, 'utf8');
console.log('Synced SEED_DATA and bumped cache key to snoratlas-catalog-v30 in index.html!');
