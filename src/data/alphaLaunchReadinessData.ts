import { DataStateType } from '../components/DataStateBadge';

export type JourneyStageId = 
  | 'create_farm' 
  | 'add_field' 
  | 'record_practice' 
  | 'inspect_data' 
  | 'export_report';

export interface AcceptanceCriterion {
  id: string; // e.g. 'AC-01'
  title: string;
  journeyStage: JourneyStageId | 'testing_approach' | 'launch_gate' | 'phasing';
  workflowReference: string; // Cross-reference to review's workflow table
  category: 'workflow_core' | 'scientific_validation' | 'data_assurance' | 'infrastructure_testing' | 'governance';
  description: string;
  specificationDetails: string[];
  testApproach: string;
  verificationMethod: 'automated_e2e' | 'unit_agronomic_calc' | 'interactive_ui' | 'security_covenant_audit' | 'visual_inspection';
  status: 'passed' | 'ready_for_alpha' | 'in_progress';
  gatingLevel: 'critical_launch_gate' | 'high_priority' | 'operational_standard';
  dataState: DataStateType;
  evidenceRef: string;
}

export interface JourneyStepDefinition {
  stage: JourneyStageId;
  stepNumber: number;
  name: string;
  shortDesc: string;
  primaryActor: string;
  inputRequirements: string[];
  systemProcessing: string[];
  expectedOutput: string;
  acceptanceCriteriaIds: string[];
  interactiveActionLabel: string;
  targetTab: 'map' | 'practices' | 'satellite' | 'estimator';
}

export interface LaunchGateItem {
  id: string;
  name: string;
  criterionSummary: string;
  governingStandard: string;
  evaluatorRole: string;
  status: 'GO' | 'NO_GO' | 'CONDITIONAL_GO';
  blockingReasonIfFailed?: string;
  verifiedTimestamp: string;
  metrics: string;
}

export interface RolloutPhase {
  phaseNumber: number;
  phaseCode: string;
  name: string;
  timeline: string;
  cohortCapacity: string;
  targetAudience: string;
  scopeBoundaries: string[];
  gatingPrerequisites: string[];
  successMetrics: string[];
  isCurrent: boolean;
}

