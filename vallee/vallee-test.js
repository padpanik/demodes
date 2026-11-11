// Tests du moteur de la Vallée (Node seulement, pas publié) : node vallee/vallee-test.js
var VL = require('./vallee-regles.js');
var ok = 0, ko = 0;
function verif(c, m) { if (c) ok++; else { ko++; console.log('✗ ' + m); } }

// 1. Les écrans ont la bonne taille, les bords du monde sont fermés, les passages entre écrans se font face
VL.ECRANS.forEach((ligne, ey) => ligne.forEach((E, ex) => {
  verif(E.l.length === VL.H, E.id + ' : ' + E.l.length + ' lignes');
  E.l.forEach((l, y) => verif(l.length === VL.W, E.id + ' ligne ' + y + ' : ' + l.length + ' cases'));
}));
var marche = c => ',.:='.indexOf(c) >= 0;
for (var x = 0; x < VL.LARG; x++) {
  verif(!marche(VL.tuile(x, 0)), 'bord du haut ouvert en ' + x);
  verif(!marche(VL.tuile(x, VL.HAUT - 1)), 'bord du bas ouvert en ' + x);
}
for (var y = 0; y < VL.HAUT; y++) {
  verif(!marche(VL.tuile(0, y)) || VL.tuile(0, y) === null, 'bord gauche ouvert en ' + y);
  verif(!marche(VL.tuile(VL.LARG - 1, y)), 'bord droit ouvert en ' + y);
}
for (var ex = 0; ex < VL.EW; ex++) for (var ey = 0; ey < VL.EH; ey++) {
  // passage à droite : la dernière colonne et la première de l'écran voisin, ligne 4
  if (ex < VL.EW - 1) { var a = VL.tuile(ex * 11 + 10, ey * 9 + 4), b = VL.tuile(ex * 11 + 11, ey * 9 + 4); verif(marche(a) && marche(b), 'passage ' + ex + ',' + ey + ' → droite'); }
  if (ey < VL.EH - 1) { var c = VL.tuile(ex * 11 + 5, ey * 9 + 8), d = VL.tuile(ex * 11 + 5, ey * 9 + 9); verif(marche(c) && marche(d), 'passage ' + ex + ',' + ey + ' → bas'); }
}
// Pas d'autre ouverture que les passages prévus sur les bords d'écran
for (var x2 = 0; x2 < VL.LARG; x2++) for (var y2 = 0; y2 < VL.HAUT; y2++) {
  var lx = x2 % 11, ly = y2 % 9, t = VL.tuile(x2, y2);
  if (!marche(t)) continue;
  if (lx === 0 || lx === 10) verif(ly === 4, 'ouverture imprévue en ' + x2 + ',' + y2);
  if (ly === 0 || ly === 8) verif(lx === 5, 'ouverture imprévue en ' + x2 + ',' + y2);
}

// 2. Tout est accessible depuis le départ, pour chaque pouvoir (et sans pouvoir)
function accessibles(pouvoir) {
  var e = VL.nouvelEtat(), vus = {}, file = [[e.x, e.y]], touche = {};
  vus[e.x + ',' + e.y] = 1;
  while (file.length) {
    var p = file.shift();
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(v => {
      var nx = p[0] + v[0], ny = p[1] + v[1], k = nx + ',' + ny, t = VL.tuile(nx, ny);
      if (t === null) return;
      touche[k] = 1;
      if (vus[k]) return;
      var ob = VL.OBSTACLES[t];
      if (ob ? ob === pouvoir : VL.libre(e, nx, ny)) { vus[k] = 1; file.push([nx, ny]); }
    });
  }
  return { vus: vus, touche: touche };
}
[null, 'ronces', 'force', 'bond', 'flair'].forEach(pv => {
  var r = accessibles(pv);
  Object.keys(VL.HABITANTS).forEach(id => { var h = VL.HABITANTS[id]; verif(r.touche[h.x + ',' + h.y], id + ' injoignable (' + pv + ')'); });
  var parId = {};
  Object.keys(VL.ACTIONS).forEach(k => { var id = VL.ACTIONS[k].id; parId[id] = parId[id] || !!r.touche[k]; });
  Object.keys(parId).forEach(id => { if (id !== 'coffre' || pv) verif(parId[id], 'action ' + id + ' injoignable (' + pv + ')'); });
  VL.CHAMPIGNONS.forEach(c => verif(r.vus[c.x + ',' + c.y] && VL.libre(VL.nouvelEtat(), c.x, c.y), 'champignon ' + c.id + ' injoignable'));
  // 3. Chaque écran a au moins une case accessible
  VL.ECRANS.forEach((l, ey) => l.forEach((E, ex) => {
    var n = Object.keys(r.vus).filter(k => { var p = k.split(','); return Math.floor(p[0] / 11) === ex && Math.floor(p[1] / 9) === ey; }).length;
    verif(n > 10, E.id + ' presque vide (' + n + ')');
  }));
});

