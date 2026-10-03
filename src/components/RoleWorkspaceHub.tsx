import React, { useState } from 'react';
import { UserPersona, Farm, Field, PracticeRecord } from '../types';
import { FarmerGrowerHub } from './FarmerGrowerHub';
import { AgronomistConsultantHub } from './AgronomistConsultantHub';
import { CorporateScope3Hub } from './CorporateScope3Hub';
import { AuditorVerifierHub } from './AuditorVerifierHub';
import { SecondaryRolesHub } from './SecondaryRolesHub';
import { 
  Tractor, 
  Users, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  FileText, 
  Download, 
  Plus, 
  Sparkles, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Layers, 
  BarChart2, 
  Leaf, 
  Droplets,
  HelpCircle,
  FileSpreadsheet,
  Check,
  Scale,
  Lock,
  Eye
} from 'lucide-react';

interface RoleWorkspaceHubProps {
  activePersona: UserPersona;
  currentFarm: Farm;
  farms: Farm[];
  onSelectFarm: (farm: Farm) => void;
  onOpenReportModal: () => void;
  onOpenPricingModal: () => void;
  onAddPractice?: (fieldId: string, practice: Omit<PracticeRecord, 'id'>) => void;
  onOpenComparisonModal?: () => void;
  onOpenLineageModal?: (field: Field) => void;
}

