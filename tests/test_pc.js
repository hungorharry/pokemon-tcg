const https = require('https');

https.get('https://www.pricecharting.com/search-products?q=snorlax&type=prices', { 
  headers: { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
  } 
}, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'Length:', html.length);
    const regex = /<tr[^>]*>[\s\S]*?<td class="title">[\s\S]*?<a href="([^"]+)">([^<]+)<\/a>[\s\S]*?<img[^>]+src=['"]([^'"]+)['"]/g;
    let match;
    let count = 0;
    while ((match = regex.exec(html)) !== null && count < 10) {
      count++;
      console.log(`[${count}] Title: ${match[2].trim()} | Link: ${match[1]} | Img: ${match[3]}`);
    }
    if (count === 0) {
      // Find all storage.googleapis images
      const imgRegex = /https:\/\/storage\.googleapis\.com\/images\.pricecharting\.com\/[a-zA-Z0-9]+\/(?:240|1600)\.jpg/g;
      const allImgs = html.match(imgRegex);
      console.log('Direct image matches found:', allImgs ? allImgs.length : 0);
      if (allImgs) console.log('Sample direct img:', allImgs.slice(0, 3));
    }
  });
}).on('error', err => console.error(err));
