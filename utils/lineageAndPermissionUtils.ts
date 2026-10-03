import { 
  Field, 
  Farm, 
  EmissionFactorConfig, 
  FieldDataLineage, 
  LineageNode, 
  RoleCapability, 
  SharedDataEntitySchema 
} from '../types';

/**
 * Generates an end-to-end provenance graph / lineage trace for any farm field
 * according to ISO 14064-2 and GHG Protocol Land Sector and Removals Guidance.
 */
export function generateFieldDataLineage(
  field: Field,
  farm: Farm,
  config: EmissionFactorConfig
): FieldDataLineage {
  const dateStr = new Date().toISOString().slice(0, 10);
  const totalCarbon = field.carbonBreakdown.totalGrossMT;
  const netPerAcre = field.carbonBreakdown.totalNetPerAcre;
  
  // Deterministic fake-but-realistic SHA-256 root hash derived from field specs
  const seed = `${field.id}-${field.acreage}-${totalCarbon}-${config.methodology}-${field.baselineSOCPct}`;
  const rootHash = `0x${Array.from(seed).reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0).toString(16).padStart(8, '0')}7f94b1c83a9e224d08b3c690184e90df3a67`;

  const nodes: LineageNode[] = [
    {
      id: `${field.id}-node-1`,
      stage: 'raw_origin',
      stageIndex: 1,
      title: 'Multispectral Satellite & In-Situ Soil Sampling Origin',
      subtitle: 'Raw Sentinel-2 Top-of-Atmosphere & Dry Combustion Core Samples',
      timestamp: '2026-09-18T14:32:00Z',
      sourceSystem: 'ESA Copernicus Sentinel-2 MSI & Midwest Ag Labs',
      locationRef: `${field.centroid[0].toFixed(4)}°N, ${field.centroid[1].toFixed(4)}°W (WGS84 EPSG:4326)`,
      methodologyOrSensor: 'Sentinel-2 L1C Level + Dry Combustion LECO C832 Elemental Analyzer',
      confidenceScorePct: 98.4,
      sha256Checksum: '0x3a9f91bc4821a8309e5d483789012a9efc47819038cbdf49201948ae109b7c2a',
      auditStatus: 'verified',
      verifiedBy: 'ESA Copernicus Ground Segment & Eurofins ISO 17025 Certified Soil Lab',
      summaryMetrics: {
        primaryValue: `${field.baselineSOCPct.toFixed(2)}% SOC`,
        primaryLabel: 'Lab Baseline Dry Combustion',
        secondaryValue: `${field.currentNDVI.toFixed(2)} NDVI`,
        secondaryLabel: 'Sentinel-2 BOA Index',
      },
      payload: [
        { key: 'band_red_b4', label: 'Band 4 (Red 665nm)', value: '0.0482', status: 'raw' },
        { key: 'band_nir_b8', label: 'Band 8 (NIR 842nm)', value: '0.3541', status: 'raw' },
        { key: 'band_swir_b11', label: 'Band 11 (SWIR 1610nm)', value: '0.1240', status: 'raw' },
        { key: 'core_depth_cm', label: 'Soil Core Horizon Depth', value: '0–30', unit: 'cm', status: 'calibrated' },
        { key: 'bulk_density', label: 'Measured Bulk Density', value: '1.28', unit: 'g/cm³', status: 'calibrated' },
        { key: 'coarse_fragments', label: 'Coarse Mineral Fragments (>2mm)', value: '1.8', unit: '%', status: 'calibrated' },
      ],
      isoStandard: 'ISO 10694:1995 (Soil quality — Determination of organic and total carbon)',
      rawJsonSnippet: JSON.stringify({
        granule_id: 'S2B_MSIL2A_20260918T163901_N0500_R126_T15TVH',
        reflectance_scale: 0.0001,
        cloud_probability_pct: 0.0,
        lab_sample_id: `SOIL-CORE-${field.id}-030CM`,
        spectroscopy_qc: 'PASSED_DUPLICATE_RSD_LESS_2PCT'
      }, null, 2)
    },
    {
      id: `${field.id}-node-2`,
      stage: 'ingestion_clean',
      stageIndex: 2,
      title: 'Atmospheric Normalization, QA Cloud Mask & Topographic Orthorectification',
      subtitle: 'Sen2Cor BOA Surface Reflectance & DEM Topographic Terrain Normalization',
      timestamp: '2026-09-18T15:10:22Z',
      sourceSystem: 'TerraSoil Cloud Geospatial Preprocessor (GeoTIFF Raster Engine)',
      locationRef: 'Field Polygon Boundary (GeoJSON Vector Mask)',
      methodologyOrSensor: 'Sen2Cor v2.11 + Copernicus 30m Global DEM terrain illumination correction',
      confidenceScorePct: 97.8,
      sha256Checksum: '0x81b24d77ea9349102c890123efca459012893819034bcdae8291048194b1928a',
      auditStatus: 'verified',
      verifiedBy: 'TerraSoil Automated Ingestion QA & SCL (Scene Classification Layer) Pipeline',
      summaryMetrics: {
        primaryValue: '100% Valid',
        primaryLabel: 'Cloud-Free Parcel Coverage',
        secondaryValue: '±0.012',
        secondaryLabel: 'Atmospheric Uncertainty',
      },
      payload: [
        { key: 'cloud_mask_pct', label: 'Parcel Cloud Cover Fraction', value: '0.00', unit: '%', status: 'computed' },
        { key: 'aerosol_optical_thickness', label: 'Aerosol Optical Depth (AOD 550nm)', value: '0.082', status: 'calibrated' },
        { key: 'spatial_resolution', label: 'Pixel Resampling Grid', value: '10.0', unit: 'm/px', status: 'computed' },
        { key: 'ndvi_calc', label: 'Normalized Difference Vegetation Index', value: `${field.currentNDVI.toFixed(3)}`, status: 'computed' },
        { key: 'evi_calc', label: 'Enhanced Vegetation Index (EVI)', value: `${(field.currentNDVI * 0.82).toFixed(3)}`, status: 'computed' },
      ],
      isoStandard: 'CEOS Analysis Ready Data (CARD4L) Compliant Surface Reflectance',
      rawJsonSnippet: JSON.stringify({
        processing_baseline: '05.00',
        scene_classification: { vegetation: 96.4, bare_soil: 3.6, cloud: 0.0, shadow: 0.0 },
        projection: 'EPSG:32615 (UTM Zone 15N)',
        clipping_mask_vertices: field.boundaryCoordinates.length
      }, null, 2)
    },
    {
      id: `${field.id}-node-3`,
      stage: 'agronomic_evidence',
      stageIndex: 3,
      title: 'Farmer Telematics & Grounded Regenerative Practice Evidence Ledger',
      subtitle: 'Geofenced ISO-XML Tractor CAN-Bus Logs, Seed Receipts & Activity Log',
      timestamp: '2026-09-22T11:05:00Z',
      sourceSystem: 'Grower Machinery Telematics & Verified Practice Activity Ledger',
      locationRef: `${field.name} (${field.acreage} Enrolled Acres)`,
      methodologyOrSensor: 'ISO 11783 CAN-Bus Implement Logs + High-Clearance Drill Telematics',
      confidenceScorePct: 96.2,
      sha256Checksum: '0x992810ab78f249103cba781903482910398201948ae109b7c2ae8491048194b1',
      auditStatus: 'verified',
      verifiedBy: 'Agronomic Consultant & Certified Crop Adviser (CCA Verified Record)',
      summaryMetrics: {
        primaryValue: `${field.practices.length} Practices`,
        primaryLabel: 'Audited Regenerative Actions',
        secondaryValue: `${field.acreage} ac`,
        secondaryLabel: '100% Boundary Applied',
      },
      payload: [
        { key: 'practices_count', label: 'Total Verified Practices', value: field.practices.length, status: 'verified' },
        { key: 'primary_crop', label: 'Enrolled Main Crop Rotation', value: field.cropType, status: 'verified' },
        { key: 'implement_type', label: 'No-Till Seeding Implement', value: 'John Deere 1890 Air Drill (Single-Disk Opener)', status: 'verified' },
        { key: 'seed_invoice', label: 'Cover Crop Certified Seed Lot', value: 'Winter Cereal Rye (Lot #CR-9481-IA)', status: 'verified' },
        { key: 'gps_accuracy', label: 'RTK Field Guidance Accuracy', value: '±2.5', unit: 'cm', status: 'calibrated' },
      ],
      isoStandard: 'AgGateway ADAPT Open Data Model & ISO 11783-10 Task Controller Log',
      rawJsonSnippet: JSON.stringify({
        machinery_canbus_serial: 'JD-TC-84920419',
        field_geofence_verified: true,
        logged_practices: field.practices.map(p => ({
          title: p.title,
          type: p.practiceType,
          date: p.dateImplemented,
          status: p.status,
          reductionFactor: p.emissionReductionFactor
        }))
      }, null, 2)
    },
    {
      id: `${field.id}-node-4`,
      stage: 'calculation_model',
      stageIndex: 4,
      title: 'Agronomic Quantification & MRV Calculation Engine Execution',
      subtitle: `${config.methodology === 'USDA_COMET_FARM' ? 'USDA COMET-Farm Empirical Model' : 'IPCC Tier 1 / Tier 2 Land Sector Engine'}`,
      timestamp: '2026-10-01T09:14:12Z',
      sourceSystem: 'TerraSoil Scientific MRV Engine v4.2.0',
      locationRef: `${field.soilClassification}`,
      methodologyOrSensor: `${config.methodology === 'USDA_COMET_FARM' ? 'USDA COMET-Farm / DayCent Dynamic Bio-Geochemical Model' : 'IPCC 2019 Refinement to 2006 Guidelines for National GHG Inventories'}`,
      formulaDisplay: 'SOC_Stock = SOC% × BulkDensity(1.28) × Depth(30cm) × (1 - CoarseFrac) × 100; ΔC_Annual = Σ(Acreage × PracticeFactor_i)',
      confidenceScorePct: 94.5,
      sha256Checksum: '0x44819038cbdf49201948ae109b7c2a3a9f91bc4821a8309e5d483789012a9efc',
      auditStatus: 'validated',
      verifiedBy: 'TerraSoil MRV Engine & Third-Party Agronomic Algorithms',
      summaryMetrics: {
        primaryValue: `${totalCarbon.toFixed(1)} MT CO₂e`,
        primaryLabel: 'Gross Annual Sequestration',
        secondaryValue: `${netPerAcre.toFixed(2)} MT/ac`,
        secondaryLabel: 'Annual Sequestration Rate',
      },
      payload: [
        { key: 'baseline_stock', label: 'Baseline Soil Carbon Stock', value: field.baselineSOCStockTonsPerHa.toFixed(1), unit: 't C/ha', status: 'computed' },
        { key: 'cover_crop_mt', label: 'Cover Crop Accrual', value: field.carbonBreakdown.coverCropMT.toFixed(1), unit: 'MT CO₂e/yr', status: 'computed' },
        { key: 'no_till_mt', label: 'No-Till Conservation Accrual', value: field.carbonBreakdown.noTillMT.toFixed(1), unit: 'MT CO₂e/yr', status: 'computed' },
        { key: 'fert_reduction_mt', label: 'Fertilizer N₂O Abatement', value: field.carbonBreakdown.fertilizerReductionMT.toFixed(1), unit: 'MT CO₂e/yr', status: 'computed' },
        { key: 'som_5yr_gain', label: '5-Year Projected SOM Accretion', value: `+${field.carbonBreakdown.somAccretion5YrPct.toFixed(2)}`, unit: '%', status: 'computed' },
      ],
      isoStandard: 'ISO 14064-2:2019 (Greenhouse gases — Part 2: Project level quantification)',
      rawJsonSnippet: JSON.stringify({
        algorithm_version: 'MRV-CORE-v4.2.0-STABLE',
        methodology_selected: config.methodology,
        carbon_factor_rates: {
          cover_crop: config.coverCropRate,
          no_till: config.noTillRate,
          fertilizer: config.fertilizerReductionRate,
          grazing: config.grazingRotationRate
        },
        calculated_gross_mt: totalCarbon,
        calculated_net_mt_per_acre: netPerAcre
      }, null, 2)
    },
    {
      id: `${field.id}-node-5`,
      stage: 'uncertainty_discount',
      stageIndex: 5,
      title: 'Monte Carlo Uncertainty Modeling & Conservativeness Permanence Buffer',
      subtitle: '95% Confidence Interval Assessment & 12.5% Non-Permanence Risk Reserve',
      timestamp: '2026-10-01T09:14:45Z',
      sourceSystem: 'TerraSoil Statistical Assurance & Risk Quantification Module',
      locationRef: 'Agronomic Soil Carbon Uncertainty Profile',
      methodologyOrSensor: 'Monte Carlo Latin Hypercube Sampling (10,000 runs) + VCS AFOLU Non-Permanence Buffer',
      confidenceScorePct: 95.0,
      sha256Checksum: '0x12a9efc47819038cbdf49201948ae109b7c2a3a9f91bc4821a8309e5d4837890',
      auditStatus: 'verified',
      verifiedBy: 'Statistical Audit Engine & Carbon Buffer Pool Reserve',
      summaryMetrics: {
        primaryValue: '±7.8%',
        primaryLabel: '95% Confidence Interval',
        secondaryValue: '12.5%',
        secondaryLabel: 'Buffer Deduction Holdback',
      },
      payload: [
        { key: 'monte_carlo_iterations', label: 'Simulation Runs', value: '10,000', status: 'calibrated' },
        { key: 'ci_lower_bound', label: '95% CI Lower Bound', value: `${(totalCarbon * 0.922).toFixed(1)}`, unit: 'MT CO₂e', status: 'computed' },
        { key: 'ci_upper_bound', label: '95% CI Upper Bound', value: `${(totalCarbon * 1.078).toFixed(1)}`, unit: 'MT CO₂e', status: 'computed' },
        { key: 'permanence_buffer_pct', label: 'Non-Permanence Pool Holdback', value: '12.5', unit: '%', status: 'computed' },
        { key: 'net_creditable_carbon', label: 'Net Issuable/Insetting Claim', value: `${(totalCarbon * 0.875).toFixed(1)}`, unit: 'MT CO₂e', status: 'computed' },
      ],
      isoStandard: 'GHG Protocol Guidance on Uncertainty Assessment in GHG Inventories',
      rawJsonSnippet: JSON.stringify({
        monte_carlo_method: 'LATIN_HYPERCUBE_SAMPLING',
        p_value: 0.001,
        uncertainty_half_width_pct: 7.8,
        conservativeness_principle_applied: true,
        buffer_pool_deposit_mt: Number((totalCarbon * 0.125).toFixed(1))
      }, null, 2)
    },
    {
      id: `${field.id}-node-6`,
      stage: 'verified_issuance',
      stageIndex: 6,
      title: 'Cryptographic Lineage Root Hash & SBTi / Scope 3 Insetting Seal',
      subtitle: 'Audited Provenance Certificate & GHG Protocol Insetting Issuance',
      timestamp: '2026-10-02T08:00:00Z',
      sourceSystem: 'TerraSoil Cryptographic Provenance Registry & Enterprise Ledger',
      locationRef: `${farm.name} &bull; ${farm.region}`,
      methodologyOrSensor: 'SHA-256 Merkle Audit Tree + ISO 14064-3 Third-Party Audit Schema',
      confidenceScorePct: 99.2,
      sha256Checksum: rootHash,
      auditStatus: 'verified',
      verifiedBy: 'Accredited Verification Body & Corporate Scope 3 Verification Office',
      summaryMetrics: {
        primaryValue: `${totalCarbon.toFixed(1)} MT`,
        primaryLabel: 'Sealed Carbon Insetting Total',
        secondaryValue: '100% Chain',
        secondaryLabel: 'Tamper-Evident Lineage',
      },
      payload: [
        { key: 'root_lineage_hash', label: 'Cryptographic Root Hash', value: rootHash.slice(0, 24) + '...', status: 'verified' },
        { key: 'compliance_standard', label: 'Reporting Standard', value: 'GHG Protocol Scope 3 Cat 1 & ISO 14064-2', status: 'verified' },
        { key: 'additionality_test', label: 'Additionality Determination', value: 'PASSED (Practice adoption post-2024 baseline)', status: 'verified' },
        { key: 'double_claim_prevention', label: 'Registry Unique Serial ID', value: `TS-INSET-${farm.id.toUpperCase()}-${field.id.toUpperCase()}-2026`, status: 'verified' },
        { key: 'valuation_usd', label: 'Simulated Insetting Value', value: `$${(totalCarbon * config.carbonPricePerTon).toLocaleString()}`, status: 'computed' },
      ],
      isoStandard: 'ISO 14064-3:2019 (Specification with guidance for the verification and validation of GHG statements)',
      rawJsonSnippet: JSON.stringify({
        root_merkle_hash: rootHash,
        issuance_serial: `TS-INSET-${farm.id.toUpperCase()}-${field.id.toUpperCase()}-2026`,
        compliance_declarations: [
          'GHG_PROTOCOL_LAND_SECTOR_REMOVALS',
          'SBTI_FLAG_DECARBONIZATION_TARGET',
          'ISO_14064_2_PROJECT_LEVEL_QUANTIFICATION'
        ],
        verification_tier: 'AUDIT_READY_TIER_2'
      }, null, 2)
    }
  ];

  return {
    fieldId: field.id,
    fieldName: field.name,
    farmId: farm.id,
    farmName: farm.name,
    lineageRootHash: rootHash,
    generatedAt: `${dateStr}T12:00:00Z`,
    totalGrossMT: totalCarbon,
    totalNetPerAcre: netPerAcre,
    methodology: config.methodology === 'USDA_COMET_FARM' ? 'USDA COMET-Farm v4' : 'IPCC Tier 1 / 2 (2019 Refinement)',
    overallConfidencePct: 96.8,
    nodes,
    auditChainLength: nodes.length,
    complianceCertificates: [
      {
        name: 'ISO 14064-2 Project Carbon Quantification Statement',
        standard: 'ISO 14064-2:2019',
        status: 'Compliant & Verified',
        signatureDate: '2026-10-01'
      },
      {
        name: 'GHG Protocol Scope 3 Category 1 Supply Chain Insetting Badge',
        standard: 'GHG Protocol Land Sector Guidance',
        status: 'Audit-Ready',
        signatureDate: '2026-10-02'
      },
      {
        name: 'Science-Based Targets Initiative (SBTi) FLAG Alignment',
        standard: 'SBTi Forest, Land and Agriculture Guidance v1.1',
        status: 'Aligned Trajectory',
        signatureDate: '2026-09-30'
      }
    ]
  };
}

