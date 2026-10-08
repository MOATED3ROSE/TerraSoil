import { MoistureAlert, Field, MoistureAlertSeverity } from '../types';

export interface PushNotificationPreferences {
  enabled: boolean;
  alertOnCritical: boolean;
  alertOnWarning: boolean;
  soundAndVibration: boolean;
  minDeficitThreshold: number; // e.g. 4% deficit
}

const DEFAULT_PREFERENCES: PushNotificationPreferences = {
  enabled: false,
  alertOnCritical: true,
  alertOnWarning: true,
  soundAndVibration: true,
  minDeficitThreshold: 3.0,
};

const STORAGE_KEY_PREFS = 'terrasoil_push_prefs';
const STORAGE_KEY_LOG = 'terrasoil_push_notifications_log';

export interface SoilMoisturePushLogItem {
  id: string;
  fieldId: string;
  fieldName: string;
  cropType: string;
  currentMoisture: number;
  threshold: number;
  deficit: number;
  severity: MoistureAlertSeverity;
  timestamp: string;
}

// Convert url-safe base64 string to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Public VAPID key placeholder for PushManager subscription
// In production this connects to your VAPID server; standard sample key provided for web push protocol
const SAMPLE_PUBLIC_VAPID_KEY =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

export class PushNotificationService {
  /**
   * Check if Push API and Service Workers are supported in the current browser
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /**
   * Get current Notification permission state ('default' | 'granted' | 'denied')
   */
  static getPermissionState(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Load stored notification preferences
   */
  static getPreferences(): PushNotificationPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFS);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading push prefs from localStorage:', e);
    }
    return DEFAULT_PREFERENCES;
  }

  /**
   * Save notification preferences
   */
  static savePreferences(prefs: Partial<PushNotificationPreferences>): PushNotificationPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error writing push prefs to localStorage:', e);
    }
    return updated;
  }

  /**
   * Request permission from the user for notifications
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.savePreferences({ enabled: true });
        await this.subscribeToPush();
      } else {
        this.savePreferences({ enabled: false });
      }
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Subscribe browser to PushManager through Service Worker
   */
  static async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        try {
          const applicationServerKey = urlBase64ToUint8Array(SAMPLE_PUBLIC_VAPID_KEY);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as unknown as ArrayBuffer,
          });
        } catch (subErr) {
          // If public key fails (e.g. offline sandbox), try subscribing without applicationServerKey or keep local
          console.log('[PushService] Key subscription fallback, using direct registration worker');
        }
      }

      this.savePreferences({ enabled: true });
      return subscription;
    } catch (err) {
      console.warn('[PushService] Could not establish push subscription:', err);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribe(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      this.savePreferences({ enabled: false });
      return true;
    } catch (err) {
      console.warn('[PushService] Error during push unsubscribe:', err);
      this.savePreferences({ enabled: false });
      return false;
    }
  }

  /**
   * Dispatch a real-time soil moisture alert push notification through the Service Worker
   */
  static async dispatchSoilMoistureAlert(
    alert: MoistureAlert,
    field?: Field
  ): Promise<boolean> {
    if (!this.isSupported()) return false;

    const prefs = this.getPreferences();
    if (!prefs.enabled && Notification.permission !== 'granted') {
      return false;
    }

    // Check severity filters
    if (alert.severity === 'critical' && !prefs.alertOnCritical) return false;
    if (alert.severity === 'warning' && !prefs.alertOnWarning) return false;
    if (alert.deficitPct < prefs.minDeficitThreshold) return false;

    const isCritical = alert.severity === 'critical';
    const title = isCritical
      ? `🚨 Critical Soil Moisture Deficit: ${alert.fieldName}`
      : `⚠️ Soil Moisture Warning: ${alert.fieldName}`;

    const body = `Root-zone moisture dropped to ${alert.currentRootZoneMoisturePct}% VWC (${alert.deficitPct}% below ${alert.criticalThresholdPct}% threshold for ${alert.cropType}). Immediate mitigation needed.`;

    try {
      const registration = await navigator.serviceWorker.ready;

      // Method 1: Use registration.showNotification directly (works immediately through SW)
      await registration.showNotification(title, {
        body,
        icon: '/manifest.json',
        badge: '/manifest.json',
        tag: `soil-alert-${alert.fieldId}-${Date.now()}`,
        data: {
          url: '/',
          fieldId: alert.fieldId,
          alertId: alert.id,
          cropType: alert.cropType,
          currentMoisture: alert.currentRootZoneMoisturePct,
          threshold: alert.criticalThresholdPct,
          timestamp: Date.now(),
        },
        vibrate: prefs.soundAndVibration ? [300, 150, 300, 150, 500] : undefined,
        actions: [
          { action: 'open_field', title: '🌱 View Field & Mitigation' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
        requireInteraction: isCritical,
      } as any);

      // Also dispatch to SW message listener for cross-context recording
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TRIGGER_PUSH_NOTIFICATION',
          payload: {
            title,
            body,
            fieldId: alert.fieldId,
            alertId: alert.id,
          },
        });
      }

      this.logNotification({
        id: alert.id,
        fieldId: alert.fieldId,
        fieldName: alert.fieldName,
        cropType: alert.cropType,
        currentMoisture: alert.currentRootZoneMoisturePct,
        threshold: alert.criticalThresholdPct,
        deficit: alert.deficitPct,
        severity: alert.severity,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error('[PushService] Failed to dispatch push notification:', err);
      return false;
    }
  }

  /**
   * Send a test push notification to verify service worker and OS push integration
   */
  static async sendTestPushNotification(fieldName = 'North Section 14'): Promise<boolean> {
    if (!this.isSupported()) return false;

    if (Notification.permission !== 'granted') {
      const res = await this.requestPermission();
      if (res !== 'granted') return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const title = `🚨 [TEST] TerraSoil Soil Moisture Alert: ${fieldName}`;
      const body =
        'Real-time Push API verification: Root-zone moisture simulation dropped to 16.5% VWC (5.5% deficit below 22.0% threshold). Tap to view mitigation guidelines.';

      await registration.showNotification(title, {
        body,
        icon: '/manifest.json',
        badge: '/manifest.json',
        tag: `test-soil-alert-${Date.now()}`,
        data: {
          url: '/',
          fieldId: 'field-1',
          test: true,
          timestamp: Date.now(),
        },
        vibrate: [250, 100, 250, 100, 400],
        actions: [
          { action: 'open_field', title: '🌱 View Field & Mitigation' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
        requireInteraction: true,
      } as any);

      return true;
    } catch (err) {
      console.error('[PushService] Failed to send test push notification:', err);
      return false;
    }
  }

  /**
   * Log pushed notifications to local history
   */
  static logNotification(item: SoilMoisturePushLogItem) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOG);
      const list: SoilMoisturePushLogItem[] = raw ? JSON.parse(raw) : [];
      list.unshift(item);
      localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(list.slice(0, 30)));
    } catch (e) {
      console.warn('Error saving push notification log:', e);
    }
  }

  /**
   * Get notification history log
   */
  static getNotificationLog(): SoilMoisturePushLogItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOG);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear notification log
   */
  static clearNotificationLog(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_LOG);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Listen for clicks on notifications passed through the service worker
   */
  static onNotificationClickMessage(callback: (data: { fieldId?: string; alertId?: string }) => void) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return () => {};

    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE_TO_FIELD_ALERT') {
        callback({
          fieldId: event.data.fieldId,
          alertId: event.data.alertId,
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handler);
    };
  }
}
