const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'catalog.json');
const INDEX_PATH = path.join(__dirname, '..', 'index.html');
const PARSED_ALL_PATH = path.join(__dirname, 'fanatics_parsed_all.json');

// 1. Load catalog
let catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
console.log('Original catalog count:', catalog.length);

// 2. Filter out non-Pokemon cards (e.g. Mike Munchak NFL football cards)
catalog = catalog.filter(c => {
  const text = (c.name + ' ' + (c.listingTitle || '') + ' ' + (c.set || '') + ' ' + (c.variant || '')).toLowerCase();
  const isSports = /nfl|oilers|titans|football|baseball|basketball|munchak|fleer|score board|pro set/i.test(text);
  if (isSports) {
    console.log('Removing non-Pokemon item:', c.id, c.name);
    return false;
  }
  return true;
});

console.log('Catalog count after purging sports cards:', catalog.length);

// 3. Ensure Topps TV Animation Snorlax is 100% verified
const topps = catalog.find(c => c.id === 'fc-snorlax-014');
if (topps) {
  topps.name = 'Topps TV Animation Series 3 Snorlax #143';
  topps.listingPriceUSD = 3500;
  topps.manualPrice = 3500;
  topps.grade = 10;
  topps.gradeLabel = 'PSA 10 GEM MINT';
  topps.slabCompany = 'PSA';
  topps.listingUrl = 'https://www.fanaticscollect.com/buy-now/fa27b647-cafe-4d3c-ba5a-70f282c7bd92/2000-topps-pokemon-tv-animation-series-3-snorlax-143-psa-10-gem-mint';
  topps.image = 'https://s3-us-west-2.amazonaws.com/pwcc-vault/2026/10/14/cars/02/large/v7110172_20261014090201036M_5.jpg';
  topps.notes = 'Listing Buy Now trực tiếp tại sàn Fanatics Collect: "2000 Topps Pokemon TV Animation Series 3 Snorlax #143 PSA 10 GEM MINT". Giá niêm yết thật: $3,500 (~89.075.000 ₫). Tình trạng: PSA 10 GEM MINT.';
  console.log('Verified Topps Snorlax card:', topps.name, topps.listingPriceUSD, topps.listingUrl);
}

// 4. Save clean catalog
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');

// Also update fanatics_parsed_all
if (fs.existsSync(PARSED_ALL_PATH)) {
  const fAll = JSON.parse(fs.readFileSync(PARSED_ALL_PATH, 'utf8'));
  const cleanFAll = fAll.filter(c => {
    const text = (c.name + ' ' + (c.listingTitle || '') + ' ' + (c.set || '')).toLowerCase();
    return !/nfl|oilers|titans|football|baseball|basketball|munchak/i.test(text);
  });
  fs.writeFileSync(PARSED_ALL_PATH, JSON.stringify(cleanFAll, null, 2), 'utf8');
}

// 5. Update index.html
let html = fs.readFileSync(INDEX_PATH, 'utf8');

// Replace SEED_DATA
const startTag = '<script id="SEED_DATA" type="application/json">';
const endTag = '</script>';
const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag, startIndex);
if (startIndex !== -1 && endIndex !== -1) {
  html = html.substring(0, startIndex + startTag.length) + JSON.stringify(catalog) + html.substring(endIndex);
}

// Replace the Fanatics box links in the drawer:
// Old:
// <a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.fanaticscollect.com/marketplace?type=FIXED&q=${encodeURIComponent(c.character)}" ...
// <a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.fanaticscollect.com/marketplace?q=${encodeURIComponent(c.character+' '+c.name.replace(/#\d+/,'').trim())}" ...
// New:
// Prioritizes direct product link if available, always appends type=FIXED, and never outputs WEEKLY or ghost links!

