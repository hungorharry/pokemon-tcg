const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const catPath = path.join(dir, 'catalog.json');
const fanaticsPath = path.join(__dirname, 'fanatics_parsed_all.json');

const currentCat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
const fanaticsCards = JSON.parse(fs.readFileSync(fanaticsPath, 'utf8'));

// Filter out old temporary fc- cards from currentCat, keep original 58 curated cards
const coreCurated = currentCat.filter(c => !c.id.startsWith('fc-'));
console.log('Core curated cards count:', coreCurated.length);

const merged = [...coreCurated, ...fanaticsCards];
console.log('Total merged catalog count:', merged.length);

fs.writeFileSync(catPath, JSON.stringify(merged, null, 2), 'utf8');
console.log('Updated catalog.json successfully!');
