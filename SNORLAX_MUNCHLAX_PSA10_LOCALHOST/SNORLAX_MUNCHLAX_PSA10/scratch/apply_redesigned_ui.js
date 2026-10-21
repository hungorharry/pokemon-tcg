const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(__dirname, 'complete_clean_styles.css');

let html = fs.readFileSync(indexPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Update CSS: Toolbar2, Chips, Drawerhead Sticky, Close Button, and 3D Stage Height
const oldToolbarCss = `.toolbar2 {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}`;

const newToolbarCss = `.toolbar2 {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 0 36px 18px 36px !important;
  margin-bottom: 24px !important;
  border-bottom: 1px solid var(--sb-border) !important;
  flex-wrap: wrap !important;
  gap: 16px !important;
}

.toolbar2-left {
  display: flex;
  flex-direction: column;
}

.toolbar2-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}`;

css = css.replace(oldToolbarCss, newToolbarCss);

// Make drawerhead sticky with close button pinned at top right
const oldDrawerheadCss = `.drawerhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--sb-border);
  padding-bottom: 12px;
}`;

const newDrawerheadCss = `.drawerhead {
  position: sticky !important;
  top: -24px !important;
  margin: -24px -28px 16px -28px !important;
  padding: 16px 28px !important;
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(12px) !important;
  border-bottom: 1px solid var(--sb-border) !important;
  z-index: 100 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  border-radius: 14px 14px 0 0 !important;
}

.close {
  background: #F1F5F9 !important;
  border: 1px solid var(--sb-border) !important;
  color: #111827 !important;
  border-radius: 50% !important;
  width: 32px !important;
  height: 32px !important;
  display: grid !important;
  place-items: center !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
}

.close:hover {
  background: #E2E8F0 !important;
  transform: scale(1.08) !important;
}`;

css = css.replace(oldDrawerheadCss, newDrawerheadCss);
fs.writeFileSync(cssPath, css, 'utf8');

// Update <style>...</style> in index.html
const sIdx = html.indexOf('<style>');
const eIdx = html.indexOf('</style>');
if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx + 7) + '\n' + css + '\n' + html.substring(eIdx);
  console.log('1. Updated CSS with sticky drawerhead and redesigned toolbar2');
}

// 2. Redesign toolbar2 HTML in index.html
const oldToolbarHtml = `<section class="toolbar2"><div><span class="sectiontitle" id="resultTitle">Tất cả bộ sưu tập</span><div class="tiny" id="resultMeta">Đang tải danh mục</div></div><div class="chips"><button class="chip active" data-view="grid">▦ Cards</button><button class="chip" data-view="table">☷ Table</button><button class="small-button" id="btnSync" title="Tải toàn bộ card name khớp Snorlax/Munchlax trong kho TCGdex">⟳ Đồng bộ kho thẻ</button><button class="small-button" id="btnReloadLive" title="Tra giá 8 thẻ đang hiển thị theo thứ tự">↗ Quét giá 8 thẻ</button></div></section>`;

const newToolbarHtml = `<section class="toolbar2">
  <div class="toolbar2-left">
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3FCF8E;box-shadow:0 0 10px #3FCF8E;"></span>
      <h2 class="sectiontitle" id="resultTitle" style="margin:0;font-size:20px;font-family:var(--font-heading);font-weight:800;color:#111827;letter-spacing:-0.02em;">Toàn bộ thẻ Slab (PSA 7 - 10)</h2>
    </div>
    <div class="dim" id="resultMeta" style="margin-top:4px;font-size:12px;color:var(--sb-text-secondary);font-family:var(--font-mono);">58 phiên bản | 42 Snorlax / 16 Munchlax | Dữ liệu sàn eBay & PSA</div>
  </div>
  <div class="toolbar2-right">
    <div class="chips">
      <button class="chip active" data-view="grid">▦ Cards</button>
      <button class="chip" data-view="table">☷ Table</button>
    </div>
    <div class="toolbar-actions" style="display:flex;gap:8px;">
      <button class="small-button" id="btnSync" title="Tải toàn bộ card name khớp Snorlax/Munchlax trong kho TCGdex">⟳ Đồng bộ kho thẻ</button>
      <button class="small-button primary" id="btnReloadLive" title="Tra giá 8 thẻ đang hiển thị theo thứ tự">↗ Quét giá 8 thẻ</button>
    </div>
  </div>
</section>`;

