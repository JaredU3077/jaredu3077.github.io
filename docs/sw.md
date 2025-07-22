# sw.js - Service Worker Documentation

## File Overview

**Purpose**: Progressive Web App (PWA) service worker that provides offline functionality, caching strategies, and background synchronization.

**Type**: JavaScript service worker with comprehensive caching and offline support.

**Role**: Manages application caching, handles offline requests, and provides PWA functionality for the neuOS application.

## Dependencies and Imports

### Service Worker Dependencies

| Resource | Type | Purpose | Version |
|----------|------|---------|---------|
| `caches` | Browser API | Cache storage management | Native |
| `fetch` | Browser API | Network request handling | Native |
| `clients` | Browser API | Client communication | Native |
| `skipWaiting` | Browser API | Service worker activation | Native |
| `claim` | Browser API | Service worker control | Native |

### Cached Resources

| Resource Type | Files | Purpose |
|---------------|-------|---------|
| **Static Files** | `index.html`, CSS files, JS modules | Core application files |
| **Audio Assets** | `mp3.mp3`, `sound.ogg` | Background music and sound effects |
| **Configuration** | `manifest.json`, `config.json` | PWA and app configuration |
| **Core Modules** | Window manager, boot system, etc. | Essential JavaScript modules |

## Internal Structure

### Cache Configuration

```javascript
const CACHE_NAME = 'neuos-v1.0.0';
const STATIC_CACHE = 'neuos-static-v1.0.0';
const DYNAMIC_CACHE = 'neuos-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/config/manifest.json',
    '/css/variables.css',
    '/css/glass.css',
    '/css/window.css',
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
```

### Event Handlers

#### Install Event

```javascript
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
```

#### Activate Event

```javascript
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
```

#### Fetch Event

```javascript
// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle different types of requests
    if (request.destination === 'document') {
        event.respondWith(handleDocumentRequest(request));
    } else if (request.destination === 'style' || request.destination === 'script') {
        event.respondWith(handleStaticRequest(request));
    } else if (request.destination === 'audio' || request.destination === 'image') {
        event.respondWith(handleMediaRequest(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});
```

### Request Handlers

#### Document Request Handler

```javascript
async function handleDocumentRequest(request) {
    try {
        // Try network first, fallback to cache
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the successful response
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('neuOS Service Worker: Network failed for document, trying cache');
    }
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Return offline page if no cache
    return caches.match('/index.html');
}
```

#### Static Request Handler

```javascript
async function handleStaticRequest(request) {
    // Try cache first, then network
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache the response for future use
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('neuOS Service Worker: Failed to fetch static resource:', request.url);
    }
    
    // Return a default response if both cache and network fail
    return new Response('', { status: 404 });
}
```

#### Media Request Handler

```javascript
async function handleMediaRequest(request) {
    // Try cache first for media files
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache media files for offline use
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('neuOS Service Worker: Failed to fetch media:', request.url);
    }
    
    // Return empty response for missing media
    return new Response('', { status: 404 });
}
```

#### Dynamic Request Handler

```javascript
async function handleDynamicRequest(request) {
    try {
        // Try network first for dynamic content
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('neuOS Service Worker: Network failed for dynamic request');
    }
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Return offline response
    return new Response('Offline content not available', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
    });
}
```

### Background Sync

```javascript
async function performBackgroundSync() {
    try {
        // Perform any background synchronization tasks
        console.log('neuOS Service Worker: Performing background sync');
        
        // Example: Sync user preferences
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'backgroundSync',
                data: { timestamp: Date.now() }
            });
        });
        
    } catch (error) {
        console.error('neuOS Service Worker: Background sync failed:', error);
    }
}
```

## Connections and References

### Incoming Connections

| Referencing File | Description | Connection Type |
|------------------|-------------|-----------------|
| `index.html` | Registers service worker | Service worker registration |
| `js/main.js` | May communicate with service worker | PostMessage API |
| Browser | Controls service worker lifecycle | Browser API |

