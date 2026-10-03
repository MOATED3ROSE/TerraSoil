export type UserPersona = 'farmer' | 'agronomist' | 'corporate' | 'auditor';

export type PracticeType = 
  | 'cover_crop'
  | 'no_till'
  | 'fertilizer_reduction'
  | 'grazing_rotation'
  | 'compost_biochar';

export type VerificationStatus = 'verified' | 'satellite_verified' | 'self_reported';

export interface PracticeRecord {
  id: string;
  fieldId: string;
  practiceType: PracticeType;
  title: string;
  dateImplemented: string;
  details: string;
  status: VerificationStatus;
  emissionReductionFactor: number; // MT CO2e / acre / year
  carbonEstimateMT: number; // Total MT CO2e sequestered or abated
  acreageApplied: number;
}

export interface NDVIPoint {
  date: string;
  ndvi: number;
  anomaly?: number;
}

export interface SoilMoisturePoint {
  month: string;
  surfaceMoisture: number; // % 0-10cm
  rootZoneMoisture: number; // % 10-40cm
  precipitationMm: number;
}

export interface HistoricalWeatherPoint {
  date: string;
  tempMax: number;
  tempMin: number;
  tempMean: number;
  precipitationMm: number;
  evapotranspirationMm: number;
  surfaceMoisturePct: number;
  rootZoneMoisturePct: number;
}

export interface WeatherTelemetryData {
  latitude: number;
  longitude: number;
  totalPrecipitationMm: number;
  avgTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  dailyHistory: HistoricalWeatherPoint[];
  monthlyHistory: SoilMoisturePoint[];
  isLive: boolean;
  lastFetched: string;
  error?: string;
}

export interface CropYieldEstimate {
  cropName: string;
  unit: string;
  baselineRegionalYield: number;
  projectedYieldPerAcre: number;
  percentageVsBaseline: number;
  totalFieldProduction: number;
  projectedRevenueUSD: number;
  benchmarkPricePerUnit: number;
  confidenceScorePct: number;
  drivers: {
    ndviContributionPct: number;
    moistureContributionPct: number;
    socResiliencePct: number;
    thermalStressPenaltyPct: number;
  };
  stages: {
    stageName: string;
    growthPhase: string;
    projectedYieldAtStage: number;
    ndviObserved: number;
    moistureAdequacy: string;
  }[];
}

export interface CarbonBreakdown {
  coverCropMT: number;
  noTillMT: number;
  fertilizerReductionMT: number;
  grazingRotationMT: number;
  compostBiocharMT: number;
  totalGrossMT: number;
  totalNetPerAcre: number;
  potentialRevenueUSD: number; // e.g. at $30/t CO2e
  somAccretion5YrPct: number; // Soil Organic Matter % gain
  waterCapacityGainGallons: number;
}

export type FieldNoteCategory = 
  | 'soil_compaction'
  | 'weed_pressure'
  | 'cover_crop_emergence'
  | 'moisture_ponding'
  | 'tile_drainage'
  | 'pest_disease'
  | 'observation'
  | 'soil_texture'
  | 'residue_cover'
  | 'crop_health_marker';

export type FieldNoteSeverity = 'info' | 'attention' | 'critical';

export interface FieldNote {
  id: string;
  fieldId: string;
  fieldName?: string;
  coordinates: [number, number]; // [lat, lng]
  title: string;
  content: string;
  category: FieldNoteCategory;
  severity: FieldNoteSeverity;
  createdAt: string;
  authorName?: string;
  tags?: string[];
}

// ================= PHYSICAL SOIL HEALTH MARKERS & GEOLOCATED CAMERA PHOTO =================
export type SoilHealthMarkerType = 
  | 'earthworm_biopores'
  | 'root_architecture'
  | 'aggregate_stability'
  | 'residue_cover'
  | 'compaction_pan'
  | 'soil_color_humus'
  | 'water_infiltration'
  | 'nodulation_biology'
  | 'other';

export interface SoilHealthPhoto {
  id: string;
  fieldId: string;
  fieldName: string;
  timestamp: string; // ISO string
  formattedDate: string; // e.g. "Oct 3, 2026 • 10:15 AM"
  coordinates: [number, number]; // [lat, lng]
  gpsAccuracyMeters?: number;
  imageDataUrl: string; // data:image/jpeg;base64,... or asset URL
  markerType: SoilHealthMarkerType;
  markerLabel: string;
  soilQualityRating: number; // 1 to 5 stars
  sampleDepthCm: string; // e.g. "0-15 cm (Topsoil)", "15-30 cm (Root Zone)", "30-60 cm (Subsoil)"
  notes: string;
  bioporeDensityPerSqFt?: number;
  residueCoveragePct?: number;
  compactionResistancePsi?: number;
  aggregateSlakeScore?: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  recordedBy: string;
  synced: boolean;
}

// ================= CUSTOM PERSISTENCE-BASED ALERTING RULES =================
export type PersistenceDuration = 'immediate' | '2_cycles' | '3_cycles' | '4_weeks';

