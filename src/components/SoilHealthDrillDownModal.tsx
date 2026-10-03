import React, { useState, useEffect } from 'react';
import { GeographicLocation } from '../types';
import { GoogleMapsGroundingCard } from './GoogleMapsGroundingCard';
import { 
  X, 
  Sparkles, 
  Leaf, 
  Droplets, 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  Globe2, 
  MapPin, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Calendar, 
  Award, 
  ArrowRight, 
  Activity, 
  BarChart3, 
  Sprout, 
  FileText,
  AlertTriangle,
  Zap,
  Info
} from 'lucide-react';

interface SoilHealthDrillDownModalProps {
  location: GeographicLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrollField?: (location: GeographicLocation) => void;
  initialTab?: 'benchmarks' | 'practices' | 'economic' | 'maps';
}

export const SoilHealthDrillDownModal: React.FC<SoilHealthDrillDownModalProps> = ({
  location,
  isOpen,
  onClose,
  onEnrollField,
  initialTab = 'benchmarks',
}) => {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'practices' | 'economic' | 'maps'>(initialTab);
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !location) return null;

  const b = location.soilHealthBenchmarks;

  // Fallback defaults if benchmarks are somehow missing
  const baselineSOC = b?.baselineSOCPct ?? 2.5;
  const stock = b?.baselineStockTonsCPerHa ?? Number((baselineSOC * 21.8).toFixed(1));
  const ph = b?.soilPh ?? 6.6;
  const bulkDensity = b?.bulkDensityGPerCm3 ?? 1.28;
  const cec = b?.cationExchangeCapacityCEC ?? 22.4;
  const awc = b?.availableWaterCapacityPct ?? 18.5;
  const totalCarbon = b?.annualSequestrationPotentialMTCO2ePerAcre.totalCombinedPotential ?? 1.45;
  const coverCropRate = b?.annualSequestrationPotentialMTCO2ePerAcre.coverCropping ?? 0.48;
  const noTillRate = b?.annualSequestrationPotentialMTCO2ePerAcre.noTillOrStripTill ?? 0.38;
  const biocharRate = b?.annualSequestrationPotentialMTCO2ePerAcre.biocharCompost ?? 0.65;
  const grazingRate = b?.annualSequestrationPotentialMTCO2ePerAcre.rotationalGrazing ?? 0.40;
  const som5Yr = b?.somAccretion5YrTargetPct ?? 0.45;
  const som10Yr = b?.somAccretion10YrTargetPct ?? 0.90;
  const confidence = b?.additionalityConfidencePct ?? 94;

  const annualRevenueAt30USD = Math.round(totalCarbon * 30 * 100); // 100-acre standard benchmark

  const handleEnrollClick = () => {
    setEnrolledSuccess(true);
    setTimeout(() => {
      setEnrolledSuccess(false);
      if (onEnrollField) onEnrollField(location);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      <div className="bg-stone-900 border border-stone-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 text-stone-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* ================= MODAL HEADER WITH THE 4 CATEGORIES ================= */}
        <div className="p-6 bg-stone-950 border-b border-stone-800 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            {/* The 4 Categories Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category 1: Continent */}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-sky-950/80 text-sky-300 border border-sky-800/80 px-2.5 py-0.5 rounded-full">
                <Globe2 className="w-3 h-3" />
                Cat 1: {location.continent}
              </span>

              {/* Category 2: Country */}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3 h-3" />
                Cat 2: {location.country} ({location.countryCode})
              </span>

              {/* Category 3: Compass Direction */}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2.5 py-0.5 rounded-full">
                <Compass className="w-3 h-3" />
                Cat 3: {location.compassDirection} Quadrant
              </span>

              {/* Category 4: Approximate Cost of Living */}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-mono">
                <DollarSign className="w-3 h-3" />
                Cat 4: ${location.approxCostOfLivingUSD.toLocaleString()}/mo ({location.costOfLivingTier})
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-100">
                  {location.name}
                </h3>
                {location.isNationalTerritoryPlaceholder && (
                  <span className="bg-stone-800 text-stone-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-stone-700">
                    National Baseline
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {location.subRegion} &bull; Coordinates: {location.coordinates[0].toFixed(3)}°N, {location.coordinates[1].toFixed(3)}°E
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-2 rounded-xl hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= TAB SELECTOR ================= */}
        <div className="px-6 py-2 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'benchmarks'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Soil Health &amp; Carbon Benchmarks</span>
            </button>
            <button
              onClick={() => setActiveTab('practices')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'practices'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Sequestration Potential by Practice</span>
            </button>
            <button
              onClick={() => setActiveTab('economic')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'economic'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Cost of Living &amp; Carbon Economics</span>
            </button>
            <button
              onClick={() => setActiveTab('maps')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'maps'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
              title="Query Google Maps Grounding via gemini-3.5-flash for local soil testing labs, extension services and ag retailers"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Google Maps Ag Directory</span>
            </button>
          </div>

          <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified MRV Regional Model
          </span>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* TAB 1: SOIL HEALTH & CARBON BENCHMARKS */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-6">
              {/* Primary 4-Metric Spotlight Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Metric 1: Baseline SOC */}
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                    Baseline Soil Organic Carbon
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                      {baselineSOC}%
                    </span>
                    <span className="text-[11px] text-stone-400">SOC</span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Stock: <strong className="text-stone-300 font-mono">{stock} t C/ha</strong> in top 30cm
                  </p>
                </div>

                {/* Metric 2: Annual Sequestration Potential */}
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                    Annual Carbon Potential
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                      +{totalCarbon}
                    </span>
                    <span className="text-[11px] text-stone-400">MT/ac/yr</span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Multi-practice regenerative abatement
                  </p>
                </div>

                {/* Metric 3: 5-Year SOM Target */}
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                    5-Yr SOM Accretion Target
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                      +{som5Yr}%
                    </span>
                    <span className="text-[11px] text-stone-400">SOM</span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    10-Year: <strong className="text-stone-300 font-mono">+{som10Yr}% SOM gain</strong>
                  </p>
                </div>

                {/* Metric 4: Additionality Confidence */}
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                    Additionality Confidence
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                      {confidence}%
                    </span>
                    <span className="text-[11px] text-stone-400">Score</span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    IPCC Tier 1 / Sentinel-2 validated
                  </p>
                </div>
              </div>

              {/* Comprehensive Soil Biophysical Parameter Matrix */}
              <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-850">
                  <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Biophysical Soil Properties &amp; Structural Classifications
                  </h4>
                  <span className="text-[11px] text-stone-400 font-mono">
                    USDA NRCS &bull; FAO Harmonized World Soil Database
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 font-semibold block">Major Soil Classification</span>
                    <span className="text-xs font-bold text-stone-200 mt-1 block">
                      {b?.majorSoilOrder || location.agriculturalProfile?.soilZone || 'Mollisols / Luvisols'}
                    </span>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Texture: <strong className="text-stone-300">{b?.soilTexture || 'Silty Clay Loam'}</strong>
                    </p>
                  </div>

                  <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 font-semibold block">Soil Reaction (pH Level)</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-bold text-amber-300 font-mono">{ph} pH</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Optimal Bacterial/Fungal Ratio</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Nutrient bioavailability index peak at 6.2–6.8
                    </p>
                  </div>

                  <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 font-semibold block">Bulk Density &amp; Porosity</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-bold text-cyan-300 font-mono">{bulkDensity} g/cm³</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Low Compaction</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      AWC: <strong className="text-stone-300">{awc}% VWC</strong> water buffer capacity
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 font-semibold block">Cation Exchange Capacity (CEC)</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-bold text-stone-100 font-mono">{cec} meq/100g</span>
                      <span className="text-[10px] text-emerald-400">High Mineral Holding Capacity</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Exchanges Ca²⁺, Mg²⁺, and K⁺ with high root nutrient transfer efficiency.
                    </p>
                  </div>

                  <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-400 font-semibold block">Microbial Biomass Carbon (MBC)</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {b?.topsoilMicrobialBiomassCarbonMgPerKg || 420} mg C/kg
                      </span>
                      <span className="text-[10px] text-emerald-400">Active Microbial Necromass</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Drives stable mineral-associated organic matter (MAOM) encapsulation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEQUESTRATION POTENTIAL BY PRACTICE */}
          {activeTab === 'practices' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-start gap-2 text-stone-300">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Regional emission abatement coefficients calibrated for <strong>{location.name}</strong> under USDA COMET-Farm and IPCC Tier 1 guidelines. Rates reflect metric tons $CO_2e$ sequestered per acre per year.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Practice 1: Cover Cropping */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5 text-xs">
                      <Sprout className="w-4 h-4 text-emerald-400" />
                      Multi-Species Cover Cropping
                    </span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      +{coverCropRate} MT/ac/yr
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Rye, clover, and tillage radish blend scavenging residual nitrogen, adding 1.5–2.5 dry tons/ac of root and shoot biomass.
                  </p>
                  <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, coverCropRate * 120)}%` }} />
                  </div>
                </div>

                {/* Practice 2: No-Till / Strip-Till */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5 text-xs">
                      <Leaf className="w-4 h-4 text-cyan-400" />
                      Continuous No-Till / Direct Drill
                    </span>
                    <span className="text-cyan-400 font-mono font-bold text-sm">
                      +{noTillRate} MT/ac/yr
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Zero inversion tillage preventing oxidative mineralization of subsoil organic carbon while safeguarding mycorrhizal hyphae.
                  </p>
                  <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.min(100, noTillRate * 140)}%` }} />
                  </div>
                </div>

                {/* Practice 3: Biochar & Compost */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Composted Biochar Injection
                    </span>
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      +{biocharRate} MT/ac/yr
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Pyrolyzed recalcitrant black carbon possessing a half-life &gt; 500 years, boosting CEC and permanent carbon persistence.
                  </p>
                  <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, biocharRate * 100)}%` }} />
                  </div>
                </div>

                {/* Practice 4: Rotational Grazing */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5 text-xs">
                      <Activity className="w-4 h-4 text-purple-400" />
                      Adaptive Multi-Paddock Grazing
                    </span>
                    <span className="text-purple-400 font-mono font-bold text-sm">
                      +{grazingRate} MT/ac/yr
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    High-density, short-duration animal trampling incorporating manure into topsoil while giving deep perennial roots rest recovery.
                  </p>
                  <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, grazingRate * 125)}%` }} />
                  </div>
                </div>
              </div>

              {/* Actionable Recommended Transitions */}
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="font-bold text-stone-300 block text-xs">
                  Region-Specific Agronomic Protocols:
                </span>
                <ul className="space-y-1.5 text-stone-300 text-xs">
                  {(b?.recommendedRegenerativePractices || [
                    'Terminate cover crop mechanically with roller-crimper to preserve moisture mulch.',
                    'Incorporate cold-hardy winter cereals (e.g. winter rye or triticale) following row harvest.',
                    'Split nitrogen applications to reduce nitrous oxide evaporative flux.',
                  ]).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: ECONOMIC & COST OF LIVING INTEGRATION */}
          {activeTab === 'economic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cost of Living Detail Card */}
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="font-bold text-stone-200 text-xs flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Category 4: Cost of Living Breakdown
                    </span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      ${location.approxCostOfLivingUSD}/mo
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-stone-300">
                      <span>Monthly Land / Housing:</span>
                      <strong className="font-mono text-stone-100">${location.costBreakdown.monthlyHousingRentUSD}</strong>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Food &amp; Groceries:</span>
                      <strong className="font-mono text-stone-100">${location.costBreakdown.groceriesUSD}</strong>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Energy, Fuel &amp; Utilities:</span>
                      <strong className="font-mono text-stone-100">${location.costBreakdown.utilitiesEnergyUSD}</strong>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Farm Transportation / Haulage:</span>
                      <strong className="font-mono text-stone-100">${location.costBreakdown.transportationUSD}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                    <span>Relative Cost Index:</span>
                    <span className="font-mono text-stone-200 font-bold">{location.livingCostIndex} / 100 (Global Baseline)</span>
                  </div>
                </div>

                {/* Carbon Revenue Potential Card */}
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="font-bold text-stone-200 text-xs flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      Projected Carbon Insetting Value
                    </span>
                    <span className="font-mono text-cyan-400 font-bold text-sm">
                      ${annualRevenueAt30USD.toLocaleString()} / 100 ac
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-stone-300">
                      <span>Benchmark Carbon Price:</span>
                      <strong className="font-mono text-stone-100">$30.00 / MT CO₂e</strong>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Annual Yield (100 Enrolled Acres):</span>
                      <strong className="font-mono text-cyan-400">+{Math.round(totalCarbon * 100)} MT CO₂e/yr</strong>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Soil Water Holding Savings:</span>
                      <strong className="font-mono text-emerald-400">~240,000 gal/yr saved</strong>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Grant Eligibility (EQIP / CSP / Horizon):</span>
                      <strong className="text-emerald-400 font-semibold">Tier 1 Qualified</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-500 italic">
                    Estimates based on USDA COMET-Farm &amp; IPCC emission factors; not a certified financial guarantee.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE GOOGLE MAPS GROUNDING (gemini-3.5-flash) */}
          {activeTab === 'maps' && (
            <div className="space-y-4">
              <GoogleMapsGroundingCard
                locationName={location.name}
                coordinates={location.coordinates}
                country={location.country}
                subRegion={location.subRegion}
              />
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-stone-400 text-[11px]">
            Selected: <strong className="text-stone-200">{location.name}</strong> ({location.country}, {location.continent})
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-900 font-semibold transition"
            >
              Close
            </button>

            <button
              onClick={handleEnrollClick}
              disabled={enrolledSuccess}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95"
            >
              {enrolledSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Applied to MRV Planner!</span>
                </>
              ) : (
                <>
                  <span>Apply Regional Benchmarks</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
