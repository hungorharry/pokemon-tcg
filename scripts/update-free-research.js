const fs = require('fs');
const path = require('path');
const { parsePublicCard, identityMatches, chooseVariant, normalizeResearch, fetchPublicCard, DATA_PATH } = require('./graded-research');
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, 'snorlax-munchlax-investment-research/data/cards.json'), 'utf8'));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  const urls = new Set();
  for (const name of ['snorlax', 'munchlax']) {
    for (let page = 1; page <= 12; page++) {
      const url = `https://scrydex.com/pokemon/search?q=${name}&page=${page}`;
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`Search HTTP ${response.status}`);
      const html = await response.text();
      const found = [...html.matchAll(/href="(\/pokemon\/cards\/[^"?#]+)[^"]*"/g)].map(m => m[1]);
      for (const href of found) if (!href.includes('/tcgp-')) urls.add('https://scrydex.com' + href);
      console.log(`Discovered ${name} page ${page}: ${found.length} cards`);
      if (!html.includes(`page=${page + 1}`) || !found.length) break;
      await wait(350);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'research-source-urls.json'), JSON.stringify([...urls], null, 2));
  const cacheDir = path.join(__dirname, 'research-cache'); fs.mkdirSync(cacheDir, { recursive: true });
  const old = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) : { records: {} };
  const dataset = { updatedAt: new Date().toISOString(), provider: 'Scrydex public pages (no API key)', records: { ...old.records }, errors: [], unmatched: [], discoveredCards: urls.size };
  let index = 0;
  for (const url of urls) {
    index++;
    const id = url.split('/').pop();
    const lang = id.includes('_ja-') ? 'ja' : 'en';
    const num = id.split('-').pop().replace(/^0+/, '');
    if (!cards.some(c => c.language === lang && String(c.card_number).split('/')[0].replace(/^0+/, '') === num)) continue;
    try {
      const file = path.join(cacheDir, id + '.json');
      let remote;
      if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < 3600000) remote = JSON.parse(fs.readFileSync(file, 'utf8'));
      else { remote = await fetchPublicCard(url); fs.writeFileSync(file, JSON.stringify(remote)); await wait(350); }
      const matched = cards.filter(c => identityMatches(c, remote));
      if (!matched.length) dataset.unmatched.push({ remoteId: remote.id, name: remote.name, set: remote.expansion?.name, url });
      for (const local of matched) {
        const variant = chooseVariant(local, remote);
        if (!variant) { dataset.errors.push({ cardId: local.id, url, reason: 'Ambiguous variant', variants: remote.variants.map(v => v.name) }); continue; }
        dataset.records[local.id] = normalizeResearch(local, remote, variant, url);
      }
      console.log(`${index}/${urls.size} ${id}: ${matched.length} identities, variants: ${remote.variants.map(v => v.name).join(', ')}`);
    } catch (error) { dataset.errors.push({ url, reason: error.message }); console.log(`${id}: ${error.message}`); }
  }
  dataset.coverage = { total: cards.length, mapped: Object.keys(dataset.records).length, population: Object.values(dataset.records).filter(r => r.population).length, psa10Price: Object.values(dataset.records).filter(r => r.prices.some(p => p.grade === '10')).length };
  fs.writeFileSync(DATA_PATH, JSON.stringify(dataset, null, 2));
  console.log(JSON.stringify(dataset.coverage));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
