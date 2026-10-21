const fs = require('fs');
const path = require('path');
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalog.json'), 'utf8'));

const map = new Map();
cat.forEach((c, idx) => {
  const list = map.get(c.image) || [];
  list.push({ idx: idx + 1, id: c.id, grade: c.grade, name: c.name });
  map.set(c.image, list);
});

console.log('Total cards:', cat.length, 'Unique images:', map.size);
for (const [img, list] of map.entries()) {
  if (list.length > 1) {
    console.log('Duplicate image used by:', list.map(x => `#${x.idx} ${x.id} (PSA ${x.grade})`).join(', '));
    console.log('  Image:', img);
  }
}