export type AlertMetricTarget = 
  | 'root_zone_moisture' 
  | 'surface_moisture' 
  | 'ndvi_trend' 
  | 'ndvi_current' 
  | 'precipitation_7day' 
  | 'precipitation_14day' 
  | 'temperature_max';

export type ComparisonOperator = 'less_than' | 'greater_than' | 'equals' | 'declining' | 'stagnant' | 'between';

export interface AlertConditionItem {
  id: string;
  metric: AlertMetricTarget;
  operator: ComparisonOperator;
  thresholdValue: number;
  thresholdValueSecondary?: number; // for between
  unit: string;
}

export interface CustomAlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: MoistureAlertSeverity; // 'critical' | 'warning' | 'optimal'
  logicalOperator: 'AND' | 'OR';
  conditions: AlertConditionItem[];
  persistenceDuration: PersistenceDuration;
  cropFilter: string; // 'ALL' or specific crop e.g. 'corn'
  mitigationWorkflow: string[];
  createdAt: string;
  isSystemPreset?: boolean;
}

export interface CompoundAlertEvaluationResult {
  ruleId: string;
  ruleName: string;
  fieldId: string;
  fieldName: string;
  farmId: string;
  severity: MoistureAlertSeverity;
  triggeredConditions: string[];
  persistenceSummary: string;
  mitigationSteps: string[];
  triggeredAt: string;
}

export interface MultiYearYieldNdviPoint {
  year: number;
  yearLabel: string;
  cropName: string;
  peakNDVI: number;
  integratedNDVI: number;
  estimatedYield: number; // e.g. bu/acre
  unit: string;
  regionalBenchmarkYield: number;
  yieldAnomalyPct: number; // % above or below benchmark
  rainfallMm: number;
  regenerativePhase: string;
  soilMoistureAdequacyPct: number;
  socBufferFactor: number;
  managementNotes: string;
}

export interface Field {
  id: string;
  farmId: string;
  name: string;
  acreage: number;
  cropType: string;
  soilClassification: string; // e.g. "Mollisol (Typic Hapludolls) - Silty Clay Loam"
  baselineSOCPct: number; // Soil Organic Carbon % (e.g. 2.45%)
  baselineSOCStockTonsPerHa: number; // e.g. 54.2 t C/ha
  currentNDVI: number; // e.g. 0.76
  ndviTrend: 'improving' | 'stable' | 'stressed';
  ndviHistory: NDVIPoint[];
  soilMoistureHistory: SoilMoisturePoint[];
  surfaceMoisturePct: number;
  rootZoneMoisturePct: number;
  boundaryCoordinates: [number, number][]; // [lat, lng] polygon vertices
  centroid: [number, number];
  practices: PracticeRecord[];
  carbonBreakdown: CarbonBreakdown;
  fieldNotes?: FieldNote[];
}

export interface Farm {
  id: string;
  name: string;
  clientOrSupplierName: string;
  ownerName: string;
  region: string;
  stateOrCountry: string;
  totalAcreage: number;
  personaType: UserPersona;
  fields: Field[];
  verifiedPracticesPct: number;
  scope3Category?: string;
  auditStatus: 'Audit-Ready' | 'Under Review' | 'Draft';
}

export interface EmissionFactorConfig {
  methodology: 'USDA_COMET_FARM' | 'IPCC_TIER_1' | 'IPCC_TIER_2';
  coverCropRate: number; // t CO2e/ac/yr
  noTillRate: number;
  fertilizerReductionRate: number; // per 10% reduction
  grazingRotationRate: number;
  carbonPricePerTon: number; // default $30
}

export type MoistureAlertSeverity = 'critical' | 'warning' | 'optimal';

export interface MoistureAlert {
  id: string;
  fieldId: string;
  fieldName: string;
  cropType: string;
  currentRootZoneMoisturePct: number;
  criticalThresholdPct: number;
  severity: MoistureAlertSeverity;
  deficitPct: number;
  triggeredAt: string;
  isAcknowledged: boolean;
  mitigationSteps: string[];
}

export interface CropMoistureThresholdConfig {
  [cropKey: string]: number; // critical threshold in % VWC
}

// 4 Geographic Categories & Global Intelligence Explorer Layers
export type Continent = 'North America' | 'South America' | 'Europe' | 'Africa' | 'Asia' | 'Oceania';

export type CompassDirection = 'North' | 'South' | 'East' | 'West';

export type CostOfLivingTier = 'affordable' | 'moderate' | 'high' | 'premium';

export type MapColorMode = 'soil' | 'climate' | 'water' | 'commodity' | 'economics' | 'confidence' | 'geography';

export type GlobalMapLayerCategory = 
  | 'geography' 
  | 'soil' 
  | 'climate' 
  | 'water' 
  | 'commodity' 
  | 'economics' 
  | 'confidence';

export type DataConfidenceLevel = 'high' | 'moderate' | 'limited';

