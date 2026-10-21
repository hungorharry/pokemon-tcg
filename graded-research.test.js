const { test } = require('node:test');
const assert = require('node:assert/strict');
const { identityMatches, chooseVariant, normalizeResearch, parsePublicCard } = require('./graded-research');
const card = { id:'test', name:'Snorlax #11', card_number:'11', set:'Pokemon Jungle', language:'en', foil:'Holo', edition:'Unlimited', stamp:'none', scope:'IN_SCOPE' };
const remote = { id:'base2-11', name:'Snorlax', number:'11', language_code:'EN', expansion:{id:'base2',name:'Jungle'}, images:[], variants:[{name:'firstEditionHolofoil'}, {name:'unlimitedHolofoil'}] };
test('identities do not mix #11/#27, English/Japanese, or unrelated sets', () => {
  assert.equal(identityMatches(card,remote),true);
  for (const change of [{card_number:'27'},{language:'ja'},{set:'Pokemon Base Set 2'},{name:'Munchlax #11'},{scope:'OUT_OF_SCOPE'}]) assert.equal(identityMatches({...card,...change},remote),false);
});
test('edition and special foil remain separate, missing variants stay missing', () => {
  assert.equal(chooseVariant(card,remote).name,'unlimitedHolofoil');
  assert.equal(chooseVariant({...card,edition:'1st Edition'},remote).name,'firstEditionHolofoil');
  assert.equal(chooseVariant({...card,name:'Snorlax [No Symbol] #11'},remote),null);
  assert.equal(chooseVariant({...card,name:'Snorlax [Reverse Holo] #11'},remote),null);
  assert.equal(chooseVariant({...card,name:'Snorlax [Highlighter Error] #11'},remote),null);
});
test('real distribution math includes half grades, qualifiers and auth; does not mix graders', () => {
  const variant = {name:'normal',pop_reports:[{company:'CGC',total:1000,grades:[]},{company:'PSA',total:100,grades:[{grade:'10',count:4},{grade:'9',count:30},{grade:'8.5',count:15},{grade:'8',count:40},{grade:'9Q',count:10},{grade:'auth',count:1}],external_id:'123'}],prices:[{company:'PSA',type:'graded',grade:'10',market:200,currency:'USD'},{company:'CGC',type:'graded',grade:'10',market:1,currency:'USD'},{company:'PSA',type:'graded',grade:'10',market:999,currency:'USD',is_signed:true}]};
  const d=normalizeResearch(card,remote,variant,'https://scrydex.com/pokemon/cards/snorlax/base2-11');
  assert.equal(d.population.total,100);assert.equal(d.population.gemRate,4);assert.equal(d.population.highGradeRate,34);assert.equal(d.population.grades.find(g=>g.grade==='8.5').percent,15);assert.equal(d.population.unclassified,0);assert.equal(d.prices.length,1);assert.equal(d.prices[0].market,200);assert.equal(d.sourceUpdatedAt,null);
});
test('impossible or duplicate population counts are rejected', () => {
  for(const grades of [[{grade:'10',count:101}],[{grade:'10',count:-1}],[{grade:'10',count:1},{grade:'10',count:2}]]) assert.throws(()=>normalizeResearch(card,remote,{name:'normal',pop_reports:[{company:'PSA',total:100,grades}]},'https://scrydex.com'));
});
test('source parser reads only public structured card data; no scripts execute', () => {
  const payload=JSON.stringify({data:{id:'test',variants:[]}}).replaceAll('"','&quot;');
  assert.equal(parsePublicCard(`<div data-terminal-trigger-json-value="${payload}"></div>`).id,'test');
  assert.throws(()=>parsePublicCard('<h1>Sign in</h1>'));
});
