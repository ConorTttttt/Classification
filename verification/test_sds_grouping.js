'use strict';
// Browser-local SDS grouping candidates: grouping is advisory, not a regulatory approval.
const assert=require('assert').strict;
const fs=require('fs');
const CLP=require('./engine.js');
const html=fs.readFileSync('clp_mixture_calculator.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const app=scripts[1],from=app.indexOf('/* SDS GROUPING PURE MATCHER'),to=app.indexOf('/* Multi-classification workspace.',from);
assert(from>=0&&to>from,'Pure grouping matcher not found in offline HTML');
const compare=new Function('CLP',app.slice(from,to)+'\nreturn suggestSdsGrouping;')(CLP);
const ingredient=(name,cas,pct,hcodes='')=>{
 const i=CLP.blankIngredient();i.name=name;i.cas=cas;i.pct=String(pct);
 CLP.applyHCodes(i,hcodes);return i;
};
const mixture=(name,percent=15,cas='123-45-6',hazard='H315')=>({
 name,state:'liquid',ingredients:[
  ingredient('Surfactant',cas,percent,hazard),
  ingredient('Water','7732-18-5',100-percent)
 ],manual:[]
});
const tab=(id,mixture)=>({id,mixture});
let n=0;function test(name,fn){try{fn();n++;}catch(e){throw Error(name+': '+e.message);}}
test('matching compositions and classifications are grouped',()=>{
 const r=compare([tab('a',mixture('Product A')),tab('b',mixture('Product B'))]);
 assert.equal(r.groups.length,1);assert.equal(r.groups[0].kind,'matching');
 assert.deepEqual(r.groups[0].members.map(x=>x.title),['Product A','Product B']);
});
test('matching CAS but different ingredient trade names still groups',()=>{
 const a=mixture('A'),b=mixture('B');
 b.ingredients[0].name='Different trade name';
 const r=compare([tab('a',a),tab('b',b)]);
 assert.equal(r.groups[0].kind,'matching');
});
test('related concentration variants are candidates only when classifications remain equal',()=>{
 const r=compare([tab('a',mixture('A',15)),tab('b',mixture('B',16))]);
 assert.equal(r.groups.length,1);assert.equal(r.groups[0].kind,'family');
 assert(r.groups[0].warnings.some(x=>/worst-case/.test(x)));
});
test('different classifications are not grouped',()=>{
 const a=mixture('A',15),b=mixture('B',0.5);
 const r=compare([tab('a',a),tab('b',b)]);
 assert.equal(r.groups.length,0);
});
test('different chemical identities with same CLP classification are not candidates',()=>{
 const r=compare([tab('a',mixture('A',15,'123-45-6')),tab('b',mixture('B',15,'456-78-9'))]);
 assert.equal(r.groups.length,0);
 assert.equal(r.sameClassificationOnly.length,1);
});
test('missing CAS uses names only with explicit identity warning',()=>{
 const r=compare([tab('a',mixture('A',15,'')),tab('b',mixture('B',15,''))]);
 assert.equal(r.groups.length,1);
 assert(r.groups[0].warnings.some(x=>/CAS\/EC identities/.test(x)));
});
test('hazard evidence changes cannot silently group',()=>{
 const a=mixture('A'),b=mixture('B');b.ingredients[0].scl={skinIrrit:5};
 assert.equal(compare([tab('a',a),tab('b',b)]).groups.length,0);
});
test('different mixture physical measurements are flagged for review',()=>{
 const a=mixture('A'),b=mixture('B');a.pH='6';b.pH='8';
 const r=compare([tab('a',a),tab('b',b)]);
 assert.equal(r.groups[0].kind,'family');
 assert(r.groups[0].warnings.some(x=>/physical properties/.test(x)));
});
test('incomplete formulation is excluded rather than grouped',()=>{
 const b=mixture('B');b.ingredients[1].pct='55';
 const r=compare([tab('a',mixture('A')),tab('b',b)]);
 assert.equal(r.groups.length,0);assert.equal(r.excluded.length,1);
});
test('empty workspaces are excluded',()=>{
 const r=compare([tab('a',{name:'Empty',ingredients:[],state:'liquid'})]);
 assert.equal(r.excluded.length,1);
});
test('no mutation of ingredient inputs',()=>{
 const a=mixture('A'),before=JSON.stringify(a);
 compare([tab('a',a),tab('b',mixture('B'))]);
 assert.equal(JSON.stringify(a),before);
});
test('panel controls and mandatory disclaimers are visible in HTML',()=>{
 assert.match(html,/id="workspace-sds-groups"/);
 assert.match(html,/id="sds-grouping-panel"/);
 assert.match(html,/one SDS may cover several mixtures only when its information fulfils the requirements for each mixture/);
 assert.match(html,/sameClassificationOnly/);
});
console.log(n+' SDS grouping candidate checks passed');
