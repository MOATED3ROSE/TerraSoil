import React from 'react';
import { Eye, Cpu, ShieldCheck, AlertCircle } from 'lucide-react';

export type DataStateType = 'observed' | 'modeled' | 'verified';

interface DataStateBadgeProps {
  state: DataStateType;
  uncertainty?: string;
  source?: string;
  date?: string;
  className?: string;
  showDetails?: boolean;
}

export const DataStateBadge: React.FC<DataStateBadgeProps> = ({
  state,
  uncertainty,
  source,
  date,
  className = '',
  showDetails = false,
}) => {
  const config = {
    observed: {
      label: 'Observed / Measured',
      shortLabel: 'Observed',
      icon: Eye,
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-400',
      border: 'border-emerald-800/80',
      dot: 'bg-emerald-400',
      tooltip: 'Direct empirical observation, sensor acquisition, or lab physical test.',
    },
    modeled: {
      label: 'Modeled / Estimated',
      shortLabel: 'Modeled',
      icon: Cpu,
      bg: 'bg-amber-950/80',
      text: 'text-amber-300',
      border: 'border-amber-800/80',
      dot: 'bg-amber-400',
      tooltip: 'Derived via agronomic formulas or process models; not independently verified.',
    },
    verified: {
      label: 'Independently Verified',
      shortLabel: 'Verified',
      icon: ShieldCheck,
      bg: 'bg-cyan-950/80',
      text: 'text-cyan-300',
      border: 'border-cyan-800/80',
      dot: 'bg-cyan-400',
      tooltip: 'Formally audited and certified by an accredited third-party verification body.',
    },
  }[state];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition ${config.bg} ${config.text} ${config.border} ${className}`}
      title={`${config.label}: ${config.tooltip}${uncertainty ? ` (Uncertainty: ${uncertainty})` : ''}${source ? ` [Source: ${source}]` : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3 shrink-0" />
      <span>{showDetails ? config.label : config.shortLabel}</span>
      {uncertainty && (
        <span className="opacity-75 font-normal">({uncertainty})</span>
      )}
    </span>
  );
};
