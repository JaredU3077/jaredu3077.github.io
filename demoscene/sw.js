// Service Worker for DarkWave Demoscene Platform

const CACHE_NAME = 'darkwave-v1.0.0';
const STATIC_CACHE = 'darkwave-static-v1.0.0';
const DYNAMIC_CACHE = 'darkwave-dynamic-v1.0.0';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/DarkWave.css',
    '/js/DarkWaveAudio.js',
    '/js/DarkWaveCore.js',
    '/js/WebGLUtils.js',
    '/js/QuantumVortex.js',
    '/js/demoscene.js',
    '/js/main.js',
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
        // HTML files - cache first, then network
        event.respondWith(handleHtmlRequest(request));
    } else if (url.pathname.includes('/js/') || url.pathname.includes('/css/')) {
        // Static assets - cache first, then network
        event.respondWith(handleStaticRequest(request));
    } else if (url.pathname.includes('/api/')) {
        // API requests - network first, then cache
        event.respondWith(handleApiRequest(request));
    } else {
        // Other requests - network first, then cache
        event.respondWith(handleDynamicRequest(request));
    }
});

async function handleHtmlRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Failed to handle HTML request:', error);
        return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

async function handleStaticRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Failed to handle static request:', error);
        return new Response('Asset not available offline', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

async function handleApiRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        console.error('Failed to handle API request:', error);
        return new Response('API not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

async function handleDynamicRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        console.error('Failed to handle dynamic request:', error);
        return new Response('Resource not available offline', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Perform background sync operations
        console.log('Performing background sync...');
        
        // Example: sync offline comments
        const offlineComments = await getOfflineComments();
        if (offlineComments.length > 0) {
            await syncComments(offlineComments);
        }
        
        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

async function getOfflineComments() {
    // Get comments from IndexedDB or localStorage
    return JSON.parse(localStorage.getItem('offline-comments') || '[]');
}

async function syncComments(comments) {
    // Sync comments to server when online
    // This is a placeholder implementation
    console.log('Syncing comments:', comments);
    
    // Clear offline comments after successful sync
    localStorage.removeItem('offline-comments');
}

// Push notifications
self.addEventListener('push', event => {
    console.log('Push notification received:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'New demo available!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Demo',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('DarkWave Demoscene', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling
self.addEventListener('message', event => {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled rejection:', event.reason);
}); 