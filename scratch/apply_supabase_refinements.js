const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Refine hoverHtml
html = html.replace(
  '<b style="color:#70d1ac;">${esc(c.seller||"Đang cập nhật")}</b>',
  '<b style="color:#3FCF8E;font-family:\'Source Code Pro\',monospace;">${esc(c.seller||"Đang cập nhật")}</b>'
);
html = html.replace(
  'style="color:#f0c68b;font-weight:700;">Xem listing trực tiếp ↗</a>',
  'style="color:#3FCF8E;font-weight:600;">Xem listing trực tiếp ↗</a>'
);

// 2. Refine cardHtml
const oldCardSeller = '<div style="font-size:11px;color:#70d1ac;font-weight:700;display:flex;align-items:center;gap:4px;margin:-2px 0 6px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="Người bán trên eBay: ${esc(c.seller||"Shop eBay")}"><span style="font-size:12px;">🏪</span> <span>${esc(c.seller||"Shop eBay")}</span></div>';
const newCardSeller = '<div style="font-size:11px;color:#3FCF8E;font-weight:600;display:flex;align-items:center;gap:4px;margin:-2px 0 6px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="Người bán trên eBay: ${esc(c.seller||"Shop eBay")}"><span style="font-size:12px;">🏪</span> <span>${esc(c.seller||"Shop eBay")}</span></div>';
html = html.replace(oldCardSeller, newCardSeller);

const oldThesisBox = '<div style="margin:6px 0 8px 0;background:#141926;padding:6px 8px;border-radius:6px;border-left:2px solid #e8b465;display:flex;gap:6px;align-items:flex-start;" title="${esc(c.investmentThesis || c.notes || \'\')}"><span style="font-size:12px;line-height:1.3;flex-shrink:0;">💡</span><span style="font-size:11px;color:#9eb0ce;line-height:1.35;max-height:2.7em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;">${esc(c.investmentThesis || c.notes || \'\')}</span></div>';
const newThesisBox = '<div style="margin:6px 0 8px 0;background:var(--sb-surface-1);padding:6px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);border-left:2px solid var(--sb-primary);display:flex;gap:6px;align-items:flex-start;" title="${esc(c.investmentThesis || c.notes || \'\')}"><span style="font-size:12px;line-height:1.3;flex-shrink:0;">💡</span><span style="font-size:11px;color:var(--sb-text-secondary);line-height:1.35;max-height:2.7em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;">${esc(c.investmentThesis || c.notes || \'\')}</span></div>';
html = html.replace(oldThesisBox, newThesisBox);

// 3. Refine renderDeckByGrades gradeMeta and header
const oldGradeMeta = `  const gradeMeta={
    10:{title:'🏆 PHÂN HẠNG PSA 10 | GEM MINT',desc:'Đỉnh cao phẩm cấp hoàn hảo tuyệt đối - Chuẩn mực đầu tư cao nhất',color:'#70d1ac',border:'#70d1ac55'},
    9:{title:'💎 PHÂN HẠNG PSA 9 | MINT',desc:'Cận hoàn hảo - Thanh khoản cao & Tối ưu ngân sách đầu tư',color:'#8faeff',border:'#8faeff55'},
    8:{title:'🌟 PHÂN HẠNG PSA 8 | NM-MT',desc:'Near Mint-Mint - Đẹp sưu tầm với giá thành tiếp cận rất tốt',color:'#c4adf9',border:'#c4adf955'},
    7:{title:'✨ PHÂN HẠNG PSA 7 | NEAR MINT',desc:'Thẻ cổ điển nguyên bản - Giá trị lưu giữ di sản thời gian',color:'#e8b465',border:'#e8b46555'}
  };`;

