const CACHE_NAME = 'tio-patinhas-v3';
const STATIC_ASSETS = [
  '/',
  '/carteira',
  '/historico',
  '/nova-posicao',
  '/configuracoes',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

const STATIC_ASSET_REGEX = /\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/;

// Fetch: serve from cache or network with offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
        }).catch(() => {
          // Network failed, but we have cached version - that's fine
        });
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (response.ok && (event.request.mode === 'navigate' || STATIC_ASSET_REGEX.test(event.request.url))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('Network error - offline and not cached', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});

// Background sync for offline form submissions (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncFormSubmissions());
  }
});

// Placeholder for form sync functionality
async function syncFormSubmissions() {
  // This would sync any queued form submissions when back online
  // Implementation would require IndexedDB to store pending submissions
  console.log('[Service Worker] Syncing form submissions...');
}
