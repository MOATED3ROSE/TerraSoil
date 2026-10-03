import { 
  PersonalActivityJournalEntry, 
  WorkspaceProject, 
  EvidenceLibraryItem, 
  SavedMapView, 
  SavedReportItem, 
  WorkspaceTask, 
  WorkspaceNotification, 
  ProfessionalIdentityProfile, 
  UserPersona 
} from '../types';

export interface RoleImpactMetrics {
  role: UserPersona;
  headline: string;
  metrics: {
    label: string;
    value: string;
    subtext: string;
    changeTrend?: string;
  }[];
  summaryText: string;
}

// =========================================================================
// 1. ACTIVITY JOURNAL (P0) — Meaningful Actions Grouped by Day
// =========================================================================
export const MOCK_ACTIVITY_JOURNAL: Record<UserPersona, PersonalActivityJournalEntry[]> = {
  farmer: [
    {
      id: 'act-f-01',
      timestamp: '2026-10-03T14:32:00Z',
      dateGroup: 'Today',
      timeStr: '14:32',
      actionType: 'field_updated',
      title: 'Field Updated: North Section 14',
      detail: 'Tillage management transitioned from Conventional to Strip-Till (Verified by satellite residue index).',
      targetName: 'North Section 14',
      targetType: 'field',
      targetId: 'field-1',
      actionLabel: 'Inspect in GIS',
      actionTab: 'map',
    },
    {
      id: 'act-f-02',
      timestamp: '2026-10-03T13:18:00Z',
      dateGroup: 'Today',
      timeStr: '13:18',
      actionType: 'soil_sample_added',
      title: 'Soil Sample Added: River Bottom Flat',
      detail: '0–30cm laboratory core result recorded: SOC 3.10% (gain of +0.35% vs 2024 baseline).',
      targetName: 'River Bottom Flat',
      targetType: 'field',
      targetId: 'field-2',
      actionLabel: 'View Telemetry',
      actionTab: 'satellite',
    },
    {
      id: 'act-f-03',
      timestamp: '2026-10-03T11:47:00Z',
      dateGroup: 'Today',
      timeStr: '11:47',
      actionType: 'report_generated',
      title: 'Report Generated: Heartland Farm Sustainability Dossier',
      detail: 'Audit-ready compliance export compiled for 2026 USDA EQIP & Carbon Inset qualification.',
      targetName: 'Heartland Farm Dossier',
      targetType: 'report',
      actionLabel: 'View Report',
    },
    {
      id: 'act-f-04',
      timestamp: '2026-10-02T16:21:00Z',
      dateGroup: 'Yesterday',
      timeStr: '16:21',
      actionType: 'practice_logged',
      title: 'Practice Logged: Winter Cereal Rye Cover Seeding',
      detail: 'Enrolled 420 acres on East Ridge Parcel seeded at 55 lbs/acre with seed purchase invoice attached.',
      targetName: 'East Ridge Parcel',
      targetType: 'field',
      actionLabel: 'View Ledger',
      actionTab: 'practices',
    },
    {
      id: 'act-f-05',
      timestamp: '2026-10-02T09:40:00Z',
      dateGroup: 'Yesterday',
      timeStr: '09:40',
      actionType: 'evidence_uploaded',
      title: 'Evidence Uploaded: Haney Soil Health Laboratory Panel',
      detail: 'Certified lab report (Ward Laboratories, Lincoln NE) uploaded and cryptographically hashed.',
      targetName: 'Haney Test 2026.pdf',
      targetType: 'evidence',
      actionLabel: 'View Evidence',
    },
    {
      id: 'act-f-06',
      timestamp: '2026-09-29T15:10:00Z',
      dateGroup: 'This Week',
      timeStr: '15:10',
      actionType: 'map_saved',
      title: 'Saved Map View: North Section — SOC Monitoring',
      detail: 'Saved local GIS layer preset with 5-year soil organic carbon overlay and centroid markers.',
      targetName: 'North Section — SOC Monitoring',
      targetType: 'field',
      actionLabel: 'Open Map',
      actionTab: 'map',
    },
    {
      id: 'act-f-07',
      timestamp: '2026-09-25T11:00:00Z',
      dateGroup: 'Earlier',
      timeStr: '11:00',
      actionType: 'recommendation_created',
      title: 'Agronomic Adjustment: Split-Application Nitrogen Plan',
      detail: 'Applied variable-rate sidedress reducing total synthetic N by 22 lbs/acre across corn acres.',
      targetName: 'Heartland Operations',
      targetType: 'farm',
      actionLabel: 'View Estimator',
      actionTab: 'estimator',
    }
  ],
  agronomist: [
    {
      id: 'act-a-01',
      timestamp: '2026-10-03T15:10:00Z',
      dateGroup: 'Today',
      timeStr: '15:10',
      actionType: 'recommendation_created',
      title: 'Prescription Dispatched: Cover Crop Mix for Green Valley Farm',
      detail: 'Prescribed 4-species mix (Rye, Crimson Clover, Radish, Vetch) for 6 client parcels (1,480 ac).',
      targetName: 'Green Valley Farm',
      targetType: 'project',
      actionLabel: 'View Project',
    },
    {
      id: 'act-a-02',
      timestamp: '2026-10-03T12:05:00Z',
      dateGroup: 'Today',
      timeStr: '12:05',
      actionType: 'report_generated',
      title: 'Branded Report Exported: Client Q3 Carbon Audit Dossier',
      detail: 'Generated client-ready executive summary for Prairie View Holdings with custom emission calibrations.',
      targetName: 'Prairie View Q3 Report',
      targetType: 'report',
      actionLabel: 'View PDF',
    },
    {
      id: 'act-a-03',
      timestamp: '2026-10-02T14:15:00Z',
      dateGroup: 'Yesterday',
      timeStr: '14:15',
      actionType: 'field_updated',
      title: 'Field Verification Completed: Miller Creek Parcel 4',
      detail: 'Ground-truthed no-till residue coverage (68% cover) and validated satellite Sentinel-2 index.',
      targetName: 'Miller Creek Parcel 4',
      targetType: 'field',
      actionLabel: 'Open GIS',
      actionTab: 'map',
    },
    {
      id: 'act-a-04',
      timestamp: '2026-09-30T16:50:00Z',
      dateGroup: 'This Week',
      timeStr: '16:50',
      actionType: 'soil_sample_added',
      title: 'Bulk Soil Cores Ingested: 18 Geo-Referenced Sample Points',
      detail: 'Imported Midwest Laboratories batch data for Lancaster County client group.',
      targetName: 'Lancaster Client Cohort',
      targetType: 'farm',
      actionLabel: 'View Telemetry',
      actionTab: 'satellite',
    }
  ],
  corporate: [
    {
      id: 'act-c-01',
      timestamp: '2026-10-03T14:00:00Z',
      dateGroup: 'Today',
      timeStr: '14:00',
      actionType: 'report_generated',
      title: 'Scope 3 Land Sector Decarbonization Export',
      detail: 'Aggregated 145,000 enrolled acres across 28 suppliers under GHG Protocol Land Sector Guidance.',
      targetName: 'Scope 3 Supply Shed 2026',
      targetType: 'report',
      actionLabel: 'View Inset Ledger',
    },
    {
      id: 'act-c-02',
      timestamp: '2026-10-03T10:30:00Z',
      dateGroup: 'Today',
      timeStr: '10:30',
      actionType: 'evidence_uploaded',
      title: 'Cryptographic Lineage Bundle Verified',
      detail: 'Audited SHA-256 merkle root for Iowa River Basin Tier-1 supplier cluster (12,400 tCO2e).',
      targetName: 'Merkle Bundle #8841',
      targetType: 'evidence',
      actionLabel: 'Audit Lineage',
    },
    {
      id: 'act-c-03',
      timestamp: '2026-10-01T15:20:00Z',
      dateGroup: 'This Week',
      timeStr: '15:20',
      actionType: 'map_saved',
      title: 'Saved Regional View: High Water-Risk Supply Sheds',
      detail: 'Global geographic map preset filtering drought-stressed grain elevators and root-zone deficits.',
      targetName: 'High Water-Risk Regions',
      targetType: 'farm',
      actionLabel: 'Open Global Map',
      actionTab: 'map',
    }
  ],
  auditor: [
    {
      id: 'act-v-01',
      timestamp: '2026-10-03T13:45:00Z',
      dateGroup: 'Today',
      timeStr: '13:45',
      actionType: 'field_updated',
      title: 'ISO 14064-3 Verification Sign-Off: Heartland Project 2026',
      detail: 'Issued digital assurance opinion with zero material misstatements detected across 2,450 enrolled acres.',
      targetName: 'Heartland Organic Project',
      targetType: 'project',
      actionLabel: 'View Certificate',
    },
    {
      id: 'act-v-02',
      timestamp: '2026-10-02T11:15:00Z',
      dateGroup: 'Yesterday',
      timeStr: '11:15',
      actionType: 'evidence_uploaded',
      title: 'Ground-Truth Soil Core Verification Dossier Ingested',
      detail: 'Cross-referenced 3rd-party laboratory chain of custody with satellite NDVI reflectance records.',
      targetName: 'Dossier #VERRA-VM0042-084',
      targetType: 'evidence',
      actionLabel: 'View Dossier',
    }
  ]
};

