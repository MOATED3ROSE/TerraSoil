import React, { useState } from 'react';
import { Field, Farm, WeatherTelemetryData } from '../types';
import { calculateFieldCropYield } from '../utils/yieldCalculations';
import { 
  Sprout, 
  TrendingUp, 
  DollarSign, 
  Sliders, 
  ShieldCheck, 
  Droplets, 
  Activity, 
  HelpCircle, 
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Wheat,
  Tractor
} from 'lucide-react';

interface CropYieldPredictionProps {
  field: Field;
  currentFarm?: Farm;
  weatherData?: WeatherTelemetryData | null;
}

export const CropYieldPrediction: React.FC<CropYieldPredictionProps> = ({
  field,
  currentFarm,
  weatherData,
}) => {
  const [additionalRainfallMm, setAdditionalRainfallMm] = useState<number>(15);
  const [conventionalComparison, setConventionalComparison] = useState<boolean>(false);
  const [customPrice, setCustomPrice] = useState<number | undefined>(undefined);

  // Compute prediction
  const yieldEstimate = calculateFieldCropYield(field, weatherData, {
    additionalRainfallMm,
    customPricePerUnit: customPrice,
    conventionalPracticeComparison: conventionalComparison,
  });

  // Conventional baseline for side-by-side comparison
  const conventionalEstimate = calculateFieldCropYield(field, weatherData, {
    additionalRainfallMm: 0,
    customPricePerUnit: customPrice,
    conventionalPracticeComparison: true,
  });

  const yieldDeltaVsConventional = Math.max(
    0,
    Math.round((yieldEstimate.projectedYieldPerAcre - conventionalEstimate.projectedYieldPerAcre) * 10) / 10
  );

  const revenueDeltaVsConventional = Math.max(
    0,
    yieldEstimate.projectedRevenueUSD - conventionalEstimate.projectedRevenueUSD
  );

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/80">
              <Wheat className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Biophysical Agronomic Intelligence
            </span>
            <span className="text-stone-600">&bull;</span>
            <span className="bg-stone-950 text-stone-300 text-xs px-2.5 py-0.5 rounded-full border border-stone-800 font-mono">
              Sentinel-2 NDVI &bull; Root Hydration Model
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-100 flex items-center gap-2">
            Crop Harvest Yield Prediction &mdash; {field.name}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Predictive yield projection combining multi-spectral vegetation indices, root-zone volumetric moisture, and topsoil organic carbon resilience buffers.
          </p>
        </div>

        {/* Model Accuracy & Confidence Badge */}
        <div className="bg-stone-950 border border-stone-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
              Model Confidence
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {yieldEstimate.confidenceScorePct}% Validated
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projected Yield per Acre */}
        <div className="bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Projected Field Yield</span>
            <Sprout className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
              {yieldEstimate.projectedYieldPerAcre}
            </span>
            <span className="text-xs text-stone-300 font-medium">{yieldEstimate.unit}</span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
            <span className={`px-2 py-0.5 rounded text-[11px] ${
              yieldEstimate.percentageVsBaseline >= 0
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {yieldEstimate.percentageVsBaseline >= 0 ? '+' : ''}{yieldEstimate.percentageVsBaseline}% vs Baseline
            </span>
            <span className="text-[11px] text-stone-400">
              ({yieldEstimate.baselineRegionalYield} {yieldEstimate.unit})
            </span>
          </div>
        </div>

        {/* Total Production Volume */}
        <div className="bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Harvest Volume</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-stone-100 font-mono">
              {yieldEstimate.totalFieldProduction.toLocaleString()}
            </span>
            <span className="text-xs text-stone-400">{yieldEstimate.unit.split('/')[0]}</span>
          </div>
          <p className="text-xs text-stone-400 mt-3">
            Across {field.acreage} enrolled acres of {field.cropType}.
          </p>
        </div>

        {/* Projected Crop Gross Valuation */}
        <div className="bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Estimated Crop Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
              ${yieldEstimate.projectedRevenueUSD.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-3">
            At benchmark ${yieldEstimate.benchmarkPricePerUnit.toFixed(2)} / {yieldEstimate.unit.split('/')[0]}.
          </p>
        </div>

        {/* Regenerative Yield Advantage */}
        <div className="bg-gradient-to-br from-stone-950 to-emerald-950/40 border border-emerald-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Soil Health Yield Advantage</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono">
              +{yieldDeltaVsConventional}
            </span>
            <span className="text-xs text-emerald-400 font-medium">{yieldEstimate.unit}</span>
          </div>
          <p className="text-xs text-stone-300 mt-3">
            Direct gain from cover crop roots &amp; no-till moisture retention (+${revenueDeltaVsConventional.toLocaleString()} extra value).
          </p>
        </div>
      </div>

      {/* Yield Driver Attribution Analysis */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div>
            <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Agronomic Driver Attribution &amp; Stress Penalty Decomposition
            </h4>
            <p className="text-xs text-stone-400">
              Quantitative breakdown of biophysical factors influencing this season&apos;s projected harvest volume.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Canopy NDVI */}
          <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300">Canopy Greenness (NDVI)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                +{yieldEstimate.drivers.ndviContributionPct}%
              </span>
            </div>
            <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, yieldEstimate.drivers.ndviContributionPct * 5))}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Sentinel-2 NDVI at <strong>{field.currentNDVI}</strong> indicates vigorous leaf area index and active carbon fixation.
            </p>
          </div>

          {/* Root Hydration */}
          <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300">Root-Zone Moisture Adequacy</span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                +{yieldEstimate.drivers.moistureContributionPct}%
              </span>
            </div>
            <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, yieldEstimate.drivers.moistureContributionPct * 10))}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Root-zone volumetric moisture (10-40cm) sustained above <strong>30% VWC</strong> during grain fill.
            </p>
          </div>

          {/* Baseline SOC Buffer */}
          <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300">Soil Organic Carbon Buffer</span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                +{yieldEstimate.drivers.socResiliencePct}%
              </span>
            </div>
            <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-lime-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, yieldEstimate.drivers.socResiliencePct * 15))}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Baseline <strong>{field.baselineSOCPct}% SOC</strong> provides +{field.carbonBreakdown.waterCapacityGainGallons.toLocaleString()} gal buffer against midday heat.
            </p>
          </div>

          {/* Thermal / Heat Stress */}
          <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300">Thermal Heat Stress Impact</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {yieldEstimate.drivers.thermalStressPenaltyPct}%
              </span>
            </div>
            <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.abs(yieldEstimate.drivers.thermalStressPenaltyPct) * 20)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400">
              No severe leaf scorching detected. High-resolution telemetry recorded zero prolonged heat spikes &gt;35°C.
            </p>
          </div>
        </div>
      </div>

      {/* Phenology Growth Stage Yield Trajectory */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div>
            <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Developmental Phenology &amp; Harvest Readiness Trajectory
            </h4>
            <p className="text-xs text-stone-400">
              Yield trajectory tracking through key reproductive milestones.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
            Active Phase: R4-R5 Dough/Dent
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {yieldEstimate.stages.map((stage, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                idx === 2
                  ? 'bg-stone-900 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-stone-900/60 border-stone-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-stone-200">{stage.stageName}</span>
                {idx === 2 && (
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                    Current
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mb-2">{stage.growthPhase}</p>

              <div className="pt-2 border-t border-stone-800/80 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-400 font-sans">Yield Pace:</span>
                  <span className="font-bold text-emerald-400">
                    {stage.projectedYieldAtStage} {yieldEstimate.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-sans">NDVI:</span>
                  <span className="text-stone-300">{stage.ndviObserved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-sans">Hydration:</span>
                  <span className="text-cyan-400 font-sans text-[11px] truncate max-w-[130px]">
                    {stage.moistureAdequacy}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Scenario Sandbox */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-stone-200">
              Interactive Pre-Harvest Scenario Simulator
            </h4>
          </div>
          <span className="text-xs text-stone-400">
            Simulate precipitation and market price shifts before combine dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Rainfall Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-300">Anticipated Late-Season Rain:</span>
              <span className="font-mono text-cyan-400 font-bold">+{additionalRainfallMm} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={additionalRainfallMm}
              onChange={(e) => setAdditionalRainfallMm(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>0 mm (Dry Finish)</span>
              <span>30 mm (Average)</span>
              <span>60 mm (Heavy)</span>
            </div>
          </div>

          {/* Commodity Price Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-300">Cash Grain Price Benchmark:</span>
              <span className="font-mono text-amber-400 font-bold">
                ${yieldEstimate.benchmarkPricePerUnit.toFixed(2)} / {yieldEstimate.unit.split('/')[0]}
              </span>
            </div>
            <input
              type="range"
              min={yieldEstimate.cropName === 'Soybeans' ? 9.0 : 3.0}
              max={yieldEstimate.cropName === 'Soybeans' ? 16.0 : 7.0}
              step="0.10"
              value={customPrice || yieldEstimate.benchmarkPricePerUnit}
              onChange={(e) => setCustomPrice(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>Base Market</span>
              <span>Local Elevator Cash</span>
              <span>Futures Contract</span>
            </div>
          </div>

          {/* Practice Comparison Toggle */}
          <div className="space-y-2 flex flex-col justify-center">
            <span className="text-xs font-semibold text-stone-300 block">Agronomic Practice Model:</span>
            <button
              onClick={() => setConventionalComparison(!conventionalComparison)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
                conventionalComparison
                  ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                  : 'bg-stone-900 border-stone-700 text-emerald-400 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tractor className="w-4 h-4" />
                <span>
                  {conventionalComparison ? 'Showing: Conventional Baseline' : 'Showing: Regenerative Enrolled'}
                </span>
              </div>
              <span className="text-[10px] underline font-sans">
                {conventionalComparison ? 'Revert to Regenerative' : 'Simulate Conventional'}
              </span>
            </button>
            <span className="text-[10px] text-stone-500">
              Compares current practice matrix against high-tillage regional default.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
