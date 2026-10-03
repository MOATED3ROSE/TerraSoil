import { Farm, Field, FieldNote, PracticeRecord } from '../types';

export interface OfflineActivityQueueItem {
  id: string;
  type: 'add_field' | 'import_geojson' | 'add_practice' | 'add_note' | 'update_soc' | 'export_report';
  actionTitle: string;
  fieldId?: string;
  fieldName?: string;
  farmId: string;
  timestamp: string;
  payload: any;
  synced: boolean;
}

export interface OfflineCacheStats {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  cachedFarmsCount: number;
  cachedFieldsCount: number;
  cachedNotesCount: number;
  pendingQueueCount: number;
  lastSyncedTimestamp: string | null;
  serviceWorkerActive: boolean;
}

const STORAGE_KEYS = {
  FARMS_CACHE: 'terrasoil_farms_cache',
  FIELDS_CACHE: 'terrasoil_fields_cache',
  NOTES_CACHE: 'terrasoil_notes_cache',
  ACTIVITY_QUEUE: 'terrasoil_activity_queue',
  LAST_SYNC_TIME: 'terrasoil_last_sync_time',
  SIMULATED_OFFLINE: 'terrasoil_simulated_offline',
};

type ConnectivityListener = (status: { isOnline: boolean; isSimulated: boolean; pendingCount: number }) => void;
const connectivityListeners: Set<ConnectivityListener> = new Set();

let simulatedOfflineState = false;
try {
  simulatedOfflineState = localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
} catch (e) {
  // localStorage might be unavailable
}

/**
 * Checks if app is effectively online (factoring in simulated offline switch).
 */
export function isAppOnline(): boolean {
  if (typeof window === 'undefined') return true;
  if (simulatedOfflineState) return false;
  return navigator.onLine;
}

/**
 * Toggles simulation of poor/offline connectivity for testing.
 */
export function setSimulatedOffline(simulated: boolean) {
  simulatedOfflineState = simulated;
  try {
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, simulated ? 'true' : 'false');
  } catch (e) {
    // ignore
  }
  notifyConnectivityChange();
}

export function isSimulatedOffline(): boolean {
  return simulatedOfflineState;
}

function notifyConnectivityChange() {
  const isOnline = isAppOnline();
  const queue = getPendingActivityQueue();
  connectivityListeners.forEach((listener) => {
    listener({
      isOnline,
      isSimulated: simulatedOfflineState,
      pendingCount: queue.length,
    });
  });
}

// Attach native window online/offline event handlers
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    notifyConnectivityChange();
    syncPendingActivityQueue();
  });
  window.addEventListener('offline', () => {
    notifyConnectivityChange();
  });
}

/**
 * Subscribes a React component to connectivity and sync changes.
 */
export function subscribeToConnectivity(listener: ConnectivityListener): () => void {
  connectivityListeners.add(listener);
  // Send immediate initial status
  listener({
    isOnline: isAppOnline(),
    isSimulated: simulatedOfflineState,
    pendingCount: getPendingActivityQueue().length,
  });
  return () => {
    connectivityListeners.delete(listener);
  };
}

/**
 * Saves current farms snapshot to local offline cache.
 */
export function cacheFarmsLocally(farms: Farm[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.FARMS_CACHE, JSON.stringify(farms));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
  } catch (e) {
    console.warn('Failed to cache farms locally:', e);
  }
}

/**
 * Retrieves cached farms snapshot.
 */
export function getCachedFarmsLocally(): Farm[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FARMS_CACHE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Saves field notes to local offline cache.
 */
export function cacheFieldNotesLocally(notes: FieldNote[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES_CACHE, JSON.stringify(notes));
  } catch (e) {
    console.warn('Failed to cache field notes locally:', e);
  }
}

/**
 * Retrieves cached field notes.
 */
export function getCachedFieldNotesLocally(): FieldNote[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES_CACHE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Enqueues an activity log or field mutation for sync when connectivity is restored.
 */
export function enqueueOfflineActivity(
  item: Omit<OfflineActivityQueueItem, 'id' | 'timestamp' | 'synced'>
): OfflineActivityQueueItem {
  const newItem: OfflineActivityQueueItem = {
    ...item,
    id: `offline-act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  if (typeof window !== 'undefined') {
    try {
      const queue = getPendingActivityQueue();
      queue.push(newItem);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_QUEUE, JSON.stringify(queue));
      notifyConnectivityChange();
    } catch (e) {
      console.warn('Failed to enqueue offline activity:', e);
    }
  }

  return newItem;
}

/**
 * Returns all pending offline activity queue items.
 */
export function getPendingActivityQueue(): OfflineActivityQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Clears or updates synced queue items.
 */
export function clearPendingActivityQueue(): number {
  const queue = getPendingActivityQueue();
  const count = queue.length;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVITY_QUEUE);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
      notifyConnectivityChange();
    } catch (e) {
      // ignore
    }
  }
  return count;
}

/**
 * Simulates syncing pending offline activities back to the cloud/server.
 */
export async function syncPendingActivityQueue(): Promise<{ syncedCount: number; message: string }> {
  const queue = getPendingActivityQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, message: 'All local field records and activity logs are up to date.' };
  }

  if (!isAppOnline()) {
    return { syncedCount: 0, message: 'Device is currently offline. Activities queued locally.' };
  }

  // Artificial short delay to simulate secure cloud synchronization
  await new Promise((resolve) => setTimeout(resolve, 800));

  const syncedCount = queue.length;
  clearPendingActivityQueue();

  return {
    syncedCount,
    message: `Successfully synchronized ${syncedCount} offline field record${syncedCount === 1 ? '' : 's'} to cloud server.`,
  };
}

/**
 * Returns overall offline cache statistics for the UI banner.
 */
export function getOfflineCacheStats(): OfflineCacheStats {
  const cachedFarms = getCachedFarmsLocally();
  const cachedNotes = getCachedFieldNotesLocally();
  const pendingQueue = getPendingActivityQueue();

  let totalFields = 0;
  if (cachedFarms) {
    cachedFarms.forEach((f) => {
      totalFields += f.fields.length;
    });
  }

  let lastSync: string | null = null;
  if (typeof window !== 'undefined') {
    lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
  }

  const swActive =
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    !!navigator.serviceWorker.controller;

  return {
    isOnline: isAppOnline(),
    isSimulatedOffline: simulatedOfflineState,
    cachedFarmsCount: cachedFarms ? cachedFarms.length : 0,
    cachedFieldsCount: totalFields,
    cachedNotesCount: cachedNotes ? cachedNotes.length : 0,
    pendingQueueCount: pendingQueue.length,
    lastSyncedTimestamp: lastSync,
    serviceWorkerActive: swActive,
  };
}
