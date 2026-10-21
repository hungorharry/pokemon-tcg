const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const lightCssPath = path.join(__dirname, 'supabase_light_styles.css');

let html = fs.readFileSync(indexPath, 'utf8');
const lightCss = fs.readFileSync(lightCssPath, 'utf8');

// 1. Replace <style>...</style> with Supabase Light Theme CSS
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>');
if (styleStart !== -1 && styleEnd !== -1) {
  html = html.substring(0, styleStart + 7) + '\n' + lightCss + '\n' + html.substring(styleEnd);
  console.log('1. Replaced <style> with Supabase Light Theme CSS');
} else {
  console.error('Could not find <style> block');
}

// 2. Add Center Pop Lightbox Modal markup before </body>
const popMarkup = `
<!-- CENTER POP LIGHTBOX MODAL (Bật khi bấm trực tiếp vào ảnh thẻ) -->
<div id="popCover" class="pop-backdrop">
  <div class="pop-dialog" id="popDialog">
    <div class="pop-head">
      <div>
        <div id="popSub" style="font-family:var(--font-mono);font-size:11px;color:var(--sb-primary-dark);font-weight:700;">PSA 10 GEM MINT</div>
        <h3 id="popTitle" style="margin:2px 0 0 0;font-size:16px;font-family:var(--font-heading);color:var(--sb-text-primary);">Tên thẻ Pokemon</h3>
      </div>
      <button class="close" id="closePop" title="Đóng (Esc)">✕</button>
    </div>
    <div class="pop-stage" id="popStage">
      <div style="position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);border:1px solid var(--sb-border);border-radius:6px;padding:5px 10px;font-size:11px;color:var(--sb-text-secondary);font-weight:600;z-index:10;pointer-events:none;">
        ✨ Rê chuột lắc 3D | Cuộn để Zoom
      </div>
      <div class="pop-toolbar">
        <button class="pop-tool-btn active" id="btnPopAiCutout" title="Bật/Tắt chế độ tách phông AI">✨ Tách phông AI</button>
        <button class="pop-tool-btn" id="btnPopZoomOut" title="Thu nhỏ">−</button>
        <button class="pop-tool-btn" id="btnPopZoomReset" title="Về 100%">100%</button>
        <button class="pop-tool-btn" id="btnPopZoomIn" title="Phóng to">+</button>
      </div>
      <div id="popSlabWrapper" style="width:84%;height:88%;display:flex;align-items:center;justify-content:center;transform-style:preserve-3d;cursor:grab;transition:transform 0.1s ease-out;">
        <img id="popSlabImg" class="pop-slab-img ai-isolated" src="" alt="PSA Slab" style="max-width:85%;max-height:360px;object-fit:contain;transition:all 0.2s ease;" />
      </div>
    </div>
    <div class="pop-foot">
      <div>
        <div id="popPrice" style="font-size:18px;font-weight:700;font-family:var(--font-mono);color:var(--sb-text-primary);">0 ₫</div>
        <div id="popMeta" style="font-size:11px;color:var(--sb-text-secondary);margin-top:2px;">Người bán: ...</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="small-button" id="btnPopDossier">📋 Xem phân tích chi tiết</button>
        <a class="small-button primary" id="btnPopBuy" target="_blank" rel="noopener noreferrer" href="#">🛒 Xem trên eBay ↗</a>
      </div>
    </div>
  </div>
</div>
`;

if (!html.includes('id="popCover"')) {
  html = html.replace('</body>', popMarkup + '\n</body>');
  console.log('2. Added Center Pop Lightbox Modal markup');
}

