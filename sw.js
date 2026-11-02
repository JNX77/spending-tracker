// Network-first for the app shell so updates arrive; falls back to cache offline.
const CACHE = 'spending-v15';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-v3-180.png', './icon-v3-192.png', './icon-v3-512.png',
  './lib/scanic/scanic.js', './lib/xlsx.mini.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('version.txt')) return;
  e.respondWith(
    // 'no-cache' revalidates with the server so a stale browser cache never serves an old page
    fetch(e.request.url, {cache: 'no-cache'})
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
