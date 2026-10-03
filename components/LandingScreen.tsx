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
  Clock,
  HelpCircle,
  FileSpreadsheet,
  BarChart3,
  Award,
  Code
} from 'lucide-react';
import { UserPersona } from '../types';
import { MOCK_AUTH_USERS, ExtendedAuthUser } from '../data/mockAuthData';

interface LandingScreenProps {
  currentUser: ExtendedAuthUser | null;
  onLoginSuccess: (user: ExtendedAuthUser) => void;
  onStartNow: () => void;
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onOpenPricingModal: () => void;
  onOpenReportModal: () => void;
  onOpenAIAssistant: () => void;
  onOpenTerraSoilPdf?: () => void;
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
}) => {
  // Direct In-Page Login State
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserPersona>('farmer');
  const [emailInput, setEmailInput] = useState<string>('dale@heartlandfarms.com');
  const [passwordInput, setPasswordInput] = useState<string>('TerraSoil2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginSuccessFeedback, setLoginSuccessFeedback] = useState<string | null>(null);

  // Audience Tabs
  const [activeAudienceTab, setActiveAudienceTab] = useState<'farmer' | 'agronomist' | 'corporate'>('farmer');

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

  // Handle Form Submission
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
        // Automatically enter the portal smoothly after a brief confirmation
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

  // Quick 1-Click Login & Launch
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
      <nav className="sticky top-0 z-50 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/80">
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
                Carbon &amp; Soil-Management Verification System
              </p>
            </div>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6 text-xs text-stone-300 font-medium">
            <a href="#features" className="hover:text-emerald-400 transition">Capabilities</a>
            <a href="#audiences" className="hover:text-emerald-400 transition">Personas</a>
            <a href="#pricing" className="hover:text-emerald-400 transition">Plans &amp; Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition">Knowledge Base</a>
            <button 
              onClick={onOpenAIAssistant}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask TerraSoil AI</span>
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
                  title="Switch User or Manage Sessions"
                >
                  Switch Account
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="px-3 py-1.5 rounded-lg border border-stone-800 hover:border-stone-700 bg-stone-900 text-stone-300 text-xs font-semibold hover:bg-stone-800 transition"
              >
                Sign In
              </button>
            )}

            {/* The Main "Start Now" Button */}
            <button
              onClick={onStartNow}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>Start Now</span>
              <ArrowRight className="w-4 h-4 text-stone-950 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Embedded Interactive Sign-In Card */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-stone-800/80">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Proposition & Start CTA */}
            <div className="lg:col-span-7 space-y-6">
              {/* Compliance & Standard Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>USDA COMET-Farm &bull; IPCC Tier 1 &bull; Sentinel-2 Copernicus</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-100 tracking-tight leading-tight">
                Measure, Track &amp; Verify <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-200">
                  Soil Carbon &amp; Regenerative Practices
                </span>
              </h1>

              {/* Clear description matching prompt & KB */}
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                The all-in-one SaaS portal for farmers, agronomists, and agricultural supply chains. 
                Map field boundaries, pull 12-day Sentinel-2 NDVI &amp; root-zone moisture telemetry, 
                log practices (cover crop, no-till, grazing), model carbon sequestration in metric tons CO₂e, 
                and generate audit-ready compliance PDF reports.
              </p>

              {/* Action Buttons: Big "Start Now" + Quick Tour */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onStartNow}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-stone-950 font-black text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-950/80 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
                >
                  <Sprout className="w-5 h-5 text-stone-950 stroke-[2.5]" />
                  <span>Start Now &bull; Launch MRV Portal</span>
                  <ArrowRight className="w-5 h-5 text-stone-950 group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
                </button>

                <button
                  onClick={onOpenReportModal}
                  className="px-5 py-3.5 rounded-2xl border border-stone-800 bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs sm:text-sm font-bold transition flex items-center gap-2 hover:border-stone-700"
                  title="Audit-Ready Field Verification Report Package"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Sample Field Verification Report</span>
                </button>

                <button
                  onClick={onOpenAIAssistant}
                  className="px-4 py-3.5 rounded-2xl border border-emerald-900/40 bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-300 text-xs sm:text-sm font-semibold transition flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>AI In-App Assistant</span>
                </button>
              </div>

              {/* Trust & Live Stats Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-800/80">
                <div className="bg-stone-900/60 border border-stone-800/60 p-3 rounded-xl">
                  <div className="text-xl font-extrabold text-stone-100 font-mono">184,000+</div>
                  <div className="text-[11px] text-stone-400 font-medium">Acres Monitored</div>
                </div>
                <div className="bg-stone-900/60 border border-stone-800/60 p-3 rounded-xl">
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">0.42–0.55</div>
                  <div className="text-[11px] text-stone-400 font-medium">tCO₂e / Acre / Yr</div>
                </div>
                <div className="bg-stone-900/60 border border-stone-800/60 p-3 rounded-xl">
                  <div className="text-xl font-extrabold text-stone-100 font-mono">12-Day</div>
                  <div className="text-[11px] text-stone-400 font-medium">Sentinel-2 Revisit</div>
                </div>
                <div className="bg-stone-900/60 border border-stone-800/60 p-3 rounded-xl">
                  <div className="text-xl font-extrabold text-amber-400 font-mono">ISO 14064-3</div>
                  <div className="text-[11px] text-stone-400 font-medium">Audit Verification</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Login & Account Management Box */}
            <div className="lg:col-span-5">
              <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-600" />

                {/* Header of Login Card */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-stone-800 text-emerald-400 border border-stone-700">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-100">Portal Authentication</h3>
                      <p className="text-[11px] text-stone-400">Sign in to your role workspace</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    MFA ENFORCED
                  </span>
                </div>

                {/* 1-Click Demo Profiles Bar */}
                <div className="py-4 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                    Fast 1-Click Demo Access
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectDemoRole('farmer')}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                        selectedDemoRole === 'farmer'
                          ? 'border-emerald-500 bg-emerald-950/40 text-stone-100'
                          : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Tractor className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">2,450 ac</span>
                      </div>
                      <span className="text-xs font-bold leading-tight truncate">Farmer</span>
                      <span className="text-[10px] text-stone-500 truncate">Dale Vance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectDemoRole('agronomist')}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                        selectedDemoRole === 'agronomist'
                          ? 'border-emerald-500 bg-emerald-950/40 text-stone-100'
                          : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">14 Clients</span>
                      </div>
                      <span className="text-xs font-bold leading-tight truncate">Agronomist</span>
                      <span className="text-[10px] text-stone-500 truncate">Dr. Rostova</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectDemoRole('corporate')}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                        selectedDemoRole === 'corporate'
                          ? 'border-emerald-500 bg-emerald-950/40 text-stone-100'
                          : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">Scope 3</span>
                      </div>
                      <span className="text-xs font-bold leading-tight truncate">Corporate</span>
                      <span className="text-[10px] text-stone-500 truncate">Marcus Vance</span>
                    </button>
                  </div>
                </div>

                {/* Direct Login Form */}
                <form onSubmit={handleSubmitLogin} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">
                      Account Email or Phone
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
                      <span className="text-[11px]">Remember credentials</span>
                    </label>
                    <span className="text-[10px] text-stone-500 font-mono">Demo: TerraSoil2026!</span>
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
                          <span>Sign In &amp; Launch Portal</span>
                        </>
                      )}
                    </button>

                    <div className="relative text-center my-1">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-800" />
                      </div>
                      <span className="relative px-2 bg-stone-900 text-[10px] uppercase font-bold text-stone-500">
                        Or enter directly
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickLaunchAs(selectedDemoRole)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-stone-800 to-stone-850 hover:bg-stone-750 text-emerald-400 font-extrabold text-xs tracking-wide border border-stone-700 hover:border-emerald-600/50 transition flex items-center justify-center gap-2 group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                      <span>Start Now as {selectedDemoRole.toUpperCase()}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>

                {/* Footer of Card */}
                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Don't have an account?</span>
                  <button
                    onClick={() => onOpenAuthModal('signup')}
                    className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Register New Farm</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Audience Awareness Section (Farmer, Agronomist, Corporate) */}
      <section id="audiences" className="py-16 bg-stone-950 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Tailored Workspaces
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight mt-1">
              Engineered for Every Agricultural Stakeholder
            </p>
            <p className="text-stone-400 text-xs sm:text-sm mt-2">
              Select your persona to explore specialized capabilities, compliance workflows, and telemetry metrics.
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
                    <span>Start as Farmer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Map className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Interactive Field Boundaries</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Draw field boundaries directly on satellite maps or upload GeoJSON / Shapefiles to sync acreages.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Soil Moisture &amp; NDVI Trends</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Pulls 12-day Sentinel-2 indices and root-zone soil moisture without expensive manual hardware probes.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Grant &amp; Credit Documentation</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      One-click audit-ready PDF reports ready for USDA NRCS EQIP, CSP grants, and carbon insetting contracts.
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
                    <span>Start as Agronomist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Multi-Farm Client Portfolio</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Switch seamlessly across dozens of enrolled client operations with consolidated acreage telemetry.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Geotagged Soil Photo Scouting</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Capture GPS-stamped field photos documenting earthworm biopores, slake aggregate stability, and roots.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Custom Branded PDF Deliverables</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      White-label reports featuring consultant credentials, practice audits, and 5-year SOM accretion models.
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
                    <span>Start as Corporate ESG</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Supply Shed Insetting Aggregation</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Aggregate emissions reductions across river basins and supplier tiers for Scope 3 SBTi submissions.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Immutable Audit Provenance</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Complete cryptographic data lineage tracking every practice timestamp, satellite pass, and emission factor.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-stone-200">Global MRV Interoperability</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      ISO 14064-3 and GHG Protocol Land Sector and Removals Guidance compliant data exports.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section id="features" className="py-16 bg-stone-900/30 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Core Capabilities
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight mt-1">
              End-to-End Measurement, Reporting &amp; Verification
            </p>
            <p className="text-stone-400 text-xs sm:text-sm mt-2">
              Everything required to transform sustainable field management into verifiable carbon assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-3 hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-100">Interactive Field GIS Mapping</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Draw polygon boundaries or upload GeoJSON files. Inspect soil taxonomy, SOC stock baselines, and historical NDVI vegetation health overlays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-3 hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-100">Satellite Telemetry &amp; 6-Mo Trends</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Sentinel-2 optical indices paired with 26-week weekly precipitation and temperature charts, root-zone moisture alerts, and yield projections.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-3 hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-100">Regenerative Practice Ledger</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Log cover crops, no-till, fertilizer reduction, and rotational grazing with audit timestamps, implementation dates, and reduction factors.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-3 hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-100">COMET-Farm &amp; IPCC Modeling</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Transparent carbon sequestration formulas (metric tons CO₂e/acre/year) with live carbon pricing sliders and water retention gain estimates.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-3 hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-100">Geotagged Soil Camera Scouting</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Take GPS-stamped photos of soil aggregates, earthworm biopores, and root depth directly on the field map with dated agronomist notes.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-3 hover:border-emerald-700/60 transition group">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-100">Field Verification Reports (Audit-Ready)</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Generate downloadable, audit-ready evidence packages with verified emission factors, boundary maps, and practice logs for third-party verifiers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Plans Section (Matching System Prompt KB & PRD Packaging Ladder) */}
      <section id="pricing" className="py-16 bg-stone-950 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Pricing Tiers &amp; Packaging Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
              Unlock Business Value at Every Agricultural Scale
            </p>
            <p className="text-stone-400 text-xs sm:text-sm">
              Progression ladder: from managing your land, to managing your clients, to managing your supply chain, to global program compliance.
            </p>

            {/* Progression Narrative Ladder Strip (§1, §9) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-900/60 border border-stone-800 p-2 rounded-2xl text-left text-xs mt-3">
              <div className="p-2 rounded-xl bg-stone-950 border border-stone-800">
                <div className="text-emerald-400 font-bold font-mono text-[10px]">1. FARM</div>
                <div className="text-stone-200 font-semibold text-[11px]">Manage your land</div>
                <div className="text-stone-400 text-[10px]">Explorer &bull; Basic</div>
              </div>
              <div className="p-2 rounded-xl bg-stone-950 border border-stone-800">
                <div className="text-emerald-400 font-bold font-mono text-[10px]">2. PROFESSIONAL</div>
                <div className="text-stone-200 font-semibold text-[11px]">Manage clients</div>
                <div className="text-stone-400 text-[10px]">Agronomist Platform</div>
              </div>
              <div className="p-2 rounded-xl bg-stone-950 border border-stone-800">
                <div className="text-cyan-400 font-bold font-mono text-[10px]">3. CORPORATE</div>
                <div className="text-stone-200 font-semibold text-[11px]">Manage supply chain</div>
                <div className="text-stone-400 text-[10px]">Scope 3 Decarbonization</div>
              </div>
              <div className="p-2 rounded-xl bg-stone-950 border border-stone-800">
                <div className="text-amber-400 font-bold font-mono text-[10px]">4. ENTERPRISE</div>
                <div className="text-stone-200 font-semibold text-[11px]">Manage Ag program</div>
                <div className="text-stone-400 text-[10px]">Custom Architecture</div>
              </div>
            </div>
          </div>

          {/* Core 5-Tier Ladder Grid with Balanced Visual Hierarchy (§9) */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* 1. Explorer (Free) */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-stone-700 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-800 px-2 py-0.5 rounded font-bold">Evaluation</span>
                  <span className="text-[10px] text-stone-500 font-mono">P1 Tier</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">Explorer</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Test map features before paying.</p>
                </div>
                <div className="flex items-baseline gap-1 pb-2 border-b border-stone-800">
                  <span className="text-3xl font-extrabold text-stone-100">$0</span>
                  <span className="text-xs text-stone-400">/ free</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>1 farm, 1–2 fields boundary GIS</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>Basic Sentinel-2 imagery</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>Global Explorer Map benchmarks</span>
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

            {/* 2. Basic - Farm Intelligence */}
            <div className="bg-stone-900/90 border border-emerald-800/80 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-600 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded font-bold">Farm Intel</span>
                  <span className="text-[10px] text-emerald-400 font-mono">P0 Core</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">Basic Tier</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Manage your land &amp; carbon.</p>
                </div>
                <div className="flex items-baseline gap-1 pb-2 border-b border-stone-800">
                  <span className="text-3xl font-extrabold text-stone-100">$29–$49</span>
                  <span className="text-xs text-stone-400">/ mo</span>
                </div>

                {/* Flagship Feature: Farm Health Score */}
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-[10px] space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center justify-between">
                    <span>Farm Health Score:</span>
                    <span className="font-mono text-white bg-emerald-800 px-1 rounded">84/100</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[9px] text-stone-300 font-mono">
                    <span>Soil: 88</span>
                    <span>Water: 79</span>
                    <span>Carbon: 85</span>
                    <span>Data: 84</span>
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs text-stone-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Up to 2,500 enrolled acres</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>12-Day NDVI &amp; moisture radar</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Practice ROI &amp; cost tracking</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartNow}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-extrabold text-xs transition shadow-md"
              >
                Start Basic
              </button>
            </div>

            {/* 3. Professional - Agronomist Platform */}
            <div className="bg-stone-900/90 border-2 border-emerald-500/80 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-400 transition relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-300 uppercase bg-emerald-950 border border-emerald-700 px-2 py-0.5 rounded font-bold">Advisor</span>
                  <span className="text-[9px] text-emerald-400 font-bold">Most Popular</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">Professional</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Manage multiple client farms.</p>
                </div>
                <div className="flex items-baseline gap-1 pb-2 border-b border-stone-800">
                  <span className="text-3xl font-extrabold text-emerald-400">$199</span>
                  <span className="text-xs text-stone-400">/ mo</span>
                </div>

                {/* Flagship: AI Agronomist Assistant */}
                <div className="p-2 rounded-xl bg-stone-950 border border-emerald-700/60 text-[10px] space-y-0.5">
                  <div className="font-bold text-emerald-300 flex items-center gap-1">
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span>AI Agronomist Assistant</span>
                  </div>
                  <p className="text-stone-400 text-[9px] leading-tight">
                    Natural language queries across all client operations.
                  </p>
                </div>

                <ul className="space-y-1.5 text-xs text-stone-200">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Unlimited fields &amp; 5 team seats</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>White-label branded PDF reports</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Practice scenario modeling</span>
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

            {/* 4. Corporate - Supply Chain Scope 3 */}
            <div className="bg-stone-900/90 border border-cyan-800/80 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-cyan-600 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300 uppercase bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded font-bold">Supply Chain</span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">Scope 3</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">Corporate</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Manage supply shed insetting.</p>
                </div>
                <div className="flex items-baseline gap-1 pb-2 border-b border-stone-800">
                  <span className="text-3xl font-extrabold text-cyan-300">$499+</span>
                  <span className="text-xs text-stone-400">/ mo</span>
                </div>

                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-[10px] space-y-0.5">
                  <div className="font-bold text-cyan-300 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    <span>Supplier Portal &amp; Scope 3</span>
                  </div>
                  <p className="text-stone-400 text-[9px] leading-tight">
                    tCO₂e/tonne accounting across river basins.
                  </p>
                </div>

                <ul className="space-y-1.5 text-xs text-stone-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Unlimited supplier organizations</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Cryptographic audit data lineage</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Executive ESG export suites</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenPricingModal}
                className="w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs transition"
              >
                Start Corporate
              </button>
            </div>

            {/* 5. Enterprise - Custom Ag-Program */}
            <div className="bg-stone-900/90 border border-amber-800/60 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-600 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-300 uppercase bg-amber-950 border border-amber-800 px-2 py-0.5 rounded font-bold">Custom</span>
                  <span className="text-[10px] text-amber-400 font-mono">Talk to Sales</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">Enterprise</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">Global multi-facility programs.</p>
                </div>
                <div className="flex items-baseline gap-1 pb-2 border-b border-stone-800">
                  <span className="text-2xl font-extrabold text-amber-300">Custom</span>
                  <span className="text-xs text-stone-400">/ SLA</span>
                </div>

                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/80 text-[10px] space-y-0.5">
                  <div className="font-bold text-amber-300">SSO, SCIM &amp; ERP Integrations</div>
                  <p className="text-stone-400 text-[9px] leading-tight">
                    SAP, Oracle, John Deere Data Ops pipelines.
                  </p>
                </div>

                <ul className="space-y-1.5 text-xs text-stone-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Custom emission factor baselines</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Dedicated Agronomic Account Mgr</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Bespoke data retention policy</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenPricingModal}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-600/40 font-bold text-xs transition"
              >
                Talk to Sales
              </button>
            </div>

          </div>

          {/* Standalone Product: Field Verification Report ($99/field) with Rationale Callout (§5 P0) */}
          <div className="bg-stone-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-7 max-w-4xl mx-auto shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-950 border border-amber-800 px-2 py-0.5 rounded font-bold">
                  P0 Repositioned Product
                </span>
                <h3 className="text-xl font-bold text-stone-100 mt-1">Field Verification Report ($99 / field)</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Formerly titled "Audit Report" &bull; Zero subscription commitment required
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold text-amber-300 font-mono">$99</span>
                <span className="text-xs text-stone-400 block">per field report</span>
              </div>
            </div>

            {/* Rationale Callout Box */}
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-xs space-y-1 text-stone-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Why "Field Verification Report" instead of "Audit Report"?</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                "Audit" legally implies a formal third-party assurance service. This product is actually an <strong>audit-ready evidence package</strong> containing field boundary geometry, Sentinel-2 NDVI satellite passes, soil carbon baselines, and calculation lineage. We renamed it to avoid false assurance implications while providing the exact empirical proof required by grant reviewers and certified verification bodies (Verra, Gold Standard, USDA).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-stone-300 pt-1">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Field boundary geometry &amp; acreage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sentinel-2 optical NDVI history</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>USDA COMET &amp; IPCC formula appendix</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-stone-400 italic">
                "$99/field — One-time verification package. Build a professional evidence package for a field, farm, grant application, sustainability program, or buyer request."
              </p>

              <button
                onClick={onOpenReportModal}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition flex items-center gap-2 shadow-lg"
              >
                <span>Generate Field Report &rarr;</span>
              </button>
            </div>
          </div>

          {/* Monetization Expansion & Substantial Product Lines Showcase */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-cyan-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                  Monetization Expansion &amp; Product Lines
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-100 mt-1">
                  Custom Add-ons, Team Seats &amp; Enterprise Platforms
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Flexible seat-based team scaling, physical lab syncs, and standalone B2B product suites.
                </p>
              </div>

              <button
                onClick={onOpenPricingModal}
                className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
              >
                <span>Explore Add-ons &amp; Seat Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Lock className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-stone-100">Carbon Data Room</h4>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Encrypted VDR for land deals, bank loans, and carbon credit buyers with NDA watermarking &amp; audit logs.
                </p>
                <span className="text-[10px] font-mono text-cyan-300 font-bold block pt-1">$149/mo or $49/field</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-stone-100">Grant Intelligence</h4>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  AI match engine for USDA NRCS EQIP ($25-45/ac), CSP, and REAP with pre-filled CPA-52 paperwork.
                </p>
                <span className="text-[10px] font-mono text-emerald-300 font-bold block pt-1">$79/mo module</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Layers className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-stone-100">Carbon Program Tier</h4>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Verra VM0042 developer portal managing registered crediting periods, 15% buffer pool deductions &amp; registry sync.
                </p>
                <span className="text-[10px] font-mono text-cyan-300 font-bold block pt-1">$299/mo developer suite</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Code className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-stone-100">Data &amp; API Console</h4>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  High-throughput REST/GraphQL API platform, 1M req/mo rate limit, Webhooks &amp; John Deere OAuth sync.
                </p>
                <span className="text-[10px] font-mono text-cyan-300 font-bold block pt-1">$199/mo developer key</span>
              </div>
            </div>
          </div>

          {/* Call-to-Action to Open Full 18-Dimension Comparison Table Modal */}
          <div className="text-center pt-2">
            <button
              onClick={onOpenPricingModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 border border-stone-700 hover:border-emerald-500 text-stone-200 text-xs sm:text-sm font-bold transition hover:bg-stone-850"
            >
              <span>Explore Full 18-Dimension Comparison Table (§8)</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ & Knowledge Base (Directly adhering to system instructions) */}
      <section id="faq" className="py-16 bg-stone-900/40 border-b border-stone-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Knowledge Base &amp; Guardrails
            </h2>
            <p className="text-2xl font-extrabold text-stone-100 tracking-tight mt-1">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Is your carbon sequestration number certified?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                No — it is an estimate based on standardized agronomic emission factors (such as IPCC Tier 1 and USDA COMET-Farm), not a certified laboratory measurement. When applying for certified carbon credit registries (e.g. Verra, Gold Standard), our Field Verification Reports (audit-ready evidence packages) serve as high-integrity supporting documentation for accredited third-party verification.
              </p>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>How much will I get paid for switching to no-till or cover crops?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                Payout eligibility and amounts depend on external grant programs (e.g., USDA NRCS EQIP, CSP) or private carbon credit buyer agreements. TerraSoil models your estimated carbon sequestration tonnage and provides standard pricing sensitivity ($15–$35/ton) to support your enrollment applications.
              </p>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>What is the difference between carbon offsetting and carbon insetting?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                Offsetting involves purchasing carbon credits generated outside an organization's value chain. Carbon insetting refers to a corporation reducing or sequestering emissions directly within its own agricultural supply sheds (Scope 3 GHG reductions), directly benefiting the growers and landscapes they source from.
              </p>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>How are satellite NDVI and soil moisture calculated?</span>
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed pl-6">
                We pull multispectral imagery from the European Space Agency's Sentinel-2 constellation every ~12 days. Normalized Difference Vegetation Index (NDVI) measures vegetative greenness and canopy vigor, while microwave synthetic aperture radar (SAR) provides surface and root-zone moisture anomalies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action Banner */}
      <section className="py-16 bg-gradient-to-b from-stone-950 to-stone-900 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-500 mx-auto flex items-center justify-center p-0.5 shadow-xl shadow-emerald-950/60">
            <Sprout className="w-7 h-7 text-stone-950 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            Ready to Verify Your Soil Carbon?
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto">
            Join hundreds of regenerative farmers and agronomists using TerraSoil MRV Portal. Start mapping fields and documenting practices immediately.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={onStartNow}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-stone-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-950/80 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
            >
              <span>Start Now</span>
              <ArrowRight className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onOpenAuthModal('signin')}
              className="px-6 py-3.5 rounded-2xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-200 text-sm font-bold transition"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 border-t border-stone-800 text-xs text-stone-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-300">TerraSoil Portal</span>
            <span>&bull;</span>
            <span>Measurement, Reporting &amp; Verification (MRV) SaaS</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onStartNow}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Launch Portal
            </button>
            <button
              onClick={onOpenPricingModal}
              className="text-stone-400 hover:text-stone-200"
            >
              Pricing
            </button>
            <button
              onClick={onOpenReportModal}
              className="text-stone-400 hover:text-stone-200"
            >
              Field Verification Reports
            </button>
            {onOpenTerraSoilPdf && (
              <button
                onClick={onOpenTerraSoilPdf}
                className="text-stone-400 hover:text-stone-200"
              >
                AI PDF Guide
              </button>
            )}
            <a href="mailto:support@terrasoil.ag" className="hover:text-stone-300">
              support@terrasoil.ag
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
