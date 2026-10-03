import React, { useState, useMemo } from 'react';
import { 
  UserPersona, 
  PersonalActivityJournalEntry, 
  WorkspaceProject, 
  EvidenceLibraryItem, 
  SavedMapView, 
  SavedReportItem, 
  WorkspaceTask, 
  WorkspaceNotification, 
  ProfessionalIdentityProfile,
  Farm
} from '../types';
import { ExtendedAuthUser } from '../data/mockAuthData';
import { 
  MOCK_ACTIVITY_JOURNAL, 
  MOCK_WORKSPACE_PROJECTS, 
  MOCK_ROLE_IMPACTS, 
  MOCK_EVIDENCE_LIBRARY, 
  MOCK_SAVED_MAPS, 
  MOCK_SAVED_REPORTS, 
  MOCK_WORKSPACE_TASKS, 
  MOCK_WORKSPACE_NOTIFICATIONS, 
  MOCK_PROFESSIONAL_IDENTITIES 
} from '../data/personalWorkspaceData';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Map, 
  Layers, 
  Calendar, 
  CheckSquare, 
  Bell, 
  Award, 
  Building2, 
  Search, 
  Plus, 
  ExternalLink, 
  Download, 
  Eye, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  X, 
  ChevronRight, 
  TrendingUp, 
  Tractor, 
  Users, 
  Briefcase, 
  Globe2, 
  Mail, 
  Phone, 
  FileSpreadsheet, 
  Camera, 
  FlaskConical, 
  Receipt, 
  FolderKanban, 
  Edit3, 
  Key, 
  LogOut, 
  Share2, 
  AlertCircle 
} from 'lucide-react';

interface PersonalWorkspaceHubProps {
  currentUser: ExtendedAuthUser;
  activePersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
  onNavigateTab: (tab: 'map' | 'satellite' | 'practices' | 'estimator' | 'tutorial' | 'org_audit') => void;
  onOpenSecurityModal: () => void;
  onOpenAuthModal: () => void;
  onOpenReportModal: () => void;
  onOpenTerraSoilPdf?: () => void;
  currentFarm: Farm;
}

type MainNavSection = 'profile' | 'my_work' | 'account' | 'organization';
type MyWorkSubSection = 'activity' | 'projects' | 'tasks' | 'maps' | 'reports' | 'evidence';
type AccountSubSection = 'info' | 'security' | 'notifications' | 'preferences';
type OrgSubSection = 'profile' | 'team' | 'permissions' | 'billing' | 'api';

