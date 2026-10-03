import { Field, MoistureAlert, CropMoistureThresholdConfig, MoistureAlertSeverity } from '../types';

export const DEFAULT_CROP_MOISTURE_THRESHOLDS: CropMoistureThresholdConfig = {
  corn: 25,       // % VWC - Corn is sensitive during V12 through R2 (silking/blister)
  soybean: 22,    // % VWC - Soybeans sensitive during R3 (pod set) and R5 (seed fill)
  wheat: 18,      // % VWC - Winter & spring wheat have deep extraction, critical during heading
  oat: 20,        // % VWC - Oats sensitive during panicle emergence and milk stage
  pasture: 20,    // % VWC - Forage grasses need >20% to avoid root dormancy
  forage: 20,     // % VWC
  sorghum: 18,    // % VWC - High drought tolerance
  default: 22,    // % VWC
};

export function getCriticalMoistureThreshold(
  cropType: string,
  customConfig?: CropMoistureThresholdConfig
): number {
  const config = { ...DEFAULT_CROP_MOISTURE_THRESHOLDS, ...(customConfig || {}) };
  const lower = cropType.toLowerCase();

  if (lower.includes('corn') || lower.includes('maize')) return config.corn;
  if (lower.includes('soy')) return config.soybean;
  if (lower.includes('wheat')) return config.wheat;
  if (lower.includes('oat')) return config.oat;
  if (lower.includes('pasture') || lower.includes('graz') || lower.includes('grass')) return config.pasture;
  if (lower.includes('forage')) return config.forage;
  if (lower.includes('sorghum') || lower.includes('milo')) return config.sorghum;

  return config.default;
}

export function evaluateFieldMoistureAlert(
  field: Field,
  customConfig?: CropMoistureThresholdConfig,
  liveRootZoneMoisture?: number
): MoistureAlert | null {
  const rootMoisture = typeof liveRootZoneMoisture === 'number' 
    ? liveRootZoneMoisture 
    : field.rootZoneMoisturePct;

  const threshold = getCriticalMoistureThreshold(field.cropType, customConfig);
  const deficit = threshold - rootMoisture;

  // If moisture is at or above threshold, no alert needed
  if (deficit <= 0) {
    return null;
  }

  let severity: MoistureAlertSeverity = 'warning';
  if (deficit >= 6 || rootMoisture <= 18) {
    severity = 'critical';
  }

  // Crop-specific actionable mitigation guidelines
  const mitigationSteps: string[] = [];
  const cropLower = field.cropType.toLowerCase();

  if (cropLower.includes('corn')) {
    mitigationSteps.push('Prioritize immediate supplemental irrigation if center-pivot available (target 1.0–1.5 inches).');
    mitigationSteps.push('Maintain standing surface residue to reduce midday solar evaporative flux.');
    mitigationSteps.push('Delay non-essential foliar nitrogen or herbicide passes to avoid aggravating thermal stress.');
  } else if (cropLower.includes('soy')) {
    mitigationSteps.push('Trigger deficit irrigation before pod abortion threshold is reached.');
    mitigationSteps.push('Monitor for spider mite outbreaks, which thrive in low-moisture canopy microclimates.');
    mitigationSteps.push('Minimize mechanical field passes to prevent shallow rooting disruption.');
  } else if (cropLower.includes('wheat') || cropLower.includes('oat')) {
    mitigationSteps.push('Assess grain fill stage; if pre-dough, provide hydration to safeguard test weight.');
    mitigationSteps.push('Preserve interseeded legume groundcover to buffer subsoil capillary draw.');
  } else {
    mitigationSteps.push('Reduce rotational grazing stocking density; increase pasture recovery rest periods.');
    mitigationSteps.push('Protect soil organic matter mulch layer to conserve remaining volumetric water content.');
  }

  return {
    id: `alert-${field.id}-${Date.now()}`,
    fieldId: field.id,
    fieldName: field.name,
    cropType: field.cropType,
    currentRootZoneMoisturePct: rootMoisture,
    criticalThresholdPct: threshold,
    severity,
    deficitPct: Number(deficit.toFixed(1)),
    triggeredAt: new Date().toISOString(),
    isAcknowledged: false,
    mitigationSteps,
  };
}
