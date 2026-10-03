import React, { useState, useMemo } from 'react';
import { Farm, Field, UserPersona, PracticeRecord, EmissionFactorConfig } from '../types';
import { 
  Users, 
  Building2, 
  Map, 
  Layers, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  Sparkles, 
  Sliders, 
  ChevronRight, 
  Lock, 
  Check, 
  Copy, 
  Printer, 
  Award, 
  ShieldCheck, 
  Plus, 
  RefreshCw, 
  Send, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  FileCheck, 
  Eye, 
  Scale, 
  HelpCircle, 
  CheckCircle,
  Database,
  Calendar,
  Globe2,
  DollarSign
} from 'lucide-react';

interface ClientDataRequest {
  id: string;
  farmId: string;
  farmName: string;
  requestedItem: string;
  category: 'receipt' | 'soil_test' | 'machinery_log' | 'planting_date';
  deadlineDate: string;
  status: 'pending' | 'in_progress' | 'completed_verified';
  requestedAt: string;
  growerNotes?: string;
  attachedEvidence?: string;
}

interface AgronomicPrescription {
  id: string;
  farmId: string;
  farmName: string;
  fieldId: string;
  fieldName: string;
  title: string;
  reasoning: string;
  proposedAction: string;
  expectedCarbonDeltaMT: number;
  expectedCostImpactUSD: number;
  assumptions: string;
  followUpDate: string;
  ccaLicense: string;
  consultantFirm: string;
  approvalStatus: 'entered' | 'reviewed' | 'approved' | 'locked';
  issuedAt: string;
}

interface AgronomistConsultantHubProps {
  currentFarm: Farm;
  farms: Farm[];
  onSelectFarm: (farm: Farm) => void;
  onOpenReportModal?: () => void;
  onOpenPricingModal?: () => void;
  onOpenComparisonModal?: () => void;
  onOpenLineageModal?: (field: Field) => void;
  config?: EmissionFactorConfig;
}

