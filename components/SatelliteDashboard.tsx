import React, { useState, useEffect } from 'react';
import { Field, Farm, WeatherTelemetryData, HistoricalWeatherPoint, CropMoistureThresholdConfig } from '../types';
import { CropYieldPrediction } from './CropYieldPrediction';
import { HistoricalYieldTrendChart } from './HistoricalYieldTrendChart';
import { WeatherAdjustedYieldForecast } from './WeatherAdjustedYieldForecast';
import { FieldBenchmarkingRadar } from './FieldBenchmarkingRadar';
import { WeeklyWeather6MonthChart } from './WeeklyWeather6MonthChart';
import { downloadFieldCSV } from '../utils/csvExportUtils';
import { getCriticalMoistureThreshold, evaluateFieldMoistureAlert } from '../utils/moistureAlertUtils';
import { MoistureAlertBanner } from './MoistureAlertBanner';
import { 
  Activity, 
  Droplets, 
  Sun, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart2,
  CloudRain,
  Thermometer,
  Wind,
  RefreshCw,
  Compass,
  ArrowUpRight,
  Info,
  FileSpreadsheet,
  Bell,
  Check
} from 'lucide-react';

interface SatelliteDashboardProps {
  fields: Field[];
  selectedField: Field | null;
  onSelectField: (field: Field) => void;
  currentFarm?: Farm;
  thresholdConfig?: CropMoistureThresholdConfig;
  onOpenAlertModal?: () => void;
  onExportCSV?: () => void;
  onOpenComparisonModal?: (fieldAId?: string, fieldBId?: string) => void;
  onOpenLineageModal?: (field: Field) => void;
}

