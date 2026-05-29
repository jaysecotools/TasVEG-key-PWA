const CACHE = "tasveg-v8.0.1";
const VERSION = "8.0.1";

const ASSETS = [
    "./",
    "./index.html",
    "./app.js",
    "./storage.js",
    "./export.js",
    "./report.js",
    "./version.js",
    "./manifest.json",
    "./version.json",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
];

// Track version in cache
self.addEventListener("install", e => {
    console.log(`Service Worker version ${VERSION} installing`);
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then(async cache => {
            await cache.addAll(ASSETS);
            // Store version info in cache
            await cache.put('/sw-version', new Response(VERSION));
        })
    );
});

self.addEventListener("activate", e => {
    console.log(`Service Worker version ${VERSION} activated`);
    // Clean up old caches
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE && key.startsWith('tasveg-'))
                    .map(key => caches.delete(key))
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Add version check endpoint
self.addEventListener('fetch', e => {
    // Handle version check requests
    if (e.request.url.includes('/check-version')) {
        e.respondWith(
            new Response(JSON.stringify({ version: VERSION, cache: CACHE }), {
                headers: { 'Content-Type': 'application/json' }
            })
        );
        return;
    }
    
    // Handle version.json with no-cache
    if (e.request.url.includes('/version.json')) {
        e.respondWith(
            fetch(e.request, { cache: 'no-store' }).catch(() => {
                return caches.match(e.request);
            })
        );
        return;
    }
    
    // Default fetch handler
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request).catch(() => {
                return caches.match("./index.html");
            });
        })
    );
});

// Handle messages from client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
