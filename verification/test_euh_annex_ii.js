'use strict';
// Annex II EUH label-element verification: classifications are unchanged.
const fs=require('fs');
const assert=require('assert').strict;
const CLP=require('./engine.js');
const html=fs.readFileSync('clp_mixture_calculator.html','utf8');
const source=fs.readFileSync('verification/engine.js','utf8');
const ing=(pct,props={})=>Object.assign(CLP.blankIngredient(),{name:'Ingredient',pct},props);
const mix=(extras={})=>Object.assign({name:'Mixture',state:'liquid',audience:'professional',
  ingredients:[ing(100)],manual:[]},extras);
const classify=(extra)=>CLP.classify(mix(extra));
const selected=(r,c)=>r.label.euhStatements.filter(x=>x.code===c);
const warns=(r,expr)=>r.warnings.some(w=>expr.test(w));
let n=0;
function check(label,run){try{run();n++;}catch(e){throw Error(label+': '+e.message);}}
check('curated Annex II EUH catalogue includes >20 codes',()=>assert(CLP.EUH_CATALOG.length>=24));
for(const code of ['EUH014','EUH019','EUH029','EUH031','EUH032','EUH066','EUH070','EUH071',
 'EUH201','EUH201A','EUH202','EUH203','EUH204','EUH205','EUH206','EUH207','EUH208',
 'EUH209','EUH209A','EUH210','EUH211','EUH212','EUH401']){
 check(code+' is available',()=>assert(CLP.EUH_CATALOG.some(x=>x.code===code)));
}
check('obsolete EUH006 is not offered',()=>assert(!CLP.EUH_CATALOG.some(x=>x.code==='EUH006')));
check('manual EUH066 requires documented evidence',()=>{
 const r=classify({manualEUH:'EUH066'});
 assert.equal(selected(r,'EUH066').length,0);
 assert(warns(r,/needs a documented product-specific/));
});
check('manual EUH066 with evidence appears under supplemental label, not classification',()=>{
 const r=classify({manualEUH:'EUH066',manualEUHBasis:'Product irritation observations'});
 assert.equal(selected(r,'EUH066').length,1);
 assert.match(selected(r,'EUH066')[0].text,/skin dryness/);
 assert(!r.outcomes.some(o=>o.h.includes('EUH066')));
 assert(warns(r,/EUH066 was selected using user-supplied evidence/));
});
check('manual EUH204 is displayed with official wording',()=>{
 const r=classify({manualEUH:'EUH204',manualEUHBasis:'Isocyanate component verified'});
 assert.match(selected(r,'EUH204')[0].text,/Contains isocyanates/);
});
check('case insensitive duplicate manual codes are de-duplicated',()=>{
 const r=classify({manualEUH:'euh204, EUH204',manualEUHBasis:'Supplier SDS'});
 assert.equal(selected(r,'EUH204').length,1);
});
check('unknown EUH codes are rejected',()=>{
 const r=classify({manualEUH:'EUH999',manualEUHBasis:'Supplier SDS'});
 assert(!r.label.euhStatements.some(x=>x.code==='EUH999'));
 assert(warns(r,/not in the supported Annex II catalogue/));
});
check('non-EUH hazard codes are not accepted as manual supplemental',()=>{
 const r=classify({manualEUH:'H315',manualEUHBasis:'Supplier SDS'});
 assert(warns(r,/H315 is not in the supported Annex II catalogue/));
});
check('manual EUH208 cannot omit named sensitiser',()=>{
 const r=classify({manualEUH:'EUH208',manualEUHBasis:'Specific known sensitiser'});
 assert.equal(selected(r,'EUH208').length,0);
 assert(warns(r,/requires the name of the sensitising substance/));
});
check('manual EUH208 uses supplied sensitiser name',()=>{
 const r=classify({manualEUH:'EUH208',manualEUHBasis:'Sensitisation proof',
  manualEUH208Name:'Example sensitiser'});
 assert.match(selected(r,'EUH208')[0].text,/Contains Example sensitiser\./);
});
check('existing automatic EUH208 is not duplicated',()=>{
 const a=ing(0.1,{skinSens:'1B',name:'Automatic sensitiser'});
 const r=classify({ingredients:[a,ing(99.9,{name:'Water'})],manualEUH:'EUH208',
  manualEUHBasis:'Supplier SDS',manualEUH208Name:'Duplicate'});
 assert.equal(selected(r,'EUH208').length,1);
 assert(warns(r,/do not duplicate/));
});
check('non-hazardous professional product with SDS trigger prompts EUH210 review',()=>{
 const a=ing(0.1,{carc:'2'}),r=classify({ingredients:[a,ing(99.9)]});
 assert(warns(r,/EUH210 REVIEW/));
 assert.equal(selected(r,'EUH210').length,0);
});
check('eligible manual EUH210 requires evidence and trigger',()=>{
 const a=ing(0.1,{carc:'2'}),r=classify({ingredients:[a,ing(99.9)],
  manualEUH:'EUH210',manualEUHBasis:'SDS Annex II 2.10; professional supply'});
 assert.equal(selected(r,'EUH210').length,1);
});
check('EUH210 not retained without SDS trigger',()=>{
 const r=classify({manualEUH:'EUH210',manualEUHBasis:'Professional customer'});
 assert.equal(selected(r,'EUH210').length,0);
 assert(warns(r,/EUH210 needs a non-hazardous/));
});
check('EUH210 not retained on consumer mixture',()=>{
 const a=ing(0.1,{carc:'2'}),r=classify({audience:'consumer',ingredients:[a,ing(99.9)],
  manualEUH:'EUH210',manualEUHBasis:'Supplier SDS'});
 assert.equal(selected(r,'EUH210').length,0);
});
check('EUH210 not retained on classified mixture',()=>{
 const a=ing(5,{skinCorr:'2'}),r=classify({ingredients:[a,ing(95)],
  manualEUH:'EUH210',manualEUHBasis:'Supplier SDS'});
 assert.equal(selected(r,'EUH210').length,0);
});
check('EUH211 applies only to liquid states',()=>{
 const r=classify({state:'solid',manualEUH:'EUH211',manualEUHBasis:'TiO2 form evidence'});
 assert.equal(selected(r,'EUH211').length,0);
});
check('EUH212 applies only to solid states',()=>{
 const r=classify({state:'liquid',manualEUH:'EUH212',manualEUHBasis:'TiO2 form evidence'});
 assert.equal(selected(r,'EUH212').length,0);
});
check('EUH212 can be selected for solid with evidence',()=>{
 const r=classify({state:'solid',manualEUH:'EUH212',manualEUHBasis:'Qualifying titanium dioxide'});
 assert.equal(selected(r,'EUH212').length,1);
});
check('EUH201 and EUH201A variant conflict does not silently retain both',()=>{
 const r=classify({manualEUH:'EUH201 EUH201A',manualEUHBasis:'Lead paint'});
 assert.equal(selected(r,'EUH201').length,0);assert.equal(selected(r,'EUH201A').length,0);
 assert(warns(r,/alongside an alternative variant/));
});
check('EUH209 and EUH209A variant conflict does not silently retain both',()=>{
 const r=classify({manualEUH:'EUH209 EUH209A',manualEUHBasis:'Halogenated blend'});
 assert.equal(selected(r,'EUH209').length,0);assert.equal(selected(r,'EUH209A').length,0);
});
check('EUH outputs appear in report and Article 27 decision audit',()=>{
 const m=mix({manualEUH:'EUH205',manualEUHBasis:'Epoxy molecular weight verified'});
 const r=CLP.classify(m),report=CLP.report(m,r,{});
 assert.equal(selected(r,'EUH205').length,1);
 assert(r.label.decisions.some(d=>d.code==='EUH205'&&d.decision==='retained'));
 assert.match(report,/EUH205/);
});
check('offline HTML exact tested engine copy',()=>assert(html.includes(source)));
check('UI fields and curated picker available',()=>{
 for(const field of ['euh-catalog-select','euh-add','meuh','meuhbasis','meuhname'])
  assert(html.includes('id="'+field+'"'));
 assert(html.includes('CLP.EUH_CATALOG.map'));
});
console.log(n+' Annex II supplementary EUH checks passed');
