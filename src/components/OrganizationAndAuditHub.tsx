import React, { useState, useMemo } from 'react';
import { 
  OrganizationHierarchy, 
  ConcretePermissionRule, 
  DataAuditLogEntry, 
  ConcreteOrgRole, 
  UserPersona,
  Farm
} from '../types';
import { 
  MOCK_ORGANIZATION_HIERARCHY, 
  MOCK_PERMISSION_RULES, 
  MOCK_DATA_AUDIT_LOG, 
  checkPermissionAction 
} from '../data/organizationAndAuditData';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Search, 
  Plus, 
  Download, 
  ExternalLink, 
  Check, 
  X, 
  ChevronRight, 
  Clock, 
  Eye, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  FileSpreadsheet, 
  Cpu, 
  Share2, 
  Tractor, 
  Mail, 
  Phone, 
  Award, 
  GitBranch, 
  Database 
} from 'lucide-react';

interface OrganizationAndAuditHubProps {
  currentFarm: Farm;
  activePersona: UserPersona;
  onOpenReportModal: () => void;
  onNavigateTab: (tab: 'map' | 'satellite' | 'practices' | 'estimator' | 'workspace' | 'tutorial') => void;
}

export const OrganizationAndAuditHub: React.FC<OrganizationAndAuditHubProps> = ({
  currentFarm,
  activePersona,
  onOpenReportModal,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'permissions' | 'audit_log' | 'billing'>('hierarchy');

  // Organization Hierarchy State
  const [orgData, setOrgData] = useState<OrganizationHierarchy>(MOCK_ORGANIZATION_HIERARCHY);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<ConcreteOrgRole>('agronomist');

  // Permission Sandbox State
  const [testRole, setTestRole] = useState<ConcreteOrgRole>('auditor');
  const [testAction, setTestAction] = useState<
    | 'modify_measurement' 
    | 'manage_billing' 
    | 'invite_users' 
    | 'edit_farm' 
    | 'create_recommendation' 
    | 'generate_report' 
    | 'analyze_scope3' 
    | 'approve_verification'
  >('modify_measurement');
  const [testResult, setTestResult] = useState<{ allowed: boolean; reason: string } | null>(null);

  // System-of-Record Audit Log State (PRD §4)
  const [auditLogs, setAuditLogs] = useState<DataAuditLogEntry[]>(MOCK_DATA_AUDIT_LOG);
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [selectedAuditEntry, setSelectedAuditEntry] = useState<DataAuditLogEntry | null>(null);

  // Simulate mutation modal state
  const [showSimulateMutationModal, setShowSimulateMutationModal] = useState<boolean>(false);
  const [simField, setSimField] = useState<string>(currentFarm.fields[0]?.name || 'North Section 14');
  const [simPrevious, setSimPrevious] = useState<string>('2.65% SOC');
  const [simNew, setSimNew] = useState<string>('2.78% SOC');
  const [simReason, setSimReason] = useState<string>('Autumn 2026 Haney 0–30cm verification lab test');
  const [simEvidence, setSimEvidence] = useState<string>('Haney_Autumn2026_LabReport.pdf');

  // Success Toast local notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run permission check test
  const handleRunPermissionTest = () => {
    const res = checkPermissionAction(testRole, testAction);
    setTestResult(res);
  };

  // Handle Team Member Invitation
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember = {
      id: `usr-inv-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      phone: '+1 (555) 000-0000',
      role: inviteRole,
      roleDisplayName: MOCK_PERMISSION_RULES[inviteRole].roleDisplayName,
      organizationId: orgData.id,
      seatStatus: 'active' as const,
      joinedDate: new Date().toISOString().slice(0, 10),
      lastActiveDate: 'Just now',
      assignedFarms: [
        { farmId: currentFarm.id, farmName: currentFarm.name, acreage: currentFarm.totalAcreage, fieldsCount: currentFarm.fields.length }
      ]
    };

    setOrgData((prev) => ({
      ...prev,
      seatsAllocated: Math.min(prev.seatsTotal, prev.seatsAllocated + 1),
      members: [...prev.members, newMember]
    }));

    // Record this in the system audit log
    const auditRecord: DataAuditLogEntry = {
      id: `aud-${Date.now()}`,
      user: orgData.ownerName,
      userRole: 'org_owner',
      action: 'Invited team member & assigned role',
      targetType: 'permission_change',
      fieldName: 'Organization Roster',
      farmName: orgData.name,
      previousValue: `${orgData.seatsAllocated} seats allocated`,
      newValue: `${orgData.seatsAllocated + 1} seats allocated (${newMember.name} as ${newMember.roleDisplayName})`,
      reason: 'Team seat expansion for regional advisory management',
      timestamp: 'Just now',
      sha256Checksum: `0x${Array.from(newMember.email).reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0).toString(16).padStart(8, '0')}7f94b1c83a9e224d`,
      ipAddress: '172.56.21.90',
      verificationAuditSignoff: true
    };
    setAuditLogs((prev) => [auditRecord, ...prev]);

    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
    showToast(`Invited ${newMember.name} as ${newMember.roleDisplayName}`);
  };

  // Handle Simulated Data Mutation
  const handleSimulateMutation = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: DataAuditLogEntry = {
      id: `aud-${Date.now()}`,
      user: 'Alex Morgan',
      userRole: 'agronomist',
      action: 'Modified SOC measurement',
      targetType: 'field_soc',
      fieldName: simField,
      farmName: currentFarm.name,
      previousValue: simPrevious,
      newValue: simNew,
      reason: simReason,
      evidenceDocName: simEvidence,
      timestamp: 'Just now',
      sha256Checksum: `0x${Math.random().toString(16).slice(2, 10)}7f94b1c83a9e224d08b3c690184e90df3a67`,
      ipAddress: '172.56.21.90',
      verificationAuditSignoff: true
    };

    setAuditLogs((prev) => [newEntry, ...prev]);
    setShowSimulateMutationModal(false);
    showToast(`Logged immutable data mutation for ${simField}: ${simPrevious} → ${simNew}`);
  };

  // Export Audit Trail as CSV
  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Target Field', 'Previous Value', 'New Value', 'Reason', 'Evidence Document', 'SHA-256 Checksum', 'IP Address'];
    const rows = auditLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.user}"`,
      `"${log.userRole}"`,
      `"${log.action}"`,
      `"${log.fieldName}"`,
      `"${log.previousValue}"`,
      `"${log.newValue}"`,
      `"${log.reason}"`,
      `"${log.evidenceDocName || 'N/A'}"`,
      `"${log.sha256Checksum}"`,
      `"${log.ipAddress}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TerraSoil_SystemOfRecord_AuditLog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported complete data audit trail as CSV.');
  };

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch = 
        !auditSearch ||
        log.fieldName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.reason.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.sha256Checksum.toLowerCase().includes(auditSearch.toLowerCase());
      
      const matchesType = 
        auditActionFilter === 'all' || 
        log.targetType === auditActionFilter;

      return matchesSearch && matchesType;
    });
  }, [auditLogs, auditSearch, auditActionFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-emerald-500/80 text-stone-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200 text-xs">
          <div className="p-1 bg-emerald-950 text-emerald-400 rounded-lg">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800/80 shadow-md">
                <Building2 className="w-5 h-5 stroke-[2.5]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                PRD-12 INFRASTRUCTURE
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
              Organization, Permissions &amp; Data Audit Log
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              Multi-user organization hierarchy, concrete 5-role permission engine, and the immutable system-of-record audit log answering &quot;what happened to the data?&quot;
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Team Member</span>
            </button>

            <button
              onClick={handleExportAuditCSV}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>
        </div>

        {/* Top Hierarchy Counter Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 text-xs">
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Legal Organization</span>
            <p className="text-base font-bold text-stone-100 truncate">{orgData.name}</p>
            <p className="text-[10px] text-emerald-400 font-mono">Tenant: {orgData.id}</p>
          </div>

          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Seat Utilization</span>
            <p className="text-base font-bold text-stone-100 font-mono">
              {orgData.seatsAllocated} of {orgData.seatsTotal} Allocated
            </p>
            <div className="w-full h-1 bg-stone-900 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(orgData.seatsAllocated / orgData.seatsTotal) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Managed Portfolio</span>
            <p className="text-base font-bold text-stone-100">
              {orgData.farmsCount} Farms · {orgData.totalAcres.toLocaleString()} ac
            </p>
            <p className="text-[10px] text-stone-400">Across 6 Regional River Basins</p>
          </div>

          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Subscription Tier</span>
            <p className="text-base font-bold text-emerald-400">
              {orgData.tier} (${orgData.subscriptionPricePerMo}/mo)
            </p>
            <p className="text-[10px] text-stone-400">Unlimited fields &amp; branded exports</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 bg-stone-900 border border-stone-800 p-1.5 rounded-2xl text-xs">
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'hierarchy' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Organization Data Model (P0)</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'permissions' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>5-Role Permission Table &amp; Sandbox (P0)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'audit_log' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>System-of-Record Audit Log (P0)</span>
          <span className="bg-emerald-950 text-emerald-300 font-mono text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-800">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'billing' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Commercial Tiers &amp; Subscriptions</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORGANIZATION HIERARCHY (PRD §2, P0) */}
      {/* ========================================================================= */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          {/* Visual Data Model Tree: Organization → Users → Farms → Fields → Projects → Data */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Hierarchical Account Architecture (PRD §2)</h3>
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                Organization → Users → Farms → Fields → Projects → Data
              </span>
            </div>

            <p className="text-stone-300 leading-relaxed">
              Extends PRD-01 with an explicit multi-user, multi-farm hierarchy required for selling seat-based and org-level commercial subscriptions.
            </p>

            {/* Tree Diagram Visualizer */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Building2 className="w-4 h-4" />
                <span>{orgData.name} (Organization Root)</span>
              </div>

              <div className="pl-6 space-y-2 border-l border-stone-800 text-stone-300">
                {orgData.members.map((member) => (
                  <div key={member.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500">├──</span>
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold text-stone-100">{member.name}</span>
                      <span className="text-[10px] text-stone-400 font-sans">({member.roleDisplayName})</span>
                    </div>

                    <div className="pl-8 space-y-1 text-stone-400 text-[11px]">
                      {member.assignedFarms.map((farm, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-stone-600">└──</span>
                          <Tractor className="w-3 h-3 text-emerald-400" />
                          <span className="text-stone-300">{farm.farmName}</span>
                          <span className="text-stone-500">({farm.acreage.toLocaleString()} ac · {farm.fieldsCount} fields)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Member Roster & Seat Management */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-base font-bold text-white">Active Team Members &amp; Seat Allocation</h3>
                <p className="text-stone-400">Manage member privileges, assigned farm access, and seat statuses.</p>
              </div>

              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 font-bold">
                {orgData.seatsAllocated} / {orgData.seatsTotal} SEATS USED
              </span>
            </div>

            <div className="space-y-3">
              {orgData.members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-stone-700 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 shrink-0">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-emerald-400">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-100 text-sm">{member.name}</h4>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                          member.role === 'org_owner' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                          member.role === 'agronomist' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                          member.role === 'corporate_analyst' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                          member.role === 'auditor' ? 'bg-cyan-950 text-cyan-300 border-cyan-800' :
                          'bg-stone-900 text-stone-300 border-stone-700'
                        }`}>
                          {member.role.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Unboxed Metadata Discipline */}
                      <div className="text-stone-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{member.email}</span>
                        <span aria-hidden="true">·</span>
                        <span>{member.phone}</span>
                        <span aria-hidden="true">·</span>
                        <span>Joined {member.joinedDate}</span>
                      </div>

                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-0.5">
                        <Tractor className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Assigned Farms: </span>
                        <strong className="text-stone-300">
                          {member.assignedFarms.map((f) => f.farmName).join(', ')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{member.lastActiveDate}</span>
                    </span>

                    <button
                      onClick={() => showToast(`Permissions configured for ${member.name}`)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-200 border border-stone-800 font-semibold transition"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONCRETE PERMISSION TABLE & SANDBOX (PRD §3, P0) */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Concrete Role Definitions Table (PRD §3) */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Concrete Permission System (PRD §3)</h3>
              </div>
              <span className="text-stone-400 text-xs">
                Built on PRD-01 Role + Organization + Farm + Data Type + Action Model
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-stone-950 text-stone-400">
                    <th className="p-3 font-semibold">Role</th>
                    <th className="p-3 font-semibold">Permissions &amp; Capabilities (&quot;Can&quot;)</th>
                    <th className="p-3 font-semibold text-rose-400">Structural Restrictions (&quot;Cannot&quot;)</th>
                    <th className="p-3 font-semibold">Governing Security Logic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  <tr className="hover:bg-stone-950/60 transition">
                    <td className="p-3 font-bold text-amber-300">Organization Owner</td>
                    <td className="p-3 text-stone-200">
                      Manage billing, invite users, manage permissions, view all farms, export data, configure calibrations.
                    </td>
                    <td className="p-3 text-stone-500">None (Root Administrator)</td>
                    <td className="p-3 text-stone-400 font-mono text-[11px]">PRD-12 §3 Root Authority</td>
                  </tr>

                  <tr className="hover:bg-stone-950/60 transition">
                    <td className="p-3 font-bold text-emerald-300">Agronomist</td>
                    <td className="p-3 text-stone-200">
                      Edit farms, create agronomic recommendations, calibrate emission factors, generate branded PDF reports.
                    </td>
                    <td className="p-3 text-rose-400/80">Cannot manage billing or invite org owners.</td>
                    <td className="p-3 text-stone-400 font-mono text-[11px]">PRD-03 §3.1 Advisory Scope</td>
                  </tr>

                  <tr className="hover:bg-stone-950/60 transition">
                    <td className="p-3 font-bold text-emerald-400">Farmer</td>
                    <td className="p-3 text-stone-200">
                      Edit own farm parcels, upload practice evidence &amp; invoices, view recommendations, track payouts.
                    </td>
                    <td className="p-3 text-rose-400/80">Cannot view or edit other growers&apos; confidential farm records.</td>
                    <td className="p-3 text-stone-400 font-mono text-[11px]">PRD-02 §3.1 Producer Scope</td>
                  </tr>

                  <tr className="hover:bg-stone-950/60 transition">
                    <td className="p-3 font-bold text-purple-300">Corporate Analyst</td>
                    <td className="p-3 text-stone-200">
                      View supplier data, aggregate Scope 3 Land Sector emissions, audit data integrity hashes, export filings.
                    </td>
                    <td className="p-3 text-rose-400/80">Cannot mutate underlying farm measurements or farm finances.</td>
                    <td className="p-3 text-stone-400 font-mono text-[11px]">PRD-04 §4.1 Insetting Scope</td>
                  </tr>

                  <tr className="hover:bg-cyan-950/20 transition bg-cyan-950/10 border-l-2 border-cyan-500">
                    <td className="p-3 font-bold text-cyan-300">Auditor</td>
                    <td className="p-3 text-stone-200">
                      Review evidence, comment on records, inspect dossiers, approve/reject certification seals.
                    </td>
                    <td className="p-3 font-bold text-rose-400">
                      STRICTLY CANNOT change underlying measurements (Enforced at logic engine level).
                    </td>
                    <td className="p-3 text-cyan-400 font-mono text-[11px]">ISO 14064-3 / Verra VM0042</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/80 text-xs text-stone-300 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>The Auditor Restriction Rule (PRD §3 Highlight)</span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                Data integrity depends on verification being <strong>structurally separated from editing</strong>, not just a UI convention. The computational engine blocks all measurement mutations initiated by an Auditor account regardless of client-side interface state.
              </p>
            </div>
          </div>

          {/* Interactive Permission Sandbox & Tester */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Live Permission Enforcement Sandbox</h3>
              </div>
              <span className="text-stone-400 font-mono">Real-Time Logic Evaluation</span>
            </div>

            <p className="text-stone-300">
              Test how the backend permission engine evaluates action authorizations across the five concrete roles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-stone-400 font-semibold uppercase text-[10px]">Test Role</label>
                <select
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value as ConcreteOrgRole)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                >
                  <option value="auditor">Auditor (Review &amp; Verify)</option>
                  <option value="farmer">Farmer (Producer)</option>
                  <option value="agronomist">Agronomist (Consultant)</option>
                  <option value="corporate_analyst">Corporate Analyst (Scope 3)</option>
                  <option value="org_owner">Organization Owner</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-semibold uppercase text-[10px]">Action to Attempt</label>
                <select
                  value={testAction}
                  onChange={(e) => setTestAction(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                >
                  <option value="modify_measurement">Modify SOC Measurement (Dry Combustion Result)</option>
                  <option value="manage_billing">Manage Billing &amp; Subscriptions</option>
                  <option value="invite_users">Invite Team Member</option>
                  <option value="edit_farm">Edit Farm Boundary</option>
                  <option value="create_recommendation">Create Agronomic Recommendation</option>
                  <option value="generate_report">Generate Compliance Report</option>
                  <option value="analyze_scope3">Analyze Scope 3 Supply Shed</option>
                  <option value="approve_verification">Approve Verification Statement</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunPermissionTest}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Execute Permission Check</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-4 rounded-2xl border transition animate-in fade-in duration-200 ${
                testResult.allowed
                  ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-700 text-rose-300'
              }`}>
                <div className="flex items-start gap-2.5">
                  {testResult.allowed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-sm">
                      {testResult.allowed ? 'ACTION PERMITTED' : 'PERMISSION DENIED — ACCESS BLOCKED'}
                    </h5>
                    <p className="text-xs leading-relaxed opacity-90">{testResult.reason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYSTEM-OF-RECORD DATA AUDIT LOG (PRD §4, P0) */}
      {/* ========================================================================= */}
      {activeTab === 'audit_log' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">System-of-Record Audit Log (P0)</h3>
              </div>
              <p className="text-stone-400 mt-0.5">
                Answers <strong className="text-stone-200">&quot;what happened to the data?&quot;</strong> — distinct from PRD-11&apos;s Activity Journal (&quot;what did I do?&quot;). Defensible trail for enterprise &amp; corporate buyers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowSimulateMutationModal(true)}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-semibold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Data Mutation</span>
              </button>

              <button
                onClick={handleExportAuditCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail by field, user, action, hash..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Mutation Types</option>
              <option value="field_soc">SOC Measurements</option>
              <option value="practice_record">Practice Records</option>
              <option value="baseline_config">Emission Factors &amp; Baselines</option>
              <option value="field_boundary">Field Boundaries (GIS)</option>
              <option value="permission_change">Permission &amp; Verifications</option>
            </select>
          </div>

          {/* Exact Audit Log Schema Entries Matching PRD §4 */}
          <div className="space-y-3">
            {filteredAuditLogs.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 hover:border-emerald-700/60 transition"
              >
                {/* Header Line */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-850 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-100">{entry.action}</span>
                    <span className="text-stone-500">·</span>
                    <span className="text-emerald-400 font-semibold">{entry.fieldName}</span>
                    <span className="text-stone-600">({entry.farmName})</span>
                  </div>

                  <span className="font-mono text-[11px] text-stone-400">{entry.timestamp}</span>
                </div>

                {/* Visual Mutation Diff (PRD §4 Format) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-stone-900/60 p-3 rounded-xl border border-stone-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-rose-400">Previous State</span>
                    <p className="font-mono text-stone-300">{entry.previousValue}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">New Mutated State</span>
                    <p className="font-mono text-emerald-300 font-bold">{entry.newValue}</p>
                  </div>
                </div>

                {/* Audit Context Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-stone-400 text-[11px]">
                  <div>
                    <strong className="text-stone-300">User:</strong> {entry.user} ({entry.userRole})
                  </div>
                  <div>
                    <strong className="text-stone-300">Reason:</strong> {entry.reason}
                  </div>
                  <div>
                    <strong className="text-stone-300">Evidence:</strong> {entry.evidenceDocName || 'N/A (Direct Attestation)'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-900 text-[10px] text-stone-500 font-mono">
                  <span>SHA-256 Merkle Root: {entry.sha256Checksum}</span>
                  <span>IP: {entry.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMMERCIAL TIERS & SUBSCRIPTIONS (PRD §2 & §8) */}
      {/* ========================================================================= */}
      {activeTab === 'billing' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Commercial Tier &amp; Multi-Seat Licensing</span>
              </h3>
              <p className="text-stone-400 mt-0.5">
                Seat-based and org-level pricing architectures supporting agronomists, corporations, and enterprise buyers.
              </p>
            </div>

            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 font-bold uppercase">
              ACTIVE SUBSCRIPTION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <span className="text-[10px] uppercase font-bold text-stone-500">Basic Farmer Tier</span>
              <p className="text-2xl font-bold text-stone-100">$29–49 <span className="text-xs font-normal text-stone-400">/ mo</span></p>
              <p className="text-stone-400 leading-relaxed">
                For individual farmers managing single farm boundaries, satellite NDVI telemetry, and basic COMET carbon estimates.
              </p>
              <div className="pt-2 text-stone-400 space-y-1">
                <p>• 1 User Seat</p>
                <p>• Up to 2,500 acres</p>
                <p>• Standard CSV exports</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-600/80 space-y-3 relative">
              <span className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                CURRENT PLAN
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-400">Professional Tier</span>
              <p className="text-2xl font-bold text-white">$199 <span className="text-xs font-normal text-stone-400">/ mo</span></p>
              <p className="text-stone-300 leading-relaxed">
                For consultants and agronomists managing multi-farm client portfolios, team seats, custom calibrations, and branded PDF dossiers.
              </p>
              <div className="pt-2 text-stone-300 space-y-1">
                <p className="font-semibold text-emerald-400">• 10 Allocated Team Seats</p>
                <p>• Unlimited Farms &amp; Parcels</p>
                <p>• Branded Compliance PDF Reports</p>
                <p>• Multi-Client Switcher</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <span className="text-[10px] uppercase font-bold text-stone-500">Corporate &amp; Enterprise</span>
              <p className="text-2xl font-bold text-stone-100">Custom <span className="text-xs font-normal text-stone-400">/ ~$0.50/ac/yr</span></p>
              <p className="text-stone-400 leading-relaxed">
                For food &amp; consumer goods brands tracking Scope 3 Land Sector supply sheds, API integrations, and audited merkle proofs.
              </p>
              <div className="pt-2 text-stone-400 space-y-1">
                <p>• Unlimited Team &amp; Auditor Seats</p>
                <p>• 100,000+ Enrolled Acres</p>
                <p>• Merkle Lineage Verification API</p>
                <p>• Dedicated VVB Audit Portal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INVITE TEAM MEMBER MODAL */}
      {/* ========================================================================= */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h4 className="font-bold text-white text-base">Invite Team Member to Organization</h4>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rachel Torres, CCA"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold">Work Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. rachel@greenfield-advisory.ag"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold">Role &amp; Permission Level (PRD §3)</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ConcreteOrgRole)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="agronomist">Agronomist (Edit farms, recommendations, reports)</option>
                  <option value="farmer">Farmer (Edit own farm, upload evidence)</option>
                  <option value="corporate_analyst">Corporate Analyst (View suppliers, Scope 3 analysis)</option>
                  <option value="auditor">Auditor (Review, comment, approve — NO measurement edits)</option>
                  <option value="org_owner">Organization Owner (Billing &amp; full authority)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Dispatch Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIMULATE DATA MUTATION MODAL */}
      {/* ========================================================================= */}
      {showSimulateMutationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h4 className="font-bold text-white text-base">Simulate Measurement Data Mutation</h4>
              <button onClick={() => setShowSimulateMutationModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateMutation} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-semibold">Target Field Parcel</label>
                <input
                  type="text"
                  value={simField}
                  onChange={(e) => setSimField(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold">Previous Value</label>
                  <input
                    type="text"
                    value={simPrevious}
                    onChange={(e) => setSimPrevious(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-300 font-semibold">New Value</label>
                  <input
                    type="text"
                    value={simNew}
                    onChange={(e) => setSimNew(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold">Scientific Reason for Mutation</label>
                <input
                  type="text"
                  value={simReason}
                  onChange={(e) => setSimReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-semibold">Supporting Evidence File</label>
                <input
                  type="text"
                  value={simEvidence}
                  onChange={(e) => setSimEvidence(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateMutationModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Emit to Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