// =========================================================================
// 2. PROJECTS / PROJECT DIARY (P1)
// =========================================================================
export const MOCK_WORKSPACE_PROJECTS: WorkspaceProject[] = [
  {
    id: 'proj-01',
    name: 'Green Valley Soil Program',
    farmName: 'Heartland Organic Grains & Cattle Co.',
    fieldsCount: 12,
    acres: 2840,
    progressPct: 82,
    lastActivity: 'Today at 14:32',
    nextTask: 'Soil sampling — Field 18 (Due Oct 6)',
    status: 'active',
    primaryPractice: 'Cover Crops & Strip-Till',
    timeline: [
      { id: 'tl-1', dateStr: 'Oct 3', status: 'done', title: 'Soil samples imported & calibrated', notes: 'Ward Lab cores integrated into SOC depth curve' },
      { id: 'tl-2', dateStr: 'Oct 2', status: 'done', title: 'Field boundaries verified via GIS', notes: 'Polygon vertices checked against USDA CLU parcels' },
      { id: 'tl-3', dateStr: 'Sep 30', status: 'warning', title: '4 missing fertilizer application records', notes: 'Grower notified to upload fall N invoices' },
      { id: 'tl-4', dateStr: 'Sep 27', status: 'done', title: 'Baseline SOC & VWC modeled', notes: 'COMET-Farm baseline fixed at 2.42% SOC' },
      { id: 'tl-5', dateStr: 'Sep 22', status: 'info', title: 'Project created & charter signed', notes: 'Enrolled in 2026 Regional Decarbonization Pool' }
    ]
  },
  {
    id: 'proj-02',
    name: 'Upper Des Moines River Basin Inset',
    farmName: 'Prairie View Holdings Cohort',
    fieldsCount: 18,
    acres: 4200,
    progressPct: 65,
    lastActivity: 'Yesterday at 16:21',
    nextTask: 'Verify no-till satellite residue index (Due Oct 9)',
    status: 'active',
    primaryPractice: 'No-Till & Nutrient Reduction',
    timeline: [
      { id: 'tl-201', dateStr: 'Oct 2', status: 'done', title: 'Cover crop seeding verified by Sentinel-2', notes: 'Greenness spike detected post-harvest' },
      { id: 'tl-202', dateStr: 'Sep 28', status: 'done', title: 'Synthetic nitrogen reduction target logged', notes: 'Targeting 25% synthetic urea reduction' },
      { id: 'tl-203', dateStr: 'Sep 20', status: 'pending', title: 'Mid-season nitrate leaching lysimeter check', notes: 'Awaiting sensor battery swap' }
    ]
  },
  {
    id: 'proj-03',
    name: 'Midwest Regenerative Grain Decarbonization',
    farmName: 'AgriGlobal Supply Shed Cluster A',
    fieldsCount: 30,
    acres: 8900,
    progressPct: 92,
    lastActivity: 'Oct 1 at 11:00',
    nextTask: 'Finalize VVB verifier audit dossier (Due Oct 14)',
    status: 'in_review',
    primaryPractice: 'Multi-Stack Regenerative Suite',
    timeline: [
      { id: 'tl-301', dateStr: 'Oct 1', status: 'done', title: 'Scope 3 emission intensity calibrated', notes: '0.41 kg CO2e / bushel achieved (vs 0.74 benchmark)' },
      { id: 'tl-302', dateStr: 'Sep 24', status: 'done', title: 'All 30 parcel boundary shapefiles validated', notes: 'Complete cadastral parity' },
      { id: 'tl-303', dateStr: 'Sep 15', status: 'done', title: 'Supplier contract sign-offs gathered', notes: '28 participating producers confirmed' }
    ]
  }
];

