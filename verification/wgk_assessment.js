/* WGK PURE ASSESSMENT: Germany AwSV Annex 1 sections 2.2 and 5.2.
 * Deliberately independent of the CLP classification engine.
 * Browser-local; no online lookup, no assertion that user-entered WGKs are official.
 */
(function(root, factory) {
  const api=factory();
  if(typeof module==="object" && module.exports) module.exports=api;
  else root.WGK=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const EPS=1e-9;
const asNumber=v=>{
  if(v===null||v===undefined||String(v).trim()==="")return NaN;
  return Number(String(v).trim().replace(",","."));
};
const nice=n=>Number.isFinite(n)?String(Math.round(n*1e6)/1e6):"unknown";
const validClass=new Set(["1","2","3","nwg","awg"]);
function assess(mix){
  const m=mix||{}, input=Array.isArray(m.ingredients)?m.ingredients:[];
  const rows=[],warnings=[],steps=[],blockers=[];
  let total=0,wgk1=0,wgk2=0,wgk3=0,wgk2Raw=0,wgk3Raw=0;
  let rawUnknown=0, addedCarc=false,carc2=false,carc3=false,carcBelow=false;
  let w2Present=false,w3Present=false,w2Single=false,w3Single=false;
  const fail=(s)=>{if(!blockers.includes(s))blockers.push(s);};
  input.forEach((ing,index)=>{
    if(!ing)return;
    const name=String(ing.name||ing.cas||"Ingredient "+(index+1)).trim(),
      pct=asNumber(ing.pct),wgk=String(ing.wgkClass||"").trim().toLowerCase();
    if(!Number.isFinite(pct)||pct<0||pct>100){fail(name+": invalid or missing concentration.");return;}
    if(pct===0)return;
    total+=pct;
    if(!wgk||!validClass.has(wgk)){
      rawUnknown+=pct;
      fail(name+": WGK/nwg status has not been verified in Rigoletto or other appropriate documentation.");
      rows.push({name,pct,wgk:"?",effective:null});return;
    }
    if(wgk==="awg"){
      fail(name+": awg (allgemein wassergefährdend) needs specific floating-material/mixture assessment; do not convert it to a numbered WGK.");
      rows.push({name,pct,wgk,effective:null});return;
    }
    const source=String(ing.wgkSource||"").trim();
    if(!source)fail(name+": record the WGK source, e.g. UBA Rigoletto Kenn-Nr and review date.");
    const carcinogenic=String(ing.wgkCarc||"").trim().toLowerCase();
    let factor=1;
    if(wgk==="2"||wgk==="3"){
      const entered=asNumber(ing.wgkM);
      if(!Number.isFinite(entered)||entered<1){
        fail(name+": confirm the applicable AwSV §1.4 M-factor (enter 1 if none applies).");
      } else factor=entered;
      if(carcinogenic!=="yes"&&carcinogenic!=="no")
        fail(name+": confirm AwSV 1.2 carcinogenic status (1A/1B; inhalation-only excluded).");
      if(carcinogenic==="yes") {
        addedCarc=true;
        // AwSV 5.1.3 allows substance-specific concentration exceptions.
        warnings.push(name+": carcinogenic threshold may differ where CLP-specific concentration limits apply; verify before relying on the result (5.1.3).");
      }
    } else if(carcinogenic==="yes"){
      addedCarc=true;
      warnings.push(name+": verify carcinogenic status and the published substance WGK.");
    }
    if(wgk==="nwg"&&carcinogenic==="yes")
      fail(name+": 'nwg' and carcinogenic status conflict; verify the source classification.");
    const eff=pct*factor,carc=carcinogenic==="yes";
    rows.push({name,pct,wgk,effective:eff,factor,carcinogenic:carc});
    if(wgk==="1"){
      wgk1+=pct;
    }else if(wgk==="2"){
      wgk2Raw+=pct;
      if(carc){
        if(pct+EPS>=0.1)carc2=true;
        else carcBelow=true;
      }else if(eff+EPS>=0.2){
        wgk2+=eff;w2Present=true;w2Single=true;
      }
    }else if(wgk==="3"){
      wgk3Raw+=pct;
      if(carc){
        if(pct+EPS>=0.1)carc3=true;
        else carcBelow=true;
      }else if(eff+EPS>=0.2){
        wgk3+=eff;w3Present=true;w3Single=true;
      }
    }
  });
  if(!input.length)fail("Add at least one identified ingredient.");
  if(total>100+EPS)fail("Entered concentrations exceed 100%.");
  if(total<EPS)fail("No positive ingredient percentage is entered.");
  const remainder=Math.max(0,100-total);
  if(remainder>EPS){
    fail(nice(remainder)+"% of the formulation is not entered. No assumption is made about its WGK, carcinogenic status or M-factor.");
    warnings.push("An unentered balance is NOT automatically assumed to be water or non-hazardous. The AwSV WGK may increase when it is identified.");
  }
  if(rawUnknown>0)warnings.push(nice(rawUnknown)+"% of entered material lacks a verified WGK; AwSV 5.1.1 treats non-identified/not-classified material conservatively as WGK 3, subject to its specific rules.");
  if(m.state==="solid"&&!m.wgkSolidAssessed){
    return {status:"special",classification:"awg — generally water hazardous (solid mixture default)",
      enteredTotal:total,remainder,rows,steps:[
      "AwSV §3(2)(8): solid mixtures are generally water hazardous, unless a documented applicable §10 or other statutory exception changes the classification.",
      "Tick 'Solid-mixture §10 assessment documented' only after verifying the exception."],
      blockers,warnings};
  }
  if(m.state==="solid"&&m.wgkSolidAssessed)
    warnings.push("Solid-mixture WGK calculations require a valid AwSV §10 assessment/documentation.");
  let candidate="nwg / WGK 1",basis="2.2 and 5.2.3",floor="";
  if(carc3){
    candidate="WGK 3";basis="5.2.1(a); 5.1.3";steps.push("WGK 3 carcinogenic constituent reaches the 0.1% standard consideration threshold.");
  }else if(wgk3+EPS>=3){
    candidate="WGK 3";basis="5.2.1(b)";steps.push("Relevant WGK 3 effective constituent mass shares total "+nice(wgk3)+"% (≥3%).");
  }else if(carc2){
    candidate="WGK 2";basis="5.2.2(a); 5.1.3";steps.push("WGK 2 carcinogenic constituent reaches the standard 0.1% consideration threshold.");
  }else if(wgk2+EPS>=5){
    candidate="WGK 2";basis="5.2.2(b)";steps.push("Relevant WGK 2 effective constituent mass shares total "+nice(wgk2)+"% (≥5%).");
  }else if(w3Single){
    candidate="WGK 2";basis="5.2.2(c,d)";steps.push("At least one relevant non-carcinogenic WGK 3 constituent reaches 0.2%, but WGK 3 threshold is not reached.");
  }else if(carcBelow||addedCarc||w2Single||wgk1+EPS>=3){
    candidate="WGK 1";basis="5.2.3(a-d)";
    steps.push("WGK 1 conditions triggered by entered substances, subject to the higher-class rules and exclusions.");
  }else{
    steps.push("Entered WGK shares are below class-triggering limits; must assess ALL 'nwg' Annex 1 §2.2 criteria before assigning nwg.");
    if(m.wgkNwgVerified&&wgk1<3-EPS&&wgk2Raw<0.2-EPS&&wgk3Raw<0.2-EPS&&rawUnknown<0.2-EPS&&!addedCarc&&!wgk3Raw)
      candidate="nwg";
    else candidate="nwg / WGK 1";
    if(candidate==="nwg")basis="2.2(a-i)";
    else fail("The non-water-hazardous (nwg) criteria (Annex 1 §2.2 e–i) have not all been verified.");
  }
  // A non-water-hazardous finding is not possible where an intentionally added
  // WGK3 material exists, even when the concentration is below 0.2%.
  if(candidate==="nwg" && wgk3Raw>EPS){
    candidate="WGK 1";basis="5.2.3(e)";
    steps.push("A WGK 3 component exists: confirm whether deliberately added; nwg is not assumed.");
    fail("A WGK 3 component requires evidence of non-intentional addition before nwg can be established.");
  }
  if(rawUnknown>0 && candidate==="nwg"){candidate="nwg / WGK 1";fail("Unknown constituents prevent a verified nwg conclusion.");}
  steps.push("WGK 1 total: "+nice(wgk1)+"%; relevant WGK 2 effective sum: "+nice(wgk2)+"%; relevant WGK 3 effective sum: "+nice(wgk3)+"%. M-factors are applied only where explicitly entered.");
  steps.push("Reported result is a component-based AwSV Annex 1 §5.2 screening result, not a §5.3 mixture-tested determination.");
  const status=blockers.length?"provisional":"derived";
  if(status==="provisional")warnings.push("PROVISIONAL ONLY. Missing composition, source data or legal-condition checks may change the class. Do not record this as a certified final WGK.");
  return {status,classification:candidate,basis,enteredTotal:total,remainder,rows,steps,blockers,warnings,details:{
    wgk1,wgk2,wgk3,wgk2Raw,wgk3Raw,rawUnknown,carc2,carc3
  }};
}
function report(result){
  const r=result||{},lines=[
    "GERMAN WATER HAZARD CLASS (AwSV Annex 1) — NOT PART OF CLP CLASSIFICATION",
    "Result: "+(r.classification||"not assessed")+"; status: "+(r.status||"review"),
    "Entered: "+nice(r.enteredTotal)+"%; not entered: "+nice(r.remainder)+"%",
    "Method: composition-based screening; §§2.2, 5.1–5.2 unless solid default applies"
  ];
  (r.rows||[]).forEach(x=>lines.push("- "+x.name+": "+nice(x.pct)+"%, WGK "+x.wgk+
    (Number.isFinite(x.effective)?", effective "+nice(x.effective)+"%":"")));
  (r.steps||[]).forEach(x=>lines.push("- "+x));
  (r.blockers||[]).forEach(x=>lines.push("REVIEW: "+x));
  (r.warnings||[]).forEach(x=>lines.push("WARNING: "+x));
  lines.push("Source: https://www.gesetze-im-internet.de/awsv/anlage_1.html");
  lines.push("Verify current UBA Rigoletto records, footnotes, mixture exemptions, §5.3 test data and local documentation obligations.");
  return lines.join("\n");
}
return {assess,report};
});
