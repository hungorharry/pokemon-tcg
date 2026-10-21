const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(__dirname, 'complete_clean_styles.css');

let html = fs.readFileSync(indexPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Update CSS: Make .drawer and .drawer-cover a centered popup modal
const oldDrawerCss = `.drawer-cover {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 50;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.drawer-cover.show {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 520px;
  max-width: 92vw;
  background: #FFFFFF;
  border-left: 1px solid var(--sb-border);
  z-index: 60;
  transform: translateX(100%);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 24px;
  overflow-y: auto;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
}

.drawer.show {
  transform: translateX(0);
}`;

const newDrawerCss = `.drawer-cover {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  z-index: 10000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.drawer-cover.show {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.92);
  width: 820px;
  max-width: 95vw;
  max-height: 90vh;
  background: #FFFFFF !important;
  border: 1px solid var(--sb-border);
  border-radius: 14px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
  z-index: 10001;
  padding: 24px 28px;
  overflow-y: auto;
  opacity: 0;
  pointer-events: none;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.drawer.show {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
}`;

css = css.replace(oldDrawerCss, newDrawerCss);
fs.writeFileSync(cssPath, css, 'utf8');

// Update <style> block in index.html
const sIdx = html.indexOf('<style>');
const eIdx = html.indexOf('</style>');
if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx + 7) + '\n' + css + '\n' + html.substring(eIdx);
}

// 2. In initEvents: make clicking ANY card or card-visual open the FULL DOSSIER openDrawer
// Find the click listener
const oldClickListener = `  document.addEventListener('click',e=>{
    const f=e.target.closest('[data-fav]');
    if(f){const c=catalog.find(c=>c.id===f.dataset.fav);if(c){c.favorite=!c.favorite;store();render()}return}
    if(e.target.closest('a.go')||e.target.closest('.heart'))return;
    
    // Clicking "Xem phân tích" opens the right drawer
    const d=e.target.closest('[data-detail]');
    if(d){openDrawer(d.dataset.detail);return;}

    // Clicking directly on card-visual or the slab image opens the CENTER POP LIGHTBOX MODAL
    const visual=e.target.closest('.card-visual');
    if(visual){
      const card=visual.closest('.card');
      if(card&&card.dataset.card){
        openLightbox(card.dataset.card);
        return;
      }
    }

    // Clicking anywhere else on the card opens the right drawer
    const card=e.target.closest('.card');
    if(card&&card.dataset.card){openDrawer(card.dataset.card);}
  });`;

const newClickListener = `  document.addEventListener('click',e=>{
    const f=e.target.closest('[data-fav]');
    if(f){const c=catalog.find(c=>c.id===f.dataset.fav);if(c){c.favorite=!c.favorite;store();render()}return}
    if(e.target.closest('a.go')||e.target.closest('.heart'))return;
    
    // Clicking "Xem phân tích", clicking the image card-visual, or clicking the card itself
    // immediately opens the FULL COMPLETE DOSSIER (with all analysis, eBay scan prices, grade comparison, and PSA pop)
    const d=e.target.closest('[data-detail]');
    if(d){openDrawer(d.dataset.detail);return;}

    const card=e.target.closest('.card');
    if(card&&card.dataset.card){openDrawer(card.dataset.card);return;}
  });`;

if (html.includes(oldClickListener)) {
  html = html.replace(oldClickListener, newClickListener);
  console.log('2. Updated click listener so clicking card/image opens the full dossier immediately');
} else {
  console.warn('Could not find oldClickListener exact string, checking fallback');
}

// 3. Make sure when openDrawer is called, if liveData is not present, it automatically triggers fetchLive
const oldOpenDrawerHead = `function openDrawer(id,recreate=true){const c=catalog.find(c=>c.id===id);if(!c)return;activeCard=id;`;
const newOpenDrawerHead = `function openDrawer(id,recreate=true){const c=catalog.find(c=>c.id===id);if(!c)return;activeCard=id;
 if(!latest.has(c.id)&&ebayReady){fetchLive(c);}`;

if (html.includes(oldOpenDrawerHead) && !html.includes(newOpenDrawerHead)) {
  html = html.replace(oldOpenDrawerHead, newOpenDrawerHead);
  console.log('3. Added auto live eBay scan on openDrawer');
}

// Bump cache version to v23
html = html.replace(/snoratlas-catalog-v22/g, 'snoratlas-catalog-v23');
html = html.replace(/snoratlas-settings-v22/g, 'snoratlas-settings-v23');
html = html.replace("localStorage.removeItem('snoratlas-catalog-v21');", "localStorage.removeItem('snoratlas-catalog-v21');localStorage.removeItem('snoratlas-catalog-v22');");

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully applied Centered Full Dossier to index.html!');
