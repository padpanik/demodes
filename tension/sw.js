// Ancien service worker du relevé de tension (quand il était dans le site de Désdale).
// Le relevé a déménagé (https://tension.desdale.workers.dev) : ce fichier se retire tout seul.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(noms => Promise.all(noms.filter(n => n.startsWith('tension-')).map(n => caches.delete(n))))
      .then(() => self.registration.unregister())
  );
});
