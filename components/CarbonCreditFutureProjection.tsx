import React, { useState, useMemo } from 'react';
import { Field, Farm, EmissionFactorConfig } from '../types';
import { 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  DollarSign, 
  Leaf, 
  Droplets, 
  Sparkles, 
  Sliders, 
  ArrowUpRight, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  Info,
  Clock,
  Building2,
  FileCheck
} from 'lucide-react';

export interface FiveYearProjectionRow {
  year: number;
  yearLabel: string;
  agronomicMilestone: string;
  grossSequestrationMT: number;
  bufferPoolDeductionMT: number;
  netIssuableCredits: number;
  cumulativeCredits: number;
  projectedPriceUSD: number;
  projectedRevenueUSD: number;
  cumulativeRevenueUSD: number;
  projectedSOCPct: number;
  cumulativeWaterGallonsGained: number;
}

interface CarbonCreditFutureProjectionProps {
  currentFarm: Farm;
  fields: Field[];
  config: EmissionFactorConfig;
}

export const CarbonCreditFutureProjection: React.FC<CarbonCreditFutureProjectionProps> = ({
  currentFarm,
  fields,
  config,
}) => {
  // Scope selection: 'all' or specific fieldId
  const [selectedFieldScope, setSelectedFieldScope] = useState<string>('all');
  
  // Interactive simulation parameters
  const [baseCarbonPrice, setBaseCarbonPrice] = useState<number>(config.carbonPricePerTon || 30);
  const [bufferPoolPct, setBufferPoolPct] = useState<number>(15); // Standard 15% registry reserve
  const [annualPriceEscalationPct, setAnnualPriceEscalationPct] = useState<number>(5); // 5% annual market appreciation
  const [practiceAdoptionTier, setPracticeAdoptionTier] = useState<'standard' | 'accelerated' | 'conservative'>('standard');

  // Selected field or all fields
  const activeFields = useMemo(() => {
    if (selectedFieldScope === 'all') return fields;
    return fields.filter((f) => f.id === selectedFieldScope);
  }, [fields, selectedFieldScope]);

  // Aggregate base metrics from existing historical field data
  const targetAcreage = useMemo(() => {
    return activeFields.reduce((sum, f) => sum + f.acreage, 0);
  }, [activeFields]);

  const currentAnnualGrossMT = useMemo(() => {
    return activeFields.reduce((sum, f) => sum + f.carbonBreakdown.totalGrossMT, 0);
  }, [activeFields]);

  const weightedBaselineSOC = useMemo(() => {
    if (targetAcreage === 0) return 2.5;
    const weightedSum = activeFields.reduce((sum, f) => sum + f.baselineSOCPct * f.acreage, 0);
    return Number((weightedSum / targetAcreage).toFixed(2));
  }, [activeFields, targetAcreage]);

  const historicalAccretionRate5Yr = useMemo(() => {
    if (targetAcreage === 0) return 0.25;
    const weightedRate = activeFields.reduce((sum, f) => sum + f.carbonBreakdown.somAccretion5YrPct * f.acreage, 0);
    return Number((weightedRate / targetAcreage).toFixed(3));
  }, [activeFields, targetAcreage]);

  // Generate 5-Year Future Carbon Projection Data (2027 to 2031)
  const projectionData: FiveYearProjectionRow[] = useMemo(() => {
    const startYear = 2027;
    const rows: FiveYearProjectionRow[] = [];

    // Practice compounding multipliers
    // Biological maturation increases sequestration efficiency over years 1-3, stabilizing at mineral saturation in years 4-5
    const practiceMultipliers: Record<string, number[]> = {
      conservative: [1.00, 1.02, 1.04, 1.05, 1.06],
      standard: [1.02, 1.06, 1.11, 1.15, 1.18],
      accelerated: [1.05, 1.12, 1.20, 1.27, 1.33],
    };

    const multipliers = practiceMultipliers[practiceAdoptionTier] || practiceMultipliers.standard;

    const milestones = [
      'Year 1: Mycorrhizal Hyphae Expansion & Root Exudates',
      'Year 2: Soil Glomalin Synthesis & Water-Stable Aggregates',
      'Year 3: Subsoil Macro-Pores & Accelerated Nitrogen Fixation',
      'Year 4: Mineral-Associated Organic Matter (MAOM) Bonding',
      'Year 5: Deep Humic Reserve & Stable Insetting Equilibrium',
    ];

    let runningCumulativeCredits = 0;
    let runningCumulativeRevenue = 0;
    let runningSocPct = weightedBaselineSOC;

    // Annual SOM accretion portion (~1/5th of 5-yr target per year with slight acceleration)
    const annualSocGainBase = historicalAccretionRate5Yr / 5;

    for (let i = 0; i < 5; i++) {
      const year = startYear + i;
      const mult = multipliers[i];
      
      // Calculate Gross Sequestration
      const grossMT = Math.round(currentAnnualGrossMT * mult);
      
      // Permanence Buffer Deduction (e.g. 15% withheld into registry non-reversal pool)
      const bufferDeduction = Math.round(grossMT * (bufferPoolPct / 100));
      
      // Net Issuable Carbon Credits
      const netCredits = grossMT - bufferDeduction;
      runningCumulativeCredits += netCredits;

      // Price projection with compound escalation
      const projectedPrice = Number(
        (baseCarbonPrice * Math.pow(1 + annualPriceEscalationPct / 100, i)).toFixed(2)
      );

      // Revenue Calculations
      const annualRevenue = Math.round(netCredits * projectedPrice);
      runningCumulativeRevenue += annualRevenue;

      // SOC accretion progression
      const yearSocGain = annualSocGainBase * (0.85 + i * 0.1);
      runningSocPct = Number((runningSocPct + yearSocGain).toFixed(2));

      // Gallons of additional water holding capacity gained (+27,000 gal per 1% SOC accretion per acre)
      const totalAccretionSoFar = runningSocPct - weightedBaselineSOC;
      const waterGallonsGained = Math.round(totalAccretionSoFar * targetAcreage * 27000);

      rows.push({
        year,
        yearLabel: `${year} (Y+${i + 1})`,
        agronomicMilestone: milestones[i],
        grossSequestrationMT: grossMT,
        bufferPoolDeductionMT: bufferDeduction,
        netIssuableCredits: netCredits,
        cumulativeCredits: runningCumulativeCredits,
        projectedPriceUSD: projectedPrice,
        projectedRevenueUSD: annualRevenue,
        cumulativeRevenueUSD: runningCumulativeRevenue,
        projectedSOCPct: runningSocPct,
        cumulativeWaterGallonsGained: waterGallonsGained,
      });
    }

    return rows;
  }, [
    currentAnnualGrossMT,
    weightedBaselineSOC,
    historicalAccretionRate5Yr,
    targetAcreage,
    baseCarbonPrice,
    bufferPoolPct,
    annualPriceEscalationPct,
    practiceAdoptionTier,
  ]);

  // Aggregate 5-year totals
  const total5YearGrossMT = projectionData.reduce((sum, r) => sum + r.grossSequestrationMT, 0);
  const total5YearBufferMT = projectionData.reduce((sum, r) => sum + r.bufferPoolDeductionMT, 0);
  const total5YearNetCredits = projectionData.reduce((sum, r) => sum + r.netIssuableCredits, 0);
  const total5YearRevenue = projectionData[projectionData.length - 1]?.cumulativeRevenueUSD || 0;
  const net5YearSOCGain = Number((projectionData[projectionData.length - 1]?.projectedSOCPct - weightedBaselineSOC).toFixed(2));
  const total5YearWaterGallons = projectionData[projectionData.length - 1]?.cumulativeWaterGallonsGained || 0;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Component Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/80 shadow-md">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Forward-Looking Agronomic Valuation
            </span>
            <span className="text-stone-600">&bull;</span>
            <span className="bg-stone-950 text-stone-300 text-xs px-2.5 py-0.5 rounded-full border border-stone-800 font-mono">
              2027 &ndash; 2031 Horizon
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-100 flex items-center gap-2">
            Carbon Credit Future Projection &amp; Insetting Trajectory
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Projects forward-looking carbon credit generation, registry buffer pool withholdings, and cumulative insetting cash flows over the next 5 years based on historical soil accretion and verified practice logs.
          </p>
        </div>

        {/* Scope Selector: Whole Farm vs Individual Field */}
        <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 p-1.5 rounded-2xl">
          <label className="text-stone-400 text-xs font-semibold px-2">Scope:</label>
          <select
            value={selectedFieldScope}
            onChange={(e) => setSelectedFieldScope(e.target.value)}
            className="bg-stone-900 border border-stone-700 text-stone-100 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">Whole Farm ({fields.length} Fields &bull; {currentFarm.totalAcreage.toLocaleString()} ac)</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.acreage} ac &bull; {f.cropType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5-Year Headline KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Issuable Credits */}
        <div className="bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">5-Yr Net Issuable Credits</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
              {total5YearNetCredits.toLocaleString()}
            </span>
            <span className="text-xs text-stone-300 font-medium">VCU / MT CO₂e</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800/80">
            <span>Gross: {total5YearGrossMT.toLocaleString()} MT</span>
            <span className="text-amber-400">-{total5YearBufferMT.toLocaleString()} MT Buffer</span>
          </div>
        </div>

        {/* Cumulative 5-Year Revenue */}
        <div className="bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">5-Yr Insetting Value</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
              ${total5YearRevenue.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-3 pt-2 border-t border-stone-800/80">
            Based on ${baseCarbonPrice}/t with +{annualPriceEscalationPct}% annual escalation.
          </p>
        </div>

        {/* Topsoil SOC % Stock Accretion */}
        <div className="bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Projected SOC Accretion</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono">
              +{net5YearSOCGain}%
            </span>
            <span className="text-xs text-stone-400">SOM</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800/80">
            <span>Baseline: {weightedBaselineSOC}%</span>
            <span className="text-emerald-400 font-bold">Target: {projectionData[4]?.projectedSOCPct}%</span>
          </div>
        </div>

        {/* Additional Drought Water Buffer */}
        <div className="bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Water Sponge Buffer Gained</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
              +{(total5YearWaterGallons / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs text-stone-300">Gallons</span>
          </div>
          <p className="text-xs text-stone-400 mt-3 pt-2 border-t border-stone-800/80">
            Stored plant-available moisture across {targetAcreage.toLocaleString()} acres.
          </p>
        </div>
      </div>

      {/* Interactive Scenario Parameter Sliders */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-stone-200">
              Future Market &amp; Permanence Buffer Parameters
            </h4>
          </div>
          <span className="text-xs text-stone-400">
            Simulate voluntary registry buffer withholdings and carbon pricing escalation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
          {/* Base Carbon Price Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-300">Starting Credit Price (2027):</span>
              <span className="font-mono text-amber-400 font-bold">${baseCarbonPrice} / MT CO₂e</span>
            </div>
            <input
              type="range"
              min="15"
              max="65"
              step="5"
              value={baseCarbonPrice}
              onChange={(e) => setBaseCarbonPrice(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <span>$15/t (Base)</span>
              <span>$35/t (Corporate)</span>
              <span>$65/t (Premium)</span>
            </div>
          </div>

          {/* Permanence Buffer Withholding Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-300">Registry Permanence Reserve:</span>
              <span className="font-mono text-emerald-400 font-bold">{bufferPoolPct}% Withheld</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="5"
              value={bufferPoolPct}
              onChange={(e) => setBufferPoolPct(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <span>5% (Minimal)</span>
              <span>15% (VCS / Verra)</span>
              <span>25% (Conservative)</span>
            </div>
          </div>

          {/* Practice Adoption Acceleration Tier */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 block">
              Biological Maturation Pace:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPracticeAdoptionTier('conservative')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                  practiceAdoptionTier === 'conservative'
                    ? 'bg-stone-800 text-stone-200 border-stone-600 shadow-sm'
                    : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}
              >
                Conservative
              </button>
              <button
                type="button"
                onClick={() => setPracticeAdoptionTier('standard')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                  practiceAdoptionTier === 'standard'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-sm'
                    : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setPracticeAdoptionTier('accelerated')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                  practiceAdoptionTier === 'accelerated'
                    ? 'bg-amber-950 text-amber-300 border-amber-600 shadow-sm'
                    : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}
              >
                Accelerated
              </button>
            </div>
            <span className="text-[10px] text-stone-500 block">
              {practiceAdoptionTier === 'conservative' && 'Assumes slower fungal colonisation and static application rate.'}
              {practiceAdoptionTier === 'standard' && 'Standard biological compounding as glomalin and root mass accumulate.'}
              {practiceAdoptionTier === 'accelerated' && 'Includes multi-species cover crops and biochar amendments.'}
            </span>
          </div>
        </div>
      </div>

      {/* ================= 5-YEAR PROJECTION SUMMARY TABLE ================= */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            5-Year Carbon Credit Generation &amp; Financial Cash Flow Summary Table
          </h4>
          <span className="text-xs text-stone-400 font-mono">
            {targetAcreage.toLocaleString()} Enrolled Acres Tracked
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-stone-800 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Projection Year</th>
                <th className="py-3 px-4">Agronomic Biological Milestone</th>
                <th className="py-3 px-4 text-right">Gross CO₂e (MT)</th>
                <th className="py-3 px-4 text-right">Buffer Withheld ({bufferPoolPct}%)</th>
                <th className="py-3 px-4 text-right">Net Issuable Credits (VCUs)</th>
                <th className="py-3 px-4 text-right">Cumulative Credits</th>
                <th className="py-3 px-4 text-right">Credit Price</th>
                <th className="py-3 px-4 text-right">Annual Revenue</th>
                <th className="py-3 px-4 text-right">Cumulative Value</th>
                <th className="py-3 px-4 text-right">Projected SOC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 bg-stone-900/40 text-stone-300">
              {projectionData.map((row) => (
                <tr key={row.year} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                    {row.yearLabel}
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-200">
                    {row.agronomicMilestone}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-stone-200">
                    {row.grossSequestrationMT.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    -{row.bufferPoolDeductionMT.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {row.netIssuableCredits.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-cyan-400 font-semibold">
                    {row.cumulativeCredits.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-stone-400">
                    ${row.projectedPriceUSD.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                    ${row.projectedRevenueUSD.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-stone-100">
                    ${row.cumulativeRevenueUSD.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                    {row.projectedSOCPct}%
                  </td>
                </tr>
              ))}
            </tbody>

            {/* 5-Year Totals Row */}
            <tfoot className="bg-stone-950 text-stone-100 border-t-2 border-stone-700 font-bold text-xs">
              <tr>
                <td className="py-3.5 px-4 font-mono text-emerald-400 uppercase">
                  5-Yr Cumulative Total
                </td>
                <td className="py-3.5 px-4 text-stone-400 font-normal">
                  Full 5-Year Protocol Cycle Completion
                </td>
                <td className="py-3.5 px-4 text-right font-mono">
                  {total5YearGrossMT.toLocaleString()} MT
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                  -{total5YearBufferMT.toLocaleString()} MT
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 text-sm">
                  {total5YearNetCredits.toLocaleString()} VCUs
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-cyan-400">
                  {total5YearNetCredits.toLocaleString()} MT
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-stone-400">
                  Avg ${(total5YearRevenue / total5YearNetCredits).toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-300">
                  -
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-300 text-sm">
                  ${total5YearRevenue.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                  +{net5YearSOCGain}% SOM
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Visual Projection Trajectory Comparison Bars */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            5-Year Carbon Credit Issuance &amp; Cumulative Value Growth Visualizer
          </h4>
          <span className="text-[11px] text-stone-500 font-mono">
            Annual Credit Issuance vs Cumulative Cash Flow
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {projectionData.map((row, idx) => {
            const maxCumRev = total5YearRevenue > 0 ? total5YearRevenue : 1;
            const revBarPct = Math.round((row.cumulativeRevenueUSD / maxCumRev) * 100);

            return (
              <div
                key={row.year}
                className="bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-stone-200">{row.year}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      +{row.netIssuableCredits} VCUs
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 line-clamp-2 leading-tight">
                    {row.agronomicMilestone.split(':')[1] || row.agronomicMilestone}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-stone-800">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-stone-400">Cum. Revenue:</span>
                    <span className="text-amber-300 font-bold">${row.cumulativeRevenueUSD.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${revBarPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>SOC: {row.projectedSOCPct}%</span>
                    <span>Water: +{Math.round(row.cumulativeWaterGallonsGained / 1000)}k gal</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