// 3. Add openLightbox, closeLightbox, 3D interaction and Canvas AI Cutout logic
const popScript = `
let activeLightboxCard = null;
let popZoom = 1, popPanX = 0, popPanY = 0, popRotX = 0, popRotY = 0, popIsDragging = false, popStartX = 0, popStartY = 0;
let popOriginalSrc = '', popIsAiCutout = true;

function openLightbox(id) {
  const c = catalog.find(x => x.id === id);
  if (!c) return;
  activeLightboxCard = id;

  const sub = byId('popSub');
  const title = byId('popTitle');
  const price = byId('popPrice');
  const meta = byId('popMeta');
  const img = byId('popSlabImg');
  const btnBuy = byId('popBuy') || byId('btnPopBuy');
  const cover = byId('popCover');

  const gradeName = (c.slabCompany || 'PSA') + ' ' + (c.grade || 10);
  const condition = c.grade === 10 ? 'GEM MINT' : c.grade === 9 ? 'MINT' : c.grade === 8 ? 'NM-MT' : 'NEAR MINT';
  sub.textContent = gradeName + ' | ' + condition + ' - ' + (c.character || 'POKÉMON').toUpperCase();
  title.textContent = c.name + (c.year ? ' (' + c.year + ')' : '');

  const usd = Number(c.listingPriceUSD || c.manualPrice || c.pricecharting || 0);
  const vnd = Math.round(usd * RATE_USD_VND).toLocaleString('vi-VN') + ' ₫';
  price.textContent = vnd + ' ($' + fmt.format(usd) + ' USD)';
  meta.textContent = 'Người bán trên eBay: ' + (c.seller || 'Shop eBay') + ' | Pop: ' + (c.psa10pop ? dec(c.psa10pop) + ' thẻ' : 'Chưa rõ');

  popOriginalSrc = c.image || '';
  img.src = popOriginalSrc;
  popIsAiCutout = true;
  img.classList.add('ai-isolated');
  byId('btnPopAiCutout').classList.add('active');
  byId('btnPopAiCutout').textContent = '✨ Đã tách phông AI';

  if (btnBuy) {
    btnBuy.href = c.listingUrl || ebayLink(c);
  }

  // Reset 3D transforms
  popZoom = 1; popPanX = 0; popPanY = 0; popRotX = 0; popRotY = 0;
  applyPopTransform();

  cover.classList.add('show');
}

function closeLightbox() {
  activeLightboxCard = null;
  const cover = byId('popCover');
  if (cover) cover.classList.remove('show');
}

function applyPopTransform() {
  const wrapper = byId('popSlabWrapper');
  if (!wrapper) return;
  wrapper.style.transform = 'translate(' + popPanX + 'px, ' + popPanY + 'px) scale(' + popZoom + ') rotateX(' + popRotX + 'deg) rotateY(' + popRotY + 'deg)';
}

function initLightboxEvents() {
  const cover = byId('popCover');
  const dialog = byId('popDialog');
  const closeBtn = byId('closePop');
  const stage = byId('popStage');
  const wrapper = byId('popSlabWrapper');
  const img = byId('popSlabImg');
  const btnCutout = byId('btnPopAiCutout');
  const btnDossier = byId('btnPopDossier');

  if (closeBtn) closeBtn.onclick = closeLightbox;
  if (cover) {
    cover.onclick = (e) => {
      if (e.target === cover) closeLightbox();
    };
  }

  if (btnDossier) {
    btnDossier.onclick = () => {
      const cardId = activeLightboxCard;
      closeLightbox();
      if (cardId) openDrawer(cardId);
    };
  }

  // Zoom controls
  byId('btnPopZoomIn').onclick = (e) => {
    e.stopPropagation();
    popZoom = Math.min(3.0, +(popZoom + 0.3).toFixed(1));
    applyPopTransform();
  };
  byId('btnPopZoomOut').onclick = (e) => {
    e.stopPropagation();
    popZoom = Math.max(0.8, +(popZoom - 0.3).toFixed(1));
    if (popZoom <= 1) { popPanX = 0; popPanY = 0; }
    applyPopTransform();
  };
  byId('btnPopZoomReset').onclick = (e) => {
    e.stopPropagation();
    popZoom = 1; popPanX = 0; popPanY = 0; popRotX = 0; popRotY = 0;
    applyPopTransform();
  };

  // Toggle AI Cutout (Bỏ phông trắng / Trong suốt)
  if (btnCutout) {
    btnCutout.onclick = (e) => {
      e.stopPropagation();
      popIsAiCutout = !popIsAiCutout;
      if (popIsAiCutout) {
        img.classList.add('ai-isolated');
        btnCutout.classList.add('active');
        btnCutout.textContent = '✨ Đã tách phông AI';
      } else {
        img.classList.remove('ai-isolated');
        btnCutout.classList.remove('active');
        btnCutout.textContent = 'Phông ảnh gốc';
      }
    };
  }

  // 3D Mouse movement tilt on stage
  if (stage) {
    stage.addEventListener('mousemove', (e) => {
      if (popIsDragging) return;
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      popRotY = (x / (rect.width / 2)) * 14;
      popRotX = -(y / (rect.height / 2)) * 14;
      applyPopTransform();
    });

    stage.addEventListener('mouseleave', () => {
      if (popIsDragging) return;
      popRotX = 0;
      popRotY = 0;
      applyPopTransform();
    });

    // Mouse wheel zoom
    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      popZoom = Math.min(3.5, Math.max(0.8, +(popZoom + delta).toFixed(2)));
      if (popZoom <= 1) { popPanX = 0; popPanY = 0; }
      applyPopTransform();
    }, { passive: false });

    // Drag / Pan when zoomed
    stage.addEventListener('mousedown', (e) => {
      if (e.target.closest('.pop-toolbar') || e.target.closest('button')) return;
      popIsDragging = true;
      popStartX = e.clientX - popPanX;
      popStartY = e.clientY - popPanY;
      stage.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!popIsDragging) return;
      popPanX = e.clientX - popStartX;
      popPanY = e.clientY - popStartY;
      applyPopTransform();
    });

    window.addEventListener('mouseup', () => {
      if (popIsDragging) {
        popIsDragging = false;
        if (stage) stage.style.cursor = 'grab';
      }
    });
  }
}
`;

