import React, { useState } from 'react';
import { 
  AuthSession, 
  SecurityAlert, 
  MFAMethod 
} from '../types';
import { ExtendedAuthUser } from '../data/mockAuthData';
import { 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Tablet, 
  X, 
  Lock, 
  Key, 
  LogOut, 
  AlertTriangle, 
  CheckCircle2, 
  Globe, 
  Clock, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone,
  QrCode,
  Sparkles
} from 'lucide-react';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ExtendedAuthUser;
  sessions: AuthSession[];
  securityAlerts: SecurityAlert[];
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllOtherSessions: () => void;
  onToggleMfa: (enabled: boolean, method?: MFAMethod) => void;
  onUpdateRecoveryEmail: (email: string) => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  sessions,
  securityAlerts,
  onRevokeSession,
  onRevokeAllOtherSessions,
  onToggleMfa,
  onUpdateRecoveryEmail
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'mfa' | 'recovery' | 'audit_log'>('sessions');

  // MFA settings local states
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(currentUser.mfaEnabled);
  const [mfaMethod, setMfaMethod] = useState<MFAMethod>(currentUser.mfaMethod || 'authenticator');
  const [copiedCodes, setCopiedCodes] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);

  // Recovery email state
  const [recoveryEmail, setRecoveryEmail] = useState<string>(currentUser.recoveryEmail || '');
  const [recoverySaved, setRecoverySaved] = useState<boolean>(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState<boolean>(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveMfa = () => {
    onToggleMfa(mfaEnabled, mfaMethod);
    setPasswordChangeStatus('MFA security settings updated successfully.');
    setTimeout(() => setPasswordChangeStatus(null), 3000);
  };

  const handleSaveRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRecoveryEmail(recoveryEmail);
    setRecoverySaved(true);
    setTimeout(() => setRecoverySaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordChangeStatus('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeStatus('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordChangeStatus('New password must be at least 8 characters.');
      return;
    }

    setPasswordChangeStatus('Password successfully updated! All other sessions require re-authentication.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordChangeStatus(null), 4000);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-emerald-400" />;
      default:
        return <Laptop className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Security &amp; Active Sessions</h2>
                <span className="bg-emerald-900/50 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-700/60">
                  {currentUser.role.toUpperCase()} • ENCRYPTED
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Manage connected devices, multi-factor verification, and identity access control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-stone-800 bg-stone-950/40 text-xs">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'sessions'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Active Sessions ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mfa')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'mfa'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Multi-Factor Authentication (MFA)</span>
          </button>

          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'recovery'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Account Recovery &amp; Password</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_log')}
            className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'audit_log'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Security Alerts &amp; Audit Log</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: ACTIVE SESSIONS */}
        {/* ============================================================ */}
        {activeTab === 'sessions' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-100">Authorized Devices &amp; Web Sessions</h3>
                <p className="text-xs text-stone-400">
                  Devices currently signed into this account. Revoke unfamiliar sessions immediately.
                </p>
              </div>

              {sessions.filter((s) => !s.isCurrentSession).length > 0 && (
                <button
                  onClick={onRevokeAllOtherSessions}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Revoke All Other Sessions</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-4 rounded-2xl border transition ${
                    sess.isCurrentSession
                      ? 'bg-emerald-950/20 border-emerald-700/60'
                      : 'bg-stone-950 border-stone-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 shrink-0">
                        {getDeviceIcon(sess.deviceType)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-100">{sess.deviceName}</h4>
                          {sess.isCurrentSession && (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Current Session</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-stone-500" />
                            <span>{sess.location}</span>
                          </span>
                          <span className="font-mono text-stone-500">IP: {sess.ipAddress}</span>
                          <span>•</span>
                          <span>{sess.browser} on {sess.os}</span>
                        </div>

                        <p className="text-[11px] text-stone-400 flex items-center gap-1 pt-0.5">
                          <Clock className="w-3 h-3 text-stone-500" />
                          <span>Last activity: <strong className="text-stone-300">{sess.lastActive}</strong></span>
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrentSession && (
                      <button
                        onClick={() => onRevokeSession(sess.id)}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-rose-950/70 border border-stone-800 hover:border-rose-800 text-stone-400 hover:text-rose-300 text-xs font-semibold transition shrink-0"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-400 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Session tokens expire automatically after 30 days of inactivity. All session communications are secured using TLS 1.3 cryptographic cipher suites.
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MULTI-FACTOR AUTHENTICATION */}
        {/* ============================================================ */}
        {activeTab === 'mfa' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-100">Multi-Factor Authentication (MFA)</h3>
                <p className="text-xs text-stone-400">
                  Protect agricultural land data and carbon credits with an additional layer of security.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${mfaEnabled ? 'text-emerald-400' : 'text-stone-400'}`}>
                  {mfaEnabled ? 'Enforced' : 'Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    mfaEnabled ? 'bg-emerald-600 justify-end' : 'bg-stone-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>

            {mfaEnabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setMfaMethod('authenticator')}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      mfaMethod === 'authenticator'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-sm font-bold">Authenticator App (Recommended)</h4>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Generates dynamic 6-digit Time-Based One-Time Passwords (TOTP) using Google Authenticator, 1Password, or Duo.
                    </p>
                  </div>

                  <div
                    onClick={() => setMfaMethod('sms')}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      mfaMethod === 'sms'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Phone className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-sm font-bold">SMS Mobile Verification</h4>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Sends a single-use verification PIN via SMS text to your primary registered phone number upon sign in.
                    </p>
                  </div>
                </div>

                {/* QR Code and Secret Key Setup View */}
                {mfaMethod === 'authenticator' && (
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                        <QrCode className="w-14 h-14 text-stone-950" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-stone-200">TOTP Secret Seed Key</p>
                        <span className="font-mono text-xs bg-stone-900 px-2 py-0.5 rounded border border-stone-700 text-emerald-400">
                          JBSWY3DPEHPK3PXP
                        </span>
                        <p className="text-[11px] text-stone-400">
                          Scan with your mobile authenticator or copy this key manually.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowQrCode(!showQrCode)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 transition"
                    >
                      {showQrCode ? 'Hide Details' : 'Verify Setup'}
                    </button>
                  </div>
                )}

                {/* Emergency Backup Codes */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>Emergency Backup Recovery Codes</span>
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Each code can be used once to access your account if your MFA device is lost.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentUser.backupCodes.join('\n'));
                        setCopiedCodes(true);
                        setTimeout(() => setCopiedCodes(false), 2500);
                      }}
                      className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-emerald-400 flex items-center gap-1.5 transition"
                    >
                      {copiedCodes ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodes ? 'Copied' : 'Copy All'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 font-mono text-xs text-stone-300 bg-stone-900 p-2.5 rounded-xl border border-stone-800 text-center">
                    {currentUser.backupCodes.map((code, idx) => (
                      <span key={idx} className="bg-stone-950 py-1 px-1 rounded border border-stone-800">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveMfa}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                  >
                    Save MFA Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ACCOUNT RECOVERY & PASSWORD */}
        {/* ============================================================ */}
        {activeTab === 'recovery' && (
          <div className="p-6 space-y-6">
            {passwordChangeStatus && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{passwordChangeStatus}</span>
              </div>
            )}

            {/* Recovery Email */}
            <form onSubmit={handleSaveRecovery} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Secondary Recovery Email</span>
                </h4>
                <p className="text-xs text-stone-400">
                  Used exclusively to verify your identity if you are locked out of your primary account.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="e.g. personal-backup@gmail.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shrink-0"
                >
                  {recoverySaved ? 'Saved' : 'Update Recovery'}
                </button>
              </div>
            </form>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Change Master Password</span>
                  </h4>
                  <p className="text-xs text-stone-400">
                    Must be at least 8 characters with numbers and symbols.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1"
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPasswords ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Master Password"
                    className="w-full px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold transition"
                >
                  Update Master Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SECURITY AUDIT LOG */}
        {/* ============================================================ */}
        {activeTab === 'audit_log' && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-100">Security Events &amp; Compliance Audit Trail</h3>
              <p className="text-xs text-stone-400">
                Immutable audit ledger recording authentication attempts, password updates, and session events.
              </p>
            </div>

            <div className="space-y-2.5">
              {securityAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400 shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-stone-200">{alert.title}</h4>
                      <p className="text-stone-400 leading-relaxed">{alert.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-1 font-mono">
                        <span>Device: {alert.device}</span>
                        <span>•</span>
                        <span>Location: {alert.location}</span>
                        <span>•</span>
                        <span>IP: {alert.ipAddress}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-stone-400 shrink-0 font-medium">
                    {alert.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
