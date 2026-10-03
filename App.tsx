import React, { useState } from 'react';
import { INITIAL_FARMS } from './data/mockFarms';
import { Farm, Field, UserPersona, EmissionFactorConfig, PracticeRecord } from './types';
import { DEFAULT_EMISSION_CONFIG, recalculateFieldCarbon } from './utils/carbonCalculations';
import { Navbar } from './components/Navbar';
import { PersonaBanner } from './components/PersonaBanner';
import { FieldMap } from './components/FieldMap';
import { SatelliteDashboard } from './components/SatelliteDashboard';
import { PracticeTracker } from './components/PracticeTracker';
import { CarbonEstimator } from './components/CarbonEstimator';
import { ComplianceReportModal } from './components/ComplianceReportModal';
import { PricingModal } from './components/PricingModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { MoistureAlertModal } from './components/MoistureAlertModal';
import { GeographicCategoryMap } from './components/GeographicCategoryMap';
import { TutorialSection } from './components/TutorialSection';
import { RoleWorkspaceHub } from './components/RoleWorkspaceHub';
import { FieldComparisonModal } from './components/FieldComparisonModal';
import { DataFoundationHub } from './components/DataFoundationHub';
import { CarbonDataLineageModal } from './components/CarbonDataLineageModal';
import { SignatureFeaturesHub } from './components/SignatureFeaturesHub';
import { ExplainThisModal } from './components/ExplainThisModal';
import { TerraSoilAIPdfModal } from './components/TerraSoilAIPdfModal';
import { AuthModal } from './components/AuthModal';
import { SecuritySettingsModal } from './components/SecuritySettingsModal';
import { PersonalWorkspaceHub } from './components/PersonalWorkspaceHub';
import { OrganizationAndAuditHub } from './components/OrganizationAndAuditHub';
import { AddOnModulesHub } from './components/AddOnModulesHub';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { LandingScreen } from './components/LandingScreen';
import { registerServiceWorker } from './serviceWorkerRegistration';
import { cacheFarmsLocally, enqueueOfflineActivity } from './utils/offlineStorage';
import { getExplainThisContextForField } from './data/signatureFeaturesData';
import { MOCK_AUTH_USERS, INITIAL_AUTH_SESSIONS, INITIAL_SECURITY_ALERTS, ExtendedAuthUser } from './data/mockAuthData';
import { CropMoistureThresholdConfig, MoistureAlert, ExplainThisMetricContext, GISMapLayerType, AuthSession, SecurityAlert, MFAMethod } from './types';
import { DEFAULT_CROP_MOISTURE_THRESHOLDS, evaluateFieldMoistureAlert } from './utils/moistureAlertUtils';
import { downloadFieldCSV } from './utils/csvExportUtils';
import { Check, Info, Bot, Map, Globe2, BookOpen, Sparkles, Scale } from 'lucide-react';