export type WaterRiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export type SoilClassificationCategory = 
  | 'mollisols_chernozems'
  | 'vertisols_fluvisols'
  | 'andisols_volcanic'
  | 'oxisols_alfisols';

export interface SoilCategoryDefinition {
  id: SoilClassificationCategory;
  name: string;
  shortName: string;
  badge: string;
  color: string;
  accentBg: string;
  borderClass: string;
  globalCoverage: string;
  primaryOrderTaxa: string;
  dominantTextures: string;
  specificCharacteristics: {
    morphologyAndHorizon: string;
    textureAndDrainage: string;
    chemicalCationExchange: string;
    bulkDensityAndPh: string;
    microbialActivity: string;
  };
  carbonSequestrationPotential: {
    annualRateRangeMTCO2ePerAcre: string;
    avgAnnualMTCO2ePerAcre: number;
    baselineSOCStockTonsCPerHa: string;
    somAccretion5YrTargetPct: string;
    sequestrationMechanism: string;
    recommendedRegenerativePractices: string[];
  };
}

export interface OperatingCostBreakdown {
  laborUSD: number;
  landRentUSD: number;
  fertilizerChemicalsUSD: number;
  fuelEnergyUSD: number;
  machineryEquipmentUSD: number;
  waterIrrigationUSD: number;
  logisticsUSD: number;
}

export interface ClimateProfile {
  annualPrecipitationMm: number;
  avgAnnualTempC: number;
  aridityIndex: number;
  droughtFrequencyScore: number; // 0-100
  gddGrowingDegreeDays: number;
  frostRisk: 'low' | 'moderate' | 'high';
  heatStressRisk: 'low' | 'moderate' | 'high';
  climateClassification: string; // e.g. "Humid Continental (Dfa)"
}

export interface WaterRiskProfile {
  waterAvailability: 'abundant' | 'moderate' | 'stressed' | 'critical';
  groundwaterStressIndex: number; // 1-5
  irrigationDependencePct: number;
  droughtRisk: WaterRiskLevel;
  rainfallReliabilityPct: number;
  basinName: string;
}

export interface CommodityProfile {
  primaryCommodity: string;
  allCommodities: string[];
  productionVolumeMMT: number;
  yieldVsGlobalBenchmarkPct: number;
  exportSharePct: number;
  majorExportMarkets: string[];
}

export interface RegionalCarbonProfile {
  agriGHGIntensityKgCO2ePerKg: number;
  soilCarbonStockTonsCPerHa: number;
  soilOrganicCarbonPct: number;
  annualSequestrationPotentialMTCO2ePerAcre: number;
  regenerativePracticeAdoptionPct: number;
  additionalityPotential: 'High' | 'Moderate' | 'Baseline';
}

export interface SupplyChainProfile {
  corporateScope3Coverage: 'High' | 'Moderate' | 'Emerging' | 'Limited';
  activeSuppliersCount: number;
  primaryDataSharePct: number;
  deforestationFreeCertified: boolean;
  euDeforestationRegulationCompliant: boolean;
}

export interface DataConfidenceProfile {
  confidenceLevel: DataConfidenceLevel;
  primaryDataPct: number;
  modeledDataPct: number;
  verifiedDataPct: number;
  spatialResolution: string;
  sourceAgency: string;
  referencePeriod: string;
  methodologyDescription: string;
}

export interface SubnationalRegion {
  id: string;
  name: string;
  type: 'state' | 'province' | 'agricultural_district' | 'river_basin';
  primaryCommodity: string;
  baselineSOCPct: number;
  operatingCostPerAcreUSD: number;
  waterRisk: WaterRiskLevel;
  confidence: DataConfidenceLevel;
  coordinates: [number, number];
}

export interface SoilHealthAndCarbonBenchmarks {
  baselineSOCPct: number; // e.g. 2.75%
  baselineStockTonsCPerHa: number; // e.g. 58.4 t C/ha
  soilPh: number; // e.g. 6.5
  bulkDensityGPerCm3: number; // e.g. 1.28 g/cm3
  cationExchangeCapacityCEC: number; // e.g. 22.4 meq/100g
  availableWaterCapacityPct: number; // e.g. 19.2% VWC
  soilTexture: string; // e.g. "Silty Clay Loam"
  majorSoilOrder: string; // e.g. "Mollisols (Typic Argiudolls)"
  topsoilMicrobialBiomassCarbonMgPerKg: number; // e.g. 410 mg/kg
  annualSequestrationPotentialMTCO2ePerAcre: {
    coverCropping: number; // e.g. 0.46 MT CO2e/ac/yr
    noTillOrStripTill: number; // e.g. 0.38 MT CO2e/ac/yr
    biocharCompost: number; // e.g. 0.65 MT CO2e/ac/yr
    rotationalGrazing: number; // e.g. 0.40 MT CO2e/ac/yr
    totalCombinedPotential: number; // e.g. 1.45 MT CO2e/ac/yr
  };
  somAccretion5YrTargetPct: number; // e.g. +0.45%
  somAccretion10YrTargetPct: number; // e.g. +0.92%
  soilDegradationRisk: 'low' | 'moderate' | 'high' | 'severe';
  additionalityConfidencePct: number; // e.g. 95%
  recommendedRegenerativePractices: string[];
}

