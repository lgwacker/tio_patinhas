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

// Fetch: serve from cache or network with offline fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests (don't cache them)
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached version immediately if available
      if (cached) {
        // Still fetch in background to update cache (stale-while-revalidate)
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

      // No cache, fetch from network
      return fetch(event.request).then((response) => {
        // Cache successful HTML navigation requests (dynamic routes like /posicao/[id])
        if (event.request.mode === 'navigate' && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        // Cache successful responses for static assets
        if (response.ok && shouldCache(event.request.url)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Network failed - return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        // For other requests, return a simple error response
        return new Response('Network error - offline and not cached', { 
          status: 503, 
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});

// Helper to determine if a URL should be cached
function shouldCache(url) {
  // Cache static assets
  const cacheableExtensions = /\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/;
  return cacheableExtensions.test(url);
}

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
