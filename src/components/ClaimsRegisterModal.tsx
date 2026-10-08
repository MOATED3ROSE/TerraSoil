import React, { useState } from 'react';
import { 
  FileCheck2, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  Search, 
  Filter, 
  Calendar, 
  ExternalLink,
  BookOpen,
  Cpu,
  Eye,
  Scale
} from 'lucide-react';
import { CLAIMS_REGISTER, ClaimRegisterEntry } from '../data/claimsRegisterData';
import { DataStateBadge, DataStateType } from './DataStateBadge';

interface ClaimsRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilter?: DataStateType | 'all';
}

export const ClaimsRegisterModal: React.FC<ClaimsRegisterModalProps> = ({
  isOpen,
  onClose,
  initialFilter = 'all',
}) => {
  const [activeStateFilter, setActiveStateFilter] = useState<DataStateType | 'all'>(initialFilter);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClaimId, setSelectedClaimId] = useState<string>(CLAIMS_REGISTER[0].id);

  if (!isOpen) return null;

  const filteredClaims = CLAIMS_REGISTER.filter((claim) => {
    if (activeStateFilter !== 'all' && claim.dataState !== activeStateFilter) return false;
    if (activeCategoryFilter !== 'all' && claim.category !== activeCategoryFilter) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchText = `${claim.id} ${claim.claimShort} ${claim.claimFullText} ${claim.primarySource} ${claim.governingStandard}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const selectedClaim = CLAIMS_REGISTER.find((c) => c.id === selectedClaimId) || filteredClaims[0] || CLAIMS_REGISTER[0];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-800/80 text-amber-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100">
                  Public Scientific Claims &amp; Assurance Register
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  PRD-17 Governance
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Transparent registry of all quantitative claims, empirical sources, data states, and uncertainty disclosures.
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

        {/* Three Data States Explanation Banner */}
        <div className="px-6 py-3 bg-stone-950/40 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-[11px] text-stone-300">
            <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">Three Data States:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <strong className="text-emerald-300">Observed:</strong> Direct sensor/lab measurement
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <strong className="text-amber-300">Modeled:</strong> Formula/process estimate
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <strong className="text-cyan-300">Verified:</strong> Third-party audited
            </div>
          </div>

          <div className="text-[10px] text-stone-400 font-mono">
            Rule: Nothing is labeled as verified without completed third-party audit.
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 sm:px-6 bg-stone-950/20 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Data State Filter */}
            <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
              <button
                onClick={() => setActiveStateFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  activeStateFilter === 'all' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                All States ({CLAIMS_REGISTER.length})
              </button>
              <button
                onClick={() => setActiveStateFilter('observed')}
                className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeStateFilter === 'observed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Observed</span>
              </button>
              <button
                onClick={() => setActiveStateFilter('modeled')}
                className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeStateFilter === 'modeled' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>Modeled</span>
              </button>
              <button
                onClick={() => setActiveStateFilter('verified')}
                className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeStateFilter === 'verified' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              <option value="satellite_telemetry">Satellite &amp; Telemetry</option>
              <option value="soil_moisture">Soil &amp; Hydrology</option>
              <option value="carbon_methodology">Carbon Modeling</option>
              <option value="assurance_reporting">Assurance &amp; Reporting</option>
              <option value="legal_governance">Legal &amp; Data Rights</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims or standards..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Content Body: Master-Detail Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-stone-800">
          
          {/* Left Column: Claims List */}
          <div className="md:col-span-5 overflow-y-auto p-4 space-y-2 max-h-[55vh] md:max-h-[60vh]">
            {filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No registered claims match your filter criteria.
              </div>
            ) : (
              filteredClaims.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex flex-col gap-1.5 ${
                    selectedClaim.id === claim.id
                      ? 'bg-amber-950/20 border-amber-600/60 shadow-md'
                      : 'bg-stone-950/40 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-stone-400">
                      {claim.id}
                    </span>
                    <DataStateBadge state={claim.dataState} />
                  </div>
                  <h4 className="text-xs font-bold text-stone-100 leading-snug">
                    {claim.claimShort}
                  </h4>
                  <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                    {claim.claimFullText}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-800/60">
                    <span className="truncate max-w-[140px]">{claim.ownerRole}</span>
                    <span>Reviewed: {claim.lastReviewedDate}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right Column: Claim Inspection Details */}
          <div className="md:col-span-7 overflow-y-auto p-5 sm:p-6 space-y-5 max-h-[55vh] md:max-h-[60vh] bg-stone-950/30">
            {selectedClaim ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
                      {selectedClaim.id}
                    </span>
                    <h3 className="text-base font-bold text-stone-100">
                      {selectedClaim.claimShort}
                    </h3>
                  </div>
                  <DataStateBadge state={selectedClaim.dataState} showDetails={true} />
                </div>

                {/* Primary Claim Text Box */}
                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-stone-400">
                    Official Public Claim Statement
                  </span>
                  <p className="text-xs text-stone-200 leading-relaxed font-medium">
                    "{selectedClaim.claimFullText}"
                  </p>
                </div>

                {/* Methodology & Uncertainty Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-stone-400 block">
                      Governing Standard
                    </span>
                    <p className="text-stone-200 font-semibold text-[11px]">
                      {selectedClaim.governingStandard}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-stone-400 block">
                      Primary Data Source
                    </span>
                    <p className="text-stone-200 font-semibold text-[11px]">
                      {selectedClaim.primarySource}
                    </p>
                  </div>
                </div>

                {/* Methodology Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono uppercase font-bold text-stone-400 block">
                    Methodology &amp; Computational Physics
                  </span>
                  <p className="text-stone-300 leading-relaxed text-[11px] bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
                    {selectedClaim.methodologyDescription}
                  </p>
                </div>

                {/* Uncertainty & Accuracy Margin */}
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quantified Uncertainty Margin</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {selectedClaim.uncertaintyEstimate}
                  </p>
                </div>

                {/* Mandatory Adjacent Qualification Note */}
                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-300 font-bold">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mandatory Qualification Rule (§3 S-7)</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {selectedClaim.qualificationsNote}
                  </p>
                </div>

                {/* Metadata Footer */}
                <div className="grid grid-cols-3 gap-2 text-[10px] text-stone-500 pt-2 border-t border-stone-800">
                  <div>
                    <span className="block text-stone-400">Owner Role:</span>
                    <span>{selectedClaim.ownerRole}</span>
                  </div>
                  <div>
                    <span className="block text-stone-400">Review Date:</span>
                    <span>{selectedClaim.lastReviewedDate}</span>
                  </div>
                  <div>
                    <span className="block text-stone-400">Review Status:</span>
                    <span className="text-emerald-400 font-bold uppercase">{selectedClaim.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-stone-800 bg-stone-950/60 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <p>
            PRD-17 Governance Rule: No new public numeric claim or standards reference ships without an approved Claims Register entry.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition"
          >
            Close Register
          </button>
        </div>

      </div>
    </div>
  );
};
