const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update <head> with Google Fonts
const fontsLink = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Source+Code+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">`;

if (!html.includes('fonts.googleapis.com')) {
  html = html.replace('<title>', `${fontsLink}\n<title>`);
}

// 2. Replace the <style>...</style> content with Supabase Design System CSS
const newCss = fs.readFileSync(path.join(__dirname, 'supabase_styles.css'), 'utf8');
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>');

if (styleStart !== -1 && styleEnd !== -1) {
  html = html.substring(0, styleStart + 7) + '\n' + newCss + '\n' + html.substring(styleEnd);
} else {
  console.error('Could not find style block');
}

// 3. Update Brand logo in sidebar with Supabase lightning bolt
const oldBrand = `<div class="brand"><div class="brandmark">Zz</div><div><strong>SNOR ATLAS</strong><small>COLLECTIBLE INTELLIGENCE</small></div></div>`;
const newBrand = `<div class="brand"><div class="brandmark"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.35 2L3.5 13.65C3.12 14.1 3.44 14.77 4.02 14.77H11.5V22L20.5 10.35C20.88 9.9 20.56 9.23 19.98 9.23H13.35V2Z" fill="#3FCF8E"/></svg></div><div><strong>SNORLAX <span style="color:#3FCF8E">STUDIO</span></strong><small>SUPABASE DESIGN SYSTEM</small></div></div>`;
html = html.replace(oldBrand, newBrand);

// 4. Update Topline
const oldTopline = `<div class="topline"><div>THE COLLECTOR'S TERMINAL <span style="color:#555d73">/</span> POKÉMON</div>`;
const newTopline = `<div class="topline"><div><span style="color:#3FCF8E;font-size:10px;">◆</span> SUPABASE STUDIO <span style="color:rgba(255,255,255,0.2)">/</span> SNORLAX & MUNCHLAX PSA ATLAS</div>`;
html = html.replace(oldTopline, newTopline);

// 5. Bump cache version to v20
html = html.replace(/snoratlas-catalog-v19/g, 'snoratlas-catalog-v20');
html = html.replace(/snoratlas-settings-v19/g, 'snoratlas-settings-v20');
html = html.replace(/localStorage\.removeItem\('snoratlas-catalog-v18'\);/g, "localStorage.removeItem('snoratlas-catalog-v18');localStorage.removeItem('snoratlas-catalog-v19');");

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully transformed index.html to Supabase Design System!');
