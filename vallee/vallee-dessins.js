// ================== LA VALLÉE DE DÉSDALE : dessins (SVG fait par le code) ==================
// Un écran du monde (352 × 288, cases de 32 comme une pièce du Donjon), la carte du monde sous le brouillard,
// les habitants, et la petite scène de l'accueil. Utilise VL (vallee-regles.js).

var VLD = (function () {
  var T = 32;
  function f(n) { return Math.round(n * 10) / 10; }
  var MARCHE_EAU = { '~': 1, '=': 1 };

  // ---------- Les habitants (viewBox 40 × 46, pieds en bas) ----------
  function ombre(rx) { return '<ellipse cx="20" cy="44" rx="' + (rx || 11) + '" ry="2.6" fill="rgba(0,0,0,.22)"/>'; }
  function yeux(y, ecart, r) {
    var a = 20 - ecart, b = 20 + ecart;
    return '<circle cx="' + a + '" cy="' + y + '" r="' + r + '" fill="#2b2118"/><circle cx="' + b + '" cy="' + y + '" r="' + r + '" fill="#2b2118"/>' +
           '<circle cx="' + f(a + r * 0.35) + '" cy="' + f(y - r * 0.35) + '" r="' + f(r * 0.38) + '" fill="#fff"/><circle cx="' + f(b + r * 0.35) + '" cy="' + f(y - r * 0.35) + '" r="' + f(r * 0.38) + '" fill="#fff"/>';
  }
  var HABITANTS = {
    // M. Bubo, le maire : un hibou à écharpe tricolore et médaille
    hibou: function() {
      return ombre(10) +
        '<path d="M14 42l-2 2.5h5zM26 42l2 2.5h-5z" fill="#f08c00"/>' +
        '<ellipse cx="20" cy="30" rx="12.5" ry="13.5" fill="#9c6b3e" stroke="#5e3d1f" stroke-width="1.2"/>' +
        '<path d="M8 27c-2 6 0 12 5 14-1-5-1-10 1-14z" fill="#7d532d"/><path d="M32 27c2 6 0 12-5 14 1-5 1-10-1-14z" fill="#7d532d"/>' +
        '<ellipse cx="20" cy="33" rx="7.5" ry="8.5" fill="#ecd6aa"/>' +
        '<path d="M16.5 30l1.5 1.5 1.5-1.5M20.5 30l1.5 1.5 1.5-1.5M18.5 34l1.5 1.5 1.5-1.5M16.5 38l1.5 1.5 1.5-1.5M20.5 38l1.5 1.5 1.5-1.5" stroke="#c9a874" stroke-width="1" fill="none"/>' +
        '<path d="M9.5 24l21 13" stroke="#3b5bdb" stroke-width="4"/><path d="M9.5 24l21 13" stroke="#fff" stroke-width="1.4"/><path d="M10 26.5l20 12" stroke="#e03131" stroke-width="1.6"/>' +
        '<circle cx="25" cy="34" r="2.6" fill="#fcc419" stroke="#b07d00" stroke-width="1"/>' +
        '<circle cx="20" cy="15.5" r="11" fill="#9c6b3e" stroke="#5e3d1f" stroke-width="1.2"/>' +
        '<path d="M10.5 9L11.5 1.5L16 7.5Z M29.5 9L28.5 1.5L24 7.5Z" fill="#7d532d" stroke="#5e3d1f" stroke-width="1"/>' +
        '<circle cx="15" cy="15.5" r="5.8" fill="#f3e2c0"/><circle cx="25" cy="15.5" r="5.8" fill="#f3e2c0"/>' +
        '<circle cx="15" cy="15.5" r="3.7" fill="#ffd43b" stroke="#5e3d1f" stroke-width=".9"/><circle cx="25" cy="15.5" r="3.7" fill="#ffd43b" stroke="#5e3d1f" stroke-width=".9"/>' +
        '<circle cx="15.3" cy="15.8" r="1.9" fill="#222"/><circle cx="25.3" cy="15.8" r="1.9" fill="#222"/><circle cx="15.9" cy="15" r=".7" fill="#fff"/><circle cx="25.9" cy="15" r=".7" fill="#fff"/>' +
        '<circle cx="25" cy="15.5" r="4.6" fill="none" stroke="#c9a227" stroke-width="1.1"/><path d="M29.6 16q2 3 .5 7" stroke="#c9a227" stroke-width=".8" fill="none"/>' +
        '<path d="M18.3 19.5h3.4L20 23.5z" fill="#f08c00" stroke="#b35c00" stroke-width=".7"/>';
    },
    // Mme Sauge, l'herboriste : un hérisson en tablier, une feuille sur la tête
    herisson: function() {
      var pics = [], k, n = 15;
      for (k = 0; k <= n; k++) {
        var a = Math.PI * (1.08 + k * 0.84 / n) , r1 = 14, r2 = 19.5;
        var a1 = a - 0.11, a2 = a + 0.11;
        pics.push('M' + f(20 + Math.cos(a1) * r1) + ' ' + f(26 + Math.sin(a1) * r1) + 'L' + f(20 + Math.cos(a) * r2) + ' ' + f(26 + Math.sin(a) * r2) + 'L' + f(20 + Math.cos(a2) * r1) + ' ' + f(26 + Math.sin(a2) * r1) + 'Z');
      }
      var cotes = 'M4.5 28l-3.5 3 4 1zM35.5 28l3.5 3-4 1zM5.5 34l-3 3.5 4 .3zM34.5 34l3 3.5-4 .3z';
      return ombre(12) +
        '<path d="' + pics.join('') + cotes + '" fill="#6b4424"/>' +
        '<ellipse cx="20" cy="28" rx="15" ry="15.5" fill="#8a5a32"/>' +
        '<ellipse cx="20" cy="31" rx="10.5" ry="12" fill="#f1dcb6"/>' +
        '<path d="M12 31h16v9.5q-8 4-16 0z" fill="#69b34c" stroke="#3f7f2c" stroke-width="1"/><path d="M14 31v-3.5h12V31" fill="none" stroke="#3f7f2c" stroke-width="1"/>' +
        '<rect x="17" y="34" width="6" height="4" rx="1" fill="#8fd16a" stroke="#3f7f2c" stroke-width=".7"/>' +
        '<circle cx="14" cy="19" r="2.6" fill="#a87447"/><circle cx="26" cy="19" r="2.6" fill="#a87447"/>' +
        yeux(23, 4.2, 1.6) +
        '<ellipse cx="20" cy="27" rx="2" ry="1.5" fill="#e8879b"/><path d="M18 29q2 1.5 4 0" stroke="#7a4a2a" stroke-width=".9" fill="none"/>' +
        '<circle cx="13.5" cy="26.5" r="1.7" fill="#f4a3b1" opacity=".7"/><circle cx="26.5" cy="26.5" r="1.7" fill="#f4a3b1" opacity=".7"/>' +
        '<path d="M20 11q5-5 9-2-4 4-9 2z" fill="#69b34c" stroke="#3f7f2c" stroke-width=".8"/><path d="M20 11q4-2 7-2" stroke="#3f7f2c" stroke-width=".6" fill="none"/>' +
        '<path d="M8 41q-1 3 3 3h6q2-2 0-3z" fill="#4a3018"/><path d="M32 41q1 3-3 3h-6q-2-2 0-3z" fill="#4a3018"/>';
    },
    // Bruno, le forgeron : un ours en tablier de cuir, le marteau à la patte
    ours: function() {
      return ombre(13) +
        '<path d="M31 25l6-9" stroke="#8d5a2b" stroke-width="2.4" stroke-linecap="round"/><rect x="33" y="11" width="8" height="5" rx="1" transform="rotate(34 37 13.5)" fill="#868e96" stroke="#495057" stroke-width="1"/>' +
        '<ellipse cx="20" cy="31" rx="14" ry="13" fill="#8b5a35" stroke="#5c3a1f" stroke-width="1.2"/>' +
        '<path d="M11 26h18v15q-9 4-18 0z" fill="#5c4033" stroke="#3b281f" stroke-width="1"/><path d="M13 26l-1-6M27 26l1-6" stroke="#3b281f" stroke-width="1.4"/>' +
        '<rect x="16" y="31" width="8" height="5" rx="1.2" fill="#6f5243" stroke="#3b281f" stroke-width=".8"/>' +
        '<ellipse cx="7.5" cy="31" rx="4" ry="6" fill="#8b5a35" stroke="#5c3a1f" stroke-width="1"/><ellipse cx="32.5" cy="27" rx="4" ry="5.5" fill="#8b5a35" stroke="#5c3a1f" stroke-width="1"/>' +
        '<circle cx="10" cy="7.5" r="4.5" fill="#8b5a35" stroke="#5c3a1f" stroke-width="1.1"/><circle cx="30" cy="7.5" r="4.5" fill="#8b5a35" stroke="#5c3a1f" stroke-width="1.1"/>' +
        '<circle cx="10" cy="7.5" r="2.3" fill="#c49a6c"/><circle cx="30" cy="7.5" r="2.3" fill="#c49a6c"/>' +
        '<circle cx="20" cy="15" r="11.5" fill="#8b5a35" stroke="#5c3a1f" stroke-width="1.2"/>' +
        '<ellipse cx="20" cy="19" rx="6" ry="4.6" fill="#d9b48a"/><ellipse cx="20" cy="16.8" rx="2.4" ry="1.7" fill="#2b2118"/>' +
        '<path d="M17.5 20.5q2.5 2 5 0" stroke="#2b2118" stroke-width="1" fill="none"/>' + yeux(12.5, 5, 1.6) +
        '<path d="M13 9.5q2-1.5 4 0M23 9.5q2-1.5 4 0" stroke="#4a2e17" stroke-width="1.1" fill="none"/>';
    },
    // Papi Tortue, l'ermite : carapace moussue, barbe blanche, lunettes et canne
    tortue: function() {
      return ombre(13) +
        '<path d="M34 44V20q0-3 3-3" stroke="#8d5a2b" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="20" cy="31" rx="15" ry="12.5" fill="#5f8f3e" stroke="#3d6227" stroke-width="1.3"/>' +
        '<path d="M20 20l5 3.5v6l-5 3.5-5-3.5v-6z M10 25l4-1 1 6-3 4-4-3z M30 25l-4-1-1 6 3 4 4-3z M14 37l6-1 6 1-2 4h-8z" fill="#4a7531" stroke="#3d6227" stroke-width=".8"/>' +
        '<path d="M8 22q2-3 6-2M26 20q4-2 6 2" stroke="#8fd16a" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '<ellipse cx="11" cy="42" rx="4" ry="2.5" fill="#b9c98a" stroke="#7a8a50" stroke-width=".9"/><ellipse cx="29" cy="42" rx="4" ry="2.5" fill="#b9c98a" stroke="#7a8a50" stroke-width=".9"/>' +
        '<ellipse cx="31.5" cy="28" rx="3.2" ry="2.6" fill="#b9c98a" stroke="#7a8a50" stroke-width=".9"/>' +
        '<ellipse cx="20" cy="13" rx="9" ry="8.5" fill="#b9c98a" stroke="#7a8a50" stroke-width="1.1"/>' +
        '<path d="M13.5 16q6.5 3 13 0-1 10-6.5 12-5.5-2-6.5-12z" fill="#fff" stroke="#ced4da" stroke-width=".8"/><path d="M18 20v5M20 20v6M22 20v5" stroke="#dee2e6" stroke-width=".8"/>' +
        yeux(12, 3.6, 1.3) +
        '<circle cx="16.4" cy="12" r="2.8" fill="none" stroke="#343a40" stroke-width=".9"/><circle cx="23.6" cy="12" r="2.8" fill="none" stroke="#343a40" stroke-width=".9"/><path d="M19.2 12h1.6" stroke="#343a40" stroke-width=".9"/>' +
        '<path d="M15 8q5-3 10 0" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    },
    // Pipa, la marchande : une chatte rousse au foulard bleu (on la voit derrière son étal)
    chat: function() {
      return ombre(10) +
        '<ellipse cx="20" cy="33" rx="11" ry="11" fill="#f0a04b" stroke="#b5651d" stroke-width="1.1"/>' +
        '<path d="M14 26l3 2M13 31l3 1M27 26l-3 2M27 31l-3 1" stroke="#c9741f" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M9 10L11 1L17 7Z M31 10L29 1L23 7Z" fill="#f0a04b" stroke="#b5651d" stroke-width="1.1"/><path d="M11 8L12 3.5L15 7Z M29 8L28 3.5L25 7Z" fill="#f7c6c7"/>' +
        '<circle cx="20" cy="15" r="10.5" fill="#f0a04b" stroke="#b5651d" stroke-width="1.1"/>' +
        '<path d="M9.8 13q10-9 20.4 0-2-7-10.2-7.5Q11.8 6 9.8 13z" fill="#4c6ef5" stroke="#364fc7" stroke-width=".9"/>' +
        '<circle cx="15" cy="9.5" r=".9" fill="#fff"/><circle cx="20" cy="8" r=".9" fill="#fff"/><circle cx="25" cy="9.5" r=".9" fill="#fff"/><path d="M29 12l4 3-1 2z" fill="#4c6ef5"/>' +
        '<path d="M17 21q3 3.5 6 0" fill="#fff4e6"/>' + yeux(15.5, 4.2, 1.6) +
        '<path d="M19 18.5h2l-1 1.2z" fill="#e8879b"/><path d="M20 19.7v1.3M20 21q-1.5 1-3 0M20 21q1.5 1 3 0" stroke="#7a3f12" stroke-width=".8" fill="none"/>' +
        '<path d="M8 18h-5M8 20l-5 1M32 18h5M32 20l5 1" stroke="#7a3f12" stroke-width=".6"/>';
    }
  };
  function habitant(espece, taille) {
    var t = taille || 44;
    return '<svg viewBox="0 0 40 46" width="' + t + '" height="' + f(t * 46 / 40) + '">' + (HABITANTS[espece] ? HABITANTS[espece]() : '') + '</svg>';
  }

  // ---------- Petits morceaux de décor (3.49 : contours sombres, ombrages et lueurs, comme au Donjon) ----------
  var OL = '#1d2b16', OLB = '#2b1a0e';   // contours : végétation, bois et pierre
  // Une forme « en boules » avec un contour commun : on trace d'abord les cercles épaissis dans la couleur du contour
  function boules(l, couleur, contour, ep) {
    return l.map(c => '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(c[2] + (ep || 1.6)) + '" fill="' + contour + '"/>').join('') +
           l.map(c => '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(c[2]) + '" fill="' + couleur + '"/>').join('');
  }
  var FEUILLES = [['#2f6a2e', '#3f8a3a', '#58a64a', '#7cc25c'], ['#2c6230', '#3b8040', '#529c4c', '#74ba62'], ['#36702c', '#4a9238', '#66ad4a', '#8ccc66']];
  function arbre(X, Y, h) {
    var p = FEUILLES[Math.floor(h * 3)], dx = f((h - 0.5) * 4), c = [[X + 9 + dx, Y + 12, 9.5], [X + 23 + dx, Y + 12, 9.5], [X + 16 + dx, Y + 2, 11], [X + 16 + dx, Y + 15, 9]];
    return '<ellipse cx="' + (X + 18) + '" cy="' + (Y + 29) + '" rx="14" ry="4" fill="rgba(10,20,5,.32)"/>' +
      '<path d="M' + (X + 11.5) + ' ' + (Y + 31) + 'q2.5-2 2.5-8v-6h5v6q0 6 2.5 8z" fill="#6b4626" stroke="' + OLB + '" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="M' + (X + 17.5) + ' ' + (Y + 20) + 'v9" stroke="#4a2e17" stroke-width="1.2"/>' +
      boules(c, p[1], OL, 1.7) +
      '<circle cx="' + f(X + 20 + +dx) + '" cy="' + (Y + 16) + '" r="7.5" fill="' + p[0] + '" opacity=".8"/><circle cx="' + f(X + 26 + +dx) + '" cy="' + (Y + 13) + '" r="5" fill="' + p[0] + '" opacity=".8"/>' +
      '<circle cx="' + f(X + 13 + +dx) + '" cy="' + (Y + 0) + '" r="6" fill="' + p[2] + '"/><circle cx="' + f(X + 7 + +dx) + '" cy="' + (Y + 9) + '" r="4.5" fill="' + p[2] + '"/>' +
      '<circle cx="' + f(X + 11 + +dx) + '" cy="' + (Y - 2) + '" r="2.6" fill="' + p[3] + '"/><circle cx="' + f(X + 5.5 + +dx) + '" cy="' + (Y + 7.5) + '" r="1.8" fill="' + p[3] + '"/>' +
      (h > 0.8 ? '<circle cx="' + f(X + 21 + +dx) + '" cy="' + (Y + 8) + '" r="1.9" fill="#e03131" stroke="#7a1010" stroke-width=".6"/><circle cx="' + f(X + 12 + +dx) + '" cy="' + (Y + 14) + '" r="1.9" fill="#e03131" stroke="#7a1010" stroke-width=".6"/><circle cx="' + f(X + 24 + +dx) + '" cy="' + (Y + 17) + '" r="1.9" fill="#e03131" stroke="#7a1010" stroke-width=".6"/>' : '');
  }
  function sapin(X, Y, h) {
    var c = h > 0.5 ? ['#1f4a29', '#2b6638', '#3d8a4c'] : ['#1d4526', '#285f34', '#378046'];
    var etages = [[Y - 13, Y + 3, 9], [Y - 5, Y + 14, 12], [Y + 4, Y + 25, 14.5]];
    return '<ellipse cx="' + (X + 18) + '" cy="' + (Y + 29) + '" rx="12" ry="3.5" fill="rgba(10,20,5,.32)"/>' +
      '<rect x="' + (X + 13.5) + '" y="' + (Y + 22) + '" width="5" height="8.5" fill="#5c3a1f" stroke="' + OLB + '" stroke-width="1.2"/>' +
      etages.map(e => '<path d="M' + (X + 16) + ' ' + e[0] + 'L' + f(X + 16 + e[2]) + ' ' + e[1] + 'Q' + (X + 16) + ' ' + (e[1] + 3) + ' ' + f(X + 16 - e[2]) + ' ' + e[1] + 'Z" fill="' + c[1] + '" stroke="' + OL + '" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M' + (X + 16) + ' ' + (e[0] + 1) + 'L' + f(X + 16 + e[2] - 1) + ' ' + (e[1] - 0.5) + 'Q' + (X + 19) + ' ' + (e[1] + 1.5) + ' ' + (X + 16) + ' ' + (e[1] + 1.5) + 'Z" fill="' + c[0] + '"/>' +
        '<path d="M' + (X + 15) + ' ' + (e[0] + 3) + 'L' + f(X + 16 - e[2] * 0.55) + ' ' + f(e[1] - 3) + '" stroke="' + c[2] + '" stroke-width="2.4" stroke-linecap="round"/>').join('');
  }
  function buisson(X, Y, h) {
    var c = [[X + 9, Y + 20, 8], [X + 23, Y + 20, 8], [X + 16, Y + 14, 9]];
    return '<ellipse cx="' + (X + 17) + '" cy="' + (Y + 28) + '" rx="14" ry="3.2" fill="rgba(10,20,5,.28)"/>' + boules(c, '#4c9a3c', OL, 1.5) +
      '<circle cx="' + (X + 20) + '" cy="' + (Y + 22) + '" r="6" fill="#3b7f2f" opacity=".8"/><circle cx="' + (X + 13) + '" cy="' + (Y + 11) + '" r="4" fill="#6cb854"/><circle cx="' + (X + 7) + '" cy="' + (Y + 17) + '" r="2.5" fill="#6cb854"/>' +
      (h > 0.45 ? [[9, 19], [21, 22], [18, 13], [25, 17]].map(b => '<circle cx="' + (X + b[0]) + '" cy="' + (Y + b[1]) + '" r="1.9" fill="#7048e8" stroke="#2b1a5c" stroke-width=".6"/>').join('') : '');
  }
  function haie(X, Y, h, gauche, droite) {
    var x1 = X + (gauche ? -1 : 2), x2 = X + (droite ? 33 : 30);
    return '<rect x="' + x1 + '" y="' + (Y + 12) + '" width="' + (x2 - x1) + '" height="18" rx="' + (gauche && droite ? 0 : 6) + '" fill="' + OL + '"/>' +
      '<rect x="' + (x1 + 1) + '" y="' + (Y + 13) + '" width="' + (x2 - x1 - 2) + '" height="16" rx="5" fill="#3f8a34"/>' +
      boules([[X + 8, Y + 12, 7.5], [X + 24, Y + 12, 7.5], [X + 16, Y + 9, 7]], '#4c9a3c', OL, 1.4) +
      '<circle cx="' + (X + 11) + '" cy="' + (Y + 7) + '" r="3" fill="#6cb854"/><circle cx="' + (X + 25) + '" cy="' + (Y + 9) + '" r="2.3" fill="#6cb854"/>' +
      '<rect x="' + (x1 + 1) + '" y="' + (Y + 24) + '" width="' + (x2 - x1 - 2) + '" height="5" fill="#2f6f28"/>' +
      (h > 0.55 ? '<circle cx="' + (X + 10) + '" cy="' + (Y + 16) + '" r="1.8" fill="#fff" stroke="#adb5bd" stroke-width=".5"/><circle cx="' + (X + 22) + '" cy="' + (Y + 19) + '" r="1.8" fill="#ffd43b" stroke="#b08900" stroke-width=".5"/>' : '');
  }
  function souche(X, Y) {
    return '<ellipse cx="' + (X + 17) + '" cy="' + (Y + 27) + '" rx="12" ry="3.2" fill="rgba(10,20,5,.3)"/>' +
      '<path d="M' + (X + 7) + ' ' + (Y + 15) + 'V' + (Y + 25) + 'q9 5 18 0V' + (Y + 15) + 'z" fill="#8d5a2b" stroke="' + OLB + '" stroke-width="1.4"/>' +
      '<path d="M' + (X + 4) + ' ' + (Y + 27) + 'l4-4M' + (X + 28) + ' ' + (Y + 27) + 'l-4-4" stroke="' + OLB + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M' + (X + 11) + ' ' + (Y + 18) + 'v7M' + (X + 20) + ' ' + (Y + 19) + 'v7" stroke="#6b4626" stroke-width="1.2"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 15) + '" rx="9" ry="4" fill="#d9a066" stroke="' + OLB + '" stroke-width="1.3"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 15) + '" rx="5" ry="2" fill="none" stroke="#a87447" stroke-width=".9"/><ellipse cx="' + (X + 16) + '" cy="' + (Y + 15) + '" rx="2" ry=".8" fill="none" stroke="#a87447" stroke-width=".8"/>' +
      '<path d="M' + (X + 22) + ' ' + (Y + 13) + 'q4-6 8-4" stroke="#69b34c" stroke-width="1.6" fill="none"/>';
  }
  function champignon(X, Y) {
    return '<g class="vl-brille"><circle cx="' + (X + 16) + '" cy="' + (Y + 18) + '" r="13" fill="url(#vl-magie)"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 26) + '" rx="7" ry="2" fill="rgba(0,0,0,.25)"/>' +
      '<path d="M' + (X + 13) + ' ' + (Y + 25) + 'q3 1 6 0l-.6-7h-4.8z" fill="#fff4e6" stroke="' + OLB + '" stroke-width="1"/>' +
      '<path d="M' + (X + 7) + ' ' + (Y + 18) + 'q9-14 18 0z" fill="#e03131" stroke="' + OLB + '" stroke-width="1.3"/><path d="M' + (X + 17) + ' ' + (Y + 9) + 'q6 2 7.5 8.5" stroke="#a61e1e" stroke-width="2" fill="none" opacity=".6"/>' +
      '<circle cx="' + (X + 12) + '" cy="' + (Y + 14) + '" r="1.6" fill="#fff"/><circle cx="' + (X + 17) + '" cy="' + (Y + 11) + '" r="1.9" fill="#fff"/><circle cx="' + (X + 21) + '" cy="' + (Y + 15) + '" r="1.3" fill="#fff"/>' +
      '<path d="M' + (X + 27) + ' ' + (Y + 6) + 'l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="#fff9db"/></g>';
  }
  // ---------- Points de récolte (3.50) : on fonce dedans pour ramasser ----------
  function boisMort(X, Y) {   // deux bûches coupées et une branche
    var buche = (x1, y1, l, a) => '<g transform="rotate(' + a + ' ' + x1 + ' ' + y1 + ')"><rect x="' + x1 + '" y="' + (y1 - 4) + '" width="' + l + '" height="8" rx="3.5" fill="#8d5a2b" stroke="' + OLB + '" stroke-width="1.3"/>' +
      '<path d="M' + (x1 + 4) + ' ' + (y1 - 1.5) + 'h' + (l - 9) + 'M' + (x1 + 6) + ' ' + (y1 + 1.8) + 'h' + (l - 12) + '" stroke="#6b4626" stroke-width="1"/>' +
      '<ellipse cx="' + (x1 + l) + '" cy="' + y1 + '" rx="3" ry="4" fill="#e0b07a" stroke="' + OLB + '" stroke-width="1.2"/><ellipse cx="' + (x1 + l) + '" cy="' + y1 + '" rx="1.2" ry="1.8" fill="none" stroke="#a87447" stroke-width=".7"/></g>';
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 27) + '" rx="13" ry="3.2" fill="rgba(10,20,5,.3)"/>' +
      '<path d="M' + (X + 4) + ' ' + (Y + 15) + 'l9 6M' + (X + 8) + ' ' + (Y + 13) + 'l2 5" stroke="' + OLB + '" stroke-width="3" stroke-linecap="round"/><path d="M' + (X + 4) + ' ' + (Y + 15) + 'l9 6M' + (X + 8) + ' ' + (Y + 13) + 'l2 5" stroke="#7a4a26" stroke-width="1.5" stroke-linecap="round"/>' +
      buche(X + 5, Y + 24, 20, -6) + buche(X + 8, Y + 17, 17, 4) +
      '<path d="M' + (X + 24) + ' ' + (Y + 13) + 'q3-4 6-3" stroke="#69b34c" stroke-width="1.6" fill="none"/>';
  }
  function cailloux(X, Y) {   // trois pierres grises, un peu de mousse
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 27) + '" rx="13" ry="3.2" fill="rgba(10,20,5,.32)"/>' +
      [[10, 21, 7, 5.5, '#a5a5a5'], [21, 22, 6.5, 5, '#8f8f8f'], [15, 15, 6, 5, '#b8b8b8']].map(c =>
        '<ellipse cx="' + (X + c[0]) + '" cy="' + (Y + c[1]) + '" rx="' + c[2] + '" ry="' + c[3] + '" fill="' + c[4] + '" stroke="#2f2f2f" stroke-width="1.3"/>' +
        '<path d="M' + (X + c[0] - c[2] * 0.6) + ' ' + (Y + c[1] - c[3] * 0.25) + 'q' + (c[2] * 0.4) + ' ' + (-c[3] * 0.6) + ' ' + (c[2] * 0.9) + ' ' + (-c[3] * 0.55) + '" stroke="#e6e6e6" stroke-width="1.6" fill="none" stroke-linecap="round"/>').join('') +
      '<path d="M' + (X + 4) + ' ' + (Y + 25) + 'q5-3 9 0" stroke="#4c9a3c" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="' + (X + 24) + '" cy="' + (Y + 18) + '" r="1.4" fill="#4c9a3c"/>';
  }
  function herbes(X, Y) {   // une touffe d'herbes aromatiques, fleurs violettes et blanches
    var feuille = (a, l) => '<path d="M' + (X + 16) + ' ' + (Y + 26) + 'q' + f(Math.sin(a) * l * 0.2 - 3) + ' ' + f(-l * 0.5) + ' ' + f(Math.sin(a) * l) + ' ' + f(-Math.cos(a) * l) + 'q' + f(-Math.sin(a) * l * 0.2 + 5) + ' ' + f(l * 0.35) + ' ' + f(-Math.sin(a) * l + 3) + ' ' + f(Math.cos(a) * l) + 'z" fill="#5fae4c" stroke="' + OL + '" stroke-width="1.1"/>';
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 27) + '" rx="11" ry="2.8" fill="rgba(10,20,5,.28)"/>' +
      [-1.1, -0.6, -0.15, 0.3, 0.75, 1.2].map((a, k) => feuille(a, 14 + (k % 3) * 3)).join('') +
      '<path d="M' + (X + 14) + ' ' + (Y + 22) + 'l-1-9M' + (X + 19) + ' ' + (Y + 22) + 'l2-11" stroke="#3f7a2c" stroke-width="1.2"/>' +
      [[13, 12], [13.5, 9], [21, 10], [21.5, 7]].map(c => '<circle cx="' + (X + c[0]) + '" cy="' + (Y + c[1]) + '" r="2.3" fill="#9775fa" stroke="#3b2a6e" stroke-width=".6"/>').join('') +
      '<circle cx="' + (X + 8) + '" cy="' + (Y + 18) + '" r="2" fill="#fff" stroke="#adb5bd" stroke-width=".5"/><circle cx="' + (X + 8) + '" cy="' + (Y + 18) + '" r=".8" fill="#ffd43b"/>';
  }
  function cristaux(X, Y, flair) {   // cristaux violets qui brillent
    var c = (x, y, w, hh, a, coul) => '<path transform="rotate(' + a + ' ' + (X + x) + ' ' + (Y + y) + ')" d="M' + (X + x - w) + ' ' + (Y + y) + 'V' + (Y + y - hh + w) + 'L' + (X + x) + ' ' + (Y + y - hh) + 'L' + (X + x + w) + ' ' + (Y + y - hh + w) + 'V' + (Y + y) + 'z" fill="' + coul + '" stroke="#2b1a5c" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<path transform="rotate(' + a + ' ' + (X + x) + ' ' + (Y + y) + ')" d="M' + (X + x) + ' ' + (Y + y - hh + 1) + 'V' + (Y + y - 1) + 'H' + (X + x + w - 0.6) + 'V' + (Y + y - hh + w) + 'z" fill="#fff" opacity=".28"/>';
    return '<circle cx="' + (X + 16) + '" cy="' + (Y + 17) + '" r="' + (flair ? 17 : 13) + '" fill="url(#vl-cristal)" class="vl-halo"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 26) + '" rx="10" ry="2.6" fill="rgba(0,0,0,.3)"/>' +
      c(9, 26, 3.5, 12, -22, '#9775fa') + c(23, 26, 3.5, 11, 24, '#748ffc') + c(16, 27, 4.5, 19, 0, '#b197fc') +
      '<g class="vl-scintille"><path d="M' + (X + 26) + ' ' + (Y + 4) + 'l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="#fff"/></g>';
  }
  function filon(X, Y) {   // un rocher où affleurent des cristaux (il faut la pioche)
    return '<ellipse cx="' + (X + 17) + '" cy="' + (Y + 28) + '" rx="14" ry="3.3" fill="rgba(10,20,5,.32)"/>' +
      '<path d="M' + (X + 3) + ' ' + (Y + 28) + 'L' + (X + 6) + ' ' + (Y + 13) + 'L' + (X + 15) + ' ' + (Y + 6) + 'L' + (X + 26) + ' ' + (Y + 9) + 'L' + (X + 30) + ' ' + (Y + 27) + 'Z" fill="#8a8a96" stroke="#2f2f3a" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M' + (X + 17) + ' ' + (Y + 7) + 'L' + (X + 26) + ' ' + (Y + 9) + 'L' + (X + 30) + ' ' + (Y + 27) + 'H' + (X + 19) + 'z" fill="#6f6f7c"/>' +
      [[11, 20, -15], [20, 15, 20], [16, 24, 5]].map(k => '<path transform="rotate(' + k[2] + ' ' + (X + k[0]) + ' ' + (Y + k[1]) + ')" d="M' + (X + k[0] - 2.5) + ' ' + (Y + k[1]) + 'v-4l2.5-3.5 2.5 3.5v4z" fill="#b197fc" stroke="#2b1a5c" stroke-width=".9"/>').join('') +
      '<g class="vl-scintille"><circle cx="' + (X + 21) + '" cy="' + (Y + 10) + '" r="1.3" fill="#fff"/></g>';
  }
  function pointRecolte(p, X, Y, ctx) {
    if (p.filon) return filon(X, Y);
    if (p.res === 'cristal') return cristaux(X, Y, ctx.flair);
    // Une petite étincelle qui clignote : ça se ramasse
    return { bois: boisMort, pierre: cailloux, plante: herbes }[p.res](X, Y) +
      '<g class="vl-scintille"><path d="M' + (X + 27) + ' ' + (Y + 5) + 'l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#fff9db" stroke="#8a6a00" stroke-width=".4"/></g>';
  }
  // L'établi, devant ma maison : vermoulu et couvert de mousse avant la quête de Bruno, tout neuf après
  function etabli(X, Y, repare) {
    var bois = repare ? '#c08a4e' : '#8a6a52', fonce = repare ? '#8d5a2b' : '#5e4a3a';
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 28) + '" rx="15" ry="3.4" fill="rgba(10,20,5,.32)"/>' +
      '<path d="M' + (X + 5) + ' ' + (Y + 17) + 'v11M' + (X + 27) + ' ' + (Y + 17) + 'v' + (repare ? 11 : 7) + '" stroke="' + OLB + '" stroke-width="4.4"/><path d="M' + (X + 5) + ' ' + (Y + 17) + 'v11M' + (X + 27) + ' ' + (Y + 17) + 'v' + (repare ? 11 : 7) + '" stroke="' + fonce + '" stroke-width="2.4"/>' +
      '<path d="M' + (X + 5) + ' ' + (Y + 24) + 'h22" stroke="' + fonce + '" stroke-width="2" stroke-dasharray="' + (repare ? '0' : '9 5') + '"/>' +
      '<rect x="' + (X + 1) + '" y="' + (Y + 12) + '" width="30" height="6" rx="1.5" fill="' + bois + '" stroke="' + OLB + '" stroke-width="1.4"' + (repare ? '' : ' transform="rotate(4 ' + (X + 16) + ' ' + (Y + 15) + ')"') + '/>' +
      '<path d="M' + (X + 3) + ' ' + (Y + 14.5) + 'h26" stroke="' + fonce + '" stroke-width=".9"/>' +
      (repare
        ? '<path d="M' + (X + 6) + ' ' + (Y + 12) + 'l7-6" stroke="#5c3a1f" stroke-width="2" stroke-linecap="round"/><rect x="' + (X + 10) + '" y="' + (Y + 3) + '" width="7" height="4" rx="1" fill="#868e96" stroke="#2f2f2f" stroke-width="1" transform="rotate(-40 ' + (X + 13) + ' ' + (Y + 5) + ')"/>' +
          '<path d="M' + (X + 18) + ' ' + (Y + 11.5) + 'l9-1.5v-4l-9 1.5z" fill="#ced4da" stroke="#2f2f2f" stroke-width="1"/><path d="M' + (X + 19) + ' ' + (Y + 11) + 'l1 1.4 1-1.6 1 1.4 1-1.6 1 1.4 1-1.6" stroke="#2f2f2f" stroke-width=".6" fill="none"/>' +
          '<rect x="' + (X + 16) + '" y="' + (Y + 8.5) + '" width="3.5" height="3.5" rx=".8" fill="#8d5a2b" stroke="' + OLB + '" stroke-width=".8"/>'
        : '<path d="M' + (X + 2) + ' ' + (Y + 13) + 'q6-4 11 0" stroke="#4c9a3c" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="' + (X + 25) + '" cy="' + (Y + 12.5) + '" r="2.2" fill="#4c9a3c"/>' +
          '<path d="M' + (X + 20) + ' ' + (Y + 18) + 'q3 4 6 2M' + (X + 22) + ' ' + (Y + 18) + 'l1 4" stroke="#f1f3f5" stroke-width=".6" fill="none" opacity=".8"/>');
  }
  // Lanterne sur poteau, avec sa lueur (comme les torches du Donjon)
  function lanterne(cx, base, petite) {
    var hgt = petite ? 16 : 26;
    return '<circle cx="' + cx + '" cy="' + (base - hgt) + '" r="' + (petite ? 13 : 18) + '" fill="url(#vl-lueur)" class="vl-halo"/>' +
      '<path d="M' + cx + ' ' + base + 'V' + (base - hgt + 4) + '" stroke="' + OLB + '" stroke-width="3.4"/><path d="M' + cx + ' ' + base + 'V' + (base - hgt + 4) + '" stroke="#5c4632" stroke-width="1.8"/>' +
      '<rect x="' + (cx - 4) + '" y="' + (base - hgt - 4) + '" width="8" height="9" rx="1.5" fill="#ffe066" stroke="' + OLB + '" stroke-width="1.3"/>' +
      '<path class="vl-flamme" d="M' + cx + ' ' + (base - hgt - 2.5) + 'q2.2 2.5 0 5q-2.2-2.5 0-5z" fill="#ff922b"/>' +
      '<path d="M' + (cx - 5) + ' ' + (base - hgt - 4) + 'h10l-2-3h-6z" fill="#3b2a1d" stroke="' + OLB + '" stroke-width="1"/>';
  }
  // Torche murale (crypte)
  function torche(cx, cy) {
    return '<circle cx="' + cx + '" cy="' + (cy - 4) + '" r="16" fill="url(#vl-lueur)" class="vl-halo"/>' +
      '<path d="M' + (cx - 3) + ' ' + (cy + 1) + 'h6l-2 9h-2z" fill="#5a3b22" stroke="' + OLB + '" stroke-width="1"/>' +
      '<rect x="' + (cx - 4.5) + '" y="' + (cy - 0.5) + '" width="9" height="2.6" rx="1" fill="#8a8aa0" stroke="#3a3a4a" stroke-width=".7"/>' +
      '<path class="vl-flamme" d="M' + cx + ' ' + (cy - 11) + 'C' + (cx + 4) + ' ' + (cy - 6) + ' ' + (cx + 4.5) + ' ' + (cy - 3) + ' ' + (cx + 3) + ' ' + (cy - 0.5) + 'C' + (cx + 1.5) + ' ' + (cy + 1.5) + ' ' + (cx - 1.5) + ' ' + (cy + 1.5) + ' ' + (cx - 3) + ' ' + (cy - 0.5) + 'C' + (cx - 4.5) + ' ' + (cy - 3) + ' ' + (cx - 2.5) + ' ' + (cy - 6) + ' ' + cx + ' ' + (cy - 11) + 'Z" fill="#ff9f1c"/>' +
      '<path class="vl-flamme" d="M' + cx + ' ' + (cy - 6) + 'C' + (cx + 2) + ' ' + (cy - 3) + ' ' + (cx + 2) + ' ' + (cy - 1) + ' ' + cx + ' ' + (cy - 0.5) + 'C' + (cx - 2) + ' ' + (cy - 1) + ' ' + (cx - 2) + ' ' + (cy - 3) + ' ' + cx + ' ' + (cy - 6) + 'Z" fill="#ffe08a"/>';
  }
  // Obstacles des pouvoirs, fermés ou ouverts
  function obstacle(t, X, Y, ouvert, flair) {
    if (t === 'r') return ouvert
      ? '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 25) + '" rx="12" ry="3.5" fill="#4a3b30" opacity=".55"/><path d="M' + (X + 6) + ' ' + (Y + 26) + 'l2-5M' + (X + 13) + ' ' + (Y + 27) + 'l1-6M' + (X + 22) + ' ' + (Y + 26) + 'l-1-5M' + (X + 27) + ' ' + (Y + 25) + 'l-2-4" stroke="#3a2a1e" stroke-width="2.4" stroke-linecap="round"/><circle cx="' + (X + 18) + '" cy="' + (Y + 24) + '" r="1.2" fill="#ff922b" class="vl-braise"/>'
      : '<ellipse cx="' + (X + 17) + '" cy="' + (Y + 28) + '" rx="14" ry="3.2" fill="rgba(10,20,5,.3)"/>' + boules([[X + 9, Y + 19, 9], [X + 23, Y + 18, 9], [X + 16, Y + 10, 9]], '#2f7d32', OL, 1.5) +
        '<circle cx="' + (X + 21) + '" cy="' + (Y + 21) + '" r="6" fill="#245c27"/><circle cx="' + (X + 13) + '" cy="' + (Y + 8) + '" r="3.5" fill="#43a047"/>' +
        '<path d="M' + (X + 2) + ' ' + (Y + 11) + 'l-3-3M' + (X + 30) + ' ' + (Y + 11) + 'l3-3M' + (X + 16) + ' ' + (Y + 0) + 'v-4M' + (X + 5) + ' ' + (Y + 28) + 'l-3 3M' + (X + 27) + ' ' + (Y + 27) + 'l3 3M' + (X + 9) + ' ' + (Y + 15) + 'l-3 1M' + (X + 24) + ' ' + (Y + 12) + 'l3-1" stroke="' + OL + '" stroke-width="2"/>' +
        '<path d="M' + (X + 4) + ' ' + (Y + 20) + 'q12-8 24 2M' + (X + 7) + ' ' + (Y + 12) + 'q10 4 18-4" stroke="' + OL + '" stroke-width="1.6" fill="none"/>' +
        '<circle cx="' + (X + 12) + '" cy="' + (Y + 14) + '" r="2" fill="#e03131" stroke="#7a1010" stroke-width=".6"/><circle cx="' + (X + 21) + '" cy="' + (Y + 20) + '" r="2" fill="#e03131" stroke="#7a1010" stroke-width=".6"/>';
    if (t === 'R') return ouvert
      ? [[7, 25, 3.5], [25, 24, 3], [16, 27, 2.4]].map(c => '<circle cx="' + (X + c[0]) + '" cy="' + (Y + c[1]) + '" r="' + c[2] + '" fill="#a5a5a5" stroke="#3a3a3a" stroke-width="1"/>').join('')
      : '<ellipse cx="' + (X + 17) + '" cy="' + (Y + 28) + '" rx="15" ry="3.4" fill="rgba(10,20,5,.32)"/><path d="M' + (X + 2) + ' ' + (Y + 28) + 'L' + (X + 5) + ' ' + (Y + 9) + 'L' + (X + 15) + ' ' + (Y + 2) + 'L' + (X + 27) + ' ' + (Y + 6) + 'L' + (X + 31) + ' ' + (Y + 27) + 'Z" fill="#9e9e9e" stroke="#2f2f2f" stroke-width="1.7" stroke-linejoin="round"/>' +
        '<path d="M' + (X + 17) + ' ' + (Y + 4) + 'L' + (X + 27) + ' ' + (Y + 6) + 'L' + (X + 31) + ' ' + (Y + 27) + 'H' + (X + 20) + 'z" fill="#7d7d7d"/>' +
        '<path d="M' + (X + 15) + ' ' + (Y + 3) + 'l-2 9 5 5-3 9" stroke="#4a4a4a" stroke-width="1.6" fill="none"/><path d="M' + (X + 7) + ' ' + (Y + 11) + 'L' + (X + 15) + ' ' + (Y + 5) + '" stroke="#dcdcdc" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M' + (X + 3) + ' ' + (Y + 25) + 'q6-4 11 1" stroke="#4c9a3c" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    if (t === 'v') return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 17) + '" rx="15" ry="12" fill="#7a5a3a" stroke="' + OLB + '" stroke-width="1.3"/><ellipse cx="' + (X + 16) + '" cy="' + (Y + 18.5) + '" rx="12" ry="9" fill="#120b06"/><path d="M' + (X + 5) + ' ' + (Y + 14) + 'q11-7 22 0" stroke="#4a3426" stroke-width="2" fill="none"/>' +
      (ouvert ? '<rect x="' + (X - 2) + '" y="' + (Y + 12) + '" width="36" height="9" rx="1.5" fill="#c08a4e" stroke="' + OLB + '" stroke-width="1.3"/><path d="M' + (X + 6) + ' ' + (Y + 12) + 'v9M' + (X + 26) + ' ' + (Y + 12) + 'v9M' + (X - 1) + ' ' + (Y + 15) + 'h34" stroke="#7a5230" stroke-width="1"/>' : '');
    if (t === 's') return ouvert
      ? '<path d="M' + (X + 1) + ' ' + (Y + 30) + 'V' + (Y + 12) + 'q15-14 30 0V' + (Y + 30) + 'h-5V' + (Y + 15) + 'q-10-8-20 0V' + (Y + 30) + 'z" fill="#3f8a34" stroke="' + OL + '" stroke-width="1.4"/><circle cx="' + (X + 4) + '" cy="' + (Y + 9) + '" r="4" fill="#58a847" stroke="' + OL + '" stroke-width="1.2"/><circle cx="' + (X + 28) + '" cy="' + (Y + 9) + '" r="4" fill="#58a847" stroke="' + OL + '" stroke-width="1.2"/>'
      : '<rect x="' + (X + 1) + '" y="' + (Y + 6) + '" width="30" height="24" rx="6" fill="#2a6324" stroke="' + OL + '" stroke-width="1.5"/>' + boules([[X + 8, Y + 9, 8], [X + 24, Y + 9, 8], [X + 16, Y + 5, 7]], '#3f8a34', OL, 1.4) +
        '<circle cx="' + (X + 12) + '" cy="' + (Y + 4) + '" r="3" fill="#58a847"/><path d="M' + (X + 15) + ' ' + (Y + 14) + 'l2 6-2 5" stroke="#163d13" stroke-width="1.3" fill="none"/>' +
        (flair ? '<g class="vl-scintille"><path d="M' + (X + 16) + ' ' + (Y + 7) + 'l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#ffe066"/><circle cx="' + (X + 8) + '" cy="' + (Y + 22) + '" r="1.4" fill="#fff9db"/><circle cx="' + (X + 25) + '" cy="' + (Y + 21) + '" r="1.4" fill="#fff9db"/></g>' : '');
    return '';
  }
  function coffre(X, Y, ouvert) {
    return (ouvert ? '' : '<circle cx="' + (X + 16) + '" cy="' + (Y + 18) + '" r="15" fill="url(#vl-lueur)" class="vl-halo"/>') +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 28) + '" rx="12" ry="3" fill="rgba(0,0,0,.3)"/>' +
      (ouvert ? '<path d="M' + (X + 5) + ' ' + (Y + 9) + 'q11-8 22 0v4h-22z" fill="#8d5a2b" stroke="' + OLB + '" stroke-width="1.3" transform="rotate(-18 ' + (X + 5) + ' ' + (Y + 13) + ')"/>' : '') +
      '<rect x="' + (X + 5) + '" y="' + (Y + 14) + '" width="22" height="13" rx="2" fill="#a0652e" stroke="' + OLB + '" stroke-width="1.4"/>' +
      (ouvert ? '<rect x="' + (X + 7) + '" y="' + (Y + 14) + '" width="18" height="3" fill="#2b1a0c"/>'
              : '<path d="M' + (X + 5) + ' ' + (Y + 15) + 'q11-9 22 0z" fill="#b8763a" stroke="' + OLB + '" stroke-width="1.4"/>') +
      '<path d="M' + (X + 5) + ' ' + (Y + 18) + 'h22M' + (X + 10) + ' ' + (Y + 14) + 'v13M' + (X + 22) + ' ' + (Y + 14) + 'v13" stroke="#e0a83a" stroke-width="1.8"/><rect x="' + (X + 14) + '" y="' + (Y + 16) + '" width="4" height="5" rx="1" fill="#fcc419" stroke="#5c3a00" stroke-width=".9"/>';
  }

  // ---------- Bâtiments ----------
  // Le panneau de ma maison, posé sur le toit : la taille du texte suit la longueur du nom
  function panneau(cx, cy, texte, larg) {
    var t = String(texte || ''), l = larg || 66, fs = Math.max(6.5, Math.min(10.5, (l - 8) * 1.75 / Math.max(1, t.length)));
    return '<path d="M' + (cx - 20) + ' ' + (cy - 9) + 'L' + (cx - 16) + ' ' + (cy - 15) + 'M' + (cx + 20) + ' ' + (cy - 9) + 'L' + (cx + 16) + ' ' + (cy - 15) + '" stroke="' + OLB + '" stroke-width="1.6"/>' +
      '<rect x="' + (cx - l / 2) + '" y="' + (cy - 9) + '" width="' + l + '" height="17" rx="3" fill="' + OLB + '"/>' +
      '<rect x="' + (cx - l / 2 + 1.5) + '" y="' + (cy - 7.5) + '" width="' + (l - 3) + '" height="14" rx="2" fill="#c08a4e"/>' +
      '<rect x="' + (cx - l / 2 + 3.5) + '" y="' + (cy - 5.5) + '" width="' + (l - 7) + '" height="10" rx="1.5" fill="#f3dfb4"/>' +
      '<circle cx="' + (cx - l / 2 + 4) + '" cy="' + (cy - 5) + '" r=".9" fill="' + OLB + '"/><circle cx="' + (cx + l / 2 - 4) + '" cy="' + (cy - 5) + '" r=".9" fill="' + OLB + '"/>' +
      '<text x="' + cx + '" y="' + f(cy + fs * 0.36) + '" text-anchor="middle" font-size="' + f(fs) + '" font-weight="900" fill="#4a2e17" font-family="Georgia, serif">' + esc(t) + '</text>';
  }
  function fenetre(x, y, w, h) {
    return '<rect x="' + (x - 3) + '" y="' + (y - 3) + '" width="' + (w + 6) + '" height="' + (h + 6) + '" rx="3" fill="url(#vl-lueur)" opacity=".7"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.5" fill="#ffd77a" stroke="' + OLB + '" stroke-width="1.4"/>' +
      '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (w / 2 - 1) + '" height="' + (h / 2 - 1) + '" fill="#fff1b8"/>' +
      '<path d="M' + (x + w / 2) + ' ' + y + 'v' + h + 'M' + x + ' ' + (y + h / 2) + 'h' + w + '" stroke="' + OLB + '" stroke-width="1.1"/>';
  }
  function batiment(b, X, Y, ctx) {
    var s = '';
    if (b.type === 'maison') {   // ma maison : 3 × 2 cases, colombages, toit de tuiles, grand panneau sur le toit, lanterne à la porte
      s += '<ellipse cx="' + (X + 50) + '" cy="' + (Y + 63) + '" rx="50" ry="5.5" fill="rgba(10,20,5,.32)"/>' +
        '<rect x="' + (X + 70) + '" y="' + (Y - 16) + '" width="11" height="22" fill="#a35a3c" stroke="' + OLB + '" stroke-width="1.4"/><rect x="' + (X + 68.5) + '" y="' + (Y - 18) + '" width="14" height="4" fill="#7a3f28" stroke="' + OLB + '" stroke-width="1.2"/>' +
        '<g class="vl-fumee"><circle cx="' + (X + 75) + '" cy="' + (Y - 24) + '" r="4" fill="#fff" opacity=".7"/><circle cx="' + (X + 79) + '" cy="' + (Y - 32) + '" r="5" fill="#fff" opacity=".5"/><circle cx="' + (X + 74) + '" cy="' + (Y - 41) + '" r="6" fill="#fff" opacity=".3"/></g>' +
        '<rect x="' + (X + 4) + '" y="' + (Y + 18) + '" width="88" height="45" fill="#f6e3c0" stroke="' + OLB + '" stroke-width="1.6"/>' +
        '<path d="M' + (X + 4) + ' ' + (Y + 26) + 'h88M' + (X + 4) + ' ' + (Y + 52) + 'h88M' + (X + 20) + ' ' + (Y + 18) + 'v34M' + (X + 76) + ' ' + (Y + 18) + 'v34M' + (X + 4) + ' ' + (Y + 26) + 'l16 26M' + (X + 92) + ' ' + (Y + 26) + 'l-16 26" stroke="#7a4a26" stroke-width="2.6"/>' +
        '<rect x="' + (X + 4) + '" y="' + (Y + 52) + '" width="88" height="11" fill="#a8a29e" stroke="' + OLB + '" stroke-width="1.4"/>' +
        [8, 22, 36, 60, 74].map((sx, k) => '<rect x="' + (X + sx) + '" y="' + (Y + 54 + (k % 2) * 4) + '" width="10" height="3.5" rx="1" fill="#8a847f"/>').join('') +
        '<path d="M' + (X - 5) + ' ' + (Y + 23) + 'L' + (X + 48) + ' ' + (Y - 14) + 'L' + (X + 101) + ' ' + (Y + 23) + 'Z" fill="#c94a3f" stroke="' + OLB + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M' + (X + 48) + ' ' + (Y - 12) + 'L' + (X + 98) + ' ' + (Y + 22) + 'H' + (X + 48) + 'Z" fill="#a8382f"/>' +
        [-4, 4, 12].map(yy => '<path d="M' + f(X + 48 - (yy + 14) * 1.43) + ' ' + (Y + yy) + 'H' + f(X + 48 + (yy + 14) * 1.43) + '" stroke="#7a2620" stroke-width="1.3" stroke-dasharray="6 1.5"/>').join('') +
        panneau(X + 48, Y + 9, ctx.plaque || 'Ma maison') +
        fenetre(X + 9, Y + 31, 15, 13) + fenetre(X + 72, Y + 31, 15, 13) +
        '<rect x="' + (X + 7) + '" y="' + (Y + 45) + '" width="21" height="5" rx="1" fill="#8d5a2b" stroke="' + OLB + '" stroke-width="1"/><circle cx="' + (X + 11) + '" cy="' + (Y + 44) + '" r="2.4" fill="#ff6b6b"/><circle cx="' + (X + 17) + '" cy="' + (Y + 43.5) + '" r="2.4" fill="#ffd43b"/><circle cx="' + (X + 23) + '" cy="' + (Y + 44) + '" r="2.4" fill="#f783ac"/>' +
        '<rect x="' + (X + 70) + '" y="' + (Y + 45) + '" width="21" height="5" rx="1" fill="#8d5a2b" stroke="' + OLB + '" stroke-width="1"/><circle cx="' + (X + 74) + '" cy="' + (Y + 44) + '" r="2.4" fill="#b197fc"/><circle cx="' + (X + 80) + '" cy="' + (Y + 43.5) + '" r="2.4" fill="#ff6b6b"/><circle cx="' + (X + 86) + '" cy="' + (Y + 44) + '" r="2.4" fill="#ffd43b"/>' +
        '<path d="M' + (X + 35) + ' ' + (Y + 64) + 'V' + (Y + 37) + 'a13 13 0 0 1 26 0V' + (Y + 64) + 'z" fill="#4a2e17" stroke="' + OLB + '" stroke-width="1.4"/>' +
        '<path d="M' + (X + 37.5) + ' ' + (Y + 64) + 'V' + (Y + 37.5) + 'a10.5 10.5 0 0 1 21 0V' + (Y + 64) + 'z" fill="#8d5a2b"/><path d="M' + (X + 42) + ' ' + (Y + 30) + 'V' + (Y + 64) + 'M' + (X + 48) + ' ' + (Y + 27) + 'V' + (Y + 64) + 'M' + (X + 54) + ' ' + (Y + 30) + 'V' + (Y + 64) + '" stroke="#6d4520" stroke-width="1.1"/>' +
        '<circle cx="' + (X + 54) + '" cy="' + (Y + 48) + '" r="1.8" fill="#fcc419" stroke="#5c3a00" stroke-width=".6"/>' +
        '<path d="M' + (X + 32) + ' ' + (Y + 64) + 'h32v2.5h-32z" fill="#8a847f" stroke="' + OLB + '" stroke-width="1"/>' +
        lanterne(X + 66, Y + 62, true);
    } else if (b.type === 'hutte') {   // la hutte de l'herboriste : toit de chaume, herbes qui sèchent
      s += '<ellipse cx="' + (X + 33) + '" cy="' + (Y + 62) + '" rx="33" ry="4.5" fill="rgba(10,20,5,.32)"/>' +
        '<rect x="' + (X + 6) + '" y="' + (Y + 24) + '" width="52" height="38" rx="4" fill="#e9d3a8" stroke="' + OLB + '" stroke-width="1.6"/>' +
        '<path d="M' + (X + 6) + ' ' + (Y + 52) + 'h52v6q0 4-4 4h-44q-4 0-4-4z" fill="#a8a29e" stroke="' + OLB + '" stroke-width="1.3"/>' +
        '<path d="M' + (X - 3) + ' ' + (Y + 31) + 'Q' + (X + 32) + ' ' + (Y - 24) + ' ' + (X + 67) + ' ' + (Y + 31) + 'Q' + (X + 32) + ' ' + (Y + 24) + ' ' + (X - 3) + ' ' + (Y + 31) + 'Z" fill="#d4a24c" stroke="' + OLB + '" stroke-width="1.7"/>' +
        '<path d="M' + (X + 34) + ' ' + (Y - 2) + 'Q' + (X + 60) + ' ' + (Y + 6) + ' ' + (X + 66) + ' ' + (Y + 30) + 'Q' + (X + 50) + ' ' + (Y + 27) + ' ' + (X + 34) + ' ' + (Y + 27) + 'Z" fill="#b8862f" opacity=".75"/>' +
        '<path d="M' + (X + 5) + ' ' + (Y + 25) + 'q7-14 14-22M' + (X + 21) + ' ' + (Y + 27) + 'q4-14 10-25M' + (X + 43) + ' ' + (Y + 27) + 'q-4-14-10-25M' + (X + 59) + ' ' + (Y + 25) + 'q-7-14-14-22" stroke="#8a6315" stroke-width="1.2" fill="none"/>' +
        '<path d="M' + (X + 30) + ' ' + (Y + 62) + 'v-17a6 6 0 0 1 12 0v17z" fill="#6b4626" stroke="' + OLB + '" stroke-width="1.4"/><circle cx="' + (X + 39) + '" cy="' + (Y + 54) + '" r="1.2" fill="#fcc419"/>' +
        '<circle cx="' + (X + 17) + '" cy="' + (Y + 42) + '" r="9" fill="url(#vl-lueur)" opacity=".7"/><circle cx="' + (X + 17) + '" cy="' + (Y + 42) + '" r="6" fill="#ffd77a" stroke="' + OLB + '" stroke-width="1.4"/><path d="M' + (X + 11) + ' ' + (Y + 42) + 'h12M' + (X + 17) + ' ' + (Y + 36) + 'v12" stroke="' + OLB + '" stroke-width="1"/>' +
        '<path d="M' + (X + 6) + ' ' + (Y + 31) + 'h22" stroke="' + OLB + '" stroke-width="1.1"/>' +
        [9, 15, 21, 27].map((hx, k) => '<path d="M' + (X + hx) + ' ' + (Y + 31) + 'v4" stroke="' + OLB + '" stroke-width=".8"/><path d="M' + (X + hx - 2) + ' ' + (Y + 35) + 'q2 5 4 0z" fill="' + ['#69b34c', '#9c36b5', '#4a9e3f', '#e8590c'][k] + '" stroke="' + OLB + '" stroke-width=".6"/>').join('') +
        '<ellipse cx="' + (X + 53) + '" cy="' + (Y + 59) + '" rx="5.5" ry="3.2" fill="#a0652e" stroke="' + OLB + '" stroke-width="1"/><path d="M' + (X + 49) + ' ' + (Y + 58) + 'q4-7 8 0" stroke="#69b34c" stroke-width="2" fill="none"/>';
    } else if (b.type === 'forge') {   // la forge de Bruno : pierre, ardoise, braises qui rougeoient
      s += '<ellipse cx="' + (X + 33) + '" cy="' + (Y + 62) + '" rx="33" ry="4.5" fill="rgba(10,20,5,.34)"/>' +
        '<rect x="' + (X + 44) + '" y="' + (Y - 12) + '" width="12" height="24" fill="#78716c" stroke="' + OLB + '" stroke-width="1.4"/>' +
        '<g class="vl-fumee"><circle cx="' + (X + 50) + '" cy="' + (Y - 18) + '" r="4" fill="#ced4da" opacity=".75"/><circle cx="' + (X + 53) + '" cy="' + (Y - 27) + '" r="5" fill="#ced4da" opacity=".5"/></g>' +
        '<rect x="' + (X + 4) + '" y="' + (Y + 20) + '" width="56" height="42" fill="#a8a29e" stroke="' + OLB + '" stroke-width="1.6"/>' +
        [27, 34, 41, 48, 55].map((yy, k) => '<path d="M' + (X + 4) + ' ' + (Y + yy) + 'h56" stroke="#7d7772" stroke-width="1"/>' + [0, 1, 2, 3].map(j => '<path d="M' + (X + 10 + j * 14 + (k % 2) * 7) + ' ' + (Y + yy - 7) + 'v7" stroke="#7d7772" stroke-width="1"/>').join('')).join('') +
        '<path d="M' + (X - 3) + ' ' + (Y + 24) + 'L' + (X + 8) + ' ' + (Y + 3) + 'H' + (X + 56) + 'L' + (X + 67) + ' ' + (Y + 24) + 'Z" fill="#495057" stroke="' + OLB + '" stroke-width="1.7" stroke-linejoin="round"/>' +
        '<path d="M' + (X + 32) + ' ' + (Y + 3) + 'H' + (X + 56) + 'L' + (X + 67) + ' ' + (Y + 24) + 'H' + (X + 32) + 'Z" fill="#343a40"/>' +
        '<path d="M' + (X + 2) + ' ' + (Y + 14) + 'h60M' + (X + 5) + ' ' + (Y + 9) + 'h54M' + (X) + ' ' + (Y + 19) + 'h64" stroke="#212529" stroke-width="1.1"/>' +
        '<circle cx="' + (X + 19) + '" cy="' + (Y + 52) + '" r="18" fill="url(#vl-braise)" class="vl-halo"/>' +
        '<path d="M' + (X + 10) + ' ' + (Y + 62) + 'v-18a9 9 0 0 1 18 0v18z" fill="#1a0f08" stroke="' + OLB + '" stroke-width="1.4"/><path d="M' + (X + 12) + ' ' + (Y + 62) + 'v-7q7-7 14 0v7z" fill="#ff922b" class="vl-braise"/><path d="M' + (X + 15) + ' ' + (Y + 62) + 'v-4q4-4 8 0v4z" fill="#ffd43b" class="vl-braise"/>' +
        fenetre(X + 37, Y + 32, 15, 11) +
        '<path d="M' + (X + 34) + ' ' + (Y + 54) + 'h17l-3 4h-4v5h-5v-5h-2z" fill="#495057" stroke="' + OLB + '" stroke-width="1.1"/>';
    } else if (b.type === 'cabane') {   // la cabane de l'ermite : rondins, toit moussu, lanterne
      s += '<ellipse cx="' + (X + 33) + '" cy="' + (Y + 62) + '" rx="33" ry="4.5" fill="rgba(10,20,5,.32)"/>' +
        '<rect x="' + (X + 6) + '" y="' + (Y + 22) + '" width="52" height="40" fill="#a8703e" stroke="' + OLB + '" stroke-width="1.6"/>' +
        [27, 33, 39, 45, 51, 57].map(yy => '<path d="M' + (X + 6) + ' ' + (Y + yy) + 'h52" stroke="#6b4626" stroke-width="1.4"/><circle cx="' + (X + 6) + '" cy="' + (Y + yy - 3) + '" r="2.6" fill="#d9a066" stroke="' + OLB + '" stroke-width=".8"/><circle cx="' + (X + 58) + '" cy="' + (Y + yy - 3) + '" r="2.6" fill="#d9a066" stroke="' + OLB + '" stroke-width=".8"/>').join('') +
        '<path d="M' + (X - 3) + ' ' + (Y + 26) + 'L' + (X + 32) + ' ' + (Y - 5) + 'L' + (X + 67) + ' ' + (Y + 26) + 'Z" fill="#6b8e3a" stroke="' + OLB + '" stroke-width="1.7" stroke-linejoin="round"/>' +
        '<path d="M' + (X + 32) + ' ' + (Y - 4) + 'L' + (X + 65) + ' ' + (Y + 25) + 'H' + (X + 32) + 'Z" fill="#577530"/>' +
        boules([[X + 14, Y + 20, 5], [X + 44, Y + 14, 6], [X + 30, Y + 4, 4]], '#7fa64a', '#3d5a1e', 1.2) +
        '<path d="M' + (X + 34) + ' ' + (Y + 62) + 'v-20h14v20" fill="#4a2e17" stroke="' + OLB + '" stroke-width="1.4"/><circle cx="' + (X + 45) + '" cy="' + (Y + 53) + '" r="1.3" fill="#fcc419"/>' +
        fenetre(X + 12, Y + 36, 13, 11) +
        '<path d="M' + (X + 2) + ' ' + (Y + 62) + 'h8v-6h-8z" fill="#8d5a2b" stroke="' + OLB + '" stroke-width="1"/><path d="M' + (X + 3) + ' ' + (Y + 56) + 'q3-5 6 0" stroke="#69b34c" stroke-width="2" fill="none"/>' +
        lanterne(X + 62, Y + 60, true);
    } else if (b.type === 'crypte') {   // la vieille crypte : l'entrée du Donjon, avec ses torches
      s += '<ellipse cx="' + (X + 48) + '" cy="' + (Y + 64) + '" rx="48" ry="5.5" fill="rgba(0,0,0,.35)"/>' +
        '<rect x="' + (X + 6) + '" y="' + (Y + 16) + '" width="84" height="47" fill="#6c737a" stroke="' + OLB + '" stroke-width="1.7"/>' +
        [24, 32, 40, 48, 56].map((yy, k) => '<path d="M' + (X + 6) + ' ' + (Y + yy) + 'h84" stroke="#4f565c" stroke-width="1.1"/>' + [0, 1, 2, 3, 4, 5].map(j => '<path d="M' + (X + 12 + j * 14 + (k % 2) * 7) + ' ' + (Y + yy - 8) + 'v8" stroke="#4f565c" stroke-width="1"/>').join('')).join('') +
        '<path d="M' + (X + 1) + ' ' + (Y + 19) + 'L' + (X + 48) + ' ' + (Y - 10) + 'L' + (X + 95) + ' ' + (Y + 19) + 'Z" fill="#868e96" stroke="' + OLB + '" stroke-width="1.7" stroke-linejoin="round"/>' +
        '<path d="M' + (X + 48) + ' ' + (Y - 8) + 'L' + (X + 92) + ' ' + (Y + 18) + 'H' + (X + 48) + 'Z" fill="#6c737a"/>' +
        '<circle cx="' + (X + 48) + '" cy="' + (Y + 7) + '" r="6" fill="#343a40" stroke="' + OLB + '" stroke-width="1.2"/><path d="M' + (X + 44.5) + ' ' + (Y + 6) + 'h7M' + (X + 48) + ' ' + (Y + 2.5) + 'v9" stroke="#adb5bd" stroke-width="1.4"/>' +
        '<rect x="' + (X + 10) + '" y="' + (Y + 19) + '" width="10" height="44" fill="#868e96" stroke="' + OLB + '" stroke-width="1.4"/><rect x="' + (X + 76) + '" y="' + (Y + 19) + '" width="10" height="44" fill="#868e96" stroke="' + OLB + '" stroke-width="1.4"/>' +
        '<rect x="' + (X + 8) + '" y="' + (Y + 17) + '" width="14" height="4" fill="#adb5bd" stroke="' + OLB + '" stroke-width="1"/><rect x="' + (X + 74) + '" y="' + (Y + 17) + '" width="14" height="4" fill="#adb5bd" stroke="' + OLB + '" stroke-width="1"/>' +
        '<path d="M' + (X + 33) + ' ' + (Y + 64) + 'V' + (Y + 37) + 'a15 15 0 0 1 30 0V' + (Y + 64) + 'z" fill="#08050a" stroke="#495057" stroke-width="3.5" stroke-dasharray="7 1.5"/>' +
        '<path d="M' + (X + 36) + ' ' + (Y + 64) + 'h24l-3-5h-18z" fill="#2b2328"/><path d="M' + (X + 38) + ' ' + (Y + 59) + 'h20l-2-4h-16z" fill="#1d171b"/>' +
        '<g class="vl-yeux"><circle cx="' + (X + 44) + '" cy="' + (Y + 44) + '" r="1.6" fill="#ffe066"/><circle cx="' + (X + 51) + '" cy="' + (Y + 44) + '" r="1.6" fill="#ffe066"/></g>' +
        '<path d="M' + (X + 28) + ' ' + (Y + 64) + 'h40v3h-40z" fill="#4f565c" stroke="' + OLB + '" stroke-width="1"/>' +
        '<path d="M' + (X + 6) + ' ' + (Y + 22) + 'q-6 14 2 28M' + (X + 90) + ' ' + (Y + 24) + 'q6 12-1 24M' + (X + 22) + ' ' + (Y + 16) + 'q6 6 2 14" stroke="#3b7f2f" stroke-width="2.6" fill="none"/>' +
        '<circle cx="' + (X + 4) + '" cy="' + (Y + 34) + '" r="2.6" fill="#4c9a3c"/><circle cx="' + (X + 93) + '" cy="' + (Y + 38) + '" r="2.6" fill="#4c9a3c"/><circle cx="' + (X + 25) + '" cy="' + (Y + 26) + '" r="2" fill="#4c9a3c"/>' +
        torche(X + 27, Y + 38) + torche(X + 69, Y + 38);
    } else if (b.type === 'chene') {   // le vieux chêne : un tronc énorme et un creux
      s += '<ellipse cx="' + (X + 34) + '" cy="' + (Y + 61) + '" rx="36" ry="6.5" fill="rgba(10,20,5,.34)"/>' +
        '<path d="M' + (X + 13) + ' ' + (Y + 63) + 'q7-4 7-27h24q0 23 7 27q-8 2-12-3-4 4-8 0-8 5-18 3z" fill="#7a5230" stroke="' + OLB + '" stroke-width="1.8"/>' +
        '<path d="M' + (X + 32) + ' ' + (Y + 36) + 'q2 14 7 26" stroke="#5c3a1f" stroke-width="5" opacity=".5" fill="none"/>' +
        '<ellipse cx="' + (X + 30) + '" cy="' + (Y + 48) + '" rx="5" ry="7" fill="#1a0f08" stroke="' + OLB + '" stroke-width="1.2"/>' +
        '<path d="M' + (X + 24) + ' ' + (Y + 40) + 'q2 10-1 18M' + (X + 40) + ' ' + (Y + 38) + 'q-1 8 2 16" stroke="#4a2e17" stroke-width="1.3" fill="none"/>' +
        boules([[X + 8, Y + 14, 18], [X + 56, Y + 14, 18], [X + 32, Y - 4, 22], [X + 20, Y + 24, 15], [X + 44, Y + 24, 15]], '#3f8f3a', OL, 2) +
        '<circle cx="' + (X + 46) + '" cy="' + (Y + 22) + '" r="13" fill="#2f6a2e" opacity=".75"/><circle cx="' + (X + 58) + '" cy="' + (Y + 12) + '" r="11" fill="#2f6a2e" opacity=".7"/>' +
        '<circle cx="' + (X + 24) + '" cy="' + (Y - 10) + '" r="9" fill="#58a64a"/><circle cx="' + (X + 4) + '" cy="' + (Y + 8) + '" r="7" fill="#58a64a"/><circle cx="' + (X + 20) + '" cy="' + (Y - 14) + '" r="3.5" fill="#7cc25c"/>' +
        '<ellipse cx="' + (X + 40) + '" cy="' + (Y + 30) + '" rx="2.4" ry="1.7" fill="#c08a4e" stroke="' + OLB + '" stroke-width=".6"/><ellipse cx="' + (X + 16) + '" cy="' + (Y + 20) + '" rx="2.4" ry="1.7" fill="#c08a4e" stroke="' + OLB + '" stroke-width=".6"/>';
    } else if (b.type === 'parcelle') {
      s += maisonAmi(X, Y, ctx.parcelles && ctx.parcelles[b.p]);
    }
    return s;
  }
  // La maison d'un ami, dans le quartier (2 × 2 cases) : toit à sa couleur, son nom sur le panneau ;
  // fenêtres allumées et cheminée qui fume s'il est connecté, volets fermés sinon. Parcelle libre : un terrain clôturé.
  function fonce(c, k) {
    var n = parseInt(String(c).slice(1), 16) || 0;
    var r = Math.round((n >> 16) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function maisonAmi(X, Y, a) {
    if (!a) {
      return '<rect x="' + (X + 3) + '" y="' + (Y + 12) + '" width="58" height="48" rx="3" fill="#a07a4c" opacity=".55"/>' +
        [12, 22, 32, 42, 52].map(k => '<path d="M' + (X + 6) + ' ' + (Y + k + 4) + 'h52" stroke="#7a5a33" stroke-width="1" opacity=".5"/>').join('') +
        [[4, 12], [60, 12], [4, 60], [60, 60], [32, 12]].map(c => '<rect x="' + (X + c[0] - 1.6) + '" y="' + (Y + c[1] - 9) + '" width="3.2" height="10" fill="#8d5a2b" stroke="' + OLB + '" stroke-width=".9"/>').join('') +
        '<path d="M' + (X + 4) + ' ' + (Y + 7) + 'H' + (X + 60) + 'M' + (X + 4) + ' ' + (Y + 7) + 'V' + (Y + 55) + 'M' + (X + 60) + ' ' + (Y + 7) + 'V' + (Y + 55) + '" stroke="#8d5a2b" stroke-width="1.6" fill="none"/>' +
        '<path d="M' + (X + 32) + ' ' + (Y + 52) + 'v-14" stroke="' + OLB + '" stroke-width="2.4"/><rect x="' + (X + 19) + '" y="' + (Y + 28) + '" width="26" height="12" rx="2" fill="#f3dfb4" stroke="' + OLB + '" stroke-width="1.2"/>' +
        '<text x="' + (X + 32) + '" y="' + (Y + 37) + '" text-anchor="middle" font-size="7.5" font-weight="900" fill="#4a2e17" font-family="Georgia, serif">Libre</text>';
    }
    var toit = a.couleur || '#c94a3f', ombre = fonce(toit, 0.72), trait = fonce(toit, 0.45), on = a.present;
    var fen = (x, y) => on ? fenetre(x, y, 11, 10)
      : '<rect x="' + x + '" y="' + y + '" width="11" height="10" rx="1" fill="#6b4626" stroke="' + OLB + '" stroke-width="1.2"/><path d="M' + (x + 5.5) + ' ' + y + 'v10M' + x + ' ' + (y + 3.5) + 'h11M' + x + ' ' + (y + 6.5) + 'h11" stroke="#4a2e17" stroke-width=".9"/>';
    return '<ellipse cx="' + (X + 32) + '" cy="' + (Y + 62) + '" rx="31" ry="4.5" fill="rgba(10,20,5,.32)"/>' +
      '<rect x="' + (X + 44) + '" y="' + (Y + 2) + '" width="8" height="16" fill="#a8a29e" stroke="' + OLB + '" stroke-width="1.3"/>' +
      (on ? '<g class="vl-fumee"><circle cx="' + (X + 48) + '" cy="' + (Y - 4) + '" r="3.5" fill="#fff" opacity=".7"/><circle cx="' + (X + 51) + '" cy="' + (Y - 11) + '" r="4.5" fill="#fff" opacity=".45"/></g>' : '') +
      '<rect x="' + (X + 5) + '" y="' + (Y + 26) + '" width="54" height="36" fill="#f3e0bd" stroke="' + OLB + '" stroke-width="1.6"/>' +
      '<rect x="' + (X + 5) + '" y="' + (Y + 55) + '" width="54" height="7" fill="#a8a29e" stroke="' + OLB + '" stroke-width="1.3"/>' +
      '<path d="M' + (X + 1) + ' ' + (Y + 29) + 'L' + (X + 32) + ' ' + (Y + 6) + 'L' + (X + 63) + ' ' + (Y + 29) + 'Z" fill="' + toit + '" stroke="' + OLB + '" stroke-width="1.7" stroke-linejoin="round"/>' +
      '<path d="M' + (X + 32) + ' ' + (Y + 8) + 'L' + (X + 60) + ' ' + (Y + 28) + 'H' + (X + 32) + 'Z" fill="' + ombre + '"/>' +
      [15, 22].map(yy => '<path d="M' + f(X + 32 - (yy - 6) * 1.3) + ' ' + (Y + yy) + 'H' + f(X + 32 + (yy - 6) * 1.3) + '" stroke="' + trait + '" stroke-width="1.1" stroke-dasharray="5 1.5"/>').join('') +
      fen(X + 10, Y + 36) + fen(X + 43, Y + 36) +
      '<rect x="' + (X + 25) + '" y="' + (Y + 41) + '" width="14" height="21" rx="6" fill="' + (on ? '#8d5a2b' : '#6b4626') + '" stroke="' + OLB + '" stroke-width="1.4"/>' +
      '<circle cx="' + (X + 35.5) + '" cy="' + (Y + 52) + '" r="1.2" fill="#fcc419"/>' +
      (on ? '<circle cx="' + (X + 32) + '" cy="' + (Y + 52) + '" r="14" fill="url(#vl-lueur)" opacity=".55" class="vl-halo"/>' : '') +
      panneau(X + 32, Y + 25, a.nom || '…', 54) +
      (on ? '' : '<g opacity=".85"><rect x="' + (X + 18) + '" y="' + (Y + 64) + '" width="28" height="9" rx="2" fill="#2b1a0e"/><text x="' + (X + 32) + '" y="' + (Y + 70.5) + '" text-anchor="middle" font-size="6" font-weight="800" fill="#e9dcc0" font-family="system-ui, sans-serif">absent</text></g>');
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }

  // Fontaine, tableau de quêtes, étal de Pipa
  function fontaine(X, Y) {
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 27) + '" rx="18" ry="6" fill="rgba(10,20,5,.3)"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 22) + '" rx="16.5" ry="8" fill="#8a847f" stroke="' + OLB + '" stroke-width="1.6"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 20) + '" rx="16.5" ry="7.5" fill="#bdb7b0" stroke="' + OLB + '" stroke-width="1.4"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 19.5) + '" rx="12.5" ry="5" fill="#4f9bd8"/><ellipse cx="' + (X + 13) + '" cy="' + (Y + 18) + '" rx="6" ry="2" fill="#8cc8f0"/>' +
      '<rect x="' + (X + 13.5) + '" y="' + (Y + 3) + '" width="5" height="16" rx="1.5" fill="#ced4da" stroke="' + OLB + '" stroke-width="1.2"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 4) + '" rx="6.5" ry="2.4" fill="#ced4da" stroke="' + OLB + '" stroke-width="1.2"/>' +
      '<g class="vl-eau"><path d="M' + (X + 11.5) + ' ' + (Y + 4) + 'q-4 4-5 12M' + (X + 20.5) + ' ' + (Y + 4) + 'q4 4 5 12" stroke="#d0ebff" stroke-width="1.8" fill="none"/>' +
      '<ellipse cx="' + (X + 8) + '" cy="' + (Y + 19) + '" rx="2.5" ry="1" fill="#fff"/><ellipse cx="' + (X + 24) + '" cy="' + (Y + 19) + '" rx="2.5" ry="1" fill="#fff"/></g>';
  }
  function tableau(X, Y) {
    return '<ellipse cx="' + (X + 17) + '" cy="' + (Y + 29) + '" rx="13" ry="3.2" fill="rgba(10,20,5,.3)"/>' +
      '<path d="M' + (X + 6) + ' ' + (Y + 30) + 'V' + (Y + 6) + 'M' + (X + 26) + ' ' + (Y + 30) + 'V' + (Y + 6) + '" stroke="' + OLB + '" stroke-width="4.6"/><path d="M' + (X + 6) + ' ' + (Y + 30) + 'V' + (Y + 6) + 'M' + (X + 26) + ' ' + (Y + 30) + 'V' + (Y + 6) + '" stroke="#7a4a26" stroke-width="2.6"/>' +
      '<rect x="' + (X + 1) + '" y="' + (Y + 2) + '" width="30" height="20" rx="2" fill="#a0652e" stroke="' + OLB + '" stroke-width="1.5"/>' +
      '<path d="M' + (X - 1) + ' ' + (Y + 3) + 'l17-7 17 7z" fill="#6b4626" stroke="' + OLB + '" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<rect x="' + (X + 4) + '" y="' + (Y + 5) + '" width="10" height="12" fill="#fff8e7" stroke="#c9a874" stroke-width=".6" transform="rotate(-5 ' + (X + 9) + ' ' + (Y + 11) + ')"/><rect x="' + (X + 17) + '" y="' + (Y + 6) + '" width="10" height="9" fill="#fff3bf" stroke="#c9a874" stroke-width=".6" transform="rotate(4 ' + (X + 22) + ' ' + (Y + 10) + ')"/>' +
      '<path d="M' + (X + 6) + ' ' + (Y + 9) + 'h6M' + (X + 6) + ' ' + (Y + 12) + 'h5M' + (X + 6) + ' ' + (Y + 15) + 'h6M' + (X + 19) + ' ' + (Y + 9) + 'h6M' + (X + 19) + ' ' + (Y + 12) + 'h4" stroke="#6b5644" stroke-width=".8"/>' +
      '<circle cx="' + (X + 9) + '" cy="' + (Y + 5.5) + '" r="1.2" fill="#e03131"/><circle cx="' + (X + 22) + '" cy="' + (Y + 6.5) + '" r="1.2" fill="#1c7ed6"/>';
  }
  function etal(X, Y) {   // deux cases de large ; Pipa derrière le comptoir
    return '<ellipse cx="' + (X + 32) + '" cy="' + (Y + 30) + '" rx="31" ry="3.8" fill="rgba(10,20,5,.3)"/>' +
      '<path d="M' + (X + 4) + ' ' + (Y + 30) + 'V' + (Y - 8) + 'M' + (X + 60) + ' ' + (Y + 30) + 'V' + (Y - 8) + '" stroke="' + OLB + '" stroke-width="4.4"/><path d="M' + (X + 4) + ' ' + (Y + 30) + 'V' + (Y - 8) + 'M' + (X + 60) + ' ' + (Y + 30) + 'V' + (Y - 8) + '" stroke="#7a4a26" stroke-width="2.4"/>' +
      '<svg x="' + (X + 14) + '" y="' + (Y - 19) + '" width="36" height="41" viewBox="0 0 40 46">' + HABITANTS.chat() + '</svg>' +
      '<rect x="' + (X + 2) + '" y="' + (Y + 12) + '" width="60" height="17" rx="2" fill="#a0652e" stroke="' + OLB + '" stroke-width="1.5"/><path d="M' + (X + 2) + ' ' + (Y + 18) + 'h60M' + (X + 22) + ' ' + (Y + 18) + 'v11M' + (X + 42) + ' ' + (Y + 18) + 'v11" stroke="#6b4626" stroke-width="1.1"/>' +
      [[10, 10, '#e03131'], [16, 10, '#f03e3e'], [13, 6.5, '#c92a2a']].map(c => '<circle cx="' + (X + c[0]) + '" cy="' + (Y + c[1]) + '" r="3.6" fill="' + c[2] + '" stroke="' + OLB + '" stroke-width=".8"/>').join('') +
      '<rect x="' + (X + 44) + '" y="' + (Y + 4) + '" width="7" height="8" rx="1.5" fill="#9775fa" stroke="' + OLB + '" stroke-width=".9"/><rect x="' + (X + 52) + '" y="' + (Y + 6) + '" width="6" height="6" rx="1.5" fill="#63e6be" stroke="' + OLB + '" stroke-width=".9"/>' +
      '<path d="M' + (X) + ' ' + (Y - 4) + 'L' + (X + 4) + ' ' + (Y - 16) + 'H' + (X + 60) + 'L' + (X + 64) + ' ' + (Y - 4) + 'Z" fill="#fff4e6" stroke="' + OLB + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      [0, 1, 2, 3, 4].map(k => '<path d="M' + (X + 4 + k * 12) + ' ' + (Y - 16) + 'h6L' + (X + 9 + k * 13) + ' ' + (Y - 4) + 'h-6.5z" fill="#d9480f"/>').join('') +
      [0, 1, 2, 3, 4].map(k => '<path d="M' + f(X + k * 12.8) + ' ' + (Y - 4) + 'a6.4 4 0 0 0 12.8 0" fill="' + (k % 2 ? '#fff4e6' : '#d9480f') + '" stroke="' + OLB + '" stroke-width="1"/>').join('');
  }
  function bulleQuete(X, Y, m) {
    if (!m) return '';
    var c = m === '?' ? '#2f9e44' : '#f59f00';
    return '<g class="vl-bulle"><circle cx="' + X + '" cy="' + Y + '" r="7.5" fill="#fff8e7" stroke="' + OLB + '" stroke-width="2.6"/><circle cx="' + X + '" cy="' + Y + '" r="6.2" fill="#fff8e7" stroke="' + c + '" stroke-width="1.6"/><text x="' + X + '" y="' + (Y + 4) + '" text-anchor="middle" font-size="11" font-weight="900" fill="' + c + '" font-family="system-ui,sans-serif">' + m + '</text></g>';
  }

  // ---------- Un écran du monde ----------
  // ctx = { flair, plaque, marques: { habitant: '!' | '?' }, tableauMarque, gardien }
  // Lanternes aux portes du village (posées sur la haie, de chaque côté des passages)
  var LANTERNES_VILLAGE = [[4, 0], [6, 0], [4, 8], [6, 8], [0, 3], [0, 5], [10, 3], [10, 5]];
  function ecranSvg(e, ex, ey, ctx) {
    ctx = ctx || {};
    var x0 = ex * VL.W, y0 = ey * VL.H, s = [], objets = [], x, y, t, X, Y, h;
    var E = VL.ECRANS[ey][ex], village = E.id === 'village' || E.id === 'quartier';   // pavés au village et dans le quartier
    var tu = (xx, yy) => VL.tuile(xx, yy);
    var chemin = c => c === ':' || c === '=' || c === 'F';   // la fontaine est posée sur les pavés de la place
    var foret = c => c === 'T' || c === 'S';
    s.push('<defs><radialGradient id="vl-lueur"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset=".55" stop-color="#ffb347" stop-opacity=".28"/><stop offset="1" stop-color="#ff922b" stop-opacity="0"/></radialGradient>' +
           '<radialGradient id="vl-braise"><stop offset="0" stop-color="#ff8a3d" stop-opacity=".7"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>' +
           '<radialGradient id="vl-cristal"><stop offset="0" stop-color="#d0bfff" stop-opacity=".75"/><stop offset="1" stop-color="#9775fa" stop-opacity="0"/></radialGradient>' +
           '<radialGradient id="vl-magie"><stop offset="0" stop-color="#fff3bf" stop-opacity=".7"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>' +
           '<radialGradient id="vl-vig" cx="50%" cy="52%" r="72%"><stop offset="58%" stop-color="#1a1208" stop-opacity="0"/><stop offset="100%" stop-color="#1a1208" stop-opacity=".55"/></radialGradient>' +
           '<linearGradient id="vl-soleil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4" stop-opacity=".18"/><stop offset=".5" stop-color="#fff2c4" stop-opacity="0"/><stop offset="1" stop-color="#3a2410" stop-opacity=".16"/></linearGradient></defs>');
    // Herbe : deux verts en damier très doux, taches plus sombres, brins et petites fleurs ; sous-bois sombre sous les arbres
    s.push('<rect width="352" height="288" fill="#77b052"/>');
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      var gx = x0 + x, gy = y0 + y; t = tu(gx, gy); X = x * T; Y = y * T; h = VL.hash(gx, gy);
      if (foret(t)) { s.push('<rect x="' + X + '" y="' + Y + '" width="32" height="32" fill="' + ((x + y) % 2 ? '#2f5a28' : '#33612b') + '"/>'); continue; }
      if ((x + y) % 2) s.push('<rect x="' + X + '" y="' + Y + '" width="32" height="32" fill="#71a94d"/>');
      if (h < 0.3) s.push('<ellipse cx="' + f(X + 8 + h * 50) + '" cy="' + f(Y + 10 + h * 40) + '" rx="' + f(7 + h * 10) + '" ry="' + f(4 + h * 6) + '" fill="#679e45" opacity=".8"/>');
      var h2 = VL.hash(gx, gy, 9);
      s.push('<path d="M' + f(X + 4 + h2 * 20) + ' ' + f(Y + 26 - h * 14) + 'l1.5-4.5 1.5 4.5 1.5-3.5M' + f(X + 18 - h * 10) + ' ' + f(Y + 12 + h2 * 14) + 'l1.5-4 1.5 4" stroke="#5a913b" stroke-width="1.2" fill="none" stroke-linecap="round"/>');
      if (h2 > 0.88) s.push('<circle cx="' + f(X + 6 + h * 20) + '" cy="' + f(Y + 6 + h2 * 16) + '" r="1.3" fill="#fff8e7"/>');
    }
    // Ombre du sous-bois sur l'herbe qui le touche (les bois font comme les murs du Donjon)
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      t = tu(x0 + x, y0 + y); if (foret(t) || MARCHE_EAU[t]) continue;
      X = x * T; Y = y * T;
      if (foret(tu(x0 + x, y0 + y - 1))) s.push('<rect x="' + X + '" y="' + Y + '" width="32" height="7" fill="#1d3a16" opacity=".22"/>');
      if (foret(tu(x0 + x - 1, y0 + y))) s.push('<rect x="' + X + '" y="' + Y + '" width="5" height="32" fill="#1d3a16" opacity=".16"/>');
    }
    // Eau (ruisseau, mare) : formes arrondies comme les chemins, berge de sable, profonde au milieu, nénuphars
    var eau = c => c === null || !!MARCHE_EAU[c];
    [['#8a6a46', 17.5, 35, 13], ['#d9c08a', 16, 32, 12], ['#3f8ccc', 13, 26, 9]].forEach(st => {
      for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
        t = tu(x0 + x, y0 + y); if (!MARCHE_EAU[t]) continue;
        X = x * T + 16; Y = y * T + 16;
        s.push('<rect x="' + f(X - st[1]) + '" y="' + f(Y - st[1]) + '" width="' + st[2] + '" height="' + st[2] + '" rx="' + st[3] + '" fill="' + st[0] + '"/>');
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(v => {
          if (!eau(tu(x0 + x + v[0], y0 + y + v[1]))) return;
          if (v[0]) s.push('<rect x="' + (v[0] > 0 ? X : X - 17) + '" y="' + f(Y - st[1]) + '" width="17" height="' + st[2] + '" fill="' + st[0] + '"/>');
          else s.push('<rect x="' + f(X - st[1]) + '" y="' + (v[1] > 0 ? Y : Y - 17) + '" width="' + st[2] + '" height="17" fill="' + st[0] + '"/>');
        });
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(v => {
          if (eau(tu(x0 + x + v[0], y0 + y)) && eau(tu(x0 + x, y0 + y + v[1])) && eau(tu(x0 + x + v[0], y0 + y + v[1])))
            s.push('<rect x="' + (v[0] > 0 ? X : X - 17) + '" y="' + (v[1] > 0 ? Y : Y - 17) + '" width="17" height="17" fill="' + st[0] + '"/>');
        });
      }
    });
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      t = tu(x0 + x, y0 + y); if (!MARCHE_EAU[t]) continue;
      X = x * T; Y = y * T; h = VL.hash(x0 + x, y0 + y, 3);
      s.push('<ellipse cx="' + (X + 16) + '" cy="' + (Y + 16) + '" rx="10" ry="7" fill="#2f74b2" opacity=".55"/>');
      s.push('<path class="vl-vague" d="M' + f(X + 5 + h * 10) + ' ' + f(Y + 10 + h * 8) + 'q3-3 6 0t6 0" stroke="#bfe3fb" stroke-width="1.4" fill="none" opacity=".85"/>');
      if (h > 0.72 && t === '~') s.push('<ellipse cx="' + f(X + 10 + h * 8) + '" cy="' + f(Y + 20) + '" rx="4.5" ry="3" fill="#4c9a3c" stroke="' + OL + '" stroke-width=".8"/><path d="M' + f(X + 10 + h * 8) + ' ' + (Y + 20) + 'l4-1.5" stroke="#3f8ccc" stroke-width="1.2"/><circle cx="' + f(X + 12 + h * 8) + '" cy="' + (Y + 18.5) + '" r="1.6" fill="#f783ac"/>');
      if (!eau(tu(x0 + x, y0 + y + 1))) s.push('<circle cx="' + f(X + 6 + h * 20) + '" cy="' + (Y + 30) + '" r="1.8" fill="#9e9e9e" stroke="#4a4a4a" stroke-width=".6"/>');
      if (!eau(tu(x0 + x, y0 + y - 1))) s.push('<circle cx="' + f(X + 24 - h * 16) + '" cy="' + (Y + 2) + '" r="1.6" fill="#9e9e9e" stroke="#4a4a4a" stroke-width=".6"/>');
    }
    // Chemins : terre battue dans la forêt, pavés au village (comme le sol du Donjon)
    var bord = village ? '#6f675b' : '#9c7a48', fond = village ? '#b9b0a2' : '#d6b47a';
    [[bord, 14.5, 29], [fond, 12.5, 25]].forEach(st => {
      for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
        t = tu(x0 + x, y0 + y); if (t !== ':' && t !== 'F') continue;
        X = x * T + 16; Y = y * T + 16;
        s.push('<rect x="' + f(X - st[1]) + '" y="' + f(Y - st[1]) + '" width="' + st[2] + '" height="' + st[2] + '" rx="' + (village ? 4 : st[1]) + '" fill="' + st[0] + '"/>');
        // Coin rentrant (trois cases de chemin autour) : on remplit le quart de case, sinon un petit carré d'herbe reste
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(v => {
          if (chemin(tu(x0 + x + v[0], y0 + y)) && chemin(tu(x0 + x, y0 + y + v[1])) && chemin(tu(x0 + x + v[0], y0 + y + v[1])))
            s.push('<rect x="' + (v[0] > 0 ? X : X - 16) + '" y="' + (v[1] > 0 ? Y : Y - 16) + '" width="16" height="16" fill="' + st[0] + '"/>');
        });
        if (chemin(tu(x0 + x + 1, y0 + y))) s.push('<rect x="' + X + '" y="' + f(Y - st[1]) + '" width="16" height="' + st[2] + '" fill="' + st[0] + '"/>');
        if (chemin(tu(x0 + x - 1, y0 + y))) s.push('<rect x="' + (X - 16) + '" y="' + f(Y - st[1]) + '" width="16" height="' + st[2] + '" fill="' + st[0] + '"/>');
        if (chemin(tu(x0 + x, y0 + y + 1))) s.push('<rect x="' + f(X - st[1]) + '" y="' + Y + '" width="' + st[2] + '" height="16" fill="' + st[0] + '"/>');
        if (chemin(tu(x0 + x, y0 + y - 1))) s.push('<rect x="' + f(X - st[1]) + '" y="' + (Y - 16) + '" width="' + st[2] + '" height="16" fill="' + st[0] + '"/>');
      }
    });
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      t = tu(x0 + x, y0 + y); X = x * T; Y = y * T; h = VL.hash(x0 + x, y0 + y, 5);
      if (t === ':') {
        if (village) {   // pavés en quinconce
          for (var py = 0; py < 4; py++) for (var px = 0; px < 3; px++) {
            var ox = X + 2 + px * 10 + (py % 2 ? 5 : 0), oy = Y + 2 + py * 7.5;
            if (ox + 8 > X + 31) continue;
            s.push('<rect x="' + f(ox) + '" y="' + f(oy) + '" width="8.5" height="6" rx="2" fill="' + (VL.hash(x0 + x, y0 + y, px + py * 3) > 0.5 ? '#cbc3b4' : '#c2b9a9') + '" stroke="#8f8676" stroke-width=".8"/>');
          }
        } else {
          if (h < 0.6) s.push('<circle cx="' + f(X + 8 + h * 26) + '" cy="' + f(Y + 20 - h * 12) + '" r="1.8" fill="#b08a55" stroke="#7a5a33" stroke-width=".5"/><circle cx="' + f(X + 22 - h * 10) + '" cy="' + f(Y + 9 + h * 18) + '" r="1.3" fill="#c49c62"/>');
          s.push('<path d="M' + f(X + 9 + h * 4) + ' ' + (Y + 6) + 'q-2 10 1 20M' + f(X + 22 - h * 4) + ' ' + (Y + 6) + 'q2 10-1 20" stroke="#c09a60" stroke-width="1.2" fill="none" opacity=".55"/>');
        }
      }
      if (t === ',') {   // fleurs
        [[7, 9], [20, 7], [13, 20], [25, 22]].forEach((p, k) => {
          var c = ['#fff', '#ffd43b', '#f783ac', '#b197fc'][Math.floor(VL.hash(x0 + x, y0 + y, k) * 4)];
          s.push('<path d="M' + (X + p[0]) + ' ' + (Y + p[1] + 2) + 'v4" stroke="#3f7a2c" stroke-width="1.1"/><circle cx="' + (X + p[0]) + '" cy="' + (Y + p[1]) + '" r="2.6" fill="' + c + '" stroke="#5a4a2a" stroke-width=".5"/><circle cx="' + (X + p[0]) + '" cy="' + (Y + p[1]) + '" r=".9" fill="#f08c00"/>');
        });
      }
      if (t === '=') {   // pont de planches (le chemin le traverse de haut en bas)
        s.push('<rect x="' + (X + 3) + '" y="' + (Y - 3) + '" width="26" height="38" fill="' + OLB + '"/><rect x="' + (X + 4.5) + '" y="' + (Y - 2) + '" width="23" height="36" fill="#c08a4e"/>' +
               [3, 10, 17, 24].map(k => '<path d="M' + (X + 4) + ' ' + (Y + k) + 'h24" stroke="#7a5230" stroke-width="1.2"/>').join('') +
               '<path d="M' + (X + 2) + ' ' + (Y - 3) + 'v38M' + (X + 30) + ' ' + (Y - 3) + 'v38" stroke="' + OLB + '" stroke-width="4"/><path d="M' + (X + 2) + ' ' + (Y - 3) + 'v38M' + (X + 30) + ' ' + (Y - 3) + 'v38" stroke="#8d5a2b" stroke-width="2"/>');
      }
    }
    // Flèches vers l'écran voisin, sur les passages du bord
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      if (x !== 0 && y !== 0 && x !== VL.W - 1 && y !== VL.H - 1) continue;
      t = tu(x0 + x, y0 + y); if (t !== ':') continue;
      var d = x === 0 ? 'g' : x === VL.W - 1 ? 'd' : y === 0 ? 'h' : 'b', cx = x * T + 16, cy = y * T + 16;
      var vx = x0 + x + (d === 'g' ? -1 : d === 'd' ? 1 : 0), vy = y0 + y + (d === 'h' ? -1 : d === 'b' ? 1 : 0);
      if (E.defile && VL.defile(vx, vy)) continue;   // dans le quartier, la rue continue : pas de flèche
      var rot = { h: 0, d: 90, b: 180, g: 270 }[d];
      s.push('<g class="vl-fleche" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"><path d="M' + (cx - 6) + ' ' + (cy + 3) + 'l6-6 6 6" stroke="' + OLB + '" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>' +
             '<path d="M' + (cx - 6) + ' ' + (cy + 3) + 'l6-6 6 6" stroke="#ffd43b" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>');
    }
    // Objets posés, dessinés de haut en bas (les plus bas passent devant)
    function poser(rang, svg) { objets.push([rang, svg]); }
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      var gx2 = x0 + x, gy2 = y0 + y; t = tu(gx2, gy2); X = x * T; Y = y * T; h = VL.hash(gx2, gy2, 1);
      if (t === 'T') poser(y, arbre(X, Y, h));
      else if (t === 'S') poser(y, sapin(X, Y, h));
      else if (t === 'b') poser(y, buisson(X, Y, h));
      else if (t === 'h') poser(y, haie(X, Y, h, tu(gx2 - 1, gy2) === 'h', tu(gx2 + 1, gy2) === 'h'));
      else if (t === 'o') poser(y, souche(X, Y));
      else if (t === 'F') poser(y, fontaine(X, Y));
      else if (t === 'Q') poser(y, tableau(X, Y) + bulleQuete(X + 16, Y - 9, ctx.tableauMarque));
      else if (t === 'c') poser(y, coffre(X, Y, e.coffre));
      else if (t === 'e') poser(y, etabli(X, Y, ctx.atelier));
      else if (VL.OBSTACLES[t]) poser(y - 0.1, obstacle(t, X, Y, VL.ouvert(e, gx2, gy2), ctx.flair));
      if (t === 'm' && tu(gx2 - 1, gy2) !== 'm') poser(y, etal(X, Y) + bulleQuete(X + 32, Y - 26, ctx.marques && ctx.marques.pipa));
    }
    if (E.id === 'village') LANTERNES_VILLAGE.forEach(p => poser(p[1] + 0.3, lanterne(p[0] * T + 16, p[1] * T + 24)));
    VL.BATIMENTS.forEach(b => {
      var c = VL.ecranDe(b.x, b.y);
      if (c.ex !== ex || c.ey !== ey) return;
      poser(b.y - y0 + b.h - 1 + 0.2, batiment(b, (b.x - x0) * T, (b.y - y0) * T, ctx));
    });
    VL.CHAMPIGNONS.forEach(c => {
      var k = VL.ecranDe(c.x, c.y);
      if (k.ex === ex && k.ey === ey && VL.champignonVisible(e, c)) poser(c.y - y0 - 0.05, champignon((c.x - x0) * T, (c.y - y0) * T));
    });
    VL.RECOLTE.forEach(p => {
      var k = VL.ecranDe(p.x, p.y);
      if (k.ex === ex && k.ey === ey && VL.pointVisible(e, p, ctx)) poser(p.y - y0 - 0.05, pointRecolte(p, (p.x - x0) * T, (p.y - y0) * T, ctx));
    });
    Object.keys(VL.HABITANTS).forEach(id => {
      var H = VL.HABITANTS[id], k = VL.ecranDe(H.x, H.y);
      if (H.etal || k.ex !== ex || k.ey !== ey) return;
      var hx = (H.x - x0) * T, hy = (H.y - y0) * T;
      poser(H.y - y0 + 0.1, '<ellipse cx="' + (hx + 16) + '' + '" cy="' + (hy + 30) + '" rx="12" ry="3.4" fill="rgba(10,20,5,.32)"/><g class="vl-respire"><svg x="' + (hx - 7) + '" y="' + (hy - 20) + '" width="46" height="53" viewBox="0 0 40 46">' + HABITANTS[H.espece]() + '</svg></g>' +
        bulleQuete(hx + 16, hy - 24, ctx.marques && ctx.marques[id]));
    });
    objets.sort((a, b) => a[0] - b[0]).forEach(o => s.push(o[1]));
    // Lumière de fin d'après-midi et bords plus sombres, comme dans les pièces du Donjon
    // Lumière et bords assombris (sauf dans le quartier qui défile : la page les pose sur la fenêtre de vue)
    if (!ctx.sansVoile) s.push('<rect width="352" height="288" fill="url(#vl-soleil)"/><rect width="352" height="288" fill="url(#vl-vig)"/>');
    return s.join('');
  }

  // ---------- La carte du monde, sous le brouillard (10 unités par case) ----------
  var COUL = { '.': '#a9d18e', ',': '#b8dc96', ':': '#e7cf9b', '=': '#c08a4e', T: '#5d9b4c', S: '#4b8650', b: '#77b35f', h: '#6aa653', o: '#a9d18e',
               '~': '#7fbde8', x: '#c98a6a', e: '#b07a45', m: '#e8590c', Q: '#b07a45', F: '#9ab', c: '#a9d18e', r: '#3d7a3a', R: '#9e9e9e', v: '#6b5040', s: '#3f7a35' };
  // ctx = { cible: { x, y }, marques: { habitant: m }, tableauMarque, ecranVu: { 'ex,ey': 1 } }
  function carteSvg(e, ctx) {
    ctx = ctx || {};
    var U = 10, s = [], b = VL.bits(e), x, y;
    s.push('<defs><pattern id="vl-hachure" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="8" height="8" fill="#ead8b0"/><path d="M0 0v8" stroke="#dcc597" stroke-width="2"/></pattern>' +
           '<filter id="vl-flou" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>');
    s.push('<rect width="' + (VL.LARG * U) + '" height="' + (VL.HAUT * U) + '" fill="url(#vl-hachure)"/>');
    // Ce qui est découvert : un masque flou donne un bord de brouillard doux
    var vus = [];
    for (y = 0; y < VL.HAUT; y++) for (x = 0; x < VL.LARG; x++) if (VL.estVu(e, x, y, b)) vus.push('<rect x="' + (x * U - 1) + '" y="' + (y * U - 1) + '" width="' + (U + 2) + '" height="' + (U + 2) + '" fill="#fff"/>');
    s.push('<mask id="vl-masque"><rect width="100%" height="100%" fill="#000"/><g filter="url(#vl-flou)">' + vus.join('') + '</g></mask>');
    var terre = [];
    for (y = 0; y < VL.HAUT; y++) for (x = 0; x < VL.LARG; x++) {
      var t = VL.tuile(x, y);
      if (t === null) continue;   // hors du monde (au nord et au sud du quartier)
      if (VL.OBSTACLES[t] && VL.ouvert(e, x, y)) t = '.';
      terre.push('<rect x="' + (x * U) + '" y="' + (y * U) + '" width="' + (U + 0.4) + '" height="' + (U + 0.4) + '" fill="' + (COUL[t] || '#a9d18e') + '"/>');
      if (t === 'T' || t === 'S') terre.push('<circle cx="' + (x * U + 5) + '" cy="' + (y * U + 5) + '" r="4" fill="' + (t === 'S' ? '#3d7344' : '#4d8a3e') + '"/>');
    }
    VL.BATIMENTS.forEach(bt => terre.push('<rect x="' + (bt.x * U + 1) + '" y="' + (bt.y * U + 1) + '" width="' + (bt.w * U - 2) + '" height="' + (bt.h * U - 2) + '" rx="2" fill="' +
      (bt.type === 'parcelle' ? ((ctx.parcelles && ctx.parcelles[bt.p] && ctx.parcelles[bt.p].couleur) || '#b7a184') : ({ maison: '#d9534f', hutte: '#d4a24c', forge: '#495057', crypte: '#868e96', cabane: '#6b8e3a', chene: '#3a8435' })[bt.type]) + '" stroke="rgba(0,0,0,.35)" stroke-width="1"/>'));
    s.push('<g mask="url(#vl-masque)">' + terre.join('') + '</g>');
    // Repères des lieux découverts
    var ICO = { maison: '🏠', hutte: '🌿', forge: '⚒️', crypte: '🗝️', cabane: '🛖', chene: '🌳' };
    VL.BATIMENTS.forEach(bt => {
      if (!ICO[bt.type] || !VL.estVu(e, bt.x + (bt.w >> 1), bt.y + bt.h - 1, b)) return;
      s.push('<text x="' + ((bt.x + bt.w / 2) * U) + '" y="' + ((bt.y + bt.h / 2) * U + 5) + '" text-anchor="middle" font-size="13">' + ICO[bt.type] + '</text>');
    });
    // Points de récolte encore là aujourd'hui (les cristaux se voient même sous le brouillard avec le Flair)
    var COUL_RES = { bois: '#8d5a2b', pierre: '#868e96', plante: '#40c057', cristal: '#9775fa' };
    VL.RECOLTE.forEach(p => {
      if (!VL.pointVisible(e, p, ctx)) return;
      var vu = VL.estVu(e, p.x, p.y, b);
      if (!vu && !(ctx.flair && p.res === 'cristal')) return;
      s.push('<rect x="' + (p.x * U + 2) + '" y="' + (p.y * U + 2) + '" width="6" height="6" rx="' + (p.res === 'cristal' ? 1 : 3) + '" transform="' + (p.res === 'cristal' ? 'rotate(45 ' + (p.x * U + 5) + ' ' + (p.y * U + 5) + ')' : '') + '" fill="' + COUL_RES[p.res] + '" stroke="#fff" stroke-width="1.2"' + (vu ? '' : ' class="vl-scintille"') + '/>');
    });
    // Habitants et tableau : « ! » ou « ? » s'ils attendent quelque chose
    Object.keys(VL.HABITANTS).forEach(id => {
      var H = VL.HABITANTS[id], m = ctx.marques && ctx.marques[id];
      if (!VL.estVu(e, H.x, H.y, b)) return;
      s.push('<circle cx="' + (H.x * U + 5) + '" cy="' + (H.y * U + 5) + '" r="4" fill="#fff" stroke="#6d4520" stroke-width="1.2"/>');
      if (m) s.push('<text x="' + (H.x * U + 5) + '" y="' + (H.y * U - 1) + '" text-anchor="middle" font-size="10" font-weight="900" fill="' + (m === '?' ? '#2f9e44' : '#e67700') + '" stroke="#fff" stroke-width="2.5" paint-order="stroke">' + m + '</text>');
    });
    var tq = VL.ACTIONS && Object.keys(VL.ACTIONS).find(k => VL.ACTIONS[k].id === 'tableau');
    if (tq && ctx.tableauMarque) { var p = tq.split(',').map(Number); if (VL.estVu(e, p[0], p[1], b)) s.push('<text x="' + (p[0] * U + 5) + '" y="' + (p[1] * U - 1) + '" text-anchor="middle" font-size="10" font-weight="900" fill="' + (ctx.tableauMarque === '?' ? '#2f9e44' : '#e67700') + '" stroke="#fff" stroke-width="2.5" paint-order="stroke">' + ctx.tableauMarque + '</text>'); }
    // Grille des écrans
    VL.ECRANS.forEach((l, ey) => l.forEach((E, ex) => { if (E) s.push('<rect x="' + (ex * VL.W * U) + '" y="' + (ey * VL.H * U) + '" width="' + (VL.W * U) + '" height="' + (VL.H * U) + '" fill="none" stroke="#8a6a46" stroke-width="1" stroke-dasharray="3 4" opacity=".45"/>'); }));
    // Cadre de vieille carte
    s.push('<rect x="1" y="1" width="' + (VL.LARG * U - 2) + '" height="' + (VL.HAUT * U - 2) + '" rx="6" fill="none" stroke="#8a6a46" stroke-width="2"/>');
    return s.join('');
  }
  // Ce qui bouge à chaque pas (dessiné par-dessus, pour ne pas tout redessiner) : l'écran où je suis, la quête suivie, moi
  function carteDessus(e, ctx) {
    ctx = ctx || {};
    var U = 10, s = [], ec = VL.ecranDe(e.x, e.y), x0 = ctx.x0 != null ? ctx.x0 : ec.ex * VL.W;   // x0 : la fenêtre de vue (le quartier défile)
    s.push('<rect x="' + (x0 * U + 1.5) + '" y="' + (ec.ey * VL.H * U + 1.5) + '" width="' + (VL.W * U - 3) + '" height="' + (VL.H * U - 3) + '" rx="4" fill="none" stroke="#fff" stroke-width="2.5" opacity=".9"/>');
    // La quête suivie : un anneau qui palpite
    if (ctx.cible) s.push('<circle class="vl-cible" cx="' + (ctx.cible.x * U + 5) + '" cy="' + (ctx.cible.y * U + 5) + '" r="8" fill="none" stroke="#f59f00" stroke-width="2.5"/>');
    // Les amis dans la Vallée (3.51) : un point à leur couleur
    (ctx.amis || []).forEach(a => s.push('<circle cx="' + (a.x * U + 5) + '" cy="' + (a.y * U + 5) + '" r="4.5" fill="' + (a.couleur || '#3498db') + '" stroke="#fff" stroke-width="1.6"/>'));
    // Moi
    s.push('<circle cx="' + (e.x * U + 5) + '" cy="' + (e.y * U + 5) + '" r="5.5" fill="#ff922b" stroke="#fff" stroke-width="2" class="vl-moi"/>');
    return s.join('');
  }

  // ---------- Petite scène de l'accueil (158 × 116, comme celle du Donjon) ----------
  function sceneAccueil(dessinCp) {
    var t = [];
    t.push('<defs><linearGradient id="vla-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec5f0"/><stop offset="1" stop-color="#d7ecfa"/></linearGradient>' +
           '<linearGradient id="vla-fondu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f6b3a"/><stop offset="1" stop-color="#2f6b3a" stop-opacity="0"/></linearGradient></defs>');
    t.push('<rect width="158" height="116" fill="url(#vla-ciel)"/>');
    t.push('<circle cx="132" cy="18" r="9" fill="#ffe066"/><circle cx="132" cy="18" r="13" fill="#ffe066" opacity=".25"/>');
    t.push('<g class="vla-nuage"><ellipse cx="70" cy="16" rx="12" ry="4.5" fill="#fff"/><ellipse cx="78" cy="13" rx="8" ry="5" fill="#fff"/></g>');
    // Collines et forêt au loin
    t.push('<path d="M0 54q30-22 60-6t55-8 43 4V116H0z" fill="#7fb36a"/><path d="M0 64q40-18 80-4t78-6V116H0z" fill="#6aa357"/>');
    [[8, 52], [18, 48], [30, 50], [120, 45], [132, 48], [146, 44], [104, 50]].forEach(p => t.push('<path d="M' + p[0] + ' ' + (p[1] - 13) + 'l6 13h-12z" fill="#3d7344"/>'));
    // La crypte sur sa colline
    t.push('<path d="M90 44h16v-6l-8-6-8 6z" fill="#adb5bd" stroke="#495057" stroke-width=".8"/><path d="M96 44v-4a2 2 0 0 1 4 0v4z" fill="#212529"/>');
    // Prairie et chemin
    t.push('<path d="M0 78q50-12 100-2t58-4V116H0z" fill="#8fcf6b"/>');
    t.push('<path d="M66 116q4-22 20-30t16-12" stroke="#e6c992" stroke-width="9" fill="none" stroke-linecap="round"/>');
    // Maisons du village
    t.push('<rect x="98" y="62" width="22" height="16" fill="#fbecd0" stroke="#8a6a46" stroke-width=".9"/><path d="M95 63l14-11 14 11z" fill="#d9534f" stroke="#8a2c29" stroke-width=".9"/><rect x="106" y="69" width="6" height="9" fill="#8d5a2b"/><rect x="101" y="66" width="4" height="4" fill="#ffe8a3"/>');
    t.push('<rect x="126" y="66" width="18" height="13" fill="#e9d3a8" stroke="#8a6a46" stroke-width=".9"/><path d="M123 67q12-14 24 0z" fill="#d4a24c" stroke="#8a6315" stroke-width=".9"/>');
    t.push('<g class="vla-fumee"><circle cx="117" cy="49" r="2.5" fill="#fff" opacity=".7"/><circle cx="119" cy="43" r="3.2" fill="#fff" opacity=".45"/></g><rect x="114" y="52" width="4" height="7" fill="#a35a3c"/>');
    // Arbres devant
    t.push('<circle cx="150" cy="86" r="10" fill="#3f8f3a"/><circle cx="142" cy="92" r="8" fill="#4a9e3f"/><rect x="148" y="94" width="3" height="10" fill="#7a5230"/>');
    // Fleurs
    [[20, 100, '#fff'], [34, 106, '#ffd43b'], [52, 98, '#f783ac'], [122, 104, '#fff'], [134, 110, '#ffd43b']].forEach(p => t.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.8" fill="' + p[2] + '"/>'));
    // Mon compagnon sur le chemin
    if (dessinCp) t.push('<ellipse cx="72" cy="108" rx="14" ry="2.6" fill="rgba(0,0,0,.25)"/><svg x="50" y="62" width="44" height="47" viewBox="0 -6 200 216">' + dessinCp + '</svg>');
    else t.push('<g transform="translate(64 84)"><circle r="9" fill="#fff8e7" stroke="#8a6a46" stroke-width="1.5"/><path d="M0-6l2.5 6L0 6l-2.5-6z" fill="#e03131"/></g>');
    t.push('<rect width="44" height="116" fill="url(#vla-fondu)"/>');
    return t.join('');
  }

  return { habitant: habitant, ecranSvg: ecranSvg, carteSvg: carteSvg, carteDessus: carteDessus, sceneAccueil: sceneAccueil, HABITANTS: HABITANTS };
})();
