// Define Cache
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_STORE = [

];


// Install 
self.addEventListener("install", function (e){
    
    // Pre-cache data
    e.waitUntil(
        caches.open(DATA_CACHE_NAME).then((cache) => cache.add(" ** add path here ** "))
    );

    // Pre-cache all static assets
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_STORE))
    );

    // Tell browser to activate service worker once it has installed
    self.skipWaiting();
});

// Activate
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Erasing cache", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch cache
self.addEventListener("fetch", e => {
    if (e.request.url.includes(" *enter path here* ")) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(e.request)
                    .then(response => {
                        // If good response, clone and store it in cache
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        // Failed request - retrieve from cache
                        return cache.match(e.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }
    e.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(e.request).then(resonse => {
                return response || fetch(e.request);
            });
        })
    );
});