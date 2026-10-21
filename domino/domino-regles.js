// ================== DOMINOS ET TRIOMINOS : RÈGLES ET ORDINATEUR ==================
// Utilisé par domino/index.html ; testable avec Node (module.exports en bas).
//
// Dominos (jeu « à la pioche », double-six, 28 pièces) : 7 dominos chacun à deux, 6 à trois ou quatre.
//   On pose un domino à un bout de la chaîne si le chiffre correspond. Sinon on pioche jusqu'à pouvoir jouer,
//   puis on passe quand la pioche est vide. Le premier qui n'a plus de dominos marque les points des mains adverses ;
//   si plus personne ne peut jouer, celui qui a le moins de points en main marque ceux des autres. Partie en 100 points.
// Triominos (56 pièces triangulaires, chiffres de 0 à 5 dans les coins) : 9 pièces chacun à deux, 7 à trois ou quatre.
//   Une pièce se pose contre au moins un côté déjà posé, et tous les coins qui se touchent doivent porter le même chiffre.
//   On marque la somme des trois chiffres ; +50 pour chaque hexagone complété ; première pièce triple : +10 (0-0-0 : +40).
//   Sans coup possible : on pioche (−5 par pièce, 3 au plus), puis on passe (−10). Fin de manche : +25 et les points
//   des mains adverses. Partie en 400 points.

