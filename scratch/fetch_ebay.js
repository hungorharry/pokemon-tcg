async function check() {
  try {
    const res = await fetch('https://www.ebay.com/itm/117431616764', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const priceMatch = html.match(/class="x-price-primary"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i) || html.match(/"price"\s*:\s*"([^"]+)"/i);
    const sellerMatch = html.match(/data-testid="str-title"[^>]*>([^<]+)<\/span>/i) || html.match(/\/usr\/([^"?/]+)/i);
    const imgMatch = html.match(/https:\/\/i\.ebayimg\.com\/images\/g\/[^"'/]+\/s-l1600\.(?:webp|jpg)/i);

    console.log('--- EBAY LISTING 117431616764 ---');
    console.log('Title:', titleMatch ? titleMatch[1].trim() : 'Unknown');
    console.log('Price:', priceMatch ? priceMatch[1].trim() : 'Unknown');
    console.log('Seller:', sellerMatch ? sellerMatch[1].trim() : 'Unknown');
    console.log('Image:', imgMatch ? imgMatch[0] : 'None');
  } catch (err) {
    console.error('Error fetching eBay:', err.message);
  }
}
check();
