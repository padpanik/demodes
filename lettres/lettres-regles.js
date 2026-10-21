// ================== LETTRES CROISÉES : RÈGLES ==================
// Version maison du jeu de lettres sur grille (sans le nom ni les visuels de la marque).
// Utilisé par lettres/index.html ; testable avec Node (module.exports en bas).
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
    // Le dernier mot de chacun reste en évidence (dans sa couleur) : les cases du mot principal
    e.derniers = e.derniers || {};
    e.derniers[j] = { cases: a.mots[0].cases, n: e.nbCoups };
    action(e, j, { t: 'mot' });
    noter(e, j + ' joue ' + a.mots.map(m => m.mot).join(', ') + ' : +' + a.points + (a.bingo ? ' (dont +50 pour les 7 lettres !)' : '') + '.');
    e.phase = 'jeu'; e.verif = null;
    if (!e.chevalets[j].length && !e.sac.length) return finir(e, j), a;
    suivant(e);
    return a;
  }
  function passer(e, j) {
    if (e.phase !== 'jeu' || joueurDuTour(e) !== j) return { erreur: 'Ce n\'est pas ton tour.' };
    e.passes++;
    action(e, j, { t: 'passe' });
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
    action(e, j, { t: 'echange', n: rendues.length });
    noter(e, j + ' échange ' + rendues.length + ' lettre' + (rendues.length > 1 ? 's' : '') + '.');
    if (e.passes >= 2 * e.joueurs.length) return finir(e, null), {};
    suivant(e);
    return {};
  }
  // Ce que chacun a fait à son dernier tour (affiché sous son score) : mot posé, passe ou échange de n lettres
  function action(e, j, a) { e.actions = e.actions || {}; e.actions[j] = a; }
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
      var k = parseInt(ligne[0], 16), m = prec.slice(0, k) + ligne.slice(1).replace(/[0-9]$/, '');
      mots.add(m); prec = m;
    });
    return mots;
  }

  // ---------- Arbre des mots (pour l'ordinateur) ----------
  // Construit d'après la liste triée, dans des tableaux compacts (~590 000 nœuds, ~6 Mo) :
  // L = lettre (0 à 25), T = fin de mot, P = premier enfant, S = frère suivant (0 = aucun ; la racine est le nœud 0).
  function construireArbre(texte) {
    var lignes = texte.split('\n'), max = 1;
    lignes.forEach(l => { if (l && l[0] !== '#') max += l.length; });
    var L = new Uint8Array(max), T = new Uint8Array(max), P = new Int32Array(max), S = new Int32Array(max), D = new Int32Array(max);
    var n = 1, chemin = [0], prec = '';
    lignes.forEach(ligne => {
      if (!ligne || ligne[0] === '#') return;
      var k = parseInt(ligne[0], 16), m = prec.slice(0, k) + ligne.slice(1).replace(/[0-9]$/, '');
      // Liste triée : le mot reprend les k premiers nœuds du chemin précédent, puis on ajoute la suite
      chemin.length = k + 1;
      for (var i = k; i < m.length; i++) {
        var p = chemin[i], x = n++;
        L[x] = m.charCodeAt(i) - 65;
        if (D[p]) S[D[p]] = x; else P[p] = x;
        D[p] = x;
        chemin.push(x);
      }
      // T = 1 + fréquence (chiffre en fin de ligne : 3 très courant, 2 courant, 1 connu, rien = rare)
      var b = /[0-9]$/.test(ligne) ? +ligne[ligne.length - 1] : 0;
      T[chemin[m.length]] = 1 + b;
      prec = m;
    });
    return { L: L, T: T, P: P, S: S, n: n };
  }
  function enfant(a, n, c) { for (var k = a.P[n]; k; k = a.S[k]) { if (a.L[k] === c) return k; if (a.L[k] > c) return 0; } return 0; }
  function existe(a, mot) {
    var n = 0;
    for (var i = 0; i < mot.length; i++) { n = enfant(a, n, mot.charCodeAt(i) - 65); if (!n) return false; }
    return !!a.T[n];
  }

  // ---------- Tous les coups possibles (méthode des « ancres ») ----------
  // opts : { maxLong (longueur de mot maxi), jokers (false : l'ordinateur ne s'en sert pas) }
  // Renvoie [{ poses, points, mots, bingo }], sans doublon.
  function coupsPossibles(e, j, a, opts) {
    opts = opts || {};
    var maxLong = opts.maxLong || N, freq = 1 + (opts.frequence || 0), chev = e.chevalets[j] || [], cnt = new Array(26).fill(0), jokers = 0;
    chev.forEach(l => { if (l === '?') jokers++; else cnt[l.charCodeAt(0) - 65]++; });
    if (opts.jokers === false) jokers = 0;
    var occ = c => e.plateau[c] ? e.plateau[c].l.charCodeAt(0) - 65 : -1;
    var premier = premierCoup(e), vus = {}, res = [];
    [true, false].forEach(horiz => {
      for (var ligne = 0; ligne < N; ligne++) {
        var cel = k => horiz ? ligne * N + k : k * N + ligne;
        // Lettres permises sur chaque case vide (selon le mot qui se formerait en travers)
        var masque = [], ancre = [];
        for (var k = 0; k < N; k++) {
          var c = cel(k);
          if (occ(c) >= 0) { masque.push(0); ancre.push(false); continue; }
          var pas = horiz ? N : 1, haut = '', bas = '';
          for (var x = c - pas; x >= 0 && (horiz || Math.floor(x / N) === ligne) && e.plateau[x]; x -= pas) haut = e.plateau[x].l + haut;
          for (var y = c + pas; y < N * N && (horiz || Math.floor(y / N) === ligne) && e.plateau[y]; y += pas) bas += e.plateau[y].l;
          var m = 0x3ffffff;
          if (haut || bas) { m = 0; for (var l = 0; l < 26; l++) if (existe(a, haut + String.fromCharCode(65 + l) + bas)) m |= 1 << l; }
          masque.push(m);
          ancre.push(premier ? c === CENTRE : voisins(c).some(v => e.plateau[v]));
        }
        for (var an = 0; an < N; an++) {
          if (!ancre[an] || !masque[an]) continue;
          if (an > 0 && occ(cel(an - 1)) >= 0) {
            // Des lettres déjà posées à gauche de l'ancre : elles commencent le mot
            var deb = an, n = 0;
            while (deb > 0 && occ(cel(deb - 1)) >= 0) deb--;
            for (var q = deb; q < an && n >= 0; q++) { n = enfant(a, n, occ(cel(q))); if (!n) n = -1; }
            if (n > 0) etendre(n, an, an, deb, new Array(an - deb).fill(null));
          } else {
            var limite = 0;
            while (an - limite - 1 >= 0 && occ(cel(an - limite - 1)) < 0 && !ancre[an - limite - 1]) limite++;
            gauche(0, an, limite, []);
          }
        }
        function gauche(n, an, limite, part) {
          etendre(n, an, an, an - part.length, part);
          if (limite <= 0) return;
          for (var ch = a.P[n]; ch; ch = a.S[ch]) {
            var l = a.L[ch];
            if (cnt[l]) { cnt[l]--; part.push({ l: l, j: false }); gauche(ch, an, limite - 1, part); part.pop(); cnt[l]++; }
            if (jokers) { jokers--; part.push({ l: l, j: true }); gauche(ch, an, limite - 1, part); part.pop(); jokers++; }
          }
        }
        // part : lettres déjà choisies (posées de deb à k - 1, sauf les cases déjà occupées)
        function etendre(n, k, an, deb, part) {
          if (k - deb > maxLong) return;
          if (k >= N || occ(cel(k)) < 0) {
            if (a.T[n] >= freq && k > an) noter(deb, part);
            if (k >= N) return;
            var m = masque[k];
            for (var ch = a.P[n]; ch; ch = a.S[ch]) {
              var l = a.L[ch];
              if (!(m >> l & 1)) continue;
              if (cnt[l]) { cnt[l]--; part.push({ l: l, j: false }); etendre(ch, k + 1, an, deb, part); part.pop(); cnt[l]++; }
              if (jokers) { jokers--; part.push({ l: l, j: true }); etendre(ch, k + 1, an, deb, part); part.pop(); jokers++; }
            }
          } else {
            var f = enfant(a, n, occ(cel(k)));
            if (f) { part.push(null); etendre(f, k + 1, an, deb, part); part.pop(); }
          }
        }
        function noter(deb, part) {
          var poses = [], pris = {}, cle = [];
          for (var i = 0; i < part.length; i++) {
            var t = part[i];
            if (!t) continue;
            var c = cel(deb + i), lettre = String.fromCharCode(65 + t.l), r = -1;
            for (var z = 0; z < chev.length; z++) if (!pris[z] && (t.j ? chev[z] === '?' : chev[z] === lettre)) { r = z; break; }
            if (r < 0) return;
            pris[r] = true;
            poses.push(t.j ? { i: r, c: c, l: lettre } : { i: r, c: c });
            cle.push(c + (t.j ? '*' : '') + lettre);
          }
          if (!poses.length) return;
          cle = cle.sort().join(',');
          if (vus[cle]) return;
          vus[cle] = true;
          var an = analyser(e, j, poses);
          if (an.erreur || !an.mots.every(w => existe(a, w.mot))) return;
          res.push({ poses: poses, points: an.points, mots: an.mots.map(w => w.mot), bingo: an.bingo });
        }
      }
    });
    return res;
  }

  // ---------- L'ordinateur ----------
  // Trois niveaux : il connaît moins de mots (les plus courants, plus courts) et ne choisit pas toujours le meilleur coup.
  //   facile : mots très courants de 6 lettres au plus, pas de joker, un coup au hasard parmi la moitié la moins payante ;
  //   normal : mots courants de 8 lettres au plus, un coup « bon sans plus » (entre 55 % et 85 % du classement) ;
  //   fort   : tous les mots, le meilleur coup.
  // (Le mot principal suit ces limites ; les petits mots formés en travers peuvent être n'importe quel mot de la liste.)
  var NIVEAUX = { facile: { maxLong: 6, jokers: false, frequence: 3 }, normal: { maxLong: 8, frequence: 2 }, fort: {} };
  function ordinateur(e, j, a, niveau, hasard) {
    hasard = hasard || Math.random;
    niveau = NIVEAUX[niveau] ? niveau : 'normal';
    var l = coupsPossibles(e, j, a, NIVEAUX[niveau]).sort((x, y) => x.points - y.points), choix = null;
    if (l.length) {
      if (niveau === 'fort') { var best = l.filter(x => x.points === l[l.length - 1].points); choix = best[Math.floor(hasard() * best.length)]; }
      else {
        var de = niveau === 'facile' ? 0 : 0.55, a2 = niveau === 'facile' ? 0.5 : 0.85;
        var i0 = Math.floor(de * (l.length - 1)), i1 = Math.max(i0, Math.floor(a2 * (l.length - 1)));
        choix = l[i0 + Math.floor(hasard() * (i1 - i0 + 1))];
      }
      return { type: 'poser', poses: choix.poses };
    }
    // Rien à poser : il échange ses lettres difficiles (s'il peut), sinon il passe
    var chev = e.chevalets[j];
    if (e.sac.length >= 7) {
      var rangs = [];
      chev.forEach((x, i) => { if (x !== '?' && x !== 'E' && x !== 'S') rangs.push(i); });
      if (rangs.length) return { type: 'echanger', rangs: rangs };
    }
    return { type: 'passer' };
  }

  return { N: N, CENTRE: CENTRE, LETTRES: LETTRES, BONUS: BONUS, valeur: valeur, nouvellePartie: nouvellePartie, analyser: analyser,
           poser: poser, passer: passer, echanger: echanger, joueurDuTour: joueurDuTour, reste: reste, vuePour: vuePour, noter: noter,
           lireDictionnaire: lireDictionnaire, premierCoup: premierCoup, construireArbre: construireArbre, existe: existe,
           coupsPossibles: coupsPossibles, ordinateur: ordinateur, NIVEAUX: NIVEAUX };
})();

if (typeof module !== 'undefined') module.exports = LC;