const newGradeMeta = `  const gradeMeta={
    10:{title:'🏆 PHÂN HẠNG PSA 10 | GEM MINT',desc:'Đỉnh cao phẩm cấp hoàn hảo tuyệt đối - Chuẩn mực đầu tư cao nhất',color:'#3FCF8E',border:'rgba(63, 207, 142, 0.35)'},
    9:{title:'💎 PHÂN HẠNG PSA 9 | MINT',desc:'Cận hoàn hảo - Thanh khoản cao & Tối ưu ngân sách đầu tư',color:'#72E3AD',border:'rgba(114, 227, 173, 0.35)'},
    8:{title:'🌟 PHÂN HẠNG PSA 8 | NM-MT',desc:'Near Mint-Mint - Đẹp sưu tầm với giá thành tiếp cận rất tốt',color:'#F3BA63',border:'rgba(243, 186, 99, 0.35)'},
    7:{title:'✨ PHÂN HẠNG PSA 7 | NEAR MINT',desc:'Thẻ cổ điển nguyên bản - Giá trị lưu giữ di sản thời gian',color:'#DC7B18',border:'rgba(220, 123, 24, 0.35)'}
  };`;
html = html.replace(oldGradeMeta, newGradeMeta);

const oldGradeSectionHtml = `html+=\`<div class="grade-section"><div class="grade-section-header" style="border:1px solid \${m.border};border-left:4px solid \${m.color};"><div><div style="font-size:14px;font-weight:900;color:\${m.color};letter-spacing:0.04em;">\${m.title}</div><div style="font-size:11px;color:#8a99b2;margin-top:2px;">\${m.desc}</div></div><div style="background:#090d15;border:1px solid #2d3b52;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:800;color:#d8e2f2;">\${dec(sub.length)} phiên bản</div></div><div class="deck">\${sub.map(cardHtml).join('')}</div></div>\`;`;
const newGradeSectionHtml = `html+=\`<div class="grade-section"><div class="grade-section-header" style="border:1px solid rgba(255,255,255,0.08);border-left:3px solid \${m.color};background:var(--sb-surface-1);border-radius:6px;padding:12px 16px;"><div><div style="font-size:13px;font-family:var(--font-heading);font-weight:700;color:\${m.color};letter-spacing:0.02em;">\${m.title}</div><div style="font-size:12px;color:var(--sb-text-secondary);margin-top:3px;">\${m.desc}</div></div><div style="background:var(--sb-surface-2);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:3px 10px;font-size:11px;font-family:var(--font-mono);font-weight:600;color:var(--sb-text-primary);">\${dec(sub.length)} phiên bản</div></div><div class="deck">\${sub.map(cardHtml).join('')}</div></div>\`;`;
html = html.replace(oldGradeSectionHtml, newGradeSectionHtml);

// 4. Refine getPsaBreakdown colors
const oldBreakdownColors = `    { grade: 'PSA 10', label: 'Gem Mint', pop: p10, rate: ((p10/total)*100).toFixed(1), color: '#70d1ac', highlight: c.grade===10 },
    { grade: 'PSA 9', label: 'Mint', pop: p9, rate: ((p9/total)*100).toFixed(1), color: '#8faeff', highlight: c.grade===9 },
    { grade: 'PSA 8', label: 'NM-MT', pop: p8, rate: ((p8/total)*100).toFixed(1), color: '#c4adf9', highlight: c.grade===8 },
    { grade: 'PSA 7', label: 'Near Mint', pop: p7, rate: ((p7/total)*100).toFixed(1), color: '#e8b465', highlight: c.grade===7 },
    { grade: 'PSA 6', label: 'EX-MT', pop: p6, rate: ((p6/total)*100).toFixed(1), color: '#a0aac0' },
    { grade: 'PSA 5', label: 'Excellent', pop: p5, rate: ((p5/total)*100).toFixed(1), color: '#a0aac0' },
    { grade: 'PSA 4', label: 'VG-EX', pop: p4, rate: ((p4/total)*100).toFixed(1), color: '#a0aac0' },
    { grade: 'PSA 3', label: 'Very Good', pop: p3, rate: ((p3/total)*100).toFixed(1), color: '#758098' },
    { grade: 'PSA 2', label: 'Good', pop: p2, rate: ((p2/total)*100).toFixed(1), color: '#758098' },
    { grade: 'PSA 1', label: 'Poor / Fair', pop: p1, rate: ((p1/total)*100).toFixed(1), color: '#ff8d8a' }`;

