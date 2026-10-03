import { 
  OrganizationHierarchy, 
  ConcretePermissionRule, 
  DataAuditLogEntry, 
  CommandCenterRoleFocus, 
  UserPersona,
  ConcreteOrgRole
} from '../types';

// =========================================================================
// 1. ORGANIZATION DATA MODEL (PRD §2, P0)
// Organization → Users → Farms → Fields → Projects → Data
// =========================================================================
export const MOCK_ORGANIZATION_HIERARCHY: OrganizationHierarchy = {
  id: 'org-greenfield-01',
  name: 'GreenField Advisory & Stewardship Group',
  legalEntityName: 'GreenField Agricultural Advisory LLC',
  domain: 'greenfield-advisory.ag',
  tier: 'Professional',
  subscriptionPricePerMo: 199,
  seatsAllocated: 5,
  seatsTotal: 10,
  ownerUserId: 'usr-alex-01',
  ownerName: 'Alex Morgan',
  farmsCount: 14,
  totalAcres: 18200,
  activeProjectsCount: 6,
  members: [
    {
      id: 'usr-alex-01',
      name: 'Alex Morgan',
      email: 'alex@greenfield-advisory.ag',
      phone: '+1 (555) 349-2841',
      role: 'org_owner',
      roleDisplayName: 'Organization Owner & Principal Agronomist',
      organizationId: 'org-greenfield-01',
      seatStatus: 'active',
      joinedDate: '2024-01-15',
      lastActiveDate: 'Active now',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      assignedFarms: [
        { farmId: 'farm-1', farmName: 'Heartland Organic Grains', acreage: 2450, fieldsCount: 4 },
        { farmId: 'farm-2', farmName: 'River Bottom Flat', acreage: 1840, fieldsCount: 3 },
        { farmId: 'farm-3', farmName: 'Prairie View Holdings', acreage: 3200, fieldsCount: 5 }
      ]
    },
    {
      id: 'usr-sarah-02',
      name: 'Sarah Chen, CCA',
      email: 'sarah.chen@greenfield-advisory.ag',
      phone: '+1 (555) 782-9012',
      role: 'agronomist',
      roleDisplayName: 'Senior Agronomist / Soil Modeler',
      organizationId: 'org-greenfield-01',
      seatStatus: 'active',
      joinedDate: '2024-03-20',
      lastActiveDate: '32 mins ago',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      assignedFarms: [
        { farmId: 'farm-1', farmName: 'Heartland Organic Grains', acreage: 2450, fieldsCount: 4 },
        { farmId: 'farm-3', farmName: 'Prairie View Holdings', acreage: 3200, fieldsCount: 5 }
      ]
    },
    {
      id: 'usr-david-03',
      name: 'David Smith',
      email: 'david@heartlandfarms.com',
      phone: '+1 (515) 892-4412',
      role: 'farmer',
      roleDisplayName: 'Producer / Land Steward',
      organizationId: 'org-greenfield-01',
      seatStatus: 'active',
      joinedDate: '2024-05-10',
      lastActiveDate: '1 hour ago',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      assignedFarms: [
        { farmId: 'farm-1', farmName: 'Heartland Organic Grains', acreage: 2450, fieldsCount: 4 }
      ]
    },
    {
      id: 'usr-marcus-04',
      name: 'Marcus Vance',
      email: 'm.vance@agriglobal-esg.com',
      phone: '+1 (612) 431-7720',
      role: 'corporate_analyst',
      roleDisplayName: 'Corporate Scope 3 Supply Chain Analyst',
      organizationId: 'org-greenfield-01',
      seatStatus: 'active',
      joinedDate: '2024-06-01',
      lastActiveDate: '4 hours ago',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      assignedFarms: [
        { farmId: 'farm-1', farmName: 'Heartland Organic Grains', acreage: 2450, fieldsCount: 4 },
        { farmId: 'farm-2', farmName: 'River Bottom Flat', acreage: 1840, fieldsCount: 3 },
        { farmId: 'farm-3', farmName: 'Prairie View Holdings', acreage: 3200, fieldsCount: 5 }
      ]
    },
    {
      id: 'usr-sterling-05',
      name: 'Sarah Sterling, PE',
      email: 's.sterling@verra-audit.org',
      phone: '+1 (415) 802-9931',
      role: 'auditor',
      roleDisplayName: 'Lead GHG Verification Auditor (VVB)',
      organizationId: 'org-greenfield-01',
      seatStatus: 'active',
      joinedDate: '2024-07-15',
      lastActiveDate: '2 hours ago',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      assignedFarms: [
        { farmId: 'farm-1', farmName: 'Heartland Organic Grains', acreage: 2450, fieldsCount: 4 },
        { farmId: 'farm-2', farmName: 'River Bottom Flat', acreage: 1840, fieldsCount: 3 }
      ]
    }
  ]
};

