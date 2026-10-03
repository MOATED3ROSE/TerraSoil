import React, { useState } from 'react';
import { 
  Farm, 
  Field, 
  UnifiedEntityRelationNode, 
  RegionalBenchmarkMetric, 
  SimilarFarmMatch, 
  RegionalScenarioSimulation 
} from '../types';
import { 
  MOCK_UNIFIED_ENTITY_CHAIN, 
  MOCK_REGIONAL_BENCHMARKS, 
  MOCK_SIMILAR_FARMS, 
  MOCK_REGIONAL_SCENARIOS, 
  getExplainThisContextForField 
} from '../data/signatureFeaturesData';
import { 
  Database, 
  Layers, 
  Scale, 
  Sparkles, 
  Compass, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Sliders, 
  Activity, 
  FileText, 
  Tractor, 
  Building2, 
  FileCheck2, 
  Droplets, 
  BarChart3, 
  X, 
  ExternalLink, 
  Info,
  Award,
  BookOpen,
  ArrowRight,
  GitBranch,
  Cpu,
  Globe2,
  Lock,
  Hash,
  Copy,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

interface SignatureFeaturesHubProps {
  currentFarm: Farm;
  selectedField: Field | null;
  onOpenLineageModal?: (field?: Field) => void;
  onOpenReportModal?: () => void;
  onOpenLocalGIS?: () => void;
  onOpenGlobalExplorer?: () => void;
  onOpenExplainThis?: (metricName: string, metricValue: string | number, unit: string) => void;
}

export const SignatureFeaturesHub: React.FC<SignatureFeaturesHubProps> = ({
  currentFarm,
  selectedField,
  onOpenLineageModal,
  onOpenReportModal,
  onOpenLocalGIS,
  onOpenGlobalExplorer,
  onOpenExplainThis,
}) => {
  const [activeTab, setActiveTab] = useState<'er_architecture' | 'benchmark_engine' | 'similar_farms' | 'scenario_map' | 'signature_index'>('benchmark_engine');
  const [selectedEntityNode, setSelectedEntityNode] = useState<UnifiedEntityRelationNode>(MOCK_UNIFIED_ENTITY_CHAIN[3]);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(1); // Default to 40% scenario
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const activeScenario = MOCK_REGIONAL_SCENARIOS[activeScenarioIndex];

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 text-stone-100 transition-all">
      {/* ========================================================================= */}
      {/* TOP HEADER: SIGNATURE FEATURES & MAP INTEGRATION */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Map Integration, Shared Architecture & Signature Features
              </h2>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                PRD-09 Suite
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              10-Tier Unified Entity Chain &bull; Regional Benchmark Engine &bull; Similar Farm Cohorts &bull; Scenario Simulator
            </p>
          </div>
        </div>

        {/* Cross-Map Quick Switches */}
        <div className="flex items-center gap-2">
          {onOpenLocalGIS && (
            <button
              onClick={onOpenLocalGIS}
              className="px-3.5 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-emerald-400 border border-stone-800 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Tractor className="w-3.5 h-3.5" />
              <span>Local Field Parcel GIS →</span>
            </button>
          )}

          {onOpenGlobalExplorer && (
            <button
              onClick={onOpenGlobalExplorer}
              className="px-3.5 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-cyan-400 border border-stone-800 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Global Intelligence Map →</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIGNATURE NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="bg-stone-950 p-1.5 rounded-2xl border border-stone-800 flex items-center justify-between gap-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('benchmark_engine')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
            activeTab === 'benchmark_engine'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-300" />
          <span>Regional Benchmark Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('similar_farms')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
            activeTab === 'similar_farms'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-300" />
          <span>Similar Farm Cohorts (4)</span>
        </button>

        <button
          onClick={() => setActiveTab('scenario_map')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
            activeTab === 'scenario_map'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-300" />
          <span>Regional Scenario Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('er_architecture')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
            activeTab === 'er_architecture'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span>10-Tier Unified Schema</span>
        </button>

        <button
          onClick={() => setActiveTab('signature_index')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
            activeTab === 'signature_index'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Signature Features Index</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REGIONAL BENCHMARK ENGINE (P1 SIGNATURE FEATURE) */}
      {/* ========================================================================= */}
      {activeTab === 'benchmark_engine' && (
        <div className="space-y-5">
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                Multi-Scale Agronomic Benchmarking
              </span>
              <h3 className="text-base font-bold text-white">
                {currentFarm.name} vs. Regional & Global Cohorts
              </h3>
              <p className="text-xs text-stone-400">
                Comparing farm performance against similar agro-ecological peers, county baselines, and global Mollisol standards
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Scope:</span>
              <span className="bg-stone-900 border border-stone-800 text-emerald-400 font-mono text-xs px-3 py-1.5 rounded-xl font-bold">
                {currentFarm.fields.length} Fields &bull; {currentFarm.totalAcreage} Acres
              </span>
            </div>
          </div>

          {/* Benchmark Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_REGIONAL_BENCHMARKS.map((metric) => (
              <div
                key={metric.metricKey}
                className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3 hover:border-stone-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{metric.label}</span>
                    <span className="text-[10px] text-stone-500 uppercase font-mono">Unit: {metric.unit}</span>
                  </div>
                  {onOpenExplainThis && (
                    <button
                      onClick={() => onOpenExplainThis(metric.label, metric.activeFarmValue, metric.unit)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-stone-800 flex items-center gap-1 transition"
                    >
                      <Info className="w-3 h-3" />
                      <span>Explain This</span>
                    </button>
                  )}
                </div>

                {/* 4-Column Comparative Values */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-800/80 text-center">
                  <div className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/80">
                    <span className="text-[9px] text-emerald-400 uppercase font-bold block">This Farm</span>
                    <span className="text-sm font-black text-emerald-300 font-mono">{metric.activeFarmValue}</span>
                  </div>
                  <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                    <span className="text-[9px] text-stone-400 uppercase font-bold block">Similar</span>
                    <span className="text-sm font-bold text-cyan-300 font-mono">{metric.similarFarmsAvg}</span>
                  </div>
                  <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                    <span className="text-[9px] text-stone-400 uppercase font-bold block">Regional</span>
                    <span className="text-sm font-bold text-amber-300 font-mono">{metric.regionalBenchmark}</span>
                  </div>
                  <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                    <span className="text-[9px] text-stone-400 uppercase font-bold block">Global</span>
                    <span className="text-sm font-bold text-stone-300 font-mono">{metric.globalBenchmark}</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed bg-stone-900/50 p-2.5 rounded-xl border border-stone-800/60">
                  {metric.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: "FIND FARMS SIMILAR TO THIS FARM" COHORT */}
      {/* ========================================================================= */}
      {activeTab === 'similar_farms' && (
        <div className="space-y-4">
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                Agronomic Peer Group Matching Engine
              </span>
              <h3 className="text-base font-bold text-white">
                Farms Similar to {currentFarm.name}
              </h3>
              <p className="text-xs text-stone-400">
                Matched on soil taxonomy, rainfall regime, climate classification, and crop rotation
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold">
              4 Matching Farms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_SIMILAR_FARMS.map((farm) => (
              <div
                key={farm.id}
                className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3 hover:border-cyan-500/60 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{farm.farmName}</h4>
                    <p className="text-xs text-stone-400">{farm.region} &bull; {farm.stateCountry}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-xs font-bold">
                    {farm.similarityScorePct}% Match
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                    <span className="text-[9px] text-stone-500 uppercase block">Total Area</span>
                    <span className="font-bold text-stone-200 font-mono">{farm.totalAcres} ac</span>
                  </div>
                  <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                    <span className="text-[9px] text-stone-500 uppercase block">Baseline SOC</span>
                    <span className="font-bold text-emerald-400 font-mono">{farm.baselineSOCPct}%</span>
                  </div>
                  <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                    <span className="text-[9px] text-stone-500 uppercase block">Carbon Rate</span>
                    <span className="font-bold text-amber-300 font-mono">+{farm.annualSequestrationRate} t/ac</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Key Matching Factors:</span>
                  <ul className="space-y-0.5 text-[11px] text-stone-300 list-disc pl-4">
                    {farm.matchingFactors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <span className="text-stone-400">Top Regenerative Practice:</span>
                  <span className="font-bold text-emerald-400">{farm.topPractice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGIONAL SCENARIO MAP SIMULATOR (PRD-09 §5 & §6) */}
      {/* ========================================================================= */}
      {activeTab === 'scenario_map' && (
        <div className="space-y-5">
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                Watershed & Regional Impact Modeling
              </span>
              <h3 className="text-base font-bold text-white">
                "What If?" Regional Adoption Scenario Planner
              </h3>
              <p className="text-xs text-stone-400">
                Simulating regional carbon drawdown, water storage resilience, and nitrogen abatement across the Upper Mississippi River Basin
              </p>
            </div>
          </div>

          {/* Scenario Adoption Step Selector */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200">Select Regional Adoption Level:</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {activeScenario.adoptionPercentage}% Supply Shed Enrolled ({activeScenario.enrolledAcresRegional.toLocaleString()} Acres)
              </span>
            </div>

            <div className="flex items-center gap-3">
              {MOCK_REGIONAL_SCENARIOS.map((scen, idx) => (
                <button
                  key={scen.id}
                  onClick={() => setActiveScenarioIndex(idx)}
                  className={`flex-1 py-3 px-3 rounded-2xl border text-left transition ${
                    activeScenarioIndex === idx
                      ? 'bg-emerald-950 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/30'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <b className="text-xs font-bold">{scen.adoptionPercentage}% Adoption</b>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      +{Math.round(scen.totalAnnualCarbonGainMT / 1000)}k tCO₂e/yr
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">{scen.scenarioName}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Projected Outcomes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Annual Carbon Removal</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                +{activeScenario.totalAnnualCarbonGainMT.toLocaleString()} <span className="text-xs font-normal">MT</span>
              </span>
              <span className="text-[10px] text-emerald-500 block">5-Yr: {(activeScenario.cumulative5YrCarbonGainMT / 1000000).toFixed(2)}M MT CO₂e</span>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Stormwater Infiltration</span>
              <span className="text-xl font-black text-cyan-400 font-mono">
                +{activeScenario.waterRetentionIncreaseMGallons.toLocaleString()} <span className="text-xs font-normal">M Gal</span>
              </span>
              <span className="text-[10px] text-cyan-500 block">Drought Buffer Resilience</span>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Synthetic N Abated</span>
              <span className="text-xl font-black text-amber-300 font-mono">
                -{activeScenario.syntheticNitrogenAbatedTons.toLocaleString()} <span className="text-xs font-normal">Tons</span>
              </span>
              <span className="text-[10px] text-amber-500 block">4R Precision Nutrient Split</span>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Farmer Gross Payout</span>
              <span className="text-xl font-black text-white font-mono">
                ${(activeScenario.farmerEconomicPayoutUSD / 1000000).toFixed(2)}M <span className="text-xs font-normal">USD</span>
              </span>
              <span className="text-[10px] text-emerald-400 block">${activeScenario.corporateScope3AbatementUSDPerTon}/tCO₂e Insetting Cost</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 10-TIER UNIFIED ENTITY-RELATIONSHIP SCHEMA ARCHITECTURE (PRD-09 §2) */}
      {/* ========================================================================= */}
      {activeTab === 'er_architecture' && (
        <div className="space-y-5">
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                Full-Stack Entity-Relationship Model
              </span>
              <h3 className="text-base font-bold text-white">
                10-Tier Unified Agricultural Data Backbone
              </h3>
              <p className="text-xs text-stone-400">
                Single relational chain powering Local Field Parcel GIS, Global Intelligence Explorer, and Assurance Ledgers
              </p>
            </div>
            <span className="text-xs font-mono text-stone-400 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl">
              Tier {selectedEntityNode.tierIndex + 1} of 10 Selected
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Interactive 10-Tier Stepper Chain */}
            <div className="lg:col-span-6 space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {MOCK_UNIFIED_ENTITY_CHAIN.map((node) => {
                const isSelected = selectedEntityNode.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedEntityNode(node)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-stone-950 border-stone-800 hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-stone-400 border border-stone-800'
                      }`}>
                        {node.tierIndex + 1}
                      </span>
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase block">{node.label}</span>
                        <h4 className="text-xs font-bold text-white">{node.entityName}</h4>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-600" />
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Node Attribute Inspector */}
            <div className="lg:col-span-6 bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
              <div className="flex items-start justify-between border-b border-stone-800 pb-3">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Tier {selectedEntityNode.tierIndex + 1}: {selectedEntityNode.label}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{selectedEntityNode.entityName}</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                  {selectedEntityNode.confidence} Confidence
                </span>
              </div>

              {/* Attributes Key-Value Table */}
              <div className="space-y-1.5 text-xs">
                {Object.entries(selectedEntityNode.attributes).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-800/80">
                    <span className="text-stone-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-mono text-white font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>

              {/* Provenance & Cryptographic Validation Hash */}
              <div className="pt-2 border-t border-stone-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span>Source Provenance:</span>
                  <span className="text-stone-300 font-medium text-right">{selectedEntityNode.provenanceSource}</span>
                </div>

                {selectedEntityNode.verificationHash && (
                  <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between">
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="text-[10px] text-stone-500 font-mono uppercase block">SHA-256 Chain Hash</span>
                      <p className="font-mono text-[10px] text-emerald-400 truncate max-w-xs">{selectedEntityNode.verificationHash}</p>
                    </div>
                    <button
                      onClick={() => handleCopyHash(selectedEntityNode.verificationHash!)}
                      className="p-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 text-stone-300 transition"
                      title="Copy cryptographic verification hash"
                    >
                      {copiedHash === selectedEntityNode.verificationHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SIGNATURE FEATURES INDEX (PRD-09 §5) */}
      {/* ========================================================================= */}
      {activeTab === 'signature_index' && (
        <div className="space-y-4">
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
              Core Platform Differentiators
            </span>
            <h3 className="text-base font-bold text-white">
              TerraSoil Signature Features Index
            </h3>
            <p className="text-xs text-stone-400">
              The high-trust architectural capabilities that elevate TerraSoil from a generic GIS into a verified MRV engine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Carbon Data Lineage */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Carbon Data Lineage
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-emerald-400 font-mono">
                  PRD-01 &bull; PRD-04 &bull; PRD-05
                </span>
              </div>
              <p className="text-stone-400 text-[11px]">
                End-to-end trace from corporate ESG figure $\rightarrow$ supplier $\rightarrow$ farm $\rightarrow$ field $\rightarrow$ in-situ core evidence.
              </p>
              {onOpenLineageModal && (
                <button
                  onClick={() => onOpenLineageModal(selectedField || currentFarm.fields[0])}
                  className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center gap-1 pt-1"
                >
                  <span>Launch Lineage Modal →</span>
                </button>
              )}
            </div>

            {/* 2. Practice-to-Outcome Timeline */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Practice-to-Outcome Timeline
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-cyan-400 font-mono">
                  PRD-07 §3
                </span>
              </div>
              <p className="text-stone-400 text-[11px]">
                Multi-temporal Sentinel-2 scrubber synchronizing practice interventions with NDVI greenness, SOC gains, and moisture buffers.
              </p>
              {onOpenLocalGIS && (
                <button
                  onClick={onOpenLocalGIS}
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px] flex items-center gap-1 pt-1"
                >
                  <span>Open in Local Field GIS →</span>
                </button>
              )}
            </div>

            {/* 3. Regional Benchmark Engine */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  Regional Benchmark Engine
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-amber-400 font-mono">
                  PRD-09 §5
                </span>
              </div>
              <p className="text-stone-400 text-[11px]">
                Direct benchmarking across Active Farm $\leftrightarrow$ Similar Farm Cohort $\leftrightarrow$ County Benchmark $\leftrightarrow$ Global Standard.
              </p>
              <button
                onClick={() => setActiveTab('benchmark_engine')}
                className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1 pt-1"
              >
                <span>View Live Engine Tab →</span>
              </button>
            </div>

            {/* 4. One-Click Farm Dossier */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  One-Click Farm Dossier
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-purple-400 font-mono">
                  PRD-03 §3.5
                </span>
              </div>
              <p className="text-stone-400 text-[11px]">
                Downloadable, audit-ready compliance PDF and JSON assurance statement generated with a single click.
              </p>
              {onOpenReportModal && (
                <button
                  onClick={onOpenReportModal}
                  className="text-purple-400 hover:text-purple-300 font-bold text-[11px] flex items-center gap-1 pt-1"
                >
                  <span>Generate PDF Dossier →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