/**
 * Granular Role-Based Access Control (RBAC) Permission Matrix
 * Defining precise capabilities and data isolation boundaries across all platform personas.
 */
export const ROLE_CAPABILITIES_MATRIX: RoleCapability[] = [
  {
    id: 'field_boundary_geom',
    category: 'Spatial & Field GIS',
    label: 'Edit Field Spatial Polygon & Boundaries',
    description: 'Draw, edit, or adjust field perimeter coordinates and parcel GIS shapefiles.',
    farmer: 'ALLOW',
    agronomist: 'ALLOW',
    corporate: 'READ_ONLY',
    auditor: 'READ_ONLY',
    governingStandard: 'ISO 19115 Geographic Information Standard'
  },
  {
    id: 'in_situ_soil_upload',
    category: 'Soil Telemetry & Samples',
    label: 'Upload In-Situ Soil Core Lab Results (Dry Combustion)',
    description: 'Ingest laboratory bulk density, SOC %, and depth stratification lab certificates.',
    farmer: 'ALLOW',
    agronomist: 'ALLOW',
    corporate: 'READ_ONLY',
    auditor: 'READ_ONLY',
    governingStandard: 'ISO 10694:1995 Certified Lab Chain-of-Custody'
  },
  {
    id: 'satellite_calibration_override',
    category: 'Soil Telemetry & Samples',
    label: 'Calibrate Satellite Surface Telemetry & Thresholds',
    description: 'Adjust crop moisture critical thresholds and regional Sentinel-2 NDVI baselines.',
    farmer: 'ALLOW',
    agronomist: 'ALLOW',
    corporate: 'READ_ONLY',
    auditor: 'READ_ONLY',
    governingStandard: 'Copernicus Sentinel-2 Calibration Protocol'
  },
  {
    id: 'practice_event_logging',
    category: 'Practice Evidence',
    label: 'Log Regenerative Practices & Seed Invoices',
    description: 'Record cover cropping, reduced tillage, 4R nutrient reduction, or rotational grazing.',
    farmer: 'ALLOW',
    agronomist: 'ALLOW',
    corporate: 'READ_ONLY',
    auditor: 'READ_ONLY',
    governingStandard: 'USDA NRCS Practice Standard 340 / 329'
  },
  {
    id: 'mrv_methodology_switch',
    category: 'MRV Science Engine',
    label: 'Configure MRV Methodology (COMET vs IPCC)',
    description: 'Switch between USDA COMET-Farm empirical coefficients and IPCC Tier 1 emission factors.',
    farmer: 'READ_ONLY',
    agronomist: 'ALLOW',
    corporate: 'REQUIRES_APPROVAL',
    auditor: 'ALLOW',
    governingStandard: 'IPCC 2019 Refinement to National Inventories'
  },
  {
    id: 'carbon_lineage_verification',
    category: 'MRV Science Engine',
    label: 'Audit & Certify Carbon Data Lineage Hashes',
    description: 'Verify cryptographic provenance chain and sign audit-ready verification stamps.',
    farmer: 'READ_ONLY',
    agronomist: 'REQUIRES_APPROVAL',
    corporate: 'READ_ONLY',
    auditor: 'ALLOW',
    governingStandard: 'ISO 14064-3 Third-Party Validation Body'
  },
  {
    id: 'scope3_insetting_aggregation',
    category: 'Carbon Credit Ledger',
    label: 'Aggregate Scope 3 Supply Chain Insetting Ledgers',
    description: 'Roll up supplier farm carbon abatement into Scope 3 GHG corporate balance sheet.',
    farmer: 'PROHIBITED',
    agronomist: 'READ_ONLY',
    corporate: 'ALLOW',
    auditor: 'ALLOW',
    governingStandard: 'GHG Protocol Corporate Value Chain (Scope 3) Standard'
  },
  {
    id: 'export_audit_certificate_pdf',
    category: 'Carbon Credit Ledger',
    label: 'Generate Official Audit-Ready Compliance PDF & CSV',
    description: 'Generate timestamped, branded, compliance-grade documentation for buyers or verifiers.',
    farmer: 'ALLOW',
    agronomist: 'ALLOW',
    corporate: 'ALLOW',
    auditor: 'ALLOW',
    governingStandard: 'ISO 14065 GHG Validation Body Standards'
  },
  {
    id: 'client_consent_privacy',
    category: 'Governance & Privacy',
    label: 'Manage Data Sharing Consent & Supplier Anonymity',
    description: 'Grant or revoke access to farm raw yield and financial telemetry for downstream corporate buyers.',
    farmer: 'ALLOW',
    agronomist: 'REQUIRES_APPROVAL',
    corporate: 'PROHIBITED',
    auditor: 'READ_ONLY',
    governingStandard: 'Ag Data Transparent (ADT) Privacy Principles'
  }
];

