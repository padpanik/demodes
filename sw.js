// Service worker de Désdale
// - garde en cache les pages, les icônes et les bibliothèques (Vue, PeerJS)
//   pour que l'application démarre vite, même avec un réseau faible ;
// - nos propres pages, scripts et styles sont toujours pris sur le réseau d'abord : une nouvelle
//   version mise en ligne sur GitHub est donc visible dès le prochain lancement.
// Pensez à changer VERSION à chaque mise en ligne (même numéro que dans commun.js et brilliant.html).

const VERSION = '1.59';
const CACHE = 'desdale-' + VERSION;

const FICHIERS = [
  './',
  './index.html',
  './brilliant.html',
  './yams.html',
  './backgammon.html',
  './backgammon-regles.js',
  './assaut.html',
  './assaut-regles.js',
  './bataille.html',
  './bataille-regles.js',
  './gribouille.html',
  './gribouille-regles.js',
  './sons/plouf.mp3',
  './sons/touche.mp3',
  './sons/sirene.mp3',
  './commun.js',
  './salon-global.js',
  './commun.css',
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
      .then(noms => Promise.all(noms.filter(n => (n.startsWith('desdale-') || n.startsWith('brilliant-')) && n !== CACHE).map(n => caches.delete(n))))
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

  // Nos pages, scripts et styles : réseau d'abord (dernière version), cache si hors ligne.
  // Chaque page est rangée sous sa propre adresse (sans le "?choix" éventuel).
  if (req.mode === 'navigate' || (memeSite && /\.(html|js|css)$|\/$/.test(url.pathname))) {
    const cle = url.origin + url.pathname;
    // cache: 'no-cache' : on redemande toujours au serveur si le fichier a changé
    // (sinon le navigateur peut resservir sa copie jusqu'à 10 minutes après une mise en ligne)
    event.respondWith(
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then(rep => {
          if (rep.ok) { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(cle, copie)); }
          return rep;
        })
        .catch(() => caches.match(cle).then(r => r || caches.match('./index.html')))
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