// =========================================================================
// 2. CONCRETE PERMISSION SYSTEM (PRD §3, P0)
// Concrete role definitions matching the PRD §3 permission table
// =========================================================================
export const MOCK_PERMISSION_RULES: Record<ConcreteOrgRole, ConcretePermissionRule> = {
  org_owner: {
    role: 'org_owner',
    roleDisplayName: 'Organization Owner',
    canManageBilling: true,
    canInviteUsers: true,
    canManagePermissions: true,
    canViewAllFarms: true,
    canExportData: true,
    canEditFarms: true,
    canCreateRecommendations: true,
    canGenerateReports: true,
    canEditOwnFarm: true,
    canUploadEvidence: true,
    canViewRecommendations: true,
    canViewSupplierData: true,
    canAnalyzeScope3: true,
    canReviewAndComment: true,
    canApproveVerification: true,
    canAccessEvidence: true,
    canChangeUnderlyingMeasurements: true,
    governingConstraint: 'Root Tenant Administrator with full governance and billing authority.'
  },
  agronomist: {
    role: 'agronomist',
    roleDisplayName: 'Agronomist',
    canManageBilling: false,
    canInviteUsers: false,
    canManagePermissions: false,
    canViewAllFarms: true,
    canExportData: true,
    canEditFarms: true,
    canCreateRecommendations: true,
    canGenerateReports: true,
    canEditOwnFarm: true,
    canUploadEvidence: true,
    canViewRecommendations: true,
    canViewSupplierData: false,
    canAnalyzeScope3: false,
    canReviewAndComment: true,
    canApproveVerification: false,
    canAccessEvidence: true,
    canChangeUnderlyingMeasurements: true,
    governingConstraint: 'Can edit farms, create prescriptions, and generate client reports.'
  },
  farmer: {
    role: 'farmer',
    roleDisplayName: 'Farmer / Producer',
    canManageBilling: false,
    canInviteUsers: false,
    canManagePermissions: false,
    canViewAllFarms: false,
    canExportData: true,
    canEditFarms: false,
    canCreateRecommendations: false,
    canGenerateReports: true,
    canEditOwnFarm: true,
    canUploadEvidence: true,
    canViewRecommendations: true,
    canViewSupplierData: false,
    canAnalyzeScope3: false,
    canReviewAndComment: true,
    canApproveVerification: false,
    canAccessEvidence: true,
    canChangeUnderlyingMeasurements: true, // Only for own farm
    governingConstraint: 'Can edit own farm parcels, upload evidence, and view recommendations.'
  },
  corporate_analyst: {
    role: 'corporate_analyst',
    roleDisplayName: 'Corporate Analyst',
    canManageBilling: false,
    canInviteUsers: false,
    canManagePermissions: false,
    canViewAllFarms: false,
    canExportData: true,
    canEditFarms: false,
    canCreateRecommendations: false,
    canGenerateReports: true,
    canEditOwnFarm: false,
    canUploadEvidence: false,
    canViewRecommendations: true,
    canViewSupplierData: true,
    canAnalyzeScope3: true,
    canReviewAndComment: true,
    canApproveVerification: false,
    canAccessEvidence: true,
    canChangeUnderlyingMeasurements: false,
    governingConstraint: 'Can view supplier data, analyze Scope 3 emissions, and generate reports.'
  },
  auditor: {
    role: 'auditor',
    roleDisplayName: 'Auditor / Verifier',
    canManageBilling: false,
    canInviteUsers: false,
    canManagePermissions: false,
    canViewAllFarms: true,
    canExportData: true,
    canEditFarms: false,
    canCreateRecommendations: false,
    canGenerateReports: true,
    canEditOwnFarm: false,
    canUploadEvidence: false,
    canViewRecommendations: true,
    canViewSupplierData: true,
    canAnalyzeScope3: false,
    canReviewAndComment: true,
    canApproveVerification: true,
    canAccessEvidence: true,
    canChangeUnderlyingMeasurements: false, // CRITICAL: strictly forbidden!
    governingConstraint: 'Review, comment, approve, and access evidence — STRICTLY CANNOT change underlying measurements.'
  }
};