const newBreakdownColors = `    { grade: 'PSA 10', label: 'Gem Mint', pop: p10, rate: ((p10/total)*100).toFixed(1), color: '#3FCF8E', highlight: c.grade===10 },
    { grade: 'PSA 9', label: 'Mint', pop: p9, rate: ((p9/total)*100).toFixed(1), color: '#72E3AD', highlight: c.grade===9 },
    { grade: 'PSA 8', label: 'NM-MT', pop: p8, rate: ((p8/total)*100).toFixed(1), color: '#F3BA63', highlight: c.grade===8 },
    { grade: 'PSA 7', label: 'Near Mint', pop: p7, rate: ((p7/total)*100).toFixed(1), color: '#DC7B18', highlight: c.grade===7 },
    { grade: 'PSA 6', label: 'EX-MT', pop: p6, rate: ((p6/total)*100).toFixed(1), color: '#808080' },
    { grade: 'PSA 5', label: 'Excellent', pop: p5, rate: ((p5/total)*100).toFixed(1), color: '#808080' },
    { grade: 'PSA 4', label: 'VG-EX', pop: p4, rate: ((p4/total)*100).toFixed(1), color: '#808080' },
    { grade: 'PSA 3', label: 'Very Good', pop: p3, rate: ((p3/total)*100).toFixed(1), color: '#555555' },
    { grade: 'PSA 2', label: 'Good', pop: p2, rate: ((p2/total)*100).toFixed(1), color: '#555555' },
    { grade: 'PSA 1', label: 'Poor / Fair', pop: p1, rate: ((p1/total)*100).toFixed(1), color: '#ff6b6b' }`;
html = html.replace(oldBreakdownColors, newBreakdownColors);

// 5. Refine renderGradeRows
const oldTargetGrades = ` const targetGrades=[
  {grade:10,name:'PSA 10',condition:'Gem Mint',color:'#70d1ac',badgeBg:'#70d1ac',textColor:'#071710'},
  {grade:9,name:'PSA 9',condition:'Mint',color:'#8faeff',badgeBg:'#8faeff',textColor:'#091223'},
  {grade:8,name:'PSA 8',condition:'NM-MT',color:'#c4adf9',badgeBg:'#c4adf9',textColor:'#160e28'},
  {grade:7,name:'PSA 7',condition:'Near Mint',color:'#e8b465',badgeBg:'#e8b465',textColor:'#241703'}
 ];`;

const newTargetGrades = ` const targetGrades=[
  {grade:10,name:'PSA 10',condition:'Gem Mint',color:'#3FCF8E',badgeBg:'#3FCF8E',textColor:'#000000'},
  {grade:9,name:'PSA 9',condition:'Mint',color:'#72E3AD',badgeBg:'rgba(63,207,142,0.15)',textColor:'#72E3AD'},
  {grade:8,name:'PSA 8',condition:'NM-MT',color:'#F3BA63',badgeBg:'rgba(243,186,99,0.15)',textColor:'#F3BA63'},
  {grade:7,name:'PSA 7',condition:'Near Mint',color:'#DC7B18',badgeBg:'rgba(220,123,24,0.15)',textColor:'#DC7B18'}
 ];`;
html = html.replace(oldTargetGrades, newTargetGrades);

// 6. Refine grade ladder row render in renderGradeRows
const oldLadderRow = `  return \`<div style="background:\${isCurrent?'#1b2537':'#111722'};border:\${isCurrent?'2px solid #e8b465':'1px solid #283448'};border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:8px;box-shadow:\${isCurrent?'0 4px 14px rgba(232,180,101,0.2)':'none'};">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="background:\${tg.badgeBg};color:\${tg.textColor};font-weight:900;font-size:11px;padding:3px 8px;border-radius:5px;letter-spacing:0.04em;">\${tg.name}</span>
        <span style="color:#e2e8f0;font-weight:750;font-size:13px;">\${tg.condition}</span>
        \${isCurrent?'<span style="background:#70d1ac;color:#052414;font-size:10px;font-weight:900;padding:2px 7px;border-radius:4px;letter-spacing:0.04em;">● ĐANG CHỌN SLAB NÀY</span>':''}
      </div>
      <div style="font-size:11px;color:#94a3b8;">
        Population: <b style="color:\${tg.color};font-size:12px;">\${dec(popObj.pop)} thẻ</b> <span style="color:#64748b;">(\${popObj.rate}%)</span>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding-top:7px;border-top:1px dashed #243044;">
      <div>
        <div style="font-size:16px;font-weight:900;color:\${isCurrent?'#e8b465':'#f1f5f9'};">
          \${vndFormatted} <span style="font-size:12px;font-weight:normal;color:#94a3b8;">(\${usdFormatted} USD)</span>
        </div>
        <div style="font-size:10px;color:#7888a3;">\${priceNote} | Nguồn: <span style="color:#70d1ac;font-weight:600;">\${esc(sellerInfo)}</span></div>
      </div>
      <div>
        <a href="\${esc(actionUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;background:\${isCurrent?'#e8b465':'#1e2838'};color:\${isCurrent?'#0b0f17':'#dee5f2'};border:1px solid \${isCurrent?'#e8b465':'#3e4f6a'};border-radius:7px;padding:6px 12px;font-size:11px;font-weight:800;text-decoration:none;">
          \${isCurrent?'🛒 Mua ngay listing này ↗':\`🔍 Tìm \${tg.name} trên eBay ↗\`}
        </a>
      </div>
    </div>
  </div>\`;`;

