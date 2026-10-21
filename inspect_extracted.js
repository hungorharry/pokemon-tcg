const fs = require('fs');
const https = require('https');

const list = JSON.parse(fs.readFileSync('pricecharting_crawled_images.json', 'utf8'));
console.log('Total extracted:', list.length);

list.slice(0, 15).forEach((c, i) => {
  const highRes = c.image.replace('/60.jpg', '/240.jpg');
  console.log(`[${i+1}] ${c.title} -> ${highRes}`);
});

// Test fetching one 240.jpg to verify HTTP 200
const testImg = list[0].image.replace('/60.jpg', '/240.jpg');
https.get(testImg, (res) => {
  console.log('Test image status code:', res.statusCode, 'Content-Type:', res.headers['content-type'], testImg);
});
