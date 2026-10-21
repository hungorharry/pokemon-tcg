const fs = require('fs');
const path = require('path');
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalog.json'), 'utf8'));

console.log('--- CARDS WITH DISCREPANCY BETWEEN listingPriceUSD & manualPrice ---');
cat.forEach((c, idx) => {
  if (c.listingPriceUSD && c.manualPrice && Math.abs(c.listingPriceUSD - c.manualPrice) > 10) {
    console.log(`#${idx+1} [${c.id}] ${c.name} (PSA ${c.grade})`);
    console.log(`  listingPriceUSD: $${c.listingPriceUSD} | manualPrice: $${c.manualPrice} | PC: $${c.pricecharting}`);
    console.log(`  seller: ${c.seller} | listingTitle: ${c.listingTitle}`);
    console.log(`  image: ${c.image}`);
    console.log(`  listingUrl: ${c.listingUrl}`);
  }
});
