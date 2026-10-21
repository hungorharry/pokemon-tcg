const https = require('https');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname);

const targets = [
  { id: 'snor-003', img: 'https://i.ebayimg.com/images/g/iUoAAeSwj6BqlvRs/s-l1600.webp' },
  { id: 'snor-005', img: 'https://i.ebayimg.com/images/g/vLQAAeSwkkdqx7XD/s-l1600.webp' },
  { id: 'snor-006', img: 'https://i.ebayimg.com/images/g/FUEAAeSwclBqwPJe/s-l1600.webp' },
  { id: 'snor-008', img: 'https://i.ebayimg.com/images/g/rvEAAeSw6wNqkEk6/s-l1600.webp' },
  { id: 'snor-010', img: 'https://i.ebayimg.com/images/g/mAoAAeSwe0lq0odz/s-l1600.webp' },
  { id: 'snor-019', img: 'https://i.ebayimg.com/images/g/5V8AAeSwn75qO-Me/s-l1600.webp' }
];

function dl(url, filename) {
  return new Promise(resolve => {
    https.get(url, res => {
      const stream = fs.createWriteStream(path.join(dir, filename));
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(); });
    }).on('error', () => resolve());
  });
}

(async () => {
  for (const t of targets) {
    await dl(t.img, `${t.id}.webp`);
    console.log(`Downloaded ${t.id}.webp`);
  }
})();
