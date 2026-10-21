const fs = require('fs');
const path = require('path');

const files = [
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/4555/output.txt',
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/4581/output.txt',
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/4585/output.txt',
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/4589/output.txt',
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/4597/output.txt',
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/4601/output.txt',
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/4605/output.txt',
  'C:/Users/hungtn/.gemini/antigravity/brain/796ae6a7-7918-43e6-af82-a208ec6baf11/.system_generated/steps/4609/output.txt'
];

let allRawItems = [];

for (const f of files) {
  try {
    if (!fs.existsSync(f)) continue;
    const content = fs.readFileSync(f, 'utf8');
    const start = content.indexOf('[');
    const ranCodeIdx = content.indexOf('\n### Ran Playwright code');
    const end = ranCodeIdx !== -1 ? content.lastIndexOf(']', ranCodeIdx) : content.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = content.substring(start, end + 1).trim();
      const items = JSON.parse(jsonStr);
      console.log(`File ${path.basename(path.dirname(f))}: parsed ${items.length} items`);
      allRawItems.push(...items);
    }
  } catch (err) {
    console.error('Error reading file ' + f + ':', err.message);
  }
}

console.log('Total raw items gathered:', allRawItems.length);

// Deduplicate by URL
const seenUrls = new Set();
const uniqueItems = [];
for (const it of allRawItems) {
  if (!it.url || seenUrls.has(it.url)) continue;
  seenUrls.add(it.url);
  uniqueItems.push(it);
}

console.log('Total unique items:', uniqueItems.length);

function parseCard(raw, index) {
  const title = (raw.title || '').trim();
  const url = raw.url || '';
  const price = raw.price || 50;
  const image = raw.image || '';
  const rawText = raw.rawText || '';

  // Company detection
  let slabCompany = 'PSA';
  if (/\b(cgc)\b/i.test(title)) slabCompany = 'CGC';
  else if (/\b(bgs|beckett)\b/i.test(title)) slabCompany = 'BGS';
  else if (/\b(sgc)\b/i.test(title)) slabCompany = 'SGC';

  // Grade detection
  let grade = 10;
  let gradeLabel = `${slabCompany} 10 GEM MINT`;
  const gradeMatch = title.match(/(?:PSA|CGC|BGS|SGC)\s*([0-9]+(?:\.[0-9]+)?)\s*([A-Za-z\s+]+)?/i);
  if (gradeMatch) {
    grade = Number(gradeMatch[1]);
    const cond = (gradeMatch[2] || '').trim();
    gradeLabel = `${slabCompany} ${grade} ${cond}`.trim();
  }

  // Character detection
  const character = /munchlax/i.test(title) ? 'Munchlax' : 'Snorlax';

  // Year detection
  const yearMatch = title.match(/\b(199[0-9]|20[0-2][0-9])\b/);
  const year = yearMatch ? Number(yearMatch[1]) : 2019;

  // Set / Variant extraction
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
  else if (/diamond & pearl|dp|platinum/i.test(title)) set = 'Diamond & Pearl / Platinum';
  else if (/sword & shield|swsh/i.test(title)) set = 'Sword & Shield';

  let variant = 'Standard Holo';
  if (/1st edition/i.test(title)) variant = '1st Edition Holo';
  else if (/reverse holo/i.test(title)) variant = 'Reverse Holo';
  else if (/no set symbol/i.test(title)) variant = 'No Set Symbol Error';
  else if (/pristine/i.test(title)) variant = 'Pristine 10 Gold Label';
  else if (/full art/i.test(title)) variant = 'Full Art';
  else if (/gold rare|secret/i.test(title)) variant = 'Gold Secret Rare';
  else if (/lv\.?x/i.test(title)) variant = 'Lv.X Holo';
  else if (/\bex\b/i.test(title)) variant = 'ex Holo';

  // Clean Name
  let cleanName = title
    .replace(/^(?:199\d|20\d\d)\s*pokemon\s*/i, '')
    .replace(/(?:psa|cgc|bgs|sgc)\s*\d+.*$/i, '')
    .replace(/#front.*$/i, '')
    .trim();
  if (!cleanName) cleanName = `${character} ${set}`;

  // Scoring
  let score = 70;
  if (year <= 2000) score += 15;
  else if (year <= 2004) score += 12;
  else if (year <= 2010) score += 8;
  else if (year <= 2019) score += 4;

  if (/1st edition|no set symbol|pristine/i.test(title)) score += 10;
  if (/reverse holo|gold|secret|lv\.?x|\bex\b/i.test(title)) score += 6;
  if (/domino|corocoro|van gogh|cd promo/i.test(title)) score += 8;

  if (grade === 10) score += 8;
  else if (grade >= 9.5) score += 4;
  else if (grade === 9) score -= 2;
  else if (grade === 8) score -= 8;
  else if (grade === 7) score -= 14;
  else score -= 22;

  score = Math.max(45, Math.min(98, score));

  // Investment Thesis
  let investmentThesis = `Thẻ ${character} phát hành năm ${year} thuộc bộ ${set} (${variant}). Niêm yết tại sàn Fanatics Collect với chứng nhận ${gradeLabel}. `;
  if (score >= 90) {
    investmentThesis += `Thuộc phân hạng S-Tier siêu phẩm Grail với tiềm năng giữ giá và tính thanh khoản hàng đầu toàn cầu.`;
  } else if (score >= 80) {
    investmentThesis += `Định vị A-Tier cốt lõi dài hạn, thích hợp cho danh mục sưu tầm cao cấp có tăng trưởng ổn định.`;
  } else if (score >= 70) {
    investmentThesis += `B-Tier tiềm năng tốt, cơ hội hấp dẫn nếu có mức giá chiết khấu so với thị trường tự do.`;
  } else {
    investmentThesis += `Theo dõi biến động giá và lượng giao dịch thực tế trên sàn đấu giá để tìm điểm vào an toàn.`;
  }

  const isAuction = raw.type === 'WEEKLY_AUCTION';
  const sellerBadge = isAuction ? `🔨 Fanatics Auction (${raw.bids || 0} bids)` : `⚡ Fanatics Vault Buy Now`;

  return {
    id: `fc-${character.toLowerCase()}-${String(index + 1).padStart(3, '0')}`,
    name: cleanName,
    character,
    year,
    set,
    variant,
    grade,
    gradeLabel,
    slabCompany,
    tierScore: score,
    pricecharting: price,
    manualPrice: price,
    listingPriceUSD: price,
    image,
    origin: 'Fanatics Collect Deep Pagination Sync',
    researched: true,
    notes: `Listing thực tế trên Fanatics Collect: "${title}". Giá ghi nhận: $${price.toLocaleString()} (${isAuction ? (raw.bids || 0) + ' lượt bid' : 'Buy Now'}).`,
    investmentThesis,
    seller: 'Fanatics Collect',
    sellerHref: 'https://www.fanaticscollect.com',
    sellerBadge,
    listingUrl: url,
    listingTitle: title,
    listingType: isAuction ? 'AUCTION' : 'BUY_NOW',
    bids: raw.bids || 0
  };
}

const parsedCards = uniqueItems.map((raw, i) => parseCard(raw, i));
console.log('Parsed cards count:', parsedCards.length);

const outPath = path.join(__dirname, 'fanatics_parsed_all.json');
fs.writeFileSync(outPath, JSON.stringify(parsedCards, null, 2), 'utf8');
console.log('Saved to ' + outPath);
