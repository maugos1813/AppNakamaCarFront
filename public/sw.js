// Minimal app-shell cache — installability + a graceful offline fallback.
// No complex offline strategy on purpose (tracking data must always be fresh).
const CACHE_NAME = 'nakamacar-shell-v1';
const SHELL_ASSETS = ['/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;
  if (request.url.includes('/api/')) return;

  // Cache-first for shell assets; everything else goes straight to the
  // network. The previous version fell back to `cached` on a failed fetch
  // even when nothing was cached, resolving to `undefined` — which the
  // browser can't turn into a Response and throws "Failed to convert value
  // to 'Response'". Uncached requests now just resolve/reject with the real
  // fetch, which the Fetch API handles correctly either way.
  event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
});