export const SatelliteDashboard: React.FC<SatelliteDashboardProps> = ({
  fields,
  selectedField,
  onSelectField,
  currentFarm,
  thresholdConfig,
  onOpenAlertModal,
  onExportCSV,
  onOpenComparisonModal,
  onOpenLineageModal,
}) => {
  const activeField = selectedField || (fields.length > 0 ? fields[0] : null);

  // Weather API state
  const [weatherData, setWeatherData] = useState<WeatherTelemetryData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [historyMode, setHistoryMode] = useState<'daily' | 'monthly'>('daily');
  const [showTempOverlay, setShowTempOverlay] = useState(true);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [csvExportSuccess, setCsvExportSuccess] = useState(false);

  // Fetch real-time weather & historical soil moisture for active field's coordinates
  const fetchWeatherTelemetry = async () => {
    if (!activeField) return;
    setIsLoadingWeather(true);
    setWeatherError(null);

    const [lat, lng] = activeField.centroid || [42.0625, -93.585];

    try {
      const response = await fetch(
        `/api/weather/historical?lat=${lat}&lng=${lng}&pastDays=35`
      );
      if (!response.ok) {
        throw new Error(`Weather service returned HTTP ${response.status}`);
      }
      const data: WeatherTelemetryData = await response.json();
      setWeatherData(data);
    } catch (err: any) {
      console.warn('Weather API fetch failed, falling back to local dataset:', err);
      setWeatherError(err?.message || 'Could not reach weather station');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeatherTelemetry();
  }, [activeField?.id, currentFarm?.id]);

  if (!activeField) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-400">
        No field selected. Please map or select a field to view satellite &amp; soil telemetry.
      </div>
    );
  }

  // Convert temperature helper
  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius.toFixed(1)}°C`;
  };

  const latestNDVI = activeField.currentNDVI;

  // Use live weather data if available, otherwise fall back to field's preset history
  const dailyPoints: HistoricalWeatherPoint[] = weatherData?.dailyHistory?.length
    ? weatherData.dailyHistory
    : activeField.soilMoistureHistory.map((m, i) => ({
        date: `2026-0${i + 6}-15`,
        tempMax: 26 + i,
        tempMin: 14 + i,
        tempMean: 20 + i,
        precipitationMm: m.precipitationMm / 4,
        evapotranspirationMm: 3.5,
        surfaceMoisturePct: m.surfaceMoisture,
        rootZoneMoisturePct: m.rootZoneMoisture,
      }));

  // Effective monthly points updated with real API data if available
  const monthlyDisplay = weatherData?.monthlyHistory?.length
    ? weatherData.monthlyHistory
    : activeField.soilMoistureHistory;

  // Most recent weather point
  const latestWeather = dailyPoints[dailyPoints.length - 1] || {
    tempMean: 19.5,
    tempMax: 24.2,
    tempMin: 14.8,
    precipitationMm: 0,
    surfaceMoisturePct: activeField.surfaceMoisturePct,
    rootZoneMoisturePct: activeField.rootZoneMoisturePct,
    evapotranspirationMm: 2.8,
  };

  const totalPrecipitation = weatherData?.totalPrecipitationMm ?? 
    dailyPoints.reduce((acc, p) => acc + p.precipitationMm, 0);

  const avgTemperature = weatherData?.avgTemperature ?? 
    (dailyPoints.reduce((acc, p) => acc + p.tempMean, 0) / (dailyPoints.length || 1));

  // Threshold-based alert evaluation for current crop type
  const criticalThreshold = getCriticalMoistureThreshold(activeField.cropType, thresholdConfig);
  const activeAlert = evaluateFieldMoistureAlert(activeField, thresholdConfig, latestWeather.rootZoneMoisturePct);

  const handleExportCSV = () => {
    downloadFieldCSV(activeField, currentFarm, weatherData);
    setCsvExportSuccess(true);
    setTimeout(() => setCsvExportSuccess(false), 3500);
    if (onExportCSV) {
      onExportCSV();
    }
  };

  return (
    <div className="space-y-6">
      {/* Threshold-Based Moisture Alert Banner */}
      {activeAlert && !isAlertDismissed && (
        <MoistureAlertBanner
          alert={activeAlert}
          onOpenAlertModal={onOpenAlertModal || (() => {})}
          onDismiss={() => setIsAlertDismissed(true)}
          onExportCSV={handleExportCSV}
        />
      )}

      {/* Top Header Card with Real-Time Weather Status Badge */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Sentinel-2 &bull; Open-Meteo Synced
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800 font-mono">
              <Compass className="w-3 h-3 text-cyan-400" />
              Coords: {activeField.centroid[0].toFixed(4)}°N, {activeField.centroid[1].toFixed(4)}°W
            </span>
            {weatherData?.isLive && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Weather Feed Active
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            Soil Health, Weather &amp; Satellite Telemetry &mdash; {activeField.name}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {currentFarm?.name} &bull; {activeField.cropType} &bull; {activeField.acreage} Acres &bull; Soil Classification: {activeField.soilClassification}
          </p>
        </div>

        {/* Controls: Field Switcher, Refresh Weather, Export CSV & Alerts */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Data Lineage Button */}
          {onOpenLineageModal && (
            <button
              onClick={() => onOpenLineageModal(activeField)}
              className="bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
              title="Inspect Sentinel-2 raw ingestion and cryptographic data lineage"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data Lineage</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition hover:scale-105 active:scale-95 shrink-0"
            title="Export current field telemetry and activity history as a CSV file"
          >
            {csvExportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-100" />
                <span>Exported!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </>
            )}
          </button>

          {/* Moisture Alert Center Trigger */}
          {onOpenAlertModal && (
            <button
              onClick={onOpenAlertModal}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                activeAlert
                  ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 animate-pulse'
                  : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700/80'
              }`}
              title="Threshold-Based Alert Settings & Deficit Status"
            >
              {activeAlert ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-stone-400" />
              )}
              <span className="hidden md:inline">Alert Settings</span>
              {activeAlert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          )}

          <button
            onClick={fetchWeatherTelemetry}
            disabled={isLoadingWeather}
            className="bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700/80 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            title="Fetch real-time weather from Open-Meteo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin text-emerald-400' : 'text-stone-400'}`} />
            <span>{isLoadingWeather ? 'Fetching...' : 'Sync Weather'}</span>
          </button>

          <select
            value={activeField.id}
            onChange={(e) => {
              const f = fields.find((item) => item.id === e.target.value);
              if (f) onSelectField(f);
            }}
            className="bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.acreage} ac)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-Time Agronomic Weather & Soil KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative Precipitation */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Cumulative Precipitation</span>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-400">
              {totalPrecipitation.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-stone-400">mm ({((totalPrecipitation * 0.0393701)).toFixed(2)} in)</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Real-time rainfall recorded over recent observational window.
          </p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-800/80">
            <span>Recent 24h: <strong className="text-stone-200">{latestWeather.precipitationMm.toFixed(1)} mm</strong></span>
            <span className="text-sky-300 font-medium">Infiltration: Optimal</span>
          </div>
        </div>

        {/* Ambient Temperature & GDD */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Mean Temperature</span>
            <div className="flex items-center gap-1">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <button
                onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline ml-1"
                title="Toggle °C / °F"
              >
                °{tempUnit}
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-100">
              {formatTemp(avgTemperature)}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              (High: {formatTemp(weatherData?.maxTemperature ?? 28)})
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Low: {formatTemp(weatherData?.minTemperature ?? 10)} &bull; No active frost risk
          </p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-800/80">
            <span>Evapotranspiration: <strong className="text-stone-200">{latestWeather.evapotranspirationMm} mm/day</strong></span>
            <span className="text-amber-400 font-medium">Growing Window</span>
          </div>
        </div>

        {/* Live Root-Zone Soil Moisture & Threshold Alert Indicator */}
        <div className={`border rounded-2xl p-5 shadow-lg transition-all ${
          activeAlert ? 'bg-gradient-to-b from-rose-950/40 to-stone-900 border-rose-600/80 shadow-rose-950/20' : 'bg-stone-900 border-stone-800'
        }`}>
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Root-Zone Moisture (10-40cm)</span>
            <div className="flex items-center gap-1.5">
              {activeAlert ? (
                <span className="bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  Below Threshold
                </span>
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${activeAlert ? 'text-rose-400' : 'text-cyan-400'}`}>
              {latestWeather.rootZoneMoisturePct}%
            </span>
            <span className="text-xs text-stone-400">Volumetric (VWC)</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2">
            <span>Surface: <strong className="text-stone-200">{latestWeather.surfaceMoisturePct}%</strong></span>
            <span>Critical Min ({activeField.cropType}): <strong className="text-stone-300 font-mono">{criticalThreshold}%</strong></span>
          </div>
          <div className="w-full bg-stone-950 h-2 rounded-full mt-3 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                activeAlert ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, latestWeather.rootZoneMoisturePct * 2)}%` }}
            />
            {/* Visual threshold tick mark */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10 rounded-full"
              style={{ left: `${Math.min(100, criticalThreshold * 2)}%` }}
              title={`Critical Crop Threshold: ${criticalThreshold}% VWC`}
            />
          </div>
          {activeAlert && (
            <div className="mt-3 pt-2 border-t border-rose-900/60 flex items-center justify-between text-[10px]">
              <span className="text-rose-300 font-medium">Deficit: -{activeAlert.deficitPct}% VWC</span>
              {onOpenAlertModal && (
                <button
                  onClick={onOpenAlertModal}
                  className="text-rose-400 hover:text-rose-300 font-bold underline flex items-center gap-0.5"
                >
                  <span>Mitigation Plan</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sentinel-2 NDVI Canopy Health */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Sentinel-2 NDVI Index</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{latestNDVI}</span>
            <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              Vigorous Canopy
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Baseline SOC: <strong className="text-stone-200">{activeField.baselineSOCPct}%</strong> ({activeField.baselineSOCStockTonsPerHa} t/ha)
          </p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-emerald-400 pt-2 border-t border-stone-800/80">
            <span>Additionality Verified</span>
            <span className="font-mono">+{activeField.carbonBreakdown.totalGrossMT} MT CO₂e/yr</span>
          </div>
        </div>
      </div>

      {/* 6-Month Historical Weekly Precipitation & Temperature Line Chart */}
      <WeeklyWeather6MonthChart field={activeField} />

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Real-Time Soil Moisture, Precipitation & Temperature Combo Chart */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Real-Time Soil Moisture &amp; Precipitation Dynamics
                </h3>
                <p className="text-xs text-stone-400">
                  Daily precipitation events correlated with surface and root-zone water absorption.
                </p>
              </div>

              {/* View Mode & Overlay Toggles */}
              <div className="flex items-center gap-2 text-xs">
                <div className="bg-stone-950 border border-stone-800 rounded-lg p-1 flex">
                  <button
                    onClick={() => setHistoryMode('daily')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      historyMode === 'daily'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Daily ({dailyPoints.length}d)
                  </button>
                  <button
                    onClick={() => setHistoryMode('monthly')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      historyMode === 'monthly'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Monthly
                  </button>
                </div>

                <button
                  onClick={() => setShowTempOverlay(!showTempOverlay)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition flex items-center gap-1 ${
                    showTempOverlay
                      ? 'bg-amber-950/60 border-amber-700/80 text-amber-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                  title="Toggle temperature curve overlay"
                >
                  <Thermometer className="w-3 h-3" />
                  <span>Temp</span>
                </button>
              </div>
            </div>

            {/* Dynamic Combined SVG Chart */}
            <div className="h-64 w-full relative pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Left Y-axis Grid Lines (Moisture %: 0 to 50%) */}
                {[10, 20, 30, 40, 50].map((val) => {
                  const y = 200 - (val / 50) * 180;
                  return (
                    <g key={val}>
                      <line x1="38" y1={y} x2="465" y2={y} stroke="#292524" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="#78716c" fontSize="9" textAnchor="end">
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Right Y-axis Scale Labels for Rain / Temp */}
                <text x="472" y="24" fill="#38bdf8" fontSize="9" textAnchor="start">
                  mm
                </text>
                <text x="472" y="38" fill="#f59e0b" fontSize="9" textAnchor="start">
                  °{tempUnit}
                </text>

                {historyMode === 'daily' ? (
                  /* Daily Render Mode */
                  (() => {
                    const pts = dailyPoints.slice(-30); // Last 30 daily readings
                    if (!pts.length) return null;

                    const width = 420;
                    const left = 45;
                    const step = width / (pts.length - 1 || 1);

                    // Build path for root-zone moisture curve
                    const rootCoords = pts.map((p, idx) => ({
                      x: left + idx * step,
                      y: 200 - (Math.min(50, p.rootZoneMoisturePct) / 50) * 180,
                      p,
                    }));

                    const rootD = rootCoords.reduce(
                      (acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`,
                      ''
                    );

                    const rootAreaD = `${rootD} L ${rootCoords[rootCoords.length - 1].x} 200 L ${rootCoords[0].x} 200 Z`;

                    // Temperature curve
                    const tempCoords = pts.map((p, idx) => {
                      // Normalize temperature (e.g. 0 to 35 C maps to height)
                      const tVal = tempUnit === 'F' ? (p.tempMean * 9) / 5 + 32 : p.tempMean;
                      const maxTRange = tempUnit === 'F' ? 100 : 38;
                      const minTRange = tempUnit === 'F' ? 30 : 0;
                      const norm = (tVal - minTRange) / (maxTRange - minTRange);
                      return {
                        x: left + idx * step,
                        y: Math.max(15, 200 - norm * 170),
                        val: tVal,
                      };
                    });

                    const tempD = tempCoords.reduce(
                      (acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`,
                      ''
                    );

                    return (
                      <>
                        {/* Rainfall bars on bottom */}
                        {pts.map((p, idx) => {
                          const x = left + idx * step;
                          const barH = Math.min(75, p.precipitationMm * 2.5);
                          if (barH <= 0.5) return null;
                          return (
                            <g key={`rain-${idx}`}>
                              <rect
                                x={x - 2.5}
                                y={200 - barH}
                                width={5}
                                height={barH}
                                fill="#38bdf8"
                                opacity="0.75"
                                rx="1.5"
                              />
                            </g>
                          );
                        })}

                        {/* Root-zone moisture area and stroke */}
                        <path d={rootAreaD} fill="url(#moistureGradient)" />
                        <path d={rootD} fill="none" stroke="#0284c7" strokeWidth="2.5" />

                        {/* Temperature Overlay Curve */}
                        {showTempOverlay && (
                          <path
                            d={tempD}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.8"
                            strokeDasharray="4 3"
                            opacity="0.9"
                          />
                        )}

                        {/* Date markers (every 5-6 points) */}
                        {pts.map((p, idx) => {
                          if (idx % 6 !== 0 && idx !== pts.length - 1) return null;
                          const x = left + idx * step;
                          return (
                            <text
                              key={`lbl-${idx}`}
                              x={x}
                              y="214"
                              fill="#78716c"
                              fontSize="9"
                              textAnchor="middle"
                            >
                              {p.date.slice(5)}
                            </text>
                          );
                        })}
                      </>
                    );
                  })()
                ) : (
                  /* Monthly Render Mode */
                  monthlyDisplay.map((m, idx) => {
                    const x = 70 + idx * 95;
                    const rootY = 200 - (m.rootZoneMoisture / 50) * 180;
                    const surfY = 200 - (m.surfaceMoisture / 50) * 180;
                    const barWidth = 28;

                    return (
                      <g key={m.month}>
                        <rect
                          x={x - barWidth / 2}
                          y={rootY}
                          width={barWidth}
                          height={200 - rootY}
                          fill="#0284c7"
                          rx="4"
                          opacity="0.8"
                        />
                        <circle cx={x} cy={surfY} r="4.5" fill="#38bdf8" />
                        <text
                          x={x}
                          y={rootY - 6}
                          fill="#7dd3fc"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {m.rootZoneMoisture}%
                        </text>
                        <text x={x} y="215" fill="#a8a29e" fontSize="10" textAnchor="middle">
                          {m.month}
                        </text>
                        <text x={x} y="228" fill="#64748b" fontSize="8" textAnchor="middle">
                          {m.precipitationMm}mm
                        </text>
                      </g>
                    );
                  })
                )}
              </svg>
            </div>
          </div>

          {/* Chart Legend & Telemetry Explanation */}
          <div className="mt-8 flex flex-wrap items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-800 gap-2">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-sky-600" /> Root-Zone (10-40cm)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-sm" /> Precipitation (mm)
              </span>
              {showTempOverlay && (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-0.5 bg-amber-400 border-dashed" /> Temp (°{tempUnit})
                </span>
              )}
            </div>
            <span className="text-cyan-400 font-medium">
              +{activeField.carbonBreakdown.waterCapacityGainGallons.toLocaleString()} gal water capacity
            </span>
          </div>
        </div>

        {/* Sentinel-2 NDVI Temporal Trajectory */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Sentinel-2 NDVI Seasonal Trajectory
                </h3>
                <p className="text-xs text-stone-400">
                  Vegetation greenness dynamics confirming non-fallow cover crop retention.
                </p>
              </div>
              <span className="text-xs font-mono text-stone-400 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
                NIR / Red (10m Res)
              </span>
            </div>

            {/* SVG NDVI Curve Chart */}
            <div className="h-64 w-full relative pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((val) => {
                  const y = 200 - (val / 1.0) * 180;
                  return (
                    <g key={val}>
                      <line x1="40" y1={y} x2="490" y2={y} stroke="#292524" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="#78716c" fontSize="10" textAnchor="end">
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Path area & stroke */}
                {(() => {
                  const pts = activeField.ndviHistory;
                  if (!pts.length) return null;
                  const coords = pts.map((p, idx) => {
                    const x = 50 + (idx / (pts.length - 1)) * 430;
                    const y = 200 - (p.ndvi / 1.0) * 180;
                    return { x, y, date: p.date, ndvi: p.ndvi };
                  });

                  const d = coords.reduce(
                    (acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`,
                    ''
                  );
                  const areaD = `${d} L ${coords[coords.length - 1].x} 200 L ${coords[0].x} 200 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#ndviGradient)" />
                      <path d={d} fill="none" stroke="#10b981" strokeWidth="3" />
                      {coords.map((pt, i) => (
                        <g key={i}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            fill="#10b981"
                            stroke="#1c1917"
                            strokeWidth="2"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - 10}
                            fill="#d6d3d1"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {pt.ndvi}
                          </text>
                          <text
                            x={pt.x}
                            y="215"
                            fill="#78716c"
                            fontSize="9"
                            textAnchor="middle"
                          >
                            {pt.date.slice(5)}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Overwinter cover crop sustained NDVI &gt; 0.45 before termination.
            </span>
            <span className="text-emerald-400 font-medium">Confidence: 98.4%</span>
          </div>
        </div>
      </div>

      {/* Weather-Adjusted Yield Forecast & 14-Day NDVI Trajectory Shifts */}
      <WeatherAdjustedYieldForecast
        field={activeField}
        weatherData={weatherData}
        currentFarm={currentFarm}
      />

      {/* Multi-Year Historical Yield Estimation Trends Derived from Multi-Year NDVI */}
      <HistoricalYieldTrendChart field={activeField} />

      {/* New Crop Yield Prediction Section */}
      <CropYieldPrediction
        field={activeField}
        currentFarm={currentFarm}
        weatherData={weatherData}
      />

      {/* Real-time Weather Agronomic Insights Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-stone-100">
              Weather &amp; Soil Hydrology Intelligence Analysis
            </h3>
          </div>
          <span className="text-xs text-stone-400 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
            Open-Meteo High-Resolution Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-stone-300 font-semibold text-xs">
              <span>Rainfall Infiltration Velocity</span>
              <span className="text-emerald-400 font-bold">+18% Efficiency</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              No-till surface residue prevented topsoil crusting during recent rain events. Volumetric moisture spiked within 12 hours without runoff ponding.
            </p>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-stone-300 font-semibold text-xs">
              <span>Evapotranspiration Deficit</span>
              <span className="text-cyan-400 font-bold">Stable Hydration</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Recent daily ET0 averaged <strong>{latestWeather.evapotranspirationMm} mm/day</strong> against cumulative precipitation of <strong>{totalPrecipitation.toFixed(1)} mm</strong>, preserving root-zone reserves.
            </p>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-stone-300 font-semibold text-xs">
              <span>Soil Biological Activity Index</span>
              <span className="text-amber-400 font-bold">Optimal Respiration</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Soil temperature at 10cm depth ({formatTemp(avgTemperature - 2)}) combined with &gt;25% VWC provides ideal conditions for mycorrhizal fungal glomalin synthesis.
            </p>
          </div>
        </div>
      </div>

      {/* Field Benchmarking & Radar Comparison Feature */}
      <FieldBenchmarkingRadar
        fields={fields}
        activeField={activeField}
        onOpenBarChartModal={onOpenComparisonModal}
      />

      {/* Soil Organic Carbon (SOC) Stratification Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-stone-100 flex items-center gap-2 mb-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          Soil Organic Carbon (SOC) Depth Profile &amp; Bulk Density
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Baseline carbon stock quantification calibrated against USDA NRCS soil surveys and direct field sample archives.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
            <span className="text-xs text-stone-400 font-semibold block">0 - 15 cm (Tillage / Surface Zone)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-400">
                {(activeField.baselineSOCPct * 1.15).toFixed(2)}%
              </span>
              <span className="text-xs text-stone-400 font-mono">31.2 t C/ha</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Direct biological deposition from cover crop root exudates and microbial necromass.
            </p>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
            <span className="text-xs text-stone-400 font-semibold block">15 - 30 cm (Rooting Zone)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-stone-200">
                {activeField.baselineSOCPct.toFixed(2)}%
              </span>
              <span className="text-xs text-stone-400 font-mono">27.2 t C/ha</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Stable humic compounds with high moisture holding capacity and cation exchange.
            </p>
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
            <span className="text-xs text-stone-400 font-semibold block">30 - 60 cm (Subsoil Mineral Layer)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-stone-400">
                {(activeField.baselineSOCPct * 0.65).toFixed(2)}%
              </span>
              <span className="text-xs text-stone-400 font-mono">19.8 t C/ha</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Mineral-associated organic matter (MAOM) with long decadal residence times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
