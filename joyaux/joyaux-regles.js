// ================== 7 PILIERS (ex « Les 7 joyaux ») : moteur de règles (version maison d'un jeu de draft de cartes et de cités) ==================
// Testable avec Node (module.exports). Chaque joueur bâtit sa cité en 3 âges : à chaque tour, tout le monde choisit EN MÊME TEMPS
// une carte de sa main (la construire, s'en servir pour bâtir une étape de sa merveille (ex « joyau » : nom interne gardé), ou la vendre 3 pièces), puis passe le reste
// à son voisin. Ressources achetées aux deux voisins, conflits entre voisins à la fin de chaque âge, décompte final.
// Noms, cartes et valeurs maison : rien n'est recopié d'un jeu du commerce.
var SJ = (function () {
  // ---------- Ressources et symboles ----------
  var RES = {
    B: { nom: 'Bois', ico: '🪵' }, P: { nom: 'Pierre', ico: '🪨' }, A: { nom: 'Argile', ico: '🧱' }, M: { nom: 'Minerai', ico: '⛏️' },
    V: { nom: 'Verre', ico: '🔮' }, T: { nom: 'Tissu', ico: '🧵' }, R: { nom: 'Parchemin', ico: '📜' }
  };
  var MATIERES = 'BPAM', OBJETS = 'VTR';
  var SCIENCES = { compas: '📐', roue: '⚙️', tablette: '📖' };
  var TYPES = {
    brun: { nom: 'Matières', coul: '#8d6e4f' }, gris: { nom: 'Ateliers', coul: '#7f8c99' }, bleu: { nom: 'Monuments', coul: '#2c7be5' },
    jaune: { nom: 'Commerce', coul: '#d9a400' }, rouge: { nom: 'Armée', coul: '#d64541' }, vert: { nom: 'Savoir', coul: '#2e9e6b' },
    violet: { nom: 'Guildes', coul: '#8e44ad' }
  };
  var VICTOIRE = { 1: 1, 2: 3, 3: 5 };   // points d'une victoire militaire selon l'âge (défaite : −1)
  var MAIN = 7, TOURS = 6, PIECES_DEPART = 3, VENTE = 3;

  // ---------- Les cartes du jeu de base, 1re édition (2010) : coûts, effets, exemplaires et chaînages d'origine, noms de la boîte française ----------
  // (2.82, demandé par l'utilisateur pour un jeu équilibré, appli désormais réservée à un cercle privé ; valeurs reprises de mémoire, à vérifier avec la boîte)
  // [id, nom, âge, type, coût (lettres = ressources, chiffre = pièces), nombres de joueurs, effet, gratuite si l'on a…]
  // Identifiants internes d'avant gardés (sauvegardes) : seuls les noms et quelques valeurs ont changé.
  // « n » : la carte entre dans le paquet à partir de ce nombre de joueurs (une fois par valeur : [3, 6] = 1 exemplaire à 3-5, 2 à 6-7)
  var LISTE = [
    // ÂGE I
    ['coupe', 'Chantier', 1, 'brun', '', [3, 4], { prod: 'B' }],
    ['carriere', 'Cavité', 1, 'brun', '', [3, 5], { prod: 'P' }],
    ['glaisiere', 'Bassin argileux', 1, 'brun', '', [3, 5], { prod: 'A' }],
    ['filon', 'Filon', 1, 'brun', '', [3, 4], { prod: 'M' }],
    ['terrier', 'Fosse argileuse', 1, 'brun', '1', [3], { prod: 'A/M' }],
    ['lisiere', 'Exploitation forestière', 1, 'brun', '1', [3], { prod: 'P/B' }],
    ['eboulis', 'Excavation', 1, 'brun', '1', [4], { prod: 'P/A' }],
    ['falaise', 'Gisement', 1, 'brun', '1', [5], { prod: 'B/M' }],
    ['sousbois', 'Friche', 1, 'brun', '1', [6], { prod: 'B/A' }],
    ['gisement', 'Mine', 1, 'brun', '1', [6], { prod: 'M/P' }],
    ['verrerie', 'Verrerie', 1, 'gris', '', [3, 6], { prod: 'V' }],
    ['tissage', 'Métier à tisser', 1, 'gris', '', [3, 6], { prod: 'T' }],
    ['parcheminerie', 'Presse', 1, 'gris', '', [3, 6], { prod: 'R' }],
    ['fontaine', 'Bains', 1, 'bleu', 'P', [3, 7], { pts: 3 }],
    ['autel', 'Autel', 1, 'bleu', '', [3, 5], { pts: 2 }],
    ['kiosque', 'Théâtre', 1, 'bleu', '', [3, 6], { pts: 2 }],
    ['bijouterie', 'Prêteur sur gages', 1, 'bleu', '', [4, 7], { pts: 3 }],
    ['taverne', 'Taverne', 1, 'jaune', '', [4, 5, 7], { pieces: 5 }],
    ['comptoirO', 'Comptoir ouest', 1, 'jaune', '', [3, 7], { comptoir: 'g' }],
    ['comptoirE', 'Comptoir est', 1, 'jaune', '', [3, 7], { comptoir: 'd' }],
    ['marche', 'Marché', 1, 'jaune', '', [3, 6], { marche: true }],
    ['palissade', 'Palissade', 1, 'rouge', 'B', [3, 7], { boucliers: 1 }],
    ['caserne', 'Caserne', 1, 'rouge', 'M', [3, 5], { boucliers: 1 }],
    ['tourguet', 'Tour de garde', 1, 'rouge', 'A', [3, 4], { boucliers: 1 }],
    ['infirmerie', 'Officine', 1, 'vert', 'T', [3, 5], { sci: 'compas' }],
    ['atelier', 'Atelier', 1, 'vert', 'V', [3, 7], { sci: 'roue' }],
    ['scriptorium', 'Scriptorium', 1, 'vert', 'R', [3, 4], { sci: 'tablette' }],
    // ÂGE II
    ['scierie', 'Scierie', 2, 'brun', '1', [3, 4], { prod: 'BB' }],
    ['taille', 'Carrière', 2, 'brun', '1', [3, 4], { prod: 'PP' }],
    ['briqueterie', 'Briqueterie', 2, 'brun', '1', [3, 4], { prod: 'AA' }],
    ['fonderie', 'Fonderie', 2, 'brun', '1', [3, 4], { prod: 'MM' }],
    ['verrerie2', 'Verrerie', 2, 'gris', '', [3, 5], { prod: 'V' }],
    ['tissage2', 'Métier à tisser', 2, 'gris', '', [3, 5], { prod: 'T' }],
    ['parcheminerie2', 'Presse', 2, 'gris', '', [3, 5], { prod: 'R' }],
    ['aqueduc', 'Aqueduc', 2, 'bleu', 'PPP', [3, 7], { pts: 5 }, 'fontaine'],
    ['temple', 'Temple', 2, 'bleu', 'BAV', [3, 6], { pts: 3 }, 'autel'],
    ['statue', 'Statue', 2, 'bleu', 'MMB', [3, 7], { pts: 4 }, 'kiosque'],
    ['tribunal', 'Tribunal', 2, 'bleu', 'AAT', [3, 5], { pts: 4 }, 'scriptorium'],
    ['forum', 'Forum', 2, 'jaune', 'AA', [3, 6, 7], { choix: 'V/T/R' }, 'comptoirO|comptoirE'],
    ['caravanserail', 'Caravansérail', 2, 'jaune', 'BB', [3, 5, 6], { choix: 'B/P/A/M' }, 'marche'],
    ['vignoble', 'Vignoble', 2, 'jaune', '', [3, 6], { gain: { type: 'brun', pieces: 1 } }],
    ['bazar', 'Bazar', 2, 'jaune', '', [4, 7], { gain: { type: 'gris', pieces: 2 } }],
    ['murailles', 'Muraille', 2, 'rouge', 'PPP', [3, 7], { boucliers: 2 }],
    ['ecuries', 'Écuries', 2, 'rouge', 'ABM', [3, 5], { boucliers: 2 }, 'infirmerie'],
    ['champtir', 'Champ de tir', 2, 'rouge', 'BBM', [3, 6], { boucliers: 2 }, 'atelier'],
    ['entrainement', 'Place d\'armes', 2, 'rouge', 'MMB', [4, 6, 7], { boucliers: 2 }],
    ['dispensaire', 'Dispensaire', 2, 'vert', 'MMV', [3, 4], { sci: 'compas' }, 'infirmerie'],
    ['laboratoire', 'Laboratoire', 2, 'vert', 'AAR', [3, 5], { sci: 'roue' }, 'atelier'],
    ['bibliotheque', 'Bibliothèque', 2, 'vert', 'PPT', [3, 6], { sci: 'tablette' }, 'scriptorium'],
    ['ecole', 'École', 2, 'vert', 'BR', [3, 7], { sci: 'tablette' }],
    // ÂGE III
    ['pantheon', 'Panthéon', 3, 'bleu', 'AAMTRV', [3, 6], { pts: 7 }, 'temple'],
    ['jardins', 'Jardins', 3, 'bleu', 'AAB', [3, 4], { pts: 5 }, 'statue'],
    ['hotelville', 'Hôtel de ville', 3, 'bleu', 'PPMV', [3, 5, 6], { pts: 6 }],
    ['palais', 'Palais', 3, 'bleu', 'BPAMVTR', [3, 7], { pts: 8 }],
    ['senat', 'Sénat', 3, 'bleu', 'BBPM', [3, 5], { pts: 6 }, 'bibliotheque'],
    ['phare', 'Phare', 3, 'jaune', 'VP', [3, 6], { fin: { type: 'jaune', pieces: 1, pts: 1 } }, 'caravanserail'],
    ['port', 'Port', 3, 'jaune', 'BMT', [3, 4], { fin: { type: 'brun', pieces: 1, pts: 1 } }, 'forum'],
    ['chambre', 'Chambre de commerce', 3, 'jaune', 'AAR', [4, 6], { fin: { type: 'gris', pieces: 2, pts: 2 } }],
    ['arene', 'Arène', 3, 'jaune', 'PPM', [3, 5, 7], { fin: { type: 'joyau', pieces: 3, pts: 1 } }, 'dispensaire'],
    ['fortifications', 'Fortifications', 3, 'rouge', 'MMMP', [3, 7], { boucliers: 3 }, 'murailles'],
    ['cirque', 'Cirque', 3, 'rouge', 'PPPM', [4, 5, 6], { boucliers: 3 }, 'entrainement'],
    ['arsenal', 'Arsenal', 3, 'rouge', 'BBMT', [3, 4, 7], { boucliers: 3 }],
    ['siege', 'Atelier de siège', 3, 'rouge', 'AAAB', [3, 5], { boucliers: 3 }, 'laboratoire'],
    ['loge', 'Loge', 3, 'vert', 'AATR', [3, 6], { sci: 'compas' }, 'dispensaire'],
    ['observatoire', 'Observatoire', 3, 'vert', 'MMVT', [3, 7], { sci: 'roue' }, 'laboratoire'],
    ['universite', 'Université', 3, 'vert', 'BBRV', [3, 4], { sci: 'tablette' }, 'bibliotheque'],
    ['academie', 'Académie', 3, 'vert', 'PPPV', [3, 7], { sci: 'compas' }, 'ecole'],
    ['etudes', 'Étude', 3, 'vert', 'BRT', [3, 5], { sci: 'roue' }, 'ecole'],
    // GUILDES (âge III) : on en tire au hasard le nombre de joueurs + 2
    ['g-ouvriers', 'Guilde des travailleurs', 3, 'violet', 'MMAPB', null, { guilde: { types: ['brun'], qui: 'v', pts: 1 } }],
    ['g-artisans', 'Guilde des artisans', 3, 'violet', 'MMPP', null, { guilde: { types: ['gris'], qui: 'v', pts: 2 } }],
    ['g-marchands', 'Guilde des commerçants', 3, 'violet', 'VTR', null, { guilde: { types: ['jaune'], qui: 'v', pts: 1 } }],
    ['g-philosophes', 'Guilde des philosophes', 3, 'violet', 'AAATR', null, { guilde: { types: ['vert'], qui: 'v', pts: 1 } }],
    ['g-espions', 'Guilde des espions', 3, 'violet', 'AAAV', null, { guilde: { types: ['rouge'], qui: 'v', pts: 1 } }],
    ['g-magistrats', 'Guilde des magistrats', 3, 'violet', 'BBBPT', null, { guilde: { types: ['bleu'], qui: 'v', pts: 1 } }],
    ['g-batisseurs', 'Guilde des bâtisseurs', 3, 'violet', 'PPAAV', null, { guilde: { types: ['joyau'], qui: 'sv', pts: 1 } }],
    ['g-armateurs', 'Guilde des armateurs', 3, 'violet', 'BBBVR', null, { guilde: { types: ['brun', 'gris', 'violet'], qui: 's', pts: 1 } }],
    ['g-savants', 'Guilde des scientifiques', 3, 'violet', 'BBMMR', null, { sci: '*' }],
    ['g-strateges', 'Guilde des stratèges', 3, 'violet', 'MMPT', null, { guilde: { types: ['defaite'], qui: 'v', pts: 1 } }]
  ];
  var CARTES = {};
  LISTE.forEach(l => {
    var cout = l[4] || '', pieces = +(cout.replace(/[^0-9]/g, '') || 0);
    CARTES[l[0]] = { id: l[0], nom: l[1], age: l[2], type: l[3], cout: cout.replace(/[0-9]/g, ''), pieces: pieces, n: l[5], effet: l[6], chaine: l[7] ? l[7].split('|') : [] };
  });

  // ---------- Les 7 merveilles, faces A et B (1re édition) ----------
  // Clés internes historiques (saphir, rubis…) gardées pour les sauvegardes. Une étape peut tout cumuler :
  //   pts, pieces, boucliers, prod ('B/P/A/M' ou 'V/T/R' : une ressource au choix, réservée à soi), sci ('*'), comptoir ('gd' : matières à 1 chez les deux voisins),
  //   gratuit (une carte gratuite par âge), defausse (construire gratuitement une carte de la défausse), septieme (jouer aussi la 7e carte de chaque âge),
  //   guilde (copier en fin de partie une guilde d'un voisin)
  var JOYAUX = {
    saphir: { nom: 'Le Phare d\'Alexandrie', ville: 'Alexandrie', ico: '🗼', coul: '#2c6fd6', base: 'V',
      A: [{ cout: 'PP', pts: 3 }, { cout: 'MM', prod: 'B/P/A/M' }, { cout: 'VV', pts: 7 }],
      B: [{ cout: 'AA', prod: 'B/P/A/M' }, { cout: 'BB', prod: 'V/T/R' }, { cout: 'PPP', pts: 7 }] },
    rubis: { nom: 'Le Colosse de Rhodes', ville: 'Rhodes', ico: '🗿', coul: '#c0392b', base: 'M',
      A: [{ cout: 'BB', pts: 3 }, { cout: 'AAA', boucliers: 2 }, { cout: 'MMMM', pts: 7 }],
      B: [{ cout: 'PPP', boucliers: 1, pieces: 3, pts: 3 }, { cout: 'MMMM', boucliers: 1, pieces: 4, pts: 4 }] },
    emeraude: { nom: 'Le Temple d\'Artémis', ville: 'Éphèse', ico: '🏛️', coul: '#1e8e5a', base: 'R',
      A: [{ cout: 'PP', pts: 3 }, { cout: 'BB', pieces: 9 }, { cout: 'RR', pts: 7 }],
      B: [{ cout: 'PP', pieces: 4, pts: 2 }, { cout: 'BB', pieces: 4, pts: 3 }, { cout: 'RTV', pieces: 4, pts: 5 }] },
    ambre: { nom: 'La Grande Pyramide', ville: 'Gizeh', ico: '🔺', coul: '#d68910', base: 'P',
      A: [{ cout: 'PP', pts: 3 }, { cout: 'BBB', pts: 5 }, { cout: 'PPPP', pts: 7 }],
      B: [{ cout: 'BB', pts: 3 }, { cout: 'PPP', pts: 5 }, { cout: 'AAA', pts: 5 }, { cout: 'PPPPR', pts: 7 }] },
    opale: { nom: 'Le Mausolée d\'Halicarnasse', ville: 'Halicarnasse', ico: '⚱️', coul: '#8a9bb0', base: 'T',
      A: [{ cout: 'AA', pts: 3 }, { cout: 'MMM', defausse: true }, { cout: 'TT', pts: 7 }],
      B: [{ cout: 'MM', pts: 2, defausse: true }, { cout: 'AAA', pts: 1, defausse: true }, { cout: 'VRT', defausse: true }] },
    jade: { nom: 'Les Jardins de Babylone', ville: 'Babylone', ico: '🌿', coul: '#4f9a3a', base: 'A',
      A: [{ cout: 'AA', pts: 3 }, { cout: 'BBB', sci: '*' }, { cout: 'AAAA', pts: 7 }],
      B: [{ cout: 'AT', pts: 3 }, { cout: 'BBV', septieme: true }, { cout: 'AAAR', sci: '*' }] },
    amethyste: { nom: 'La Statue de Zeus', ville: 'Olympie', ico: '⚡', coul: '#7d3c98', base: 'B',
      A: [{ cout: 'BB', pts: 3 }, { cout: 'PP', gratuit: true }, { cout: 'MM', pts: 7 }],
      B: [{ cout: 'BB', comptoir: 'gd' }, { cout: 'PP', pts: 5 }, { cout: 'MMT', guilde: true }] }
  };
  // Les étapes de la merveille d'une cité (selon sa face ; les parties d'avant 2.82 n'ont pas de face : A)
  function etapesDe(cite) { var J = JOYAUX[cite.joyau]; return J[cite.face === 'B' ? 'B' : 'A']; }
  function faites(cite) { return etapesDe(cite).slice(0, cite.etapes); }

  // ---------- Hasard reproductible ou non ----------
  function melanger(t, h) { h = h || Math.random; t = t.slice(); for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(h() * (i + 1)), x = t[i]; t[i] = t[j]; t[j] = x; } return t; }

  // Le paquet d'un âge pour n joueurs (7 cartes chacun)
  function paquet(age, n, h) {
    var l = [];
    LISTE.forEach(c => { if (c[2] === age && c[5]) c[5].forEach(m => { if (n >= m) l.push(c[0]); }); });
    if (age === 3) l = l.concat(melanger(LISTE.filter(c => !c[5]).map(c => c[0]), h).slice(0, n + 2));
    return melanger(l, h);
  }

  // ---------- Partie ----------
  // opts.faces : 'A', 'B' ou 'hasard' (chaque cité tire sa face) ; A par défaut
  function nouvellePartie(joueurs, h, opts) {
    h = h || Math.random; opts = opts || {};
    var n = joueurs.length, js = melanger(Object.keys(JOYAUX), h);
    if (n < 3 || n > 7) throw new Error('De 3 à 7 joueurs');
    var e = { joueurs: joueurs.slice(), n: n, age: 1, tour: 1, phase: 'jeu', mains: {}, cites: {}, choix: {}, defausse: [], journal: [], coups: {}, conflits: null, scores: null };
    e.faces = opts.faces === 'B' || opts.faces === 'hasard' ? opts.faces : 'A';
    joueurs.forEach((j, i) => { e.cites[j] = { cartes: [], pieces: PIECES_DEPART, joyau: js[i], face: e.faces === 'hasard' ? (h() < 0.5 ? 'A' : 'B') : e.faces, etapes: 0, militaire: [], gratuitAge: 0 }; });
    distribuer(e, h);
    journal(e, 'Âge I : chacun reçoit 7 cartes.');
    return e;
  }
  function distribuer(e, h) {
    var p = paquet(e.age, e.n, h);
    e.joueurs.forEach((j, i) => { e.mains[j] = p.slice(i * MAIN, (i + 1) * MAIN); });
  }
  function journal(e, txt) { e.journal.push(txt); if (e.journal.length > 12) e.journal.shift(); }
  function gauche(e, j) { var i = e.joueurs.indexOf(j); return e.joueurs[(i + e.n - 1) % e.n]; }
  function droite(e, j) { var i = e.joueurs.indexOf(j); return e.joueurs[(i + 1) % e.n]; }

  // ---------- Ce que produit une cité ----------
  // Sources : chacune donne UNE ressource parmi ses options. vendable : les voisins peuvent l'acheter (cartes marron et grises, ressource du joyau)
  function sources(cite, vendablesSeulement) {
    var s = [{ o: [JOYAUX[cite.joyau].base], v: true }];
    cite.cartes.forEach(id => {
      var c = CARTES[id], f = c.effet;
      if (f.prod) {
        if (f.prod.indexOf('/') >= 0) s.push({ o: f.prod.split('/'), v: true });
        else f.prod.split('').forEach(r => s.push({ o: [r], v: true }));
      }
      if (f.choix) s.push({ o: f.choix.split('/'), v: false });
    });
    faites(cite).forEach(t => { if (t.prod) s.push({ o: t.prod.split('/'), v: false }); });
    return vendablesSeulement ? s.filter(x => x.v) : s;
  }
  // Prix d'une ressource achetée à un voisin (côté 'g' ou 'd')
  function prix(cite, cote, r) {
    var reduitMat = cite.cartes.some(id => CARTES[id].effet.comptoir === cote) || faites(cite).some(t => t.comptoir);
    var reduitObj = cite.cartes.some(id => CARTES[id].effet.marche);
    return (MATIERES.indexOf(r) >= 0 ? reduitMat : reduitObj) ? 1 : 2;
  }
  // Le paiement le moins cher d'un coût en ressources : { ok, g, d } (pièces à verser à chaque voisin), ou { ok: false }
  function payer(e, j, cout) {
    if (!cout) return { ok: true, g: 0, d: 0, ag: '', ad: '' };
    var cite = e.cites[j], cg = e.cites[gauche(e, j)], cd = e.cites[droite(e, j)];
    var besoin = cout.split('').sort();
    var mien = sources(cite, false), sg = sources(cg, true), sd = sources(cd, true);
    // Ressources que je ne peux pas avoir du tout : inutile de chercher
    var dispo = mien.concat(sg, sd);
    if (besoin.some(r => !dispo.some(x => x.o.indexOf(r) >= 0))) return { ok: false };
    var pg = {}, pd = {};
    'BPAMVTR'.split('').forEach(r => { pg[r] = prix(cite, 'g', r); pd[r] = prix(cite, 'd', r); });
    var meilleur = null, usM = mien.map(() => false), usG = sg.map(() => false), usD = sd.map(() => false), max = cite.pieces;
    var achG = [], achD = [];   // ce qu'on achète à chaque voisin (pour l'afficher : « ◀ Lucien : 🪵 »)
    function chercher(k, g, d) {
      if (g + d > max || (meilleur && g + d >= meilleur.g + meilleur.d)) return;
      if (k === besoin.length) { meilleur = { ok: true, g: g, d: d, ag: achG.join(''), ad: achD.join('') }; return; }
      var r = besoin[k], i;
      for (i = 0; i < mien.length; i++) if (!usM[i] && mien[i].o.indexOf(r) >= 0) { usM[i] = true; chercher(k + 1, g, d); usM[i] = false; if (meilleur && meilleur.g + meilleur.d === g + d) return; }
      for (i = 0; i < sg.length; i++) if (!usG[i] && sg[i].o.indexOf(r) >= 0) { usG[i] = true; achG.push(r); chercher(k + 1, g + pg[r], d); achG.pop(); usG[i] = false; }
      for (i = 0; i < sd.length; i++) if (!usD[i] && sd[i].o.indexOf(r) >= 0) { usD[i] = true; achD.push(r); chercher(k + 1, g, d + pd[r]); achD.pop(); usD[i] = false; }
    }
    chercher(0, 0, 0);
    return meilleur || { ok: false, cher: true };
  }
  function aDeja(cite, id) { var nom = CARTES[id].nom; return cite.cartes.some(x => CARTES[x].nom === nom); }
  // Comment je peux jouer cette carte : { construire: { ok, gratuit, g, d, pieces, raison }, joyau: {…}, vendre: true, gratuit: bool }
  function options(e, j, id) {
    var cite = e.cites[j], c = CARTES[id], r = { vendre: true };
    if (aDeja(cite, id)) r.construire = { ok: false, raison: 'Déjà dans ta cité' };
    else if (c.chaine.some(x => cite.cartes.indexOf(x) >= 0)) r.construire = { ok: true, chaine: true, g: 0, d: 0, pieces: 0 };
    else if (c.pieces > cite.pieces) r.construire = { ok: false, raison: 'Pas assez de pièces' };
    else {
      var p = payer(e, j, c.cout);
      // Les pièces du coût de la carte et celles des voisins sortent de la même bourse
      if (p.ok && p.g + p.d + c.pieces > cite.pieces) p = { ok: false, cher: true };
      r.construire = p.ok ? { ok: true, g: p.g, d: p.d, ag: p.ag, ad: p.ad, pieces: c.pieces } : { ok: false, raison: p.cher ? 'Trop cher' : 'Ressources introuvables' };
    }
    var et = etapesDe(cite);
    if (cite.etapes >= et.length) r.joyau = { ok: false, raison: 'Merveille terminée' };
    else { var q = payer(e, j, et[cite.etapes].cout); r.joyau = q.ok ? { ok: true, g: q.g, d: q.d, ag: q.ag, ad: q.ad, pieces: 0 } : { ok: false, raison: q.cher ? 'Trop cher' : 'Ressources introuvables' }; }
    r.gratuit = !aDeja(cite, id) && faites(cite).some(t => t.gratuit) && cite.gratuitAge !== e.age;
    return r;
  }

  // ---------- Choisir (en même temps) ----------
  // action : { i (place dans la main), type: 'construire' | 'joyau' | 'vendre' | 'gratuit' }
  function choisir(e, j, action) {
    if (e.phase !== 'jeu' || !e.mains[j] || participants(e).indexOf(j) < 0) return 'La partie n\'attend rien de toi.';
    var main = e.mains[j], id = main[action.i];
    if (!id) return 'Carte inconnue.';
    var o = options(e, j, id);
    if (action.type === 'construire' && !o.construire.ok) return o.construire.raison;
    if (action.type === 'joyau' && !o.joyau.ok) return o.joyau.raison;
    if (action.type === 'gratuit' && !o.gratuit) return 'Pas de construction gratuite possible.';
    if (['construire', 'joyau', 'vendre', 'gratuit'].indexOf(action.type) < 0) return 'Action inconnue.';
    e.choix[j] = { i: action.i, type: action.type, id: id };
    return null;
  }
  function annuler(e, j) { if (e.phase === 'jeu') delete e.choix[j]; }
  function participants(e) { return e.seuls || e.joueurs; }
  function tousOntChoisi(e) { return e.phase === 'jeu' && participants(e).every(j => e.choix[j]); }

  // ---------- Tout le monde a choisi : on révèle et on joue ----------
  function compter(e, j, type) {
    var cite = e.cites[j];
    if (type === 'joyau') return cite.etapes;
    if (type === 'defaite') return cite.militaire.filter(x => x < 0).length;
    return cite.cartes.filter(id => CARTES[id].type === type).length;
  }
  function resoudre(e, h) {
    if (!tousOntChoisi(e)) return false;
    var qui = participants(e), verse = {}, gains = {}, mausolee = [];
    e.coups = {};
    e.nTour = (e.nTour || 0) + 1;   // numéro de révélation : la page montre alors ce qu'a joué chacun
    e.coupsDe = { age: e.age, tour: e.seuls ? 7 : e.tour };   // à quel tour ces coups appartiennent (7 = la 7e carte de Babylone)
    e.joueurs.forEach(j => { verse[j] = 0; gains[j] = 0; });
    // 1. Chacun paie et pose (sur l'état du début du tour : c'est simultané)
    var poses = qui.map(j => {
      var ch = e.choix[j], cite = e.cites[j], c = CARTES[ch.id], o = options(e, j, ch.id), coup = { type: ch.type, id: ch.id };
      if (ch.type === 'construire' && o.construire.ok) {
        var p = o.construire;
        cite.pieces -= p.pieces + p.g + p.d; verse[gauche(e, j)] += p.g; verse[droite(e, j)] += p.d;
        coup.g = p.g; coup.d = p.d; coup.chaine = !!p.chaine;
      } else if (ch.type === 'joyau' && o.joyau.ok) {
        var q = o.joyau;
        cite.pieces -= q.g + q.d; verse[gauche(e, j)] += q.g; verse[droite(e, j)] += q.d;
        coup.g = q.g; coup.d = q.d;
      } else if (ch.type === 'gratuit' && o.gratuit) {
        cite.gratuitAge = e.age;
      } else { coup.type = 'vendre'; }
      if (e.seuls) coup.septieme = true;
      e.coups[j] = coup;
      return { j: j, coup: coup, c: c };
    });
    poses.forEach(x => {
      var cite = e.cites[x.j];
      e.mains[x.j].splice(e.choix[x.j].i, 1);
      if (x.coup.type === 'construire' || x.coup.type === 'gratuit') cite.cartes.push(x.c.id);
      else if (x.coup.type === 'joyau') {
        var t = etapesDe(cite)[cite.etapes];
        cite.etapes++;
        x.coup.etape = cite.etapes;
        if (t.pieces) gains[x.j] += t.pieces;
        if (t.defausse) mausolee.push(x.j);
      } else { gains[x.j] += VENTE; e.defausse.push(x.c.id); }
    });
    // 2. Les pièces que rapportent les cartes jaunes posées ce tour-ci (en comptant ce qui vient d'être construit)
    poses.forEach(x => {
      if (x.coup.type !== 'construire' && x.coup.type !== 'gratuit') return;
      var f = x.c.effet, j = x.j;
      if (f.pieces) gains[j] += f.pieces;
      if (f.gain) gains[j] += f.gain.pieces * (compter(e, j, f.gain.type) + compter(e, gauche(e, j), f.gain.type) + compter(e, droite(e, j), f.gain.type));
      if (f.fin) gains[j] += f.fin.pieces * compter(e, j, f.fin.type);
    });
    e.joueurs.forEach(j => { e.cites[j].pieces += verse[j] + gains[j]; if (e.coups[j]) e.coups[j].recu = verse[j] + gains[j]; });
    e.choix = {};
    // 3. Le Mausolée : construire gratuitement une carte de la défausse (s'il y en a une), avant la suite
    e.attente = mausolee.filter(j => e.defausse.some(id => !aDeja(e.cites[j], id))).map(j => ({ type: 'mausolee', j: j }));
    if (e.attente.length) { e.phase = 'pouvoir'; e.attenteSuite = true; return true; }
    e.attente = null;
    suite(e, h);
    return true;
  }
  // Après un tour : passer sa main, ou la 7e carte (Babylone, face B), ou fin de l'âge
  function suite(e, h) {
    var avaitSeuls = !!e.seuls;
    e.seuls = null; e.attenteSuite = false; e.phase = 'jeu';
    if (e.tour < TOURS) {
      var anciennes = {}; e.joueurs.forEach(j => { anciennes[j] = e.mains[j]; });
      e.joueurs.forEach(j => { e.mains[j] = anciennes[e.age === 2 ? gauche(e, j) : droite(e, j)]; });
      e.tour++;
      return;
    }
    if (!avaitSeuls) {
      var sept = e.joueurs.filter(j => e.mains[j].length && faites(e.cites[j]).some(t => t.septieme));
      if (sept.length) { e.seuls = sept; journal(e, 'Babylone joue sa 7e carte.'); return; }
    }
    finAge(e, h);
  }
  // Pouvoir du Mausolée : id d'une carte de la défausse à construire gratuitement (ou null pour passer)
  function pouvoir(e, j, id, h) {
    var a = e.attente && e.attente[0];
    if (e.phase !== 'pouvoir' || !a || a.j !== j) return 'Rien à faire pour toi.';
    if (id) {
      var k = e.defausse.indexOf(id);
      if (k < 0) return 'Cette carte n\'est pas dans la défausse.';
      if (aDeja(e.cites[j], id)) return 'Déjà dans ta cité.';
      e.defausse.splice(k, 1);
      var cite = e.cites[j], f = CARTES[id].effet;
      cite.cartes.push(id);
      if (f.pieces) cite.pieces += f.pieces;
      if (f.gain) cite.pieces += f.gain.pieces * (compter(e, j, f.gain.type) + compter(e, gauche(e, j), f.gain.type) + compter(e, droite(e, j), f.gain.type));
      if (f.fin) cite.pieces += f.fin.pieces * compter(e, j, f.fin.type);
      if (e.coups[j]) e.coups[j].defausse = id;
      journal(e, j + ' construit « ' + CARTES[id].nom + ' » depuis la défausse.');
    }
    e.attente.shift();
    if (!e.attente.length) { e.attente = null; suite(e, h); }
    return null;
  }
  function boucliers(e, j) {
    var cite = e.cites[j], b = 0;
    cite.cartes.forEach(id => { b += CARTES[id].effet.boucliers || 0; });
    faites(cite).forEach(t => { b += t.boucliers || 0; });
    return b;
  }
  function finAge(e, h) {
    e.joueurs.forEach(j => { e.defausse = e.defausse.concat(e.mains[j]); e.mains[j] = []; });
    // Conflits avec chaque voisin
    var res = {};
    e.joueurs.forEach(j => { res[j] = { b: boucliers(e, j), contre: [] }; });
    e.joueurs.forEach(j => {
      [gauche(e, j), droite(e, j)].forEach((v, k) => {
        var a = res[j].b, b = res[v].b, t = a > b ? VICTOIRE[e.age] : a < b ? -1 : 0;
        if (t) e.cites[j].militaire.push(t);
        res[j].contre.push({ v: v, t: t, b: b });
      });
    });
    e.conflits = { age: e.age, res: res };
    journal(e, 'Fin de l\'âge ' + ['', 'I', 'II', 'III'][e.age] + ' : conflits entre voisins.');
    if (e.age < 3) {
      e.age++; e.tour = 1;
      distribuer(e, h);
      journal(e, 'Âge ' + ['', 'I', 'II', 'III'][e.age] + ' : nouvelles cartes.');
    } else {
      e.phase = 'fin';
      e.scores = {};
      e.joueurs.forEach(j => { e.scores[j] = score(e, j); });
      var cl = e.joueurs.slice().sort((a, b) => e.scores[b].total - e.scores[a].total || e.cites[b].pieces - e.cites[a].pieces);
      e.classement = cl;
      e.vainqueur = cl[0];
      journal(e, '🏆 ' + cl[0] + ' gagne avec ' + e.scores[cl[0]].total + ' points.');
    }
  }

  // ---------- Décompte ----------
  function symboles(e, j) {
    var cite = e.cites[j], s = { compas: 0, roue: 0, tablette: 0, joker: 0 };
    cite.cartes.forEach(id => { var x = CARTES[id].effet.sci; if (x === '*') s.joker++; else if (x) s[x]++; });
    faites(cite).forEach(t => { if (t.sci) s.joker++; });
    return s;
  }
  function pointsScience(s) {
    function v(a, b, c) { return a * a + b * b + c * c + 7 * Math.min(a, b, c); }
    var m = 0;
    (function essai(k, a, b, c) {
      if (!k) { m = Math.max(m, v(a, b, c)); return; }
      essai(k - 1, a + 1, b, c); essai(k - 1, a, b + 1, c); essai(k - 1, a, b, c + 1);
    })(s.joker, s.compas, s.roue, s.tablette);
    return m;
  }
  function score(e, j) {
    var cite = e.cites[j], r = { militaire: 0, pieces: Math.floor(cite.pieces / 3), joyau: 0, monuments: 0, commerce: 0, guildes: 0, savoir: 0 };
    cite.militaire.forEach(t => { r.militaire += t; });
    faites(cite).forEach(t => { r.joyau += t.pts || 0; });
    var voisins = [gauche(e, j), droite(e, j)];
    cite.cartes.forEach(id => {
      var c = CARTES[id], f = c.effet;
      if (c.type === 'bleu') r.monuments += f.pts;
      if (f.fin) r.commerce += f.fin.pts * compter(e, j, f.fin.type);
      if (f.guilde) {
        var g = f.guilde, qui = g.qui === 's' ? [j] : g.qui === 'v' ? voisins : [j].concat(voisins);
        qui.forEach(x => g.types.forEach(t => { r.guildes += g.pts * compter(e, x, t); }));
      }
    });
    // Olympie (face B) : copie en fin de partie la guilde d'un voisin qui lui rapporte le plus
    if (faites(cite).some(t => t.guilde)) {
      var mieux = 0, copie = null, dejaG = cite.cartes.filter(id => CARTES[id].type === 'violet');
      voisins.forEach(v => e.cites[v].cartes.forEach(id => {
        var g = CARTES[id].effet.guilde, gv = 0;
        if (CARTES[id].type !== 'violet' || dejaG.indexOf(id) >= 0) return;
        if (!g) { var s1 = symboles(e, j), avant = pointsScience(s1); s1.joker++; gv = pointsScience(s1) - avant; }
        else { var q = g.qui === 's' ? [j] : g.qui === 'v' ? voisins : [j].concat(voisins); q.forEach(x => g.types.forEach(t => { gv += g.pts * compter(e, x, t); })); }
        if (gv > mieux) { mieux = gv; copie = id; }
      }));
      if (copie) { r.guildes += mieux; r.copie = copie; }
    }
    r.savoir = pointsScience(symboles(e, j));
    r.total = r.militaire + r.pieces + r.joyau + r.monuments + r.commerce + r.guildes + r.savoir;
    return r;
  }

  // ---------- L'ordinateur ----------
  // Il ne voit que sa main et les cités (comme un joueur). Il estime ce que chaque coup lui rapporte.
  function besoinsRessources(e, j) {
    // Ressources qu'on ne produit pas soi-même (pour savoir si une carte marron ou grise est utile)
    var s = sources(e.cites[j], false), manque = {};
    'BPAMVTR'.split('').forEach(r => { var n = s.filter(x => x.o.indexOf(r) >= 0).length; manque[r] = n; });
    return manque;
  }
  function valeur(e, j, id, type, o, h) {
    var c = CARTES[id], f = c.effet, cite = e.cites[j], age = e.age, v = 0;
    var p = type === 'joyau' ? o.joyau : o.construire;
    if (type === 'vendre') return 1.2 + (cite.pieces < 3 ? 1 : 0);
    if (type === 'joyau') {
      var t = etapesDe(cite)[cite.etapes];
      v = (t.pts || 0) * 0.9 + (t.boucliers ? 1.5 + t.boucliers : 0) + (t.pieces ? t.pieces / 3 + 1 : 0) + (t.prod ? 4 - age : 0) + (t.sci ? 4 : 0) + (t.comptoir ? 3 - age : 0)
        + (t.gratuit ? 4 : 0) + (t.defausse ? (e.defausse.length ? 3 : 1) : 0) + (t.septieme ? 4 - age : 0) + (t.guilde ? 3 : 0);
      v += age === 3 ? 1.5 : 0.5;
    } else {
      if (f.pts) v += f.pts * 0.9;
      if (f.prod) {
        var m = besoinsRessources(e, j), utile = f.prod.split(/\/|/).filter(r => r !== '/' && m[r] < (MATIERES.indexOf(r) >= 0 ? 2 : 1)).length;
        v += (age === 1 ? 2.6 : age === 2 ? 1.6 : 0.2) * Math.max(0.4, utile);
      }
      if (f.choix) v += age === 3 ? 0.5 : 2.2;
      if (f.pieces) v += f.pieces / 3 + (cite.pieces < 3 ? 1.5 : 0);
      if (f.comptoir || f.marche) v += age === 1 ? 2 : 0.8;
      if (f.gain) v += 1.6;
      if (f.fin) v += f.fin.pts * compter(e, j, f.fin.type) + 1;
      if (f.boucliers) {
        var moi = boucliers(e, j), autres = Math.max(boucliers(e, gauche(e, j)), boucliers(e, droite(e, j)));
        v += moi <= autres + 1 ? f.boucliers * (1.2 + age * 0.7) : 0.8;
      }
      if (f.sci) {
        var s = symboles(e, j), avant = pointsScience(s);
        if (f.sci === '*') s.joker++; else s[f.sci]++;
        v += (pointsScience(s) - avant) * 0.8 + (age < 3 ? 1.2 : 0);
      }
      if (f.guilde) { var x = Object.assign({}, cite, { cartes: cite.cartes.concat(id) }), e2 = Object.assign({}, e, { cites: Object.assign({}, e.cites) }); e2.cites[j] = x; v += score(e2, j).guildes - score(e, j).guildes; }
      if (c.chaine.length) v += 0.3;
      // Cartes qui en rendent d'autres gratuites plus tard
      if (age < 3 && LISTE.some(l => l[7] && l[7].split('|').indexOf(id) >= 0)) v += 0.8;
      if (type === 'gratuit') v += 1;
    }
    if (p) v -= (p.g + p.d + (p.pieces || 0)) / 3.2;
    return v + (h ? h() * 0.6 : 0);
  }
  function ordinateur(e, j, h) {
    h = h || Math.random;
    var main = e.mains[j], best = null;
    main.forEach((id, i) => {
      var o = options(e, j, id);
      var essais = [['vendre', true], ['construire', o.construire.ok], ['joyau', o.joyau.ok], ['gratuit', o.gratuit && !o.construire.ok]];
      essais.forEach(t => {
        if (!t[1]) return;
        // Une étape de merveille se paie avec la carte la moins utile de la main
        var v = t[0] === 'joyau' ? valeur(e, j, id, 'joyau', o, h) - Math.max(0, valeur(e, j, id, 'construire', o, null)) * 0.35 : valeur(e, j, id, t[0], o, h);
        if (!best || v > best.v) best = { v: v, i: i, type: t[0] };
      });
    });
    return { i: best.i, type: best.type };
  }

  // Mausolée : la carte de la défausse qui rapporte le plus (null s'il n'y en a pas)
  function ordinateurDefausse(e, j) {
    var best = null;
    e.defausse.forEach(id => {
      if (aDeja(e.cites[j], id)) return;
      var v = valeur(e, j, id, 'gratuit', { construire: { ok: true, g: 0, d: 0, pieces: 0 } }, null);
      if (!best || v > best.v) best = { v: v, id: id };
    });
    return best ? best.id : null;
  }

  // ---------- Ce que voit chaque joueur : sa main et les choix des autres (faits ou pas, jamais quoi) ----------
  function vuePour(e, j) {
    var v = JSON.parse(JSON.stringify(e));
    v.mains = {}; v.nbMain = {};
    e.joueurs.forEach(x => { v.nbMain[x] = e.mains[x].length; });
    if (e.mains[j]) v.mains[j] = e.mains[j].slice();
    v.choix = {}; v.aChoisi = {};
    e.joueurs.forEach(x => { v.aChoisi[x] = !!e.choix[x] || participants(e).indexOf(x) < 0; });   // 7e carte : les autres n'ont rien à choisir
    if (e.choix[j]) v.choix[j] = Object.assign({}, e.choix[j]);
    v.defausse = e.attente && e.attente[0] && e.attente[0].j === j ? e.defausse.slice() : [];
    v.nbDefausse = e.defausse.length;
    return v;
  }

  return { RES: RES, SCIENCES: SCIENCES, TYPES: TYPES, CARTES: CARTES, LISTE: LISTE, JOYAUX: JOYAUX, MAIN: MAIN, TOURS: TOURS, VENTE: VENTE,
           paquet: paquet, nouvellePartie: nouvellePartie, gauche: gauche, droite: droite, sources: sources, payer: payer, options: options,
           choisir: choisir, annuler: annuler, tousOntChoisi: tousOntChoisi, resoudre: resoudre, boucliers: boucliers, symboles: symboles,
           pointsScience: pointsScience, score: score, compter: compter, ordinateur: ordinateur, vuePour: vuePour, melanger: melanger,
           etapesDe: etapesDe, faites: faites, participants: participants, pouvoir: pouvoir, ordinateurDefausse: ordinateurDefausse };
})();
if (typeof module !== 'undefined') module.exports = SJ;
