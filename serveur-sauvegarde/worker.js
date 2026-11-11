// Worker « desdale-sauvegarde » : garde la sauvegarde en ligne (facultative) de chaque joueur de Désdale.
// Le téléphone chiffre tout avant l'envoi (AES-GCM, clé tirée du code de récupération du joueur) :
// ce Worker ne reçoit et ne garde qu'un texte illisible. Il ne connaît ni le code, ni la clé.
// Une sauvegarde = une entrée KV : clé = identifiant (32 caractères hexadécimaux, tiré du code),
// valeur = le paquet chiffré, métadonnées = { j: empreinte du jeton d'écriture, t: heure d'envoi }.

const TAILLE_MAX = 1024 * 1024;       // 1 Mo par sauvegarde (une sauvegarde compressée fait quelques dizaines de Ko)
const ECART_MIN = 60 * 1000;          // au plus un envoi par minute pour un même joueur
const ID = /^[0-9a-f]{32}$/;
const JETON = /^[0-9a-f]{32}$/;

function entetes(origine, env) {
  const ok = (env.ORIGINES || '').split(',').map(s => s.trim()).filter(Boolean);
  const h = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin'
  };
  if (origine && ok.indexOf(origine) !== -1) {
    h['Access-Control-Allow-Origin'] = origine;
    h['Access-Control-Allow-Methods'] = 'GET, PUT, DELETE, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}

function reponse(statut, corps, h) {
  return new Response(typeof corps === 'string' ? corps : JSON.stringify(corps), { status: statut, headers: h });
}

async function empreinte(texte) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('desdale-sauvegarde-jeton:' + texte));
  return [...new Uint8Array(b)].slice(0, 16).map(x => x.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(req, env) {
    const origine = req.headers.get('Origin') || '';
    const h = entetes(origine, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    // Seule l'appli Désdale peut s'en servir depuis un navigateur
    if (!h['Access-Control-Allow-Origin']) return reponse(403, { erreur: 'origine' }, h);

    const url = new URL(req.url);
    const m = url.pathname.match(/^\/s\/([^/]+)$/);
    if (!m || !ID.test(m[1])) return reponse(404, { erreur: 'adresse' }, h);
    const id = m[1];
    const jeton = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!JETON.test(jeton)) return reponse(401, { erreur: 'jeton' }, h);
    const ej = await empreinte(jeton);

    const { value, metadata } = await env.SAUVEGARDES.getWithMetadata(id);
    if (value !== null && (!metadata || metadata.j !== ej)) return reponse(403, { erreur: 'jeton' }, h);

    if (req.method === 'GET') {
      if (value === null) return reponse(404, { erreur: 'absente' }, h);
      return reponse(200, value, h);
    }

    if (req.method === 'PUT') {
      const corps = await req.text();
      if (corps.length > TAILLE_MAX) return reponse(413, { erreur: 'trop grande' }, h);
      let paquet;
      try { paquet = JSON.parse(corps); } catch (e) { return reponse(400, { erreur: 'format' }, h); }
      if (!paquet || paquet.v !== 1 || typeof paquet.d !== 'string' || typeof paquet.iv !== 'string') return reponse(400, { erreur: 'format' }, h);
      const maintenant = Date.now();
      if (metadata && metadata.t && maintenant - metadata.t < ECART_MIN) return reponse(429, { erreur: 'trop tôt' }, h);
      await env.SAUVEGARDES.put(id, corps, { metadata: { j: ej, t: maintenant } });
      return reponse(200, { ok: true, t: maintenant, taille: corps.length }, h);
    }

    if (req.method === 'DELETE') {
      if (value !== null) await env.SAUVEGARDES.delete(id);
      return reponse(200, { ok: true }, h);
    }

    return reponse(405, { erreur: 'méthode' }, h);
  }
};
