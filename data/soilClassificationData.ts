import { SoilCategoryDefinition, SoilClassificationCategory, GeographicLocation } from '../types';

export const SOIL_CLASSIFICATION_CATEGORIES: SoilCategoryDefinition[] = [
  {
    id: 'mollisols_chernozems',
    name: 'Mollisols & Chernozems (Humic Grassland & Prairie Soils)',
    shortName: 'Mollisols & Chernozems',
    badge: 'MOL',
    color: '#10b981', // Emerald
    accentBg: 'bg-emerald-950/80',
    borderClass: 'border-emerald-600',
    globalCoverage: '~7% of global ice-free land; ~22% of premier grain belts (US Corn Belt, Ukrainian Steppes, Argentine Pampas)',
    primaryOrderTaxa: 'Mollisols (USDA), Chernozems, Phaeozems, Kastanozems, Brunizems (WRB/FAO)',
    dominantTextures: 'Silt loam, silty clay loam, fertile prairie loam with granular crumb aggregates',
    specificCharacteristics: {
      morphologyAndHorizon: 'Deep, dark mollic epipedon (humus-rich A-horizon 25–60 cm depth) formed under native prairie grasses.',
      textureAndDrainage: 'Granular aggregate crumb structure; rapid infiltration (2.0–3.5 in/hr) with optimal water capacity (AWC 18–24% VWC).',
      chemicalCationExchange: 'High base saturation (>50%), rich in natural calcium/magnesium; high CEC (22–38 meq/100g); neutral pH (6.2–7.4).',
      bulkDensityAndPh: 'Favorable bulk density (1.18–1.28 g/cm³) allowing unrestricted deep taproot exploration.',
      microbialActivity: 'Superior microbial biomass carbon (380–520 mg/kg); robust mycorrhizal fungal network producing glomalin.',
    },
    carbonSequestrationPotential: {
      annualRateRangeMTCO2ePerAcre: '+1.20 to +1.85 MT CO₂e / acre / year',
      avgAnnualMTCO2ePerAcre: 1.55,
      baselineSOCStockTonsCPerHa: '55 – 95 t C / ha (2.8% – 4.5% SOC)',
      somAccretion5YrTargetPct: '+0.45% to +0.80% SOM accretion',
      sequestrationMechanism: 'Micro-aggregate physical protection (<250 µm) encases particulate organic matter (POM); deep root exudates synthesize stable humic acids.',
      recommendedRegenerativePractices: [
        'Continuous 100% no-till or direct drill seeding',
        'Multi-species overwinter cover crops (cereal rye + hairy vetch + brassica)',
        'Residue retention (>80% surface armor to prevent oxidation)',
        'Humic acid and biological inoculant foliar stimulants'
      ]
    }
  },
  {
    id: 'vertisols_fluvisols',
    name: 'Vertisols & Alluvial Fluvisols (Smectite Cracking Clays & River Valleys)',
    shortName: 'Vertisols & Fluvisols',
    badge: 'VER',
    color: '#06b6d4', // Cyan
    accentBg: 'bg-cyan-950/80',
    borderClass: 'border-cyan-600',
    globalCoverage: '~4% of global land; high-yield alluvial deltas, river plains & cracking-clay plains (Mississippi Delta, Darling Downs, Deccan Plateau)',
    primaryOrderTaxa: 'Vertisols, Alluvial Fluvisols, Vertosols, Gleysols, Endoaquolls (USDA & WRB)',
    dominantTextures: 'Heavy clay, silty clay (>35–60% clay fraction), smectite-montmorillonite minerals',
    specificCharacteristics: {
      morphologyAndHorizon: 'Self-mulching profile with pedoturbation (deep churning); wide desiccation cracks (>1 cm wide, >50 cm deep) during dry season.',
      textureAndDrainage: 'Extreme shrink-swell capacity; massive water retention at saturation but slow hydraulic percolation when swollen; ponding risk.',
      chemicalCationExchange: 'Very high cation exchange capacity (CEC 28–50+ meq/100g); strong retention of ammonium, calcium, potassium; pH 6.8–8.2.',
      bulkDensityAndPh: 'Variable bulk density (1.30–1.52 g/cm³ when dry); self-mulching surface forms fine tilth upon re-wetting.',
      microbialActivity: 'High anaerobic microbial bursts post-rain; requires root aeration channels to maximize beneficial aerobic bacteria.',
    },
    carbonSequestrationPotential: {
      annualRateRangeMTCO2ePerAcre: '+1.10 to +1.65 MT CO₂e / acre / year',
      avgAnnualMTCO2ePerAcre: 1.38,
      baselineSOCStockTonsCPerHa: '45 – 75 t C / ha (2.0% – 3.4% SOC)',
      somAccretion5YrTargetPct: '+0.38% to +0.65% SOM accretion',
      sequestrationMechanism: 'Mineral-associated organic matter (MAOM) binds organic compounds to high-surface-area smectite clay layers, providing decadal durability.',
      recommendedRegenerativePractices: [
        'Controlled traffic farming (CTF) to restrict compaction lanes',
        'Deep-taproot bio-drilling cover crops (tillage radish, daikon, sunn hemp)',
        'Composted organic manures to improve structural drainage',
        'Gypsum or calcium amendment to prevent surface clay dispersion'
      ]
    }
  },
  {
    id: 'andisols_volcanic',
    name: 'Andisols & Volcanic Ash Soils (Tephra & Allophanic High-Retention Loams)',
    shortName: 'Andisols & Volcanic',
    badge: 'AND',
    color: '#f59e0b', // Amber
    accentBg: 'bg-amber-950/80',
    borderClass: 'border-amber-600',
    globalCoverage: '~1% of global land; Pacific Rim, volcanic highlands, Rift Valley (Pacific Northwest, Andes, Central America, Japan, New Zealand)',
    primaryOrderTaxa: 'Andisols, Kuroboku, Volcanic Andosols, Nitisols, Humic Inceptisols (USDA & WRB)',
    dominantTextures: 'Volcanic ash loam, tephric silt loam, melanic A-horizon with amorphous minerals',
    specificCharacteristics: {
      morphologyAndHorizon: 'Thick, melanic jet-black to deep brown epipedon formed by weathering of volcanic glass and ejecta.',
      textureAndDrainage: 'Remarkably light, fluffy feel; extraordinarily low bulk density (<0.90 g/cm³); immense micro-porosity and water-holding (>25–35% VWC).',
      chemicalCationExchange: 'Dominated by amorphous allophane, imogolite, and ferrihydrite; variable pH-dependent charge; high phosphate fixation.',
      bulkDensityAndPh: 'Exceptionally low bulk density (0.75–0.92 g/cm³); natural resistance to mechanical compaction and water erosion.',
      microbialActivity: 'High fungal dominance; mycorrhizal fungi thrive in volcanic vesicle pore networks and mobilize bound phosphorus.',
    },
    carbonSequestrationPotential: {
      annualRateRangeMTCO2ePerAcre: '+1.35 to +2.10 MT CO₂e / acre / year',
      avgAnnualMTCO2ePerAcre: 1.72,
      baselineSOCStockTonsCPerHa: '65 – 120 t C / ha (3.0% – 5.5% SOC)',
      somAccretion5YrTargetPct: '+0.55% to +1.10% SOM accretion',
      sequestrationMechanism: 'Exceptional organo-metallic complexation (allophane/aluminum-humus complexes) physically and chemically shields carbon from microbial decomposition.',
      recommendedRegenerativePractices: [
        'Arbuscular mycorrhizal fungal (AMF) inoculation for phosphorus mobilization',
        'Minimum disturbance direct drilling to protect delicate volcanic crumb tilth',
        'Biochar co-application with organic compost for long-term CEC boost',
        'Multi-story agroforestry and perennial canopy cover'
      ]
    }
  },
  {
    id: 'oxisols_alfisols',
    name: 'Oxisols, Alfisols & Latosols (Highly Weathered Savanna & Subtropical Soils)',
    shortName: 'Oxisols & Alfisols',
    badge: 'OXI',
    color: '#ec4899', // Rose/Pink
    accentBg: 'bg-pink-950/80',
    borderClass: 'border-pink-600',
    globalCoverage: '~18% of global ice-free land; tropical savannas, Cerrado Brazil, Sub-Saharan Africa, Southeast Asia, temperate forest belts',
    primaryOrderTaxa: 'Oxisols, Alfisols, Ultisols, Acrisols, Latossolos, Lixisols, Ferrosols (USDA & WRB)',
    dominantTextures: 'Kaolinitic clay loams, sesquioxide-rich sandy clay loams, ferric lixisols with pseudo-sand aggregation',
    specificCharacteristics: {
      morphologyAndHorizon: 'Highly weathered, deep oxic or argillic profile; extensive leaching of silica and primary minerals; rich in iron/aluminum oxides.',
      textureAndDrainage: 'Well-drained micro-aggregates that behave like coarse sand in water infiltration, but moderate retention in dry seasons.',
      chemicalCationExchange: 'Low natural CEC (6–18 meq/100g); acidic to neutral pH (4.8–6.4); highly responsive to biological biomass inputs.',
      bulkDensityAndPh: 'Moderate bulk density (1.25–1.40 g/cm³); vulnerable to surface capping and high tropical soil temperatures if exposed.',
      microbialActivity: 'High microbial turnover rate under tropical warmth; requires permanent mulch armor to prevent carbon oxidation.',
    },
    carbonSequestrationPotential: {
      annualRateRangeMTCO2ePerAcre: '+0.85 to +1.45 MT CO₂e / acre / year',
      avgAnnualMTCO2ePerAcre: 1.15,
      baselineSOCStockTonsCPerHa: '35 – 60 t C / ha (1.5% – 2.6% SOC)',
      somAccretion5YrTargetPct: '+0.30% to +0.60% SOM accretion',
      sequestrationMechanism: 'Carbon sorption onto iron and aluminum sesquioxide mineral faces; massive accretion response to recalcitrant biochar and root biomass.',
      recommendedRegenerativePractices: [
        'Continuous high-biomass cover crop cocktails (Brachiaria, Crotalaria, Pearl Millet)',
        'Recalcitrant biochar soil conditioning to create permanent CEC sites',
        'Rotational multi-paddock grazing on diverse pastures',
        'Permanent soil armor cover to regulate tropical topsoil temperature'
      ]
    }
  }
];

