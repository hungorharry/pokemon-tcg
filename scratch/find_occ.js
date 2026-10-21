const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../index.html');
let html = fs.readFileSync(file, 'utf8');

const s = "renderDeckByGrades(list)";
let pos = 0;
const positions = [];
while ((pos = html.indexOf(s, pos)) !== -1) {
  positions.push(pos);
  pos += s.length;
}

console.log('Found occurrences at:', positions);
positions.forEach((p, i) => {
  console.log(`\n--- Occurrence ${i} ---`);
  console.log(JSON.stringify(html.substring(p - 20, p + 80)));
});
