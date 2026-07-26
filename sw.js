// ---------- Service Worker: Study Notes ----------
// PURPOSE: this file exists ONLY so the browser considers the site
// "installable" as an app icon on the home screen / desktop.
//
// IT DOES NOT CACHE ANYTHING. Every request always goes to the network.
// If there is no internet connection, the app will NOT open — by design.

// Install immediately, don't wait around.
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Take control of any open tabs right away.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass every request straight to the network. No caching, no offline fallback.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
