// AURALIS Service Worker v0.1 — skeleton (празни handlers)
// Бъдеще: offline cache на app shell + audio buffers за нощен mixer

const CACHE_VERSION = 'auralis-v0.1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // skeleton: passes through to network (no cache yet)
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
