// ================== LETTRES CROISÉES : RÈGLES ==================
// Version maison du jeu de lettres sur grille (sans le nom ni les visuels de la marque).
// Utilisé par lettres.html ; testable avec Node (module.exports en bas).
//
// Plateau 15 × 15 avec cases bonus (lettre compte double / triple, mot compte double / triple), centre = mot compte double.
// 102 jetons (répartition et valeurs du jeu français, dont 2 jokers à 0 point). Chevalet de 7 lettres.
// On pose des lettres sur une seule ligne ou colonne, sans trou, en touchant ce qui est déjà posé (1er mot : sur le centre).
// Points : chaque mot formé (principal et croisés) ; les bonus ne comptent que pour les lettres posées ce tour-ci ;
// les 7 lettres d'un coup : +50. Fin : un joueur vide son chevalet quand le sac est vide (il gagne les points restant
// chez les autres, qui les perdent), ou tout le monde passe deux fois de suite (chacun perd ce qui lui reste).

var LC = (function () {
  var N = 15, CENTRE = 7 * N + 7;
  // Lettre : [nombre, valeur]
  var LETTRES = { A: [9, 1], B: [2, 3], C: [2, 3], D: [3, 2], E: [15, 1], F: [2, 4], G: [2, 2], H: [2, 4], I: [8, 1], J: [1, 8], K: [1, 10],
                  L: [5, 1], M: [3, 2], N: [6, 1], O: [6, 1], P: [2, 3], Q: [1, 8], R: [6, 1], S: [6, 1], T: [6, 1], U: [6, 1], V: [2, 4],
                  W: [1, 10], X: [1, 10], Y: [1, 10], Z: [1, 10], '?': [2, 0] };
  function valeur(l) { return (LETTRES[l] || [0, 0])[1]; }

  // ---------- Cases bonus (symétriques) ----------
  // MT : mot compte triple, MD : mot compte double, LT : lettre compte triple, LD : lettre compte double
  var BONUS = (function () {
    var b = new Array(N * N).fill('');
    function sym(r, c, t) { [[r, c], [c, r], [r, N - 1 - c], [N - 1 - c, r], [N - 1 - r, c], [c, N - 1 - r], [N - 1 - r, N - 1 - c], [N - 1 - c, N - 1 - r]].forEach(p => { b[p[0] * N + p[1]] = t; }); }
    [[0, 0], [0, 7]].forEach(p => sym(p[0], p[1], 'MT'));
    [[1, 1], [2, 2], [3, 3], [4, 4], [7, 7]].forEach(p => sym(p[0], p[1], 'MD'));
    [[1, 5], [5, 5]].forEach(p => sym(p[0], p[1], 'LT'));
    [[0, 3], [2, 6], [3, 7], [6, 6]].forEach(p => sym(p[0], p[1], 'LD'));
    return b;
  })();

  function melanger(l, hasard) {
    hasard = hasard || Math.random;
    for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(hasard() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; }
    return l;
  }
  function nouveauSac(hasard) {
    var s = [];
    Object.keys(LETTRES).forEach(l => { for (var k = 0; k < LETTRES[l][0]; k++) s.push(l); });
    return melanger(s, hasard);
  }
  function piocher(e, j) { var m = e.chevalets[j]; while (m.length < 7 && e.sac.length) m.push(e.sac.pop()); }

  // ---------- Partie ----------
  function nouvellePartie(joueurs, hasard) {
    var e = { joueurs: joueurs.slice(0, 4), scores: {}, chevalets: {}, sac: nouveauSac(hasard), plateau: new Array(N * N).fill(null),
              tour: 0, passes: 0, phase: 'jeu', verif: null, dernier: null, journal: [], nbCoups: 0, fin: null };
    e.joueurs.forEach(j => { e.scores[j] = 0; e.chevalets[j] = []; piocher(e, j); });
    e.tour = Math.floor((hasard || Math.random)() * e.joueurs.length);
    noter(e, e.joueurs[e.tour] + ' commence.');
    return e;
  }
  function noter(e, t) { e.journal.push(t); if (e.journal.length > 8) e.journal.shift(); }
  function joueurDuTour(e) { return e.joueurs[e.tour]; }

  // ---------- Analyse d'un coup ----------
  // poses : [{ i: rang dans le chevalet, c: case (0 à 224), l: lettre choisie pour un joker }]
  // Renvoie { erreur } ou { mots: [{ mot, cases, points }], points, bingo, lettres: [{ c, l, joker }] }
  function analyser(e, j, poses) {
    var chev = e.chevalets[j] || [], vus = {}, cases = {}, lettres = [];
    if (!poses || !poses.length) return { erreur: 'Pose au moins une lettre.' };
    for (var k = 0; k < poses.length; k++) {
      var p = poses[k], i = +p.i, c = +p.c;
      if (!(i >= 0 && i < chev.length) || vus[i]) return { erreur: 'Lettre invalide.' };
      if (!(c >= 0 && c < N * N) || e.plateau[c] || cases[c]) return { erreur: 'Case déjà occupée.' };
      vus[i] = true;
      var joker = chev[i] === '?', l = joker ? String(p.l || '').toUpperCase() : chev[i];
      if (!/^[A-Z]$/.test(l)) return { erreur: 'Choisis la lettre du joker.' };
      cases[c] = { l: l, joker: joker };
      lettres.push({ c: c, l: l, joker: joker });
    }
    var rs = lettres.map(x => Math.floor(x.c / N)), cs = lettres.map(x => x.c % N);
    var memeLigne = rs.every(r => r === rs[0]), memeColonne = cs.every(c => c === cs[0]);
    if (!memeLigne && !memeColonne) return { erreur: 'Les lettres doivent être sur une même ligne ou colonne.' };
    var lettreA = c => cases[c] ? cases[c].l : e.plateau[c] ? e.plateau[c].l : null;
    // Sans trou entre la première et la dernière lettre posée
    var horiz = memeLigne && (lettres.length > 1 || voisinHoriz(e, lettres[0].c));
    if (lettres.length === 1 && !horiz && !voisinVert(e, lettres[0].c) && !premierCoup(e)) return { erreur: 'Le mot doit toucher les lettres déjà posées.' };
    var pas = horiz ? 1 : N;
    var tri = lettres.map(x => x.c).sort((a, b) => a - b), deb = tri[0], fin = tri[tri.length - 1];
    for (var x = deb; x <= fin; x += pas) if (!lettreA(x)) return { erreur: 'Il ne doit pas y avoir de trou dans le mot.' };
    if (premierCoup(e)) {
      if (!cases[CENTRE]) return { erreur: 'Le premier mot doit passer par l\'étoile du centre.' };
      if (lettres.length < 2) return { erreur: 'Le premier mot a au moins deux lettres.' };
    } else if (!lettres.some(x => voisins(x.c).some(v => e.plateau[v]))) return { erreur: 'Le mot doit toucher les lettres déjà posées.' };
    // Mots formés : le mot principal, puis un mot croisé par lettre posée
    var mots = [];
    var principal = motPassantPar(e, cases, deb, horiz);
    if (principal.cases.length >= 2) mots.push(principal);
    lettres.forEach(x => { var m = motPassantPar(e, cases, x.c, !horiz); if (m.cases.length >= 2) mots.push(m); });
    if (!mots.length) return { erreur: 'Forme un mot d\'au moins deux lettres.' };
    var total = 0;
    mots.forEach(m => {
      var s = 0, mult = 1;
      m.cases.forEach(c => {
        var nouv = cases[c], v = nouv ? (nouv.joker ? 0 : valeur(nouv.l)) : (e.plateau[c].joker ? 0 : valeur(e.plateau[c].l));
        if (nouv) {
          var b = BONUS[c];
          if (b === 'LD') v *= 2; else if (b === 'LT') v *= 3; else if (b === 'MD') mult *= 2; else if (b === 'MT') mult *= 3;
        }
        s += v;
      });
      m.points = s * mult;
      total += m.points;
    });
    var bingo = lettres.length === 7;
    if (bingo) total += 50;
    return { mots: mots, points: total, bingo: bingo, lettres: lettres };
  }
  function premierCoup(e) { return !e.plateau.some(Boolean); }
  function voisins(c) {
    var r = Math.floor(c / N), col = c % N, l = [];
    if (r > 0) l.push(c - N); if (r < N - 1) l.push(c + N); if (col > 0) l.push(c - 1); if (col < N - 1) l.push(c + 1);
    return l;
  }
  function voisinHoriz(e, c) { var col = c % N; return (col > 0 && !!e.plateau[c - 1]) || (col < N - 1 && !!e.plateau[c + 1]); }
  function voisinVert(e, c) { return (c >= N && !!e.plateau[c - N]) || (c < N * (N - 1) && !!e.plateau[c + N]); }
  // Le mot (horizontal ou vertical) qui passe par la case c
  function motPassantPar(e, cases, c, horiz) {
    var pas = horiz ? 1 : N, plein = x => !!(cases[x] || e.plateau[x]);
    var debut = c;
    while (true) { var p = debut - pas; if (p < 0 || (horiz && Math.floor(p / N) !== Math.floor(c / N)) || !plein(p)) break; debut = p; }
    var l = [], x = debut;
    while (x < N * N && (!horiz || Math.floor(x / N) === Math.floor(c / N)) && plein(x)) { l.push(x); x += pas; }
    return { mot: l.map(y => cases[y] ? cases[y].l : e.plateau[y].l).join(''), cases: l };
  }

  // ---------- Jouer ----------
  // Pose acceptée (mots vérifiés) : les lettres vont sur le plateau, on pioche, au suivant
  function poser(e, j, poses) {
    if (e.phase !== 'jeu' && e.phase !== 'verif') return { erreur: 'La partie est finie.' };
    if (joueurDuTour(e) !== j) return { erreur: 'Ce n\'est pas ton tour.' };
    var a = analyser(e, j, poses);
    if (a.erreur) return a;
    a.lettres.forEach(x => { e.plateau[x.c] = { l: x.l, joker: x.joker, j: j }; });
    var rangs = poses.map(p => +p.i).sort((x, y) => y - x);
    rangs.forEach(i => e.chevalets[j].splice(i, 1));
    e.scores[j] += a.points;
    piocher(e, j);
    e.passes = 0;
    e.nbCoups++;
    e.dernier = { j: j, cases: a.lettres.map(x => x.c), mots: a.mots.map(m => m.mot), points: a.points, bingo: a.bingo };
    noter(e, j + ' joue ' + a.mots.map(m => m.mot).join(', ') + ' : +' + a.points + (a.bingo ? ' (dont +50 pour les 7 lettres !)' : '') + '.');
    e.phase = 'jeu'; e.verif = null;
    if (!e.chevalets[j].length && !e.sac.length) return finir(e, j), a;
    suivant(e);
    return a;
  }
  function passer(e, j) {
    if (e.phase !== 'jeu' || joueurDuTour(e) !== j) return { erreur: 'Ce n\'est pas ton tour.' };
    e.passes++;
    noter(e, j + ' passe.');
    if (e.passes >= 2 * e.joueurs.length) return finir(e, null), {};
    suivant(e);
    return {};
  }
  // Échanger des lettres (rangs dans le chevalet) : seulement s'il reste au moins 7 jetons dans le sac
  function echanger(e, j, rangs, hasard) {
    if (e.phase !== 'jeu' || joueurDuTour(e) !== j) return { erreur: 'Ce n\'est pas ton tour.' };
    if (e.sac.length < 7) return { erreur: 'Il faut au moins 7 lettres dans le sac pour échanger.' };
    rangs = (rangs || []).map(Number).filter((i, k, t) => i >= 0 && i < e.chevalets[j].length && t.indexOf(i) === k).sort((a, b) => b - a);
    if (!rangs.length) return { erreur: 'Choisis les lettres à échanger.' };
    var rendues = rangs.map(i => e.chevalets[j].splice(i, 1)[0]);
    piocher(e, j);
    e.sac = melanger(e.sac.concat(rendues), hasard);
    e.passes++;
    noter(e, j + ' échange ' + rendues.length + ' lettre' + (rendues.length > 1 ? 's' : '') + '.');
    if (e.passes >= 2 * e.joueurs.length) return finir(e, null), {};
    suivant(e);
    return {};
  }
  function suivant(e) { e.tour = (e.tour + 1) % e.joueurs.length; }
  function reste(e, j) { return (e.chevalets[j] || []).reduce((s, l) => s + valeur(l), 0); }
  function finir(e, gagnantFin) {
    var restes = {}, bonus = 0;
    e.joueurs.forEach(j => { restes[j] = reste(e, j); });
    e.joueurs.forEach(j => { if (j !== gagnantFin) { e.scores[j] -= restes[j]; bonus += restes[j]; } });
    if (gagnantFin) e.scores[gagnantFin] += bonus;
    var classement = e.joueurs.slice().sort((a, b) => e.scores[b] - e.scores[a]);
    var max = e.scores[classement[0]];
    e.fin = { gagnants: classement.filter(j => e.scores[j] === max), restes: restes, premierFini: gagnantFin };
    e.phase = 'fin';
    e.verif = null;
    noter(e, gagnantFin ? gagnantFin + ' a posé toutes ses lettres !' : 'Plus personne ne joue : fin de la partie.');
  }
  // Ce qu'un joueur a le droit de voir : son chevalet seulement (tous à la fin)
  function vuePour(e, j) {
    var v = JSON.parse(JSON.stringify(e));
    v.nbLettres = {};
    e.joueurs.forEach(x => { v.nbLettres[x] = e.chevalets[x].length; });
    if (e.phase !== 'fin') { v.chevalets = {}; if (e.chevalets[j]) v.chevalets[j] = e.chevalets[j].slice(); }
    v.nbSac = e.sac.length;
    v.sac = [];
    return v;
  }

  // ---------- Dictionnaire (liste « préfixe commun » de lettres-mots.txt) ----------
  function lireDictionnaire(texte) {
    var mots = new Set(), prec = '';
    texte.split('\n').forEach(ligne => {
      if (!ligne || ligne[0] === '#') return;
      var k = parseInt(ligne[0], 16), m = prec.slice(0, k) + ligne.slice(1);
      mots.add(m); prec = m;
    });
    return mots;
  }

  return { N: N, CENTRE: CENTRE, LETTRES: LETTRES, BONUS: BONUS, valeur: valeur, nouvellePartie: nouvellePartie, analyser: analyser,
           poser: poser, passer: passer, echanger: echanger, joueurDuTour: joueurDuTour, reste: reste, vuePour: vuePour, noter: noter,
           lireDictionnaire: lireDictionnaire, premierCoup: premierCoup };
})();

if (typeof module !== 'undefined') module.exports = LC;