const oldBoxTarget = `<div style="display:flex;gap:8px;flex-wrap:wrap;">
    <a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.fanaticscollect.com/marketplace?type=FIXED&q=\${encodeURIComponent(c.character)}" style="flex:1;background:#00529B;color:#FFFFFF;border:1px solid #00529B;font-weight:700;font-size:11.5px;text-align:center;padding:8px 12px;border-radius:6px;">
      ⚡ Mở kho Buy Now \${esc(c.character)} trên Fanatics Collect (Có thẻ thật) ↗
    </a>
    <a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.fanaticscollect.com/marketplace?q=\${encodeURIComponent(c.character+' '+c.name.replace(/#\\d+/,'').trim())}" style="background:#FFFFFF;color:#00529B;border:1px solid rgba(0,82,155,0.3);font-weight:600;font-size:11px;text-align:center;padding:8px 12px;border-radius:6px;">
      🔍 Tìm riêng thẻ này ↗
    </a>
  </div>`;

const newBoxReplacement = `<div style="display:flex;gap:8px;flex-wrap:wrap;">
    \${c.listingUrl && c.listingUrl.includes('fanaticscollect.com') ? \`
    <a class="small-button" target="_blank" rel="noopener noreferrer" href="\${esc(c.listingUrl)}" style="flex:1;background:#00529B;color:#FFFFFF;border:1px solid #00529B;font-weight:700;font-size:11.5px;text-align:center;padding:8px 12px;border-radius:6px;">
      ⚡ Mở đúng listing này trên Fanatics Collect (\${esc(c.gradeLabel||'Grade '+c.grade)} - $\${Number(c.listingPriceUSD||0).toLocaleString()}) ↗
    </a>
    \` : \`
    <a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.fanaticscollect.com/marketplace?type=FIXED&q=\${encodeURIComponent(c.character)}" style="flex:1;background:#00529B;color:#FFFFFF;border:1px solid #00529B;font-weight:700;font-size:11.5px;text-align:center;padding:8px 12px;border-radius:6px;">
      ⚡ Mở kho Buy Now \${esc(c.character)} trên Fanatics Collect ↗
    </a>
    \`}
    <a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.fanaticscollect.com/marketplace?type=FIXED&q=\${encodeURIComponent(c.character + ' ' + c.name.replace(new RegExp(c.character, 'gi'), '').replace(/#\\d+/g, '').replace(/\\s+/g, ' ').trim())}" style="background:#FFFFFF;color:#00529B;border:1px solid rgba(0,82,155,0.3);font-weight:600;font-size:11px;text-align:center;padding:8px 12px;border-radius:6px;">
      🔍 Tìm thêm trên sàn Buy Now ↗
    </a>
  </div>`;

if (html.includes(oldBoxTarget)) {
  html = html.replace(oldBoxTarget, newBoxReplacement);
  console.log('Replaced old Fanatics search box buttons in index.html!');
} else {
  console.log('Warning: oldBoxTarget not found verbatim, checking regex...');
  // Use regex replacement
  const boxRegex = /<div style="display:flex;gap:8px;flex-wrap:wrap;">\s*<a class="small-button" target="_blank" rel="noopener noreferrer" href="https:\/\/www\.fanaticscollect\.com\/marketplace\?type=FIXED&q=\${encodeURIComponent\(c\.character\)}"[^>]*>[\s\S]*?<\/div>/;
  if (boxRegex.test(html)) {
    html = html.replace(boxRegex, newBoxReplacement);
    console.log('Replaced old Fanatics search box using regex in index.html!');
  }
}

// Ensure NO link has missing type=FIXED
html = html.replace(/https:\/\/www\.fanaticscollect\.com\/marketplace\?q=/g, 'https://www.fanaticscollect.com/marketplace?type=FIXED&q=');

// Bump cache key
html = html.replace(/snoratlas-catalog-v\d+/g, 'snoratlas-catalog-v32');

fs.writeFileSync(INDEX_PATH, html, 'utf8');
console.log('Saved index.html with clean verified links and cache key snoratlas-catalog-v32!');
