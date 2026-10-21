// ================== ASSAUT : RÈGLES ET ORDINATEUR ==================
// Jeu de stratégie à pièces cachées (version maison, règles classiques du genre).
// Moteur sans affichage, utilisé par assaut/index.html ; testable avec Node.
//
// Plateau 10 × 10, cases numérotées 0..99 (ligne × 10 + colonne). A joue en bas (lignes 6 à 9),
// B en haut (lignes 0 à 3). Deux lacs infranchissables au milieu.
// Une case : null, ou une pièce { c: 'A'|'B', id, r?, vu, bouge }
//   r     : grade (connu seulement de son propriétaire, ou de l'arbitre en solo)
//   vu    : grade révélé publiquement (combat, éclaireur qui a filé), sinon null
//   bouge : la pièce a déjà bougé (donc ce n'est ni une bombe ni le drapeau)
// Grades : 10 Maréchal … 1 Espion, 'B' Bombe, 'D' Drapeau.

const AS = {
  N: 10,
  GRADES: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 'B', 'D'],
  NOMS: { 10: 'Maréchal', 9: 'Général', 8: 'Colonel', 7: 'Commandant', 6: 'Capitaine', 5: 'Lieutenant',
          4: 'Sergent', 3: 'Démineur', 2: 'Éclaireur', 1: 'Espion', B: 'Bombe', D: 'Drapeau' },
  ARMEES: {
    complet: { 10: 1, 9: 1, 8: 2, 7: 3, 6: 4, 5: 4, 4: 4, 3: 5, 2: 8, 1: 1, B: 6, D: 1 },  // 40 pièces
    rapide:  { 10: 1, 9: 1, 3: 2, 2: 2, 1: 1, B: 2, D: 1 }                                // 10 pièces
  },
  autre: function(c) { return c === 'A' ? 'B' : 'A'; },
  lac: function(i) { var l = Math.floor(i / 10), k = i % 10; return (l === 4 || l === 5) && (k === 2 || k === 3 || k === 6 || k === 7); },
  zone: function(c) { var r = []; for (var i = 0; i < 100; i++) { var l = Math.floor(i / 10); if (c === 'A' ? l >= 6 : l <= 3) r.push(i); } return r; },
  mobile: function(r) { return r !== 'B' && r !== 'D'; },
  // Liste des grades d'une armée (ex. [10, 9, 8, 8, …])
  armee: function(mode) {
    var a = [], t = this.ARMEES[mode];
    this.GRADES.forEach(g => { for (var k = 0; k < (t[g] || 0); k++) a.push(g); });
    return a;
  },
  // Repère visuel de chaque grade, affiché sous le chiffre
  ICONES: { 10: '👑', 9: '⭐', 8: '🎖️', 7: '🛡️', 6: '⚔️', 5: '🗡️', 4: '🪖', 3: '⛏️', 2: '🔭', 1: '🕵️', B: '💣', D: '🚩' },
  nomCourt: function(r) { return r === 'B' ? '💣' : r === 'D' ? '🚩' : String(r); },

  // Combat : qui gagne ? 'attaquant', 'defenseur' ou 'egalite' (les deux pièces disparaissent)
  combat: function(ra, rd) {
    if (rd === 'D') return 'attaquant';
    if (rd === 'B') return ra === 3 ? 'attaquant' : 'defenseur';   // seul le démineur désamorce
    if (ra === 1 && rd === 10) return 'attaquant';                  // l'espion bat le maréchal s'il attaque
    if (ra === rd) return 'egalite';
    return ra > rd ? 'attaquant' : 'defenseur';
  },

  // ---------- Placement ----------
  melanger: function(t) { for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; } return t; },
  // Disposition au hasard : [{ pos, r }]. "prudent" : drapeau au fond, entouré de bombes (pour l'ordinateur,
  // et proposé au joueur comme point de départ raisonnable)
  placementAleatoire: function(mode, c, prudent) {
    var zone = this.zone(c), grades = this.armee(mode), res = [];
    var fond = zone.filter(i => Math.floor(i / 10) === (c === 'A' ? 9 : 0));
    var libres = zone.slice();
    var prendre = (i) => { libres.splice(libres.indexOf(i), 1); };
    if (prudent) {
      var df = fond[Math.floor(Math.random() * fond.length)];
      res.push({ pos: df, r: 'D' }); prendre(df); grades.splice(grades.indexOf('D'), 1);
      var autour = this.voisins(df).filter(v => libres.indexOf(v) !== -1);
      this.melanger(autour).forEach(v => {
        var k = grades.indexOf('B');
        if (k === -1) return;
        res.push({ pos: v, r: 'B' }); prendre(v); grades.splice(k, 1);
      });
      // Éclaireurs plutôt devant
      var devant = libres.filter(i => Math.floor(i / 10) === (c === 'A' ? 6 : 3));
      this.melanger(devant);
      grades.filter(g => g === 2).forEach(() => {
        if (!devant.length || Math.random() < 0.3) return;
        var p = devant.pop(); res.push({ pos: p, r: 2 }); prendre(p); grades.splice(grades.indexOf(2), 1);
      });
    }
    this.melanger(libres);
    if (mode === 'rapide' && !prudent) libres = libres.slice(0, grades.length);
    this.melanger(grades).forEach((g, k) => res.push({ pos: libres[k], r: g }));
    return res;
  },
  voisins: function(i) {
    var l = Math.floor(i / 10), k = i % 10, r = [];
    if (l > 0) r.push(i - 10); if (l < 9) r.push(i + 10); if (k > 0) r.push(i - 1); if (k < 9) r.push(i + 1);
    return r;
  },

  // ---------- Déplacements ----------
  // Destinations d'une pièce (r : son grade, connu de son propriétaire)
  destinations: function(cases, i, r) {
    if (!this.mobile(r)) return [];
    var p = cases[i], res = [];
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dl, dk]) => {
      var l = Math.floor(i / 10), k = i % 10;
      for (var pas = 1; pas <= 9; pas++) {
        l += dl; k += dk;
        if (l < 0 || l > 9 || k < 0 || k > 9) break;
        var j = l * 10 + k;
        if (this.lac(j)) break;
        var q = cases[j];
        if (!q) { res.push(j); if (r !== 2) break; continue; }   // seul l'éclaireur file sur plusieurs cases
        if (q.c !== p.c && (pas === 1 || r === 2)) res.push(j);  // attaque
        break;
      }
    });
    return res;
  },
  // Règle des allers-retours : pas plus de 3 allers-retours de suite entre les deux mêmes cases
  allerRetourInterdit: function(hist, c, from, to) {
    var miens = hist.filter(h => h.c === c).slice(-3);
    if (miens.length < 3) return false;
    var [m1, m2, m3] = miens;
    return m3.from === to && m3.to === from && m2.from === from && m2.to === to && m1.from === to && m1.to === from;
  },
  // Coups possibles pour c (cases : vue où les pièces de c ont leur grade)
  coups: function(etat, c) {
    var res = [];
    for (var i = 0; i < 100; i++) {
      var p = etat.cases[i];
      if (!p || p.c !== c || p.r === undefined || p.r === null) continue;
      this.destinations(etat.cases, i, p.r).forEach(j => {
        if (!this.allerRetourInterdit(etat.hist, c, i, j)) res.push({ from: i, to: j });
      });
    }
    return res;
  },

  // ---------- Partie avec arbitre complet (solo, et vérification de fin de partie) ----------
  nouvellePartie: function(mode, placA, placB, premier) {
    var cases = new Array(100).fill(null);
    [['A', placA], ['B', placB]].forEach(([c, plac]) => plac.forEach((x, id) => {
      cases[x.pos] = { c: c, id: id, r: x.r, vu: null, bouge: false };
    }));
    return { mode: mode, cases: cases, tour: premier || 'A', hist: [], morts: { A: {}, B: {} }, combat: null, fin: null, n: 0 };
  },
  // Joue un coup déjà vérifié. ra / rd : grades de l'attaquant et du défenseur (rd seulement en cas d'attaque).
  // Fonctionne aussi sur une vue partielle : il suffit de connaître les deux grades du combat.
  appliquer: function(etat, from, to, ra, rd) {
    var p = etat.cases[from], q = etat.cases[to], c = p.c;
    var dist = Math.abs(Math.floor(from / 10) - Math.floor(to / 10)) + Math.abs(from % 10 - to % 10);
    etat.hist.push({ c: c, from: from, to: to });
    if (etat.hist.length > 40) etat.hist.splice(0, etat.hist.length - 40);
    p.bouge = true;
    if (dist > 1) p.vu = 2;  // un pion qui file sur plusieurs cases se dévoile : c'est un éclaireur
    etat.combat = null;
    etat.n++;
    if (!q) {
      etat.cases[to] = p; etat.cases[from] = null;
    } else {
      var res = this.combat(ra, rd);
      etat.combat = { n: etat.n, from: from, to: to, ca: c, ra: ra, rd: rd, res: res, ida: p.id, idd: q.id };
      var mort = (x, r) => { etat.morts[x][r] = (etat.morts[x][r] || 0) + 1; };
      if (res === 'attaquant') {
        mort(q.c, rd);
        p.vu = ra;
        etat.cases[to] = p; etat.cases[from] = null;
        if (rd === 'D') { etat.fin = { gagnant: c, raison: 'drapeau' }; }
      } else if (res === 'defenseur') {
        mort(c, ra);
        q.vu = rd; q.bouge = q.bouge || false;
        etat.cases[from] = null;
      } else {
        mort(c, ra); mort(q.c, rd);
        etat.cases[from] = null; etat.cases[to] = null;
      }
    }
    etat.tour = this.autre(c);
    return etat.combat;
  },
  // Plus aucun coup possible pour celui qui doit jouer : il perd (à vérifier avec une vue complète)
  verifierBlocage: function(etat) {
    if (etat.fin) return;
    if (!this.coups(etat, etat.tour).length) etat.fin = { gagnant: this.autre(etat.tour), raison: 'bloque' };
  },

  // ---------- Ordinateur ----------
  // Il ne triche pas : il ne connaît que ses pièces, les grades révélés (vu), qui a bougé, et les pertes.
  VALEUR: { 10: 400, 9: 220, 8: 110, 7: 80, 6: 55, 5: 35, 4: 25, 3: 45, 2: 12, 1: 140, B: 15, D: 5000 },
  // Grades encore possibles pour une pièce adverse inconnue
  possibles: function(etat, c, piece) {
    var adv = piece.c, pool = Object.assign({}, this.ARMEES[etat.mode]);
    Object.keys(etat.morts[adv]).forEach(g => { pool[g] = (pool[g] || 0) - etat.morts[adv][g]; });
    etat.cases.forEach(q => { if (q && q.c === adv && q !== piece && q.vu !== null && q.vu !== undefined) pool[q.vu] = (pool[q.vu] || 0) - 1; });
    var res = [], total = 0;
    Object.keys(pool).forEach(g => {
      var n = Math.max(0, pool[g]), r = (g === 'B' || g === 'D') ? g : +g;
      if (piece.bouge && !this.mobile(r)) n = 0;
      if (n) { res.push({ r: r, n: n }); total += n; }
    });
    res.forEach(x => x.p = total ? x.n / total : 0);
    return res;
  },
  // Gain espéré (en points de valeur) d'une attaque de r sur la pièce adverse q
  valeurAttaque: function(etat, c, r, q) {
    var dist = (q.vu !== null && q.vu !== undefined) ? [{ r: q.vu, p: 1 }] : this.possibles(etat, c, q);
    var v = 0;
    dist.forEach(x => {
      var res = this.combat(r, x.r);
      if (res === 'attaquant') v += x.p * this.VALEUR[x.r];
      else if (res === 'defenseur') v -= x.p * this.VALEUR[r];
      else v += x.p * (this.VALEUR[x.r] - this.VALEUR[r]);
    });
    if (r === 2 && (q.vu === null || q.vu === undefined)) v += 10; // un éclaireur qui sonde, c'est utile
    return v;
  },
  // Danger pour une pièce de grade r posée en j (attaques possibles des voisins adverses)
  danger: function(etat, c, r, j, ignorer) {
    var pire = 0;
    this.voisins(j).forEach(v => {
      var q = etat.cases[v];
      if (!q || q.c === c || v === ignorer) return;
      var dist = (q.vu !== null && q.vu !== undefined) ? [{ r: q.vu, p: 1 }] : this.possibles(etat, c, q);
      var risque = 0;
      dist.forEach(x => {
        if (!this.mobile(x.r)) return;
        var res = this.combat(x.r, r);
        if (res === 'attaquant') risque += x.p * this.VALEUR[r];
        else if (res === 'egalite') risque += x.p * this.VALEUR[r] * 0.5;
      });
      pire = Math.max(pire, risque);
    });
    return pire;
  },
  // Distance (en cases) jusqu'à la pièce adverse la plus proche
  procheEnnemi: function(etat, c, j) {
    var l = Math.floor(j / 10), k = j % 10, best = 99;
    for (var i = 0; i < 100; i++) {
      var q = etat.cases[i];
      if (q && q.c !== c) best = Math.min(best, Math.abs(Math.floor(i / 10) - l) + Math.abs(i % 10 - k));
    }
    return best;
  },
  choisirCoup: function(etat, c) {
    var coups = this.coups(etat, c);
    if (!coups.length) return null;
    var avant = c === 'B' ? 1 : -1;
    var notes = coups.map(m => {
      var p = etat.cases[m.from], q = etat.cases[m.to], r = p.r, note = 0;
      if (q) {
        note = this.valeurAttaque(etat, c, r, q);
        if (q.vu === 'D') note += 10000;
        if (this.VALEUR[r] <= 35) note += 8;                      // les petites pièces vont au contact
      } else {
        var dl = (Math.floor(m.to / 10) - Math.floor(m.from / 10)) * avant;
        note += dl * (r === 2 ? 3 : 2);                         // avancer un peu
        note -= this.danger(etat, c, r, m.to, m.from) * 0.8;    // ne pas se jeter dans la gueule du loup
        note += this.danger(etat, c, r, m.from) * 0.6;          // fuir une menace
        if (r === 10 || r === 9 || r === 1) note -= 4;          // garder les grosses pièces et l'espion en retrait
        // Aller au contact (surtout les pièces de faible valeur)
        var rapproche = this.procheEnnemi(etat, c, m.from) - this.procheEnnemi(etat, c, m.to);
        note += rapproche * (this.VALEUR[r] <= 55 ? 4 : 1.5);
      }
      return { m: m, note: note + Math.random() * 6 };
    });
    notes.sort((a, b) => b.note - a.note);
    var choix = Math.random() < 0.12 ? notes[Math.min(notes.length - 1, Math.floor(Math.random() * 3))] : notes[0];
    return choix.m;
  },
  // Vue d'un camp sur une partie complète : les grades adverses sont cachés (sauf ceux révélés)
  vue: function(etat, c) {
    var v = JSON.parse(JSON.stringify(etat));
    v.cases.forEach(p => { if (p && p.c !== c) delete p.r; });
    return v;
  }
};

if (typeof module !== 'undefined') module.exports = AS;
