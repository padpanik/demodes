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
  // Une placette : un coin (6 × 6, son grand arbre et son panneau), deux rangs de 3 parcelles en L autour d'une place pavée.
  // Rang A : le long de i, façades tournées vers +j ; rang B : le long de j, façades tournées vers +i.
  // On ne voit donc que des façades, jamais l'arrière d'une maison. La rue passe devant toutes les placettes (j de 18 à 21).
  // 4.31 (demandé par l'utilisateur) : une rangée de plus au jardin de devant (LOT_D = 6), donc un coin de 6 × 6
  var LOT_W = 4, LOT_D = 6, COIN = 6, PAR_RANG = 3, TAILLE = COIN + LOT_W * PAR_RANG, PAS = TAILLE + 4;
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
  function decorsPlace(P, fete) {
    var a = P.i0, l = [
      { m: 'fontaineG', i: a + 11, j: 11, w: 2, d: 2 },
      { m: 'massif', i: a + 10, j: 10 }, { m: 'massif', i: a + 13, j: 10, t: 'prune' }, { m: 'massif', i: a + 10, j: 13, t: 'moutarde' }, { m: 'massif', i: a + 13, j: 13 },
      { m: 'lanterne', i: a + 8, j: 8 }, { m: 'lanterne', i: a + 16, j: 8 }, { m: 'lanterne', i: a + 8, j: 16 }, { m: 'lanterne', i: a + 16, j: 16 },
      { m: 'banc', i: a + 11, j: 15, o: 0 }, { m: 'banc', i: a + 15, j: 11, o: 1 }
    ];
    var F = FETES_DEHORS[fete && fete.id];
    if (F && F.place) {   // un petit décor devant, un grand au fond de la place (sapin et marché de Noël, kiosque…)
      l.push({ m: F.place[0], i: a + 8, j: 12, grand: 2.1 });
      l.push({ m: F.place[1], i: a + 12, j: 7, w: 2, d: 2, grand: 1.9, stand: F.stand });
    }
    return l;
  }
  function cases(Q, fete) {
    var ok = {}, bloque = {};
    function mettre(i, j) { ok[i + ',' + j] = 1; }
    for (var i = -3; i <= Q.iMax; i++) for (var j = RUE0; j < RUE1; j++) mettre(i, j);
    Q.placettes.forEach(function (P) {
      for (var i = P.i0 + COIN; i < P.i0 + TAILLE; i++) for (var j = COIN; j < TAILLE; j++) mettre(i, j);
      decorsPlace(P, fete).forEach(function (d) { for (var a = 0; a < (d.w || 1); a++) for (var b = 0; b < (d.d || 1); b++) bloque[(d.i + a) + ',' + (d.j + b)] = 1; });
    });
    Q.lots.forEach(function (L) { [3, 4, 5].forEach(function (v) { var c = versMonde(L, 1, v); mettre(c[0], c[1]); }); });
    Object.keys(bloque).forEach(function (c) { delete ok[c]; });
    return ok;
  }
  // La porte d'une parcelle : la case devant elle (1re case de l'allée) et la direction de la maison
  function devantPorte(L) { var c = versMonde(L, 1, 3); return { i: c[0], j: c[1], dir: L.o ? [-1, 0] : [0, -1] }; }
  function lotEn(Q, i, j) {
    return Q.lots.filter(function (L) { return [3, 4, 5].some(function (v) { var c = versMonde(L, 1, v); return c[0] === i && c[1] === j; }); })[0] || null;
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
    var d = r.deco && typeof r.deco === 'object' ? r.deco : {}; r.deco = {};
    Object.keys(ZONES_DECO).forEach(function (z) { if (d[z] && DECOS_MAISON[z][d[z]]) r.deco[z] = d[z]; });
    return r;
  }
  // Places du jardin de devant (repère local de la parcelle) : l'allée est en u = 1, la boîte aux lettres en (0, 4)
  var PLACES_JARDIN = [[0, 3], [0, 4], [3, 3], [3, 4], [2, 4], [2, 5], [3, 5]];   // la case (2, 3), devant la porte, est le perron du compagnon ; (0, 5) la boîte aux lettres

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
    if (m.deco && m.deco.fenetres) cote += decoFenetre(m.deco.fenetres, Wd / 2, Hu * 0.38, 16, 18, op.nuit);
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
    var FD = op.fete && FETES_DEHORS[op.fete.id], D = m.deco || {};
    if (D.porte) face += decorPorte(D.porte, porteX, Hu - 5 - Math.min(38, Hu - 14), ['#e03131', '#f4c430', '#4c6ef5']);
    if (D.fenetres) fx.forEach(function (f) { var w = decoFenetre(D.fenetres, f[0], Hu * 0.38, f[1], 19, op.nuit); face += w; if (op.nuit && /bougies|citrouilles/.test(D.fenetres)) fen.push([f[0], Hu * 0.38 + 12]); });
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
    if (FD && FD.neige) {   // Noël : de la neige sur le pan avant et des glaçons au bord
      var Nb1 = [E1[0] + (R1[0] - E1[0]) * 0.55, E1[1] + (R1[1] - E1[1]) * 0.55], Nb2 = [E2[0] + (R2[0] - E2[0]) * 0.55, E2[1] + (R2[1] - E2[1]) * 0.55];
      var Nh1 = [E1[0] + (R1[0] - E1[0]) * 0.97, E1[1] + (R1[1] - E1[1]) * 0.97], Nh2 = [E2[0] + (R2[0] - E2[0]) * 0.97, E2[1] + (R2[1] - E2[1]) * 0.97];
      var bord = [];
      for (var qn = 8; qn >= 0; qn--) { var tq = qn / 8; bord.push(n1(Nb1[0] + (Nb2[0] - Nb1[0]) * tq) + ' ' + n1(Nb1[1] + (Nb2[1] - Nb1[1]) * tq + (qn % 2 ? 3 : -1))); }
      s += '<path d="M' + pt(Nh1) + ' L' + pt(Nh2) + ' L' + bord.join(' L') + 'Z" fill="#f8fbff" stroke="#9fb4c7" stroke-width="0.9" stroke-linejoin="round" opacity="0.96"/>';
      for (var qg = 0.1; qg < 0.95; qg += 0.13) { var ga = [E1[0] + (E2[0] - E1[0]) * qg, E1[1] + (E2[1] - E1[1]) * qg + ep * 34]; s += '<path d="M' + n1(ga[0] - 1.6) + ' ' + n1(ga[1]) + ' l1.6 ' + (4 + (qg * 37 % 3)).toFixed(1) + ' 1.6 -' + (4 + (qg * 37 % 3)).toFixed(1) + 'z" fill="#e7f5ff" stroke="#9fb4c7" stroke-width="0.5"/>'; }
    }
    if (D.toit) { var dt = decoToit(D.toit, [E1[0], E1[1] + ep * 34 + 1], [E2[0], E2[1] + ep * 34 + 1], [R2[0], R2[1] + ep * 34 + 1], op.nuit); s += dt.s; if (op.nuit) dt.l.forEach(function (q) { lueurs.push(q); }); }
    s += '</g>';
    el.push({ cle: cle(L, 2, 1.4), s: s, lueurs: op.nuit ? lueurs : [], lot: L.n });
    // --- clôture, portillon et nom ---
    el = el.concat(cloture(L, k, m, op));
    // --- boîte aux lettres ---
    el.push({ cle: cle(L, 0.5, 5.45), s: boiteLettres(k, op.courrier) });
    // --- objets du jardin ---
    m.jardin.forEach(function (ob) {
      if (OBJETS_FETE[ob.m]) {
        var wf = P(ob.u + 0.5, ob.v + 0.5, 0), nf = ob.m.slice(2);
        el.push({ cle: cle(L, ob.u + 0.5, ob.v + 0.5), s: '<g class="qd-obj" data-lot="' + L.n + '">' + objetFete(nf, wf, op.nuit, 1, op.fete) + '</g>', lueurs: op.nuit && (nf === 'citrouille' || nf === 'lampions' || nf === 'sapin') ? [P(ob.u + 0.5, ob.v + 0.5, 0.6)] : [] });
        return;
      }
      if (!K.MEUBLES[ob.m]) return;
      var w = versMonde(L, ob.u, ob.v), o2 = L.o ? (ob.o ? 0 : 1) : (ob.o || 0);
      var x = { m: ob.m, i: w[0], j: w[1], o: o2, t: ob.t };
      var mm = K.MEUBLES[ob.m], lu = mm.w || 1, lv = mm.d || 1;
      el.push({ cle: cle(L, ob.u + lu / 2, ob.v + lv / 2), s: '<g class="qd-obj" data-lot="' + L.n + '">' + K.dessinObjet(x, 2.6, { nuit: op.nuit }) + '</g>', lueurs: op.nuit && mm.lumiere ? [P(ob.u + 0.5, ob.v + 0.5, mm.lumiere.z || 1)] : [] });
    });
    if (D.porte === 'citrouille') el.push({ cle: cle(L, 2.6, 2.9), s: objetFete('citrouille', P(2.55, 2.85, 0), op.nuit, 0.85, op.fete), lueurs: op.nuit ? [P(2.55, 2.85, 0.4)] : [] });
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
    var el = [], P = k.P, type = m.cloture, cM = teinte(m.menuis), V = LOT_D - 0.12;
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
    var P = k.P, s = cylindre(k, 0.5, 5.45, 0, 0.04, 0.82, '#6b4a35', null, false);
    s += boite(k, 0.32, 5.3, 0.82, 0.36, 0.3, 0.24, '#c94a3f', 2.5);
    var d = P(0.68, 5.45, 0.94);
    s += '<path d="M' + n1(d[0] - 2) + ' ' + n1(d[1] + 2) + ' h4" stroke="' + O + '" stroke-width="1.3"/>';
    // drapeau levé = du courrier attend
    var f = P(0.7, 5.36, courrier ? 1.25 : 1.0);
    s += courrier ? '<path d="M' + n1(f[0]) + ' ' + n1(f[1] + 10) + ' V' + n1(f[1]) + ' h7 l-2 3 l2 3 h-7" fill="#ffd43b" stroke="' + O + '" stroke-width="0.9"/>'
                  : '<path d="M' + n1(f[0]) + ' ' + n1(f[1]) + ' h8 v4 h-8z" fill="#ffd43b" stroke="' + O + '" stroke-width="0.9"/>';
    return s;
  }
  function terrainLibre(L, k) {
    var P = k.P, s = '';
    [[0.4, 0.5], [3.6, 0.5], [0.4, 5.6], [3.6, 5.6]].forEach(function (c) { s += boite(k, c[0] - 0.05, c[1] - 0.05, 0, 0.1, 0.1, 0.42, '#9b6a3e', 0.6); });
    s += ligne([P(0.4, 0.5, 0.36), P(3.6, 0.5, 0.36), P(3.6, 5.6, 0.36), P(0.4, 5.6, 0.36), P(0.4, 0.5, 0.36)], '#f3eadb', 1.2, ' stroke-dasharray="3 3"');
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
      s += L.o ? sol(defs, L.i + VF, L.j + 1, LOT_D - VF, 1, 'paves', '#d9c9a8') : sol(defs, L.i + 1, L.j + VF, 1, LOT_D - VF, 'paves', '#d9c9a8');
    });
    return s;
  }
  // Un arbre agrandi (le kit dessine des arbres d'une case)
  function arbre(i, j, ech, t, defs) {
    var base = proj(i + 0.5, j + 0.5);
    return echelle(K.dessinObjet({ m: 'arbre', i: i, j: j, o: 0, t: t || 'foret' }, 2.6, {}), base, ech || 1.6);
  }
  // Les éléments fixes du décor (triés avec les maisons)
  function decors(Q, defs, nuit, fete) {
    var el = [];
    function add(cleV, s, lueurs) { el.push({ cle: cleV, s: s, lueurs: lueurs || [] }); }
    // bois au fond : derrière le rang A de chaque placette et derrière le rang B de la première
    for (var i = -3; i <= Q.iMax + 2; i += 1.7) add(i - 1.6, arbre(i - 0.5, -2.1, 1.7 + ((i * 7) % 3) * 0.15, ((i * 3) % 2) < 1 ? 'foret' : 'sauge'));
    for (var j = -1; j < TAILLE; j += 1.7) add(j - 1.6, arbre(-2.1, j - 0.5, 1.7 + ((j * 5) % 3) * 0.15, 'foret'));
    // derrière le portail, la lisière : des arbres en quinconce (sinon on verrait une prairie vide)
    for (var ia = -5; ia >= -14; ia -= 2.2) for (var ja = -2 + (Math.round(-ia) % 2) * 1.1; ja < RUE0 - 1; ja += 2.4) add(ia + ja + 1, arbre(ia, ja, 1.5 + ((ja * 7 + ia) % 3) * 0.12, (Math.round(ia + ja) % 2) ? 'sauge' : 'foret'));
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
        [[1.6, 0.4, 2], [2.4, 2.4, 1.5], [1.4, 11.5, 1.6], [2.2, 14, 1.3]].forEach(function (t, q) { add(h + t[0] + t[1] + 1, arbre(h + t[0], t[1], t[2], q % 2 ? 'sauge' : 'foret')); });
      }
      // la place : grande fontaine, massifs, lanternes, bancs
      decorsPlace(P, fete).forEach(function (d) {
        if (d.grand) {
          var ci = d.i + (d.w || 1) / 2, cj = d.j + (d.d || 1) / 2, lum = { sapin: 1.6, citrouilles: 0.4, lampions: 1.2, kiosque: 1.4, stand: 1.1, horloge: 2 }[d.m];
          add(ci + cj, objetFete(d.m, proj(ci, cj), nuit, d.grand, fete, d.stand), nuit && lum ? [proj(ci, cj, lum)] : []);
          return;
        }
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

  // ---------- Les fêtes dehors (4.31, revu en 4.32 à la demande de l'utilisateur) ----------
  // La place se pare toute seule pendant une fête (CP.feteDu) : deux décors à elle (sapin et marché de Noël, kiosque à musique,
  // épouvantail…) et un ciel animé (flocons, chauves-souris, notes, feux d'artifice…). Les maisons et les jardins, eux, ne changent
  // que si leur habitant les décore (`maison.deco`, voir DECOS_MAISON) : chacun choisit sa déco.
  // `op.fete` = { id, guirlande } (l'objet de CP.feteDu suffit). `neige` : le temps qu'il fait, pour tout le monde.
  var FETES_DEHORS = {
    'nouvel-an': { place: ['lampions', 'horloge'], ciel: 'feux', neige: true },
    chandeleur: { place: ['lampions', 'stand'], stand: 'crepes' },
    'saint-valentin': { place: ['coeur', 'arche'], ciel: 'coeurs' },
    'saint-patrick': { place: ['lampions', 'arcenciel'] },
    paques: { place: ['oeufs', 'lapin'], ciel: 'papillons' },
    musique: { place: ['lampions', 'kiosque'], ciel: 'notes' },
    ete: { place: ['parasol', 'stand'], stand: 'glaces', ciel: 'papillons' },
    halloween: { place: ['citrouilles', 'epouvantail'], ciel: 'chauves' },
    noel: { place: ['sapin', 'stand'], stand: 'vin', ciel: 'flocons', neige: true }
  };
  // La déco de fête d'une maison, choisie par son habitant : une pour la porte, une pour le toit, une pour les fenêtres.
  // On l'achète pendant sa fête, on la garde ensuite ; elle reste en place tant qu'on ne la range pas.
  var DECOS_MAISON = {
    porte: {
      couronne: { nom: 'Couronne de houx', fetes: ['noel'], prix: 6 },
      etoile: { nom: 'Étoile dorée', fetes: ['nouvel-an', 'noel'], prix: 5 },
      chandelle: { nom: 'Lanterne à bougie', fetes: ['chandeleur', 'noel'], prix: 5 },
      coeur: { nom: 'Grand cœur', fetes: ['saint-valentin'], prix: 5 },
      trefle: { nom: 'Trèfle porte-bonheur', fetes: ['saint-patrick'], prix: 5 },
      oeuf: { nom: 'Œuf peint', fetes: ['paques'], prix: 5 },
      note: { nom: 'Notes de musique', fetes: ['musique'], prix: 5 },
      fleurs: { nom: 'Couronne de fleurs', fetes: ['ete', 'paques'], prix: 6 },
      citrouille: { nom: 'Citrouille sculptée', fetes: ['halloween'], prix: 6 }
    },
    toit: {
      lumieres: { nom: 'Guirlande lumineuse', fetes: ['noel', 'nouvel-an'], prix: 12 },
      fanions: { nom: 'Fanions', fetes: ['musique', 'ete', 'saint-patrick'], prix: 8 },
      chauves: { nom: 'Chauves-souris', fetes: ['halloween'], prix: 10 },
      coeurs: { nom: 'Fil de cœurs', fetes: ['saint-valentin'], prix: 10 },
      oeufs: { nom: 'Œufs suspendus', fetes: ['paques'], prix: 10 },
      lampions: { nom: 'Lampions', fetes: ['chandeleur', 'nouvel-an', 'musique'], prix: 10 }
    },
    fenetres: {
      bougies: { nom: 'Bougies', fetes: ['noel', 'chandeleur', 'nouvel-an'], prix: 8 },
      etoiles: { nom: 'Étoiles de papier', fetes: ['noel', 'nouvel-an'], prix: 6 },
      citrouilles: { nom: 'Citrouilles qui luisent', fetes: ['halloween'], prix: 8 },
      coeurs: { nom: 'Cœurs aux carreaux', fetes: ['saint-valentin'], prix: 6 },
      papillons: { nom: 'Papillons de papier', fetes: ['paques', 'ete', 'musique'], prix: 6 },
      trefles: { nom: 'Trèfles aux carreaux', fetes: ['saint-patrick'], prix: 6 }
    }
  };
  var ZONES_DECO = { porte: 'Porte', toit: 'Toit', fenetres: 'Fenêtres' };
  // Objets de fête pour le jardin : on les achète pendant leur fête, on les garde ensuite
  var OBJETS_FETE = {
    'f:sapin': { nom: 'Sapin de Noël', fete: 'noel', prix: 25 },
    'f:bonhomme': { nom: 'Bonhomme de neige', fete: 'noel', prix: 15 },
    'f:citrouille': { nom: 'Citrouille', fete: 'halloween', prix: 12 },
    'f:oeufs': { nom: 'Œufs peints', fete: 'paques', prix: 12 },
    'f:coeur': { nom: 'Cœur fleuri', fete: 'saint-valentin', prix: 15 },
    'f:parasol': { nom: 'Parasol', fete: 'ete', prix: 15 },
    'f:lampions': { nom: 'Lampions', fete: 'nouvel-an', prix: 12 }
  };
  function couleursFete(fete) { return (fete && fete.guirlande && fete.guirlande.length) ? fete.guirlande : ['#e03131', '#f4c430', '#4c6ef5']; }
  // Une guirlande de fanions entre deux points de l'écran (elle pend un peu)
  function fanions(a, b, cols, nuit, flou) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy), n = Math.max(3, Math.round(L / 13)), creux = Math.min(26, L * 0.12);
    var pt2 = function (t) { return [a[0] + dx * t, a[1] + dy * t + creux * 4 * t * (1 - t)]; };
    var s = '<path d="M' + pt(a) + ' Q' + n1(a[0] + dx / 2) + ' ' + n1(a[1] + dy / 2 + creux * 2) + ' ' + pt(b) + '" stroke="' + O + '" stroke-width="1" fill="none" opacity="0.7"/>';
    for (var q = 1; q < n; q++) {
      var p = pt2(q / n), c = cols[q % cols.length];
      if (nuit) s += '<circle cx="' + n1(p[0]) + '" cy="' + n1(p[1] + 2) + '" r="2.6" fill="' + c + '"/><circle cx="' + n1(p[0]) + '" cy="' + n1(p[1] + 2) + '" r="6" fill="' + c + '" opacity="0.28"/>';
      else s += '<path d="M' + n1(p[0] - 4.5) + ' ' + n1(p[1]) + ' L' + n1(p[0] + 4.5) + ' ' + n1(p[1]) + ' L' + n1(p[0]) + ' ' + n1(p[1] + 9) + 'Z" fill="' + c + '" stroke="' + O + '" stroke-width="0.7" stroke-linejoin="round"/>';
    }
    return s;
  }
  // Le ciel de la fête au-dessus de chaque place (animé par la page : classes qd-flotte, qd-tombe, qd-feu)
  function cielFete(Q, fete, nuit) {
    var F = FETES_DEHORS[fete.id], el = [];
    if (!F || !F.ciel) return el;
    var cols = couleursFete(fete);
    Q.placettes.forEach(function (P) {
      var a = P.i0, s = '';
      for (var q = 0; q < 9; q++) {
        var di = 7 + (q * 37 % 11), dj = 7 + (q * 53 % 11), h = 3.2 + (q * 29 % 7) * 0.45, p = proj(a + di, dj, h), d = ((q * 0.7) % 3).toFixed(1);
        var c = cols[q % cols.length], t = '';
        if (F.ciel === 'flocons') t = '<path d="M0 -5 V5 M-4.3 -2.5 L4.3 2.5 M-4.3 2.5 L4.3 -2.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>';
        else if (F.ciel === 'chauves') t = '<path d="M0 0 q-4 -5 -9 -3 q2 2 1 5 q3 -2 4 0 q2 -3 4 -2 q2 -1 4 2 q1 -2 4 0 q-1 -3 1 -5 q-5 -2 -9 3z" fill="#2b1d14"/>' + (nuit ? '<circle cx="-1.5" cy="-1" r="0.8" fill="#ffd43b"/><circle cx="1.5" cy="-1" r="0.8" fill="#ffd43b"/>' : '');
        else if (F.ciel === 'coeurs') t = '<path d="M0 5 C-7 0 -6 -6 -2 -5 Q0 -4.5 0 -2.5 Q0 -4.5 2 -5 C6 -6 7 0 0 5Z" fill="' + (q % 2 ? '#f06595' : '#ff8fab') + '" stroke="' + O + '" stroke-width="0.7"/>';
        else if (F.ciel === 'notes') t = '<path d="M-1 4 V-5 l6 -1.6 V2.6" stroke="' + O + '" stroke-width="1.4" fill="none"/>' + rond(-3, 4, 2.4, c, 0.6) + rond(3, 2.6, 2.4, c, 0.6);
        else if (F.ciel === 'papillons') t = '<path d="M0 0 q-6 -7 -8 -1 q2 4 8 1 q6 3 8 -1 q-2 -6 -8 1z" fill="' + c + '" stroke="' + O + '" stroke-width="0.7"/><path d="M0 -3 V3" stroke="' + O + '" stroke-width="1"/>';
        else if (F.ciel === 'feux') {
          if (!nuit) t = '<rect x="-2" y="-1" width="4" height="2" fill="' + c + '" transform="rotate(' + (q * 40) + ')"/>';   // des confettis le jour
          else { for (var r = 0; r < 10; r++) { var an = r * Math.PI / 5; t += '<path d="M' + n1(Math.cos(an) * 4) + ' ' + n1(Math.sin(an) * 4) + ' L' + n1(Math.cos(an) * 13) + ' ' + n1(Math.sin(an) * 13) + '" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round"/>'; } t += '<circle r="2.5" fill="#fff"/>'; }
        }
        var cl = F.ciel === 'flocons' ? 'qd-tombe' : F.ciel === 'feux' && nuit ? 'qd-feu' : 'qd-flotte';
        s += '<g transform="translate(' + n1(p[0]) + ' ' + n1(p[1]) + ')"><g class="' + cl + '" style="animation-delay:-' + d + 's">' + t + '</g></g>';
      }
      el.push({ cle: a + 30, s: '<g pointer-events="none">' + s + '</g>' });
    });
    return el;
  }
  // Les décorations de fête dessinées à plat sur l'écran, posées au point b (le pied), à l'échelle e
  function objetFete(m, b, nuit, e, fete, stand) {
    e = e || 1; var x = b[0], y = b[1], s = '<g transform="translate(' + n1(x) + ' ' + n1(y) + ') scale(' + e + ')">', cols = couleursFete(fete);
    var ombre = function (rx) { return '<ellipse cx="0" cy="0" rx="' + rx + '" ry="' + n1(rx * 0.45) + '" fill="#000" opacity="0.2"/>'; };
    var R = function (cx, cy, r, f, sw) { return '<circle cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + r + '" fill="' + f + '" stroke="' + O + '" stroke-width="' + (sw == null ? 0.9 : sw) + '"/>'; };
    if (m === 'sapin') {
      s += ombre(15) + '<rect x="-3" y="-9" width="6" height="9" fill="#7a4a26" stroke="' + O + '" stroke-width="1"/>';
      [[-9, 17, 13], [-21, 14, 11], [-31, 10, 9]].forEach(function (t) { s += '<path d="M' + -t[1] + ' ' + t[0] + ' L0 ' + (t[0] - t[2] - 8) + ' L' + t[1] + ' ' + t[0] + 'Z" fill="#2f6b3a" stroke="' + O + '" stroke-width="1.2" stroke-linejoin="round"/><path d="M0 ' + (t[0] - t[2] - 8) + ' L' + t[1] + ' ' + t[0] + ' L' + n1(t[1] * 0.2) + ' ' + t[0] + 'Z" fill="#1f4d29" opacity="0.6"/>'; });
      [[-8, -13], [7, -15], [-5, -24], [6, -27], [0, -35], [-11, -11]].forEach(function (p, q) { var c = ['#e03131', '#f4c430', '#4c6ef5'][q % 3]; s += R(p[0], p[1], 2.1, c, 0.6) + (nuit ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="' + c + '" opacity="0.35"/>' : ''); });
      s += '<path d="M0 -55 l2.3 4.8 5.2 0.6 -3.9 3.5 1.1 5.1 -4.7 -2.6 -4.7 2.6 1.1 -5.1 -3.9 -3.5 5.2 -0.6z" fill="#fcc419" stroke="' + O + '" stroke-width="0.9"/>';
    } else if (m === 'bonhomme') {
      s += ombre(11) + R(0, -9, 10, '#fbfcfd', 1.2) + R(0, -24, 7, '#fbfcfd', 1.2);
      s += '<path d="M-7 -18 Q0 -14 7 -18 L7 -15 Q0 -11 -7 -15Z M4 -16 l3 7 -3 0z" fill="#e03131" stroke="' + O + '" stroke-width="0.7"/>';
      s += '<rect x="-6" y="-33" width="12" height="2.4" fill="#343a40"/><rect x="-4" y="-41" width="8" height="8" fill="#343a40" stroke="' + O + '" stroke-width="0.7"/>';
      s += '<circle cx="-2.5" cy="-25.5" r="0.9" fill="' + O + '"/><circle cx="2.5" cy="-25.5" r="0.9" fill="' + O + '"/><path d="M0 -23.5 l6 1.2 -6 1.2z" fill="#f76707"/>';
      s += R(0, -11, 1, O, 0) + R(0, -6, 1, O, 0) + '<path d="M-9 -12 l-7 -6 M9 -12 l7 -6" stroke="#7a4a26" stroke-width="1.6" stroke-linecap="round"/>';
    } else if (m === 'citrouille' || m === 'citrouilles') {
      var une = function (cx, cy, r) {
        var t = '<ellipse cx="' + cx + '" cy="' + n1(cy - r * 0.8) + '" rx="' + n1(r * 1.25) + '" ry="' + n1(r * 0.85) + '" fill="#f76707" stroke="' + O + '" stroke-width="1.1"/>';
        t += '<path d="M' + n1(cx - r * 0.45) + ' ' + n1(cy - r * 1.6) + ' Q' + n1(cx - r * 0.7) + ' ' + n1(cy - r * 0.8) + ' ' + n1(cx - r * 0.45) + ' ' + n1(cy) + ' M' + n1(cx + r * 0.45) + ' ' + n1(cy - r * 1.6) + ' Q' + n1(cx + r * 0.7) + ' ' + n1(cy - r * 0.8) + ' ' + n1(cx + r * 0.45) + ' ' + n1(cy) + '" stroke="#c2410c" stroke-width="1" fill="none"/>';
        t += '<path d="M' + cx + ' ' + n1(cy - r * 1.6) + ' q1 -3 3 -4" stroke="#4f7a42" stroke-width="2" fill="none" stroke-linecap="round"/>';
        var yeux = nuit ? '#ffe066' : '#5c2a00';
        t += '<path d="M' + n1(cx - r * 0.6) + ' ' + n1(cy - r * 1.0) + ' l' + n1(r * 0.3) + ' -' + n1(r * 0.35) + ' l' + n1(r * 0.3) + ' ' + n1(r * 0.35) + 'z M' + n1(cx + r * 0.0) + ' ' + n1(cy - r * 1.0) + ' l' + n1(r * 0.3) + ' -' + n1(r * 0.35) + ' l' + n1(r * 0.3) + ' ' + n1(r * 0.35) + 'z M' + n1(cx - r * 0.55) + ' ' + n1(cy - r * 0.55) + ' q' + n1(r * 0.55) + ' ' + n1(r * 0.4) + ' ' + n1(r * 1.1) + ' 0 q-' + n1(r * 0.55) + ' ' + n1(r * 0.15) + ' -' + n1(r * 1.1) + ' 0z" fill="' + yeux + '"/>';
        if (nuit) t += '<circle cx="' + cx + '" cy="' + n1(cy - r * 0.8) + '" r="' + n1(r * 2.2) + '" fill="#ffa94d" opacity="0.22"/>';
        return t;
      };
      s += ombre(m === 'citrouilles' ? 17 : 10);
      s += m === 'citrouilles' ? une(-8, -1, 6) + une(9, 0, 5.5) + une(1, -9, 6.5) : une(0, 0, 7);
    } else if (m === 'oeufs') {
      s += '<ellipse cx="0" cy="-2" rx="17" ry="6" fill="#c9a26b" stroke="' + O + '" stroke-width="1"/><path d="M-15 -3 q4 -3 8 0 q4 -3 8 0 q4 -3 8 0 q4 -3 7 0" stroke="#9b6a3e" stroke-width="1" fill="none"/>';
      [[-8, -4, 5.5, '#f783ac'], [7, -4, 5.5, '#4dabf7'], [0, -6, 6.5, '#ffd43b']].forEach(function (o, q) {
        s += '<ellipse cx="' + o[0] + '" cy="' + n1(o[1] - o[2]) + '" rx="' + n1(o[2] * 0.78) + '" ry="' + o[2] + '" fill="' + o[3] + '" stroke="' + O + '" stroke-width="1"/>';
        s += '<path d="M' + n1(o[0] - o[2] * 0.72) + ' ' + n1(o[1] - o[2]) + ' q' + n1(o[2] * 0.36) + ' -2 ' + n1(o[2] * 0.72) + ' 0 q' + n1(o[2] * 0.36) + ' 2 ' + n1(o[2] * 0.72) + ' 0" stroke="#fff" stroke-width="1.4" fill="none"/>';
      });
    } else if (m === 'coeur') {
      s += ombre(9) + '<path d="M-6 0 h12 l-2 -8 h-8z" fill="#c94a3f" stroke="' + O + '" stroke-width="1"/><path d="M0 -8 V-16" stroke="#4f7a42" stroke-width="2"/>';
      s += '<path d="M0 -17 C-14 -26 -12 -40 -4 -38 Q0 -37 0 -32 Q0 -37 4 -38 C12 -40 14 -26 0 -17Z" fill="#f06595" stroke="' + O + '" stroke-width="1.2"/>';
      [[-6, -31], [5, -30], [0, -24], [-3, -35]].forEach(function (p) { s += R(p[0], p[1], 1.6, '#fff0f6', 0.4); });
    } else if (m === 'parasol') {
      s += ombre(16) + '<path d="M0 0 V-38" stroke="' + O + '" stroke-width="2.6"/><path d="M0 0 V-38" stroke="#f3eadb" stroke-width="1.4"/>';
      s += '<path d="M-22 -32 Q0 -52 22 -32 Q16 -35 11 -32 Q5.5 -35 0 -32 Q-5.5 -35 -11 -32 Q-16 -35 -22 -32Z" fill="#fff" stroke="' + O + '" stroke-width="1.2"/>';
      s += '<path d="M-11 -32 Q-8 -46 0 -46 Q-3 -40 0 -32 Q-5.5 -35 -11 -32Z M11 -32 Q8 -46 0 -46 Q3 -40 0 -32 Q5.5 -35 11 -32Z" fill="' + cols[0] + '" opacity="0.9"/>';
      s += '<path d="M-14 -2 l14 -5 l14 5 l-14 5z" fill="#4dabf7" stroke="' + O + '" stroke-width="0.8" opacity="0.9"/>';
    } else if (m === 'lampions') {
      s += ombre(8) + '<path d="M0 0 V-42 M-16 -38 Q0 -46 16 -38" stroke="' + O + '" stroke-width="2.4" fill="none"/><path d="M0 0 V-42" stroke="#7a4a26" stroke-width="1.3"/>';
      [[-11, -36], [0, -40], [11, -36]].forEach(function (p, q) {
        var c = cols[q % cols.length];
        s += '<ellipse cx="' + p[0] + '" cy="' + (p[1] + 7) + '" rx="5" ry="6.5" fill="' + c + '" stroke="' + O + '" stroke-width="0.9"/><path d="M' + (p[0] - 5) + ' ' + (p[1] + 7) + ' h10 M' + (p[0] - 4) + ' ' + (p[1] + 3) + ' h8 M' + (p[0] - 4) + ' ' + (p[1] + 11) + ' h8" stroke="' + nuance(c, -0.3) + '" stroke-width="0.7"/>';
        if (nuit) s += '<circle cx="' + p[0] + '" cy="' + (p[1] + 7) + '" r="11" fill="' + c + '" opacity="0.3"/>';
      });
    } else if (m === 'stand') {   // un étal de marché : crêpes, vin chaud, glaces
      var aw = stand === 'glaces' ? ['#4dabf7', '#fff'] : stand === 'crepes' ? ['#f59f00', '#fff'] : ['#c92a2a', '#fff'];
      var txt = stand === 'glaces' ? 'Glaces' : stand === 'crepes' ? 'Crêpes' : 'Vin chaud';
      s += ombre(26) + '<path d="M-24 0 V-16 L0 -10 V6Z" fill="#a0522d" stroke="' + O + '" stroke-width="1.1"/><path d="M0 -10 L24 -16 V0 L0 6Z" fill="#7a4a26" stroke="' + O + '" stroke-width="1.1"/>';
      s += '<path d="M-24 -16 L0 -22 L24 -16 L0 -10Z" fill="#d9a066" stroke="' + O + '" stroke-width="1"/>';
      // les marchandises sur le comptoir
      if (stand === 'glaces') [[-10, -17], [-3, -19], [5, -18], [12, -16]].forEach(function (p, q) { s += '<path d="M' + (p[0] - 2.5) + ' ' + p[1] + ' l2.5 6 2.5 -6z" fill="#e8b36b" stroke="' + O + '" stroke-width="0.6"/>' + R(p[0], p[1] - 1.5, 3, ['#ff8fab', '#fff3bf', '#8ce99a', '#a5d8ff'][q], 0.7); });
      else if (stand === 'crepes') [[-8, -17], [6, -17]].forEach(function (p) { s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="7" ry="3" fill="#ffd8a8" stroke="' + O + '" stroke-width="0.8"/><path d="M' + (p[0] - 4) + ' ' + p[1] + ' q4 -2 8 0" stroke="#e8590c" stroke-width="1" fill="none"/>'; });
      else { s += '<ellipse cx="0" cy="-18" rx="7" ry="3" fill="#5c3a1e" stroke="' + O + '" stroke-width="0.8"/><path d="M-7 -18 v-6 a7 3 0 0 0 14 0 v6" fill="#868e96" stroke="' + O + '" stroke-width="0.8"/>' + [-14, 12].map(function (x) { return '<rect x="' + x + '" y="-22" width="3.6" height="5" rx="0.8" fill="#c92a2a" stroke="' + O + '" stroke-width="0.5"/>'; }).join('') + '<path d="M-2 -28 q-2 -4 1 -7 M2 -28 q2 -4 -1 -8" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.7"/>'; }
      // poteaux et auvent rayé
      s += '<path d="M-22 -16 V-40 M22 -16 V-40" stroke="' + O + '" stroke-width="2.4"/><path d="M-22 -16 V-40 M22 -16 V-40" stroke="#c9a26b" stroke-width="1.2"/>';
      for (var q = 0; q < 6; q++) { var x0 = -26 + q * 9; s += '<path d="M' + x0 + ' -38 L' + (x0 + 9) + ' -38 L' + (x0 + 8) + ' -48 L' + (x0 + 1) + ' -48Z" fill="' + aw[q % 2] + '"/>' + '<path d="M' + x0 + ' -38 q4.5 5 9 0" fill="' + aw[q % 2] + '" stroke="' + O + '" stroke-width="0.6"/>'; }
      s += '<path d="M-26 -38 L28 -38 L27 -48 L-25 -48Z" fill="none" stroke="' + O + '" stroke-width="1.1"/>';
      s += '<rect x="-17" y="-60" width="34" height="11" rx="2" fill="#fff8e7" stroke="' + O + '" stroke-width="1"/><text x="0" y="-51.6" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="7.6" fill="#7c2d12">' + txt + '</text>';
      if (nuit) s += '<circle cx="0" cy="-36" r="3" fill="#ffd77a"/><circle cx="0" cy="-36" r="9" fill="#ffd77a" opacity="0.35"/>';
    } else if (m === 'kiosque') {   // kiosque à musique
      s += '<ellipse cx="0" cy="-2" rx="28" ry="12" fill="#c9c1b5" stroke="' + O + '" stroke-width="1.2"/><path d="M-28 -2 v5 a28 12 0 0 0 56 0 v-5" fill="#a8a29a" stroke="' + O + '" stroke-width="1.1"/>';
      [-22, -8, 8, 22].forEach(function (x) { s += '<path d="M' + x + ' ' + (x === -8 || x === 8 ? 6 : 1) + ' V-34" stroke="' + O + '" stroke-width="3"/><path d="M' + x + ' ' + (x === -8 || x === 8 ? 6 : 1) + ' V-34" stroke="#f3eadb" stroke-width="1.6"/>'; });
      s += '<path d="M-26 -38 L0 -62 L26 -38 Q0 -30 -26 -38Z" fill="' + cols[0] + '" stroke="' + O + '" stroke-width="1.3"/><path d="M-13 -36 L0 -62 L13 -36" stroke="' + nuance(cols[0], -0.3) + '" stroke-width="1" fill="none"/>';
      s += '<path d="M-27 -37 q6 5 13 1 q7 4 14 0 q7 4 14 0 q6 4 13 -1" stroke="' + O + '" stroke-width="1" fill="' + (cols[1] || '#fff') + '"/>' + R(0, -64, 2.6, '#fcc419', 0.7);
      s += '<path d="M-6 -10 V-24 l12 -3 V-13" stroke="' + O + '" stroke-width="1.8" fill="none"/>' + R(-8.5, -10, 3, O, 0) + R(3.5, -13, 3, O, 0);
    } else if (m === 'arche') {   // arche de cœurs et de roses
      s += ombre(20) + '<path d="M-20 0 V-30 Q-20 -54 0 -54 Q20 -54 20 -30 V0" stroke="' + O + '" stroke-width="5" fill="none"/><path d="M-20 0 V-30 Q-20 -54 0 -54 Q20 -54 20 -30 V0" stroke="#fff" stroke-width="3" fill="none"/>';
      for (var t = 0; t <= 1.001; t += 0.1) { var an2 = Math.PI * (1 - t), x = Math.cos(an2) * 20, y = -30 - Math.sin(an2) * 24; s += '<path d="M' + n1(x - 2) + ' ' + n1(y) + ' q2 -3 4 0" fill="#4f7a42"/>' + R(x, y, 2.6, Math.round(t * 10) % 2 ? '#f06595' : '#ffdeeb', 0.6); }
      [-26, -12].forEach(function (y) { s += R(-20, y, 2.6, '#f06595', 0.6) + R(20, y + 4, 2.6, '#f06595', 0.6); });
      s += '<path d="M0 -36 C-9 -42 -8 -50 -3 -49 Q0 -48.5 0 -46 Q0 -48.5 3 -49 C8 -50 9 -42 0 -36Z" fill="#e03131" stroke="' + O + '" stroke-width="1"/>';
    } else if (m === 'arcenciel') {   // arc-en-ciel et pot d'or
      ['#e03131', '#f76707', '#fcc419', '#40c057', '#4dabf7', '#7048e8'].forEach(function (c, q) { var r = 34 - q * 3.2; s += '<path d="M' + n1(-r) + ' -8 A' + n1(r) + ' ' + n1(r * 0.9) + ' 0 0 1 ' + n1(r) + ' -8" stroke="' + c + '" stroke-width="3.4" fill="none" opacity="0.9"/>'; });
      s += '<ellipse cx="-34" cy="-8" rx="9" ry="6" fill="#fff" opacity="0.9"/><ellipse cx="34" cy="-8" rx="9" ry="6" fill="#fff" opacity="0.9"/>';
      s += ombre(10) + '<path d="M-8 -8 Q-10 2 0 3 Q10 2 8 -8Z" fill="#343a40" stroke="' + O + '" stroke-width="1.1"/><ellipse cx="0" cy="-8" rx="8.5" ry="3" fill="#fcc419" stroke="' + O + '" stroke-width="0.9"/>' + R(-3, -10, 2, '#ffe066', 0.5) + R(2, -11, 2, '#ffe066', 0.5) + R(5, -9, 1.8, '#ffe066', 0.5);
    } else if (m === 'lapin') {   // lapin taillé dans une haie
      s += ombre(14) + '<path d="M-10 0 h20 l-2 -8 h-16z" fill="#c94a3f" stroke="' + O + '" stroke-width="1"/>' + R(0, -18, 11, '#4f7a42', 1.2) + R(0, -33, 7.5, '#4f7a42', 1.2);
      s += '<ellipse cx="-3.5" cy="-48" rx="2.8" ry="9" fill="#4f7a42" stroke="' + O + '" stroke-width="1.1"/><ellipse cx="3.5" cy="-47" rx="2.8" ry="9" fill="#4f7a42" stroke="' + O + '" stroke-width="1.1" transform="rotate(12 3.5 -47)"/>';
      s += R(9, -14, 4, '#6c9a58', 1) + R(-2.5, -34, 0.9, O, 0) + R(2.5, -34, 0.9, O, 0) + R(-5, -22, 1.6, '#f783ac', 0.4) + R(4, -16, 1.6, '#ffd43b', 0.4);
    } else if (m === 'epouvantail') {
      s += ombre(10) + '<path d="M0 0 V-40 M-16 -28 H16" stroke="' + O + '" stroke-width="3.4"/><path d="M0 0 V-40 M-16 -28 H16" stroke="#9b6a3e" stroke-width="2"/>';
      s += '<path d="M-14 -30 H14 L10 -12 H-10Z" fill="#5c7cfa" stroke="' + O + '" stroke-width="1.1"/><path d="M-5 -24 h4 v4 h-4z M3 -18 h4 v4 h-4z" fill="#ffa94d" stroke="' + O + '" stroke-width="0.5"/>';
      s += '<path d="M-16 -28 l-3 5 M-16 -28 l-4 2 M16 -28 l3 5 M16 -28 l4 2 M-6 -12 l-2 5 M6 -12 l2 5" stroke="#e9c46a" stroke-width="1.4"/>';
      s += '<ellipse cx="0" cy="-39" rx="8" ry="6.5" fill="#f76707" stroke="' + O + '" stroke-width="1.1"/><path d="M-4 -40 l1.5 -2 1.5 2z M1 -40 l1.5 -2 1.5 2z M-3.5 -37 q3.5 2 7 0" fill="' + (nuit ? '#ffe066' : '#5c2a00') + '" stroke="' + (nuit ? '#ffe066' : '#5c2a00') + '" stroke-width="0.6"/>';
      s += '<path d="M-11 -43 H11 L5 -45 L3 -54 H-3 L-5 -45Z" fill="#343a40" stroke="' + O + '" stroke-width="1"/>';
      if (nuit) s += '<circle cx="0" cy="-39" r="13" fill="#ffa94d" opacity="0.25"/>';
    } else if (m === 'horloge') {   // horloge de la place, à minuit moins une
      s += ombre(8) + '<path d="M0 0 V-46" stroke="' + O + '" stroke-width="4"/><path d="M0 0 V-46" stroke="#495057" stroke-width="2.4"/>' + R(0, -52, 10, '#fff8e7', 1.6);
      s += '<path d="M0 -52 V-59 M0 -52 L-1 -58.5" stroke="' + O + '" stroke-width="1.4" stroke-linecap="round"/>';
      for (var h2 = 0; h2 < 12; h2++) { var a3 = h2 * Math.PI / 6; s += R(Math.sin(a3) * 7.6, -52 - Math.cos(a3) * 7.6, 0.7, O, 0); }
      s += '<path d="M-6 -41 q6 4 12 0 l-2 4 2 3 q-6 -3 -12 0 l2 -3z" fill="' + cols[0] + '" stroke="' + O + '" stroke-width="0.7"/>';
    }
    return s + '</g>';
  }
  // Le décor d'une porte, dans le repère de la façade (x = milieu de la porte, y = haut de la porte)
  function decorPorte(type, x, y, cols) {
    if (type === 'couronne') return '<circle cx="' + n1(x) + '" cy="' + n1(y + 10) + '" r="6.5" fill="none" stroke="#2f6b3a" stroke-width="3.6"/><circle cx="' + n1(x) + '" cy="' + n1(y + 10) + '" r="6.5" fill="none" stroke="' + O + '" stroke-width="0.6" stroke-dasharray="2 2"/><path d="M' + n1(x - 3) + ' ' + n1(y + 16) + ' l3 -2 3 2 -1 4 -2 -2 -2 2z" fill="#e03131" stroke="' + O + '" stroke-width="0.5"/>' + rond(x - 4, y + 6, 1.1, '#e03131', 0.3) + rond(x + 4.5, y + 8, 1.1, '#f4c430', 0.3);
    if (type === 'coeur') return '<path d="M' + n1(x) + ' ' + n1(y + 16) + ' C' + n1(x - 9) + ' ' + n1(y + 10) + ' ' + n1(x - 7) + ' ' + n1(y + 2) + ' ' + n1(x - 2) + ' ' + n1(y + 3) + ' Q' + n1(x) + ' ' + n1(y + 4) + ' ' + n1(x) + ' ' + n1(y + 6) + ' Q' + n1(x) + ' ' + n1(y + 4) + ' ' + n1(x + 2) + ' ' + n1(y + 3) + ' C' + n1(x + 7) + ' ' + n1(y + 2) + ' ' + n1(x + 9) + ' ' + n1(y + 10) + ' ' + n1(x) + ' ' + n1(y + 16) + 'Z" fill="#f06595" stroke="' + O + '" stroke-width="0.9"/>';
    if (type === 'trefle') return [[0, 5], [-3.6, 9], [3.6, 9]].map(function (p) { return rond(x + p[0], y + p[1], 3.4, '#2b8a3e', 0.7); }).join('') + '<path d="M' + n1(x) + ' ' + n1(y + 10) + ' q1 5 3 7" stroke="#2b8a3e" stroke-width="1.4" fill="none"/>';
    if (type === 'oeuf') return '<ellipse cx="' + n1(x) + '" cy="' + n1(y + 10) + '" rx="5" ry="6.5" fill="#ffd43b" stroke="' + O + '" stroke-width="0.9"/><path d="M' + n1(x - 4.6) + ' ' + n1(y + 10) + ' q2.3 -2 4.6 0 q2.3 2 4.6 0" stroke="#f783ac" stroke-width="1.6" fill="none"/>';
    if (type === 'note') return '<path d="M' + n1(x - 2) + ' ' + n1(y + 15) + ' V' + n1(y + 3) + ' l8 -2 V' + n1(y + 13) + '" stroke="' + O + '" stroke-width="1.6" fill="none"/>' + rond(x - 4, y + 15, 2.6, cols[0], 0.6) + rond(x + 4, y + 13, 2.6, cols[1 % cols.length], 0.6);
    if (type === 'chandelle') return '<path d="M' + n1(x + 13) + ' ' + n1(y + 2) + ' h-3 v4" stroke="' + O + '" stroke-width="1.2" fill="none"/><rect x="' + n1(x + 7.6) + '" y="' + n1(y + 6) + '" width="5" height="7" rx="1" fill="#ffd77a" stroke="' + O + '" stroke-width="0.9"/><path d="M' + n1(x + 10.1) + ' ' + n1(y + 8) + ' v3" stroke="#e8590c" stroke-width="1.2"/>';
    if (type === 'fleurs') { var f = ''; for (var q = 0; q < 10; q++) { var an = q * Math.PI / 5; f += rond(x + Math.cos(an) * 6.5, y + 10 + Math.sin(an) * 6.5, 2.1, ['#ff6b6b', '#ffd43b', '#f783ac', '#b197fc', '#69db7c'][q % 5], 0.4); } return f; }
    if (type === 'citrouille') return '';   // la citrouille se pose sur le perron (voir dessinerParcelle)
    if (type === 'etoile') return '<path d="M' + n1(x) + ' ' + n1(y + 3) + ' l2 4.2 4.6 0.5 -3.4 3.1 1 4.5 -4.2 -2.3 -4.2 2.3 1 -4.5 -3.4 -3.1 4.6 -0.5z" fill="#fcc419" stroke="' + O + '" stroke-width="0.8"/>';
    return '';
  }
  // Une déco dans une fenêtre (repère de la façade : x = milieu, y = haut du carreau)
  function decoFenetre(type, x, y, w, h, nuit) {
    var s = '', b = y + h;
    if (type === 'bougies') [x - w * 0.28, x + w * 0.28].forEach(function (cx) { s += '<rect x="' + n1(cx - 1.4) + '" y="' + n1(b - 6) + '" width="2.8" height="5" fill="#fff8e7" stroke="' + O + '" stroke-width="0.5"/><path d="M' + n1(cx) + ' ' + n1(b - 6) + ' q-1.6 -2 0 -3.6 q1.6 1.6 0 3.6z" fill="#ffa94d"/>' + (nuit ? '<circle cx="' + n1(cx) + '" cy="' + n1(b - 8) + '" r="4" fill="#ffd77a" opacity="0.5"/>' : ''); });
    else if (type === 'etoiles') s += '<path d="M' + n1(x - w * 0.25) + ' ' + n1(y) + ' v4 M' + n1(x + w * 0.25) + ' ' + n1(y) + ' v7" stroke="#fff" stroke-width="0.5"/>' + [[x - w * 0.25, y + 6.5, 3.2], [x + w * 0.25, y + 10, 2.6]].map(function (e) { return '<path d="' + etoile5(e[0], e[1], e[2]) + '" fill="#fcc419" stroke="' + O + '" stroke-width="0.5"/>'; }).join('');
    else if (type === 'citrouilles') s += '<ellipse cx="' + n1(x) + '" cy="' + n1(b - 4) + '" rx="5.5" ry="4" fill="' + (nuit ? '#ff922b' : '#f76707') + '" stroke="' + O + '" stroke-width="0.7"/><path d="M' + n1(x - 3) + ' ' + n1(b - 5) + ' l1 -1.4 1 1.4z M' + n1(x + 1) + ' ' + n1(b - 5) + ' l1 -1.4 1 1.4z M' + n1(x - 2.5) + ' ' + n1(b - 3) + ' q2.5 1.4 5 0" fill="' + (nuit ? '#fff3bf' : '#5c2a00') + '" stroke="' + (nuit ? '#fff3bf' : '#5c2a00') + '" stroke-width="0.5"/>' + (nuit ? '<circle cx="' + n1(x) + '" cy="' + n1(b - 4) + '" r="8" fill="#ffa94d" opacity="0.4"/>' : '');
    else if (type === 'coeurs') s += [[x - w * 0.24, y + 5.5], [x + w * 0.24, y + 13]].map(function (c) { return '<path d="M' + n1(c[0]) + ' ' + n1(c[1] + 3) + ' c-4.5 -3 -4 -6.5 -1.3 -6.3 q1.3 0.1 1.3 1.6 q0 -1.5 1.3 -1.6 c2.7 -0.2 3.2 3.3 -1.3 6.3z" fill="#f06595" stroke="' + O + '" stroke-width="0.5"/>'; }).join('');
    else if (type === 'papillons') s += [[x - w * 0.24, y + 5, '#ffd43b'], [x + w * 0.22, y + 13, '#f783ac']].map(function (c) { return '<path d="M' + n1(c[0]) + ' ' + n1(c[1]) + ' q-3.6 -4 -4.6 -0.6 q1 2.4 4.6 0.6 q3.6 1.8 4.6 -0.6 q-1 -3.4 -4.6 0.6z" fill="' + c[2] + '" stroke="' + O + '" stroke-width="0.5"/>'; }).join('');
    else if (type === 'trefles') s += [[x - w * 0.24, y + 6], [x + w * 0.24, y + 13]].map(function (c) { return [[0, -1.8], [-1.7, 0.6], [1.7, 0.6]].map(function (p) { return rond(c[0] + p[0], c[1] + p[1], 1.7, '#2b8a3e', 0.4); }).join(''); }).join('');
    return s;
  }
  function etoile5(cx, cy, r) {
    var d = '';
    for (var q = 0; q < 10; q++) { var a = -Math.PI / 2 + q * Math.PI / 5, rr = q % 2 ? r * 0.45 : r; d += (q ? 'L' : 'M') + n1(cx + Math.cos(a) * rr) + ' ' + n1(cy + Math.sin(a) * rr); }
    return d + 'Z';
  }
  // Une déco sous l'avant-toit (le long de l'égout a → b, puis de la rive b → c). Rend { s, l (lueurs la nuit) }
  function decoToit(type, a, b, c, nuit) {
    if (type === 'fanions') return { s: fanions(a, b, ['#e03131', '#fcc419', '#2f9e44', '#4c6ef5'], false), l: [] };
    var s = '', l = [], segs = type === 'lumieres' ? [[a, b], [b, c]] : [[a, b]];
    segs.forEach(function (sg) {
      var p0 = sg[0], p1 = sg[1], dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.sqrt(dx * dx + dy * dy), cr = Math.min(9, L * 0.06);
      var pt2 = function (t) { return [p0[0] + dx * t, p0[1] + dy * t + cr * 4 * t * (1 - t)]; };
      s += '<path d="M' + pt(p0) + ' Q' + n1(p0[0] + dx / 2) + ' ' + n1(p0[1] + dy / 2 + cr * 2) + ' ' + pt(p1) + '" stroke="' + O + '" stroke-width="0.8" fill="none" opacity="0.75"/>';
      var n = type === 'lumieres' ? Math.max(4, Math.round(L / 9)) : Math.max(3, Math.round(L / 20));
      for (var q = 1; q < n; q++) {
        var p = pt2(q / n), x = p[0], y = p[1];
        if (type === 'lumieres') {
          var col = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#f783ac'][q % 5];
          s += '<ellipse cx="' + n1(x) + '" cy="' + n1(y + 2.2) + '" rx="1.6" ry="2.2" fill="' + col + '" stroke="' + O + '" stroke-width="0.4"/>' + (nuit ? '<circle cx="' + n1(x) + '" cy="' + n1(y + 2.2) + '" r="4.5" fill="' + col + '" opacity="0.45"/>' : '');
          if (nuit && q % 4 === 0) l.push([x, y + 2]);
        } else {
          var fil = '<path d="M' + n1(x) + ' ' + n1(y) + ' v' + (q % 2 ? 5 : 8) + '" stroke="' + O + '" stroke-width="0.5"/>', yy = y + (q % 2 ? 5 : 8);
          if (type === 'chauves') s += fil + '<path d="M' + n1(x) + ' ' + n1(yy + 2) + ' q-3 -4 -7 -2 q2 1 1 4 q3 -2 3 0 q1 -2 3 -2 q2 0 3 2 q0 -2 3 0 q-1 -3 1 -4 q-4 -2 -7 2z" fill="#2b1d14"/>';
          else if (type === 'coeurs') s += fil + '<path d="M' + n1(x) + ' ' + n1(yy + 6) + ' c-5 -3.4 -4.4 -7.4 -1.4 -7.2 q1.4 0.1 1.4 1.8 q0 -1.7 1.4 -1.8 c3 -0.2 3.6 3.8 -1.4 7.2z" fill="' + (q % 2 ? '#f06595' : '#e03131') + '" stroke="' + O + '" stroke-width="0.5"/>';
          else if (type === 'oeufs') s += fil + '<ellipse cx="' + n1(x) + '" cy="' + n1(yy + 3.6) + '" rx="2.7" ry="3.6" fill="' + ['#f783ac', '#4dabf7', '#ffd43b', '#69db7c'][q % 4] + '" stroke="' + O + '" stroke-width="0.5"/><path d="M' + n1(x - 2.5) + ' ' + n1(yy + 3.6) + ' q1.2 -1 2.5 0 q1.2 1 2.5 0" stroke="#fff" stroke-width="0.8" fill="none"/>';
          else if (type === 'lampions') { var cl = ['#ff6b6b', '#ffd43b', '#4dabf7', '#b197fc'][q % 4]; s += fil + '<ellipse cx="' + n1(x) + '" cy="' + n1(yy + 4) + '" rx="3.4" ry="4.2" fill="' + cl + '" stroke="' + O + '" stroke-width="0.5"/><path d="M' + n1(x - 3.4) + ' ' + n1(yy + 4) + ' h6.8" stroke="' + nuance(cl, -0.3) + '" stroke-width="0.5"/>' + (nuit ? '<circle cx="' + n1(x) + '" cy="' + n1(yy + 4) + '" r="7" fill="' + cl + '" opacity="0.35"/>' : ''); }
        }
      }
    });
    return { s: s, l: l };
  }
  // Tout ce qu'il faut acheter pour une maison (le reste est gratuit ou déjà à soi) : { clé: nombre }
  // Prix proposés par Claude (4.31), à confirmer : la base (colombages, tuiles, piquets, barrière) est gratuite,
  // la couverture d'origine d'un style vient avec lui, les couleurs sont libres.
  var PRIX = {
    style: { colombages: 0, chaumiere: 30, pierre: 35, chalet: 40, briques: 35, bardage: 30 },
    toit: { tuiles: 0, ardoise: 15, chaume: 20, bardeaux: 15 },
    cloture: { piquets: 0, bois: 0, aucune: 0, haie: 10, muret: 15 },
    arche: 10
  };
  function prixDe(cle) {
    var p = cle.split(':');
    if (p[0] === 'style' || p[0] === 'toit' || p[0] === 'cloture') return PRIX[p[0]][p[1]] || 0;
    if (p[0] === 'arche') return PRIX.arche;
    if (p[0] === 'deco') return ((DECOS_MAISON[p[1]] || {})[p[2]] || {}).prix || 0;
    if (p[0] === 'objet') { var f = OBJETS_FETE[p.slice(1).join(':')]; return f ? f.prix : ((K.MEUBLES[p[1]] || {}).prix || 5); }
    return 0;
  }
  function besoins(m0) {
    var m = maison(m0), b = {}, S = STYLES[m.style];
    var ajoute = function (c, n) { if (prixDe(c) > 0) b[c] = (b[c] || 0) + (n || 1); };
    ajoute('style:' + m.style);
    if (m.toit !== S.toit) ajoute('toit:' + m.toit);
    ajoute('cloture:' + m.cloture);
    if (m.arche) ajoute('arche');
    m.jardin.forEach(function (o) { ajoute('objet:' + o.m); });
    Object.keys(m.deco).forEach(function (z) { ajoute('deco:' + z + ':' + m.deco[z]); });
    return b;
  }
  // Ce qui manque : { a: [{ cle, n, prix }], total }
  function aPayer(m0, possede) {
    var b = besoins(m0), a = [], total = 0;
    Object.keys(b).forEach(function (c) { var n = b[c] - ((possede || {})[c] || 0); if (n > 0) { var p = prixDe(c) * n; a.push({ cle: c, n: n, prix: p }); total += p; } });
    return { a: a, total: total };
  }

  // ---------- Toute la scène ----------
  // habitants : [{ n (parcelle), nom, maison, present, courrier, cp (svg du compagnon devant chez lui), moi }]
  // Rend { defs, sol, elements: [{ cle, s, lueurs, x0, y0, x1, y1 }] } : la page trie et ne garde que ce qui est à l'écran
  function scene(Q, habitants, op) {
    op = op || {};
    var defs = {}, el = [], parLot = {};
    (habitants || []).forEach(function (h) { parLot[h.n] = h; });
    var solS = dessinerSol(Q, defs, op.nuit);
    el = el.concat(decors(Q, defs, op.nuit, op.fete));
    if (op.fete) el = el.concat(cielFete(Q, op.fete, op.nuit));
    Q.lots.forEach(function (L) {
      var h = parLot[L.n];
      if (!h) { el = el.concat(dessinerParcelle(L, null, {}, defs)); return; }
      el = el.concat(dessinerParcelle(L, h.maison, { nom: h.nom, present: h.present, courrier: h.courrier, moi: h.moi, nuit: op.nuit, cp: h.cp, id: L.n, fete: op.fete }, defs));
    });
    return { defs: Object.keys(defs).map(function (k) { return defs[k]; }).join(''), sol: solS, elements: el };
  }
  // Petite vignette d'une maison seule (tuiles des styles dans Arranger)
  function vignetteMaison(m0, larg, haut) {
    var defs = {}, L = { n: 0, i: 0, j: 0, o: 0 }, el = dessinerParcelle(L, m0, { nom: '', id: 'v' + Math.round(Math.random() * 1e6), vignette: true }, defs);
    return '<svg viewBox="-112 -142 250 236" width="' + (larg || 70) + '" height="' + (haut || 66) + '"><defs>' + Object.keys(defs).map(function (k) { return defs[k]; }).join('') + '</defs>' + el[0].s + '</svg>';
  }
  // Repères des places du jardin de ma parcelle (losanges au sol), pour Arranger
  function reperesJardin(L, choisie) {
    var s = '';
    PLACES_JARDIN.forEach(function (c, n) {
      var a = versMonde(L, c[0] + 0.08, c[1] + 0.08), b = versMonde(L, c[0] + 0.92, c[1] + 0.08), d = versMonde(L, c[0] + 0.92, c[1] + 0.92), e = versMonde(L, c[0] + 0.08, c[1] + 0.92);
      var on = n === choisie;
      s += '<path data-place="' + n + '" d="' + chemin([proj(a[0], a[1]), proj(b[0], b[1]), proj(d[0], d[1]), proj(e[0], e[1])], 4) + '" fill="' + (on ? '#ffa94d' : '#fff8e7') + '" fill-opacity="' + (on ? 0.55 : 0.28) + '" stroke="' + (on ? '#e8590c' : '#fff8e7') + '" stroke-width="2" stroke-dasharray="' + (on ? '' : '5 3') + '"/>';
    });
    return s;
  }
  function centreQuartier(Q) { return proj((Q.iMin + Q.iMax) / 2, TAILLE / 2 + 2); }
  function centreLot(L) { var c = versMonde(L, 2, 2.6); return proj(c[0], c[1]); }
  // Le milieu du jardin de devant (la caméra s'y cale quand on arrange le jardin)
  function centreJardin(L) { var c = versMonde(L, 1.6, 3.9); return proj(c[0], c[1]); }
  // « Comme une table de poker » (4.31, demandé par l'utilisateur) : chacun choisit sa parcelle, et chez lui les autres
  // se rangent autour : les plus proches (même placette d'abord) vont aux amis passés le plus récemment.
  // autres : les habitants, déjà triés du plus présent au moins présent. Rend { n de l'habitant: n de la parcelle }.
  function ranger(Q, maPlace, autres) {
    var M = Q.lots[maPlace] || Q.lots[0], cM = versMonde(M, 2, 2.5);
    var libres = Q.lots.filter(function (L) { return L.n !== M.n; }).map(function (L) {
      var c = versMonde(L, 2, 2.5), d = Math.abs(c[0] - cM[0]) + Math.abs(c[1] - cM[1]);
      return { L: L, d: d + (L.placette === M.placette ? 0 : 1000) };
    }).sort(function (a, b) { return a.d - b.d || a.L.n - b.L.n; });
    var r = {};
    autres.forEach(function (h, k) { if (libres[k]) r[h.id] = libres[k].L.n; });
    return r;
  }
  // Les repères des parcelles quand on choisit sa place (une épingle au-dessus de chaque parcelle)
  function marquesPlaces(Q, mien) {
    var s = '';
    Q.lots.forEach(function (L) {
      var c = versMonde(L, 2, 2.2), p = proj(c[0], c[1], 4.1), on = L.n === mien;
      s += '<g data-choix="' + L.n + '" style="cursor:pointer"><path d="M' + n1(p[0]) + ' ' + n1(p[1] + 26) + ' l-11 -16 a13 13 0 1 1 22 0z" fill="' + (on ? '#e8590c' : '#fff8e7') + '" stroke="' + O + '" stroke-width="2"/>' +
        '<circle cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="6" fill="' + (on ? '#fff4e6' : '#c9a874') + '"/>' +
        (on ? '<text x="' + n1(p[0]) + '" y="' + n1(p[1] - 22) + '" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="17" fill="#fff4e6" stroke="' + O + '" stroke-width="3" paint-order="stroke">Chez moi</text>' : '') + '</g>';
    });
    return s;
  }
  // Point de l'écran → case du sol
  function caseEn(x, y) { var c = K.versSol(x, y); return { i: Math.floor(c.i), j: Math.floor(c.j) }; }

  return {
    LOT_W: LOT_W, LOT_D: LOT_D, COIN: COIN, TAILLE: TAILLE, PAS: PAS, RUE0: RUE0, RUE1: RUE1, BAS: BAS, STYLES: STYLES, TOITS: TOITS, CLOTURES: CLOTURES,
    PLACES_JARDIN: PLACES_JARDIN, NOMS_PLACETTES: NOMS_PLACETTES, FETES_DEHORS: FETES_DEHORS, OBJETS_FETE: OBJETS_FETE, DECOS_MAISON: DECOS_MAISON, ZONES_DECO: ZONES_DECO, PRIX: PRIX,
    prixDe: prixDe, besoins: besoins, aPayer: aPayer, objetFete: objetFete, ranger: ranger, centreJardin: centreJardin, centreQuartier: centreQuartier, marquesPlaces: marquesPlaces,
    quartier: quartier, cases: cases, versMonde: versMonde, devantPorte: devantPorte, lotEn: lotEn, chemin: chemin4, maison: maison,
    scene: scene, compagnon: compagnon, caseEn: caseEn, proj: proj, vignetteMaison: vignetteMaison, reperesJardin: reperesJardin, centreLot: centreLot
  };
})();
if (typeof module !== 'undefined') module.exports = QQ;
