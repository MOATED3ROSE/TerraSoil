import React from 'react';
import { MoistureAlert, Field } from '../types';
import { AlertTriangle, Droplets, ArrowRight, X, ShieldAlert, FileSpreadsheet } from 'lucide-react';

interface MoistureAlertBannerProps {
  alert: MoistureAlert;
  onOpenAlertModal: () => void;
  onDismiss: () => void;
  onExportCSV?: () => void;
}

export const MoistureAlertBanner: React.FC<MoistureAlertBannerProps> = ({
  alert,
  onOpenAlertModal,
  onDismiss,
  onExportCSV,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-xl transition-all mb-6 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300 ${
        alert.severity === 'critical'
          ? 'bg-gradient-to-r from-rose-950/90 via-stone-950 to-stone-900 border-rose-600/80 text-rose-100'
          : 'bg-gradient-to-r from-amber-950/90 via-stone-950 to-stone-900 border-amber-600/80 text-amber-100'
      }`}
    >
      <div className="flex items-start gap-3 max-w-3xl">
        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
          alert.severity === 'critical' ? 'bg-rose-900 text-rose-300' : 'bg-amber-900 text-amber-300'
        }`}>
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
              alert.severity === 'critical'
                ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                : 'bg-amber-900/80 text-amber-200 border border-amber-700'
            }`}>
              {alert.severity === 'critical' ? 'Critical Moisture Alert' : 'Moisture Deficit Warning'}
            </span>
            <span className="text-xs font-bold text-stone-200">{alert.fieldName}</span>
            <span className="text-stone-400 text-xs">&bull; Crop: {alert.cropType}</span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            Root-zone soil moisture has dropped to{' '}
            <strong className="text-rose-400 font-mono font-bold text-sm">
              {alert.currentRootZoneMoisturePct}% VWC
            </strong>
            , falling below the critical threshold of{' '}
            <strong className="text-stone-200 font-mono font-bold">
              {alert.criticalThresholdPct}% VWC
            </strong>{' '}
            ({alert.deficitPct}% deficit). Crop is approaching dehydration stress.
          </p>

          <p className="text-[11px] text-stone-400 italic">
            Recommended Action: {alert.mitigationSteps[0]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className="bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Export telemetry and practice history as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        )}

        <button
          onClick={onOpenAlertModal}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-md ${
            alert.severity === 'critical'
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          <span>View Alert Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onDismiss}
          className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800/80 transition"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
