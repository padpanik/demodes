// ================== DONJON DES COMPAGNONS : DESSINS DES MONSTRES ET DU DÉCOR DE COMBAT (SVG dessiné par le code) ==================
// Un seul style pour tous : contour sombre, couleur franche, une ombre plus foncée, un reflet clair, de grands yeux.
// Pas de dégradé (des identifiants partagés entre dessins cachés et visibles feraient disparaître les couleurs).
// DJS.monstre(type) rend un <svg viewBox="0 0 40 40"> ; DJS.decor(étage, sol, mur, rang) le fond de la scène de combat ; utilisés par donjon/index.html.

var DJS = (function () {
  var O = '#241812';          // contour
  function svg(corps) { return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">' + corps + '</svg>'; }
  function ombre(rx) { return '<ellipse cx="20" cy="37.5" rx="' + (rx || 13) + '" ry="2.6" fill="rgba(0,0,0,.35)"/>'; }
  function p(d, fill, ep, extra) { return '<path d="' + d + '" fill="' + fill + '" stroke="' + O + '" stroke-width="' + (ep === undefined ? 1.6 : ep) + '" stroke-linejoin="round" stroke-linecap="round"' + (extra || '') + '/>'; }
  function c(x, y, r, fill, ep) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + (ep ? ' stroke="' + O + '" stroke-width="' + ep + '"' : '') + '/>'; }
  function e(x, y, rx, ry, fill, ep) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (ep ? ' stroke="' + O + '" stroke-width="' + ep + '"' : '') + '/>'; }
  function l(d, coul, ep) { return '<path d="' + d + '" fill="none" stroke="' + (coul || O) + '" stroke-width="' + (ep || 1.4) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  // Deux yeux : blanc, pupille, reflet (ou yeux luisants sans blanc)
  function yeux(x1, x2, y, r, pupille) {
    return [x1, x2].map(x => c(x, y, r, '#fff', 1.1) + c(x + r * 0.2, y + r * 0.15, r * 0.55, pupille || '#222') + c(x + r * 0.45, y - r * 0.3, r * 0.22, '#fff')).join('');
  }
  function luisants(x1, x2, y, r, coul) { return [x1, x2].map(x => c(x, y, r * 1.9, coul, 0) .replace('/>', ' opacity=".25"/>') + c(x, y, r, coul)).join(''); }
  function couronne(x, y, s) {
    s = s || 1;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + p('M-8 4 L-6 -4 L-2.5 1 L0 -6 L2.5 1 L6 -4 L8 4 Z', '#ffd43b', 1.2) + c(0, -6, 1.1, '#e64980') + c(-6, -4, 0.9, '#4dabf7') + c(6, -4, 0.9, '#4dabf7') + '</g>';
  }

  var D = {
    gluant: function (roi) {
      var cl = roi ? '#9c36b5' : '#69db7c', fo = roi ? '#6b2380' : '#2f9e44';
      return ombre(14) + p('M5 34 Q4 14 20 10 Q36 14 35 34 Q20 37 5 34 Z', cl, 1.8) +
        '<path d="M8 33 Q7 22 13 17" fill="none" stroke="' + fo + '" stroke-width="3" opacity=".45" stroke-linecap="round"/>' +
        e(14, 18, 4, 2.6, '#fff', 0).replace('/>', ' opacity=".55"/>') + yeux(15, 25, 25, 3) +
        (roi ? couronne(20, 9.5, 1.05) + l('M15 30 Q20 33 25 30') : l('M17 30 Q20 32 23 30'));
    },
    chauve: function () {
      return ombre(9) +
        p('M20 18 Q12 8 3 13 Q6 15 5 19 Q9 17 10 21 Q13 18 16 22 Z', '#5f3dc4') + p('M20 18 Q28 8 37 13 Q34 15 35 19 Q31 17 30 21 Q27 18 24 22 Z', '#5f3dc4') +
        e(20, 21, 6.5, 7.5, '#7048e8', 1.6) + p('M15.5 15 L14.5 9.5 L18 13.5 Z', '#7048e8', 1.2) + p('M24.5 15 L25.5 9.5 L22 13.5 Z', '#7048e8', 1.2) +
        e(20, 23.5, 3.5, 3.2, '#9775fa', 0) + luisants(17.5, 22.5, 19.5, 1.5, '#ffd43b') +
        p('M18.2 25 L18.8 27.4 L19.4 25 Z', '#fff', 0.8) + p('M20.6 25 L21.2 27.4 L21.8 25 Z', '#fff', 0.8);
    },
    champi: function () {
      return ombre(10) + p('M13 22 Q12 34 14 35 L26 35 Q28 34 27 22 Z', '#fff4e6') +
        p('M5 23 Q5 7 20 6 Q35 7 35 23 Q20 27 5 23 Z', '#e03131', 1.8) +
        c(12, 15, 2.6, '#fff') + c(21, 11, 2, '#fff') + c(28, 17, 2.4, '#fff') + c(17, 19, 1.5, '#fff') +
        yeux(17, 23, 28.5, 1.9) + l('M18.5 32 Q20 33 21.5 32');
    },
    rat: function () {
      return ombre(12) + l('M31 30 Q38 29 36 22 Q35 19 37 16', '#e599a7', 1.8) +
        p('M7 31 Q6 20 18 18 Q31 18 32 29 Q32 34 20 34 Q8 34 7 31 Z', '#868e96') +
        p('M9 24 Q4 23 3 26 Q5 29 10 28 Z', '#868e96', 1.4) + c(12.5, 19, 3.6, '#adb5bd', 1.3) + c(12.5, 19, 1.8, '#e599a7') +
        c(3.2, 26, 1.2, '#e64980') + c(9, 23.5, 1.6, '#222') + c(9.5, 23, 0.5, '#fff') +
        l('M5 27 L1 28 M5 26 L1 25.5', O, 0.8) + p('M14 34 L14 36 M24 34 L24 36', 'none', 1.6);
    },
    brute: function () {
      return ombre(14) + p('M8 36 L10 26 Q8 18 20 16 Q32 18 30 26 L32 36 Z', '#5c940d', 1.8) +
        p('M10 30 L30 30 L31 36 L9 36 Z', '#8d5a2b', 1.5) + l('M10 31 L30 31', '#5d3a18', 1.2) +
        c(20, 13, 8, '#74b816', 1.8) + p('M12 10 L5 6 L11 14 Z', '#74b816', 1.4) + p('M28 10 L35 6 L29 14 Z', '#74b816', 1.4) +
        l('M14.5 9.5 L18 11.5 M25.5 9.5 L22 11.5', O, 1.8) + luisants(17, 23, 12.5, 1.2, '#ffe066') +
        p('M15 17 Q20 20 25 17', '#2b1d14', 1.2) + p('M16 17.2 L16.8 14.5 L17.8 17.5 Z', '#fff', 0.8) + p('M24 17.2 L23.2 14.5 L22.2 17.5 Z', '#fff', 0.8) +
        p('M33 13 L37 5 Q40 4 39 8 L35 15 Z', '#a0703f', 1.4) + c(37.5, 6, 1, '#ced4da', 0.8);
    },
    squelette: function () {
      return ombre(10) + l('M20 21 L20 33 M14 24 Q20 26 26 24 M14.5 27 Q20 29 25.5 27 M15 30 Q20 32 25 30', '#f1f3f5', 2.4) +
        l('M20 21 L20 33 M14 24 Q20 26 26 24 M14.5 27 Q20 29 25.5 27 M15 30 Q20 32 25 30', O, 0.6) +
        l('M14 23 L8 29 L7 33 M26 23 L32 28 L34 24', '#f1f3f5', 2.4) + l('M17 33 L16 37 M23 33 L24 37', '#f1f3f5', 2.4) +
        p('M11 13 Q11 4 20 4 Q29 4 29 13 Q29 18 25 19 L25 22 L15 22 L15 19 Q11 18 11 13 Z', '#f8f9fa', 1.7) +
        e(16.2, 12.5, 2.8, 3.2, '#241812') + e(23.8, 12.5, 2.8, 3.2, '#241812') + c(16.6, 12.8, 1, '#ff6b6b') + c(23.4, 12.8, 1, '#ff6b6b') +
        p('M19 16 L20 14.5 L21 16 Z', '#241812', 0.6) + l('M17 19.5 L17 22 M20 19.5 L20 22 M23 19.5 L23 22', O, 0.8);
    },
    araignee: function (reine) {
      var cl = reine ? '#5f3dc4' : '#343a40', fo = reine ? '#845ef7' : '#495057';
      var pattes = [[-1, 14, 22, 5, 15, 2, 24], [-1, 14, 25, 4, 22, 1, 30], [-1, 15, 27, 6, 28, 3, 35], [-1, 16, 28, 9, 32, 8, 37]]
        .map(q => [l('M' + q[1] + ' ' + q[2] + ' Q' + q[3] + ' ' + q[4] + ' ' + q[5] + ' ' + q[6], O, 2.2), l('M' + (40 - q[1]) + ' ' + q[2] + ' Q' + (40 - q[3]) + ' ' + q[4] + ' ' + (40 - q[5]) + ' ' + q[6], O, 2.2)].join('')).join('');
      return ombre(15) + pattes + e(20, 21, 9, 8.5, cl, 1.8) + e(17, 17, 3.5, 2.2, fo, 0).replace('/>', ' opacity=".8"/>') +
        p('M17 13 L20 18 L23 13 L20 15 Z', reine ? '#e64980' : '#e03131', 0.8) +
        e(20, 28, 6, 4.5, fo, 1.5) + luisants(17, 23, 26.5, 1.3, '#ff6b6b') + c(14.8, 28.8, 0.8, '#ff6b6b') + c(25.2, 28.8, 0.8, '#ff6b6b') +
        p('M18.5 31.5 L18.2 34 L19.5 32 Z M21.5 31.5 L21.8 34 L20.5 32 Z', '#fff', 0.6) + (reine ? couronne(20, 12.5, 1) : '');
    },
    araignon: function () {
      var pattes = [[13, 26, 7, 22, 5, 28], [13, 28, 7, 30, 6, 35], [14, 30, 10, 34, 10, 37]]
        .map(q => l('M' + q[0] + ' ' + q[1] + ' Q' + q[2] + ' ' + q[3] + ' ' + q[4] + ' ' + q[5], O, 1.8) + l('M' + (40 - q[0]) + ' ' + q[1] + ' Q' + (40 - q[2]) + ' ' + q[3] + ' ' + (40 - q[4]) + ' ' + q[5], O, 1.8)).join('');
      return ombre(9) + pattes + e(20, 28, 7, 6, '#495057', 1.6) + luisants(17.5, 22.5, 27, 1.3, '#ff922b');
    },
    gobelin: function () {
      return ombre(11) + p('M11 36 L13 25 Q20 22 27 25 L29 36 Z', '#8d5a2b', 1.6) + p('M14 25 L20 33 L26 25', '#5d3a18', 1.2) +
        p('M11 16 L1 11 L9 20 Z', '#82c91e', 1.4) + p('M29 16 L39 11 L31 20 Z', '#82c91e', 1.4) +
        c(20, 16, 9, '#94d82d', 1.8) + p('M12 12 Q20 3 28 12 Q24 9 20 9.5 Q16 9 12 12 Z', '#6b4423', 1.2) +
        yeux(16.5, 23.5, 15.5, 2.6, '#c92a2a') + e(20, 19.5, 1.8, 1.3, '#5c940d', 0) +
        p('M14.5 21 Q20 26 25.5 21 Z', '#2b1d14', 1.1) + p('M16.5 21.6 L17.3 23.4 L18.2 22.2 Z M23.5 21.6 L22.7 23.4 L21.8 22.2 Z', '#fff', 0.6) +
        c(33, 30, 3.5, '#ffd43b', 1.3) + '<text x="33" y="31.6" font-size="4.5" text-anchor="middle" font-weight="900" fill="#a8590f">$</text>';
    },
    fantome: function () {
      return '<ellipse cx="20" cy="37.5" rx="9" ry="2" fill="rgba(0,0,0,.2)"/>' +
        p('M8 33 Q7 8 20 7 Q33 8 32 33 Q29 30 27 34 Q24 30 21 34 Q18 30 15 34 Q12 30 8 33 Z', '#e7f5ff', 1.7) +
        '<path d="M11 28 Q10 14 17 11" fill="none" stroke="#a5d8ff" stroke-width="3" opacity=".6" stroke-linecap="round"/>' +
        e(16, 18, 2.5, 3.6, '#1c2a3a') + e(24, 18, 2.5, 3.6, '#1c2a3a') + c(16.6, 16.8, 0.8, '#fff') + c(24.6, 16.8, 0.8, '#fff') +
        e(20, 25.5, 2.6, 3, '#1c2a3a') + p('M5 21 Q3 18 6 16 Q8 19 8 22 Z', '#e7f5ff', 1.3) + p('M35 21 Q37 18 34 16 Q32 19 32 22 Z', '#e7f5ff', 1.3);
    },
    gargouille: function () {
      return ombre(15) +
        p('M13 17 Q4 6 1 14 Q4 15 3 19 Q7 17 8 21 Q10 18 13 22 Z', '#868e96', 1.5) + p('M27 17 Q36 6 39 14 Q36 15 37 19 Q33 17 32 21 Q30 18 27 22 Z', '#868e96', 1.5) +
        p('M10 36 Q9 22 20 20 Q31 22 30 36 Z', '#adb5bd', 1.8) + p('M12 36 L13 31 L17 33 L17 36 Z M28 36 L27 31 L23 33 L23 36 Z', '#868e96', 1.2) +
        c(20, 14, 8, '#adb5bd', 1.8) + p('M13 9 L10 2 L16 7 Z', '#dee2e6', 1.2) + p('M27 9 L30 2 L24 7 Z', '#dee2e6', 1.2) +
        l('M14.5 11 L18 13 M25.5 11 L22 13', O, 1.6) + luisants(16.8, 23.2, 14, 1.3, '#ff922b') +
        p('M15 18 Q20 21.5 25 18 Z', '#495057', 1.1) + l('M13 24 L16 27 M27 25 L25 28 M18 30 L21 29', '#868e96', 1);
    },
    sorciere: function () {
      return ombre(12) + p('M9 36 Q11 22 20 21 Q29 22 31 36 Z', '#5f3dc4', 1.7) + l('M13 30 L15 34 M27 30 L25 34', '#7950f2', 1.2) +
        c(20, 17, 6.5, '#8ce99a', 1.6) + p('M20 17 L24 21 L20 20.5 Z', '#69db7c', 1) +
        p('M6 12 Q20 15 34 12 Q31 9.5 26 10 L22 1 Q19 0 18 3 L15 10 Q10 9.5 6 12 Z', '#3b2a6e', 1.6) + p('M15 10 Q20 11.5 25 10 L25.5 11.6 Q20 13.2 14.5 11.6 Z', '#fab005', 1) +
        yeux(17.5, 22.5, 16, 1.6, '#5c940d') + l('M17.5 21.5 Q20 23 22.5 21.5') + l('M13 15 Q11 24 12 28 M27 15 Q29 24 28 28', '#adb5bd', 1.6) +
        l('M33 36 L35 14', '#8d5a2b', 2) + c(35, 13, 2.4, '#e599f7', 1.2);
    },
    diablotin: function () {
      return ombre(10) + l('M27 31 Q35 31 34 24', '#c92a2a', 1.8) + p('M33 22 L35.5 25.5 L31.5 25.5 Z', '#c92a2a', 1.1) +
        p('M13 36 Q12 25 20 24 Q28 25 27 36 Z', '#e03131', 1.6) + c(20, 17, 8, '#fa5252', 1.7) +
        p('M13 12 Q11 5 15 3 Q14 7 16 10 Z', '#fff4e6', 1.2) + p('M27 12 Q29 5 25 3 Q26 7 24 10 Z', '#fff4e6', 1.2) +
        l('M14.5 13.5 L18 15 M25.5 13.5 L22 15', O, 1.5) + luisants(17, 23, 16.5, 1.4, '#ffe066') +
        p('M14 20 Q20 26 26 20 Q20 22 14 20 Z', '#2b1d14', 1) + p('M16 20.7 L17 22.6 L18 21.3 Z M24 20.7 L23 22.6 L22 21.3 Z', '#fff', 0.6) +
        p('M7 26 L4 18 L9 23 Z', '#ff922b', 1).replace('/>', ' opacity=".9"/>') + c(6, 17, 2.2, '#ffd43b', 0);
    },
    chevalier: function () {
      return ombre(13) + p('M10 36 L11 23 Q20 19 29 23 L30 36 Z', '#495057', 1.8) + l('M20 23 L20 36 M11 29 L29 29', '#343a40', 1.2) +
        p('M12 17 Q11 5 20 5 Q29 5 28 17 Q27 21 20 21 Q13 21 12 17 Z', '#868e96', 1.8) + p('M14 13 L26 13 L25.5 15.5 L14.5 15.5 Z', '#212529', 1) +
        '<rect x="15" y="13.6" width="10" height="1.3" rx=".6" fill="#ff6b6b"/>' + l('M20 5 L20 12', '#adb5bd', 1) +
        p('M20 5 Q24 -1 31 2 Q26 3 25 7 Z', '#c92a2a', 1.2) +
        p('M2 22 L11 20 L11 32 Q6 34 2 30 Z', '#343a40', 1.6) + p('M6.5 23 L6.5 30 M3.5 26 L9.5 26', 'none', 1).replace('stroke="' + O + '"', 'stroke="#fab005"') +
        l('M31 34 L37 12', '#ced4da', 2.4) + l('M29 30 L34 32', '#fab005', 2);
    },
    golem: function () {
      return ombre(15) + p('M6 36 L7 24 L13 20 L27 20 L33 24 L34 36 Z', '#8d7b68', 1.8) + p('M13 20 L16 28 L24 28 L27 20', 'none', 1.2) +
        p('M3 22 L9 20 L11 31 L5 33 Z', '#a8957f', 1.6) + p('M37 22 L31 20 L29 31 L35 33 Z', '#a8957f', 1.6) +
        p('M12 8 L16 3 L25 3 L29 9 L28 18 L20 21 L12 18 Z', '#a8957f', 1.8) + l('M16 3 L18 9 L16 13 M25 3 L24 8 M28 13 L24 15', '#6d5e4f', 1) +
        '<rect x="14" y="10" width="4.2" height="2.6" rx="1" fill="#3bc9db"/><rect x="22" y="10" width="4.2" height="2.6" rx="1" fill="#3bc9db"/>' +
        c(20, 26, 2.2, '#3bc9db') + c(20, 26, 4, '#3bc9db', 0).replace('/>', ' opacity=".25"/>') + l('M16 16.5 L24 16.5', O, 1.4) +
        '<path d="M8 25 l1.5 2 l-1 2 M31 25 l-1 2 l1.5 2" fill="none" stroke="#3bc9db" stroke-width="1"/>';
    },
    minotaure: function () {
      return ombre(15) + p('M8 36 Q8 22 20 21 Q32 22 32 36 Z', '#8d5a2b', 1.8) + p('M12 25 Q20 30 28 25', 'none', 1.2) +
        p('M11 12 Q2 11 2 3 Q6 8 12 8 Z', '#fff4e6', 1.4) + p('M29 12 Q38 11 38 3 Q34 8 28 8 Z', '#fff4e6', 1.4) +
        p('M11 13 Q11 5 20 5 Q29 5 29 13 L27 20 Q20 24 13 20 Z', '#a0703f', 1.8) +
        e(20, 18.5, 5.5, 3.6, '#d9a066', 1.2) + c(17.8, 18.4, 0.9, O) + c(22.2, 18.4, 0.9, O) +
        '<path d="M18 21 Q20 24.5 22 21" fill="none" stroke="#fab005" stroke-width="1.6"/>' +
        l('M14 10.5 L17.5 12.5 M26 10.5 L22.5 12.5', O, 1.6) + luisants(16.5, 23.5, 12.5, 1.2, '#ff6b6b') +
        p('M33 36 L38 18 L36 16 L31 34 Z', '#adb5bd', 1.2) + p('M35 16 Q41 13 39 21 Z', '#ced4da', 1.2);
    },
    ombre: function () {
      return ombre(13) + p('M7 36 Q9 18 20 14 Q31 18 33 36 Q27 33 20 36 Q13 33 7 36 Z', '#3b2a6e', 1.8) +
        '<path d="M11 33 Q12 22 18 17" fill="none" stroke="#5f3dc4" stroke-width="3" opacity=".6" stroke-linecap="round"/>' +
        p('M11 17 Q10 4 20 3 Q30 4 29 17 Q26 21 20 21 Q14 21 11 17 Z', '#2b1d4e', 1.8) +
        e(20, 14, 6.5, 5.2, '#120a24') + luisants(17.3, 22.7, 14, 1.3, '#b197fc') +
        l('M30 34 L37 9', '#9775fa', 2.4) + l('M28 27 L34 29', '#e599f7', 2) + c(37.5, 8, 1.6, '#e599f7', 0);
    },
    liche: function () {
      return ombre(14) + p('M7 36 Q8 20 20 18 Q32 20 33 36 Q27 33 20 36 Q13 33 7 36 Z', '#5f3dc4', 1.8) +
        p('M14 20 L20 30 L26 20', '#ffd43b', 1.1) + l('M9 30 L11 34 M31 30 L29 34', '#7950f2', 1.2) +
        p('M12 14 Q12 5 20 5 Q28 5 28 14 Q28 18 25 19 L24 21 L16 21 L15 19 Q12 18 12 14 Z', '#f8f9fa', 1.7) +
        e(16.6, 13, 2.6, 3, '#241812') + e(23.4, 13, 2.6, 3, '#241812') + luisants(16.8, 23.2, 13.3, 1.1, '#69db7c') +
        p('M19 16.5 L20 15 L21 16.5 Z', '#241812', 0.6) + l('M17.5 19.5 L17.5 21 M20 19.5 L20 21 M22.5 19.5 L22.5 21', O, 0.8) + couronne(20, 4.2, 0.95) +
        l('M7 37 L6.5 13', '#5d3a18', 2.2) + c(6.5, 11.5, 3, '#69db7c', 1.3) + c(6.5, 11.5, 5, '#69db7c', 0).replace('/>', ' opacity=".25"/>');
    }
  };
  var ALIAS = { gluantgeant: 'gluant', gluantmoyen: 'gluant' };
  var cache = {};
  function monstre(type) {
    if (cache[type]) return cache[type];
    var f = type === 'roi' ? function () { return D.gluant(true); } : type === 'reine' ? function () { return D.araignee(true); } : D[ALIAS[type] || type];
    if (type === 'gluantgeant') f = function () { return D.gluant(false).replace('#69db7c', '#38d9a9').replace('#2f9e44', '#0ca678'); };
    if (type === 'gluantmoyen') f = function () { return D.gluant(false).replace('#69db7c', '#a9e34b'); };
    return (cache[type] = svg(f ? f() : D.gluant(false)));
  }

  // ---------- Décor de la scène de combat (3.36) : un mur, un sol en perspective et deux torches, aux couleurs de l'étage ----------
  // viewBox 360 × 440, affiché en « slice » : la ligne d'horizon (y = 220) reste au milieu de la scène, quelle que soit sa hauteur.
  // Une scène basse (petit téléphone) ne montre que y = 115 à 325 : les torches, niches et bannières tiennent dans cette bande,
  // sur les côtés pour ne pas se mêler aux annonces des monstres. Identifiants « djc- » : un seul décor à l'écran à la fois.
  function decor(etage, sol, mur, rang) {
    var s = '', i, x, y, HZ = 220;
    var teinte = rang === 'boss' ? '#9c36b5' : rang === 'elite' ? '#fab005' : '#ffb347';
    s += '<defs><radialGradient id="djc-lueur"><stop offset="0%" stop-color="#ffb347" stop-opacity=".55"/><stop offset="100%" stop-color="#ff922b" stop-opacity="0"/></radialGradient>' +
         '<radialGradient id="djc-halo"><stop offset="0%" stop-color="' + teinte + '" stop-opacity="' + (rang === 'normal' ? '.22' : '.34') + '"/><stop offset="100%" stop-color="' + teinte + '" stop-opacity="0"/></radialGradient>' +
         '<linearGradient id="djc-haut" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#000" stop-opacity=".75"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></linearGradient>' +
         '<linearGradient id="djc-bas" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".8"/></linearGradient>' +
         '<linearGradient id="djc-cote" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#000" stop-opacity=".5"/><stop offset="16%" stop-color="#000" stop-opacity="0"/><stop offset="84%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".5"/></linearGradient></defs>';
    // Le mur et ses pierres
    s += '<rect width="360" height="' + HZ + '" fill="' + mur[0] + '"/>';
    var joints = '';
    for (y = HZ - 7 - 22 * 9, i = 0; y < HZ - 8; y += 22, i++) {
      joints += 'M0 ' + y + ' H360 ';
      for (x = (i % 2 ? 0 : 22); x < 360; x += 44) joints += 'M' + x + ' ' + y + ' v22 ';
    }
    s += '<path d="' + joints + '" stroke="' + mur[2] + '" stroke-width="1.6" fill="none"/>';
    for (i = 0; i < 12; i++) s += '<rect x="' + ((i * 97) % 316 + (i % 2 ? 0 : 22) - ((i * 97) % 316) % 44 + 1) + '" y="' + (HZ - 7 - 22 * (1 + (i * 5) % 9) + 1) + '" width="42" height="20" fill="' + mur[1] + '" opacity=".5"/>';
    // Selon l'étage : stalactites et mousse, niches à crânes, bannières
    if (etage === 1) {
      [22, 58, 101, 139, 176, 213, 252, 296, 338].forEach(function (sx, k) { var h = 26 + (k * 17 % 30); s += '<path d="M' + (sx - 11) + ' 0 L' + sx + ' ' + h + ' L' + (sx + 11) + ' 0 Z" fill="' + mur[2] + '" stroke="#120c09" stroke-width="1.2"/>'; });
      [[70, 210], [108, 214], [256, 211], [300, 214], [186, 215]].forEach(function (m) { s += '<ellipse cx="' + m[0] + '" cy="' + m[1] + '" rx="14" ry="6" fill="#4d6b34" opacity=".8"/><ellipse cx="' + (m[0] + 6) + '" cy="' + (m[1] - 3) + '" rx="7" ry="4" fill="#6f8f45" opacity=".8"/>'; });
    } else if (etage === 2) {
      [84, 276].forEach(function (nx) {
        s += '<path d="M' + (nx - 18) + ' 208 V152 Q' + nx + ' 122 ' + (nx + 18) + ' 152 V208 Z" fill="#131318" stroke="' + mur[1] + '" stroke-width="4"/>' +
             '<path d="M' + (nx - 9) + ' 193 Q' + (nx - 11) + ' 175 ' + nx + ' 175 Q' + (nx + 11) + ' 175 ' + (nx + 9) + ' 193 L' + (nx + 5.5) + ' 201 H' + (nx - 5.5) + ' Z" fill="#d8d2c2" stroke="#241812" stroke-width="1.4"/>' +
             '<circle cx="' + (nx - 4) + '" cy="187" r="2.7" fill="#241812"/><circle cx="' + (nx + 4) + '" cy="187" r="2.7" fill="#241812"/><path d="M' + (nx - 3) + ' 197 v4 M' + nx + ' 197 v4 M' + (nx + 3) + ' 197 v4" stroke="#241812" stroke-width="1"/>';
      });
    } else {
      [84, 276].forEach(function (bx) {
        s += '<rect x="' + (bx - 19) + '" y="122" width="38" height="4" rx="2" fill="#fab005" stroke="#241812" stroke-width="1"/>' +
             '<path d="M' + (bx - 16) + ' 126 h32 v66 l-16 -12 l-16 12 Z" fill="#a61e1e" stroke="#fab005" stroke-width="2"/><circle cx="' + bx + '" cy="151" r="7.5" fill="#fab005"/><circle cx="' + bx + '" cy="151" r="3.2" fill="#a61e1e"/>';
      });
    }
    s += '<rect width="360" height="110" fill="url(#djc-haut)"/>';
    // La plinthe, puis le sol : dalles qui fuient vers le milieu de l'horizon
    s += '<rect y="' + (HZ - 7) + '" width="360" height="8" fill="' + mur[1] + '"/><rect y="' + (HZ - 1) + '" width="360" height="3" fill="#120c09" opacity=".7"/>';
    s += '<rect y="' + (HZ + 2) + '" width="360" height="' + (438 - HZ) + '" fill="' + sol[0] + '"/>';
    var lignes = '', LY = [0, 8, 20, 38, 64, 102, 160, 220];
    // Une dalle sur deux plus claire, en damier
    for (var r = 0; r < LY.length - 1; r++) for (i = -8; i < 8; i++) {
      if ((i + r) % 2) continue;
      var y0 = HZ + 2 + LY[r], y1 = HZ + 2 + LY[r + 1], f0 = 1 + LY[r] / 44, f1 = 1 + LY[r + 1] / 44;
      s += '<path d="M' + (180 + i * 24 * f0) + ' ' + y0 + ' L' + (180 + (i + 1) * 24 * f0) + ' ' + y0 + ' L' + (180 + (i + 1) * 24 * f1) + ' ' + y1 + ' L' + (180 + i * 24 * f1) + ' ' + y1 + ' Z" fill="' + sol[1] + '" opacity=".7"/>';
    }
    for (i = -8; i <= 8; i++) lignes += 'M' + (180 + i * 24) + ' ' + (HZ + 2) + ' L' + (180 + i * 24 * 6) + ' 440 ';
    LY.slice(1, 7).forEach(function (ly) { lignes += 'M0 ' + (HZ + 2 + ly) + ' H360 '; });
    s += '<path d="' + lignes + '" stroke="' + sol[2] + '" stroke-width="1.6" fill="none"/>';
    if (etage === 2) [[40, 292], [300, 306], [76, 330]].forEach(function (o) { s += '<path d="M' + o[0] + ' ' + o[1] + ' l18 5" stroke="#d8d2c2" stroke-width="3.6" stroke-linecap="round"/><circle cx="' + o[0] + '" cy="' + o[1] + '" r="2.8" fill="#d8d2c2"/><circle cx="' + (o[0] + 18) + '" cy="' + (o[1] + 5) + '" r="2.8" fill="#d8d2c2"/>'; });
    if (etage === 3) [[36, 262], [322, 284], [66, 318], [296, 330], [20, 300]].forEach(function (o, k) { s += '<circle cx="' + o[0] + '" cy="' + o[1] + '" r="10" fill="#ff6b3d" opacity=".16"/><circle class="djc-braise" style="animation-delay:' + (k * 0.4) + 's" cx="' + o[0] + '" cy="' + o[1] + '" r="2.8" fill="#ff8a4c"/>'; });
    if (etage === 1) [[30, 330], [330, 318], [60, 362], [300, 356]].forEach(function (o, k) { s += '<ellipse cx="' + o[0] + '" cy="' + o[1] + '" rx="' + (9 - k) + '" ry="' + (5 - k * 0.5) + '" fill="#8d7b68" stroke="#241812" stroke-width="1.1"/><ellipse cx="' + (o[0] - 2) + '" cy="' + (o[1] - 1.5) + '" rx="' + (4 - k * 0.5) + '" ry="1.6" fill="#a8957f"/>'; });
    // La lumière : halo derrière les monstres (doré pour un élite, violet pour un boss), deux torches sur les côtés
    s += '<ellipse cx="180" cy="' + HZ + '" rx="170" ry="130" fill="url(#djc-halo)"/>';
    [30, 330].forEach(function (tx) {
      s += '<circle cx="' + tx + '" cy="162" r="70" fill="url(#djc-lueur)" class="djc-vacille"/>' +
           '<path d="M' + (tx - 3) + ' 172 h6 l-1.2 22 h-3.6 Z" fill="#5d3a18" stroke="#241812" stroke-width="1.2"/><rect x="' + (tx - 7) + '" y="168" width="14" height="6" rx="2" fill="#868e96" stroke="#241812" stroke-width="1.2"/>' +
           '<path class="djc-flamme" d="M' + tx + ' 140 C' + (tx + 10) + ' 151 ' + (tx + 8) + ' 168 ' + tx + ' 168 C' + (tx - 8) + ' 168 ' + (tx - 10) + ' 151 ' + tx + ' 140 Z" fill="#ff922b"/>' +
           '<path class="djc-flamme" d="M' + tx + ' 151 C' + (tx + 5) + ' 157 ' + (tx + 4) + ' 167 ' + tx + ' 167 C' + (tx - 4) + ' 167 ' + (tx - 5) + ' 157 ' + tx + ' 151 Z" fill="#ffe066"/>';
    });
    s += '<rect width="360" height="440" fill="url(#djc-cote)"/><rect y="' + (HZ + 30) + '" width="360" height="' + (410 - HZ) + '" fill="url(#djc-bas)"/>';
    s += '<style>.djc-flamme{animation:djc-f .35s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}.djc-vacille{animation:djc-v 1.7s ease-in-out infinite alternate}' +
         '.djc-braise{animation:djc-v 1.3s ease-in-out infinite alternate}@keyframes djc-f{to{transform:scale(1.1,.88)}}@keyframes djc-v{from{opacity:.55}to{opacity:1}}' +
         '@media (prefers-reduced-motion: reduce){.djc-flamme,.djc-vacille,.djc-braise{animation:none}}</style>';
    return '<svg viewBox="0 0 360 440" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
  }
  return { monstre: monstre, decor: decor, TYPES: Object.keys(D).concat(['roi', 'reine', 'gluantgeant', 'gluantmoyen']) };
})();
if (typeof module !== 'undefined') module.exports = DJS;