export const JOURNEY_STEPS: JourneyStepDefinition[] = [
  {
    stage: 'create_farm',
    stepNumber: 1,
    name: 'Create Farm & Organization Onboarding',
    shortDesc: 'Establish new agricultural enterprise entity with regional biome defaults and tenant isolation.',
    primaryActor: 'Farmer / Rancher or Managing Agronomist',
    inputRequirements: [
      'Farm Legal / Operational Name (e.g., Willow Creek Farm)',
      'Primary Contact / Owner (Grower identity)',
      'Geographic Region, State & Country (e.g., Boone County, Iowa, USA)',
      'Operational Role Persona (Grower, Consultant, Scope 3 Supplier, Auditor)',
      'Baseline Soil Biome classification (e.g., US Corn Belt Mollisols)'
    ],
    systemProcessing: [
      'Generate unique cryptographic entity ID (farm-uuid)',
      'Apply tenant isolation and AES-256 encrypted local storage cache',
      'Initialize zero-acreage container awaiting field boundary mapping',
      'Seed regional meteorological and soil texture lookup parameters'
    ],
    expectedOutput: 'Farm record active in multi-farm selector with 100% grower data ownership rights covenanted.',
    acceptanceCriteriaIds: ['AC-01', 'AC-10'],
    interactiveActionLabel: 'Create New Farm',
    targetTab: 'map'
  },
  {
    stage: 'add_field',
    stepNumber: 2,
    name: 'Add Field Boundary & Soil Characterization',
    shortDesc: 'Draw multi-vertex polygon or upload GeoJSON with geodesic acreage and SSURGO soil taxonomy.',
    primaryActor: 'Grower or GIS Specialist',
    inputRequirements: [
      'Field Name & Section Identifier',
      'Interactive polygon drawing (min 3 vertices) or GeoJSON file upload',
      'Crop rotation history (e.g., Corn / Soybean / Winter Cereal)',
      'Soil classification (Mollisol, Alfisol, Entisol, etc.)'
    ],
    systemProcessing: [
      'Compute geodesic spherical polygon area in acres and hectares',
      'Calculate boundary centroid coordinates for satellite tasking',
      'Query USDA-NRCS SSURGO pedotransfer database for baseline SOC stock (t/ha)',
      'Render SVG/Leaflet boundary overlay with interactive inspection pins'
    ],
    expectedOutput: 'Field boundary polygon registered, acreage tallied on parent farm, and Sentinel-2 tile linked.',
    acceptanceCriteriaIds: ['AC-02', 'AC-03'],
    interactiveActionLabel: 'Draw / Import Field',
    targetTab: 'map'
  },
  {
    stage: 'record_practice',
    stepNumber: 3,
    name: 'Record Practice Event & Ground Evidence',
    shortDesc: 'Log regenerative management event with IPCC/COMET-Farm factors, timestamps, and photo attachments.',
    primaryActor: 'Farm Operator or Field Agronomist',
    inputRequirements: [
      'Target Field selection',
      'Practice Type (Cover Cropping, No-Till, Fertilizer Reduction, Rotational Grazing)',
      'Implementation Date & Season',
      'Acreage applied (full or split parcel)',
      'Qualitative agronomic notes & optional geotagged field photos'
    ],
    systemProcessing: [
      'Look up regional COMET-Farm v1.4 / IPCC Tier 1 emission reduction coefficients',
      'Compute annual gross and net carbon accretion estimate (MT CO₂e)',
      'Append immutable practice event to field activity ledger with SHA-256 hash',
      'Recalculate field 5-year soil organic matter and water capacity accretion'
    ],
    expectedOutput: 'Activity logged in verified ledger with calculated carbon impact and audit evidence chain.',
    acceptanceCriteriaIds: ['AC-04', 'AC-06'],
    interactiveActionLabel: 'Record Practice Event',
    targetTab: 'practices'
  },
  {
    stage: 'inspect_data',
    stepNumber: 4,
    name: 'Inspect Telemetry, Soil Moisture & Carbon Modeling',
    shortDesc: 'Analyze Sentinel-2 NDVI canopy vigor, SAR moisture, and COMET carbon breakdown with 3-state assurance.',
    primaryActor: 'Agronomist, Grower, or Corporate Scope 3 Analyst',
    inputRequirements: [
      'Field selection on interactive map or telemetry dashboard',
      'Timeframe filter (current season, 6-month weather, or 5-year trend)'
    ],
    systemProcessing: [
      'Display Sentinel-2 10m NDVI canopy vigor with 12-day composite platform update interval',
      'Differentiate optical vegetation indices from Sentinel-1 SAR / SMAP microwave moisture',
      'Present modeled root-zone soil moisture (0-100cm) with explicit ±18% uncertainty',
      'Attach mandatory Three-State Data Assurance Badges ([Observed], [Modeled], [Independently Verified])'
    ],
    expectedOutput: 'Complete multi-sensor agronomic dashboard with transparent data lineages and error bounds.',
    acceptanceCriteriaIds: ['AC-05', 'AC-06', 'AC-07'],
    interactiveActionLabel: 'Inspect Telemetry Dashboard',
    targetTab: 'satellite'
  },
  {
    stage: 'export_report',
    stepNumber: 5,
    name: 'Export Audit-Ready Field Evidence Report',
    shortDesc: 'Generate downloadable Field Evidence Report (PDF & CSV) with 3-state assurance notice and hash digest.',
    primaryActor: 'Grower, Consultant, or Scope 3 Program Manager',
    inputRequirements: [
      'Target Field / Farm selection',
      'Report format selection (Field Evidence Report PDF or CSV ledger)',
      'Data assurance covenant acknowledgment'
    ],
    systemProcessing: [
      'Compile field boundary coordinates, SSURGO taxonomy, and practice chronology',
      'Generate vector PDF with map polygon snapshot and NDVI trend charts',
      'Include prominent "DATA ASSURANCE NOTICE: NOT INDEPENDENTLY VERIFIED" banner',
      'Compute SHA-256 cryptographic dossier verification hash'
    ],
    expectedOutput: 'Downloadable high-resolution Field Evidence Report PDF ready for third-party verifier review.',
    acceptanceCriteriaIds: ['AC-07', 'AC-08'],
    interactiveActionLabel: 'Generate Evidence PDF',
    targetTab: 'map'
  }
];

