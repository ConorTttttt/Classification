# Article 22 and Article 28 — precautionary statements (P-statements)

**Implementation status:** Auditable candidate selector built on the complete Annex IV Part 1 table, with legal-obligation checks. **NOT a final approved label**: conditional statements, wording choices and the final selection need supplier review.

## Regulatory distinction: what is mandatory?

Regulation (EC) 1272/2008:
- **Article 22(1)**: the label **shall** include relevant precautionary statements.
- **Article 22(2)-(4)**: statement selection comes from the label element tables in Annex I Parts 2-5, must use the criteria in **Annex IV Part 1**, account for hazards and intended uses, and use the official wording in **Annex IV Part 2**.
- **Article 28(1)**: precautionary statements that are clearly redundant or unnecessary for the product/packaging **shall** be omitted.
- **Article 28(2)**: where supplied to the **general public**, a disposal precautionary statement addressing the substance/mixture **and packaging** **shall** appear, **unless not required under Article 22**. In other situations disposal is not required when disposal clearly poses no health/environmental hazard.
- **Article 28(3)**: normally **not more than six** P-statements, but more **are allowed when necessary** to reflect the nature and severity of hazards.

**There is NOT a rule that every H-code has one universally mandatory individual P-code.** Annex IV identifies eligibility and conditions for statements, which need a product-specific selection. Some choices are only relevant for consumer products, e.g. P101/P102/P103, which are listed for consumer products **as appropriate**; these should not automatically be labelled "mandatory" for every consumer product.

For disposal, **P501** is an eligible Annex IV Table 6.5 code for the hazard classes listed there. The **legal obligation is to convey appropriate disposal precautions**, not to universally mandate the literal code P501 for every formulation. For ozone hazards and certain explosives Annex IV has different disposal/recovery codes (e.g., P502/P503). P501, P502 or P503 satisfies the consumer disposal check where Annex IV lists it; if none is listed, the engine **flags a blocker for manual review** rather than inventing one.

## Current implementation

The engine adds `selectArticle28(outcomes, mixture)` as a **separate layer after classification and Article 26/27 label decisions**. It works from the classified hazard outcomes, rather than incorrectly restricting candidate P statements to the H-codes surviving Article 27.

The Mixture form now has:
- **Audience**: Unknown (default), General public/consumer, Professional, Industrial.
- **Intended use**, **P501 disposal destination**, and **P280 protective equipment**.
- **Manual P-code additions**, **manual exclusions** and **a documented reason** for exclusions.

The draft proposed label includes up to six prioritised statements, and the **Article 28 — precautionary-statement decisions** panel shows:
- **Required legal obligations** (e.g. conditional consumer disposal).
- **Proposed P statements** with precise code, provisional wording, source hazard classes, Annex IV basis, and why selected.
- **All candidates** including nonselected, redundantly omitted, and manually excluded ones, with reasons.
- **Blocking gaps** for unknown consumer status, incomplete disposal wording, unmapped H statements, unreviewed words, and more than six candidates.
- **Supplier choices** (e.g. appropriate protective equipment, exposure form, poison-centre medical advice) marked as requiring review.

`result.label.article28` contains: `selected`, `candidates`, `requiredObligations`, `review`, `uncovered`, `warnings`, `audience`, `excessCandidateCount`, `readyForFinalLabel:false` and `scope`. `result.label.precautionaryStatements` exposes the current draft selection. All underlying mixture classifications and Articles 26/27 decisions remain unchanged.

### Candidate source: the Annex IV Part 1 table

Candidates come from the full Annex IV Part 1 table (Tables 6.1–6.5, 129 statements), embedded in `verification/engine.js`
by `verification/build_annex_iv.js` from `data/legal/` (see `data/legal/SOURCES.md`). Each statement keeps its hazard
class, category and Annex IV "conditions for use":

- **Hazard class and category** are read from the outcome label, using the Annex VI Table 1.1 codes the calculator
  already uses (`Acute Tox. 3 (dermal)`, `Org. Perox. CD`, `STOT SE 3 (narcotic effects)` …). Manual entries should use
  these codes. With H-codes only, statements common to every class carrying that H-code are proposed; the rest are
  held as **class to confirm** (H240–H242 organic peroxide vs self-reactive, H250 pyrophoric liquid vs solid, H261
  water-reactive Category 2 vs 3).
