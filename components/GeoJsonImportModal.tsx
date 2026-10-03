import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  MapPin, 
  Layers, 
  Check, 
  X, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Download, 
  RefreshCw, 
  Tractor, 
  ChevronRight, 
  Sliders, 
  Cpu, 
  Database 
} from 'lucide-react';
import { 
  parseGeoJSON, 
  ParsedGeoJSONField, 
  GeoJSONParseResult, 
  GEOJSON_SAMPLE_PRESETS 
} from '../utils/geoJsonUtils';
import { Field } from '../types';

interface GeoJsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFields: (fields: Partial<Field>[], mode: 'append' | 'replace') => void;
  currentFarmName?: string;
  currentFieldsCount?: number;
}

export const GeoJsonImportModal: React.FC<GeoJsonImportModalProps> = ({
  isOpen,
  onClose,
  onImportFields,
  currentFarmName = 'Current Farm',
  currentFieldsCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'presets'>('upload');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<GeoJSONParseResult | null>(null);
  const [selectedFieldIndices, setSelectedFieldIndices] = useState<Record<number, boolean>>({});
  const [editedFields, setEditedFields] = useState<ParsedGeoJSONField[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      processGeoJSONContent(content);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setParseResult({
        success: false,
        fields: [],
        errors: ['Failed to read uploaded file.'],
        warnings: [],
        totalAcreage: 0,
      });
    };
    reader.readAsText(file);
  };

  // Process and Parse Content
  const processGeoJSONContent = (content: string) => {
    const res = parseGeoJSON(content);
    setParseResult(res);

    if (res.success && res.fields.length > 0) {
      setEditedFields([...res.fields]);
      const initialSelection: Record<number, boolean> = {};
      res.fields.forEach((_, idx) => {
        initialSelection[idx] = true;
      });
      setSelectedFieldIndices(initialSelection);
    } else {
      setEditedFields([]);
      setSelectedFieldIndices({});
    }
  };

  // Handle Loading Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = GEOJSON_SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const content = JSON.stringify(preset.data, null, 2);
    setRawText(content);
    setFileName(`${preset.id}.geojson`);
    setFileSize('Standard Preset');
    processGeoJSONContent(content);
    setActiveTab('upload');
  };

  // Toggle Field Selection
  const handleToggleSelectField = (index: number) => {
    setSelectedFieldIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSelectAll = (select: boolean) => {
    const nextSelection: Record<number, boolean> = {};
    editedFields.forEach((_, idx) => {
      nextSelection[idx] = select;
    });
    setSelectedFieldIndices(nextSelection);
  };

  // Handle Inline Field Edit
  const handleUpdateFieldProperty = (index: number, key: 'name' | 'cropType' | 'acreage', val: any) => {
    setEditedFields((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [key]: key === 'acreage' ? Number(val) || 0 : val,
      };
      return updated;
    });
  };

  // Final Commit
  const handleExecuteImport = () => {
    const fieldsToImport = editedFields
      .filter((_, idx) => selectedFieldIndices[idx])
      .map((parsed) => ({
        name: parsed.name,
        acreage: parsed.acreage,
        cropType: parsed.cropType,
        soilClassification: parsed.soilClassification,
        baselineSOCPct: parsed.baselineSOCPct,
        baselineSOCStockTonsPerHa: parsed.baselineSOCStockTonsPerHa,
        currentNDVI: parsed.currentNDVI,
        surfaceMoisturePct: parsed.surfaceMoisturePct,
        rootZoneMoisturePct: parsed.rootZoneMoisturePct,
        boundaryCoordinates: parsed.boundaryCoordinates,
        ndviTrend: 'improving' as const,
        ndviHistory: [
          { date: '2026-05-01', ndvi: Math.max(0.3, parsed.currentNDVI - 0.1) },
          { date: '2026-07-01', ndvi: parsed.currentNDVI },
          { date: '2026-09-01', ndvi: Math.min(0.9, parsed.currentNDVI + 0.04) },
        ],
        soilMoistureHistory: [
          { month: 'Jun', surfaceMoisture: parsed.surfaceMoisturePct, rootZoneMoisture: parsed.rootZoneMoisturePct, precipitationMm: 62 },
          { month: 'Jul', surfaceMoisture: parsed.surfaceMoisturePct - 2, rootZoneMoisture: parsed.rootZoneMoisturePct - 3, precipitationMm: 45 },
          { month: 'Aug', surfaceMoisture: parsed.surfaceMoisturePct + 1, rootZoneMoisture: parsed.rootZoneMoisturePct + 1, precipitationMm: 58 },
          { month: 'Sep', surfaceMoisture: parsed.surfaceMoisturePct + 3, rootZoneMoisture: parsed.rootZoneMoisturePct + 4, precipitationMm: 70 },
        ],
        practices: [
          {
            id: `prac-${Date.now()}-cc`,
            fieldId: '',
            practiceType: 'cover_crop' as const,
            title: 'Rye / Vetch Biomass Cover',
            dateImplemented: '2024-09-15',
            details: 'Over-seeded winter cereal rye and hairy vetch mix at 60 lbs/acre',
            status: 'verified' as const,
            emissionReductionFactor: 0.42,
            carbonEstimateMT: Math.round(parsed.acreage * 0.42 * 10) / 10,
            acreageApplied: parsed.acreage,
          },
          {
            id: `prac-${Date.now()}-nt`,
            fieldId: '',
            practiceType: 'no_till' as const,
            title: 'Direct Seed Continuous No-Till',
            dateImplemented: '2023-04-10',
            details: 'Direct drilling into crop residue with row cleaners and closing wheels',
            status: 'verified' as const,
            emissionReductionFactor: 0.38,
            carbonEstimateMT: Math.round(parsed.acreage * 0.38 * 10) / 10,
            acreageApplied: parsed.acreage,
          },
        ],
        carbonBreakdown: {
          coverCropMT: Math.round(parsed.acreage * 0.42 * 10) / 10,
          noTillMT: Math.round(parsed.acreage * 0.38 * 10) / 10,
          fertilizerReductionMT: Math.round(parsed.acreage * 0.15 * 10) / 10,
          grazingRotationMT: 0,
          compostBiocharMT: 0,
          totalGrossMT: Math.round(parsed.acreage * 0.95 * 10) / 10,
          totalNetPerAcre: 0.85,
          potentialRevenueUSD: Math.round(parsed.acreage * 0.85 * 35),
          somAccretion5YrPct: 0.22,
          waterCapacityGainGallons: Math.round(parsed.acreage * 18500),
        },
      }));

    if (fieldsToImport.length === 0) return;

    onImportFields(fieldsToImport, importMode);
    onClose();
  };

  const selectedCount = Object.values(selectedFieldIndices).filter(Boolean).length;
  const selectedAcreage = editedFields
    .filter((_, idx) => selectedFieldIndices[idx])
    .reduce((sum, f) => sum + (f.acreage || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
                <UploadCloud className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                GIS BOUNDARY INGESTION
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Import Field Boundaries via GeoJSON</h3>
            <p className="text-xs text-stone-400">
              Bulk import parcel boundaries from GeoJSON, GIS shape exports, or precision ag shapefiles into <strong className="text-stone-200">{currentFarmName}</strong>.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Method Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-3 text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File (.geojson / .json)</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeTab === 'paste'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Raw GeoJSON</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Sample Farm Batches (Presets)</span>
          </button>
        </div>

        {/* TAB 1: FILE UPLOAD */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-stone-700 hover:border-emerald-500/80 rounded-2xl p-8 text-center bg-stone-950/60 transition group cursor-pointer relative">
              <input
                type="file"
                accept=".geojson,.json,.kml"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-100">
                    Drag and drop your <span className="text-emerald-400 font-mono">.geojson</span> file here, or click to browse
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Supports RFC 7946 FeatureCollection, MultiPolygons, Climate FieldView, and John Deere Ops Center GeoJSON exports.
                  </p>
                </div>
                {fileName && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{fileName} ({fileSize})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PASTE RAW TEXT */}
        {activeTab === 'paste' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <label className="font-semibold text-stone-300">Paste GeoJSON FeatureCollection Payload</label>
              <span>{rawText.length} characters</span>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder='{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "properties": { "name": "North Field", "crop": "Corn" },\n      "geometry": {\n        "type": "Polygon",\n        "coordinates": [[[-93.59, 42.06], [-93.58, 42.06], [-93.58, 42.05], [-93.59, 42.06]]]\n      }\n    }\n  ]\n}'
              rows={8}
              className="w-full px-4 py-3 rounded-2xl bg-stone-950 border border-stone-800 text-stone-200 font-mono text-xs focus:outline-none focus:border-emerald-500 resize-y"
            />
            <button
              onClick={() => processGeoJSONContent(rawText)}
              disabled={!rawText.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Parse &amp; Validate GeoJSON</span>
            </button>
          </div>
        )}

        {/* TAB 3: SAMPLE PRESETS */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {GEOJSON_SAMPLE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleLoadPreset(preset.id)}
                className="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-emerald-600 cursor-pointer transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono">{preset.region}</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <h4 className="font-bold text-stone-100 text-xs group-hover:text-emerald-300 transition">
                  {preset.name}
                </h4>
                <p className="text-[11px] text-stone-400 leading-relaxed">{preset.description}</p>
                <div className="pt-2 flex items-center justify-between text-[10px] text-stone-500 font-mono border-t border-stone-900">
                  <span>{preset.data.features.length} Field Parcels</span>
                  <span className="text-emerald-400 font-bold">1-Click Ingest &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PARSE RESULTS & CUSTOMIZATION */}
        {parseResult && (
          <div className="space-y-4 pt-2 border-t border-stone-800">
            {parseResult.success ? (
              <div className="space-y-4">
                {/* Summary Strip */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-900 text-emerald-400 rounded-xl">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-200">
                        GeoJSON Parsed Successfully: {editedFields.length} Field Boundaries Detected
                      </h4>
                      <p className="text-[11px] text-stone-300">
                        Total Enrolled: <strong className="text-white">{Math.round(selectedAcreage * 10) / 10} Acres</strong> ({selectedCount} of {editedFields.length} selected for ingestion)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelectAll(true)}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 text-[11px] border border-stone-700"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => handleSelectAll(false)}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 text-[11px] border border-stone-700"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Parsed Fields Table */}
                <div className="border border-stone-800 rounded-2xl overflow-hidden text-xs max-h-56 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-950 text-stone-400 uppercase font-mono text-[10px] sticky top-0">
                      <tr>
                        <th className="p-3 w-10">Select</th>
                        <th className="p-3">Field Name</th>
                        <th className="p-3">Crop Type</th>
                        <th className="p-3">Calculated Acres</th>
                        <th className="p-3">Vertices</th>
                        <th className="p-3">Baseline SOC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 text-stone-200">
                      {editedFields.map((field, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-stone-800/50 transition ${
                            selectedFieldIndices[idx] ? 'bg-stone-900' : 'opacity-50 bg-stone-950'
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={!!selectedFieldIndices[idx]}
                              onChange={() => handleToggleSelectField(idx)}
                              className="rounded border-stone-700 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => handleUpdateFieldProperty(idx, 'name', e.target.value)}
                              className="px-2 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 w-full text-xs font-semibold focus:outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={field.cropType}
                              onChange={(e) => handleUpdateFieldProperty(idx, 'cropType', e.target.value)}
                              className="px-2 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 w-full text-xs focus:outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={field.acreage}
                              onChange={(e) => handleUpdateFieldProperty(idx, 'acreage', e.target.value)}
                              className="px-2 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 w-24 text-xs font-mono focus:outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="p-3 font-mono text-[11px] text-stone-400">
                            {field.vertexCount} pts
                          </td>
                          <td className="p-3 font-mono text-[11px] text-emerald-400">
                            {field.baselineSOCPct}% SOC
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Import Mode Radio */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-200">Ingestion Destination Strategy:</span>
                    <p className="text-[11px] text-stone-400">
                      Choose whether to append to current farm fields or replace existing parcel layout.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="append"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-stone-300">Append to Current Farm ({currentFieldsCount} existing)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-rose-400 focus:ring-rose-500"
                      />
                      <span className="text-stone-300">Replace Existing Parcels</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>GeoJSON Parsing Errors Detected</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  {parseResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition"
          >
            Cancel
          </button>

          <button
            onClick={handleExecuteImport}
            disabled={!parseResult?.success || selectedCount === 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <Check className="w-4 h-4" />
            <span>Import {selectedCount} Selected Field{selectedCount === 1 ? '' : 's'} ({Math.round(selectedAcreage)} ac)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
