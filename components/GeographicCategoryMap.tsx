import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  GeographicLocation, 
  Continent, 
  CompassDirection, 
  CostOfLivingTier, 
  MapColorMode, 
  SoilClassificationCategory, 
  GlobalMapLayerCategory,
  DataConfidenceLevel,
  WaterRiskLevel,
  UserPersona
} from '../types';
import { INITIAL_GEOGRAPHIC_LOCATIONS } from '../data/geographicLocations';
import { ALL_WORLD_COUNTRIES } from '../data/allWorldCountries';
import { SoilHealthDrillDownModal } from './SoilHealthDrillDownModal';
import { 
  SOIL_CLASSIFICATION_CATEGORIES, 
  classifySoilCategory, 
  getSoilCategoryDefinition, 
  getLocationSoilCategory 
} from '../data/soilClassificationData';
import { 
  Globe2, 
  MapPin, 
  Compass, 
  DollarSign, 
  Layers, 
  Filter, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  X, 
  Plus, 
  Sparkles, 
  Check, 
  Home, 
  ShoppingBag, 
  Zap, 
  Car, 
  Info,
  Maximize2,
  Minimize2,
  Palette,
  Activity,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  CheckCircle2,
  Building,
  ExternalLink,
  Leaf,
  ShieldCheck,
  Droplets,
  Sun,
  Wind,
  Shield,
  BarChart3,
  Cpu,
  Tractor,
  Building2,
  Scale,
  Award,
  BookOpen,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Flame,
  CloudRain,
  Database,
  ArrowUpRight,
  Sparkle
} from 'lucide-react';

interface GeographicCategoryMapProps {
  onSelectLocation?: (location: GeographicLocation) => void;
  onOpenLocalGIS?: () => void;
  className?: string;
  activePersona?: UserPersona;
}

