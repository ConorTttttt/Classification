# CLP Classification Export — Draft Phrase Library

**Status:** Draft wording for review. Not approved for automated regulatory use.
**Scope:** Proposed short phrases for a substance-by-substance and mixture-classification export.
**Current implementation:** Documentation only. The calculator's classification logic, UI, reports and tests are unchanged.

These are **phrase templates**, not assertions that a given formulation has a particular classification. Select them only when the existing classification result and supporting calculation establish the stated outcome. In particular, check the applicable SCL/GCL, relevant-ingredient cut-offs, M-factors, specific evidence and exceptions before issuing an exclusion phrase. A mixture hazard classification is distinct from an ingredient's own classification or its contribution to the mixture. The Section 3 SDS disclosure assessment is separate.

## A. Acute Toxicity

### 1. Acute Toxicity — Oral

**Classified**

- Classified as Acute Toxicity Cat. 1 H300. See the oral ATE calculation.
- Classified as Acute Toxicity Cat. 2 H300. See the oral ATE calculation.
- Classified as Acute Toxicity Cat. 3 H301. See the oral ATE calculation.
- Classified as Acute Toxicity Cat. 4 H302. See the oral ATE calculation.

**Not classified**

- Not classified as Acute Toxicity Cat. 4 H302. See the oral ATE calculation.

### 2. Acute Toxicity — Dermal

**Classified**

- Classified as Acute Toxicity Cat. 1 H310. See the dermal ATE calculation.
- Classified as Acute Toxicity Cat. 2 H310. See the dermal ATE calculation.
- Classified as Acute Toxicity Cat. 3 H311. See the dermal ATE calculation.
- Classified as Acute Toxicity Cat. 4 H312. See the dermal ATE calculation.

**Not classified**

- Not classified as Acute Toxicity Cat. 4 H312. See the dermal ATE calculation.

### 3. Acute Toxicity — Inhalation

**Classified**

- Classified as Acute Toxicity Cat. 1 H330. See the inhalation ATE calculation.
- Classified as Acute Toxicity Cat. 2 H330. See the inhalation ATE calculation.
- Classified as Acute Toxicity Cat. 3 H331. See the inhalation ATE calculation.
- Classified as Acute Toxicity Cat. 4 H332. See the inhalation ATE calculation.

**Not classified**

- Not classified as Acute Toxicity Cat. 4 H332. See the inhalation ATE calculation.

### 4. Ingredient Exclusion — Below Cut-off

**Acute Toxicity Categories 1–3**

- Not deemed a relevant ingredient for Acute Toxicity Cat. 1–3 calculation due to low inclusion (<0.1%) within the mixture (CLP Annex I, Table 1.1 and Section 3.1.3.3).

**Acute Toxicity Category 4**

- Not deemed a relevant ingredient for Acute Toxicity Cat. 4 calculation due to low inclusion (<1%) within the mixture (CLP Annex I, Section 3.1.3.3).

### 5. Ingredient Included in ATE Calculation

**Included — Mixture classified**

- Ingredient included in the ATE calculation. Mixture classified as Acute Toxicity Cat. [Category] [H-code]. See ATE calculation below.

**Included — Mixture not classified**

- Ingredient included in the ATE calculation. Mixture does not meet the acute toxicity classification criteria. See ATE calculation below.

### 6. ATE Conversion

**Category converted to ATE**

- Acute Toxicity category converted to an ATE value in accordance with CLP Annex I, Table 3.1.2. See ATE calculation below.

**Substance-specific ATE**

- Classification calculated using the entered substance-specific ATE value. See ATE calculation below (CLP Annex I, Section 3.1.3.6).

### 7. Unknown Acute Toxicity

**Unknown toxicity data**

- Acute toxicity data unavailable for this ingredient. See unknown toxicity assessment (CLP Annex I, Section 3.1.3.6.2.2).

**Unknown toxicity ≤10%**

- Standard ATE calculation applied. Ingredients with unknown acute toxicity do not exceed 10% of the mixture (CLP Annex I, Section 3.1.3.6.2.3).

**Unknown toxicity >10%**

- Modified ATE calculation applied due to ingredients with unknown acute toxicity exceeding 10% of the mixture (CLP Annex I, Section 3.1.3.6.2.3).

### 8. Further Review Required

**Missing ATE information**