/**
 * Programmatic Permission Enforcement Engine (PRD-01 / PRD-12)
 * Enforces security rules at the computational logic layer, not just in UI buttons.
 */
export function checkPermissionAction(
  role: ConcreteOrgRole | UserPersona,
  action: 
    | 'modify_measurement' 
    | 'manage_billing' 
    | 'invite_users' 
    | 'edit_farm' 
    | 'create_recommendation' 
    | 'generate_report' 
    | 'analyze_scope3' 
    | 'approve_verification'
    | 'access_evidence',
  isOwnFarm: boolean = true
): { allowed: boolean; reason: string } {
  // Map UserPersona to ConcreteOrgRole if needed
  let mappedRole: ConcreteOrgRole = 'farmer';
  if (role === 'farmer') mappedRole = 'farmer';
  else if (role === 'agronomist') mappedRole = 'agronomist';
  else if (role === 'corporate' || role === 'corporate_analyst') mappedRole = 'corporate_analyst';
  else if (role === 'auditor') mappedRole = 'auditor';
  else if (role === 'org_owner') mappedRole = 'org_owner';

  const rules = MOCK_PERMISSION_RULES[mappedRole];

  if (action === 'modify_measurement') {
    if (mappedRole === 'auditor') {
      return {
        allowed: false,
        reason: 'RESTRICTED (PRD-12 §3): Independent Auditors are structurally prohibited from modifying scientific measurements or baseline data.'
      };
    }
    if (mappedRole === 'corporate_analyst') {
      return {
        allowed: false,
        reason: 'RESTRICTED (PRD-12 §3): Corporate Analysts have read-only access to supplier data and cannot mutate measurements.'
      };
    }
    if (mappedRole === 'farmer' && !isOwnFarm) {
      return {
        allowed: false,
        reason: 'RESTRICTED: Farmers may only mutate measurements on their own registered parcels.'
      };
    }
    return { allowed: true, reason: 'AUTHORIZED: Measurement modification allowed under active role credentials.' };
  }

  if (action === 'manage_billing') {
    return rules.canManageBilling
      ? { allowed: true, reason: 'AUTHORIZED: Billing management permitted for Organization Owner.' }
      : { allowed: false, reason: 'RESTRICTED: Only the Organization Owner can manage subscription and billing.' };
  }

  if (action === 'invite_users') {
    return rules.canInviteUsers
      ? { allowed: true, reason: 'AUTHORIZED: User invitation permitted.' }
      : { allowed: false, reason: 'RESTRICTED: Team member invitation requires Organization Owner privileges.' };
  }

  if (action === 'approve_verification') {
    return rules.canApproveVerification
      ? { allowed: true, reason: 'AUTHORIZED: Verification approval permitted under accredited role.' }
      : { allowed: false, reason: 'RESTRICTED: Only accredited Auditors and Owners can sign off on verification seals.' };
  }

  return { allowed: true, reason: 'AUTHORIZED: Action permitted under standard role policy.' };
}

