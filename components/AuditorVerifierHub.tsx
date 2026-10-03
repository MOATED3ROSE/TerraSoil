import React, { useState, useMemo } from 'react';
import { 
  Farm, 
  Field, 
  PracticeRecord, 
  EmissionFactorConfig, 
  VerificationFinding, 
  AuditTrailEvent, 
  VerificationEngagement,
  FindingSeverity,
  FindingResolutionStatus,
  VerificationStage
} from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Lock, 
  Layers, 
  Cpu, 
  Sparkles, 
  Check, 
  X, 
  ChevronRight, 
  FileCheck, 
  FileSpreadsheet, 
  Calendar, 
  Scale, 
  HelpCircle,
  TrendingUp,
  UserCheck,
  Building2,
  Tractor,
  Award,
  RefreshCw,
  Copy
} from 'lucide-react';

interface AuditorVerifierHubProps {
  currentFarm: Farm;
  farms: Farm[];
  onSelectFarm: (farm: Farm) => void;
  onOpenReportModal?: () => void;
  onOpenPricingModal?: () => void;
  onOpenComparisonModal?: () => void;
  onOpenLineageModal?: (field: Field) => void;
  config?: EmissionFactorConfig;
  activeSubView?: 'evidence_review' | 'verification_workflow' | 'findings_ledger' | 'audit_trail' | 'assurance_statement';
  onSubViewChange?: (view: 'evidence_review' | 'verification_workflow' | 'findings_ledger' | 'audit_trail' | 'assurance_statement') => void;
}

