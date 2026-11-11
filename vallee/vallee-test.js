// Tests du moteur de la Vallée (Node seulement, pas publié) : node vallee/vallee-test.js
var VL = require('./vallee-regles.js');
var ok = 0, ko = 0;
function verif(c, m) { if (c) ok++; else { ko++; console.log('✗ ' + m); } }

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
  // (le quartier et le marais, l'un au-dessus de l'autre, ne communiquent pas : un bord fermé des deux côtés est voulu)
  if (ey < VL.EH - 1 && VL.ECRANS[ey + 1][ex]) { var c = VL.tuile(ex * 11 + 5, ey * 9 + 8), d = VL.tuile(ex * 11 + 5, ey * 9 + 9); if (marche(c) || marche(d) || !VL.ECRANS[ey][ex].defile) verif(marche(c) && marche(d), 'passage ' + ex + ',' + ey + ' → bas'); }
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
  if (!sansPasserelle) e.quetes.passerelle = { etat: 'finie' };
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

// 8. Le quartier des amis (3.51) : 3 écrans qui défilent, 18 parcelles fixes
verif(VL.ECRANS[1][3] && VL.ECRANS[1][3].id === 'quartier' && VL.ECRANS[1][5].id === 'quartier', 'quartier à l\'est de la clairière, sur 3 écrans');
verif(VL.defile(3 * 11 + 5, 13) && VL.defile(5 * 11 + 5, 13) && !VL.defile(2 * 11 + 5, 13), 'le quartier défile, pas la clairière');
verif(VL.tuile(3 * 11 + 5, 2) === null && VL.tuile(4 * 11 + 5, 18) === 'T', 'rien au nord du quartier, le marais au sud');
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
verif(VL.estVu(e6, 30, 20) && !VL.estVu(e6, 30 + 11, 20) && e6.lv === VL.LARG, 'brouillard élargi');

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
// Une sauvegarde posée sur la passerelle sans qu'elle soit réparée : retour devant la maison
verif(VL.charger({ v: 1, x: 3 * 11 + 2, y: 2 * 9 + 4 }).x === VL.nouvelEtat().x, 'pas sur la passerelle cassée');
verif(VL.charger({ v: 1, x: 3 * 11 + 7, y: 2 * 9 + 4 }).x === VL.nouvelEtat().x, 'pas dans le marais sans la passerelle');

console.log(ok + ' vérifications réussies, ' + ko + ' échec(s)');
process.exit(ko ? 1 : 0);
