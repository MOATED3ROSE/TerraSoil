import { FieldNote, FieldNoteCategory, FieldNoteSeverity } from '../types';

export interface FieldNoteCategoryConfig {
  id: FieldNoteCategory;
  label: string;
  iconName: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  description: string;
}

export const FIELD_NOTE_CATEGORIES: FieldNoteCategoryConfig[] = [
  {
    id: 'cover_crop_emergence',
    label: 'Cover Crop & Biomass',
    iconName: 'Sprout',
    color: '#10b981',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
    borderColor: '#10b981',
    description: 'Groundcover density, stand emergence, roller-crimping termination condition, or biomass growth rate.',
  },
  {
    id: 'soil_compaction',
    label: 'Soil Compaction',
    iconName: 'Footprints',
    color: '#f59e0b',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700',
    borderColor: '#f59e0b',
    description: 'Plow pan, headland wheel traffic compaction, penetration resistance, or root restriction zones.',
  },
  {
    id: 'moisture_ponding',
    label: 'Moisture / Ponding',
    iconName: 'Droplets',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-700',
    borderColor: '#06b6d4',
    description: 'Surface waterlogging, ephemeral ponding post-storm, localized drought stress, or perched water tables.',
  },
  {
    id: 'tile_drainage',
    label: 'Tile Line / Drainage',
    iconName: 'GitFork',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-700',
    borderColor: '#8b5cf6',
    description: 'Subsurface pattern tile lines, blowout holes, drainage outlets, or water table control gates.',
  },
  {
    id: 'weed_pressure',
    label: 'Weed / Pest Pressure',
    iconName: 'AlertCircle',
    color: '#f43f5e',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-700',
    borderColor: '#f43f5e',
    description: 'Waterhemp, Palmer amaranth patches, cutworm damage, or localized weed escapes along margins.',
  },
  {
    id: 'pest_disease',
    label: 'Crop Health / Stand',
    iconName: 'Activity',
    color: '#ec4899',
    badgeBg: 'bg-pink-950/80 text-pink-300 border-pink-700',
    borderColor: '#ec4899',
    description: 'Chlorosis, tar spot, sudden death syndrome, seedling emergence skips, or canopy vigor variation.',
  },
  {
    id: 'observation',
    label: 'Agronomic Observation',
    iconName: 'Compass',
    color: '#38bdf8',
    badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-700',
    borderColor: '#38bdf8',
    description: 'General soil smell/color, biological earthworm abundance, test strip trial, or fertilizer injection check.',
  },
];

export const INITIAL_FIELD_NOTES: FieldNote[] = [
  {
    id: 'note-101-1',
    fieldId: 'field-101',
    fieldName: 'North Section 14 (Creek View)',
    coordinates: [42.0645, -93.5872],
    title: 'Dense Winter Rye Stand & Active Earthworms',
    content: 'Spade test revealed excellent granular soil aggregation with 7-9 earthworms per spadeful. Cereal rye root mass is actively anchoring topsoil with zero sheet erosion observed along the northern swale.',
    category: 'cover_crop_emergence',
    severity: 'info',
    createdAt: '2026-09-18T14:30:00Z',
    authorName: 'Marcus Lind (Lead Agronomist)',
    tags: ['Earthworms', 'Winter Rye', 'Humic Aggregation'],
  },
  {
    id: 'note-101-2',
    fieldId: 'field-101',
    fieldName: 'North Section 14 (Creek View)',
    coordinates: [42.0602, -93.5815],
    title: 'Headland Wheel Compaction Check',
    content: 'Penetrometer showed >280 psi resistance at 6-8 inch depth along turn row where combine turned during damp conditions last fall. Recommend inter-seeding deep-taproot daikon radish to bio-drill through compacted zone.',
    category: 'soil_compaction',
    severity: 'attention',
    createdAt: '2026-09-22T09:15:00Z',
    authorName: 'Marcus Lind (Lead Agronomist)',
    tags: ['Turn Row', 'Penetrometer', 'Bio-drilling'],
  },
  {
    id: 'note-101-3',
    fieldId: 'field-101',
    fieldName: 'North Section 14 (Creek View)',
    coordinates: [42.0661, -93.5905],
    title: 'Old Clay Tile Outlet Flowing Clear',
    content: 'Inspected 8-inch tile outlet into creek buffer. Water is discharging crystal clear with zero suspended silt sediment, demonstrating 100% no-till sediment capture efficacy.',
    category: 'tile_drainage',
    severity: 'info',
    createdAt: '2026-09-28T16:45:00Z',
    authorName: 'Dale Vance (Farm Owner)',
    tags: ['Tile Outlet', 'Water Quality', 'Sediment Trapping'],
  },
  {
    id: 'note-102-1',
    fieldId: 'field-102',
    fieldName: 'River Bottom Flat',
    coordinates: [42.0542, -93.5828],
    title: 'Temporary Swale Ponding Post-Thunderstorm',
    content: '45mm rain event resulted in temporary 2-inch ponding in slight depression. Surface water infiltrated completely within 18 hours due to high soil organic matter and vertical worm burrows.',
    category: 'moisture_ponding',
    severity: 'attention',
    createdAt: '2026-09-26T11:20:00Z',
    authorName: 'Dale Vance (Farm Owner)',
    tags: ['Infiltration Rate', 'Storm Runoff', 'SOM Sponge'],
  },
  {
    id: 'note-102-2',
    fieldId: 'field-102',
    fieldName: 'River Bottom Flat',
    coordinates: [42.0505, -93.5890],
    title: 'Isolated Waterhemp Escape on Field Margin',
    content: 'Noticed small cluster of late-emerging waterhemp along east fence line where roller crimper could not reach edge. Hand-pulled before seed set to preserve clean seed bank.',
    category: 'weed_pressure',
    severity: 'critical',
    createdAt: '2026-09-29T10:00:00Z',
    authorName: 'Elena Rostova (Agronomy Specialist)',
    tags: ['Waterhemp', 'Sanitation', 'Border Sweep'],
  },
];

export function getFieldNoteCategoryConfig(category: FieldNoteCategory): FieldNoteCategoryConfig {
  return (
    FIELD_NOTE_CATEGORIES.find((c) => c.id === category) || FIELD_NOTE_CATEGORIES[FIELD_NOTE_CATEGORIES.length - 1]
  );
}
