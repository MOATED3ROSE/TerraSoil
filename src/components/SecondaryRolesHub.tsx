import React, { useState } from 'react';
import { 
  Farm, 
  Field, 
  EmissionFactorConfig, 
  ExtendedRoleType, 
  FarmStakeholder, 
  FieldSamplingTask, 
  DirectLabUploadRecord, 
  CommodityProcurementScorecard, 
  SustainabilityGrantProgram, 
  GrantApplicationItem, 
  SystemIntegrationStatus, 
  MethodologyLibraryVersion 
} from '../types';
import { 
  Users, 
  UserCheck, 
  Smartphone, 
  FlaskConical, 
  ShoppingBag, 
  Landmark, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  FileText, 
  Upload, 
  Camera, 
  MapPin, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Cpu, 
  Server, 
  RefreshCw, 
  Award, 
  Check, 
  X, 
  Download, 
  Eye, 
  Sliders, 
  Filter, 
  Sparkles, 
  Layers,
  ChevronRight,
  Clock,
  HelpCircle,
  BarChart2
} from 'lucide-react';

interface SecondaryRolesHubProps {
  currentFarm: Farm;
  farms: Farm[];
  onSelectFarm: (farm: Farm) => void;
  onOpenReportModal?: () => void;
  onOpenPricingModal?: () => void;
  onOpenLineageModal?: (field: Field) => void;
  config?: EmissionFactorConfig;
}

