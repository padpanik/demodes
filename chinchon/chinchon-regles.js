// ================== CHINCHÓN : RÈGLES ET ORDINATEUR ==================
// Utilisé par chinchon/index.html ; testable avec Node (module.exports en bas).
//
// Jeu de cartes espagnol, de 2 à 4 joueurs. Options : 40 ou 48 cartes, avec ou sans 2 jokers.
// 7 cartes chacun. À son tour : on prend la carte du dessus de la pioche ou de la défausse, puis on en jette une.
// Combinaisons : 3 ou 4 cartes de même valeur, ou au moins 3 cartes qui se suivent dans la même couleur.
// Après avoir jeté, on peut fermer s'il reste au plus 3 points hors combinaisons. Les autres posent ce qu'ils peuvent
// sur les combinaisons de celui qui ferme, puis chacun marque les points de ses cartes seules.
// Fermer sans carte seule : −10. Chinchón (7 cartes qui se suivent, même couleur, sans joker) : partie gagnée aussitôt.
// Au-delà de 100 points, on est éliminé ; le dernier en jeu gagne.

var CC = (function () {
  var COULEURS = ['o', 'c', 'e', 'b'];                                // oros, copas, espadas, bastos
  var NOMS_COULEURS = { o: 'Deniers', c: 'Coupes', e: 'Épées', b: 'Bâtons' };
  var NOMS_FIGURES = { 10: 'Valet', 11: 'Cavalier', 12: 'Roi' };
  var SEUIL_FERMER = 3, BONUS_FERMER = -10, LIMITE = 100, POINTS_JOKER = 25, MAX_REMELANGES = 3;

  function normaliserOptions(o) {
    o = o || {};
    return { cartes: o.cartes === 48 ? 48 : 40, jokers: o.jokers === 2 ? 2 : 0 };
  }
  function ordreRangs(cartes) { return cartes === 48 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]; }
  function estJoker(c) { return c.charAt(0) === 'J'; }
  function couleur(c) { return c.charAt(0); }
  function rang(c) { return estJoker(c) ? 0 : parseInt(c.slice(1), 10); }
  function points(c) { return estJoker(c) ? POINTS_JOKER : Math.min(rang(c), 10); }
  function nomCarte(c) {
    if (estJoker(c)) return 'Joker';
    var r = rang(c);
    return (NOMS_FIGURES[r] || r) + ' de ' + NOMS_COULEURS[couleur(c)].toLowerCase();
  }
  function paquet(opts) {
    var l = [];
    COULEURS.forEach(function (s) { ordreRangs(opts.cartes).forEach(function (r) { l.push(s + r); }); });
    for (var i = 1; i <= opts.jokers; i++) l.push('J' + i);
    return l;
  }
  function melanger(l, hasard) {
    hasard = hasard || Math.random;
    for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(hasard() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; }
    return l;
  }
  function copie(o) { return JSON.parse(JSON.stringify(o)); }

  // ---------- Combinaisons possibles dans une main ----------
  function candidats(main, ordre) {
    var liste = [], jokers = [];
    main.forEach(function (c, i) { if (estJoker(c)) jokers.push(i); });
    var choixJokers = function (n) {
      if (n === 0) return [[]];
      if (n > jokers.length) return [];
      if (n === 1) return jokers.map(function (j) { return [j]; });
      return [[jokers[0], jokers[1]]];
    };
    // Même valeur : au moins 2 vraies cartes, 3 ou 4 cartes en tout
    ordre.forEach(function (r) {
      var vraies = [];
      main.forEach(function (c, i) { if (rang(c) === r) vraies.push(i); });
      if (vraies.length < 2) return;
      for (var m = 1; m < (1 << vraies.length); m++) {
        var pris = vraies.filter(function (_, k) { return m & (1 << k); });
        if (pris.length < 2) continue;
        for (var nj = 0; nj <= jokers.length && pris.length + nj <= 4; nj++) {
          if (pris.length + nj < 3) continue;
          choixJokers(nj).forEach(function (js) {
            var idx = pris.concat(js);
            liste.push({ type: 'groupe', rang: r, idx: idx, mask: idx.reduce(function (a, i) { return a | (1 << i); }, 0) });
          });
        }
      }
    });
    // Suite de même couleur : au moins 2 vraies cartes, un joker remplace une carte de son choix
    COULEURS.forEach(function (s) {
      var parPos = {};
      main.forEach(function (c, i) { if (!estJoker(c) && couleur(c) === s) parPos[ordre.indexOf(rang(c))] = i; });
      for (var a = 0; a + 2 < ordre.length; a++) {
        for (var b = a + 2; b < ordre.length; b++) {
          var chercher = function (pos, idx, libres, vraies) {
            if (pos > b) {
              if (vraies < 2) return;
              liste.push({ type: 'suite', couleur: s, a: a, b: b, idx: idx.slice(), mask: idx.reduce(function (m, i) { return m | (1 << i); }, 0) });
              return;
            }
            if (parPos[pos] !== undefined) { idx.push(parPos[pos]); chercher(pos + 1, idx, libres, vraies + 1); idx.pop(); }
            libres.forEach(function (j, k) {
              idx.push(j);
              chercher(pos + 1, idx, libres.filter(function (_, n) { return n !== k; }), vraies);
              idx.pop();
            });
          };
          chercher(a, [], jokers.slice(), 0);
        }
      }
    });
    return liste;
  }
  function combiPublique(c, main) {
    return { type: c.type, rang: c.rang, couleur: c.couleur, a: c.a, b: c.b, cartes: c.idx.map(function (i) { return main[i]; }) };
  }
  // Toutes les façons de ranger la main : rappel(combis, seules)
  function parcourir(main, ordre, rappel) {
    var cs = candidats(main, ordre), n = main.length;
    var aller = function (mask, combis, seules) {
      var i = 0;
      while (i < n && (mask & (1 << i))) i++;
      if (i === n) return rappel(combis, seules);
      seules.push(i);
      aller(mask | (1 << i), combis, seules);
      seules.pop();
      cs.forEach(function (c) {
        if ((c.mask & (1 << i)) && !(c.mask & mask)) { combis.push(c); aller(mask | c.mask, combis, seules); combis.pop(); }
      });
    };
    aller(0, [], []);
  }
  // Le meilleur rangement : le moins de points hors combinaisons
  function meilleure(main, ordre) {
    var cs = candidats(main, ordre), n = main.length, meilleurPts = Infinity, garde = null;
    var aller = function (mask, combis, seules, pts) {
      if (pts >= meilleurPts) return;
      var i = 0;
      while (i < n && (mask & (1 << i))) i++;
      if (i === n) { meilleurPts = pts; garde = { combis: combis.slice(), seules: seules.slice() }; return; }
      cs.forEach(function (c) {
        if ((c.mask & (1 << i)) && !(c.mask & mask)) { combis.push(c); aller(mask | c.mask, combis, seules, pts); combis.pop(); }
      });
      seules.push(i);
      aller(mask | (1 << i), combis, seules, pts + points(main[i]));
      seules.pop();
    };
    aller(0, [], [], 0);
    return { points: meilleurPts, combis: garde.combis.map(function (c) { return combiPublique(c, main); }), seules: garde.seules.map(function (i) { return main[i]; }) };
  }
  function estChinchon(main, ordre) {
    if (main.length !== 7 || main.some(estJoker)) return false;
    if (main.some(function (c) { return couleur(c) !== couleur(main[0]); })) return false;
    var pos = main.map(function (c) { return ordre.indexOf(rang(c)); }).sort(function (x, y) { return x - y; });
    return pos[6] - pos[0] === 6;
  }

  // ---------- Fin de manche : poser sur les combinaisons de celui qui ferme ----------
  function vaSur(m, c, ordre) {
    if (m.type === 'groupe') return m.n < 4 && (estJoker(c) || rang(c) === m.rang);
    if (estJoker(c)) return m.a > 0 || m.b < ordre.length - 1;
    if (couleur(c) !== m.couleur) return false;
    var p = ordre.indexOf(rang(c));
    return p === m.a - 1 || p === m.b + 1;
  }
  function poserSur(m, c, ordre) {
    if (m.type === 'groupe') { m.n++; return; }
    if (estJoker(c)) { if (m.b < ordre.length - 1) m.b++; else m.a--; return; }
    var p = ordre.indexOf(rang(c));
    if (p === m.a - 1) m.a = p; else m.b = p;
  }
  function placer(seules, combisFermeur, ordre) {
    var melds = combisFermeur.map(function (m) { return { type: m.type, rang: m.rang, couleur: m.couleur, a: m.a, b: m.b, n: m.cartes.length }; });
    var reste = seules.slice().sort(function (x, y) { return (estJoker(x) ? -1 : points(y)) - (estJoker(y) ? -1 : points(x)); }), posees = [], encore = true;
    while (encore) {
      encore = false;
      for (var i = 0; i < reste.length; i++) {
        var cible = melds.find(function (m) { return vaSur(m, reste[i], ordre); });
        if (cible) { poserSur(cible, reste[i], ordre); posees.push(reste[i]); reste.splice(i, 1); encore = true; break; }
      }
    }
    return { reste: reste, posees: posees };
  }
  function bilanAutre(main, combisFermeur, ordre) {
    var meilleur = null;
    parcourir(main, ordre, function (combis, seules) {
      var ids = seules.map(function (i) { return main[i]; }), p = placer(ids, combisFermeur, ordre);
      var pts = p.reste.reduce(function (s, c) { return s + points(c); }, 0);
      if (!meilleur || pts < meilleur.points) meilleur = { points: pts, combis: combis.map(function (c) { return combiPublique(c, main); }), seules: p.reste, posees: p.posees };
    });
    return meilleur;
  }

  // ---------- Partie ----------
  function nouvellePartie(joueurs, options, hasard) {
    var e = { joueurs: joueurs.slice(), scores: {}, elimines: [], opts: normaliserOptions(options), manche: 0, donneur: Math.floor((hasard || Math.random)() * joueurs.length),
              phase: 'jeu', vainqueur: null, resultat: null, journal: [], dernier: null, n: 0 };
    joueurs.forEach(function (j) { e.scores[j] = 0; });
    distribuer(e, hasard);
    return e;
  }
  function enJeu(e, j) { return e.elimines.indexOf(j) === -1; }
  function suivant(e, k) {
    var n = e.joueurs.length;
    for (var i = 1; i <= n; i++) { var x = (k + i) % n; if (enJeu(e, e.joueurs[x])) return x; }
    return k;
  }
  function distribuer(e, hasard) {
    e.manche++;
    e.pioche = melanger(paquet(e.opts), hasard);
    e.mains = {};
    e.joueurs.forEach(function (j) { e.mains[j] = []; });
    for (var k = 0; k < 7; k++) e.joueurs.forEach(function (j) { if (enJeu(e, j)) e.mains[j].push(e.pioche.pop()); });
    e.defausse = [e.pioche.pop()];
    e.tour = suivant(e, e.donneur);
    e.etape = 'piocher';
    e.pris = null;
    e.remelanges = 0;
    e.resultat = null;
    e.dernier = null;
    e.phase = 'jeu';
    e.n++;
    noter(e, 'Manche ' + e.manche + ' : à ' + e.joueurs[e.tour] + ' de commencer.');
  }
  function noter(e, m) { e.journal.push(m); if (e.journal.length > 30) e.journal.splice(0, e.journal.length - 30); }
  function nouvelleManche(e, hasard) {
    if (e.phase !== 'finManche') return 'La manche n\'est pas finie.';
    e.donneur = suivant(e, e.donneur);
    distribuer(e, hasard);
    return null;
  }
  function peutFermer(e, j, carte) {
    var m = e.mains[j];
    if (!m || m.length !== 8 || m.indexOf(carte) === -1) return false;
    var reste = m.filter(function (c) { return c !== carte; }), ordre = ordreRangs(e.opts.cartes);
    return estChinchon(reste, ordre) || meilleure(reste, ordre).points <= SEUIL_FERMER;
  }
  function appliquer(e, j, action, hasard) {
    if (e.phase !== 'jeu') return 'La manche est finie.';
    if (e.joueurs[e.tour] !== j) return 'Ce n\'est pas ton tour.';
    if (!action) return 'Action inconnue.';
    if (action.type === 'piocher') {
      if (e.etape !== 'piocher') return 'Tu as déjà pris une carte.';
      var c;
      if (action.source === 'defausse') {
        if (!e.defausse.length) return 'La défausse est vide.';
        c = e.defausse.pop();
        e.pris = c;
        e.dernier = { j: j, source: 'defausse', carte: c };
      } else {
        if (!e.pioche.length) {
          if (e.remelanges >= MAX_REMELANGES) return finNulle(e);
          // Pioche vide : la défausse, sauf sa carte du dessus, est mélangée
          var haut = e.defausse.pop();
          e.pioche = melanger(e.defausse, hasard);
          e.defausse = haut ? [haut] : [];
          e.remelanges++;
          noter(e, 'Pioche vide : la défausse est remélangée.');
          if (!e.pioche.length) return finNulle(e);
        }
        c = e.pioche.pop();
        e.pris = null;
        e.dernier = { j: j, source: 'pioche' };
      }
      e.mains[j].push(c);
      e.etape = 'jeter';
      e.n++;
      return null;
    }
    if (action.type === 'jeter') {
      if (e.etape !== 'jeter') return 'Prends d\'abord une carte.';
      var m = e.mains[j], i = m.indexOf(action.carte);
      if (i === -1) return 'Cette carte n\'est pas dans ta main.';
      if (action.carte === e.pris) return 'Tu ne peux pas rejeter la carte que tu viens de prendre à la défausse.';
      if (action.fermer && !peutFermer(e, j, action.carte)) return 'Il te reste plus de 3 points hors combinaisons.';
      m.splice(i, 1);
      e.defausse.push(action.carte);
      e.pris = null;
      e.dernier = Object.assign({}, e.dernier, { jete: action.carte, fermer: !!action.fermer });
      e.n++;
      if (action.fermer) return fermer(e, j);
      e.tour = suivant(e, e.tour);
      e.etape = 'piocher';
      return null;
    }
    return 'Action inconnue.';
  }
  function finNulle(e) {
    e.phase = 'finManche';
    e.resultat = { nulle: true, details: {} };
    noter(e, 'Personne ne ferme : manche nulle, on redistribue.');
    e.n++;
    return null;
  }
  function fermer(e, j) {
    var ordre = ordreRangs(e.opts.cartes), main = e.mains[j], chinchon = estChinchon(main, ordre), m = meilleure(main, ordre);
    var details = {};
    details[j] = { points: chinchon ? 0 : (m.seules.length ? m.points : BONUS_FERMER), combis: m.combis, seules: m.seules, posees: [] };
    e.joueurs.forEach(function (x) {
      if (x === j || !enJeu(e, x)) return;
      details[x] = bilanAutre(e.mains[x], m.combis, ordre);
    });
    Object.keys(details).forEach(function (x) { e.scores[x] += details[x].points; });
    e.resultat = { fermeur: j, chinchon: chinchon, details: details };
    e.joueurs.forEach(function (x) { if (enJeu(e, x) && e.scores[x] > LIMITE) { e.elimines.push(x); noter(e, x + ' dépasse ' + LIMITE + ' points : éliminé.'); } });
    var restants = e.joueurs.filter(function (x) { return enJeu(e, x); });
    noter(e, chinchon ? j + ' réussit un chinchón !' : j + ' ferme la manche.');
    if (chinchon) { e.vainqueur = j; e.phase = 'finPartie'; return null; }
    if (restants.length <= 1) {
      e.vainqueur = restants[0] || e.joueurs.slice().sort(function (a, b) { return e.scores[a] - e.scores[b]; })[0];
      e.phase = 'finPartie';
      return null;
    }
    e.phase = 'finManche';
    return null;
  }

  // ---------- Ce que voit chaque joueur ----------
  function vuePour(e, moi) {
    var v = { joueurs: e.joueurs, scores: e.scores, elimines: e.elimines, opts: e.opts, manche: e.manche, tour: e.tour, etape: e.etape, phase: e.phase, vainqueur: e.vainqueur,
              resultat: e.resultat, journal: e.journal.slice(-4), dernier: e.dernier, n: e.n, pris: e.joueurs[e.tour] === moi ? e.pris : null,
              nbPioche: e.pioche.length, nbDefausse: e.defausse.length, haut: e.defausse[e.defausse.length - 1] || null, nbMains: {}, mains: {} };
    e.joueurs.forEach(function (j) { v.nbMains[j] = e.mains[j].length; });
    v.mains[moi] = (e.mains[moi] || []).slice();
    return v;
  }

  // ---------- Ordinateur : il ne regarde que sa main et le dessus de la défausse ----------
  function estimation(main, ordre) {
    var m = meilleure(main, ordre), s = 0;
    m.seules.forEach(function (c) {
      if (estJoker(c)) return;
      var r = rang(c), p = ordre.indexOf(r), proche = main.some(function (x) {
        if (x === c || estJoker(x)) return false;
        return rang(x) === r || (couleur(x) === couleur(c) && Math.abs(ordre.indexOf(rang(x)) - p) <= 2);
      });
      s += points(c) * (proche ? 0.55 : 1);
    });
    return s - m.combis.reduce(function (t, co) { return t + co.cartes.length; }, 0) * 0.5;
  }
  function meilleurRejet(main, ordre, interdite) {
    var mieux = null;
    main.forEach(function (c) {
      if (c === interdite) return;
      var v = estimation(main.filter(function (x) { return x !== c; }), ordre);
      if (estJoker(c)) v += 30;
      if (!mieux || v < mieux.v) mieux = { c: c, v: v };
    });
    return mieux;
  }
  function ordinateur(e, j) {
    var ordre = ordreRangs(e.opts.cartes), main = e.mains[j];
    if (e.etape === 'piocher') {
      var haut = e.defausse[e.defausse.length - 1];
      if (haut) {
        if (estJoker(haut)) return { type: 'piocher', source: 'defausse' };
        var avant = estimation(main, ordre), apres = meilleurRejet(main.concat([haut]), ordre, haut);
        if (apres && apres.v < avant - 2) return { type: 'piocher', source: 'defausse' };
      }
      return { type: 'piocher', source: 'pioche' };
    }
    var ferme = null;
    main.forEach(function (c) {
      if (c === e.pris) return;
      var reste = main.filter(function (x) { return x !== c; });
      var pts = estChinchon(reste, ordre) ? -100 : meilleure(reste, ordre).points;
      if (pts <= SEUIL_FERMER && (!ferme || pts < ferme.pts)) ferme = { c: c, pts: pts };
    });
    if (ferme) return { type: 'jeter', carte: ferme.c, fermer: true };
    return { type: 'jeter', carte: meilleurRejet(main, ordre, e.pris).c };
  }

  return { COULEURS: COULEURS, NOMS_COULEURS: NOMS_COULEURS, NOMS_FIGURES: NOMS_FIGURES, SEUIL_FERMER: SEUIL_FERMER, LIMITE: LIMITE, normaliserOptions: normaliserOptions, ordreRangs: ordreRangs,
           estJoker: estJoker, couleur: couleur, rang: rang, points: points, nomCarte: nomCarte, paquet: paquet, meilleure: meilleure, estChinchon: estChinchon, bilanAutre: bilanAutre,
           nouvellePartie: nouvellePartie, nouvelleManche: nouvelleManche, enJeu: enJeu, peutFermer: peutFermer, appliquer: appliquer, vuePour: vuePour, ordinateur: ordinateur, copie: copie };
})();

if (typeof module !== 'undefined') module.exports = CC;