const newLadderRow = `  return \`<div style="background:\${isCurrent?'var(--sb-surface-2)':'var(--sb-surface-1)'};border:\${isCurrent?'1px solid var(--sb-primary)':'1px solid rgba(255,255,255,0.08)'};border-radius:6px;padding:12px 14px;display:flex;flex-direction:column;gap:8px;box-shadow:\${isCurrent?'0 0 16px rgba(63,207,142,0.12)':'none'};">
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
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);">
      <div>
        <div style="font-size:15px;font-weight:700;color:\${isCurrent?'var(--sb-primary)':'var(--sb-text-primary)'};font-family:var(--font-mono);">
          \${vndFormatted} <span style="font-size:11px;font-weight:normal;color:var(--sb-text-secondary);">(\${usdFormatted} USD)</span>
        </div>
        <div style="font-size:11px;color:var(--sb-text-secondary);margin-top:2px;">\${priceNote} | Nguồn: <span style="color:var(--sb-primary);font-weight:600;">\${esc(sellerInfo)}</span></div>
      </div>
      <div>
        <a href="\${esc(actionUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;background:\${isCurrent?'var(--sb-primary)':'var(--sb-surface-3)'};color:\${isCurrent?'#000000':'var(--sb-text-primary)'};border:1px solid \${isCurrent?'var(--sb-primary)':'rgba(255,255,255,0.1)'};border-radius:6px;padding:6px 12px;font-size:11px;font-weight:600;text-decoration:none;">
          \${isCurrent?'🛒 Mua ngay listing này ↗':\`🔍 Tìm \${tg.name} trên eBay ↗\`}
        </a>
      </div>
    </div>
  </div>\`;`;
html = html.replace(oldLadderRow, newLadderRow);

// 7. Refine drawer 3D stage and detail blocks
html = html.replace(
  'background:radial-gradient(circle at 50% 35%,#1c2637,#0b1019 75%);border:1px solid #28374d;',
  'background:radial-gradient(circle at 50% 35%,#1C1C1C,#121212 85%);border:1px solid rgba(255,255,255,0.08);'
);
html = html.replace(
  'background:rgba(9,13,20,0.88);backdrop-filter:blur(6px);border:1px solid #2d3b52;border-radius:6px;',
  'background:rgba(23,23,23,0.9);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);border-radius:6px;'
);
html = html.replace(
  'background:rgba(9,13,20,0.88);padding:3px;border-radius:8px;border:1px solid #2d3b52;',
  'background:rgba(23,23,23,0.9);padding:3px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);'
);
html = html.replace(
  'background:#1b2332;border:none;color:#cbd5e1;border-radius:5px;width:26px;height:26px;font-weight:900;display:grid;place-items:center;cursor:pointer;',
  'background:#242424;border:1px solid rgba(255,255,255,0.08);color:#EDEDED;border-radius:4px;width:26px;height:26px;font-weight:700;display:grid;place-items:center;cursor:pointer;'
);
html = html.replace(
  'background:#1b2332;border:none;color:#e8b465;border-radius:5px;padding:0 8px;height:26px;font-size:11px;font-weight:800;cursor:pointer;',
  'background:#242424;border:1px solid rgba(255,255,255,0.08);color:#3FCF8E;border-radius:4px;padding:0 8px;height:26px;font-size:11px;font-weight:700;cursor:pointer;'
);
html = html.replace(
  'background:#1b2332;border:none;color:#cbd5e1;border-radius:5px;width:26px;height:26px;font-weight:900;display:grid;place-items:center;cursor:pointer;',
  'background:#242424;border:1px solid rgba(255,255,255,0.08);color:#EDEDED;border-radius:4px;width:26px;height:26px;font-weight:700;display:grid;place-items:center;cursor:pointer;'
);

