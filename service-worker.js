importScripts("firebase-sw-config.js?v=live-47");

if (self.largsFirebaseMessagingConfig?.enabled) {
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");
  firebase.initializeApp(self.largsFirebaseMessagingConfig.firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    self.registration.showNotification(notification.title || "Largs Colts 2016s", {
      body: notification.body || "New team update",
      icon: "assets/app-icon-192.png",
      badge: "assets/app-icon-192.png",
      data: payload.data || {},
    });
  });
}

const cacheName = "largs-colts-live-47";
const appShell = [
  "./",
  "index.html",
  "firebase-config.js",
  "firebase-sw-config.js",
  "styles.css",
  "app.js",
  "manifest.json",
  "assets/LargsColtsCrest.png",
  "assets/app-icon-192.png",
  "assets/app-icon-512.png",
  "assets/pitch-pattern.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(appShell)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(cacheName).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
