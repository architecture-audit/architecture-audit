// Service Worker for AI Architecture Audit PWA
const CACHE_NAME = 'ai-audit-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/docs/assets/css/site-navigation.css',
  '/docs/assets/css/docs-base.css',
  '/docs/assets/js/site-navigation.js',
  '/docs/assets/js/notifications.js',
  '/docs/assets/js/validation.js',
  '/docs/assets/js/auto-save.js',
  '/docs/assets/js/progress-tracker.js',
  '/docs/assets/js/loading-overlay.js',
  '/docs/assets/js/calculator-utils.js',
  '/docs/assets/js/dark-mode.js',
  // Calculator pages
  '/calculators/ai-readiness/',
  '/calculators/cloud-migration/',
  '/calculators/mlops-audit/',
  '/calculators/llm-framework/',
  '/calculators/security-audit/',
  '/calculators/cost-optimization/',
  // Calculator JS
  '/docs/assets/js/ai-readiness.js',
  '/docs/assets/js/cloud-migration.js',
  '/docs/assets/js/mlops-audit.js',
  '/docs/assets/js/llm-framework.js',
  '/docs/assets/js/security-audit.js',
  '/docs/assets/js/cost-optimization.js',
  // Calculator CSS
  '/docs/assets/css/ai-readiness.css',
  '/docs/assets/css/cloud-migration.css',
  '/docs/assets/css/mlops-audit.css',
  '/docs/assets/css/llm-framework.css',
  '/docs/assets/css/security-audit.css',
  '/docs/assets/css/cost-optimization.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('❌ Cache installation failed:', error);
      })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('📋 Serving from cache:', event.request.url);
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache for future use
          caches.open(CACHE_NAME)
            .then(cache => {
              // Cache successful responses
              if (event.request.url.includes('/docs/')) {
                cache.put(event.request, responseToCache);
                console.log('💾 Cached:', event.request.url);
              }
            });

          return response;
        });
      })
      .catch(error => {
        console.error('❌ Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        
        // Return a custom offline response for other requests
        return new Response('Offline - Content not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Background sync for saving data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-calculator-data') {
    event.waitUntil(syncCalculatorData());
  }
});

async function syncCalculatorData() {
  try {
    // Get all calculator data from IndexedDB or localStorage
    const clients = await self.clients.matchAll();
    
    for (const client of clients) {
      // Send message to client to trigger save
      client.postMessage({
        type: 'SYNC_DATA',
        message: 'Syncing calculator data...'
      });
    }
    
    console.log('✅ Calculator data synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// Listen for messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(event.data.urls))
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

async function updateCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // Update critical resources
    const criticalUrls = [
      '/index.html',
      '/docs/assets/js/site-navigation.js',
      '/docs/assets/js/notifications.js'
    ];
    
    for (const url of criticalUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('🔄 Updated:', url);
        }
      } catch (error) {
        console.error('❌ Failed to update:', url, error);
      }
    }
  } catch (error) {
    console.error('❌ Cache update failed:', error);
  }
}

console.log('✅ Service Worker loaded');