// 4. Déroulé des quêtes, en marchant vraiment (chemin le plus court case par case)
function chemin(e, cible, pouvoir) {
  // renvoie les directions pour aller à côté de la case cible puis foncer dedans
  var prec = {}, file = [[e.x, e.y]], dep = e.x + ',' + e.y; prec[dep] = null;
  var D = { h: [0, -1], b: [0, 1], g: [-1, 0], d: [1, 0] };
  while (file.length) {
    var p = file.shift();
    for (var d in D) {
      var nx = p[0] + D[d][0], ny = p[1] + D[d][1], k = nx + ',' + ny;
      if (nx === cible.x && ny === cible.y) {
        var l = [d], c = p[0] + ',' + p[1];
        while (prec[c]) { l.unshift(prec[c][1]); c = prec[c][0]; }
        return l;
      }
      if (k in prec) continue;
      var t = VL.tuile(nx, ny), ob = t && VL.OBSTACLES[t];
      if (ob ? (ob === pouvoir || VL.ouvert(e, nx, ny)) : VL.libre(e, nx, ny)) { prec[k] = [p[0] + ',' + p[1], d]; file.push([nx, ny]); }
    }
  }
  return null;
}
function aller(e, cible, ctx) {
  var l = chemin(e, cible, ctx.pouvoir), r = null;
  if (!l) return null;
  for (var i = 0; i < l.length; i++) {
    r = VL.pas(e, l[i], ctx);
    if (r.ouvre) r = VL.pas(e, l[i], ctx);   // l'obstacle s'ouvre, on avance
  }
  return r;
}
[null, 'ronces', 'force', 'bond', 'flair'].forEach(pv => {
  var e = VL.nouvelEtat(), ctx = { pouvoir: pv, bossTotal: 3 };
  ['lettre', 'herbes', 'cle', 'gardien'].forEach(id => verif(VL.etatQuete(e, id) === 'dispo', id + ' dispo au départ'));
  // Lettre
  var r = aller(e, VL.HABITANTS.bubo, ctx); verif(r && r.parler === 'bubo', 'parler au maire (' + pv + ')');
  verif(VL.marque(e, 'bubo') === '!', 'maire : !');
  VL.agir(e, 'accepter:lettre', ctx);
  verif(VL.marque(e, 'tortue') === '?', 'ermite : ? avec la lettre');
  r = aller(e, VL.HABITANTS.tortue, ctx); verif(r && r.parler === 'tortue', 'parler à l\'ermite');
  verif(VL.parler(e, 'tortue', ctx).boutons[0].a === 'reponse', 'l\'ermite répond');
  VL.agir(e, 'reponse', ctx);
  verif(VL.etatQuete(e, 'lettre') === 'rendre', 'lettre à rendre');
  aller(e, VL.HABITANTS.bubo, ctx);
  var rc = VL.agir(e, 'rendre:lettre', ctx).recompense;
  verif(rc && rc.deco === 'val-lanterne', 'lanterne reçue');
  // Champignons
  aller(e, VL.HABITANTS.sauge, ctx); VL.agir(e, 'accepter:herbes', ctx);
  var n = 0;
  while (VL.etatQuete(e, 'herbes') === 'cours' && n++ < 20) {
    var c = VL.cible(e, 'herbes', ctx);
    var lc = chemin(e, c, pv); verif(lc, 'chemin vers ' + c.x + ',' + c.y);
    if (!lc) break;
    lc.forEach(d => { var q = VL.pas(e, d, ctx); if (q.ouvre) VL.pas(e, d, ctx); });
  }
  verif(VL.etatQuete(e, 'herbes') === 'rendre' && e.quetes.herbes.n === 5, 'champignons ramassés : ' + (e.quetes.herbes && e.quetes.herbes.n));
  aller(e, VL.HABITANTS.sauge, ctx);
  rc = VL.agir(e, 'rendre:herbes', ctx).recompense; verif(rc && rc.etoiles === 5, '5 étoiles');
  // Clé
  aller(e, VL.HABITANTS.bruno, ctx); VL.agir(e, 'accepter:cle', ctx);
  var ci = VL.cible(e, 'cle', ctx);
  r = aller(e, ci, ctx);
  verif(r && r.action === (pv ? 'coffre' : 'chene'), 'arrivée au ' + (pv ? 'coffre' : 'chêne') + ' (' + pv + ') : ' + JSON.stringify(r));
  var f = VL.fouiller(e, r && r.action, ctx);
  verif(f.cle && e.cle, 'clé trouvée (' + pv + ')');
  verif(VL.etatQuete(e, 'cle') === 'rendre', 'clé à rendre');
  if (pv) verif(VL.fouiller(e, 'coffre', ctx).texte.indexOf('vide') > 0, 'coffre vide la 2e fois');
  aller(e, VL.HABITANTS.bruno, ctx);
  rc = VL.agir(e, 'rendre:cle', ctx).recompense; verif(rc && rc.etoiles === 8, '8 étoiles');
  // Gardien : accepté avec 3 boss déjà vaincus, rien tant qu'un boss de plus n'est pas tombé
  VL.agir(e, 'accepter:gardien', ctx);
  verif(VL.etatQuete(e, 'gardien') === 'cours', 'gardien en cours');
  VL.verifier(e, { bossTotal: 3 }); verif(VL.etatQuete(e, 'gardien') === 'cours', 'gardien : pas encore');
  VL.verifier(e, { bossTotal: 4 }); verif(VL.etatQuete(e, 'gardien') === 'rendre', 'gardien vaincu');
  rc = VL.agir(e, 'rendre:gardien', ctx).recompense; verif(rc && rc.deco === 'val-banniere', 'bannière');
  verif(VL.queteSuivie(e) === null, 'plus rien à suivre');
  // Sauvegarde et rechargement
  var s = JSON.parse(JSON.stringify(e)), e2 = VL.charger(s);
  verif(e2.x === e.x && e2.y === e.y && e2.vu === e.vu && VL.etatQuete(e2, 'cle') === 'finie', 'rechargement');
  verif(VL.partVue(e) > 0.3, 'brouillard levé en partie : ' + Math.round(VL.partVue(e) * 100) + ' %');
});
// 5. Sauvegardes abîmées
verif(VL.charger(null).x === VL.nouvelEtat().x, 'sauvegarde vide');
verif(VL.charger({ v: 1, x: 0, y: 0, vu: 'zz' }).vu.length > 0, 'sauvegarde abîmée');
verif(VL.charger({ v: 1, x: 999, y: 3 }).x === VL.nouvelEtat().x, 'position hors carte');
// 6. Pas d'obstacle franchi sans le bon pouvoir
var e3 = VL.nouvelEtat();
e3.x = 2 * 11 + 7; e3.y = 2 * 9 + 3;   // au-dessus des ronces du bosquet
var r3 = VL.pas(e3, 'b', { pouvoir: 'force' });
verif(r3.obstacle === 'ronces' && e3.y === 2 * 9 + 3, 'ronces fermées sans le feu');
r3 = VL.pas(e3, 'b', { pouvoir: 'ronces' }); verif(r3.ouvre === 'ronces', 'ronces brûlées');
r3 = VL.pas(e3, 'b', { pouvoir: 'force' }); verif(r3.bouge, 'on passe ensuite');

