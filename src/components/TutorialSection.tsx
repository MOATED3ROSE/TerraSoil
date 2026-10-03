import React, { useState } from 'react';
import { 
  BookOpen, 
  Sprout, 
  MapPin, 
  Activity, 
  FileCheck2, 
  Calculator, 
  Globe2, 
  FileText, 
  Bot, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  Droplets, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Layers, 
  Compass, 
  DollarSign, 
  Scale, 
  Building2, 
  Users, 
  Tractor,
  Sliders,
  ExternalLink,
  ChevronRight,
  Info,
  StickyNote,
  AlertTriangle,
  Lock,
  Smartphone,
  Key,
  Laptop,
  FolderKanban,
  Clock,
  FileSpreadsheet,
  Award
} from 'lucide-react';

interface TutorialSectionProps {
  onNavigateTab: (tab: 'map' | 'satellite' | 'practices' | 'estimator' | 'geographic') => void;
  onOpenReportModal: () => void;
  onToggleAIAssistant: () => void;
  onOpenTerraSoilPdf?: () => void;
}

export const TutorialSection: React.FC<TutorialSectionProps> = ({
  onNavigateTab,
  onOpenReportModal,
  onToggleAIAssistant,
  onOpenTerraSoilPdf,
}) => {
  // Top-level category tab: 'platform' (Category A) or 'carbon_science' (Category B)
  const [activeCategory, setActiveCategory] = useState<'platform' | 'carbon_science'>('platform');

  // Sub-tabs for Category A (Platform Guide)
  const [activePlatformModule, setActivePlatformModule] = useState<string>('gis_mapping');

  // Interactive Simulator State for Category B (Soil Sponge Calculator)
  const [simAcres, setSimAcres] = useState<number>(500);
  const [simSocGainPct, setSimSocGainPct] = useState<number>(0.75);
  const [simCarbonPrice, setSimCarbonPrice] = useState<number>(30);

  // Calculations for Educational Simulator
  // 1% SOC increase holds ~27,000 gallons water per acre
  const simWaterGallonsStored = Math.round(simAcres * simSocGainPct * 27000);
  // ~20 MT CO2e sequestered per hectare per 1% SOC over top 30cm (approx 8.1 MT CO2e / acre / 1% SOC)
  const simTotalCO2eTons = Math.round(simAcres * simSocGainPct * 8.1);
  const simPotentialRevenue = Math.round(simTotalCO2eTons * simCarbonPrice);
  const simCarsOffset = Math.round(simTotalCO2eTons / 4.6); // Average passenger car emits ~4.6 MT CO2/yr

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950/40 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800/80 shadow-md">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Platform Knowledge Base &amp; Agronomic Science
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-100 tracking-tight leading-tight">
            Tutorial &amp; Master Guidance Portal
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Welcome to the comprehensive documentation center for <strong>TerraSoil MRV</strong>. Explore step-by-step user guides for all platform features, or dive into the biophysical science and carbon economics behind soil health measurement.
          </p>

          {/* Category Switcher Tabs */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveCategory('platform')}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition shadow-lg ${
                activeCategory === 'platform'
                  ? 'bg-emerald-600 text-white shadow-emerald-950/50 ring-2 ring-emerald-400/50'
                  : 'bg-stone-950 text-stone-300 hover:text-white border border-stone-800 hover:bg-stone-900'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-300" />
              <span>Category A: Platform Guide &amp; How to Use</span>
            </button>

            <button
              onClick={() => setActiveCategory('carbon_science')}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition shadow-lg ${
                activeCategory === 'carbon_science'
                  ? 'bg-emerald-600 text-white shadow-emerald-950/50 ring-2 ring-emerald-400/50'
                  : 'bg-stone-950 text-stone-300 hover:text-white border border-stone-800 hover:bg-stone-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Category B: What is a Carbon &amp; Soil-Management Portal?</span>
            </button>

            {onOpenTerraSoilPdf && (
              <button
                onClick={onOpenTerraSoilPdf}
                className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 bg-gradient-to-r from-emerald-950 to-stone-900 hover:from-emerald-900 text-emerald-300 border border-emerald-700/80 shadow-lg transition"
                title="Download complete TerraSoil AI specification, goals, and guardrails as PDF"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Download TerraSoil AI Whitepaper (PDF)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ================= CATEGORY A: THE SITE & HOW TO USE IT ================== */}
      {/* ========================================================================= */}
      {activeCategory === 'platform' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Quick Summary Banner */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-100 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-emerald-400" />
                  What the TerraSoil Platform Does
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  TerraSoil is an end-to-end MRV (Measurement, Reporting, and Verification) SaaS portal connecting satellite constellations with agronomic practice tracking.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="bg-stone-950 border border-stone-800 text-stone-300 px-3 py-1.5 rounded-xl font-mono">
                  7 Core Modules
                </span>
                <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 px-3 py-1.5 rounded-xl font-mono font-bold">
                  Audit-Ready
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="font-bold text-stone-100 text-sm">Draw &amp; Map Farm Boundaries</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Interactive GIS map with polygon drawing, GeoJSON export, and multi-layer satellite visualization (True Color, SOC %, Soil Moisture, Sentinel-2 NDVI).
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="font-bold text-stone-100 text-sm">Stream Satellite &amp; Hydrology Feeds</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Direct remote sensing telemetry pulling Sentinel-2 NDVI vegetation greenness curves and root-zone soil moisture with automated deficit alerts.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="font-bold text-stone-100 text-sm">Model Carbon &amp; Export Audits</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Quantify net metric tons CO₂e sequestered using USDA COMET-Farm and IPCC emission factors, then generate verified PDF compliance reports.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Module Walkthrough with Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Nav Menu */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-3 space-y-1 shadow-xl shrink-0">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-3 py-2 block">
                Platform Modules Guide
              </span>

              {[
                { id: 'gis_mapping', name: '1. Field GIS & Scouting Notes', icon: MapPin, color: 'text-emerald-400' },
                { id: 'satellite_telemetry', name: '2. Satellite & Hydrology', icon: Activity, color: 'text-cyan-400' },
                { id: 'historical_yield', name: '3. Multi-Year Yield Trends', icon: TrendingUp, color: 'text-emerald-300' },
                { id: 'practice_ledger', name: '4. Practice Activity Ledger', icon: FileCheck2, color: 'text-amber-400' },
                { id: 'carbon_estimator', name: '5. Carbon Estimator & ROI', icon: Calculator, color: 'text-emerald-400' },
                { id: 'geographic_soils', name: '6. Global Soil 4-Cats Map', icon: Globe2, color: 'text-sky-400' },
                { id: 'audit_reports', name: '7. Audit PDF & ESG Reports', icon: FileText, color: 'text-purple-400' },
                { id: 'ai_advisor', name: '8. Role-Tailored AI Advisor', icon: Bot, color: 'text-emerald-400' },
                { id: 'auth_security', name: '9. Auth, Roles & Security (PRD)', icon: Lock, color: 'text-amber-400' },
                { id: 'workspace_hub', name: '10. Personal Command Center', icon: FolderKanban, color: 'text-emerald-400' },
                { id: 'org_permissions_audit', name: '11. Org, Roles & Audit (PRD-12)', icon: Building2, color: 'text-emerald-400' },
              ].map((mod) => {
                const Icon = mod.icon;
                const isActive = activePlatformModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActivePlatformModule(mod.id)}
                    className={`w-full text-left p-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition ${
                      isActive
                        ? 'bg-stone-800 text-stone-100 shadow-md border border-stone-700 font-bold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${mod.color}`} />
                      <span className="truncate">{mod.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90 text-emerald-400' : 'text-stone-600'}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Detailed Module Explanations */}
            <div className="lg:col-span-3 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              {activePlatformModule === 'gis_mapping' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
                        <MapPin className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-stone-100">
                          Field GIS Mapping, Custom Zoom Controls &amp; Geotagged Scouting Notes
                        </h3>
                        <p className="text-xs text-stone-400">
                          Interactive high-resolution farm boundary GIS system.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('map')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Open Field Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        Boundary Drawing &amp; GeoJSON
                      </h4>
                      <p className="text-stone-300 leading-relaxed">
                        Click <strong>&quot;Draw Field Boundary&quot;</strong> in the top toolbar to plot polygon vertices around any parcel. The system dynamically computes surface acreage and links the coordinates to satellite feeds. You can export all farm parcels in standard GeoJSON format at any time.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        Color-Coded Layer Modes
                      </h4>
                      <p className="text-stone-300 leading-relaxed">
                        Toggle between 4 satellite views: <strong>True Color Imagery</strong>, <strong>Soil Organic Carbon (SOC %)</strong> tiers, <strong>Root-zone Moisture (VWC %)</strong>, and <strong>Sentinel-2 NDVI</strong> canopy vigor. Interactive legend allows filtering fields that match specific health ranges.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" />
                        Custom Zoom-to-Field Navigator
                      </h4>
                      <p className="text-stone-300 leading-relaxed">
                        The sidebar Field Navigator provides one-click zoom presets: <strong>&quot;Fit Bounds&quot;</strong> (fits parcel with border padding), <strong>&quot;Close-up (17x)&quot;</strong> for headland/furrow inspection, and <strong>&quot;Context (14x)&quot;</strong> for farm-level spatial awareness.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                        <StickyNote className="w-4 h-4" />
                        Geotagged Scouting Notes
                      </h4>
                      <p className="text-stone-300 leading-relaxed">
                        Drop pins on specific GPS coordinates on your farm to record qualitative field notes. Categorize by <strong>Soil Compaction</strong>, <strong>Weed Pressure</strong>, <strong>Water Ponding</strong>, <strong>Tile Drainage</strong>, or <strong>Cover Crop Emergence</strong>. All notes persist in your local records and can be inspected from the sidebar.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-sky-900/60 md:col-span-2 space-y-2">
                      <h4 className="font-bold text-sky-400 flex items-center gap-1.5">
                        <Droplets className="w-4 h-4" />
                        Live Weather &amp; 7-Day Precipitation Moisture Decision Overlay
                      </h4>
                      <p className="text-stone-300 leading-relaxed">
                        Overlays real-time local temperature and an interactive 7-day precipitation forecast histogram directly onto the Field Map. Computes cumulative rainfall volume, classifies soil trafficability (e.g. <em>Safe for Heavy Equipment</em> vs <em>High Runoff Risk</em>), and provides actionable agronomic advisories to prevent nitrogen leaching and compaction.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePlatformModule === 'satellite_telemetry' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
                        <Activity className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-stone-100">
                          Satellite Remote Sensing &amp; Soil Hydrology Telemetry
                        </h3>
                        <p className="text-xs text-stone-400">
                          High-resolution Sentinel-2 multispectral and soil moisture monitoring.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('satellite')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Open Satellite Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
                    <p>
                      The Satellite Dashboard ingests real-time and historical remote sensing data for the selected field:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <Activity className="w-4 h-4" />
                          NDVI Vegetation Index
                        </h4>
                        <p className="text-stone-400 leading-relaxed">
                          Normalized Difference Vegetation Index (NDVI) measures chlorophyll absorption in red light vs near-infrared reflectance. Values above <strong>0.75</strong> indicate vigorous biomass accumulation and active carbon fixation.
                        </p>
                      </div>

                      <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                        <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                          <Droplets className="w-4 h-4" />
                          Volumetric Water Content (VWC %)
                        </h4>
                        <p className="text-stone-400 leading-relaxed">
                          Tracks moisture in topsoil (0-10cm) and root-zone (10-40cm). When root-zone moisture drops below crop-specific thresholds (e.g. &lt;22% for corn), automated alerts notify the grower.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlatformModule === 'historical_yield' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
                        <TrendingUp className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-stone-100">
                          Multi-Year Historical Yield Estimation Trends
                        </h3>
                        <p className="text-xs text-stone-400">
                          Empirical yield correlation derived from 5+ seasons of Sentinel-2 NDVI.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('satellite')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>View Yield Chart</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3 text-xs text-stone-300">
                    <h4 className="font-bold text-emerald-400">How Multi-Year Inversion Works</h4>
                    <p className="leading-relaxed text-stone-400">
                      By calibrating peak seasonal NDVI curves with weather normalization and soil organic carbon stock accretion, TerraSoil reconstructs an empirical multi-year harvest yield curve:
                    </p>
                    <ul className="list-disc pl-5 text-stone-400 space-y-1.5">
                      <li><strong>Dual-Axis Correlation:</strong> Plots crop yield (bu/acre) against peak Sentinel-2 NDVI index on synchronized scales.</li>
                      <li><strong>Regional Baseline Benchmark:</strong> Displays county/state conventional averages to quantify your regenerative yield premium over time.</li>
                      <li><strong>Climate Resilience Verification:</strong> Highlights weather anomaly years (such as severe droughts) to show how higher SOC soil sponges maintained harvest yields while conventional tilled fields suffered yield collapse.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activePlatformModule === 'practice_ledger' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-amber-950 text-amber-400 rounded-xl border border-amber-800">
                        <FileCheck2 className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-stone-100">
                          Practice Activity Ledger &amp; Field Verification Logs
                        </h3>
                        <p className="text-xs text-stone-400">
                          Immutable record-keeping for regenerative agronomic interventions.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('practices')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <span>Open Ledger</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1.5">
                      <h4 className="font-bold text-emerald-400">5 Supported Practices</h4>
                      <p className="text-stone-400 leading-relaxed">
                        Log cover crops (single or multi-species), continuous no-till / strip-till, synthetic nitrogen reduction, rotational mob grazing, and compost / biochar amendments.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1.5">
                      <h4 className="font-bold text-amber-400">3-Tier Verification Status</h4>
                      <p className="text-stone-400 leading-relaxed">
                        Records carry verification badges: <strong>Self-Reported</strong>, <strong>Satellite Verified</strong> (cross-referenced with Sentinel-2 NDVI emergence), or <strong>Third-Party Certified</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePlatformModule === 'carbon_estimator' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
                        <Calculator className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-stone-100">
                          Carbon Sequestration Estimator &amp; Economic ROI
                        </h3>
                        <p className="text-xs text-stone-400">
                          Agronomic modeling with USDA COMET-Farm and IPCC emission factors.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('estimator')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Open Estimator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3 text-xs text-stone-300">
                    <p className="leading-relaxed text-stone-400">
                      The estimator aggregates all enrolled field practices, applies calibrated regional emission factors, deducts standard <strong>15% permanence buffer withholdings</strong>, and calculates:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold">Net CO₂e Sequestered</span>
                        <p className="text-lg font-bold text-emerald-400 font-mono mt-1">MT / Acre / Year</p>
                      </div>
                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold">Insetting Value</span>
                        <p className="text-lg font-bold text-amber-300 font-mono mt-1">$15 - $45 / Ton</p>
                      </div>
                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold">Water Capacity Gain</span>
                        <p className="text-lg font-bold text-cyan-400 font-mono mt-1">+27,000 gal / 1% SOC</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-800/80 space-y-2">
                      <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        5-Year Projected SOC Accretion Trajectory Chart
                      </h4>
                      <p className="text-stone-300 leading-relaxed">
                        Select any mapped field parcel to visualize its 5-year multi-temporal SOC buildup curve from <strong>Year 0 (Baseline) through Year 5</strong>. The interactive chart includes:
                      </p>
                      <ul className="list-disc pl-5 text-stone-400 space-y-1">
                        <li><strong>Regenerative vs Conventional (BAU):</strong> Direct visual comparison against conventional soil degradation baseline.</li>
                        <li><strong>90% Confidence Climate Envelope:</strong> Accounts for historical precipitation and temperature variability.</li>
                        <li><strong>Depth Stratification (0–15cm, 0–30cm, 0–60cm):</strong> Models active topsoil vs deep subsoil root exudate humification.</li>
                        <li><strong>Interactive Practice Stack Simulator:</strong> Toggle cover crops, continuous no-till, and compost/biochar inoculation to forecast accretion potential in real time.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activePlatformModule === 'geographic_soils' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-sky-950 text-sky-400 rounded-xl border border-sky-800">
                        <Globe2 className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-stone-100">
                          Geographic Category Map &amp; 4 Global Soil Classification Orders
                        </h3>
                        <p className="text-xs text-stone-400">
                          Global agricultural taxonomy across 4 categories and soil characteristics.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('geographic')}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Open Geographic Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-stone-300">
                    <p className="text-stone-400">
                      The Geographic Category Map organizes agricultural locations into <strong>4 distinct geographic dimensions</strong>: Continent, Nation/Country, Compass Direction (North, South, East, West), and Cost of Living. It features an interactive dynamic legend explaining the 4 major soil orders:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-stone-950 p-3 rounded-xl border border-emerald-900/50">
                        <span className="text-emerald-400 font-bold block mb-1">1. Mollisols &amp; Chernozems</span>
                        <p className="text-[11px] text-stone-400">Deep, dark, organic-rich grassland soils. High CEC, prime carbon accumulation potential (0.35 - 0.58 MT CO₂e/ac/yr).</p>
                      </div>

                      <div className="bg-stone-950 p-3 rounded-xl border border-sky-900/50">
                        <span className="text-sky-400 font-bold block mb-1">2. Vertisols &amp; Fluvisols</span>
                        <p className="text-[11px] text-stone-400">Heavy smectite shrinking/swelling clays and alluvial floodplains. High water holding capacity, moisture-retentive.</p>
                      </div>

                      <div className="bg-stone-950 p-3 rounded-xl border border-amber-900/50">
                        <span className="text-amber-400 font-bold block mb-1">3. Andisols (Volcanic Ash)</span>
                        <p className="text-[11px] text-stone-400">Volcanic soils rich in allophane. Exceptionally high carbon stabilization capacity through organo-mineral complexes.</p>
                      </div>

                      <div className="bg-stone-950 p-3 rounded-xl border border-rose-900/50">
                        <span className="text-rose-400 font-bold block mb-1">4. Oxisols &amp; Alfisols</span>
                        <p className="text-[11px] text-stone-400">Weathered tropical and temperate forest soils. Require continuous living roots and cover crops to prevent rapid organic matter turnover.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlatformModule === 'audit_reports' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-purple-950 text-purple-400 rounded-xl border border-purple-800">
                        <FileText className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-stone-100">
                          Audit-Ready PDF Export &amp; ESG Compliance Reporting
                        </h3>
                        <p className="text-xs text-stone-400">
                          One-click export of verified farm carbon dossiers.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onOpenReportModal}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Open Report Modal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3 text-xs text-stone-300">
                    <p className="leading-relaxed text-stone-400">
                      Designed to satisfy third-party carbon registries (Verra, Climate Action Reserve), corporate Scope 3 ESG auditors, and federal conservation grant managers (USDA EQIP/CSP):
                    </p>
                    <ul className="list-disc pl-5 text-stone-400 space-y-1.5">
                      <li><strong>Complete Practice Provenance:</strong> Includes dates, GPS coordinates, equipment logs, and acreage.</li>
                      <li><strong>Satellite Confirmation Data:</strong> Attaches Sentinel-2 NDVI emergence curves and moisture indices.</li>
                      <li><strong>Methodology Declarations:</strong> Full documentation of COMET-Farm emission factors, permanence buffers, and additionality scores.</li>
                      <li><strong>Branded Export:</strong> Generates tamper-evident PDFs with customizable agronomist headers.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activePlatformModule === 'ai_advisor' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
                        <Bot className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-stone-100">
                          Role-Tailored On-Site AI Agronomic Advisor
                        </h3>
                        <p className="text-xs text-stone-400">
                          In-app assistant dynamically adapting to Farmer, Consultant, or Corporate roles.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onToggleAIAssistant}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Launch AI Advisor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-stone-300">
                    <p className="text-stone-400 leading-relaxed">
                      Click the <strong>&quot;AI Advisor&quot;</strong> button in the navigation bar at any time to open the embedded assistant. The assistant automatically recognizes your active persona:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                        <span className="text-emerald-400 font-bold block mb-1">Farmer / Grower</span>
                        <p className="text-[11px] text-stone-400">Provides plain-language answers, grant readiness tips, and practice ROI.</p>
                      </div>
                      <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                        <span className="text-cyan-400 font-bold block mb-1">Agronomist / Consultant</span>
                        <p className="text-[11px] text-stone-400">Focuses on multi-client farm management, branded PDF dossiers, and professional plans.</p>
                      </div>
                      <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                        <span className="text-purple-400 font-bold block mb-1">Corporate Scope 3</span>
                        <p className="text-[11px] text-stone-400">Focuses on Scope 3 supply chain greenhouse gas accounting, ESG compliance, and data integrity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 9: AUTHENTICATION, ROLES & SECURITY */}
              {activePlatformModule === 'auth_security' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-400" />
                      Authentication, Multi-Role Onboarding &amp; Security Architecture
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Enterprise authentication and zero-trust security infrastructure governing access across the 4 primary PRD roles.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4" />
                        Email or Mobile Phone Sign-In
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Flexible sign-in supporting either corporate work email or direct agricultural mobile number. Validates formats in real time with SMS OTP or master password verification.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        Four Pre-Configured Roles (PRD-02–05)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Tailored onboarding flows for <strong>Farmer / Grower (PRD-02)</strong>, <strong>Agronomist / Consultant (PRD-03)</strong>, <strong>Corporate Scope 3 (PRD-04)</strong>, and <strong>Auditor / Verifier (PRD-05)</strong> with customized operational scale questions.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Key className="w-4 h-4" />
                        Multi-Factor Authentication (MFA)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Supports Time-Based One-Time Passwords (TOTP via Google Authenticator, 1Password, Duo) and SMS verification codes. Includes 8 one-time emergency backup recovery codes for device loss contingencies.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-purple-400 flex items-center gap-1.5">
                        <Laptop className="w-4 h-4" />
                        Session Management &amp; Remote Revocation
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Full visibility into connected desktop, tablet, and mobile devices with IP geolocation, browser telemetry, and instant one-click remote session revocation to mitigate compromised credentials.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 10: USER PROFILE & PERSONAL COMMAND CENTER */}
              {activePlatformModule === 'workspace_hub' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                      <FolderKanban className="w-5 h-5 text-emerald-400" />
                      User Profile &amp; Personal Workspace — The &quot;Personal Command Center&quot;
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      A central working hub returning users to their active daily workflows, impact metrics, and evidence library.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Activity Journal (P0)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Records meaningful actions in plain language grouped by day (&quot;what did I do?&quot; vs. data audit logs), linking directly to field updates, soil sample records, and generated compliance reports.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4" />
                        Evidence Library (P0)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Surfaces all soil tests, fertilizer invoices, ground truth photographs, and satellite proofs organized across 8 categories with SHA-256 cryptographic verification checksums.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                        <FolderKanban className="w-4 h-4" />
                        Projects &amp; Project Diary (P1)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Enrolled acreage cards with completion progress percentages, upcoming task alerts, and an expandable chronological milestone diary.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-purple-400 flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        My Impact &amp; Professional Identity (P1/P2)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Role-dependent real counters (acres, infiltration gallons, tCO₂e tracked, verified insets) and accredited credentials, specializations, and registry licensing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 11: ORGANIZATION, PERMISSIONS & AUDIT LOG (PRD-12) */}
              {activePlatformModule === 'org_permissions_audit' && (
                <div className="space-y-4">
                  <div className="border-b border-stone-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      Organization, Concrete Permissions &amp; System Audit Log (PRD-12)
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Multi-user organization hierarchy, concrete 5-role permission table, and the immutable system-of-record audit trail.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        Hierarchical Account Architecture (P0)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Extends the schema with an explicit multi-user, multi-farm structure: <strong>Organization &rarr; Users &rarr; Farms &rarr; Fields &rarr; Projects &rarr; Data</strong>. Powers commercial seat allocation and multi-consultant teams.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        5-Role Concrete Permission Table (P0)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Rigorous permission matrix across Owner, Agronomist, Farmer, Corporate Scope 3, and Auditor. Enforces granular rules like billing management, evidence submission, and report generation.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Lock className="w-4 h-4" />
                        The Auditor Restriction Rule (PRD §3)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Data integrity demands that verification is strictly decoupled from data modification. Auditors can inspect records, review documents, and issue verification seals, but are <strong>structurally prevented</strong> from altering baseline measurements.
                      </p>
                    </div>

                    <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <h4 className="font-bold text-purple-400 flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4" />
                        System-of-Record Audit Log (P0)
                      </h4>
                      <p className="text-stone-400 leading-relaxed">
                        Answers &quot;what happened to the data?&quot; with an immutable audit log detailing user, previous/new values, justification, supporting document attachment, IP address, and SHA-256 Merkle root.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4-Step Rapid Onboarding Checklist */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              10-Minute Rapid Onboarding Workflow
            </h3>
            <p className="text-xs text-stone-400">
              Follow these four steps to take any farm from initial boundary mapping to an audit-ready carbon verification report.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="bg-emerald-950 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold font-mono">
                  Step 1
                </span>
                <h4 className="font-bold text-stone-200 text-sm">Select Operation &amp; Map Parcel</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Choose your farm in the top navbar or draw new field boundaries using the GIS map tool.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="bg-cyan-950 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-bold font-mono">
                  Step 2
                </span>
                <h4 className="font-bold text-stone-200 text-sm">Inspect Satellite Telemetry</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Examine seasonal Sentinel-2 NDVI greenness curves and root-zone moisture hydration buffers.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="bg-amber-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold font-mono">
                  Step 3
                </span>
                <h4 className="font-bold text-stone-200 text-sm">Log Regenerative Practices</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Record cover crop seedings, no-till acreage, or nitrogen cuts in the Practice Activity Ledger.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <span className="bg-purple-950 text-purple-400 text-xs px-2 py-0.5 rounded-full font-bold font-mono">
                  Step 4
                </span>
                <h4 className="font-bold text-stone-200 text-sm">Generate Audit Report</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Click Audit Report Export to generate an audit-ready compliance PDF for buyers or grant programs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= CATEGORY B: WHAT IS THIS PORTAL? ====================== */}
      {/* ========================================================================= */}
      {activeCategory === 'carbon_science' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Deep Domain Explanation Banner */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 bg-amber-950 text-amber-400 rounded-lg border border-amber-800">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  The Science, Economics, and Global Need
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100">
                What is a &quot;Carbon &amp; Soil-Management Tracking Portal&quot;?
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1 leading-relaxed">
                Agriculture sits at the unique intersection of climate impact and climate solution. A Carbon &amp; Soil-Management Tracking Portal is the digital bridge that converts invisible biological soil carbon into quantifiable, audit-ready financial and environmental assets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs leading-relaxed text-stone-300">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  1. What is Soil Organic Carbon (SOC)?
                </h3>
                <p className="text-stone-400">
                  Soil Organic Carbon (SOC) is the carbon component of Soil Organic Matter (SOM), making up roughly <strong>58%</strong> of all organic matter in the soil. It is created through plant photosynthesis: crops pull carbon dioxide (CO₂) from the atmosphere and pump liquid carbon exudates through their roots to feed subterranean mycorrhizal fungi and microbial bacteria.
                </p>
                <p className="text-stone-400">
                  When roots and microbial residues die, they bond to silt and clay mineral surfaces, forming <strong>Mineral-Associated Organic Matter (MAOM)</strong>. Unlike aboveground plant matter that decomposes rapidly, mineral-associated soil carbon can remain safely sequestered underground for decades or centuries.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  2. Why Soil Carbon is the Ultimate Farm Insurance
                </h3>
                <p className="text-stone-400">
                  Beyond climate mitigation, soil carbon is the single most critical determinant of farm profitability and drought resilience:
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-stone-400">
                  <li><strong>The Water Holding Capacity Multiplier:</strong> According to NRCS research, every <strong>1% increase in SOC</strong> enables an acre of topsoil to store an extra <strong>20,000 to 27,000 gallons of plant-available water</strong>.</li>
                  <li><strong>Fertilizer Efficiency:</strong> High-SOC soils have superior Cation Exchange Capacity (CEC), locking in nitrogen, potassium, and phosphorus to prevent expensive runoff.</li>
                  <li><strong>Erosion Immunity:</strong> Fungal glomalin aggregates soil particles into water-stable crumbs, halting wind and water erosion.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Educational Soil Sponge Calculator */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950/30 border border-emerald-800/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
                    <Sliders className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Interactive Educational Simulator
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-100">
                  The &quot;Soil Sponge&quot; &amp; Carbon Sequestration Value Calculator
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Simulate how adopting regenerative practices changes water storage, carbon storage, and insetting value across your acreage.
                </p>
              </div>
              <span className="bg-stone-950 border border-stone-800 text-emerald-400 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                NRCS Agronomic Model
              </span>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Acreage Slider */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-semibold">Enrolled Land Area:</span>
                  <span className="font-mono text-emerald-400 font-bold">{simAcres.toLocaleString()} Acres</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={simAcres}
                  onChange={(e) => setSimAcres(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>50 ac</span>
                  <span>1,500 ac</span>
                  <span>3,000 ac</span>
                </div>
              </div>

              {/* Target SOC Increase Slider */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-semibold">Target 5-Yr SOC Accretion:</span>
                  <span className="font-mono text-cyan-400 font-bold">+{simSocGainPct.toFixed(2)}% SOC</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="2.0"
                  step="0.05"
                  value={simSocGainPct}
                  onChange={(e) => setSimSocGainPct(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>+0.25%</span>
                  <span>+1.00%</span>
                  <span>+2.00%</span>
                </div>
              </div>

              {/* Carbon Credit / Insetting Price Slider */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-semibold">Carbon Price Benchmark:</span>
                  <span className="font-mono text-amber-400 font-bold">${simCarbonPrice} / MT CO₂e</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={simCarbonPrice}
                  onChange={(e) => setSimCarbonPrice(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>$15/t (Base)</span>
                  <span>$35/t (Corporate)</span>
                  <span>$60/t (Premium)</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                  Additional Water Holding Capacity
                </span>
                <p className="text-2xl font-black text-cyan-400 font-mono">
                  +{simWaterGallonsStored.toLocaleString()}
                </p>
                <span className="text-[11px] text-stone-400 block">
                  Gallons of rain stored against summer heat waves
                </span>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                  Atmospheric CO₂ Removed
                </span>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  {simTotalCO2eTons.toLocaleString()} MT
                </p>
                <span className="text-[11px] text-stone-400 block">
                  Total metric tons CO₂ equivalent fixed in root zone
                </span>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                  Potential Supply Chain Revenue
                </span>
                <p className="text-2xl font-black text-amber-300 font-mono">
                  ${simPotentialRevenue.toLocaleString()}
                </p>
                <span className="text-[11px] text-stone-400 block">
                  Cumulative insetting value across rotation
                </span>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                  Equivalent Emissions Offset
                </span>
                <p className="text-2xl font-black text-purple-400 font-mono">
                  {simCarsOffset.toLocaleString()} Cars
                </p>
                <span className="text-[11px] text-stone-400 block">
                  Passenger vehicles removed from road annually
                </span>
              </div>
            </div>
          </div>

          {/* Key Topics in Soil Carbon & Policy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carbon Insetting vs Offsetting */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Carbon Insetting (Scope 3) vs. Offsetting
                </h3>
              </div>
              <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
                <p>
                  <strong>Carbon Offsetting:</strong> An entity buys carbon credits from unrelated projects outside their supply chain (e.g. buying rainforest credits in South America). This faces mounting scrutiny for questionable additionality and greenwashing.
                </p>
                <p>
                  <strong>Carbon Insetting (Scope 3):</strong> Food brands (General Mills, Nestlé, PepsiCo, Danone) pay farmers <em>within their actual agricultural supply shed</em> to adopt regenerative practices. The carbon reduction remains inside the food chain, directly satisfying corporate Scope 3 GHG reduction mandates.
                </p>
                <p className="text-emerald-400 font-semibold">
                  TerraSoil is specifically engineered for insetting verification.
                </p>
              </div>
            </div>

            {/* Hybrid MRV Methodology */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-stone-100">
                  What is &quot;Hybrid MRV&quot; (Measurement, Reporting, Verification)?
                </h3>
              </div>
              <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
                <p>
                  Historically, measuring soil carbon required pulling thousands of physical soil cores with truck-mounted probes, costing up to $50/acre and eroding farm profits.
                </p>
                <p>
                  <strong>Hybrid MRV</strong> solves this bottleneck by uniting three layers:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-stone-400">
                  <li><strong>Stratified Ground Truth:</strong> Targeted physical samples establishing baseline soil taxonomy.</li>
                  <li><strong>Sentinel-2 Satellite Telemetry:</strong> Continuous 10-meter resolution multi-spectral vegetation indices tracking emergence and biomass.</li>
                  <li><strong>Calibrated Process Models:</strong> USDA COMET-Farm and DayCent biophysical algorithms modeling decomposition and carbon mineralization.</li>
                </ol>
              </div>
            </div>

            {/* Federal Grants & Financial Subsidies */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Federal Conservation Grants &amp; Subsidies
                </h3>
              </div>
              <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
                <p>
                  Farmers using TerraSoil reports can qualify for multiple funding streams:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-stone-400">
                  <li><strong>USDA NRCS EQIP:</strong> Environmental Quality Incentives Program pays $40 - $75/acre cost-share for cover crops.</li>
                  <li><strong>USDA CSP:</strong> Conservation Stewardship Program provides multi-year contracts for comprehensive soil management.</li>
                  <li><strong>Crop Insurance Rebates:</strong> Iowa, Illinois, and Indiana provide $5/acre premium discounts for verified cover-cropped acreage.</li>
                </ul>
              </div>
            </div>

            {/* Guardrails and Transparency */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Platform Guardrails &amp; Scientific Caveats
                </h3>
              </div>
              <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
                <p>
                  To maintain rigorous integrity, TerraSoil operates under explicit guardrails:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-stone-400">
                  <li><strong>Estimates, Not Certified Fact:</strong> Platform carbon numbers are model estimates based on recognized emission factors, not certified credits. Official registry issuance requires third-party verifier sign-off.</li>
                  <li><strong>No Replacement for Local Agronomists:</strong> TerraSoil provides data transparency, but management prescriptions should always involve your certified local crop advisor.</li>
                  <li><strong>Permanence Buffers:</strong> All projections deduct a standard 15% permanence buffer to safeguard against unforeseen tillage reversals.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