export const PersonalWorkspaceHub: React.FC<PersonalWorkspaceHubProps> = ({
  currentUser,
  activePersona,
  onSelectPersona,
  onNavigateTab,
  onOpenSecurityModal,
  onOpenAuthModal,
  onOpenReportModal,
  onOpenTerraSoilPdf,
  currentFarm
}) => {
  // Navigation State (Matching PRD Section 13)
  const [activeSection, setActiveSection] = useState<MainNavSection>('profile');
  const [activeWorkTab, setActiveWorkTab] = useState<MyWorkSubSection>('activity');
  const [activeAccountTab, setActiveAccountTab] = useState<AccountSubSection>('info');
  const [activeOrgTab, setActiveOrgTab] = useState<OrgSubSection>('profile');

  // Interactive Local States
  const [journalEntries, setJournalEntries] = useState<PersonalActivityJournalEntry[]>(
    MOCK_ACTIVITY_JOURNAL[activePersona] || MOCK_ACTIVITY_JOURNAL.farmer
  );
  const [journalFilter, setJournalFilter] = useState<string>('all');
  const [journalSearch, setJournalSearch] = useState<string>('');

  const [projects, setProjects] = useState<WorkspaceProject[]>(MOCK_WORKSPACE_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<WorkspaceProject | null>(null);

  const [evidenceItems, setEvidenceItems] = useState<EvidenceLibraryItem[]>(MOCK_EVIDENCE_LIBRARY);
  const [evidenceCategoryFilter, setEvidenceCategoryFilter] = useState<string>('all');
  const [evidenceSearch, setEvidenceSearch] = useState<string>('');
  const [selectedEvidencePreview, setSelectedEvidencePreview] = useState<EvidenceLibraryItem | null>(null);

  const [savedMaps, setSavedMaps] = useState<SavedMapView[]>(MOCK_SAVED_MAPS);
  const [savedReports, setSavedReports] = useState<SavedReportItem[]>(MOCK_SAVED_REPORTS);

  const [tasks, setTasks] = useState<WorkspaceTask[]>(MOCK_WORKSPACE_TASKS);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<WorkspaceNotification[]>(MOCK_WORKSPACE_NOTIFICATIONS);
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalIdentityProfile>(
    MOCK_PROFESSIONAL_IDENTITIES[activePersona] || MOCK_PROFESSIONAL_IDENTITIES.agronomist
  );
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editBio, setEditBio] = useState<string>(professionalProfile.bio);
  const [editYears, setEditYears] = useState<number>(professionalProfile.yearsExperience);

  // Success Toast local notification
  const [localToast, setLocalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 3500);
  };

  // Sync datasets when persona changes
  React.useEffect(() => {
    setJournalEntries(MOCK_ACTIVITY_JOURNAL[activePersona] || MOCK_ACTIVITY_JOURNAL.farmer);
    setProfessionalProfile(MOCK_PROFESSIONAL_IDENTITIES[activePersona] || MOCK_PROFESSIONAL_IDENTITIES.farmer);
  }, [activePersona]);

  // Role impact metrics
  const impactData = MOCK_ROLE_IMPACTS[activePersona] || MOCK_ROLE_IMPACTS.farmer;

  // Task actions
  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: WorkspaceTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      farmOrFieldName: currentFarm.name,
      dueDateStr: 'Due in 3 days',
      isOverdue: false,
      priority: 'medium',
      completed: false,
      category: 'practice_log',
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
    setShowAddTaskModal(false);
    showToast('Task added to your personal work center.');
  };

  // Notification actions
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  // Filtered Activity Journal
  const filteredJournal = useMemo(() => {
    return journalEntries.filter((item) => {
      const matchesType = journalFilter === 'all' || item.actionType === journalFilter;
      const matchesSearch =
        !journalSearch ||
        item.title.toLowerCase().includes(journalSearch.toLowerCase()) ||
        item.detail.toLowerCase().includes(journalSearch.toLowerCase()) ||
        item.targetName.toLowerCase().includes(journalSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [journalEntries, journalFilter, journalSearch]);

  // Group filtered journal by day
  const groupedJournal = useMemo(() => {
    const groups: Record<string, PersonalActivityJournalEntry[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Earlier: [],
    };
    filteredJournal.forEach((entry) => {
      if (groups[entry.dateGroup]) {
        groups[entry.dateGroup].push(entry);
      } else {
        groups['Earlier'].push(entry);
      }
    });
    return groups;
  }, [filteredJournal]);

  // Filtered Evidence Items
  const filteredEvidence = useMemo(() => {
    return evidenceItems.filter((item) => {
      const matchesCat = evidenceCategoryFilter === 'all' || item.category === evidenceCategoryFilter;
      const matchesSearch =
        !evidenceSearch ||
        item.title.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
        item.fieldName.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
        item.cryptographicHash.toLowerCase().includes(evidenceSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [evidenceItems, evidenceCategoryFilter, evidenceSearch]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskFilter === 'completed') return t.completed;
      if (taskFilter === 'pending') return !t.completed;
      if (taskFilter === 'overdue') return t.isOverdue && !t.completed;
      return true;
    });
  }, [tasks, taskFilter]);

  const overdueCount = tasks.filter((t) => t.isOverdue && !t.completed).length;
  const dueThisWeekCount = tasks.filter((t) => !t.completed && !t.isOverdue).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Profile Completeness calculation
  const completenessItems = [
    { label: 'Basic profile & organization details', done: true },
    { label: 'Verified work email & phone credentials', done: true },
    { label: 'Multi-Factor Authentication (MFA) enabled', done: currentUser.mfaEnabled },
    { label: 'Professional license / certification ID registered', done: Boolean(professionalProfile.licenseNumber) },
    { label: 'Secondary account recovery email configured', done: Boolean(currentUser.recoveryEmail) },
  ];
  const completedItemsCount = completenessItems.filter((i) => i.done).length;
  const completenessPct = Math.round((completedItemsCount / completenessItems.length) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {localToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-emerald-500/80 text-stone-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200 text-xs">
          <div className="p-1 bg-emerald-950 text-emerald-400 rounded-lg">
            <Check className="w-4 h-4" />
          </div>
          <span>{localToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PROFILE HEADER & PERSONAL COMMAND CENTER (PRD §2) */}
      {/* ========================================================================= */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-800">
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-emerald-950 border-2 border-emerald-500/60 shadow-lg shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-emerald-400">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900" title="Active Online" />
            </div>

            {/* Profile Identity Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{currentUser.name}</h1>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">ACTIVE</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-medium text-stone-300">
                {currentUser.jobTitle || 'Lead Agronomic Specialist'}
                <span className="mx-2 text-stone-600">·</span>
                <span className="text-stone-400">{currentUser.organization}</span>
              </p>

              {/* Unboxed Metadata Discipline */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <span>{currentUser.email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>{currentUser.phone}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{currentUser.mfaEnabled ? 'MFA Enforced' : 'MFA Pending'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveSection('account');
                setActiveAccountTab('info');
                setIsEditingProfile(true);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={onOpenSecurityModal}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Security</span>
            </button>

            <button
              onClick={onOpenAuthModal}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Switch Role</span>
            </button>
          </div>
        </div>

        {/* Real Data Workspace Counters (Role-Dependent) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6">
          {impactData.metrics.map((m, idx) => (
            <div key={idx} className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-400 font-medium">{m.label}</span>
              <p className="text-xl sm:text-2xl font-bold text-stone-100">{m.value}</p>
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                <span className="truncate">{m.subtext}</span>
                {m.changeTrend && <span className="text-emerald-400 font-medium shrink-0 ml-1">{m.changeTrend}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROFILE 4-SECTION NAVIGATION (PRD §13) */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-2">
        <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 p-1.5 rounded-2xl text-xs">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeSection === 'profile'
                ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>PROFILE</span>
          </button>

          <button
            onClick={() => setActiveSection('my_work')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeSection === 'my_work'
                ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>MY WORK</span>
            {tasks.filter((t) => !t.completed).length > 0 && (
              <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-emerald-800">
                {tasks.filter((t) => !t.completed).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('account')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeSection === 'account'
                ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>ACCOUNT</span>
          </button>

          <button
            onClick={() => setActiveSection('organization')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeSection === 'organization'
                ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>ORGANIZATION</span>
          </button>
        </div>

        {/* Global Notifications Quick Bell */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setActiveSection('account');
              setActiveAccountTab('notifications');
            }}
            className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition flex items-center gap-2"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Notifications</span>
            {unreadNotifCount > 0 && (
              <span className="bg-amber-600 text-stone-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: PROFILE (Overview, My Impact, Completeness, Professional ID) */}
      {/* ========================================================================= */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          {/* Top Row: My Impact & Profile Completeness */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Impact Panel (PRD §5) */}
            <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">My Impact &amp; Role Footprint</h2>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {activePersona.toUpperCase()} PROTOCOL
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {impactData.summaryText}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {impactData.metrics.map((metric, i) => (
                  <div key={i} className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase">{metric.label}</span>
                    <p className="text-lg font-bold text-emerald-400">{metric.value}</p>
                    <p className="text-[10px] text-stone-500">{metric.subtext}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-stone-800/80">
                <span className="text-stone-400">
                  Data sourced from active parcel polygons, remote sensing indices, and verified practice records.
                </span>
                <button
                  onClick={onOpenReportModal}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                >
                  <span>Export Impact Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Profile Completeness (PRD §11) */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Profile Completeness</span>
                  </h3>
                  <span className="text-sm font-bold font-mono text-emerald-400">{completenessPct}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-300"
                    style={{ width: `${completenessPct}%` }}
                  />
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  {completenessItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        item.done ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-stone-950 text-stone-600 border border-stone-800'
                      }`}>
                        {item.done ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-stone-700" />}
                      </div>
                      <span className={item.done ? 'text-stone-300' : 'text-stone-500'}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {completenessPct < 100 && (
                <button
                  onClick={() => {
                    setActiveSection('account');
                    setActiveAccountTab('security');
                    onOpenSecurityModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition"
                >
                  Complete Profile &amp; Verify
                </button>
              )}
            </div>
          </div>

          {/* Professional Identity (PRD §12) */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Professional Identity &amp; Credentials</h3>
                    {professionalProfile.verifiedProfessional && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        VERIFIED PROFESSIONAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400">
                    Accredited specializations, geographic licensing, and registry verification metadata.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-xs text-stone-200 font-semibold border border-stone-700 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Credentials'}</span>
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold">Professional Bio &amp; Practice Focus</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold">Years of Experience</label>
                    <input
                      type="number"
                      value={editYears}
                      onChange={(e) => setEditYears(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-semibold">License / Registry Number</label>
                    <input
                      type="text"
                      value={professionalProfile.licenseNumber}
                      onChange={(e) =>
                        setProfessionalProfile((prev) => ({ ...prev, licenseNumber: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setProfessionalProfile((prev) => ({
                        ...prev,
                        bio: editBio,
                        yearsExperience: editYears,
                      }));
                      setIsEditingProfile(false);
                      showToast('Professional credentials updated.');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-stone-300 leading-relaxed">{professionalProfile.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Core Specializations
                    </span>
                    <div className="space-y-1 text-stone-300">
                      {professionalProfile.specializations.map((spec, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Regions Served
                    </span>
                    <div className="space-y-1 text-stone-300">
                      {professionalProfile.regionsServed.map((reg, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{reg}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Certifications &amp; Registry
                    </span>
                    <div className="space-y-1 text-stone-300">
                      {professionalProfile.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{cert}</span>
                        </div>
                      ))}
                      <div className="pt-1 text-[11px] text-stone-500 font-mono">
                        License: {professionalProfile.licenseNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: MY WORK (Activity, Projects, Tasks, Maps, Reports, Evidence) */}
      {/* ========================================================================= */}
      {activeSection === 'my_work' && (
        <div className="space-y-6">
          {/* Work Tabs Segmented Control */}
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-900 border border-stone-800 p-1.5 rounded-2xl text-xs">
            <button
              onClick={() => setActiveWorkTab('activity')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeWorkTab === 'activity' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Activity Journal (P0)</span>
            </button>

            <button
              onClick={() => setActiveWorkTab('projects')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeWorkTab === 'projects' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Projects &amp; Diary ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveWorkTab('tasks')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeWorkTab === 'tasks' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks</span>
              {tasks.filter((t) => !t.completed).length > 0 && (
                <span className="bg-emerald-950 text-emerald-300 font-mono text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-800">
                  {tasks.filter((t) => !t.completed).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveWorkTab('evidence')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeWorkTab === 'evidence' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Evidence Library (P0)</span>
            </button>

            <button
              onClick={() => setActiveWorkTab('maps')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeWorkTab === 'maps' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Saved Maps ({savedMaps.length})</span>
            </button>

            <button
              onClick={() => setActiveWorkTab('reports')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeWorkTab === 'reports' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Saved Reports ({savedReports.length})</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* SUBTAB 1: ACTIVITY JOURNAL (PRD §3) */}
          {/* ========================================================= */}
          {activeWorkTab === 'activity' && (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span>Activity Journal (P0)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Records meaningful actions taken in plain language. Answers &quot;what did I do?&quot; (distinct from data audit trail).
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
                    <input
                      type="text"
                      value={journalSearch}
                      onChange={(e) => setJournalSearch(e.target.value)}
                      placeholder="Search activities..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
                    />
                  </div>

                  <select
                    value={journalFilter}
                    onChange={(e) => setJournalFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Action Types</option>
                    <option value="field_updated">Field Updates</option>
                    <option value="soil_sample_added">Soil Samples</option>
                    <option value="report_generated">Reports</option>
                    <option value="practice_logged">Practices</option>
                    <option value="evidence_uploaded">Evidence</option>
                  </select>
                </div>
              </div>

              {/* Grouped Day Timeline */}
              <div className="space-y-6">
                {(['Today', 'Yesterday', 'This Week', 'Earlier'] as const).map((groupName) => {
                  const itemsInGroup = groupedJournal[groupName];
                  if (!itemsInGroup || itemsInGroup.length === 0) return null;

                  return (
                    <div key={groupName} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                          {groupName}
                        </span>
                        <div className="flex-1 h-px bg-stone-800/80" />
                      </div>

                      <div className="space-y-2.5">
                        {itemsInGroup.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-stone-700 transition"
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-stone-500 font-semibold mt-0.5 shrink-0">
                                {item.timeStr}
                              </span>
                              <div className="space-y-0.5">
                                <h4 className="font-bold text-stone-200">{item.title}</h4>
                                <p className="text-stone-400 leading-relaxed">{item.detail}</p>
                              </div>
                            </div>

                            {item.actionLabel && (
                              <button
                                onClick={() => {
                                  if (item.actionTab) onNavigateTab(item.actionTab);
                                  else if (item.targetType === 'report') onOpenReportModal();
                                  else if (item.targetType === 'evidence') setActiveWorkTab('evidence');
                                  showToast(`Navigated to ${item.targetName}`);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-stone-700/80 font-semibold transition shrink-0 self-start sm:self-center flex items-center gap-1"
                              >
                                <span>{item.actionLabel}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 2: PROJECTS & PROJECT DIARY (PRD §4) */}
          {/* ========================================================= */}
          {activeWorkTab === 'projects' && (
            <div className="space-y-6">
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FolderKanban className="w-5 h-5 text-emerald-400" />
                      <span>Projects &amp; Project Diary (P1)</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Track enrolled acreage, ongoing soil health programs, and chronological milestone logs.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3 flex flex-col justify-between hover:border-emerald-700/50 transition cursor-pointer"
                      onClick={() => setSelectedProject(proj)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-stone-100 text-sm">{proj.name}</h4>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 uppercase">
                            {proj.status}
                          </span>
                        </div>

                        {/* Unboxed Metadata Discipline */}
                        <div className="text-xs text-stone-400 flex items-center gap-1.5">
                          <span>{proj.fieldsCount} fields</span>
                          <span aria-hidden="true">·</span>
                          <span>{proj.acres.toLocaleString()} acres</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-400">Program Progress</span>
                            <span className="font-mono text-emerald-400 font-bold">{proj.progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-stone-900 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${proj.progressPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 text-xs space-y-1 text-stone-400">
                          <p className="truncate">
                            <strong className="text-stone-300">Next task:</strong> {proj.nextTask}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Last activity: {proj.lastActivity}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(proj);
                        }}
                        className="w-full mt-2 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 text-emerald-400 font-semibold text-xs border border-stone-800 transition flex items-center justify-center gap-1.5"
                      >
                        <span>Open Project Diary &amp; Timeline</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Diary Timeline Drill-Down Modal / Panel */}
              {selectedProject && (
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Project Diary: {selectedProject.name}</span>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {selectedProject.acres.toLocaleString()} ac
                        </span>
                      </h4>
                      <p className="text-xs text-stone-400">Chronological log of milestones and audit flags</p>
                    </div>

                    <button
                      onClick={() => setSelectedProject(null)}
                      className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {selectedProject.timeline.map((event) => (
                      <div
                        key={event.id}
                        className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-start gap-3 text-xs"
                      >
                        <div className="font-mono text-stone-400 font-bold text-[11px] w-14 shrink-0 mt-0.5">
                          {event.dateStr}
                        </div>

                        <div className="p-1 rounded-lg shrink-0">
                          {event.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {event.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {event.status === 'info' && <Check className="w-4 h-4 text-cyan-400" />}
                          {event.status === 'pending' && <Clock className="w-4 h-4 text-stone-500" />}
                        </div>

                        <div className="space-y-0.5 flex-1">
                          <h5 className="font-bold text-stone-200">{event.title}</h5>
                          {event.notes && <p className="text-stone-400">{event.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 3: TASKS (PRD §9) */}
          {/* ========================================================= */}
          {activeWorkTab === 'tasks' && (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                    <span>Personal Work Center: Tasks (P1)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tasks tied to specific fields, farms, or compliance deadlines.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTaskFilter(taskFilter === 'overdue' ? 'all' : 'overdue')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    taskFilter === 'overdue'
                      ? 'bg-rose-950/40 border-rose-600'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-rose-400">Overdue</span>
                  <p className="text-2xl font-bold text-stone-100">{overdueCount}</p>
                </button>

                <button
                  onClick={() => setTaskFilter(taskFilter === 'pending' ? 'all' : 'pending')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    taskFilter === 'pending'
                      ? 'bg-amber-950/40 border-amber-600'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-amber-400">Due This Week</span>
                  <p className="text-2xl font-bold text-stone-100">{dueThisWeekCount}</p>
                </button>

                <button
                  onClick={() => setTaskFilter(taskFilter === 'completed' ? 'all' : 'completed')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    taskFilter === 'completed'
                      ? 'bg-emerald-950/40 border-emerald-600'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Completed</span>
                  <p className="text-2xl font-bold text-stone-100">{completedCount}</p>
                </button>
              </div>

              {/* Task List */}
              <div className="space-y-2.5">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 text-xs ${
                      t.completed ? 'bg-stone-950/50 border-stone-850 opacity-60' : 'bg-stone-950 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskCompletion(t.id)}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                          t.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-stone-700 hover:border-emerald-500'
                        }`}
                      >
                        {t.completed && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="space-y-0.5">
                        <h4 className={`font-semibold ${t.completed ? 'line-through text-stone-500' : 'text-stone-200'}`}>
                          {t.title}
                        </h4>
                        <div className="text-[11px] text-stone-400 flex items-center gap-2">
                          <span>{t.farmOrFieldName}</span>
                          <span>·</span>
                          <span className={t.isOverdue && !t.completed ? 'text-rose-400 font-bold' : 'text-stone-400'}>
                            {t.dueDateStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTaskCompletion(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold transition"
                    >
                      {t.completed ? 'Mark Pending' : 'Mark Done'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 4: EVIDENCE LIBRARY (PRD §6 - P0) */}
          {/* ========================================================= */}
          {activeWorkTab === 'evidence' && (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <span>My Evidence &amp; Verification Dossier (P0)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Surfaces all soil tests, fertilizer invoices, ground truth photographs, and satellite proofs powering audits.
                  </p>
                </div>

                {/* Filter and Category Selectors */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
                    <input
                      type="text"
                      value={evidenceSearch}
                      onChange={(e) => setEvidenceSearch(e.target.value)}
                      placeholder="Search evidence..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
                    />
                  </div>

                  <select
                    value={evidenceCategoryFilter}
                    onChange={(e) => setEvidenceCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All 8 Categories</option>
                    <option value="Soil Tests">Soil Tests</option>
                    <option value="Fertilizer Records">Fertilizer Records</option>
                    <option value="Farm Records">Farm Records</option>
                    <option value="Invoices">Invoices &amp; Seed Bills</option>
                    <option value="Practice Verification">Practice Verification</option>
                    <option value="Satellite Evidence">Satellite Evidence</option>
                    <option value="Reports">Reports &amp; Assurances</option>
                    <option value="Field Photos">Field Photos</option>
                  </select>
                </div>
              </div>

              {/* Evidence Items List */}
              <div className="space-y-3">
                {filteredEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-emerald-700/50 transition"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-emerald-400 shrink-0">
                        {ev.category === 'Soil Tests' && <FlaskConical className="w-5 h-5 text-emerald-400" />}
                        {ev.category === 'Invoices' && <Receipt className="w-5 h-5 text-amber-400" />}
                        {ev.category === 'Satellite Evidence' && <Globe2 className="w-5 h-5 text-cyan-400" />}
                        {ev.category === 'Practice Verification' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        {ev.category === 'Field Photos' && <Camera className="w-5 h-5 text-lime-400" />}
                        {ev.category === 'Reports' && <FileText className="w-5 h-5 text-purple-400" />}
                        {ev.category === 'Fertilizer Records' && <Receipt className="w-5 h-5 text-sky-400" />}
                        {ev.category === 'Farm Records' && <Briefcase className="w-5 h-5 text-stone-400" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-stone-100 text-sm">{ev.title}</h4>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.2 rounded border border-emerald-800">
                            {ev.category}
                          </span>
                        </div>

                        {/* Unboxed Metadata Discipline */}
                        <div className="text-stone-400 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          <span>{ev.fieldName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{ev.fileType.toUpperCase()} ({ev.fileSizeStr})</span>
                          <span aria-hidden="true">·</span>
                          <span>Uploaded {ev.uploadDate}</span>
                        </div>

                        {ev.description && (
                          <p className="text-[11px] text-stone-400 pt-0.5">{ev.description}</p>
                        )}

                        <div className="font-mono text-[10px] text-stone-500 truncate max-w-lg pt-0.5">
                          {ev.cryptographicHash}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => setSelectedEvidencePreview(ev)}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => showToast(`Downloaded ${ev.title}`)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 5: SAVED MAPS (PRD §7) */}
          {/* ========================================================= */}
          {activeWorkTab === 'maps' && (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Map className="w-5 h-5 text-emerald-400" />
                    <span>Saved Maps &amp; GIS Presets (P1)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Saved views across Local GIS Parcel Mapping (PRD-07) and Global Geographic Soil Maps (PRD-08).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedMaps.map((sm) => (
                  <div key={sm.id} className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-stone-100 text-sm">{sm.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-stone-900 text-emerald-400 border border-stone-800">
                          {sm.system}
                        </span>
                      </div>

                      {/* Unboxed Metadata Discipline */}
                      <div className="text-xs text-stone-400 flex items-center gap-2">
                        <span>Layer: {sm.layer}</span>
                        <span aria-hidden="true">·</span>
                        <span>{sm.savedDateStr}</span>
                      </div>

                      {sm.notes && <p className="text-xs text-stone-400 leading-relaxed pt-1">{sm.notes}</p>}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-stone-900">
                      <span className="font-mono text-[11px] text-stone-500">{sm.fieldOrRegionName}</span>
                      <button
                        onClick={() => {
                          onNavigateTab('map');
                          showToast(`Loaded map preset: ${sm.name}`);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5"
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>Open Map View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBTAB 6: SAVED REPORTS (PRD §8) */}
          {/* ========================================================= */}
          {activeWorkTab === 'reports' && (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <span>Saved Reports &amp; Verified Dossiers (P1)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Download and share audit summaries, Scope 3 exports, and soil baseline reports.
                  </p>
                </div>

                <button
                  onClick={onOpenReportModal}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate New Report</span>
                </button>
              </div>

              <div className="space-y-3">
                {savedReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-stone-100 text-sm">{rep.title}</h4>
                          <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold uppercase ${
                            rep.status === 'Verified' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                            rep.status === 'Final' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            'bg-stone-900 text-stone-400 border border-stone-700'
                          }`}>
                            {rep.status}
                          </span>
                        </div>

                        {/* Unboxed Metadata Discipline */}
                        <div className="text-stone-400 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          <span>{rep.farmName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{rep.type}</span>
                          <span aria-hidden="true">·</span>
                          <span>Generated {rep.dateGenerated}</span>
                          <span aria-hidden="true">·</span>
                          <span>{rep.fileSizeStr}</span>
                        </div>

                        {rep.summaryMetrics && (
                          <p className="text-[11px] text-stone-400 font-mono pt-0.5">{rep.summaryMetrics}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={onOpenReportModal}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => showToast(`Downloaded ${rep.title}`)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION C: ACCOUNT (Personal Info, Security, Notifications, Preferences) */}
      {/* ========================================================================= */}
      {activeSection === 'account' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-900 border border-stone-800 p-1.5 rounded-2xl text-xs">
            <button
              onClick={() => setActiveAccountTab('info')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeAccountTab === 'info' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personal Information</span>
            </button>

            <button
              onClick={() => setActiveAccountTab('security')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeAccountTab === 'security' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security &amp; Sessions</span>
            </button>

            <button
              onClick={() => setActiveAccountTab('notifications')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeAccountTab === 'notifications' ? 'bg-stone-800 text-emerald-400 shadow-sm border border-stone-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications ({unreadNotifCount} unread)</span>
            </button>
          </div>

          {activeAccountTab === 'info' && (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl text-xs">
              <h3 className="text-base font-bold text-white">Personal Contact &amp; Identity Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-stone-500 uppercase font-semibold text-[10px]">Full Name</span>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-stone-500 uppercase font-semibold text-[10px]">Registered Work Email</span>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-stone-500 uppercase font-semibold text-[10px]">Primary Mobile Phone</span>
                  <input
                    type="text"
                    defaultValue={currentUser.phone}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-stone-500 uppercase font-semibold text-[10px]">Organization Name</span>
                  <input
                    type="text"
                    defaultValue={currentUser.organization}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => showToast('Personal details updated successfully.')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
                >
                  Save Profile Info
                </button>
              </div>
            </div>
          )}

          {activeAccountTab === 'security' && (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    <span>Security &amp; Multi-Factor Authentication</span>
                  </h3>
                  <p className="text-stone-400">Two-factor protection, emergency backup keys, and active web sessions.</p>
                </div>

                <button
                  onClick={onOpenSecurityModal}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Open Full Security Console</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="text-stone-400 font-semibold">MFA Status</span>
                  <p className="text-emerald-400 font-bold text-sm">
                    {currentUser.mfaEnabled ? 'Enforced (TOTP / SMS)' : 'Deactivated'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="text-stone-400 font-semibold">Active Sessions</span>
                  <p className="text-stone-100 font-bold text-sm">3 Authorized Devices</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="text-stone-400 font-semibold">Account Recovery</span>
                  <p className="text-stone-100 font-bold text-sm">{currentUser.recoveryEmail ? 'Configured' : 'Missing'}</p>
                </div>
              </div>
            </div>
          )}

          {activeAccountTab === 'notifications' && (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Notifications &amp; Intelligence Alerts (PRD §10)</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUnreadOnly(!unreadOnly)}
                    className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
                      unreadOnly ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-stone-950 text-stone-400 border-stone-800'
                    }`}
                  >
                    Unread Only
                  </button>

                  <button
                    onClick={markAllNotificationsRead}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold border border-stone-700 transition"
                  >
                    Mark All as Read
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {notifications
                  .filter((n) => (!unreadOnly ? true : !n.read))
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                        !notif.read ? 'bg-stone-950 border-amber-800/60' : 'bg-stone-950/60 border-stone-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 shrink-0 mt-0.5">
                          {notif.severity === 'urgent' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                          {notif.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {notif.severity === 'info' && <Bell className="w-4 h-4 text-cyan-400" />}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-200">{notif.title}</h4>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                            )}
                          </div>
                          <p className="text-stone-400 leading-relaxed">{notif.message}</p>
                          <span className="text-[10px] text-stone-500 font-mono block pt-0.5">{notif.timestamp}</span>
                        </div>
                      </div>

                      {notif.actionLabel && (
                        <button
                          onClick={() => {
                            if (notif.actionTab) onNavigateTab(notif.actionTab as any);
                            showToast(`Navigated: ${notif.actionLabel}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-stone-800 font-semibold shrink-0"
                        >
                          {notif.actionLabel}
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION D: ORGANIZATION (Profile, Team, Permissions, Billing, API) */}
      {/* ========================================================================= */}
      {activeSection === 'organization' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Organization &amp; Multi-Seat Governance (PRD §13)</span>
              </h3>
              <p className="text-stone-400 mt-0.5">
                Manage organization profile, team permissions (RBAC), billing tiers, and cryptographic API integrations.
              </p>
            </div>

            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 font-bold uppercase">
              PROFESSIONAL TIER ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-stone-500">Legal Entity</span>
              <h4 className="font-bold text-stone-100 text-sm">{currentUser.organization}</h4>
              <p className="text-stone-400 text-[11px]">Primary Tenant ID: tenant-org-midwest-0849</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-stone-500">Seat Allocation</span>
              <h4 className="font-bold text-stone-100 text-sm">4 of 10 Team Seats Allocated</h4>
              <p className="text-stone-400 text-[11px]">Roles: 2 Agronomists, 1 Data Manager, 1 Auditor</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-stone-500">Subscription &amp; Billing</span>
              <h4 className="font-bold text-stone-100 text-sm">$199 / mo (Professional Tier)</h4>
              <p className="text-stone-400 text-[11px]">Unlimited fields, branded PDF dossiers, client portals</p>
            </div>
          </div>

          {/* Direct Link Banner to PRD-12 Hub */}
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Full Organization, 5-Role Permission Table &amp; System Audit Log (P0)</span>
              </div>
              <p className="text-xs text-stone-300">
                Inspect the concrete permission resolution engine, simulate data mutations with SHA-256 hashes, and manage assigned farms for team members.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('org_audit')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shrink-0 shadow-md shadow-emerald-950/40"
            >
              <span>Open Org &amp; Audit Hub</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVIDENCE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {selectedEvidencePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h4 className="font-bold text-white text-base">{selectedEvidencePreview.title}</h4>
                <p className="text-xs text-stone-400">{selectedEvidencePreview.category} · {selectedEvidencePreview.fieldName}</p>
              </div>
              <button
                onClick={() => setSelectedEvidencePreview(null)}
                className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Cryptographic SHA-256 Checksum:</span>
                <span className="text-emerald-400 font-mono font-bold">VERIFIED HASH</span>
              </div>
              <p className="font-mono text-[10px] text-stone-300 bg-stone-900 p-2 rounded-xl break-all">
                {selectedEvidencePreview.cryptographicHash}
              </p>
              <div className="grid grid-cols-2 gap-2 text-stone-400 pt-1">
                <div>
                  <span className="text-stone-500 block uppercase text-[10px]">File Type</span>
                  <span className="text-stone-200">{selectedEvidencePreview.fileType.toUpperCase()} ({selectedEvidencePreview.fileSizeStr})</span>
                </div>
                <div>
                  <span className="text-stone-500 block uppercase text-[10px]">Uploaded By</span>
                  <span className="text-stone-200">{selectedEvidencePreview.uploadedBy}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedEvidencePreview(null);
                  showToast(`Downloaded ${selectedEvidencePreview.title}`);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Verified Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD TASK MODAL */}
      {/* ========================================================================= */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h4 className="font-bold text-white text-sm">Add New Workspace Task</h4>
              <button onClick={() => setShowAddTaskModal(false)} className="p-1 rounded-lg text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-300 font-semibold">Task Description</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Upload Haney soil test for Field 18"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
