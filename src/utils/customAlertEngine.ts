import { 
  Field, 
  CustomAlertRule, 
  CompoundAlertEvaluationResult, 
  MoistureAlertSeverity 
} from '../types';

export const SYSTEM_CUSTOM_ALERT_PRESETS: CustomAlertRule[] = [
  {
    id: 'rule-drought-compound',
    name: 'Compound Drought & Heat Stress Alert',
    description: 'Triggers when root-zone moisture drops below 22% combined with 7-day precipitation under 10mm and declining NDVI vigor.',
    enabled: true,
    severity: 'critical',
    logicalOperator: 'AND',
    conditions: [
      { id: 'c1', metric: 'root_zone_moisture', operator: 'less_than', thresholdValue: 22, unit: '% VWC' },
      { id: 'c2', metric: 'precipitation_7day', operator: 'less_than', thresholdValue: 12, unit: 'mm' },
      { id: 'c3', metric: 'ndvi_trend', operator: 'declining', thresholdValue: 0, unit: 'trend' }
    ],
    persistenceDuration: '2_cycles',
    cropFilter: 'ALL',
    mitigationWorkflow: [
      'Prioritize immediate supplemental irrigation if center-pivot or drip infrastructure is available (target 1.25 inches).',
      'Cease all mechanical tillage or shallow cultivating to protect remaining capillaric root moisture.',
      'Delay foliar nitrogen, sulfur, or herbicide applications to prevent scorching heat-stressed canopy.'
    ],
    createdAt: '2026-09-15T08:00:00Z',
    isSystemPreset: true,
  },
  {
    id: 'rule-saturation-anaerobic',
    name: 'Soil Saturation & Anaerobic Root Rot Risk',
    description: 'Detects prolonged waterlogging (root zone > 40%) coupled with heavy rainfall, risking denitrifying losses and root asphyxiation.',
    enabled: true,
    severity: 'warning',
    logicalOperator: 'AND',
    conditions: [
      { id: 'c1', metric: 'root_zone_moisture', operator: 'greater_than', thresholdValue: 38, unit: '% VWC' },
      { id: 'c2', metric: 'precipitation_7day', operator: 'greater_than', thresholdValue: 45, unit: 'mm' }
    ],
    persistenceDuration: '2_cycles',
    cropFilter: 'ALL',
    mitigationWorkflow: [
      'Inspect field tile drainage outlets and clear surface debris to maximize gravity discharge.',
      'Anticipate denitrification nitrogen losses (1.5-2.0% per day of waterlogging); prepare for post-drainage nitrogen rescue top-dress.',
      'Avoid heavy equipment traffic on saturated subsoil to prevent severe deep compaction pans.'
    ],
    createdAt: '2026-09-18T10:30:00Z',
    isSystemPreset: true,
  },
  {
    id: 'rule-cover-crop-failure',
    name: 'Cover Crop Emergence & Germination Deficit',
    description: 'Flags newly planted cover crops where surface moisture is under 18% with low satellite biomass emergence.',
    enabled: true,
    severity: 'warning',
    logicalOperator: 'AND',
    conditions: [
      { id: 'c1', metric: 'surface_moisture', operator: 'less_than', thresholdValue: 18, unit: '% VWC' },
      { id: 'c2', metric: 'ndvi_current', operator: 'less_than', thresholdValue: 0.40, unit: 'NDVI' }
    ],
    persistenceDuration: '3_cycles',
    cropFilter: 'ALL',
    mitigationWorkflow: [
      'Conduct ground-truth seedling counts (target > 15 live seedlings/sq ft for rye mixes).',
      'Evaluate light irrigation or furrow wetting to stimulate radical emergence if crust has formed.',
      'Consider broadcast overseeding into standing crop if primary stand viability is below 50%.'
    ],
    createdAt: '2026-09-20T14:15:00Z',
    isSystemPreset: true,
  },
  {
    id: 'rule-biomass-stagnation',
    name: 'Mid-Season Biomass Stagnation Anomaly',
    description: 'Identifies fields where NDVI has flatlined or dropped below 0.60 during peak vegetative vegetative growth stages.',
    enabled: true,
    severity: 'warning',
    logicalOperator: 'AND',
    conditions: [
      { id: 'c1', metric: 'ndvi_current', operator: 'less_than', thresholdValue: 0.60, unit: 'NDVI' },
      { id: 'c2', metric: 'root_zone_moisture', operator: 'less_than', thresholdValue: 24, unit: '% VWC' }
    ],
    persistenceDuration: '2_cycles',
    cropFilter: 'ALL',
    mitigationWorkflow: [
      'Deploy drone multispectral flight or in-field SPAD chlorophyll meter to differentiate nitrogen deficiency from water stress.',
      'Check for subterranean root nematode or corn rootworm feeding.',
      'Review historical yield maps to verify if subsoil spatial variability is the limiting driver.'
    ],
    createdAt: '2026-09-22T09:00:00Z',
    isSystemPreset: true,
  },
  {
    id: 'rule-surface-crusting',
    name: 'Rapid Surface Desiccation & Crusting Warning',
    description: 'High temperature (>85°F) and low surface moisture (<16%) following rain creates dense soil crusting blocking emergence.',
    enabled: false,
    severity: 'warning',
    logicalOperator: 'AND',
    conditions: [
      { id: 'c1', metric: 'surface_moisture', operator: 'less_than', thresholdValue: 16, unit: '% VWC' },
      { id: 'c2', metric: 'temperature_max', operator: 'greater_than', thresholdValue: 85, unit: '°F' }
    ],
    persistenceDuration: 'immediate',
    cropFilter: 'ALL',
    mitigationWorkflow: [
      'Run rotary hoe or shallow vertical tillage at 8-10 mph to fracture surface crust without dislodging germinating seed.',
      'Maintain mulch cover in future seasons to prevent solar baking of exposed bare soil.'
    ],
    createdAt: '2026-09-25T11:00:00Z',
    isSystemPreset: true,
  }
];

