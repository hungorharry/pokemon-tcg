const https = require('https');

const urls = [
  'https://www.ebay.com/itm/117437801771',
  'https://www.ebay.com/itm/406881051441',
  'https://www.ebay.com/itm/117431616764'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        const priceMatch = data.match(/itemprop="price"\s+content="([^"]+)"/i) || data.match(/x-price-primary[^>]*>.*?([0-9,.]+)/s);
        const imgMatch = data.match(/https:\/\/i\.ebayimg\.com\/images\/g\/[^\/"]+\/s-l1600\.(?:webp|jpg|png)/i);
        const sellerMatch = data.match(/seller-persona.*?<span class="ux-textspans bold">([^<]+)<\/span>/i) || data.match(/"sellerName":"([^"]+)"/i);
        resolve({
          url,
          title: titleMatch ? titleMatch[1].replace(/\s*\| eBay\s*$/i, '') : 'N/A',
          price: priceMatch ? priceMatch[1] : 'N/A',
          seller: sellerMatch ? sellerMatch[1] : 'N/A',
          img: imgMatch ? imgMatch[0] : 'N/A'
        });
      });
    }).on('error', (e) => resolve({ url, error: e.message }));
  });
}

(async () => {
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(JSON.stringify(res, null, 2));
  }
})();