- Acute Toxicity classification cannot be confirmed due to insufficient ATE information. Further assessment required.

**Conflicting classification data**

- Entered Acute Toxicity category does not match the supplied ATE value. Classification requires review.

**Inhalation exposure form**

- Inhalation ATE classification requires confirmation of exposure form (gas, vapour or dust/mist).

**Route-specific data**

- Acute toxicity information is unavailable for this exposure route. Further assessment may be required (CLP Annex I, Section 3.1.3.6.2.1).

**Implementation notes**

- The inhalation phrases apply to gas, vapour and dust/mist as appropriate; the actual ATE calculation must identify the form and units.
- Choose a route-specific phrase only when the calculation establishes that route's result. “Not classified as Cat. 4” is for a route with no acute-toxicity classification, not for a more severe category.
- The 0.1% / 1% exclusions are conditional: do not use an exclusion phrase when evidence or an applicable exception requires consideration below the generic cut-off.
- Unknown acute toxicity must be assessed by route; the 10% comparison applies to the relevant **combined** unknown fraction, not an individual ingredient's concentration.
- These are proposed explanations only; the existing classification engine and calculation trail remain the source of the numerical result.

---

## B. Remaining Health Hazards

## 1. Skin Corrosion / Irritation

**Classified**

- Classified as Skin Corr. Cat. 1A H314. See skin corrosion calculation below.
- Classified as Skin Corr. Cat. 1B H314. See skin corrosion calculation below.
- Classified as Skin Corr. Cat. 1C H314. See skin corrosion calculation below.
- Classified as Skin Corr. Cat. 1 H314. See skin corrosion calculation below.
- Classified as Skin Irrit. Cat. 2 H315. See skin irritation calculation below.

**Not classified**

- Not classified for skin corrosion or irritation. See calculation below.

**Below cut-off**

- Not deemed a relevant ingredient for skin corrosion/irritation calculation due to low inclusion (<1%) within the mixture (CLP Annex I, Table 1.1 and Section 3.2.3.3).

---

## 2. Serious Eye Damage / Eye Irritation

**Classified**

- Classified as Eye Dam. Cat. 1 H318. See eye damage calculation below.
- Classified as Eye Irrit. Cat. 2 H319. See eye irritation calculation below.

**Not classified**

- Not classified for serious eye damage or eye irritation. See calculation below.

**Below cut-off**

- Not deemed a relevant ingredient for eye damage/irritation calculation due to low inclusion (<1%) within the mixture (CLP Annex I, Table 1.1 and Section 3.3.3.3).

---

## 3. Skin Sensitisation

**Classified**

- Classified as Skin Sens. Cat. 1 H317 (CLP Annex I, Section 3.4.3.3).
- Classified as Skin Sens. Cat. 1A H317 (CLP Annex I, Section 3.4.3.3).
- Classified as Skin Sens. Cat. 1B H317 (CLP Annex I, Section 3.4.3.3).

**Not classified**

- Not classified as a skin sensitiser. Substance concentration is below the applicable classification limit (CLP Annex I, Table 3.4.5).

**Supplementary labelling**

- Mixture not classified as a skin sensitiser. EUH208 required due to the presence of a sensitising substance above the applicable elicitation limit (CLP Annex I, Table 3.4.6; Annex II, Section 2.8).

---

## 4. Respiratory Sensitisation

**Classified**

- Classified as Resp. Sens. Cat. 1 H334 (CLP Annex I, Section 3.4.3.3).
- Classified as Resp. Sens. Cat. 1A H334 (CLP Annex I, Section 3.4.3.3).
- Classified as Resp. Sens. Cat. 1B H334 (CLP Annex I, Section 3.4.3.3).

**Not classified**

- Not classified as a respiratory sensitiser. Substance concentration is below the applicable classification limit (CLP Annex I, Table 3.4.5).

**Supplementary labelling**

- Mixture not classified as a respiratory sensitiser. EUH208 required due to the presence of a respiratory sensitiser above the applicable elicitation limit (CLP Annex I, Table 3.4.6; Annex II, Section 2.8).

---

## 5. Germ Cell Mutagenicity

**Classified**

- Classified as Muta. Cat. 1A H340 (CLP Annex I, Table 3.5.2).
- Classified as Muta. Cat. 1B H340 (CLP Annex I, Table 3.5.2).
- Classified as Muta. Cat. 2 H341 (CLP Annex I, Table 3.5.2).

