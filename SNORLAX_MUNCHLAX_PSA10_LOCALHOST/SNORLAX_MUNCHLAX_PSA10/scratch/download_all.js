const https = require('https');
const fs = require('fs');
const path = require('path');
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalog.json'), 'utf8'));

const outDir = path.join(__dirname, 'all_images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function download(url, dest) {
  return new Promise(resolve => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        console.log(`Failed ${dest}: status ${res.statusCode}`);
        return resolve(false);
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(true); });
    }).on('error', e => {
      console.log(`Error ${dest}: ${e.message}`);
      resolve(false);
    });
  });
}

(async () => {
  console.log(`Downloading ${cat.length} images...`);
  for (let i = 0; i < cat.length; i++) {
    const c = cat[i];
    const filename = `${String(i + 1).padStart(2, '0')}_${c.id}_PSA${c.grade}.webp`;
    const dest = path.join(outDir, filename);
    if (!fs.existsSync(dest)) {
      await download(c.image, dest);
    }
  }
  console.log('All downloads complete!');
})();
