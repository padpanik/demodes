// Worker « desdale-registre » : le registre des joueurs de Désdale (une fiche publique par personne).
// Chaque téléphone publie sa fiche (pseudo, couleur, résumé du compagnon, parties et records) et lit celles des autres,
// pour savoir qui existe et comparer les scores même quand personne n'est connecté.
// Seuls les téléphones qui ont le code d'accès peuvent lire ou écrire : en-tête X-Desdale = clé de salon (secret CLE,
// le même que pour le serveur de mise en relation ; jamais dans le dépôt).
// Une fiche ne s'écrit qu'avec son jeton (tiré par le téléphone, gardé dans sa sauvegarde) : le premier envoi « réserve » l'identifiant.
// Base D1 « desdale-registre », liaison DB (voir schema.sql et LISEZMOI.md).

const ID = /^[a-z0-9]{4,40}$/i;
const JETON = /^[0-9a-f]{32}$/;
const TAILLE_MAX = 8 * 1024;          // une fiche fait 1 à 3 Ko
const ECART_MIN = 60 * 1000;          // au plus une publication par minute pour une même personne
const OUBLI = 365 * 24 * 3600 * 1000; // fiches muettes depuis un an : plus montrées
const MAX_FICHES = 500;

function entetes(origine, env) {
  const ok = (env.ORIGINES || '').split(',').map(s => s.trim()).filter(Boolean);
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
  if (origine && ok.indexOf(origine) !== -1) {
    h['Access-Control-Allow-Origin'] = origine;
    h['Access-Control-Allow-Methods'] = 'GET, PUT, DELETE, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-Desdale';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}
function reponse(statut, corps, h) { return new Response(JSON.stringify(corps), { status: statut, headers: h }); }

// Comparaison sans fuite de temps (même principe que le serveur de mise en relation)
function bonneCle(cle, env) {
  if (!env.CLE || typeof cle !== 'string' || cle.length !== env.CLE.length) return false;
  let d = 0;
  for (let i = 0; i < cle.length; i++) d |= cle.charCodeAt(i) ^ env.CLE.charCodeAt(i);
  return d === 0;
}
async function empreinte(texte) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('desdale-registre-jeton:' + texte));
  return [...new Uint8Array(b)].slice(0, 16).map(x => x.toString(16).padStart(2, '0')).join('');
}

// Ce qu'on accepte dans une fiche (le reste est ignoré)
function nettoyerFiche(f) {
  if (!f || typeof f !== 'object') return null;
  const pseudo = String(f.pseudo || '').trim().slice(0, 20);
  if (!pseudo) return null;
  const profil = f.profil && typeof f.profil === 'object' ? f.profil : {};
  const scores = {};
  if (f.scores && typeof f.scores === 'object') {
    Object.keys(f.scores).slice(0, 80).forEach(k => {
      const s = f.scores[k];
      if (!/^[a-z0-9:_-]{1,40}$/.test(k) || !s || typeof s !== 'object') return;
      const v = Number(s.v);
      if (!isFinite(v) || Math.abs(v) > 1e9) return;
      const x = { v: Math.round(v) };
      if (s.d && typeof s.d === 'object') x.d = s.d;
      scores[k] = x;
    });
  }
  const p = JSON.stringify(profil), sc = JSON.stringify(scores);
  if (p.length > 2048 || sc.length > 6144) return null;
  return { pseudo, profil: p, scores: sc };
}

export default {
  async fetch(req, env) {
    const origine = req.headers.get('Origin') || '';
    const h = entetes(origine, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    if (!h['Access-Control-Allow-Origin']) return reponse(403, { erreur: 'origine' }, h);
    if (!bonneCle(req.headers.get('X-Desdale') || '', env)) return reponse(401, { erreur: 'acces' }, h);

    const url = new URL(req.url);
    const maintenant = Date.now();

    // Toutes les fiches : on ne renvoie jamais le jeton
    if (url.pathname === '/r' && req.method === 'GET') {
      const r = await env.DB.prepare('SELECT id, pseudo, profil, scores, vu FROM joueurs WHERE vu > ? ORDER BY vu DESC LIMIT ?')
        .bind(maintenant - OUBLI, MAX_FICHES).all();
      const fiches = (r.results || []).map(x => {
        let profil = {}, scores = {};
        try { profil = JSON.parse(x.profil || '{}'); } catch (e) {}
        try { scores = JSON.parse(x.scores || '{}'); } catch (e) {}
        return { id: x.id, pseudo: x.pseudo, profil, scores, vu: x.vu };
      });
      return reponse(200, { t: maintenant, fiches }, h);
    }

    const m = url.pathname.match(/^\/r\/([^/]+)$/);
    if (!m || !ID.test(m[1])) return reponse(404, { erreur: 'adresse' }, h);
    const id = m[1];
    const jeton = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!JETON.test(jeton)) return reponse(401, { erreur: 'jeton' }, h);
    const ej = await empreinte(jeton);
    const avant = await env.DB.prepare('SELECT jeton, vu FROM joueurs WHERE id = ?').bind(id).first();
    if (avant && avant.jeton !== ej) return reponse(403, { erreur: 'jeton' }, h);

    if (req.method === 'PUT') {
      const corps = await req.text();
      if (corps.length > TAILLE_MAX) return reponse(413, { erreur: 'trop grande' }, h);
      let f;
      try { f = nettoyerFiche(JSON.parse(corps)); } catch (e) { f = null; }
      if (!f) return reponse(400, { erreur: 'format' }, h);
      if (avant && maintenant - avant.vu < ECART_MIN) return reponse(429, { erreur: 'trop tôt' }, h);
      await env.DB.prepare(
        'INSERT INTO joueurs (id, jeton, pseudo, profil, scores, vu, cree) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6) ' +
        'ON CONFLICT(id) DO UPDATE SET pseudo = excluded.pseudo, profil = excluded.profil, scores = excluded.scores, vu = excluded.vu ' +
        'WHERE joueurs.jeton = excluded.jeton'
      ).bind(id, ej, f.pseudo, f.profil, f.scores, maintenant).run();
      return reponse(200, { ok: true, t: maintenant }, h);
    }

    if (req.method === 'DELETE') {
      if (avant) await env.DB.prepare('DELETE FROM joueurs WHERE id = ? AND jeton = ?').bind(id, ej).run();
      return reponse(200, { ok: true }, h);
    }

    return reponse(405, { erreur: 'méthode' }, h);
  }
};