// Detail block 1: Investment Thesis
html = html.replace(
  'background:linear-gradient(135deg,rgba(232,180,101,0.12),rgba(112,209,172,0.08));border:1px solid rgba(232,180,101,0.35);border-radius:8px;padding:12px 14px;margin-bottom:12px;',
  'background:var(--sb-surface-1);border:1px solid rgba(255,255,255,0.08);border-left:3px solid var(--sb-primary);border-radius:6px;padding:12px 14px;margin-bottom:12px;'
);
html = html.replace(
  'color:#e8b465;text-transform:uppercase;font-weight:900;',
  'color:var(--sb-primary);text-transform:uppercase;font-weight:700;font-family:var(--font-heading);'
);

// Detail block 2: eBay Listing
html = html.replace(
  'background:linear-gradient(145deg, #111a27, #0b111a);border:1px solid #233b5c;border-radius:10px;padding:14px;margin-bottom:14px;',
  'background:var(--sb-surface-1);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:14px;margin-bottom:14px;'
);
html = html.replace(
  '<h4 style="margin:0;font-size:11px;letter-spacing:0.08em;color:#70d1ac;text-transform:uppercase;font-weight:900;">📦 LISTING ĐANG BÁN THỰC TẾ TRÊN EBAY</h4>',
  '<h4 style="margin:0;font-size:11px;letter-spacing:0.08em;color:var(--sb-primary);text-transform:uppercase;font-weight:700;font-family:var(--font-heading);">📦 LISTING ĐANG BÁN THỰC TẾ TRÊN EBAY</h4>'
);
html = html.replace(
  '<b style="color:#e8b465;font-size:15px;font-weight:900;">${moneyDual(c.listingPriceUSD || c.manualPrice)}</b>',
  '<b style="color:var(--sb-accent-orange);font-size:15px;font-weight:700;font-family:var(--font-mono);">${moneyDual(c.listingPriceUSD || c.manualPrice)}</b>'
);

// Detail block 3: Comparison
html = html.replace(
  'background:#0c121c;border:1px solid #23354d;border-radius:12px;padding:14px;margin-bottom:14px;',
  'background:var(--sb-surface-1);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:14px;margin-bottom:14px;'
);
html = html.replace(
  'color:#e8b465;text-transform:uppercase;font-weight:900;">🏛️ SO SÁNH GIÁ CÁC CẤP BẬC',
  'color:var(--sb-primary);text-transform:uppercase;font-weight:700;font-family:var(--font-heading);">🏛️ SO SÁNH GIÁ CÁC CẤP BẬC'
);

// Detail block 4: PSA Priority store row
html = html.replace(
  '<div class="fly-row" style="background:#00408020;padding:6px 8px;border-radius:6px;margin:4px 0 6px 0;"><span>🏪 Thứ tự ưu tiên Shop</span><b style="color:#70d1ac;font-size:11px;">1. PSA Store ➔ 2. Top Vaults ➔ 3. Top-Rated Plus</b></div>',
  '<div class="fly-row" style="background:var(--sb-surface-2);border:1px solid rgba(255,255,255,0.06);padding:6px 10px;border-radius:4px;margin:6px 0;"><span>🏪 Thứ tự ưu tiên Shop</span><b style="color:var(--sb-primary);font-size:11px;font-family:var(--font-mono);">1. PSA Store ➔ 2. Top Vaults ➔ 3. Top-Rated Plus</b></div>'
);

// Buttons in Drawer
html = html.replace(
  'background:#004080;color:#fff;border-color:#004080;font-weight:700;',
  'background:var(--sb-surface-2);color:var(--sb-primary);border:1px solid var(--sb-primary);font-weight:600;'
);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully applied Supabase UI/UX refinements to index.html!');
