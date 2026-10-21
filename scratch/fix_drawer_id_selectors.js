const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const cssPath = path.join(__dirname, 'complete_clean_styles.css');

let css = fs.readFileSync(cssPath, 'utf8');

// Replace .drawer-cover and .drawer with #drawerCover, .drawer-cover and #drawer, .drawer
const target = `.drawer-cover {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  z-index: 10000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.drawer-cover.show {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.92);
  width: 820px;
  max-width: 95vw;
  max-height: 90vh;
  background: #FFFFFF !important;
  border: 1px solid var(--sb-border);
  border-radius: 14px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
  z-index: 10001;
  padding: 24px 28px;
  overflow-y: auto;
  opacity: 0;
  pointer-events: none;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.drawer.show {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
}`;

const replacement = `/* Centered Dossier Modal with Full Analysis */
#drawerCover, .drawer-cover {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(8px);
  z-index: 10000 !important;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

#drawerCover.show, .drawer-cover.show {
  opacity: 1;
  pointer-events: auto;
}

#drawer, .drawer {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) scale(0.94) !important;
  width: 840px !important;
  max-width: 95vw !important;
  max-height: 90vh !important;
  height: auto !important;
  background: #FFFFFF !important;
  border: 1px solid var(--sb-border) !important;
  border-radius: 14px !important;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35) !important;
  z-index: 10001 !important;
  padding: 24px 28px !important;
  overflow-y: auto !important;
  opacity: 0;
  pointer-events: none;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease !important;
}

#drawer.show, .drawer.show {
  opacity: 1 !important;
  pointer-events: auto !important;
  transform: translate(-50%, -50%) scale(1) !important;
}

/* Modal and Dialog Selectors */
#modalCover, .modal-cover {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  z-index: 10000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
#modalCover.show, .modal-cover.show {
  opacity: 1;
  pointer-events: auto;
}

#dialog, .dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.92);
  width: 620px;
  max-width: 92vw;
  max-height: 85vh;
  background: #FFFFFF !important;
  border: 1px solid var(--sb-border);
  border-radius: 12px;
  box-shadow: var(--sb-shadow-pop);
  z-index: 10001;
  padding: 24px;
  overflow-y: auto;
  opacity: 0;
  pointer-events: none;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}
#dialog.show, .dialog.show {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
}`;

css = css.replace(target, replacement);
fs.writeFileSync(cssPath, css, 'utf8');

// Apply to index.html
let html = fs.readFileSync(indexPath, 'utf8');
const sIdx = html.indexOf('<style>');
const eIdx = html.indexOf('</style>');
if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx + 7) + '\n' + css + '\n' + html.substring(eIdx);
}

// Bump version
html = html.replace(/snoratlas-catalog-v23/g, 'snoratlas-catalog-v24');
html = html.replace(/snoratlas-settings-v23/g, 'snoratlas-settings-v24');
html = html.replace("localStorage.removeItem('snoratlas-catalog-v22');", "localStorage.removeItem('snoratlas-catalog-v22');localStorage.removeItem('snoratlas-catalog-v23');");

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated #drawer and #drawerCover selectors and synced index.html!');
