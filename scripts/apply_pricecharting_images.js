const fs = require('fs');
const path = require('path');

const crawledPath = path.join(__dirname, 'pricecharting_crawled_images.json');
const cardsJsonPath = path.join(__dirname, 'snorlax-munchlax-investment-research', 'data', 'cards.json');

const pcList = JSON.parse(fs.readFileSync(crawledPath, 'utf8'));
const cards = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf8'));

// Exact specific mappings for rare/special Japanese promos
const manualMap = {
  'munchlax-psa-002': 'https://storage.googleapis.com/images.pricecharting.com/refbbadc5f63c213d9fa3a2dd6f1b9bf9948ad41c5916e73498254db1f7db301fcb/240.jpg', // PokéPark #8
  'snorlax-psa-004': 'https://storage.googleapis.com/images.pricecharting.com/nzzxwc4d6jflemfi/240.jpg', // Domino's Pizza 025/PCG-P
  'snorlax-psa-001': 'https://storage.googleapis.com/images.pricecharting.com/9f8ddeb4aff8985eaa09ff48b5fe9d292aa41edbca4ca446a7eb0aa4bc8942f1/240.jpg', // Jungle 1st
  'munchlax-psa-103': 'https://storage.googleapis.com/images.pricecharting.com/645aq36ayifg2bzg/240.jpg', // 7-Eleven Movie Promo 20/PCG-P
  'munchlax-psa-104': 'https://storage.googleapis.com/images.pricecharting.com/corr27hca7ceznkx2gcz/240.jpg', // Meiji Promo
  'munchlax-psa-112': 'https://storage.googleapis.com/images.pricecharting.com/dbwahvfc2mqk2zru/240.jpg', // 091/DP-P Gym Challenge
  'munchlax-psa-113': 'https://storage.googleapis.com/images.pricecharting.com/a6v7ipjpwdmplbrz/240.jpg', // Lawson Promo 40/PCG-P
};

function cleanStr(s) {
  return (s || '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/[\[\]\(\)\-\#\/\,\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractNumber(str) {
  const m = (str || '').match(/\b(\d+)\b/);
  return m ? m[1] : '';
}

let matchedCount = 0;

cards.forEach(card => {
  // Check manual map first
  if (manualMap[card.id]) {
    card.image_url = manualMap[card.id];
    matchedCount++;
    return;
  }

  const cardNameClean = cleanStr(card.name);
  const cardSetClean = cleanStr(card.set);
  const cardNum = extractNumber(card.card_number);

  let bestMatch = null;
  let bestScore = -1;

  for (const pc of pcList) {
    const pcTitleClean = cleanStr(pc.title);
    const pcNum = extractNumber(pc.title);

    let score = 0;

    // Species check
    if (card.pokemon_species === 'Munchlax' && pc.species === 'Munchlax') score += 12;
    if (card.pokemon_species === 'Snorlax' && pc.species === 'Snorlax') score += 12;
    if (card.pokemon_species === 'Tag Team' && (pcTitleClean.includes('eevee') || pcTitleClean.includes('tag'))) score += 18;

    // Number match is strong signal
    if (cardNum && pcNum && cardNum === pcNum) {
      score += 25;
    }

    // Keyword match
    const keywords = (cardNameClean + ' ' + cardSetClean).split(' ');
    for (const kw of keywords) {
      if (kw.length > 2 && pcTitleClean.includes(kw)) {
        score += 6;
      }
    }

    if (score > bestScore && score >= 20) {
      bestScore = score;
      bestMatch = pc;
    }
  }

  if (bestMatch && bestMatch.image) {
    matchedCount++;
    card.image_url = bestMatch.image.replace('/60.jpg', '/240.jpg');
    card.pricecharting_link = bestMatch.link;
  }
});

console.log(`Matched ${matchedCount} / ${cards.length} cards to PriceCharting!`);
fs.writeFileSync(cardsJsonPath, JSON.stringify(cards, null, 2), 'utf8');
console.log('Saved to cards.json!');