**Not classified**

- Not classified for germ cell mutagenicity. Substance concentration is below the applicable classification limit (CLP Annex I, Table 3.5.2).

---

## 6. Carcinogenicity

**Classified**

- Classified as Carc. Cat. 1A H350 (CLP Annex I, Table 3.6.2).
- Classified as Carc. Cat. 1B H350 (CLP Annex I, Table 3.6.2).
- Classified as Carc. Cat. 2 H351 (CLP Annex I, Table 3.6.2).

**Not classified**

- Not classified for carcinogenicity. Substance concentration is below the applicable classification limit (CLP Annex I, Table 3.6.2).

---

## 7. Reproductive Toxicity

**Classified**

- Classified as Repr. Cat. 1A H360 (CLP Annex I, Table 3.7.2).
- Classified as Repr. Cat. 1B H360 (CLP Annex I, Table 3.7.2).
- Classified as Repr. Cat. 2 H361 (CLP Annex I, Table 3.7.2).

**Differentiated effects**

- Classified as Repr. Cat. 1B H360F — fertility (CLP Annex I, Section 3.7).
- Classified as Repr. Cat. 1B H360D — development (CLP Annex I, Section 3.7).
- Classified as Repr. Cat. 1B H360FD — fertility and development (CLP Annex I, Section 3.7).
- Classified as Repr. Cat. 2 H361f — fertility (CLP Annex I, Section 3.7).
- Classified as Repr. Cat. 2 H361d — development (CLP Annex I, Section 3.7).
- Classified as Repr. Cat. 2 H361fd — fertility and development (CLP Annex I, Section 3.7).

**Not classified**

- Not classified for reproductive toxicity. Substance concentration is below the applicable classification limit (CLP Annex I, Table 3.7.2).

**Effects on or via lactation**

- Classified for effects on or via lactation H362 (CLP Annex I, Section 3.7.3.1.2).
- Not classified for effects on or via lactation. Substance concentration is below the applicable classification limit (CLP Annex I, Table 3.7.2).

---

## 8. Specific Target Organ Toxicity — Single Exposure (STOT SE)

**Classified**

- Classified as STOT SE Cat. 1 H370. See STOT SE classification below.
- Classified as STOT SE Cat. 2 H371. See STOT SE classification below.
- Classified as STOT SE Cat. 3 H335 — respiratory irritation. See STOT SE calculation below.
- Classified as STOT SE Cat. 3 H336 — narcotic effects. See STOT SE calculation below.

**Not classified**

- Not classified for STOT SE Cat. 1 or 2. Substance concentration is below the applicable classification limit (CLP Annex I, Table 3.8.3).
- Not classified for STOT SE Cat. 3. See calculation below.

**Below cut-off (Category 3)**

- Not deemed a relevant ingredient for STOT SE Cat. 3 calculation due to low inclusion (<1%) within the mixture (CLP Annex I, Section 3.8.3.4.6).

---

## 9. Specific Target Organ Toxicity — Repeated Exposure (STOT RE)

**Classified**

- Classified as STOT RE Cat. 1 H372. See STOT RE classification below.
- Classified as STOT RE Cat. 2 H373. See STOT RE classification below.

**Not classified**

- Not classified for STOT RE. Substance concentration is below the applicable classification limit (CLP Annex I, Table 3.9.4).

---

## 10. Aspiration Hazard

**Classified**

- Classified as Asp. Tox. Cat. 1 H304. See aspiration hazard calculation below.

**Not classified**

- Not classified for aspiration toxicity. See aspiration hazard calculation below.

**Below cut-off**

- Not deemed a relevant ingredient for aspiration hazard calculation due to low inclusion (<1%) within the mixture (CLP Annex I, Section 3.10.3.3.1.1).

**Further information required**

- Aspiration hazard classification cannot be confirmed. Mixture viscosity data required (CLP Annex I, Section 3.10.3.3.1.2).

---

## 11. Endocrine Disruption — Human Health

**Classified**

- Classified as Endocrine Disruption (Human Health) Cat. 1 EUH380 (CLP Annex I, Section 3.11.3.1).
- Classified as Endocrine Disruption (Human Health) Cat. 2 EUH381 (CLP Annex I, Section 3.11.3.1).

**Not classified**

- Not classified for endocrine disruption (human health). Substance concentration is below the applicable classification limit (CLP Annex I, Table 3.11.2).

