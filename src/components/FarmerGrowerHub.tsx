import React, { useState } from 'react';
import { Farm, Field, PracticeRecord, EmissionFactorConfig } from '../types';
import { 
  Tractor, 
  DollarSign, 
  Sprout, 
  Leaf, 
  Award, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Plus, 
  Upload, 
  Camera, 
  Droplets, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Filter, 
  ChevronRight, 
  Share2, 
  Printer, 
  Sliders,
  Layers,
  Scale,
  Fuel,
  Percent,
  CheckCircle,
  FileSpreadsheet,
  Zap
} from 'lucide-react';

interface JournalEntry {
  id: string;
  fieldId: string;
  fieldName: string;
  type: 'practice' | 'receipt' | 'photo' | 'input' | 'date' | 'soil_test';
  title: string;
  date: string;
  notes: string;
  tag: string;
  evidenceStatus: 'verified' | 'receipt_attached' | 'photo_attached' | 'logged';
  costDeltaUSD?: number;
  carbonDeltaMT?: number;
  attachmentName?: string;
  attachmentPreview?: string;
}

interface FarmerGrowerHubProps {
  currentFarm: Farm;
  fields: Field[];
  onAddPractice?: (fieldId: string, practice: Omit<PracticeRecord, 'id'>) => void;
  onOpenReportModal?: () => void;
  onOpenPricingModal?: () => void;
  onOpenComparisonModal?: () => void;
  onOpenLineageModal?: (field: Field) => void;
  config?: EmissionFactorConfig;
}

