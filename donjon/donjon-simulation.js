// ================== DONJON : SIMULATION D'ÉQUILIBRAGE (Node seulement, pas servi par le site) ==================
// Un joueur automatique raisonnable traverse des donjons complets (3 étages) : combats, butin, feu de camp, marchand, autel.
// node donjon/donjon-simulation.js [parties par classe] [péril] [joueurs] [difficulté : normal | heroique | mythique] [risque]
// 5e argument « risque » (3.40) : le joueur automatique tente aussi les pièces à risque (défi, trésor piégé, coffre maudit) quand il est en forme
// (75 % de ses PV ou plus ; « risque-toujours » : même blessé) ; sans cet argument, il les évite.
// Lieux (3.41) : un argument « lieux=champignonniere,-,- » (où qu'il soit) impose le lieu de chaque étage (« - » = tiré au hasard, comme en jeu) ;
// « lieux=origine » : les trois lieux d'origine (la référence d'avant 3.41).
// Repère : un humain attentif joue mieux que ce joueur automatique (il lit mieux les intentions et construit son paquet).

var DJ = require('./donjon-regles.js');
var D = DJ.D;
var ARG_LIEUX = (process.argv.find(x => /^lieux=/.test(x)) || '').slice(6);
var LIEUX_FORCES = ARG_LIEUX === 'origine' ? D.ETAGES.map(E => E.id) : ARG_LIEUX ? ARG_LIEUX.split(',').map(x => x === '-' ? null : x) : null;