export default function App() {
  const [farms, setFarms] = useState<Farm[]>(INITIAL_FARMS);
  const [currentFarmId, setCurrentFarmId] = useState<string>(INITIAL_FARMS[0].id);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    INITIAL_FARMS[0].fields[0]?.id || ''
  );
  const [activePersona, setActivePersona] = useState<UserPersona>('farmer');
  const [currentTab, setCurrentTab] = useState<'map' | 'satellite' | 'practices' | 'estimator' | 'geographic' | 'tutorial' | 'workspace' | 'org_audit'>('map');
  const [mapSubMode, setMapSubMode] = useState<'parcel' | 'geographic' | 'signature'>('parcel');
  const [activeMapLayer, setActiveMapLayer] = useState<'satellite' | 'ndvi' | 'soc' | 'moisture' | GISMapLayerType>('satellite');
  const [emissionConfig, setEmissionConfig] = useState<EmissionFactorConfig>(DEFAULT_EMISSION_CONFIG);

  // Landing Screen & Navigation Mode
  const [showLanding, setShowLanding] = useState<boolean>(true);

  // Modals & Assistant Drawers
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAddOnHub, setShowAddOnHub] = useState(false);
  const [addOnInitialModule, setAddOnInitialModule] = useState<'data_room' | 'grants' | 'carbon_program' | 'api_console'>('data_room');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showLineageModal, setShowLineageModal] = useState(false);
  const [showExplainThisModal, setShowExplainThisModal] = useState(false);
  const [showTerraSoilPdfModal, setShowTerraSoilPdfModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<ExtendedAuthUser | null>(MOCK_AUTH_USERS.farmer);
  const [authSessions, setAuthSessions] = useState<AuthSession[]>(INITIAL_AUTH_SESSIONS.farmer);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(INITIAL_SECURITY_ALERTS);
  const [explainThisContext, setExplainThisContext] = useState<ExplainThisMetricContext | null>(null);
  const [lineageField, setLineageField] = useState<Field | null>(null);
  const [comparisonFieldAId, setComparisonFieldAId] = useState<string | undefined>(undefined);
  const [comparisonFieldBId, setComparisonFieldBId] = useState<string | undefined>(undefined);
  const [thresholdConfig, setThresholdConfig] = useState<CropMoistureThresholdConfig>(DEFAULT_CROP_MOISTURE_THRESHOLDS);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Service Worker & Cache Initial State (PWA / Offline Strategy)
  React.useEffect(() => {
    registerServiceWorker();
    cacheFarmsLocally(farms);
  }, []);

  React.useEffect(() => {
    cacheFarmsLocally(farms);
  }, [farms]);

  // Authentication & Security Handlers (PRD-02-05)
  const handleLoginSuccess = (user: ExtendedAuthUser) => {
    setCurrentUser(user);
    setActivePersona(user.role);
    const matchingFarm = farms.find((f) => f.personaType === user.role);
    if (matchingFarm) {
      setCurrentFarmId(matchingFarm.id);
      if (matchingFarm.fields.length > 0) {
        setSelectedFieldId(matchingFarm.fields[0].id);
      }
    }
    setAuthSessions(INITIAL_AUTH_SESSIONS[user.role] || [
      {
        id: `sess-${Date.now()}`,
        userId: user.id,
        deviceName: 'MacBook Pro 16" (Web)',
        deviceType: 'desktop',
        browser: 'Chrome 122.0',
        os: 'macOS Sonoma',
        ipAddress: '172.56.21.90',
        location: 'Des Moines, Iowa',
        isCurrentSession: true,
        lastActive: 'Active now',
        createdAt: new Date().toISOString(),
      }
    ]);
    const newAlert: SecurityAlert = {
      id: `alert-${Date.now()}`,
      userId: user.id,
      type: 'new_device',
      severity: 'info',
      title: 'Successful Authentication',
      description: `Authenticated as ${user.name} (${user.role.toUpperCase()}) with ${user.mfaEnabled ? 'Two-Factor MFA' : 'Standard Password'}.`,
      device: 'Current Device',
      location: 'Local Session',
      ipAddress: '172.56.21.90',
      timestamp: 'Just now',
      acknowledged: false,
    };
    setSecurityAlerts((prev) => [newAlert, ...prev]);
    showToast(`Welcome back, ${user.name}! Switched to ${user.role} workspace.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLanding(true);
    showToast('Signed out of TerraSoil MRV Portal.');
  };

  const handleRevokeSession = (sessionId: string) => {
    setAuthSessions((prev) => prev.filter((s) => s.id !== sessionId));
    const newAlert: SecurityAlert = {
      id: `alert-${Date.now()}`,
      userId: currentUser?.id || 'usr-farmer-01',
      type: 'session_revoked',
      severity: 'warning',
      title: 'Remote Session Revoked',
      description: 'An authorized device session was remotely terminated.',
      device: 'Security Console',
      location: 'Account Settings',
      ipAddress: '172.56.21.90',
      timestamp: 'Just now',
      acknowledged: false,
    };
    setSecurityAlerts((prev) => [newAlert, ...prev]);
    showToast('Session revoked successfully.');
  };

  const handleRevokeAllOtherSessions = () => {
    setAuthSessions((prev) => prev.filter((s) => s.isCurrentSession));
    const newAlert: SecurityAlert = {
      id: `alert-${Date.now()}`,
      userId: currentUser?.id || 'usr-farmer-01',
      type: 'session_revoked',
      severity: 'warning',
      title: 'All Other Sessions Terminated',
      description: 'All secondary desktop, tablet, and mobile sessions were revoked.',
      device: 'Current Browser',
      location: 'Account Settings',
      ipAddress: '172.56.21.90',
      timestamp: 'Just now',
      acknowledged: false,
    };
    setSecurityAlerts((prev) => [newAlert, ...prev]);
    showToast('All other active sessions have been terminated.');
  };

  const handleToggleMfa = (enabled: boolean, method?: MFAMethod) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        mfaEnabled: enabled,
        mfaMethod: method || currentUser.mfaMethod || 'authenticator',
      };
      setCurrentUser(updatedUser);
      const newAlert: SecurityAlert = {
        id: `alert-${Date.now()}`,
        userId: currentUser.id,
        type: 'mfa_enabled',
        severity: 'info',
        title: enabled ? 'Two-Factor Authentication Enforced' : 'MFA Deactivated',
        description: `MFA preference updated to ${enabled ? (method || 'authenticator') : 'disabled'}.`,
        device: 'Current Browser',
        location: 'Account Settings',
        ipAddress: '172.56.21.90',
        timestamp: 'Just now',
        acknowledged: false,
      };
      setSecurityAlerts((prev) => [newAlert, ...prev]);
      showToast(enabled ? `MFA enabled via ${method || 'authenticator'}` : 'MFA disabled');
    }
  };

  const handleUpdateRecoveryEmail = (email: string) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        recoveryEmail: email,
      });
      showToast(`Recovery email set to ${email}`);
    }
  };

  const handleOpenComparisonModal = (fieldAId?: string, fieldBId?: string) => {
    if (fieldAId) setComparisonFieldAId(fieldAId);
    if (fieldBId) setComparisonFieldBId(fieldBId);
    setShowComparisonModal(true);
  };

  const handleOpenLineageModal = (field?: Field) => {
    const target = field || selectedField || currentFarm.fields[0];
    if (target) {
      setLineageField(target);
      setShowLineageModal(true);
    }
  };

  const handleOpenExplainThis = (metricName: string, metricValue: string | number, unit: string) => {
    const ctx = getExplainThisContextForField(metricName, metricValue, unit, selectedField?.name || 'North Section 14');
    setExplainThisContext(ctx);
    setShowExplainThisModal(true);
  };

  // Current active farm and field
  const currentFarm = farms.find((f) => f.id === currentFarmId) || farms[0];
  const selectedField = currentFarm.fields.find((f) => f.id === selectedFieldId) || currentFarm.fields[0] || null;

  // Active threshold-based moisture alerts across farm fields
  const allActiveAlerts: MoistureAlert[] = currentFarm.fields
    .map((f) => evaluateFieldMoistureAlert(f, thresholdConfig))
    .filter((a): a is MoistureAlert => a !== null && !acknowledgedAlerts[a.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSimulateMoistureDrop = (fieldId: string, simulatedMoisture: number) => {
    setFarms((prevFarms) =>
      prevFarms.map((f) => {
        if (f.id !== currentFarmId) return f;
        return {
          ...f,
          fields: f.fields.map((fld) => {
            if (fld.id !== fieldId) return fld;
            return {
              ...fld,
              rootZoneMoisturePct: simulatedMoisture,
            };
          }),
        };
      })
    );
    showToast(`Simulated dry spell: Root moisture reduced to ${simulatedMoisture}% VWC. Threshold alert triggered!`);
  };

  const handleExportCSV = () => {
    if (!selectedField) return;
    downloadFieldCSV(selectedField, currentFarm);
    showToast(`Exported ${selectedField.name} telemetry & activity ledger as CSV.`);
  };

  // Persona switcher
  const handleSelectPersona = (persona: UserPersona) => {
    setActivePersona(persona);
    if (MOCK_AUTH_USERS[persona]) {
      setCurrentUser(MOCK_AUTH_USERS[persona]);
      setAuthSessions(INITIAL_AUTH_SESSIONS[persona] || []);
    }
    const matchingFarm = farms.find((f) => f.personaType === persona);
    if (matchingFarm) {
      setCurrentFarmId(matchingFarm.id);
      if (matchingFarm.fields.length > 0) {
        setSelectedFieldId(matchingFarm.fields[0].id);
      }
    }
    showToast(`Switched to ${persona === 'farmer' ? 'Grower' : persona === 'agronomist' ? 'Agronomist Consultant' : persona === 'corporate' ? 'Corporate Scope 3' : 'Auditor / Verifier'} Workspace`);
  };

  // Tab switcher with geographic map sub-mode routing
  const handleSelectTab = (tab: 'map' | 'satellite' | 'practices' | 'estimator' | 'tutorial' | 'geographic' | 'workspace' | 'org_audit') => {
    if (tab === 'geographic') {
      setCurrentTab('map');
      setMapSubMode('geographic');
    } else {
      setCurrentTab(tab as any);
      if (tab === 'map') {
        setMapSubMode('parcel');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Farm switcher
  const handleSelectFarm = (farm: Farm) => {
    setCurrentFarmId(farm.id);
    setActivePersona(farm.personaType);
    if (farm.fields.length > 0) {
      setSelectedFieldId(farm.fields[0].id);
    }
  };

  // Add practice to field
  const handleAddPractice = (fieldId: string, practiceData: Omit<PracticeRecord, 'id'>) => {
    const newPractice: PracticeRecord = {
      ...practiceData,
      id: `prac-${Date.now()}`,
    };

    setFarms((prevFarms) =>
      prevFarms.map((farm) => {
        if (farm.id !== currentFarmId) return farm;
        const updatedFields = farm.fields.map((field) => {
          if (field.id !== fieldId) return field;
          const updatedPractices = [...field.practices, newPractice];
          const updatedCarbon = recalculateFieldCarbon(
            { ...field, practices: updatedPractices },
            emissionConfig
          );
          return {
            ...field,
            practices: updatedPractices,
            carbonBreakdown: updatedCarbon,
          };
        });
        return {
          ...farm,
          fields: updatedFields,
        };
      })
    );

    showToast(`Added "${newPractice.title}" to field activity ledger (+${newPractice.carbonEstimateMT} MT CO₂e).`);
  };

  // Delete practice from field
  const handleDeletePractice = (fieldId: string, practiceId: string) => {
    setFarms((prevFarms) =>
      prevFarms.map((farm) => {
        if (farm.id !== currentFarmId) return farm;
        const updatedFields = farm.fields.map((field) => {
          if (field.id !== fieldId) return field;
          const updatedPractices = field.practices.filter((p) => p.id !== practiceId);
          const updatedCarbon = recalculateFieldCarbon(
            { ...field, practices: updatedPractices },
            emissionConfig
          );
          return {
            ...field,
            practices: updatedPractices,
            carbonBreakdown: updatedCarbon,
          };
        });
        return {
          ...farm,
          fields: updatedFields,
        };
      })
    );
    showToast('Practice record removed.');
  };

  // Add newly drawn field boundary
  const handleAddNewField = (newFieldData: Partial<Field>) => {
    const newId = `field-${Date.now()}`;
    const baseField: Field = {
      id: newId,
      farmId: currentFarmId,
      name: newFieldData.name || 'New Mapped Section',
      acreage: newFieldData.acreage || 160,
      cropType: newFieldData.cropType || 'Corn / Cover Crop',
      soilClassification: newFieldData.soilClassification || 'Typic Hapludolls - Rich Loam',
      baselineSOCPct: newFieldData.baselineSOCPct || 2.45,
      baselineSOCStockTonsPerHa: newFieldData.baselineSOCStockTonsPerHa || 52.0,
      currentNDVI: newFieldData.currentNDVI || 0.74,
      ndviTrend: 'improving',
      surfaceMoisturePct: newFieldData.surfaceMoisturePct || 28,
      rootZoneMoisturePct: newFieldData.rootZoneMoisturePct || 35,
      boundaryCoordinates: newFieldData.boundaryCoordinates || [],
      centroid: newFieldData.centroid || [42.06, -93.58],
      practices: [],
      ndviHistory: [
        { date: '2026-05-01', ndvi: 0.38 },
        { date: '2026-06-15', ndvi: 0.65 },
        { date: '2026-08-01', ndvi: 0.78 },
        { date: '2026-09-01', ndvi: 0.74 },
      ],
      soilMoistureHistory: [
        { month: 'Jun', surfaceMoisture: 28, rootZoneMoisture: 35, precipitationMm: 55 },
        { month: 'Jul', surfaceMoisture: 24, rootZoneMoisture: 31, precipitationMm: 42 },
        { month: 'Aug', surfaceMoisture: 26, rootZoneMoisture: 33, precipitationMm: 58 },
        { month: 'Sep', surfaceMoisture: 29, rootZoneMoisture: 36, precipitationMm: 68 },
      ],
      carbonBreakdown: {
        coverCropMT: 0,
        noTillMT: 0,
        fertilizerReductionMT: 0,
        grazingRotationMT: 0,
        compostBiocharMT: 0,
        totalGrossMT: 0,
        totalNetPerAcre: 0,
        potentialRevenueUSD: 0,
        somAccretion5YrPct: 0,
        waterCapacityGainGallons: 0,
      },
    };

    setFarms((prevFarms) =>
      prevFarms.map((farm) => {
        if (farm.id !== currentFarmId) return farm;
        const updatedFields = [...farm.fields, baseField];
        const newTotalAcres = updatedFields.reduce((acc, f) => acc + f.acreage, 0);
        return {
          ...farm,
          fields: updatedFields,
          totalAcreage: newTotalAcres,
        };
      })
    );

    setSelectedFieldId(newId);
    showToast(`Registered field "${baseField.name}" (${baseField.acreage} ac). Sentinel-2 telemetry linked.`);
  };

  // Batch import field boundaries from GeoJSON files
  const handleImportGeoJSONFields = (importedFieldsData: Partial<Field>[], mode: 'append' | 'replace' = 'append') => {
    if (importedFieldsData.length === 0) return;

    const newFields: Field[] = importedFieldsData.map((data, index) => {
      const fieldId = `field-geojson-${Date.now()}-${index + 1}`;
      const boundary = data.boundaryCoordinates || [];

      let centroid = data.centroid;
      if (!centroid && boundary.length > 0) {
        let sumLat = 0;
        let sumLng = 0;
        boundary.forEach(([lat, lng]) => {
          sumLat += lat;
          sumLng += lng;
        });
        centroid = [sumLat / boundary.length, sumLng / boundary.length];
      }

      return {
        id: fieldId,
        farmId: currentFarmId,
        name: data.name || `Imported Parcel ${index + 1}`,
        acreage: data.acreage || 120,
        cropType: data.cropType || 'Corn / Cover Crop',
        soilClassification: data.soilClassification || 'Typic Hapludolls - Rich Loam',
        baselineSOCPct: data.baselineSOCPct || 2.5,
        baselineSOCStockTonsPerHa: data.baselineSOCStockTonsPerHa || 53.5,
        currentNDVI: data.currentNDVI || 0.72,
        ndviTrend: 'improving',
        surfaceMoisturePct: data.surfaceMoisturePct || 28,
        rootZoneMoisturePct: data.rootZoneMoisturePct || 35,
        boundaryCoordinates: boundary,
        centroid: centroid || [42.0625, -93.585],
        practices: data.practices || [
          {
            id: `prac-${Date.now()}-${index}-cc`,
            fieldId,
            practiceType: 'cover_crop',
            title: 'Rye / Clover Cover Crop',
            dateImplemented: '2024-09-20',
            details: 'Precision drilled multi-species cover crop mix',
            status: 'verified',
            emissionReductionFactor: 0.42,
            carbonEstimateMT: Math.round((data.acreage || 120) * 0.42 * 10) / 10,
            acreageApplied: data.acreage || 120,
          },
        ],
        ndviHistory: data.ndviHistory || [
          { date: '2026-05-01', ndvi: 0.45 },
          { date: '2026-07-01', ndvi: 0.72 },
          { date: '2026-09-01', ndvi: 0.76 },
        ],
        soilMoistureHistory: data.soilMoistureHistory || [
          { month: 'Jun', surfaceMoisture: 28, rootZoneMoisture: 35, precipitationMm: 60 },
          { month: 'Jul', surfaceMoisture: 25, rootZoneMoisture: 32, precipitationMm: 45 },
          { month: 'Aug', surfaceMoisture: 27, rootZoneMoisture: 34, precipitationMm: 58 },
          { month: 'Sep', surfaceMoisture: 30, rootZoneMoisture: 38, precipitationMm: 70 },
        ],
        carbonBreakdown: data.carbonBreakdown || {
          coverCropMT: Math.round((data.acreage || 120) * 0.42 * 10) / 10,
          noTillMT: Math.round((data.acreage || 120) * 0.35 * 10) / 10,
          fertilizerReductionMT: 0,
          grazingRotationMT: 0,
          compostBiocharMT: 0,
          totalGrossMT: Math.round((data.acreage || 120) * 0.77 * 10) / 10,
          totalNetPerAcre: 0.77,
          potentialRevenueUSD: Math.round((data.acreage || 120) * 0.77 * 35),
          somAccretion5YrPct: 0.2,
          waterCapacityGainGallons: Math.round((data.acreage || 120) * 16000),
        },
      };
    });

    setFarms((prevFarms) =>
      prevFarms.map((f) => {
        if (f.id !== currentFarmId) return f;
        const nextFields = mode === 'replace' ? newFields : [...f.fields, ...newFields];
        const nextAcreage = nextFields.reduce((sum, fld) => sum + fld.acreage, 0);
        return {
          ...f,
          fields: nextFields,
          totalAcreage: nextAcreage,
        };
      })
    );

    if (newFields.length > 0) {
      setSelectedFieldId(newFields[0].id);
    }

    enqueueOfflineActivity({
      type: 'import_geojson',
      actionTitle: `Imported ${newFields.length} field boundaries via GeoJSON (${mode === 'replace' ? 'Replaced' : 'Appended'})`,
      farmId: currentFarmId,
      payload: { count: newFields.length, acreage: newFields.reduce((s, f) => s + f.acreage, 0) },
    });

    const totalImportedAcres = newFields.reduce((sum, fld) => sum + fld.acreage, 0);
    showToast(
      `Successfully imported ${newFields.length} field boundaries (${Math.round(totalImportedAcres).toLocaleString()} acres) via GeoJSON!`
    );
  };

  // When emission methodology config changes, recalculate all fields
  const handleUpdateConfig = (newConfig: EmissionFactorConfig) => {
    setEmissionConfig(newConfig);
    setFarms((prevFarms) =>
      prevFarms.map((farm) => {
        const updatedFields = farm.fields.map((field) => ({
          ...field,
          carbonBreakdown: recalculateFieldCarbon(field, newConfig),
        }));
        return {
          ...farm,
          fields: updatedFields,
        };
      })
    );
    showToast(`Emission methodology updated to ${newConfig.methodology === 'USDA_COMET_FARM' ? 'USDA COMET-Farm' : 'IPCC Tier 1'}`);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-emerald-500/80 text-stone-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200 text-xs">
          <div className="p-1 bg-emerald-950 text-emerald-400 rounded-lg">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {showLanding ? (
        <LandingScreen
          currentUser={currentUser}
          onLoginSuccess={(user) => {
            handleLoginSuccess(user);
          }}
          onStartNow={() => setShowLanding(false)}
          onOpenAuthModal={(mode) => setShowAuthModal(true)}
          onOpenPricingModal={() => setShowPricingModal(true)}
          onOpenReportModal={() => setShowReportModal(true)}
          onOpenAIAssistant={() => setShowAIAssistant(true)}
          onOpenTerraSoilPdf={() => setShowTerraSoilPdfModal(true)}
        />
      ) : (
        <>
          {/* Top Navbar */}
          <Navbar
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            activePersona={activePersona}
            onSelectPersona={handleSelectPersona}
            farms={farms}
            currentFarm={currentFarm}
            onSelectFarm={handleSelectFarm}
            onOpenReportModal={() => setShowReportModal(true)}
            onOpenPricingModal={() => setShowPricingModal(true)}
            onToggleAIAssistant={() => setShowAIAssistant(!showAIAssistant)}
            onOpenTerraSoilPdf={() => setShowTerraSoilPdfModal(true)}
            activeAlertsCount={allActiveAlerts.length}
            onOpenAlertModal={() => setShowAlertModal(true)}
            onExportCSV={handleExportCSV}
            currentUser={currentUser}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onOpenSecurityModal={() => setShowSecurityModal(true)}
            onLogout={handleLogout}
            activeSessionsCount={authSessions.length}
            onReturnToLanding={() => setShowLanding(true)}
          />

          {/* Service Worker Offline Status Banner & Cache Controller */}
          <OfflineStatusBanner onSyncComplete={(msg) => showToast(msg)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Persona Hero Banner */}
        <PersonaBanner
          activePersona={activePersona}
          currentFarm={currentFarm}
          onOpenReportModal={() => setShowReportModal(true)}
          onOpenPricingModal={() => setShowPricingModal(true)}
        />

        {/* Dedicated Role Feature Hub & Operations Center */}
        <RoleWorkspaceHub
          activePersona={activePersona}
          currentFarm={currentFarm}
          farms={farms}
          onSelectFarm={handleSelectFarm}
          onOpenReportModal={() => setShowReportModal(true)}
          onOpenPricingModal={() => setShowPricingModal(true)}
          onAddPractice={handleAddPractice}
          onOpenComparisonModal={() => handleOpenComparisonModal()}
          onOpenLineageModal={handleOpenLineageModal}
        />

        {/* Tab 1: Field GIS Mapping & Global Explorer */}
        {currentTab === 'map' && (
          <div className="space-y-6">
            {/* Map Mode Selector: Local Field Parcel GIS vs Global Intelligence Explorer vs Signature Features */}
            <div className="bg-stone-900 border border-stone-800 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => setMapSubMode('parcel')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    mapSubMode === 'parcel'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Local Field Parcel GIS (PRD-07)</span>
                </button>

                <button
                  onClick={() => setMapSubMode('geographic')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    mapSubMode === 'geographic'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Global Intelligence Explorer (PRD-08)</span>
                </button>

                <button
                  onClick={() => setMapSubMode('signature')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    mapSubMode === 'signature'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Benchmark &amp; Schema Hub (PRD-09)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Enrolled:</span>
                <span className="bg-stone-950 border border-stone-800 text-emerald-400 font-mono text-xs px-3 py-1.5 rounded-xl font-bold">
                  {currentFarm.fields.length} Fields &bull; {currentFarm.totalAcreage.toLocaleString()} Acres
                </span>
              </div>
            </div>

            {mapSubMode === 'parcel' && (
              <FieldMap
                fields={currentFarm.fields}
                selectedField={selectedField}
                onSelectField={(f) => setSelectedFieldId(f.id)}
                onAddNewField={handleAddNewField}
                onImportGeoJSONFields={handleImportGeoJSONFields}
                activeLayer={activeMapLayer}
                onChangeLayer={setActiveMapLayer}
                activePersona={activePersona}
                currentFarm={currentFarm}
                onOpenLineageModal={handleOpenLineageModal}
                onOpenReportModal={() => setShowReportModal(true)}
                onOpenGlobalExplorer={() => setMapSubMode('geographic')}
                onOpenExplainThis={handleOpenExplainThis}
              />
            )}

            {mapSubMode === 'geographic' && (
              <GeographicCategoryMap
                onOpenLocalGIS={() => setMapSubMode('parcel')}
                activePersona={activePersona}
              />
            )}

            {mapSubMode === 'signature' && (
              <SignatureFeaturesHub
                currentFarm={currentFarm}
                selectedField={selectedField}
                onOpenLineageModal={handleOpenLineageModal}
                onOpenReportModal={() => setShowReportModal(true)}
                onOpenLocalGIS={() => setMapSubMode('parcel')}
                onOpenGlobalExplorer={() => setMapSubMode('geographic')}
                onOpenExplainThis={handleOpenExplainThis}
              />
            )}
          </div>
        )}

        {/* Tab 2: Satellite & Soil Telemetry */}
        {currentTab === 'satellite' && (
          <SatelliteDashboard
            fields={currentFarm.fields}
            selectedField={selectedField}
            onSelectField={(f) => setSelectedFieldId(f.id)}
            currentFarm={currentFarm}
            thresholdConfig={thresholdConfig}
            onOpenAlertModal={() => setShowAlertModal(true)}
            onExportCSV={handleExportCSV}
            onOpenComparisonModal={handleOpenComparisonModal}
            onOpenLineageModal={handleOpenLineageModal}
          />
        )}

        {/* Tab 3: Practice Activity Ledger */}
        {currentTab === 'practices' && (
          <PracticeTracker
            fields={currentFarm.fields}
            selectedField={selectedField}
            onAddPractice={handleAddPractice}
            onDeletePractice={handleDeletePractice}
          />
        )}

        {/* Tab 4: Carbon Estimator & ROI */}
        {currentTab === 'estimator' && (
          <div className="space-y-6">
            <CarbonEstimator
              currentFarm={currentFarm}
              fields={currentFarm.fields}
              config={emissionConfig}
              onUpdateConfig={handleUpdateConfig}
              onOpenLineageModal={handleOpenLineageModal}
            />

            {/* Core Platform & Data Foundation Hub */}
            <DataFoundationHub
              currentFarm={currentFarm}
              fields={currentFarm.fields}
              selectedField={selectedField}
              onSelectField={(f) => setSelectedFieldId(f.id)}
              config={emissionConfig}
              activePersona={activePersona}
              onOpenLineageModal={handleOpenLineageModal}
            />
          </div>
        )}

        {/* Tab 6: Tutorial & Portal Guide */}
        {currentTab === 'tutorial' && (
          <TutorialSection
            onNavigateTab={handleSelectTab}
            onOpenReportModal={() => setShowReportModal(true)}
            onToggleAIAssistant={() => setShowAIAssistant(true)}
            onOpenTerraSoilPdf={() => setShowTerraSoilPdfModal(true)}
          />
        )}

        {/* Tab 7: Personal Command Center & User Workspace (PRD) */}
        {currentTab === 'workspace' && currentUser && (
          <PersonalWorkspaceHub
            currentUser={currentUser}
            activePersona={activePersona}
            onSelectPersona={handleSelectPersona}
            onNavigateTab={handleSelectTab}
            onOpenSecurityModal={() => setShowSecurityModal(true)}
            onOpenAuthModal={() => setShowAuthModal(true)}
            onOpenReportModal={() => setShowReportModal(true)}
            onOpenTerraSoilPdf={() => setShowTerraSoilPdfModal(true)}
            currentFarm={currentFarm}
          />
        )}

        {/* Tab 8: Organization, Permissions & System-of-Record Audit Log (PRD-12, P0) */}
        {currentTab === 'org_audit' && (
          <OrganizationAndAuditHub
            currentFarm={currentFarm}
            activePersona={activePersona}
            onOpenReportModal={() => setShowReportModal(true)}
            onNavigateTab={handleSelectTab as any}
          />
        )}
      </main>

      {/* Floating Assistant Trigger Button */}
      <button
        onClick={() => setShowAIAssistant(true)}
        className="fixed bottom-6 left-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border border-emerald-400/40"
        title="Open TerraSoil Assistant"
      >
        <Bot className="w-5 h-5" />
        <span className="text-xs font-bold pr-1 hidden sm:inline">Ask TerraSoil AI</span>
      </button>
      </>
      )}

      {/* Embedded AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        activePersona={activePersona}
        currentFarm={currentFarm}
        selectedField={selectedField}
        onOpenPdfGuide={() => setShowTerraSoilPdfModal(true)}
      />

      {/* TerraSoil AI Specification & Governance PDF Modal */}
      <TerraSoilAIPdfModal
        isOpen={showTerraSoilPdfModal}
        onClose={() => setShowTerraSoilPdfModal(false)}
      />

      {/* Audit-Ready Compliance Report Modal */}
      {showReportModal && (
        <ComplianceReportModal
          farm={currentFarm}
          fields={currentFarm.fields}
          selectedField={selectedField}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Transparent Pricing Modal */}
      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          onSelectPlan={(plan) => {
            showToast(`Selected ${plan}. Redirecting to enrollment package...`);
            setShowPricingModal(false);
          }}
          onOpenReportModal={() => setShowReportModal(true)}
          onOpenAddOnHub={(module) => {
            setAddOnInitialModule(module || 'data_room');
            setShowAddOnHub(true);
          }}
        />
      )}

      {/* Modular Expansion & Add-On Product Lines Hub */}
      {showAddOnHub && (
        <AddOnModulesHub
          isOpen={showAddOnHub}
          onClose={() => setShowAddOnHub(false)}
          currentFarm={currentFarm}
          selectedField={selectedField}
          initialModule={addOnInitialModule}
        />
      )}

      {/* Root-Zone Soil Moisture Alert Center Modal */}
      {showAlertModal && selectedField && (
        <MoistureAlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          alerts={allActiveAlerts}
          currentField={selectedField}
          currentFarm={currentFarm}
          thresholdConfig={thresholdConfig}
          onUpdateThresholdConfig={(newConfig) => {
            setThresholdConfig(newConfig);
            showToast('Updated crop-specific moisture thresholds.');
          }}
          onAcknowledgeAlert={(alertId) => {
            setAcknowledgedAlerts((prev) => ({ ...prev, [alertId]: true }));
            showToast('Moisture alert acknowledged.');
          }}
          onSimulateMoistureDrop={handleSimulateMoistureDrop}
        />
      )}

      {/* Side-by-Side Field Comparison Bar Chart Modal */}
      {showComparisonModal && (
        <FieldComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          fields={currentFarm.fields}
          initialFieldAId={comparisonFieldAId || selectedField?.id}
          initialFieldBId={comparisonFieldBId}
        />
      )}

      {/* Carbon Data Lineage & Provenance Modal */}
      {showLineageModal && (
        <CarbonDataLineageModal
          isOpen={showLineageModal}
          onClose={() => setShowLineageModal(false)}
          field={lineageField || selectedField || currentFarm.fields[0]}
          farm={currentFarm}
          config={emissionConfig}
        />
      )}

      {/* Shared Trust Feature: Explain This Modal (PRD-09 §4) */}
      {showExplainThisModal && (
        <ExplainThisModal
          isOpen={showExplainThisModal}
          onClose={() => setShowExplainThisModal(false)}
          context={explainThisContext}
        />
      )}

      {/* Authentication & Multi-Role Onboarding Modal (PRD-02–05) */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          currentUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Security & Active Sessions Management Modal */}
      {showSecurityModal && currentUser && (
        <SecuritySettingsModal
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          currentUser={currentUser}
          sessions={authSessions}
          securityAlerts={securityAlerts}
          onRevokeSession={handleRevokeSession}
          onRevokeAllOtherSessions={handleRevokeAllOtherSessions}
          onToggleMfa={handleToggleMfa}
          onUpdateRecoveryEmail={handleUpdateRecoveryEmail}
        />
      )}

      {/* Footer */}
      {!showLanding && (
        <footer className="bg-stone-950 border-t border-stone-800 text-xs text-stone-500 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-300">TerraSoil Portal</span>
              <span>&bull;</span>
              <span>Measurement, Reporting &amp; Verification (MRV) for Regenerative Agriculture</span>
            </div>

            <div className="flex items-center gap-6">
              <span>USDA COMET-Farm &bull; IPCC Tier 1 &bull; Sentinel-2 Copernicus</span>
              <button
                onClick={() => setShowLanding(true)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Landing Screen
              </button>
              <button
                onClick={() => handleSelectTab('workspace')}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Command Center
              </button>
              <button
                onClick={() => handleSelectTab('org_audit')}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Org &amp; Audit Log
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="text-emerald-400 hover:underline"
              >
                Field Verification Reports
              </button>
              <button
                onClick={() => setShowTerraSoilPdfModal(true)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                TerraSoil AI Guide (PDF)
              </button>
              <button
                onClick={() => setShowPricingModal(true)}
                className="text-stone-400 hover:text-stone-200"
              >
                Pricing
              </button>
              <a href="mailto:support@terrasoil.ag" className="hover:text-stone-300">
                support@terrasoil.ag
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
