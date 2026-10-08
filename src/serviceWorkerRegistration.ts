/**
 * Registers the TerraSoil Service Worker for offline GIS tile caching & local activity persistence.
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[TerraSoil SW] Registered successfully with scope:', registration.scope);

        if ('PushManager' in window) {
          console.log('[TerraSoil SW] Push API and PushManager supported by service worker.');
        }

        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[TerraSoil SW] New content available; please refresh.');
              } else {
                console.log('[TerraSoil SW] Content is cached for offline use.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('[TerraSoil SW] Registration failed:', error);
      });
  });
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
