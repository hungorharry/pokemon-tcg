const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../index.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Update modalfoot button
const oldModalFoot = '<div class="modalfoot" style="justify-content:flex-start;flex-wrap:wrap"><a class="small-button primary" target="_blank" rel="noopener noreferrer" href="${esc(c.listingUrl||ebayLink(c))}">🛒 Mở đúng listing này ↗</a>';
const newModalFoot = '<div class="modalfoot" style="justify-content:flex-start;flex-wrap:wrap"><a class="small-button primary" target="_blank" rel="noopener noreferrer" href="${esc(c.listingUrl||ebayLink(c))}">${c.listingUrl && c.listingUrl.includes(\'fanaticscollect.com\') ? \'⚡ Mở sản phẩm trên Fanatics Collect ↗\' : \'🛒 Mở đúng listing này ↗\'}</a>';

if (html.includes(oldModalFoot)) {
  html = html.replace(oldModalFoot, newModalFoot);
  console.log('Updated modalfoot button!');
} else {
  console.log('oldModalFoot not found!');
}

// 2. Bump cache version to v28
html = html.replace(/snoratlas-catalog-v27/g, 'snoratlas-catalog-v28');
html = html.replace(/snoratlas-settings-v27/g, 'snoratlas-settings-v28');
console.log('Bumped cache keys to v28!');

// 3. Add removal of v27 in boot
if (!html.includes("localStorage.removeItem('snoratlas-catalog-v27');")) {
  html = html.replace(
    "localStorage.removeItem('snoratlas-catalog-v26');",
    "localStorage.removeItem('snoratlas-catalog-v26');localStorage.removeItem('snoratlas-catalog-v27');"
  );
  console.log('Added removal of v27 in boot!');
}

fs.writeFileSync(file, html, 'utf8');
console.log('Successfully written index.html!');
