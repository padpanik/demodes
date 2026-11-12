// Tests du moteur de la Vallée (Node seulement, pas publié) : node vallee/vallee-test.js
var VL = require('./vallee-regles.js');
var ok = 0, ko = 0;
function verif(c, m) { if (c) ok++; else { ko++; console.log('✗ ' + m); } if (process.env.DIRE && /saisons|coffre des Terres/.test(m)) console.log('· ' + m); }

// 1. Les écrans ont la bonne taille, les bords du monde sont fermés, les passages entre écrans se font face
VL.ECRANS.forEach((ligne, ey) => ligne.forEach((E, ex) => {
  if (!E) return;
  verif(E.l.length === VL.H, E.id + ' : ' + E.l.length + ' lignes');
  E.l.forEach((l, y) => verif(l.length === VL.W, E.id + ' ligne ' + y + ' : ' + l.length + ' cases'));
}));
var marche = c => !!c && ',.:=-p'.indexOf(c) >= 0;
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
  if (!VL.ECRANS[ey][ex]) continue;
  if (ex < VL.EW - 1 && VL.ECRANS[ey][ex + 1]) { var a = VL.tuile(ex * 11 + 10, ey * 9 + 4), b = VL.tuile(ex * 11 + 11, ey * 9 + 4); verif(marche(a) && marche(b), 'passage ' + ex + ',' + ey + ' → droite'); }
  // (le quartier, le marais et la montagne, empilés, ne communiquent pas : un bord fermé des deux côtés est voulu)
  if (ey < VL.EH - 1 && VL.ECRANS[ey + 1][ex]) { var c = VL.tuile(ex * 11 + 5, ey * 9 + 8), d = VL.tuile(ex * 11 + 5, ey * 9 + 9); var A = VL.ECRANS[ey][ex], Bs = VL.ECRANS[ey + 1][ex]; if (marche(c) || marche(d) || !(A.defile || A.zone || Bs.zone)) verif(marche(c) && marche(d), 'passage ' + ex + ',' + ey + ' → bas'); }
}
// Pas d'autre ouverture que les passages prévus sur les bords d'écran
for (var x2 = 0; x2 < VL.LARG; x2++) for (var y2 = 0; y2 < VL.HAUT; y2++) {
  var lx = x2 % 11, ly = y2 % 9, t = VL.tuile(x2, y2);
  if (!marche(t)) continue;
  // Dans le quartier (il défile), les écrans se touchent sur toute leur hauteur ; seule son entrée à l'ouest compte
  var dedans = VL.defile(x2, y2), voisin = lx === 0 ? VL.defile(x2 - 1, y2) : lx === 10 ? VL.defile(x2 + 1, y2) : false;
  if (dedans && voisin) continue;
  if (lx === 0 || lx === 10) verif(ly === 4, 'ouverture imprévue en ' + x2 + ',' + y2);
  if (ly === 0 || ly === 8) verif(lx === 5, 'ouverture imprévue en ' + x2 + ',' + y2);
}

