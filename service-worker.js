/**
 * AURALIS Service Worker v1.0 — offline-first PWA (Task SS)
 * ============================================================
 * Cache strategies:
 *   App shell (HTML/CSS/JS) → cache-first
 *   i18n files → stale-while-revalidate
 *   Audio files → cache-first (persist across versions)
 *   manifest.json → network-first
 *
 * Auto-update: VERSION bump → activate clears old caches → notify user.
 */

// REGRESSION FIX 2026-05-26: bump version за да force-нем cache evict.
// Phone test показа че стар audio-engine.js (с path 'audio/library/' от
// преди commit d747b55) се сервира от кеша → всичките P0/P1 fix-ове бяха
// invisible на устройството. cache-first strategy не може да види
// промените в js файлове без VERSION bump.
//
// CACHE_AUDIO бамп също защото старите URLs (audio/library/* и
// library_staging_loop_ready/*) са персистнали → нови URLs
// (library_staging_normalized/*) не са в стария cache + 503 offline.
var VERSION = '1.0.94';
var CACHE_SHELL = 'auralis-shell-v' + VERSION;
var CACHE_I18N = 'auralis-i18n-v' + VERSION;
var CACHE_AUDIO = 'auralis-audio-v3';

var SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/tokens.css',
  '/css/base.css',
  '/css/reset.css',
  '/css/onboarding.css',
  '/css/quiz.css',
  '/css/mixer.css',
  '/css/library.css',
  '/css/sleep.css',
  '/css/sos.css',
  '/css/diary.css',
  '/css/calm.css',
  '/css/settings.css',
  '/css/pitch-test.css',
  '/css/toast.css',
  '/css/noise-picker.css',
  '/css/player.css',
  '/css/home.css',
  '/css/category-view.css',
  '/css/favorites.css',
  '/js/i18n.js',
  '/js/state.js',
  '/js/app.js',
  '/js/toast.js',
  '/js/audio-engine.js',
  '/js/audio-resilience.js',
  '/js/home.js',
  '/js/category-view.js',
  '/js/favorites.js',
  '/js/library.js',
  '/js/sound-detail.js',
  '/js/player.js',
  '/js/settings.js',
  '/js/pitch-test.js'
];

// ============================================================
// Install — precache shell
// ============================================================

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_SHELL).then(function (cache) {
      // DESYNC FIX 2026-05-30: НЕ ползваме cache.addAll защото то fetch-ва
      // през browser HTTP cache (default). При дълъг max-age browser-ът
      // може да върне СТАР css/js → тогава новият SW cache получава СТАР
      // файл въпреки VERSION bump → desync (нов JS markup + стар CSS, или
      // стар audio-engine.js → master volume reset на 50%).
      // fetch с {cache:'reload'} bypass-ва HTTP cache → винаги свеж файл.
      // Грешка на отделен файл НЕ прекъсва целия precache (per-file catch).
      return Promise.all(SHELL_FILES.map(function (url) {
        return fetch(new Request(url, { cache: 'reload' })).then(function (resp) {
          if (resp && resp.ok) {
            return cache.put(url, resp);
          }
        }).catch(function (err) {
          console.warn('[SW] precache fail:', url, err);
        });
      }));
    })
  );
  self.skipWaiting();
});

// ============================================================
// Activate — clean old caches + notify clients
// ============================================================

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== CACHE_SHELL && key !== CACHE_I18N && key !== CACHE_AUDIO;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    }).then(function () {
      return self.clients.matchAll().then(function (clients) {
        clients.forEach(function (client) {
          client.postMessage({ type: 'SW_UPDATED', version: VERSION });
        });
      });
    })
  );
});

// ============================================================
// Fetch — strategy router
// ============================================================

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  var pathname = url.pathname;

  // /api/* (PHP endpoints) — никога не кешираме; винаги network passthrough.
  // Beacon-ите са POST (вече return-нати горе), но guard-ваме и GET за всеки случай.
  if (pathname.indexOf('/api/') !== -1) {
    return;
  }

  if (pathname.indexOf('/i18n/') !== -1) {
    e.respondWith(staleWhileRevalidate(e.request, CACHE_I18N));
    return;
  }

  if (pathname.indexOf('/audio/') !== -1 ||
      pathname.indexOf('/library_staging_') !== -1 ||
      pathname.endsWith('.mp3') || pathname.endsWith('.wav') ||
      pathname.endsWith('.ogg') || pathname.endsWith('.opus') ||
      pathname.endsWith('.m4a') || pathname.endsWith('.aac')) {
    e.respondWith(cacheFirst(e.request, CACHE_AUDIO));
    return;
  }

  if (pathname.endsWith('manifest.json')) {
    e.respondWith(networkFirst(e.request, CACHE_SHELL));
    return;
  }

  e.respondWith(cacheFirst(e.request, CACHE_SHELL));
});

// ============================================================
// Message handler
// ============================================================

self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Version handshake — page-ът пита активния SW коя версия cache-ва.
  // Ако page CODE_VERSION !== SW VERSION → има нов код cached → show update button.
  if (e.data && e.data.type === 'GET_VERSION') {
    if (e.ports && e.ports[0]) {
      e.ports[0].postMessage({ type: 'VERSION', version: VERSION });
    }
  }
});

// ============================================================
// Cache strategies
// ============================================================

function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (response.ok) {
          var cloned = response.clone();
          cache.put(request, cloned);
        }
        return response;
      }).catch(function () {
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    });
  });
}

function networkFirst(request, cacheName) {
  return fetch(request).then(function (response) {
    if (response.ok) {
      var cloned = response.clone();
      caches.open(cacheName).then(function (cache) {
        cache.put(request, cloned);
      });
    }
    return response;
  }).catch(function () {
    return caches.open(cacheName).then(function (cache) {
      return cache.match(request);
    });
  });
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var fetchPromise = fetch(request).then(function (response) {
        if (response.ok) {
          var cloned = response.clone();
          cache.put(request, cloned);
        }
        return response;
      }).catch(function () { return cached; });
      return cached || fetchPromise;
    });
  });
}
