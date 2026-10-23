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
  var REANIMATION = 2000;
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
    slime: { nom: 'Gluant', pv: 2, vitesse: 850 },
    chauve: { nom: 'Chauve-souris', pv: 2, vitesse: 520, vole: true, esquive: true },
    squelette: { nom: 'Squelette', pv: 3, vitesse: 760, chasse: true },
    boss: { nom: 'Le Roi Gluant', pv: 10, vitesse: 700, chasse: true }
  };

  // ---------- Cartes de combat (un jour à collectionner : chaque carte a son identifiant) ----------
  // cible : 'monstre' (un monstre du combat), 'ami' (un autre joueur du combat), 'joueur' (soi ou un ami, même KO), null (aucune)
  var CARTES = {
    griffe: { nom: 'Coup de griffe', ico: '🐾', type: 'attaque', cible: 'monstre', texte: '1 à 3 dégâts selon le dé' },
    bouclier: { nom: 'Bouclier', ico: '🛡️', type: 'defense', cible: null, texte: 'Aucun dégât pour toi ce tour' },
    proteger: { nom: 'Protéger', ico: '🤝', type: 'defense', cible: 'ami', texte: 'Tu prends les coups d\'un ami à sa place' },
    trefle: { nom: 'Trèfle', ico: '🍀', type: 'soin', cible: 'joueur', texte: '+1 cœur, ou ranime un ami KO' },
    feu: { nom: 'Souffle de feu', ico: '🔥', type: 'pouvoir', cible: null, texte: '1 dégât à tous les monstres (2 sur un 6)' },
    grandcoup: { nom: 'Grand coup', ico: '💥', type: 'pouvoir', cible: 'monstre', texte: '2 à 4 dégâts selon le dé' },
    bond: { nom: 'Bond', ico: '💨', type: 'pouvoir', cible: 'monstre', texte: 'Tu esquives tout et tu frappes (1 à 3)' },
    pointfaible: { nom: 'Point faible', ico: '🎯', type: 'pouvoir', cible: 'monstre', texte: 'Ce monstre prend +1 à chaque coup du tour' }
  };
  var CARTE_POUVOIR = { ronces: 'feu', force: 'grandcoup', bond: 'bond', flair: 'pointfaible' };
  var MAIN = 3;   // cartes piochées à chaque tour
  function paquetDe(p, aPlusieurs) {
    var l = ['griffe', 'griffe', 'griffe', 'bouclier', 'bouclier', 'trefle'];
    if (aPlusieurs) l.push('proteger');
    var pw = CARTE_POUVOIR[p.pouvoir];
    if (pw) l.push(pw, pw); else l.push('griffe');
    return l;
  }
  function degats(d) { return d === 6 ? 3 : d >= 4 ? 2 : 1; }

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
      if (id === boss) { ennemis.push({ id: ++num, type: 'boss', salle: id, x: 5, y: 3, pv: MONSTRES.boss.pv + 4 * (humains - 1), pvMax: MONSTRES.boss.pv + 4 * (humains - 1), pas: 0, dir: 'b' }); return; }
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
              vues: {}, fin: null, debut: 0, maintenant: 0, pouvoirs: pouvoirs, combats: {} };
    e.vues[c.depart] = 1;
    noms.forEach(n => ajouterJoueur(e, n, joueurs[n]));
    return e;
  }
  var DEPARTS = [[5, 6], [4, 6], [6, 6], [5, 5], [4, 5], [6, 5], [3, 6], [7, 6]];
  function ajouterJoueur(e, nom, cp) {
    if (e.joueurs[nom]) { if (cp) { e.joueurs[nom].cp = cp; } return e.joueurs[nom]; }
    var n = Object.keys(e.joueurs).length, d = DEPARTS[n % DEPARTS.length];
    return (e.joueurs[nom] = { nom: nom, ordre: n, salle: e.depart, x: d[0], y: d[1], dir: 'h', coeurs: 3, max: 3, fantome: false, reanim: 0,
                                cp: cp || null, pouvoir: pouvoirDe(cp), inv: 0, pas: 0, d: null, unPas: null, aideT: 0, pioche: null, defausse: [], main: [] });
  }
  // Commandes reçues : direction tenue (ou null au lâcher), coup
  function entree(e, nom, d) {
    var p = e.joueurs[nom];
    if (!p) return;
    if (d && DX[d]) { p.d = d; p.unPas = d; } else p.d = null;   // un toucher bref fait quand même un pas
  }

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
  function blesser(e, p, n) {
    if (p.fantome) return;
    p.coeurs -= n || 1;
    effet(e, p.salle, p.x, p.y, 'aie');
    if (p.coeurs <= 0) {
      p.coeurs = 0; p.fantome = true; p.reanim = 0; p.d = null;
      annonce(e, '👻 ' + nomCp(p) + ' est KO' + (Object.keys(e.joueurs).length > 1 ? ' : un Trèfle ou un ami à côté de lui le ranime !' : '…'));
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
    var c = e.combats[p.salle];
    if (c && c.joueurs.indexOf(p.nom) >= 0) { p.unPas = null; return; }   // en plein combat : on ne bouge pas
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
      if (!p.fantome && ennemiEn(e, p.salle, nx, ny)) { demarrerCombat(e, p.salle); return; }
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

  // ================== COMBAT AUX CARTES (tour par tour) ==================
  // Tous les joueurs vivants de la pièce contre tous les monstres de la pièce. Chaque tour : les monstres annoncent ce qu'ils vont
  // faire (intentions), chacun pioche 3 cartes et en choisit une (on attend tout le monde ; un joueur déconnecté se protège tout seul),
  // puis tout se résout : défenses et soins, attaques des joueurs (au dé), puis les monstres.
  function piocher(e, p, h) {
    if (!p.pioche) { p.pioche = melanger(paquetDe(p, Object.keys(e.joueurs).length > 1), h); p.defausse = []; }
    while (p.main.length < MAIN) {
      if (!p.pioche.length) { if (!p.defausse.length) break; p.pioche = melanger(p.defausse, h); p.defausse = []; }
      p.main.push(p.pioche.pop());
    }
  }
  function defausser(p) { p.defausse = (p.defausse || []).concat(p.main); p.main = []; }
  function vivantsDe(e, c) { return c.joueurs.map(n => e.joueurs[n]).filter(p => p && !p.fantome && p.salle === c.salle); }
  function monstresDe(e, c) { return e.ennemis.filter(m => m.salle === c.salle); }
  function demarrerCombat(e, salle, h) {
    if (e.combats[salle] || !e.ennemis.some(m => m.salle === salle)) return;
    var c = e.combats[salle] = { id: ++e.seq, salle: salle, tour: 0, joueurs: [], choix: {}, intentions: {}, journal: [], coups: [], pret: 0 };
    var noms = monstresDe(e, c).map(m => MONSTRES[m.type].nom);
    annonce(e, '⚔️ Combat ! ' + noms.filter((n, i) => noms.indexOf(n) === i).join(', ') + ' !');
    nouveauTour(e, c, h || Math.random);
  }
  function nouveauTour(e, c, h) {
    c.tour++; c.choix = {}; c.pret = 0; c.intentions = {};
    // Les joueurs vivants arrivés dans la pièce rejoignent le combat
    Object.values(e.joueurs).forEach(p => { if (p.salle === c.salle && !p.fantome && c.joueurs.indexOf(p.nom) < 0) { c.joueurs.push(p.nom); p.d = null; p.unPas = null; } });
    c.joueurs = c.joueurs.filter(n => e.joueurs[n] && e.joueurs[n].salle === c.salle);
    vivantsDe(e, c).forEach(p => piocher(e, p, h));
    var cibles = vivantsDe(e, c), nbMonstres = monstresDe(e, c).length;
    monstresDe(e, c).forEach(m => {
      var cible = cibles.length ? cibles[Math.floor(h() * cibles.length)].nom : null, i;
      if (m.type === 'slime') i = h() < 0.75 ? { t: 'attaque', cible: cible } : { t: 'rien' };
      else if (m.type === 'chauve') i = { t: 'attaque', cible: cible };
      else if (m.type === 'squelette') i = (m.garde = !m.garde) ? { t: 'attaque', cible: cible } : { t: 'garde' };
      else {
        m.preps = m.preps || 0;
        if (m.prep === 1) { m.prep = 0; i = { t: 'ecrase' }; }
        else if (m.prep === 2) { m.prep = 1; i = { t: 'prepare', n: 1 }; }
        else if ((m.pv * 2 <= m.pvMax && m.preps < 1) || (m.pv * 4 <= m.pvMax && m.preps < 2)) { m.preps++; m.prep = 2; i = { t: 'prepare', n: 2 }; }
        else if (c.tour % 3 === 0 && nbMonstres < 4) i = { t: 'appel' };
        else i = { t: 'attaque', cible: cible };
      }
      c.intentions[m.id] = i;
    });
  }
  // Un joueur choisit une carte de sa main (il peut changer d'avis tant que le tour n'est pas joué)
  function jouerCarte(e, nom, i, cible) {
    var p = e.joueurs[nom], c = p && e.combats[p.salle];
    if (!c || p.fantome || c.joueurs.indexOf(nom) < 0) return 'Pas de combat';
    var id = p.main[i], k = CARTES[id];
    if (!k) return 'Carte inconnue';
    var monstres = monstresDe(e, c), amis = vivantsDe(e, c).filter(q => q.nom !== nom);
    if (k.cible === 'monstre') {
      if (!monstres.some(m => m.id === cible)) { if (monstres.length === 1) cible = monstres[0].id; else return 'Choisis un monstre'; }
    } else if (k.cible === 'ami') {
      if (!amis.some(q => q.nom === cible)) { if (amis.length === 1) cible = amis[0].nom; else return amis.length ? 'Choisis un ami' : 'Personne à protéger'; }
    } else if (k.cible === 'joueur') {
      if (!(c.joueurs.indexOf(cible) >= 0 && e.joueurs[cible])) cible = nom;
    } else cible = null;
    c.choix[nom] = { i: i, carte: id, cible: cible };
    c.pret = 0;
    return null;
  }
  function annulerCarte(e, nom) { var p = e.joueurs[nom], c = p && e.combats[p.salle]; if (c) { delete c.choix[nom]; c.pret = 0; } }
  // On attend tout le monde : quand tous les vivants ont choisi (les absents se protègent tout seuls), le tour se joue 0,6 s plus tard
  function avancerCombat(e, c, h, absents) {
    if (!monstresDe(e, c).length) { delete e.combats[c.salle]; return; }
    var vivants = vivantsDe(e, c);
    if (!vivants.length) { finCombat(e, c, false); return; }
    var prets = vivants.every(p => c.choix[p.nom] || absents[p.nom]);
    if (!prets) { c.pret = 0; return; }
    if (!c.pret) { c.pret = e.maintenant; return; }
    if (e.maintenant - c.pret < 600) return;
    vivants.forEach(p => {
      if (c.choix[p.nom] || !absents[p.nom]) return;
      var b = p.main.indexOf('bouclier');
      c.choix[p.nom] = b >= 0 ? { i: b, carte: 'bouclier', cible: null } : null;
    });
    resoudre(e, c, h);
  }
  function nomMonstre(m) { return MONSTRES[m.type].nom; }
  function resoudre(e, c, h) {
    var J = vivantsDe(e, c), journal = [], coups = [], bouclier = {}, protege = {}, esquive = {}, faible = {};
    var tous = c.joueurs.map(n => e.joueurs[n]).filter(Boolean);
    // 1. Défenses, soins, point faible
    J.forEach(p => {
      var ch = c.choix[p.nom];
      if (!ch) return;
      if (ch.carte === 'bouclier') { bouclier[p.nom] = 1; journal.push('🛡️ ' + nomCp(p) + ' se protège.'); }
      else if (ch.carte === 'proteger') { var a = e.joueurs[ch.cible]; if (a && !a.fantome) { protege[a.nom] = p.nom; journal.push('🤝 ' + nomCp(p) + ' protège ' + nomCp(a) + '.'); } }
      else if (ch.carte === 'bond') esquive[p.nom] = 1;
      else if (ch.carte === 'pointfaible') { var m = e.ennemis.find(x => x.id === ch.cible); if (m) { faible[m.id] = 1; journal.push('🎯 ' + nomCp(p) + ' trouve le point faible de ' + nomMonstre(m) + ' !'); } }
      else if (ch.carte === 'trefle') {
        var q = e.joueurs[ch.cible] || p;
        if (q.fantome) { q.fantome = false; q.coeurs = 1; journal.push('🍀 ' + nomCp(p) + ' ranime ' + nomCp(q) + ' !'); if (c.joueurs.indexOf(q.nom) < 0) c.joueurs.push(q.nom); }
        else if (q.coeurs < q.max) { q.coeurs++; journal.push('🍀 ' + nomCp(p) + ' soigne ' + (q === p ? '' : nomCp(q) + ' ') + '(+1 ❤️).'); }
        else journal.push('🍀 ' + nomCp(q) + ' a déjà tous ses cœurs.');
        coups.push({ qui: q.nom, v: '+1' });
      }
    });
    // 2. Attaques des joueurs, au dé
    function frapper(p, m, base, d, sansEsquive) {
      if (!m || m.pv <= 0) { var autres = monstresDe(e, c).filter(x => x.pv > 0); m = autres[Math.floor(h() * autres.length)]; if (!m) return; }
      if (MONSTRES[m.type].esquive && !sansEsquive && d <= 2) { journal.push('🎲' + d + ' ' + nomMonstre(m) + ' esquive ' + nomCp(p) + ' !'); coups.push({ qui: m.id, v: 'raté', de: d }); return; }
      var n = Math.max(0, base + (faible[m.id] ? 1 : 0) - (c.intentions[m.id] && c.intentions[m.id].t === 'garde' ? 1 : 0));
      m.pv -= n;
      journal.push('🎲' + d + ' ' + nomCp(p) + ' → ' + nomMonstre(m) + ' : −' + n);
      coups.push({ qui: m.id, v: -n, de: d });
    }
    J.forEach(p => {
      var ch = c.choix[p.nom];
      if (!ch) return;
      var m = e.ennemis.find(x => x.id === ch.cible), d = 1 + Math.floor(h() * 6);
      if (ch.carte === 'griffe' || ch.carte === 'bond') frapper(p, m, degats(d), d);
      else if (ch.carte === 'grandcoup') frapper(p, m, 1 + degats(d), d);
      else if (ch.carte === 'feu') { journal.push('🔥 ' + nomCp(p) + ' crache du feu !'); monstresDe(e, c).forEach(x => frapper(p, x, d === 6 ? 2 : 1, d, true)); }
    });
    // Monstres vaincus
    monstresDe(e, c).forEach(m => {
      if (m.pv > 0) return;
      e.ennemis = e.ennemis.filter(x => x !== m);
      effet(e, m.salle, m.x, m.y, 'pouf');
      journal.push('💨 ' + nomMonstre(m) + ' est vaincu !');
      if (m.type === 'boss') { e.poussiere += 5; e.phase = 'fin'; e.fin = { gagne: true, t: e.maintenant }; annonce(e, '🎉 Le Roi Gluant est vaincu ! Le trésor est à vous !'); }
      else if (h() < 0.6) e.poussiere++;
    });
    // 3. Les monstres encore debout
    function coup(m, cibleNom) {
      var q = e.joueurs[cibleNom];
      if (!q || q.fantome || q.salle !== c.salle) { var l = vivantsDe(e, c); q = l[Math.floor(h() * l.length)]; if (!q) return; }
      if (protege[q.nom] && e.joueurs[protege[q.nom]] && !e.joueurs[protege[q.nom]].fantome) q = e.joueurs[protege[q.nom]];
      if (bouclier[q.nom] || esquive[q.nom]) { journal.push((esquive[q.nom] ? '💨 ' : '🛡️ ') + nomCp(q) + ' évite le coup de ' + nomMonstre(m) + '.'); coups.push({ qui: q.nom, v: 'paré' }); return; }
      blesser(e, q, 1);
      journal.push('💢 ' + nomMonstre(m) + ' frappe ' + nomCp(q) + ' : −1 ❤️');
      coups.push({ qui: q.nom, v: -1 });
    }
    if (e.phase === 'jeu') monstresDe(e, c).forEach(m => {
      var i = c.intentions[m.id] || { t: 'rien' };
      if (i.t === 'attaque') coup(m, i.cible);
      else if (i.t === 'ecrase') { journal.push('💥 Le Roi Gluant écrase tout le monde !'); vivantsDe(e, c).forEach(q => coup(m, q.nom)); }
      else if (i.t === 'appel') {
        var place = [[3, 3], [7, 3], [3, 5], [7, 5], [5, 2], [5, 6]].find(p => !e.ennemis.some(x => x.salle === c.salle && x.x === p[0] && x.y === p[1]));
        if (place) { e.ennemis.push({ id: ++e.seq, type: 'slime', salle: c.salle, x: place[0], y: place[1], pv: 2, pvMax: 2, pas: 0, dir: 'b' }); journal.push('🟢 Le Roi Gluant appelle un gluant !'); }
      }
      else if (i.t === 'prepare') journal.push('😤 Le Roi Gluant prend son élan…');
    });
    tous.forEach(p => defausser(p));
    c.journal = journal.slice(-8); c.coups = coups; c.resolu = ++e.seq;
    if (e.phase !== 'jeu') { delete e.combats[c.salle]; return; }
    if (!monstresDe(e, c).length) return finCombat(e, c, true);
    if (!vivantsDe(e, c).length) return finCombat(e, c, false);
    nouveauTour(e, c, h);
  }
  function finCombat(e, c, gagne) {
    c.joueurs.forEach(n => { var p = e.joueurs[n]; if (p) defausser(p); });
    delete e.combats[c.salle];
    annonce(e, gagne ? '🎉 Victoire ! La pièce est libre.' : '👻 Le groupe est KO dans cette pièce… les monstres restent là.');
    e.dernierCombat = { salle: c.salle, gagne: gagne, journal: c.journal, t: e.maintenant, id: c.id };
  }

  // ---------- Un pas de simulation (dix fois par seconde) ----------
  function tick(e, maintenant, h, absents) {
    if (e.phase !== 'jeu') return;
    h = h || Math.random;
    var dt = e.maintenant ? Math.min(500, maintenant - e.maintenant) : 0;
    e.maintenant = maintenant;
    if (!e.debut) e.debut = maintenant;
    var joueurs = Object.values(e.joueurs);
    joueurs.forEach(p => bougerJoueur(e, p));
    // Monstres : ils ne bougent que dans les pièces où quelqu'un est en vie
    var occupees = {};
    joueurs.forEach(p => { if (!p.fantome) occupees[p.salle] = true; });
    e.ennemis.slice().forEach(m => {
      if (!occupees[m.salle] || e.combats[m.salle] || maintenant < m.pas) return;
      m.pas = maintenant + MONSTRES[m.type].vitesse * (0.85 + h() * 0.3);
      var d = choisirDir(e, m, h);
      if (!d) return;
      var v = DX[d];
      if (marchableEnnemi(e, m, m.x + v[0], m.y + v[1])) { m.x += v[0]; m.y += v[1]; m.dir = d; }
    });
    // Au contact (même case ou une des 8 cases autour) d'un monstre : combat au tour par tour dans la pièce
    joueurs.forEach(p => {
      if (p.fantome || e.combats[p.salle]) return;
      if (e.ennemis.some(m => m.salle === p.salle && Math.abs(m.x - p.x) <= 1 && Math.abs(m.y - p.y) <= 1)) demarrerCombat(e, p.salle, h);
    });
    Object.keys(e.combats).forEach(id => avancerCombat(e, e.combats[id], h, absents || {}));
    if (e.phase !== 'jeu') return;
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
      var ami = !e.combats[f.salle] && joueurs.some(p => !p.fantome && p.salle === f.salle && Math.abs(p.x - f.x) <= 1 && Math.abs(p.y - f.y) <= 1);
      f.reanim = ami ? f.reanim + dt : 0;
      if (f.reanim >= REANIMATION) {
        f.fantome = false; f.coeurs = 1; f.reanim = 0;
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
           pouvoirDe: pouvoirDe, hasard: hasard, generer: generer, nouvelle: nouvelle, ajouterJoueur: ajouterJoueur, entree: entree,
           CARTES: CARTES, CARTE_POUVOIR: CARTE_POUVOIR, jouerCarte: jouerCarte, annulerCarte: annulerCarte, demarrerCombat: demarrerCombat,
           tick: tick, tuile: tuile, idx: idx, etatMobile: etatMobile, pieces: pieces };
})();
if (typeof module !== 'undefined') module.exports = DJ;
