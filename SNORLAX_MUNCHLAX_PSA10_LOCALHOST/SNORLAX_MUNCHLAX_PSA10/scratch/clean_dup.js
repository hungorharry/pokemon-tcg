const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../index.html');
let html = fs.readFileSync(file, 'utf8');

const p1 = 134114 - 17; // start at '\n byId('cards')...'
const p2 = 134425 - 17;
const endOfP2 = html.indexOf('}\nfunction updateLiveUI', p2);

console.log('Snippet to remove:');
console.log(JSON.stringify(html.substring(p2, endOfP2 + 2)));

html = html.substring(0, p2) + html.substring(endOfP2 + 2);
fs.writeFileSync(file, html, 'utf8');
console.log('Successfully cleaned up!');
