import React, { useState, useMemo } from 'react';
import { Field } from '../types';
import { 
  Radar, 
  Layers, 
  ArrowLeftRight, 
  Leaf, 
  Droplets, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  Sprout, 
  BarChart2, 
  Compass,
  Tractor,
  ShieldCheck,
  Info
} from 'lucide-react';

interface FieldBenchmarkingRadarProps {
  fields: Field[];
  activeField?: Field | null;
  onOpenBarChartModal?: (fieldAId: string, fieldBId: string) => void;
}

interface RadarDimension {
  key: string;
  label: string;
  shortLabel: string;
  unit: string;
  min: number;
  max: number;
  getValue: (field: Field) => number;
  formatValue: (val: number) => string;
  description: string;
}

export const FieldBenchmarkingRadar: React.FC<FieldBenchmarkingRadarProps> = ({
  fields,
  activeField,
  onOpenBarChartModal,
}) => {
  // If fewer than 2 fields, fallback
  const initialFieldAId = activeField?.id || fields[0]?.id || '';
  const initialFieldBId = fields.find((f) => f.id !== initialFieldAId)?.id || fields[1]?.id || initialFieldAId;

  const [fieldAId, setFieldAId] = useState<string>(initialFieldAId);
  const [fieldBId, setFieldBId] = useState<string>(initialFieldBId);
  const [hoveredDimensionKey, setHoveredDimensionKey] = useState<string | null>(null);
  const [highlightedField, setHighlightedField] = useState<'both' | 'A' | 'B'>('both');

  const fieldA = useMemo(() => {
    return fields.find((f) => f.id === fieldAId) || fields[0];
  }, [fields, fieldAId]);

  const fieldB = useMemo(() => {
    return fields.find((f) => f.id === fieldBId) || (fields.length > 1 ? fields[1] : fields[0]);
  }, [fields, fieldBId]);

  // Swap fields handler
  const handleSwapFields = () => {
    const temp = fieldAId;
    setFieldAId(fieldBId);
    setFieldBId(temp);
  };

  // Radar Dimensions (6 agronomic metrics focusing on NDVI trends and SOC levels)
  const dimensions: RadarDimension[] = useMemo(() => [
    {
      key: 'current_ndvi',
      label: 'Current NDVI Canopy',
      shortLabel: 'NDVI Vigor',
      unit: 'index',
      min: 0.30,
      max: 0.90,
      getValue: (f) => f.currentNDVI,
      formatValue: (v) => v.toFixed(2),
      description: 'Active Sentinel-2 chlorophyll absorption and leaf area index.',
    },
    {
      key: 'peak_ndvi',
      label: 'Historical Peak NDVI',
      shortLabel: 'Peak Greenness',
      unit: 'index',
      min: 0.50,
      max: 0.95,
      getValue: (f) => {
        if (!f.ndviHistory || f.ndviHistory.length === 0) return f.currentNDVI;
        return Math.max(...f.ndviHistory.map((p) => p.ndvi), f.currentNDVI);
      },
      formatValue: (v) => v.toFixed(2),
      description: 'Maximum seasonal vegetative biomass fixation capacity.',
    },
    {
      key: 'baseline_soc',
      label: 'Topsoil SOC % (0-30cm)',
      shortLabel: 'SOC Level',
      unit: '% SOM',
      min: 1.5,
      max: 3.5,
      getValue: (f) => f.baselineSOCPct,
      formatValue: (v) => `${v.toFixed(2)}%`,
      description: 'Soil Organic Carbon percentage representing natural fertility reserve.',
    },
    {
      key: 'carbon_stock',
      label: 'Carbon Stock Density',
      shortLabel: 'Carbon Stock',
      unit: 't C/ha',
      min: 30,
      max: 75,
      getValue: (f) => f.baselineSOCStockTonsPerHa,
      formatValue: (v) => `${v.toFixed(1)} t/ha`,
      description: 'Total metric tons of carbon stored per hectare in the root profile.',
    },
    {
      key: 'root_moisture',
      label: 'Root Hydration Retention',
      shortLabel: 'Root Moisture',
      unit: '% VWC',
      min: 15,
      max: 45,
      getValue: (f) => f.rootZoneMoisturePct,
      formatValue: (v) => `${v.toFixed(0)}%`,
      description: 'Active root-zone (10-40cm) moisture capacity during peak growth.',
    },
    {
      key: 'carbon_intensity',
      label: 'Annual Sequestration Rate',
      shortLabel: 'Sequestration',
      unit: 'MT/ac/yr',
      min: 0.2,
      max: 1.6,
      getValue: (f) => f.carbonBreakdown.totalNetPerAcre,
      formatValue: (v) => `${v.toFixed(2)} MT/ac`,
      description: 'Annual carbon sequestration velocity under active regenerative practice matrix.',
    },
  ], []);

  // Compute Radar Geometry
  const size = 360;
  const center = size / 2;
  const radius = 120;
  const totalAxes = dimensions.length;

  // Normalized coordinate mapper for a dimension value (0 to 1)
  const getNormalizedRatio = (dim: RadarDimension, val: number) => {
    const clamped = Math.max(dim.min, Math.min(dim.max, val));
    return (clamped - dim.min) / (dim.max - dim.min);
  };

  const getCoordinates = (index: number, ratio: number) => {
    // Start at top (-90 degrees)
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = radius * ratio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate SVG Polygon path points for Field A and Field B
  const pointsA = dimensions.map((dim, i) => {
    const val = dim.getValue(fieldA);
    const ratio = getNormalizedRatio(dim, val);
    const { x, y } = getCoordinates(i, ratio);
    return `${x},${y}`;
  }).join(' ');

  const pointsB = dimensions.map((dim, i) => {
    const val = dim.getValue(fieldB);
    const ratio = getNormalizedRatio(dim, val);
    const { x, y } = getCoordinates(i, ratio);
    return `${x},${y}`;
  }).join(' ');

  // Compute composite Soil Health Index (0 to 100) for both fields
  const scoreField = (field: Field) => {
    const ratios = dimensions.map((dim) => getNormalizedRatio(dim, dim.getValue(field)));
    const avg = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
    return Math.round(avg * 100);
  };

  const scoreA = scoreField(fieldA);
  const scoreB = scoreField(fieldB);

  // Active inspected dimension on hover or default to topsoil SOC
  const activeDim = dimensions.find((d) => d.key === hoveredDimensionKey) || dimensions[2]; // Default to SOC

  const valA = activeDim.getValue(fieldA);
  const valB = activeDim.getValue(fieldB);
  const deltaAB = valA - valB;
  const deltaPct = valB !== 0 ? Math.round(((valA - valB) / valB) * 100) : 0;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Component Header & Field Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/80 shadow-md">
              <BarChart2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Comparative Biophysical Analysis
            </span>
            <span className="text-stone-600">&bull;</span>
            <span className="bg-stone-950 text-stone-300 text-xs px-2.5 py-0.5 rounded-full border border-stone-800 font-mono">
              Field-to-Field Radar Benchmark
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-100 flex items-center gap-2">
            Field Benchmarking &amp; Radar Comparison
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Compare NDVI vegetation canopy vigor, topsoil SOC stocks, and moisture retention profiles side-by-side across any two farm parcels.
          </p>
        </div>

        {/* Dual Field Selectors & Swap Control */}
        <div className="flex flex-wrap items-center gap-2 bg-stone-950 border border-stone-800 p-2 rounded-2xl shadow-md">
          {/* Field A Selector */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <select
              value={fieldAId}
              onChange={(e) => setFieldAId(e.target.value)}
              className="bg-stone-900 border border-emerald-800/80 text-emerald-300 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-emerald-500"
            >
              {fields.map((f) => (
                <option key={`a-${f.id}`} value={f.id}>
                  Field A: {f.name} ({f.acreage} ac)
                </option>
              ))}
            </select>
          </div>

          {/* Swap Fields Button */}
          <button
            onClick={handleSwapFields}
            className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition"
            title="Swap Field A and Field B"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Field B Selector */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <select
              value={fieldBId}
              onChange={(e) => setFieldBId(e.target.value)}
              className="bg-stone-900 border border-cyan-800/80 text-cyan-300 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-cyan-500"
            >
              {fields.map((f) => (
                <option key={`b-${f.id}`} value={f.id}>
                  Field B: {f.name} ({f.acreage} ac)
                </option>
              ))}
            </select>
          </div>

          {/* Comparative Bar Chart Modal Trigger */}
          {onOpenBarChartModal && (
            <button
              onClick={() => onOpenBarChartModal(fieldAId, fieldBId)}
              className="ml-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700/80 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              title="Open full-screen side-by-side comparative bar chart"
            >
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Compare Bar Chart</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Benchmarking Grid: Radar Canvas (Left) + Detailed Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart Display (5 Cols) */}
        <div className="lg:col-span-5 bg-stone-950/90 border border-stone-800 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          {/* Radar Legend Controls */}
          <div className="w-full flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHighlightedField(highlightedField === 'A' ? 'both' : 'A')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                  highlightedField === 'A' || highlightedField === 'both'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 shadow-sm'
                    : 'bg-stone-900 text-stone-500 border-stone-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="truncate max-w-[110px]">{fieldA.name}</span>
              </button>

              <button
                onClick={() => setHighlightedField(highlightedField === 'B' ? 'both' : 'B')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                  highlightedField === 'B' || highlightedField === 'both'
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 shadow-sm'
                    : 'bg-stone-900 text-stone-500 border-stone-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="truncate max-w-[110px]">{fieldB.name}</span>
              </button>
            </div>

            <span className="text-[10px] text-stone-500 font-mono">6 Axes</span>
          </div>

          {/* SVG Radar Spider Web */}
          <div className="relative w-full flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full max-w-[340px] h-auto select-none"
            >
              <defs>
                {/* Emerald Glow & Gradients */}
                <radialGradient id="radarCenterGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              {/* Center Glow */}
              <circle cx={center} cy={center} r={radius} fill="url(#radarCenterGrad)" />

              {/* Concentric Web Grid Polygons (20%, 40%, 60%, 80%, 100%) */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
                const polyPoints = dimensions.map((_, i) => {
                  const { x, y } = getCoordinates(i, level);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <polygon
                    key={level}
                    points={polyPoints}
                    fill="none"
                    stroke="#292524"
                    strokeWidth={level === 1.0 ? '1.5' : '1'}
                    strokeDasharray={level === 1.0 ? 'none' : '3 3'}
                  />
                );
              })}

              {/* Radial Axis Spoke Lines */}
              {dimensions.map((dim, i) => {
                const { x, y } = getCoordinates(i, 1.0);
                const isHovered = hoveredDimensionKey === dim.key;

                return (
                  <line
                    key={dim.key}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke={isHovered ? '#10b981' : '#383431'}
                    strokeWidth={isHovered ? '2' : '1'}
                  />
                );
              })}

              {/* Polygon Layer: Field B (Cyan) */}
              {(highlightedField === 'both' || highlightedField === 'B') && (
                <polygon
                  points={pointsB}
                  fill="#06b6d4"
                  fillOpacity="0.25"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Polygon Layer: Field A (Emerald) */}
              {(highlightedField === 'both' || highlightedField === 'A') && (
                <polygon
                  points={pointsA}
                  fill="#10b981"
                  fillOpacity="0.30"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Interactive Vertex Nodes for Field B */}
              {(highlightedField === 'both' || highlightedField === 'B') &&
                dimensions.map((dim, i) => {
                  const val = dim.getValue(fieldB);
                  const ratio = getNormalizedRatio(dim, val);
                  const { x, y } = getCoordinates(i, ratio);
                  const isHovered = hoveredDimensionKey === dim.key;

                  return (
                    <circle
                      key={`b-dot-${dim.key}`}
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 4}
                      fill="#083344"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredDimensionKey(dim.key)}
                      onMouseLeave={() => setHoveredDimensionKey(null)}
                    />
                  );
                })}

              {/* Interactive Vertex Nodes for Field A */}
              {(highlightedField === 'both' || highlightedField === 'A') &&
                dimensions.map((dim, i) => {
                  const val = dim.getValue(fieldA);
                  const ratio = getNormalizedRatio(dim, val);
                  const { x, y } = getCoordinates(i, ratio);
                  const isHovered = hoveredDimensionKey === dim.key;

                  return (
                    <circle
                      key={`a-dot-${dim.key}`}
                      cx={x}
                      cy={y}
                      r={isHovered ? 6.5 : 4.5}
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredDimensionKey(dim.key)}
                      onMouseLeave={() => setHoveredDimensionKey(null)}
                    />
                  );
                })}

              {/* Axis Labels Placed Around Perimeter */}
              {dimensions.map((dim, i) => {
                const { x, y, angle } = getCoordinates(i, 1.22);
                const isHovered = hoveredDimensionKey === dim.key;

                // Adjust text anchor based on angle
                let anchor: 'middle' | 'start' | 'end' = 'middle';
                if (Math.cos(angle) > 0.3) anchor = 'start';
                if (Math.cos(angle) < -0.3) anchor = 'end';

                return (
                  <text
                    key={`lbl-${dim.key}`}
                    x={x}
                    y={y + 3}
                    textAnchor={anchor}
                    fill={isHovered ? '#10b981' : '#a8a29e'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    className="cursor-pointer transition-colors"
                    onMouseEnter={() => setHoveredDimensionKey(dim.key)}
                    onMouseLeave={() => setHoveredDimensionKey(null)}
                  >
                    {dim.shortLabel}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Radar Footer Guide */}
          <div className="w-full text-center pt-2 border-t border-stone-800/80 text-[10px] text-stone-500">
            Hover over any axis node or metric card to inspect quantitative variance.
          </div>
        </div>

        {/* Detailed Side-by-Side Comparison Metrics (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Score Comparison Header */}
          <div className="grid grid-cols-2 gap-3">
            {/* Field A Score Card */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-emerald-900/60 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Field A: {fieldA.name}
                </span>
                <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                  {scoreA}/100 Index
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs text-stone-400">
                <span>{fieldA.acreage} ac &bull; {fieldA.cropType}</span>
                <span className="font-mono text-emerald-300 font-bold">{fieldA.baselineSOCPct}% SOC</span>
              </div>

              <div className="text-[10px] text-stone-400 truncate">
                Soil: <span className="text-stone-300">{fieldA.soilClassification.split('-')[0]}</span>
              </div>
            </div>

            {/* Field B Score Card */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-cyan-900/60 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Field B: {fieldB.name}
                </span>
                <span className="bg-cyan-950 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-800">
                  {scoreB}/100 Index
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs text-stone-400">
                <span>{fieldB.acreage} ac &bull; {fieldB.cropType}</span>
                <span className="font-mono text-cyan-300 font-bold">{fieldB.baselineSOCPct}% SOC</span>
              </div>

              <div className="text-[10px] text-stone-400 truncate">
                Soil: <span className="text-stone-300">{fieldB.soilClassification.split('-')[0]}</span>
              </div>
            </div>
          </div>

          {/* Inspected Metric Delta Spotlight Card */}
          <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-stone-800">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Spotlight Dimension: {activeDim.label}
              </span>
              <span className="font-mono text-[11px] text-stone-400">
                Unit: {activeDim.unit}
              </span>
            </div>

            <p className="text-[11px] text-stone-400">{activeDim.description}</p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-stone-900/80 p-2.5 rounded-xl border border-emerald-900/40 text-center">
                <span className="text-[10px] text-emerald-400 block font-semibold">Field A</span>
                <span className="text-base font-bold text-stone-100 font-mono">
                  {activeDim.formatValue(valA)}
                </span>
              </div>

              <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800 text-center flex flex-col justify-center">
                <span className="text-[9px] text-stone-500 block uppercase font-bold">Variance</span>
                <span className={`text-xs font-mono font-bold ${
                  deltaAB >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {deltaAB >= 0 ? '+' : ''}{activeDim.formatValue(deltaAB)} ({deltaAB >= 0 ? '+' : ''}{deltaPct}%)
                </span>
              </div>

              <div className="bg-stone-900/80 p-2.5 rounded-xl border border-cyan-900/40 text-center">
                <span className="text-[10px] text-cyan-400 block font-semibold">Field B</span>
                <span className="text-base font-bold text-stone-100 font-mono">
                  {activeDim.formatValue(valB)}
                </span>
              </div>
            </div>
          </div>

          {/* All 6 Radar Dimensions Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-800">
                <tr>
                  <th className="py-2.5 px-3">Benchmarked Metric</th>
                  <th className="py-2.5 px-3 text-right">Field A ({fieldA.name})</th>
                  <th className="py-2.5 px-3 text-right">Field B ({fieldB.name})</th>
                  <th className="py-2.5 px-3 text-right">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80 bg-stone-900/40 text-stone-300">
                {dimensions.map((dim) => {
                  const a = dim.getValue(fieldA);
                  const b = dim.getValue(fieldB);
                  const diff = a - b;
                  const isHovered = hoveredDimensionKey === dim.key;

                  return (
                    <tr
                      key={dim.key}
                      onMouseEnter={() => setHoveredDimensionKey(dim.key)}
                      onMouseLeave={() => setHoveredDimensionKey(null)}
                      className={`transition-colors cursor-pointer ${
                        isHovered ? 'bg-stone-800/70' : 'hover:bg-stone-850'
                      }`}
                    >
                      <td className="py-2 px-3 font-medium text-stone-200 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-emerald-400' : 'bg-stone-600'}`} />
                        <span>{dim.label}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                        {dim.formatValue(a)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-cyan-400">
                        {dim.formatValue(b)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          diff >= 0
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {diff >= 0 ? 'Field A +' : 'Field B +'}{dim.formatValue(Math.abs(diff))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Agronomic Practice Attribution Insight */}
          <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 text-xs flex items-start gap-2.5 text-stone-400">
            <Tractor className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Management Difference Attribution:</strong> Field A has <strong>{fieldA.practices.length} logged practices</strong> ({fieldA.practices.map((p) => p.title.split(' ')[0]).join(', ') || 'None'}) vs Field B&apos;s <strong>{fieldB.practices.length} practices</strong>. Cover crop root channels in Field A account for +{Math.max(0, (fieldA.baselineSOCPct - fieldB.baselineSOCPct)).toFixed(2)}% higher SOC retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
