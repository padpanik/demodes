// ================== BACKGAMMON : RÈGLES ==================
// Moteur sans affichage, utilisé par backgammon.html (et par l'hôte pour arbitrer).
//
// Plateau : flèches 1 à 24. pts[i] > 0 : pions de A (blanc), pts[i] < 0 : pions de B (noir).
// A avance de 24 vers 1 (son jan intérieur : 1 à 6) ; B avance de 1 vers 24 (jan intérieur : 19 à 24).
// Un coup : { from: 1..24 | 'bar', to: 1..24 | 'off', d: valeur du dé utilisé }.

const BG = {
  autre: function(c) { return c === 'A' ? 'B' : 'A'; },
  signe: function(c) { return c === 'A' ? 1 : -1; },
  // Nombre de pions de la couleur c sur la flèche i
  sur: function(pl, c, i) { var v = pl.pts[i] * this.signe(c); return v > 0 ? v : 0; },

  depart: function() {
    var pts = new Array(25).fill(0);
    pts[24] = 2; pts[13] = 5; pts[8] = 3; pts[6] = 5;        // A
    pts[1] = -2; pts[12] = -5; pts[17] = -3; pts[19] = -5;   // B
    return { pts: pts, bar: { A: 0, B: 0 }, off: { A: 0, B: 0 } };
  },
  copie: function(pl) { return { pts: pl.pts.slice(), bar: { A: pl.bar.A, B: pl.bar.B }, off: { A: pl.off.A, B: pl.off.B } }; },

  // Tous les pions sont-ils dans le jan intérieur (condition pour sortir) ?
  aLaMaison: function(pl, c) {
    if (pl.bar[c]) return false;
    for (var i = 1; i <= 24; i++) {
      if (this.sur(pl, c, i) && (c === 'A' ? i > 6 : i < 19)) return false;
    }
    return true;
  },
  // Flèche fermée : au moins 2 pions adverses
  ferme: function(pl, c, t) { return this.sur(pl, this.autre(c), t) >= 2; },

  // Coups possibles avec un seul dé (sans tenir compte de l'obligation de jouer les deux dés)
  coupsDe: function(pl, c, d) {
    var res = [];
    if (pl.bar[c]) {
      var e = c === 'A' ? 25 - d : d;
      if (!this.ferme(pl, c, e)) res.push({ from: 'bar', to: e, d: d });
      return res; // tant qu'un pion est sur la barre, on ne joue que lui
    }
    var maison = this.aLaMaison(pl, c);
    for (var i = 1; i <= 24; i++) {
      if (!this.sur(pl, c, i)) continue;
      var t = c === 'A' ? i - d : i + d;
      if (t >= 1 && t <= 24) {
        if (!this.ferme(pl, c, t)) res.push({ from: i, to: t, d: d });
      } else if (maison) {
        // Sortie : avec le dé exact, ou avec un dé plus fort si aucun pion n'est plus loin
        var exact = c === 'A' ? t === 0 : t === 25, plusLoin = false;
        if (!exact) {
          if (c === 'A') { for (var k = i + 1; k <= 6; k++) if (this.sur(pl, c, k)) plusLoin = true; }
          else { for (var k2 = 19; k2 < i; k2++) if (this.sur(pl, c, k2)) plusLoin = true; }
        }
        if (exact || !plusLoin) res.push({ from: i, to: 'off', d: d });
      }
    }
    return res;
  },
  appliquer: function(pl, c, m) {
    var n = this.copie(pl), s = this.signe(c), o = this.autre(c);
    if (m.from === 'bar') n.bar[c]--; else n.pts[m.from] -= s;
    if (m.to === 'off') { n.off[c]++; return n; }
    if (this.sur(n, o, m.to) === 1) { n.pts[m.to] = 0; n.bar[o]++; } // pion seul : il part sur la barre
    n.pts[m.to] += s;
    return n;
  },
  sansUn: function(des, d) { var r = des.slice(), i = r.indexOf(d); if (i !== -1) r.splice(i, 1); return r; },
  // Nombre maximal de dés que l'on peut encore jouer
  maxJouable: function(pl, c, des) {
    if (!des.length) return 0;
    var meilleur = 0, vus = {};
    for (var k = 0; k < des.length; k++) {
      var d = des[k];
      if (vus[d]) continue;
      vus[d] = true;
      var coups = this.coupsDe(pl, c, d);
      for (var j = 0; j < coups.length; j++) {
        var r = 1 + this.maxJouable(this.appliquer(pl, c, coups[j]), c, this.sansUn(des, d));
        if (r > meilleur) meilleur = r;
        if (meilleur === des.length) return meilleur;
      }
    }
    return meilleur;
  },
  desDuLancer: function(d1, d2) { return d1 === d2 ? [d1, d1, d1, d1] : [d1, d2]; },
  // Coups autorisés maintenant. tour : { des: [d1, d2], restants, max, joues }
  // Règle : il faut jouer le plus de dés possible ; si un seul des deux dés peut être joué, le plus fort.
  coupsLegaux: function(pl, c, tour) {
    var reste = tour.max - tour.joues.length;
    if (reste <= 0) return [];
    var res = [], vus = {};
    tour.restants.forEach(d => {
      if (vus[d]) return;
      vus[d] = true;
      this.coupsDe(pl, c, d).forEach(m => {
        if (1 + this.maxJouable(this.appliquer(pl, c, m), c, this.sansUn(tour.restants, d)) === reste) res.push(m);
      });
    });
    if (tour.max === 1 && tour.des[0] !== tour.des[1] && !tour.joues.length) {
      var fort = Math.max(tour.des[0], tour.des[1]);
      if (res.some(m => m.d === fort)) res = res.filter(m => m.d === fort);
    }
    return res;
  },
  // Course : nombre de cases qu'il reste à parcourir
  course: function(pl, c) {
    var t = pl.bar[c] * 25;
    for (var i = 1; i <= 24; i++) t += this.sur(pl, c, i) * (c === 'A' ? i : 25 - i);
    return t;
  },
  // Points gagnés quand c sort son dernier pion : simple, gammon (×2) ou backgammon (×3)
  resultat: function(pl, gagnant) {
    var p = this.autre(gagnant);
    if (pl.off[p] > 0) return { mult: 1, type: 'simple' };
    var chezGagnant = pl.bar[p] > 0;
    for (var i = 1; i <= 24; i++) {
      if (this.sur(pl, p, i) && (gagnant === 'A' ? i <= 6 : i >= 19)) chezGagnant = true;
    }
    return chezGagnant ? { mult: 3, type: 'backgammon' } : { mult: 2, type: 'gammon' };
  }
};

if (typeof module !== 'undefined') module.exports = BG;