---

## 12. Standard Review Wording

**Specific concentration limit**

- Classification assessed using the substance-specific concentration limit (SCL). See calculation below (CLP Article 10).

**Insufficient information**

- Classification cannot be confirmed due to insufficient substance or mixture data. Further assessment required.

**Substance hazard does not trigger mixture classification**

- Substance concentration is below the applicable classification limit. No mixture classification triggered for this hazard under the assessed method (CLP Annex I, relevant hazard-class section).

**Mixture classification determined by other information**

- Classification based on available mixture-specific evidence. See classification justification below.

---

## C. Environmental Hazards

These are **draft export phrases**. Use exclusions only where the applicable CLP cut-off or classification limit, M-factor, substance-specific evidence, and exceptions have been checked. Below a mixture-classification limit does not necessarily mean a substance is irrelevant for SDS Section 3 or other obligations.

### 1. Aquatic Acute Toxicity

**Classified**

- Classified as Aquatic Acute Cat. 1 H400 (See summation calculation below).

**Not classified**

- Not classified for Aquatic Acute toxicity. See summation calculation below.

**Below cut-off — Acute Category 1 (M = 1)**

- Not deemed a relevant ingredient for Aquatic Acute Cat. 1 calculation due to low inclusion (<0.1%) within the mixture (CLP Annex I, Section 4.1.3.1).

**Below M-factor-adjusted cut-off — Acute Category 1**

- Not deemed a relevant ingredient for Aquatic Acute Cat. 1 calculation due to low inclusion below the M-factor-adjusted cut-off (0.1% / M) (CLP Annex I, Section 4.1.3.1).

### 2. Aquatic Chronic Toxicity

**Classified**

- Classified as Aquatic Chronic Cat. 1 H410 (See summation calculation below).
- Classified as Aquatic Chronic Cat. 2 H411 (See summation calculation below).
- Classified as Aquatic Chronic Cat. 3 H412 (See summation calculation below).
- Classified as Aquatic Chronic Cat. 4 H413 (See summation calculation below).

**Not classified**

- Not classified for Aquatic Chronic toxicity. See summation calculation below.

**Below cut-off — Chronic Category 1 (M = 1)**

- Not deemed a relevant ingredient for Aquatic Chronic Cat. 1 calculation due to low inclusion (<0.1%) within the mixture (CLP Annex I, Section 4.1.3.1).

**Below M-factor-adjusted cut-off — Chronic Category 1**

- Not deemed a relevant ingredient for Aquatic Chronic Cat. 1 calculation due to low inclusion below the M-factor-adjusted cut-off (0.1% / M) (CLP Annex I, Section 4.1.3.1).

**Below cut-off — Chronic Categories 2–4**

- Not deemed a relevant ingredient for Aquatic Chronic Cat. 2–4 calculation due to low inclusion (<1%) within the mixture (CLP Annex I, Section 4.1.3.1).

### 3. Aquatic Toxicity — Further Assessment

**Ingredient included**

- Ingredient considered in the aquatic classification assessment. See summation calculation below (CLP Annex I, Section 4.1.3.5.5).

**M-factor applied**

- Aquatic classification assessed using the applicable M-factor. See summation calculation below (CLP Annex I, Section 4.1.3.5.5.5).

**Missing M-factor**

- Aquatic classification cannot be fully confirmed due to missing M-factor information. Further assessment required (CLP Annex I, Section 4.1.3.5.5.5).

**Below summation threshold**

- Not classified for aquatic toxicity. Relevant ingredient contributions do not meet the applicable summation threshold. See summation calculation below (CLP Annex I, Tables 4.1.1 and 4.1.2).

**Unknown aquatic toxicity**

- Aquatic toxicity information is incomplete for one or more ingredients. Further assessment required (CLP Annex I, Section 4.1.3.6).

### 4. Endocrine Disruption — Environment

**Classified**

- Classified as Endocrine Disruption (Environment) Cat. 1 EUH430 (CLP Annex I, Section 4.2.3.1).
- Classified as Endocrine Disruption (Environment) Cat. 2 EUH431 (CLP Annex I, Section 4.2.3.1).

**Not classified**

- Not classified for endocrine disruption (environment). Substance concentration is below the applicable classification limit (CLP Annex I, Table 4.2.2).

**Below classification limit — Category 1**

