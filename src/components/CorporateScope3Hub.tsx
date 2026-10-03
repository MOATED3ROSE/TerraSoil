import React, { useState, useMemo } from 'react';
import { Farm, Field, UserPersona, EmissionFactorConfig } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  BarChart2, 
  Leaf, 
  Globe, 
  DollarSign, 
  Search, 
  Filter, 
  Sparkles, 
  Lock, 
  Clock, 
  Award, 
  Check, 
  Copy, 
  FileSpreadsheet, 
  Cpu, 
  Scale, 
  RefreshCw, 
  ChevronRight, 
  ArrowUpRight, 
  Sliders, 
  Database,
  History,
  Send,
  Eye,
  PieChart,
  Percent,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface SupplierAccount {
  id: string;
  name: string;
  contactPerson: string;
  region: string;
  commodity: 'Corn' | 'Soybeans' | 'Wheat' | 'Canola' | 'Dairy';
  purchasedVolumeTons: number;
  purchasedSpendUSD: number;
  dataQualityTier: 'Supplier-Specific (Primary)' | 'Regional Average' | 'Spend-Based (Estimated)';
  dataIntegrityScore: number; // 0 to 100
  scoreBreakdown: {
    primaryDataPct: number;
    completenessPct: number;
    recencyPct: number;
    verificationPct: number;
    methodologyDocPct: number;
  };
  emissionsIntensityKgPerKg: number;
  totalEmissionsMTCO2e: number;
  removalsMTCO2e: number;
  auditStatus: 'Assured (ISO 14064-3)' | 'Verified' | 'Pending Evidence' | 'Unverified';
  missingItems: string[];
}

interface ReductionProgram {
  id: string;
  name: string;
  practiceType: string;
  targetAcres: number;
  enrolledAcres: number;
  targetYear: number;
  participatingFarmsCount: number;
  measuredReductionMTCO2e: number;
  expectedAnnualReductionMTCO2e: number;
  corporateCoInvestmentUSD: number;
  costPerTonCO2eUSD: number;
  status: 'active' | 'scaling' | 'on_track';
}

interface CorporateScope3HubProps {
  currentFarm: Farm;
  farms: Farm[];
  onSelectFarm: (farm: Farm) => void;
  onOpenReportModal?: () => void;
  onOpenPricingModal?: () => void;
  onOpenComparisonModal?: () => void;
  onOpenLineageModal?: (field: Field) => void;
  config?: EmissionFactorConfig;
  activeSubView?: 'emissions_center' | 'supplier_portal' | 'data_scoring' | 'calc_engine' | 'methodology_versioning' | 'audit_ledger' | 'gap_analysis' | 'reduction_projects' | 'target_tracking' | 'reporting_center';
  onSubViewChange?: (view: 'emissions_center' | 'supplier_portal' | 'data_scoring' | 'calc_engine' | 'methodology_versioning' | 'audit_ledger' | 'gap_analysis' | 'reduction_projects' | 'target_tracking' | 'reporting_center') => void;
}

