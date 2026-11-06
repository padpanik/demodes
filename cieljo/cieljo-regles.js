// ================== CIELJO : RÈGLES ET ORDINATEUR ==================
// Utilisé par cieljo/index.html ; testable avec Node (module.exports en bas).
//
// Jeu de cartes de 2 à 8 joueurs. 150 cartes : −2 (×5), −1 (×10), 0 (×15), 1 à 12 (×10 chacune).
// Chacun a une grille de 12 cartes cachées (3 lignes, 4 colonnes) et en retourne 2 ; le plus gros total commence.
// À son tour : prendre la défausse et l'échanger contre une carte de sa grille, ou piocher, puis soit échanger,
// soit jeter la carte piochée et retourner une carte cachée. Trois cartes visibles identiques dans une colonne : colonne défaussée.
// Quand un joueur n'a plus de carte cachée, les autres jouent encore un tour, puis on compte.
// Celui qui a fini double ses points s'ils sont positifs et qu'il n'est pas strictement le plus bas.
// La partie s'arrête quand un joueur atteint 100 points : le total le plus bas gagne.

var CJ = (function () {
  var LIMITE = 100, LIGNES = 3, COLONNES = 4, MOYENNE_CACHEE = 5;

  function paquet() {
    var l = [], ajouter = function (v, n) { for (var i = 0; i < n; i++) l.push(v); };
    ajouter(-2, 5);
    ajouter(-1, 10);
    ajouter(0, 15);
    for (var v = 1; v <= 12; v++) ajouter(v, 10);
    return l;
  }
  function melanger(l, hasard) {
    hasard = hasard || Math.random;
    for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(hasard() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; }
    return l;
  }
  function copie(o) { return JSON.parse(JSON.stringify(o)); }

  // Grille : 12 cases rangées ligne par ligne ; { v, vis }, ou null quand la colonne est partie
  function colonneDe(pos) { return pos % COLONNES; }
  function casesColonne(c) { var l = []; for (var i = 0; i < LIGNES; i++) l.push(i * COLONNES + c); return l; }
  function nbCachees(g) { return g.filter(function (x) { return x && !x.vis; }).length; }
  function nbVisibles(g) { return g.filter(function (x) { return x && x.vis; }).length; }
  function totalVisible(g) { return g.reduce(function (s, x) { return s + (x && x.vis ? x.v : 0); }, 0); }
  function total(g) { return g.reduce(function (s, x) { return s + (x ? x.v : 0); }, 0); }

  function journal(e, t) {
    e.journal.push(t);
    if (e.journal.length > 40) e.journal.shift();
  }

  // ---------- Début d'une partie, d'une manche ----------
  function nouvellePartie(joueurs, hasard) {
    var e = { joueurs: joueurs.slice(), scores: {}, manche: 0, phase: 'depart', journal: [], partieId: null, premier: null, vainqueurs: [] };
    joueurs.forEach(function (j) { e.scores[j] = 0; });
    distribuer(e, hasard);
    return e;
  }
  function distribuer(e, hasard) {
    var p = melanger(paquet(), hasard);
    e.manche++;
    e.phase = 'depart';
    e.etape = null;
    e.main = null;
    e.source = null;
    e.finisseur = null;
    e.resultat = null;
    e.dernier = null;
    e.grilles = {};
    e.tour = 0;
    e.joueurs.forEach(function (j) {
      e.grilles[j] = p.splice(0, LIGNES * COLONNES).map(function (v) { return { v: v, vis: false }; });
    });
    e.defausse = [p.pop()];
    e.pioche = p;
    journal(e, 'Manche ' + e.manche + ' : chacun retourne 2 cartes.');
  }
  function nouvelleManche(e, hasard) {
    if (e.phase !== 'finManche') return 'La manche n\'est pas finie.';
    distribuer(e, hasard);
    return null;
  }

  // Les 2 cartes sont retournées : le plus gros total commence (1re manche), ensuite celui qui a fini la manche d'avant
  function lancerSiPret(e) {
    if (e.phase !== 'depart') return;
    if (!e.joueurs.every(function (j) { return nbVisibles(e.grilles[j]) >= 2; })) return;
    var debut = 0;
    if (e.premier && e.joueurs.indexOf(e.premier) !== -1) debut = e.joueurs.indexOf(e.premier);
    else {
      var meilleur = -Infinity;
      e.joueurs.forEach(function (j, k) {
        var t = totalVisible(e.grilles[j]);
        if (t > meilleur) { meilleur = t; debut = k; }
      });
    }
    e.tour = debut;
    e.phase = 'jeu';
    e.etape = 'piocher';
    journal(e, e.joueurs[debut] + ' commence.');
  }

  // ---------- Colonnes identiques ----------
  // Rend les colonnes parties (le jeu les pose sur la défausse)
  function retirerColonnes(e, j) {
    var g = e.grilles[j], parties = [];
    for (var c = 0; c < COLONNES; c++) {
      var cases = casesColonne(c), a = g[cases[0]];
      if (!a || !a.vis) continue;
      if (cases.every(function (p) { return g[p] && g[p].vis && g[p].v === a.v; })) {
        cases.forEach(function (p) { e.defausse.push(g[p].v); g[p] = null; });
        parties.push({ c: c, v: a.v });
      }
    }
    return parties;
  }

  // ---------- Fin du tour, fin de manche ----------
  function finDeTour(e, j) {
    e.main = null;
    e.source = null;
    if (!e.finisseur && nbCachees(e.grilles[j]) === 0) {
      e.finisseur = j;
      journal(e, j + ' n\'a plus de carte cachée : dernier tour pour les autres.');
    }
    var suivant = (e.tour + 1) % e.joueurs.length;
    if (e.finisseur && e.joueurs[suivant] === e.finisseur) return finManche(e);
    e.tour = suivant;
    e.etape = 'piocher';
  }
  function finManche(e) {
    var details = {}, bas = Infinity, nbBas = 0;
    e.joueurs.forEach(function (j) {
      e.grilles[j].forEach(function (x) { if (x) x.vis = true; });   // les cartes encore cachées sont montrées
      retirerColonnes(e, j);   // livret : une colonne identique révélée à ce moment-là part aussi, avant le calcul
      var t = total(e.grilles[j]);
      details[j] = { points: t, brut: t, double: false };
      if (t < bas) { bas = t; nbBas = 1; } else if (t === bas) nbBas++;
    });
    var f = details[e.finisseur];
    if (f.brut > 0 && !(f.brut === bas && nbBas === 1)) { f.points = f.brut * 2; f.double = true; }
    e.joueurs.forEach(function (j) { e.scores[j] += details[j].points; });
    e.resultat = { details: details, finisseur: e.finisseur };
    e.premier = e.finisseur;
    e.etape = null;
    var fini = e.joueurs.some(function (j) { return e.scores[j] >= LIMITE; });
    if (fini) {
      var min = Math.min.apply(null, e.joueurs.map(function (j) { return e.scores[j]; }));
      e.vainqueurs = e.joueurs.filter(function (j) { return e.scores[j] === min; });
      e.phase = 'finPartie';
      journal(e, e.vainqueurs.join(' et ') + ' gagne' + (e.vainqueurs.length > 1 ? 'nt' : '') + ' la partie.');
    } else e.phase = 'finManche';
  }

  // Tirer une carte, en remélangeant la défausse (sauf son dessus) si la pioche est vide
  function tirer(e, hasard) {
    if (!e.pioche.length) {
      var haut = e.defausse.pop();
      e.pioche = melanger(e.defausse, hasard);
      e.defausse = [haut];
    }
    return e.pioche.pop();
  }

  // ---------- Appliquer une action (null si tout va bien, sinon le message d'erreur) ----------
  function appliquer(e, j, a, hasard) {
    if (!a || e.joueurs.indexOf(j) === -1) return 'Action impossible.';
    var g = e.grilles[j];
    if (e.phase === 'depart') {
      if (a.type !== 'retourner') return 'Retourne d\'abord 2 cartes.';
      if (nbVisibles(g) >= 2) return 'Tu as déjà retourné 2 cartes.';
      if (!g[a.pos] || g[a.pos].vis) return 'Choisis une carte cachée.';
      g[a.pos].vis = true;
      lancerSiPret(e);
      return null;
    }
    if (e.phase !== 'jeu') return 'La manche est finie.';
    if (e.joueurs[e.tour] !== j) return 'Ce n\'est pas ton tour.';
    if (e.etape === 'piocher') {
      if (a.type !== 'piocher') return 'Prends d\'abord une carte.';
      if (a.source === 'defausse') {
        if (!e.defausse.length) return 'La défausse est vide.';
        e.main = e.defausse.pop();
        e.source = 'defausse';
      } else if (a.source === 'pioche') {
        e.main = tirer(e, hasard);
        e.source = 'pioche';
      } else return 'Action impossible.';
      e.etape = 'placer';
      e.dernier = { j: j, source: e.source, carte: e.source === 'defausse' ? e.main : null };
      return null;
    }
    if (e.etape === 'placer') {
      if (a.type === 'placer') {
        var x = g[a.pos];
        if (!x) return 'Cette case est vide.';
        var ancienne = x.v, etaitCachee = !x.vis;
        g[a.pos] = { v: e.main, vis: true };
        e.defausse.push(ancienne);
        var parties = retirerColonnes(e, j);
        e.dernier = { j: j, source: e.source, place: e.main, jete: ancienne, cachee: etaitCachee, colonnes: parties };
        finDeTour(e, j);
        return null;
      }
      if (a.type === 'jeter') {
        if (e.source !== 'pioche') return 'La carte prise à la défausse doit aller dans ta grille.';
        e.defausse.push(e.main);
        e.dernier = { j: j, source: 'pioche', jete: e.main };
        e.main = null;
        e.etape = 'retourner';
        return null;
      }
      return 'Place ta carte.';
    }
    if (e.etape === 'retourner') {
      if (a.type !== 'retourner') return 'Retourne une carte cachée.';
      if (!g[a.pos] || g[a.pos].vis) return 'Choisis une carte cachée.';
      g[a.pos].vis = true;
      var col = retirerColonnes(e, j);
      e.dernier.retournee = g[a.pos] ? g[a.pos].v : (col.length ? col[0].v : null);
      e.dernier.colonnes = col;
      finDeTour(e, j);
      return null;
    }
    return 'Action impossible.';
  }

  // ---------- Ce que voit un téléphone : aucune carte cachée ni l'ordre de la pioche ----------
  function vuePour(e) {
    var v = copie(e);
    Object.keys(v.grilles).forEach(function (j) {
      v.grilles[j] = v.grilles[j].map(function (x) { return x ? (x.vis ? x : { vis: false }) : null; });
    });
    v.nbPioche = e.pioche.length;
    v.nbDefausse = e.defausse.length;
    v.haut = e.defausse.length ? e.defausse[e.defausse.length - 1] : null;
    delete v.pioche;
    delete v.defausse;
    return v;
  }

  // ---------- Ordinateur : il ne regarde que ce qu'un joueur voit ----------
  function valeurCase(x) { return x.vis ? x.v : MOYENNE_CACHEE; }
  // Ce que rapporte le fait de poser la carte c en pos (en points gagnés, estimation)
  function gainPose(g, pos, c) {
    var x = g[pos], gain = valeurCase(x) - c, cases = casesColonne(colonneDe(pos));
    var autres = cases.filter(function (p) { return p !== pos; });
    var memes = autres.filter(function (p) { return g[p] && g[p].vis && g[p].v === c; }).length;
    if (memes === 2) gain += 2 * c + 8;                  // colonne complète : tout part
    else if (memes === 1 && c > 0) gain += 1 + c / 3;    // une paire qui promet
    if (!x.vis) gain += 0.5;                             // retourner une cachée fait avancer
    return gain;
  }
  // Finir la manche sans être sûr d'être le plus bas coûte le double
  function finiraitMal(e, j, pos, c) {
    var g = e.grilles[j];
    if (nbCachees(g) !== 1 || !g[pos] || g[pos].vis) return false;
    var score = 0;
    g.forEach(function (x, p) { if (x) score += p === pos ? c : valeurCase(x); });
    if (score <= 0) return false;
    return e.joueurs.some(function (a) {
      if (a === j) return false;
      var t = 0;
      e.grilles[a].forEach(function (x) { if (x) t += x.vis ? x.v : 2; });   // on prête aux autres des cartes cachées plutôt faibles
      return t <= score;
    });
  }
  function meilleurePose(e, j, c) {
    var g = e.grilles[j], meilleur = null, gainMax = -Infinity;
    g.forEach(function (x, p) {
      if (!x) return;
      var gain = gainPose(g, p, c) + Math.random() * 0.2;
      if (finiraitMal(e, j, p, c)) gain -= 25;
      if (gain > gainMax) { gainMax = gain; meilleur = p; }
    });
    return { pos: meilleur, gain: gainMax };
  }
  function ordinateur(e, j) {
    var g = e.grilles[j], cachees = [];
    g.forEach(function (x, p) { if (x && !x.vis) cachees.push(p); });
    var auHasard = function (l) { return l[Math.floor(Math.random() * l.length)]; };
    if (e.phase === 'depart') return { type: 'retourner', pos: auHasard(cachees) };
    if (e.etape === 'piocher') {
      var haut = e.defausse.length ? e.defausse[e.defausse.length - 1] : null;
      if (haut !== null && (haut <= 2 || meilleurePose(e, j, haut).gain >= 4)) return { type: 'piocher', source: 'defausse' };
      return { type: 'piocher', source: 'pioche' };
    }
    if (e.etape === 'placer') {
      var m = meilleurePose(e, j, e.main);
      var finForcee = cachees.length === 1 && finiraitMal(e, j, cachees[0], MOYENNE_CACHEE);   // jeter obligerait à retourner sa dernière carte
      if (e.source === 'pioche' && m.gain < 1.5 && cachees.length && !finForcee) return { type: 'jeter' };
      return { type: 'placer', pos: m.pos };
    }
    // Retourner : de préférence dans une colonne qui a déjà une paire, sinon au hasard
    var utiles = cachees.filter(function (p) {
      var a = casesColonne(colonneDe(p)).filter(function (q) { return q !== p && g[q] && g[q].vis; });
      return a.length === 2 && g[a[0]].v === g[a[1]].v;
    });
    return { type: 'retourner', pos: auHasard(utiles.length ? utiles : cachees) };
  }

  return {
    LIMITE: LIMITE, LIGNES: LIGNES, COLONNES: COLONNES,
    paquet: paquet, nouvellePartie: nouvellePartie, nouvelleManche: nouvelleManche, appliquer: appliquer, vuePour: vuePour, ordinateur: ordinateur,
    nbCachees: nbCachees, nbVisibles: nbVisibles, totalVisible: totalVisible, total: total, retirerColonnes: retirerColonnes
  };
})();

if (typeof module !== 'undefined') module.exports = CJ;
