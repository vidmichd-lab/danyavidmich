// Service Worker for offline support
const CACHE_NAME = 'danyavidmich-v2';
const STATIC_CACHE_NAME = 'danyavidmich-static-v2';
const IMAGE_CACHE_NAME = 'danyavidmich-images-v2';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/cv/',
  '/styles/portfolio-filters.css',
  '/scripts/portfolio-filters.js',
  '/scripts/image-error-handler.js',
  '/javascript.js',
  '/fonts/arialnarrow.ttf'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return Promise.all(
        STATIC_ASSETS.map((url) => {
          return fetch(url, { redirect: 'follow' })
            .then((response) => {
              if (response.ok) {
                return cache.put(url, response);
              }
            })
            .catch(() => {
              // Silently fail for assets that can't be cached
            });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE_NAME && 
                   name !== IMAGE_CACHE_NAME && 
                   name !== CACHE_NAME;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle images with separate cache
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request, { redirect: 'follow' }).then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // Return placeholder image on error
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#eaebec"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial" font-size="16">Image not available</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        });
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request, { redirect: 'follow' }).then((response) => {
        // Cache successful responses (including redirected ones)
        if (response.status === 200 || response.status === 0) {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch((error) => {
        // If fetch fails, try to serve from cache
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response('Network error', { status: 408 });
        });
      });
    })
  );
});