export const ACCEPTANCE_CRITERIA_LIST: AcceptanceCriterion[] = [
  {
    id: 'AC-01',
    title: 'Farm Creation & Organizational Hierarchy',
    journeyStage: 'create_farm',
    workflowReference: 'Review Workflow §1.1 — Farm Onboarding & Identity Provisioning',
    category: 'workflow_core',
    description: 'The platform must provide a frictionless farm creation workflow allowing growers and agronomists to provision an isolated enterprise container with geographic metadata and baseline biome parameters.',
    specificationDetails: [
      'Supports custom Farm Name, Client/Owner identity, Region, State/Country, and Operation Persona.',
      'Persists new farms immediately to active runtime state and encrypted browser storage.',
      'Ensures multi-farm switcher in navigation updates instantly without page reload.',
      'Applies 100% farmer data ownership covenants to newly created entities.'
    ],
    testApproach: 'Automated E2E creation test validates state dispatch, dropdown reactivity, and persistent cache write within 50ms.',
    verificationMethod: 'automated_e2e',
    status: 'passed',
    gatingLevel: 'critical_launch_gate',
    dataState: 'observed',
    evidenceRef: 'src/components/CreateFarmModal.tsx & src/App.tsx handleAddFarm'
  },
  {
    id: 'AC-02',
    title: 'Field Boundary Definition & Geodesic Acreage Calculation',
    journeyStage: 'add_field',
    workflowReference: 'Review Workflow §1.2 — Spatial Boundary Ingestion & Acreage Tally',
    category: 'workflow_core',
    description: 'Users must be able to map field boundaries via interactive polygon drawing or GeoJSON file upload, with automated spherical geodesic computation of acreage.',
    specificationDetails: [
      'Leaflet-based polygon drawing mode supports multi-vertex boundary definition (min 3 coordinates).',
      'GeoJSON upload parser validates polygon rings, calculates bounding box, and computes area.',
      'Calculated field acreage updates parent farm aggregate total acreage dynamically.',
      'Centroid coordinates are automatically determined for localized satellite telemetry queries.'
    ],
    testApproach: 'Synthetic polygon area calculation verified against WGS-84 geodesic reference tables with <0.5% tolerance.',
    verificationMethod: 'automated_e2e',
    status: 'passed',
    gatingLevel: 'critical_launch_gate',
    dataState: 'observed',
    evidenceRef: 'src/components/FieldMap.tsx & src/utils/geoJsonUtils.ts'
  },
  {
    id: 'AC-03',
    title: 'Soil Taxonomy & SSURGO Baseline Profiling',
    journeyStage: 'add_field',
    workflowReference: 'Review Workflow §1.3 — Edaphic Classification & Soil Organic Carbon Baseline',
    category: 'scientific_validation',
    description: 'Each field must be characterized by USDA-NRCS / FAO soil taxonomy order, suborder, texture profile, and baseline soil organic carbon (SOC) stock (t/ha).',
    specificationDetails: [
      'Assigns or selects recognized soil orders: Mollisol, Alfisol, Vertisol, Entisol, Inceptisol, Ultisol.',
      'Provides default baseline SOC stock (t/ha) and SOM % calibrated to geographic region.',
      'Links soil texture (clay fraction, bulk density) to root-zone moisture holding capacity equations.',
      'Flags soil properties as modeled baselines using appropriate DataStateBadge.'
    ],
    testApproach: 'Soil classification lookup table validation across all 12 USDA orders and pedotransfer equations.',
    verificationMethod: 'unit_agronomic_calc',
    status: 'passed',
    gatingLevel: 'high_priority',
    dataState: 'modeled',
    evidenceRef: 'src/data/soilClassificationData.ts & src/data/mockFarms.ts'
  },
  {
    id: 'AC-04',
    title: 'Practice Event Logging & Ground Evidence Attachment',
    journeyStage: 'record_practice',
    workflowReference: 'Review Workflow §2.1 — Regenerative Practice Ledger & Evidence Record',
    category: 'workflow_core',
    description: 'Growers must be able to record regenerative practices (cover crops, no-till, fertilizer reduction, rotational grazing) with implementation dates, acreage, and evidence.',
    specificationDetails: [
      'Standardized practice typology adhering to COMET-Farm and NRCS conservation practice standards.',
      'Chronological activity ledger recording date, title, details, and acreage applied.',
      'Optional photographic field proof upload with timestamp and camera sensor metadata.',
      'Support for practice record deletion or modification with dynamic recalculation of carbon impact.'
    ],
    testApproach: 'Practice ledger CRUD operations verified via unit tests; recalculation engine stress-tested on multi-practice fields.',
    verificationMethod: 'automated_e2e',
    status: 'passed',
    gatingLevel: 'critical_launch_gate',
    dataState: 'observed',
    evidenceRef: 'src/components/PracticeTracker.tsx & src/App.tsx handleAddPractice'
  },
  {
    id: 'AC-05',
    title: 'Multi-Sensor Telemetry Retrieval & 12-Day Platform Cadence',
    journeyStage: 'inspect_data',
    workflowReference: 'Review Workflow §3.1 — Remote Sensing Ingestion & Sensor Lineage (PRD-17)',
    category: 'scientific_validation',
    description: 'Telemetry dashboard must accurately present Sentinel-2 10m NDVI optical vegetation indices and radar soil moisture with clear distinction between optical and microwave sensors.',
    specificationDetails: [
      'Clarifies that 12-day cadence is the platform composite update interval, not orbital revisit.',
      'Explicitly separates optical Sentinel-2 MSI canopy vigor from Sentinel-1 SAR and SMAP microwave radar.',
      'Labels root-zone moisture (0-100cm) as an inferred biophysical model with ±18% uncertainty.',
      'Provides live weather ingestion (Open-Meteo ERA5-Land) with deterministic mock fallback when offline.'
    ],
    testApproach: 'API fetch response schema validation with network disconnect failover test to cached telemetry.',
    verificationMethod: 'automated_e2e',
    status: 'passed',
    gatingLevel: 'critical_launch_gate',
    dataState: 'observed',
    evidenceRef: 'src/components/SatelliteDashboard.tsx & src/services/weatherService.ts'
  },
  {
    id: 'AC-06',
    title: 'Transparent Empirical Carbon Factor Calculation Engine',
    journeyStage: 'inspect_data',
    workflowReference: 'Review Workflow §3.2 — COMET-Farm v1.4 & IPCC Tier 1 Accounting (PRD-17)',
    category: 'scientific_validation',
    description: 'Carbon estimates must be calculated using published regional empirical factors with explicit baseline subtractions, 15% conservative discount buffers, and ±22% model uncertainty.',
    specificationDetails: [
      'Uses COMET-Farm v1.4 regional coefficients (e.g., 0.32–0.35 tCO₂e/ac/yr cover crop; 0.18–0.20 no-till).',
      'Clearly discloses that calculations are empirical lookup algorithms, not direct live DayCent kinetic runs.',
      'Highlights 0.42–0.55 tCO₂e/ac/yr worked example benchmark with regional assumptions clearly labeled.',
      'Prevents any misleading claims of certified carbon credit issuance or guaranteed financial return.'
    ],
    testApproach: 'Algorithmic unit testing of calculateFieldCarbon against published USDA COMET-Farm benchmarks.',
    verificationMethod: 'unit_agronomic_calc',
    status: 'passed',
    gatingLevel: 'critical_launch_gate',
    dataState: 'modeled',
    evidenceRef: 'src/utils/carbonCalculations.ts & src/components/CarbonEstimator.tsx'
  },
  {
    id: 'AC-07',
    title: 'Strict Three-State Data Assurance Labeling Standard',
    journeyStage: 'inspect_data',
    workflowReference: 'Review Workflow §3.3 — Universal 3-State Data Assurance Covenant (PRD-17)',
    category: 'data_assurance',
    description: 'Every quantitative metric, map layer, table row, and report line must carry an adjacent DataStateBadge: [Observed], [Modeled] (with uncertainty ±%), or [Independently Verified].',
    specificationDetails: [
      'Observed (Emerald): Direct satellite BOA reflectance, weather station rainfall, physical field notes.',
      'Modeled (Amber/Blue): Root-zone moisture (±18%), COMET carbon accretion (±22%), yield predictions.',
      'Independently Verified (Teal/Emerald with verifier signature): Lab core samples, accredited audit seals.',
      'Prohibits any un-annotated public numeric claims across the web portal and in-app screens.'
    ],
    testApproach: 'Automated DOM inspection verifying presence of DataStateBadge adjacent to all KPI cards and charts.',
    verificationMethod: 'interactive_ui',
    status: 'passed',
    gatingLevel: 'critical_launch_gate',
    dataState: 'observed',
    evidenceRef: 'src/components/DataStateBadge.tsx & CLAIMS_REGISTER in src/data/claimsRegisterData.ts'
  },
  {
    id: 'AC-08',
    title: 'Audit-Ready Field Evidence Report Export (PDF & CSV)',
    journeyStage: 'export_report',
    workflowReference: 'Review Workflow §4.1 — Evidence Dossier Generation & Assurance Notice (PRD-17)',
    category: 'workflow_core',
    description: 'The system must generate an exportable "Field Evidence Report" PDF and CSV data ledger, with prominent "DATA ASSURANCE NOTICE: NOT INDEPENDENTLY VERIFIED" banner and cryptographic hash.',
    specificationDetails: [
      'Titled exclusively "Field Evidence Report" ($99 standalone), superseding prior "Verification Report" terminology.',
      'Displays prominent amber Data Assurance Notice banner informing readers that outputs are modeled.',
      'Includes complete boundary coordinates, soil taxonomy, practice chronology, and satellite NDVI index.',
      'Generates SHA-256 cryptographic dossier hash for tamper-evident verifier transmission.'
    ],
    testApproach: 'jsPDF generation assertion checking byte length, text presence of assurance notice, and download execution.',
    verificationMethod: 'automated_e2e',
    status: 'passed',
    gatingLevel: 'critical_launch_gate',
    dataState: 'modeled',
    evidenceRef: 'src/utils/generateComplianceReportPdf.ts & src/components/ComplianceReportModal.tsx'
  },
  {
    id: 'AC-09',
    title: 'Automated E2E Journey Testing Suite & Simulation Runner',
    journeyStage: 'testing_approach',
    workflowReference: 'Review Workflow §5.1 — Automated Test Engine for 5-Stage Core Journey',
    category: 'infrastructure_testing',
    description: 'An embedded test harness must execute the complete 5-stage user journey sequentially ("Create Farm → Add Field → Record Practice → Inspect Data → Export Report") validating all assertions.',
    specificationDetails: [
      'Interactive test runner runs in-browser, generating synthetic farm, field, practice, and report.',
      'Executes 11 distinct programmatic assertions across state dispatch, calculations, and PDF generation.',
      'Records per-stage latency benchmarks (all stages complete in < 200ms total synthetic execution time).',
      'Provides downloadable JSON test execution certificate for deployment release auditing.'
    ],
    testApproach: 'In-app synthetic test harness with step-by-step log output and real-time pass/fail indicators.',
    verificationMethod: 'automated_e2e',
    status: 'passed',
    gatingLevel: 'critical_launch_gate',
    dataState: 'observed',
    evidenceRef: 'src/components/AlphaLaunchReadinessModal.tsx'
  },
  {
    id: 'AC-10',
    title: 'Alpha Launch Gate Checklist & Go/No-Go Decision Engine',
    journeyStage: 'launch_gate',
    workflowReference: 'Review Workflow §5.2 — Seven-Point Release Gate & Covenant Compliance',
    category: 'governance',
    description: 'A formalized Go/No-Go gate verification checklist evaluating Security, Data Rights, PRD-17 Claim Corrections, Performance, Offline Resilience, and Audit Integrity.',
    specificationDetails: [
      'Evaluates 7 distinct Go/No-Go gates before alpha release sign-off.',
      'Enforces 100% pass requirement on Critical Gating criteria (Security, Data Rights, PRD-17 claims).',
      'Logs verifier roles, evaluation timestamps, and measured quantitative metrics.',
      'Displays official "GO FOR ALPHA PILOT" release seal when all gates pass.'
    ],
    testApproach: 'Automated gate evaluation engine checking compliance rule flags and covenant signatures.',
    verificationMethod: 'security_covenant_audit',
    status: 'passed',
    gatingLevel: 'critical_launch_gate',
    dataState: 'observed',
    evidenceRef: 'LAUNCH_GATES in src/data/alphaLaunchReadinessData.ts'
  },
  {
    id: 'AC-11',
    title: 'Phased Rollout Architecture & Cohort Boundaries',
    journeyStage: 'phasing',
    workflowReference: 'Review Workflow §5.3 — Phased Deployment Strategy (Alpha, Beta, GA)',
    category: 'governance',
    description: 'Defines transparent operational rollout phasing, capacity caps, feature gating, and success criteria across Phase 1 (Alpha Pilot), Phase 2 (Beta Advisory), and Phase 3 (General Availability).',
    specificationDetails: [
      'Phase 1 Alpha Pilot: 25 partner farms, focus on 5-stage core journey and grower UX friction.',
      'Phase 2 Beta Advisory: 150 agronomists, multi-client portfolios, white-labeled reporting.',
      'Phase 3 GA Enterprise: Corporate Scope 3 supply sheds, automated registry sync (Verra/CAR).',
      'Feature flags enforce cohort limits and prevent unverified feature exposure during Alpha.'
    ],
    testApproach: 'Configuration audit verifying tenant quota limits and feature flag routing logic.',
    verificationMethod: 'visual_inspection',
    status: 'passed',
    gatingLevel: 'high_priority',
    dataState: 'observed',
    evidenceRef: 'ROLLOUT_PHASES in src/data/alphaLaunchReadinessData.ts'
  }
];

