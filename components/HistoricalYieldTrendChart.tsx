import React, { useState } from 'react';
import { Field, MultiYearYieldNdviPoint } from '../types';
import { calculateMultiYearYieldHistory } from '../utils/yieldCalculations';
import { 
  TrendingUp, 
  BarChart2, 
  Layers, 
  Calendar, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles, 
  Droplets, 
  Info,
  Maximize2,
  CheckCircle2,
  ArrowUpRight,
  Sun,
  CloudRain
} from 'lucide-react';

interface HistoricalYieldTrendChartProps {
  field: Field;
}

export const HistoricalYieldTrendChart: React.FC<HistoricalYieldTrendChartProps> = ({ field }) => {
  const [activeMetricMode, setActiveMetricMode] = useState<'yield' | 'comparison' | 'ndvi'>('yield');
  const [showNdviOverlay, setShowNdviOverlay] = useState<boolean>(true);
  const [showBenchmarkLine, setShowBenchmarkLine] = useState<boolean>(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Compute multi-year NDVI and historical yield series
  const historyData: MultiYearYieldNdviPoint[] = calculateMultiYearYieldHistory(field);

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 280;
  const padding = { top: 30, right: 60, bottom: 45, left: 60 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Compute Scales
  const yields = historyData.map((d) => d.estimatedYield);
  const benchmarks = historyData.map((d) => d.regionalBenchmarkYield);
  const minYield = Math.floor(Math.min(...yields, ...benchmarks) * 0.92);
  const maxYield = Math.ceil(Math.max(...yields, ...benchmarks) * 1.08);

  const minNdvi = 0.5;
  const maxNdvi = 0.95;

  // Scale helpers
  const getX = (index: number) => {
    if (historyData.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (historyData.length - 1)) * innerWidth;
  };

  const getYYield = (yieldVal: number) => {
    return padding.top + innerHeight - ((yieldVal - minYield) / (maxYield - minYield)) * innerHeight;
  };

  const getYNdvi = (ndviVal: number) => {
    return padding.top + innerHeight - ((ndviVal - minNdvi) / (maxNdvi - minNdvi)) * innerHeight;
  };

  // Generate SVG Path strings
  const yieldPoints = historyData.map((d, i) => `${getX(i)},${getYYield(d.estimatedYield)}`);
  const yieldPathD = yieldPoints.length > 0 ? `M ${yieldPoints.join(' L ')}` : '';

  const benchmarkPoints = historyData.map((d, i) => `${getX(i)},${getYYield(d.regionalBenchmarkYield)}`);
  const benchmarkPathD = benchmarkPoints.length > 0 ? `M ${benchmarkPoints.join(' L ')}` : '';

  const ndviPoints = historyData.map((d, i) => `${getX(i)},${getYNdvi(d.peakNDVI)}`);
  const ndviPathD = ndviPoints.length > 0 ? `M ${ndviPoints.join(' L ')}` : '';

  // Gradient area under yield curve
  const areaD = yieldPoints.length > 0
    ? `M ${getX(0)},${padding.top + innerHeight} L ${yieldPoints.join(' L ')} L ${getX(historyData.length - 1)},${padding.top + innerHeight} Z`
    : '';

  // Performance calculations
  const firstYear = historyData[0];
  const latestYear = historyData[historyData.length - 1];
  const compoundYieldGainPct = Number(
    (((latestYear.estimatedYield - firstYear.estimatedYield) / firstYear.estimatedYield) * 100).toFixed(1)
  );
  const latestAdvantageVsCounty = Number((latestYear.estimatedYield - latestYear.regionalBenchmarkYield).toFixed(1));
  const avgNdvi = Number((historyData.reduce((acc, d) => acc + d.peakNDVI, 0) / historyData.length).toFixed(2));

  const activePoint = hoveredPointIndex !== null ? historyData[hoveredPointIndex] : latestYear;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header with Title and Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/80">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Multi-Year Remote Sensing Intelligence
            </span>
            <span className="text-stone-600">&bull;</span>
            <span className="bg-stone-950 text-stone-300 text-xs px-2.5 py-0.5 rounded-full border border-stone-800 font-mono">
              2021 &ndash; 2026 Historical NDVI Inversion
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-100 flex items-center gap-2">
            Historical Yield Trends &amp; Multi-Year NDVI Correlation
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Empirically calibrated harvest yield history for <strong className="text-stone-200">{field.name}</strong> ({field.cropType}), modeled from Sentinel-2 canopy greenness and soil organic carbon accretion.
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* NDVI Correlation Toggle */}
          <button
            onClick={() => setShowNdviOverlay(!showNdviOverlay)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              showNdviOverlay
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
            title="Toggle peak NDVI satellite correlation line on secondary axis"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>NDVI Trendline</span>
          </button>

          {/* Regional Benchmark Toggle */}
          <button
            onClick={() => setShowBenchmarkLine(!showBenchmarkLine)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              showBenchmarkLine
                ? 'bg-stone-800 text-stone-200 border-stone-600 shadow-sm'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
            title="Toggle county/regional conventional baseline average"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400 border border-stone-300 border-dashed" />
            <span>Regional Baseline</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
            5-Year Yield Trajectory
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              +{compoundYieldGainPct}%
            </span>
            <span className="text-[10px] text-emerald-500 font-medium">Growth</span>
          </div>
          <span className="text-[10px] text-stone-500 block mt-0.5">
            {firstYear.estimatedYield} &rarr; {latestYear.estimatedYield} {firstYear.unit}
          </span>
        </div>

        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
            Regional Yield Premium
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
              +{latestAdvantageVsCounty}
            </span>
            <span className="text-xs text-stone-400 font-medium">{firstYear.unit}</span>
          </div>
          <span className="text-[10px] text-stone-500 block mt-0.5">
            +{latestYear.yieldAnomalyPct}% above county conventional
          </span>
        </div>

        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
            Peak Canopy Greenness
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
              {latestYear.peakNDVI}
            </span>
            <span className="text-xs text-stone-400 font-medium">NDVI</span>
          </div>
          <span className="text-[10px] text-stone-500 block mt-0.5">
            Avg {avgNdvi} multi-year index
          </span>
        </div>

        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
            Climate Resilience Buffer
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              +{latestYear.socBufferFactor.toFixed(2)}x
            </span>
            <span className="text-xs text-stone-400 font-medium">Drought Cushion</span>
          </div>
          <span className="text-[10px] text-stone-500 block mt-0.5">
            Sustained by {field.baselineSOCPct}% SOC
          </span>
        </div>
      </div>

      {/* SVG Interactive Line Chart Container */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        {/* Legend Indicator Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="font-semibold text-stone-200">
                Field Estimated Yield ({firstYear.unit})
              </span>
            </div>

            {showBenchmarkLine && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-stone-400 border-t border-dashed border-stone-200" />
                <span className="text-stone-400">County Conventional Benchmark</span>
              </div>
            )}

            {showNdviOverlay && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                <span className="text-cyan-300">Peak Sentinel-2 NDVI (Right Axis)</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-stone-500 hidden sm:inline">
            Hover over points to inspect seasonal practices &amp; weather anomalies
          </span>
        </div>

        {/* Responsive SVG Canvas */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[550px] select-none"
          >
            <defs>
              {/* Emerald Area Gradient */}
              <linearGradient id="yieldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                <stop offset="85%" stopColor="#10b981" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              {/* Cyan Glow Filter */}
              <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.4" />
              </filter>
              <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Left Y-Axis Values (Yield) */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padding.top + innerHeight * (1 - ratio);
              const val = Math.round(minYield + ratio * (maxYield - minYield));
              const ndviVal = (minNdvi + ratio * (maxNdvi - minNdvi)).toFixed(2);

              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke="#292524"
                    strokeDasharray={idx === 0 ? 'none' : '3 3'}
                    strokeWidth={idx === 0 ? 1.5 : 1}
                  />
                  {/* Left Axis Label (Yield) */}
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    fill="#78716c"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {val}
                  </text>

                  {/* Right Axis Label (NDVI) */}
                  {showNdviOverlay && (
                    <text
                      x={padding.left + innerWidth + 10}
                      y={y + 4}
                      fill="#06b6d4"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="start"
                      opacity="0.8"
                    >
                      {ndviVal}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Area Fill under Yield Curve */}
            {areaD && <path d={areaD} fill="url(#yieldAreaGrad)" />}

            {/* Benchmark Conventional Line */}
            {showBenchmarkLine && benchmarkPathD && (
              <path
                d={benchmarkPathD}
                fill="none"
                stroke="#78716c"
                strokeWidth="2"
                strokeDasharray="5 4"
                strokeLinecap="round"
                opacity="0.85"
              />
            )}

            {/* NDVI Trendline */}
            {showNdviOverlay && ndviPathD && (
              <path
                d={ndviPathD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#cyanGlow)"
              />
            )}

            {/* Main Yield Line */}
            {yieldPathD && (
              <path
                d={yieldPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#emeraldGlow)"
              />
            )}

            {/* Data Points & Vertical Hover Highlights */}
            {historyData.map((d, idx) => {
              const x = getX(idx);
              const yYield = getYYield(d.estimatedYield);
              const yBench = getYYield(d.regionalBenchmarkYield);
              const yNdvi = getYNdvi(d.peakNDVI);
              const isHovered = hoveredPointIndex === idx;

              return (
                <g key={d.year}>
                  {/* Vertical hover line */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + innerHeight}
                      stroke="#44403c"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Benchmark Node */}
                  {showBenchmarkLine && (
                    <circle
                      cx={x}
                      cy={yBench}
                      r={isHovered ? 4.5 : 3}
                      fill="#1c1917"
                      stroke="#a8a29e"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* NDVI Node */}
                  {showNdviOverlay && (
                    <circle
                      cx={x}
                      cy={yNdvi}
                      r={isHovered ? 5 : 3.5}
                      fill="#083344"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />
                  )}

                  {/* Main Yield Node */}
                  <circle
                    cx={x}
                    cy={yYield}
                    r={isHovered ? 7 : 5}
                    fill={isHovered ? '#34d399' : '#10b981'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all hover:scale-125"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  />

                  {/* Anomaly / Drought Badge for 2023 */}
                  {d.year === 2023 && (
                    <g transform={`translate(${x}, ${yYield - 24})`}>
                      <rect
                        x="-48"
                        y="-14"
                        width="96"
                        height="18"
                        rx="9"
                        fill="#451a03"
                        stroke="#b45309"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-2"
                        textAnchor="middle"
                        fill="#fde68a"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        ⚡ Drought Shock
                      </text>
                    </g>
                  )}

                  {/* X-Axis Year Labels */}
                  <text
                    x={x}
                    y={padding.top + innerHeight + 22}
                    textAnchor="middle"
                    fill={isHovered ? '#10b981' : '#a8a29e'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                  >
                    {d.yearLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Season Detail Card */}
      {activePoint && (
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-400 font-mono font-bold text-xs border border-emerald-800">
                Season {activePoint.yearLabel}
              </span>
              <h4 className="text-sm font-bold text-stone-100">
                {activePoint.regenerativePhase}
              </h4>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-stone-400">
                Precipitation: <strong className="text-stone-200">{activePoint.rainfallMm} mm</strong>
              </span>
              <span className="text-stone-600">&bull;</span>
              <span className="text-stone-400">
                Root Moisture Adequacy: <strong className="text-cyan-400">{activePoint.soilMoistureAdequacyPct}%</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-stone-900/70 p-3.5 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                Estimated Crop Harvest
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400 font-mono">
                  {activePoint.estimatedYield}
                </span>
                <span className="text-xs text-stone-300">{activePoint.unit}</span>
              </div>
              <span className="text-[11px] text-stone-400 block">
                vs Regional Benchmark: <strong className="text-stone-300">{activePoint.regionalBenchmarkYield} {activePoint.unit}</strong>
              </span>
            </div>

            <div className="bg-stone-900/70 p-3.5 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                Satellite Greenness (NDVI)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-cyan-400 font-mono">
                  {activePoint.peakNDVI}
                </span>
                <span className="text-xs text-cyan-500">Peak Canopy</span>
              </div>
              <span className="text-[11px] text-stone-400 block">
                Integrated Season NDVI: <strong className="text-stone-300">{activePoint.integratedNDVI}</strong>
              </span>
            </div>

            <div className="bg-stone-900/70 p-3.5 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                Agronomic Management Notes
              </span>
              <p className="text-xs text-stone-300 leading-relaxed">
                {activePoint.managementNotes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Year Breakdown Table */}
      <div className="overflow-x-auto rounded-2xl border border-stone-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-800 font-semibold">
            <tr>
              <th className="py-3 px-4">Season</th>
              <th className="py-3 px-4">Phase / Practice Milestone</th>
              <th className="py-3 px-4 text-right">Peak NDVI</th>
              <th className="py-3 px-4 text-right">Estimated Yield</th>
              <th className="py-3 px-4 text-right">County Benchmark</th>
              <th className="py-3 px-4 text-right">Yield Delta</th>
              <th className="py-3 px-4 text-right">SOC Buffer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/80 bg-stone-900/40">
            {historyData.map((row, idx) => (
              <tr
                key={row.year}
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onMouseLeave={() => setHoveredPointIndex(null)}
                className={`transition-colors cursor-pointer ${
                  hoveredPointIndex === idx ? 'bg-stone-800/60' : 'hover:bg-stone-850'
                }`}
              >
                <td className="py-2.5 px-4 font-mono font-bold text-stone-200">
                  {row.yearLabel}
                </td>
                <td className="py-2.5 px-4 text-stone-300 font-medium">
                  {row.regenerativePhase}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-cyan-400">
                  {row.peakNDVI}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                  {row.estimatedYield} {row.unit}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-stone-400">
                  {row.regionalBenchmarkYield} {row.unit}
                </td>
                <td className="py-2.5 px-4 text-right font-mono">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    row.yieldAnomalyPct >= 0
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {row.yieldAnomalyPct >= 0 ? '+' : ''}{row.yieldAnomalyPct}%
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-amber-300 font-medium">
                  {row.socBufferFactor.toFixed(2)}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
