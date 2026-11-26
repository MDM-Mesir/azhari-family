// Service worker Azhari Family: menyimpan tampilan agar cepat dibuka; data selalu diambil dari server
var VERSI = 'af-v1';
var BERKAS = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'maskable-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(BERKAS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n !== VERSI; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // Halaman & config: ambil versi terbaru dulu, pakai simpanan jika offline
  if (r.mode === 'navigate' || /config\.js$/.test(r.url)) {
    e.respondWith(fetch(r).then(function (res) {
      var salin = res.clone(); caches.open(VERSI).then(function (c) { c.put(r, salin); }); return res;
    }).catch(function () { return caches.match(r).then(function (x) { return x || caches.match('index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (x) { return x || fetch(r); }));
});
