const fs = require('fs');
const path = require('path');
const { identityMatches, chooseVariant, normalizeResearch, DATA_PATH } = require('./graded-research');
const cards = require('./snorlax-munchlax-investment-research/data/cards.json');
const records = {}, errors = [], unmatched = [];
for (const file of fs.readdirSync(path.join(__dirname, 'research-cache'))) {
  if (!file.endsWith('.json')) continue;
  const remote = JSON.parse(fs.readFileSync(path.join(__dirname, 'research-cache', file), 'utf8'));
  const matched = cards.filter(card => identityMatches(card, remote));
  for (const card of matched) {
    const variant = chooseVariant(card, remote);
    if (!variant) { errors.push({ cardId: card.id, remoteId: remote.id, reason: 'Ambiguous variant', variants: remote.variants.map(v => v.name) }); continue; }
    const english = card.name.replace(/\[[^\]]+\]/g,'').replace(/#.*$/,'').trim();
    const slug = (remote.language_code === 'JA' ? english : remote.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    try { records[card.id] = normalizeResearch(card, remote, variant, `https://scrydex.com/pokemon/cards/${slug}/${remote.id}`, fs.statSync(path.join(__dirname,'research-cache',file)).mtime.toISOString()); }
    catch (error) { errors.push({cardId:card.id,remoteId:remote.id,reason:error.message}); }
  }
  if (!matched.length) unmatched.push({ remoteId:remote.id,name:remote.name,set:remote.expansion.name,language:remote.language_code });
}
const coverage = {total:cards.length,mapped:Object.keys(records).length,population:Object.values(records).filter(r=>r.population).length,psa10Price:Object.values(records).filter(r=>r.prices.some(p=>p.grade==='10')).length};
fs.writeFileSync(DATA_PATH,JSON.stringify({ updatedAt:new Date().toISOString(),provider:'Scrydex public card pages',coverage,records,errors,unmatched },null,2));
console.log(coverage);console.log('Ambiguous:',JSON.stringify(errors));console.log('Unmatched:',JSON.stringify(unmatched));
