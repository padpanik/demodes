// ================== DÉSDALE : SERVEUR DE MISE EN RELATION SUR CLOUDFLARE ==================
// Remplace le serveur public de PeerJS (0.peerjs.com) : même protocole que le serveur officiel « peer »,
// donc rien ne change dans les jeux (PeerJS 1.5.4 côté téléphones).
// - GET  /<clé>/id      → un identifiant au hasard (PeerJS le demande quand on ne choisit pas son nom)
// - GET  /<clé>/turn    → identifiants du relais Cloudflare (TURN), valables 24 h, pour les réseaux difficiles
// - WS   /peerjs?key=&id=&token=  → la mise en relation elle-même, tenue par un seul Durable Object (« Salon »)
// La clé est la « clé de salon » de Désdale, dérivée du code d'accès : sans le code, rien ne marche.
// Secrets (wrangler secret put) : CLE, et pour le relais TURN_KEY_ID + TURN_KEY_API_TOKEN. Rien de secret dans ce fichier.

const MORT = 15000;   // sans nouvelles depuis 15 s (le téléphone envoie un battement toutes les 5 s) : la place est libérée
const TYPES_RELAYES = ['OFFER', 'ANSWER', 'CANDIDATE', 'LEAVE', 'EXPIRE'];
const BATTEMENT = '{"type":"HEARTBEAT"}';   // exactement ce qu'envoie PeerJS 1.5.4

// ---------- Le Durable Object : tous les téléphones connectés ----------
export class Salon {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    // Les battements reçoivent leur réponse sans réveiller l'objet (gratuit, et l'objet peut dormir entre deux messages)
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(BATTEMENT, BATTEMENT));
  }

  // Dernière nouvelle d'un téléphone : un message, ou un battement (réponse automatique)
  vu(ws) {
    const a = ws.deserializeAttachment() || {};
    const t = this.ctx.getWebSocketAutoResponseTimestamp(ws);
    return Math.max(a.vu || 0, t ? t.getTime() : 0);
  }
  vivants(id) {
    const maintenant = Date.now();
    return this.ctx.getWebSockets(id).filter(w => w.readyState === 1 && maintenant - this.vu(w) < MORT);
  }

  async fetch(requete) {
    const u = new URL(requete.url);
    const id = u.searchParams.get('id'), token = u.searchParams.get('token');
    const paire = new WebSocketPair();
    const [client, serveur] = Object.values(paire);
    const maintenant = Date.now();
    // Le nom est-il pris ? Par le même téléphone (même jeton) ou par un fantôme silencieux : on le remplace
    let pris = false;
    for (const ancien of this.ctx.getWebSockets(id)) {
      const a = ancien.deserializeAttachment() || {};
      if (a.token === token || maintenant - this.vu(ancien) >= MORT || ancien.readyState !== 1) {
        try { ancien.close(1000, 'remplace'); } catch (e) {}
      } else pris = true;
    }
    if (pris) {
      serveur.accept();
      serveur.send(JSON.stringify({ type: 'ID-TAKEN', payload: { msg: 'ID is taken' } }));
      serveur.close(1000, 'pris');
      return new Response(null, { status: 101, webSocket: client });
    }
    this.ctx.acceptWebSocket(serveur, [id]);
    serveur.serializeAttachment({ id: id, token: token, vu: maintenant });
    serveur.send(JSON.stringify({ type: 'OPEN' }));
    if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(maintenant + 10000);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, donnees) {
    let m;
    try { m = JSON.parse(typeof donnees === 'string' ? donnees : new TextDecoder().decode(donnees)); } catch (e) { return; }
    const a = ws.deserializeAttachment() || {};
    a.vu = Date.now();
    ws.serializeAttachment(a);
    if (!m || m.type === 'HEARTBEAT') return;
    if (m.type === 'LEAVE' && !m.dst) { try { ws.close(1000, 'depart'); } catch (e) {} return; }
    if (TYPES_RELAYES.indexOf(m.type) === -1 || !m.dst) return;
    const dest = this.vivants(String(m.dst));
    if (dest.length) {
      try { dest[dest.length - 1].send(JSON.stringify({ type: m.type, src: a.id, dst: m.dst, payload: m.payload })); } catch (e) {}
    } else if (m.type !== 'LEAVE' && m.type !== 'EXPIRE') {
      // Personne sous ce nom : on le dit tout de suite (PeerJS en fait l'erreur « peer-unavailable »)
      try { ws.send(JSON.stringify({ type: 'EXPIRE', src: m.dst, dst: a.id })); } catch (e) {}
    }
  }

  webSocketClose(ws) { try { ws.close(1000, 'fin'); } catch (e) {} }
  webSocketError(ws) { try { ws.close(1011, 'erreur'); } catch (e) {} }

  // Toutes les 10 s tant que quelqu'un est là : on ferme les connexions muettes (téléphone en veille, réseau perdu),
  // pour que leur nom de salon se libère vite (le serveur public le gardait environ une minute)
  async alarm() {
    const maintenant = Date.now();
    for (const ws of this.ctx.getWebSockets()) {
      if (maintenant - this.vu(ws) >= MORT) { try { ws.close(1000, 'silence'); } catch (e) {} }
    }
    if (this.ctx.getWebSockets().some(w => w.readyState === 1)) await this.ctx.storage.setAlarm(maintenant + 10000);
  }
}