var DM = (function () {
  // ---------- Pièces ----------
  function dominos() { var l = []; for (var a = 0; a <= 6; a++) for (var b = a; b <= 6; b++) l.push([a, b]); return l; }
  // Triominos : chiffres croissants dans le sens des aiguilles d'une montre (on peut tourner la pièce, pas la retourner)
  function triominos() { var l = []; for (var a = 0; a <= 5; a++) for (var b = a; b <= 5; b++) for (var c = b; c <= 5; c++) l.push([a, b, c]); return l; }
  function somme(t) { return t.reduce((s, x) => s + x, 0); }
  function melanger(l, hasard) {
    hasard = hasard || Math.random;
    for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(hasard() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; }
    return l;
  }
  function copie(o) { return JSON.parse(JSON.stringify(o)); }

  // ---------- Géométrie des triominos ----------
  // Réseau triangulaire : sommet (x, y). Triangle « u » (x, y) : sommets (x,y), (x+1,y), (x,y+1) ;
  // triangle « d » (x, y) : sommets (x+1,y), (x,y+1), (x+1,y+1). À l'écran : X = x + y/2, Y = −y·√3/2.
  var H = Math.sqrt(3) / 2;
  function cle(x, y, o) { return x + ',' + y + ',' + o; }
  function lire(k) { var p = k.split(','); return { x: +p[0], y: +p[1], o: p[2] }; }
  function ecran(v) { return { X: v[0] + v[1] / 2, Y: -v[1] * H }; }
  // Sommets d'un triangle, dans le sens des aiguilles d'une montre à l'écran
  function sommets(k) {
    var t = lire(k), x = t.x, y = t.y;
    var s = t.o === 'u' ? [[x, y], [x + 1, y], [x, y + 1]] : [[x + 1, y], [x, y + 1], [x + 1, y + 1]];
    var c = s.map(ecran), cx = (c[0].X + c[1].X + c[2].X) / 3, cy = (c[0].Y + c[1].Y + c[2].Y) / 3;
    return s.map((v, i) => ({ v: v, a: Math.atan2(c[i].Y - cy, c[i].X - cx) })).sort((p, q) => p.a - q.a).map(p => p.v);
  }
  function voisins(k) {
    var t = lire(k), x = t.x, y = t.y;
    return t.o === 'u' ? [cle(x, y - 1, 'd'), cle(x, y, 'd'), cle(x - 1, y, 'd')] : [cle(x, y, 'u'), cle(x, y + 1, 'u'), cle(x + 1, y, 'u')];
  }
  // Les six triangles autour d'un sommet (pour les hexagones)
  function autour(v) {
    var x = v[0], y = v[1];
    return [cle(x, y, 'u'), cle(x - 1, y, 'u'), cle(x, y - 1, 'u'), cle(x - 1, y, 'd'), cle(x, y - 1, 'd'), cle(x - 1, y - 1, 'd')];
  }
  function vk(v) { return v[0] + ',' + v[1]; }

  // ---------- Partie ----------
  function nouvellePartie(jeu, joueurs, options) {
    options = options || {};
    var e = { jeu: jeu === 'triomino' ? 'triomino' : 'domino', joueurs: joueurs.slice(0, 4), scores: {}, manche: 0,
              but: options.but || (jeu === 'triomino' ? 400 : 100), phase: 'jeu', dernierGagnant: null, vainqueur: null };
    e.joueurs.forEach(j => { e.scores[j] = 0; });
    nouvelleManche(e, options.hasard);
    return e;
  }
  function nouvelleManche(e, hasard) {
    var tri = e.jeu === 'triomino', n = e.joueurs.length;
    var pieces = melanger(tri ? triominos() : dominos(), hasard), parJoueur = tri ? (n === 2 ? 9 : 7) : (n === 2 ? 7 : 6);
    e.mains = {};
    e.joueurs.forEach(j => { e.mains[j] = pieces.splice(0, parJoueur); });
    e.pioche = pieces;
    e.chaine = [];                 // dominos : de gauche à droite, chaque pièce orientée [gauche, droite]
    e.cases = {};                  // triominos : « x,y,o » → { t: pièce, v: chiffres sur les sommets (sens horaire) }
    e.sommets = {};                // triominos : « x,y » → chiffre
    e.manche++;
    e.phase = 'jeu';
    e.passes = 0;
    e.pioches = 0;                 // triominos : pièces piochées pendant ce tour
    e.resultat = null;
    e.dernier = null;
    e.journal = [];
    // Qui commence : le gagnant de la manche précédente, sinon le plus fort double (ou triple), sinon la plus forte pièce
    var premier = e.dernierGagnant && e.joueurs.indexOf(e.dernierGagnant) !== -1 ? e.dernierGagnant : null;
    if (!premier) {
      var meilleur = -1;
      e.joueurs.forEach(j => e.mains[j].forEach(t => {
        var double = t.every(x => x === t[0]), v = (double ? 100 : 0) + somme(t);
        if (v > meilleur) { meilleur = v; premier = j; }
      }));
    }
    e.tour = e.joueurs.indexOf(premier);
    noter(e, 'Manche ' + e.manche + ' : ' + premier + ' commence.');
    return e;
  }
  function noter(e, texte) { e.journal.push(texte); if (e.journal.length > 6) e.journal.shift(); }
  function joueurDuTour(e) { return e.joueurs[e.tour]; }

  // ---------- Coups possibles ----------
  // Dominos : { i: rang dans la main, cote: 'g' | 'd' } ; triominos : { i, k: case, r: rotation (0 à 2) }
  function coups(e, j) {
    var main = e.mains[j] || [], l = [];
    if (e.jeu === 'domino') {
      if (!e.chaine.length) return main.map((t, i) => ({ i: i, cote: 'd' }));
      var g = e.chaine[0][0], d = e.chaine[e.chaine.length - 1][1];
      main.forEach((t, i) => {
        if (t[0] === g || t[1] === g) l.push({ i: i, cote: 'g' });
        if ((t[0] === d || t[1] === d) && g !== d) l.push({ i: i, cote: 'd' });   // deux bouts identiques : un seul choix
      });
      return l;
    }
    var places = Object.keys(e.cases);
    if (!places.length) return main.map((t, i) => ({ i: i, k: cle(0, 0, 'u'), r: 0 }));
    var libres = {};
    places.forEach(k => voisins(k).forEach(v => { if (!e.cases[v]) libres[v] = true; }));
    Object.keys(libres).forEach(k => {
      var sm = sommets(k);
      main.forEach((t, i) => {
        var vues = {};
        for (var r = 0; r < 3; r++) {
          var v = [t[r % 3], t[(r + 1) % 3], t[(r + 2) % 3]], sig = v.join('');
          if (vues[sig]) continue;            // pièce symétrique : même placement
          vues[sig] = true;
          if (sm.every((s, n) => e.sommets[vk(s)] === undefined || e.sommets[vk(s)] === v[n])) l.push({ i: i, k: k, r: r });
        }
      });
    });
    return l;
  }
  function peutJouer(e, j) { return coups(e, j).length > 0; }
  function peutPiocher(e, j) {
    if (e.phase !== 'jeu' || joueurDuTour(e) !== j || !e.pioche.length || peutJouer(e, j)) return false;
    return e.jeu === 'domino' || e.pioches < 3;
  }
  function peutPasser(e, j) {
    if (e.phase !== 'jeu' || joueurDuTour(e) !== j || peutJouer(e, j)) return false;
    return !e.pioche.length || (e.jeu === 'triomino' && e.pioches >= 3);
  }
  // Valeurs posées par un coup de triomino (sens horaire)
  function valeursTri(t, r) { return [t[r % 3], t[(r + 1) % 3], t[(r + 2) % 3]]; }

  // ---------- Jouer ----------
  // Renvoie un message d'erreur, ou null si le coup est joué
  function jouer(e, j, coup) {
    if (e.phase !== 'jeu') return 'La manche est finie.';
    if (joueurDuTour(e) !== j) return 'Ce n\'est pas ton tour.';
    var possibles = coups(e, j);
    var ok = possibles.some(c => c.i === coup.i && (e.jeu === 'domino' ? c.cote === coup.cote : c.k === coup.k && c.r === coup.r));
    if (!ok) return 'Ce coup n\'est pas possible.';
    var t = e.mains[j].splice(coup.i, 1)[0], gain = 0, bonus = '';
    if (e.jeu === 'domino') {
      if (!e.chaine.length) e.chaine.push(t.slice());
      else if (coup.cote === 'g') { var g = e.chaine[0][0]; e.chaine.unshift(t[1] === g ? [t[0], t[1]] : [t[1], t[0]]); }
      else { var d = e.chaine[e.chaine.length - 1][1]; e.chaine.push(t[0] === d ? [t[0], t[1]] : [t[1], t[0]]); }
      e.dernier = { cote: coup.cote, t: t };
      noter(e, j + ' pose ' + t[0] + '|' + t[1] + '.');
    } else {
      var premiere = !Object.keys(e.cases).length, v = valeursTri(t, coup.r), sm = sommets(coup.k);
      e.cases[coup.k] = { t: t, v: v };
      sm.forEach((s, n) => { e.sommets[vk(s)] = v[n]; });
      gain = somme(t);
      if (premiere && t[0] === t[1] && t[1] === t[2]) { var b = t[0] === 0 ? 40 : 10; gain += b; bonus = ' (triple +' + b + ')'; }
      // Hexagones complétés autour des trois sommets de la pièce
      var hexa = sm.filter(s => autour(s).every(k => e.cases[k])).length;
      if (hexa) { gain += 50 * hexa; bonus += ' (hexagone +' + (50 * hexa) + ')'; }
      e.scores[j] += gain;
      e.dernier = { k: coup.k, gain: gain };
      noter(e, j + ' pose ' + t.join('-') + ' : +' + gain + bonus + '.');
    }
    e.passes = 0;
    e.pioches = 0;
    if (!e.mains[j].length) return finManche(e, j, false), null;
    suivant(e);
    return null;
  }
  function piocher(e, j) {
    if (!peutPiocher(e, j)) return 'Tu ne peux pas piocher maintenant.';
    e.mains[j].push(e.pioche.pop());
    e.pioches++;
    if (e.jeu === 'triomino') { e.scores[j] -= 5; noter(e, j + ' pioche (−5).'); }
    else noter(e, j + ' pioche.');
    return null;
  }
  function passer(e, j) {
    if (!peutPasser(e, j)) return 'Tu ne peux pas passer.';
    if (e.jeu === 'triomino') { e.scores[j] -= 10; noter(e, j + ' passe (−10).'); }
    else noter(e, j + ' passe.');
    e.passes++;
    e.pioches = 0;
    // Partie bloquée : plus de pioche et tout le monde a passé à la suite
    if (!e.pioche.length && e.passes >= e.joueurs.length) return finManche(e, null, true), null;
    suivant(e);
    return null;
  }
  function suivant(e) { e.tour = (e.tour + 1) % e.joueurs.length; }
  function pointsMain(e, j) { return (e.mains[j] || []).reduce((s, t) => s + somme(t), 0); }
  function finManche(e, gagnant, bloque) {
    var detail = {};
    e.joueurs.forEach(j => { detail[j] = pointsMain(e, j); });
    if (bloque) {
      // Le moins chargé gagne (en cas d'égalité, le premier dans l'ordre du tour)
      gagnant = e.joueurs.slice().sort((a, b) => detail[a] - detail[b])[0];
    }
    var autres = e.joueurs.filter(j => j !== gagnant).reduce((s, j) => s + detail[j], 0);
    var points = e.jeu === 'triomino' ? (bloque ? autres - detail[gagnant] : 25 + autres) : autres;
    e.scores[gagnant] += points;
    e.dernierGagnant = gagnant;
    e.resultat = { gagnant: gagnant, points: points, bloque: !!bloque, detail: detail };
    noter(e, gagnant + (bloque ? ' gagne la manche bloquée' : ' a posé sa dernière pièce') + ' : +' + points + '.');
    var meilleur = e.joueurs.slice().sort((a, b) => e.scores[b] - e.scores[a])[0];
    if (e.scores[meilleur] >= e.but) { e.phase = 'finPartie'; e.vainqueur = meilleur; }
    else e.phase = 'finManche';
  }

  // ---------- Ordinateur ----------
  // Dominos : pose la pièce la plus lourde (les doubles d'abord). Triominos : le coup qui rapporte le plus.
  function ordinateur(e, j) {
    var l = coups(e, j);
    if (l.length) {
      var main = e.mains[j], meilleur = null, note = -Infinity;
      l.forEach(c => {
        var t = main[c.i], n;
        if (e.jeu === 'domino') n = somme(t) + (t[0] === t[1] ? 6 : 0) + Math.random() * 0.5;
        else {
          var essai = copie({ cases: e.cases, sommets: e.sommets }), sm = sommets(c.k), v = valeursTri(t, c.r);
          essai.cases[c.k] = 1;
          n = somme(t) + 50 * sm.filter(s => autour(s).every(k => essai.cases[k])).length + Math.random() * 0.5;
        }
        if (n > note) { note = n; meilleur = c; }
      });
      return { type: 'jouer', coup: meilleur };
    }
    if (peutPiocher(e, j)) return { type: 'piocher' };
    return { type: 'passer' };
  }
  function appliquer(e, j, action) {
    if (action.type === 'jouer') return jouer(e, j, action.coup);
    if (action.type === 'piocher') return piocher(e, j);
    if (action.type === 'passer') return passer(e, j);
    return 'Action inconnue.';
  }
  // Ce qu'un joueur a le droit de voir : sa main seulement (toutes les mains une fois la manche finie)
  function vuePour(e, j) {
    var v = copie(e), cache = e.phase === 'jeu';
    v.nbMains = {};
    e.joueurs.forEach(x => { v.nbMains[x] = e.mains[x].length; });
    if (cache) { v.mains = {}; if (e.mains[j]) v.mains[j] = copie(e.mains[j]); }
    v.nbPioche = e.pioche.length;
    v.pioche = e.pioche.map(() => 0);   // on garde le nombre (pour savoir si l'on peut piocher), pas les pièces
    return v;
  }

  return { dominos: dominos, triominos: triominos, somme: somme, nouvellePartie: nouvellePartie, nouvelleManche: nouvelleManche,
           coups: coups, peutJouer: peutJouer, peutPiocher: peutPiocher, peutPasser: peutPasser, jouer: jouer, piocher: piocher,
           passer: passer, appliquer: appliquer, ordinateur: ordinateur, joueurDuTour: joueurDuTour, pointsMain: pointsMain,
           vuePour: vuePour, sommets: sommets, voisins: voisins, autour: autour, lire: lire, cle: cle, ecran: ecran, valeursTri: valeursTri, H: H };
})();

if (typeof module !== 'undefined') module.exports = DM;