// ---------- Un tour de combat ----------
function monstres(e, p) { return e.ennemis.filter(m => m.salle === p.salle); }
function degatsAttendus(e, p) {
  return monstres(e, p).reduce((s, m) => {
    var i = m.intention;
    if (!i || !i.att || (!i.tous && m.cible !== p.nom)) return s;
    return s + DJ.degatsIntention(e, m, p) * (i.x || 1);
  }, 0);
}
function valeurCarte(e, p, id, ms, besoin) {
  var k = DJ.carte(id), v = 0, cout = DJ.cout(e, p, id);   // 3.64 : la règle « Savoir » rend la 3e carte gratuite
  if (k.injouable || cout > p.energie) return -1;
  if (k.type === 'pouvoir') return p.tourCombat <= 2 ? 30 : 8;
  var spores = DJ.regleLieu(e);
  if (k.finMain) return 4;   // malédiction qu'on peut payer pour s'en débarrasser : quand il reste de l'énergie
  k.fx.forEach(f => {
    if (f.deg !== undefined) v += f.deg * (f.x || 1) * (f.tous ? ms.length : 1) + (p.etats.force || 0) * (f.x || 1);
    if (f.armure) v += Math.min(f.armure, Math.max(0, besoin)) * 1.3 + 0.5 + (spores && spores.poison && !p.armure ? 2.5 : 0);   // Spores : un peu d'armure évite le poison
    if (f.pioche) v += 3 * f.pioche;
    if (f.energie) v += 5 * f.energie;
    if (f.etat === 'vuln') v += 6 * f.n;
    if (f.etat === 'faible') v += besoin > 0 ? 4 * f.n : 2;
    if (f.etat === 'poison' || f.etat === 'brule') v += f.n * 1.8 * (f.tous ? ms.length : 1);
    if (f.soin) v += p.pv < p.pvMax * 0.6 ? f.soin * 1.2 : 0;
    if (f.special === 'armuredeg') v += (p.armure + k.fx.reduce((t, g) => t + (g.armure || 0), 0)) * (f.tous ? ms.length : 1);
    if (f.special === 'doublearmure') v += Math.min(p.armure, Math.max(0, besoin)) * 1.2;
    if (f.special === 'ricochet') v += f.n * f.x;
    if (f.special === 'explosion') v += ms.reduce((s, m) => s + f.n + (m.etats.brule || 0), 0);
    if (f.special === 'danse') v += f.n * p.joues;
    if (f.special === 'traque' || f.special === 'embuscade') v += f.n * 1.3;
    if (f.special === 'attiser') v += ms.reduce((s, m) => Math.max(s, (m.etats.brule || 0) * 1.5), 0);
    if (f.special === 'catalyse') v += ms.reduce((s, m) => Math.max(s, (m.etats.poison || 0) * 2), 0);
    if (f.special === 'assommer') { var dm = menaceMax(e, p, ms); v += dm ? dm.v * 1.1 : 0; }
    if (f.special === 'prevoyance') v += 1;
  });
  return v / Math.max(0.6, cout);
}
// Le monstre le plus menaçant ce tour (pour Assommer) : dégâts annoncés sur le groupe, ou renforts appelés
function menaceMax(e, p, ms) {
  var nb = Object.values(e.joueurs).filter(q => !q.fantome && q.salle === p.salle).length;
  var best = null;
  ms.forEach(m => {
    var i = m.intention;
    if (!i || i.assomme) return;
    var v = (i.att ? DJ.degatsIntention(e, m, p) * (i.x || 1) * (i.tous ? nb : 1) : 0) + (i.appel ? 8 * i.appel.n : 0) + (i.force ? 3 * i.force : 0) + (i.armure ? i.armure * 0.3 : 0);
    if (!best || v > best.v) best = { m: m, v: v };
  });
  return best && best.v >= 10 ? best : null;
}
function cibleAttaque(ms, k) {
  // le monstre qu'on peut achever, sinon le plus faible
  var tri = ms.slice().sort((a, b) => (a.pv + a.armure) - (b.pv + b.armure));
  if (k.fx.some(f => f.etat === 'vuln' || f.etat === 'poison' || f.special === 'catalyse')) tri = ms.slice().sort((a, b) => b.pv - a.pv);
  return tri[0];
}
function jouerTour(e, p, h) {
  var c = e.combats[p.salle];
  for (var garde = 0; garde < 30 && e.combats[p.salle] && !c.fini[p.nom] && !p.fantome; garde++) {
    var ms = monstres(e, p);
    if (!ms.length) return;
    var besoin = degatsAttendus(e, p) - p.armure;
    // Fiole : en danger, ou dès le début contre un élite / boss
    if (p.fioles.length && (p.pv - besoin < p.pvMax * 0.25 || (c.rang !== 'normal' && p.tourCombat === 1))) {
      var fi = p.fioles.findIndex(id => id !== 'soin' || p.pv < p.pvMax * 0.5);
      if (fi >= 0) { DJ.utiliserFiole(e, p.nom, fi, (cibleAttaque(ms, { fx: [] }) || {}).id, h); continue; }
    }
    var best = -1, bi = -1;
    p.main.forEach((id, i) => { var v = valeurCarte(e, p, id, ms, besoin); if (v > best) { best = v; bi = i; } });
    if (bi < 0 || best <= 0) break;
    var k = DJ.carte(p.main[bi]), cible = k.cible === 'monstre' ? (k.fx.some(f => f.special === 'assommer') ? menaceMax(e, p, ms).m : cibleAttaque(ms, k)).id : null;
    if (DJ.jouerCarte(e, p.nom, bi, cible, h)) break;
  }
  // Marque-page : garder la meilleure carte qui reste
  if (e.combats[p.salle] && !p.fantome && p.main.length && (p.reliques || []).indexOf('marquepage') >= 0) {
    var ms2 = monstres(e, p), en = p.energie, bm = -1, bj = -1;
    p.energie = 3;
    p.main.forEach((id, i) => { var v = valeurCarte(e, p, id, ms2, 10); if (v > bm) { bm = v; bj = i; } });
    p.energie = en;
    if (bj >= 0) DJ.marquer(e, p.nom, bj);
  }
  DJ.finTour(e, p.nom, h);
}
function combat(e, p, h) {
  DJ.demarrerCombat(e, p.salle, h);
  for (var t = 0; t < 80 && e.combats[p.salle]; t++) {
    jouerTour(e, p, h);
    if (e.combats[p.salle]) DJ.tourMonstres(e, e.combats[p.salle], h);
  }
  if (e.combats[p.salle]) return false;
  return !p.fantome;
}