// ---------- Les identifiants du relais Cloudflare, gardés quelques heures ----------
let relais = null;   // { fin, json }
async function identifiantsRelais(env) {
  if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return { iceServers: [] };
  if (relais && relais.fin > Date.now()) return relais.json;
  const r = await fetch('https://rtc.live.cloudflare.com/v1/turn/keys/' + env.TURN_KEY_ID + '/credentials/generate-ice-servers', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.TURN_KEY_API_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ttl: 86400 })
  });
  if (!r.ok) return { iceServers: [] };
  const j = await r.json();
  // Le port 53 est bloqué par les navigateurs : on le retire (sinon attente inutile)
  (j.iceServers || []).forEach(s => { if (Array.isArray(s.urls)) s.urls = s.urls.filter(x => !/:53(\?|$)/.test(x)); });
  relais = { fin: Date.now() + 6 * 3600000, json: j };   // valables 24 h : on en redonne des neufs toutes les 6 h
  return j;
}

function entetes(requete, env) {
  const origine = requete.headers.get('Origin') || '';
  const permises = String(env.ORIGINES || '').split(',').map(s => s.trim()).filter(Boolean);
  const h = { 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Cache-Control': 'no-store' };
  if (!permises.length || permises.indexOf(origine) !== -1) h['Access-Control-Allow-Origin'] = origine || '*';
  return h;
}
function bonneCle(cle, env) {
  if (!env.CLE || typeof cle !== 'string' || cle.length !== env.CLE.length) return false;
  let d = 0;
  for (let i = 0; i < cle.length; i++) d |= cle.charCodeAt(i) ^ env.CLE.charCodeAt(i);
  return d === 0;
}
// Refus sur la connexion elle-même, comme le serveur officiel (PeerJS affiche alors l'erreur reçue)
function refusSocket(message) {
  const paire = new WebSocketPair();
  const [client, serveur] = Object.values(paire);
  serveur.accept();
  serveur.send(JSON.stringify({ type: 'ERROR', payload: { msg: message } }));
  serveur.close(1000, 'refus');
  return new Response(null, { status: 101, webSocket: client });
}

export default {
  async fetch(requete, env) {
    const u = new URL(requete.url);
    const h = entetes(requete, env);
    if (requete.method === 'OPTIONS') return new Response(null, { headers: h });
    const morceaux = u.pathname.split('/').filter(Boolean);
    // La mise en relation (WebSocket)
    if (morceaux[morceaux.length - 1] === 'peerjs') {
      if (requete.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket attendu', { status: 426 });
      const id = u.searchParams.get('id'), token = u.searchParams.get('token'), cle = u.searchParams.get('key');
      if (!id || !token || !cle) return refusSocket('No id, token, or key supplied to websocket server');
      if (!bonneCle(cle, env)) return refusSocket('Invalid key provided');
      if (id.length > 120) return refusSocket('Invalid id');
      return env.SALON.get(env.SALON.idFromName('desdale')).fetch(requete);
    }
    if (morceaux.length === 2 && (morceaux[1] === 'id' || morceaux[1] === 'turn')) {
      if (!bonneCle(morceaux[0], env)) return new Response('Clé inconnue', { status: 401, headers: h });
      if (morceaux[1] === 'id') return new Response(crypto.randomUUID(), { headers: Object.assign({ 'Content-Type': 'text/html' }, h) });
      return new Response(JSON.stringify(await identifiantsRelais(env)), { headers: Object.assign({ 'Content-Type': 'application/json' }, h) });
    }
    return new Response('Désdale', { headers: h });
  }
};