// =========================================================================
// 3. SYSTEM-OF-RECORD DATA AUDIT LOG (PRD §4, P0)
// Answers "what happened to the data?" (Distinct from PRD-11 Activity Journal)
// =========================================================================
export const MOCK_DATA_AUDIT_LOG: DataAuditLogEntry[] = [
  {
    id: 'aud-001',
    user: 'Alex Morgan',
    userRole: 'agronomist',
    action: 'Modified SOC measurement',
    targetType: 'field_soc',
    fieldName: 'North Section 14',
    fieldId: 'field-1',
    farmName: 'Heartland Organic Grains & Cattle Co.',
    previousValue: '2.53% SOC',
    newValue: '2.65% SOC',
    reason: 'Updated laboratory result from dry combustion LECO core re-analysis',
    evidenceDocName: 'SoilTest_0914.pdf',
    timestamp: 'Oct 3, 2026 14:32',
    sha256Checksum: '0x8f192b492a01948ae109b7c2a38cbdf49201948aefc47819038cbdf49201948a',
    ipAddress: '172.56.21.90',
    verificationAuditSignoff: true
  },
  {
    id: 'aud-002',
    user: 'David Smith',
    userRole: 'farmer',
    action: 'Logged regenerative practice',
    targetType: 'practice_record',
    fieldName: 'East Ridge Parcel',
    fieldId: 'field-3',
    farmName: 'Heartland Organic Grains & Cattle Co.',
    previousValue: 'None (Fallow post-harvest)',
    newValue: 'Winter Cereal Rye Cover Crop (420 acres @ 55 lbs/ac)',
    reason: 'Fall cover crop seeding completed via John Deere air seeder',
    evidenceDocName: 'SeedInvoice_CerealRye_2026.pdf',
    timestamp: 'Oct 2, 2026 16:21',
    sha256Checksum: '0x4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123',
    ipAddress: '166.198.42.11',
    verificationAuditSignoff: true
  },
  {
    id: 'aud-003',
    user: 'Sarah Chen, CCA',
    userRole: 'agronomist',
    action: 'Calibrated emission factor',
    targetType: 'baseline_config',
    fieldName: 'River Bottom Flat',
    fieldId: 'field-2',
    farmName: 'Heartland Organic Grains & Cattle Co.',
    previousValue: '0.38 MT CO2e / ac / yr (Generic Regional Model)',
    newValue: '0.45 MT CO2e / ac / yr (Custom Iowa Mollisol Infiltration Calibration)',
    reason: 'Incorporated 5-year local soil hydrology data into COMET-Farm baseline',
    evidenceDocName: 'Hydrology_Calibration_IowaBasin.pdf',
    timestamp: 'Oct 2, 2026 11:15',
    sha256Checksum: '0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    ipAddress: '68.102.14.77',
    verificationAuditSignoff: true
  },
  {
    id: 'aud-004',
    user: 'Alex Morgan',
    userRole: 'org_owner',
    action: 'Adjusted field boundary vertices',
    targetType: 'field_boundary',
    fieldName: 'South Pasture',
    fieldId: 'field-4',
    farmName: 'Heartland Organic Grains & Cattle Co.',
    previousValue: '340.0 acres (12 GIS boundary vertices)',
    newValue: '348.5 acres (16 GIS boundary vertices, buffer easement included)',
    reason: 'Updated boundary to match 2026 USDA FSA Form 578 certified map',
    evidenceDocName: 'FSA_578_CertifiedMap_2026.pdf',
    timestamp: 'Sep 29, 2026 15:45',
    sha256Checksum: '0x99887766554433221100aabbccddeeff00112233445566778899aabbccddeeff',
    ipAddress: '172.56.21.90',
    verificationAuditSignoff: true
  },
  {
    id: 'aud-005',
    user: 'Sarah Sterling, PE',
    userRole: 'auditor',
    action: 'Signed off verification dossier (Review Only)',
    targetType: 'permission_change',
    fieldName: 'Whole Farm Portfolio',
    farmName: 'Heartland Organic Grains & Cattle Co.',
    previousValue: 'Under Third-Party Verification',
    newValue: 'Verified (ISO 14064-3 / Verra VM0042 Seal Applied)',
    reason: 'Independent verification completed with zero non-conformances identified',
    evidenceDocName: 'Verra_VM0042_Assurance_Report.pdf',
    timestamp: 'Sep 28, 2026 10:20',
    sha256Checksum: '0x5566778899001122334455667788990011223344556677889900112233445566',
    ipAddress: '73.238.19.44',
    verificationAuditSignoff: true
  }
];

