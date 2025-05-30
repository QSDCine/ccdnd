const CACHE_NAME = "combate-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/foes.html",
  "/combate.html",
  "/index.css",
  "/foes.css",
  "/combate.css",
  "/manifest.json",
  "/sw.js",
  "/icon-192.png",
  "/icon-512.png",
  "/index.js",
  "/foes.js",
  "/combate.js"
];

// Instala y cachea archivos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activa el SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});

// Intercepta las peticiones
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