// ---------- Choix hors combat ----------
var PREF = { r: 30, u: 18, c: 10 };
function noteCarte(p, id) {
  var k = DJ.carte(id); if (!k) return 0;
  var n = PREF[k.rar] || 0;
  if (k.type === 'pouvoir') n += 6;
  if (k.cible === 'tous') n += 5;
  if (k.type === 'defense' && p.paquet.filter(x => DJ.carte(x).type === 'defense').length < p.paquet.length * 0.4) n += 4;
  return n;
}
function gererMenus(e, p, h) {
  for (var g = 0; g < 30 && p.menus.length; g++) {
    var m = p.menus[0], r;
    if (m.type === 'butin' || m.type === 'choix') {
      var best = -1, bi = -1;
      m.cartes.forEach((id, i) => { var n = noteCarte(p, id); if (n > best) { best = n; bi = i; } });
      // Paquet déjà épais (gardé de la semaine) : on ne prend qu'une carte nettement meilleure que la moyenne du paquet
      var moyP = p.paquet.reduce((t, id) => t + noteCarte(p, id), 0) / Math.max(1, p.paquet.length);
      r = best >= 10 && p.paquet.length < 34 && (p.paquet.length < 20 ? true : p.paquet.length < 26 ? best >= 18 || best >= moyP + 3 : best >= moyP + 6) ? DJ.choisir(e, p.nom, 'prendre', bi, h) : DJ.choisir(e, p.nom, 'passer', null, h);
    } else if (m.type === 'reliqueBoss') r = DJ.choisir(e, p.nom, 'prendre', 0, h);
    else if (m.type === 'feu') r = DJ.choisir(e, p.nom, p.pv < p.pvMax * 0.6 ? 'repos' : 'aiguiser', null, h);
    else if (m.type === 'marchand') {
      var b = p.boutiques[m.salle];
      if (!p.retraits && p.or >= DJ.prixRetrait(p) + 40 && p.paquet.indexOf('griffe') >= 0) { r = DJ.choisir(e, p.nom, 'retrait', null, h); continue; }
      var k = b.cartes.map((o, i) => ({ o: o, i: i, n: noteCarte(p, o.id) })).filter(x => !x.o.vendu && x.o.prix <= p.or && x.n >= 18).sort((a, b) => b.n - a.n)[0];
      if (k) { DJ.choisir(e, p.nom, 'carte', k.i, h); continue; }
      var f = b.fioles.findIndex(o => !o.vendu && o.prix <= p.or);
      if (f >= 0 && p.fioles.length < p.fiolesMax && p.or > 80) { DJ.choisir(e, p.nom, 'fiole', f, h); continue; }
      r = DJ.choisir(e, p.nom, 'partir', null, h);
    } else if (m.type === 'evenement') {
      var bas = p.pv < p.pvMax * 0.5;
      var choix = { coffre: 1, des: 1, autel: bas ? 1 : 0, fontaine: p.pv < p.pvMax * 0.8 ? 0 : 1, miroir: 0, grimoires: 0, enclume: 0, champignons: 0,
        bivouac: p.pv < p.pvMax * 0.7 ? 0 : 1, puits: 0, colporteur: 0, sage: 0, voyageur: bas ? 1 : 0, idole: 1, roue: bas ? 1 : 0, gardien: bas ? 1 : 0,
        cartographe: 1, chaudron: p.pv < p.pvMax * 0.7 ? 1 : 0, ratelier: 0, alchimiste: 0, coffremaudit: 0 }[m.id] || 0;
      r = DJ.choisir(e, p.nom, 'choix', choix, h);
      if (r) r = DJ.choisir(e, p.nom, 'choix', 1 - choix, h);
      if (r) p.menus.shift();
    } else if (m.type === 'paquet') {
      var l = p.paquet.map((id, i) => ({ id: id, i: i }));
      var pick;
      if (m.mode === 'retirer') pick = l.find(x => x.id === 'blessure') || l.find(x => x.id === 'griffe') || l[0];
      else if (m.mode === 'ameliorer') pick = l.filter(x => DJ.ameliorable(x.id)).sort((a, b) => noteCarte(p, b.id) - noteCarte(p, a.id))[0];
      else if (m.mode === 'transformer') pick = l.find(x => x.id === 'griffe') || l.filter(x => DJ.carte(x.id).type !== 'malediction').sort((a, b) => noteCarte(p, a.id) - noteCarte(p, b.id))[0];
      else pick = l.filter(x => DJ.carte(x.id).type !== 'malediction').sort((a, b) => noteCarte(p, b.id) - noteCarte(p, a.id))[0];
      r = pick ? DJ.choisir(e, p.nom, 'carte', pick.i, h) : DJ.choisir(e, p.nom, 'annuler', null, h);
    }
    if (r && p.menus[0] === m) p.menus.shift();
  }
}