- Does not trigger Endocrine Disruption (Environment) Cat. 1 classification due to low inclusion (<0.1%) within the mixture (CLP Annex I, Table 4.2.2).

**Below classification limit — Category 2**

- Does not trigger Endocrine Disruption (Environment) Cat. 2 classification due to low inclusion (<1%) within the mixture (CLP Annex I, Table 4.2.2).

### 5. Persistent, Bioaccumulative and Toxic (PBT / vPvB)

**Classified**

- Classified as PBT EUH440 (CLP Annex I, Section 4.3.3.1).
- Classified as vPvB EUH441 (CLP Annex I, Section 4.3.3.1).

**Not classified**

- Not classified as PBT. No ingredient meets the applicable 0.1% classification threshold (CLP Annex I, Section 4.3.3.1).
- Not classified as vPvB. No ingredient meets the applicable 0.1% classification threshold (CLP Annex I, Section 4.3.3.1).

**Below classification limit**

- Ingredient does not trigger PBT classification due to low inclusion (<0.1%) within the mixture (CLP Annex I, Section 4.3.3.1).
- Ingredient does not trigger vPvB classification due to low inclusion (<0.1%) within the mixture (CLP Annex I, Section 4.3.3.1).

### 6. Persistent, Mobile and Toxic (PMT / vPvM)

**Classified**

- Classified as PMT EUH450 (CLP Annex I, Section 4.4.3.1).
- Classified as vPvM EUH451 (CLP Annex I, Section 4.4.3.1).

**Not classified**

- Not classified as PMT. No ingredient meets the applicable 0.1% classification threshold (CLP Annex I, Section 4.4.3.1).
- Not classified as vPvM. No ingredient meets the applicable 0.1% classification threshold (CLP Annex I, Section 4.4.3.1).

**Below classification limit**

- Ingredient does not trigger PMT classification due to low inclusion (<0.1%) within the mixture (CLP Annex I, Section 4.4.3.1).
- Ingredient does not trigger vPvM classification due to low inclusion (<0.1%) within the mixture (CLP Annex I, Section 4.4.3.1).

### 7. Hazardous to the Ozone Layer

**Classified**

- Classified as Hazardous to the Ozone Layer Cat. 1 H420 (CLP Annex I, Section 5.1.3.1).

**Not classified**

- Not classified as hazardous to the ozone layer. No ingredient meets the applicable classification threshold (CLP Annex I, Table 5.1).

**Below classification limit**

- Ingredient does not trigger ozone layer hazard classification due to low inclusion (<0.1%) within the mixture (CLP Annex I, Section 5.1.3.1, Table 5.1).

**Environmental implementation notes**

- For Aquatic Acute 1 / Chronic 1, determine the *applicable* M-factor and use the adjusted cut-off (0.1% / M). Do not use the unadjusted 0.1% wording when M > 1.
- Aquatic Chronic 2–4 usually use a 1% relevance cut-off, but lower concentrations may still be relevant where supported by evidence (CLP Annex I, Section 4.1.3.1).
- “Below classification limit” for endocrine disruption, PBT, vPvB, PMT, vPvM and ozone is not the same as the aquatic *relevant-ingredient cut-off*. It describes a mixture classification trigger under the stated method, not permission to omit SDS disclosures.
- Category 2 endocrine-disrupting substances at 0.1% or more can trigger SDS-on-request obligations even when below the 1% mixture classification limit (Tables 4.2.2 and 3.11.2, note 1).
- For the newer environmental hazard classes, check the mixture transition provisions and whether whole-mixture data or other evidence change the classification.
- These phrases have not yet been connected to automatic exports. The engine's actual results and the underlying calculation/evidence take precedence.

---

## Notes before implementation

- These phrases are stored for discussion; **none are wired into the export yet**.
- Use the engine's actual hazard/route/category and calculation data, not matching H-codes alone, to select a phrase.
- Do not use a “below cut-off” statement when an SCL, other hazard-specific criterion or evidence makes the ingredient relevant below the generic cut-off.
- “Not classified” describes the assessed mixture hazard outcome; ingredient-level statements must not be mistaken for the mixture's final classification.
- For reported omissions and supplementary labelling, retain the separate CLP Article 27 and Annex II assessments.
- Validate the applicable CLP consolidated edition, legislation dates and substance-specific entries before using these phrases in a regulatory report.
