import React, { useState } from 'react';
import { 
  Sprout, 
  ArrowRight, 
  ShieldCheck, 
  Map, 
  Activity, 
  FileCheck2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  Tractor, 
  Users, 
  Building2, 
  Scale, 
  ChevronRight, 
  Bot, 
  Calendar, 
  Layers, 
  Camera, 
  TrendingUp, 
  Globe2, 
  Check, 
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  BarChart3,
  Award,
  Code,
  Database,
  Info,
  ExternalLink,
  BookOpen,
  Cpu,
  Rocket
} from 'lucide-react';
import { UserPersona } from '../types';
import { MOCK_AUTH_USERS, ExtendedAuthUser } from '../data/mockAuthData';
import { LegalModal } from './LegalModal';
import { ClaimsRegisterModal } from './ClaimsRegisterModal';
import { DataStateBadge } from './DataStateBadge';

interface LandingScreenProps {
  currentUser: ExtendedAuthUser | null;
  onLoginSuccess: (user: ExtendedAuthUser) => void;
  onStartNow: () => void;
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onOpenPricingModal: () => void;
  onOpenReportModal: () => void;
  onOpenAIAssistant: () => void;
  onOpenTerraSoilPdf?: () => void;
  onOpenAlphaLaunchModal?: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  currentUser,
  onLoginSuccess,
  onStartNow,
  onOpenAuthModal,
  onOpenPricingModal,
  onOpenReportModal,
  onOpenAIAssistant,
  onOpenTerraSoilPdf,
  onOpenAlphaLaunchModal,
}) => {
  // Authentication & Sandbox Card Mode: 'demo' (instant sandbox) vs 'signin' (registered account)
  const [authCardMode, setAuthCardMode] = useState<'demo' | 'signin'>('demo');
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserPersona>('farmer');
  
  // Sign-In Form State
  const [emailInput, setEmailInput] = useState<string>('dale@heartlandfarms.com');
  const [passwordInput, setPasswordInput] = useState<string>('TerraSoil2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginSuccessFeedback, setLoginSuccessFeedback] = useState<string | null>(null);

  // Audience Tabs (Section 2)
  const [activeAudienceTab, setActiveAudienceTab] = useState<'farmer' | 'agronomist' | 'corporate'>('farmer');

  // Pricing Toggle (Section 6)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Legal Modal State (High-Priority Legal & Data Rights)
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'data_rights'>('data_rights');

  // PRD-17 Claims Register State
  const [isClaimsRegisterOpen, setIsClaimsRegisterOpen] = useState<boolean>(false);

  const openLegalModalWithTab = (tab: 'privacy' | 'terms' | 'data_rights') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Handle Quick Demo Account Switch
  const handleSelectDemoRole = (role: UserPersona) => {
    setSelectedDemoRole(role);
    const mockUser = MOCK_AUTH_USERS[role];
    if (mockUser) {
      setEmailInput(mockUser.email);
      setPasswordInput('TerraSoil2026!');
      setLoginError(null);
    }
  };

  // Handle Form Submission for Registered Sign-In
  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching mock user by email
      const matchedRole = (Object.keys(MOCK_AUTH_USERS) as UserPersona[]).find(
        (role) => MOCK_AUTH_USERS[role].email.toLowerCase() === emailInput.trim().toLowerCase()
      );

      if (matchedRole) {
        const user = MOCK_AUTH_USERS[matchedRole];
        onLoginSuccess(user);
        setLoginSuccessFeedback(`Authenticated as ${user.name} (${user.role.toUpperCase()})`);
        setIsSubmitting(false);
        setTimeout(() => {
          onStartNow();
        }, 400);
      } else if (emailInput.trim().length > 3) {
        // Fallback for custom email: assign based on selected demo role
        const baseUser = MOCK_AUTH_USERS[selectedDemoRole];
        const customUser: ExtendedAuthUser = {
          ...baseUser,
          id: `usr-${Date.now()}`,
          name: emailInput.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: emailInput.trim(),
          role: selectedDemoRole,
          lastLoginAt: new Date().toISOString(),
        };
        onLoginSuccess(customUser);
        setLoginSuccessFeedback(`Welcome, ${customUser.name}!`);
        setIsSubmitting(false);
        setTimeout(() => {
          onStartNow();
        }, 400);
      } else {
        setLoginError('Please enter a valid email address.');
        setIsSubmitting(false);
      }
    }, 350);
  };

  // Instant 1-Click Sandbox Launch (No authentication friction)
  const handleQuickLaunchAs = (role: UserPersona) => {
    const user = MOCK_AUTH_USERS[role];
    if (user) {
      onLoginSuccess(user);
      onStartNow();
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Floating Glass Navigation */}
      <nav className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-500 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-100 text-base tracking-tight">TerraSoil</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  MRV PORTAL
                </span>
              </div>
              <p className="text-[10px] text-stone-400 hidden sm:block">
                Carbon &amp; Soil-Management Tracking Portal
              </p>
            </div>
          </div>

          {/* Center Links (Restructured 7 Sections + PRD-17 Claims Register) */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-stone-300 font-medium">
            <a href="#overview" className="hover:text-emerald-400 transition">Overview</a>
            <a href="#audiences" className="hover:text-emerald-400 transition">Stakeholders</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
            <a href="#science" className="hover:text-emerald-400 transition">Science &amp; Jargon</a>
            <a href="#trust" className="hover:text-emerald-400 transition">Scope &amp; Data Rights</a>
            <a href="#pricing" className="hover:text-emerald-400 transition">Plans &amp; Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition">FAQ</a>
            <button
              onClick={() => setIsClaimsRegisterOpen(true)}
              className="text-amber-400 hover:text-amber-300 transition font-mono flex items-center gap-1 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded"
            >
              <Scale className="w-3 h-3" />
              <span>Claims Register</span>
            </button>
            {onOpenAlphaLaunchModal && (
              <button
                onClick={onOpenAlphaLaunchModal}
                className="text-emerald-400 hover:text-emerald-300 transition font-mono flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded font-bold"
                title="Inspect PRD-18 Alpha Launch Readiness & 5-Step Journey Suite"
              >
                <Rocket className="w-3 h-3" />
                <span>Alpha Readiness</span>
              </button>
            )}
            <button 
              onClick={onOpenAIAssistant}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-stone-200">{currentUser.name}</div>
                  <div className="text-[10px] text-emerald-400 uppercase font-mono">{currentUser.role}</div>
                </div>
                <button
                  onClick={() => onOpenAuthModal('signin')}
                  className="px-3 py-1.5 rounded-lg border border-stone-800 hover:border-stone-700 bg-stone-900 text-stone-300 text-xs font-semibold hover:bg-stone-800 transition"
                >
                  Switch User
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthCardMode('signin');
                  const element = document.getElementById('auth-card-anchor');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onOpenAuthModal('signin');
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-900 text-stone-300 text-xs font-semibold hover:bg-stone-800 transition hidden sm:inline-block"
              >
                Sign In
              </button>
            )}

            {/* Primary CTA Button */}
            <button
              onClick={onStartNow}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>Launch Demo</span>
              <ArrowRight className="w-4 h-4 text-stone-950 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO & INTERACTIVE SANDBOX ACCESS (PRD-16 + PRD-17 Corrections) */}
      {/* ========================================================================= */}
      <section id="overview" className="relative overflow-hidden pt-12 pb-20 border-b border-stone-800/80">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Proposition & Hero CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Compliance & Standard Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>USDA COMET-Farm Regional &bull; IPCC Tier 1 &bull; Sentinel-2 Copernicus</span>
              </div>

              {/* Main Headline (Opening copy requested in review) */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-100 tracking-tight leading-tight">
                Measure, track, and document <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-200">
                  soil carbon &amp; regenerative practices
                </span>{' '}
                with confidence.
              </h1>

              {/* Opening lead paragraph (PRD-17 S-1 correction: platform update interval) */}
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Built for farmers, agronomists, and agricultural supply chains. Turn field boundaries, 12-day composite satellite telemetry, and practice logs into empirical carbon estimates — without replacing your trusted agronomist.
              </p>

              {/* Action Buttons: Primary Demo + Sample Report (S-6 Field Evidence Report) + AI Assistant */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={onStartNow}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-stone-950 font-black text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-950/80 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 group"
                >
                  <Sprout className="w-5 h-5 text-stone-950 stroke-[2.5]" />
                  <span>Explore Interactive Demo</span>
                  <ArrowRight className="w-5 h-5 text-stone-950 group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
                </button>

                <button
                  onClick={onOpenReportModal}
                  className="px-5 py-3.5 rounded-2xl border border-stone-800 bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs sm:text-sm font-bold transition flex items-center gap-2 hover:border-stone-700 shadow-md"
                  title="Audit-Ready Field Evidence Report Dossier (Not Independently Verified)"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Sample Field Evidence Report</span>
                  <span className="text-[10px] text-amber-300 font-mono">(Not Verified)</span>
                </button>

                <button
                  onClick={onOpenAIAssistant}
                  className="px-4 py-3.5 rounded-2xl border border-emerald-900/40 bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-300 text-xs sm:text-sm font-semibold transition flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>AI In-App Assistant</span>
                </button>

                {onOpenAlphaLaunchModal && (
                  <button
                    onClick={onOpenAlphaLaunchModal}
                    className="px-4 py-3.5 rounded-2xl border border-emerald-700/80 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs sm:text-sm font-bold transition flex items-center gap-2"
                    title="PRD-18 Alpha Launch Readiness & 5-Step Journey Verifier"
                  >
                    <Rocket className="w-4 h-4 text-emerald-400" />
                    <span>Alpha Readiness</span>
                    <span className="text-[10px] font-mono text-emerald-400 border border-emerald-800 bg-emerald-950 px-1 py-0.2 rounded">PRD-18</span>
                  </button>
                )}
              </div>

              {/* PRD-17 Defensible Science Metrics Badges with Three Data States (S-1, S-5, S-6) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-stone-800/80">
                <div className="bg-stone-900/60 border border-stone-800/60 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-extrabold text-stone-100 font-mono">12,450+</div>
                    <DataStateBadge state="observed" />
                  </div>
                  <div className="text-[11px] text-stone-300 font-medium">Demo Enrolled Acres</div>
                  <div className="text-[10px] text-stone-500 leading-tight">4 Regional Sample Farms</div>
                </div>

                <div className="bg-stone-900/60 border border-stone-800/60 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-extrabold text-emerald-400 font-mono">0.42–0.55</div>
                    <DataStateBadge state="modeled" uncertainty="±22%" />
                  </div>
                  <div className="text-[11px] text-stone-300 font-medium">tCO₂e / ac / yr (Worked Ex.)</div>
                  <div className="text-[10px] text-stone-500 leading-tight">Midwest Mollisol Benchmark</div>
                </div>

                <div className="bg-stone-900/60 border border-stone-800/60 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-extrabold text-stone-100 font-mono">12-Day</div>
                    <DataStateBadge state="observed" />
                  </div>
                  <div className="text-[11px] text-stone-300 font-medium">Platform Update Interval</div>
                  <div className="text-[10px] text-stone-500 leading-tight">Sentinel-2 5-day return buffered</div>
                </div>

                <div className="bg-stone-900/60 border border-stone-800/60 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-amber-300 font-mono">Evidence Dossier</div>
                    <DataStateBadge state="modeled" />
                  </div>
                  <div className="text-[11px] text-stone-300 font-medium">Audit-Ready Dossier</div>
                  <div className="text-[10px] text-amber-400/90 leading-tight">Not Independently Verified</div>
                </div>
              </div>

              {/* PRD-17 S-7: Adjacent Qualifications Box */}
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/90 text-[11px] text-stone-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Scientific Methodology Note (PRD-17):</strong> Optical vegetation metrics are <em>observed</em> via Sentinel-2 MSI (10m). Root-zone soil moisture is <em>modeled</em> (0–100cm, ±18% uncertainty) using radar backscatter and soil texture physics. Carbon sequestration is <em>modeled</em> using empirical factor equations calibrated to USDA COMET-Farm v1.4 and IPCC Tier 1 defaults (±22% uncertainty). All deliverables are unverified evidence dossiers until audited by an accredited verifier.
                </p>
              </div>
            </div>

            {/* Right Column: Clear Distinction Between Interactive Demo & Registered Sign-In */}
            <div className="lg:col-span-5" id="auth-card-anchor">
              <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-600" />

                {/* Mode Selector Header: Demo Sandbox vs Registered Account Sign-In */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                  <div className="flex bg-stone-950 p-1 rounded-2xl border border-stone-800 w-full gap-1">
                    <button
                      type="button"
                      onClick={() => setAuthCardMode('demo')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        authCardMode === 'demo'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-lime-300" />
                      <span>Live Sandbox Demo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthCardMode('signin')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        authCardMode === 'signin'
                          ? 'bg-stone-800 text-stone-100 shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Member Sign In</span>
                    </button>
                  </div>
                </div>

                {/* MODE 1: INSTANT DEMO SANDBOX (No credentials, no confusion, no MFA copy) */}
                {authCardMode === 'demo' ? (
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300 block">
                          Select a Demonstration Persona
                        </span>
                        <p className="text-[11px] text-stone-500">
                          Pre-loaded with real satellite passes and field records.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-semibold">
                        Instant Sandbox
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectDemoRole('farmer')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                          selectedDemoRole === 'farmer'
                            ? 'border-emerald-500 bg-emerald-950/40 text-stone-100 shadow-md shadow-emerald-950'
                            : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Tractor className="w-4 h-4 text-emerald-400" />
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">2,450 ac</span>
                        </div>
                        <span className="text-xs font-bold leading-tight">Farmer</span>
                        <span className="text-[10px] text-stone-500 truncate">Dale Vance</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoRole('agronomist')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                          selectedDemoRole === 'agronomist'
                            ? 'border-emerald-500 bg-emerald-950/40 text-stone-100 shadow-md shadow-emerald-950'
                            : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Users className="w-4 h-4 text-emerald-400" />
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">14 Clients</span>
                        </div>
                        <span className="text-xs font-bold leading-tight">Agronomist</span>
                        <span className="text-[10px] text-stone-500 truncate">Dr. Rostova</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoRole('corporate')}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                          selectedDemoRole === 'corporate'
                            ? 'border-emerald-500 bg-emerald-950/40 text-stone-100 shadow-md shadow-emerald-950'
                            : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">Scope 3</span>
                        </div>
                        <span className="text-xs font-bold leading-tight">Corporate</span>
                        <span className="text-[10px] text-stone-500 truncate">Marcus Vance</span>
                      </button>
                    </div>

                    {/* Persona Specific Preview Highlight */}
                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 text-[11px] space-y-1">
                      <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {selectedDemoRole === 'farmer' && 'Heartland Family Farms — 2,450 acres, 8 active fields'}
                          {selectedDemoRole === 'agronomist' && 'Midwest Agronomy Consulting — 14 client operations'}
                          {selectedDemoRole === 'corporate' && 'GrainCorp ESG Procurement — River Basin Scope 3 Insetting'}
                        </span>
                      </div>
                      <p className="text-stone-400 text-[10px] leading-relaxed">
                        {selectedDemoRole === 'farmer' && 'Full access to boundary editing, modeled root-zone moisture anomalies, and empirical practice carbon calculations.'}
                        {selectedDemoRole === 'agronomist' && 'Multi-client portfolio switcher, GPS soil photo scouting, and white-label Field Evidence Report generation.'}
                        {selectedDemoRole === 'corporate' && 'Supply shed aggregation, Scope 3 emission factors, and immutable cryptographic audit trails.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickLaunchAs(selectedDemoRole)}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-stone-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-950/80 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                    >
                      <Sparkles className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                      <span>Enter Sandbox as {selectedDemoRole.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4 text-stone-950 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                    </button>

                    <p className="text-[10px] text-center text-stone-500">
                      No sign-up or credit card required. Evaluates all interactive features safely in your browser.
                    </p>
                  </div>
                ) : (
                  /* MODE 2: REGISTERED MEMBER AUTHENTICATION */
                  <form onSubmit={handleSubmitLogin} className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                        Production Member Login
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                        TLS 256-bit Secure
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">
                        Email Address or Phone
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          required
                          className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 transition"
                          placeholder="dale@heartlandfarms.com"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-stone-300">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => onOpenAuthModal('signin')}
                          className="text-[10px] text-emerald-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          required
                          className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 focus:outline-none rounded-xl pl-9 pr-9 py-2 text-xs text-stone-100 transition"
                          placeholder="••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 text-stone-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-stone-700 bg-stone-950 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-[11px]">Remember on this device</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSelectDemoRole('farmer')}
                        className="text-[10px] text-emerald-400 hover:underline"
                      >
                        Auto-fill sample credentials
                      </button>
                    </div>

                    {loginError && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    {loginSuccessFeedback && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{loginSuccessFeedback} — Launching...</span>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span>Verifying Credentials...</span>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Sign In to Farm Account</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Footer of Card */}
                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                      <span>Need a new account?</span>
                      <button
                        type="button"
                        onClick={() => onOpenAuthModal('signup')}
                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Register New Farm</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: AUDIENCE AWARENESS & SPECIALIZED WORKSPACES */}
      {/* ========================================================================= */}
      <section id="audiences" className="py-16 bg-stone-950 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Tailored Solutions
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight mt-1">
              Engineered for Every Agricultural Stakeholder
            </p>
            <p className="text-stone-400 text-xs sm:text-sm mt-2">
              Whether managing your own acreage, advising grower clients, or verifying supply chain emissions, TerraSoil adapts to your workflow.
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-stone-900 border border-stone-800 p-1.5 rounded-2xl gap-1">
              <button
                onClick={() => setActiveAudienceTab('farmer')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeAudienceTab === 'farmer'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Tractor className="w-3.5 h-3.5" />
                <span>Farmers &amp; Ranchers</span>
              </button>

              <button
                onClick={() => setActiveAudienceTab('agronomist')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeAudienceTab === 'agronomist'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Agronomists &amp; Consultants</span>
              </button>

              <button
                onClick={() => setActiveAudienceTab('corporate')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeAudienceTab === 'corporate'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Supply Chain &amp; Scope 3</span>
              </button>
            </div>
          </div>

          {/* Active Audience Card */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-xl">
            {activeAudienceTab === 'farmer' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                      <Tractor className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-100">Farmer &amp; Rancher Operations</h3>
                      <p className="text-xs text-stone-400">Plain-language tools, zero jargon, maximum payout potential</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickLaunchAs('farmer')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <span>Launch as Farmer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Map className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200 flex items-center justify-between">
                      <span>Field Boundaries</span>
                      <DataStateBadge state="observed" />
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Draw boundaries directly on satellite maps or upload GeoJSON / Shapefiles to sync certified acreages and soil taxonomy automatically.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200 flex items-center justify-between">
                      <span>Vegetation &amp; Moisture</span>
                      <DataStateBadge state="modeled" uncertainty="±18%" />
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Pulls 12-day Sentinel-2 optical canopy vigor (MSI 10m) alongside modeled root-zone soil moisture anomalies (0–100cm depth) without probe hardware.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200 flex items-center justify-between">
                      <span>Field Evidence Reports</span>
                      <DataStateBadge state="modeled" />
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Downloadable audit-ready evidence packages formatted for USDA NRCS EQIP, CSP grants, and corporate sustainability insetting contracts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeAudienceTab === 'agronomist' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-100">Agronomists &amp; Advisory Consultants</h3>
                      <p className="text-xs text-stone-400">Multi-farm management, branded PDF reports, and soil photo scouting</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickLaunchAs('agronomist')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <span>Launch as Agronomist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Multi-Farm Client Portfolio</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Switch seamlessly across dozens of enrolled client operations with consolidated acreage telemetry and multi-seat permissions.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200 flex items-center justify-between">
                      <span>Photo Scouting</span>
                      <DataStateBadge state="observed" />
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Capture GPS-stamped field photos documenting earthworm biopores, slake aggregate stability, and rooting depth with dated notes.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200 flex items-center justify-between">
                      <span>Branded Dossiers</span>
                      <DataStateBadge state="modeled" />
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      White-label Field Evidence Reports featuring consultant credentials, practice audits, and 5-year soil organic carbon accretion models.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeAudienceTab === 'corporate' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-100">Supply Chain Buyers &amp; Scope 3 Decarbonization</h3>
                      <p className="text-xs text-stone-400">Verified carbon insetting, data credibility, and CSRD compliance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickLaunchAs('corporate')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <span>Launch as Corporate ESG</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Supply Shed Insetting Aggregation</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Aggregate emissions reductions across river basins and supplier tiers for Scope 3 SBTi submissions and buyer sustainability audits.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200 flex items-center justify-between">
                      <span>Cryptographic Provenance</span>
                      <DataStateBadge state="observed" />
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Complete cryptographic data lineage tracking every practice timestamp, satellite pass, and emission factor formula version.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200 flex items-center justify-between">
                      <span>Audit-Ready Dossiers</span>
                      <DataStateBadge state="modeled" />
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Formatted for ISO 14064-3 third-party verification bodies and GHG Protocol Land Sector and Removals Guidance compliance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: HOW IT WORKS — 4-STEP END-TO-END MRV WORKFLOW */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 bg-stone-900/30 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Simple 4-Step Process
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight mt-1">
              From Field Boundary to Audit-Ready Evidence
            </p>
            <p className="text-stone-400 text-xs sm:text-sm mt-2">
              How TerraSoil turns everyday farm management into verifiable environmental assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 relative hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 font-mono font-bold flex items-center justify-center">
                01
              </div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Map className="w-4 h-4 text-emerald-400" />
                <span>Map Boundaries</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Draw polygon boundaries on satellite imagery or import Shapefiles/GeoJSON. Automatically syncs USDA SSURGO soil series and baseline SOC stock.
              </p>
              <DataStateBadge state="observed" />
            </div>

            {/* Step 2 (PRD-17 S-1 & S-2: Separate optical vs SAR radar) */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 relative hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 font-mono font-bold flex items-center justify-center">
                02
              </div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Satellite Telemetry</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Sentinel-2 MSI pulls 10m optical NDVI canopy vigor, while Sentinel-1 SAR models root-zone moisture on a 12-day composite platform update interval.
              </p>
              <div className="flex gap-1.5 flex-wrap">
                <DataStateBadge state="observed" source="Sentinel-2" />
                <DataStateBadge state="modeled" source="SAR Hydrology" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 relative hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 font-mono font-bold flex items-center justify-center">
                03
              </div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Log Practices</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Record cover crops, no-till, rotational grazing, or fertilizer reductions. Store implementation timestamps and geotagged soil field photos.
              </p>
              <DataStateBadge state="observed" />
            </div>

            {/* Step 4 (PRD-17 S-6: Field Evidence Report) */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 relative hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 font-mono font-bold flex items-center justify-center">
                04
              </div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Field Evidence Dossier</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Estimate sequestration tonnage (tCO₂e) with standard IPCC Tier 1 &amp; COMET-Farm v1.4 factors. Export audit-ready dossiers labeled as Not Independently Verified.
              </p>
              <DataStateBadge state="modeled" uncertainty="±22%" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: SCIENCE, TELEMETRY & PLAIN-LANGUAGE JARGON BUSTER (PRD-17 S-2, S-3, S-4) */}
      {/* ========================================================================= */}
      <section id="science" className="py-16 bg-stone-950 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Science &amp; Terminology
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight mt-1">
              Grounded Agronomic Science — Plainly Explained
            </p>
            <p className="text-stone-400 text-xs sm:text-sm mt-2">
              Every metric is governed by a Three-State Label: Observed, Modeled, or Independently Verified.
            </p>
          </div>

          {/* Jargon Buster Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: SOC */}
            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-300">SOC (Soil Organic Carbon)</h3>
                <DataStateBadge state="modeled" source="SSURGO / Soil Lab" />
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                The measurable amount of carbon stored in topsoil organic matter. Baselines start from USDA SSURGO soil taxonomy and update with physical soil lab core tests when uploaded.
              </p>
            </div>

            {/* Card 2: NDVI (S-1 & S-2) */}
            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-300">NDVI (Vegetation Index)</h3>
                <DataStateBadge state="observed" source="Sentinel-2 MSI 10m" />
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Normalized Difference Vegetation Index (ranging 0.0 to 1.0) derived directly from Sentinel-2 MSI near-infrared and red light reflectance. Measures live green canopy vigor and crop biomass density on a 12-day composite interval.
              </p>
            </div>

            {/* Card 3: Insetting vs Offsetting */}
            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-300">Carbon Insetting</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Scope 3 Framework
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Reducing or sequestering emissions <strong>inside</strong> a company's own agricultural supply sheds (Scope 3 GHG), directly supporting the farmers they buy from — unlike offsets which buy credits from unrelated external projects.
              </p>
            </div>

            {/* Card 4: IPCC Tier 1 & COMET-Farm (S-4 Factor Disclosure) */}
            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-300">IPCC Tier 1 / COMET-Farm Factors</h3>
                <DataStateBadge state="modeled" uncertainty="±22%" />
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                TerraSoil runs an empirical factor calculation engine calibrated to published USDA COMET-Farm v1.4 regional coefficients and IPCC Tier 1 defaults. It does not run live DayCent kinetic process simulations, which require full COMET-Farm platform export.
              </p>
            </div>

            {/* Card 5: MRV */}
            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-300">MRV Framework</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  Standard Process
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Measurement, Reporting, and Verification: the internationally recognized three-part process that ensures climate claims are based on empirical boundary mapping, transparent calculation records, and third-party verifiable evidence packages.
              </p>
            </div>

            {/* Card 6: Root-Zone Moisture (S-3 Modeled Root-Zone Disclosure) */}
            <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-300">Modeled Root-Zone Moisture</h3>
                <DataStateBadge state="modeled" uncertainty="±18%" />
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Radar skin-depth microwave observations (Sentinel-1 SAR) combined with soil texture hydraulic functions and water-balance equations model moisture in the top 0–100cm (±18% uncertainty). It is an inferred model, not a direct physical probe reading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: GEOGRAPHIC SCOPE & GROWER DATA RIGHTS COVENANT */}
      {/* ========================================================================= */}
      <section id="trust" className="py-16 bg-stone-900/30 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Geographic Scope */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs font-semibold">
                <Globe2 className="w-4 h-4" />
                <span>Geographic Scope &amp; Calibration</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                Global Satellite Telemetry, Regionally Calibrated Soils
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                TerraSoil monitors agricultural parcels worldwide using European Space Agency Sentinel-2 optical MSI (10m) and Sentinel-1 radar at 20-meter resolution.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>North America &amp; US Croplands</span>
                    </span>
                    <DataStateBadge state="modeled" source="USDA SSURGO" />
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Integrated with USDA-NRCS SSURGO soil series, state parcel GIS layers, and USDA COMET-Farm v1.4 cropland coefficients.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Europe &amp; International Expansion</span>
                    </span>
                    <DataStateBadge state="modeled" source="ESDAC / IPCC" />
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    European Soil Data Centre (ESDAC) baselines and IPCC Tier 1 default climatic factors across Latin America and Oceania.
                  </p>
                </div>

                {/* PRD-17 Claims Register Link Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/60 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      <span>Public Scientific Claims Register (PRD-17)</span>
                    </span>
                    <p className="text-[10px] text-stone-400">
                      Every claim has a registered owner, primary source, method, and uncertainty margin.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsClaimsRegisterOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shrink-0"
                  >
                    Inspect Register &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Farmer Data Rights Covenant Card */}
            <div className="lg:col-span-6">
              <div className="bg-stone-900 border-2 border-emerald-800/80 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-100">Farmer Data Rights Covenant</h3>
                    <span className="text-[11px] text-emerald-400 font-mono">You Own Your Farm Data &bull; 100% Guaranteed</span>
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Growers should never fear that mapping their fields exposes private commercial data to commodity traders, chemical retailers, or land speculators. Our legal commitment is transparent and enforceable:
                </p>

                <ul className="space-y-2 text-xs text-stone-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>No Data Selling:</strong> We never monetize, sell, or license your field boundaries or yield estimates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Full Export Portability:</strong> Export your boundaries, telemetry history, and calculations anytime as GeoJSON, CSV, or PDF.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Explicit Sharing Permissions:</strong> Your data is never shared with agronomists or corporate buyers without your explicit consent.</span>
                  </li>
                </ul>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => openLegalModalWithTab('data_rights')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Read Data Rights Covenant</span>
                  </button>

                  <button
                    onClick={() => openLegalModalWithTab('privacy')}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition"
                  >
                    Privacy Policy
                  </button>

                  <button
                    onClick={() => openLegalModalWithTab('terms')}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition"
                  >
                    Terms &amp; Disclaimers
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: TRANSPARENT PRICING & STANDALONE EVIDENCE OPTION (S-6 Field Evidence Report) */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-16 bg-stone-950 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Transparent Plans &amp; Pricing
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
              Predictable Value at Every Agricultural Scale
            </p>
            <p className="text-stone-400 text-xs sm:text-sm">
              From individual family farms, to multi-client advisory practices, to global Scope 3 corporate supply sheds.
            </p>

            {/* Billing Period Switcher */}
            <div className="inline-flex items-center gap-2 p-1 rounded-2xl bg-stone-900 border border-stone-800 mt-2">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  billingPeriod === 'monthly' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  billingPeriod === 'annual' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] font-mono bg-lime-400 text-stone-950 font-black px-1.5 py-0.2 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Ladder Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Tier 1: Explorer (Free) */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-stone-700 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-800 px-2 py-0.5 rounded font-bold">
                    Evaluation
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">Self-Serve</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">Explorer</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Test map features before enrolling.</p>
                </div>
                <div className="flex items-baseline gap-1 pb-2 border-b border-stone-800">
                  <span className="text-3xl font-extrabold text-stone-100">$0</span>
                  <span className="text-xs text-stone-400">/ free forever</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>1 farm, up to 2 field boundaries</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>Basic Sentinel-2 imagery preview</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>Soil series taxonomy lookup</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartNow}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition"
              >
                Start Free
              </button>
            </div>

            {/* Tier 2: Basic (Farm Intel) */}
            <div className="bg-stone-900/90 border border-emerald-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-emerald-600 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                    Individual Farm
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Popular for Growers</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">Basic Tier</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Manage your land &amp; carbon records.</p>
                </div>
                <div className="flex items-baseline gap-1 pb-2 border-b border-stone-800">
                  <span className="text-3xl font-extrabold text-stone-100">
                    {billingPeriod === 'annual' ? '$31' : '$39'}
                  </span>
                  <span className="text-xs text-stone-400">/ mo</span>
                  <span className="text-[10px] text-stone-500 ml-1 font-mono">(or $0.50/ac/yr)</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Up to 2,500 enrolled acres</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>12-Day platform update interval telemetry</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>IPCC Tier 1 carbon estimation ledger</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Practice cost &amp; grant document generator</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartNow}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-extrabold text-xs transition shadow-md"
              >
                Start Basic Plan
              </button>
            </div>

            {/* Tier 3: Professional (Agronomist) */}
            <div className="bg-stone-900/90 border-2 border-emerald-500/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-emerald-400 transition relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-300 uppercase bg-emerald-950 border border-emerald-700 px-2 py-0.5 rounded font-bold">
                    Advisors &amp; Consultants
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/50 px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">Professional</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Manage multiple client farm portfolios.</p>
                </div>
                <div className="flex items-baseline gap-1 pb-2 border-b border-stone-800">
                  <span className="text-3xl font-extrabold text-emerald-400">
                    {billingPeriod === 'annual' ? '$159' : '$199'}
                  </span>
                  <span className="text-xs text-stone-400">/ mo</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-200">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Unlimited fields &amp; 5 team seats</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>White-label branded Field Evidence Reports</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Geotagged soil photo scouting tool</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>AI In-App Agronomist Assistant</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartNow}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-black text-xs transition shadow-lg"
              >
                Start Professional
              </button>
            </div>

            {/* Tier 4: Corporate (Supply Chain Scope 3) */}
            <div className="bg-stone-900/90 border border-cyan-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-600 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300 uppercase bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                    Supply Chain
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">Scope 3</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">Corporate</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Manage supply shed insetting.</p>
                </div>
                <div className="flex items-baseline gap-1 pb-2 border-b border-stone-800">
                  <span className="text-3xl font-extrabold text-cyan-300">
                    {billingPeriod === 'annual' ? '$399' : '$499'}
                  </span>
                  <span className="text-xs text-stone-400">/ mo</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Supply shed insetting aggregation</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Cryptographic audit data lineage</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>GHG Protocol Land Sector export suite</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Supplier onboarding portal &amp; API</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenPricingModal}
                className="w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs transition"
              >
                Contact Corporate Sales
              </button>
            </div>

          </div>

          {/* Standalone Product: Field Evidence Report ($99/field) with Rationale Callout (PRD-17 S-6) */}
          <div className="bg-stone-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-7 max-w-4xl mx-auto shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-950 border border-amber-800 px-2 py-0.5 rounded font-bold">
                  PRD-17 Assurance Standard
                </span>
                <h3 className="text-xl font-bold text-stone-100 mt-1">Field Evidence Report ($99 / field)</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Single downloadable audit-ready dossier &bull; Zero subscription commitment required
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold text-amber-300 font-mono">$99</span>
                <span className="text-xs text-stone-400 block">one-time per field</span>
              </div>
            </div>

            {/* Plain Rationale Box (PRD-17 S-6) */}
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-xs space-y-1 text-stone-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>The Rationale: Why "Field Evidence Report" instead of "Verification Report"?</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Even the title "Verification Report" legally implies that formal third-party assurance has already occurred. This product provides the <strong>audit-ready evidence package</strong> containing verified boundary geometry, Sentinel-2 optical NDVI passes, soil carbon baselines, and calculation lineage. We title it <strong>Field Evidence Report</strong> to avoid false assurance claims, and prominently label all modeled estimates as <strong>"Not independently verified"</strong> unless formally audited by an accredited certifier.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-stone-300 pt-1">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Field polygon GIS &amp; certified acreage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sentinel-2 optical NDVI satellite history</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>USDA COMET &amp; IPCC formula appendix</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-stone-400 italic">
                Ideal for a single USDA NRCS EQIP or CSP grant application, or a one-time sustainability proof requested by your grain buyer.
              </p>

              <button
                onClick={onOpenReportModal}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition flex items-center gap-2 shadow-lg"
              >
                <span>Generate Field Evidence Report &rarr;</span>
              </button>
            </div>
          </div>

          {/* Monetization Expansion & Add-On Modules Strip */}
          <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-stone-200">Expandable Modules &amp; Add-Ons</h4>
                <p className="text-xs text-stone-400">Tailor your workspace with specialized enterprise modules when ready.</p>
              </div>
              <button
                onClick={onOpenPricingModal}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View Full 18-Dimension Comparison Table</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-xs font-bold text-stone-200 block">Carbon Data Room</span>
                <p className="text-[10px] text-stone-400">Encrypted virtual data room for land deals, ag lending, and carbon buyers.</p>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">$149/mo</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-xs font-bold text-stone-200 block">Grant Intelligence</span>
                <p className="text-[10px] text-stone-400">AI match engine for USDA NRCS EQIP ($25-45/ac), CSP, and state programs.</p>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">$79/mo</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-xs font-bold text-stone-200 block">Carbon Program Tier</span>
                <p className="text-[10px] text-stone-400">Verra VM0042 developer suite managing registered crediting periods.</p>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">$299/mo</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-xs font-bold text-stone-200 block">Data &amp; API Console</span>
                <p className="text-[10px] text-stone-400">High-throughput REST/GraphQL API platform with John Deere data ops sync.</p>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">$199/mo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: FAQ, COMPLIANCE DISCLAIMERS & CONVERSION FOOTER */}
      {/* ========================================================================= */}
      <section id="faq" className="py-16 bg-stone-900/40 border-b border-stone-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Knowledge Base &amp; Guardrails
            </h2>
            <p className="text-2xl font-extrabold text-stone-100 tracking-tight mt-1">
              Frequently Asked Questions
            </p>
            <p className="text-stone-400 text-xs sm:text-sm mt-1">
              Direct, honest answers regarding data integrity, certification, and platform scope.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1: Certification Guardrail */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Is your carbon sequestration number certified?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                No — it is an estimate based on standardized agronomic emission factors (such as IPCC Tier 1 and USDA COMET-Farm v1.4), not a certified laboratory core measurement. If you need certified verification for a specific registry (such as Verra or Gold Standard), that typically requires an accredited third-party verifier. Our Field Evidence Reports provide the standardized, audit-ready supporting documentation required by those verifiers.
              </p>
            </div>

            {/* FAQ 2: Payout Guardrail */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>How much will I get paid for switching to no-till or cover crops?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                Payout eligibility and amounts depend on external grant programs (e.g., USDA NRCS EQIP, CSP) or private carbon-credit buyer agreements — TerraSoil does not set payout amounts. What we do is calculate your estimated carbon sequestration based on your logged practices, which you can use as empirical supporting documentation in grant and buyer applications.
              </p>
            </div>

            {/* FAQ 3: Agronomic Replacement Guardrail */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Does TerraSoil replace my agronomist or lawyer?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                No. TerraSoil is a measurement and documentation tool, not a replacement for an agronomist, a certified carbon-credit verifier, or legal counsel. We provide empirical satellite telemetry and practice logs to empower you and your agronomist, but we do not give specific farm management directives or legal advice.
              </p>
            </div>

            {/* FAQ 4: Carbon insetting vs offsetting */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>What is the difference between carbon insetting and offsetting?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                Offsetting involves purchasing carbon credits generated outside an organization's value chain. Insetting refers to a corporation reducing emissions directly within its own agricultural supply sheds (Scope 3 GHG reductions), directly benefiting the growers and landscapes they source agricultural commodities from.
              </p>
            </div>

            {/* FAQ 5: Satellite technology (S-1, S-2, S-3) */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>How are satellite NDVI and soil moisture calculated?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                Optical NDVI is acquired directly from ESA Sentinel-2 multispectral MSI sensors (10-meter spatial resolution, 5-day nominal equatorial constellation revisit; refreshed on a 12-day composite platform update interval to ensure cloud-free scenes). Root-zone soil moisture (0–100cm) is modeled using microwave synthetic aperture radar (Sentinel-1 SAR) combined with soil texture hydraulic transfer functions (±18% uncertainty).
              </p>
            </div>

            {/* FAQ 6: Geographic availability */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Where is TerraSoil available geographically?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                Satellite monitoring is global with 10-meter spatial resolution. Soil carbon baselines and practice emission factors are currently calibrated for North American (US &amp; Canada via USDA-NRCS SSURGO) and European agricultural zones, with continuous regional calibration expansion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-16 bg-gradient-to-b from-stone-950 to-stone-900 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-500 mx-auto flex items-center justify-center p-0.5 shadow-xl shadow-emerald-950/60">
            <Sprout className="w-7 h-7 text-stone-950 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            Ready to Verify Your Soil Carbon?
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Explore live Sentinel-2 satellite passes, soil carbon accretion curves, and practice logs in our interactive sandbox without signup.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={onStartNow}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-stone-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-950/80 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
            >
              <span>Launch Interactive Demo</span>
              <ArrowRight className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            </button>

            <button
              onClick={() => {
                setAuthCardMode('signin');
                const element = document.getElementById('auth-card-anchor');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onOpenAuthModal('signin');
                }
              }}
              className="px-6 py-3.5 rounded-2xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-200 text-sm font-bold transition"
            >
              Sign In to Existing Farm
            </button>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer with Legal & Data Rights Links */}
      <footer className="bg-stone-950 border-t border-stone-800 text-xs text-stone-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-900">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-stone-950">
                <Sprout className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-bold text-stone-200">TerraSoil Portal</span>
              <span className="text-stone-600">&bull;</span>
              <span className="text-stone-400">Measurement, Reporting &amp; Verification (MRV) SaaS</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-stone-400">
              <button
                onClick={() => openLegalModalWithTab('data_rights')}
                className="hover:text-emerald-400 transition font-medium"
              >
                Grower Data Rights
              </button>
              <button
                onClick={() => openLegalModalWithTab('privacy')}
                className="hover:text-stone-200 transition"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => openLegalModalWithTab('terms')}
                className="hover:text-stone-200 transition"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setIsClaimsRegisterOpen(true)}
                className="text-amber-400 hover:text-amber-300 transition font-semibold"
              >
                Claims Register (PRD-17)
              </button>
              <button
                onClick={onOpenPricingModal}
                className="hover:text-stone-200 transition"
              >
                Plans &amp; Pricing
              </button>
              <button
                onClick={onOpenReportModal}
                className="hover:text-stone-200 transition"
              >
                Field Evidence Reports
              </button>
              <a href="mailto:support@terrasoil.ag" className="hover:text-emerald-400 transition">
                support@terrasoil.ag
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-stone-600">
            <p>
              &copy; {new Date().getFullYear()} TerraSoil Systems Inc. All rights reserved. Soil carbon calculations are empirical modeled estimates based on published IPCC Tier 1 and USDA COMET-Farm methodologies.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>Grower Data Ownership Covenant Enforced</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Embedded Legal & Data Rights Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {/* PRD-17 Public Scientific Claims Register Modal */}
      <ClaimsRegisterModal
        isOpen={isClaimsRegisterOpen}
        onClose={() => setIsClaimsRegisterOpen(false)}
      />
    </div>
  );
};
