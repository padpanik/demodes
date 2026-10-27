// ================== LES 7 JOYAUX · DUEL : les règles du jeu de cartes à deux d'origine ==================
// Testable avec Node. Moteur autonome (cartes, merveilles, jetons Progrès propres au duel).
// À deux, chacun son tour. Chaque âge : 20 cartes en pyramide (une rangée sur deux face cachée) ; on prend une carte dégagée pour
// la construire, construire une de ses merveilles (la carte glissée dessous) ou la défausser contre des pièces.
// Commerce avec la banque : 2 🪙 + 1 par exemplaire que l'adversaire produit (cartes marron et grises). Piste militaire (victoire
// immédiate au bout), 7 symboles scientifiques (une paire = un jeton Progrès, 6 différents = victoire immédiate).
// Noms français génériques ; visuels dessinés par le code (aucune illustration officielle).
var SD = (function () {
  var VERSION_REGLES = 2;
  var PIECES_DEPART = 7, BOUT = 9, MAX_MERVEILLES = 7;

  // ---------- Ressources ----------
  var RES = { B: 'Bois', A: 'Argile', P: 'Pierre', V: 'Verre', R: 'Papyrus' };
  var MATIERES = 'BAP', PRODUITS = 'VR';

  // ---------- Symboles scientifiques ----------
  var SYMBOLES = { equerre: { nom: 'Équerre', ico: '📐' }, roue: { nom: 'Roue', ico: '⚙️' }, plume: { nom: 'Plume', ico: '🪶' }, mortier: { nom: 'Mortier', ico: '⚗️' },
                   cadran: { nom: 'Cadran solaire', ico: '🕰️' }, astrolabe: { nom: 'Astrolabe', ico: '🌐' }, balance: { nom: 'Loi', ico: '⚖️' } };

  // ---------- Les cartes : [id, nom, âge, type, coût (chiffres = pièces, lettres = ressources), effet, gratuite si l'on a déjà…] ----------
  var LISTE = [
    // ÂGE I (23)
    ['chantier', 'Chantier', 1, 'brun', '', { prod: 'B' }], ['exploitation', 'Exploitation', 1, 'brun', '1', { prod: 'B' }],
    ['bassin', 'Bassin argileux', 1, 'brun', '', { prod: 'A' }], ['cavite', 'Cavité', 1, 'brun', '1', { prod: 'A' }],
    ['gisement', 'Gisement', 1, 'brun', '', { prod: 'P' }], ['mine', 'Mine', 1, 'brun', '1', { prod: 'P' }],
    ['verrerie', 'Verrerie', 1, 'gris', '1', { prod: 'V' }], ['presse', 'Presse', 1, 'gris', '1', { prod: 'R' }],
    ['tourgarde', 'Tour de garde', 1, 'rouge', '', { boucliers: 1 }], ['ecuries', 'Écuries', 1, 'rouge', 'B', { boucliers: 1 }],
    ['caserne', 'Caserne', 1, 'rouge', 'A', { boucliers: 1 }], ['palissade', 'Palissade', 1, 'rouge', '2', { boucliers: 1 }],
    ['atelier', 'Atelier', 1, 'vert', 'R', { sci: 'equerre', pts: 1 }], ['apothicaire', 'Apothicaire', 1, 'vert', 'V', { sci: 'roue', pts: 1 }],
    ['scriptorium', 'Scriptorium', 1, 'vert', '2', { sci: 'plume' }], ['officine', 'Officine', 1, 'vert', '2', { sci: 'mortier' }],
    ['theatre', 'Théâtre', 1, 'bleu', '', { pts: 3 }], ['autel', 'Autel', 1, 'bleu', '', { pts: 3 }], ['bains', 'Bains', 1, 'bleu', 'P', { pts: 3 }],
    ['depotP', 'Dépôt de pierre', 1, 'jaune', '3', { depot: 'P' }], ['depotA', 'Dépôt d\'argile', 1, 'jaune', '3', { depot: 'A' }],
    ['depotB', 'Dépôt de bois', 1, 'jaune', '3', { depot: 'B' }], ['taverne', 'Taverne', 1, 'jaune', '', { pieces: 4 }],
    // ÂGE II (23)
    ['scierie', 'Scierie', 2, 'brun', '2', { prod: 'BB' }], ['briqueterie', 'Briqueterie', 2, 'brun', '2', { prod: 'AA' }],
    ['carriere', 'Carrière', 2, 'brun', '2', { prod: 'PP' }], ['soufflerie', 'Soufflerie', 2, 'gris', '', { prod: 'V' }],
    ['sechoir', 'Séchoir', 2, 'gris', '', { prod: 'R' }],
    ['muraille', 'Muraille', 2, 'rouge', 'PP', { boucliers: 2 }], ['haras', 'Haras', 2, 'rouge', 'AB', { boucliers: 1 }, 'ecuries'],
    ['baraquements', 'Baraquements', 2, 'rouge', '3', { boucliers: 1 }, 'caserne'], ['champtir', 'Champ de tir', 2, 'rouge', 'PBR', { boucliers: 2 }],
    ['placearmes', 'Place d\'armes', 2, 'rouge', 'AAV', { boucliers: 2 }],
    ['bibliotheque', 'Bibliothèque', 2, 'vert', 'PBV', { sci: 'plume', pts: 2 }, 'scriptorium'],
    ['dispensaire', 'Dispensaire', 2, 'vert', 'AAP', { sci: 'mortier', pts: 2 }, 'officine'],
    ['ecole', 'École', 2, 'vert', 'BRR', { sci: 'roue', pts: 1 }], ['laboratoire', 'Laboratoire', 2, 'vert', 'BVV', { sci: 'equerre', pts: 1 }],
    ['tribunal', 'Tribunal', 2, 'bleu', 'BBV', { pts: 5 }], ['statue', 'Statue', 2, 'bleu', 'AA', { pts: 4 }, 'theatre'],
    ['temple', 'Temple', 2, 'bleu', 'BR', { pts: 4 }, 'autel'], ['aqueduc', 'Aqueduc', 2, 'bleu', 'PPP', { pts: 5 }, 'bains'],
    ['rostres', 'Rostres', 2, 'bleu', 'PB', { pts: 4 }],
    ['forum', 'Forum', 2, 'jaune', '3A', { choix: 'V/R' }], ['caravanserail', 'Caravansérail', 2, 'jaune', '2VR', { choix: 'B/A/P' }],
    ['douanes', 'Douanes', 2, 'jaune', '4', { depot: 'VR' }], ['brasserie', 'Brasserie', 2, 'jaune', '', { pieces: 6 }],
    // ÂGE III (20)
    ['arsenal', 'Arsenal', 3, 'rouge', 'AAABB', { boucliers: 3 }], ['pretoire', 'Prétoire', 3, 'rouge', '8', { boucliers: 3 }],
    ['fortifications', 'Fortifications', 3, 'rouge', 'PPAR', { boucliers: 2 }, 'palissade'],
    ['siege', 'Atelier de siège', 3, 'rouge', 'BBBV', { boucliers: 2 }, 'champtir'],
    ['cirque', 'Cirque', 3, 'rouge', 'AAPP', { boucliers: 2 }, 'placearmes'],
    ['academie', 'Académie', 3, 'vert', 'PBVV', { sci: 'cadran', pts: 3 }], ['etude', 'Étude', 3, 'vert', 'BBVR', { sci: 'cadran', pts: 3 }],
    ['universite', 'Université', 3, 'vert', 'AVR', { sci: 'astrolabe', pts: 2 }, 'ecole'],
    ['observatoire', 'Observatoire', 3, 'vert', 'PRR', { sci: 'astrolabe', pts: 2 }, 'laboratoire'],
    ['palais', 'Palais', 3, 'bleu', 'APBVV', { pts: 7 }], ['hotelville', 'Hôtel de ville', 3, 'bleu', 'PPPBB', { pts: 7 }],
    ['obelisque', 'Obélisque', 3, 'bleu', 'PPV', { pts: 5 }], ['jardins', 'Jardins', 3, 'bleu', 'AABB', { pts: 6 }, 'statue'],
    ['pantheon', 'Panthéon', 3, 'bleu', 'ABRR', { pts: 6 }, 'temple'], ['senat', 'Sénat', 3, 'bleu', 'AAPR', { pts: 5 }, 'rostres'],
    ['chambre', 'Chambre de commerce', 3, 'jaune', 'RR', { par: { type: 'gris', pieces: 3 }, pts: 3 }],
    ['port', 'Port', 3, 'jaune', 'BVR', { par: { type: 'brun', pieces: 2 }, pts: 3 }],
    ['armurerie', 'Armurerie', 3, 'jaune', 'PPV', { par: { type: 'rouge', pieces: 1 }, pts: 3 }],
    ['phare', 'Phare', 3, 'jaune', 'AAV', { par: { type: 'jaune', pieces: 1 }, pts: 3 }, 'taverne'],
    ['arene', 'Arène', 3, 'jaune', 'APB', { par: { type: 'merveille', pieces: 2 }, pts: 3 }, 'brasserie'],
    // GUILDES (on en tire 3)
    ['g-marchands', 'Guilde des marchands', 3, 'violet', 'ABVR', { guilde: 'jaune' }],
    ['g-armateurs', 'Guilde des armateurs', 3, 'violet', 'APVR', { guilde: 'brun+gris' }],
    ['g-batisseurs', 'Guilde des bâtisseurs', 3, 'violet', 'PPAABV', { guilde: 'merveille' }],
    ['g-magistrats', 'Guilde des magistrats', 3, 'violet', 'BBAR', { guilde: 'bleu' }],
    ['g-scientifiques', 'Guilde des scientifiques', 3, 'violet', 'AABB', { guilde: 'vert' }],
    ['g-usuriers', 'Guilde des usuriers', 3, 'violet', 'PPBB', { guilde: 'pieces' }],
    ['g-tacticiens', 'Guilde des tacticiens', 3, 'violet', 'PPAR', { guilde: 'rouge' }]
  ];
  var CARTES = {};
  LISTE.forEach(l => {
    var c = l[4] || '';
    CARTES[l[0]] = { id: l[0], nom: l[1], age: l[2], type: l[3], cout: c.replace(/[0-9]/g, ''), pieces: +(c.replace(/[^0-9]/g, '') || 0), effet: l[5], chaine: l[6] || null };
  });
  var TYPES = { brun: 'Matière première', gris: 'Produit manufacturé', bleu: 'Bâtiment civil', jaune: 'Bâtiment commercial', rouge: 'Bâtiment militaire',
                vert: 'Bâtiment scientifique', violet: 'Guilde' };

  // ---------- Les 12 merveilles ----------
  var MERVEILLES = {
    'm-voie': { nom: 'La Voie Appienne', cout: 'PPAAR', pts: 3, pieces: 3, vol: 3, rejouer: true },
    'm-circus': { nom: 'Circus Maximus', cout: 'PPBV', pts: 3, boucliers: 1, detruire: 'gris' },
    'm-colosse': { nom: 'Le Colosse', cout: 'AAAV', pts: 3, boucliers: 2 },
    'm-bibliotheque': { nom: 'La Grande Bibliothèque', cout: 'BBBVR', pts: 4, bibliotheque: true },
    'm-phare': { nom: 'Le Grand Phare', cout: 'BPRR', pts: 4, choix: 'B/P/A' },
    'm-jardins': { nom: 'Les Jardins suspendus', cout: 'BBVR', pts: 3, pieces: 6, rejouer: true },
    'm-mausolee': { nom: 'Le Mausolée', cout: 'AAVVR', pts: 2, mausolee: true },
    'm-piree': { nom: 'Le Pirée', cout: 'BBPA', pts: 2, choix: 'V/R', rejouer: true },
    'm-pyramides': { nom: 'Les Pyramides', cout: 'PPPR', pts: 9 },
    'm-sphinx': { nom: 'Le Sphinx', cout: 'PAVV', pts: 6, rejouer: true },
    'm-zeus': { nom: 'La Statue de Zeus', cout: 'PBARR', pts: 3, boucliers: 1, detruire: 'brun' },
    'm-artemis': { nom: 'Le Temple d\'Artémis', cout: 'BPVR', pts: 0, pieces: 12, rejouer: true }
  };

  // ---------- Les 10 jetons Progrès ----------
  var PROGRES = {
    agriculture: { nom: 'Agriculture', ico: '🌾', txt: '+6 🪙 tout de suite, et 4 points de victoire.' },
    architecture: { nom: 'Architecture', ico: '🏛️', txt: 'Tes prochaines merveilles coûtent 2 ressources de moins (au choix).' },
    economie: { nom: 'Économie', ico: '💰', txt: 'L\'argent que ton adversaire dépense pour acheter des ressources te revient.' },
    loi: { nom: 'Loi', ico: '⚖️', txt: 'Compte comme un symbole scientifique (la balance).' },
    maconnerie: { nom: 'Maçonnerie', ico: '🧱', txt: 'Tes prochains bâtiments bleus coûtent 2 ressources de moins (au choix).' },
    mathematiques: { nom: 'Mathématiques', ico: '🔢', txt: '3 points par jeton Progrès que tu possèdes, celui-ci compris.' },
    philosophie: { nom: 'Philosophie', ico: '🦉', txt: '7 points de victoire.' },
    strategie: { nom: 'Stratégie', ico: '🎖️', txt: 'Chaque nouveau bâtiment militaire (rouge) donne 1 bouclier de plus.' },
    theologie: { nom: 'Théologie', ico: '🕊️', txt: 'Tes prochaines merveilles ont toutes l\'effet « Rejouer ».' },
    urbanisme: { nom: 'Urbanisme', ico: '🏙️', txt: '+6 🪙 tout de suite, puis +4 🪙 à chaque construction gratuite par chaînage.' }
  };

  // ---------- Pyramides : rangées de haut en bas, positions en demi-largeurs de carte ----------
  function rangee(n) { var l = []; for (var k = 0; k < n; k++) l.push(-(n - 1) + 2 * k); return l; }
  var FORMES = {
    1: [rangee(2), rangee(3), rangee(4), rangee(5), rangee(6)],
    2: [rangee(6), rangee(5), rangee(4), rangee(3), rangee(2)],
    3: [rangee(2), rangee(3), rangee(4), [-2, 2], rangee(4), rangee(3), rangee(2)]
  };

  function melanger(t, h) { h = h || Math.random; t = t.slice(); for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(h() * (i + 1)), x = t[i]; t[i] = t[j]; t[j] = x; } return t; }
  // Paquet d'un âge : on écarte 3 cartes au hasard ; âge III : 17 cartes + 3 guildes
  function paquet(age, h) {
    var l = LISTE.filter(x => x[2] === age && x[3] !== 'violet').map(x => x[0]);
    l = melanger(l, h).slice(0, age === 3 ? 17 : 20);
    if (age === 3) l = melanger(l.concat(melanger(LISTE.filter(x => x[3] === 'violet').map(x => x[0]), h).slice(0, 3)), h);
    return l;
  }
  function poserPyramide(e, h) {
    var p = paquet(e.age, h), k = 0;
    e.pyramide = [];
    FORMES[e.age].forEach((xs, r) => xs.forEach(x => { e.pyramide.push({ id: p[k++], r: r, x: x, pris: false, visible: r % 2 === 0 }); }));
  }
  function couvreurs(e, k) { var c = e.pyramide[k]; return e.pyramide.filter(d => !d.pris && d.r === c.r + 1 && Math.abs(d.x - c.x) === 1); }
  function accessible(e, k) { var c = e.pyramide[k]; return !!c && !c.pris && !couvreurs(e, k).length; }
  function decouvrir(e) { e.pyramide.forEach((c, k) => { if (!c.pris && !c.visible && !couvreurs(e, k).length) c.visible = true; }); }

  // ---------- Partie ----------
  // Choix des merveilles : 8 tirées, montrées par 4 ; ordre de choix 1-2-2-1 puis 2-1-1-2
  var ORDRE_CHOIX = [0, 1, 1, 0, 1, 0, 0, 1];
  function nouvellePartie(joueurs, h) {
    h = h || Math.random;
    if (joueurs.length !== 2) throw new Error('Le duel se joue à deux');
    var jt = melanger(Object.keys(PROGRES), h), mv = melanger(Object.keys(MERVEILLES), h);
    var e = { mode: 'duel', regles: VERSION_REGLES, joueurs: joueurs.slice(), age: 1, phase: 'merveilles', tour: 0, militaire: 0, pillage: {},
              jetonsPlateau: jt.slice(0, 5), jetonsBoite: jt.slice(5), offre: mv.slice(0, 4), reserveMerveilles: mv.slice(4, 8), choixMerveille: 0,
              cites: {}, defausse: [], journal: [], dernier: null, attentes: [], rejoue: false, fin: null, scores: null, vainqueur: null };
    joueurs.forEach(j => { e.cites[j] = { cartes: [], pieces: PIECES_DEPART, merveilles: [], jetons: [], paires: {} }; });
    poserPyramide(e, h);
    journal(e, 'Choix des merveilles : ' + joueurs[0] + ' commence.');
    return e;
  }
  function journal(e, t) { e.journal.push(t); if (e.journal.length > 14) e.journal.shift(); }
  function autre(e, j) { return e.joueurs[0] === j ? e.joueurs[1] : e.joueurs[0]; }
  function aJeton(cite, id) { return cite.jetons.indexOf(id) >= 0; }
  function qui(e) {
    if (e.phase === 'fin') return null;
    if (e.attentes.length) return e.attentes[0].j;
    if (e.phase === 'merveilles') return e.joueurs[ORDRE_CHOIX[e.choixMerveille]];
    return e.joueurs[e.tour];
  }
  function merveillesFaites(e) { return e.joueurs.reduce((n, j) => n + e.cites[j].merveilles.filter(m => m.faite).length, 0); }

  // ---------- Production, prix et paiement ----------
  function sources(cite) {
    var s = [];
    cite.cartes.forEach(id => {
      var f = CARTES[id].effet;
      if (f.prod) f.prod.split('').forEach(r => s.push([r]));
      if (f.choix) s.push(f.choix.split('/'));
    });
    cite.merveilles.forEach(m => { if (m.faite && MERVEILLES[m.id].choix) s.push(MERVEILLES[m.id].choix.split('/')); });
    return s;
  }
  // Production « marron et grise » qui fait monter les prix de l'adversaire
  function productionCommerce(cite) {
    var n = {};
    cite.cartes.forEach(id => { var c = CARTES[id]; if ((c.type === 'brun' || c.type === 'gris') && c.effet.prod) c.effet.prod.split('').forEach(r => { n[r] = (n[r] || 0) + 1; }); });
    return n;
  }
  function prix(e, j, r) {
    var cite = e.cites[j];
    if (cite.cartes.some(id => (CARTES[id].effet.depot || '').indexOf(r) >= 0)) return 1;
    return 2 + (productionCommerce(e.cites[autre(e, j)])[r] || 0);
  }
  // Le moins cher : ressources à soi d'abord, le reste à la banque ; « remise » = ressources offertes (les plus chères)
  function payer(e, j, cout, remise) {
    if (!cout) return 0;
    var besoin = cout.split(''), mien = sources(e.cites[j]), us = mien.map(() => false), p = {}, meilleur = null;
    'BAPVR'.split('').forEach(r => { p[r] = prix(e, j, r); });
    (function chercher(k, achats) {
      if (meilleur === 0) return;
      if (k === besoin.length) {
        var t = achats.slice().sort((a, b) => b - a).slice(remise || 0).reduce((a, b) => a + b, 0);
        if (meilleur === null || t < meilleur) meilleur = t;
        return;
      }
      var r = besoin[k];
      for (var i = 0; i < mien.length; i++) if (!us[i] && mien[i].indexOf(r) >= 0) { us[i] = true; chercher(k + 1, achats); us[i] = false; }
      achats.push(p[r]); chercher(k + 1, achats); achats.pop();
    })(0, []);
    return meilleur;
  }
  function venteGain(cite) { return 2 + cite.cartes.filter(id => CARTES[id].type === 'jaune').length; }
  // Ce que je peux faire d'une carte : { construire: { ok, gratuit (chaînage), commerce, total, raison }, vendre, merveilles: [{ id, ok, commerce, raison }] }
  function options(e, j, id) {
    var cite = e.cites[j], c = CARTES[id], r = { vendre: venteGain(cite), merveilles: [] };
    if (c.chaine && cite.cartes.indexOf(c.chaine) >= 0) r.construire = { ok: true, gratuit: true, commerce: 0, total: 0 };
    else {
      var com = payer(e, j, c.cout, c.type === 'bleu' && aJeton(cite, 'maconnerie') ? 2 : 0), t = com + c.pieces;
      r.construire = t <= cite.pieces ? { ok: true, commerce: com, total: t } : { ok: false, commerce: com, total: t, raison: 'Il te manque ' + (t - cite.pieces) + ' 🪙' };
    }
    var plein = merveillesFaites(e) >= MAX_MERVEILLES;
    cite.merveilles.forEach(m => {
      if (m.faite) return;
      if (plein) { r.merveilles.push({ id: m.id, ok: false, raison: '7 merveilles déjà construites' }); return; }
      var t2 = payer(e, j, MERVEILLES[m.id].cout, aJeton(cite, 'architecture') ? 2 : 0);
      r.merveilles.push(t2 <= cite.pieces ? { id: m.id, ok: true, commerce: t2, total: t2 } : { id: m.id, ok: false, commerce: t2, total: t2, raison: 'Il te manque ' + (t2 - cite.pieces) + ' 🪙' });
    });
    return r;
  }

  // ---------- Science ----------
  function symboles(e, j) {
    var cite = e.cites[j], s = {};
    cite.cartes.forEach(id => { var x = CARTES[id].effet.sci; if (x) s[x] = (s[x] || 0) + 1; });
    if (aJeton(cite, 'loi')) s.balance = (s.balance || 0) + 1;
    return s;
  }
  function nbSymboles(e, j) { return Object.keys(symboles(e, j)).length; }

  // ---------- Militaire : militaire > 0 = le pion avance vers la capitale du 2e joueur ----------
  function avancer(e, j, n) {
    if (!n || e.phase === 'fin') return;
    var signe = j === e.joueurs[0] ? 1 : -1, avant = e.militaire, adv = autre(e, j);
    e.militaire = Math.max(-BOUT, Math.min(BOUT, e.militaire + signe * n));
    [[3, 2], [6, 5]].forEach(z => {
      var cle = (signe > 0 ? 'p' : 'n') + z[0];
      if (!e.pillage[cle] && signe * e.militaire >= z[0] && signe * avant < z[0]) {
        e.pillage[cle] = true;
        var perte = Math.min(e.cites[adv].pieces, z[1]);
        e.cites[adv].pieces -= perte;
        journal(e, '⚔️ ' + adv + ' perd ' + perte + ' 🪙 (pillage).');
      }
    });
    if (Math.abs(e.militaire) >= BOUT) terminer(e, j, 'militaire');
  }

  // ---------- Paiements ----------
  function depenser(e, j, total, commerce) {
    e.cites[j].pieces -= total;
    var adv = autre(e, j);
    if (commerce && aJeton(e.cites[adv], 'economie')) e.cites[adv].pieces += commerce;
  }
  function compter(e, j, type) {
    var cite = e.cites[j];
    if (type === 'merveille') return cite.merveilles.filter(m => m.faite).length;
    return cite.cartes.filter(id => CARTES[id].type === type).length;
  }
  // Pour les guildes : le nombre dans la cité qui en a le plus
  function maxCites(e, f) { return Math.max(f(e.joueurs[0]), f(e.joueurs[1])); }
  function compteGuilde(e, g) {
    if (g === 'brun+gris') return maxCites(e, x => compter(e, x, 'brun') + compter(e, x, 'gris'));
    if (g === 'pieces') return maxCites(e, x => e.cites[x].pieces);
    return maxCites(e, x => compter(e, x, g));
  }
  // Une carte entre dans la cité (construite, ou par le Mausolée)
  function entrer(e, j, id) {
    var cite = e.cites[j], f = CARTES[id].effet;
    cite.cartes.push(id);
    if (f.pieces) cite.pieces += f.pieces;
    if (f.par) cite.pieces += f.par.pieces * compter(e, j, f.par.type);
    if (f.guilde && ['pieces', 'merveille'].indexOf(f.guilde) < 0) cite.pieces += compteGuilde(e, f.guilde);
    if (f.boucliers) avancer(e, j, f.boucliers + (aJeton(cite, 'strategie') ? 1 : 0));
    if (f.sci && e.phase !== 'fin') {
      var s = symboles(e, j);
      if (Object.keys(s).length >= 6) return terminer(e, j, 'science');
      // Une paire de symboles identiques : un jeton Progrès (une seule fois par symbole)
      if (s[f.sci] === 2 && !cite.paires[f.sci] && e.jetonsPlateau.length) { cite.paires[f.sci] = true; e.attentes.push({ phase: 'jeton', j: j }); }
    }
  }

  // ---------- Jouer ----------
  // Actions : { type: 'merveille-choix', id } | { type: 'prendre', k, action: 'construire' | 'vendre' | 'merveille', merveille }
  //           { type: 'jeton', id } | { type: 'detruire', id } | { type: 'mausolee', id } | { type: 'debut', j }
  function jouer(e, j, a, h) {
    h = h || Math.random;
    if (e.phase === 'fin') return 'La partie est finie.';
    if (j !== qui(e)) return 'Ce n\'est pas ton tour.';
    // Fenêtres de choix en attente (jeton, destruction, mausolée, grande bibliothèque, premier joueur)
    if (e.attentes.length) {
      var at = e.attentes[0];
      if (at.phase === 'jeton' || at.phase === 'bibliotheque') {
        var liste = at.phase === 'jeton' ? e.jetonsPlateau : at.offre;
        if (a.type !== 'jeton' || liste.indexOf(a.id) < 0) return 'Choisis un jeton Progrès.';
        if (at.phase === 'jeton') e.jetonsPlateau = e.jetonsPlateau.filter(x => x !== a.id);
        else e.jetonsBoite = e.jetonsBoite.filter(x => x !== a.id);
        prendreJeton(e, j, a.id);
      } else if (at.phase === 'detruire') {
        var adv = autre(e, j), c = e.cites[adv];
        if (a.type !== 'detruire' || c.cartes.indexOf(a.id) < 0 || CARTES[a.id].type !== at.couleur) return 'Choisis une carte à défausser.';
        c.cartes.splice(c.cartes.indexOf(a.id), 1);
        e.defausse.push(a.id);
        journal(e, j + ' fait défausser « ' + CARTES[a.id].nom + ' » à ' + adv + '.');
      } else if (at.phase === 'mausolee') {
        if (a.type !== 'mausolee' || e.defausse.indexOf(a.id) < 0) return 'Choisis une carte de la défausse.';
        e.defausse.splice(e.defausse.indexOf(a.id), 1);
        journal(e, j + ' construit « ' + CARTES[a.id].nom + ' » depuis la défausse (gratuitement).');
        entrer(e, j, a.id);
      } else if (at.phase === 'debut') {
        if (a.type !== 'debut' || e.joueurs.indexOf(a.j) < 0) return 'Choisis qui commence.';
        e.tour = e.joueurs.indexOf(a.j);
        journal(e, a.j + ' commence l\'âge ' + ['', 'I', 'II', 'III'][e.age] + '.');
      }
      e.attentes.shift();
      return suite(e, h);
    }
    if (e.phase === 'merveilles') {
      if (a.type !== 'merveille-choix' || e.offre.indexOf(a.id) < 0) return 'Choisis une merveille.';
      e.cites[j].merveilles.push({ id: a.id, faite: false, sous: null });
      e.offre = e.offre.filter(x => x !== a.id);
      journal(e, j + ' prend ' + MERVEILLES[a.id].nom + '.');
      e.choixMerveille++;
      // La 4e merveille d'une série revient d'office au dernier ; puis la deuxième série
      if (e.offre.length === 1) {
        var dernier = e.joueurs[ORDRE_CHOIX[e.choixMerveille]];
        e.cites[dernier].merveilles.push({ id: e.offre[0], faite: false, sous: null });
        journal(e, dernier + ' reçoit ' + MERVEILLES[e.offre[0]].nom + '.');
        e.offre = []; e.choixMerveille++;
        if (e.choixMerveille < 8) e.offre = e.reserveMerveilles.splice(0, 4);
        else { e.phase = 'jeu'; e.tour = 0; journal(e, 'Âge I : ' + e.joueurs[0] + ' commence.'); }
      }
      return null;
    }
    if (a.type !== 'prendre') return 'Prends une carte de la pyramide.';
    var k = +a.k, carte = e.pyramide[k];
    if (!accessible(e, k)) return 'Cette carte est encore recouverte.';
    var id = carte.id, cite = e.cites[j], o = options(e, j, id);
    e.rejoue = false;
    if (a.action === 'construire') {
      if (!o.construire.ok) return o.construire.raison;
      depenser(e, j, o.construire.total, o.construire.commerce);
      if (o.construire.gratuit && aJeton(cite, 'urbanisme')) cite.pieces += 4;
      journal(e, j + ' construit « ' + CARTES[id].nom + ' »' + (o.construire.gratuit ? ' (chaînage)' : '') + '.');
      e.dernier = { j: j, type: 'construire', id: id };
      carte.pris = true; decouvrir(e);
      entrer(e, j, id);
    } else if (a.action === 'vendre') {
      cite.pieces += o.vendre;
      e.defausse.push(id);
      journal(e, j + ' défausse « ' + CARTES[id].nom + ' » (+' + o.vendre + ' 🪙).');
      e.dernier = { j: j, type: 'vendre', id: id };
      carte.pris = true; decouvrir(e);
    } else if (a.action === 'merveille') {
      var om = o.merveilles.find(x => x.id === a.merveille);
      if (!om) return 'Choisis une de tes merveilles.';
      if (!om.ok) return om.raison;
      var m = cite.merveilles.find(x => x.id === a.merveille), W = MERVEILLES[m.id];
      depenser(e, j, om.total, om.commerce);
      m.faite = true; m.sous = e.age;
      carte.pris = true; decouvrir(e);
      journal(e, j + ' construit ' + W.nom + '.');
      e.dernier = { j: j, type: 'merveille', id: id, merveille: m.id };
      var adv2 = autre(e, j);
      if (W.pieces) cite.pieces += W.pieces;
      if (W.vol) { var v = Math.min(W.vol, e.cites[adv2].pieces); e.cites[adv2].pieces -= v; }
      if (W.boucliers) avancer(e, j, W.boucliers);
      if (e.phase === 'fin') return null;
      if (W.detruire && e.cites[adv2].cartes.some(x => CARTES[x].type === W.detruire)) e.attentes.push({ phase: 'detruire', j: j, couleur: W.detruire });
      if (W.mausolee && e.defausse.length) e.attentes.push({ phase: 'mausolee', j: j });
      if (W.bibliotheque && e.jetonsBoite.length) e.attentes.push({ phase: 'bibliotheque', j: j, offre: melanger(e.jetonsBoite, h).slice(0, 3) });
      if (W.rejouer || aJeton(cite, 'theologie')) e.rejoue = true;
      // La 7e merveille construite : la dernière qui reste n'est plus constructible (retirée)
      if (merveillesFaites(e) >= MAX_MERVEILLES) e.joueurs.forEach(x => { e.cites[x].merveilles = e.cites[x].merveilles.filter(mm => mm.faite); });
    } else return 'Action inconnue.';
    if (e.phase === 'fin') return null;
    e.dernierJoueur = j;
    return suite(e, h);
  }
  function prendreJeton(e, j, id) {
    var cite = e.cites[j];
    cite.jetons.push(id);
    if (id === 'agriculture' || id === 'urbanisme') cite.pieces += 6;
    journal(e, j + ' prend le jeton Progrès « ' + PROGRES[id].nom + ' ».');
    if (id === 'loi' && nbSymboles(e, j) >= 6) terminer(e, j, 'science');
  }
  // Après un coup : fenêtres en attente, puis joueur suivant (ou rejouer), ou âge suivant
  function suite(e, h) {
    if (e.phase === 'fin' || e.attentes.length) return null;
    if (e.phase === 'debut') { e.phase = 'jeu'; return null; }
    if (e.pyramide.some(c => !c.pris)) {
      if (!e.rejoue) e.tour = 1 - e.tour;
      e.rejoue = false;
      return null;
    }
    e.rejoue = false;   // « Rejouer » avec la dernière carte de l'âge : perdu
    if (e.age === 3) { terminer(e, null, 'civile'); return null; }
    e.age++;
    poserPyramide(e, h);
    // Le plus faible militairement choisit qui commence ; à égalité, celui qui a joué la dernière carte
    var choisit = e.militaire > 0 ? e.joueurs[1] : e.militaire < 0 ? e.joueurs[0] : e.dernierJoueur;
    e.phase = 'debut';
    e.attentes.push({ phase: 'debut', j: choisit });
    journal(e, 'Âge ' + ['', 'I', 'II', 'III'][e.age] + ' : ' + choisit + ' choisit qui commence.');
    return null;
  }

  // ---------- Décompte ----------
  function score(e, j) {
    var cite = e.cites[j], r = { militaire: 0, civils: 0, science: 0, commerce: 0, guildes: 0, merveilles: 0, progres: 0, pieces: Math.floor(cite.pieces / 3) };
    var m = j === e.joueurs[0] ? e.militaire : -e.militaire;
    r.militaire = m >= 6 ? 10 : m >= 3 ? 5 : m >= 1 ? 2 : 0;
    cite.cartes.forEach(id => {
      var c = CARTES[id], f = c.effet;
      if (c.type === 'bleu') r.civils += f.pts || 0;
      if (c.type === 'vert') r.science += f.pts || 0;
      if (c.type === 'jaune') r.commerce += f.pts || 0;
      if (f.guilde) r.guildes += f.guilde === 'merveille' ? 2 * compteGuilde(e, 'merveille') : f.guilde === 'pieces' ? Math.floor(compteGuilde(e, 'pieces') / 3) : compteGuilde(e, f.guilde);
    });
    cite.merveilles.forEach(x => { if (x.faite) r.merveilles += MERVEILLES[x.id].pts; });
    cite.jetons.forEach(t => { if (t === 'agriculture') r.progres += 4; if (t === 'philosophie') r.progres += 7; if (t === 'mathematiques') r.progres += 3 * cite.jetons.length; });
    r.total = r.militaire + r.civils + r.science + r.commerce + r.guildes + r.merveilles + r.progres + r.pieces;
    return r;
  }
  function terminer(e, vainqueur, type) {
    e.phase = 'fin'; e.attentes = [];
    e.scores = {};
    e.joueurs.forEach(x => { e.scores[x] = score(e, x); });
    if (!vainqueur) {
      var a = e.joueurs[0], b = e.joueurs[1], sa = e.scores[a], sb = e.scores[b];
      if (sa.total !== sb.total) vainqueur = sa.total > sb.total ? a : b;
      else if (sa.civils !== sb.civils) vainqueur = sa.civils > sb.civils ? a : b;
    }
    e.vainqueur = vainqueur || null;
    e.fin = { type: type };
    e.classement = vainqueur ? [vainqueur, autre(e, vainqueur)] : e.joueurs.slice();
    journal(e, type === 'militaire' ? '⚔️ Suprématie militaire : ' + vainqueur + ' gagne !' : type === 'science' ? '🔬 Suprématie scientifique : ' + vainqueur + ' gagne !'
      : vainqueur ? '🏆 Victoire civile : ' + vainqueur + ' gagne avec ' + e.scores[vainqueur].total + ' points.' : 'Égalité parfaite !');
  }

  // ---------- L'ordinateur ----------
  function valeurCarte(e, j, id) {
    var c = CARTES[id], f = c.effet, cite = e.cites[j], age = e.age, v = 0, adv = autre(e, j);
    if (f.pts) v += f.pts * (c.type === 'vert' ? 0.7 : 1);
    if (f.prod) {
      var mes = {};
      sources(cite).forEach(s => s.forEach(r => { mes[r] = (mes[r] || 0) + 1; }));
      v += f.prod.split('').reduce((a, r) => a + (mes[r] ? 0.7 : 1.6), 0) * (age === 1 ? 1.7 : age === 2 ? 1.1 : 0.2);
    }
    if (f.choix) v += age === 3 ? 0.5 : 2.2;
    if (f.depot) v += age === 3 ? 0.4 : 1.6;
    if (f.pieces) v += f.pieces / 3;
    if (f.par) v += f.par.pieces * compter(e, j, f.par.type) / 3 + 0.5;
    if (f.boucliers) {
      var b = f.boucliers + (aJeton(cite, 'strategie') ? 1 : 0), m = (j === e.joueurs[0] ? e.militaire : -e.militaire);
      v += b * 1.4 + (m + b >= BOUT ? 100 : 0) + (m <= -6 ? 3 : 0) + ((m + b >= 3 && m < 3) || (m + b >= 6 && m < 6) ? 1.5 : 0);
    }
    if (f.sci) {
      var s = symboles(e, j), n = s[f.sci] || 0, diff = Object.keys(s).length;
      v += (n === 0 ? 1.5 + (diff >= 5 ? 100 : diff >= 4 ? 4 : 0) : 0) + (n === 1 && e.jetonsPlateau.length ? 3.5 : 0);
    }
    if (f.guilde) { var x = Object.assign({}, cite, { cartes: cite.cartes.concat(id) }), e2 = Object.assign({}, e, { cites: Object.assign({}, e.cites) }); e2.cites[j] = x; v += score(e2, j).guildes - score(e, j).guildes; }
    if (age < 3 && LISTE.some(l => l[6] === id)) v += 0.7;
    return v;
  }
  function valeurMerveille(e, j, mid) {
    var W = MERVEILLES[mid], v = W.pts + (W.pieces || 0) / 3 + (W.vol || 0) / 3 + (W.boucliers || 0) * 1.5 + (W.choix ? (e.age === 3 ? 0.5 : 2.5) : 0);
    if (W.rejouer || aJeton(e.cites[j], 'theologie')) v += 2.5;
    if (W.detruire) v += 1.5;
    if (W.mausolee) v += e.defausse.length ? 3 : 0;
    if (W.bibliotheque) v += 3;
    var m = j === e.joueurs[0] ? e.militaire : -e.militaire;
    if (W.boucliers && m + W.boucliers >= BOUT) v += 100;
    return v;
  }
  function ordinateur(e, j, h) {
    h = h || Math.random;
    var at = e.attentes[0];
    if (at && (at.phase === 'jeton' || at.phase === 'bibliotheque')) {
      var pref = ['loi', 'philosophie', 'agriculture', 'theologie', 'mathematiques', 'strategie', 'urbanisme', 'economie', 'maconnerie', 'architecture'];
      var l = at.phase === 'jeton' ? e.jetonsPlateau : at.offre;
      if (at.phase === 'jeton' && l.indexOf('loi') >= 0 && nbSymboles(e, j) >= 5) return { type: 'jeton', id: 'loi' };
      return { type: 'jeton', id: pref.find(t => l.indexOf(t) >= 0) || l[0] };
    }
    if (at && at.phase === 'detruire') {
      var cs = e.cites[autre(e, j)].cartes.filter(x => CARTES[x].type === at.couleur);
      cs.sort((a, b) => (CARTES[b].effet.prod || '').length - (CARTES[a].effet.prod || '').length);
      return { type: 'detruire', id: cs[0] };
    }
    if (at && at.phase === 'mausolee') {
      var d = e.defausse.slice().sort((a, b) => valeurCarte(e, j, b) - valeurCarte(e, j, a));
      return { type: 'mausolee', id: d[0] };
    }
    if (at && at.phase === 'debut') return { type: 'debut', j: j };
    if (e.phase === 'merveilles') {
      var o = e.offre.slice().sort((a, b) => valeurMerveille(e, j, b) - valeurMerveille(e, j, a));
      return { type: 'merveille-choix', id: h() < 0.75 ? o[0] : o[Math.floor(h() * o.length)] };
    }
    var adv = autre(e, j), best = null;
    e.pyramide.forEach((c, k) => {
      if (!accessible(e, k)) return;
      var o2 = options(e, j, c.id), refus = Math.max(0, valeurCarte(e, adv, c.id)) * 0.35;
      var essais = [['vendre', null, 0.6 + (e.cites[j].pieces < 4 ? 1.2 : 0)]];
      if (o2.construire.ok) essais.push(['construire', null, valeurCarte(e, j, c.id) - o2.construire.total / 3 + (o2.construire.gratuit ? 1 : 0)]);
      o2.merveilles.forEach(m => { if (m.ok) essais.push(['merveille', m.id, valeurMerveille(e, j, m.id) - m.total / 3 + (e.age >= 2 ? 0.8 : 0)]); });
      // Prudence : dégager une carte cachée, c'est peut-être l'offrir à l'adversaire
      var devoile = e.pyramide.filter(d => !d.pris && !d.visible && d.r === c.r - 1 && Math.abs(d.x - c.x) === 1).length * 0.3;
      essais.forEach(x => {
        var v = x[2] + refus - devoile + h() * 0.5;
        if (!best || v > best.v) best = { v: v, k: k, action: x[0], merveille: x[1] };
      });
    });
    return { type: 'prendre', k: best.k, action: best.action, merveille: best.merveille };
  }

  // ---------- Ce que voit chaque joueur : les cartes face cachée et la boîte restent cachées ----------
  function vuePour(e) {
    var v = JSON.parse(JSON.stringify(e));
    v.pyramide.forEach(c => { if (!c.visible && !c.pris) c.id = null; });
    v.nbBoite = e.jetonsBoite.length; v.jetonsBoite = [];
    v.reserveMerveilles = [];
    return v;
  }
  function compatible(e) { return !!(e && e.mode === 'duel' && e.regles === VERSION_REGLES); }

  return { RES: RES, SYMBOLES: SYMBOLES, CARTES: CARTES, LISTE: LISTE, TYPES: TYPES, MERVEILLES: MERVEILLES, PROGRES: PROGRES, FORMES: FORMES, BOUT: BOUT,
           MAX_MERVEILLES: MAX_MERVEILLES, nouvellePartie: nouvellePartie, accessible: accessible, options: options, payer: payer, prix: prix, sources: sources,
           symboles: symboles, score: score, jouer: jouer, qui: qui, autre: autre, ordinateur: ordinateur, vuePour: vuePour, compatible: compatible,
           merveillesFaites: merveillesFaites, compter: compter, venteGain: venteGain };
})();
if (typeof module !== 'undefined') module.exports = SD;
