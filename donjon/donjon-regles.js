// ================== DONJON DES COMPAGNONS : CARTE, POUVOIRS, SIMULATION ==================
// Un donjon vu de dessus, pièce par pièce (façon jeu d'aventure des années 80), exploré seul ou à plusieurs en temps réel « doux ».
// Chaque compagnon a un pouvoir selon son espèce (débroussailler, force, bond, flair) : le donjon est tiré au hasard
// pour que les pouvoirs du groupe suffisent toujours. Clés, porte verrouillée, grille à deux dalles (à plusieurs),
// monstres lents, grande clé et boss. Un joueur sans cœur devient un petit fantôme qu'un ami ranime en restant à côté.
// Chez l'hôte (ou en solo), la page appelle DJ.tick(e, maintenant) dix fois par seconde ; l'état est ensuite diffusé.
// Utilisé par donjon/index.html ; testable avec Node (module.exports en bas).

var DJ = (function () {
  var W = 11, H = 9;                       // une pièce : 11 × 9 cases (bords compris)
  var GX = 4, GY = 4;                      // le plan du donjon : 4 × 4 pièces au plus
  var PAS = 200;                           // un pas toutes les 0,2 s quand on garde le doigt sur la croix
  var INVINCIBLE = 1500, REANIMATION = 2000, ATTAQUE = 350;
  var DX = { h: [0, -1], b: [0, 1], g: [-1, 0], d: [1, 0] };
  var OPP = { h: 'b', b: 'h', g: 'd', d: 'g' };
  var PORTE = { h: [5, 0], b: [5, 8], g: [0, 4], d: [10, 4] };   // l'ouverture de chaque côté d'une pièce

  // Cases (une lettre par case, 99 lettres par pièce)
  //  . sol   # mur   O pilier   r ronces   R rocher   v trou   = planche   s mur secret
  //  L porte verrouillée   B porte du boss   G grille   _ dalle   C coffre   c coffre ouvert
  var MARCHABLE = { '.': 1, '=': 1, '_': 1 };

  // ---------- Pouvoirs des compagnons ----------
  var POUVOIRS = {
    ronces: { nom: 'Débroussailler', ico: '🔥', obstacle: 'r', especes: 'dragon, chat ou oie', quoi: 'des ronces' },
    force: { nom: 'Force', ico: '💪', obstacle: 'R', especes: 'panda, tortue ou chèvre', quoi: 'un rocher' },
    bond: { nom: 'Bond', ico: '🦘', obstacle: 'v', especes: 'lapin, écureuil ou singe', quoi: 'un trou' },
    flair: { nom: 'Flair', ico: '👃', obstacle: 's', especes: 'chien, renard ou raton laveur', quoi: 'un passage secret' }
  };
  var PAR_OBSTACLE = { r: 'ronces', R: 'force', v: 'bond', s: 'flair' };
  var ESPECES = {
    dragon: { pouvoir: 'ronces', action: 'crache du feu sur les ronces' },
    chat: { pouvoir: 'ronces', action: 'griffe les ronces' },
    oie: { pouvoir: 'ronces', action: 'arrache les ronces à coups de bec' },
    panda: { pouvoir: 'force', action: 'casse le rocher' },
    tortue: { pouvoir: 'force', action: 'fonce dans le rocher, carapace en avant' },
    chevre: { pouvoir: 'force', action: 'casse le rocher d\'un coup de cornes' },
    lapin: { pouvoir: 'bond', action: 'saute le trou et pose une planche' },
    ecureuil: { pouvoir: 'bond', action: 'bondit par-dessus le trou et pose une planche' },
    singe: { pouvoir: 'bond', action: 'se balance au-dessus du trou et pose une planche' },
    chien: { pouvoir: 'flair', action: 'flaire un passage secret' },
    renard: { pouvoir: 'flair', action: 'déniche un passage secret' },
    raton: { pouvoir: 'flair', action: 'trouve un passage secret' }
  };
  function pouvoirDe(cp) { var x = cp && ESPECES[cp.e]; return x ? x.pouvoir : null; }

  // ---------- Monstres ----------
  var MONSTRES = {
    slime: { nom: 'Gluant', pv: 1, vitesse: 850 },
    chauve: { nom: 'Chauve-souris', pv: 1, vitesse: 480, vole: true },
    squelette: { nom: 'Squelette', pv: 2, vitesse: 720, chasse: true },
    boss: { nom: 'Le Roi Gluant', pv: 6, vitesse: 650, chasse: true }
  };

  // ---------- Hasard reproductible ----------
  function hasard(graine) {
    var a = (graine >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function entier(h, n) { return Math.floor(h() * n); }
  function melanger(l, h) { l = l.slice(); for (var i = l.length - 1; i > 0; i--) { var j = entier(h, i + 1), x = l[i]; l[i] = l[j]; l[j] = x; } return l; }

  // ---------- Plan : un arbre de pièces qui part du bas ----------
  function plan(h, n) {
    var x0 = entier(h, GX), depart = x0 + ',' + (GY - 1), salles = {};
    salles[depart] = { id: depart, x: x0, y: GY - 1, parent: null, prof: 0, portes: {} };
    var liste = [depart], essais = 0;
    while (liste.length < n && essais++ < 600) {
      // on pousse plutôt depuis les dernières pièces : des couloirs qui s'enfoncent, avec quelques embranchements
      var base = salles[liste[liste.length - 1 - entier(h, Math.min(3, liste.length))]];
      var d = ['h', 'b', 'g', 'd'][entier(h, 4)], v = DX[d], x = base.x + v[0], y = base.y + v[1], id = x + ',' + y;
      if (x < 0 || y < 0 || x >= GX || y >= GY || salles[id]) continue;
      salles[id] = { id: id, x: x, y: y, parent: base.id, prof: base.prof + 1, portes: {} };
      base.portes[d] = id; salles[id].portes[OPP[d]] = base.id;
      liste.push(id);
    }
    return { salles: salles, liste: liste, depart: depart };
  }
  function ancetres(S, id) { var l = []; while (id) { l.push(id); id = S[id].parent; } return l; }

  // Intérieur des pièces : piliers (jamais sur la croix du milieu, qui relie les portes)
  var MODELES = [
    [],
    [[2, 2], [8, 2], [2, 6], [8, 6]],
    [[3, 2], [7, 2], [3, 6], [7, 6]],
    [[2, 2], [3, 2], [7, 2], [8, 2], [2, 6], [3, 6], [7, 6], [8, 6]],
    [[3, 3], [7, 3], [3, 5], [7, 5]]
  ];
  var COINS = [[1, 1], [9, 1], [1, 7], [9, 7]];
  var DALLES = [[2, 6], [8, 6]];
  function idx(x, y) { return y * W + x; }
  function tuile(S, x, y) { return S.t[idx(x, y)]; }
  function poser(S, x, y, c) { var i = idx(x, y); S.t = S.t.slice(0, i) + c + S.t.slice(i + 1); }
  function pres(a, x, y, d) { return Math.abs(a[0] - x) <= d && Math.abs(a[1] - y) <= d; }

  // ---------- Génération : le donjon dépend des pouvoirs présents dans le groupe ----------
  function generer(graine, pouvoirs, humains) {
    pouvoirs = (pouvoirs || []).filter((p, i, l) => POUVOIRS[p] && l.indexOf(p) === i);
    for (var k = 0; k < 60; k++) {
      var h = hasard((graine >>> 0) + k * 7919), n = humains >= 3 ? 8 : 7, p = plan(h, n);
      if (p.liste.length < n) continue;
      var boss = p.liste.reduce((a, b) => p.salles[b].prof > p.salles[a].prof ? b : a, p.depart);
      if (p.salles[boss].prof < 3) continue;
      return construire(h, p, boss, pouvoirs, humains || 1);
    }
    throw new Error('Donjon impossible à générer');
  }
  function construire(h, p, boss, pouvoirs, humains) {
    var S = p.salles, enfants = p.liste.filter(id => id !== p.depart), porte = {};
    enfants.forEach(id => { porte[id] = ''; });
    porte[boss] = 'B';
    // Obstacles sur les passages (côté de la pièce d'où l'on arrive) : chaque pouvoir du groupe sert au moins une fois
    var autres = melanger(enfants.filter(id => id !== boss), h), k = 0;
    melanger(pouvoirs, h).forEach(pw => { if (k < autres.length - 1) porte[autres[k++]] = POUVOIRS[pw].obstacle; });
    if (k < autres.length) porte[autres[k++]] = 'L';
    if (humains >= 2 && k < autres.length) porte[autres[k++]] = 'G';
    if (pouvoirs.length && k < autres.length && h() < 0.6) porte[autres[k++]] = POUVOIRS[pouvoirs[entier(h, pouvoirs.length)]].obstacle;

    // Coffres : la petite clé avant sa porte, la grande clé au plus loin, quelques poussières d'étoile
    var coffres = {};   // pièce -> [contenu…]
    function mettre(id, c) { (coffres[id] = coffres[id] || []).push(c); }
    Object.keys(porte).forEach(id => { if (porte[id] === 'L') { var a = ancetres(S, S[id].parent); mettre(a[entier(h, a.length)], 'cle'); } });
    var loin = p.liste.filter(id => id !== boss && id !== p.depart && id !== S[boss].parent).sort((a, b) => S[b].prof - S[a].prof);
    if (!loin.length) loin = [S[boss].parent];
    mettre(loin[0], 'grandecle');
    melanger(p.liste.filter(id => id !== boss && id !== p.depart), h).slice(0, 2).forEach((id, i) => mettre(id, i ? 'coeur' : 'poussiere'));

    var ennemis = [], num = 0;
    p.liste.forEach(id => {
      var s = S[id], aGrille = Object.keys(s.portes).some(d => S[s.portes[d]].parent === id && porte[s.portes[d]] === 'G');
      var modele = id === p.depart || id === boss ? [] : MODELES[aGrille ? entier(h, 2) : entier(h, MODELES.length)];
      var t = '';
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) t += (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? '#' : '.';
      s.t = t; s.coffres = {}; s.dalles = []; s.boss = id === boss;
      modele.forEach(c => poser(s, c[0], c[1], 'O'));
      Object.keys(s.portes).forEach(d => {
        var voisin = s.portes[d], P = PORTE[d], g = S[voisin].parent === id ? porte[voisin] : '';
        poser(s, P[0], P[1], g || '.');
        if (g === 'G') DALLES.forEach(c => { poser(s, c[0], c[1], '_'); s.dalles.push(c); });
      });
      (coffres[id] || []).forEach((c, i) => { var co = COINS[i]; poser(s, co[0], co[1], 'C'); s.coffres[idx(co[0], co[1])] = c; });
      // Monstres : plus nombreux et plus coriaces au fond du donjon ; jamais près des portes
      if (id === boss) { ennemis.push({ id: ++num, type: 'boss', salle: id, x: 5, y: 3, pv: MONSTRES.boss.pv + 2 * (humains - 1), pvMax: MONSTRES.boss.pv + 2 * (humains - 1), pas: 0, dir: 'b' }); return; }
      if (id === p.depart) return;
      var nb = 1 + (s.prof >= 2 ? 1 : 0) + (h() < 0.4 ? 1 : 0) + (humains >= 3 ? 1 : 0);
      var types = s.prof >= 2 ? ['slime', 'chauve', 'squelette'] : ['slime', 'chauve'];
      var libres = [];
      for (var yy = 2; yy <= 6; yy++) for (var xx = 2; xx <= 8; xx++) {
        if (tuile(s, xx, yy) !== '.' || Object.keys(PORTE).some(d => s.portes[d] && pres(PORTE[d], xx, yy, 2))) continue;
        libres.push([xx, yy]);
      }
      melanger(libres, h).slice(0, nb).forEach(c => {
        var ty = types[entier(h, types.length)];
        ennemis.push({ id: ++num, type: ty, salle: id, x: c[0], y: c[1], pv: MONSTRES[ty].pv, pvMax: MONSTRES[ty].pv, pas: 0, dir: 'b' });
      });
    });
    var salles = {};
    p.liste.forEach(id => { var s = S[id]; salles[id] = { id: id, x: s.x, y: s.y, prof: s.prof, portes: s.portes, t: s.t, coffres: s.coffres, dalles: s.dalles, boss: s.boss }; });
    return { salles: salles, depart: p.depart, boss: boss, ennemis: ennemis, num: num };
  }

  // ---------- Partie ----------
  // joueurs : { pseudo: résumé du compagnon ({ e, c, n, p }) ou null }
  function nouvelle(graine, joueurs, id) {
    var noms = Object.keys(joueurs), pouvoirs = noms.map(n => pouvoirDe(joueurs[n])).filter(Boolean);
    var c = generer(graine, pouvoirs, noms.length);
    var e = { id: id || String(graine), graine: graine, phase: 'jeu', salles: c.salles, depart: c.depart, bossSalle: c.boss, carteV: 1,
              ennemis: c.ennemis, seq: c.num, joueurs: {}, cles: 0, grandeCle: false, poussiere: 0, objets: [], effets: [], annonces: [],
              vues: {}, fin: null, debut: 0, maintenant: 0, pouvoirs: pouvoirs, bossPonte: 0 };
    e.vues[c.depart] = 1;
    noms.forEach(n => ajouterJoueur(e, n, joueurs[n]));
    return e;
  }
  var DEPARTS = [[5, 6], [4, 6], [6, 6], [5, 5], [4, 5], [6, 5], [3, 6], [7, 6]];
  function ajouterJoueur(e, nom, cp) {
    if (e.joueurs[nom]) { if (cp) { e.joueurs[nom].cp = cp; } return e.joueurs[nom]; }
    var n = Object.keys(e.joueurs).length, d = DEPARTS[n % DEPARTS.length];
    return (e.joueurs[nom] = { nom: nom, ordre: n, salle: e.depart, x: d[0], y: d[1], dir: 'h', coeurs: 3, max: 3, fantome: false, reanim: 0,
                                cp: cp || null, pouvoir: pouvoirDe(cp), inv: 0, pas: 0, d: null, unPas: null, att: false, attProchaine: 0, aideT: 0 });
  }
  // Commandes reçues : direction tenue (ou null au lâcher), coup
  function entree(e, nom, d) {
    var p = e.joueurs[nom];
    if (!p) return;
    if (d && DX[d]) { p.d = d; p.unPas = d; } else p.d = null;   // un toucher bref fait quand même un pas
  }
  function attaquer(e, nom) { var p = e.joueurs[nom]; if (p) p.att = true; }

  function annonce(e, txt, pour) {
    e.annonces.push({ id: ++e.seq, txt: txt, t: e.maintenant, pour: pour || null });
    if (e.annonces.length > 6) e.annonces.shift();
  }
  function effet(e, salle, x, y, k) { e.effets.push({ id: ++e.seq, salle: salle, x: x, y: y, k: k, t: e.maintenant }); }
  function nomCp(p) { return p.cp && p.cp.n ? p.cp.n : p.surnom || p.nom; }
  function ennemiEn(e, salle, x, y) { return e.ennemis.find(m => m.salle === salle && m.x === x && m.y === y); }
  function aide(e, p, txt) {
    if (e.maintenant < p.aideT) return;
    p.aideT = e.maintenant + 3000;
    annonce(e, txt, p.nom);
  }
  function blesser(e, p) {
    if (p.fantome || e.maintenant < p.inv) return;
    p.coeurs--; p.inv = e.maintenant + INVINCIBLE;
    effet(e, p.salle, p.x, p.y, 'aie');
    if (p.coeurs <= 0) {
      p.coeurs = 0; p.fantome = true; p.reanim = 0; p.d = null;
      annonce(e, '👻 ' + nomCp(p) + ' est KO' + (Object.keys(e.joueurs).length > 1 ? ' : restez à côté de lui pour le ranimer !' : '…'));
    }
  }
  function ramasser(e, p) {
    for (var i = e.objets.length - 1; i >= 0; i--) {
      var o = e.objets[i];
      if (o.salle !== p.salle || o.x !== p.x || o.y !== p.y) continue;
      if (o.type === 'coeur') { if (p.coeurs >= p.max) continue; p.coeurs++; }
      else if (o.type === 'poussiere') e.poussiere++;
      e.objets.splice(i, 1);
      effet(e, p.salle, p.x, p.y, o.type);
    }
  }
  function ouvrirCoffre(e, S, x, y, p) {
    var c = S.coffres[idx(x, y)];
    poser(S, x, y, 'c'); e.carteV++;
    effet(e, S.id, x, y, 'coffre');
    if (c === 'cle') { e.cles++; annonce(e, '🗝️ ' + nomCp(p) + ' trouve une petite clé !'); }
    else if (c === 'grandecle') { e.grandeCle = true; annonce(e, '🔑 ' + nomCp(p) + ' trouve la grande clé du boss !'); }
    else if (c === 'coeur') { Object.values(e.joueurs).forEach(q => { if (q.salle === S.id && !q.fantome) q.coeurs = q.max; }); annonce(e, '❤️ Un coffre de soin : cœurs remplis dans la pièce !'); }
    else { e.poussiere += 3; annonce(e, '✨ ' + nomCp(p) + ' trouve 3 poussières d\'étoile !'); }
  }

  function bougerJoueur(e, p) {
    var now = e.maintenant, d = p.d || p.unPas;
    if (!d || now < p.pas) return;
    p.unPas = null; p.dir = d; p.pas = now + PAS;
    var v = DX[d], nx = p.x + v[0], ny = p.y + v[1], S = e.salles[p.salle];
    // On sort par une ouverture : pièce voisine
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) {
      var voisin = S.portes[d];
      if (!voisin) return;
      var P = PORTE[OPP[d]];
      p.salle = voisin; p.x = P[0]; p.y = P[1];
      if (!e.vues[voisin]) {
        e.vues[voisin] = 1;
        if (e.salles[voisin].boss) annonce(e, '👑 ' + nomCp(p) + ' entre dans l\'antre du Roi Gluant !');
      }
      if (p.pouvoir === 'flair' && e.salles[voisin].t.indexOf('s') >= 0 && !p.fantome) aide(e, p, '👃 ' + nomCp(p) + ' renifle… il y a un passage secret dans cette pièce !');
      return;
    }
    var t = tuile(S, nx, ny);
    if (MARCHABLE[t]) {
      if (!p.fantome && ennemiEn(e, p.salle, nx, ny)) { blesser(e, p); return; }
      p.x = nx; p.y = ny;
      if (!p.fantome) ramasser(e, p);
      return;
    }
    if (p.fantome) return;
    var pw = PAR_OBSTACLE[t];
    if (pw) {
      if (p.pouvoir === pw) {
        poser(S, nx, ny, t === 'v' ? '=' : '.'); e.carteV++;
        effet(e, p.salle, nx, ny, pw);
        annonce(e, POUVOIRS[pw].ico + ' ' + nomCp(p) + ' ' + ESPECES[p.cp.e].action + ' !');
      } else if (t !== 's') aide(e, p, 'Il y a ' + POUVOIRS[pw].quoi + ' : il faut le pouvoir ' + POUVOIRS[pw].ico + ' ' + POUVOIRS[pw].nom + ' (' + POUVOIRS[pw].especes + ').');
      return;
    }
    if (t === 'L') {
      if (e.cles > 0) { e.cles--; poser(S, nx, ny, '.'); e.carteV++; effet(e, p.salle, nx, ny, 'porte'); annonce(e, '🔓 ' + nomCp(p) + ' ouvre la porte avec une petite clé.'); }
      else aide(e, p, '🔒 Porte fermée : il faut une petite clé (cherchez les coffres).');
    } else if (t === 'B') {
      if (e.grandeCle) { poser(S, nx, ny, '.'); e.carteV++; effet(e, p.salle, nx, ny, 'porte'); annonce(e, '🔑 La porte du boss s\'ouvre…'); }
      else aide(e, p, '👑 La porte du boss : il faut la grande clé.');
    } else if (t === 'G') {
      aide(e, p, Object.keys(e.joueurs).length > 1 ? '⛓️ Une grille : tenez-vous à deux sur les dalles en même temps pour l\'ouvrir.' : '⛓️ Une grille bien fermée…');
    } else if (t === 'C') ouvrirCoffre(e, S, nx, ny, p);
  }

  function marchableEnnemi(e, m, x, y) {
    if (x < 1 || y < 1 || x > W - 2 || y > H - 2) return false;
    var t = tuile(e.salles[m.salle], x, y);
    if (!(MARCHABLE[t] || (t === 'v' && MONSTRES[m.type].vole))) return false;
    return !e.ennemis.some(o => o !== m && o.salle === m.salle && o.x === x && o.y === y);
  }
  function choisirDir(e, m, h) {
    var info = MONSTRES[m.type], dirs = ['h', 'b', 'g', 'd'];
    if (m.type === 'slime' && h() < 0.3) return null;
    if (info.chasse && h() < 0.7) {
      var cible = null, dist = 1e9;
      Object.values(e.joueurs).forEach(p => {
        if (p.fantome || p.salle !== m.salle) return;
        var dd = Math.abs(p.x - m.x) + Math.abs(p.y - m.y);
        if (dd < dist) { dist = dd; cible = p; }
      });
      if (cible) {
        var ax = cible.x - m.x, ay = cible.y - m.y, l = [];
        if (ax) l.push(ax > 0 ? 'd' : 'g');
        if (ay) l.push(ay > 0 ? 'b' : 'h');
        if (Math.abs(ay) > Math.abs(ax)) l.reverse();
        for (var i = 0; i < l.length; i++) { var v = DX[l[i]]; if (marchableEnnemi(e, m, m.x + v[0], m.y + v[1])) return l[i]; }
      }
    }
    return dirs[Math.floor(h() * 4)];
  }
  function toucher(e, m, v, h) {
    m.pv--; m.touche = e.maintenant;
    if (m.pv <= 0) {
      e.ennemis = e.ennemis.filter(o => o !== m);
      effet(e, m.salle, m.x, m.y, 'pouf');
      if (m.type === 'boss') {
        e.poussiere += 5;
        e.phase = 'fin'; e.fin = { gagne: true, t: e.maintenant };
        annonce(e, '🎉 Le Roi Gluant est vaincu ! Le trésor est à vous !');
        return;
      }
      var r = h();
      if (r < 0.25) e.objets.push({ id: ++e.seq, salle: m.salle, x: m.x, y: m.y, type: 'coeur' });
      else if (r < 0.6) e.objets.push({ id: ++e.seq, salle: m.salle, x: m.x, y: m.y, type: 'poussiere' });
      return;
    }
    // Recul d'une case (pas le boss)
    if (m.type !== 'boss' && marchableEnnemi(e, m, m.x + v[0], m.y + v[1])) { m.x += v[0]; m.y += v[1]; }
    m.pas = e.maintenant + 400;
  }

  // ---------- Un pas de simulation (dix fois par seconde) ----------
  function tick(e, maintenant, h) {
    if (e.phase !== 'jeu') return;
    h = h || Math.random;
    var dt = e.maintenant ? Math.min(500, maintenant - e.maintenant) : 0;
    e.maintenant = maintenant;
    if (!e.debut) e.debut = maintenant;
    var joueurs = Object.values(e.joueurs);
    joueurs.forEach(p => bougerJoueur(e, p));
    // Coups : la case devant soi
    joueurs.forEach(p => {
      if (!p.att) return;
      p.att = false;
      if (p.fantome || maintenant < p.attProchaine) return;
      p.attProchaine = maintenant + ATTAQUE;
      var v = DX[p.dir || 'b'], fx = p.x + v[0], fy = p.y + v[1];
      effet(e, p.salle, fx, fy, 'coup');
      var m = ennemiEn(e, p.salle, fx, fy) || ennemiEn(e, p.salle, p.x, p.y);
      if (m) toucher(e, m, v, h);
    });
    if (e.phase !== 'jeu') return;
    // Monstres : ils ne bougent que dans les pièces où quelqu'un est en vie
    var occupees = {};
    joueurs.forEach(p => { if (!p.fantome) occupees[p.salle] = true; });
    e.ennemis.slice().forEach(m => {
      if (!occupees[m.salle] || maintenant < m.pas) return;
      m.pas = maintenant + MONSTRES[m.type].vitesse * (0.85 + h() * 0.3);
      var d = choisirDir(e, m, h);
      if (!d) return;
      var v = DX[d];
      if (marchableEnnemi(e, m, m.x + v[0], m.y + v[1])) { m.x += v[0]; m.y += v[1]; m.dir = d; }
    });
    // Le Roi Gluant fait naître des petits gluants
    var roi = e.ennemis.find(m => m.type === 'boss');
    if (roi && occupees[roi.salle] && maintenant >= e.bossPonte) {
      if (e.bossPonte && e.ennemis.filter(m => m.salle === roi.salle).length < 4) {
        var place = ['b', 'g', 'd', 'h'].map(d => [roi.x + DX[d][0], roi.y + DX[d][1]]).find(c => marchableEnnemi(e, { salle: roi.salle, type: 'slime' }, c[0], c[1]));
        if (place) { e.ennemis.push({ id: ++e.seq, type: 'slime', salle: roi.salle, x: place[0], y: place[1], pv: 1, pvMax: 1, pas: maintenant + 600, dir: 'b' }); effet(e, roi.salle, place[0], place[1], 'pouf'); }
      }
      e.bossPonte = maintenant + 6000;
    }
    // Contacts
    joueurs.forEach(p => { if (!p.fantome && ennemiEn(e, p.salle, p.x, p.y)) blesser(e, p); });
    // Grilles : toutes les dalles de la pièce occupées en même temps
    Object.values(e.salles).forEach(S => {
      if (!S.dalles.length || S.t.indexOf('G') < 0) return;
      if (!S.dalles.every(c => joueurs.some(p => !p.fantome && p.salle === S.id && p.x === c[0] && p.y === c[1]))) return;
      S.t = S.t.replace(/G/g, '.'); e.carteV++;
      annonce(e, '⛓️ Clac ! La grille s\'ouvre.');
    });
    // Réanimation : un ami vivant juste à côté pendant 2 s
    joueurs.forEach(f => {
      if (!f.fantome) return;
      var ami = joueurs.some(p => !p.fantome && p.salle === f.salle && Math.abs(p.x - f.x) <= 1 && Math.abs(p.y - f.y) <= 1);
      f.reanim = ami ? f.reanim + dt : 0;
      if (f.reanim >= REANIMATION) {
        f.fantome = false; f.coeurs = 1; f.reanim = 0; f.inv = maintenant + INVINCIBLE;
        annonce(e, '✨ ' + nomCp(f) + ' est ranimé !');
      }
    });
    // Tout le monde KO : fin
    if (joueurs.length && joueurs.every(p => p.fantome)) { e.phase = 'fin'; e.fin = { gagne: false, t: maintenant }; annonce(e, 'Tout le groupe est KO…'); }
    e.effets = e.effets.filter(f => maintenant - f.t < 600);
    e.annonces = e.annonces.filter(a => maintenant - a.t < 4500);
  }

  // Ce qui change à chaque instant (sans les pièces, envoyées seulement quand elles changent)
  function etatMobile(e) {
    var r = {};
    Object.keys(e).forEach(k => { if (k !== 'salles') r[k] = e[k]; });
    return r;
  }
  function pieces(e) { return e.salles; }

  return { W: W, H: H, GX: GX, GY: GY, PAS: PAS, DX: DX, PORTE: PORTE, MARCHABLE: MARCHABLE, POUVOIRS: POUVOIRS, ESPECES: ESPECES, MONSTRES: MONSTRES,
           pouvoirDe: pouvoirDe, hasard: hasard, generer: generer, nouvelle: nouvelle, ajouterJoueur: ajouterJoueur, entree: entree, attaquer: attaquer,
           tick: tick, tuile: tuile, idx: idx, etatMobile: etatMobile, pieces: pieces };
})();
if (typeof module !== 'undefined') module.exports = DJ;