// =========================================================================
// 3. MY IMPACT METRICS (P1) — Role-Dependent Real Counters
// =========================================================================
export const MOCK_ROLE_IMPACTS: Record<UserPersona, RoleImpactMetrics> = {
  farmer: {
    role: 'farmer',
    headline: 'Farm Stewardship & Direct Benefit Metrics (PRD-02)',
    summaryText: 'Aggregated biological and economic gains across all enrolled Heartland parcels under active regenerative management.',
    metrics: [
      { label: 'Acres Managed', value: '2,450', subtext: '100% geo-fenced & mapped', changeTrend: '+450 ac vs 2025' },
      { label: 'Water Storage Capacity', value: '+66.1M gal', subtext: '27,000 gal/ac per 1% SOC gain', changeTrend: '+18.4% infiltration buffer' },
      { label: 'Practices Implemented', value: '5 Stacked', subtext: 'Cover rye, no-till, compost biochar', changeTrend: '100% compliant' },
      { label: 'tCO₂e Tracked', value: '1,842 MT', subtext: 'Estimated annual carbon abatement', changeTrend: '$64,470 est. carbon revenue' }
    ]
  },
  agronomist: {
    role: 'agronomist',
    headline: 'Consulting Portfolio & Client Performance (PRD-03)',
    summaryText: 'Operational scope and documentation throughput across your regional advisory client network.',
    metrics: [
      { label: 'Farms Managed', value: '14 Operations', subtext: 'Across 6 counties in NE & IA', changeTrend: '3 new clients this quarter' },
      { label: 'Total Acres Advised', value: '18,200 ac', subtext: 'Enrolled in regenerative transitions', changeTrend: '+4,200 ac in 2026' },
      { label: 'Practices Documented', value: '48 Field Logs', subtext: 'Cover crop, nutrient, strip-till stacks', changeTrend: '98% verified' },
      { label: 'Reports Generated', value: '36 Dossiers', subtext: 'Client audit & grant application PDFs', changeTrend: '100% acceptance rate' }
    ]
  },
  corporate: {
    role: 'corporate',
    headline: 'Scope 3 Supply Shed Insetting & ESG Progress (PRD-04)',
    summaryText: 'Scope 3 Land Sector greenhouse gas removals and primary supplier verification across your procurement shed.',
    metrics: [
      { label: 'Supplier Operations', value: '28 Farms', subtext: 'Direct contracted grain suppliers', changeTrend: 'Tier-1 accredited' },
      { label: 'Acres Represented', value: '145,000 ac', subtext: 'Upper Midwest river catchment', changeTrend: '92% boundary precision' },
      { label: 'tCO₂e Accounted', value: '480,000 MT', subtext: 'Baseline Scope 3 agricultural volume', changeTrend: '-14.8% emission intensity' },
      { label: 'Primary Data Coverage', value: '78.4%', subtext: 'Cryptographically hashed farm records', changeTrend: '+22% vs secondary models' }
    ]
  },
  auditor: {
    role: 'auditor',
    headline: 'Verification Assurance & Audit Quality (PRD-05)',
    summaryText: 'Independent Validation & Verification Body assurance volume under ISO 14064-3 and Verra VM0042 standards.',
    metrics: [
      { label: 'Projects Audited', value: '42 Programs', subtext: 'Agricultural carbon initiatives', changeTrend: 'Zero non-conformances' },
      { label: 'Credits Verified', value: '2.1M tCO₂e', subtext: 'Certified carbon removal units', changeTrend: '100% VVB seal endorsed' },
      { label: 'Evidence Dossiers', value: '156 Bundles', subtext: 'Lab tests, satellite proofs, invoices', changeTrend: 'Complete audit trail' },
      { label: 'Assurance Pass Rate', value: '98.2%', subtext: 'First-pass ISO 14064-3 compliance', changeTrend: 'Exceeds ANSI benchmark' }
    ]
  }
};

