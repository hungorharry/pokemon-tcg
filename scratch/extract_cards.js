const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../catalog.json');
const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const getTier = (score) => {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 68) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
};

const items = data.map(d => ({
  name: d.name,
  year: d.year,
  set: d.set,
  tier: getTier(d.tierScore),
  score: d.tierScore,
  grade: d.grade || 'PSA 10',
  priceUSD: d.listingPriceUSD || d.pricecharting || 0,
  priceVND_tr: Math.round((d.listingPriceUSD || d.pricecharting || 0) * 25450 / 1e5) / 10,
  pop: d.psa10pop || d.psaTotal || 'N/A'
})).filter(x => x.priceUSD > 0);

console.log('=== KHUNG 100 - 200 TR (Top Pillars) ===');
items.filter(x => x.priceVND_tr >= 100 && x.priceVND_tr <= 200).forEach(x => {
  console.log(`- [Tier ${x.tier}] ${x.name} (${x.year}, ${x.set}) | ${x.grade} | ~${x.priceVND_tr} tr VND ($${x.priceUSD}) | Pop: ${x.pop}`);
});

console.log('\n=== KHUNG 30 - 80 TR (Mid-High Anchors) ===');
items.filter(x => x.priceVND_tr >= 30 && x.priceVND_tr < 80).slice(0, 8).forEach(x => {
  console.log(`- [Tier ${x.tier}] ${x.name} (${x.year}, ${x.set}) | ${x.grade} | ~${x.priceVND_tr} tr VND ($${x.priceUSD}) | Pop: ${x.pop}`);
});

console.log('\n=== KHUNG 3 - 15 TR (Tier B/C Liquid Volume) ===');
items.filter(x => x.priceVND_tr >= 3 && x.priceVND_tr <= 15).slice(0, 8).forEach(x => {
  console.log(`- [Tier ${x.tier}] ${x.name} (${x.year}, ${x.set}) | ${x.grade} | ~${x.priceVND_tr} tr VND ($${x.priceUSD}) | Pop: ${x.pop}`);
});
