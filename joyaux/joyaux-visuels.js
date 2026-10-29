// ================== LES 7 JOYAUX · DUEL : visuels dessinés par le code ==================
// Cartes, merveilles, jetons Progrès, ressources, pièces, boucliers et points de victoire, en HTML + SVG maison
// (aucune illustration officielle). Une carte se dessine à n'importe quelle taille : tout est en « em » (variable --t).
//   DV.carte(id, 'pyr' | 'grand' | 'mini')   DV.dos(age)   DV.merveille(id, { faite, taille })   DV.jeton(id, taille)   DV.res('B')
// Classique (SJ) : DV.carteC(SJ.CARTES[id], 'main' | 'grand' | 'mini')   DV.plateau(cléMerveille, { faites, suivante })
var DV = (function () {
  var COUL = { brun: '#8a5a2b', gris: '#7d8590', bleu: '#2b6cb0', jaune: '#d69e2e', rouge: '#c53030', vert: '#2f855a', violet: '#6b46c1' };

  // ---------- Petites icônes (viewBox 10 × 10) ----------
  var R = {
    B: '<rect x="0.6" y="2.4" width="8.2" height="5.4" rx="2.7" fill="#a8723f" stroke="#4a2c12" stroke-width="0.6"/><ellipse cx="7.7" cy="5.1" rx="1.7" ry="2.5" fill="#f0c88e" stroke="#4a2c12" stroke-width="0.6"/><ellipse cx="7.7" cy="5.1" rx="0.7" ry="1.1" fill="none" stroke="#a8723f" stroke-width="0.5"/><path d="M1.8 4 H5.6 M2.2 6.3 H5.4" stroke="#5e3a1a" stroke-width="0.55"/>',
    A: '<rect x="0.6" y="2.2" width="8.8" height="5.6" rx="0.6" fill="#e0703f" stroke="#5a200a" stroke-width="0.6"/><path d="M0.6 5 H9.4 M4.2 2.2 V5 M6.8 5 V7.8 M2.4 5 V7.8" stroke="#5a200a" stroke-width="0.6"/>',
    P: '<path d="M0.6 8.6 L1.8 3.8 L4.6 2.2 L6.8 3.6 L9 3.2 L9.5 8.6 Z" fill="#b3bcc4" stroke="#3c434a" stroke-width="0.6" stroke-linejoin="round"/><path d="M1.8 3.8 L4 6 L6.8 3.6 M4 6 L4.4 8.6" fill="none" stroke="#3c434a" stroke-width="0.55"/>',
    V: '<path d="M3.5 0.6 H6.5 V2.4 L8.1 4.3 V8.7 Q8.1 9.5 7.2 9.5 H2.8 Q1.9 9.5 1.9 8.7 V4.3 L3.5 2.4 Z" fill="#8fe0f2" stroke="#145e72" stroke-width="0.6"/><path d="M3.3 4.8 V8.2" stroke="#fff" stroke-width="0.7"/>',
    M: '<path d="M1 8.8 L1.6 5 L3.8 3.2 L6.6 3.4 L8.8 5.4 L9.2 8.8 Z" fill="#5d6670" stroke="#22282e" stroke-width="0.6" stroke-linejoin="round"/><path d="M3.2 5.2 L4.4 4.6 L4.8 5.8 Z M6.2 6.2 L7.4 5.6 L7.6 7 Z M2.6 7.4 L3.6 7 L3.8 8 Z" fill="#f2c94c" stroke="#8a6a10" stroke-width="0.3"/>',
    T: '<rect x="1" y="1.6" width="5.6" height="7.2" rx="0.8" fill="#c04f8f" stroke="#5a1840" stroke-width="0.6"/><ellipse cx="6.6" cy="5.2" rx="2.4" ry="3.6" fill="#e07ab2" stroke="#5a1840" stroke-width="0.6"/><ellipse cx="6.6" cy="5.2" rx="0.8" ry="1.3" fill="#7a2456"/><path d="M1.6 3.6 H5.6 M1.6 5.4 H5.6 M1.6 7.2 H5.6" stroke="#f7c5df" stroke-width="0.45"/>',
    R: '<rect x="1.8" y="1.2" width="6.4" height="7.6" fill="#f5e6bb" stroke="#6b5520" stroke-width="0.5"/><rect x="0.9" y="0.6" width="8.2" height="1.8" rx="0.9" fill="#d9bd70" stroke="#6b5520" stroke-width="0.5"/><rect x="0.9" y="7.6" width="8.2" height="1.8" rx="0.9" fill="#d9bd70" stroke="#6b5520" stroke-width="0.5"/><path d="M3 4 H7 M3 5.3 H7 M3 6.6 H6" stroke="#8a6d2a" stroke-width="0.55"/>'
  };
  function svg(contenu, taille) { return '<svg class="dv-ico" viewBox="0 0 10 10" style="width:' + (taille || 1) + 'em;height:' + (taille || 1) + 'em">' + contenu + '</svg>'; }
  function res(r, t) { return svg(R[r], t); }
  function piece(n, t) {
    return '<span class="dv-piece" style="font-size:' + (t || 1) + 'em">' + (n === undefined ? '' : n) + '</span>';
  }
  function bouclier(n, t) {
    var s = '<path d="M5 0.6 L9 2 V5 Q9 8 5 9.6 Q1 8 1 5 V2 Z" fill="#d23c3c" stroke="#7d1717" stroke-width="0.6"/><path d="M5 2.2 V8" stroke="#ffb3b3" stroke-width="0.6"/>';
    var o = ''; for (var i = 0; i < (n || 1); i++) o += svg(s, t); return o;
  }
  function pv(n, t) { return '<span class="dv-pv" style="font-size:' + (t || 1) + 'em">' + n + '</span>'; }
  function sci(sym, t) { return '<span class="dv-sci" style="font-size:' + (t || 1) + 'em">' + SD.SYMBOLES[sym].ico + '</span>'; }
  function carreType(type, t) { return '<span class="dv-carre" style="background:' + COUL[type] + ';font-size:' + (t || 1) + 'em"></span>'; }
  function merveillePetite(t) { return '<span class="dv-mv" style="font-size:' + (t || 1) + 'em">▲</span>'; }

  // ---------- Silhouettes (blanches) selon le type de carte ----------
  var SIL = {
    brun: '<path d="M6 30 L14 12 L22 30 Z M18 30 L26 16 L34 30 Z" /><rect x="25" y="26" width="10" height="4" rx="2"/>',
    gris: '<path d="M16 8 H24 V12 Q30 16 30 24 Q30 32 20 32 Q10 32 10 24 Q10 16 16 12 Z"/>',
    bleu: '<path d="M6 13 L20 5 L34 13 Z"/><rect x="8" y="15" width="3" height="13"/><rect x="15" y="15" width="3" height="13"/><rect x="22" y="15" width="3" height="13"/><rect x="29" y="15" width="3" height="13"/><rect x="6" y="28" width="28" height="3"/>',
    jaune: '<path d="M6 14 L20 6 L34 14 Z"/><rect x="9" y="14" width="22" height="3"/><rect x="11" y="17" width="2.5" height="13"/><rect x="26.5" y="17" width="2.5" height="13"/><circle cx="20" cy="25" r="4"/>',
    rouge: '<path d="M11 32 V12 H14 V8 H17 V12 H23 V8 H26 V12 H29 V32 Z"/><rect x="18" y="24" width="4" height="8" fill="#000" opacity="0.25"/>',
    vert: '<path d="M8 10 Q14 7 20 10 Q26 7 32 10 V30 Q26 27 20 30 Q14 27 8 30 Z"/><path d="M20 10 V30" stroke="#000" stroke-opacity="0.25" stroke-width="1.2"/>',
    violet: '<path d="M12 6 V34" stroke="#fff" stroke-width="2.4"/><path d="M13 7 H30 L26 13 L30 19 H13 Z"/>'
  };
  function silhouette(type) { return '<svg class="dv-sil" viewBox="0 0 40 36" fill="#fff">' + SIL[type] + '</svg>'; }

  // ---------- Effet d'une carte, en icônes ----------
  function effet(c, t) {
    var f = c.effet, o = '';
    if (!t) {
      var nb = (f.prod || '').length + (f.choix ? 3 : 0) + (f.depot ? f.depot.length + 2 : 0) + (f.boucliers || 0) + (f.sci ? 1 : 0) + (f.pieces ? 1 : 0) + (f.par ? 3 : 0) + (f.guilde ? 4 : 0) + (f.pts ? 1 : 0);
      t = nb <= 1 ? 1.9 : nb === 2 ? 1.75 : nb === 3 ? 1.5 : 1.25;
    }
    if (f.prod) o += f.prod.split('').map(r => res(r, t)).join('');
    if (f.choix) o += f.choix.split('/').map(r => res(r, t * 0.9)).join('<b class="dv-ou">/</b>');
    if (f.depot) o += f.depot.split('').map(r => res(r, t * 0.9)).join('') + '<b class="dv-eg">=</b>' + piece(1, t * 0.9);
    if (f.boucliers) o += bouclier(f.boucliers, t);
    if (f.sci) o += sci(f.sci, t);
    if (f.pieces) o += piece(f.pieces, t);
    if (f.par) o += piece(f.par.pieces, t * 0.85) + '<b class="dv-ou">/</b>' + (f.par.type === 'merveille' ? merveillePetite(t * 0.85) : carreType(f.par.type, t * 0.8));
    if (f.guilde) {
      var g = f.guilde;
      o += g === 'pieces' ? piece('3', t * 0.85) + '<b class="dv-eg">→</b>' + pv(1, t * 0.85)
         : g === 'merveille' ? merveillePetite(t * 0.85) + '<b class="dv-eg">→</b>' + pv(2, t * 0.85)
         : g.split('+').map(x => carreType(x, t * 0.75)).join('') + '<b class="dv-eg">→</b>' + piece(1, t * 0.8) + pv(1, t * 0.8);
    }
    if (f.pts) o += pv(f.pts, t);
    return o;
  }
  // Coût lisible : chaque ressource sur une pastille claire, les identiques regroupées (« ×2 ») pour pouvoir dessiner plus grand
  function pastilles(lettres) {
    var n = {}, ordre = [];
    (lettres || '').split('').forEach(function (r) { if (!n[r]) { n[r] = 0; ordre.push(r); } n[r]++; });
    return ordre.map(function (r) {
      return '<span class="dv-past">' + res(r, 1) + (n[r] > 1 ? '<b class="dv-nb">' + n[r] + '</b>' : '') + '</span>';
    }).join('');
  }
  // Deux pastilles ou plus : sur deux colonnes, pour ne pas descendre sur le nom
  function colonneCout(html) {
    var n = (html.match(/class="dv-past/g) || []).length;
    return '<div class="dv-cout' + (n > 4 ? ' dv-cout2 dv-cout3' : n > 1 ? ' dv-cout2' : '') + '">' + html + '</div>';   // 5 et plus : 3 colonnes, un peu plus petites
  }
  function cout(c) {
    return (c.pieces ? '<span class="dv-past dv-past-p">' + piece(c.pieces, 1) + '</span>' : '') + pastilles(c.cout);
  }
  // ---------- Une carte ----------
  function carte(id, taille, opts) {
    var c = SD.CARTES[id];
    if (!c) return '';
    opts = opts || {};
    return '<div class="dv-carte dv-' + (taille || 'pyr') + '" style="--c:' + COUL[c.type] + '">' +
      '<div class="dv-bandeau">' + effet(c) + '</div>' +
      colonneCout(cout(c)) +
      silhouette(c.type) +
      (c.chaine && taille === 'grand' ? '<div class="dv-chaine">🔗 gratuite avec ' + SD.CARTES[c.chaine].nom + '</div>' : '') +
      '<div class="dv-nom">' + c.nom + '</div></div>';
  }
  function dos(age) {
    var fonds = { 1: '#7b5a3a', 2: '#3a5f8a', 3: '#5c3e8f' };
    return '<div class="dv-carte dv-pyr dv-dos" style="--c:' + fonds[age] + '"><span>' + ['', 'I', 'II', 'III'][age] + '</span></div>';
  }

  // ---------- Merveilles : silhouette du monument ----------
  var MONU = {
    'm-pyramides': '<path d="M8 46 L40 10 L72 46 Z"/><path d="M40 10 L52 46 Z" fill="#000" opacity="0.18"/>',
    'm-sphinx': '<rect x="12" y="34" width="52" height="10" rx="3"/><path d="M48 34 V20 Q48 12 56 12 Q64 12 64 20 V34 Z"/><path d="M50 18 L46 30 M62 18 L66 30" stroke="#fff" stroke-width="3"/>',
    'm-colosse': '<rect x="34" y="40" width="14" height="6"/><path d="M38 40 L36 24 L32 24 L36 12 L46 12 L50 24 L46 24 L44 40 Z"/><circle cx="41" cy="9" r="4"/><path d="M48 14 L58 4" stroke="#fff" stroke-width="3"/><circle cx="59" cy="3" r="3"/>',
    'm-phare': '<path d="M32 46 L36 18 H46 L50 46 Z"/><rect x="34" y="10" width="14" height="8"/><path d="M41 4 L44 10 H38 Z"/><path d="M48 13 L66 6 V20 Z" opacity="0.6"/>',
    'm-jardins': '<rect x="14" y="36" width="52" height="10"/><rect x="20" y="26" width="40" height="10"/><rect x="28" y="16" width="24" height="10"/><circle cx="24" cy="24" r="4"/><circle cx="56" cy="24" r="4"/><circle cx="34" cy="14" r="4"/><circle cx="46" cy="14" r="4"/><circle cx="18" cy="34" r="4"/><circle cx="62" cy="34" r="4"/>',
    'm-bibliotheque': '<path d="M14 18 L40 6 L66 18 Z"/><rect x="16" y="20" width="48" height="22"/><rect x="22" y="24" width="6" height="14" fill="#000" opacity="0.2"/><rect x="37" y="24" width="6" height="14" fill="#000" opacity="0.2"/><rect x="52" y="24" width="6" height="14" fill="#000" opacity="0.2"/><rect x="12" y="42" width="56" height="4"/>',
    'm-mausolee': '<rect x="18" y="34" width="44" height="12"/><rect x="22" y="22" width="36" height="12"/><path d="M24 22 L40 8 L56 22 Z"/><rect x="25" y="25" width="3" height="9" fill="#000" opacity="0.2"/><rect x="33" y="25" width="3" height="9" fill="#000" opacity="0.2"/><rect x="44" y="25" width="3" height="9" fill="#000" opacity="0.2"/><rect x="52" y="25" width="3" height="9" fill="#000" opacity="0.2"/>',
    'm-piree': '<path d="M10 34 H70 L62 44 H18 Z"/><path d="M38 34 V8 L58 30 H38" /><path d="M36 10 L22 30 H36" opacity="0.7"/>',
    'm-zeus': '<rect x="20" y="40" width="40" height="6"/><rect x="24" y="26" width="32" height="14"/><circle cx="40" cy="14" r="7"/><path d="M30 26 Q40 18 50 26" /><path d="M58 8 L54 22 L60 22 L54 38" stroke="#fff" stroke-width="2.4" fill="none"/>',
    'm-artemis': '<path d="M10 16 L40 4 L70 16 Z"/><rect x="14" y="18" width="4" height="22"/><rect x="24" y="18" width="4" height="22"/><rect x="34" y="18" width="4" height="22"/><rect x="44" y="18" width="4" height="22"/><rect x="54" y="18" width="4" height="22"/><rect x="62" y="18" width="4" height="22"/><rect x="10" y="40" width="60" height="6"/>',
    'm-circus': '<ellipse cx="40" cy="30" rx="32" ry="14"/><ellipse cx="40" cy="30" rx="20" ry="7" fill="#000" opacity="0.25"/><rect x="14" y="40" width="52" height="6"/>',
    'm-voie': '<path d="M30 46 L38 6 H42 L50 46 Z"/><path d="M40 12 V18 M40 24 V32 M40 38 V44" stroke="#000" stroke-opacity="0.25" stroke-width="2"/><rect x="14" y="24" width="4" height="22"/><rect x="62" y="24" width="4" height="22"/><rect x="12" y="20" width="8" height="4"/><rect x="60" y="20" width="8" height="4"/>'
  };
  function effetMerveille(W, t) {
    t = t || 1.35;
    var o = '';
    if (W.rejouer) o += '<span class="dv-rejouer" style="font-size:' + t + 'em">↻</span>';
    if (W.pieces) o += piece(W.pieces, t);
    if (W.vol) o += '<span class="dv-vol" style="font-size:' + t + 'em">−' + W.vol + '</span>';
    if (W.boucliers) o += bouclier(W.boucliers, t);
    if (W.choix) o += W.choix.split('/').map(r => res(r, t * 0.9)).join('<b class="dv-ou">/</b>');
    if (W.detruire) o += '<span class="dv-detruit" style="font-size:' + t + 'em">✕</span>' + carreType(W.detruire, t * 0.8);
    if (W.mausolee) o += '<span class="dv-texte" style="font-size:' + (t * 0.6) + 'em">défausse → gratuit</span>';
    if (W.bibliotheque) o += '<span class="dv-texte" style="font-size:' + (t * 0.6) + 'em">3 jetons → 1</span>';
    if (W.pts) o += pv(W.pts, t);
    return o;
  }
  function merveille(id, opts) {
    opts = opts || {};
    var W = SD.MERVEILLES[id], taille = opts.taille || 'grand';
    return '<div class="dv-merveille dv-m' + taille + (opts.faite ? ' dv-faite' : '') + (opts.retiree ? ' dv-retiree' : '') + '">' +
      '<div class="dv-bandeau">' + effetMerveille(W) + '</div>' +
      colonneCout(pastilles(W.cout)) +
      '<svg class="dv-monu" viewBox="0 0 80 48" fill="#fff">' + MONU[id] + '</svg>' +
      '<div class="dv-nom">' + W.nom + '</div>' + (opts.faite ? '<div class="dv-tampon">✓</div>' : '') + '</div>';
  }
  function jeton(id, taille) {
    var J = SD.PROGRES[id];
    return '<span class="dv-jeton" style="font-size:' + (taille || 1) + 'em" title="' + J.nom + '">' + J.ico + '</span>';
  }
  // Texte clair d'une carte (pour la fiche détaillée)
  function texte(c) {
    var f = c.effet, l = [];
    if (f.prod) l.push('Produit ' + f.prod.split('').map(r => SD.RES[r].toLowerCase()).join(' + ') + ' à chaque tour.');
    if (f.choix) l.push('Produit au choix : ' + f.choix.split('/').map(r => SD.RES[r].toLowerCase()).join(' ou ') + ' (ton adversaire ne peut pas en profiter).');
    if (f.depot) l.push('Tu achètes ' + f.depot.split('').map(r => SD.RES[r].toLowerCase()).join(' et ') + ' à la banque pour 1 🪙 seulement.');
    if (f.boucliers) l.push(f.boucliers + ' bouclier' + (f.boucliers > 1 ? 's' : '') + ' : le pion avance vers la cité adverse.');
    if (f.sci) l.push('Symbole scientifique : ' + SD.SYMBOLES[f.sci].nom + ' (une paire = un jeton Progrès).');
    if (f.pieces) l.push('+' + f.pieces + ' 🪙 tout de suite.');
    if (f.par) l.push(f.par.pieces + ' 🪙 tout de suite par ' + ({ gris: 'carte grise', brun: 'carte marron', rouge: 'carte rouge', jaune: 'carte jaune', merveille: 'merveille construite' })[f.par.type] + ' de ta cité.');
    if (f.guilde) l.push(({ pieces: '1 point par lot de 3 🪙 dans la cité la plus riche.', merveille: '2 points par merveille dans la cité qui en a le plus.' })[f.guilde] ||
      ('1 🪙 tout de suite et 1 point en fin de partie par ' + f.guilde.split('+').map(x => ({ brun: 'carte marron', gris: 'carte grise', bleu: 'carte bleue', vert: 'carte verte', rouge: 'carte rouge', jaune: 'carte jaune' })[x]).join(' et ') + ' dans la cité qui en a le plus.'));
    if (f.pts) l.push(f.pts + ' point' + (f.pts > 1 ? 's' : '') + ' de victoire.');
    return l.join(' ');
  }
  function texteMerveille(W) {
    var l = [];
    if (W.pieces) l.push('+' + W.pieces + ' 🪙.');
    if (W.vol) l.push('Ton adversaire perd ' + W.vol + ' 🪙.');
    if (W.boucliers) l.push(W.boucliers + ' bouclier' + (W.boucliers > 1 ? 's' : '') + '.');
    if (W.choix) l.push('Produit au choix : ' + W.choix.split('/').map(r => SD.RES[r].toLowerCase()).join(' ou ') + '.');
    if (W.detruire) l.push('Tu fais défausser à ton adversaire une de ses cartes ' + (W.detruire === 'gris' ? 'grises' : 'marron') + '.');
    if (W.mausolee) l.push('Tu construis gratuitement une carte de la défausse.');
    if (W.bibliotheque) l.push('Tu tires 3 jetons Progrès écartés et tu en gardes un.');
    if (W.rejouer) l.push('Rejoue tout de suite.');
    if (W.pts) l.push(W.pts + ' points de victoire.');
    return l.join(' ');
  }

  // ================== VERSION CLASSIQUE : mêmes visuels, cartes et merveilles du Classique (SJ) ==================
  var MONU_C = { saphir: 'm-phare', rubis: 'm-colosse', emeraude: 'm-artemis', ambre: 'm-pyramides', opale: 'm-mausolee', jade: 'm-jardins', amethyste: 'm-zeus' };
  function sciC(k, t) { return '<span class="dv-sci" style="font-size:' + (t || 1) + 'em">' + (k === '*' ? '❓' : SJ.SCIENCES[k]) + '</span>'; }
  function prodC(p, t) { return p.indexOf('/') >= 0 ? p.split('/').map(r => res(r, t * (p.length > 5 ? 0.78 : 0.9))).join('<b class="dv-ou">/</b>') : p.split('').map(r => res(r, t)).join(''); }
  function fleche(f, t) { return '<b class="dv-fl" style="font-size:' + (t * 0.62) + 'em">' + f + '</b>'; }
  function typeC(type, t) { return type === 'joyau' ? merveillePetite(t) : type === 'defaite' ? '<span class="dv-defaite" style="font-size:' + (t * 0.8) + 'em">−1</span>' : carreType(type, t * 0.8); }
  // Effet d'une carte du Classique, en icônes (◀ ▶ = mes voisins)
  function effetC(c, t) {
    var f = c.effet, o = '';
    if (!t) {
      var nb = (f.prod ? (f.prod.indexOf('/') >= 0 ? 2.5 : f.prod.length) : 0) + (f.choix ? 3 : 0) + (f.comptoir || f.marche ? 5 : 0) + (f.boucliers || 0) + (f.sci ? 1 : 0) +
               (f.pieces ? 1 : 0) + (f.gain ? 3 : 0) + (f.fin ? 4 : 0) + (f.guilde ? 2 + f.guilde.types.length : 0) + (f.pts ? 1 : 0);
      t = nb <= 1 ? 1.9 : nb <= 2 ? 1.75 : nb <= 3 ? 1.5 : nb <= 4 ? 1.3 : 1.1;
    }
    if (f.prod) o += prodC(f.prod, t);
    if (f.choix) o += prodC(f.choix, t);
    if (f.comptoir) o += fleche(f.comptoir === 'g' ? '◀' : '▶', t) + 'BPAM'.split('').map(r => res(r, t * 0.62)).join('') + '<b class="dv-eg">=</b>' + piece(1, t * 0.8);
    if (f.marche) o += fleche('◀▶', t) + 'VTR'.split('').map(r => res(r, t * 0.7)).join('') + '<b class="dv-eg">=</b>' + piece(1, t * 0.8);
    if (f.boucliers) o += bouclier(f.boucliers, t);
    if (f.sci) o += sciC(f.sci, t);
    if (f.pieces) o += piece(f.pieces, t);
    if (f.gain) o += piece(f.gain.pieces, t * 0.85) + '<b class="dv-ou">/</b>' + typeC(f.gain.type, t) + fleche('◀●▶', t);
    if (f.fin) o += piece(f.fin.pieces, t * 0.8) + pv(f.fin.pts, t * 0.8) + '<b class="dv-ou">/</b>' + typeC(f.fin.type, t);
    if (f.guilde) {
      var g = f.guilde;
      o += fleche(g.qui === 's' ? '●' : g.qui === 'sv' ? '◀●▶' : '◀▶', t) + g.types.map(x => typeC(x, t * 0.85)).join('') + '<b class="dv-eg">→</b>' + pv(g.pts, t * 0.85);
    }
    if (f.pts) o += pv(f.pts, t);
    return o;
  }
  function coutC(c) { return (c.pieces ? '<span class="dv-past dv-past-p">' + piece(c.pieces, 1) + '</span>' : '') + pastilles(c.cout); }
  // Une carte du Classique (c = SJ.CARTES[id]) ; tailles : 'main' (réglée par la page), 'grand', 'mini'
  function carteC(c, taille) {
    if (!c) return '';
    return '<div class="dv-carte dv-' + (taille || 'main') + '" style="--c:' + COUL[c.type] + '">' +
      '<div class="dv-bandeau">' + effetC(c) + '</div>' +
      colonneCout(coutC(c)) +
      silhouette(c.type) +
      '<div class="dv-nom"' + taillenom(c.nom) + '>' + c.nom + '</div></div>';
  }
  // Nom plus petit quand un mot est long, pour ne jamais le couper au milieu (« Parcheminerie », « Bibliothèque »)
  function taillenom(nom) {
    var l = Math.max.apply(null, nom.split(/[\s'-]/).map(m => m.length));
    return l > 11 ? ' style="font-size:0.62em"' : l > 10 ? ' style="font-size:0.7em"' : l > 8 ? ' style="font-size:0.8em"' : '';
  }
  // Ce que rapporte une étape de merveille : l'icône et une légende en clair
  function gainEtape(t) {
    if (t.pts) return [pv(t.pts, 1.7), t.pts + ' points'];
    if (t.boucliers) return [bouclier(t.boucliers, 1.6), t.boucliers + ' boucliers'];
    if (t.pieces) return [piece(t.pieces, 1.6), '+' + t.pieces + ' pièces'];
    if (t.prod) return [prodC(t.prod, 1.55), t.prod.length > 5 ? '1 matière au choix, chaque tour' : '1 objet au choix, chaque tour'];
    if (t.sci) return [sciC('*', 1.5), '1 savoir au choix'];
    if (t.comptoir) return [fleche('◀▶', 1.6) + 'BPAM'.split('').map(r => res(r, 0.95)).join('') + '<b class="dv-eg">=</b>' + piece(1, 1.1), 'matières à 1 🪙 chez mes voisins'];
    if (t.gratuit) return ['<span class="dv-gratuit">0</span>', '1 carte gratuite par âge'];
    return ['', ''];
  }
  // La merveille d'une cité, en carte large : ressource de départ, puis les 3 étapes (coût → gain) ; faites = cochées
  // Les 3 étapes d'une merveille (coût en haut à gauche sur 1/3, un trait, gain sur 2/3) ; faites = cochées
  function etapesPl(J, faites, suivante) {
    return J.etapes.map(function (t, k) {
      var g = gainEtape(t), faite = k < faites;
      return '<div class="dv-pl-et' + (faite ? ' dv-pl-faite' : '') + (k === faites && suivante ? ' dv-pl-suiv' : '') + '">' +
        '<div class="dv-pl-cout">' + pastilles(t.cout) + '</div>' +
        (faite ? '<div class="dv-tampon">✓</div>' : '<span class="dv-pl-num">' + ['I', 'II', 'III'][k] + '</span>') +
        '<div class="dv-pl-bas"><div class="dv-pl-gain">' + g[0] + '</div><div class="dv-pl-leg">' + g[1] + '</div></div></div>';
    }).join('');
  }
  // La merveille d'une cité, en carte large : ressource de départ, puis les 3 étapes (coût → gain) ; faites = cochées
  function plateau(cle, opts) {
    opts = opts || {};
    var J = SJ.JOYAUX[cle], faites = opts.faites || 0;
    if (!J) return '';
    return '<div class="dv-plateau">' +
      '<svg class="dv-pl-monu" viewBox="0 0 80 48" fill="#fff">' + MONU[MONU_C[cle]] + '</svg>' +
      '<div class="dv-pl-tete">' +
        '<div class="dv-pl-base"><span class="dv-past">' + res(J.base, 1) + '</span><span>produit<br>dès le départ</span></div>' +
        '<div class="dv-pl-nom">' + J.nom + '</div>' +
        '<div class="dv-pl-avance">' + faites + '/3</div>' +
      '</div>' +
      '<div class="dv-pl-etapes">' + etapesPl(J, faites, opts.suivante) + '</div></div>';
  }
  // La carte d'un joueur sur la table : son nom, ses pièces, boucliers et points, ce que produit sa cité, sa merveille et ses étapes
  //   o = { nom, pieces, boucliers, pts, prod (html), faites, moi, fait (a choisi), absent }
  //   o.compact : carte basse (beaucoup de joueurs) : nom et chiffres sur une ligne, étapes coût | gain côte à côte, sans légende
  function plateauJoueur(cle, o) {
    var J = SJ.JOYAUX[cle];
    if (!J) return '';
    if (o.compact) return '<div class="dv-plateau dv-plj dv-plc' + (o.moi ? ' dv-plj-moi' : '') + (o.absent ? ' dv-plj-absent' : '') + '">' +
      '<svg class="dv-pl-monu" viewBox="0 0 80 48" fill="#fff">' + MONU[MONU_C[cle]] + '</svg>' +
      '<div class="dv-plj-tete dv-plc-tete"><div class="dv-plj-nom">' + o.nom + (o.fait ? ' <span class="dv-plj-fait">✓</span>' : '') + '</div><div class="dv-plj-mv">' + J.nom + '</div>' +
        '<div class="dv-plj-chiffres">' + piece(o.pieces, 1.1) + '<span class="dv-plj-b">' + bouclier(1, 1.05) + '<b>' + o.boucliers + '</b></span>' + pv(o.pts, 1.1) + '</div></div>' +
      '<div class="dv-plj-prod">' + o.prod + '</div>' +
      '<div class="dv-pl-etapes dv-plc-etapes">' + etapesPl(J, o.faites || 0, o.moi) + '</div></div>';
    return '<div class="dv-plateau dv-plj' + (o.moi ? ' dv-plj-moi' : '') + (o.absent ? ' dv-plj-absent' : '') + '">' +
      '<svg class="dv-pl-monu" viewBox="0 0 80 48" fill="#fff">' + MONU[MONU_C[cle]] + '</svg>' +
      '<div class="dv-plj-tete">' +
        '<div class="dv-plj-nom">' + o.nom + (o.fait ? ' <span class="dv-plj-fait">✓</span>' : '') + '</div><div class="dv-plj-mv">' + J.nom + '</div>' +
        '<div class="dv-plj-chiffres">' + piece(o.pieces, 1.2) + '<span class="dv-plj-b">' + bouclier(1, 1.15) + '<b>' + o.boucliers + '</b></span>' + pv(o.pts, 1.2) + '</div>' +
      '</div>' +
      '<div class="dv-plj-prod">' + o.prod + '</div>' +
      '<div class="dv-pl-etapes dv-plj-etapes">' + etapesPl(J, o.faites || 0, o.moi) + '</div></div>';
  }

  // ---------- Styles ----------
  var css = [
    '.dv-ico{vertical-align:-0.15em;flex:none}',
    '.dv-piece{display:inline-flex;align-items:center;justify-content:center;min-width:1.15em;padding:0 0.26em;height:1.15em;border-radius:0.6em;background:radial-gradient(circle at 35% 30%,#ffe58a,#e0a91a 70%);border:0.08em solid #9a6b00;color:#5a3d00;font-weight:900;font-size:1em;line-height:1;box-sizing:border-box}',
    '.dv-piece:empty::after{content:""}',
    '.dv-pv{display:inline-flex;align-items:center;justify-content:center;min-width:1.2em;height:1.2em;border-radius:0.6em;background:#fff6d8;border:0.12em solid #3f8f3f;color:#245a24;font-weight:900;line-height:1;box-sizing:border-box;padding:0 0.28em}',
    '.dv-sci{display:inline-flex;align-items:center;justify-content:center;width:1.2em;height:1.2em;border-radius:0.25em;background:#e8f5ec;line-height:1}',
    '.dv-carre{display:inline-block;width:0.9em;height:1.15em;border-radius:0.15em;border:0.08em solid #fff;vertical-align:-0.2em}',
    '.dv-mv{display:inline-block;color:#b7791f;font-weight:900}',
    '.dv-ou,.dv-eg{font-size:0.8em;margin:0 0.05em;color:#3b4b57}',
    '.dv-carte{--t:8px;font-size:var(--t);width:6.3em;height:8.6em;border-radius:0.6em;background:var(--c);position:relative;overflow:hidden;box-sizing:border-box;border:0.12em solid rgba(0,0,0,0.25);color:#fff;font-family:system-ui,sans-serif}',
    '.dv-carte .dv-bandeau{position:absolute;top:0;left:0;right:0;height:2.3em;background:rgba(255,253,245,0.95);display:flex;align-items:center;justify-content:center;gap:0.1em;font-size:1em;color:#1d2b36;border-bottom:0.12em solid rgba(0,0,0,0.15);overflow:hidden;white-space:nowrap}',
    '.dv-past{position:relative;display:flex;align-items:center;justify-content:center;width:1.75em;height:1.75em;border-radius:0.38em;background:#fffaf0;box-shadow:0 0.06em 0.15em rgba(0,0,0,0.45)}',
    '.dv-past .dv-ico{width:1.5em!important;height:1.5em!important}',
    '.dv-past-p{background:none;box-shadow:none}',
    '.dv-past-p .dv-piece{font-size:1.5em!important}',
    '.dv-nb{position:absolute;right:-0.4em;bottom:-0.35em;min-width:1.05em;height:1.05em;border-radius:50%;background:#1d2b36;color:#fff;font-size:0.9em;line-height:1.05em;text-align:center;font-weight:900;border:0.08em solid #fff}',
    '.dv-cout.dv-cout2{display:grid!important;grid-template-columns:1.75em 1.75em;gap:0.15em 0.2em!important}',
    '.dv-carte .dv-cout.dv-cout3{grid-template-columns:repeat(3,1.75em);font-size:0.8em}',
    '.dv-carte .dv-cout{position:absolute;top:2.5em;left:0.15em;display:flex;flex-direction:column;gap:0.15em;font-size:1em}',
    '.dv-carte .dv-sil{position:absolute;left:1.9em;right:0.2em;top:2.6em;width:auto;height:3.6em;opacity:0.33}',
    '.dv-carte .dv-nom{position:absolute;left:0.15em;right:0.15em;bottom:0.25em;text-align:center;font-weight:800;font-size:0.88em;line-height:1.05;overflow-wrap:anywhere;text-shadow:0 0.08em 0.15em rgba(0,0,0,0.5)}',
    '.dv-carte .dv-chaine{position:absolute;left:0.3em;right:0.3em;bottom:2.3em;font-size:0.62em;text-align:center;background:rgba(0,0,0,0.25);border-radius:0.4em;padding:0.1em}',
    '.dv-carte.dv-grand{--t:17px}',
    '.dv-carte.dv-mini{--t:5px}',
    '.dv-carte.dv-dos{display:flex;align-items:center;justify-content:center;background:repeating-linear-gradient(45deg,var(--c),var(--c) 0.6em,rgba(255,255,255,0.12) 0.6em,rgba(255,255,255,0.12) 1.2em),var(--c)}',
    '.dv-carte.dv-dos span{font-weight:900;font-size:1.8em;color:#fff;opacity:0.85;font-family:Georgia,serif}',
    '.dv-merveille{--t:8px;font-size:var(--t);width:13em;height:8.2em;border-radius:0.6em;position:relative;overflow:hidden;box-sizing:border-box;border:0.15em solid #a07a2c;color:#fff;font-family:system-ui,sans-serif;background:linear-gradient(180deg,#d9b25a,#9c6f1e)}',
    '.dv-merveille .dv-bandeau{position:absolute;top:0;left:0;right:0;height:2em;background:rgba(255,253,245,0.95);display:flex;align-items:center;justify-content:center;gap:0.15em;color:#1d2b36;white-space:nowrap;overflow:hidden}',
    '.dv-merveille .dv-cout{position:absolute;top:2.35em;left:0.3em;display:flex;flex-direction:column;gap:0.15em;font-size:0.95em}',
    '.dv-merveille .dv-monu{position:absolute;left:2.4em;right:0.4em;top:2.3em;height:4.4em;width:auto;opacity:0.55}',
    '.dv-merveille .dv-nom{position:absolute;left:0.3em;right:0.3em;bottom:0.25em;text-align:center;font-weight:900;font-size:1em;text-shadow:0 0.08em 0.2em rgba(0,0,0,0.6)}',
    '.dv-merveille.dv-mgrand{--t:12px}',
    '.dv-merveille.dv-mmini{--t:4.4px}',
    '.dv-merveille.dv-retiree{filter:grayscale(1);opacity:0.4}',
    '.dv-merveille .dv-tampon{position:absolute;right:0.35em;top:0.3em;background:#2ecc71;color:#fff;border-radius:50%;width:1.7em;height:1.7em;display:flex;align-items:center;justify-content:center;font-weight:900;box-shadow:0 0 0 0.15em #fff, 0 0.1em 0.3em rgba(0,0,0,0.35);z-index:2}',
    '.dv-rejouer{display:inline-flex;align-items:center;justify-content:center;width:1.2em;height:1.2em;border-radius:50%;background:#2b6cb0;color:#fff;font-weight:900;line-height:1}',
    '.dv-vol{color:#c53030;font-weight:900}',
    '.dv-detruit{color:#c53030;font-weight:900}',
    '.dv-texte{font-weight:700;color:#3b4b57}',
    '.dv-jeton{display:inline-flex;align-items:center;justify-content:center;width:2em;height:2em;border-radius:50%;background:radial-gradient(circle at 35% 30%,#7fd6a2,#2f855a 75%);border:0.12em solid #1c5a3a;box-shadow:inset 0 0 0 0.12em rgba(255,255,255,0.35);line-height:1}'
,
    '.dv-fl{color:#2c5ea8;margin:0 0.08em;letter-spacing:-0.05em}',
    '.dv-defaite{display:inline-flex;align-items:center;justify-content:center;min-width:1.2em;height:1.2em;border-radius:0.25em;background:#fde2df;color:#c53030;font-weight:900;line-height:1;padding:0 0.15em}',
    '.dv-carte.dv-main{--t:12px}',
    '.dv-gratuit{display:inline-flex;align-items:center;justify-content:center;width:1.3em;height:1.75em;border-radius:0.25em;background:#2b6cb0;color:#fff;font-weight:900;font-size:1.25em;border:0.1em solid #fff;box-shadow:0 0.06em 0.2em rgba(0,0,0,0.4)}',
    '.dv-plateau{--t:13px;font-size:var(--t);width:26em;height:11.4em;border-radius:0.75em;position:relative;overflow:hidden;box-sizing:border-box;border:0.15em solid #a07a2c;color:#fff;font-family:system-ui,sans-serif;background:linear-gradient(180deg,#d9b25a,#9c6f1e);box-shadow:0 0.15em 0.4em rgba(0,0,0,0.18)}',
    '.dv-plateau .dv-pl-monu{position:absolute;right:0.4em;top:0.2em;width:9em;height:5.4em;opacity:0.4}',
    '.dv-pl-tete{position:absolute;left:0;right:0;top:0;height:3.1em;display:flex;align-items:center;gap:0.5em;padding:0 0.5em}',
    '.dv-pl-base{display:flex;align-items:center;gap:0.3em;background:rgba(255,253,245,0.95);border-radius:0.5em;padding:0.25em 0.4em 0.25em 0.25em;color:#3b4b57;font-size:0.68em;line-height:1.05;font-weight:700;flex:none}',
    '.dv-pl-base .dv-past{font-size:1.45em}',
    '.dv-pl-nom{flex:1;min-width:0;font-weight:900;font-size:1.05em;line-height:1.1;text-shadow:0 0.08em 0.2em rgba(0,0,0,0.55);position:relative}',
    '.dv-pl-avance{flex:none;background:rgba(0,0,0,0.28);border-radius:1em;padding:0.1em 0.5em;font-weight:900;font-size:0.8em;position:relative}',
    '.dv-pl-etapes{position:absolute;left:0.35em;right:0.35em;bottom:0.35em;top:3.1em;display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.3em}',
    '.dv-pl-et{position:relative;background:rgba(255,253,245,0.95);border-radius:0.5em;color:#1d2b36;display:grid;grid-template-rows:1fr 2fr;min-width:0;overflow:visible}',
    '.dv-pl-num{position:absolute;right:0.35em;top:0.3em;font:900 0.75em/1 Georgia,serif;color:#b08a3c}',
    '.dv-pl-cout{display:flex;gap:0.2em;justify-content:flex-start;align-items:center;padding:0 0.3em;border-bottom:0.1em solid rgba(156,111,30,0.45)}',
    '.dv-pl-faite .dv-pl-cout{opacity:0.4}',
    '.dv-pl-bas{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.15em;padding:0.15em 0.15em 0.25em;min-width:0}',
    '.dv-pl-gain{display:flex;align-items:center;justify-content:center;white-space:nowrap}',
    '.dv-pl-leg{font-size:0.62em;line-height:1.1;text-align:center;color:#3b4b57;font-weight:700}',
    '.dv-pl-suiv{box-shadow:0 0 0 0.14em #fff,0 0 0.6em rgba(255,255,255,0.8)}',
    '.dv-plateau.dv-plj{height:11.9em}',
    '.dv-plj-tete{position:absolute;left:0;right:0;top:0;height:2.75em;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:0.4em;padding:0 0.5em}',
    '.dv-plj-tete .dv-plj-chiffres{justify-self:end}',
    '.dv-plj-qui{flex:1;min-width:0;position:relative}',
    '.dv-plj-nom{font-weight:900;font-size:1.04em;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 0.08em 0.2em rgba(0,0,0,0.55)}',
    '.dv-plj-mv{font-size:0.74em;font-weight:800;text-align:center;max-width:11.5em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 0.08em 0.15em rgba(0,0,0,0.5);position:relative}',
    '.dv-plj-fait{display:inline-flex;align-items:center;justify-content:center;width:1.2em;height:1.2em;border-radius:50%;background:#2ecc71;font-size:0.75em;vertical-align:0.12em;text-shadow:none;box-shadow:0 0 0 0.12em #fff}',
    '.dv-plj-chiffres{flex:none;display:flex;align-items:center;gap:0.3em;background:rgba(255,253,245,0.95);border-radius:1em;padding:0.2em 0.35em;color:#1d2b36;position:relative}',
    '.dv-plj-b{display:inline-flex;align-items:center;gap:0.1em;font-size:1em}',
    '.dv-plj-b b{font-weight:900}',
    '.dv-plj-prod{position:absolute;left:0.35em;right:0.35em;top:2.8em;height:1.85em;background:rgba(255,253,245,0.9);border-radius:0.45em;display:flex;align-items:center;gap:0.15em 0.35em;padding:0 0.4em;color:#1d2b36;font-size:0.95em;white-space:nowrap;overflow:hidden}',
    '.dv-plj-prod b{font-size:0.85em;font-weight:900;margin-left:0.05em}',
    '.dv-plj-prod .ch{background:#efe6cf;border-radius:0.3em;padding:0 0.15em;display:inline-flex;align-items:center}',
    '.dv-plj-prod .sc{font-size:0.9em}',
    '.dv-plj-prod .vide{color:#8a7a5a;font-size:0.8em;font-weight:700}',
    '.dv-plj-etapes{top:4.95em}',
    '.dv-plj .dv-pl-leg{font-size:0.6em}',
    '.dv-plj-absent{filter:grayscale(0.7);opacity:0.7}',
    '.dv-plateau.dv-plj-moi{background:linear-gradient(180deg,#9dc0e3,#4f79a6);border-color:#3f6790}',
    '.dv-plateau.dv-plc{width:100%;height:7.05em}',
    '.dv-plc .dv-pl-monu{width:6em;height:3.4em;top:0.1em;right:7.5em;opacity:0.3}',
    '.dv-plj-tete.dv-plc-tete{height:2em;padding:0 0.4em;gap:0.3em}',
    '.dv-plc-tete .dv-plj-nom{font-size:1em;position:relative}',
    '.dv-plc-tete .dv-plj-mv{font-size:0.7em;max-width:13em}',
    '.dv-plc-tete .dv-plj-chiffres{padding:0.1em 0.3em;font-size:0.9em}',
    '.dv-plc .dv-plj-prod{top:2.05em;height:1.45em;font-size:0.82em}',
    '.dv-plc-etapes{top:3.6em;bottom:0.3em;left:0.3em;right:0.3em;gap:0.25em}',
    '.dv-plc .dv-pl-et{display:flex;align-items:stretch}',
    '.dv-plc .dv-pl-cout{flex:none;border-bottom:none;border-right:0.1em solid rgba(156,111,30,0.45);padding:0 0.25em;font-size:0.78em;gap:0.12em}',
    '.dv-plc .dv-pl-bas{flex:1;padding:0 0.1em}',
    '.dv-plc .dv-pl-gain{font-size:0.78em}',
    '.dv-plc .dv-pl-leg,.dv-plc .dv-pl-num{display:none}',
    '.dv-plc .dv-pl-et .dv-tampon{font-size:0.8em}',
    '.dv-pl-et .dv-tampon{position:absolute;right:-0.2em;top:-0.2em;background:#2ecc71;color:#fff;border-radius:50%;width:1.35em;height:1.35em;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.95em;box-shadow:0 0 0 0.12em #fff,0 0.1em 0.3em rgba(0,0,0,0.35)}'
  ].join('\n');
  if (typeof document !== 'undefined') { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }

  return { COUL: COUL, res: res, piece: piece, bouclier: bouclier, pv: pv, sci: sci, carre: carreType, carte: carte, dos: dos, merveille: merveille,
           jeton: jeton, effet: effet, cout: cout, texte: texte, texteMerveille: texteMerveille, effetMerveille: effetMerveille,
           carteC: carteC, effetC: effetC, plateau: plateau, plateauJoueur: plateauJoueur, gainEtape: gainEtape };
})();
