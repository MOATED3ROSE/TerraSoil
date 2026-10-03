import React from 'react';
import { ExplainThisMetricContext } from '../types';
import { 
  HelpCircle, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Database, 
  Sparkles, 
  Activity, 
  Layers, 
  FileText, 
  Cpu, 
  Scale, 
  ExternalLink,
  BookOpen,
  Compass,
  Check
} from 'lucide-react';

interface ExplainThisModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: ExplainThisMetricContext | null;
}

export const ExplainThisModal: React.FC<ExplainThisModalProps> = ({
  isOpen,
  onClose,
  context,
}) => {
  if (!isOpen || !context) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 text-stone-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Explain This: Metric Provenance & Calculation Context
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    context.confidenceLevel === 'High'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {context.confidenceLevel} Confidence
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Transparent underlying agronomic evidence, spatial inputs, and empirical methodology
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metric Highlight Card */}
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
              Inspected Metric & Location
            </span>
            <h4 className="text-sm font-bold text-white">{context.metricName} &bull; {context.fieldOrRegionName}</h4>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-emerald-400 font-mono">
              {context.metricValue} <span className="text-xs font-normal text-stone-400">{context.unit}</span>
            </span>
          </div>
        </div>

        {/* "Why am I seeing this?" Summary Section (§4 PRD-09) */}
        <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Why Am I Seeing This Value?
          </h4>
          <p className="text-xs text-stone-300 leading-relaxed">
            This estimation is derived from multi-layer integration of physical soil taxonomy, multi-spectral satellite reflectance, historical management intervention records, and empirical biogeochemical modeling.
          </p>
        </div>

        {/* Core Drivers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-500 font-bold uppercase block">1. Soil Classification & Texture</span>
            <p className="font-semibold text-stone-200">{context.soilClassification}</p>
          </div>

          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-500 font-bold uppercase block">2. Agro-Climatic Regime</span>
            <p className="font-semibold text-stone-200">{context.climateZone}</p>
          </div>

          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-500 font-bold uppercase block">3. Multi-Year SOC Trajectory</span>
            <p className="text-stone-300">{context.historicalSOCTrend}</p>
          </div>

          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-500 font-bold uppercase block">4. In-Situ Physical Measurement</span>
            <p className="text-stone-300">{context.physicalMeasurementsSummary}</p>
          </div>
        </div>

        {/* Verification & Trust Drivers Checkmarks */}
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2.5">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
            Evidence Validation & Assurance Badges
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>In-Situ Hydraulic Cores Sampled</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sentinel-2 BOA Satellite Calibrated</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>CAN-Bus Machinery Logs Ingested</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Independent Third-Party ISO 14064-3 Review</span>
            </div>
          </div>
        </div>

        {/* Model Formula & Citations */}
        <div className="space-y-2 text-xs">
          <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 font-mono text-[11px] text-emerald-300">
            <span className="text-[10px] text-stone-500 block font-sans uppercase font-bold">Calculation Equation:</span>
            {context.empiricalModelFormula}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-stone-500 uppercase font-bold block">Scientific Citations & Standards:</span>
            <ul className="space-y-0.5 text-[11px] text-stone-400 list-disc pl-4">
              {context.sourceCitations.map((cite, idx) => (
                <li key={idx}>{cite}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
