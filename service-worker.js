/**
 * service-worker.js
 * Caches only the app shell (HTML/CSS/JS/icons/manifest). Bible chapter data
 * is fetched from bible-api.com and cached separately in IndexedDB (see
 * js/bible-api.js) — the service worker deliberately does NOT cache those
 * cross-origin API responses, so it never serves stale or partial Scripture.
 *
 * Bump CACHE_NAME whenever the app shell changes so old caches get replaced.
 */

const CACHE_NAME = 'bible-app-v7';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/bible-data.js',
  './js/ui-helpers.js',
  './js/storage.js',
  './js/bible-api.js',
  './js/offline-library.js',
  './js/home.js',
  './js/reader.js',
  './js/search.js',
  './js/bookmarks.js',
  './js/settings.js',
  './js/config.js',
  './js/ai-assistant.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names
        .filter((name) => name.startsWith('bible-app-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only manage same-origin GET requests (the app shell). Everything else,
  // including bible-api.com, goes straight to the network untouched.
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));
      return cached || networkFetch;
    })
  );
});