// =========================================================================
// 4. MY EVIDENCE (P0) — Comprehensive Evidence Library
// =========================================================================
export const MOCK_EVIDENCE_LIBRARY: EvidenceLibraryItem[] = [
  {
    id: 'ev-01',
    title: 'Ward Laboratories Comprehensive Soil Health & SOC Panel',
    category: 'Soil Tests',
    fieldName: 'North Section 14',
    farmName: 'Heartland Organic Grains',
    uploadDate: '2026-10-02',
    fileType: 'pdf',
    fileSizeStr: '2.4 MB',
    verificationStatus: 'verified',
    cryptographicHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    uploadedBy: 'Dale Henderson',
    description: 'Dry combustion LECO analysis documenting 2.85% SOC at 0–30cm depth.'
  },
  {
    id: 'ev-02',
    title: 'Midwest Seed Supply — Cereal Rye & Hairy Vetch Invoice',
    category: 'Invoices',
    fieldName: 'East Ridge Parcel',
    farmName: 'Heartland Organic Grains',
    uploadDate: '2026-09-28',
    fileType: 'pdf',
    fileSizeStr: '840 KB',
    verificationStatus: 'verified',
    cryptographicHash: 'sha256:4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123',
    uploadedBy: 'Dale Henderson',
    description: 'Itemized certified seed bill for 23,100 lbs Winter Cereal Rye ($14,200).'
  },
  {
    id: 'ev-03',
    title: 'Sentinel-2 Multispectral Surface Reflectance Geotiff',
    category: 'Satellite Evidence',
    fieldName: 'North Section 14',
    farmName: 'Heartland Organic Grains',
    uploadDate: '2026-09-25',
    fileType: 'geotiff',
    fileSizeStr: '18.6 MB',
    verificationStatus: 'verified',
    cryptographicHash: 'sha256:99887766554433221100aabbccddeeff00112233445566778899aabbccddeeff',
    uploadedBy: 'Copernicus Hub Stream',
    description: 'B8/B4 NDVI array confirming uniform vegetation greenness index of 0.76.'
  },
  {
    id: 'ev-04',
    title: 'John Deere Operations Center Telemetry Log — Strip-Till Run',
    category: 'Practice Verification',
    fieldName: 'River Bottom Flat',
    farmName: 'Heartland Organic Grains',
    uploadDate: '2026-09-20',
    fileType: 'csv',
    fileSizeStr: '4.1 MB',
    verificationStatus: 'verified',
    cryptographicHash: 'sha256:11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    uploadedBy: 'John Deere Cloud API',
    description: 'Tractor fuel rate, GPS speed, and shank depth (8 inches) time-series data.'
  },
  {
    id: 'ev-05',
    title: 'Geotagged Drone Imagery — Post-Seeding Emergence',
    category: 'Field Photos',
    fieldName: 'East Ridge Parcel',
    farmName: 'Heartland Organic Grains',
    uploadDate: '2026-09-18',
    fileType: 'jpg',
    fileSizeStr: '6.2 MB',
    verificationStatus: 'verified',
    cryptographicHash: 'sha256:5566778899001122334455667788990011223344556677889900112233445566',
    uploadedBy: 'Dale Henderson',
    description: 'High-res 4K photograph with EXIF GPS coordinates: 42.0612° N, 93.5824° W.'
  },
  {
    id: 'ev-06',
    title: 'Variable-Rate Nitrogen Reduction Billing & Ag-Chem Ledger',
    category: 'Fertilizer Records',
    fieldName: 'South Pasture',
    farmName: 'Heartland Organic Grains',
    uploadDate: '2026-09-12',
    fileType: 'pdf',
    fileSizeStr: '1.2 MB',
    verificationStatus: 'pending_audit',
    cryptographicHash: 'sha256:3344556677889900112233445566778899001122334455667788990011223344',
    uploadedBy: 'Heartland Ag Co-Op',
    description: 'Side-dress application tickets verifying 30 lbs/acre synthetic N reduction.'
  },
  {
    id: 'ev-07',
    title: 'County Cadastral Parcel Lease & Stewardship Agreement',
    category: 'Farm Records',
    fieldName: 'North Section 14',
    farmName: 'Heartland Organic Grains',
    uploadDate: '2026-08-30',
    fileType: 'pdf',
    fileSizeStr: '3.8 MB',
    verificationStatus: 'verified',
    cryptographicHash: 'sha256:7788990011223344556677889900112233445566778899001122334455667788',
    uploadedBy: 'Story County Recorder',
    description: '10-year rolling conservation lease establishing long-term land control permanence.'
  },
  {
    id: 'ev-08',
    title: 'Verra VM0042 Verification Assurance Statement (Draft)',
    category: 'Reports',
    fieldName: 'Whole Farm Portfolio',
    farmName: 'Heartland Organic Grains',
    uploadDate: '2026-08-15',
    fileType: 'pdf',
    fileSizeStr: '5.5 MB',
    verificationStatus: 'verified',
    cryptographicHash: 'sha256:aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
    uploadedBy: 'Sarah Sterling, PE',
    description: 'Third-party VVB technical evaluation confirming additionality and non-reversal baseline.'
  }
];