### Outgoing Connections

| Referenced File | Description | Connection Type |
|-----------------|-------------|-----------------|
| `index.html` | Serves cached version | Cache storage |
| `css/*.css` | Caches stylesheets | Cache storage |
| `js/*.js` | Caches JavaScript modules | Cache storage |
| `assets/audio/*` | Caches audio files | Cache storage |
| `config/*.json` | Caches configuration files | Cache storage |

### Bidirectional Connections

| Resource | Cache Strategy | Network Strategy | Description |
|----------|---------------|------------------|-------------|
| HTML documents | Network first, cache fallback | Fetch from network | Main application pages |
| CSS/JS files | Cache first, network fallback | Fetch from network | Static assets |
| Audio files | Cache first, network fallback | Fetch from network | Media assets |
| Configuration | Cache first, network fallback | Fetch from network | App settings |

## Data Flow and Architecture

### Service Worker Lifecycle

```javascript
// 1. Registration (in index.html)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('Service Worker registered');
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}

// 2. Installation
self.addEventListener('install', event => {
    // Cache static files
    event.waitUntil(cacheStaticFiles());
});

// 3. Activation
self.addEventListener('activate', event => {
    // Clean up old caches
    event.waitUntil(cleanupOldCaches());
});

// 4. Fetch handling
self.addEventListener('fetch', event => {
    // Handle different request types
    event.respondWith(handleRequest(event.request));
});
```

### Caching Strategy

```javascript
// Cache-first for static assets
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Offline', { status: 503 });
    }
}

// Network-first for dynamic content
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        // Fallback to cache
    }
    
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
}
```

### Offline Functionality

```javascript
// Offline detection
self.addEventListener('fetch', event => {
    if (!navigator.onLine) {
        // Serve cached content when offline
        event.respondWith(serveOfflineContent(event.request));
    }
});

// Offline content serving
async function serveOfflineContent(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/index.html');
}
```

## Potential Issues and Recommendations

### Standards Compliance Issues

1. **Service Worker Registration**: Proper registration with error handling
   - **Status**: ✅ Properly implemented
   - **Recommendation**: Add update detection and notification

2. **Cache Strategy**: Appropriate caching strategies for different content types
   - **Status**: ✅ Properly implemented
   - **Recommendation**: Add cache size limits and cleanup

3. **Offline Support**: Comprehensive offline functionality
   - **Status**: ✅ Properly implemented
   - **Recommendation**: Add offline-first features

### Performance Issues

1. **Cache Size**: Large cache may impact storage
   - **Issue**: All static files cached
   - **Fix**: Implement cache size limits and cleanup

2. **Cache Invalidation**: No automatic cache invalidation
   - **Issue**: Old cached content may be served
   - **Fix**: Implement cache versioning and invalidation

3. **Background Sync**: Limited background sync functionality
   - **Issue**: No background sync implementation
   - **Fix**: Add background sync for user preferences

### Security Issues

1. **Cache Security**: No cache validation
   - **Issue**: Cached content may be compromised
   - **Fix**: Add integrity checks for cached content

2. **Request Filtering**: Basic request filtering
   - **Issue**: May cache sensitive content
   - **Fix**: Add content-type filtering

3. **Error Handling**: Basic error handling
   - **Issue**: Service worker may fail silently
   - **Fix**: Add comprehensive error logging

### Architecture Issues

1. **Cache Management**: Manual cache management
   - **Issue**: No automatic cache cleanup
   - **Fix**: Implement automatic cache size management

2. **Update Strategy**: No update notification
   - **Issue**: Users may not know about updates
   - **Fix**: Add update detection and user notification

3. **Background Tasks**: Limited background functionality
   - **Issue**: No background processing
   - **Fix**: Add background sync and push notifications

## Related Documentation

- See [index.md](index.md) for HTML entry point details
- See [main.md](main.md) for JavaScript initialization
- See [architecture.md](architecture.md) for overall system architecture
- See [config.md](config.md) for configuration management 