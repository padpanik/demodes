// ================== QR CODE (fait maison, sans bibliothèque) ==================
// Encodage « octets » (UTF-8), correction d'erreurs niveau M, versions 1 à 10 (jusqu'à ~210 caractères).
// QR.svg(texte, taille) → chaîne SVG (carrés noirs sur fond blanc, marge de 4 modules autour).
// Suit la norme ISO/IEC 18004 (calcul de Reed-Solomon, motifs de repérage, masque choisi par pénalité).

var QR = (function () {
  // Niveau M : codes correcteurs par bloc et nombre de blocs, pour les versions 1 à 10
  var ECC_BLOC = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  var NB_BLOCS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];

  function modulesBruts(v) {
    var r = (16 * v + 128) * v + 64;
    if (v >= 2) { var n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  }
  function octetsDonnees(v) { return Math.floor(modulesBruts(v) / 8) - ECC_BLOC[v] * NB_BLOCS[v]; }

  // Corps de Galois GF(256), polynôme 0x11D
  function mult(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z & 0xFF;
  }
  function diviseur(degre) {
    var r = new Array(degre).fill(0); r[degre - 1] = 1;
    var racine = 1;
    for (var i = 0; i < degre; i++) {
      for (var j = 0; j < r.length; j++) { r[j] = mult(r[j], racine); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      racine = mult(racine, 0x02);
    }
    return r;
  }
  function reste(donnees, div) {
    var r = new Array(div.length).fill(0);
    donnees.forEach(b => {
      var f = b ^ r.shift(); r.push(0);
      div.forEach((c, i) => { r[i] ^= mult(c, f); });
    });
    return r;
  }

  function utf8(s) { return Array.from(unescape(encodeURIComponent(s))).map(c => c.charCodeAt(0)); }

  function encoder(texte) {
    var octets = utf8(texte), v;
    for (v = 1; v <= 10; v++) { if (4 + (v < 10 ? 8 : 16) + octets.length * 8 <= octetsDonnees(v) * 8) break; }
    if (v > 10) throw new Error('Texte trop long pour le QR code');
    // Bits de données : mode octets, longueur, contenu, fin, remplissage
    var bits = [], ajouter = (val, n) => { for (var i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    ajouter(4, 4); ajouter(octets.length, v < 10 ? 8 : 16); octets.forEach(b => ajouter(b, 8));
    var capa = octetsDonnees(v) * 8;
    ajouter(0, Math.min(4, capa - bits.length));
    ajouter(0, (8 - bits.length % 8) % 8);
    for (var p = 0xEC; bits.length < capa; p ^= 0xEC ^ 0x11) ajouter(p, 8);
    var donnees = [];
    for (var i = 0; i < bits.length; i += 8) { var o = 0; for (var k = 0; k < 8; k++) o = (o << 1) | bits[i + k]; donnees.push(o); }
    // Blocs, correction d'erreurs, entrelacement
    var nb = NB_BLOCS[v], ecc = ECC_BLOC[v], brut = Math.floor(modulesBruts(v) / 8), courts = nb - brut % nb, lgCourt = Math.floor(brut / nb);
    var div = diviseur(ecc), blocs = [];
    for (var b = 0, pos = 0; b < nb; b++) {
      var dat = donnees.slice(pos, pos + lgCourt - ecc + (b < courts ? 0 : 1)); pos += dat.length;
      var e = reste(dat, div);
      if (b < courts) dat.push(0);   // case vide pour aligner les blocs courts
      blocs.push(dat.concat(e));
    }
    var final = [];
    for (var i = 0; i < blocs[0].length; i++) blocs.forEach((bl, j) => { if (i !== lgCourt - ecc || j >= courts) final.push(bl[i]); });
    return { version: v, octets: final };
  }

  function construire(texte) {
    var enc = encoder(texte), v = enc.version, n = v * 4 + 17;
    var m = [], fixe = [];
    for (var y = 0; y < n; y++) { m.push(new Array(n).fill(false)); fixe.push(new Array(n).fill(false)); }
    var poser = (x, y, noir) => { m[y][x] = noir; fixe[y][x] = true; };
    // Lignes de synchronisation
    for (var i = 0; i < n; i++) { poser(6, i, i % 2 === 0); poser(i, 6, i % 2 === 0); }
    // Repères des coins
    [[3, 3], [n - 4, 3], [3, n - 4]].forEach(c => {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), x = c[0] + dx, y = c[1] + dy;
        if (x >= 0 && x < n && y >= 0 && y < n) poser(x, y, d !== 2 && d !== 4);
      }
    });
    // Motifs d'alignement
    if (v > 1) {
      var na = Math.floor(v / 7) + 2, pas = Math.ceil((v * 4 + 4) / (na * 2 - 2)) * 2, al = [6];
      for (var p = n - 7; al.length < na; p -= pas) al.splice(1, 0, p);
      al.forEach((ax, i) => al.forEach((ay, j) => {
        if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) return;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) poser(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }));
    }
    // Zones de format (réservées), module sombre, version
    var format = masque => {
      var d = (0 << 3) | masque, r = d;   // niveau M = 00
      for (var i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      var b = ((d << 10) | r) ^ 0x5412, bit = i => ((b >>> i) & 1) !== 0;
      for (var i = 0; i <= 5; i++) poser(8, i, bit(i));
      poser(8, 7, bit(6)); poser(8, 8, bit(7)); poser(7, 8, bit(8));
      for (var i = 9; i < 15; i++) poser(14 - i, 8, bit(i));
      for (var i = 0; i < 8; i++) poser(n - 1 - i, 8, bit(i));
      for (var i = 8; i < 15; i++) poser(8, n - 15 + i, bit(i));
      poser(8, n - 8, true);
    };
    format(0);
    if (v >= 7) {
      var r = v; for (var i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      var bv = (v << 12) | r;
      for (var i = 0; i < 18; i++) { var bt = ((bv >>> i) & 1) !== 0, a = n - 11 + i % 3, c = Math.floor(i / 3); poser(a, c, bt); poser(c, a, bt); }
    }
    // Données en zigzag
    var k = 0, octets = enc.octets;
    for (var droite = n - 1; droite >= 1; droite -= 2) {
      if (droite === 6) droite = 5;
      for (var vert = 0; vert < n; vert++) for (var j = 0; j < 2; j++) {
        var x = droite - j, monte = ((droite + 1) & 2) === 0, y = monte ? n - 1 - vert : vert;
        if (!fixe[y][x] && k < octets.length * 8) { m[y][x] = ((octets[k >>> 3] >>> (7 - (k & 7))) & 1) !== 0; k++; }
      }
    }
    // Masque : on essaie les 8 et on garde le moins pénalisé
    var MASQUES = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
      (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
    var appliquer = q => { for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (!fixe[y][x] && MASQUES[q](x, y)) m[y][x] = !m[y][x]; };
    var penalite = () => {
      var p = 0, noirs = 0;
      for (var y = 0; y < n; y++) for (var dir = 0; dir < 2; dir++) {
        var suite = 1;
        for (var x = 1; x <= n; x++) {
          var a = x < n && (dir ? m[x][y] : m[y][x]) === (dir ? m[x - 1][y] : m[y][x - 1]);
          if (a) suite++; else { if (suite >= 5) p += suite - 2; suite = 1; }
        }
      }
      for (var y = 0; y < n - 1; y++) for (var x = 0; x < n - 1; x++) if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (m[y][x]) noirs++;
      p += Math.floor(Math.abs(noirs * 20 - n * n * 10) / (n * n)) * 10;
      return p;
    };
    var meilleur = 0, minP = Infinity;
    for (var q = 0; q < 8; q++) {
      appliquer(q); format(q);
      var pq = penalite(); if (pq < minP) { minP = pq; meilleur = q; }
      appliquer(q);   // on défait (le masque est son propre inverse)
    }
    appliquer(meilleur); format(meilleur);
    return m;
  }

  function svg(texte, taille) {
    var m = construire(texte), n = m.length, t = n + 8, d = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (m[y][x]) d += 'M' + (x + 4) + ' ' + (y + 4) + 'h1v1h-1z';
    return '<svg viewBox="0 0 ' + t + ' ' + t + '" width="' + (taille || 220) + '" height="' + (taille || 220) + '" shape-rendering="crispEdges" role="img" aria-label="QR code">' +
           '<rect width="' + t + '" height="' + t + '" fill="#fff"/><path d="' + d + '" fill="#1d2b36"/></svg>';
  }
  return { svg: svg, matrice: construire };
})();
if (typeof module !== 'undefined') module.exports = QR;
