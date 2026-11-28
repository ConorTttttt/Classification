// "Export for SDS" (schema sds-classification/1): a snapshot of classify() for SDS authoring tools.
// Run from repo root: node verification/test_sds_export.js
'use strict';
const fs = require('fs');
const CLP = require('./engine.js');
let pass = 0, fail = 0;
const t = (name, ok) => { if (ok) pass++; else { fail++; console.log('FAIL: ' + name); } };
const ing = (o) => Object.assign(CLP.blankIngredient(), o);

const mix = {
  name: 'Export test', state: 'liquid', flashPoint: '20', ibp: '80', pH: '7', audience: 'professional', intendedUse: 'cleaning',
  ingredients: [
    ing({name: 'Solvent A', cas: '64-17-5', pct: '60', hcodes: 'H225 H319', eye: '2'}),
    ing({name: 'Corrosive B', cas: '1310-73-2', pct: '6', hcodes: 'H314', skinCorr: '1A'}),
    ing({name: 'Water', pct: '34'})
  ],
  manual: [{label: 'Met. Corr. 1', h: 'H290', signal: 'Warning', picto: 'GHS05'}]
};
const result = CLP.classify(mix);
const x = CLP.exportForSds(mix, result, {generated: '2026-11-28T00:00:00Z', commit: 'abc1234'});

t('Schema tag', x.schema === 'sds-classification/1' && CLP.SDS_EXPORT_SCHEMA === x.schema);
t('Draft status stated', /competent person/.test(x.status));
t('Engine identified, commit passed through', x.engine.module === 'verification/engine.js' && x.engine.commit === 'abc1234');
t('Mixture data numeric', x.mixture.flash_point_c === 20 && x.mixture.initial_boiling_point_c === 80 && x.mixture.ph === 7);
t('Ingredients carried with H-codes', x.ingredients.length === 3 && x.ingredients[0].h.includes('H225') && x.ingredients[0].pct === 60);
t('Every outcome exported', x.classification.length === result.outcomes.length);
const flam = x.classification.find((c) => c.h.includes('H225'));
t('Class and category split from the label', flam && flam.class === 'Flam. Liq.' && flam.category === '2' && flam.basis === 'calculated');
const man = x.classification.find((c) => c.h.includes('H290'));
t('Manual entry marked manual', man && man.basis === 'manual' && x.manual_classifications.some((m) => m.h.includes('H290')));
t('Signal word as classify', x.label.signal_word === result.label.signal);
t('Pictograms as classify', JSON.stringify(x.label.pictograms) === JSON.stringify(result.label.pictograms.map((p) => p.code)));
t('Hazard statements as Article 27 output', JSON.stringify(x.label.hazard_statements) === JSON.stringify(result.label.hazardStatements.map((h) => h.code)));
t('Selected P-statements as Article 28 output', JSON.stringify(x.label.p_statements_selected) === JSON.stringify(result.label.precautionaryStatements.map((p) => p.code)));
t('All P candidates with decisions', x.label.p_statements_candidates.length === result.label.article28.candidates.length &&
  x.label.p_statements_candidates.every((p) => p.code && p.decision && p.legalStatus));
t('Article 28 review carried', x.label.p_review.length === result.label.article28.review.length);
t('Calculation trail carried', x.trail.length === result.hazards.length && x.trail.every((h) => Array.isArray(h.steps)));
t('Warnings and notes carried', JSON.stringify(x.warnings) === JSON.stringify(result.warnings) && x.notes.length === result.notes.length);
t('JSON round trip', JSON.stringify(JSON.parse(JSON.stringify(x))) === JSON.stringify(x));
t('Export does not change the result', JSON.stringify(CLP.classify(mix).outcomes) === JSON.stringify(result.outcomes));
const y = CLP.exportForSds(mix, undefined, {generated: '2026-11-28T00:00:00Z', commit: 'abc1234'});
t('Without a result, classify() is run', JSON.stringify(y.classification) === JSON.stringify(x.classification));
t('Label with route qualifier', (() => { const c = CLP.exportForSds({ingredients: [ing({name: 'T', pct: '100', hcodes: 'H301', acute: {oral: {cat: '3', ate: '', unknown: false}, dermal: {cat: '', ate: '', unknown: false}, inh: {form: 'vapour', cat: '', ate: '', unknown: false}, unknown: false}})]}).classification
  .find((o) => o.h.includes('H301')); return c && c.class === 'Acute Tox.' && c.category === '3' && c.qualifier === 'oral'; })());

const html = fs.readFileSync('clp_mixture_calculator.html', 'utf8');
t('Export for SDS button present', html.includes('id="sdsexp"') && html.includes('>Export for SDS</button>'));
t('Button writes sds-classification JSON', html.includes('.sds-classification.json') && html.includes('CLP.exportForSds(mix, res, {})'));
console.log('\n' + pass + ' SDS export tests passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
