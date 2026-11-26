'use strict';
const assert=require('assert').strict;
const fs=require('fs');
const WGK=require('./wgk_assessment.js');
const html=fs.readFileSync('clp_mixture_calculator.html','utf8');
const source=fs.readFileSync('verification/wgk_assessment.js','utf8');
const entry=(pct,wgk,extra={})=>({name:'Material',cas:'123-45-6',pct:String(pct),
 wgkClass:wgk,wgkM:'1',wgkCarc:'no',wgkSource:'UBA Rigoletto evidence',...extra});
const m=(ingredients,options={})=>({state:'liquid',wgkNwgVerified:true,ingredients,...options});
let n=0;
function test(title,fn){try{fn();n++}catch(e){throw Error(title+': '+e.message);}}
const classOf=(ings,options)=>WGK.assess(m(ings,options));
test('full WGK1 mixture derives WGK1',()=>{
 const r=classOf([entry(100,'1')]);assert.equal(r.classification,'WGK 1');assert.equal(r.status,'derived');
});
test('full WGK2 mixture derives WGK2',()=>{
 const r=classOf([entry(100,'2')]);assert.equal(r.classification,'WGK 2');
});
test('full WGK3 mixture derives WGK3',()=>{
 const r=classOf([entry(100,'3')]);assert.equal(r.classification,'WGK 3');
});
test('WGK 3 3.0 percent boundary is class 3',()=>{
 const r=classOf([entry(3,'3'),entry(97,'nwg')]);assert.equal(r.classification,'WGK 3');
});
test('WGK 3 2.99 percent is class 2',()=>{
 const r=classOf([entry(2.99,'3'),entry(97.01,'nwg')]);assert.equal(r.classification,'WGK 2');
});
test('WGK 3 0.2 percent boundary triggers class 2',()=>{
 const r=classOf([entry(0.2,'3'),entry(99.8,'nwg')]);assert.equal(r.classification,'WGK 2');
});
test('WGK2 5 percent boundary triggers class 2',()=>{
 const r=classOf([entry(5,'2'),entry(95,'nwg')]);assert.equal(r.classification,'WGK 2');
});
test('WGK2 4.99 percent is class 1',()=>{
 const r=classOf([entry(4.99,'2'),entry(95.01,'nwg')]);assert.equal(r.classification,'WGK 1');
});
test('WGK2 0.2 percent lower threshold is class 1',()=>{
 const r=classOf([entry(0.2,'2'),entry(99.8,'nwg')]);assert.equal(r.classification,'WGK 1');
});
test('WGK1 3 percent boundary triggers class 1',()=>{
 const r=classOf([entry(3,'1'),entry(97,'nwg')]);assert.equal(r.classification,'WGK 1');
});
test('WGK1 2.99 with nwg criteria checked derives nwg',()=>{
 const r=classOf([entry(2.99,'1'),entry(97.01,'nwg')]);assert.equal(r.classification,'nwg');assert.equal(r.status,'derived');
});
test('unverified nwg conditions block final nwg',()=>{
 const r=classOf([entry(100,'nwg')],{wgkNwgVerified:false});
 assert.equal(r.status,'provisional');assert.equal(r.classification,'nwg / WGK 1');
});
test('all nwg with confirmed conditions derives nwg',()=>{
 const r=classOf([entry(100,'nwg')]);assert.equal(r.classification,'nwg');assert.equal(r.status,'derived');
});
test('carcinogenic WGK3 0.1 percent leads to WGK3',()=>{
 const r=classOf([entry(0.1,'3',{wgkCarc:'yes'}),entry(99.9,'nwg')]);assert.equal(r.classification,'WGK 3');
});
test('carcinogenic WGK2 0.1 percent leads to WGK2',()=>{
 const r=classOf([entry(0.1,'2',{wgkCarc:'yes'}),entry(99.9,'nwg')]);assert.equal(r.classification,'WGK 2');
});
test('carcinogenic WGK2 at 0.09 percent does not produce WGK2',()=>{
 const r=classOf([entry(0.09,'2',{wgkCarc:'yes'}),entry(99.91,'nwg')]);assert.equal(r.classification,'WGK 1');
});
test('carcinogenic WGK3 at 0.09 percent cannot be declared nwg',()=>{
 const r=classOf([entry(0.09,'3',{wgkCarc:'yes'}),entry(99.91,'nwg')]);
 assert.notEqual(r.classification,'nwg');
});
test('M factor expands WGK3 effective percent (0.3 x 10 = 3)',()=>{
 const r=classOf([entry(.3,'3',{wgkM:'10'}),entry(99.7,'nwg')]);assert.equal(r.classification,'WGK 3');
 assert.equal(r.details.wgk3,3);
});
test('M factor can turn 0.02 WGK3 into class 2',()=>{
 const r=classOf([entry(.02,'3',{wgkM:'10'}),entry(99.98,'nwg')]);
 assert.equal(r.classification,'WGK 2');
});
test('M factor can raise WGK2 total to 5 percent',()=>{
 const r=classOf([entry(.5,'2',{wgkM:'10'}),entry(99.5,'nwg')]);assert.equal(r.classification,'WGK 2');
});
test('blank M-factor blocks definitive assignment',()=>{
 const r=classOf([entry(5,'2',{wgkM:''}),entry(95,'nwg')]);
 assert.equal(r.status,'provisional');assert(r.blockers.some(x=>/M-factor/.test(x)));
});
test('blank carcinogenic status blocks definitive assignment',()=>{
 const r=classOf([entry(3,'3',{wgkCarc:''}),entry(97,'nwg')]);
 assert.equal(r.status,'provisional');assert(r.blockers.some(x=>/carcinogenic status/.test(x)));
});
test('blank WGK source blocks definitive assignment',()=>{
 const r=classOf([entry(3,'3',{wgkSource:''}),entry(97,'nwg')]);
 assert.equal(r.status,'provisional');assert(r.blockers.some(x=>/WGK source/.test(x)));
});
test('partial 15 percent only cannot produce final class',()=>{
 const r=classOf([entry(15,'2')]);assert.equal(r.status,'provisional');
 assert.equal(r.remainder,85);assert(r.warnings.some(x=>/not automatically assumed/i.test(x)));
});
test('incomplete partial mix 3 percent WGK3 stays provisional even with decisive known hazard',()=>{
 const r=classOf([entry(3,'3')]);assert.equal(r.classification,'WGK 3');assert.equal(r.status,'provisional');
});
test('unlisted composition is not invented to total 100',()=>{
 const a=[entry(17,'nwg')],copy=JSON.stringify(a),r=classOf(a);
 assert.equal(r.enteredTotal,17);assert.equal(r.remainder,83);assert.equal(JSON.stringify(a),copy);
});
test('unknown WGK ingredient blocks final classification',()=>{
 const r=classOf([entry(3,''),entry(97,'nwg')]);
 assert.equal(r.status,'provisional');assert.equal(r.details.rawUnknown,3);
});
test('unidentified material not silently treated as water',()=>{
 const r=classOf([entry(100,'')]);assert.notEqual(r.classification,'nwg');assert.equal(r.status,'provisional');
});
test('awg component blocks numeric final result without special assessment',()=>{
 const r=classOf([entry(100,'awg')]);assert.equal(r.status,'special');assert.match(r.classification,/awg-containing/);
 assert(r.blockers.some(x=>/awg/.test(x)));
});
test('awg and numbered WGK mix does not present unsupported numeric result',()=>{
 const r=classOf([entry(50,'awg'),entry(50,'2')]);assert.equal(r.status,'special');
 assert.match(r.classification,/special AwSV assessment/);
});
test('non-integer M factor blocks definitive assessment',()=>{
 const r=classOf([entry(5,'2',{wgkM:'1.5'}),entry(95,'nwg')]);
 assert.equal(r.status,'provisional');assert(r.blockers.some(x=>/M-factor/.test(x)));
});
test('solid default result follows AwSV section 3',()=>{
 const r=classOf([entry(100,'1')],{state:'solid'});
 assert.equal(r.status,'special');assert.match(r.classification,/awg/);
});
test('solid with explicit section 10 assessment can be screened',()=>{
 const r=classOf([entry(100,'1')],{state:'solid',wgkSolidAssessed:true});
 assert.equal(r.classification,'WGK 1');
 assert(r.warnings.some(x=>/solid-mixture/i.test(x)));
});
test('over 100 percent and negative concentrations rejected',()=>{
 const x=classOf([entry(105,'2')]);assert.equal(x.status,'provisional');
 assert(x.blockers.some(x=>/invalid|exceed/.test(x)));
 const y=classOf([entry(-1,'2'),entry(101,'nwg')]);assert.equal(y.status,'provisional');
});
test('WGK calculator renders a detailed source-aware report',()=>{
 const r=classOf([entry(3,'3'),entry(97,'nwg')]);const report=WGK.report(r);
 assert.match(report,/AwSV Annex 1/);assert.match(report,/WGK 3/);assert.match(report,/Rigoletto/);
});
test('one exact offline browser code copy',()=>assert(html.includes(source)));
test('WGK UI inputs and links present',()=>{
 for(const id of ['wgksettings','wgk-rows','wgk-results','wgk-nwg-verified','wgk-solid-assessed'])
   assert(html.includes('id="'+id+'"'));
 assert(html.includes('WGK.assess(mix)'));
 assert(html.includes('WGK.report(wgk)'));
 assert(html.includes('https://webrigoletto.uba.de/Rigoletto/Home/'));
});
console.log(n+' German AwSV mixture WGK assessment checks passed');
