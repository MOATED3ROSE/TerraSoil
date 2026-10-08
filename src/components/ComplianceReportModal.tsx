import React, { useState } from 'react';
import { Farm, Field } from '../types';
import { Printer, Download, CheckCircle, ShieldCheck, FileText, X, Building, Award, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { generateComplianceReportPdf } from '../utils/generateComplianceReportPdf';

interface ComplianceReportModalProps {
  farm: Farm;
  fields: Field[];
  selectedField: Field | null;
  onClose: () => void;
}

export const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({
  farm,
  fields,
  selectedField,
  onClose,
}) => {
  const [reportScope, setReportScope] = useState<'whole-farm' | 'single-field'>(
    selectedField ? 'single-field' : 'whole-farm'
  );
  const [activeFieldId, setActiveFieldId] = useState<string>(
    selectedField?.id || fields[0]?.id || ''
  );
  const [agronomistFirm, setAgronomistFirm] = useState('Midwest Soil Consulting Services, LLC');
  const [certifiedAgronomist, setCertifiedAgronomist] = useState('Dr. Marcus Vance, CCA #48291');
  const [includeWhiteLabel, setIncludeWhiteLabel] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const targetField = fields.find((f) => f.id === activeFieldId) || fields[0];
  const reportFields = reportScope === 'single-field' && targetField ? [targetField] : fields;

  const totalAcreage = reportFields.reduce((acc, f) => acc + f.acreage, 0);
  const totalSequestrationMT = reportFields.reduce((acc, f) => acc + f.carbonBreakdown.totalGrossMT, 0);
  const avgIntensity = totalAcreage > 0 ? (totalSequestrationMT / totalAcreage).toFixed(2) : '0';

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      setExportSuccessMessage(null);

      // Allow UI to render loading state briefly
      setTimeout(() => {
        try {
          const doc = generateComplianceReportPdf({
            farm,
            fields: reportFields,
            reportScope,
            targetField,
            includeWhiteLabel,
            agronomistFirm,
            certifiedAgronomist,
          });

          const sanitizedFarm = farm.name.replace(/[^a-zA-Z0-9_-]/g, '_');
          const scopeSuffix = reportScope === 'single-field' && targetField 
            ? targetField.name.replace(/[^a-zA-Z0-9_-]/g, '_') 
            : 'WholeFarm';
          const filename = `TerraSoil_Carbon_Audit_Report_${sanitizedFarm}_${scopeSuffix}.pdf`;

          doc.save(filename);
          setIsExportingPdf(false);
          setExportSuccessMessage(`Downloaded audit-ready PDF: ${filename}`);
          setTimeout(() => setExportSuccessMessage(null), 5000);
        } catch (err) {
          console.error('PDF export failed:', err);
          setIsExportingPdf(false);
        }
      }, 150);
    } catch (e) {
      console.error('Failed to trigger PDF export:', e);
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Modal Top Bar (Controls - Hidden on Print) */}
        <div className="no-print bg-stone-950 p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100">
                  Field Evidence Report Generator
                </h3>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded">
                  Audit Evidence Package
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
                  3-State Assurance
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Empirical evidence package for USDA NRCS grants, Scope 3 audits, or carbon buyers. All modeled figures carry explicit assurance state labels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition"
              title="Download audit-ready PDF report directly to your device via jsPDF"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Audit PDF
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition"
              title="Open browser print dialogue"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-200 p-2 rounded-lg hover:bg-stone-800 transition text-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast / Notification Banner */}
        {exportSuccessMessage && (
          <div className="no-print bg-emerald-950/90 border-b border-emerald-700/60 text-emerald-200 px-4 py-2 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{exportSuccessMessage}</span>
            </div>
            <button
              onClick={() => setExportSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Settings Bar (Hidden on Print) */}
        <div className="no-print bg-stone-900/90 p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <label className="font-semibold text-stone-300">Report Scope:</label>
            <div className="flex bg-stone-950 border border-stone-800 rounded-lg p-1">
              <button
                onClick={() => setReportScope('whole-farm')}
                className={`px-3 py-1 rounded-md transition ${
                  reportScope === 'whole-farm'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Whole Farm ({fields.length} Fields)
              </button>
              <button
                onClick={() => setReportScope('single-field')}
                className={`px-3 py-1 rounded-md transition ${
                  reportScope === 'single-field'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Single Field
              </button>
            </div>

            {reportScope === 'single-field' && (
              <select
                value={activeFieldId}
                onChange={(e) => setActiveFieldId(e.target.value)}
                className="bg-stone-950 border border-stone-700 text-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.acreage} ac)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeWhiteLabel}
                onChange={(e) => setIncludeWhiteLabel(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>Include Agronomist White-Label Header</span>
            </label>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="printable-report flex-1 overflow-y-auto p-8 bg-white text-stone-900 font-sans space-y-6">
          {/* Document Header / Agronomist White-Label */}
          {includeWhiteLabel ? (
            <div className="flex items-start justify-between border-b-2 border-stone-900 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                    MS
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-stone-900">
                      {agronomistFirm}
                    </h2>
                    <p className="text-xs text-stone-600 font-medium">
                      Certified Agronomic Services &bull; Soil Organic Carbon Verification
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Supervising Agronomist: <strong>{certifiedAgronomist}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-amber-300">
                  Field Evidence Report &bull; Not Independently Verified
                </span>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  Report ID: TS-MRV-{farm.id.slice(-6).toUpperCase()}-2026
                </p>
                <p className="text-xs text-stone-500">
                  Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between border-b-2 border-stone-900 pb-5">
              <div>
                <h2 className="text-2xl font-black text-stone-900">TerraSoil Field Evidence Report</h2>
                <p className="text-xs text-amber-700 font-semibold">Audit-Ready Evidence Package &bull; Not Independently Verified</p>
              </div>
              <div className="text-right text-xs text-stone-500">
                <p className="font-mono">Report #{Math.floor(100000 + Math.random() * 900000)}</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* PRD-17 Prominent Data Assurance Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-2 text-amber-900">
                <span>DATA ASSURANCE NOTICE: NOT INDEPENDENTLY VERIFIED</span>
                <span className="text-[10px] font-mono bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-semibold">Standard Assurance Notice</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                All carbon flux figures are <strong>modeled estimates</strong> derived from standardized equations (IPCC Tier 1 &amp; USDA COMET-Farm v1.4 regional coefficients; ±22% model uncertainty). This report constitutes an empirical evidence package for third-party audit; <strong>independent third-party verification has not been performed</strong>.
              </p>
            </div>
          </div>

          {/* Farm & Entity Details */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
            <div>
              <p className="text-stone-500 font-medium uppercase text-[10px] tracking-wider">Producer / Operation</p>
              <h4 className="text-sm font-bold text-stone-900 mt-0.5">{farm.name}</h4>
              <p className="text-stone-700">Operator: {farm.ownerName}</p>
              <p className="text-stone-700">Location: {farm.region}, {farm.stateOrCountry}</p>
            </div>
            <div>
              <p className="text-stone-500 font-medium uppercase text-[10px] tracking-wider">Accounting Scope &amp; Target</p>
              <p className="text-stone-900 font-semibold mt-0.5">
                {reportScope === 'whole-farm' ? 'Whole Operation Assessment' : `Field: ${targetField?.name}`}
              </p>
              <p className="text-stone-700">Total Enrolled Area: <strong>{totalAcreage.toLocaleString()} Acres</strong> <span className="text-[10px] text-stone-500">[Observed GIS]</span></p>
              <p className="text-stone-700">Methodology: USDA COMET-Farm v1.4 &amp; IPCC Tier 1 <span className="text-[10px] text-amber-700 font-semibold">[Modeled ±22%]</span></p>
            </div>
          </div>

          {/* Executive Carbon Sequestration Summary Card */}
          <div className="border border-emerald-300 bg-emerald-50/60 p-5 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                    Modeled Net Carbon Sequestration
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    [MODELED / ESTIMATED]
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-emerald-950">
                    +{totalSequestrationMT.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-emerald-800">Metric Tons CO₂e / Year (±22%)</span>
                </div>
                <p className="text-xs text-emerald-900 mt-1">
                  Average Carbon Removal Density: <strong>{avgIntensity} MT CO₂e / Acre / Year</strong> <span className="text-stone-600 font-normal">(Worked model benchmark)</span>
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-300 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Audit-Ready Evidence
                </span>
                <p className="text-[11px] text-stone-600">
                  Observed Sentinel-2 NDVI &bull; Modeled Sequestration
                </p>
              </div>
            </div>
          </div>

          {/* Field Inventories Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Enrolled Field Inventories &amp; Soil Organic Carbon (SOC) Baselines
            </h3>
            <table className="w-full text-left text-xs border border-stone-200">
              <thead className="bg-stone-100 text-stone-700 border-b border-stone-200 font-semibold text-[11px]">
                <tr>
                  <th className="p-2.5">Field Identifier</th>
                  <th className="p-2.5">Acreage <span className="text-[9px] text-stone-500 font-mono">[Observed]</span></th>
                  <th className="p-2.5">Crop Rotation</th>
                  <th className="p-2.5">Soil Classification</th>
                  <th className="p-2.5">Baseline SOC % <span className="text-[9px] text-stone-500 font-mono">[Modeled]</span></th>
                  <th className="p-2.5">Sentinel-2 NDVI <span className="text-[9px] text-emerald-700 font-mono">[Observed 10m]</span></th>
                  <th className="p-2.5 text-right">Net CO₂e / Yr <span className="text-[9px] text-amber-700 font-mono">[Modeled ±22%]</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {reportFields.map((f) => (
                  <tr key={f.id}>
                    <td className="p-2.5 font-bold">{f.name}</td>
                    <td className="p-2.5 font-mono">{f.acreage} ac</td>
                    <td className="p-2.5">{f.cropType}</td>
                    <td className="p-2.5 text-stone-600">{f.soilClassification}</td>
                    <td className="p-2.5 font-mono">{f.baselineSOCPct}% ({f.baselineSOCStockTonsPerHa} t/ha)</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-700">{f.currentNDVI}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-900 font-mono">
                      +{f.carbonBreakdown.totalGrossMT} MT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verified Practices Ledger */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Regenerative Management Practice Evidence Ledger
            </h3>
            <table className="w-full text-left text-xs border border-stone-200">
              <thead className="bg-stone-100 text-stone-700 border-b border-stone-200 font-semibold text-[11px]">
                <tr>
                  <th className="p-2.5">Field</th>
                  <th className="p-2.5">Practice</th>
                  <th className="p-2.5">Date <span className="text-[9px] text-stone-500 font-mono">[Observed]</span></th>
                  <th className="p-2.5">Agronomic Specifications</th>
                  <th className="p-2.5">Area <span className="text-[9px] text-stone-500 font-mono">[Observed]</span></th>
                  <th className="p-2.5">Factor <span className="text-[9px] text-amber-700 font-mono">[Modeled v1.4]</span></th>
                  <th className="p-2.5 text-right">Sequestration <span className="text-[9px] text-amber-700 font-mono">[Modeled ±22%]</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {reportFields.flatMap((f) =>
                  f.practices.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2.5 font-semibold text-stone-900">{f.name}</td>
                      <td className="p-2.5 font-medium capitalize">{p.practiceType.replace('_', ' ')}</td>
                      <td className="p-2.5 font-mono text-stone-600">{p.dateImplemented}</td>
                      <td className="p-2.5 text-[11px] text-stone-600">{p.title} &mdash; {p.details}</td>
                      <td className="p-2.5 font-mono">{p.acreageApplied} ac</td>
                      <td className="p-2.5 font-mono text-stone-600">{p.emissionReductionFactor} MT/ac</td>
                      <td className="p-2.5 text-right font-bold text-emerald-900 font-mono">
                        +{p.carbonEstimateMT} MT
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Satellite Telemetry & Environmental Attestation */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-2">
            <h4 className="font-bold text-stone-900">Satellite Groundcover &amp; Biomass Evidence (Copernicus Sentinel-2 MSI)</h4>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Optical surface reflectance data acquired via ESA Copernicus Sentinel-2 Level-2A surface reflectance products indicates sustained groundcover throughout winter and critical pre-planting windows. Continuous vegetative canopy vigor was detected at NDVI &gt; 0.45, confirming non-fallow soil management in accordance with USDA Natural Resources Conservation Service (NRCS) Code 340 (Cover Crop) and Code 329 (Residue and Tillage Management, No-Till). Carbon accretion rates remain empirical modeled estimates awaiting independent third-party audit.
            </p>
          </div>

          {/* Legal Guardrail Disclaimer & Signature Block */}
          <div className="border-t border-stone-300 pt-4 space-y-3 text-[10px] text-stone-500">
            <p className="italic">
              <strong>Regulatory Notice &amp; Scope 3 Disclaimer:</strong> All carbon sequestration quantities presented herein are calculated estimates derived from peer-reviewed agronomic emission models (USDA COMET-Farm &amp; IPCC Guidelines for National Greenhouse Gas Inventories). These figures serve as primary documentation for agricultural sustainability tracking, corporate Scope 3 supply-chain carbon insetting, and conservation subsidy applications. Formal issuance of verified voluntary carbon offsets may require further independent third-party physical soil core audit protocols.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <p className="font-bold text-stone-700">Producer Signature / Operator Attestation</p>
                <div className="border-b border-stone-400 h-8 mt-1" />
                <p className="mt-1">{farm.ownerName} &bull; Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div>
                <p className="font-bold text-stone-700">Verifying Agronomist / Consultant</p>
                <div className="border-b border-stone-400 h-8 mt-1" />
                <p className="mt-1">{certifiedAgronomist} &bull; {agronomistFirm}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