// =========================================================================
// 5. SAVED MAPS (P1)
// =========================================================================
export const MOCK_SAVED_MAPS: SavedMapView[] = [
  {
    id: 'smap-01',
    name: 'North Section — SOC Monitoring',
    system: 'Local GIS',
    layer: 'Soil Organic Carbon (SOC %)',
    fieldOrRegionName: 'North Section 14',
    savedDateStr: 'Saved 2 days ago',
    notes: 'Preset with 0–30cm depth calibrated layer and NDVI anomaly pins.',
    centerLat: 42.062,
    centerLng: -93.584,
    zoom: 15
  },
  {
    id: 'smap-02',
    name: 'US Wheat Supply Chain',
    system: 'Geographic Map',
    layer: 'Supply Chain Insetting & Scope 3',
    fieldOrRegionName: 'Northern Great Plains & Upper Midwest',
    savedDateStr: 'Saved Sept 29',
    notes: 'Regional grain terminal radius with primary supplier cluster pins.',
    centerLat: 44.5,
    centerLng: -98.2,
    zoom: 6
  },
  {
    id: 'smap-03',
    name: 'High Water-Risk Regions & Deficits',
    system: 'Geographic Map',
    layer: 'Root-Zone Moisture & Drought Vulnerability',
    fieldOrRegionName: 'Central Iowa Catchment',
    savedDateStr: 'Saved Sept 21',
    notes: 'Highlights sub-15% VWC drought parcels requiring cover crop moisture buffers.',
    centerLat: 42.1,
    centerLng: -93.6,
    zoom: 8
  },
  {
    id: 'smap-04',
    name: 'East Pasture — Moisture & Trafficability Heatmap',
    system: 'Local GIS',
    layer: '7-Day Precipitation Heatmap Overlay',
    fieldOrRegionName: 'East Ridge Parcel',
    savedDateStr: 'Saved Yesterday',
    notes: 'Tracks post-rain tractor trafficability and equipment runoff safety thresholds.',
    centerLat: 42.058,
    centerLng: -93.578,
    zoom: 15
  }
];

