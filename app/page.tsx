"use client";

import { useRef, useState } from "react";
import { BriefcaseBusiness, Calculator, ChevronRight, CircleAlert, Landmark, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const euro0 = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("en-IE", { style: "percent", maximumFractionDigits: 1 });
const numberValue = (value: string) => Math.max(0, Number(value) || 0);

const ageReliefRate = (age: number) => {
  if (age < 30) return 0.15;
  if (age < 40) return 0.2;
  if (age < 50) return 0.25;
  if (age < 55) return 0.3;
  if (age < 60) return 0.35;
  return 0.4;
};

function futureValue(initial: number, monthly: number, years: number, annualNetRate: number) {
  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = annualNetRate / 12;
  if (!months) return initial;
  if (Math.abs(monthlyRate) < 0.0000001) return initial + monthly * months;
  const factor = Math.pow(1 + monthlyRate, months);
  return initial * factor + monthly * ((factor - 1) / monthlyRate);
}

function Field({ label, value, onChange, prefix = "€", suffix, step = "1", min = "0", max, hint }: {
  label: string; value: number; onChange: (value: string) => void; prefix?: string; suffix?: string; step?: string; min?: string; max?: string; hint?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-control">
        {prefix && <span className="field-affix">{prefix}</span>}
        <input type="number" inputMode="decimal" value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} />
        {suffix && <span className="field-affix suffix">{suffix}</span>}
      </span>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function ResultCard({ label, value, detail, accent = false }: { label: string; value: string; detail: string; accent?: boolean }) {
  return <article className={`result-card ${accent ? "accent" : ""}`}><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function ProgressBar({ value }: { value: number }) {
  return <div className="progress-track" aria-label={`${Math.round(value * 100)}%`}><span style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} /></div>;
}

function CalculateButton({ onClick, calculated }: { onClick: () => void; calculated: boolean }) {
  return (
    <button type="button" className="calculate-button" onClick={onClick}>
      <Calculator aria-hidden="true" />
      <span>{calculated ? "Recalculate results" : "Calculate results"}</span>
    </button>
  );
}

const pensionNotes: Record<string, string> = {
  gp: "Prioritise the occupational scheme calculation. GMS contributions and deductions should be established before assessing PRSA AVC headroom.",
  consultant: "Public service, Single Scheme and private benefits must be valued together. Enter only verified contribution and capital-value figures.",
  dentist: "Dentists generally need to build their own retirement provision. The projection can combine an existing fund with regular personal contributions.",
  other: "Use verified scheme values and contribution records. This projection does not replace a provider illustration or Revenue calculation.",
};

function PensionCalculator() {
  const [profession, setProfession] = useState("consultant");
  const [age, setAge] = useState(46);
  const [retirementAge, setRetirementAge] = useState(65);
  const [earnings, setEarnings] = useState(150000);
  const [currentFund, setCurrentFund] = useState(420000);
  const [personalAnnual, setPersonalAnnual] = useState(18000);
  const [employerAnnual, setEmployerAnnual] = useState(12000);
  const [extraMonthly, setExtraMonthly] = useState(750);
  const [growth, setGrowth] = useState(5);
  const [charge, setCharge] = useState(1);
  const [inflation, setInflation] = useState(2);
  const [targetIncome, setTargetIncome] = useState(75000);
  const [marginalRate, setMarginalRate] = useState(40);
  const [sft, setSft] = useState(2200000);

  const buildResults = () => {
    const years = Math.max(0, retirementAge - age);
    const reliefRate = ageReliefRate(age);
    const maximumRelievable = Math.min(earnings, 115000) * reliefRate;
    const intendedPersonal = personalAnnual + extraMonthly * 12;
    const remainingBeforeExtra = Math.max(0, maximumRelievable - personalAnnual);
    const remainingAfterExtra = Math.max(0, maximumRelievable - intendedPersonal);
    const eligiblePersonal = Math.min(maximumRelievable, intendedPersonal);
    const annualTotal = intendedPersonal + employerAnnual;
    const fund = futureValue(currentFund, annualTotal / 12, years, Math.max(-0.99, (growth - charge) / 100));
    const realFund = fund / Math.pow(1 + inflation / 100, years);
    const targetFund = targetIncome / 0.04;
    return { years, reliefRate, maximumRelievable, remainingBeforeExtra, remainingAfterExtra, fund, realFund, targetFund, targetProgress: targetFund ? realFund / targetFund : 0, estimatedRelief: eligiblePersonal * (marginalRate / 100), sftUse: sft ? fund / sft : 0 };
  };
  const [results, setResults] = useState(buildResults);
  const [calculationCount, setCalculationCount] = useState(0);
  const resultsRef = useRef<HTMLElement>(null);
  const calculate = () => {
    setResults(buildResults());
    setCalculationCount((count) => count + 1);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 900px)").matches) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="calculator-shell">
      <section className="input-panel">
        <div className="panel-heading"><div><p className="eyebrow">Pension planning</p><h2>Contribution & retirement projection</h2></div><Landmark aria-hidden="true" /></div>
        <div className="select-field full"><span className="field-label">Client profile</span><Select value={profession} onValueChange={setProfession}><SelectTrigger className="omega-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="consultant">Medical consultant</SelectItem><SelectItem value="gp">General practitioner</SelectItem><SelectItem value="dentist">Dentist</SelectItem><SelectItem value="other">Other professional</SelectItem></SelectContent></Select></div>
        <div className="form-grid">
          <Field label="Current age" value={age} onChange={(v) => setAge(numberValue(v))} prefix="" max="74" />
          <Field label="Retirement age" value={retirementAge} onChange={(v) => setRetirementAge(numberValue(v))} prefix="" max="80" />
          <Field label="Relevant annual earnings" value={earnings} onChange={(v) => setEarnings(numberValue(v))} />
          <Field label="Current pension fund" value={currentFund} onChange={(v) => setCurrentFund(numberValue(v))} />
          <Field label="Personal contributions / year" value={personalAnnual} onChange={(v) => setPersonalAnnual(numberValue(v))} />
          <Field label="Employer contributions / year" value={employerAnnual} onChange={(v) => setEmployerAnnual(numberValue(v))} />
          <Field label="Proposed extra AVC / month" value={extraMonthly} onChange={(v) => setExtraMonthly(numberValue(v))} />
          <Field label="Marginal income tax rate" value={marginalRate} onChange={(v) => setMarginalRate(numberValue(v))} prefix="" suffix="%" max="100" />
        </div>
        <details className="assumptions"><summary>Projection assumptions <ChevronRight aria-hidden="true" /></summary><div className="form-grid assumption-grid">
          <Field label="Gross annual growth" value={growth} onChange={(v) => setGrowth(numberValue(v))} prefix="" suffix="%" step="0.1" />
          <Field label="Annual charge" value={charge} onChange={(v) => setCharge(numberValue(v))} prefix="" suffix="%" step="0.1" />
          <Field label="Inflation" value={inflation} onChange={(v) => setInflation(numberValue(v))} prefix="" suffix="%" step="0.1" />
          <Field label="Target income in today’s money" value={targetIncome} onChange={(v) => setTargetIncome(numberValue(v))} />
          <Field label="Standard Fund Threshold used" value={sft} onChange={(v) => setSft(numberValue(v))} hint="2026 statutory figure; editable for later years." />
        </div></details>
        <CalculateButton onClick={calculate} calculated={calculationCount > 0} />
        <div className="profile-note"><CircleAlert aria-hidden="true" /><p>{pensionNotes[profession]}</p></div>
      </section>
      <section key={calculationCount} ref={resultsRef} className={`output-panel ${calculationCount ? "results-updated" : ""}`} aria-live="polite">
        <div className="output-topline"><span>{calculationCount ? "Results updated" : "Indicative result"}</span><span>{results.years} years to retirement</span></div>
        <div className="hero-result"><p>Projected fund at retirement</p><strong>{euro0.format(results.fund)}</strong><span>{euro0.format(results.realFund)} in today’s money</span></div>
        <div className="target-block"><div className="target-copy"><div><span>Progress towards target</span><strong>{pct.format(results.targetProgress)}</strong></div><p>Target fund: {euro0.format(results.targetFund)} using a 4% planning withdrawal assumption.</p></div><ProgressBar value={results.targetProgress} /></div>
        <div className="results-grid">
          <ResultCard label="Max. tax-relievable personal contribution" value={euro0.format(results.maximumRelievable)} detail={`${pct.format(results.reliefRate)} age factor on earnings capped at €115,000`} accent />
          <ResultCard label="AVC headroom before proposed extra" value={euro0.format(results.remainingBeforeExtra)} detail={`${euro0.format(results.remainingAfterExtra)} remains after proposed AVC`} />
          <ResultCard label="Indicative income tax relief" value={euro0.format(results.estimatedRelief)} detail="On eligible personal contributions at the rate entered" />
          <ResultCard label="Projected SFT utilisation" value={pct.format(results.sftUse)} detail={`${euro0.format(sft)} threshold selected`} />
        </div>
        <div className="calculation-note"><ShieldCheck aria-hidden="true" /><p>Employer contributions, public-service capital values, retained benefits and scheme-specific lump-sum rules require separate verification. Results are planning estimates, not a statement of entitlement.</p></div>
      </section>
    </div>
  );
}

const ipProfiles: Record<string, { label: string; full: number; half: number; discount: string; note: string }> = {
  consultant: { label: "Medical consultant", full: 6, half: 6, discount: "No preset discount", note: "Combine HSE and private-practice income carefully; private income may have no employer sick-pay support." },
  gp: { label: "General practitioner", full: 0, half: 0, discount: "No preset discount", note: "GMS sick pay and likely locum costs should be entered separately when completing the full advice assessment." },
  dentist: { label: "Dentist", full: 0, half: 0, discount: "17.5% IDA member discount — verify eligibility", note: "Principal dentists generally have no employer sick pay. Salaried arrangements vary by employer." },
  physio: { label: "Physiotherapist", full: 6, half: 6, discount: "No preset discount", note: "HSE presets are shown. Set both sick-pay periods to zero for private practice where appropriate." },
  pharmacist: { label: "Pharmacist", full: 0, half: 0, discount: "No preset discount", note: "Salaried and principal pharmacists can have materially different sick-pay and business-continuity needs." },
  vet: { label: "Veterinarian", full: 0, half: 0, discount: "No preset discount", note: "Include practice costs separately from personal income-replacement needs." },
  surveyor: { label: "Chartered surveyor", full: 0, half: 0, discount: "17.5% SCSI member discount — verify eligibility", note: "Self-employed clients may have no employer sick pay; confirm the occupation definition and work duties." },
  hse: { label: "HSE professional", full: 6, half: 6, discount: "No preset discount", note: "The HSE preset is an initial planning assumption only. Confirm service, contract, prior leave and critical-illness provisions." },
};

function IncomeProtectionCalculator() {
  const [profession, setProfession] = useState("consultant");
  const [income, setIncome] = useState(180000);
  const [targetPercent, setTargetPercent] = useState(75);
  const [stateBenefit, setStateBenefit] = useState(13208);
  const [existingCover, setExistingCover] = useState(30000);
  const [otherContinuingIncome, setOtherContinuingIncome] = useState(0);
  const [benefitCap, setBenefitCap] = useState(250000);
  const [deferredWeeks, setDeferredWeeks] = useState("26");
  const [fullPayMonths, setFullPayMonths] = useState(6);
  const [halfPayMonths, setHalfPayMonths] = useState(6);
  const profile = ipProfiles[profession];
  const selectProfile = (value: string) => { setProfession(value); setFullPayMonths(ipProfiles[value].full); setHalfPayMonths(ipProfiles[value].half); };
  const buildResults = () => {
    const targetTotal = income * (targetPercent / 100);
    const allowablePolicyBenefit = Math.min(benefitCap, Math.max(0, targetTotal - stateBenefit - otherContinuingIncome));
    const additionalCover = Math.max(0, allowablePolicyBenefit - existingCover);
    const longTermReplacement = Math.min(targetTotal, stateBenefit + otherContinuingIncome + existingCover + additionalCover);
    const longTermGap = Math.max(0, income - longTermReplacement);
    const bridgeGapMonths = Math.max(0, Number(deferredWeeks) / 4.345 - (fullPayMonths + halfPayMonths));
    return { targetTotal, targetPercent, profileLabel: profile.label, allowablePolicyBenefit, additionalCover, longTermReplacement, longTermGap, replacementRatio: income ? longTermReplacement / income : 0, bridgeGapMonths };
  };
  const [results, setResults] = useState(buildResults);
  const [calculationCount, setCalculationCount] = useState(0);
  const resultsRef = useRef<HTMLElement>(null);
  const calculate = () => {
    setResults(buildResults());
    setCalculationCount((count) => count + 1);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 900px)").matches) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="calculator-shell">
      <section className="input-panel">
        <div className="panel-heading"><div><p className="eyebrow">Income protection</p><h2>Cover shortfall assessment</h2></div><ShieldCheck aria-hidden="true" /></div>
        <div className="select-field full"><span className="field-label">Profession</span><Select value={profession} onValueChange={selectProfile}><SelectTrigger className="omega-select"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(ipProfiles).map(([key, item]) => <SelectItem key={key} value={key}>{item.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="form-grid">
          <Field label="Total annual earned income" value={income} onChange={(v) => setIncome(numberValue(v))} />
          <Field label="Target income replacement" value={targetPercent} onChange={(v) => setTargetPercent(numberValue(v))} prefix="" suffix="%" max="75" />
          <Field label="Annual State benefit used" value={stateBenefit} onChange={(v) => setStateBenefit(numberValue(v))} hint="Editable; entitlement and rate must be confirmed." />
          <Field label="Existing annual policy benefit" value={existingCover} onChange={(v) => setExistingCover(numberValue(v))} />
          <Field label="Other continuing annual income" value={otherContinuingIncome} onChange={(v) => setOtherContinuingIncome(numberValue(v))} />
          <Field label="Provider annual benefit cap" value={benefitCap} onChange={(v) => setBenefitCap(numberValue(v))} hint="Provider-specific; €250,000 is an editable working assumption." />
          <Field label="Full sick-pay months" value={fullPayMonths} onChange={(v) => setFullPayMonths(numberValue(v))} prefix="" max="60" />
          <Field label="Half sick-pay months" value={halfPayMonths} onChange={(v) => setHalfPayMonths(numberValue(v))} prefix="" max="60" />
        </div>
        <div className="select-field full deferred"><span className="field-label">Deferred period</span><Select value={deferredWeeks} onValueChange={setDeferredWeeks}><SelectTrigger className="omega-select"><SelectValue /></SelectTrigger><SelectContent>{[4, 8, 13, 26, 52].map((weeks) => <SelectItem key={weeks} value={String(weeks)}>{weeks} weeks</SelectItem>)}</SelectContent></Select></div>
        <CalculateButton onClick={calculate} calculated={calculationCount > 0} />
        <div className="profile-note"><CircleAlert aria-hidden="true" /><div><strong>{profile.discount}</strong><p>{profile.note}</p></div></div>
      </section>
      <section key={calculationCount} ref={resultsRef} className={`output-panel ${calculationCount ? "results-updated" : ""}`} aria-live="polite">
        <div className="output-topline"><span>{calculationCount ? "Results updated" : "Indicative result"}</span><span>{results.profileLabel}</span></div>
        <div className="hero-result"><p>Additional annual policy benefit indicated</p><strong>{euro0.format(results.additionalCover)}</strong><span>{euro0.format(results.additionalCover / 12)} per month</span></div>
        <div className="target-block"><div className="target-copy"><div><span>Income replaced</span><strong>{pct.format(results.replacementRatio)}</strong></div><p>Combined State benefit, continuing income and policy benefits.</p></div><ProgressBar value={results.replacementRatio} /></div>
        <div className="results-grid">
          <ResultCard label="Target replacement income" value={euro0.format(results.targetTotal)} detail={`${results.targetPercent}% of earned income`} accent />
          <ResultCard label="Maximum policy benefit modelled" value={euro0.format(results.allowablePolicyBenefit)} detail="After State benefit and continuing income" />
          <ResultCard label="Total long-term replacement" value={euro0.format(results.longTermReplacement)} detail={`${euro0.format(results.longTermReplacement / 12)} per month`} />
          <ResultCard label="Gross annual lifestyle gap" value={euro0.format(results.longTermGap)} detail="Difference from full earned income, before tax" />
        </div>
        {results.bridgeGapMonths > 0 && <div className="warning-note"><CircleAlert aria-hidden="true" /><p>There may be approximately {results.bridgeGapMonths.toFixed(1)} months between the entered sick-pay period ending and policy benefit commencement.</p></div>}
        <div className="calculation-note"><ShieldCheck aria-hidden="true" /><p>Insurer definitions, maximum benefits, deferred periods, State entitlements, other cover and sick-pay rules vary. Confirm all figures against the relevant policy and employment terms.</p></div>
      </section>
    </div>
  );
}

function WealthChart({ values }: { values: { year: number; low: number; base: number; high: number }[] }) {
  const width = 640, height = 220, pad = 18;
  const maxValue = Math.max(1, ...values.map((item) => item.high));
  const pointString = (key: "low" | "base" | "high") => values.map((item, index) => `${pad + (index / Math.max(1, values.length - 1)) * (width - pad * 2)},${height - pad - (item[key] / maxValue) * (height - pad * 2)}`).join(" ");
  return <div className="chart-wrap"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Projected wealth under low, base and high return assumptions">{[0.25, 0.5, 0.75].map((line) => <line key={line} x1={pad} x2={width - pad} y1={height * line} y2={height * line} className="chart-grid" />)}<polyline points={pointString("low")} className="chart-line low" /><polyline points={pointString("high")} className="chart-line high" /><polyline points={pointString("base")} className="chart-line base" /></svg><div className="chart-legend"><span><i className="low" />Low</span><span><i className="base" />Base</span><span><i className="high" />High</span></div></div>;
}

function WealthCalculator() {
  const [initial, setInitial] = useState(250000);
  const [monthly, setMonthly] = useState(2500);
  const [years, setYears] = useState(15);
  const [returnRate, setReturnRate] = useState(6);
  const [charge, setCharge] = useState(1);
  const [inflation, setInflation] = useState(2);
  const [goal, setGoal] = useState(1000000);
  const buildResults = () => {
    const baseNet = (returnRate - charge) / 100, lowNet = (returnRate - 2 - charge) / 100, highNet = (returnRate + 2 - charge) / 100;
    const base = futureValue(initial, monthly, years, baseNet), low = futureValue(initial, monthly, years, lowNet), high = futureValue(initial, monthly, years, highNet);
    const contributions = initial + monthly * 12 * years;
    const real = base / Math.pow(1 + inflation / 100, years);
    const values = Array.from({ length: Math.max(1, Math.floor(years)) + 1 }, (_, year) => ({ year, low: futureValue(initial, monthly, year, lowNet), base: futureValue(initial, monthly, year, baseNet), high: futureValue(initial, monthly, year, highNet) }));
    return { years, base, low, high, contributions, growth: base - contributions, real, goalProgress: goal ? base / goal : 0, goalGap: Math.max(0, goal - base), values };
  };
  const [results, setResults] = useState(buildResults);
  const [calculationCount, setCalculationCount] = useState(0);
  const resultsRef = useRef<HTMLElement>(null);
  const calculate = () => {
    setResults(buildResults());
    setCalculationCount((count) => count + 1);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 900px)").matches) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  return (
    <div className="calculator-shell">
      <section className="input-panel">
        <div className="panel-heading"><div><p className="eyebrow">Wealth management</p><h2>Investment growth scenarios</h2></div><TrendingUp aria-hidden="true" /></div>
        <div className="form-grid">
          <Field label="Initial investment" value={initial} onChange={(v) => setInitial(numberValue(v))} />
          <Field label="Monthly contribution" value={monthly} onChange={(v) => setMonthly(numberValue(v))} />
          <Field label="Investment term" value={years} onChange={(v) => setYears(numberValue(v))} prefix="" suffix="years" max="60" />
          <Field label="Gross annual return" value={returnRate} onChange={(v) => setReturnRate(numberValue(v))} prefix="" suffix="%" step="0.1" />
          <Field label="Annual charges" value={charge} onChange={(v) => setCharge(numberValue(v))} prefix="" suffix="%" step="0.1" />
          <Field label="Inflation" value={inflation} onChange={(v) => setInflation(numberValue(v))} prefix="" suffix="%" step="0.1" />
          <Field label="Target future value" value={goal} onChange={(v) => setGoal(numberValue(v))} />
        </div>
        <CalculateButton onClick={calculate} calculated={calculationCount > 0} />
        <div className="profile-note"><Sparkles aria-hidden="true" /><p>Low and high scenarios use returns two percentage points below and above the entered base return. All scenarios deduct the annual charge entered.</p></div>
      </section>
      <section key={calculationCount} ref={resultsRef} className={`output-panel ${calculationCount ? "results-updated" : ""}`} aria-live="polite">
        <div className="output-topline"><span>{calculationCount ? "Results updated" : "Indicative result"}</span><span>{results.years} year projection</span></div>
        <div className="hero-result"><p>Base-case projected value</p><strong>{euro0.format(results.base)}</strong><span>{euro0.format(results.real)} in today’s money</span></div>
        <WealthChart values={results.values} />
        <div className="target-block"><div className="target-copy"><div><span>Progress towards target</span><strong>{pct.format(results.goalProgress)}</strong></div><p>{results.goalGap ? `${euro0.format(results.goalGap)} projected shortfall` : "Target met in the base scenario"}</p></div><ProgressBar value={results.goalProgress} /></div>
        <div className="results-grid"><ResultCard label="Total invested" value={euro0.format(results.contributions)} detail="Initial amount plus regular contributions" accent /><ResultCard label="Projected investment growth" value={euro0.format(results.growth)} detail="Base case after entered charges, before tax" /><ResultCard label="Low scenario" value={euro0.format(results.low)} detail={`${Math.max(-99, returnRate - 2 - charge).toFixed(1)}% net annual assumption`} /><ResultCard label="High scenario" value={euro0.format(results.high)} detail={`${(returnRate + 2 - charge).toFixed(1)}% net annual assumption`} /></div>
        <div className="calculation-note"><ShieldCheck aria-hidden="true" /><p>Values are deterministic illustrations, not forecasts. Tax treatment depends on the product, asset and client circumstances and is not included.</p></div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header"><div className="brand"><span className="brand-mark">Ω</span><span><strong>OMEGA</strong><small>FINANCIAL MANAGEMENT</small></span></div><div className="internal-pill"><BriefcaseBusiness aria-hidden="true" /> Internal planning workspace</div></header>
      <section className="workspace-intro"><div><p className="eyebrow">Adviser toolkit</p><h1>Financial planning, made clearer.</h1><p>Model a client scenario, adjust the assumptions and use the result as a structured starting point for advice.</p></div><div className="updated-card"><Calculator aria-hidden="true" /><div><span>Assumption set</span><strong>Irish rules · 2026</strong></div></div></section>
      <Tabs defaultValue="pension" className="workspace-tabs"><TabsList className="omega-tabs" aria-label="Financial calculators"><TabsTrigger value="pension"><Landmark aria-hidden="true" /><span>Pension</span></TabsTrigger><TabsTrigger value="protection"><ShieldCheck aria-hidden="true" /><span className="tab-label-long">Income protection</span><span className="tab-label-short">Protection</span></TabsTrigger><TabsTrigger value="wealth"><TrendingUp aria-hidden="true" /><span className="tab-label-long">Wealth management</span><span className="tab-label-short">Wealth</span></TabsTrigger></TabsList><TabsContent value="pension"><PensionCalculator /></TabsContent><TabsContent value="protection"><IncomeProtectionCalculator /></TabsContent><TabsContent value="wealth"><WealthCalculator /></TabsContent></Tabs>
      <footer><p><strong>Internal use only.</strong> Calculations are indicative and must be verified before being used in client advice.</p><p>OFM Financial Ltd T/A Omega Financial Management, regulated by the Central Bank of Ireland.</p></footer>
    </main>
  );
}
