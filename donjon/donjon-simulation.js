// ================== DONJON : SIMULATION D'ÉQUILIBRAGE (Node seulement, pas servi par le site) ==================
// Un joueur automatique raisonnable traverse des donjons complets (3 étages) : combats, butin, feu de camp, marchand, autel.
// node donjon/donjon-simulation.js [parties par classe] [péril] [joueurs] [difficulté : normal | heroique | mythique]
// Repère : un humain attentif joue mieux que ce joueur automatique (il lit mieux les intentions et construit son paquet).

var DJ = require('./donjon-regles.js');
var D = DJ.D;

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
  var k = DJ.carte(id), v = 0, cout = k.cout;
  if (k.injouable || cout > p.energie) return -1;
  if (k.type === 'pouvoir') return p.tourCombat <= 2 ? 30 : 8;
  k.fx.forEach(f => {
    if (f.deg !== undefined) v += f.deg * (f.x || 1) * (f.tous ? ms.length : 1) + (p.etats.force || 0) * (f.x || 1);
    if (f.armure) v += Math.min(f.armure, Math.max(0, besoin)) * 1.3 + 0.5;
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
  });
  return v / Math.max(0.6, cout);
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
    var k = DJ.carte(p.main[bi]), cible = k.cible === 'monstre' ? cibleAttaque(ms, k).id : null;
    if (DJ.jouerCarte(e, p.nom, bi, cible, h)) break;
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
      r = best >= 10 && (p.paquet.length < 26 || best >= 18) ? DJ.choisir(e, p.nom, 'prendre', bi, h) : DJ.choisir(e, p.nom, 'passer', null, h);
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
      var choix = { coffre: 1, des: 1, autel: p.pv > p.pvMax * 0.5 ? 0 : 1, fontaine: p.pv < p.pvMax * 0.8 ? 0 : 1, miroir: 0, grimoires: 0, enclume: 0, champignons: 0 }[m.id] || 0;
      r = DJ.choisir(e, p.nom, 'choix', choix, h);
      if (r) r = DJ.choisir(e, p.nom, 'choix', 1 - choix, h);
      if (r) p.menus.shift();
    } else if (m.type === 'paquet') {
      var l = p.paquet.map((id, i) => ({ id: id, i: i }));
      var pick;
      if (m.mode === 'retirer') pick = l.find(x => x.id === 'blessure') || l.find(x => x.id === 'griffe') || l[0];
      else if (m.mode === 'ameliorer') pick = l.filter(x => DJ.ameliorable(x.id)).sort((a, b) => noteCarte(p, b.id) - noteCarte(p, a.id))[0];
      else pick = l.filter(x => DJ.carte(x.id).type !== 'malediction').sort((a, b) => noteCarte(p, b.id) - noteCarte(p, a.id))[0];
      r = pick ? DJ.choisir(e, p.nom, 'carte', pick.i, h) : DJ.choisir(e, p.nom, 'annuler', null, h);
    }
    if (r && p.menus[0] === m) p.menus.shift();
  }
}

// ---------- Une partie complète (1 à 4 joueurs automatiques qui avancent ensemble) ----------
var ESPECE = { ronces: 'dragon', force: 'panda', bond: 'lapin', flair: 'renard', aucune: null };
function partie(classe, graine, peril, nb, diff, av) {
  nb = nb || 1;
  var h = DJ.hasard(graine * 31 + 7), classes = Array.isArray(classe) ? classe : [classe], js = {};
  for (var j = 0; j < nb; j++) {
    var cl = classes[j % classes.length], nom = j ? 'Bot' + (j + 1) : 'Bot';
    js[nom] = ESPECE[cl] ? { e: ESPECE[cl], c: '#c8915a', n: nom, p: {} } : null;
  }
  var avs = {}; if (av) Object.keys(js).forEach(n => { avs[n] = av; });
  var e = DJ.nouvelle(graine, js, 'sim' + graine, { peril: peril, difficulte: diff || 'heroique', avantages: avs });
  var ps = Object.keys(e.joueurs).map(n => e.joueurs[n]), p = ps[0], combats = 0;
  var resultat = (g, mort) => ({ joueur: p, gagne: g, etage: e.etage, combats: combats, pv: ps.reduce((t, q) => t + (q.fantome ? 0 : q.pv), 0) / nb, paquet: p.paquet.length, mort: mort });
  for (var et = 1; et <= DJ.NB_ETAGES; et++) {
    var ordre = Object.keys(e.salles).sort((a, b) => e.salles[a].prof - e.salles[b].prof || (e.salles[a].boss ? 1 : 0) - (e.salles[b].boss ? 1 : 0));
    for (var i = 0; i < ordre.length; i++) {
      var S = e.salles[ordre[i]];
      ps.forEach(q => { q.salle = S.id; });
      if (e.ennemis.some(m => m.salle === S.id)) {
        combats++;
        DJ.demarrerCombat(e, S.id, h);
        for (var t = 0; t < 80 && e.combats[S.id]; t++) {
          ps.forEach(q => { if (e.combats[S.id] && !q.fantome) jouerTour(e, q, h); });
          if (e.combats[S.id]) DJ.tourMonstres(e, e.combats[S.id], h);
        }
        if (e.combats[S.id] || ps.every(q => q.fantome)) return resultat(false, S.role);
      }
      ps.forEach(q => gererMenus(e, q, h));
      Object.keys(S.coffres).forEach(k => { if (S.t[+k] === 'C') DJ.ouvrirCoffre(e, S, +k % DJ.W, Math.floor(+k / DJ.W), p, h); });
      ['F', 'M', 'A'].forEach(tt => { if (S.t.indexOf(tt) >= 0) ps.forEach(q => { DJ.interagir(e, q, S, tt, h); gererMenus(e, q, h); }); });
    }
    ps.forEach(q => gererMenus(e, q, h));
    if (e.phase === 'fin') return resultat(true);
    DJ.etageSuivant(e);
  }
  return resultat(e.phase === 'fin' && e.fin.gagne);
}

