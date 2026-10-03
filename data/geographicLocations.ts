import { 
  GeographicLocation, 
  SoilHealthAndCarbonBenchmarks, 
  CostOfLivingTier,
  OperatingCostBreakdown,
  ClimateProfile,
  WaterRiskProfile,
  CommodityProfile,
  RegionalCarbonProfile,
  SupplyChainProfile,
  DataConfidenceProfile,
  SubnationalRegion,
  DataConfidenceLevel,
  WaterRiskLevel
} from '../types';
import { ALL_WORLD_COUNTRIES } from './allWorldCountries';

export function createSoilBenchmarks(
  soilType: string,
  baselineSOC: number,
  carbonPotential: number,
  dominantCrops: string[]
): SoilHealthAndCarbonBenchmarks {
  const stock = Number((baselineSOC * 21.8).toFixed(1));
  const coverCropRate = Number((carbonPotential * 0.35).toFixed(2));
  const noTillRate = Number((carbonPotential * 0.28).toFixed(2));
  const biocharRate = Number((carbonPotential * 0.45).toFixed(2));
  const grazingRate = Number((carbonPotential * 0.30).toFixed(2));
  const totalCombined = Number((coverCropRate + noTillRate + biocharRate).toFixed(2));

  let degradationRisk: 'low' | 'moderate' | 'high' | 'severe' = 'moderate';
  if (baselineSOC < 1.5) degradationRisk = 'high';
  else if (baselineSOC >= 3.0) degradationRisk = 'low';

  const ph = Number((6.2 + ((baselineSOC * 10) % 1.2)).toFixed(1));
  const bulkDensity = Number((1.38 - (baselineSOC * 0.06)).toFixed(2));
  const cec = Number((18 + baselineSOC * 3.5).toFixed(1));
  const awc = Number((15 + baselineSOC * 2.2).toFixed(1));

  return {
    baselineSOCPct: baselineSOC,
    baselineStockTonsCPerHa: stock,
    soilPh: ph,
    bulkDensityGPerCm3: bulkDensity,
    cationExchangeCapacityCEC: cec,
    availableWaterCapacityPct: awc,
    soilTexture: soilType.includes('Clay') ? 'Clay Loam' : soilType.includes('Sand') ? 'Sandy Loam' : 'Silt Loam',
    majorSoilOrder: soilType,
    topsoilMicrobialBiomassCarbonMgPerKg: Math.round(280 + baselineSOC * 65),
    annualSequestrationPotentialMTCO2ePerAcre: {
      coverCropping: coverCropRate,
      noTillOrStripTill: noTillRate,
      biocharCompost: biocharRate,
      rotationalGrazing: grazingRate,
      totalCombinedPotential: totalCombined,
    },
    somAccretion5YrTargetPct: Number((baselineSOC * 0.16).toFixed(2)),
    somAccretion10YrTargetPct: Number((baselineSOC * 0.32).toFixed(2)),
    soilDegradationRisk: degradationRisk,
    additionalityConfidencePct: Number((91 + (baselineSOC % 6)).toFixed(1)),
    recommendedRegenerativePractices: [
      `Overwinter multi-species cover crops before ${dominantCrops[0] || 'primary rotation'}`,
      'Transition to 100% continuous no-till / direct drilling',
      'Biological humic inoculants & composted manure amendment',
      'Rotational biomass residue retention to suppress evaporative loss',
    ],
  };
}

export function createOperatingCost(
  baseCostPerAcre: number,
  inputIndex: number
): { agOperatingCostPerAcreUSD: number; agInputCostIndex: number; operatingCostBreakdown: OperatingCostBreakdown } {
  return {
    agOperatingCostPerAcreUSD: baseCostPerAcre,
    agInputCostIndex: inputIndex,
    operatingCostBreakdown: {
      laborUSD: Math.round(baseCostPerAcre * 0.22),
      landRentUSD: Math.round(baseCostPerAcre * 0.28),
      fertilizerChemicalsUSD: Math.round(baseCostPerAcre * 0.24),
      fuelEnergyUSD: Math.round(baseCostPerAcre * 0.10),
      machineryEquipmentUSD: Math.round(baseCostPerAcre * 0.08),
      waterIrrigationUSD: Math.round(baseCostPerAcre * 0.04),
      logisticsUSD: Math.round(baseCostPerAcre * 0.04),
    },
  };
}

