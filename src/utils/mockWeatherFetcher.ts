import { FieldWeatherReport, DayWeatherForecast } from '../services/weatherService';

export interface PlotWeatherHeatmapData {
  fieldId: string;
  fieldName: string;
  sevenDayPrecipMm: number;
  sevenDayPrecipInches: number;
  avgTempMaxC: number;
  avgTempMaxF: number;
  heatmapCategory: 'excess_moisture_runoff' | 'optimal_moisture' | 'light_moisture' | 'moisture_deficit_dry' | 'heat_stress_drought';
  heatmapColor: string;
  heatmapLabel: string;
  trafficabilityRisk: 'Safe' | 'Caution' | 'High Runoff Risk' | 'Drought Stress';
  weatherReport: FieldWeatherReport;
}

// Deterministic mock weather generator for any field parcel
export function getFieldWeatherHeatmapData(
  fieldId: string, 
  fieldName: string, 
  centroid: [number, number] = [42.06, -93.58],
  baselineSOCPct: number = 2.5
): PlotWeatherHeatmapData {
  const [lat, lon] = centroid;
  
  // Create realistic variations across fields based on coordinates & field ID
  const hash = Math.abs(fieldId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0));
  const precipVariation = (hash % 20) - 5; // -5mm to +15mm offset
  
  const baseTempC = 20 + ((hash % 7) - 3);
  const basePrecip7d = Math.max(2, 14.5 + precipVariation);
  const basePrecipInches = parseFloat((basePrecip7d / 25.4).toFixed(2));

  let category: PlotWeatherHeatmapData['heatmapCategory'] = 'optimal_moisture';
  let color = '#10b981'; // Green: Optimal moisture
  let label = 'Optimal Infiltration (Balanced Moisture)';
  let risk: PlotWeatherHeatmapData['trafficabilityRisk'] = 'Safe';

  if (basePrecip7d > 24) {
    category = 'excess_moisture_runoff';
    color = '#8b5cf6'; // Violet/Deep Blue: Heavy rain / runoff risk
    label = 'Elevated Runoff Risk (Heavy Rain >24mm)';
    risk = 'High Runoff Risk';
  } else if (basePrecip7d >= 10) {
    category = 'optimal_moisture';
    color = '#10b981'; // Green: Optimal moisture
    label = 'Optimal Root-Zone Moisture (10–24mm)';
    risk = 'Safe';
  } else if (basePrecip7d >= 4) {
    category = 'light_moisture';
    color = '#06b6d4'; // Cyan: Light moisture
    label = 'Light Showers (4–9mm)';
    risk = 'Safe';
  } else if (baseTempC >= 28) {
    category = 'heat_stress_drought';
    color = '#ef4444'; // Red: Heat stress
    label = 'High Heat Stress & Low Precipitation';
    risk = 'Drought Stress';
  } else {
    category = 'moisture_deficit_dry';
    color = '#f59e0b'; // Amber: Dry
    label = 'Moisture Deficit Window (<4mm)';
    risk = 'Caution';
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dailyForecast: DayWeatherForecast[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = i === 0 ? 'Today' : daysOfWeek[d.getDay()];
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Distribute 7-day precip
    const dayPrecip = i === 2 ? basePrecip7d * 0.45 : i === 4 ? basePrecip7d * 0.35 : i === 0 ? basePrecip7d * 0.2 : 0;
    const roundedPrecip = parseFloat(dayPrecip.toFixed(1));
    const dayMaxC = baseTempC + (i % 2 === 0 ? 1 : -1);
    const dayMinC = dayMaxC - 9;

    dailyForecast.push({
      date: dateStr,
      dayName,
      tempMaxC: dayMaxC,
      tempMinC: dayMinC,
      tempMaxF: Math.round((dayMaxC * 9) / 5 + 32),
      tempMinF: Math.round((dayMinC * 9) / 5 + 32),
      precipitationMm: roundedPrecip,
      precipitationInches: parseFloat((roundedPrecip / 25.4).toFixed(2)),
      precipitationProbability: roundedPrecip > 5 ? 80 : roundedPrecip > 0 ? 45 : 10,
      weatherCode: roundedPrecip > 10 ? 80 : roundedPrecip > 0 ? 61 : 1,
      conditionLabel: roundedPrecip > 10 ? 'Heavy Rain' : roundedPrecip > 0 ? 'Rain Showers' : 'Clear / Mild',
      conditionIcon: roundedPrecip > 0 ? 'cloud-rain' : 'sun',
      fieldWorkability: roundedPrecip > 10 ? 'High Runoff Risk' : roundedPrecip > 3 ? 'Caution - Moist' : 'Optimal',
      workabilityColor: roundedPrecip > 10 ? 'text-rose-400 bg-rose-950/60 border-rose-800' : 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    });
  }

  const weatherReport: FieldWeatherReport = {
    fieldId,
    fieldName,
    latitude: lat,
    longitude: lon,
    current: {
      temperatureC: baseTempC,
      temperatureF: Math.round((baseTempC * 9) / 5 + 32),
      relativeHumidity: category === 'excess_moisture_runoff' ? 82 : 58,
      windSpeedKmh: 14,
      windSpeedMph: 9,
      weatherCode: category === 'excess_moisture_runoff' ? 65 : 1,
      conditionLabel: category === 'excess_moisture_runoff' ? 'Rain Showers' : 'Partly Cloudy',
      isDay: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    dailyForecast,
    sevenDayTotalPrecipMm: parseFloat(basePrecip7d.toFixed(1)),
    sevenDayTotalPrecipInches: basePrecipInches,
    moistureDecisionAdvisory: {
      severity: category === 'excess_moisture_runoff' ? 'warning' : 'optimal',
      headline: category === 'excess_moisture_runoff'
        ? 'Precipitation Spike Expected: Moisture Buffering Active'
        : 'Optimal Soil Trafficability & Field Workability Window',
      description: category === 'excess_moisture_runoff'
        ? `Upcoming ${basePrecip7d.toFixed(1)}mm (${basePrecipInches}") cumulative rain over 7 days. Parcel baseline SOC of ${baselineSOCPct}% creates a high water-holding sponge capacity, preventing surface erosion. Recommend delaying broadcast fertilizer.`
        : `7-day rainfall of ${basePrecip7d.toFixed(1)}mm maintains stable root-zone moisture with zero waterlogging risks. Safe for field equipment.`,
      recommendedActions: [
        'Maintain living cover crop root channels to absorb peak rain infiltration.',
        'Postpone broadcast nitrogen application 24h prior to forecasted rain events.',
        'Inspect tile drainage discharge for clarity post-precipitation.'
      ],
      soilTrafficability: risk === 'High Runoff Risk' ? 'Marginal Field Conditions' : 'Safe for Heavy Equipment'
    },
    isLiveApiData: false,
    fetchedAt: new Date().toISOString(),
  };

  return {
    fieldId,
    fieldName,
    sevenDayPrecipMm: parseFloat(basePrecip7d.toFixed(1)),
    sevenDayPrecipInches: basePrecipInches,
    avgTempMaxC: baseTempC,
    avgTempMaxF: Math.round((baseTempC * 9) / 5 + 32),
    heatmapCategory: category,
    heatmapColor: color,
    heatmapLabel: label,
    trafficabilityRisk: risk,
    weatherReport,
  };
}

// Fetch 7-day weather heatmap dataset for an entire list of farm parcels
export function fetchFarmPlotsWeatherHeatmap(
  fields: { id: string; name: string; centroid?: [number, number]; baselineSOCPct?: number }[]
): Record<string, PlotWeatherHeatmapData> {
  const dataset: Record<string, PlotWeatherHeatmapData> = {};
  fields.forEach((f) => {
    dataset[f.id] = getFieldWeatherHeatmapData(
      f.id, 
      f.name, 
      f.centroid || [42.06, -93.58], 
      f.baselineSOCPct || 2.4
    );
  });
  return dataset;
}
