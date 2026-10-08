import React, { useState } from 'react';
import { 
  Sprout, 
  Map, 
  Activity, 
  FileCheck2, 
  Calculator, 
  FileText, 
  CreditCard, 
  Bot, 
  Building2, 
  Users, 
  Tractor, 
  ShieldCheck, 
  Layers, 
  ChevronDown, 
  Bell, 
  FileSpreadsheet, 
  AlertTriangle, 
  Globe2, 
  BookOpen,
  User,
  Lock,
  LogOut,
  Smartphone,
  Laptop,
  FolderKanban,
  Home,
  Scale,
  Rocket,
  Plus
} from 'lucide-react';
import { Farm, UserPersona } from '../types';
import { ExtendedAuthUser } from '../data/mockAuthData';

interface NavbarProps {
  currentTab: 'map' | 'satellite' | 'practices' | 'estimator' | 'tutorial' | 'geographic' | 'workspace' | 'org_audit';
  onSelectTab: (tab: 'map' | 'satellite' | 'practices' | 'estimator' | 'tutorial' | 'workspace' | 'org_audit') => void;
  activePersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
  farms: Farm[];
  currentFarm: Farm;
  onSelectFarm: (farm: Farm) => void;
  onOpenReportModal: () => void;
  onOpenPricingModal: () => void;
  onToggleAIAssistant: () => void;
  onOpenTerraSoilPdf?: () => void;
  activeAlertsCount?: number;
  onOpenAlertModal?: () => void;
  onExportCSV?: () => void;
  currentUser?: ExtendedAuthUser | null;
  onOpenAuthModal?: () => void;
  onOpenSecurityModal?: () => void;
  onLogout?: () => void;
  activeSessionsCount?: number;
  onReturnToLanding?: () => void;
  onOpenClaimsRegister?: () => void;
  onOpenAlphaLaunchModal?: () => void;
  onOpenCreateFarmModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activePersona,
  onSelectPersona,
  farms,
  currentFarm,
  onSelectFarm,
  onOpenReportModal,
  onOpenPricingModal,
  onToggleAIAssistant,
  onOpenTerraSoilPdf,
  activeAlertsCount = 0,
  onOpenAlertModal,
  onExportCSV,
  currentUser,
  onOpenAuthModal,
  onOpenSecurityModal,
  onLogout,
  activeSessionsCount = 3,
  onReturnToLanding,
  onOpenClaimsRegister,
  onOpenAlphaLaunchModal,
  onOpenCreateFarmModal,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 text-stone-200">
      {/* Top Utility & Persona Switcher Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-4 border-b border-stone-900/80 text-xs">
        {/* Brand Identity */}
        <div 
          onClick={onReturnToLanding}
          className={`flex items-center gap-3 ${onReturnToLanding ? 'cursor-pointer group hover:opacity-95' : ''}`}
          title={onReturnToLanding ? 'Return to Landing Screen' : undefined}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-500 p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-100 text-sm tracking-tight group-hover:text-emerald-300 transition-colors">TerraSoil</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                MRV PORTAL
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-medium">
              Carbon &amp; Soil-Management Verification System
            </p>
          </div>
        </div>