html = html.replace(oldToolbarHtml, newToolbarHtml);
console.log('2. Updated toolbar2 HTML markup');

// 3. Redesign renderDeckByGrades in index.html
const oldRenderDeckByGrades = `function renderDeckByGrades(list){
  if(!list.length)return '<div class="empty"><h3>Không có thẻ phù hợp</h3><div>Thử đổi Tier, nhân vật hoặc từ khóa.</div></div>';
  if(currentGrade!=='all'){
    return \`<div class="deck">\${list.map(cardHtml).join('')}</div>\`;
  }
  const gradesOrder=[10,9,8,7];
  const gradeMeta={
    10:{title:'🏆 PHÂN HẠNG PSA 10 | GEM MINT',desc:'Đỉnh cao phẩm cấp hoàn hảo tuyệt đối - Chuẩn mực đầu tư cao nhất',color:'#3FCF8E',border:'rgba(63, 207, 142, 0.35)'},
    9:{title:'💎 PHÂN HẠNG PSA 9 | MINT',desc:'Cận hoàn hảo - Thanh khoản cao & Tối ưu ngân sách đầu tư',color:'#72E3AD',border:'rgba(114, 227, 173, 0.35)'},
    8:{title:'🌟 PHÂN HẠNG PSA 8 | NM-MT',desc:'Near Mint-Mint - Đẹp sưu tầm với giá thành tiếp cận rất tốt',color:'#F3BA63',border:'rgba(243, 186, 99, 0.35)'},
    7:{title:'✨ PHÂN HẠNG PSA 7 | NEAR MINT',desc:'Thẻ cổ điển nguyên bản - Giá trị lưu giữ di sản thời gian',color:'#DC7B18',border:'rgba(220, 123, 24, 0.35)'}
  };
  let html='';
  for(const g of gradesOrder){
    const sub=list.filter(c=>Number(c.grade||10)===g);
    if(!sub.length)continue;
    const m=gradeMeta[g]||{title:\`PSA \${g}\`,desc:'',color:'#94a3b8',border:'#334460'};
    html+=\`<div class="grade-section"><div class="grade-section-header" style="border:1px solid var(--sb-border);border-left:3px solid \${m.color};background:var(--sb-surface-1);border-radius:6px;padding:12px 16px;"><div><div style="font-size:13px;font-family:var(--font-heading);font-weight:700;color:\${m.color};letter-spacing:0.02em;">\${m.title}</div><div style="font-size:12px;color:var(--sb-text-secondary);margin-top:3px;">\${m.desc}</div></div><div style="background:var(--sb-surface-2);border:1px solid var(--sb-border);border-radius:4px;padding:3px 10px;font-size:11px;font-family:var(--font-mono);font-weight:600;color:var(--sb-text-primary);">\${dec(sub.length)} phiên bản</div></div><div class="deck">\${sub.map(cardHtml).join('')}</div></div>\`;
  }
  return html;
}`;

