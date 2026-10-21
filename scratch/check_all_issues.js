const fs = require('fs');
const path = require('path');
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalog.json'), 'utf8'));

console.log('TOTAL CARDS IN CATALOG:', cat.length);

const mismatches = [];

cat.forEach((c, idx) => {
  const cardGrade = Number(c.grade || 10);
  const title = c.listingTitle || '';
  const titleM = title.match(/psa\s*(\d+)/i);
  const titleGrade = titleM ? Number(titleM[1]) : null;

  const notes = c.notes || '';
  const priceDiff = (c.listingPriceUSD && c.manualPrice) ? Math.abs(c.listingPriceUSD - c.manualPrice) : 0;

  let hasIssue = false;
  const issues = [];

  if (titleGrade && titleGrade !== cardGrade) {
    hasIssue = true;
    issues.push(`Grade mismatch: Card is PSA ${cardGrade} but listing title is PSA ${titleGrade}`);
  }

  if (priceDiff > 50) {
    hasIssue = true;
    issues.push(`Price discrepancy: listingPriceUSD=$${c.listingPriceUSD} vs manualPrice=$${c.manualPrice} (diff: $${priceDiff.toFixed(2)})`);
  }

  if (hasIssue) {
    mismatches.push({
      index: idx + 1,
      id: c.id,
      name: c.name,
      cardGrade,
      titleGrade,
      priceUSD: c.listingPriceUSD,
      manualPrice: c.manualPrice,
      pcPrice: c.pricecharting,
      seller: c.seller,
      image: c.image,
      listingUrl: c.listingUrl,
      title,
      issues
    });
  }
});

console.log(`Found ${mismatches.length} cards with potential issues:`);
mismatches.forEach(m => {
  console.log(`\n[#${m.index}] ${m.id} (${m.name}) - Card Grade: PSA ${m.cardGrade}`);
  m.issues.forEach(iss => console.log(`   ⚠️ ${iss}`));
  console.log(`   Seller: ${m.seller} | Title: ${m.title}`);
  console.log(`   Img: ${m.image}`);
  console.log(`   Listing: ${m.listingUrl}`);
});