        {/* Persona Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 p-1 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-stone-400 px-2">Role:</span>
          <button
            onClick={() => onSelectPersona('farmer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activePersona === 'farmer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/80'
            }`}
          >
            <Tractor className="w-3.5 h-3.5" />
            Farmer / Grower
          </button>
          <button
            onClick={() => onSelectPersona('agronomist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activePersona === 'agronomist'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/80'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Agronomist / Consultant
          </button>
          <button
            onClick={() => onSelectPersona('corporate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activePersona === 'corporate'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Corporate Scope 3
          </button>
          <button
            onClick={() => onSelectPersona('auditor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activePersona === 'auditor'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/80'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Auditor / Verifier
          </button>
        </div>

        {/* Farm / Client / Supplier Operation Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-stone-400 text-[11px] font-medium hidden sm:inline">Operation:</label>
            <select
              value={currentFarm.id}
              onChange={(e) => {
                const f = farms.find((item) => item.id === e.target.value);
                if (f) onSelectFarm(f);
              }}
              className="bg-stone-900 border border-stone-700 text-stone-100 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.totalAcreage.toLocaleString()} ac)
                </option>
              ))}
            </select>
            {onOpenCreateFarmModal && (
              <button
                onClick={onOpenCreateFarmModal}
                className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                title="Create New Agricultural Enterprise (Journey Step 1)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">New Farm</span>
              </button>
            )}
          </div>

          {/* User Account & Security Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-emerald-600/50 text-stone-200 text-xs transition"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-800 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-white uppercase">{currentUser.name.charAt(0)}</span>
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-200 text-xs truncate max-w-[120px]">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    currentUser.role === 'farmer' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    currentUser.role === 'agronomist' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    currentUser.role === 'corporate' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {currentUser.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl p-2 z-50 space-y-1 text-xs"
                  onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-stone-800/80 mb-1">
                    <p className="font-bold text-stone-100 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{currentUser.email || currentUser.phone}</p>
                    <p className="text-[10px] text-stone-500 truncate mt-0.5">{currentUser.organization}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-emerald-400">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{currentUser.mfaEnabled ? 'MFA Protected (Two-Factor Active)' : 'MFA Disabled'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSelectTab('workspace');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-emerald-950/40 text-emerald-300 flex items-center justify-between transition border border-transparent hover:border-emerald-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">Personal Command Center</span>
                    </div>
                    <span className="bg-emerald-900/40 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold">
                      Console
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onOpenSecurityModal) onOpenSecurityModal();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-stone-800 text-stone-200 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Security &amp; Sessions</span>
                    </div>
                    <span className="bg-stone-800 text-stone-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-stone-700">
                      {activeSessionsCount} active
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSelectTab('org_audit');
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-stone-800 text-stone-200 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>Org, Permissions &amp; Audit</span>
                    </div>
                    <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-800/80">
                      Audit Trail
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-stone-800 text-stone-200 flex items-center gap-2 transition"
                  >
                    <User className="w-4 h-4 text-stone-400" />
                    <span>Switch Role / Account Profile</span>
                  </button>

                  {onReturnToLanding && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onReturnToLanding();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-stone-800 text-emerald-400 flex items-center gap-2 transition"
                    >
                      <Home className="w-4 h-4 text-emerald-400" />
                      <span>Back to Landing Screen</span>
                    </button>
                  )}

                  <div className="pt-1 border-t border-stone-800/80">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-950/60 text-rose-300 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs & Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-4">
        {/* Navigation Tabs (5 core tabs, geographic accessible directly in Field GIS Mapping) */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onSelectTab('map')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentTab === 'map' || currentTab === 'geographic'
                ? 'bg-stone-800 text-emerald-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Map className="w-4 h-4" />
            Field GIS Mapping
          </button>

          <button
            onClick={() => onSelectTab('satellite')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentTab === 'satellite'
                ? 'bg-stone-800 text-emerald-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            Satellite &amp; Soil Telemetry
          </button>

          <button
            onClick={() => onSelectTab('practices')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentTab === 'practices'
                ? 'bg-stone-800 text-emerald-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Practice Activity Ledger
          </button>

          <button
            onClick={() => onSelectTab('estimator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentTab === 'estimator'
                ? 'bg-stone-800 text-emerald-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Carbon Estimator &amp; ROI
          </button>

          <button
            onClick={() => onSelectTab('tutorial')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentTab === 'tutorial'
                ? 'bg-stone-800 text-emerald-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
            title="Interactive Tutorial: Platform Guide & Carbon Soil Management Science"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Tutorial</span>
            <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline">
              Site &amp; Science
            </span>
          </button>

          <button
            onClick={() => onSelectTab('workspace')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentTab === 'workspace'
                ? 'bg-stone-800 text-emerald-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
            title="Personal Command Center: Activity Journal, Projects, Evidence & Tasks"
          >
            <FolderKanban className="w-4 h-4 text-emerald-400" />
            <span>Command Center</span>
            <span className="text-[10px] text-emerald-400 font-mono hidden xl:inline">
              Workspace
            </span>
          </button>

          <button
            onClick={() => onSelectTab('org_audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              currentTab === 'org_audit'
                ? 'bg-stone-800 text-emerald-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
            title="Organization Hierarchy, 5-Role Permission Table & System-of-Record Audit Log"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Org &amp; Audit</span>
            <span className="text-[10px] text-emerald-400 font-mono hidden xl:inline">
              P0
            </span>
          </button>
        </nav>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-2.5">
          {/* Soil Moisture Alert Center Trigger */}
          {onOpenAlertModal && (
            <button
              onClick={onOpenAlertModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeAlertsCount > 0
                  ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 animate-pulse'
                  : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700/80'
              }`}
              title={activeAlertsCount > 0 ? `${activeAlertsCount} moisture deficit alerts active` : 'Soil moisture alert settings'}
            >
              {activeAlertsCount > 0 ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-stone-400" />
              )}
              <span className="hidden sm:inline">Moisture Alerts</span>
              {activeAlertsCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {activeAlertsCount}
                </span>
              )}
            </button>
          )}

          {/* Quick CSV Export */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Export active field telemetry and practice records as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Export CSV</span>
            </button>
          )}

          {onOpenTerraSoilPdf && (
            <button
              onClick={onOpenTerraSoilPdf}
              className="bg-stone-900 hover:bg-stone-800 text-stone-200 border border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition hover:text-emerald-300"
              title="Download official TerraSoil AI specification whitepaper (PDF)"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">AI Whitepaper (PDF)</span>
            </button>
          )}

          {onOpenClaimsRegister && (
            <button
              onClick={onOpenClaimsRegister}
              className="bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Inspect Public Scientific Claims & Methodology Register"
            >
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">Claims Register</span>
              <span className="text-[10px] font-mono text-cyan-400 border border-cyan-800/80 bg-cyan-950/80 px-1 rounded">3-State</span>
            </button>
          )}

          {onOpenAlphaLaunchModal && (
            <button
              onClick={onOpenAlphaLaunchModal}
              className="bg-stone-900 hover:bg-stone-800 text-stone-300 border border-emerald-800/80 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition hover:text-emerald-300"
              title="Open PRD-18 Alpha Launch Readiness Hub & 5-Step Journey Verifier"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Alpha Readiness</span>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-800/80 bg-emerald-950/80 px-1 rounded font-bold">PRD-18</span>
            </button>
          )}

          <button
            onClick={onOpenPricingModal}
            className="bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700/80 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            Plans &amp; Pricing
          </button>

          <button
            onClick={onOpenReportModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition hover:scale-105 active:scale-95"
            title="Generate Audit-Ready Field Evidence Report Package (Not Independently Verified)"
          >
            <FileText className="w-3.5 h-3.5" />
            Field Evidence Report
          </button>

          <button
            onClick={onToggleAIAssistant}
            className="bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-emerald-800/80 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition hover:scale-105"
            title="Open AI On-site Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">AI Advisor</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>
      </div>
    </header>
  );
};
