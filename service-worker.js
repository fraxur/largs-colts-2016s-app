/* Cache only explicitly public application assets. */
// Register before the messaging SDK, whose own click handler stops propagation
// and can return without opening the app when a notification has no link.
self.addEventListener("notificationclick", event => {
  event.stopImmediatePropagation();
  event.notification.close();
  event.waitUntil(self.clients.openWindow(new URL("./", self.registration.scope).href));
});
importScripts("firebase-sw-config.js?v=live-64");
if (self.largsFirebaseMessagingConfig?.enabled) {
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");
  firebase.initializeApp(self.largsFirebaseMessagingConfig.firebaseConfig);
  firebase.messaging().onBackgroundMessage(payload => {
    // FCM displays notification payloads itself; show only data-only messages here.
    if (payload.notification) return;
    return self.registration.showNotification("Largs Colts update", {
    body: "Open the app to view your update.", icon: "assets/app-icon-192.png",
    badge: "assets/app-icon-192.png", data: payload.data || {},
  });
  });
}
const cachePrefix = "largs-colts-";
// The 4.0.63 worker deletes every other largs-colts-* cache, including newer
// releases. A separate public-only namespace survives its in-flight cleanup.
const cacheName = "largs-public-shell-64";
const appShell = ["./", "index.html", "firebase-config.js?v=live-64", "firebase-sw-config.js?v=live-64",
  "styles.css?v=live-64", "app.js?v=live-64", "season-blocks.js?v=live-64", "manifest.json?v=live-64",
  "assets/LargsColtsCrest.png", "assets/app-icon-192.png", "assets/app-icon-512.png", "assets/pitch-pattern.svg"];
// Lazy-cache the public renderer only when used; private PDF/blob bytes are never eligible.
const publicUrls = new Set([...appShell, "document-preview.js?v=live-64", "assets/pdf.mjs", "assets/pdf.worker.mjs"].map(path => new URL(path, self.registration.scope).href));
const clearLegacyCaches = () => caches.keys().then(keys => Promise.all(keys
  .filter(key => {
    const publicVersion = key.match(/^largs-public-shell-(\d+)$/);
    // Never let an older worker erase a future release during handover.
    return key.startsWith(cachePrefix) || (publicVersion && Number(publicVersion[1]) < 64);
  }).map(key => caches.delete(key))));
self.addEventListener("install", event => event.waitUntil(caches.open(cacheName)
  .then(cache => cache.addAll(appShell)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(clearLegacyCaches()
  .then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  // Old workers can finish an unawaited cache write after handover. Sweep only our namespace.
  event.waitUntil(clearLegacyCaches());
  const request = event.request, url = new URL(request.url);
  if (request.method !== "GET" || request.headers.has("authorization") || url.origin !== self.location.origin || !publicUrls.has(url.href)) return;
  event.respondWith(fetch(request).then(async response => {
    if (response.ok && response.type !== "opaque" && !/no-store|private/i.test(response.headers.get("cache-control") || "")) {
      const cache = await caches.open(cacheName); await cache.put(request, response.clone());
    }
    return response;
  }).catch(() => caches.open(cacheName).then(cache => cache.match(request))));
});
self.addEventListener("message", event => {
  if (event.data?.type === "PUBLIC_CACHE_POLICY") event.waitUntil(clearLegacyCaches()
    .then(() => event.ports[0]?.postMessage({version:64,publicOnly:true})));
});
