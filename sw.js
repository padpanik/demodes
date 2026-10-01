// Service worker de Brilliant en ligne
// - garde en cache la page, les icônes et les bibliothèques (Vue, PeerJS)
//   pour que l'application démarre vite, même avec un réseau faible ;
// - la page elle-même est toujours prise sur le réseau d'abord : une nouvelle
//   version mise en ligne sur GitHub est donc visible dès le prochain lancement.
// Pensez à changer VERSION à chaque mise en ligne (même numéro que dans index.html).

const VERSION = '1.05 beta';
const CACHE = 'brilliant-' + VERSION;

const FICHIERS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon.png',
  'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js',
  'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'
];

// Bibliothèques externes qu'on accepte de mettre en cache (versions figées)
const EXTERNES = FICHIERS.filter(u => u.startsWith('http'));

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      // Un fichier qui échoue ne doit pas bloquer l'installation
      Promise.allSettled(FICHIERS.map(u => cache.add(u)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(noms => Promise.all(noms.filter(n => n.startsWith('brilliant-') && n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const memeSite = url.origin === self.location.origin;

  // Tout le reste (serveur de mise en relation PeerJS, etc.) passe sans cache
  if (!memeSite && !EXTERNES.includes(req.url)) return;

  // La page : réseau d'abord (pour avoir la dernière version), cache si hors ligne
  if (req.mode === 'navigate' || (memeSite && url.pathname.endsWith('.html'))) {
    event.respondWith(
      fetch(req)
        .then(rep => {
          const copie = rep.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copie));
          return rep;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Icônes, manifest, bibliothèques : cache d'abord, réseau sinon
  event.respondWith(
    caches.match(req).then(enCache => enCache || fetch(req).then(rep => {
      if (rep.ok) { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(req, copie)); }
      return rep;
    }))
  );
});
