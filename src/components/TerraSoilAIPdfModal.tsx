import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  DollarSign, 
  BookOpen, 
  ExternalLink,
  Printer,
  Check
} from 'lucide-react';
import { generateTerraSoilAIPdf } from '../utils/generateTerraSoilAIPdf';

interface TerraSoilAIPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerraSoilAIPdfModal: React.FC<TerraSoilAIPdfModalProps> = ({ isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      const doc = generateTerraSoilAIPdf({
        companyName: 'TerraSoil MRV Technologies',
        author: 'TerraSoil AI Architecture Team',
        generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      });
      doc.save('TerraSoil_AI_Platform_Guide.pdf');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-100">
                  TerraSoil AI — System Architecture &amp; Governance Whitepaper
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  PDF Guide
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Official specification detailing platform goals, feature capabilities, non-negotiable guardrails, and pricing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Preview Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs text-stone-300">
          {/* Executive Overview Box */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>1. Role, Mission &amp; Core Purpose</span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              TerraSoil AI is the on-site MRV (Measurement, Reporting, and Verification) intelligence system built for farmers, agronomists, and agricultural corporate supply chains. It connects Sentinel-2 satellite imagery with on-farm practice tracking to quantify, verify, and document soil organic carbon (SOC) sequestration and regenerative farming outcomes.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-900">
              <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/80">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Core Goal 1</span>
                <span className="text-stone-300 font-medium">Empower growers to monetize soil sponge resilience &amp; carbon accretion.</span>
              </div>
              <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/80">
                <span className="text-[10px] text-cyan-400 font-bold uppercase block">Core Goal 2</span>
                <span className="text-stone-300 font-medium">Provide corporate buyers auditable Scope 3 agricultural insetting records.</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side: What It CAN Do vs What It CANNOT Do */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CAN DO */}
            <div className="bg-emerald-950/20 border border-emerald-800/60 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>2. What TerraSoil AI CAN Do</span>
              </div>
              <ul className="space-y-2 text-[11px] text-stone-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>Field GIS Boundary Mapping:</strong> Digitize parcels, compute acreage, and map sub-field management zones.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>Satellite NDVI &amp; Moisture Telemetry:</strong> 5-year Sentinel-2 canopy vigor and topsoil/root-zone moisture curves.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>7-Day Weather &amp; Precipitation Heatmap:</strong> Map trafficability risks, rainfall volume, and operational windows.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>5-Year SOC Accretion Projections:</strong> USDA COMET-Farm &amp; IPCC Tier 1/2 biological compounding models.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>Audit-Ready PDF Compliance Reports:</strong> Export verified ISO 14064-2 dossiers with SHA-256 data lineage.</span>
                </li>
              </ul>
            </div>

            {/* CANNOT DO */}
            <div className="bg-rose-950/20 border border-rose-800/60 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>3. What TerraSoil AI CANNOT Do</span>
              </div>
              <ul className="space-y-2 text-[11px] text-stone-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold mt-0.5">✗</span>
                  <span><strong>NEVER state estimates as certified fact:</strong> Calculations are empirical models, not third-party legal verifications.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold mt-0.5">✗</span>
                  <span><strong>NEVER provide prescriptive farm commands:</strong> Explains what telemetry shows, never replaces certified crop advisors.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold mt-0.5">✗</span>
                  <span><strong>NEVER guarantee financial credit payouts:</strong> Market prices &amp; grant approvals depend on external bodies.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold mt-0.5">✗</span>
                  <span><strong>NEVER provide legal, tax, or credit advice:</strong> Directs users to certified legal &amp; accounting professionals.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pricing & Key Terms Strip */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Subscription Plans &amp; Pricing
              </span>
              <span className="text-stone-400 text-[11px]">Audit-Ready Transparent Pricing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Basic Tier</span>
                <span className="text-sm font-bold text-amber-300 font-mono">$29–49/mo</span>
                <p className="text-[10px] text-stone-400 mt-1">Mapping, satellite monitoring, carbon estimates for single farms.</p>
              </div>

              <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Professional Tier</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">$199/mo</span>
                <p className="text-[10px] text-stone-400 mt-1">Unlimited fields, multi-client access, branded PDF export for agronomists.</p>
              </div>

              <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Single Audit Report</span>
                <span className="text-sm font-bold text-cyan-300 font-mono">$99 / field</span>
                <p className="text-[10px] text-stone-400 mt-1">One-time downloadable audit report for USDA grant/loan applications.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-stone-400">
            Vector PDF generated formatted for ISO 14064-2 &amp; GHG Protocol compliance
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
            >
              Close
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-950"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Downloaded PDF!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating PDF...' : 'Download TerraSoil AI Guide (PDF)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
