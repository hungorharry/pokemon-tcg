const fs = require('fs');
const path = require('path');
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalog.json'), 'utf8'));

console.log('=== AUDIT CARD GRADES VS LISTINGS & IMAGES ===');
cat.forEach((c, i) => {
  const cardGrade = Number(c.grade || 10);
  const title = c.listingTitle || '';
  const match = title.match(/psa\s*(\d+)/i);
  const titleGrade = match ? Number(match[1]) : null;

  const isMismatch = titleGrade && titleGrade !== cardGrade;
  const isPriceMismatch = c.listingPriceUSD && c.manualPrice && Math.abs(c.listingPriceUSD - c.manualPrice) > 100;

  if (isMismatch || isPriceMismatch) {
    console.log(`[#${i+1}] ${c.id}: ${c.name}`);
    console.log(`  Card Grade: PSA ${cardGrade} | Title Grade: ${titleGrade ? 'PSA ' + titleGrade : 'None'}`);
    console.log(`  listingPriceUSD: $${c.listingPriceUSD} | manualPrice: $${c.manualPrice} | PC: $${c.pricecharting}`);
    console.log(`  Title: ${title}`);
    console.log(`  Seller: ${c.seller}`);
    console.log(`  Image: ${c.image}`);
    console.log('----------------------------------------------------');
  }
});
