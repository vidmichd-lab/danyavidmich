// Service Worker kill switch.
// The portfolio does not need offline caching, and stale service workers can
// mask real hosting/network failures. Keep this file deployed at /sw.js so
// existing registrations update, clear old caches, and unregister themselves.
const CACHE_PREFIX = "danyavidmich-";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX))
          .map((cacheName) => caches.delete(cacheName))
      );

      await self.registration.unregister();

      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
