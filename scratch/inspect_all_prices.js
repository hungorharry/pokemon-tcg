const fs = require('fs');
const path = require('path');
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalog.json'), 'utf8'));

cat.forEach((c, i) => {
  const vndPC = Math.round((c.pricecharting || 0) * 25450 / 1e6);
  const vndList = Math.round((c.listingPriceUSD || 0) * 25450 / 1e6);
  const vndMan = Math.round((c.manualPrice || 0) * 25450 / 1e6);
  console.log(`[#${i+1}] ${c.id} (PSA ${c.grade}) - ${c.name}`);
  console.log(`     PC: $${c.pricecharting} (~${vndPC}tr) | List: $${c.listingPriceUSD} (~${vndList}tr) | Man: $${c.manualPrice} (~${vndMan}tr)`);
  console.log(`     Seller: ${c.seller} | ListTitle: ${c.listingTitle}`);
  console.log(`     Img: ${c.image}`);
});
