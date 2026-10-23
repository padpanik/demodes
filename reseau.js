// ================== RÉSEAU : QUEL SERVEUR DE MISE EN RELATION ? ==================
// Chargé par toutes les pages (après commun.js, et par Brilliant), avant le code de la page.
// creerPeer(id) remplace « new Peer(id) » partout : il passe par le serveur de Désdale sur Cloudflare
// (serveur-cloudflare/), avec les identifiants du relais Cloudflare pour les réseaux difficiles, et retombe tout seul
// sur le serveur public de PeerJS si celui de Désdale ne répond pas (deux échecs d'ouverture de suite → 5 min en secours).
// Sans adresse dans RESEAU_DESDALE, tout passe par le serveur public, comme avant.
// Essai sur un seul téléphone : localStorage 'desdale-serveur' = { hote, port, secure, chemin } prend le pas sur RESEAU_DESDALE.

var RESEAU_DESDALE = { hote: '', port: 443, secure: true, chemin: '/' };

var Reseau = (function () {
  var SECOURS = 5 * 60000, echecs = 0, secoursJusqua = 0;
  function lire(c) { try { return JSON.parse(localStorage.getItem(c)); } catch (e) { return null; } }
  function ecrire(c, v) { try { localStorage.setItem(c, JSON.stringify(v)); } catch (e) {} }
  function cle() { return (typeof ACCES !== 'undefined' && ACCES.cleSalon) || ''; }
  function config() {
    var o = lire('desdale-serveur');
    if (o && o.hote) return o;
    return RESEAU_DESDALE.hote ? RESEAU_DESDALE : null;
  }
  // Le serveur de Désdale, s'il est configuré, qu'on a la clé et qu'on n'est pas en secours
  function maison() { var c = config(); return c && cle() && Date.now() >= secoursJusqua ? c : null; }
  function base(c) { return (c.secure === false ? 'http://' : 'https://') + c.hote + ':' + (c.port || 443) + (c.chemin || '/'); }

  // Identifiants du relais (TURN), gardés 12 h sur le téléphone ; demandés au serveur de Désdale
  function relais() { var t = lire('desdale-turn'); return t && t.fin > Date.now() && t.iceServers && t.iceServers.length ? t.iceServers : null; }
  var demande = null;
  function chargerRelais() {
    var c = maison();
    if (!c || relais() || demande || typeof fetch === 'undefined') return;
    demande = fetch(base(c) + cle() + '/turn', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => {
      if (j && j.iceServers && j.iceServers.length) ecrire('desdale-turn', { fin: Date.now() + 12 * 3600000, iceServers: j.iceServers });
    }).catch(() => {}).then(() => { demande = null; });
  }

  function options() {
    var c = maison();
    if (!c) return null;
    var o = { host: c.hote, port: c.port || 443, path: c.chemin || '/', secure: c.secure !== false, key: cle() };
    var g = relais();
    if (g) o.config = { iceServers: g };
    return o;
  }

  // Comme « new Peer(id) », mais par le bon serveur
  function creer(id) {
    var o = options(), p;
    if (!o) return id ? new Peer(id) : new Peer();
    p = id ? new Peer(id, o) : new Peer(o);
    var ouvert = false;
    p.on('open', function () { ouvert = true; echecs = 0; });
    p.on('error', function (e) {
      // Le serveur de Désdale ne répond pas (pas d'ouverture) : au 2e échec de suite, on passe en secours
      if (!ouvert && ['server-error', 'socket-error', 'socket-closed', 'network'].indexOf(e && e.type) !== -1) {
        if (++echecs >= 2) { secoursJusqua = Date.now() + SECOURS; echecs = 0; }
      }
    });
    chargerRelais();
    return p;
  }

  function etat() { return maison() ? 'desdale' : config() ? 'secours' : 'public'; }
  setTimeout(chargerRelais, 1500);
  return { creer: creer, etat: etat, chargerRelais: chargerRelais };
})();

function creerPeer(id) { return Reseau.creer(id); }