export function createClimateProfile(
  rainfallMm: number,
  tempC: number,
  gdd: number,
  classification: string
): ClimateProfile {
  return {
    annualPrecipitationMm: rainfallMm,
    avgAnnualTempC: tempC,
    aridityIndex: Number((rainfallMm / (tempC * 20 + 140)).toFixed(2)),
    droughtFrequencyScore: rainfallMm < 450 ? 68 : rainfallMm < 750 ? 35 : 12,
    gddGrowingDegreeDays: gdd,
    frostRisk: tempC < 8 ? 'high' : tempC < 14 ? 'moderate' : 'low',
    heatStressRisk: tempC > 22 ? 'high' : tempC > 16 ? 'moderate' : 'low',
    climateClassification: classification,
  };
}

export function createWaterRiskProfile(
  availability: 'abundant' | 'moderate' | 'stressed' | 'critical',
  irrigationPct: number,
  drought: WaterRiskLevel,
  basinName: string
): WaterRiskProfile {
  return {
    waterAvailability: availability,
    groundwaterStressIndex: availability === 'critical' ? 4.8 : availability === 'stressed' ? 3.6 : 1.8,
    irrigationDependencePct: irrigationPct,
    droughtRisk: drought,
    rainfallReliabilityPct: availability === 'abundant' ? 88 : availability === 'moderate' ? 74 : 52,
    basinName,
  };
}

export function createCommodityProfile(
  primary: string,
  all: string[],
  volumeMMT: number,
  yieldVsBench: number,
  exportShare: number,
  markets: string[]
): CommodityProfile {
  return {
    primaryCommodity: primary,
    allCommodities: all,
    productionVolumeMMT: volumeMMT,
    yieldVsGlobalBenchmarkPct: yieldVsBench,
    exportSharePct: exportShare,
    majorExportMarkets: markets,
  };
}

export function createCarbonProfile(
  ghgIntensity: number,
  socPct: number,
  sequestrationPotential: number,
  adoptionPct: number
): RegionalCarbonProfile {
  return {
    agriGHGIntensityKgCO2ePerKg: ghgIntensity,
    soilCarbonStockTonsCPerHa: Number((socPct * 21.8).toFixed(1)),
    soilOrganicCarbonPct: socPct,
    annualSequestrationPotentialMTCO2ePerAcre: sequestrationPotential,
    regenerativePracticeAdoptionPct: adoptionPct,
    additionalityPotential: socPct < 2.0 ? 'High' : socPct < 3.0 ? 'Moderate' : 'Baseline',
  };
}

export function createDataConfidence(
  level: DataConfidenceLevel,
  primaryPct: number,
  modeledPct: number,
  verifiedPct: number,
  agency: string
): DataConfidenceProfile {
  return {
    confidenceLevel: level,
    primaryDataPct: primaryPct,
    modeledDataPct: modeledPct,
    verifiedDataPct: verifiedPct,
    spatialResolution: '250m Sentinel-2 / FAO Harmonized World Soil',
    sourceAgency: agency,
    referencePeriod: '2024–2026 Observational Cycle',
    methodologyDescription: 'Empirical soil core calibrations linked with multi-spectral Sentinel-2 topsoil reflectance and IPCC Tier 2 / COMET-Farm emission factors.',
  };
}