const newRenderDeckByGrades = `function renderDeckByGrades(list){
  if(!list.length)return '<div class="empty"><h3>Không có thẻ phù hợp</h3><div>Thử đổi Tier, nhân vật hoặc từ khóa.</div></div>';
  if(currentGrade!=='all'){
    return \`<div class="deck">\${list.map(cardHtml).join('')}</div>\`;
  }
  const gradesOrder=[10,9,8,7];
  const gradeMeta={
    10:{title:'PHÂN HẠNG PSA 10',cond:'GEM MINT',badge:'🏆',desc:'Đỉnh cao phẩm cấp hoàn hảo tuyệt đối - Chuẩn mực đầu tư cao nhất',color:'#0A844E',border:'rgba(10, 132, 78, 0.25)',bg:'rgba(63, 207, 142, 0.1)'},
    9:{title:'PHÂN HẠNG PSA 9',cond:'MINT',badge:'💎',desc:'Cận hoàn hảo - Thanh khoản cao & Tối ưu ngân sách đầu tư',color:'#0284C7',border:'rgba(2, 132, 199, 0.25)',bg:'rgba(2, 132, 199, 0.1)'},
    8:{title:'PHÂN HẠNG PSA 8',cond:'NM-MT',badge:'🌟',desc:'Near Mint-Mint - Đẹp sưu tầm với giá thành tiếp cận rất tốt',color:'#D97706',border:'rgba(217, 119, 6, 0.25)',bg:'rgba(217, 119, 6, 0.1)'},
    7:{title:'PHÂN HẠNG PSA 7',cond:'NEAR MINT',badge:'✨',desc:'Thẻ cổ điển nguyên bản - Giá trị lưu giữ di sản thời gian',color:'#DC2626',border:'rgba(220, 38, 38, 0.25)',bg:'rgba(220, 38, 38, 0.1)'}
  };
  let html='';
  for(const g of gradesOrder){
    const sub=list.filter(c=>Number(c.grade||10)===g);
    if(!sub.length)continue;
    const m=gradeMeta[g]||{title:\`PHÂN HẠNG PSA \${g}\`,cond:'',badge:'●',desc:'',color:'#64748B',border:'rgba(100, 116, 139, 0.2)',bg:'#F1F5F9'};
    html+=\`<div class="grade-section">
      <div class="grade-section-header" style="border:1px solid \${m.border};border-left:4px solid \${m.color};background:#FFFFFF;border-radius:10px;padding:14px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:18px;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:40px;height:40px;border-radius:8px;background:\${m.bg};border:1px solid \${m.border};display:grid;place-items:center;font-size:18px;flex-shrink:0;">
            \${m.badge}
          </div>
          <div>
            <div style="font-size:15px;font-family:var(--font-heading);font-weight:800;color:#111827;letter-spacing:-0.01em;">
              \${m.title} <span style="color:\${m.color};font-weight:700;">| \${m.cond}</span>
            </div>
            <div style="font-size:12px;color:var(--sb-text-secondary);margin-top:2px;">\${m.desc}</div>
          </div>
        </div>
        <div style="background:#F8FAFC;border:1px solid var(--sb-border);border-radius:20px;padding:4px 14px;font-size:12px;font-family:var(--font-mono);font-weight:700;color:#111827;display:flex;align-items:center;gap:6px;">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:\${m.color};"></span>
          <span>\${dec(sub.length)} phiên bản</span>
        </div>
      </div>
      <div class="deck">\${sub.map(cardHtml).join('')}</div>
    </div>\`;
  }
  return html;
}`;

html = html.replace(oldRenderDeckByGrades, newRenderDeckByGrades);
console.log('3. Redesigned renderDeckByGrades header');

// 4. Update 3D Stage in openDrawer: Moderate compact height ("cho ảnh thẻ nhỏ vừa thui")
const oldStageHtml = `drawerVisual 3d-stage-container" id="drawerStage" style="width:100%;min-height:360px;margin:16px auto;border-radius:16px;background:radial-gradient(circle at 50% 35%,#FFFFFF,#EDF2F7 85%);border:1px solid rgba(0,0,0,0.08);position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;perspective:900px;user-select:none;">`;
const newStageHtml = `drawerVisual 3d-stage-container" id="drawerStage" style="width:100%;height:230px;min-height:230px;margin:12px auto;border-radius:12px;background:radial-gradient(circle at 50% 35%,#FFFFFF,#EDF2F7 85%);border:1px solid var(--sb-border);position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;perspective:800px;user-select:none;">`;
html = html.replace(oldStageHtml, newStageHtml);

const oldSlabImgStyle = `style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 20px 30px rgba(0,0,0,0.85)) drop-shadow(0 6px 12px rgba(0,0,0,0.5));transform:translateZ(25px);pointer-events:none;"`;
const newSlabImgStyle = `style="max-width:85%;max-height:200px;object-fit:contain;filter:drop-shadow(0 12px 22px rgba(0,0,0,0.2));transform:translateZ(20px);pointer-events:none;"`;
html = html.replace(oldSlabImgStyle, newSlabImgStyle);

// Bump version
html = html.replace(/snoratlas-catalog-v24/g, 'snoratlas-catalog-v25');
html = html.replace(/snoratlas-settings-v24/g, 'snoratlas-settings-v25');
html = html.replace("localStorage.removeItem('snoratlas-catalog-v23');", "localStorage.removeItem('snoratlas-catalog-v23');localStorage.removeItem('snoratlas-catalog-v24');");

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully applied all UI redesigns!');
