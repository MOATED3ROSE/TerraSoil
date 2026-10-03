import { Field, Farm, WeatherTelemetryData } from '../types';

export function generateFieldTelemetryAndActivityCSV(
  field: Field,
  farm?: Farm,
  weatherData?: WeatherTelemetryData | null
): string {
  const sanitize = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str}"`;
    }
    return str;
  };

  const lines: string[] = [];

  // Metadata Header Block
  lines.push('# -------------------------------------------------------------');
  lines.push('# TERRASOIL AGRICULTURAL MRV & TELEMETRY EXPORT');
  lines.push('# Standard Format for Farm Management Information Systems (FMIS)');
  lines.push('# -------------------------------------------------------------');
  lines.push(`# Farm Operation: ${farm?.name || 'Prairie Crest Regenerative Farm'}`);
  lines.push(`# Operator / Owner: ${farm?.ownerName || 'Dan & Sarah Miller'}`);
  lines.push(`# Field Identifier: ${field.name}`);
  lines.push(`# Field ID: ${field.id}`);
  lines.push(`# Enrolled Acreage: ${field.acreage} ac`);
  lines.push(`# Crop Rotation: ${field.cropType}`);
  lines.push(`# Soil Classification: ${field.soilClassification}`);
  lines.push(`# Baseline Soil Organic Carbon: ${field.baselineSOCPct}% (${field.baselineSOCStockTonsPerHa} t C/ha)`);
  lines.push(`# Centroid Coordinates: ${field.centroid[0].toFixed(5)}, ${field.centroid[1].toFixed(5)}`);
  lines.push(`# Total Net Carbon Abatement: ${field.carbonBreakdown.totalGrossMT} MT CO2e/year (${field.carbonBreakdown.totalNetPerAcre} MT/ac/yr)`);
  lines.push(`# Export Timestamp (UTC): ${new Date().toISOString()}`);
  lines.push('');

  // SECTION 1: Telemetry, Soil Hydrology & Satellite History
  lines.push('# SECTION 1: SOIL HYDROLOGY & SATELLITE TELEMETRY TIME-SERIES');
  lines.push(
    [
      'Record_Type',
      'Date',
      'Surface_Moisture_Pct_0_10cm',
      'Root_Zone_Moisture_Pct_10_40cm',
      'Precipitation_mm',
      'Evapotranspiration_ET0_mm',
      'Temperature_Mean_C',
      'Temperature_Max_C',
      'Temperature_Min_C',
      'Sentinel2_NDVI',
      'Hydrology_Status',
    ].join(',')
  );

  // If we have live daily weather telemetry points
  if (weatherData?.dailyHistory && weatherData.dailyHistory.length > 0) {
    weatherData.dailyHistory.forEach((p) => {
      // Find matching NDVI for this date or approximate
      const ndviMatch = field.ndviHistory.find((n) => n.date === p.date);
      const ndviVal = ndviMatch ? ndviMatch.ndvi : field.currentNDVI;

      let status = 'Adequate';
      if (p.rootZoneMoisturePct < 22) status = 'Deficit/Stress';
      else if (p.rootZoneMoisturePct >= 32) status = 'Surplus/Near-Capacity';

      lines.push(
        [
          'Daily_Telemetry',
          sanitize(p.date),
          sanitize(p.surfaceMoisturePct),
          sanitize(p.rootZoneMoisturePct),
          sanitize(p.precipitationMm),
          sanitize(p.evapotranspirationMm),
          sanitize(p.tempMean),
          sanitize(p.tempMax),
          sanitize(p.tempMin),
          sanitize(ndviVal),
          sanitize(status),
        ].join(',')
      );
    });
  } else {
    // Fall back to field soil moisture history
    field.soilMoistureHistory.forEach((m) => {
      lines.push(
        [
          'Monthly_Telemetry',
          sanitize(m.month),
          sanitize(m.surfaceMoisture),
          sanitize(m.rootZoneMoisture),
          sanitize(m.precipitationMm),
          sanitize('3.2'),
          sanitize('21.5'),
          sanitize('27.0'),
          sanitize('15.2'),
          sanitize(field.currentNDVI),
          sanitize(m.rootZoneMoisture < 22 ? 'Deficit' : 'Optimal'),
        ].join(',')
      );
    });
  }

  lines.push('');

  // SECTION 2: Regenerative Practice Activity Ledger
  lines.push('# SECTION 2: REGENERATIVE MANAGEMENT PRACTICE ACTIVITY LEDGER');
  lines.push(
    [
      'Record_ID',
      'Practice_Category',
      'Activity_Title',
      'Date_Implemented',
      'Applied_Acreage_ac',
      'Emission_Factor_MT_CO2e_ac_yr',
      'Annual_Carbon_Removal_MT_CO2e',
      'Verification_Status',
      'Agronomic_Specifications_and_Notes',
    ].join(',')
  );

  if (field.practices && field.practices.length > 0) {
    field.practices.forEach((p) => {
      lines.push(
        [
          sanitize(p.id),
          sanitize(p.practiceType),
          sanitize(p.title),
          sanitize(p.dateImplemented),
          sanitize(p.acreageApplied),
          sanitize(p.emissionReductionFactor),
          sanitize(p.carbonEstimateMT),
          sanitize(p.status),
          sanitize(p.details),
        ].join(',')
      );
    });
  } else {
    lines.push('# No practice records logged for this field.');
  }

  lines.push('');
  lines.push('# End of TerraSoil FMIS Export');

  return lines.join('\n');
}

export function downloadFieldCSV(
  field: Field,
  farm?: Farm,
  weatherData?: WeatherTelemetryData | null
): void {
  const csvContent = generateFieldTelemetryAndActivityCSV(field, farm, weatherData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanFieldName = field.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `TerraSoil_${cleanFieldName}_Telemetry_Practices_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
