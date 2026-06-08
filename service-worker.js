// Service Worker para LOUVAI AO SENHOR - PWA Offline First
// Cache strategy: Cache-first com fallback para network

const CACHE_NAME = 'louvai-v1';
const HYMN_CACHE = 'louvai-hymns-v1';
const FONTS_CACHE = 'louvai-fonts-v1';

// Arquivos essenciais para offline
const ESSENTIAL_FILES = [
  './',
  './Hinario_IERA.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching essential files');
      return cache.addAll(ESSENTIAL_FILES).catch(err => {
        console.warn('[ServiceWorker] Some files failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== HYMN_CACHE && cacheName !== FONTS_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // Strategy 1: Fonts (Cache-first)
  if (url.href.includes('fonts.googleapis') || url.href.includes('fonts.gstatic')) {
    event.respondWith(
      caches.open(FONTS_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) return response;
          return fetch(request).then(response => {
            cache.put(request, response.clone());
            return response;
          }).catch(() => {
            console.warn('[ServiceWorker] Font fetch failed, offline:', url);
            return new Response('', { status: 503 });
          });
        });
      })
    );
    return;
  }

  // Strategy 2: App shell (Cache-first)
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) return response;
          return fetch(request).then(response => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            console.log('[ServiceWorker] Network failed, serving from cache:', url);
            return cache.match(request) || new Response('Offline - página não disponível', { status: 503 });
          });
        });
      })
    );
    return;
  }

  // Strategy 3: JSON/Data (Network-first, then cache)
  if (url.pathname.endsWith('.json') || request.headers.get('accept')?.includes('application/json')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.status === 200) {
          caches.open(HYMN_CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => {
        return caches.open(HYMN_CACHE).then(cache => {
          return cache.match(request) || new Response(JSON.stringify({}), { status: 503 });
        });
      })
    );
    return;
  }

  // Strategy 4: Default (Cache-first for images/assets)
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(request).then(response => {
        return response || fetch(request).then(response => {
          if (response.status === 200 && (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|woff|woff2)$/i))) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          console.warn('[ServiceWorker] Fetch failed:', url);
          if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
            return new Response('', { status: 404 });
          }
          return new Response('Offline - recurso indisponível', { status: 503 });
        });
      });
    })
  );
});

// Message event - for cache clearing from app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(HYMN_CACHE).then(() => {
      console.log('[ServiceWorker] Cache limpo');
      event.ports[0].postMessage({ success: true });
    });
  }
  if (event.data && event.data.type === 'CACHE_HYMNS') {
    const hymns = event.data.hymns || [];
    caches.open(HYMN_CACHE).then(cache => {
      hymns.forEach(hymn => {
        const request = new Request(`/hymn/${hymn.number}`);
        const response = new Response(JSON.stringify(hymn), {
          headers: { 'Content-Type': 'application/json' }
        });
        cache.put(request, response);
      });
      console.log(`[ServiceWorker] Cached ${hymns.length} hymns`);
      event.ports[0].postMessage({ cached: hymns.length });
    });
  }
});

// Background Sync para sincronizar dados quando online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-prayers' || event.tag === 'sync-favorites') {
    event.waitUntil(
      fetch('/api/sync', { method: 'POST' }).catch(err => {
        console.warn('[ServiceWorker] Sync failed:', err);
      })
    );
  }
});
