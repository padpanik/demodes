// ================== POKER : RÈGLES, STRUCTURES ET ORDINATEUR ==================
// Utilisé par poker/index.html ; testable avec Node (module.exports en bas).
//
// Une table de poker, en tournoi (on joue jusqu'à ce qu'il reste un gagnant, les blindes montent avec le temps)
// ou en cash game (blindes fixes, on s'assoit et on se lève quand on veut). La règle de jeu est une « variante »
// (VARIANTES) : le Texas Hold'em pour commencer ; une autre (Omaha…) s'ajoute en décrivant ses cartes privées,
// sa façon de former la meilleure main et sa limite de mise, sans toucher au reste.
//
// Rien de secret : l'état complet (cartes de tous) va sur chaque téléphone, l'écran ne montre que les siennes.
// Ainsi n'importe quel joueur peut reprendre la table si l'hôte disparaît (choix de l'utilisateur : on est entre amis).
//
// Un état e = { id, n (compteur d'actions), variante, mode, opts, structure, sieges, niveau, horloge, bouton, nMain, main, fin, journal }
// Un siège = { nom, robot (0 = humain, 1 à 4 = niveau), cache (niveau tiré au hasard, gardé secret), tapis, investi, achats,
//              recaves, statut ('jeu' | 'recave' : sauté, attend de recaver | 'elimine' | 'parti'), rang, gain, attente (cash : cave à ajouter) }

