// ================== MON COMPAGNON : KIT DE MEUBLES ET PIÈCE ISOMÉTRIQUE (CP.MEUBLES) ==================
// Maquette de la refonte de la maison (étape 1) : la pièce en vue isométrique, dans le trait du Donjon
// (contour sombre, formes arrondies, ombres en aplat ; pas de dégradé, pas de pixel art).
// Tout se calcule d'après la taille de la pièce (piece.l × piece.p cases) : rien n'est écrit en dur pour 6 × 6.
// Les objets sont placés en cases (i, j) et ont deux orientations (o = 0, ou o = 1 = le miroir).
// La « caméra » est le viewBox du SVG : zoomer ou se déplacer ne change que lui.
//
// Repère : origine (0, 0) au coin du fond ; i va vers la droite et l'avant, j vers la gauche et l'avant, z vers le haut.
// Mur droit = plan j = 0 (le long de i) ; mur gauche = plan i = 0 (le long de j).
// Objet au sol : (i, j) = coin du fond de son emprise ; o = 1 échange la largeur et la profondeur (miroir).
// Objet au mur : o = 0 sur le mur droit (i = position le long du mur), o = 1 sur le mur gauche (j = position) ; z = hauteur du bas.
// Objet au plafond : (i, j) comme au sol.

var CPM = (function () {
  var TW = 32, TH = 16, ZU = 34;        // demi-largeur et demi-hauteur d'une case à l'écran, hauteur d'une unité verticale
  var O = '#2b1d14', EP = 1.5;           // contour (comme le Donjon) et son épaisseur
  var U = 40;                            // dessins à plat (murs, sol, faces) : 40 unités locales par case
  var HAUTEUR = 2.6;                     // hauteur des murs (en cases)
  var BORD = 10;                         // épaisseur du plancher vu de face (px)
  var BOIS = '#a8693a', BOIS_C = '#c98d55', BOIS_S = '#6b4423';

  // ---------- Couleurs ----------
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function nuance(c, f) {
    var r = hex(c), cible = f > 0 ? 255 : 0, k = Math.abs(f);
    return '#' + r.map(function (v) { var n = Math.round(v + (cible - v) * k); return (n < 16 ? '0' : '') + n.toString(16); }).join('');
  }
  // Nuancier commun : une douzaine de teintes choisies pour aller ensemble (murs, sols, meubles)
  var NUANCIER = [
    { id: 'creme', nom: 'Crème', c: '#efe2c8' }, { id: 'sable', nom: 'Sable', c: '#d9bb8c' },
    { id: 'miel', nom: 'Miel', c: '#c08a52' }, { id: 'moutarde', nom: 'Moutarde', c: '#d8a73a' },
    { id: 'terracotta', nom: 'Terracotta', c: '#c9733f' }, { id: 'brique', nom: 'Brique', c: '#a8483a' },
    { id: 'prune', nom: 'Prune', c: '#7d4a6b' }, { id: 'nuit', nom: 'Bleu nuit', c: '#3d5378' },
    { id: 'ardoise', nom: 'Bleu gris', c: '#7f9bb0' }, { id: 'sauge', nom: 'Sauge', c: '#8faa86' },
    { id: 'foret', nom: 'Forêt', c: '#4f6e4a' }, { id: 'chocolat', nom: 'Chocolat', c: '#6b4a35' }
  ];
  var TEINTES = {}; NUANCIER.forEach(function (t) { TEINTES[t.id] = t.c; });
  function teinte(t) { return TEINTES[t] || t || '#c08a52'; }

  // ---------- Projection et calcul inverse ----------
  function proj(i, j, z) { return [(i - j) * TW, (i + j) * TH - (z || 0) * ZU]; }
  // Point de l'écran (coordonnées du SVG) → position au sol, en cases (non arrondie)
  function versSol(x, y) { return { i: (x / TW + y / TH) / 2, j: (y / TH - x / TW) / 2 }; }
  // Point de l'écran → position sur un mur (o = 0 : mur droit, o = 1 : mur gauche) : { k (le long du mur), z }
  function versMur(x, y, o) {
    if (o) { var j = -x / TW; return { k: j, z: (j * TH - y) / ZU }; }
    var i = x / TW; return { k: i, z: (i * TH - y) / ZU };
  }

  // ---------- Petits outils de dessin ----------
  function n1(v) { return Math.round(v * 10) / 10; }
  function pt(p) { return n1(p[0]) + ' ' + n1(p[1]); }
  // Polygone aux coins arrondis (r en px)
  function chemin(ps, r) {
    if (!r) return 'M' + ps.map(pt).join(' L') + 'Z';
    var n = ps.length, d = '';
    for (var k = 0; k < n; k++) {
      var a = ps[(k + n - 1) % n], b = ps[k], c = ps[(k + 1) % n];
      var la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]);
      var ra = Math.min(r, la / 2) / (la || 1), rc = Math.min(r, lc / 2) / (lc || 1);
      var p1 = [b[0] + (a[0] - b[0]) * ra, b[1] + (a[1] - b[1]) * ra], p2 = [b[0] + (c[0] - b[0]) * rc, b[1] + (c[1] - b[1]) * rc];
      d += (k ? ' L' : 'M') + pt(p1) + ' Q' + pt(b) + ' ' + pt(p2);
    }
    return d + 'Z';
  }
  function poly(ps, fill, r, ep, extra) {
    return '<path d="' + chemin(ps, r) + '" fill="' + fill + '" stroke="' + O + '" stroke-width="' + (ep == null ? EP : ep) + '" stroke-linejoin="round"' + (extra || '') + '/>';
  }
  function ligne(ps, coul, ep, extra) {
    return '<path d="M' + ps.map(pt).join(' L') + '" fill="none" stroke="' + (coul || O) + '" stroke-width="' + (ep || 1.2) + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
  }
  function matrice(o, ax, ay) {
    return 'matrix(' + [n1((ax[0] - o[0]) / U * 1000) / 1000, n1((ax[1] - o[1]) / U * 1000) / 1000, n1((ay[0] - o[0]) / U * 1000) / 1000, n1((ay[1] - o[1]) / U * 1000) / 1000, n1(o[0]), n1(o[1])].join(' ') + ')';
  }

  // Contexte de dessin d'un objet : P(u, v, z) en coordonnées propres de l'objet (u le long de sa largeur, v de sa profondeur)
  function contexte(i, j, o, z, H, env) {
    return {
      o: o, z: z || 0, H: H || HAUTEUR, env: env || {},
      P: function (u, v, w) { return o ? proj(i + v, j + u, w) : proj(i + u, j + v, w); },
      // Couleur d'une face selon sa direction dans la pièce : face « +u » ou « +v »
      faceU: function (c) { return o ? nuance(c, -0.2) : c; },
      faceV: function (c) { return o ? c : nuance(c, -0.2); }
    };
  }
  // Repère à plat sur une face : origine (u, v, z), axe x et axe y (vecteurs d'une case), en unités locales (40 par case)
  function plan(k, o3, ax3, ay3) {
    var o = k.P(o3[0], o3[1], o3[2]);
    return matrice(o, k.P(o3[0] + ax3[0], o3[1] + ax3[1], o3[2] + ax3[2]), k.P(o3[0] + ay3[0], o3[1] + ay3[1], o3[2] + ay3[2]));
  }
  // Pavé aux coins adoucis : dessus clair, deux faces visibles
  function boite(k, u, v, z, du, dv, dz, c, r) {
    var P = k.P, rr = r == null ? 1.6 : r;
    return poly([P(u + du, v, z), P(u + du, v + dv, z), P(u + du, v + dv, z + dz), P(u + du, v, z + dz)], k.faceU(c), rr) +
           poly([P(u, v + dv, z), P(u + du, v + dv, z), P(u + du, v + dv, z + dz), P(u, v + dv, z + dz)], k.faceV(c), rr) +
           poly([P(u, v, z + dz), P(u + du, v, z + dz), P(u + du, v + dv, z + dz), P(u, v + dv, z + dz)], nuance(c, 0.16), rr);
  }
  // Coussin : un pavé très arrondi, avec une couture
  function coussin(k, u, v, z, du, dv, dz, c) {
    var P = k.P;
    return boite(k, u, v, z, du, dv, dz, c, 4.5) +
      ligne([P(u + 0.12, v + dv * 0.5, z + dz), P(u + du - 0.12, v + dv * 0.5, z + dz)], nuance(c, -0.18), 1, ' opacity="0.6"');
  }
  // Cylindre (r en cases) ; r2 = rayon du haut (tronc de cône) ; dessus visible
  function cylindre(k, u, v, z, r, h, c, r2, dessus) {
    var b = k.P(u, v, z), t = k.P(u, v, z + h), rh = r2 == null ? r : r2;
    var rx = r * TW * 1.414, ry = r * TH * 1.414, rx2 = rh * TW * 1.414, ry2 = rh * TH * 1.414;
    var cote = '<path d="M' + n1(t[0] - rx2) + ' ' + n1(t[1]) + ' L' + n1(b[0] - rx) + ' ' + n1(b[1]) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 0 ' + n1(b[0] + rx) + ' ' + n1(b[1]) +
      ' L' + n1(t[0] + rx2) + ' ' + n1(t[1]) + ' Z" fill="' + c + '" stroke="' + O + '" stroke-width="' + EP + '" stroke-linejoin="round"/>';
    // ombre en aplat sur la moitié droite
    var ombre = '<path d="M' + n1(t[0] + rx2 * 0.35) + ' ' + n1(t[1] + ry2 * 0.94) + ' L' + n1(b[0] + rx * 0.35) + ' ' + n1(b[1] + ry * 0.94) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 0 ' + n1(b[0] + rx) + ' ' + n1(b[1]) +
      ' L' + n1(t[0] + rx2) + ' ' + n1(t[1]) + ' Z" fill="#000" opacity="0.16"/>';
    var haut = dessus === false ? '' : '<ellipse cx="' + n1(t[0]) + '" cy="' + n1(t[1]) + '" rx="' + n1(rx2) + '" ry="' + n1(ry2) + '" fill="' + nuance(c, 0.18) + '" stroke="' + O + '" stroke-width="' + EP + '"/>';
    return cote + ombre + haut;
  }
  function ombreSol(k, u, v, du, dv) {
    var P = k.P, m = 0.06;
    return '<path d="' + chemin([P(u - m, v - m, 0), P(u + du + m, v - m, 0), P(u + du + m, v + dv + m, 0), P(u - m, v + dv + m, 0)], 6) + '" fill="#000" opacity="0.18"/>';
  }

  // ---------- Vues de la fenêtre (dessinées dans la vitre : x 8,5 à 31,5, y 7,5 à 42,5) ----------
  // lieux : écrans de la Vallée qui la débloquent (vide = toujours là)
  var VUES = [
    { id: 'pre', nom: 'Le pré', lieux: [] },
    { id: 'village', nom: 'Le village', lieux: [] },
    { id: 'foret', nom: 'La forêt', lieux: ['sapins', 'chene', 'bosquet', 'clairiere'] },
    { id: 'ruisseau', nom: 'Le ruisseau', lieux: ['ruisseau'] },
    { id: 'marais', nom: 'Le marais', lieux: ['marais1', 'marais2', 'marais3'] },
    { id: 'montagne', nom: 'La montagne', lieux: ['montagne1', 'montagne2', 'montagne3'] },
    { id: 'terres', nom: 'Les Terres', lieux: ['t-'] }
  ];
  function vueOuverte(v, vus) {
    if (!v.lieux.length) return true;
    return (vus || []).some(function (id) { return v.lieux.some(function (l) { return l === 't-' ? String(id).indexOf('t-') === 0 : id === l; }); });
  }
  function vueFenetre(vue, nuit) {
    var ciel = { pre: '#9fd0ee', village: '#a9d6f0', foret: '#a7d3e6', ruisseau: '#9fd0ee', marais: '#c4d8cc', montagne: '#8fc4ea', terres: '#cdbfe0' }[vue] || '#9fd0ee';
    var s = '<rect x="8.5" y="7.5" width="23" height="35" fill="' + (nuit ? '#1c2547' : ciel) + '"/>';
    if (!nuit) s += '<path d="M12 15 q2 -3 5 -1 q3 -2 4 1 q2 0 1 2 h-10 q-1 -2 0 -2z" fill="#fff" opacity="0.9"/>';
    if (vue === 'village') {
      s += '<path d="M8.5 34 H31.5 V42.5 H8.5Z" fill="#8bc47a"/>';
      s += '<rect x="10.5" y="27" width="8" height="8" fill="#efe2c8" stroke="' + O + '" stroke-width="0.7"/><path d="M9.5 27.5 L14.5 22 L19.5 27.5Z" fill="#b5462f" stroke="' + O + '" stroke-width="0.7"/>';
      s += '<rect x="21" y="29" width="8" height="6" fill="#e6d3b0" stroke="' + O + '" stroke-width="0.7"/><path d="M20 29.5 L25 24.5 L30 29.5Z" fill="#7a4b3a" stroke="' + O + '" stroke-width="0.7"/>';
      s += '<rect x="13.3" y="29.5" width="2.4" height="2.4" fill="' + (nuit ? '#ffd43b' : '#5c7a96') + '"/><rect x="24" y="30.5" width="2" height="2" fill="' + (nuit ? '#ffd43b' : '#5c7a96') + '"/>';
      s += '<path d="M8.5 38 Q20 35 31.5 38 V42.5 H8.5Z" fill="#6aa35c"/>';
    } else if (vue === 'foret') {
      s += '<path d="M8.5 32 H31.5 V42.5 H8.5Z" fill="#4f7a3f"/>';
      [[11, 20, 7], [17, 17, 8], [23, 21, 7], [29, 18, 8], [14, 26, 6], [26, 27, 6]].forEach(function (a) {
        s += '<path d="M' + a[0] + ' ' + a[1] + ' L' + (a[0] + a[2] / 2) + ' ' + (a[1] + a[2] * 1.8) + ' H' + (a[0] - a[2] / 2) + 'Z" fill="' + (a[1] > 24 ? '#2f5a2c' : '#3f6b3a') + '" stroke="' + O + '" stroke-width="0.5"/>';
      });
    } else if (vue === 'ruisseau') {
      s += '<path d="M8.5 29 Q20 26 31.5 29 V42.5 H8.5Z" fill="#8bc47a"/><path d="M8.5 34 Q16 32 22 35 Q27 37 31.5 35 V40 Q24 42 18 39 Q13 37 8.5 39Z" fill="#5aa0d0" stroke="' + O + '" stroke-width="0.5"/>';
      s += '<path d="M12 36 h4 M20 37.5 h5" stroke="#d6efff" stroke-width="0.8"/><circle cx="27" cy="31" r="1.2" fill="#e8590c"/>';
    } else if (vue === 'marais') {
      s += '<path d="M8.5 30 H31.5 V42.5 H8.5Z" fill="#6f8f7a"/><path d="M8.5 30 Q20 28 31.5 30" stroke="#9fb8a6" stroke-width="1" fill="none"/>';
      s += '<path d="M24 31 Q24 20 28 18 Q33 19 31.5 31Z" fill="#5f7d4e" stroke="' + O + '" stroke-width="0.5"/><path d="M26 22 q-1 6 0 9 M29 21 q1 5 0 9" stroke="#4a6340" stroke-width="0.6" fill="none"/>';
      for (var r = 0; r < 5; r++) s += '<path d="M' + (10 + r * 2.2) + ' 42.5 V' + (33 + (r % 2) * 2) + '" stroke="#4a6340" stroke-width="0.7"/><ellipse cx="' + (10 + r * 2.2) + '" cy="' + (33 + (r % 2) * 2) + '" rx="0.6" ry="1.4" fill="#6b4a35"/>';
      s += '<rect x="8.5" y="26" width="23" height="4" fill="#fff" opacity="' + (nuit ? 0.12 : 0.3) + '"/>';
    } else if (vue === 'montagne') {
      s += '<path d="M8.5 32 L15 18 L19 24 L24 14 L31.5 28 V42.5 H8.5Z" fill="#8a94a6" stroke="' + O + '" stroke-width="0.6"/>';
      s += '<path d="M13.2 21.8 L15 18 L16.8 21.8 L15.5 21 L14.5 22.2Z M21.6 18.8 L24 14 L26.6 19 L25 18.2 L23.4 19.4Z" fill="#fff"/>';
      s += '<path d="M8.5 36 Q20 32 31.5 35 V42.5 H8.5Z" fill="#7cb46a"/>';
    } else if (vue === 'terres') {
      s += '<path d="M8.5 30 Q14 24 20 28 Q26 23 31.5 27 V42.5 H8.5Z" fill="#8b7fa6"/><path d="M8.5 36 Q18 31 31.5 35 V42.5 H8.5Z" fill="#6f6590"/>';
      s += '<rect x="8.5" y="29" width="23" height="2.5" fill="#fff" opacity="0.35"/><rect x="8.5" y="35" width="23" height="2" fill="#fff" opacity="0.25"/>';
    } else {
      s += '<path d="M8.5 33 Q16 27 22 31 Q27 28 31.5 30 V42.5 H8.5Z" fill="#8bc47a"/><path d="M8.5 38 Q20 33 31.5 37 V42.5 H8.5Z" fill="#6aa35c"/>';
      s += '<circle cx="13" cy="39" r="0.8" fill="#ffd43b"/><circle cx="18" cy="40.5" r="0.8" fill="#fff"/><circle cx="25" cy="39.5" r="0.8" fill="#e8590c"/>';
    }
    if (nuit) {
      s += '<rect x="8.5" y="7.5" width="23" height="35" fill="#0d1330" opacity="0.45"/>';
      if (vue === 'village') s += '<rect x="13.3" y="29.5" width="2.4" height="2.4" fill="#ffd43b"/><rect x="24" y="30.5" width="2" height="2" fill="#ffd43b"/>';
      s += '<circle cx="26" cy="12" r="2.4" fill="#fff3bf"/><circle cx="27.2" cy="11.2" r="2" fill="#1c2547"/>';
      [[11, 10], [15, 13], [19, 9], [22, 15], [13, 17]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0.45" fill="#fff"/>'; });
    }
    return s;
  }

  // ---------- Les meubles ----------
  // plan : sol, mur, plafond ; w × d : emprise en cases (orientation 0) ; h : hauteur ; plat : se glisse sous les meubles (tapis)
  // rayon : meubles ou deco (onglets du mode Arranger) ; t : teinte par défaut (nuancier ou couleur) ; z : hauteur du bas (mur)
  // usage : ce que le compagnon y fait (pour plus tard) ; dessin(k, t) en coordonnées propres de l'objet
  var MEUBLES = {
    canape: { nom: 'Canapé', rayon: 'meubles', plan: 'sol', w: 2, d: 1, h: 1.05, t: 'sauge', usage: 'sieste',
      dessin: function (k, t) {
        var s = '', pied = BOIS_S;
        [[0.1, 0.12], [1.78, 0.12], [0.1, 0.78], [1.78, 0.78]].forEach(function (p) { s += boite(k, p[0], p[1], 0, 0.12, 0.1, 0.14, pied, 1); });
        s += boite(k, 0, 0, 0.14, 2, 1, 0.26, nuance(t, -0.06), 2.5);
        s += boite(k, 0, 0, 0.4, 2, 0.3, 0.62, t, 4);
        s += coussin(k, 0.3, 0.22, 0.62, 0.68, 0.16, 0.34, nuance(t, 0.1));
        s += coussin(k, 1.02, 0.22, 0.62, 0.68, 0.16, 0.34, nuance(t, 0.1));
        s += boite(k, 0, 0.3, 0.4, 0.26, 0.7, 0.34, t, 4);
        s += coussin(k, 0.26, 0.3, 0.4, 0.74, 0.68, 0.18, nuance(t, 0.06));
        s += coussin(k, 1.0, 0.3, 0.4, 0.74, 0.68, 0.18, nuance(t, 0.06));
        s += boite(k, 1.74, 0.3, 0.4, 0.26, 0.7, 0.34, t, 4);
        // un petit coussin de couleur
        var c = k.P(0.5, 0.45, 0.8);
        s += '<path d="M' + n1(c[0] - 9) + ' ' + n1(c[1] + 6) + ' Q' + n1(c[0] - 11) + ' ' + n1(c[1] - 8) + ' ' + n1(c[0] - 1) + ' ' + n1(c[1] - 11) + ' Q' + n1(c[0] + 9) + ' ' + n1(c[1] - 8) + ' ' + n1(c[0] + 8) + ' ' + n1(c[1] + 4) +
          ' Q' + n1(c[0]) + ' ' + n1(c[1] + 10) + ' ' + n1(c[0] - 9) + ' ' + n1(c[1] + 6) + 'Z" fill="#d8a73a" stroke="' + O + '" stroke-width="' + EP + '"/>';
        return ombreSol(k, 0, 0, 2, 1) + s;
      } },
    fauteuil: { nom: 'Fauteuil', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.05, t: 'terracotta', usage: 'sieste',
      dessin: function (k, t) {
        var s = '';
        [[0.12, 0.14], [0.78, 0.14], [0.12, 0.78], [0.78, 0.78]].forEach(function (p) { s += boite(k, p[0], p[1], 0, 0.1, 0.1, 0.14, BOIS_S, 1); });
        s += boite(k, 0.04, 0.04, 0.14, 0.92, 0.92, 0.26, nuance(t, -0.06), 2.5);
        s += boite(k, 0.04, 0.04, 0.4, 0.92, 0.28, 0.64, t, 5);
        s += boite(k, 0.04, 0.32, 0.4, 0.22, 0.64, 0.36, t, 4);
        s += coussin(k, 0.26, 0.32, 0.4, 0.48, 0.62, 0.18, nuance(t, 0.08));
        s += boite(k, 0.74, 0.32, 0.4, 0.22, 0.64, 0.36, t, 4);
        return ombreSol(k, 0.04, 0.04, 0.92, 0.92) + s;
      } },
    tableBasse: { nom: 'Table basse', rayon: 'meubles', plan: 'sol', w: 2, d: 1, h: 0.62, t: 'miel', usage: 'jouer',
      dessin: function (k, t) {
        var s = '', bois = t;
        [[0.14, 0.18], [1.74, 0.18], [0.14, 0.7], [1.74, 0.7]].forEach(function (p) { s += boite(k, p[0], p[1], 0, 0.12, 0.12, 0.36, nuance(bois, -0.15), 1); });
        s += boite(k, 0.06, 0.1, 0.36, 1.88, 0.8, 0.09, bois, 3);
        s += boite(k, 0.3, 0.3, 0.45, 0.42, 0.3, 0.07, '#4f6e9a', 1.5) + boite(k, 0.33, 0.33, 0.52, 0.36, 0.26, 0.06, '#c25b4a', 1.5);
        s += cylindre(k, 1.45, 0.52, 0.45, 0.09, 0.15, '#efe2c8') + '<ellipse cx="' + n1(k.P(1.45, 0.52, 0.6)[0]) + '" cy="' + n1(k.P(1.45, 0.52, 0.6)[1]) + '" rx="3.2" ry="1.6" fill="#6b4a35"/>';
        return ombreSol(k, 0.06, 0.1, 1.88, 0.8) + s;
      } },
    tapis: { nom: 'Tapis', rayon: 'deco', plan: 'sol', w: 2, d: 2, h: 0, plat: true, t: 'brique',
      dessin: function (k, t) {
        var c2 = '#efe2c8', s = '<g transform="' + plan(k, [0, 0, 0], [1, 0, 0], [0, 1, 0]) + '">';
        s += '<rect x="4" y="4" width="72" height="72" rx="7" fill="' + t + '" stroke="' + O + '" stroke-width="' + EP * 1.6 + '"/>';
        s += '<rect x="10" y="10" width="60" height="60" rx="4" fill="none" stroke="' + c2 + '" stroke-width="2.4"/>';
        s += '<rect x="15" y="15" width="50" height="50" rx="3" fill="none" stroke="' + nuance(t, -0.25) + '" stroke-width="1.4"/>';
        s += '<path d="M40 22 L58 40 L40 58 L22 40 Z" fill="' + nuance(t, 0.25) + '" stroke="' + c2 + '" stroke-width="2"/>';
        s += '<path d="M40 31 L49 40 L40 49 L31 40 Z" fill="#d8a73a" stroke="' + nuance(t, -0.25) + '" stroke-width="1.2"/>';
        [[22, 22], [58, 22], [22, 58], [58, 58]].forEach(function (p) { s += '<path d="M' + p[0] + ' ' + (p[1] - 4) + ' l4 4 l-4 4 l-4 -4 Z" fill="' + c2 + '"/>'; });
        for (var x = 9; x <= 71; x += 4) s += '<path d="M' + x + ' 4 v-3 M' + x + ' 76 v3" stroke="' + c2 + '" stroke-width="1.2"/>';
        return s + '</g>';
      } },
    bibliotheque: { nom: 'Bibliothèque', rayon: 'meubles', plan: 'sol', w: 2, d: 1, h: 2.1, t: 'chocolat', usage: 'lire',
      dessin: function (k, t) {
        var s = ombreSol(k, 0, 0, 2, 0.55) + boite(k, 0, 0, 0, 2, 0.55, 2.1, t, 2);
        s += '<g transform="' + plan(k, [0, 0.55, 2.1], [1, 0, 0], [0, 0, -1]) + '">';
        var rangs = [[6, 26], [36, 26], [66, 14]], couleurs = ['#a8483a', '#3d5378', '#d8a73a', '#4f6e4a', '#7d4a6b', '#c9733f', '#efe2c8', '#7f9bb0'], n = 0;
        [[5, 37], [43, 75]].forEach(function (col) {
          rangs.forEach(function (r) {
            s += '<rect x="' + col[0] + '" y="' + r[0] + '" width="' + (col[1] - col[0]) + '" height="' + r[1] + '" fill="' + nuance(t, -0.45) + '" stroke="' + O + '" stroke-width="1.2"/>';
            if (r[1] < 20) {   // rangée basse : un pot et une boîte
              s += '<rect x="' + (col[0] + 4) + '" y="' + (r[0] + 4) + '" width="12" height="' + (r[1] - 4) + '" rx="2" fill="#c9733f" stroke="' + O + '" stroke-width="1"/>';
              s += '<rect x="' + (col[0] + 19) + '" y="' + (r[0] + 6) + '" width="11" height="' + (r[1] - 6) + '" rx="1.5" fill="#efe2c8" stroke="' + O + '" stroke-width="1"/>';
              return;
            }
            var x = col[0] + 1.5;
            while (x < col[1] - 4) {
              var l = 3 + (n * 7 % 4), hh = r[1] - 3 - (n * 5 % 6), c = couleurs[n % couleurs.length]; n++;
              if (x + l > col[1] - 1) break;
              if (n % 7 === 3) {   // un livre penché
                s += '<rect x="' + n1(x + 2) + '" y="' + n1(r[0] + r[1] - hh) + '" width="' + l + '" height="' + hh + '" fill="' + c + '" stroke="' + O + '" stroke-width="0.9" transform="rotate(14 ' + n1(x + 2) + ' ' + (r[0] + r[1]) + ')"/>';
                x += l + 6; continue;
              }
              s += '<rect x="' + n1(x) + '" y="' + n1(r[0] + r[1] - hh) + '" width="' + l + '" height="' + hh + '" fill="' + c + '" stroke="' + O + '" stroke-width="0.9"/>';
              s += '<path d="M' + n1(x + 0.6) + ' ' + n1(r[0] + r[1] - hh + 3) + ' h' + (l - 1.2) + '" stroke="#fff" stroke-opacity="0.45" stroke-width="0.9"/>';
              x += l + 0.6;
            }
          });
        });
        return s + '</g>';
      } },
    commode: { nom: 'Commode', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.2, t: 'miel', usage: '',
      dessin: function (k, t) {
        var s = ombreSol(k, 0.04, 0.06, 0.92, 0.7);
        [[0.08, 0.1], [0.8, 0.1], [0.08, 0.66], [0.8, 0.66]].forEach(function (p) { s += boite(k, p[0], p[1], 0, 0.1, 0.08, 0.12, BOIS_S, 1); });
        s += boite(k, 0.04, 0.06, 0.12, 0.92, 0.7, 0.78, t, 2) + boite(k, 0, 0.02, 0.9, 1, 0.78, 0.07, nuance(t, -0.1), 2);
        s += '<g transform="' + plan(k, [0.04, 0.76, 0.9], [1, 0, 0], [0, 0, -1]) + '">';
        [[3, 9], [13.5, 9], [24, 7]].forEach(function (r) {
          s += '<rect x="3" y="' + r[0] + '" width="31" height="' + r[1] + '" rx="1.5" fill="' + nuance(t, 0.1) + '" stroke="' + O + '" stroke-width="1"/>';
          s += '<circle cx="18.4" cy="' + (r[0] + r[1] / 2) + '" r="1.6" fill="#e9b949" stroke="' + O + '" stroke-width="0.8"/>';
        });
        s += '</g>';
        // un vase et une fleur sur le dessus
        s += cylindre(k, 0.6, 0.4, 0.97, 0.1, 0.22, '#7f9bb0', 0.07);
        var f = k.P(0.6, 0.4, 1.19);
        s += ligne([f, [f[0] + 2, f[1] - 12]], '#4f6e4a', 1.4) + '<circle cx="' + n1(f[0] + 2) + '" cy="' + n1(f[1] - 14) + '" r="3.2" fill="#e8590c" stroke="' + O + '" stroke-width="1"/>';
        return s;
      } },
    lampadaire: { nom: 'Lampadaire', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 2.1, t: 'creme', usage: '', lumiere: { u: 0.5, v: 0.5, z: 1.72, r: 2.4 },
      dessin: function (k, t) {
        var s = '<ellipse cx="' + n1(k.P(0.5, 0.5, 0)[0]) + '" cy="' + n1(k.P(0.5, 0.5, 0)[1]) + '" rx="16" ry="8" fill="#000" opacity="0.16"/>';
        s += cylindre(k, 0.5, 0.5, 0, 0.2, 0.06, '#3a2c22');
        var a = k.P(0.5, 0.5, 0.06), b = k.P(0.5, 0.5, 1.6);
        s += ligne([a, b], O, 4.4) + ligne([a, b], '#8d6a3f', 2.2);
        var c = k.P(0.5, 0.5, 1.75);
        s += '<circle cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" r="20" fill="#ffd43b" opacity="0.14"/>';
        s += cylindre(k, 0.5, 0.5, 1.5, 0.3, 0.42, t, 0.18);
        return s;
      } },
    plante: { nom: 'Grande plante', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 1.5, t: 'terracotta', usage: 'renifler',
      dessin: function (k, t) {
        var s = '<ellipse cx="' + n1(k.P(0.5, 0.5, 0)[0]) + '" cy="' + n1(k.P(0.5, 0.5, 0)[1]) + '" rx="15" ry="7.5" fill="#000" opacity="0.18"/>';
        s += cylindre(k, 0.5, 0.5, 0, 0.2, 0.42, t, 0.26);
        var h = k.P(0.5, 0.5, 0.42);
        s += '<ellipse cx="' + n1(h[0]) + '" cy="' + n1(h[1]) + '" rx="11" ry="5.5" fill="#4a3426"/>';
        // feuilles : celles du fond d'abord
        var feuilles = [[-150, 34, '#3f6b3a'], [150, 36, '#3f6b3a'], [-115, 42, '#4f8a46'], [115, 40, '#4f8a46'], [-170, 30, '#5a9a4f'], [175, 32, '#5a9a4f'], [-70, 34, '#6cae5c'], [70, 33, '#6cae5c'], [-30, 26, '#7cc06a'], [25, 28, '#7cc06a']];
        feuilles.forEach(function (f) {
          var a = f[0] * Math.PI / 180, L = f[1], bx = h[0], by = h[1] - 2;
          var tx = bx + Math.sin(a) * L * 0.8, ty = by - Math.cos(a) * L * 0.7 - L * 0.35;
          var nx = -(ty - by), ny = tx - bx, nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
          var mx = (bx + tx) / 2, my = (by + ty) / 2, lg = L * 0.3;
          s += '<path d="M' + n1(bx) + ' ' + n1(by) + ' Q' + n1(mx + nx * lg) + ' ' + n1(my + ny * lg) + ' ' + n1(tx) + ' ' + n1(ty) + ' Q' + n1(mx - nx * lg) + ' ' + n1(my - ny * lg) + ' ' + n1(bx) + ' ' + n1(by) + 'Z" fill="' + f[2] + '" stroke="' + O + '" stroke-width="1.3" stroke-linejoin="round"/>';
          s += ligne([[bx, by], [mx + nx * 2, my + ny * 2], [tx, ty]], nuance(f[2], -0.3), 0.9, ' opacity="0.8"');
        });
        return s;
      } },
    pouf: { nom: 'Pouf', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 0.45, t: 'moutarde', usage: 'sieste',
      dessin: function (k, t) {
        var c = k.P(0.5, 0.5, 0), s = '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="18" ry="9" fill="#000" opacity="0.18"/>';
        s += cylindre(k, 0.5, 0.5, 0, 0.32, 0.36, t, 0.3);
        var h = k.P(0.5, 0.5, 0.36);
        for (var a = 0; a < 6; a++) {
          var ang = a * Math.PI / 3;
          s += ligne([[h[0], h[1]], [h[0] + Math.cos(ang) * 12, h[1] + Math.sin(ang) * 6]], nuance(t, -0.2), 1, ' opacity="0.7"');
        }
        s += '<circle cx="' + n1(h[0]) + '" cy="' + n1(h[1]) + '" r="2" fill="' + nuance(t, -0.3) + '" stroke="' + O + '" stroke-width="0.8"/>';
        return s;
      } },
    malle: { nom: 'Malle', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 0.75, t: 'chocolat', usage: 'jouer',
      dessin: function (k, t) {
        var s = ombreSol(k, 0.06, 0.18, 0.88, 0.64);
        s += boite(k, 0.06, 0.18, 0, 0.88, 0.64, 0.44, t, 2) + boite(k, 0.03, 0.15, 0.44, 0.94, 0.7, 0.2, nuance(t, 0.08), 4);
        s += '<g transform="' + plan(k, [0.06, 0.82, 0.44], [1, 0, 0], [0, 0, -1]) + '">';
        s += '<rect x="5" y="-0.5" width="4" height="18" fill="#c9a66b" stroke="' + O + '" stroke-width="0.9"/><rect x="26" y="-0.5" width="4" height="18" fill="#c9a66b" stroke="' + O + '" stroke-width="0.9"/>';
        s += '<rect x="14" y="0" width="7" height="7" rx="1" fill="#e9b949" stroke="' + O + '" stroke-width="0.9"/><circle cx="17.5" cy="3.6" r="1" fill="' + O + '"/>';
        s += '</g>';
        return s;
      } },
    poele: { nom: 'Poêle à bois', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 2.6, t: '#3d3f45', usage: 'chaleur', lumiere: { u: 0.71, v: 0.71, z: 0.42, r: 1.7, c: '#ff8a2a' },
      dessin: function (k, t) {
        var c = k.P(0.5, 0.5, 0), s = '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="22" ry="11" fill="#000" opacity="0.18"/>';
        s += boite(k, 0.08, 0.08, 0, 0.84, 0.84, 0.05, '#7a6f66', 2);
        [[0.26, 0.26], [0.66, 0.26], [0.26, 0.66], [0.66, 0.66]].forEach(function (p) { s += boite(k, p[0], p[1], 0.05, 0.08, 0.08, 0.12, '#2a2b30', 1); });
        s += cylindre(k, 0.5, 0.5, 0.17, 0.3, 0.78, t);
        // porte vitrée et le feu
        var f = k.P(0.5, 0.5, 0.42), dx = 0, dy = 0;
        var fr = k.P(0.5 + 0.21, 0.5 + 0.21, 0.42); dx = fr[0] - f[0]; dy = fr[1] - f[1];
        s += '<ellipse cx="' + n1(f[0] + dx) + '" cy="' + n1(f[1] + dy) + '" rx="8.5" ry="10" fill="#1d1a18" stroke="' + O + '" stroke-width="1.2"/>';
        s += '<path d="M' + n1(f[0] + dx - 5) + ' ' + n1(f[1] + dy + 7) + ' Q' + n1(f[0] + dx - 6) + ' ' + n1(f[1] + dy - 2) + ' ' + n1(f[0] + dx - 1) + ' ' + n1(f[1] + dy - 6) + ' Q' + n1(f[0] + dx) + ' ' + n1(f[1] + dy - 1) + ' ' + n1(f[0] + dx + 2) + ' ' + n1(f[1] + dy - 3) +
          ' Q' + n1(f[0] + dx + 6) + ' ' + n1(f[1] + dy + 2) + ' ' + n1(f[0] + dx + 5) + ' ' + n1(f[1] + dy + 7) + 'Z" fill="#ff922b"/>';
        s += '<path d="M' + n1(f[0] + dx - 2) + ' ' + n1(f[1] + dy + 7) + ' Q' + n1(f[0] + dx - 2) + ' ' + n1(f[1] + dy + 2) + ' ' + n1(f[0] + dx + 1) + ' ' + n1(f[1] + dy) + ' Q' + n1(f[0] + dx + 3) + ' ' + n1(f[1] + dy + 4) + ' ' + n1(f[0] + dx + 2) + ' ' + n1(f[1] + dy + 7) + 'Z" fill="#ffe066"/>';
        s += '<circle cx="' + n1(f[0] + dx) + '" cy="' + n1(f[1] + dy + 2) + '" r="22" fill="#ff922b" opacity="0.12"/>';
        // tuyau jusqu'au plafond
        s += cylindre(k, 0.5, 0.5, 0.95, 0.09, 0.08, '#2a2b30') + cylindre(k, 0.5, 0.5, 1.03, 0.065, k.H - 1.03, t, null, false);
        return s;
      } },
    // ----- au mur -----
    fenetre: { nom: 'Fenêtre', rayon: 'deco', plan: 'mur', w: 1, h: 1.25, z: 0.85, t: 'brique',
      dessin: function (k, t) {
        var z = k.z, cadre = k.env.cadre ? teinte(k.env.cadre) : BOIS_C, s = '<g transform="' + plan(k, [0, 0, z + 1.25], [1, 0, 0], [0, 0, -1]) + '">';
        s += '<rect x="5" y="4" width="30" height="42" rx="2" fill="' + cadre + '" stroke="' + O + '" stroke-width="1.6"/>';
        s += vueFenetre(k.env.vue || 'pre', k.env.nuit);
        s += '<rect x="8.5" y="7.5" width="23" height="35" fill="none" stroke="' + O + '" stroke-width="1.1"/>';
        s += '<path d="M20 7.5 V42.5 M8.5 25 H31.5" stroke="' + cadre + '" stroke-width="2.2"/><path d="M20 7.5 V42.5 M8.5 25 H31.5" stroke="' + O + '" stroke-width="0.6" opacity="0.5"/>';
        s += '<path d="M10 10 l6 -2 M10 13 l3 -1" stroke="#fff" stroke-width="1" opacity="' + (k.env.nuit ? 0.25 : 0.7) + '"/>';
        // tringle et rideaux
        s += '<path d="M0 3 H40" stroke="' + O + '" stroke-width="2.6" stroke-linecap="round"/><path d="M0 3 H40" stroke="#c9a66b" stroke-width="1.2" stroke-linecap="round"/>';
        s += '<path d="M0.5 3 H11 Q9 18 12.5 26 Q8 36 9 48 H1.5 Q-0.5 30 0.5 3Z" fill="' + t + '" stroke="' + O + '" stroke-width="1.3" stroke-linejoin="round"/>';
        s += '<path d="M39.5 3 H29 Q31 18 27.5 26 Q32 36 31 48 H38.5 Q40.5 30 39.5 3Z" fill="' + t + '" stroke="' + O + '" stroke-width="1.3" stroke-linejoin="round"/>';
        s += '<path d="M4 6 Q3 25 4 44 M36 6 Q37 25 36 44" stroke="' + nuance(t, -0.25) + '" stroke-width="1" fill="none"/>';
        s += '<path d="M8 25.5 l5 1 M32 25.5 l-5 1" stroke="#d8a73a" stroke-width="2" stroke-linecap="round"/>';
        s += '</g>';
        s += boite(k, 0.08, 0, z - 0.1, 0.84, 0.14, 0.07, cadre, 1.5);
        return s;
      } },
    tableau: { nom: 'Tableau', rayon: 'deco', plan: 'mur', w: 1, h: 0.85, z: 1.25, t: 'miel',
      dessin: function (k, t) {
        var z = k.z, s = '<g transform="' + plan(k, [0, 0, z + 0.85], [1, 0, 0], [0, 0, -1]) + '">';
        s += '<rect x="3" y="2" width="34" height="30" rx="1.5" fill="' + t + '" stroke="' + O + '" stroke-width="1.6"/>';
        s += '<rect x="7" y="6" width="26" height="22" fill="#f3d9a4" stroke="' + O + '" stroke-width="1"/>';
        s += '<circle cx="26" cy="12" r="3.4" fill="#ff922b"/>';
        s += '<path d="M7 22 L14 14 L19 19 L23 15 L33 24 V28 H7Z" fill="#7d4a6b" stroke="' + O + '" stroke-width="0.8" stroke-linejoin="round"/>';
        s += '<path d="M7 25 Q18 20 33 26 V28 H7Z" fill="#4f6e4a"/>';
        s += '<path d="M3 2 L7 6 M37 2 L33 6 M3 32 L7 28 M37 32 L33 28" stroke="' + O + '" stroke-width="0.7" opacity="0.5"/>';
        return s + '</g>';
      } },
    etagere: { nom: 'Étagère murale', rayon: 'deco', plan: 'mur', w: 1, h: 0.6, z: 1.35, t: 'miel',
      dessin: function (k, t) {
        var z = k.z, s = '<g transform="' + plan(k, [0, 0, z], [1, 0, 0], [0, 0, -1]) + '">';
        s += '<path d="M6 0 v8 l6 -6 M34 0 v8 l-6 -6" stroke="' + O + '" stroke-width="2.6" fill="none" stroke-linejoin="round"/><path d="M6 0 v8 l6 -6 M34 0 v8 l-6 -6" stroke="#5c4532" stroke-width="1.2" fill="none"/>';
        s += '</g>';
        s += boite(k, 0.02, 0, z, 0.96, 0.3, 0.07, t, 1.5);
        s += cylindre(k, 0.2, 0.15, z + 0.07, 0.08, 0.26, '#7f9bb0', 0.07) + cylindre(k, 0.2, 0.15, z + 0.33, 0.085, 0.04, '#c9733f');
        s += boite(k, 0.42, 0.04, z + 0.07, 0.12, 0.22, 0.34, '#a8483a', 1) + boite(k, 0.54, 0.04, z + 0.07, 0.1, 0.22, 0.3, '#3d5378', 1) + boite(k, 0.64, 0.04, z + 0.07, 0.13, 0.22, 0.36, '#d8a73a', 1);
        var p = k.P(0.86, 0.15, z + 0.07);
        s += '<path d="M' + n1(p[0] - 4) + ' ' + n1(p[1]) + ' L' + n1(p[0] - 3) + ' ' + n1(p[1] - 6) + ' H' + n1(p[0] + 3) + ' L' + n1(p[0] + 4) + ' ' + n1(p[1]) + 'Z" fill="#efe2c8" stroke="' + O + '" stroke-width="1"/>';
        s += '<path d="M' + n1(p[0]) + ' ' + n1(p[1] - 6) + ' q-6 -4 -5 -10 q4 2 5 10 q1 -8 6 -9 q0 6 -6 9" fill="#6cae5c" stroke="' + O + '" stroke-width="0.9"/>';
        return s;
      } },
    horloge: { nom: 'Horloge', rayon: 'deco', plan: 'mur', w: 1, h: 1, z: 1.45, t: 'chocolat',
      dessin: function (k, t) {
        var z = k.z, s = '<g transform="' + plan(k, [0, 0, z + 1], [1, 0, 0], [0, 0, -1]) + '">';
        s += '<path d="M12 18 V38 Q20 42 28 38 V18Z" fill="' + t + '" stroke="' + O + '" stroke-width="1.4" stroke-linejoin="round"/>';
        s += '<path d="M20 20 V32" stroke="#c9a66b" stroke-width="1.4"/><circle cx="20" cy="33.5" r="3" fill="#e9b949" stroke="' + O + '" stroke-width="1"/>';
        s += '<circle cx="20" cy="13" r="11" fill="' + nuance(t, 0.15) + '" stroke="' + O + '" stroke-width="1.6"/>';
        s += '<circle cx="20" cy="13" r="8.2" fill="#fbf3e6" stroke="' + O + '" stroke-width="1"/>';
        for (var a = 0; a < 12; a++) { var an = a * Math.PI / 6; s += '<circle cx="' + n1(20 + Math.sin(an) * 6.6) + '" cy="' + n1(13 - Math.cos(an) * 6.6) + '" r="' + (a % 3 ? 0.45 : 0.85) + '" fill="' + O + '"/>'; }
        s += '<path d="M20 13 L20 8 M20 13 L24 14.5" stroke="' + O + '" stroke-width="1.3" stroke-linecap="round"/>';
        return s + '</g>';
      } },
    // ----- au plafond -----
    suspension: { nom: 'Suspension', rayon: 'deco', plan: 'plafond', w: 1, d: 1, h: 0.9, t: 'foret', lumiere: { u: 0.5, v: 0.5, zH: -0.88, r: 2.8 },
      dessin: function (k, t) {
        var H = k.H, a = k.P(0.5, 0.5, H), b = k.P(0.5, 0.5, H - 0.55), s = '';
        var sol = k.P(0.5, 0.5, 0);
        s += '<ellipse cx="' + n1(sol[0]) + '" cy="' + n1(sol[1]) + '" rx="46" ry="23" fill="#ffd43b" opacity="0.12"/>';
        s += ligne([a, b], O, 1.4);
        var c = k.P(0.5, 0.5, H - 0.85);
        s += '<circle cx="' + n1(c[0]) + '" cy="' + n1(c[1] + 4) + '" r="16" fill="#ffd43b" opacity="0.16"/>';
        s += '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1] + 1) + '" rx="5" ry="3.5" fill="#fff3bf" stroke="' + O + '" stroke-width="1"/>';
        s += '<path d="M' + n1(c[0] - 15) + ' ' + n1(c[1]) + ' Q' + n1(c[0] - 14) + ' ' + n1(b[1] - 1) + ' ' + n1(c[0]) + ' ' + n1(b[1] - 1) + ' Q' + n1(c[0] + 14) + ' ' + n1(b[1] - 1) + ' ' + n1(c[0] + 15) + ' ' + n1(c[1]) +
          ' Q' + n1(c[0]) + ' ' + n1(c[1] + 5) + ' ' + n1(c[0] - 15) + ' ' + n1(c[1]) + 'Z" fill="' + t + '" stroke="' + O + '" stroke-width="' + EP + '" stroke-linejoin="round"/>';
        s += '<path d="M' + n1(c[0] + 4) + ' ' + n1(b[1] + 1) + ' Q' + n1(c[0] + 12) + ' ' + n1(b[1] + 2) + ' ' + n1(c[0] + 13) + ' ' + n1(c[1] - 1) + ' Q' + n1(c[0] + 8) + ' ' + n1(c[1] + 1) + ' ' + n1(c[0] + 4) + ' ' + n1(c[1] + 1) + 'Z" fill="#000" opacity="0.16"/>';
        return s;
      } }
  };

  // ---------- Habillage : motifs des murs et types de sol (dessinés d'après une teinte) ----------
  var MOTIFS_MUR = [
    { id: 'uni', nom: 'Uni' }, { id: 'rayures', nom: 'Rayures' }, { id: 'fleurs', nom: 'Petites fleurs' },
    { id: 'losanges', nom: 'Losanges' }, { id: 'lambris', nom: 'Lambris', prix: 15 }, { id: 'briques', nom: 'Briques', prix: 20 },
    { id: 'pierre', nom: 'Pierre', prix: 25 }, { id: 'saison', nom: 'De saison', prix: 15 }
  ];
  var SOLS = [
    { id: 'parquet', nom: 'Parquet' }, { id: 'chevrons', nom: 'Chevrons', prix: 20 }, { id: 'tomettes', nom: 'Tomettes' },
    { id: 'damier', nom: 'Damier' }, { id: 'moquette', nom: 'Moquette' }, { id: 'dalles', nom: 'Dalles', prix: 15 },
    { id: 'herbe', nom: 'Herbe' }
  ];
  // Finitions : plinthes (bas des murs) et corniche (haut des murs)
  var PLINTHES = [
    { id: 'aucune', nom: 'Aucune' }, { id: 'simple', nom: 'Simple' }, { id: 'haute', nom: 'Haute' }, { id: 'lambris', nom: 'Lambris', prix: 10 }
  ];
  var AMBIANCES = [
    { id: 'chaude', nom: 'Chaude', c: '#ffb15c', lampe: '#ffc777' }, { id: 'neutre', nom: 'Neutre', c: null, lampe: '#fff0c4' }, { id: 'froide', nom: 'Froide', c: '#8fb8ff', lampe: '#dbe8ff' }
  ];
  // Motif de saison : flocons l'hiver, fleurs au printemps, soleils l'été, feuilles à l'automne
  function saisonDe(t) { var m = new Date(t || Date.now()).getMonth(); return m === 11 || m < 2 ? 'hiver' : m < 5 ? 'printemps' : m < 8 ? 'ete' : 'automne'; }
  function motifMur(id, motif, t) {
    var f = nuance(t, -0.12), c = nuance(t, 0.3), s;
    switch (motif) {
      case 'rayures': s = '<pattern id="' + id + '" width="16" height="40" patternUnits="userSpaceOnUse"><rect width="16" height="40" fill="' + t + '"/><rect width="6" height="40" fill="' + f + '"/><rect x="7.5" width="1" height="40" fill="' + c + '"/></pattern>'; break;
      case 'fleurs': s = '<pattern id="' + id + '" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="' + t + '"/>' +
        [[5, 5], [15, 15]].map(function (p) { return [0, 1, 2, 3].map(function (a) { return '<circle cx="' + (p[0] + [1.5, 0, -1.5, 0][a]) + '" cy="' + (p[1] + [0, 1.5, 0, -1.5][a]) + '" r="1.3" fill="' + c + '"/>'; }).join('') + '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0.9" fill="#d8a73a"/>'; }).join('') +
        '<path d="M15 5 l1 1 M5 15 l-1 1" stroke="' + f + '" stroke-width="0.9"/></pattern>'; break;
      case 'losanges': s = '<pattern id="' + id + '" width="16" height="20" patternUnits="userSpaceOnUse"><rect width="16" height="20" fill="' + t + '"/><path d="M8 0 L16 10 L8 20 L0 10Z" fill="none" stroke="' + f + '" stroke-width="1.1"/><circle cx="8" cy="10" r="1.2" fill="' + c + '"/></pattern>'; break;
      case 'lambris': s = '<pattern id="' + id + '" width="10" height="40" patternUnits="userSpaceOnUse"><rect width="10" height="40" fill="' + t + '"/><rect width="1.4" height="40" fill="' + f + '"/><rect x="1.4" width="1" height="40" fill="' + c + '" opacity="0.6"/></pattern>'; break;
      case 'briques': s = '<pattern id="' + id + '" width="20" height="10" patternUnits="userSpaceOnUse"><rect width="20" height="10" fill="' + c + '"/>' +
        '<rect x="0.6" y="0.6" width="18.8" height="3.8" rx="0.8" fill="' + t + '"/><rect x="-9.4" y="5.6" width="18.8" height="3.8" rx="0.8" fill="' + f + '"/><rect x="10.6" y="5.6" width="18.8" height="3.8" rx="0.8" fill="' + f + '"/></pattern>'; break;
      case 'pierre': s = '<pattern id="' + id + '" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="' + nuance(t, -0.3) + '"/>' +
        '<rect x="1" y="1" width="15" height="8" rx="2.5" fill="' + t + '"/><rect x="17" y="1" width="22" height="8" rx="2.5" fill="' + nuance(t, 0.08) + '"/>' +
        '<rect x="-6" y="11" width="18" height="8" rx="2.5" fill="' + nuance(t, 0.05) + '"/><rect x="13" y="11" width="13" height="8" rx="2.5" fill="' + t + '"/><rect x="27" y="11" width="18" height="8" rx="2.5" fill="' + nuance(t, -0.06) + '"/>' +
        '<path d="M3 3 h5 M20 3 h6 M16 13 h4" stroke="' + c + '" stroke-width="0.8" opacity="0.6"/></pattern>'; break;
      case 'saison':
        var sa = saisonDe(), dessinS = {
          hiver: function (x, y) { return '<path d="M' + x + ' ' + (y - 2.5) + ' v5 M' + (x - 2.2) + ' ' + (y - 1.2) + ' l4.4 2.4 M' + (x - 2.2) + ' ' + (y + 1.2) + ' l4.4 -2.4" stroke="' + c + '" stroke-width="0.9" stroke-linecap="round"/>'; },
          printemps: function (x, y) { return [0, 1, 2, 3, 4].map(function (a) { var an = a * 1.2566; return '<circle cx="' + n1(x + Math.cos(an) * 1.5) + '" cy="' + n1(y + Math.sin(an) * 1.5) + '" r="1.1" fill="#e8a0b4"/>'; }).join('') + '<circle cx="' + x + '" cy="' + y + '" r="0.8" fill="#d8a73a"/>'; },
          ete: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="1.6" fill="#f5c542"/><path d="M' + (x - 3) + ' ' + y + ' h1 M' + (x + 2) + ' ' + y + ' h1 M' + x + ' ' + (y - 3) + ' v1 M' + x + ' ' + (y + 2) + ' v1" stroke="#f5c542" stroke-width="0.7"/>'; },
          automne: function (x, y) { return '<path d="M' + x + ' ' + (y - 2.5) + ' Q' + (x + 2.5) + ' ' + y + ' ' + x + ' ' + (y + 2.5) + ' Q' + (x - 2.5) + ' ' + y + ' ' + x + ' ' + (y - 2.5) + 'Z" fill="#c9733f"/><path d="M' + x + ' ' + (y - 2) + ' V' + (y + 3) + '" stroke="' + f + '" stroke-width="0.5"/>'; }
        }[sa];
        s = '<pattern id="' + id + '" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="' + t + '"/>' + dessinS(6, 6) + dessinS(18, 18) + '</pattern>'; break;
      default: s = '<pattern id="' + id + '" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="' + t + '"/></pattern>';
    }
    return s;
  }
  function motifSol(id, type, t) {
    var f = nuance(t, -0.18), c = nuance(t, 0.15), s;
    switch (type) {
      case 'chevrons': s = '<pattern id="' + id + '" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="' + t + '"/>' +
        '<path d="M0 10 L10 0 L20 10 M0 20 L10 10 L20 20" fill="none" stroke="' + f + '" stroke-width="1.1"/><path d="M5 5 L10 10 M15 5 L10 10 M5 15 L10 20 M15 15 L10 20" stroke="' + f + '" stroke-width="0.8"/>' +
        '<path d="M0 10 L5 5 L10 10 L5 15Z" fill="' + c + '" opacity="0.5"/></pattern>'; break;
      case 'tomettes': s = '<pattern id="' + id + '" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="' + nuance(t, 0.35) + '"/>' +
        '<path d="M5 1 H15 L19 5 V15 L15 19 H5 L1 15 V5Z" fill="' + t + '"/><path d="M-1 -1 h2 v2 h-2z M19 -1 h2 v2 h-2z M-1 19 h2 v2 h-2z M19 19 h2 v2 h-2z" fill="' + f + '"/></pattern>'; break;
      case 'damier': s = '<pattern id="' + id + '" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="' + nuance(t, 0.55) + '"/><rect width="20" height="20" fill="' + t + '"/><rect x="20" y="20" width="20" height="20" fill="' + t + '"/></pattern>'; break;
      case 'moquette': s = '<pattern id="' + id + '" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="' + t + '"/><circle cx="3" cy="4" r="0.7" fill="' + c + '"/><circle cx="9" cy="9" r="0.7" fill="' + f + '"/></pattern>'; break;
      case 'dalles': s = '<pattern id="' + id + '" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="' + f + '"/>' +
        '<rect x="1" y="1" width="23" height="18" rx="2" fill="' + t + '"/><rect x="26" y="1" width="13" height="18" rx="2" fill="' + c + '"/><rect x="1" y="21" width="14" height="18" rx="2" fill="' + c + '"/><rect x="17" y="21" width="22" height="18" rx="2" fill="' + t + '"/></pattern>'; break;
      case 'herbe': s = '<pattern id="' + id + '" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="' + t + '"/>' +
        '<path d="M3 6 l1 -3 M4.5 6 l0 -3.5 M11 13 l1 -3 M12.5 13 l-0.5 -3.5" stroke="' + f + '" stroke-width="0.9" stroke-linecap="round"/><circle cx="9" cy="4" r="0.8" fill="#fff8e7" opacity="0.8"/></pattern>'; break;
      default: s = '<pattern id="' + id + '" width="80" height="20" patternUnits="userSpaceOnUse"><rect width="80" height="20" fill="' + t + '"/>' +
        '<rect y="10" width="80" height="10" fill="' + nuance(t, -0.06) + '"/><path d="M0 10 H80 M0 20 H80" stroke="' + f + '" stroke-width="1"/><path d="M26 0 V10 M66 0 V10 M8 10 V20 M48 10 V20" stroke="' + f + '" stroke-width="1"/>' +
        '<path d="M4 4 h12 M40 15 h14" stroke="' + c + '" stroke-width="0.8" opacity="0.6"/></pattern>';
    }
    return s;
  }

  // ---------- Emprise, collisions ----------
  function emprise(ob) {
    var m = MEUBLES[ob.m];
    if (m.plan === 'mur') return { k0: ob.o ? ob.j : ob.i, k1: (ob.o ? ob.j : ob.i) + m.w, z0: ob.z, z1: ob.z + m.h, mur: ob.o };
    var w = ob.o ? m.d : m.w, d = ob.o ? m.w : m.d;
    return { i0: ob.i, j0: ob.j, i1: ob.i + w, j1: ob.j + d };
  }
  // L'objet tient-il dans la pièce sans toucher les autres ? (le compagnon compte comme un objet de 1 × 1)
  function placeLibre(piece, ob, ignorer) {
    var m = MEUBLES[ob.m], e = emprise(ob);
    if (m.plan === 'mur') {
      var lon = e.mur ? piece.p : piece.l;
      if (e.k0 < 0 || e.k1 > lon || e.z0 < 0.15 || e.z1 > (piece.h || HAUTEUR) - 0.15) return false;
      return piece.objets.every(function (a) {
        if (a === ignorer || a === ob || MEUBLES[a.m].plan !== 'mur') return true;
        var b = emprise(a);
        return b.mur !== e.mur || b.k1 <= e.k0 || b.k0 >= e.k1 || b.z1 <= e.z0 || b.z0 >= e.z1;
      });
    }
    if (e.i0 < 0 || e.j0 < 0 || e.i1 > piece.l || e.j1 > piece.p) return false;
    return piece.objets.every(function (a) {
      if (a === ignorer || a === ob) return true;
      var ma = MEUBLES[a.m];
      if (ma.plan !== m.plan || !!ma.plat !== !!m.plat) return true;    // un tapis passe sous un meuble ; le plafond ne gêne pas le sol
      var b = emprise(a);
      return b.i1 <= e.i0 || b.i0 >= e.i1 || b.j1 <= e.j0 || b.j0 >= e.j1;
    });
  }
  function caseOccupee(piece, i, j, ignorer) {
    return piece.objets.some(function (a) {
      var m = MEUBLES[a.m]; if (a === ignorer || m.plan !== 'sol' || m.plat) return false;
      var b = emprise(a); return i >= b.i0 && i < b.i1 && j >= b.j0 && j < b.j1;
    });
  }

  // ---------- La pièce ----------
  // Bornes de la pièce à l'écran (pour la caméra)
  function bornes(piece) {
    var H = piece.h || HAUTEUR, m = 14;
    return { x0: proj(0, piece.p)[0] - m - 8, x1: proj(piece.l, 0)[0] + m + 8, y0: proj(0, 0, H)[1] - m - 8, y1: proj(piece.l, piece.p)[1] + BORD + m };
  }
  // Caméra : zoom (1 = toute la pièce) et centre (coordonnées du SVG) → viewBox, sans sortir de la pièce
  function camera(piece, zoom, cx, cy) {
    var b = bornes(piece), W = b.x1 - b.x0, Hh = b.y1 - b.y0, z = Math.max(1, zoom || 1), w = W / z, h = Hh / z;
    var x = cx == null ? b.x0 + (W - w) / 2 : Math.min(b.x1 - w, Math.max(b.x0, cx - w / 2));
    var y = cy == null ? b.y0 + (Hh - h) / 2 : Math.min(b.y1 - h, Math.max(b.y0, cy - h / 2));
    return [n1(x), n1(y), n1(w), n1(h)].join(' ');
  }
  // Ordre de dessin au sol : un objet passe derrière celui qui est entièrement devant lui
  function ordonner(liste) {
    var reste = liste.slice(), sortie = [];
    function derriere(a, b) { return a.e.i1 <= b.e.i0 || a.e.j1 <= b.e.j0; }   // a est derrière b
    while (reste.length) {
      var k = 0;
      for (var x = 0; x < reste.length; x++) {
        if (!reste.some(function (y, n) { return n !== x && derriere(y, reste[x]) && !derriere(reste[x], y); })) { k = x; break; }
      }
      sortie.push(reste.splice(k, 1)[0]);
    }
    return sortie;
  }
  // Dessin d'un objet seul (dans la pièce ou en vignette)
  function dessinObjet(ob, H, env) {
    var m = MEUBLES[ob.m]; if (!m) return '';
    var t = teinte(ob.t || m.t), k;
    if (m.plan === 'mur') k = ob.o ? contexte(0, ob.j, 1, ob.z, H, env) : contexte(ob.i, 0, 0, ob.z, H, env);
    else k = contexte(ob.i, ob.j, ob.o ? 1 : 0, 0, H, env);
    return m.dessin(k, t);
  }
  // Valeurs par défaut de l'habillage (une pièce d'avant n'a pas tous les champs)
  function habillage(piece) {
    return {
      murs: piece.murs || { motif: 'uni', teinte: 'creme' }, murD: piece.murD || null, sol: piece.sol || { type: 'parquet', teinte: 'miel' },
      plinthe: piece.plinthe || { type: 'simple', teinte: null }, corniche: !!piece.corniche,
      fenetre: piece.fenetre || { vue: 'pre', cadre: null }, lumiere: piece.lumiere || { ambiance: 'chaude' }
    };
  }
  // Plinthes et corniche d'un mur, dans le repère à plat du mur (40 unités par case, y vers le bas depuis le haut du mur)
  function finitions(lon, Hu, tm, hb, ech) {
    var pl = hb.plinthe, c = pl.teinte ? teinte(pl.teinte) : nuance(tm, pl.type === 'lambris' ? -0.3 : -0.35), s = '', E = ech || 1;
    if (pl.type === 'simple') {
      var hs = 5.2 * E;
      s += '<rect y="' + (Hu - hs) + '" width="' + lon + '" height="' + hs + '" fill="' + c + '"/><path d="M0 ' + (Hu - hs) + ' H' + lon + '" stroke="' + nuance(c, 0.45) + '" stroke-width="1.2"/>';
    } else if (pl.type === 'haute') {
      var hh = 11 * E;
      s += '<rect y="' + (Hu - hh) + '" width="' + lon + '" height="' + hh + '" fill="' + c + '"/><path d="M0 ' + (Hu - hh) + ' H' + lon + '" stroke="' + nuance(c, 0.5) + '" stroke-width="1.6"/>' +
        '<path d="M0 ' + (Hu - hh * 0.77) + ' H' + lon + '" stroke="' + nuance(c, -0.25) + '" stroke-width="0.9"/><path d="M0 ' + (Hu - hh * 0.27) + ' H' + lon + '" stroke="' + nuance(c, -0.2) + '" stroke-width="0.7"/>';
    } else if (pl.type === 'lambris') {
      var hl = Math.min(38 * E, Hu * 0.6), y0 = Hu - hl, l = '';
      for (var x = 10; x < lon; x += 10) l += 'M' + x + ' ' + (y0 + 3) + ' V' + (Hu - 4);
      s += '<rect y="' + y0 + '" width="' + lon + '" height="' + hl + '" fill="' + c + '"/><path d="' + l + '" stroke="' + nuance(c, -0.2) + '" stroke-width="1"/>' +
        '<rect y="' + (y0 - 1) + '" width="' + lon + '" height="4" fill="' + nuance(c, 0.2) + '"/><path d="M0 ' + (y0 - 1) + ' H' + lon + '" stroke="' + O + '" stroke-width="0.8" opacity="0.6"/>' +
        '<rect y="' + (Hu - 4) + '" width="' + lon + '" height="4" fill="' + nuance(c, -0.3) + '"/>';
    }
    if (hb.corniche) {
      var cc = '#f3eadb';
      s += '<rect width="' + lon + '" height="5" fill="' + cc + '"/><path d="M0 5 H' + lon + '" stroke="' + nuance(cc, -0.35) + '" stroke-width="1.2"/><path d="M0 2.4 H' + lon + '" stroke="' + nuance(cc, -0.15) + '" stroke-width="0.7"/>';
    }
    return s;
  }

  // piece = { l, p, h, murs: { motif, teinte }, murD (mur droit, s'il diffère), sol: { type, teinte }, plinthe: { type, teinte }, corniche,
  //           fenetre: { vue, cadre }, lumiere: { ambiance }, objets: [{ m, i, j, o, z, t }] }
  // options : { id (préfixe des motifs), grille, choisi (index), apercu: { i, j, w, d, ok } ou { mur, k, z, w, h, ok }, compagnon: { i, j, svg, ech }, nuit }
  function scene(piece, options) {
    var op = options || {}, id = op.id || 'pm', l = piece.l, p = piece.p, H = piece.h || HAUTEUR, hb = habillage(piece);
    var mG = hb.murs, mD = hb.murD || hb.murs, tg = teinte(mG.teinte), td = teinte(mD.teinte), ts = teinte(hb.sol.teinte), s = '';
    var nuit = !!op.nuit, amb = AMBIANCES.filter(function (a) { return a.id === hb.lumiere.ambiance; })[0] || AMBIANCES[0];
    var env = { nuit: nuit, vue: hb.fenetre.vue, cadre: hb.fenetre.cadre };
    var e = 0.22;
    // contour de la pièce (sert à poser la nuit et les lumières seulement sur elle)
    var contour = [proj(-e, -e, H), proj(l, -e, H), proj(l, -e, 0), [proj(l, 0)[0], proj(l, 0)[1] + BORD], [proj(l, p)[0], proj(l, p)[1] + BORD], [proj(0, p)[0], proj(0, p)[1] + BORD], proj(-e, p, 0), proj(-e, p, H)];
    s += '<defs>' + motifMur(id + '-murg', mG.motif, tg) + motifMur(id + '-mur', mD.motif, td) + motifSol(id + '-sol', hb.sol.type, ts) +
      '<clipPath id="' + id + '-piece"><path d="' + chemin(contour) + '"/></clipPath>';
    // halos des lampes (dégradés : un seul jeu d'identifiants par scène)
    var lampes = [];
    if (nuit) piece.objets.forEach(function (ob, n) {
      var m = MEUBLES[ob.m]; if (!m || !m.lumiere) return;
      var L = m.lumiere, k = contexte(ob.i, ob.j, ob.o ? 1 : 0, 0, H), z = L.zH != null ? H + L.zH : L.z, c = L.c || amb.lampe;
      lampes.push({ n: n, pt: k.P(L.u, L.v, z), sol: k.P(L.u, L.v, 0), r: L.r * TW, c: c });
      s += '<radialGradient id="' + id + '-gl' + n + '"><stop offset="0" stop-color="' + c + '" stop-opacity="0.85"/><stop offset="0.45" stop-color="' + c + '" stop-opacity="0.35"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="' + id + '-gm' + n + '"><stop offset="0" stop-color="#000" stop-opacity="0.9"/><stop offset="0.5" stop-color="#000" stop-opacity="0.45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>';
    });
    // la nuit est un voile percé autour des lampes : ce qui est près d'une lampe reste éclairé, sans être délavé
    if (nuit) {
      s += '<mask id="' + id + '-nuit" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="4000" height="4000"><rect x="-2000" y="-2000" width="4000" height="4000" fill="#fff"/>';
      lampes.forEach(function (L) {
        s += '<circle cx="' + n1(L.pt[0]) + '" cy="' + n1(L.pt[1]) + '" r="' + n1(L.r * 0.8) + '" fill="url(#' + id + '-gm' + L.n + ')"/>' +
          '<ellipse cx="' + n1(L.sol[0]) + '" cy="' + n1(L.sol[1]) + '" rx="' + n1(L.r * 1.1) + '" ry="' + n1(L.r * 0.6) + '" fill="url(#' + id + '-gm' + L.n + ')"/>';
      });
      s += '</mask>';
    }
    s += '</defs>';
    // plancher vu de face
    var A = proj(0, p), B = proj(l, p), C = proj(l, 0);
    s += poly([A, B, [B[0], B[1] + BORD], [A[0], A[1] + BORD]], '#5c4532') + poly([B, C, [C[0], C[1] + BORD], [B[0], B[1] + BORD]], '#3f3026');
    // sol
    s += '<g transform="' + matrice(proj(0, 0), proj(1, 0), proj(0, 1)) + '"><rect width="' + l * U + '" height="' + p * U + '" fill="url(#' + id + '-sol)"/>' +
      '<rect width="' + l * U + '" height="' + p * U + '" fill="none" stroke="' + O + '" stroke-width="2"/>';
    s += '<path d="M0 0 H' + l * U + ' L' + (l * U - 10) + ' 10 H10 V' + (p * U - 10) + ' L0 ' + p * U + 'Z" fill="#000" opacity="0.14"/>';
    if (op.grille) {
      var g = '';
      for (var a = 1; a < l; a++) g += 'M' + a * U + ' 0 V' + p * U;
      for (var b2 = 1; b2 < p; b2++) g += 'M0 ' + b2 * U + ' H' + l * U;
      s += '<path d="' + g + '" stroke="#fff8e7" stroke-opacity="0.38" stroke-width="1.2" stroke-dasharray="4 3"/>';
    }
    s += '</g>';
    // murs (gauche plus clair, droit plus sombre), finitions
    var Hu = H * U;
    s += '<g transform="' + matrice(proj(0, 0, H), proj(0, 1, H), proj(0, 0, H - 1)) + '"><rect width="' + p * U + '" height="' + Hu + '" fill="url(#' + id + '-murg)"/>' +
      finitions(p * U, Hu, tg, hb, false) + '<rect width="' + p * U + '" height="' + Hu + '" fill="none" stroke="' + O + '" stroke-width="2"/></g>';
    s += '<g transform="' + matrice(proj(0, 0, H), proj(1, 0, H), proj(0, 0, H - 1)) + '"><rect width="' + l * U + '" height="' + Hu + '" fill="url(#' + id + '-mur)"/>' +
      finitions(l * U, Hu, td, hb, true) + '<rect width="' + l * U + '" height="' + Hu + '" fill="#1b130e" opacity="0.2"/>' +
      '<rect width="' + l * U + '" height="' + Hu + '" fill="none" stroke="' + O + '" stroke-width="2"/></g>';
    s += ligne([proj(0, 0, 0), proj(0, 0, H)], nuance(tg, -0.3), 1.6);
    // dessus des murs (épaisseur) et leurs bouts
    s += poly([proj(-e, -e, H), proj(l, -e, H), proj(l, 0, H), proj(0, 0, H), proj(0, p, H), proj(-e, p, H)], '#5c4532', 1);
    s += poly([proj(l, -e, H), proj(l, 0, H), proj(l, 0, 0), proj(l, -e, 0)], '#3f3026', 1);
    s += poly([proj(0, p, H), proj(-e, p, H), proj(-e, p, 0), proj(0, p, 0)], '#4b3a2c', 1);
    // objets
    var murs = [], plats = [], sols = [], plafonds = [];
    piece.objets.forEach(function (ob, n) {
      var m = MEUBLES[ob.m]; if (!m) return;
      var x = { ob: ob, n: n, e: emprise(ob) };
      (m.plan === 'mur' ? murs : m.plan === 'plafond' ? plafonds : m.plat ? plats : sols).push(x);
    });
    // lumière qui entre par les fenêtres (soleil le jour, lune la nuit), posée sur le sol
    murs.forEach(function (x) {
      if (x.ob.m !== 'fenetre') return;
      var q = x.ob.o ? function (u, v) { return proj(v, x.ob.j + u); } : function (u, v) { return proj(x.ob.i + u, v); };
      s += '<path d="' + chemin([q(0.15, 0.08), q(0.85, 0.08), q(1.3, 1.9), q(0.6, 1.9)], 4) + '" fill="' + (nuit ? '#9fb8ff' : '#fff3c4') + '" opacity="' + (nuit ? 0.1 : 0.22) + '" style="mix-blend-mode:screen"/>';
    });
    function enveloppe(x) {
      return '<g class="obj' + (op.choisi === x.n ? ' choisi' : '') + (op.fantome === x.n ? ' fantome' : '') + '" data-n="' + x.n + '">' + dessinObjet(x.ob, H, env) + '</g>';
    }
    var ap = '';
    if (op.apercu) {
      var c = op.apercu.ok ? '#8ce99a' : '#ff6b6b';
      if (op.apercu.mur != null) {
        var q = op.apercu, P = q.mur ? function (k, z) { return proj(0, k, z); } : function (k, z) { return proj(k, 0, z); };
        ap = poly([P(q.k, q.z), P(q.k + q.w, q.z), P(q.k + q.w, q.z + q.h), P(q.k, q.z + q.h)], c, 3, 1.4, ' fill-opacity="0.35" stroke-dasharray="4 3"');
      } else {
        var r = op.apercu;
        ap = poly([proj(r.i, r.j), proj(r.i + r.w, r.j), proj(r.i + r.w, r.j + r.d), proj(r.i, r.j + r.d)], c, 3, 1.6, ' fill-opacity="0.4"');
      }
    }
    murs.forEach(function (x) { s += enveloppe(x); });
    plats.forEach(function (x) { s += enveloppe(x); });
    if (op.compagnon) sols.push({ cp: true, e: { i0: op.compagnon.i, j0: op.compagnon.j, i1: op.compagnon.i + 1, j1: op.compagnon.j + 1 } });
    ordonner(sols).forEach(function (x) {
      if (!x.cp) { s += enveloppe(x); return; }
      var cp = op.compagnon, b = proj(cp.i + 0.5, cp.j + 0.5), w = 200 * cp.ech, h = 216 * cp.ech;
      s += '<g class="compagnon"><ellipse cx="' + n1(b[0]) + '" cy="' + n1(b[1]) + '" rx="' + n1(w * 0.3) + '" ry="' + n1(w * 0.13) + '" fill="#000" opacity="0.22"/>' +
        '<svg x="' + n1(b[0] - w / 2) + '" y="' + n1(b[1] - h * 0.95) + '" width="' + n1(w) + '" height="' + n1(h) + '" viewBox="0 -6 200 216" overflow="visible">' + cp.svg + '</svg></g>';
    });
    plafonds.forEach(function (x) { s += enveloppe(x); });
    // ambiance de la pièce, puis la nuit et ses lampes (seulement sur la pièce)
    var voile = '';
    if (amb.c) voile += '<rect x="-2000" y="-2000" width="4000" height="4000" fill="' + amb.c + '" opacity="' + (nuit ? 0.2 : 0.25) + '" style="mix-blend-mode:soft-light"/>';
    if (nuit) {
      voile += '<rect x="-2000" y="-2000" width="4000" height="4000" fill="#4a5490" mask="url(#' + id + '-nuit)" style="mix-blend-mode:multiply"/>';
      lampes.forEach(function (L) {
        // teinte chaude autour de la lampe (sans délaver), et un petit cœur lumineux sur l'abat-jour seulement
        voile += '<circle cx="' + n1(L.pt[0]) + '" cy="' + n1(L.pt[1]) + '" r="' + n1(L.r) + '" fill="url(#' + id + '-gl' + L.n + ')" opacity="0.55" style="mix-blend-mode:soft-light"/>';
        voile += '<ellipse cx="' + n1(L.sol[0]) + '" cy="' + n1(L.sol[1]) + '" rx="' + n1(L.r * 1.1) + '" ry="' + n1(L.r * 0.6) + '" fill="url(#' + id + '-gl' + L.n + ')" opacity="0.5" style="mix-blend-mode:soft-light"/>';
        voile += '<circle cx="' + n1(L.pt[0]) + '" cy="' + n1(L.pt[1]) + '" r="' + n1(Math.min(18, L.r * 0.22)) + '" fill="url(#' + id + '-gl' + L.n + ')" style="mix-blend-mode:screen"/>';
      });
    }
    // le découpage est posé sur chaque calque : sur un groupe, il isolerait le mélange des couleurs
    if (voile) s += '<g pointer-events="none">' + voile.replace(/<(rect|circle|ellipse) /g, '<$1 clip-path="url(#' + id + '-piece)" ') + '</g>';
    // l'aperçu (case visée) reste lisible par-dessus tout
    s += ap;
    return s;
  }

  // ---------- Vignettes (boutique, panneau Arranger) ----------
  function vignette(mid, t, taille) {
    var m = MEUBLES[mid]; if (!m) return '';
    var ob = { m: mid, i: 0, j: 0, o: 0, z: 0, t: t }, x0, x1, y0, y1, H = Math.max(m.h, 0.6), pad = 6;
    if (m.plan === 'mur') { x0 = 0; x1 = proj(m.w, 0)[0]; y0 = proj(0, 0, m.h)[1]; y1 = proj(m.w, 0.4, 0)[1]; }
    else {
      x0 = proj(0, m.d)[0]; x1 = proj(m.w, 0)[0]; y1 = proj(m.w, m.d)[1];
      y0 = m.plan === 'plafond' ? proj(0, 0, H)[1] : proj(0, 0, m.h)[1];
      if (m.plan === 'plafond') { y1 = proj(1, 1, H - 1.05)[1]; ob.z = 0; }
    }
    var w = x1 - x0 + pad * 2, h = y1 - y0 + pad * 2, tl = taille || 64;
    var corps = m.plan === 'plafond' ? MEUBLES[mid].dessin(contexte(0, 0, 0, 0, H), teinte(t || m.t)).replace(/<ellipse[^>]*opacity="0.12"\/>/, '') : dessinObjet(ob, H);
    return '<svg viewBox="' + [n1(x0 - pad), n1(y0 - pad), n1(w), n1(h)].join(' ') + '" width="' + tl + '" height="' + tl + '" preserveAspectRatio="xMidYMid meet">' + corps + '</svg>';
  }
  // Petite tuile d'habillage : losange de sol, ou coin de mur
  function tuile(genre, motif, t, taille, id) {
    var tl = taille || 46, tt = teinte(t), pid = id || ('tu-' + genre + '-' + motif + '-' + String(t).replace('#', ''));
    if (genre === 'sol') {
      return '<svg viewBox="-36 -4 72 40" width="' + tl + '" height="' + n1(tl * 40 / 72) + '"><defs>' + motifSol(pid, motif, tt) + '</defs>' +
        '<g transform="' + matrice(proj(0, 0), proj(1, 0), proj(0, 1)) + '"><rect width="40" height="40" fill="url(#' + pid + ')" stroke="' + O + '" stroke-width="2.4"/></g></svg>';
    }
    return '<svg viewBox="-36 -36 72 70" width="' + tl + '" height="' + n1(tl * 70 / 72) + '"><defs>' + motifMur(pid, motif, tt) + '</defs>' +
      '<g transform="' + matrice(proj(0, 0, 1), proj(0, 1, 1), proj(0, 0, 0)) + '"><rect width="40" height="40" fill="url(#' + pid + ')" stroke="' + O + '" stroke-width="2.4"/></g>' +
      '<g transform="' + matrice(proj(0, 0, 1), proj(1, 0, 1), proj(0, 0, 0)) + '"><rect width="40" height="40" fill="url(#' + pid + ')"/><rect width="40" height="40" fill="#1b130e" opacity="0.2" stroke="' + O + '" stroke-width="2.4"/></g></svg>';
  }

  // Petite tuile des finitions : un coin de mur avec ses plinthes (et sa corniche)
  function tuileFinition(hb, tm, taille) {
    var tl = taille || 46, Hm = 1.4, Hu = Hm * U, t = teinte(tm);
    var murG = '<rect width="40" height="' + Hu + '" fill="' + t + '"/>' + finitions(40, Hu, t, hb, 1.7) + '<rect width="40" height="' + Hu + '" fill="none" stroke="' + O + '" stroke-width="2.4"/>';
    return '<svg viewBox="-36 ' + n1(-Hm * ZU - 4) + ' 72 ' + n1(Hm * ZU + 26) + '" width="' + tl + '" height="' + n1(tl * (Hm * ZU + 26) / 72) + '">' +
      '<g transform="' + matrice(proj(0, 0, Hm), proj(0, 1, Hm), proj(0, 0, Hm - 1)) + '">' + murG + '</g>' +
      '<g transform="' + matrice(proj(0, 0, Hm), proj(1, 0, Hm), proj(0, 0, Hm - 1)) + '">' + murG.replace('stroke-width="2.4"/>', 'stroke-width="2.4"/><rect width="40" height="' + Hu + '" fill="#1b130e" opacity="0.2"/>') + '</g></svg>';
  }
  // Petite tuile d'une vue de fenêtre
  function tuileVue(vue, nuit, taille) {
    var tl = taille || 40;
    return '<svg viewBox="5 4 30 42" width="' + n1(tl * 30 / 42) + '" height="' + tl + '"><rect x="5" y="4" width="30" height="42" rx="2" fill="' + BOIS_C + '" stroke="' + O + '" stroke-width="1.6"/>' +
      vueFenetre(vue, nuit) + '<rect x="8.5" y="7.5" width="23" height="35" fill="none" stroke="' + O + '" stroke-width="1.1"/><path d="M20 7.5 V42.5 M8.5 25 H31.5" stroke="' + BOIS_C + '" stroke-width="1.8"/></svg>';
  }

  var kit = {
    TW: TW, TH: TH, ZU: ZU, HAUTEUR: HAUTEUR, MEUBLES: MEUBLES, NUANCIER: NUANCIER, MOTIFS_MUR: MOTIFS_MUR, SOLS: SOLS,
    PLINTHES: PLINTHES, AMBIANCES: AMBIANCES, VUES: VUES, vueOuverte: vueOuverte, vueFenetre: vueFenetre, habillage: habillage, saisonDe: saisonDe, tuileFinition: tuileFinition, tuileVue: tuileVue,
    proj: proj, versSol: versSol, versMur: versMur, nuance: nuance, teinte: teinte,
    emprise: emprise, placeLibre: placeLibre, caseOccupee: caseOccupee,
    bornes: bornes, camera: camera, scene: scene, vignette: vignette, tuile: tuile
  };
  if (typeof CP !== 'undefined') CP.MEUBLES = kit;
  return kit;
})();
if (typeof module !== 'undefined') module.exports = CPM;