export interface GeographicLocation {
  id: string;
  name: string;
  // Category 1 – Continent
  continent: Continent;
  // Category 2 – Country/Nation
  country: string;
  countryCode: string;
  // Category 3 – Location with compass directions (North, South, East, West)
  compassDirection: CompassDirection;
  subRegion: string;
  coordinates: [number, number]; // [lat, lng]
  
  // Agricultural Operating Cost (Replaces generic consumer cost of living)
  agOperatingCostPerAcreUSD: number;
  agInputCostIndex: number; // 100 = Global Average Baseline
  operatingCostBreakdown: OperatingCostBreakdown;
  
  // Legacy / Consumer fallback for backward compatibility
  approxCostOfLivingUSD: number;
  costOfLivingTier: CostOfLivingTier;
  costBreakdown: {
    monthlyHousingRentUSD: number;
    groceriesUSD: number;
    utilitiesEnergyUSD: number;
    transportationUSD: number;
  };
  livingCostIndex: number;

  agriculturalProfile?: {
    dominantCrops: string[];
    soilZone: string;
    climateType: string;
  };
  
  // Full Global Intelligence Dimensions
  climateProfile?: ClimateProfile;
  waterRiskProfile?: WaterRiskProfile;
  commodityProfile?: CommodityProfile;
  carbonProfile?: RegionalCarbonProfile;
  supplyChainProfile?: SupplyChainProfile;
  dataConfidenceProfile?: DataConfidenceProfile;
  subnationalRegions?: SubnationalRegion[];

  // Specific Soil Health and Carbon Sequestration Benchmarks Drill-down
  soilHealthBenchmarks?: SoilHealthAndCarbonBenchmarks;
  isNationalTerritoryPlaceholder?: boolean;
}

export interface CountryMasterInfo {
  code: string;
  name: string;
  continent: Continent;
  compassDirection: CompassDirection;
  approxAvgCostOfLivingUSD: number;
  capitalCity: string;
  coordinates: [number, number];
  primarySoilType: string;
  baselineSOCPct: number;
  carbonPotentialMTPerAcre: number;
  hasSpecificTerritories: boolean;
}

// ==========================================
// CORE PLATFORM & DATA FOUNDATION TYPES
// ==========================================

export type DataLineageStage = 
  | 'raw_origin'           // Sentinel-2 L2A BOA / In-Situ Soil Core / Machinery Telemetry
  | 'ingestion_clean'      // Atmospheric correction, cloud-masking, georeferencing
  | 'agronomic_evidence'   // Operator practice ledger, seed & fertilizer invoices, shapefile boundary
  | 'calculation_model'    // USDA COMET-Farm / IPCC Tier 1 & 2 / RothC model logic
  | 'uncertainty_discount' // Monte Carlo 95% CI & Permanence/Leakage deduction buffer
  | 'verified_issuance';   // Cryptographic Merkle/SHA-256 seal, ISO 14064-2 & GHG Protocol claim

export interface LineagePayloadItem {
  key: string;
  label: string;
  value: string | number;
  unit?: string;
  status?: 'verified' | 'computed' | 'raw' | 'calibrated';
}

export interface LineageNode {
  id: string;
  stage: DataLineageStage;
  stageIndex: number;
  title: string;
  subtitle: string;
  timestamp: string;
  sourceSystem: string;
  locationRef?: string;
  methodologyOrSensor: string;
  formulaDisplay?: string;
  confidenceScorePct: number;
  sha256Checksum: string;
  auditStatus: 'verified' | 'validated' | 'pending' | 'flagged';
  verifiedBy: string;
  summaryMetrics: {
    primaryValue: string;
    primaryLabel: string;
    secondaryValue?: string;
    secondaryLabel?: string;
  };
  payload: LineagePayloadItem[];
  isoStandard?: string;
  rawJsonSnippet?: string;
}

export interface FieldDataLineage {
  fieldId: string;
  fieldName: string;
  farmId: string;
  farmName: string;
  lineageRootHash: string;
  generatedAt: string;
  totalGrossMT: number;
  totalNetPerAcre: number;
  methodology: string;
  overallConfidencePct: number;
  nodes: LineageNode[];
  auditChainLength: number;
  complianceCertificates: {
    name: string;
    standard: string;
    status: string;
    signatureDate: string;
  }[];
}

export type PermissionAccessLevel = 'ALLOW' | 'READ_ONLY' | 'REQUIRES_APPROVAL' | 'PROHIBITED';

