const fs = require('fs');
const path = require('path');

const steps = [4941, 4947, 4949, 4951, 4953];
let totalRaw = [];
for (const s of steps) {
  const p = 'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/' + s + '/output.txt';
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf8');
  const ranIdx = content.indexOf('### Ran Playwright code');
  const end = ranIdx !== -1 ? content.lastIndexOf(']', ranIdx) : content.lastIndexOf(']');
  const start = content.indexOf('[');
  if (start !== -1 && end > start) {
    const list = JSON.parse(content.substring(start, end + 1));
    totalRaw.push(...list);
  }
}

// Deduplicate by id
const seen = new Set();
const unique = [];
for (const it of totalRaw) {
  if (!it.id || seen.has(it.id)) continue;
  seen.add(it.id);
  unique.push(it);
}

console.log('Unique scraped items:', unique.length);

function parseCard(raw, index) {
  const title = (raw.title || '').trim();
  const url = raw.directUrl || `https://www.fanaticscollect.com/buy-now/${raw.id}/${raw.slug}`;
  const price = Number(raw.priceUSD) || 50;
  const image = raw.image || '';

  let slabCompany = 'PSA';
  if (/\b(cgc)\b/i.test(title)) slabCompany = 'CGC';
  else if (/\b(bgs|beckett)\b/i.test(title)) slabCompany = 'BGS';
  else if (/\b(sgc)\b/i.test(title)) slabCompany = 'SGC';

  let grade = 10;
  let gradeLabel = slabCompany + ' 10 GEM MINT';
  const gradeMatch = title.match(/(?:PSA|CGC|BGS|SGC)\s*([0-9]+(?:\.[0-9]+)?)\s*([A-Za-z\s+]+)?/i);
  if (gradeMatch) {
    grade = Number(gradeMatch[1]);
    const cond = (gradeMatch[2] || '').trim();
    gradeLabel = (slabCompany + ' ' + grade + ' ' + cond).trim();
  }

  const character = /munchlax/i.test(title) ? 'Munchlax' : 'Snorlax';

  const yearMatch = title.match(/\b(199[0-9]|20[0-2][0-9])\b/);
  const year = yearMatch ? Number(yearMatch[1]) : 2020;

  let set = 'Pokemon Collection';
  if (/jungle/i.test(title)) set = 'Jungle';
  else if (/vending/i.test(title)) set = 'Japanese Vending Series';
  else if (/legendary collection/i.test(title)) set = 'Legendary Collection';
  else if (/team rocket/i.test(title)) set = 'EX Team Rocket Returns';
  else if (/skyridge/i.test(title)) set = 'Skyridge';
  else if (/dragon frontiers/i.test(title)) set = 'EX Dragon Frontiers';
  else if (/domino/i.test(title)) set = "Domino's Pizza Promo";
  else if (/corocoro/i.test(title)) set = 'CoroCoro Promo';
  else if (/van gogh/i.test(title)) set = 'Van Gogh Museum Promo';
  else if (/151/i.test(title)) set = 'Scarlet & Violet 151';
  else if (/team up|tag team|tag bolt/i.test(title)) set = 'Sun & Moon Team Up';
  else if (/black & white|bw/i.test(title)) set = 'Black & White';
  else if (/diamond & pearl|dp|platinum|rising rivals/i.test(title)) set = 'Diamond & Pearl / Platinum';
  else if (/sword & shield|swsh/i.test(title)) set = 'Sword & Shield';
  else if (/scarlet & violet|sv/i.test(title)) set = 'Scarlet & Violet';

  let variant = 'Standard Holo';
  if (/1st edition/i.test(title)) variant = '1st Edition Holo';
  else if (/reverse holo/i.test(title)) variant = 'Reverse Holo';
  else if (/no set symbol/i.test(title)) variant = 'No Set Symbol Error';
  else if (/pristine/i.test(title)) variant = 'Pristine 10 Gold Label';
  else if (/crosshatch/i.test(title)) variant = 'Crosshatch Holo League Promo';
  else if (/full art/i.test(title)) variant = 'Full Art';
  else if (/alt art|special art/i.test(title)) variant = 'Special Illustration Rare';
  else if (/master ball/i.test(title)) variant = 'Master Ball Mirror Holo';

  let cleanName = title
    .replace(/\b(199[0-9]|20[0-2][0-9])\s*/gi, '')
    .replace(/\bpokemon\s*/gi, '')
    .replace(/(?:PSA|CGC|BGS|SGC)\s*[0-9]+(?:\.[0-9]+)?.*$/gi, '')
    .replace(/#\s*[0-9A-Za-z-]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleanName) cleanName = character + ' ' + set;

  let score = 70;
  if (year <= 2000) score += 15;
  else if (year <= 2004) score += 12;
  else if (year <= 2010) score += 8;
  else if (year <= 2019) score += 4;

  if (/1st edition|no set symbol|pristine/i.test(title)) score += 10;
  if (/reverse holo|gold|secret|lv\.?x|\bex\b|crosshatch/i.test(title)) score += 6;
  if (/domino|corocoro|van gogh|cd promo|master ball/i.test(title)) score += 8;

  if (grade === 10) score += 8;
  else if (grade >= 9.5) score += 4;
  else if (grade === 9) score -= 2;
  else if (grade === 8) score -= 8;
  else if (grade === 7) score -= 14;
  else score -= 20;

  score = Math.max(45, Math.min(98, score));

  let investmentThesis = 'Thẻ ' + character + ' (' + year + ') thuộc bộ ' + set + ' (' + variant + '). Niêm yết MUA NGAY tại Fanatics Collect với chứng nhận ' + gradeLabel + '. ';
  if (score >= 90) {
    investmentThesis += 'Thuộc phân hạng S-Tier siêu phẩm Grail với tiềm năng giữ giá và tính thanh khoản hàng đầu.';
  } else if (score >= 80) {
    investmentThesis += 'Định vị A-Tier cốt lõi dài hạn, thẻ slab chuẩn mực cho bộ sưu tập cao cấp.';
  } else if (score >= 70) {
    investmentThesis += 'B-Tier tiềm năng tốt, định giá niêm yết cạnh tranh trên thị trường thẻ slab quốc tế.';
  } else {
    investmentThesis += 'Theo dõi biến động và so sánh với giá giao dịch gần nhất để chốt điểm vào tối ưu.';
  }

  const priceVND = Math.round(price * 25460);

  return {
    id: 'fc-' + character.toLowerCase() + '-' + String(index + 1).padStart(3, '0'),
    fanaticsId: raw.id,
    name: cleanName,
    character,
    year,
    set,
    variant,
    grade,
    gradeLabel,
    slabCompany,
    tierScore: score,
    pricecharting: raw.estUSD || price,
    manualPrice: price,
    listingPriceUSD: price,
    image,
    origin: 'Fanatics Collect Verified Buy Now',
    researched: true,
    notes: 'Listing Buy Now trực tiếp tại sàn Fanatics Collect: "' + title + '". Giá niêm yết thật: $' + price.toLocaleString() + ' (~' + priceVND.toLocaleString('vi-VN') + ' ₫). Tình trạng: ' + gradeLabel + '.',
    investmentThesis,
    seller: 'Fanatics Collect Vault',
    sellerHref: 'https://www.fanaticscollect.com',
    sellerBadge: '⚡ Fanatics Collect Buy Now',
    listingUrl: url,
    listingTitle: title,
    listingType: 'BUY_NOW',
    bids: 0
  };
}

const gradedOnly = unique.filter(x => /\b(psa|cgc|bgs|beckett|sgc)\b/i.test(x.title || '') && x.priceUSD > 0 && x.image);
console.log('Valid graded items with price and image:', gradedOnly.length);

const parsed = gradedOnly.map((g, idx) => parseCard(g, idx));
const targetCard = parsed.find(p => p.fanaticsId === '3ce1c684-7c20-43ad-9167-231249aaaaff');
console.log('Target card check:');
console.log(targetCard);

fs.writeFileSync(path.join(__dirname, 'fanatics_buynow_all.json'), JSON.stringify(parsed, null, 2));
console.log('Saved fanatics_buynow_all.json successfully!');
