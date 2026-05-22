const CACHE = 'ich-museum-v2';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      if (res.ok) { const clone = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, clone)); }
      return res;
    }))
  );
});
