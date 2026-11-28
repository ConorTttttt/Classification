// Article 28 candidates checked against an independent source: the precautionary statements listed in the CLP
// Annex I label-element tables (data/legal/clp_annex_i_label_p_eu_*.json). The engine itself selects from Annex IV
// Part 1, so agreement here tests the extraction and the class/category wiring.
// Run from repo root: node verification/test_annex_iv_table.js
'use strict';
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const CLP = require('./engine.js');
let pass = 0, fail = 0;
const t = (name, ok, info) => { if (ok) pass++; else { fail++; console.log('FAIL: ' + name + (info ? ' — ' + info : '')); } };
const LEGAL = path.join(__dirname, '..', 'data', 'legal');
const load = (p) => JSON.parse(fs.readFileSync(path.join(LEGAL, fs.readdirSync(LEGAL).filter((f) => f.startsWith(p)).sort().pop()), 'utf8'));
const labels = load('clp_annex_i_label_p_eu_').entries;
const codes = load('clp_annex_vi_codes_eu_').entries;
const catH = load('clp_category_h_eu_').entries;
const parts = (list) => new Set(list.flatMap((c) => c.split('+').map((x) => x.replace(/[[\]]/g, ''))));
const setEq = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

// Where the Annex I table and Annex IV Part 1 differ in the consolidated text, either is accepted:
// explosives P501 (Annex I Table 2.1.2) / P503 (Annex IV Table 6.5); self-heating P410 and lactation P202 (Annex IV only).
const EITHER = {explosives: ['P501', 'P503'], self_heating: ['P410'], lactation: ['P202']};
// Annex IV Table 6.2 limits P201 for CMR and lactation to consumer products ("omit where P202 is used"); the Annex I
// tables list it without that condition. Tested separately below for consumer supply.
const CONSUMER_ONLY = {mutagenicity: ['P201'], carcinogenicity: ['P201'], reproductive_toxicity: ['P201'], lactation: ['P201']};
// Annex I "Category 1 (Category 1A, 1B)" columns for CMR: Annex IV lists 1A and 1B only.
const SKIP = new Set(['mutagenicity|1', 'carcinogenicity|1', 'reproductive_toxicity|1']);

function label(cls, cat) {
  if (cls.startsWith('acute_')) return 'Acute Tox. ' + cat + ' (' + cls.slice(6) + ')';
  if (cls === 'stot_se_3_resp') return 'STOT SE 3 (respiratory irritation)';
  if (cls === 'stot_se_3_narc') return 'STOT SE 3 (narcotic effects)';
  if (cls === 'gases_under_pressure') return 'Press. Gas';
  const e = codes.find((x) => x.class_key === cls && x.categories.includes(cat));
  return e ? e.code : null;
}
const hOf = (cls, cat) => (catH.find((e) => e.class_key === cls && e.category === cat) || {}).h || [];

let checked = 0;
for (const e of labels) {
  const key = e.class_key + '|' + e.category;
  if (SKIP.has(key) || !e.p.length) continue;
  const lab = label(e.class_key, e.category);
  if (!lab) continue;
  const r = CLP.selectArticle28([{label: lab, h: hOf(e.class_key, e.category)}], {audience: 'industrial', intendedUse: 'test'});
  const got = parts(r.candidates.filter((c) => c.decision !== 'class to confirm').map((c) => c.code));
  const want = parts(e.p);
  (EITHER[e.class_key] || []).forEach((x) => { got.delete(x); want.delete(x); });
  (CONSUMER_ONLY[e.class_key] || []).forEach((x) => want.delete(x));
  checked++;
  t('Annex I ' + e.source.split(' ').slice(0, 2).join(' ') + ' ' + key, setEq(got, want),
    'missing ' + [...want].filter((x) => !got.has(x)).join(' ') + '; extra ' + [...got].filter((x) => !want.has(x)).join(' '));
}
t('Annex I columns compared', checked >= 80, String(checked));