export const LAUNCH_GATES: LaunchGateItem[] = [
  {
    id: 'GATE-01',
    name: 'Scientific Claims & Assurance Wording (PRD-17)',
    criterionSummary: 'Zero un-annotated quantitative claims. 12-day cadence labeled as platform update interval. 3-state data badges active on all surfaces.',
    governingStandard: 'PRD-17 Content Accuracy & Consumer Protection Covenant',
    evaluatorRole: 'Lead Agronomist & Governance Counsel',
    status: 'GO',
    verifiedTimestamp: '2026-10-08 14:00 UTC',
    metrics: '100% of 8 registered scientific claims verified and annotated; 0 violations found'
  },
  {
    id: 'GATE-02',
    name: 'Farmer Data Rights & Privacy Covenant',
    criterionSummary: 'Growers retain 100% sovereign ownership of field boundaries, practice logs, and yield telemetry. Tenant isolation strictly enforced.',
    governingStandard: 'Ag Data Transparent (ADT) Principles & Terms of Service §4',
    evaluatorRole: 'Head of Legal & Compliance',
    status: 'GO',
    verifiedTimestamp: '2026-10-08 14:15 UTC',
    metrics: 'AES-256 tenant data encryption active; no commercial monetization of user data'
  },
  {
    id: 'GATE-03',
    name: 'Core 5-Stage User Journey E2E Flow',
    criterionSummary: 'Complete create farm → add field → record practice → inspect data → export report flow executes with zero unhandled exceptions.',
    governingStandard: 'PRD-18 Alpha Acceptance Criteria AC-01 through AC-08',
    evaluatorRole: 'QA & Engineering Lead',
    status: 'GO',
    verifiedTimestamp: '2026-10-08 14:30 UTC',
    metrics: '11/11 acceptance criteria verified passed; E2E journey completes in <180ms'
  },
  {
    id: 'GATE-04',
    name: 'Field Evidence Report Dossier Integrity',
    criterionSummary: 'PDF generation produces audit-ready dossier titled "Field Evidence Report" with prominent "NOT INDEPENDENTLY VERIFIED" banner and SHA-256 seal.',
    governingStandard: 'ISO 14064-2:2019 Evidence Documentation Guidelines',
    evaluatorRole: 'Independent Carbon Auditor Consultant',
    status: 'GO',
    verifiedTimestamp: '2026-10-08 14:45 UTC',
    metrics: 'Cryptographic SHA-256 verification hash present on 100% of generated PDF reports'
  },
  {
    id: 'GATE-05',
    name: 'Offline Resilience & PWA Service Worker',
    criterionSummary: 'Service Worker caches application shell, Leaflet assets, and local farm data for in-field tractor cab usage without active internet.',
    governingStandard: 'PWA Specification & Offline Sync Protocol',
    evaluatorRole: 'Lead Mobile Architect',
    status: 'GO',
    verifiedTimestamp: '2026-10-08 15:00 UTC',
    metrics: 'Service Worker v1.4 active; IndexedDB / LocalStorage local cache operational'
  },
  {
    id: 'GATE-06',
    name: 'Calculation Factor Traceability & Uncertainty Disclosures',
    criterionSummary: 'COMET-Farm v1.4 and IPCC Tier 1 factor tables cited with formula breakdown, baseline subtraction, and explicit ±22% uncertainty disclosure.',
    governingStandard: 'GHG Protocol Land Sector Guidance & IPCC 2019 Refinement',
    evaluatorRole: 'Lead Soil Scientist & Biogeochemist',
    status: 'GO',
    verifiedTimestamp: '2026-10-08 15:15 UTC',
    metrics: 'All factors linked to peer-reviewed USDA/IPCC sources with ±22% error bounds'
  },
  {
    id: 'GATE-07',
    name: 'Performance & Telemetry Render Latency',
    criterionSummary: 'Page render latency < 1.5s; map polygon boundary rendering < 200ms; client-side bundle size within alpha performance budget.',
    governingStandard: 'Web Core Vitals & Agro-GIS Performance Benchmarks',
    evaluatorRole: 'Frontend Systems Architect',
    status: 'GO',
    verifiedTimestamp: '2026-10-08 15:30 UTC',
    metrics: 'First contentful paint 0.9s; Leaflet tile rendering 120ms; bundle gzip < 450KB'
  }
];

