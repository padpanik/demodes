// ================== BATAILLE NAVALE : MOTEUR DE RÈGLES ET ORDINATEUR ==================
// Utilisé par bataille/index.html ; testable avec Node (module.exports en bas).
// Mer de 10 × 10 : case i = ligne * 10 + colonne (lignes 1 à 10, colonnes A à J).
// Une flotte est un tableau de 5 navires { pos, h } dans l'ordre de FLOTTE :
// pos = case de la proue (la plus en haut / à gauche), h = horizontal.

var BN = (function () {
  var FLOTTE = [
    { id: 0, nom: 'Porte-avions', t: 5 },
    { id: 1, nom: 'Croiseur', t: 4 },
    { id: 2, nom: 'Contre-torpilleur', t: 3 },
    { id: 3, nom: 'Sous-marin', t: 3 },
    { id: 4, nom: 'Torpilleur', t: 2 }
  ];
  var LETTRES = 'ABCDEFGHIJ';

  function nomCase(i) { return LETTRES[i % 10] + (Math.floor(i / 10) + 1); }
  function autre(c) { return c === 'A' ? 'B' : 'A'; }
  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; }
    return t;
  }
  // Cases d'un navire (null s'il sort de la mer)
  function cases(pos, h, t) {
    var l = Math.floor(pos / 10), k = pos % 10, r = [];
    if (pos < 0 || pos > 99) return null;
    if (h ? k + t > 10 : l + t > 10) return null;
    for (var s = 0; s < t; s++) r.push(h ? pos + s : pos + s * 10);
    return r;
  }
  // Les 8 voisines d'une case
  function voisines(i) {
    var l = Math.floor(i / 10), k = i % 10, r = [];
    for (var dl = -1; dl <= 1; dl++) for (var dk = -1; dk <= 1; dk++) {
      if (!dl && !dk) continue;
      var a = l + dl, b = k + dk;
      if (a >= 0 && a < 10 && b >= 0 && b < 10) r.push(a * 10 + b);
    }
    return r;
  }
  function casesNavire(flotte, id) { var n = flotte[id]; return n ? cases(n.pos, n.h, FLOTTE[id].t) : null; }

  // Une flotte est-elle réglementaire ? (colles : navires autorisés à se toucher)
  // Renvoie null si oui, sinon le motif du refus.
  function erreurFlotte(flotte, colles) {
    if (!Array.isArray(flotte) || flotte.length !== FLOTTE.length) return 'flotte incomplète';
    var occ = {};
    for (var id = 0; id < FLOTTE.length; id++) {
      var n = flotte[id];
      if (!n || typeof n.pos !== 'number' || n.pos % 1) return 'navire mal placé';
      var cs = cases(n.pos, !!n.h, FLOTTE[id].t);
      if (!cs) return FLOTTE[id].nom + ' hors de la mer';
      for (var s = 0; s < cs.length; s++) {
        if (occ[cs[s]] !== undefined) return 'navires superposés';
        if (!colles && voisines(cs[s]).some(v => occ[v] !== undefined)) return 'navires qui se touchent';
      }
      cs.forEach(x => { occ[x] = id; });
    }
    return null;
  }
  // Placement libre : liste des problèmes entre navires posés (pour les montrer quand on valide)
  // Renvoie [{ a, b, type: 'chevauche' | 'touche' }]
  function conflits(flotte, colles) {
    var cs = flotte.map((n, id) => n ? cases(n.pos, !!n.h, FLOTTE[id].t) : null), r = [];
    for (var a = 0; a < cs.length; a++) for (var b = a + 1; b < cs.length; b++) {
      if (!cs[a] || !cs[b]) continue;
      if (cs[a].some(x => cs[b].indexOf(x) !== -1)) r.push({ a: a, b: b, type: 'chevauche' });
      else if (!colles && cs[a].some(x => voisines(x).some(v => cs[b].indexOf(v) !== -1))) r.push({ a: a, b: b, type: 'touche' });
    }
    return r;
  }
  // Le navire « id » peut-il aller en (pos, h) sans gêner les autres navires déjà posés ?
  function placeLibre(flotte, id, pos, h, colles) {
    var cs = cases(pos, h, FLOTTE[id].t);
    if (!cs) return false;
    var occ = {};
    flotte.forEach((n, k) => { if (n && k !== id) cases(n.pos, n.h, FLOTTE[k].t).forEach(x => { occ[x] = true; }); });
    return cs.every(x => !occ[x] && (colles || !voisines(x).some(v => occ[v])));
  }
  // Flotte au hasard (complète, ou seulement les navires manquants si « base » est fournie)
  function flotteAleatoire(colles, base) {
    for (var essai = 0; essai < 200; essai++) {
      var f = base ? base.map(n => n ? { pos: n.pos, h: n.h } : null) : [null, null, null, null, null];
      var ok = true;
      for (var id = 0; id < FLOTTE.length && ok; id++) {
        if (f[id]) continue;
        var options = [];
        for (var p = 0; p < 100; p++) [true, false].forEach(h => { if (placeLibre(f, id, p, h, colles)) options.push({ pos: p, h: h }); });
        if (!options.length) { ok = false; break; }
        f[id] = options[Math.floor(Math.random() * options.length)];
      }
      if (ok) return f;
      if (base) base = null; // impossible de compléter : on repart de zéro
    }
    return null;
  }

  // Résultat d'un tir en i sur « flotte », sachant les tirs déjà reçus (liste de cases)
  function tirer(flotte, recus, i) {
    for (var id = 0; id < FLOTTE.length; id++) {
      var cs = casesNavire(flotte, id);
      if (cs.indexOf(i) === -1) continue;
      var coule = cs.every(x => x === i || recus.indexOf(x) !== -1);
      return coule ? { res: 'coule', nav: id, cells: cs } : { res: 'touche' };
    }
    return { res: 'eau' };
  }

  // ---------- Partie (solo, ou vérification à deux) ----------
  // journal : [{ c (tireur), i, res, nav?, cells? }]
  function nouvellePartie(flotteA, flotteB, colles, rejouer) {
    return { colles: !!colles, rejouer: !!rejouer, flottes: { A: flotteA, B: flotteB }, journal: [], tour: 'A', n: 0, fin: null };
  }
  function recusPar(journal, c) { return journal.filter(j => j.c !== c).map(j => j.i); }
  function dejaTire(journal, c, i) { return journal.some(j => j.c === c && j.i === i); }
  function coulesContre(journal, c) { return journal.filter(j => j.c !== c && j.res === 'coule').length; }
  // Joue le tir de « tour » en i (partie solo). Renvoie l'entrée du journal.
  function jouer(e, i) {
    var c = e.tour, adv = autre(c);
    var r = tirer(e.flottes[adv], recusPar(e.journal, adv), i);
    var j = Object.assign({ c: c, i: i }, r);
    e.journal.push(j);
    e.n++;
    if (coulesContre(e.journal, adv) === FLOTTE.length) e.fin = { gagnant: c, raison: 'flotte' };
    else if (r.res === 'eau' || !e.rejouer) e.tour = adv;   // option « rejouer » : on garde la main tant qu'on touche
    return j;
  }

  // Grille vue par le tireur c : null (inconnue), 'e' (eau), 't' (touché), 'c' (coulé)
  function grilleTirs(journal, c) {
    var g = new Array(100).fill(null);
    journal.forEach(j => {
      if (j.c !== c) return;
      g[j.i] = j.res === 'eau' ? 'e' : 't';
      if (j.res === 'coule') j.cells.forEach(x => { g[x] = 'c'; });
    });
    return g;
  }
  // Tailles des navires adverses pas encore coulés (vu par le tireur c)
  function restants(journal, c) {
    var coules = journal.filter(j => j.c === c && j.res === 'coule').map(j => j.nav);
    return FLOTTE.filter(n => coules.indexOf(n.id) === -1).map(n => n.t);
  }

  // ---------- Ordinateur ----------
  // Il ne voit que ses propres tirs. Pour chaque case, il compte les façons de placer les navires
  // restants qui la couvrent ; s'il a des touchés en cours, il ne garde que les placements qui les prolongent.
  // niveau : 'facile' (cherche au hasard), 'normal' (un peu de hasard), 'fort' (toujours la case la plus probable)
  function choisirTir(grille, tailles, colles, niveau) {
    var interdit = grille.map(x => x === 'e' || x === 'c');
    if (!colles) grille.forEach((x, i) => { if (x === 'c') voisines(i).forEach(v => { if (grille[v] === null) interdit[v] = true; }); });
    var touches = [];
    grille.forEach((x, i) => { if (x === 't') touches.push(i); });
    var score = new Array(100).fill(0);
    tailles.forEach(t => {
      for (var p = 0; p < 100; p++) [true, false].forEach(h => {
        var cs = cases(p, h, t);
        if (!cs || cs.some(x => interdit[x])) return;
        var n = cs.filter(x => grille[x] === 't').length;
        if (touches.length && !n) return;
        var poids = touches.length ? n * n * 10 : 1;
        cs.forEach(x => { if (grille[x] === null) score[x] += poids; });
      });
    });
    var max = Math.max.apply(null, score);
    var libres = [];
    grille.forEach((x, i) => { if (x === null && !interdit[i]) libres.push(i); });
    if (max <= 0) {
      if (!libres.length) grille.forEach((x, i) => { if (x === null) libres.push(i); });
      return libres[Math.floor(Math.random() * libres.length)];
    }
    // En poursuite (touché en cours) : toujours la meilleure case. En chasse : selon le niveau.
    if (!touches.length && niveau === 'facile') return libres[Math.floor(Math.random() * libres.length)];
    var seuil = touches.length || niveau === 'fort' ? max : max * 0.5;
    var choix = [];
    score.forEach((s, i) => { if (s >= seuil && grille[i] === null) choix.push(i); });
    return choix[Math.floor(Math.random() * choix.length)];
  }

  // ---------- Vérification à deux (fin de partie) ----------
  // La flotte dévoilée doit être réglementaire et expliquer toutes les réponses données à ses tirs reçus.
  function verifierReponses(flotte, journal, c, colles) {
    var err = erreurFlotte(flotte, colles);
    if (err) return 'flotte non réglementaire (' + err + ')';
    var recus = [];
    for (var k = 0; k < journal.length; k++) {
      var j = journal[k];
      if (j.c === c) continue;
      var r = tirer(flotte, recus, j.i);
      recus.push(j.i);
      if (r.res !== j.res || (r.res === 'coule' && r.nav !== j.nav)) return 'réponse fausse au tir en ' + nomCase(j.i);
    }
    return null;
  }

  return { FLOTTE: FLOTTE, LETTRES: LETTRES, nomCase: nomCase, autre: autre, melanger: melanger, cases: cases, voisines: voisines,
           casesNavire: casesNavire, erreurFlotte: erreurFlotte, conflits: conflits, placeLibre: placeLibre, flotteAleatoire: flotteAleatoire,
           tirer: tirer, nouvellePartie: nouvellePartie, recusPar: recusPar, dejaTire: dejaTire, coulesContre: coulesContre,
           jouer: jouer, grilleTirs: grilleTirs, restants: restants, choisirTir: choisirTir, verifierReponses: verifierReponses };
})();

if (typeof module !== 'undefined') module.exports = BN;
