import React, { useState } from 'react';
import { 
  UserPersona, 
  MFAMethod, 
  OnboardingState, 
  AuthUser 
} from '../types';
import { MOCK_AUTH_USERS, ExtendedAuthUser } from '../data/mockAuthData';
import { 
  Tractor, 
  Users, 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Key, 
  Smartphone, 
  QrCode, 
  Copy, 
  Download, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  RefreshCw,
  HelpCircle,
  Sprout
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLoginSuccess: (user: ExtendedAuthUser) => void;
  initialMode?: 'signin' | 'signup' | 'recovery';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'mfa_challenge' | 'recovery' | 'recovery_sent'>(initialMode);
  
  // Sign In Form States
  const [emailOrPhone, setEmailOrPhone] = useState<string>('dale@heartlandfarms.com');
  const [password, setPassword] = useState<string>('TerraSoil2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Pending user for MFA challenge
  const [pendingMfaUser, setPendingMfaUser] = useState<ExtendedAuthUser | null>(null);
  const [mfaCode, setMfaCode] = useState<string>('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState<boolean>(false);

  // Recovery States
  const [recoveryInput, setRecoveryInput] = useState<string>('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  // Signup / Onboarding Wizard State (Tied to PRD-02-05)
  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedRole, setSelectedRole] = useState<UserPersona>('farmer');
  
  // Step 2: Account credentials
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmailOrPhone, setSignupEmailOrPhone] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState<string>('');
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);

  // Step 3: Role-specific details (PRD-02 through PRD-05)
  const [orgName, setOrgName] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [operationScale, setOperationScale] = useState<string>('');
  const [primaryCropsOrCommodities, setPrimaryCropsOrCommodities] = useState<string>('Corn & Soybeans');
  const [licenseOrRegistryId, setLicenseOrRegistryId] = useState<string>('');

  // Step 4: Security & MFA
  const [enableMfa, setEnableMfa] = useState<boolean>(true);
  const [chosenMfaMethod, setChosenMfaMethod] = useState<MFAMethod>('authenticator');
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');
  const [copiedCodes, setCopiedCodes] = useState<boolean>(false);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(true);

  // Mock generated emergency backup codes for new registrations
  const [generatedBackupCodes] = useState<string[]>([
    '4A81-99C2', '77FE-1200', 'B124-88A9', '33D8-55F1',
    'C991-0023', 'E542-77BA', '90FA-4411', '18B7-9933'
  ]);

  if (!isOpen) return null;

  // Detect whether input is an email or phone number
  const isEmail = (val: string) => val.includes('@');
  const isPhone = (val: string) => /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(val) && val.replace(/\D/g, '').length >= 7;

  // Handle Quick Demo Login for instant testing of all 4 PRD roles
  const handleQuickDemoLogin = (role: UserPersona) => {
    setSignInError(null);
    const user = MOCK_AUTH_USERS[role];
    if (user.mfaEnabled) {
      setPendingMfaUser(user);
      setMode('mfa_challenge');
      setMfaCode('');
      setMfaError(null);
    } else {
      onLoginSuccess(user);
      onClose();
    }
  };

  // Submit standard Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    if (!emailOrPhone.trim()) {
      setSignInError('Please enter your registered email address or phone number.');
      return;
    }
    if (!password) {
      setSignInError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Search mock users by email or phone
      const normalizedInput = emailOrPhone.trim().toLowerCase();
      const matchedUser = Object.values(MOCK_AUTH_USERS).find((u) => {
        const userEmail = u.email.toLowerCase();
        const userPhoneDigits = u.phone.replace(/\D/g, '');
        const inputDigits = normalizedInput.replace(/\D/g, '');
        return userEmail === normalizedInput || (inputDigits.length >= 7 && userPhoneDigits.includes(inputDigits));
      });

      if (!matchedUser) {
        setSignInError('Account not found with this email or phone. Try demo accounts below or create an account.');
        return;
      }

      // Check MFA requirement
      if (matchedUser.mfaEnabled) {
        setPendingMfaUser(matchedUser);
        setMode('mfa_challenge');
        setMfaCode('');
      } else {
        onLoginSuccess(matchedUser);
        onClose();
      }
    }, 450);
  };

  // Submit MFA Code
  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);

    if (!mfaCode.trim()) {
      setMfaError('Please enter the 6-digit verification code or 8-digit backup code.');
      return;
    }

    // Accept mock verification code '482910' or any 6-digit code or matching backup code
    const isMockOtp = mfaCode.trim() === '482910' || mfaCode.trim().length === 6;
    const isBackupMatch = pendingMfaUser?.backupCodes.some(
      (c) => c.replace('-', '').toLowerCase() === mfaCode.replace('-', '').toLowerCase()
    );

    if (isMockOtp || isBackupMatch) {
      if (pendingMfaUser) {
        onLoginSuccess(pendingMfaUser);
      }
      onClose();
    } else {
      setMfaError('Invalid verification code. Please check your authenticator or SMS.');
    }
  };

  // Handle Account Recovery Submit
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryInput.trim()) {
      setRecoveryError('Please provide your registered email or phone.');
      return;
    }
    setRecoveryError(null);
    setMode('recovery_sent');
  };

  // Handle Sign Up Wizard Completion (PRD-02-05)
  const handleCompleteSignup = () => {
    const newUser: ExtendedAuthUser = {
      id: `usr-${selectedRole}-${Date.now().toString(36)}`,
      name: signupName || 'New TerraSoil Member',
      email: isEmail(signupEmailOrPhone) ? signupEmailOrPhone : `${signupName.toLowerCase().replace(/\s+/g, '.')}@terrasoil-farm.ag`,
      phone: !isEmail(signupEmailOrPhone) ? signupEmailOrPhone : '+1 (555) 019-8822',
      role: selectedRole,
      organization: orgName || (selectedRole === 'farmer' ? 'Prairie View Holdings' : 'TerraSoil Agri Advisory'),
      jobTitle: jobTitle || (selectedRole === 'farmer' ? 'Owner / Producer' : selectedRole === 'agronomist' ? 'Lead Consultant' : selectedRole === 'corporate' ? 'Supply Chain ESG Director' : 'Lead GHG Verifier'),
      mfaEnabled: enableMfa,
      mfaMethod: chosenMfaMethod,
      recoveryEmail: recoveryEmail || (isEmail(signupEmailOrPhone) ? signupEmailOrPhone : 'backup@terrasoil.ag'),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      termsAccepted: termsAgreed,
      operationScaleLabel: operationScale || (selectedRole === 'farmer' ? '1,800 Enrolled Acres' : '12 Managed Operations'),
      backupCodes: generatedBackupCodes,
    };

    onLoginSuccess(newUser);
    onClose();
  };

  // Password strength computation for Step 2
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(signupPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Header & Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-500 p-0.5 flex items-center justify-center shadow-lg">
              <Sprout className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-100 text-sm tracking-tight">TerraSoil MRV Portal</span>
                <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-800/80">
                  SECURE AUTH v2.4
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Enterprise Authentication &amp; Multi-Role Onboarding (PRD-02–05)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* MODE: SIGN IN */}
        {/* ============================================================ */}
        {mode === 'signin' && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back to TerraSoil</h2>
              <p className="text-xs text-stone-400">
                Sign in using your verified email address or mobile phone number
              </p>
            </div>

            {signInError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{signInError}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email or Phone Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>Email Address or Phone Number</span>
                  <span className="text-[10px] font-normal text-stone-400">SMS / OTP or Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    {isEmail(emailOrPhone) ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. dale@heartlandfarms.com or +1 (515) 892-4412"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryInput(emailOrPhone);
                      setMode('recovery');
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Security compliance badge */}
              <div className="flex items-center justify-between text-xs text-stone-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-stone-950 border-stone-700 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Remember this device for 30 days</span>
                </label>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>MFA Protected</span>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Operation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins for Instant Role Switching */}
            <div className="pt-2 border-t border-stone-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-stone-500">
                  1-Click Instant Sign-In by Persona (PRD-02–05)
                </span>
                <span className="text-[10px] text-emerald-400">Preloaded Roles</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('farmer')}
                  className="p-2.5 rounded-xl bg-stone-950/80 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-600/50 text-left transition group"
                >
                  <div className="flex items-center gap-2">
                    <Tractor className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-stone-200">Farmer / Grower</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5 truncate">Dale Henderson • Heartland Farms</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('agronomist')}
                  className="p-2.5 rounded-xl bg-stone-950/80 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-600/50 text-left transition group"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-stone-200">Agronomist &amp; Advisor</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5 truncate">Dr. Elena Rostova • Prairie Soil</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('corporate')}
                  className="p-2.5 rounded-xl bg-stone-950/80 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-600/50 text-left transition group"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-stone-200">Corporate Scope 3</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5 truncate">Marcus Vance • AgriGlobal ESG</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('auditor')}
                  className="p-2.5 rounded-xl bg-stone-950/80 hover:bg-stone-800/80 border border-stone-800 hover:border-cyan-600/50 text-left transition group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-stone-200">Auditor / Verifier</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5 truncate">Sarah Sterling, PE • Verra VVB</p>
                </button>
              </div>
            </div>

            {/* Bottom link to Sign Up */}
            <div className="text-center pt-2 text-xs text-stone-400">
              <span>Don&apos;t have an enrolled account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setSignupStep(1);
                }}
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                Create an account &amp; select your role
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE: MFA CHALLENGE */}
        {/* ============================================================ */}
        {mode === 'mfa_challenge' && pendingMfaUser && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Two-Factor Authentication</h2>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                {pendingMfaUser.mfaMethod === 'sms' ? (
                  <>Enter the 6-digit verification code sent via SMS to <span className="font-mono text-emerald-400">{pendingMfaUser.phone.slice(0, 8)}****</span></>
                ) : (
                  <>Enter the 6-digit dynamic code generated by your Authenticator App (Google Authenticator, 1Password, or Duo)</>
                )}
              </p>
            </div>

            {mfaError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{mfaError}</span>
              </div>
            )}

            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-semibold text-stone-300">
                  {useBackupCode ? 'Emergency 8-Digit Backup Recovery Code' : '6-Digit Security PIN'}
                </label>
                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.toUpperCase())}
                    placeholder={useBackupCode ? 'e.g. A8F2-99C1' : '• • • • • •'}
                    maxLength={useBackupCode ? 10 : 6}
                    className="w-full text-center tracking-widest font-mono text-xl py-3 rounded-xl bg-stone-950 border border-stone-800 text-emerald-400 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Developer / Demo Quick Fill Button */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setMfaCode('482910')}
                  className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fill Demo Code: 482910</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition"
              >
                <span>Verify &amp; Continue to Workspace</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setUseBackupCode(!useBackupCode)}
                  className="text-stone-300 hover:text-white transition flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>{useBackupCode ? 'Use 6-digit Authenticator App' : 'Lost device? Use emergency backup code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-stone-400 hover:text-stone-200 transition"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE: FORGOT PASSWORD / ACCOUNT RECOVERY */}
        {/* ============================================================ */}
        {mode === 'recovery' && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Account Recovery</h2>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Enter your verified email or mobile phone to receive a secure one-time password reset link.
              </p>
            </div>

            {recoveryError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{recoveryError}</span>
              </div>
            )}

            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Registered Email or Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder="e.g. dale@heartlandfarms.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition"
              >
                <span>Send Security Recovery Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-stone-400 hover:text-stone-200 transition"
                >
                  &larr; Return to Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {mode === 'recovery_sent' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Recovery Instructions Dispatched</h3>
            <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
              If an account matches <span className="font-semibold text-emerald-400">{recoveryInput}</span>, a secure one-time cryptographic reset token was delivered. Check your inbox and SMS messages.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setMode('signin')}
                className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE: SIGN UP & ONBOARDING WIZARD (PRD-02 through PRD-05) */}
        {/* ============================================================ */}
        {mode === 'signup' && (
          <div className="p-6 space-y-6">
            {/* Multi-step progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                <span className="font-bold text-stone-300">
                  Step {signupStep} of 5: {
                    signupStep === 1 ? 'Select Your Operation Role (PRD-02–05)' :
                    signupStep === 2 ? 'Account Credentials' :
                    signupStep === 3 ? 'Operational Setup' :
                    signupStep === 4 ? 'Security & MFA Hardening' :
                    'Data Governance & Launch'
                  }
                </span>
                <span className="font-mono text-emerald-400 font-semibold">{signupStep * 20}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-300"
                  style={{ width: `${signupStep * 20}%` }}
                />
              </div>
            </div>

            {/* STEP 1: ROLE SELECTION (Directly tied to PRD Phase 2 - 5) */}
            {signupStep === 1 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white">Select Your Primary Operating Role</h3>
                  <p className="text-xs text-stone-400">
                    Each role unlocks dedicated features, permissions, and dashboards defined in PRD-02–05.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* ROLE 1: FARMER / GROWER (PRD Phase 2) */}
                  <div
                    onClick={() => setSelectedRole('farmer')}
                    className={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                      selectedRole === 'farmer'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                            <Tractor className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-stone-100">Farmer / Grower</h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">PRD PHASE 2</span>
                          </div>
                        </div>
                        {selectedRole === 'farmer' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        For agricultural producers &amp; landowners. Draw field boundaries, log cover crops &amp; no-till practices, track soil organic carbon (SOC), and qualify for direct carbon incentive payouts.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                      <span>• Field GIS Mapping</span>
                      <span>• Practice Tracker</span>
                      <span>• Producer Payouts</span>
                    </div>
                  </div>

                  {/* ROLE 2: AGRONOMIST / CONSULTANT (PRD Phase 3) */}
                  <div
                    onClick={() => setSelectedRole('agronomist')}
                    className={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                      selectedRole === 'agronomist'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-stone-100">Agronomist &amp; Advisor</h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">PRD PHASE 3</span>
                          </div>
                        </div>
                        {selectedRole === 'agronomist' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        For independent crop consultants, agronomists, and retailers. Manage multi-farm client portfolios, calibrate custom emission factors, and export branded PDF audit summaries.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                      <span>• Multi-Client Portfolio</span>
                      <span>• Prescriptions</span>
                      <span>• Branded PDFs</span>
                    </div>
                  </div>

                  {/* ROLE 3: CORPORATE SCOPE 3 (PRD Phase 4) */}
                  <div
                    onClick={() => setSelectedRole('corporate')}
                    className={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                      selectedRole === 'corporate'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-stone-100">Corporate Scope 3</h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">PRD PHASE 4</span>
                          </div>
                        </div>
                        {selectedRole === 'corporate' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        For food &amp; consumer goods brands and supply chain buyers. Track Land Sector insetting, aggregate Scope 3 GHG reductions, verify cryptographic data lineage, and generate CSRD/SEC-ready filings.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                      <span>• Supply Shed Insetting</span>
                      <span>• GHG Land Sector</span>
                      <span>• Lineage Hash</span>
                    </div>
                  </div>

                  {/* ROLE 4: AUDITOR / VERIFIER (PRD Phase 5) */}
                  <div
                    onClick={() => setSelectedRole('auditor')}
                    className={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                      selectedRole === 'auditor'
                        ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-stone-100">Auditor / Verifier</h4>
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">PRD PHASE 5</span>
                          </div>
                        </div>
                        {selectedRole === 'auditor' && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        For accredited Validation &amp; Verification Bodies (VVBs). Perform ISO 14064-3 and Verra VM0042 audits, cross-examine satellite evidence dossiers, and issue cryptographic verification seals.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                      <span>• ISO 14064-3 Audits</span>
                      <span>• Evidence Dossiers</span>
                      <span>• Verification Seal</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition"
                  >
                    <span>Continue with {selectedRole === 'farmer' ? 'Farmer / Grower' : selectedRole === 'agronomist' ? 'Agronomist' : selectedRole === 'corporate' ? 'Corporate Scope 3' : 'Auditor'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CREDENTIALS (Email or Phone + Password) */}
            {signupStep === 2 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white">Create Your Security Credentials</h3>
                  <p className="text-xs text-stone-400">
                    Sign up with your preferred contact method: work email or direct phone number.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-300">Full Legal Name</label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Dale Henderson"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-300">Email Address or Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        {isEmail(signupEmailOrPhone) ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      </div>
                      <input
                        type="text"
                        value={signupEmailOrPhone}
                        onChange={(e) => setSignupEmailOrPhone(e.target.value)}
                        placeholder="e.g. dale@heartlandfarms.com or +1 (515) 892-4412"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-300">Master Password</label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-200"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-300">Confirm Password</label>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPasswordConfirm}
                        onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {signupPassword && (
                    <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">Password Strength:</span>
                        <span className={`font-semibold ${
                          passwordStrength <= 2 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {passwordStrength <= 1 ? 'Weak' : passwordStrength <= 3 ? 'Good' : 'Strong (Enterprise Level)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        <div className={`rounded-full ${passwordStrength >= 1 ? 'bg-amber-500' : 'bg-stone-800'}`} />
                        <div className={`rounded-full ${passwordStrength >= 2 ? 'bg-amber-500' : 'bg-stone-800'}`} />
                        <div className={`rounded-full ${passwordStrength >= 3 ? 'bg-emerald-500' : 'bg-stone-800'}`} />
                        <div className={`rounded-full ${passwordStrength >= 4 ? 'bg-emerald-400' : 'bg-stone-800'}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupStep(3)}
                    disabled={!signupName || !signupEmailOrPhone}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition"
                  >
                    <span>Next: Operational Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ROLE-SPECIFIC OPERATIONAL SETUP */}
            {signupStep === 3 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    {selectedRole === 'farmer' ? 'Farm & Acreage Information' :
                     selectedRole === 'agronomist' ? 'Agronomy Practice & Client Capacity' :
                     selectedRole === 'corporate' ? 'Supply Shed & ESG Scope Details' :
                     'Verification Registry & Accreditation'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Configure your initial operation context to calibrate carbon emission models.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-300">
                      {selectedRole === 'farmer' ? 'Farm Operation or Ranch Legal Name' :
                       selectedRole === 'agronomist' ? 'Agronomic Advisory Firm Name' :
                       selectedRole === 'corporate' ? 'Corporate Brand / Supply Chain Entity' :
                       'Accredited Validation & Verification Body (VVB)'}
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder={
                        selectedRole === 'farmer' ? 'e.g. Heartland Organic Grains & Cattle Co.' :
                        selectedRole === 'agronomist' ? 'e.g. Prairie Soil Health Advisory Group' :
                        selectedRole === 'corporate' ? 'e.g. AgriGlobal Consumer Goods LLC' :
                        'e.g. SCS Global Services / Verra VVB-084'
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-300">Job Title or Responsibility</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder={
                          selectedRole === 'farmer' ? 'e.g. Owner & Principal Operator' :
                          selectedRole === 'agronomist' ? 'e.g. Certified Crop Adviser (CCA)' :
                          selectedRole === 'corporate' ? 'e.g. VP Sustainability & Decarbonization' :
                          'e.g. Lead GHG Audit Assessor'
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-300">
                        {selectedRole === 'farmer' ? 'Total Enrolled Acreage' :
                         selectedRole === 'agronomist' ? 'Client Operations Managed' :
                         selectedRole === 'corporate' ? 'Target Insetting Acres' :
                         'Annual Audit Volume'}
                      </label>
                      <input
                        type="text"
                        value={operationScale}
                        onChange={(e) => setOperationScale(e.target.value)}
                        placeholder={
                          selectedRole === 'farmer' ? 'e.g. 2,450 acres' :
                          selectedRole === 'agronomist' ? 'e.g. 15 client farms (22,000 acres)' :
                          selectedRole === 'corporate' ? 'e.g. 150,000 supply-shed acres' :
                          'e.g. 50+ projects / 2M tCO2e'
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-300">
                      {selectedRole === 'farmer' ? 'Primary Rotations & Crops' :
                       selectedRole === 'agronomist' ? 'Agronomy License # or Certification ID' :
                       selectedRole === 'corporate' ? 'Target Carbon Standard (GHG Land Sector / SBTi / CSRD)' :
                       'Accreditation Standard (Verra VM0042 / ISO 14064-3 / CAR)'}
                    </label>
                    <input
                      type="text"
                      value={selectedRole === 'farmer' ? primaryCropsOrCommodities : licenseOrRegistryId}
                      onChange={(e) => {
                        if (selectedRole === 'farmer') setPrimaryCropsOrCommodities(e.target.value);
                        else setLicenseOrRegistryId(e.target.value);
                      }}
                      placeholder={
                        selectedRole === 'farmer' ? 'e.g. Corn, Soybeans, Winter Cereal Rye, Alfalfa' :
                        selectedRole === 'agronomist' ? 'e.g. CCA-NE-881920' :
                        selectedRole === 'corporate' ? 'e.g. GHG Protocol Land Sector and Removals' :
                        'e.g. ISO 14064-3 / Verra VVB Accredited'
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition"
                  >
                    <span>Next: Security &amp; MFA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SECURITY & MULTI-FACTOR AUTHENTICATION */}
            {signupStep === 4 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto mb-1">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Security Hardening &amp; MFA</h3>
                  <p className="text-xs text-stone-400">
                    TerraSoil MRV enlists mandatory Multi-Factor Authentication to protect confidential land data.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* MFA Method Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => setChosenMfaMethod('authenticator')}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        chosenMfaMethod === 'authenticator'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-stone-200">Authenticator App</span>
                      </div>
                      <p className="text-[10px] text-stone-400">Google Authenticator, 1Password, Duo (TOTP)</p>
                    </div>

                    <div
                      onClick={() => setChosenMfaMethod('sms')}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        chosenMfaMethod === 'sms'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                          : 'bg-stone-950 border-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-stone-200">SMS Verification</span>
                      </div>
                      <p className="text-[10px] text-stone-400">Secure 6-digit text message to mobile</p>
                    </div>
                  </div>

                  {/* QR Code / Key Preview */}
                  {chosenMfaMethod === 'authenticator' ? (
                    <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-4">
                      <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                        <QrCode className="w-14 h-14 text-stone-950" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-300 font-semibold">Scan QR or enter Secret Key:</span>
                          <span className="font-mono text-[11px] bg-stone-900 px-2 py-0.5 rounded border border-stone-700 text-emerald-400">
                            JBSWY3DPEHPK3PXP
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400">
                          Scan with your mobile authenticator app to enable instant verification.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-stone-200">SMS Two-Step Verification Ready</p>
                        <p className="text-[11px] text-stone-400">
                          Codes will be automatically dispatched to {signupEmailOrPhone || '+1 (515) 892-4412'} upon sign in.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* One-Time Emergency Backup Codes */}
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>Emergency Backup Recovery Codes</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedBackupCodes.join('\n'));
                          setCopiedCodes(true);
                          setTimeout(() => setCopiedCodes(false), 2500);
                        }}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        {copiedCodes ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCodes ? 'Copied to Clipboard' : 'Copy All Codes'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] text-stone-300 bg-stone-900/90 p-2 rounded-lg border border-stone-800 text-center">
                      {generatedBackupCodes.map((code, idx) => (
                        <span key={idx} className="bg-stone-950 px-1 py-0.5 rounded border border-stone-800">
                          {code}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-500">
                      Store these 8 codes in a safe place. They grant access if you lose your phone or security device.
                    </p>
                  </div>

                  {/* Recovery Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-300">Secondary Account Recovery Email</label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="e.g. personal-backup@gmail.com"
                      className="w-full px-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(3)}
                    className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupStep(5)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition"
                  >
                    <span>Next: Review &amp; Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & LAUNCH WORKSPACE */}
            {signupStep === 5 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-500 p-0.5 flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <CheckCircle2 className="w-7 h-7 text-stone-950" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Ready to Initialize Your Portal</h3>
                  <p className="text-xs text-stone-400">
                    Review your account profile and accept the cryptographic data governance charter.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
                    <div>
                      <h4 className="font-bold text-stone-100 text-sm">{signupName || 'Dale Henderson'}</h4>
                      <p className="text-stone-400">{orgName || 'Heartland Organic Grains'}</p>
                    </div>
                    <span className="bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-800 uppercase">
                      {selectedRole} Role
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-stone-300">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase">Identifier</span>
                      <span className="font-mono">{signupEmailOrPhone || 'dale@heartlandfarms.com'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase">Two-Factor Authentication</span>
                      <span className="text-emerald-400 font-medium">
                        {chosenMfaMethod === 'authenticator' ? 'TOTP Authenticator' : 'SMS Code'} Enforced
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase">Operating Scale</span>
                      <span>{operationScale || '2,450 Acres Enrolled'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase">Security Compliance</span>
                      <span className="text-emerald-400">ISO 27001 / SOC 2 Ready</span>
                    </div>
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-300">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-0.5 rounded bg-stone-950 border-stone-700 text-emerald-600 focus:ring-0"
                    />
                    <span className="leading-relaxed">
                      I agree to the <strong className="text-stone-100">TerraSoil Soil Data Governance Charter</strong>, including cryptographic practice verification, satellite telemetry authorization, and non-certified estimate disclosures.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(4)}
                    className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteSignup}
                    disabled={!termsAgreed}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-emerald-950/50 transition hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>Launch {selectedRole === 'farmer' ? 'Grower Portal' : selectedRole === 'agronomist' ? 'Advisor Suite' : selectedRole === 'corporate' ? 'Scope 3 Hub' : 'Auditor Console'}</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              </div>
            )}

            {/* Back to sign in link */}
            <div className="text-center pt-2 text-xs text-stone-400 border-t border-stone-800/80">
              <span>Already have an active account? </span>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