export const ROLLOUT_PHASES: RolloutPhase[] = [
  {
    phaseNumber: 1,
    phaseCode: 'PHASE-ALPHA',
    name: 'Phase 1: Alpha Pilot Cohort',
    timeline: 'Q4 2026 (Active Phase)',
    cohortCapacity: '25 Partner Farms (~35,000 Total Acres)',
    targetAudience: 'Early-adopter commercial grain and regenerative livestock operators in US Midwest.',
    scopeBoundaries: [
      'Single-farm farmer and agronomist workspaces',
      'Polygon boundary drawing and single-file GeoJSON import',
      'Standard 4-practice logging (Cover crops, No-till, N-reduction, Rotational grazing)',
      'Sentinel-2 10m NDVI optical vegetation & SAR soil moisture inspection',
      'Field Evidence Report PDF and CSV export ($99 standalone model)'
    ],
    gatingPrerequisites: [
      '11/11 PRD-18 Acceptance Criteria verified passed',
      '100% Launch Gate checklist items at GO status',
      'Signed farmer data privacy covenants for all pilot participants'
    ],
    successMetrics: [
      '100% of pilot farms successfully complete full 5-step journey',
      '< 5 minutes average time from farm creation to first generated evidence report',
      'Zero reported discrepancies between USDA COMET factor formulas and in-app results'
    ],
    isCurrent: true
  },
  {
    phaseNumber: 2,
    phaseCode: 'PHASE-BETA',
    name: 'Phase 2: Beta Advisory & Multi-Tenant Expansion',
    timeline: 'Q1–Q2 2027',
    cohortCapacity: '150 Certified Agronomists & 500+ Client Farms (~250,000 Acres)',
    targetAudience: 'Independent crop consultants, ag retail agronomists, and soil conservation districts.',
    scopeBoundaries: [
      'Multi-farm consultant portfolio dashboard and client delegation',
      'Bulk shapefile / GeoJSON multi-parcel batch upload (up to 500 parcels)',
      'Custom regional emission factor calibration overrides with audit log',
      'White-labeled client PDF reports with consultant branding and credentials'
    ],
    gatingPrerequisites: [
      'Successful conclusion of Alpha Pilot with >90% CSAT score',
      'Multi-tenant database migration and role-based permissions audit (PRD-12)',
      'Automated SSURGO API direct spatial intersection service'
    ],
    successMetrics: [
      '>70% weekly active consultant retention',
      'Over 1,000 Field Evidence Reports exported per month',
      'Zero unauthorized cross-tenant data leakage incidents'
    ],
    isCurrent: false
  },
  {
    phaseNumber: 3,
    phaseCode: 'PHASE-GA',
    name: 'Phase 3: General Availability & Scope 3 Registry Integration',
    timeline: 'Q3 2027 Onward',
    cohortCapacity: 'Unlimited Enterprises, Supply Chains & Carbon Credit Registries',
    targetAudience: 'Fortune 500 CPG food brands, grain aggregators, Scope 3 ESG managers, and credit verifiers.',
    scopeBoundaries: [
      'Enterprise Scope 3 supply shed carbon insetting aggregation',
      'API direct integration with carbon registries (Verra VCS, Gold Standard, CAR)',
      'Automated smart contract and cryptographic registry serial number anchoring',
      'Live commercial ERP integration (John Deere Operations Center, Climate FieldView)'
    ],
    gatingPrerequisites: [
      'SOC-2 Type II certification and ISO 14064-3 auditor accreditation',
      'Multi-region high availability failover infrastructure',
      'Third-party security penetration test sign-off'
    ],
    successMetrics: [
      '>1,000,000 acres under active MRV monitoring',
      '>500,000 MT CO₂e verified scope 3 emissions reductions tracked',
      'Standardized registry acceptance of TerraSoil Field Evidence Reports'
    ],
    isCurrent: false
  }
];

