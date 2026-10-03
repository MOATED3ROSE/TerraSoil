import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  MapPin, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Upload, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Star, 
  AlertCircle, 
  Compass, 
  SunMedium, 
  Cpu, 
  Eye, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';
import { SoilHealthPhoto, SoilHealthMarkerType, Field } from '../types';
import { SOIL_MARKER_CATEGORIES, SAMPLE_SOIL_PHOTO_DATA_URLS } from '../data/mockSoilHealthPhotos';
import { enqueueOfflineActivity } from '../utils/offlineStorage';

interface SoilCameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (photo: SoilHealthPhoto) => void;
  currentField: Field;
  authorName?: string;
}

export const SoilCameraCaptureModal: React.FC<SoilCameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onSavePhoto,
  currentField,
  authorName = 'Lead Agronomist',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Viewfinder & Camera States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<string | null>(null);
  const [isFlashSimulated, setIsFlashSimulated] = useState<boolean>(false);

  // Geolocated GPS Coordinates
  const [gpsCoordinates, setGpsCoordinates] = useState<[number, number]>(
    currentField.centroid || [42.062, -93.585]
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(2.5);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'manual'>('locked');

  // Soil Marker Form Inputs
  const [markerType, setMarkerType] = useState<SoilHealthMarkerType>('earthworm_biopores');
  const [markerLabel, setMarkerLabel] = useState<string>('Earthworm Macropores & Castings');
  const [soilQualityRating, setSoilQualityRating] = useState<number>(5);
  const [sampleDepthCm, setSampleDepthCm] = useState<string>('0-15 cm (Topsoil)');
  const [notes, setNotes] = useState<string>('');
  const [bioporesCount, setBioporesCount] = useState<number>(12);
  const [residuePct, setResiduePct] = useState<number>(85);
  const [compactionPsi, setCompactionPsi] = useState<number>(180);

  // Initialize Geolocation & Camera on open
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    // Try browser Geolocation API
    if ('geolocation' in navigator) {
      setGpsStatus('acquiring');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoordinates([position.coords.latitude, position.coords.longitude]);
          setGpsAccuracy(Math.round(position.coords.accuracy * 10) / 10);
          setGpsStatus('locked');
        },
        () => {
          // Fallback to field centroid
          if (currentField.centroid) {
            setGpsCoordinates(currentField.centroid);
          }
          setGpsStatus('manual');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, selectedDeviceId]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        stopCamera();
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId 
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Play interrupted', e));
      }
      setCameraActive(true);

      // Enumerate available video inputs
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableDevices(videoInputs);
    } catch (err: any) {
      console.warn('Camera access error or desktop environment without webcam:', err);
      setCameraActive(false);
      setCameraError(
        'Camera stream not available. You can upload an image file or choose a high-resolution soil marker preset.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Simulate flash animation
    setIsFlashSimulated(true);
    setTimeout(() => setIsFlashSimulated(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, width, height);

    // Draw HUD Geotag watermark on photo
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(10, height - 60, width - 20, 50);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(
      `FIELD: ${currentField.name.toUpperCase()} • LAT ${gpsCoordinates[0].toFixed(5)}, LON ${gpsCoordinates[1].toFixed(5)} (±${gpsAccuracy}m)`,
      20,
      height - 38
    );

    ctx.fillStyle = '#f3f4f6';
    ctx.font = '11px sans-serif';
    ctx.fillText(
      `TIMESTAMP: ${new Date().toLocaleString()} • MARKER: ${markerLabel} • BY: ${authorName}`,
      20,
      height - 18
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImageDataUrl(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImageDataUrl(null);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (result) {
        setCapturedImageDataUrl(result);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetPhoto = (type: SoilHealthMarkerType) => {
    const dataUrl = SAMPLE_SOIL_PHOTO_DATA_URLS[type] || SAMPLE_SOIL_PHOTO_DATA_URLS.other;
    setCapturedImageDataUrl(dataUrl);
    setMarkerType(type);
    const category = SOIL_MARKER_CATEGORIES.find((c) => c.type === type);
    if (category) {
      setMarkerLabel(category.name);
    }
    stopCamera();
  };

  const handleSave = () => {
    const photoToSave: SoilHealthPhoto = {
      id: `photo-${currentField.id}-${Date.now()}`,
      fieldId: currentField.id,
      fieldName: currentField.name,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      coordinates: gpsCoordinates,
      gpsAccuracyMeters: gpsAccuracy,
      imageDataUrl: capturedImageDataUrl || SAMPLE_SOIL_PHOTO_DATA_URLS[markerType] || SAMPLE_SOIL_PHOTO_DATA_URLS.other,
      markerType,
      markerLabel,
      soilQualityRating,
      sampleDepthCm,
      notes: notes.trim() || `Physical soil health sample documenting ${markerLabel.toLowerCase()} in ${currentField.name}.`,
      bioporeDensityPerSqFt: markerType === 'earthworm_biopores' ? bioporesCount : undefined,
      residueCoveragePct: markerType === 'residue_cover' ? residuePct : undefined,
      compactionResistancePsi: markerType === 'compaction_pan' ? compactionPsi : undefined,
      recordedBy: authorName,
      synced: true,
    };

    onSavePhoto(photoToSave);

    // Enqueue for offline resilience
    enqueueOfflineActivity({
      type: 'add_note',
      actionTitle: `Captured physical soil marker photo (${markerLabel})`,
      fieldId: currentField.id,
      farmId: currentField.farmId,
      payload: { photoId: photoToSave.id, markerType },
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200 text-stone-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-950/80 text-emerald-400 rounded-2xl border border-emerald-800 shadow-inner">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100">
                  Document Physical Soil Health Markers
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                  Field Camera API
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Capture timestamped, geolocated ground-truth photos for {currentField.name} ({currentField.acreage} ac).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-stone-400 hover:text-stone-200 p-2 rounded-xl hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Top GPS Telemetry Bar */}
          <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                  Field GPS Geotag
                </span>
                <span className="font-mono text-xs font-semibold text-stone-200">
                  Lat {gpsCoordinates[0].toFixed(5)}, Lon {gpsCoordinates[1].toFixed(5)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-stone-300">
                Precision: ±{gpsAccuracy}m
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                gpsStatus === 'locked' 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {gpsStatus === 'locked' ? 'GPS Locked' : 'Centroid Tagged'}
              </span>
            </div>
          </div>

          {/* Viewfinder / Captured Preview Area */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-stone-800 shadow-inner flex items-center justify-center">
            {/* Flash Simulation Overlay */}
            {isFlashSimulated && (
              <div className="absolute inset-0 bg-white z-40 pointer-events-none animate-out fade-out duration-200" />
            )}

            {/* Hidden canvas for snapshot rendering */}
            <canvas ref={canvasRef} className="hidden" />

            {/* State A: Preview Captured Image */}
            {capturedImageDataUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={capturedImageDataUrl}
                  alt="Captured Soil Health"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-mono">Frame Captured &amp; Geotagged</span>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    onClick={handleRetake}
                    className="px-3.5 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-bold border border-stone-700 flex items-center gap-1.5 shadow-lg transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Retake Photo</span>
                  </button>
                </div>
              </div>
            ) : cameraActive ? (
              /* State B: Live Camera Video Stream */
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Grid reticle overlay for alignment */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10 opacity-40">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-400/80" />
                  </div>
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div />
                </div>

                {/* Viewfinder Overlay Info */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>LIVE CAMERA • {currentField.name}</span>
                </div>

                {/* Camera switch toggle */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {availableDevices.length > 1 && (
                    <button
                      onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                      className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-stone-200 border border-white/10 transition"
                      title="Flip Camera (Front/Rear)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Shutter Capture Button */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center">
                  <button
                    onClick={handleCaptureSnapshot}
                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 flex items-center justify-center shadow-2xl border-4 border-white/80 transition-transform active:scale-90"
                    title="Snap Geotagged Photo"
                  >
                    <Camera className="w-7 h-7" />
                  </button>
                </div>
              </div>
            ) : (
              /* State C: Camera not active or Desktop fallback */
              <div className="p-6 text-center space-y-3 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-stone-800 text-stone-400 mx-auto flex items-center justify-center border border-stone-700">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-200">
                  Capture or Upload Soil Health Photo
                </h4>
                <p className="text-xs text-stone-400">
                  {cameraError || 'Activate the live camera, upload an image file from your device, or load sample soil marker benchmarks.'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={startCamera}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Camera Stream</span>
                  </button>

                  <label className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition flex items-center gap-1.5 border border-stone-700 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Soil Health Marker Selectors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Physical Soil Marker Category</span>
              </span>
              <span className="text-[10px] text-stone-500">
                Select to classify and ground-truth sample
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SOIL_MARKER_CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat.type}
                  onClick={() => {
                    setMarkerType(cat.type);
                    setMarkerLabel(cat.name);
                    if (!capturedImageDataUrl) {
                      handleSelectPresetPhoto(cat.type);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between space-y-1 ${
                    markerType === cat.type
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-stone-950 hover:bg-stone-800 border-stone-800'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block w-fit ${cat.badgeColor}`}>
                    {cat.name}
                  </span>
                  <p className="text-[10px] text-stone-400 line-clamp-1">
                    {cat.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Soil Health Metrics Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
            {/* Sample Depth Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Sample Horizon Depth
              </label>
              <select
                value={sampleDepthCm}
                onChange={(e) => setSampleDepthCm(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Surface (0 cm)">Surface (0 cm) - Armor &amp; Mulch</option>
                <option value="0-15 cm (Topsoil)">0-15 cm (A Horizon / Topsoil)</option>
                <option value="15-30 cm (Root Zone)">15-30 cm (Active Root Zone)</option>
                <option value="30-60 cm (Subsoil)">30-60 cm (Subsoil / Compaction Depth)</option>
                <option value="60+ cm (Deep Soil)">60+ cm (Deep Profile Trench)</option>
              </select>
            </div>

            {/* Visual Soil Quality Rating (1 to 5 Stars) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Soil Health Score (1-5★)
              </label>
              <div className="flex items-center gap-1.5 h-9 px-2 bg-stone-900 border border-stone-700 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSoilQualityRating(star)}
                    className="p-1 hover:scale-125 transition"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= soilQualityRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[11px] font-mono font-bold text-stone-300 ml-auto">
                  {soilQualityRating}.0 / 5.0
                </span>
              </div>
            </div>

            {/* Marker Specific Metric Modifier */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                {markerType === 'earthworm_biopores' && 'Earthworm Count (/sq ft)'}
                {markerType === 'residue_cover' && 'Residue Ground Cover (%)'}
                {markerType === 'compaction_pan' && 'Penetrometer Resistance (PSI)'}
                {markerType !== 'earthworm_biopores' && markerType !== 'residue_cover' && markerType !== 'compaction_pan' && 'Field Assessment Metric'}
              </label>
              
              {markerType === 'earthworm_biopores' && (
                <div className="flex items-center gap-2 bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={bioporesCount}
                    onChange={(e) => setBioporesCount(Number(e.target.value))}
                    className="bg-transparent text-stone-100 font-mono font-bold text-xs w-full focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-400">burrows/ft²</span>
                </div>
              )}

              {markerType === 'residue_cover' && (
                <div className="flex items-center gap-2 bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={residuePct}
                    onChange={(e) => setResiduePct(Number(e.target.value))}
                    className="bg-transparent text-stone-100 font-mono font-bold text-xs w-full focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-400">% cover</span>
                </div>
              )}

              {markerType === 'compaction_pan' && (
                <div className="flex items-center gap-2 bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5">
                  <input
                    type="number"
                    min="50"
                    max="500"
                    value={compactionPsi}
                    onChange={(e) => setCompactionPsi(Number(e.target.value))}
                    className="bg-transparent text-stone-100 font-mono font-bold text-xs w-full focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-400">PSI</span>
                </div>
              )}

              {markerType !== 'earthworm_biopores' && markerType !== 'residue_cover' && markerType !== 'compaction_pan' && (
                <input
                  type="text"
                  placeholder="e.g. Slake stability 92%"
                  className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              )}
            </div>
          </div>

          {/* Agronomic Observation Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Agronomist Observation &amp; Field Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Document physical soil indicators in ${currentField.name} (e.g. aggregate crumb stability, root branching, odor, nodule redness)...`}
              className="w-full bg-stone-950 border border-stone-800 text-stone-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder:text-stone-600"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-900 text-xs font-semibold transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950"
            >
              <Check className="w-4 h-4" />
              <span>Save Geolocated Soil Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