var PK = (function () {
  var RANGS = '23456789TJQKA', COULEURS = 'shdc';      // pique, cœur, carreau, trèfle
  var NOMS_COULEURS = { s: 'pique', h: 'cœur', d: 'carreau', c: 'trèfle' };
  var B = 15;                                          // base du score d'une main (rangs de 2 à 14)
  var B1 = B, B2 = B * B, B3 = B2 * B, B4 = B3 * B, B5 = B4 * B;
  var CATEGORIES = ['Hauteur', 'Paire', 'Deux paires', 'Brelan', 'Quinte', 'Couleur', 'Full', 'Carré', 'Quinte flush'];
  var MAX_JOURNAL = 40;

  function copie(o) { return JSON.parse(JSON.stringify(o)); }
  function rang(c) { return RANGS.indexOf(c.charAt(0)) + 2; }
  function couleur(c) { return c.charAt(1); }
  function rouge(c) { var s = couleur(c); return s === 'h' || s === 'd'; }
  function paquet() { var l = []; for (var i = 0; i < RANGS.length; i++) for (var j = 0; j < 4; j++) l.push(RANGS[i] + COULEURS[j]); return l; }
  function melanger(l, hasard) {
    hasard = hasard || Math.random;
    for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(hasard() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; }
    return l;
  }
  function nouvelId() { return Math.random().toString(36).slice(2, 10); }

  // ---------- Noms ----------
  var NOMS_RANGS = { 11: 'Valet', 12: 'Dame', 13: 'Roi', 14: 'As' };
  var PLURIELS = { 11: 'Valets', 12: 'Dames', 13: 'Rois', 14: 'As' };
  function nomRang(r) { return NOMS_RANGS[r] || String(r); }
  function pluriel(r) { return PLURIELS[r] || String(r); }
  function de(r) { return r === 14 ? 'd\'As' : 'de ' + pluriel(r); }
  function au(r) { return r === 14 ? 'à l\'As' : (r >= 11 ? 'au ' + nomRang(r) : 'au ' + r); }
  function nomCarte(c) { return nomRang(rang(c)) + ' de ' + NOMS_COULEURS[couleur(c)]; }
  // Le nom d'une main, d'après son score
  function nomMain(s) {
    var cat = Math.floor(s / B5), k = [];
    for (var i = 4; i >= 0; i--) k.push(Math.floor(s / Math.pow(B, i)) % B);
    switch (cat) {
      case 0: return 'Hauteur ' + nomRang(k[0]);
      case 1: return 'Paire ' + de(k[0]);
      case 2: return 'Deux paires, ' + pluriel(k[0]) + ' et ' + pluriel(k[1]);
      case 3: return 'Brelan ' + de(k[0]);
      case 4: return 'Quinte ' + au(k[0]);
      case 5: return 'Couleur ' + au(k[0]);
      case 6: return 'Full aux ' + pluriel(k[0]) + ' par les ' + pluriel(k[1]);
      case 7: return 'Carré ' + de(k[0]);
      case 8: return k[0] === 14 ? 'Quinte flush royale' : 'Quinte flush ' + au(k[0]);
    }
    return '';
  }

  // ---------- Valeur d'une main (5 à 7 cartes) : un nombre, plus grand = meilleur ----------
  function hauteQuinte(present) {          // present[r] pour r de 2 à 14 ; l'As compte aussi pour 1
    for (var h = 14; h >= 5; h--) {
      var ok = true;
      for (var r = h; r > h - 5; r--) { if (!present[r === 1 ? 14 : r]) { ok = false; break; } }
      if (ok) return h;
    }
    return 0;
  }
  function score(cartes) {
    var nb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], parC = { s: [], h: [], d: [], c: [] }, i, r;
    for (i = 0; i < cartes.length; i++) { r = rang(cartes[i]); nb[r]++; parC[couleur(cartes[i])].push(r); }
    var flush = null;
    for (var s in parC) if (parC[s].length >= 5) flush = parC[s];
    if (flush) {
      var pf = []; flush.forEach(function (x) { pf[x] = true; });
      var qf = hauteQuinte(pf);
      if (qf) return 8 * B5 + qf * B4;
    }
    var quatre = [], trois = [], deux = [], seuls = [];
    for (r = 14; r >= 2; r--) {
      if (nb[r] === 4) quatre.push(r); else if (nb[r] === 3) trois.push(r); else if (nb[r] === 2) deux.push(r); else if (nb[r] === 1) seuls.push(r);
    }
    var autres = function (exclus, n) {
      var l = [];
      for (var x = 14; x >= 2 && l.length < n; x--) if (nb[x] && exclus.indexOf(x) === -1) l.push(x);
      return l;
    };
    var code = function (cat, l) { var v = cat * B5; for (var j = 0; j < 5; j++) v += (l[j] || 0) * Math.pow(B, 4 - j); return v; };
    if (quatre.length) return code(7, [quatre[0]].concat(autres([quatre[0]], 1)));
    if (trois.length && (trois.length > 1 || deux.length)) {
      var t = trois[0], p = Math.max(trois[1] || 0, deux[0] || 0);
      return code(6, [t, p]);
    }
    if (flush) return code(5, flush.slice().sort(function (a, b) { return b - a; }).slice(0, 5));
    var q = hauteQuinte(nb.map(function (x) { return x > 0; }));
    if (q) return code(4, [q]);
    if (trois.length) return code(3, [trois[0]].concat(autres([trois[0]], 2)));
    if (deux.length >= 2) return code(2, [deux[0], deux[1]].concat(autres([deux[0], deux[1]], 1)));
    if (deux.length) return code(1, [deux[0]].concat(autres([deux[0]], 3)));
    return code(0, autres([], 5));
  }
  // Les 5 cartes de la meilleure main (pour les montrer à l'abattage)
  function meilleureDe(cartes) {
    var n = cartes.length, mieux = null;
    if (n <= 5) return { score: score(cartes), cinq: cartes.slice() };
    var idx = [0, 1, 2, 3, 4];
    while (true) {
      var cinq = idx.map(function (i) { return cartes[i]; }), s = score(cinq);
      if (!mieux || s > mieux.score) mieux = { score: s, cinq: cinq };
      var k = 4;
      while (k >= 0 && idx[k] === n - 5 + k) k--;
      if (k < 0) break;
      idx[k]++;
      for (var j = k + 1; j < 5; j++) idx[j] = idx[j - 1] + 1;
    }
    return mieux;
  }

  // ---------- Variantes (règles du jeu) ----------
  // privees : cartes de chacun ; limite : 'nl' (sans limite) ou 'pl' (limite du pot) ; meilleure : main formée avec ses cartes et le tableau.
  var VARIANTES = {
    holdem: {
      nom: 'Texas Hold\'em', court: 'Hold\'em', privees: 2, limite: 'nl',
      valeur: function (priv, tab) { return score(priv.concat(tab)); },
      meilleure: function (priv, tab) { return meilleureDe(priv.concat(tab)); },
      regles: [
        'Chacun reçoit 2 cartes cachées. 5 cartes communes viennent au milieu : 3 au flop, 1 au tournant, 1 à la rivière.',
        'On forme la meilleure main de 5 cartes avec ses 2 cartes et les 5 du milieu, en se servant de 0, 1 ou 2 de ses cartes.',
        'Quatre tours d\'enchères : avant le flop, après le flop, après le tournant et après la rivière. Sans limite : on peut miser tout son tapis.'
      ]
    }
  };
  function variante(e) { return VARIANTES[(e && e.variante) || 'holdem'] || VARIANTES.holdem; }

  // ---------- Structures ----------
  var JOLIS = [2, 4, 6, 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000,
               6000, 8000, 10000, 12000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 80000, 100000, 120000, 150000, 200000, 250000, 300000, 400000, 500000];
  function joli(x, apres) {             // le premier joli nombre au moins égal à x et plus grand que « apres »
    for (var i = 0; i < JOLIS.length; i++) if (JOLIS[i] >= x && JOLIS[i] > (apres || 0)) return JOLIS[i];
    return JOLIS[JOLIS.length - 1] * Math.ceil(x / JOLIS[JOLIS.length - 1]);
  }
  function petitJoli(x) {               // pour les antes : 5, 10, 15, 20, 25, 50…
    var l = [1, 2, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7500, 10000, 12500, 15000, 20000, 25000];
    var m = l[0]; l.forEach(function (v) { if (v <= x) m = v; });
    return m;
  }
  var DUREES = [30, 60, 90, 120];
  // Profondeur du tapis (en grosses blindes) et durée d'un niveau selon la durée visée
  function profondeur(duree) { return duree <= 30 ? 40 : duree <= 60 ? 60 : duree <= 90 ? 75 : 100; }
  function minutesNiveau(duree) { return duree <= 30 ? 5 : duree <= 60 ? 8 : duree <= 90 ? 10 : 12; }
  // Structure d'un tournoi : on vise une grosse blinde d'environ 5 % des jetons en jeu à la fin du temps prévu.
  // opts = { joueurs, duree (minutes), antes }
  function structure(opts) {
    var n = Math.max(2, Math.min(9, opts.joueurs || 2)), duree = opts.duree || 60, D = profondeur(duree), min = minutesNiveau(duree);
    var L = Math.max(3, Math.round(duree / min)), gb0 = 20, tapis = D * gb0;
    var finale = Math.max(gb0 * 2, 0.05 * n * tapis);
    var r = Math.pow(finale / gb0, 1 / (L - 1));
    r = Math.max(1.2, Math.min(2, r));
    var niveaux = [], prec = 0, debutAntes = Math.floor(L / 2);
    for (var k = 0; k < 30; k++) {
      var gb = k === 0 ? gb0 : joli(gb0 * Math.pow(r, k) * 0.97, prec);
      var ante = opts.antes && k >= debutAntes ? petitJoli(gb / 8) : 0;
      niveaux.push([gb / 2, gb, ante]);
      prec = gb;
    }
    return { tapis: tapis, profondeur: D, minutes: min, niveauxPrevus: L, hausse: Math.round((r - 1) * 100), niveaux: niveaux };
  }
  // Cash game : blindes en poussières d'étoile
  var BLINDES_CASH = [[1, 2], [2, 4], [5, 10]];
  var CAVE = { min: 40, max: 100 };            // en grosses blindes
  // Partage des gains d'un tournoi payant, selon le nombre d'humains
  function repartition(nbHumains) { return nbHumains <= 4 ? [100] : nbHumains <= 6 ? [65, 35] : [50, 30, 20]; }
  function partage(total, nbHumains) {
    var p = repartition(nbHumains), l = p.map(function (x) { return Math.floor(total * x / 100); });
    var reste = total - l.reduce(function (a, b) { return a + b; }, 0);
    l[0] += reste;
    return l;
  }

  // ---------- Options d'une table ----------
  // mode 'tournoi' : monnaie 'gratuit' ou 'etoiles' (mise en ⭐) ; mode 'cash' : monnaie 'poussieres' ou 'fictif'
  function normaliserOptions(o) {
    o = o || {};
    var mode = o.mode === 'cash' ? 'cash' : 'tournoi';
    var r = {
      mode: mode, variante: VARIANTES[o.variante] ? o.variante : 'holdem',
      places: Math.max(2, Math.min(9, parseInt(o.places, 10) || 6)),
      delai: [0, 20, 30, 60].indexOf(o.delai) !== -1 ? o.delai : 0
    };
    if (mode === 'tournoi') {
      r.monnaie = o.monnaie === 'etoiles' ? 'etoiles' : 'gratuit';
      r.mise = r.monnaie === 'etoiles' ? Math.max(1, Math.min(200, parseInt(o.mise, 10) || 5)) : 0;
      r.duree = DUREES.indexOf(o.duree) !== -1 ? o.duree : 60;
      r.recave = [0, 1, 9].indexOf(o.recave) !== -1 ? o.recave : 0;
      r.antes = !!o.antes;
    } else {
      r.monnaie = o.monnaie === 'fictif' ? 'fictif' : 'poussieres';
      var bl = parseInt(o.blindes, 10);
      r.blindes = bl >= 0 && bl < BLINDES_CASH.length ? bl : 0;
      r.recave = true;
    }
    return r;
  }
  function blindesCash(o) { return BLINDES_CASH[o.blindes || 0]; }
  // Une table payante (étoiles ou poussières) : pas d'ordinateurs en cash game (ils fabriqueraient de l'argent)
  function payante(o) { return o.monnaie === 'etoiles' || o.monnaie === 'poussieres'; }
  function robotsPermis(o) { return !(o.mode === 'cash' && o.monnaie === 'poussieres'); }

  // ---------- Horloge (temps de jeu, arrêtée pendant les blocages) ----------
  function tempsJeu(e, t) { var h = e.horloge; return h.ecoule + (h.depuis ? Math.max(0, t - h.depuis) : 0); }
  function arreterHorloge(e, t) { var h = e.horloge; if (h.depuis) { h.ecoule += Math.max(0, t - h.depuis); h.depuis = null; } }
  function lancerHorloge(e, t) { if (!e.horloge.depuis) e.horloge.depuis = t; }
  // Le niveau de blindes à ce moment (tournoi)
  function niveauA(e, t) {
    if (e.mode !== 'tournoi') return 0;
    var k = Math.floor(tempsJeu(e, t) / (e.structure.minutes * 60000));
    return Math.min(e.structure.niveaux.length - 1, k);
  }
  function blindesDe(e, k) {
    if (e.mode === 'cash') { var b = blindesCash(e.opts); return { pb: b[0], gb: b[1], ante: 0 }; }
    var n = e.structure.niveaux[k];
    return { pb: n[0], gb: n[1], ante: n[2] };
  }
  // Fin de la période de recave : la moitié de la durée prévue
  function recavePossible(e, s, t) {
    if (e.mode !== 'tournoi' || !e.opts.recave || s.robot) return false;
    if ((s.recaves || 0) >= e.opts.recave) return false;
    return tempsJeu(e, t) < e.opts.duree * 60000 / 2;
  }

  // ---------- Création ----------
  // joueurs = [{ nom, robot (0 ou 1 à 4), cache }]
  function nouvelleTable(opts, joueurs, t) {
    opts = normaliserOptions(opts);
    var e = {
      v: 1, id: nouvelId(), n: 0, variante: opts.variante, mode: opts.mode, opts: opts, structure: null,
      sieges: [], niveau: 0, horloge: { ecoule: 0, depuis: null }, bouton: -1, nMain: 0, main: null, fin: null, journal: [], pause: false
    };
    if (opts.mode === 'tournoi') e.structure = structure({ joueurs: joueurs.length, duree: opts.duree, antes: opts.antes });
    melanger(joueurs.slice(), Math.random).forEach(function (j) {
      e.sieges.push({ nom: j.nom, robot: j.robot || 0, cache: !!j.cache, tapis: opts.mode === 'tournoi' ? e.structure.tapis : (j.tapis || 0),
                      investi: opts.mode === 'tournoi' && !j.robot ? opts.mise : (j.tapis || 0), achats: 1, recaves: 0, statut: 'jeu', rang: 0, gain: 0, attente: 0 });
    });
    noter(e, opts.mode === 'tournoi' ? 'Le tournoi commence : ' + e.structure.tapis + ' jetons chacun.' : 'La table ouvre.');
    return e;
  }
  function noter(e, txt) { e.journal.push(txt); if (e.journal.length > MAX_JOURNAL) e.journal.splice(0, e.journal.length - MAX_JOURNAL); }
  function siege(e, nom) { for (var i = 0; i < e.sieges.length; i++) if (e.sieges[i].nom === nom) return e.sieges[i]; return null; }
  function indexSiege(e, nom) { for (var i = 0; i < e.sieges.length; i++) if (e.sieges[i].nom === nom) return i; return -1; }
  function assis(e) { return e.sieges.filter(function (s) { return s.statut === 'jeu' || s.statut === 'recave'; }); }
  function enLice(e) { return e.sieges.filter(function (s) { return s.statut === 'jeu' || s.statut === 'recave'; }).length; }
  function humains(e) { return e.sieges.filter(function (s) { return !s.robot; }); }

  // ---------- Une main ----------
  function suivantDans(liste, depuis, nbSieges, ok) {     // prochain siège de la liste après « depuis », dans l'ordre de la table
    for (var d = 1; d <= nbSieges; d++) { var i = (depuis + d) % nbSieges; if (liste.indexOf(i) !== -1 && (!ok || ok(i))) return i; }
    return -1;
  }
  // Peut-on lancer une main ? (au moins deux joueurs avec des jetons)
  function partants(e) {
    var l = [];
    e.sieges.forEach(function (s, i) { if (s.statut === 'jeu' && s.tapis > 0) l.push(i); });
    return l;
  }
  function nouvelleMain(e, t) {
    if (e.fin) return 'La partie est finie.';
    // Cash : caves en attente
    e.sieges.forEach(function (s) { if (s.attente) { s.tapis += s.attente; s.attente = 0; } });
    // Tournoi : la période de recave est passée pour qui hésitait encore
    e.sieges.forEach(function (s) { if (s.statut === 'recave' && !recavePossible(e, s, t)) eliminer(e, s); });
    verifierFin(e);
    if (e.fin) { e.n++; return 'La partie est finie.'; }
    var l = partants(e);
    if (l.length < 2) return 'Il faut au moins deux joueurs avec des jetons.';
    lancerHorloge(e, t);
    var k = niveauA(e, t);
    if (k !== e.niveau && e.mode === 'tournoi') { e.niveau = k; var bn = blindesDe(e, k); noter(e, '⏫ Niveau ' + (k + 1) + ' : blindes ' + bn.pb + ' / ' + bn.gb + (bn.ante ? ', ante ' + bn.ante : '') + '.'); }
    var bl = blindesDe(e, e.niveau), N = e.sieges.length;
    e.bouton = e.bouton < 0 ? l[Math.floor(Math.random() * l.length)] : suivantDans(l, e.bouton, N);
    var pb, gb;
    if (l.length === 2) { pb = e.bouton; gb = suivantDans(l, pb, N); }
    else { pb = suivantDans(l, e.bouton, N); gb = suivantDans(l, pb, N); }
    var m = {
      n: ++e.nMain, bouton: e.bouton, iPb: pb, iGb: gb, pb: bl.pb, gb: bl.gb, ante: bl.ante, joueurs: l.slice(),
      paquet: melanger(paquet()), privees: {}, tableau: [], rue: 0, mise: {}, engage: {}, couche: {}, agi: {}, faits: {},
      miseMax: 0, relanceMin: bl.gb, tour: null, debutTour: t, depart: {}, montre: {}, resultat: null, fini: false, runout: false, partira: {}
    };
    e.main = m;
    l.forEach(function (i) { var s = e.sieges[i]; m.mise[s.nom] = 0; m.engage[s.nom] = 0; m.depart[s.nom] = s.tapis; });
    // Antes, puis blindes
    if (bl.ante) l.forEach(function (i) { payer(e, e.sieges[i], Math.min(bl.ante, e.sieges[i].tapis), false); });
    payer(e, e.sieges[pb], Math.min(bl.pb, e.sieges[pb].tapis), true);
    payer(e, e.sieges[gb], Math.min(bl.gb, e.sieges[gb].tapis), true);
    m.faits[e.sieges[pb].nom] = 'PB'; m.faits[e.sieges[gb].nom] = 'GB';
    m.miseMax = bl.gb;
    // Deux cartes chacun, en commençant après le bouton
    var nb = variante(e).privees, ordre = [], i0 = e.bouton;
    for (var x = 0; x < l.length; x++) { i0 = suivantDans(l, i0, N); ordre.push(i0); }
    for (var c = 0; c < nb; c++) ordre.forEach(function (i) { var nom = e.sieges[i].nom; (m.privees[nom] = m.privees[nom] || []).push(m.paquet.pop()); });
    // Premier à parler : après la grosse blinde
    m.tour = premierAParler(e, gb);
    e.n++;
    if (m.tour === null) avancer(e, t);
    return null;
  }
  function payer(e, s, montant, blinde) {
    var m = e.main;
    s.tapis -= montant;
    m.engage[s.nom] += montant;
    if (blinde) m.mise[s.nom] += montant;
  }
  function peutAgir(e, nom) { var m = e.main, s = siege(e, nom); return !m.couche[nom] && s.tapis > 0 && (s.statut === 'jeu'); }
  function doitParler(e, nom) { var m = e.main; return peutAgir(e, nom) && (!m.agi[nom] || m.mise[nom] < m.miseMax); }
  // Le premier joueur après le siège « apres » qui doit encore parler (null si personne)
  function premierAParler(e, apres) {
    var m = e.main, N = e.sieges.length;
    var i = suivantDans(m.joueurs, apres, N, function (k) { return doitParler(e, e.sieges[k].nom); });
    return i === -1 ? null : e.sieges[i].nom;
  }
  function enCourse(e) { var m = e.main; return m.joueurs.map(function (i) { return e.sieges[i].nom; }).filter(function (n) { return !m.couche[n]; }); }
  function pot(e) { var m = e.main, t = 0; if (!m) return 0; for (var n in m.engage) t += m.engage[n]; return t; }
  // Les mises du tour, déjà ramassées au milieu ou pas
  function potAuMilieu(e) { var m = e.main, t = pot(e); if (!m) return 0; for (var n in m.mise) t -= m.mise[n]; return t; }

  // Ce que le joueur peut faire : { coucher, parler, suivre, relancer: { min, max } (montants « relancer à », mise totale du tour) }
  function possibles(e, nom) {
    var m = e.main;
    if (!m || m.fini || m.tour !== nom || e.pause) return null;
    var s = siege(e, nom), aSuivre = m.miseMax - m.mise[nom], r = { aSuivre: aSuivre, coucher: aSuivre > 0, parler: aSuivre <= 0, suivre: 0, relancer: null, miser: m.miseMax === 0 };
    if (aSuivre > 0) r.suivre = Math.min(aSuivre, s.tapis);
    var tout = m.mise[nom] + s.tapis;                       // tapis : jusqu'où je peux aller
    if (!m.agi[nom] && tout > m.miseMax) {
      var max = tout;
      if (variante(e).limite === 'pl') max = Math.min(tout, m.miseMax + pot(e) + aSuivre);
      var min = Math.min(tout, m.miseMax + m.relanceMin);
      // Au moins deux joueurs doivent pouvoir encore miser, sinon relancer ne sert à rien
      var autres = enCourse(e).filter(function (n) { return n !== nom && siege(e, n).tapis > 0; });
      if (autres.length) r.relancer = { min: Math.max(min, m.miseMax + 1), max: max };
      if (r.relancer && r.relancer.min > r.relancer.max) r.relancer.min = r.relancer.max;
    }
    return r;
  }
  // a = { type: 'coucher' | 'parler' | 'suivre' | 'relancer', montant (relancer : mise totale du tour) }
  function agir(e, nom, a, t) {
    var p = possibles(e, nom);
    if (!p) return 'Ce n\'est pas ton tour.';
    var m = e.main, s = siege(e, nom), type = a && a.type;
    if (type === 'coucher') {
      if (!p.coucher) type = 'parler';
      else { m.couche[nom] = true; m.faits[nom] = 'Couché'; noter(e, nom + ' se couche.'); }
    }
    if (type === 'parler') {
      if (!p.parler) return 'Il y a une mise à suivre.';
      m.faits[nom] = 'Parole';
    } else if (type === 'suivre') {
      if (!p.suivre) { if (p.parler) { m.faits[nom] = 'Parole'; } else return 'Rien à suivre.'; }
      else { payer(e, s, p.suivre, true); m.faits[nom] = s.tapis === 0 ? 'Tapis' : 'Suit'; noter(e, nom + (s.tapis === 0 ? ' fait tapis (' + m.mise[nom] + ').' : ' suit ' + m.mise[nom] + '.')); }
    } else if (type === 'relancer') {
      if (!p.relancer) return 'Tu ne peux pas relancer.';
      var v = Math.round(Number(a.montant) || 0);
      v = Math.max(p.relancer.min, Math.min(p.relancer.max, v));
      var ajout = v - m.mise[nom], hausse = v - m.miseMax;
      payer(e, s, ajout, true);
      var complete = hausse >= m.relanceMin;
      if (complete) { m.relanceMin = hausse; m.enchere = (m.enchere || 0) + 1; }
      m.miseMax = v;
      if (complete) Object.keys(m.agi).forEach(function (n) { m.agi[n] = false; });
      var mot = s.tapis === 0 ? 'Tapis' : (p.miser ? 'Mise' : 'Relance');
      m.faits[nom] = mot;
      noter(e, nom + (s.tapis === 0 ? ' fait tapis (' + v + ').' : (p.miser ? ' mise ' : ' relance à ') + v + '.'));
      m.agresseur = nom;
    } else if (type !== 'coucher') return 'Action inconnue.';
    m.agi[nom] = true;
    e.n++;
    // Un joueur qui a demandé à se lever (cash) : il part dès qu'il est couché
    avancer(e, t, nom);
    return null;
  }
  // Après une action : joueur suivant, rue suivante, ou fin de la main
  function avancer(e, t, dernier) {
    var m = e.main;
    if (!m || m.fini) return;
    var vivants = enCourse(e);
    if (vivants.length === 1) return finMain(e, t);
    var depuis = dernier !== undefined ? indexSiege(e, dernier) : (m.tour ? indexSiege(e, m.tour) : m.bouton);
    var suivant = premierAParler(e, depuis);
    if (suivant) { m.tour = suivant; m.debutTour = t; return; }
    // Fin du tour d'enchères : les mises vont au milieu
    m.tour = null;
    rendreExces(e);
    var actifs = vivants.filter(function (n) { return siege(e, n).tapis > 0; });
    if (m.rue >= 3) return finMain(e, t);
    if (actifs.length <= 1) {
      // Plus personne ne peut miser : on montre les cartes et on déroule le tableau (l'hôte appelle derouler)
      m.runout = true;
      vivants.forEach(function (n) { m.montre[n] = true; });
      return;
    }
    rueSuivante(e, t);
  }
  // La mise la plus haute que personne n'a suivie revient à son auteur
  function rendreExces(e) {
    var m = e.main, l = enCourse(e).map(function (n) { return [n, m.mise[n]]; }).sort(function (a, b) { return b[1] - a[1]; });
    if (l.length >= 2 && l[0][1] > l[1][1]) {
      var exces = l[0][1] - l[1][1], s = siege(e, l[0][0]);
      s.tapis += exces; m.engage[s.nom] -= exces; m.mise[s.nom] -= exces;
    }
  }
  function rueSuivante(e, t) {
    var m = e.main;
    m.rue++;
    var n = m.rue === 1 ? 3 : 1;
    m.paquet.pop();                                   // carte brûlée
    for (var i = 0; i < n; i++) m.tableau.push(m.paquet.pop());
    Object.keys(m.mise).forEach(function (x) { m.mise[x] = 0; });
    Object.keys(m.agi).forEach(function (x) { m.agi[x] = false; });
    Object.keys(m.faits).forEach(function (x) { if (m.faits[x] !== 'Couché' && m.faits[x] !== 'Tapis') delete m.faits[x]; });
    m.miseMax = 0; m.relanceMin = m.gb; m.enchere = 0;
    m.tour = premierAParler(e, m.bouton);
    m.debutTour = t;
    e.n++;
    if (m.tour === null) avancer(e, t);
  }
  // Tapis de tous : une carte de plus (appelé par l'hôte avec un petit délai, pour le suspense)
  function derouler(e, t) {
    var m = e.main;
    if (!m || m.fini || !m.runout) return false;
    if (m.rue >= 3) { finMain(e, t); return true; }
    m.rue++;
    var n = m.rue === 1 ? 3 : 1;
    m.paquet.pop();
    for (var i = 0; i < n; i++) m.tableau.push(m.paquet.pop());
    Object.keys(m.mise).forEach(function (x) { m.mise[x] = 0; });
    e.n++;
    if (m.rue >= 3) finMain(e, t);
    return true;
  }
  // Pots (principal et secondaires) d'après ce que chacun a engagé
  function pots(e) {
    var m = e.main, noms = Object.keys(m.engage), vivants = enCourse(e);
    var niveaux = vivants.map(function (n) { return m.engage[n]; }).filter(function (v, i, l) { return l.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
    var l = [], prec = 0;
    niveaux.forEach(function (niv) {
      var montant = 0;
      noms.forEach(function (n) { montant += Math.max(0, Math.min(m.engage[n], niv) - Math.min(m.engage[n], prec)); });
      var eligibles = vivants.filter(function (n) { return m.engage[n] >= niv; });
      if (montant > 0) {
        if (l.length && l[l.length - 1].eligibles.join() === eligibles.join()) l[l.length - 1].montant += montant;
        else l.push({ montant: montant, eligibles: eligibles });
      }
      prec = niv;
    });
    // Ce qu'ont mis les couchés au-delà du plus gros engagement des vivants va au dernier pot
    var reste = 0;
    noms.forEach(function (n) { reste += Math.max(0, m.engage[n] - prec); });
    if (reste && l.length) l[l.length - 1].montant += reste;
    return l;
  }
  function finMain(e, t) {
    var m = e.main, V = variante(e), vivants = enCourse(e), gains = {}, details = [];
    m.tour = null;
    rendreExces(e);
    var abattage = vivants.length > 1;
    var mains = {};
    if (abattage) {
      // Tableau complet (au cas où)
      while (m.tableau.length < 5) { m.paquet.pop(); m.tableau.push(m.paquet.pop()); }
      vivants.forEach(function (n) { m.montre[n] = true; var b = V.meilleure(m.privees[n], m.tableau); mains[n] = { score: b.score, nom: nomMain(b.score), cinq: b.cinq }; });
    }
    var N = e.sieges.length;
    pots(e).forEach(function (p, k) {
      var gagnants;
      if (!abattage) gagnants = vivants.slice();
      else {
        var best = Math.max.apply(null, p.eligibles.map(function (n) { return mains[n].score; }));
        gagnants = p.eligibles.filter(function (n) { return mains[n].score === best; });
      }
      // Jetons impairs : au premier gagnant après le bouton
      gagnants.sort(function (a, b) { return ((indexSiege(e, a) - m.bouton - 1 + N) % N) - ((indexSiege(e, b) - m.bouton - 1 + N) % N); });
      var part = Math.floor(p.montant / gagnants.length), reste = p.montant - part * gagnants.length;
      gagnants.forEach(function (n, i) { var g = part + (i < reste ? 1 : 0); gains[n] = (gains[n] || 0) + g; siege(e, n).tapis += g; });
      details.push({ montant: p.montant, gagnants: gagnants, main: abattage ? mains[gagnants[0]].nom : '', principal: k === 0 });
    });
    m.resultat = { abattage: abattage, gains: gains, pots: details, mains: mains };
    m.fini = true;
    Object.keys(m.mise).forEach(function (x) { m.mise[x] = 0; });
    var g = Object.keys(gains);
    noter(e, g.map(function (n) { return n + ' gagne ' + gains[n] + (abattage ? ' (' + mains[n].nom.toLowerCase() + ')' : ''); }).join(', ') + '.');
    e.n++;
    apresMain(e, t);
  }
  // Éliminations, recaves, fin du tournoi ; départs du cash game
  function apresMain(e, t) {
    var m = e.main;
    if (e.mode === 'cash') {
      Object.keys(m.partira).forEach(function (n) { partir(e, n); });
      return;
    }
    var sautes = m.joueurs.map(function (i) { return e.sieges[i]; }).filter(function (s) { return s.tapis === 0 && s.statut === 'jeu'; });
    // Le plus gros tapis au début de la main finit le mieux classé
    sautes.sort(function (a, b) { return m.depart[a.nom] - m.depart[b.nom]; });
    sautes.forEach(function (s) {
      if (recavePossible(e, s, t)) { s.statut = 'recave'; noter(e, s.nom + ' a tout perdu : il peut recaver.'); }
      else eliminer(e, s);
    });
    verifierFin(e);
  }
  function eliminer(e, s) {
    s.rang = enLice(e);
    s.statut = 'elimine';
    s.tapis = 0;
    noter(e, s.nom + ' est éliminé (' + s.rang + (s.rang === 1 ? 'er' : 'e') + ').');
    calculerGains(e);
  }
  function verifierFin(e) {
    if (e.mode !== 'tournoi' || e.fin) return;
    var restants = e.sieges.filter(function (s) { return s.statut === 'jeu'; }), attente = e.sieges.filter(function (s) { return s.statut === 'recave'; });
    if (restants.length === 1 && !attente.length) {
      var g = restants[0];
      g.rang = 1;
      g.statut = 'elimine';
      calculerGains(e);
      e.fin = { gagnant: g.nom };
      noter(e, '🏆 ' + g.nom + ' gagne le tournoi !');
      e.n++;
    } else if (!restants.length && !attente.length) { e.fin = { gagnant: null }; e.n++; }
  }
  // Gains en étoiles : le classement compte entre humains seulement (les ordinateurs ne paient ni ne gagnent)
  function calculerGains(e) {
    if (e.mode !== 'tournoi' || e.opts.monnaie !== 'etoiles') return;
    var h = humains(e), total = h.reduce(function (a, s) { return a + (s.investi || 0); }, 0), parts = partage(total, h.length);
    var classes = h.filter(function (s) { return s.rang > 0; }).sort(function (a, b) { return a.rang - b.rang; });
    // Place parmi les humains : 1 + nombre d'humains encore en jeu ou mieux classés
    h.forEach(function (s) {
      if (!s.rang) return;
      var place = h.filter(function (x) { return x !== s && (!x.rang || x.rang < s.rang); }).length;
      s.place = place + 1;
      s.gain = parts[place] || 0;
    });
    return classes;
  }
  // Recaver (tournoi : après avoir tout perdu, pendant la première moitié ; cash : entre deux mains, jusqu'à la cave maximum)
  function recaver(e, nom, montant, t) {
    var s = siege(e, nom);
    if (!s) return 'Pas assis.';
    if (e.mode === 'tournoi') {
      if (s.statut !== 'recave') return 'Pas de recave possible.';
      if (!recavePossible(e, s, t)) { eliminer(e, s); verifierFin(e); e.n++; return 'La période de recave est finie.'; }
      s.tapis = e.structure.tapis; s.statut = 'jeu'; s.recaves = (s.recaves || 0) + 1; s.achats++;
      if (!s.robot) s.investi += e.opts.mise;
      noter(e, s.nom + ' recave.');
      e.n++;
      return null;
    }
    var gb = blindesCash(e.opts)[1], max = CAVE.max * gb, deja = s.tapis + s.attente;
    var v = Math.min(Math.round(montant), max - deja);
    if (v <= 0) return 'Ton tapis est déjà au maximum.';
    if (deja + v < CAVE.min * gb && s.tapis === 0) return 'Il faut au moins ' + CAVE.min * gb + '.';
    var enMain = e.main && !e.main.fini && e.main.joueurs.indexOf(indexSiege(e, nom)) !== -1;
    if (enMain) s.attente += v; else s.tapis += v;
    s.investi += v; s.achats++;
    noter(e, s.nom + ' ajoute ' + v + ' à son tapis.');
    e.n++;
    return null;
  }
  function refuserRecave(e, nom) {
    var s = siege(e, nom);
    if (!s || s.statut !== 'recave') return 'Rien à refuser.';
    eliminer(e, s); verifierFin(e); e.n++;
    return null;
  }
  // Cash : s'asseoir avec une cave
  function asseoir(e, nom, montant, robot) {
    if (e.mode !== 'cash') return 'Seulement en cash game.';
    var gb = blindesCash(e.opts)[1], v = Math.round(montant);
    if (v < CAVE.min * gb || v > CAVE.max * gb) return 'La cave va de ' + CAVE.min * gb + ' à ' + CAVE.max * gb + '.';
    var s = siege(e, nom);
    if (s && (s.statut === 'jeu')) return 'Déjà assis.';
    var occupes = e.sieges.filter(function (x) { return x.statut === 'jeu'; }).length;
    if (occupes >= e.opts.places) return 'La table est complète.';
    if (s) { s.statut = 'jeu'; s.tapis = v; s.attente = 0; s.investi += v; s.achats++; }
    else {
      // Une place libérée (joueur parti) est reprise, sinon une nouvelle
      var libre = e.sieges.filter(function (x) { return x.statut === 'parti'; })[0], nouveau = { nom: nom, robot: robot || 0, cache: false, tapis: v, investi: v, achats: 1, recaves: 0, statut: 'jeu', rang: 0, gain: 0, attente: 0 };
      if (libre && !(e.main && !e.main.fini && e.main.joueurs.indexOf(e.sieges.indexOf(libre)) !== -1)) e.sieges[e.sieges.indexOf(libre)] = nouveau;
      else e.sieges.push(nouveau);
    }
    noter(e, nom + ' s\'assoit avec ' + v + '.');
    e.n++;
    return null;
  }
  // Cash : se lever (tout de suite hors d'une main, sinon à la fin de la main, couché dès son tour)
  function lever(e, nom, t) {
    var s = siege(e, nom), m = e.main;
    if (!s || s.statut !== 'jeu') return 'Pas assis.';
    if (m && !m.fini && m.joueurs.indexOf(indexSiege(e, nom)) !== -1 && !m.couche[nom]) {
      m.partira[nom] = true;
      // À tapis, ou cartes déjà montrées : il garde sa part du pot et part à la fin de la main
      if (m.runout || s.tapis === 0) { e.n++; return null; }
      if (m.tour === nom) return agir(e, nom, { type: 'coucher' }, t) || null;
      // Pas son tour : il est couché tout de suite (personne n'attend après lui)
      m.couche[nom] = true; m.faits[nom] = 'Couché';
      e.n++;
      if (enCourse(e).length === 1) finMain(e, t);
      return null;
    }
    partir(e, nom);
    e.n++;
    return null;
  }
  function partir(e, nom) {
    var s = siege(e, nom);
    if (!s || s.statut === 'parti') return;
    var montant = s.tapis + (s.attente || 0);
    s.statut = 'parti'; s.tapis = 0; s.attente = 0;
    e.departs = e.departs || {};
    e.departs[nom] = { montant: montant, k: s.achats, investi: s.investi };
    s.investi = 0;
    noter(e, nom + ' se lève avec ' + montant + '.');
  }
  // Retirer un joueur déconnecté (choix des autres) : couché, puis éliminé (tournoi) ou levé avec ses jetons (cash)
  function retirer(e, nom, t) {
    var s = siege(e, nom), m = e.main;
    if (!s || (s.statut !== 'jeu' && s.statut !== 'recave')) return 'Pas à la table.';
    var enMain = m && !m.fini && m.joueurs.indexOf(indexSiege(e, nom)) !== -1 && !m.couche[nom];
    if (enMain) { m.couche[nom] = true; m.faits[nom] = 'Retiré'; m.agi[nom] = true; }
    noter(e, nom + ' est retiré de la table.');
    if (e.mode === 'cash') {
      if (enMain) m.partira[nom] = true; else partir(e, nom);
    } else {
      s.tapis = 0;
      eliminer(e, s);
    }
    e.n++;
    if (enMain) {
      if (enCourse(e).length === 1) finMain(e, t);
      else if (m.tour === nom) avancer(e, t, nom);
    }
    if (e.mode === 'tournoi') verifierFin(e);
    return null;
  }
  // Arrêter la table au milieu d'une main : chacun reprend ce qu'il avait engagé
  function annulerMain(e) {
    var m = e.main;
    if (!m || m.fini) return;
    Object.keys(m.engage).forEach(function (n) { var s = siege(e, n); if (s) s.tapis += m.engage[n]; m.engage[n] = 0; m.mise[n] = 0; });
    m.fini = true; m.annulee = true; m.tour = null;
    e.n++;
  }
  // Temps de réflexion dépassé : parole si possible, sinon on se couche
  function tempsEcoule(e, t) {
    var m = e.main;
    if (!m || m.fini || !m.tour || !e.opts.delai || e.pause) return false;
    if (t - m.debutTour < e.opts.delai * 1000) return false;
    var p = possibles(e, m.tour);
    agir(e, m.tour, { type: p && p.parler ? 'parler' : 'coucher' }, t);
    return true;
  }

  // ================== ORDINATEUR ==================
  // Force d'une main de départ (formule de Chen, ramenée entre 0 et 1)
  function chen(c1, c2) {
    var r1 = rang(c1), r2 = rang(c2), h = Math.max(r1, r2), b = Math.min(r1, r2);
    var pts = { 14: 10, 13: 8, 12: 7, 11: 6 }[h] || h / 2;
    if (r1 === r2) pts = Math.max(5, pts * 2);
    if (couleur(c1) === couleur(c2)) pts += 2;
    var ecart = h - b - 1;
    if (r1 !== r2) {
      pts -= [0, 1, 2, 4, 5][Math.min(4, ecart)] + (ecart >= 4 ? 0 : 0);
      if (ecart <= 1 && h < 12) pts += 1;
    }
    return Math.max(0, Math.min(1, (pts + 1) / 21));
  }
  // Probabilité de gagner (égalités comptées à moitié) contre nbAdv mains tirées au hasard (au-dessus de « seuil » de Chen)
  function equite(priv, tab, nbAdv, sims, seuil, hasard) {
    hasard = hasard || Math.random;
    var connues = priv.concat(tab), reste = paquet().filter(function (c) { return connues.indexOf(c) === -1; });
    var gagne = 0;
    for (var k = 0; k < sims; k++) {
      var p = reste.slice(), pris = 0;
      var tire = function () { var i = pris + Math.floor(hasard() * (p.length - pris)), x = p[i]; p[i] = p[pris]; p[pris] = x; pris++; return x; };
      var advs = [];
      for (var a = 0; a < nbAdv; a++) {
        var h1, h2, essais = 0;
        do {
          if (essais) { pris -= 2; }
          h1 = tire(); h2 = tire(); essais++;
        } while (seuil && essais < 6 && chen(h1, h2) < seuil);
        advs.push([h1, h2]);
      }
      var t = tab.slice();
      while (t.length < 5) t.push(tire());
      var moi = score(priv.concat(t)), mieux = true, egal = 0;
      for (var j = 0; j < advs.length; j++) {
        var s = score(advs[j].concat(t));
        if (s > moi) { mieux = false; break; }
        if (s === moi) egal++;
      }
      if (mieux) gagne += egal ? 1 / (egal + 1) : 1;
    }
    return gagne / sims;
  }
  // Classement des 1 326 mains de départ (Chen), calculé une fois : pourcentMain = part des mains meilleures
  var TABLE_PC = null;
  function pourcentMain(c1, c2) {
    if (!TABLE_PC) {
      var l = [], p = paquet();
      for (var i = 0; i < p.length; i++) for (var j = i + 1; j < p.length; j++) l.push(chen(p[i], p[j]));
      l.sort(function (a, b) { return b - a; });
      TABLE_PC = l;
    }
    var v = chen(c1, c2), n = 0;
    while (n < TABLE_PC.length && TABLE_PC[n] > v) n++;
    return n / TABLE_PC.length;
  }
  // Ma place dans l'ordre de parole avant le flop (0 = premier à parler)
  function rangPosition(e, nom) {
    var m = e.main, N = e.sieges.length, i = m.iGb, k = 0;
    for (var d = 0; d < N; d++) { i = (i + 1) % N; if (m.joueurs.indexOf(i) === -1) continue; if (e.sieges[i].nom === nom) return k; k++; }
    return 0;
  }
  // Niveaux : 1 Débutant (joue trop de mains, suit beaucoup), 2 Amateur (sa force contre des mains au hasard),
  // 3 Confirmé (cote du pot, position, mises en proportion du pot), 4 Expert (lit l'agressivité, bluffs dosés, tapis quand il est court)
  var NIVEAUX = [
    null,
    { nom: 'Débutant', sims: 80, bruit: 0.16, marge: -0.08, agressif: 0.25, bluff: 0.04, suiveur: 0.35 },
    { nom: 'Amateur', sims: 150, bruit: 0.09, marge: 0.0, agressif: 0.45, bluff: 0.06, suiveur: 0.12 },
    { nom: 'Confirmé', sims: 200, bruit: 0.08, marge: 0.02, agressif: 0.6, bluff: 0.08, suiveur: 0.06 },
    { nom: 'Expert', sims: 500, bruit: 0.02, marge: 0.05, agressif: 0.75, bluff: 0.1, suiveur: 0 }
  ];
  function ordinateur(e, nom, hasard) {
    hasard = hasard || Math.random;
    var m = e.main, p = possibles(e, nom), s = siege(e, nom);
    if (!p) return null;
    var niv = NIVEAUX[Math.max(1, Math.min(4, s.robot || 2))];
    var adversaires = enCourse(e).filter(function (n) { return n !== nom; }), nbAdv = adversaires.length;
    var potT = pot(e), aSuivre = p.aSuivre, gb = m.gb, tapisGB = (s.tapis + m.mise[nom]) / gb;
    var cote = aSuivre > 0 ? aSuivre / (potT + aSuivre) : 0;
    var montantA = function (x) {
      if (!p.relancer) return null;
      var v = Math.round(x);
      if (v >= p.relancer.max * 0.8) v = p.relancer.max;
      return { type: 'relancer', montant: Math.max(p.relancer.min, Math.min(p.relancer.max, v)) };
    };
    var suivreOuParler = function () { return aSuivre > 0 ? { type: 'suivre' } : { type: 'parler' }; };
    var abandon = function () { return aSuivre > 0 ? { type: 'coucher' } : { type: 'parler' }; };
    var rel = function (frac) {   // mise en proportion du pot
      var base = m.miseMax + aSuivre * 0;
      if (m.rue === 0) {
        var limpers = Object.keys(m.mise).filter(function (n) { return m.mise[n] === m.miseMax && n !== nom; }).length;
        return montantA(m.miseMax === gb ? gb * (2.5 + Math.max(0, limpers - 1)) : m.miseMax * 3);
      }
      return montantA(base + (potT + aSuivre) * frac);
    };
    // Avant le flop : des fourchettes de mains selon la position et le niveau (plutôt qu'un calcul de chances)
    if (m.rue === 0) {
      var pc = pourcentMain(m.privees[nom][0], m.privees[nom][1]);           // 0 = la meilleure main, 1 = la pire
      var apres = m.joueurs.length - 1 - rangPosition(e, nom);                 // joueurs qui parlent encore après moi
      var ouvre = [0, 0.55, 0.32, 0.24, 0.22][s.robot] + (apres <= 1 ? 0.12 : apres <= 2 ? 0.06 : 0) - Math.max(0, m.joueurs.length - 6) * 0.015;
      if (m.joueurs.length <= 3) ouvre += 0.12;
      if (m.joueurs.length === 2) ouvre += 0.15;
      var relance = m.enchere || 0, mur = aSuivre / gb;                       // nombre de relances, et ce qu'il faut payer en blindes
      // Expert ou confirmé court en jetons : tapis ou rien
      if (s.robot >= 3 && tapisGB <= 12) {
        var pousse = 0.1 + (12 - tapisGB) * 0.02 + (apres <= 1 ? 0.08 : 0) + (m.joueurs.length <= 3 ? 0.12 : 0) - relance * 0.06;
        if (pc <= Math.max(0.04, pousse)) return p.relancer ? montantA(p.relancer.max) : suivreOuParler();
        return aSuivre > 0 && cote < 0.2 && pc < 0.5 ? { type: 'suivre' } : abandon();
      }
      var bruitPc = pc + (hasard() - 0.5) * niv.bruit;
      if (!relance) {
        if (bruitPc <= ouvre * 0.45 + (s.robot === 1 ? -0.1 : 0) && p.relancer) return rel(0);
        if (bruitPc <= ouvre) {
          if (p.relancer && s.robot >= 3 && hasard() < 0.75) return rel(0);
          return suivreOuParler();
        }
        return aSuivre > 0 && aSuivre <= gb * 0.5 && bruitPc < ouvre * 1.5 ? { type: 'suivre' } : abandon();
      }
      // Face à une relance
      var tient = [0, 0.3, 0.13, 0.1, 0.11][s.robot] / Math.max(1, relance * 0.8) + (mur <= 3 ? 0.04 : 0) + (apres === 0 && cote < 0.3 ? 0.05 : 0);
      var surRelance = [0, 0.02, 0.035, 0.045, 0.055][s.robot] / relance;
      if (bruitPc <= surRelance && p.relancer) return rel(0);
      if (bruitPc <= tient) return { type: 'suivre' };
      return abandon();
    }
    // Mains adverses plus fortes quand ils ont relancé (niveaux 3 et 4)
    var seuil = 0;
    if (s.robot >= 3 && m.enchere) seuil = Math.min(0.55, (s.robot >= 4 ? 0.22 : 0.15) + 0.12 * m.enchere);
    else if (s.robot >= 4) seuil = 0.14;
    var eq = equite(m.privees[nom], m.tableau, nbAdv, niv.sims, seuil, hasard);
    eq = Math.max(0, Math.min(1, eq + (hasard() - 0.5) * 2 * niv.bruit));
    var relatif = eq * (nbAdv + 1);                 // 1 = autant de chances que les autres
    var forte = 1.75 - niv.agressif * 0.35, tresForte = 2.4 - niv.agressif * 0.3;
    if (nbAdv === 1) { forte = 1.18; tresForte = 1.5; }
    // Très forte : on relance (parfois on ralentit pour piéger)
    if (relatif >= tresForte && p.relancer && hasard() < 0.55 + niv.agressif * 0.4) return rel(m.rue === 0 ? 0 : (0.6 + hasard() * 0.5));
    if (relatif >= forte && p.relancer && hasard() < niv.agressif) {
      if (aSuivre === 0 || hasard() < 0.5) return rel(0.5 + hasard() * 0.3);
    }
    // Bluff ou semi-bluff, plutôt quand personne n'a misé et contre peu d'adversaires
    if (p.relancer && aSuivre === 0 && nbAdv <= 2 && hasard() < niv.bluff * (m.agresseur === nom ? 2.2 : 1)) return rel(0.5 + hasard() * 0.2);
    if (aSuivre === 0) return { type: 'parler' };
    // Faut-il suivre ? D'après la cote du pot
    if (eq >= cote + niv.marge) {
      // Énorme mise contre une main moyenne : prudence
      if (aSuivre > s.tapis * 0.6 && relatif < 1.05 && s.robot >= 3 && hasard() < 0.7) return abandon();
      return { type: 'suivre' };
    }
    if (hasard() < niv.suiveur && aSuivre <= gb * 4) return { type: 'suivre' };
    return abandon();
  }

  // ================== UTILE À L'ÉCRAN ==================
  // Joueurs de la main dans l'ordre, et ce qu'il reste à jouer
  function resumeMain(e) {
    var m = e.main;
    if (!m) return null;
    return { pot: pot(e), milieu: potAuMilieu(e), rue: ['Avant le flop', 'Flop', 'Tournant', 'Rivière'][m.rue] };
  }

  return {
    RANGS: RANGS, COULEURS: COULEURS, NOMS_COULEURS: NOMS_COULEURS, CATEGORIES: CATEGORIES, VARIANTES: VARIANTES, NIVEAUX: NIVEAUX, DUREES: DUREES,
    BLINDES_CASH: BLINDES_CASH, CAVE: CAVE,
    copie: copie, rang: rang, couleur: couleur, rouge: rouge, paquet: paquet, melanger: melanger, nomCarte: nomCarte, nomRang: nomRang, nomMain: nomMain,
    score: score, meilleureDe: meilleureDe, variante: variante,
    structure: structure, profondeur: profondeur, minutesNiveau: minutesNiveau, repartition: repartition, partage: partage,
    normaliserOptions: normaliserOptions, blindesCash: blindesCash, payante: payante, robotsPermis: robotsPermis,
    tempsJeu: tempsJeu, arreterHorloge: arreterHorloge, lancerHorloge: lancerHorloge, niveauA: niveauA, blindesDe: blindesDe, recavePossible: recavePossible,
    nouvelleTable: nouvelleTable, siege: siege, indexSiege: indexSiege, assis: assis, enLice: enLice, humains: humains, partants: partants,
    nouvelleMain: nouvelleMain, possibles: possibles, agir: agir, derouler: derouler, pots: pots, pot: pot, potAuMilieu: potAuMilieu, enCourse: enCourse,
    annulerMain: annulerMain, recaver: recaver, refuserRecave: refuserRecave, asseoir: asseoir, lever: lever, retirer: retirer, tempsEcoule: tempsEcoule, calculerGains: calculerGains,
    chen: chen, pourcentMain: pourcentMain, equite: equite, ordinateur: ordinateur, resumeMain: resumeMain
  };
})();

if (typeof module !== 'undefined') module.exports = PK;
