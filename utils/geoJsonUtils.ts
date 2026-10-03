import { Field } from '../types';

export interface ParsedGeoJSONField {
  name: string;
  acreage: number;
  cropType: string;
  soilClassification: string;
  baselineSOCPct: number;
  baselineSOCStockTonsPerHa: number;
  currentNDVI: number;
  surfaceMoisturePct: number;
  rootZoneMoisturePct: number;
  boundaryCoordinates: [number, number][]; // [lat, lng] format for Leaflet
  center: [number, number]; // [lat, lng]
  vertexCount: number;
  originalProperties: Record<string, any>;
}

export interface GeoJSONParseResult {
  success: boolean;
  fields: ParsedGeoJSONField[];
  errors: string[];
  warnings: string[];
  totalAcreage: number;
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

/**
 * Calculates polygon area in square meters using spherical excess formula (Shoelace on sphere).
 * Converts resulting square meters to acres (1 sq meter = 0.000247105 acres).
 */
export function calculatePolygonAcreage(coords: [number, number][]): number {
  if (coords.length < 3) return 0;

  const EARTH_RADIUS = 6378137; // meters
  let area = 0;

  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];

    const lat1 = toRadians(p1[0]);
    const lat2 = toRadians(p2[0]);
    const lng1 = toRadians(p1[1]);
    const lng2 = toRadians(p2[1]);

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * EARTH_RADIUS * EARTH_RADIUS) / 2);
  const acres = area * 0.00024710538146717;
  return Math.round(acres * 10) / 10;
}

/**
 * Calculates centroid [lat, lng] of a polygon.
 */
export function calculatePolygonCentroid(coords: [number, number][]): [number, number] {
  if (coords.length === 0) return [42.0625, -93.585];

  let sumLat = 0;
  let sumLng = 0;

  coords.forEach(([lat, lng]) => {
    sumLat += lat;
    sumLng += lng;
  });

  return [sumLat / coords.length, sumLng / coords.length];
}

/**
 * Parses GeoJSON string or object and converts to TerraSoil Field models.
 */
