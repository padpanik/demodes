// ================== LES 7 JOYAUX · DUEL : moteur de la version à deux (règles maison) ==================
// Testable avec Node. S'appuie sur joyaux-regles.js (SJ : cartes, joyaux, ressources).
// À deux, chacun son tour. Les cartes de chaque âge sont posées en pyramide (une rangée sur deux face cachée) ;
// on ne prend qu'une carte dégagée (plus rien ne la recouvre), pour la construire, bâtir une étape de son joyau ou la vendre.
// Commerce avec la banque : 2 🪙 + 1 par exemplaire que l'adversaire produit. Piste militaire en tir à la corde
// (victoire immédiate au bout), 6 symboles de savoir (une paire = un jeton de savoir, les 6 = victoire immédiate).
var SJ_ = (typeof SJ !== 'undefined') ? SJ : require('./joyaux-regles.js');
var SD = (function (SJ) {
  var C = SJ.CARTES, JOYAUX = SJ.JOYAUX;
  var PIECES_DEPART = 7, BOUT = 9;
  var MATIERES = 'BPAM';

  // ---------- Les six symboles de savoir du duel (deux cartes vertes par symbole) ----------
  var SYMBOLES = { compas: '📐', roue: '⚙️', tablette: '📖', balance: '⚖️', sablier: '⏳', plume: '🪶' };
  var SCI = { infirmerie: 'compas', dispensaire: 'compas', atelier: 'roue', laboratoire: 'roue', scriptorium: 'tablette', bibliotheque: 'tablette',
              ecole: 'balance', universite: 'balance', loge: 'sablier', observatoire: 'sablier', academie: 'plume', etudes: 'plume' };

  // ---------- Jetons de savoir (on en gagne un à chaque paire de symboles identiques) ----------
  var JETONS = {
    recolte: { nom: 'Récolte', ico: '🌾', txt: '+6 🪙 tout de suite et 4 points' },
    architecture: { nom: 'Architecture', ico: '🏗️', txt: 'Les étapes du joyau coûtent 2 ressources de moins' },
    maconnerie: { nom: 'Maçonnerie', ico: '🧱', txt: 'Les monuments (bleus) coûtent 2 ressources de moins' },
    economie: { nom: 'Économie', ico: '💰', txt: 'Ce que ton adversaire paie à la banque pour ses ressources te revient' },
    loi: { nom: 'Loi', ico: '⚖️', txt: 'Compte comme un symbole de savoir au choix' },
    maths: { nom: 'Mathématiques', ico: '🔢', txt: '3 points par jeton de savoir (celui-ci compris)' },
    philosophie: { nom: 'Philosophie', ico: '🦉', txt: '7 points' },
    strategie: { nom: 'Stratégie', ico: '🎖️', txt: 'Chaque nouvelle carte rouge donne 1 bouclier de plus' },
    urbanisme: { nom: 'Urbanisme', ico: '🏙️', txt: '+6 🪙, puis +4 🪙 à chaque carte construite gratuitement par chaîne' },
    banque: { nom: 'Banque', ico: '🏦', txt: 'Vendre une carte rapporte 3 🪙 de plus' }
  };

  // ---------- Les pyramides : rangées de haut en bas, positions en demi-largeurs de carte ----------
  // Une carte est recouverte par les cartes de la rangée du dessous décalées d'une demi-carte (x − 1 et x + 1).
  function rangee(n) { var l = []; for (var k = 0; k < n; k++) l.push(-(n - 1) + 2 * k); return l; }
  var FORMES = {
    1: [rangee(2), rangee(3), rangee(4), rangee(5), rangee(6)],
    2: [rangee(6), rangee(5), rangee(4), rangee(3), rangee(2)],
    3: [rangee(2), rangee(3), rangee(4), [-2, 2], rangee(4), rangee(3), rangee(2)]
  };
  function visibleAuDepart(age, r) { return r % 2 === 0; }

  function melanger(t, h) { return SJ.melanger(t, h); }
  // Cartes d'un âge pour le duel : toutes les cartes de l'âge (une par nom), on en garde 20 ; à l'âge III, 17 + 3 guildes
  function paquetDuel(age, h) {
    var vus = {}, l = [], guildes = [];
    SJ.LISTE.forEach(x => {
      if (x[2] !== age) return;
      if (!x[5]) { guildes.push(x[0]); return; }
      if (vus[x[1]]) return;
      vus[x[1]] = 1; l.push(x[0]);
    });
    l = melanger(l, h);
    return age === 3 ? melanger(l.slice(0, 17).concat(melanger(guildes, h).slice(0, 3)), h) : l.slice(0, 20);
  }
  function poserPyramide(e, h) {
    var p = paquetDuel(e.age, h), k = 0;
    e.pyramide = [];
    FORMES[e.age].forEach((xs, r) => xs.forEach(x => { e.pyramide.push({ id: p[k++], r: r, x: x, pris: false, visible: visibleAuDepart(e.age, r) }); }));
  }
  // Les cartes qui recouvrent encore celle-ci
  function couvreurs(e, k) {
    var c = e.pyramide[k];
    return e.pyramide.filter(d => !d.pris && d.r === c.r + 1 && Math.abs(d.x - c.x) === 1);
  }
  function accessible(e, k) { var c = e.pyramide[k]; return !!c && !c.pris && !couvreurs(e, k).length; }
  function decouvrir(e) {
    e.pyramide.forEach((c, k) => { if (!c.pris && !c.visible && !couvreurs(e, k).length) c.visible = true; });
  }

  // ---------- Partie ----------
  function nouvellePartie(joueurs, h) {
    h = h || Math.random;
    if (joueurs.length !== 2) throw new Error('Le duel se joue à deux');
    var jt = melanger(Object.keys(JETONS), h);
    var e = { mode: 'duel', joueurs: joueurs.slice(), n: 2, age: 1, phase: 'joyaux', tour: 0, militaire: 0, pillage: {},
              jetonsPlateau: jt.slice(0, 5), jetonsReserve: jt.slice(5), offre: melanger(Object.keys(JOYAUX), h).slice(0, 4),
              cites: {}, journal: [], dernier: null, enAttente: null, fin: null, scores: null, defausse: [] };
    joueurs.forEach(j => { e.cites[j] = { cartes: [], pieces: PIECES_DEPART, joyau: null, etapes: 0, jetons: [], militaire: [], gratuitAge: 0 }; });
    poserPyramide(e, h);
    journal(e, joueurs[0] + ' choisit son joyau le premier.');
    return e;
  }
  function journal(e, t) { e.journal.push(t); if (e.journal.length > 12) e.journal.shift(); }
  function autre(e, j) { return e.joueurs[0] === j ? e.joueurs[1] : e.joueurs[0]; }
  function aJeton(cite, id) { return cite.jetons.indexOf(id) >= 0; }

  // ---------- Production et prix ----------
  // Ce que l'adversaire produit lui-même (cartes marron et grises, ressource fixe seulement) fait monter le prix
  function productionFixe(cite) {
    var n = {};
    cite.cartes.forEach(id => { var f = C[id].effet; if ((C[id].type === 'brun' || C[id].type === 'gris') && f.prod && f.prod.indexOf('/') < 0) f.prod.split('').forEach(r => { n[r] = (n[r] || 0) + 1; }); });
    return n;
  }
  function prixBanque(e, j, r) {
    var cite = e.cites[j], jy = cite.joyau && JOYAUX[cite.joyau];
    var reduitMat = cite.cartes.some(id => C[id].effet.comptoir) || (jy && jy.etapes.slice(0, cite.etapes).some(t => t.comptoir));
    var reduitObj = cite.cartes.some(id => C[id].effet.marche);
    if (MATIERES.indexOf(r) >= 0 ? reduitMat : reduitObj) return 1;
    return 2 + (productionFixe(e.cites[autre(e, j)])[r] || 0);
  }
  function sourcesDe(cite) {
    if (!cite.joyau) return [];
    return SJ.sources(cite, false);
  }
  // Paiement le moins cher d'un coût : ressources à soi, le reste acheté à la banque ; « remise » ressources offertes (les plus chères)
  function payer(e, j, cout, remise) {
    if (!cout) return { ok: true, banque: 0 };
    var cite = e.cites[j], besoin = cout.split(''), mien = sourcesDe(cite), us = mien.map(() => false), prix = {};
    'BPAMVTR'.split('').forEach(r => { prix[r] = prixBanque(e, j, r); });
    var meilleur = null;
    (function chercher(k, achats) {
      if (k === besoin.length) {
        var t = achats.slice().sort((a, b) => b - a).slice(remise || 0).reduce((a, b) => a + b, 0);
        if (!meilleur || t < meilleur) meilleur = t;
        return;
      }
      var r = besoin[k], i, trouve = false;
      for (i = 0; i < mien.length; i++) if (!us[i] && mien[i].o.indexOf(r) >= 0) { us[i] = true; trouve = true; chercher(k + 1, achats); us[i] = false; if (meilleur === 0) return; }
      achats.push(prix[r]); chercher(k + 1, achats); achats.pop();
    })(0, []);
    return { ok: true, banque: meilleur };
  }
  function aDeja(cite, id) { var nom = C[id].nom; return cite.cartes.some(x => C[x].nom === nom); }
  function options(e, j, id) {
    var cite = e.cites[j], c = C[id], r = {};
    var vente = 2 + cite.cartes.filter(x => C[x].type === 'jaune').length + (aJeton(cite, 'banque') ? 3 : 0);
    r.vendre = { ok: true, gain: vente };
    if (aDeja(cite, id)) r.construire = { ok: false, raison: 'Déjà dans ta cité' };
    else if (c.chaine.some(x => cite.cartes.indexOf(x) >= 0)) r.construire = { ok: true, chaine: true, banque: 0, pieces: 0 };
    else {
      var p = payer(e, j, c.cout, c.type === 'bleu' && aJeton(cite, 'maconnerie') ? 2 : 0), tot = p.banque + c.pieces;
      r.construire = tot <= cite.pieces ? { ok: true, banque: p.banque, pieces: c.pieces } : { ok: false, raison: 'Il manque ' + (tot - cite.pieces) + ' 🪙 (coût ' + tot + ')' };
    }
    var jy = cite.joyau && JOYAUX[cite.joyau];
    if (!jy) r.joyau = { ok: false, raison: 'Pas de joyau' };
    else if (cite.etapes >= 3) r.joyau = { ok: false, raison: 'Joyau terminé' };
    else {
      var q = payer(e, j, jy.etapes[cite.etapes].cout, aJeton(cite, 'architecture') ? 2 : 0);
      r.joyau = q.banque <= cite.pieces ? { ok: true, banque: q.banque, pieces: 0 } : { ok: false, raison: 'Il manque ' + (q.banque - cite.pieces) + ' 🪙 (coût ' + q.banque + ')' };
    }
    r.gratuit = !!jy && !aDeja(cite, id) && jy.etapes.slice(0, cite.etapes).some(t => t.gratuit) && cite.gratuitAge !== e.age;
    return r;
  }

  // ---------- Savoir ----------
  function symboles(e, j) {
    var cite = e.cites[j], s = {}, joker = 0;
    cite.cartes.forEach(id => { if (SCI[id]) s[SCI[id]] = (s[SCI[id]] || 0) + 1; else if (C[id].effet.sci === '*') joker++; });
    if (cite.joyau) JOYAUX[cite.joyau].etapes.slice(0, cite.etapes).forEach(t => { if (t.sci) joker++; });
    if (aJeton(cite, 'loi')) joker++;
    return { s: s, joker: joker, differents: Object.keys(s).length + joker };
  }

  // ---------- Militaire : tir à la corde. militaire > 0 = vers la capitale du 2e joueur ----------
  function avancer(e, j, n) {
    if (!n) return;
    var signe = j === e.joueurs[0] ? 1 : -1, avant = e.militaire;
    e.militaire = Math.max(-BOUT, Math.min(BOUT, e.militaire + signe * n));
    var adv = autre(e, j), cite = e.cites[adv];
    [[3, 2], [6, 5]].forEach(z => {
      var cle = (signe > 0 ? 'p' : 'n') + z[0];
      if (!e.pillage[cle] && signe * e.militaire >= z[0] && signe * avant < z[0]) {
        e.pillage[cle] = true;
        var perte = Math.min(cite.pieces, z[1]);
        cite.pieces -= perte;
        journal(e, '⚔️ ' + j + ' pille ' + adv + ' : −' + perte + ' 🪙');
      }
    });
    if (Math.abs(e.militaire) >= BOUT) terminer(e, j, 'militaire');
  }
  function boucliersCarte(e, j, id) {
    var b = C[id].effet.boucliers || 0;
    if (b && aJeton(e.cites[j], 'strategie')) b++;
    return b;
  }

  // ---------- Actions ----------
  // { type: 'joyau-choix', id } | { type: 'prendre', k, action: 'construire' | 'joyau' | 'vendre' | 'gratuit' } | { type: 'jeton', id }
  function joueurDuTour(e) { return e.joueurs[e.tour]; }
  function jouer(e, j, a, h) {
    if (e.phase === 'fin') return 'La partie est finie.';
    if (e.phase === 'joyaux') {
      if (a.type !== 'joyau-choix' || j !== joueurDuTour(e) || e.offre.indexOf(a.id) < 0) return 'Choisis ton joyau.';
      e.cites[j].joyau = a.id;
      e.offre = e.offre.filter(x => x !== a.id);
      journal(e, j + ' prend ' + JOYAUX[a.id].nom + '.');
      if (e.cites[autre(e, j)].joyau) { e.phase = 'jeu'; e.tour = 0; e.offre = []; journal(e, 'Âge I : ' + e.joueurs[0] + ' commence.'); }
      else e.tour = 1 - e.tour;
      return null;
    }
    if (e.phase === 'jeton') {
      if (a.type !== 'jeton' || j !== e.enAttente || e.jetonsPlateau.indexOf(a.id) < 0) return 'Choisis un jeton de savoir.';
      prendreJeton(e, j, a.id);
      e.enAttente = null; e.phase = 'jeu';
      return suite(e, j, h);
    }
    if (a.type !== 'prendre' || j !== joueurDuTour(e)) return 'Ce n\'est pas ton tour.';
    if (!accessible(e, +a.k)) return 'Cette carte est encore recouverte.';
    var carte = e.pyramide[+a.k], id = carte.id, cite = e.cites[j], o = options(e, j, id), adv = autre(e, j), coup = { j: j, id: id, type: a.action };
    if (a.action === 'construire') {
      if (!o.construire.ok) return o.construire.raison;
      payerBanque(e, j, o.construire.banque + o.construire.pieces, o.construire.banque);
      cite.cartes.push(id);
      coup.paye = o.construire.banque + o.construire.pieces;
      if (o.construire.chaine && aJeton(cite, 'urbanisme')) cite.pieces += 4;
      effetsConstruction(e, j, id);
    } else if (a.action === 'gratuit') {
      if (!o.gratuit) return 'Pas de construction gratuite possible.';
      cite.gratuitAge = e.age; cite.cartes.push(id);
      effetsConstruction(e, j, id);
    } else if (a.action === 'joyau') {
      if (!o.joyau.ok) return o.joyau.raison;
      payerBanque(e, j, o.joyau.banque, o.joyau.banque);
      var t = JOYAUX[cite.joyau].etapes[cite.etapes];
      cite.etapes++;
      coup.paye = o.joyau.banque;
      if (t.pieces) cite.pieces += t.pieces;
      if (t.boucliers) avancer(e, j, t.boucliers);
    } else if (a.action === 'vendre') {
      cite.pieces += o.vendre.gain; coup.gain = o.vendre.gain;
      e.defausse.push(id);
    } else return 'Action inconnue.';
    carte.pris = true;
    decouvrir(e);
    e.dernier = coup;
    journal(e, j + (a.action === 'vendre' ? ' vend « ' : a.action === 'joyau' ? ' polit son joyau avec « ' : ' construit « ') + C[id].nom + ' ».');
    if (e.phase === 'fin') return null;
    // Une paire de symboles : on choisit un jeton de savoir (s'il en reste)
    if ((a.action === 'construire' || a.action === 'gratuit') && SCI[id] && symboles(e, j).s[SCI[id]] === 2 && e.jetonsPlateau.length) {
      e.phase = 'jeton'; e.enAttente = j;
      return null;
    }
    return suite(e, j, h);
  }
  // Ressources achetées à la banque : avec l'Économie, l'adversaire les touche
  function payerBanque(e, j, total, commerce) {
    e.cites[j].pieces -= total;
    var adv = autre(e, j);
    if (commerce && aJeton(e.cites[adv], 'economie')) e.cites[adv].pieces += commerce;
  }
  function effetsConstruction(e, j, id) {
    var f = C[id].effet, cite = e.cites[j], adv = autre(e, j);
    if (f.pieces) cite.pieces += f.pieces;
    if (f.gain) cite.pieces += f.gain.pieces * (compter(e, j, f.gain.type) + compter(e, adv, f.gain.type));
    if (f.fin) cite.pieces += f.fin.pieces * compter(e, j, f.fin.type);
    if (f.boucliers) avancer(e, j, boucliersCarte(e, j, id));
    if (e.phase !== 'fin' && symboles(e, j).differents >= 6) terminer(e, j, 'savoir');
  }
  function prendreJeton(e, j, id) {
    var cite = e.cites[j];
    e.jetonsPlateau = e.jetonsPlateau.filter(x => x !== id);
    cite.jetons.push(id);
    if (id === 'recolte' || id === 'urbanisme') cite.pieces += 6;
    journal(e, j + ' gagne le jeton « ' + JETONS[id].nom + ' ».');
    if (id === 'loi' && symboles(e, j).differents >= 6) terminer(e, j, 'savoir');
  }
  // Au suivant, ou à l'âge suivant
  function suite(e, j, h) {
    if (e.phase === 'fin') return null;
    if (e.pyramide.some(c => !c.pris)) { e.tour = 1 - e.joueurs.indexOf(j); return null; }
    if (e.age === 3) { terminer(e, null, 'points'); return null; }
    e.age++;
    poserPyramide(e, h);
    // Commence le plus faible militairement ; à égalité, celui qui n'a pas pris la dernière carte
    e.tour = e.militaire > 0 ? 1 : e.militaire < 0 ? 0 : 1 - e.joueurs.indexOf(j);
    journal(e, 'Âge ' + ['', 'I', 'II', 'III'][e.age] + ' : ' + e.joueurs[e.tour] + ' commence.');
    return null;
  }

  // ---------- Fin et décompte ----------
  function compter(e, j, type) {
    var cite = e.cites[j];
    if (type === 'joyau') return cite.etapes;
    if (type === 'defaite') return 0;
    return cite.cartes.filter(id => C[id].type === type).length;
  }
  function score(e, j) {
    var cite = e.cites[j], adv = autre(e, j), r = { militaire: 0, pieces: Math.floor(cite.pieces / 3), joyau: 0, monuments: 0, commerce: 0, guildes: 0, savoir: 0, jetons: 0 };
    var m = j === e.joueurs[0] ? e.militaire : -e.militaire;
    if (m >= 6) r.militaire = 10; else if (m >= 3) r.militaire = 5; else if (m >= 1) r.militaire = 2;
    if (cite.joyau) JOYAUX[cite.joyau].etapes.slice(0, cite.etapes).forEach(t => { r.joyau += t.pts || 0; });
    cite.cartes.forEach(id => {
      var c = C[id], f = c.effet;
      if (c.type === 'bleu') r.monuments += f.pts;
      if (f.fin) r.commerce += f.fin.pts * compter(e, j, f.fin.type);
      if (SCI[id]) r.savoir += c.age;   // une carte verte vaut son âge en points
      if (f.guilde) {
        var g = f.guilde;
        g.types.forEach(t => {
          var n = g.qui === 's' ? compter(e, j, t) : Math.max(compter(e, j, t), compter(e, adv, t));
          r.guildes += g.pts * n;
        });
      }
    });
    cite.jetons.forEach(t => {
      if (t === 'recolte') r.jetons += 4;
      if (t === 'philosophie') r.jetons += 7;
      if (t === 'maths') r.jetons += 3 * cite.jetons.length;
    });
    r.total = r.militaire + r.pieces + r.joyau + r.monuments + r.commerce + r.guildes + r.savoir + r.jetons;
    return r;
  }
  function terminer(e, vainqueur, type) {
    e.phase = 'fin';
    e.scores = {};
    e.joueurs.forEach(j => { e.scores[j] = score(e, j); });
    if (!vainqueur) {
      var a = e.joueurs[0], b = e.joueurs[1], sa = e.scores[a], sb = e.scores[b];
      vainqueur = sa.total !== sb.total ? (sa.total > sb.total ? a : b) : (sa.monuments >= sb.monuments ? a : b);
    }
    e.vainqueur = vainqueur;
    e.fin = { type: type };
    e.classement = [vainqueur, autre(e, vainqueur)];
    journal(e, type === 'militaire' ? '⚔️ ' + vainqueur + ' arrive aux portes de la cité adverse : victoire militaire !'
      : type === 'savoir' ? '📚 ' + vainqueur + ' réunit les six savoirs : victoire du savoir !'
      : '🏆 ' + vainqueur + ' gagne avec ' + e.scores[vainqueur].total + ' points.');
  }

  // ---------- L'ordinateur ----------
  function valeurCarte(e, j, id, o) {
    var c = C[id], f = c.effet, cite = e.cites[j], age = e.age, v = 0, adv = autre(e, j);
    if (f.pts) v += f.pts * 0.9;
    if (f.prod) {
      var mes = {};
      sourcesDe(cite).forEach(s => s.o.forEach(r => { mes[r] = (mes[r] || 0) + 1; }));
      var l = f.prod.indexOf('/') >= 0 ? f.prod.split('/') : f.prod.split('');
      v += l.reduce((a, r) => a + (mes[r] ? 0.6 : 1.4), 0) * (age === 1 ? 1.8 : age === 2 ? 1.1 : 0.15);
    }
    if (f.choix) v += age === 3 ? 0.4 : 2;
    if (f.pieces) v += f.pieces / 3;
    if (f.comptoir || f.marche) v += age === 1 ? 1.6 : 0.6;
    if (f.gain) v += 1.5;
    if (f.fin) v += f.fin.pts * compter(e, j, f.fin.type) + 0.8;
    if (f.boucliers) {
      var m = (j === e.joueurs[0] ? e.militaire : -e.militaire) + boucliersCarte(e, j, id);
      v += boucliersCarte(e, j, id) * 1.6 + (m >= BOUT ? 100 : m >= 6 ? 3 : m >= 3 ? 1.5 : 0) + (m <= -5 ? 2 : 0);
    }
    if (SCI[id]) {
      var s = symboles(e, j), n = s.s[SCI[id]] || 0;
      v += c.age + (n === 0 ? 1.5 + (s.differents >= 5 ? 100 : s.differents >= 4 ? 4 : 0) : 0) + (n === 1 && e.jetonsPlateau.length ? 3.5 : 0);
    }
    if (f.sci === '*') v += 3;
    if (f.guilde) { var x = Object.assign({}, cite, { cartes: cite.cartes.concat(id) }), e2 = Object.assign({}, e, { cites: Object.assign({}, e.cites) }); e2.cites[j] = x; v += score(e2, j).guildes - score(e, j).guildes; }
    if (age < 3 && SJ.LISTE.some(l => l[7] && l[7].split('|').indexOf(id) >= 0)) v += 0.6;
    if (o && o.construire.ok) v -= (o.construire.banque + o.construire.pieces) / 3;
    return v;
  }
  function ordinateur(e, j, h) {
    h = h || Math.random;
    if (e.phase === 'joyaux') return { type: 'joyau-choix', id: e.offre[Math.floor(h() * e.offre.length)] };
    if (e.phase === 'jeton') {
      var pref = ['loi', 'philosophie', 'recolte', 'maths', 'strategie', 'urbanisme', 'economie', 'maconnerie', 'architecture', 'banque'];
      return { type: 'jeton', id: pref.find(t => e.jetonsPlateau.indexOf(t) >= 0) || e.jetonsPlateau[0] };
    }
    var adv = autre(e, j), best = null;
    e.pyramide.forEach((c, k) => {
      if (!accessible(e, k)) return;
      var o = options(e, j, c.id), refus = Math.max(0, valeurCarte(e, adv, c.id, options(e, adv, c.id))) * 0.35;
      var essais = [['vendre', 1 + (e.cites[j].pieces < 4 ? 1 : 0)]];
      if (o.construire.ok) essais.push(['construire', valeurCarte(e, j, c.id, o)]);
      if (o.gratuit && !o.construire.ok) essais.push(['gratuit', valeurCarte(e, j, c.id, null) + 1]);
      if (o.joyau.ok) {
        var t = JOYAUX[e.cites[j].joyau].etapes[e.cites[j].etapes];
        essais.push(['joyau', (t.pts || 0) * 0.9 + (t.boucliers ? 3.5 : 0) + (t.pieces ? 3 : 0) + (t.prod ? 4 - e.age : 0) + (t.sci ? 4 : 0) + (t.comptoir ? 3 - e.age : 0) + (t.gratuit ? 3 : 0) + (e.age === 3 ? 1.5 : 0.5) - o.joyau.banque / 3]);
      }
      // Ne pas dégager une carte face cachée trop tôt : petite prudence
      var devoile = e.pyramide.filter((d, i) => !d.pris && !d.visible && d.r === c.r - 1 && Math.abs(d.x - c.x) === 1).length * 0.2;
      essais.forEach(x => {
        var v = x[1] + refus - devoile + h() * 0.5;
        if (!best || v > best.v) best = { v: v, k: k, action: x[0] };
      });
    });
    return { type: 'prendre', k: best.k, action: best.action };
  }

  // ---------- Ce que voit chaque joueur : les cartes face cachée restent cachées ----------
  function vuePour(e) {
    var v = JSON.parse(JSON.stringify(e));
    v.pyramide.forEach(c => { if (!c.visible && !c.pris) c.id = null; });
    v.jetonsReserve = [];
    v.defausse = [];
    return v;
  }

  return { SYMBOLES: SYMBOLES, SCI: SCI, JETONS: JETONS, FORMES: FORMES, BOUT: BOUT, nouvellePartie: nouvellePartie, accessible: accessible, couvreurs: couvreurs,
           options: options, payer: payer, prixBanque: prixBanque, symboles: symboles, score: score, jouer: jouer, joueurDuTour: joueurDuTour, autre: autre,
           ordinateur: ordinateur, vuePour: vuePour, compter: compter, boucliersCarte: boucliersCarte };
})(SJ_);
if (typeof module !== 'undefined') module.exports = SD;