export const SecondaryRolesHub: React.FC<SecondaryRolesHubProps> = ({
  currentFarm,
  farms,
  onSelectFarm,
  onOpenReportModal,
  onOpenPricingModal,
  onOpenLineageModal,
  config,
}) => {
  // Sub-role switcher for all 6 secondary & extended roles
  const [activeRole, setActiveRole] = useState<ExtendedRoleType>('landowner_manager');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // =========================================================
  // 1. LANDOWNER / FARM MANAGER STATE (§2)
  // =========================================================
  const [stakeholders, setStakeholders] = useState<FarmStakeholder[]>([
    {
      id: 'stk-1',
      name: 'Eleanor Vance Trust (Landowner)',
      email: 'eleanor.vance@trustholding.com',
      role: 'owner',
      ownershipSharePct: 70,
      permissionScope: 'financial_reports',
      linkedFieldIds: currentFarm.fields.map(f => f.id),
      lastActive: '2026-10-01'
    },
    {
      id: 'stk-2',
      name: 'Sarah Jenkins (Tenant Farm Operator)',
      email: 'sarah.jenkins@prairiehorizon.ag',
      role: 'tenant_farmer',
      ownershipSharePct: 30,
      permissionScope: 'full_management',
      linkedFieldIds: currentFarm.fields.map(f => f.id),
      lastActive: '2026-10-02'
    },
    {
      id: 'stk-3',
      name: 'Midwest Ag Property Management LLC',
      email: 'ops@midwestagmanagement.com',
      role: 'land_manager',
      ownershipSharePct: 0,
      permissionScope: 'view_only',
      linkedFieldIds: [currentFarm.fields[0]?.id || 'f1'],
      lastActive: '2026-09-28'
    }
  ]);

  const [newStkName, setNewStkName] = useState('');
  const [newStkEmail, setNewStkEmail] = useState('');
  const [newStkRole, setNewStkRole] = useState<'owner' | 'operator' | 'tenant_farmer' | 'land_manager'>('tenant_farmer');
  const [newStkScope, setNewStkScope] = useState<'view_only' | 'full_management' | 'financial_reports'>('view_only');
  const [newStkShare, setNewStkShare] = useState<number>(0);
  const [showAddStkModal, setShowAddStkModal] = useState(false);

  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStkName.trim()) return;
    const newStk: FarmStakeholder = {
      id: `stk-${Date.now().toString().slice(-4)}`,
      name: newStkName,
      email: newStkEmail,
      role: newStkRole,
      ownershipSharePct: newStkShare,
      permissionScope: newStkScope,
      linkedFieldIds: currentFarm.fields.map(f => f.id),
      lastActive: 'Just now'
    };
    setStakeholders([...stakeholders, newStk]);
    setShowAddStkModal(false);
    setNewStkName('');
    setNewStkEmail('');
    showToast(`Added ${newStkName} as ${newStkRole.replace('_', ' ').toUpperCase()} with ${newStkScope} scope!`);
  };

  // =========================================================
  // 2. FIELD TECHNICIAN TASK QUEUE STATE (§3)
  // =========================================================
  const [tasks, setTasks] = useState<FieldSamplingTask[]>([
    {
      id: 'tsk-201',
      fieldId: currentFarm.fields[0]?.id || 'f1',
      fieldName: currentFarm.fields[0]?.name || 'North Meadow',
      farmName: currentFarm.name,
      taskType: 'soil_core',
      status: 'in_progress',
      dueDate: '2026-10-15',
      assignedTechnician: 'Tyler Brooks (Field Scout #04)',
      gpsCoordinates: [42.062, -93.582],
      photoEvidenceCount: 3,
      notes: 'Take 12 composite cores across Zone A and Zone B at 0-10cm and 10-30cm depths.'
    },
    {
      id: 'tsk-202',
      fieldId: currentFarm.fields[1]?.id || 'f2',
      fieldName: currentFarm.fields[1]?.name || 'South 40 Bottomlands',
      farmName: currentFarm.name,
      taskType: 'canopy_photo',
      status: 'pending',
      dueDate: '2026-10-20',
      assignedTechnician: 'Tyler Brooks (Field Scout #04)',
      gpsCoordinates: [42.058, -93.575],
      photoEvidenceCount: 0,
      notes: 'Geotagged ground photographic survey to verify winter rye cover crop emergence before frost.'
    },
    {
      id: 'tsk-203',
      fieldId: currentFarm.fields[0]?.id || 'f1',
      fieldName: currentFarm.fields[0]?.name || 'North Meadow',
      farmName: currentFarm.name,
      taskType: 'gps_boundary_survey',
      status: 'completed',
      dueDate: '2026-09-25',
      assignedTechnician: 'Marcus Vance, CCA',
      gpsCoordinates: [42.061, -93.580],
      photoEvidenceCount: 5,
      completedAt: '2026-09-24',
      notes: 'RTK GPS boundary survey completed; polygon perimeter aligned with waterway buffers.'
    }
  ]);

  const [taskPhotoUploading, setTaskPhotoUploading] = useState<string | null>(null);

  const handleSimulatePhotoUpload = (taskId: string) => {
    setTaskPhotoUploading(taskId);
    setTimeout(() => {
      setTasks(tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            photoEvidenceCount: t.photoEvidenceCount + 1,
            status: 'completed',
            completedAt: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      }));
      setTaskPhotoUploading(null);
      showToast('Uploaded geotagged in-situ photo evidence with GPS coordinates!');
    }, 1200);
  };

  // =========================================================
  // 3. SOIL LABORATORY INTEGRATION STATE (§4)
  // =========================================================
  const [labUploads, setLabUploads] = useState<DirectLabUploadRecord[]>([
    {
      id: 'lab-901',
      labName: 'Midwest Laboratories Inc. (Omaha, NE)',
      labAccreditation: 'ISO/IEC 17025:2017 & NAPT Certified',
      labSampleId: 'ML-2026-884920',
      fieldId: currentFarm.fields[0]?.id || 'f1',
      fieldName: currentFarm.fields[0]?.name || 'North Meadow',
      farmName: currentFarm.name,
      sampleDepthRange: '0-10 cm',
      socConcentrationPct: 2.34,
      bulkDensityGcm3: 1.32,
      lecoMethodology: 'LECO C832 High-Temperature Dry Combustion',
      qaQcDuplicateVariancePct: 0.84,
      uploadedAt: '2026-10-01 14:22 UTC',
      status: 'ingested'
    },
    {
      id: 'lab-902',
      labName: 'Midwest Laboratories Inc. (Omaha, NE)',
      labAccreditation: 'ISO/IEC 17025:2017 & NAPT Certified',
      labSampleId: 'ML-2026-884921',
      fieldId: currentFarm.fields[0]?.id || 'f1',
      fieldName: currentFarm.fields[0]?.name || 'North Meadow',
      farmName: currentFarm.name,
      sampleDepthRange: '10-30 cm',
      socConcentrationPct: 1.88,
      bulkDensityGcm3: 1.41,
      lecoMethodology: 'LECO C832 High-Temperature Dry Combustion',
      qaQcDuplicateVariancePct: 1.12,
      uploadedAt: '2026-10-01 14:22 UTC',
      status: 'ingested'
    }
  ]);

  const [newLabSampleId, setNewLabSampleId] = useState('');
  const [newLabSoc, setNewLabSoc] = useState(2.45);
  const [newLabBulkDensity, setNewLabBulkDensity] = useState(1.30);
  const [newLabDepth, setNewLabDepth] = useState<'0-10 cm' | '10-30 cm' | '30-60 cm'>('0-10 cm');

  const handleSimulateLabUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const newUpload: DirectLabUploadRecord = {
      id: `lab-${Date.now().toString().slice(-4)}`,
      labName: 'Midwest Laboratories Inc.',
      labAccreditation: 'ISO 17025 Accredited',
      labSampleId: newLabSampleId || `ML-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      fieldId: currentFarm.fields[0]?.id || 'f1',
      fieldName: currentFarm.fields[0]?.name || 'Selected Field',
      farmName: currentFarm.name,
      sampleDepthRange: newLabDepth,
      socConcentrationPct: Number(newLabSoc),
      bulkDensityGcm3: Number(newLabBulkDensity),
      lecoMethodology: 'LECO High-Temperature Dry Combustion Analyzer',
      qaQcDuplicateVariancePct: 0.72,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      status: 'ingested'
    };
    setLabUploads([newUpload, ...labUploads]);
    setNewLabSampleId('');
    showToast(`Ingested Soil Assay #${newUpload.labSampleId} directly into field SOC stock record!`);
  };

  // =========================================================
  // 4. BUYER / PROCESSOR PROCUREMENT STATE (§5)
  // =========================================================
  const [procurementScorecards] = useState<CommodityProcurementScorecard[]>([
    {
      id: 'proc-1',
      commodity: 'Corn',
      region: 'Iowa Sourcing Basin (Des Moines River)',
      purchasedVolumeTons: 145000,
      carbonIntensityKgCO2ePerKg: 0.32,
      conventionalBenchmarkKgCO2e: 0.62,
      lowCarbonPremiumUSD: 0.18,
      anonymizedSupplierCount: 24,
      tier1PrimarySharePct: 92
    },
    {
      id: 'proc-2',
      commodity: 'Soybeans',
      region: 'Illinois River Corridor',
      purchasedVolumeTons: 88000,
      carbonIntensityKgCO2ePerKg: 0.38,
      conventionalBenchmarkKgCO2e: 0.74,
      lowCarbonPremiumUSD: 0.24,
      anonymizedSupplierCount: 18,
      tier1PrimarySharePct: 84
    },
    {
      id: 'proc-3',
      commodity: 'Wheat',
      region: 'Delta & Lower Mississippi Basin',
      purchasedVolumeTons: 62000,
      carbonIntensityKgCO2ePerKg: 0.54,
      conventionalBenchmarkKgCO2e: 0.88,
      lowCarbonPremiumUSD: 0.15,
      anonymizedSupplierCount: 14,
      tier1PrimarySharePct: 61
    },
    {
      id: 'proc-4',
      commodity: 'Canola',
      region: 'Red River Valley / Northern Plains',
      purchasedVolumeTons: 41000,
      carbonIntensityKgCO2ePerKg: 0.68,
      conventionalBenchmarkKgCO2e: 0.95,
      lowCarbonPremiumUSD: 0.12,
      anonymizedSupplierCount: 9,
      tier1PrimarySharePct: 43
    }
  ]);

  // =========================================================
  // 5. PROGRAM / NGO / GRANT ADMINISTRATOR STATE (§6)
  // =========================================================
  const [grantPrograms] = useState<SustainabilityGrantProgram[]>([
    {
      id: 'prog-eqip-2026',
      name: 'USDA NRCS Environmental Quality Incentives Program (EQIP)',
      fundingAgency: 'USDA Natural Resources Conservation Service',
      totalFundingUSD: 2500000,
      disbursedFundingUSD: 1680000,
      enrolledFarmsCount: 38,
      eligiblePractices: ['Winter Cover Cropping (Code 340)', 'Residue Management No-Till (Code 329)', 'Nutrient Management 4R (Code 590)'],
      incentiveRatePerAcreUSD: 45.00,
      applicationsPendingReview: 4,
      applicationDeadline: '2026-11-30'
    },
    {
      id: 'prog-state-soil-2026',
      name: 'State Regenerative Soil Health Cost-Share Accord',
      fundingAgency: 'Department of Agriculture & Land Stewardship',
      totalFundingUSD: 1200000,
      disbursedFundingUSD: 790000,
      enrolledFarmsCount: 22,
      eligiblePractices: ['Multi-Species Cover Crop', 'Rotational Grazing Fencing'],
      incentiveRatePerAcreUSD: 30.00,
      applicationsPendingReview: 2,
      applicationDeadline: '2026-12-15'
    }
  ]);

  const [grantApplications, setGrantApplications] = useState<GrantApplicationItem[]>([
    {
      id: 'app-501',
      programId: 'prog-eqip-2026',
      farmName: 'Prairie Horizon Ag (Lot 4)',
      applicantName: 'Sarah Jenkins',
      requestedFundingUSD: 18450,
      acreageEnrolled: 410,
      practicesProposed: ['Winter Rye Cover Crop', 'No-Till Drill Seeding'],
      status: 'submitted',
      submittedDate: '2026-09-29',
      carbonReductionPotentialMT: 144.3
    },
    {
      id: 'app-502',
      programId: 'prog-eqip-2026',
      farmName: 'Rolling Hills Grain LLC',
      applicantName: 'David Miller',
      requestedFundingUSD: 24750,
      acreageEnrolled: 550,
      practicesProposed: ['4R Variable Rate Nitrogen Side-Dress'],
      status: 'under_review',
      submittedDate: '2026-09-22',
      carbonReductionPotentialMT: 198.0
    },
    {
      id: 'app-503',
      programId: 'prog-state-soil-2026',
      farmName: 'Cedar River Organic Basin',
      applicantName: 'Hannah Larson',
      requestedFundingUSD: 9600,
      acreageEnrolled: 320,
      practicesProposed: ['Multi-Species Legume Grass Cover'],
      status: 'approved',
      submittedDate: '2026-09-10',
      carbonReductionPotentialMT: 112.0
    }
  ]);

  const handleGrantDecision = (appId: string, decision: 'approved' | 'rejected') => {
    setGrantApplications(grantApplications.map(a => {
      if (a.id === appId) {
        return { ...a, status: decision };
      }
      return a;
    }));
    showToast(`Application #${appId.toUpperCase()} has been ${decision.toUpperCase()}! Notification sent to grower.`);
  };

  // =========================================================
  // 6. PLATFORM ADMINISTRATOR STATE (§7, P0)
  // =========================================================
  const [integrations] = useState<SystemIntegrationStatus[]>([
    {
      id: 'int-1',
      name: 'ESA Copernicus Sentinel-2 MSI L2A API',
      category: 'satellite',
      endpoint: 'https://dataspace.copernicus.eu/api/v1',
      latencyMs: 142,
      status: 'operational',
      lastSyncTime: '2026-10-02 12:15 UTC',
      errorRatePct: 0.02
    },
    {
      id: 'int-2',
      name: 'Open-Meteo High-Resolution Agro Weather API',
      category: 'weather',
      endpoint: 'https://archive-api.open-meteo.com/v1/archive',
      latencyMs: 88,
      status: 'operational',
      lastSyncTime: '2026-10-02 12:18 UTC',
      errorRatePct: 0.00
    },
    {
      id: 'int-3',
      name: 'USDA NRCS SSURGO Soil Database WFS',
      category: 'soil_database',
      endpoint: 'https://sdmdataaccess.nrcs.usda.gov/Spatial/SDMWFS.wfs',
      latencyMs: 215,
      status: 'operational',
      lastSyncTime: '2026-10-02 11:30 UTC',
      errorRatePct: 0.04
    },
    {
      id: 'int-4',
      name: 'Stripe Billing & Subscription Webhooks',
      category: 'payment_billing',
      endpoint: 'https://api.stripe.com/v1',
      latencyMs: 65,
      status: 'operational',
      lastSyncTime: '2026-10-02 12:20 UTC',
      errorRatePct: 0.00
    }
  ]);

  const [methodologies] = useState<MethodologyLibraryVersion[]>([
    {
      id: 'm-1',
      name: 'USDA COMET-Farm Tier 2 Carbon Engine',
      version: 'v2.4.1 (2026 Refinement)',
      releaseDate: '2026-03-15',
      standard: 'USDA / Colorado State University DayCent',
      activeImplementationsCount: 142,
      isCurrentDefault: true,
      notes: 'Calibrated for Corn Belt mollisols and fine-loamy textures.'
    },
    {
      id: 'm-2',
      name: 'GHG Protocol Land Sector and Removals (LSR)',
      version: 'v1.6_Draft_Final',
      releaseDate: '2025-11-20',
      standard: 'WRI / WBCSD GHG Protocol',
      activeImplementationsCount: 89,
      isCurrentDefault: true,
      notes: 'Strict separation of gross emissions and net removals with 15% permanence buffer.'
    },
    {
      id: 'm-3',
      name: 'IPCC Tier 1 Default Agronomic Emission Factors',
      version: '2019 Refinement to 2006 Guidelines',
      releaseDate: '2019-05-12',
      standard: 'IPCC / UNFCCC',
      activeImplementationsCount: 35,
      isCurrentDefault: false,
      notes: 'Fallback Tier 1 regional defaults for international grain sheds.'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-emerald-500/80 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-stone-900 border border-stone-700 text-stone-200 shadow-md">
                <Users className="w-6 h-6 text-emerald-400 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    PHASE 5: SECONDARY &amp; EXTENDED ROLES
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Multi-Stakeholder Ag Ecosystem</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-100 mt-0.5 tracking-tight">
                  Extended Roles &amp; Operational Network Hub
                </h2>
                <p className="text-xs text-stone-300">
                  Specialized consoles for Landowners, Field Technicians, Soil Laboratories, Commodity Buyers, Grant Program Administrators, and Platform Ops.
                </p>
              </div>
            </div>

            {onOpenLineageModal && currentFarm.fields.length > 0 && (
              <button
                onClick={() => onOpenLineageModal(currentFarm.fields[0])}
                className="bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                Cross-Role Data Lineage &amp; RBAC
              </button>
            )}
          </div>

          {/* Role Navigation Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-stone-800/80">
            <button
              onClick={() => setActiveRole('landowner_manager')}
              className={`p-3 rounded-xl text-left border transition-all ${
                activeRole === 'landowner_manager'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold block">1. Landowner</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5">Ownership &amp; Control</span>
            </button>

            <button
              onClick={() => setActiveRole('field_tech')}
              className={`p-3 rounded-xl text-left border transition-all ${
                activeRole === 'field_tech'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-lime-400" />
                <span className="text-xs font-bold block">2. Field Tech</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5">Mobile Task Queue</span>
            </button>

            <button
              onClick={() => setActiveRole('soil_lab')}
              className={`p-3 rounded-xl text-left border transition-all ${
                activeRole === 'soil_lab'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold block">3. Soil Lab</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5">Direct LIMS Upload</span>
            </button>

            <button
              onClick={() => setActiveRole('buyer_processor')}
              className={`p-3 rounded-xl text-left border transition-all ${
                activeRole === 'buyer_processor'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold block">4. Buyer / Proc</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5">Commodity Sourcing</span>
            </button>

            <button
              onClick={() => setActiveRole('program_admin')}
              className={`p-3 rounded-xl text-left border transition-all ${
                activeRole === 'program_admin'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold block">5. Grant Admin</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5">Programs &amp; Approvals</span>
            </button>

            <button
              onClick={() => setActiveRole('platform_admin')}
              className={`p-3 rounded-xl text-left border transition-all ${
                activeRole === 'platform_admin'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold block">6. Platform Ops</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5">APIs &amp; Methodologies</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. LANDOWNER / FARM MANAGER CONSOLE (§2, P1) */}
      {/* ========================================================================= */}
      {activeRole === 'landowner_manager' && (
        <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Landowner &amp; Farm Governance Registry
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Distinguishes legal deed ownership, tenant operating rights, and property management roles on <strong>{currentFarm.name}</strong>.
              </p>
            </div>

            <button
              onClick={() => setShowAddStkModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Link New Stakeholder / Tenant
            </button>
          </div>

          {/* Stakeholders Table */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 font-mono text-[10px] uppercase border-b border-stone-800">
                <tr>
                  <th className="p-3.5">Stakeholder Entity</th>
                  <th className="p-3.5">Governance Role</th>
                  <th className="p-3.5">Equity / Crop Share</th>
                  <th className="p-3.5">Permission Scope</th>
                  <th className="p-3.5">Linked Fields</th>
                  <th className="p-3.5">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {stakeholders.map((stk) => (
                  <tr key={stk.id} className="hover:bg-stone-800/40 transition">
                    <td className="p-3.5">
                      <span className="font-bold text-stone-200 block">{stk.name}</span>
                      <span className="text-[11px] text-stone-400 font-mono">{stk.email}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase border ${
                        stk.role === 'owner' ? 'bg-amber-950 border-amber-800 text-amber-300' :
                        stk.role === 'tenant_farmer' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' :
                        'bg-stone-800 border-stone-700 text-stone-300'
                      }`}>
                        {stk.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-stone-200 font-bold">
                      {stk.ownershipSharePct > 0 ? `${stk.ownershipSharePct}% Share` : 'Fee-Based / 0%'}
                    </td>
                    <td className="p-3.5">
                      <span className="text-stone-300 font-mono text-[11px] bg-stone-950 px-2 py-1 rounded border border-stone-800">
                        {stk.permissionScope.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-stone-400 text-[11px]">
                      {stk.linkedFieldIds.length} of {currentFarm.fields.length} Fields
                    </td>
                    <td className="p-3.5 text-stone-400 text-[11px] font-mono">{stk.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FIELD TECHNICIAN MOBILE TASK QUEUE (§3, P1) */}
      {/* ========================================================================= */}
      {activeRole === 'field_tech' && (
        <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-lime-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Field Technician Mobile Data Capture &amp; Task Queue
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Task assignments for in-situ soil sampling, RTK GPS boundary walks, and geotagged canopy photos.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-stone-400">Assigned Scout:</span>
              <span className="text-lime-400 font-bold bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
                Tyler Brooks (#04)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-stone-900 p-5 rounded-2xl border border-stone-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      task.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      task.status === 'in_progress' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-stone-800 text-stone-300'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">Due: {task.dueDate}</span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-100">{task.fieldName}</h4>
                  <p className="text-xs text-stone-300">{task.notes}</p>

                  <div className="pt-2 text-[11px] font-mono text-stone-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-lime-400" />
                      <span>GPS: {task.gpsCoordinates[0].toFixed(3)}°N, {task.gpsCoordinates[1].toFixed(3)}°W</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Evidence Photos: {task.photoEvidenceCount} Attached</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800/80">
                  {task.status !== 'completed' ? (
                    <button
                      onClick={() => handleSimulatePhotoUpload(task.id)}
                      disabled={taskPhotoUploading === task.id}
                      className="w-full bg-lime-600 hover:bg-lime-500 text-stone-950 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      {taskPhotoUploading === task.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Uploading GPS Evidence...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>Log Geotagged Photo &amp; Complete</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-center text-xs font-bold text-emerald-400 py-1 font-mono flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Task Completed &bull; {task.completedAt}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SOIL LABORATORY DIRECT LIMS UPLOAD (§4, P1) */}
      {/* ========================================================================= */}
      {activeRole === 'soil_lab' && (
        <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Certified Soil Laboratory Data Ingestion Feed
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Direct structured LIMS ingestion of dry combustion SOC (%), bulk density, and depth stratification.
              </p>
            </div>

            <span className="px-3 py-1 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono font-bold">
              ISO/IEC 17025:2017 Accredited Feed
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Direct Upload Form */}
            <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 space-y-4">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Submit Lab Assay Record
              </h4>

              <form onSubmit={handleSimulateLabUpload} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1">Laboratory Sample ID</label>
                  <input
                    type="text"
                    placeholder="e.g. ML-2026-904812"
                    value={newLabSampleId}
                    onChange={(e) => setNewLabSampleId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">SOC Concentration (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLabSoc}
                      onChange={(e) => setNewLabSoc(parseFloat(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Bulk Density (g/cm³)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLabBulkDensity}
                      onChange={(e) => setNewLabBulkDensity(parseFloat(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Depth Increment</label>
                  <select
                    value={newLabDepth}
                    onChange={(e) => setNewLabDepth(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="0-10 cm">0–10 cm (Surface Core)</option>
                    <option value="10-30 cm">10–30 cm (Root Zone Core)</option>
                    <option value="30-60 cm">30–60 cm (Deep Subsoil Core)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-bold py-2.5 rounded-xl transition shadow-lg shadow-cyan-950/40"
                >
                  Direct Ingest Lab Record
                </button>
              </form>
            </div>

            {/* Ingested Lab Assay Ledger */}
            <div className="lg:col-span-2 bg-stone-900 p-5 rounded-2xl border border-stone-800 space-y-3">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Ingested Laboratory Soil Core Database
              </h4>

              <div className="space-y-2.5">
                {labUploads.map((u) => (
                  <div key={u.id} className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400">{u.labSampleId}</span>
                        <span className="text-stone-500">&bull;</span>
                        <span className="text-stone-300 font-semibold">{u.fieldName} ({u.sampleDepthRange})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-[10px] font-bold">
                        INGESTED &bull; QA PASS
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-stone-300">
                      <div>
                        <span className="text-stone-500 text-[9px] block">SOC Concentration:</span>
                        <strong className="text-emerald-400">{u.socConcentrationPct}%</strong>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[9px] block">Bulk Density:</span>
                        <strong className="text-stone-100">{u.bulkDensityGcm3} g/cm³</strong>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[9px] block">QA/QC Variance:</span>
                        <strong className="text-stone-300">&plusmn;{u.qaQcDuplicateVariancePct}%</strong>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[9px] block">Methodology:</span>
                        <strong className="text-stone-300 truncate block">LECO Dry Comb.</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BUYER / PROCESSOR PROCUREMENT SCORECARD (§5, P2) */}
      {/* ========================================================================= */}
      {activeRole === 'buyer_processor' && (
        <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Commodity Procurement Carbon Intensity Scorecard
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Procurement-facing carbon accounting without exposing farm-level confidential agronomic records or PII.
              </p>
            </div>

            <button
              onClick={() => showToast('Exported Anonymized Commodity Sourcing Intensity Report (CSV)!')}
              className="bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export Sourcing CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {procurementScorecards.map((sc) => (
              <div key={sc.id} className="bg-stone-900 p-5 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-stone-100">{sc.commodity}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                    {sc.tier1PrimarySharePct}% Primary Data
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Emissions Intensity</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-emerald-400">{sc.carbonIntensityKgCO2ePerKg}</span>
                    <span className="text-xs text-stone-400">kg CO₂e/kg</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block">Benchmark: {sc.conventionalBenchmarkKgCO2e} kg CO₂e/kg (-{Math.round((1 - sc.carbonIntensityKgCO2ePerKg/sc.conventionalBenchmarkKgCO2e)*100)}%)</span>
                </div>

                <div className="pt-2 border-t border-stone-800 text-xs font-mono space-y-1 text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Volume:</span>
                    <span>{sc.purchasedVolumeTons.toLocaleString()} t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Low-C Premium:</span>
                    <span className="text-emerald-400 font-bold">+${sc.lowCarbonPremiumUSD}/bu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Active Growers:</span>
                    <span>{sc.anonymizedSupplierCount} (Anonymized)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PROGRAM / NGO / GRANT ADMINISTRATOR (§6, P2) */}
      {/* ========================================================================= */}
      {activeRole === 'program_admin' && (
        <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Sustainability Grant &amp; Cost-Share Program Console
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Review farmer applications, approve cost-share disbursements, and audit carbon additionality metrics.
              </p>
            </div>

            <span className="px-3 py-1 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 text-xs font-mono font-bold">
              ${(grantPrograms.reduce((acc, p) => acc + p.totalFundingUSD, 0) / 1000000).toFixed(1)}M Total Capital Active
            </span>
          </div>

          {/* Active Programs Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grantPrograms.map((prog) => (
              <div key={prog.id} className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-100">{prog.name}</h4>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800 font-bold">
                    ${prog.incentiveRatePerAcreUSD}/ac Incentive
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">{prog.fundingAgency}</p>
                <div className="flex items-center justify-between text-xs font-mono pt-1 text-stone-300">
                  <span>Disbursed: ${(prog.disbursedFundingUSD / 1000).toFixed(0)}k of ${(prog.totalFundingUSD / 1000).toFixed(0)}k</span>
                  <span className="text-emerald-400 font-bold">{prog.enrolledFarmsCount} Enrolled Farms</span>
                </div>
              </div>
            ))}
          </div>

          {/* Application Review Queue */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Farmer Grant Readiness &amp; Application Review Queue
            </h4>

            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 font-mono text-[10px] uppercase border-b border-stone-800">
                  <tr>
                    <th className="p-3.5">Applicant &amp; Farm</th>
                    <th className="p-3.5">Proposed Practices</th>
                    <th className="p-3.5">Acreage</th>
                    <th className="p-3.5">Requested Subsidy</th>
                    <th className="p-3.5">Carbon Potential</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {grantApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-stone-800/40 transition">
                      <td className="p-3.5">
                        <span className="font-bold text-stone-200 block">{app.applicantName}</span>
                        <span className="text-[11px] text-stone-400 font-mono">{app.farmName}</span>
                      </td>
                      <td className="p-3.5 text-stone-300 text-[11px]">
                        {app.practicesProposed.join(', ')}
                      </td>
                      <td className="p-3.5 font-mono text-stone-200">{app.acreageEnrolled} ac</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        ${app.requestedFundingUSD.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono text-cyan-400">
                        {app.carbonReductionPotentialMT} MT CO₂e
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          app.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          app.status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-800' :
                          'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {app.status === 'submitted' || app.status === 'under_review' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleGrantDecision(app.id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleGrantDecision(app.id, 'rejected')}
                              className="bg-stone-800 hover:bg-stone-700 text-red-400 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-stone-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PLATFORM ADMINISTRATOR CONSOLE (§7, P0) */}
      {/* ========================================================================= */}
      {activeRole === 'platform_admin' && (
        <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-stone-100">
                  Platform Operations, API Integrations &amp; Methodologies
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Global configuration of remote sensing connectors, emission factor libraries, and core system health.
              </p>
            </div>

            <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Core APIs Operational (99.98% SLA)
            </span>
          </div>

          {/* Integration Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {integrations.map((intg) => (
              <div key={intg.id} className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200 truncate block">{intg.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] font-mono text-stone-400 truncate">{intg.endpoint}</div>
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 pt-1 border-t border-stone-800">
                  <span>Latency: <strong className="text-emerald-400">{intg.latencyMs}ms</strong></span>
                  <span>Errors: <strong className="text-stone-300">{intg.errorRatePct}%</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Methodology Library Versioning */}
          <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Versioned Emission Factor &amp; Agronomic Science Libraries
            </h4>

            <div className="space-y-2.5">
              {methodologies.map((m) => (
                <div key={m.id} className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-100">{m.name}</span>
                      <span className="font-mono text-[10px] text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 font-bold">
                        {m.version}
                      </span>
                      {m.isCurrentDefault && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          CURRENT DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400">{m.notes} ({m.standard})</p>
                  </div>

                  <div className="text-right font-mono text-[11px] text-stone-400">
                    <span className="text-stone-200 font-bold">{m.activeImplementationsCount} Active Farm Tenants</span>
                    <span className="block text-[10px] text-stone-500">Released: {m.releaseDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD STAKEHOLDER / TENANT */}
      {/* ========================================================================= */}
      {showAddStkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-400" />
                Link Stakeholder or Tenant
              </h3>
              <button
                onClick={() => setShowAddStkModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStakeholder} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Entity / Individual Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance Land Trust"
                  value={newStkName}
                  onChange={(e) => setNewStkName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="stakeholder@domain.com"
                  value={newStkEmail}
                  onChange={(e) => setNewStkEmail(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Governance Role</label>
                  <select
                    value={newStkRole}
                    onChange={(e) => setNewStkRole(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="owner">Landowner (Deed)</option>
                    <option value="tenant_farmer">Tenant Farmer (Operator)</option>
                    <option value="operator">Farm Operator</option>
                    <option value="land_manager">Property Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Permission Scope</label>
                  <select
                    value={newStkScope}
                    onChange={(e) => setNewStkScope(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="view_only">View Only</option>
                    <option value="full_management">Full Management (Write)</option>
                    <option value="financial_reports">Financial &amp; Reports Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Equity / Crop Share %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newStkShare}
                  onChange={(e) => setNewStkShare(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddStkModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-emerald-950/40"
                >
                  Save Stakeholder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