// ---------- Une semaine (3.29) : on enchaîne les donjons du lundi au dimanche, avec trophées et éclats ----------
// Le joueur automatique : Normal jusqu'à la victoire, puis Héroïque, puis Mythique et ses clés. Rend le parcours.
var RANG = { r: 3, u: 2, c: 1 };
function choisirTrophee(p, tr) {
  if (tr.length >= DJ.D.SEMAINE.trophees) return;
  var l = DJ.tropheesPossibles(p, tr);
  if (!l.length) return;
  l.sort((a, b) => valeurTrophee(p, b) - valeurTrophee(p, a));
  tr.push(l[0]);
}
function valeurTrophee(p, t) { return t[0] === 'r' ? 20 + 5 * (RANG[DJ.D.RELIQUES[t[1]].rar] || 0) : noteCarte(p, t[1]); }
function depenser(sem) {
  var B = DJ.D.SEMAINE.bonus;
  for (var essai = 0; essai < 20; essai++) {
    var choix = ['pv', 'aiguise', 'fiole', 'or'].map(k => ({ k: k, n: sem.b[k] || 0 })).filter(x => x.n < B[x.k].max)
      .map(x => ({ k: x.k, prix: B[x.k].prix[x.n] })).filter(x => x.prix <= sem.eclats).sort((a, b) => a.prix - b.prix)[0];
    if (!choix) return;
    sem.eclats -= choix.prix; sem.b[choix.k] = (sem.b[choix.k] || 0) + 1;
  }
}
function semaine(classe, graine, nbDonjons, avecAvantages) {
  var sem = { ouvert: 'normal', cle: 0, tr: [], b: {}, eclats: 0 }, journal = [];
  for (var k = 0; k < nbDonjons; k++) {
    var diff = sem.ouvert, peril = diff === 'mythique' ? sem.cle : 0;
    var r = partie(classe, graine * 100 + k, peril, 1, diff, avecAvantages ? { tr: sem.tr, b: sem.b } : null);
    var boss = r.gagne ? 3 : r.etage - 1;
    sem.eclats += boss * DJ.D.SEMAINE.eclats[diff];
    choisirTrophee(r.joueur, sem.tr);
    depenser(sem);
    journal.push((diff[0].toUpperCase()) + (diff === 'mythique' ? sem.cle : '') + (r.gagne ? '✓' : '✗'));
    if (r.gagne) { if (diff === 'normal') sem.ouvert = 'heroique'; else if (diff === 'heroique') sem.ouvert = 'mythique'; else if (sem.cle < 5) sem.cle++; }
  }
  return { sem: sem, journal: journal };
}

if (require.main === module && process.argv[2] === 'semaine') {
  // node donjon/donjon-simulation.js semaine [semaines] [donjons par semaine] [sans]
  var ns = +process.argv[3] || 100, nd = +process.argv[4] || 10, avec = process.argv[5] !== 'sans';
  ['ronces', 'force', 'bond', 'flair', 'aucune'].forEach(cl => {
    var tot = { heroique: 0, mythique: 0, cle: 0 }, atteint = { heroique: [], mythique: [] };
    for (var i = 0; i < ns; i++) {
      var r = semaine(cl, 500 + i, nd, avec);
      var iH = r.journal.findIndex(x => x[0] !== 'N'), iM = r.journal.findIndex(x => x[0] === 'M');
      if (iH >= 0) { tot.heroique++; atteint.heroique.push(iH); }
      if (iM >= 0) { tot.mythique++; atteint.mythique.push(iM); }
      tot.cle += r.sem.cle;
      if (i < 2) console.log('   ', cl, r.journal.join(' '), JSON.stringify(r.sem.b), r.sem.tr.map(t => t[1]).join(','));
    }
    var moy = l => l.length ? (l.reduce((a, b) => a + b, 0) / l.length).toFixed(1) : '-';
    console.log(cl.padEnd(7), 'Héroïque ouvert', (100 * tot.heroique / ns).toFixed(0) + ' % (après ' + moy(atteint.heroique) + ' donjons)',
      '| Mythique ouvert', (100 * tot.mythique / ns).toFixed(0) + ' % (après ' + moy(atteint.mythique) + ')', '| clé moyenne', (tot.cle / ns).toFixed(2));
  });
} else if (require.main === module) {
  // 3e argument facultatif : nombre de joueurs (même classe pour tous, ou duo mixte avec « mixte »)
  // 4e argument : difficulté (normal, heroique, mythique ; héroïque par défaut)
  var n = +process.argv[2] || 200, peril = +process.argv[3] || 0, nb = +process.argv[4] || 1, diff = process.argv[5] || 'heroique';
  ['ronces', 'force', 'bond', 'flair', 'aucune'].forEach(cl => {
    var g = 0, et = [0, 0, 0, 0], morts = {}, pv = 0;
    for (var i = 0; i < n; i++) {
      var r = partie(cl, 1000 + i, peril, nb, diff);
      if (r.gagne) { g++; pv += r.pv; } else { et[r.etage]++; morts[r.mort] = (morts[r.mort] || 0) + 1; }
    }
    console.log(cl.padEnd(7), 'gagnées', (100 * g / n).toFixed(0) + ' %', '| mortes aux étages 1/2/3 :', et.slice(1).join('/'), '| où :', JSON.stringify(morts), '| PV restants', g ? Math.round(pv / g) : '-');
  });
}
module.exports = { semaine: semaine, partie: partie, jouerTour: jouerTour, gererMenus: gererMenus };