/**
 * Classifies any soil description, soil order, or regional soil zone into one of the 4 primary Soil Classification Categories.
 */
export function classifySoilCategory(soilString?: string, agriculturalZone?: string): SoilClassificationCategory {
  const combined = `${soilString || ''} ${agriculturalZone || ''}`.toLowerCase();

  // 1. Mollisols & Chernozems
  if (
    combined.includes('mollisol') ||
    combined.includes('chernozem') ||
    combined.includes('phaeozem') ||
    combined.includes('hapludoll') ||
    combined.includes('argiudoll') ||
    combined.includes('brunizem') ||
    combined.includes('prairie') ||
    combined.includes('loess') ||
    combined.includes('castanozem') ||
    combined.includes('kastanozem')
  ) {
    return 'mollisols_chernozems';
  }

  // 2. Vertisols & Alluvial Fluvisols
  if (
    combined.includes('vertisol') ||
    combined.includes('vertosol') ||
    combined.includes('fluvisol') ||
    combined.includes('cracking clay') ||
    combined.includes('alluvial') ||
    combined.includes('gleysol') ||
    combined.includes('endoaquoll') ||
    combined.includes('hydromorphic') ||
    combined.includes('deltaic')
  ) {
    return 'vertisols_fluvisols';
  }

  // 3. Andisols & Volcanic Ash
  if (
    combined.includes('andisol') ||
    combined.includes('andosol') ||
    combined.includes('volcanic') ||
    combined.includes('kuroboku') ||
    combined.includes('tephra') ||
    combined.includes('ash') ||
    combined.includes('jory') ||
    combined.includes('nitisol') ||
    combined.includes('nitosol')
  ) {
    return 'andisols_volcanic';
  }

  // 4. Oxisols, Alfisols & Latosols (Default for weathered, tropical, forest, or general soils)
  return 'oxisols_alfisols';
}

/**
 * Helper to get the category definition object for a location or category id
 */
export function getSoilCategoryDefinition(category: SoilClassificationCategory): SoilCategoryDefinition {
  return SOIL_CLASSIFICATION_CATEGORIES.find((c) => c.id === category) || SOIL_CLASSIFICATION_CATEGORIES[0];
}

export function getLocationSoilCategory(loc: GeographicLocation): SoilClassificationCategory {
  const soilStr = loc.soilHealthBenchmarks?.majorSoilOrder || loc.agriculturalProfile?.soilZone || '';
  return classifySoilCategory(soilStr, loc.agriculturalProfile?.soilZone);
}
