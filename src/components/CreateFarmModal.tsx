import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  User, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Tractor, 
  Users, 
  ShieldCheck, 
  Sprout, 
  ArrowRight,
  Shield,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { Farm, UserPersona } from '../types';

interface CreateFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFarm: (newFarm: Omit<Farm, 'id'>) => void;
  onJourneyStepComplete?: (stage: 'create_farm') => void;
}

export const CreateFarmModal: React.FC<CreateFarmModalProps> = ({
  isOpen,
  onClose,
  onAddFarm,
  onJourneyStepComplete,
}) => {
  const [farmName, setFarmName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [clientOrSupplierName, setClientOrSupplierName] = useState('');
  const [region, setRegion] = useState('Story County, Iowa');
  const [stateOrCountry, setStateOrCountry] = useState('USA');
  const [personaType, setPersonaType] = useState<UserPersona>('farmer');
  const [scope3Category, setScope3Category] = useState('Corn & Soybean Direct Farm Supply');
  const [biomeProfile, setBiomeProfile] = useState('US Corn Belt (Mollisol Deep Prairie Loam)');
  const [targetProgram, setTargetProgram] = useState('USDA NRCS EQIP / Corporate Scope 3 Insetting');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;

    const newFarmData: Omit<Farm, 'id'> = {
      name: farmName.trim(),
      ownerName: ownerName.trim() || 'Principal Operator',
      clientOrSupplierName: clientOrSupplierName.trim() || farmName.trim() + ' Operations LLC',
      region: region.trim() || 'Midwest US Agricultural Belt',
      stateOrCountry: stateOrCountry.trim() || 'USA',
      totalAcreage: 0, // Starts at 0 until fields are added (Step 2 of journey)
      personaType,
      verifiedPracticesPct: 0,
      scope3Category,
      auditStatus: 'Draft',
      fields: [], // Ready for Step 2
    };

    onAddFarm(newFarmData);
    if (onJourneyStepComplete) {
      onJourneyStepComplete('create_farm');
    }
    onClose();
  };

  const handleQuickSeedDemo = () => {
    setFarmName('Aurora Horizon Valley Farm');
    setOwnerName('Marcus & Claire Jensen');
    setClientOrSupplierName('Jensen Family Agro-Ecology LLC');
    setRegion('Hardin County, Iowa');
    setStateOrCountry('USA');
    setPersonaType('farmer');
    setScope3Category('Regenerative Row Crop & Small Grains');
    setBiomeProfile('US Corn Belt (Mollisol Deep Prairie Loam)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between sticky top-0 bg-stone-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-950/80 text-emerald-400 rounded-2xl border border-emerald-800/80 shadow-md">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/90 border border-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  PRD-18 • Journey Step 1
                </span>
                <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                  Tenant Isolation Active
                </span>
              </div>
              <h2 className="text-xl font-bold text-stone-100 mt-1">Create Agricultural Enterprise</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Demo Pre-fill Banner */}
          <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Alpha Journey Testing: Pre-populate with verified Midwestern agronomic test parameters.</span>
            </div>
            <button
              type="button"
              onClick={handleQuickSeedDemo}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold shrink-0 transition"
            >
              Fill Sample Data
            </button>
          </div>

          {/* Farm Name & Owner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Farm / Operation Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. Willow Creek Regenerative Farm"
                className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Primary Operator / Grower Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Dan & Sarah Miller"
                className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Client or Legal Supplier Entity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Legal Entity / Parent Holding
              </label>
              <input
                type="text"
                value={clientOrSupplierName}
                onChange={(e) => setClientOrSupplierName(e.target.value)}
                placeholder="e.g. Prairie Ridge Operations LLC"
                className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Operation Type &amp; User Workspace
              </label>
              <select
                value={personaType}
                onChange={(e) => setPersonaType(e.target.value as UserPersona)}
                className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="farmer">Farmer / Grower (Direct Field Operations)</option>
                <option value="agronomist">Agronomist Consultant (Multi-Client Farm)</option>
                <option value="corporate">Corporate Scope 3 (Supply Shed Insetting)</option>
                <option value="auditor">Auditor / Verifier (Independent Review)</option>
              </select>
            </div>
          </div>

          {/* Geographic Location & Biome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                County / Province / Region <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Story County, Iowa"
                  className="w-full bg-stone-950 border border-stone-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                State / Country <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={stateOrCountry}
                onChange={(e) => setStateOrCountry(e.target.value)}
                placeholder="e.g. USA"
                className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Regional Soil Biome Lookup Parameter */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Regional Soil Biome &amp; Baseline Profile
            </label>
            <select
              value={biomeProfile}
              onChange={(e) => setBiomeProfile(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="US Corn Belt (Mollisol Deep Prairie Loam)">
                US Corn Belt (Mollisol Deep Prairie Loam) — High baseline SOM, High drainage capacity
              </option>
              <option value="Northern Great Plains (Chernozem / Ustolls)">
                Northern Great Plains (Chernozem / Ustolls) — Cold temperate semi-arid dryland
              </option>
              <option value="Southern Mississippi Delta (Alfisol / Vertisol)">
                Southern Mississippi Delta (Alfisol / Vertisol) — High clay shrinkage, Subtropical humid
              </option>
              <option value="Pacific Northwest (Andisol / Inceptisol)">
                Pacific Northwest (Andisol / Inceptisol) — Volcanic ash influence, High P-retention
              </option>
              <option value="Western European Atlantic (Luvisol / Cambisol)">
                Western European Atlantic (Luvisol / Cambisol) — Humid temperate maritime
              </option>
              <option value="South American Pampas (Mollisol / Phaeozem)">
                South American Pampas (Mollisol / Phaeozem) — Deep fertile grassland soils
              </option>
            </select>
            <p className="text-[11px] text-stone-500 mt-1">
              Provides default SSURGO pedotransfer functions and empirical COMET-Farm v1.4 coefficients for new fields.
            </p>
          </div>

          {/* Program & Supply Chain Classification */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Target Program / Supply Chain Scope
            </label>
            <input
              type="text"
              value={scope3Category}
              onChange={(e) => setScope3Category(e.target.value)}
              placeholder="e.g. Corn & Soybean Direct Farm Supply"
              className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Data Sovereignty Guarantee Box */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-400 space-y-1">
              <span className="font-semibold text-stone-200">100% Sovereign Farmer Data Rights (PRD-17 Covenant)</span>
              <p>
                All spatial coordinates, field boundaries, and practice logs recorded under this farm remain the sole property of the grower. Data is encrypted at rest (AES-256) and never commercialized without express authorization.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-stone-400 hover:text-stone-200 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!farmName.trim()}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none text-stone-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <span>Create Farm &amp; Proceed to Field Mapping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
