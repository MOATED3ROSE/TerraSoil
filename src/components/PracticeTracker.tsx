import React, { useState } from 'react';
import { Field, PracticeRecord, PracticeType, VerificationStatus } from '../types';
import { 
  Sprout, 
  Tractor, 
  Droplet, 
  Trees, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle,
  FileText,
  Trash2,
  ShieldCheck
} from 'lucide-react';

interface PracticeTrackerProps {
  fields: Field[];
  selectedField: Field | null;
  onAddPractice: (fieldId: string, practice: Omit<PracticeRecord, 'id'>) => void;
  onDeletePractice: (fieldId: string, practiceId: string) => void;
}

export const PracticeTracker: React.FC<PracticeTrackerProps> = ({
  fields,
  selectedField,
  onAddPractice,
  onDeletePractice,
}) => {
  const [activeFieldId, setActiveFieldId] = useState<string>(
    selectedField?.id || (fields[0]?.id || '')
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [practiceType, setPracticeType] = useState<PracticeType>('cover_crop');
  const [title, setTitle] = useState('');
  const [dateImplemented, setDateImplemented] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [details, setDetails] = useState('');
  const [acreageApplied, setAcreageApplied] = useState<number>(0);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verified');

  const currentField = fields.find((f) => f.id === activeFieldId) || fields[0];

  // Set default acreage when field changes or form opens
  React.useEffect(() => {
    if (currentField && acreageApplied === 0) {
      setAcreageApplied(currentField.acreage);
    }
  }, [currentField]);

  const getPracticeIcon = (type: PracticeType) => {
    switch (type) {
      case 'cover_crop':
        return <Sprout className="w-4 h-4 text-emerald-400" />;
      case 'no_till':
        return <Tractor className="w-4 h-4 text-amber-400" />;
      case 'fertilizer_reduction':
        return <Droplet className="w-4 h-4 text-blue-400" />;
      case 'grazing_rotation':
        return <Trees className="w-4 h-4 text-lime-400" />;
      case 'compost_biochar':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const getDefaultFactor = (type: PracticeType): number => {
    switch (type) {
      case 'cover_crop':
        return 0.48; // MT CO2e/ac/yr
      case 'no_till':
        return 0.52;
      case 'fertilizer_reduction':
        return 0.25;
      case 'grazing_rotation':
        return 0.72;
      case 'compost_biochar':
        return 0.95;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeFieldId) return;

    const factor = getDefaultFactor(practiceType);
    const appliedAcres = acreageApplied || currentField.acreage;
    const carbonMT = Number((appliedAcres * factor).toFixed(1));

    onAddPractice(activeFieldId, {
      fieldId: activeFieldId,
      practiceType,
      title,
      dateImplemented,
      details,
      status: verificationStatus,
      emissionReductionFactor: factor,
      carbonEstimateMT: carbonMT,
      acreageApplied: appliedAcres,
    });

    // Reset form
    setTitle('');
    setDetails('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Field Selector */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Regenerative Activity Ledger
            </span>
            <span className="text-xs text-stone-400">
              IPCC Tier 1 &amp; USDA COMET-Farm Compliant
            </span>
          </div>
          <h2 className="text-xl font-bold text-stone-100">
            Field Practice &amp; Management Activity Log
          </h2>
          <p className="text-xs text-stone-400">
            Document management events to establish continuous additionality for carbon credit audits and grant reporting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeFieldId}
            onChange={(e) => {
              setActiveFieldId(e.target.value);
              const f = fields.find((item) => item.id === e.target.value);
              if (f) setAcreageApplied(f.acreage);
            }}
            className="bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.acreage} ac) &bull; {f.practices.length} Practices
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Log New Practice
          </button>
        </div>
      </div>

      {/* Field Overview Summary Banner */}
      {currentField && (
        <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-stone-300">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>
              Target Field: <strong className="text-stone-100">{currentField.name}</strong> ({currentField.acreage} ac)
            </span>
            <span className="text-stone-600">|</span>
            <span>Crop: <strong className="text-stone-100">{currentField.cropType}</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-stone-400">
              Total Logged Abatement: <strong className="text-emerald-400 font-bold">{currentField.carbonBreakdown.totalGrossMT} MT CO₂e/yr</strong>
            </span>
            <span className="text-stone-400">
              Intensity: <strong className="text-stone-200 font-bold">{currentField.carbonBreakdown.totalNetPerAcre} MT/acre</strong>
            </span>
          </div>
        </div>
      )}

      {/* Add Practice Modal Form */}
      {showAddForm && (
        <div className="bg-stone-900 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              Log Regenerative Practice for {currentField?.name}
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-stone-400 hover:text-stone-200 text-xs"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Practice Category
                </label>
                <select
                  value={practiceType}
                  onChange={(e) => setPracticeType(e.target.value as PracticeType)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="cover_crop">Cover Cropping (Multi-species / Overwinter)</option>
                  <option value="no_till">Continuous No-Till / Conservation Tillage</option>
                  <option value="fertilizer_reduction">4R Fertilizer Stewardship / N-Reduction</option>
                  <option value="grazing_rotation">Adaptive Multi-Paddock (AMP) Grazing</option>
                  <option value="compost_biochar">Biochar / Composted Manure Addition</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Activity Title / Description Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Overwinter Cereal Rye (70 lbs/ac)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Date Implemented / Seeding Date
                </label>
                <input
                  type="date"
                  value={dateImplemented}
                  onChange={(e) => setDateImplemented(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Acreage Applied (Acres)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={acreageApplied}
                  onChange={(e) => setAcreageApplied(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Verification Documentation Tier
                </label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="verified">Agronomist Audit Verified (Geotagged + Invoices)</option>
                  <option value="satellite_verified">Satellite NDVI & Biomass Cross-Verified</option>
                  <option value="self_reported">Self-Reported Field Log (Pending Audit)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Expected Emission Factor
                </label>
                <div className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono flex items-center justify-between">
                  <span>USDA COMET-Farm Default:</span>
                  <strong>{getDefaultFactor(practiceType)} MT CO₂e / acre / yr</strong>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Agronomic Implementation Details / Seed Tag Specs / Rates
              </label>
              <textarea
                rows={2}
                placeholder="Details on seeding rate, termination strategy, herbicide/fertilizer reductions, or rotational recovery cycles..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-md transition"
              >
                Save Practice to Ledger
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Practices Ledger Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Verified Practice Records &bull; {currentField?.name}
          </h3>
          <span className="text-xs text-stone-400">
            {currentField?.practices.length || 0} active entries recorded
          </span>
        </div>

        {currentField?.practices.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-3">
            <Sprout className="w-10 h-10 text-stone-600 mx-auto" />
            <p className="text-sm">No regenerative practices logged yet for this field.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              + Log the first practice to calculate sequestration
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/80 text-stone-400 border-b border-stone-800 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Practice Type</th>
                  <th className="py-3 px-4">Activity Title &amp; Details</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Applied Area</th>
                  <th className="py-3 px-4">Emission Factor</th>
                  <th className="py-3 px-4">Annual Sequestration</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {currentField?.practices.map((practice) => (
                  <tr key={practice.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-200">
                      <div className="flex items-center gap-2">
                        {getPracticeIcon(practice.practiceType)}
                        <span className="capitalize">
                          {practice.practiceType.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-stone-100">{practice.title}</p>
                      <p className="text-stone-400 text-[11px] truncate">{practice.details}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-400">
                      {practice.dateImplemented}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-200">
                      {practice.acreageApplied} ac
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {practice.emissionReductionFactor} MT/ac/yr
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                        +{practice.carbonEstimateMT} MT CO₂e
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {practice.status === 'verified' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" /> Audit Verified
                        </span>
                      )}
                      {practice.status === 'satellite_verified' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/60">
                          <ShieldCheck className="w-3 h-3" /> Satellite Confirmed
                        </span>
                      )}
                      {practice.status === 'self_reported' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
                          <Clock className="w-3 h-3" /> Self-Reported
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeletePractice(currentField.id, practice.id)}
                        className="text-stone-500 hover:text-rose-400 transition p-1"
                        title="Delete practice record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
