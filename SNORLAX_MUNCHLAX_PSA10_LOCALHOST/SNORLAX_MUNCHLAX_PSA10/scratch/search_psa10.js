async function searchEbayForCard(query) {
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_BIN=1&LH_Auction=0&rt=nc`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    
    // Find items
    const items = [];
    const itemRegex = /<li\s+id="item([a-f0-9]+)"[\s\S]*?<\/li>/gi;
    let match;
    while ((match = itemRegex.exec(html)) !== null && items.length < 5) {
      const block = match[0];
      const titleM = block.match(/class="s-item__title"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i) || block.match(/alt="([^"]+)"/i);
      const priceM = block.match(/class="s-item__price"[^>]*>[\s\S]*?\$([0-9,]+(?:\.[0-9]{2})?)/i);
      const imgM = block.match(/https:\/\/i\.ebayimg\.com\/images\/g\/[^"'/]+\/s-l(?:500|1600)\.(?:webp|jpg)/i);
      const linkM = block.match(/href="(https:\/\/www\.ebay\.com\/itm\/[0-9]+[^"]*)"/i);
      const sellerM = block.match(/class="s-item__seller-info-text"[^>]*>([^<]+)<\/span>/i);
      
      if (titleM && priceM && imgM) {
        const title = titleM[1].replace(/<[^>]+>/g, '').trim();
        const price = parseFloat(priceM[1].replace(/,/g, ''));
        const img = imgM[0].replace('s-l500', 's-l1600');
        const link = linkM ? linkM[1].split('?')[0] : '';
        const seller = sellerM ? sellerM[1].split(' ')[0] : 'eBay Seller';
        items.push({ title, price, img, link, seller });
      }
    }
    return items;
  } catch (e) {
    console.error('Error searching:', e.message);
    return [];
  }
}

async function run() {
  const targets = [
    { id: 'snor-003', q: 'Rocket\'s Snorlax ex 104 PSA 10' },
    { id: 'snor-004', q: 'Snorlax LV.X 111 Rising Rivals PSA 10' },
    { id: 'snor-005', q: 'Snorlax 10 EX Dragon Frontiers Reverse PSA 10' },
    { id: 'snor-006', q: 'Snorlax Jungle no symbol 11 PSA 10' },
    { id: 'snor-008', q: 'Snorlax Jungle unlimited holo 11 PSA 10' },
    { id: 'snor-010', q: 'Snorlax 37 Diamond Pearl Reverse Holo PSA 10' },
    { id: 'snor-019', q: 'Snorlax TG10 Lost Origin PSA 10' }
  ];

  for (const t of targets) {
    console.log(`\n=== SEARCHING FOR ${t.id}: ${t.q} ===`);
    const results = await searchEbayForCard(t.q);
    if (!results.length) {
      console.log('No direct results, trying broader query...');
    } else {
      results.forEach((r, idx) => {
        console.log(`[${idx+1}] Title: ${r.title}`);
        console.log(`    Price: $${r.price} | Seller: ${r.seller}`);
        console.log(`    Image: ${r.img}`);
        console.log(`    Link: ${r.link}`);
      });
    }
    await new Promise(r => setTimeout(r, 600));
  }
}

run();
