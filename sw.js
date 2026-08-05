/**
 * PassEvolver - Service Worker v1.2
 * 100% Offline Asset Cache & Automated Cache Clear Management
 */

const CACHE_NAME = 'passevolver-v1.2-cache';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon.svg',
  './js/app.js',
  './js/ui.js',
  './js/engine.js',
  './js/matrix.js',
  './js/shield-canvas.js',
  './js/qr.js',
  './js/cli.js'
];

// Install Event
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - Purge Legacy & Stale Caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message Listener for On-Demand & Refresh Cache Clear Commands
self.addEventListener('message', (e) => {
  if (e.data && e.data.action === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      if (e.ports && e.ports[0]) {
        e.ports[0].postMessage({ success: true });
      }
    });
  }
});

// Fetch Event - Stale-While-Revalidate Strategy with Offline Fallback
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
