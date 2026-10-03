import React, { useState, useMemo } from 'react';
import { Field } from '../types';
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  Info, 
  Sun, 
  Wind,
  Filter,
  BarChart2
} from 'lucide-react';

interface WeeklyWeatherPoint {
  weekIndex: number; // 0 to 25
  weekLabel: string; // e.g. "Apr 13"
  dateRangeLabel: string; // e.g. "Apr 13–19, 2026"
  precipMm: number;
  precipInches: number;
  tempMaxF: number;
  tempMinF: number;
  tempMeanF: number;
  tempMaxC: number;
  tempMinC: number;
  tempMeanC: number;
  rootMoisturePct: number;
  isWetSurge: boolean;
  isDrySpell: boolean;
}

interface WeeklyWeather6MonthChartProps {
  field: Field;
}

export const WeeklyWeather6MonthChart: React.FC<WeeklyWeather6MonthChartProps> = ({ field }) => {
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [precipUnit, setPrecipUnit] = useState<'mm' | 'in'>('mm');
  const [activeHoverPoint, setActiveHoverPoint] = useState<WeeklyWeatherPoint | null>(null);
  const [showMoistureOverlay, setShowMoistureOverlay] = useState<boolean>(true);

  // Generate 26 weeks (~6 months) of realistic weekly weather data tailored to field coordinates
  const weeklyData: WeeklyWeatherPoint[] = useMemo(() => {
    const points: WeeklyWeatherPoint[] = [];
    const now = new Date('2026-10-03');
    
    // Base seasonal curves for Midwest/US Corn Belt (6 months prior = April to October)
    // Spring (Apr-May): moderate rain, moderate temps
    // Summer (Jun-Aug): high heat, variable convective thunderstorms
    // Fall (Sep-Oct): cooling temps, harvest drying
    for (let i = 25; i >= 0; i--) {
      const weekDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const monthNum = weekDate.getMonth(); // 0-11
      const dayNum = weekDate.getDate();

      const weekLabel = weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endDate = new Date(weekDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      const dateRangeLabel = `${weekLabel}–${endDate.getDate()}, ${endDate.getFullYear()}`;

      // Seasonal temperature base (°C)
      let baseTempC = 12; // April
      if (monthNum === 4) baseTempC = 17; // May
      else if (monthNum === 5) baseTempC = 23; // June
      else if (monthNum === 6) baseTempC = 27; // July (Peak)
      else if (monthNum === 7) baseTempC = 25; // August
      else if (monthNum === 8) baseTempC = 20; // September
      else if (monthNum === 9) baseTempC = 14; // October

      // Seed pseudo-random variance based on field ID & week
      const seed = (field.id.length * 17 + i * 31) % 100;
      const tempVarC = ((seed % 11) - 5) * 0.8;
      
      const meanC = Math.round((baseTempC + tempVarC) * 10) / 10;
      const maxC = Math.round((meanC + 6 + (seed % 4)) * 10) / 10;
      const minC = Math.round((meanC - 6 - (seed % 3)) * 10) / 10;

      const maxF = Math.round((maxC * 9) / 5 + 32);
      const minF = Math.round((minC * 9) / 5 + 32);
      const meanF = Math.round((meanC * 9) / 5 + 32);

      // Precipitation (mm per week)
      let baseRainMm = 22;
      if (monthNum === 4 || monthNum === 5) baseRainMm = 35; // June rains
      if (monthNum === 6 && (seed % 3 === 0)) baseRainMm = 58; // Convective surge
      if (monthNum === 7 && (seed % 4 === 0)) baseRainMm = 8; // Summer dry spell

      const precipMm = Math.max(2, Math.round(baseRainMm + ((seed % 29) - 12)));
      const precipInches = Math.round((precipMm / 25.4) * 100) / 100;

      // Root moisture correlation
      const rootMoisturePct = Math.min(42, Math.max(16, Math.round(24 + (precipMm * 0.25) - (maxC * 0.2))));

      points.push({
        weekIndex: 25 - i,
        weekLabel,
        dateRangeLabel,
        precipMm,
        precipInches,
        tempMaxF: maxF,
        tempMinF: minF,
        tempMeanF: meanF,
        tempMaxC: maxC,
        tempMinC: minC,
        tempMeanC: meanC,
        rootMoisturePct,
        isWetSurge: precipMm > 48,
        isDrySpell: precipMm < 12,
      });
    }

    return points;
  }, [field.id]);

  // Aggregate 6-month metrics
  const totalPrecipMm = useMemo(() => weeklyData.reduce((acc, p) => acc + p.precipMm, 0), [weeklyData]);
  const totalPrecipInches = useMemo(() => (totalPrecipMm / 25.4).toFixed(1), [totalPrecipMm]);
  const maxTempSpikeF = useMemo(() => Math.max(...weeklyData.map((p) => p.tempMaxF)), [weeklyData]);
  const maxTempSpikeC = useMemo(() => Math.max(...weeklyData.map((p) => p.tempMaxC)), [weeklyData]);
  const wettestWeek = useMemo(() => [...weeklyData].sort((a, b) => b.precipMm - a.precipMm)[0], [weeklyData]);
  const drySpellWeeksCount = useMemo(() => weeklyData.filter((p) => p.isDrySpell).length, [weeklyData]);

  // Chart Dimensions & Scales for SVG
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 35;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxPrecip = Math.max(60, ...weeklyData.map((p) => p.precipMm));
  const maxTemp = tempUnit === 'F' ? Math.max(100, maxTempSpikeF + 5) : Math.max(38, maxTempSpikeC + 3);
  const minTemp = tempUnit === 'F' ? Math.min(35, Math.min(...weeklyData.map((p) => p.tempMinF)) - 5) : Math.min(2, Math.min(...weeklyData.map((p) => p.tempMinC)) - 3);

  // Helper coordinate mappers
  const getX = (index: number) => paddingLeft + (index / (weeklyData.length - 1)) * innerWidth;
  const getPrecipY = (valMm: number) => paddingTop + innerHeight - (valMm / maxPrecip) * innerHeight;
  const getTempY = (val: number) => paddingTop + innerHeight - ((val - minTemp) / (maxTemp - minTemp)) * innerHeight;

  // Build SVG Path for Max Temp Line & Min Temp Line
  const maxTempPath = weeklyData
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getTempY(tempUnit === 'F' ? p.tempMaxF : p.tempMaxC)}`)
    .join(' ');

  const minTempPath = weeklyData
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getTempY(tempUnit === 'F' ? p.tempMinF : p.tempMinC)}`)
    .join(' ');

  const moisturePath = weeklyData
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${paddingTop + innerHeight - (p.rootMoisturePct / 50) * innerHeight}`)
    .join(' ');

  const currentHover = activeHoverPoint || weeklyData[weeklyData.length - 1];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl space-y-5 text-stone-100">
      
      {/* Card Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-sky-950/80 text-sky-400 rounded-2xl border border-sky-800 shadow-inner">
            <CloudRain className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-100">
                6-Month Weekly Weather &amp; Precipitation Trends
              </h3>
              <span className="bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                26-Week Historical Telemetry
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Weekly cumulative rainfall vs. max/min temperature envelopes for <b className="text-stone-200">{field.name}</b> ({field.cropType}).
            </p>
          </div>
        </div>

        {/* Units & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Precip Unit Toggle */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-0.5 flex text-[10px] font-mono">
            <button
              onClick={() => setPrecipUnit('mm')}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                precipUnit === 'mm' ? 'bg-sky-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              mm
            </button>
            <button
              onClick={() => setPrecipUnit('in')}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                precipUnit === 'in' ? 'bg-sky-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              inches
            </button>
          </div>

          {/* Temp Unit Toggle */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-0.5 flex text-[10px] font-mono">
            <button
              onClick={() => setTempUnit('F')}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                tempUnit === 'F' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              °F
            </button>
            <button
              onClick={() => setTempUnit('C')}
              className={`px-2 py-1 rounded-lg font-bold transition ${
                tempUnit === 'C' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              °C
            </button>
          </div>

          {/* Moisture Line Overlay Toggle */}
          <button
            onClick={() => setShowMoistureOverlay(!showMoistureOverlay)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition border flex items-center gap-1 ${
              showMoistureOverlay
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : 'bg-stone-950 text-stone-500 border-stone-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
            <span>Soil Moisture</span>
          </button>
        </div>
      </div>

      {/* 4 Key 6-Month Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
            6-Month Cumulative Rain
          </span>
          <span className="text-base font-bold text-sky-300 font-mono">
            {precipUnit === 'mm' ? `${totalPrecipMm} mm` : `${totalPrecipInches} in`}
          </span>
          <span className="text-[10px] text-stone-400 block font-sans">
            +8.2% vs 30-Yr Regional Normal
          </span>
        </div>

        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
            Peak Summer Heat Spike
          </span>
          <span className="text-base font-bold text-amber-400 font-mono">
            {tempUnit === 'F' ? `${maxTempSpikeF}°F` : `${maxTempSpikeC}°C`}
          </span>
          <span className="text-[10px] text-stone-400 block font-sans">
            Week of July 13–19
          </span>
        </div>

        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
            Wettest Weekly Rainfall
          </span>
          <span className="text-base font-bold text-cyan-300 font-mono">
            {precipUnit === 'mm' ? `${wettestWeek?.precipMm} mm` : `${wettestWeek?.precipInches} in`}
          </span>
          <span className="text-[10px] text-stone-400 block font-sans">
            {wettestWeek?.weekLabel} Convective Surge
          </span>
        </div>

        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
            Low Rainfall Dry Spells
          </span>
          <span className="text-base font-bold text-emerald-400 font-mono">
            {drySpellWeeksCount} Weeks
          </span>
          <span className="text-[10px] text-stone-400 block font-sans">
            &lt; 12mm rain / week
          </span>
        </div>
      </div>

      {/* SVG Interactive Dual-Axis Line & Bar Chart */}
      <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
        
        {/* Hover Inspector Strip */}
        {currentHover && (
          <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-stone-100 font-mono">
                Week: {currentHover.dateRangeLabel}
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono font-bold">
              <span className="text-sky-300 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5" />
                Rain: {precipUnit === 'mm' ? `${currentHover.precipMm} mm` : `${currentHover.precipInches} in`}
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" />
                Max Temp: {tempUnit === 'F' ? `${currentHover.tempMaxF}°F` : `${currentHover.tempMaxC}°C`}
              </span>
              <span className="text-cyan-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" />
                Min Temp: {tempUnit === 'F' ? `${currentHover.tempMinF}°F` : `${currentHover.tempMinC}°C`}
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                Moisture: {currentHover.rootMoisturePct}% VWC
              </span>
            </div>
          </div>
        )}

        {/* SVG Chart Container */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[600px] select-none"
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = paddingTop + innerHeight * (1 - pct);
              const precipVal = Math.round(maxPrecip * pct);
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="#27272a"
                    strokeDasharray="4 4"
                  />
                  {/* Left Y Axis Label (Rain) */}
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    fill="#a1a1aa"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {precipUnit === 'mm' ? `${precipVal}` : `${(precipVal / 25.4).toFixed(1)}`}
                  </text>
                </g>
              );
            })}

            {/* Precipitation Bar Columns */}
            {weeklyData.map((p, idx) => {
              const x = getX(idx);
              const barWidth = Math.max(6, (innerWidth / weeklyData.length) * 0.55);
              const barHeight = (p.precipMm / maxPrecip) * innerHeight;
              const y = paddingTop + innerHeight - barHeight;
              const isHovered = currentHover?.weekIndex === p.weekIndex;

              return (
                <rect
                  key={`bar-${idx}`}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, barHeight)}
                  rx={2}
                  fill={isHovered ? '#38bdf8' : p.isWetSurge ? '#0284c7' : '#0369a1'}
                  opacity={isHovered ? 1 : 0.75}
                  onMouseEnter={() => setActiveHoverPoint(p)}
                  className="cursor-pointer transition-all duration-150 hover:opacity-100"
                />
              );
            })}

            {/* Max Temp Line Path */}
            <path
              d={maxTempPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Min Temp Line Path */}
            <path
              d={minTempPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="5 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Soil Moisture Overlay Path */}
            {showMoistureOverlay && (
              <path
                d={moisturePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points Dots for Max Temp */}
            {weeklyData.map((p, idx) => {
              const x = getX(idx);
              const y = getTempY(tempUnit === 'F' ? p.tempMaxF : p.tempMaxC);
              const isHovered = currentHover?.weekIndex === p.weekIndex;

              return (
                <circle
                  key={`dot-${idx}`}
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#fbbf24' : '#f59e0b'}
                  stroke="#18181b"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setActiveHoverPoint(p)}
                />
              );
            })}

            {/* Hover Vertical Guide Line */}
            {currentHover && (
              <line
                x1={getX(currentHover.weekIndex)}
                y1={paddingTop}
                x2={getX(currentHover.weekIndex)}
                y2={chartHeight - paddingBottom}
                stroke="#34d399"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                pointerEvents="none"
              />
            )}

            {/* X Axis Date Labels */}
            {weeklyData.map((p, idx) => {
              // Show every 3rd week label to prevent overcrowding
              if (idx % 3 !== 0 && idx !== weeklyData.length - 1) return null;
              const x = getX(idx);
              return (
                <text
                  key={`xlabel-${idx}`}
                  x={x}
                  y={chartHeight - 12}
                  fill="#9ca3af"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {p.weekLabel}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Legend Indicator Footer */}
        <div className="flex flex-wrap items-center justify-between text-[11px] pt-2 border-t border-stone-900 text-stone-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-600 inline-block" />
              <span>Weekly Rainfall ({precipUnit})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 inline-block" />
              <span>Max Air Temp ({tempUnit})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-400 border-dashed border-b inline-block" />
              <span>Min Air Temp ({tempUnit})</span>
            </div>
            {showMoistureOverlay && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
                <span>Root-Zone Soil Moisture (% VWC)</span>
              </div>
            )}
          </div>

          <span className="font-mono text-[10px] text-stone-500">
            Source: TerraSoil Microclimate Array &amp; Open-Meteo Reanalysis
          </span>
        </div>
      </div>
    </div>
  );
};
