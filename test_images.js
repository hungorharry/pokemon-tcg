const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ url, status: res.statusCode, contentType: res.headers['content-type'] });
    });
    req.on('error', (e) => resolve({ url, status: 'error', error: e.message }));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve({ url, status: 'timeout' });
    });
  });
}

async function run() {
  const tests = [
    'https://storage.googleapis.com/images.pricecharting.com/9f8ddeb4aff8985eaa09ff48b5fe9d292aa41edbca4ca446a7eb0aa4bc8942f1/240.jpg',
    'https://images.pokemontcg.io/base2/11_hires.png',
    'https://images.pokemontcg.io/swsh1/142_hires.png',
    'https://images.pokemontcg.io/swsh1/202_hires.png',
    'https://images.pokemontcg.io/sm9/191_hires.png',
    'https://images.pokemontcg.io/sm9/171_hires.png',
    'https://images.pokemontcg.io/swsh11tg/TG10_hires.png',
    'https://images.pokemontcg.io/sv3pt5/181_hires.png',
    'https://images.pokemontcg.io/sv3pt5/51_hires.png',
    'https://images.pokemontcg.io/ex7/104_hires.png',
    'https://images.pokemontcg.io/basep/49_hires.png',
    'https://assets.tcgdex.net/en/swsh/swsh1/142/high.webp',
    'https://assets.tcgdex.net/en/swsh/swsh1/202/high.webp'
  ];

  for (const t of tests) {
    const res = await testUrl(t);
    console.log(res.status, res.contentType, res.url);
  }
}

run();
