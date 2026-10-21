const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'catalog.json');
const INDEX_PATH = path.join(__dirname, '..', 'index.html');
const EBAY_CRAWLED_PATH = path.join(__dirname, 'ebay_crawled_all.json');

// 1. Read catalog and crawled eBay listings
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
const ebayCrawled = JSON.parse(fs.readFileSync(EBAY_CRAWLED_PATH, 'utf8'));

console.log('Total cards in catalog:', catalog.length);
console.log('Total crawled eBay items:', ebayCrawled.length);

// 2. Enrich catalog with eBay crawled items
let enrichedCount = 0;
for (const c of catalog) {
  const num = (c.name.match(/#\s*([A-Za-z0-9-]+)/) || [])[1];
  const parts = c.name.toLowerCase().split(' ').filter(w => w.length > 3 && !['snorlax','munchlax','holo','pokemon'].includes(w));
  
  const found = ebayCrawled.find(e => {
    const eTitle = e.title.toLowerCase();
    if (num && !eTitle.includes(num.toLowerCase())) return false;
    if (parts.length && !parts.some(p => eTitle.includes(p))) return false;
    return true;
  });

  if (found) {
    enrichedCount++;
    c.ebayItemUrl = found.url;
    c.ebayItemTitle = found.title;
    if (found.priceUSD) c.ebayItemPrice = found.priceUSD;
  }
}

console.log('Enriched cards with crawled eBay items:', enrichedCount);
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');

// 3. Update index.html
let html = fs.readFileSync(INDEX_PATH, 'utf8');

// Add helper functions fanaticsLink and ebayLink
const helperFunctions = `
function cleanCardKeyword(c){
  return (c.name||'').replace(new RegExp(c.character,'gi'),'').replace(/#\\d+/g,'').replace(/\\b(?:psa|cgc|bgs|sgc)\\s*[\\d.]+\\b/gi,'').replace(/\\s+/g,' ').trim();
}
function fanaticsLink(c){
  if(c.listingUrl && c.listingUrl.includes('fanaticscollect.com')) return c.listingUrl;
  const q = encodeURIComponent(c.character + ' ' + cleanCardKeyword(c));
  return 'https://www.fanaticscollect.com/marketplace?type=FIXED&q=' + q;
}
function ebayLink(c){
  if(c.ebayItemUrl && c.ebayItemUrl.includes('ebay.com/itm/')) return c.ebayItemUrl;
  if(c.manualUrl && c.manualUrl.includes('ebay.com/itm/')) return c.manualUrl;
  if(c.listingUrl && c.listingUrl.includes('ebay.com')) return c.listingUrl;
  const co = c.slabCompany || 'PSA';
  const gr = c.grade || 10;
  const q = encodeURIComponent(c.character + ' ' + cleanCardKeyword(c) + ' ' + co + ' ' + gr);
  return 'https://www.ebay.com/sch/i.html?_nkw=' + q + '&LH_BIN=1&LH_Auction=0&rt=nc';
}
`;

// Insert helpers before cardHtml
if (!html.includes('function fanaticsLink(')) {
  html = html.replace('function hoverHtml(c){', helperFunctions + '\nfunction hoverHtml(c){');
}

// Update actionline styles
const actionlineCssOld = `.actionline {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}`;

const actionlineCssNew = `.actionline {
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr;
  gap: 5px;
  margin-top: 10px;
}

.actionline a.go-fanatics {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #1D4ED8;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 3px;
  border-radius: var(--sb-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.15s ease;
}
.actionline a.go-fanatics:hover {
  background: #1D4ED8;
  color: #FFFFFF;
  border-color: #1D4ED8;
}

.actionline a.go-ebay {
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  color: #047857;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 3px;
  border-radius: var(--sb-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.15s ease;
}
.actionline a.go-ebay:hover {
  background: #047857;
  color: #FFFFFF;
  border-color: #047857;
}`;

if (html.includes(actionlineCssOld)) {
  html = html.replace(actionlineCssOld, actionlineCssNew);
}

// Update cardHtml actionline to render BOTH Fanatics and eBay buttons
const oldCardActionline = `<div class="actionline"><button data-detail="\${esc(c.id)}">Xem phân tích</button><a class="go" target="_blank" rel="noopener noreferrer" href="\${esc(c.listingUrl||ebayLink(c))}" title="Mở trực tiếp sản phẩm trên \${isFanatics?'Fanatics Collect':'eBay'}">\${isFanatics?'⚡ Fanatics ↗':'🛒 eBay ↗'}</a></div>`;
const newCardActionline = `<div class="actionline"><button data-detail="\${esc(c.id)}">Chi tiết</button><a class="go-fanatics" target="_blank" rel="noopener noreferrer" href="\${esc(fanaticsLink(c))}" title="Mở Fanatics Collect (Buy Now)">⚡ Fanatics ↗</a><a class="go-ebay" target="_blank" rel="noopener noreferrer" href="\${esc(ebayLink(c))}" title="Mở eBay (Buy It Now)">🛒 eBay ↗</a></div>`;

if (html.includes(oldCardActionline)) {
  html = html.replace(oldCardActionline, newCardActionline);
  console.log('Replaced card actionline with DUAL buttons!');
}

// Update hoverHtml to include both links
const oldHoverFoot = `<a href="\${esc(ebayLink(c))}" target="_blank" rel="noopener noreferrer">Mở eBay Buy It Now ↗</a>\${safeExternal(c.priceChartingUrl)?\` | <a href="\${esc(c.priceChartingUrl)}" target="_blank" rel="noopener noreferrer">PriceCharting ↗</a>\`:''}`;
const newHoverFoot = `<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;"><a href="\${esc(fanaticsLink(c))}" target="_blank" rel="noopener noreferrer" style="color:#0284C7;font-weight:700;">⚡ Fanatics Buy Now ↗</a> | <a href="\${esc(ebayLink(c))}" target="_blank" rel="noopener noreferrer" style="color:#059669;font-weight:700;">🛒 eBay Buy It Now ↗</a>\${safeExternal(c.priceChartingUrl)?\` | <a href="\${esc(c.priceChartingUrl)}" target="_blank" rel="noopener noreferrer">PriceCharting ↗</a>\`:''}</div>`;

if (html.includes(oldHoverFoot)) {
  html = html.replace(oldHoverFoot, newHoverFoot);
  console.log('Replaced hover tooltip with DUAL links!');
}

// Update renderGradeRows to render DUAL buttons for every grade row
const oldGradeAction = `<div>
        <a href="\${esc(actionUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;background:\${isCurrent?'var(--sb-primary)':'var(--sb-surface-3)'};color:\${isCurrent?'#000000':'var(--sb-text-primary)'};border:1px solid \${isCurrent?'var(--sb-primary)':'rgba(255,255,255,0.1)'};border-radius:6px;padding:6px 12px;font-size:11px;font-weight:600;text-decoration:none;">
          \${isCurrent ? (isFanatics ? '⚡ Mua ngay trên Fanatics ↗' : '🛒 Mua ngay listing này ↗') : (isFanatics ? \`🔍 Tìm \${tg.name} trên Fanatics ↗\` : \`🔍 Tìm \${tg.name} trên eBay ↗\`)}
        </a>
      </div>`;

const newGradeAction = `<div style="display:flex;gap:6px;flex-wrap:wrap;">
        <a href="\${esc(fUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;border-radius:4px;padding:5px 8px;font-size:11px;font-weight:700;text-decoration:none;">
          ⚡ Fanatics ↗
        </a>
        <a href="\${esc(eUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;border-radius:4px;padding:5px 8px;font-size:11px;font-weight:700;text-decoration:none;">
          🛒 eBay ↗
        </a>
      </div>`;

// In renderGradeRows, add fUrl and eUrl calculation
const oldMatchedLogic = `if(isFanatics){
     actionUrl = \`https://www.fanaticscollect.com/marketplace?type=FIXED&q=\${encodeURIComponent(c.character + ' ' + cleanName)}\`;
     sellerInfo = 'Fanatics Search';
   }else{
     actionUrl = \`https://www.ebay.com/sch/i.html?_nkw=\${encodeURIComponent(c.character+' '+cleanName+' PSA '+tg.grade)}&LH_BIN=1&LH_Auction=0&rt=nc\`;
     sellerInfo = 'eBay Search';
   }`;

const newMatchedLogic = `const fUrl = isCurrent && isFanatics ? (c.listingUrl || fanaticsLink(c)) : \`https://www.fanaticscollect.com/marketplace?type=FIXED&q=\${encodeURIComponent(c.character + ' ' + cleanName + ' ' + tg.grade)}\`;
   const eUrl = isCurrent && !isFanatics ? (c.listingUrl || ebayLink(c)) : \`https://www.ebay.com/sch/i.html?_nkw=\${encodeURIComponent(c.character + ' ' + cleanName + ' ' + tg.name)}&LH_BIN=1&LH_Auction=0&rt=nc\`;
   actionUrl = isFanatics ? fUrl : eUrl;
   sellerInfo = isFanatics ? 'Fanatics Collect Vault' : 'Shop eBay';`;

if (html.includes(oldMatchedLogic)) {
  html = html.replace(oldMatchedLogic, newMatchedLogic);
}
if (html.includes(oldGradeAction)) {
  html = html.replace(oldGradeAction, newGradeAction);
  console.log('Replaced grade rows with DUAL action buttons!');
}

// Update Detail Drawer footer with BOTH buttons
const oldModalFoot = `<div class="modalfoot" style="justify-content:flex-start;flex-wrap:wrap"><a class="small-button primary" target="_blank" rel="noopener noreferrer" href="\${esc(c.listingUrl||ebayLink(c))}">\${c.listingUrl && c.listingUrl.includes('fanaticscollect.com') ? '⚡ Mở sản phẩm trên Fanatics Collect ↗' : '🛒 Mở đúng listing này ↗'}</a><a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.fanaticscollect.com/marketplace?type=FIXED&q=\${encodeURIComponent(c.character)}" style="color:#00529B;border-color:rgba(0,82,155,0.3);background:#F0F7FF;font-weight:700;">⚡ Fanatics Buy Now ↗</a>`;
const newModalFoot = `<div class="modalfoot" style="justify-content:flex-start;flex-wrap:wrap"><a class="small-button primary" target="_blank" rel="noopener noreferrer" href="\${esc(fanaticsLink(c))}" style="background:#00529B;color:#FFFFFF;border-color:#00529B;">⚡ Mở trên Fanatics Collect ↗</a><a class="small-button primary" target="_blank" rel="noopener noreferrer" href="\${esc(ebayLink(c))}" style="background:#059669;color:#FFFFFF;border-color:#059669;">🛒 Mở trên eBay Buy It Now ↗</a>`;

if (html.includes(oldModalFoot)) {
  html = html.replace(oldModalFoot, newModalFoot);
  console.log('Replaced modal footer with DUAL marketplace buttons!');
}

// Sync SEED_DATA
const startTag = '<script id="SEED_DATA" type="application/json">';
const endTag = '</script>';
const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag, startIndex);
if (startIndex !== -1 && endIndex !== -1) {
  html = html.substring(0, startIndex + startTag.length) + JSON.stringify(catalog) + html.substring(endIndex);
}

// Bump cache key
html = html.replace(/snoratlas-catalog-v\d+/g, 'snoratlas-catalog-v33');

fs.writeFileSync(INDEX_PATH, html, 'utf8');
console.log('Saved index.html successfully with cache key snoratlas-catalog-v33!');