// =========================================================================
// 4. ROLE-SPECIFIC COMMAND CENTERS (PRD §5, P1)
// Rename generic "Dashboard" to Command Center with role-specific framing
// =========================================================================
export const MOCK_COMMAND_CENTERS: Record<UserPersona, CommandCenterRoleFocus> = {
  farmer: {
    role: 'farmer',
    commandCenterTitle: 'Farmer / Grower Command Center',
    focusPillars: 'Farm Health · Actions · ROI · Evidence (PRD-02 §3.1)',
    activeAlertsSummary: '1 Field Moisture Deficit Alert Active (North Section 14)',
    kpiOverview: [
      { label: 'Farm Health Index', value: '88 / 100', sublabel: 'Optimal Soil Biology & Vigor', accentColor: 'text-emerald-400' },
      { label: 'Active Practices', value: '5 Enrolled', sublabel: 'Cover rye, strip-till, compost', accentColor: 'text-lime-400' },
      { label: 'Estimated ROI', value: '$64,470 / yr', sublabel: 'Direct Carbon Payout Potential', accentColor: 'text-emerald-300' },
      { label: 'Verified Evidence', value: '18 Documents', sublabel: 'Lab tests, invoices & photos', accentColor: 'text-cyan-400' }
    ],
    quickActions: [
      { label: 'Inspect Local Field GIS', actionTab: 'map', iconName: 'Map' },
      { label: 'Log Practice Activity', actionTab: 'practices', iconName: 'FileCheck2' },
      { label: 'Model Carbon ROI', actionTab: 'estimator', iconName: 'Calculator' },
      { label: 'Open Personal Workspace', actionTab: 'workspace', iconName: 'FolderKanban' }
    ]
  },
  agronomist: {
    role: 'agronomist',
    commandCenterTitle: 'Agronomist & Consultant Command Center',
    focusPillars: 'Clients · Fields · Recommendations · Reports (PRD-03 §3.1)',
    activeAlertsSummary: '3 Client Farms Due for Fall Soil Core Sampling',
    kpiOverview: [
      { label: 'Client Operations', value: '14 Farms', sublabel: '18,200 Total Managed Acres', accentColor: 'text-emerald-400' },
      { label: 'Monitored Fields', value: '54 Parcels', sublabel: 'Sentinel-2 Satellite Telemetry', accentColor: 'text-cyan-400' },
      { label: 'Active Prescriptions', value: '28 Protocols', sublabel: 'Cover Crop & 4R Nutrient Stacks', accentColor: 'text-amber-400' },
      { label: 'Reports Exported', value: '36 Dossiers', sublabel: 'Branded Client PDF Summaries', accentColor: 'text-purple-400' }
    ],
    quickActions: [
      { label: 'Client Portfolio GIS', actionTab: 'map', iconName: 'Map' },
      { label: 'Calibrate Soil Models', actionTab: 'estimator', iconName: 'Sliders' },
      { label: 'Review Practice Ledgers', actionTab: 'practices', iconName: 'FileCheck2' },
      { label: 'Activity Journal & Tasks', actionTab: 'workspace', iconName: 'Clock' }
    ]
  },
  corporate: {
    role: 'corporate',
    commandCenterTitle: 'Corporate Scope 3 Command Center',
    focusPillars: 'Supply Chain · Scope 3 · Data Integrity · Targets (PRD-04 §4.1)',
    activeAlertsSummary: 'Tier-1 Grain Supply Shed Inset Reporting Window Open',
    kpiOverview: [
      { label: 'Supply Chain Scope', value: '145,000 ac', sublabel: '28 Contracted Grain Suppliers', accentColor: 'text-emerald-400' },
      { label: 'Scope 3 Removals', value: '480,000 MT', sublabel: 'GHG Land Sector Guidance Base', accentColor: 'text-cyan-400' },
      { label: 'Primary Data Coverage', value: '78.4%', sublabel: 'Cryptographically Verified Records', accentColor: 'text-emerald-300' },
      { label: 'Target Inset Progress', value: '62% of 2030', sublabel: 'SBTi FLAG Decarbonization Goal', accentColor: 'text-lime-400' }
    ],
    quickActions: [
      { label: 'Global Intelligence Map', actionTab: 'map', iconName: 'Globe2' },
      { label: 'Audit Merkle Lineage', actionTab: 'workspace', iconName: 'ShieldCheck' },
      { label: 'Export Scope 3 Insets', actionTab: 'workspace', iconName: 'FileText' },
      { label: 'Organization & Team Seats', actionTab: 'workspace', iconName: 'Building2' }
    ]
  },
  auditor: {
    role: 'auditor',
    commandCenterTitle: 'Auditor & Verifier Command Center',
    focusPillars: 'Reviews · Exceptions · Evidence · Verification (PRD-05 §3)',
    activeAlertsSummary: '2 Projects Awaiting Final ISO 14064-3 Sign-Off',
    kpiOverview: [
      { label: 'Assurance Reviews', value: '42 Programs', sublabel: 'ISO 14064-3 / Verra VM0042', accentColor: 'text-cyan-400' },
      { label: 'Audited Evidence', value: '156 Dossiers', sublabel: 'Ground-Truth Cores & Telemetry', accentColor: 'text-emerald-400' },
      { label: 'Exception Flags', value: '2 Flagged', sublabel: 'Missing Fertilizer Invoices (Resolved)', accentColor: 'text-amber-400' },
      { label: 'Issued Seals', value: '2.1M tCO₂e', sublabel: 'Certified Carbon Removal Units', accentColor: 'text-purple-400' }
    ],
    quickActions: [
      { label: 'System-of-Record Audit Log', actionTab: 'workspace', iconName: 'Database' },
      { label: 'Examine Evidence Library', actionTab: 'workspace', iconName: 'FileSpreadsheet' },
      { label: 'Inspect Field GIS Telemetry', actionTab: 'map', iconName: 'Map' },
      { label: 'Validate Lineage Hashes', actionTab: 'workspace', iconName: 'Key' }
    ]
  }
};