/**
 * Shared Unified Data Model Entity Schemas
 * Core foundation specification that powers all personas and interfaces.
 */
export const SHARED_DATA_MODEL_ENTITIES: SharedDataEntitySchema[] = [
  {
    entityName: 'Farm',
    tableName: 'farms',
    description: 'Top-level enterprise or family farm operational boundary, aggregating client metadata and audit tier.',
    primaryKey: 'id (UUID v4)',
    foreignKeys: ['owner_user_id -> users.id', 'scope3_buyer_id -> corporate_buyers.id'],
    fields: [
      { name: 'id', type: 'UUID', description: 'Unique farm identifier', required: true, piiOrConfidential: false },
      { name: 'name', type: 'VARCHAR(128)', description: 'Operational farm legal name', required: true, piiOrConfidential: false },
      { name: 'client_or_supplier_name', type: 'VARCHAR(128)', description: 'Agronomist client or Scope 3 supplier account reference', required: true, piiOrConfidential: false },
      { name: 'region', type: 'VARCHAR(64)', description: 'County or administrative district', required: true, piiOrConfidential: false },
      { name: 'state_or_country', type: 'VARCHAR(64)', description: 'State, province, or nation', required: true, piiOrConfidential: false },
      { name: 'total_acreage', type: 'DECIMAL(10,2)', description: 'Total farm landholding in acres', required: true, piiOrConfidential: false },
      { name: 'persona_type', type: 'ENUM', description: 'Primary persona workspace (farmer, agronomist, corporate)', required: true, piiOrConfidential: false },
      { name: 'audit_status', type: 'ENUM', description: 'Audit tier: Audit-Ready, Under Review, or Draft', required: true, piiOrConfidential: false },
    ],
    dataSources: ['USDA FSA Form 578', 'Grower Self-Registration', 'Enterprise Supply Chain Master Data'],
    refreshFrequency: 'On demand / Annual review'
  },
  {
    entityName: 'Field',
    tableName: 'fields',
    description: 'Individual spatial agricultural parcel with geofenced boundary coordinates, crop rotation, and soil classification.',
    primaryKey: 'id (UUID v4)',
    foreignKeys: ['farm_id -> farms.id'],
    fields: [
      { name: 'id', type: 'UUID', description: 'Unique field parcel identifier', required: true, piiOrConfidential: false },
      { name: 'farm_id', type: 'UUID', description: 'Parent farm foreign key', required: true, piiOrConfidential: false },
      { name: 'name', type: 'VARCHAR(96)', description: 'Field designation (e.g. North 80 Prairie Loam)', required: true, piiOrConfidential: false },
      { name: 'acreage', type: 'DECIMAL(8,2)', description: 'Boundary calculated acreage', required: true, piiOrConfidential: false },
      { name: 'crop_type', type: 'VARCHAR(64)', description: 'Current standing crop rotation', required: true, piiOrConfidential: false },
      { name: 'soil_classification', type: 'VARCHAR(128)', description: 'USDA NRCS Soil Taxonomy Order & Series', required: true, piiOrConfidential: false },
      { name: 'baseline_soc_pct', type: 'DECIMAL(4,2)', description: 'Laboratory measured 0-30cm SOC baseline %', required: true, piiOrConfidential: false },
      { name: 'baseline_soc_stock_t_per_ha', type: 'DECIMAL(6,2)', description: 'Calculated baseline carbon stock in t C/ha', required: true, piiOrConfidential: false },
      { name: 'boundary_coordinates', type: 'JSONB / GEOMETRY(Polygon, 4326)', description: 'WGS84 polygon coordinates array', required: true, piiOrConfidential: false },
    ],
    dataSources: ['USDA SSURGO Soil Database', 'Client Shapefile Import', 'On-Screen Map Polygon Digitizer'],
    refreshFrequency: 'Real-time geometry sync'
  },
  {
    entityName: 'Satellite & Soil Telemetry',
    tableName: 'satellite_telemetry_records',
    description: 'Multispectral vegetation health indices and root-zone soil moisture readings from satellite and IoT probes.',
    primaryKey: 'id (UUID v4)',
    foreignKeys: ['field_id -> fields.id'],
    fields: [
      { name: 'id', type: 'UUID', description: 'Telemetry granule identifier', required: true, piiOrConfidential: false },
      { name: 'field_id', type: 'UUID', description: 'Associated field parcel ID', required: true, piiOrConfidential: false },
      { name: 'observation_date', type: 'DATE', description: 'Acquisition date', required: true, piiOrConfidential: false },
      { name: 'current_ndvi', type: 'DECIMAL(4,3)', description: 'Sentinel-2 BOA NDVI index (0.0 to 1.0)', required: true, piiOrConfidential: false },
      { name: 'surface_moisture_pct', type: 'DECIMAL(4,1)', description: 'Surface 0-10cm volumetric water content %', required: true, piiOrConfidential: false },
      { name: 'root_zone_moisture_pct', type: 'DECIMAL(4,1)', description: 'Root-zone 10-40cm volumetric water content %', required: true, piiOrConfidential: false },
      { name: 'cloud_cover_mask_pct', type: 'DECIMAL(4,2)', description: 'Screened cloud fraction over parcel', required: true, piiOrConfidential: false },
      { name: 'qa_score', type: 'DECIMAL(3,2)', description: 'Quality assurance atmospheric index', required: true, piiOrConfidential: false },
    ],
    dataSources: ['ESA Sentinel-2 Copernicus API', 'Open-Meteo High-Resolution Agricultural Model', 'In-Situ IoT Soil Probes'],
    refreshFrequency: 'Every 5 days (Sentinel-2 constellation orbit pass)'
  },
  {
    entityName: 'Practice Record',
    tableName: 'practice_evidence_ledger',
    description: 'Immutable ledger of regenerative agronomic management events with verification evidence.',
    primaryKey: 'id (UUID v4)',
    foreignKeys: ['field_id -> fields.id'],
    fields: [
      { name: 'id', type: 'UUID', description: 'Practice ledger transaction ID', required: true, piiOrConfidential: false },
      { name: 'field_id', type: 'UUID', description: 'Target field parcel ID', required: true, piiOrConfidential: false },
      { name: 'practice_type', type: 'ENUM', description: 'cover_crop, no_till, fertilizer_reduction, grazing_rotation, compost_biochar', required: true, piiOrConfidential: false },
      { name: 'title', type: 'VARCHAR(128)', description: 'Management action title', required: true, piiOrConfidential: false },
      { name: 'date_implemented', type: 'DATE', description: 'Field application timestamp', required: true, piiOrConfidential: false },
      { name: 'status', type: 'ENUM', description: 'verified, satellite_verified, self_reported', required: true, piiOrConfidential: false },
      { name: 'emission_reduction_factor', type: 'DECIMAL(5,3)', description: 'MT CO2e sequestered or abated per acre/yr', required: true, piiOrConfidential: false },
      { name: 'carbon_estimate_mt', type: 'DECIMAL(8,2)', description: 'Total metric tons CO2e for applied parcel', required: true, piiOrConfidential: false },
      { name: 'acreage_applied', type: 'DECIMAL(8,2)', description: 'Acreage receiving practice', required: true, piiOrConfidential: false },
    ],
    dataSources: ['ISO 11783 Tractor CAN-Bus', 'Seed & Fertilizer Purchase Invoices', 'Agronomist Field Audits'],
    refreshFrequency: 'Event-driven / Seasonal planting & harvest cycles'
  },
  {
    entityName: 'Carbon Insetting Claim & Lineage',
    tableName: 'carbon_data_lineage_claims',
    description: 'Cryptographically sealed carbon sequestration claims with full provenance trail and ISO 14064-2 compliance stamps.',
    primaryKey: 'id (UUID v4)',
    foreignKeys: ['field_id -> fields.id', 'farm_id -> farms.id'],
    fields: [
      { name: 'id', type: 'UUID', description: 'Claim serial identifier', required: true, piiOrConfidential: false },
      { name: 'lineage_root_hash', type: 'VARCHAR(66)', description: 'SHA-256 Merkle root hash of complete data pipeline', required: true, piiOrConfidential: false },
      { name: 'total_gross_mt', type: 'DECIMAL(10,2)', description: 'Gross metric tons CO2e sequestered', required: true, piiOrConfidential: false },
      { name: 'net_issuable_mt', type: 'DECIMAL(10,2)', description: 'Net creditable tons after 12.5% permanence buffer', required: true, piiOrConfidential: false },
      { name: 'methodology', type: 'VARCHAR(64)', description: 'Quantification standard (COMET-Farm / IPCC Tier 1)', required: true, piiOrConfidential: false },
      { name: 'confidence_score_pct', type: 'DECIMAL(4,1)', description: 'Overall lineage confidence score %', required: true, piiOrConfidential: false },
      { name: 'sbti_flag_eligible', type: 'BOOLEAN', description: 'Eligible for Corporate Scope 3 FLAG reporting', required: true, piiOrConfidential: false },
      { name: 'verified_at', type: 'TIMESTAMP', description: 'Audit verification timestamp', required: true, piiOrConfidential: false },
    ],
    dataSources: ['TerraSoil MRV Engine', 'Third-Party Independent Verification Bodies (VVB)', 'Registry Smart Ledgers'],
    refreshFrequency: 'Annual issuance & compliance reconciliation'
  }
];