export const FarmerGrowerHub: React.FC<FarmerGrowerHubProps> = ({
  currentFarm,
  fields,
  onAddPractice,
  onOpenReportModal,
  onOpenPricingModal,
  onOpenComparisonModal,
  onOpenLineageModal,
  config,
}) => {
  // Navigation Tabs matching PRD specifications
  const [activeModule, setActiveModule] = useState<
    'my_farm' | 'roi_calculator' | 'what_next' | 'grant_readiness' | 'farm_journal' | 'before_after' | 'narrative_report'
  >('my_farm');

  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id || '');
  const activeField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  // Toast feedback
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // =========================================================
  // 3.5 DIGITAL FARM JOURNAL STATE & MOCK SEED DATA
  // =========================================================
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: 'j-1',
      fieldId: fields[0]?.id || 'f-1',
      fieldName: fields[0]?.name || 'North 80 Prairie Loam',
      type: 'practice',
      title: 'Winter Cereal Rye Air-Drilled at 55 lbs/acre',
      date: '2026-09-22',
      notes: 'Planted directly into standing corn stalks using John Deere 1890 40-ft no-till air drill.',
      tag: 'Cover Crop',
      evidenceStatus: 'receipt_attached',
      costDeltaUSD: -28.50,
      carbonDeltaMT: 38.4,
      attachmentName: 'Invoice_AlbertLeaSeed_Lot9481.pdf',
    },
    {
      id: 'j-2',
      fieldId: fields[0]?.id || 'f-1',
      fieldName: fields[0]?.name || 'North 80 Prairie Loam',
      type: 'soil_test',
      title: '0–30 cm Deep Soil Core LECO Dry Combustion Test',
      date: '2026-09-18',
      notes: 'Lab analysis showed baseline SOC at 2.45% (54.2 t C/ha stock), bulk density 1.28 g/cm³.',
      tag: 'Soil Sampling',
      evidenceStatus: 'verified',
      carbonDeltaMT: 0,
      attachmentName: 'MidwestAgLabs_SOC_Report_7721.pdf',
    },
    {
      id: 'j-3',
      fieldId: fields[1]?.id || fields[0]?.id || 'f-2',
      fieldName: fields[1]?.name || 'South Creek Bottomland',
      type: 'input',
      title: 'Variable-Rate Nitrogen Side-Dress (135 lbs N/ac)',
      date: '2026-06-12',
      notes: 'Reduced application by 30 lbs N/acre vs historical 165 lbs baseline based on pre-sidedress nitrate test.',
      tag: '4R Nutrient Mgmt',
      evidenceStatus: 'verified',
      costDeltaUSD: 18.20,
      carbonDeltaMT: 22.0,
      attachmentName: 'JohnDeere_OpsCenter_AsApplied_Map.geojson',
    },
    {
      id: 'j-4',
      fieldId: fields[0]?.id || 'f-1',
      fieldName: fields[0]?.name || 'North 80 Prairie Loam',
      type: 'photo',
      title: 'Geotagged Cover Crop Green-Up Photograph',
      date: '2026-05-04',
      notes: 'Overwintered rye canopy height reached 14 inches prior to roller crimper termination.',
      tag: 'Photo Evidence',
      evidenceStatus: 'photo_attached',
      attachmentName: 'Field_Canopy_IMG_8492.jpg',
    }
  ]);

  // Quick entry form state
  const [journalEntryType, setJournalEntryType] = useState<'practice' | 'receipt' | 'photo' | 'input' | 'date' | 'soil_test'>('practice');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalNotes, setJournalNotes] = useState('');
  const [journalFieldId, setJournalFieldId] = useState(fields[0]?.id || '');
  const [journalCostDelta, setJournalCostDelta] = useState<number>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleCreateJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim()) return;

    const targetFld = fields.find((f) => f.id === journalFieldId) || fields[0];
    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      fieldId: targetFld.id,
      fieldName: targetFld.name,
      type: journalEntryType,
      title: journalTitle,
      date: new Date().toISOString().slice(0, 10),
      notes: journalNotes || 'Recorded in Digital Farm Journal mobile quick-entry.',
      tag: journalEntryType === 'practice' ? 'Practice Log' : journalEntryType === 'receipt' ? 'Receipt Evidence' : journalEntryType === 'photo' ? 'Photo Proof' : journalEntryType === 'input' ? 'Input Record' : 'Agronomic Event',
      evidenceStatus: uploadedFileName ? (journalEntryType === 'photo' ? 'photo_attached' : 'receipt_attached') : 'logged',
      costDeltaUSD: journalCostDelta || undefined,
      carbonDeltaMT: journalEntryType === 'practice' ? Math.round(targetFld.acreage * 0.45) : undefined,
      attachmentName: uploadedFileName || (journalEntryType === 'receipt' ? 'Receipt_Upload.pdf' : journalEntryType === 'photo' ? 'Field_Photo.jpg' : undefined)
    };

    setJournalEntries([newEntry, ...journalEntries]);

    // If it's a practice, also append to field practice ledger
    if (journalEntryType === 'practice' && onAddPractice) {
      onAddPractice(targetFld.id, {
        fieldId: targetFld.id,
        practiceType: 'cover_crop',
        title: journalTitle,
        dateImplemented: new Date().toISOString().slice(0, 10),
        details: journalNotes || 'Logged via Digital Farm Journal quick-entry.',
        status: 'self_reported',
        emissionReductionFactor: 0.46,
        carbonEstimateMT: Math.round(targetFld.acreage * 0.46),
        acreageApplied: targetFld.acreage,
      });
    }

    setJournalTitle('');
    setJournalNotes('');
    setUploadedFileName('');
    setJournalCostDelta(0);
    showFeedback(`Saved entry "${newEntry.title}" to Farm Journal! Evidence chain updated.`);
  };

  // =========================================================
  // 3.2 PRACTICE ROI CALCULATOR STATE
  // =========================================================
  const [selectedRoiPractice, setSelectedRoiPractice] = useState<'cover_crops' | 'no_till' | 'nitrogen_opt' | 'compost_biochar' | 'rotational_grazing'>('cover_crops');
  const [simulatedAcreage, setSimulatedAcreage] = useState<number>(activeField?.acreage || 160);

  const ROI_PRACTICE_DATA = {
    cover_crops: {
      name: 'High-Residue Multi-Species Cover Crops',
      costPerAcre: 28.50, // Seed + seeding pass
      savingsPerAcre: 19.20, // Fertilizer reduction + weed suppression chemical savings
      yieldDeltaPct: 3.5, // +3.5% yield gain from water retention and organic matter
      yieldDeltaValueUSD: 24.80, // bu value
      carbonRateMTPerAc: 0.46,
      carbonRevenueUSD: 13.80, // @ $30/t
      grantIncentiveUSD: 35.00, // USDA EQIP / CSP annual cost-share
      laborHoursPerAc: 0.25,
      paybackPeriodYears: 1.0,
      description: 'Seeds a winter rye + hairy vetch blend into standing cash crops or post-harvest to prevent erosion and build topsoil nitrogen.'
    },
    no_till: {
      name: 'Continuous No-Till & Residue Preservation',
      costPerAcre: 8.00, // Specialized opener maintenance
      savingsPerAcre: 26.50, // Fuel savings (3.4 gal/ac saved) + reduced equipment wear
      yieldDeltaPct: 2.0,
      yieldDeltaValueUSD: 14.20,
      carbonRateMTPerAc: 0.51,
      carbonRevenueUSD: 15.30,
      grantIncentiveUSD: 25.00,
      laborHoursPerAc: -0.40, // 40% time saved per acre
      paybackPeriodYears: 0.8,
      description: 'Eliminates deep moldboard and chisel plowing passes, leaving 100% crop residue armor to preserve fungal mycorrhizae and soil moisture.'
    },
    nitrogen_opt: {
      name: 'Precision 4R Variable-Rate Nitrogen Reduction (20%)',
      costPerAcre: 6.50, // Grid soil sampling & VRT prescription
      savingsPerAcre: 31.00, // 30 lbs/ac synthetic N saved
      yieldDeltaPct: 0.0, // Neutral yield with higher protein efficiency
      yieldDeltaValueUSD: 0.00,
      carbonRateMTPerAc: 0.25,
      carbonRevenueUSD: 7.50,
      grantIncentiveUSD: 18.00,
      laborHoursPerAc: 0.05,
      paybackPeriodYears: 0.5,
      description: 'Splits nitrogen applications into V6 side-dress with optical sensor calibration, avoiding spring leaching and N₂O atmospheric emissions.'
    },
    compost_biochar: {
      name: 'Recalcitrant Biochar & Aerobic Compost Amendment',
      costPerAcre: 55.00,
      savingsPerAcre: 18.00,
      yieldDeltaPct: 5.5,
      yieldDeltaValueUSD: 39.00,
      carbonRateMTPerAc: 1.20,
      carbonRevenueUSD: 36.00,
      grantIncentiveUSD: 45.00,
      laborHoursPerAc: 0.50,
      paybackPeriodYears: 1.4,
      description: 'Applies pyrolyzed organic biomass to lock recalcitrant carbon permanently into topsoil while increasing Cation Exchange Capacity (CEC).'
    },
    rotational_grazing: {
      name: 'Adaptive Multi-Paddock (AMP) Grazing Rotation',
      costPerAcre: 14.00, // Moveable polywire fencing
      savingsPerAcre: 38.00, // Reduced bought hay/forage & synthetic inputs
      yieldDeltaPct: 6.0,
      yieldDeltaValueUSD: 32.00,
      carbonRateMTPerAc: 0.72,
      carbonRevenueUSD: 21.60,
      grantIncentiveUSD: 30.00,
      laborHoursPerAc: 0.35,
      paybackPeriodYears: 0.9,
      description: 'Moves livestock every 24–48 hours across paddocks to stimulate deep root exudates and rapid humic matter decomposition.'
    }
  };

  const currentRoi = ROI_PRACTICE_DATA[selectedRoiPractice];
  const netImpactPerAcre = (currentRoi.savingsPerAcre + currentRoi.yieldDeltaValueUSD + currentRoi.carbonRevenueUSD + currentRoi.grantIncentiveUSD) - currentRoi.costPerAcre;
  const totalFarmNetImpact = Math.round(netImpactPerAcre * simulatedAcreage);

  // =========================================================
  // 3.3 "WHAT SHOULD I DO NEXT?" ASSISTANT DATA
  // =========================================================
  const recommendations = [
    {
      id: 'rec-1',
      targetFieldId: fields[0]?.id || 'f-1',
      targetFieldName: fields[0]?.name || 'North 80 Prairie Loam',
      priority: 'High Priority',
      badgeClass: 'bg-rose-950 text-rose-300 border-rose-800',
      title: 'Evaluate Cover Crop + No-Till Transition on North Section',
      why: 'Your north field has a 12% lower root-zone moisture holding capacity during July dry spells and high synthetic nitrogen expenditure ($84/ac).',
      cost: '$28.50 / acre initial seed & seeding pass',
      benefit: '+$44.30 / acre net return from fertilizer savings, moisture retention, and USDA EQIP cost-share.',
      steps: [
        'Select Winter Cereal Rye seed lot (55 lbs/ac seed rate).',
        'Schedule high-clearance inter-seeding drill for early September canopy pass.',
        'Upload seed purchase invoice to Digital Farm Journal to log grant verification evidence.'
      ],
      evidenceRequired: 'Seed invoice lot number, tractor GPS task controller file, spring emergence photograph.',
      suggestedPractice: 'High-Residue Multi-Species Cover Seeding'
    },
    {
      id: 'rec-2',
      targetFieldId: fields[1]?.id || fields[0]?.id || 'f-2',
      targetFieldName: fields[1]?.name || 'South Creek Bottomland',
      priority: 'Medium Opportunity',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
      title: 'Split-Apply Nitrogen at V6 Stage with 20% Rate Reduction',
      why: 'Historical rainfall data indicates 28% of fall-applied anhydrous is lost to spring tile drainage runoff.',
      cost: '$6.50 / acre variable-rate prescription fee',
      benefit: '+$24.50 / acre input savings with zero grain fill penalty.',
      steps: [
        'Run pre-sidedress soil nitrate test (PSNT) in late May.',
        'Calibrate high-clearance applicator to 135 lbs N/ac side-dress rate.',
        'Log as-applied map to satisfy GHG Protocol Scope 3 supply chain audit.'
      ],
      evidenceRequired: 'Soil nitrate test lab sheet, as-applied telemetry shapefile.',
      suggestedPractice: 'Precision 4R Variable-Rate Nitrogen Reduction'
    }
  ];

  // =========================================================
  // 3.4 GRANT READINESS CENTER STATE & CHECKLIST
  // =========================================================
  const [grantChecklist, setGrantChecklist] = useState([
    { id: 'gc-1', label: 'Field boundary GIS coordinates digitised & verified', completed: true, points: 20 },
    { id: 'gc-2', label: 'Baseline Soil Organic Carbon (SOC) lab test (< 24 months)', completed: true, points: 25 },
    { id: 'gc-3', label: 'Previous-season fertilizer purchase receipts & rate logs', completed: true, points: 20 },
    { id: 'gc-4', label: 'Multi-year Sentinel-2 NDVI satellite vegetative history linked', completed: true, points: 15 },
    { id: 'gc-5', label: 'Detailed 3-year regenerative practice transition plan logged', completed: false, points: 10 },
    { id: 'gc-6', label: 'USDA FSA Farm & Tract Number registered (Form 578)', completed: false, points: 10 },
  ]);

  const toggleChecklistItem = (id: string) => {
    setGrantChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const grantReadinessScore = grantChecklist.reduce((acc, item) => acc + (item.completed ? item.points : 0), 0);

  const handleDownloadGrantPacket = () => {
    const packetContent = `=====================================================
USDA EQIP & CSP GRANT APPLICATION EVIDENCE PACKET
TERRASOIL FARMING PORTAL - AUDIT-READY SUMMARY
=====================================================

FARM & GROWER OVERVIEW:
Farm Name: ${currentFarm.name}
Grower / Operator: ${currentFarm.ownerName}
Region: ${currentFarm.region}, ${currentFarm.stateOrCountry}
Total Enrolled Landholding: ${currentFarm.totalAcreage} Acres
Audit Readiness Score: ${grantReadinessScore}%

PARCEL SUMMARY & ENROLLED FIELDS:
${fields.map((f, i) => `
[Field ${i + 1}] ${f.name}
- Acreage: ${f.acreage} ac
- Current Standing Rotation: ${f.cropType}
- Soil Classification Order: ${f.soilClassification}
- Baseline SOC: ${f.baselineSOCPct}% (Carbon Stock: ${f.baselineSOCStockTonsPerHa} t C/ha)
- Current Sentinel-2 NDVI Health: ${f.currentNDVI} (${f.ndviTrend})
- Verified Practices Logged: ${f.practices.length}
- Annual Gross CO2e Sequestration: ${f.carbonBreakdown.totalGrossMT} MT/yr
`).join('\n')}

VERIFIED REGENERATIVE PRACTICE EVIDENCE LEDGER:
${journalEntries.map((j, i) => `
#${i + 1} Date: ${j.date} | Field: ${j.fieldName} | Type: ${j.tag}
Title: ${j.title}
Evidence Status: ${j.evidenceStatus.toUpperCase()}
Attachment: ${j.attachmentName || 'None'}
Notes: ${j.notes}
`).join('\n')}

GRANT COMPLIANCE CHECKLIST:
${grantChecklist.map((c) => `[${c.completed ? 'X' : ' '}] ${c.label}`).join('\n')}

=====================================================
Attestation: Data captured via Sentinel-2 Copernicus Multispectral & ISO-XML Tractor CAN-Bus.
Generated on: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([packetContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `USDA_Grant_Packet_${currentFarm.name.replace(/\s+/g, '_')}_2026.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showFeedback('Downloaded USDA EQIP/CSP Grant Application Packet!');
  };

  // =========================================================
  // 3.6 BEFORE / AFTER COMPARATIVE TRACKER DATA
  // =========================================================
  const beforeAfterMetrics = [
    {
      label: 'Topsoil Soil Organic Carbon (0–30 cm)',
      baseline: '2.10% SOC',
      implementation: '2.28% (Year 1)',
      results: `${activeField.baselineSOCPct.toFixed(2)}% SOC`,
      delta: `+${((activeField.baselineSOCPct - 2.10) / 2.10 * 100).toFixed(1)}%`,
      isPositive: true,
      plainExplanation: 'Higher organic matter buffers against mid-summer heat stress and boosts fertilizer absorption.'
    },
    {
      label: 'Corn / Soybean Yield Average',
      baseline: '178.0 bu/ac',
      implementation: '183.5 bu/ac',
      results: '191.2 bu/ac',
      delta: '+7.4% (+13.2 bu)',
      isPositive: true,
      plainExplanation: 'Deeper root channels and microbial nutrient release yield heavier, more uniform grain fill.'
    },
    {
      label: 'Annual Input & Fertilizer Expenditure',
      baseline: '$148.00 / ac',
      implementation: '$134.00 / ac',
      results: '$121.50 / ac',
      delta: '-$26.50 / ac (-17.9%)',
      isPositive: true,
      plainExplanation: 'Cover crop nitrogen scavenging and 4R split applications reduced synthetic fertilizer purchases.'
    },
    {
      label: 'Diesel Fuel Consumption',
      baseline: '5.2 gal / ac',
      implementation: '3.1 gal / ac',
      results: '1.8 gal / ac',
      delta: '-3.4 gal/ac (-65.4%)',
      isPositive: true,
      plainExplanation: 'Replacing primary moldboard plowing with direct no-till air drilling saved $14.28/acre in fuel.'
    },
    {
      label: 'On-Farm GHG Emissions Footprint',
      baseline: '1.45 MT CO₂e / ac',
      implementation: '0.95 MT CO₂e / ac',
      results: '0.62 MT CO₂e / ac',
      delta: '-57.2% reduction',
      isPositive: true,
      plainExplanation: 'Lower diesel combustion and reduced N₂O emissions from optimized nitrogen fertilizer application.'
    },
    {
      label: 'Net Soil Carbon Insetting Benefit',
      baseline: '$0.00 / ac',
      implementation: '$13.80 / ac',
      results: `$${(activeField.carbonBreakdown.totalNetPerAcre * 30).toFixed(2)} / ac`,
      delta: `+$${(activeField.carbonBreakdown.totalNetPerAcre * 30).toFixed(2)} / ac`,
      isPositive: true,
      plainExplanation: 'Estimated voluntary insetting value based on verified regenerative practices at $30/ton baseline.'
    }
  ];

  // =========================================================
  // 3.7 PLAIN-LANGUAGE NARRATIVE REPORT OUTPUT
  // =========================================================
  const narrativeText = `GROWER PERFORMANCE & REGENERATIVE PROGRESS REPORT
Farm: ${currentFarm.name} (${currentFarm.ownerName})
Location: ${currentFarm.region}, ${currentFarm.stateOrCountry} | Total Landholding: ${currentFarm.totalAcreage} Acres
Reporting Period: 2024–2026 Management Cycle

SUMMARY FOR GROWER & LENDER:
Since adopting regenerative soil-management practices on ${currentFarm.name}, your fields have demonstrated measurable improvements across financial cost savings, soil moisture resilience, and carbon sequestration.

1. FUEL & INPUT SAVINGS:
By switching to continuous no-till and high-residue cover cropping, you have reduced diesel fuel use by approximately 3.4 gallons per acre across your ${currentFarm.totalAcreage} acres. Total fertilizer expenditures have decreased by $26.50/acre due to enhanced biological nitrogen fixation from cover crops.

2. SOIL HEALTH & ROOT HYDRATION:
Topsoil organic carbon measurements have increased from a baseline of 2.10% to an active level of ${activeField.baselineSOCPct.toFixed(2)}%. Each 1% increase in organic matter retains approximately 27,000 gallons of additional water per acre, significantly buffering your fields during dry summer spells.

3. YIELD & REVENUE IMPACT:
Grain yields have remained resilient, averaging +7.4% above historical county benchmarks. When combining fertilizer cost savings ($26.50/ac), yield stability, and potential carbon insetting credits ($${(activeField.carbonBreakdown.totalNetPerAcre * 30).toFixed(2)}/ac), the estimated annual net economic benefit across your farm is approximately $${(currentFarm.totalAcreage * 48.20).toLocaleString()}.

4. COMPLIANCE & GRANT READINESS:
With ${journalEntries.length} verified practice entries logged in your digital journal and an active grant readiness score of ${grantReadinessScore}%, this farm is well-positioned for USDA EQIP, CSP, and corporate Scope 3 supply chain insetting programs.`;

  const [copiedNarrative, setCopiedNarrative] = useState(false);
  const handleCopyNarrative = () => {
    navigator.clipboard.writeText(narrativeText);
    setCopiedNarrative(true);
    setTimeout(() => setCopiedNarrative(false), 3000);
    showFeedback('Copied Plain-Language Narrative Report to clipboard!');
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      
      {/* Toast message */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950 border border-emerald-500/80 rounded-2xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 shadow-md">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Farmer &amp; Grower Suite &bull; Phase 2 PRD
              </span>
              <span className="text-stone-600">&bull;</span>
              <span className="text-xs text-stone-400 font-medium">Simple, Visual, Financial</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
              <span>"What should I do on my farm, what will it cost, and what will I get back?"</span>
            </h3>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          {onOpenComparisonModal && (
            <button
              onClick={onOpenComparisonModal}
              className="bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compare Fields</span>
            </button>
          )}

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Reports</span>
            </button>
          )}
        </div>
      </div>

      {/* Feature Navigation Tabs (All 7 PRD Features) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveModule('my_farm')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'my_farm'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>3.1 "My Farm" Dashboard (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('farm_journal')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'farm_journal'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span>3.5 Digital Farm Journal (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('roi_calculator')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'roi_calculator'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>3.2 Practice ROI Calculator (P0)</span>
        </button>

        <button
          onClick={() => setActiveModule('what_next')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'what_next'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>3.3 "What Next?" Assistant (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('grant_readiness')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'grant_readiness'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>3.4 Grant Readiness Center (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('before_after')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'before_after'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>3.6 Before / After Tracker (P1)</span>
        </button>

        <button
          onClick={() => setActiveModule('narrative_report')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeModule === 'narrative_report'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-rose-400" />
          <span>3.7 Plain-Language Report (P1)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3.1 "MY FARM" DASHBOARD (P0) */}
      {/* ========================================================= */}
      {activeModule === 'my_farm' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Plain-Language Hero KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Soil Carbon */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                <span>Topsoil Health &amp; Carbon</span>
                <span className="p-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                Soil Carbon &uarr; 8.2%
              </div>
              <p className="text-xs text-stone-400">
                Avg baseline {activeField.baselineSOCPct.toFixed(2)}% SOC &bull; Stores +14,200 gal water/ac
              </p>
            </div>

            {/* Card 2: GHG Footprint */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                <span>Farm Emissions Intensity</span>
                <span className="p-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                GHG Footprint &darr; 11%
              </div>
              <p className="text-xs text-stone-400">
                -0.83 MT CO₂e/ac reduced via no-till &amp; nitrogen split
              </p>
            </div>

            {/* Card 3: Input Cost */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                <span>Input &amp; Diesel Savings</span>
                <span className="p-1 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
                Input Cost &darr; $14/acre
              </div>
              <p className="text-xs text-stone-400">
                ${(currentFarm.totalAcreage * 14).toLocaleString()} total annual cash savings across farm
              </p>
            </div>

            {/* Card 4: Active Practices */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
                <span>Verified Field Actions</span>
                <span className="p-1 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-stone-100">
                {fields.reduce((acc, f) => acc + f.practices.length, 0)} practices active
              </div>
              <p className="text-xs text-stone-400">
                {fields.length} parcels &bull; {currentFarm.totalAcreage.toLocaleString()} enrolled acres
              </p>
            </div>

          </div>

          {/* Farm Performance Operational Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Enrolled Field Health & Status */}
            <div className="lg:col-span-7 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  Field Health, Practice Adoption &amp; Water Retention
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {fields.length} Mapped Parcels
                </span>
              </div>

              <div className="space-y-3">
                {fields.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFieldId(f.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-wrap items-center justify-between gap-3 ${
                      f.id === selectedFieldId
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                        : 'bg-stone-900 border-stone-800/80 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-100 text-xs">{f.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {f.acreage} ac &bull; {f.cropType}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Soil: <span className="text-stone-300 font-medium">{f.soilClassification}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-[10px] text-stone-400 font-mono">Topsoil SOC</div>
                        <div className="text-xs font-bold font-mono text-emerald-400">{f.baselineSOCPct}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 font-mono">NDVI Greenness</div>
                        <div className="text-xs font-bold font-mono text-cyan-400">{f.currentNDVI}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 font-mono">Annual Net</div>
                        <div className="text-xs font-bold font-mono text-amber-300">+{f.carbonBreakdown.totalGrossMT} MT</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quick Action Guidance & Field Spotlight */}
            <div className="lg:col-span-5 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Active Field Spotlight: {activeField.name}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 font-mono">Soil Moisture Resilience</span>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-200">Root-zone hydration:</span>
                    <span className="font-bold font-mono text-emerald-400">{activeField.rootZoneMoisturePct}% VWC (Optimal)</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 font-mono">Estimated Financial Insetting Benefit</span>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-200">Annual credit value (@ $30/MT):</span>
                    <span className="font-bold font-mono text-amber-300">
                      ${Math.round(activeField.carbonBreakdown.totalGrossMT * 30).toLocaleString()} / yr
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 font-mono">Logged Regenerative Activities</span>
                  <div className="text-stone-300">
                    {activeField.practices.length > 0
                      ? activeField.practices.map((p) => p.title).join(' &bull; ')
                      : 'No practices recorded yet. Use the Digital Farm Journal to log your first action.'}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setActiveModule('farm_journal')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick-Log Field Event</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.5 DIGITAL FARM JOURNAL (P0, MOBILE-FIRST) */}
      {/* ========================================================= */}
      {activeModule === 'farm_journal' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Quick-Entry Mobile Form */}
            <div className="lg:col-span-5 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  Quick-Entry Mobile Farm Journal
                </span>
                <span className="text-[10px] text-stone-400 font-mono">P0 Core Evidence Feed</span>
              </div>

              <form onSubmit={handleCreateJournalEntry} className="space-y-3.5 text-xs">
                
                {/* Entry Type Selector */}
                <div className="space-y-1">
                  <label className="text-stone-400 font-semibold block">Action Type:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'practice', label: 'Practice', icon: Sprout },
                      { id: 'receipt', label: 'Receipt', icon: Upload },
                      { id: 'photo', label: 'Photo', icon: Camera },
                      { id: 'input', label: 'Input Log', icon: Fuel },
                      { id: 'date', label: 'Plant/Harvest', icon: Calendar },
                      { id: 'soil_test', label: 'Soil Core', icon: Layers },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setJournalEntryType(btn.id as any)}
                        className={`p-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
                          journalEntryType === btn.id
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                        }`}
                      >
                        <btn.icon className="w-3 h-3" />
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Field */}
                <div className="space-y-1">
                  <label className="text-stone-400 font-semibold block">Target Field:</label>
                  <select
                    value={journalFieldId}
                    onChange={(e) => setJournalFieldId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {fields.map((f) => (
                      <option key={`j-field-${f.id}`} value={f.id}>
                        {f.name} ({f.acreage} ac)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entry Title */}
                <div className="space-y-1">
                  <label className="text-stone-400 font-semibold block">Title / Summary:</label>
                  <input
                    type="text"
                    required
                    placeholder={
                      journalEntryType === 'practice'
                        ? 'e.g. Winter cereal rye air-drilled at 55 lbs/ac'
                        : journalEntryType === 'receipt'
                        ? 'e.g. Seed purchase invoice (Lot #CR-9481)'
                        : journalEntryType === 'photo'
                        ? 'e.g. Emergence photo: 12-inch rye canopy'
                        : 'e.g. Variable-rate side-dress (135 lbs N/ac)'
                    }
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-emerald-500 placeholder-stone-600"
                  />
                </div>

                {/* Cost Delta or Notes */}
                <div className="space-y-1">
                  <label className="text-stone-400 font-semibold block">Notes &amp; Details:</label>
                  <textarea
                    rows={2}
                    placeholder="Implement used, weather conditions, seed supplier lot number..."
                    value={journalNotes}
                    onChange={(e) => setJournalNotes(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-emerald-500 placeholder-stone-600"
                  />
                </div>

                {/* Simulated File Attachment Upload */}
                <div className="p-3 bg-stone-900/80 border border-dashed border-stone-700 rounded-xl space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-stone-400 text-xs">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Attach receipt, seed tag, or photo proof:</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadedFileName(`Invoice_${Date.now().toString().slice(-4)}.pdf`)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono"
                    >
                      + Sim Invoice PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadedFileName(`FieldPhoto_${Date.now().toString().slice(-4)}.jpg`)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono"
                    >
                      + Sim Geotagged Photo
                    </button>
                  </div>
                  {uploadedFileName && (
                    <div className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> Attached: {uploadedFileName}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Entry to Evidence Feed</span>
                </button>
              </form>
            </div>

            {/* Right: Live Evidence Timeline Feed */}
            <div className="lg:col-span-7 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Digital Farm Journal Timeline ({journalEntries.length} Records)
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Powers Grant &amp; Carbon Audits</span>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2 hover:border-stone-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-stone-950 text-emerald-400 text-[10px] font-mono font-bold border border-stone-800">
                          {entry.tag}
                        </span>
                        <span className="text-xs font-bold text-stone-100">{entry.title}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">{entry.date}</span>
                    </div>

                    <p className="text-xs text-stone-300">{entry.notes}</p>

                    <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-stone-400">Field: <strong className="text-stone-200">{entry.fieldName}</strong></span>

                      <div className="flex items-center gap-2">
                        {entry.attachmentName && (
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            {entry.attachmentName}
                          </span>
                        )}

                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          entry.evidenceStatus === 'verified'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-stone-950 text-stone-400 border border-stone-800'
                        }`}>
                          {entry.evidenceStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.2 PRACTICE ROI CALCULATOR (P0) */}
      {/* ========================================================= */}
      {activeModule === 'roi_calculator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Practice Select Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'cover_crops', label: 'Cover Cropping' },
              { id: 'no_till', label: 'Continuous No-Till' },
              { id: 'nitrogen_opt', label: '4R Nitrogen Reduction' },
              { id: 'compost_biochar', label: 'Biochar / Compost' },
              { id: 'rotational_grazing', label: 'Rotational Grazing' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedRoiPractice(p.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedRoiPractice === p.id
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Financial & Agronomic Breakdown Table */}
            <div className="lg:col-span-7 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div>
                  <h4 className="text-sm font-bold text-stone-100">{currentRoi.name}</h4>
                  <p className="text-xs text-stone-400">{currentRoi.description}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                  <span className="text-stone-300">1. Implementation Cost per Acre (Seed + Pass):</span>
                  <span className="font-mono font-bold text-rose-400">-${currentRoi.costPerAcre.toFixed(2)} / ac</span>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                  <span className="text-stone-300">2. Fertilizer &amp; Fuel Savings:</span>
                  <span className="font-mono font-bold text-emerald-400">+${currentRoi.savingsPerAcre.toFixed(2)} / ac</span>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                  <span className="text-stone-300">3. Yield Effect (+{currentRoi.yieldDeltaPct}%):</span>
                  <span className="font-mono font-bold text-emerald-400">+${currentRoi.yieldDeltaValueUSD.toFixed(2)} / ac</span>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                  <span className="text-stone-300">4. Soil Carbon Insetting Credit (+{currentRoi.carbonRateMTPerAc} MT @ $30):</span>
                  <span className="font-mono font-bold text-amber-300">+${currentRoi.carbonRevenueUSD.toFixed(2)} / ac</span>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                  <span className="text-stone-300">5. Potential USDA EQIP / CSP Cost-Share:</span>
                  <span className="font-mono font-bold text-purple-400">+${currentRoi.grantIncentiveUSD.toFixed(2)} / ac</span>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-sm">
                  <span className="font-bold text-stone-100">Net Annual Impact:</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    +${netImpactPerAcre.toFixed(2)} / acre / year
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Farm Totals & Payback */}
            <div className="lg:col-span-5 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <span className="text-xs font-bold text-stone-200">Total Farm Impact Simulator</span>
                  <span className="text-xs text-stone-400 font-mono">
                    {simulatedAcreage} Applied Acres
                  </span>
                </div>

                {/* Acreage Slider */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-stone-300">
                    <span>Enrolled Farm Acreage:</span>
                    <span className="font-bold font-mono text-amber-400">{simulatedAcreage} acres</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={currentFarm.totalAcreage * 1.5}
                    step={10}
                    value={simulatedAcreage}
                    onChange={(e) => setSimulatedAcreage(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Big Net Annual Dollar Card */}
                <div className="p-4 bg-gradient-to-br from-stone-900 to-amber-950/40 border border-amber-800/60 rounded-2xl space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">
                    Projected Annual Farm Net Return
                  </span>
                  <div className="text-3xl font-bold font-mono text-amber-300">
                    +${totalFarmNetImpact.toLocaleString()} / yr
                  </div>
                  <span className="text-xs text-stone-400 block">
                    Combines input savings + yield gains + USDA grants + carbon value
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-center">
                    <span className="text-[10px] text-stone-400 font-mono block">Payback Period</span>
                    <span className="font-bold font-mono text-stone-200">{currentRoi.paybackPeriodYears} Seasons</span>
                  </div>
                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-center">
                    <span className="text-[10px] text-stone-400 font-mono block">Labor Delta</span>
                    <span className="font-bold font-mono text-stone-200">
                      {currentRoi.laborHoursPerAc > 0 ? `+${currentRoi.laborHoursPerAc}` : currentRoi.laborHoursPerAc} hrs/ac
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    if (onAddPractice && activeField) {
                      onAddPractice(activeField.id, {
                        fieldId: activeField.id,
                        practiceType: selectedRoiPractice === 'cover_crops' ? 'cover_crop' : selectedRoiPractice === 'no_till' ? 'no_till' : 'fertilizer_reduction',
                        title: currentRoi.name,
                        dateImplemented: new Date().toISOString().slice(0, 10),
                        details: `Adopted from Practice ROI Calculator scenario for ${simulatedAcreage} acres.`,
                        status: 'self_reported',
                        emissionReductionFactor: currentRoi.carbonRateMTPerAc,
                        carbonEstimateMT: Math.round(simulatedAcreage * currentRoi.carbonRateMTPerAc),
                        acreageApplied: simulatedAcreage,
                      });
                      showFeedback(`Applied "${currentRoi.name}" to ${activeField.name}! Carbon & farm ROI updated.`);
                    }
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adopt this Practice on {activeField.name}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.3 "WHAT SHOULD I DO NEXT?" ASSISTANT (P1) */}
      {/* ========================================================= */}
      {activeModule === 'what_next' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-stone-100">
                Actionable Agronomic &amp; Financial Guidance Engine
              </h4>
              <p className="text-xs text-stone-400">
                Plain-language recommendations grounded in field soil cores, satellite moisture, and regional USDA cost-shares.
              </p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-stone-950 border border-stone-800 px-3 py-1 rounded-xl font-bold">
              {recommendations.length} Active Opportunities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4 relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${rec.badgeClass}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-stone-400 font-mono">
                      Field: {rec.targetFieldName}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-100">{rec.title}</h4>

                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1 text-xs">
                    <span className="font-bold text-purple-400 font-mono text-[10px] block uppercase">Why this field:</span>
                    <p className="text-stone-300">{rec.why}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-400 font-mono block">Estimated Cost</span>
                      <span className="font-bold font-mono text-rose-300">{rec.cost}</span>
                    </div>
                    <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800">
                      <span className="text-[10px] text-stone-400 font-mono block">Expected Return</span>
                      <span className="font-bold font-mono text-emerald-400">{rec.benefit}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-stone-300 block">Implementation Steps:</span>
                    <ol className="list-decimal list-inside space-y-1 text-stone-400">
                      {rec.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-2.5 bg-stone-900/50 rounded-xl border border-stone-800/80 text-[11px] text-stone-400">
                    <strong className="text-stone-300">Evidence Needed for Grant/Carbon:</strong> {rec.evidenceRequired}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800">
                  <button
                    onClick={() => {
                      if (onAddPractice) {
                        onAddPractice(rec.targetFieldId, {
                          fieldId: rec.targetFieldId,
                          practiceType: 'cover_crop',
                          title: rec.suggestedPractice,
                          dateImplemented: new Date().toISOString().slice(0, 10),
                          details: rec.title,
                          status: 'self_reported',
                          emissionReductionFactor: 0.46,
                          carbonEstimateMT: 36,
                          acreageApplied: 80,
                        });
                        showFeedback(`Enrolled recommendation "${rec.suggestedPractice}" into field ledger!`);
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply This Recommendation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.4 GRANT READINESS CENTER (P1) */}
      {/* ========================================================= */}
      {activeModule === 'grant_readiness' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Readiness Score & Program Matcher */}
            <div className="lg:col-span-5 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Grant Readiness Score
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Differentiator</span>
                </div>

                <div className="p-4 bg-gradient-to-br from-stone-900 to-emerald-950/40 border border-emerald-800/80 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                    USDA EQIP / CSP Readiness
                  </span>
                  <div className="text-4xl font-bold font-mono text-emerald-400">
                    {grantReadinessScore}%
                  </div>
                  <span className="text-xs text-stone-300 block">
                    {grantReadinessScore >= 80 ? 'Audit-Ready for State & Federal Cost-Shares' : 'Complete 1 more evidence item to reach Tier 1'}
                  </span>
                </div>

                {/* Grant Program Matching Cards */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-200">
                      <span>USDA EQIP (Practice 340 / 329)</span>
                      <span className="text-emerald-400 font-mono">$54–$72/ac</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Multi-species cover crops and no-till residue management incentive.</p>
                  </div>

                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-200">
                      <span>USDA CSP (Conservation Stewardship)</span>
                      <span className="text-emerald-400 font-mono">$40–$55/ac</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Whole-farm organic matter enhancement bundle (5-year contract).</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleDownloadGrantPacket}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Pre-Filled Grant Application Packet</span>
                </button>
              </div>
            </div>

            {/* Right: Interactive Evidence Checklist */}
            <div className="lg:col-span-7 bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Grant Application Evidence Checklist
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Interactive Checklist</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {grantChecklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      item.completed
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-stone-200'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className={item.completed ? 'font-semibold text-stone-100' : ''}>
                        {item.label}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-950 text-emerald-400 border border-stone-800">
                      +{item.points}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 text-[11px] text-stone-400">
                <strong>Grant Tip:</strong> Checking these items verifies that your farm telemetry meets the strict documentation standards required by the USDA NRCS and state conservation boards.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.6 BEFORE / AFTER PRACTICE TRACKER (P1) */}
      {/* ========================================================= */}
      {activeModule === 'before_after' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-stone-100">
                Before / After Regenerative Transition Tracker
              </h4>
              <p className="text-xs text-stone-400">
                <code>Baseline &rarr; Implementation &rarr; Results</code> across soil health, grain yields, input costs, and emissions.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-stone-950 border border-stone-800 px-3 py-1 rounded-xl font-bold">
              Field: {activeField.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beforeAfterMetrics.map((m, idx) => (
              <div
                key={idx}
                className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3 relative hover:border-stone-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200 line-clamp-1">{m.label}</span>
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    {m.delta}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="p-2 bg-stone-900 rounded-xl border border-stone-800/80">
                    <span className="text-[9px] text-stone-500 font-mono block">Baseline (2024)</span>
                    <span className="font-bold text-stone-400 text-[11px]">{m.baseline}</span>
                  </div>
                  <div className="p-2 bg-stone-900 rounded-xl border border-stone-800/80">
                    <span className="text-[9px] text-cyan-400 font-mono block">Adoption (2025)</span>
                    <span className="font-bold text-cyan-300 text-[11px]">{m.implementation}</span>
                  </div>
                  <div className="p-2 bg-emerald-950/40 rounded-xl border border-emerald-800">
                    <span className="text-[9px] text-emerald-400 font-mono block">Verified Result</span>
                    <span className="font-bold text-emerald-300 text-[11px]">{m.results}</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {m.plainExplanation}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3.7 PLAIN-LANGUAGE NARRATIVE REPORT (P1) */}
      {/* ========================================================= */}
      {activeModule === 'narrative_report' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-400" />
                  Plain-Language Farm Narrative Report
                </h4>
                <p className="text-xs text-stone-400">
                  Non-technical narrative for your agronomist, buyer, lender, or grant officer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyNarrative}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedNarrative ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNarrative ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([narrativeText], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Farmer_Narrative_Report_${currentFarm.name.replace(/\s+/g, '_')}.txt`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    showFeedback('Downloaded Plain-Language Narrative Report!');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download TXT</span>
                </button>
              </div>
            </div>

            {/* Narrative Document Preview */}
            <div className="p-5 bg-stone-900 rounded-xl border border-stone-800 text-xs text-stone-200 font-sans leading-relaxed whitespace-pre-line select-text">
              {narrativeText}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