// 7. Récolte et fabrication (3.50)
var ids = {};
VL.RECOLTE.forEach(p => {
  verif(!ids[p.x + ',' + p.y], 'deux points de récolte en ' + p.id); ids[p.x + ',' + p.y] = 1;
  verif(VL.libre(VL.nouvelEtat(), p.x, p.y), 'point ' + p.id + ' sur une case où l\'on ne marche pas');
  verif(!VL.CHAMPIGNONS.some(c => c.x === p.x && c.y === p.y), 'point ' + p.id + ' sur un champignon');
  [null, 'ronces', 'force', 'bond', 'flair'].forEach(pv => verif(accessibles(pv).vus[p.x + ',' + p.y], 'point ' + p.id + ' injoignable (' + pv + ')'));
});
VL.RECETTES.forEach(r => { verif(VL.LIEUX_FAB[r.ou], 'recette ' + r.id + ' : lieu'); Object.keys(r.cout).forEach(k => verif(VL.RESSOURCES[k] && r.cout[k] <= VL.SAC_MAX, 'recette ' + r.id + ' : coût')); });
[null, 'ronces', 'force', 'bond', 'flair'].forEach(pv => {
  var e = VL.nouvelEtat(), ctx = { pouvoir: pv, bossTotal: 0, jour: '2026-11-11', compagnon: !!pv, possede: {} };
  verif(!VL.ouvertFab(e, 'etabli'), 'établi fermé au départ');
  aller(e, VL.HABITANTS.bruno, ctx);
  verif(VL.marque(e, 'bruno') === '!', 'Bruno : !');
  verif(VL.parler(e, 'bruno', ctx).boutons[0].a === 'accepter:atelier', 'Bruno propose l\'établi d\'abord');
  VL.agir(e, 'accepter:atelier', ctx);
  verif(VL.parler(e, 'bruno', ctx).boutons[0].a === 'accepter:cle', 'puis la clé');
  // On suit l'anneau orange jusqu'à avoir 3 bois et 3 pierres
  var n = 0;
  while (VL.etatQuete(e, 'atelier') === 'cours' && n++ < 20) {
    var c = VL.cible(e, 'atelier', ctx), l = chemin(e, c, pv);
    verif(l, 'chemin vers le point ' + c.x + ',' + c.y); if (!l) break;
    l.forEach(d => { var q = VL.pas(e, d, ctx); if (q.ouvre) VL.pas(e, d, ctx); });
  }
  verif(VL.etatQuete(e, 'atelier') === 'rendre', 'bois et pierres réunis (' + pv + ') : ' + JSON.stringify(e.sac));
  verif(VL.marque(e, 'bruno') === '?', 'Bruno : ?');
  var avant = Object.assign({}, e.sac);
  aller(e, VL.HABITANTS.bruno, ctx);
  var rc = VL.agir(e, 'rendre:atelier', ctx).recompense;
  verif(rc && rc.atelier && rc.etoiles === 3, 'établi réparé');
  verif(e.sac.bois === avant.bois - 3 && e.sac.pierre === avant.pierre - 3, 'bois et pierres donnés');
  verif(VL.ouvertFab(e, 'etabli') && VL.ouvertFab(e, 'hutte') && !VL.ouvertFab(e, 'forge'), 'établi et hutte ouverts, forge froide');
  // Bonus du pouvoir
  verif(VL.gain(e, 'bois', ctx) === (pv === 'ronces' ? 4 : 2), 'gain de bois (' + pv + ')');
  verif(VL.gain(e, 'pierre', ctx) === (pv === 'force' ? 4 : 2), 'gain de pierre (' + pv + ')');
  verif(VL.gain(e, 'plante', ctx) === (pv === 'bond' ? 4 : 2), 'gain de plantes (' + pv + ')');
  // Un point ramassé ne redonne rien le même jour, et repousse le lendemain
  var p = VL.RECOLTE.find(k => k.res === 'plante');
  e.x = p.x; e.y = p.y - 1;
  var ok1 = VL.libre(e, p.x, p.y - 1);
  if (ok1) {
    var q = VL.pas(e, 'b', ctx); verif(q.recolte === 'plante', 'plante ramassée');
    VL.pas(e, 'h', ctx); q = VL.pas(e, 'b', ctx); verif(!q.recolte, 'pas deux fois le même jour');
    VL.pas(e, 'h', ctx); q = VL.pas(e, 'b', Object.assign({}, ctx, { jour: '2026-11-12' })); verif(q.recolte === 'plante', 'repousse le lendemain');
  }
  // Sac plein
  e.sac.cristal = VL.SAC_MAX;
  var cr = VL.RECOLTE.find(k => k.res === 'cristal' && !k.filon);
  verif(VL.recolter(e, cr, ctx).sacPlein === 'cristal', 'sac plein');
  e.sac.cristal = 0;
  verif(VL.recolter(e, VL.RECOLTE.find(k => k.filon), ctx).filon, 'filon sans pioche');
  // Fabrication
  e.sac = { bois: 20, pierre: 20, plante: 20, cristal: 20 };
  var f = VL.fabriquer(e, 'fab-tabouret', ctx);
  verif(pv ? f.ok && f.deco === 'fab-tabouret' && e.sac.bois === 17 : !!f.erreur, 'tabouret (' + pv + ')');
  verif(VL.etatRecette(e, VL.recette('fab-tabouret'), { compagnon: true, possede: { 'fab-tabouret': 1 } }).fait, 'déco déjà faite');
  verif(VL.fabriquer(e, 'hache', ctx).erreur, 'forge froide');
  for (var i = 0; i < 8; i++) VL.fabriquer(e, 'soin', ctx);
  verif(VL.besaceTotal(e) === VL.BESACE_MAX, 'besace limitée : ' + VL.besaceTotal(e));
  verif(JSON.stringify(VL.prendreFioles(e, ['soin', 'soin', 'force'])) === '["soin","soin"]', 'fioles emportées');
  e.quetes.cle = { etat: 'finie' };
  verif(VL.fabriquer(e, 'pioche', ctx).ok && e.outils.pioche, 'pioche forgée');
  verif(VL.fabriquer(e, 'pioche', ctx).erreur, 'pas deux pioches');
  verif(VL.gain(e, 'pierre', ctx) === (pv === 'force' ? 5 : 3), 'pioche : +1 pierre');
  e.sac.cristal = 0; e.sac.pierre = 0;
  var fl = VL.recolter(e, VL.RECOLTE.find(k => k.filon), ctx);
  verif(fl.recolte === 'cristal' && e.sac.cristal === 1 && e.sac.pierre === 1, 'filon avec la pioche');
  // Rechargement
  var e2 = VL.charger(JSON.parse(JSON.stringify(e)));
  verif(JSON.stringify(e2.sac) === JSON.stringify(e.sac) && e2.outils.pioche && JSON.stringify(e2.besace) === JSON.stringify(e.besace) && e2.recolte.j === e.recolte.j, 'rechargement du sac');
});
var e4 = VL.charger({ v: 1, sac: { bois: 999, pierre: -4, plante: 'x' }, besace: { soin: 50, poison: 3 }, outils: { hache: 1, epee: 1 }, recolte: { j: '2026-01-01', pris: { r0: 1, zz: 1 } } });
verif(e4.sac.bois === VL.SAC_MAX && e4.sac.pierre === 0 && e4.sac.plante === 0, 'sac abîmé');
verif(VL.besaceTotal(e4) === VL.BESACE_MAX && !e4.besace.poison && e4.outils.hache && !e4.outils.epee && !e4.recolte.pris.zz, 'besace et outils abîmés');

console.log(ok + ' vérifications réussies, ' + ko + ' échec(s)');
process.exit(ko ? 1 : 0);