{
  const r = CLP.selectArticle28([{label: 'Carc. 2', h: ['H351']}], {audience: 'consumer', intendedUse: 'test'});
  const p201 = r.candidates.find((x) => x.code === 'P201');
  t('Consumer CMR: P201 candidate, omitted where P202 is used', p201 && p201.decision === 'redundant' && r.candidates.some((x) => x.code === 'P202'));
  const r2 = CLP.selectArticle28([{label: 'Carc. 2', h: ['H351']}], {audience: 'professional', intendedUse: 'test'});
  t('Professional CMR: no consumer-only P201', !r2.candidates.some((x) => x.code === 'P201'));
}
{
  const r = CLP.selectArticle28([{label: 'ED HH 1', h: ['EUH380']}], {audience: 'industrial', intendedUse: 'test'});
  t('ED HH 1 gets the Annex I Table 3.11.3 statements', ['P201', 'P202', 'P263', 'P280', 'P308+P313', 'P405', 'P501'].every((c) => r.candidates.some((x) => x.code === c)));
  t('ED statements cite Annex I', r.candidates.every((x) => x.basis.includes('Annex I')));
}
{
  const r = CLP.selectArticle28([{label: 'H242', h: ['H242']}], {audience: 'industrial', intendedUse: 'test'});
  const p410 = r.candidates.find((x) => x.code === 'P410');
  t('H242 alone: P410 (organic peroxides only) held until the class is known', p410 && p410.decision === 'class to confirm');
  t('H242 alone: common statements proposed', r.candidates.some((x) => x.code === 'P210' && x.decision !== 'class to confirm'));
  const r2 = CLP.selectArticle28([{label: 'Org. Perox. CD', h: ['H242']}], {audience: 'industrial', intendedUse: 'test'});
  t('Org. Perox. CD: P410 eligible', r2.candidates.some((x) => x.code === 'P410' && x.decision !== 'class to confirm'));
  const r3 = CLP.selectArticle28([{label: 'Self-react. CD', h: ['H242']}], {audience: 'industrial', intendedUse: 'test'});
  t('Self-react. CD: no P410', !r3.candidates.some((x) => x.code === 'P410'));
}
{
  const r = CLP.selectArticle28([{label: 'Acute Tox. 3 (dermal)', h: ['H311']}], {audience: 'industrial', intendedUse: 'test'});
  const has = (c) => r.candidates.some((x) => x.code === c);
  t('Acute Tox. 3 dermal: P312, not P310/P264/P270', has('P312') && !has('P310') && !has('P264') && !has('P270'));
}
{
  const r = CLP.selectArticle28([{label: 'Flam. Liq. 2', h: ['H225']}], {audience: 'industrial', intendedUse: 'test'});
  const c = r.candidates.find((x) => x.code === 'P233');
  t('Conditional P233 held as condition pending', c && c.decision === 'condition pending' && r.review.some((x) => x.code === 'P233' && x.reason.includes('volatile')));
  const r2 = CLP.selectArticle28([{label: 'Flam. Liq. 2', h: ['H225']}], {audience: 'industrial', intendedUse: 'test', manualPExtra: 'P233'});
  t('Confirmed P233 can be added manually', r2.candidates.some((x) => x.code === 'P233' && x.manual && x.decision !== 'condition pending'));
}
{
  const r = CLP.selectArticle28([{label: 'Skin Corr. 1B', h: ['H314']}, {label: 'Asp. Tox. 1', h: ['H304']}], {audience: 'industrial', intendedUse: 'test'});
  t('Article 28(1): P331 beside P301+P330+P331 flagged', r.review.some((x) => x.code === 'P331' && x.reason.includes('P301+P330+P331')));
}
{
  const r = CLP.selectArticle28([{label: 'Ozone 1', h: ['H420']}], {audience: 'consumer', intendedUse: 'test'});
  t('Ozone: P502 is the consumer disposal statement', r.candidates.some((x) => x.code === 'P502' && x.legalStatus.includes('statutory')) && !r.review.some((x) => x.code === 'disposal'));
}
{
  const r = CLP.selectArticle28([{label: 'Skin Irrit. 2', h: ['H315']}, {label: 'Skin Sens. 1', h: ['H317']}], {audience: 'industrial', intendedUse: 'test'});
  t('P332+P313 omitted when P333+P313 is given (Annex IV)', (r.candidates.find((x) => x.code === 'P332+P313') || {}).decision === 'redundant');
}
{
  const g = spawnSync(process.execPath, [path.join(__dirname, 'build_annex_iv.js'), '--check'], {encoding: 'utf8'});
  t('Embedded Annex IV table and HTML copy are up to date', g.status === 0, g.stdout.trim());
}
console.log('\n' + pass + ' Annex IV table tests passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
