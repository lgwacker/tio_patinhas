const CACHE_NAME = 'tio-patinhas-v4';
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

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
const API_REGEX = /\/api\//;

async function staleWhileRevalidate(request, cache) {
  const cached = await cache.match(request);
  
  const networkPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  if (cached) {
    networkPromise;
    return cached;
  }
  
  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  throw new Error('Network error and no cached data');
}

function createOfflineResponse() {
  return new Response(
    JSON.stringify({ offline: true, error: 'Offline - dados podem estar desatualizados' }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isApiRequest = API_REGEX.test(url.pathname);
  const isStaticAsset = STATIC_ASSET_REGEX.test(url.pathname);
  const isNavigation = event.request.mode === 'navigate';

  if (isApiRequest) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return staleWhileRevalidate(event.request, cache);
      }).catch(() => createOfflineResponse())
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
        }).catch(() => {});
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (response.ok && (isNavigation || isStaticAsset)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        if (isNavigation) {
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
