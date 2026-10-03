export interface DayWeatherForecast {
  date: string;
  dayName: string;
  tempMaxC: number;
  tempMinC: number;
  tempMaxF: number;
  tempMinF: number;
  precipitationMm: number;
  precipitationInches: number;
  precipitationProbability: number;
  weatherCode: number;
  conditionLabel: string;
  conditionIcon: 'sun' | 'cloud-rain' | 'cloud' | 'cloud-sun' | 'cloud-lightning';
  fieldWorkability: 'Optimal' | 'Caution - Moist' | 'High Runoff Risk' | 'Too Dry';
  workabilityColor: string;
}

export interface CurrentWeatherState {
  temperatureC: number;
  temperatureF: number;
  relativeHumidity: number;
  windSpeedKmh: number;
  windSpeedMph: number;
  weatherCode: number;
  conditionLabel: string;
  isDay: boolean;
  timestamp: string;
}

export interface FieldWeatherReport {
  fieldId: string;
  fieldName: string;
  latitude: number;
  longitude: number;
  current: CurrentWeatherState;
  dailyForecast: DayWeatherForecast[];
  sevenDayTotalPrecipMm: number;
  sevenDayTotalPrecipInches: number;
  moistureDecisionAdvisory: {
    severity: 'optimal' | 'warning' | 'alert';
    headline: string;
    description: string;
    recommendedActions: string[];
    soilTrafficability: 'Safe for Heavy Equipment' | 'Marginal Field Conditions' | 'Compaction Risk - Avoid Traffic';
  };
  isLiveApiData: boolean;
  fetchedAt: string;
}

