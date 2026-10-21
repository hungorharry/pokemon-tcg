const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(__dirname, 'complete_clean_styles.css');

let css = fs.readFileSync(cssPath, 'utf8');

// Update #drawer and .drawerhead in css
css = css.replace(
  'padding: 24px 28px !important;',
  'padding: 0 28px 24px 28px !important;'
);

css = css.replace(
  `top: -24px !important;
  margin: -24px -28px 16px -28px !important;`,
  `top: 0 !important;
  margin: 0 -28px 16px -28px !important;`
);

css = css.replace(
  'z-index: 100 !important;',
  'z-index: 1000 !important;'
);

fs.writeFileSync(cssPath, css, 'utf8');

// Apply to index.html
let html = fs.readFileSync(indexPath, 'utf8');
const sIdx = html.indexOf('<style>');
const eIdx = html.indexOf('</style>');
if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx + 7) + '\n' + css + '\n' + html.substring(eIdx);
}

// Bump cache version
html = html.replace(/snoratlas-catalog-v25/g, 'snoratlas-catalog-v26');
html = html.replace(/snoratlas-settings-v25/g, 'snoratlas-settings-v26');
html = html.replace("localStorage.removeItem('snoratlas-catalog-v24');", "localStorage.removeItem('snoratlas-catalog-v24');localStorage.removeItem('snoratlas-catalog-v25');");

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated sticky header and applied to index.html!');
