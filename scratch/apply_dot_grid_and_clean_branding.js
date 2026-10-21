const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Remove literal "SUPABASE" branding
// Brand in sidebar
const oldBrand = `<div class="brand"><div class="brandmark"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.35 2L3.5 13.65C3.12 14.1 3.44 14.77 4.02 14.77H11.5V22L20.5 10.35C20.88 9.9 20.56 9.23 19.98 9.23H13.35V2Z" fill="#3FCF8E"/></svg></div><div><strong>SNORLAX <span style="color:#3FCF8E">STUDIO</span></strong><small>SUPABASE DESIGN SYSTEM</small></div></div>`;
const newBrand = `<div class="brand"><div class="brandmark" style="background:#111827;border-radius:6px;width:30px;height:30px;display:grid;place-items:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#3FCF8E" stroke-width="2"/><path d="M3 12H8.5M15.5 12H21" stroke="#3FCF8E" stroke-width="2"/><circle cx="12" cy="12" r="3.2" fill="#3FCF8E" stroke="#111827" stroke-width="1.5"/></svg></div><div><strong>SNORLAX <span style="color:var(--sb-primary-dark)">ATLAS</span></strong><small>COLLECTIBLE INTELLIGENCE</small></div></div>`;
html = html.replace(oldBrand, newBrand);

// Topline
const oldTopline = `<div class="topline"><div><span style="color:#3FCF8E;font-size:10px;">◆</span> SUPABASE STUDIO <span style="color:rgba(255,255,255,0.2)">/</span> SNORLAX & MUNCHLAX PSA ATLAS</div>`;
const newTopline = `<div class="topline"><div><span style="color:var(--sb-primary-dark);font-size:10px;">◆</span> THE COLLECTOR'S TERMINAL <span style="color:var(--sb-border);">/</span> POKÉMON PSA 7 - 10 ATLAS</div>`;
html = html.replace(oldTopline, newTopline);

// Also check any other SUPABASE in HTML
html = html.replace(/SUPABASE STUDIO/g, "MARKET TERMINAL");
html = html.replace(/SUPABASE DESIGN SYSTEM/g, "COLLECTIBLE INTELLIGENCE");

// 2. Add Dot Grid Background into CSS
// Find the body rule and update it
const oldBodyCss = `body {
  margin: 0;
  background: var(--sb-bg);
  color: var(--sb-text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}`;

const newBodyCss = `body {
  margin: 0;
  background-color: #FAFAFA;
  background-image: radial-gradient(rgba(0, 0, 0, 0.12) 1.2px, transparent 1.2px);
  background-size: 24px 24px;
  background-position: 0 0;
  color: var(--sb-text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.main {
  background: transparent !important;
}

.topline {
  background: rgba(255, 255, 255, 0.88) !important;
  backdrop-filter: blur(10px);
}

.sidebar {
  background: #FFFFFF !important;
}

.stat-card, .toolbar, .grade-section-header {
  background: #FFFFFF !important;
}

.card {
  background: #FFFFFF !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02) !important;
}

.card:hover {
  box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04) !important;
}`;

html = html.replace(oldBodyCss, newBodyCss);

// 3. Make sure scanVisible has robust error handling
const oldScanVisible = `async function scanVisible(){const list=filtered().slice(0,8),btn=byId('btnReloadLive');btn.disabled=true;btn.textContent='AI đang quét...';toast(\`AI đang quét và tự động cập nhật giá eBay cho \${list.length} thẻ...\`);for(const c of list)await fetchLive(c,true);btn.disabled=false;btn.textContent='↗ Quét giá 8 thẻ (AI)';store();render();toast(\`✨ AI Sentinel đã hoàn tất quét và đồng bộ dữ liệu vào hệ thống!\`)}`;

const newScanVisible = `async function scanVisible(){
  const list=filtered().slice(0,8);
  const btn=byId('btnReloadLive');
  if(btn){btn.disabled=true;btn.textContent='AI đang quét...';}
  toast(\`AI Sentinel đang quét và cập nhật giá eBay cho \${list.length} thẻ...\`);
  try {
    for(const c of list){
      await fetchLive(c, true);
    }
    store();
    render();
    toast(\`✨ Đã quét và đồng bộ thành công giá eBay cho \${list.length} thẻ!\`);
  } catch (err) {
    toast('Lỗi quét: ' + err.message);
  } finally {
    if(btn){btn.disabled=false;btn.textContent='↗ Quét giá 8 thẻ (AI)';}
  }
}`;

html = html.replace(oldScanVisible, newScanVisible);

// Bump cache version to v22
html = html.replace(/snoratlas-catalog-v21/g, 'snoratlas-catalog-v22');
html = html.replace(/snoratlas-settings-v21/g, 'snoratlas-settings-v22');
html = html.replace("localStorage.removeItem('snoratlas-catalog-v20');", "localStorage.removeItem('snoratlas-catalog-v20');localStorage.removeItem('snoratlas-catalog-v21');");

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated index.html with Dot Grid background and Pokémon branding!');
