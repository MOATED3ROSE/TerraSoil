import { DataStateType } from '../components/DataStateBadge';

export interface ClaimRegisterEntry {
  id: string;
  claimShort: string;
  claimFullText: string;
  category: 'satellite_telemetry' | 'soil_moisture' | 'carbon_methodology' | 'assurance_reporting' | 'legal_governance';
  dataState: DataStateType;
  governingStandard: string;
  primarySource: string;
  methodologyDescription: string;
  uncertaintyEstimate: string;
  applicableSurfaces: string[];
  ownerRole: string;
  lastReviewedDate: string;
  status: 'approved' | 'provisional_worked_example' | 'under_review';
  qualificationsNote: string;
}

export const CLAIMS_REGISTER: ClaimRegisterEntry[] = [
  {
    id: 'CLAIM-S1',
    claimShort: '12-Day Platform Update Interval',
    claimFullText: 'Telemetry reflects a 12-day composite platform update interval; Copernicus Sentinel-2 nominal constellation revisit is 5 days at the equator.',
    category: 'satellite_telemetry',
    dataState: 'observed',
    governingStandard: 'Copernicus Sentinel-2 MSI Level-2A BOA Surface Reflectance',
    primarySource: 'ESA Copernicus Sentinel-2 MSI Constellation',
    methodologyDescription: 'The 12-day cadence is TerraSoil\'s platform composite update interval, which buffers for cloud-obscured scenes and mosaic generation, rather than the raw 5-day orbital orbital return frequency.',
    uncertaintyEstimate: '±2 days depending on local cloud cover and scene filtering (max 20% cloud threshold)',
    applicableSurfaces: ['Website Hero', 'Satellite Dashboard', 'Field Evidence Report'],
    ownerRole: 'Remote Sensing & GIS Lead',
    lastReviewedDate: '2026-10-08',
    status: 'approved',
    qualificationsNote: 'Must always be described as "platform update interval", never as satellite revisit period. Actual acquisition date and cloud fraction must be displayed on every pass.',
  },
  {
    id: 'CLAIM-S2',
    claimShort: 'Multispectral Optical vs Radar Moisture Separation',
    claimFullText: 'Optical NDVI canopy vigor is acquired from Sentinel-2 MSI (10m); soil moisture is derived from Sentinel-1 C-band SAR and NASA SMAP microwave observations.',
    category: 'satellite_telemetry',
    dataState: 'observed',
    governingStandard: 'ESA Sentinel-1 SAR & Sentinel-2 MSI Data Specifications',
    primarySource: 'Copernicus Sentinel-1 (C-band SAR) & Sentinel-2 (MSI Optical)',
    methodologyDescription: 'Optical multispectral bands (B4 Red, B8 NIR) are processed exclusively for vegetative canopy greenness. Soil moisture anomalies are acquired separately via Sentinel-1 Synthetic Aperture Radar backscatter cross-ratio (VH/VV) and SMAP L-band radar.',
    uncertaintyEstimate: '10m spatial resolution for optical; 20m for SAR backscatter resampled to field polygon',
    applicableSurfaces: ['Website Science Section', 'Satellite Dashboard', 'Field Evidence Report'],
    ownerRole: 'Remote Sensing & GIS Lead',
    lastReviewedDate: '2026-10-08',
    status: 'approved',
    qualificationsNote: 'Never conflate Sentinel-2 with radar instruments. Always disclose separate optical vs microwave sensor lineages.',
  },
  {
    id: 'CLAIM-S3',
    claimShort: 'Modeled Root-Zone Moisture (0–100cm)',
    claimFullText: 'Root-zone moisture (10–40cm and 0–100cm) is modeled using surface radar backscatter, soil hydraulic transfer functions, and precipitation water-balance physics, not direct probe telemetry.',
    category: 'soil_moisture',
    dataState: 'modeled',
    governingStandard: 'USDA-NRCS Soil Water Characteristics & Open-Meteo Land Surface Model (ERA5-Land)',
    primarySource: 'Sentinel-1 SAR surface layer + Soil Texture SSURGO Pedotransfer Model',
    methodologyDescription: 'Root-zone moisture is an inferred hydrologic model combining microwave skin-depth backscatter (top 0-5cm) with soil texture bulk density and antecedent precipitation evapotranspiration water-balance equations.',
    uncertaintyEstimate: '±18% volumetric water content relative to in-situ gravimetric probe calibration',
    applicableSurfaces: ['Website Hero & Science', 'Satellite Dashboard', 'Field Evidence Report'],
    ownerRole: 'Hydrology & Soil Physics Lead',
    lastReviewedDate: '2026-10-08',
    status: 'approved',
    qualificationsNote: 'Must be explicitly labeled as "Modeled Root-Zone Moisture" with depth interval, input variables, and uncertainty stated adjacent to the metric.',
  },
  {
    id: 'CLAIM-S4',
    claimShort: 'Empirical Factor Carbon Calculation Engine',
    claimFullText: 'Carbon estimates use a standardized empirical factor engine calibrated to published USDA COMET-Farm v1.4 regional coefficients and IPCC Tier 1 defaults; not a direct live DayCent simulation.',
    category: 'carbon_methodology',
    dataState: 'modeled',
    governingStandard: 'IPCC 2019 Refinement to 2006 Guidelines & USDA COMET-Farm Regional Tables (v1.4)',
    primarySource: 'IPCC Tier 1 Table 5.5 / COMET-Farm Cropland Reference Data',
    methodologyDescription: 'TerraSoil implements a regional lookup and practice reduction factor calculation engine. While calibrated against COMET-Farm reference outputs and USDA SSURGO soils, full process-based DayCent kinetic simulations require formal COMET-Farm platform export.',
    uncertaintyEstimate: '±22% model uncertainty on annual soil organic carbon accretion rates',
    applicableSurfaces: ['Website Pricing & Science', 'Carbon Estimator', 'Field Evidence Report'],
    ownerRole: 'Lead Agronomist & Carbon Methodologist',
    lastReviewedDate: '2026-10-08',
    status: 'approved',
    qualificationsNote: 'Disclose methodology version (v1.4) and clarify that estimates are empirical factor calculations, not lab-verified core samples or full process-based dynamic DayCent runs.',
  },
  {
    id: 'CLAIM-S5',
    claimShort: '0.42–0.55 tCO₂e/ac/yr Worked Example Benchmark',
    claimFullText: '0.42–0.55 tCO₂e/ac/yr is an illustrative worked example for multi-species cover cropping and no-till on Midwest US fine-loamy Mollisol soils, not a universal guarantee.',
    category: 'carbon_methodology',
    dataState: 'modeled',
    governingStandard: 'USDA COMET-Farm Midwest Corn-Soybean Rotation Benchmark',
    primarySource: 'Heartland demonstration baseline (Iowa fine-loamy Mollisol, multi-species rye-vetch mix + no-till)',
    methodologyDescription: 'Derived by stacking USDA COMET-Farm Midwest cover crop factor (0.32 tCO₂e/ac/yr) with reduced tillage factor (0.18 tCO₂e/ac/yr), with a 15% conservative discount buffer.',
    uncertaintyEstimate: '±22% model uncertainty; actual field accretion varies by soil clay fraction, rainfall, and baseline SOM',
    applicableSurfaces: ['Website Hero Metrics', 'Carbon Estimator', 'Sample Report'],
    ownerRole: 'Lead Agronomist & Carbon Methodologist',
    lastReviewedDate: '2026-10-08',
    status: 'provisional_worked_example',
    qualificationsNote: 'Must always be identified as a "Worked Example Benchmark" with geographical, practice, and soil assumptions displayed adjacent to the number.',
  },
  {
    id: 'CLAIM-S6',
    claimShort: 'Field Evidence Report (Not Independently Verified)',
    claimFullText: 'The $99 standalone product and PDF export are titled "Field Evidence Report". All modeled outputs carry a prominent "Not independently verified" badge until an accredited auditor reviews them.',
    category: 'assurance_reporting',
    dataState: 'modeled',
    governingStandard: 'ISO 14064-2:2019 Project Documentation / GHG Protocol Land Sector MRV Guidance',
    primarySource: 'TerraSoil Ingestion & Calculation Ledger',
    methodologyDescription: 'The deliverable is an evidentiary dossier compiling observed field boundaries, satellite vegetation passes, and calculation lineage. It prepares farms for audit; it does not constitute an audit opinion.',
    uncertaintyEstimate: 'Documentation accuracy: 100% cryptographic log match; Carbon estimate accuracy: ±22%',
    applicableSurfaces: ['Website Pricing', 'Navbar', 'ComplianceReportModal', 'Legal Covenant'],
    ownerRole: 'Compliance & Legal Counsel',
    lastReviewedDate: '2026-10-08',
    status: 'approved',
    qualificationsNote: 'Supersedes both "Audit Report" (PRD-13) and "Field Verification Report" (PRD-16). Never state that a report certifies carbon credits.',
  },
  {
    id: 'CLAIM-S7',
    claimShort: 'Adjacent Qualifications Standard',
    claimFullText: 'All quantitative metrics, satellite intervals, and carbon estimates carry inline or adjacent qualification footnotes and data-state tags directly on the viewing surface.',
    category: 'assurance_reporting',
    dataState: 'observed',
    governingStandard: 'PRD-17 Content Accuracy & Consumer Protection Covenant',
    primarySource: 'TerraSoil Public Governance Framework',
    methodologyDescription: 'Qualifications are never relegated exclusively to distant FAQ sections. Data state badges ([Observed], [Modeled], [Independently Verified]) appear on every map layer, dashboard KPI, and report line.',
    uncertaintyEstimate: 'Zero un-annotated public numeric claims',
    applicableSurfaces: ['All Public & In-App Surfaces'],
    ownerRole: 'Head of Product & Governance',
    lastReviewedDate: '2026-10-08',
    status: 'approved',
    qualificationsNote: 'Enforced via automated lint checks and Claims Register review prior to any release.',
  },
  {
    id: 'CLAIM-S8',
    claimShort: '100% Farmer Data Rights Covenant',
    claimFullText: 'Growers retain 100% proprietary ownership of field boundaries, practice logs, and yield telemetry. TerraSoil never sells or licenses data to commodity traders or advertisers.',
    category: 'legal_governance',
    dataState: 'observed',
    governingStandard: 'Ag Data Transparent (ADT) Principles & GDPR / CCPA Agricultural Privacy Framework',
    primarySource: 'TerraSoil Legal Covenant & Terms of Service §4',
    methodologyDescription: 'Enforced via tenant-isolated data structures, encrypted at rest (AES-256) and in transit (TLS 1.3), with role-based access control preventing unauthorized cross-farm aggregation.',
    uncertaintyEstimate: 'Contractually and cryptographically guaranteed',
    applicableSurfaces: ['Website Trust Section', 'Legal Modal', 'Account Settings'],
    ownerRole: 'Legal & Governance Counsel',
    lastReviewedDate: '2026-10-08',
    status: 'approved',
    qualificationsNote: 'Requires user-initiated authorization before any third-party advisor or corporate buyer can access field telemetry.',
  },
];
