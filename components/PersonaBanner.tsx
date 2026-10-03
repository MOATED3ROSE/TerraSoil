import React from 'react';
import { UserPersona, Farm } from '../types';
import { Tractor, Users, Building2, ShieldCheck, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import heroImage from '../assets/images/hero_agriculture_carbon.jpg';

interface PersonaBannerProps {
  activePersona: UserPersona;
  currentFarm: Farm;
  onOpenReportModal: () => void;
  onOpenPricingModal: () => void;
}

export const PersonaBanner: React.FC<PersonaBannerProps> = ({
  activePersona,
  currentFarm,
  onOpenReportModal,
  onOpenPricingModal,
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl mb-6">
      {/* Background Graphic with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Regenerative agriculture field with soil sensor and irrigation"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              {activePersona === 'farmer' && <Tractor className="w-4 h-4" />}
              {activePersona === 'agronomist' && <Users className="w-4 h-4" />}
              {activePersona === 'corporate' && <Building2 className="w-4 h-4" />}
              {activePersona === 'auditor' && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {activePersona === 'farmer' && 'Individual Grower Workspace'}
              {activePersona === 'agronomist' && 'Agronomist Multi-Client Management Portal'}
              {activePersona === 'corporate' && 'Enterprise Scope 3 Agricultural Supply Network'}
              {activePersona === 'auditor' && 'Independent Verifier & Assurance Console (ISO 14064-3)'}
            </span>
            <span className="text-stone-500 text-xs">&bull;</span>
            <span className="text-xs font-semibold text-stone-300">
              {currentFarm.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            {activePersona === 'farmer' && 'Verify Practices. Unlock Carbon Subsidies.'}
            {activePersona === 'agronomist' && 'Multi-Farm Soil Organic Carbon & Client Reporting'}
            {activePersona === 'corporate' && 'Supply Chain Insetting & Scope 3 MRV Verification'}
            {activePersona === 'auditor' && 'Independent Evidence Review & Assurance Attestation'}
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {activePersona === 'farmer' &&
              'Draw field boundaries, track Sentinel-2 NDVI vegetative health, log cover cropping and no-till events, and download audit-ready compliance reports for carbon buyers and USDA grants.'}
            {activePersona === 'agronomist' &&
              'Manage soil health and baseline carbon across multiple client operations. Export white-labeled, branded PDF verification reports with your firm credentials and methodology appendices.'}
            {activePersona === 'corporate' &&
              'Track supplier-level regenerative practice adoption, verify additionality using satellite groundcover feeds, and aggregate Scope 3 greenhouse gas abatement for GHG Protocol disclosures.'}
            {activePersona === 'auditor' &&
              'Conduct independent review across source data, multispectral satellite groundcover, laboratory soil core assays, and calculation equations to issue ISO 14064-3 limited assurance opinions.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-300">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{currentFarm.verifiedPracticesPct}% Satellite Confirmed</span>
            </span>
            <span className="text-stone-600" aria-hidden="true">&bull;</span>
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{currentFarm.totalAcreage.toLocaleString()} Acres Active</span>
            </span>
            <span className="text-stone-600" aria-hidden="true">&bull;</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span>Status: <strong className="text-emerald-400 font-semibold">{currentFarm.auditStatus}</strong></span>
            </span>
          </div>
        </div>

        {/* Quick CTA Card */}
        <div className="bg-stone-900/95 backdrop-blur-md border border-stone-800 p-5 rounded-2xl shadow-xl w-full md:w-auto shrink-0 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            {activePersona === 'farmer' && 'Grower Actions'}
            {activePersona === 'agronomist' && 'Consultant Tools'}
            {activePersona === 'corporate' && 'Scope 3 Tools'}
            {activePersona === 'auditor' && 'Assurance Controls'}
          </span>
          <button
            onClick={onOpenReportModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {activePersona === 'auditor' ? 'Export Assurance Dossier' : 'Generate Audit Report'}
          </button>
          <button
            onClick={onOpenPricingModal}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/80 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:text-white text-center"
          >
            {activePersona === 'farmer' ? 'View Basic Plan ($39/mo)' : activePersona === 'auditor' ? 'One-Time Audit Tier ($99/field)' : 'View Professional Tier ($199/mo)'}
          </button>
        </div>
      </div>
    </div>
  );
};
