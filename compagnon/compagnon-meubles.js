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
  var CIEL = 2.85;                       // dehors : hauteur du ciel au-dessus de la haie
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
        var ex = k.env.etagere;
        if (ex && ex.length) { ex.slice(0, 3).forEach(function (c, q) { var b = k.P(0.2 + q * 0.3, 0.15, z + 0.07); s += coupe(b[0], b[1], 1.05, c); }); return s; }
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

  // ---------- Les meubles des autres pièces (étape 3) ----------
  // chez : la pièce où on le trouve d'abord ; lieu : 'dehors' (seulement au jardin), 'partout', ou rien (dedans seulement)
  // Façade « +v » d'un objet : repère à plat (x le long de u, y vers le bas depuis le haut)
  function face(k, u, v, z) { return plan(k, [u, v, z], [1, 0, 0], [0, 0, -1]); }
  // Une coupe dessinée à l'écran : x, y = bas du pied
  function coupe(x, y, s, c) {
    var e = ' stroke="' + O + '" stroke-width="' + n1(Math.max(0.8, s * 0.9)) + '" stroke-linejoin="round"';
    var A = function (dx, dy) { return n1(x + dx * s) + ' ' + n1(y + dy * s); };
    return '<path d="M' + A(-6, -13) + ' C' + A(-10.5, -13) + ' ' + A(-10.5, -8) + ' ' + A(-4.5, -8.5) + ' M' + A(6, -13) + ' C' + A(10.5, -13) + ' ' + A(10.5, -8) + ' ' + A(4.5, -8.5) + '" fill="none"' + e + '/>' +
      '<path d="M' + A(-5, 0) + ' L' + A(5, 0) + ' L' + A(4, -2.2) + ' L' + A(-4, -2.2) + 'Z" fill="' + nuance(c, -0.2) + '"' + e + '/>' +
      '<path d="M' + A(-1.3, -2.2) + ' L' + A(1.3, -2.2) + ' L' + A(1.3, -6.8) + ' L' + A(-1.3, -6.8) + 'Z" fill="' + c + '"' + e + '/>' +
      '<path d="M' + A(-6.5, -15) + ' L' + A(6.5, -15) + ' Q' + A(6.5, -6.5) + ' ' + A(0, -6.5) + ' Q' + A(-6.5, -6.5) + ' ' + A(-6.5, -15) + 'Z" fill="' + c + '"' + e + '/>' +
      '<path d="M' + A(-3.6, -13.4) + ' Q' + A(-3.6, -9.6) + ' ' + A(-1, -8.6) + '" stroke="#fff" stroke-opacity="0.65" stroke-width="' + n1(Math.max(0.7, s * 0.9)) + '" fill="none" stroke-linecap="round"/>';
  }
  function rond(x, y, r, c, ep) { return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(r) + '" fill="' + c + '" stroke="' + O + '" stroke-width="' + (ep || 1) + '"/>'; }

  Object.assign(MEUBLES, {
    // ----- cuisine -----
    planTravail: { nom: 'Plan de travail', rayon: 'meubles', plan: 'sol', w: 2, d: 1, h: 1.3, t: 'sauge', chez: 'cuisine',
      dessin: function (k, t) {
        var P = k.P, s = ombreSol(k, 0.02, 0.05, 1.96, 0.85);
        s += boite(k, 0.06, 0.08, 0, 1.88, 0.78, 0.08, '#3a2c22', 1) + boite(k, 0.02, 0.05, 0.08, 1.96, 0.85, 0.8, t, 1.5);
        s += '<g transform="' + face(k, 0.02, 0.9, 0.88) + '">';
        [[3, 36], [41, 36]].forEach(function (d) {
          s += '<rect x="' + d[0] + '" y="2.5" width="' + d[1] + '" height="6" rx="1.2" fill="' + nuance(t, 0.12) + '" stroke="' + O + '" stroke-width="1"/>' +
            '<rect x="' + d[0] + '" y="10.5" width="' + d[1] + '" height="19" rx="1.5" fill="' + nuance(t, 0.08) + '" stroke="' + O + '" stroke-width="1"/>' +
            '<rect x="' + (d[0] + 4) + '" y="13.5" width="' + (d[1] - 8) + '" height="13" rx="1" fill="none" stroke="' + nuance(t, -0.18) + '" stroke-width="0.9"/>' +
            '<rect x="' + (d[0] + d[1] / 2 - 4) + '" y="4.6" width="8" height="1.8" rx="0.9" fill="#c9a66b" stroke="' + O + '" stroke-width="0.6"/>';
        });
        s += '</g>' + boite(k, 0, 0.02, 0.88, 2, 0.92, 0.08, '#e9dcc4', 1.5);
        // évier et robinet
        s += poly([P(1.08, 0.22, 0.96), P(1.72, 0.22, 0.96), P(1.72, 0.7, 0.96), P(1.08, 0.7, 0.96)], '#9fb3c2', 3, 1.2);
        s += poly([P(1.15, 0.29, 0.96), P(1.65, 0.29, 0.96), P(1.65, 0.63, 0.96), P(1.15, 0.63, 0.96)], '#c9d8e2', 2, 0.8);
        var r0 = P(1.4, 0.1, 0.96), r1 = P(1.4, 0.1, 1.24), r2 = P(1.4, 0.36, 1.18), d = 'M' + pt(r0) + ' L' + pt(r1) + ' Q' + n1(r1[0] + 4) + ' ' + n1(r1[1] - 4) + ' ' + pt(r2);
        s += '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="4.2" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#c7d0d6" stroke-width="2" stroke-linecap="round"/>';
        // une planche, du pain et un pot d'herbes
        s += boite(k, 0.18, 0.3, 0.96, 0.52, 0.38, 0.04, '#c98d55', 1.5);
        var pn = P(0.44, 0.49, 1.0);
        s += '<path d="M' + n1(pn[0] - 11) + ' ' + n1(pn[1]) + ' Q' + n1(pn[0] - 11) + ' ' + n1(pn[1] - 9) + ' ' + n1(pn[0]) + ' ' + n1(pn[1] - 9) + ' Q' + n1(pn[0] + 11) + ' ' + n1(pn[1] - 9) + ' ' + n1(pn[0] + 11) + ' ' + n1(pn[1]) + 'Z" fill="#d9a35b" stroke="' + O + '" stroke-width="1.2"/>' +
          '<path d="M' + n1(pn[0] - 5) + ' ' + n1(pn[1] - 8) + ' l3 3 M' + n1(pn[0]) + ' ' + n1(pn[1] - 9) + ' l3 3 M' + n1(pn[0] + 5) + ' ' + n1(pn[1] - 8) + ' l3 3" stroke="#a8692f" stroke-width="1.1"/>';
        s += cylindre(k, 0.86, 0.26, 0.96, 0.09, 0.14, '#c9733f', 0.11);
        var h = P(0.86, 0.26, 1.1);
        s += '<path d="M' + n1(h[0] - 7) + ' ' + n1(h[1] + 1) + ' Q' + n1(h[0] - 9) + ' ' + n1(h[1] - 9) + ' ' + n1(h[0] - 2) + ' ' + n1(h[1] - 11) + ' Q' + n1(h[0]) + ' ' + n1(h[1] - 4) + ' ' + n1(h[0] + 3) + ' ' + n1(h[1] - 12) +
          ' Q' + n1(h[0] + 9) + ' ' + n1(h[1] - 7) + ' ' + n1(h[0] + 7) + ' ' + n1(h[1] + 1) + 'Z" fill="#6cae5c" stroke="' + O + '" stroke-width="1"/>';
        return s;
      } },
    cuisiniere: { nom: 'Cuisinière', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.35, t: 'creme', chez: 'cuisine',
      dessin: function (k, t) {
        var P = k.P, s = ombreSol(k, 0.04, 0.05, 0.92, 0.86);
        s += boite(k, 0.04, 0.05, 0, 0.92, 0.86, 0.92, t, 2);
        s += '<g transform="' + face(k, 0.04, 0.91, 0.92) + '">';
        [8, 15, 22, 29].forEach(function (x) { s += '<circle cx="' + x + '" cy="3.4" r="1.6" fill="#3d3f45" stroke="' + O + '" stroke-width="0.6"/>'; });
        s += '<rect x="4" y="7" width="29" height="26" rx="2" fill="' + nuance(t, -0.08) + '" stroke="' + O + '" stroke-width="1.1"/>' +
          '<rect x="6" y="8.6" width="25" height="2" rx="1" fill="#c9a66b" stroke="' + O + '" stroke-width="0.6"/>' +
          '<rect x="8" y="14" width="21" height="13" rx="1.5" fill="#2a2b30" stroke="' + O + '" stroke-width="0.9"/>' +
          '<rect x="10" y="21.5" width="17" height="4" rx="1" fill="#ff922b" opacity="0.6"/><path d="M10 16.5 l4 -1" stroke="#fff" stroke-opacity="0.4" stroke-width="0.9"/></g>';
        s += boite(k, 0.02, 0.03, 0.92, 0.96, 0.9, 0.06, '#3d3f45', 1.5);
        [[0.28, 0.28], [0.72, 0.28], [0.28, 0.7]].forEach(function (b) { var c = P(b[0], b[1], 0.98); s += '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="7" ry="3.5" fill="#22232a" stroke="#6b6f78" stroke-width="1"/>'; });
        var a = P(0.72, 0.7, 1.12);
        s += ligne([a, [a[0] + 15, a[1] - 3]], O, 4.4) + ligne([a, [a[0] + 15, a[1] - 3]], '#3a2c22', 2);
        s += cylindre(k, 0.72, 0.7, 0.98, 0.17, 0.18, '#c25b4a');
        var v = P(0.72, 0.7, 1.22);
        s += '<path d="M' + n1(v[0] - 3) + ' ' + n1(v[1]) + ' q-3 -5 0 -9 q3 -4 0 -9 M' + n1(v[0] + 3) + ' ' + n1(v[1] - 2) + ' q-3 -5 0 -8" stroke="#fff" stroke-opacity="0.6" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
        return s;
      } },
    frigo: { nom: 'Réfrigérateur', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 2.05, t: 'creme', chez: 'cuisine',
      dessin: function (k, t) {
        var s = ombreSol(k, 0.06, 0.06, 0.88, 0.84) + boite(k, 0.06, 0.06, 0, 0.88, 0.84, 2.0, t, 4);
        s += '<g transform="' + face(k, 0.06, 0.9, 2.0) + '"><path d="M1 27 H34.2" stroke="' + O + '" stroke-width="1.3"/>' +
          '<rect x="28" y="9" width="2.6" height="13" rx="1.3" fill="#b8c4cc" stroke="' + O + '" stroke-width="0.8"/><rect x="28" y="32" width="2.6" height="20" rx="1.3" fill="#b8c4cc" stroke="' + O + '" stroke-width="0.8"/>' +
          '<g transform="rotate(-6 12 43)"><rect x="6" y="36" width="12" height="14" fill="#fbf3e6" stroke="' + O + '" stroke-width="0.8"/><path d="M8 47 l3 -5 l3 3 l2 -3" stroke="#e8590c" stroke-width="0.9" fill="none"/><circle cx="15" cy="39.5" r="1.4" fill="#f5c542"/></g>' +
          rond(12, 36, 1.6, '#c25b4a', 0.6) + rond(21, 41, 1.6, '#4f6e9a', 0.6) + rond(9, 14, 1.6, '#d8a73a', 0.6) + rond(15, 12, 1.6, '#4f8a46', 0.6) + '</g>';
        return s;
      } },
    tableRonde: { nom: 'Table ronde', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.0, t: 'miel', chez: 'cuisine', usage: 'manger',
      dessin: function (k, t) {
        var c = k.P(0.5, 0.5, 0), s = '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="22" ry="11" fill="#000" opacity="0.18"/>';
        s += cylindre(k, 0.5, 0.5, 0, 0.22, 0.05, nuance(t, -0.2)) + cylindre(k, 0.5, 0.5, 0.05, 0.06, 0.67, nuance(t, -0.15), null, false);
        s += cylindre(k, 0.5, 0.5, 0.72, 0.46, 0.07, t) + cylindre(k, 0.5, 0.5, 0.79, 0.14, 0.06, '#efe2c8', 0.2);
        var f = k.P(0.5, 0.5, 0.86);
        [[-5, -2, '#c25b4a'], [4, -3, '#e8a33a'], [0, -6.5, '#6cae5c']].forEach(function (a) { s += rond(f[0] + a[0], f[1] + a[1], 3.6, a[2]); });
        return s;
      } },
    chaise: { nom: 'Chaise', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.1, t: 'miel', chez: 'cuisine', usage: 'sieste',
      dessin: function (k, t) {
        var s = ombreSol(k, 0.2, 0.2, 0.6, 0.6), b = nuance(t, -0.15);
        [[0.22, 0.22], [0.7, 0.22], [0.22, 0.7], [0.7, 0.7]].forEach(function (p) { s += boite(k, p[0], p[1], 0, 0.08, 0.08, 0.45, b, 1); });
        s += boite(k, 0.22, 0.2, 0.45, 0.08, 0.08, 0.58, b, 1) + boite(k, 0.7, 0.2, 0.45, 0.08, 0.08, 0.58, b, 1);
        s += boite(k, 0.2, 0.18, 0.66, 0.6, 0.08, 0.07, t, 1.5) + boite(k, 0.2, 0.18, 0.88, 0.6, 0.1, 0.16, t, 2);
        s += boite(k, 0.18, 0.18, 0.45, 0.64, 0.64, 0.07, t, 2) + coussin(k, 0.24, 0.3, 0.52, 0.52, 0.46, 0.07, '#c25b4a');
        return s;
      } },
    gamelle: { nom: 'Gamelles', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 0.3, t: 'brique', chez: 'cuisine', usage: 'manger',
      dessin: function (k, t) {
        var P = k.P, s = '<path d="' + chemin([P(0.08, 0.22, 0), P(0.92, 0.22, 0), P(0.92, 0.82, 0), P(0.08, 0.82, 0)], 5) + '" fill="' + t + '" stroke="' + O + '" stroke-width="' + EP + '"/>';
        s += cylindre(k, 0.3, 0.52, 0, 0.15, 0.1, '#4f6e9a', 0.18) + cylindre(k, 0.7, 0.52, 0, 0.15, 0.1, '#c9733f', 0.18);
        var a = P(0.3, 0.52, 0.1), b = P(0.7, 0.52, 0.1);
        s += '<ellipse cx="' + n1(a[0]) + '" cy="' + n1(a[1]) + '" rx="6" ry="3" fill="#7cc4ef"/><ellipse cx="' + n1(b[0]) + '" cy="' + n1(b[1]) + '" rx="6" ry="3" fill="#8a5a32"/>' +
          '<circle cx="' + n1(b[0] - 2) + '" cy="' + n1(b[1] - 0.5) + '" r="1.3" fill="#b5793f"/><circle cx="' + n1(b[0] + 2) + '" cy="' + n1(b[1] + 0.3) + '" r="1.3" fill="#b5793f"/>';
        return s;
      } },
    ustensiles: { nom: 'Ustensiles', rayon: 'deco', plan: 'mur', w: 1, h: 0.75, z: 1.4, t: '#b8c4cc', chez: 'cuisine',
      dessin: function (k, t) {
        var s = '<g transform="' + plan(k, [0, 0, k.z + 0.75], [1, 0, 0], [0, 0, -1]) + '">';
        s += '<rect x="3" y="2" width="34" height="2.6" rx="1.3" fill="' + t + '" stroke="' + O + '" stroke-width="1"/>';
        s += '<path d="M8 4.6 V18" stroke="' + O + '" stroke-width="2.6"/><path d="M8 4.6 V18" stroke="#8a5a32" stroke-width="1.2"/><rect x="5.5" y="17" width="5" height="9" rx="1.5" fill="#c98d55" stroke="' + O + '" stroke-width="1"/>';
        s += '<path d="M17 4.6 V20" stroke="' + O + '" stroke-width="2.4"/><path d="M17 4.6 V20" stroke="' + t + '" stroke-width="1.1"/>' + rond(17, 23, 4, t);
        s += '<path d="M25 4.6 V13" stroke="' + O + '" stroke-width="2.2"/><path d="M25 13 q-4 6 0 13 q4 -7 0 -13 M25 13 q-1.6 7 0 13 M25 13 q1.6 7 0 13" fill="none" stroke="' + O + '" stroke-width="0.9"/>';
        s += '<path d="M32.5 4.6 V10" stroke="' + O + '" stroke-width="1.6"/>' + rond(32.5, 16, 5.5, '#3d3f45') + '<circle cx="32.5" cy="16" r="3.8" fill="#55575e"/>';
        return s + '</g>';
      } },
    // ----- chambre -----
    lit: { nom: 'Lit', rayon: 'meubles', plan: 'sol', w: 1, d: 2, h: 1.0, t: 'nuit', chez: 'chambre', usage: 'dormir',
      dessin: function (k, t) {
        var P = k.P, s = ombreSol(k, 0.02, 0.02, 0.96, 1.96);
        [[0.04, 0.04], [0.86, 0.04], [0.04, 1.86], [0.86, 1.86]].forEach(function (p) { s += boite(k, p[0], p[1], 0, 0.1, 0.1, 0.12, BOIS_S, 1); });
        s += boite(k, 0, 0, 0.12, 1, 0.14, 0.88, BOIS, 3);
        s += '<g transform="' + face(k, 0, 0.14, 1.0) + '"><path d="M7 24 Q20 4 33 24" fill="none" stroke="' + BOIS_C + '" stroke-width="2.4"/>' + rond(20, 13, 2.6, '#d8a73a', 0.8) + '</g>';
        s += boite(k, 0.02, 0.14, 0.12, 0.96, 1.84, 0.2, BOIS, 2) + boite(k, 0.06, 0.16, 0.32, 0.88, 1.76, 0.14, '#f3eadb', 3);
        s += coussin(k, 0.14, 0.2, 0.46, 0.72, 0.34, 0.13, '#fbf3e6');
        s += boite(k, 0.04, 0.66, 0.36, 0.92, 1.3, 0.16, t, 5);
        [1.05, 1.45].forEach(function (v) { s += ligne([P(0.1, v, 0.52), P(0.9, v, 0.52)], nuance(t, 0.3), 2); });
        s += boite(k, 0.04, 0.66, 0.52, 0.92, 0.2, 0.03, '#fbf3e6', 2);
        s += boite(k, 0, 1.86, 0.12, 1, 0.12, 0.44, BOIS, 2.5);
        return s;
      } },
    chevet: { nom: 'Chevet et lampe', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.05, t: 'miel', chez: 'chambre', lumiere: { u: 0.5, v: 0.42, z: 0.9, r: 1.9 },
      dessin: function (k, t) {
        var s = ombreSol(k, 0.15, 0.15, 0.7, 0.62);
        s += boite(k, 0.15, 0.15, 0, 0.7, 0.62, 0.55, t, 2) + boite(k, 0.12, 0.12, 0.55, 0.76, 0.68, 0.05, nuance(t, -0.1), 1.5);
        s += '<g transform="' + face(k, 0.15, 0.77, 0.55) + '">';
        [3, 12].forEach(function (y) { s += '<rect x="3" y="' + y + '" width="22" height="7" rx="1.2" fill="' + nuance(t, 0.1) + '" stroke="' + O + '" stroke-width="0.9"/>' + rond(14, y + 3.5, 1.3, '#e9b949', 0.6); });
        s += '</g>' + boite(k, 0.2, 0.58, 0.6, 0.3, 0.2, 0.05, '#4f6e9a', 1);
        s += cylindre(k, 0.5, 0.42, 0.6, 0.09, 0.04, '#7a6f66');
        var a = k.P(0.5, 0.42, 0.64), b = k.P(0.5, 0.42, 0.8);
        s += ligne([a, b], O, 3.4) + ligne([a, b], '#c9a66b', 1.6) + cylindre(k, 0.5, 0.42, 0.78, 0.17, 0.22, '#f3d9a4', 0.1);
        return s;
      } },
    armoire: { nom: 'Armoire', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 2.25, t: 'chocolat', chez: 'chambre',
      dessin: function (k, t) {
        var s = ombreSol(k, 0.04, 0.08, 0.92, 0.84);
        [[0.08, 0.12], [0.84, 0.12], [0.08, 0.82], [0.84, 0.82]].forEach(function (p) { s += boite(k, p[0], p[1], 0, 0.08, 0.08, 0.08, BOIS_S, 1); });
        s += boite(k, 0.04, 0.08, 0.08, 0.92, 0.84, 2.02, t, 2) + '<g transform="' + face(k, 0.04, 0.92, 2.1) + '">';
        [2, 18.4].forEach(function (x) {
          s += '<rect x="' + x + '" y="3" width="16.4" height="74" rx="1.5" fill="' + nuance(t, 0.08) + '" stroke="' + O + '" stroke-width="1"/>' +
            '<rect x="' + (x + 3) + '" y="7" width="10.4" height="30" rx="1" fill="none" stroke="' + nuance(t, -0.2) + '" stroke-width="0.9"/>' +
            '<rect x="' + (x + 3) + '" y="42" width="10.4" height="31" rx="1" fill="none" stroke="' + nuance(t, -0.2) + '" stroke-width="0.9"/>';
        });
        s += rond(15.6, 40, 1.4, '#e9b949', 0.6) + rond(21.2, 40, 1.4, '#e9b949', 0.6) + '</g>';
        s += boite(k, 0, 0.04, 2.1, 1, 0.92, 0.12, nuance(t, -0.12), 2);
        return s;
      } },
    nounours: { nom: 'Nounours', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 0.8, t: 'miel', chez: 'chambre', usage: 'calin',
      dessin: function (k, t) {
        var c = k.P(0.5, 0.5, 0), x = c[0], y = c[1], f = nuance(t, -0.22), cl = nuance(t, 0.32);
        var E = function (dx, dy, rx, ry, col) { return '<ellipse cx="' + n1(x + dx) + '" cy="' + n1(y + dy) + '" rx="' + rx + '" ry="' + ry + '" fill="' + col + '" stroke="' + O + '" stroke-width="1.3"/>'; };
        var s = '<ellipse cx="' + n1(x) + '" cy="' + n1(y) + '" rx="15" ry="6" fill="#000" opacity="0.18"/>';
        s += E(-7, -3, 5, 4, t) + E(7, -3, 5, 4, t) + E(0, -11, 9, 10, t) + '<ellipse cx="' + n1(x) + '" cy="' + n1(y - 9) + '" rx="5" ry="6" fill="' + cl + '"/>';
        s += E(-9, -13, 3.5, 5, f) + E(9, -13, 3.5, 5, f) + rond(x - 6, y - 29, 3.6, t, 1.3) + rond(x + 6, y - 29, 3.6, t, 1.3) + rond(x, y - 23, 8, t, 1.3);
        s += '<ellipse cx="' + n1(x) + '" cy="' + n1(y - 20.5) + '" rx="3.6" ry="2.8" fill="' + cl + '"/><circle cx="' + n1(x) + '" cy="' + n1(y - 21.5) + '" r="1.2" fill="' + O + '"/>' +
          '<circle cx="' + n1(x - 3) + '" cy="' + n1(y - 25) + '" r="1.1" fill="' + O + '"/><circle cx="' + n1(x + 3) + '" cy="' + n1(y - 25) + '" r="1.1" fill="' + O + '"/>' +
          '<path d="M' + n1(x - 4.5) + ' ' + n1(y - 17) + ' l4.5 2.5 l4.5 -2.5 v4 l-4.5 -1.5 l-4.5 1.5z" fill="#c25b4a" stroke="' + O + '" stroke-width="0.8"/>';
        return s;
      } },
    miroir: { nom: 'Miroir', rayon: 'deco', plan: 'mur', w: 1, h: 1.1, z: 1.05, t: 'moutarde', chez: 'chambre',
      dessin: function (k, t) {
        var s = '<g transform="' + plan(k, [0, 0, k.z + 1.1], [1, 0, 0], [0, 0, -1]) + '">';
        s += '<ellipse cx="20" cy="23" rx="14" ry="19.5" fill="' + t + '" stroke="' + O + '" stroke-width="1.6"/><ellipse cx="20" cy="23" rx="10.5" ry="16" fill="#cfe3ec" stroke="' + O + '" stroke-width="1"/>' +
          '<path d="M14 15 l7 -5 M14 21 l10 -8 M24 33 l4 -3" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>' + rond(20, 3.2, 2, nuance(t, 0.2), 0.8);
        return s + '</g>';
      } },
    // ----- salle de jeux -----
    tableJeu: { nom: 'Table de jeu', rayon: 'meubles', plan: 'sol', w: 2, d: 1, h: 0.95, t: 'foret', chez: 'jeux', usage: 'jouer',
      dessin: function (k, t) {
        var P = k.P, s = ombreSol(k, 0.06, 0.08, 1.88, 0.84);
        [[0.14, 0.16], [1.74, 0.16], [0.14, 0.72], [1.74, 0.72]].forEach(function (p) { s += boite(k, p[0], p[1], 0, 0.12, 0.12, 0.66, BOIS_S, 1); });
        s += boite(k, 0.06, 0.08, 0.66, 1.88, 0.84, 0.09, BOIS, 2.5);
        s += poly([P(0.16, 0.18, 0.75), P(1.84, 0.18, 0.75), P(1.84, 0.82, 0.75), P(0.16, 0.82, 0.75)], t, 3, 1.1);
        s += '<g transform="' + plan(k, [0.32, 0.22, 0.755], [1, 0, 0], [0, 1, 0]) + '"><rect width="23" height="23" rx="1.5" fill="#f3e3c3" stroke="' + O + '" stroke-width="1.2"/>';
        var cs = ['#c25b4a', '#4f6e9a', '#d8a73a', '#4f8a46'];
        for (var q = 0; q < 16; q++) {
          var xx = q < 5 ? q * 4.5 : q < 9 ? 18 : q < 13 ? 18 - (q - 8) * 4.5 : 0, yy = q < 5 ? 0 : q < 9 ? (q - 4) * 4.5 : q < 13 ? 18 : 18 - (q - 12) * 4.5;
          s += '<rect x="' + n1(xx + 0.6) + '" y="' + n1(yy + 0.6) + '" width="3.8" height="3.8" fill="' + cs[q % 4] + '"/>';
        }
        s += '<rect x="7.5" y="7.5" width="8" height="8" fill="none" stroke="' + O + '" stroke-width="0.8"/></g>';
        s += cylindre(k, 0.5, 0.36, 0.755, 0.045, 0.11, '#c25b4a') + cylindre(k, 0.76, 0.6, 0.755, 0.045, 0.11, '#4f6e9a');
        s += boite(k, 1.28, 0.3, 0.755, 0.11, 0.11, 0.11, '#fbf3e6', 1) + boite(k, 1.46, 0.44, 0.755, 0.11, 0.11, 0.11, '#fbf3e6', 1);
        [P(1.335, 0.355, 0.865), P(1.515, 0.495, 0.865)].forEach(function (d) { s += '<circle cx="' + n1(d[0]) + '" cy="' + n1(d[1]) + '" r="1" fill="' + O + '"/>'; });
        s += boite(k, 1.34, 0.6, 0.755, 0.26, 0.17, 0.05, '#c25b4a', 1) + boite(k, 1.36, 0.6, 0.805, 0.26, 0.17, 0.02, '#fbf3e6', 1);
        return s;
      } },
    arcade: { nom: 'Borne d\'arcade', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 2.1, t: 'prune', chez: 'jeux', usage: 'jouer', lumiere: { u: 0.5, v: 0.75, z: 1.45, r: 1.5, c: '#7ad3ff' },
      dessin: function (k, t) {
        var P = k.P, s = ombreSol(k, 0.1, 0.1, 0.8, 0.8);
        s += boite(k, 0.1, 0.1, 0, 0.8, 0.8, 0.95, t, 2);
        s += '<g transform="' + face(k, 0.1, 0.9, 0.95) + '"><rect x="13" y="12" width="6" height="9" rx="1" fill="#2a2b30" stroke="' + O + '" stroke-width="0.8"/><path d="M16 14 v5" stroke="#ffd43b" stroke-width="1.2"/>' +
          '<path d="M3 6 H29" stroke="' + nuance(t, 0.3) + '" stroke-width="1.6"/></g>';
        s += boite(k, 0.1, 0.1, 0.95, 0.8, 0.45, 1.15, t, 2);
        s += '<g transform="' + face(k, 0.1, 0.55, 2.1) + '"><rect x="2" y="2" width="28" height="7" rx="1" fill="#ffd43b" stroke="' + O + '" stroke-width="0.9"/><path d="M6 5.5 h5 M13 5.5 h4 M19 5.5 h7" stroke="#c2410c" stroke-width="1.4"/>' +
          '<rect x="3.5" y="12" width="25" height="20" rx="2" fill="#16213d" stroke="' + O + '" stroke-width="1.1"/>' +
          '<rect x="8" y="24" width="3" height="3" fill="#ffd43b"/><rect x="11" y="24" width="3" height="3" fill="#ffd43b"/><rect x="18" y="17" width="3" height="3" fill="#ff6b6b"/><rect x="21" y="20" width="3" height="3" fill="#ff6b6b"/><rect x="15" y="20" width="3" height="3" fill="#ff6b6b"/>' +
          '<path d="M5 29 h22" stroke="#69db7c" stroke-width="1.2"/><path d="M5 14.5 l5 3" stroke="#fff" stroke-opacity="0.35" stroke-width="1.2"/></g>';
        s += boite(k, 0.1, 0.55, 0.95, 0.8, 0.35, 0.1, nuance(t, 0.12), 1.5);
        var j = P(0.3, 0.72, 1.05);
        s += ligne([j, [j[0], j[1] - 8]], O, 2.6) + rond(j[0], j[1] - 9, 3, '#e03131');
        [[0.58, 0.66, '#ffd43b'], [0.74, 0.7, '#4dabf7'], [0.66, 0.8, '#69db7c']].forEach(function (b) { var q = P(b[0], b[1], 1.05); s += '<ellipse cx="' + n1(q[0]) + '" cy="' + n1(q[1]) + '" rx="2.6" ry="1.4" fill="' + b[2] + '" stroke="' + O + '" stroke-width="0.8"/>'; });
        return s;
      } },
    coffreJouets: { nom: 'Coffre à jouets', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.0, t: 'brique', chez: 'jeux', usage: 'jouer',
      dessin: function (k, t) {
        var P = k.P, s = ombreSol(k, 0.08, 0.15, 0.84, 0.7);
        s += poly([P(0.08, 0.15, 0.5), P(0.92, 0.15, 0.5), P(0.92, 0.03, 0.98), P(0.08, 0.03, 0.98)], nuance(t, 0.06), 2);
        s += boite(k, 0.08, 0.15, 0, 0.84, 0.7, 0.5, t, 2);
        s += '<g transform="' + face(k, 0.08, 0.85, 0.5) + '"><path d="M16.8 4 l2 4.4 4.8 .6 -3.5 3.3 .9 4.7 -4.2 -2.3 -4.2 2.3 .9 -4.7 -3.5 -3.3 4.8 -.6z" fill="#ffd43b" stroke="' + O + '" stroke-width="0.8"/></g>';
        s += boite(k, 0.16, 0.24, 0.5, 0.2, 0.2, 0.2, '#4f6e9a', 1.5) + boite(k, 0.48, 0.26, 0.5, 0.06, 0.06, 0.34, '#d8a73a', 1);
        var b = P(0.66, 0.5, 0.62);
        s += rond(b[0], b[1], 8, '#e03131', 1.2) + '<path d="M' + n1(b[0] - 8) + ' ' + n1(b[1]) + ' Q' + n1(b[0]) + ' ' + n1(b[1] + 5) + ' ' + n1(b[0] + 8) + ' ' + n1(b[1]) + '" fill="none" stroke="#fff" stroke-width="1.6"/>';
        return s;
      } },
    ballon: { nom: 'Ballon', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 0.5, t: 'brique', chez: 'jeux', lieu: 'partout', usage: 'jouer',
      dessin: function (k, t) {
        var c = k.P(0.5, 0.5, 0), x = c[0], y = c[1];
        return '<ellipse cx="' + n1(x) + '" cy="' + n1(y) + '" rx="11" ry="5" fill="#000" opacity="0.2"/>' + rond(x, y - 10, 10, t, 1.4) +
          '<path d="M' + n1(x - 10) + ' ' + n1(y - 10) + ' Q' + n1(x) + ' ' + n1(y - 4) + ' ' + n1(x + 10) + ' ' + n1(y - 10) + ' M' + n1(x) + ' ' + n1(y - 20) + ' Q' + n1(x - 6) + ' ' + n1(y - 10) + ' ' + n1(x) + ' ' + n1(y) + '" fill="none" stroke="#fbf3e6" stroke-width="2"/>' +
          '<path d="M' + n1(x - 5) + ' ' + n1(y - 15) + ' q2 -2 5 -2" stroke="#fff" stroke-opacity="0.7" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
      } },
    cible: { nom: 'Cible', rayon: 'deco', plan: 'mur', w: 1, h: 0.95, z: 1.35, t: 'brique', chez: 'jeux',
      dessin: function (k, t) {
        var s = '<g transform="' + plan(k, [0, 0, k.z + 0.95], [1, 0, 0], [0, 0, -1]) + '">';
        [[17, '#3a2c22'], [15, '#fbf3e6'], [11.5, t], [8, '#fbf3e6'], [4.5, t], [1.6, '#ffd43b']].forEach(function (r) { s += rond(20, 19, r[0], r[1], 0.9); });
        s += '<path d="M22 17 l9 -6 M14 22 l-9 3" stroke="' + O + '" stroke-width="1.4"/><path d="M31 11 l2 -3 M31 11 l3 0 M5 25 l-2 -2 M5 25 l-1 3" stroke="#4f6e9a" stroke-width="1.4"/>';
        return s + '</g>';
      } },
    // ----- salle des trophées -----
    vitrine: { nom: 'Vitrine', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 2.15, t: 'chocolat', chez: 'trophees', usage: 'admirer',
      dessin: function (k, t) {
        var P = k.P, s = ombreSol(k, 0.06, 0.1, 0.88, 0.75);
        s += boite(k, 0.06, 0.1, 0, 0.88, 0.75, 0.32, t, 2) + boite(k, 0.1, 0.12, 0.32, 0.8, 0.7, 1.55, '#2b211b', 1);
        [0.84, 1.36].forEach(function (z) { s += boite(k, 0.1, 0.12, z, 0.8, 0.7, 0.04, nuance(t, 0.15), 1); });
        var cs = ['#e9b949', '#c0c6cc', '#c98d55'], vraies = k.env.coupes;
        [0.32, 0.88, 1.4].forEach(function (z, r) { [0.34, 0.68].forEach(function (u, q) {
          var c = vraies ? vraies[k.env.cv++] : cs[(r + q) % 3], b = P(u, 0.48, z);
          if (c) s += coupe(b[0], b[1], 1.05, c);
        }); });
        s += poly([P(0.06, 0.85, 0.32), P(0.94, 0.85, 0.32), P(0.94, 0.85, 1.87), P(0.06, 0.85, 1.87)], '#cfe8f5', 1, 0, ' fill-opacity="0.16"');
        s += poly([P(0.94, 0.1, 0.32), P(0.94, 0.85, 0.32), P(0.94, 0.85, 1.87), P(0.94, 0.1, 1.87)], '#cfe8f5', 1, 0, ' fill-opacity="0.12"');
        s += ligne([P(0.2, 0.85, 1.5), P(0.45, 0.85, 1.8)], '#fff', 1.6, ' opacity="0.55"') + ligne([P(0.25, 0.85, 1.2), P(0.4, 0.85, 1.38)], '#fff', 1.2, ' opacity="0.45"');
        [[0.06, 0.81], [0.88, 0.81], [0.88, 0.1]].forEach(function (p) { s += boite(k, p[0], p[1], 0.32, 0.06, 0.04, 1.55, t, 0.5); });
        s += boite(k, 0.04, 0.08, 1.87, 0.92, 0.79, 0.22, t, 2);
        s += '<g transform="' + face(k, 0.04, 0.87, 2.09) + '"><path d="M14 4 h9 M18.5 1.5 v5" stroke="#e9b949" stroke-width="1.4"/></g>';
        return s;
      } },
    piedestal: { nom: 'Piédestal', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.6, t: 'creme', chez: 'trophees', usage: 'admirer',
      dessin: function (k, t) {
        var s = ombreSol(k, 0.16, 0.16, 0.68, 0.68);
        s += boite(k, 0.16, 0.16, 0, 0.68, 0.68, 0.12, nuance(t, -0.1), 2) + boite(k, 0.24, 0.24, 0.12, 0.52, 0.52, 0.72, t, 1.5);
        s += '<g transform="' + face(k, 0.24, 0.76, 0.84) + '"><path d="M5 2 V27 M10.4 2 V27 M15.8 2 V27" stroke="' + nuance(t, -0.18) + '" stroke-width="1"/><rect x="3" y="11" width="15" height="6" rx="1" fill="#d8a73a" stroke="' + O + '" stroke-width="0.7"/></g>';
        s += boite(k, 0.16, 0.16, 0.84, 0.68, 0.68, 0.1, nuance(t, -0.1), 2);
        var b = k.P(0.5, 0.5, 0.94);
        var cp = k.env.coupes ? k.env.coupes.filter(function (c) { return c === '#e9b949'; })[0] || k.env.coupes[0] : '#e9b949';
        if (cp) s += '<circle cx="' + n1(b[0]) + '" cy="' + n1(b[1] - 15) + '" r="22" fill="#ffd43b" opacity="0.13"/>' + coupe(b[0], b[1], 1.9, cp);
        return s;
      } },
    ecu: { nom: 'Écu', rayon: 'deco', plan: 'mur', w: 1, h: 1.05, z: 1.3, t: 'brique', chez: 'trophees',
      dessin: function (k, t) {
        var s = '<g transform="' + plan(k, [0, 0, k.z + 1.05], [1, 0, 0], [0, 0, -1]) + '">';
        s += '<path d="M4 4 L36 40 M36 4 L4 40" stroke="' + O + '" stroke-width="3.6" stroke-linecap="round"/><path d="M4 4 L36 40 M36 4 L4 40" stroke="#c0c6cc" stroke-width="1.8" stroke-linecap="round"/>';
        s += '<path d="M8 4 H32 V20 Q32 34 20 41 Q8 34 8 20Z" fill="' + t + '" stroke="' + O + '" stroke-width="1.6"/>' +
          '<path d="M8 15 L20 25 L32 15 V20 L20 30 L8 20Z" fill="#e9b949" stroke="' + O + '" stroke-width="0.9"/>' +
          '<path d="M20 6.5 l1.5 3 3.3 .4 -2.4 2.3 .6 3.2 -3 -1.6 -3 1.6 .6 -3.2 -2.4 -2.3 3.3 -.4z" fill="#ffd43b" stroke="' + O + '" stroke-width="0.7"/>';
        return s + '</g>';
      } },
    // ----- jardin -----
    arbre: { nom: 'Arbre', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 2.85, t: 'foret', chez: 'jardin', lieu: 'dehors', usage: 'sieste',
      dessin: function (k, t) {
        var c = k.P(0.5, 0.5, 0), s = '<ellipse cx="' + n1(c[0] + 6) + '" cy="' + n1(c[1] + 2) + '" rx="34" ry="15" fill="#000" opacity="0.18"/>';
        s += cylindre(k, 0.5, 0.5, 0, 0.16, 1.25, '#7a5232', 0.1, false);
        var f = k.P(0.5, 0.5, 1.85), x = f[0], y = f[1], cf = nuance(t, -0.18), cc = nuance(t, 0.18);
        var B = [[-17, 8, 15, cf], [17, 7, 15, cf], [0, -16, 18, t], [-14, -4, 16, t], [15, -5, 16, t], [0, 6, 17, t]];
        B.forEach(function (b) { s += '<circle cx="' + n1(x + b[0]) + '" cy="' + n1(y + b[1]) + '" r="' + n1(b[2] + 1.6) + '" fill="' + O + '"/>'; });
        B.forEach(function (b) { s += '<circle cx="' + n1(x + b[0]) + '" cy="' + n1(y + b[1]) + '" r="' + b[2] + '" fill="' + b[3] + '"/>'; });
        s += '<circle cx="' + n1(x - 6) + '" cy="' + n1(y - 14) + '" r="8" fill="' + cc + '"/><circle cx="' + n1(x + 9) + '" cy="' + n1(y - 9) + '" r="6" fill="' + cc + '"/>';
        [[-10, 2], [9, 1], [2, 13], [-3, -21], [17, -10]].forEach(function (p) { s += rond(x + p[0], y + p[1], 2.6, '#e03131', 0.8); });
        return s;
      } },
    banc: { nom: 'Banc', rayon: 'meubles', plan: 'sol', w: 2, d: 1, h: 1.05, t: 'miel', chez: 'jardin', lieu: 'partout', usage: 'sieste',
      dessin: function (k, t) {
        var s = ombreSol(k, 0.1, 0.2, 1.8, 0.65), fer = '#3a3b40';
        [[0.18, 0.28], [1.72, 0.28], [0.18, 0.74], [1.72, 0.74]].forEach(function (p) { s += boite(k, p[0], p[1], 0, 0.1, 0.08, 0.45, fer, 1); });
        s += boite(k, 0.18, 0.2, 0.45, 0.1, 0.08, 0.55, fer, 1) + boite(k, 1.72, 0.2, 0.45, 0.1, 0.08, 0.55, fer, 1);
        [0.62, 0.82].forEach(function (z) { s += boite(k, 0.1, 0.22, z, 1.8, 0.05, 0.13, t, 1.5); });
        [0.28, 0.48, 0.68].forEach(function (v) { s += boite(k, 0.1, v, 0.45, 1.8, 0.17, 0.06, t, 1.5); });
        return s;
      } },
    massif: { nom: 'Massif de fleurs', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 0.75, t: 'brique', chez: 'jardin', lieu: 'dehors', usage: 'renifler',
      dessin: function (k, t) {
        var P = k.P, s = boite(k, 0.06, 0.06, 0, 0.88, 0.88, 0.18, '#a8a29a', 2.5);
        s += poly([P(0.14, 0.14, 0.18), P(0.86, 0.14, 0.18), P(0.86, 0.86, 0.18), P(0.14, 0.86, 0.18)], '#5c3d28', 3, 1);
        [[0.3, 0.3], [0.7, 0.28], [0.28, 0.7], [0.5, 0.5], [0.5, 0.8], [0.74, 0.7]].forEach(function (q, n) {
          var b = P(q[0], q[1], 0.18), hg = 12 + (n % 3) * 3, cf = n % 2 ? t : '#f5c542';
          s += '<path d="M' + n1(b[0]) + ' ' + n1(b[1]) + ' V' + n1(b[1] - hg) + '" stroke="#3f6b3a" stroke-width="1.6"/>' +
            '<path d="M' + n1(b[0]) + ' ' + n1(b[1] - 4) + ' q-5 -2 -6 -6 q5 0 6 4" fill="#5a9a4f" stroke="' + O + '" stroke-width="0.7"/>';
          for (var a = 0; a < 5; a++) { var an = a * 1.2566; s += rond(b[0] + Math.cos(an) * 3, b[1] - hg + Math.sin(an) * 3, 2.4, cf, 0.6); }
          s += '<circle cx="' + n1(b[0]) + '" cy="' + n1(b[1] - hg) + '" r="1.5" fill="' + (n % 2 ? '#ffe066' : '#c2410c') + '"/>';
        });
        return s;
      } },
    bassin: { nom: 'Bassin', rayon: 'meubles', plan: 'sol', w: 2, d: 2, h: 0.3, t: '#5aa0d0', chez: 'jardin', lieu: 'dehors', usage: 'renifler',
      dessin: function (k, t) {
        var P = k.P, s = boite(k, 0.08, 0.08, 0, 1.84, 1.84, 0.2, '#a8a29a', 8);
        s += poly([P(0.26, 0.26, 0.2), P(1.74, 0.26, 0.2), P(1.74, 1.74, 0.2), P(0.26, 1.74, 0.2)], t, 10, 1.2);
        s += '<g transform="' + plan(k, [0.26, 0.26, 0.2], [1, 0, 0], [0, 1, 0]) + '">' +
          '<path d="M8 14 h14 M30 42 h16 M12 50 h10" stroke="#d6efff" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>' +
          '<ellipse cx="44" cy="16" rx="8" ry="7" fill="#5a9a4f" stroke="' + O + '" stroke-width="1"/><path d="M44 16 L52 13" stroke="#3f6b3a" stroke-width="1.2"/>' +
          '<ellipse cx="18" cy="38" rx="6" ry="5.5" fill="#6cae5c" stroke="' + O + '" stroke-width="1"/>' + rond(18, 37, 2.2, '#f7a8c4', 0.6) +
          '<path d="M33 28 q4 -3 8 0 q-4 3 -8 0z M33 28 l-3 -2 v4z" fill="#ff922b" stroke="' + O + '" stroke-width="0.7"/></g>';
        return s;
      } },
    lanterne: { nom: 'Lanterne', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 1.75, t: '#3a3b40', chez: 'jardin', lieu: 'partout', lumiere: { u: 0.5, v: 0.5, z: 1.3, r: 2.2 },
      dessin: function (k, t) {
        var P = k.P, c = P(0.5, 0.5, 0), s = '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="12" ry="6" fill="#000" opacity="0.2"/>';
        s += cylindre(k, 0.5, 0.5, 0, 0.14, 0.08, t) + cylindre(k, 0.5, 0.5, 0.08, 0.04, 1.02, t, null, false);
        s += boite(k, 0.33, 0.33, 1.07, 0.34, 0.34, 0.04, t, 1) + boite(k, 0.36, 0.36, 1.11, 0.28, 0.28, 0.36, '#ffe9a8', 1);
        var l = P(0.5, 0.5, 1.28);
        s += '<circle cx="' + n1(l[0]) + '" cy="' + n1(l[1]) + '" r="15" fill="#ffd43b" opacity="0.18"/><ellipse cx="' + n1(l[0]) + '" cy="' + n1(l[1] + 2) + '" rx="2.4" ry="4" fill="#ff922b"/>';
        [[0.64, 0.36], [0.64, 0.64], [0.36, 0.64]].forEach(function (q) { s += ligne([P(q[0], q[1], 1.11), P(q[0], q[1], 1.47)], t, 1.6); });
        var p1 = P(0.68, 0.32, 1.5), p2 = P(0.68, 0.68, 1.5), p3 = P(0.32, 0.68, 1.5), sm = P(0.5, 0.5, 1.7);
        s += boite(k, 0.32, 0.32, 1.47, 0.36, 0.36, 0.03, t, 1) + poly([p1, p2, sm], nuance(t, -0.1), 1) + poly([p2, p3, sm], nuance(t, 0.15), 1) + rond(sm[0], sm[1] - 2, 2.2, t);
        return s;
      } }
  });
  MEUBLES.plante.lieu = 'partout'; MEUBLES.pouf.lieu = 'partout';
  // Un meuble va-t-il dans cette pièce ? (le jardin n'a ni mur ni plafond)
  function vaDans(mid, piece) {
    var m = MEUBLES[mid]; if (!m) return false;
    if (piece && piece.exterieur) return m.plan === 'sol' && (m.lieu === 'dehors' || m.lieu === 'partout');
    return m.lieu !== 'dehors';
  }

  // ---------- Les pièces de la maison et leur aménagement de départ ----------
  var PIECES = [
    { id: 'salon', nom: 'Salon', phrase: 'Il fait bon près du poêle.' },
    { id: 'cuisine', nom: 'Cuisine', phrase: 'Ça sent bon… c\'est pour moi ?', cp: { i: 4, j: 4 } },
    { id: 'chambre', nom: 'Chambre', phrase: 'Un petit somme me ferait du bien.' },
    { id: 'jeux', nom: 'Salle de jeux', phrase: 'On fait une partie ?' },
    { id: 'trophees', nom: 'Salle des trophées', phrase: 'Regarde toutes nos coupes !', cp: { i: 4, j: 3 } },
    { id: 'jardin', nom: 'Jardin', phrase: 'Quel bon air !', exterieur: true }
  ];
  function pieceDepart(id) {
    var base = { l: 6, p: 6, h: HAUTEUR, murD: null, plinthe: { type: 'simple', teinte: null }, corniche: false, fenetre: { vue: 'pre', cadre: null }, lumiere: { ambiance: 'chaude' } };
    var d = {
      salon: { murs: { motif: 'rayures', teinte: 'sauge' }, sol: { type: 'parquet', teinte: 'miel' }, objets: [
        { m: 'fenetre', i: 1.5, j: 0, o: 0, z: 1.05 }, { m: 'etagere', i: 4, j: 0, o: 0, z: 1.55 }, { m: 'tableau', i: 0, j: 1.5, o: 1, z: 1.3 }, { m: 'horloge', i: 0, j: 3, o: 1, z: 1.35 },
        { m: 'tapis', i: 1, j: 1, o: 0 }, { m: 'plante', i: 0, j: 0, o: 0 }, { m: 'canape', i: 1, j: 0, o: 0 }, { m: 'commode', i: 4, j: 0, o: 0 }, { m: 'poele', i: 5, j: 0, o: 0 },
        { m: 'lampadaire', i: 0, j: 1, o: 0 }, { m: 'fauteuil', i: 0, j: 2, o: 1 }, { m: 'tableBasse', i: 1, j: 2, o: 0 }, { m: 'bibliotheque', i: 0, j: 4, o: 1 },
        { m: 'malle', i: 5, j: 5, o: 0 }, { m: 'suspension', i: 2, j: 3, o: 0 }] },
      cuisine: { murs: { motif: 'faience', teinte: 'creme' }, sol: { type: 'tomettes', teinte: 'terracotta' }, plinthe: { type: 'aucune', teinte: null }, fenetre: { vue: 'village', cadre: 'sauge' }, objets: [
        { m: 'fenetre', i: 0.5, j: 0, o: 0, z: 1.1 }, { m: 'ustensiles', i: 2, j: 0, o: 0, z: 1.45 }, { m: 'etagere', i: 0, j: 3.5, o: 1, z: 1.5 },
        { m: 'planTravail', i: 0, j: 0, o: 0 }, { m: 'cuisiniere', i: 2, j: 0, o: 0 }, { m: 'frigo', i: 0, j: 2, o: 1 }, { m: 'plante', i: 5, j: 0, o: 0 },
        { m: 'tableRonde', i: 3, j: 3, o: 0 }, { m: 'chaise', i: 3, j: 2, o: 0 }, { m: 'chaise', i: 2, j: 3, o: 1 }, { m: 'gamelle', i: 0, j: 4, o: 1 }, { m: 'suspension', i: 3, j: 3, o: 0 }] },
      chambre: { murs: { motif: 'fleurs', teinte: 'sable' }, sol: { type: 'moquette', teinte: 'sauge' }, fenetre: { vue: 'foret', cadre: null }, lumiere: { ambiance: 'chaude' }, objets: [
        { m: 'fenetre', i: 2.5, j: 0, o: 0, z: 1.05 }, { m: 'miroir', i: 0, j: 4, o: 1, z: 1.05 }, { m: 'tableau', i: 0, j: 1.5, o: 1, z: 1.45 },
        { m: 'lit', i: 0, j: 1, o: 1 }, { m: 'chevet', i: 0, j: 0, o: 0 }, { m: 'armoire', i: 5, j: 0, o: 0 }, { m: 'commode', i: 4, j: 0, o: 0 },
        { m: 'tapis', i: 2, j: 2, o: 0, t: 'prune' }, { m: 'nounours', i: 4, j: 4, o: 0 }, { m: 'pouf', i: 0, j: 5, o: 0, t: 'prune' }] },
      jeux: { murs: { motif: 'losanges', teinte: 'moutarde' }, sol: { type: 'damier', teinte: 'ardoise' }, plinthe: { type: 'haute', teinte: 'nuit' }, objets: [
        { m: 'fenetre', i: 1, j: 0, o: 0, z: 1.05 }, { m: 'cible', i: 3, j: 0, o: 0, z: 1.35 }, { m: 'etagere', i: 0, j: 2, o: 1, z: 1.5 },
        { m: 'arcade', i: 5, j: 0, o: 0 }, { m: 'arcade', i: 4, j: 0, o: 0, t: 'brique' }, { m: 'tableJeu', i: 2, j: 2, o: 0 },
        { m: 'pouf', i: 2, j: 3, o: 0 }, { m: 'pouf', i: 3, j: 3, o: 0, t: 'ardoise' }, { m: 'coffreJouets', i: 0, j: 4, o: 1 }, { m: 'ballon', i: 5, j: 4, o: 0 }, { m: 'suspension', i: 3, j: 2, o: 0 }] },
      trophees: { murs: { motif: 'rayures', teinte: 'prune' }, sol: { type: 'chevrons', teinte: 'miel' }, plinthe: { type: 'lambris', teinte: 'chocolat' }, corniche: true, objets: [
        { m: 'ecu', i: 2.5, j: 0, o: 0, z: 1.3 }, { m: 'fenetre', i: 0, j: 2, o: 1, z: 1.05 }, { m: 'tableau', i: 0, j: 4, o: 1, z: 1.3 },
        { m: 'vitrine', i: 1, j: 0, o: 0 }, { m: 'vitrine', i: 4, j: 0, o: 0 }, { m: 'tapis', i: 2, j: 2, o: 0, t: 'brique' }, { m: 'piedestal', i: 2, j: 2, o: 0 },
        { m: 'lampadaire', i: 0, j: 0, o: 0 }, { m: 'plante', i: 5, j: 5, o: 0 }] },
      jardin: { exterieur: true, h: 1.05, murs: { motif: 'haie', teinte: 'foret' }, sol: { type: 'herbe', teinte: 'sauge' }, plinthe: { type: 'aucune', teinte: null }, lumiere: { ambiance: 'neutre' }, objets: [
        { m: 'arbre', i: 0, j: 0, o: 0 }, { m: 'banc', i: 2, j: 0, o: 0 }, { m: 'massif', i: 5, j: 0, o: 0 }, { m: 'massif', i: 0, j: 4, o: 0, t: 'prune' },
        { m: 'bassin', i: 3, j: 3, o: 0 }, { m: 'lanterne', i: 1, j: 2, o: 0 }, { m: 'plante', i: 5, j: 2, o: 0 }, { m: 'ballon', i: 1, j: 5, o: 0 }] }
    }[id] || {};
    var p = JSON.parse(JSON.stringify(base));
    Object.keys(d).forEach(function (cle) { p[cle] = JSON.parse(JSON.stringify(d[cle])); });
    return p;
  }

  // ---------- Habillage : motifs des murs et types de sol (dessinés d'après une teinte) ----------
  var MOTIFS_MUR = [
    { id: 'uni', nom: 'Uni' }, { id: 'rayures', nom: 'Rayures' }, { id: 'faience', nom: 'Faïence' }, { id: 'fleurs', nom: 'Petites fleurs' },
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
      case 'faience': s = '<pattern id="' + id + '" width="13.333" height="13.333" patternUnits="userSpaceOnUse"><rect width="13.333" height="13.333" fill="' + nuance(t, -0.18) + '"/>' +
        '<rect x="0.7" y="0.7" width="11.9" height="11.9" rx="1" fill="' + t + '"/><path d="M2.2 3.2 l3 -1" stroke="#fff" stroke-opacity="0.6" stroke-width="0.8" stroke-linecap="round"/></pattern>'; break;
      // la haie du jardin (à la place des murs)
      case 'haie': s = '<pattern id="' + id + '" width="24" height="20" patternUnits="userSpaceOnUse"><rect width="24" height="20" fill="' + nuance(t, -0.22) + '"/>' +
        [[6, 6, 5.5], [17, 5, 5.5], [11, 15, 5.5], [23, 15, 4.5], [0, 15, 4.5]].map(function (b) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + t + '"/><circle cx="' + (b[0] - 1.5) + '" cy="' + (b[1] - 2) + '" r="1.8" fill="' + c + '" opacity="0.7"/>'; }).join('') + '</pattern>'; break;
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

  // ---------- Objets rares de la boutique de Pipa (on ne les trouve que dans sa vitrine) ----------
  Object.assign(MEUBLES, {
    fauteuilBascule: { nom: 'Rocking-chair', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.2, t: 'brique', chez: 'salon', exclusif: true, usage: 'sieste',
      dessin: function (k, t) {
        var P = k.P, s = ombreSol(k, 0.12, 0.08, 0.76, 0.84), bois = BOIS;
        [0.18, 0.78].forEach(function (u) {
          var a = P(u, 0.02, 0.1), b = P(u, 0.98, 0.1), m = P(u, 0.5, -0.12), d = 'M' + pt(a) + ' Q' + pt(m) + ' ' + pt(b);
          s += '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="5" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + bois + '" stroke-width="2.6" stroke-linecap="round"/>';
        });
        [[0.16, 0.22], [0.76, 0.22], [0.16, 0.72], [0.76, 0.72]].forEach(function (p) { s += boite(k, p[0], p[1], 0.02, 0.07, 0.07, 0.42, BOIS_S, 1); });
        [0.2, 0.42, 0.64].forEach(function (u) { s += boite(k, u, 0.18, 0.49, 0.1, 0.06, 0.58, bois, 1); });
        s += boite(k, 0.14, 0.16, 1.05, 0.72, 0.1, 0.1, bois, 2);
        s += boite(k, 0.14, 0.18, 0.42, 0.72, 0.62, 0.07, bois, 2) + coussin(k, 0.2, 0.26, 0.49, 0.6, 0.5, 0.09, t);
        s += boite(k, 0.1, 0.24, 0.7, 0.08, 0.58, 0.05, BOIS_C, 1) + boite(k, 0.82, 0.24, 0.7, 0.08, 0.58, 0.05, BOIS_C, 1);
        // un plaid posé sur le dossier
        s += poly([P(0.26, 0.2, 1.02), P(0.62, 0.2, 1.02), P(0.62, 0.26, 0.6), P(0.26, 0.26, 0.66)], '#4f6e9a', 2, 1.1);
        s += ligne([P(0.32, 0.22, 0.98), P(0.32, 0.25, 0.68)], '#fbf3e6', 1.2, ' opacity="0.8"') + ligne([P(0.52, 0.22, 0.98), P(0.52, 0.25, 0.64)], '#fbf3e6', 1.2, ' opacity="0.8"');
        return s;
      } },
    aquarium: { nom: 'Aquarium', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 1.45, t: 'chocolat', chez: 'salon', exclusif: true, usage: 'regarder', lumiere: { u: 0.5, v: 0.5, z: 1.0, r: 1.4, c: '#7ad3ff' },
      dessin: function (k, t) {
        var s = ombreSol(k, 0.08, 0.15, 0.84, 0.7);
        s += boite(k, 0.08, 0.15, 0, 0.84, 0.7, 0.62, t, 2);
        s += '<g transform="' + face(k, 0.08, 0.85, 0.62) + '"><rect x="2.5" y="3" width="14" height="19" rx="1" fill="' + nuance(t, 0.08) + '" stroke="' + O + '" stroke-width="0.9"/><rect x="17.6" y="3" width="14" height="19" rx="1" fill="' + nuance(t, 0.08) + '" stroke="' + O + '" stroke-width="0.9"/></g>';
        s += boite(k, 0.12, 0.2, 0.62, 0.76, 0.6, 0.5, '#4fa3c7', 1);
        s += '<g transform="' + face(k, 0.12, 0.8, 1.12) + '"><rect x="0" y="16" width="30.4" height="4" fill="#d9b98a"/>' +
          '<path d="M5 20 q-2 -7 1 -12 q2 6 0 12 M8 20 q2 -9 -1 -15 M24 20 q-1 -6 2 -10 q1 5 -1 10" fill="none" stroke="#3f8a3a" stroke-width="1.6" stroke-linecap="round"/>' +
          '<path d="M14 9 q4 -3 8 0 q-4 3 -8 0z M14 9 l-3 -2 v4z" fill="#ff922b" stroke="' + O + '" stroke-width="0.6"/><circle cx="20" cy="8.4" r="0.6" fill="' + O + '"/>' +
          '<path d="M22 14 q3 -2 6 0 q-3 2 -6 0z M22 14 l-2 -1.5 v3z" fill="#f5c542" stroke="' + O + '" stroke-width="0.5"/>' +
          '<circle cx="11" cy="6" r="0.9" fill="none" stroke="#e7f5ff" stroke-width="0.6"/><circle cx="12" cy="3" r="0.7" fill="none" stroke="#e7f5ff" stroke-width="0.6"/><path d="M2 2 l6 -1.5" stroke="#fff" stroke-opacity="0.5" stroke-width="1.2"/></g>';
        s += boite(k, 0.1, 0.18, 1.12, 0.8, 0.64, 0.06, '#3a3b40', 1.5);
        return s;
      } },
    cheminee: { nom: 'Cheminée', rayon: 'meubles', plan: 'sol', w: 2, d: 1, h: 2.6, t: 'creme', chez: 'salon', exclusif: true, usage: 'chaleur', lumiere: { u: 1, v: 0.75, z: 0.4, r: 2.2, c: '#ff8a2a' },
      dessin: function (k, t) {
        var P = k.P, s = '';
        s += boite(k, 0.38, 0, 1.4, 1.24, 0.4, k.H - 1.4, nuance(t, -0.05), 1);
        s += boite(k, 0.04, 0, 0, 1.92, 0.55, 1.3, t, 2);
        s += '<g transform="' + face(k, 0.04, 0.55, 1.3) + '">' +
          '<path d="M3 3 H74 V49 H3Z" fill="none" stroke="' + nuance(t, -0.2) + '" stroke-width="1"/>' +
          '<path d="M20 52 V26 Q38 10 57 26 V52Z" fill="#1d1a18" stroke="' + O + '" stroke-width="1.4"/>' +
          '<path d="M26 50 h26" stroke="#5c3d28" stroke-width="3.4" stroke-linecap="round"/><path d="M28 47 l22 -3" stroke="#7a5232" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M30 46 Q28 36 34 30 Q34 37 38 36 Q38 28 43 24 Q44 32 48 34 Q50 40 47 46Z" fill="#ff922b"/><path d="M34 46 Q33 40 37 36 Q38 41 41 40 Q43 36 44 43 Q44 46 42 46Z" fill="#ffe066"/>' +
          [10, 18, 61, 69].map(function (x) { return '<path d="M' + x + ' 10 v38" stroke="' + nuance(t, -0.15) + '" stroke-width="0.8" opacity="0.7"/>'; }).join('') + '</g>';
        s += boite(k, 0, 0, 1.3, 2, 0.66, 0.1, nuance(t, -0.18), 2);
        s += boite(k, 0.12, 0.55, 0, 1.76, 0.26, 0.05, '#7a6f66', 1.5);
        // sur le manteau : deux bougies et une petite horloge
        s += cylindre(k, 0.3, 0.32, 1.4, 0.05, 0.22, '#fbf3e6') + cylindre(k, 1.7, 0.32, 1.4, 0.05, 0.18, '#fbf3e6');
        [P(0.3, 0.32, 1.66), P(1.7, 0.32, 1.62)].forEach(function (f) { s += '<ellipse cx="' + n1(f[0]) + '" cy="' + n1(f[1]) + '" rx="1.6" ry="2.8" fill="#ffd43b"/>'; });
        var h = P(1.0, 0.3, 1.4);
        s += '<rect x="' + n1(h[0] - 7) + '" y="' + n1(h[1] - 13) + '" width="14" height="13" rx="3" fill="' + BOIS + '" stroke="' + O + '" stroke-width="1"/>' + rond(h[0], h[1] - 7, 4.4, '#fbf3e6', 0.9) +
          '<path d="M' + n1(h[0]) + ' ' + n1(h[1] - 7) + ' v-3 M' + n1(h[0]) + ' ' + n1(h[1] - 7) + ' h2.5" stroke="' + O + '" stroke-width="0.9"/>';
        return s;
      } },
    guirlande: { nom: 'Guirlande lumineuse', rayon: 'deco', plan: 'mur', w: 2, h: 0.45, z: 1.95, t: 'moutarde', exclusif: true, lumiere: { u: 1, v: 0.2, z: 2.1, r: 1.8, c: '#ffe08a' },
      dessin: function (k, t) {
        var s = '<g transform="' + plan(k, [0, 0, k.z + 0.45], [1, 0, 0], [0, 0, -1]) + '">', cs = ['#ffd43b', '#ff6b6b', '#69db7c', '#4dabf7', '#f783ac'];
        s += '<path d="M2 3 Q20 15 40 4 Q60 15 78 3" fill="none" stroke="' + O + '" stroke-width="1.1"/>';
        for (var n = 0; n < 11; n++) {
          var x = 4 + n * 7.2, seg = x < 40 ? (x - 2) / 38 : (x - 40) / 38, y = (x < 40 ? 3 + (4 - 3) * seg : 4 + (3 - 4) * seg) + 2 * 6 * seg * (1 - seg) * 2 + 1.5;
          if (k.env.nuit) s += '<circle cx="' + n1(x) + '" cy="' + n1(y + 2) + '" r="4.5" fill="' + cs[n % 5] + '" opacity="0.35"/>';
          s += '<ellipse cx="' + n1(x) + '" cy="' + n1(y + 2) + '" rx="1.6" ry="2.3" fill="' + cs[n % 5] + '" stroke="' + O + '" stroke-width="0.5"/>';
        }
        return s + '</g>';
      } },
    lustre: { nom: 'Lustre', rayon: 'deco', plan: 'plafond', w: 1, d: 1, h: 1.0, t: 'moutarde', exclusif: true, lumiere: { u: 0.5, v: 0.5, zH: -0.72, r: 3.0 },
      dessin: function (k, t) {
        var H = k.H, P = k.P, s = '', a = P(0.5, 0.5, H), b = P(0.5, 0.5, H - 0.45);
        s += ligne([a, b], O, 1.6);
        var bras = [], N = 6;
        for (var q = 0; q < N; q++) { var an = q / N * Math.PI * 2; bras.push({ u: 0.5 + Math.cos(an) * 0.3, v: 0.5 + Math.sin(an) * 0.3 }); }
        bras.sort(function (x, y) { return (x.u + x.v) - (y.u + y.v); });
        var c = P(0.5, 0.5, H - 0.78);
        var bougie = function (q) {
          var p0 = P(q.u, q.v, H - 0.72), r = '';
          r += ligne([c, p0], O, 2.6) + ligne([c, p0], nuance(t, 0.1), 1.2);
          r += '<rect x="' + n1(p0[0] - 1.6) + '" y="' + n1(p0[1] - 7) + '" width="3.2" height="7" fill="#fbf3e6" stroke="' + O + '" stroke-width="0.7"/><ellipse cx="' + n1(p0[0]) + '" cy="' + n1(p0[1] - 9) + '" rx="1.5" ry="2.6" fill="#ffd43b"/>';
          return r;
        };
        bras.slice(0, 3).forEach(function (q) { s += bougie(q); });
        s += '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="7" ry="5" fill="' + t + '" stroke="' + O + '" stroke-width="1.2"/><path d="M' + n1(c[0]) + ' ' + n1(c[1] + 5) + ' l-2 5 h4z" fill="' + t + '" stroke="' + O + '" stroke-width="0.8"/>';
        s += ligne([b, [c[0], c[1] - 5]], O, 1.6);
        bras.slice(3).forEach(function (q) { s += bougie(q); });
        return s;
      } },
    tapisRond: { nom: 'Tapis rond', rayon: 'deco', plan: 'sol', w: 2, d: 2, h: 0, plat: true, t: 'sauge', exclusif: true,
      dessin: function (k, t) {
        var c2 = '#efe2c8', s = '<g transform="' + plan(k, [0, 0, 0], [1, 0, 0], [0, 1, 0]) + '">';
        s += '<circle cx="40" cy="40" r="36" fill="' + t + '" stroke="' + O + '" stroke-width="' + EP * 1.6 + '"/>';
        s += '<circle cx="40" cy="40" r="30" fill="none" stroke="' + c2 + '" stroke-width="2.4"/><circle cx="40" cy="40" r="26" fill="none" stroke="' + nuance(t, -0.25) + '" stroke-width="1.4"/>';
        for (var a = 0; a < 8; a++) { var an = a * Math.PI / 4; s += '<ellipse cx="' + n1(40 + Math.cos(an) * 14) + '" cy="' + n1(40 + Math.sin(an) * 14) + '" rx="6" ry="3" transform="rotate(' + a * 45 + ' ' + n1(40 + Math.cos(an) * 14) + ' ' + n1(40 + Math.sin(an) * 14) + ')" fill="' + nuance(t, 0.25) + '" stroke="' + c2 + '" stroke-width="1"/>'; }
        s += '<circle cx="40" cy="40" r="6" fill="#d8a73a" stroke="' + nuance(t, -0.25) + '" stroke-width="1.2"/>';
        return s + '</g>';
      } },
    fontaine: { nom: 'Fontaine', rayon: 'meubles', plan: 'sol', w: 1, d: 1, h: 1.4, t: '#a8a29a', chez: 'jardin', lieu: 'dehors', exclusif: true, usage: 'boire',
      dessin: function (k, t) {
        var P = k.P, c = P(0.5, 0.5, 0), s = '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="22" ry="11" fill="#000" opacity="0.18"/>';
        s += cylindre(k, 0.5, 0.5, 0, 0.44, 0.26, t);
        var w = P(0.5, 0.5, 0.26);
        s += '<ellipse cx="' + n1(w[0]) + '" cy="' + n1(w[1]) + '" rx="16" ry="8" fill="#5aa0d0"/><path d="M' + n1(w[0] - 10) + ' ' + n1(w[1]) + ' h5 M' + n1(w[0] + 4) + ' ' + n1(w[1] + 3) + ' h6" stroke="#d6efff" stroke-width="1.2" stroke-linecap="round"/>';
        s += cylindre(k, 0.5, 0.5, 0.26, 0.08, 0.52, t, 0.06, false) + cylindre(k, 0.5, 0.5, 0.76, 0.12, 0.08, t, 0.22);
        var h = P(0.5, 0.5, 0.84);
        s += '<ellipse cx="' + n1(h[0]) + '" cy="' + n1(h[1]) + '" rx="7" ry="3.5" fill="#5aa0d0"/>';
        s += '<path d="M' + n1(h[0]) + ' ' + n1(h[1] - 1) + ' V' + n1(h[1] - 14) + ' M' + n1(h[0]) + ' ' + n1(h[1] - 14) + ' Q' + n1(h[0] - 8) + ' ' + n1(h[1] - 18) + ' ' + n1(h[0] - 11) + ' ' + n1(h[1] - 2) +
          ' M' + n1(h[0]) + ' ' + n1(h[1] - 14) + ' Q' + n1(h[0] + 8) + ' ' + n1(h[1] - 18) + ' ' + n1(h[0] + 11) + ' ' + n1(h[1] - 2) + '" fill="none" stroke="#9fd3f0" stroke-width="1.8" stroke-linecap="round"/>';
        [[-12, 6], [12, 7], [-6, 10], [7, 11]].forEach(function (d) { s += '<circle cx="' + n1(h[0] + d[0]) + '" cy="' + n1(h[1] + d[1]) + '" r="1" fill="#d6efff"/>'; });
        return s;
      } },
    nichoir: { nom: 'Nichoir', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 1.9, t: 'sauge', chez: 'jardin', lieu: 'dehors', exclusif: true, usage: 'regarder',
      dessin: function (k, t) {
        var P = k.P, c = P(0.5, 0.5, 0), s = '<ellipse cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" rx="10" ry="5" fill="#000" opacity="0.18"/>';
        s += cylindre(k, 0.5, 0.5, 0, 0.05, 1.3, '#7a5232', null, false);
        s += boite(k, 0.33, 0.33, 1.3, 0.34, 0.34, 0.32, t, 1.5);
        s += '<g transform="' + face(k, 0.33, 0.67, 1.62) + '">' + rond(6.8, 5, 2.6, '#3a2c22', 0.7) + '<path d="M6.8 9.5 v3" stroke="' + O + '" stroke-width="1.2"/></g>';
        var p1 = P(0.7, 0.3, 1.62), p2 = P(0.7, 0.7, 1.62), p3 = P(0.3, 0.7, 1.62), sm = P(0.5, 0.5, 1.86);
        s += poly([p1, p2, sm], '#a8483a', 1) + poly([p2, p3, sm], '#c25b4a', 1);
        // un oiseau sur le toit
        var o = P(0.5, 0.5, 1.86);
        s += '<path d="M' + n1(o[0] - 1) + ' ' + n1(o[1] - 1) + ' q4 -6 9 -3 q-2 4 -9 3z" fill="#4dabf7" stroke="' + O + '" stroke-width="0.8"/>' + rond(o[0] + 7.5, o[1] - 5.5, 2.4, '#4dabf7', 0.8) +
          '<path d="M' + n1(o[0] + 9.6) + ' ' + n1(o[1] - 5.5) + ' l2.2 0.6 l-2.2 0.6z" fill="#f5c542"/><circle cx="' + n1(o[0] + 8) + '" cy="' + n1(o[1] - 6.2) + '" r="0.6" fill="' + O + '"/>';
        return s;
      } }
  });

  // ---------- Les décos d'avant (4.20) : bibelots sur socle, cadres au mur, couchages ----------
  // Chaque ancienne déco de la boutique, souvenir d'expédition, du Donjon, de la Vallée ou de fête devient un objet de la maison :
  // ob = { m: 'bibelot' | 'cadre' | 'couchage', a: identifiant de l'article, i, j, o, z, t }. Son icône est dessinée (vallee-pictos.js).
  // Quelques décos ont un vrai meuble qui leur ressemble : elles deviennent ce meuble.
  var DECO_MEUBLE = { plante: 'plante', tableau: 'tableau', horloge: 'horloge', lampe: 'lampadaire', balle: 'ballon', peluche: 'nounours', miroir: 'miroir' };
  var DECO_MUR = { 'val-carte': 1, 'val-banniere': 1, etendard: 1, blason: 1 };
  var COUCHAGES = { coussin: 1, panier: 1, niche: 1, chateau: 1 };
  // Article → icône (même table que le livre des trésors de la Vallée, plus les décos de la boutique et des fêtes)
  var PICTO_DECO = { clap: 'clap', popcorn: 'popcorn', bobine: 'bobine', projecteur: 'projecteur', microscope: 'microscope', eprouvettes: 'fiole', telescope: 'longuevue', aimant: 'aimant',
    blason: 'bouclier', etendard: 'drapeau', chandelier: 'chandelier', heaume: 'heaume', mappemonde: 'mappemonde', boussole: 'boussole', coquillage: 'coquillage', ancre: 'ancre',
    'cle-donjon': 'cle', 'coffre-tresor': 'coffre', bouclier: 'bouclier', 'couronne-gluant': 'couronne',
    'val-lanterne': 'lanterne', 'val-banniere': 'drapeau', 'val-champi': 'champignon', 'val-hibou': 'hibou', 'val-lucioles': 'luciole', 'val-edelweiss': 'fleur', 'val-carte': 'carte',
    'fab-tabouret': 'tabouret', 'fab-bouquet': 'bouquet', 'fab-nichoir': 'nichoir', 'fab-statuette': 'statue', 'fab-muret': 'tulipe', 'fab-lampe': 'boule', 'fab-vitrine': 'cristal', 'fab-bassin': 'fontaine',
    cactus: 'cactus', tournesol: 'tournesol', pelote: 'pelote', os: 'os', livres: 'livres', radio: 'radio', bocal: 'bocal',
    'boule-facettes': 'boulefacettes', poele: 'crepe', bouquet: 'bouquet', 'pot-or': 'trefle', 'nid-oeufs': 'nid', guitare: 'guitare', parasol: 'parasol', citrouille: 'citrouille', ballons: 'ballons', sapin: 'sapin',
    coussin: 'coussin', panier: 'panier', niche: 'niche', chateau: 'chateau' };
  // Les décos lumineuses éclairent la nuit
  var DECO_LUMIERE = { 'val-lanterne': '#ffb347', 'val-champi': '#9ae6b4', 'val-lucioles': '#d8f56b', 'fab-lampe': '#c3a6ff', citrouille: '#ff922b', chandelier: '#ffc46b', 'boule-facettes': '#e5dbff' };
  // Quel objet de la maison pour cet article (null : rien, comme les rideaux, déjà à la fenêtre)
  function objetDeco(aid) {
    if (DECO_MEUBLE[aid]) return { m: DECO_MEUBLE[aid] };
    if (aid === 'rideaux') return null;
    if (COUCHAGES[aid]) return { m: 'couchage', a: aid };
    return { m: DECO_MUR[aid] ? 'cadre' : 'bibelot', a: aid };
  }
  function icone(aid, cx, cy, taille) {
    var nom = PICTO_DECO[aid];
    if (typeof VLP === 'undefined') return '';
    if (!nom && typeof CP !== 'undefined' && CP.art) nom = VLP.nom((CP.art(aid) || {}).ico || '');
    if (nom === 'hibou' && typeof VLD !== 'undefined' && VLD.habitant) {
      var t = taille || 24; return VLD.habitant('hibou', t).replace('<svg ', '<svg x="' + n1(cx - t / 2) + '" y="' + n1(cy - t * 0.62) + '" ');
    }
    return nom ? VLP.g(nom, cx, cy, taille || 24) : rond(cx, cy, (taille || 24) * 0.3, '#e9b949', 1);
  }
  function nomDeco(aid) { var a = typeof CP !== 'undefined' && CP.art ? CP.art(aid) : null; return (a && a.nom) || 'Bibelot'; }
  Object.assign(MEUBLES, {
    bibelot: { nom: 'Bibelot', rayon: 'deco', plan: 'sol', w: 1, d: 1, h: 1.1, t: 'sable', lieu: 'partout', usage: 'bibelot', deco: true,
      dessin: function (k, t, ob) {
        var s = ombreSol(k, 0.26, 0.26, 0.48, 0.48), P = k.P;
        s += boite(k, 0.24, 0.24, 0, 0.52, 0.52, 0.08, nuance(t, -0.15), 1.5) + boite(k, 0.3, 0.3, 0.08, 0.4, 0.4, 0.34, t, 1.2) + boite(k, 0.26, 0.26, 0.42, 0.48, 0.48, 0.06, nuance(t, 0.1), 1.2);
        var h = P(0.5, 0.5, 0.48);
        return s + icone(ob && ob.a, h[0], h[1] - 14, 30);
      } },
    cadre: { nom: 'Cadre', rayon: 'deco', plan: 'mur', w: 1, h: 0.85, z: 1.25, t: 'chocolat', deco: true,
      dessin: function (k, t, ob) {
        var s = '<g transform="' + plan(k, [0, 0, k.z + 0.85], [1, 0, 0], [0, 0, -1]) + '">';
        s += '<rect x="4" y="1.5" width="32" height="31" rx="2" fill="' + t + '" stroke="' + O + '" stroke-width="1.6"/><rect x="7.5" y="5" width="25" height="24" rx="1" fill="#fbf3e6" stroke="' + O + '" stroke-width="0.9"/>';
        s += '<path d="M8 5.5 h24" stroke="' + nuance(t, 0.35) + '" stroke-width="1"/>' + icone(ob && ob.a, 20, 17, 20);
        return s + '</g>';
      } },
    couchage: { nom: 'Couchage', rayon: 'meubles', plan: 'sol', plat: true, w: 1, d: 1, h: 0.7, t: 'prune', lieu: 'partout', usage: 'refuge', deco: true,
      dessin: function (k, t, ob) {
        var r = ob && typeof CP !== 'undefined' && CP.REFUGES ? CP.REFUGES[ob.a] : null, b = k.P(0.5, 0.62, 0);
        if (!r) return ombreSol(k, 0.15, 0.15, 0.7, 0.7) + boite(k, 0.15, 0.15, 0, 0.7, 0.7, 0.18, t, 4);
        var w = ob.a === 'chateau' ? 92 : ob.a === 'niche' ? 84 : 76, h = w * 200 / 240;
        return '<svg x="' + n1(b[0] - w / 2) + '" y="' + n1(b[1] - h * 0.93) + '" width="' + n1(w) + '" height="' + n1(h) + '" viewBox="0 0 240 200" overflow="visible">' + r.fond + r.devant + '</svg>';
      } }
  });
  // Lumière des décos qui éclairent (la scène la lit sur l'objet)
  function lumiereDe(ob) {
    var m = MEUBLES[ob.m]; if (!m) return null;
    if (m.lumiere) return m.lumiere;
    if (ob.a && DECO_LUMIERE[ob.a]) return ob.m === 'cadre' ? { u: 0.5, v: 0.1, z: 1.6, r: 1.3, c: DECO_LUMIERE[ob.a] } : { u: 0.5, v: 0.5, z: 0.75, r: 1.5, c: DECO_LUMIERE[ob.a] };
    return null;
  }
  // Nom d'un objet posé (un bibelot porte le nom de son article)
  function nomObjet(ob) { return ob.a ? nomDeco(ob.a) : (MEUBLES[ob.m] || {}).nom || ''; }

  // ---------- La boutique de Pipa : prix, habillages payants, vitrine de la semaine ----------
  var PRIX = {
    canape: 30, fauteuil: 18, tableBasse: 15, tapis: 12, bibliotheque: 25, commode: 18, lampadaire: 14, plante: 8, pouf: 6, malle: 12, poele: 30,
    fenetre: 15, tableau: 8, etagere: 8, horloge: 10, suspension: 12, planTravail: 25, cuisiniere: 25, frigo: 30, tableRonde: 15, chaise: 8, gamelle: 6, ustensiles: 6,
    lit: 30, chevet: 15, armoire: 25, nounours: 8, miroir: 10, tableJeu: 25, arcade: 40, coffreJouets: 12, ballon: 4, cible: 8, vitrine: 25, piedestal: 18, ecu: 10,
    arbre: 20, banc: 15, massif: 8, bassin: 30, lanterne: 12,
    fauteuilBascule: 35, aquarium: 45, cheminee: 60, guirlande: 20, lustre: 40, tapisRond: 25, fontaine: 50, nichoir: 20
  };
  Object.keys(PRIX).forEach(function (id) { if (MEUBLES[id]) MEUBLES[id].prix = PRIX[id]; });
  // Habillages qui s'achètent : clé « genre:id »
  var HABILLAGES = [];
  MOTIFS_MUR.forEach(function (m) { if (m.prix) HABILLAGES.push({ cle: 'mur:' + m.id, genre: 'mur', id: m.id, nom: 'Murs : ' + m.nom.toLowerCase(), prix: m.prix }); });
  SOLS.forEach(function (m) { if (m.prix) HABILLAGES.push({ cle: 'sol:' + m.id, genre: 'sol', id: m.id, nom: 'Sol : ' + m.nom.toLowerCase(), prix: m.prix }); });
  PLINTHES.forEach(function (m) { if (m.prix) HABILLAGES.push({ cle: 'plinthe:' + m.id, genre: 'plinthe', id: m.id, nom: 'Plinthes : ' + m.nom.toLowerCase(), prix: m.prix }); });
  HABILLAGES.push({ cle: 'corniche', genre: 'corniche', id: 'corniche', nom: 'Corniche', prix: 10 });
  var HAB = {}; HABILLAGES.forEach(function (h) { HAB[h.cle] = h; });
  function habGratuit(cle) { return !HAB[cle]; }
  // Semaine de la vitrine (change le lundi, heure du téléphone), comme les rumeurs de la Vallée
  var JOUR = 86400000;
  function semaine(t) {
    var d = new Date(t || Date.now()); d.setHours(0, 0, 0, 0);
    return Math.floor(Math.round((d - new Date(2026, 10, 9)) / JOUR) / 7);
  }
  function lundiSuivant(t) { var d = new Date(2026, 10, 9); d.setDate(d.getDate() + (semaine(t) + 1) * 7); return d; }
  // Mélange fixe (le même pour tout le monde) ; la vitrine avance dans le cycle chaque semaine : chaque objet revient
  function melange(liste, graine) {
    var a = liste.slice(), x = graine;
    function r() { x = (x + 0x6D2B79F5) | 0; var t = Math.imul(x ^ (x >>> 15), 1 | x); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), c = a[i]; a[i] = a[j]; a[j] = c; }
    return a;
  }
  var RARES = melange(Object.keys(MEUBLES).filter(function (id) { return MEUBLES[id].exclusif; }), 11);
  var COURANTS = melange(Object.keys(MEUBLES).filter(function (id) { return !MEUBLES[id].exclusif && MEUBLES[id].prix; }), 23);
  var HABS = melange(HABILLAGES.map(function (h) { return h.cle; }), 37);
  function tranche(l, w, n) { var r = []; for (var q = 0; q < n; q++) r.push(l[((w * n + q) % l.length + l.length) % l.length]); return r; }
  // La vitrine d'une semaine : 2 objets rares, 4 courants, 2 habillages
  function vitrine(t) {
    var w = semaine(t);
    return { semaine: w, rares: tranche(RARES, w, 2), objets: tranche(COURANTS, w, 4), habillages: tranche(HABS, w, 2), fin: lundiSuivant(t) };
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
    var H = piece.exterieur ? CIEL : (piece.h || HAUTEUR), m = 14;   // dehors : le ciel au-dessus de la haie
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
    return m.dessin(k, t, ob);
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
    var env = { nuit: nuit, vue: hb.fenetre.vue, cadre: hb.fenetre.cadre, coupes: op.coupes || null, cv: 0, etagere: op.etagere || null };
    var e = 0.22, dehors = !!piece.exterieur, Hc = dehors ? CIEL : H;
    // contour de la pièce (sert à poser la nuit et les lumières seulement sur elle) ; dehors, il monte jusqu'en haut du ciel
    var contour = [proj(-e, -e, Hc), proj(l, -e, Hc), proj(l, -e, 0), [proj(l, 0)[0], proj(l, 0)[1] + BORD], [proj(l, p)[0], proj(l, p)[1] + BORD], [proj(0, p)[0], proj(0, p)[1] + BORD], proj(-e, p, 0), proj(-e, p, Hc)];
    s += '<defs>' + motifMur(id + '-murg', mG.motif, tg) + motifMur(id + '-mur', mD.motif, td) + motifSol(id + '-sol', hb.sol.type, ts) +
      '<clipPath id="' + id + '-piece"><path d="' + chemin(contour) + '"/></clipPath>';
    // halos des lampes (dégradés : un seul jeu d'identifiants par scène)
    var lampes = [];
    if (nuit) piece.objets.forEach(function (ob, n) {
      var L = lumiereDe(ob); if (!L) return;
      var k = contexte(ob.i, ob.j, ob.o ? 1 : 0, 0, H), z = L.zH != null ? H + L.zH : L.z, c = L.c || amb.lampe;
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
    // dehors : le ciel (à la place du haut des murs), puis des arbres qui dépassent derrière la haie
    if (dehors) {
      s += poly([proj(0, p, H), proj(0, p, CIEL), proj(0, 0, CIEL), proj(l, 0, CIEL), proj(l, 0, H), proj(0, 0, H)], '#b9dcec', 0, 0);
      [[0.4, 3.6, 2.45, 14], [1.6, -0.2, 2.55, 12], [4.2, -0.2, 2.3, 10]].forEach(function (n) {
        var q = proj(n[0], n[1], n[2]);
        s += '<path d="M' + n1(q[0] - n[3]) + ' ' + n1(q[1]) + ' q' + n1(n[3] * 0.2) + ' ' + n1(-n[3] * 0.6) + ' ' + n1(n[3] * 0.6) + ' ' + n1(-n[3] * 0.4) + ' q' + n1(n[3] * 0.5) + ' ' + n1(-n[3] * 0.6) + ' ' + n1(n[3]) + ' ' + n1(-n[3] * 0.1) +
          ' q' + n1(n[3] * 0.6) + ' ' + n1(-n[3] * 0.1) + ' ' + n1(n[3] * 0.4) + ' ' + n1(n[3] * 0.5) + 'z" fill="#fff" opacity="' + (nuit ? 0.12 : 0.85) + '"/>';
      });
      if (nuit) [[0.3, 2.2, 2.6], [0.5, 4.8, 2.3], [1.2, 0.3, 2.75], [3.2, 0.2, 2.6], [5.4, 0.2, 2.4], [2.4, 0.1, 2.3]].forEach(function (e2) { var q = proj(e2[0], e2[1], e2[2]); s += '<circle cx="' + n1(q[0]) + '" cy="' + n1(q[1]) + '" r="1.3" fill="#fff"/>'; });
      var fond = [[-0.6, 2.2, 0.55, 22], [-0.6, 4.6, 0.4, 18], [-0.7, 0.4, 0.62, 23], [0.4, -0.7, 0.68, 24], [2.5, -0.6, 0.6, 22], [4.8, -0.6, 0.45, 19]];
      fond.forEach(function (f) { var q = proj(f[0], f[1], H + f[2]); s += '<circle cx="' + n1(q[0]) + '" cy="' + n1(q[1]) + '" r="' + n1(f[3] + 1.6) + '" fill="' + O + '"/>'; });
      fond.forEach(function (f, n) { var q = proj(f[0], f[1], H + f[2]); s += '<circle cx="' + n1(q[0]) + '" cy="' + n1(q[1]) + '" r="' + f[3] + '" fill="' + (n % 2 ? '#35552f' : '#3e6236') + '"/>' +
        '<circle cx="' + n1(q[0] - f[3] * 0.3) + '" cy="' + n1(q[1] - f[3] * 0.35) + '" r="' + n1(f[3] * 0.35) + '" fill="#4f7a42"/>'; });
    }
    // plancher vu de face (de la terre, dehors)
    var A = proj(0, p), B = proj(l, p), C = proj(l, 0);
    s += poly([A, B, [B[0], B[1] + BORD], [A[0], A[1] + BORD]], dehors ? '#6b4a32' : '#5c4532') + poly([B, C, [C[0], C[1] + BORD], [B[0], B[1] + BORD]], dehors ? '#4f3424' : '#3f3026');
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
    if (dehors) {
      // le haut de la haie : des touffes arrondies
      var bosses = [];
      for (var jj = p; jj >= 0; jj -= 0.5) bosses.push(proj(0, jj, H));
      for (var ii = 0.5; ii <= l; ii += 0.5) bosses.push(proj(ii, 0, H));
      s += poly([proj(l, -e, H), proj(l, 0, H), proj(l, 0, 0), proj(l, -e, 0)], nuance(td, -0.35), 1) + poly([proj(0, p, H), proj(-e, p, H), proj(-e, p, 0), proj(0, p, 0)], nuance(tg, -0.25), 1);
      bosses.forEach(function (b) { s += '<circle cx="' + n1(b[0]) + '" cy="' + n1(b[1]) + '" r="10.6" fill="' + O + '"/>'; });
      bosses.forEach(function (b, n) { s += '<circle cx="' + n1(b[0]) + '" cy="' + n1(b[1]) + '" r="9" fill="' + (n % 2 ? tg : nuance(tg, 0.06)) + '"/><circle cx="' + n1(b[0] - 2.5) + '" cy="' + n1(b[1] - 3.5) + '" r="3.2" fill="' + nuance(tg, 0.22) + '"/>'; });
    } else {
      // dessus des murs (épaisseur) et leurs bouts
      s += poly([proj(-e, -e, H), proj(l, -e, H), proj(l, 0, H), proj(0, 0, H), proj(0, p, H), proj(-e, p, H)], '#5c4532', 1);
      s += poly([proj(l, -e, H), proj(l, 0, H), proj(l, 0, 0), proj(l, -e, 0)], '#3f3026', 1);
      s += poly([proj(0, p, H), proj(-e, p, H), proj(-e, p, 0), proj(0, p, 0)], '#4b3a2c', 1);
    }
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
      // pas : il glisse depuis la case d'avant (décalage dx, dy en pixels de la scène, joué par une animation CSS)
      var pas = cp.pas ? ' cp-pas" style="--dx:' + n1(cp.pas.dx) + 'px;--dy:' + n1(cp.pas.dy) + 'px;--d:' + (cp.pas.ms || 300) + 'ms' : '';
      var sens = cp.dir < 0 ? ' gauche' : '';
      s += '<g class="compagnon' + pas + '"><g class="' + (cp.classe || '') + '"><ellipse cx="' + n1(b[0]) + '" cy="' + n1(b[1]) + '" rx="' + n1(w * 0.3) + '" ry="' + n1(w * 0.13) + '" fill="#000" opacity="0.22"/>' +
        '<svg class="cp-svg" x="' + n1(b[0] - w / 2) + '" y="' + n1(b[1] - h * 0.95) + '" width="' + n1(w) + '" height="' + n1(h) + '" viewBox="0 -6 200 216" overflow="visible"><g class="sens' + sens + '">' + cp.svg + '</g></svg></g></g>';
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
  function vignette(mid, t, taille, a) {
    var m = MEUBLES[mid]; if (!m) return '';
    var ob = { m: mid, a: a, i: 0, j: 0, o: 0, z: 0, t: t }, x0, x1, y0, y1, H = Math.max(m.h, 0.6), pad = 6;
    if (m.plan === 'mur') { x0 = 0; x1 = proj(m.w, 0)[0]; y0 = proj(0, 0, m.h)[1]; y1 = proj(m.w, 0.4, 0)[1]; }
    else {
      x0 = proj(0, m.d)[0]; x1 = proj(m.w, 0)[0]; y1 = proj(m.w, m.d)[1];
      y0 = m.plan === 'plafond' ? proj(0, 0, H)[1] : proj(0, 0, m.h)[1];
      if (m.plan === 'plafond') { y1 = proj(1, 1, H - 1.05)[1]; ob.z = 0; }
    }
    var w = x1 - x0 + pad * 2, h = y1 - y0 + pad * 2, tl = taille || 64;
    var corps = m.plan === 'plafond' ? MEUBLES[mid].dessin(contexte(0, 0, 0, 0, H), teinte(t || m.t), ob).replace(/<ellipse[^>]*opacity="0.12"\/>/, '') : dessinObjet(ob, H);
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
    PIECES: PIECES, pieceDepart: pieceDepart, vaDans: vaDans, HABILLAGES: HABILLAGES, habGratuit: habGratuit, semaine: semaine, vitrine: vitrine,
    PLINTHES: PLINTHES, AMBIANCES: AMBIANCES, VUES: VUES, vueOuverte: vueOuverte, vueFenetre: vueFenetre, habillage: habillage, saisonDe: saisonDe, tuileFinition: tuileFinition, tuileVue: tuileVue,
    proj: proj, versSol: versSol, versMur: versMur, nuance: nuance, teinte: teinte,
    emprise: emprise, placeLibre: placeLibre, caseOccupee: caseOccupee,
    bornes: bornes, camera: camera, scene: scene, vignette: vignette, tuile: tuile,
    objetDeco: objetDeco, nomObjet: nomObjet, nomDeco: nomDeco, PICTO_DECO: PICTO_DECO
  };
  if (typeof CP !== 'undefined') CP.MEUBLES = kit;
  return kit;
})();
if (typeof module !== 'undefined') module.exports = CPM;
