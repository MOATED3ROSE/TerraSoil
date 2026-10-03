import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  FileText, 
  Eye, 
  Download, 
  Share2, 
  Award, 
  Sparkles, 
  DollarSign, 
  Code, 
  Database, 
  Key, 
  Globe2, 
  Calendar, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink,
  Users,
  Building2,
  RefreshCw,
  Terminal,
  Send,
  Zap,
  Filter,
  Info
} from 'lucide-react';
import { Farm, Field } from '../types';

interface AddOnModulesHubProps {
  isOpen: boolean;
  onClose: () => void;
  currentFarm: Farm;
  selectedField: Field | null;
  initialModule?: 'data_room' | 'grants' | 'carbon_program' | 'api_console';
}

export const AddOnModulesHub: React.FC<AddOnModulesHubProps> = ({
  isOpen,
  onClose,
  currentFarm,
  selectedField,
  initialModule = 'data_room',
}) => {
  const [activeModule, setActiveModule] = useState<'data_room' | 'grants' | 'carbon_program' | 'api_console'>(initialModule);

  // Carbon Data Room State
  const [watermarkNda, setWatermarkNda] = useState(true);
  const [dataRoomExpiryDays, setDataRoomExpiryDays] = useState(30);
  const [dataRoomPassword, setDataRoomPassword] = useState('TerraSoil-VDR-2026');
  const [copiedLink, setCopiedLink] = useState(false);
  const [vdrAccessLogs] = useState([
    { id: 'log-1', entity: 'SCS Global Verifier (Auditor)', action: 'Downloaded Field 1 SOC Lineage PDF', timestamp: '2 hours ago', ip: '192.168.1.42', status: 'Verified' },
    { id: 'log-2', entity: 'Cargill Scope 3 Buyer', action: 'Viewed Sentinel-2 NDVI 6-Mo Trends', timestamp: ' Yesterday at 16:45', ip: '172.56.12.80', status: 'Verified' },
    { id: 'log-3', entity: 'Rabobank Ag Lending Officer', action: 'Inspected Practice Ledger & ROI', timestamp: '3 days ago', ip: '204.11.89.12', status: 'Verified' },
  ]);

  // Grant & Incentive Intelligence State
  const [selectedGrantProgram, setSelectedGrantProgram] = useState<string>('eqip');
  const [grantFormPrefilled, setGrantFormPreFilled] = useState(false);
  const targetField = selectedField || currentFarm.fields[0];

  const grantPrograms = [
    {
      id: 'eqip',
      name: 'USDA NRCS EQIP (Environmental Quality Incentives Program)',
      fundingCategory: 'Federal Conservation Subsidy',
      estPayoutPerAcre: 25,
      matchScore: 96,
      deadline: '2026-11-15',
      eligiblePractices: ['Rye / Clover Cover Crop', 'No-Till Drill Conversion', 'Nutrient 4R Optimization'],
      description: 'Provides financial and technical assistance to agricultural producers to address natural resource concerns.'
    },
    {
      id: 'csp',
      name: 'USDA NRCS CSP (Conservation Stewardship Program)',
      fundingCategory: 'Federal Stewardship Enhancement',
      estPayoutPerAcre: 18,
      matchScore: 92,
      deadline: '2026-12-01',
      eligiblePractices: ['Advanced Soil Carbon Monitoring', 'Rotational Grazing', 'Tile Drainage Water Management'],
      description: 'Helps agricultural producers maintain and improve existing conservation systems and adopt additional activities.'
    },
    {
      id: 'reap',
      name: 'USDA REAP (Rural Energy for America Program)',
      fundingCategory: 'Renewable Energy & Efficiency',
      estPayoutPerAcre: 12,
      matchScore: 84,
      deadline: '2027-03-31',
      eligiblePractices: ['Variable Rate Irrigation Solar Drive', 'Precision Ag GPS Tractor Electrification'],
      description: 'Guaranteed grant funding and loan financing to agricultural producers for renewable energy systems.'
    },
    {
      id: 'corporate_inset',
      name: 'AgriGlobal Supply Shed Insetting Incentive',
      fundingCategory: 'Private Corporate Scope 3 Premium',
      estPayoutPerAcre: 30,
      matchScore: 98,
      deadline: '2026-10-31',
      eligiblePractices: ['Multi-Species Cover Crop Mix', 'Synthetics Fertilizer -20% Reduction'],
      description: 'Direct cash premium paid by supply chain partner for verified Scope 3 tCO2e reductions in the Des Moines River Basin.'
    }
  ];

  const activeGrant = grantPrograms.find((g) => g.id === selectedGrantProgram) || grantPrograms[0];
  const totalGrantPotential = Math.round((targetField?.acreage || 160) * activeGrant.estPayoutPerAcre);

  // Carbon Program Management State
  const [creditingPeriodYear, setCreditingPeriodYear] = useState(3);
  const [bufferPoolPct, setBufferPoolPct] = useState(15);
  const grossCarbonMT = Math.round((targetField?.acreage || 160) * 0.92);
  const bufferDeductionMT = Math.round(grossCarbonMT * (bufferPoolPct / 100));
  const netCreditsIssuable = grossCarbonMT - bufferDeductionMT;

  // Data / API Console State
  const [apiKey, setApiKey] = useState('ts_live_99481a82fbc19024c0d12');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState<'telemetry' | 'carbon' | 'fields'>('telemetry');
  const [copiedApi, setCopiedApi] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-700/80 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900 border-b border-stone-800 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-stone-100 p-2 rounded-xl hover:bg-stone-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-500 text-stone-950 font-black shadow-lg shadow-emerald-950/50">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
                  Modular Expansion &amp; Product Line Hub
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded">
                  PRD-14 Expansion
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Explore specialized add-on modules designed to scale into standalone product lines.
              </p>
            </div>
          </div>

          {/* Module Selector Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-5">
            <button
              onClick={() => setActiveModule('data_room')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeModule === 'data_room'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>1. Carbon Data Room ($149/mo)</span>
            </button>

            <button
              onClick={() => setActiveModule('grants')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeModule === 'grants'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>2. Grant &amp; Incentive Intelligence ($79/mo)</span>
            </button>

            <button
              onClick={() => setActiveModule('carbon_program')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeModule === 'carbon_program'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>3. Carbon Program Suite ($299/mo)</span>
            </button>

            <button
              onClick={() => setActiveModule('api_console')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeModule === 'api_console'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>4. Data &amp; API Console ($199/mo)</span>
            </button>
          </div>
        </div>

        {/* Module Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* MODULE 1: CARBON DATA ROOM */}
          {activeModule === 'data_room' && (
            <div className="space-y-6">
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                      Secure B2B Data Sharing
                    </span>
                    <h3 className="text-lg font-bold text-stone-100 mt-1">
                      Carbon Virtual Data Room (VDR)
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Share verified empirical soil carbon, practice evidence, and Sentinel-2 satellite passes with external buyers, banks, and auditors under strict security controls.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-stone-200 bg-stone-900 border border-stone-700 px-3 py-1.5 rounded-xl">
                      $149 / mo or $49 / field
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://vdr.terrasoil.ag/share/vdr-${targetField?.id || 'f1'}?pass=${dataRoomPassword}`);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Generate Expiring Share Link'}</span>
                    </button>
                  </div>
                </div>

                {/* VDR Controls & Security Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <label className="flex items-center justify-between font-bold text-stone-200 cursor-pointer">
                      <span>Digital NDA Watermarking</span>
                      <input
                        type="checkbox"
                        checked={watermarkNda}
                        onChange={(e) => setWatermarkNda(e.target.checked)}
                        className="accent-emerald-500 rounded"
                      />
                    </label>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Stamps viewer email, IP address, and confidential NDA notice onto every PDF page and chart export.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <label className="font-bold text-stone-200 block">Link Expiration Period</label>
                    <select
                      value={dataRoomExpiryDays}
                      onChange={(e) => setDataRoomExpiryDays(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                    >
                      <option value={7}>7 Days (Temporary Access)</option>
                      <option value={30}>30 Days (Standard Audit)</option>
                      <option value={90}>90 Days (Lender Evaluation)</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <label className="font-bold text-stone-200 block">Passcode Protection</label>
                    <input
                      type="text"
                      value={dataRoomPassword}
                      onChange={(e) => setDataRoomPassword(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 font-mono text-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Real-Time Access Audit Logs */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Real-Time VDR Access &amp; Inspection Log</span>
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono">Cryptographically Logged</span>
                  </div>

                  <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-900">
                    <table className="w-full text-xs text-left text-stone-300">
                      <thead className="bg-stone-950 text-[10px] font-mono uppercase text-stone-400">
                        <tr>
                          <th className="py-2.5 px-3">Inspecting Entity</th>
                          <th className="py-2.5 px-3">Action Performed</th>
                          <th className="py-2.5 px-3">Timestamp</th>
                          <th className="py-2.5 px-3">IP Address</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/80 text-[11px]">
                        {vdrAccessLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-stone-850">
                            <td className="py-2.5 px-3 font-semibold text-stone-100">{log.entity}</td>
                            <td className="py-2.5 px-3 text-stone-300">{log.action}</td>
                            <td className="py-2.5 px-3 text-stone-400 font-mono">{log.timestamp}</td>
                            <td className="py-2.5 px-3 text-stone-400 font-mono">{log.ip}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full text-[10px] font-mono">
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: GRANT & INCENTIVE INTELLIGENCE */}
          {activeModule === 'grants' && (
            <div className="space-y-6">
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                      Automated Funding Matcher
                    </span>
                    <h3 className="text-lg font-bold text-stone-100 mt-1">
                      Grant &amp; Conservation Incentive Intelligence
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Automatically scans federal, state, and corporate incentive programs against field boundaries ({targetField?.name || 'Selected Field'}) and practice history.
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-stone-400 font-medium">Estimated Grant Eligibility</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">+${totalGrantPotential.toLocaleString()}</div>
                    <div className="text-[10px] text-stone-500">For {targetField?.acreage || 160} Acres</div>
                  </div>
                </div>

                {/* Available Matched Grant Programs List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grantPrograms.map((program) => (
                    <div
                      key={program.id}
                      onClick={() => setSelectedGrantProgram(program.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition space-y-3 ${
                        selectedGrantProgram === program.id
                          ? 'bg-emerald-950/40 border-emerald-500 text-stone-100 shadow-md'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-stone-950 border border-emerald-800/80 px-2 py-0.5 rounded">
                          {program.fundingCategory}
                        </span>
                        <span className="text-xs font-mono font-bold text-white bg-emerald-800 px-2 py-0.5 rounded-full">
                          {program.matchScore}% Match
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-stone-100">{program.name}</h4>
                        <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">{program.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
                        <span className="text-emerald-300 font-mono font-bold">${program.estPayoutPerAcre}/acre</span>
                        <span className="text-[10px] text-stone-400">Deadline: {program.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active Grant Detail & Pre-fill Form Generator */}
                <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-stone-100">{activeGrant.name}</h4>
                      <p className="text-xs text-stone-400">Selected for automated application pre-fill</p>
                    </div>

                    <button
                      onClick={() => setGrantFormPreFilled(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{grantFormPrefilled ? 'Application Package Pre-filled!' : 'Pre-fill Official Grant Paperwork'}</span>
                    </button>
                  </div>

                  {grantFormPrefilled && (
                    <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>NRCS Form CPA-52 &amp; Practice Schedule Pre-filled</span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        Extracted boundary GIS coordinates, soil taxonomy, practice logs (cover crop, no-till), and estimated carbon sequestration ({Math.round((targetField?.acreage || 160) * 0.92)} tCO2e) directly into USDA-ready application fields.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 3: CARBON PROGRAM SUITE */}
          {activeModule === 'carbon_program' && (
            <div className="space-y-6">
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                      Verra VM0042 &amp; Gold Standard Suite
                    </span>
                    <h3 className="text-lg font-bold text-stone-100 mt-1">
                      Carbon Project Management Platform
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Dedicated carbon project developer suite for managing registered crediting periods, buffer pool deductions, additionality tests, and verifier audit trails.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1.5 rounded-xl">
                    Verra VM0042 Registered
                  </span>
                </div>

                {/* Crediting Period & Buffer Pool Configurator */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <label className="font-bold text-stone-200 block">Crediting Period Timeline</label>
                    <div className="flex items-center justify-between text-xs text-stone-300 font-mono pt-1">
                      <span>Year {creditingPeriodYear} of 20</span>
                      <span className="text-emerald-400 font-bold">2024–2044</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={creditingPeriodYear}
                      onChange={(e) => setCreditingPeriodYear(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                    <label className="font-bold text-stone-200 block">Risk Buffer Pool Deduction</label>
                    <div className="flex items-center justify-between text-xs text-stone-300 font-mono pt-1">
                      <span>Reversal Risk: {bufferPoolPct}%</span>
                      <span className="text-amber-400 font-bold">-{bufferDeductionMT} MT</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={bufferPoolPct}
                      onChange={(e) => setBufferPoolPct(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Net Issuable Credits</span>
                    <div className="text-2xl font-black text-white font-mono">{netCreditsIssuable} tCO₂e</div>
                    <p className="text-[10px] text-stone-400">Gross {grossCarbonMT} MT minus {bufferDeductionMT} MT buffer pool</p>
                  </div>
                </div>

                {/* Project Compliance Checks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-100">Additionality Test Verified</div>
                      <div className="text-[10px] text-stone-400">Financial &amp; regulatory additionality proven against 10-year baseline.</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-100">Leakage Assessment</div>
                      <div className="text-[10px] text-stone-400">Zero crop displacement calculated across regional river basin.</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-stone-100">Reversal Risk Monitoring</div>
                      <div className="text-[10px] text-stone-400">Sentinel-2 SAR tillage anomaly checks active every 12 days.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 4: DATA & API CONSOLE */}
          {activeModule === 'api_console' && (
            <div className="space-y-6">
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                      Developer &amp; ERP Integration
                    </span>
                    <h3 className="text-lg font-bold text-stone-100 mt-1">
                      Data &amp; REST / GraphQL API Console
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Stream satellite telemetry, soil carbon stock baselines, and practice ledgers directly into John Deere Ops Center, Climate FieldView, or ERP data lakes.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-400 bg-stone-900 border border-stone-700 px-3 py-1.5 rounded-xl">
                    REST / GraphQL / Webhooks / WMS
                  </span>
                </div>

                {/* API Credentials Box */}
                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-200">Active API Token (Production Key)</label>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {showApiKey ? <Eye className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showApiKey ? 'Hide Secret' : 'Show Secret'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      className="flex-1 bg-stone-950 border border-stone-700 font-mono text-emerald-400 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        setCopiedApi(true);
                        setTimeout(() => setCopiedApi(false), 2000);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex items-center gap-1"
                    >
                      {copiedApi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedApi ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                </div>

                {/* Endpoint Playground Preview */}
                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-stone-300 pb-2 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">GET</span>
                      <span className="text-stone-200 font-semibold">/v1/fields/{targetField?.id || 'f1'}/telemetry</span>
                    </div>
                    <span className="text-[10px] text-stone-500">200 OK &bull; 42ms</span>
                  </div>

                  <pre className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-[11px] text-emerald-300 overflow-x-auto">
{`{
  "field_id": "${targetField?.id || 'field-101'}",
  "name": "${targetField?.name || 'North Section 14'}",
  "acreage": ${targetField?.acreage || 160},
  "sentinel_ndvi_latest": 0.74,
  "surface_moisture_pct": 28,
  "soc_baseline_mt_ha": 52.0,
  "gross_carbon_sequestration_tco2e_yr": ${Math.round((targetField?.acreage || 160) * 0.92)},
  "data_lineage_hash": "0x98f2a177c8021a998b",
  "verified_status": "ISO_14064_2_ALIGNED"
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>TerraSoil Modular Monetization Architecture</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};
