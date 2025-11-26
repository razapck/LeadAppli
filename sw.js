// Nom du cache - incrémenté v3 pour forcer la mise à jour immédiate
const CACHE_NAME = 'leadscout-v3';

// Fichiers critiques à mettre en cache (App Shell)
// Utilisation de chemins absolus pour éviter les erreurs de chemin relatif
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation : Mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  // Force le service worker à s'activer immédiatement
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  // Stratégie : Network First, falling back to Cache
  // On essaie d'avoir la version la plus fraîche, sinon on prend le cache
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la réponse réseau est valide, on la retourne
        // Optionnel : On pourrait mettre à jour le cache ici dynamiquement
        return response;
      })
      .catch(() => {
        // Si le réseau échoue (offline), on cherche dans le cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Fallback pour la navigation SPA : 
          // Si on demande une page HTML (navigation) et qu'on est offline, renvoyer index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Prendre le contrôle des clients immédiatement
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});