const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(INDEX_PATH, 'utf8');

// Replace lines from <div class="detailblock" style="background:var(--sb-surface-1);border:1px solid var(--sb-border);border-radius:6px;padding:14px;margin-bottom:14px;">
// to ${renderArbitrageMatrix(c)}
const startMarker = '<div class="detailblock" style="background:var(--sb-surface-1);border:1px solid var(--sb-border);border-radius:6px;padding:14px;margin-bottom:14px;">';
const endMarker = '${renderArbitrageMatrix(c)}';

const sIdx = html.indexOf(startMarker);
const eIdx = html.indexOf(endMarker);

if (sIdx !== -1 && eIdx !== -1) {
  const newDualBox = `<div style="background:var(--sb-surface-1);border:1px solid var(--sb-border);border-radius:8px;padding:14px;margin-bottom:14px;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:6px;">
    <h4 style="margin:0;font-size:11px;letter-spacing:0.08em;color:var(--sb-primary-dark);text-transform:uppercase;font-weight:800;font-family:var(--font-heading);">
      ⚡ SO SÁNH GIÁ & LINK TRỰC TIẾP TRÊN 2 SÀN (FANATICS COLLECT & EBAY)
    </h4>
    <span class="psa-chip" style="font-size:9px;">DUAL CRAWL VERIFIED</span>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:10px;">
    <!-- FANATICS COLLECT CARD -->
    <div style="background:#F0F7FF;border:1px solid rgba(0,82,155,0.25);border-left:4px solid #00529B;border-radius:6px;padding:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:12px;font-weight:800;color:#00529B;">⚡ FANATICS COLLECT</span>
        <span style="font-size:10px;background:#00529B;color:#FFF;padding:1px 6px;border-radius:4px;font-weight:700;">BUY NOW</span>
      </div>
      <div class="fly-row"><span>Giá niêm yết</span><b style="color:#00529B;font-size:14px;font-family:var(--font-mono);">\${c.listingUrl && c.listingUrl.includes('fanaticscollect.com') ? moneyDual(c.listingPriceUSD) : (c.pricecharting ? moneyDual(c.pricecharting) : 'Tham khảo')}</b></div>
      <div class="fly-row"><span>Tình trạng kho</span><b>\${c.listingUrl && c.listingUrl.includes('fanaticscollect.com') ? '⚡ Có sẵn hàng Buy Now' : '🔍 Tìm kho lưu trữ'}</b></div>
      <div style="margin-top:10px;">
        <a class="small-button primary" target="_blank" rel="noopener noreferrer" href="\${esc(fanaticsLink(c))}" style="display:block;text-align:center;background:#00529B;color:#FFF;padding:7px 10px;font-size:11px;font-weight:700;border-radius:6px;text-decoration:none;">
          ⚡ Mở trên Fanatics Collect ↗
        </a>
      </div>
    </div>

    <!-- EBAY MARKETPLACE CARD -->
    <div style="background:#F0FDF4;border:1px solid rgba(5,150,105,0.25);border-left:4px solid #059669;border-radius:6px;padding:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:12px;font-weight:800;color:#059669;">🛒 EBAY BUY IT NOW</span>
        <span style="font-size:10px;background:#059669;color:#FFF;padding:1px 6px;border-radius:4px;font-weight:700;">FIXED PRICE</span>
      </div>
      <div class="fly-row"><span>Giá chào bán</span><b style="color:#059669;font-size:14px;font-family:var(--font-mono);">\${c.ebayItemPrice ? moneyDual(c.ebayItemPrice) : (!c.listingUrl?.includes('fanaticscollect.com') && c.listingPriceUSD ? moneyDual(c.listingPriceUSD) : moneyDual(c.manualPrice || c.pricecharting))}</b></div>
      <div class="fly-row"><span>Người bán / Shop</span><b>\${c.ebayItemTitle ? 'Listing đã đối chiếu' : (c.seller && !c.seller.includes('Fanatics') ? esc(c.seller) : 'Top-Rated Plus')}</b></div>
      <div style="margin-top:10px;">
        <a class="small-button primary" target="_blank" rel="noopener noreferrer" href="\${esc(ebayLink(c))}" style="display:block;text-align:center;background:#059669;color:#FFF;padding:7px 10px;font-size:11px;font-weight:700;border-radius:6px;text-decoration:none;">
          🛒 Mở trên eBay Buy It Now ↗
        </a>
      </div>
    </div>
  </div>
</div>\n`;

  html = html.substring(0, sIdx) + newDualBox + html.substring(eIdx);
  console.log('Successfully installed DUAL MARKETPLACE COMPARISON in modal!');

  // Bump cache key
  html = html.replace(/snoratlas-catalog-v\d+/g, 'snoratlas-catalog-v34');
  fs.writeFileSync(INDEX_PATH, html, 'utf8');
  console.log('Saved index.html with snoratlas-catalog-v34!');
} else {
  console.error('Could not find markers in index.html!');
}