// ---------- Une partie complète (1 à 4 joueurs automatiques qui avancent ensemble) ----------
var ESPECE = { ronces: 'dragon', force: 'panda', bond: 'lapin', flair: 'renard', aucune: null };
function partie(classe, graine, peril, nb, diff, av, risque, faille) {   // faille : { etage, lieu } (3.60, failles des Terres de la Vallée)
  nb = nb || 1;
  var h = DJ.hasard(graine * 31 + 7), classes = Array.isArray(classe) ? classe : [classe], js = {};
  for (var j = 0; j < nb; j++) {
    var cl = classes[j % classes.length], nom = j ? 'Bot' + (j + 1) : 'Bot';
    js[nom] = ESPECE[cl] ? { e: ESPECE[cl], c: '#c8915a', n: nom, p: {} } : null;
  }
  var avs = {}; if (av) Object.keys(js).forEach(n => { avs[n] = av; });
  var e = DJ.nouvelle(graine, js, 'sim' + graine, { peril: peril, difficulte: diff || 'heroique', avantages: avs, lieux: LIEUX_FORCES, faille: faille });
  var ps = Object.keys(e.joueurs).map(n => e.joueurs[n]), p = ps[0], combats = 0;
  var resultat = (g, mort) => ({ joueur: p, gagne: g, etage: e.etage, combats: combats, pv: ps.reduce((t, q) => t + (q.fantome ? 0 : q.pv), 0) / nb, paquet: p.paquet.length, mort: mort });
  var RISQUE = { defi: 1, tresor: 1, maudit: 1 };
  function combattre(S) {
    combats++;
    DJ.demarrerCombat(e, S.id, h);
    for (var t = 0; t < 80 && e.combats[S.id]; t++) {
      ps.forEach(q => { if (e.combats[S.id] && !q.fantome) jouerTour(e, q, h); });
      if (e.combats[S.id]) DJ.tourMonstres(e, e.combats[S.id], h);
    }
    return !(e.combats[S.id] || ps.every(q => q.fantome));
  }
  for (var et = 1; et <= DJ.NB_ETAGES; et++) {
    var ordre = Object.keys(e.salles).sort((a, b) => e.salles[a].prof - e.salles[b].prof || (e.salles[a].boss ? 1 : 0) - (e.salles[b].boss ? 1 : 0));
    for (var i = 0; i < ordre.length; i++) {
      var S = e.salles[ordre[i]];
      // Pièces à risque : facultatives. Le défi est un cul-de-sac (on n'y entre pas) ; les coffres maudit et piégé se laissent fermés.
      // risque : true (en forme), 'toujours', ou un seul type ('defi', 'tresor', 'maudit') pour le mesurer à part
      var ose = risque && (risque === 'toujours' || ps.every(q => !q.fantome && q.pv >= q.pvMax * 0.75)) && (!RISQUE[risque] || risque === S.role);
      if (S.role === 'defi' && !ose) continue;
      ps.forEach(q => { q.salle = S.id; });
      DJ.decouvrir(e, p, S.id);
      if (e.ennemis.some(m => m.salle === S.id) && !combattre(S)) return resultat(false, S.role);
      ps.forEach(q => gererMenus(e, q, h));
      Object.keys(S.coffres).forEach(k => { if (S.t[+k] === 'C') DJ.ouvrirCoffre(e, S, +k % DJ.W, Math.floor(+k / DJ.W), p, h); });
      ['F', 'M', 'A'].concat(ose ? ['X'] : []).forEach(tt => { if (S.t.indexOf(tt) >= 0) ps.forEach(q => { DJ.interagir(e, q, S, tt, h); gererMenus(e, q, h); }); });
      var iT = S.t.indexOf('T');
      if (ose && iT >= 0) {
        var tx = iT % DJ.W, ty = Math.floor(iT / DJ.W);
        DJ.ouvrirTresor(e, S, tx, ty, p, h); p.piegeT = 0; DJ.ouvrirTresor(e, S, tx, ty, p, h);   // l'avertissement, puis (en insistant) l'embuscade
        if (e.ennemis.some(m => m.salle === S.id)) {
          combats++;
          for (var t2 = 0; t2 < 80 && e.combats[S.id]; t2++) {
            ps.forEach(q => { if (e.combats[S.id] && !q.fantome) jouerTour(e, q, h); });
            if (e.combats[S.id]) DJ.tourMonstres(e, e.combats[S.id], h);
          }
          if (e.combats[S.id] || ps.every(q => q.fantome)) return resultat(false, S.role);
        }
        ps.forEach(q => gererMenus(e, q, h));
        DJ.ouvrirTresor(e, S, tx, ty, p, h);
      }
    }
    ps.forEach(q => gererMenus(e, q, h));
    if (e.phase === 'fin') return resultat(true);
    DJ.etageSuivant(e);
  }
  return resultat(e.phase === 'fin' && e.fin.gagne);
}

