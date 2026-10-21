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

const items = data.map(d => {
  const price = d.listingPriceUSD || d.pricecharting || 0;
  const vnd_tr = (price * 25450 / 1e6);
  return {
    id: d.id,
    name: d.name,
    year: d.year,
    set: d.set,
    grade: d.grade || 'PSA 10',
    pop: d.psa10pop,
    tierScore: d.tierScore,
    tier: getTier(d.tierScore),
    priceUSD: price,
    vnd_tr: Math.round(vnd_tr * 10) / 10,
    thesis: d.investmentThesis
  };
});

console.log("=== PHÂN TÍCH TỔNG QUAN TẬP THẺ ===");
console.log("Tổng số thẻ:", items.length);

const tierStats = {};
['S', 'A', 'B', 'C', 'D', 'F'].forEach(t => {
  const list = items.filter(x => x.tier === t);
  const prices = list.map(x => x.vnd_tr).filter(p => p > 0);
  const avgPrice = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(1) : 0;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  tierStats[t] = { count: list.length, avgPriceTr: avgPrice, minTr: minPrice, maxTr: maxPrice };
});
console.log("Thống kê theo Tier:", JSON.stringify(tierStats, null, 2));

const brackets = {
  'Micro / Budget (Dưới 10 tr VND)': items.filter(x => x.vnd_tr > 0 && x.vnd_tr < 10),
  'Mid-Low Tier (10 - 40 tr VND)': items.filter(x => x.vnd_tr >= 10 && x.vnd_tr < 40),
  'Mid-High Tier (40 - 100 tr VND)': items.filter(x => x.vnd_tr >= 40 && x.vnd_tr < 100),
  'Sweet Spot / Pillar (100 - 200 tr VND)': items.filter(x => x.vnd_tr >= 100 && x.vnd_tr <= 200),
  'Mega Grails / Blue-Chip (> 200 tr VND)': items.filter(x => x.vnd_tr > 200)
};

console.log("\n=== PHÂN KHÚC GIÁ THỰC TẾ ===");
for (const [k, v] of Object.entries(brackets)) {
  console.log(`\n--- ${k}: ${v.length} thẻ ---`);
  v.sort((a,b) => b.vnd_tr - a.vnd_tr);
  v.slice(0, 5).forEach(x => {
    console.log(`* [Tier ${x.tier} - ${x.tierScore}đ] ${x.name} (${x.year}, ${x.set}) | Giá: ~${x.vnd_tr} tr VND ($${x.priceUSD}) | Pop: ${x.pop || 'N/A'}`);
  });
}
