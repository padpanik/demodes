// ================== QUATRE EN LIGNE : RÈGLES ET ORDINATEUR ==================
// Grille de 7 colonnes sur 6 rangées ; on lâche un jeton dans une colonne, il tombe tout en bas.
// Le premier qui aligne 4 jetons (ligne, colonne ou diagonale) gagne. Version maison du classique.
// Utilisé par quatre.html ; testable avec Node (module.exports en bas).

var QL = (function () {
  var COLS = 7, RANGS = 6;
  // La grille est un tableau de 42 cases, rangée 0 en haut : case = rang * 7 + col ; 0 = vide, 1 ou 2 = joueur
  function nouvelle() { var g = []; for (var i = 0; i < COLS * RANGS; i++) g.push(0); return g; }
  function hauteurLibre(g, c) { for (var r = RANGS - 1; r >= 0; r--) if (!g[r * COLS + c]) return r; return -1; }
  function coups(g) { var r = []; for (var c = 0; c < COLS; c++) if (!g[c]) r.push(c); return r; }
  // Lâche un jeton : renvoie la case occupée (ou -1 si la colonne est pleine)
  function jouer(g, c, j) {
    var r = hauteurLibre(g, c);
    if (r < 0) return -1;
    g[r * COLS + c] = j;
    return r * COLS + c;
  }
  var DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
  // Quatre alignés passant par la case i ? Renvoie les cases gagnantes (4 ou plus) ou null
  function alignement(g, i) {
    var j = g[i];
    if (!j) return null;
    var r0 = Math.floor(i / COLS), c0 = i % COLS;
    for (var d = 0; d < 4; d++) {
      var dr = DIRS[d][0], dc = DIRS[d][1], cases = [i];
      for (var s = -1; s <= 1; s += 2) {
        var r = r0 + dr * s, c = c0 + dc * s;
        while (r >= 0 && r < RANGS && c >= 0 && c < COLS && g[r * COLS + c] === j) { cases.push(r * COLS + c); r += dr * s; c += dc * s; }
      }
      if (cases.length >= 4) return cases.sort((a, b) => a - b);
    }
    return null;
  }
  // Résultat de la partie : { gagnant: 1|2, ligne: [...] }, { gagnant: 0 } (grille pleine) ou null
  function resultat(g) {
    for (var i = 0; i < g.length; i++) { var l = alignement(g, i); if (l) return { gagnant: g[i], ligne: l }; }
    return coups(g).length ? null : { gagnant: 0, ligne: [] };
  }

  // ---------- Ordinateur ----------
  // Évaluation : chaque fenêtre de 4 cases encore jouable pour un seul camp rapporte selon son remplissage
  var FENETRES = [];
  (function () {
    for (var r = 0; r < RANGS; r++) for (var c = 0; c < COLS; c++) for (var d = 0; d < 4; d++) {
      var dr = DIRS[d][0], dc = DIRS[d][1], f = [];
      for (var k = 0; k < 4; k++) { var rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= RANGS || cc < 0 || cc >= COLS) { f = null; break; } f.push(rr * COLS + cc); }
      if (f) FENETRES.push(f);
    }
  })();
  var POIDS = [0, 1, 6, 40];
  function evaluer(g, moi) {
    var lui = 3 - moi, s = 0;
    for (var k = 0; k < FENETRES.length; k++) {
      var f = FENETRES[k], a = 0, b = 0;
      for (var x = 0; x < 4; x++) { var v = g[f[x]]; if (v === moi) a++; else if (v === lui) b++; }
      if (a && !b) s += POIDS[a]; else if (b && !a) s -= POIDS[b] * 1.2;
    }
    for (var r = 0; r < RANGS; r++) { var v2 = g[r * COLS + 3]; if (v2 === moi) s += 3; else if (v2 === lui) s -= 3; }   // le centre compte plus
    return s;
  }
  var ORDRE = [3, 2, 4, 1, 5, 0, 6];   // essayer le centre d'abord : l'élagage va beaucoup plus vite
  function minimax(g, prof, alpha, beta, joueur, moi, derniere) {
    if (derniere >= 0 && alignement(g, derniere)) return g[derniere] === moi ? 100000 + prof : -100000 - prof;
    var possibles = ORDRE.filter(c => !g[c]);
    if (!possibles.length) return 0;
    if (prof === 0) return evaluer(g, moi);
    var max = joueur === moi;
    var meilleur = max ? -Infinity : Infinity;
    for (var k = 0; k < possibles.length; k++) {
      var i = jouer(g, possibles[k], joueur);
      var v = minimax(g, prof - 1, alpha, beta, 3 - joueur, moi, i);
      g[i] = 0;
      if (max) { if (v > meilleur) meilleur = v; if (v > alpha) alpha = v; }
      else { if (v < meilleur) meilleur = v; if (v < beta) beta = v; }
      if (alpha >= beta) break;
    }
    return meilleur;
  }
  // Coup immédiatement gagnant pour j, s'il existe
  function coupGagnant(g, j) {
    var cs = coups(g);
    for (var k = 0; k < cs.length; k++) { var i = jouer(g, cs[k], j), ok = !!alignement(g, i); g[i] = 0; if (ok) return cs[k]; }
    return -1;
  }
  // Niveaux : facile (gagne ou bloque parfois, sinon au hasard), normal (réfléchit 4 coups), fort (8 coups)
  function choisirCoup(grille, moi, niveau) {
    var g = grille.slice(), cs = coups(g);
    if (!cs.length) return -1;
    if (niveau === 'facile') {
      var gagne = coupGagnant(g, moi); if (gagne >= 0 && Math.random() < 0.8) return gagne;
      var bloque = coupGagnant(g, 3 - moi); if (bloque >= 0 && Math.random() < 0.6) return bloque;
      return cs[Math.floor(Math.random() * cs.length)];
    }
    var prof = niveau === 'fort' ? 8 : 4;
    var meilleurs = [], meilleur = -Infinity;
    ORDRE.filter(c => !g[c]).forEach(c => {
      var i = jouer(g, c, moi);
      var v = minimax(g, prof - 1, -Infinity, Infinity, 3 - moi, moi, i);
      g[i] = 0;
      if (v > meilleur) { meilleur = v; meilleurs = [c]; } else if (v === meilleur) meilleurs.push(c);
    });
    // À égalité, un peu de hasard (sinon l'ordinateur joue toujours la même partie)
    return meilleurs[Math.floor(Math.random() * meilleurs.length)];
  }

  return { COLS: COLS, RANGS: RANGS, nouvelle: nouvelle, hauteurLibre: hauteurLibre, coups: coups, jouer: jouer,
           alignement: alignement, resultat: resultat, choisirCoup: choisirCoup, coupGagnant: coupGagnant };
})();

if (typeof module !== 'undefined') module.exports = QL;
