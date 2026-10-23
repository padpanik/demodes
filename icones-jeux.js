// ================== ICÔNES DES JEUX ==================
// Même canevas pour tous, épuré : tuile carrée aux coins très arrondis, à plat, d'une teinte pâle de la couleur du jeu,
// et le dessin du jeu dans sa couleur (avec, au besoin, une touche blanche ou colorée). Ni dégradé, ni reflet, ni ombre.
// Chaque jeu garde sa « marque » : grille colorée de Brilliant, dés du Yams, flèches du Backgammon, etc.
// Dessins maison en SVG (aucune image officielle). Version choisie par l'utilisateur : « claire ».
//
//   IconesJeux.svg('yams', 64)            → chaîne SVG (fond clair)
//   IconesJeux.svg('yams', 64, 'plein')   → variante essayée puis écartée : fond de la couleur du jeu, dessin blanc

var IconesJeux = (function () {
  var COULEURS = {
    brilliant: ['#9775fa', '#6741d9'], yams: ['#ff6b6b', '#e03131'], backgammon: ['#e8a061', '#a8591f'],
    assaut: ['#94b04a', '#55701c'], bataille: ['#4dabf7', '#1864ab'], gribouille: ['#f783ac', '#d6336c'],
    petitbac: ['#3bc9db', '#0c8599'], agents: ['#68727c', '#25292e'], quatre: ['#748ffc', '#3b5bdb'],
    domino: ['#51cf66', '#2b8a3e'], lettres: ['#ffa94d', '#e8590c'], expedition: ['#da77f2', '#9c36b5'], donjon: ['#ffa94d', '#a8590f']
  };
  var B = '#fff';   // couleur du dessin (blanc sur fond plein, couleur du jeu sur fond clair) ; c[1] = touche d'accent
  function pips(cx, cy, s, n, c) {   // points d'un dé de côté s centré en cx, cy
    var o = s * 0.28, P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
                            5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    return P[n].map(p => '<circle cx="' + (cx + p[0] * o) + '" cy="' + (cy + p[1] * o) + '" r="' + (s * 0.095) + '" fill="' + c + '"/>').join('');
  }
  var DESSINS = {
    // Brilliant : la grille de cases de couleur
    brilliant: function () {
      var t = [B, '#ffd43b', B, '#66d9e8', B, '#f783ac', B, '#69db7c', B], s = '';
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
    assaut: function (c) {
      return '<path d="M19 43 V12" stroke="' + B + '" stroke-width="3" stroke-linecap="round"/>' +
             '<path d="M20.5 13 C27 10 31 16 38 13 V27 C31 30 27 24 20.5 27 Z" fill="' + B + '"/>' +
             '<path d="M13 44 H33" stroke="' + B + '" stroke-width="3" stroke-linecap="round" opacity="0.7"/>' +
             '<path d="M27.5 17.5 l1.3 2.6 2.9.4 -2.1 2 .5 2.9 -2.6-1.4 -2.6 1.4 .5-2.9 -2.1-2 2.9-.4z" fill="' + c[1] + '" opacity="0.8"/>';
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
    agents: function (c) {
      return '<path d="M16 22 C17 13 39 13 40 22" fill="' + B + '"/><path d="M10 23 H46" stroke="' + B + '" stroke-width="3" stroke-linecap="round"/>' +
             '<path d="M13 31 C13 27 24 27 28 30 C32 27 43 27 43 31 C43 37 34 40 28 35 C22 40 13 37 13 31 Z" fill="' + B + '"/>' +
             '<ellipse cx="21" cy="32" rx="3.6" ry="2.4" fill="' + c[1] + '"/><ellipse cx="35" cy="32" rx="3.6" ry="2.4" fill="' + c[1] + '"/>';
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
    // Expédition : la carte au trésor, son chemin en pointillés et la croix
    expedition: function (c) {
      return '<path d="M10 16 L21 12 L33 16 L45 12 V40 L33 44 L21 40 L10 44 Z" fill="' + B + '"/>' +
             '<path d="M21 12 V40 M33 16 V44" stroke="' + c[1] + '" stroke-width="1.2" opacity="0.35"/>' +
             '<path d="M14 37 Q19 27 26 31 T37 21" fill="none" stroke="' + c[1] + '" stroke-width="2.2" stroke-dasharray="2.5 2.5" stroke-linecap="round"/>' +
             '<path d="M36 17 l5 5 M41 17 l-5 5" stroke="#f03e3e" stroke-width="2.6" stroke-linecap="round"/>';
    },
    // Donjon des compagnons : une porte voûtée et sa clé
    donjon: function (c) {
      return '<path d="M13 44 V24 Q13 11 28 11 Q43 11 43 24 V44 Z" fill="' + B + '"/>' +
             '<path d="M19 44 V26 Q19 17 28 17 Q37 17 37 26 V44 Z" fill="' + c[1] + '" opacity="0.35"/>' +
             '<circle cx="23" cy="33" r="4.2" fill="none" stroke="#fab005" stroke-width="2.6"/><path d="M27 33 H38 M34 33 V37 M37 33 V36" stroke="#fab005" stroke-width="2.6" stroke-linecap="round"/>';
    },
    // Lettres croisées : trois lettres posées
    lettres: function (c) {
      return [['M', 9, 22], ['O', 21.5, 16], ['T', 34, 22]].map(l =>
        '<rect x="' + l[1] + '" y="' + l[2] + '" width="13" height="14" rx="3" fill="' + B + '"/><text x="' + (l[1] + 6.5) + '" y="' + (l[2] + 11) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="10" fill="' + c[1] + '">' + l[0] + '</text>').join('') +
        '<path d="M10 42 H46" stroke="' + B + '" stroke-width="3" stroke-linecap="round" opacity="0.6"/>';
    }
  };

  // Canevas épuré, à plat : une tuile arrondie d'une seule couleur, sans dégradé, reflet ni ombre.
  //   fond 'plein' : tuile de la couleur du jeu, dessin blanc
  //   fond 'clair' : tuile pâle teintée, dessin de la couleur du jeu
  function svg(jeu, taille, fond) {
    var c = COULEURS[jeu], d = DESSINS[jeu];
    if (!c || !d) return '';
    taille = taille || 64;
    var clair = fond !== 'plein', dessin;
    B = clair ? c[1] : '#fff';
    dessin = d(clair ? [c[0], '#fff'] : c);
    B = '#fff';
    return '<svg class="icone-jeu" viewBox="0 0 56 56" width="' + taille + '" height="' + taille + '" aria-hidden="true">' +
      '<rect x="2" y="2" width="52" height="52" rx="15" fill="' + (clair ? c[0] : c[1]) + '"' + (clair ? ' fill-opacity="0.16"' : '') + '/>' +
      dessin + '</svg>';
  }
  return {
    svg: svg,
    couleur: function (jeu) { return (COULEURS[jeu] || ['#adb5bd'])[1]; }
  };
})();
