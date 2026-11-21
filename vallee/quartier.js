// =============================================================================
// Le quartier des amis en isométrique (maquette, 4.29)
// Demandé par l'utilisateur le 21 novembre 2026 : « retravailler le look extérieur, pas juste l'agrandir »,
// une zone à part de la Vallée (on y entre par un portail), les maisons des amis regroupées.
// Choix de l'utilisateur : vue isométrique (même trait que l'intérieur de la maison), placettes de 4 à 6 maisons,
// on décore l'extérieur sur sa parcelle.
// QQ = le plan (placettes, parcelles, cases où l'on marche), QQ.dessin* = les dessins (SVG), sans écran ni Vue.
// Repères : ceux du kit de la maison (CPM.proj : i vers la droite-avant, j vers la gauche-avant, case = 32 × 16 px).
// =============================================================================
var QQ = (function () {
  var K = typeof CPM !== 'undefined' ? CPM : require('../compagnon/compagnon-meubles.js');
  var T = K.outils, proj = K.proj, nuance = K.nuance, teinte = K.teinte;
  var O = T.O, n1 = T.n1, pt = T.pt, poly = T.poly, ligne = T.ligne, chemin = T.chemin, matrice = T.matrice,
      contexte = T.contexte, plan = T.plan, boite = T.boite, cylindre = T.cylindre, rond = T.rond;

  // ---------- Le plan ----------
  // Une placette : un coin (5 × 5, son grand arbre et son panneau), deux rangs de 3 parcelles en L autour d'une place pavée.
  // Rang A : le long de i, façades tournées vers +j ; rang B : le long de j, façades tournées vers +i.
  // On ne voit donc que des façades, jamais l'arrière d'une maison. La rue passe devant toutes les placettes (j de 17 à 20).
  var LOT_W = 4, LOT_D = 5, COIN = 5, PAR_RANG = 3, TAILLE = COIN + LOT_W * PAR_RANG, PAS = TAILLE + 4;
  var RUE0 = TAILLE, RUE1 = TAILLE + 3, BAS = TAILLE + 6;
  var NOMS_PLACETTES = ['Placette des Tilleuls', 'Placette du Puits', 'Placette des Lilas', 'Placette des Cerisiers', 'Placette du Moulin', 'Placette des Glycines'];
  // Ordre de remplissage d'une placette : on alterne les deux rangs en partant du coin (4 maisons = un L serré)
  var ORDRE = [['A', 0], ['B', 0], ['A', 1], ['B', 1], ['A', 2], ['B', 2]];

  // Une parcelle : origine (i, j) et orientation o (0 = rang A, 1 = rang B). Repère local : u le long du rang, v vers la place.
  function versMonde(L, u, v) { return L.o ? [L.i + v, L.j + u] : [L.i + u, L.j + v]; }
  function parcelle(p, rang, k, n) {
    var i0 = p * PAS;
    return rang === 'A' ? { n: n, placette: p, rang: 'A', k: k, i: i0 + COIN + k * LOT_W, j: 0, o: 0 }
                        : { n: n, placette: p, rang: 'B', k: k, i: i0, j: COIN + k * LOT_W, o: 1 };
  }
  // Le quartier pour nb maisons : autant de placettes qu'il faut (6 maisons chacune), dans l'ordre
  function quartier(nb) {
    var np = Math.max(1, Math.ceil(nb / 6)), placettes = [], lots = [];
    for (var p = 0; p < np; p++) {
      var P = { p: p, i0: p * PAS, nom: NOMS_PLACETTES[p % NOMS_PLACETTES.length], lots: [] };
      ORDRE.forEach(function (r) { var L = parcelle(p, r[0], r[1], lots.length); P.lots.push(L); lots.push(L); });
      placettes.push(P);
    }
    var iMax = np * PAS - 4;
    return { placettes: placettes, lots: lots, iMin: -4, iMax: iMax, jMin: -2, jMax: BAS, nb: nb };
  }

  // Cases où l'on marche : la rue, les places (sauf leur fontaine et leurs décors), l'allée de chaque parcelle.
  // Porte d'une maison : depuis la 1re case de l'allée, on « fonce » vers la maison. Le portail : au bout ouest de la rue.
  function decorsPlace(P) {
    var a = P.i0;
    return [
      { m: 'fontaineG', i: a + 10, j: 10, w: 2, d: 2 },
      { m: 'massif', i: a + 9, j: 9 }, { m: 'massif', i: a + 12, j: 9, t: 'prune' }, { m: 'massif', i: a + 9, j: 12, t: 'moutarde' }, { m: 'massif', i: a + 12, j: 12 },
      { m: 'lanterne', i: a + 7, j: 7 }, { m: 'lanterne', i: a + 15, j: 7 }, { m: 'lanterne', i: a + 7, j: 15 }, { m: 'lanterne', i: a + 15, j: 15 },
      { m: 'banc', i: a + 10, j: 14, o: 0 }, { m: 'banc', i: a + 14, j: 10, o: 1 }
    ];
  }
  function cases(Q) {
    var ok = {}, bloque = {};
    function mettre(i, j) { ok[i + ',' + j] = 1; }
    for (var i = -3; i <= Q.iMax; i++) for (var j = RUE0; j < RUE1; j++) mettre(i, j);
    Q.placettes.forEach(function (P) {
      for (var i = P.i0 + COIN; i < P.i0 + TAILLE; i++) for (var j = COIN; j < TAILLE; j++) mettre(i, j);
      decorsPlace(P).forEach(function (d) { for (var a = 0; a < (d.w || 1); a++) for (var b = 0; b < (d.d || 1); b++) bloque[(d.i + a) + ',' + (d.j + b)] = 1; });
    });
    Q.lots.forEach(function (L) { [3, 4].forEach(function (v) { var c = versMonde(L, 1, v); mettre(c[0], c[1]); }); });
    Object.keys(bloque).forEach(function (c) { delete ok[c]; });
    return ok;
  }
  // La porte d'une parcelle : la case devant elle (1re case de l'allée) et la direction de la maison
  function devantPorte(L) { var c = versMonde(L, 1, 3); return { i: c[0], j: c[1], dir: L.o ? [-1, 0] : [0, -1] }; }
  function lotEn(Q, i, j) {
    return Q.lots.filter(function (L) { var c = versMonde(L, 1, 3), d = versMonde(L, 1, 4); return (c[0] === i && c[1] === j) || (d[0] === i && d[1] === j); })[0] || null;
  }
  // Chemin le plus court (largeur d'abord) entre deux cases où l'on marche
  function chemin4(ok, a, b) {
    var k0 = a.i + ',' + a.j, kb = b.i + ',' + b.j; if (!ok[kb]) return null;
    var vient = {}, file = [k0]; vient[k0] = null;
    while (file.length) {
      var c = file.shift(); if (c === kb) break;
      var p = c.split(',').map(Number);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var k = (p[0] + d[0]) + ',' + (p[1] + d[1]); if (ok[k] && !(k in vient)) { vient[k] = c; file.push(k); } });
    }
    if (!(kb in vient)) return null;
    var r = [], c2 = kb; while (c2 && c2 !== k0) { var q = c2.split(',').map(Number); r.unshift({ i: q[0], j: q[1] }); c2 = vient[c2]; }
    return r;
  }

  // ---------- Les styles de maison ----------
  // Hm = hauteur des murs, R = hauteur du toit (en cases) ; mur = matière des murs ; teintes par défaut (nuancier du kit)
  var STYLES = {
    colombages: { nom: 'Colombages', mur: 'enduit', murT: 'creme', toit: 'tuiles', toitT: 'terracotta', menuis: 'foret', poutres: 'chocolat', Hm: 1.8, R: 1.3, volets: true, porte: 'arc' },
    chaumiere:  { nom: 'Chaumière', mur: 'enduit', murT: 'sable', toit: 'chaume', toitT: 'moutarde', menuis: 'sauge', Hm: 1.45, R: 1.6, volets: true, porte: 'arc' },
    pierre:     { nom: 'Pierre', mur: 'pierre', murT: 'sable', toit: 'ardoise', toitT: 'ardoise', menuis: 'nuit', Hm: 1.85, R: 1.25, volets: true, porte: 'arc' },
    chalet:     { nom: 'Chalet', mur: 'rondins', murT: 'miel', toit: 'bardeaux', toitT: 'chocolat', menuis: 'brique', Hm: 1.75, R: 1.0, volets: true, porte: 'droite', ov: 0.42 },
    briques:    { nom: 'Briques', mur: 'briques', murT: 'brique', toit: 'ardoise', toitT: 'nuit', menuis: 'creme', Hm: 1.95, R: 1.2, volets: false, porte: 'droite' },
    bardage:    { nom: 'Bardage', mur: 'planches', murT: 'ardoise', toit: 'tuiles', toitT: 'brique', menuis: 'creme', Hm: 1.85, R: 1.15, volets: false, porte: 'droite' }
  };
  var TOITS = { tuiles: 'Tuiles', ardoise: 'Ardoise', chaume: 'Chaume', bardeaux: 'Bardeaux' };
  var CLOTURES = { piquets: 'Piquets', bois: 'Barrière', haie: 'Haie', muret: 'Muret', aucune: 'Aucune' };
  // Une maison complète, d'après son style (les choix de l'habitant remplacent les valeurs par défaut)
  function maison(m) {
    var S = STYLES[(m && m.style) in STYLES ? m.style : 'colombages'], r = Object.assign({ style: 'colombages' }, m || {});
    r.mur = r.mur || S.murT; r.toit = r.toit || S.toit; r.toitT = r.toitT || S.toitT; r.menuis = r.menuis || S.menuis;
    r.cloture = r.cloture in CLOTURES ? r.cloture : 'piquets'; r.jardin = Array.isArray(r.jardin) ? r.jardin : [];
    return r;
  }
  // Places du jardin de devant (repère local de la parcelle) : l'allée est en u = 1, la boîte aux lettres en (0, 4)
  var PLACES_JARDIN = [[0, 3], [3, 3], [2, 4], [3, 4]];   // la case (2, 3), devant la porte, est le perron du compagnon

  // ---------- Matières (motifs posés à plat sur une face : 40 unités par case) ----------
  function cleT(t) { return String(teinte(t)).replace('#', ''); }
  function motifs(defs, mat, t) {
    var c = teinte(t), id = 'qm-' + mat + '-' + cleT(t);
    if (defs[id]) return id;
    var f = nuance(c, -0.14), cl = nuance(c, 0.16), s;
    switch (mat) {
      case 'pierre': s = K.motifMur(id, 'pierre', c); break;
      case 'briques': s = K.motifMur(id, 'briques', c); break;
      case 'rondins': s = '<pattern id="' + id + '" width="40" height="9" patternUnits="userSpaceOnUse"><rect width="40" height="9" fill="' + nuance(c, -0.32) + '"/>' +
        '<rect y="0.6" width="40" height="7.8" rx="3.9" fill="' + c + '"/><path d="M0 2.6 H40" stroke="' + cl + '" stroke-width="1.1" opacity="0.8"/><path d="M0 6.8 H40" stroke="' + f + '" stroke-width="1"/>' +
        '<path d="M9 4.5 h6 M27 3.6 h7" stroke="' + f + '" stroke-width="0.6" opacity="0.7"/></pattern>'; break;
      case 'planches': s = '<pattern id="' + id + '" width="40" height="7" patternUnits="userSpaceOnUse"><rect width="40" height="7" fill="' + c + '"/>' +
        '<rect y="5.6" width="40" height="1.4" fill="' + nuance(c, -0.3) + '"/><rect width="40" height="1" fill="' + cl + '" opacity="0.8"/></pattern>'; break;
      case 'lames': s = '<pattern id="' + id + '" width="7" height="40" patternUnits="userSpaceOnUse"><rect width="7" height="40" fill="' + c + '"/>' +
        '<rect x="5.8" width="1.2" height="40" fill="' + nuance(c, -0.3) + '"/><rect width="0.9" height="40" fill="' + cl + '" opacity="0.7"/></pattern>'; break;
      case 'paves': s = '<pattern id="' + id + '" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="' + nuance(c, -0.3) + '"/>' +
        '<rect x="0.8" y="0.8" width="8.4" height="8.4" rx="2.6" fill="' + c + '"/><rect x="10.8" y="0.8" width="8.4" height="8.4" rx="2.6" fill="' + nuance(c, 0.06) + '"/>' +
        '<rect x="5.8" y="10.8" width="8.4" height="8.4" rx="2.6" fill="' + nuance(c, -0.05) + '"/><rect x="-4.2" y="10.8" width="8.4" height="8.4" rx="2.6" fill="' + c + '"/><rect x="15.8" y="10.8" width="8.4" height="8.4" rx="2.6" fill="' + c + '"/>' +
        '<path d="M2.5 3 h3 M13 3 h3" stroke="' + cl + '" stroke-width="0.8" opacity="0.7"/></pattern>'; break;
      case 'herbe': s = K.motifSol(id, 'herbe', c); break;
      case 'dalles': s = K.motifSol(id, 'dalles', c); break;
      default: s = '<pattern id="' + id + '" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="' + c + '"/>' +   // enduit
        '<circle cx="4" cy="5" r="0.7" fill="' + f + '" opacity="0.55"/><circle cx="12" cy="12" r="0.8" fill="' + cl + '" opacity="0.7"/><circle cx="11" cy="3" r="0.5" fill="' + f + '" opacity="0.4"/></pattern>';
    }
    defs[id] = s;
    return id;
  }

  // ---------- Petites aides ----------
  function g(transform, corps) { return '<g transform="' + transform + '">' + corps + '</g>'; }
  function echelle(corps, c, s) { return '<g transform="translate(' + n1(c[0]) + ' ' + n1(c[1]) + ') scale(' + s + ') translate(' + n1(-c[0]) + ' ' + n1(-c[1]) + ')">' + corps + '</g>'; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Panneau en bois à l'écran (toujours de face, lisible) : x, y = milieu du bas
  function panneauNom(x, y, texte, or) {
    var t = String(texte || ''), fs = 10.5, l = Math.max(38, Math.min(96, t.length * fs * 0.58 + 16)), h = 17;
    var fond = or ? '#f7d774' : '#f3dfb4', bord = or ? '#b7791f' : '#c08a4e';
    return '<g class="qd-nom">' +
      '<rect x="' + n1(x - l / 2) + '" y="' + n1(y - h) + '" width="' + n1(l) + '" height="' + h + '" rx="3.5" fill="' + O + '"/>' +
      '<rect x="' + n1(x - l / 2 + 1.5) + '" y="' + n1(y - h + 1.5) + '" width="' + n1(l - 3) + '" height="' + (h - 3) + '" rx="2.5" fill="' + bord + '"/>' +
      '<rect x="' + n1(x - l / 2 + 3.2) + '" y="' + n1(y - h + 3.2) + '" width="' + n1(l - 6.4) + '" height="' + (h - 6.4) + '" rx="1.5" fill="' + fond + '"/>' +
      '<text x="' + n1(x) + '" y="' + n1(y - 4.9) + '" text-anchor="middle" font-size="' + fs + '" font-weight="900" fill="#4a2e17" font-family="Georgia, serif">' + esc(t) + '</text></g>';
  }

  // ---------- Toits (dessinés à plat sur le pan avant : x = 40 par case, y = 0 à l'égout, 40 au faîtage) ----------
  function texturePan(type, c, larg, id) {
    var s = '<clipPath id="' + id + '"><rect width="' + n1(larg) + '" height="40"/></clipPath><g clip-path="url(#' + id + ')"><rect width="' + n1(larg) + '" height="40" fill="' + c + '"/>';
    var f = nuance(c, -0.22), cl = nuance(c, 0.14), r, x;
    if (type === 'tuiles') {
      var nr = 6, h = 40 / nr;
      for (r = nr - 1; r >= 0; r--) {
        var y0 = r * h, d = 'M0 ' + n1(y0 + h);
        for (x = (r % 2) * 4 - 4; x < larg + 8; x += 8) d += ' L' + n1(x) + ' ' + n1(y0 + 1.2) + ' a4 3.2 0 0 0 8 0';
        d += ' L' + n1(larg + 8) + ' ' + n1(y0 + h) + 'Z';
        s += '<path d="' + d + '" fill="' + (r % 2 ? c : nuance(c, 0.05)) + '" stroke="' + f + '" stroke-width="0.9"/>';
        for (x = (r % 2) * 4; x < larg; x += 8) s += '<path d="M' + n1(x + 1.6) + ' ' + n1(y0 + h - 1.5) + ' v-' + n1(h - 3.5) + '" stroke="' + cl + '" stroke-width="1" opacity="0.6"/>';
      }
    } else if (type === 'ardoise') {
      var na = 8, ha = 40 / na;
      for (r = na - 1; r >= 0; r--) {
        var ya = r * ha;
        for (x = (r % 2) * -5; x < larg; x += 10) s += '<rect x="' + n1(x + 0.4) + '" y="' + n1(ya) + '" width="9.2" height="' + n1(ha + 1.4) + '" rx="1.2" fill="' + ((x + r * 3) % 20 < 10 ? c : nuance(c, 0.07)) + '" stroke="' + f + '" stroke-width="0.8"/>';
      }
    } else if (type === 'bardeaux') {
      var nb = 7, hb = 40 / nb;
      for (r = nb - 1; r >= 0; r--) {
        var yb = r * hb;
        for (x = (r % 2) * -3; x < larg; x += 6) s += '<path d="M' + n1(x + 0.4) + ' ' + n1(yb + hb + 1.5) + ' V' + n1(yb + 2) + ' q2.6 -2.2 5.2 0 V' + n1(yb + hb + 1.5) + 'Z" fill="' + ((x * 7 + r * 5) % 3 ? c : cl) + '" stroke="' + f + '" stroke-width="0.8"/>';
      }
    } else {   // chaume : touffes de paille, et une lèvre épaisse à l'égout
      for (r = 0; r < 9; r++) {
        var yc = 3 + r * 4.3, dc = '';
        for (x = (r % 2) * 2.5; x < larg; x += 5) dc += 'M' + n1(x) + ' ' + n1(yc + 3.5) + ' l' + n1(0.6 + ((x + r) % 3) * 0.3) + ' -' + n1(4.5 + ((x * 3 + r) % 4)) + ' ';
        s += '<path d="' + dc + '" stroke="' + (r % 2 ? f : nuance(c, -0.12)) + '" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>';
      }
      s += '<path d="M0 0 H' + n1(larg) + ' V5.5 Q' + n1(larg * 0.75) + ' 8 ' + n1(larg / 2) + ' 6.2 Q' + n1(larg * 0.25) + ' 8 0 5.5Z" fill="' + nuance(c, -0.18) + '"/>';
      for (x = 2; x < larg; x += 3.5) s += '<path d="M' + n1(x) + ' 0.5 v' + n1(3 + (x * 7) % 3) + '" stroke="' + nuance(c, -0.38) + '" stroke-width="0.8"/>';
    }
    return s + '</g>';
  }

  // ---------- Une maison et son jardin de devant ----------
  // L = parcelle, m = maison (voir maison()), op = { nuit, present, courrier, nom, moi, id }
  // Rend des éléments { cle (ordre de dessin), s (SVG), lueurs } : la maison, la clôture et son panneau, les objets du jardin
  var U0 = 0.3, U1 = 3.7, VB = 0.3, VF = 2.55, VR = (VB + VF) / 2;
  function dessinerParcelle(L, m0, op, defs) {
    op = op || {};
    var k = contexte(L.i, L.j, L.o), P = k.P, el = [];
    var cx = L.o ? L.i + 2.5 : L.i + 2, cy = L.o ? L.j + 2 : L.j + 2.5;   // pas utilisé pour l'ordre, juste pour les lueurs
    if (!m0) { el.push({ cle: cle(L, 2, 2), s: terrainLibre(L, k) }); return el; }
    var m = maison(m0), S = STYLES[m.style], Hm = S.Hm, R = S.R, ov = S.ov || 0.24, id = 'qp' + (op.id != null ? op.id : L.n);
    var cMur = teinte(m.mur), cToit = teinte(m.toitT), cMen = teinte(m.menuis), lueurs = [];
    var ombreFace = L.o ? 0 : 0.16, ombreCote = L.o ? 0.16 : 0;   // les faces tournées vers +j sont à l'ombre
    var allume = !!op.present, fen = [];
    var s = '<g class="qd-maison" data-lot="' + L.n + '">';
    // ombre au sol
    s += '<path d="' + chemin([P(U0 - 0.15, VB - 0.1, 0), P(U1 + 0.55, VB - 0.1, 0), P(U1 + 0.55, VF + 0.35, 0), P(U0 - 0.15, VF + 0.35, 0)], 8) + '" fill="#000" opacity="0.2"/>';
    // cheminée (derrière le faîtage : le pan avant la cache en partie)
    var chem = m.style === 'pierre' || m.style === 'chalet' ? '#8f8a84' : '#a35a3c';
    s += boite(k, 2.75, 0.72, Hm + 0.3, 0.36, 0.36, R + 0.35, chem, 1.2) + boite(k, 2.7, 0.67, Hm + R + 0.62, 0.46, 0.46, 0.1, nuance(chem, -0.25), 1);
    if (allume) { var fu = P(2.93, 0.9, Hm + R + 0.8); s += '<g class="qd-fumee"><circle cx="' + n1(fu[0]) + '" cy="' + n1(fu[1] - 6) + '" r="4" fill="#fff" opacity="0.65"/><circle cx="' + n1(fu[0] + 4) + '" cy="' + n1(fu[1] - 15) + '" r="5.5" fill="#fff" opacity="0.45"/><circle cx="' + n1(fu[0] - 1) + '" cy="' + n1(fu[1] - 26) + '" r="7" fill="#fff" opacity="0.25"/></g>'; }
    // --- face de côté (+u) avec son pignon ---
    var Wd = (VF - VB) * 40, Hu = Hm * 40, Ru = R * 40, matMur = S.mur === 'enduit' ? 'enduit' : S.mur;
    var idM = motifs(defs, matMur, m.mur);
    var cote = '<path d="M0 0 V' + Hu + ' H' + Wd + ' V0 L' + n1(Wd / 2) + ' ' + n1(-Ru) + 'Z" fill="url(#' + idM + ')"/>';
    if (m.style === 'chalet') cote += '<path d="M0 0 L' + n1(Wd / 2) + ' ' + n1(-Ru) + ' L' + Wd + ' 0Z" fill="url(#' + motifs(defs, 'lames', nuance(cMur, -0.05)) + ')"/>';
    if (m.style === 'colombages') {
      var pc = teinte(S.poutres);
      cote += '<path d="M2 2 H' + (Wd - 2) + ' M2 ' + (Hu - 3) + ' H' + (Wd - 2) + ' M2 0 V' + Hu + ' M' + (Wd - 2) + ' 0 V' + Hu + ' M' + n1(Wd / 2) + ' 2 V' + Hu +
        ' M4 ' + (Hu - 4) + ' L' + n1(Wd / 2 - 2) + ' 4 M' + n1(Wd / 2 + 2) + ' 4 L' + (Wd - 4) + ' ' + (Hu - 4) + ' M' + n1(Wd * 0.25) + ' ' + n1(-Ru / 2) + ' V0 M' + n1(Wd * 0.75) + ' ' + n1(-Ru / 2) + ' V0" stroke="' + pc + '" stroke-width="4" stroke-linecap="square" fill="none"/>';
    }
    if (m.style === 'briques') cote += '<path d="M0 ' + (Hu - 1) + ' H' + Wd + '" stroke="' + nuance(cMur, 0.45) + '" stroke-width="2"/>';
    // fenêtre du côté et petite fenêtre du pignon
    var fc = fenetre2D(Wd / 2, Hu * 0.38, 16, 18, S, m, cMen, allume, op.nuit);
    cote += fc.s;
    cote += oeil(Wd / 2, -Ru * 0.42, m.style, cMen, allume);
    // socle de pierre
    cote += '<rect y="' + (Hu - 5) + '" width="' + Wd + '" height="5" fill="#9a948d"/><path d="M0 ' + (Hu - 5) + ' H' + Wd + '" stroke="' + O + '" stroke-width="0.8" opacity="0.5"/>';
    if (ombreCote) cote += '<path d="M0 0 V' + Hu + ' H' + Wd + ' V0 L' + n1(Wd / 2) + ' ' + n1(-Ru) + 'Z" fill="#1b130e" opacity="' + ombreCote + '"/>';
    cote += '<path d="M0 0 V' + Hu + ' H' + Wd + ' V0 L' + n1(Wd / 2) + ' ' + n1(-Ru) + 'Z" fill="none" stroke="' + O + '" stroke-width="1.8" stroke-linejoin="round"/>';
    s += g(plan(k, [U1, VF, Hm], [0, -1, 0], [0, 0, -1]), cote);
    if (allume) fc.l.forEach(function (q) { lueurs.push(P(U1, VF - q[0] / 40, Hm - q[1] / 40)); });
    // --- façade (+v) ---
    var Wf = (U1 - U0) * 40, porteX = (1.5 - U0) * 40, face = '<rect width="' + Wf + '" height="' + Hu + '" fill="url(#' + idM + ')"/>';
    if (m.style === 'colombages') {
      var pf = teinte(S.poutres);
      face += '<path d="M0 2 H' + Wf + ' M0 ' + (Hu - 3) + ' H' + Wf + ' M2 0 V' + Hu + ' M' + (Wf - 2) + ' 0 V' + Hu + ' M' + n1(porteX + 16) + ' 0 V' + Hu + ' M' + n1(porteX - 16) + ' 0 V' + Hu +
        ' M' + n1(Wf - 35) + ' 0 V' + Hu + ' M' + n1(porteX + 16) + ' ' + n1(Hu * 0.36) + ' H' + Wf + ' M0 ' + n1(Hu * 0.36) + ' H' + n1(porteX - 16) +
        ' M' + n1(porteX + 18) + ' ' + n1(Hu - 4) + ' L' + n1(Wf - 37) + ' ' + n1(Hu * 0.38) + '" stroke="' + pf + '" stroke-width="4" fill="none"/>';
    }
    if (m.style === 'chalet') face += '<rect y="' + n1(Hu * 0.3) + '" width="' + Wf + '" height="3" fill="' + nuance(cMur, -0.35) + '"/>';
    // fenêtres et porte
    var fx = [[porteX - 31, 16], [porteX + 35, 18], [porteX + 68, 18]];
    fx.forEach(function (f) { var w = fenetre2D(f[0], Hu * 0.38, f[1], 19, S, m, cMen, allume, op.nuit); face += w.s; w.l.forEach(function (q) { fen.push(q); }); });
    face += porte2D(porteX, Hu, S, m, cMen, allume);
    // lanterne à côté de la porte
    face += '<path d="M' + n1(porteX + 15) + ' ' + n1(Hu - 44) + ' h4" stroke="' + O + '" stroke-width="1.5"/><rect x="' + n1(porteX + 16.5) + '" y="' + n1(Hu - 43) + '" width="5" height="7" rx="1" fill="' + (allume || op.nuit ? '#ffd77a' : '#e9dcc0') + '" stroke="' + O + '" stroke-width="1"/>';
    // jardinières de fleurs sous les fenêtres de droite
    if (m.fleurs !== false) [fx[1], fx[2]].forEach(function (f, n) {
      var y = Hu * 0.38 + 19 + 2;
      face += '<rect x="' + n1(f[0] - f[1] / 2 - 2) + '" y="' + n1(y) + '" width="' + (f[1] + 4) + '" height="5" rx="1" fill="#8d5a2b" stroke="' + O + '" stroke-width="0.9"/>';
      [0.2, 0.45, 0.7, 0.92].forEach(function (a, q) { face += rond(f[0] - f[1] / 2 + a * f[1], y - 0.5, 2.3, q % 2 ? (n ? '#f783ac' : '#ffd43b') : '#ff6b6b', 0.6); });
    });
    face += '<rect y="' + (Hu - 5) + '" width="' + Wf + '" height="5" fill="#9a948d"/><path d="M0 ' + (Hu - 5) + ' H' + Wf + '" stroke="' + O + '" stroke-width="0.8" opacity="0.5"/>';
    face += '<rect width="' + Wf + '" height="7" fill="#000" opacity="0.18"/>';   // ombre sous l'avant-toit
    if (ombreFace) face += '<rect width="' + Wf + '" height="' + Hu + '" fill="#1b130e" opacity="' + ombreFace + '"/>';
    face += '<rect width="' + Wf + '" height="' + Hu + '" fill="none" stroke="' + O + '" stroke-width="1.8"/>';
    s += g(plan(k, [U0, VF, Hm], [1, 0, 0], [0, 0, -1]), face);
    if (allume) fen.forEach(function (q) { lueurs.push(P(U0 + q[0] / 40, VF, Hm - q[1] / 40)); });
    // fleurs au pied de la façade
    if (m.fleurs !== false) [0.45, 0.75, 2.25, 2.6, 2.95, 3.3].forEach(function (u, n) {
      var b = P(u, VF + 0.14, 0);
      s += '<path d="M' + n1(b[0] - 4) + ' ' + n1(b[1]) + ' q4 -7 8 0z" fill="#4f7a42" stroke="' + O + '" stroke-width="0.7"/>' + rond(b[0] - 1, b[1] - 4.5, 2, ['#ff6b6b', '#ffd43b', '#f783ac', '#b197fc'][n % 4], 0.5) + rond(b[0] + 2, b[1] - 3, 1.7, '#fff3bf', 0.5);
    });
    // --- toit : pan avant, puis rives du côté ---
    var E1 = P(U0 - ov, VF + ov, Hm - 0.06), E2 = P(U1 + ov, VF + ov, Hm - 0.06), R2 = P(U1 + ov, VR, Hm + R), R1 = P(U0 - ov, VR, Hm + R), B2 = P(U1 + ov, VB - ov, Hm - 0.06);
    var larg = (U1 - U0 + 2 * ov) * 40, ep = m.toit === 'chaume' ? 0.26 : 0.12;
    s += g(plan(k, [U0 - ov, VF + ov, Hm - 0.06], [1, 0, 0], [0, VR - (VF + ov), R + 0.06]), texturePan(m.toit, cToit, larg, id + '-pan'));
    // épaisseur de l'égout (devant) et rives (côté), le faîtage
    var bas = function (p, d) { return [p[0], p[1] + d * 34]; };
    var cRive = m.style === 'chalet' ? '#7a4a26' : nuance(cToit, -0.32);
    s += poly([E1, E2, bas(E2, ep), bas(E1, ep)], nuance(cToit, -0.28), 1.5, 1.4);
    s += poly([E2, R2, bas(R2, ep), bas(E2, ep)], cRive, 1.5, 1.4) + poly([R2, B2, bas(B2, ep), bas(R2, ep)], nuance(cRive, -0.1), 1.5, 1.4);
    if (m.style === 'chalet') {   // rive découpée
      for (var q = 0.12; q < 0.95; q += 0.17) { var a = [E2[0] + (R2[0] - E2[0]) * q, E2[1] + (R2[1] - E2[1]) * q + ep * 34]; s += '<path d="M' + n1(a[0] - 2.5) + ' ' + n1(a[1]) + ' q2.5 4 5 0" fill="' + cRive + '" stroke="' + O + '" stroke-width="0.8"/>'; }
    }
    s += '<path d="M' + pt(E1) + ' L' + pt(E2) + ' L' + pt(R2) + ' L' + pt(R1) + 'Z" fill="none" stroke="' + O + '" stroke-width="1.8" stroke-linejoin="round"/>';
    s += ligne([R1, R2], m.toit === 'chaume' ? nuance(cToit, -0.3) : nuance(cToit, -0.35), m.toit === 'chaume' ? 6 : 4.2) + ligne([R1, R2], O, 1, ' opacity="0.6"');
    if (m.toit === 'chaume') s += ligne([[R1[0], R1[1] - 2], [R2[0], R2[1] - 2]], nuance(cToit, 0.1), 2.2);
    s += '</g>';
    el.push({ cle: cle(L, 2, 1.4), s: s, lueurs: op.nuit ? lueurs : [], lot: L.n });
    // --- clôture, portillon et nom ---
    el = el.concat(cloture(L, k, m, op));
    // --- boîte aux lettres ---
    el.push({ cle: cle(L, 0.5, 4.45), s: boiteLettres(k, op.courrier) });
    // --- objets du jardin ---
    m.jardin.forEach(function (ob) {
      if (!K.MEUBLES[ob.m]) return;
      var w = versMonde(L, ob.u, ob.v), o2 = L.o ? (ob.o ? 0 : 1) : (ob.o || 0);
      var x = { m: ob.m, i: w[0], j: w[1], o: o2, t: ob.t };
      var mm = K.MEUBLES[ob.m], lu = mm.w || 1, lv = mm.d || 1;
      el.push({ cle: cle(L, ob.u + lu / 2, ob.v + lv / 2), s: '<g class="qd-obj" data-lot="' + L.n + '">' + K.dessinObjet(x, 2.6, { nuit: op.nuit }) + '</g>', lueurs: op.nuit && mm.lumiere ? [P(ob.u + 0.5, ob.v + 0.5, mm.lumiere.z || 1)] : [] });
    });
    // --- son compagnon devant chez lui (s'il est là) ---
    if (op.cp) { var pc = versMonde(L, 2.45, 3.25); el.push({ cle: cle(L, 2.45, 3.25), cp: op.cp, i: pc[0], j: pc[1] }); }
    return el;
  }
  // Ordre de dessin : somme des coordonnées du centre (assez juste pour ce quartier, où rien ne se chevauche en profondeur)
  function cle(L, u, v) { var w = versMonde(L, u, v); return w[0] + w[1]; }

  function fenetre2D(x, y, w, h, S, m, cMen, allume, nuit) {
    var s = '', l = [], blanc = S.volets ? nuance(cMen, -0.1) : '#f3eadb', x0 = x - w / 2;
    var verre = allume ? '#ffd77a' : (nuit ? '#2c3a52' : '#4d6577');
    s += '<rect x="' + n1(x0 - 2) + '" y="' + n1(y - 2) + '" width="' + (w + 4) + '" height="' + (h + 4) + '" rx="1" fill="' + blanc + '" stroke="' + O + '" stroke-width="1"/>';
    s += '<rect x="' + n1(x0) + '" y="' + n1(y) + '" width="' + w + '" height="' + h + '" fill="' + verre + '"/>';
    if (allume) { s += '<rect x="' + n1(x0 + 1) + '" y="' + n1(y + 1) + '" width="' + n1(w / 2 - 1) + '" height="' + n1(h / 2 - 1) + '" fill="#fff1b8"/>'; l.push([x, y + h / 2]); }
    else s += '<path d="M' + n1(x0 + 2) + ' ' + n1(y + h - 3) + ' l' + n1(w * 0.45) + ' -' + n1(h * 0.6) + '" stroke="#fff" stroke-width="1.4" opacity="0.3"/>';
    s += '<path d="M' + n1(x) + ' ' + n1(y) + ' V' + n1(y + h) + ' M' + n1(x0) + ' ' + n1(y + h / 2) + ' H' + n1(x0 + w) + '" stroke="' + blanc + '" stroke-width="1.6"/>';
    if (S.volets) {
      [x0 - 9, x0 + w + 2].forEach(function (vx) {
        s += '<rect x="' + n1(vx) + '" y="' + n1(y - 1) + '" width="7" height="' + (h + 2) + '" rx="0.8" fill="' + cMen + '" stroke="' + O + '" stroke-width="0.9"/>' +
          '<path d="M' + n1(vx + 1) + ' ' + n1(y + 3) + ' h5 M' + n1(vx + 1) + ' ' + n1(y + h - 3) + ' h5 M' + n1(vx + 1) + ' ' + n1(y + h - 3) + ' l5 -' + n1(h - 6) + '" stroke="' + nuance(cMen, -0.3) + '" stroke-width="0.9"/>';
      });
    } else if (m.style === 'briques') {
      s += '<path d="M' + n1(x0 - 3) + ' ' + n1(y - 3) + ' h' + (w + 6) + ' l-2 -4 h-' + (w + 2) + 'Z" fill="#e9e1d4" stroke="' + O + '" stroke-width="0.8"/>';
    }
    return { s: s, l: l };
  }
  function porte2D(x, Hu, S, m, cMen, allume) {
    var w = 21, h = Math.min(38, Hu - 14), x0 = x - w / 2, y0 = Hu - 5 - h, s = '';
    var forme = S.porte === 'arc' ? 'M' + n1(x0) + ' ' + n1(Hu - 5) + ' V' + n1(y0 + w / 2) + ' a' + n1(w / 2) + ' ' + n1(w / 2) + ' 0 0 1 ' + w + ' 0 V' + n1(Hu - 5) + 'Z'
                                  : 'M' + n1(x0) + ' ' + n1(Hu - 5) + ' V' + n1(y0) + ' H' + n1(x0 + w) + ' V' + n1(Hu - 5) + 'Z';
    if (!S.volets) s += '<rect x="' + n1(x0 - 3) + '" y="' + n1(y0 - 4) + '" width="' + (w + 6) + '" height="' + n1(h + 4) + '" fill="#f3eadb" stroke="' + O + '" stroke-width="1"/>';
    else if (m.style === 'pierre' || m.style === 'chaumiere') s += '<path d="M' + n1(x0 - 3) + ' ' + n1(Hu - 5) + ' V' + n1(y0 + w / 2) + ' a' + n1(w / 2 + 3) + ' ' + n1(w / 2 + 3) + ' 0 0 1 ' + (w + 6) + ' 0 V' + n1(Hu - 5) + 'Z" fill="#c9c1b5" stroke="' + O + '" stroke-width="1"/>';
    s += '<path d="' + forme + '" fill="' + cMen + '" stroke="' + O + '" stroke-width="1.3"/>';
    for (var q = 1; q < 4; q++) s += '<path d="M' + n1(x0 + q * w / 4) + ' ' + n1(y0 + 3) + ' V' + n1(Hu - 6) + '" stroke="' + nuance(cMen, -0.25) + '" stroke-width="0.9"/>';
    if (S.porte === 'droite') s += '<rect x="' + n1(x0 + 4) + '" y="' + n1(y0 + 4) + '" width="' + (w - 8) + '" height="7" rx="1" fill="' + (allume ? '#ffd77a' : '#4d6577') + '" stroke="' + O + '" stroke-width="0.8"/>';
    s += '<circle cx="' + n1(x0 + w - 4.5) + '" cy="' + n1(Hu - 5 - h * 0.45) + '" r="1.5" fill="#fcc419" stroke="#5c3a00" stroke-width="0.5"/>';
    s += '<rect x="' + n1(x0 - 4) + '" y="' + n1(Hu - 5) + '" width="' + (w + 8) + '" height="4" fill="#b5ada2" stroke="' + O + '" stroke-width="0.8"/>';
    return s;
  }
  function oeil(x, y, style, cMen, allume) {
    var verre = allume ? '#ffd77a' : '#4d6577';
    if (style === 'chalet') return '<path d="M' + n1(x) + ' ' + n1(y + 5) + ' c-6 -5 -5 -11 0 -8 c5 -3 6 3 0 8z" fill="#3a2414"/>';
    if (style === 'colombages' || style === 'chaumiere') return '<rect x="' + n1(x - 6) + '" y="' + n1(y - 6) + '" width="12" height="11" fill="' + verre + '" stroke="' + nuance(cMen, -0.1) + '" stroke-width="2"/>';
    return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="6" fill="' + verre + '" stroke="#e9e1d4" stroke-width="2.2"/><circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="7.3" fill="none" stroke="' + O + '" stroke-width="0.8"/>';
  }

  // Clôture devant la parcelle (en v = 4.9), avec un portillon en u = 1 à 2 et le nom de l'habitant dessus
  function cloture(L, k, m, op) {
    var el = [], P = k.P, type = m.cloture, cM = teinte(m.menuis), V = 4.88;
    var bois = type === 'piquets' ? '#f3eadb' : '#9b6a3e';
    function segment(u0, u1) {
      var s = '';
      if (type === 'piquets') {
        s += boite(k, u0, V, 0.18, u1 - u0, 0.05, 0.06, bois, 0.6) + boite(k, u0, V, 0.42, u1 - u0, 0.05, 0.06, bois, 0.6);
        for (var u = u0 + 0.06; u < u1 - 0.05; u += 0.2) {
          var b = P(u, V + 0.06, 0), h = P(u, V + 0.06, 0.62);
          s += '<path d="M' + n1(b[0] - 2.3) + ' ' + n1(b[1]) + ' V' + n1(h[1] + 3) + ' l2.3 -3 l2.3 3 V' + n1(b[1] + 1.2) + 'Z" fill="' + bois + '" stroke="' + O + '" stroke-width="0.8"/>';
        }
      } else if (type === 'bois') {
        for (var u2 = u0 + 0.05; u2 < u1; u2 += 0.47) s += boite(k, u2, V - 0.03, 0, 0.09, 0.09, 0.66, nuance(bois, -0.15), 0.8);
        s += boite(k, u0, V, 0.24, u1 - u0, 0.06, 0.08, bois, 0.8) + boite(k, u0, V, 0.48, u1 - u0, 0.06, 0.08, bois, 0.8);
      } else if (type === 'haie') {
        s += boite(k, u0, V - 0.12, 0, u1 - u0, 0.3, 0.55, '#4f7a42', 5);
        for (var u3 = u0 + 0.15; u3 < u1; u3 += 0.3) { var c = P(u3, V + 0.03, 0.55); s += '<circle cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" r="6.2" fill="#4f7a42" stroke="' + O + '" stroke-width="0.9"/><circle cx="' + n1(c[0] - 1.6) + '" cy="' + n1(c[1] - 2) + '" r="2.2" fill="#6c9a58"/>'; }
      } else if (type === 'muret') {
        s += boite(k, u0, V - 0.1, 0, u1 - u0, 0.24, 0.4, '#b5ada2', 1.2) + boite(k, u0 - 0.02, V - 0.12, 0.4, u1 - u0 + 0.04, 0.28, 0.06, '#d3ccc2', 1);
        for (var u4 = u0 + 0.18; u4 < u1 - 0.1; u4 += 0.34) { var c4 = P(u4, V + 0.14, 0.2); s += '<path d="M' + n1(c4[0] - 4) + ' ' + n1(c4[1] - 3) + ' h7" stroke="#8a847f" stroke-width="0.8"/>'; }
      }
      return s;
    }
    if (type !== 'aucune') {
      el.push({ cle: cle(L, 0.5, V), s: segment(0.05, 0.95) });
      el.push({ cle: cle(L, 3, V), s: segment(2.05, 3.95) });
      // petite haie entre deux jardins (côté u = 0)
      el.push({ cle: cle(L, 0.08, 3.7), s: boite(k, 0, 2.7, 0, 0.16, V - 2.7, 0.42, '#557f47', 3) });
    }
    // portillon : deux poteaux, une traverse, le panneau du nom accroché dessous
    var cp = m.style === 'chalet' || type === 'bois' ? '#7a4a26' : type === 'piquets' ? '#f3eadb' : '#8a847f';
    var s = boite(k, 0.92, V - 0.04, 0, 0.12, 0.12, 1.32, cp, 1) + boite(k, 1.96, V - 0.04, 0, 0.12, 0.12, 1.32, cp, 1) + boite(k, 0.9, V - 0.05, 1.32, 1.2, 0.14, 0.1, nuance(cp, -0.15), 1);
    var mil = P(1.5, V + 0.02, 1.32);
    s += '<path d="M' + n1(mil[0] - 12) + ' ' + n1(mil[1] + 2) + ' v4 M' + n1(mil[0] + 12) + ' ' + n1(mil[1] - 4) + ' v4" stroke="' + O + '" stroke-width="1.1"/>';
    s += panneauNom(mil[0], mil[1] + 21, op.nom || '', op.moi);
    if (m.arche) s += arche(k, V);
    el.push({ cle: cle(L, 1.5, V + 0.05), s: '<g data-lot="' + L.n + '">' + s + '</g>' });
    return el;
  }
  function arche(k, V) {   // arceau de roses au-dessus du portillon
    var P = k.P, a = P(0.98, V + 0.02, 1.3), b = P(2.02, V + 0.02, 1.3), c = P(1.5, V + 0.02, 1.85), s = '<path d="M' + pt(a) + ' Q' + pt(c) + ' ' + pt(b) + '" fill="none" stroke="#4f7a42" stroke-width="5" stroke-linecap="round"/>';
    for (var q = 0; q <= 1; q += 0.2) { var x = a[0] + (b[0] - a[0]) * q, y = a[1] + (b[1] - a[1]) * q - Math.sin(q * Math.PI) * 18; s += rond(x, y, 2.4, q * 10 % 2 < 1 ? '#f783ac' : '#ff6b6b', 0.6); }
    return s;
  }
  function boiteLettres(k, courrier) {
    var P = k.P, s = cylindre(k, 0.5, 4.45, 0, 0.04, 0.82, '#6b4a35', null, false);
    s += boite(k, 0.32, 4.3, 0.82, 0.36, 0.3, 0.24, '#c94a3f', 2.5);
    var d = P(0.68, 4.45, 0.94);
    s += '<path d="M' + n1(d[0] - 2) + ' ' + n1(d[1] + 2) + ' h4" stroke="' + O + '" stroke-width="1.3"/>';
    // drapeau levé = du courrier attend
    var f = P(0.7, 4.36, courrier ? 1.25 : 1.0);
    s += courrier ? '<path d="M' + n1(f[0]) + ' ' + n1(f[1] + 10) + ' V' + n1(f[1]) + ' h7 l-2 3 l2 3 h-7" fill="#ffd43b" stroke="' + O + '" stroke-width="0.9"/>'
                  : '<path d="M' + n1(f[0]) + ' ' + n1(f[1]) + ' h8 v4 h-8z" fill="#ffd43b" stroke="' + O + '" stroke-width="0.9"/>';
    return s;
  }
  function terrainLibre(L, k) {
    var P = k.P, s = '';
    [[0.4, 0.5], [3.6, 0.5], [0.4, 4.6], [3.6, 4.6]].forEach(function (c) { s += boite(k, c[0] - 0.05, c[1] - 0.05, 0, 0.1, 0.1, 0.42, '#9b6a3e', 0.6); });
    s += ligne([P(0.4, 0.5, 0.36), P(3.6, 0.5, 0.36), P(3.6, 4.6, 0.36), P(0.4, 4.6, 0.36), P(0.4, 0.5, 0.36)], '#f3eadb', 1.2, ' stroke-dasharray="3 3"');
    var c = P(2, 2.6, 0.9);
    s += ligne([P(2, 2.6, 0), c], O, 2.4);
    return s + panneauNom(c[0], c[1] + 6, 'Libre');
  }

  // ---------- Décor du quartier (sol, place, coin, rue, portail, bois du fond) ----------
  function sol(defs, i0, j0, li, lj, mat, t) {
    var id = motifs(defs, mat, t);
    return g(matrice(proj(i0, j0), proj(i0 + 1, j0), proj(i0, j0 + 1)), '<rect width="' + n1(li * 40) + '" height="' + n1(lj * 40) + '" fill="url(#' + id + ')"/>');
  }
  // Le sol de tout le quartier (une seule couche, dessinée d'abord)
  function dessinerSol(Q, defs, nuit) {
    // une grande prairie : elle déborde du quartier pour que la caméra ne montre jamais de vide (sauf le ciel derrière les bois)
    var s = '', i0 = Q.iMin - 16, i1 = Q.iMax + 16, j0 = Q.jMin - 3, j1 = Q.jMax + 16;
    s += sol(defs, i0, j0, i1 - i0, j1 - j0, 'herbe', '#86ad6b');
    s += sol(defs, Q.iMin, RUE0, Q.iMax - Q.iMin + 1, RUE1 - RUE0, 'paves', '#c9b79a');
    s += ligne([proj(Q.iMin, RUE0), proj(Q.iMax + 1, RUE0)], '#8a7a60', 1.4) + ligne([proj(Q.iMin, RUE1), proj(Q.iMax + 1, RUE1)], '#8a7a60', 1.4);
    Q.placettes.forEach(function (P) {
      s += sol(defs, P.i0 + COIN, COIN, TAILLE - COIN, TAILLE - COIN, 'dalles', '#d8c7a6');
      s += ligne([proj(P.i0 + COIN, TAILLE), proj(P.i0 + COIN, COIN), proj(P.i0 + TAILLE, COIN), proj(P.i0 + TAILLE, TAILLE)], '#9c8a6a', 1.4);
    });
    Q.lots.forEach(function (L) {
      var a = versMonde(L, 0, VF), b = versMonde(L, 1, VF);
      // allée de la porte au portillon
      s += L.o ? sol(defs, L.i + VF, L.j + 1, 5 - VF, 1, 'paves', '#d9c9a8') : sol(defs, L.i + 1, L.j + VF, 1, 5 - VF, 'paves', '#d9c9a8');
    });
    return s;
  }
  // Un arbre agrandi (le kit dessine des arbres d'une case)
  function arbre(i, j, ech, t, defs) {
    var base = proj(i + 0.5, j + 0.5);
    return echelle(K.dessinObjet({ m: 'arbre', i: i, j: j, o: 0, t: t || 'foret' }, 2.6, {}), base, ech || 1.6);
  }
  // Les éléments fixes du décor (triés avec les maisons)
  function decors(Q, defs, nuit) {
    var el = [];
    function add(cleV, s, lueurs) { el.push({ cle: cleV, s: s, lueurs: lueurs || [] }); }
    // bois au fond : derrière le rang A de chaque placette et derrière le rang B de la première
    for (var i = -3; i <= Q.iMax + 2; i += 1.7) add(i - 1.6, arbre(i - 0.5, -2.1, 1.7 + ((i * 7) % 3) * 0.15, ((i * 3) % 2) < 1 ? 'foret' : 'sauge'));
    for (var j = -1; j < TAILLE; j += 1.7) add(j - 1.6, arbre(-2.1, j - 0.5, 1.7 + ((j * 5) % 3) * 0.15, 'foret'));
    for (var j2 = RUE1 + 1; j2 < BAS + 6; j2 += 2.3) add(j2 - 6, arbre(Q.iMin - 3, j2, 1.4 + ((j2 * 3) % 2) * 0.2, 'sauge'));
    Q.placettes.forEach(function (P, n) {
      var a = P.i0;
      // le coin : un grand tilleul et le panneau de la placette
      add(a + 3.5, arbre(a + 1.5, 1.5, 2.6, 'sauge'));
      var pn = proj(a + 4.3, 4.3);
      add(a + 8.7, ligne([proj(a + 4.3, 4.3), proj(a + 4.3, 4.3, 1.2)], O, 3) + ligne([proj(a + 4.3, 4.3), proj(a + 4.3, 4.3, 1.2)], '#7a4a26', 1.8) + panneauNom(pn[0], pn[1] - 30, P.nom, false));
      // entre deux placettes : une haie et deux arbres
      if (n < Q.placettes.length - 1) {   // entre deux placettes : un petit bois et une haie
        var h = a + TAILLE + 0.6, k0 = contexte(h, 0, 0);
        add(h + 7, boite(k0, 0, 1, 0, 0.8, TAILLE - 5, 0.7, '#4f7a42', 5));
        [[1.6, 0.6, 2], [1, 4, 1.7], [2.2, 7.5, 1.9], [1.2, 11, 1.6]].forEach(function (t, q) { add(h + t[0] + t[1] + 1, arbre(h + t[0], t[1], t[2], q % 2 ? 'sauge' : 'foret')); });
      }
      // la place : grande fontaine, massifs, lanternes, bancs
      decorsPlace(P).forEach(function (d) {
        if (d.m === 'fontaineG') { var c = proj(d.i + 1, d.j + 1); add(d.i + d.j + 2, echelle(K.dessinObjet({ m: 'fontaine', i: d.i + 0.5, j: d.j + 0.5, o: 0 }, 2.6, {}), c, 1.9)); return; }
        var mm = K.MEUBLES[d.m], ob = { m: d.m, i: d.i, j: d.j, o: d.o || 0, t: d.t };
        add(d.i + d.j + ((d.o ? mm.d : mm.w) || 1) / 2 + ((d.o ? mm.w : mm.d) || 1) / 2, K.dessinObjet(ob, 2.6, { nuit: nuit }), nuit && mm.lumiere ? [proj(d.i + 0.5, d.j + 0.5, mm.lumiere.z)] : []);
      });
    });
    // devant la rue : herbe fleurie, une barrière basse et quelques buissons
    var kb = contexte(0, RUE1 + 1.6, 0);
    add(RUE1 + 1.6 + 2, boite(kb, Q.iMin, 0, 0.2, Q.iMax - Q.iMin + 1, 0.06, 0.07, '#9b6a3e', 0.6) + boite(kb, Q.iMin, 0, 0.42, Q.iMax - Q.iMin + 1, 0.06, 0.07, '#9b6a3e', 0.6));
    for (var ib = Q.iMin + 0.5; ib < Q.iMax; ib += 1.6) {
      var b = proj(ib, RUE1 + 1.66);
      el.push({ cle: ib + RUE1 + 1.7, s: '<path d="M' + n1(b[0]) + ' ' + n1(b[1]) + ' v-20" stroke="' + O + '" stroke-width="3.2"/><path d="M' + n1(b[0]) + ' ' + n1(b[1]) + ' v-20" stroke="#7a4a26" stroke-width="1.8"/>' });
    }
    for (var ic = Q.iMin + 2; ic < Q.iMax; ic += 3.3) {
      var c2 = proj(ic + 0.5, RUE1 + 2.6), col = ['#ff6b6b', '#ffd43b', '#b197fc', '#f783ac'][Math.round(ic) % 4];
      add(ic + RUE1 + 3, '<ellipse cx="' + n1(c2[0]) + '" cy="' + n1(c2[1] - 6) + '" rx="15" ry="10" fill="#4f7a42" stroke="' + O + '" stroke-width="1.1"/><ellipse cx="' + n1(c2[0] - 4) + '" cy="' + n1(c2[1] - 9) + '" rx="6" ry="4" fill="#6c9a58"/>' +
        rond(c2[0] - 7, c2[1] - 8, 2.2, col, 0.6) + rond(c2[0] + 4, c2[1] - 11, 2.2, col, 0.6) + rond(c2[0] + 8, c2[1] - 5, 2.2, col, 0.6));
    }
    // le portail : une arche de pierre au bout de la rue, la brume de la Vallée derrière
    add(-3 + RUE0 + 1.5, portail(Q));
    return el;
  }
  function portail(Q) {
    var i = Q.iMin + 0.4, k = contexte(i, RUE0, 1), P = k.P, s = '';
    // voile de brume (plan i = constant, face +i)
    s += g(plan(k, [0.2, 0, 2.2], [1, 0, 0], [0, 0, -1]), '<path d="M0 88 V22 Q60 -26 120 22 V88Z" fill="#cfe3ec" opacity="0.75"/><path d="M14 80 Q60 40 106 80 M20 60 Q60 20 100 60" stroke="#fff" stroke-width="3" fill="none" opacity="0.7"/>');
    s += boite(k, -0.25, -0.2, 0, 0.45, 0.45, 2.25, '#a8a29a', 1.5) + boite(k, 2.8, -0.2, 0, 0.45, 0.45, 2.25, '#a8a29a', 1.5);
    s += g(plan(k, [-0.25, 0.25, 2.95], [1, 0, 0], [0, 0, -1]), '<path d="M0 30 V12 Q70 -18 140 12 V30 H122 V20 Q70 0 18 20 V30Z" fill="#bdb7b0" stroke="' + O + '" stroke-width="1.8"/><path d="M40 6 l4 8 M70 0 v9 M100 6 l-4 8" stroke="#8a847f" stroke-width="1.4"/>');
    var c = P(1.5, 0.25, 2.75);
    return s + panneauNom(c[0], c[1] + 4, 'Vers la Vallée');
  }

  // Le compagnon (le mien ou celui d'un ami) posé au centre d'une case
  function compagnon(i, j, svg, ech, extra) {
    var b = proj(i, j), w = 200 * ech, h = 216 * ech;
    return '<g class="qd-cp' + (extra && extra.classe ? ' ' + extra.classe : '') + '"' + (extra && extra.style ? ' style="' + extra.style + '"' : '') + '><ellipse cx="' + n1(b[0]) + '" cy="' + n1(b[1]) + '" rx="' + n1(w * 0.28) + '" ry="' + n1(w * 0.12) + '" fill="#000" opacity="0.22"/>' +
      '<svg x="' + n1(b[0] - w / 2) + '" y="' + n1(b[1] - h * 0.95) + '" width="' + n1(w) + '" height="' + n1(h) + '" viewBox="0 -6 200 216" overflow="visible"><g class="sens' + (extra && extra.gauche ? ' gauche' : '') + '">' + svg + '</g></svg></g>';
  }

  // ---------- Toute la scène ----------
  // habitants : [{ n (parcelle), nom, maison, present, courrier, cp (svg du compagnon devant chez lui), moi }]
  // Rend { defs, sol, elements: [{ cle, s, lueurs, x0, y0, x1, y1 }] } : la page trie et ne garde que ce qui est à l'écran
  function scene(Q, habitants, op) {
    op = op || {};
    var defs = {}, el = [], parLot = {};
    (habitants || []).forEach(function (h) { parLot[h.n] = h; });
    var solS = dessinerSol(Q, defs, op.nuit);
    el = el.concat(decors(Q, defs, op.nuit));
    Q.lots.forEach(function (L) {
      var h = parLot[L.n];
      if (!h && L.placette === Q.placettes.length - 1 && L.n >= Q.nb) { el = el.concat(dessinerParcelle(L, null, {}, defs)); return; }
      if (!h) return;
      el = el.concat(dessinerParcelle(L, h.maison, { nom: h.nom, present: h.present, courrier: h.courrier, moi: h.moi, nuit: op.nuit, cp: h.cp, id: L.n }, defs));
    });
    return { defs: Object.keys(defs).map(function (k) { return defs[k]; }).join(''), sol: solS, elements: el };
  }
  // Point de l'écran → case du sol
  function caseEn(x, y) { var c = K.versSol(x, y); return { i: Math.floor(c.i), j: Math.floor(c.j) }; }

  return {
    LOT_W: LOT_W, LOT_D: LOT_D, COIN: COIN, TAILLE: TAILLE, PAS: PAS, RUE0: RUE0, RUE1: RUE1, BAS: BAS, STYLES: STYLES, TOITS: TOITS, CLOTURES: CLOTURES,
    PLACES_JARDIN: PLACES_JARDIN, NOMS_PLACETTES: NOMS_PLACETTES,
    quartier: quartier, cases: cases, versMonde: versMonde, devantPorte: devantPorte, lotEn: lotEn, chemin: chemin4, maison: maison,
    scene: scene, compagnon: compagnon, caseEn: caseEn, proj: proj
  };
})();
if (typeof module !== 'undefined') module.exports = QQ;
