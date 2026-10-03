import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Layers, 
  Check, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  ShieldCheck, 
  HardDrive,
  FileCheck2,
  Clock,
  X
} from 'lucide-react';
import { 
  subscribeToConnectivity, 
  setSimulatedOffline, 
  isSimulatedOffline, 
  isAppOnline, 
  getOfflineCacheStats, 
  syncPendingActivityQueue, 
  getPendingActivityQueue,
  OfflineCacheStats,
  OfflineActivityQueueItem
} from '../utils/offlineStorage';

interface OfflineStatusBannerProps {
  onSyncComplete?: (message: string) => void;
}

export const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({ onSyncComplete }) => {
  const [stats, setStats] = useState<OfflineCacheStats>(getOfflineCacheStats());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showQueueDetails, setShowQueueDetails] = useState<boolean>(false);
  const [queueItems, setQueueItems] = useState<OfflineActivityQueueItem[]>([]);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToConnectivity(() => {
      setStats(getOfflineCacheStats());
      setQueueItems(getPendingActivityQueue());
    });
    return () => unsubscribe();
  }, []);

  const handleToggleSimulatedOffline = () => {
    const nextState = !stats.isSimulatedOffline;
    setSimulatedOffline(nextState);
    setStats(getOfflineCacheStats());
    setQueueItems(getPendingActivityQueue());
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncPendingActivityQueue();
      setStats(getOfflineCacheStats());
      setQueueItems(getPendingActivityQueue());
      setSyncFeedback(result.message);
      if (onSyncComplete) {
        onSyncComplete(result.message);
      }
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (e: any) {
      setSyncFeedback(`Sync failed: ${e?.message || 'Network error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const isOffline = !stats.isOnline;

  return (
    <div className="w-full">
      {/* Offline / Connectivity Status Bar */}
      <div 
        className={`px-4 py-2 text-xs border-b transition-colors flex flex-wrap items-center justify-between gap-3 ${
          isOffline
            ? 'bg-amber-950/80 border-amber-800 text-amber-200'
            : stats.pendingQueueCount > 0
            ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
            : 'bg-stone-900/90 border-stone-800/80 text-stone-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1 rounded-lg ${isOffline ? 'bg-amber-900 text-amber-300' : 'bg-emerald-900/70 text-emerald-400'}`}>
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold">
              {isOffline ? 'Offline / Low Connectivity Mode' : 'Connected to Cloud MRV'}
            </span>
            <span className="text-[11px] opacity-80 hidden sm:inline">
              {isOffline
                ? 'Field boundary maps & local activity logs are running from Service Worker cache.'
                : 'All maps, satellite tiles, and activity ledgers are synced.'}
            </span>
            {stats.isSimulatedOffline && (
              <span className="bg-amber-900/80 text-amber-300 font-mono text-[10px] px-1.5 py-0.2 rounded border border-amber-700">
                Simulation Active
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Cached stats badge */}
          <button
            onClick={() => setShowQueueDetails(!showQueueDetails)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950/60 hover:bg-stone-950 text-stone-300 border border-stone-700/60 font-mono text-[11px] transition"
            title="Inspect local offline cache & activity queue"
          >
            <HardDrive className="w-3 h-3 text-cyan-400" />
            <span>{stats.cachedFieldsCount} Fields Cached</span>
            {stats.pendingQueueCount > 0 && (
              <span className="bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {stats.pendingQueueCount} pending
              </span>
            )}
            {showQueueDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Sync Button */}
          {stats.pendingQueueCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing || isOffline}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition ${
                isOffline
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : `Sync Queue (${stats.pendingQueueCount})`}</span>
            </button>
          )}

          {/* Simulation Toggle */}
          <button
            onClick={handleToggleSimulatedOffline}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1.5 ${
              stats.isSimulatedOffline
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                : 'bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700'
            }`}
            title="Toggle offline connectivity simulation for testing rural dead-zones"
          >
            <Sliders className="w-3 h-3" />
            <span>{stats.isSimulatedOffline ? 'Go Online' : 'Simulate Offline'}</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Toast inside banner */}
      {syncFeedback && (
        <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-300 px-4 py-1.5 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Expandable Cache & Offline Activity Queue Details Drawer */}
      {showQueueDetails && (
        <div className="bg-stone-950 border-b border-stone-800 p-4 text-xs space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-stone-850 pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-stone-100">Local Service Worker &amp; Offline Storage Cache</h4>
            </div>
            <span className="text-[11px] font-mono text-stone-400">
              Last Synced: {stats.lastSyncedTimestamp ? new Date(stats.lastSyncedTimestamp).toLocaleTimeString() : 'Never'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-300">
            <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Service Worker Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <Check className="w-3 h-3" /> Active &amp; Intercepting
              </span>
            </div>

            <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Cached Field Boundaries</span>
              <span className="font-bold text-stone-100 mt-0.5 block">{stats.cachedFieldsCount} Parcels Ready Offline</span>
            </div>

            <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Map Tile Cache (Max 600)</span>
              <span className="font-bold text-cyan-400 mt-0.5 block">LRU Tile Cache Enabled</span>
            </div>

            <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Pending Offline Activities</span>
              <span className={`font-bold mt-0.5 block ${stats.pendingQueueCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stats.pendingQueueCount} Queued
              </span>
            </div>
          </div>

          {/* Pending Queue List */}
          {queueItems.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-stone-400">Queued Offline Mutations:</span>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {queueItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-2 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold text-stone-200">{item.actionTitle}</span>
                      {item.fieldName && <span className="text-stone-400">({item.fieldName})</span>}
                    </div>
                    <span className="font-mono text-[10px] text-stone-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-stone-500 italic">
              No offline mutations queued. All practice logs, scouting notes, and boundary edits are fully committed.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
