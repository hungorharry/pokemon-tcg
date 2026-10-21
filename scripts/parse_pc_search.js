const fs = require('fs');

function parsePriceChartingFile(filePath, speciesName) {
  const html = fs.readFileSync(filePath, 'utf8');
  console.log(`\n================= PARSING ${speciesName.toUpperCase()} =================`);
  console.log('Total file length:', html.length);

  // Match table rows or product entries
  // In PriceCharting search results, each card is in a <tr> with class or id="product-..."
  const rowRegex = /<tr[^>]*id=["']product-(\d+)["'][^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  const cards = [];

  while ((match = rowRegex.exec(html)) !== null) {
    const productId = match[1];
    const rowContent = match[2];

    // Extract title & link: <td class="title"><a href="(?<link>[^"]+)">(?<title>[^<]+)</a>
    const titleMatch = rowContent.match(/<td[^>]*class=["']title["'][^>]*>[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/i);
    // Extract console/set: <td class="console">...</td>
    const consoleMatch = rowContent.match(/<td[^>]*class=["']console["'][^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
    // Extract image: <img ... src="(?<imgSrc>[^"]+)"
    const imgMatch = rowContent.match(/<img[^>]*src=["']([^"']+)["']/i) || rowContent.match(/data-src=["']([^"']+)["']/i);

    if (titleMatch) {
      const link = 'https://www.pricecharting.com' + titleMatch[1];
      const title = titleMatch[2].trim();
      const setName = consoleMatch ? consoleMatch[1].trim() : '';
      let img = imgMatch ? imgMatch[1].trim() : '';
      
      // Clean up relative or thumbnail URLs
      if (img.startsWith('//')) img = 'https:' + img;
      if (img.includes('/240.jpg')) {
        // We have high-res 240.jpg or 1600.jpg
      }

      cards.push({
        productId,
        title,
        setName,
        link,
        image: img,
        species: speciesName
      });
    }
  }

  console.log(`Found ${cards.length} cards for ${speciesName}`);
  if (cards.length > 0) {
    console.log('Sample card 1:', cards[0]);
    if (cards.length > 1) console.log('Sample card 2:', cards[1]);
  }
  return cards;
}

const snorlaxCards = parsePriceChartingFile(
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/352/content.md',
  'Snorlax'
);

const munchlaxCards = parsePriceChartingFile(
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/354/content.md',
  'Munchlax'
);

const allCrawled = [...snorlaxCards, ...munchlaxCards];
fs.writeFileSync('pricecharting_crawled_images.json', JSON.stringify(allCrawled, null, 2), 'utf8');
console.log(`\nSuccessfully saved ${allCrawled.length} PriceCharting cards to pricecharting_crawled_images.json`);