export const RoleWorkspaceHub: React.FC<RoleWorkspaceHubProps> = ({
  activePersona,
  currentFarm,
  farms,
  onSelectFarm,
  onOpenReportModal,
  onOpenPricingModal,
  onAddPractice,
  onOpenComparisonModal,
  onOpenLineageModal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [workspaceView, setWorkspaceView] = useState<'primary' | 'extended'>('primary');
  const [auditorSubView, setAuditorSubView] = useState<'evidence_review' | 'verification_workflow' | 'findings_ledger' | 'audit_trail' | 'assurance_statement'>('audit_trail');
  const [corporateSubView, setCorporateSubView] = useState<'emissions_center' | 'reporting_center' | 'supplier_portal' | 'data_scoring' | 'calc_engine' | 'methodology_versioning' | 'audit_ledger' | 'gap_analysis' | 'reduction_projects' | 'target_tracking'>('reporting_center');

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl mb-6 space-y-5 transition-all">
      {/* Workspace Hub Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-md">
            {activePersona === 'farmer' && <Tractor className="w-5 h-5" />}
            {activePersona === 'agronomist' && <Users className="w-5 h-5" />}
            {activePersona === 'corporate' && <Building2 className="w-5 h-5" />}
            {activePersona === 'auditor' && <ShieldCheck className="w-5 h-5 text-cyan-400" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Dedicated Role Workspace
              </span>
              <span className="text-stone-600">&bull;</span>
              <span className="text-xs text-stone-400 font-semibold">
                {activePersona === 'farmer' && 'Individual Grower Tools'}
                {activePersona === 'agronomist' && 'Agronomist & Consultant Suite'}
                {activePersona === 'corporate' && 'Supply Chain Scope 3 Desk'}
                {activePersona === 'auditor' && 'Auditor & Verifier Assurance Console'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-100">
              {activePersona === 'farmer' && 'Grower Operations, Grant Subsidies & Equipment Hub'}
              {activePersona === 'agronomist' && 'Client Portfolio Benchmarking & Prescription Engine'}
              {activePersona === 'corporate' && 'Scope 3 Supply Chain Sourcing Aggregation & Insetting Desk'}
              {activePersona === 'auditor' && 'Evidence Review, Audit Trail Ledger & ISO 14064-3 Attestation'}
            </h3>
          </div>
        </div>

        {/* View Switcher & Modal Quick Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Role vs Extended Roles Toggle */}
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setWorkspaceView('primary')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                workspaceView === 'primary'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Primary Workspace
            </button>
            <button
              onClick={() => setWorkspaceView('extended')}
              className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                workspaceView === 'extended'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Extended Roles (6)</span>
            </button>
          </div>

          {onOpenLineageModal && currentFarm.fields.length > 0 && (
            <button
              onClick={() => onOpenLineageModal(currentFarm.fields[0])}
              className="bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700/80 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Inspect cryptographic Carbon Data Lineage and RBAC permission model"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Data Lineage &amp; RBAC</span>
              <span className="sm:hidden">Lineage</span>
            </button>
          )}

          {onOpenComparisonModal && (
            <button
              onClick={onOpenComparisonModal}
              className="bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700/80 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Compare any two fields in a side-by-side comparative bar chart"
            >
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compare Fields</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800 transition"
            title={isExpanded ? 'Collapse workspace' : 'Expand workspace'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-View Quick Navigation Pills for Corporate & Auditor */}
      {isExpanded && workspaceView === 'primary' && (
        <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-stone-400">
              {activePersona === 'corporate' && 'Corporate Sub-Views:'}
              {activePersona === 'auditor' && 'Auditor Sub-Views:'}
              {activePersona === 'agronomist' && 'Consultant Modules:'}
              {activePersona === 'farmer' && 'Grower Modules:'}
            </span>

            {/* Corporate Sub-View Switchers */}
            {activePersona === 'corporate' && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCorporateSubView('reporting_center')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    corporateSubView === 'reporting_center'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Supply Chain Aggregation &amp; Sourcing Report</span>
                </button>
                <button
                  onClick={() => setCorporateSubView('emissions_center')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    corporateSubView === 'emissions_center'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scope 3 Cat 1 Insetting Center</span>
                </button>
                <button
                  onClick={() => setCorporateSubView('audit_ledger')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    corporateSubView === 'audit_ledger'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audit &amp; Assurance Ledger</span>
                </button>
                <button
                  onClick={() => setCorporateSubView('data_scoring')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    corporateSubView === 'data_scoring'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Supplier DQI 5-Pillar Scoring</span>
                </button>
              </div>
            )}

            {/* Auditor Sub-View Switchers */}
            {activePersona === 'auditor' && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setAuditorSubView('audit_trail')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    auditorSubView === 'audit_trail'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Audit Trail Ledger &amp; Signatures</span>
                </button>
                <button
                  onClick={() => setAuditorSubView('evidence_review')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    auditorSubView === 'evidence_review'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Evidence &amp; Calculation Review</span>
                </button>
                <button
                  onClick={() => setAuditorSubView('findings_ledger')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    auditorSubView === 'findings_ledger'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Findings &amp; Corrective Action</span>
                </button>
                <button
                  onClick={() => setAuditorSubView('assurance_statement')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    auditorSubView === 'assurance_statement'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  <span>ISO 14064-3 Attestation Statement</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsible Workspace Body */}
      {isExpanded && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Extended Roles View */}
          {workspaceView === 'extended' && (
            <SecondaryRolesHub
              currentFarm={currentFarm}
              farms={farms}
              onSelectFarm={onSelectFarm}
              onOpenReportModal={onOpenReportModal}
              onOpenPricingModal={onOpenPricingModal}
              onOpenLineageModal={onOpenLineageModal}
            />
          )}

          {/* Primary Persona Views */}
          {workspaceView === 'primary' && (
            <>
              {/* ========================================================= */}
              {/* ROLE 1: FARMER / GROWER UNIQUE FEATURES (PRD Phase 2) */}
              {/* ========================================================= */}
              {activePersona === 'farmer' && (
                <FarmerGrowerHub
                  currentFarm={currentFarm}
                  fields={currentFarm.fields}
                  onAddPractice={onAddPractice}
                  onOpenReportModal={onOpenReportModal}
                  onOpenPricingModal={onOpenPricingModal}
                  onOpenComparisonModal={onOpenComparisonModal}
                  onOpenLineageModal={onOpenLineageModal}
                />
              )}

              {/* ========================================================= */}
              {/* ROLE 2: AGRONOMIST / CONSULTANT UNIQUE FEATURES (PRD Phase 3) */}
              {/* ========================================================= */}
              {activePersona === 'agronomist' && (
                <AgronomistConsultantHub
                  currentFarm={currentFarm}
                  farms={farms}
                  onSelectFarm={onSelectFarm}
                  onOpenReportModal={onOpenReportModal}
                  onOpenPricingModal={onOpenPricingModal}
                  onOpenComparisonModal={onOpenComparisonModal}
                  onOpenLineageModal={onOpenLineageModal}
                />
              )}

              {/* ========================================================= */}
              {/* ROLE 3: CORPORATE SCOPE 3 UNIQUE FEATURES */}
              {/* ========================================================= */}
              {activePersona === 'corporate' && (
                <CorporateScope3Hub
                  currentFarm={currentFarm}
                  farms={farms}
                  onSelectFarm={onSelectFarm}
                  onOpenReportModal={onOpenReportModal}
                  onOpenPricingModal={onOpenPricingModal}
                  onOpenComparisonModal={onOpenComparisonModal}
                  onOpenLineageModal={onOpenLineageModal}
                  activeSubView={corporateSubView}
                  onSubViewChange={setCorporateSubView}
                />
              )}

              {/* ========================================================= */}
              {/* ROLE 4: AUDITOR / VERIFIER UNIQUE FEATURES (PRD Phase 5) */}
              {/* ========================================================= */}
              {activePersona === 'auditor' && (
                <AuditorVerifierHub
                  currentFarm={currentFarm}
                  farms={farms}
                  onSelectFarm={onSelectFarm}
                  onOpenReportModal={onOpenReportModal}
                  onOpenPricingModal={onOpenPricingModal}
                  onOpenComparisonModal={onOpenComparisonModal}
                  onOpenLineageModal={onOpenLineageModal}
                  activeSubView={auditorSubView}
                  onSubViewChange={setAuditorSubView}
                />
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
};
