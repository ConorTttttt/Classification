'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const CLP = require('./engine');
const html = fs.readFileSync('clp_mixture_calculator.html','utf8');
const engine = fs.readFileSync('verification/engine.js','utf8').trim();
assert.ok(html.includes(engine), 'Embedded and standalone engines must match byte for byte');
const browser = {};
vm.runInNewContext(engine, browser);
function run(m) {
  const result = CLP.classify(m);
  assert.deepEqual(JSON.parse(JSON.stringify(browser.CLP.classify(m))), JSON.parse(JSON.stringify(result)));
  return result;
}
const assessment = (r,ref) => r.physical.find(a => a.ref === ref);
for (const def of CLP.PHYSICAL) {
  for (const code of def.codes) {
    const r = run({state:def.states[0] || 'liquid', ingredients:[{name:'A',pct:'1.5',hcodes:code+' '+code}]});
    const a = assessment(r,def.ref);
    assert.equal(a.status,'Potential concern',code);
    assert.deepEqual(a.contributors,['A (1.5 %, '+code+')']);
    assert.equal(r.outcomes.length,0);
  }
}
const liquid = fields => run({state:'liquid',...fields});
const flame = fields => assessment(liquid(fields),'2.6').status;
const negative = 'Not classified — evidence reviewed';
for (const [fp,ibp,code] of [[22.999,35,'H224'],[22,35.000000001,'H225'],[23,null,'H226'],[60,null,'H226']]) {
  const r = liquid({flashPoint:fp,ibp});
  assert.deepEqual(r.outcomes[0].h,[code]);
  assert.deepEqual(r.outcomes[0].picto,['GHS02']);
}
for (const fields of [{},{flashPoint:' '},{flashPoint:20},{flashPoint:45,fpBasis:'calculated'},
  {flashPoint:45,fpBasis:'measured',fpMethod:'open-cup',fpSource:'report'},{flashPoint:61},
  {flashPoint:61,fuel:'qualifying'},{flashPoint:45,l2:'negative'},{flashPoint:45,l2:'conflicting'}])
  assert.equal(flame(fields),'Insufficient data',JSON.stringify(fields));
for (const fp of [35.001,55,60]) assert.equal(flame({flashPoint:fp,l2:'negative',l2Source:'report'}),negative);
assert.equal(flame({flashPoint:35,l2:'negative',l2Source:'report'}),'Classified');
for (const fp of [55,60.001,75]) assert.equal(flame({flashPoint:fp,fuel:'qualifying',fuelSource:'supplier identity'}),'Classified');
assert.equal(flame({flashPoint:75.001,fuel:'qualifying',fuelSource:'supplier identity'}),negative);
assert.equal(flame({flashPoint:59,l2:'negative',l2Source:'report',fuel:'qualifying'}),'Insufficient data');
for (const state of ['gas','solid']) assert.equal(flame({flashPoint:20,state}),'Not applicable');
assert.equal(flame({flashPoint:45,dispenser:'aerosol'}),'Not applicable');
assert.equal(assessment(liquid({}),'2.1').status,'Insufficient data');
const record = {physicalClass:'2.16',decision:'classified',label:'Met. Corr. 1',h:'H290',signal:'Warning',picto:'GHS05',
  scope:'finished',method:'Independent assessment',result:'Category 1',source:'Finished-product report A'};
const r = liquid({manual:[record]});
assert.equal(assessment(r,'2.16').status,'Classified');
assert.equal(r.label.signal,'Warning');
assert.ok(r.label.pictograms.some(p=>p.code==='GHS05'));
assert.ok(r.label.hazardStatements.some(s=>s.code==='H290' && s.text));
assert.match(CLP.report({manual:[record]},r),/Finished-product report A/);
for (const changes of [{source:''},{scope:'ingredient'},{decision:''},{h:'H225'}])
  assert.equal(liquid({manual:[{...record,...changes}]}).outcomes.length,0);
assert.equal(liquid({manual:[record,record]}).outcomes.length,0);
const fl = {...record,physicalClass:'2.6',label:'Flam. Liq. 3',h:'H226',picto:'GHS02'};
assert.equal(liquid({flashPoint:45,manual:[fl]}).outcomes.length,1);
assert.equal(liquid({flashPoint:10,ibp:20,manual:[fl]}).outcomes.length,0);
const old = {flashPoint:'27',ingredients:[],manual:[]};
assert.equal(run(JSON.parse(JSON.stringify(old))).outcomes[0].h[0],'H226');
console.log('Physical screening, evidence, boundaries and offline engine parity passed');