export function parseGeoJSON(data: string | Record<string, any>): GeoJSONParseResult {
  const result: GeoJSONParseResult = {
    success: false,
    fields: [],
    errors: [],
    warnings: [],
    totalAcreage: 0,
  };

  let geojson: any;
  if (typeof data === 'string') {
    try {
      geojson = JSON.parse(data);
    } catch (e: any) {
      result.errors.push(`Invalid JSON syntax: ${e.message}`);
      return result;
    }
  } else {
    geojson = data;
  }

  if (!geojson || typeof geojson !== 'object') {
    result.errors.push('GeoJSON root must be a valid JSON object.');
    return result;
  }

  let features: any[] = [];

  if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
    features = geojson.features;
  } else if (geojson.type === 'Feature') {
    features = [geojson];
  } else if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
    features = [{ type: 'Feature', geometry: geojson, properties: {} }];
  } else if (Array.isArray(geojson)) {
    features = geojson;
  } else {
    result.errors.push(`Unsupported GeoJSON type: "${geojson.type}". Expected FeatureCollection, Feature, or Polygon.`);
    return result;
  }

  if (features.length === 0) {
    result.errors.push('No features found in GeoJSON document.');
    return result;
  }

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;

  features.forEach((feature, index) => {
    const geometry = feature.geometry || (feature.coordinates ? feature : null);
    if (!geometry) {
      result.warnings.push(`Feature #${index + 1} skipped: missing geometry.`);
      return;
    }

    const geomType = geometry.type;
    const rawCoords = geometry.coordinates;
    const props = feature.properties || {};

    let rings: number[][][] = [];

    if (geomType === 'Polygon') {
      if (Array.isArray(rawCoords) && rawCoords.length > 0) {
        rings = [rawCoords[0]]; // Outer ring
      }
    } else if (geomType === 'MultiPolygon') {
      if (Array.isArray(rawCoords) && rawCoords.length > 0) {
        // Collect outer rings of each polygon part
        rawCoords.forEach((poly: any) => {
          if (Array.isArray(poly) && poly.length > 0) {
            rings.push(poly[0]);
          }
        });
      }
    } else {
      result.warnings.push(`Feature #${index + 1} skipped: Geometry type "${geomType}" is not a Polygon/MultiPolygon.`);
      return;
    }

    rings.forEach((ring, ringIdx) => {
      if (!Array.isArray(ring) || ring.length < 3) {
        result.warnings.push(`Feature #${index + 1} (Part ${ringIdx + 1}) has fewer than 3 coordinates.`);
        return;
      }

      // GeoJSON is [longitude, latitude]. Convert to Leaflet [latitude, longitude]
      const leafletCoords: [number, number][] = [];

      for (let c = 0; c < ring.length; c++) {
        const pt = ring[c];
        if (!Array.isArray(pt) || pt.length < 2) continue;

        let lng = Number(pt[0]);
        let lat = Number(pt[1]);

        // Auto-detect coordinate flip if latitude is out of [-90, 90] bounds and longitude is in [-90, 90]
        if (Math.abs(lng) <= 90 && Math.abs(lat) > 90) {
          const temp = lat;
          lat = lng;
          lng = temp;
        }

        if (isNaN(lat) || isNaN(lng)) continue;

        leafletCoords.push([lat, lng]);

        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }

      if (leafletCoords.length < 3) {
        result.warnings.push(`Feature #${index + 1} has insufficient valid vertex points.`);
        return;
      }

      // Calculate acreage
      let calcAcreage = calculatePolygonAcreage(leafletCoords);
      if (props.acres || props.acreage || props.area_acres) {
        const propAcres = Number(props.acres || props.acreage || props.area_acres);
        if (!isNaN(propAcres) && propAcres > 0) {
          calcAcreage = propAcres;
        }
      }
      if (calcAcreage <= 0) calcAcreage = 40; // Default fallback parcel size

      const centroid = calculatePolygonCentroid(leafletCoords);

      const fieldName =
        props.name ||
        props.field_name ||
        props.fieldName ||
        props.title ||
        props.label ||
        props.id ||
        `Imported Parcel ${result.fields.length + 1}`;

      const cropType =
        props.crop ||
        props.crop_type ||
        props.cropType ||
        props.crop_name ||
        'Corn / Cover Crop';

      const soilClassification =
        props.soil ||
        props.soil_type ||
        props.soilClassification ||
        props.soil_class ||
        'Typic Hapludolls - Rich Loam';

      const baselineSOCPct =
        Number(props.soc || props.baselineSOCPct || props.soil_carbon || props.soc_pct) || 2.45;

      const currentNDVI =
        Number(props.ndvi || props.currentNDVI || props.vegetation_index) || 0.72;

      const surfaceMoisturePct =
        Number(props.surface_moisture || props.surfaceMoisturePct) || 28;

      const rootZoneMoisturePct =
        Number(props.root_zone_moisture || props.rootZoneMoisturePct) || 35;

      result.fields.push({
        name: String(fieldName),
        acreage: calcAcreage,
        cropType: String(cropType),
        soilClassification: String(soilClassification),
        baselineSOCPct,
        baselineSOCStockTonsPerHa: Math.round(baselineSOCPct * 21.5 * 10) / 10,
        currentNDVI,
        surfaceMoisturePct,
        rootZoneMoisturePct,
        boundaryCoordinates: leafletCoords,
        center: centroid,
        vertexCount: leafletCoords.length,
        originalProperties: props,
      });

      result.totalAcreage += calcAcreage;
    });
  });

  if (result.fields.length > 0) {
    result.success = true;
    result.totalAcreage = Math.round(result.totalAcreage * 10) / 10;
    result.bounds = { minLat, maxLat, minLng, maxLng };
  } else {
    result.errors.push('No valid polygon boundaries could be extracted from the GeoJSON data.');
  }

  return result;
}

