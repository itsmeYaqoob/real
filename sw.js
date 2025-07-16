const CACHE_NAME = 'gravity-glutes-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://i.imgur.com/8QJb2c2.png', // Icon 192
  'https://i.imgur.com/fQj9k6t.png', // Icon 512
  'https://i.imgur.com/8Qj8n9T.gif', // Exercise GIFs...
  'https://i.imgur.com/K4z3r8E.gif',
  'https://i.imgur.com/HnUjQ5H.gif',
  'https://i.imgur.com/gK2Jz8E.gif',
  'https://i.imgur.com/lOQzK7d.gif',
  'https://i.imgur.com/P5d9v3f.gif',
  'https://i.imgur.com/kS9yJjR.gif',
  'https://i.imgur.com/5u9b2bZ.gif',
  'https://i.imgur.com/D4sT1wR.gif'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});