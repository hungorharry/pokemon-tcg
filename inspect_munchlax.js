const fs = require('fs');
const pc = JSON.parse(fs.readFileSync('pricecharting_crawled_images.json', 'utf8'));
const munch = pc.filter(p => p.species === 'Munchlax');
console.log('Total Munchlax on PriceCharting:', munch.length);
munch.forEach((m, i) => {
  console.log((i + 1) + '. ' + m.title + ' | ' + m.image);
});
