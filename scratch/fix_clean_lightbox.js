const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Find the index of "scanVisible(){"
const scanIdx = html.indexOf('async function scanVisible(){');
if (scanIdx === -1) {
  console.error('Could not find scanVisible');
  process.exit(1);
}

// Find where scanVisible function body ends: "thống!\`)}"
const scanEndIdx = html.indexOf('thống!\`)}', scanIdx);
if (scanEndIdx === -1) {
  console.error('Could not find scanVisible end');
  process.exit(1);
}
const cutPoint = scanEndIdx + 'thống!\`)}'.length;

const cleanTail = `

// ==========================================
// LIGHTBOX MODAL LOGIC (POPS UP IN CENTER)
// ==========================================
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
  const btnBuy = byId('btnPopBuy');
  const cover = byId('popCover');

  const gradeName = (c.slabCompany || 'PSA') + ' ' + (c.grade || 10);
  const condition = c.grade === 10 ? 'GEM MINT' : c.grade === 9 ? 'MINT' : c.grade === 8 ? 'NM-MT' : 'NEAR MINT';
  if (sub) sub.textContent = gradeName + ' | ' + condition + ' - ' + (c.character || 'POKÉMON').toUpperCase();
  if (title) title.textContent = c.name + (c.year ? ' (' + c.year + ')' : '');

  const usd = Number(c.listingPriceUSD || c.manualPrice || c.pricecharting || 0);
  const vnd = Math.round(usd * RATE_USD_VND).toLocaleString('vi-VN') + ' ₫';
  const usdFmt = '$' + fmt.format(usd) + ' USD';
  if (price) price.textContent = vnd + ' (' + usdFmt + ')';
  if (meta) meta.textContent = 'Người bán trên eBay: ' + (c.seller || 'Shop eBay') + ' | Pop: ' + (c.psa10pop ? dec(c.psa10pop) + ' thẻ' : 'Chưa rõ');

  popOriginalSrc = c.image || '';
  if (img) {
    img.src = popOriginalSrc;
    img.classList.add('ai-isolated');
  }
  popIsAiCutout = true;
  const btnCut = byId('btnPopAiCutout');
  if (btnCut) {
    btnCut.classList.add('active');
    btnCut.textContent = '✨ Đã tách phông AI';
  }

  if (btnBuy) {
    btnBuy.href = c.listingUrl || ebayLink(c);
  }

  // Reset 3D transform
  popZoom = 1; popPanX = 0; popPanY = 0; popRotX = 0; popRotY = 0;
  applyPopTransform();

  if (cover) cover.classList.add('show');
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
  const resetBtn = byId('btnPopZoomReset');
  if (resetBtn) resetBtn.textContent = Math.round(popZoom * 100) + '%';
}

function initLightboxEvents() {
  const cover = byId('popCover');
  const closeBtn = byId('closePop');
  const stage = byId('popStage');
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
  const bIn = byId('btnPopZoomIn');
  const bOut = byId('btnPopZoomOut');
  const bReset = byId('btnPopZoomReset');
  if (bIn) bIn.onclick = (e) => {
    e.stopPropagation();
    popZoom = Math.min(3.0, +(popZoom + 0.3).toFixed(1));
    applyPopTransform();
  };
  if (bOut) bOut.onclick = (e) => {
    e.stopPropagation();
    popZoom = Math.max(0.8, +(popZoom - 0.3).toFixed(1));
    if (popZoom <= 1) { popPanX = 0; popPanY = 0; }
    applyPopTransform();
  };
  if (bReset) bReset.onclick = (e) => {
    e.stopPropagation();
    popZoom = 1; popPanX = 0; popPanY = 0; popRotX = 0; popRotY = 0;
    applyPopTransform();
  };

  // Toggle AI Cutout (Bỏ phông trắng)
  if (btnCutout) {
    btnCutout.onclick = (e) => {
      e.stopPropagation();
      popIsAiCutout = !popIsAiCutout;
      if (popIsAiCutout) {
        if (img) img.classList.add('ai-isolated');
        btnCutout.classList.add('active');
        btnCutout.textContent = '✨ Đã tách phông AI';
      } else {
        if (img) img.classList.remove('ai-isolated');
        btnCutout.classList.remove('active');
        btnCutout.textContent = 'Phông ảnh gốc';
      }
    };
  }

  // 3D Mouse tilt on stage
  if (stage) {
    stage.addEventListener('mousemove', (e) => {
      if (popIsDragging) return;
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      popRotY = (x / (rect.width / 2)) * 18;
      popRotX = -(y / (rect.height / 2)) * 18;
      applyPopTransform();
    });

    stage.addEventListener('mouseleave', () => {
      if (popIsDragging) return;
      popRotX = 0;
      popRotY = 0;
      applyPopTransform();
    });

    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      popZoom = Math.min(3.5, Math.max(0.8, +(popZoom + delta).toFixed(2)));
      if (popZoom <= 1) { popPanX = 0; popPanY = 0; }
      applyPopTransform();
    }, { passive: false });

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

function initEvents(){
  initLightboxEvents();
  byId('search').addEventListener('input',render);
  byId('sort').onchange=render;
  byId('character').onchange=e=>{currentCharacter=e.target.value;render()};
  byId('gradeSelect').onchange=e=>{currentGrade=e.target.value;render()};
  byId('btnFavorites').onclick=()=>{favs=!favs;byId('btnFavorites').classList.toggle('active',favs);render()};
  byId('tierNav').addEventListener('click',e=>{const t=e.target.closest('[data-tier]');if(t){currentTier=t.dataset.tier;render()}});
  document.querySelector('.chips').addEventListener('click',e=>{const el=e.target.closest('[data-view]');if(el){view=el.dataset.view;render()}});
  
  document.addEventListener('click',e=>{
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
  });

  let hoveringTimer;
  document.addEventListener('pointerover',e=>{
    const el=e.target.closest('[data-hover]');
    if(!el)return;
    const c=catalog.find(c=>c.id===el.dataset.hover);
    if(c&&ebayReady&&!latest.has(c.id)){clearTimeout(hoveringTimer);hoveringTimer=setTimeout(()=>fetchLive(c),220)}
  });

  byId('drawerCover').onclick=closeDrawer;
  byId('modalCover').onclick=closeModal;
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      closeDrawer();
      closeModal();
      closeLightbox();
    }
  });

  byId('btnImport').onclick=openImport;
  byId('btnAdd').onclick=()=>editCard();
  byId('btnSync').onclick=syncCards;
  byId('btnReloadLive').onclick=scanVisible;
  byId('filepicker').onchange=async e=>{const f=e.target.files[0];if(f)await handleFile(f);e.target.value=''};
  byId('btnExport').onclick=()=>download('snorlax-munchlax-psa10-danh-muc-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(catalog,null,2));

  document.querySelectorAll('[data-cur]').forEach(b => {
    b.onclick = () => {
      currentCurrency = b.dataset.cur;
      document.querySelectorAll('[data-cur]').forEach(x => x.classList.toggle('active', x.dataset.cur === currentCurrency));
      render();
      if (activeCard) openDrawer(activeCard, false);
      toast('Đã đổi tiền tệ hiển thị sang: ' + (currentCurrency === 'VND' ? 'Việt Nam Đồng (₫)' : 'Đô la Mỹ ($)'));
    };
  });
}

async function boot(){
  try{base=JSON.parse(byId('SEED_DATA').textContent||'[]');}catch{}
  try{const r=await fetch('catalog.json');if(r.ok){const d=await r.json();if(Array.isArray(d)&&d.length)base=d}}catch{}
  try{
    localStorage.removeItem('snoratlas-catalog-v16');
    localStorage.removeItem('snoratlas-catalog-v17');
    localStorage.removeItem('snoratlas-catalog-v18');
    localStorage.removeItem('snoratlas-catalog-v19');
    localStorage.removeItem('snoratlas-catalog-v20');
  }catch{}
  const local=localStorage.getItem('snoratlas-catalog-v21');
  try{
    const old=JSON.parse(local);
    catalog=Array.isArray(old)&&old.length?old.map(c=>{
      const f=base.find(b=>b.id===c.id);
      if(f){
        c.pricecharting=f.pricecharting;
        c.manualPrice=f.manualPrice;
        c.psa10pop=f.psa10pop;
        c.psaTotal=f.psaTotal;
        if(f.image)c.image=f.image;
        if(f.notes)c.notes=f.notes;
        if(f.investmentThesis)c.investmentThesis=f.investmentThesis;
        if(f.seller)c.seller=f.seller;
        if(f.sellerHref)c.sellerHref=f.sellerHref;
        if(f.sellerBadge)c.sellerBadge=f.sellerBadge;
        if(f.listingUrl)c.listingUrl=f.listingUrl;
        if(f.listingPriceUSD)c.listingPriceUSD=f.listingPriceUSD;
      }
      return c;
    }):base;
  }catch{catalog=base;}
  try{settings=JSON.parse(localStorage.getItem('snoratlas-settings-v4')||'{}')}catch{}
  initEvents();
  render();
  setup3DTilt();
  try{
    const r=await fetch('/api/health');if(!r.ok)throw Error('offline');
    const d=await r.json();serverReady=true;ebayReady=true;
    byId('serverDot').classList.remove('off');
    byId('serverStatus').textContent='🟢 AI Sentinel Engine online';
    byId('lastStatus').textContent='Tự động tra giá eBay/PSA | Sẵn sàng';
  }catch{
    byId('serverStatus').textContent='HTML offline';
    byId('lastStatus').textContent='Mở bằng localhost để kích hoạt AI';
  }
  if(ebayReady){const first=filtered().slice(0,4);first.forEach(c=>fetchLive(c));}
}
boot();
</script>

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

</body>
</html>
`;

html = html.substring(0, cutPoint) + cleanTail;
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully re-integrated clean tail and Lightbox logic!');
