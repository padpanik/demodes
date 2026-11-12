// ================== LA VALLÉE : PETITES ICÔNES DESSINÉES (3.62) ==================
// Demandé par l'utilisateur : « éviter au maximum les émojis dans le monde ». Toutes les icônes de la Vallée
// (carte du monde, fiche, menus, fenêtres, annonces) sont dessinées ici, dans le style des décors : aplats,
// contour sombre, une ombre et un reflet. Grille de 24 × 24.
//   VLP.svg(nom, taille)          : une icône seule (<svg>)
//   VLP.g(nom, cx, cy, taille)    : la même, à poser dans un autre SVG (centrée en cx, cy)
//   VLP.riche(texte, taille)      : texte échappé, où les émojis connus deviennent des icônes (pour v-html)
//   VLP.nom(émoji)                : le nom de l'icône qui remplace cet émoji (ou null)
// Les visages des émotions (😂, 😮…) restent des émojis : c'est leur langage, le même que dans les jeux.

var VLP = (function () {
  var K = '#3a2414';   // contour
  function f(n) { return Math.round(n * 10) / 10; }
  function c(cx, cy, r, fill, sw) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (sw === 0 ? '' : ' stroke="' + K + '" stroke-width="' + (sw || 1.3) + '"') + '/>'; }
  function p(d, fill, sw, extra) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (sw === 0 ? '' : ' stroke="' + K + '" stroke-width="' + (sw || 1.3) + '"') + ' stroke-linejoin="round" stroke-linecap="round"' + (extra || '') + '/>'; }
  function r(x, y, w, h, rx, fill, sw) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + (sw === 0 ? '' : ' stroke="' + K + '" stroke-width="' + (sw || 1.3) + '"') + '/>'; }
  function l(d, coul, sw) { return '<path d="' + d + '" fill="none" stroke="' + (coul || K) + '" stroke-width="' + (sw || 1.3) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }

  var I = {
    // ---------- Monnaies et ressources ----------
    etoile: () => p('M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 16.9 6.3 20l1.2-6.3-4.7-4.4 6.4-.8z', '#ffd43b') + p('M12 5.6l1.9 4 3.8.5', 'none', 1.2, ' stroke="#fff3bf"'),
    cristal: () => p('M7 3h10l4 6-9 12.5L3 9z', '#9775fa') + p('M3 9h18M7 3l5 18.5L17 3M9.5 9L12 3l2.5 6', 'none', 0.9) + p('M7.5 4.2l-2.6 4', 'none', 1.4, ' stroke="#e5dbff"'),
    bois: () => p('M3.5 9.5l13-4.5 3 8.5-13 4.5z', '#a0652e') + '<ellipse cx="18" cy="9.3" rx="2.6" ry="4.4" transform="rotate(-19 18 9.3)" fill="#e0b07a" stroke="' + K + '" stroke-width="1.3"/>' +
      '<ellipse cx="18" cy="9.3" rx="1.1" ry="2" transform="rotate(-19 18 9.3)" fill="none" stroke="#a0652e" stroke-width=".9"/>' + l('M6 13.5l9-3', '#7a4a20', 1),
    pierre: () => p('M3 18l1.5-6 4-4.5 5-1 5 2.5 2.5 5.5-1 3.5z', '#adb5bd') + p('M8.5 7.5l2 4.5 6 1.5M10.5 12L7 18', 'none', 0.9, ' stroke="#868e96"') + p('M6 11l2.5-2.8', 'none', 1.4, ' stroke="#e9ecef"'),
    plante: () => l('M12 21V8', '#2b8a3e', 1.6) + p('M12 13q-7 0-8-6 6-1 8 6z', '#51cf66') + p('M12 10q6-.5 7.5-6-6.5-.5-7.5 6z', '#40c057') + p('M12 17q5 0 6.5-4-5 0-6.5 4z', '#69db7c'),
    fiole: () => p('M9.5 3h5v5l4.5 9q1 4-3 4h-8q-4 0-3-4l4.5-9z', '#d0ebff') + p('M6.6 15h10.8l1.1 2.2q.8 3.3-2.5 3.3h-8q-3.3 0-2.5-3.3z', '#4dabf7', 0) + r(8.5, 2, 7, 2.4, 1, '#a0652e') + p('M8 17h2', 'none', 1.3, ' stroke="#fff"'),
    coeur: () => p('M12 20.5S3 14.5 3 8.6Q3 4.5 7 4.3q3.2 0 5 3 1.8-3 5-3 4 .2 4 4.3c0 5.9-9 11.9-9 11.9z', '#f06595') + p('M6.5 7.5q.5-1.6 2-1.8', 'none', 1.4, ' stroke="#ffdeeb"'),
    bouclier: () => p('M12 2.8l8 3v6q0 6-8 9.6Q4 17.8 4 11.8v-6z', '#74c0fc') + p('M12 2.8v18.6M4.5 9h15', 'none', 1) + p('M7 6.6l3-1.1', 'none', 1.4, ' stroke="#e7f5ff"'),
    piece: () => c(12, 12, 8.5, '#fcc419') + c(12, 12, 5.6, 'none', 1) + p('M10 9.5h4M12 9.5v5', 'none', 1.4, ' stroke="#e67700"'),
    // ---------- Pouvoirs ----------
    flamme: () => p('M12 21.5q-7 0-7-6.5 0-4.5 4-8 0 3.5 2.5 4.5-1-5 3.5-9.5 1 4.5 3.5 7 2.5 2.5 2.5 6 0 6.5-7 6.5z', '#ff922b') + p('M12 21.5q-3.5 0-3.5-3.5 0-2.5 2.5-4.5.5 2 2 2.5 0-2 1.5-3.5 1.5 2.5 1.5 5 0 4-4 4z', '#ffe066', 1),
    force: () => r(2.5, 7.5, 3.2, 9, 1, '#495057') + r(18.3, 7.5, 3.2, 9, 1, '#495057') + r(5.7, 9.5, 2.6, 5, 0.8, '#868e96') + r(15.7, 9.5, 2.6, 5, 0.8, '#868e96') + r(8.3, 11, 7.4, 2, 1, '#ced4da'),
    bond: () => p('M3.5 18.5q8.5-17 17 0', 'none', 1.8, ' stroke-dasharray="2.2 2.2"') + p('M17.5 15.5l3 3.3 1-4.4', 'none', 1.6) + '<ellipse cx="4.5" cy="19.5" rx="2.4" ry="1.2" fill="#a0652e" stroke="' + K + '" stroke-width="1"/>',
    flair: () => p('M4 12.5Q4 7 12 7t8 5.5q0 5.5-8 5.5t-8-5.5z', '#495057') + '<ellipse cx="8.8" cy="13" rx="1.8" ry="1.4" fill="#1a1a1a"/><ellipse cx="15.2" cy="13" rx="1.8" ry="1.4" fill="#1a1a1a"/>' +
      p('M7.5 9.4q2-1 4-1', 'none', 1.3, ' stroke="#adb5bd"') + l('M20.5 6l2-1.5M21.5 9.5h2M3.5 6l-2-1.5', '#868e96', 1.1),
    // ---------- Lieux ----------
    maison: () => r(5, 11, 14, 9.5, 0.5, '#f1e3c6') + p('M2.8 12L12 4l9.2 8z', '#d9534f') + r(10, 14.5, 4, 6, 0.5, '#8d5a2b', 1) + r(6.5, 13.5, 2.6, 2.6, 0, '#ffd43b', 0.9) + r(15, 13.5, 2.6, 2.6, 0, '#ffd43b', 0.9),
    chaumiere: () => r(4.5, 12, 15, 8.5, 0.5, '#f1e3c6') + p('M2.5 13q2-7 9.5-8.5 7.5 1.5 9.5 8.5z', '#e9b949') + l('M5 11.5l3-3M9 10l2-2.5M13 10l2-2.5M17 11l1.8-2', '#b7862a', 0.9) + r(10.3, 15, 3.4, 5.5, 0.5, '#8d5a2b', 1),
    hameau: () => r(2.5, 13, 9, 7.5, 0.5, '#f1e3c6', 1.1) + p('M1.5 14q1.5-5 5.5-6 4 1 5.5 6z', '#e9b949', 1.1) + r(12.5, 11, 9, 9.5, 0.5, '#f1e3c6', 1.1) + p('M11.5 12q1.5-6 5.5-7 4 1 5.5 7z', '#d9a03a', 1.1) + r(15.5, 15.5, 3, 5, 0.5, '#8d5a2b', 0.9) + r(5.5, 16, 3, 4.5, 0.5, '#8d5a2b', 0.9),
    hutte: () => p('M3 20.5q0-13 9-14.5 9 1.5 9 14.5z', '#94b56a') + l('M5.5 15q6.5-3 13 0M4.5 18q7.5-3 15 0M7 11.5q5-2.5 10 0', '#5c7f3a', 1) + p('M10 20.5v-5q2-2 4 0v5z', '#5c3a1f', 1) + p('M12 6V3q2 0 3 1.5', '#51cf66', 1.1),
    forge: () => p('M3 8.5h13q3 0 5 2.5h-6l-1.5 3h-6L6 11H3z', '#868e96') + p('M8 14h6l1.5 5h-9z', '#495057') + r(5, 19, 12, 2, 0.5, '#343a40') + p('M15 3.5l4 4', 'none', 2.2, ' stroke="#8d5a2b"') + r(12.6, 2, 4.6, 3, 0.6, '#adb5bd', 1),
    crypte: () => p('M4 21.5V10q0-7.5 8-7.5t8 7.5v11.5z', '#adb5bd') + p('M8 21.5V12q0-4 4-4t4 4v9.5z', '#2b1a0e') + l('M4 13h4M16 13h4M4 17h4M16 17h4', '#868e96', 0.9) + c(12, 15, 1.3, '#ffd43b', 0.8),
    cabane: () => r(5, 11, 14, 9.5, 0.5, '#b07a45') + l('M5 14h14M5 17h14', '#7a4a20', 0.9) + p('M3 12l9-7 9 7z', '#6b8e3a') + r(10.2, 14.5, 3.6, 6, 0.5, '#5c3a1f', 1) + p('M16 6V3.5h2V8', '#868e96', 1),
    arbre: () => r(10.5, 15, 3, 6.5, 0.5, '#8d5a2b') + c(12, 10, 7.5, '#51a83a') + c(8.5, 8.5, 2.6, '#69c34f', 0) + c(15, 12.5, 1.4, '#3d8a2c', 0),
    sapin: () => r(10.6, 17.5, 2.8, 4, 0.5, '#8d5a2b') + p('M12 2.5l6.5 9h-3l4 6.5H4.5l4-6.5h-3z', '#2f8a4a') + p('M12 5l-3 4.5', 'none', 1.3, ' stroke="#51cf66"'),
    saule: () => r(10.6, 13, 2.8, 8.5, 0.5, '#8d5a2b') + p('M4 16q-1-12 8-12.5 9 .5 8 12.5-2-4-3-1-1-4-2.5 0-1-4-2.5 0-1.5-4-2.5 0-1-3-3 1z', '#7fb04a') + l('M8 9v6M12 7v6M16 9v6', '#5c8a32', 0.9),
    montagne: () => p('M1.5 20.5L9 6l4 6.5 2.5-3.5 7 11z', '#868e96') + p('M9 6l2.6 5-1.6-.8-1.5 1.4-1.4-1.6-.9.8z', '#fff', 0.9) + p('M15.5 9l2.2 3.5-1.6-.6-1.3 1-.6-1.2z', '#fff', 0.8),
    colline: () => p('M1.5 20.5q4-10 10-10 4 0 6 4 3-2 5 1v5z', '#94c15a') + p('M1.5 20.5q6-7 12-4 4-3 9 0v4z', '#74a83f'),
    chalet: () => r(5, 11.5, 14, 9, 0.5, '#a0652e') + l('M5 14.5h14M5 17.5h14', '#7a4a20', 0.9) + p('M2 12.5L12 4l10 8.5z', '#f8f9fa') + p('M4 12.5L12 6l8 6.5', 'none', 1, ' stroke="#ced4da"') + r(9.8, 14.5, 4.4, 6, 0.5, '#5c3a1f', 1),
    porte: () => p('M3.5 21.5V11q0-8 8.5-8.5Q20.5 3 20.5 11v10.5h-3.5V11q0-5-5-5t-5 5v10.5z', '#adb5bd') + p('M7 21.5V11q0-5 5-5t5 5v10.5z', '#7048e8', 1) +
      p('M12 12.5q2.5 0 2.3 2.3-.3 2.4-3 2.2-3-.3-2.8-3.3.3-3.6 4-3.6 4.2.2 4 4.6', 'none', 1.2, ' stroke="#e5dbff"'),
    tente: () => p('M2 20.5L12 4l10 16.5z', '#ff922b') + p('M12 4L7.5 20.5h9z', '#e8590c', 1) + p('M12 12l-2.5 8.5h5z', '#3a2414', 0) + l('M12 4V1.8', K, 1.2),
    feu: () => p('M3.5 19.5l17-4M3.5 15.5l17 4', 'none', 2.6, ' stroke="#8d5a2b"') + p('M12 17q-5 0-5-4.5 0-3 3-5.5 0 2.5 2 3-.5-3.5 2.5-6.5 1 3 2.5 5 1.5 1.5 1.5 4 0 4.5-5 4.5z', '#ff922b') + p('M12 17q-2.3 0-2.3-2.2 0-1.6 1.5-2.8.3 1.2 1.4 1.4 0-1.4 1-2.3 1 1.5 1 3.2 0 2.7-2.3 2.7z', '#ffe066', 0.9),
    cendres: () => p('M3.5 19.5l17-4M3.5 15.5l17 4', 'none', 2.6, ' stroke="#5c534c"') + '<ellipse cx="12" cy="16.5" rx="5" ry="2.2" fill="#868e96" stroke="' + K + '" stroke-width="1"/>' + l('M11 12q-1.5-2 0-4t0-4', '#adb5bd', 1.2),
    tour: () => p('M7 21.5l1.5-13h7l1.5 13', 'none', 1.5, ' stroke="#8d5a2b"') + l('M8 14.5h8M7.5 18.5h9M9 11l6 7M15 11l-6 7', '#a0652e', 1) + r(6.5, 6, 11, 3.2, 0.5, '#b07a45') + p('M5.5 6.5L12 2l6.5 4.5z', '#c92a2a') + p('M12 2V.5l3 .8-3 .8', '#ffd43b', 0.8),
    faille: () => p('M2.5 14l4-4 3 2 3-4.5 3 3 4-3 2.5 4-2 4.5-4 2-3-1.5-4 2.5-3.5-2-2 .5z', '#1b0f2e') + p('M6 13.5l3-2 2.5 1.5 2.5-3 3 2', 'none', 1.3, ' stroke="#b197fc"') + c(9, 5.5, 1, '#d0bfff', 0) + c(14, 3.5, 0.8, '#d0bfff', 0) + c(17.5, 6.5, 0.9, '#d0bfff', 0),
    faillefermee: () => p('M2.5 14l4-4 3 2 3-4.5 3 3 4-3 2.5 4-2 4.5-4 2-3-1.5-4 2.5-3.5-2-2 .5z', '#868e96') + l('M7 13.5l3-2 2.5 1.5 2.5-3', '#495057', 1.3) + l('M9 15.5v3m-1.5-1.5h3M15 14v3m-1.5-1.5h3', '#9775fa', 1),
    trou: () => '<ellipse cx="12" cy="14" rx="9" ry="5.5" fill="#1b130c" stroke="' + K + '" stroke-width="1.3"/>' + p('M4 12.5q8-6 16 0', 'none', 1.4, ' stroke="#8d5a2b"'),
    tombe: () => p('M6 21.5V9q0-6 6-6t6 6v12.5z', '#adb5bd') + l('M12 7.5v8M9 10.5h6', '#495057', 1.6) + r(3.5, 20, 17, 2, 0.5, '#74a83f', 1),
    coffre: () => r(3.5, 10.5, 17, 10, 1, '#b8763a') + p('M3.5 11q0-6 8.5-6t8.5 6z', '#c98a4a') + l('M3.5 14.5h17', K, 1.2) + r(10.3, 12.5, 3.4, 4, 0.6, '#ffd43b', 1),
    cadeau: () => r(3.5, 9.5, 17, 4, 0.5, '#f06595') + r(5, 13.5, 14, 8, 0.5, '#f783ac') + r(10.5, 9.5, 3, 12, 0, '#ffd43b', 1) + p('M12 9.5q-6-6-6.5-2T12 9.5q6-6 6.5-2T12 9.5z', '#ffd43b', 1.1),
    cle: () => c(7, 12, 4.4, '#ffd43b') + c(7, 12, 1.6, '#fff8e7', 1) + p('M11.3 11h10v2.6h-2v2.5h-2.6v-2.5h-5.4z', '#ffd43b'),
    champignon: () => p('M9 13h6l.8 7.5q-3.8 1.5-7.6 0z', '#f8f1e3') + p('M2.5 13.5Q3 4 12 4t9.5 9.5z', '#e03131') + c(8, 9, 1.5, '#fff', 0) + c(14.5, 7.5, 1.3, '#fff', 0) + c(17, 11, 1.1, '#fff', 0),
    luciole: () => c(12, 12, 6.5, '#fff3bf', 0) + '<circle cx="12" cy="12" r="10" fill="#ffe066" opacity=".35"/>' + p('M12 4.5l1.4 5.1 5.1 1.4-5.1 1.4L12 17.5l-1.4-5.1-5.1-1.4 5.1-1.4z', '#fcc419', 1),
    fleur: () => l('M12 21v-7', '#2b8a3e', 1.6) + [0, 72, 144, 216, 288].map(a => '<ellipse cx="12" cy="6" rx="2.6" ry="3.6" transform="rotate(' + a + ' 12 10)" fill="#fff" stroke="' + K + '" stroke-width="1"/>').join('') + c(12, 10, 2.4, '#fcc419', 1),
    goutte: () => p('M12 2.5q7 8.5 7 12.5a7 7 0 01-14 0q0-4 7-12.5z', '#4dabf7') + p('M8.5 14.5q0 2.5 2 3.5', 'none', 1.4, ' stroke="#d0ebff"'),
    vague: () => p('M2 13q2.5-4 5 0t5 0 5 0 5 0v7.5H2z', '#4dabf7') + p('M2 17q2.5-3 5 0t5 0 5 0 5 0', 'none', 1.1, ' stroke="#d0ebff"'),
    brume: () => l('M3 8h12M6 12h15M3 16h13M8 20h10', '#868e96', 2.2),
    flocon: () => l('M12 2.5v19M3.8 7.3l16.4 9.4M3.8 16.7l16.4-9.4', '#4dabf7', 1.8) + l('M9.5 4l2.5 2 2.5-2M9.5 20l2.5-2 2.5 2M4 10.5l3 .2-.6-3M20 13.5l-3-.2.6 3M4 13.5l3-.2-.6 3M20 10.5l-3 .2.6-3', '#4dabf7', 1.3),
    nenuphar: () => p('M12 12L3.5 9q-1 8 8.5 10 9.5-2 8.5-10z', '#51cf66') + p('M12 12l-2-7q4 0 4 7z', '#f783ac', 1) + l('M12 12l7-2.5', '#2b8a3e', 0.9),
    // ---------- Objets ----------
    quete: () => p('M6 3.5h11q2 0 2 2v13H8q-2 0-2 2.5z', '#f3e2c0') + p('M6 21q-2.5 0-2.5-2.3T6 16.5h13v2.5q0 2-2 2z', '#e6cf9f') + l('M9 7.5h7M9 10.5h7M9 13.5h5', '#8a6a46', 1.1),
    carnet: () => p('M12 6.5Q8 4 3 4.5v14q5-.5 9 2 4-2.5 9-2v-14q-5-.5-9 2z', '#f3e2c0') + l('M12 6.5v14', K, 1.2) + l('M5.5 8.5q2.5 0 4.5 1M5.5 11.5q2.5 0 4.5 1M14 9.5q2-1 4.5-1M14 12.5q2-1 4.5-1', '#8a6a46', 1),
    livres: () => r(3.5, 5, 4.5, 16, 0.6, '#c92a2a') + r(8.5, 7, 4.5, 14, 0.6, '#1c7ed6') + p('M14 8l4.3-1 3 13.6-4.3 1z', '#2f9e44') + l('M3.5 8h4.5M8.5 10h4.5', '#fff', 1),
    carte: () => p('M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z', '#f3e2c0') + l('M9 4v14M15 6v14', '#c9a874', 1) + p('M5.5 13.5q3-4 5.5-1t5 0', 'none', 1.2, ' stroke="#c92a2a" stroke-dasharray="1.5 1.5"') + l('M16.5 9.5l2 2m0-2l-2 2', '#c92a2a', 1.3),
    loupe: () => c(10, 10, 6, '#d0ebff') + p('M14.5 14.5l6 6', 'none', 3, ' stroke="#8d5a2b"') + p('M7 8q1.5-2.5 4-2.5', 'none', 1.4, ' stroke="#fff"'),
    sac: () => p('M6.5 9.5q0-6 5.5-6t5.5 6', 'none', 1.6) + p('M4 9.5h16l-1.5 11.5h-13z', '#c98a4a') + r(9, 11.5, 6, 4, 1, '#a0652e', 1) + c(12, 13.5, 0.9, '#ffd43b', 0),
    outils: () => p('M4.5 19.5l9-9', 'none', 2.6, ' stroke="#8d5a2b"') + p('M11 5.5l4-2 5.5 5.5-2 4-3.5-.5-3.5-3.5z', '#868e96') + p('M19.5 19.5l-6.5-6.5', 'none', 2.6, ' stroke="#868e96"') + c(4.5, 19.5, 1.4, '#495057', 1),
    scie: () => p('M3 13.5h15v4H6q-3 0-3-4z', '#ced4da') + l('M5 17.5l1 1.3 1-1.3 1 1.3 1-1.3 1 1.3 1-1.3 1 1.3 1-1.3 1 1.3 1-1.3 1 1.3', K, 0.9) + r(17.5, 9.5, 4.5, 9, 1.5, '#a0652e'),
    hache: () => p('M6 21.5l10-15', 'none', 2.4, ' stroke="#8d5a2b"') + p('M13 4q4-1.5 7 2.5 1.5 4-1.5 6.5l-5-3.5z', '#adb5bd'),
    faucille: () => p('M7 20.5l4-5', 'none', 2.6, ' stroke="#8d5a2b"') + p('M11 15.5q-3-9 5-12 7-1.5 6 5-2-3.5-5.5-2.5-4 1.5-3.5 7.5z', '#ced4da'),
    pioche: () => p('M12 9l-6 12.5', 'none', 2.4, ' stroke="#8d5a2b"') + p('M3 7q8-6 18 0-9-2.5-18 0z', '#adb5bd'),
    lettre: () => r(3, 6, 18, 13, 1, '#f8f1e3') + p('M3 7l9 7 9-7', 'none', 1.2) + c(12, 14, 2, '#e03131', 1),
    coeurlettre: () => r(3, 6, 18, 13, 1, '#ffdeeb') + p('M3 7l9 7 9-7', 'none', 1.2) + p('M12 17.5s-3.5-2.2-3.5-4.2q0-1.6 1.6-1.6 1.2 0 1.9 1.2.7-1.2 1.9-1.2 1.6 0 1.6 1.6 0 2-3.5 4.2z', '#f06595', 0.9),
    epees: () => p('M5 3.5l13 13M19 3.5L6 16.5', 'none', 2.2, ' stroke="#adb5bd"') + l('M3.5 15l5.5 5.5M20.5 15L15 20.5', '#8d5a2b', 2.4) + l('M5 3.5L3.5 3l.5 1.5M19 3.5l1.5-.5-.5 1.5', K, 1),
    jumelles: () => p('M3.5 10.5l3.5-5h3v8h-3z', '#495057') + p('M20.5 10.5l-3.5-5h-3v8h3z', '#495057') + c(6.5, 15.5, 4, '#74c0fc') + c(17.5, 15.5, 4, '#74c0fc') + r(10, 9, 4, 3, 0.5, '#343a40', 1),
    longuevue: () => p('M3 14l14-7 2 4-14 7z', '#ffd43b') + p('M15.5 7.7l4-2 2 4-4 2z', '#c9a874') + l('M10 15.5l-2 6M10 15.5l3 6', '#8d5a2b', 1.5),
    lanterne: () => r(7.5, 7, 9, 12, 2, '#ff922b') + r(9.5, 9, 5, 8, 1, '#ffe066', 0.9) + r(7, 19, 10, 2.5, 0.8, '#495057', 1) + p('M9 7q0-4 3-4t3 4', 'none', 1.4),
    barque: () => p('M2 13h20q-2 7-10 7T2 13z', '#a0652e') + l('M4.5 16h15', '#7a4a20', 1) + p('M14 3l6 9', 'none', 1.8, ' stroke="#8d5a2b"') + p('M19 12.3l2.6 3.5', 'none', 2.6, ' stroke="#8d5a2b"'),
    clap: () => r(3, 10, 18, 11, 1, '#343a40') + p('M3 10l1.5-5.5 17-.5L21 10z', '#f8f9fa') + l('M7 9.8l2.5-5.3M12 9.8l2.5-5.6M17 9.8l2.5-5.7', '#343a40', 1.6) + l('M6 14h12M6 17h8', '#adb5bd', 1),
    microscope: () => p('M9 4l3-1.5 4.5 9-3 1.5z', '#ced4da') + r(5, 19.5, 14, 2, 0.8, '#495057') + p('M16 21v-5q0-4-4.5-4.5', 'none', 2, ' stroke="#495057"') + r(8, 15.5, 7, 1.8, 0.5, '#868e96', 1) + c(11.2, 12.8, 1.5, '#74c0fc', 1),
    bourse: () => p('M8 7.5q-5 4-5 9 0 4.5 9 4.5t9-4.5q0-5-5-9z', '#a0652e') + p('M7.5 7.5l1-3.5 3.5 2 3.5-2 1 3.5z', '#c98a4a') + l('M8 7.5h8', '#ffd43b', 1.6),
    musique: () => p('M8 16V5.5l11-2V14', 'none', 1.7) + '<ellipse cx="6" cy="16.5" rx="3" ry="2.3" fill="' + K + '"/><ellipse cx="17" cy="14.5" rx="3" ry="2.3" fill="' + K + '"/>' + l('M8 9l11-2', K, 1.7),
    graines: () => p('M12 21v-6', 'none', 1.6, ' stroke="#2b8a3e"') + p('M12 15q-6 0-6.5-6 6 0 6.5 6z', '#69db7c') + p('M12 13.5q5 0 6-5-5.5 0-6 5z', '#51cf66') + '<ellipse cx="12" cy="21" rx="6" ry="1.5" fill="#8d5a2b" stroke="' + K + '" stroke-width="1"/>',
    flute: () => p('M4 18.5L18.5 4l1.5 1.5L5.5 20z', '#c98a4a') + c(9.5, 13, 0.9, K, 0) + c(12, 10.5, 0.9, K, 0) + c(14.5, 8, 0.9, K, 0),
    // ---------- Interface ----------
    bulle: () => p('M4 4.5h16q1.5 0 1.5 1.5v9q0 1.5-1.5 1.5h-9L6 20.5v-4H4q-1.5 0-1.5-1.5V6q0-1.5 1.5-1.5z', '#fff8e7') + c(8, 10.5, 1.1, K, 0) + c(12, 10.5, 1.1, K, 0) + c(16, 10.5, 1.1, K, 0),
    rumeur: () => p('M5 4h14q2 0 2 2v7q0 2-2 2h-4l-4 4.5V15H5q-2 0-2-2V6q0-2 2-2z', '#f3e2c0') + l('M7 8h10M7 11h7', '#8a6a46', 1.2),
    son: () => p('M3.5 9h4l5-4.5v15l-5-4.5h-4z', '#adb5bd') + l('M15.5 9q2 3 0 6M18 6.5q4 5.5 0 11', K, 1.4),
    muet: () => p('M3.5 9h4l5-4.5v15l-5-4.5h-4z', '#adb5bd') + l('M15.5 9l5 6M20.5 9l-5 6', '#c92a2a', 1.8),
    inverser: () => l('M4 8.5h15M15.5 5l3.5 3.5-3.5 3.5M20 15.5H5M8.5 12L5 15.5 8.5 19', K, 1.7),
    plein: () => l('M3.5 9V3.5H9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15', K, 1.8),
    aide: () => c(12, 12, 9, '#ffd43b') + l('M9.3 9.5q0-3 2.7-3t2.7 2.7q0 1.8-2.7 2.8v2', K, 1.8) + c(12, 17, 1.1, K, 0),
    drapeau: () => l('M5.5 21.5V3', K, 1.6) + p('M5.5 4q4-2 7 0t7 0v8q-4 2-7 0t-7 0z', '#c92a2a'),
    boussole: () => c(12, 12, 9, '#f3e2c0') + p('M12 4.5l2.5 7.5h-5z', '#e03131', 1) + p('M12 19.5l-2.5-7.5h5z', '#dee2e6', 1) + c(12, 12, 1.2, K, 0),
    main: () => p('M7 13V6.5q0-1.5 1.3-1.5t1.3 1.5V11V4.5q0-1.5 1.3-1.5t1.3 1.5V11V5q0-1.5 1.3-1.5T15.7 5v6.5V8q0-1.5 1.3-1.5T18.3 8v6q0 7-6 7-4 0-6-4l-2.5-4q-1-1.7.5-2.4 1.3-.6 2.7 1z', '#ffc9a0'),
    boutique: () => p('M5 8h14l1 13H4z', '#f783ac') + p('M8.5 10V6.5q0-3.5 3.5-3.5t3.5 3.5V10', 'none', 1.6) + c(8.5, 10.2, 0.9, K, 0) + c(15.5, 10.2, 0.9, K, 0),
    sommeil: () => l('M5 7h5l-5 6h5M13 12h4l-4 5h4M18.5 4h3l-3 3.5h3', '#4dabf7', 1.7),
    paysage: () => r(2.5, 4, 19, 16, 2, '#a5d8ff') + p('M2.5 16l6-6.5 4 4 3-3 6 5.5V18q0 2-2 2h-15q-2 0-2-2z', '#69a84f') + c(17, 8, 2, '#ffd43b', 1),
    attention: () => p('M12 3l9.5 17h-19z', '#ffd43b') + l('M12 9.5v5.5', K, 2) + c(12, 17.5, 1.1, K, 0),
    poisson: () => p('M3 12q5-6 12-3l5-3.5v12L15 15q-7 3-12-3z', '#ff922b') + c(7.5, 11, 1, K, 0),
    feuille: () => p('M4 20q0-13 16-16-1 15-16 16z', '#51cf66') + l('M4 20L15 9', '#2b8a3e', 1.1),
    statue: () => r(4, 18.5, 16, 3, 0.6, '#868e96') + p('M8 18.5l1-7h6l1 7z', '#adb5bd') + c(12, 7.5, 3.5, '#adb5bd'),
    tabouret: () => r(4, 8, 16, 3.5, 1.2, '#c98a4a') + l('M6.5 11.5L5 21M17.5 11.5L19 21M8.5 11.5l-.5 9.5M15.5 11.5l.5 9.5', '#8d5a2b', 1.8) + l('M6 16.5h12', '#8d5a2b', 1.3),
    bouquet: () => p('M8.5 13l3.5 8.5 3.5-8.5z', '#c98a4a') + l('M10 13.5l1.5-4M14 13.5L13 9M12 14V8', '#2b8a3e', 1.2) + c(9, 7.5, 2.6, '#f783ac') + c(15, 7.5, 2.6, '#ffd43b') + c(12, 5, 2.6, '#ffffff') + c(12, 5, 0.9, '#fcc419', 0),
    nichoir: () => l('M12 21.5v-6', '#8d5a2b', 1.8) + r(6, 8, 12, 9, 0.5, '#c98a4a') + p('M4.5 9L12 3l7.5 6z', '#c92a2a') + c(12, 12, 2, '#3a2414', 0) + l('M12 15.5h2', K, 1.2),
    tulipe: () => l('M12 21v-9', '#2b8a3e', 1.6) + p('M12 17q-5-1-6-6 4.5 1 6 6zM12 15q4.5-.5 5.5-4.5-4 .5-5.5 4.5z', '#51cf66', 1) + p('M8 4.5l2 2 2-3 2 3 2-2v4q0 4-4 4t-4-4z', '#f06595'),
    boule: () => r(6, 17.5, 12, 4, 1, '#a0652e') + c(12, 10.5, 7, '#b197fc') + p('M8.5 8q1.5-2.5 4-3', 'none', 1.5, ' stroke="#f3f0ff"') + c(13.5, 11.5, 1.6, '#e5dbff', 0),
    fontaine: () => p('M3 15h18l-2 6H5z', '#adb5bd') + p('M5 15q1-3 7-3t7 3', '#4dabf7', 1) + r(10.5, 5, 3, 8, 1, '#ced4da') + p('M12 5q-5 0-6 5M12 5q5 0 6 5', 'none', 1.2, ' stroke="#4dabf7"'),
    descendre: () => c(12, 12, 9, '#f3e2c0') + l('M12 6.5v10M7.5 12.5l4.5 4.5 4.5-4.5', K, 2),
    jouer: () => p('M8 5l11 7-11 7z', '#51cf66'),
    chateau: () => r(4, 10, 16, 11.5, 0.5, '#adb5bd') + r(2.5, 6, 5, 15, 0.5, '#ced4da') + r(16.5, 6, 5, 15, 0.5, '#ced4da') + p('M2.5 6V4h1.6v1.2h1.8V4h1.6v2M16.5 6V4h1.6v1.2h1.8V4h1.6v2', '#ced4da', 1.1) +
      p('M10 21.5v-5q2-2.5 4 0v5z', '#5c3a1f', 1.1) + l('M4 13.5h16M8.5 10v3M15.5 10v3', '#868e96', 0.9) + l('M5 4V1.5', K, 1) + p('M5 1.5l3.5 1-3.5 1z', '#c92a2a', 0.8),
    ile: () => p('M1.5 19q5-2.6 10.5-2.6T22.5 19q-5 3-10.5 3t-10.5-3z', '#4dabf7') + p('M5 18.6q2.5-4.5 7-4.5t7 4.5q-3.5 1.2-7 1.2t-7-1.2z', '#f3d48a') +
      p('M12.5 15.2q-.4-5 1.6-9.4', 'none', 1.8, ' stroke="#8a5a2b"') + p('M14 6q-4-2.4-8 .4 4.2-.6 6 1.8M14 6q4.5-2 8 1.4-4-.8-6.2.6M14 6q-1.2-3.6-4.6-4.4 2.8 2.2 3 4.6M14 6q2.6-3.4 6.4-3-3 1-4.6 3.4', '#40c057', 1) +
      c(13.6, 7.3, 1.1, '#8a5a2b', 0.8) + l('M7.5 17.4q1.2-.8 2.4 0', '#fff3bf', 1),
        moi: () => c(12, 12, 8.5, '#ff922b') + c(12, 12, 3.5, '#fff', 1)
  };

  // Les émojis remplacés (une icône par émoji ; une même icône peut en couvrir plusieurs)
  var EMO = {
    '⭐': 'etoile', '🌟': 'etoile', '💎': 'cristal', '🪵': 'bois', '🪨': 'pierre', '🌿': 'plante', '🧪': 'fiole', '💖': 'coeur', '❤️': 'coeur', '🛡️': 'bouclier', '🪙': 'piece',
    '🔥': 'flamme', '💪': 'force', '🦘': 'bond', '👃': 'flair',
    '🏠': 'maison', '🏡': 'maison', '🏘️': 'hameau', '🛖': 'cabane', '⚒️': 'forge', '🗝️': 'crypte', '🌳': 'arbre', '🌲': 'sapin', '🏔️': 'montagne', '⛰️': 'colline',
    '🌀': 'porte', '⛺': 'tente', '🗼': 'tour', '🕳️': 'trou', '⚰️': 'tombe', '🧰': 'coffre', '🎁': 'cadeau', '🔑': 'cle', '🍄': 'champignon', '✨': 'luciole', '🌼': 'fleur',
    '💧': 'goutte', '🌊': 'vague', '🌫️': 'brume', '❄️': 'flocon', '📜': 'quete', '📖': 'carnet', '📚': 'livres', '🗺️': 'carte', '🔍': 'loupe', '🎒': 'sac', '🛠️': 'outils',
    '🪚': 'scie', '🪓': 'hache', '🌾': 'faucille', '⛏️': 'pioche', '✉️': 'lettre', '💌': 'coeurlettre', '⚔️': 'epees', '🔭': 'longuevue', '🏮': 'lanterne', '🛶': 'barque',
    '🎬': 'clap', '🏰': 'chateau', '🏝️': 'ile', '🔬': 'microscope', '👛': 'bourse', '🎶': 'musique', '🌱': 'graines', '🪈': 'flute', '💬': 'bulle', '🗣️': 'rumeur', '🔊': 'son', '🔇': 'muet', '⇄': 'inverser',
    '⛶': 'plein', '❓': 'aide', '❔': 'aide', '🏁': 'drapeau', '🚩': 'drapeau', '🧭': 'boussole', '👋': 'main', '🛍️': 'boutique', '😴': 'sommeil', '🏞️': 'paysage',
    '⚠️': 'attention', '🐟': 'poisson', '🪑': 'tabouret', '💐': 'bouquet', '🐦': 'nichoir', '🗿': 'statue', '🌷': 'tulipe', '🔮': 'boule', '⛲': 'fontaine',
    '⬇️': 'descendre', '▶️': 'jouer'
  };
  // Les habitants : leur portrait dessiné (vallee-dessins.js)
  var HAB = { '🦉': 'hibou', '🦔': 'herisson', '🐻': 'ours', '🐢': 'tortue', '🐱': 'chat', '🐸': 'grenouille', '🐐': 'bouquetin', '🦡': 'blaireau' };

  function interieur(nom) { return I[nom] ? I[nom]() : ''; }
  function svg(nom, taille, classe) {
    var t = taille || 22;
    return '<svg class="vlp' + (classe ? ' ' + classe : '') + '" viewBox="0 0 24 24" width="' + t + '" height="' + t + '" aria-hidden="true">' + interieur(nom) + '</svg>';
  }
  function g(nom, cx, cy, taille) {
    var k = (taille || 12) / 24;
    return '<g transform="translate(' + f(cx - 12 * k) + ' ' + f(cy - 12 * k) + ') scale(' + f(k * 1000) / 1000 + ')">' + interieur(nom) + '</g>';
  }
  function echapper(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var CLES = Object.keys(EMO).concat(Object.keys(HAB)).sort((a, b) => b.length - a.length);
  var RE = new RegExp('(' + CLES.map(k => k.replace(/️/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\uFE0F?').join('|') + ')', 'g');
  function cle(e) { e = e.replace(/️/g, ''); return Object.keys(EMO).find(k => k.replace(/️/g, '') === e) || Object.keys(HAB).find(k => k === e); }
  // Un texte (échappé) où les émojis connus deviennent des icônes, à la taille du texte par défaut
  function riche(texte, taille) {
    return echapper(texte).replace(RE, m => {
      var k = cle(m);
      if (HAB[k] && typeof VLD !== 'undefined' && VLD.habitant) return '<span class="vlp-hab">' + VLD.habitant(HAB[k], taille || 20) + '</span>';
      return EMO[k] ? svg(EMO[k], taille, 'vlp-t') : m;
    });
  }
  function nom(emoji) { var k = cle(emoji || ''); return k && EMO[k] ? EMO[k] : null; }
  function habitant(emoji) { var k = cle(emoji || ''); return k && HAB[k] ? HAB[k] : null; }

  return { svg: svg, g: g, riche: riche, nom: nom, habitant: habitant, NOMS: Object.keys(I), EMO: EMO };
})();
if (typeof module !== 'undefined') module.exports = VLP;