// Weather code mapping according to WMO standard
function parseWmoWeatherCode(code: number): { label: string; icon: 'sun' | 'cloud-rain' | 'cloud' | 'cloud-sun' | 'cloud-lightning' } {
  if (code === 0) return { label: 'Clear Sky', icon: 'sun' };
  if (code === 1 || code === 2) return { label: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code === 3) return { label: 'Overcast', icon: 'cloud' };
  if (code >= 45 && code <= 48) return { label: 'Foggy / Low Visibility', icon: 'cloud' };
  if (code >= 51 && code <= 55) return { label: 'Light Drizzle', icon: 'cloud-rain' };
  if (code >= 61 && code <= 65) return { label: 'Rain Showers', icon: 'cloud-rain' };
  if (code >= 80 && code <= 82) return { label: 'Heavy Precipitation', icon: 'cloud-rain' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorms', icon: 'cloud-lightning' };
  return { label: 'Variable Conditions', icon: 'cloud-sun' };
}

// Fallback generator when API cannot be reached or offline
export function generateMockFieldWeather(
  fieldId: string, 
  fieldName: string, 
  lat: number = 42.0308, 
  lon: number = -93.6319
): FieldWeatherReport {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  // Seed pseudorandom variation from field coordinates
  const baseLatFactor = Math.sin(lat * 10);
  const baseTempC = Math.round(18 + baseLatFactor * 4);
  const currentTempC = baseTempC;
  const currentTempF = Math.round((currentTempC * 9) / 5 + 32);

  const dailyForecast: DayWeatherForecast[] = [];
  const precipPatterns = [1.2, 0.0, 14.8, 6.2, 0.0, 0.0, 3.4];

  let totalPrecip = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = i === 0 ? 'Today' : daysOfWeek[d.getDay()];
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const pMm = precipPatterns[i % precipPatterns.length];
    totalPrecip += pMm;
    const pInches = parseFloat((pMm / 25.4).toFixed(2));
    const maxC = baseTempC + (i % 3) - 1;
    const minC = maxC - 8;
    const code = pMm > 10 ? 80 : pMm > 2 ? 61 : pMm > 0 ? 51 : i % 2 === 0 ? 1 : 0;
    const { label, icon } = parseWmoWeatherCode(code);

    let workability: DayWeatherForecast['fieldWorkability'] = 'Optimal';
    let workabilityColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';

    if (pMm > 10) {
      workability = 'High Runoff Risk';
      workabilityColor = 'text-rose-400 bg-rose-950/60 border-rose-800';
    } else if (pMm > 3) {
      workability = 'Caution - Moist';
      workabilityColor = 'text-amber-400 bg-amber-950/60 border-amber-800';
    } else if (maxC > 30) {
      workability = 'Too Dry';
      workabilityColor = 'text-orange-400 bg-orange-950/60 border-orange-800';
    }

    dailyForecast.push({
      date: dateStr,
      dayName,
      tempMaxC: maxC,
      tempMinC: minC,
      tempMaxF: Math.round((maxC * 9) / 5 + 32),
      tempMinF: Math.round((minC * 9) / 5 + 32),
      precipitationMm: pMm,
      precipitationInches: pInches,
      precipitationProbability: pMm > 10 ? 85 : pMm > 2 ? 55 : pMm > 0 ? 30 : 10,
      weatherCode: code,
      conditionLabel: label,
      conditionIcon: icon,
      fieldWorkability: workability,
      workabilityColor,
    });
  }

  const sevenDayPrecipMm = parseFloat(totalPrecip.toFixed(1));
  const sevenDayPrecipInches = parseFloat((sevenDayPrecipMm / 25.4).toFixed(2));

  return {
    fieldId,
    fieldName,
    latitude: lat,
    longitude: lon,
    current: {
      temperatureC: currentTempC,
      temperatureF: currentTempF,
      relativeHumidity: 62,
      windSpeedKmh: 14,
      windSpeedMph: 9,
      weatherCode: 1,
      conditionLabel: 'Partly Cloudy',
      isDay: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    dailyForecast,
    sevenDayTotalPrecipMm: sevenDayPrecipMm,
    sevenDayTotalPrecipInches: sevenDayPrecipInches,
    moistureDecisionAdvisory: {
      severity: sevenDayPrecipMm > 20 ? 'warning' : 'optimal',
      headline: sevenDayPrecipMm > 20 
        ? 'Heavy Mid-Week Rainfall: Field Operations Precaution'
        : 'Optimal Infiltration Window for Field Operations',
      description: sevenDayPrecipMm > 20
        ? `Upcoming ${sevenDayPrecipMm}mm (${sevenDayPrecipInches}") cumulative rain detected over the next 7 days. High organic matter cover crops will buffer against surface runoff. Recommend postponing heavy tillage or synthetic fertilizer top-dressing to prevent nutrient leaching.`
        : `Moderate rainfall trajectory (${sevenDayPrecipMm}mm) ensures favorable root-zone soil moisture without waterlogging risks. Field trafficability remains excellent.`,
      recommendedActions: [
        'Maintain living cover crop canopy to maximize rainwater infiltration into root-zone.',
        'Hold off on surface broadcast applications 24h prior to forecasted precipitation spike.',
        'Check sub-surface tile drain outlets post-rain event for sediment clarity verification.'
      ],
      soilTrafficability: sevenDayPrecipMm > 20 ? 'Marginal Field Conditions' : 'Safe for Heavy Equipment'
    },
    isLiveApiData: false,
    fetchedAt: new Date().toISOString(),
  };
}

// Fetch live weather data from Open-Meteo free public API with automatic fallback
export async function fetchFieldWeatherData(
  fieldId: string,
  fieldName: string,
  lat: number,
  lon: number
): Promise<FieldWeatherReport> {
  const fallback = generateMockFieldWeather(fieldId, fieldName, lat, lon);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
    
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000), // 5-second timeout
    });

    if (!res.ok) {
      console.warn(`Weather API returned ${res.status}, using localized agronomic weather model.`);
      return fallback;
    }

    const data = await res.json();
    if (!data || !data.daily || !data.daily.time) {
      return fallback;
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyForecast: DayWeatherForecast[] = [];
    let totalPrecipMm = 0;

    const count = Math.min(7, data.daily.time.length);
    for (let i = 0; i < count; i++) {
      const dateParts = data.daily.time[i].split('-');
      const d = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
      const dayName = i === 0 ? 'Today' : daysOfWeek[d.getDay()];
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const pMm = Number(data.daily.precipitation_sum?.[i] ?? 0);
      totalPrecipMm += pMm;
      const pInches = parseFloat((pMm / 25.4).toFixed(2));
      const maxC = Math.round(data.daily.temperature_2m_max?.[i] ?? 20);
      const minC = Math.round(data.daily.temperature_2m_min?.[i] ?? 10);
      const code = Number(data.daily.weather_code?.[i] ?? 0);
      const prob = Number(data.daily.precipitation_probability_max?.[i] ?? (pMm > 0 ? 60 : 10));

      const { label, icon } = parseWmoWeatherCode(code);

      let workability: DayWeatherForecast['fieldWorkability'] = 'Optimal';
      let workabilityColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';

      if (pMm >= 15) {
        workability = 'High Runoff Risk';
        workabilityColor = 'text-rose-400 bg-rose-950/60 border-rose-800';
      } else if (pMm >= 4) {
        workability = 'Caution - Moist';
        workabilityColor = 'text-amber-400 bg-amber-950/60 border-amber-800';
      } else if (maxC > 32) {
        workability = 'Too Dry';
        workabilityColor = 'text-orange-400 bg-orange-950/60 border-orange-800';
      }

      dailyForecast.push({
        date: dateStr,
        dayName,
        tempMaxC: maxC,
        tempMinC: minC,
        tempMaxF: Math.round((maxC * 9) / 5 + 32),
        tempMinF: Math.round((minC * 9) / 5 + 32),
        precipitationMm: parseFloat(pMm.toFixed(1)),
        precipitationInches: pInches,
        precipitationProbability: prob,
        weatherCode: code,
        conditionLabel: label,
        conditionIcon: icon,
        fieldWorkability: workability,
        workabilityColor,
      });
    }

    const currentTempC = Math.round(data.current?.temperature_2m ?? 18);
    const currentTempF = Math.round((currentTempC * 9) / 5 + 32);
    const currentHumidity = Math.round(data.current?.relative_humidity_2m ?? 60);
    const currentWindKmh = Math.round(data.current?.wind_speed_10m ?? 12);
    const currentWindMph = Math.round(currentWindKmh * 0.621371);
    const currentWmo = parseWmoWeatherCode(Number(data.current?.weather_code ?? 0));

    const totalSevenDayPrecipMm = parseFloat(totalPrecipMm.toFixed(1));
    const totalSevenDayPrecipInches = parseFloat((totalSevenDayPrecipMm / 25.4).toFixed(2));

    return {
      fieldId,
      fieldName,
      latitude: lat,
      longitude: lon,
      current: {
        temperatureC: currentTempC,
        temperatureF: currentTempF,
        relativeHumidity: currentHumidity,
        windSpeedKmh: currentWindKmh,
        windSpeedMph: currentWindMph,
        weatherCode: Number(data.current?.weather_code ?? 0),
        conditionLabel: currentWmo.label,
        isDay: data.current?.is_day === 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      dailyForecast,
      sevenDayTotalPrecipMm: totalSevenDayPrecipMm,
      sevenDayTotalPrecipInches: totalSevenDayPrecipInches,
      moistureDecisionAdvisory: {
        severity: totalSevenDayPrecipMm > 20 ? 'warning' : 'optimal',
        headline: totalSevenDayPrecipMm > 20 
          ? 'Elevated Precipitation Forecast: Moisture Buffer Active'
          : 'Favorable Agronomic Window: Soil Moisture Balanced',
        description: totalSevenDayPrecipMm > 20
          ? `Expected ${totalSevenDayPrecipMm}mm (${totalSevenDayPrecipInches}") over 7 days. High organic matter cover crops will buffer against surface runoff. Recommend postponing heavy tillage or synthetic fertilizer top-dressing to prevent nutrient leaching.`
          : `7-day cumulative precipitation of ${totalSevenDayPrecipMm}mm (${totalSevenDayPrecipInches}") supports steady microbial mineralization. Soil profile trafficability is high.`,
        recommendedActions: [
          'Maintain living cover crop canopy to maximize rainwater infiltration into root-zone.',
          'Hold off on surface broadcast applications 24h prior to forecasted precipitation spike.',
          'Check sub-surface tile drain outlets post-rain event for sediment clarity verification.'
        ],
        soilTrafficability: totalSevenDayPrecipMm > 20 ? 'Marginal Field Conditions' : 'Safe for Heavy Equipment',
      },
      isLiveApiData: true,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.info('Live weather fetch skipped or timed out, loading robust local model:', err);
    return fallback;
  }
}
