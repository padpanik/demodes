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

  // ---------- Petits morceaux de décor ----------
  function arbre(X, Y, h) {
    var c = ['#3f8f3a', '#4a9e3f', '#3a8435'][Math.floor(h * 3)], c2 = ['#56ad49', '#62b851', '#4f9d43'][Math.floor(h * 3)];
    var dx = f((h - 0.5) * 4);
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 29) + '" rx="12" ry="3.5" fill="rgba(0,0,0,.18)"/>' +
      '<path d="M' + (X + 13) + ' ' + (Y + 30) + 'l1.5-10h3l1.5 10z" fill="#7a5230"/>' +
      '<circle cx="' + f(X + 9 + dx) + '" cy="' + (Y + 12) + '" r="9.5" fill="' + c + '"/><circle cx="' + f(X + 23 + dx) + '" cy="' + (Y + 12) + '" r="9.5" fill="' + c + '"/>' +
      '<circle cx="' + f(X + 16 + dx) + '" cy="' + (Y + 3) + '" r="11" fill="' + c + '"/><circle cx="' + f(X + 16 + dx) + '" cy="' + (Y + 15) + '" r="9" fill="' + c + '"/>' +
      '<circle cx="' + f(X + 12 + dx) + '" cy="' + (Y + 0) + '" r="5" fill="' + c2 + '"/><circle cx="' + f(X + 7 + dx) + '" cy="' + (Y + 9) + '" r="3.5" fill="' + c2 + '"/>' +
      (h > 0.82 ? '<circle cx="' + f(X + 21 + dx) + '" cy="' + (Y + 9) + '" r="1.8" fill="#e03131"/><circle cx="' + f(X + 13 + dx) + '" cy="' + (Y + 14) + '" r="1.8" fill="#e03131"/>' : '');
  }
  function sapin(X, Y, h) {
    var c = h > 0.5 ? '#2f6f3e' : '#2b6638', c2 = h > 0.5 ? '#3b8a4c' : '#357d45';
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 29) + '" rx="10" ry="3" fill="rgba(0,0,0,.18)"/>' +
      '<rect x="' + (X + 14) + '" y="' + (Y + 22) + '" width="4" height="8" fill="#6b4626"/>' +
      '<path d="M' + (X + 16) + ' ' + (Y - 12) + 'L' + (X + 25) + ' ' + (Y + 2) + 'H' + (X + 7) + 'Z" fill="' + c + '"/>' +
      '<path d="M' + (X + 16) + ' ' + (Y - 4) + 'L' + (X + 28) + ' ' + (Y + 13) + 'H' + (X + 4) + 'Z" fill="' + c + '"/>' +
      '<path d="M' + (X + 16) + ' ' + (Y + 5) + 'L' + (X + 30) + ' ' + (Y + 24) + 'H' + (X + 2) + 'Z" fill="' + c + '"/>' +
      '<path d="M' + (X + 16) + ' ' + (Y - 12) + 'L' + (X + 11) + ' ' + (Y + 2) + 'M' + (X + 16) + ' ' + (Y - 4) + 'L' + (X + 9) + ' ' + (Y + 12) + 'M' + (X + 16) + ' ' + (Y + 5) + 'L' + (X + 7) + ' ' + (Y + 22) + '" stroke="' + c2 + '" stroke-width="2.5" stroke-linecap="round"/>';
  }
  function buisson(X, Y, h) {
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 28) + '" rx="13" ry="3" fill="rgba(0,0,0,.16)"/>' +
      '<circle cx="' + (X + 9) + '" cy="' + (Y + 20) + '" r="8" fill="#4c9a3c"/><circle cx="' + (X + 23) + '" cy="' + (Y + 20) + '" r="8" fill="#4c9a3c"/><circle cx="' + (X + 16) + '" cy="' + (Y + 14) + '" r="9" fill="#5cab45"/>' +
      '<circle cx="' + (X + 13) + '" cy="' + (Y + 11) + '" r="3.5" fill="#72c05a"/>' +
      (h > 0.45 ? '<circle cx="' + (X + 9) + '" cy="' + (Y + 19) + '" r="1.8" fill="#7048e8"/><circle cx="' + (X + 21) + '" cy="' + (Y + 22) + '" r="1.8" fill="#7048e8"/><circle cx="' + (X + 18) + '" cy="' + (Y + 13) + '" r="1.8" fill="#7048e8"/>' : '');
  }
  function haie(X, Y, h, gauche, droite) {
    return '<rect x="' + (X + (gauche ? 0 : 2)) + '" y="' + (Y + 10) + '" width="' + (32 - (gauche ? 0 : 2) - (droite ? 0 : 2)) + '" height="20" rx="' + (gauche && droite ? 0 : 7) + '" fill="#3f8a34"/>' +
      '<circle cx="' + (X + 8) + '" cy="' + (Y + 12) + '" r="7.5" fill="#4c9a3c"/><circle cx="' + (X + 24) + '" cy="' + (Y + 12) + '" r="7.5" fill="#4c9a3c"/><circle cx="' + (X + 16) + '" cy="' + (Y + 9) + '" r="7" fill="#58a847"/>' +
      '<rect x="' + (X + (gauche ? 0 : 2)) + '" y="' + (Y + 26) + '" width="' + (32 - (gauche ? 0 : 2) - (droite ? 0 : 2)) + '" height="4" fill="#2f6f28"/>' +
      (h > 0.6 ? '<circle cx="' + (X + 11) + '" cy="' + (Y + 15) + '" r="1.7" fill="#fff"/><circle cx="' + (X + 22) + '" cy="' + (Y + 18) + '" r="1.7" fill="#ffd43b"/>' : '');
  }
  function souche(X, Y) {
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 27) + '" rx="11" ry="3" fill="rgba(0,0,0,.18)"/>' +
      '<path d="M' + (X + 7) + ' ' + (Y + 15) + 'V' + (Y + 25) + 'q9 5 18 0V' + (Y + 15) + 'z" fill="#8d5a2b" stroke="#5c3a1f" stroke-width="1"/>' +
      '<path d="M' + (X + 5) + ' ' + (Y + 26) + 'l3-3M' + (X + 27) + ' ' + (Y + 26) + 'l-3-3" stroke="#5c3a1f" stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 15) + '" rx="9" ry="4" fill="#d9a066" stroke="#5c3a1f" stroke-width="1"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 15) + '" rx="5" ry="2" fill="none" stroke="#a87447" stroke-width=".8"/><path d="M' + (X + 22) + ' ' + (Y + 13) + 'q4-6 8-4" stroke="#69b34c" stroke-width="1.5" fill="none"/>';
  }
  function champignon(X, Y) {
    return '<g class="vl-brille"><ellipse cx="' + (X + 16) + '" cy="' + (Y + 26) + '" rx="7" ry="2" fill="rgba(0,0,0,.2)"/>' +
      '<path d="M' + (X + 13) + ' ' + (Y + 25) + 'q3 1 6 0l-.6-7h-4.8z" fill="#fff4e6" stroke="#c9a874" stroke-width=".8"/>' +
      '<path d="M' + (X + 7) + ' ' + (Y + 18) + 'q9-14 18 0z" fill="#e03131" stroke="#a61e1e" stroke-width="1"/>' +
      '<circle cx="' + (X + 12) + '" cy="' + (Y + 14) + '" r="1.6" fill="#fff"/><circle cx="' + (X + 17) + '" cy="' + (Y + 11) + '" r="1.9" fill="#fff"/><circle cx="' + (X + 21) + '" cy="' + (Y + 15) + '" r="1.3" fill="#fff"/>' +
      '<path d="M' + (X + 27) + ' ' + (Y + 8) + 'l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="#fff9db"/></g>';
  }
  // Obstacles des pouvoirs, fermés ou ouverts
  function obstacle(t, X, Y, ouvert, flair) {
    if (t === 'r') return ouvert
      ? '<path d="M' + (X + 6) + ' ' + (Y + 26) + 'l2-5M' + (X + 13) + ' ' + (Y + 27) + 'l1-6M' + (X + 22) + ' ' + (Y + 26) + 'l-1-5M' + (X + 27) + ' ' + (Y + 25) + 'l-2-4" stroke="#4a3426" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="' + (X + 16) + '" cy="' + (Y + 26) + '" rx="12" ry="3" fill="#6b5b4e" opacity=".45"/>'
      : '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 27) + '" rx="13" ry="3" fill="rgba(0,0,0,.2)"/><circle cx="' + (X + 9) + '" cy="' + (Y + 19) + '" r="9" fill="#2b6a2e"/><circle cx="' + (X + 23) + '" cy="' + (Y + 18) + '" r="9" fill="#2f7d32"/><circle cx="' + (X + 16) + '" cy="' + (Y + 10) + '" r="9" fill="#388e3c"/>' +
        '<path d="M' + (X + 3) + ' ' + (Y + 11) + 'l-3-3M' + (X + 29) + ' ' + (Y + 11) + 'l3-3M' + (X + 16) + ' ' + (Y + 1) + 'v-4M' + (X + 6) + ' ' + (Y + 27) + 'l-3 3M' + (X + 26) + ' ' + (Y + 27) + 'l3 3M' + (X + 9) + ' ' + (Y + 15) + 'l-3 1M' + (X + 24) + ' ' + (Y + 12) + 'l3-1" stroke="#1b4d1e" stroke-width="2"/>' +
        '<path d="M' + (X + 4) + ' ' + (Y + 20) + 'q12-8 24 2M' + (X + 7) + ' ' + (Y + 12) + 'q10 4 18-4" stroke="#1b4d1e" stroke-width="1.6" fill="none"/>' +
        '<circle cx="' + (X + 12) + '" cy="' + (Y + 14) + '" r="2" fill="#e03131"/><circle cx="' + (X + 21) + '" cy="' + (Y + 20) + '" r="2" fill="#e03131"/>';
    if (t === 'R') return ouvert
      ? '<circle cx="' + (X + 7) + '" cy="' + (Y + 25) + '" r="3.5" fill="#a5a5a5" stroke="#6b6b6b"/><circle cx="' + (X + 25) + '" cy="' + (Y + 24) + '" r="3" fill="#a5a5a5" stroke="#6b6b6b"/><circle cx="' + (X + 16) + '" cy="' + (Y + 27) + '" r="2.4" fill="#a5a5a5" stroke="#6b6b6b"/>'
      : '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 28) + '" rx="14" ry="3" fill="rgba(0,0,0,.22)"/><path d="M' + (X + 2) + ' ' + (Y + 28) + 'L' + (X + 5) + ' ' + (Y + 9) + 'L' + (X + 15) + ' ' + (Y + 2) + 'L' + (X + 27) + ' ' + (Y + 6) + 'L' + (X + 31) + ' ' + (Y + 27) + 'Z" fill="#9e9e9e" stroke="#5f5f5f" stroke-width="1.6"/>' +
        '<path d="M' + (X + 15) + ' ' + (Y + 3) + 'l-2 9 5 5-3 9" stroke="#616161" stroke-width="1.6" fill="none"/><path d="M' + (X + 7) + ' ' + (Y + 11) + 'L' + (X + 15) + ' ' + (Y + 5) + '" stroke="#d6d6d6" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M' + (X + 4) + ' ' + (Y + 24) + 'q6-3 11 1" stroke="#69b34c" stroke-width="2" fill="none"/>';
    if (t === 'v') return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 17) + '" rx="15" ry="12" fill="#7a5a3a"/><ellipse cx="' + (X + 16) + '" cy="' + (Y + 18) + '" rx="12" ry="9.5" fill="#1d140d"/>' +
      (ouvert ? '<rect x="' + (X - 2) + '" y="' + (Y + 12) + '" width="36" height="9" rx="1.5" fill="#c08a4e" stroke="#7a5230" stroke-width="1.2"/><path d="M' + (X + 6) + ' ' + (Y + 12) + 'v9M' + (X + 26) + ' ' + (Y + 12) + 'v9" stroke="#7a5230" stroke-width="1.2"/>'
              : '<path d="M' + (X + 6) + ' ' + (Y + 10) + 'q10-5 20 0" stroke="#4a3426" stroke-width="1.5" fill="none" opacity=".7"/>');
    if (t === 's') return ouvert
      ? '<path d="M' + (X + 1) + ' ' + (Y + 30) + 'V' + (Y + 12) + 'q15-14 30 0V' + (Y + 30) + 'h-5V' + (Y + 15) + 'q-10-8-20 0V' + (Y + 30) + 'z" fill="#3f8a34"/><circle cx="' + (X + 4) + '" cy="' + (Y + 9) + '" r="4" fill="#58a847"/><circle cx="' + (X + 28) + '" cy="' + (Y + 9) + '" r="4" fill="#58a847"/>'
      : '<rect x="' + (X + 1) + '" y="' + (Y + 6) + '" width="30" height="24" rx="6" fill="#2f6f28"/><circle cx="' + (X + 8) + '" cy="' + (Y + 9) + '" r="8" fill="#3f8a34"/><circle cx="' + (X + 24) + '" cy="' + (Y + 9) + '" r="8" fill="#3f8a34"/><circle cx="' + (X + 16) + '" cy="' + (Y + 5) + '" r="7" fill="#4c9a3c"/>' +
        '<path d="M' + (X + 15) + ' ' + (Y + 14) + 'l2 6-2 5" stroke="#1e4d1a" stroke-width="1.2" fill="none"/>' +
        (flair ? '<g class="vl-scintille"><path d="M' + (X + 16) + ' ' + (Y + 7) + 'l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#ffe066"/><circle cx="' + (X + 8) + '" cy="' + (Y + 22) + '" r="1.4" fill="#fff9db"/><circle cx="' + (X + 25) + '" cy="' + (Y + 21) + '" r="1.4" fill="#fff9db"/></g>' : '');
    return '';
  }
  function coffre(X, Y, ouvert) {
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 28) + '" rx="12" ry="3" fill="rgba(0,0,0,.25)"/>' +
      (ouvert ? '<path d="M' + (X + 5) + ' ' + (Y + 9) + 'q11-8 22 0v4h-22z" fill="#8d5a2b" stroke="#4a2e17" stroke-width="1.2" transform="rotate(-18 ' + (X + 5) + ' ' + (Y + 13) + ')"/>' : '') +
      '<rect x="' + (X + 5) + '" y="' + (Y + 14) + '" width="22" height="13" rx="2" fill="#a0652e" stroke="#4a2e17" stroke-width="1.3"/>' +
      (ouvert ? '<rect x="' + (X + 7) + '" y="' + (Y + 14) + '" width="18" height="3" fill="#2b1a0c"/>'
              : '<path d="M' + (X + 5) + ' ' + (Y + 15) + 'q11-9 22 0z" fill="#b8763a" stroke="#4a2e17" stroke-width="1.3"/>') +
      '<path d="M' + (X + 5) + ' ' + (Y + 18) + 'h22" stroke="#e0a83a" stroke-width="2"/><rect x="' + (X + 14) + '" y="' + (Y + 16) + '" width="4" height="5" rx="1" fill="#fcc419" stroke="#8a6100" stroke-width=".8"/>';
  }

  // ---------- Bâtiments ----------
  function batiment(b, X, Y, ctx) {
    var s = '';
    if (b.type === 'maison') {   // ma maison : 3 × 2 cases, toit rouge, porte au milieu
      s += '<ellipse cx="' + (X + 48) + '" cy="' + (Y + 62) + '" rx="48" ry="5" fill="rgba(0,0,0,.18)"/>' +
        '<rect x="' + (X + 4) + '" y="' + (Y + 18) + '" width="88" height="44" fill="#fbecd0" stroke="#8a6a46" stroke-width="1.5"/>' +
        '<path d="M' + (X + 4) + ' ' + (Y + 54) + 'h88" stroke="#d9c09a" stroke-width="2"/>' +
        '<rect x="' + (X + 70) + '" y="' + (Y - 14) + '" width="10" height="20" fill="#a35a3c" stroke="#5c2f1f" stroke-width="1.2"/>' +
        '<g class="vl-fumee"><circle cx="' + (X + 75) + '" cy="' + (Y - 20) + '" r="4" fill="#fff" opacity=".7"/><circle cx="' + (X + 79) + '" cy="' + (Y - 28) + '" r="5" fill="#fff" opacity=".5"/><circle cx="' + (X + 74) + '" cy="' + (Y - 37) + '" r="6" fill="#fff" opacity=".3"/></g>' +
        '<path d="M' + (X - 4) + ' ' + (Y + 22) + 'L' + (X + 48) + ' ' + (Y - 12) + 'L' + (X + 100) + ' ' + (Y + 22) + 'Z" fill="#d9534f" stroke="#8a2c29" stroke-width="1.6"/>' +
        '<path d="M' + (X + 12) + ' ' + (Y + 14) + 'L' + (X + 84) + ' ' + (Y + 14) + 'M' + (X + 24) + ' ' + (Y + 6) + 'L' + (X + 72) + ' ' + (Y + 6) + 'M' + (X + 36) + ' ' + (Y - 2) + 'L' + (X + 60) + ' ' + (Y - 2) + '" stroke="#b5403c" stroke-width="1.6"/>' +
        '<path d="M' + (X + 37) + ' ' + (Y + 63) + 'V' + (Y + 36) + 'a11 11 0 0 1 22 0V' + (Y + 63) + 'z" fill="#8d5a2b" stroke="#4a2e17" stroke-width="1.5"/>' +
        '<path d="M' + (X + 48) + ' ' + (Y + 26) + 'V' + (Y + 63) + '" stroke="#6d4520" stroke-width="1"/><circle cx="' + (X + 54) + '" cy="' + (Y + 47) + '" r="1.6" fill="#fcc419"/>' +
        [12, 66].map(wx => '<rect x="' + (X + wx) + '" y="' + (Y + 30) + '" width="18" height="15" rx="2" fill="#ffe8a3" stroke="#6d4520" stroke-width="1.4"/><path d="M' + (X + wx + 9) + ' ' + (Y + 30) + 'v15M' + (X + wx) + ' ' + (Y + 37.5) + 'h18" stroke="#6d4520" stroke-width="1"/>' +
          '<rect x="' + (X + wx - 1) + '" y="' + (Y + 45) + '" width="20" height="5" rx="1" fill="#8d5a2b"/><circle cx="' + (X + wx + 4) + '" cy="' + (Y + 44) + '" r="2.3" fill="#ff6b6b"/><circle cx="' + (X + wx + 10) + '" cy="' + (Y + 43.5) + '" r="2.3" fill="#ffd43b"/><circle cx="' + (X + wx + 15) + '" cy="' + (Y + 44) + '" r="2.3" fill="#f783ac"/>').join('') +
        '<rect x="' + (X + 33) + '" y="' + (Y + 19) + '" width="30" height="8" rx="2" fill="#fff8e7" stroke="#8a6a46" stroke-width="1"/>' +
        '<text x="' + (X + 48) + '" y="' + (Y + 25.3) + '" text-anchor="middle" font-size="6.4" font-weight="800" fill="#6d4520" font-family="Georgia, serif">' + esc(ctx.plaque || 'Ma maison') + '</text>';
    } else if (b.type === 'hutte') {   // la hutte de l'herboriste : toit de chaume, herbes qui sèchent
      s += '<ellipse cx="' + (X + 32) + '" cy="' + (Y + 62) + '" rx="32" ry="4" fill="rgba(0,0,0,.18)"/>' +
        '<rect x="' + (X + 6) + '" y="' + (Y + 24) + '" width="52" height="38" rx="4" fill="#e9d3a8" stroke="#8a6a46" stroke-width="1.4"/>' +
        '<path d="M' + (X - 2) + ' ' + (Y + 30) + 'Q' + (X + 32) + ' ' + (Y - 22) + ' ' + (X + 66) + ' ' + (Y + 30) + 'Z" fill="#d4a24c" stroke="#8a6315" stroke-width="1.5"/>' +
        '<path d="M' + (X + 6) + ' ' + (Y + 24) + 'q7-14 14-22M' + (X + 22) + ' ' + (Y + 27) + 'q4-14 10-25M' + (X + 42) + ' ' + (Y + 27) + 'q-4-14-10-25M' + (X + 58) + ' ' + (Y + 24) + 'q-7-14-14-22" stroke="#b5862f" stroke-width="1.2" fill="none"/>' +
        '<path d="M' + (X + 30) + ' ' + (Y + 62) + 'v-17a6 6 0 0 1 12 0v17z" fill="#7a5230" stroke="#4a2e17" stroke-width="1.2"/>' +
        '<circle cx="' + (X + 17) + '" cy="' + (Y + 42) + '" r="6" fill="#ffe8a3" stroke="#6d4520" stroke-width="1.3"/>' +
        '<path d="M' + (X + 6) + ' ' + (Y + 30) + 'h20" stroke="#6d4520" stroke-width="1"/>' +
        [9, 15, 21].map((hx, k) => '<path d="M' + (X + hx) + ' ' + (Y + 30) + 'v4" stroke="#6d4520" stroke-width=".8"/><path d="M' + (X + hx - 2) + ' ' + (Y + 34) + 'q2 5 4 0z" fill="' + ['#69b34c', '#9c36b5', '#4a9e3f'][k] + '"/>').join('') +
        '<ellipse cx="' + (X + 52) + '" cy="' + (Y + 58) + '" rx="5" ry="3" fill="#a0652e"/><path d="M' + (X + 48) + ' ' + (Y + 57) + 'q4-6 8 0" stroke="#69b34c" stroke-width="2" fill="none"/>';
    } else if (b.type === 'forge') {   // la forge de Bruno : pierre, toit d'ardoise, braises
      s += '<ellipse cx="' + (X + 32) + '" cy="' + (Y + 62) + '" rx="32" ry="4" fill="rgba(0,0,0,.2)"/>' +
        '<rect x="' + (X + 4) + '" y="' + (Y + 20) + '" width="56" height="42" fill="#a8a29e" stroke="#57534e" stroke-width="1.5"/>' +
        [26, 34, 42, 50].map((yy, k) => '<path d="M' + (X + 4) + ' ' + (Y + yy) + 'h56" stroke="#8a847f" stroke-width="1"/>' + [0, 1, 2, 3].map(j => '<path d="M' + (X + 10 + j * 14 + (k % 2) * 7) + ' ' + (Y + yy - 8) + 'v8" stroke="#8a847f" stroke-width="1"/>').join('')).join('') +
        '<rect x="' + (X + 44) + '" y="' + (Y - 10) + '" width="11" height="22" fill="#78716c" stroke="#44403c" stroke-width="1.2"/>' +
        '<g class="vl-fumee"><circle cx="' + (X + 50) + '" cy="' + (Y - 16) + '" r="4" fill="#ced4da" opacity=".75"/><circle cx="' + (X + 53) + '" cy="' + (Y - 25) + '" r="5" fill="#ced4da" opacity=".5"/></g>' +
        '<path d="M' + (X - 2) + ' ' + (Y + 24) + 'L' + (X + 8) + ' ' + (Y + 4) + 'H' + (X + 56) + 'L' + (X + 66) + ' ' + (Y + 24) + 'Z" fill="#495057" stroke="#212529" stroke-width="1.5"/>' +
        '<path d="M' + (X + 3) + ' ' + (Y + 14) + 'h58M' + (X + 6) + ' ' + (Y + 9) + 'h52" stroke="#343a40" stroke-width="1.2"/>' +
        '<path d="M' + (X + 10) + ' ' + (Y + 62) + 'v-18a9 9 0 0 1 18 0v18z" fill="#2b1a0c"/><path d="M' + (X + 12) + ' ' + (Y + 62) + 'v-8q7-6 14 0v8z" fill="#ff922b" class="vl-braise"/>' +
        '<rect x="' + (X + 36) + '" y="' + (Y + 32) + '" width="16" height="12" rx="1" fill="#ffd8a8" stroke="#57534e" stroke-width="1.3"/>' +
        '<path d="M' + (X + 34) + ' ' + (Y + 52) + 'h16l-3 4h-4v5h-5v-5h-2z" fill="#495057" stroke="#212529" stroke-width="1"/>';
    } else if (b.type === 'cabane') {   // la cabane de l'ermite : rondins et toit moussu
      s += '<ellipse cx="' + (X + 32) + '" cy="' + (Y + 62) + '" rx="32" ry="4" fill="rgba(0,0,0,.18)"/>' +
        '<rect x="' + (X + 6) + '" y="' + (Y + 22) + '" width="52" height="40" fill="#b07a45" stroke="#5c3a1f" stroke-width="1.4"/>' +
        [27, 33, 39, 45, 51, 57].map(yy => '<path d="M' + (X + 6) + ' ' + (Y + yy) + 'h52" stroke="#7a5230" stroke-width="1.2"/>').join('') +
        '<path d="M' + (X - 2) + ' ' + (Y + 26) + 'L' + (X + 32) + ' ' + (Y - 4) + 'L' + (X + 66) + ' ' + (Y + 26) + 'Z" fill="#6b8e3a" stroke="#3d5a1e" stroke-width="1.5"/>' +
        '<circle cx="' + (X + 14) + '" cy="' + (Y + 20) + '" r="5" fill="#7fa64a"/><circle cx="' + (X + 44) + '" cy="' + (Y + 14) + '" r="6" fill="#7fa64a"/><circle cx="' + (X + 30) + '" cy="' + (Y + 4) + '" r="4" fill="#8fbf55"/>' +
        '<path d="M' + (X + 34) + ' ' + (Y + 62) + 'v-20h14v20" fill="#5c3a1f" stroke="#3b2414" stroke-width="1.2"/><circle cx="' + (X + 45) + '" cy="' + (Y + 53) + '" r="1.3" fill="#fcc419"/>' +
        '<rect x="' + (X + 12) + '" y="' + (Y + 36) + '" width="13" height="11" fill="#ffe8a3" stroke="#5c3a1f" stroke-width="1.2"/><path d="M' + (X + 18.5) + ' ' + (Y + 36) + 'v11" stroke="#5c3a1f"/>' +
        '<path d="M' + (X + 2) + ' ' + (Y + 62) + 'h8v-6h-8z" fill="#8d5a2b"/><path d="M' + (X + 3) + ' ' + (Y + 56) + 'q3-5 6 0" stroke="#69b34c" stroke-width="2" fill="none"/>';
    } else if (b.type === 'crypte') {   // la vieille crypte : l'entrée du Donjon
      s += '<ellipse cx="' + (X + 48) + '" cy="' + (Y + 63) + '" rx="46" ry="5" fill="rgba(0,0,0,.25)"/>' +
        '<rect x="' + (X + 6) + '" y="' + (Y + 16) + '" width="84" height="46" fill="#868e96" stroke="#343a40" stroke-width="1.6"/>' +
        [26, 36, 46].map((yy, k) => '<path d="M' + (X + 6) + ' ' + (Y + yy) + 'h84" stroke="#6c737a" stroke-width="1.1"/>' + [0, 1, 2, 3, 4, 5].map(j => '<path d="M' + (X + 12 + j * 14 + (k % 2) * 7) + ' ' + (Y + yy - 10) + 'v10" stroke="#6c737a" stroke-width="1"/>').join('')).join('') +
        '<path d="M' + (X + 2) + ' ' + (Y + 18) + 'L' + (X + 48) + ' ' + (Y - 10) + 'L' + (X + 94) + ' ' + (Y + 18) + 'Z" fill="#adb5bd" stroke="#343a40" stroke-width="1.6"/>' +
        '<circle cx="' + (X + 48) + '" cy="' + (Y + 6) + '" r="5.5" fill="#495057" stroke="#343a40"/><path d="M' + (X + 45) + ' ' + (Y + 5) + 'h6M' + (X + 48) + ' ' + (Y + 2) + 'v8" stroke="#ced4da" stroke-width="1.2"/>' +
        '<rect x="' + (X + 10) + '" y="' + (Y + 20) + '" width="9" height="42" fill="#adb5bd" stroke="#343a40" stroke-width="1.2"/><rect x="' + (X + 77) + '" y="' + (Y + 20) + '" width="9" height="42" fill="#adb5bd" stroke="#343a40" stroke-width="1.2"/>' +
        '<path d="M' + (X + 34) + ' ' + (Y + 63) + 'V' + (Y + 38) + 'a14 14 0 0 1 28 0V' + (Y + 63) + 'z" fill="#120d18" stroke="#495057" stroke-width="3"/>' +
        '<g class="vl-yeux"><circle cx="' + (X + 44) + '" cy="' + (Y + 44) + '" r="1.5" fill="#ffe066"/><circle cx="' + (X + 51) + '" cy="' + (Y + 44) + '" r="1.5" fill="#ffe066"/></g>' +
        '<path d="M' + (X + 30) + ' ' + (Y + 63) + 'h36v-3h-36z" fill="#6c737a"/>' +
        [24, 72].map(lx => '<circle cx="' + (X + lx) + '" cy="' + (Y + 34) + '" r="9" fill="#b197fc" opacity=".25" class="vl-lueur"/><rect x="' + (X + lx - 2.5) + '" y="' + (Y + 30) + '" width="5" height="8" rx="1" fill="#e5dbff" stroke="#5f3dc4" stroke-width="1"/>').join('') +
        '<path d="M' + (X + 6) + ' ' + (Y + 22) + 'q-6 14 2 28M' + (X + 90) + ' ' + (Y + 24) + 'q6 12-1 24" stroke="#4a9e3f" stroke-width="2.5" fill="none"/>' +
        '<circle cx="' + (X + 4) + '" cy="' + (Y + 34) + '" r="2.5" fill="#62b851"/><circle cx="' + (X + 93) + '" cy="' + (Y + 38) + '" r="2.5" fill="#62b851"/>';
    } else if (b.type === 'chene') {   // le vieux chêne : un tronc énorme et un creux
      s += '<ellipse cx="' + (X + 32) + '" cy="' + (Y + 61) + '" rx="34" ry="6" fill="rgba(0,0,0,.22)"/>' +
        '<path d="M' + (X + 14) + ' ' + (Y + 62) + 'q6-4 6-26h24q0 22 6 26q-8 2-12-3-4 4-8 0-8 5-16 3z" fill="#7a5230" stroke="#4a2e17" stroke-width="1.6"/>' +
        '<ellipse cx="' + (X + 32) + '" cy="' + (Y + 48) + '" rx="5" ry="7" fill="#2b1a0c"/>' +
        '<path d="M' + (X + 26) + ' ' + (Y + 40) + 'q2 10-1 18M' + (X + 39) + ' ' + (Y + 38) + 'q-1 8 2 16" stroke="#5c3a1f" stroke-width="1.2" fill="none"/>' +
        '<circle cx="' + (X + 8) + '" cy="' + (Y + 14) + '" r="18" fill="#3a8435"/><circle cx="' + (X + 56) + '" cy="' + (Y + 14) + '" r="18" fill="#3a8435"/><circle cx="' + (X + 32) + '" cy="' + (Y - 4) + '" r="22" fill="#3f8f3a"/>' +
        '<circle cx="' + (X + 20) + '" cy="' + (Y + 24) + '" r="15" fill="#4a9e3f"/><circle cx="' + (X + 44) + '" cy="' + (Y + 24) + '" r="15" fill="#4a9e3f"/>' +
        '<circle cx="' + (X + 24) + '" cy="' + (Y - 10) + '" r="8" fill="#56ad49"/><circle cx="' + (X + 4) + '" cy="' + (Y + 8) + '" r="6" fill="#56ad49"/><circle cx="' + (X + 48) + '" cy="' + (Y + 4) + '" r="6" fill="#56ad49"/>' +
        '<ellipse cx="' + (X + 40) + '" cy="' + (Y + 30) + '" rx="2.2" ry="1.6" fill="#c08a4e"/><ellipse cx="' + (X + 16) + '" cy="' + (Y + 20) + '" rx="2.2" ry="1.6" fill="#c08a4e"/>';
    }
    return s;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }

  // Fontaine, tableau de quêtes, étal de Pipa
  function fontaine(X, Y) {
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 26) + '" rx="17" ry="6" fill="rgba(0,0,0,.18)"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 21) + '" rx="16" ry="7.5" fill="#adb5bd" stroke="#495057" stroke-width="1.4"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 19) + '" rx="12.5" ry="5" fill="#74c0fc"/>' +
      '<rect x="' + (X + 13.5) + '" y="' + (Y + 3) + '" width="5" height="16" rx="1.5" fill="#ced4da" stroke="#495057" stroke-width="1"/>' +
      '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 4) + '" rx="6" ry="2.2" fill="#ced4da" stroke="#495057" stroke-width="1"/>' +
      '<g class="vl-eau"><path d="M' + (X + 12) + ' ' + (Y + 4) + 'q-4 4-5 12M' + (X + 20) + ' ' + (Y + 4) + 'q4 4 5 12" stroke="#a5d8ff" stroke-width="1.6" fill="none"/>' +
      '<ellipse cx="' + (X + 9) + '" cy="' + (Y + 19) + '" rx="2.5" ry="1" fill="#e7f5ff"/><ellipse cx="' + (X + 23) + '" cy="' + (Y + 19) + '" rx="2.5" ry="1" fill="#e7f5ff"/></g>';
  }
  function tableau(X, Y, alerte) {
    return '<ellipse cx="' + (X + 16) + '" cy="' + (Y + 29) + '" rx="12" ry="3" fill="rgba(0,0,0,.2)"/>' +
      '<path d="M' + (X + 6) + ' ' + (Y + 30) + 'V' + (Y + 6) + 'M' + (X + 26) + ' ' + (Y + 30) + 'V' + (Y + 6) + '" stroke="#6d4520" stroke-width="3"/>' +
      '<rect x="' + (X + 2) + '" y="' + (Y + 2) + '" width="28" height="19" rx="2" fill="#b07a45" stroke="#5c3a1f" stroke-width="1.4"/>' +
      '<path d="M' + (X) + ' ' + (Y + 3) + 'l16-7 16 7z" fill="#7a5230" stroke="#4a2e17" stroke-width="1"/>' +
      '<rect x="' + (X + 5) + '" y="' + (Y + 5) + '" width="9" height="11" fill="#fff8e7" transform="rotate(-5 ' + (X + 9) + ' ' + (Y + 10) + ')"/><rect x="' + (X + 17) + '" y="' + (Y + 6) + '" width="9" height="8" fill="#fff3bf" transform="rotate(4 ' + (X + 21) + ' ' + (Y + 10) + ')"/>' +
      '<path d="M' + (X + 7) + ' ' + (Y + 9) + 'h5M' + (X + 7) + ' ' + (Y + 12) + 'h4M' + (X + 19) + ' ' + (Y + 9) + 'h5" stroke="#868e96" stroke-width=".8"/>' +
      '<circle cx="' + (X + 9) + '" cy="' + (Y + 5.5) + '" r="1.1" fill="#e03131"/><circle cx="' + (X + 21) + '" cy="' + (Y + 6.5) + '" r="1.1" fill="#1c7ed6"/>';
  }
  function etal(X, Y) {   // deux cases de large ; Pipa derrière le comptoir
    return '<ellipse cx="' + (X + 32) + '" cy="' + (Y + 30) + '" rx="30" ry="3.5" fill="rgba(0,0,0,.2)"/>' +
      '<path d="M' + (X + 4) + ' ' + (Y + 30) + 'V' + (Y - 8) + 'M' + (X + 60) + ' ' + (Y + 30) + 'V' + (Y - 8) + '" stroke="#6d4520" stroke-width="2.6"/>' +
      '<svg x="' + (X + 14) + '" y="' + (Y - 19) + '" width="36" height="41" viewBox="0 0 40 46">' + HABITANTS.chat() + '</svg>' +
      '<rect x="' + (X + 2) + '" y="' + (Y + 12) + '" width="60" height="17" rx="2" fill="#b07a45" stroke="#5c3a1f" stroke-width="1.4"/><path d="M' + (X + 2) + ' ' + (Y + 18) + 'h60" stroke="#8d5a2b" stroke-width="1"/>' +
      '<circle cx="' + (X + 10) + '" cy="' + (Y + 10) + '" r="3.5" fill="#e03131"/><circle cx="' + (X + 16) + '" cy="' + (Y + 10) + '" r="3.5" fill="#f03e3e"/><circle cx="' + (X + 13) + '" cy="' + (Y + 7) + '" r="3.5" fill="#c92a2a"/>' +
      '<rect x="' + (X + 44) + '" y="' + (Y + 4) + '" width="7" height="8" rx="1.5" fill="#9775fa" stroke="#5f3dc4" stroke-width=".8"/><rect x="' + (X + 52) + '" y="' + (Y + 6) + '" width="6" height="6" rx="1.5" fill="#63e6be" stroke="#087f5b" stroke-width=".8"/>' +
      '<path d="M' + (X) + ' ' + (Y - 4) + 'L' + (X + 4) + ' ' + (Y - 16) + 'H' + (X + 60) + 'L' + (X + 64) + ' ' + (Y - 4) + 'Z" fill="#fff4e6" stroke="#a0652e" stroke-width="1.2"/>' +
      [0, 1, 2, 3, 4].map(k => '<path d="M' + (X + 4 + k * 12) + ' ' + (Y - 16) + 'h6L' + (X + 9 + k * 13) + ' ' + (Y - 4) + 'h-' + 6.5 + 'z" fill="#e8590c"/>').join('') +
      [0, 1, 2, 3, 4, 5].map(k => '<path d="M' + (X + k * 12.8) + ' ' + (Y - 4) + 'a6.4 4 0 0 0 12.8 0" fill="' + (k % 2 ? '#fff4e6' : '#e8590c') + '" stroke="#a0652e" stroke-width=".8"/>').join('');
  }
  function bulleQuete(X, Y, m) {
    if (!m) return '';
    var c = m === '?' ? '#2f9e44' : '#f59f00';
    return '<g class="vl-bulle"><circle cx="' + X + '" cy="' + Y + '" r="7" fill="#fff" stroke="' + c + '" stroke-width="2"/><text x="' + X + '" y="' + (Y + 4) + '" text-anchor="middle" font-size="11" font-weight="900" fill="' + c + '" font-family="system-ui,sans-serif">' + m + '</text></g>';
  }

  // ---------- Un écran du monde ----------
  // ctx = { flair, plaque, marques: { habitant: '!' | '?' }, tableauMarque, gardien }
  function ecranSvg(e, ex, ey, ctx) {
    ctx = ctx || {};
    var x0 = ex * VL.W, y0 = ey * VL.H, s = [], objets = [], x, y, t, X, Y, h;
    var tu = (xx, yy) => VL.tuile(xx, yy);
    var chemin = c => c === ':' || c === '=';
    // Herbe, en damier très doux, avec des touffes
    s.push('<rect width="352" height="288" fill="#8fcf6b"/>');
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      X = x * T; Y = y * T; h = VL.hash(x0 + x, y0 + y);
      if ((x + y) % 2) s.push('<rect x="' + X + '" y="' + Y + '" width="32" height="32" fill="#87c865"/>');
      if (h < 0.4) s.push('<path d="M' + f(X + 6 + h * 40) + ' ' + f(Y + 24 - h * 20) + 'l2 -5 2 5 2-4" stroke="#6fb24f" stroke-width="1.3" fill="none"/>');
    }
    // Eau (ruisseau, mare) et ses berges
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      t = tu(x0 + x, y0 + y); if (!MARCHE_EAU[t]) continue;
      X = x * T; Y = y * T;
      s.push('<rect x="' + X + '" y="' + Y + '" width="32" height="32" fill="#5aa9e6"/>');
      [[0, -1, 'M' + X + ' ' + (Y + 1.5) + 'h32'], [0, 1, 'M' + X + ' ' + (Y + 30.5) + 'h32'], [-1, 0, 'M' + (X + 1.5) + ' ' + Y + 'v32'], [1, 0, 'M' + (X + 30.5) + ' ' + Y + 'v32']].forEach(v => {
        var n = tu(x0 + x + v[0], y0 + y + v[1]);
        if (n !== null && !MARCHE_EAU[n]) s.push('<path d="' + v[2] + '" stroke="#e9d8a6" stroke-width="3"/>');
      });
      h = VL.hash(x0 + x, y0 + y, 3);
      s.push('<path class="vl-vague" d="M' + f(X + 5 + h * 10) + ' ' + f(Y + 10 + h * 8) + 'q3-3 6 0t6 0" stroke="#d0ebff" stroke-width="1.4" fill="none" opacity=".8"/>');
    }
    // Chemins de terre : formes arrondies qui se rejoignent
    [['#c9a46a', 14, 28], ['#e6c992', 12, 24]].forEach(st => {
      for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
        t = tu(x0 + x, y0 + y); if (t !== ':') continue;
        X = x * T + 16; Y = y * T + 16;
        s.push('<circle cx="' + X + '" cy="' + Y + '" r="' + st[1] + '" fill="' + st[0] + '"/>');
        if (chemin(tu(x0 + x + 1, y0 + y)) || x === VL.W - 1 && x0 + x + 1 < VL.LARG && tu(x0 + x + 1, y0 + y) === ':') s.push('<rect x="' + X + '" y="' + (Y - st[1]) + '" width="16" height="' + st[2] + '" fill="' + st[0] + '"/>');
        if (chemin(tu(x0 + x - 1, y0 + y))) s.push('<rect x="' + (X - 16) + '" y="' + (Y - st[1]) + '" width="16" height="' + st[2] + '" fill="' + st[0] + '"/>');
        if (chemin(tu(x0 + x, y0 + y + 1))) s.push('<rect x="' + (X - st[1]) + '" y="' + Y + '" width="' + st[2] + '" height="16" fill="' + st[0] + '"/>');
        if (chemin(tu(x0 + x, y0 + y - 1))) s.push('<rect x="' + (X - st[1]) + '" y="' + (Y - 16) + '" width="' + st[2] + '" height="16" fill="' + st[0] + '"/>');
      }
    });
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      t = tu(x0 + x, y0 + y); X = x * T; Y = y * T; h = VL.hash(x0 + x, y0 + y, 5);
      if (t === ':' && h < 0.5) s.push('<circle cx="' + f(X + 8 + h * 30) + '" cy="' + f(Y + 20 - h * 12) + '" r="1.6" fill="#c9a46a"/><circle cx="' + f(X + 22 - h * 10) + '" cy="' + f(Y + 9 + h * 20) + '" r="1.2" fill="#d4b47c"/>');
      if (t === ',') {   // fleurs
        [[7, 9], [20, 7], [13, 20], [25, 22]].forEach((p, k) => {
          var c = ['#fff', '#ffd43b', '#f783ac', '#b197fc'][Math.floor(VL.hash(x0 + x, y0 + y, k) * 4)];
          s.push('<circle cx="' + (X + p[0]) + '" cy="' + (Y + p[1]) + '" r="2.4" fill="' + c + '"/><circle cx="' + (X + p[0]) + '" cy="' + (Y + p[1]) + '" r=".9" fill="#f08c00"/>');
        });
      }
      if (t === '=') {   // pont de planches (le chemin le traverse de haut en bas)
        s.push('<rect x="' + (X + 4) + '" y="' + (Y - 2) + '" width="24" height="36" fill="#c08a4e" stroke="#7a5230" stroke-width="1.2"/>' +
               [4, 11, 18, 25].map(k => '<path d="M' + (X + 4) + ' ' + (Y + k) + 'h24" stroke="#7a5230" stroke-width="1"/>').join('') +
               '<path d="M' + (X + 3) + ' ' + (Y - 2) + 'v36M' + (X + 29) + ' ' + (Y - 2) + 'v36" stroke="#6d4520" stroke-width="2.6"/>');
      }
    }
    // Flèches vers l'écran voisin, sur les passages du bord
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      if (x !== 0 && y !== 0 && x !== VL.W - 1 && y !== VL.H - 1) continue;
      t = tu(x0 + x, y0 + y); if (t !== ':') continue;
      var d = x === 0 ? 'g' : x === VL.W - 1 ? 'd' : y === 0 ? 'h' : 'b', cx = x * T + 16, cy = y * T + 16;
      var rot = { h: 0, d: 90, b: 180, g: 270 }[d];
      s.push('<path class="vl-fleche" d="M' + (cx - 6) + ' ' + (cy + 3) + 'l6-6 6 6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"/>');
    }
    // Objets posés, dessinés de haut en bas (les plus bas passent devant)
    function poser(rang, svg) { objets.push([rang, svg]); }
    for (y = 0; y < VL.H; y++) for (x = 0; x < VL.W; x++) {
      var gx = x0 + x, gy = y0 + y; t = tu(gx, gy); X = x * T; Y = y * T; h = VL.hash(gx, gy, 1);
      if (t === 'T') poser(y, arbre(X, Y, h));
      else if (t === 'S') poser(y, sapin(X, Y, h));
      else if (t === 'b') poser(y, buisson(X, Y, h));
      else if (t === 'h') poser(y, haie(X, Y, h, tu(gx - 1, gy) === 'h', tu(gx + 1, gy) === 'h'));
      else if (t === 'o') poser(y, souche(X, Y));
      else if (t === 'F') poser(y, fontaine(X, Y));
      else if (t === 'Q') poser(y, tableau(X, Y) + bulleQuete(X + 16, Y - 8, ctx.tableauMarque));
      else if (t === 'c') poser(y, coffre(X, Y, e.coffre));
      else if (VL.OBSTACLES[t]) poser(y - 0.1, obstacle(t, X, Y, VL.ouvert(e, gx, gy), ctx.flair));
      if (t === 'm' && tu(gx - 1, gy) !== 'm') poser(y, etal(X, Y) + bulleQuete(X + 32, Y - 26, ctx.marques && ctx.marques.pipa));
    }
    VL.BATIMENTS.forEach(b => {
      var c = VL.ecranDe(b.x, b.y);
      if (c.ex !== ex || c.ey !== ey) return;
      poser(b.y - y0 + b.h - 1 + 0.2, batiment(b, (b.x - x0) * T, (b.y - y0) * T, ctx));
    });
    VL.CHAMPIGNONS.forEach(c => {
      var k = VL.ecranDe(c.x, c.y);
      if (k.ex === ex && k.ey === ey && VL.champignonVisible(e, c)) poser(c.y - y0 - 0.05, champignon((c.x - x0) * T, (c.y - y0) * T));
    });
    Object.keys(VL.HABITANTS).forEach(id => {
      var H = VL.HABITANTS[id], k = VL.ecranDe(H.x, H.y);
      if (H.etal || k.ex !== ex || k.ey !== ey) return;
      var hx = (H.x - x0) * T, hy = (H.y - y0) * T;
      poser(H.y - y0 + 0.1, '<g class="vl-respire"><svg x="' + (hx - 7) + '" y="' + (hy - 20) + '" width="46" height="53" viewBox="0 0 40 46">' + HABITANTS[H.espece]() + '</svg></g>' +
        bulleQuete(hx + 16, hy - 24, ctx.marques && ctx.marques[id]));
    });
    objets.sort((a, b) => a[0] - b[0]).forEach(o => s.push(o[1]));
    return s.join('');
  }

  // ---------- La carte du monde, sous le brouillard (10 unités par case) ----------
  var COUL = { '.': '#a9d18e', ',': '#b8dc96', ':': '#e7cf9b', '=': '#c08a4e', T: '#5d9b4c', S: '#4b8650', b: '#77b35f', h: '#6aa653', o: '#a9d18e',
               '~': '#7fbde8', x: '#c98a6a', m: '#e8590c', Q: '#b07a45', F: '#9ab', c: '#a9d18e', r: '#3d7a3a', R: '#9e9e9e', v: '#6b5040', s: '#3f7a35' };
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
      if (VL.OBSTACLES[t] && VL.ouvert(e, x, y)) t = '.';
      terre.push('<rect x="' + (x * U) + '" y="' + (y * U) + '" width="' + (U + 0.4) + '" height="' + (U + 0.4) + '" fill="' + (COUL[t] || '#a9d18e') + '"/>');
      if (t === 'T' || t === 'S') terre.push('<circle cx="' + (x * U + 5) + '" cy="' + (y * U + 5) + '" r="4" fill="' + (t === 'S' ? '#3d7344' : '#4d8a3e') + '"/>');
    }
    VL.BATIMENTS.forEach(bt => terre.push('<rect x="' + (bt.x * U + 1) + '" y="' + (bt.y * U + 1) + '" width="' + (bt.w * U - 2) + '" height="' + (bt.h * U - 2) + '" rx="2" fill="' +
      ({ maison: '#d9534f', hutte: '#d4a24c', forge: '#495057', crypte: '#868e96', cabane: '#6b8e3a', chene: '#3a8435' })[bt.type] + '" stroke="rgba(0,0,0,.35)" stroke-width="1"/>'));
    s.push('<g mask="url(#vl-masque)">' + terre.join('') + '</g>');
    // Repères des lieux découverts
    var ICO = { maison: '🏠', hutte: '🌿', forge: '⚒️', crypte: '🗝️', cabane: '🛖', chene: '🌳' };
    VL.BATIMENTS.forEach(bt => {
      if (!VL.estVu(e, bt.x + (bt.w >> 1), bt.y + bt.h - 1, b)) return;
      s.push('<text x="' + ((bt.x + bt.w / 2) * U) + '" y="' + ((bt.y + bt.h / 2) * U + 5) + '" text-anchor="middle" font-size="13">' + ICO[bt.type] + '</text>');
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
    for (x = 1; x < VL.EW; x++) s.push('<path d="M' + (x * VL.W * U) + ' 0V' + (VL.HAUT * U) + '" stroke="#8a6a46" stroke-width="1" stroke-dasharray="3 4" opacity=".45"/>');
    for (y = 1; y < VL.EH; y++) s.push('<path d="M0 ' + (y * VL.H * U) + 'H' + (VL.LARG * U) + '" stroke="#8a6a46" stroke-width="1" stroke-dasharray="3 4" opacity=".45"/>');
    // Cadre de vieille carte
    s.push('<rect x="1" y="1" width="' + (VL.LARG * U - 2) + '" height="' + (VL.HAUT * U - 2) + '" rx="6" fill="none" stroke="#8a6a46" stroke-width="2"/>');
    return s.join('');
  }
  // Ce qui bouge à chaque pas (dessiné par-dessus, pour ne pas tout redessiner) : l'écran où je suis, la quête suivie, moi
  function carteDessus(e, ctx) {
    ctx = ctx || {};
    var U = 10, s = [], ec = VL.ecranDe(e.x, e.y);
    s.push('<rect x="' + (ec.ex * VL.W * U + 1.5) + '" y="' + (ec.ey * VL.H * U + 1.5) + '" width="' + (VL.W * U - 3) + '" height="' + (VL.H * U - 3) + '" rx="4" fill="none" stroke="#fff" stroke-width="2.5" opacity=".9"/>');
    // La quête suivie : un anneau qui palpite
    if (ctx.cible) s.push('<circle class="vl-cible" cx="' + (ctx.cible.x * U + 5) + '" cy="' + (ctx.cible.y * U + 5) + '" r="8" fill="none" stroke="#f59f00" stroke-width="2.5"/>');
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
