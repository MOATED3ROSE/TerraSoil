import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Star, 
  Download, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Trash2,
  Share2
} from 'lucide-react';
import { SoilHealthPhoto } from '../types';
import { SOIL_MARKER_CATEGORIES } from '../data/mockSoilHealthPhotos';

interface SoilHealthPhotoInspectionModalProps {
  photo: SoilHealthPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onDeletePhoto?: (photoId: string) => void;
  onFocusOnMap?: (coordinates: [number, number]) => void;
}

export const SoilHealthPhotoInspectionModal: React.FC<SoilHealthPhotoInspectionModalProps> = ({
  photo,
  isOpen,
  onClose,
  onDeletePhoto,
  onFocusOnMap,
}) => {
  if (!isOpen || !photo) return null;

  const categoryInfo = SOIL_MARKER_CATEGORIES.find((c) => c.type === photo.markerType);

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = photo.imageDataUrl;
    link.download = `terrasoil-soil-marker-${photo.markerType}-${photo.fieldId}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200 text-stone-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`p-2.5 rounded-2xl border text-emerald-300 ${categoryInfo?.badgeColor || 'bg-stone-800 border-stone-700'}`}>
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100">
                  {photo.markerLabel}
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                  Ground Truth Photo
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Field: {photo.fieldName} &bull; Sample Depth: {photo.sampleDepthCm}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-2 rounded-xl hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Main Photo Showcase */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-stone-800 shadow-2xl aspect-video flex items-center justify-center">
            <img
              src={photo.imageDataUrl}
              alt={photo.markerLabel}
              className="w-full h-full object-contain"
            />
            
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={handleDownloadImage}
                className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-stone-200 text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition shadow-lg"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Photo</span>
              </button>
            </div>

            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-stone-200 text-[11px] font-mono flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>GPS: {photo.coordinates[0].toFixed(5)}, {photo.coordinates[1].toFixed(5)}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                Soil Quality Score
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= photo.soilQualityRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-stone-700'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold font-mono text-stone-200 ml-1">
                  {photo.soilQualityRating}.0
                </span>
              </div>
            </div>

            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                Sample Horizon Depth
              </span>
              <span className="text-xs font-semibold text-stone-200 block truncate">
                {photo.sampleDepthCm}
              </span>
            </div>

            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                Timestamp
              </span>
              <span className="text-xs font-semibold text-stone-200 block truncate">
                {photo.formattedDate}
              </span>
            </div>

            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                Documented By
              </span>
              <span className="text-xs font-semibold text-stone-200 block truncate">
                {photo.recordedBy}
              </span>
            </div>
          </div>

          {/* Marker-Specific Findings */}
          {(photo.bioporeDensityPerSqFt || photo.residueCoveragePct || photo.compactionResistancePsi || photo.aggregateSlakeScore) && (
            <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 flex flex-wrap items-center gap-4">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Quantitative Soil Metrics:
              </span>
              {photo.bioporeDensityPerSqFt !== undefined && (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">
                  Biopore Density: {photo.bioporeDensityPerSqFt} burrows/ft²
                </span>
              )}
              {photo.residueCoveragePct !== undefined && (
                <span className="px-2.5 py-1 rounded-xl bg-lime-950/60 border border-lime-800 text-lime-300 font-mono font-bold text-xs">
                  Residue Cover: {photo.residueCoveragePct}%
                </span>
              )}
              {photo.compactionResistancePsi !== undefined && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 font-mono font-bold text-xs">
                  Penetrometer: {photo.compactionResistancePsi} PSI
                </span>
              )}
              {photo.aggregateSlakeScore && (
                <span className="px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-mono font-bold text-xs">
                  Slake Stability: {photo.aggregateSlakeScore}
                </span>
              )}
            </div>
          )}

          {/* Agronomist Notes */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Agronomic Observation Notes</span>
            </span>
            <p className="text-xs text-stone-300 leading-relaxed">
              {photo.notes}
            </p>
          </div>

          {/* Agronomic Significance Box */}
          {categoryInfo && (
            <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-900/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>MRV &amp; Soil Carbon Sequestration Context</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {categoryInfo.agronomicSignificance}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onDeletePhoto && (
              <button
                type="button"
                onClick={() => {
                  onDeletePhoto(photo.id);
                  onClose();
                }}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-rose-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Photo</span>
              </button>
            )}

            {onFocusOnMap && (
              <button
                type="button"
                onClick={() => {
                  onFocusOnMap(photo.coordinates);
                  onClose();
                }}
                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-900/40"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Jump to Location on Map</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
