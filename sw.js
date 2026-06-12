/* Bloom Service Worker — cache-first for offline PWA support */

const CACHE = 'bloom-v22';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './favicon.ico',
  './apple-touch-icon.png',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const targetUrl = e.notification.data?.url || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin) && 'focus' in c);
      return existing ? existing.focus() : clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch {}

  const title = data.title || 'Bloom';
  e.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: './apple-touch-icon.png',
      badge: './apple-touch-icon.png',
      tag: data.tag || 'bloom-reminder',
      renotify: false,
      data: { url: data.url || './' },
    })
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // CDN resources: network-first, fall back to cache
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // HTML: network-first so updates are picked up immediately, fall back to cache offline
  if (e.request.destination === 'document' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else (JS, CSS, images): cache-first for speed
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      });
    })
  );
});