export function getPersistenceLabel(duration: CustomAlertRule['persistenceDuration']): string {
  switch (duration) {
    case 'immediate':
      return 'Immediate Trigger (Single Telemetry Scan)';
    case '2_cycles':
      return 'Persisting for 2+ Consecutive Scans (~14 Days)';
    case '3_cycles':
      return 'Persisting for 3+ Consecutive Scans (~21 Days)';
    case '4_weeks':
      return 'Chronic Persistence (> 28 Days)';
    default:
      return 'Standard Persistence';
  }
}

export function evaluateFieldAgainstRule(
  field: Field,
  rule: CustomAlertRule,
  simulatedWeather?: { precip7DayMm?: number; precip14DayMm?: number; tempMaxF?: number }
): CompoundAlertEvaluationResult | null {
  if (!rule.enabled) return null;

  // Check crop filter
  if (rule.cropFilter !== 'ALL') {
    const cropMatches = field.cropType.toLowerCase().includes(rule.cropFilter.toLowerCase());
    if (!cropMatches) return null;
  }

  // Derive field telemetry metrics
  const rootZoneMoisture = field.rootZoneMoisturePct;
  const surfaceMoisture = field.surfaceMoisturePct;
  const currentNdvi = field.currentNDVI;
  const ndviTrend = field.ndviTrend; // 'improving' | 'stable' | 'stressed'
  
  // Calculate synthetic 7-day and 14-day rainfall from moisture history or simulated input
  const lastPrecip = field.soilMoistureHistory?.[field.soilMoistureHistory.length - 1]?.precipitationMm || 45;
  const precip7Day = simulatedWeather?.precip7DayMm ?? (rootZoneMoisture < 20 ? 6 : Math.round(lastPrecip * 0.25));
  const precip14Day = simulatedWeather?.precip14DayMm ?? (rootZoneMoisture < 20 ? 12 : Math.round(lastPrecip * 0.5));
  const maxTempF = simulatedWeather?.tempMaxF ?? (rootZoneMoisture < 20 ? 88 : 78);

  const conditionResults: { condition: typeof rule.conditions[0]; satisfied: boolean; description: string }[] = [];

  for (const cond of rule.conditions) {
    let satisfied = false;
    let description = '';

    switch (cond.metric) {
      case 'root_zone_moisture': {
        if (cond.operator === 'less_than') {
          satisfied = rootZoneMoisture < cond.thresholdValue;
          description = `Root Moisture (${rootZoneMoisture}%) < Threshold (${cond.thresholdValue}%)`;
        } else if (cond.operator === 'greater_than') {
          satisfied = rootZoneMoisture > cond.thresholdValue;
          description = `Root Moisture (${rootZoneMoisture}%) > Threshold (${cond.thresholdValue}%)`;
        }
        break;
      }
      case 'surface_moisture': {
        if (cond.operator === 'less_than') {
          satisfied = surfaceMoisture < cond.thresholdValue;
          description = `Surface Moisture (${surfaceMoisture}%) < Threshold (${cond.thresholdValue}%)`;
        } else if (cond.operator === 'greater_than') {
          satisfied = surfaceMoisture > cond.thresholdValue;
          description = `Surface Moisture (${surfaceMoisture}%) > Threshold (${cond.thresholdValue}%)`;
        }
        break;
      }
      case 'ndvi_current': {
        if (cond.operator === 'less_than') {
          satisfied = currentNdvi < cond.thresholdValue;
          description = `Sentinel-2 NDVI (${currentNdvi.toFixed(2)}) < Threshold (${cond.thresholdValue.toFixed(2)})`;
        } else if (cond.operator === 'greater_than') {
          satisfied = currentNdvi > cond.thresholdValue;
          description = `Sentinel-2 NDVI (${currentNdvi.toFixed(2)}) > Threshold (${cond.thresholdValue.toFixed(2)})`;
        }
        break;
      }
      case 'ndvi_trend': {
        if (cond.operator === 'declining') {
          satisfied = ndviTrend === 'stressed' || (field.ndviHistory.length >= 2 && field.ndviHistory[field.ndviHistory.length - 1].ndvi < field.ndviHistory[field.ndviHistory.length - 2].ndvi);
          description = `NDVI Trend is Declining / Stressed (${ndviTrend})`;
        } else if (cond.operator === 'stagnant') {
          satisfied = ndviTrend === 'stable' || ndviTrend === 'stressed';
          description = `NDVI Trend is Stagnant/Sub-optimal (${ndviTrend})`;
        }
        break;
      }
      case 'precipitation_7day': {
        if (cond.operator === 'less_than') {
          satisfied = precip7Day < cond.thresholdValue;
          description = `7-Day Rain (${precip7Day} mm) < Threshold (${cond.thresholdValue} mm)`;
        } else if (cond.operator === 'greater_than') {
          satisfied = precip7Day > cond.thresholdValue;
          description = `7-Day Rain (${precip7Day} mm) > Threshold (${cond.thresholdValue} mm)`;
        }
        break;
      }
      case 'precipitation_14day': {
        if (cond.operator === 'less_than') {
          satisfied = precip14Day < cond.thresholdValue;
          description = `14-Day Rain (${precip14Day} mm) < Threshold (${cond.thresholdValue} mm)`;
        } else if (cond.operator === 'greater_than') {
          satisfied = precip14Day > cond.thresholdValue;
          description = `14-Day Rain (${precip14Day} mm) > Threshold (${cond.thresholdValue} mm)`;
        }
        break;
      }
      case 'temperature_max': {
        if (cond.operator === 'greater_than') {
          satisfied = maxTempF > cond.thresholdValue;
          description = `Max Air Temp (${maxTempF}°F) > Threshold (${cond.thresholdValue}°F)`;
        }
        break;
      }
      default:
        satisfied = false;
        description = 'Unknown metric condition';
    }

    conditionResults.push({ condition: cond, satisfied, description });
  }

  // Evaluate Logical Conjunction (AND vs OR)
  const isTriggered = rule.logicalOperator === 'AND'
    ? conditionResults.every((c) => c.satisfied)
    : conditionResults.some((c) => c.satisfied);

  if (!isTriggered) return null;

  // Build persistence verification description
  const persistenceSummary = getPersistenceLabel(rule.persistenceDuration);

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    fieldId: field.id,
    fieldName: field.name,
    farmId: field.farmId,
    severity: rule.severity,
    triggeredConditions: conditionResults.filter((c) => c.satisfied).map((c) => c.description),
    persistenceSummary,
    mitigationSteps: rule.mitigationWorkflow,
    triggeredAt: new Date().toISOString(),
  };
}

export function evaluateAllCustomRulesForFields(
  fields: Field[],
  rules: CustomAlertRule[]
): CompoundAlertEvaluationResult[] {
  const results: CompoundAlertEvaluationResult[] = [];
  for (const field of fields) {
    for (const rule of rules) {
      const evaluation = evaluateFieldAgainstRule(field, rule);
      if (evaluation) {
        results.push(evaluation);
      }
    }
  }
  return results;
}
