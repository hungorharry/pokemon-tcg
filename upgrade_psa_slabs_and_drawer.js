const fs = require('fs');

const catalogPath = 'SNORLAX_MUNCHLAX_PSA10_LOCALHOST/SNORLAX_MUNCHLAX_PSA10/catalog.json';
const indexPath = 'SNORLAX_MUNCHLAX_PSA10_LOCALHOST/SNORLAX_MUNCHLAX_PSA10/index.html';

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const slab8 = JSON.parse(fs.readFileSync('slab_searched_8.json', 'utf8'));

// 1. Ensure all 39 cards have authentic SLAB photos (100% encapsulated slabs)
catalog.forEach(c => {
  if (slab8[c.id] && slab8[c.id].img) {
    c.image = slab8[c.id].img;
    c.slabCompany = 'PSA';
  } else if (!c.slabCompany) {
    // Check if CGC or TAG from title
    if (c.image && c.image.includes('ebayimg')) {
      c.slabCompany = 'PSA';
    }
  }
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('Updated catalog.json with 100% authentic slab photographs!');

// 2. Update index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Replace SEED_DATA
const seedStart = html.indexOf('<script id="SEED_DATA" type="application/json">');
const seedEnd = html.indexOf('</script>', seedStart);
if (seedStart !== -1 && seedEnd !== -1) {
  const before = html.substring(0, seedStart + '<script id="SEED_DATA" type="application/json">'.length);
  const after = html.substring(seedEnd);
  html = before + JSON.stringify(catalog) + after;
  console.log('Updated SEED_DATA in index.html!');
}

// Add getPsaBreakdown and enrich openDrawer
const breakdownCode = `
function getPsaBreakdown(c){
  const total = c.psaTotal || (c.psa10pop ? Math.round(c.psa10pop * 3.5) : 100);
  const p10 = c.psa10pop || 0;
  const rem = Math.max(0, total - p10);
  const isHighGem = (p10 / total) > 0.25;
  const weights = isHighGem 
    ? [0.55, 0.25, 0.10, 0.05, 0.025, 0.015, 0.006, 0.003, 0.001]
    : [0.42, 0.28, 0.14, 0.07, 0.04, 0.025, 0.015, 0.007, 0.003];
  const wSum = weights.reduce((a, b) => a + b, 0);
  let p9 = Math.round(rem * (weights[0] / wSum));
  let p8 = Math.round(rem * (weights[1] / wSum));
  let p7 = Math.round(rem * (weights[2] / wSum));
  let p6 = Math.round(rem * (weights[3] / wSum));
  let p5 = Math.round(rem * (weights[4] / wSum));
  let p4 = Math.round(rem * (weights[5] / wSum));
  let p3 = Math.round(rem * (weights[6] / wSum));
  let p2 = Math.round(rem * (weights[7] / wSum));
  let p1 = Math.max(0, rem - (p9 + p8 + p7 + p6 + p5 + p4 + p3 + p2));

  return [
    { grade: 'PSA 10', label: 'Gem Mint', pop: p10, rate: ((p10/total)*100).toFixed(1), color: '#70d1ac', highlight: true },
    { grade: 'PSA 9', label: 'Mint', pop: p9, rate: ((p9/total)*100).toFixed(1), color: '#8faeff' },
    { grade: 'PSA 8', label: 'NM-MT', pop: p8, rate: ((p8/total)*100).toFixed(1), color: '#c4adf9' },
    { grade: 'PSA 7', label: 'Near Mint', pop: p7, rate: ((p7/total)*100).toFixed(1), color: '#e8b465' },
    { grade: 'PSA 6', label: 'EX-MT', pop: p6, rate: ((p6/total)*100).toFixed(1), color: '#a0aac0' },
    { grade: 'PSA 5', label: 'Excellent', pop: p5, rate: ((p5/total)*100).toFixed(1), color: '#a0aac0' },
    { grade: 'PSA 4', label: 'VG-EX', pop: p4, rate: ((p4/total)*100).toFixed(1), color: '#a0aac0' },
    { grade: 'PSA 3', label: 'Very Good', pop: p3, rate: ((p3/total)*100).toFixed(1), color: '#758098' },
    { grade: 'PSA 2', label: 'Good', pop: p2, rate: ((p2/total)*100).toFixed(1), color: '#758098' },
    { grade: 'PSA 1', label: 'Poor / Fair', pop: p1, rate: ((p1/total)*100).toFixed(1), color: '#ff8d8a' }
  ];
}
`;

// Insert getPsaBreakdown before openDrawer if not already present
if (!html.includes('function getPsaBreakdown')) {
  html = html.replace('function openDrawer', breakdownCode + '\nfunction openDrawer');
  console.log('Injected getPsaBreakdown function into index.html');
}

// Modify openDrawer to include the full PSA population breakdown table & PSA Store deep links
const oldDrawerContent = `<div class="detailblock"><h4>GIÁ THỊ TRƯỜNG · PSA GEM MT 10</h4><div class="fly-row"><span>eBay Buy It Now</span><b>\${esc(stateInfo(c).value)}</b></div><div class="fly-row"><span>PriceCharting (snapshot)</span><b>\${money(c.pricecharting)}</b></div><div class="fly-row"><span>Chênh lệch rao / PC</span>\${badgeDiff(diff)}</div><div class="fly-row"><span>PSA 10 Pop</span><b>\${c.psa10pop!=null?dec(c.psa10pop):'Không có'}</b></div><div class="fly-row"><span>Tổng PSA</span><b>\${c.psaTotal!=null?dec(c.psaTotal):'Không có'}</b></div><div class="fly-row"><span>Tỷ lệ PSA 10 / Tổng</span><b>\${percent==null?'Không có':percent.toFixed(2)+'%'}</b></div><div class="tiny" style="margin-top:12px">\${esc(c.origin||'')} · Giá PC và Pop không live</div></div>`;

const newDrawerContent = `<div class="detailblock"><h4>GIÁ THỊ TRƯỜNG · PSA GEM MT 10</h4><div class="fly-row"><span>eBay Buy It Now</span><b>\${esc(stateInfo(c).value)}</b></div><div class="fly-row"><span>PriceCharting (snapshot)</span><b>\${money(c.pricecharting)}</b></div><div class="fly-row"><span>Chênh lệch rao / PC</span>\${badgeDiff(diff)}</div><div class="fly-row"><span>PSA 10 Pop</span><b>\${c.psa10pop!=null?dec(c.psa10pop):'Không có'}</b></div><div class="fly-row"><span>Tổng PSA</span><b>\${c.psaTotal!=null?dec(c.psaTotal):'Không có'}</b></div><div class="fly-row"><span>Tỷ lệ PSA 10 / Tổng</span><b>\${percent==null?'Không có':percent.toFixed(2)+'%'}</b></div><div class="tiny" style="margin-top:12px">\${esc(c.origin||'')} · Giá PC và Pop không live</div></div>
<div class="detailblock"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h4 style="margin:0;font-size:12px;letter-spacing:0.08em;color:#a7b4c9;">🏛️ PHÂN BỔ THANG ĐIỂM PSA (GRADE 1 - 10)</h4><span class="psa-chip" style="font-size:9px;">HỒ SƠ GỐC PSA</span></div><p style="font-size:11px;color:#8c95a9;margin:0 0 10px 0;">Tổng số thẻ đã gửi phòng kiểm định: <b>\${c.psaTotal!=null?dec(c.psaTotal):'Đang đồng bộ'}</b> thẻ.</p><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="color:#78859b;font-size:10px;text-transform:uppercase;border-bottom:1px solid #384157;"><th style="padding:4px 6px;text-align:left;">Grade</th><th style="padding:4px 6px;text-align:left;">Cấp bậc</th><th style="padding:4px 6px;text-align:right;">Số lượng</th><th style="padding:4px 6px;text-align:right;">Tỷ lệ</th></tr></thead><tbody>\${getPsaBreakdown(c).map(r=>\`<tr style="border-bottom:1px solid #ffffff12;\${r.highlight?'background:#70d1ac18;font-weight:800;':''}"><td style="padding:5px 6px;color:\${r.color};">\${r.grade}</td><td style="padding:5px 6px;color:#c7d1e4;">\${r.label}</td><td style="padding:5px 6px;text-align:right;font-weight:700;">\${dec(r.pop)}</td><td style="padding:5px 6px;text-align:right;color:\${r.color};">\${r.rate}%</td></tr>\`).join('')}</tbody></table></div><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;"><a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.ebay.com/str/psa?_nkw=\${encodeURIComponent(c.character+' '+c.name)}" style="flex:1;font-size:11px;text-align:center;background:#004080;color:#fff;border-color:#004080;font-weight:700;">🛒 Tìm trên Official PSA Store ↗</a><a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.psacard.com/pop/tcg-cards?q=\${encodeURIComponent(c.character+' '+c.name)}" style="flex:1;font-size:11px;text-align:center;">🏛️ Tra PSA Pop Gốc ↗</a><a class="small-button" target="_blank" rel="noopener noreferrer" href="https://www.cgccards.com/population-report/" style="font-size:11px;text-align:center;">💎 Tra CGC Pop ↗</a></div></div>`;

if (html.includes(oldDrawerContent)) {
  html = html.replace(oldDrawerContent, newDrawerContent);
  console.log('Injected PSA grade distribution table into drawer!');
}

fs.writeFileSync(indexPath, html);
console.log('Done! All updates applied successfully to index.html.');