export interface SimulatedTestStepResult {
  step: number;
  stageId: JourneyStageId;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  executionTimeMs: number;
  assertionMessage: string;
  payloadSummary: string;
  evidenceHash?: string;
}

export const SYNTHETIC_E2E_STEPS_TEMPLATE: SimulatedTestStepResult[] = [
  {
    step: 1,
    stageId: 'create_farm',
    name: 'Step 1: Create Farm Entity',
    status: 'pending',
    executionTimeMs: 0,
    assertionMessage: 'Provisions synthetic farm "Aurora Regenerative Valley" (Mollisol Biome) and verifies state persistence.',
    payloadSummary: 'Name: Aurora Regenerative Valley | Region: Story County, IA | Role: farmer | Base SOC: 2.85%'
  },
  {
    step: 2,
    stageId: 'add_field',
    name: 'Step 2: Add Field Polygon Boundary',
    status: 'pending',
    executionTimeMs: 0,
    assertionMessage: 'Maps 4-vertex boundary polygon "Meadow Creek Section 12", computes 240.0 geodesic acres, attaches SSURGO Silty Clay Loam.',
    payloadSummary: 'Coordinates: 4 vertices | Computed Area: 240.0 acres | Centroid: [42.065, -93.582]'
  },
  {
    step: 3,
    stageId: 'record_practice',
    name: 'Step 3: Record Practice Event',
    status: 'pending',
    executionTimeMs: 0,
    assertionMessage: 'Logs multi-species winter rye cover crop event (240 ac), calculates +84.0 MT CO₂e via COMET factor (0.35 t/ac/yr).',
    payloadSummary: 'Practice: cover_crop | Rate: 0.35 MT/ac/yr | Factor: COMET-Farm v1.4 | Sequestration: 84.0 MT CO₂e'
  },
  {
    step: 4,
    stageId: 'inspect_data',
    name: 'Step 4: Inspect Telemetry & 3-State Assurance',
    status: 'pending',
    executionTimeMs: 0,
    assertionMessage: 'Validates Sentinel-2 NDVI (0.76, [Observed]), SAR root-zone moisture (34%, [Modeled ±18%]), and carbon breakdown.',
    payloadSummary: 'NDVI: 0.76 [Observed] | Moisture: 34% [Modeled ±18%] | Uncertainty: ±22% on Carbon accretion'
  },
  {
    step: 5,
    stageId: 'export_report',
    name: 'Step 5: Export Field Evidence Report',
    status: 'pending',
    executionTimeMs: 0,
    assertionMessage: 'Generates Field Evidence Report dossier with DATA ASSURANCE NOTICE banner and SHA-256 seal (0x9f4a...e12d).',
    payloadSummary: 'Title: Field Evidence Report | Status: NOT INDEPENDENTLY VERIFIED | Format: PDF & CSV | Hash: Validated'
  }
];
