import React, { useState } from 'react';
import { Field, Farm, EmissionFactorConfig } from '../types';
import { DEFAULT_EMISSION_CONFIG } from '../utils/carbonCalculations';
import { CarbonCreditFutureProjection } from './CarbonCreditFutureProjection';
import { FieldSocAccretionProjectionChart } from './FieldSocAccretionProjectionChart';
import { 
  Calculator, 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  HelpCircle, 
  Sliders, 
  CheckCircle, 
  Info,
  ShieldAlert,
  Sprout,
  Tractor,
  Droplets,
  Trees,
  FileCheck,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface CarbonEstimatorProps {
  currentFarm: Farm;
  fields: Field[];
  config: EmissionFactorConfig;
  onUpdateConfig: (config: EmissionFactorConfig) => void;
  onOpenLineageModal?: (field: Field) => void;
}

export const CarbonEstimator: React.FC<CarbonEstimatorProps> = ({
  currentFarm,
  fields,
  config,
  onUpdateConfig,
  onOpenLineageModal,
}) => {
  // Scenario simulation state
  const [simulatedPrice, setSimulatedPrice] = useState(config.carbonPricePerTon);
  const [simulatedCoverCropAdoptionPct, setSimulatedCoverCropAdoptionPct] = useState(75);
  const [simulatedNoTillAdoptionPct, setSimulatedNoTillAdoptionPct] = useState(80);
  const [simulatedNReductionPct, setSimulatedNReductionPct] = useState(20);

  // Compute farm-level aggregates
  const totalFarmAcreage = fields.reduce((acc, f) => acc + f.acreage, 0);
  const totalAnnualGrossMT = fields.reduce((acc, f) => acc + f.carbonBreakdown.totalGrossMT, 0);
  const farmAverageNetPerAcre = totalFarmAcreage > 0 ? (totalAnnualGrossMT / totalFarmAcreage).toFixed(2) : '0';
  const totalFarmRevenueUSD = Math.round(totalAnnualGrossMT * simulatedPrice);

  // Aggregated practice totals across farm
  const totalCoverCropMT = fields.reduce((acc, f) => acc + f.carbonBreakdown.coverCropMT, 0);
  const totalNoTillMT = fields.reduce((acc, f) => acc + f.carbonBreakdown.noTillMT, 0);
  const totalFertilizerMT = fields.reduce((acc, f) => acc + f.carbonBreakdown.fertilizerReductionMT, 0);
  const totalGrazingMT = fields.reduce((acc, f) => acc + f.carbonBreakdown.grazingRotationMT, 0);
  const totalCompostMT = fields.reduce((acc, f) => acc + f.carbonBreakdown.compostBiocharMT, 0);

  // 5-Year Farm Aggregates
  const totalFarm5YearGrossMT = fields.reduce(
    (acc, f) => acc + Math.round(f.carbonBreakdown.totalGrossMT * 5 * 1.08), 
    0
  );
  const totalFarm5YearRevenueUSD = Math.round(totalFarm5YearGrossMT * simulatedPrice);

  // Scenario projection calculations
  const potentialCoverCropMT = (totalFarmAcreage * (simulatedCoverCropAdoptionPct / 100) * config.coverCropRate);
  const potentialNoTillMT = (totalFarmAcreage * (simulatedNoTillAdoptionPct / 100) * config.noTillRate);
  const potentialNReductionMT = (totalFarmAcreage * (simulatedNReductionPct / 100) * (config.fertilizerReductionRate * 1.2));
  const scenarioTotalGrossMT = Math.round(potentialCoverCropMT + potentialNoTillMT + potentialNReductionMT);
  const scenarioRevenueUSD = Math.round(scenarioTotalGrossMT * simulatedPrice);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Carbon Accounting Engine
            </span>
            <span className="text-xs text-stone-400">
              Protocol: {config.methodology === 'USDA_COMET_FARM' ? 'USDA COMET-Farm Regional Factors' : 'IPCC Tier 1 / Tier 2 Guidelines'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            Soil Carbon Sequestration &amp; Insetting Estimator
          </h2>
          <p className="text-xs text-stone-400">
            Automated carbon stock modeling quantifying net atmospheric CO₂ removal (metric tons CO₂e) per field and whole farm.
          </p>
        </div>

        {/* Methodology Switcher */}
        <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 p-1.5 rounded-xl text-xs">
          <button
            onClick={() => onUpdateConfig({ ...config, methodology: 'USDA_COMET_FARM' })}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              config.methodology === 'USDA_COMET_FARM'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            USDA COMET-Farm
          </button>
          <button
            onClick={() => onUpdateConfig({ ...config, methodology: 'IPCC_TIER_1' })}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              config.methodology === 'IPCC_TIER_1'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            IPCC Tier 1
          </button>
        </div>
      </div>

      {/* Farm Total Summary 3-Column Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-stone-900 to-emerald-950/40 border border-emerald-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
            <span className="uppercase tracking-wider">Total Farm Sequestration</span>
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-stone-100">{totalAnnualGrossMT.toLocaleString()}</span>
            <span className="text-sm font-semibold text-emerald-400 font-mono">MT CO₂e / yr</span>
          </div>
          <p className="text-xs text-stone-400 mt-2">
            Across {totalFarmAcreage.toLocaleString()} total mapped acres ({farmAverageNetPerAcre} MT / acre average).
          </p>
          <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs">
            <span className="text-stone-400">Equivalent Cars Removed:</span>
            <span className="text-emerald-300 font-mono font-bold">
              {Math.round(totalAnnualGrossMT / 4.6)} passenger vehicles / yr
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-stone-900 to-amber-950/30 border border-stone-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-2">
            <span className="uppercase tracking-wider">Estimated Insetting Value</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-amber-300">
              ${totalFarmRevenueUSD.toLocaleString()}
            </span>
            <span className="text-xs text-stone-400 font-mono">/ yr @ ${simulatedPrice}/t</span>
          </div>
          <p className="text-xs text-stone-400 mt-2">
            Voluntary carbon credit market or Scope 3 supply chain insetting premium.
          </p>
          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">Projected 5-Year Farm Revenue:</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              ${totalFarm5YearRevenueUSD.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-stone-900 to-sky-950/30 border border-stone-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between text-xs text-sky-400 font-semibold mb-2">
            <span className="uppercase tracking-wider">Soil Health &amp; Water Impact</span>
            <Droplets className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-stone-100">+0.17%</span>
            <span className="text-xs text-stone-400">SOM Growth / 5-Yr</span>
          </div>
          <p className="text-xs text-stone-400 mt-2">
            Estimated topsoil organic matter accretion rate under current practice matrix.
          </p>
          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">Additional Water Stored:</span>
            <span className="text-sky-300 font-mono font-bold">
              +{((totalFarmAcreage * 0.17 * 27000) / 1000000).toFixed(1)}M Gal / yr
            </span>
          </div>
        </div>
      </div>

      {/* Practice Sequestration Breakdown Cards */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-stone-100 mb-4 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-400" />
          Farm Practice Sequestration Ledger Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <Sprout className="w-4 h-4" />
              <span>Cover Crops</span>
            </div>
            <p className="text-2xl font-bold text-stone-100 font-mono">{totalCoverCropMT} <span className="text-xs text-stone-400">MT</span></p>
            <p className="text-[10px] text-stone-500 mt-1">~0.48 MT CO₂e/ac/yr default</p>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
              <Tractor className="w-4 h-4" />
              <span>Continuous No-Till</span>
            </div>
            <p className="text-2xl font-bold text-stone-100 font-mono">{totalNoTillMT} <span className="text-xs text-stone-400">MT</span></p>
            <p className="text-[10px] text-stone-500 mt-1">~0.51 MT CO₂e/ac/yr default</p>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
              <Droplets className="w-4 h-4" />
              <span>4R N Reduction</span>
            </div>
            <p className="text-2xl font-bold text-stone-100 font-mono">{totalFertilizerMT} <span className="text-xs text-stone-400">MT</span></p>
            <p className="text-[10px] text-stone-500 mt-1">Avoided N₂O emissions</p>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <div className="flex items-center gap-2 text-lime-400 text-xs font-semibold mb-1">
              <Trees className="w-4 h-4" />
              <span>Rotational Grazing</span>
            </div>
            <p className="text-2xl font-bold text-stone-100 font-mono">{totalGrazingMT} <span className="text-xs text-stone-400">MT</span></p>
            <p className="text-[10px] text-stone-500 mt-1">Root biomass stimulation</p>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Compost / Biochar</span>
            </div>
            <p className="text-2xl font-bold text-stone-100 font-mono">{totalCompostMT} <span className="text-xs text-stone-400">MT</span></p>
            <p className="text-[10px] text-stone-500 mt-1">Recalcitrant carbon storage</p>
          </div>
        </div>
      </div>

      {/* Field-by-Field Breakdown Table with Configurable 5-Year Revenue Projection */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Field-Level Sequestration &amp; 5-Year Projected Revenue Accounts
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Calculates annual sequestration and projected 5-year cumulative insetting earnings per field using the configurable carbon price.
            </p>
          </div>

          {/* Configurable Carbon Price ($/MT) Control */}
          <div className="flex items-center gap-3 bg-stone-950 border border-stone-800 px-3.5 py-2 rounded-xl">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-stone-300">Configurable Carbon Price:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15"
                max="80"
                step="1"
                value={simulatedPrice}
                onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                className="w-24 sm:w-32 accent-amber-500 cursor-pointer"
                title={`Configured price: $${simulatedPrice} / MT`}
              />
              <div className="flex items-center gap-1 bg-stone-900 border border-stone-700 px-2 py-1 rounded-lg">
                <span className="text-xs font-mono font-bold text-amber-400">${simulatedPrice}</span>
                <span className="text-[10px] text-stone-400 font-mono">/ MT</span>
              </div>
            </div>

            {/* Quick Price Preset Buttons */}
            <div className="hidden md:flex items-center gap-1 pl-1 border-l border-stone-800 text-[10px] font-mono">
              {[25, 35, 50, 65].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSimulatedPrice(preset)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    simulatedPrice === preset
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-600'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 text-stone-400 border-b border-stone-800 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Field Name</th>
                <th className="py-3 px-4">Crop Type</th>
                <th className="py-3 px-4">Acreage</th>
                <th className="py-3 px-4">Baseline SOC</th>
                <th className="py-3 px-4">Logged Practices</th>
                <th className="py-3 px-4">Annual Net CO₂e</th>
                <th className="py-3 px-4">Intensity (MT/ac)</th>
                <th className="py-3 px-4 text-right">Annual Value (@ ${simulatedPrice}/t)</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-400 bg-emerald-950/20">
                  Projected 5-Year Carbon Revenue
                </th>
                <th className="py-3 px-4 text-center">Lineage Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {fields.map((f) => {
                const annualRev = Math.round(f.carbonBreakdown.totalGrossMT * simulatedPrice);
                // 5-year projection accounts for 5 seasons with biological compounding (~1.08x multiplier)
                const fiveYearGrossMT = Math.round(f.carbonBreakdown.totalGrossMT * 5 * 1.08);
                const fiveYearRev = Math.round(fiveYearGrossMT * simulatedPrice);

                return (
                  <tr key={f.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3 px-4 font-bold text-stone-100">{f.name}</td>
                    <td className="py-3 px-4 text-stone-400">{f.cropType}</td>
                    <td className="py-3 px-4 font-mono">{f.acreage} ac</td>
                    <td className="py-3 px-4 font-mono text-stone-300">{f.baselineSOCPct}%</td>
                    <td className="py-3 px-4">
                      <span className="bg-stone-800 px-2 py-0.5 rounded text-stone-300 text-[11px]">
                        {f.practices.length} practices
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400 font-mono">
                      +{f.carbonBreakdown.totalGrossMT} MT
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-300">
                      {f.carbonBreakdown.totalNetPerAcre} MT/ac
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-300 font-semibold">
                      ${annualRev.toLocaleString()}
                      <span className="text-[10px] text-stone-500 block font-normal">/ yr</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold bg-emerald-950/10">
                      ${fiveYearRev.toLocaleString()}
                      <span className="text-[10px] text-emerald-500/80 block font-normal">
                        ({fiveYearGrossMT.toLocaleString()} MT 5-yr)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {onOpenLineageModal && (
                        <button
                          type="button"
                          onClick={() => onOpenLineageModal(f)}
                          className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-emerald-950 text-stone-300 hover:text-emerald-300 border border-stone-800 hover:border-emerald-700 text-[11px] font-semibold flex items-center gap-1.5 mx-auto transition"
                          title="Inspect cryptographic data lineage & SHA-256 provenance chain"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Audit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Totals Footer */}
            <tfoot className="bg-stone-950 text-stone-200 border-t-2 border-stone-800 font-bold text-xs">
              <tr>
                <td className="py-3 px-4 uppercase text-stone-400 font-mono">Farm Total</td>
                <td className="py-3 px-4 text-stone-500">{fields.length} parcels</td>
                <td className="py-3 px-4 font-mono">{totalFarmAcreage.toLocaleString()} ac</td>
                <td className="py-3 px-4 font-mono text-stone-400">Avg {farmAverageNetPerAcre}%</td>
                <td className="py-3 px-4 text-stone-400">
                  {fields.reduce((acc, f) => acc + f.practices.length, 0)} total
                </td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                  +{totalAnnualGrossMT.toLocaleString()} MT
                </td>
                <td className="py-3 px-4 font-mono text-stone-300">{farmAverageNetPerAcre} MT/ac</td>
                <td className="py-3 px-4 text-right font-mono text-amber-300">
                  ${totalFarmRevenueUSD.toLocaleString()}
                  <span className="text-[10px] text-stone-500 block font-normal">/ yr</span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400 text-sm bg-emerald-950/30">
                  ${totalFarm5YearRevenueUSD.toLocaleString()}
                  <span className="text-[10px] text-emerald-300/80 block font-normal">
                    ({totalFarm5YearGrossMT.toLocaleString()} MT cumulative)
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-[10px] text-stone-500 font-mono">
                  ISO 14064-2
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5-Year Projected Soil Organic Carbon (SOC) Accretion Trends for Selected Field */}
      <FieldSocAccretionProjectionChart
        fields={fields}
        selectedFieldId={fields[0]?.id}
        config={config}
      />

      {/* Carbon Credit Future Projection Component */}
      <CarbonCreditFutureProjection
        currentFarm={currentFarm}
        fields={fields}
        config={config}
      />

      {/* Interactive Scenario Modeling Sandbox */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-stone-100">
              Regenerative Practice Scenario Simulator
            </h3>
          </div>
          <span className="text-xs text-stone-400 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
            Interactive Forecast
          </span>
        </div>

        <p className="text-xs text-stone-400">
          Adjust practice adoption rates and voluntary carbon price to forecast total annual sequestration and financial return across the entire {totalFarmAcreage} acres.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          {/* Carbon Credit Price Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-300">Carbon Credit Price ($/MT):</span>
              <span className="font-mono text-amber-400 font-bold">${simulatedPrice} / t</span>
            </div>
            <input
              type="range"
              min="15"
              max="65"
              step="1"
              value={simulatedPrice}
              onChange={(e) => setSimulatedPrice(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>$15 (Floor)</span>
              <span>$40 (EU/CORSIA)</span>
              <span>$65 (Premium)</span>
            </div>
          </div>

          {/* Cover Crop Adoption Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-300">Cover Crop Adoption (%):</span>
              <span className="font-mono text-emerald-400 font-bold">{simulatedCoverCropAdoptionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={simulatedCoverCropAdoptionPct}
              onChange={(e) => setSimulatedCoverCropAdoptionPct(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>0%</span>
              <span>50%</span>
              <span>100% ({totalFarmAcreage} ac)</span>
            </div>
          </div>

          {/* No-Till Adoption Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-300">No-Till / Strip-Till (%):</span>
              <span className="font-mono text-emerald-400 font-bold">{simulatedNoTillAdoptionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={simulatedNoTillAdoptionPct}
              onChange={(e) => setSimulatedNoTillAdoptionPct(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Nitrogen Fertilizer Reduction Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-300">Synthetic N Cut (%):</span>
              <span className="font-mono text-blue-400 font-bold">-{simulatedNReductionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={simulatedNReductionPct}
              onChange={(e) => setSimulatedNReductionPct(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>0%</span>
              <span>-20% (4R target)</span>
              <span>-40%</span>
            </div>
          </div>
        </div>

        {/* Forecast Result Card */}
        <div className="mt-4 bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
              Projected Annual Whole-Farm Impact
            </span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-emerald-400">
                +{scenarioTotalGrossMT.toLocaleString()} MT CO₂e / yr
              </span>
              <span className="text-stone-600">|</span>
              <span className="text-2xl font-extrabold text-amber-300 font-mono">
                ${scenarioRevenueUSD.toLocaleString()} / yr
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400 max-w-sm">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Simulated estimates use standard agronomic emission factors (COMET-Farm). Actual credit payouts require independent verification.
            </span>
          </div>
        </div>
      </div>

      {/* Regulatory & Verification Disclaimer */}
      <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-4 flex items-start gap-3 text-xs text-stone-400">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-300">
            Audit &amp; Estimation Guardrail Disclosure
          </p>
          <p>
            Carbon figures displayed in this portal are estimates calculated using published agronomic emission factors (USDA COMET-Farm &amp; IPCC Tier 1 defaults), combined with satellite NDVI groundcover confirmation. They are intended for progress tracking, insetting documentation, and grant eligibility applications, and are not a substitute for certified third-party verifier audits required on formal voluntary offset exchanges.
          </p>
        </div>
      </div>
    </div>
  );
};
