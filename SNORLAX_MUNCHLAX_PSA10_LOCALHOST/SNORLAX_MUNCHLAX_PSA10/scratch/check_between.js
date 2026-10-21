const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../index.html');
let html = fs.readFileSync(file, 'utf8');

const p1 = 134114;
const p2 = 134425;
console.log('Between 1 and 2:');
console.log(JSON.stringify(html.substring(p1 - 18, p2 + 250)));
