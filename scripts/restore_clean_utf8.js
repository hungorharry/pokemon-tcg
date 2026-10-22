const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Bắt đầu phục hồi mã hóa UTF-8 chuẩn ---');

// 1. Phục hồi index.html từ commit 2f9427b~1 (commit f2d4c55 hoàn toàn sạch UTF-8)
let cleanHtml = execSync('git show 2f9427b~1:index.html', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });

// Đảm bảo không có BOM
if (cleanHtml.charCodeAt(0) === 0xFEFF) {
  cleanHtml = cleanHtml.slice(1);
}

// Cập nhật đường dẫn ưu tiên data/catalog/catalog.json trong boot()
cleanHtml = cleanHtml.replace(
  "try{const r=await fetch('catalog.json');if(r.ok){const d=await r.json();if(Array.isArray(d)&&d.length)base=d}}catch{}",
  "try{let r=await fetch('data/catalog/catalog.json').catch(()=>null);if(!r||!r.ok)r=await fetch('catalog.json');if(r&&r.ok){const d=await r.json();if(Array.isArray(d)&&d.length)base=d}}catch{}"
);

// Đảm bảo SEED_DATA chứa dữ liệu catalog chuẩn sạch
const catalogDataPath = fs.existsSync('data/catalog/catalog.json') ? 'data/catalog/catalog.json' : 'catalog.json';
const catalogJson = fs.readFileSync(catalogDataPath, 'utf8');
const catalogArr = JSON.parse(catalogJson);

const startTag = '<script id="SEED_DATA" type="application/json">';
const endTag = '</script>';
const sIdx = cleanHtml.indexOf(startTag);
if (sIdx !== -1) {
  const eIdx = cleanHtml.indexOf(endTag, sIdx);
  if (eIdx !== -1) {
    cleanHtml = cleanHtml.slice(0, sIdx + startTag.length) + JSON.stringify(catalogArr) + cleanHtml.slice(eIdx);
    console.log('✓ Đã đồng bộ SEED_DATA chuẩn sạch trong index.html (' + catalogArr.length + ' thẻ)');
  }
}

// Ghi file index.html dạng UTF-8 không BOM
fs.writeFileSync('index.html', cleanHtml, { encoding: 'utf8' });
console.log('✓ Đã phục hồi index.html sạch 100% tiếng Việt UTF-8 (không lỗi font).');

// 2. Sửa lỗi font trong ai-market-sentinel.js
let sentinel = fs.readFileSync('ai-market-sentinel.js', 'utf8');
if (sentinel.charCodeAt(0) === 0xFEFF) sentinel = sentinel.slice(1);

sentinel = sentinel.replace(/Báº¯t Ä‘áº§u chu trÃ¬nh quÃ©t vÃ  hiá»‡u chuáº©n dá»¯ liá»‡u toÃ n bá»™ danh má»¥c\.\.\./g, 'Bắt đầu chu trình quét và hiệu chuẩn dữ liệu toàn bộ danh mục...');
sentinel = sentinel.replace(/Ä Ã£ tá»± Ä‘á»™ng hiá»‡u chuáº©n (.*?) tháº» bÃ i vÃ  Ä‘á»“ng bá»™ sang index\.html thÃ nh cÃ´ng!/g, 'Đã tự động hiệu chuẩn $1 thẻ bài và đồng bộ sang index.html thành công!');
sentinel = sentinel.replace(/ToÃ n bá»™ 39 tháº» Ä‘Ã£ Ä‘áº¡t chuáº©n 100% \(GiÃ¡ chuáº©n eBay PSA 10, Pop chuáº©n, khÃ´ng cÃ³ lá»—i\)\./g, 'Toàn bộ 39 thẻ đã đạt chuẩn 100% (Giá chuẩn eBay PSA 10, Pop chuẩn, không có lỗi).');
sentinel = sentinel.replace(/KhÃ´ng tÃ¬m tháº¥y tháº» /g, 'Không tìm thấy thẻ ');

fs.writeFileSync('ai-market-sentinel.js', sentinel, { encoding: 'utf8' });
console.log('✓ Đã sửa log tiếng Việt trong ai-market-sentinel.js.');

// 3. Sửa lỗi font trong fanatics-scraper.js
let fanatics = fs.readFileSync('fanatics-scraper.js', 'utf8');
if (fanatics.charCodeAt(0) === 0xFEFF) fanatics = fanatics.slice(1);

fanatics = fanatics.replace(/Ä ang Ä‘á»“ng bá»™ danh má»¥c tháº» Fanatics Collect\.\.\./g, 'Đang đồng bộ danh mục thẻ Fanatics Collect...');
fanatics = fanatics.replace(/Ä Ã£ cáº­p nháº­t catalog\.json \(ThÃªm má»›i (.*?) tháº» tá»« Fanatics Collect, tá»•ng: (.*?) tháº»\)\./g, 'Đã cập nhật catalog.json (Thêm mới $1 thẻ từ Fanatics Collect, tổng: $2 thẻ).');
fanatics = fanatics.replace(/Ä Ã£ Ä‘á»“ng bá»™ SEED_DATA trong index\.html\./g, 'Đã đồng bộ SEED_DATA trong index.html.');

fs.writeFileSync('fanatics-scraper.js', fanatics, { encoding: 'utf8' });
console.log('✓ Đã sửa log tiếng Việt trong fanatics-scraper.js.');

console.log('--- Hoàn thành phục hồi mã hóa UTF-8 ---');
