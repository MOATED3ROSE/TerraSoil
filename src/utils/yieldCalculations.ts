import { Field, CropYieldEstimate, WeatherTelemetryData, MultiYearYieldNdviPoint } from '../types';

export function calculateFieldCropYield(
  field: Field,
  weatherData?: WeatherTelemetryData | null,
  customScenario?: {
    additionalRainfallMm?: number;
    customPricePerUnit?: number;
    conventionalPracticeComparison?: boolean;
  }
): CropYieldEstimate {
  const cropLower = field.cropType.toLowerCase();

  let cropName = 'Corn';
  let unit = 'bu/acre';
  let baseline = 182.0;
  let price = 4.65;

  if (cropLower.includes('soy')) {
    cropName = 'Soybeans';
    baseline = 53.0;
    price = 11.85;
  } else if (cropLower.includes('wheat')) {
    cropName = 'Winter Wheat';
    baseline = 67.5;
    price = 5.95;
  } else if (cropLower.includes('oat')) {
    cropName = 'Oats';
    baseline = 84.0;
    price = 3.85;
  } else if (cropLower.includes('pasture') || cropLower.includes('graz')) {
    cropName = 'Forage Biomass';
    unit = 'tons DM/acre';
    baseline = 3.6;
    price = 145.0;
  }

  // 1. NDVI Canopy Photosynthetic Impact
  // Higher NDVI during peak growth indicates dense leaf area index and optimal light interception
  const ndviNorm = Math.max(0.3, Math.min(0.9, field.currentNDVI));
  // Baseline NDVI benchmark is ~0.65; every 0.1 above adds ~6.5% yield
  const ndviContributionPct = Math.round(((ndviNorm - 0.62) / 0.25) * 16 * 10) / 10;

  // 2. Soil Moisture & Hydration Factor
  // Uses root zone moisture (10-40cm) from weather API or field baseline
  const rootMoisture = weatherData?.dailyHistory?.length
    ? weatherData.dailyHistory[weatherData.dailyHistory.length - 1].rootZoneMoisturePct
    : field.rootZoneMoisturePct;

  let moistureContributionPct = 0;
  if (rootMoisture >= 28 && rootMoisture <= 40) {
    // Optimal root hydration: +6% to +9%
    moistureContributionPct = Math.round((5.5 + ((rootMoisture - 28) / 12) * 3.5) * 10) / 10;
  } else if (rootMoisture > 40) {
    // Slight waterlogging risk: +2%
    moistureContributionPct = 2.0;
  } else if (rootMoisture >= 20) {
    // Moderate moisture: +1% to +4%
    moistureContributionPct = Math.round(((rootMoisture - 20) / 8) * 3.5 * 10) / 10;
  } else {
    // Water stress: negative penalty
    moistureContributionPct = Math.round(((rootMoisture - 20) / 10) * 12 * 10) / 10;
  }

  // 3. Soil Organic Carbon (SOC) Resilience Buffer
  // 1% SOM holds ~27k gal water/ac; higher baseline SOC dampens heat and drought shock
  const socDelta = Math.max(0, field.baselineSOCPct - 1.8);
  const socResiliencePct = Math.round(socDelta * 3.4 * 10) / 10;

  // 4. Thermal Stress Penalty (based on days >32°C from real-time weather)
  let thermalStressPenaltyPct = 0;
  if (weatherData?.maxTemperature && weatherData.maxTemperature > 32) {
    thermalStressPenaltyPct = -2.1;
  } else if (weatherData?.maxTemperature && weatherData.maxTemperature > 30) {
    thermalStressPenaltyPct = -0.8;
  }

  // 5. Practice Bonus: Regenerative cover cropping & no-till
  const hasCoverCrop = field.practices.some((p) => p.practiceType === 'cover_crop');
  const hasNoTill = field.practices.some((p) => p.practiceType === 'no_till');
  let practiceBonusPct = 0;
  if (hasCoverCrop) practiceBonusPct += 3.2;
  if (hasNoTill) practiceBonusPct += 2.5;

  // If conventional practice comparison is toggled, strip out regenerative practice bonus and SOC buffer
  if (customScenario?.conventionalPracticeComparison) {
    practiceBonusPct = -4.5;
  }

  // Optional scenario additional rainfall (e.g. +20mm expected before harvest)
  let rainfallBonusPct = 0;
  if (customScenario?.additionalRainfallMm) {
    rainfallBonusPct = Math.min(5.0, (customScenario.additionalRainfallMm / 50) * 3.5);
  }

  // Total net yield multiplier
  const netModifierPct =
    ndviContributionPct +
    moistureContributionPct +
    socResiliencePct +
    thermalStressPenaltyPct +
    practiceBonusPct +
    rainfallBonusPct;

  const projectedYieldPerAcre = Math.round(baseline * (1 + netModifierPct / 100) * 10) / 10;
  const percentageVsBaseline = Math.round(((projectedYieldPerAcre - baseline) / baseline) * 100 * 10) / 10;
  const totalFieldProduction = Math.round(projectedYieldPerAcre * field.acreage);

  const effectivePrice = customScenario?.customPricePerUnit || price;
  const projectedRevenueUSD = Math.round(totalFieldProduction * effectivePrice);

  // Confidence score: based on availability of live satellite + weather feed
  const confidenceScorePct = weatherData?.isLive ? 94.6 : 89.2;

  // Developmental Growth Stages Breakdown
  const stages = [
    {
      stageName: 'V4 - V8 (Vegetative)',
      growthPhase: 'Rapid Root & Biomass Extension',
      projectedYieldAtStage: Math.round(baseline * 0.95 * 10) / 10,
      ndviObserved: 0.44,
      moistureAdequacy: 'Optimal Infiltration',
    },
    {
      stageName: 'R1 (Flowering / Silking)',
      growthPhase: 'Critical Pollination & Kernel Set',
      projectedYieldAtStage: Math.round(baseline * 1.05 * 10) / 10,
      ndviObserved: 0.72,
      moistureAdequacy: 'Adequate Root Reserves',
    },
    {
      stageName: 'R3 - R4 (Grain / Pod Fill)',
      growthPhase: 'Active Starch & Protein Deposition',
      projectedYieldAtStage: Math.round(projectedYieldPerAcre * 0.98 * 10) / 10,
      ndviObserved: field.currentNDVI,
      moistureAdequacy: `${rootMoisture}% VWC (Sustained)`,
    },
    {
      stageName: 'R6 (Physiological Maturity)',
      growthPhase: 'Black Layer / Harvest Readiness',
      projectedYieldAtStage: projectedYieldPerAcre,
      ndviObserved: Math.max(0.35, field.currentNDVI - 0.08),
      moistureAdequacy: 'Harvest Window Favorable',
    },
  ];

  return {
    cropName,
    unit,
    baselineRegionalYield: baseline,
    projectedYieldPerAcre,
    percentageVsBaseline,
    totalFieldProduction,
    projectedRevenueUSD,
    benchmarkPricePerUnit: effectivePrice,
    confidenceScorePct,
    drivers: {
      ndviContributionPct,
      moistureContributionPct,
      socResiliencePct,
      thermalStressPenaltyPct,
    },
    stages,
  };
}

