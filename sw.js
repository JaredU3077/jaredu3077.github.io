/**
 * neuOS Service Worker
 * Provides PWA functionality including offline support and caching
 */

const CACHE_NAME = 'neuos-v1.0.0';
const STATIC_CACHE = 'neuos-static-v1.0.0';
const DYNAMIC_CACHE = 'neuos-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/config/manifest.json',
    '/css/design-tokens.css',
    '/css/glass.css',
    '/css/window.css',
    '/css/terminal.css',
    '/css/desktop.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/css/mobile.css',
    '/css/apps.css',
    '/css/theme.css',
    '/css/terminal-icon.css',
    '/js/main.js',
    '/js/config.js',
    '/js/apps/terminal.js',
    '/js/core/window.js',
    '/js/core/boot.js',
    '/js/core/glassEffect.js',
    '/js/core/audioSystem.js',
    '/js/core/particleSystem.js',
    '/js/core/backgroundMusic.js',
    '/js/core/screensaver.js',
    '/js/utils/mobile.js',
    '/js/utils/utils.js',
    '/js/utils/help.js',
    '/js/utils/draggable.js',
    '/js/utils/glassEffects.js',
    '/js/utils/mechvibes.js',
    '/js/core/themeManager.js',
    '/assets/audio/mp3.mp3',
    '/assets/audio/sound.ogg',
    '/config/config.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('neuOS Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('neuOS Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('neuOS Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('neuOS Service Worker: Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('neuOS Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('neuOS Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('neuOS Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== self.location.origin) {
        return;
    }
    
    // Handle different types of requests
    if (request.destination === 'document') {
        // Handle HTML requests
        event.respondWith(handleDocumentRequest(request));
    } else if (request.destination === 'style' || request.destination === 'script') {
        // Handle CSS and JS requests
        event.respondWith(handleStaticRequest(request));
    } else if (request.destination === 'image' || request.destination === 'audio') {
        // Handle media requests
        event.respondWith(handleMediaRequest(request));
    } else {
        // Handle other requests
        event.respondWith(handleDynamicRequest(request));
    }
});

// Handle document requests (HTML)
async function handleDocumentRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache the response for offline use
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        return caches.match('/index.html');
    }
}

// Handle static requests (CSS, JS)
async function handleStaticRequest(request) {
    try {
        // Try cache first for static files
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        
        // Cache for future use
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        
        return networkResponse;
    } catch (error) {
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return a basic response
        return new Response('', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// Handle media requests (images, audio)
async function handleMediaRequest(request) {
    try {
        // Try cache first for media files
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        
        // Cache for future use
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        
        return networkResponse;
    } catch (error) {
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return a basic response
        return new Response('', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// Handle dynamic requests (API calls, etc.)
async function handleDynamicRequest(request) {
    try {
        // Try network first for dynamic content
        const networkResponse = await fetch(request);
        
        // Cache successful responses
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
        
        // Return a basic response
        return new Response('', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('neuOS Service Worker: Background sync triggered:', event.tag);
    
    if (event.tag === 'neuos-sync') {
        event.waitUntil(performBackgroundSync());
    }
});

// Perform background sync
async function performBackgroundSync() {
    try {
        console.log('neuOS Service Worker: Performing background sync');
        
        // Get all clients
        const clients = await self.clients.matchAll();
        
        // Notify clients about sync
        clients.forEach((client) => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                message: 'Background sync completed'
            });
        });
        
        console.log('neuOS Service Worker: Background sync completed');
    } catch (error) {
        console.error('neuOS Service Worker: Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('neuOS Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'neuOS notification',
        icon: '/data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="%23181f2a"/><circle cx="48" cy="48" r="24" fill="none" stroke="%236366f1" stroke-width="4"/><path d="M48 24v24M48 72v24M24 48h24M72 48h24" stroke="%236366f1" stroke-width="4"/><text x="48" y="80" text-anchor="middle" fill="%23eaf1fb" font-family="Arial" font-size="12">neuOS</text></svg>',
        badge: '/data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23181f2a"/><circle cx="16" cy="16" r="8" fill="none" stroke="%236366f1" stroke-width="2"/><path d="M16 8v8M16 24v8M8 16h8M24 16h8" stroke="%236366f1" stroke-width="2"/></svg>',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open neuOS',
                icon: '/data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%236366f1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%236366f1" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('neuOS', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('neuOS Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then((clientList) => {
                    // Check if there's already a window/tab open
                    for (const client of clientList) {
                        if (client.url.includes(self.location.origin) && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    
                    // If no window/tab is open, open a new one
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    console.log('neuOS Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            staticCache: STATIC_CACHE,
            dynamicCache: DYNAMIC_CACHE
        });
    }
});

console.log('neuOS Service Worker: Loaded successfully'); 