// Insert the pop script if not already present
if (!html.includes('function openLightbox')) {
  html = html.replace('function initEvents(){', popScript + '\nfunction initEvents(){\n  initLightboxEvents();\n');
  console.log('3. Added openLightbox and 3D event logic');
}

// 4. Hook card click to openLightbox when clicking .card-visual or img directly
// Find document.addEventListener('click', ...
const oldCardClickPattern = `if(d){openDrawer(d.dataset.detail);return;}const card=e.target.closest('.card');if(card&&card.dataset.card){openDrawer(card.dataset.card);}`;
const newCardClickPattern = `if(d){openDrawer(d.dataset.detail);return;}
const visual=e.target.closest('.card-visual');
if(visual){
  const card=visual.closest('.card');
  if(card&&card.dataset.card){openLightbox(card.dataset.card);return;}
}
const card=e.target.closest('.card');
if(card&&card.dataset.card){openDrawer(card.dataset.card);}`;

if (html.includes(oldCardClickPattern)) {
  html = html.replace(oldCardClickPattern, newCardClickPattern);
  console.log('4. Hooked card-visual click to openLightbox');
}

// 5. Update Escape key handler to close both drawer and lightbox
html = html.replace(
  "if(e.key==='Escape'){closeDrawer();closeModal()}",
  "if(e.key==='Escape'){closeDrawer();closeModal();closeLightbox()}"
);

// 6. Update Drawer 3D Stage background to clean light radial gradient
html = html.replace(
  'background:radial-gradient(circle at 50% 35%,#1C1C1C,#121212 85%);border:1px solid rgba(255,255,255,0.08);',
  'background:radial-gradient(circle at 50% 35%,#FFFFFF,#EDF2F7 85%);border:1px solid rgba(0,0,0,0.08);'
);
html = html.replace(
  'background:radial-gradient(circle at 50% 35%,#1c2637,#0b1019 75%);border:1px solid #28374d;',
  'background:radial-gradient(circle at 50% 35%,#FFFFFF,#EDF2F7 85%);border:1px solid rgba(0,0,0,0.08);'
);
// In drawer, add mix-blend-mode: multiply to drawerSlabImg for transparent background
html = html.replace(
  'id="drawerSlabImg" src="${esc(c.image)}"',
  'id="drawerSlabImg" class="ai-isolated" src="${esc(c.image)}" style="mix-blend-mode:multiply;"'
);

// 7. Bump cache version to v21
html = html.replace(/snoratlas-catalog-v20/g, 'snoratlas-catalog-v21');
html = html.replace(/snoratlas-settings-v20/g, 'snoratlas-settings-v21');
html = html.replace("localStorage.removeItem('snoratlas-catalog-v19');", "localStorage.removeItem('snoratlas-catalog-v19');localStorage.removeItem('snoratlas-catalog-v20');");

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully applied Supabase White Theme and Center Pop Lightbox Modal!');
