const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Cập nhật thẻ <select id="sort"> với đầy đủ tùy chọn sort theo PriceCharting
const oldSortHtml = '<select id="sort" class="control"><option value="score">Điểm cao → thấp</option><option value="lowprice">Giá: thấp → cao</option><option value="pcprice">PriceCharting: thấp → cao</option><option value="scarcity">PSA 10 ít nhất</option><option value="year">Đời cũ nhất</option></select>';

const newSortHtml = `<select id="sort" class="control" style="font-weight:700;">
<option value="score">🏆 Điểm tiềm năng: Cao → Thấp</option>
<option value="pc_desc">📈 Giá PriceCharting: Cao → Thấp</option>
<option value="pc_asc">📉 Giá PriceCharting: Thấp → Cao</option>
<option value="price_desc">💎 Giá sàn Buy Now: Cao → Thấp</option>
<option value="price_asc">🏷️ Giá sàn Buy Now: Thấp → Cao</option>
<option value="deal">🔥 Săn Deal: Rẻ hơn PC nhiều nhất</option>
<option value="scarcity">👑 PSA 10 ít nhất (Pop hiếm)</option>
<option value="year_old">🕰️ Đời thẻ: Cổ nhất trước</option>
<option value="year_new">✨ Đời thẻ: Mới nhất trước</option>
</select>`;

if (html.includes(oldSortHtml)) {
  html = html.replace(oldSortHtml, newSortHtml);
  console.log('✓ Đã cập nhật dropdown #sort với các tùy chọn PriceCharting cao -> thấp & thấp -> cao.');
} else {
  // Regex fallback
  html = html.replace(/<select id="sort" class="control">[\s\S]*?<\/select>/, newSortHtml);
  console.log('✓ Đã thay thế regex dropdown #sort.');
}

// 2. Cập nhật hàm filtered()
const oldFilteredStart = 'arr.sort((a,b)=>sort===\'lowprice\'?(getBest(a)?.price??Infinity)-(getBest(b)?.price??Infinity):sort===\'pcprice\'?(a.pricecharting??Infinity)-(b.pricecharting??Infinity):sort===\'scarcity\'?(a.psa10pop??Infinity)-(b.psa10pop??Infinity):sort===\'year\'?(a.year??9999)-(b.year??9999):getScore(b)-getScore(a));return arr;';

const newFilteredSort = `arr.sort((a,b)=>{
   if(sort==='pc_desc') return (b.pricecharting??0) - (a.pricecharting??0);
   if(sort==='pc_asc'||sort==='pcprice') return (a.pricecharting??Infinity) - (b.pricecharting??Infinity);
   if(sort==='price_desc') return ((getBest(b)?.price)??0) - ((getBest(a)?.price)??0);
   if(sort==='price_asc'||sort==='lowprice') return ((getBest(a)?.price)??Infinity) - ((getBest(b)?.price)??Infinity);
   if(sort==='deal'){
     const dA=getDiff(a), dB=getDiff(b);
     if(dA===null && dB===null) return 0;
     if(dA===null) return 1;
     if(dB===null) return -1;
     return dA - dB;
   }
   if(sort==='scarcity') return (a.psa10pop??Infinity) - (b.psa10pop??Infinity);
   if(sort==='year_old'||sort==='year') return (a.year??9999) - (b.year??9999);
   if(sort==='year_new') return (b.year??0) - (a.year??0);
   return getScore(b) - getScore(a);
 });
 return arr;`;

if (html.includes(oldFilteredStart)) {
  html = html.replace(oldFilteredStart, newFilteredSort);
  console.log('✓ Đã nâng cấp thuật toán sắp xếp đa tiêu chí trong filtered().');
} else {
  console.log('Cảnh báo: không tìm thấy chuỗi arr.sort cũ chính xác, kiểm tra lại.');
}

// 3. Cập nhật renderDeckByGrades() để khi sort khác default (ví dụ sort theo PC), danh sách hiển thị tuần tự theo đúng thứ tự sắp xếp
const oldDeckStart = `function renderDeckByGrades(list){
  if(!list.length)return '<div class="empty"><h3>Không có thẻ phù hợp</h3><div>Thử đổi Tier, nhân vật hoặc từ khóa.</div></div>';
  if(currentGrade!=='all'){
    return \`<div class="deck">\${list.map(cardHtml).join('')}</div>\`;
  }`;

const newDeckStart = `function renderDeckByGrades(list){
  if(!list.length)return '<div class="empty"><h3>Không có thẻ phù hợp</h3><div>Thử đổi Tier, nhân vật hoặc từ khóa.</div></div>';
  const sort = byId('sort') ? byId('sort').value : 'score';
  if(currentGrade!=='all' || sort !== 'score'){
    return \`<div class="deck">\${list.map(cardHtml).join('')}</div>\`;
  }`;

