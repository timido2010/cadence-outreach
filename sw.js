/* Cadence service worker — cache the app shell for offline use. */
const CACHE = 'cadence-v3';
const ASSETS = [
  './',
  './index.html',
  './assets/styles.css',
  './assets/app.js',
  './assets/icon.svg',
  './manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  // {cache:'reload'} forces fresh copies from the network on each new version,
  // so bumping CACHE above is all it takes to push an update to installed apps.
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for our own GET assets; network otherwise. App is fully local, so
// this makes it work with no connection at all once loaded once.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html'))
    )
  );
});
