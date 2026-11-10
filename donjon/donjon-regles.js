// ================== DONJON DES COMPAGNONS : CARTE, POUVOIRS, COMBAT, SIMULATION ==================
// Un donjon de 3 étages vu de dessus, pièce par pièce, exploré seul ou à plusieurs en temps réel « doux ».
// Chaque compagnon a un pouvoir selon son espèce (débroussailler, force, bond, flair) : il ouvre les obstacles
// et donne sa classe de cartes. Chaque étage : clés, portes, salles spéciales (feu de camp, marchand, autel),
// un élite qui garde la grande clé et un boss ; l'escalier mène à l'étage suivant.
// Combat aux cartes à énergie (façon « roguelike de cartes ») : les chiffres sont dans donjon-donnees.js.
// Chez l'hôte (ou en solo), la page appelle DJ.tick(e, maintenant) dix fois par seconde ; l'état est ensuite diffusé.
// Utilisé par donjon/index.html ; testable avec Node (module.exports en bas).

var DJ = (function () {
  var D = typeof DJD !== 'undefined' ? DJD : require('./donjon-donnees.js');
  var W = 11, H = 9;                       // une pièce : 11 × 9 cases (bords compris)
  var GX = 4, GY = 4;                      // le plan d'un étage : 4 × 4 pièces au plus
  var PAS = 200;                           // un pas toutes les 0,2 s quand on garde le doigt sur la croix
  var REANIMATION = 2000;
  var NB_ETAGES = 3;
  var MAIN = 5, MAIN_MAX = 10, ENERGIE = 3;
  var DX = { h: [0, -1], b: [0, 1], g: [-1, 0], d: [1, 0] };
  var OPP = { h: 'b', b: 'h', g: 'd', d: 'g' };
  var PORTE = { h: [5, 0], b: [5, 8], g: [0, 4], d: [10, 4] };   // l'ouverture de chaque côté d'une pièce
  var CENTRE = [5, 4];

  // Cases (une lettre par case, 99 lettres par pièce)
  //  . sol   # mur   O pilier   r ronces   R rocher   v trou   = planche   s mur secret
  //  L porte verrouillée   B porte du boss   G grille   _ dalle   C coffre   c coffre ouvert
  //  F feu de camp   M marchand   A autel   E escalier   X coffre maudit   T grand coffre piégé   t le même, ouvert
  var MARCHABLE = { '.': 1, '=': 1, '_': 1 };

  // ---------- Pouvoirs des compagnons ----------
  var POUVOIRS = {
    ronces: { nom: 'Débroussailler', ico: '🔥', obstacle: 'r', especes: 'dragon, chat ou oie', quoi: 'des ronces' },
    force: { nom: 'Force', ico: '💪', obstacle: 'R', especes: 'panda, tortue ou chèvre', quoi: 'un rocher' },
    bond: { nom: 'Bond', ico: '🦘', obstacle: 'v', especes: 'lapin, écureuil ou singe', quoi: 'un trou' },
    flair: { nom: 'Flair', ico: '👃', obstacle: 's', especes: 'chien, renard ou raton laveur', quoi: 'un passage secret' }
  };
  var PAR_OBSTACLE = { r: 'ronces', R: 'force', v: 'bond', s: 'flair' };
  var ESPECES = {
    dragon: { pouvoir: 'ronces', action: 'crache du feu sur les ronces' },
    chat: { pouvoir: 'ronces', action: 'griffe les ronces' },
    oie: { pouvoir: 'ronces', action: 'arrache les ronces à coups de bec' },
    panda: { pouvoir: 'force', action: 'casse le rocher' },
    tortue: { pouvoir: 'force', action: 'fonce dans le rocher, carapace en avant' },
    chevre: { pouvoir: 'force', action: 'casse le rocher d\'un coup de cornes' },
    lapin: { pouvoir: 'bond', action: 'saute le trou et pose une planche' },
    ecureuil: { pouvoir: 'bond', action: 'bondit par-dessus le trou et pose une planche' },
    singe: { pouvoir: 'bond', action: 'se balance au-dessus du trou et pose une planche' },
    chien: { pouvoir: 'flair', action: 'flaire un passage secret' },
    renard: { pouvoir: 'flair', action: 'déniche un passage secret' },
    raton: { pouvoir: 'flair', action: 'trouve un passage secret' }
  };
  function pouvoirDe(cp) { var x = cp && ESPECES[cp.e]; return x ? x.pouvoir : null; }
  var MONSTRES = D.MONSTRES, CARTES = D.CARTES, ETATS = D.ETATS, RELIQUES = D.RELIQUES, FIOLES = D.FIOLES, CLASSES = D.CLASSES;

  // ---------- Hasard reproductible ----------
  function hasard(graine) {
    var a = (graine >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function entier(h, n) { return Math.floor(h() * n); }
  function melanger(l, h) { l = l.slice(); for (var i = l.length - 1; i > 0; i--) { var j = entier(h, i + 1), x = l[i]; l[i] = l[j]; l[j] = x; } return l; }
  function auHasard(l, h) { return l[entier(h, l.length)]; }

  // ================== CARTES ==================
  // Une carte améliorée a l'identifiant « griffe+ »
  var cacheCartes = {};
  function carte(id) {
    if (cacheCartes[id]) return cacheCartes[id];
    var plus = /\+$/.test(id), b = CARTES[plus ? id.slice(0, -1) : id];
    if (!b) return null;
    var c = Object.assign({}, b, { id: id, base: b.id, plus: plus });
    if (plus) {
      var p = b.plus || {};
      c.nom = b.nom + '+';
      if (p.cout !== undefined) c.cout = p.cout;
      if (p.fx) c.fx = p.fx;
      if (p.epuise !== undefined) c.epuise = p.epuise;
      if (p.texte) c.texte = p.texte;
    }
    c.texte = texteCarte(c);
    return (cacheCartes[id] = c);
  }
  function ameliorable(id) { var c = carte(id); return !!(c && !c.plus && c.type !== 'malediction'); }
  var NOM_ETAT = function (e) { return ETATS[e] ? ETATS[e].nom : e; };
  function texteFx(f) {
    if (f.special) return null;
    var tous = f.tous ? ' à tous' : '';
    if (f.deg !== undefined) return (f.x > 1 ? f.deg + ' dégâts ×' + f.x : f.deg + ' dégâts') + tous;
    if (f.armure) return '+' + f.armure + ' armure';
    if (f.pioche) return 'Pioche ' + f.pioche;
    if (f.energie) return '+' + f.energie + ' ⚡';
    if (f.etat) return NOM_ETAT(f.etat) + ' ' + f.n + tous;
    if (f.buff) return ETATS[f.buff] ? ETATS[f.buff].texte.replace('{n}', f.n).replace(' tour·s', '') : f.buff;
    if (f.soin) return 'Soigne ' + f.soin + ' PV';
    return '';
  }
  function texteCarte(c) {
    var t;
    if (c.texte && c.fx.some(f => f.special)) {
      var sp = c.fx.find(f => f.special);
      t = c.texte.replace('{n}', sp.n).replace('{x}', sp.x);
    } else t = c.texte || c.fx.map(texteFx).filter(Boolean).join(', ');
    if (c.type === 'pouvoir') t += ' (tout le combat)';
    if (c.cible === 'joueur') t += ' (toi ou un ami)';
    if (c.epuise) t += '. Épuisée';
    return t;
  }

  // ================== PLAN D'UN ÉTAGE ==================
  function plan(h, n) {
    var x0 = entier(h, GX), depart = x0 + ',' + (GY - 1), salles = {};
    salles[depart] = { id: depart, x: x0, y: GY - 1, parent: null, prof: 0, portes: {} };
    var liste = [depart], essais = 0;
    while (liste.length < n && essais++ < 900) {
      // on pousse plutôt depuis les dernières pièces : des couloirs qui s'enfoncent, avec quelques embranchements
      var base = salles[liste[liste.length - 1 - entier(h, Math.min(4, liste.length))]];
      var d = ['h', 'b', 'g', 'd'][entier(h, 4)], v = DX[d], x = base.x + v[0], y = base.y + v[1], id = x + ',' + y;
      if (x < 0 || y < 0 || x >= GX || y >= GY || salles[id]) continue;
      salles[id] = { id: id, x: x, y: y, parent: base.id, prof: base.prof + 1, portes: {} };
      base.portes[d] = id; salles[id].portes[OPP[d]] = base.id;
      liste.push(id);
    }
    return { salles: salles, liste: liste, depart: depart };
  }
  function ancetres(S, id) { var l = []; while (id) { l.push(id); id = S[id].parent; } return l; }

  // Intérieur des pièces : piliers (jamais sur la croix du milieu, qui relie les portes)
  var MODELES = [
    [],
    [[2, 2], [8, 2], [2, 6], [8, 6]],
    [[3, 2], [7, 2], [3, 6], [7, 6]],
    [[2, 2], [3, 2], [7, 2], [8, 2], [2, 6], [3, 6], [7, 6], [8, 6]],
    [[3, 3], [7, 3], [3, 5], [7, 5]]
  ];
  var COINS = [[1, 1], [9, 1], [1, 7], [9, 7]];
  var DALLES = [[2, 6], [8, 6]];
  function idx(x, y) { return y * W + x; }
  function tuile(S, x, y) { return S.t[idx(x, y)]; }
  function poser(S, x, y, c) { var i = idx(x, y); S.t = S.t.slice(0, i) + c + S.t.slice(i + 1); }
  function pres(a, x, y, d) { return Math.abs(a[0] - x) <= d && Math.abs(a[1] - y) <= d; }

  // ---------- Génération : l'étage dépend des pouvoirs présents dans le groupe ----------
  // Pièces : départ, boss (au plus profond), feu de camp (juste avant le boss), élite (gardien de la grande clé),
  // marchand, autel, et des pièces de combat.
  function generer(graine, pouvoirs, humains, etage, lieu) {
    pouvoirs = (pouvoirs || []).filter((p, i, l) => POUVOIRS[p] && l.indexOf(p) === i);
    etage = etage || 1;
    for (var k = 0; k < 80; k++) {
      // 3.40 : une pièce de plus par étage, pour la pièce à risque (facultative)
      var h = hasard((graine >>> 0) + k * 7919 + etage * 104729), n = humains >= 3 ? 11 : 10, p = plan(h, n);
      if (p.liste.length < n) continue;
      var boss = p.liste.reduce((a, b) => p.salles[b].prof > p.salles[a].prof ? b : a, p.depart);
      if (p.salles[boss].prof < 3) continue;
      // Les trois types de pièce à risque tournent d'un étage à l'autre ; l'ordre de départ dépend de la graine
      var R = D.RISQUES.ordre, risque = R[(entier(hasard(((graine >>> 0) ^ 0x51ed27) + 11), R.length) + etage) % R.length];
      return construire(h, p, boss, pouvoirs, humains || 1, etage, risque, lieu);
    }
    throw new Error('Donjon impossible à générer');
  }
  function construire(h, p, boss, pouvoirs, humains, etage, risque, lieu) {
    var S = p.salles, enfants = p.liste.filter(id => id !== p.depart), porte = {};
    enfants.forEach(id => { porte[id] = ''; });
    porte[boss] = 'B';
    // Obstacles sur les passages (côté de la pièce d'où l'on arrive) : chaque pouvoir du groupe sert au moins une fois
    var autres = melanger(enfants.filter(id => id !== boss), h), k = 0;
    melanger(pouvoirs, h).forEach(pw => { if (k < autres.length - 1) porte[autres[k++]] = POUVOIRS[pw].obstacle; });
    if (k < autres.length) porte[autres[k++]] = 'L';
    if (humains >= 2 && k < autres.length) porte[autres[k++]] = 'G';
    if (pouvoirs.length && k < autres.length && h() < 0.6) porte[autres[k++]] = POUVOIRS[pouvoirs[entier(h, pouvoirs.length)]].obstacle;

    // Rôle des pièces
    var role = {};
    p.liste.forEach(id => { role[id] = 'combat'; });
    role[p.depart] = 'depart'; role[boss] = 'boss';
    var feu = S[boss].parent;
    if (feu !== p.depart) role[feu] = 'feu';
    var loin = p.liste.filter(id => role[id] === 'combat').sort((a, b) => S[b].prof - S[a].prof);
    var elite = loin[0];
    role[elite] = 'elite';
    var reste = melanger(p.liste.filter(id => role[id] === 'combat'), h);
    if (reste.length > 2) role[reste.shift()] = 'marchand';
    if (reste.length > 2) role[reste.shift()] = 'autel';
    if (role[feu] !== 'feu' && reste.length > 2) role[reste.shift()] = 'feu';
    // Pièce à risque (3.40) : de préférence un cul-de-sac, pour qu'on puisse toujours l'éviter.
    // Le défi (un élite) ne se pose que dans un cul-de-sac ; sinon c'est un coffre maudit, qui ne barre pas le passage.
    if (risque && reste.length > 3) {
      var culs = reste.filter(id => !Object.keys(S[id].portes).some(d => S[S[id].portes[d]].parent === id));
      if (risque === 'defi' && !culs.length) risque = 'maudit';
      var rq = culs.length ? culs[0] : reste[0];
      reste.splice(reste.indexOf(rq), 1);
      role[rq] = risque;
    }
    var combats = p.liste.filter(id => role[id] === 'combat').sort((a, b) => S[a].prof - S[b].prof);

    // Coffres : la petite clé avant sa porte, la grande clé chez l'élite, un trésor (relique), de l'or et des poussières
    var coffres = {};   // pièce -> [contenu…]
    function mettre(id, c) { if ((coffres[id] = coffres[id] || []).length < 4) coffres[id].push(c); }
    Object.keys(porte).forEach(id => { if (porte[id] === 'L') { var a = ancetres(S, S[id].parent); mettre(a[entier(h, a.length)], 'cle'); } });
    mettre(elite, 'grandecle');
    if (combats.length) mettre(combats[combats.length - 1], 'relique');
    melanger(combats, h).slice(0, 2).forEach((id, i) => mettre(id, i ? 'or' : 'poussiere'));
    var etg = lieu || D.ETAGES[etage - 1];   // 3.41 : monstres, élites et boss du lieu tiré pour cet étage
    // L'élite qui garde la grande clé ; l'autre attend dans la salle du défi
    var typeElite = auHasard(etg.elites, h), typeDefi = etg.elites.filter(t => t !== typeElite)[0] || typeElite;

    var ennemis = [], num = 0;
    p.liste.forEach(id => {
      var s = S[id], aGrille = Object.keys(s.portes).some(d => S[s.portes[d]].parent === id && porte[s.portes[d]] === 'G');
      var vide = role[id] !== 'combat';
      var modele = vide ? [] : MODELES[aGrille ? entier(h, 2) : entier(h, MODELES.length)];
      var t = '';
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) t += (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? '#' : '.';
      s.t = t; s.coffres = {}; s.dalles = []; s.boss = id === boss; s.role = role[id];
      modele.forEach(c => poser(s, c[0], c[1], 'O'));
      Object.keys(s.portes).forEach(d => {
        var voisin = s.portes[d], P = PORTE[d], g = S[voisin].parent === id ? porte[voisin] : '';
        poser(s, P[0], P[1], g || '.');
        if (g === 'G') DALLES.forEach(c => { poser(s, c[0], c[1], '_'); s.dalles.push(c); });
      });
      (coffres[id] || []).forEach((c, i) => { var co = COINS[i]; poser(s, co[0], co[1], 'C'); s.coffres[idx(co[0], co[1])] = c; });
      if (role[id] === 'feu') poser(s, CENTRE[0], CENTRE[1], 'F');
      if (role[id] === 'marchand') poser(s, CENTRE[0], CENTRE[1] - 1, 'M');
      if (role[id] === 'autel') { poser(s, CENTRE[0], CENTRE[1] - 1, 'A'); s.evenement = auHasard(Object.keys(D.EVENEMENTS).filter(ev => !D.EVENEMENTS[ev].hors), h); }
      if (role[id] === 'maudit') { poser(s, CENTRE[0], CENTRE[1] - 1, 'X'); s.evenement = 'coffremaudit'; }
      if (role[id] === 'tresor') poser(s, CENTRE[0], CENTRE[1] - 1, 'T');
      // Monstres : une rencontre par pièce de combat (la plus proche du départ est facile), l'élite, le boss
      var groupe = null;
      if (role[id] === 'boss') groupe = [etg.boss];
      else if (role[id] === 'elite') groupe = [typeElite];
      else if (role[id] === 'defi') groupe = [typeDefi];
      else if (role[id] === 'combat') groupe = auHasard(id === combats[0] ? etg.faciles : etg.rencontres, h).slice();
      if (!groupe) return;
      if (groupe.length === 1 && (MONSTRES[groupe[0]].taille || 1) > 1) { ennemis.push({ type: groupe[0], salle: id, x: 5, y: 3 }); return; }
      var libres = [];
      for (var yy = 2; yy <= 6; yy++) for (var xx = 2; xx <= 8; xx++) {
        if (tuile(s, xx, yy) !== '.' || Object.keys(PORTE).some(d => s.portes[d] && pres(PORTE[d], xx, yy, 2))) continue;
        libres.push([xx, yy]);
      }
      melanger(libres, h).slice(0, groupe.length).forEach((c, i) => { ennemis.push({ type: groupe[i], salle: id, x: c[0], y: c[1] }); });
    });
    var salles = {};
    p.liste.forEach(id => { var s = S[id]; salles[id] = { id: id, x: s.x, y: s.y, prof: s.prof, portes: s.portes, t: s.t, coffres: s.coffres, dalles: s.dalles, boss: s.boss, role: s.role, evenement: s.evenement || null }; });
    return { salles: salles, depart: p.depart, boss: boss, ennemis: ennemis, h: h };
  }

  // ---------- Monstres ----------
  // Taille du groupe pour renforcer les monstres : joueurs au départ, ou plus si des amis sont arrivés depuis
  function nbGroupe(e) { return Math.max(e.nbJ || 1, Object.keys(e.joueurs || {}).length); }
  // Difficulté de la partie (une partie d'avant 3.23 n'en a pas : Héroïque, comme avant)
  function difficulte(e) { return D.DIFFICULTES[e.difficulte] || D.DIFFICULTES.heroique; }
  // Dégâts de base d'une attaque de monstre (péril 4 : +1 ; seul : selon la difficulté ; à plusieurs : selon le nombre de joueurs du combat)
  // nbCombat = joueurs vivants du combat ; un coup de zone (i.tous) frappe déjà chacun : pas de bonus de groupe (3.26, l'Écrasement faisait 40 à chacun à deux)
  function attaqueMonstre(e, i, nbCombat) {
    var d = difficulte(e), n = (i.att + (e.peril >= 3 ? 1 : 0) + (e.peril >= 5 ? 1 : 0)) * (d.base ? d.base.deg : 1) * (1 + D.CLE_PAR_NIVEAU.deg * (e.peril || 0));
    if (nbGroupe(e) <= 1) return n * d.solo.deg;
    if (i.tous) return n;
    return n * (1 + d.groupe.deg * Math.max(0, (nbCombat || 1) - 1));
  }
  // Multiplicateur de PV des monstres pour n joueurs (seul : celui de la difficulté)
  function facteurPv(e, n) { var d = difficulte(e); return n <= 1 ? d.solo.pv : 1 + d.groupe.pv * (n - 1); }
  // Les PV suivent le nombre de joueurs qui combattent vraiment (3.26) : un joueur seul dans la pièce n'affronte pas des monstres taillés pour tout le groupe.
  // On ne fait que monter (un ami KO ne rend pas les monstres plus faibles) ; les PV perdus gardent leur proportion.
  function ajusterPv(e, c) {
    var n = Math.max(1, c.joueurs.length);
    monstresDe(e, c).forEach(m => {
      if (m.f == null) { m.f = facteurPv(e, nbGroupe(e)); m.pvBase = m.pvMax / m.f; }
      var f = facteurPv(e, n);
      if (m.combatF != null && f <= m.combatF) return;
      var max = Math.max(1, Math.round(m.pvBase * f));
      m.pv = Math.max(1, Math.round(m.pv * max / m.pvMax)); m.pvMax = max; m.f = f; m.combatF = f;
    });
  }
  function creerMonstre(e, type, salle, x, y, h) {
    var M = MONSTRES[type], r = M.rang || 'normal';
    var pv = M.pv[0] + entier(h, M.pv[1] - M.pv[0] + 1);
    if (e.peril >= 1 && r === 'normal') pv *= 1.15;
    if (e.peril >= 2 && r !== 'normal') pv *= 1.15;
    if (e.peril >= 4) pv *= 1.1;
    pv *= ((difficulte(e).base || {}).pv || 1) * (1 + D.CLE_PAR_NIVEAU.pv * (e.peril || 0));   // 3.30 : Héroïque et Mythique taillés pour un paquet construit pendant la semaine
    var f = facteurPv(e, nbGroupe(e)), base = pv;
    pv = Math.round(base * f);
    var m = { id: ++e.seq, type: type, salle: salle, x: x, y: y, pv: pv, pvMax: pv, pvBase: base, f: f, pas: 0, dir: 'b', armure: 0, etats: {}, k: 0, mem: {}, intention: null, cible: null };
    e.ennemis.push(m);
    return m;
  }

  // ---------- Lieux (3.41) : chaque étage est tiré parmi plusieurs lieux (D.ETAGES[n].lieux), e.lieux = un identifiant par étage ----------
  // Une partie d'avant 3.41 n'a pas e.lieux : ce sont les lieux d'origine. forces (simulation, essais) : { 1: 'champignonniere' } ou ['caves', …].
  function tirerLieux(graine, forces) {
    forces = forces || {};
    var h = hasard(((graine >>> 0) ^ 0x2f6e2b1) + 977);
    return D.ETAGES.map(function (E, i) {
      var f = Array.isArray(forces) ? forces[i] : forces[i + 1], t = auHasard(E.lieux, h);
      return f && E.lieux.indexOf(f) >= 0 ? f : t;
    });
  }
  function lieuDe(e, etage) {
    etage = etage || e.etage || 1;
    var E = D.ETAGES[etage - 1] || D.ETAGES[0], L = e.lieux && D.LIEUX[e.lieux[etage - 1]];
    return L && L.etage === E.etage ? L : E;
  }
  // La règle propre au lieu de l'étage en cours (null pour les lieux d'origine)
  function regleLieu(e) { var L = lieuDe(e); return (L.regle && D.REGLES_LIEU[L.regle]) || null; }

  // ================== PARTIE ==================
  // joueurs : { pseudo: résumé du compagnon ({ e, c, n, p }) ou null } ; options : { peril, difficulte ('normal', 'heroique', 'mythique') }
  var FORMAT = 3;
  function nouvelle(graine, joueurs, id, options) {
    options = options || {};
    var noms = Object.keys(joueurs), pouvoirs = noms.map(n => pouvoirDe(joueurs[n])).filter(Boolean);
    var e = { id: id || String(graine), graine: graine, phase: 'jeu', format: FORMAT, etage: 0, peril: options.difficulte === 'mythique' ? Math.max(0, Math.min(D.PERILS.length - 1, options.peril | 0)) : 0,   // clé mythique : seulement en Mythique
              difficulte: D.DIFFICULTES[options.difficulte] ? options.difficulte : 'heroique',
              nbJ: noms.length, salles: {}, depart: null, bossSalle: null, carteV: 1, ennemis: [], seq: 0, joueurs: {}, cles: 0, grandeCle: false,
              poussiere: 0, objets: [], effets: [], annonces: [], vues: {}, fin: null, debut: 0, maintenant: 0, pouvoirs: pouvoirs, combats: {},
              lieux: tirerLieux(graine, options.lieux) };
    var avs = options.avantages || {};
    noms.forEach(n => ajouterJoueur(e, n, joueurs[n], avs[n]));
    etageSuivant(e);
    return e;
  }
  function etageSuivant(e) {
    e.etage++;
    var c = generer(e.graine, e.pouvoirs, e.nbJ, e.etage, lieuDe(e));
    e.salles = c.salles; e.depart = c.depart; e.bossSalle = c.boss; e.carteV++;
    e.ennemis = []; e.cles = 0; e.grandeCle = false; e.objets = []; e.vues = {}; e.combats = {};
    c.ennemis.forEach(m => creerMonstre(e, m.type, m.salle, m.x, m.y, c.h));
    e.vues[c.depart] = 1;
    Object.values(e.joueurs).forEach((p, i) => {
      var d = DEPARTS[i % DEPARTS.length];
      p.salle = e.depart; p.x = d[0]; p.y = d[1]; p.d = null; p.unPas = null;
      p.armure = 0; p.etats = {}; p.main = []; p.pioche = []; p.defausse = []; p.epuisees = []; p.energie = 0; p.tourCombat = 0;
      p.menus = (p.menus || []).filter(m => m.type === 'butin' || m.type === 'reliqueBoss' || m.type === 'choix');
      if (e.etage > 1) {
        if (p.fantome) { p.fantome = false; p.pv = 1; }
        p.pv += Math.floor((p.pvMax - p.pv) / 2);
      }
    });
    var L = lieuDe(e), R = regleLieu(e);
    if (e.etage > 1) annonce(e, L.ico + ' Étage ' + e.etage + ' : ' + L.nom + '. Le repos du voyage rend la moitié des PV perdus.');
    if (R) annonce(e, R.ico + ' ' + L.nom + ' : ' + R.court + '.');
  }
  function compatible(e) {
    return !!(e && e.format === FORMAT && e.salles && e.joueurs && e.combats && Array.isArray(e.ennemis) &&
      Object.values(e.joueurs).every(p => p && Array.isArray(p.paquet) && Array.isArray(p.menus)));
  }
  var DEPARTS = [[5, 6], [4, 6], [6, 6], [5, 5], [4, 5], [6, 5], [3, 6], [7, 6]];
  function paquetDepart(classe, peril) {
    var l = ['griffe', 'griffe', 'griffe', 'griffe', 'bouclier', 'bouclier', 'bouclier', 'bouclier'].concat(CLASSES[classe].base);
    if (peril >= 5) l.push('blessure');
    return l;
  }
  function ajouterJoueur(e, nom, cp, av) {
    if (e.joueurs[nom]) { if (cp) { e.joueurs[nom].cp = cp; } return e.joueurs[nom]; }
    var n = Object.keys(e.joueurs).length, d = DEPARTS[n % DEPARTS.length], pw = pouvoirDe(cp), classe = pw || 'aucune';
    var pv = CLASSES[classe].pv;
    var p = (e.joueurs[nom] = { nom: nom, ordre: n, salle: e.depart, x: d[0], y: d[1], dir: 'h', fantome: false, reanim: 0,
      cp: cp || null, pouvoir: pw, classe: classe, pas: 0, d: null, unPas: null, aideT: 0,
      pv: pv, pvMax: pv, or: 40, paquet: paquetDepart(classe, e.peril), reliques: [], fioles: [], fiolesMax: 2, menus: [], faits: {}, boutiques: {}, retraits: 0,
      pioche: [], main: [], defausse: [], epuisees: [], armure: 0, etats: {}, energie: 0, joues: 0, jouesTotal: 0 });
    appliquerAvantages(e, p, av);
    return p;
  }

  // ---------- Le héros de la semaine (3.30) ----------
  // av = { classe, paquet, reliques, pv, b } : le paquet, les reliques et les PV max gagnés à la fin du donjon d'avant, plus les bonus
  // achetés avec les éclats. Envoyé par chaque téléphone : vérifié avant de s'en servir. Une seule relique de boss reste d'un donjon à l'autre.
  function nettoyerAvantages(av) {
    if (!av || typeof av !== 'object') return null;
    if (av.hero && !av.classe) av = Object.assign({ b: av.b }, av.hero);   // déjà vérifié une fois (chez l'hôte) : même forme
    var S = D.SEMAINE, b = {}, hero = null;
    Object.keys(S.bonus).forEach(k => { var n = av.b && av.b[k] | 0; if (n > 0) b[k] = Math.min(n, S.bonus[k].max); });
    if (av.classe && CLASSES[av.classe] && Array.isArray(av.paquet)) {
      var paquet = av.paquet.slice(0, S.paquetMax).map(String).filter(id => { var c = carte(id); return c && c.type !== 'malediction'; });
      var reliques = [], boss = 0;
      (Array.isArray(av.reliques) ? av.reliques : []).forEach(r => {
        if (!RELIQUES[r] || reliques.indexOf(r) >= 0 || reliques.length >= S.reliquesMax) return;
        if (RELIQUES[r].rar === 'boss') { if (boss >= S.bossMax) return; boss++; }
        reliques.push(r);
      });
      if (paquet.length >= 5) hero = { classe: av.classe, paquet: paquet, reliques: reliques, pv: Math.max(0, Math.min(S.pvMax, av.pv | 0)) };
    }
    return { b: b, hero: hero };
  }
  function appliquerAvantages(e, p, av) {
    av = nettoyerAvantages(av);
    if (!av) return;
    var b = av.b, h = hasard((e.graine | 0) * 7 + p.ordre * 101 + 3), B = D.SEMAINE.bonus, H = av.hero;
    // Le héros de la semaine : son paquet, ses reliques (sans rejouer leurs PV : ils sont déjà comptés dans « pv ») et ses PV max
    if (H && H.classe === p.classe) {
      p.paquet = H.paquet.slice();
      if (e.peril >= 5) p.paquet.push('blessure');
      H.reliques.forEach(r => donnerRelique(e, p, r, h, null, true));
      p.pvMax += H.pv; p.pv += H.pv;
    }
    p.bonusPv = b.pv ? B.pv.val * b.pv : 0;   // pour ne pas le compter deux fois dans le héros de la semaine
    if (b.pv) { p.pvMax += p.bonusPv; p.pv += p.bonusPv; }
    if (b.or) p.or += B.or.val * b.or;
    for (var i = 0; i < (b.fiole || 0); i++) donnerFiole(e, p, null, h);
    p.semaine = { hero: !!(H && H.classe === p.classe), b: Object.keys(b).length };
  }
  // Le héros à garder pour la semaine, à la fin d'un donjon : le paquet sans malédiction (le repos les efface), les reliques,
  // les PV max gagnés en chemin (sans les bonus achetés avec les éclats, rachetés à chaque fois)
  var RANG_REL = { boss: 4, r: 3, u: 2, c: 1 };
  // Reliques gardées par défaut : les plus rares d'abord, une seule de boss
  function reliquesParDefaut(p) {
    var S = D.SEMAINE, l = [], boss = 0;
    (p.reliques || []).filter(r => RELIQUES[r]).slice().sort((a, b) => RANG_REL[RELIQUES[b].rar] - RANG_REL[RELIQUES[a].rar]).forEach(r => {
      if (l.length >= S.reliquesMax) return;
      if (RELIQUES[r].rar === 'boss') { if (boss >= S.bossMax) return; boss++; }
      l.push(r);
    });
    return l;
  }
  function heroSemaine(p, choix) {
    var reliques = Array.isArray(choix) ? choix.filter(r => (p.reliques || []).indexOf(r) >= 0) : reliquesParDefaut(p);
    return { classe: p.classe, paquet: (p.paquet || []).filter(id => { var c = carte(id); return c && c.type !== 'malediction'; }),
             reliques: reliques, pv: Math.max(0, Math.min(D.SEMAINE.pvMax, (p.pvMax || 0) - CLASSES[p.classe].pv - (p.bonusPv || 0))) };
  }
  // Commandes reçues : direction tenue (ou null au lâcher)
  function entree(e, nom, d) {
    var p = e.joueurs[nom];
    if (!p) return;
    if (d && DX[d]) { p.d = d; p.unPas = d; } else p.d = null;   // un toucher bref fait quand même un pas
  }

  function annonce(e, txt, pour) {
    e.annonces.push({ id: ++e.seq, txt: txt, t: e.maintenant, pour: pour || null });
    if (e.annonces.length > 6) e.annonces.shift();
  }
  function effet(e, salle, x, y, k) { e.effets.push({ id: ++e.seq, salle: salle, x: x, y: y, k: k, t: e.maintenant }); }
  function nomCp(p) { return p.cp && p.cp.n ? p.cp.n : p.surnom || p.nom; }
  function ennemiEn(e, salle, x, y) { return e.ennemis.find(m => m.salle === salle && m.x === x && m.y === y); }
  function aide(e, p, txt) {
    if (e.maintenant < p.aideT) return;
    p.aideT = e.maintenant + 3000;
    annonce(e, txt, p.nom);
  }
  function a(p, id) { return p.reliques.indexOf(id) >= 0; }
  function soigner(p, n) { if (p.fantome) return 0; var av = p.pv; p.pv = Math.min(p.pvMax, p.pv + n); return p.pv - av; }

  // ---------- Butin ----------
  function donnerOr(e, p, n) { p.or += n; }
  function donnerFiole(e, p, id, h) {
    id = id || auHasard(Object.keys(FIOLES), h);
    if (p.fioles.length >= p.fiolesMax) return null;
    p.fioles.push(id);
    return id;
  }
  function donnerRelique(e, p, id, h, rar, sansPv) {
    if (!id) {
      var l = Object.keys(RELIQUES).filter(r => RELIQUES[r].rar !== 'boss' && !a(p, r) && (!rar || RELIQUES[r].rar === rar));
      if (!l.length) l = Object.keys(RELIQUES).filter(r => RELIQUES[r].rar !== 'boss' && !a(p, r));
      if (!l.length) return null;
      id = auHasard(l, h);
    }
    if (a(p, id)) return null;
    p.reliques.push(id);
    if (id === 'pomme' && !sansPv) { p.pvMax += 8; p.pv += 8; }
    if (id === 'calice' && !sansPv) { p.pvMax += 20; p.pv = p.pvMax; }
    if (id === 'ceinture') p.fiolesMax++;
    if (id === 'grimoire') p.paquet.push('blessure');
    if (id === 'pierre' && !sansPv) melanger(p.paquet.map((c, k) => k).filter(k => ameliorable(p.paquet[k])), h || Math.random).slice(0, 3).forEach(k => { p.paquet[k] += '+'; });
    return id;
  }
  // Trois cartes au choix : surtout de la classe du compagnon ; les élites et les boss donnent des cartes plus rares
  var CHANCES = { normal: { c: 0.6, u: 0.33 }, elite: { c: 0.35, u: 0.45 }, boss: { c: 0, u: 0 }, grimoire: { c: 0, u: 0.7 }, voyageur: { c: 0, u: 0.4 } };
  function tirerCartes(p, n, rang, h) {
    var ch = CHANCES[rang] || CHANCES.normal, l = [];
    for (var essai = 0; l.length < n && essai < 60; essai++) {
      var r = h(), rar = r < ch.c ? 'c' : r < ch.c + ch.u ? 'u' : 'r';
      var classe = p.classe !== 'aucune' && h() < 0.7 ? p.classe : null;
      var pool = Object.keys(CARTES).filter(id => CARTES[id].rar === rar && CARTES[id].cl === classe && l.indexOf(id) < 0);
      if (!pool.length) continue;
      l.push(auHasard(pool, h));
    }
    return l;
  }

  // ---------- Coffres ----------
  function ouvrirCoffre(e, S, x, y, p, h) {
    if (e.ennemis.some(m => m.salle === S.id)) { aide(e, p, '🔒 Le coffre est gardé : battez d\'abord les monstres de la pièce.'); return; }
    var c = S.coffres[idx(x, y)];
    poser(S, x, y, 'c'); e.carteV++;
    effet(e, S.id, x, y, 'coffre');
    var ici = Object.values(e.joueurs).filter(q => q.salle === S.id && !q.fantome);
    if (c === 'cle') { e.cles++; annonce(e, '🗝️ ' + nomCp(p) + ' trouve une petite clé !'); }
    else if (c === 'grandecle') { e.grandeCle = true; annonce(e, '🔑 ' + nomCp(p) + ' trouve la grande clé du boss !'); }
    else if (c === 'relique') {
      ici.forEach(q => { var r = donnerRelique(e, q, null, h); if (r) annonce(e, RELIQUES[r].ico + ' Trésor ! ' + nomCp(q) + ' trouve : ' + RELIQUES[r].nom + '. ' + RELIQUES[r].texte + '.'); });
    } else if (c === 'or') {
      var n = 25 + entier(h, 16);
      ici.forEach(q => donnerOr(e, q, n));
      annonce(e, '🪙 Un coffre plein d\'or : +' + n + ' or' + (ici.length > 1 ? ' chacun' : '') + ' !');
    } else { e.poussiere += 3; annonce(e, '✨ ' + nomCp(p) + ' trouve 3 poussières d\'étoile !'); }
  }

  // Grand coffre piégé (3.40) : on prévient d'abord ; il faut insister (encore dessus 1,2 s plus tard, ou y revenir) pour déclencher
  // l'embuscade : toute la pièce combat, surprise (Vulnérable). Les monstres battus, le coffre s'ouvre pour ceux qui sont là.
  var INSISTER = 1200;
  var PLACES = [[3, 3], [7, 3], [3, 5], [7, 5], [5, 6], [2, 4], [8, 4]];
  function ouvrirTresor(e, S, x, y, p, h) {
    h = h || Math.random;
    var T = D.RISQUES.tresor;
    if (e.ennemis.some(m => m.salle === S.id)) { aide(e, p, '🔒 Le coffre est gardé : battez d\'abord les monstres de la pièce.'); return; }
    if (!S.piege) {
      var cleP = e.etage + ':' + S.id;
      if (p.piegeVu !== cleP) { p.piegeVu = cleP; p.piegeT = e.maintenant + INSISTER; p.aideT = 0; aide(e, p, '💰 Ce coffre sent le piège… Insiste si tu veux l\'ouvrir quand même.'); return; }
      if (e.maintenant < p.piegeT) return;   // le doigt est resté sur la croix : on laisse le temps de lire
      S.piege = 1; e.carteV++;
      var libres = PLACES.filter(q => MARCHABLE[tuile(S, q[0], q[1])] && !Object.values(e.joueurs).some(j => j.salle === S.id && Math.abs(j.x - q[0]) + Math.abs(j.y - q[1]) < 1));
      auHasard(lieuDe(e).rencontres, h).slice(0, libres.length).forEach((type, i) => creerMonstre(e, type, S.id, libres[i][0], libres[i][1], h));
      annonce(e, '💥 C\'était un piège ! Des monstres surgissent autour de ' + nomCp(p) + ' !');
      e.embuscade = S.id;
      demarrerCombat(e, S.id, h);
      delete e.embuscade;
      return;
    }
    poser(S, x, y, 't'); e.carteV++;
    effet(e, S.id, x, y, 'coffre');
    var ici = Object.values(e.joueurs).filter(q => q.salle === S.id && !q.fantome), n = T.or[0] + entier(h, T.or[1] - T.or[0] + 1);
    ici.forEach(q => { donnerOr(e, q, n); donnerFiole(e, q, null, h); });
    e.poussiere += T.poussiere;
    annonce(e, '💰 Le grand coffre s\'ouvre : +' + n + ' or' + (ici.length > 1 ? ' chacun' : '') + ', une fiole et ' + T.poussiere + ' poussières d\'étoile !');
  }

  // ---------- Salles spéciales : feu de camp, marchand, autel, escalier ----------
  function interagir(e, p, S, t, h) {
    if (t === 'F') {
      if (p.faits[S.id]) { aide(e, p, '🔥 Tu t\'es déjà reposé à ce feu.'); return; }
      p.menus.push({ type: 'feu', salle: S.id });
    } else if (t === 'M') {
      if (!p.boutiques[S.id]) p.boutiques[S.id] = creerBoutique(e, p, h);
      p.menus.push({ type: 'marchand', salle: S.id });
    } else if (t === 'A' || t === 'X') {
      if (p.faits[S.id]) { aide(e, p, t === 'X' ? '🔮 Tu as déjà fait ton choix devant ce coffre.' : '❓ Il n\'y a plus rien ici.'); return; }
      p.menus.push({ type: 'evenement', salle: S.id, id: S.evenement || 'fontaine' });
    } else if (t === 'E') {
      if (Object.keys(e.combats).length) { aide(e, p, '🪜 Attendez que tout le monde ait fini son combat.'); return; }
      annonce(e, '🪜 ' + nomCp(p) + ' descend l\'escalier : tout le groupe le suit !');
      etageSuivant(e);
    }
  }
  function remise(p) { return a(p, 'bon') ? 0.8 : 1; }
  function creerBoutique(e, p, h) {
    var x = remise(p);
    var cartes = tirerCartes(p, 5, 'elite', h).map(id => ({ id: id, prix: Math.round(D.PRIX[CARTES[id].rar] * (0.9 + h() * 0.2) * x), vendu: false }));
    var fioles = melanger(Object.keys(FIOLES), h).slice(0, 2).map(id => ({ id: id, prix: Math.round(D.PRIX.fiole * x), vendu: false }));
    var rl = Object.keys(RELIQUES).filter(r => RELIQUES[r].rar !== 'boss' && !a(p, r));
    return { cartes: cartes, fioles: fioles, relique: rl.length ? { id: auHasard(rl, h), prix: Math.round(D.PRIX.relique * x), vendu: false } : null };
  }
  function prixRetrait(p) { return Math.round((D.PRIX.retrait + 25 * (p.retraits || 0)) * remise(p)); }
  function soinFeu(e, p) { if (a(p, 'lampe')) return 0; return Math.round(p.pvMax * (e.peril >= 4 ? 0.2 : 0.3)) + (a(p, 'carte') ? 15 : 0); }

  // Choix dans la fenêtre ouverte du joueur (butin, feu de camp, marchand, autel, paquet)
  function choisir(e, nom, action, arg, h) {
    h = h || Math.random;
    var p = e.joueurs[nom], m = p && p.menus[0];
    if (!m) return 'Rien à choisir';
    arg = arg === undefined || arg === null ? null : +arg;
    function fermer() { p.menus.shift(); }
    function remplacer(n) { p.menus[0] = n; }
    if (m.type === 'butin' || m.type === 'choix') {
      if (action === 'prendre' && m.cartes[arg]) { p.paquet.push(m.cartes[arg]); fermer(); return null; }
      if (action === 'passer') { if (m.type === 'choix' && m.ensuite) { remplacer(m.ensuite); return null; } fermer(); return null; }
      return 'Choix inconnu';
    }
    if (m.type === 'reliqueBoss') {
      if (action === 'prendre' && m.choix[arg]) { donnerRelique(e, p, m.choix[arg], h); fermer(); return null; }
      return 'Choix inconnu';
    }
    if (m.type === 'feu') {
      if (action === 'repos') {
        var n = soigner(p, soinFeu(e, p)); p.faits[m.salle] = 1;
        annonce(e, '🔥 ' + nomCp(p) + ' se repose au coin du feu (+' + n + ' PV).');
        // Marteau de forgeron : le repos laisse aussi le temps d'améliorer une carte
        if (a(p, 'marteau') && p.paquet.some(ameliorable)) remplacer({ type: 'paquet', mode: 'ameliorer', salle: m.salle }); else fermer();
        return null;
      }
      if (action === 'aiguiser') { if (!p.paquet.some(ameliorable)) return 'Rien à améliorer'; remplacer({ type: 'paquet', mode: 'ameliorer', salle: m.salle, retour: m }); return null; }
      if (action === 'partir') { fermer(); return null; }
      return 'Choix inconnu';
    }
    if (m.type === 'marchand') {
      var b = p.boutiques[m.salle];
      if (action === 'carte' && b.cartes[arg] && !b.cartes[arg].vendu) {
        var o = b.cartes[arg]; if (p.or < o.prix) return 'Pas assez d\'or';
        p.or -= o.prix; o.vendu = true; p.paquet.push(o.id); return null;
      }
      if (action === 'fiole' && b.fioles[arg] && !b.fioles[arg].vendu) {
        var f = b.fioles[arg]; if (p.or < f.prix) return 'Pas assez d\'or';
        if (p.fioles.length >= p.fiolesMax) return 'Plus de place pour une fiole';
        p.or -= f.prix; f.vendu = true; p.fioles.push(f.id); return null;
      }
      if (action === 'relique' && b.relique && !b.relique.vendu) {
        if (p.or < b.relique.prix) return 'Pas assez d\'or';
        p.or -= b.relique.prix; b.relique.vendu = true; donnerRelique(e, p, b.relique.id, h); return null;
      }
      if (action === 'retrait') { if (p.or < prixRetrait(p)) return 'Pas assez d\'or'; remplacer({ type: 'paquet', mode: 'retirer', prix: prixRetrait(p), retour: m }); return null; }
      if (action === 'partir') { fermer(); return null; }
      return 'Choix inconnu';
    }
    if (m.type === 'paquet') {
      if (action === 'annuler') { if (m.retour) remplacer(m.retour); else fermer(); return null; }
      if (action !== 'carte' || !p.paquet[arg]) return 'Choix inconnu';
      var id = p.paquet[arg];
      if (m.mode === 'ameliorer') {
        if (!ameliorable(id)) return 'Cette carte ne peut pas être améliorée';
        p.paquet[arg] = id + '+';
        if (m.salle) p.faits[m.salle] = 1;
        if (m.retour && m.retour.type === 'feu') annonce(e, '⚒️ ' + nomCp(p) + ' améliore ' + carte(id).nom + '.');
        fermer(); return null;
      }
      if (m.mode === 'retirer') {
        if (m.prix) { if (p.or < m.prix) return 'Pas assez d\'or'; p.or -= m.prix; p.retraits = (p.retraits || 0) + 1; }
        p.paquet.splice(arg, 1);
        if (m.retour) remplacer(m.retour); else fermer();
        return null;
      }
      if (m.mode === 'copier') { if (carte(id).type === 'malediction') return 'Pas une malédiction !'; p.paquet.push(id); fermer(); return null; }
      if (m.mode === 'transformer') {
        if (carte(id).type === 'malediction') return 'Pas une malédiction !';
        var nv = null;
        for (var essai = 0; essai < 20 && (!nv || nv === carte(id).base); essai++) nv = tirerCartes(p, 1, 'elite', h)[0];
        if (!nv) return 'Le chaudron ne veut pas de cette carte';
        p.paquet[arg] = nv;
        annonce(e, '🫕 ' + nomCp(p) + ' : ' + carte(id).nom + ' devient ' + carte(nv).nom + ' !', p.nom);
        fermer(); return null;
      }
    }
    if (m.type === 'evenement') {
      if (action !== 'choix' || (arg !== 0 && arg !== 1)) return 'Choix inconnu';
      var err = evenement(e, p, m, arg, h);
      if (err) return err;
      p.faits[m.salle] = 1;
      return null;
    }
    return 'Choix inconnu';
  }
  function evenement(e, p, m, i, h) {
    var E = D.EVENEMENTS[m.id], dire = t => annonce(e, E.ico + ' ' + nomCp(p) + ' : ' + t, p.nom);
    function fermer() { p.menus.shift(); }
    switch (m.id) {
      case 'fontaine':
        if (i === 0) dire('+' + soigner(p, Math.round(p.pvMax * 0.25)) + ' PV.');
        else { if (!donnerFiole(e, p, 'soin', h)) return 'Plus de place pour une fiole'; dire('une Fiole de soin.'); }
        fermer(); return null;
      case 'autel':
        if (i === 0) { p.pv = Math.max(1, p.pv - 9); var r = donnerRelique(e, p, null, h); dire(r ? RELIQUES[r].ico + ' ' + RELIQUES[r].nom + ' (' + RELIQUES[r].texte + ').' : 'l\'autel reste vide.'); }
        fermer(); return null;
      case 'grimoires':
        if (i === 0) { p.menus[0] = { type: 'choix', titre: 'Vieux grimoires : une carte', cartes: tirerCartes(p, 4, 'grimoire', h) }; return null; }
        p.menus[0] = { type: 'paquet', mode: 'retirer' }; return null;
      case 'enclume':
        if (i === 0) {
          var l = melanger(p.paquet.map((id, k) => k).filter(k => ameliorable(p.paquet[k])), h).slice(0, 2);
          l.forEach(k => { p.paquet[k] += '+'; });
          dire(l.length ? l.map(k => carte(p.paquet[k]).nom).join(' et ') + '.' : 'rien à forger.');
        } else { donnerOr(e, p, 45); dire('+45 or.'); }
        fermer(); return null;
      case 'coffre':
        if (i === 0) { donnerOr(e, p, 80); p.paquet.push('blessure'); dire('+80 or… et une Blessure.'); }
        fermer(); return null;
      case 'miroir':
        if (i === 0) { p.menus[0] = { type: 'paquet', mode: 'copier' }; return null; }
        p.pvMax += 5; p.pv += 5; dire('+5 PV max.'); fermer(); return null;
      case 'des':
        if (i === 0) {
          if (p.or < 30) return 'Pas assez d\'or';
          if (h() < 0.5) { p.or += 45; dire('🎲 gagné ! +45 or.'); } else { p.or -= 30; dire('🎲 perdu… −30 or.'); }
        }
        fermer(); return null;
      case 'champignons':
        if (i === 0) { p.pvMax += 6; p.pv = Math.max(1, p.pv + 1); dire('+6 PV max, mais un peu mal au ventre.'); }
        else { var f = donnerFiole(e, p, null, h); if (!f) return 'Plus de place pour une fiole'; dire(FIOLES[f].ico + ' ' + FIOLES[f].nom + '.'); }
        fermer(); return null;
      // ----- 3.40 -----
      case 'bivouac':
        if (i === 0) dire('+' + soigner(p, Math.round(p.pvMax * 0.4)) + ' PV.');
        else { donnerOr(e, p, 20); var fb = donnerFiole(e, p, null, h); dire('+20 or' + (fb ? ' et ' + FIOLES[fb].ico + ' ' + FIOLES[fb].nom : ' (plus de place pour la fiole)') + '.'); }
        fermer(); return null;
      case 'puits':
        if (i === 0) { if (p.or < 25) return 'Pas assez d\'or'; p.or -= 25; p.pvMax += 8; p.pv += 8; dire('+8 PV max.'); }
        else { donnerOr(e, p, 35); p.pv = Math.max(1, p.pv - 6); dire('+35 or, −6 PV.'); }
        fermer(); return null;
      case 'colporteur':
        if (i === 0) {
          if (p.or < 55) return 'Pas assez d\'or';
          var rc = donnerRelique(e, p, null, h);
          if (!rc) return 'Il n\'a plus rien pour toi';
          p.or -= 55; dire(RELIQUES[rc].ico + ' ' + RELIQUES[rc].nom + ' (' + RELIQUES[rc].texte + ').');
        }
        fermer(); return null;
      case 'sage':
        if (i === 0) { if (!p.paquet.some(ameliorable)) return 'Rien à améliorer'; p.menus[0] = { type: 'paquet', mode: 'ameliorer' }; return null; }
        donnerOr(e, p, 40); p.paquet.push('blessure'); dire('+40 or… et une Blessure.');
        fermer(); return null;
      case 'voyageur':
        if (i === 0) { p.pv = Math.max(1, p.pv - 8); p.menus[0] = { type: 'choix', titre: 'Le voyageur te remercie : une carte', cartes: tirerCartes(p, 3, 'voyageur', h) }; return null; }
        fermer(); return null;
      case 'idole':
        if (i === 0) { donnerOr(e, p, 90); p.pvMax = Math.max(10, p.pvMax - 6); p.pv = Math.min(p.pv, p.pvMax); dire('+90 or, −6 PV max.'); }
        fermer(); return null;
      case 'roue':
        if (i === 0) {
          var t = h(), rr = t >= 0.25 && t < 0.45 ? donnerRelique(e, p, null, h) : null;
          if (rr) dire('🎡 ' + RELIQUES[rr].ico + ' ' + RELIQUES[rr].nom + ' (' + RELIQUES[rr].texte + ').');
          else if (t < 0.45) { donnerOr(e, p, 60); dire('🎡 +60 or.'); }
          else if (t < 0.6) dire('🎡 tous les PV rendus (+' + soigner(p, p.pvMax) + ').');
          else if (t < 0.8) { p.pv = Math.max(1, p.pv - 8); dire('🎡 aïe… −8 PV.'); }
          else { p.paquet.push('blessure'); dire('🎡 une Blessure…'); }
        }
        fermer(); return null;
      case 'gardien':
        if (i === 0) {
          if (h() < 2 / 3) { donnerOr(e, p, 70); dire('+70 or, sans un bruit.'); }
          else { p.pv = Math.max(1, p.pv - 12); dire('il se réveille… −12 PV.'); }
        }
        fermer(); return null;
      case 'cartographe':
        if (i === 0) { if (p.or < 20) return 'Pas assez d\'or'; p.or -= 20; e.revele = e.etage; annonce(e, '🗺️ ' + nomCp(p) + ' achète le plan : tout l\'étage est sur la carte !'); }
        else { donnerOr(e, p, 12); dire('+12 or.'); }
        fermer(); return null;
      case 'chaudron':
        if (i === 0) { if (!p.paquet.some(id => carte(id).type !== 'malediction')) return 'Rien à y jeter'; p.menus[0] = { type: 'paquet', mode: 'transformer' }; return null; }
        dire('+' + soigner(p, 12) + ' PV.');
        fermer(); return null;
      case 'ratelier':
        p.paquet.push(i === 0 ? 'frappe+' : 'garde+'); dire(carte(i === 0 ? 'frappe+' : 'garde+').nom + ' dans le paquet.');
        fermer(); return null;
      case 'alchimiste':
        if (i === 0) {
          if (!p.fioles.length) return 'Tu n\'as pas de fiole';
          var ra = donnerRelique(e, p, null, h, 'c');
          if (!ra) return 'Il n\'a plus rien pour toi';
          p.fioles.shift(); dire(RELIQUES[ra].ico + ' ' + RELIQUES[ra].nom + ' (' + RELIQUES[ra].texte + ').');
        } else { var fa = donnerFiole(e, p, null, h); dire(fa ? FIOLES[fa].ico + ' ' + FIOLES[fa].nom + '.' : 'plus de place pour une fiole.'); }
        fermer(); return null;
      case 'coffremaudit':
        if (i === 0) {
          var rm = donnerRelique(e, p, null, h), mal = auHasard(D.RISQUES.maudit.maledictions, h);
          p.paquet.push(mal);
          dire((rm ? RELIQUES[rm].ico + ' ' + RELIQUES[rm].nom + ' (' + RELIQUES[rm].texte + ')' : 'le coffre est vide') + '… et la malédiction ' + carte(mal).ico + ' ' + carte(mal).nom + '.');
        }
        fermer(); return null;
    }
    fermer(); return null;
  }

  // ================== DÉPLACEMENTS ==================
  function bougerJoueur(e, p, h) {
    var now = e.maintenant, d = p.d || p.unPas;
    if (!d || now < p.pas) return;
    var c = e.combats[p.salle];
    if ((c && c.joueurs.indexOf(p.nom) >= 0) || p.menus.length) { p.unPas = null; return; }   // en combat ou devant une fenêtre : on ne bouge pas
    p.unPas = null; p.dir = d; p.pas = now + PAS;
    var v = DX[d], nx = p.x + v[0], ny = p.y + v[1], S = e.salles[p.salle];
    // On sort par une ouverture : pièce voisine
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) {
      var voisin = S.portes[d];
      if (!voisin) return;
      var P = PORTE[OPP[d]];
      p.salle = voisin; p.x = P[0]; p.y = P[1];
      decouvrir(e, p, voisin);
      if (p.pouvoir === 'flair' && e.salles[voisin].t.indexOf('s') >= 0 && !p.fantome) aide(e, p, '👃 ' + nomCp(p) + ' renifle… il y a un passage secret dans cette pièce !');
      return;
    }
    var t = tuile(S, nx, ny);
    if (MARCHABLE[t]) {
      if (!p.fantome && ennemiEn(e, p.salle, nx, ny)) { demarrerCombat(e, p.salle, h); return; }
      p.x = nx; p.y = ny;
      if (!p.fantome) ramasser(e, p);
      return;
    }
    if (p.fantome) return;
    var pw = PAR_OBSTACLE[t];
    if (pw) {
      if (p.pouvoir === pw) {
        poser(S, nx, ny, t === 'v' ? '=' : '.'); e.carteV++;
        effet(e, p.salle, nx, ny, pw);
        annonce(e, POUVOIRS[pw].ico + ' ' + nomCp(p) + ' ' + ESPECES[p.cp.e].action + ' !');
      } else if (t !== 's') aide(e, p, 'Il y a ' + POUVOIRS[pw].quoi + ' : il faut le pouvoir ' + POUVOIRS[pw].ico + ' ' + POUVOIRS[pw].nom + ' (' + POUVOIRS[pw].especes + ').');
      return;
    }
    if (t === 'L') {
      if (e.cles > 0) { e.cles--; poser(S, nx, ny, '.'); e.carteV++; effet(e, p.salle, nx, ny, 'porte'); annonce(e, '🔓 ' + nomCp(p) + ' ouvre la porte avec une petite clé.'); }
      else aide(e, p, '🔒 Porte fermée : il faut une petite clé (cherchez les coffres).');
    } else if (t === 'B') {
      if (e.grandeCle) { poser(S, nx, ny, '.'); e.carteV++; effet(e, p.salle, nx, ny, 'porte'); annonce(e, '🔑 La porte du boss s\'ouvre…'); }
      else aide(e, p, '👑 La porte du boss : il faut la grande clé (l\'élite ⭐ la garde).');
    } else if (t === 'G') {
      aide(e, p, Object.keys(e.joueurs).length > 1 ? '⛓️ Une grille : tenez-vous à deux sur les dalles en même temps pour l\'ouvrir.' : '⛓️ Une grille bien fermée…');
    } else if (t === 'C') ouvrirCoffre(e, S, nx, ny, p, h);
    else if (t === 'T') ouvrirTresor(e, S, nx, ny, p, h);
    else if (t === 'F' || t === 'M' || t === 'A' || t === 'X' || t === 'E') interagir(e, p, S, t, h);
  }
  // Première entrée du groupe dans une pièce : on l'annonce (rôle de la pièce) ; les Bottes de marche soignent
  function decouvrir(e, p, voisin) {
    if (e.vues[voisin]) return;
    e.vues[voisin] = 1;
    var V = e.salles[voisin];
    if (V.boss) annonce(e, '👑 ' + nomCp(p) + ' entre dans l\'antre de ' + MONSTRES[lieuDe(e).boss].nom + ' !');
    else if (V.role === 'elite') annonce(e, '⭐ Un élite garde cette pièce…');
    else if (V.role === 'feu') annonce(e, '🔥 Un feu de camp : on peut s\'y reposer.');
    else if (V.role === 'marchand') annonce(e, '🛒 Un marchand ambulant !');
    else if (V.role === 'defi') annonce(e, '💀 La salle du défi : un second élite et son butin. Rien n\'oblige à l\'affronter.');
    else if (V.role === 'tresor') annonce(e, '💰 Un grand coffre, sans gardien… ça sent le piège.');
    else if (V.role === 'maudit') annonce(e, '🔮 Un coffre maudit : une relique, contre une malédiction.');
    // Bottes de marche : chaque pièce découverte soigne un peu
    Object.values(e.joueurs).forEach(q => { if (a(q, 'bottes') && !q.fantome) soigner(q, 2); });
  }
  function ramasser(e, p) {
    for (var i = e.objets.length - 1; i >= 0; i--) {
      var o = e.objets[i];
      if (o.salle !== p.salle || o.x !== p.x || o.y !== p.y) continue;
      if (o.type === 'poussiere') e.poussiere++;
      e.objets.splice(i, 1);
      effet(e, p.salle, p.x, p.y, o.type);
    }
  }
  function marchableEnnemi(e, m, x, y) {
    if (x < 1 || y < 1 || x > W - 2 || y > H - 2) return false;
    var t = tuile(e.salles[m.salle], x, y);
    if (!(MARCHABLE[t] || (t === 'v' && MONSTRES[m.type].vole))) return false;
    return !e.ennemis.some(o => o !== m && o.salle === m.salle && o.x === x && o.y === y);
  }
  function choisirDir(e, m, h) {
    var info = MONSTRES[m.type], dirs = ['h', 'b', 'g', 'd'];
    if ((info.taille || 1) > 1 && h() < 0.6) return null;   // les gros bougent peu
    if (h() < 0.3 && !info.chasse) return null;
    if (info.chasse && h() < 0.7) {
      var cible = null, dist = 1e9;
      Object.values(e.joueurs).forEach(p => {
        if (p.fantome || p.salle !== m.salle) return;
        var dd = Math.abs(p.x - m.x) + Math.abs(p.y - m.y);
        if (dd < dist) { dist = dd; cible = p; }
      });
      if (cible) {
        var ax = cible.x - m.x, ay = cible.y - m.y, l = [];
        if (ax) l.push(ax > 0 ? 'd' : 'g');
        if (ay) l.push(ay > 0 ? 'b' : 'h');
        if (Math.abs(ay) > Math.abs(ax)) l.reverse();
        for (var i = 0; i < l.length; i++) { var v = DX[l[i]]; if (marchableEnnemi(e, m, m.x + v[0], m.y + v[1])) return l[i]; }
      }
    }
    return dirs[Math.floor(h() * 4)];
  }

  // ================== COMBAT AUX CARTES ==================
  // Tous les joueurs vivants de la pièce contre tous ses monstres. À chaque tour : les monstres annoncent leur intention,
  // chaque joueur a 3 ⚡ et pioche 5 cartes, les joue quand il veut (effet immédiat) puis touche « Fin du tour ».
  // Quand tout le monde a fini (un absent finit tout seul), les monstres agissent, puis nouveau tour.
  function vivantsDe(e, c) { return c.joueurs.map(n => e.joueurs[n]).filter(p => p && !p.fantome && p.salle === c.salle); }
  function monstresDe(e, c) { return e.ennemis.filter(m => m.salle === c.salle); }
  function journal(c, t) { c.journal.push(t); if (c.journal.length > 14) c.journal.shift(); }
  // Journal détaillé (3.39, demandé par l'utilisateur : « qui, quoi, sur qui et combien ») : chaque action ouvre une ligne
  // { i: icône, a: qui agit, x: ce qu'il fait, r: [{ q: sur qui, v: combien, cl }] } ; chaque effet (fx) s'y ajoute tout seul.
  // cl : 'mal' (dégâts, rouge), 'soin' (vert), le reste (armure, états, malédictions…) en violet. Les anciennes lignes texte restent lisibles.
  var LIGNE = null;
  function ouvrir(c, ico, acteur, action) { LIGNE = { i: ico, a: acteur, x: action, r: [] }; journal(c, LIGNE); return LIGNE; }
  function fermer() { LIGNE = null; }
  // q : nom affiché ; k : qui exactement (nom du joueur ou numéro du monstre : deux « Gluant » restent distincts)
  function noter(q, v, cl, k) {
    if (!LIGNE) return;
    k = k === undefined ? q : k;
    var r = LIGNE.r, m = /^−(\d+)$/.exec(v), pa = /^🛡️(\d+)$/.exec(v);
    // Plusieurs coups sur la même cible : additionnés (« −12 ×2 »), de même pour la part parée par l'armure
    var meme = m && cl === 'mal' && r.find(x => x.k === k && x.cl === 'mal' && /^−\d+$/.test(x.v));
    if (meme) { meme.v = '−' + (parseInt(meme.v.slice(1), 10) + parseInt(m[1], 10)); meme.n = (meme.n || 1) + 1; return; }
    var par = pa && cl === 'neutre' && r.find(x => x.k === k && x.cl === 'neutre' && /^🛡️\d+$/.test(x.v));
    if (par) { par.v = '🛡️' + (parseInt(/\d+/.exec(par.v)[0], 10) + parseInt(pa[1], 10)); return; }
    if (r.length < 12) r.push({ q: q, k: k, v: v, cl: cl || 'mal' });
  }
  function nomQui(e, qui) {
    if (e.joueurs[qui]) return nomCp(e.joueurs[qui]);
    var m = e.ennemis.find(x => x.id === qui);
    return m ? nomMonstre(m) : '?';
  }
  function fx(e, c, qui, v, cl) { c.fx.push({ id: ++e.seq, qui: qui, v: v, cl: cl || 'mal', t: e.maintenant }); if (c.fx.length > 24) c.fx.shift(); noter(nomQui(e, qui), v, cl, qui); }
  function nomMonstre(m) { return MONSTRES[m.type].nom; }
  function ajouterEtat(cible, et, n) { cible.etats[et] = (cible.etats[et] || 0) + n; if (cible.etats[et] <= 0) delete cible.etats[et]; }

  function demarrerCombat(e, salle, h) {
    h = h || Math.random;
    if (e.combats[salle] || !e.ennemis.some(m => m.salle === salle)) return;
    var ms = e.ennemis.filter(m => m.salle === salle);
    var rang = ms.some(m => MONSTRES[m.type].rang === 'boss') ? 'boss' : ms.some(m => MONSTRES[m.type].rang === 'elite') ? 'elite' : 'normal';
    var c = e.combats[salle] = { id: ++e.seq, salle: salle, tour: 0, joueurs: [], fini: {}, journal: [], fx: [], pret: 0, rang: rang, poussiere: 0 };
    if (e.embuscade === salle) c.embuscade = 1;
    ms.forEach(m => { m.armure = 0; m.etats = {}; m.k = 0; m.mem = m.mem || {}; m.intention = null; });
    var noms = ms.map(nomMonstre);
    annonce(e, (rang === 'boss' ? '👑 ' : rang === 'elite' ? '⭐ ' : '⚔️ ') + 'Combat ! ' + noms.filter((n, i) => noms.indexOf(n) === i).join(', ') + ' !');
    nouveauTour(e, c, h);
  }
  function entrerEnCombat(e, c, p, h) {
    c.joueurs.push(p.nom); p.d = null; p.unPas = null;
    p.pioche = melanger(p.paquet, h); p.main = []; p.defausse = []; p.epuisees = []; p.armure = 0; p.etats = {}; p.joues = 0; p.tourCombat = 0;
    if (a(p, 'gant')) ajouterEtat(p, 'force', 1);
    if (a(p, 'collier')) ajouterEtat(p, 'epines', 3);
    p.dentPrete = a(p, 'dent'); p.amulettePrete = a(p, 'amulette'); p.reserve = 0;
    monstresDe(e, c).forEach(m => {
      if (a(p, 'monocle') && !m.etats.vuln) ajouterEtat(m, 'vuln', 1);
      if (a(p, 'clochette') && !m.etats.faible) ajouterEtat(m, 'faible', 1);
      if (a(p, 'braises') && !m.etats.brule) ajouterEtat(m, 'brule', 4);
      if (a(p, 'dard') && !m.etats.poison) ajouterEtat(m, 'poison', 3);
      if (a(p, 'balance')) ajouterEtat(m, 'force', 1);
    });
    // Embuscade (grand coffre piégé) : pris par surprise
    if (c.embuscade) affaiblir(e, c, p, 'vuln', D.RISQUES.tresor.vuln);
  }
  // Un état néfaste posé sur un joueur : l'Amulette pare le premier de chaque combat
  function affaiblir(e, c, q, et, n) {
    if (q.amulettePrete) { q.amulettePrete = false; fx(e, c, q.nom, '🧿 paré', 'neutre'); return; }
    ajouterEtat(q, et, n); fx(e, c, q.nom, ETATS[et].ico + n, 'etat');
  }
  function piocher(e, p, n, h) {
    for (var i = 0; i < n; i++) {
      if (p.main.length >= MAIN_MAX) return;
      if (!p.pioche.length) { if (!p.defausse.length) return; p.pioche = melanger(p.defausse, h); p.defausse = []; }
      p.main.push(p.pioche.pop());
    }
  }
  function nouveauTour(e, c, h) {
    c.tour++; c.fini = {}; c.pret = 0;
    // Les joueurs vivants arrivés dans la pièce rejoignent le combat
    Object.values(e.joueurs).forEach(p => { if (p.salle === c.salle && !p.fantome && c.joueurs.indexOf(p.nom) < 0) entrerEnCombat(e, c, p, h); });
    c.joueurs = c.joueurs.filter(n => e.joueurs[n] && e.joueurs[n].salle === c.salle);
    ajusterPv(e, c);
    // Intentions des monstres (annoncées avant que les joueurs jouent)
    var cibles = vivantsDe(e, c);
    monstresDe(e, c).forEach(m => {
      var M = MONSTRES[m.type];
      m.intention = M.ia(m, { k: m.k, h: h, nb: monstresDe(e, c).length, dernier: m.mem.dernier });
      m.cible = cibles.length ? auHasard(cibles, h).nom : null;
    });
    vivantsDe(e, c).forEach(p => debutTour(e, c, p, h));
    verifierFin(e, c, h);
  }
  function debutTour(e, c, p, h) {
    p.tourCombat = (p.tourCombat || 0) + 1;
    var premier = p.tourCombat === 1;
    if (!p.etats.carapace) p.armure = 0;
    tickDot(e, c, p);
    if (p.fantome) return;
    var en = ENERGIE + (p.etats.accel || 0) + (a(p, 'couronne') ? 1 : 0) + (a(p, 'lampe') ? 1 : 0) + (a(p, 'grimoire') ? 1 : 0) + (a(p, 'masque') ? 1 : 0) + (a(p, 'balance') ? 1 : 0);
    if (p.reserve) { en += p.reserve; p.reserve = 0; }   // Gemme d'énergie
    if (premier && a(p, 'lanterne')) en++;
    if (a(p, 'sablier') && p.tourCombat % 3 === 0) en++;
    p.energie = en; p.joues = 0;
    if (premier && a(p, 'ancre')) p.armure += 10;
    if (a(p, 'ecu')) p.armure += 2;
    var n = MAIN + (a(p, 'sceptre') ? 1 : 0) - (a(p, 'couronne') ? 1 : 0) + (premier && a(p, 'sac') ? 2 : 0);
    piocher(e, p, n, h);
    if (p.etats.brasier) { ouvrir(c, ETATS.brasier.ico, nomCp(p), ETATS.brasier.nom); monstresDe(e, c).forEach(m => infliger(e, c, m, p.etats.brasier, null)); fermer(); }
    if (p.etats.fleau) { ouvrir(c, ETATS.fleau.ico, nomCp(p), ETATS.fleau.nom); monstresDe(e, c).forEach(m => { ajouterEtat(m, 'poison', p.etats.fleau); noter(nomMonstre(m), '☠️+' + p.etats.fleau, 'etat', m.id); }); fermer(); }
  }
  // Poison et brûlure au début du tour de qui les porte
  function tickDot(e, c, x) {
    var estJ = !!x.paquet;
    if (!x.etats.poison && !x.etats.brule) return;
    var avant = LIGNE;
    ouvrir(c, '⏳', estJ ? nomCp(x) : nomMonstre(x), x.etats.poison && x.etats.brule ? 'poison et brûlure' : x.etats.poison ? 'poison' : 'brûlure');
    if (x.etats.poison) {
      // À plusieurs, un monstre empoisonné perd moins de PV (POISON_GROUPE) ; le compteur baisse comme d'habitude
      var np = !estJ && nbGroupe(e) > 1 ? Math.max(1, Math.round(x.etats.poison * D.POISON_GROUPE)) : x.etats.poison;
      perdrePv(e, c, x, np, '☠️'); ajouterEtat(x, 'poison', -1);
    }
    if (x.etats.brule && (estJ ? !x.fantome : x.pv > 0)) { perdrePv(e, c, x, x.etats.brule, '🔥'); x.etats.brule = Math.floor(x.etats.brule / 2); if (!x.etats.brule) delete x.etats.brule; }
    LIGNE = avant;
  }
  function perdrePv(e, c, x, n, ico) {
    x.pv -= n;
    fx(e, c, x.paquet ? x.nom : x.id, '−' + n + ' ' + ico);
    if (x.paquet) verifierKo(e, c, x); else if (x.pv <= 0) mortMonstre(e, c, x);
  }
  // Dégâts d'une attaque : force et faiblesse de qui frappe, vulnérabilité de la cible
  function calculer(source, cible, n, fixe) {
    if (!fixe && source) { n += source.etats.force || 0; if (source.etats.faible) n *= 0.75; }
    if (cible.etats.vuln) n *= 1.5;
    return Math.max(0, Math.floor(n));
  }
  // Inflige n dégâts déjà calculés : l'armure prend d'abord
  function infliger(e, c, cible, n, source, attaque) {
    if (cible.paquet ? cible.fantome : cible.pv <= 0) return 0;
    if (attaque && source && source.dentPrete) { n += 8; source.dentPrete = false; }   // Dent de dragon : le premier coup du combat
    var bloque = Math.min(cible.armure || 0, n), reste = n - bloque;
    cible.armure -= bloque;
    cible.pv -= reste;
    var qui = cible.paquet ? cible.nom : cible.id;
    fx(e, c, qui, reste ? '−' + reste : bloque ? '🛡️' + bloque : '0', reste ? 'mal' : 'neutre');
    if (reste && bloque) noter(nomQui(e, qui), '🛡️' + bloque, 'neutre', qui);   // journal : la part encaissée par l'armure
    if (attaque && source && cible.etats.epines) infliger(e, c, source, cible.etats.epines, null, false);
    if (attaque && source && source.paquet && reste > 0 && source.etats.venin && cible.pv > 0) ajouterEtat(cible, 'poison', source.etats.venin);
    if (cible.paquet) verifierKo(e, c, cible);
    else if (cible.pv <= 0) mortMonstre(e, c, cible);
    return reste;
  }
  function verifierKo(e, c, p) {
    if (p.pv > 0 || p.fantome) return;
    if (a(p, 'trefle4') && !p.trefleUtilise) { p.trefleUtilise = true; p.pv = Math.max(1, Math.round(p.pvMax * 0.3)); journal(c, '☘️ Le trèfle à quatre feuilles sauve ' + nomCp(p) + ' !'); return; }
    p.pv = 0; p.fantome = true; p.reanim = 0; p.d = null; p.armure = 0;
    defausserTout(p);
    journal(c, '👻 ' + nomCp(p) + ' est KO !');
    annonce(e, '👻 ' + nomCp(p) + ' est KO' + (Object.keys(e.joueurs).length > 1 ? ' : un Trèfle ou un ami à côté de lui hors combat le ranime !' : '…'));
  }
  function mortMonstre(e, c, m) {
    if (e.ennemis.indexOf(m) < 0) return;
    e.ennemis = e.ennemis.filter(x => x !== m);
    effet(e, m.salle, m.x, m.y, 'pouf');
    journal(c, '💨 ' + nomMonstre(m) + ' est vaincu !');
    var M = MONSTRES[m.type];
    // Le gobelin rend ce qu'il a volé
    Object.keys(m.mem.vol || {}).forEach(n => { var q = e.joueurs[n]; if (q) { q.or += m.mem.vol[n]; journal(c, '🪙 ' + nomCp(q) + ' récupère ' + m.mem.vol[n] + ' or.'); } });
    c.poussiere += M.rang === 'boss' ? 4 + e.etage : M.rang === 'elite' ? 2 : 1;
    // Ce qu'il laisse en mourant (le Sporion éclate : Vulnérable). Les durées ne s'ajoutent pas : trois sporions d'un coup ne font pas 3 tours.
    if (M.mort && M.mort.deb) vivantsDe(e, c).forEach(q => { var manque = M.mort.deb.n - (q.etats[M.mort.deb.e] || 0); if (manque > 0) affaiblir(e, c, q, M.mort.deb.e, manque); });
    // Trophée de chasse : pour ceux dont c'est encore le tour
    if (!c.pret) vivantsDe(e, c).forEach(p => { if (a(p, 'trophee') && !c.fini[p.nom]) { p.energie++; piocher(e, p, 1, Math.random); noter(nomCp(p), '🦌 ⚡+1 🃏+1', 'etat'); } });
  }
  function defausserTout(p) { p.defausse = p.defausse.concat(p.main); p.main = []; }

  // ---------- Effets d'une carte ou d'une fiole ----------
  function cibleMonstre(e, c, id, h) {
    var l = monstresDe(e, c);
    return l.find(m => m.id === id) || null;
  }
  function appliquer(e, c, p, fxs, cible, h, fiole) {
    var ms = () => monstresDe(e, c);
    fxs.forEach(f => {
      if (f.deg !== undefined) {
        for (var i = 0; i < (f.x || 1); i++) {
          var l = f.tous ? ms() : [cible].filter(m => m && e.ennemis.indexOf(m) >= 0);
          l.forEach(m => infliger(e, c, m, calculer(p, m, f.deg, f.fixe), p, !fiole));
        }
      } else if (f.armure) {
        var qui = cible && cible.paquet ? cible : p, n = p.etats.fragile ? Math.floor(f.armure * 0.75) : f.armure;
        qui.armure += n; fx(e, c, qui.nom, '+' + n + ' 🛡️', 'bouclier');
      } else if (f.pioche) { piocher(e, p, f.pioche, h); noter(nomCp(p), '🃏+' + f.pioche, 'etat'); }
      else if (f.energie) { p.energie += f.energie; noter(nomCp(p), '⚡+' + f.energie, 'etat'); }
      else if (f.etat) {
        (f.tous ? ms() : [cible].filter(m => m && !m.paquet && e.ennemis.indexOf(m) >= 0)).forEach(m => {
          var n = f.n + (f.etat === 'brule' && p.etats.foyer ? p.etats.foyer : 0);
          ajouterEtat(m, f.etat, n); fx(e, c, m.id, ETATS[f.etat].ico + n, 'etat');
        });
      } else if (f.buff) { ajouterEtat(p, f.buff, f.n); fx(e, c, p.nom, ETATS[f.buff].ico + '+' + f.n, 'etat'); }
      else if (f.soin) {
        var q = cible && cible.paquet ? cible : p;
        if (q.fantome) { q.fantome = false; q.pv = 0; journal(c, '✨ ' + nomCp(q) + ' est ranimé !'); }
        var g = soigner(q, f.soin); fx(e, c, q.nom, '+' + g + ' ❤️', 'soin');
      } else if (f.special) special(e, c, p, f, cible, h);
    });
  }
  function special(e, c, p, f, m, h) {
    var vivant = x => x && e.ennemis.indexOf(x) >= 0;
    switch (f.special) {
      case 'attiser': if (vivant(m) && m.etats.brule) { m.etats.brule *= 2; fx(e, c, m.id, '🔥' + m.etats.brule, 'etat'); } break;
      case 'explosion': monstresDe(e, c).forEach(x => infliger(e, c, x, calculer(p, x, f.n) + (x.etats.brule || 0), p, true)); break;
      case 'armuredeg':
        (f.tous ? monstresDe(e, c) : [m].filter(vivant)).forEach(x => infliger(e, c, x, calculer(p, x, p.armure), p, true)); break;
      case 'doublearmure': p.armure *= 2; fx(e, c, p.nom, '🛡️' + p.armure, 'bouclier'); break;
      case 'ricochet':
        for (var i = 0; i < f.x; i++) { var l = monstresDe(e, c); if (!l.length) break; var x = auHasard(l, h); infliger(e, c, x, calculer(p, x, f.n), p, true); }
        break;
      case 'danse': if (vivant(m)) infliger(e, c, m, calculer(p, m, f.n * p.joues), p, true); break;
      case 'traque': if (vivant(m)) { if (m.etats.vuln) { p.energie++; noter(nomCp(p), '⚡+1', 'etat'); } infliger(e, c, m, calculer(p, m, f.n), p, true); } break;
      case 'embuscade': if (vivant(m)) infliger(e, c, m, calculer(p, m, m.etats.poison ? f.n * 2 : f.n), p, true); break;
      case 'catalyse': if (vivant(m) && m.etats.poison) { m.etats.poison *= f.n; fx(e, c, m.id, '☠️' + m.etats.poison, 'etat'); } break;
    }
  }

  // Un joueur joue la carte n° i de sa main (effet immédiat)
  function jouerCarte(e, nom, i, cibleId, h) {
    LIGNE = null;
    h = h || Math.random;
    var p = e.joueurs[nom], c = p && e.combats[p.salle];
    if (!c || p.fantome || c.joueurs.indexOf(nom) < 0) return 'Pas de combat';
    if (c.fini[nom] || c.pret) return 'Tour fini';
    var id = p.main[i], k = id && carte(id);
    if (!k) return 'Carte inconnue';
    if (k.injouable) return 'Cette carte ne se joue pas';
    if (k.cout > p.energie) return 'Pas assez d\'énergie';
    var cible = null, ms = monstresDe(e, c);
    if (k.cible === 'monstre') {
      cible = ms.find(m => m.id === cibleId) || (ms.length === 1 ? ms[0] : null);
      if (!cible) return 'Choisis un monstre';
    } else if (k.cible === 'joueur') {
      var q = e.joueurs[cibleId], ranime = k.fx.some(f => f.soin);
      cible = q && c.joueurs.indexOf(q.nom) >= 0 && (!q.fantome || ranime) ? q : p;
    }
    p.energie -= k.cout;
    p.main.splice(i, 1);
    ouvrir(c, k.ico, nomCp(p), k.nom);
    appliquer(e, c, p, k.fx, cible, h, false);
    p.joues++; p.jouesTotal = (p.jouesTotal || 0) + 1;
    if (p.etats.rythme && p.joues >= 4) { var l = monstresDe(e, c); if (l.length) { var x = auHasard(l, h); infliger(e, c, x, p.etats.rythme, null, false); } }
    // Rage : une carte qui n'est pas une attaque met les monstres enragés en colère
    if (k.type !== 'attaque') ms.forEach(m => { if (m.etats.rage && e.ennemis.indexOf(m) >= 0) { ajouterEtat(m, 'force', m.etats.rage); fx(e, c, m.id, '😡+' + m.etats.rage, 'etat'); } });
    fermer();
    if (a(p, 'plume') && p.jouesTotal % 10 === 0) p.energie++;
    if (k.epuise || k.type === 'pouvoir') p.epuisees.push(id); else p.defausse.push(id);
    verifierFin(e, c, h);
    return null;
  }
  // Une fiole : à tout moment de son tour (la Fiole de soin aussi hors combat)
  function utiliserFiole(e, nom, i, cibleId, h) {
    LIGNE = null;
    h = h || Math.random;
    var p = e.joueurs[nom], id = p && p.fioles[i], F = id && FIOLES[id];
    if (!F || p.fantome) return 'Pas de fiole';
    var c = e.combats[p.salle];
    var enCombat = c && c.joueurs.indexOf(nom) >= 0;
    if (!enCombat) {
      if (!F.dehors) return 'Seulement en combat';
      var q = e.joueurs[cibleId];
      if (!q || q.fantome || q.salle !== p.salle) q = p;
      p.fioles.splice(i, 1);
      var g = soigner(q, F.fx[0].soin);
      annonce(e, F.ico + ' ' + nomCp(p) + ' boit une fiole : +' + g + ' PV' + (q !== p ? ' pour ' + nomCp(q) : '') + '.');
      return null;
    }
    if (c.fini[nom] || c.pret) return 'Tour fini';
    var cible = null, ms = monstresDe(e, c);
    if (F.cible === 'monstre') { cible = ms.find(m => m.id === cibleId) || (ms.length === 1 ? ms[0] : null); if (!cible) return 'Choisis un monstre'; }
    else if (F.cible === 'joueur') { var r = e.joueurs[cibleId]; cible = r && !r.fantome && c.joueurs.indexOf(r.nom) >= 0 ? r : p; }
    p.fioles.splice(i, 1);
    ouvrir(c, F.ico, nomCp(p), F.nom);
    appliquer(e, c, p, F.fx, cible, h, true);
    fermer();
    verifierFin(e, c, h);
    return null;
  }
  function jeterFiole(e, nom, i) { var p = e.joueurs[nom]; if (p && p.fioles[i]) p.fioles.splice(i, 1); }

  // Fin du tour d'un joueur : effets de fin de tour, la main part à la défausse
  function finTour(e, nom, h) {
    LIGNE = null;
    var p = e.joueurs[nom], c = p && e.combats[p.salle];
    if (!c || c.joueurs.indexOf(nom) < 0 || c.fini[nom] || p.fantome) return;
    var cape = a(p, 'cape') && p.energie > 0 ? 3 * p.energie : 0, maudites = p.main.map(carte).filter(k => k && k.finMain);
    if (p.etats.metal || (a(p, 'coeurpierre') && !p.armure) || p.etats.regen || cape || maudites.length) ouvrir(c, '⏹️', nomCp(p), 'fin de tour');
    if (p.etats.metal) { p.armure += p.etats.metal; fx(e, c, p.nom, '+' + p.etats.metal + ' 🛡️', 'bouclier'); }
    if (a(p, 'coeurpierre') && !p.armure) { p.armure += 6; fx(e, c, p.nom, '+6 🛡️', 'bouclier'); }
    if (cape) { p.armure += cape; fx(e, c, p.nom, '+' + cape + ' 🛡️', 'bouclier'); }
    if (a(p, 'gemme')) p.reserve = Math.min(2, p.energie);
    if (p.etats.regen) { var gr = soigner(p, p.etats.regen); if (gr) noter(nomCp(p), '+' + gr + ' ❤️', 'soin'); }
    // Malédictions encore en main (Fardeau, Doute)
    maudites.forEach(k => {
      if (p.fantome) return;
      if (k.finMain.pv) perdrePv(e, c, p, k.finMain.pv, k.ico);
      if (k.finMain.etat && !p.fantome) affaiblir(e, c, p, k.finMain.etat, k.finMain.n);
    });
    // Règle du lieu « Spores » (Champignonnière) : finir son tour sans armure = Poison
    var R = regleLieu(e);
    if (R && R.poison && !p.armure && !p.fantome) { if (!LIGNE) ouvrir(c, R.ico, nomCp(p), R.nom.toLowerCase()); affaiblir(e, c, p, 'poison', R.poison); }
    fermer();
    if (p.fantome) return;
    defausserTout(p);
    c.fini[nom] = 1;
  }
  // On attend tout le monde : quand tous les vivants ont fini (les absents finissent tout seuls), les monstres jouent 0,6 s plus tard
  function avancerCombat(e, c, h, absents) {
    if (!monstresDe(e, c).length) return finCombat(e, c, true, h);
    var vivants = vivantsDe(e, c);
    if (!vivants.length) return finCombat(e, c, false, h);
    vivants.forEach(p => { if (absents[p.nom]) finTour(e, p.nom, h); });
    if (!vivants.every(p => c.fini[p.nom])) { c.pret = 0; return; }
    if (!c.pret) { c.pret = e.maintenant || 1; return; }
    if (e.maintenant - c.pret < 600) return;
    tourMonstres(e, c, h);
  }
  function tourMonstres(e, c, h) {
    c.pret = 0;
    var spores = regleLieu(e);
    monstresDe(e, c).slice().forEach(m => {
      if (e.ennemis.indexOf(m) < 0) return;
      m.armure = 0;
      tickDot(e, c, m);
      if (e.ennemis.indexOf(m) < 0) return;
      var i = m.intention || { nom: '…' }, vivants = vivantsDe(e, c);
      if (!vivants.length) return;
      var cible = e.joueurs[m.cible];
      if (!cible || cible.fantome || cible.salle !== c.salle || c.joueurs.indexOf(cible.nom) < 0) cible = auHasard(vivants, h);
      var cibles = i.tous ? vivants : [cible];
      var nm = nomMonstre(m);
      ouvrir(c, MONSTRES[m.type].ico || '🟢', nm, i.nom);
      if (i.divise) {
        noter(nm, '➗ se divise en deux', 'etat', m.id); fermer();
        m.mem.divise = 1;
        var pv = Math.max(1, Math.floor(m.pv / 2)), pos = [[m.x - 1, m.y], [m.x + 1, m.y]];
        e.ennemis = e.ennemis.filter(x => x !== m);
        pos.forEach(q => { var n = creerMonstre(e, 'gluantmoyen', m.salle, q[0], q[1], h); n.pv = n.pvMax = pv; n.f = n.combatF = m.f; n.pvBase = pv / m.f; n.k = 0; n.intention = null; });
        return;
      }
      if (i.armure) { m.armure += i.armure; noter(nm, '+' + i.armure + ' 🛡️', 'bouclier', m.id); }
      if (i.force) { ajouterEtat(m, 'force', i.force); noter(nm, '💪+' + i.force, 'etat', m.id); }
      if (i.buffE) { ajouterEtat(m, i.buffE, i.buffN); noter(nm, (ETATS[i.buffE] ? ETATS[i.buffE].ico : '') + '+' + i.buffN, 'etat', m.id); }
      if (i.fureur) m.mem.fureur = 1;
      if (i.soin) { var gm = Math.min(m.pvMax, m.pv + i.soin) - m.pv; m.pv += gm; if (gm) noter(nm, '+' + gm + ' ❤️', 'soin', m.id); }
      if (i.soinPar) {
        var gs = Math.min(m.pvMax, m.pv + i.soinPar.n * monstresDe(e, c).filter(x => x.type === i.soinPar.type).length) - m.pv;
        m.pv += gs; if (gs) noter(nm, '+' + gs + ' ❤️', 'soin', m.id);
      }
      if (i.att) {
        for (var x = 0; x < (i.x || 1); x++) cibles.forEach(q => {
          if (q.fantome || e.ennemis.indexOf(m) < 0) return;
          infliger(e, c, q, calculer(m, q, attaqueMonstre(e, i, vivants.length)), m, true);
        });
      }
      if (i.vol) cibles.forEach(q => { var n = Math.min(q.or, i.vol); if (!n) return; q.or -= n; m.mem.vol = m.mem.vol || {}; m.mem.vol[q.nom] = (m.mem.vol[q.nom] || 0) + n; fx(e, c, q.nom, '−' + n + ' 🪙', 'neutre'); });
      [i.deb, i.deb2].forEach(d => {
        if (!d) return;
        (d.tous ? vivantsDe(e, c) : [cible]).forEach(q => { if (!q.fantome) affaiblir(e, c, q, d.e, d.n); });
      });
      if (i.maudit) (i.tous ? vivantsDe(e, c) : [cible]).forEach(q => { for (var k = 0; k < i.maudit; k++) q.defausse.push('blessure'); fx(e, c, q.nom, '🩹+' + i.maudit, 'etat'); });
      if (i.appel) {
        var places = [[3, 3], [7, 3], [3, 5], [7, 5], [5, 6], [2, 4], [8, 4]];
        for (var k2 = 0; k2 < i.appel.n; k2++) {
          if (monstresDe(e, c).length >= 5) break;
          var pl = places.find(q => !e.ennemis.some(x => x.salle === c.salle && x.x === q[0] && x.y === q[1]));
          if (!pl) break;
          var nv = creerMonstre(e, i.appel.type, c.salle, pl[0], pl[1], h);
          nv.intention = null;
          noter(nomMonstre(nv), '📣 arrive', 'etat', nv.id);
        }
      }
      // Règle du lieu « Spores » : un monstre qui finit son tour sans armure est empoisonné lui aussi
      if (spores && spores.poison && !m.armure && e.ennemis.indexOf(m) >= 0) { ajouterEtat(m, 'poison', spores.poison); noter(nm, '☠️+' + spores.poison, 'etat', m.id); }
      fermer();
      m.k++; m.mem.dernier = i.nom;
    });
    // Fin du tour : les états qui durent baissent de 1
    var tous = monstresDe(e, c).concat(c.joueurs.map(n => e.joueurs[n]).filter(Boolean));
    tous.forEach(x => Object.keys(x.etats).forEach(et => { if (ETATS[et] && ETATS[et].dure) ajouterEtat(x, et, -1); }));
    if (!verifierFin(e, c, h)) nouveauTour(e, c, h);
  }
  // Victoire, défaite : renvoie vrai si le combat est fini
  function verifierFin(e, c, h) {
    if (!e.combats[c.salle]) return true;
    if (!monstresDe(e, c).length) { finCombat(e, c, true, h); return true; }
    if (!vivantsDe(e, c).length) { finCombat(e, c, false, h); return true; }
    return false;
  }
  function finCombat(e, c, gagne, h) {
    if (!e.combats[c.salle]) return;
    h = h || Math.random;
    delete e.combats[c.salle];
    var joueurs = c.joueurs.map(n => e.joueurs[n]).filter(p => p && p.salle === c.salle && !(e.combats[p.salle] && e.combats[p.salle] !== c));
    joueurs.forEach(p => { p.armure = 0; p.etats = {}; p.main = []; p.pioche = []; p.defausse = []; p.epuisees = []; p.energie = 0; p.tourCombat = 0; });
    e.dernierCombat = { salle: c.salle, gagne: gagne, journal: c.journal.slice(-4), t: e.maintenant, id: c.id };
    if (!gagne) {
      monstresDe(e, c).forEach(m => { m.armure = 0; m.etats = {}; m.intention = null; });
      annonce(e, '👻 Le groupe est KO dans cette pièce… les monstres restent là.');
      return;
    }
    e.poussiere += c.poussiere;
    var rang = c.rang, ensemble = joueurs.length > 1;
    joueurs.forEach(p => {
      if (p.fantome) { p.fantome = false; p.pv = Math.max(1, Math.round(p.pvMax / 4)); }
      if (a(p, 'bandage')) soigner(p, 4);
      if (a(p, 'grigri')) { p.pvMax++; p.pv++; }
      if (ensemble) soigner(p, Math.round(p.pvMax * D.SOIN_GROUPE));
      var or = rang === 'boss' ? 55 + entier(h, 11) : rang === 'elite' ? 28 + entier(h, 9) : 12 + entier(h, 9);
      if (a(p, 'piece')) or += 12;
      donnerOr(e, p, or);
      var fiole = rang !== 'boss' && h() < (rang === 'elite' ? 0.5 : 0.35) ? donnerFiole(e, p, null, h) : null;
      var relique = rang === 'elite' ? donnerRelique(e, p, null, h) : null;
      if (rang === 'boss' && e.etage < NB_ETAGES) {
        var bl = melanger(Object.keys(RELIQUES).filter(r => RELIQUES[r].rar === 'boss' && !a(p, r)), h).slice(0, 3);
        if (bl.length) p.menus.push({ type: 'reliqueBoss', choix: bl });
      }
      if (!(rang === 'boss' && e.etage >= NB_ETAGES)) p.menus.push({ type: 'butin', rang: rang, or: or, fiole: fiole, relique: relique, cartes: tirerCartes(p, a(p, 'de') ? 4 : 3, rang, h) });
    });
    if (ensemble) annonce(e, '❤️ Victoire à plusieurs : chacun reprend son souffle (+' + Math.round(D.SOIN_GROUPE * 100) + ' % des PV).');
    if (rang === 'boss') {
      if (e.etage >= NB_ETAGES) {
        e.phase = 'fin'; e.fin = { gagne: true, t: e.maintenant, etage: e.etage };
        annonce(e, '🎉 ' + MONSTRES[lieuDe(e).boss].nom + ' est vaincue ! Le donjon est à vous !');
      } else {
        var S = e.salles[c.salle];
        poser(S, CENTRE[0], CENTRE[1], 'E'); e.carteV++;
        annonce(e, '🎉 ' + MONSTRES[lieuDe(e).boss].nom + ' est vaincu ! Un escalier 🪜 descend vers l\'étage ' + (e.etage + 1) + '.');
      }
    } else annonce(e, rang === 'elite' ? '⭐ L\'élite est vaincu !' : '🎉 Victoire ! La pièce est libre.');
  }

  // ---------- Un pas de simulation (dix fois par seconde) ----------
  function tick(e, maintenant, h, absents) {
    LIGNE = null;
    if (e.phase !== 'jeu') return;
    h = h || Math.random;
    var dt = e.maintenant ? Math.min(500, maintenant - e.maintenant) : 0;
    e.maintenant = maintenant;
    if (!e.debut) e.debut = maintenant;
    var joueurs = Object.values(e.joueurs);
    joueurs.forEach(p => bougerJoueur(e, p, h));
    // Monstres : ils ne bougent que dans les pièces où quelqu'un est en vie
    var occupees = {};
    joueurs.forEach(p => { if (!p.fantome) occupees[p.salle] = true; });
    e.ennemis.slice().forEach(m => {
      if (!occupees[m.salle] || e.combats[m.salle] || maintenant < m.pas) return;
      m.pas = maintenant + MONSTRES[m.type].vitesse * (0.85 + h() * 0.3);
      var d = choisirDir(e, m, h);
      if (!d) return;
      var v = DX[d];
      if (marchableEnnemi(e, m, m.x + v[0], m.y + v[1])) { m.x += v[0]; m.y += v[1]; m.dir = d; }
    });
    // Au contact (même case ou une des 8 cases autour) d'un monstre : combat dans la pièce
    joueurs.forEach(p => {
      if (p.fantome || e.combats[p.salle] || p.menus.length) return;
      if (e.ennemis.some(m => m.salle === p.salle && Math.max(Math.abs(m.x - p.x), Math.abs(m.y - p.y)) <= ((MONSTRES[m.type].taille || 1) > 1 ? 2 : 1))) demarrerCombat(e, p.salle, h);
    });
    Object.keys(e.combats).forEach(id => { if (e.combats[id]) avancerCombat(e, e.combats[id], h, absents || {}); });
    if (e.phase !== 'jeu') return;
    // Grilles : toutes les dalles de la pièce occupées en même temps
    Object.values(e.salles).forEach(S => {
      if (!S.dalles.length || S.t.indexOf('G') < 0) return;
      if (!S.dalles.every(c => joueurs.some(p => !p.fantome && p.salle === S.id && p.x === c[0] && p.y === c[1]))) return;
      S.t = S.t.replace(/G/g, '.'); e.carteV++;
      annonce(e, '⛓️ Clac ! La grille s\'ouvre.');
    });
    // Réanimation : un ami vivant juste à côté pendant 2 s
    joueurs.forEach(f => {
      if (!f.fantome) return;
      var ami = !e.combats[f.salle] && joueurs.some(p => !p.fantome && p.salle === f.salle && Math.abs(p.x - f.x) <= 1 && Math.abs(p.y - f.y) <= 1);
      f.reanim = ami ? f.reanim + dt : 0;
      if (f.reanim >= REANIMATION) {
        f.fantome = false; f.pv = Math.max(1, Math.round(f.pvMax / 4)); f.reanim = 0;
        annonce(e, '✨ ' + nomCp(f) + ' est ranimé !');
      }
    });
    // Tout le monde KO : fin
    if (joueurs.length && joueurs.every(p => p.fantome)) { e.phase = 'fin'; e.fin = { gagne: false, t: maintenant, etage: e.etage }; annonce(e, 'Tout le groupe est KO…'); }
    e.effets = e.effets.filter(f => maintenant - f.t < 600);
    e.annonces = e.annonces.filter(a => maintenant - a.t < 5000);
  }

  // Ce qui change à chaque instant (sans les pièces, envoyées seulement quand elles changent)
  function etatMobile(e) {
    var r = {};
    Object.keys(e).forEach(k => { if (k !== 'salles') r[k] = e[k]; });
    return r;
  }
  function pieces(e) { return e.salles; }
  // Ce que fera vraiment l'intention d'un monstre contre ce joueur (force, faiblesse, vulnérabilité, péril)
  function degatsIntention(e, m, p) {
    var i = m.intention;
    if (!i || !i.att) return 0;
    var c = p && e.combats && e.combats[p.salle];
    return calculer(m, p || { etats: {} }, attaqueMonstre(e, i, c ? vivantsDe(e, c).length : 1));
  }
  // Dégâts qu'une carte d'attaque simple ferait sur ce monstre (affichage)
  function degatsCarte(p, id, m) {
    var k = carte(id), f = k && k.fx.find(x => x.deg !== undefined);
    if (!f) return null;
    return calculer(p, m || { etats: {} }, f.deg) + (p.dentPrete ? 8 : 0);
  }

  return { W: W, H: H, GX: GX, GY: GY, PAS: PAS, DX: DX, PORTE: PORTE, MARCHABLE: MARCHABLE, POUVOIRS: POUVOIRS, ESPECES: ESPECES, MONSTRES: MONSTRES,
           D: D, NB_ETAGES: NB_ETAGES, nettoyerAvantages: nettoyerAvantages, heroSemaine: heroSemaine, reliquesParDefaut: reliquesParDefaut, paquetDepart: paquetDepart, carte: carte, ameliorable: ameliorable, prixRetrait: prixRetrait, soinFeu: soinFeu,
           pouvoirDe: pouvoirDe, hasard: hasard, generer: generer, lieu: lieuDe, regleLieu: regleLieu, tirerLieux: tirerLieux, nouvelle: nouvelle, ajouterJoueur: ajouterJoueur, entree: entree,
           jouerCarte: jouerCarte, finTour: finTour, utiliserFiole: utiliserFiole, jeterFiole: jeterFiole, choisir: choisir, demarrerCombat: demarrerCombat,
           interagir: interagir, ouvrirCoffre: ouvrirCoffre, ouvrirTresor: ouvrirTresor, decouvrir: decouvrir, tourMonstres: tourMonstres, etageSuivant: etageSuivant, tirerCartes: tirerCartes, donnerRelique: donnerRelique,
           degatsIntention: degatsIntention, degatsCarte: degatsCarte, calculer: calculer,
           tick: tick, tuile: tuile, compatible: compatible, FORMAT: FORMAT, idx: idx, etatMobile: etatMobile, pieces: pieces };
})();
if (typeof module !== 'undefined') module.exports = DJ;
