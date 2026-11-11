// Worker « tension » : donne au relevé de tension son adresse à lui (https://tension.desdale.workers.dev).
// Pourquoi : une appli installée revendique toute son adresse ; dans le site de Désdale, l'appli « Tension »
// installée écrasait l'appli Désdale sur le téléphone.
// Les fichiers restent dans le dépôt de Désdale (dossier appli-tension/, publié par le Worker « demodes ») :
// ce Worker les lit par une liaison de service (DEMODES), donc chaque push sur main met aussi l'appli à jour.
// Déployé à la main par l'API Cloudflare (voir LISEZMOI.md) ; à redéployer seulement si ce fichier change.
const DOSSIER = '/appli-tension';

export default {
  async fetch(requete, env) {
    const url = new URL(requete.url);
    const chemin = url.pathname;
    if (requete.method !== 'GET' && requete.method !== 'HEAD') {
      return new Response('Méthode refusée', { status: 405 });
    }
    if (chemin === '/index.html') return Response.redirect(url.origin + '/' + url.search, 301);
    // Seulement les fichiers de l'appli (pas le reste du site de Désdale)
    if (chemin.indexOf('..') >= 0 || chemin.indexOf('//') >= 0) {
      return new Response('Page introuvable', { status: 404 });
    }
    const cible = 'https://demodes.desdale.workers.dev' + DOSSIER + chemin + url.search;
    const r = await env.DEMODES.fetch(new Request(cible, { method: requete.method, headers: requete.headers, redirect: 'manual' }));
    if (r.status >= 300 && r.status < 400) {
      const loc = new URL(r.headers.get('location') || '/', cible);
      if (loc.pathname.indexOf(DOSSIER + '/') !== 0 && loc.pathname !== DOSSIER) {
        return new Response('Page introuvable', { status: 404 });
      }
      return Response.redirect(url.origin + (loc.pathname.slice(DOSSIER.length) || '/') + loc.search, r.status);
    }
    const h = new Headers(r.headers);
    h.set('x-robots-tag', 'noindex, nofollow');
    h.set('referrer-policy', 'no-referrer');
    return new Response(r.body, { status: r.status, headers: h });
  }
};
