import React, { useState, useMemo } from 'react';
import { 
  Farm, 
  Field, 
  UserPersona, 
  EmissionFactorConfig, 
  PermissionAccessLevel,
  RoleCapability,
  SharedDataEntitySchema 
} from '../types';
import { 
  generateFieldDataLineage, 
  ROLE_CAPABILITIES_MATRIX, 
  SHARED_DATA_MODEL_ENTITIES 
} from '../utils/lineageAndPermissionUtils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  Database, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Search, 
  Key, 
  Users, 
  Table, 
  GitBranch, 
  ChevronRight, 
  FileCheck, 
  Sparkles, 
  Download, 
  Info,
  Award,
  Satellite,
  ExternalLink,
  RefreshCw,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart2,
  Calendar,
  Activity,
  Check
} from 'lucide-react';

interface DataFoundationHubProps {
  currentFarm: Farm;
  fields: Field[];
  selectedField: Field | null;
  onSelectField: (field: Field) => void;
  config: EmissionFactorConfig;
  activePersona: UserPersona;
  onOpenLineageModal: (field: Field) => void;
}

export const DataFoundationHub: React.FC<DataFoundationHubProps> = ({
  currentFarm,
  fields,
  selectedField,
  onSelectField,
  config,
  activePersona,
  onOpenLineageModal,
}) => {
  const [activeTab, setActiveTab] = useState<'lineage' | 'soc_trends' | 'permissions' | 'schema'>('soc_trends');
  const [activeFieldId, setActiveFieldId] = useState<string>(selectedField?.id || fields[0]?.id || '');
  const [trendScope, setTrendScope] = useState<'all_fields' | 'single_field'>('all_fields');
  const [chartMetric, setChartMetric] = useState<'cumulative' | 'annual' | 'soc_pct' | 'yoy_gain'>('cumulative');
  const [simulatedRole, setSimulatedRole] = useState<'farmer' | 'agronomist' | 'corporate' | 'auditor'>('farmer');
  const [searchCategory, setSearchCategory] = useState<string>('all');
  const [expandedEntity, setExpandedEntity] = useState<string>(SHARED_DATA_MODEL_ENTITIES[0]?.entityName || '');

  const targetField = fields.find((f) => f.id === activeFieldId) || fields[0];
  const lineage = targetField ? generateFieldDataLineage(targetField, currentFarm, config) : null;

  const getAccessBadge = (level: PermissionAccessLevel) => {
    switch (level) {
      case 'ALLOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>ALLOW (WRITE)</span>
          </span>
        );
      case 'READ_ONLY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>READ-ONLY</span>
          </span>
        );
      case 'REQUIRES_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-950/80 border border-amber-800 text-amber-300 font-mono">
            <Scale className="w-3 h-3 text-amber-400" />
            <span>APPROVAL REQ.</span>
          </span>
        );
      case 'PROHIBITED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-900 border border-stone-800 text-stone-500 font-mono">
            <Lock className="w-3 h-3 text-stone-500" />
            <span>PROHIBITED</span>
          </span>
        );
    }
  };

  const filteredCapabilities = searchCategory === 'all'
    ? ROLE_CAPABILITIES_MATRIX
    : ROLE_CAPABILITIES_MATRIX.filter((c) => c.category === searchCategory);

  const categories = Array.from(new Set(ROLE_CAPABILITIES_MATRIX.map((c) => c.category)));

  // Historical SOC & Carbon Sequestration Trend Computation (Task 1)
  const historicalTrendData = useMemo(() => {
    const activeTargetFields = trendScope === 'all_fields' ? fields : [targetField];
    const totalAcreage = activeTargetFields.reduce((acc, f) => acc + f.acreage, 0);
    const avgBaseSoc = 1.82; // baseline in %

    return [
      {
        year: '2020',
        label: '2020 (Baseline)',
        socPct: avgBaseSoc,
        annualRateMTperAc: 0.0,
        annualGrossMT: 0.0,
        cumulativeMT: 0.0,
        confidenceLowerMT: 0.0,
        confidenceUpperMT: 0.0,
        yoyGainPct: 0.0,
        milestone: 'In-Situ Soil Core Baseline Assessment (1.82% SOC)',
        isProjected: false,
      },
      {
        year: '2021',
        label: '2021',
        socPct: +(avgBaseSoc + 0.08).toFixed(2),
        annualRateMTperAc: 0.16,
        annualGrossMT: +(totalAcreage * 0.16).toFixed(1),
        cumulativeMT: +(totalAcreage * 0.16).toFixed(1),
        confidenceLowerMT: +(totalAcreage * 0.16 * 0.85).toFixed(1),
        confidenceUpperMT: +(totalAcreage * 0.16 * 1.15).toFixed(1),
        yoyGainPct: 4.4,
        milestone: 'Single-Disk Reduced Tillage Practice Introduced',
        isProjected: false,
      },
      {
        year: '2022',
        label: '2022',
        socPct: +(avgBaseSoc + 0.19).toFixed(2),
        annualRateMTperAc: 0.28,
        annualGrossMT: +(totalAcreage * 0.28).toFixed(1),
        cumulativeMT: +(totalAcreage * (0.16 + 0.28)).toFixed(1),
        confidenceLowerMT: +(totalAcreage * (0.16 + 0.28) * 0.86).toFixed(1),
        confidenceUpperMT: +(totalAcreage * (0.16 + 0.28) * 1.14).toFixed(1),
        yoyGainPct: 5.8,
        milestone: 'Multi-Species Winter Rye & Clover Cover Crops',
        isProjected: false,
      },
      {
        year: '2023',
        label: '2023',
        socPct: +(avgBaseSoc + 0.31).toFixed(2),
        annualRateMTperAc: 0.35,
        annualGrossMT: +(totalAcreage * 0.35).toFixed(1),
        cumulativeMT: +(totalAcreage * (0.16 + 0.28 + 0.35)).toFixed(1),
        confidenceLowerMT: +(totalAcreage * (0.16 + 0.28 + 0.35) * 0.87).toFixed(1),
        confidenceUpperMT: +(totalAcreage * (0.16 + 0.28 + 0.35) * 1.13).toFixed(1),
        yoyGainPct: 6.0,
        milestone: 'Continuous No-Till + Sentinel-2 Remote Sensing Overpasses',
        isProjected: false,
      },
      {
        year: '2024',
        label: '2024',
        socPct: +(avgBaseSoc + 0.44).toFixed(2),
        annualRateMTperAc: 0.42,
        annualGrossMT: +(totalAcreage * 0.42).toFixed(1),
        cumulativeMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42)).toFixed(1),
        confidenceLowerMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42) * 0.88).toFixed(1),
        confidenceUpperMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42) * 1.12).toFixed(1),
        yoyGainPct: 6.5,
        milestone: 'Variable-Rate Nitrogen Side-Dress (-20% Synthetic N Input)',
        isProjected: false,
      },
      {
        year: '2025',
        label: '2025',
        socPct: +(avgBaseSoc + 0.56).toFixed(2),
        annualRateMTperAc: 0.46,
        annualGrossMT: +(totalAcreage * 0.46).toFixed(1),
        cumulativeMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46)).toFixed(1),
        confidenceLowerMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46) * 0.89).toFixed(1),
        confidenceUpperMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46) * 1.11).toFixed(1),
        yoyGainPct: 5.1,
        milestone: 'Full Rotational Grazing Integration & Compost Amendment',
        isProjected: false,
      },
      {
        year: '2026',
        label: '2026 (Current)',
        socPct: +(avgBaseSoc + 0.66).toFixed(2),
        annualRateMTperAc: 0.49,
        annualGrossMT: +(totalAcreage * 0.49).toFixed(1),
        cumulativeMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49)).toFixed(1),
        confidenceLowerMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49) * 0.90).toFixed(1),
        confidenceUpperMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49) * 1.10).toFixed(1),
        yoyGainPct: 4.2,
        milestone: 'ISO 14064-3 Attestation & LECO Dry Combustion Core Verification',
        isProjected: false,
      },
      {
        year: '2027P',
        label: '2027 (Proj.)',
        socPct: +(avgBaseSoc + 0.76).toFixed(2),
        annualRateMTperAc: 0.51,
        annualGrossMT: +(totalAcreage * 0.51).toFixed(1),
        cumulativeMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49 + 0.51)).toFixed(1),
        confidenceLowerMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49 + 0.51) * 0.84).toFixed(1),
        confidenceUpperMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49 + 0.51) * 1.16).toFixed(1),
        yoyGainPct: 4.0,
        milestone: 'Projected Biochar Application & Deep Root Perennial Buffer',
        isProjected: true,
      },
      {
        year: '2028P',
        label: '2028 (Proj.)',
        socPct: +(avgBaseSoc + 0.85).toFixed(2),
        annualRateMTperAc: 0.52,
        annualGrossMT: +(totalAcreage * 0.52).toFixed(1),
        cumulativeMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49 + 0.51 + 0.52)).toFixed(1),
        confidenceLowerMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49 + 0.51 + 0.52) * 0.82).toFixed(1),
        confidenceUpperMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49 + 0.51 + 0.52) * 1.18).toFixed(1),
        yoyGainPct: 3.6,
        milestone: 'Projected SBTi FLAG 2028 Reduction Target Alignment',
        isProjected: true,
      },
      {
        year: '2030P',
        label: '2030 (Proj.)',
        socPct: +(avgBaseSoc + 1.02).toFixed(2),
        annualRateMTperAc: 0.54,
        annualGrossMT: +(totalAcreage * 0.54).toFixed(1),
        cumulativeMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49 + 0.51 + 0.52 + 1.08)).toFixed(1),
        confidenceLowerMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49 + 0.51 + 0.52 + 1.08) * 0.80).toFixed(1),
        confidenceUpperMT: +(totalAcreage * (0.16 + 0.28 + 0.35 + 0.42 + 0.46 + 0.49 + 0.51 + 0.52 + 1.08) * 1.20).toFixed(1),
        yoyGainPct: 6.8,
        milestone: 'Long-Term Soil Organic Matter Equilibrium Reached (2.84% SOC)',
        isProjected: true,
      }
    ];
  }, [fields, targetField, trendScope]);

  const currentYearData = historicalTrendData.find(d => d.year === '2026') || historicalTrendData[6];
  const baselineYearData = historicalTrendData[0];
  const netTotalGainMT = currentYearData.cumulativeMT;
  const netSocPctGain = +(((currentYearData.socPct - baselineYearData.socPct) / baselineYearData.socPct) * 100).toFixed(1);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      
      {/* Foundation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                System Data Architecture
              </span>
              <span className="text-stone-600">&bull;</span>
              <span className="text-xs text-stone-400 font-semibold">Core Platform &amp; Data Foundation</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-100">
              Shared Data Model, RBAC Governance &amp; Carbon Data Lineage
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {targetField && (
            <button
              onClick={() => onOpenLineageModal(targetField)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Audit Lineage ({targetField.name})</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveTab('soc_trends')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'soc_trends'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-lime-400" />
          <span>Historical SOC Trend &amp; Sequestration Aggregation</span>
        </button>

        <button
          onClick={() => setActiveTab('lineage')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'lineage'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Carbon Data Lineage &amp; Provenance (6 Stages)</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'permissions'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Granular Permission &amp; RBAC Governance Model</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'schema'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Table className="w-3.5 h-3.5 text-cyan-400" />
          <span>Unified Shared Agronomic Data Model Schema</span>
        </button>
      </div>

      {/* TAB 0: HISTORICAL SOC TREND & SEQUESTRATION AGGREGATION (TASK 1) */}
      {activeTab === 'soc_trends' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar: Scope, Metric, and Parcel Selector */}
          <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Scope Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-stone-400 font-semibold">Aggregation Scope:</span>
              <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800">
                <button
                  onClick={() => setTrendScope('all_fields')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    trendScope === 'all_fields'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Whole Farm Portfolio ({fields.reduce((acc, f) => acc + f.acreage, 0).toLocaleString()} ac)
                </button>
                <button
                  onClick={() => setTrendScope('single_field')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    trendScope === 'single_field'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Single Field Drilldown
                </button>
              </div>

              {trendScope === 'single_field' && (
                <select
                  value={activeFieldId}
                  onChange={(e) => {
                    setActiveFieldId(e.target.value);
                    const f = fields.find(item => item.id === e.target.value);
                    if (f) onSelectField(f);
                  }}
                  className="bg-stone-900 border border-stone-700 text-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.acreage} ac)</option>
                  ))}
                </select>
              )}
            </div>

            {/* Metric Mode Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => setChartMetric('cumulative')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  chartMetric === 'cumulative'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Cumulative Carbon (MT CO₂e)
              </button>
              <button
                onClick={() => setChartMetric('annual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  chartMetric === 'annual'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Annual Rate (MT CO₂e/yr)
              </button>
              <button
                onClick={() => setChartMetric('soc_pct')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  chartMetric === 'soc_pct'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Soil Organic Carbon (% SOC)
              </button>
              <button
                onClick={() => setChartMetric('yoy_gain')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  chartMetric === 'yoy_gain'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                YoY Growth (% / yr)
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Total Cumulative Stored Carbon</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-400">+{netTotalGainMT.toLocaleString()}</span>
                <span className="text-xs text-stone-400">MT CO₂e</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +{netSocPctGain}% over baseline
              </span>
            </div>

            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Current SOC Concentration</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-cyan-400">{currentYearData.socPct}%</span>
                <span className="text-xs text-stone-400">SOC (0–30cm)</span>
              </div>
              <span className="text-[11px] text-stone-400">
                Baseline: <strong className="text-stone-200 font-mono">{baselineYearData.socPct}%</strong> (2020)
              </span>
            </div>

            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Current Annual Insetting Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-lime-400">{currentYearData.annualRateMTperAc}</span>
                <span className="text-xs text-stone-400">MT CO₂e / ac / yr</span>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">
                {currentYearData.annualGrossMT} MT Total / yr
              </span>
            </div>

            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">MRV Uncertainty &amp; Assurance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-400">15%</span>
                <span className="text-xs text-stone-400">Buffer Escrow</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ISO 14064-2 Tier 2 Compliant
              </span>
            </div>
          </div>

          {/* Recharts Trend Line Chart */}
          <div className="bg-stone-950 p-5 sm:p-6 rounded-3xl border border-stone-800 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-stone-100">
                    {chartMetric === 'cumulative' && 'Cumulative Carbon Sequestration Trajectory (2020 – 2030 Proj.)'}
                    {chartMetric === 'annual' && 'Annual Greenhouse Gas Abatement & Sequestration Volume'}
                    {chartMetric === 'soc_pct' && 'Soil Organic Carbon (SOC %) In-Situ & Satellite Concentration Trend'}
                    {chartMetric === 'yoy_gain' && 'Year-over-Year Percentage Growth in Stored Carbon'}
                  </h4>
                  <p className="text-xs text-stone-400">
                    Aggregated multi-year trend reconciling lab dry combustion soil cores, multispectral Sentinel-2 NDVI, and USDA COMET-Farm daycent models.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Historical Verified (2020–2026)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-dashed border-cyan-300" />
                  <span>Projected Trajectory (2027–2030)</span>
                </span>
              </div>
            </div>

            {/* Line Chart Canvas */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === 'cumulative' ? (
                  <AreaChart data={historicalTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis 
                      dataKey="label" 
                      stroke="#78716c" 
                      fontSize={11} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#78716c" 
                      fontSize={11} 
                      tickLine={false}
                      unit=" MT"
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-stone-900 border border-stone-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans">
                              <span className="font-bold text-stone-100 block font-mono">{data.label}</span>
                              <div className="text-emerald-400 font-bold font-mono">
                                Cumulative Stored: {data.cumulativeMT} MT CO₂e
                              </div>
                              <div className="text-cyan-400 font-mono text-[11px]">
                                95% Confidence: [{data.confidenceLowerMT} – {data.confidenceUpperMT}] MT
                              </div>
                              <div className="text-stone-300 text-[11px]">
                                Annual Rate: {data.annualRateMTperAc} MT/ac/yr ({data.annualGrossMT} MT/yr)
                              </div>
                              <div className="text-stone-400 text-[11px] pt-1 border-t border-stone-800">
                                <strong>Milestone:</strong> {data.milestone}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 10, fontSize: '11px' }}
                      formatter={(val) => <span className="text-stone-300 font-medium">{val}</span>}
                    />
                    <ReferenceLine x="2026 (Current)" stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Current Audit Cycle', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                    <Area 
                      type="monotone" 
                      dataKey="confidenceUpperMT" 
                      stroke="transparent" 
                      fill="url(#confidenceGradient)" 
                      name="95% Confidence Range" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cumulativeMT" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fill="url(#carbonGradient)" 
                      name="Cumulative Stored Carbon (MT CO₂e)" 
                    />
                  </AreaChart>
                ) : chartMetric === 'annual' ? (
                  <LineChart data={historicalTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis dataKey="label" stroke="#78716c" fontSize={11} tickLine={false} />
                    <YAxis stroke="#78716c" fontSize={11} tickLine={false} unit=" MT" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-stone-900 border border-stone-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 font-sans">
                              <span className="font-bold text-stone-100 block font-mono">{data.label}</span>
                              <div className="text-lime-400 font-bold font-mono">
                                Annual Sequestration: {data.annualGrossMT} MT CO₂e/yr
                              </div>
                              <div className="text-stone-300 text-[11px]">
                                Rate per Acre: {data.annualRateMTperAc} MT/ac/yr
                              </div>
                              <div className="text-stone-400 text-[11px] pt-1 border-t border-stone-800">
                                {data.milestone}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: '11px' }} />
                    <ReferenceLine x="2026 (Current)" stroke="#f59e0b" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="annualGrossMT" stroke="#a3e635" strokeWidth={3} dot={{ r: 5, fill: '#a3e635' }} name="Annual Gross Sequestration (MT CO₂e/yr)" />
                  </LineChart>
                ) : chartMetric === 'soc_pct' ? (
                  <LineChart data={historicalTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis dataKey="label" stroke="#78716c" fontSize={11} tickLine={false} />
                    <YAxis stroke="#78716c" fontSize={11} tickLine={false} domain={[1.5, 3.2]} unit="%" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-stone-900 border border-stone-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 font-sans">
                              <span className="font-bold text-stone-100 block font-mono">{data.label}</span>
                              <div className="text-cyan-400 font-bold font-mono">
                                SOC Concentration: {data.socPct}%
                              </div>
                              <div className="text-stone-400 text-[11px]">
                                Baseline Delta: +{((data.socPct - baselineYearData.socPct)).toFixed(2)}% SOC
                              </div>
                              <div className="text-stone-400 text-[11px] pt-1 border-t border-stone-800">
                                {data.milestone}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: '11px' }} />
                    <ReferenceLine y={1.82} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '2020 Baseline (1.82%)', fill: '#ef4444', fontSize: 10 }} />
                    <ReferenceLine x="2026 (Current)" stroke="#f59e0b" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="socPct" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5, fill: '#06b6d4' }} name="Soil Organic Carbon (% SOC)" />
                  </LineChart>
                ) : (
                  <LineChart data={historicalTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis dataKey="label" stroke="#78716c" fontSize={11} tickLine={false} />
                    <YAxis stroke="#78716c" fontSize={11} tickLine={false} unit="%" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-stone-900 border border-stone-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 font-sans">
                              <span className="font-bold text-stone-100 block font-mono">{data.label}</span>
                              <div className="text-emerald-400 font-bold font-mono">
                                YoY Net Gain: +{data.yoyGainPct}%
                              </div>
                              <div className="text-stone-400 text-[11px] pt-1 border-t border-stone-800">
                                {data.milestone}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: '11px' }} />
                    <Line type="monotone" dataKey="yoyGainPct" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} name="Year-over-Year Gain (%)" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Practices & Sampling Event Milestone Timeline */}
          <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Annual In-Situ Sampling &amp; Practice Implementation Milestone Log
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {historicalTrendData.filter(d => !d.isProjected).map((d) => (
                <div key={d.year} className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400">{d.label}</span>
                    <span className="font-mono text-[11px] text-cyan-300 font-bold">{d.socPct}% SOC</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-snug">{d.milestone}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-800">
                    <span>Rate: {d.annualRateMTperAc} MT/ac</span>
                    <span className="text-emerald-400">+{d.cumulativeMT} MT Cumul.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: CARBON DATA LINEAGE EXPLORER */}
      {activeTab === 'lineage' && lineage && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Field Selection Bar */}
          <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-stone-400 font-semibold">Active Parcel Lineage:</span>
              <div className="flex flex-wrap gap-1.5">
                {fields.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFieldId(f.id);
                      onSelectField(f);
                    }}
                    className={`px-3 py-1 rounded-xl font-medium transition ${
                      f.id === activeFieldId
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    {f.name} ({f.acreage} ac)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">Root Hash:</span>
              <span className="font-mono text-emerald-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-[11px]">
                {lineage.lineageRootHash.slice(0, 16)}...
              </span>
            </div>
          </div>

          {/* Interactive 6-Stage Visual Chain */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lineage.nodes.map((node) => (
              <div
                key={node.id}
                className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3 relative hover:border-stone-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[10px] font-mono font-bold text-emerald-400">
                    STAGE {node.stageIndex} of 6
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {node.confidenceScorePct}% Score
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-stone-100 line-clamp-1">{node.title}</h4>
                  <p className="text-xs text-stone-400 line-clamp-2 mt-1">{node.subtitle}</p>
                </div>

                {/* Primary Metric Pill */}
                <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800/80 flex items-center justify-between text-xs">
                  <span className="text-stone-400 text-[11px]">{node.summaryMetrics.primaryLabel}</span>
                  <span className="font-mono font-bold text-emerald-400">{node.summaryMetrics.primaryValue}</span>
                </div>

                {/* Bottom Source & SHA Checksum */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span className="line-clamp-1">{node.sourceSystem.split('&')[0]}</span>
                  <span>{node.sha256Checksum.slice(0, 8)}...</span>
                </div>
              </div>
            ))}
          </div>

          {/* Verification & Compliance Summary Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-stone-950 to-stone-950 border border-emerald-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-stone-200">
                  ISO 14064-2 &amp; GHG Protocol Insetting Assurance
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-2xl">
                Every calculation step in the TerraSoil MRV engine maintains a deterministic cryptographic audit trail linking Sentinel-2 BOA satellite reflectance and farm machinery telematics to final carbon insetting credits.
              </p>
            </div>

            <button
              onClick={() => onOpenLineageModal(targetField)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
            >
              <span>Launch Deep Inspector</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC PERMISSION & GOVERNANCE MODEL */}
      {activeTab === 'permissions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Persona Role Switcher & Category Filter */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-semibold">Test Persona Governance:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['farmer', 'agronomist', 'corporate', 'auditor'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSimulatedRole(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        simulatedRole === r
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      {r === 'farmer' && 'Grower (Farmer)'}
                      {r === 'agronomist' && 'Agronomist Consultant'}
                      {r === 'corporate' && 'Corporate Scope 3 Buyer'}
                      {r === 'auditor' && 'Independent VVB Auditor'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Category:</span>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Domains ({ROLE_CAPABILITIES_MATRIX.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Governance Summary Card */}
            <div className="p-3.5 bg-stone-900/80 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Users className="w-3.5 h-3.5" />
                <span>
                  Active Role Context: {simulatedRole === 'farmer' ? 'Grower / Farm Operator' : simulatedRole === 'agronomist' ? 'Certified Crop Adviser (CCA)' : simulatedRole === 'corporate' ? 'Supply Chain Sustainability Director' : 'ISO 14065 Accredited Third-Party Verifier'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {simulatedRole === 'farmer' && 'Full write control over field boundaries, equipment telematics, and regenerative practice logs. Read-only on scientific MRV algorithm settings to prevent bias.'}
                {simulatedRole === 'agronomist' && 'Multi-client portfolio oversight, ag prescription generation, and scientific MRV calibration across client farms under CCA license.'}
                {simulatedRole === 'corporate' && 'Aggregated Scope 3 supply chain insetting ledger, SBTi FLAG reporting, and verification audit trail. Anonymized farm privacy safeguards active.'}
                {simulatedRole === 'auditor' && 'Independent verification access across raw satellite imagery, lab soil cores, and cryptographic Merkle provenance trees for ISO 14064-3 certification.'}
              </p>
            </div>
          </div>

          {/* Granular Permission Matrix Table */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-900 border-b border-stone-800 text-stone-400 font-mono uppercase text-[10px]">
                    <th className="p-3.5">Capability / Operation</th>
                    <th className="p-3.5">Domain</th>
                    <th className="p-3.5 text-center">Grower</th>
                    <th className="p-3.5 text-center">Agronomist</th>
                    <th className="p-3.5 text-center">Corporate Scope 3</th>
                    <th className="p-3.5 text-center">Independent Auditor</th>
                    <th className="p-3.5">Governing Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-sans">
                  {filteredCapabilities.map((cap) => (
                    <tr key={cap.id} className="hover:bg-stone-900/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-stone-200">{cap.label}</div>
                        <div className="text-[11px] text-stone-400 max-w-sm">{cap.description}</div>
                      </td>
                      <td className="p-3.5 text-stone-400 font-mono text-[11px]">
                        {cap.category}
                      </td>
                      <td className="p-3.5 text-center">
                        {getAccessBadge(cap.farmer)}
                      </td>
                      <td className="p-3.5 text-center">
                        {getAccessBadge(cap.agronomist)}
                      </td>
                      <td className="p-3.5 text-center">
                        {getAccessBadge(cap.corporate)}
                      </td>
                      <td className="p-3.5 text-center">
                        {getAccessBadge(cap.auditor)}
                      </td>
                      <td className="p-3.5 text-stone-400 font-mono text-[11px]">
                        {cap.governingStandard}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UNIFIED SHARED AGRONOMIC DATA MODEL SCHEMA */}
      {activeTab === 'schema' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-stone-200">
                Shared Enterprise Entity-Relationship Data Model
              </h4>
              <p className="text-xs text-stone-400">
                Unified schema powering field GIS, Sentinel-2 remote sensing, farm telematics, and verified insetting ledgers.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl font-bold">
              {SHARED_DATA_MODEL_ENTITIES.length} Core Data Entities
            </span>
          </div>

          <div className="space-y-4">
            {SHARED_DATA_MODEL_ENTITIES.map((entity) => {
              const isExpanded = expandedEntity === entity.entityName;
              return (
                <div
                  key={entity.entityName}
                  className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedEntity(isExpanded ? '' : entity.entityName)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-900/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-stone-900 text-emerald-400 border border-stone-800">
                        <Table className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-100">{entity.entityName}</span>
                          <code className="text-xs font-mono text-emerald-400 bg-stone-900 px-2 py-0.5 rounded">
                            {entity.tableName}
                          </code>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">{entity.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-stone-500 font-mono hidden sm:inline">
                        {entity.fields.length} Fields &bull; {entity.refreshFrequency}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-900/30 space-y-4 text-xs">
                      
                      {/* Foreign Keys and Data Sources */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                          <span className="font-bold text-stone-300 font-mono">Foreign Key Relations:</span>
                          <div className="text-emerald-400 font-mono">
                            {entity.foreignKeys.join(' &bull; ') || 'None (Root Entity)'}
                          </div>
                        </div>

                        <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                          <span className="font-bold text-stone-300 font-mono">Data Sources &amp; Streams:</span>
                          <div className="text-stone-300">
                            {entity.dataSources.join(' &bull; ')}
                          </div>
                        </div>
                      </div>

                      {/* Field Attributes Table */}
                      <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-stone-900 border-b border-stone-800 text-stone-400 font-mono uppercase text-[10px]">
                              <th className="p-2.5">Field Name</th>
                              <th className="p-2.5">Data Type</th>
                              <th className="p-2.5">Description</th>
                              <th className="p-2.5 text-center">Required</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800/60 font-sans">
                            {entity.fields.map((f) => (
                              <tr key={f.name} className="hover:bg-stone-900/40">
                                <td className="p-2.5 font-mono font-bold text-emerald-400">{f.name}</td>
                                <td className="p-2.5 font-mono text-cyan-400 text-[11px]">{f.type}</td>
                                <td className="p-2.5 text-stone-300">{f.description}</td>
                                <td className="p-2.5 text-center font-mono">
                                  {f.required ? (
                                    <span className="text-emerald-400 font-bold">YES</span>
                                  ) : (
                                    <span className="text-stone-500">OPT</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
