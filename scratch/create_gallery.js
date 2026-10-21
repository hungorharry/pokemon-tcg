const fs = require('fs');
const path = require('path');

// Let's create an HTML visual inspection gallery for all 58 cards
// so that we can render the top part (the slab label) clearly and inspect it!
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalog.json'), 'utf8'));

let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Audit Slab Labels</title>
<style>
body { font-family: sans-serif; background: #1a1a24; color: #fff; padding: 20px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.item { background: #242938; border-radius: 8px; padding: 12px; border: 1px solid #3d4663; }
.img-wrap { height: 160px; overflow: hidden; border-radius: 6px; background: #000; margin-bottom: 8px; position: relative; }
img { width: 100%; object-fit: cover; object-position: top; }
h3 { margin: 0 0 6px 0; font-size: 14px; }
.meta { font-size: 12px; color: #9bb; }
.bad { color: #ff6b6b; font-weight: bold; }
</style></head><body><h1>Slab Label Audit Gallery (58 Cards)</h1><div class="grid">`;

cat.forEach((c, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  const file = `${num}_${c.id}_PSA${c.grade}.webp`;
  html += `
  <div class="item">
    <div class="img-wrap">
      <img src="all_images/${file}" alt="${c.id}">
    </div>
    <h3>[#${idx+1}] ${c.id}: ${c.name}</h3>
    <div class="meta">
      <div>Card Grade: <b>PSA ${c.grade}</b></div>
      <div>Price: List=$${c.listingPriceUSD} | Man=$${c.manualPrice}</div>
      <div>Title: ${c.listingTitle || 'N/A'}</div>
    </div>
  </div>`;
});

html += `</div></body></html>`;
fs.writeFileSync(path.join(__dirname, 'gallery.html'), html);
console.log('Gallery created at scratch/gallery.html');