export interface RoleCapability {
  id: string;
  category: 'Spatial & Field GIS' | 'Soil Telemetry & Samples' | 'Practice Evidence' | 'MRV Science Engine' | 'Carbon Credit Ledger' | 'Governance & Privacy';
  label: string;
  description: string;
  farmer: PermissionAccessLevel;
  agronomist: PermissionAccessLevel;
  corporate: PermissionAccessLevel;
  auditor: PermissionAccessLevel;
  governingStandard: string;
}

export interface SharedDataEntitySchema {
  entityName: string;
  tableName: string;
  description: string;
  primaryKey: string;
  foreignKeys: string[];
  fields: {
    name: string;
    type: string;
    description: string;
    required: boolean;
    piiOrConfidential: boolean;
  }[];
  dataSources: string[];
  refreshFrequency: string;
}

// ==========================================
// AUDITOR / VERIFIER ROLE (PHASE 5 PRD)
// ==========================================

export type FindingSeverity = 'critical' | 'major' | 'minor' | 'observation';

export type FindingResolutionStatus = 'open' | 'under_review' | 'corrected' | 'closed';

export type VerificationStage = 'submitted' | 'under_review' | 'finding' | 'corrected' | 'verified';

export interface VerificationFinding {
  id: string;
  fieldId: string;
  fieldName: string;
  farmId: string;
  farmName: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  relatedMetric: string;
  requiredCorrectiveAction: string;
  dueDate: string;
  resolutionStatus: FindingResolutionStatus;
  resolutionNotes?: string;
  flaggedBy: string;
  flaggedAt: string;
  resolvedAt?: string;
  evidenceDocRef?: string;
}

export interface AuditTrailEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserPersona | 'system';
  actionType: 'create' | 'update' | 'delete' | 'review' | 'approve' | 'flag' | 'verify';
  entityType: 'field' | 'practice' | 'telemetry' | 'carbon_calculation' | 'methodology_change' | 'audit_finding';
  entityId: string;
  entityName: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  sha256Signature: string;
  complianceStandard: string;
}

export interface VerificationEngagement {
  id: string;
  scopeName: string;
  targetStandard: 'ISO 14064-3' | 'GHG Protocol LSR' | 'SBTi FLAG' | 'USDA COMET-Farm';
  assuranceLevel: 'Limited Assurance' | 'Reasonable Assurance';
  status: VerificationStage;
  progressPct: number;
  totalItems: number;
  verifiedItems: number;
  openFindingsCount: number;
  leadAuditor: string;
  verifierOrg: string;
  auditPeriod: string;
}

// ==========================================
// SECONDARY & EXTENDED ROLES (PHASE 5 PRD)
// ==========================================

export type ExtendedRoleType = 
  | 'landowner_manager'
  | 'field_tech'
  | 'soil_lab'
  | 'buyer_processor'
  | 'program_admin'
  | 'platform_admin';

// 1. Landowner / Farm Manager (§2)
export type FarmStakeholderRole = 'owner' | 'operator' | 'tenant_farmer' | 'land_manager';

export interface FarmStakeholder {
  id: string;
  name: string;
  email: string;
  role: FarmStakeholderRole;
  ownershipSharePct: number;
  permissionScope: 'view_only' | 'full_management' | 'financial_reports';
  linkedFieldIds: string[];
  lastActive: string;
}

// 2. Field Technician / Data Collector (§3)
export interface FieldSamplingTask {
  id: string;
  fieldId: string;
  fieldName: string;
  farmName: string;
  taskType: 'soil_core' | 'gps_boundary_survey' | 'canopy_photo' | 'practice_audit';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  assignedTechnician: string;
  gpsCoordinates: [number, number];
  photoEvidenceCount: number;
  notes?: string;
  completedAt?: string;
}

// 3. Soil Laboratory (§4)
export interface DirectLabUploadRecord {
  id: string;
  labName: string;
  labAccreditation: string; // ISO 17025 / NAPT
  labSampleId: string;
  fieldId: string;
  fieldName: string;
  farmName: string;
  sampleDepthRange: '0-10 cm' | '10-30 cm' | '30-60 cm';
  socConcentrationPct: number;
  bulkDensityGcm3: number;
  lecoMethodology: string;
  qaQcDuplicateVariancePct: number;
  uploadedAt: string;
  status: 'ingested' | 'pending_qa';
}

// 4. Buyer / Processor / Food Company (§5)
export interface CommodityProcurementScorecard {
  id: string;
  commodity: 'Corn' | 'Soybeans' | 'Wheat' | 'Canola' | 'Dairy' | 'Cotton';
  region: string;
  purchasedVolumeTons: number;
  carbonIntensityKgCO2ePerKg: number;
  conventionalBenchmarkKgCO2e: number;
  lowCarbonPremiumUSD: number;
  anonymizedSupplierCount: number;
  tier1PrimarySharePct: number;
}

// 5. Program / NGO / Grant Administrator (§6)
export interface SustainabilityGrantProgram {
  id: string;
  name: string;
  fundingAgency: string;
  totalFundingUSD: number;
  disbursedFundingUSD: number;
  enrolledFarmsCount: number;
  eligiblePractices: string[];
  incentiveRatePerAcreUSD: number;
  applicationsPendingReview: number;
  applicationDeadline: string;
}