// =========================================================================
// 6. SAVED REPORTS (P1)
// =========================================================================
export const MOCK_SAVED_REPORTS: SavedReportItem[] = [
  {
    id: 'srep-01',
    title: 'Heartland Farm Comprehensive Sustainability Dossier',
    type: 'Farm Sustainability Dossier',
    farmName: 'Heartland Organic Grains & Cattle Co.',
    dateGenerated: '2026-10-03',
    status: 'Final',
    fileSizeStr: '4.8 MB',
    summaryMetrics: '2,450 ac • 1,842 tCO2e/yr • $64,470 est. ROI'
  },
  {
    id: 'srep-02',
    title: 'Scope 3 Supply Shed Decarbonization Inset Summary',
    type: 'Scope 3 Supplier Inset Report',
    farmName: 'AgriGlobal Supply Shed Cluster A',
    dateGenerated: '2026-09-30',
    status: 'Final',
    fileSizeStr: '8.2 MB',
    summaryMetrics: '145,000 ac • 28 Suppliers • GHG Land Sector Compliant'
  },
  {
    id: 'srep-03',
    title: 'Multi-Year Soil Organic Carbon Baseline Assessment',
    type: 'Soil Carbon Baseline Assessment',
    farmName: 'Heartland Organic Grains & Cattle Co.',
    dateGenerated: '2026-09-22',
    status: 'Verified',
    fileSizeStr: '3.1 MB',
    summaryMetrics: 'Ward Lab Cores • LECO Combustion • 2.42% to 2.85% SOC'
  },
  {
    id: 'srep-04',
    title: 'ISO 14064-3 / Verra VM0042 Verification Dossier',
    type: 'ISO 14064-3 Audit Dossier',
    farmName: 'Heartland Organic Grains & Cattle Co.',
    dateGenerated: '2026-09-15',
    status: 'Verified',
    fileSizeStr: '12.4 MB',
    summaryMetrics: 'SCS Global Lead Auditor Seal • Merkle SHA-256 Provenance'
  },
  {
    id: 'srep-05',
    title: 'USDA EQIP Practice Incentive Grant Verification',
    type: 'One-Time Grant Verification',
    farmName: 'North Section 14 Parcel',
    dateGenerated: '2026-09-08',
    status: 'Draft',
    fileSizeStr: '2.2 MB',
    summaryMetrics: 'NRCS Practice Standard 340 (Cover Crop) & 329 (No-Till)'
  }
];