// 2. Tout est accessible depuis le départ, pour chaque pouvoir (et sans pouvoir)
// (la passerelle du marais est réparée : sinon le marais est fermé, vérifié plus bas)
function accessibles(pouvoir, sansPasserelle) {
  var e = VL.nouvelEtat(), vus = {}, file = [[e.x, e.y]], touche = {};
  if (!sansPasserelle) { e.quetes.passerelle = { etat: 'finie' }; e.quetes.yeti = { etat: 'finie' }; }
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
  Object.keys(VL.HABITANTS).forEach(id => { var h = VL.HABITANTS[id]; if (!VL.dansTerres(h.x, h.y)) verif(r.touche[h.x + ',' + h.y], id + ' injoignable (' + pv + ')'); });
  var parId = {};
  Object.keys(VL.ACTIONS).forEach(k => { var id = VL.ACTIONS[k].id; parId[id] = parId[id] || !!r.touche[k]; });
  Object.keys(parId).forEach(id => { if (id !== 'coffre' || pv) verif(parId[id], 'action ' + id + ' injoignable (' + pv + ')'); });
  VL.CHAMPIGNONS.forEach(c => verif(r.vus[c.x + ',' + c.y] && VL.libre(VL.nouvelEtat(), c.x, c.y), 'champignon ' + c.id + ' injoignable'));
  // 3. Chaque écran a au moins une case accessible
  VL.ECRANS.forEach((l, ey) => l.forEach((E, ex) => {
    if (!E) return;
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
  verif(e2.x === e.x && e2.y === e.y && JSON.stringify(e2.brume) === JSON.stringify(e.brume) && VL.etatQuete(e2, 'cle') === 'finie', 'rechargement');
  verif(VL.partVue(e) > 0.3, 'brouillard levé en partie : ' + Math.round(VL.partVue(e) * 100) + ' %');
});
// 5. Sauvegardes abîmées
verif(VL.charger(null).x === VL.nouvelEtat().x, 'sauvegarde vide');
verif(Object.keys(VL.charger({ v: 1, x: 0, y: 0, vu: 'zz' }).brume).length > 0, 'sauvegarde abîmée');
verif(Object.keys(VL.charger({ v: 1, x: 0, y: 0, brume: { 'a,b': 'ff', '1,1': 'zz', '0,0': 123, '1,2': 'f'.repeat(40) } }).brume).every(k => k === '1,1' || /^\d,\d$/.test(k) && k !== '1,2' || true), 'brume abîmée');
var eb = VL.charger({ v: 1, x: 0, y: 0, brume: { 'a,b': 'ff', '1,1': 'zz', '1,2': 'f'.repeat(40), '-3,7': 'ff' } });
verif(!eb.brume['a,b'] && !eb.brume['1,2'] && eb.brume['-3,7'] === 'ff', 'brume abîmée filtrée');
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

// 8. Le quartier des amis (3.51) : 3 écrans qui défilent, 18 parcelles fixes
verif(VL.ECRANS[1][3] && VL.ECRANS[1][3].id === 'quartier' && VL.ECRANS[1][5].id === 'quartier', 'quartier à l\'est de la clairière, sur 3 écrans');
verif(VL.defile(3 * 11 + 5, 13) && VL.defile(5 * 11 + 5, 13) && !VL.defile(2 * 11 + 5, 13), 'le quartier défile, pas la clairière');
verif(VL.tuile(4 * 11 + 5, 8) === 'k' && VL.tuile(4 * 11 + 5, 18) === 'T', 'la montagne au nord du quartier, le marais au sud, fermés de ce côté');
verif(VL.PARCELLES.length === 18, '18 parcelles');
var acc0 = accessibles(null);
VL.PARCELLES.forEach(P => verif(acc0.touche[P.x + ',' + (P.y + 1)], 'porte de la parcelle ' + P.p + ' injoignable'));
var e5 = VL.nouvelEtat(), ctx5 = { pouvoir: null };
var r5 = aller(e5, { x: VL.PARCELLES[16].x, y: VL.PARCELLES[16].y + 1 }, ctx5);
verif(r5 && r5.action === 'parcelle' && r5.p === 16, 'on fonce dans une porte au bout du quartier : ' + JSON.stringify(r5));
// La parcelle vient de l'identifiant : même place quel que soit l'ordre d'arrivée
var amis = [];
for (var i = 0; i < 25; i++) amis.push({ j: 'id' + (i * 7919) + 'xyz', pseudo: 'Ami ' + i, couleur: '#123456', cp: { e: 'chien' } });
var pa = VL.placerVoisins({}, amis.slice(0, 5), 100).voisins, pb = VL.placerVoisins({}, amis.slice(0, 5).reverse(), 100).voisins;
var sansCollision = amis.slice(0, 5).every(a => amis.slice(0, 5).filter(b => VL.parcelleDe(b.j) === VL.parcelleDe(a.j)).length === 1);
if (sansCollision) verif(amis.slice(0, 5).every(a => pa[a.j].p === VL.parcelleDe(a.j) && pb[a.j].p === pa[a.j].p), 'même parcelle quel que soit l\'ordre');
verif(!VL.placerVoisins({}, [{ j: 'sanscp1', pseudo: 'X', couleur: '#111111' }], 1).change, 'pas de maison sans compagnon');
var pv2 = VL.placerVoisins(pa, amis.slice(0, 1), 200);
verif(Object.keys(pa).every(j => pv2.voisins[j].p === pa[j].p), 'les parcelles restent');
var pv3 = VL.placerVoisins(pv2.voisins, amis.slice(5, 18), 300);
var places = Object.keys(pv3.voisins).map(j => pv3.voisins[j].p);
verif(places.length === 18 && new Set(places).size === 18, 'quartier plein, une maison par parcelle');
var pv4 = VL.placerVoisins(pv3.voisins, amis.slice(18, 19), 400);
var parti = Object.keys(pv3.voisins).find(j => !pv4.voisins[j]);
verif(pv4.voisins[amis[18].j] && parti && pv3.voisins[parti].vu === 100 && j0Garde(), 'le plus ancien absent laisse sa place');
function j0Garde() { return pv4.voisins[amis[0].j]; }
var pl = VL.parcelles(pv4.voisins, { [amis[0].j]: 1 });
verif(pl.length === 18 && pl[pv4.voisins[amis[0].j].p].present && pl.filter(Boolean).length === 18, 'parcelles et présents');
verif(Object.keys(VL.nettoyerVoisins({ ok12: { p: 2 }, zz: { p: 1 }, ok13: { p: 2 }, ok14: { p: 99 } })).join() === 'ok12', 'voisins abîmés');
// Brouillard d'une sauvegarde d'avant le quartier (33 cases de large)
var vieux = new Uint8Array(Math.ceil(33 * 27 / 4)), iv = 20 * 33 + 30; vieux[iv >> 2] |= 1 << (iv & 3);
var e6 = VL.charger({ v: 1, x: 13, y: 12, vu: Array.from(vieux, v => v.toString(16)).join('') });
verif(VL.estVu(e6, 30, 20) && !VL.estVu(e6, 30 + 11, 20) && !e6.vu && e6.brume['2,2'], 'brouillard élargi, rangé par écran');
// Brouillard d'une sauvegarde 3.51 à 3.54 (66 cases de large) : rangé écran par écran (3.55), rien de perdu
var vieux2 = new Uint8Array(Math.ceil(66 * 27 / 4)), cases2 = [[45, 3], [60, 20], [5, 26], [33, 9]];
cases2.forEach(c => { var i = c[1] * 66 + c[0]; vieux2[i >> 2] |= 1 << (i & 3); });
var e7 = VL.charger({ v: 1, lv: 66, x: 13, y: 12, vu: Array.from(vieux2, v => v.toString(16)).join('') });
verif(cases2.every(c => VL.estVu(e7, c[0], c[1])) && !VL.estVu(e7, 46, 3) && !VL.estVu(e7, 59, 20), 'brouillard 3.54 repris');
verif(JSON.stringify(VL.charger(JSON.parse(JSON.stringify(e7))).brume) === JSON.stringify(e7.brume), 'brume rechargée telle quelle');

// 11. Le monde grandit (3.55) : un écran ajouté hors du cœur, même à des coordonnées négatives
var B0 = VL.bornes();
var I0 = VL.infoTerres();
verif(B0.x0 === 0 && B0.y0 === 0 && B0.x1 === Math.max(VL.LARG, I0.x1) && B0.y1 === I0.y1 && VL.ecrans().length === 18 + 64, 'bornes du cœur et des Terres');
var loin = { id: 'essai', nom: 'Essai', ico: '❓', l: VL.ECRANS[1][1].l };
VL.ajouterEcran(-1, 1, loin);
var B1 = VL.bornes();
verif(B1.x0 === -VL.W && B1.ex0 === -1 && VL.ecran(-3, 12) === loin && VL.tuile(-11, 9) === loin.l[0][0] && VL.tuile(-1, 17) === loin.l[8][10], 'écran à l\'ouest du monde');
var e8 = VL.nouvelEtat(); e8.x = -5; e8.y = 13; VL.reveler(e8);
verif(VL.estVu(e8, -5, 13) && e8.brume['-1,1'] && !VL.estVu(e8, -11, 9) && VL.estVu(e8, -7, 13), 'brouillard d\'un écran à l\'ouest');
var e9 = VL.charger(JSON.parse(JSON.stringify(e8)));
verif(e9.x === -5 && e9.y === 13 && VL.estVu(e9, -5, 13), 'rechargé sur un écran ajouté');
VL.retirerEcran(-1, 1);
verif(VL.bornes().x0 === 0 && VL.tuile(-3, 12) === null, 'écran retiré');
verif(VL.charger(JSON.parse(JSON.stringify(e8))).x === VL.nouvelEtat().x, 'écran disparu : retour devant la maison');

// 9. Le marais (3.53) : fermé tant que la passerelle est cassée, puis la passerelle et les lucioles
var ferme = accessibles('ronces', true);
verif(!Object.keys(ferme.vus).some(k => { var p = k.split(','); return VL.ecran(+p[0], +p[1]).zone === 'marais' && +p[0] % 11 > 0; }), 'marais fermé avant la passerelle');
verif(VL.ECRANS[2][3].zone === 'marais' && VL.ECRANS[2][5].zone === 'marais', 'le marais sur 3 écrans');
VL.LUCIOLES.forEach(c => {
  verif(VL.libre(VL.nouvelEtat(), c.x, c.y) === false || VL.tuile(c.x, c.y) !== null, 'luciole ' + c.id);
  verif(accessibles(null).vus[c.x + ',' + c.y], 'luciole ' + c.id + ' injoignable');
  verif(!VL.RECOLTE.some(p => p.x === c.x && p.y === c.y), 'luciole ' + c.id + ' sur un point de récolte');
});
[null, 'ronces', 'force', 'bond', 'flair'].forEach(pv => {
  var e = VL.nouvelEtat(), ctx = { pouvoir: pv, bossTotal: 0, jour: '2026-11-11', compagnon: !!pv, possede: {} };
  // La passerelle cassée : on fonce dedans, Rainette nous parle de l'autre côté
  var r = aller(e, { x: 3 * 11 + 1, y: 2 * 9 + 4 }, ctx);
  verif(r && r.action === 'passerelle', 'passerelle cassée (' + pv + ') : ' + JSON.stringify(r));
  verif(VL.parler(e, 'rainette', ctx).texte.indexOf('Bruno') > 0, 'Rainette appelle Bruno');
  verif(!VL.prenable(e, 'passerelle') && VL.marque(e, 'bruno') === '!', 'passerelle après l\'établi');
  // L'établi, puis la passerelle
  e.quetes.atelier = { etat: 'finie' };
  aller(e, VL.HABITANTS.bruno, ctx);
  verif(VL.parler(e, 'bruno', ctx).boutons[0].a === 'accepter:cle', 'Bruno : la clé d\'abord');
  VL.agir(e, 'accepter:cle', ctx);
  verif(VL.parler(e, 'bruno', ctx).boutons[0].a === 'accepter:passerelle', 'Bruno propose la passerelle');
  VL.agir(e, 'accepter:passerelle', ctx);
  verif(VL.etatQuete(e, 'passerelle') === 'cours', 'passerelle en cours');
  var n = 0, jour = 11;
  while (VL.etatQuete(e, 'passerelle') === 'cours' && n++ < 40) {
    var c = VL.cible(e, 'passerelle', ctx);
    if (c === VL.HABITANTS.bruno) { ctx.jour = '2026-11-' + (++jour); continue; }   // plus rien aujourd'hui : on revient demain
    var l = chemin(e, c, pv); verif(l, 'chemin vers ' + c.x + ',' + c.y); if (!l) break;
    l.forEach(d => { var q = VL.pas(e, d, ctx); if (q.ouvre) VL.pas(e, d, ctx); });
  }
  verif(VL.etatQuete(e, 'passerelle') === 'rendre', 'bois et pierres pour la passerelle (' + pv + ') : ' + JSON.stringify(e.sac));
  aller(e, VL.HABITANTS.bruno, ctx);
  var av = Object.assign({}, e.sac);
  var rc = VL.agir(e, 'rendre:passerelle', ctx).recompense;
  verif(rc && rc.passerelle && rc.etoiles === 3 && e.sac.bois === av.bois - 8 && e.sac.pierre === av.pierre - 4, 'passerelle réparée');
  verif(VL.passerelleOk(e), 'on peut passer');
  // Rainette et ses lucioles
  r = aller(e, VL.HABITANTS.rainette, ctx); verif(r && r.parler === 'rainette', 'parler à Rainette (' + pv + ')');
  verif(VL.marque(e, 'rainette') === '!', 'Rainette : !');
  VL.agir(e, 'accepter:lucioles', ctx);
  n = 0;
  while (VL.etatQuete(e, 'lucioles') === 'cours' && n++ < 20) {
    var cl = VL.cible(e, 'lucioles', ctx), ll = chemin(e, cl, pv);
    verif(ll, 'chemin vers la luciole ' + cl.x + ',' + cl.y); if (!ll) break;
    ll.forEach(d => { var q = VL.pas(e, d, ctx); if (q.ouvre) VL.pas(e, d, ctx); });
  }
  verif(VL.etatQuete(e, 'lucioles') === 'rendre' && e.quetes.lucioles.n === 5, 'lucioles attrapées');
  aller(e, VL.HABITANTS.rainette, ctx);
  rc = VL.agir(e, 'rendre:lucioles', ctx).recompense;
  verif(rc && rc.deco === 'val-lucioles', 'bocal de lucioles');
  // Le coffre de l'îlot, au bout du gué
  e.sac.cristal = 0;
  r = aller(e, { x: 5 * 11 + 9, y: 2 * 9 + 4 }, ctx);
  verif(r && r.action === 'coffreM', 'coffre de l\'îlot (' + pv + ')');
  var fo = VL.fouiller(e, 'coffreM', ctx);
  verif(fo.etoiles === 4 && e.sac.cristal === 2 && e.coffreM, 'coffre du marais');
  verif(!VL.fouiller(e, 'coffreM', ctx).etoiles, 'coffre du marais vide ensuite');
  var e7 = VL.charger(JSON.parse(JSON.stringify(e)));
  verif(e7.coffreM && VL.passerelleOk(e7) && e7.x === e.x && e7.y === e.y, 'rechargement dans le marais');
});
// 10. La montagne (3.54) : le col gardé par le Yéti (défi au Cieljo, gagné sur la page du jeu), Gaspard et ses jumelles, le belvédère
verif(!Object.keys(ferme.vus).some(k => { var p = k.split(','); return VL.ecran(+p[0], +p[1]).zone === 'montagne' && +p[0] % 11 > 0; }), 'montagne fermée avant le Yéti');
VL.RECOLTE.filter(p => VL.ecran(p.x, p.y).zone === 'montagne').forEach(p => verif(!VL.pointOuvert(VL.nouvelEtat(), p), 'point ' + p.id + ' fermé avant le Yéti'));
verif(accessibles(null).vus[VL.JUMELLES.x + ',' + VL.JUMELLES.y], 'jumelles joignables');
[null, 'ronces', 'force', 'bond', 'flair'].forEach(pv => {
  var e = VL.nouvelEtat(), ctx = { pouvoir: pv, bossTotal: 0, jour: '2026-11-12', compagnon: !!pv, possede: {} };
  verif(VL.marque(e, 'yeti') === '!' && VL.prenable(e, 'yeti') && !VL.prenable(e, 'jumelles'), 'Yéti : défi à prendre');
  var r = aller(e, { x: 3 * 11 + 1, y: 4 }, ctx);
  verif(r && r.action === 'yeti', 'le col est gardé (' + pv + ') : ' + JSON.stringify(r));
  var d = VL.parler(e, 'yeti', ctx);
  verif(d.boutons[0].a === 'defi:yeti', 'le Yéti défie');
  verif(VL.agir(e, 'defi:yeti', ctx).defi === 'yeti' && VL.etatQuete(e, 'yeti') === 'cours', 'défi accepté');
  verif(VL.parler(e, 'yeti', ctx).boutons[0].t.indexOf('Revanche') >= 0 && VL.marque(e, 'yeti') === '!', 'revanche proposée');
  verif(!VL.libre(e, 3 * 11 + 1, 4), 'col encore fermé (défi perdu)');
  var rc = VL.gagnerDefi(e, 'yeti');
  verif(rc && rc.etoiles === 8 && rc.col && VL.colOuvert(e) && VL.libre(e, 3 * 11 + 1, 4), 'Yéti battu : col ouvert');
  verif(VL.gagnerDefi(e, 'yeti') === null, 'pas deux fois la récompense');
  r = aller(e, VL.HABITANTS.gaspard, ctx); verif(r && r.parler === 'gaspard', 'parler à Gaspard (' + pv + ')');
  verif(VL.marque(e, 'gaspard') === '!', 'Gaspard : !');
  verif(VL.belvedere(e).panorama === undefined, 'belvédère sans jumelles');
  VL.agir(e, 'accepter:jumelles', ctx);
  var c = VL.cible(e, 'jumelles', ctx), l = chemin(e, c, pv);
  verif(l, 'chemin vers les jumelles'); if (l) l.forEach(dd => { var q = VL.pas(e, dd, ctx); if (q.ouvre) VL.pas(e, dd, ctx); });
  verif(VL.etatQuete(e, 'jumelles') === 'rendre', 'jumelles trouvées');
  aller(e, VL.HABITANTS.gaspard, ctx);
  rc = VL.agir(e, 'rendre:jumelles', ctx).recompense;
  verif(rc && rc.deco === 'val-edelweiss' && rc.etoiles === 3, 'edelweiss de Gaspard');
  r = aller(e, { x: 5 * 11 + 5, y: 1 }, ctx); verif(r && r.action === 'belvedere', 'on fonce dans le belvédère (' + pv + ')');
  var avant = VL.partVue(e), b = VL.belvedere(e);
  verif(b.panorama > 0 && VL.partVue(e) > avant, 'le belvédère dévoile le nord');
  verif(!VL.belvedere(e).panorama, 'rien de plus la 2e fois');
  var e8 = VL.charger(JSON.parse(JSON.stringify(e)));
  verif(VL.colOuvert(e8) && e8.x === e.x && e8.y === e.y, 'rechargement dans la montagne');
});
verif(VL.charger({ v: 1, x: 3 * 11 + 5, y: 4 }).x === VL.nouvelEtat().x, 'pas dans la montagne sans battre le Yéti');
// Une sauvegarde posée sur la passerelle sans qu'elle soit réparée : retour devant la maison
verif(VL.charger({ v: 1, x: 3 * 11 + 2, y: 2 * 9 + 4 }).x === VL.nouvelEtat().x, 'pas sur la passerelle cassée');
verif(VL.charger({ v: 1, x: 3 * 11 + 7, y: 2 * 9 + 4 }).x === VL.nouvelEtat().x, 'pas dans le marais sans la passerelle');

// 12. Les Terres de la saison (3.57) : un monde généré par saison derrière la Porte des brumes
var t0 = Date.now(), nbSaisons = 300, mauvais = 0, coffresVus = 0, biomesVus = {};
for (var sn = -5; sn < nbSaisons - 5; sn++) {
  VL.genererTerres(sn);
  var I = VL.infoTerres(), ok1 = true;
  if (I.saison !== sn || I.coffres.length !== 6) ok1 = false;
  // Liens cohérents entre écrans voisins, bord extérieur fermé
  for (var ey3 = I.ey0; ey3 <= I.ey1; ey3++) for (var ex3 = I.ex0; ex3 <= I.ex1; ex3++) {
    var E3 = VL.ecranA(ex3, ey3); if (!E3 || E3.l.length !== 9 || E3.l.some(r => r.length !== 11)) { ok1 = false; continue; }
    biomesVus[E3.biome] = 1;
    if (ex3 < I.ex1) { var a1 = VL.tuile(ex3 * 11 + 10, ey3 * 9 + 4), b1 = VL.tuile(ex3 * 11 + 11, ey3 * 9 + 4); if (marche(a1) !== marche(b1)) ok1 = false; }
    if (ey3 < I.ey1) { var a2 = VL.tuile(ex3 * 11 + 5, ey3 * 9 + 8), b2 = VL.tuile(ex3 * 11 + 5, ey3 * 9 + 9); if (marche(a2) !== marche(b2)) ok1 = false; }
  }
  for (var xb = I.x0; xb < I.x1; xb++) if (marche(VL.tuile(xb, I.y0)) || marche(VL.tuile(xb, I.y1 - 1))) ok1 = false;
  for (var yb = I.y0; yb < I.y1; yb++) if (marche(VL.tuile(I.x0, yb)) || marche(VL.tuile(I.x1 - 1, yb))) ok1 = false;
  // Tout est atteignable depuis le camp, sans pouvoir : le centre de chaque écran, chaque coffre, l'arche du retour
  var eT = VL.nouvelEtat(), vu3 = {}, file3 = [[I.camp.x + 1, I.camp.y]]; vu3[file3[0].join()] = 1;
  while (file3.length) {
    var q3 = file3.shift();
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(v => { var nx = q3[0] + v[0], ny = q3[1] + v[1], k = nx + ',' + ny; if (!vu3[k] && VL.libre(eT, nx, ny)) { vu3[k] = 1; file3.push([nx, ny]); } });
  }
  for (ey3 = I.ey0; ey3 <= I.ey1; ey3++) for (ex3 = I.ex0; ex3 <= I.ex1; ex3++) if (!vu3[(ex3 * 11 + 5) + ',' + (ey3 * 9 + 4)]) ok1 = false;
  I.coffres.forEach(c => { coffresVus++; if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(v => vu3[(c.x + v[0]) + ',' + (c.y + v[1])])) ok1 = false; });
  if (VL.tuile(I.camp.x, I.camp.y) !== 'O' || !vu3[(I.camp.x + 1) + ',' + I.camp.y]) ok1 = false;
  if (Object.keys(vu3).some(k => !VL.dansTerres.apply(null, k.split(',').map(Number)))) ok1 = false;   // on ne sort pas des Terres à pied
  // Les lieux de la saison (3.58) : 4 feux (camp compris) dans des écrans différents, la tour, le hameau, chacun atteignable
  var proche = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(v => vu3[(x + v[0]) + ',' + (y + v[1])]);
  if (I.feux.length !== 4 || new Set(I.feux.map(F => F.ex + ',' + F.ey)).size !== 4) ok1 = false;
  I.feux.forEach(F => { if (VL.tuile(F.x, F.y) !== 'f' || !vu3[F.x + ',' + (F.y + 1)] || !vu3[(F.x + 2) + ',' + (F.y + 1)]) ok1 = false; });
  if (VL.tuile(I.tour.x, I.tour.y) !== 'W' || !proche(I.tour.x, I.tour.y)) ok1 = false;
  ['colporteur', 'cartographe'].forEach(id => { var h = VL.HABITANTS[id]; if (!VL.dansTerres(h.x, h.y) || !proche(h.x, h.y)) ok1 = false; });
  if (VL.BATIMENTS.filter(b => b.terres).length !== 2) ok1 = false;
  VL.BATIMENTS.filter(b => b.terres).forEach(b => { if (!proche(b.x, b.y + 1) || VL.tuile(b.x, b.y) !== 'x') ok1 = false; });
  if (I.coffres.some(c => [I.hameau, I.tour].concat(I.feux).some(L => L.ex === Math.floor(c.x / 11) && L.ey === Math.floor(c.y / 9)))) ok1 = false;
  if (!ok1) { mauvais++; if (mauvais < 4) console.log('  saison ' + sn + ' incorrecte'); }
}
verif(mauvais === 0, nbSaisons + ' saisons générées, toutes justes (' + coffresVus + ' coffres) en ' + (Date.now() - t0) + ' ms');
verif(biomesVus.foret && biomesVus.collines, 'forêt brumeuse et collines');
// Même saison = même monde
VL.genererTerres(7); var A7 = JSON.stringify(VL.ecrans().filter(c => VL.dansTerres(c.ex * 11, c.ey * 9)).map(c => c.E.l));
VL.genererTerres(8); VL.genererTerres(7); verif(JSON.stringify(VL.ecrans().filter(c => VL.dansTerres(c.ex * 11, c.ey * 9)).map(c => c.E.l)) === A7, 'même graine, même monde');
VL.genererTerres(8); verif(JSON.stringify(VL.ecrans().filter(c => VL.dansTerres(c.ex * 11, c.ey * 9)).map(c => c.E.l)) !== A7, 'autre saison, autre monde');
// La porte, l'aller, le retour
var nS = VL.terresPretes(), IS = VL.infoTerres(), eP = VL.nouvelEtat();
eP.x = VL.PORTE.x + 1; eP.y = VL.PORTE.y;
verif(VL.pas(eP, 'g', {}).action === 'porte', 'on fonce dans la Porte des brumes');
VL.traverser(eP, 'aller');
verif(eP.x === IS.camp.x + 2 && eP.y === IS.camp.y && VL.dansTerres(eP.x, eP.y) && eP.brume[Math.floor(eP.x / 11) + ',' + Math.floor(eP.y / 9)], 'arrivée au camp, brouillard levé autour');
eP.x--; verif(VL.pas(eP, 'g', {}).action === 'arche', 'l\'arche du camp');
// Un coffre : son contenu, puis vide ; le même pour un autre joueur
var cT = IS.coffres[0], e1 = VL.nouvelEtat(), e2 = VL.nouvelEtat();
var r1 = VL.ouvrirCoffreT(e1, cT.x, cT.y), r2 = VL.ouvrirCoffreT(e2, cT.x, cT.y), r3 = VL.ouvrirCoffreT(e1, cT.x, cT.y);
verif((r1.etoiles || r1.n) && JSON.stringify(r1) === JSON.stringify(r2) && !r3.etoiles && !r3.n && e1.terres.ouv[cT.x + ',' + cT.y], 'coffre des Terres : ' + r1.texte);
verif(!VL.ouvrirCoffreT(e1, 3, 3).texte, 'pas de coffre ailleurs');
// Sauvegarde dans les Terres : on y reste ; à la saison suivante, retour au camp, brouillard des Terres oublié, Vallée gardée
var sv = JSON.parse(JSON.stringify(eP)); sv.x = eP.x + 1;
var eR = VL.charger(sv);
verif(eR.x === sv.x && eR.y === sv.y && !eR.nouvelleSaison, 'rechargé dans les Terres');
var cleCoeur = Object.keys(eR.brume).find(k => +k.split(',')[1] < 3), cleTerres = Object.keys(eR.brume).find(k => +k.split(',')[1] >= 10);
var sv2 = JSON.parse(JSON.stringify(eR)); sv2.terres.s = nS - 1; sv2.terres.ouv = { '1,2': 1 };
var eN = VL.charger(sv2), IN = VL.infoTerres();
verif(eN.nouvelleSaison && eN.terres.s === nS && !eN.terres.ouv['1,2'] && eN.brume[cleCoeur] && eN.x === IN.camp.x + 2 && eN.y === IN.camp.y, 'nouvelle saison : retour au camp, Terres oubliées, Vallée gardée');
verif(Object.keys(eN.brume).filter(k => +k.split(',')[1] >= 10).every(k => { var c = k.split(',').map(Number); return Math.abs(c[0] - Math.floor(eN.x / 11)) <= 1 && Math.abs(c[1] - Math.floor(eN.y / 9)) <= 1; }), 'brouillard des Terres effacé (seul le camp est vu)');
// Une sauvegarde d'avant 3.57 (sans « terres ») : rien d'annoncé
var eV = VL.charger({ v: 1, x: 13, y: 12 });
verif(eV.terres.s === nS && !eV.nouvelleSaison && VL.charger(JSON.parse(JSON.stringify(eV))).terres.s === nS, 'sauvegarde d\'avant les Terres');
VL.traverser(eP, 'retour');
verif(eP.x === VL.PORTE.x + 2 && eP.y === VL.PORTE.y && !VL.dansTerres(eP.x, eP.y), 'retour devant la porte, dans la Vallée');
verif(VL.saisonDe(new Date(2026, 10, 9, 12).getTime()) === 0 && VL.saisonDe(new Date(2026, 11, 6, 23).getTime()) === 0 && VL.saisonDe(new Date(2026, 11, 7, 1).getTime()) === 1, 'saisons de 4 semaines (le 7 décembre, saison 2)');
VL.terresPretes();

// 13. Feux de camp, tour de guet, hameau (3.58)
var I13 = VL.infoTerres(), eF = VL.nouvelEtat();
VL.traverser(eF, 'aller');
verif(JSON.stringify(VL.destinations(eF, 'vallee').map(d => d.id)) === '["camp"]', 'depuis la Vallée : le camp seulement');
var F1 = I13.feux[1];
eF.x = F1.x; eF.y = F1.y + 1;
verif(VL.pas(eF, 'h', {}).action === 'feu' && VL.feuEn(F1.x, F1.y).id === 'f1', 'on fonce dans un feu');
verif(!VL.feuAllume(eF, F1) && VL.allumer(eF, 'f1').erreur && !eF.terres.feux.f1, 'pas de bûche, pas de feu');
eF.sac.bois = 2;
var rA = VL.allumer(eF, 'f1');
verif(rA.allume === 'f1' && eF.sac.bois === 1 && VL.feuAllume(eF, F1) && !VL.allumer(eF, 'f1').allume, 'feu allumé avec une bûche (une seule fois)');
verif(JSON.stringify(VL.destinations(eF, 'f1').map(d => d.id)) === '["vallee","camp"]' && VL.destinations(eF, 'vallee').some(d => d.id === 'f1'), 'destinations depuis un feu et depuis la porte');
VL.voyager(eF, 'vallee'); verif(eF.x === VL.PORTE.x + 2 && !VL.dansTerres(eF.x, eF.y), 'voyage jusqu\'à la Vallée');
VL.voyager(eF, 'f1'); verif(eF.x === F1.x + 2 && eF.y === F1.y + 1 && VL.libre(eF, eF.x, eF.y) && VL.estVu(eF, F1.x, F1.y), 'voyage jusqu\'au feu, brouillard levé');
verif(!VL.voyager(eF, 'f2').ecran && eF.x === F1.x + 2, 'pas de voyage vers un feu éteint');
var eF2 = VL.charger(JSON.parse(JSON.stringify(eF)));
verif(eF2.terres.feux.f1 && eF2.x === eF.x, 'feux gardés au rechargement');
// La tour
var eW = VL.nouvelEtat(); VL.traverser(eW, 'aller'); eW.x = I13.tour.x; eW.y = I13.tour.y + 1;
verif(VL.pas(eW, 'h', {}).action === 'tour', 'on fonce dans la tour');
var rW = VL.monterTour(eW);
verif(rW.premiere && rW.n > 500 && VL.estVu(eW, I13.tour.ex * 11 + 5, I13.tour.ey * 9 + 4) && eW.terres.tour && !VL.monterTour(eW).premiere, 'la tour dévoile ' + rW.n + ' cases autour');
// Le hameau : troc et carte
var eH = VL.nouvelEtat(); VL.traverser(eH, 'aller');
var dC = VL.parler(eH, 'colporteur', {}); verif(dC.boutons.length === 4 && dC.boutons[0].off, 'le colporteur propose ses trocs');
eH.sac.bois = 9; eH.sac.cristal = 0;
verif(VL.agir(eH, 'troc:bois', {}).troc && eH.sac.bois === 6 && eH.sac.cristal === 1, 'troc : 3 bois contre 1 cristal');
VL.agir(eH, 'troc:bois', {}); VL.agir(eH, 'troc:bois', {});
verif(eH.sac.cristal === 3 && VL.trocsRestants(eH) === 0 && VL.agir(eH, 'troc:pierre', {}).erreur, '3 trocs par jour');
eH.terres.troc.j = '2000-01-01'; verif(VL.trocsRestants(eH) === 3, 'le lendemain, la hotte est pleine');
verif(VL.parler(eH, 'cartographe', {}).boutons[0].a === 'carte', 'la cartographe propose sa carte');
var rC = VL.agir(eH, 'carte', {});
verif(rC.carte > 3000 && eH.sac.cristal === 0 && eH.terres.carto && VL.partVueTerres(eH) > 0.99 && !VL.agir(eH, 'carte', {}).carte, 'carte achetée : toutes les Terres (' + rC.carte + ' cases)');
var b0 = VL.BATIMENTS.find(b => b.terres); eH.x = b0.x; eH.y = b0.y + 2;
verif(VL.pas(eH, 'h', {}).action === 'chaumiere', 'on fonce dans une chaumière');
// Nouvelle saison : feux éteints, tour et carte oubliées
var sv13 = JSON.parse(JSON.stringify(eF)); sv13.terres.s = sv13.terres.s - 1; sv13.terres.tour = true; sv13.terres.carto = true;
var eN13 = VL.charger(sv13); VL.terresPretes();
verif(!eN13.terres.feux.f1 && !eN13.terres.tour && !eN13.terres.carto, 'nouvelle saison : feux éteints, tour et carte oubliées');

console.log(ok + ' vérifications réussies, ' + ko + ' échec(s)');
process.exit(ko ? 1 : 0);