export interface GrantApplicationItem {
  id: string;
  programId: string;
  farmName: string;
  applicantName: string;
  requestedFundingUSD: number;
  acreageEnrolled: number;
  practicesProposed: string[];
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedDate: string;
  carbonReductionPotentialMT: number;
}

// 6. Platform Administrator (§7)
export interface SystemIntegrationStatus {
  id: string;
  name: string;
  category: 'satellite' | 'weather' | 'soil_database' | 'payment_billing' | 'lab_api';
  endpoint: string;
  latencyMs: number;
  status: 'operational' | 'degraded' | 'syncing';
  lastSyncTime: string;
  errorRatePct: number;
}

export interface MethodologyLibraryVersion {
  id: string;
  name: string;
  version: string;
  releaseDate: string;
  standard: string;
  activeImplementationsCount: number;
  isCurrentDefault: boolean;
  notes: string;
}

// ==========================================
// LOCAL FIELD PARCEL GIS ADVANCED TYPES
// ==========================================
export type GISMapLayerType = 
  | 'satellite' 
  | 'ndvi' 
  | 'soc' 
  | 'moisture' 
  | 'weather_heatmap'
  | 'ssurgo' 
  | 'elevation' 
  | 'zones' 
  | 'practices';

export type GISBaseMapType = 
  | 'esri_satellite' 
  | 'carto_dark' 
  | 'osm_standard' 
  | 'usgs_topo';

export interface GISManagementZone {
  id: string;
  fieldId: string;
  name: string;
  zoneType: 'high_biomass' | 'transition' | 'conservation_buffer' | 'waterway_margin';
  acreage: number;
  socPct: number;
  ndvi: number;
  moisturePct: number;
  soilTexture: string;
  slopePct: number;
  color: string;
  boundaryCoordinates: [number, number][];
  prescriptionRateN: string;
  carbonCreditPotentialMT: number;
  recommendations: string;
}

export interface GISSamplePoint {
  id: string;
  fieldId: string;
  sampleCode: string;
  coordinates: [number, number];
  depthCm: string;
  status: 'planned' | 'collected' | 'lab_transit' | 'assayed';
  collectionDate: string;
  labName: string;
  technicianName: string;
  socPct: number;
  bulkDensityGcm3: number;
  activeCarbonPoxcMgKg: number;
  ph: number;
  totalN: number;
  olsenP: number;
  kPpm: number;
  hashSha256: string;
  certificateId: string;
}

export interface GISEvidencePin {
  id: string;
  fieldId: string;
  coordinates: [number, number];
  category: 'soil_core' | 'satellite_ground_truth' | 'machinery_telematics' | 'drone_ortho' | 'practice_photo' | 'scout_flag';
  title: string;
  description: string;
  timestamp: string;
  author: string;
  verified: boolean;
  mediaType?: 'photo' | 'telematics' | 'lab_pdf' | 'drone_layer';
  mediaPreviewUrl?: string;
  confidenceScorePct: number;
  metadata?: {
    tractorSpeedMph?: number;
    seedRateLbsAc?: number;
    depthCm?: number;
    sensorSerial?: string;
    droneAltitudeM?: number;
    resolutionCmPerPx?: number;
  };
}

export interface GISTimelineStep {
  id: string;
  stepIndex: number;
  dateLabel: string;
  season: string;
  year: number;
  fieldNdvi: number;
  fieldSocPct: number;
  fieldMoisturePct: number;
  activePracticesCount: number;
  practiceEvents: string[];
  satelliteDescription: string;
  soilResilienceScore: number;
}

export interface GISCarbonLedgerRecord {
  vintageYear: number;
  grossRemovalsMT: number;
  avoidedEmissionsMT: number;
  baselineEmissionsMT: number;
  bufferPoolDeductionMT: number; // e.g. 15% permanence buffer
  netIssuedCreditsMT: number;
  carbonPriceUSD: number;
  totalGrossValueUSD: number;
  serialNumber: string;
  hashSha256: string;
  verificationBody: string;
  status: 'issued' | 'pending_audit' | 'retired';
}

export interface GISParcelAlert {
  id: string;
  fieldId: string;
  alertType: 'moisture_stress' | 'runoff_risk' | 'verification_due' | 'lab_sample_expired' | 'cover_crop_window';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  actionableGuidance: string;
  metricValue?: string;
  resolved: boolean;
}

// =========================================================================
// MAP INTEGRATION, SHARED ARCHITECTURE & SIGNATURE FEATURES (PRD-09)
// =========================================================================

export type EntityRelationshipTier = 
  | 'global_region'
  | 'country'
  | 'subnational_region'
  | 'supplier_farm'
  | 'field'
  | 'zone'
  | 'observation_practice'
  | 'measurement'
  | 'evidence'
  | 'carbon_soil_result';