// =========================================================================
// 7. TASKS (P1) — Personal Work Center
// =========================================================================
export const MOCK_WORKSPACE_TASKS: WorkspaceTask[] = [
  {
    id: 'tsk-01',
    title: 'Upload post-harvest Haney soil test report',
    farmOrFieldName: 'North Section 14',
    dueDateStr: 'Due Yesterday (Overdue)',
    isOverdue: true,
    priority: 'high',
    completed: false,
    category: 'soil_sampling'
  },
  {
    id: 'tsk-02',
    title: 'Review drone geotagged photo of cereal rye emergence',
    farmOrFieldName: 'East Ridge Parcel',
    dueDateStr: 'Due Oct 6',
    isOverdue: false,
    priority: 'high',
    completed: false,
    category: 'evidence_upload'
  },
  {
    id: 'tsk-03',
    title: 'Calibrate biochar application rate in Carbon Estimator',
    farmOrFieldName: 'River Bottom Flat',
    dueDateStr: 'Due Oct 8',
    isOverdue: false,
    priority: 'medium',
    completed: false,
    category: 'practice_log'
  },
  {
    id: 'tsk-04',
    title: 'Generate updated Q3 compliance audit PDF for buyer review',
    farmOrFieldName: 'Whole Farm Portfolio',
    dueDateStr: 'Due Oct 11',
    isOverdue: false,
    priority: 'medium',
    completed: false,
    category: 'report'
  },
  {
    id: 'tsk-05',
    title: 'Verify multi-spectral Sentinel-2 greenness curve post-termination',
    farmOrFieldName: 'North Section 14',
    dueDateStr: 'Completed Oct 1',
    isOverdue: false,
    priority: 'low',
    completed: true,
    category: 'verification'
  },
  {
    id: 'tsk-06',
    title: 'Sign off digital verification statement with VVB auditor',
    farmOrFieldName: 'Heartland Organic Grains',
    dueDateStr: 'Completed Sep 28',
    isOverdue: false,
    priority: 'high',
    completed: true,
    category: 'verification'
  }
];

// =========================================================================
// 8. NOTIFICATIONS (P1)
// =========================================================================
export const MOCK_WORKSPACE_NOTIFICATIONS: WorkspaceNotification[] = [
  {
    id: 'notif-01',
    title: 'Sentinel-2 Vegetation Anomaly Detected',
    message: 'NDVI greenness dip of -0.09 detected in North Section 14 following localized dry spell.',
    type: 'anomaly',
    severity: 'warning',
    timestamp: '2 hours ago',
    read: false,
    actionLabel: 'Inspect Field GIS',
    actionTab: 'satellite'
  },
  {
    id: 'notif-02',
    title: 'Weather Advisory: Heavy Runoff Risk',
    message: '7-day forecast indicates 28mm precipitation across Boone & Story County parcels. Delay heavy equipment entry.',
    type: 'weather',
    severity: 'urgent',
    timestamp: '4 hours ago',
    read: false,
    actionLabel: 'View Weather Heatmap',
    actionTab: 'map'
  },
  {
    id: 'notif-03',
    title: 'Evidence Audit Signed Off by Lead Auditor',
    message: 'Sarah Sterling, PE has approved your 2026 cover crop seed invoice and satellite residue proof.',
    type: 'verification',
    severity: 'info',
    timestamp: 'Yesterday at 15:30',
    read: true,
    actionLabel: 'View Evidence Dossier'
  },
  {
    id: 'notif-04',
    title: 'Upcoming USDA EQIP Documentation Deadline',
    message: 'Grant enrollment filing closes in 5 calendar days. Finalize your practice activity ledger.',
    type: 'deadline',
    severity: 'warning',
    timestamp: '2 days ago',
    read: true,
    actionLabel: 'Open Practice Ledger',
    actionTab: 'practices'
  }
];