export function calculateMultiYearYieldNdviTrends(field: Field): MultiYearYieldNdviPoint[] {
  const cropLower = field.cropType.toLowerCase();

  let cropName = 'Corn';
  let unit = 'bu/acre';
  let baselineBase = 182.0;

  if (cropLower.includes('soy')) {
    cropName = 'Soybeans';
    baselineBase = 53.0;
  } else if (cropLower.includes('wheat')) {
    cropName = 'Winter Wheat';
    baselineBase = 67.5;
  } else if (cropLower.includes('oat')) {
    cropName = 'Oats';
    baselineBase = 84.0;
  } else if (cropLower.includes('pasture') || cropLower.includes('graz')) {
    cropName = 'Forage Biomass';
    unit = 'tons DM/acre';
    baselineBase = 3.6;
  }

  // Base multiplier from current field SOC and active NDVI
  const socFactor = Math.max(0.85, field.baselineSOCPct / 2.6);
  const ndviFactor = Math.max(0.88, field.currentNDVI / 0.78);

  const yearsData: {
    year: number;
    yearLabel: string;
    peakNDVI: number;
    integratedNDVI: number;
    yieldMultiplier: number;
    benchmarkOffset: number;
    rainfallMm: number;
    phase: string;
    moistureAdequacy: number;
    socBuffer: number;
    notes: string;
  }[] = [
    {
      year: 2021,
      yearLabel: '2021',
      peakNDVI: Number((0.68 * ndviFactor).toFixed(2)),
      integratedNDVI: 52.4,
      yieldMultiplier: 0.92,
      benchmarkOffset: 0.98,
      rainfallMm: 540,
      phase: 'Conventional Tillage Baseline',
      moistureAdequacy: 68,
      socBuffer: 1.0,
      notes: 'Conventional fall chisel plow; winter bare fallow; severe mid-summer moisture stress.',
    },
    {
      year: 2022,
      yearLabel: '2022',
      peakNDVI: Number((0.71 * ndviFactor).toFixed(2)),
      integratedNDVI: 57.8,
      yieldMultiplier: 0.95,
      benchmarkOffset: 0.99,
      rainfallMm: 490,
      phase: 'Year 1 Single-Species Rye Cover',
      moistureAdequacy: 74,
      socBuffer: 1.05,
      notes: 'Initial cereal rye seeding post-harvest; noticeable early soil erosion control.',
    },
    {
      year: 2023,
      yearLabel: '2023',
      peakNDVI: Number((0.75 * ndviFactor).toFixed(2)),
      integratedNDVI: 63.2,
      yieldMultiplier: 1.02,
      benchmarkOffset: 1.0,
      rainfallMm: 415,
      phase: 'Strip-Till & Split-N Optimization',
      moistureAdequacy: 82,
      socBuffer: 1.15,
      notes: 'Regional July drought year; field beat county average by +4.2 bu/ac due to residue moisture buffer.',
    },
    {
      year: 2024,
      yearLabel: '2024',
      peakNDVI: Number((0.78 * ndviFactor).toFixed(2)),
      integratedNDVI: 68.6,
      yieldMultiplier: 1.07,
      benchmarkOffset: 1.01,
      rainfallMm: 580,
      phase: '100% Continuous No-Till + Multi-Species Cover',
      moistureAdequacy: 89,
      socBuffer: 1.22,
      notes: 'Rye + hairy vetch + brassica cocktail; rapid rainfall infiltration and zero runoff.',
    },
    {
      year: 2025,
      yearLabel: '2025',
      peakNDVI: Number((0.82 * ndviFactor).toFixed(2)),
      integratedNDVI: 73.4,
      yieldMultiplier: 1.11,
      benchmarkOffset: 1.02,
      rainfallMm: 565,
      phase: 'Biological Inoculants & Variable-Rate Sidedress',
      moistureAdequacy: 94,
      socBuffer: 1.28,
      notes: 'Earthworm counts tripled; lab verified +0.18% SOC gain; mycorrhizal network established.',
    },
    {
      year: 2026,
      yearLabel: '2026 (Est.)',
      peakNDVI: Number((field.currentNDVI).toFixed(2)),
      integratedNDVI: 77.2,
      yieldMultiplier: Number((1.14 * socFactor).toFixed(2)),
      benchmarkOffset: 1.03,
      rainfallMm: 585,
      phase: 'Audit-Ready Scope 3 Regenerative System',
      moistureAdequacy: 96,
      socBuffer: 1.34,
      notes: 'Current season Sentinel-2 NDVI tracks at record high; projected harvest yield premium +14.2%.',
    },
  ];

  return yearsData.map((y) => {
    const regionalBenchmark = Number((baselineBase * y.benchmarkOffset).toFixed(1));
    const estimatedYield = Number((baselineBase * y.yieldMultiplier).toFixed(1));
    const yieldAnomalyPct = Number((((estimatedYield - regionalBenchmark) / regionalBenchmark) * 100).toFixed(1));

    return {
      year: y.year,
      yearLabel: y.yearLabel,
      cropName,
      peakNDVI: y.peakNDVI,
      integratedNDVI: y.integratedNDVI,
      estimatedYield,
      unit,
      regionalBenchmarkYield: regionalBenchmark,
      yieldAnomalyPct,
      rainfallMm: y.rainfallMm,
      regenerativePhase: y.phase,
      soilMoistureAdequacyPct: y.moistureAdequacy,
      socBufferFactor: y.socBuffer,
      managementNotes: y.notes,
    };
  });
}

export const calculateMultiYearYieldHistory = calculateMultiYearYieldNdviTrends;

