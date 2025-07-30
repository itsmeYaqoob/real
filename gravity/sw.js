// Gravity Glutes Service Worker
const CACHE_NAME = 'gravity-glutes-v1.0.0';
const STATIC_CACHE = 'gravity-glutes-static-v1.0.0';
const DYNAMIC_CACHE = 'gravity-glutes-dynamic-v1.0.0';

// Files to cache for offline use
const STATIC_FILES = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Files that should always be fetched from network first
const NETWORK_FIRST_URLS = [
    './manifest.json'
];

// Files that can be served from cache first
const CACHE_FIRST_URLS = [
    './style.css',
    './script.js'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete old caches that don't match current version
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                // Take control of all clients immediately
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('Service Worker: Error during activation:', error);
            })
    );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    
    // Only handle same-origin requests
    if (requestUrl.origin !== self.location.origin) {
        return;
    }
    
    // Handle different caching strategies based on request
    if (NETWORK_FIRST_URLS.some(url => event.request.url.includes(url))) {
        // Network first strategy (for dynamic content)
        event.respondWith(networkFirst(event.request));
    } else if (CACHE_FIRST_URLS.some(url => event.request.url.includes(url))) {
        // Cache first strategy (for static assets)
        event.respondWith(cacheFirst(event.request));
    } else {
        // Default: Cache first with network fallback
        event.respondWith(cacheFirstWithNetworkFallback(event.request));
    }
});

// Cache first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Cache first with network fallback (default strategy)
async function cacheFirstWithNetworkFallback(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Update cache in background
            updateCache(request);
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.error('Cache first with network fallback failed:', error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('./index.html');
        }
        
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Background cache update
async function updateCache(request) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse);
    } catch (error) {
        // Silently fail background updates
        console.log('Background cache update failed:', error);
    }
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'GET_CACHE_SIZE':
                getCacheSize()
                    .then(size => {
                        event.ports[0].postMessage({ size });
                    });
                break;
                
            case 'CLEAR_CACHE':
                clearCache()
                    .then(() => {
                        event.ports[0].postMessage({ success: true });
                    })
                    .catch(error => {
                        event.ports[0].postMessage({ success: false, error });
                    });
                break;
                
            default:
                console.log('Unknown message type:', event.data.type);
        }
    }
});

// Get total cache size
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

// Clear all caches
async function clearCache() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// Background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Handle any pending workout data sync
        const pendingData = await getStoredData('pendingSync');
        if (pendingData && pendingData.length > 0) {
            // In a real app, you'd sync this data to a server
            console.log('Background sync: Processing pending data', pendingData);
            
            // Clear pending data after successful sync
            await clearStoredData('pendingSync');
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Helper functions for IndexedDB storage (for background sync)
async function getStoredData(key) {
    return new Promise((resolve) => {
        // Simplified localStorage fallback
        try {
            const data = localStorage.getItem(key);
            resolve(data ? JSON.parse(data) : null);
        } catch (error) {
            resolve(null);
        }
    });
}

async function clearStoredData(key) {
    return new Promise((resolve) => {
        try {
            localStorage.removeItem(key);
            resolve();
        } catch (error) {
            resolve();
        }
    });
}

// Handle push notifications (if implemented)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Time for your workout!',
            icon: './icon-192x192.png',
            badge: './icon-96x96.png',
            vibrate: [200, 100, 200],
            data: data,
            actions: [
                {
                    action: 'open',
                    title: 'Open App'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Gravity Glutes', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then((clientList) => {
                    // Focus existing window if available
                    for (const client of clientList) {
                        if (client.url.includes('gravity') && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    
                    // Open new window if no existing window
                    if (clients.openWindow) {
                        return clients.openWindow('./');
                    }
                })
        );
    }
});

// Log service worker lifecycle
console.log('Service Worker: Script loaded');