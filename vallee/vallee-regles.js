// ================== LA VALLÉE DE DÉSDALE : la carte, les déplacements, le brouillard et les quêtes ==================
// Phase 1 (demandée par l'utilisateur le 11 novembre 2026) : le village et la forêt autour, la crypte (entrée du Donjon),
// ma maison (la maison du compagnon), un marchand, un tableau de quêtes, 4 quêtes d'habitants.
// Le monde est le même pour tous (dessiné à la main, petites variations tirées d'une graine fixe) ;
// la progression (position, brouillard, quêtes) est gardée sur le téléphone (`vallee-etat`, dans la sauvegarde).
// Moteur sans écran : testable avec Node (`node vallee/vallee-test.js`).

var VL = (function () {
  var W = 11, H = 9;               // un écran = 11 × 9 cases, comme une pièce du Donjon
  var EW = 3, EH = 3;              // le monde : 3 × 3 écrans (le village au centre)
  var LARG = W * EW, HAUT = H * EH;
  var GRAINE = 20261111;           // graine fixe : mêmes petites variations (arbres, fleurs) pour tout le monde
  var VISION = 3.6;                // rayon de ce que l'on découvre autour de soi (en cases)

  // ---------- Les écrans (lignes de 11 cases) ----------
  // .  herbe   ,  fleurs   :  chemin   =  pont         (on y marche)
  // T  arbre   S  sapin    b  buisson  h  haie   o  souche   ~  eau   x  bâtiment (dessiné à part)
  // m  étal du marchand    Q  tableau de quêtes   F  fontaine   c  coffre
  // r  ronces (🔥)   R  rocher (💪)   v  trou (🦘)   s  passage secret (👃) : le pouvoir du compagnon les ouvre
  var ECRANS = [
    [ { id: 'sapins', nom: 'Bois des sapins', ico: '🌲', l: [
        'SSSSSSSSSSS',
        'SS..S..SSSS',
        'S..,...S..S',
        'S.S..:....S',
        'S...:::::::',
        'SS..:..S..S',
        'S..S:.,..SS',
        'SS..:..S.SS',
        'SSSSS:SSSSS'] },
      { id: 'crypte', nom: 'La vieille crypte', ico: '🗝️', l: [
        'TTTTxxxTTTT',
        'TS..xxx..ST',
        'T...,:,...T',
        'Tb..:::..bT',
        ':::::::::::',
        'TT...:...TT',
        'TS.,.:..,ST',
        'TTb..:..bTT',
        'TTTTT:TTTTT'] },
      { id: 'ermite', nom: 'La cabane de l\'ermite', ico: '🐢', l: [
        'TTTTTTTTTTT',
        'TT..,.xx.TT',
        'T.....xx..T',
        'T.~~..:...T',
        '::~~:::...T',
        'T...:..,..T',
        'Tb..:...b.T',
        'TT..:..TTTT',
        'TTTTT:TTTTT'] } ],
    [ { id: 'ruisseau', nom: 'Le ruisseau', ico: '💧', l: [
        'TTTTT:TTTTT',
        'T..,.:..b.T',
        '~~~~~=~~~~T',
        'T.b..:..,.T',
        'T....::::::',
        'T.,..:....T',
        'Tb...:..o.T',
        'T..,.:...bT',
        'TTTTT:TTTTT'] },
      { id: 'village', nom: 'Le village', ico: '🏡', l: [
        'hhhhh:hhhhh',
        'hxxx.:.mmQh',
        'hxxx.:....h',
        'h.::::::..h',
        ':::::F:::::',
        'h..::::.xxh',
        'hxx..:..xxh',
        'hxx.,:....h',
        'hhhhh:hhhhh'] },
      { id: 'clairiere', nom: 'La clairière', ico: '🍄', l: [
        'TTTTT:TTTTT',
        'TT...:...TT',
        'T..,.:.,..T',
        'T...:::...T',
        ':::::::...T',
        'T..,:::.,.T',
        'T....:..o.T',
        'TT.b.:..TTT',
        'TTTTT:TTTTT'] } ],
    [ { id: 'chene', nom: 'Le vieux chêne', ico: '🌳', l: [
        'TTTTT:TTTTT',
        'T,...:...,T',
        'T..xx:....T',
        'T..xx:....T',
        'T....::::::',
        'Tb.,....b.T',
        'T..~~..,..T',
        'TT.~~...TTT',
        'TTTTTTTTTTT'] },
      { id: 'pre', nom: 'Le pré', ico: '🌼', l: [
        'TTTTT:TTTTT',
        'T.,..:..,.T',
        'T..b.:....T',
        'T,...:..,.T',
        ':::::::::::',
        'T.,....,..T',
        'T..o..b...T',
        'TT.,...,.TT',
        'TTTTTTTTTTT'] },
      { id: 'bosquet', nom: 'Le bosquet secret', ico: '✨', l: [
        'TTTTT:TTTTT',
        'T,...:..b.T',
        'T....:....T',
        'T.b.::::..T',
        '::::::TrT.T',
        'T,....vcs.T',
        'T..,..TRT.T',
        'T.b.......T',
        'TTTTTTTTTTT'] } ]
  ];

  var MARCHE = { '.': 1, ',': 1, ':': 1, '=': 1 };
  var OBSTACLES = { r: 'ronces', R: 'force', v: 'bond', s: 'flair' };
  var POUVOIRS = {
    ronces: { nom: 'Débroussailler', ico: '🔥', obstacle: 'des ronces', fait: 'brûle les ronces' },
    force: { nom: 'Force', ico: '💪', obstacle: 'un gros rocher', fait: 'pousse le rocher' },
    bond: { nom: 'Bond', ico: '🦘', obstacle: 'un trou', fait: 'pose une planche sur le trou' },
    flair: { nom: 'Flair', ico: '👃', obstacle: 'un buisson très épais', fait: 'flaire un passage secret' }
  };
  // Pouvoir de chaque espèce (même table que ESPECES dans donjon/donjon-regles.js, à tenir ensemble)
  var POUVOIR_ESPECE = { dragon: 'ronces', chat: 'ronces', oie: 'ronces', panda: 'force', tortue: 'force', chevre: 'force',
                         lapin: 'bond', ecureuil: 'bond', singe: 'bond', chien: 'flair', renard: 'flair', raton: 'flair' };

  function g(ex, ey, x, y) { return { x: ex * W + x, y: ey * H + y }; }

  // ---------- Bâtiments et lieux (dessinés à part, posés sur des cases « x ») ----------
  var BATIMENTS = [
    Object.assign({ type: 'maison', w: 3, h: 2 }, g(1, 1, 1, 1)),
    Object.assign({ type: 'hutte', w: 2, h: 2 }, g(1, 1, 1, 6)),
    Object.assign({ type: 'forge', w: 2, h: 2 }, g(1, 1, 8, 5)),
    Object.assign({ type: 'crypte', w: 3, h: 2 }, g(1, 0, 4, 0)),
    Object.assign({ type: 'cabane', w: 2, h: 2 }, g(2, 0, 6, 1)),
    Object.assign({ type: 'chene', w: 2, h: 2 }, g(0, 2, 3, 2))
  ];
  // Ce qui se passe quand on fonce dans une case
  var ACTIONS = {};
  function action(p, a) { ACTIONS[p.x + ',' + p.y] = a; }
  action(g(1, 1, 2, 2), { id: 'maison' });
  [1, 3].forEach(x => action(g(1, 1, x, 2), { id: 'maison' }));
  action(g(1, 1, 7, 1), { id: 'marchand' }); action(g(1, 1, 8, 1), { id: 'marchand' });
  action(g(1, 1, 9, 1), { id: 'tableau' });
  action(g(1, 1, 5, 4), { id: 'fontaine' });
  [[1, 6], [2, 6], [1, 7], [2, 7]].forEach(c => action(g(1, 1, c[0], c[1]), { id: 'hutte' }));
  [[8, 5], [9, 5], [8, 6], [9, 6]].forEach(c => action(g(1, 1, c[0], c[1]), { id: 'forge' }));
  [4, 5, 6].forEach(x => action(g(1, 0, x, 1), { id: 'crypte' }));
  [[6, 1], [7, 1], [6, 2], [7, 2]].forEach(c => action(g(2, 0, c[0], c[1]), { id: 'cabane' }));
  [[3, 2], [4, 2], [3, 3], [4, 3]].forEach(c => action(g(0, 2, c[0], c[1]), { id: 'chene' }));
  action(g(2, 2, 7, 5), { id: 'coffre' });

  // ---------- Les habitants ----------
  var HABITANTS = {
    bubo: Object.assign({ nom: 'M. Bubo', titre: 'le maire', espece: 'hibou', ico: '🦉' }, g(1, 1, 8, 3)),
    sauge: Object.assign({ nom: 'Mme Sauge', titre: 'l\'herboriste', espece: 'herisson', ico: '🦔' }, g(1, 1, 3, 6)),
    bruno: Object.assign({ nom: 'Bruno', titre: 'le forgeron', espece: 'ours', ico: '🐻' }, g(1, 1, 7, 6)),
    tortue: Object.assign({ nom: 'Papi Tortue', titre: 'l\'ermite', espece: 'tortue', ico: '🐢' }, g(2, 0, 8, 2)),
    pipa: Object.assign({ nom: 'Pipa', titre: 'la marchande', espece: 'chat', ico: '🐱', etal: true }, g(1, 1, 7, 1))
  };
  // Les champignons de Mme Sauge (on en garde 5 ; ils n'apparaissent que pendant la quête)
  var CHAMPIGNONS = [
    g(0, 0, 2, 2), g(0, 0, 8, 6), g(0, 1, 8, 3), g(0, 1, 2, 6), g(2, 1, 2, 2), g(2, 1, 7, 6), g(2, 1, 2, 5), g(0, 2, 6, 2), g(1, 2, 8, 6)
  ].map((p, k) => Object.assign({ id: 'ch' + k }, p));

  // ---------- Les quêtes ----------
  var QUETES = {
    herbes: { nom: 'La soupe de Mme Sauge', ico: '🍄', qui: 'sauge', but: 5, recompense: { etoiles: 5 },
              resume: 'Rapporter 5 champignons de la forêt à Mme Sauge.' },
    lettre: { nom: 'Une lettre pour l\'ermite', ico: '✉️', qui: 'bubo', recompense: { deco: 'val-lanterne' },
              resume: 'Porter la lettre du maire à Papi Tortue, au nord-est, puis rapporter sa réponse.' },
    cle: { nom: 'La clé du forgeron', ico: '🔑', qui: 'bruno', recompense: { etoiles: 8 },
           resume: 'Retrouver la clé de Bruno, perdue dans le bosquet du sud-est.' },
    gardien: { nom: 'Le gardien de la crypte', ico: '⚔️', qui: 'tableau', recompense: { deco: 'val-banniere' },
               resume: 'Descendre dans la crypte et vaincre le boss du premier étage du Donjon.' }
  };
  var ORDRE_QUETES = ['lettre', 'herbes', 'cle', 'gardien'];
  // Déco de la Vallée (articles « souvenir: 'vallee' » de compagnon-commun.js) : vendue par Pipa, ou offerte par une quête
  var VENTE = [{ id: 'val-champi', prix: 15 }, { id: 'val-hibou', prix: 20 }, { id: 'val-carte', prix: 25 }];

  // ---------- Hasard fixe (variations du dessin) ----------
  function hash(x, y, k) {
    var h = (GRAINE ^ (x * 374761393) ^ (y * 668265263) ^ ((k || 0) * 2147483647)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  // ---------- Lecture de la carte ----------
  function tuile(x, y) {
    if (x < 0 || y < 0 || x >= LARG || y >= HAUT) return null;
    return ECRANS[Math.floor(y / H)][Math.floor(x / W)].l[y % H][x % W];
  }
  function ecranDe(x, y) { return { ex: Math.floor(x / W), ey: Math.floor(y / H) }; }
  function ecran(x, y) { var c = ecranDe(x, y); return ECRANS[c.ey][c.ex]; }
  function habitantEn(x, y) {
    for (var id in HABITANTS) { var h = HABITANTS[id]; if (h.x === x && h.y === y && !h.etal) return id; }
    return null;
  }
  function ouvert(e, x, y) { return !!(e.ouverts && e.ouverts[x + ',' + y]); }
  // Une case où l'on peut marcher (obstacle déjà ouvert compris)
  function libre(e, x, y) {
    var t = tuile(x, y);
    if (t === null) return false;
    if (habitantEn(x, y)) return false;
    if (OBSTACLES[t]) return ouvert(e, x, y);
    return !!MARCHE[t];
  }

  // ---------- État d'un joueur ----------
  function nouvelEtat() {
    var p = g(1, 1, 2, 3);
    var e = { v: 1, x: p.x, y: p.y, dir: 'b', vu: '', ouverts: {}, pris: {}, quetes: {}, coffre: false, cle: false, pas: 0 };
    reveler(e);
    return e;
  }
  // Une sauvegarde vient du téléphone (ou d'un fichier) : on la vérifie
  function charger(s) {
    var e = nouvelEtat();
    if (!s || typeof s !== 'object' || s.v !== 1) return e;
    ['ouverts', 'pris'].forEach(k => { if (s[k] && typeof s[k] === 'object') e[k] = Object.assign({}, s[k]); });
    if (libre(e, s.x | 0, s.y | 0)) { e.x = s.x | 0; e.y = s.y | 0; }
    e.dir = ['h', 'b', 'g', 'd'].indexOf(s.dir) >= 0 ? s.dir : 'b';
    e.vu = typeof s.vu === 'string' && /^[0-9a-f]*$/.test(s.vu) ? s.vu : '';
    if (s.quetes && typeof s.quetes === 'object') Object.keys(QUETES).forEach(id => { if (s.quetes[id] && typeof s.quetes[id] === 'object') e.quetes[id] = Object.assign({}, s.quetes[id]); });
    e.coffre = !!s.coffre; e.cle = !!s.cle; e.pas = s.pas | 0;
    reveler(e);
    return e;
  }

  // ---------- Brouillard : une case par bit, en hexadécimal (33 × 27 cases = 223 signes) ----------
  function bits(e) {
    var n = LARG * HAUT, b = new Uint8Array(Math.ceil(n / 4)), s = e.vu || '';
    for (var i = 0; i < b.length && i < s.length; i++) b[i] = parseInt(s[i], 16) || 0;
    return b;
  }
  function estVu(e, x, y, b) {
    b = b || bits(e);
    var i = y * LARG + x;
    return !!(b[i >> 2] & (1 << (i & 3)));
  }
  function reveler(e) {
    var b = bits(e), r = Math.ceil(VISION), change = false;
    for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
      var x = e.x + dx, y = e.y + dy;
      if (x < 0 || y < 0 || x >= LARG || y >= HAUT || Math.hypot(dx, dy) > VISION) continue;
      var i = y * LARG + x;
      if (!(b[i >> 2] & (1 << (i & 3)))) { b[i >> 2] |= 1 << (i & 3); change = true; }
    }
    if (change || !e.vu) e.vu = Array.from(b, v => v.toString(16)).join('');
    return change;
  }
  function partVue(e) {
    var b = bits(e), n = 0, t = 0;
    for (var y = 0; y < HAUT; y++) for (var x = 0; x < LARG; x++) { t++; if (estVu(e, x, y, b)) n++; }
    return n / t;
  }

  // ---------- Quêtes ----------
  function etatQuete(e, id) { var q = e.quetes[id]; return q ? q.etat : 'dispo'; }
  function champignonVisible(e, c) { return etatQuete(e, 'herbes') === 'cours' && !e.pris[c.id]; }
  // ctx.bossTotal : nombre de boss du Donjon vaincus jusqu'ici (donjon-stats.boss)
  function verifier(e, ctx) {
    var q = e.quetes, change = false;
    if (q.herbes && q.herbes.etat === 'cours' && (q.herbes.n | 0) >= QUETES.herbes.but) { q.herbes.etat = 'rendre'; change = true; }
    if (q.cle && q.cle.etat === 'cours' && e.cle) { q.cle.etat = 'rendre'; change = true; }
    if (q.gardien && q.gardien.etat === 'cours' && ctx && (ctx.bossTotal | 0) > (q.gardien.boss | 0)) { q.gardien.etat = 'rendre'; change = true; }
    return change;
  }
  function accepter(e, id, ctx) {
    if (!QUETES[id] || etatQuete(e, id) !== 'dispo') return false;
    var q = { etat: 'cours', t: Date.now() };
    if (id === 'herbes') q.n = 0;
    if (id === 'lettre') q.etape = 'porter';
    if (id === 'gardien') q.boss = ctx && ctx.bossTotal | 0;
    e.quetes[id] = q;
    verifier(e, ctx);
    return true;
  }
  function rendre(e, id) {
    if (etatQuete(e, id) !== 'rendre') return null;
    e.quetes[id].etat = 'finie'; e.quetes[id].fin = Date.now();
    return Object.assign({ quete: id }, QUETES[id].recompense);
  }
  // Quête dont un habitant attend quelque chose : « ! » (à prendre) ou « ? » (à rendre) au-dessus de sa tête
  function marque(e, qui, ctx) {
    var m = '';
    Object.keys(QUETES).forEach(id => {
      var Q = QUETES[id], s = etatQuete(e, id);
      if (Q.qui === qui && s === 'rendre') m = '?';
      else if (Q.qui === qui && s === 'dispo' && !m) m = '!';
    });
    if (qui === 'tortue' && e.quetes.lettre && e.quetes.lettre.etat === 'cours' && e.quetes.lettre.etape === 'porter') m = '?';
    if (qui === 'bubo' && e.quetes.lettre && e.quetes.lettre.etape === 'reponse' && e.quetes.lettre.etat === 'rendre') m = '?';
    return m;
  }
  // Quête à suivre : celle qu'on peut rendre d'abord, sinon la plus ancienne en cours
  function queteSuivie(e) {
    var l = ORDRE_QUETES.filter(id => etatQuete(e, id) === 'rendre');
    if (!l.length) l = ORDRE_QUETES.filter(id => etatQuete(e, id) === 'cours').sort((a, b) => e.quetes[a].t - e.quetes[b].t);
    return l[0] || null;
  }
  // Ce qu'il reste à faire, en une ligne
  function consigne(e, id) {
    var q = e.quetes[id], s = etatQuete(e, id);
    if (s === 'rendre') return id === 'gardien' ? 'Retourne au tableau de quêtes' : 'Retourne voir ' + HABITANTS[QUETES[id].qui].nom;
    if (s !== 'cours') return QUETES[id].resume;
    if (id === 'herbes') return 'Champignons : ' + (q.n | 0) + ' / ' + QUETES.herbes.but;
    if (id === 'lettre') return 'Porte la lettre à Papi Tortue (nord-est)';
    if (id === 'cle') return 'Cherche la clé dans le bosquet (sud-est)';
    if (id === 'gardien') return 'Bats le boss du 1er étage de la crypte';
    return '';
  }
  // Où aller pour la quête suivie (une case), pour la flèche sur la carte
  function cible(e, id, ctx) {
    if (!id) return null;
    var s = etatQuete(e, id), q = e.quetes[id];
    if (s === 'rendre') return id === 'gardien' ? g(1, 1, 9, 1) : HABITANTS[QUETES[id].qui];
    if (id === 'lettre') return HABITANTS.tortue;
    if (id === 'cle') return ctx && !ctx.pouvoir ? g(0, 2, 4, 3) : g(2, 2, 7, 5);
    if (id === 'gardien') return g(1, 0, 5, 1);
    if (id === 'herbes') {
      var c = CHAMPIGNONS.filter(k => !e.pris[k.id]).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
      return c || null;
    }
    return null;
  }

  // ---------- Un pas dans une direction ----------
  // ctx = { pouvoir: 'ronces' | 'force' | 'bond' | 'flair' | null, bossTotal }
  // Renvoie ce qui s'est passé : { bouge, ecran (on a changé d'écran), ramasse, parler, action, obstacle, ouvre, bord }
  var DIRS = { h: [0, -1], b: [0, 1], g: [-1, 0], d: [1, 0] };
  function pas(e, d, ctx) {
    var v = DIRS[d]; if (!v) return {};
    e.dir = d;
    var nx = e.x + v[0], ny = e.y + v[1], t = tuile(nx, ny), k = nx + ',' + ny;
    if (t === null) return { bord: true };
    var hab = habitantEn(nx, ny);
    if (hab) return { parler: hab };
    if (ACTIONS[k]) return { action: ACTIONS[k].id, x: nx, y: ny };
    if (OBSTACLES[t] && !ouvert(e, nx, ny)) {
      var besoin = OBSTACLES[t];
      if (ctx && ctx.pouvoir === besoin) { e.ouverts[k] = 1; return { ouvre: besoin, x: nx, y: ny }; }
      return { obstacle: besoin, x: nx, y: ny };
    }
    if (!libre(e, nx, ny)) return { mur: t };
    var avant = ecranDe(e.x, e.y);
    e.x = nx; e.y = ny; e.pas++;
    var r = { bouge: true, decouvre: reveler(e) };
    var apres = ecranDe(e.x, e.y);
    if (avant.ex !== apres.ex || avant.ey !== apres.ey) r.ecran = true;
    var c = CHAMPIGNONS.find(c => c.x === nx && c.y === ny && champignonVisible(e, c));
    if (c) {
      e.pris[c.id] = 1; e.quetes.herbes.n = (e.quetes.herbes.n | 0) + 1;
      r.ramasse = 'champignon'; r.n = e.quetes.herbes.n;
      verifier(e, ctx);
    }
    return r;
  }

  // ---------- Conversations ----------
  // Renvoie { qui, texte, boutons: [{ t, a, principal }] } ; a = action passée à agir()
  function parler(e, qui, ctx) {
    var H = HABITANTS[qui], q = e.quetes, s, nom = ctx && ctx.nom;
    var tu = nom ? nom : 'ton compagnon';
    var plusTard = { t: 'Plus tard', a: 'fermer' }, ok = { t: 'Au revoir !', a: 'fermer' };
    if (qui === 'sauge') {
      s = etatQuete(e, 'herbes');
      if (s === 'dispo') return { qui: qui, texte: 'Bonjour, mon petit ! Je prépare ma fameuse soupe aux champignons, mais mes vieilles pattes ne vont plus jusqu\'aux bois. Tu m\'en rapporterais 5 ? On en trouve un peu partout dans la forêt, autour du village.',
                                  boutons: [{ t: '🍄 J\'y vais !', a: 'accepter:herbes', principal: true }, plusTard] };
      if (s === 'cours') return { qui: qui, texte: 'Alors, ces champignons ? Il m\'en faut encore ' + (QUETES.herbes.but - (q.herbes.n | 0)) + '. Regarde au pied des arbres, dans tous les bois autour du village.', boutons: [ok] };
      if (s === 'rendre') return { qui: qui, texte: 'Oh ! Cinq beaux champignons, et ils sentent si bon… Merci, mon petit. Tiens, pour ta peine.',
                                   boutons: [{ t: '🍄 Donner les champignons', a: 'rendre:herbes', principal: true }] };
      return { qui: qui, texte: 'La soupe mijote ! Reviens la goûter quand tu veux. ' + (nom ? nom + ' aussi, bien sûr.' : ''), boutons: [ok] };
    }
    if (qui === 'bubo') {
      s = etatQuete(e, 'lettre');
      if (s === 'dispo') return { qui: qui, texte: 'Hou hou ! Bienvenue dans la Vallée. Dis-moi, tu as l\'air d\'aimer marcher : pourrais-tu porter cette lettre à Papi Tortue, l\'ermite ? Il vit au nord-est, au bout de la forêt.',
                                  boutons: [{ t: '✉️ Prendre la lettre', a: 'accepter:lettre', principal: true }, plusTard] };
      if (s === 'cours') return { qui: qui, texte: 'Papi Tortue vit au nord-est. Sors du village par le haut, puis prends à droite. Il ne va pas bien vite, tu le trouveras devant sa cabane !', boutons: [ok] };
      if (s === 'rendre') return { qui: qui, texte: 'Une réponse de Papi Tortue ? Il ne m\'écrit jamais ! Voyons… « Viens donc boire une tisane, vieux hibou. » Hou hou hou ! Merci ! Tiens, prends cette lanterne : elle éclairera la maison de ' + tu + '.',
                                   boutons: [{ t: '🏮 Merci !', a: 'rendre:lettre', principal: true }] };
      return { qui: qui, texte: 'Grâce à toi, je vais rendre visite à Papi Tortue. Ça faisait des années ! Hou hou.', boutons: [ok] };
    }
    if (qui === 'tortue') {
      if (q.lettre && q.lettre.etat === 'cours' && q.lettre.etape === 'porter')
        return { qui: qui, texte: 'Une lettre ? Pour moi ? … Ce vieux Bubo ! Attends, je lui réponds… (il écrit très, très lentement) … Voilà. Porte-lui ma réponse, veux-tu ?',
                 boutons: [{ t: '✉️ Prendre la réponse', a: 'reponse', principal: true }] };
      if (etatQuete(e, 'cle') === 'cours' && !e.cle)
        return { qui: qui, texte: ctx && ctx.pouvoir ? 'La clé de Bruno ? Les écureuils m\'ont parlé d\'un coffre au fond du bosquet, au sud-est. Ronces, rochers, trous… seul un compagnon sait passer par là. Fonce dans l\'obstacle qui va avec ton pouvoir !'
                                                     : 'La clé de Bruno ? Les écureuils cachent tout ce qui brille dans le creux du vieux chêne, au sud-ouest. Va voir !', boutons: [ok] };
      return { qui: qui, texte: [
        'Bonjour, petit. Ici, on prend le temps. Écoute le vent dans les sapins…',
        'On dit qu\'un coffre dort au fond du bosquet, au sud-est. Seul un compagnon sait l\'ouvrir.',
        'Quand j\'étais jeune, la crypte n\'avait qu\'un étage. Enfin… je crois.'][e.pas % 3], boutons: [ok] };
    }
    if (qui === 'bruno') {
      s = etatQuete(e, 'cle');
      if (s === 'dispo') return { qui: qui, texte: 'Grrr… Bonjour. J\'ai perdu la clé de mon atelier en cueillant des mûres dans le bosquet, au sud-est. Depuis, les ronces et les rochers ont tout recouvert… ' + (ctx && ctx.pouvoir ? 'Ton compagnon saurait passer, lui ?' : 'Tu veux bien chercher ?'),
                                  boutons: [{ t: '🔑 Je la cherche', a: 'accepter:cle', principal: true }, plusTard] };
      if (s === 'cours') return { qui: qui, texte: ctx && ctx.pouvoir ? 'Le bosquet est au sud-est du village. Pour passer un obstacle, fonce dedans : ' + tu + ' s\'en sert de son pouvoir (' + POUVOIRS[ctx.pouvoir].ico + ' ' + POUVOIRS[ctx.pouvoir].nom + ').'
                                                         : 'Papi Tortue sait tout ce qui se passe dans la forêt. Demande-lui !', boutons: [ok] };
      if (s === 'rendre') return { qui: qui, texte: 'Ma clé ! Grrr… de joie ! Je vais pouvoir rallumer la forge. Voilà pour toi.', boutons: [{ t: '🔑 Rendre la clé', a: 'rendre:cle', principal: true }] };
      return { qui: qui, texte: 'Ding ! Dong ! La forge tourne à nouveau. Merci, l\'ami !', boutons: [ok] };
    }
    return { qui: qui, texte: '…', boutons: [ok] };
  }
  // Le tableau de quêtes : l'avis de la garde, et ce qu'il reste à faire
  function tableau(e) {
    var s = etatQuete(e, 'gardien');
    var t = { qui: 'tableau', titre: 'Tableau de quêtes', avis: '', boutons: [] };
    if (s === 'dispo') { t.avis = 'AVIS À LA POPULATION : le gardien du premier étage de la crypte fait trembler la Vallée ! Récompense à qui le vaincra. Signé : la garde.';
                         t.boutons = [{ t: '⚔️ Accepter', a: 'accepter:gardien', principal: true }]; }
    else if (s === 'cours') t.avis = 'Avis de la garde : descends dans la crypte, au nord du village, et bats le boss du premier étage du Donjon.';
    else if (s === 'rendre') { t.avis = 'Victoire ! La garde t\'offre sa bannière du héros, pour la maison.'; t.boutons = [{ t: '🚩 Recevoir la bannière', a: 'rendre:gardien', principal: true }]; }
    else t.avis = 'Le gardien est vaincu. La Vallée te dit merci !';
    t.quetes = ORDRE_QUETES.map(id => ({ id: id, nom: QUETES[id].nom, ico: QUETES[id].ico, etat: etatQuete(e, id), consigne: consigne(e, id),
                                         prendre: QUETES[id].qui === 'tableau' ? 'Sur le tableau de quêtes, au village' : 'Demande à ' + HABITANTS[QUETES[id].qui].nom + ', ' + HABITANTS[QUETES[id].qui].titre }));
    return t;
  }
  // Une action choisie dans une conversation. Renvoie { recompense } quand il y en a une.
  function agir(e, a, ctx) {
    var m = /^(accepter|rendre):(\w+)$/.exec(a || '');
    if (m && m[1] === 'accepter') return { accepte: accepter(e, m[2], ctx), quete: m[2] };
    if (m && m[1] === 'rendre') return { recompense: rendre(e, m[2]) };
    if (a === 'reponse' && e.quetes.lettre && e.quetes.lettre.etape === 'porter') { e.quetes.lettre.etape = 'reponse'; e.quetes.lettre.etat = 'rendre'; return { reponse: true }; }
    return {};
  }
  // On fonce dans le coffre du bosquet, ou dans le vieux chêne (sans compagnon, la clé y est cachée)
  function fouiller(e, ou, ctx) {
    var sansPouvoir = !(ctx && ctx.pouvoir);
    if (ou === 'coffre') {
      if (e.coffre) return { texte: 'Le coffre est vide. Il ne reste qu\'une odeur de mûres.' };
      e.coffre = true;
      var r = { etoiles: 3, texte: 'Le coffre grince… 3 ⭐ brillent au fond' };
      if (!e.cle) { e.cle = true; r.cle = true; r.texte += ', et une grosse clé en fer forgé !' + (etatQuete(e, 'cle') === 'dispo' ? ' Elle doit appartenir à quelqu\'un du village…' : ''); }
      else r.texte += ' !';
      verifier(e, ctx);
      return r;
    }
    if (ou === 'chene') {
      if (sansPouvoir && !e.cle && etatQuete(e, 'cle') === 'cours') { e.cle = true; verifier(e, ctx); return { cle: true, texte: 'Dans le creux du vieux chêne, entre des noisettes et un bouton doré : une grosse clé en fer forgé !' }; }
      return { texte: 'Un chêne immense, plus vieux que le village. On dit qu\'il a vu naître la Vallée.' };
    }
    return {};
  }

  return {
    W: W, H: H, EW: EW, EH: EH, LARG: LARG, HAUT: HAUT, GRAINE: GRAINE, VISION: VISION,
    ECRANS: ECRANS, BATIMENTS: BATIMENTS, ACTIONS: ACTIONS, HABITANTS: HABITANTS, CHAMPIGNONS: CHAMPIGNONS, QUETES: QUETES, ORDRE_QUETES: ORDRE_QUETES,
    OBSTACLES: OBSTACLES, POUVOIRS: POUVOIRS, POUVOIR_ESPECE: POUVOIR_ESPECE, VENTE: VENTE,
    hash: hash, tuile: tuile, ecran: ecran, ecranDe: ecranDe, habitantEn: habitantEn, libre: libre, ouvert: ouvert,
    nouvelEtat: nouvelEtat, charger: charger, bits: bits, estVu: estVu, reveler: reveler, partVue: partVue,
    etatQuete: etatQuete, champignonVisible: champignonVisible, verifier: verifier, accepter: accepter, rendre: rendre, marque: marque,
    queteSuivie: queteSuivie, consigne: consigne, cible: cible, pas: pas, parler: parler, tableau: tableau, agir: agir, fouiller: fouiller
  };
})();
if (typeof module !== 'undefined') module.exports = VL;