export const CorporateScope3Hub: React.FC<CorporateScope3HubProps> = ({
  currentFarm,
  farms,
  onSelectFarm,
  onOpenReportModal,
  onOpenPricingModal,
  onOpenComparisonModal,
  onOpenLineageModal,
  config,
  activeSubView,
  onSubViewChange,
}) => {
  // Navigation Modules matching PRD Phase 4 (All 10 Features)
  const [activeModule, setActiveModule] = useState<
    'emissions_center' | 'supplier_portal' | 'data_scoring' | 'calc_engine' | 'methodology_versioning' | 'audit_ledger' | 'gap_analysis' | 'reduction_projects' | 'target_tracking' | 'reporting_center'
  >(activeSubView || 'emissions_center');

  React.useEffect(() => {
    if (activeSubView) {
      setActiveModule(activeSubView);
    }
  }, [activeSubView]);

  const handleModuleSelect = (mod: typeof activeModule) => {
    setActiveModule(mod);
    if (onSubViewChange) {
      onSubViewChange(mod);
    }
  };

  // Filter State
  const [searchSupplier, setSearchSupplier] = useState('');
  const [filterCommodity, setFilterCommodity] = useState('all');
  const [filterQualityTier, setFilterQualityTier] = useState('all');

  // Toast feedback
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // =========================================================
  // SUPPLIER DATABASE (P0)
  // =========================================================
  const [suppliers, setSuppliers] = useState<SupplierAccount[]>([
    {
      id: 'sup-1',
      name: 'Prairie Horizon Ag Producers Cooperative',
      contactPerson: 'Sarah Jenkins, Operations Lead',
      region: 'Iowa & Illinois Grain Shed',
      commodity: 'Corn',
      purchasedVolumeTons: 145000,
      purchasedSpendUSD: 28500000,
      dataQualityTier: 'Supplier-Specific (Primary)',
      dataIntegrityScore: 92,
      scoreBreakdown: {
        primaryDataPct: 96,
        completenessPct: 94,
        recencyPct: 98,
        verificationPct: 84,
        methodologyDocPct: 88,
      },
      emissionsIntensityKgPerKg: 0.32,
      totalEmissionsMTCO2e: 46400,
      removalsMTCO2e: 18200,
      auditStatus: 'Assured (ISO 14064-3)',
      missingItems: [],
    },
    {
      id: 'sup-2',
      name: 'Rolling Hills Grain & Oilseeds LLC',
      contactPerson: 'David Miller, Supply Chain VP',
      region: 'Upper Midwest River Corridor',
      commodity: 'Soybeans',
      purchasedVolumeTons: 88000,
      purchasedSpendUSD: 19800000,
      dataQualityTier: 'Supplier-Specific (Primary)',
      dataIntegrityScore: 84,
      scoreBreakdown: {
        primaryDataPct: 88,
        completenessPct: 82,
        recencyPct: 92,
        verificationPct: 70,
        methodologyDocPct: 88,
      },
      emissionsIntensityKgPerKg: 0.38,
      totalEmissionsMTCO2e: 33440,
      removalsMTCO2e: 11400,
      auditStatus: 'Verified',
      missingItems: ['2026 Fall Fertilizer As-Applied Shapefile'],
    },
    {
      id: 'sup-3',
      name: 'Mid-South Grain Elevators Consortium',
      contactPerson: 'Robert Chen, Originator',
      region: 'Delta & Lower Mississippi Sourcing Basin',
      commodity: 'Wheat',
      purchasedVolumeTons: 62000,
      purchasedSpendUSD: 12400000,
      dataQualityTier: 'Regional Average',
      dataIntegrityScore: 61,
      scoreBreakdown: {
        primaryDataPct: 52,
        completenessPct: 65,
        recencyPct: 80,
        verificationPct: 45,
        methodologyDocPct: 63,
      },
      emissionsIntensityKgPerKg: 0.54,
      totalEmissionsMTCO2e: 33480,
      removalsMTCO2e: 3200,
      auditStatus: 'Pending Evidence',
      missingItems: ['Field-level GPS Polygon Boundaries', 'In-situ Soil Core Lab Samples'],
    },
    {
      id: 'sup-4',
      name: 'Northern Plains Specialty Grains',
      contactPerson: 'Elena Rostova, Commodity Desk',
      region: 'Red River Valley / North Dakota',
      commodity: 'Canola',
      purchasedVolumeTons: 41000,
      purchasedSpendUSD: 9800000,
      dataQualityTier: 'Spend-Based (Estimated)',
      dataIntegrityScore: 43,
      scoreBreakdown: {
        primaryDataPct: 28,
        completenessPct: 42,
        recencyPct: 70,
        verificationPct: 20,
        methodologyDocPct: 55,
      },
      emissionsIntensityKgPerKg: 0.68,
      totalEmissionsMTCO2e: 27880,
      removalsMTCO2e: 950,
      auditStatus: 'Unverified',
      missingItems: ['Producer Practice Logs', 'Fertilizer Invoices', 'Soil Organic Carbon Tests'],
    }
  ]);

  // =========================================================
  // 4.8 REDUCTION PROGRAMS STATE (P1)
  // =========================================================
  const [reductionPrograms, setReductionPrograms] = useState<ReductionProgram[]>([
    {
      id: 'prog-1',
      name: 'Corn Supply Shed Cover Crop Scaling Program',
      practiceType: 'Multi-Species Winter Cover Cropping',
      targetAcres: 50000,
      enrolledAcres: 34200,
      targetYear: 2029,
      participatingFarmsCount: 48,
      measuredReductionMTCO2e: 15732,
      expectedAnnualReductionMTCO2e: 23000,
      corporateCoInvestmentUSD: 450000,
      costPerTonCO2eUSD: 19.50,
      status: 'active',
    },
    {
      id: 'prog-2',
      name: '4R Precision Nitrogen Reduction Initiative',
      practiceType: 'Variable-Rate Nitrogen Side-Dress (-20% Synthetic N)',
      targetAcres: 40000,
      enrolledAcres: 28600,
      targetYear: 2028,
      participatingFarmsCount: 36,
      measuredReductionMTCO2e: 11440,
      expectedAnnualReductionMTCO2e: 16000,
      corporateCoInvestmentUSD: 280000,
      costPerTonCO2eUSD: 17.50,
      status: 'scaling',
    },
    {
      id: 'prog-3',
      name: 'Continuous No-Till & Residue Armor Accord',
      practiceType: 'Zero-Tillage Single-Disk Seeding',
      targetAcres: 30000,
      enrolledAcres: 24500,
      targetYear: 2027,
      participatingFarmsCount: 31,
      measuredReductionMTCO2e: 12495,
      expectedAnnualReductionMTCO2e: 15300,
      corporateCoInvestmentUSD: 195000,
      costPerTonCO2eUSD: 12.75,
      status: 'on_track',
    }
  ]);

  // =========================================================
  // 4.5 METHODOLOGY VERSION CONTROL STATE (P0)
  // =========================================================
  const [selectedMethodVersion, setSelectedMethodVersion] = useState<'v1.3' | 'v1.5' | 'v1.6_LSR'>('v1.5');
  const [showRecalculationDelta, setShowRecalculationDelta] = useState<boolean>(true);

  // =========================================================
  // 4.2 SUPPLIER DATA-COLLECTION REQUEST FORM
  // =========================================================
  const [requestSupplierId, setRequestSupplierId] = useState(suppliers[0]?.id || '');
  const [requestCategory, setRequestCategory] = useState<'fertilizer' | 'fuel' | 'tillage' | 'yield' | 'soc_test'>('fertilizer');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestDueDate, setRequestDueDate] = useState('2026-11-15');

  const handleSendSupplierRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === requestSupplierId);
    showFeedback(`Dispatched formal Scope 3 data collection request to ${sup?.name || 'Supplier'}!`);
    setRequestDescription('');
  };

  // Portfolio Aggregations
  const totalVolumePurchasedTons = suppliers.reduce((acc, s) => acc + s.purchasedVolumeTons, 0);
  const totalSpendUSD = suppliers.reduce((acc, s) => acc + s.purchasedSpendUSD, 0);
  const totalGrossEmissionsMT = suppliers.reduce((acc, s) => acc + s.totalEmissionsMTCO2e, 0);
  const totalRemovalsMT = suppliers.reduce((acc, s) => acc + s.removalsMTCO2e, 0);
  const netEmissionsMT = totalGrossEmissionsMT - totalRemovalsMT;
  const weightedEmissionsIntensity = (totalGrossEmissionsMT / totalVolumePurchasedTons).toFixed(3);

  const avgDataIntegrityScore = Math.round(
    suppliers.reduce((acc, s) => acc + s.dataIntegrityScore, 0) / suppliers.length
  );

  // Spend Coverage Percentages
  const supplierSpecificSpend = suppliers
    .filter((s) => s.dataQualityTier === 'Supplier-Specific (Primary)')
    .reduce((acc, s) => acc + s.purchasedSpendUSD, 0);
  const regionalAverageSpend = suppliers
    .filter((s) => s.dataQualityTier === 'Regional Average')
    .reduce((acc, s) => acc + s.purchasedSpendUSD, 0);
  const estimatedSpend = suppliers
    .filter((s) => s.dataQualityTier === 'Spend-Based (Estimated)')
    .reduce((acc, s) => acc + s.purchasedSpendUSD, 0);

  const supplierSpecificPct = Math.round((supplierSpecificSpend / totalSpendUSD) * 100);
  const regionalAveragePct = Math.round((regionalAverageSpend / totalSpendUSD) * 100);
  const estimatedPct = 100 - supplierSpecificPct - regionalAveragePct;

  // Filtered Suppliers List
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchQuery = s.name.toLowerCase().includes(searchSupplier.toLowerCase()) ||
        s.region.toLowerCase().includes(searchSupplier.toLowerCase());
      const matchComm = filterCommodity === 'all' || s.commodity === filterCommodity;
      const matchTier = filterQualityTier === 'all' || s.dataQualityTier.includes(filterQualityTier);
      return matchQuery && matchComm && matchTier;
    });
  }, [suppliers, searchSupplier, filterCommodity, filterQualityTier]);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-950 border border-emerald-500/80 rounded-2xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Corporate Scope 3 &bull; GHG Protocol LSR &amp; SBTi FLAG
              </span>
              <span className="text-stone-600">&bull;</span>
              <span className="text-xs text-stone-400 font-medium">Defensibility, Insetting &amp; Assurance</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
              <span>"Can I collect supplier data, calculate Scope 3 consistently, and defend the numbers?"</span>
            </h3>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          {onOpenComparisonModal && (
            <button
              onClick={onOpenComparisonModal}
              className="bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supplier Benchmarking</span>
            </button>
          )}

          <button
            onClick={() => setActiveModule('reporting_center')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export ESG Disclosures</span>
          </button>
        </div>
      </div>

      {/* Feature Navigation Tabs (All 10 Features from PRD Phase 4) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveModule('emissions_center')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'emissions_center'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>4.1 Emissions Command Center (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('supplier_portal')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'supplier_portal'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-cyan-400" />
          <span>4.2 Supplier Data Collection (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('data_scoring')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'data_scoring'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>4.3 Data-Quality Scoring (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('calc_engine')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'calc_engine'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>4.4 Calculation Engine (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('methodology_versioning')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'methodology_versioning'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <History className="w-3.5 h-3.5 text-blue-400" />
          <span>4.5 Version Control (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('audit_ledger')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'audit_ledger'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>4.6 Evidence &amp; Audit Ledger (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('gap_analysis')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'gap_analysis'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5 text-rose-400" />
          <span>4.7 Gap Analysis (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('reduction_projects')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'reduction_projects'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          <span>4.8 Reduction Projects (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('target_tracking')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'target_tracking'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 text-lime-400" />
          <span>4.9 SBTi FLAG Target (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('reporting_center')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'reporting_center'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-amber-300" />
          <span>4.10 Reporting Center (P1)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4.1 CORPORATE EMISSIONS COMMAND CENTER (P0) */}
      {/* ========================================================= */}
      {activeModule === 'emissions_center' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top-Line Scope 3 Banner Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                <span>Scope 3 Cat 1 Gross Emissions</span>
                <span className="p-1 rounded-lg bg-stone-900 text-rose-400 border border-stone-800">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-400">
                {totalGrossEmissionsMT.toLocaleString()} <span className="text-sm font-normal text-stone-400">tCO₂e</span>
              </div>
              <p className="text-xs text-stone-500">Agricultural purchased goods &amp; services</p>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                <span>Verified Land Removals (LSR)</span>
                <span className="p-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Leaf className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                -{totalRemovalsMT.toLocaleString()} <span className="text-sm font-normal text-stone-400">tCO₂e</span>
              </div>
              <p className="text-xs text-stone-500">Direct on-farm soil carbon insetting</p>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                <span>Emissions Intensity</span>
                <span className="p-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <BarChart2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400">
                {weightedEmissionsIntensity} <span className="text-sm font-normal text-stone-400">kg CO₂e/kg</span>
              </div>
              <p className="text-xs text-emerald-400">-46% vs Conventional commodity baseline</p>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                <span>Data Integrity Score</span>
                <span className="p-1 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
                {avgDataIntegrityScore} <span className="text-sm font-normal text-stone-400">/ 100</span>
              </div>
              <p className="text-xs text-stone-400">{supplierSpecificPct}% Primary Farm-Level Data</p>
            </div>

          </div>

          {/* Spend Coverage & Data Provenance Breakdown */}
          <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-800">
              <div>
                <h4 className="text-sm font-bold text-stone-100">
                  Agricultural Supply Spend Data Provenance Breakdown
                </h4>
                <p className="text-xs text-stone-400">
                  GHG Protocol Scope 3 hierarchy: Primary farm-level data vs regional secondary averages vs economic spend modeling.
                </p>
              </div>
              <span className="text-xs font-mono text-stone-400">
                Total Sourcing: ${ (totalSpendUSD / 1000000).toFixed(1) }M USD
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-stone-900 h-4 rounded-full overflow-hidden p-0.5 border border-stone-800 flex">
                <div
                  style={{ width: `${supplierSpecificPct}%` }}
                  className="bg-emerald-500 h-full rounded-l-full transition-all"
                  title={`Supplier-Specific: ${supplierSpecificPct}%`}
                />
                <div
                  style={{ width: `${regionalAveragePct}%` }}
                  className="bg-cyan-500 h-full transition-all"
                  title={`Regional Average: ${regionalAveragePct}%`}
                />
                <div
                  style={{ width: `${estimatedPct}%` }}
                  className="bg-stone-600 h-full rounded-r-full transition-all"
                  title={`Spend-Based: ${estimatedPct}%`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>{supplierSpecificPct}% Supplier-Specific (Farm Verified)</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span>{regionalAveragePct}% Regional Averages (Ecoinvent)</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <span className="w-3 h-3 rounded-full bg-stone-600" />
                  <span>{estimatedPct}% Spend-Based Estimates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sourcing Commodity Schedulers Table */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-stone-200">Sourcing Supply Shed Operations ({suppliers.length} Accounts)</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter supplier accounts..."
                  value={searchSupplier}
                  onChange={(e) => setSearchSupplier(e.target.value)}
                  className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-stone-200 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-900 text-stone-400 uppercase tracking-wider font-mono text-[10px] border-b border-stone-800">
                    <th className="p-3.5">Supplier / Cooperative</th>
                    <th className="p-3.5">Commodity</th>
                    <th className="p-3.5 text-right">Volume</th>
                    <th className="p-3.5 text-center">Data Quality Tier</th>
                    <th className="p-3.5 text-center">Integrity Score</th>
                    <th className="p-3.5 text-right">Gross GHG</th>
                    <th className="p-3.5 text-right">Removals</th>
                    <th className="p-3.5 text-right">Assurance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-sans text-stone-300">
                  {filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-stone-900/50 transition">
                      <td className="p-3.5">
                        <span className="font-bold text-stone-100 block text-xs">{sup.name}</span>
                        <span className="text-[11px] text-stone-400">{sup.region}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="bg-stone-900 border border-stone-800 px-2.5 py-1 rounded-lg text-stone-200 font-mono text-[11px]">
                          {sup.commodity}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono text-stone-200">
                        {sup.purchasedVolumeTons.toLocaleString()} t
                      </td>

                      <td className="p-3.5 text-center font-mono">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          sup.dataQualityTier.includes('Primary')
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : sup.dataQualityTier.includes('Regional')
                            ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                            : 'bg-stone-900 text-stone-400 border-stone-800'
                        }`}>
                          {sup.dataQualityTier.split(' ')[0]}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono">
                        <span className="font-bold text-amber-400">{sup.dataIntegrityScore}/100</span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                        {sup.totalEmissionsMTCO2e.toLocaleString()} t
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        -{sup.removalsMTCO2e.toLocaleString()} t
                      </td>

                      <td className="p-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          sup.auditStatus.includes('Assured')
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : sup.auditStatus.includes('Verified')
                            ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          {sup.auditStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4.3 DATA-QUALITY SCORING (P0 - CENTRAL DIFFERENTIATOR) */}
      {/* ========================================================= */}
      {activeModule === 'data_scoring' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Supplier-Level Composite Data Integrity Scoring Matrix
              </h4>
              <p className="text-xs text-stone-400">
                Replaces vague high/medium labels with transparent 5-dimension quantitative assurance scores.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl font-bold">
              Portfolio Integrity: {avgDataIntegrityScore}/100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4 relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div>
                    <h5 className="text-xs font-bold text-stone-100">{sup.name}</h5>
                    <span className="text-[11px] text-stone-400">{sup.region}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 font-mono block">Composite Score</span>
                    <span className="text-xl font-bold font-mono text-amber-400">{sup.dataIntegrityScore}/100</span>
                  </div>
                </div>

                {/* 5-Dimension Radar / Bar Indicators */}
                <div className="space-y-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-300">1. Primary Activity Data Fraction</span>
                      <span className="font-mono text-emerald-400 font-bold">{sup.scoreBreakdown.primaryDataPct}%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${sup.scoreBreakdown.primaryDataPct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-300">2. Boundary &amp; Ledger Completeness</span>
                      <span className="font-mono text-emerald-400 font-bold">{sup.scoreBreakdown.completenessPct}%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${sup.scoreBreakdown.completenessPct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-300">3. Telemetry &amp; Lab Recency</span>
                      <span className="font-mono text-emerald-400 font-bold">{sup.scoreBreakdown.recencyPct}%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${sup.scoreBreakdown.recencyPct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-300">4. Third-Party Verification &amp; Assurance</span>
                      <span className="font-mono text-cyan-400 font-bold">{sup.scoreBreakdown.verificationPct}%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${sup.scoreBreakdown.verificationPct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-300">5. Methodology &amp; Emission Factor Alignment</span>
                      <span className="font-mono text-amber-400 font-bold">{sup.scoreBreakdown.methodologyDocPct}%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${sup.scoreBreakdown.methodologyDocPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Missing Data Warning if score < 80 */}
                {sup.missingItems.length > 0 && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-900/60 rounded-xl text-[11px] text-rose-300 space-y-1">
                    <strong className="block text-rose-200">Missing for Assurance:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-rose-400">
                      {sup.missingItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4.4 CALCULATION ENGINE & TRANSPARENT AUDIT TRAIL (P0) */}
      {/* ========================================================= */}
      {activeModule === 'calc_engine' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Deterministic Scope 3 Calculation Engine Execution
                </h4>
                <p className="text-xs text-stone-400">
                  Every calculation stores full metadata parameters, GWP values, and empirical emission factor references.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-stone-900 border border-stone-800 px-3 py-1 rounded-xl">
                Engine: TerraSoil-MRV-v4.2.0-LSR
              </span>
            </div>

            {/* Formula Specification Card */}
            <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">
                Standard Land Sector Formula (GHG Protocol LSR v1.1)
              </span>
              <code className="text-xs text-stone-200 font-mono block overflow-x-auto py-1">
                Emissions = Σ [ ActivityData_i × EmissionFactor_i × (1 - MitigationFactor_i) ] + LandUseChange_Amortized
              </code>
              <code className="text-xs text-emerald-400 font-mono block overflow-x-auto py-1">
                Removals = Σ [ ΔSOC_Rate_tC_per_ha × 3.664 × EnrolledHectares × PermanenceBufferDiscount(0.875) ]
              </code>
            </div>

            {/* Parameter Storage Table */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 font-mono">GWP Assessment Report</span>
                <div className="font-bold text-stone-200">IPCC AR6 (100-yr GWP: CH₄=27.9, N₂O=273)</div>
              </div>

              <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 font-mono">Factor Source &amp; Version</span>
                <div className="font-bold text-stone-200">USDA COMET-Farm 2026 + Ecoinvent 3.10</div>
              </div>

              <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 font-mono">Geographic Granularity</span>
                <div className="font-bold text-emerald-400">County-Level Soil Taxonomy (NRCS SSURGO)</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4.5 METHODOLOGY VERSION CONTROL (P0) */}
      {/* ========================================================= */}
      {activeModule === 'methodology_versioning' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" />
                  Inventory Methodology Version Control &amp; Recalculation Engine
                </h4>
                <p className="text-xs text-stone-400">
                  Historical inventory baselines remain immutable while allowing forward simulations against updated standards.
                </p>
              </div>

              {/* Version Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-mono">Methodology:</span>
                <select
                  value={selectedMethodVersion}
                  onChange={(e) => setSelectedMethodVersion(e.target.value as any)}
                  className="bg-stone-900 border border-stone-700 text-emerald-400 font-mono font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                >
                  <option value="v1.3">2024 Baseline (Method v1.3 - IPCC 2006)</option>
                  <option value="v1.5">2025–2026 Active (Method v1.5 - COMET / AR6)</option>
                  <option value="v1.6_LSR">2027 Forward (Method v1.6 - GHG Protocol LSR Standard)</option>
                </select>
              </div>
            </div>

            {/* Version Delta Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[10px] text-stone-400 font-mono uppercase block">2024 Base Year Inventory</span>
                <div className="text-xl font-bold font-mono text-stone-200">148,200 tCO₂e</div>
                <p className="text-[11px] text-stone-400">Calculated under Method v1.3 (Locked Historical Base)</p>
              </div>

              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[10px] text-stone-400 font-mono uppercase block">Current Active Inventory</span>
                <div className="text-xl font-bold font-mono text-emerald-400">{totalGrossEmissionsMT.toLocaleString()} tCO₂e</div>
                <p className="text-[11px] text-stone-400">Calculated under Method v1.5 (-5.8% methodology delta)</p>
              </div>

              <div className="p-4 bg-stone-900 rounded-xl border border-emerald-800/80 space-y-2 bg-emerald-950/20">
                <span className="text-[10px] text-emerald-400 font-mono uppercase block">LSR 2027 Projected Impact</span>
                <div className="text-xl font-bold font-mono text-emerald-300">
                  {Math.round(totalGrossEmissionsMT * 0.94).toLocaleString()} tCO₂e
                </div>
                <p className="text-[11px] text-stone-400">Enforces explicit land removal separation and soil depth caps</p>
              </div>
            </div>

            <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 text-xs text-stone-400">
              <strong>Assurance Guarantee:</strong> Recalculation deltas are simulated side-by-side and will not overwrite the signed 2024/2025 base-year figures in the permanent ledger.
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4.6 EVIDENCE & AUDIT LEDGER (P0) */}
      {/* ========================================================= */}
      {activeModule === 'audit_ledger' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Corporate Scope 3 Traceability &amp; Lineage Audit Trail
                </h4>
                <p className="text-xs text-stone-400">
                  Trace any corporate Scope 3 claim down to individual field parcels, machinery logs, and laboratory tests.
                </p>
              </div>

              <button
                onClick={() => {
                  if (onOpenLineageModal && currentFarm.fields.length > 0) {
                    onOpenLineageModal(currentFarm.fields[0]);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Open Interactive Lineage DAG</span>
              </button>
            </div>

            {/* Traceability Flow Steps */}
            <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-3 text-xs">
              <div className="text-[10px] font-mono uppercase font-bold text-stone-400">
                End-to-End Audit Trail Hierarchy:
              </div>
              
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span className="p-2 rounded-lg bg-stone-950 text-stone-200 border border-stone-800">
                  1. Corporate Scope 3 Cat 1 Inventory ({totalGrossEmissionsMT.toLocaleString()} t)
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
                <span className="p-2 rounded-lg bg-stone-950 text-emerald-400 border border-stone-800">
                  2. Supplier Cooperative (Prairie Horizon)
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
                <span className="p-2 rounded-lg bg-stone-950 text-cyan-400 border border-stone-800">
                  3. Farm Entity ({currentFarm.name})
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
                <span className="p-2 rounded-lg bg-stone-950 text-amber-300 border border-stone-800">
                  4. Field Parcel ({currentFarm.fields[0]?.name || 'North 80'})
                </span>
                <ChevronRight className="w-4 h-4 text-stone-500" />
                <span className="p-2 rounded-lg bg-stone-950 text-purple-400 border border-stone-800 font-bold">
                  5. SHA-256 Merkle Seal (0x3a9f91bc...)
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4.7 SUPPLIER GAP ANALYSIS (P1) */}
      {/* ========================================================= */}
      {activeModule === 'gap_analysis' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-5">
            <div className="pb-3 border-b border-stone-800">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-rose-400" />
                Pareto Spend &amp; Emissions Gap Analysis
              </h4>
              <p className="text-xs text-stone-400">
                Identifies highest-priority suppliers where missing primary data introduces the greatest inventory uncertainty.
              </p>
            </div>

            {/* Spotlight Callout Card */}
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-800/80 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Primary Data Collection Priority Recommendation</span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                <strong>2 Key Suppliers</strong> (Mid-South Grain &amp; Northern Plains) account for <strong>43% of total agricultural emissions</strong> but only have <strong>Regional Average / Spend-Based data</strong>. Transitioning these 2 accounts to primary farm-level data will increase your total corporate Data Integrity Score from <strong>87% to 96%</strong>.
              </p>
            </div>

            {/* Prioritized Supplier Action Queue */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-stone-200">Prioritized Engagement Queue:</div>
              {suppliers.filter(s => s.dataIntegrityScore < 80).map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-stone-900 border border-stone-800 rounded-xl flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-100">{s.name}</span>
                      <span className="px-2 py-0.5 rounded bg-stone-950 text-rose-400 font-mono text-[10px] border border-stone-800">
                        High Priority Gap
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      Missing: {s.missingItems.join(', ')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setRequestSupplierId(s.id);
                      setActiveModule('supplier_portal');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Data Request</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4.8 REDUCTION-PROJECT TRACKING (P1) */}
      {/* ========================================================= */}
      {activeModule === 'reduction_projects' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-stone-100">
                Supply Chain Insetting &amp; Agricultural Decarbonization Programs
              </h4>
              <p className="text-xs text-stone-400">
                Track co-investment programs, enrolled acreage, farmer adoption, and measured CO₂e abatement.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl font-bold">
              {reductionPrograms.length} Active Co-Investment Programs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reductionPrograms.map((prog) => (
              <div
                key={prog.id}
                className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800">
                      TARGET YEAR: {prog.targetYear}
                    </span>
                    <span className="text-xs font-bold font-mono text-stone-400">
                      {prog.participatingFarmsCount} Farms Enrolled
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-stone-100">{prog.name}</h5>
                  <p className="text-xs text-stone-400">{prog.practiceType}</p>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-300">Acreage Adoption:</span>
                      <span className="text-emerald-400 font-bold">
                        {prog.enrolledAcres.toLocaleString()} / {prog.targetAcres.toLocaleString()} ac ({Math.round(prog.enrolledAcres / prog.targetAcres * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.round(prog.enrolledAcres / prog.targetAcres * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 bg-stone-900 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 font-mono block">Measured Abatement</span>
                      <span className="font-bold font-mono text-emerald-400">-{prog.measuredReductionMTCO2e.toLocaleString()} t</span>
                    </div>
                    <div className="p-2 bg-stone-900 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 font-mono block">Cost / tCO₂e</span>
                      <span className="font-bold font-mono text-amber-300">${prog.costPerTonCO2eUSD} / t</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                  <span>Co-Investment:</span>
                  <span className="font-mono text-stone-200 font-bold">${prog.corporateCoInvestmentUSD.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4.9 TARGET TRACKING & SBTI FLAG COMPLIANCE (P1) */}
      {/* ========================================================= */}
      {activeModule === 'target_tracking' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-lime-400" />
                  Science Based Targets initiative (SBTi) FLAG Decarbonization Trajectory
                </h4>
                <p className="text-xs text-stone-400">
                  Separates land emissions reductions from biogenic carbon removals according to SBTi FLAG Standard v1.1.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-stone-900 border border-stone-800 px-3 py-1 rounded-xl">
                2030 Target: -36% FLAG Emissions
              </span>
            </div>

            {/* FLAG Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-300">FLAG Milestone Achievement:</span>
                <span className="text-emerald-400 font-bold">68% of 2030 Target Achieved</span>
              </div>
              <div className="w-full bg-stone-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
                <div
                  className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: '68%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>2023 Baseline (0%)</span>
                <span>Current FY2026 (68%)</span>
                <span>2030 Commitment Target (100%)</span>
              </div>
            </div>

            {/* Dual Accounting Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-rose-400 font-mono block">
                  1. Land Emissions Abatement (Gross)
                </span>
                <div className="text-xl font-bold font-mono text-stone-100">-28,400 tCO₂e / yr</div>
                <p className="text-stone-400 text-[11px]">
                  Achieved through synthetic fertilizer optimization (-20% N), diesel savings, and deforestation-free grain sourcing.
                </p>
              </div>

              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono block">
                  2. Land Removals &amp; Sequestration (Insetting)
                </span>
                <div className="text-xl font-bold font-mono text-emerald-400">+18,200 tCO₂e / yr</div>
                <p className="text-stone-400 text-[11px]">
                  Achieved through continuous no-till root biomass and high-residue winter cover crop humic carbon accretion.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4.10 REPORTING CENTER (P1) */}
      {/* ========================================================= */}
      {activeModule === 'reporting_center' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" />
                  Corporate Scope 3 Compliance Export Center
                </h4>
                <p className="text-xs text-stone-400">
                  Generate audit-ready packages for CDP Climate Change, SEC Climate Disclosures, and accredited assurance bodies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono block">GHG Protocol LSR v1.1</span>
                  <h5 className="font-bold text-stone-100 text-sm mt-1">Land Sector &amp; Removals Annual Disclosure</h5>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Complete inventory with separate gross land emissions and biogenic removal ledgers.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const lsrPackage = {
                      standard: 'GHG_PROTOCOL_LSR_V1.1',
                      reportingYear: 2026,
                      totalPurchasedTons: totalVolumePurchasedTons,
                      grossEmissionsMT: totalGrossEmissionsMT,
                      landRemovalsMT: totalRemovalsMT,
                      netEmissionsMT: netEmissionsMT,
                      supplierCount: suppliers.length,
                      dataIntegrityScore: avgDataIntegrityScore,
                      suppliers: suppliers.map(s => ({
                        name: s.name,
                        commodity: s.commodity,
                        volume: s.purchasedVolumeTons,
                        emissions: s.totalEmissionsMTCO2e,
                        removals: s.removalsMTCO2e,
                        qualityTier: s.dataQualityTier
                      }))
                    };
                    const blob = new Blob([JSON.stringify(lsrPackage, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `GHG_Protocol_LSR_Disclosure_2026.json`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    showFeedback('Exported GHG Protocol LSR v1.1 JSON-LD Disclosure Package!');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download LSR JSON-LD</span>
                </button>
              </div>

              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono block">CDP Questionnaire</span>
                  <h5 className="font-bold text-stone-100 text-sm mt-1">CDP Climate Change C6.5 &amp; C-AC0.6 Module</h5>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Pre-formatted table outputs for agricultural supplier-specific activity data and emission factors.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onOpenReportModal) onOpenReportModal();
                    else showFeedback('Exported CDP C6.5 Module Package!');
                  }}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition border border-stone-700"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate CDP Export</span>
                </button>
              </div>

              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 font-mono block">Third-Party Assurance</span>
                  <h5 className="font-bold text-stone-100 text-sm mt-1">ISO 14064-3 Verifier Evidence Package</h5>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Full Merkle hash trees, laboratory LECO tests, and satellite NDVI calibration records for audit firms.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onOpenLineageModal && currentFarm.fields.length > 0) {
                      onOpenLineageModal(currentFarm.fields[0]);
                    }
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Audit Chain Package</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4.2 SUPPLIER DATA-COLLECTION PORTAL (P0) */}
      {/* ========================================================= */}
      {activeModule === 'supplier_portal' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Data Request Dispatch Form */}
            <form onSubmit={handleSendSupplierRequest} className="lg:col-span-5 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="font-bold text-stone-200 flex items-center gap-2">
                  <Send className="w-4 h-4 text-cyan-400" />
                  Dispatch Structured Supplier Request
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Permission-Controlled</span>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Target Supplier Account:</label>
                <select
                  value={requestSupplierId}
                  onChange={(e) => setRequestSupplierId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={`sup-req-${s.id}`} value={s.id}>
                      {s.name} ({s.commodity} &bull; {s.region})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Required Sourcing Data Category:</label>
                <select
                  value={requestCategory}
                  onChange={(e) => setRequestCategory(e.target.value as any)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none"
                >
                  <option value="fertilizer">Synthetic &amp; Organic Nitrogen Rates (lbs N/ac)</option>
                  <option value="fuel">Diesel &amp; Machinery Fuel Telemetry</option>
                  <option value="tillage">Tillage Implement &amp; Residue Management Logs</option>
                  <option value="yield">Grain Harvest Yield &amp; Moisture Receipts</option>
                  <option value="soc_test">0–30 cm In-situ Soil Organic Carbon Lab Sheets</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Specific Compliance Instructions:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please upload 2026 variable-rate side-dress shapefiles and Albert Lea seed lot receipts for Scope 3 Cat 1 verification."
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none placeholder-stone-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Assurance Filing Due Date:</label>
                <input
                  type="date"
                  value={requestDueDate}
                  onChange={(e) => setRequestDueDate(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Formal Data Request</span>
              </button>
            </form>

            {/* Right: Supplier Portal Permissions & Privacy Shield */}
            <div className="lg:col-span-7 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="font-bold text-stone-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Supplier Privacy Shield &amp; Data Authorization Boundaries
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Ag Data Transparent Compliant</span>
              </div>

              <p className="text-stone-300 leading-relaxed">
                Under the PRD-01 RBAC Governance model, supplier farms maintain complete ownership over confidential yield pricing and individual parcel finance data. Corporate buyers receive aggregated, cryptographically verified Scope 3 emission intensity and removal metrics without exposing proprietary farm accounts.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">AUTHORIZED ACCESS</span>
                  <ul className="text-[11px] text-stone-300 space-y-1 list-disc list-inside">
                    <li>GHG Emissions Intensity (kg CO₂e/kg)</li>
                    <li>Verified Regenerative Practice Acreage</li>
                    <li>SBTi FLAG Insetting Removals</li>
                    <li>ISO 14064-2 Cryptographic Hashes</li>
                  </ul>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                  <span className="text-[10px] text-rose-400 font-bold font-mono">RESTRICTED &amp; ISOLATED</span>
                  <ul className="text-[11px] text-stone-400 space-y-1 list-disc list-inside">
                    <li>Individual Farm Financial Net Margins</li>
                    <li>Confidential Seed Supplier Pricing</li>
                    <li>Grower Personal Banking Credentials</li>
                    <li>Unenrolled Private Acreage Boundaries</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
