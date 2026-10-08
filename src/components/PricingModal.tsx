import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Users, 
  Map, 
  Building2, 
  Globe2, 
  Tractor, 
  Activity, 
  ChevronRight, 
  Info, 
  Lock, 
  Scale, 
  Bot, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle2, 
  BarChart3,
  Mail,
  Zap,
  PhoneCall
} from 'lucide-react';

interface PricingModalProps {
  onClose: () => void;
  onSelectPlan: (plan: string) => void;
  onOpenReportModal?: () => void;
  onOpenAddOnHub?: (module?: 'data_room' | 'grants' | 'carbon_program' | 'api_console') => void;
  initialTab?: 'tiers' | 'matrix' | 'verification_report' | 'monetization' | 'roi';
}

export const PricingModal: React.FC<PricingModalProps> = ({
  onClose,
  onSelectPlan,
  onOpenReportModal,
  onOpenAddOnHub,
  initialTab = 'tiers',
}) => {
  const [activeTab, setActiveTab] = useState<'tiers' | 'matrix' | 'verification_report' | 'monetization' | 'roi'>(initialTab);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [farmAcresInput, setFarmAcresInput] = useState(1200);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesEmail, setSalesEmail] = useState('');
  const [salesCompany, setSalesCompany] = useState('');
  const [salesSubmitted, setSalesSubmitted] = useState(false);

  // Seat / Team Pricing Dimension State
  const [farmerSeats, setFarmerSeats] = useState<number>(2);
  const [agronomistSeats, setAgronomistSeats] = useState<number>(3);
  const [auditorSeats, setAuditorSeats] = useState<number>(1);

  // Modular Add-ons State
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(['soil_sampling', 'planet_satellite']);

  // Seat Cost Calculations
  const farmerSeatCost = farmerSeats * 15;
  const agronomistSeatCost = agronomistSeats * 35;
  const auditorSeatCost = auditorSeats * 49;
  const totalMonthlySeatCost = farmerSeatCost + agronomistSeatCost + auditorSeatCost;
  const totalAnnualSeatCost = totalMonthlySeatCost * 12;

  // Add-on Cost Calculations
  const addOnPrices: Record<string, number> = {
    soil_sampling: 79,
    planet_satellite: 149,
    whitelabel_dossiers: 99,
    report_bundle_5: 425,
    report_bundle_10: 790,
  };
  const totalAddOnMonthly = selectedAddOns.reduce((acc, curr) => acc + (addOnPrices[curr] || 0), 0);

  // ROI math
  const estimatedCarbonMT = Math.round(farmAcresInput * 0.95);
  const potentialCreditValue = Math.round(estimatedCarbonMT * 30);
  const potentialEQIPGrant = Math.round(farmAcresInput * 25);
  const totalValuePotential = potentialCreditValue + potentialEQIPGrant;
  const basicAnnualCost = Math.round(farmAcresInput * 0.50);

  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSalesSubmitted(true);
    setTimeout(() => {
      setShowSalesModal(false);
      setSalesSubmitted(false);
      onSelectPlan('Enterprise Custom Briefing Requested');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-700/80 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header & Core Progression Ladder Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900 border-b border-stone-800 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-stone-100 p-2 rounded-xl hover:bg-stone-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Vision Title */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pricing Tiers &amp; Packaging Architecture</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
              Unlock Business Value at Every Agricultural Scale
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm">
              We don't grow tiers by stacking random features onto each plan. Each tier unlocks a distinct level of business capability, telling one cohesive progression story.
            </p>

            {/* Visual Progression Story Ladder (Section 1) */}
            <div className="pt-3 pb-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-stone-950/80 border border-stone-800 p-2 rounded-2xl text-left">
                <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                    <Tractor className="w-3.5 h-3.5" />
                    <span>1. FARM</span>
                  </div>
                  <div className="text-stone-200 text-xs font-semibold mt-0.5">Manage your land</div>
                  <div className="text-[10px] text-stone-400">Explorer &bull; Basic</div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                    <Users className="w-3.5 h-3.5" />
                    <span>2. PROFESSIONAL</span>
                  </div>
                  <div className="text-stone-200 text-xs font-semibold mt-0.5">Manage your clients</div>
                  <div className="text-[10px] text-stone-400">Agronomist Platform</div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                  <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold font-mono">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>3. CORPORATE</span>
                  </div>
                  <div className="text-stone-200 text-xs font-semibold mt-0.5">Manage supply chain</div>
                  <div className="text-[10px] text-stone-400">Scope 3 Insetting</div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono">
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>4. ENTERPRISE</span>
                  </div>
                  <div className="text-stone-200 text-xs font-semibold mt-0.5">Manage Ag programs</div>
                  <div className="text-[10px] text-stone-400">Custom Infrastructure</div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('tiers')}
                  className={`px-3.5 py-1.5 rounded-lg transition ${
                    activeTab === 'tiers'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Core Ladder (5 Tiers)
                </button>

                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`px-3.5 py-1.5 rounded-lg transition ${
                    activeTab === 'matrix'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Full Comparison Table (§8)
                </button>

                <button
                  onClick={() => setActiveTab('verification_report')}
                  className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === 'verification_report'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <span>Field Evidence Report ($99)</span>
                  <span className="text-[9px] bg-amber-950 border border-amber-800 text-amber-300 px-1.5 py-0.2 rounded font-mono">Evidence</span>
                </button>

                <button
                  onClick={() => setActiveTab('monetization')}
                  className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === 'monetization'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  <span>Monetization &amp; Add-ons</span>
                  <span className="text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-300 px-1.5 py-0.2 rounded font-mono">Expansion</span>
                </button>

                <button
                  onClick={() => setActiveTab('roi')}
                  className={`px-3.5 py-1.5 rounded-lg transition ${
                    activeTab === 'roi'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Interactive ROI Calculator
                </button>
              </div>

              {/* Billing Cycle Switch */}
              <div className="inline-flex items-center gap-1 bg-stone-950 border border-stone-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 rounded-lg transition ${
                    billingCycle === 'annual'
                      ? 'bg-stone-800 text-emerald-400 font-bold border border-emerald-600/40 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Annual <span className="text-emerald-300 font-bold">(Save 20%)</span>
                </button>
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-lg transition ${
                    billingCycle === 'monthly'
                      ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Main Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          
          {/* TAB 1: CORE LADDER (5 TIERS) WITH BALANCED VISUAL HIERARCHY (§9) */}
          {activeTab === 'tiers' && (
            <div className="space-y-8">
              {/* Renaming Alert / Rationale Callout Banner (PRD-17) */}
              <div className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-600/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 shrink-0 mt-0.5">
                    <Info className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                        PRD-17 Scientific Claims &amp; Assurance Update
                      </span>
                      <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded font-mono">
                        Deliverable: "Field Evidence Report"
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1 max-w-3xl leading-relaxed">
                      <strong>Why "Field Evidence Report"?</strong> Even "Verification Report" implies that third-party certification has already occurred. This product provides the <strong>audit-ready evidence package</strong> (observed Sentinel-2 vegetation passes, boundary geometry, and modeled calculation lineage). Modeled outputs carry an explicit <strong>"Not independently verified"</strong> label until an accredited third-party audit occurs.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('verification_report')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-600/40 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Explore Field Evidence Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 5-Tier Core Ladder Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
                
                {/* 1. EXPLORER (Free Tier - P1) */}
                <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between hover:border-stone-700 transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
                        EVALUATION
                      </span>
                      <span className="text-[10px] text-stone-500">1 Farm</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-100">Explorer</h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Experience maps before paying, without expensive data compute.
                      </p>
                    </div>

                    <div className="pt-2 pb-3 border-b border-stone-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-stone-100">$0</span>
                        <span className="text-stone-400 text-xs font-medium">Free</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-0.5">Deliberately limited sandbox</p>
                    </div>

                    {/* Feature Highlights */}
                    <div className="space-y-2 text-xs text-stone-300 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Included Scope:</div>
                      <ul className="space-y-2 text-[11px]">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>1 farm, 1–2 fields boundary GIS</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>Basic Sentinel-2 satellite imagery</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>Basic soil profile &amp; limited carbon estimate</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>Global Geographic Soil Map access</span>
                        </li>
                      </ul>
                    </div>

                    {/* Upsell nudge */}
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800/80 text-[10px] text-stone-400 mt-3">
                      <span className="font-semibold text-stone-300">Upgrade Notice:</span> Prompts to upgrade when accessing full farm telemetry.
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPlan('Explorer (Free)')}
                    className="mt-5 w-full bg-stone-900 hover:bg-stone-800 text-stone-200 py-2.5 rounded-xl text-xs font-bold border border-stone-800 transition"
                  >
                    Start Free with Explorer
                  </button>
                </div>

                {/* 2. BASIC - "FARM INTELLIGENCE" (P0) */}
                <div className="bg-stone-950/90 border border-emerald-900/60 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-700 transition relative">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                        FARM INTELLIGENCE
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">P0 Core</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-stone-100">Basic Tier</h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        For farmers managing their own land, soil carbon, &amp; grant records.
                      </p>
                    </div>

                    <div className="pt-2 pb-3 border-b border-stone-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-stone-100">
                          {billingCycle === 'annual' ? '$39' : '$49'}
                        </span>
                        <span className="text-stone-400 text-xs font-medium">/ month</span>
                      </div>
                      <p className="text-[10px] text-emerald-400 mt-0.5">
                        or $0.50 / acre / yr (up to 2,500 ac)
                      </p>
                    </div>

                    {/* Flagship Feature: Farm Health Score (0-100) */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Flagship: Farm Health Score</span>
                        </span>
                        <span className="font-mono font-bold text-white bg-emerald-800 px-1.5 py-0.2 rounded text-[10px]">84/100</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-stone-300">
                        <div className="bg-stone-900/80 px-1 py-0.5 rounded text-center">Soil: 88</div>
                        <div className="bg-stone-900/80 px-1 py-0.5 rounded text-center">Water: 79</div>
                        <div className="bg-stone-900/80 px-1 py-0.5 rounded text-center">Carbon: 85</div>
                        <div className="bg-stone-900/80 px-1 py-0.5 rounded text-center">Data: 84</div>
                      </div>
                    </div>

                    {/* 4 Grouped Value Areas (§3) */}
                    <div className="space-y-2 text-[11px] text-stone-300 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">4 Value Pillars:</div>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Soil Intelligence:</strong> SOC, NDVI, moisture radar, scouting notes</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Farm Economics:</strong> Practice ROI calculator &amp; input-cost tracking</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Documentation:</strong> Digital farm journal &amp; PDF summary</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Alerts:</strong> Moisture warning &amp; sampling reminder</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPlan('Basic Plan')}
                    className="mt-5 w-full bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-extrabold py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-950"
                  >
                    Start Basic Plan
                  </button>
                </div>

                {/* 3. PROFESSIONAL - AGRONOMIST PLATFORM ($199/mo) (P0) */}
                <div className="bg-stone-950/90 border-2 border-emerald-500/80 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-400 transition relative shadow-lg shadow-emerald-950/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-300 bg-emerald-950 border border-emerald-700 px-2 py-0.5 rounded">
                        AGRONOMIST PLATFORM
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold">Most Popular for Advisors</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-stone-100">Professional</h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        For agronomists, CCAs, &amp; consultants managing multi-farm client portfolios.
                      </p>
                    </div>

                    <div className="pt-2 pb-3 border-b border-stone-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-emerald-400">
                          {billingCycle === 'annual' ? '$199' : '$249'}
                        </span>
                        <span className="text-stone-400 text-xs font-medium">/ month</span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Unlimited farms, fields &amp; 5 team seats
                      </p>
                    </div>

                    {/* Flagship Feature: AI Agronomist Assistant (§4 P1) */}
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-emerald-700/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                        <Bot className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Flagship: AI Agronomist Assistant</span>
                      </div>
                      <p className="text-[10px] text-stone-400 leading-tight">
                        "Which client fields have declining SOC?" &bull; "Show high nitrogen intensity farms"
                      </p>
                    </div>

                    {/* 4 Grouped Value Areas (§4) */}
                    <div className="space-y-2 text-[11px] text-stone-300 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">4 Advisory Pillars:</div>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Multi-Farm:</strong> Client workspace, cross-client benchmarking</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Advanced GIS:</strong> Full layer library, field zones, GeoJSON import/export</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Agronomic Planning:</strong> Cover crop, tillage, nutrient scenario models</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Branded Dossiers:</strong> White-label PDF reports with firm logo</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPlan('Professional Plan')}
                    className="mt-5 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-black py-2.5 rounded-xl text-xs transition shadow-md"
                  >
                    Start Professional Plan
                  </button>
                </div>

                {/* 4. CORPORATE - SUPPLY CHAIN & SCOPE 3 ($499+/mo) (P0 - NEWLY ADDED) */}
                <div className="bg-stone-950/90 border border-cyan-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-600 transition relative">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                        SUPPLY CHAIN
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono font-bold">Scope 3</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-stone-100">Corporate</h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        For sustainability teams &amp; agribusinesses managing supply shed insetting.
                      </p>
                    </div>

                    <div className="pt-2 pb-3 border-b border-stone-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-cyan-300">$499+</span>
                        <span className="text-stone-400 text-xs font-medium">/ month</span>
                      </div>
                      <p className="text-[10px] text-cyan-400 mt-0.5">
                        Tier-1 insetting volume &amp; supplier portal
                      </p>
                    </div>

                    {/* Flagship Scope 3 Insetting Box */}
                    <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Scope 3 Decarbonization Hub</span>
                      </div>
                      <p className="text-[10px] text-stone-400 leading-tight">
                        Agricultural Scope 3 GHG accounting by supplier, commodity &amp; river basin (tCO₂e/tonne).
                      </p>
                    </div>

                    {/* 5 Grouped Value Areas (§6) */}
                    <div className="space-y-2 text-[11px] text-stone-300 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Enterprise Pillars:</div>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong>Supply Chain:</strong> Supplier portal &amp; commodity volume tracking</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong>Scope 3 Accounting:</strong> Primary vs. estimated activity factors</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong>Data Integrity:</strong> Cryptographic lineage &amp; change audit logs</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span><strong>Reporting:</strong> Executive ESG exports, scheduled CSV/API</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPlan('Corporate Scope 3 Plan')}
                    className="mt-5 w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Start Corporate Plan
                  </button>
                </div>

                {/* 5. ENTERPRISE - CUSTOM AG-PROGRAM (P1) */}
                <div className="bg-stone-950/90 border border-amber-800/60 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-600 transition relative">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-300 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded">
                        CUSTOM PROGRAM
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">Talk to Sales</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-stone-100">Enterprise</h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        For food processors, retailers, financial institutions &amp; global programs.
                      </p>
                    </div>

                    <div className="pt-2 pb-3 border-b border-stone-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-amber-300">Custom</span>
                        <span className="text-stone-400 text-xs font-medium">Bespoke SLA</span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">Tailored infrastructure &amp; compliance</p>
                    </div>

                    {/* Value Area Details (§7) */}
                    <div className="space-y-2 text-[11px] text-stone-300 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Everything in Corporate +</div>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>SSO / SAML &amp; SCIM:</strong> Automated user lifecycle provisioning</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>ERP Integrations:</strong> SAP, Oracle, Data Warehouse direct sync</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Custom Methodologies:</strong> Regional emission baselines</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Dedicated SLA:</strong> Account Manager &amp; priority hotline</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSalesModal(true)}
                    className="mt-5 w-full bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-600/40 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>Talk to Enterprise Sales</span>
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: FULL COMPARISON TABLE (§8) */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-100">
                    Comprehensive Feature &amp; Capability Matrix (§8)
                  </h3>
                  <p className="text-xs text-stone-400">
                    Compare features across the complete 5-tier product architecture.
                  </p>
                </div>
                <div className="text-xs text-stone-400 font-mono">
                  5 Tiers &bull; 18 Dimensions
                </div>
              </div>

              {/* Responsive Comparison Table */}
              <div className="border border-stone-800 rounded-2xl overflow-hidden shadow-xl bg-stone-950">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-stone-300">
                    <thead className="text-[11px] uppercase bg-stone-900 border-b border-stone-800 text-stone-400 font-mono">
                      <tr>
                        <th className="py-3 px-4 w-44">Capability Dimension</th>
                        <th className="py-3 px-3 text-stone-300">Explorer</th>
                        <th className="py-3 px-3 text-emerald-400">Basic</th>
                        <th className="py-3 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40">Professional</th>
                        <th className="py-3 px-3 text-cyan-300">Corporate</th>
                        <th className="py-3 px-3 text-amber-300">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/80">
                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Target Audience</td>
                        <td className="py-2.5 px-3">Try the platform</td>
                        <td className="py-2.5 px-3">Farmers</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40">Agronomists</td>
                        <td className="py-2.5 px-3">Sustainability teams</td>
                        <td className="py-2.5 px-3">Large organizations</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Price</td>
                        <td className="py-2.5 px-3 font-bold text-stone-100">Free</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">$29–49/mo</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40">$199/mo</td>
                        <td className="py-2.5 px-3 font-bold text-cyan-300">$499+/mo</td>
                        <td className="py-2.5 px-3 font-bold text-amber-300">Custom</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Enrolled Farms</td>
                        <td className="py-2.5 px-3 font-mono">1</td>
                        <td className="py-2.5 px-3 font-mono">1</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40">Multi-farm</td>
                        <td className="py-2.5 px-3 font-mono">Multi-supplier</td>
                        <td className="py-2.5 px-3 font-mono">Unlimited/custom</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Acreage Scope</td>
                        <td className="py-2.5 px-3 text-stone-400">Limited (1–2 fields)</td>
                        <td className="py-2.5 px-3">2,500 acres</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40">Unlimited</td>
                        <td className="py-2.5 px-3">Custom / Supply shed</td>
                        <td className="py-2.5 px-3">Custom</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">GIS Mapping</td>
                        <td className="py-2.5 px-3">Basic</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40 font-semibold">Advanced</td>
                        <td className="py-2.5 px-3 font-semibold">Advanced</td>
                        <td className="py-2.5 px-3 font-semibold">Advanced</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Soil Intelligence</td>
                        <td className="py-2.5 px-3">Basic</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40 font-semibold">Advanced</td>
                        <td className="py-2.5 px-3 font-semibold">Advanced</td>
                        <td className="py-2.5 px-3 font-semibold">Advanced</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Carbon Modeling</td>
                        <td className="py-2.5 px-3">Basic</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40 font-semibold">Advanced</td>
                        <td className="py-2.5 px-3 font-semibold text-cyan-300">Scope 3</td>
                        <td className="py-2.5 px-3 font-semibold text-amber-300">Custom</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Farm Health Score (0–100)</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">&#10003; (Flagship)</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-stone-400">&#10003;</td>
                        <td className="py-2.5 px-3 text-stone-400">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">ROI Calculator</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">AI Assistant</td>
                        <td className="py-2.5 px-3 text-stone-400">Limited</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40 font-bold">&#10003; (Flagship)</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Client Management</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">White-Label Reports</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Supplier Portal</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600 bg-emerald-950/20 border-x border-emerald-800/40">&mdash;</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Scope 3 Decarbonization</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600 bg-emerald-950/20 border-x border-emerald-800/40">&mdash;</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Data Lineage &amp; Proof</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-300">Basic</td>
                        <td className="py-2.5 px-3 text-emerald-300 bg-emerald-950/20 border-x border-emerald-800/40 font-semibold">Advanced</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Audit Workflow</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-300 bg-emerald-950/20 border-x border-emerald-800/40">Basic</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">API Access</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-400 bg-emerald-950/20 border-x border-emerald-800/40">Add-on</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">&#10003;</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">SSO &amp; SCIM Provisioning</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600 bg-emerald-950/20 border-x border-emerald-800/40">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003;</td>
                      </tr>

                      <tr className="hover:bg-stone-900/40">
                        <td className="py-2.5 px-4 font-semibold text-stone-200">Dedicated SLA &amp; Support</td>
                        <td className="py-2.5 px-3 text-stone-600">&mdash;</td>
                        <td className="py-2.5 px-3 text-stone-400">Community</td>
                        <td className="py-2.5 px-3 text-stone-300 bg-emerald-950/20 border-x border-emerald-800/40">Priority</td>
                        <td className="py-2.5 px-3 text-cyan-300">Dedicated</td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold">&#10003; Account Mgr</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIELD VERIFICATION REPORT ($99) - REPOSITIONED FROM "AUDIT REPORT" (§5 P0) */}
          {activeTab === 'verification_report' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Detailed Rationale & Naming Clarification Box */}
              <div className="bg-stone-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-7 relative shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950 border border-amber-800 px-2.5 py-0.5 rounded-full">
                      PRD-17 Assurance Standard
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-stone-100 mt-1">
                      Field Evidence Report ($99 / field)
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Empirical audit-ready dossier &bull; Zero subscription commitment required
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-amber-300 font-mono">$99</div>
                    <div className="text-[10px] text-stone-400">One-time per field</div>
                  </div>
                </div>

                {/* Explicit Rationale Explanation */}
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-700/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>The Rationale: Why "Field Evidence Report" instead of "Verification Report"?</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed">
                    Even the title <em>"Verification Report"</em> legally implies that formal third-party assurance has already occurred. TerraSoil provides the <strong>audit-ready evidence package</strong> — observed field boundaries, Sentinel-2 vegetation passes, and calculation lineage needed by those verifiers. We titled the deliverable <strong>Field Evidence Report</strong> to eliminate confusion, avoid over-promising assurance, and place a prominent <strong>"Not independently verified"</strong> label on all modeled outputs until an accredited auditor conducts a formal review.
                  </p>
                </div>

                {/* What's Inside: The Audit Evidence Package (§5) */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    Complete Audit Evidence Package Contents:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-200">
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-stone-100">Field Boundary History</div>
                        <div className="text-[11px] text-stone-400">Polygon GIS coordinates, acreage validation, and centroid metadata.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-stone-100">Timestamped Practice History</div>
                        <div className="text-[11px] text-stone-400">Cover crops, no-till, 4R fertilizer reduction with dates and status.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-stone-100">Sentinel-2 NDVI Satellite Proof</div>
                        <div className="text-[11px] text-stone-400">12-day composite platform update interval optical vegetation and canopy vigor curves.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-stone-100">Soil Organic Carbon (SOC) Lineage</div>
                        <div className="text-[11px] text-stone-400">Baseline depth inventory, bulk density factors, and accretion math.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-stone-100">USDA COMET-Farm &amp; IPCC Formula</div>
                        <div className="text-[11px] text-stone-400">Transparent mathematical derivation with full emission factor appendix.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-stone-100">Evidence Attachments &amp; Quality Score</div>
                        <div className="text-[11px] text-stone-400">Photographic receipts, soil lab records, and cryptographic lineage ID.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Positioning Copy (§5) */}
                <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-stone-400 max-w-xl">
                    <p className="italic">
                      "Build a professional evidence package for a field, farm, grant application, sustainability program, or buyer request."
                    </p>
                    <p className="text-[11px] text-emerald-400 mt-1">
                      &bull; Full $99 credit applied toward Basic or Professional plan if you subscribe within 30 days.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenReportModal) {
                        onClose();
                        onOpenReportModal();
                      } else {
                        onSelectPlan('Field Evidence Report ($99)');
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs transition flex items-center gap-2 shadow-lg shadow-amber-950/40"
                  >
                    <span>Generate Field Evidence Report &rarr;</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: MONETIZATION EXPANSION — SEAT PRICING, ADD-ONS & PRODUCT LINES */}
          {activeTab === 'monetization' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              
              {/* Header Banner */}
              <div className="bg-stone-950 border border-cyan-800/80 rounded-3xl p-6 sm:p-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                        Expansion Packaging &amp; Monetization Architecture
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-stone-100 mt-0.5">
                        Modular Add-ons, Seat Dimensions &amp; Future Product Lines
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-300 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl">
                    4 Expansion Pillars
                  </span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed max-w-3xl">
                  Extend your TerraSoil subscription with granular team seat scaling, physical lab sampling syncs, daily radar satellite packs, and dedicated high-margin B2B product lines.
                </p>
              </div>

              {/* SECTION 1: SEAT & TEAM PRICING DIMENSION */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-base font-bold text-stone-100">1. Interactive Team &amp; Seat Pricing Estimator</h4>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Scale user seats dynamically across farm hands, agronomists, and supply chain auditors.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-400 block font-medium">Estimated Seat Overhead</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">${totalMonthlySeatCost} <span className="text-xs font-normal text-stone-400">/ mo</span></span>
                    <span className="text-[10px] text-stone-500 block">(${totalAnnualSeatCost.toLocaleString()} / year)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Farmer / Hand Seats */}
                  <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-200">Field Hand / Operator Seats</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">$15/mo</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-stone-400">Basic Plan includes 1 seat</span>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={farmerSeats}
                        onChange={(e) => setFarmerSeats(Math.max(1, Number(e.target.value)))}
                        className="w-16 bg-stone-950 border border-stone-700 font-mono text-xs text-stone-100 px-2 py-1 rounded-lg text-center"
                      />
                    </div>
                  </div>

                  {/* Advisor / Agronomist Seats */}
                  <div className="p-4 rounded-2xl bg-stone-900 border border-emerald-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-200">CCA / Agronomist Seats</span>
                      <span className="text-xs font-mono text-emerald-300 font-bold">$35/mo</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-stone-400">Pro Plan includes 5 seats</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={agronomistSeats}
                        onChange={(e) => setAgronomistSeats(Math.max(1, Number(e.target.value)))}
                        className="w-16 bg-stone-950 border border-stone-700 font-mono text-xs text-stone-100 px-2 py-1 rounded-lg text-center"
                      />
                    </div>
                  </div>

                  {/* Corporate / Auditor Seats */}
                  <div className="p-4 rounded-2xl bg-stone-900 border border-cyan-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-200">Scope 3 Auditor Seats</span>
                      <span className="text-xs font-mono text-cyan-300 font-bold">$49/mo</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-stone-400">Corporate includes 10 seats</span>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={auditorSeats}
                        onChange={(e) => setAuditorSeats(Math.max(1, Number(e.target.value)))}
                        className="w-16 bg-stone-950 border border-stone-700 font-mono text-xs text-stone-100 px-2 py-1 rounded-lg text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: MODULAR ADD-ON MARKETPLACE & BULK REPORT BUNDLES */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-base font-bold text-stone-100">2. Modular Add-On Marketplace &amp; Report Bundles</h4>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Select specialized capabilities to customize your SaaS plan.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-400 block font-medium">Selected Add-ons Total</span>
                    <span className="text-2xl font-black text-cyan-300 font-mono">+${totalAddOnMonthly} <span className="text-xs font-normal text-stone-400">/ mo</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Add-on 1: Physical Soil Lab Sampling Sync */}
                  <div
                    onClick={() => {
                      setSelectedAddOns((prev) =>
                        prev.includes('soil_sampling')
                          ? prev.filter((i) => i !== 'soil_sampling')
                          : [...prev, 'soil_sampling']
                      );
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                      selectedAddOns.includes('soil_sampling')
                        ? 'bg-emerald-950/40 border-emerald-500 text-stone-100'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <Check className={`w-4 h-4 p-0.5 rounded ${selectedAddOns.includes('soil_sampling') ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-stone-800 text-transparent'}`} />
                        <span>Soil Core Sampling &amp; Lab Telemetry Sync</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">$79 / farm / yr</span>
                    </div>
                    <p className="text-[11px] text-stone-400 pl-5 leading-relaxed">
                      Sync physical soil lab assays (spectroscopy, dry combustion NPK, bulk density) directly with GPS core sampling points.
                    </p>
                  </div>

                  {/* Add-on 2: High-Res Daily PlanetScope Satellite Pack */}
                  <div
                    onClick={() => {
                      setSelectedAddOns((prev) =>
                        prev.includes('planet_satellite')
                          ? prev.filter((i) => i !== 'planet_satellite')
                          : [...prev, 'planet_satellite']
                      );
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                      selectedAddOns.includes('planet_satellite')
                        ? 'bg-emerald-950/40 border-emerald-500 text-stone-100'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <Check className={`w-4 h-4 p-0.5 rounded ${selectedAddOns.includes('planet_satellite') ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-stone-800 text-transparent'}`} />
                        <span>Daily 3m PlanetScope &amp; SAR Radar Telemetry</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">$149 / mo</span>
                    </div>
                    <p className="text-[11px] text-stone-400 pl-5 leading-relaxed">
                      Upgrade from 10m Sentinel-2 12-day optical to daily 3m resolution optical + cloud-penetrating Synthetic Aperture Radar (SAR).
                    </p>
                  </div>

                  {/* Add-on 3: White-Label Agency Dossier Pack */}
                  <div
                    onClick={() => {
                      setSelectedAddOns((prev) =>
                        prev.includes('whitelabel_dossiers')
                          ? prev.filter((i) => i !== 'whitelabel_dossiers')
                          : [...prev, 'whitelabel_dossiers']
                      );
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                      selectedAddOns.includes('whitelabel_dossiers')
                        ? 'bg-emerald-950/40 border-emerald-500 text-stone-100'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <Check className={`w-4 h-4 p-0.5 rounded ${selectedAddOns.includes('whitelabel_dossiers') ? 'bg-emerald-500 text-stone-950 font-bold' : 'bg-stone-800 text-transparent'}`} />
                        <span>White-Label Agency Branding Pack</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">$99 / mo</span>
                    </div>
                    <p className="text-[11px] text-stone-400 pl-5 leading-relaxed">
                      Custom consultant domains (`advisor.yourbrand.ag`), custom logos on all PDF dossiers, and co-branded farmer portal login.
                    </p>
                  </div>

                  {/* Add-on 4: Field Evidence Report 10-Pack Bundle */}
                  <div
                    onClick={() => {
                      setSelectedAddOns((prev) =>
                        prev.includes('report_bundle_10')
                          ? prev.filter((i) => i !== 'report_bundle_10')
                          : [...prev, 'report_bundle_10']
                      );
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                      selectedAddOns.includes('report_bundle_10')
                        ? 'bg-amber-950/40 border-amber-500 text-stone-100'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <Check className={`w-4 h-4 p-0.5 rounded ${selectedAddOns.includes('report_bundle_10') ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-transparent'}`} />
                        <span>10-Pack Field Evidence Reports Bundle</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">$790 (Save $200)</span>
                    </div>
                    <p className="text-[11px] text-stone-400 pl-5 leading-relaxed">
                      Pre-purchase 10 audit-ready Field Evidence Reports at $79/field (20% discount off standard $99 individual price).
                    </p>
                  </div>

                </div>
              </div>

              {/* SECTION 3: SUBSTANTIAL STANDALONE PRODUCT LINES (EXPANSION SUITE) */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-base font-bold text-stone-100">3. Substantial Standalone Product Lines (Expansion Suite)</h4>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Features substantial enough to evolve into distinct SaaS product lines for specialized enterprise markets.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-3 py-1.5 rounded-xl">
                    4 Standalone Platforms
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Product Line 1: Carbon Virtual Data Room */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3 hover:border-cyan-700/60 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                        PRODUCT LINE 1
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-200">$149/mo or $49/field</span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-stone-100">Carbon Virtual Data Room (VDR)</h5>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        Encrypted due diligence data vault for land transactions, carbon credit buyers, banks, and verifiers with digital NDA watermarking and inspection audit logs.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenAddOnHub) {
                          onClose();
                          onOpenAddOnHub('data_room');
                        } else {
                          onSelectPlan('Carbon Virtual Data Room Module ($149/mo)');
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-800/60 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Launch Data Room Interactive Demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Product Line 2: Grant & Incentive Intelligence */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3 hover:border-cyan-700/60 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                        PRODUCT LINE 2
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-200">$79/mo</span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-stone-100">Grant &amp; Conservation Incentive Intelligence</h5>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        AI-powered grant discovery engine matching farm GIS boundaries against USDA NRCS (EQIP, CSP, REAP) and pre-filling CPA-52 application paperwork.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenAddOnHub) {
                          onClose();
                          onOpenAddOnHub('grants');
                        } else {
                          onSelectPlan('Grant & Incentive Intelligence Module ($79/mo)');
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-800/60 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Launch Grant Matcher Interactive Demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Product Line 3: Carbon Project Developer Suite */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3 hover:border-cyan-700/60 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                        PRODUCT LINE 3
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-200">$299/mo</span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-stone-100">Carbon Program Developer Suite</h5>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        Dedicated suite for Carbon Project Developers &amp; Aggregators managing Verra VM0042 &amp; Gold Standard crediting periods, 15% buffer pool deductions, and additionality proofs.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenAddOnHub) {
                          onClose();
                          onOpenAddOnHub('carbon_program');
                        } else {
                          onSelectPlan('Carbon Program Developer Suite ($299/mo)');
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-cyan-300 border border-cyan-800/60 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Launch Project Developer Demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Product Line 4: Data & REST / GraphQL API Console */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3 hover:border-cyan-700/60 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                        PRODUCT LINE 4
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-200">$199/mo</span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-stone-100">Data &amp; REST / GraphQL API Plan</h5>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        High-throughput API platform for agtech software vendors, FMIS systems, and banks. 1M req/mo, Webhooks, and John Deere Ops Center OAuth pipeline.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenAddOnHub) {
                          onClose();
                          onOpenAddOnHub('api_console');
                        } else {
                          onSelectPlan('Data & API Console Plan ($199/mo)');
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-cyan-300 border border-cyan-800/60 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Launch API Console Interactive Demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 5: INTERACTIVE ROI CALCULATOR */}
          {activeTab === 'roi' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <span>Interactive Agronomic Return On Investment (ROI) Calculator</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Model your farm's revenue potential across carbon insetting markets and USDA conservation grants.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-stone-900 border border-stone-800 px-3 py-2 rounded-2xl">
                    <span className="text-xs text-stone-300 font-semibold">Enrolled Acreage:</span>
                    <input
                      type="number"
                      min="50"
                      max="25000"
                      step="50"
                      value={farmAcresInput}
                      onChange={(e) => setFarmAcresInput(Math.max(10, Number(e.target.value)))}
                      className="w-28 bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 font-mono text-right focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-xs text-stone-400">Acres</span>
                  </div>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
                    <span className="text-[11px] text-stone-400 block font-medium">Estimated Sequestration</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                      {estimatedCarbonMT.toLocaleString()} <span className="text-xs text-stone-400 font-normal">tCO₂e / yr</span>
                    </span>
                    <span className="text-[10px] text-stone-500 mt-1 block">~0.95 MT CO₂e per acre</span>
                  </div>

                  <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
                    <span className="text-[11px] text-stone-400 block font-medium">Carbon Market Revenue</span>
                    <span className="text-2xl font-black text-amber-300 font-mono mt-1 block">
                      ${potentialCreditValue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-500 mt-1 block">At $30 / metric ton</span>
                  </div>

                  <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
                    <span className="text-[11px] text-stone-400 block font-medium">USDA NRCS EQIP / CSP Grant</span>
                    <span className="text-2xl font-black text-sky-400 font-mono mt-1 block">
                      +${potentialEQIPGrant.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-500 mt-1 block">Average $25 / acre support</span>
                  </div>

                  <div className="bg-emerald-950/70 p-4 rounded-2xl border border-emerald-700/80">
                    <span className="text-[11px] text-emerald-300 block font-bold">Total Annual Benefit</span>
                    <span className="text-2xl font-black text-white font-mono mt-1 block">
                      ${totalValuePotential.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 mt-1 block">Vs Basic SaaS cost of ~${basicAnnualCost}/yr</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800 text-xs text-stone-300 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-200">Ready to unlock your farm's verified revenue?</span>
                    <p className="text-[11px] text-stone-400">Generate a Field Evidence Report or start with Basic Farm Intelligence.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('verification_report')}
                      className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
                    >
                      $99 Field Report
                    </button>
                    <button
                      onClick={() => onSelectPlan('Basic Plan')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs"
                    >
                      Start Basic Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Enterprise Sales Inquiry Drawer / Modal */}
        {showSalesModal && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-amber-600/60 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl relative">
              <button
                onClick={() => setShowSalesModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100">Enterprise Agronomic Briefing</h3>
                  <p className="text-xs text-stone-400">Tailored multi-facility Scope 3 &amp; ERP integration</p>
                </div>
              </div>

              {salesSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Thank you! An Enterprise Agronomic Account Director will contact you within 2 business hours.</span>
                </div>
              ) : (
                <form onSubmit={handleSalesSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      required
                      value={salesCompany}
                      onChange={(e) => setSalesCompany(e.target.value)}
                      placeholder="e.g. AgriGlobal Consumer Goods Corp"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Corporate Work Email</label>
                    <input
                      type="email"
                      required
                      value={salesEmail}
                      onChange={(e) => setSalesEmail(e.target.value)}
                      placeholder="marcus.vance@agriglobal.com"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 space-y-1">
                    <span className="font-bold text-stone-300">Enterprise SLA Package Includes:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                      <li>Automated SCIM / SAML SSO integration</li>
                      <li>Custom emission factors &amp; regional baseline models</li>
                      <li>Direct SAP / Oracle ERP &amp; John Deere Data Ops pipelines</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
                  >
                    Schedule Enterprise Consultation
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
