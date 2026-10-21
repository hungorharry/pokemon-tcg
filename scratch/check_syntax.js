const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const sIdx = html.lastIndexOf('<script>');
const eIdx = html.lastIndexOf('</script>');
const jsCode = html.substring(sIdx + 8, eIdx);

try {
  new Function(jsCode);
  console.log('Main JS syntax is 100% VALID!');
} catch (err) {
  console.error('JS Syntax error:', err);
}
