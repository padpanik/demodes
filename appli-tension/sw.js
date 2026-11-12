// Service worker du relevé de tension (portée : /tension/ seulement, indépendant de celui de Désdale)
// Réseau d'abord, copie gardée pour ouvrir la page sans connexion.
const CACHE = 'tension-3';
const FICHIERS = ['./', './manifest.webmanifest', './icone-192.png', './icone-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(noms => Promise.all(noms.filter(n => n.startsWith('tension-') && n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(r => {
        if (r.ok && !r.redirected) {
          const copie = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copie));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});