export const GeographicCategoryMap: React.FC<GeographicCategoryMapProps> = ({
  onSelectLocation,
  onOpenLocalGIS,
  className = '',
  activePersona = 'farmer',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Locations state
  const [locations, setLocations] = useState<GeographicLocation[]>(INITIAL_GEOGRAPHIC_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<GeographicLocation | null>(INITIAL_GEOGRAPHIC_LOCATIONS[0]);

  // Global Map Layer Category
  const [activeLayer, setActiveLayer] = useState<GlobalMapLayerCategory>('geography');
  const [soilViewMode, setSoilViewMode] = useState<'simplified' | 'detailed'>('simplified');

  // Hierarchy Navigation Breadcrumbs (P0)
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'ALL'>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>('ALL');

  // Side Panels & Drawers
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState<boolean>(true);
  const [profileActiveTab, setProfileActiveTab] = useState<'agriculture' | 'soils' | 'climate' | 'water' | 'carbon' | 'economics' | 'supply_chain' | 'data_quality'>('agriculture');
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);
  const [methodologyTopic, setMethodologyTopic] = useState<GlobalMapLayerCategory>('soil');

  // Opportunity Finder Drawer & Filters (P1 - Flagship Discovery Tool)
  const [showOpportunityFinder, setShowOpportunityFinder] = useState<boolean>(false);
  const [finderCommodity, setFinderCommodity] = useState<string>('ALL');
  const [finderMinSOC, setFinderMinSOC] = useState<number>(1.5);
  const [finderMaxWaterRisk, setFinderMaxWaterRisk] = useState<string>('ALL');
  const [finderMaxOperatingCost, setFinderMaxOperatingCost] = useState<number>(800);
  const [finderMinConfidence, setFinderMinConfidence] = useState<string>('ALL');

  // Compare Locations State (P1)
  const [compareLocationsList, setCompareLocationsList] = useState<GeographicLocation[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCompassDirection, setSelectedCompassDirection] = useState<CompassDirection | 'ALL'>('ALL');
  const [selectedConfidenceFilter, setSelectedConfidenceFilter] = useState<DataConfidenceLevel | 'ALL'>('ALL');
  const [selectedSoilCategory, setSelectedSoilCategory] = useState<SoilClassificationCategory | 'ALL'>('ALL');
  const [baseMapType, setBaseMapType] = useState<'satellite' | 'street' | 'dark'>('dark');

  // Drill-Down Soil Health Benchmark Modal
  const [drillDownLocation, setDrillDownLocation] = useState<GeographicLocation | null>(null);
  const [showDrillDownModal, setShowDrillDownModal] = useState<boolean>(false);

  const continents: Continent[] = ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Oceania'];

  // Filtered locations based on all active criteria
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      // Continent filter
      if (selectedContinent !== 'ALL' && loc.continent !== selectedContinent) return false;

      // Country filter
      if (selectedCountry !== 'ALL' && loc.country !== selectedCountry) return false;

      // Compass direction secondary filter
      if (selectedCompassDirection !== 'ALL' && loc.compassDirection !== selectedCompassDirection) return false;

      // Confidence level filter
      if (selectedConfidenceFilter !== 'ALL' && loc.dataConfidenceProfile?.confidenceLevel !== selectedConfidenceFilter) return false;

      // Soil classification filter
      if (selectedSoilCategory !== 'ALL') {
        const cat = getLocationSoilCategory(loc);
        if (cat !== selectedSoilCategory) return false;
      }

      // Opportunity Finder filters
      if (showOpportunityFinder) {
        if (finderCommodity !== 'ALL') {
          const hasCommodity = loc.commodityProfile?.allCommodities.some((c) =>
            c.toLowerCase().includes(finderCommodity.toLowerCase())
          ) || loc.agriculturalProfile?.dominantCrops.some((c) =>
            c.toLowerCase().includes(finderCommodity.toLowerCase())
          );
          if (!hasCommodity) return false;
        }

        if (loc.carbonProfile && loc.carbonProfile.soilOrganicCarbonPct < finderMinSOC) return false;

        if (finderMaxWaterRisk !== 'ALL') {
          const risk = loc.waterRiskProfile?.droughtRisk;
          if (finderMaxWaterRisk === 'low' && risk !== 'low') return false;
          if (finderMaxWaterRisk === 'moderate' && (risk === 'high' || risk === 'severe')) return false;
        }

        if (loc.agOperatingCostPerAcreUSD > finderMaxOperatingCost) return false;

        if (finderMinConfidence !== 'ALL') {
          const conf = loc.dataConfidenceProfile?.confidenceLevel;
          if (finderMinConfidence === 'high' && conf !== 'high') return false;
          if (finderMinConfidence === 'moderate' && conf === 'limited') return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = loc.name.toLowerCase().includes(q);
        const matchCountry = loc.country.toLowerCase().includes(q);
        const matchSubRegion = loc.subRegion.toLowerCase().includes(q);
        const matchCrops = loc.agriculturalProfile?.dominantCrops.some((c) => c.toLowerCase().includes(q));
        const matchCommodity = loc.commodityProfile?.allCommodities.some((c) => c.toLowerCase().includes(q));
        if (!matchName && !matchCountry && !matchSubRegion && !matchCrops && !matchCommodity) return false;
      }

      return true;
    });
  }, [
    locations,
    selectedContinent,
    selectedCountry,
    selectedCompassDirection,
    selectedConfidenceFilter,
    selectedSoilCategory,
    showOpportunityFinder,
    finderCommodity,
    finderMinSOC,
    finderMaxWaterRisk,
    finderMaxOperatingCost,
    finderMinConfidence,
    searchQuery,
  ]);

  // Countries for the selected continent
  const availableCountriesForContinent = useMemo(() => {
    const list = selectedContinent === 'ALL'
      ? ALL_WORLD_COUNTRIES
      : ALL_WORLD_COUNTRIES.filter((c) => c.continent === selectedContinent);
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedContinent]);

  // Available commodities list
  const allCommodityOptions = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((l) => {
      l.commodityProfile?.allCommodities.forEach((c) => set.add(c));
      l.agriculturalProfile?.dominantCrops.forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [locations]);

  // Dynamic color coding based on active layer
  const getLocationLayerColor = (loc: GeographicLocation): string => {
    if (activeLayer === 'soil') {
      const soc = loc.carbonProfile?.soilOrganicCarbonPct ?? loc.soilHealthBenchmarks?.baselineSOCPct ?? 2.0;
      if (soc >= 3.0) return '#059669'; // High SOC
      if (soc >= 2.5) return '#10b981';
      if (soc >= 2.0) return '#34d399';
      return '#f59e0b';
    }
    if (activeLayer === 'climate') {
      const rainfall = loc.climateProfile?.annualPrecipitationMm ?? 600;
      if (rainfall >= 1000) return '#0284c7'; // Lush rain
      if (rainfall >= 650) return '#0ea5e9';
      if (rainfall >= 400) return '#38bdf8';
      return '#f59e0b'; // Arid
    }
    if (activeLayer === 'water') {
      const water = loc.waterRiskProfile?.droughtRisk ?? 'moderate';
      if (water === 'low') return '#10b981';
      if (water === 'moderate') return '#38bdf8';
      if (water === 'high') return '#f59e0b';
      return '#ef4444'; // Severe
    }
    if (activeLayer === 'economics') {
      const cost = loc.agOperatingCostPerAcreUSD ?? 400;
      if (cost <= 300) return '#10b981'; // Low cost
      if (cost <= 500) return '#38bdf8';
      if (cost <= 750) return '#f59e0b';
      return '#f43f5e'; // High input cost
    }
    if (activeLayer === 'confidence') {
      const conf = loc.dataConfidenceProfile?.confidenceLevel ?? 'moderate';
      if (conf === 'high') return '#10b981';
      if (conf === 'moderate') return '#f59e0b';
      return '#ef4444';
    }
    if (activeLayer === 'commodity') {
      return '#8b5cf6'; // Violet commodity layer
    }
    return '#10b981'; // Default geography
  };

  // ================= LEAFLET MAP INITIALIZATION =================
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [25, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    const baseUrls = {
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    };

    L.tileLayer(baseUrls[baseMapType], {
      attribution: '&copy; OpenStreetMap &copy; CARTO &mdash; TerraSoil Global Intelligence',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update base layer tile
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const baseUrls = {
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    };

    L.tileLayer(baseUrls[baseMapType], {
      attribution: '&copy; OpenStreetMap &copy; CARTO &mdash; TerraSoil Global Intelligence',
      maxZoom: 19,
    }).addTo(map);
  }, [baseMapType]);

  // Update map markers whenever filteredLocations or activeLayer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    filteredLocations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const markerColor = getLocationLayerColor(loc);
      const confLevel = loc.dataConfidenceProfile?.confidenceLevel || 'moderate';
      const confBadge = confLevel === 'high' ? '🟢' : confLevel === 'moderate' ? '🟡' : '🔴';

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-6 h-6 rounded-full border-2 ${isSelected ? 'border-white ring-4 ring-emerald-500/40 scale-125' : 'border-stone-900'} shadow-xl flex items-center justify-center text-white text-[10px] font-bold" style="background-color: ${markerColor}">
            ${loc.isNationalTerritoryPlaceholder ? 'N' : '●'}
          </div>
          <span class="absolute -top-1 -right-1 text-[8px]">${confBadge}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-global-pin',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(loc.coordinates, { icon: customIcon });

      const socVal = loc.carbonProfile?.soilOrganicCarbonPct ?? loc.soilHealthBenchmarks?.baselineSOCPct ?? 2.0;
      const opCost = loc.agOperatingCostPerAcreUSD ?? 380;
      const primaryCrop = loc.commodityProfile?.primaryCommodity ?? loc.agriculturalProfile?.dominantCrops[0] ?? 'Grain';

      marker.bindTooltip(
        `<div class="p-1 font-sans text-xs">
          <p class="font-bold text-white flex items-center gap-1">
            <span>${confBadge}</span> ${loc.name}
          </p>
          <p class="text-stone-300 text-[11px]">${loc.country} &bull; ${loc.subRegion}</p>
          <div class="mt-1 pt-1 border-t border-stone-800 grid grid-cols-2 gap-x-2 text-[10px]">
            <span>Primary: <b class="text-emerald-400">${primaryCrop}</b></span>
            <span>SOC: <b class="text-emerald-400">${socVal}%</b></span>
            <span>Ag Cost: <b class="text-amber-300">$${opCost}/ac</b></span>
            <span>Water: <b class="text-cyan-300 capitalize">${loc.waterRiskProfile?.droughtRisk || 'Moderate'}</b></span>
          </div>
        </div>`,
        { sticky: true, className: 'leaflet-tooltip-dark' }
      );

      marker.on('click', () => {
        setSelectedLocation(loc);
        setIsProfilePanelOpen(true);
        if (onSelectLocation) onSelectLocation(loc);
      });

      group.addLayer(marker);
    });
  }, [filteredLocations, selectedLocation, activeLayer]);

  // Handle location compare toggle
  const handleToggleCompare = (loc: GeographicLocation) => {
    setCompareLocationsList((prev) => {
      const exists = prev.some((l) => l.id === loc.id);
      if (exists) {
        return prev.filter((l) => l.id !== loc.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), loc];
      }
      return [...prev, loc];
    });
    setShowCompareDrawer(true);
  };

  // Breadcrumb handler
  const handleResetHierarchy = (level: 'world' | 'continent' | 'country') => {
    if (level === 'world') {
      setSelectedContinent('ALL');
      setSelectedCountry('ALL');
      setSelectedSubRegion('ALL');
      if (mapInstanceRef.current) mapInstanceRef.current.setView([25, 0], 2, { animate: true });
    } else if (level === 'continent') {
      setSelectedCountry('ALL');
      setSelectedSubRegion('ALL');
    } else if (level === 'country') {
      setSelectedSubRegion('ALL');
    }
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl flex flex-col min-h-[880px] text-stone-100 ${className}`}>
      {/* ========================================================================= */}
      {/* TOP COMMAND BAR: LAYER SELECTOR + DISCOVERY + DRILL-DOWN HIERARCHY */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 bg-stone-900/95 border-b border-stone-800 backdrop-blur-md flex flex-col gap-3 z-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Explorer Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Global Agricultural Intelligence Explorer
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300">
                    Discovery & Benchmarking
                  </span>
                </h3>
              </div>
              <p className="text-xs text-stone-400">
                Cross-regional soil carbon, climate stress, water risk, commodity flow, and operating economics
              </p>
            </div>
          </div>

          {/* Quick Action Tools: Opportunity Finder + Compare Drawer + Methodology */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOpportunityFinder(!showOpportunityFinder)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                showOpportunityFinder
                  ? 'bg-amber-500 text-stone-950 shadow-amber-500/20 shadow-md'
                  : 'bg-stone-950 hover:bg-stone-800 text-stone-200 border border-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Opportunity Finder</span>
              {showOpportunityFinder && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-stone-950 text-amber-300 font-mono text-[10px]">
                  {filteredLocations.length} Matched
                </span>
              )}
            </button>

            <button
              onClick={() => setShowCompareDrawer(!showCompareDrawer)}
              className="px-3 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Compare ({compareLocationsList.length})</span>
            </button>

            <button
              onClick={() => {
                setMethodologyTopic(activeLayer);
                setShowMethodologyModal(true);
              }}
              className="p-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition"
              title="View layer calculation methodology"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Layer Category Bar (§2 PRD Layers) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-800/80">
          <div className="bg-stone-950 border border-stone-800 p-1 rounded-2xl flex items-center flex-wrap gap-1 text-xs">
            <button
              onClick={() => setActiveLayer('geography')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                activeLayer === 'geography' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Geography
            </button>

            <button
              onClick={() => setActiveLayer('soil')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeLayer === 'soil' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              <span>Soil & Carbon</span>
            </button>

            <button
              onClick={() => setActiveLayer('climate')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeLayer === 'climate' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>Climate & Rainfall</span>
            </button>

            <button
              onClick={() => setActiveLayer('water')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeLayer === 'water' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-300" />
              <span>Water Risk</span>
            </button>

            <button
              onClick={() => setActiveLayer('commodity')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeLayer === 'commodity' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Tractor className="w-3.5 h-3.5 text-purple-300" />
              <span>Commodity Footprint</span>
            </button>

            <button
              onClick={() => setActiveLayer('economics')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeLayer === 'economics' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ag Operating Cost</span>
            </button>

            <button
              onClick={() => setActiveLayer('confidence')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeLayer === 'confidence' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data Confidence</span>
            </button>
          </div>

          {/* Drill-Down Breadcrumbs Hierarchy (§5 PRD) */}
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium overflow-x-auto">
            <button
              onClick={() => handleResetHierarchy('world')}
              className="hover:text-emerald-400 transition flex items-center gap-1"
            >
              <span>World</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />

            <select
              value={selectedContinent}
              onChange={(e) => {
                setSelectedContinent(e.target.value as any);
                setSelectedCountry('ALL');
              }}
              className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-stone-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Continents</option>
              {continents.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-stone-200 text-xs focus:outline-none max-w-[160px]"
            >
              <option value="ALL">All Countries</option>
              {availableCountriesForContinent.map((c) => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN EXPLORER: LEAFLET GLOBAL MAP + PROFILE PANEL */}
      {/* ========================================================================= */}
      <div className="relative flex-1 flex overflow-hidden min-h-[640px]">
        {/* LEAFLET MAP */}
        <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[640px] z-10" />

        {/* FLOATING TOP-LEFT MAP TOOLS */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
          {/* Quick Base Switcher */}
          <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 p-1.5 rounded-2xl shadow-xl flex items-center gap-1 text-xs">
            <span className="text-[10px] text-stone-400 font-bold uppercase px-1.5">Map:</span>
            <button
              onClick={() => setBaseMapType('dark')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                baseMapType === 'dark' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              Dark GIS
            </button>
            <button
              onClick={() => setBaseMapType('satellite')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                baseMapType === 'satellite' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setBaseMapType('street')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                baseMapType === 'street' ? 'bg-emerald-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              Topo
            </button>
          </div>

          {/* Active Layer Dynamic Legend Pill */}
          <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 p-2.5 rounded-2xl shadow-xl space-y-1.5 text-xs max-w-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                {activeLayer === 'soil' && 'Soil Organic Carbon (SOC %)'}
                {activeLayer === 'climate' && 'Annual Rainfall (mm/yr)'}
                {activeLayer === 'water' && 'Water Stress & Drought Risk'}
                {activeLayer === 'economics' && 'Farm Operating Cost ($/ac)'}
                {activeLayer === 'confidence' && 'Data Confidence Level'}
                {activeLayer === 'commodity' && 'Dominant Commodity'}
                {activeLayer === 'geography' && 'Active Region Locations'}
              </span>
              <button
                onClick={() => {
                  setMethodologyTopic(activeLayer);
                  setShowMethodologyModal(true);
                }}
                className="text-stone-500 hover:text-emerald-400 transition text-[10px] flex items-center gap-0.5"
              >
                <Info className="w-3 h-3" />
                <span>Methodology</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Good</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span> Mod</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> Stress</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE PANEL: COUNTRY & REGIONAL PROFILE PANEL (P0) */}
        {/* ========================================================================= */}
        {isProfilePanelOpen && selectedLocation && (
          <div className="w-full sm:w-[480px] bg-stone-900/95 border-l border-stone-800 backdrop-blur-xl z-20 flex flex-col overflow-hidden shadow-2xl transition-all">
            {/* Header with Title, Country, and Confidence Badge */}
            <div className="p-4 bg-stone-950/90 border-b border-stone-800 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-stone-300 font-bold uppercase font-mono">
                      {selectedLocation.countryCode}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 ${
                        selectedLocation.dataConfidenceProfile?.confidenceLevel === 'high'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : selectedLocation.dataConfidenceProfile?.confidenceLevel === 'moderate'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      <span>{selectedLocation.dataConfidenceProfile?.confidenceLevel === 'high' ? '🟢' : '🟡'}</span>
                      <span>{selectedLocation.dataConfidenceProfile?.confidenceLevel || 'Moderate'} Confidence</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{selectedLocation.name}</h3>
                  <p className="text-xs text-stone-400">{selectedLocation.country} &bull; {selectedLocation.subRegion}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleCompare(selectedLocation)}
                    className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition"
                    title="Add to location comparison"
                  >
                    <Scale className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button
                    onClick={() => setIsProfilePanelOpen(false)}
                    className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Banner: Drill-down to Local Field GIS (§4 & §5 PRD) */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onOpenLocalGIS) {
                      onOpenLocalGIS();
                    }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md"
                >
                  <Tractor className="w-3.5 h-3.5" />
                  <span>Open Regional Map →</span>
                </button>

                <button
                  onClick={() => {
                    setDrillDownLocation(selectedLocation);
                    setShowDrillDownModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Soil Drill-Down</span>
                </button>
              </div>
            </div>

            {/* Profile Tab Switcher */}
            <div className="p-2 bg-stone-950/70 border-b border-stone-800 flex items-center justify-between gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setProfileActiveTab('agriculture')}
                className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  profileActiveTab === 'agriculture' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Agriculture
              </button>
              <button
                onClick={() => setProfileActiveTab('soils')}
                className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  profileActiveTab === 'soils' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Soils & Carbon
              </button>
              <button
                onClick={() => setProfileActiveTab('climate')}
                className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  profileActiveTab === 'climate' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Climate & Water
              </button>
              <button
                onClick={() => setProfileActiveTab('economics')}
                className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  profileActiveTab === 'economics' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Operating Cost
              </button>
              <button
                onClick={() => setProfileActiveTab('supply_chain')}
                className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  profileActiveTab === 'supply_chain' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Scope 3 Footprint
              </button>
            </div>

            {/* Profile Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* TAB 1: AGRICULTURE */}
              {profileActiveTab === 'agriculture' && (
                <div className="space-y-3">
                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Major Commodities & Crop Footprint
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLocation.commodityProfile?.allCommodities.map((crop) => (
                        <span key={crop} className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-white font-medium">
                          {crop}
                        </span>
                      )) || selectedLocation.agriculturalProfile?.dominantCrops.map((c) => (
                        <span key={c} className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-white font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">Annual Production</span>
                      <span className="text-base font-bold text-white font-mono">
                        {selectedLocation.commodityProfile?.productionVolumeMMT || 12.4} MMT
                      </span>
                    </div>
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">Yield vs Global Benchmark</span>
                      <span className="text-base font-bold text-emerald-400 font-mono">
                        +{selectedLocation.commodityProfile?.yieldVsGlobalBenchmarkPct || 112}%
                      </span>
                    </div>
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">Export Orientation</span>
                      <span className="text-base font-bold text-cyan-400 font-mono">
                        {selectedLocation.commodityProfile?.exportSharePct || 65}% Exported
                      </span>
                    </div>
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">Irrigation Share</span>
                      <span className="text-base font-bold text-amber-300 font-mono">
                        {selectedLocation.waterRiskProfile?.irrigationDependencePct || 22}%
                      </span>
                    </div>
                  </div>

                  {selectedLocation.subnationalRegions && selectedLocation.subnationalRegions.length > 0 && (
                    <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                        Subnational Agricultural Districts
                      </span>
                      <div className="space-y-1.5">
                        {selectedLocation.subnationalRegions.map((sub) => (
                          <div key={sub.id} className="p-2 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                            <div>
                              <b className="text-white block">{sub.name}</b>
                              <span className="text-[10px] text-stone-400">{sub.primaryCommodity} &bull; SOC: {sub.baselineSOCPct}%</span>
                            </div>
                            <span className="text-emerald-400 font-mono font-bold">${sub.operatingCostPerAcreUSD}/ac</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SOILS & CARBON */}
              {profileActiveTab === 'soils' && (
                <div className="space-y-3">
                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Dominant Soil Classification (USDA / WRB)
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {selectedLocation.soilHealthBenchmarks?.majorSoilOrder || selectedLocation.agriculturalProfile?.soilZone}
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Texture: {selectedLocation.soilHealthBenchmarks?.soilTexture} &bull; pH: {selectedLocation.soilHealthBenchmarks?.soilPh} &bull; CEC: {selectedLocation.soilHealthBenchmarks?.cationExchangeCapacityCEC} meq/100g
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">Baseline Topsoil SOC %</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {selectedLocation.carbonProfile?.soilOrganicCarbonPct ?? selectedLocation.soilHealthBenchmarks?.baselineSOCPct}%
                      </span>
                    </div>
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">Topsoil Carbon Stock</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {selectedLocation.carbonProfile?.soilCarbonStockTonsCPerHa ?? selectedLocation.soilHealthBenchmarks?.baselineStockTonsCPerHa} tC/ha
                      </span>
                    </div>
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">Annual Sequestration Potential</span>
                      <span className="text-lg font-bold text-amber-300 font-mono">
                        +{selectedLocation.carbonProfile?.annualSequestrationPotentialMTCO2ePerAcre ?? 1.45} tCO₂e/ac/yr
                      </span>
                    </div>
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-500 block">Regenerative Practice Adoption</span>
                      <span className="text-lg font-bold text-cyan-400 font-mono">
                        {selectedLocation.carbonProfile?.regenerativePracticeAdoptionPct ?? 45}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CLIMATE & WATER RISK */}
              {profileActiveTab === 'climate' && (
                <div className="space-y-3">
                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                        Agro-Climatic Profile
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {selectedLocation.climateProfile?.climateClassification || 'Humid Continental'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Annual Precipitation</span>
                        <b className="text-white font-mono text-sm">{selectedLocation.climateProfile?.annualPrecipitationMm || 680} mm/yr</b>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Mean Annual Temperature</span>
                        <b className="text-white font-mono text-sm">{selectedLocation.climateProfile?.avgAnnualTempC || 14.5} °C</b>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Growing Degree Days (GDD)</span>
                        <b className="text-amber-300 font-mono text-sm">{selectedLocation.climateProfile?.gddGrowingDegreeDays || 3100} GDD</b>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Drought Vulnerability Score</span>
                        <b className="text-cyan-300 font-mono text-sm">{selectedLocation.climateProfile?.droughtFrequencyScore || 35}/100</b>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                      Water Availability & Watershed Risk
                    </span>
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-stone-800">
                      <span className="text-stone-400">River Basin:</span>
                      <b className="text-white">{selectedLocation.waterRiskProfile?.basinName || 'Regional Watershed'}</b>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-stone-800">
                      <span className="text-stone-400">Groundwater Stress Index:</span>
                      <b className="text-amber-300 font-mono">{selectedLocation.waterRiskProfile?.groundwaterStressIndex || 2.4} / 5.0</b>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Rainfall Reliability:</span>
                      <b className="text-emerald-400 font-mono">{selectedLocation.waterRiskProfile?.rainfallReliabilityPct || 78}%</b>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: OPERATING ECONOMICS (§7 & §11 PRD) */}
              {profileActiveTab === 'economics' && (
                <div className="space-y-3">
                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          Agricultural Operating Cost Index
                        </span>
                        <h4 className="text-base font-bold text-white font-mono">
                          ${selectedLocation.agOperatingCostPerAcreUSD}/acre
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-500 block uppercase">Input Index</span>
                        <span className="text-sm font-bold text-amber-300 font-mono">
                          {selectedLocation.agInputCostIndex} (Global = 100)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                      Farm Operating Cost Breakdown ($/acre)
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Land Rent / Deed Charge:</span>
                        <span className="font-mono text-white">${selectedLocation.operatingCostBreakdown.landRentUSD}/ac</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Fertilizer & Soil Inoculants:</span>
                        <span className="font-mono text-white">${selectedLocation.operatingCostBreakdown.fertilizerChemicalsUSD}/ac</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Field Labor & Operators:</span>
                        <span className="font-mono text-white">${selectedLocation.operatingCostBreakdown.laborUSD}/ac</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Fuel & Energy:</span>
                        <span className="font-mono text-white">${selectedLocation.operatingCostBreakdown.fuelEnergyUSD}/ac</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Machinery & Seeding:</span>
                        <span className="font-mono text-white">${selectedLocation.operatingCostBreakdown.machineryEquipmentUSD}/ac</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Irrigation & Logistics:</span>
                        <span className="font-mono text-white">
                          ${selectedLocation.operatingCostBreakdown.waterIrrigationUSD + selectedLocation.operatingCostBreakdown.logisticsUSD}/ac
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SCOPE 3 FOOTPRINT & DATA QUALITY */}
              {profileActiveTab === 'supply_chain' && (
                <div className="space-y-3">
                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                      Corporate Scope 3 Cat 1 Agri-Footprint
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Agri GHG Intensity</span>
                        <b className="text-emerald-400 font-mono text-sm">
                          {selectedLocation.carbonProfile?.agriGHGIntensityKgCO2ePerKg || 0.42} kg CO₂e/kg
                        </b>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Active Supply Farms</span>
                        <b className="text-white font-mono text-sm">
                          {selectedLocation.supplyChainProfile?.activeSuppliersCount || 1200} Farms
                        </b>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">EUDR Compliance</span>
                        <b className="text-emerald-400 font-mono text-sm">Deforestation-Free Verified</b>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Scope 3 Coverage</span>
                        <b className="text-cyan-300 font-mono text-sm">
                          {selectedLocation.supplyChainProfile?.corporateScope3Coverage || 'High'}
                        </b>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Data Confidence & Evidence Attribution (§8 PRD)
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Primary Farm Core Data:</span>
                        <b className="text-emerald-400 font-mono">{selectedLocation.dataConfidenceProfile?.primaryDataPct || 65}%</b>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Satellite / Modeled Data:</span>
                        <b className="text-stone-300 font-mono">{selectedLocation.dataConfidenceProfile?.modeledDataPct || 25}%</b>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Third-Party Verified Data:</span>
                        <b className="text-cyan-300 font-mono">{selectedLocation.dataConfidenceProfile?.verifiedDataPct || 10}%</b>
                      </div>
                      <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-800">
                        Source: {selectedLocation.dataConfidenceProfile?.sourceAgency || 'FAO & Sentinel-2'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* OPPORTUNITY FINDER DRAWER (P1 - Flagship Discovery Tool) */}
      {/* ========================================================================= */}
      {showOpportunityFinder && (
        <div className="p-4 bg-stone-900 border-t border-stone-800 z-20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Agricultural Opportunity Finder & Compound Discovery
            </h4>
            <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-950 border border-amber-800 text-amber-300 font-mono font-bold">
              {filteredLocations.length} Matching Regions Found
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-stone-400 block mb-1">Target Commodity:</label>
              <select
                value={finderCommodity}
                onChange={(e) => setFinderCommodity(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-stone-200 text-xs"
              >
                <option value="ALL">All Commodities</option>
                {allCommodityOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-stone-400 block mb-1">Min Topsoil SOC %:</label>
              <select
                value={finderMinSOC}
                onChange={(e) => setFinderMinSOC(parseFloat(e.target.value))}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-stone-200 text-xs"
              >
                <option value="1.0">≥ 1.0% (Any baseline)</option>
                <option value="2.0">≥ 2.0% (Moderate Stock)</option>
                <option value="2.5">≥ 2.5% (High Stock)</option>
                <option value="3.0">≥ 3.0% (Humic Reserve)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-stone-400 block mb-1">Max Water Risk Tolerance:</label>
              <select
                value={finderMaxWaterRisk}
                onChange={(e) => setFinderMaxWaterRisk(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-stone-200 text-xs"
              >
                <option value="ALL">Any Water Risk</option>
                <option value="low">Low Risk Only</option>
                <option value="moderate">Low to Moderate</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-stone-400 block mb-1">Max Operating Cost ($/ac):</label>
              <select
                value={finderMaxOperatingCost}
                onChange={(e) => setFinderMaxOperatingCost(parseInt(e.target.value))}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-stone-200 text-xs"
              >
                <option value="1200">≤ $1,200/ac</option>
                <option value="600">≤ $600/ac</option>
                <option value="400">≤ $400/ac</option>
                <option value="300">≤ $300/ac</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-stone-400 block mb-1">Min Data Confidence:</label>
              <select
                value={finderMinConfidence}
                onChange={(e) => setFinderMinConfidence(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-stone-200 text-xs"
              >
                <option value="ALL">Any Confidence</option>
                <option value="high">High Confidence (🟢)</option>
                <option value="moderate">Moderate + (🟡)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPARE LOCATIONS DRAWER (P1) */}
      {/* ========================================================================= */}
      {showCompareDrawer && (
        <div className="p-4 bg-stone-900 border-t border-stone-800 z-20 space-y-3 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-400" />
              Side-by-Side Location Comparison ({compareLocationsList.length} Selected)
            </h4>
            <button
              onClick={() => setShowCompareDrawer(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {compareLocationsList.length === 0 ? (
            <p className="text-xs text-stone-400">Click the scale icon on any location card or pin to add up to 3 regions for side-by-side comparison.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {compareLocationsList.map((loc) => (
                <div key={loc.id} className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <b className="text-white">{loc.name}</b>
                    <button
                      onClick={() => handleToggleCompare(loc)}
                      className="text-stone-500 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1 text-[11px] text-stone-400">
                    <div className="flex justify-between"><span>SOC:</span> <b className="text-emerald-400">{loc.carbonProfile?.soilOrganicCarbonPct}%</b></div>
                    <div className="flex justify-between"><span>Ag Operating Cost:</span> <b className="text-white">${loc.agOperatingCostPerAcreUSD}/ac</b></div>
                    <div className="flex justify-between"><span>Rainfall:</span> <b className="text-cyan-300">{loc.climateProfile?.annualPrecipitationMm} mm</b></div>
                    <div className="flex justify-between"><span>Water Risk:</span> <b className="text-amber-300 capitalize">{loc.waterRiskProfile?.droughtRisk}</b></div>
                    <div className="flex justify-between"><span>Confidence:</span> <b className="text-emerald-400 capitalize">{loc.dataConfidenceProfile?.confidenceLevel}</b></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* METHODOLOGY IN CONTEXT MODAL (P0) */}
      {/* ========================================================================= */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                Global Agricultural Intelligence Methodology
              </h3>
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-stone-800">
                <span className="text-stone-400">Layer Dimension:</span>
                <span className="font-bold text-emerald-400 capitalize">{methodologyTopic}</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-stone-800">
                <span className="text-stone-400">Spatial Resolution:</span>
                <span className="font-mono text-white">250m Sentinel-2 / FAO HWSD</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-stone-800">
                <span className="text-stone-400">Reference Period:</span>
                <span className="font-mono text-white">2024–2026 Multi-Year Calibration</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-stone-800">
                <span className="text-stone-400">Data Sources:</span>
                <span className="font-mono text-white">FAO, USDA ARS, ISRIC, Copernicus</span>
              </div>
              <p className="text-[11px] text-stone-400 pt-2">
                All soil organic carbon estimates and operating costs are cross-calibrated between physical composite soil core assays and Copernicus Sentinel-2 multispectral vegetation/residue indices.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Close Methodology
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drill Down Modal */}
      {showDrillDownModal && drillDownLocation && (
        <SoilHealthDrillDownModal
          location={drillDownLocation}
          isOpen={showDrillDownModal}
          onClose={() => setShowDrillDownModal(false)}
          initialTab="benchmarks"
        />
      )}
    </div>
  );
};