export const INITIAL_DETAILED_LOCATIONS: GeographicLocation[] = [
  // ================= NORTH AMERICA =================
  {
    id: 'loc-na-north-1',
    name: 'Red River Valley & Northern Plains',
    continent: 'North America',
    country: 'United States',
    countryCode: 'US',
    compassDirection: 'North',
    subRegion: 'North: North Dakota & Minnesota Border Basin',
    coordinates: [47.9253, -97.0329],
    ...createOperatingCost(385, 78),
    approxCostOfLivingUSD: 2150,
    costOfLivingTier: 'moderate',
    costBreakdown: { monthlyHousingRentUSD: 920, groceriesUSD: 440, utilitiesEnergyUSD: 310, transportationUSD: 480 },
    livingCostIndex: 68,
    agriculturalProfile: {
      dominantCrops: ['Spring Wheat', 'Sugarbeets', 'Soybeans', 'Sunflowers'],
      soilZone: 'Rich Mollisols (Chernozems) with deep humic A-horizon',
      climateType: 'Humid Continental / Prairie (Dfb)',
    },
    climateProfile: createClimateProfile(540, 5.2, 2150, 'Humid Continental / Prairie (Dfb)'),
    waterRiskProfile: createWaterRiskProfile('moderate', 12, 'low', 'Red River of the North Basin'),
    commodityProfile: createCommodityProfile('Spring Wheat', ['Spring Wheat', 'Sugarbeets', 'Soybeans', 'Canola'], 18.5, 114, 55, ['Japan', 'Mexico', 'Philippines', 'EU']),
    carbonProfile: createCarbonProfile(0.38, 3.25, 1.55, 42),
    supplyChainProfile: {
      corporateScope3Coverage: 'High',
      activeSuppliersCount: 1420,
      primaryDataSharePct: 68,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('high', 72, 18, 10, 'USDA ARS & Univ of Minnesota Soils Lab'),
    subnationalRegions: [
      { id: 'sub-nd-1', name: 'Grand Forks County Prime Valley', type: 'agricultural_district', primaryCommodity: 'Spring Wheat', baselineSOCPct: 3.45, operatingCostPerAcreUSD: 370, waterRisk: 'low', confidence: 'high', coordinates: [47.92, -97.05] },
      { id: 'sub-mn-1', name: 'Polk County Humic Silt Flats', type: 'agricultural_district', primaryCommodity: 'Sugarbeets', baselineSOCPct: 3.15, operatingCostPerAcreUSD: 410, waterRisk: 'low', confidence: 'high', coordinates: [47.77, -96.60] },
    ],
    soilHealthBenchmarks: createSoilBenchmarks('Mollisols (Typic Hapludolls) - Silty Clay Loam', 3.25, 1.55, ['Spring Wheat', 'Soybeans']),
  },
  {
    id: 'loc-na-north-2',
    name: 'Peace River Northern Parkland',
    continent: 'North America',
    country: 'Canada',
    countryCode: 'CA',
    compassDirection: 'North',
    subRegion: 'North: Northern Alberta & BC Parkland',
    coordinates: [56.2366, -117.2894],
    ...createOperatingCost(340, 72),
    approxCostOfLivingUSD: 1980,
    costOfLivingTier: 'moderate',
    costBreakdown: { monthlyHousingRentUSD: 850, groceriesUSD: 460, utilitiesEnergyUSD: 320, transportationUSD: 350 },
    livingCostIndex: 64,
    agriculturalProfile: {
      dominantCrops: ['Canola', 'Barley', 'Forage Seeds', 'Oats'],
      soilZone: 'Dark Gray Chernozems & Gray Luvisols',
      climateType: 'Subarctic Boreal Transition (Dfc)',
    },
    climateProfile: createClimateProfile(460, 1.8, 1680, 'Subarctic Boreal Transition (Dfc)'),
    waterRiskProfile: createWaterRiskProfile('abundant', 5, 'low', 'Peace River Watershed'),
    commodityProfile: createCommodityProfile('Canola', ['Canola', 'Feed Barley', 'Oats', 'Creeping Red Fescue'], 9.2, 106, 75, ['China', 'Japan', 'United States', 'Mexico']),
    carbonProfile: createCarbonProfile(0.42, 3.60, 1.35, 38),
    supplyChainProfile: {
      corporateScope3Coverage: 'Moderate',
      activeSuppliersCount: 680,
      primaryDataSharePct: 54,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('high', 65, 25, 10, 'Agriculture and Agri-Food Canada (AAFC)'),
    soilHealthBenchmarks: createSoilBenchmarks('Chernozems & Gray Luvisols', 3.60, 1.35, ['Canola', 'Barley']),
  },
  {
    id: 'loc-na-south-1',
    name: 'Lower Rio Grande Valley',
    continent: 'North America',
    country: 'United States',
    countryCode: 'US',
    compassDirection: 'South',
    subRegion: 'South: Southern Texas Subtropical Border',
    coordinates: [26.1901, -97.6961],
    ...createOperatingCost(490, 89),
    approxCostOfLivingUSD: 1680,
    costOfLivingTier: 'moderate',
    costBreakdown: { monthlyHousingRentUSD: 740, groceriesUSD: 360, utilitiesEnergyUSD: 240, transportationUSD: 340 },
    livingCostIndex: 58,
    agriculturalProfile: {
      dominantCrops: ['Citrus', 'Grain Sorghum', 'Cotton', 'Sugarcane'],
      soilZone: 'Vertisols & Aridisols with shrink-swell montmorillonite',
      climateType: 'Subtropical Semi-Arid (BSh)',
    },
    climateProfile: createClimateProfile(620, 23.4, 4850, 'Subtropical Semi-Arid (BSh)'),
    waterRiskProfile: createWaterRiskProfile('critical', 85, 'high', 'Lower Rio Grande Basin'),
    commodityProfile: createCommodityProfile('Cotton & Citrus', ['Cotton', 'Ruby Red Grapefruit', 'Grain Sorghum', 'Sugarcane'], 6.4, 98, 40, ['Domestic US', 'Mexico', 'Canada']),
    carbonProfile: createCarbonProfile(0.68, 1.65, 1.30, 24),
    supplyChainProfile: {
      corporateScope3Coverage: 'Moderate',
      activeSuppliersCount: 410,
      primaryDataSharePct: 48,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('moderate', 55, 35, 10, 'Texas A&M Agrilife Extension'),
    soilHealthBenchmarks: createSoilBenchmarks('Vertisols & Calcareous Aridisols', 1.65, 1.30, ['Grain Sorghum', 'Cotton']),
  },
  {
    id: 'loc-na-east-1',
    name: 'Lancaster County Piedmont Belt',
    continent: 'North America',
    country: 'United States',
    countryCode: 'US',
    compassDirection: 'East',
    subRegion: 'East: Eastern Pennsylvania Piedmont',
    coordinates: [40.0379, -76.3055],
    ...createOperatingCost(580, 96),
    approxCostOfLivingUSD: 2950,
    costOfLivingTier: 'high',
    costBreakdown: { monthlyHousingRentUSD: 1350, groceriesUSD: 520, utilitiesEnergyUSD: 360, transportationUSD: 720 },
    livingCostIndex: 88,
    agriculturalProfile: {
      dominantCrops: ['Silage Corn', 'Dairy Forage', 'Tobacco', 'Soybeans'],
      soilZone: 'Hagerstown Silt Loam & Limestone Alfisols',
      climateType: 'Humid Subtropical / Continental (Cfa)',
    },
    climateProfile: createClimateProfile(1080, 11.8, 3100, 'Humid Continental / Piedmont (Dfa)'),
    waterRiskProfile: createWaterRiskProfile('abundant', 8, 'low', 'Susquehanna / Chesapeake Bay Watershed'),
    commodityProfile: createCommodityProfile('Dairy & Silage Corn', ['Fluid Milk', 'Silage Corn', 'Alfalfa', 'Broiler Poultry'], 8.1, 128, 15, ['Northeast US Megalopolis']),
    carbonProfile: createCarbonProfile(0.55, 2.90, 1.60, 68),
    supplyChainProfile: {
      corporateScope3Coverage: 'High',
      activeSuppliersCount: 1850,
      primaryDataSharePct: 82,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('high', 85, 10, 5, 'Penn State College of Ag Sciences'),
    soilHealthBenchmarks: createSoilBenchmarks('Hagerstown Limestone Alfisols', 2.90, 1.60, ['Corn Silage', 'Soybeans']),
  },
  {
    id: 'loc-na-west-1',
    name: 'San Joaquin Valley Agro-Hub',
    continent: 'North America',
    country: 'United States',
    countryCode: 'US',
    compassDirection: 'West',
    subRegion: 'West: Central California Alluvial Basin',
    coordinates: [36.7468, -119.7726],
    ...createOperatingCost(1150, 142),
    approxCostOfLivingUSD: 3400,
    costOfLivingTier: 'high',
    costBreakdown: { monthlyHousingRentUSD: 1650, groceriesUSD: 590, utilitiesEnergyUSD: 440, transportationUSD: 720 },
    livingCostIndex: 96,
    agriculturalProfile: {
      dominantCrops: ['Almonds', 'Pistachios', 'Wine Grapes', 'Processing Tomatoes', 'Dairy'],
      soilZone: 'Alluvial Entisols & Calcisols with deep stratified silt',
      climateType: 'Mediterranean Semi-Arid (BSh/Csa)',
    },
    climateProfile: createClimateProfile(280, 17.5, 4100, 'Mediterranean Semi-Arid (Csa)'),
    waterRiskProfile: createWaterRiskProfile('critical', 96, 'severe', 'San Joaquin River / Delta-Mendota Basin'),
    commodityProfile: createCommodityProfile('Almonds & Tree Nuts', ['Almonds', 'Pistachios', 'Wine Grapes', 'Processing Tomatoes', 'Dairy'], 34.0, 145, 68, ['EU', 'India', 'China', 'Middle East', 'Japan']),
    carbonProfile: createCarbonProfile(0.74, 1.40, 1.85, 48),
    supplyChainProfile: {
      corporateScope3Coverage: 'High',
      activeSuppliersCount: 3200,
      primaryDataSharePct: 78,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('high', 80, 15, 5, 'UC Davis Agriculture & Natural Resources'),
    soilHealthBenchmarks: createSoilBenchmarks('Alluvial Entisols & Calcareous Loams', 1.40, 1.85, ['Almonds', 'Tomatoes']),
  },

  // ================= SOUTH AMERICA =================
  {
    id: 'loc-sa-brazil-1',
    name: 'Mato Grosso Cerrado Ag-Hub',
    continent: 'South America',
    country: 'Brazil',
    countryCode: 'BR',
    compassDirection: 'East',
    subRegion: 'Center-West: Sorriso & Sinop Soybean Belt',
    coordinates: [-12.5444, -55.7214],
    ...createOperatingCost(410, 82),
    approxCostOfLivingUSD: 1100,
    costOfLivingTier: 'affordable',
    costBreakdown: { monthlyHousingRentUSD: 420, groceriesUSD: 280, utilitiesEnergyUSD: 180, transportationUSD: 220 },
    livingCostIndex: 42,
    agriculturalProfile: {
      dominantCrops: ['Soybeans (Safrinha Corn Double Crop)', 'Cotton', 'Cattle Pasture'],
      soilZone: 'Deep Red-Yellow Latosols (Oxisols) with high aluminum saturation',
      climateType: 'Tropical Wet-and-Dry Savanna (Aw)',
    },
    climateProfile: createClimateProfile(1850, 26.2, 5400, 'Tropical Wet-and-Dry Savanna (Aw)'),
    waterRiskProfile: createWaterRiskProfile('moderate', 18, 'moderate', 'Teles Pires / Tapajós Basin'),
    commodityProfile: createCommodityProfile('Soybeans & Safrinha Corn', ['Soybeans', 'Corn', 'Upland Cotton', 'Beef Cattle'], 42.0, 118, 85, ['China', 'EU', 'Southeast Asia', 'Middle East']),
    carbonProfile: createCarbonProfile(0.48, 2.10, 1.75, 56),
    supplyChainProfile: {
      corporateScope3Coverage: 'High',
      activeSuppliersCount: 4800,
      primaryDataSharePct: 74,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('high', 70, 20, 10, 'EMBRAPA Soja & INPE Satellite Monitoring'),
    subnationalRegions: [
      { id: 'sub-br-sorriso', name: 'Sorriso Grain Capital', type: 'agricultural_district', primaryCommodity: 'Soybeans', baselineSOCPct: 2.20, operatingCostPerAcreUSD: 395, waterRisk: 'moderate', confidence: 'high', coordinates: [-12.54, -55.72] },
      { id: 'sub-br-rondonopolis', name: 'Rondonópolis Logistics Corridor', type: 'agricultural_district', primaryCommodity: 'Cotton', baselineSOCPct: 2.05, operatingCostPerAcreUSD: 430, waterRisk: 'moderate', confidence: 'high', coordinates: [-16.46, -54.63] },
    ],
    soilHealthBenchmarks: createSoilBenchmarks('Oxisols (Latossolos Vermelhos)', 2.10, 1.75, ['Soybeans', 'Safrinha Corn']),
  },
  {
    id: 'loc-sa-arg-1',
    name: 'Pampas Húmeda Core Belt',
    continent: 'South America',
    country: 'Argentina',
    countryCode: 'AR',
    compassDirection: 'South',
    subRegion: 'Central: Pergamino & Rosario Humid Pampas',
    coordinates: [-33.8966, -60.5736],
    ...createOperatingCost(360, 75),
    approxCostOfLivingUSD: 1150,
    costOfLivingTier: 'affordable',
    costBreakdown: { monthlyHousingRentUSD: 450, groceriesUSD: 310, utilitiesEnergyUSD: 160, transportationUSD: 230 },
    livingCostIndex: 44,
    agriculturalProfile: {
      dominantCrops: ['Soybeans', 'Corn', 'Bread Wheat', 'Sunflowers'],
      soilZone: 'Deep Mollisols (Argiudolls) with high organic loam',
      climateType: 'Humid Subtropical (Cfa)',
    },
    climateProfile: createClimateProfile(960, 16.8, 3400, 'Humid Subtropical Pampas (Cfa)'),
    waterRiskProfile: createWaterRiskProfile('moderate', 10, 'moderate', 'Paraná River Basin'),
    commodityProfile: createCommodityProfile('Soymeal & Corn', ['Soybeans', 'Corn', 'Bread Wheat', 'Sunflower Oil'], 38.5, 122, 90, ['EU', 'China', 'India', 'Middle East', 'North Africa']),
    carbonProfile: createCarbonProfile(0.36, 2.85, 1.55, 82),
    supplyChainProfile: {
      corporateScope3Coverage: 'High',
      activeSuppliersCount: 3900,
      primaryDataSharePct: 76,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('high', 78, 15, 7, 'INTA Argentina & AAPRESID No-Till Network'),
    soilHealthBenchmarks: createSoilBenchmarks('Mollisols (Typic Argiudolls)', 2.85, 1.55, ['Soybeans', 'Wheat']),
  },

  // ================= EUROPE =================
  {
    id: 'loc-eu-france-1',
    name: 'Beauce Granary & Paris Basin',
    continent: 'Europe',
    country: 'France',
    countryCode: 'FR',
    compassDirection: 'West',
    subRegion: 'Central: Beauce Plain & Eure-et-Loir',
    coordinates: [48.4439, 1.4890],
    ...createOperatingCost(520, 92),
    approxCostOfLivingUSD: 2750,
    costOfLivingTier: 'high',
    costBreakdown: { monthlyHousingRentUSD: 1200, groceriesUSD: 580, utilitiesEnergyUSD: 350, transportationUSD: 620 },
    livingCostIndex: 86,
    agriculturalProfile: {
      dominantCrops: ['Soft Wheat', 'Malting Barley', 'Sugarbeets', 'Rapeseed'],
      soilZone: 'Deep Luvisols (Limon des Plateaux / Loessic Silt)',
      climateType: 'Temperate Oceanic (Cfb)',
    },
    climateProfile: createClimateProfile(640, 10.8, 2450, 'Temperate Oceanic (Cfb)'),
    waterRiskProfile: createWaterRiskProfile('moderate', 22, 'low', 'Seine-Normandie Basin'),
    commodityProfile: createCommodityProfile('Soft Wheat & Malting Barley', ['Soft Wheat', 'Malting Barley', 'Sugarbeets', 'Rapeseed Oil'], 14.8, 138, 48, ['EU Internal', 'North Africa', 'Middle East']),
    carbonProfile: createCarbonProfile(0.34, 2.45, 1.40, 52),
    supplyChainProfile: {
      corporateScope3Coverage: 'High',
      activeSuppliersCount: 2200,
      primaryDataSharePct: 84,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('high', 88, 8, 4, 'INRAE & Arvalis Institut du Végétal'),
    soilHealthBenchmarks: createSoilBenchmarks('Luvisols (Limon des Plateaux)', 2.45, 1.40, ['Soft Wheat', 'Rapeseed']),
  },
  {
    id: 'loc-eu-ukr-1',
    name: 'Central Ukrainian Chernozem Steppe',
    continent: 'Europe',
    country: 'Ukraine',
    countryCode: 'UA',
    compassDirection: 'East',
    subRegion: 'Central: Poltava & Cherkasy Black Earth Belt',
    coordinates: [49.5883, 34.5514],
    ...createOperatingCost(290, 64),
    approxCostOfLivingUSD: 850,
    costOfLivingTier: 'affordable',
    costBreakdown: { monthlyHousingRentUSD: 340, groceriesUSD: 220, utilitiesEnergyUSD: 140, transportationUSD: 150 },
    livingCostIndex: 32,
    agriculturalProfile: {
      dominantCrops: ['Corn', 'Sunflower Seed', 'Winter Wheat', 'Soybeans'],
      soilZone: 'Deep Chernozems (Typic Hapludolls) with 4-6% humic content',
      climateType: 'Moderate Continental (Dfb)',
    },
    climateProfile: createClimateProfile(560, 8.4, 2650, 'Moderate Continental (Dfb)'),
    waterRiskProfile: createWaterRiskProfile('moderate', 12, 'moderate', 'Dnipro River Basin'),
    commodityProfile: createCommodityProfile('Corn & Sunflower Seed', ['Corn', 'Sunflower Oil', 'Winter Wheat', 'Barley'], 32.0, 115, 80, ['EU', 'China', 'North Africa', 'Middle East']),
    carbonProfile: createCarbonProfile(0.32, 3.85, 1.70, 44),
    supplyChainProfile: {
      corporateScope3Coverage: 'Moderate',
      activeSuppliersCount: 1600,
      primaryDataSharePct: 62,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('moderate', 60, 30, 10, 'National Academy of Agrarian Sciences of Ukraine'),
    soilHealthBenchmarks: createSoilBenchmarks('Deep Chernozems (Black Earth)', 3.85, 1.70, ['Corn', 'Sunflowers']),
  },

  // ================= ASIA =================
  {
    id: 'loc-asia-india-1',
    name: 'Indo-Gangetic Alluvial Plain',
    continent: 'Asia',
    country: 'India',
    countryCode: 'IN',
    compassDirection: 'North',
    subRegion: 'North: Punjab & Haryana Granary',
    coordinates: [30.7333, 76.7794],
    ...createOperatingCost(240, 58),
    approxCostOfLivingUSD: 650,
    costOfLivingTier: 'affordable',
    costBreakdown: { monthlyHousingRentUSD: 240, groceriesUSD: 180, utilitiesEnergyUSD: 90, transportationUSD: 140 },
    livingCostIndex: 26,
    agriculturalProfile: {
      dominantCrops: ['Basmati Rice', 'Durum/Bread Wheat', 'Mustard', 'Sugarcane'],
      soilZone: 'Deep Fluvisols & Inceptisols with Himalayan river silt',
      climateType: 'Subtropical Semi-Arid / Monsoon (Cwa/BSh)',
    },
    climateProfile: createClimateProfile(680, 24.2, 5100, 'Subtropical Monsoon (Cwa)'),
    waterRiskProfile: createWaterRiskProfile('critical', 94, 'severe', 'Indus & Ganges Basin (Over-extracted Aquifer)'),
    commodityProfile: createCommodityProfile('Basmati Rice & Wheat', ['Basmati Rice', 'Bread Wheat', 'Cotton', 'Mustard Seed'], 28.5, 125, 35, ['Middle East', 'EU', 'United States', 'East Africa']),
    carbonProfile: createCarbonProfile(0.82, 1.25, 1.45, 32),
    supplyChainProfile: {
      corporateScope3Coverage: 'High',
      activeSuppliersCount: 8400,
      primaryDataSharePct: 58,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('moderate', 64, 26, 10, 'ICAR - Indian Council of Agricultural Research'),
    soilHealthBenchmarks: createSoilBenchmarks('Fluvisols & Alluvial Inceptisols', 1.25, 1.45, ['Rice', 'Wheat']),
  },

  // ================= AFRICA =================
  {
    id: 'loc-af-ghana-1',
    name: 'Ashanti Cocoa & Palm Agro-Forestry',
    continent: 'Africa',
    country: 'Ghana',
    countryCode: 'GH',
    compassDirection: 'West',
    subRegion: 'West: Ashanti & Western Tropical Rainforest Belt',
    coordinates: [6.6885, -1.6244],
    ...createOperatingCost(195, 46),
    approxCostOfLivingUSD: 750,
    costOfLivingTier: 'affordable',
    costBreakdown: { monthlyHousingRentUSD: 280, groceriesUSD: 210, utilitiesEnergyUSD: 110, transportationUSD: 150 },
    livingCostIndex: 29,
    agriculturalProfile: {
      dominantCrops: ['Shade-Grown Cocoa', 'Oil Palm', 'Cassava', 'Plantains'],
      soilZone: 'Deep Tropical Acrisols & Ferralsols with dense canopy leaf litter',
      climateType: 'Tropical Rainforest / Monsoon (Af/Am)',
    },
    climateProfile: createClimateProfile(1420, 26.8, 5800, 'Tropical Rainforest / Monsoon (Am)'),
    waterRiskProfile: createWaterRiskProfile('abundant', 5, 'low', 'Pra & Ankobra River Basins'),
    commodityProfile: createCommodityProfile('Single-Origin Cocoa', ['Cocoa Beans', 'Crude Palm Oil', 'Rubber', 'Cassava'], 1.2, 92, 95, ['EU', 'United States', 'Japan', 'Switzerland']),
    carbonProfile: createCarbonProfile(0.44, 2.75, 1.90, 64),
    supplyChainProfile: {
      corporateScope3Coverage: 'High',
      activeSuppliersCount: 6200,
      primaryDataSharePct: 78,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('high', 72, 18, 10, 'Ghana Cocoa Board (COCOBOD) & World Agroforestry (ICRAF)'),
    soilHealthBenchmarks: createSoilBenchmarks('Humic Acrisols & Ferralsols', 2.75, 1.90, ['Cocoa', 'Plantains']),
  },

  // ================= OCEANIA =================
  {
    id: 'loc-oc-aus-1',
    name: 'Western Australian Wheatbelt',
    continent: 'Oceania',
    country: 'Australia',
    countryCode: 'AU',
    compassDirection: 'West',
    subRegion: 'West: Western Indian Ocean Basin',
    coordinates: [-31.6500, 117.0000],
    ...createOperatingCost(310, 84),
    approxCostOfLivingUSD: 2700,
    costOfLivingTier: 'moderate',
    costBreakdown: { monthlyHousingRentUSD: 1140, groceriesUSD: 580, utilitiesEnergyUSD: 330, transportationUSD: 650 },
    livingCostIndex: 81,
    agriculturalProfile: {
      dominantCrops: ['Hard White Wheat', 'Canola', 'Narrow-leaf Lupins', 'Sheep'],
      soilZone: 'Ancient deep sandy yellow duplex Tenosols & Chromosols',
      climateType: 'Mediterranean Semi-Arid (Csa)',
    },
    climateProfile: createClimateProfile(380, 17.8, 3800, 'Mediterranean Semi-Arid (Csa)'),
    waterRiskProfile: createWaterRiskProfile('stressed', 12, 'high', 'Avon River Basin'),
    commodityProfile: createCommodityProfile('Hard White Wheat & Canola', ['Australian Premium White Wheat', 'Non-GMO Canola', 'Lupins', 'Merino Wool'], 16.4, 104, 92, ['Indonesia', 'China', 'Japan', 'Vietnam', 'Philippines']),
    carbonProfile: createCarbonProfile(0.38, 1.45, 1.25, 68),
    supplyChainProfile: {
      corporateScope3Coverage: 'High',
      activeSuppliersCount: 2800,
      primaryDataSharePct: 76,
      deforestationFreeCertified: true,
      euDeforestationRegulationCompliant: true,
    },
    dataConfidenceProfile: createDataConfidence('high', 82, 12, 6, 'DPIRD Western Australia & CSIRO Agriculture'),
    soilHealthBenchmarks: createSoilBenchmarks('Yellow Duplex Tenosols & Chromosols', 1.45, 1.25, ['Wheat', 'Canola']),
  },
];

/**
 * Builds the complete unified list of geographic locations including:
 * 1. Pre-configured detailed sub-territories/regions
 * 2. Country-level baseline hubs for ALL countries from every region
 */
export function getCompleteGeographicLocations(): GeographicLocation[] {
  const existingCountryNames = new Set(INITIAL_DETAILED_LOCATIONS.map((l) => l.country.toLowerCase()));

  const nationalPlaceholders: GeographicLocation[] = ALL_WORLD_COUNTRIES
    .filter((c) => !existingCountryNames.has(c.name.toLowerCase()))
    .map((c) => {
      let costTier: CostOfLivingTier = 'moderate';
      if (c.approxAvgCostOfLivingUSD < 1500) costTier = 'affordable';
      else if (c.approxAvgCostOfLivingUSD <= 2800) costTier = 'moderate';
      else if (c.approxAvgCostOfLivingUSD <= 4000) costTier = 'high';
      else costTier = 'premium';

      const estOperatingCost = Math.round(180 + (c.approxAvgCostOfLivingUSD / 3000) * 320);
      const estInputIndex = Math.round(50 + (c.approxAvgCostOfLivingUSD / 3000) * 55);

      return {
        id: `nat-${c.code.toLowerCase()}`,
        name: `${c.name} (National Baseline)`,
        continent: c.continent,
        country: c.name,
        countryCode: c.code,
        compassDirection: c.compassDirection,
        subRegion: `${c.compassDirection}: Capital ${c.capitalCity} & National Agronomic Belt`,
        coordinates: c.coordinates,
        ...createOperatingCost(estOperatingCost, estInputIndex),
        approxCostOfLivingUSD: c.approxAvgCostOfLivingUSD,
        costOfLivingTier: costTier,
        costBreakdown: {
          monthlyHousingRentUSD: Math.round(c.approxAvgCostOfLivingUSD * 0.42),
          groceriesUSD: Math.round(c.approxAvgCostOfLivingUSD * 0.23),
          utilitiesEnergyUSD: Math.round(c.approxAvgCostOfLivingUSD * 0.12),
          transportationUSD: Math.round(c.approxAvgCostOfLivingUSD * 0.23),
        },
        livingCostIndex: Math.round((c.approxAvgCostOfLivingUSD / 3100) * 100),
        agriculturalProfile: {
          dominantCrops: ['Regional Grain Staples', 'Forage Pasture', 'Specialty Crops'],
          soilZone: c.primarySoilType,
          climateType: `${c.continent} Regional Agro-Climatic Zone`,
        },
        climateProfile: createClimateProfile(650, 16.0, 3200, `${c.continent} Agro-Ecological Zone`),
        waterRiskProfile: createWaterRiskProfile('moderate', 25, 'moderate', `${c.name} National River Basin`),
        commodityProfile: createCommodityProfile('Regional Agricultural Staples', ['Grain Staples', 'Oilseeds', 'Pasture Cattle'], 5.2, 100, 35, ['Regional Trade Partners']),
        carbonProfile: createCarbonProfile(0.48, c.baselineSOCPct, c.carbonPotentialMTPerAcre, 30),
        supplyChainProfile: {
          corporateScope3Coverage: 'Emerging',
          activeSuppliersCount: 240,
          primaryDataSharePct: 35,
          deforestationFreeCertified: true,
          euDeforestationRegulationCompliant: true,
        },
        dataConfidenceProfile: createDataConfidence('moderate', 40, 50, 10, 'FAO Harmonized World Soil Database & World Bank Ag'),
        soilHealthBenchmarks: createSoilBenchmarks(c.primarySoilType, c.baselineSOCPct, c.carbonPotentialMTPerAcre, ['Grain Staples', 'Legumes']),
        isNationalTerritoryPlaceholder: true,
      };
    });

  return [...INITIAL_DETAILED_LOCATIONS, ...nationalPlaceholders];
}

export const INITIAL_GEOGRAPHIC_LOCATIONS: GeographicLocation[] = getCompleteGeographicLocations();