// ---------- Une semaine (3.29) : on enchaîne les donjons du lundi au dimanche, avec trophées et éclats ----------
// Le joueur automatique : Normal jusqu'à la victoire, puis Héroïque, puis Mythique et ses clés. Rend le parcours.
function depenser(sem, p) {
  var B = DJ.D.SEMAINE.bonus, S = DJ.D.SEMAINE;
  for (var essai = 0; essai < 30; essai++) {
    var choix = ['pv', 'fiole', 'or'].map(k => ({ k: k, n: sem.b[k] || 0 })).filter(x => x.n < B[x.k].max)
      .map(x => ({ k: x.k, prix: B[x.k].prix[x.n] })).filter(x => x.prix <= sem.eclats).sort((a, b) => a.prix - b.prix)[0];
    // Travailler le paquet : retirer un Coup de griffe (tant qu'il y en a 2 ou plus), sinon améliorer la meilleure carte
    if (!sem.hero) sem.hero = { classe: p.classe, paquet: DJ.paquetDepart(p.classe, 0), reliques: [], pv: 0 };
    var pq = sem.hero.paquet;
    var griffes = pq.filter(x => x === 'griffe' || x === 'bouclier').length;
    if (sem.eclats >= S.elaguer && griffes >= 5 && (!choix || essai % 2)) { var i = pq.indexOf('griffe') >= 0 ? pq.indexOf('griffe') : pq.indexOf('bouclier'); pq.splice(i, 1); sem.eclats -= S.elaguer; continue; }
    var am = pq.map((id, i) => ({ id: id, i: i })).filter(x => DJ.ameliorable(x.id)).sort((a, b) => noteCarte(p, b.id) - noteCarte(p, a.id))[0];
    if (sem.eclats >= S.forge && am && (!choix || essai % 2)) { pq[am.i] = am.id + '+'; sem.eclats -= S.forge; continue; }
    if (!choix) return;
    sem.eclats -= choix.prix; sem.b[choix.k] = (sem.b[choix.k] || 0) + 1;
  }
}
var RISQUE_SEMAINE = process.argv.indexOf('risque-toujours') >= 0 ? 'toujours' : process.argv.indexOf('risque') >= 0;
function semaine(classe, graine, nbDonjons, avecAvantages) {
  var sem = { ouvert: 'normal', cle: 0, b: {}, eclats: 0, hero: null }, journal = [], essais = {};
  for (var k = 0; k < nbDonjons; k++) {
    var diff = sem.ouvert, peril = diff === 'mythique' ? sem.cle : 0;
    var r = partie(classe, graine * 100 + k, peril, 1, diff, avecAvantages ? Object.assign({ b: sem.b }, sem.hero || {}) : null, RISQUE_SEMAINE);
    var cle = diff + (diff === 'mythique' ? sem.cle : '');
    essais[cle] = essais[cle] || [0, 0]; essais[cle][0]++; if (r.gagne) essais[cle][1]++;
    var boss = r.gagne ? 3 : r.etage - 1;
    sem.eclats += boss * DJ.D.SEMAINE.eclats[diff];
    sem.hero = DJ.heroSemaine(r.joueur);
    depenser(sem, r.joueur);
    journal.push((diff[0].toUpperCase()) + (diff === 'mythique' ? sem.cle : '') + (r.gagne ? '✓' : '✗'));
    if (r.gagne) { if (diff === 'normal') sem.ouvert = 'heroique'; else if (diff === 'heroique') sem.ouvert = 'mythique'; else if (sem.cle < 5) sem.cle++; }
  }
  return { sem: sem, journal: journal, essais: essais };
}

