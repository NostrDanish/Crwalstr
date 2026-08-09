/// <reference lib="webworker" />

// Crawlstr Service Worker
//
// Caching strategy:
//   - HTML / navigation  → NETWORK ONLY (never cached)
//       The HTML references hashed bundle filenames. Caching it would pin the
//       app to a stale bundle forever, which is exactly the "Card is not
//       defined" class of ghost error.
//   - Hashed assets      → cache-first (immutable, filename changes on rebuild)
//   - Everything else    → network-first
//
// Bump CACHE_NAME whenever this strategy changes to purge old caches.

const CACHE_NAME = 'crawlstr-v3';

// Only genuinely immutable, non-HTML assets are precached.
const STATIC_ASSETS = [
  '/manifest.webmanifest',
];

/** True for requests we must never serve from cache. */
function isHtmlRequest(request, url) {
  if (request.mode === 'navigate') return true;
  if (request.destination === 'document') return true;
  if ((request.headers.get('accept') || '').includes('text/html')) return true;
  // Bare paths and explicit .html files
  if (url.pathname === '/' || url.pathname.endsWith('.html')) return true;
  return false;
}

/** Hashed build output, e.g. /main-UVK54ZXC.js — safe to cache forever. */
function isHashedAsset(url) {
  return /-[A-Z0-9]{8,}\.(js|css)$/i.test(url.pathname);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET; let everything else go straight to the network.
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Never touch WebSocket upgrades (Nostr relays).
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;
  if (request.headers.get('upgrade') === 'websocket') return;

  // Only manage same-origin traffic.
  if (url.origin !== self.location.origin) return;

  // ---- HTML: network only, never cached -------------------------------
  if (isHtmlRequest(request, url)) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(
        () =>
          new Response(
            '<!doctype html><meta charset="utf-8"><title>Offline</title>' +
              '<body style="font:16px system-ui;padding:2rem">' +
              '<h1>Offline</h1><p>Crawlstr needs a connection to load. ' +
              'Your crawl queue is saved and will resume.</p>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 },
          ),
      ),
    );
    return;
  }

  // ---- Hashed build assets: cache-first (immutable) -------------------
  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // ---- Everything else: network-first, cache as fallback --------------
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});

// Allow the page to force an immediate activation after an update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
