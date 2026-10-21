const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(INDEX_PATH, 'utf8');

const newRenderGradeRows = `function renderGradeRows(c){
 const breakdown=getPsaBreakdown(c);
 const curGradeNum = Number(c.grade || 10);
 const co = (c.slabCompany || 'PSA').toUpperCase();
 const isFanatics = c.listingUrl && c.listingUrl.includes('fanaticscollect.com');

 const targetGrades=[
  {grade:10,name:\`\${co} 10\`,condition:'Gem Mint / Pristine',color:'#3FCF8E',badgeBg:'#3FCF8E',textColor:'#000000'},
  {grade:9.5,name:\`\${co} 9.5\`,condition:'Mint+',color:'#38BDF8',badgeBg:'rgba(56,189,248,0.2)',textColor:'#38BDF8'},
  {grade:9,name:\`\${co} 9\`,condition:'Mint',color:'#72E3AD',badgeBg:'rgba(63,207,142,0.15)',textColor:'#72E3AD'},
  {grade:8,name:\`\${co} 8\`,condition:'NM-MT',color:'#F3BA63',badgeBg:'rgba(243,186,99,0.15)',textColor:'#F3BA63'},
  {grade:7,name:\`\${co} 7\`,condition:'Near Mint',color:'#DC7B18',badgeBg:'rgba(220,123,24,0.15)',textColor:'#DC7B18'}
 ];

 const gradesToShow = targetGrades.filter(tg => tg.grade !== 9.5 || curGradeNum === 9.5);

 return gradesToShow.map(tg=>{
  const isCurrent = Math.abs(curGradeNum - tg.grade) < 0.1;
  const popObj = breakdown.find(b=>b.grade.includes(String(tg.grade)))||{pop:0,rate:0};
  const cleanName = c.name.toLowerCase().replace(/\\s*\\((?:psa|cgc|bgs|sgc)\\s*[\\d.]+\\)/i,'').trim();
  const matched = catalog.find(x=>x.character===c.character && x.id!==c.id && (x.name.toLowerCase().replace(/\\s*\\((?:psa|cgc|bgs|sgc)\\s*[\\d.]+\\)/i,'').trim()===cleanName) && Math.abs(Number(x.grade)-tg.grade)<0.1);

  let priceUSD=null, priceNote='', actionUrl='', sellerInfo='', isRealListing=false;
  if(isCurrent){
   priceUSD = Number(c.listingPriceUSD || c.manualPrice || 0);
   priceNote = isFanatics ? '⚡ Listing Buy Now thật từ Fanatics Collect' : 'Listing thực tế đang xem';
   actionUrl = c.listingUrl || ebayLink(c);
   sellerInfo = c.seller || (isFanatics ? 'Fanatics Collect Vault' : 'Shop eBay');
   isRealListing = true;
  }else if(matched && (matched.listingPriceUSD || matched.manualPrice)){
   priceUSD = Number(matched.listingPriceUSD || matched.manualPrice);
   priceNote = \`Từ listing thực tế (\${matched.seller || (isFanatics ? 'Fanatics Collect' : 'Shop eBay')})\`;
   actionUrl = matched.listingUrl || ebayLink(matched);
   sellerInfo = matched.seller || 'Fanatics / eBay';
   isRealListing = true;
  }else{
   priceUSD = null;
   priceNote = 'Chưa có niêm yết Buy Now trực tiếp';
   if(isFanatics){
     actionUrl = \`https://www.fanaticscollect.com/marketplace?type=FIXED&q=\${encodeURIComponent(c.character + ' ' + cleanName)}\`;
     sellerInfo = 'Fanatics Search';
   }else{
     actionUrl = \`https://www.ebay.com/sch/i.html?_nkw=\${encodeURIComponent(c.character+' '+cleanName+' PSA '+tg.grade)}&LH_BIN=1&LH_Auction=0&rt=nc\`;
     sellerInfo = 'eBay Search';
   }
  }

  const vndFormatted = priceUSD != null ? Math.round(priceUSD*RATE_USD_VND).toLocaleString('vi-VN')+' ₫' : 'Chưa niêm yết';
  const usdFormatted = priceUSD != null ? \`(\$\${fmt.format(priceUSD)} USD)\` : '';

  return \`<div style="background:\${isCurrent?'var(--sb-surface-2)':'var(--sb-surface-1)'};border:\${isCurrent?'1px solid var(--sb-primary)':'1px solid var(--sb-border)'};border-radius:6px;padding:12px 14px;display:flex;flex-direction:column;gap:8px;box-shadow:\${isCurrent?'0 0 16px rgba(63,207,142,0.12)':'none'};">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="background:\${tg.badgeBg};color:\${tg.textColor};font-weight:700;font-size:11px;padding:2px 8px;border-radius:4px;font-family:var(--font-mono);">\${tg.name}</span>
        <span style="color:var(--sb-text-primary);font-weight:600;font-size:13px;font-family:var(--font-heading);">\${tg.condition}</span>
        \${isCurrent?'<span style="background:rgba(63,207,142,0.15);color:var(--sb-primary);font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;border:1px solid rgba(63,207,142,0.3);">ĐANG CHỌN SLAB NÀY</span>':''}
      </div>
      <div style="font-size:11px;color:var(--sb-text-secondary);font-family:var(--font-mono);">
        Population: <b style="color:\${tg.color};font-size:12px;">\${dec(popObj.pop)}</b> <span style="color:var(--sb-text-tertiary);">(\${popObj.rate}%)</span>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding-top:8px;border-top:1px solid var(--sb-border);">
      <div>
        <div style="font-size:15px;font-weight:700;color:\${isCurrent?'var(--sb-primary)':'var(--sb-text-primary)'};font-family:var(--font-mono);">
          \${vndFormatted} <span style="font-size:11px;font-weight:normal;color:var(--sb-text-secondary);">\${usdFormatted}</span>
        </div>
        <div style="font-size:11px;color:var(--sb-text-secondary);margin-top:2px;">\${priceNote} \${isRealListing ? \`| Nguồn: <span style="color:var(--sb-primary);font-weight:600;">\${esc(sellerInfo)}</span>\` : ''}</div>
      </div>
      <div>
        <a href="\${esc(actionUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;background:\${isCurrent?'var(--sb-primary)':'var(--sb-surface-3)'};color:\${isCurrent?'#000000':'var(--sb-text-primary)'};border:1px solid \${isCurrent?'var(--sb-primary)':'rgba(255,255,255,0.1)'};border-radius:6px;padding:6px 12px;font-size:11px;font-weight:600;text-decoration:none;">
          \${isCurrent ? (isFanatics ? '⚡ Mua ngay trên Fanatics ↗' : '🛒 Mua ngay listing này ↗') : (isFanatics ? \`🔍 Tìm \${tg.name} trên Fanatics ↗\` : \`🔍 Tìm \${tg.name} trên eBay ↗\`)}
        </a>
      </div>
    </div>
  </div>\`;
 }).join('');
}`;

// Replace renderGradeRows
const startMarker = 'function renderGradeRows(c){';
const endMarker = 'function renderArbitrageMatrix(c){';
const sIdx = html.indexOf(startMarker);
const eIdx = html.indexOf(endMarker);
if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx) + newRenderGradeRows + '\n\n' + html.substring(eIdx);
  console.log('Successfully replaced renderGradeRows!');
} else {
  console.error('Could not find renderGradeRows markers!');
}

fs.writeFileSync(INDEX_PATH, html, 'utf8');
console.log('Saved index.html with new clean renderGradeRows!');