export const AuditorVerifierHub: React.FC<AuditorVerifierHubProps> = ({
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
  // Navigation Tabs for Auditor Role
  const [activeTab, setActiveTab] = useState<'evidence_review' | 'verification_workflow' | 'findings_ledger' | 'audit_trail' | 'assurance_statement'>(activeSubView || 'evidence_review');

  React.useEffect(() => {
    if (activeSubView) {
      setActiveTab(activeSubView);
    }
  }, [activeSubView]);

  const handleTabSelect = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (onSubViewChange) {
      onSubViewChange(tab);
    }
  };

  // Filter & Search states
  const [selectedFieldId, setSelectedFieldId] = useState<string>(currentFarm.fields[0]?.id || '');
  const [findingSeverityFilter, setFindingSeverityFilter] = useState<string>('all');
  const [findingStatusFilter, setFindingStatusFilter] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeField = useMemo(() => {
    return currentFarm.fields.find(f => f.id === selectedFieldId) || currentFarm.fields[0];
  }, [currentFarm, selectedFieldId]);

  // =========================================================
  // 1. VERIFICATION ENGAGEMENT & PIPELINE STATE (P0)
  // =========================================================
  const [engagement, setEngagement] = useState<VerificationEngagement>({
    id: 'eng-2026-iso14064',
    scopeName: 'FY2026 Soil Organic Carbon & Scope 3 Agricultural Insetting Assurance',
    targetStandard: 'ISO 14064-3',
    assuranceLevel: 'Limited Assurance',
    status: 'under_review',
    progressPct: 78,
    totalItems: 42,
    verifiedItems: 33,
    openFindingsCount: 3,
    leadAuditor: 'Dr. Evelyn Reed, Lead Environmental Auditor (ISO 14065 Accredited)',
    verifierOrg: 'Apex Sustainability Assurance & Standards Body LLC',
    auditPeriod: 'January 1, 2026 – December 31, 2026'
  });

  // Pipeline stages
  const pipelineStages: { stage: VerificationStage; label: string; count: number; desc: string }[] = [
    { stage: 'submitted', label: '1. Submitted', count: 42, desc: 'Complete activity data package received from grower/consultant' },
    { stage: 'under_review', label: '2. Under Review', count: 9, desc: 'Independent evidence & multispectral satellite cross-examination' },
    { stage: 'finding', label: '3. Finding Logged', count: 3, desc: 'Non-conformances or data discrepancies flagged for corrective action' },
    { stage: 'corrected', label: '4. Corrected', count: 6, desc: 'Supplemental evidence provided & recalculated values re-audited' },
    { stage: 'verified', label: '5. Verified', count: 24, desc: 'Conformant with ISO 14064-3 & GHG Protocol LSR standards' }
  ];

  // =========================================================
  // 2. FINDINGS / ISSUES MANAGEMENT STATE (P0)
  // =========================================================
  const [findings, setFindings] = useState<VerificationFinding[]>([
    {
      id: 'find-101',
      fieldId: currentFarm.fields[0]?.id || 'f1',
      fieldName: currentFarm.fields[0]?.name || 'North Meadow - Lot 4',
      farmId: currentFarm.id,
      farmName: currentFarm.name,
      title: 'Discrepancy in Cover Crop Seeding Date vs Sentinel-2 Emergence NDVI',
      description: 'Logged seeding date of 2025-09-15 was not confirmed by Sentinel-2 NDVI spectral surge until 2025-10-28. Canopy groundcover emergence delayed by 43 days due to late autumn germination.',
      severity: 'major',
      relatedMetric: 'Carbon Sequestration Rate (MT CO2e/ac)',
      requiredCorrectiveAction: 'Submit seed purchase delivery receipt and certified agronomist stand establishment inspection report.',
      dueDate: '2026-10-25',
      resolutionStatus: 'open',
      flaggedBy: 'Dr. Evelyn Reed (Lead Verifier)',
      flaggedAt: '2026-09-28',
      evidenceDocRef: 'Sentinel-2 Band 8/4 NDVI Orthomosaic #S2A_20250915_T15T'
    },
    {
      id: 'find-102',
      fieldId: currentFarm.fields[1]?.id || 'f2',
      fieldName: currentFarm.fields[1]?.name || 'South 40 Bottomlands',
      farmId: currentFarm.id,
      farmName: currentFarm.name,
      title: 'Missing Bulk Density Depth Stratification in Soil Core Lab LECO Report',
      description: 'Lab dry combustion results report 2.4% SOC but lack 0–10cm vs 10–30cm bulk density calibration curve required for ISO 14064-2 stock change quantification.',
      severity: 'critical',
      relatedMetric: 'Baseline SOC Stock (t C/ha)',
      requiredCorrectiveAction: 'Provide laboratory QA/QC duplicate core test results with calibrated core cylinder volume measurement.',
      dueDate: '2026-10-18',
      resolutionStatus: 'under_review',
      resolutionNotes: 'Agronomist re-submitted Midwest Laboratories test report #ML-884920 on Oct 2 with full 1.32 g/cm³ core documentation.',
      flaggedBy: 'Marcus Thorne (Senior Soil Scientist Auditor)',
      flaggedAt: '2026-09-24',
      evidenceDocRef: 'Midwest Lab Certificate #SOC-2025-8849'
    },
    {
      id: 'find-103',
      fieldId: currentFarm.fields[0]?.id || 'f1',
      fieldName: currentFarm.fields[0]?.name || 'North Meadow - Lot 4',
      farmId: currentFarm.id,
      farmName: currentFarm.name,
      title: 'Uncertainty Buffer Deduction Not Documented for Grazing Rotation',
      description: 'Grazing rotation practice factor applied at Tier 2 rate without 15% conservative deduction buffer specified in GHG Protocol Land Sector Guidance §6.4.',
      severity: 'minor',
      relatedMetric: 'Gross GHG Removals',
      requiredCorrectiveAction: 'Adjust calculation engine uncertainty margin to 15% permanence buffer or provide GPS collar stocking density logs.',
      dueDate: '2026-11-05',
      resolutionStatus: 'corrected',
      resolutionNotes: 'Uncertainty deduction applied in calculation engine v1.5. Net carbon credit volume reduced by 3.2 MT CO2e to maintain conservatism.',
      flaggedBy: 'Dr. Evelyn Reed (Lead Verifier)',
      flaggedAt: '2026-09-15',
      resolvedAt: '2026-10-01',
      evidenceDocRef: 'Calculation Version Delta #v1.3-to-v1.5'
    },
    {
      id: 'find-104',
      fieldId: currentFarm.fields[0]?.id || 'f1',
      fieldName: currentFarm.fields[0]?.name || 'North Meadow - Lot 4',
      farmId: currentFarm.id,
      farmName: currentFarm.name,
      title: 'Tractor Fuel Telemetry Precision Level Observation',
      description: 'Diesel fuel consumption logged via monthly aggregate invoice rather than CAN-bus J1939 telematics rate. Conforms to Tier 1 but recommends Tier 2 telematics upgrade next season.',
      severity: 'observation',
      relatedMetric: 'Scope 1 Fuel Emissions',
      requiredCorrectiveAction: 'No immediate correction required; note in final verification management letter.',
      dueDate: '2026-12-01',
      resolutionStatus: 'closed',
      resolutionNotes: 'Auditor confirmed conformity with ISO 14064-1 Tier 1 emission factors. Closed without non-conformance.',
      flaggedBy: 'Marcus Thorne (Senior Soil Scientist Auditor)',
      flaggedAt: '2026-09-10',
      resolvedAt: '2026-09-18'
    }
  ]);

  // Finding creation modal state
  const [showAddFindingModal, setShowAddFindingModal] = useState(false);
  const [newFindingTitle, setNewFindingTitle] = useState('');
  const [newFindingDesc, setNewFindingDesc] = useState('');
  const [newFindingSeverity, setNewFindingSeverity] = useState<FindingSeverity>('major');
  const [newFindingMetric, setNewFindingMetric] = useState('Carbon Sequestration Rate');
  const [newFindingAction, setNewFindingAction] = useState('');
  const [newFindingDueDate, setNewFindingDueDate] = useState('2026-11-15');

  // =========================================================
  // 3. AUDIT TRAIL IMMUTABLE EVENT LOG (P0/P1)
  // =========================================================
  const [auditEvents, setAuditEvents] = useState<AuditTrailEvent[]>([
    {
      id: 'evt-901',
      timestamp: '2026-10-02 11:42:15 UTC',
      actor: 'Dr. Evelyn Reed',
      actorRole: 'auditor',
      actionType: 'verify',
      entityType: 'carbon_calculation',
      entityId: 'calc-f1-2026',
      entityName: 'North Meadow Carbon Sequestration Estimate',
      details: 'Conducted independent Tier 2 emission factor verification against COMET-Farm baseline models. Approved 42.4 MT CO2e gross removal.',
      previousValue: 'Pending Verification',
      newValue: 'ISO 14064-3 Verified (Limited Assurance)',
      sha256Signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      complianceStandard: 'ISO 14064-3:2019'
    },
    {
      id: 'evt-902',
      timestamp: '2026-10-01 16:30:22 UTC',
      actor: 'Sarah Jenkins (Grower)',
      actorRole: 'farmer',
      actionType: 'update',
      entityType: 'practice',
      entityId: 'prac-cover-crop-2025',
      entityName: 'Winter Rye & Hairy Vetch Cover Crop Record',
      details: 'Attached certified seed tag lot #WY-9820 and seed invoice receipt in response to Verifier Finding #FIND-101.',
      previousValue: 'Unsubstantiated Self-Reported Log',
      newValue: 'Evidence Attached (Seed Tag #WY-9820)',
      sha256Signature: '7d793037a0760186574b0282f2f435e7b1e7a6acc941e003249ada4a7360e526',
      complianceStandard: 'GHG Protocol Land Sector Guidance §4.2'
    },
    {
      id: 'evt-903',
      timestamp: '2026-09-28 09:14:05 UTC',
      actor: 'Dr. Evelyn Reed',
      actorRole: 'auditor',
      actionType: 'flag',
      entityType: 'audit_finding',
      entityId: 'find-101',
      entityName: 'Cover Crop Seeding Date Discrepancy',
      details: 'Logged Major Non-Conformance Finding #FIND-101 following Sentinel-2 NDVI spectral canopy emergence variance.',
      previousValue: 'In Review',
      newValue: 'Major Non-Conformance (Open)',
      sha256Signature: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      complianceStandard: 'ISO 14064-3 §6.3.2'
    },
    {
      id: 'evt-904',
      timestamp: '2026-09-20 14:02:11 UTC',
      actor: 'Marcus Vance, CCA',
      actorRole: 'agronomist',
      actionType: 'approve',
      entityType: 'field',
      entityId: 'f1-boundary',
      entityName: 'Field Boundary GIS Polygon GeoJSON',
      details: 'Signed off on boundary accuracy (120.5 acres) with RTK-GPS surveyor precision. Exported to auditor review queue.',
      previousValue: 'Draft Geometry (118.2 ac)',
      newValue: 'Certified Boundary Polygon (120.5 ac)',
      sha256Signature: 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
      complianceStandard: 'USDA SSURGO & ISO 19115'
    },
    {
      id: 'evt-905',
      timestamp: '2026-09-12 08:35:40 UTC',
      actor: 'Automated Satellite Ingestion Daemon',
      actorRole: 'system',
      actionType: 'create',
      entityType: 'telemetry',
      entityId: 'sentinel2-s2a-20250912',
      entityName: 'Sentinel-2 MSI Level-2A Bottom-of-Atmosphere Tile',
      details: 'Cloud-masked BOA reflectance calibrated for Field 1 & Field 2. Mean NDVI computed at 0.68 with 99.4% pixel confidence.',
      previousValue: 'None',
      newValue: 'MSI Tile #S2A_MSIL2A_20250912T164841',
      sha256Signature: '8a9f4c3b2e1d0f8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f',
      complianceStandard: 'Copernicus Open Access Hub L2A Processing Baseline 04.00'
    }
  ]);

  // Handler to add finding
  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFindingTitle.trim() || !newFindingAction.trim()) return;

    const newId = `find-${Date.now().toString().slice(-4)}`;
    const finding: VerificationFinding = {
      id: newId,
      fieldId: activeField?.id || 'f1',
      fieldName: activeField?.name || 'Selected Field',
      farmId: currentFarm.id,
      farmName: currentFarm.name,
      title: newFindingTitle,
      description: newFindingDesc,
      severity: newFindingSeverity,
      relatedMetric: newFindingMetric,
      requiredCorrectiveAction: newFindingAction,
      dueDate: newFindingDueDate,
      resolutionStatus: 'open',
      flaggedBy: 'Dr. Evelyn Reed (Lead Verifier)',
      flaggedAt: new Date().toISOString().split('T')[0],
    };

    setFindings([finding, ...findings]);

    // Append to audit trail
    const auditEvt: AuditTrailEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'Dr. Evelyn Reed (Lead Verifier)',
      actorRole: 'auditor',
      actionType: 'flag',
      entityType: 'audit_finding',
      entityId: newId,
      entityName: newFindingTitle,
      details: `Logged ${newFindingSeverity.toUpperCase()} finding: "${newFindingTitle}". Required action: ${newFindingAction}`,
      newValue: `${newFindingSeverity.toUpperCase()} Non-Conformance (Open)`,
      sha256Signature: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + 'a8f9',
      complianceStandard: 'ISO 14064-3:2019 §6.3'
    };
    setAuditEvents([auditEvt, ...auditEvents]);

    setShowAddFindingModal(false);
    setNewFindingTitle('');
    setNewFindingDesc('');
    setNewFindingAction('');
    showToast(`Logged Finding #${newId.toUpperCase()} to verification queue!`);
  };

  // Handler to update finding status
  const handleUpdateFindingStatus = (findingId: string, newStatus: FindingResolutionStatus) => {
    setFindings(findings.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          resolutionStatus: newStatus,
          resolvedAt: newStatus === 'closed' || newStatus === 'corrected' ? new Date().toISOString().split('T')[0] : f.resolvedAt
        };
      }
      return f;
    }));

    const auditEvt: AuditTrailEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'Dr. Evelyn Reed (Lead Verifier)',
      actorRole: 'auditor',
      actionType: 'verify',
      entityType: 'audit_finding',
      entityId: findingId,
      entityName: `Finding #${findingId}`,
      details: `Auditor updated Finding #${findingId} status to "${newStatus.toUpperCase()}".`,
      newValue: newStatus.toUpperCase(),
      sha256Signature: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + 'b7e2',
      complianceStandard: 'ISO 14064-3:2019 §6.5'
    };
    setAuditEvents([auditEvt, ...auditEvents]);
    showToast(`Finding #${findingId} updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      const matchSeverity = findingSeverityFilter === 'all' || f.severity === findingSeverityFilter;
      const matchStatus = findingStatusFilter === 'all' || f.resolutionStatus === findingStatusFilter;
      return matchSeverity && matchStatus;
    });
  }, [findings, findingSeverityFilter, findingStatusFilter]);

  // Filtered audit events
  const filteredAuditEvents = useMemo(() => {
    if (!auditSearchQuery.trim()) return auditEvents;
    const q = auditSearchQuery.toLowerCase();
    return auditEvents.filter(e => 
      e.actor.toLowerCase().includes(q) ||
      e.entityName.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      e.actionType.toLowerCase().includes(q) ||
      e.complianceStandard.toLowerCase().includes(q)
    );
  }, [auditEvents, auditSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-emerald-500/80 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auditor Top Control Header & Engagement Status */}
      <div className="bg-stone-950 border border-cyan-900/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-700/80 text-cyan-400 shadow-md">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    ROLE 4: AUDITOR &amp; VERIFIER WORKSPACE (PHASE 5)
                  </span>
                  <span className="text-xs text-stone-400 font-mono">ISO 14064-3 / GHG Protocol LSR</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-100 mt-0.5 tracking-tight">
                  Independent Verification &amp; Assurance Console
                </h2>
                <p className="text-xs text-stone-300">
                  Read-mostly inspection across agricultural activity data, satellite spectral evidence, calculation equations, and cryptographic chain of custody.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddFindingModal(true)}
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Log Finding / Non-Conformance
              </button>

              <button
                onClick={() => onOpenLineageModal && activeField && onOpenLineageModal(activeField)}
                className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                Inspect Full Data Lineage DAG
              </button>
            </div>
          </div>

          {/* Engagement Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-stone-900/90 p-4 rounded-2xl border border-stone-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">Engagement Scope</span>
              <span className="text-stone-100 font-semibold text-sm truncate block mt-0.5">{engagement.scopeName}</span>
              <span className="text-[10px] text-cyan-400 font-mono">{engagement.targetStandard} &bull; {engagement.assuranceLevel}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">Verification Progress</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full" style={{ width: `${engagement.progressPct}%` }} />
                </div>
                <span className="font-mono font-bold text-cyan-400">{engagement.progressPct}%</span>
              </div>
              <span className="text-[10px] text-stone-400">{engagement.verifiedItems} of {engagement.totalItems} Evidence Items Verified</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">Findings Status</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold font-mono">
                  {findings.filter(f => f.resolutionStatus === 'open').length} Open
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-bold font-mono">
                  {findings.filter(f => f.resolutionStatus === 'under_review').length} In Review
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold font-mono">
                  {findings.filter(f => f.resolutionStatus === 'corrected' || f.resolutionStatus === 'closed').length} Resolved
                </span>
              </div>
              <span className="text-[10px] text-stone-500 block mt-0.5">0 Critical blockers remaining</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">Accredited Verifier</span>
              <span className="text-stone-200 font-semibold truncate block mt-0.5">{engagement.leadAuditor}</span>
              <span className="text-[10px] text-stone-400 truncate block">{engagement.verifierOrg}</span>
            </div>
          </div>

          {/* Auditor Workflow Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800/80">
            <button
              onClick={() => setActiveTab('evidence_review')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'evidence_review'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              1. Evidence Review &amp; Calculation Audit (P0)
            </button>

            <button
              onClick={() => setActiveTab('verification_workflow')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'verification_workflow'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              2. Verification Pipeline &amp; Checklist (P0)
            </button>

            <button
              onClick={() => setActiveTab('findings_ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'findings_ledger'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              3. Non-Conformance Findings Ledger (P0)
              {findings.filter(f => f.resolutionStatus === 'open').length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold">
                  {findings.filter(f => f.resolutionStatus === 'open').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit_trail')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'audit_trail'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              4. Immutable Audit Trail &amp; Signatures (P0/P1)
            </button>

            <button
              onClick={() => setActiveTab('assurance_statement')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'assurance_statement'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              5. ISO 14064-3 Assurance Statement
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EVIDENCE REVIEW & CALCULATION AUDIT (P0) */}
      {/* ========================================================================= */}
      {activeTab === 'evidence_review' && (
        <div className="space-y-6">
          {/* Field Selection Toolbar */}
          <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-stone-300">Auditing Field:</label>
              <select
                value={activeField.id}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="bg-stone-950 border border-stone-700 text-stone-100 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              >
                {currentFarm.fields.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.acreage} ac &bull; {f.cropType})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-stone-400">Total Sequestration Claim:</span>
              <span className="text-emerald-400 font-bold bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
                {activeField.carbonBreakdown.totalGrossMT.toFixed(1)} MT CO₂e / yr ({activeField.carbonBreakdown.totalNetPerAcre.toFixed(2)} MT/ac)
              </span>
            </div>
          </div>

          {/* Evidence Review Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Raw Evidence & Sensor Records */}
            <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Primary In-Situ &amp; Remote Sensing Evidence
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">ISO 14064-2 Clause 5.3</span>
              </div>

              <div className="space-y-3">
                {/* Evidence Item 1: Satellite NDVI */}
                <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Sentinel-2 MSI Level-2A Multispectral Orthomosaic
                    </span>
                    <span className="font-mono text-emerald-400 text-[11px] font-bold">Verified &bull; 99.4% Match</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    10-meter Ground Sample Distance (GSD) surface reflectances confirm vegetative groundcover from winter cover crop (Mean NDVI = 0.68).
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-800">
                    <span>Source: ESA Copernicus Open Access</span>
                    <span>Checksum: 8a9f...e4f</span>
                  </div>
                </div>

                {/* Evidence Item 2: Soil Core Lab Analysis */}
                <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      LECO Dry Combustion Elemental Soil Core (0–30 cm)
                    </span>
                    <span className="font-mono text-cyan-400 text-[11px] font-bold">Lab Certified</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Baseline SOC concentration: <strong>2.18% Carbon</strong>. Bulk density: <strong>1.34 g/cm³</strong>. Lab sample ID #ML-884920 with QA/QC duplicate variance &lt; 1.2%.
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-800">
                    <span>Lab: Midwest Laboratories (ISO 17025)</span>
                    <span>Sample Date: 2025-11-12</span>
                  </div>
                </div>

                {/* Evidence Item 3: As-Applied Agronomic Inputs */}
                <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Variable-Rate Nitrogen As-Applied Machine Telematics
                    </span>
                    <span className="font-mono text-amber-400 text-[11px] font-bold">1 Finding Logged</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Shapefile log indicates 125 lbs N/ac applied (22% synthetic reduction vs 160 lbs N/ac county baseline).
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-800">
                    <span>Source: John Deere Operations Center API</span>
                    <span>Finding: #FIND-101</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Mathematical Equation Verification & Uncertainty Breakdown */}
            <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  MRV Calculation Equation Audit
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">IPCC 2019 Refinement / COMET-Farm</span>
              </div>

              {/* Formula Inspection Card */}
              <div className="p-4 bg-stone-900/90 rounded-xl border border-stone-800 font-mono space-y-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Audited Net Sequestration Equation:</span>
                <div className="text-xs text-emerald-400 bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono overflow-x-auto">
                  {'ΔC_net = Area × [ (EF_cover × F_soil) + (EF_notill × F_clim) + (ΔN × EF_N2O × GWP_N2O) ] × (1 - U_buffer)'}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 text-stone-300">
                  <div className="bg-stone-950 p-2 rounded border border-stone-800">
                    <span className="text-stone-500 block text-[9px]">Acreage (A):</span>
                    <span className="font-bold text-stone-200">{activeField.acreage} acres</span>
                  </div>
                  <div className="bg-stone-950 p-2 rounded border border-stone-800">
                    <span className="text-stone-500 block text-[9px]">Soil Climate Factor (F_soil):</span>
                    <span className="font-bold text-stone-200">1.08 (Temperate Humid)</span>
                  </div>
                  <div className="bg-stone-950 p-2 rounded border border-stone-800">
                    <span className="text-stone-500 block text-[9px]">Uncertainty Buffer (U_buffer):</span>
                    <span className="font-bold text-amber-400">15% Escrow (GHG Protocol)</span>
                  </div>
                  <div className="bg-stone-950 p-2 rounded border border-stone-800">
                    <span className="text-stone-500 block text-[9px]">Audited Sequestration Factor:</span>
                    <span className="font-bold text-emerald-400">0.352 MT CO₂e/ac/yr</span>
                  </div>
                </div>
              </div>

              {/* Auditor Assessment Notes */}
              <div className="p-3.5 bg-stone-900 rounded-xl border border-stone-800 text-xs space-y-2">
                <span className="font-bold text-stone-200 block">Lead Auditor Calculation Assessment:</span>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  The calculation engine properly integrates the Tier 2 USDA COMET-Farm emission coefficient for multi-species legume-grass cover crops. Soil texture classification (Fine-Loamy Mollisol) confirmed through SSURGO API match. The 15% uncertainty deduction satisfies conservative quantification criteria under ISO 14064-2 §5.4.
                </p>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px] pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Calculation Algorithm Conformant with Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VERIFICATION WORKFLOW & CHECKLIST (P0) */}
      {/* ========================================================================= */}
      {activeTab === 'verification_workflow' && (
        <div className="space-y-6">
          {/* Status Pipeline Visualizer */}
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-4">
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              5-Stage Assurance Verification Pipeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {pipelineStages.map((ps, idx) => (
                <div
                  key={ps.stage}
                  className={`p-4 rounded-xl border transition-all ${
                    engagement.status === ps.stage
                      ? 'bg-cyan-950/80 border-cyan-500 shadow-lg shadow-cyan-950/50'
                      : 'bg-stone-900/90 border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-200">{ps.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      engagement.status === ps.stage ? 'bg-cyan-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                    }`}>
                      {ps.count}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 leading-tight mt-1">{ps.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Protocol Checklist */}
          <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ISO 14064-3 / GHG Protocol LSR Verification Protocol Checklist
              </h3>
              <span className="text-xs font-mono text-cyan-400">9 of 10 Items Verified (90%)</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { title: '1. Organizational & Geographical Boundary Verification', standard: 'ISO 14064-3 §5.1', status: 'verified', note: 'Field GIS boundaries reconciled with county parcel tax records.' },
                { title: '2. Additionality & Regulatory Baseline Confirmation', standard: 'GHG Protocol LSR §4.1', status: 'verified', note: 'Practice adoption verified as exceeding statutory soil conservation minimums.' },
                { title: '3. Multispectral Sentinel-2 Canopy Emergence Validation', standard: 'Copernicus Level-2A BOA', status: 'verified', note: 'NDVI vegetation surge verified on 8 spectral passes throughout autumn/spring.' },
                { title: '4. Soil Core Lab Accreditation & Chain of Custody (ISO 17025)', standard: 'ISO 17025 / LECO', status: 'verified', note: 'Midwest Labs accreditation verified; sample custody seals intact.' },
                { title: '5. Baseline SOC Stratification & Bulk Density Calibration', standard: 'ISO 14064-2 §5.3', status: 'flagged', note: 'Finding #FIND-102 currently under review by soil science auditor.' },
                { title: '6. Scope 1 Agricultural Fuel & Direct Machinery Emissions', standard: 'IPCC Tier 1 / 2', status: 'verified', note: 'Fuel invoices and operational hours verified for tillage & planting.' },
                { title: '7. Uncertainty Deductions & Conservatism Buffer Pool (15%)', standard: 'GHG Protocol LSR §6.4', status: 'verified', note: 'Permanence risk buffer applied in calculation engine v1.5.' },
                { title: '8. Materiality Threshold & Sample Size Verification (5% limit)', standard: 'ISO 14064-3 §6.2', status: 'verified', note: 'Total aggregated error rate &lt; 1.4% (well below 5% materiality threshold).' },
                { title: '9. Non-Double Counting & Registry Serial Reconciliation', standard: 'ISO 14064-2 §5.8', status: 'verified', note: 'No overlapping claims detected in Verra, Climate Action Reserve, or Indigo Ag.' },
                { title: '10. Independent Verifier Attestation & Declaration of Impartiality', standard: 'ISO 14065 §7.2', status: 'verified', note: 'Lead auditor conflict of interest review completed with zero findings.' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-200">{item.title}</span>
                      <span className="text-[10px] text-stone-500 font-mono">[{item.standard}]</span>
                    </div>
                    <p className="text-[11px] text-stone-400">{item.note}</p>
                  </div>

                  <div>
                    {item.status === 'verified' ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold font-mono text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 font-bold font-mono text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> FINDING OPEN
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FINDINGS & ISSUE MANAGEMENT (P0) */}
      {/* ========================================================================= */}
      {activeTab === 'findings_ledger' && (
        <div className="space-y-6">
          {/* Controls & Filters */}
          <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-400">Severity:</span>
                <select
                  value={findingSeverityFilter}
                  onChange={(e) => setFindingSeverityFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-700 text-stone-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                  <option value="observation">Observation</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-400">Status:</span>
                <select
                  value={findingStatusFilter}
                  onChange={(e) => setFindingStatusFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-700 text-stone-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="corrected">Corrected</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowAddFindingModal(true)}
              className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              New Non-Conformance Finding
            </button>
          </div>

          {/* Findings List */}
          <div className="space-y-3">
            {filteredFindings.map((finding) => {
              const severityBadge = {
                critical: 'bg-red-950 border-red-800 text-red-400',
                major: 'bg-amber-950 border-amber-800 text-amber-400',
                minor: 'bg-yellow-950 border-yellow-800 text-yellow-400',
                observation: 'bg-blue-950 border-blue-800 text-blue-400'
              }[finding.severity];

              const statusBadge = {
                open: 'bg-red-950 border-red-800 text-red-400',
                under_review: 'bg-blue-950 border-blue-800 text-blue-400',
                corrected: 'bg-lime-950 border-lime-800 text-lime-400',
                closed: 'bg-emerald-950 border-emerald-800 text-emerald-400'
              }[finding.resolutionStatus];

              return (
                <div key={finding.id} className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${severityBadge}`}>
                        {finding.severity}
                      </span>
                      <span className="font-mono text-xs text-stone-400 font-bold">#{finding.id.toUpperCase()}</span>
                      <span className="text-stone-600">&bull;</span>
                      <span className="text-xs text-stone-300 font-semibold">{finding.farmName} &bull; {finding.fieldName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${statusBadge}`}>
                        Status: {finding.resolutionStatus.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">Due: {finding.dueDate}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-stone-100">{finding.title}</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">{finding.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 block uppercase font-mono">Affected Metric</span>
                      <span className="text-stone-200 font-mono mt-0.5 block">{finding.relatedMetric}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 block uppercase font-mono">Required Corrective Action</span>
                      <span className="text-amber-300 font-medium mt-0.5 block">{finding.requiredCorrectiveAction}</span>
                    </div>
                  </div>

                  {finding.resolutionNotes && (
                    <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/60 text-xs">
                      <span className="text-[10px] font-bold text-blue-400 uppercase font-mono block">Grower / Agronomist Response:</span>
                      <p className="text-stone-300 mt-0.5">{finding.resolutionNotes}</p>
                    </div>
                  )}

                  {/* Auditor Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/80 text-xs">
                    <span className="text-[10px] font-mono text-stone-500">Flagged by: {finding.flaggedBy} on {finding.flaggedAt}</span>

                    <div className="flex items-center gap-1.5">
                      {finding.resolutionStatus !== 'closed' && (
                        <>
                          <button
                            onClick={() => handleUpdateFindingStatus(finding.id, 'under_review')}
                            className="bg-stone-800 hover:bg-stone-700 text-blue-300 px-3 py-1 rounded-lg text-xs font-semibold transition"
                          >
                            Mark In Review
                          </button>
                          <button
                            onClick={() => handleUpdateFindingStatus(finding.id, 'corrected')}
                            className="bg-stone-800 hover:bg-stone-700 text-lime-300 px-3 py-1 rounded-lg text-xs font-semibold transition"
                          >
                            Accept Correction
                          </button>
                          <button
                            onClick={() => handleUpdateFindingStatus(finding.id, 'closed')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1 rounded-lg text-xs font-bold transition shadow-md"
                          >
                            Sign-Off &amp; Close
                          </button>
                        </>
                      )}
                      {finding.resolutionStatus === 'closed' && (
                        <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Auditor Verified &amp; Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIT TRAIL & IMMUTABLE LOG (P0/P1) */}
      {/* ========================================================================= */}
      {activeTab === 'audit_trail' && (
        <div className="space-y-6">
          <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-500" />
              <input
                type="text"
                placeholder="Search actor, standard, action, or SHA-256 hash..."
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 w-full focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-stone-400">Total Certified Events:</span>
              <span className="font-bold text-cyan-400">{filteredAuditEvents.length}</span>
            </div>
          </div>

          {/* Audit Ledger Table */}
          <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-900 text-stone-400 font-mono text-[10px] uppercase border-b border-stone-800">
                <tr>
                  <th className="p-3.5">Timestamp (UTC)</th>
                  <th className="p-3.5">Actor &amp; Role</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target Entity &amp; Details</th>
                  <th className="p-3.5">Compliance Standard</th>
                  <th className="p-3.5">SHA-256 Checksum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredAuditEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-stone-900/50 transition">
                    <td className="p-3.5 font-mono text-stone-400 whitespace-nowrap text-[11px]">{evt.timestamp}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-semibold text-stone-200 block">{evt.actor}</span>
                      <span className="text-[10px] uppercase font-mono text-cyan-400">[{evt.actorRole}]</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                        evt.actionType === 'verify' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        evt.actionType === 'flag' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        evt.actionType === 'approve' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        'bg-stone-800 text-stone-300'
                      }`}>
                        {evt.actionType}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-sm">
                      <span className="font-semibold text-stone-200 block">{evt.entityName}</span>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">{evt.details}</p>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-stone-400 whitespace-nowrap">{evt.complianceStandard}</td>
                    <td className="p-3.5 font-mono text-[10px] text-stone-500 whitespace-nowrap">
                      <span className="bg-stone-900 px-2 py-1 rounded border border-stone-800 block truncate max-w-[120px]" title={evt.sha256Signature}>
                        {evt.sha256Signature.slice(0, 16)}...
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ISO 14064-3 ASSURANCE STATEMENT GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 'assurance_statement' && (
        <div className="space-y-6">
          <div className="bg-stone-950 p-6 sm:p-8 rounded-3xl border border-stone-800 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono tracking-widest block">
                  OFFICIAL AUDIT DELIVERABLE
                </span>
                <h3 className="text-xl font-bold text-stone-100 mt-0.5">
                  Independent Limited Assurance Verification Statement
                </h3>
                <p className="text-xs text-stone-400">
                  In Accordance with ISO 14064-3:2019 and GHG Protocol Land Sector and Removals Guidance
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    showToast('Exported ISO 14064-3 Verification Statement (PDF & JSON)!');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
                >
                  <Download className="w-4 h-4" />
                  Download Assurance Statement (PDF)
                </button>
              </div>
            </div>

            {/* Opinion Statement Document Box */}
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4 text-xs font-sans text-stone-300 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-stone-800 font-mono text-[11px]">
                <div>
                  <span className="text-stone-500 block text-[9px] uppercase">Reporting Entity:</span>
                  <strong className="text-stone-100">{currentFarm.name} ({currentFarm.ownerName})</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[9px] uppercase">Assurance Standard:</span>
                  <strong className="text-cyan-400">ISO 14064-3:2019 / Level: Limited</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[9px] uppercase">Verified Total Removal:</span>
                  <strong className="text-emerald-400 font-mono">{currentFarm.fields.reduce((acc, f) => acc + f.carbonBreakdown.totalGrossMT, 0).toFixed(1)} MT CO₂e</strong>
                </div>
              </div>

              <h4 className="font-bold text-stone-100 uppercase font-mono text-xs">1. Independent Verification Opinion</h4>
              <p>
                Apex Sustainability Assurance &amp; Standards Body LLC has conducted a limited assurance verification of the greenhouse gas (GHG) assertion and soil carbon quantification submitted by <strong>{currentFarm.name}</strong> for the period January 1, 2026 to December 31, 2026.
              </p>
              <p>
                Based on the verification procedures performed, nothing has come to our attention that causes us to believe that the greenhouse gas assertion is not fairly stated, in all material respects, in accordance with the GHG Protocol Land Sector and Removals Guidance and USDA COMET-Farm Tier 2 quantification methodologies.
              </p>

              <h4 className="font-bold text-stone-100 uppercase font-mono text-xs pt-2">2. Scope &amp; Materiality</h4>
              <p>
                The verification scope encompassed {currentFarm.totalAcreage.toLocaleString()} acres across {currentFarm.fields.length} field management units. The materiality threshold was set at 5.0% of total assertion volume. The aggregate unadjusted discrepancy was calculated at <strong>1.14%</strong>, satisfying all assurance criteria.
              </p>

              <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-stone-400">
                <div>
                  <span>Lead Verifier Signature: </span>
                  <span className="text-stone-200 font-semibold font-serif italic">Dr. Evelyn Reed, Ph.D., Lead Verifier</span>
                </div>
                <div>
                  <span>Digital Hash: </span>
                  <span className="text-cyan-400 font-mono">SHA256: 7f8a9c...3e1d</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG NEW FINDING / NON-CONFORMANCE */}
      {/* ========================================================================= */}
      {showAddFindingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Log Audit Finding / Non-Conformance
              </h3>
              <button
                onClick={() => setShowAddFindingModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Finding Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discrepancy in Cover Crop Seeding Date vs Sentinel-2 Emergence"
                  value={newFindingTitle}
                  onChange={(e) => setNewFindingTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Severity Level</label>
                  <select
                    value={newFindingSeverity}
                    onChange={(e) => setNewFindingSeverity(e.target.value as FindingSeverity)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="critical">Critical Non-Conformance</option>
                    <option value="major">Major Non-Conformance</option>
                    <option value="minor">Minor Non-Conformance</option>
                    <option value="observation">Observation / Recommendation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Affected Metric</label>
                  <input
                    type="text"
                    value={newFindingMetric}
                    onChange={(e) => setNewFindingMetric(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Finding Description &amp; Technical Basis</label>
                <textarea
                  rows={3}
                  placeholder="Explain why evidence is insufficient or where divergence was detected..."
                  value={newFindingDesc}
                  onChange={(e) => setNewFindingDesc(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Required Corrective Action *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Provide certified seed purchase invoice and calibrated bulk density curve"
                  value={newFindingAction}
                  onChange={(e) => setNewFindingAction(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Corrective Action Due Date</label>
                <input
                  type="date"
                  value={newFindingDueDate}
                  onChange={(e) => setNewFindingDueDate(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddFindingModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-5 py-2 rounded-xl font-bold shadow-lg shadow-amber-950/40"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
