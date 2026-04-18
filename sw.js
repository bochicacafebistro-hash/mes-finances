/**
 * Mes Finances — Service Worker (PWA)
 */

const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `mes-finances-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/state.js',
  '/js/icons.js',
  '/js/i18n.js',
  '/js/utils.js',
  '/js/pages.js',
  '/js/sidebar.js',
  '/js/auth.js',
  '/js/firebase-listeners.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

const NEVER_CACHE = ['firestore.googleapis.com', 'firebase', 'googleapis.com', 'gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL).catch((err) => console.warn('SW précache partiel', err))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k.startsWith('mes-finances-') && k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (NEVER_CACHE.some((d) => url.hostname.includes(d))) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((net) => {
        if (net && net.status === 200 && net.type === 'basic') {
          const clone = net.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return net;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
