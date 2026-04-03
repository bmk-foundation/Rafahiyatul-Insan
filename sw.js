const CACHE_NAME = "rafahiyatul-cache-v1";

const urlsToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "images/logo.webp"
];

// Install Event
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch Event (Offline Support)
self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