// =========================================================================
// 9. PROFESSIONAL IDENTITY PROFILE (P2 — Agronomist & Consultant foundation)
// =========================================================================
export const MOCK_PROFESSIONAL_IDENTITIES: Record<UserPersona, ProfessionalIdentityProfile> = {
  farmer: {
    specializations: ['Regenerative Row Crops', 'Multi-Species Cover Crops', 'Rotational Grazing', 'Strip-Till Infiltration'],
    regionsServed: ['Story & Boone County, Iowa', 'Upper Des Moines River Basin'],
    certifications: ['USDA Certified Organic Producer', 'Iowa Soil Health Champion', 'NRCS Conservation Co-Operator'],
    yearsExperience: 24,
    licenseNumber: 'IA-PROD-2450-ORG',
    verifiedProfessional: true,
    verificationRegistry: 'Iowa Dept of Agriculture & Land Stewardship',
    bio: 'Fourth-generation producer managing 2,450 acres of organic corn, food-grade soybeans, and cereal rye with integrated pasture biology.',
    contactPublic: true
  },
  agronomist: {
    specializations: ['Soil Organic Carbon Modeling', 'COMET-Farm Calibrations', 'Variable-Rate Nitrogen Prescriptions', 'GHG Land Sector Accounting'],
    regionsServed: ['Eastern Nebraska', 'Western Iowa', 'Northern Kansas (Corn Belt & Great Plains)'],
    certifications: ['Certified Crop Adviser (CCA-NE-881920)', 'USDA NRCS Technical Service Provider (TSP #14092)', '4R Nutrient Management Specialist'],
    yearsExperience: 14,
    licenseNumber: 'CCA-NE-881920',
    verifiedProfessional: true,
    verificationRegistry: 'American Society of Agronomy (ASA) & Certified Crop Adviser Board',
    bio: 'Independent consulting agronomist specializing in bio-physical soil carbon modeling, cover crop integration, and carbon inset verification.',
    contactPublic: true
  },
  corporate: {
    specializations: ['Scope 3 Land Sector Accounting', 'Supply Shed Decarbonization', 'GHG Protocol Guidance', 'SBTi Net-Zero Agricultural Insets'],
    regionsServed: ['North American Grain Catchments', 'Mississippi River Basin'],
    certifications: ['GHG Protocol Land Sector Practitioner', 'ISO 14064 Carbon Footprint Assessor'],
    yearsExperience: 16,
    licenseNumber: 'ESG-CORP-480K',
    verifiedProfessional: true,
    verificationRegistry: 'Science Based Targets initiative (SBTi) Advisory Register',
    bio: 'Procurement sustainability executive driving farm-level regenerative transitions and verifiable Scope 3 grain supply-shed abatements.',
    contactPublic: false
  },
  auditor: {
    specializations: ['ISO 14064-3 GHG Verification', 'Verra VM0042 Soil Carbon Standard', 'Remote Sensing Telemetry Auditing', 'Cryptographic Data Lineage'],
    regionsServed: ['Global / North America Accredited'],
    certifications: ['Professional Engineer (PE #48912)', 'Verra Lead Agricultural Carbon Verifier', 'ANSI Accredited VVB Lead Assessor'],
    yearsExperience: 18,
    licenseNumber: 'ANSI-VVB-0849-VERRA',
    verifiedProfessional: true,
    verificationRegistry: 'ANSI National Accreditation Board (ANAB) & Verra Registry',
    bio: 'Principal Greenhouse Gas Lead Assessor providing independent assurance on agricultural soil carbon projects and carbon removal issuance.',
    contactPublic: true
  }
};