/**
 * Converts internal Field models to standard RFC 7946 GeoJSON FeatureCollection.
 */
export function exportFieldsToGeoJSON(fields: Field[], farmName: string = 'TerraSoil Farm'): string {
  const features = fields.map((field) => {
    // Convert Leaflet [lat, lng] to GeoJSON [lng, lat]
    const geoJsonCoords = field.boundaryCoordinates.map(([lat, lng]) => [lng, lat]);

    // Ensure polygon is closed (first coord equals last coord)
    if (
      geoJsonCoords.length > 0 &&
      (geoJsonCoords[0][0] !== geoJsonCoords[geoJsonCoords.length - 1][0] ||
        geoJsonCoords[0][1] !== geoJsonCoords[geoJsonCoords.length - 1][1])
    ) {
      geoJsonCoords.push([geoJsonCoords[0][0], geoJsonCoords[0][1]]);
    }

    return {
      type: 'Feature',
      id: field.id,
      properties: {
        id: field.id,
        name: field.name,
        acreage: field.acreage,
        cropType: field.cropType,
        soilClassification: field.soilClassification,
        baselineSOCPct: field.baselineSOCPct,
        baselineSOCStockTonsPerHa: field.baselineSOCStockTonsPerHa,
        currentNDVI: field.currentNDVI,
        surfaceMoisturePct: field.surfaceMoisturePct,
        rootZoneMoisturePct: field.rootZoneMoisturePct,
        practicesCount: field.practices.length,
        practices: field.practices.map((p) => ({
          practiceType: p.practiceType,
          title: p.title,
          dateImplemented: p.dateImplemented,
          details: p.details,
          status: p.status,
          emissionReductionFactor: p.emissionReductionFactor,
          carbonEstimateMT: p.carbonEstimateMT,
          acreageApplied: p.acreageApplied,
        })),
        carbonTotalGrossMT: field.carbonBreakdown.totalGrossMT,
        carbonTotalNetPerAcre: field.carbonBreakdown.totalNetPerAcre,
        somAccretion5YrPct: field.carbonBreakdown.somAccretion5YrPct,
        waterCapacityGainGallons: field.carbonBreakdown.waterCapacityGainGallons,
        farmName,
        exportedAt: new Date().toISOString(),
        system: 'TerraSoil MRV Portal',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [geoJsonCoords],
      },
    };
  });

  const featureCollection = {
    type: 'FeatureCollection',
    name: `${farmName.replace(/\s+/g, '_')}_Field_Boundaries`,
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      },
    },
    features,
  };

  return JSON.stringify(featureCollection, null, 2);
}

/**
 * Downloads GeoJSON text file to user's computer.
 */
