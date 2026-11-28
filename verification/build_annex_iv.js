// Generates the CLP Annex IV Part 1 precautionary-statement table embedded in verification/engine.js and copies
// the engine into the offline calculator page.
//   node verification/build_annex_iv.js           regenerate the table block and sync clp_mixture_calculator.html
//   node verification/build_annex_iv.js --check   exit 1 if engine.js or the HTML is out of date
//
// Source data: data/legal/*.json, extracted from the consolidated text of Regulation (EC) No 1272/2008
// (CELEX 02008R1272-20270101, EUR-Lex). EU legal texts may be reused with credit to the source; changes are marked:
// the tables were extracted from the consolidated text and restructured; statement wording is unchanged.
// Annex IV Part 1 is identical in the 01.07.2026 and 01.01.2027 consolidations.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const LEGAL = path.join(ROOT, 'data', 'legal');
const ENGINE = path.join(__dirname, 'engine.js');
const HTML = path.join(ROOT, 'clp_mixture_calculator.html');
const BEGIN = '  /* BEGIN GENERATED ANNEX IV TABLE (verification/build_annex_iv.js; do not edit by hand) */';
const END = '  /* END GENERATED ANNEX IV TABLE */';

const load = (prefix) => {
  const f = fs.readdirSync(LEGAL).filter((x) => x.startsWith(prefix) && x.endsWith('.json')).sort().pop();
  return JSON.parse(fs.readFileSync(path.join(LEGAL, f), 'utf8'));
};

// Annex I Table 3.2.5 gives skin corrosion Category 1 and sub-categories 1A/1B/1C one column, but some Annex IV rows
// list 1A, 1B, 1C only; Annex I 2.2.2.1: pyrophoric and chemically unstable gases are always Category 1A.
const EQUIVALENT = [['skin_corrosion|1', 'skin_corrosion|1A']];
const INCLUDES = [['flammable_gases|Pyrophoric gas', 'flammable_gases|1A'], ['flammable_gases|A', 'flammable_gases|1A'],
  ['flammable_gases|B', 'flammable_gases|1A']];
const GROUP = {'6.1': 'general', '6.2': 'prevention', '6.3': 'response', '6.4': 'storage', '6.5': 'disposal'};

function build() {
  const iv = load('clp_annex_iv_eu_');
  const lab = load('clp_annex_i_label_p_eu_');
  const cat = load('clp_category_h_eu_');
  const codes = load('clp_annex_vi_codes_eu_');
  const conditions = [''];
  const cond = (c) => { const i = conditions.indexOf(c); return i >= 0 ? i : conditions.push(c) - 1; };
  const statements = iv.statements.map((s) => [s.code, s.text, GROUP[s.table] || 'general']);
  const byClass = {};
  iv.statements.forEach((s) => s.rows.forEach((r) => {
    if (!r.class_key) return;                                   // P101-P103 "as appropriate": consumer rules
    r.categories.forEach((c) => {
      const k = r.class_key + '|' + c;
      (byClass[k] = byClass[k] || {})[s.code] = cond(r.conditions);
    });
  }));
  for (const [k, other] of EQUIVALENT.concat(INCLUDES))
    for (const [code, ci] of Object.entries(byClass[other] || {})) (byClass[k] = byClass[k] || {})[code] ??= ci;
  // Classes added by Regulation (EU) 2023/707 have label tables in Annex I but no Annex IV Part 1 rows.
  const annexI = {};
  lab.entries.filter((e) => !Object.keys(byClass).some((k) => k.startsWith(e.class_key + '|')) && e.p.length)
    .forEach((e) => {
      const k = e.class_key + '|' + e.category;
      byClass[k] = Object.fromEntries(e.p.map((p) => [p, 0]));
      annexI[k] = e.source.split(' ').slice(0, 2).join(' ').replace(/\.$/, '');
      e.p.forEach((p) => { if (!statements.some((s) => s[0] === p)) throw new Error('No Annex IV wording for ' + p); });
    });
  const hClasses = {};
  cat.entries.forEach((e) => e.h.forEach((h) => (hClasses[h] = hClasses[h] || []).push(e.class_key + '|' + e.category)));
  const classCodes = Object.fromEntries(codes.entries.map((e) => [e.code, [e.class_key, e.categories]]));
  return {
    source: iv.source, celex: iv.celex, url: iv.url, retrieved: iv.retrieved, reuse: iv.reuse,
    statements, conditions, byClass, annexI, hClasses, classCodes,
  };
}

function block(t) {
  const j = (x) => JSON.stringify(x);
  const lines = [BEGIN,
    '  // ' + t.source + ' (' + t.celex + ', retrieved ' + t.retrieved + '). ' + t.reuse,
    '  const ANNEX_IV = Object.freeze({',
    '    source:' + j(t.source + ', Annex IV Part 1 (Tables 6.1-6.5); ' + t.celex) + ',',
    '    // [code, official English wording (Part 1, column 2), table group]',
    '    statements:[', ...t.statements.map((s) => '      ' + j(s) + ','), '    ],',
    '    // Annex IV Part 1 column 5 "conditions for use"; index 0 = none',
    '    conditions:[', ...t.conditions.map((c) => '      ' + j(c) + ','), '    ],',
    '    // hazard class|category -> {code: condition index}',
    '    byClass:{', ...Object.entries(t.byClass).map(([k, v]) => '      ' + j(k) + ':' + j(v) + ','), '    },',
    '    // classes whose statements come from an Annex I label table (no Annex IV Part 1 rows)',
    '    annexI:' + j(t.annexI) + ',',
    '    // H/EUH code -> hazard class|category entries carrying it (Annex I label tables)',
    '    hClasses:{', ...Object.entries(t.hClasses).map(([k, v]) => '      ' + j(k) + ':' + j(v) + ','), '    },',
    '    // Annex VI Table 1.1 hazard class and category codes',
    '    classCodes:{', ...Object.entries(t.classCodes).map(([k, v]) => '      ' + j(k) + ':' + j(v) + ','), '    }',
    '  });',
    END];
  return lines.join('\n');
}

function render() {
  const src = fs.readFileSync(ENGINE, 'utf8');
  const a = src.indexOf(BEGIN), b = src.indexOf(END);
  if (a < 0 || b < 0) throw new Error('Generated-block markers not found in engine.js');
  const engine = src.slice(0, a) + block(build()) + src.slice(b + END.length);
  const html = fs.readFileSync(HTML, 'utf8');
  const s = html.indexOf('<script>\n') + '<script>\n'.length, e = html.indexOf('\n</script>', s);
  return {engine, html: html.slice(0, s) + engine.trimEnd() + html.slice(e)};
}

const out = render();
if (process.argv.includes('--check')) {
  const ok = out.engine === fs.readFileSync(ENGINE, 'utf8') && out.html === fs.readFileSync(HTML, 'utf8');
  console.log(ok ? 'Annex IV table and HTML engine copy are up to date' : 'OUT OF DATE: run node verification/build_annex_iv.js');
  process.exit(ok ? 0 : 1);
}
fs.writeFileSync(ENGINE, out.engine);
fs.writeFileSync(HTML, out.html);
console.log('engine.js Annex IV table regenerated; clp_mixture_calculator.html synced');
