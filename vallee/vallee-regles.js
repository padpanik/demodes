// ================== LA VALLÉE DE DÉSDALE : la carte, les déplacements, le brouillard et les quêtes ==================
// Phase 1 (demandée par l'utilisateur le 11 novembre 2026) : le village et la forêt autour, la crypte (entrée du Donjon),
// ma maison (la maison du compagnon), un marchand, un tableau de quêtes, 4 quêtes d'habitants.
// Le monde est le même pour tous (dessiné à la main, petites variations tirées d'une graine fixe) ;
// la progression (position, brouillard, quêtes) est gardée sur le téléphone (`vallee-etat`, dans la sauvegarde).
// Moteur sans écran : testable avec Node (`node vallee/vallee-test.js`).

var VL = (function () {
  var W = 11, H = 9;               // un écran = 11 × 9 cases, comme une pièce du Donjon
  var EW = 6, EH = 3;              // le cœur du monde, dessiné à la main : 3 × 3 écrans (le village au centre), le quartier, le marais, la montagne
  var LARG = W * EW, HAUT = H * EH; // taille du cœur (le monde entier peut être plus grand : voir `bornes`)
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
  // Les Terres de la saison (3.57) : O  l'arche de la Porte des brumes (on fonce dedans pour passer)   Z  coffre de la saison   f  feu de camp
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
        'O::::::::::',
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
    gaspard: Object.assign({ nom: 'Gaspard', titre: 'le guide de montagne', espece: 'bouquetin', ico: '🐐' }, g(4, 0, 2, 3)),
    // Le hameau des Terres (3.58) : leur place change à chaque saison (posée par genererTerres)
    colporteur: { nom: 'Barnabé', titre: 'le colporteur', espece: 'blaireau', ico: '🦡', x: -999, y: -999 },
    cartographe: { nom: 'Mlle Taupinette', titre: 'la cartographe', espece: 'taupe', ico: '🗺️', x: -999, y: -999 }
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

  // ---------- Le monde, écran par écran (3.55) ----------
  // Chaque écran est rangé à ses coordonnées « ex,ey », qui peuvent sortir du cœur (même négatives) :
  // c'est là que viendront s'accrocher les terres générées. Le cœur (`ECRANS`) y est recopié au chargement.
  var MONDE = {}, BORNES = null;
  function cleE(ex, ey) { return ex + ',' + ey; }
  function mod(a, n) { return ((a % n) + n) % n; }
  function ajouterEcran(ex, ey, E) { MONDE[cleE(ex, ey)] = E; BORNES = null; return E; }
  function retirerEcran(ex, ey) { delete MONDE[cleE(ex, ey)]; BORNES = null; }
  ECRANS.forEach((ligne, ey) => ligne.forEach((E, ex) => { if (E) ajouterEcran(ex, ey, E); }));
  function ecranA(ex, ey) { return MONDE[cleE(ex, ey)] || null; }
  // Tous les écrans : [{ ex, ey, E }]
  function ecrans() { return Object.keys(MONDE).map(k => { var c = k.split(',').map(Number); return { ex: c[0], ey: c[1], E: MONDE[k] }; }); }
  // Le rectangle qui contient tout le monde, en écrans (ex0..ex1 compris) et en cases (x0..x1 exclu)
  function bornes() {
    if (BORNES) return BORNES;
    var b = { ex0: Infinity, ey0: Infinity, ex1: -Infinity, ey1: -Infinity };
    ecrans().forEach(c => { b.ex0 = Math.min(b.ex0, c.ex); b.ey0 = Math.min(b.ey0, c.ey); b.ex1 = Math.max(b.ex1, c.ex); b.ey1 = Math.max(b.ey1, c.ey); });
    b.x0 = b.ex0 * W; b.y0 = b.ey0 * H; b.x1 = (b.ex1 + 1) * W; b.y1 = (b.ey1 + 1) * H;
    return BORNES = b;
  }

  // ---------- Lecture de la carte ----------
  function tuile(x, y) {
    var E = MONDE[cleE(Math.floor(x / W), Math.floor(y / H))];
    return E ? E.l[mod(y, H)][mod(x, W)] : null;   // pas d'écran à cet endroit (hors du monde)
  }
  function ecranDe(x, y) { return { ex: Math.floor(x / W), ey: Math.floor(y / H) }; }
  function ecran(x, y) { var c = ecranDe(x, y); return ecranA(c.ex, c.ey); }
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
    var e = { v: 1, x: p.x, y: p.y, dir: 'b', brume: {}, ouverts: {}, pris: {}, quetes: {}, coffre: false, coffreM: false, cle: false, pas: 0,
              sac: { bois: 0, pierre: 0, plante: 0, cristal: 0 }, recolte: { j: '', pris: {} }, outils: {}, besace: {}, terres: { s: saisonDe(), ouv: {}, feux: {}, tour: false, carto: false, troc: { j: '', n: 0 } } };
    reveler(e);
    return e;
  }
  // Une sauvegarde vient du téléphone (ou d'un fichier) : on la vérifie
  function charger(s) {
    var e = nouvelEtat();
    if (!s || typeof s !== 'object' || s.v !== 1) return e;
    ['ouverts', 'pris'].forEach(k => { if (s[k] && typeof s[k] === 'object') e[k] = Object.assign({}, s[k]); });
    if (s.quetes && typeof s.quetes === 'object') Object.keys(QUETES).forEach(id => { if (s.quetes[id] && typeof s.quetes[id] === 'object') e.quetes[id] = Object.assign({}, s.quetes[id]); });
    e.dir = ['h', 'b', 'g', 'd'].indexOf(s.dir) >= 0 ? s.dir : 'b';
    if (s.brume && typeof s.brume === 'object') Object.keys(s.brume).forEach(k => {
      if (/^-?\d+,-?\d+$/.test(k) && typeof s.brume[k] === 'string' && /^[0-9a-f]{1,25}$/.test(s.brume[k])) e.brume[k] = s.brume[k];
    });
    else if (typeof s.vu === 'string' && /^[0-9a-f]*$/.test(s.vu)) depuisVu(e, s.vu, s.lv | 0 || 33);   // sauvegarde d'avant 3.55 (une seule bande)
    // Les Terres de la saison (3.57) : ce qu'on y a ouvert ne vaut que pour sa saison
    if (s.terres && typeof s.terres === 'object' && typeof s.terres.s === 'number') {
      e.terres.s = s.terres.s;
      Object.keys(s.terres.ouv || {}).forEach(k => { if (/^-?\d+,-?\d+$/.test(k)) e.terres.ouv[k] = 1; });
      Object.keys(s.terres.feux || {}).forEach(k => { if (/^f\d$/.test(k)) e.terres.feux[k] = 1; });
      e.terres.tour = !!s.terres.tour; e.terres.carto = !!s.terres.carto;
      if (s.terres.troc && typeof s.terres.troc.j === 'string') e.terres.troc = { j: s.terres.troc.j, n: Math.max(0, s.terres.troc.n | 0) };
    } else e.terres.s = null;   // sauvegarde d'avant 3.57 : rien dans les Terres
    var au = ecran(s.x | 0, s.y | 0), audela = au && au.zone && au.zone !== 'terres' && mod(s.x | 0, W) > 0;   // au-delà de la passerelle ou du col
    if (libre(e, s.x | 0, s.y | 0) && (!audela || zoneOuverte(e, au))) { e.x = s.x | 0; e.y = s.y | 0; }
    if (e.terres.s !== saisonDe() && changerSaison(e)) e.nouvelleSaison = true;   // la page l'annonce (et l'efface)
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

  // ---------- Brouillard : un paquet de bits par écran (3.55), en hexadécimal ----------
  // e.brume = { 'ex,ey': 25 signes } (11 × 9 = 99 cases). Un écran jamais vu n'a pas d'entrée : le monde peut grandir sans fin.
  var NB = Math.ceil(W * H / 4);
  // Lecture rapide : `b` garde les écrans déjà décodés (on le passe d'un appel à l'autre pendant un dessin)
  function bits(e) { return { e: e, m: {} }; }
  function paquet(b, k, creer) {
    if (b.m[k]) return b.m[k];
    var s = b.e.brume[k];
    if (!s && !creer) return null;
    var t = new Uint8Array(NB);
    for (var i = 0; s && i < NB && i < s.length; i++) t[i] = parseInt(s[i], 16) || 0;
    return b.m[k] = t;
  }
  function ecrirePaquet(b, k) { b.e.brume[k] = Array.from(b.m[k], v => v.toString(16)).join(''); }
  function estVu(e, x, y, b) {
    b = b || bits(e);
    var t = paquet(b, cleE(Math.floor(x / W), Math.floor(y / H)));
    if (!t) return false;
    var i = mod(y, H) * W + mod(x, W);
    return !!(t[i >> 2] & (1 << (i & 3)));
  }
  // Dévoile une case (seulement si elle fait partie du monde) ; vrai si elle était encore cachée
  function voir(b, x, y, aEcrire) {
    if (tuile(x, y) === null) return false;
    var k = cleE(Math.floor(x / W), Math.floor(y / H)), t = paquet(b, k, true), i = mod(y, H) * W + mod(x, W);
    if (t[i >> 2] & (1 << (i & 3))) return false;
    t[i >> 2] |= 1 << (i & 3); aEcrire[k] = 1;
    return true;
  }
  // L'ancien brouillard (une bande de `larg` cases sur toute la carte, avant 3.55) rangé écran par écran
  function depuisVu(e, vu, larg) {
    var b = bits(e), aEcrire = {}, n = vu.length * 4;
    for (var i = 0; i < n; i++) {
      if (!((parseInt(vu[i >> 2], 16) || 0) & (1 << (i & 3)))) continue;
      voir(b, i % larg, Math.floor(i / larg), aEcrire);
    }
    Object.keys(aEcrire).forEach(k => ecrirePaquet(b, k));
  }
  function reveler(e) {
    var b = bits(e), r = Math.ceil(VISION), aEcrire = {};
    for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
      if (Math.hypot(dx, dy) > VISION) continue;
      voir(b, e.x + dx, e.y + dy, aEcrire);
    }
    Object.keys(aEcrire).forEach(k => ecrirePaquet(b, k));
    return Object.keys(aEcrire).length > 0;
  }
  // Dévoile tout un rectangle de cases (le belvédère)
  function devoiler(e, x0, y0, x1, y1) {
    var b = bits(e), aEcrire = {}, n = 0;
    for (var y = y0; y < y1; y++) for (var x = x0; x < x1; x++) if (voir(b, x, y, aEcrire)) n++;
    Object.keys(aEcrire).forEach(k => ecrirePaquet(b, k));
    return n;
  }
  // La part explorée : le cœur du monde (les terres générées ne comptent pas, elles changent)
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
    if (t === 'O') return { action: dansTerres(nx, ny) ? 'arche' : 'porte', x: nx, y: ny };
    if (t === 'Z') return { action: 'coffreT', x: nx, y: ny };
    if (t === 'f') return { action: 'feu', x: nx, y: ny };
    if (t === 'W') return { action: 'tour', x: nx, y: ny };
    if (TERRES.actions[k]) return { action: TERRES.actions[k].id, x: nx, y: ny, p: TERRES.actions[k].n };
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
    var pt = parlerTerres(e, qui); if (pt) return pt;
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
    var tr = /^troc:(\w+)$/.exec(a || '');
    if (tr) return troquer(e, tr[1]);
    if (a === 'carte') return acheterCarte(e);
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
    var n = devoiler(e, 2 * W, 0, LARG, 2 * H);
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

  // ================== Les Terres de la saison (3.57) ==================
  // Au bord ouest de la Vallée, la Porte des brumes mène à un monde GÉNÉRÉ qui change à chaque saison (4 semaines) :
  // le même pour tous les amis (graine = numéro de la saison), rangé loin du cœur dans les coordonnées.
  // 8 × 8 écrans, forêt brumeuse et collines, une rivière, des coffres ; depuis 3.58, des feux de camp (voyage), une tour de guet et un hameau.
  var TX = 0, TY = 10, TW = 8, TH = 8;   // en écrans : les Terres vont de (0, 10) à (7, 17)
  var DUREE_SAISON = 28;                  // en jours
  var DEBUT_SAISONS = new Date(2026, 10, 9).getTime();   // lundi 9 novembre 2026, heure du téléphone : la saison 1 commence
  var PORTE = g(0, 1, 0, 4);              // l'arche dans la Vallée, au bord ouest du ruisseau
  var NB_COFFRES = 6;
  var TERRES = { saison: null, camp: null, coffres: [], ecrans: [], riviere: -1, feux: [], tour: null, hameau: null, actions: {} };
  var NB_FEUX = 3, TROC_JOUR = 3, PRIX_CARTE = 3;
  function saisonDe(t) {
    var d = new Date(t == null ? Date.now() : t); d.setHours(0, 0, 0, 0);
    return Math.floor(Math.round((d.getTime() - DEBUT_SAISONS) / 864e5) / DUREE_SAISON);
  }
  // La date de fin de la saison (le dernier jour), pour l'annoncer
  function finSaison(n) { var d = new Date(DEBUT_SAISONS); d.setDate(d.getDate() + (n + 1) * DUREE_SAISON - 1); return d; }
  function dansTerres(x, y) { var c = ecranDe(x, y); return c.ex >= TX && c.ex < TX + TW && c.ey >= TY && c.ey < TY + TH; }
  // Un tirage reproductible (mulberry32)
  function alea(graine) {
    var a = graine >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // Petits motifs dessinés à la main, posés au hasard dans les écrans (« . » = on ne touche pas la case)
  var MORCEAUX = {
    foret: [['TT', 'TT'], ['.T.', 'TTT'], ['SS', 'S.'], ['~~', '~~'], ['b.b', '.o.'], ['TS', '.T'], ['T.T'], ['bb'], ['.~', '~~'], ['S', 'S']],
    collines: [['kk', 'k.'], ['k.k'], ['.k', 'kk'], ['bb', '.b'], ['~~'], ['T.', 'Tk'], ['k'], ['b.k'], [',,,', ',,,'], ['T', 'T']]
  };
  var BIOMES = {
    foret: { nom: 'La forêt brumeuse', ico: '🌫️' },
    collines: { nom: 'Les collines', ico: '⛰️' }
  };
  // Le monde de la saison : plan d'ensemble (biomes, liens entre écrans, rivière), puis chaque écran, puis les coffres
  function genererTerres(saison) {
    TERRES.ecrans.forEach(c => retirerEcran(c.ex, c.ey));
    var r = alea(Math.imul(GRAINE ^ 0x5bd1e995, 2654435761) ^ Math.imul(saison + 1, 0x9e3779b1)), ri = n => Math.floor(r() * n);
    var campY = 2 + ri(TH - 4);
    // Les liens entre écrans : un arbre qui passe partout (Prim au hasard), plus quelques boucles
    var lien = {}, dans = {}, front = [];
    var cle = (x, y) => x + ',' + y, lier = (a, b, c, d) => { lien[cle(a, b) + '>' + cle(c, d)] = 1; lien[cle(c, d) + '>' + cle(a, b)] = 1; };
    var lie = (a, b, c, d) => !!lien[cle(a, b) + '>' + cle(c, d)];
    function ajouter(x, y) {
      dans[cle(x, y)] = 1;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(v => { var nx = x + v[0], ny = y + v[1]; if (nx >= 0 && ny >= 0 && nx < TW && ny < TH && !dans[cle(nx, ny)]) front.push([x, y, nx, ny]); });
    }
    ajouter(0, campY);
    while (front.length) {
      var f = front.splice(ri(front.length), 1)[0];
      if (dans[cle(f[2], f[3])]) continue;
      lier(f[0], f[1], f[2], f[3]); ajouter(f[2], f[3]);
    }
    for (var y = 0; y < TH; y++) for (var x = 0; x < TW; x++) {
      if (x + 1 < TW && !lie(x, y, x + 1, y) && r() < 0.14) lier(x, y, x + 1, y);
      if (y + 1 < TH && !lie(x, y, x, y + 1) && r() < 0.14) lier(x, y, x, y + 1);
    }
    // Les biomes : quelques centres, chaque écran prend celui du centre le plus proche (au moins une forêt et des collines)
    var centres = [0, 1, 2, 3].map(i => ({ x: ri(TW), y: ri(TH), b: i === 0 ? 'foret' : i === 1 ? 'collines' : (r() < 0.5 ? 'foret' : 'collines') }));
    var biome = (x, y) => centres.reduce((m, c) => { var d = Math.abs(c.x - x) + Math.abs(c.y - y) + c.x * 0.001; return d < m.d ? { d: d, b: c.b } : m; }, { d: 1e9 }).b;
    var riviere = 1 + ri(TH - 2);   // une rivière d'ouest en est, sur une ligne d'écrans
    // Les lieux de la saison (3.58) : le hameau (à 3 ou 4 écrans du camp), la tour de guet (vers le milieu), 3 feux de camp aussi loin que possible
    var dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y), tous = [];
    for (var yy0 = 0; yy0 < TH; yy0++) for (var xx0 = 0; xx0 < TW; xx0++) tous.push({ x: xx0, y: yy0 });
    var campE = { x: 0, y: campY }, pris = [campE], libres = () => tous.filter(c => !pris.some(p => p.x === c.x && p.y === c.y));
    var choisir = l => (l.length ? l : libres())[ri(l.length || libres().length)];
    var hameau = choisir(libres().filter(c => dist(c, campE) >= 3 && dist(c, campE) <= 4 && c.y > 0 && c.y < TH - 1)); pris.push(hameau);
    var tour = choisir(libres().filter(c => c.x >= 3 && c.x <= 5 && c.y >= 2 && c.y <= 5 && dist(c, hameau) >= 2)); pris.push(tour);
    var feux = [];
    for (var nf = 0; nf < NB_FEUX; nf++) {
      var cands = libres().map(c => ({ c: c, d: Math.min.apply(null, pris.map(p => dist(p, c))) + r() * 0.5 }));
      var mx = cands.reduce((m, q) => q.d > m.d ? q : m, { d: -1 }).c;
      feux.push(mx); pris.push(mx);
    }
    var special = (cx, cy) => (hameau.x === cx && hameau.y === cy) ? 'hameau' : (tour.x === cx && tour.y === cy) ? 'tour' : feux.findIndex(c => c.x === cx && c.y === cy);
    // On retire ce que la saison d'avant avait posé (maisons, habitants)
    for (var ib = BATIMENTS.length - 1; ib >= 0; ib--) if (BATIMENTS[ib].terres) BATIMENTS.splice(ib, 1);
    TERRES.actions = {}; TERRES.feux = [];
    TERRES.saison = saison; TERRES.riviere = riviere; TERRES.ecrans = []; TERRES.coffres = [];
    TERRES.camp = { x: TX * W, y: (TY + campY) * H + 4 };
    TERRES.plan = { lie: lie, biome: biome, campY: campY };
    var places = [];   // pour les coffres : cases possibles par écran
    for (var cy = 0; cy < TH; cy++) for (var cx = 0; cx < TW; cx++) {
      var bi = biome(cx, cy), camp = cx === 0 && cy === campY;
      var bordure = () => bi === 'foret' ? (r() < 0.35 ? 'S' : 'T') : (r() < 0.55 ? 'k' : r() < 0.6 ? 'T' : 'b');
      var l = [];
      for (var yy = 0; yy < H; yy++) { l.push([]); for (var xx = 0; xx < W; xx++) l[yy].push(xx === 0 || yy === 0 || xx === W - 1 || yy === H - 1 ? bordure() : r() < 0.1 ? ',' : '.'); }
      // Lisière irrégulière
      for (yy = 1; yy < H - 1; yy++) for (xx = 1; xx < W - 1; xx++) if ((xx === 1 || yy === 1 || xx === W - 2 || yy === H - 2) && r() < 0.28) l[yy][xx] = bordure();
      // Les petits motifs
      var nm = camp ? 1 : 2 + ri(3), lm = MORCEAUX[bi];
      for (var m = 0; m < nm; m++) {
        var mo = lm[ri(lm.length)], mh = mo.length, mw = mo[0].length, px = 1 + ri(W - 2 - mw), py = 1 + ri(H - 2 - mh);
        for (yy = 0; yy < mh; yy++) for (xx = 0; xx < mw; xx++) if (mo[yy][xx] !== '.') l[py + yy][px + xx] = mo[yy][xx];
      }
      // Les lieux de la saison : une clairière autour (le chemin passe ensuite)
      var sp = special(cx, cy), vider = (x0, y0, x1, y1) => { for (yy = y0; yy <= y1; yy++) for (xx = x0; xx <= x1; xx++) l[yy][xx] = r() < 0.15 ? ',' : '.'; };
      if (sp === 'hameau') {
        vider(1, 1, 9, 5);
        [[1, 1], [2, 1], [1, 2], [2, 2], [8, 1], [9, 1], [8, 2], [9, 2]].forEach(c => { l[c[1]][c[0]] = 'x'; });
        l[5][1] = 'o'; l[5][9] = 'b';
      }
      if (sp === 'tour') { vider(5, 2, 8, 4); l[2][7] = 'W'; }
      if (typeof sp === 'number' && sp >= 0) { vider(2, 2, 5, 4); l[2][3] = 'f'; }
      // Les chemins : du centre vers chaque sortie
      var sorties = { h: cy > 0 && lie(cx, cy, cx, cy - 1), b: cy < TH - 1 && lie(cx, cy, cx, cy + 1), g: cx > 0 && lie(cx, cy, cx - 1, cy), d: cx < TW - 1 && lie(cx, cy, cx + 1, cy) };
      l[4][5] = ':';
      if (sorties.h) for (yy = 0; yy <= 4; yy++) l[yy][5] = ':';
      if (sorties.b) for (yy = 4; yy < H; yy++) l[yy][5] = ':';
      if (sorties.g) for (xx = 0; xx <= 5; xx++) l[4][xx] = ':';
      if (sorties.d) for (xx = 5; xx < W; xx++) l[4][xx] = ':';
      // Le camp : l'arche au bord ouest, le chemin jusqu'à elle, un feu de camp au calme
      if (camp) {
        for (xx = 1; xx <= 5; xx++) l[4][xx] = ':';
        l[4][0] = 'O';
        [[2, 2], [3, 2], [4, 2], [5, 2], [2, 3], [3, 3], [4, 3], [5, 3]].forEach(c => { if (l[c[1]][c[0]] !== ':') l[c[1]][c[0]] = '.'; });
        l[2][3] = 'f';
      }
      // La rivière, avec un pont là où passe le chemin du sud
      if (cy === riviere) for (xx = 0; xx < W; xx++) l[6][xx] = xx === 5 && sorties.b ? '=' : '~';
      var E = { id: camp ? 't-camp' : 't-' + bi, nom: camp ? 'Le camp des brumes' : BIOMES[bi].nom, ico: camp ? '⛺' : BIOMES[bi].ico, zone: 'terres', biome: bi,
                sol: bi === 'collines' ? 'colline' : undefined, brume: bi === 'foret', l: l.map(rg => rg.join('')) };
      ajouterEcran(TX + cx, TY + cy, E);
      TERRES.ecrans.push({ ex: TX + cx, ey: TY + cy });
      // Cases où l'on pourra poser un coffre : de l'herbe qu'on atteint depuis le centre, loin du chemin
      if (!camp && sp === -1) {
        var vu = {}, file = [[5, 4]]; vu['5,4'] = 1;
        while (file.length) {
          var q = file.shift();
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(v => {
            var nx = q[0] + v[0], ny = q[1] + v[1];
            if (nx < 1 || ny < 1 || nx > W - 2 || ny > H - 2 || vu[nx + ',' + ny] || !(MARCHE[l[ny][nx]] || l[ny][nx] === '=')) return;
            vu[nx + ',' + ny] = 1; file.push([nx, ny]);
          });
        }
        var cand = Object.keys(vu).map(k => k.split(',').map(Number)).filter(c => (l[c[1]][c[0]] === '.' || l[c[1]][c[0]] === ',') && c[0] !== 5 && c[1] !== 4 && Math.abs(c[0] - 5) + Math.abs(c[1] - 4) >= 3);
        if (cand.length) places.push({ ex: TX + cx, ey: TY + cy, cand: cand });
      }
    }
    // Les lieux posés : le hameau (deux chaumières, le colporteur et la cartographe), la tour, les feux
    var H0 = { x: (TX + hameau.x) * W, y: (TY + hameau.y) * H };
    [0, 1].forEach(n => {
      var B = { type: 'chaumiere', n: n, terres: true, x: H0.x + (n ? 8 : 1), y: H0.y + 1, w: 2, h: 2 };
      BATIMENTS.push(B);
      [0, 1].forEach(dx => { TERRES.actions[(B.x + dx) + ',' + (B.y + 1)] = { id: 'chaumiere', n: n }; });
    });
    HABITANTS.colporteur.x = H0.x + 3; HABITANTS.colporteur.y = H0.y + 3;
    HABITANTS.cartographe.x = H0.x + 7; HABITANTS.cartographe.y = H0.y + 3;
    TERRES.hameau = { ex: TX + hameau.x, ey: TY + hameau.y, x: H0.x + 5, y: H0.y + 2 };
    TERRES.tour = { ex: TX + tour.x, ey: TY + tour.y, x: (TX + tour.x) * W + 7, y: (TY + tour.y) * H + 2 };
    // Les feux : celui du camp (toujours allumé), puis les 3 de la saison, nommés d'après le paysage et la direction
    var direction = c => ((c.y <= 2 ? 'nord' : c.y >= 5 ? 'sud' : '') + (c.x >= 5 ? (c.y <= 2 || c.y >= 5 ? '-est' : 'est') : c.x <= 2 ? (c.y <= 2 || c.y >= 5 ? '-ouest' : 'ouest') : '')) || 'centre';
    TERRES.feux.push({ id: 'camp', nom: 'Feu du camp', x: TX * W + 3, y: (TY + campY) * H + 2, ex: TX, ey: TY + campY });
    feux.forEach((c, k) => TERRES.feux.push({ id: 'f' + (k + 1), nom: 'Feu ' + (biome(c.x, c.y) === 'foret' ? 'de la forêt' : 'des collines') + ' (' + direction(c) + ')',
                                              x: (TX + c.x) * W + 3, y: (TY + c.y) * H + 2, ex: TX + c.x, ey: TY + c.y }));
    // Les coffres de la saison, dans des écrans différents
    for (var n = 0; n < NB_COFFRES && places.length; n++) {
      var P = places.splice(ri(places.length), 1)[0], c = P.cand[ri(P.cand.length)], Ec = ecranA(P.ex, P.ey);
      var rows = Ec.l.map(rg => rg.split(''));
      rows[c[1]][c[0]] = 'Z'; Ec.l = rows.map(rg => rg.join(''));
      TERRES.coffres.push({ x: P.ex * W + c[0], y: P.ey * H + c[1] });
    }
  }
  function terresPretes(t) { var n = saisonDe(t); if (TERRES.saison !== n) genererTerres(n); return n; }
  terresPretes();
  // Une nouvelle saison : on oublie ce qu'on avait vu et ouvert dans les Terres ; si l'on y était, on se retrouve au camp
  function changerSaison(e, t) {
    var n = terresPretes(t);
    if (e.terres && e.terres.s === n) return false;
    Object.keys(e.brume).forEach(k => { var c = k.split(',').map(Number); if (c[0] >= TX && c[0] < TX + TW && c[1] >= TY && c[1] < TY + TH) delete e.brume[k]; });
    var avant = e.terres && e.terres.s;
    e.terres = { s: n, ouv: {}, feux: {}, tour: false, carto: false, troc: { j: '', n: 0 } };
    if (dansTerres(e.x, e.y)) { e.x = TERRES.camp.x + 2; e.y = TERRES.camp.y; e.dir = 'd'; }
    reveler(e);
    return avant != null;   // vrai s'il y avait une saison avant (on l'annonce)
  }
  // Passer la Porte des brumes (aller) ou l'arche du camp (retour)
  function traverser(e, sens) {
    // On arrive deux cases devant l'arche, pour la voir en entier
    if (sens === 'aller') { changerSaison(e); e.x = TERRES.camp.x + 2; e.y = TERRES.camp.y; e.dir = 'd'; }
    else { e.x = PORTE.x + 2; e.y = PORTE.y; e.dir = 'd'; }
    reveler(e);
    return { ecran: true };
  }
  // Un coffre de la saison : son contenu est tiré de la saison et de sa place (le même pour tous)
  function ouvrirCoffreT(e, x, y) {
    var k = x + ',' + y;
    if (!TERRES.coffres.some(c => c.x === x && c.y === y)) return {};
    if (e.terres.ouv[k]) return { texte: 'Le coffre est vide. Quelqu\'un est passé par là… toi !' };
    e.terres.ouv[k] = 1;
    var r = alea(Math.imul(TERRES.saison + 7, 73856093) ^ Math.imul(x, 19349663) ^ Math.imul(y, 83492791)), tir = r();
    if (tir < 0.4) { var et = r() < 0.4 ? 2 : 1; return { etoiles: et, texte: 'Le coffre s\'ouvre en grinçant : ' + et + ' ⭐ !' }; }
    var res = tir < 0.55 ? 'cristal' : ['bois', 'pierre', 'plante'][Math.floor(r() * 3)], nb = res === 'cristal' ? 1 : 2 + Math.floor(r() * 2);
    var place = Math.min(SAC_MAX - (e.sac[res] | 0), nb);
    e.sac[res] = (e.sac[res] | 0) + place;
    var mot = { bois: ['bûche', 'bûches'], pierre: ['pierre', 'pierres'], plante: ['brin de plantes', 'brins de plantes'], cristal: ['cristal', 'cristaux'] }[res];
    return { res: res, n: place, texte: place ? 'Dans le coffre : ' + place + ' ' + mot[place > 1 ? 1 : 0] + ' ' + RESSOURCES[res].ico + ' pour ton sac !' : 'Dans le coffre : des ' + mot[1] + ' ' + RESSOURCES[res].ico + '… mais ton sac en est plein.' };
  }
  // ---------- Feux de camp, tour de guet, hameau (3.58) ----------
  function feuEn(x, y) { return TERRES.feux.find(F => F.x === x && F.y === y) || null; }
  function feuAllume(e, F) { return !!F && (F.id === 'camp' || !!(e.terres && e.terres.feux[F.id])); }
  // Allumer un feu : une bûche du sac
  function allumer(e, id) {
    var F = TERRES.feux.find(q => q.id === id);
    if (!F || feuAllume(e, F)) return {};
    if ((e.sac.bois | 0) < 1) return { erreur: 'Il faut une bûche 🪵 pour l\'allumer.' };
    e.sac.bois--; e.terres.feux[id] = 1;
    return { allume: id, nom: F.nom };
  }
  // Où peut-on aller depuis ici (un feu allumé, ou 'vallee' depuis la Porte des brumes) ?
  function destinations(e, depuis) {
    var l = [];
    if (depuis !== 'vallee') l.push({ id: 'vallee', nom: 'La Vallée (Porte des brumes)', ico: '🏡' });
    TERRES.feux.forEach(F => { if (F.id !== depuis && feuAllume(e, F)) l.push({ id: F.id, nom: F.id === 'camp' ? 'Le camp des brumes' : F.nom, ico: F.id === 'camp' ? '⛺' : '🔥' }); });
    return l;
  }
  // Voyager d'un coup : on arrive devant le feu (ou devant la Porte des brumes, dans la Vallée)
  function voyager(e, dest) {
    if (dest === 'vallee') { e.x = PORTE.x + 2; e.y = PORTE.y; e.dir = 'd'; reveler(e); return { ecran: true }; }
    changerSaison(e);
    var F = TERRES.feux.find(q => q.id === dest);
    if (!F || !feuAllume(e, F)) return {};
    e.x = F.x + 2; e.y = F.y + 1; e.dir = 'g';   // à côté du feu, pour le voir
    reveler(e);
    return { ecran: true };
  }
  // La tour de guet : du haut, on voit les écrans autour (5 × 5)
  function monterTour(e) {
    var T = TERRES.tour, x0 = Math.max(TX, T.ex - 2) * W, y0 = Math.max(TY, T.ey - 2) * H, x1 = Math.min(TX + TW, T.ex + 3) * W, y1 = Math.min(TY + TH, T.ey + 3) * H;
    var n = devoiler(e, x0, y0, x1, y1), premiere = !e.terres.tour;
    e.terres.tour = true;
    return { n: n, premiere: premiere };
  }
  // Le troc du colporteur : 3 par jour
  var TROCS = { bois: { donne: 3, ico: '🪵' }, pierre: { donne: 3, ico: '🪨' }, plante: { donne: 4, ico: '🌿' } };
  function trocsRestants(e) { return e.terres.troc.j === jourDe() ? Math.max(0, TROC_JOUR - e.terres.troc.n) : TROC_JOUR; }
  function troquer(e, res) {
    var T = TROCS[res];
    if (!T) return {};
    if (!trocsRestants(e)) return { erreur: 'Barnabé a vidé sa hotte pour aujourd\'hui. Reviens demain !' };
    if ((e.sac[res] | 0) < T.donne) return { erreur: 'Il te faut ' + T.donne + ' ' + T.ico + '.' };
    if (e.sac.cristal >= SAC_MAX) return { erreur: 'Ton sac est plein de cristaux.' };
    if (e.terres.troc.j !== jourDe()) e.terres.troc = { j: jourDe(), n: 0 };
    e.sac[res] -= T.donne; e.sac.cristal++; e.terres.troc.n++;
    return { troc: res, texte: 'Marché conclu : ' + T.donne + ' ' + T.ico + ' contre 1 💎. Bonne route !' };
  }
  // La carte de la cartographe : toutes les Terres de la saison, pour quelques cristaux
  function acheterCarte(e) {
    if (e.terres.carto) return {};
    if ((e.sac.cristal | 0) < PRIX_CARTE) return { erreur: 'Il faut ' + PRIX_CARTE + ' cristaux 💎.' };
    e.sac.cristal -= PRIX_CARTE; e.terres.carto = true;
    return { carte: devoiler(e, TX * W, TY * H, (TX + TW) * W, (TY + TH) * H) };
  }
  function parlerTerres(e, qui) {
    var ok = { t: 'Au revoir !', a: 'fermer' };
    if (qui === 'colporteur') {
      var n = trocsRestants(e);
      if (!n) return { qui: qui, texte: 'Hmpf… Ma hotte est vide pour aujourd\'hui. Reviens demain, j\'aurai d\'autres cristaux. En attendant, va donc voir les feux : on dit qu\'il y en a ' + NB_FEUX + ' dans les Terres.', boutons: [ok] };
      return { qui: qui, texte: 'Bien le bonjour ! Barnabé, colporteur. Je ramasse des cristaux dans les grottes, et je les échange contre ce qui me manque. Il me reste ' + n + ' cristau' + (n > 1 ? 'x' : '') + ' pour aujourd\'hui. Ça te dit ?',
               boutons: Object.keys(TROCS).map(r => ({ t: TROCS[r].donne + ' ' + TROCS[r].ico + ' → 1 💎', a: 'troc:' + r, principal: (e.sac[r] | 0) >= TROCS[r].donne, off: (e.sac[r] | 0) < TROCS[r].donne })).concat([ok]) };
    }
    if (qui === 'cartographe') {
      if (e.terres.carto) return { qui: qui, texte: ['Ma carte te plaît ? Je l\'ai dessinée à la lueur des feux, mon nez dans la boue.',
        'Les Terres changent à chaque saison. Moi, je redessine tout. C\'est mon métier !',
        'Tu as vu la tour de guet ? Du haut, même une taupe y voit quelque chose.'][e.pas % 3], boutons: [ok] };
      return { qui: qui, texte: 'Oh ! Un visiteur ! Je suis Mlle Taupinette, cartographe. J\'ai fouillé toutes les Terres de cette saison, galerie par galerie. Pour ' + PRIX_CARTE + ' cristaux, je te recopie ma carte : tu verras tout, les feux, la tour, les coffres…',
               boutons: [{ t: '🗺️ Ma carte pour ' + PRIX_CARTE + ' 💎', a: 'carte', principal: (e.sac.cristal | 0) >= PRIX_CARTE, off: (e.sac.cristal | 0) < PRIX_CARTE }, ok] };
    }
    return null;
  }

  function infoTerres() {
    return { saison: TERRES.saison, numero: TERRES.saison + 1, fin: finSaison(TERRES.saison), camp: Object.assign({}, TERRES.camp), coffres: TERRES.coffres.slice(),
             feux: TERRES.feux.map(F => Object.assign({}, F)), tour: Object.assign({}, TERRES.tour), hameau: Object.assign({}, TERRES.hameau),
             riviere: TERRES.riviere, x0: TX * W, y0: TY * H, x1: (TX + TW) * W, y1: (TY + TH) * H, ex0: TX, ey0: TY, ex1: TX + TW - 1, ey1: TY + TH - 1 };
  }
  // Les régions de la carte du monde (le cœur, les Terres), en cases
  function regions() { return [{ id: 'coeur', x0: 0, y0: 0, x1: LARG, y1: HAUT }, Object.assign({ id: 'terres' }, (function () { var i = infoTerres(); return { x0: i.x0, y0: i.y0, x1: i.x1, y1: i.y1 }; })())]; }
  function regionDe(x, y) { return dansTerres(x, y) ? 'terres' : 'coeur'; }
  function partVueTerres(e) {
    var b = bits(e), n = 0, t = 0, i = infoTerres();
    for (var y = i.y0; y < i.y1; y++) for (var x = i.x0; x < i.x1; x++) { if (tuile(x, y) === null) continue; t++; if (estVu(e, x, y, b)) n++; }
    return n / t;
  }

  return {
    RESSOURCES: RESSOURCES, ORDRE_RES: ORDRE_RES, SAC_MAX: SAC_MAX, RECOLTE: RECOLTE, OUTILS: OUTILS, FIOLES: FIOLES, BESACE_MAX: BESACE_MAX, DONJON_MAX: DONJON_MAX,
    LIEUX_FAB: LIEUX_FAB, RECETTES: RECETTES,
    jourDe: jourDe, pointEn: pointEn, pointOuvert: pointOuvert, pointVisible: pointVisible, prisAujourdhui: prisAujourdhui, gain: gain, recolter: recolter, assezPour: assezPour, besaceTotal: besaceTotal,
    ouvertFab: ouvertFab, recette: recette, etatRecette: etatRecette, fabriquer: fabriquer, prendreFioles: prendreFioles,
    NB_PARCELLES: NB_PARCELLES, PARCELLES: PARCELLES, placerVoisins: placerVoisins, parcelleDe: parcelleDe, defile: defile, nettoyerVoisins: nettoyerVoisins, parcelles: parcelles,
    W: W, H: H, EW: EW, EH: EH, LARG: LARG, HAUT: HAUT, GRAINE: GRAINE, VISION: VISION,
    ECRANS: ECRANS, BATIMENTS: BATIMENTS, ACTIONS: ACTIONS, HABITANTS: HABITANTS, CHAMPIGNONS: CHAMPIGNONS, LUCIOLES: LUCIOLES, JUMELLES: JUMELLES, QUETES: QUETES, ORDRE_QUETES: ORDRE_QUETES,
    colOuvert: colOuvert, zoneOuverte: zoneOuverte, jumellesVisibles: jumellesVisibles, gagnerDefi: gagnerDefi, belvedere: belvedere,
    prenable: prenable, lucioleVisible: lucioleVisible, passerelleOk: passerelleOk,
    OBSTACLES: OBSTACLES, POUVOIRS: POUVOIRS, POUVOIR_ESPECE: POUVOIR_ESPECE, VENTE: VENTE,
    ajouterEcran: ajouterEcran, retirerEcran: retirerEcran, ecranA: ecranA, ecrans: ecrans, bornes: bornes,
    hash: hash, tuile: tuile, ecran: ecran, ecranDe: ecranDe, habitantEn: habitantEn, libre: libre, ouvert: ouvert,
    nouvelEtat: nouvelEtat, charger: charger, bits: bits, estVu: estVu, reveler: reveler, devoiler: devoiler, partVue: partVue,
    etatQuete: etatQuete, champignonVisible: champignonVisible, verifier: verifier, accepter: accepter, rendre: rendre, marque: marque,
    queteSuivie: queteSuivie, consigne: consigne, cible: cible, pas: pas, parler: parler, tableau: tableau, agir: agir, fouiller: fouiller,
    PORTE: PORTE, saisonDe: saisonDe, genererTerres: genererTerres, terresPretes: terresPretes, changerSaison: changerSaison, traverser: traverser,
    feuEn: feuEn, feuAllume: feuAllume, allumer: allumer, destinations: destinations, voyager: voyager, monterTour: monterTour, trocsRestants: trocsRestants, PRIX_CARTE: PRIX_CARTE,
    ouvrirCoffreT: ouvrirCoffreT, infoTerres: infoTerres, dansTerres: dansTerres, regions: regions, regionDe: regionDe, partVueTerres: partVueTerres
  };
})();
if (typeof module !== 'undefined') module.exports = VL;