export function downloadGeoJSONFile(geoJsonString: string, filename: string = 'terrasoil_fields.geojson') {
  const blob = new Blob([geoJsonString], { type: 'application/geo+json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Predefined GeoJSON sample datasets for instant loading and testing.
 */
export const GEOJSON_SAMPLE_PRESETS = [
  {
    id: 'midwest_corn_soy_batch',
    name: 'Midwest 4-Field Regenerative Corn & Soy Batch (Story County, IA)',
    description: '4 adjoining parcels (~640 acres total) with cover cropping and no-till management.',
    region: 'Iowa, USA',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'North Section 14 (Cover Crop Rye)',
            acres: 180,
            crop: 'Corn (Rye Cover Crop)',
            soil_type: 'Clarion Loam 2-5% Slope',
            soc: 2.82,
            ndvi: 0.78,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-93.595, 42.068],
                [-93.585, 42.068],
                [-93.585, 42.06],
                [-93.595, 42.06],
                [-93.595, 42.068],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            name: 'South 160 (No-Till Soybeans)',
            acres: 160,
            crop: 'Soybeans (No-Till)',
            soil_type: 'Nicollet Clay Loam',
            soc: 2.65,
            ndvi: 0.74,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-93.585, 42.06],
                [-93.575, 42.06],
                [-93.575, 42.052],
                [-93.585, 42.052],
                [-93.585, 42.06],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            name: 'Creek Bottom Wet Meadow',
            acres: 140,
            crop: 'Perennial Switchgrass Buffer',
            soil_type: 'Webster Silty Clay Loam',
            soc: 3.45,
            ndvi: 0.85,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-93.595, 42.06],
                [-93.585, 42.06],
                [-93.585, 42.052],
                [-93.595, 42.052],
                [-93.595, 42.06],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            name: 'East Ridge Prairie Strip',
            acres: 160,
            crop: 'Oats & Alfalfa Rotational',
            soil_type: 'Tama Silty Clay Loam',
            soc: 2.95,
            ndvi: 0.71,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-93.575, 42.068],
                [-93.565, 42.068],
                [-93.565, 42.06],
                [-93.575, 42.06],
                [-93.575, 42.068],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: 'california_orchard_grid',
    name: 'California Central Valley Precision Orchard Grid (Fresno County, CA)',
    description: '3 precision drip-irrigated almond and citrus blocks with compost mulch.',
    region: 'California, USA',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'Block A - Nonpareil Almonds',
            acres: 120,
            crop: 'Almonds (Compost Mulched)',
            soil_type: 'San Joaquin Sandy Loam',
            soc: 1.45,
            ndvi: 0.68,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-119.785, 36.745],
                [-119.775, 36.745],
                [-119.775, 36.738],
                [-119.785, 36.738],
                [-119.785, 36.745],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            name: 'Block B - Organic Valencia Citrus',
            acres: 95,
            crop: 'Citrus & Cover Crop Clover',
            soil_type: 'Hanford Fine Sandy Loam',
            soc: 1.62,
            ndvi: 0.72,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-119.775, 36.745],
                [-119.765, 36.745],
                [-119.765, 36.738],
                [-119.775, 36.738],
                [-119.775, 36.745],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            name: 'Block C - Pistachio Expansion',
            acres: 110,
            crop: 'Pistachios (Subsurface Drip)',
            soil_type: 'Delhi Sand',
            soc: 1.28,
            ndvi: 0.61,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-119.785, 36.738],
                [-119.775, 36.738],
                [-119.775, 36.73],
                [-119.785, 36.73],
                [-119.785, 36.738],
              ],
            ],
          },
        },
      ],
    },
  },
  {
    id: 'nebraska_wheat_belt',
    name: 'High Plains Strip-Cropping & Shelterbelt Wheat (Perkins County, NE)',
    description: '3 large dryland winter wheat parcels with windbreak shelterbelts and reduced tillage.',
    region: 'Nebraska, USA',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'Section 22 North Pivot',
            acres: 240,
            crop: 'Hard Red Winter Wheat',
            soil_type: 'Holdrege Silt Loam',
            soc: 2.15,
            ndvi: 0.64,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-101.72, 40.88],
                [-101.705, 40.88],
                [-101.705, 40.868],
                [-101.72, 40.868],
                [-101.72, 40.88],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            name: 'Section 22 South Dryland Strip',
            acres: 220,
            crop: 'Grain Sorghum & Millet',
            soil_type: 'Colby Silt Loam',
            soc: 1.98,
            ndvi: 0.58,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-101.72, 40.868],
                [-101.705, 40.868],
                [-101.705, 40.855],
                [-101.72, 40.855],
                [-101.72, 40.868],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            name: 'Shelterbelt Agroforestry Border',
            acres: 160,
            crop: 'Perennial Buffer & Windbreak',
            soil_type: 'Kuma Silt Loam',
            soc: 2.55,
            ndvi: 0.79,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-101.705, 40.88],
                [-101.69, 40.88],
                [-101.69, 40.855],
                [-101.705, 40.855],
                [-101.705, 40.88],
              ],
            ],
          },
        },
      ],
    },
  },
];
