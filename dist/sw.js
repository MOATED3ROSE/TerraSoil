// TerraSoil MRV Portal Service Worker (Field Maps & Local Activity Cache)
const CACHE_NAMES = {
  STATIC: 'terrasoil-static-v1',
  TILES: 'terrasoil-map-tiles-v1',
  API: 'terrasoil-api-v1',
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
];

const MAX_TILES_ENTRIES = 600;

// Install event: Pre-cache static app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching some assets failed (will cache on demand):', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !Object.values(CACHE_NAMES).includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper: Trim cache to max items (LRU policy)
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
}

// Check if request is a map tile (OpenStreetMap, Esri World Imagery, etc.)
function isMapTileUrl(url) {
  return (
    url.includes('tile.openstreetmap.org') ||
    url.includes('server.arcgisonline.com') ||
    url.includes('services.arcgisonline.com') ||
    url.includes('cartocdn.com') ||
    url.includes('tile.opentopomap.org') ||
    url.includes('mt0.google.com') ||
    url.includes('mt1.google.com')
  );
}

// Fetch event: Apply caching strategies based on URL pattern
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 1. Map Tiles: Cache-First strategy with high TTL & LRU pruning
  if (isMapTileUrl(url)) {
    event.respondWith(
      caches.open(CACHE_NAMES.TILES).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
            trimCache(CACHE_NAMES.TILES, MAX_TILES_ENTRIES);
          }
          return networkResponse;
        } catch (error) {
          // If offline and tile not cached, return transparent placeholder if possible
          return new Response('', { status: 408, statusText: 'Tile Offline' });
        }
      })
    );
    return;
  }

  // 2. Weather & Non-grounding API calls: Stale-While-Revalidate
  if (url.includes('/api/weather')) {
    event.respondWith(
      caches.open(CACHE_NAMES.API).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Static assets, fonts, app bundles: Stale-While-Revalidate / Cache-First
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next load
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAMES.STATIC).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignore background fetch error when offline
          });
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAMES.STATIC).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      } catch (error) {
        // Fallback to index.html for navigation requests when offline
        if (request.mode === 'navigate') {
          const indexFallback = await caches.match('/index.html');
          if (indexFallback) return indexFallback;
        }
        throw error;
      }
    })
  );
});