if (require.main === module && process.argv[2] === 'semaine') {
  // node donjon/donjon-simulation.js semaine [semaines] [donjons par semaine] [sans]
  var ns = +process.argv[3] || 100, nd = +process.argv[4] || 10, avec = process.argv[5] !== 'sans';
  var tousEssais = {};
  ['ronces', 'force', 'bond', 'flair', 'aucune'].forEach(cl => {
    var tot = { heroique: 0, mythique: 0, cle: 0 }, atteint = { heroique: [], mythique: [] }, ess = {}, taille = 0;
    for (var i = 0; i < ns; i++) {
      var r = semaine(cl, 500 + i, nd, avec);
      var iH = r.journal.findIndex(x => x[0] !== 'N'), iM = r.journal.findIndex(x => x[0] === 'M');
      if (iH >= 0) { tot.heroique++; atteint.heroique.push(iH); }
      if (iM >= 0) { tot.mythique++; atteint.mythique.push(iM); }
      tot.cle += r.sem.cle; taille += (r.sem.hero ? r.sem.hero.paquet.length : 0);
      Object.keys(r.essais).forEach(k => { [ess, tousEssais].forEach(o => { o[k] = o[k] || [0, 0]; o[k][0] += r.essais[k][0]; o[k][1] += r.essais[k][1]; }); });
      if (i < 2) console.log('   ', cl, r.journal.join(' '), JSON.stringify(r.sem.b), r.sem.hero.reliques.join(','), r.sem.hero.paquet.length + ' cartes', '+' + r.sem.hero.pv + ' PV');
    }
    var moy = l => l.length ? (l.reduce((a, b) => a + b, 0) / l.length).toFixed(1) : '-';
    console.log(cl.padEnd(7), 'Héroïque ouvert', (100 * tot.heroique / ns).toFixed(0) + ' % (après ' + moy(atteint.heroique) + ' donjons)',
      '| Mythique ouvert', (100 * tot.mythique / ns).toFixed(0) + ' % (après ' + moy(atteint.mythique) + ')', '| clé moyenne', (tot.cle / ns).toFixed(2), '| paquet', Math.round(taille / ns),
      '| réussite', Object.keys(ess).map(k => k.slice(0, 3) + (k.match(/\d/) || [''])[0] + ' ' + Math.round(100 * ess[k][1] / ess[k][0]) + '%').join(' '));
  });
  console.log('Toutes classes :', Object.keys(tousEssais).map(k => k + ' ' + Math.round(100 * tousEssais[k][1] / tousEssais[k][0]) + '% (' + tousEssais[k][0] + ')').join(' | '));
} else if (require.main === module) {
  // 3e argument facultatif : nombre de joueurs (même classe pour tous, ou duo mixte avec « mixte »)
  // 4e argument : difficulté (normal, heroique, mythique ; héroïque par défaut)
  var n = +process.argv[2] || 200, peril = +process.argv[3] || 0, nb = +process.argv[4] || 1, diff = process.argv[5] || 'heroique', risque = process.argv[6] === 'risque-toujours' ? 'toujours' : process.argv[6] === 'risque';
  ['ronces', 'force', 'bond', 'flair', 'aucune'].forEach(cl => {
    var g = 0, et = [0, 0, 0, 0], morts = {}, pv = 0;
    for (var i = 0; i < n; i++) {
      var r = partie(cl, 1000 + i, peril, nb, diff, null, risque);
      if (r.gagne) { g++; pv += r.pv; } else { et[r.etage]++; morts[r.mort] = (morts[r.mort] || 0) + 1; }
    }
    console.log(cl.padEnd(7), 'gagnées', (100 * g / n).toFixed(0) + ' %', '| mortes aux étages 1/2/3 :', et.slice(1).join('/'), '| où :', JSON.stringify(morts), '| PV restants', g ? Math.round(pv / g) : '-');
  });
}
module.exports = { semaine: semaine, partie: partie, jouerTour: jouerTour, gererMenus: gererMenus };
