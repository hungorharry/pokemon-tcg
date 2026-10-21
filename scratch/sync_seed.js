const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const catPath = path.join(dir, 'catalog.json');
const indexPath = path.join(dir, 'index.html');

const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
let html = fs.readFileSync(indexPath, 'utf8');
const startTag = '<script id="SEED_DATA" type="application/json">';
const endTag = '</script>';
const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag, startIndex);
if (startIndex !== -1 && endIndex !== -1) {
  html = html.substring(0, startIndex + startTag.length) + JSON.stringify(cat) + html.substring(endIndex);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Successfully updated SEED_DATA with ' + cat.length + ' cards!');
} else {
  console.error('Could not find SEED_DATA tag in index.html');
}