export interface UnifiedEntityRelationNode {
  id: string;
  tier: EntityRelationshipTier;
  tierIndex: number; // 0 to 9
  label: string;
  entityName: string;
  parentId?: string;
  attributes: Record<string, string | number | boolean>;
  verificationHash?: string;
  confidence: 'High' | 'Moderate' | 'Limited';
  provenanceSource: string;
}

export interface ExplainThisMetricContext {
  metricName: string;
  metricValue: string | number;
  unit: string;
  fieldOrRegionName: string;
  soilClassification: string;
  climateZone: string;
  historicalSOCTrend: string;
  managementPractices: string[];
  physicalMeasurementsSummary: string;
  confidenceLevel: 'High' | 'Moderate' | 'Limited';
  spatialResolution: string;
  sourceCitations: string[];
  empiricalModelFormula: string;
  confidenceDrivers: {
    inSituCoresSampled: boolean;
    satelliteCalibrated: boolean;
    machineryLogsIngested: boolean;
    independentAuditorReviewed: boolean;
  };
}

export interface RegionalBenchmarkMetric {
  metricKey: string;
  label: string;
  activeFarmValue: number;
  similarFarmsAvg: number;
  regionalBenchmark: number;
  globalBenchmark: number;
  unit: string;
  status: 'superior' | 'average' | 'opportunity';
  interpretation: string;
}

export interface SimilarFarmMatch {
  id: string;
  farmName: string;
  region: string;
  stateCountry: string;
  totalAcres: number;
  dominantSoilOrder: string;
  climateType: string;
  dominantCrops: string[];
  baselineSOCPct: number;
  annualSequestrationRate: number;
  similarityScorePct: number;
  matchingFactors: string[];
  topPractice: string;
}

export interface RegionalScenarioSimulation {
  id: string;
  scenarioName: string;
  adoptionPercentage: number; // 10% to 100%
  targetPractice: 'cover_crop' | 'no_till' | 'nutrient_reduction' | 'combined_stack';
  enrolledAcresRegional: number;
  totalAnnualCarbonGainMT: number;
  cumulative5YrCarbonGainMT: number;
  waterRetentionIncreaseMGallons: number;
  syntheticNitrogenAbatedTons: number;
  farmerEconomicPayoutUSD: number;
  corporateScope3AbatementUSDPerTon: number;
}

// ==========================================
// PRD-AUTH: AUTHENTICATION, SESSIONS & SECURITY
// ==========================================

export type MFAMethod = 'authenticator' | 'sms' | 'email' | 'none';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserPersona;
  organization: string;
  jobTitle?: string;
  avatarUrl?: string;
  mfaEnabled: boolean;
  mfaMethod: MFAMethod;
  mfaSecret?: string;
  recoveryEmail?: string;
  createdAt: string;
  lastLoginAt: string;
  termsAccepted: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isCurrentSession: boolean;
  lastActive: string;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  userId: string;
  type: 'new_device' | 'unusual_location' | 'password_changed' | 'mfa_enabled' | 'session_revoked';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  device: string;
  location: string;
  ipAddress: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface OnboardingState {
  role: UserPersona;
  step: 'role_selection' | 'account_details' | 'org_setup' | 'mfa_setup' | 'welcome';
  name: string;
  emailOrPhone: string;
  password: string;
  organizationName: string;
  operationScale: string;
  enableMfa: boolean;
  mfaMethod: MFAMethod;
}

// ==========================================
// PRD: USER PROFILE & PERSONAL WORKSPACE
// ==========================================

export interface PersonalActivityJournalEntry {
  id: string;
  timestamp: string;
  dateGroup: 'Today' | 'Yesterday' | 'This Week' | 'Earlier';
  timeStr: string;
  actionType: 'field_updated' | 'soil_sample_added' | 'report_generated' | 'recommendation_created' | 'practice_logged' | 'evidence_uploaded' | 'map_saved';
  title: string;
  detail: string;
  targetName: string;
  targetType: 'field' | 'farm' | 'report' | 'evidence' | 'project';
  targetId?: string;
  actionLabel?: string;
  actionTab?: 'map' | 'satellite' | 'practices' | 'estimator' | 'tutorial';
}

export interface WorkspaceProjectTimelineEvent {
  id: string;
  dateStr: string;
  status: 'done' | 'warning' | 'info' | 'pending';
  title: string;
  notes?: string;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  farmId?: string;
  farmName: string;
  fieldsCount: number;
  acres: number;
  progressPct: number;
  lastActivity: string;
  nextTask: string;
  status: 'active' | 'in_review' | 'completed';
  primaryPractice: string;
  timeline: WorkspaceProjectTimelineEvent[];
}

