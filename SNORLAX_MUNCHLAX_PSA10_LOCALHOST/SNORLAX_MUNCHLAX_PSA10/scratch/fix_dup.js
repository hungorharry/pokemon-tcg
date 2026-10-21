const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../index.html');
let html = fs.readFileSync(file, 'utf8');

const target = `byId('cards').innerHTML=renderDeckByGrades(list);
byId('table').innerHTML=tableHtml(list);
byId('cards').classList.toggle('hide',view==='table');byId('table').classList.toggle('hide',view!=='table');
document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
}`;

const idx1 = html.indexOf(target);
const idx2 = html.indexOf(target, idx1 + target.length);

if (idx1 !== -1 && idx2 !== -1) {
  // Check if idx2 is right after idx1 with optional whitespace
  const between = html.substring(idx1 + target.length, idx2).trim();
  if (between === '') {
    html = html.substring(0, idx1 + target.length) + html.substring(idx2 + target.length);
    fs.writeFileSync(file, html, 'utf8');
    console.log('Removed duplicate successfully!');
  } else {
    console.log('Text between was not empty:', between);
  }
} else {
  console.log('Indices:', idx1, idx2);
}