export const AgronomistConsultantHub: React.FC<AgronomistConsultantHubProps> = ({
  currentFarm,
  farms,
  onSelectFarm,
  onOpenReportModal,
  onOpenPricingModal,
  onOpenComparisonModal,
  onOpenLineageModal,
  config,
}) => {
  // Navigation Tabs matching PRD Phase 3
  const [activeModule, setActiveModule] = useState<
    'command_center' | 'scenario_planner' | 'recommendations' | 'branded_dossier' | 'client_workspace' | 'approval_workflow' | 'knowledge_library'
  >('command_center');

  // Command Center Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterQuality, setFilterQuality] = useState('all');

  // Feedback toast
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // =========================================================
  // 3.5 BRANDED PDF DOSSIER CUSTOMIZER STATE
  // =========================================================
  const [firmName, setFirmName] = useState('Midwest Agronomic Consulting Services LLC');
  const [ccaLicense, setCcaLicense] = useState('CCA-94821-MW');
  const [consultantName, setConsultantName] = useState('Dr. Marcus Vance, CCA-NRCS TSP');
  const [consultantEmail, setConsultantEmail] = useState('m.vance@midwestagronomy.com');
  const [brandColor, setBrandColor] = useState<'emerald' | 'cyan' | 'amber' | 'purple'>('emerald');
  const [includeCoverDisclaimer, setIncludeCoverDisclaimer] = useState(true);
  const [selectedTargetFarmId, setSelectedTargetFarmId] = useState<string>(currentFarm.id);

  const targetDossierFarm = farms.find((f) => f.id === selectedTargetFarmId) || currentFarm;

  // =========================================================
  // 3.6 CLIENT WORKSPACE & DATA REQUESTS STATE
  // =========================================================
  const [dataRequests, setDataRequests] = useState<ClientDataRequest[]>([
    {
      id: 'req-1',
      farmId: farms[0]?.id || 'farm-1',
      farmName: farms[0]?.name || 'Prairie Horizon Regenerative Farm',
      requestedItem: '2026 Fall Fertilizer Purchase Invoices & Variable-Rate Shapefiles',
      category: 'receipt',
      deadlineDate: '2026-10-15',
      status: 'completed_verified',
      requestedAt: '2026-09-20',
      growerNotes: 'Uploaded John Deere Operations Center as-applied shapefile and Albert Lea invoice.',
      attachedEvidence: 'AlbertLeaSeed_Lot9481.pdf',
    },
    {
      id: 'req-2',
      farmId: farms[1]?.id || farms[0]?.id || 'farm-2',
      farmName: farms[1]?.name || 'Rolling Hills Agronomy Client',
      requestedItem: '0–30 cm Deep Soil Core Dry Combustion Carbon Analysis',
      category: 'soil_test',
      deadlineDate: '2026-10-30',
      status: 'in_progress',
      requestedAt: '2026-09-28',
      growerNotes: 'Samples dispatched to Midwest Ag Labs on Monday.',
    },
    {
      id: 'req-3',
      farmId: farms[0]?.id || 'farm-1',
      farmName: farms[0]?.name || 'Prairie Horizon Regenerative Farm',
      requestedItem: 'Cover Crop High-Residue Drill Planting Date & Seeding Rate',
      category: 'planting_date',
      deadlineDate: '2026-10-05',
      status: 'pending',
      requestedAt: '2026-10-01',
    }
  ]);

  // Request Form
  const [newReqFarmId, setNewReqFarmId] = useState(farms[0]?.id || '');
  const [newReqItem, setNewReqItem] = useState('');
  const [newReqCategory, setNewReqCategory] = useState<'receipt' | 'soil_test' | 'machinery_log' | 'planting_date'>('receipt');
  const [newReqDeadline, setNewReqDeadline] = useState('2026-11-01');

  const handleCreateDataRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqItem.trim()) return;

    const targetF = farms.find((f) => f.id === newReqFarmId) || farms[0];
    const newReq: ClientDataRequest = {
      id: `req-${Date.now()}`,
      farmId: targetF.id,
      farmName: targetF.name,
      requestedItem: newReqItem,
      category: newReqCategory,
      deadlineDate: newReqDeadline,
      status: 'pending',
      requestedAt: new Date().toISOString().slice(0, 10),
    };

    setDataRequests([newReq, ...dataRequests]);
    setNewReqItem('');
    showFeedback(`Dispatched evidence request to ${targetF.name}!`);
  };

  // =========================================================
  // 3.4 PROFESSIONAL RECOMMENDATIONS & PRESCRIPTION BUILDER
  // =========================================================
  const [prescriptions, setPrescriptions] = useState<AgronomicPrescription[]>([
    {
      id: 'rx-1',
      farmId: farms[0]?.id || 'farm-1',
      farmName: farms[0]?.name || 'Prairie Horizon Regenerative Farm',
      fieldId: farms[0]?.fields[0]?.id || 'f-1',
      fieldName: farms[0]?.fields[0]?.name || 'North 80 Prairie Loam',
      title: 'Reduce Nitrogen Application via V6 Split-Apply Side-Dress (-25 lbs N/ac)',
      reasoning: 'Pre-sidedress soil nitrate tests (PSNT) indicate high mineralizable nitrogen pool from 3 years of continuous cover cropping.',
      proposedAction: 'Adjust V6 side-dress rate from 160 lbs N to 135 lbs N/acre using optical crop sensor calibration.',
      expectedCarbonDeltaMT: 28.5,
      expectedCostImpactUSD: 2150,
      assumptions: 'Assumes $0.65/lb N fertilizer cost; zero grain yield penalty based on Iowa State trial data.',
      followUpDate: '2026-11-15',
      ccaLicense: 'CCA-94821-MW',
      consultantFirm: 'Midwest Agronomic Consulting Services LLC',
      approvalStatus: 'approved',
      issuedAt: '2026-09-24',
    },
    {
      id: 'rx-2',
      farmId: farms[0]?.id || 'farm-1',
      farmName: farms[0]?.name || 'Prairie Horizon Regenerative Farm',
      fieldId: farms[0]?.fields[1]?.id || 'f-2',
      fieldName: farms[0]?.fields[1]?.name || 'South Creek Bottomland',
      title: 'High-Biomass Winter Cereal Rye + Crimson Clover Inter-Seeding',
      reasoning: 'Slope position creates sheet erosion vulnerability during April spring melt.',
      proposedAction: 'Broadcast seed 55 lbs rye + 8 lbs clover at V6 corn stage prior to canopy closure.',
      expectedCarbonDeltaMT: 42.0,
      expectedCostImpactUSD: -3200,
      assumptions: 'Generates +$54/ac USDA EQIP Practice 340 cost-share reimbursement.',
      followUpDate: '2026-10-20',
      ccaLicense: 'CCA-94821-MW',
      consultantFirm: 'Midwest Agronomic Consulting Services LLC',
      approvalStatus: 'reviewed',
      issuedAt: '2026-09-28',
    }
  ]);

  // New Rx State
  const [rxFarmId, setRxFarmId] = useState(farms[0]?.id || '');
  const [rxFieldId, setRxFieldId] = useState(farms[0]?.fields[0]?.id || '');
  const [rxTitle, setRxTitle] = useState('');
  const [rxReasoning, setRxReasoning] = useState('');
  const [rxAction, setRxAction] = useState('');
  const [rxCarbonDelta, setRxCarbonDelta] = useState(35);
  const [rxCostImpact, setRxCostImpact] = useState(1800);

  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxTitle.trim()) return;

    const targetF = farms.find((f) => f.id === rxFarmId) || farms[0];
    const targetFld = targetF.fields.find((f) => f.id === rxFieldId) || targetF.fields[0];

    const newRx: AgronomicPrescription = {
      id: `rx-${Date.now()}`,
      farmId: targetF.id,
      farmName: targetF.name,
      fieldId: targetFld.id,
      fieldName: targetFld.name,
      title: rxTitle,
      reasoning: rxReasoning || 'Identified via multi-spectral Sentinel-2 NDVI time-series analysis and soil fertility lab baseline.',
      proposedAction: rxAction || 'Implement specified practice adjustment during next seasonal management pass.',
      expectedCarbonDeltaMT: rxCarbonDelta,
      expectedCostImpactUSD: rxCostImpact,
      assumptions: 'Calculated using USDA COMET-Farm empirical factors and local fertilizer retail prices.',
      followUpDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      ccaLicense: ccaLicense,
      consultantFirm: firmName,
      approvalStatus: 'entered',
      issuedAt: new Date().toISOString().slice(0, 10),
    };

    setPrescriptions([newRx, ...prescriptions]);
    setRxTitle('');
    setRxReasoning('');
    setRxAction('');
    showFeedback(`Generated CCA Prescription #${newRx.id.toUpperCase()} for ${targetF.name}!`);
  };

  // =========================================================
  // 3.3 SCENARIO PLANNER STATE & DATA
  // =========================================================
  const [scenarioStep, setScenarioStep] = useState<number>(3); // 1 to 5 steps
  const SCENARIO_STAGES = [
    {
      step: 1,
      title: 'Current Conventional Baseline',
      practices: 'Moldboard plowing, 180 lbs N synthetic broadcast, zero cover crops',
      carbonStockStockTCPerHa: 52.0,
      annualCO2eMT: 0,
      yieldBuPerAc: 178.0,
      inputCostPerAc: 154.00,
      netAnnualFarmReturnUSD: 0,
      difficulty: 'Baseline',
    },
    {
      step: 2,
      title: 'Phase 1: Strip-Till / Reduced Tillage',
      practices: 'Strip-till in row zones only, 100% residue preservation in inter-row',
      carbonStockStockTCPerHa: 53.2,
      annualCO2eMT: Math.round(targetDossierFarm.totalAcreage * 0.35),
      yieldBuPerAc: 180.5,
      inputCostPerAc: 139.50,
      netAnnualFarmReturnUSD: Math.round(targetDossierFarm.totalAcreage * 22.50),
      difficulty: 'Low',
    },
    {
      step: 3,
      title: 'Phase 2: Add Multi-Species Winter Cover Crops',
      practices: 'Cereal rye + hairy vetch air-drilled at V6 canopy closure',
      carbonStockStockTCPerHa: 55.4,
      annualCO2eMT: Math.round(targetDossierFarm.totalAcreage * 0.78),
      yieldBuPerAc: 185.0,
      inputCostPerAc: 128.00,
      netAnnualFarmReturnUSD: Math.round(targetDossierFarm.totalAcreage * 48.20),
      difficulty: 'Medium',
    },
    {
      step: 4,
      title: 'Phase 3: Precision 4R Variable-Rate Nitrogen (-25%)',
      practices: 'Side-dress split application with optical sensor calibration & nitrification inhibitor',
      carbonStockStockTCPerHa: 57.1,
      annualCO2eMT: Math.round(targetDossierFarm.totalAcreage * 1.05),
      yieldBuPerAc: 186.2,
      inputCostPerAc: 112.50,
      netAnnualFarmReturnUSD: Math.round(targetDossierFarm.totalAcreage * 68.40),
      difficulty: 'Medium-High',
    },
    {
      step: 5,
      title: 'Phase 4: Full Regenerative Stack + Biochar Amendment',
      practices: 'Continuous no-till + roller crimper termination + 3 t/ac pyrolyzed biochar deposition',
      carbonStockStockTCPerHa: 63.8,
      annualCO2eMT: Math.round(targetDossierFarm.totalAcreage * 1.95),
      yieldBuPerAc: 194.0,
      inputCostPerAc: 104.00,
      netAnnualFarmReturnUSD: Math.round(targetDossierFarm.totalAcreage * 114.00),
      difficulty: 'Advanced',
    }
  ];

  const activeScenario = SCENARIO_STAGES[scenarioStep - 1];

  // =========================================================
  // 3.8 CONSULTANT KNOWLEDGE LIBRARY TEMPLATES
  // =========================================================
  const KNOWLEDGE_TEMPLATES = [
    {
      id: 'tpl-1',
      title: 'USDA NRCS Practice Standard 340 (Cover Crop) Compliance Spec',
      category: 'Regulatory Specification',
      description: 'Standardized seed blend formulas, minimum biomass targets (1,500 lbs DM/ac), and roller-crimper mechanical termination guidelines for Midwest USDA EQIP approvals.',
      tags: ['USDA EQIP', 'Practice 340', 'Cover Crop'],
    },
    {
      id: 'tpl-2',
      title: '0–30 cm & 30–60 cm Stratified Soil Core Sampling Protocol (ISO 10694)',
      category: 'Sampling Protocol',
      description: 'Step-by-step field grid sampling protocol with LECO dry combustion LECO elemental analyzer chain-of-custody, bulk density core rings, and GPS geotagging rules.',
      tags: ['ISO 10694', 'Soil Sampling', 'LECO Carbon'],
    },
    {
      id: 'tpl-3',
      title: 'Scope 3 Category 1 Agricultural Insetting Agronomic Attestation Letter',
      category: 'Client Document',
      description: 'Certified Crop Adviser formal verification letter certifying additionality, baseline years, and greenhouse gas abatement factors for corporate supply chain audit committees.',
      tags: ['GHG Protocol', 'Scope 3', 'Attestation'],
    },
    {
      id: 'tpl-4',
      title: 'Variable-Rate Nitrogen Side-Dress Prescription Matrix',
      category: 'Agronomic Formula',
      description: 'Nitrogen reduction response curve balancing soil organic matter mineralization credit (20 lbs N per 1% SOM) against high-yield grain targets.',
      tags: ['4R Nitrogen', 'PSNT', 'VRT Formula'],
    }
  ];

  // Filtered Client Farms for Command Center
  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.region.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = filterRegion === 'all' || f.region.includes(filterRegion);
      const matchesQuality = filterQuality === 'all' || (
        filterQuality === 'ready' ? f.auditStatus === 'Audit-Ready' :
        filterQuality === 'review' ? f.auditStatus === 'Under Review' : true
      );

      return matchesSearch && matchesRegion && matchesQuality;
    });
  }, [farms, searchQuery, filterRegion, filterQuality]);

  // Aggregated Portfolio Metrics
  const totalPortfolioAcres = farms.reduce((acc, f) => acc + f.totalAcreage, 0);
  const totalClientFarms = farms.length;
  const readyForAuditCount = farms.filter((f) => f.auditStatus === 'Audit-Ready').length;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      
      {/* Toast Feedback */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950 border border-emerald-500/80 rounded-2xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Agronomist &amp; Consultant Suite &bull; Phase 3 PRD
              </span>
              <span className="text-stone-600">&bull;</span>
              <span className="text-xs text-stone-400 font-medium">Practice-Management Platform</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
              <span>"How do I manage 20, 50, or 500 farms efficiently and produce professional reports?"</span>
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
              <span>Cross-Farm Benchmarking</span>
            </button>
          )}

          <button
            onClick={() => setActiveModule('branded_dossier')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Generate Branded Dossier</span>
          </button>
        </div>
      </div>

      {/* Feature Navigation Tabs (All 8 PRD Modules) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveModule('command_center')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'command_center'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3.1 Multi-Farm Command Center (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('branded_dossier')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'branded_dossier'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>3.5 Branded PDF Dossier (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('scenario_planner')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'scenario_planner'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>3.3 Scenario Planner (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('recommendations')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'recommendations'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>3.4 CCA Recommendations (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('client_workspace')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'client_workspace'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-emerald-400" />
          <span>3.6 Client Workspace Bridge (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('approval_workflow')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'approval_workflow'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>3.7 Review / Approval Pipeline (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('knowledge_library')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'knowledge_library'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-300" />
          <span>3.8 Knowledge Library (P2)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3.1 MULTI-FARM COMMAND CENTER (P0) */}
      {/* ========================================================= */}
      {activeModule === 'command_center' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Portfolio Metric High-Level Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Total Client Acreage</span>
              <div className="text-2xl font-bold font-mono text-stone-100">{totalPortfolioAcres.toLocaleString()} ac</div>
              <span className="text-xs text-stone-500">Across {totalClientFarms} operational farm entities</span>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono">Audit-Ready Clients</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{readyForAuditCount} of {totalClientFarms}</div>
              <span className="text-xs text-stone-500">Passed ISO 14064-2 &amp; GHG Protocol review</span>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">Avg SOC Accretion</span>
              <div className="text-2xl font-bold font-mono text-cyan-400">+0.48% / 5yr</div>
              <span className="text-xs text-stone-500">+1.12 MT CO₂e/ac/yr weighted avg</span>
            </div>

            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">Pending Evidence Requests</span>
              <div className="text-2xl font-bold font-mono text-amber-400">{dataRequests.filter(r => r.status !== 'completed_verified').length} Open</div>
              <span className="text-xs text-stone-500">Awaiting grower journal response</span>
            </div>
          </div>

          {/* Search & Filtering Controls */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter client farms by name, grower, or county..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={filterQuality}
                onChange={(e) => setFilterQuality(e.target.value)}
                className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none"
              >
                <option value="all">All Data Quality Tiers</option>
                <option value="ready">Ready for Report (Audit-Ready)</option>
                <option value="review">Under Review / Missing Data</option>
              </select>
            </div>

            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Batch Export All Dossiers</span>
            </button>
          </div>

          {/* Multi-Farm Command Center Portfolio Table */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-900 text-stone-400 uppercase tracking-wider font-mono text-[10px] border-b border-stone-800">
                    <th className="p-3.5">Client Farm</th>
                    <th className="p-3.5">Lead Producer</th>
                    <th className="p-3.5 text-right">Managed Acres</th>
                    <th className="p-3.5 text-center">Soil C Trend</th>
                    <th className="p-3.5 text-center">GHG Trend</th>
                    <th className="p-3.5">Data Quality / Status</th>
                    <th className="p-3.5 text-right">Practice Management Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-sans text-stone-300">
                  {filteredFarms.map((farm) => {
                    const isSelected = farm.id === currentFarm.id;
                    return (
                      <tr key={farm.id} className={`hover:bg-stone-900/50 transition ${isSelected ? 'bg-emerald-950/20' : ''}`}>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                            <div>
                              <span className="font-bold text-stone-100 block text-xs">{farm.name}</span>
                              <span className="text-[11px] text-stone-400">{farm.region}, {farm.stateOrCountry}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-stone-300 font-medium">
                          {farm.ownerName}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-stone-200">
                          {farm.totalAcreage.toLocaleString()} ac
                        </td>

                        <td className="p-3.5 text-center font-mono">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[11px]">
                            <TrendingUp className="w-3 h-3" />
                            <span>&uarr; +8.2%</span>
                          </span>
                        </td>

                        <td className="p-3.5 text-center font-mono">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[11px]">
                            <TrendingDown className="w-3 h-3" />
                            <span>&darr; -11%</span>
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                            farm.auditStatus === 'Audit-Ready'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {farm.auditStatus === 'Audit-Ready' ? 'HIGH (Ready for report)' : 'MEDIUM (Review pending)'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onSelectFarm(farm);
                                showFeedback(`Switched active context to ${farm.name}`);
                              }}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                                isSelected
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                              }`}
                            >
                              {isSelected ? 'Active Farm' : 'Switch Context'}
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTargetFarmId(farm.id);
                                setActiveModule('branded_dossier');
                              }}
                              className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-800"
                              title="Generate Branded Sustainability Dossier"
                            >
                              <Award className="w-4 h-4" />
                            </button>

                            {onOpenLineageModal && farm.fields.length > 0 && (
                              <button
                                onClick={() => onOpenLineageModal(farm.fields[0])}
                                className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-stone-800"
                                title="Inspect Carbon Data Lineage"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.5 BRANDED PDF DOSSIER GENERATOR (P0 - MONETIZATION) */}
      {/* ========================================================= */}
      {activeModule === 'branded_dossier' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Branding Customizer Controls */}
            <div className="lg:col-span-5 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  White-Label Dossier Branding Controls
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Professional Tier</span>
              </div>

              <div className="space-y-3.5 text-xs">
                
                {/* Target Client Farm Selector */}
                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold block">Target Client Farm:</label>
                  <select
                    value={selectedTargetFarmId}
                    onChange={(e) => setSelectedTargetFarmId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {farms.map((f) => (
                      <option key={`dossier-farm-${f.id}`} value={f.id}>
                        {f.name} ({f.totalAcreage.toLocaleString()} ac &bull; {f.ownerName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Consulting Firm Legal Name */}
                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold block">Consulting Firm Legal Entity:</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* CCA License & Consultant Name */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-stone-300 font-semibold block">CCA License #:</label>
                    <input
                      type="text"
                      value={ccaLicense}
                      onChange={(e) => setCcaLicense(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-300 font-semibold block">Lead Agronomist:</label>
                    <input
                      type="text"
                      value={consultantName}
                      onChange={(e) => setConsultantName(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs"
                    />
                  </div>
                </div>

                {/* Consultant Email */}
                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold block">Contact Email for Buyer Inquiries:</label>
                  <input
                    type="email"
                    value={consultantEmail}
                    onChange={(e) => setConsultantEmail(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs font-mono"
                  />
                </div>

                {/* Brand Color Theme Selection */}
                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold block">Dossier Color Theme:</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'emerald', label: 'Emerald Forest', bg: 'bg-emerald-600' },
                      { id: 'cyan', label: 'Deep Cyan', bg: 'bg-cyan-600' },
                      { id: 'amber', label: 'Harvest Gold', bg: 'bg-amber-600' },
                      { id: 'purple', label: 'Imperial Violet', bg: 'bg-purple-600' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setBrandColor(theme.id as any)}
                        className={`flex-1 p-2 rounded-xl text-[11px] font-bold border transition ${
                          brandColor === theme.id
                            ? 'border-white bg-stone-800 text-white'
                            : 'border-stone-800 bg-stone-900 text-stone-400'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${theme.bg} mx-auto mb-1`} />
                        <span>{theme.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Disclaimer Checkbox */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="disclaimer"
                    checked={includeCoverDisclaimer}
                    onChange={(e) => setIncludeCoverDisclaimer(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="disclaimer" className="text-stone-300 text-[11px] cursor-pointer">
                    Include ISO 14064-2 and GHG Protocol Land Sector Data Quality Attestation
                  </label>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    onClick={() => {
                      if (onOpenReportModal) onOpenReportModal();
                      else window.print();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Award className="w-4 h-4" />
                    <span>Generate &amp; Print Branded PDF Dossier</span>
                  </button>

                  <button
                    onClick={() => {
                      const textData = `FARM SUSTAINABILITY & CARBON MRV DOSSIER
Prepared by: ${firmName} (${consultantName}, ${ccaLicense})
Client Farm: ${targetDossierFarm.name} (${targetDossierFarm.ownerName})
Region: ${targetDossierFarm.region}, ${targetDossierFarm.stateOrCountry} | Enrolled Acreage: ${targetDossierFarm.totalAcreage} ac
Audit Status: ${targetDossierFarm.auditStatus}
Total Annual Insetting Sequestration: +${Math.round(targetDossierFarm.totalAcreage * 1.15).toLocaleString()} MT CO2e/yr
Methodology: USDA COMET-Farm & IPCC Tier 1 / Tier 2
Attestation Stamp: Verified under ISO 14064-2 & GHG Protocol Corporate Value Chain Standard.`;
                      
                      const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `Dossier_${targetDossierFarm.name.replace(/\s+/g, '_')}_2026.txt`;
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      showFeedback('Downloaded Sustainability Dossier text file!');
                    }}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Raw Attestation TXT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Dossier Preview */}
            <div className="lg:col-span-7 bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-5 text-xs text-stone-300 select-text">
              
              {/* Dossier Header */}
              <div className="pb-4 border-b-2 border-stone-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-amber-400">
                    Confidential Client Sustainability Dossier
                  </span>
                  <h3 className="text-xl font-bold text-stone-100 mt-0.5">{targetDossierFarm.name}</h3>
                  <p className="text-xs text-stone-400">Primary Producer: {targetDossierFarm.ownerName} &bull; {targetDossierFarm.region}, {targetDossierFarm.stateOrCountry}</p>
                </div>

                <div className="text-right font-mono text-[11px] p-2 bg-stone-900 rounded-xl border border-stone-800">
                  <div className="font-bold text-emerald-400">{firmName}</div>
                  <div className="text-stone-400">{ccaLicense} &bull; {consultantName}</div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
                <span className="font-bold text-stone-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  1. Executive Summary &amp; Scope 3 Insetting Claim
                </span>
                <p className="text-xs text-stone-300 leading-relaxed">
                  During the 2024–2026 reporting cycle, {targetDossierFarm.name} successfully adopted continuous no-till and high-residue cover cropping across {targetDossierFarm.totalAcreage.toLocaleString()} enrolled acres. Multi-spectral Sentinel-2 remote sensing confirmed 98.4% vegetative canopy compliance prior to cash-crop planting.
                </p>
              </div>

              {/* Baseline Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-mono block">Baseline Topsoil SOC</span>
                  <span className="text-base font-bold font-mono text-emerald-400">2.45% SOC</span>
                  <span className="text-[9px] text-stone-500 block">54.2 t C/ha profile stock</span>
                </div>

                <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-mono block">Gross Sequestration</span>
                  <span className="text-base font-bold font-mono text-amber-300">
                    +{Math.round(targetDossierFarm.totalAcreage * 1.15).toLocaleString()} MT/yr
                  </span>
                  <span className="text-[9px] text-stone-500 block">CO₂e annual abatement</span>
                </div>

                <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 font-mono block">Audit Verification Tier</span>
                  <span className="text-base font-bold font-mono text-cyan-400">{targetDossierFarm.auditStatus}</span>
                  <span className="text-[9px] text-stone-500 block">ISO 14064-2 Compliant</span>
                </div>
              </div>

              {/* Data Quality & Attestation Statement */}
              {includeCoverDisclaimer && (
                <div className="p-3 bg-stone-900/40 rounded-xl border border-stone-800 text-[10px] text-stone-400 space-y-1">
                  <strong className="text-stone-300 font-mono">CCA Quality Attestation:</strong> This dossier was formulated by an active Certified Crop Adviser using USDA COMET-Farm empirical models and verified Sentinel-2 L2A satellite time-series. Estimates are designed for voluntary insetting claims and USDA cost-share filings.
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.3 SCENARIO PLANNER (P1) */}
      {/* ========================================================= */}
      {activeModule === 'scenario_planner' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-stone-100">
                Multi-Stage Practice Transition &amp; Agronomic Scenario Planner
              </h4>
              <p className="text-xs text-stone-400">
                Model a stepped practice-change sequence to project CO₂e abatement, soil carbon accumulation, and financial impact.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl font-bold">
              Target: {targetDossierFarm.name} ({targetDossierFarm.totalAcreage} ac)
            </span>
          </div>

          {/* Stepped Transition Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {SCENARIO_STAGES.map((s) => (
              <button
                key={s.step}
                onClick={() => setScenarioStep(s.step)}
                className={`p-3 rounded-2xl border text-left transition ${
                  scenarioStep === s.step
                    ? 'bg-cyan-950/50 border-cyan-500 shadow-lg ring-1 ring-cyan-500/50'
                    : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                  <span>Step {s.step}</span>
                  <span className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-cyan-400 font-bold">
                    {s.difficulty}
                  </span>
                </div>
                <div className="text-xs font-bold text-stone-100 line-clamp-1">{s.title.split(':')[1] || s.title}</div>
              </button>
            ))}
          </div>

          {/* Scenario Comparison Card */}
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                  Active Scenario: Step {activeScenario.step} of 5
                </span>
                <h4 className="text-base font-bold text-stone-100">{activeScenario.title}</h4>
                <p className="text-xs text-stone-400 mt-0.5">{activeScenario.practices}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-400 font-mono block">Estimated Farm Net Delta</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  +${activeScenario.netAnnualFarmReturnUSD.toLocaleString()} / yr
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 font-mono block">Soil Carbon Stock</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{activeScenario.carbonStockStockTCPerHa} t C/ha</span>
                <span className="text-[10px] text-stone-500 block">Topsoil 0–30 cm</span>
              </div>

              <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 font-mono block">Annual CO₂e Abated</span>
                <span className="text-lg font-bold font-mono text-amber-300">+{activeScenario.annualCO2eMT} MT/yr</span>
                <span className="text-[10px] text-stone-500 block">Farm total gross</span>
              </div>

              <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 font-mono block">Grain Yield Projection</span>
                <span className="text-lg font-bold font-mono text-cyan-400">{activeScenario.yieldBuPerAc} bu/ac</span>
                <span className="text-[10px] text-stone-500 block">Corn/Soy rotation</span>
              </div>

              <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 font-mono block">Input Expenditure</span>
                <span className="text-lg font-bold font-mono text-stone-200">${activeScenario.inputCostPerAc.toFixed(2)} / ac</span>
                <span className="text-[10px] text-emerald-400 block">Savings vs baseline</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.4 PROFESSIONAL RECOMMENDATIONS & PRESCRIPTION BUILDER (P1) */}
      {/* ========================================================= */}
      {activeModule === 'recommendations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Recommendation Form */}
            <form onSubmit={handleIssuePrescription} className="lg:col-span-5 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="font-bold text-stone-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Issue Agronomic Recommendation
                </span>
                <span className="text-[10px] text-stone-400 font-mono">{ccaLicense}</span>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Target Farm &amp; Field:</label>
                <select
                  value={rxFieldId}
                  onChange={(e) => setRxFieldId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none"
                >
                  {currentFarm.fields.map((f) => (
                    <option key={`rx-opt-${f.id}`} value={f.id}>
                      {currentFarm.name} &bull; {f.name} ({f.cropType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Recommendation Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Split-apply nitrogen at V6 stage (-25 lbs N/ac)"
                  value={rxTitle}
                  onChange={(e) => setRxTitle(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Agronomic Reasoning &amp; Conditions:</label>
                <textarea
                  rows={2}
                  placeholder="Explain why current soil tests or weather patterns warrant this action..."
                  value={rxReasoning}
                  onChange={(e) => setRxReasoning(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Proposed Action &amp; Rates:</label>
                <textarea
                  rows={2}
                  placeholder="Specific rates, seeding blend specs, implement settings..."
                  value={rxAction}
                  onChange={(e) => setRxAction(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold block">Expected MT CO₂e:</label>
                  <input
                    type="number"
                    value={rxCarbonDelta}
                    onChange={(e) => setRxCarbonDelta(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold block">Estimated Dollar Benefit:</label>
                  <input
                    type="number"
                    value={rxCostImpact}
                    onChange={(e) => setRxCostImpact(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Award className="w-4 h-4" />
                <span>Issue Signed Recommendation</span>
              </button>
            </form>

            {/* Right: Issued Prescription Ledger */}
            <div className="lg:col-span-7 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Active Recommendations ({prescriptions.length} Active Prescriptions)
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Formal Advisories</span>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2.5 hover:border-stone-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-stone-950 text-purple-400 font-mono font-bold text-[10px] border border-stone-800">
                          {rx.approvalStatus.toUpperCase()}
                        </span>
                        <h5 className="text-xs font-bold text-stone-100">{rx.title}</h5>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">Issued: {rx.issuedAt}</span>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">{rx.reasoning}</p>

                    <div className="p-2.5 bg-stone-950/60 rounded-lg text-xs space-y-1">
                      <strong className="text-stone-300">Action:</strong> <span className="text-stone-400">{rx.proposedAction}</span>
                    </div>

                    <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-stone-400 font-mono">
                        Target: <strong className="text-stone-200">{rx.farmName} &bull; {rx.fieldName}</strong>
                      </span>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-emerald-400 font-bold">+{rx.expectedCarbonDeltaMT} MT CO₂e</span>
                        <span className="text-amber-300 font-bold">+${rx.expectedCostImpactUSD.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.6 CLIENT WORKSPACE & DATA REQUEST BRIDGE (P1) */}
      {/* ========================================================= */}
      {activeModule === 'client_workspace' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Dispatch Request Form */}
            <form onSubmit={handleCreateDataRequest} className="lg:col-span-5 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="font-bold text-stone-200 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  Request Missing Evidence from Grower
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Farmer Bridge</span>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Select Client Farm:</label>
                <select
                  value={newReqFarmId}
                  onChange={(e) => setNewReqFarmId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none"
                >
                  {farms.map((f) => (
                    <option key={`req-farm-${f.id}`} value={f.id}>
                      {f.name} ({f.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold block">Requested Item / Record:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upload 2026 Fall Fertilizer receipts or soil test sheet"
                  value={newReqItem}
                  onChange={(e) => setNewReqItem(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold block">Evidence Type:</label>
                  <select
                    value={newReqCategory}
                    onChange={(e) => setNewReqCategory(e.target.value as any)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none"
                  >
                    <option value="receipt">Invoice / Receipt</option>
                    <option value="soil_test">Soil Core Lab Test</option>
                    <option value="machinery_log">Tractor GPS Shapefile</option>
                    <option value="planting_date">Planting / Harvest Date</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold block">Due Date:</label>
                  <input
                    type="date"
                    value={newReqDeadline}
                    onChange={(e) => setNewReqDeadline(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Send className="w-4 h-4" />
                <span>Send Request to Grower Portal</span>
              </button>
            </form>

            {/* Right: Active Request Status Queue */}
            <div className="lg:col-span-7 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Client Data Request Queue ({dataRequests.length} Outstanding)
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Syncs with Farmer Journal</span>
              </div>

              <div className="space-y-3">
                {dataRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2 text-xs hover:border-stone-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-stone-100">{req.requestedItem}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        req.status === 'completed_verified'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : req.status === 'in_progress'
                          ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}>
                        {req.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-stone-400 text-[11px]">
                      <span>Client: <strong className="text-stone-200">{req.farmName}</strong></span>
                      <span>Deadline: <strong className="text-amber-400 font-mono">{req.deadlineDate}</strong></span>
                    </div>

                    {req.growerNotes && (
                      <p className="p-2 bg-stone-950 rounded text-[11px] text-stone-300">
                        <strong>Grower Note:</strong> {req.growerNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.7 REVIEW / APPROVAL WORKFLOW (P1) */}
      {/* ========================================================= */}
      {activeModule === 'approval_workflow' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <h4 className="text-sm font-bold text-stone-100">
                Four-Stage Agronomic Audit &amp; Approval Pipeline
              </h4>
              <p className="text-xs text-stone-400">
                Enforces strict data integrity: <code>Entered &rarr; Reviewed &rarr; Approved &rarr; Locked</code>.
              </p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl font-bold">
              ISO 14064-3 Compliance Trail
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { stage: 'Entered', count: 4, desc: 'Logged by grower / raw sensor ingest', color: 'border-stone-700 bg-stone-950' },
              { stage: 'Reviewed', count: 2, desc: 'Verified by CCA agronomist against imagery', color: 'border-cyan-800 bg-cyan-950/30' },
              { stage: 'Approved', count: 5, desc: 'Formally stamped for grant & carbon credits', color: 'border-emerald-800 bg-emerald-950/30' },
              { stage: 'Locked', count: 8, desc: 'Immutable SHA-256 seal; exported to registry', color: 'border-purple-800 bg-purple-950/30' },
            ].map((col) => (
              <div key={col.stage} className={`p-4 rounded-2xl border ${col.color} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-200">{col.stage}</span>
                  <span className="font-mono font-bold text-xs bg-stone-900 px-2 py-0.5 rounded text-stone-100">
                    {col.count} Records
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">{col.desc}</p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.8 CONSULTANT KNOWLEDGE LIBRARY (P2) */}
      {/* ========================================================= */}
      {activeModule === 'knowledge_library' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <h4 className="text-sm font-bold text-stone-100">
                Agronomic Knowledge Library &amp; Protocol Templates
              </h4>
              <p className="text-xs text-stone-400">
                Standardized templates for soil sampling, USDA practice standards, and carbon insetting attestation.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl font-bold">
              {KNOWLEDGE_TEMPLATES.length} Reusable Protocols
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {KNOWLEDGE_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3 hover:border-stone-700 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-stone-900 text-amber-400 font-mono text-[10px] font-bold border border-stone-800">
                      {tpl.category}
                    </span>
                    <BookOpen className="w-4 h-4 text-stone-500" />
                  </div>
                  <h5 className="text-sm font-bold text-stone-100">{tpl.title}</h5>
                  <p className="text-xs text-stone-400 leading-relaxed">{tpl.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {tpl.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono text-stone-500 bg-stone-900 px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => showFeedback(`Loaded template "${tpl.title}" into clipboard!`)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Use Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
