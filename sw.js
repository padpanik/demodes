// Service worker de Désdale
// - garde en cache les pages, les icônes et les bibliothèques (Vue, PeerJS)
//   pour que l'application démarre vite, même avec un réseau faible ;
// - nos propres pages, scripts et styles sont toujours pris sur le réseau d'abord : une nouvelle
//   version mise en ligne est donc visible dès le prochain lancement.
// Pensez à changer VERSION à chaque mise en ligne (même numéro que dans commun.js et brilliant/index.html).

const VERSION = '2.58';
const CACHE = 'desdale-' + VERSION;

const FICHIERS = [
  // Une page par dossier (jeu/), les fichiers communs à la racine
  './',
  './index.html',
  './brilliant/',
  './yams/',
  './backgammon/',
  './backgammon/backgammon-regles.js',
  './assaut/',
  './assaut/assaut-regles.js',
  './bataille/',
  './bataille/bataille-regles.js',
  './gribouille/',
  './gribouille/gribouille-regles.js',
  './petitbac/',
  './petitbac/petitbac-regles.js',
  './agents/',
  './agents/agents-regles.js',
  './quatre/',
  './quatre/quatre-regles.js',
  './domino/',
  './domino/domino-regles.js',
  './joyaux/',
  './joyaux/joyaux-regles.js',
  './joyaux/joyaux-duel.js',
  './joyaux/joyaux-visuels.js',
  './lettres/',
  './lettres/lettres-regles.js',
  './lettres/lettres-mots.txt',
  './expedition/',
  './expedition/expedition-regles.js',
  './donjon/',
  './donjon/donjon-regles.js',
  './compagnon/',
  './compagnon/compagnon-commun.js',
  './compagnon/compagnon-3d.html',
  './bataille/sons/plouf.mp3',
  './bataille/sons/touche.mp3',
  './bataille/sons/sirene.mp3',
  './commun.js',
  './fiche-jeu.js', './compagnons-jeu.js', './reseau.js',
  './icones-jeux.js',
  './qr.js',
  './etoiles.js',
  './salon-global.js',
  './commun.css',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon.png',
  './manifest-cf.webmanifest', './icon-cf-192.png', './icon-cf-512.png', './icon-cf-maskable-512.png', './apple-touch-icon-cf.png', './favicon-cf.png',
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
          // Cloudflare Pages renvoie « index.html » vers « / » : une page qui a été redirigée ne peut pas servir
          // de réponse à la navigation (le navigateur la refuse). On renvoie donc la redirection elle-même.
          if (rep.redirected && req.mode === 'navigate') return Response.redirect(rep.url, 302);
          if (rep.ok && !rep.redirected) { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(cle, copie)); }
          return rep;
        })
        .catch(() => caches.match(cle).then(r => r || caches.match(url.origin + url.pathname.replace(/index\.html$/, ''))).then(r => r || caches.match('./')))
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

// Toucher une notification du compagnon : on rouvre l'appli (ou on la ramène devant) sur sa page
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || 'compagnon/';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(liste => {
    for (const c of liste) { if ('focus' in c) { c.navigate ? c.navigate(url).catch(() => {}) : null; return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