if (html.includes(oldDeckStart)) {
  html = html.replace(oldDeckStart, newDeckStart);
  console.log('✓ Đã cập nhật renderDeckByGrades() hiển thị tuần tự chuẩn xác khi sort theo PC/Giá.');
} else {
  console.log('Cảnh báo: không tìm thấy oldDeckStart chính xác.');
}

// 4. Thêm pill hiển thị trạng thái sắp xếp trong resultMeta
const oldResultMetaSnippet = `<span class="meta-box highlight"><span class="dot" style="width:6px;height:6px;margin:0;background:#0A844E;"></span><b>\${dec(list.length)}</b> phiên bản PSA</span>`;
const newResultMetaSnippet = `<span class="meta-box highlight"><span class="dot" style="width:6px;height:6px;margin:0;background:#0A844E;"></span><b>\${dec(list.length)}</b> phiên bản PSA</span>
     <span class="meta-box" style="background:#ECFDF5;border-color:rgba(16,185,129,0.3);color:#047857;"><span>🔄</span> <b>\${({
       score:'Điểm tiềm năng',
       pc_desc:'Giá PC (Cao → Thấp)',
       pc_asc:'Giá PC (Thấp → Cao)',
       price_desc:'Giá sàn (Cao → Thấp)',
       price_asc:'Giá sàn (Thấp → Cao)',
       deal:'Săn Deal hời so với PC',
       scarcity:'PSA 10 khan hiếm',
       year_old:'Thẻ cổ nhất',
       year_new:'Thẻ mới nhất'
     })[byId('sort')?.value] || 'Điểm tiềm năng'}</b></span>`;

if (html.includes(oldResultMetaSnippet)) {
  html = html.replace(oldResultMetaSnippet, newResultMetaSnippet);
  console.log('✓ Đã thêm pill trạng thái sắp xếp vào resultMeta.');
}

// 5. Thêm highlight trong cardHtml() khi đang sort theo PriceCharting
const oldPcRef = `<div class="pc-ref"><div>PC: \${money(c.pricecharting, true)}</div><div id="delta-\${esc(c.id)}">\${badgeDiff(diff)}</div></div>`;
const newPcRef = `\${(byId('sort')?.value==='pc_desc'||byId('sort')?.value==='pc_asc') ? \`<div class="pc-ref" style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.4);border-radius:4px;padding:3px 6px;"><div style="font-weight:700;color:#0A844E;">📈 PC: \${money(c.pricecharting, true)}</div><div id="delta-\${esc(c.id)}">\${badgeDiff(diff)}</div></div>\` : \`<div class="pc-ref"><div>PC: \${money(c.pricecharting, true)}</div><div id="delta-\${esc(c.id)}">\${badgeDiff(diff)}</div></div>\`}`;

if (html.includes(oldPcRef)) {
  html = html.replace(oldPcRef, newPcRef);
  console.log('✓ Đã cập nhật highlight khung PC khi sort theo PriceCharting.');
}

// 6. Cho phép bấm vào header bảng table để sort
const oldTableHead = `<th>PriceCharting</th><th>eBay BIN</th>`;
const newTableHead = `<th style="cursor:pointer;color:#0A844E;user-select:none;" onclick="toggleTableSort('pc')" title="Bấm để đảo chiều sắp xếp theo PriceCharting">PriceCharting ↕</th><th style="cursor:pointer;color:#00529B;user-select:none;" onclick="toggleTableSort('price')" title="Bấm để đảo chiều sắp xếp theo Giá eBay">eBay BIN ↕</th>`;

if (html.includes(oldTableHead)) {
  html = html.replace(oldTableHead, newTableHead);
  console.log('✓ Đã thêm tính năng click header bảng để sort.');
}

// Thêm hàm toggleTableSort vào cuối script
const oldScriptEnd = `byId('sort').onchange=render;`;
const newScriptEnd = `byId('sort').onchange=render;
window.toggleTableSort = function(type) {
  const s = byId('sort');
  if(!s) return;
  if(type === 'pc') {
    s.value = s.value === 'pc_desc' ? 'pc_asc' : 'pc_desc';
  } else if(type === 'price') {
    s.value = s.value === 'price_desc' ? 'price_asc' : 'price_desc';
  }
  render();
};`;

if (html.includes(oldScriptEnd)) {
  html = html.replace(oldScriptEnd, newScriptEnd);
  console.log('✓ Đã gắn hàm toggleTableSort.');
}

// Ghi đè index.html đảm bảo UTF-8 không BOM
fs.writeFileSync(indexPath, html, { encoding: 'utf8' });
console.log('✓ Đã lưu index.html thành công!');
