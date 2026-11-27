// Service worker Azhari Family: menyimpan tampilan agar cepat dibuka; data selalu diambil dari server
var VERSI = 'af-v2';
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

// Notifikasi aplikasi (dikirim server lewat Firebase Cloud Messaging)
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { data: { body: e.data ? e.data.text() : '' } }; }
  var isi = d.data || d.notification || d;
  e.waitUntil(self.registration.showNotification(isi.title || 'Azhari Family', {
    body: isi.body || '', icon: 'icon-192.png', badge: 'icon-192.png', data: { url: isi.url || './' }
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var tujuan = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (daftar) {
    for (var i = 0; i < daftar.length; i++) if (daftar[i].url.indexOf('/azhari-family/') >= 0 && 'focus' in daftar[i]) return daftar[i].focus();
    return self.clients.openWindow(tujuan);
  }));
});