- **Conditional statements** ("— if the liquid is volatile and may generate an explosive atmosphere", "— if immediate
  administration of antidote is required") are held as **condition pending** with the Annex IV condition quoted. Add
  them as manual P-statements once confirmed. P273 stays a candidate with its intended-use review.
- **Consumer-only statements** (P101, P102, P103, P201 for CMR) appear only for consumer supply.
- **Combinations:** a single statement that the same hazard class lists inside one of its combinations is not proposed
  (e.g. P310 for acute oral toxicity is carried by P301+P310), matching the Annex I label tables. Component clauses such
  as "IF SWALLOWED:" are never proposed alone.
- **ED, PBT/vPvB, PMT/vPvM** (Regulation (EU) 2023/707) have no Annex IV Part 1 rows; their statements come from Annex I
  Tables 3.11.3, 4.2.3, 4.3.1 and 4.4.1.
- **Disposal:** P501, or P502 (ozone) / P503 (explosives) where Annex IV lists those, meets the Article 28(2) consumer
  disposal check.

`verification/test_annex_iv_table.js` compares the candidates for every class/category with the statements listed in the
Annex I label tables, an independent source, and records the known differences inside the consolidated text.

### Redundancy and six-statement policy

Annex IV "omit where … is used" / "may be omitted if/when … is given" conditions are applied as optional omissions
(not for manually added statements): **P103** and **P201** where **P202** is used; **P261** where **P260** is given;
**P332+P313** where **P333+P313** is given. When a selected single statement's wording also appears in a selected
combination (e.g. P331 beside P301+P330+P331), an Article 28(1) review item asks whether it is clearly redundant.

The draft order uses a priority per statement. Article 28 and Annex IV set no order, so this is a judgement: the 21
statements of the earlier catalogue keep their priorities, others take a default per Annex IV table.

The proposed list is capped at six for initial display. When more candidates qualify, the engine **does not claim** that the six priority-ranked suggestions are the right final choice; instead it issues an **Article 28(3) blocker** and preserves all alternatives. Additional statements may be needed for severity, and the label needs human review.

Manual exclusions require a documented reason. The conditional consumer disposal statement is **not automatically removed** even when the user requests its exclusion; the attempted exclusion is flagged.

### Wording completion is necessary

Annex IV Part 1 requires a supplier to choose bracketed/diagonal alternatives and fill **…** placeholders according to the conditions for use. For example:
- P501 requires a destination and whether the precautions concern contents and/or packaging.
- P280 requires the appropriate protective equipment type.
- Some medical response codes require an appropriate source of medical advice.
- P273 should be selected with reference to intended use (especially where release is the intended use).

The engine treats unresolved choices as review/blocking items and never marks the full output approved. It also blocks unverified manual codes and conditional square-bracket alternatives, and it does not add general consumer precautions when no classified hazards have been entered.

## Verification

Run from repository root:

```bash
node verification/test_engine.js
node verification/test_article26.js
node verification/test_article28.js
node verification/test_ui_structure.js
node verification/test_annex_iv_table.js
```

The Article 28 suite has 51 tests; `verification/test_annex_iv_table.js` adds the Annex I cross-check. It checks consumer disposal, applicability, unknown audience, wording placeholders, six-statement overflow, Annex IV redundancy, manual additions and exclusions, deduplication and report outputs. UI tests are **source checks**, not live-browser interaction tests.

## Primary legal references

- [CLP Regulation (EC) No 1272/2008 — Articles 22 and 28](https://eur-lex.europa.eu/eli/reg/2008/1272/oj/eng).
- [CLP Annex IV, Part 1 Tables 6.1–6.5 and Part 2 wording (consolidated reference)](https://reachlex.eu/en/clp/annex-iv-list-of-precautionary-statements/).
- [ECHA — Decide on classification and labelling](https://echa.europa.eu/en/support/mixture-classification/decide-on-classification-and-labelling).
- [ECHA — CLP Guidance on Labelling and Packaging, Chapter 7](https://echa.europa.eu/guidance-documents/guidance-on-clp).

**Before professional use:** Verify the current official EU consolidated version, all applicable Annex I and Annex IV conditions, the chosen language and exact wording, and the intended use, disposal and packaging information.

## EU CLP statements and later UN GHS differences (November 2026)

P202 and P301+P310 remain listed in EU CLP Annex IV. Later UN GHS revisions
use P203 and P301+P316 instead; those changes do not automatically amend EU CLP.
For the EU CLP calculator, the Article 28 audit shows an informational note
about the GHS difference, without treating the EU codes as obsolete or
automatically substituting the later UN GHS codes. Always use the version
of EU CLP Annex IV legally applicable to the label.
