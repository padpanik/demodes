// ================== LA VALLÉE DE DÉSDALE : la carte, les déplacements, le brouillard et les quêtes ==================
// Phase 1 (demandée par l'utilisateur le 11 novembre 2026) : le village et la forêt autour, la crypte (entrée du Donjon),
// ma maison (la maison du compagnon), un marchand, un tableau de quêtes, 4 quêtes d'habitants.
// Le monde est le même pour tous (dessiné à la main, petites variations tirées d'une graine fixe) ;
// la progression (position, brouillard, quêtes) est gardée sur le téléphone (`vallee-etat`, dans la sauvegarde).
// Moteur sans écran : testable avec Node (`node vallee/vallee-test.js`).

var VL = (function () {
  var W = 11, H = 9;               // un écran = 11 × 9 cases, comme une pièce du Donjon
  var EW = 6, EH = 3;              // le monde : 3 × 3 écrans (le village au centre), plus le quartier des amis à l'est, 3 écrans de long (3.51)
  var LARG = W * EW, HAUT = H * EH;
  var GRAINE = 20261111;           // graine fixe : mêmes petites variations (arbres, fleurs) pour tout le monde
  var VISION = 3.6;                // rayon de ce que l'on découvre autour de soi (en cases)

  // ---------- Les écrans (lignes de 11 cases) ----------
  // .  herbe   ,  fleurs   :  chemin   =  pont         (on y marche)
  // T  arbre   S  sapin    b  buisson  h  haie   o  souche   ~  eau   x  bâtiment (dessiné à part)
  // m  étal du marchand    Q  tableau de quêtes   F  fontaine   c  coffre   e  établi (3.50, devant ma maison)
  // r  ronces (🔥)   R  rocher (💪)   v  trou (🦘)   s  passage secret (👃) : le pouvoir du compagnon les ouvre
  // Le marais (3.53) : y  roseaux   -  ponton (on le traverse de gauche à droite)   p  pierres de gué   C  coffre du marais
  //                    P  la passerelle cassée : on y marche une fois réparée par Bruno (quête « La passerelle du marais »)
  // La montagne (3.54) : k  rochers et falaises   G  le col, gardé par le Yéti tant qu'on ne l'a pas battu au Cieljo   B  le belvédère
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
        '::~~:::::::',
        'T...:..,..T',
        'Tb..:...b.T',
        'TT..:..TTTT',
        'TTTTT:TTTTT'] },
      // La montagne (3.54, demandée par l'utilisateur ; le boss du col se bat au Cieljo, une manche) : 3 écrans au nord-est,
      // après la cabane de l'ermite. Le Yéti garde le col ; derrière, les alpages de Gaspard et le sommet enneigé.
      { id: 'montagne1', nom: 'Le col du Yéti', ico: '❄️', zone: 'montagne', sol: 'roche', l: [
        'kkkkkkkkkkk',
        'kkT..kk.Tkk',
        'kT..,.k...k',
        'k.....k.,.k',
        ':G:::::::::',
        'k..,..k...k',
        'kT..kkk.,Tk',
        'kkT..kkTTkk',
        'kkkkkkkkkkk'] },
      { id: 'montagne2', nom: 'Les alpages', ico: '🐐', zone: 'montagne', sol: 'alpage', l: [
        'kkkkkkkkkkk',
        'kT.,.~~~~.k',
        'k..xx~~~~,k',
        'k..xx.~~..k',
        ':::::::::::',
        'k.,......,k',
        'kT...,..T.k',
        'kkT.....Tkk',
        'kkkkkkkkkkk'] },
      { id: 'montagne3', nom: 'Le sommet', ico: '🏔️', zone: 'montagne', sol: 'neige', l: [
        'kkkkkkkkkkk',
        'kkk..B..kkk',
        'kk...:...kk',
        'kT..::..xxk',
        '::::::..xxk',
        'kT...:...Tk',
        'kk..,....kk',
        'kkkT...Tkkk',
        'kkkkkkkkkkk'] } ],
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
        'hxxxe:.mmQh',
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
        ':::::::::::',
        'T..,:::.,.T',
        'T....:..o.T',
        'TT.b.:..TTT',
        'TTTTT:TTTTT'] },
      // Le quartier des amis (3.51, demandé par l'utilisateur) : une rue de 3 écrans qui DÉFILE (la vue suit le compagnon, pas de fondu),
      // 18 parcelles fixes : chaque ami a sa maison, au même endroit (tirée de son identifiant), gardée à vie
      { id: 'quartier', nom: 'Le quartier des amis', ico: '🏘️', defile: true, l: [
        'TTTTTTTTTTT',
        'Txx,xx,xx,,',
        'Txx,xx,xx,,',
        'T::::::::::',
        ':::::::::::',
        'Txx,xx,xx,,',
        'Txx,xx,xx,,',
        'T::::::::::',
        'TTTTTTTTTTT'] },
      { id: 'quartier', nom: 'Le quartier des amis', ico: '🏘️', defile: true, l: [
        'TTTTTTTTTTT',
        ',xx,xx,xx,,',
        ',xx,xx,xx,,',
        ':::::::::::',
        ':::::::::::',
        ',xx,xx,xx,,',
        ',xx,xx,xx,,',
        ':::::::::::',
        'TTTTTTTTTTT'] },
      { id: 'quartier', nom: 'Le quartier des amis', ico: '🏘️', defile: true, l: [
        'TTTTTTTTTTT',
        ',xx,xx,xx,T',
        ',xx,xx,xx,T',
        '::::::::::T',
        '::::::::::T',
        ',xx,xx,xx,T',
        ',xx,xx,xx,T',
        '::::::::::T',
        'TTTTTTTTTTT'] } ],
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
        'T.b.::::::T',
        '::::::TrT::',
        'T,....vcs.T',
        'T..,..TRT.T',
        'T.b.......T',
        'TTTTTTTTTTT'] },
      // Le marais (3.53, demandé par l'utilisateur : « une nouvelle zone, soigne le design ») : 3 écrans au sud-est, après le bosquet,
      // derrière une passerelle cassée que Bruno répare. Eau trouble, roseaux, pontons, lucioles et brume.
      { id: 'marais1', nom: 'L\'orée du marais', ico: '🪵', zone: 'marais', l: [
        'TTTTTTTTTTT',
        'Ty~~~y.,.yT',
        'T~~~~..xx.T',
        'T~~~~..xx.T',
        ':PPPP::::::',
        'T~~~~.....T',
        'Ty~~~y.,o.T',
        'TTy~~yy..TT',
        'TTTTTTTTTTT'] },
      { id: 'marais2', nom: 'Les roselières', ico: '🐸', zone: 'marais', l: [
        'TTTTTTTTTTT',
        'Ty.~~~~y..T',
        'T..~~~~~,.T',
        'T.~~~..~~.T',
        '::---::--::',
        'T~~~~=~~~~T',
        'T~~y...y~~T',
        'Ty~~.,.~~yT',
        'TTTTTTTTTTT'] },
      { id: 'marais3', nom: 'Le vieux saule', ico: '🌿', zone: 'marais', l: [
        'TTTTTTTTTTT',
        'Ty.xx.~~~yT',
        'T..xx.~~~~T',
        'T.,..y~~~~T',
        '::::::pp.CT',
        'T..,.y~~~~T',
        'Ty.o..~~~yT',
        'TTy..,.~yTT',
        'TTTTTTTTTTT'] } ]
  ];

  var MARCHE = { '.': 1, ',': 1, ':': 1, '=': 1, '-': 1, p: 1 };
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
    Object.assign({ type: 'chene', w: 2, h: 2 }, g(0, 2, 3, 2)),
    Object.assign({ type: 'rainette', w: 2, h: 2 }, g(3, 2, 7, 2)),
    Object.assign({ type: 'saule', w: 2, h: 2 }, g(5, 2, 3, 1)),
    Object.assign({ type: 'chalet', w: 2, h: 2 }, g(4, 0, 3, 2)),
    Object.assign({ type: 'refuge', w: 2, h: 2 }, g(5, 0, 8, 3))
  ];
  // Les parcelles du quartier : 3 maisons par écran en haut de la rue, 3 en bas (porte en bas de chaque maison), sur 3 écrans
  var NB_PARCELLES = 18;
  var PARCELLES = [];
  for (var k = 0; k < NB_PARCELLES; k++) {
    var rang = k % 9;
    PARCELLES.push(Object.assign({ p: k }, g(3 + Math.floor(rang / 3), 1, 1 + 3 * (rang % 3), k < 9 ? 1 : 5)));
  }
  PARCELLES.forEach(P => BATIMENTS.push({ type: 'parcelle', p: P.p, x: P.x, y: P.y, w: 2, h: 2 }));
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
  action(g(1, 1, 4, 1), { id: 'etabli' });
  [7, 8].forEach(x => action(g(3, 2, x, 3), { id: 'rainette' }));
  [3, 4].forEach(x => action(g(5, 2, x, 2), { id: 'saule' }));
  action(g(5, 2, 9, 4), { id: 'coffreM' });
  [3, 4].forEach(x => action(g(4, 0, x, 3), { id: 'chalet' }));
  [8, 9].forEach(x => action(g(5, 0, x, 4), { id: 'refuge' }));
  action(g(5, 0, 5, 1), { id: 'belvedere' });
  PARCELLES.forEach(P => { action({ x: P.x, y: P.y + 1 }, { id: 'parcelle', p: P.p }); action({ x: P.x + 1, y: P.y + 1 }, { id: 'parcelle', p: P.p }); });

  // ---------- Les habitants ----------
  var HABITANTS = {
    bubo: Object.assign({ nom: 'M. Bubo', titre: 'le maire', espece: 'hibou', ico: '🦉' }, g(1, 1, 8, 3)),
    sauge: Object.assign({ nom: 'Mme Sauge', titre: 'l\'herboriste', espece: 'herisson', ico: '🦔' }, g(1, 1, 3, 6)),
    bruno: Object.assign({ nom: 'Bruno', titre: 'le forgeron', espece: 'ours', ico: '🐻' }, g(1, 1, 7, 6)),
    tortue: Object.assign({ nom: 'Papi Tortue', titre: 'l\'ermite', espece: 'tortue', ico: '🐢' }, g(2, 0, 8, 2)),
    pipa: Object.assign({ nom: 'Pipa', titre: 'la marchande', espece: 'chat', ico: '🐱', etal: true }, g(1, 1, 7, 1)),
    rainette: Object.assign({ nom: 'Rainette', titre: 'la passeuse du marais', espece: 'grenouille', ico: '🐸' }, g(3, 2, 6, 3)),
    yeti: Object.assign({ nom: 'Le Yéti', titre: 'gardien du col', espece: 'yeti', ico: '❄️' }, g(3, 0, 1, 3)),
    gaspard: Object.assign({ nom: 'Gaspard', titre: 'le guide de montagne', espece: 'bouquetin', ico: '🐐' }, g(4, 0, 2, 3))
  };
  // Les champignons de Mme Sauge (on en garde 5 ; ils n'apparaissent que pendant la quête)
  var CHAMPIGNONS = [
    g(0, 0, 2, 2), g(0, 0, 8, 6), g(0, 1, 8, 3), g(0, 1, 2, 6), g(2, 1, 2, 2), g(2, 1, 7, 6), g(2, 1, 2, 5), g(0, 2, 6, 2), g(1, 2, 8, 6)
  ].map((p, k) => Object.assign({ id: 'ch' + k }, p));
  // Les lucioles du marais, pour la lanterne de Rainette (on en attrape 5 ; elles ne brillent que pendant la quête)
  var LUCIOLES = [
    g(3, 2, 6, 6), g(3, 2, 9, 2), g(4, 2, 2, 1), g(4, 2, 6, 7), g(4, 2, 9, 3), g(5, 2, 2, 1), g(5, 2, 4, 6), g(5, 2, 8, 4)
  ].map((p, k) => Object.assign({ id: 'lu' + k }, p));
  // Les jumelles de Gaspard, tombées dans la neige du sommet (visibles pendant sa quête)
  var JUMELLES = Object.assign({ id: 'ju' }, g(5, 0, 2, 6));

  // ---------- Les quêtes ----------
  var QUETES = {
    herbes: { nom: 'La soupe de Mme Sauge', ico: '🍄', qui: 'sauge', but: 5, recompense: { etoiles: 5 },
              resume: 'Rapporter 5 champignons de la forêt à Mme Sauge.' },
    lettre: { nom: 'Une lettre pour l\'ermite', ico: '✉️', qui: 'bubo', recompense: { deco: 'val-lanterne' },
              resume: 'Porter la lettre du maire à Papi Tortue, au nord-est, puis rapporter sa réponse.' },
    cle: { nom: 'La clé du forgeron', ico: '🔑', qui: 'bruno', recompense: { etoiles: 8 },
           resume: 'Retrouver la clé de Bruno, perdue dans le bosquet du sud-est.' },
    gardien: { nom: 'Le gardien de la crypte', ico: '⚔️', qui: 'tableau', recompense: { deco: 'val-banniere' },
               resume: 'Descendre dans la crypte et vaincre le boss du premier étage du Donjon.' },
    atelier: { nom: 'L\'établi de Bruno', ico: '🪵', qui: 'bruno', recompense: { etoiles: 3, atelier: true }, but: { bois: 3, pierre: 3 },
               resume: 'Rapporter 3 bois et 3 pierres à Bruno, le forgeron.' },
    // Le marais (3.53) : la passerelle ouvre la zone, puis Rainette, la passeuse, a besoin de lucioles
    passerelle: { nom: 'La passerelle du marais', ico: '🛶', qui: 'bruno', apres: 'atelier', recompense: { etoiles: 3, passerelle: true }, but: { bois: 8, pierre: 4 },
                  resume: 'Rapporter 8 bois et 4 pierres à Bruno pour réparer la passerelle du marais, à l\'est du bosquet.' },
    lucioles: { nom: 'La lanterne de Rainette', ico: '✨', qui: 'rainette', apres: 'passerelle', but: 5, recompense: { deco: 'val-lucioles', etoiles: 3 },
                resume: 'Attraper 5 lucioles dans le marais pour rallumer la lanterne de Rainette.' },
    // La montagne (3.54) : le Yéti garde le col et défie au Cieljo (une manche, sur la page du jeu), puis Gaspard a perdu ses jumelles
    yeti: { nom: 'Le défi du Yéti', ico: '❄️', qui: 'yeti', recompense: { etoiles: 8, col: true },
            resume: 'Battre le Yéti au Cieljo, en une manche, pour ouvrir le col de la montagne (au-delà de la cabane de l\'ermite).' },
    jumelles: { nom: 'Les jumelles de Gaspard', ico: '🔭', qui: 'gaspard', apres: 'yeti', recompense: { deco: 'val-edelweiss', etoiles: 3 },
                resume: 'Retrouver dans la neige du sommet les jumelles de Gaspard, le guide de montagne.' }
  };
  var ORDRE_QUETES = ['lettre', 'atelier', 'herbes', 'cle', 'passerelle', 'lucioles', 'yeti', 'jumelles', 'gardien'];
  // Déco de la Vallée (articles « souvenir: 'vallee' » de compagnon-commun.js) : vendue par Pipa, ou offerte par une quête
  var VENTE = [{ id: 'val-champi', prix: 15 }, { id: 'val-hibou', prix: 20 }, { id: 'val-carte', prix: 25 }];

  // ---------- Récolte et fabrication (phase 2, 3.50, demandée par l'utilisateur) ----------
  // On fonce dans un point de récolte (on marche dessus) : il disparaît jusqu'au lendemain (repousse une fois par jour, choix de l'utilisateur).
  // Les points sont les mêmes pour tous ; ce qu'on a ramassé est propre à chaque téléphone. Sac limité : SAC_MAX de chaque ressource.
  var RESSOURCES = {
    bois: { nom: 'Bois', ico: '🪵', base: 2, pouvoir: 'ronces', outil: 'hache' },
    pierre: { nom: 'Pierre', ico: '🪨', base: 2, pouvoir: 'force', outil: 'pioche' },
    plante: { nom: 'Plantes', ico: '🌿', base: 2, pouvoir: 'bond', outil: 'faucille' },
    cristal: { nom: 'Cristaux', ico: '💎', base: 1 }          // le Flair 👃 les fait scintiller sur la carte, même sous le brouillard
  };
  var ORDRE_RES = ['bois', 'pierre', 'plante', 'cristal'];
  var SAC_MAX = 20;
  // Points de récolte : [écran x, écran y, case x, case y, ressource, filon (il faut la pioche)]
  var RECOLTE = [
    [0, 0, 2, 1, 'bois'], [0, 0, 8, 2, 'bois'], [0, 0, 5, 6, 'bois'], [2, 1, 2, 1, 'bois'], [2, 1, 8, 5, 'bois'], [0, 2, 7, 3, 'bois'], [0, 2, 7, 7, 'bois'], [2, 0, 2, 6, 'bois'],
    [0, 1, 1, 1, 'pierre'], [0, 1, 7, 3, 'pierre'], [0, 1, 3, 5, 'pierre'], [1, 0, 2, 2, 'pierre'], [1, 0, 7, 5, 'pierre'], [1, 0, 8, 2, 'pierre'], [2, 0, 8, 5, 'pierre'],
    [1, 2, 1, 1, 'plante'], [1, 2, 7, 3, 'plante'], [1, 2, 4, 5, 'plante'], [1, 2, 9, 5, 'plante'], [2, 1, 2, 3, 'plante'], [0, 2, 2, 5, 'plante'], [0, 1, 8, 5, 'plante'], [2, 2, 2, 2, 'plante'],
    [2, 0, 9, 3, 'cristal'], [2, 2, 1, 7, 'cristal'], [1, 0, 1, 2, 'cristal', true], [2, 2, 9, 2, 'cristal', true],
    // Le marais (3.53) : bois flotté, joncs, galets et un cristal sur la berge du vieux saule
    [3, 2, 8, 1, 'bois'], [3, 2, 9, 6, 'plante'], [4, 2, 9, 1, 'plante'], [4, 2, 4, 6, 'bois'], [5, 2, 4, 5, 'pierre'], [5, 2, 5, 7, 'plante'], [5, 2, 1, 3, 'cristal'],
    // La montagne (3.54) : surtout de la pierre et des cristaux (un filon de plus), un edelweiss, du bois de sapin
    [3, 0, 8, 2, 'pierre'], [3, 0, 2, 5, 'cristal', true], [4, 0, 2, 6, 'plante'], [4, 0, 9, 6, 'bois'], [5, 0, 7, 6, 'cristal'], [5, 0, 6, 2, 'pierre']
  ].map((r, k) => Object.assign({ id: 'r' + k, res: r[4], filon: !!r[5] }, g(r[0], r[1], r[2], r[3])));
  var OUTILS = {
    hache: { nom: 'Hache', ico: '🪓', texte: '+1 bois à chaque récolte' },
    faucille: { nom: 'Faucille', ico: '🌾', texte: '+1 plante à chaque récolte' },
    pioche: { nom: 'Pioche', ico: '⛏️', texte: '+1 pierre, et les filons de cristal' }
  };
  // Fioles de la Vallée : mêmes identifiants que les fioles du Donjon (DJD.FIOLES). On en emporte DONJON_MAX au plus par donjon.
  var FIOLES = {
    soin: { nom: 'Fiole de soin', ico: '💖', texte: 'Soigne 15 PV' },
    garde: { nom: 'Fiole de pierre', ico: '🛡️', texte: '+12 armure' },
    force: { nom: 'Fiole de force', ico: '💪', texte: '+2 Force pour un combat' }
  };
  var BESACE_MAX = 6, DONJON_MAX = 2;
  // Recettes : où (établi devant ma maison, hutte de Mme Sauge, forge de Bruno), quoi, et ce que ça coûte
  var LIEUX_FAB = {
    etabli: { nom: 'L\'établi', ico: '🪚', qui: null, texte: 'La déco de la maison, faite de tes mains. On ne la trouve nulle part ailleurs.' },
    hutte: { nom: 'La hutte de Mme Sauge', ico: '🌿', qui: 'sauge', texte: 'Des fioles pour le Donjon, gardées dans ta besace (' + BESACE_MAX + ' au plus). Tu en emportes ' + DONJON_MAX + ' par donjon.' },
    forge: { nom: 'La forge de Bruno', ico: '⚒️', qui: 'bruno', texte: 'Des outils pour mieux récolter. Une fois forgés, ils sont à toi pour toujours.' }
  };
  var RECETTES = [
    { id: 'fab-tabouret', ou: 'etabli', type: 'deco', cout: { bois: 3 } },
    { id: 'fab-bouquet', ou: 'etabli', type: 'deco', cout: { plante: 4 } },
    { id: 'fab-nichoir', ou: 'etabli', type: 'deco', cout: { bois: 4, plante: 1 } },
    { id: 'fab-statuette', ou: 'etabli', type: 'deco', cout: { pierre: 5 } },
    { id: 'fab-muret', ou: 'etabli', type: 'deco', cout: { pierre: 3, plante: 2 } },
    { id: 'fab-lampe', ou: 'etabli', type: 'deco', cout: { bois: 2, cristal: 1 } },
    { id: 'fab-vitrine', ou: 'etabli', type: 'deco', cout: { bois: 3, cristal: 2 } },
    { id: 'fab-bassin', ou: 'etabli', type: 'deco', cout: { pierre: 4, plante: 2, cristal: 1 } },
    { id: 'soin', ou: 'hutte', type: 'fiole', cout: { plante: 3 } },
    { id: 'garde', ou: 'hutte', type: 'fiole', cout: { plante: 2, pierre: 2 } },
    { id: 'force', ou: 'hutte', type: 'fiole', cout: { plante: 2, cristal: 1 } },
    { id: 'hache', ou: 'forge', type: 'outil', cout: { bois: 4, pierre: 3 } },
    { id: 'faucille', ou: 'forge', type: 'outil', cout: { bois: 2, pierre: 4 } },
    { id: 'pioche', ou: 'forge', type: 'outil', cout: { bois: 3, pierre: 5 } }
  ];

  // ---------- Hasard fixe (variations du dessin) ----------
  function hash(x, y, k) {
    var h = (GRAINE ^ (x * 374761393) ^ (y * 668265263) ^ ((k || 0) * 2147483647)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  // ---------- Lecture de la carte ----------
  function tuile(x, y) {
    if (x < 0 || y < 0 || x >= LARG || y >= HAUT) return null;
    var E = ECRANS[Math.floor(y / H)][Math.floor(x / W)];
    return E ? E.l[y % H][x % W] : null;   // pas d'écran à cet endroit (hors du monde)
  }
  function ecranDe(x, y) { return { ex: Math.floor(x / W), ey: Math.floor(y / H) }; }
  function ecran(x, y) { var c = ecranDe(x, y); return ECRANS[c.ey] && ECRANS[c.ey][c.ex] || null; }
  function habitantEn(x, y) {
    for (var id in HABITANTS) { var h = HABITANTS[id]; if (h.x === x && h.y === y && !h.etal) return id; }
    return null;
  }
  function ouvert(e, x, y) { return !!(e.ouverts && e.ouverts[x + ',' + y]); }
  function passerelleOk(e) { return !!(e.quetes && e.quetes.passerelle && e.quetes.passerelle.etat === 'finie'); }
  function colOuvert(e) { return !!(e.quetes && e.quetes.yeti && e.quetes.yeti.etat === 'finie'); }
  // Une zone fermée par un passage : le marais (passerelle), la montagne (le col du Yéti)
  function zoneOuverte(e, E) { return !E || !E.zone || (E.zone === 'marais' ? passerelleOk(e) : E.zone === 'montagne' ? colOuvert(e) : true); }
  // Une case où l'on peut marcher (obstacle déjà ouvert compris)
  function libre(e, x, y) {
    var t = tuile(x, y);
    if (t === null) return false;
    if (habitantEn(x, y)) return false;
    if (t === 'P') return passerelleOk(e);
    if (t === 'G') return colOuvert(e);
    if (OBSTACLES[t]) return ouvert(e, x, y);
    return !!MARCHE[t];
  }

  // ---------- État d'un joueur ----------
  function nouvelEtat() {
    var p = g(1, 1, 2, 3);
    var e = { v: 1, lv: LARG, x: p.x, y: p.y, dir: 'b', vu: '', ouverts: {}, pris: {}, quetes: {}, coffre: false, coffreM: false, cle: false, pas: 0,
              sac: { bois: 0, pierre: 0, plante: 0, cristal: 0 }, recolte: { j: '', pris: {} }, outils: {}, besace: {} };
    reveler(e);
    return e;
  }
  // Une sauvegarde vient du téléphone (ou d'un fichier) : on la vérifie
  function charger(s) {
    var e = nouvelEtat();
    if (!s || typeof s !== 'object' || s.v !== 1) return e;
    ['ouverts', 'pris'].forEach(k => { if (s[k] && typeof s[k] === 'object') e[k] = Object.assign({}, s[k]); });
    if (s.quetes && typeof s.quetes === 'object') Object.keys(QUETES).forEach(id => { if (s.quetes[id] && typeof s.quetes[id] === 'object') e.quetes[id] = Object.assign({}, s.quetes[id]); });
    var au = ecran(s.x | 0, s.y | 0), audela = au && au.zone && (s.x | 0) % W > 0;   // au-delà de la passerelle ou du col
    if (libre(e, s.x | 0, s.y | 0) && (!audela || zoneOuverte(e, au))) { e.x = s.x | 0; e.y = s.y | 0; }
    e.dir = ['h', 'b', 'g', 'd'].indexOf(s.dir) >= 0 ? s.dir : 'b';
    e.vu = typeof s.vu === 'string' && /^[0-9a-f]*$/.test(s.vu) ? s.vu : '';
    if (e.vu && (s.lv | 0 || 33) !== LARG) e.vu = elargir(e.vu, s.lv | 0 || 33);   // sauvegarde d'avant le quartier (3 écrans de large)
    e.coffre = !!s.coffre; e.coffreM = !!s.coffreM; e.cle = !!s.cle; e.pas = s.pas | 0;
    if (s.sac && typeof s.sac === 'object') ORDRE_RES.forEach(r => { e.sac[r] = Math.max(0, Math.min(SAC_MAX, s.sac[r] | 0)); });
    if (s.recolte && typeof s.recolte === 'object' && typeof s.recolte.j === 'string') {
      e.recolte.j = s.recolte.j;
      Object.keys(s.recolte.pris || {}).forEach(id => { if (RECOLTE.some(r => r.id === id)) e.recolte.pris[id] = 1; });
    }
    if (s.outils && typeof s.outils === 'object') Object.keys(OUTILS).forEach(o => { if (s.outils[o]) e.outils[o] = 1; });
    if (s.besace && typeof s.besace === 'object') {
      var n = 0;
      Object.keys(FIOLES).forEach(f => { var k = Math.max(0, Math.min(BESACE_MAX - n, s.besace[f] | 0)); if (k) { e.besace[f] = k; n += k; } });
    }
    reveler(e);
    return e;
  }

  // ---------- Brouillard : une case par bit, en hexadécimal (33 × 27 cases = 223 signes) ----------
  function bits(e) {
    var n = LARG * HAUT, b = new Uint8Array(Math.ceil(n / 4)), s = e.vu || '';
    for (var i = 0; i < b.length && i < s.length; i++) b[i] = parseInt(s[i], 16) || 0;
    return b;
  }
  // Le brouillard d'une carte plus étroite (ancienne sauvegarde) recopié dans la carte actuelle
  function elargir(vu, largAvant) {
    var b = new Uint8Array(Math.ceil(LARG * HAUT / 4));
    for (var y = 0; y < HAUT; y++) for (var x = 0; x < largAvant && x < LARG; x++) {
      var i = y * largAvant + x, v = parseInt(vu[i >> 2] || '0', 16) || 0;
      if (v & (1 << (i & 3))) { var j = y * LARG + x; b[j >> 2] |= 1 << (j & 3); }
    }
    return Array.from(b, v => v.toString(16)).join('');
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
    for (var y = 0; y < HAUT; y++) for (var x = 0; x < LARG; x++) { if (tuile(x, y) === null) continue; t++; if (estVu(e, x, y, b)) n++; }
    return n / t;
  }

  // ---------- Quêtes ----------
  function etatQuete(e, id) { var q = e.quetes[id]; return q ? q.etat : 'dispo'; }
  function champignonVisible(e, c) { return etatQuete(e, 'herbes') === 'cours' && !e.pris[c.id]; }
  function lucioleVisible(e, c) { return etatQuete(e, 'lucioles') === 'cours' && !e.pris[c.id]; }
  function jumellesVisibles(e) { return etatQuete(e, 'jumelles') === 'cours' && !e.pris.ju; }
  // Une quête qu'on peut déjà prendre (certaines viennent après une autre)
  function prenable(e, id) { var Q = QUETES[id]; return !!Q && etatQuete(e, id) === 'dispo' && (!Q.apres || etatQuete(e, Q.apres) === 'finie'); }
  // ctx.bossTotal : nombre de boss du Donjon vaincus jusqu'ici (donjon-stats.boss)
  function verifier(e, ctx) {
    var q = e.quetes, change = false;
    if (q.herbes && q.herbes.etat === 'cours' && (q.herbes.n | 0) >= QUETES.herbes.but) { q.herbes.etat = 'rendre'; change = true; }
    if (q.cle && q.cle.etat === 'cours' && e.cle) { q.cle.etat = 'rendre'; change = true; }
    if (q.gardien && q.gardien.etat === 'cours' && ctx && (ctx.bossTotal | 0) > (q.gardien.boss | 0)) { q.gardien.etat = 'rendre'; change = true; }
    if (q.lucioles && q.lucioles.etat === 'cours' && (q.lucioles.n | 0) >= QUETES.lucioles.but) { q.lucioles.etat = 'rendre'; change = true; }
    ['atelier', 'passerelle'].forEach(id => {
      if (!q[id] || (q[id].etat !== 'cours' && q[id].etat !== 'rendre')) return;
      var voulu = assezPour(e, QUETES[id].but) ? 'rendre' : 'cours';
      if (q[id].etat !== voulu) { q[id].etat = voulu; change = true; }
    });
    return change;
  }
  function accepter(e, id, ctx) {
    if (!prenable(e, id)) return false;
    var q = { etat: 'cours', t: Date.now() };
    if (id === 'herbes' || id === 'lucioles') q.n = 0;
    if (id === 'lettre') q.etape = 'porter';
    if (id === 'gardien') q.boss = ctx && ctx.bossTotal | 0;
    e.quetes[id] = q;
    verifier(e, ctx);
    return true;
  }
  function rendre(e, id) {
    if (etatQuete(e, id) !== 'rendre') return null;
    if (id === 'atelier' || id === 'passerelle') payer(e, QUETES[id].but);
    e.quetes[id].etat = 'finie'; e.quetes[id].fin = Date.now();
    return Object.assign({ quete: id }, QUETES[id].recompense);
  }
  // Quête dont un habitant attend quelque chose : « ! » (à prendre) ou « ? » (à rendre) au-dessus de sa tête
  function marque(e, qui, ctx) {
    var m = '';
    Object.keys(QUETES).forEach(id => {
      var Q = QUETES[id], s = etatQuete(e, id);
      if (Q.qui === qui && s === 'rendre') m = '?';
      else if (Q.qui === qui && prenable(e, id) && !m) m = '!';
    });
    if (qui === 'tortue' && e.quetes.lettre && e.quetes.lettre.etat === 'cours' && e.quetes.lettre.etape === 'porter') m = '?';
    if (qui === 'yeti' && etatQuete(e, 'yeti') === 'cours') m = '!';   // il attend sa revanche
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
    if (s === 'dispo' && !prenable(e, id)) return 'Après « ' + QUETES[QUETES[id].apres].nom + ' »';
    if (s !== 'cours') return QUETES[id].resume;
    if (id === 'herbes') return 'Champignons : ' + (q.n | 0) + ' / ' + QUETES.herbes.but;
    if (id === 'lettre') return 'Porte la lettre à Papi Tortue (nord-est)';
    if (id === 'cle') return 'Cherche la clé dans le bosquet (sud-est)';
    if (id === 'gardien') return 'Bats le boss du 1er étage de la crypte';
    if (id === 'atelier') return 'Pour Bruno : bois ' + Math.min(3, e.sac.bois) + '/3, pierres ' + Math.min(3, e.sac.pierre) + '/3';
    if (id === 'passerelle') return 'Pour la passerelle : bois ' + Math.min(8, e.sac.bois) + '/8, pierres ' + Math.min(4, e.sac.pierre) + '/4';
    if (id === 'lucioles') return 'Lucioles : ' + (q.n | 0) + ' / ' + QUETES.lucioles.but;
    if (id === 'yeti') return 'Bats le Yéti au Cieljo, au col';
    if (id === 'jumelles') return 'Cherche les jumelles au sommet';
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
    if (id === 'atelier' || id === 'passerelle') {
      var but = QUETES[id].but, res = e.sac.bois < but.bois ? 'bois' : 'pierre', jour = (ctx && ctx.jour) || jourDe();
      var p = RECOLTE.filter(k => k.res === res && !k.filon && !prisAujourdhui(e, k, jour) && pointOuvert(e, k)).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
      return p || HABITANTS.bruno;
    }
    if (id === 'herbes') {
      var c = CHAMPIGNONS.filter(k => !e.pris[k.id]).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
      return c || null;
    }
    if (id === 'lucioles') return LUCIOLES.filter(k => !e.pris[k.id]).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0] || null;
    if (id === 'yeti') return HABITANTS.yeti;
    if (id === 'jumelles') return JUMELLES;
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
    if (ACTIONS[k]) return { action: ACTIONS[k].id, x: nx, y: ny, p: ACTIONS[k].p };
    if (t === 'P' && !passerelleOk(e)) return { action: 'passerelle', x: nx, y: ny };
    if (t === 'G' && !colOuvert(e)) return { action: 'yeti', x: nx, y: ny };
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
    if (JUMELLES.x === nx && JUMELLES.y === ny && jumellesVisibles(e)) {
      e.pris.ju = 1; e.quetes.jumelles.etat = 'rendre';
      r.ramasse = 'jumelles';
    }
    var lu = LUCIOLES.find(c => c.x === nx && c.y === ny && lucioleVisible(e, c));
    if (lu) {
      e.pris[lu.id] = 1; e.quetes.lucioles.n = (e.quetes.lucioles.n | 0) + 1;
      r.ramasse = 'luciole'; r.n = e.quetes.lucioles.n;
      verifier(e, ctx);
    }
    var pt = pointEn(nx, ny);
    if (pt) Object.assign(r, recolter(e, pt, ctx));
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
        'Quand j\'étais jeune, la crypte n\'avait qu\'un étage. Enfin… je crois.',
        'Au bout du bosquet commence le marais. Brumeux, mais si joli quand les lucioles s\'allument.',
        'Derrière ma cabane, le chemin monte au col. Le Yéti y garde le passage… il adore les cartes, ce grand sentimental.'][e.pas % 5], boutons: [ok] };
    }
    if (qui === 'bruno') {
      s = etatQuete(e, 'cle');
      var sa = etatQuete(e, 'atelier'), sp = etatQuete(e, 'passerelle');
      var manque = but => [e.sac.bois < but.bois ? (but.bois - e.sac.bois) + ' bois' : '', e.sac.pierre < but.pierre ? (but.pierre - e.sac.pierre) + ' pierre' + (but.pierre - e.sac.pierre > 1 ? 's' : '') : ''].filter(Boolean).join(' et ');
      // D'abord ce qu'on lui rapporte, puis ce qu'il demande, puis où l'on en est
      if (s === 'rendre') return { qui: qui, texte: 'Ma clé ! Grrr… de joie ! Je vais pouvoir rallumer la forge.' + (sa === 'finie' ? ' Reviens m\'y voir : je te forgerai des outils.' : '') + ' Voilà pour toi.', boutons: [{ t: '🔑 Rendre la clé', a: 'rendre:cle', principal: true }] };
      if (sa === 'rendre') return { qui: qui, texte: 'Trois bûches, trois pierres… Parfait ! Grrr, voilà du solide. Je t\'ai remis en état le vieil établi, devant ta maison : tu pourras y fabriquer de la déco. Et Mme Sauge t\'apprendra ses fioles, j\'en suis sûr.',
                                   boutons: [{ t: '🪵 Donner le bois et les pierres', a: 'rendre:atelier', principal: true }] };
      if (sp === 'rendre') return { qui: qui, texte: 'Huit bûches, quatre pierres… Grrr, du costaud ! Je file au marais avec mon marteau. (Bang ! Bang ! Bang !) Voilà : la passerelle tiendrait sous un ours. Rainette t\'attend de l\'autre côté.',
                                    boutons: [{ t: '🛶 Donner le bois et les pierres', a: 'rendre:passerelle', principal: true }] };
      if (sa === 'dispo') return { qui: qui, texte: 'Grrr… Bonjour. Tu vois le vieil établi devant ta maison ? Il ne tient plus debout. Rapporte-moi 3 bois et 3 pierres, je te le répare. Du bois mort dans les forêts, des pierres près du ruisseau et de la crypte. Tout repousse chaque jour !',
                                   boutons: [{ t: '🪵 Je m\'en occupe', a: 'accepter:atelier', principal: true }, plusTard] };
      if (s === 'dispo') return { qui: qui, texte: 'Grrr… Bonjour. J\'ai perdu la clé de mon atelier en cueillant des mûres dans le bosquet, au sud-est. Depuis, les ronces et les rochers ont tout recouvert… ' + (ctx && ctx.pouvoir ? 'Ton compagnon saurait passer, lui ?' : 'Tu veux bien chercher ?'),
                                  boutons: [{ t: '🔑 Je la cherche', a: 'accepter:cle', principal: true }, plusTard] };
      if (prenable(e, 'passerelle')) return { qui: qui, texte: 'Grrr… Tu as vu la vieille passerelle du marais, au bout du bosquet ? L\'orage l\'a mise en miettes, et Rainette, la passeuse, est coincée de l\'autre côté. Rapporte-moi 8 bois et 4 pierres, et je te la remets d\'aplomb.',
                                              boutons: [{ t: '🛶 Je rapporte tout ça', a: 'accepter:passerelle', principal: true }, plusTard] };
      if (s === 'cours') return { qui: qui, texte: ctx && ctx.pouvoir ? 'Le bosquet est au sud-est du village. Pour passer un obstacle, fonce dedans : ' + tu + ' s\'en sert de son pouvoir (' + POUVOIRS[ctx.pouvoir].ico + ' ' + POUVOIRS[ctx.pouvoir].nom + ').'
                                                         : 'Papi Tortue sait tout ce qui se passe dans la forêt. Demande-lui !', boutons: [ok] };
      if (sa === 'cours') return { qui: qui, texte: 'Il me faut encore ' + manque(QUETES.atelier.but) + ' pour l\'établi. Fonce dans le bois mort et les cailloux pour les ramasser.', boutons: [ok] };
      if (sp === 'cours') return { qui: qui, texte: 'Pour la passerelle, il me faut encore ' + manque(QUETES.passerelle.but) + '. Ton sac en garde ' + SAC_MAX + ' de chaque, et tout repousse demain si tu manques de bois.', boutons: [ok] };
      return { qui: qui, texte: 'Ding ! Dong ! La forge tourne à nouveau. Fonce dans l\'enclume si tu veux un outil, l\'ami !', boutons: [ok] };
    }
    if (qui === 'yeti') {
      s = etatQuete(e, 'yeti');
      if (s === 'dispo') return { qui: qui, texte: 'GRRROUH ! Halte, petit voyageur. Ce col est à moi. Qui veut passer doit me battre au Cieljo : une seule manche, le plus petit total gagne. Tu oses ?',
                                  boutons: [{ t: '❄️ Relever le défi', a: 'defi:yeti', principal: true }, plusTard] };
      if (s === 'cours') return { qui: qui, texte: 'Encore toi ? Hou hou ! J\'adore les revanches. Une manche, comme la dernière fois ?',
                                  boutons: [{ t: '❄️ Revanche !', a: 'defi:yeti', principal: true }, plusTard] };
      return { qui: qui, texte: [
        'Le col est à toi, champion. Mais un jour, je veux ma revanche !',
        'Tu sais pourquoi je garde ce col ? Pour avoir de la visite. Personne ne monte jamais jouer aux cartes…',
        'Brrr… non, je n\'ai pas froid. C\'est mon rire.'][e.pas % 3], boutons: [ok] };
    }
    if (qui === 'gaspard') {
      s = etatQuete(e, 'jumelles');
      if (s === 'dispo') return { qui: qui, texte: 'Bêêh, bonjour ! Gaspard, guide de montagne. Tu as battu le Yéti ? Chapeau ! Dis, le vent du sommet m\'a arraché mes jumelles hier. Sans elles, le belvédère ne sert à rien. Tu me les retrouves ? Elles sont quelque part dans la neige, là-haut.',
                                  boutons: [{ t: '🔭 Je monte les chercher', a: 'accepter:jumelles', principal: true }, plusTard] };
      if (s === 'cours') return { qui: qui, texte: 'Elles ont dû glisser du côté ouest du sommet, en contrebas du belvédère. Regarde bien dans la neige !', boutons: [ok] };
      if (s === 'rendre') return { qui: qui, texte: 'Mes jumelles ! Bêêh, merci ! Tiens, un edelweiss de mon jardin, pour ta maison. Et garde les jumelles un moment : file au belvédère, la vue est à couper le souffle.',
                                   boutons: [{ t: '🔭 Rendre les jumelles', a: 'rendre:jumelles', principal: true }] };
      return { qui: qui, texte: [
        'Le lac est si clair qu\'on y voit les nuages deux fois.',
        'Mes chèvres connaissent chaque caillou de ces pentes. Moi aussi, presque.',
        'Au belvédère, cherche la crypte : par beau temps, on voit même fumer la forge de Bruno.'][e.pas % 3], boutons: [ok] };
    }
    if (qui === 'rainette') {
      s = etatQuete(e, 'lucioles');
      if (!passerelleOk(e)) {   // on lui parle par-dessus l'eau, depuis la passerelle cassée
        var sp2 = etatQuete(e, 'passerelle');
        return { qui: qui, texte: sp2 === 'rendre' ? 'Coâ ! Tu as tout le bois qu\'il faut ? Vite, porte-le à Bruno, au village !'
          : sp2 === 'cours' ? 'Coâ ! Bruno va la réparer ? Rapporte-lui son bois et ses pierres, je t\'attends de ce côté-ci, promis !'
          : 'Coâ ! Ohé, de l\'autre côté ! Ma passerelle s\'est effondrée pendant l\'orage, et me voilà coincée… Bruno, le forgeron du village, saurait la réparer.' + (etatQuete(e, 'atelier') !== 'finie' ? ' Mais il a d\'abord son vieil établi à remettre debout.' : ''), boutons: [ok] };
      }
      if (s === 'dispo') return { qui: qui, texte: 'Coâ ! Merci, merci ! Je suis Rainette, la passeuse du marais. Dis, ma lanterne s\'est éteinte pendant l\'orage… Sans elle, les voyageurs se perdent dans la brume. Les lucioles des roseaux la rallumeraient ! Tu m\'en attrapes 5 ?',
                                  boutons: [{ t: '✨ J\'y vais !', a: 'accepter:lucioles', principal: true }, plusTard] };
      if (s === 'cours') return { qui: qui, texte: 'Encore ' + (QUETES.lucioles.but - (e.quetes.lucioles.n | 0)) + ' luciole' + (QUETES.lucioles.but - (e.quetes.lucioles.n | 0) > 1 ? 's' : '') + ' ! Elles dansent dans les trois coins du marais : près des roseaux, sur les îlots, et jusqu\'au vieux saule.', boutons: [ok] };
      if (s === 'rendre') return { qui: qui, texte: 'Oh ! Cinq lucioles… Regarde comme elles brillent dans la lanterne ! Tiens, garde ce petit bocal : quelques-unes ont voulu te suivre.' + (nom ? ' Elles éclaireront la maison de ' + nom + '.' : ''),
                                   boutons: [{ t: '✨ Donner les lucioles', a: 'rendre:lucioles', principal: true }] };
      return { qui: qui, texte: [
        'Coâ ! Ma lanterne brille de nouveau. Plus personne ne se perd dans la brume.',
        'Tu as vu le vieux saule, tout à l\'est ? On dit qu\'il pleure parce qu\'il se souvient de tout.',
        'Il y a un coffre sur l\'îlot, au bout du gué de pierres. Personne n\'ose y aller, à cause des grenouilles taquines… dont moi !'][e.pas % 3], boutons: [ok] };
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
                                         prendre: etatQuete(e, id) === 'dispo' && !prenable(e, id) ? 'Après « ' + QUETES[QUETES[id].apres].nom + ' »'
                                           : QUETES[id].qui === 'tableau' ? 'Sur le tableau de quêtes, au village' : 'Demande à ' + HABITANTS[QUETES[id].qui].nom + ', ' + HABITANTS[QUETES[id].qui].titre }));
    return t;
  }
  // Une action choisie dans une conversation. Renvoie { recompense } quand il y en a une.
  function agir(e, a, ctx) {
    var m = /^(accepter|rendre):(\w+)$/.exec(a || '');
    if (m && m[1] === 'accepter') return { accepte: accepter(e, m[2], ctx), quete: m[2] };
    if (m && m[1] === 'rendre') return { recompense: rendre(e, m[2]) };
    if (a === 'defi:yeti' && !colOuvert(e)) { if (etatQuete(e, 'yeti') === 'dispo') accepter(e, 'yeti', ctx); return { defi: 'yeti' }; }
    if (a === 'reponse' && e.quetes.lettre && e.quetes.lettre.etape === 'porter') { e.quetes.lettre.etape = 'reponse'; e.quetes.lettre.etat = 'rendre'; return { reponse: true }; }
    return {};
  }
  // Le défi d'un boss gagné sur la page du jeu (le Yéti, au Cieljo) : la quête est finie, le passage s'ouvre
  function gagnerDefi(e, id) {
    if (id !== 'yeti' || colOuvert(e)) return null;
    e.quetes.yeti = { etat: 'finie', t: (e.quetes.yeti && e.quetes.yeti.t) || Date.now(), fin: Date.now() };
    return Object.assign({ quete: id }, QUETES.yeti.recompense);
  }
  // Le belvédère du sommet : avec les jumelles de Gaspard, on voit la montagne et tout le nord de la Vallée
  function belvedere(e) {
    if (etatQuete(e, 'jumelles') !== 'finie') return { texte: 'Quelle vue… mais tout est si loin. Avec des jumelles, on verrait toute la Vallée. Gaspard en avait, je crois.' };
    var b = bits(e), n = 0;
    for (var y = 0; y < 2 * H; y++) for (var x = 2 * W; x < LARG; x++) {
      if (!tuile(x, y)) continue;
      var i = y * LARG + x;
      if (!(b[i >> 2] & (1 << (i & 3)))) { b[i >> 2] |= 1 << (i & 3); n++; }
    }
    e.vu = Array.from(b, v => v.toString(16)).join('');
    return { panorama: n, texte: n ? 'Tu règles les jumelles de Gaspard… La crypte, le quartier, les alpages, le col : tout le nord de la Vallée se dessine sur ta carte !'
                                   : 'Tu règles les jumelles : le village fume au loin, et les amis bavardent dans le quartier.' };
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
    if (ou === 'coffreM') {   // le coffre de l'îlot du marais, au bout du gué de pierres
      if (e.coffreM) return { texte: 'Le coffre est vide. Une grenouille y a laissé un nénuphar.' };
      e.coffreM = true;
      var k = Math.min(SAC_MAX - e.sac.cristal, 2);
      e.sac.cristal += k;
      return { etoiles: 4, cristal: k, texte: 'Le coffre est couvert de mousse… Dedans : 4 ⭐' + (k ? ' et ' + k + (k > 1 ? ' cristaux' : ' cristal') + ' 💎 pour ton sac' : '') + ' !' };
    }
    if (ou === 'chene') {
      if (sansPouvoir && !e.cle && etatQuete(e, 'cle') === 'cours') { e.cle = true; verifier(e, ctx); return { cle: true, texte: 'Dans le creux du vieux chêne, entre des noisettes et un bouton doré : une grosse clé en fer forgé !' }; }
      return { texte: 'Un chêne immense, plus vieux que le village. On dit qu\'il a vu naître la Vallée.' };
    }
    return {};
  }

  // ---------- Le quartier des amis (3.51) ----------
  // La parcelle « naturelle » d'un ami : tirée de son identifiant de personne (Joueur.id), donc la même sur tous les téléphones
  function parcelleDe(j) {
    var h = 2166136261;
    for (var i = 0; i < String(j).length; i++) { h ^= String(j).charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h % NB_PARCELLES;
  }
  // Le quartier défile : est-on dedans ?
  function defile(x, y) { var E = ecran(x, y); return !!(E && E.defile); }
  // voisins = { idDeLaPersonne: { p: parcelle, nom, couleur, cp, vu } }, propre à ce téléphone (`vallee-voisins`, dans la sauvegarde).
  // Un ami connecté qui a un compagnon reçoit une parcelle libre et la garde ; quand tout est pris, l'ami absent depuis le plus longtemps
  // laisse sa place. presents = [{ j, pseudo, couleur, cp }].
  function placerVoisins(voisins, presents, t) {
    var v = Object.assign({}, voisins || {}), change = false, ici = {};
    (presents || []).forEach(m => {
      if (!m || !m.j || !m.cp) return;
      ici[m.j] = 1;
      var a = v[m.j];
      if (a) {
        if (a.nom !== m.pseudo || a.couleur !== m.couleur || JSON.stringify(a.cp) !== JSON.stringify(m.cp)) change = true;
        v[m.j] = Object.assign({}, a, { nom: m.pseudo, couleur: m.couleur, cp: m.cp, vu: t });
        return;
      }
      var prises = {}; Object.keys(v).forEach(j => { prises[v[j].p] = j; });
      // Sa parcelle se tire de son identifiant : la même chez tous les amis (sauf si deux identifiants tombent au même endroit)
      var p = -1, depart = parcelleDe(m.j);
      for (var k = 0; k < NB_PARCELLES; k++) { var q = (depart + k) % NB_PARCELLES; if (!(q in prises)) { p = q; break; } }
      if (p < 0) {   // tout est pris : l'absent le plus ancien déménage
        var vieux = Object.keys(v).filter(j => !ici[j] && !(presents || []).some(x => x && x.j === j)).sort((a, b) => (v[a].vu || 0) - (v[b].vu || 0))[0];
        if (!vieux) return;
        p = v[vieux].p; delete v[vieux];
      }
      v[m.j] = { p: p, nom: m.pseudo, couleur: m.couleur, cp: m.cp, vu: t };
      change = true;
    });
    return { voisins: v, change: change };
  }
  // Une sauvegarde de voisins vient du téléphone : on la vérifie
  function nettoyerVoisins(v) {
    var r = {}, prises = {};
    Object.keys(v && typeof v === 'object' ? v : {}).forEach(j => {
      var a = v[j], p = a && a.p | 0;
      if (!a || !/^[a-z0-9]{4,40}$/i.test(j) || p < 0 || p >= NB_PARCELLES || prises[p]) return;
      prises[p] = 1;
      r[j] = { p: p, nom: String(a.nom || '').slice(0, 20), couleur: /^#[0-9a-f]{6}$/i.test(a.couleur) ? a.couleur : '#8d6e63', cp: a.cp && typeof a.cp === 'object' ? a.cp : null, vu: +a.vu || 0 };
    });
    return r;
  }
  // Ce qu'il y a sur chaque parcelle : [{ j, nom, couleur, cp, present }] ou null (libre)
  function parcelles(voisins, presentsJ) {
    var l = []; for (var k = 0; k < NB_PARCELLES; k++) l.push(null);
    Object.keys(voisins || {}).forEach(j => { var a = voisins[j]; if (a.p >= 0 && a.p < NB_PARCELLES) l[a.p] = { j: j, nom: a.nom, couleur: a.couleur, cp: a.cp, present: !!(presentsJ && presentsJ[j]) }; });
    return l;
  }

  // ---------- Récolte ----------
  // Le jour (heure du téléphone) : les points repoussent au changement de jour
  function jourDe(t) {
    var d = new Date(t || Date.now());
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function pointEn(x, y) { return RECOLTE.find(p => p.x === x && p.y === y) || null; }
  function prisAujourdhui(e, p, jour) { return e.recolte.j === (jour || jourDe()) && !!e.recolte.pris[p.id]; }
  function pointVisible(e, p, ctx) { return !prisAujourdhui(e, p, ctx && ctx.jour); }
  // Un point qu'on peut atteindre (ceux du marais attendent la passerelle)
  function pointOuvert(e, p) { return zoneOuverte(e, ecran(p.x, p.y)); }
  // Combien un point donne : la base, ×2 avec le pouvoir qui va avec, +1 avec l'outil
  function gain(e, res, ctx) {
    var R = RESSOURCES[res], n = R.base;
    if (R.pouvoir && ctx && ctx.pouvoir === R.pouvoir) n *= 2;
    if (R.outil && e.outils[R.outil]) n += 1;
    return n;
  }
  function recolter(e, p, ctx) {
    var jour = (ctx && ctx.jour) || jourDe();
    if (e.recolte.j !== jour) e.recolte = { j: jour, pris: {} };
    if (e.recolte.pris[p.id]) return {};
    if (p.filon && !e.outils.pioche) return { filon: p.id };
    if (e.sac[p.res] >= SAC_MAX) return { sacPlein: p.res };
    var n = Math.min(SAC_MAX - e.sac[p.res], gain(e, p.res, ctx)), r = { recolte: p.res, n: n };
    e.sac[p.res] += n; e.recolte.pris[p.id] = 1;
    if (p.filon) { var k = Math.min(SAC_MAX - e.sac.pierre, 1); e.sac.pierre += k; r.pierre = k; }
    verifier(e, ctx);
    return r;
  }
  function assezPour(e, cout) { return Object.keys(cout).every(r => (e.sac[r] | 0) >= cout[r]); }
  function payer(e, cout) { Object.keys(cout).forEach(r => { e.sac[r] = Math.max(0, (e.sac[r] | 0) - cout[r]); }); }
  function besaceTotal(e) { return Object.keys(e.besace).reduce((s, f) => s + (e.besace[f] | 0), 0); }

  // ---------- Fabrication ----------
  // ctx = { compagnon: true/false, possede: { idDeco: 1 } (les objets de la maison) }
  function ouvertFab(e, ou) {
    if (etatQuete(e, 'atelier') !== 'finie') return false;
    if (ou === 'forge') return etatQuete(e, 'cle') === 'finie';
    return true;
  }
  function recette(id) { return RECETTES.find(r => r.id === id) || null; }
  // Peut-on la fabriquer ? { ok, raison, fait (déjà fait : déco ou outil) }
  function etatRecette(e, r, ctx) {
    if (!ouvertFab(e, r.ou)) return { ok: false, raison: 'Pas encore ouvert' };
    if (r.type === 'deco') {
      if (ctx && ctx.possede && ctx.possede[r.id]) return { ok: false, fait: true, raison: 'Dans la maison' };
      if (!(ctx && ctx.compagnon)) return { ok: false, raison: 'Pour la maison d\'un compagnon' };
    }
    if (r.type === 'outil' && e.outils[r.id]) return { ok: false, fait: true, raison: 'Déjà forgé' };
    if (r.type === 'fiole' && besaceTotal(e) >= BESACE_MAX) return { ok: false, raison: 'Besace pleine (' + BESACE_MAX + ')' };
    if (!assezPour(e, r.cout)) return { ok: false, raison: 'Il manque ' + ORDRE_RES.filter(k => (r.cout[k] | 0) > e.sac[k]).map(k => (r.cout[k] - e.sac[k]) + ' ' + RESSOURCES[k].ico).join(' ') };
    return { ok: true };
  }
  function fabriquer(e, id, ctx) {
    var r = recette(id);
    if (!r) return { erreur: 'Recette inconnue' };
    var s = etatRecette(e, r, ctx);
    if (!s.ok) return { erreur: s.raison };
    payer(e, r.cout);
    if (r.type === 'outil') e.outils[r.id] = 1;
    if (r.type === 'fiole') e.besace[r.id] = (e.besace[r.id] | 0) + 1;
    verifier(e, ctx);
    return { ok: true, type: r.type, id: r.id, deco: r.type === 'deco' ? r.id : null };
  }
  // Le Donjon a mis ces fioles dans le sac du héros : on les retire de la besace
  function prendreFioles(e, ids) {
    var l = [];
    (ids || []).forEach(f => { if ((e.besace[f] | 0) > 0) { e.besace[f]--; if (!e.besace[f]) delete e.besace[f]; l.push(f); } });
    return l;
  }

  return {
    RESSOURCES: RESSOURCES, ORDRE_RES: ORDRE_RES, SAC_MAX: SAC_MAX, RECOLTE: RECOLTE, OUTILS: OUTILS, FIOLES: FIOLES, BESACE_MAX: BESACE_MAX, DONJON_MAX: DONJON_MAX,
    LIEUX_FAB: LIEUX_FAB, RECETTES: RECETTES,
    jourDe: jourDe, pointEn: pointEn, pointOuvert: pointOuvert, pointVisible: pointVisible, prisAujourdhui: prisAujourdhui, gain: gain, recolter: recolter, assezPour: assezPour, besaceTotal: besaceTotal,
    ouvertFab: ouvertFab, recette: recette, etatRecette: etatRecette, fabriquer: fabriquer, prendreFioles: prendreFioles,
    NB_PARCELLES: NB_PARCELLES, PARCELLES: PARCELLES, placerVoisins: placerVoisins, parcelleDe: parcelleDe, defile: defile, nettoyerVoisins: nettoyerVoisins, parcelles: parcelles, elargir: elargir,
    W: W, H: H, EW: EW, EH: EH, LARG: LARG, HAUT: HAUT, GRAINE: GRAINE, VISION: VISION,
    ECRANS: ECRANS, BATIMENTS: BATIMENTS, ACTIONS: ACTIONS, HABITANTS: HABITANTS, CHAMPIGNONS: CHAMPIGNONS, LUCIOLES: LUCIOLES, JUMELLES: JUMELLES, QUETES: QUETES, ORDRE_QUETES: ORDRE_QUETES,
    colOuvert: colOuvert, zoneOuverte: zoneOuverte, jumellesVisibles: jumellesVisibles, gagnerDefi: gagnerDefi, belvedere: belvedere,
    prenable: prenable, lucioleVisible: lucioleVisible, passerelleOk: passerelleOk,
    OBSTACLES: OBSTACLES, POUVOIRS: POUVOIRS, POUVOIR_ESPECE: POUVOIR_ESPECE, VENTE: VENTE,
    hash: hash, tuile: tuile, ecran: ecran, ecranDe: ecranDe, habitantEn: habitantEn, libre: libre, ouvert: ouvert,
    nouvelEtat: nouvelEtat, charger: charger, bits: bits, estVu: estVu, reveler: reveler, partVue: partVue,
    etatQuete: etatQuete, champignonVisible: champignonVisible, verifier: verifier, accepter: accepter, rendre: rendre, marque: marque,
    queteSuivie: queteSuivie, consigne: consigne, cible: cible, pas: pas, parler: parler, tableau: tableau, agir: agir, fouiller: fouiller
  };
})();
if (typeof module !== 'undefined') module.exports = VL;
