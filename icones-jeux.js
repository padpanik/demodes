// ================== ICÔNES DES JEUX (nouvelle direction artistique) ==================
// Même canevas pour tous : tuile carrée aux coins très arrondis, dégradé vertical dans la couleur propre au jeu,
// léger reflet en haut, dessin blanc (avec, au besoin, une touche de couleur) et une petite ombre douce.
// Chaque jeu garde sa « marque » : grille colorée de Brilliant, dés du Yams, flèches du Backgammon, etc.
// Dessins maison en SVG (aucune image officielle).
//
//   IconesJeux.svg('yams', 52)  → chaîne SVG
//   IconesJeux.nouvelles()      → true si on affiche ces icônes (choix gardé dans desdale-icones ; « anciennes » sinon)
//   IconesJeux.choisir(true/false)
// Les anciennes icônes restent dans index.html et dans le logo de chaque jeu, pour comparer avant de choisir.

var IconesJeux = (function () {
  var COULEURS = {
    brilliant: ['#9775fa', '#6741d9'], yams: ['#ff6b6b', '#e03131'], backgammon: ['#e8a061', '#a8591f'],
    assaut: ['#94b04a', '#55701c'], bataille: ['#4dabf7', '#1864ab'], gribouille: ['#f783ac', '#d6336c'],
    petitbac: ['#3bc9db', '#0c8599'], agents: ['#68727c', '#25292e'], quatre: ['#748ffc', '#3b5bdb'],
    domino: ['#51cf66', '#2b8a3e'], lettres: ['#ffa94d', '#e8590c']
  };
  var B = '#fff';
  function pips(cx, cy, s, n, c) {   // points d'un dé de côté s centré en cx, cy
    var o = s * 0.28, P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
                            5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    return P[n].map(p => '<circle cx="' + (cx + p[0] * o) + '" cy="' + (cy + p[1] * o) + '" r="' + (s * 0.095) + '" fill="' + c + '"/>').join('');
  }
  var DESSINS = {
    // Brilliant : la grille de cases de couleur
    brilliant: function () {
      var t = ['#fff', '#ffe066', '#fff', '#99e9f2', '#fff', '#fcc2d7', '#fff', '#b2f2bb', '#fff'], s = '';
      t.forEach((c, k) => { s += '<rect x="' + (13 + (k % 3) * 10.6) + '" y="' + (13 + Math.floor(k / 3) * 10.6) + '" width="8.8" height="8.8" rx="2.6" fill="' + c + '"/>'; });
      return s;
    },
    // Yams : deux dés
    yams: function (c) {
      return '<g transform="rotate(14 35 31)"><rect x="25" y="21" width="20" height="20" rx="5" fill="' + B + '" opacity="0.85"/>' + pips(35, 31, 20, 3, c[1]) + '</g>' +
             '<g transform="rotate(-10 22 31)"><rect x="10" y="19" width="24" height="24" rx="6" fill="' + B + '"/>' + pips(22, 31, 24, 5, c[1]) + '</g>';
    },
    // Backgammon : les flèches du plateau et deux pions
    backgammon: function () {
      var s = '';
      for (var k = 0; k < 4; k++) {
        s += '<path d="M' + (11 + k * 8.5) + ' 11 h8 l-4 15 z" fill="' + B + '" opacity="' + (k % 2 ? 0.5 : 1) + '"/>';
        s += '<path d="M' + (11 + k * 8.5) + ' 45 h8 l-4 -15 z" fill="' + B + '" opacity="' + (k % 2 ? 1 : 0.5) + '"/>';
      }
      return s + '<circle cx="23.5" cy="37.5" r="5.6" fill="#5a2d0c" stroke="' + B + '" stroke-width="1.6"/>' +
                 '<circle cx="32.5" cy="18.5" r="5.6" fill="' + B + '"/><circle cx="32.5" cy="18.5" r="2.8" fill="none" stroke="#a8591f" stroke-width="1.2" opacity="0.6"/>';
    },
    // Assaut : le drapeau planté
    assaut: function () {
      return '<path d="M19 43 V12" stroke="' + B + '" stroke-width="3" stroke-linecap="round"/>' +
             '<path d="M20.5 13 C27 10 31 16 38 13 V27 C31 30 27 24 20.5 27 Z" fill="' + B + '"/>' +
             '<path d="M13 44 H33" stroke="' + B + '" stroke-width="3" stroke-linecap="round" opacity="0.7"/>' +
             '<path d="M27.5 17.5 l1.3 2.6 2.9.4 -2.1 2 .5 2.9 -2.6-1.4 -2.6 1.4 .5-2.9 -2.1-2 2.9-.4z" fill="#55701c" opacity="0.75"/>';
    },
    // Bataille navale : un navire sur les vagues
    bataille: function () {
      return '<path d="M12 31 H44 L40 39 H16 Z" fill="' + B + '"/><path d="M22 31 V24 H33 V31" fill="' + B + '" opacity="0.85"/><path d="M27 24 V17" stroke="' + B + '" stroke-width="2.4" stroke-linecap="round"/>' +
             '<path d="M10 44 q4.5 -3 9 0 t9 0 t9 0 t9 0" fill="none" stroke="' + B + '" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>';
    },
    // Gribouille : un crayon et son gribouillis
    gribouille: function () {
      return '<path d="M10 30 C14 18 19 36 24 25 S33 16 36 24" fill="none" stroke="' + B + '" stroke-width="3" stroke-linecap="round" opacity="0.8"/>' +
             '<g transform="rotate(45 37 33)"><rect x="33" y="17" width="8" height="22" rx="2" fill="' + B + '"/><path d="M33 39 h8 l-4 7 z" fill="' + B + '" opacity="0.8"/><rect x="33" y="17" width="8" height="4.5" rx="1.5" fill="#ffd43b"/></g>';
    },
    // Petit bac : la fiche, sa lettre et ses catégories
    petitbac: function (c) {
      return '<rect x="11" y="12" width="34" height="32" rx="6" fill="' + B + '"/><text x="21" y="34.5" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="20" fill="' + c[1] + '">B</text>' +
             '<path d="M31 21 H40 M31 28 H40 M31 35 H37" stroke="' + c[1] + '" stroke-width="2.6" stroke-linecap="round" opacity="0.6"/>';
    },
    // Agents secrets : chapeau et loup d'espion
    agents: function () {
      return '<path d="M16 22 C17 13 39 13 40 22" fill="' + B + '"/><path d="M10 23 H46" stroke="' + B + '" stroke-width="3" stroke-linecap="round"/>' +
             '<path d="M13 31 C13 27 24 27 28 30 C32 27 43 27 43 31 C43 37 34 40 28 35 C22 40 13 37 13 31 Z" fill="' + B + '"/>' +
             '<ellipse cx="21" cy="32" rx="3.6" ry="2.4" fill="#25292e"/><ellipse cx="35" cy="32" rx="3.6" ry="2.4" fill="#25292e"/>';
    },
    // Quatre en ligne : la grille et quatre jetons alignés
    quatre: function (c) {
      var s = '<rect x="10" y="11" width="36" height="34" rx="6" fill="' + B + '"/>';
      for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) {
        var aligne = x === 3 - y, rouge = (y === 3 && x < 3) || (y === 2 && x === 0) || (y === 2 && x === 2);
        s += '<circle cx="' + (16.5 + x * 7.7) + '" cy="' + (17.5 + y * 7.2) + '" r="2.9" fill="' + (aligne ? '#fcc419' : rouge ? '#f03e3e' : c[1]) + '" opacity="' + (aligne || rouge ? 1 : 0.22) + '"/>';
      }
      return s;
    },
    // Dominos : un domino penché
    domino: function (c) {
      return '<g transform="rotate(-24 28 28)"><rect x="19" y="8" width="18" height="40" rx="4.5" fill="' + B + '"/><path d="M21.5 28 H34.5" stroke="' + c[1] + '" stroke-width="1.8" opacity="0.5"/>' +
             pips(28, 18, 16, 3, c[1]) + pips(28, 38, 16, 4, c[1]) + '</g>';
    },
    // Lettres croisées : trois lettres posées
    lettres: function (c) {
      return [['M', 9, 22], ['O', 21.5, 16], ['T', 34, 22]].map(l =>
        '<rect x="' + l[1] + '" y="' + l[2] + '" width="13" height="14" rx="3" fill="' + B + '"/><text x="' + (l[1] + 6.5) + '" y="' + (l[2] + 11) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="10" fill="' + c[1] + '">' + l[0] + '</text>').join('') +
        '<path d="M10 42 H46" stroke="' + B + '" stroke-width="3" stroke-linecap="round" opacity="0.6"/>';
    }
  };

  function svg(jeu, taille) {
    var c = COULEURS[jeu], d = DESSINS[jeu];
    if (!c || !d) return '';
    taille = taille || 52;
    var g = 'ij-g-' + jeu, o = 'ij-o-' + jeu;
    return '<svg class="icone-jeu" viewBox="0 0 56 56" width="' + taille + '" height="' + taille + '" aria-hidden="true">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient>' +
      '<filter id="' + o + '" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.2" stdDeviation="0.9" flood-color="#000" flood-opacity="0.22"/></filter></defs>' +
      '<rect x="2" y="2" width="52" height="52" rx="15" fill="url(#' + g + ')"/>' +
      '<path d="M2 17 A15 15 0 0 1 17 2 H39 A15 15 0 0 1 54 17 V20 C40 26 16 26 2 20 Z" fill="#fff" opacity="0.13"/>' +
      '<g filter="url(#' + o + ')">' + d(c) + '</g></svg>';
  }
  function lire() { try { return JSON.parse(localStorage.getItem('desdale-icones') || 'null'); } catch (e) { return null; } }
  return {
    svg: svg,
    couleur: function (jeu) { return (COULEURS[jeu] || ['#adb5bd'])[1]; },
    nouvelles: function () { return lire() !== 'anciennes'; },
    choisir: function (nouvelles) {
      try { localStorage.setItem('desdale-icones', JSON.stringify(nouvelles ? 'nouvelles' : 'anciennes')); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('desdale-icones')); } catch (e) {}
    }
  };
})();
