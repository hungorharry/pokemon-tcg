const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(__dirname, 'complete_clean_styles.css');

let html = fs.readFileSync(indexPath, 'utf8');
const newCss = fs.readFileSync(cssPath, 'utf8');

const sIdx = html.indexOf('<style>');
const eIdx = html.indexOf('</style>');

if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx + 7) + '\n' + newCss + '\n' + html.substring(eIdx);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Successfully applied complete clean styles to index.html!');
} else {
  console.error('Could not find style block');
}
