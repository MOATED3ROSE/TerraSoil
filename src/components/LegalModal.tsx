import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, Database, CheckCircle2, X, Download } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'data_rights';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'data_rights',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'data_rights'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100">TerraSoil Legal &amp; Governance Center</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Farmer-First Covenant
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Transparent commitments on grower data ownership, privacy protection, and service terms.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-stone-800 bg-stone-950/30 flex gap-2">
          <button
            onClick={() => setActiveTab('data_rights')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'data_rights'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Grower Data Rights &amp; Ownership</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service &amp; MRV Scope</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-300 leading-relaxed max-h-[60vh]">
          {activeTab === 'data_rights' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>The TerraSoil Farmer Data Ownership Covenant</span>
                </h3>
                <p className="text-stone-300">
                  You own your land data. Period. TerraSoil does not monetize, sell, or rent your field boundaries, yield history, or soil carbon telemetry to grain buyers, seed companies, or hedge funds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-100 flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>Complete Data Portability</span>
                  </h4>
                  <p className="text-stone-400 text-[11px]">
                    Export your raw GeoJSON boundaries, practice records, and carbon calculation files at any moment in open, standard formats (CSV, GeoJSON, PDF). No vendor lock-in.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-100 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span>Selective Disclosure Control</span>
                  </h4>
                  <p className="text-stone-400 text-[11px]">
                    You decide who sees your numbers. When sharing reports with corporate buyers or agronomists, you can anonymize parcel identities or share only aggregated supply-shed metrics.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Zero Monetization of Grower Data</span>
                  </h4>
                  <p className="text-stone-400 text-[11px]">
                    We will never package your farm’s agronomic data for speculative carbon commodity trading or third-party ad targeting. Our business model is pure subscription software.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-100 flex items-center gap-2">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Permanent Right to Erasure</span>
                  </h4>
                  <p className="text-stone-400 text-[11px]">
                    If you close your account, you can request a purge of all uploaded shapefiles, field notes, and telemetry caches within 30 days of closure.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-100">Privacy Policy (Effective October 2026)</h3>
              <p>
                TerraSoil ("we", "us") respects the confidential nature of agricultural operations. This Privacy Policy explains how information is collected, used, and protected across our platform.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-bold text-stone-200">1. Information We Collect</h4>
                <p className="text-stone-400">
                  • <strong>Account Details:</strong> Name, professional email, phone number, and organization role.<br />
                  • <strong>Farm Geographic Data:</strong> Parcel GPS boundaries, soil classifications, and acreage figures you choose to enter or upload.<br />
                  • <strong>Satellite Telemetry:</strong> Public Copernicus Sentinel-2 multispectral and radar imagery retrieved for your designated parcel coordinates.<br />
                  • <strong>Regenerative Practice Logs:</strong> Implementation dates, cover crop species, tillage methods, and fertilizer reduction logs.
                </p>

                <h4 className="font-bold text-stone-200">2. How We Use Data</h4>
                <p className="text-stone-400">
                  Data is processed strictly to provide carbon sequestration estimates, satellite NDVI time-series, soil moisture alerts, and downloadable audit-ready evidence packages. We do not sell or share customer data with third parties.
                </p>

                <h4 className="font-bold text-stone-200">3. Security Safeguards</h4>
                <p className="text-stone-400">
                  All communications and stored datasets utilize TLS 1.3 encryption in transit and AES-256 encryption at rest. Multi-factor authentication (MFA) via TOTP authenticator and SMS is supported across all roles.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-100">Terms of Service &amp; MRV Scope Notice</h3>
              <p>
                By using TerraSoil, you agree to these Terms of Service. Please review the following key operational parameters and regulatory boundaries:
              </p>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-[11px] leading-relaxed">
                <strong>Important Agronomic &amp; Verification Disclaimer:</strong> TerraSoil generates estimates based on standardized emission factors (IPCC Tier 1 and USDA COMET-Farm methodologies). TerraSoil is not an agronomist, a certified carbon-credit verifier (VVB), an insurer, or a legal counsel. Carbon estimates must not be construed as guaranteed financial payouts or certified registry issuances.
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-stone-200">1. Nature of Evidence Packages</h4>
                <p className="text-stone-400">
                  The "Field Evidence Report" ($99/field) is an audit-ready empirical evidence package designed to support third-party verifiers (ISO 14064-3, Verra VM0042) and government grant applications (USDA NRCS EQIP, CSP). All modeled outputs carry a "Not independently verified" designation until an accredited verification body completes formal audit procedures.
                </p>

                <h4 className="font-bold text-stone-200">2. Geographic Scope &amp; Currency</h4>
                <p className="text-stone-400">
                  All subscriptions and report fees are billed in US Dollars (USD). While satellite coverage is global, standardized agronomic emission baselines are calibrated for temperate, continental, and subtropical cropland/pasture regions (North America, Western Europe, Australia, Latin America).
                </p>

                <h4 className="font-bold text-stone-200">3. Human Review &amp; Support</h4>
                <p className="text-stone-400">
                  For account inquiries, custom supply-chain deployments, or technical discrepancies, users can reach our team at <a href="mailto:support@terrasoil.ag" className="text-emerald-400 underline">support@terrasoil.ag</a>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-400">TerraSoil MRV Portal</span>
            <span>&bull;</span>
            <span>Last reviewed October 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
