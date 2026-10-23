// ================== DÉSDALE : SALON GLOBAL (présence + chat) ==================
// Un salon unique, commun à tous les jeux, réservé à ceux qui ont le code d'accès : on y voit qui est connecté
// et sur quel jeu, on peut rejoindre la partie d'un ami, et discuter (chat de tous, et chat du salon de jeu en cours).
// Il fonctionne à côté du salon de jeu, sans le toucher : sa propre connexion PeerJS, sa propre interface (bulle 💬).
// Chargé en fin de page : <script src="salon-global.js" data-jeu="yams"></script>
// Besoins : PeerJS et ACCES (code d'accès vérifié) ; utilise Sons s'il existe. Les constantes de commun.js (ou de Brilliant)
// sont des déclarations globales « const » : on les teste avec typeof, pas avec window.

var SalonGlobal = (function () {
  var JEUX = {
    accueil: { nom: 'Accueil', page: 'index.html' },
    brilliant: { nom: 'Brilliant', page: 'brilliant/', cle: 'brillant-sauvegarde-v1' },
    yams: { nom: 'Yams', page: 'yams/', cle: 'yams-sauvegarde' },
    backgammon: { nom: 'Backgammon', page: 'backgammon/', cle: 'bg-sauvegarde' },
    assaut: { nom: 'Assaut', page: 'assaut/', cle: 'assaut-sauvegarde' },
    bataille: { nom: 'Bataille navale', page: 'bataille/', cle: 'bataille-sauvegarde' },
    gribouille: { nom: 'Gribouille', page: 'gribouille/', cle: 'gribouille-sauvegarde' },
    petitbac: { nom: 'Petit bac', page: 'petitbac/', cle: 'petitbac-sauvegarde' },
    agents: { nom: 'Agents secrets', page: 'agents/', cle: 'agents-sauvegarde' },
    quatre: { nom: 'Quatre en ligne', page: 'quatre/', cle: 'quatre-sauvegarde' },
    domino: { nom: 'Dominos', page: 'domino/', cle: 'domino-sauvegarde' },
    lettres: { nom: 'Lettres croisées', page: 'lettres/', cle: 'lettres-sauvegarde' },
    expedition: { nom: 'Expédition', page: 'expedition/' },
    donjon: { nom: 'Donjon des compagnons', page: 'donjon/', cle: 'donjon-sauvegarde' },
    compagnon: { nom: 'Mon compagnon', page: 'compagnon/' }
  };
  var COULEURS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#16a085', '#3498db', '#2c3e50', '#9b59b6', '#e84393', '#8d6e63'];
  var EMOJIS = ['😀', '😎', '🤓', '🥳', '😺', '🐶', '🦊', '🐼', '🐸', '🐧', '🦁', '🐙', '🦄', '🐲', '👻', '🤖', '👽', '🎃', '⭐', '🔥', '🌈', '🍕', '🎲', '⚓'];
  var EMOTIONS = ['👍', '😂', '😮', '😢', '😡', '❤️', '🎉', '🎲', '👋', '🤔'];
  var MAX_MESSAGES = 60, SILENCE = 15000;
  var CLE_PROFIL = 'desdale-profil', CLE_MESSAGES = 'desdale-chat', CLE_LUS = 'desdale-chat-lus', CLE_BULLE = 'desdale-bulle-y';

  var jeu = 'accueil';
  var peer = null, role = null, hostConn = null, conns = {}, dernierHote = 0, timerReco = null, echecs = 0;
  var membres = {};         // id -> { id, pseudo, couleur, emoji, image, ou: { jeu, salon }, depuis }
  var messages = lire(CLE_MESSAGES) || [];
  var dejaVus = {};
  messages.forEach(m => { dejaVus[m.id] = true; });
  var lusJusqua = lire(CLE_LUS) || 0;
  var ouvert = false, onglet = 'presents', compteur = 0;
  var el = {};               // éléments de l'interface

  function lire(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function monId() { return lire('brillant-client-id') || 'inconnu'; }

  // ---------- Profil (pseudo, couleur, émoji ou image), propre à ce téléphone ----------
  function pseudoDesJeux() {
    for (var k in JEUX) { var s = JEUX[k].cle && lire(JEUX[k].cle); if (s && s.pseudo) return s.pseudo; }
    return '';
  }
  function profil() {
    var p = lire(CLE_PROFIL) || {};
    if (!p.pseudo) p.pseudo = pseudoDesJeux();
    if (!p.couleur) p.couleur = COULEURS[Math.abs(hash(monId())) % COULEURS.length];
    return p;
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
  function enregistrerProfil(p) {
    ecrire(CLE_PROFIL, p);
    setTimeout(() => { envoyer({ t: 'PROFIL', profil: publicProfil() }); majMoi(); rendre(); }, 0);   // après la fin du « change » / « blur » en cours (sinon le champ disparaît sous le doigt)
    try { window.dispatchEvent(new CustomEvent('desdale-profil')); } catch (e) {}   // les pages de jeu reprennent le nouveau pseudo
  }
  function publicProfil() { var p = profil(); return { pseudo: (p.pseudo || '').slice(0, 20) || 'Anonyme', couleur: p.couleur, emoji: p.emoji || '', image: p.image || '', invisible: !!p.invisible, cp: compagnonResume() }; }
  // Mon compagnon (s'il y en a un), montré aux autres dans la liste des présents
  function compagnonResume() {
    var a = lire('compagnon-animal');
    if (!a || !a.espece) return null;
    var h = '';
    try { if (typeof CP !== 'undefined') h = CP.humeur(CP.niveaux(a)); } catch (e) {}
    var sg = null;
    try { if (typeof CP !== 'undefined' && CP.signes) sg = CP.signes(a); } catch (e) {}
    return { e: a.espece, c: a.couleur, n: a.nom, p: a.porte || {}, ne: a.ne || 0, h: h, s: sg ? (sg.faim ? 'f' : '') + (sg.soif ? 's' : '') + (sg.calin ? 'c' : '') + (sg.toilette ? 't' : '') : '' };
  }
  function nettoyerCompagnon(c) {
    if (!c || typeof c !== 'object' || !/^[a-z]{2,10}$/.test(c.e)) return null;
    var p = {};
    Object.keys(c.p || {}).slice(0, 12).forEach(k => { if (/^[a-z0-9-]{1,12}$/.test(k) && /^[a-z0-9-]{1,20}$/.test(c.p[k])) p[k] = c.p[k]; });
    return { e: c.e, c: /^#[0-9a-f]{6}$/i.test(c.c) ? c.c : '#c8915a', n: String(c.n || '').slice(0, 16), p: p, ne: +c.ne || 0,
             h: ['content', 'calme', 'triste'].indexOf(c.h) !== -1 ? c.h : '', s: typeof c.s === 'string' && /^f?s?c?t?$/.test(c.s) ? c.s : undefined };
  }
  function ageCompagnon(ne) {
    if (!ne) return '';
    var j = Math.floor((Date.now() - ne) / 86400000);
    return j < 1 ? 'adopté aujourd\'hui' : j < 60 ? j + ' jour' + (j > 1 ? 's' : '') : Math.floor(j / 30) + ' mois';
  }
  // Petit dessin du compagnon (le dessin est dans compagnon-commun.js, chargé au besoin)
  function dessinCompagnon(c, taille) {
    if (!c || typeof CP === 'undefined') return '';
    return '<svg viewBox="0 -6 200 216" width="' + taille + '" height="' + taille + '" style="flex-shrink:0">' +
           CP.dessin({ espece: c.e, couleur: c.c, porte: c.p,
                      signes: typeof c.s === 'string' ? { faim: c.s.indexOf('f') >= 0, soif: c.s.indexOf('s') >= 0, calin: c.s.indexOf('c') >= 0, toilette: c.s.indexOf('t') >= 0 } : undefined },
                     c.h || 'calme', false) + '</svg>';
  }
  function suisInvisible() { return !!profil().invisible; }
  function basculerInvisible() { var q = profil(); q.invisible = !q.invisible; enregistrerProfil(q); }

  // Où suis-je ? (jeu affiché et salon de jeu en cours, lu dans la sauvegarde du jeu)
  function ou() {
    var j = JEUX[jeu], salon = '';
    if (j && j.cle) { var s = lire(j.cle); if (s && s.role && s.salon) salon = s.salon; }
    return { jeu: jeu, salon: salon };
  }
  function canalSalon(o) { o = o || ou(); return o.salon ? 'jeu:' + o.jeu + ':' + simplifier(o.salon) : ''; }
  function simplifier(n) { return (typeof ACCES !== 'undefined' && ACCES.simplifier) ? ACCES.simplifier(n) : String(n).toLowerCase(); }

  // ================== RÉSEAU (même principe que les jeux : le premier connecté tient le salon) ==================
  function idSalon() { return 'dm-' + ACCES.cleSalon + '-global'; }
  function demarrerReseau() {
    if (typeof Peer === 'undefined' || typeof ACCES === 'undefined' || !ACCES.cleSalon) return setTimeout(demarrerReseau, 2000);
    ouvrir();
    setInterval(battement, 5000);
    setInterval(verifierOu, 2500);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') auRetour(); });
    window.addEventListener('online', auRetour);
  }
  function arreter() {
    clearTimeout(timerReco);
    var p = peer; peer = null; role = null; hostConn = null; conns = {};
    if (p) { try { p.destroy(); } catch (e) {} }
  }
  // On tente de tenir le salon ; s'il est déjà tenu, on le rejoint
  function ouvrir() {
    arreter();
    var p = peer = typeof creerPeer === 'function' ? creerPeer(idSalon()) : new Peer(idSalon());
    if (typeof veillerOuverture === 'function') veillerOuverture(p);
    p.on('open', () => {
      if (peer !== p) return;
      role = 'hote'; echecs = 0;
      membres = {}; majMoi();
      diffuserMembres(); rendre();
    });
    p.on('connection', (c) => brancher(c));
    p.on('disconnected', () => { if (peer === p && !p.destroyed) setTimeout(() => { try { if (p.disconnected && !p.destroyed) p.reconnect(); } catch (e) {} }, 1000); });
    p.on('error', (err) => {
      if (peer !== p) return;
      if (err.type === 'unavailable-id') return rejoindre();
      if (err.type === 'peer-unavailable') return;
      planifier(4000);
    });
  }
  function rejoindre() {
    arreter();
    var p = peer = typeof creerPeer === 'function' ? creerPeer() : new Peer();
    if (typeof veillerOuverture === 'function') veillerOuverture(p);
    p.on('open', () => {
      if (peer !== p) return;
      var c = hostConn = p.connect(idSalon(), { reliable: true });
      var delai = setTimeout(() => { if (hostConn === c && role !== 'client') planifier(3000); }, 10000);
      c.on('open', () => {
        if (hostConn !== c) return;
        clearTimeout(delai);
        role = 'client'; echecs = 0; dernierHote = Date.now();
        c.send({ t: 'BONJOUR', id: monId(), profil: publicProfil(), ou: ou(), dernier: messages.length ? messages[messages.length - 1].h : 0 });
        rendre();
      });
      c.on('data', (d) => { if (hostConn === c) { dernierHote = Date.now(); recevoirHote(d); } });
      c.on('close', () => { if (hostConn === c) perteHote(); });
      c.on('error', () => { if (hostConn === c) perteHote(); });
    });
    p.on('error', () => { if (peer === p) planifier(3000); });
  }
  // Hôte disparu : on attend un peu (au hasard, pour ne pas tous se précipiter) puis on tente de reprendre le salon
  function perteHote() {
    hostConn = null; role = null; membres = {}; rendre();
    planifier(1000 + Math.random() * 3000);
  }
  function planifier(ms) {
    clearTimeout(timerReco);
    timerReco = setTimeout(() => { echecs++; ouvrir(); }, Math.min(ms * (1 + echecs * 0.5), 20000));
  }
  function auRetour() {
    if (!peer || peer.destroyed) return ouvrir();
    if (peer.disconnected) { try { peer.reconnect(); } catch (e) {} }
    if (role === 'client' && Date.now() - dernierHote > 8000) perteHote();
  }
  function battement() {
    var t = Date.now();
    if (role === 'hote') {
      Object.keys(conns).forEach(id => {
        var c = conns[id];
        try { if (c.open) c.send({ t: 'PING' }); } catch (e) {}
        if (t - (c.dernier || t) > SILENCE) { try { c.close(); } catch (e) {} retirer(id, c); }
      });
      if (peer && peer.disconnected && !peer.destroyed) { try { peer.reconnect(); } catch (e) {} }
    } else if (role === 'client') {
      envoyer({ t: 'PING' });
      if (t - dernierHote > SILENCE) perteHote();
    }
  }
  function envoyer(d) {
    if (role === 'client' && hostConn && hostConn.open) { try { hostConn.send(d); } catch (e) {} }
    else if (role === 'hote') recevoirClient(null, Object.assign({ id: monId() }, d));
  }
  function diffuser(d, sauf) { Object.keys(conns).forEach(id => { var c = conns[id]; if (id !== sauf) { try { if (c.open) c.send(d); } catch (e) {} } }); }

  // ---------- Hôte ----------
  function majMoi() {
    if (role !== 'hote') return;
    var p = publicProfil(), id = monId();
    membres[id] = Object.assign(membres[id] || { depuis: Date.now() }, p, { id: id, ou: ou() });
  }
  // Les invisibles ne sont envoyés qu'à eux-mêmes : les autres ne les voient pas du tout
  function diffuserMembres() {
    if (role !== 'hote') return;
    majMoi();
    var tous = Object.keys(membres).map(k => membres[k]);
    Object.keys(conns).forEach(id => { var c = conns[id]; try { if (c.open) c.send({ t: 'MEMBRES', membres: tous.filter(m => !m.invisible || m.id === id) }); } catch (e) {} });
  }
  // Ceux que je vois (moi compris, même invisible)
  function listeMembres() { return Object.keys(membres).map(k => membres[k]).filter(m => !m.invisible || m.id === monId()); }
  function brancher(c) {
    c.dernier = Date.now();
    c.on('data', (d) => { c.dernier = Date.now(); recevoirClient(c, d); });
    c.on('close', () => retirer(c.idMembre, c));
    c.on('error', () => retirer(c.idMembre, c));
  }
  function retirer(id, c) {
    if (!id || conns[id] !== c) return;
    delete conns[id]; delete membres[id];
    diffuserMembres(); rendre();
  }
  function recevoirClient(c, d) {
    var id = c ? c.idMembre : monId();
    switch (d.t) {
      case 'BONJOUR': {
        id = String(d.id || '').slice(0, 40);
        if (!id || id === monId()) return;
        if (conns[id] && conns[id] !== c) { try { conns[id].close(); } catch (e) {} }
        c.idMembre = id; conns[id] = c;
        membres[id] = Object.assign(nettoyerProfil(d.profil), { id: id, ou: nettoyerOu(d.ou), depuis: Date.now() });
        // Les messages qu'il n'a pas encore
        var depuis = +d.dernier || 0;
        try { c.send({ t: 'HISTO', messages: messages.filter(m => m.h > depuis) }); } catch (e) {}
        diffuserMembres(); rendre();
        break;
      }
      case 'OU': if (membres[id]) { membres[id].ou = nettoyerOu(d.ou); diffuserMembres(); rendre(); } break;
      // Message pour un seul membre (visite de maison, câlin…) : l'hôte le fait passer
      case 'RELAIS': {
        if (!membres[id] || !d.m || JSON.stringify(d.m).length > 60000) return;
        var dest = String(d.a || '');
        if (dest === monId()) recevoirRelais(id, d.m);
        else if (conns[dest]) { try { conns[dest].send({ t: 'RELAIS', de: id, m: d.m }); } catch (e) {} }
        break;
      }
      case 'PROFIL': if (membres[id]) { Object.assign(membres[id], nettoyerProfil(d.profil)); diffuserMembres(); rendre(); } break;
      case 'MSG': {
        if (!membres[id]) return;
        var m = d.m || {};
        var msg = { id: String(m.id).slice(0, 60), de: id, pseudo: membres[id].pseudo, couleur: membres[id].couleur, emoji: membres[id].emoji,
                    texte: String(m.texte || '').slice(0, 300), canal: String(m.canal || 'tous').slice(0, 80), h: Date.now() };
        if (!msg.texte.trim()) return;
        diffuser({ t: 'MSG', m: msg });
        ajouterMessage(msg);
        break;
      }
    }
  }
  function nettoyerProfil(p) {
    p = p || {};
    var img = String(p.image || '');
    return { pseudo: String(p.pseudo || 'Anonyme').slice(0, 20), couleur: /^#[0-9a-f]{6}$/i.test(p.couleur) ? p.couleur : '#7d8a94',
             emoji: String(p.emoji || '').slice(0, 8), image: img.indexOf('data:image/') === 0 && img.length < 30000 ? img : '', invisible: !!p.invisible,
             cp: nettoyerCompagnon(p.cp) };
  }
  function nettoyerOu(o) { o = o || {}; return { jeu: JEUX[o.jeu] ? o.jeu : 'accueil', salon: String(o.salon || '').slice(0, 40) }; }

  // ---------- Client ----------
  function recevoirHote(d) {
    switch (d.t) {
      case 'MEMBRES': membres = {}; (d.membres || []).forEach(m => { membres[m.id] = m; }); rendre(); break;
      case 'HISTO': (d.messages || []).forEach(m => ajouterMessage(m, true)); rendre(); break;
      case 'MSG': ajouterMessage(d.m); break;
      case 'RELAIS': recevoirRelais(String(d.de || ''), d.m || {}); break;
    }
  }

  // ================== VISITES DE MAISONS (Mon compagnon) ==================
  // Un ami connecté demande à voir ma maison : mon téléphone lui envoie un instantané (lecture seule).
  // Il peut faire un câlin à mon compagnon : le câlin compte ici. Rien ne passe par un serveur.
  var attentes = {};        // demandes en cours : q -> rappel
  var derniersCalins = {};  // id du visiteur -> heure du dernier câlin (pas plus d'un toutes les 15 s)
  function envoyerA(id, m) { envoyer({ t: 'RELAIS', a: id, m: m }); }
  function demander(id, m, rappel, delai) {
    var q = Math.random().toString(36).slice(2, 10);
    attentes[q] = rappel;
    m.q = q;
    envoyerA(id, m);
    setTimeout(() => { if (attentes[q]) { delete attentes[q]; rappel(null); } }, delai || 12000);
  }
  function instantaneMaison() {
    var a = lire('compagnon-animal');
    if (!a || !a.espece) return null;
    var m = lire('compagnon-maison') || {}, tr = lire('compagnon-trophees') || [];
    var etagere = (m.etagere || []).slice(0, 3);
    return {
      a: { espece: a.espece, couleur: a.couleur, nom: a.nom, ne: a.ne, porte: a.porte || {}, deco: a.deco || {}, besoins: a.besoins, possede: {} },
      maison: { blocs: (m.blocs || ['salon']).slice(0, 10), piece: m.piece || 'salon', etagere: etagere, cles: 0 },
      trophees: tr.slice(-12).concat(tr.filter(t => etagere.indexOf(t.k) >= 0 && tr.slice(-12).indexOf(t) < 0)).map(t => ({ k: t.k, niv: t.niv, ico: t.ico, titre: t.titre, h: t.h })),
      pseudo: publicProfil().pseudo
    };
  }
  function recevoirRelais(de, m) {
    var qui = (membres[de] && membres[de].pseudo) || 'Un ami';
    if (m.type === 'EMOTE') { signalerEmote(de, m.e); return; }
    if (m.type === 'MAISON?') {
      envoyerA(de, { type: 'MAISON', r: m.q, donnees: instantaneMaison() });
      if (lire('compagnon-animal')) toast('👀 ' + esc(qui) + ' visite ta maison');
    } else if (m.type === 'MAISON') {
      var rappel = attentes[m.r];
      if (rappel) { delete attentes[m.r]; rappel(m.donnees || { aucun: true }, de); }
    } else if (m.type === 'CALIN') {
      var t = Date.now(), a = lire('compagnon-animal');
      if (!a || !a.besoins || t - (derniersCalins[de] || 0) < 15000) return;
      derniersCalins[de] = t;
      var b = a.besoins.calin || { v: 0, t: t };
      var actuel = typeof CP !== 'undefined' ? CP.niveaux(a, t).calin : b.v;
      a.besoins.calin = { v: Math.min(100, actuel + 20), t: t };
      ecrire('compagnon-animal', a);
      try { window.dispatchEvent(new CustomEvent('cp-exterieur')); } catch (e) {}   // la page du compagnon se met à jour
      toast('❤️ ' + esc(qui) + ' a fait un câlin à ' + esc(a.nom));
    }
  }
  // Petite annonce en haut de l'écran
  function toast(html) {
    try {
      var d = document.createElement('div');
      d.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:4600;background:#fff8e7;color:#5b3d00;border-radius:16px;padding:9px 16px;' +
        'font:700 15px system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.2);max-width:calc(100% - 32px);text-align:center;pointer-events:none;transition:opacity .5s';
      d.innerHTML = html;
      document.body.appendChild(d);
      setTimeout(() => { d.style.opacity = '0'; }, 3500);
      setTimeout(() => d.remove(), 4100);
    } catch (e) {}
  }

  // ---------- Messages ----------
  function ajouterMessage(m, silencieux) {
    if (!m || dejaVus[m.id]) return;
    dejaVus[m.id] = true;
    messages.push(m);
    messages.sort((a, b) => a.h - b.h);
    if (messages.length > MAX_MESSAGES) messages.splice(0, messages.length - MAX_MESSAGES);
    ecrire(CLE_MESSAGES, messages);
    var pourMoi = m.canal === 'tous' || m.canal === canalSalon();
    if (m.de !== monId() && pourMoi && !silencieux && !suisInvisible()) {   // invisible : pas de son ni de vibration
      if (!ouvert || (onglet !== 'tous' && onglet !== 'salon')) {
        try { if (lire('brillant-vibration') !== false) navigator.vibrate && navigator.vibrate(40); } catch (e) {}
        try { if (lire('brillant-son') !== false && typeof Sons !== 'undefined') Sons.jouer('toc'); } catch (e) {}
      }
    }
    rendre();
  }
  function ecrireMessage(texte, canal) {
    texte = String(texte || '').trim().slice(0, 300);
    if (!texte || !role) return false;
    envoyer({ t: 'MSG', m: { id: monId() + '-' + Date.now().toString(36) + '-' + (++compteur), texte: texte, canal: canal } });
    return true;
  }
  function nonLus() {
    var c = canalSalon();
    return messages.filter(m => m.h > lusJusqua && m.de !== monId() && (m.canal === 'tous' || m.canal === c)).length;
  }
  // La bulle et la carte ouvrent directement le chat : celui du salon s'il y a du nouveau là, sinon le dernier chat utilisé
  function ongletChat() {
    var c = canalSalon(), nouveaux = messages.filter(m => m.h > lusJusqua && m.de !== monId());
    var dernier = nouveaux[nouveaux.length - 1];
    if (c && dernier && dernier.canal === c) return 'salon';
    if (dernier && dernier.canal === 'tous') return 'tous';
    return (onglet === 'salon' && c) ? 'salon' : 'tous';
  }
  function marquerLus() {
    if (!messages.length) return;
    lusJusqua = messages[messages.length - 1].h;
    ecrire(CLE_LUS, lusJusqua);
  }

  // Le salon de jeu a changé (entrée, sortie) : on prévient les autres
  var dernierOu = '', dernierProfil = '';
  function verifierOu() {
    // Le pseudo peut apparaître plus tard (saisi dans un jeu) : on renvoie aussi le profil s'il a changé
    var pr = JSON.stringify(publicProfil());
    if (pr !== dernierProfil) {
      var premier = !dernierProfil;
      dernierProfil = pr;
      if (!premier) { if (role === 'hote') diffuserMembres(); else envoyer({ t: 'PROFIL', profil: publicProfil() }); }
    }
    var o = JSON.stringify(ou());
    if (o === dernierOu) return;
    dernierOu = o;
    if (role === 'hote') diffuserMembres(); else envoyer({ t: 'OU', ou: ou() });
    rendre();
  }

  // Rejoindre la partie d'un ami : on ouvre son jeu avec le nom du salon déjà rempli
  function rejoindrePartie(id) {
    var m = membres[id];
    if (!m || !m.ou || !m.ou.salon || !JEUX[m.ou.jeu]) return;
    location.href = JEUX[m.ou.jeu].page + '?salon=' + encodeURIComponent(m.ou.salon);
  }
  // Arrivée sur un jeu par « Rejoindre » : on remplit le salon et on y entre
  function suiteRejoindre() {
    var m = /[?&]salon=([^&]+)/.exec(location.search);
    if (!m) return;
    var nom = decodeURIComponent(m[1]);
    history.replaceState(null, '', location.pathname);
    var essais = 0;
    (function tenter() {
      var app = document.getElementById('app'), vm = app && app.__vue__;
      if (!vm) { if (++essais < 30) setTimeout(tenter, 200); return; }
      if (vm.role) return;   // déjà dans un salon : on ne touche à rien
      vm.channelInput = nom;
      if (!(vm.pseudoInput || '').trim()) { var p = profil().pseudo; if (p) vm.pseudoInput = p; }
      if ((vm.pseudoInput || '').trim() && typeof vm.entrerSalon === 'function') vm.entrerSalon();
    })();
  }

  // ================== INTERFACE ==================
  function avatar(m, taille) {
    taille = taille || 30;
    var st = 'width:' + taille + 'px;height:' + taille + 'px;background:' + esc(m.couleur || '#7d8a94') + ';font-size:' + Math.round(taille * 0.55) + 'px';
    if (m.image) return '<span class="sg-av" style="' + st + '"><img src="' + esc(m.image) + '" alt=""></span>';
    return '<span class="sg-av" style="' + st + '">' + esc(m.emoji || (m.pseudo || '?').charAt(0).toUpperCase()) + '</span>';
  }
  function heure(h) { var d = new Date(h); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function ouTexte(o) {
    if (!o) return '';
    var j = JEUX[o.jeu] || JEUX.accueil;
    return o.jeu === 'accueil' ? 'à l\'accueil' : j.nom + (o.salon ? ' · salon « ' + o.salon + ' »' : '');
  }

  function installer() {
    // Le dessin des compagnons sert à la liste des présents : on le charge s'il n'est pas déjà là
    // Le compagnon peut dire un petit mot de temps en temps, sur toutes les pages
    if (typeof CP !== 'undefined' && CP.demarrerVeille) CP.demarrerVeille(jeu);
    if (typeof CP === 'undefined') {
      var sc = document.createElement('script');
      sc.src = 'compagnon/compagnon-commun.js';
      sc.onload = () => { dernierProfil = ''; rendre(); if (CP.demarrerVeille) CP.demarrerVeille(jeu); };
      document.head.appendChild(sc);
    }
    var css = document.createElement('style');
    css.textContent = [
      '#sg-bulle{position:fixed;right:8px;z-index:4000;width:46px;height:46px;border-radius:50%;border:none;background:#2c3e50;color:#fff;font-size:21px;box-shadow:0 3px 10px rgba(0,0,0,.3);cursor:pointer;touch-action:none;display:flex;align-items:center;justify-content:center;opacity:.92}',
      '#sg-bulle .sg-pastille{position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;border-radius:9px;background:#e74c3c;color:#fff;font:700 11px/18px system-ui,sans-serif;padding:0 4px;box-sizing:border-box}',
      '#sg-bulle .sg-nb{position:absolute;bottom:-3px;left:-3px;min-width:18px;height:18px;border-radius:9px;background:#2ecc71;color:#fff;font:700 11px/18px system-ui,sans-serif;padding:0 4px;box-sizing:border-box}',
      '#sg-bulle.hors{background:#7d8a94}',
      '#sg-bulle.invisible{background:#8e7cc3;opacity:.75}',
      '.sg-invisible{display:flex;align-items:center;gap:10px;background:#f4f1fb;border-radius:12px;padding:8px 10px;margin-bottom:6px;font-size:12px;color:#6b7a86}',
      '.sg-invisible>div{flex:1}.sg-invisible b{font-size:14px;color:#1d2b36}.sg-invisible.actif{background:#e6defa}',
      '.sg-interrupteur{flex-shrink:0;width:46px;height:28px;border-radius:14px;border:none;background:#c9d2d9;position:relative;cursor:pointer;padding:0}',
      '.sg-interrupteur span{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:left .15s}',
      '.sg-invisible.actif .sg-interrupteur{background:#7b5cc4}.sg-invisible.actif .sg-interrupteur span{left:21px}',
      '#sg-fond{position:fixed;inset:0;z-index:4001;background:rgba(15,25,35,.35)}',
      '#sg-panneau{position:fixed;left:8px;right:8px;top:8px;z-index:4002;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden;font-family:system-ui,sans-serif;color:#1d2b36}',
      '#sg-panneau .sg-tete{display:flex;align-items:center;gap:4px;padding:8px 8px 0}',
      '#sg-panneau .sg-onglets{display:flex;gap:3px;flex:1;background:#e3e8ec;border-radius:10px;padding:3px}',
      '#sg-panneau .sg-onglets button{flex:1;border:none;background:transparent;border-radius:8px;padding:7px 2px;font:600 13px system-ui,sans-serif;color:#5b6b78;cursor:pointer;white-space:nowrap}',
      '#sg-panneau .sg-onglets button.actif{background:#fff;color:#1d2b36;box-shadow:0 1px 3px rgba(0,0,0,.12)}',
      '#sg-panneau .sg-fermer{border:none;background:none;font-size:20px;padding:4px 8px;cursor:pointer;color:#5b6b78}',
      '#sg-corps{flex:1;overflow-y:auto;padding:8px 10px;min-height:120px}',
      '.sg-etat{font-size:12px;color:#6b7a86;padding:2px 12px 0}',
      '.sg-membre{display:flex;align-items:center;gap:10px;padding:7px 2px;border-bottom:1px solid #eef1f3}',
      '.sg-membre .sg-qui{flex:1;min-width:0}.sg-membre .sg-nom{font-weight:700}.sg-membre .sg-ou{font-size:12px;color:#6b7a86;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.sg-av{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:800;flex-shrink:0;overflow:hidden;line-height:1}',
      '.sg-av img{width:100%;height:100%;object-fit:cover}',
      '.sg-cp{display:flex;align-items:center;gap:4px;font-size:12px;color:#7a5a20;margin-top:1px}.sg-cp span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.sg-btn{border:1.5px solid #2c3e50;background:#fff;border-radius:10px;padding:6px 10px;font:700 13px system-ui,sans-serif;color:#2c3e50;cursor:pointer}',
      '.sg-btn.plein{background:#2c3e50;color:#fff}',
      '.sg-actions{display:flex;flex-direction:column;gap:5px;flex-shrink:0}',
      '.sg-msg{display:flex;gap:8px;margin:7px 0;align-items:flex-start}.sg-msg .sg-bloc{min-width:0;flex:1}',
      '.sg-msg .sg-entete{font-size:12px;color:#6b7a86}.sg-msg .sg-entete b{color:#1d2b36}',
      '.sg-msg .sg-texte{background:#f1f4f6;border-radius:4px 12px 12px 12px;padding:6px 10px;display:inline-block;max-width:100%;word-wrap:break-word;white-space:pre-wrap;font-size:15px}',
      '.sg-msg.moi{flex-direction:row-reverse}.sg-msg.moi .sg-bloc{text-align:right}.sg-msg.moi .sg-texte{background:#d9ecff;border-radius:12px 4px 12px 12px;text-align:left}',
      '.sg-msg .sg-texte.gros{font-size:30px;background:none;padding:0}',
      '.sg-vide{color:#8a97a1;text-align:center;padding:24px 8px;font-size:14px}',
      '.sg-pied{border-top:1px solid #eef1f3;padding:6px 8px 8px}',
      '.sg-emotions{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:6px}.sg-emotions button{border:none;background:#f1f4f6;border-radius:8px;font-size:20px;line-height:1.2;padding:4px 0;cursor:pointer}',
      '.sg-saisie{display:flex;gap:6px}.sg-saisie input{flex:1;min-width:0;font:16px system-ui,sans-serif;padding:9px 12px;border-radius:12px;border:1.5px solid #c9d2d9}',
      '.sg-profil label{display:block;font-weight:700;font-size:13px;color:#5b6b78;margin:10px 0 5px}',
      '.sg-profil input[type=text]{width:100%;box-sizing:border-box;font:16px system-ui,sans-serif;padding:9px 12px;border-radius:12px;border:1.5px solid #c9d2d9}',
      '.sg-choix{display:flex;flex-wrap:wrap;gap:6px}.sg-choix button{width:34px;height:34px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1.5px #c9d2d9;cursor:pointer;font-size:18px;padding:0;background:#f6f8fa}',
      '.sg-choix button.actif{box-shadow:0 0 0 3px #1d2b36}',
      '.sg-apercu{display:flex;align-items:center;gap:10px;margin-top:4px}',
      
      '.sg-carte{background:#fff;border-radius:18px;padding:12px 14px;box-shadow:0 1px 2px rgba(0,0,0,.05),0 4px 14px rgba(29,43,54,.06);display:flex;align-items:center;gap:8px;cursor:pointer;font-family:system-ui,sans-serif}',
      '.sg-carte .sg-titre{font-weight:700;color:#5b6b78;margin-right:4px}.sg-carte .sg-avs{display:flex;flex:1;min-width:0}.sg-carte .sg-avs .sg-av{margin-right:-6px;box-shadow:0 0 0 2px #fff}.sg-carte .sg-plus{background:#8a97a1;font-size:12px}'
    ].join('\n');
    document.head.appendChild(css);

    var b = el.bulle = document.createElement('button');
    b.id = 'sg-bulle'; b.setAttribute('aria-label', 'Salon global : présents et chat');
    document.body.appendChild(b);
    // Bulle déplaçable le long du bord droit (pour ne rien cacher du jeu) ; un simple toucher l'ouvre
    var y = lire(CLE_BULLE);
    placerBulle(typeof y === 'number' ? y : window.innerHeight - 70);
    var depart = null;
    b.addEventListener('pointerdown', e => { depart = { y: e.clientY, top: b.offsetTop, bouge: false }; try { b.setPointerCapture(e.pointerId); } catch (x) {} });
    b.addEventListener('pointermove', e => {
      if (!depart) return;
      var dy = e.clientY - depart.y;
      if (Math.abs(dy) > 6) depart.bouge = true;
      if (depart.bouge) placerBulle(depart.top + dy);
    });
    // On ouvre sur « click » (et pas sur pointerup) : sinon, au doigt, le clic qui suit tombait sur le fond
    // tout juste posé et refermait aussitôt le panneau (seul un appui long marchait)
    var aGlisse = false;
    b.addEventListener('pointerup', () => {
      if (!depart) return;
      aGlisse = depart.bouge; depart = null;
      if (aGlisse) ecrire(CLE_BULLE, b.offsetTop);
    });
    b.addEventListener('pointercancel', () => { depart = null; });
    b.addEventListener('click', () => {
      if (aGlisse) { aGlisse = false; return; }
      ouvrir_panneau(ongletChat());
    });
    window.addEventListener('resize', () => placerBulle(b.offsetTop));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', ajusterPanneau);
    rendre();
  }
  function placerBulle(top) { el.bulle.style.top = Math.max(60, Math.min(window.innerHeight - 56, top)) + 'px'; }
  function ajusterPanneau() {
    if (!el.panneau) return;
    var h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    el.panneau.style.height = Math.max(260, Math.min(h - 16, 640)) + 'px';
  }
  function ouvrir_panneau(o) {
    if (o) onglet = o;
    if (ouvert) return;
    ouvert = true;
    var fond = el.fond = document.createElement('div');
    fond.id = 'sg-fond';
    var ouvertA = Date.now();
    fond.addEventListener('click', () => { if (Date.now() - ouvertA > 400) fermer(); });
    var p = el.panneau = document.createElement('div');
    p.id = 'sg-panneau';
    p.innerHTML = '<div class="sg-tete"><div class="sg-onglets"></div><button class="sg-fermer" aria-label="Fermer">✕</button></div>' +
                  '<div class="sg-etat"></div><div id="sg-corps"></div><div class="sg-pied"></div>';
    p.querySelector('.sg-fermer').addEventListener('click', fermer);
    document.body.appendChild(fond); document.body.appendChild(p);
    ajusterPanneau();
    rendre(true);
  }
  function fermer() {
    ouvert = false;
    if (el.fond) el.fond.remove();
    if (el.panneau) el.panneau.remove();
    el.fond = el.panneau = null;
    rendre();
  }
  function changerOnglet(o) { onglet = o; rendre(true); }

  // Redessine ce qui est visible (bulle, carte de l'accueil, panneau)
  // ================== COMPAGNONS EN JEU (compagnons-jeu.js) ==================
  // Les membres qui sont dans le même salon de jeu que moi (moi compris), avec leur compagnon
  function membresDuSalon() {
    var o = ou();
    if (!o.salon) return [];
    var c = canalSalon(o), moi = monId();
    var l = listeMembres().filter(m => m.ou && m.ou.jeu === o.jeu && canalSalon(m.ou) === c)
      .map(m => ({ id: m.id, pseudo: m.pseudo, cp: m.cp, moi: m.id === moi }));
    if (!l.some(m => m.moi)) { var p = publicProfil(); l.unshift({ id: moi, pseudo: p.pseudo, cp: p.cp, moi: true }); }
    return l;
  }
  // Une émotion : envoyée à chacun du salon (par l'hôte du salon global), et montrée ici aussi
  function emote(e) {
    membresDuSalon().forEach(m => { if (!m.moi) envoyerA(m.id, { type: 'EMOTE', e: e }); });
    signalerEmote(monId(), e);
  }
  function signalerEmote(id, e) { try { window.dispatchEvent(new CustomEvent('desdale-emote', { detail: { id: id, e: +e || 0 } })); } catch (x) {} }

  function rendre(defiler) {
    try { window.dispatchEvent(new CustomEvent('desdale-membres')); } catch (x) {}
    if (!el.bulle) return;
    var nb = listeMembres().length, nl = nonLus(), inv = suisInvisible();
    el.bulle.className = (role ? '' : 'hors') + (inv ? ' invisible' : '');
    el.bulle.innerHTML = (inv ? '👻' : '💬') + (nl ? '<span class="sg-pastille">' + (nl > 9 ? '9+' : nl) + '</span>' : '') + (nb > 1 ? '<span class="sg-nb">' + nb + '</span>' : '');
    var ici = document.getElementById('sg-ici');
    if (ici) {
      var autres = listeMembres().filter(m => m.id !== monId());
      // Carte de l'accueil : seulement les présents (le chat passe par la bulle) ; un toucher montre qui est où
      var max = 9, reste = autres.length - max;
      ici.innerHTML = '<div class="sg-carte"><span class="sg-titre">👥 En ligne</span><span class="sg-avs">' +
        (autres.length ? autres.slice(0, reste > 0 ? max - 1 : max).map(m => avatar(m, 30)).join('') +
          (reste > 0 ? '<span class="sg-av sg-plus" style="width:30px;height:30px">+' + (reste + 1) + '</span>' : '')
          : '<span style="color:#8a97a1;font-size:14px">' + (role ? 'personne d\'autre pour l\'instant' : 'connexion…') + '</span>') +
        '</span></div>';
      ici.firstChild.onclick = () => ouvrir_panneau('presents');
    }
    if (!ouvert || !el.panneau) return;
    var c = canalSalon();
    if (onglet === 'salon' && !c) onglet = 'tous';
    var tabs = [['presents', '👥 ' + nb], ['tous', '💬 Tous']];
    if (c) tabs.push(['salon', '🎲 Ce salon']);
    tabs.push(['profil', '🙂 Moi']);
    var bar = el.panneau.querySelector('.sg-onglets');
    bar.innerHTML = tabs.map(t => '<button data-o="' + t[0] + '" class="' + (onglet === t[0] ? 'actif' : '') + '">' + t[1] + '</button>').join('');
    bar.querySelectorAll('button').forEach(x => { x.onclick = () => changerOnglet(x.dataset.o); });
    el.panneau.querySelector('.sg-etat').textContent = role ? (role === 'hote' ? 'Salon global · en ligne (tu le tiens)' : 'Salon global · en ligne') : 'Salon global · connexion…';
    var corps = el.panneau.querySelector('#sg-corps'), pied = el.panneau.querySelector('.sg-pied');
    if (onglet === 'presents') { corps.innerHTML = vueInvisible() + vuePresents(); pied.innerHTML = ''; pied.style.display = 'none';
      corps.querySelector('[data-invisible]').onclick = basculerInvisible;
      corps.querySelectorAll('[data-rejoindre]').forEach(x => { x.onclick = () => rejoindrePartie(x.dataset.rejoindre); });
      corps.querySelectorAll('[data-visiter]').forEach(x => { x.onclick = () => { location.href = 'compagnon/?visite=' + encodeURIComponent(x.dataset.visiter); }; }); }
    else if (onglet === 'profil') { pied.innerHTML = ''; pied.style.display = 'none'; vueProfil(corps); }
    else {
      var canal = onglet === 'salon' ? c : 'tous';
      var liste = messages.filter(m => m.canal === canal);
      var enBas = corps.scrollHeight - corps.scrollTop - corps.clientHeight < 40;
      corps.innerHTML = liste.length ? liste.map(vueMessage).join('') : '<div class="sg-vide">' + (onglet === 'salon' ? 'Rien encore dans ce salon. Dis bonjour !' : 'Pas encore de message. Lance la discussion !') + '</div>';
      if (defiler || enBas) corps.scrollTop = corps.scrollHeight;
      if (!pied.querySelector('input')) {
        pied.style.display = '';
        pied.innerHTML = '<div class="sg-emotions">' + EMOTIONS.map(e => '<button data-e="' + e + '">' + e + '</button>').join('') + '</div>' +
          '<form class="sg-saisie"><input type="text" maxlength="300" placeholder="Ton message…" autocomplete="off" enterkeyhint="send"><button class="sg-btn plein" type="submit">➤</button></form>';
        var champ = pied.querySelector('input');
        pied.querySelectorAll('[data-e]').forEach(x => { x.onclick = () => {
          if (champ.value.trim()) { champ.value += x.dataset.e; champ.focus(); }
          else ecrireMessage(x.dataset.e, onglet === 'salon' ? canalSalon() : 'tous');
        }; });
        pied.querySelector('form').onsubmit = (e) => {
          e.preventDefault();
          if (ecrireMessage(champ.value, onglet === 'salon' ? canalSalon() : 'tous')) champ.value = '';
        };
      }
      marquerLus();
      el.bulle.innerHTML = (inv ? '👻' : '💬') + (nb > 1 ? '<span class="sg-nb">' + nb + '</span>' : '');
    }
  }
  // Interrupteur « invisible » : on joue tranquille, sans apparaître chez les autres
  function vueInvisible() {
    var inv = suisInvisible();
    return '<div class="sg-invisible' + (inv ? ' actif' : '') + '"><div><b>👻 Invisible</b><div>' +
      (inv ? 'Personne ne te voit en ligne. Tu peux lire, et tes messages restent signés si tu écris.' : 'Pour jouer tranquille sans apparaître chez les autres.') +
      '</div></div><button class="sg-interrupteur" data-invisible role="switch" aria-checked="' + inv + '"><span></span></button></div>';
  }
  function vuePresents() {
    var moi = monId(), mon = ou();
    var l = listeMembres().sort((a, b) => (a.id === moi ? -1 : b.id === moi ? 1 : a.pseudo.localeCompare(b.pseudo)));
    if (!l.length) return '<div class="sg-vide">' + (role ? 'Personne pour l\'instant.' : 'Connexion au salon global…') + '</div>';
    return l.map(m => {
      var peutRejoindre = m.id !== moi && m.ou && m.ou.salon && !(m.ou.jeu === mon.jeu && simplifier(m.ou.salon) === simplifier(mon.salon));
      var cp = m.cp && typeof CP !== 'undefined' ? '<div class="sg-cp">' + dessinCompagnon(m.cp, 30) + '<span>' + esc(m.cp.n) + (m.cp.ne ? ' · ' + esc(ageCompagnon(m.cp.ne)) : '') + '</span></div>' : '';
      return '<div class="sg-membre">' + avatar(m, 34) + '<div class="sg-qui"><div class="sg-nom">' + esc(m.pseudo) + (m.id === moi ? ' (moi)' : '') + '</div>' +
             '<div class="sg-ou">' + esc(ouTexte(m.ou)) + '</div>' + cp + '</div>' +
             '<div class="sg-actions">' + (peutRejoindre ? '<button class="sg-btn plein" data-rejoindre="' + esc(m.id) + '">Rejoindre</button>' : '') +
             (m.cp && m.id !== moi ? '<button class="sg-btn" data-visiter="' + esc(m.id) + '">🏠 Visiter</button>' : '') + '</div></div>';
    }).join('');
  }
  function vueMessage(m) {
    var moi = m.de === monId();
    var mb = membres[m.de] || m;
    var seulEmoji = /^(\p{Extended_Pictographic}|️|‍|\s){1,6}$/u.test(m.texte);
    return '<div class="sg-msg' + (moi ? ' moi' : '') + '">' + avatar(mb, 28) + '<div class="sg-bloc"><div class="sg-entete"><b>' + esc(m.pseudo) + '</b> · ' + heure(m.h) + '</div>' +
           '<div class="sg-texte' + (seulEmoji ? ' gros' : '') + '">' + esc(m.texte) + '</div></div></div>';
  }
  // Quel serveur de mise en relation sert ce téléphone (reseau.js), avec un interrupteur de secours
  function vueReseau() {
    if (typeof Reseau === 'undefined' || !Reseau.configure()) return '';
    var e = Reseau.etat(), f = Reseau.forcePublic();
    var txt = e === 'desdale' ? '🟢 Serveur de Désdale (Cloudflare)' : f ? '⚪ Serveur public (choisi sur ce téléphone)' : '🟠 Serveur public (secours pour quelques minutes)';
    return '<div style="margin-top:14px;padding-top:10px;border-top:1px solid #e3e8ec;font-size:12px;color:#6b7a86"><b>Réseau</b> : ' + txt +
      '<div style="margin-top:6px"><button class="sg-btn" data-reseau>' + (f ? 'Revenir au serveur de Désdale' : 'Utiliser le serveur public') + '</button></div>' +
      '<div style="margin-top:4px">En cas de souci de connexion. La page se recharge.</div></div>';
  }
  function vueProfil(corps) {
    var p = profil();
    corps.innerHTML = '<div class="sg-profil">' +
      vueInvisible() + '<div class="sg-apercu">' + avatar(publicProfil(), 48) + '<div><b>' + esc(p.pseudo || 'Anonyme') + '</b><div style="font-size:12px;color:#6b7a86">C\'est ainsi que les autres te voient.</div></div></div>' +
      '<label>Pseudo</label><input type="text" maxlength="20" value="' + esc(p.pseudo || '') + '" placeholder="ex : Alex">' +
      '<label>Couleur</label><div class="sg-choix sg-couleurs">' + COULEURS.map(c => '<button data-c="' + c + '" class="' + (p.couleur === c ? 'actif' : '') + '" style="background:' + c + '"></button>').join('') + '</div>' +
      '<label>Image</label><div class="sg-choix sg-emojis"><button data-em="" class="' + (!p.emoji && !p.image ? 'actif' : '') + '" style="font-size:13px;font-weight:800">Aa</button>' +
      EMOJIS.map(e => '<button data-em="' + e + '" class="' + (p.emoji === e && !p.image ? 'actif' : '') + '">' + e + '</button>').join('') + '</div>' +
      '<div style="margin-top:10px;display:flex;gap:8px"><button class="sg-btn" data-photo>📷 Ma photo</button>' + (p.image ? '<button class="sg-btn" data-oter>Retirer la photo</button>' : '') + '</div>' +
      '<input type="file" accept="image/*" style="display:none">' +
      '<div style="font-size:12px;color:#8a97a1;margin-top:10px">Ta photo est réduite et partagée seulement avec les joueurs connectés au salon global.</div>' +
      vueReseau() + '</div>';
    corps.querySelector('[data-invisible]').onclick = basculerInvisible;
    var bReseau = corps.querySelector('[data-reseau]');
    if (bReseau) bReseau.onclick = () => { Reseau.forcerPublic(!Reseau.forcePublic()); location.reload(); };
    var champ = corps.querySelector('input[type=text]');
    champ.onchange = () => { var q = profil(); q.pseudo = champ.value.trim().slice(0, 20); enregistrerProfil(q); };
    corps.querySelectorAll('[data-c]').forEach(x => { x.onclick = () => { var q = profil(); q.couleur = x.dataset.c; enregistrerProfil(q); }; });
    corps.querySelectorAll('[data-em]').forEach(x => { x.onclick = () => { var q = profil(); q.emoji = x.dataset.em; q.image = ''; enregistrerProfil(q); }; });
    var fichier = corps.querySelector('input[type=file]');
    corps.querySelector('[data-photo]').onclick = () => { fichier.value = ''; fichier.click(); };
    var oter = corps.querySelector('[data-oter]');
    if (oter) oter.onclick = () => { var q = profil(); q.image = ''; enregistrerProfil(q); };
    fichier.onchange = () => {
      var f = fichier.files && fichier.files[0];
      if (!f) return;
      var lecteur = new FileReader();
      lecteur.onload = () => {
        var img = new Image();
        img.onload = () => {
          var T = 72, cv = document.createElement('canvas'), cote = Math.min(img.width, img.height);
          cv.width = T; cv.height = T;
          cv.getContext('2d').drawImage(img, (img.width - cote) / 2, (img.height - cote) / 2, cote, cote, 0, 0, T, T);
          var url = cv.toDataURL('image/webp', 0.8);
          if (url.indexOf('data:image/webp') !== 0) url = cv.toDataURL('image/jpeg', 0.8);
          var q = profil(); q.image = url; enregistrerProfil(q);
        };
        img.src = lecteur.result;
      };
      lecteur.readAsDataURL(f);
    };
  }

  // ================== DÉMARRAGE ==================
  function demarrer(j) {
    jeu = JEUX[j] ? j : 'accueil';
    var lancer = () => { installer(); demarrerReseau(); suiteRejoindre(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lancer); else setTimeout(lancer, 0);
  }
  var script = document.currentScript;
  if (script && script.dataset.jeu) demarrer(script.dataset.jeu);

  return { demarrer: demarrer, ouvrir: ouvrir_panneau, pret: () => !!role, membre: id => membres[id] || null, demander: demander, envoyerA: envoyerA,
           membresDuSalon: membresDuSalon, emote: emote, dessinCompagnon: dessinCompagnon, _etat: () => ({ role: role, membres: membres, messages: messages, ou: ou() }) };
})();