export interface EvidenceLibraryItem {
  id: string;
  title: string;
  category: 'Soil Tests' | 'Fertilizer Records' | 'Farm Records' | 'Invoices' | 'Practice Verification' | 'Satellite Evidence' | 'Reports' | 'Field Photos';
  fieldId?: string;
  fieldName: string;
  farmName: string;
  uploadDate: string;
  fileType: 'pdf' | 'csv' | 'jpg' | 'png' | 'geotiff';
  fileSizeStr: string;
  verificationStatus: 'verified' | 'pending_audit' | 'flagged';
  cryptographicHash: string;
  uploadedBy: string;
  previewUrl?: string;
  description?: string;
}

export interface SavedMapView {
  id: string;
  name: string;
  system: 'Local GIS' | 'Geographic Map';
  layer: string;
  fieldOrRegionName: string;
  savedDateStr: string;
  notes?: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
}

export interface SavedReportItem {
  id: string;
  title: string;
  type: 'Farm Sustainability Dossier' | 'Scope 3 Supplier Inset Report' | 'Soil Carbon Baseline Assessment' | 'ISO 14064-3 Audit Dossier' | 'One-Time Grant Verification';
  farmName: string;
  dateGenerated: string;
  status: 'Final' | 'Draft' | 'Verified';
  fileSizeStr: string;
  downloadUrl?: string;
  summaryMetrics?: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  farmOrFieldName: string;
  dueDateStr: string;
  isOverdue: boolean;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  category: 'soil_sampling' | 'practice_log' | 'report' | 'evidence_upload' | 'verification';
}

export interface WorkspaceNotification {
  id: string;
  title: string;
  message: string;
  type: 'upload' | 'verification' | 'anomaly' | 'deadline' | 'weather';
  severity: 'info' | 'warning' | 'urgent';
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionTab?: string;
}

export interface ProfessionalIdentityProfile {
  specializations: string[];
  regionsServed: string[];
  certifications: string[];
  yearsExperience: number;
  licenseNumber: string;
  verifiedProfessional: boolean;
  verificationRegistry: string;
  bio: string;
  contactPublic: boolean;
}

// =========================================================================
// PRD-12: ORGANIZATION, PERMISSIONS, AUDIT & APPLICATION SHELL
// =========================================================================

export type ConcreteOrgRole = 
  | 'org_owner' 
  | 'agronomist' 
  | 'farmer' 
  | 'corporate_analyst' 
  | 'auditor';

export interface OrgUserMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: ConcreteOrgRole;
  roleDisplayName: string;
  organizationId: string;
  assignedFarms: {
    farmId: string;
    farmName: string;
    acreage: number;
    fieldsCount: number;
  }[];
  seatStatus: 'active' | 'pending_invite' | 'suspended';
  joinedDate: string;
  lastActiveDate: string;
  avatarUrl?: string;
}

export interface OrganizationHierarchy {
  id: string;
  name: string;
  legalEntityName: string;
  domain: string;
  tier: 'Starter' | 'Professional' | 'Corporate Enterprise';
  subscriptionPricePerMo: number;
  seatsAllocated: number;
  seatsTotal: number;
  ownerUserId: string;
  ownerName: string;
  members: OrgUserMember[];
  farmsCount: number;
  totalAcres: number;
  activeProjectsCount: number;
}

export interface ConcretePermissionRule {
  role: ConcreteOrgRole;
  roleDisplayName: string;
  canManageBilling: boolean;
  canInviteUsers: boolean;
  canManagePermissions: boolean;
  canViewAllFarms: boolean;
  canExportData: boolean;
  canEditFarms: boolean;
  canCreateRecommendations: boolean;
  canGenerateReports: boolean;
  canEditOwnFarm: boolean;
  canUploadEvidence: boolean;
  canViewRecommendations: boolean;
  canViewSupplierData: boolean;
  canAnalyzeScope3: boolean;
  canReviewAndComment: boolean;
  canApproveVerification: boolean;
  canAccessEvidence: boolean;
  canChangeUnderlyingMeasurements: boolean; // CRITICAL: strictly false for Auditor!
  governingConstraint: string;
}

export interface DataAuditLogEntry {
  id: string;
  user: string;
  userRole: ConcreteOrgRole | string;
  action: string;
  targetType: 'field_soc' | 'practice_record' | 'soil_sample' | 'baseline_config' | 'field_boundary' | 'permission_change';
  fieldName: string;
  fieldId?: string;
  farmName: string;
  previousValue: string;
  newValue: string;
  reason: string;
  evidenceDocName?: string;
  evidenceId?: string;
  timestamp: string; // e.g. "Oct 3, 2026 14:32"
  sha256Checksum: string;
  ipAddress: string;
  verificationAuditSignoff?: boolean;
}

export interface CommandCenterRoleFocus {
  role: UserPersona;
  commandCenterTitle: string;
  focusPillars: string; // e.g. "Farm Health · Actions · ROI · Evidence"
  kpiOverview: {
    label: string;
    value: string;
    sublabel: string;
    accentColor: string;
  }[];
  quickActions: {
    label: string;
    actionTab: 'map' | 'satellite' | 'practices' | 'estimator' | 'workspace' | 'tutorial';
    iconName: string;
  }[];
  activeAlertsSummary: string;
}








