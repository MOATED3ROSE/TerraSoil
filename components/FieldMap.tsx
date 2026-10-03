import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  Field, 
  FieldNote, 
  FieldNoteCategory, 
  FieldNoteSeverity, 
  UserPersona,
  Farm,
  GISMapLayerType,
  GISBaseMapType,
  GISManagementZone,
  GISSamplePoint,
  GISEvidencePin,
  GISTimelineStep,
  GISCarbonLedgerRecord,
  GISParcelAlert
} from '../types';
import { INITIAL_FIELD_NOTES } from '../data/initialFieldNotes';
import { 
  MOCK_MANAGEMENT_ZONES, 
  MOCK_SAMPLE_POINTS, 
  MOCK_EVIDENCE_PINS, 
  MOCK_GIS_TIMELINE_STEPS, 
  MOCK_CARBON_LEDGER_RECORDS, 
  MOCK_PARCEL_ALERTS 
} from '../data/gisMockData';
import { 
  Layers, 
  MapPin, 
  Plus, 
  Download, 
  Check, 
  Info, 
  Eye, 
  ShieldCheck, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Droplets, 
  Activity, 
  HelpCircle, 
  X, 
  Filter,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  Crosshair,
  Locate,
  Navigation,
  Search,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  Compass,
  FileText,
  StickyNote,
  Trash2,
  AlertTriangle,
  Tag,
  User,
  Clock,
  Edit3,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Database,
  Calendar,
  Award,
  Zap,
  Cpu,
  Tractor,
  FlaskConical,
  Building2,
  CheckSquare,
  BarChart3,
  FileCheck2,
  ArrowRight,
  Sun,
  Wind,
  Shield,
  UploadCloud,
  Hash,
  Copy,
  FolderDown,
  Layers2,
  Globe2,
  CloudRain,
  Thermometer,
  RefreshCw,
  AlertCircle,
  CloudLightning,
  CloudSun,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { downloadFieldCSV } from '../utils/csvExportUtils';
import { 
  fetchFieldWeatherData, 
  generateMockFieldWeather, 
  FieldWeatherReport, 
  DayWeatherForecast 
} from '../services/weatherService';
import { getFieldWeatherHeatmapData } from '../utils/mockWeatherFetcher';
import { GeoJsonImportModal } from './GeoJsonImportModal';
import { exportFieldsToGeoJSON, downloadGeoJSONFile } from '../utils/geoJsonUtils';
import { cacheFarmsLocally, enqueueOfflineActivity } from '../utils/offlineStorage';
import { SoilHealthPhoto, SoilHealthMarkerType } from '../types';
import { SoilCameraCaptureModal } from './SoilCameraCaptureModal';
import { SoilHealthPhotoInspectionModal } from './SoilHealthPhotoInspectionModal';
import { INITIAL_SOIL_HEALTH_PHOTOS, SOIL_MARKER_CATEGORIES } from '../data/mockSoilHealthPhotos';

interface FieldMapProps {
  fields: Field[];
  selectedField: Field | null;
  onSelectField: (field: Field) => void;
  onAddNewField: (newField: Partial<Field>) => void;
  onImportGeoJSONFields?: (fields: Partial<Field>[], mode: 'append' | 'replace') => void;
  activeLayer: 'satellite' | 'ndvi' | 'soc' | 'moisture' | GISMapLayerType;
  onChangeLayer: (layer: any) => void;
  activePersona?: UserPersona;
  currentFarm?: Farm;
  onOpenLineageModal?: (field?: Field) => void;
  onOpenReportModal?: () => void;
  onOpenGlobalExplorer?: () => void;
  onOpenExplainThis?: (metricName: string, metricValue: string | number, unit: string) => void;
}

interface LegendTier {
  id: string;
  rangeLabel: string;
  color: string;
  title: string;
  agronomicDescription: string;
  actionableGuidance: string;
  check: (field: Field) => boolean;
}

export const FieldMap: React.FC<FieldMapProps> = ({
  fields,
  selectedField,
  onSelectField,
  onAddNewField,
  onImportGeoJSONFields,
  activeLayer,
  onChangeLayer,
  activePersona = 'farmer',
  currentFarm,
  onOpenLineageModal,
  onOpenReportModal,
  onOpenGlobalExplorer,
  onOpenExplainThis,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayersRef = useRef<{ [fieldId: string]: L.Polygon }>({});
  const zoneLayersRef = useRef<{ [zoneId: string]: L.Polygon }>({});
  const evidenceMarkersRef = useRef<{ [pinId: string]: L.Marker }>({});
  const sampleMarkersRef = useRef<{ [sampleId: string]: L.Marker }>({});
  const alertMarkersRef = useRef<{ [alertId: string]: L.Marker }>({});
  const noteMarkersRef = useRef<{ [noteId: string]: L.Marker }>({});
  const photoMarkersRef = useRef<{ [photoId: string]: L.Marker }>({});
  const drawPointsRef = useRef<[number, number][]>([]);
  const drawLayerRef = useRef<L.Polygon | null>(null);
  const weatherMarkerRef = useRef<L.Marker | null>(null);

  // ================= STATE HOOKS =================
  const [currentBaseMap, setCurrentBaseMap] = useState<GISBaseMapType>('esri_satellite');
  const [layerOpacity, setLayerOpacity] = useState<number>(0.65);
  const [showLayerLibraryModal, setShowLayerLibraryModal] = useState<boolean>(false);
  const [showGeoJsonModal, setShowGeoJsonModal] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPointsCount, setDrawingPointsCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newCropType, setNewCropType] = useState('Corn / Cover Crop Mix');
  const [calculatedDrawnAcres, setCalculatedDrawnAcres] = useState(0);

  // Overlays visibility toggles
  const [showZonesLayer, setShowZonesLayer] = useState<boolean>(true);
  const [showEvidencePins, setShowEvidencePins] = useState<boolean>(true);
  const [showSoilSamplingLayer, setShowSoilSamplingLayer] = useState<boolean>(true);
  const [showAlertPins, setShowAlertPins] = useState<boolean>(true);
  const [showNotesLayer, setShowNotesLayer] = useState<boolean>(true);
  const [showPhotosLayer, setShowPhotosLayer] = useState<boolean>(true);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState<boolean>(true);
  const [isWeatherOverlayMinimized, setIsWeatherOverlayMinimized] = useState<boolean>(false);
  const [weatherTempUnit, setWeatherTempUnit] = useState<'F' | 'C'>('F');
  const [showWeatherDecisionModal, setShowWeatherDecisionModal] = useState<boolean>(false);
  const [selectedForecastDay, setSelectedForecastDay] = useState<DayWeatherForecast | null>(null);

  // Soil Camera & Geotagged Health Photos State
  const [showCameraCaptureModal, setShowCameraCaptureModal] = useState<boolean>(false);
  const [selectedPhotoForInspection, setSelectedPhotoForInspection] = useState<SoilHealthPhoto | null>(null);
  const [showPhotoInspectionModal, setShowPhotoInspectionModal] = useState<boolean>(false);
  const [photoMarkerFilter, setPhotoMarkerFilter] = useState<string>('ALL');
  const [photoSearchQuery, setPhotoSearchQuery] = useState<string>('');
  const [soilPhotos, setSoilPhotos] = useState<SoilHealthPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('terrasoil_soil_health_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load soil photos from localStorage', e);
    }
    return INITIAL_SOIL_HEALTH_PHOTOS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('terrasoil_soil_health_photos', JSON.stringify(soilPhotos));
    } catch (e) {
      console.error('Failed to save soil photos to localStorage', e);
    }
  }, [soilPhotos]);

  // Live Weather Telemetry State
  const [weatherReport, setWeatherReport] = useState<FieldWeatherReport | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  // Sidebar List & View State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'fields' | 'intelligence' | 'sampling' | 'verification' | 'ledger' | 'notes' | 'photos'>('fields');
  const [fieldSearchQuery, setFieldSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('ALL');
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [activeZoomPreset, setActiveZoomPreset] = useState<'fit' | 'close' | 'context'>('fit');
  const initialCenteredRef = useRef(false);

  // Timeline Slider State
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState<number>(5); // Default to current 2025 step
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timelineTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & Inspection Drawers
  const [selectedZone, setSelectedZone] = useState<GISManagementZone | null>(null);
  const [selectedEvidencePin, setSelectedEvidencePin] = useState<GISEvidencePin | null>(null);
  const [selectedSamplePoint, setSelectedSamplePoint] = useState<GISSamplePoint | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<GISParcelAlert | null>(null);
  const [showSamplePlanModal, setShowSamplePlanModal] = useState<boolean>(false);
  const [showVerificationDossierModal, setShowVerificationDossierModal] = useState<boolean>(false);
  const [showCarbonLedgerModal, setShowCarbonLedgerModal] = useState<boolean>(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
  const [isAddingNoteMode, setIsAddingNoteMode] = useState<boolean>(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Intelligence Card Tab
  const [intelligenceCardTab, setIntelligenceCardTab] = useState<'vitality' | 'carbon' | 'ssurgo' | 'microclimate'>('vitality');

  // Scouting Notes
  const [notes, setNotes] = useState<FieldNote[]>(() => {
    try {
      const saved = localStorage.getItem('terrasoil_geotagged_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
    return INITIAL_FIELD_NOTES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('terrasoil_geotagged_notes', JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
  }, [notes]);

  // Notes Search & Filters
  const [noteSearchQuery, setNoteSearchQuery] = useState<string>('');
  const [noteCategoryFilter, setNoteCategoryFilter] = useState<string>('ALL');
  const [noteSeverityFilter, setNoteSeverityFilter] = useState<string>('ALL');

  // New Note Form State
  const [newNoteCoordinates, setNewNoteCoordinates] = useState<[number, number]>([42.062, -93.585]);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [newNoteCategory, setNewNoteCategory] = useState<FieldNoteCategory>('observation');
  const [newNoteSeverity, setNewNoteSeverity] = useState<FieldNoteSeverity>('info');
  const [newNoteFieldId, setNewNoteFieldId] = useState<string>('');
  const [newNoteAuthor, setNewNoteAuthor] = useState<string>('Dan Miller (Operator)');
  const [newNoteTags, setNewNoteTags] = useState<string>('Scouting, Topsoil');

  // Interactive Legend State
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);
  const [activeTierId, setActiveTierId] = useState<string | null>(null);
  const [hoveredTierId, setHoveredTierId] = useState<string | null>(null);
  const [showAgronomicGuideModal, setShowAgronomicGuideModal] = useState(false);

  // Safe active field reference
  const currentTargetField = selectedField || (fields.length > 0 ? fields[0] : null);
  const activeFieldZones = currentTargetField ? (MOCK_MANAGEMENT_ZONES[currentTargetField.id] || []) : [];
  const activeFieldSamples = currentTargetField ? (MOCK_SAMPLE_POINTS[currentTargetField.id] || []) : [];
  const activeFieldEvidence = currentTargetField ? (MOCK_EVIDENCE_PINS[currentTargetField.id] || []) : [];
  const activeFieldLedgers = currentTargetField ? (MOCK_CARBON_LEDGER_RECORDS[currentTargetField.id] || []) : [];
  const activeFieldAlerts = currentTargetField ? (MOCK_PARCEL_ALERTS[currentTargetField.id] || []) : [];
  const currentTimelineStep = MOCK_GIS_TIMELINE_STEPS[currentTimelineIndex] || MOCK_GIS_TIMELINE_STEPS[0];

  // Weather Telemetry Fetcher
  const refreshWeather = () => {
    if (!currentTargetField) return;
    setIsLoadingWeather(true);
    const [lat, lon] = currentTargetField.centroid || [42.06, -93.58];
    fetchFieldWeatherData(currentTargetField.id, currentTargetField.name, lat, lon)
      .then((report) => {
        setWeatherReport(report);
        setIsLoadingWeather(false);
      })
      .catch((err) => {
        console.warn('Weather fetch error:', err);
        setWeatherReport(generateMockFieldWeather(currentTargetField.id, currentTargetField.name, lat, lon));
        setIsLoadingWeather(false);
      });
  };

  useEffect(() => {
    refreshWeather();
  }, [currentTargetField?.id]);

  // Base map tile URLs
  const baseMapConfig: Record<GISBaseMapType, { name: string; url: string; attribution: string }> = {
    esri_satellite: {
      name: 'Sentinel-2 / Esri World Imagery (High-Res)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Sentinel-2 & USDA NAIP High-Res Imagery',
    },
    carto_dark: {
      name: 'Carto Dark Matter (High Contrast GIS)',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
    osm_standard: {
      name: 'OpenStreetMap Topo & Cadastral',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
    usgs_topo: {
      name: 'USGS National Map (Topographic Contours)',
      url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
      attribution: 'USGS National Map &mdash; Topographic Wetness',
    },
  };

  // Legend Tiers Definitions
  const socLegendTiers: LegendTier[] = [
    {
      id: 'soc-high',
      rangeLabel: '≥ 3.0%',
      color: '#059669',
      title: 'Prime Humic Reserve',
      agronomicDescription: 'Superior biological fertility, rapid water infiltration (>2.5 in/hr), and robust fungal glomalin.',
      actionableGuidance: 'Benchmark tier for maximum carbon credit issuance. Maintain with undisturbed perennial or no-till practices.',
      check: (f) => f.baselineSOCPct >= 3.0,
    },
    {
      id: 'soc-good',
      rangeLabel: '2.5% – 2.9%',
      color: '#10b981',
      title: 'Healthy Regenerative Baseline',
      agronomicDescription: 'Active microbial cycling and strong soil structural aggregation with minimal compaction.',
      actionableGuidance: 'Sustained by continuous multi-species cover crops and reduced synthetic nitrogen disturbance.',
      check: (f) => f.baselineSOCPct >= 2.5 && f.baselineSOCPct < 3.0,
    },
    {
      id: 'soc-mod',
      rangeLabel: '2.0% – 2.4%',
      color: '#34d399',
      title: 'Moderate Agricultural Stock',
      agronomicDescription: 'Standard regional topsoil baseline with significant accretion potential (+0.25% SOC / 5-yr).',
      actionableGuidance: 'Prime candidate for high-biomass rye/vetch intercropping and composted manure injection.',
      check: (f) => f.baselineSOCPct >= 2.0 && f.baselineSOCPct < 2.5,
    },
    {
      id: 'soc-low',
      rangeLabel: '< 2.0%',
      color: '#f59e0b',
      title: 'Carbon Deficit / Depleted',
      agronomicDescription: 'Elevated risk of crusting, reduced water infiltration, and summer midday thermal stress.',
      actionableGuidance: 'Prioritize immediate transition from conventional tillage to strip-till or continuous no-till.',
      check: (f) => f.baselineSOCPct < 2.0,
    },
  ];

  const moistureLegendTiers: LegendTier[] = [
    {
      id: 'moist-high',
      rangeLabel: '≥ 32% VWC',
      color: '#0284c7',
      title: 'Surplus / Near Field Capacity',
      agronomicDescription: 'Abundant root-zone water reserves. Stomata fully open with minimal crop transpiration deficit.',
      actionableGuidance: 'Optimal mass-flow nutrient absorption. Monitor low-lying sections for waterlogging aeration.',
      check: (f) => f.surfaceMoisturePct >= 32,
    },
    {
      id: 'moist-opt',
      rangeLabel: '26% – 31% VWC',
      color: '#38bdf8',
      title: 'Optimal Root Hydration',
      agronomicDescription: 'Peak physiological absorption window for pollination, silking, and pod-filling phases.',
      actionableGuidance: 'Ideal biological respiration conditions for mycorrhizal fungi and nitrogen-fixing bacteria.',
      check: (f) => f.surfaceMoisturePct >= 26 && f.surfaceMoisturePct < 32,
    },
    {
      id: 'moist-marg',
      rangeLabel: '20% – 25% VWC',
      color: '#93c5fd',
      title: 'Marginal Moisture Reserve',
      agronomicDescription: 'Early drydown zone. Increased reliance on subsoil capillary draw and topsoil organic matter.',
      actionableGuidance: 'Crop is drawing on soil organic matter buffers. Mulch residues reduce evaporative loss.',
      check: (f) => f.surfaceMoisturePct >= 20 && f.surfaceMoisturePct < 26,
    },
    {
      id: 'moist-low',
      rangeLabel: '< 20% VWC',
      color: '#f59e0b',
      title: 'Moisture Stress / Deficit',
      agronomicDescription: 'Elevated risk of stomatal closure, leaf curling, and reproductive yield penalties.',
      actionableGuidance: 'Critical drought threshold. Avoid chemical tillage; ensure organic groundcover shields topsoil.',
      check: (f) => f.surfaceMoisturePct < 20,
    },
  ];

  const ndviLegendTiers: LegendTier[] = [
    {
      id: 'ndvi-lush',
      rangeLabel: '≥ 0.78',
      color: '#10b981',
      title: 'Vigorous / Dense Canopy',
      agronomicDescription: 'Closed canopy, active photosynthetic carbon drawdown, >85% light interception.',
      actionableGuidance: 'Peak biomass synthesis. Cover crop groundcover verified for carbon registry protocols.',
      check: (f) => f.currentNDVI >= 0.78,
    },
    {
      id: 'ndvi-active',
      rangeLabel: '0.65 – 0.77',
      color: '#84cc16',
      title: 'Active Vegetative Growth',
      agronomicDescription: 'Normal canopy progression and steady nitrogen uptake across vegetative stages.',
      actionableGuidance: 'Healthy vegetative trajectory with minimal visible disease or weed pressure.',
      check: (f) => f.currentNDVI >= 0.65 && f.currentNDVI < 0.78,
    },
    {
      id: 'ndvi-mod',
      rangeLabel: '0.50 – 0.64',
      color: '#eab308',
      title: 'Moderate / Transitioning',
      agronomicDescription: 'Early crop emergence, maturing senescence, or sparse overwinter groundcover.',
      actionableGuidance: 'Expected during pre-harvest drydown or early post-planting establishment.',
      check: (f) => f.currentNDVI >= 0.50 && f.currentNDVI < 0.65,
    },
    {
      id: 'ndvi-low',
      rangeLabel: '< 0.50',
      color: '#f97316',
      title: 'Low Canopy / Fallow Mulch',
      agronomicDescription: 'Terminated cover crop mulch, bare topsoil, or post-harvest crop stover.',
      actionableGuidance: 'Verify surface residue retention (>60% cover) to satisfy continuous no-till standards.',
      check: (f) => f.currentNDVI < 0.50,
    },
  ];

  const weatherHeatmapLegendTiers: LegendTier[] = [
    {
      id: 'wx-excess',
      rangeLabel: '≥ 24mm / Heavy Rain',
      color: '#8b5cf6',
      title: 'Elevated Runoff Risk (>24mm)',
      agronomicDescription: 'Heavy 7-day cumulative precipitation exceeding surface absorption capacity.',
      actionableGuidance: 'Avoid heavy tractor traffic and synthetic fertilizer top-dressing. High runoff risk.',
      check: (f) => getFieldWeatherHeatmapData(f.id, f.name, f.centroid, f.baselineSOCPct).sevenDayPrecipMm >= 24,
    },
    {
      id: 'wx-opt',
      rangeLabel: '10 – 24mm / Balanced',
      color: '#10b981',
      title: 'Optimal Moisture & Workability',
      agronomicDescription: 'Steady rain maintains active microbial mineralization with zero waterlogging.',
      actionableGuidance: 'Favorable operational window for post-planting operations and scout inspections.',
      check: (f) => {
        const p = getFieldWeatherHeatmapData(f.id, f.name, f.centroid, f.baselineSOCPct).sevenDayPrecipMm;
        return p >= 10 && p < 24;
      },
    },
    {
      id: 'wx-light',
      rangeLabel: '4 – 9mm / Light Rain',
      color: '#06b6d4',
      title: 'Light Showers (4–9mm)',
      agronomicDescription: 'Light precipitation sustaining root-zone moisture with high field trafficability.',
      actionableGuidance: 'Safe for heavy machinery and field scouting operations.',
      check: (f) => {
        const p = getFieldWeatherHeatmapData(f.id, f.name, f.centroid, f.baselineSOCPct).sevenDayPrecipMm;
        return p >= 4 && p < 10;
      },
    },
    {
      id: 'wx-dry',
      rangeLabel: '< 4mm / Dry Window',
      color: '#f59e0b',
      title: 'Moisture Deficit Window (<4mm)',
      agronomicDescription: 'Minimal 7-day precipitation. Topsoil moisture depends on living cover crop sponge.',
      actionableGuidance: 'Protect surface residue to limit evaporation. Ideal dry window for weed cultivation.',
      check: (f) => getFieldWeatherHeatmapData(f.id, f.name, f.centroid, f.baselineSOCPct).sevenDayPrecipMm < 4,
    },
  ];

  const getCurrentTiers = (): LegendTier[] => {
    if (activeLayer === 'soc') return socLegendTiers;
    if (activeLayer === 'moisture') return moistureLegendTiers;
    if (activeLayer === 'ndvi') return ndviLegendTiers;
    if (activeLayer === 'weather_heatmap') return weatherHeatmapLegendTiers;
    return [];
  };

  // Timeline playback timer
  useEffect(() => {
    if (isTimelinePlaying) {
      timelineTimerRef.current = setInterval(() => {
        setCurrentTimelineIndex((prev) => {
          if (prev >= MOCK_GIS_TIMELINE_STEPS.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      }, 2400 / playbackSpeed);
    } else if (timelineTimerRef.current) {
      clearInterval(timelineTimerRef.current);
      timelineTimerRef.current = null;
    }
    return () => {
      if (timelineTimerRef.current) clearInterval(timelineTimerRef.current);
    };
  }, [isTimelinePlaying, playbackSpeed]);

  // ================= MAP INITIALIZATION =================
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const defaultCenter: [number, number] = fields.length > 0 ? fields[0].centroid : [42.06, -93.58];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: false,
    });

    const tileLayer = L.tileLayer(baseMapConfig[currentBaseMap].url, {
      maxZoom: 19,
      attribution: baseMapConfig[currentBaseMap].attribution,
    });
    tileLayer.addTo(map);
    baseTileLayerRef.current = tileLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    map.on('click', (e: L.LeafletMouseEvent) => {
      if ((window as any).__TERRASOIL_IS_DRAWING) {
        const pt: [number, number] = [e.latlng.lat, e.latlng.lng];
        drawPointsRef.current.push(pt);
        setDrawingPointsCount(drawPointsRef.current.length);

        if (drawLayerRef.current) {
          drawLayerRef.current.setLatLngs(drawPointsRef.current);
        } else {
          drawLayerRef.current = L.polygon(drawPointsRef.current, {
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.35,
            dashArray: '4, 4',
          }).addTo(map);
        }
      } else if ((window as any).__TERRASOIL_IS_ADDING_NOTE) {
        const coords: [number, number] = [
          Number(e.latlng.lat.toFixed(5)),
          Number(e.latlng.lng.toFixed(5)),
        ];
        if ((window as any).__TERRASOIL_ON_MAP_CLICK_NOTE) {
          (window as any).__TERRASOIL_ON_MAP_CLICK_NOTE(coords);
        }
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update base map layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (baseTileLayerRef.current) {
      baseTileLayerRef.current.remove();
    }
    const tileLayer = L.tileLayer(baseMapConfig[currentBaseMap].url, {
      maxZoom: 19,
      attribution: baseMapConfig[currentBaseMap].attribution,
    });
    tileLayer.addTo(map);
    baseTileLayerRef.current = tileLayer;
  }, [currentBaseMap]);

  useEffect(() => {
    (window as any).__TERRASOIL_IS_DRAWING = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    (window as any).__TERRASOIL_IS_ADDING_NOTE = isAddingNoteMode;
  }, [isAddingNoteMode]);

  useEffect(() => {
    (window as any).__TERRASOIL_ON_MAP_CLICK_NOTE = (
      coords: [number, number],
      fieldId?: string
    ) => {
      setNewNoteCoordinates(coords);
      if (fieldId) {
        setNewNoteFieldId(fieldId);
      } else if (selectedField) {
        setNewNoteFieldId(selectedField.id);
      } else if (fields.length > 0) {
        setNewNoteFieldId(fields[0].id);
      }
      setIsAddingNoteMode(false);
      setShowAddNoteModal(true);
    };
  }, [fields, selectedField]);

  // Determine polygon base color
  const getFieldColor = (field: Field) => {
    if (activeLayer === 'ndvi') {
      if (field.currentNDVI >= 0.78) return '#10b981';
      if (field.currentNDVI >= 0.65) return '#84cc16';
      if (field.currentNDVI >= 0.50) return '#eab308';
      return '#f97316';
    }
    if (activeLayer === 'soc') {
      if (field.baselineSOCPct >= 3.0) return '#059669';
      if (field.baselineSOCPct >= 2.5) return '#10b981';
      if (field.baselineSOCPct >= 2.0) return '#34d399';
      return '#f59e0b';
    }
    if (activeLayer === 'moisture') {
      if (field.surfaceMoisturePct >= 32) return '#0284c7';
      if (field.surfaceMoisturePct >= 26) return '#38bdf8';
      if (field.surfaceMoisturePct >= 20) return '#93c5fd';
      return '#f59e0b';
    }
    if (activeLayer === 'weather_heatmap') {
      const wx = getFieldWeatherHeatmapData(field.id, field.name, field.centroid, field.baselineSOCPct);
      return wx.heatmapColor;
    }
    if (activeLayer === 'ssurgo') {
      return '#8b5cf6'; // Purple soil taxonomy layer
    }
    if (activeLayer === 'elevation') {
      return '#06b6d4'; // Cyan topographic slope layer
    }
    if (activeLayer === 'practices') {
      return '#10b981'; // Green regenerative practice footprint
    }
    return selectedField?.id === field.id ? '#10b981' : '#f59e0b';
  };

  // ================= RENDER FIELD POLYGONS =================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(polygonLayersRef.current).forEach((layer) => layer.remove());
    polygonLayersRef.current = {};

    const bounds: L.LatLngBounds = L.latLngBounds([]);
    const currentTiers = getCurrentTiers();
    const effectiveTierFilter = activeTierId || hoveredTierId;
    const activeTierObj = currentTiers.find((t) => t.id === effectiveTierFilter);

    fields.forEach((field) => {
      const isSelected = selectedField?.id === field.id;
      const isHovered = hoveredFieldId === field.id;
      const isMatchingTier = activeTierObj ? activeTierObj.check(field) : true;
      const isDimmed = effectiveTierFilter ? !isMatchingTier : false;

      const baseColor = getFieldColor(field);
      const strokeColor = isSelected ? '#ffffff' : isHovered ? '#38bdf8' : isMatchingTier && effectiveTierFilter ? '#ffffff' : baseColor;

      const polygon = L.polygon(field.boundaryCoordinates, {
        color: strokeColor,
        weight: isSelected ? 4 : isHovered ? 4 : isMatchingTier && effectiveTierFilter ? 3.5 : 2,
        fillColor: baseColor,
        fillOpacity: isDimmed
          ? 0.12
          : isSelected
          ? layerOpacity
          : isHovered
          ? Math.min(layerOpacity + 0.15, 0.9)
          : isMatchingTier && effectiveTierFilter
          ? 0.7
          : layerOpacity * 0.7,
      });

      const wxInfo = getFieldWeatherHeatmapData(field.id, field.name, field.centroid, field.baselineSOCPct);
      const isWxHeatmap = activeLayer === 'weather_heatmap';

      polygon.bindTooltip(
        `<div class="p-1.5 font-sans">
          <p class="font-bold text-stone-100 text-xs flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" style="background-color: ${baseColor}"></span>
            ${field.name}
          </p>
          <div class="mt-1 text-[11px] text-stone-300 grid grid-cols-2 gap-x-2 gap-y-0.5">
            <span>Area: <b class="text-white">${field.acreage} ac</b></span>
            <span>SOC: <b class="text-emerald-400">${field.baselineSOCPct}%</b></span>
            <span>NDVI: <b class="text-emerald-400">${field.currentNDVI}</b></span>
            <span>Moist: <b class="text-cyan-400">${field.surfaceMoisturePct}%</b></span>
          </div>
          ${isWxHeatmap ? `
            <div class="mt-1.5 pt-1 border-t border-stone-800 text-[11px] text-sky-300">
              <p>7d Rain: <b class="text-white">${wxInfo.sevenDayPrecipMm}mm (${wxInfo.sevenDayPrecipInches}")</b></p>
              <p class="text-[10px] text-emerald-400 font-semibold">${wxInfo.trafficabilityRisk} &bull; ${wxInfo.heatmapLabel}</p>
            </div>
          ` : `
            <div class="mt-1 pt-1 border-t border-stone-800 text-[10px] text-stone-400">
              Click parcel to load GIS intelligence
            </div>
          `}
        </div>`,
        { sticky: true, className: 'leaflet-tooltip-dark' }
      );

      polygon.on('click', (e: L.LeafletMouseEvent) => {
        if ((window as any).__TERRASOIL_IS_ADDING_NOTE) {
          const coords: [number, number] = [
            Number(e.latlng.lat.toFixed(5)),
            Number(e.latlng.lng.toFixed(5)),
          ];
          if ((window as any).__TERRASOIL_ON_MAP_CLICK_NOTE) {
            (window as any).__TERRASOIL_ON_MAP_CLICK_NOTE(coords, field.id);
            return;
          }
        }
        onSelectField(field);
      });

      polygon.addTo(map);
      polygonLayersRef.current[field.id] = polygon;

      field.boundaryCoordinates.forEach(([lat, lng]) => {
        bounds.extend([lat, lng]);
      });
    });

    if (fields.length > 0 && bounds.isValid() && !isDrawing && !initialCenteredRef.current) {
      if (selectedField) {
        map.panTo(selectedField.centroid, { animate: true });
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
      initialCenteredRef.current = true;
    }
  }, [fields, selectedField, activeLayer, layerOpacity, hoveredFieldId, activeTierId, hoveredTierId]);

  // ================= RENDER SUB-FIELD MANAGEMENT ZONES =================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(zoneLayersRef.current).forEach((layer) => layer.remove());
    zoneLayersRef.current = {};

    if (!showZonesLayer || !selectedField) return;

    const zones = MOCK_MANAGEMENT_ZONES[selectedField.id] || [];
    zones.forEach((zone) => {
      const isZoneSelected = selectedZone?.id === zone.id;
      const zonePolygon = L.polygon(zone.boundaryCoordinates, {
        color: isZoneSelected ? '#fbbf24' : zone.color,
        weight: isZoneSelected ? 3.5 : 2,
        dashArray: '5, 5',
        fillColor: zone.color,
        fillOpacity: isZoneSelected ? 0.45 : 0.22,
      });

      zonePolygon.bindTooltip(
        `<div class="p-1 text-xs">
          <p class="font-bold text-amber-300">${zone.name}</p>
          <p class="text-stone-300 text-[11px]">${zone.acreage} ac &bull; SOC: ${zone.socPct}% &bull; NDVI: ${zone.ndvi}</p>
          <p class="text-emerald-400 text-[10px] font-mono mt-0.5">VRA N: ${zone.prescriptionRateN}</p>
        </div>`,
        { sticky: true, className: 'leaflet-tooltip-dark' }
      );

      zonePolygon.on('click', () => {
        setSelectedZone(zone);
        setActiveSidebarTab('intelligence');
      });

      zonePolygon.addTo(map);
      zoneLayersRef.current[zone.id] = zonePolygon;
    });
  }, [showZonesLayer, selectedField, selectedZone]);

  // ================= RENDER GEOTAGGED EVIDENCE PINS =================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(evidenceMarkersRef.current).forEach((m) => m.remove());
    evidenceMarkersRef.current = {};

    if (!showEvidencePins || !selectedField) return;

    const pins = MOCK_EVIDENCE_PINS[selectedField.id] || [];
    pins.forEach((pin) => {
      const getPinIconHtml = () => {
        let iconBg = 'bg-emerald-600';
        let badge = '📸';
        if (pin.category === 'soil_core') {
          iconBg = 'bg-amber-600';
          badge = '🔬';
        } else if (pin.category === 'machinery_telematics') {
          iconBg = 'bg-cyan-600';
          badge = '🚜';
        } else if (pin.category === 'drone_ortho') {
          iconBg = 'bg-purple-600';
          badge = '🛰️';
        }

        return `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-8 h-8 rounded-full ${iconBg} border-2 border-white shadow-xl flex items-center justify-center text-sm transform transition group-hover:scale-125">
              ${badge}
            </div>
            ${pin.verified ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border border-stone-900 rounded-full"></span>' : ''}
          </div>
        `;
      };

      const icon = L.divIcon({
        className: 'custom-gis-pin',
        html: getPinIconHtml(),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(pin.coordinates, { icon });
      marker.bindTooltip(
        `<div class="p-1">
          <p class="font-bold text-xs text-stone-100">${pin.title}</p>
          <p class="text-[10px] text-emerald-400 font-semibold">${pin.confidenceScorePct}% Confidence &bull; Verified</p>
        </div>`,
        { sticky: true, className: 'leaflet-tooltip-dark' }
      );

      marker.on('click', () => {
        setSelectedEvidencePin(pin);
      });

      marker.addTo(map);
      evidenceMarkersRef.current[pin.id] = marker;
    });
  }, [showEvidencePins, selectedField]);

  // ================= RENDER SOIL SAMPLING POINTS =================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(sampleMarkersRef.current).forEach((m) => m.remove());
    sampleMarkersRef.current = {};

    if (!showSoilSamplingLayer || !selectedField) return;

    const samples = MOCK_SAMPLE_POINTS[selectedField.id] || [];
    samples.forEach((sample) => {
      const isAssayed = sample.status === 'assayed';
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-7 h-7 rounded-lg ${isAssayed ? 'bg-emerald-600' : 'bg-amber-600'} border-2 border-stone-900 shadow-lg flex items-center justify-center text-white text-[11px] font-bold font-mono">
            ${isAssayed ? 'C' : 'P'}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-sample-pin',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(sample.coordinates, { icon });
      marker.bindTooltip(
        `<div class="p-1">
          <p class="font-bold text-xs text-stone-100">${sample.sampleCode}</p>
          <p class="text-[10px] text-stone-300">Lab SOC: <b class="text-emerald-400">${sample.socPct}%</b> &bull; pH: ${sample.ph}</p>
          <p class="text-[9px] text-stone-400">${sample.depthCm}</p>
        </div>`,
        { sticky: true, className: 'leaflet-tooltip-dark' }
      );

      marker.on('click', () => {
        setSelectedSamplePoint(sample);
      });

      marker.addTo(map);
      sampleMarkersRef.current[sample.id] = marker;
    });
  }, [showSoilSamplingLayer, selectedField]);

  // ================= RENDER PARCEL ALERTS =================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(alertMarkersRef.current).forEach((m) => m.remove());
    alertMarkersRef.current = {};

    if (!showAlertPins || !selectedField) return;

    const alerts = MOCK_PARCEL_ALERTS[selectedField.id] || [];
    alerts.forEach((alert) => {
      const alertHtml = `
        <div class="animate-pulse cursor-pointer">
          <div class="px-2 py-1 rounded-full ${alert.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-500'} text-white text-[10px] font-black tracking-wider flex items-center gap-1 shadow-2xl border border-white">
            <span>⚠️</span>
            <span>ALERT</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-alert-pin',
        html: alertHtml,
        iconSize: [70, 24],
        iconAnchor: [35, 12],
      });

      const marker = L.marker(selectedField.centroid, { icon });
      marker.on('click', () => {
        setSelectedAlert(alert);
      });

      marker.addTo(map);
      alertMarkersRef.current[alert.id] = marker;
    });
  }, [showAlertPins, selectedField]);

  // ================= RENDER WEATHER TELEMETRY MAP PIN =================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (weatherMarkerRef.current) {
      weatherMarkerRef.current.remove();
      weatherMarkerRef.current = null;
    }

    if (!showWeatherOverlay || !currentTargetField || !weatherReport) return;

    const tempDisplay = weatherTempUnit === 'F' 
      ? `${weatherReport.current.temperatureF}°F` 
      : `${weatherReport.current.temperatureC}°C`;

    const precip7d = weatherReport.sevenDayTotalPrecipMm;
    const precipIn = weatherReport.sevenDayTotalPrecipInches;

    const weatherBadgeHtml = `
      <div class="cursor-pointer group flex flex-col items-center">
        <div class="bg-stone-900/95 hover:bg-stone-900 text-stone-100 px-3 py-1.5 rounded-2xl border border-sky-500/70 shadow-2xl flex items-center gap-2 backdrop-blur-md transition transform group-hover:scale-110">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span class="font-bold text-xs font-mono text-cyan-300">${tempDisplay}</span>
          <span class="text-stone-600">|</span>
          <span class="text-[11px] font-semibold text-sky-400 flex items-center gap-1">
            🌧️ ${precip7d}mm (7d)
          </span>
        </div>
        <div class="w-2.5 h-2.5 bg-sky-500 transform rotate-45 -mt-1 shadow-sm"></div>
      </div>
    `;

    const weatherIcon = L.divIcon({
      className: 'custom-weather-badge',
      html: weatherBadgeHtml,
      iconSize: [140, 36],
      iconAnchor: [70, 40],
    });

    const marker = L.marker(currentTargetField.centroid, { icon: weatherIcon, zIndexOffset: 950 });
    marker.bindTooltip(
      `<div class="p-2 font-sans text-xs">
        <p class="font-bold text-sky-300">${weatherReport.fieldName} Weather &amp; Moisture</p>
        <p class="text-stone-200">${weatherReport.current.conditionLabel} &bull; ${tempDisplay}</p>
        <p class="text-[11px] text-stone-400 mt-1">7-Day Rain: <b class="text-sky-300">${precip7d}mm (${precipIn}")</b></p>
        <p class="text-[10px] text-emerald-400 font-semibold mt-0.5">${weatherReport.moistureDecisionAdvisory.soilTrafficability}</p>
        <p class="text-[9px] text-stone-500 mt-1">Click to view 7-day moisture advisory</p>
      </div>`,
      { sticky: true, className: 'leaflet-tooltip-dark' }
    );

    marker.on('click', () => {
      setShowWeatherDecisionModal(true);
    });

    marker.addTo(map);
    weatherMarkerRef.current = marker;

    return () => {
      if (weatherMarkerRef.current) {
        weatherMarkerRef.current.remove();
        weatherMarkerRef.current = null;
      }
    };
  }, [showWeatherOverlay, currentTargetField, weatherReport, weatherTempUnit]);

  // ================= RENDER SCOUTING NOTES =================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(noteMarkersRef.current).forEach((m) => m.remove());
    noteMarkersRef.current = {};

    if (!showNotesLayer) return;

    const filtered = notes.filter((n) => {
      if (selectedField && n.fieldId && n.fieldId !== selectedField.id) return false;
      if (noteCategoryFilter !== 'ALL' && n.category !== noteCategoryFilter) return false;
      if (noteSeverityFilter !== 'ALL' && n.severity !== noteSeverityFilter) return false;
      if (noteSearchQuery.trim()) {
        const q = noteSearchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      }
      return true;
    });

    filtered.forEach((note) => {
      const color = note.severity === 'critical' ? '#ef4444' : note.severity === 'attention' ? '#f59e0b' : '#10b981';
      const iconHtml = `
        <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-bold" style="background-color: ${color}">
          📝
        </div>
      `;
      const icon = L.divIcon({
        className: 'custom-note-pin',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(note.coordinates, { icon });
      marker.bindTooltip(`<b>${note.title}</b><br><span class="text-[10px]">${note.content.slice(0, 60)}...</span>`, {
        className: 'leaflet-tooltip-dark',
      });
      marker.on('click', () => {
        setSelectedNoteId(note.id);
        setActiveSidebarTab('notes');
      });

      marker.addTo(map);
      noteMarkersRef.current[note.id] = marker;
    });
  }, [notes, showNotesLayer, selectedField, noteCategoryFilter, noteSeverityFilter, noteSearchQuery]);

  // ================= RENDER GEOLOCATED SOIL HEALTH PHOTO MARKERS =================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(photoMarkersRef.current).forEach((m) => m.remove());
    photoMarkersRef.current = {};

    if (!showPhotosLayer) return;

    const filteredPhotos = soilPhotos.filter((p) => {
      if (selectedField && p.fieldId && p.fieldId !== selectedField.id) return false;
      if (photoMarkerFilter !== 'ALL' && p.markerType !== photoMarkerFilter) return false;
      if (photoSearchQuery.trim()) {
        const q = photoSearchQuery.toLowerCase();
        return (
          p.markerLabel.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q) ||
          p.fieldName.toLowerCase().includes(q)
        );
      }
      return true;
    });

    filteredPhotos.forEach((photo) => {
      const category = SOIL_MARKER_CATEGORIES.find((c) => c.type === photo.markerType);
      const photoHtml = `
        <div class="cursor-pointer group flex flex-col items-center">
          <div class="w-8 h-8 rounded-2xl bg-stone-900 border-2 border-emerald-400 shadow-2xl flex items-center justify-center text-emerald-300 hover:scale-125 transition-transform overflow-hidden">
            <span class="text-sm">📸</span>
          </div>
          <div class="bg-stone-950/90 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border border-emerald-500/50 text-emerald-300 mt-0.5 whitespace-nowrap shadow">
            ★${photo.soilQualityRating}.0
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-photo-pin',
        html: photoHtml,
        iconSize: [36, 44],
        iconAnchor: [18, 22],
      });

      const marker = L.marker(photo.coordinates, { icon, zIndexOffset: 850 });
      marker.bindTooltip(
        `<div class="p-2 font-sans text-xs">
          <p class="font-bold text-emerald-400 flex items-center gap-1">
            <span>📸</span> <span>${photo.markerLabel}</span>
          </p>
          <p class="text-[11px] text-stone-200 mt-0.5">${photo.fieldName} &bull; ${photo.sampleDepthCm}</p>
          <p class="text-[10px] text-stone-400 mt-1 line-clamp-2">${photo.notes}</p>
          <p class="text-[9px] text-amber-400 font-bold mt-1">Score: ${photo.soilQualityRating}.0 / 5.0 ★ &bull; Click to inspect full photo</p>
        </div>`,
        { sticky: true, className: 'leaflet-tooltip-dark' }
      );

      marker.on('click', () => {
        setSelectedPhotoForInspection(photo);
        setShowPhotoInspectionModal(true);
      });

      marker.addTo(map);
      photoMarkersRef.current[photo.id] = marker;
    });
  }, [soilPhotos, showPhotosLayer, selectedField, photoMarkerFilter, photoSearchQuery]);

  // Zoom preset helper
  const handleApplyZoomPreset = (preset: 'fit' | 'close' | 'context') => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setActiveZoomPreset(preset);

    if (preset === 'fit') {
      const bounds = L.latLngBounds([]);
      fields.forEach((f) => f.boundaryCoordinates.forEach((c) => bounds.extend(c)));
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (preset === 'close' && selectedField) {
      map.setView(selectedField.centroid, 16, { animate: true });
    } else if (preset === 'context') {
      const center = selectedField ? selectedField.centroid : fields[0]?.centroid || [42.06, -93.58];
      map.setView(center, 12, { animate: true });
    }
  };

  // Finish polygon drawing
  const handleFinishDrawing = () => {
    if (drawPointsRef.current.length < 3) {
      alert('Please click at least 3 points on the map to form a field boundary polygon.');
      return;
    }
    const pts = [...drawPointsRef.current];
    pts.push(pts[0]); // close polygon

    // Calculate approximate acreage
    let area = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      area += pts[i][1] * pts[i + 1][0] - pts[i + 1][1] * pts[i][0];
    }
    area = Math.abs(area) / 2;
    const estAcres = Math.max(25, Math.round(area * 1000000 * 2.47105 * 0.001));
    setCalculatedDrawnAcres(estAcres);

    setIsDrawing(false);
    setShowAddModal(true);
  };

  const handleSaveNewField = () => {
    if (!newFieldName.trim()) return;
    const pts = [...drawPointsRef.current];
    if (pts.length >= 3) {
      pts.push(pts[0]);
    }

    const latSum = pts.reduce((acc, p) => acc + p[0], 0);
    const lngSum = pts.reduce((acc, p) => acc + p[1], 0);
    const centroid: [number, number] = [latSum / pts.length, lngSum / pts.length];

    const newFieldObj: Partial<Field> = {
      name: newFieldName,
      cropType: newCropType,
      acreage: calculatedDrawnAcres || 120,
      soilClassification: 'Mollisol (Typic Hapludolls) - Silty Clay Loam',
      baselineSOCPct: 2.40,
      baselineSOCStockTonsPerHa: 52.0,
      currentNDVI: 0.65,
      ndviTrend: 'improving',
      surfaceMoisturePct: 28,
      rootZoneMoisturePct: 34,
      centroid,
      boundaryCoordinates: pts,
      ndviHistory: [{ date: '2026-05-01', ndvi: 0.55 }, { date: '2026-09-01', ndvi: 0.65 }],
      soilMoistureHistory: [{ month: 'May', surfaceMoisture: 30, rootZoneMoisture: 35, precipitationMm: 60 }],
      practices: [],
      carbonBreakdown: {
        coverCropMT: 0,
        noTillMT: 0,
        fertilizerReductionMT: 0,
        grazingRotationMT: 0,
        compostBiocharMT: 0,
        totalGrossMT: 0,
        totalNetPerAcre: 0,
        potentialRevenueUSD: 0,
        somAccretion5YrPct: 0.15,
        waterCapacityGainGallons: 12000,
      },
    };

    onAddNewField(newFieldObj);

    if (drawLayerRef.current && mapInstanceRef.current) {
      drawLayerRef.current.remove();
      drawLayerRef.current = null;
    }
    drawPointsRef.current = [];
    setDrawingPointsCount(0);
    setShowAddModal(false);
    setNewFieldName('');
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    if (drawLayerRef.current && mapInstanceRef.current) {
      drawLayerRef.current.remove();
      drawLayerRef.current = null;
    }
    drawPointsRef.current = [];
    setDrawingPointsCount(0);
  };

  const handleImportGeoJSON = (importedFields: Partial<Field>[], mode: 'append' | 'replace') => {
    if (onImportGeoJSONFields) {
      onImportGeoJSONFields(importedFields, mode);
    } else {
      importedFields.forEach((f) => onAddNewField(f));
    }

    // Auto-fit map to newly imported boundary coordinates
    const allCoords: [number, number][] = [];
    importedFields.forEach((f) => {
      if (f.boundaryCoordinates) {
        allCoords.push(...f.boundaryCoordinates);
      }
    });

    if (allCoords.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(allCoords.map(([lat, lng]) => [lat, lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  };

  const handleExportGeoJSON = () => {
    const geojsonStr = exportFieldsToGeoJSON(fields, currentFarm?.name || 'TerraSoil Farm');
    downloadGeoJSONFile(
      geojsonStr,
      `${(currentFarm?.name || 'TerraSoil_Farm').replace(/\s+/g, '_')}_Field_Boundaries.geojson`
    );
  };

  const handleSaveNote = () => {
    if (!newNoteTitle.trim()) return;
    const newNote: FieldNote = {
      id: `note-${Date.now()}`,
      fieldId: newNoteFieldId || (selectedField ? selectedField.id : ''),
      fieldName: fields.find((f) => f.id === newNoteFieldId)?.name || selectedField?.name || 'General Field',
      coordinates: newNoteCoordinates,
      title: newNoteTitle,
      content: newNoteContent,
      category: newNoteCategory,
      severity: newNoteSeverity,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      authorName: newNoteAuthor || 'Field Specialist',
      tags: newNoteTags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    setNotes((prev) => [newNote, ...prev]);
    setShowAddNoteModal(false);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl flex flex-col min-h-[840px] text-stone-100">
      {/* ========================================================================= */}
      {/* TOP GIS COMMAND BAR */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 bg-stone-900/95 border-b border-stone-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Left: Branding & Role Context */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-100 tracking-tight flex items-center gap-1.5">
                Local Field Parcel GIS
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300">
                  Sentinel-2 MRV
                </span>
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 capitalize font-medium">
                Mode: {activePersona}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              High-resolution field parcel telemetry, sub-field zones, evidence pins, and audit ledger
            </p>
          </div>
        </div>

        {/* Center: Layer Library & Overlays Quick Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Layer Selector */}
          <div className="bg-stone-950 border border-stone-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => onChangeLayer('satellite')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                activeLayer === 'satellite' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Satellite Base
            </button>
            <button
              onClick={() => onChangeLayer('ndvi')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                activeLayer === 'ndvi' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-300" />
              NDVI Canopy
            </button>
            <button
              onClick={() => onChangeLayer('soc')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                activeLayer === 'soc' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              SOC % Carbon
            </button>
            <button
              onClick={() => onChangeLayer('moisture')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                activeLayer === 'moisture' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-300" />
              Soil Moisture
            </button>
            <button
              onClick={() => onChangeLayer('weather_heatmap')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                activeLayer === 'weather_heatmap' ? 'bg-sky-600 text-white shadow-md' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5 text-sky-300" />
              7d Weather Heatmap
            </button>
          </div>

          {/* Layer Library Modal Trigger */}
          <button
            onClick={() => setShowLayerLibraryModal(true)}
            className="px-3 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Layers2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Layer Library</span>
          </button>

          {/* Cross-Map Navigation: Compare with Regional Benchmark (PRD-09 §3) */}
          {onOpenGlobalExplorer && (
            <button
              onClick={onOpenGlobalExplorer}
              className="px-3 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-cyan-900/60 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Compare this farm's telemetry with regional and global benchmarks"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Regional Benchmark →</span>
            </button>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Import GeoJSON Button */}
          <button
            onClick={() => setShowGeoJsonModal(true)}
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            title="Import field boundaries and acreage from GeoJSON file or standard GIS export"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Import</span> GeoJSON
          </button>

          {/* Export GeoJSON Button */}
          <button
            onClick={handleExportGeoJSON}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Export all current field boundaries as RFC 7946 GeoJSON FeatureCollection"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Export</span>
          </button>

          {/* Geotagged Scouting Pin Button */}
          <button
            onClick={() => {
              if (isAddingNoteMode) {
                setIsAddingNoteMode(false);
              } else {
                setIsAddingNoteMode(true);
                setIsDrawing(false);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              isAddingNoteMode
                ? 'bg-amber-500 text-stone-950 font-bold animate-pulse'
                : 'bg-stone-950 hover:bg-stone-800 text-stone-200 border border-stone-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAddingNoteMode ? 'Click Map to Drop Pin' : 'Drop Scout Pin'}</span>
          </button>

          {/* Soil Camera Photo Capture Button */}
          <button
            onClick={() => setShowCameraCaptureModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-950"
            title="Open browser camera to capture geolocated physical soil health marker photo"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Capture Soil Photo</span>
          </button>

          {/* Draw Field Boundary Button */}
          {!isDrawing ? (
            <button
              onClick={() => {
                setIsDrawing(true);
                setIsAddingNoteMode(false);
                drawPointsRef.current = [];
                setDrawingPointsCount(0);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Digitize Parcel</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-amber-300 font-mono bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800">
                Points: {drawingPointsCount}
              </span>
              <button
                onClick={handleFinishDrawing}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                Finish
              </button>
              <button
                onClick={handleCancelDrawing}
                className="px-2 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Toggle Sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 transition"
            title={isSidebarOpen ? 'Collapse GIS Deck' : 'Expand GIS Deck'}
          >
            {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE: LEAFLET MAP + COLLAPSIBLE GIS DECK */}
      {/* ========================================================================= */}
      <div className="relative flex-1 flex overflow-hidden min-h-[600px]">
        {/* LEAFLET MAP CONTAINER */}
        <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[600px] z-10" />

        {/* FLOATING TOP-LEFT MAP TOOLS */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
          {/* Quick Base Switcher Pill */}
          <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 p-1.5 rounded-2xl shadow-xl flex items-center gap-1 text-xs">
            <span className="text-[10px] text-stone-400 font-bold uppercase px-1.5">Base:</span>
            <button
              onClick={() => setCurrentBaseMap('esri_satellite')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                currentBaseMap === 'esri_satellite' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setCurrentBaseMap('carto_dark')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                currentBaseMap === 'carto_dark' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              Dark GIS
            </button>
            <button
              onClick={() => setCurrentBaseMap('usgs_topo')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                currentBaseMap === 'usgs_topo' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              USGS Topo
            </button>
          </div>

          {/* Quick Overlay Toggles Pill */}
          <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 p-2 rounded-2xl shadow-xl flex items-center flex-wrap gap-2 text-xs text-stone-300">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showZonesLayer}
                onChange={(e) => setShowZonesLayer(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Zones ({activeFieldZones.length})</span>
            </label>
            <span className="text-stone-700">|</span>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showEvidencePins}
                onChange={(e) => setShowEvidencePins(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Evidence ({activeFieldEvidence.length})</span>
            </label>
            <span className="text-stone-700">|</span>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showSoilSamplingLayer}
                onChange={(e) => setShowSoilSamplingLayer(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Cores ({activeFieldSamples.length})</span>
            </label>
            <span className="text-stone-700">|</span>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white text-emerald-400">
              <input
                type="checkbox"
                checked={showPhotosLayer}
                onChange={(e) => setShowPhotosLayer(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0"
              />
              <span>📸 Soil Photos ({soilPhotos.length})</span>
            </label>
            <span className="text-stone-700">|</span>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white text-cyan-300">
              <input
                type="checkbox"
                checked={showWeatherOverlay}
                onChange={(e) => setShowWeatherOverlay(e.target.checked)}
                className="rounded text-cyan-500 focus:ring-0"
              />
              <span>🌤️ Weather ({weatherReport ? `${weatherTempUnit === 'F' ? weatherReport.current.temperatureF : weatherReport.current.temperatureC}°${weatherTempUnit}` : 'Live'})</span>
            </label>
          </div>
        </div>

        {/* FLOATING WEATHER & 7-DAY PRECIPITATION OVERLAY (Bottom-Left over map) */}
        {showWeatherOverlay && weatherReport && (
          <div className="absolute bottom-4 left-4 z-20 pointer-events-auto max-w-md w-[calc(100%-2rem)] sm:w-auto">
            <div className="bg-stone-950/90 backdrop-blur-xl border border-sky-500/40 rounded-3xl p-4 shadow-2xl space-y-3">
              {/* Header: Live Temp, Condition, Unit Toggle, Collapse */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-sky-950 border border-sky-800 text-sky-300">
                    <CloudRain className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-stone-100 text-base font-mono">
                        {weatherTempUnit === 'F' ? `${weatherReport.current.temperatureF}°F` : `${weatherReport.current.temperatureC}°C`}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-300 font-semibold">
                        {weatherReport.current.conditionLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{weatherReport.fieldName}</span>
                      <span className="text-stone-600">&bull;</span>
                      <span>{weatherReport.isLiveApiData ? 'Live Open-Meteo' : 'Microclimate Sync'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Temp Unit Switcher */}
                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-0.5 flex text-[10px]">
                    <button
                      type="button"
                      onClick={() => setWeatherTempUnit('F')}
                      className={`px-1.5 py-0.5 rounded-lg font-bold transition ${
                        weatherTempUnit === 'F' ? 'bg-sky-600 text-white' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      °F
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeatherTempUnit('C')}
                      className={`px-1.5 py-0.5 rounded-lg font-bold transition ${
                        weatherTempUnit === 'C' ? 'bg-sky-600 text-white' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      °C
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <button
                    type="button"
                    onClick={refreshWeather}
                    disabled={isLoadingWeather}
                    className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-sky-300 border border-stone-800 transition"
                    title="Refresh live weather telemetry"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin text-sky-400' : ''}`} />
                  </button>

                  {/* Minimize / Expand Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsWeatherOverlayMinimized(!isWeatherOverlayMinimized)}
                    className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition"
                  >
                    {isWeatherOverlayMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Body */}
              {!isWeatherOverlayMinimized && (
                <>
                  {/* 7-Day Precipitation Bar Histogram */}
                  <div className="space-y-1.5 pt-1 border-t border-stone-800/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-300 font-semibold flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        7-Day Precipitation Forecast:
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {weatherReport.sevenDayTotalPrecipMm} mm ({weatherReport.sevenDayTotalPrecipInches}")
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 pt-1">
                      {weatherReport.dailyForecast.map((day, idx) => {
                        const maxBarPrecip = Math.max(15, ...weatherReport.dailyForecast.map((d) => d.precipitationMm));
                        const heightPct = Math.min(100, Math.max(12, (day.precipitationMm / maxBarPrecip) * 100));
                        const isRainy = day.precipitationMm > 0;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedForecastDay(day);
                              setShowWeatherDecisionModal(true);
                            }}
                            className="flex flex-col items-center bg-stone-900/80 hover:bg-stone-800 p-1.5 rounded-xl border border-stone-800 hover:border-sky-500/60 cursor-pointer transition group"
                            title={`${day.dayName} (${day.date}): ${day.precipitationMm}mm rain, ${weatherTempUnit === 'F' ? `${day.tempMaxF}°F` : `${day.tempMaxC}°C`}. Click for moisture advisory.`}
                          >
                            <span className="text-[9px] font-bold text-stone-400 group-hover:text-stone-200">
                              {day.dayName}
                            </span>
                            
                            {/* Bar Track */}
                            <div className="w-full h-10 bg-stone-950 rounded-md flex flex-col justify-end p-0.5 my-1 overflow-hidden">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-sm transition-all ${
                                  day.precipitationMm >= 15
                                    ? 'bg-rose-500'
                                    : day.precipitationMm >= 4
                                    ? 'bg-amber-400'
                                    : isRainy
                                    ? 'bg-cyan-400'
                                    : 'bg-stone-700/40'
                                }`}
                              />
                            </div>

                            <span className="text-[9px] font-mono font-bold text-cyan-300">
                              {day.precipitationMm > 0 ? `${day.precipitationMm}m` : '0'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Moisture Decision & Trafficability Bar */}
                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0 bg-cyan-400"></span>
                      <span className="text-[11px] text-stone-300 font-medium truncate">
                        Trafficability: <b className="text-emerald-400">{weatherReport.moistureDecisionAdvisory.soilTrafficability}</b>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowWeatherDecisionModal(true)}
                      className="px-2.5 py-1 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-700 text-[10px] font-bold shrink-0 transition"
                    >
                      Moisture Advisory →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* FLOATING ZOOM PRESETS & RE-CENTER (Top Right over map) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 p-1.5 rounded-2xl shadow-xl text-xs">
          <button
            onClick={() => handleApplyZoomPreset('fit')}
            className={`px-2.5 py-1 rounded-xl transition ${
              activeZoomPreset === 'fit' ? 'bg-stone-800 text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Fit all farm parcels in view"
          >
            Fit Farm
          </button>
          <button
            onClick={() => handleApplyZoomPreset('close')}
            className={`px-2.5 py-1 rounded-xl transition ${
              activeZoomPreset === 'close' ? 'bg-stone-800 text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Zoom into selected parcel"
          >
            Parcel Zoom
          </button>
          <button
            onClick={() => handleApplyZoomPreset('context')}
            className={`px-2.5 py-1 rounded-xl transition ${
              activeZoomPreset === 'context' ? 'bg-stone-800 text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Regional watershed context"
          >
            Regional
          </button>
        </div>

        {/* ========================================================================= */}
        {/* COLLAPSIBLE SIDEBAR: GIS DECK & SUB-VIEWS */}
        {/* ========================================================================= */}
        {isSidebarOpen && (
          <div className="w-full sm:w-[440px] bg-stone-900/95 border-l border-stone-800/90 backdrop-blur-xl z-20 flex flex-col overflow-hidden shadow-2xl transition-all">
            {/* Sidebar Tab Navigation */}
            <div className="p-2.5 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveSidebarTab('fields')}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 whitespace-nowrap transition ${
                  activeSidebarTab === 'fields'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Parcels ({fields.length})</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('intelligence')}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 whitespace-nowrap transition ${
                  activeSidebarTab === 'intelligence'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-amber-300" />
                <span>Intelligence</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('sampling')}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 whitespace-nowrap transition ${
                  activeSidebarTab === 'sampling'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-cyan-300" />
                <span>Cores</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('verification')}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 whitespace-nowrap transition ${
                  activeSidebarTab === 'verification'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verify</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('ledger')}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 whitespace-nowrap transition ${
                  activeSidebarTab === 'ledger'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ledger</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('notes')}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 whitespace-nowrap transition ${
                  activeSidebarTab === 'notes'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                <span>Scout</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('photos')}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 whitespace-nowrap transition ${
                  activeSidebarTab === 'photos'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Photos ({soilPhotos.length})</span>
              </button>
            </div>

            {/* Sidebar Content Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ========================================================================= */}
              {/* TAB 1: PARCELS LIST */}
              {/* ========================================================================= */}
              {activeSidebarTab === 'fields' && (
                <div className="space-y-3">
                  {/* Search and Crop Filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search field parcel by name..."
                        value={fieldSearchQuery}
                        onChange={(e) => setFieldSearchQuery(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Field Cards */}
                  <div className="space-y-2">
                    {fields
                      .filter((f) => f.name.toLowerCase().includes(fieldSearchQuery.toLowerCase()))
                      .map((field) => {
                        const isSelected = selectedField?.id === field.id;
                        return (
                          <div
                            key={field.id}
                            onClick={() => {
                              onSelectField(field);
                              if (mapInstanceRef.current) {
                                mapInstanceRef.current.panTo(field.centroid, { animate: true });
                              }
                            }}
                            onMouseEnter={() => setHoveredFieldId(field.id)}
                            onMouseLeave={() => setHoveredFieldId(null)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-stone-950 border-emerald-500 shadow-lg ring-1 ring-emerald-500/30'
                                : 'bg-stone-950/60 border-stone-800 hover:bg-stone-950 hover:border-stone-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                                <h4 className="text-xs font-bold text-stone-100">{field.name}</h4>
                              </div>
                              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                                {field.acreage} Acres
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-400 mt-1">{field.cropType}</p>

                            <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-stone-800/80">
                              <div className="bg-stone-900/90 p-1.5 rounded-lg text-center">
                                <span className="text-[9px] text-stone-500 block uppercase">NDVI</span>
                                <span className="text-xs font-bold text-emerald-400">{field.currentNDVI}</span>
                              </div>
                              <div className="bg-stone-900/90 p-1.5 rounded-lg text-center">
                                <span className="text-[9px] text-stone-500 block uppercase">SOC %</span>
                                <span className="text-xs font-bold text-emerald-400">{field.baselineSOCPct}%</span>
                              </div>
                              <div className="bg-stone-900/90 p-1.5 rounded-lg text-center">
                                <span className="text-[9px] text-stone-500 block uppercase">Moisture</span>
                                <span className="text-xs font-bold text-cyan-400">{field.surfaceMoisturePct}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: FIELD INTELLIGENCE DECK */}
              {/* ========================================================================= */}
              {activeSidebarTab === 'intelligence' && currentTargetField && (
                <div className="space-y-4">
                  {/* Selected Field Header Card */}
                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                          Active Parcel Inspector
                        </span>
                        <h4 className="text-sm font-bold text-white">{currentTargetField.name}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-xs font-bold">
                        {currentTargetField.acreage} ac
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">{currentTargetField.soilClassification}</p>
                  </div>

                  {/* Sub-tabs in Intelligence Deck */}
                  <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setIntelligenceCardTab('vitality')}
                      className={`flex-1 py-1 rounded-lg font-semibold transition ${
                        intelligenceCardTab === 'vitality' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Vitality
                    </button>
                    <button
                      onClick={() => setIntelligenceCardTab('carbon')}
                      className={`flex-1 py-1 rounded-lg font-semibold transition ${
                        intelligenceCardTab === 'carbon' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Carbon Stock
                    </button>
                    <button
                      onClick={() => setIntelligenceCardTab('ssurgo')}
                      className={`flex-1 py-1 rounded-lg font-semibold transition ${
                        intelligenceCardTab === 'ssurgo' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      SSURGO
                    </button>
                    <button
                      onClick={() => setIntelligenceCardTab('microclimate')}
                      className={`flex-1 py-1 rounded-lg font-semibold transition ${
                        intelligenceCardTab === 'microclimate' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Telemetry
                    </button>
                  </div>

                  {/* Tab 2.1: Vitality */}
                  {intelligenceCardTab === 'vitality' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                          <span className="text-[10px] text-stone-400 block font-medium">Canopy NDVI</span>
                          <span className="text-lg font-bold text-emerald-400">{currentTargetField.currentNDVI}</span>
                          <span className="text-[10px] text-emerald-500 block mt-0.5">Peak Vegetative Vigor</span>
                        </div>
                        <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                          <span className="text-[10px] text-stone-400 block font-medium">Estimated Biomass</span>
                          <span className="text-lg font-bold text-amber-300">3.4 t/ac</span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">Dry Residue Cover</span>
                        </div>
                        <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                          <span className="text-[10px] text-stone-400 block font-medium">Water Infiltration</span>
                          <span className="text-lg font-bold text-cyan-400">2.4 in/hr</span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">+45% vs Conventional</span>
                        </div>
                        <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                          <span className="text-[10px] text-stone-400 block font-medium">Soil Temperature</span>
                          <span className="text-lg font-bold text-stone-200">62.4 °F</span>
                          <span className="text-[10px] text-emerald-400 block mt-0.5">Optimal Biological Respiration</span>
                        </div>
                      </div>

                      {/* Management Zones for this Field */}
                      {activeFieldZones.length > 0 && (
                        <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-amber-400" />
                              Sub-Field Management Zones ({activeFieldZones.length})
                            </h5>
                          </div>
                          <div className="space-y-2">
                            {activeFieldZones.map((z) => (
                              <div
                                key={z.id}
                                onClick={() => setSelectedZone(z)}
                                className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500 cursor-pointer transition"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-stone-200">{z.name}</span>
                                  <span className="text-amber-300 font-mono font-semibold">{z.acreage} ac</span>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-1">{z.recommendations}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2.2: Carbon Stock */}
                  {intelligenceCardTab === 'carbon' && (
                    <div className="space-y-3">
                      <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-400">Total Topsoil Carbon Stock (0-30cm)</span>
                          <span className="text-emerald-400 font-mono font-bold text-sm">
                            {currentTargetField.baselineSOCStockTonsPerHa} tC/ha
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-400">Annual Net Sequestration</span>
                          <span className="text-emerald-400 font-mono font-bold text-sm">
                            +{currentTargetField.carbonBreakdown.totalGrossMT} MT CO₂e/yr
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone-400">Permanence Buffer Deduction (15%)</span>
                          <span className="text-amber-400 font-mono font-bold text-sm">
                            -{(currentTargetField.carbonBreakdown.totalGrossMT * 0.15).toFixed(1)} MT CO₂e
                          </span>
                        </div>
                        <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-200">5-Year SOM Accretion Potential</span>
                          <span className="text-emerald-300 font-mono font-bold text-sm">
                            +{currentTargetField.carbonBreakdown.somAccretion5YrPct}% SOM
                          </span>
                        </div>
                      </div>

                      {onOpenLineageModal && (
                        <button
                          onClick={() => onOpenLineageModal(currentTargetField)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Audit Carbon Calculation Lineage</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Tab 2.3: SSURGO Diagnostics */}
                  {intelligenceCardTab === 'ssurgo' && (
                    <div className="space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-stone-400">Soil Taxonomy Unit:</span>
                        <span className="font-bold text-stone-200 text-right">Clarion-Nicollet-Webster Loam</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-stone-400">Hydrologic Soil Group:</span>
                        <span className="font-bold text-cyan-300">Group B (Moderate Infiltration)</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-stone-400">Cation Exchange (CEC):</span>
                        <span className="font-bold text-emerald-400 font-mono">24.5 meq/100g</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-stone-400">Topsoil pH Range:</span>
                        <span className="font-bold text-stone-200 font-mono">6.6 – 6.8 pH (Optimal)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Available Water Storage (AWC):</span>
                        <span className="font-bold text-emerald-400 font-mono">0.21 in/in</span>
                      </div>
                    </div>
                  )}

                  {/* Tab 2.4: Telemetry & Microclimate */}
                  {intelligenceCardTab === 'microclimate' && (
                    <div className="space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-stone-400">Surface Soil Moisture (0-10cm):</span>
                        <span className="font-bold text-cyan-400 font-mono">{currentTargetField.surfaceMoisturePct}% VWC</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-stone-400">Root-Zone Moisture (10-40cm):</span>
                        <span className="font-bold text-cyan-300 font-mono">{currentTargetField.rootZoneMoisturePct}% VWC</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-stone-400">GDD Thermal Accumulation:</span>
                        <span className="font-bold text-amber-300 font-mono">1,842 GDD</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Evapotranspiration (ET₀):</span>
                        <span className="font-bold text-stone-300 font-mono">0.18 in/day</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: SOIL SAMPLING CORE MANAGER */}
              {/* ========================================================================= */}
              {activeSidebarTab === 'sampling' && currentTargetField && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                        Soil Core Sampling Manager
                      </h4>
                      <p className="text-[11px] text-stone-400">Composite lab assays for MRV calibration</p>
                    </div>
                    <button
                      onClick={() => setShowSamplePlanModal(true)}
                      className="px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold transition"
                    >
                      Plan Cores
                    </button>
                  </div>

                  <div className="space-y-2">
                    {activeFieldSamples.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => setSelectedSamplePoint(sample)}
                        className="p-3 rounded-2xl bg-stone-950 border border-stone-800 hover:border-cyan-500 cursor-pointer transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-cyan-300">{sample.sampleCode}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              sample.status === 'assayed'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {sample.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>SOC Assay: <b className="text-white">{sample.socPct}%</b></span>
                          <span>pH: <b className="text-white">{sample.ph}</b></span>
                          <span>Active C: <b className="text-emerald-400">{sample.activeCarbonPoxcMgKg} mg/kg</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: PRACTICE VERIFICATION WORKFLOW */}
              {/* ========================================================================= */}
              {activeSidebarTab === 'verification' && currentTargetField && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Practice MRV Verification
                      </h4>
                      <p className="text-[11px] text-stone-400">Multi-source evidence & confidence scoring</p>
                    </div>
                    <button
                      onClick={() => setShowVerificationDossierModal(true)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition"
                    >
                      Dossier
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentTargetField.practices.map((prac) => (
                      <div
                        key={prac.id}
                        className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-200">{prac.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold uppercase">
                            {prac.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400">{prac.details}</p>
                        <div className="pt-1 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                          <span>Sequestration: <b className="text-emerald-400 font-mono">+{prac.carbonEstimateMT} MT</b></span>
                          <span>Factor: <b className="text-stone-300 font-mono">{prac.emissionReductionFactor} t/ac</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: CARBON LEDGER & ISSUANCE */}
              {/* ========================================================================= */}
              {activeSidebarTab === 'ledger' && currentTargetField && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                        Parcel Carbon Ledger
                      </h4>
                      <p className="text-[11px] text-stone-400">Vintage credit issuances & retirement tokens</p>
                    </div>
                    <button
                      onClick={() => setShowCarbonLedgerModal(true)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition"
                    >
                      Full Ledger
                    </button>
                  </div>

                  <div className="space-y-2">
                    {activeFieldLedgers.map((rec) => (
                      <div
                        key={rec.vintageYear}
                        className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">Vintage {rec.vintageYear}</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {rec.netIssuedCreditsMT} tCO₂e Issued
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>Gross Removals: {rec.grossRemovalsMT} MT</span>
                          <span>Buffer (15%): -{rec.bufferPoolDeductionMT} MT</span>
                        </div>
                        <div className="pt-1 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                          <span>{rec.serialNumber}</span>
                          <span className="text-emerald-400 font-bold">${rec.totalGrossValueUSD.toLocaleString()} USD</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 6: GEOTAGGED SCOUTING NOTES */}
              {/* ========================================================================= */}
              {activeSidebarTab === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                      Geotagged Scouting Pins ({notes.length})
                    </h4>
                    <button
                      onClick={() => {
                        setIsAddingNoteMode(true);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold transition"
                    >
                      + Add Pin
                    </button>
                  </div>

                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => {
                          setSelectedNoteId(note.id);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.panTo(note.coordinates, { animate: true });
                          }
                        }}
                        className="p-3 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500 cursor-pointer transition space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-200">{note.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                              note.severity === 'critical'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : note.severity === 'attention'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            {note.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400">{note.content}</p>
                        <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                          <span>{note.fieldName || 'Field Map'}</span>
                          <span>{note.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 7: GEOTAGGED SOIL HEALTH PHOTOS */}
              {/* ========================================================================= */}
              {activeSidebarTab === 'photos' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      Soil Health Photos ({soilPhotos.length})
                    </h4>
                    <button
                      onClick={() => setShowCameraCaptureModal(true)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Snap Photo</span>
                    </button>
                  </div>

                  {/* Marker Category Filter */}
                  <select
                    value={photoMarkerFilter}
                    onChange={(e) => setPhotoMarkerFilter(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-stone-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Physical Soil Markers</option>
                    {SOIL_MARKER_CATEGORIES.map((cat) => (
                      <option key={cat.type} value={cat.type}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  {/* Photos Grid Cards */}
                  <div className="space-y-3">
                    {soilPhotos
                      .filter((p) => {
                        if (selectedField && p.fieldId && p.fieldId !== selectedField.id) return false;
                        if (photoMarkerFilter !== 'ALL' && p.markerType !== photoMarkerFilter) return false;
                        return true;
                      })
                      .map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => {
                            setSelectedPhotoForInspection(photo);
                            setShowPhotoInspectionModal(true);
                            if (mapInstanceRef.current) {
                              mapInstanceRef.current.panTo(photo.coordinates, { animate: true });
                            }
                          }}
                          className="bg-stone-950 border border-stone-800 hover:border-emerald-500 rounded-2xl p-2.5 space-y-2 cursor-pointer transition shadow-sm group"
                        >
                          {/* Image Thumbnail Preview */}
                          <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-stone-900">
                            <img
                              src={photo.imageDataUrl}
                              alt={photo.markerLabel}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-emerald-300 font-bold border border-white/10">
                              ★ {photo.soilQualityRating}.0
                            </div>
                            <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-stone-300">
                              {photo.sampleDepthCm}
                            </div>
                          </div>

                          <div className="space-y-1 px-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-stone-100 group-hover:text-emerald-400 transition">
                                {photo.markerLabel}
                              </h5>
                            </div>
                            <p className="text-[11px] text-stone-400 line-clamp-2">
                              {photo.notes}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 font-mono">
                              <span>{photo.fieldName}</span>
                              <span>{photo.formattedDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM DOCKED MULTI-TEMPORAL TIMELINE SLIDER (2021 - 2026) */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 bg-stone-900/95 border-t border-stone-800/80 backdrop-blur-md z-20 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Playback Controls & Date Label */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md"
              title={isTimelinePlaying ? 'Pause timeline playback' : 'Play multi-temporal progression'}
            >
              {isTimelinePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCurrentTimelineIndex(0)}
              className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition"
              title="Reset timeline to 2021 baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{currentTimelineStep.dateLabel}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-emerald-400 font-semibold">
                  {currentTimelineStep.season}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 line-clamp-1 max-w-md">
                {currentTimelineStep.satelliteDescription}
              </p>
            </div>
          </div>

          {/* Timeline Step Indicators */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl">
              <span className="text-stone-500">NDVI:</span>
              <span className="font-bold text-emerald-400">{currentTimelineStep.fieldNdvi}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl">
              <span className="text-stone-500">SOC Accretion:</span>
              <span className="font-bold text-emerald-400">{currentTimelineStep.fieldSocPct}%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl">
              <span className="text-stone-500">Resilience:</span>
              <span className="font-bold text-amber-300">{currentTimelineStep.soilResilienceScore}/100</span>
            </div>
          </div>
        </div>

        {/* Step Slider Track */}
        <div className="flex items-center gap-2 pt-1">
          {MOCK_GIS_TIMELINE_STEPS.map((step, idx) => {
            const isActive = currentTimelineIndex === idx;
            const isPassed = currentTimelineIndex >= idx;
            return (
              <div
                key={step.id}
                onClick={() => setCurrentTimelineIndex(idx)}
                className="flex-1 cursor-pointer group py-1"
              >
                <div
                  className={`h-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-emerald-400 shadow-md ring-2 ring-emerald-500/40'
                      : isPassed
                      ? 'bg-emerald-700'
                      : 'bg-stone-800 group-hover:bg-stone-700'
                  }`}
                />
                <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1 font-mono">
                  <span className={isActive ? 'text-emerald-300 font-bold' : ''}>{step.dateLabel.slice(0, 8)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: LAYER LIBRARY & OPACITY CONTROLLER */}
      {/* ========================================================================= */}
      {showLayerLibraryModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers2 className="w-5 h-5 text-emerald-400" />
                GIS Layer Library & Radiometric Overlays
              </h3>
              <button
                onClick={() => setShowLayerLibraryModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Opacity Slider */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-200">Thematic Polygon Opacity:</span>
                  <span className="font-mono text-emerald-400 font-bold">{Math.round(layerOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={layerOpacity}
                  onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Layer Selection Matrix */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                  Select Thematic Diagnostic Layer:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      onChangeLayer('satellite');
                      setShowLayerLibraryModal(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      activeLayer === 'satellite'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <b className="block">Satellite Natural True-Color</b>
                    <span className="text-[10px] text-stone-500">10m Sentinel-2 RGB</span>
                  </button>

                  <button
                    onClick={() => {
                      onChangeLayer('ndvi');
                      setShowLayerLibraryModal(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      activeLayer === 'ndvi'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <b className="block text-emerald-400">Sentinel-2 NDVI</b>
                    <span className="text-[10px] text-stone-500">Canopy Chlorophyll & Biomass</span>
                  </button>

                  <button
                    onClick={() => {
                      onChangeLayer('soc');
                      setShowLayerLibraryModal(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      activeLayer === 'soc'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <b className="block text-amber-300">Soil Organic Carbon (SOC %)</b>
                    <span className="text-[10px] text-stone-500">COMET-Farm & Core Assays</span>
                  </button>

                  <button
                    onClick={() => {
                      onChangeLayer('moisture');
                      setShowLayerLibraryModal(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      activeLayer === 'moisture'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <b className="block text-cyan-300">Soil Moisture Telemetry</b>
                    <span className="text-[10px] text-stone-500">% VWC Root & Surface</span>
                  </button>

                  <button
                    onClick={() => {
                      onChangeLayer('weather_heatmap');
                      setShowLayerLibraryModal(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      activeLayer === 'weather_heatmap'
                        ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <b className="block text-sky-300">7-Day Weather &amp; Rain Heatmap</b>
                    <span className="text-[10px] text-stone-500">Precipitation & Trafficability</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLayerLibraryModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Apply Layer Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EVIDENCE PIN INSPECTOR */}
      {/* ========================================================================= */}
      {selectedEvidencePin && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                  📸
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedEvidencePin.title}</h3>
                  <span className="text-[10px] text-stone-400">{selectedEvidencePin.timestamp}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvidencePin(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-3 rounded-2xl border border-stone-800">
              {selectedEvidencePin.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-500 block">Verification Confidence</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {selectedEvidencePin.confidenceScorePct}% Validated
                </span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-500 block">Author / Device</span>
                <span className="text-white font-bold">{selectedEvidencePin.author}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvidencePin(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SOIL CORE SAMPLE PLANNER / INSPECTOR */}
      {/* ========================================================================= */}
      {selectedSamplePoint && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <FlaskConical className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedSamplePoint.sampleCode}</h3>
                  <span className="text-[10px] text-stone-400">{selectedSamplePoint.labName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSamplePoint(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-center">
                <span className="text-[10px] text-stone-500 block">Lab SOC %</span>
                <span className="text-sm font-bold text-emerald-400">{selectedSamplePoint.socPct}%</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-center">
                <span className="text-[10px] text-stone-500 block">Bulk Density</span>
                <span className="text-sm font-bold text-stone-200">{selectedSamplePoint.bulkDensityGcm3} g/cm³</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-center">
                <span className="text-[10px] text-stone-500 block">Active C (POXC)</span>
                <span className="text-sm font-bold text-cyan-400">{selectedSamplePoint.activeCarbonPoxcMgKg} mg/kg</span>
              </div>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1">
              <span className="text-[10px] text-stone-500 block font-mono">SHA-256 Laboratory Chain of Custody:</span>
              <p className="font-mono text-[10px] text-emerald-400 break-all">{selectedSamplePoint.hashSha256}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSamplePoint(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: NEW FIELD DIGITIZER MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Enroll New Field Boundary
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Field Name / Section:</label>
                <input
                  type="text"
                  placeholder="e.g. South Section 22 (River Bend)"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-stone-400 block mb-1">Crop Rotation:</label>
                <input
                  type="text"
                  value={newCropType}
                  onChange={(e) => setNewCropType(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">Calculated GIS Acreage:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{calculatedDrawnAcres} Acres</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewField}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Save & Ingest Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD SCOUT NOTE MODAL */}
      {/* ========================================================================= */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Add Geotagged Scouting Pin
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Pin Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Cover Crop Emergence Check"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-stone-400 block mb-1">Observation Notes:</label>
                <textarea
                  rows={3}
                  placeholder="Describe field conditions, compaction, weed pressure, or residue retention..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-400 block mb-1">Observation Category:</label>
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value as FieldNoteCategory)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
                  >
                    <option value="observation">General Field Observation</option>
                    <option value="soil_texture">🌱 Soil Texture &amp; Friability</option>
                    <option value="residue_cover">🌾 Residue Cover &amp; Mulch Armor</option>
                    <option value="crop_health_marker">🍃 Crop Health &amp; Chlorosis Marker</option>
                    <option value="soil_compaction">🚜 Subsoil Compaction &amp; Hardpan</option>
                    <option value="cover_crop_emergence">🌱 Cover Crop Emergence</option>
                    <option value="weed_pressure">🌿 Weed Pressure &amp; Escapes</option>
                    <option value="moisture_ponding">💧 Infiltration &amp; Ponding</option>
                    <option value="tile_drainage">🚰 Subsurface Tile Drainage</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Severity:</label>
                  <select
                    value={newNoteSeverity}
                    onChange={(e) => setNewNoteSeverity(e.target.value as FieldNoteSeverity)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
                  >
                    <option value="info">Info / Normal</option>
                    <option value="attention">Attention</option>
                    <option value="critical">Critical Flag</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md"
              >
                Save Geotagged Pin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: MOISTURE MANAGEMENT & 7-DAY WEATHER ADVISORY MODAL */}
      {/* ========================================================================= */}
      {showWeatherDecisionModal && weatherReport && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-sky-500/50 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-950 border border-sky-800 text-sky-400">
                  <CloudRain className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {weatherReport.fieldName} — Moisture &amp; 7-Day Weather Advisory
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 font-mono font-bold">
                      {weatherReport.isLiveApiData ? 'Live Open-Meteo' : 'Microclimate Sync'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Decision-support matrix for field operations, moisture buffering, and avoided runoff
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWeatherDecisionModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Telemetry 4-Stat Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-500 block">Current Temp</span>
                <span className="text-lg font-bold text-stone-100 font-mono">
                  {weatherTempUnit === 'F' ? `${weatherReport.current.temperatureF}°F` : `${weatherReport.current.temperatureC}°C`}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">{weatherReport.current.conditionLabel}</span>
              </div>

              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-500 block">7-Day Rain Total</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {weatherReport.sevenDayTotalPrecipMm} mm
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">({weatherReport.sevenDayTotalPrecipInches} inches)</span>
              </div>

              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-500 block">Relative Humidity</span>
                <span className="text-lg font-bold text-stone-200 font-mono">
                  {weatherReport.current.relativeHumidity}%
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Wind: {weatherReport.current.windSpeedMph} mph</span>
              </div>

              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-500 block">Soil Trafficability</span>
                <span className="text-xs font-bold text-emerald-400 block mt-1">
                  {weatherReport.moistureDecisionAdvisory.soilTrafficability}
                </span>
              </div>
            </div>

            {/* 7-Day Day-by-Day Forecast Schedule Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Upcoming 7-Day Daily Forecast &amp; Operational Windows
              </h4>
              <div className="overflow-x-auto bg-stone-950 rounded-2xl border border-stone-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900/80 text-stone-400 text-[10px] uppercase border-b border-stone-800">
                    <tr>
                      <th className="py-2.5 px-3">Day / Date</th>
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-3">Temp (Max/Min)</th>
                      <th className="py-2.5 px-3">Precipitation</th>
                      <th className="py-2.5 px-3">Rain Prob</th>
                      <th className="py-2.5 px-3">Field Workability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80 text-stone-300 text-xs">
                    {weatherReport.dailyForecast.map((day, idx) => (
                      <tr key={idx} className="hover:bg-stone-900/50 transition">
                        <td className="py-2.5 px-3 font-semibold text-stone-100">
                          {day.dayName} <span className="text-[10px] text-stone-500 font-normal">({day.date})</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-xs">{day.conditionLabel}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {weatherTempUnit === 'F' ? `${day.tempMaxF}° / ${day.tempMinF}°F` : `${day.tempMaxC}° / ${day.tempMinC}°C`}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                          {day.precipitationMm} mm <span className="text-[10px] text-stone-500 font-normal">({day.precipitationInches}")</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-stone-400">
                          {day.precipitationProbability}%
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${day.workabilityColor}`}>
                            {day.fieldWorkability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Agronomic Advisory Card */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-sky-900/50 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  {weatherReport.moistureDecisionAdvisory.headline}
                </h4>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {weatherReport.moistureDecisionAdvisory.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                  Recommended Agronomic Decisions:
                </span>
                {weatherReport.moistureDecisionAdvisory.recommendedActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-stone-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
              <span className="text-[10px] text-stone-500 font-mono">
                Fetched: {new Date(weatherReport.fetchedAt).toLocaleTimeString()} &bull; Lat {weatherReport.latitude.toFixed(3)}, Lon {weatherReport.longitude.toFixed(3)}
              </span>
              <button
                onClick={() => setShowWeatherDecisionModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md"
              >
                Close Advisory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GeoJSON Field Boundary Ingestion Modal */}
      {showGeoJsonModal && (
        <GeoJsonImportModal
          isOpen={showGeoJsonModal}
          onClose={() => setShowGeoJsonModal(false)}
          onImportFields={handleImportGeoJSON}
          currentFarmName={currentFarm?.name || 'Current Operation'}
          currentFieldsCount={fields.length}
        />
      )}

      {/* Soil Health Ground-Truth Camera Capture Modal */}
      {showCameraCaptureModal && (
        <SoilCameraCaptureModal
          isOpen={showCameraCaptureModal}
          onClose={() => setShowCameraCaptureModal(false)}
          onSavePhoto={(newPhoto) => {
            setSoilPhotos((prev) => [newPhoto, ...prev]);
            setSelectedPhotoForInspection(newPhoto);
            setShowPhotoInspectionModal(true);
          }}
          currentField={currentTargetField || fields[0]}
          authorName="Lead Agronomist"
        />
      )}

      {/* Soil Health Photo Inspection Modal */}
      {showPhotoInspectionModal && selectedPhotoForInspection && (
        <SoilHealthPhotoInspectionModal
          photo={selectedPhotoForInspection}
          isOpen={showPhotoInspectionModal}
          onClose={() => setShowPhotoInspectionModal(false)}
          onDeletePhoto={(photoId) => {
            setSoilPhotos((prev) => prev.filter((p) => p.id !== photoId));
            setShowPhotoInspectionModal(false);
          }}
          onFocusOnMap={(coords) => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.panTo(coords, { animate: true });
            }
          }}
        />
      )}
    </div>
  );
};
