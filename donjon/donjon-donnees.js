// ================== DONJON DES COMPAGNONS : DONNÉES (cartes, monstres, reliques, fioles, événements) ==================
// Tout ce qui se règle en chiffres est ici ; le moteur (donjon-regles.js) les applique.
// Inspiré des « roguelikes de cartes » : énergie, armure, états, paquet qui se construit pendant le donjon.
// Le pouvoir du compagnon (débroussailler, force, bond, flair) donne sa classe de cartes : Feu, Carapace, Vivacité, Ruse.
// Testable avec Node (module.exports en bas).

var DJD = (function () {

  // ---------- États (sur les joueurs comme sur les monstres) ----------
  // dure : baisse de 1 à la fin de chaque tour ; sinon reste tout le combat (ou suit sa propre règle)
  var ETATS = {
    force: { nom: 'Force', ico: '💪', texte: '+{n} dégâts à chaque coup' },
    vuln: { nom: 'Vulnérable', ico: '🎯', dure: true, texte: 'Reçoit 50 % de dégâts en plus ({n} tour·s)' },
    faible: { nom: 'Faible', ico: '🥀', dure: true, texte: 'Fait 25 % de dégâts en moins ({n} tour·s)' },
    fragile: { nom: 'Fragile', ico: '🧊', dure: true, texte: 'Gagne 25 % d\'armure en moins ({n} tour·s)' },
    poison: { nom: 'Poison', ico: '☠️', texte: 'Perd {n} PV au début de son tour, puis 1 de moins' },
    brule: { nom: 'Brûlure', ico: '🔥', texte: 'Perd {n} PV au début de son tour, puis la moitié' },
    epines: { nom: 'Épines', ico: '🌵', texte: 'Rend {n} dégâts à qui le frappe' },
    metal: { nom: 'Cuirasse', ico: '⚙️', texte: '+{n} armure à la fin de chaque tour' },
    carapace: { nom: 'Forteresse', ico: '🏰', texte: 'L\'armure ne disparaît plus d\'un tour à l\'autre' },
    brasier: { nom: 'Fournaise', ico: '🌋', texte: 'Au début de ton tour : {n} dégâts à tous les monstres' },
    foyer: { nom: 'Chaleur intense', ico: '♨️', texte: 'Chaque Brûlure que tu poses : +{n}' },
    venin: { nom: 'Glandes à venin', ico: '🧪', texte: 'Tes coups qui passent l\'armure empoisonnent de {n}' },
    fleau: { nom: 'Fléau', ico: '🦠', texte: 'Au début de ton tour : Poison {n} à tous les monstres' },
    rythme: { nom: 'Réflexes', ico: '🎵', texte: 'Dès ta 4e carte du tour, chaque carte inflige {n} dégâts à un monstre au hasard' },
    accel: { nom: 'Frénésie', ico: '⚡', texte: '+{n} ⚡ au début de ton tour' },
    rage: { nom: 'Rage', ico: '😡', texte: 'Gagne {n} Force chaque fois qu\'on joue une carte qui n\'est pas une attaque' },
    regen: { nom: 'Régénération', ico: '🌿', texte: 'Regagne {n} PV à la fin du tour' }
  };

  // ---------- Classes : le pouvoir du compagnon ----------
  var CLASSES = {
    ronces: { nom: 'Feu', ico: '🔥', pv: 60, texte: 'Brûlures et flammes sur tous les monstres', base: ['souffle', 'braise'] },
    force: { nom: 'Carapace', ico: '💪', pv: 72, texte: 'Armure épaisse, gros coups et épines', base: ['grandcoup', 'coupcarapace'] },
    bond: { nom: 'Vivacité', ico: '🦘', pv: 56, texte: 'Cartes à 0 ⚡, coups multiples, pioche', base: ['rebond', 'entrechat'] },
    flair: { nom: 'Ruse', ico: '👃', pv: 64, texte: 'Poison, points faibles, monstres affaiblis', base: ['pointfaible', 'morsure'] },
    aucune: { nom: 'Explorateur', ico: '🧭', pv: 58, texte: 'Sans compagnon : les cartes de base', base: ['coupdouble', 'esquive'] }
  };

  // ---------- Cartes ----------
  // type : attaque | defense | competence | pouvoir | malediction ; rar : base | c (commune) | u (peu commune) | r (rare) | x (malédiction)
  // cible : monstre (un monstre), tous (tous les monstres), soi, joueur (toi ou un ami)
  // fx : effets dans l'ordre. deg (n, x coups, tous), armure, pioche, energie, etat (e, n, tous : sur les monstres),
  //      buff (e, n : sur soi), soin, special (code du moteur). plus : ce qui change sur la carte améliorée (nom+).
  // epuise : la carte quitte le combat une fois jouée.
  function k(id, nom, ico, type, cl, rar, cout, cible, fx, plus, autres) {
    var c = { id: id, nom: nom, ico: ico, type: type, cl: cl, rar: rar, cout: cout, cible: cible, fx: fx, plus: plus || {} };
    Object.keys(autres || {}).forEach(function (x) { c[x] = autres[x]; });
    return c;
  }
  var L = [
    // De base (tout le monde)
    k('griffe', 'Coup de griffe', '🐾', 'attaque', null, 'base', 1, 'monstre', [{ deg: 6 }], { fx: [{ deg: 9 }] }),
    k('bouclier', 'Bouclier', '🛡️', 'defense', null, 'base', 1, 'soi', [{ armure: 5 }], { fx: [{ armure: 8 }] }),
    // Neutres
    k('coupdouble', 'Coup double', '⚔️', 'attaque', null, 'c', 1, 'monstre', [{ deg: 5, x: 2 }], { fx: [{ deg: 7, x: 2 }] }),
    k('charge', 'Charge', '🐗', 'attaque', null, 'c', 2, 'monstre', [{ deg: 12 }, { etat: 'vuln', n: 2 }], { fx: [{ deg: 15 }, { etat: 'vuln', n: 3 }] }),
    k('revers', 'Revers', '↩️', 'attaque', null, 'c', 0, 'monstre', [{ deg: 3 }, { pioche: 1 }], { fx: [{ deg: 5 }, { pioche: 1 }] }),
    k('croc', 'Croc-en-jambe', '🦶', 'attaque', null, 'c', 1, 'monstre', [{ deg: 6 }, { etat: 'faible', n: 1 }], { fx: [{ deg: 8 }, { etat: 'faible', n: 2 }] }),
    k('frappe', 'Frappe lourde', '🔨', 'attaque', null, 'c', 2, 'monstre', [{ deg: 15 }], { fx: [{ deg: 20 }] }),
    k('garde', 'Garde haute', '🧱', 'defense', null, 'c', 2, 'soi', [{ armure: 12 }], { fx: [{ armure: 16 }] }),
    k('esquive', 'Pas de côté', '💨', 'defense', null, 'c', 1, 'soi', [{ armure: 4 }, { pioche: 1 }], { fx: [{ armure: 7 }, { pioche: 1 }] }),
    k('couvrir', 'Couvrir', '🤝', 'defense', null, 'c', 1, 'joueur', [{ armure: 7 }], { fx: [{ armure: 10 }] }),
    k('tourbillon', 'Tourbillon', '🌪️', 'attaque', null, 'u', 2, 'tous', [{ deg: 8, tous: true }], { fx: [{ deg: 11, tous: true }] }),
    k('cri', 'Cri de guerre', '📯', 'pouvoir', null, 'u', 1, 'soi', [{ buff: 'force', n: 2 }], { fx: [{ buff: 'force', n: 3 }] }),
    k('trefle', 'Trèfle', '🍀', 'competence', null, 'u', 1, 'joueur', [{ soin: 6 }], { fx: [{ soin: 9 }] }, { epuise: true }),
    k('souffle2', 'Second souffle', '🌬️', 'competence', null, 'u', 0, 'soi', [{ energie: 1 }, { pioche: 1 }], { fx: [{ energie: 2 }, { pioche: 1 }] }, { epuise: true }),
    k('inspiration', 'Inspiration', '💡', 'competence', null, 'r', 1, 'soi', [{ pioche: 3 }], { cout: 0 }),
    k('heroique', 'Coup héroïque', '🌟', 'attaque', null, 'r', 2, 'monstre', [{ deg: 10 }, { buff: 'force', n: 1 }, { pioche: 1 }], { fx: [{ deg: 14 }, { buff: 'force', n: 2 }, { pioche: 1 }] }),

    // 🔥 Feu (dragon, chat, oie)
    k('souffle', 'Souffle de feu', '🔥', 'attaque', 'ronces', 'base', 1, 'tous', [{ deg: 5, tous: true }], { fx: [{ deg: 7, tous: true }] }),
    k('braise', 'Braise', '🌡️', 'attaque', 'ronces', 'base', 1, 'monstre', [{ deg: 6 }, { etat: 'brule', n: 4 }], { fx: [{ deg: 8 }, { etat: 'brule', n: 6 }] }),
    k('flammeche', 'Flammèche', '🕯️', 'attaque', 'ronces', 'c', 0, 'monstre', [{ deg: 3 }, { etat: 'brule', n: 1 }], { fx: [{ deg: 4 }, { etat: 'brule', n: 2 }] }),
    k('incendie', 'Incendie', '🏕️', 'competence', 'ronces', 'c', 1, 'tous', [{ etat: 'brule', n: 4, tous: true }], { fx: [{ etat: 'brule', n: 6, tous: true }] }),
    k('lave', 'Coulée de lave', '🌋', 'attaque', 'ronces', 'c', 2, 'monstre', [{ deg: 10 }, { etat: 'brule', n: 4 }], { fx: [{ deg: 13 }, { etat: 'brule', n: 5 }] }),
    k('murfeu', 'Mur de flammes', '🧯', 'defense', 'ronces', 'c', 1, 'soi', [{ armure: 6 }, { etat: 'brule', n: 1, tous: true }], { fx: [{ armure: 9 }, { etat: 'brule', n: 2, tous: true }] }),
    k('cendre', 'Rideau de cendres', '🌫️', 'defense', 'ronces', 'c', 1, 'soi', [{ armure: 5 }, { etat: 'faible', n: 1, tous: true }], { fx: [{ armure: 7 }, { etat: 'faible', n: 1, tous: true }] }),
    k('attiser', 'Attiser', '🪭', 'competence', 'ronces', 'u', 1, 'monstre', [{ special: 'attiser' }], { cout: 0 }, { texte: 'Double la Brûlure du monstre' }),
    k('explosion', 'Explosion', '💥', 'attaque', 'ronces', 'u', 2, 'tous', [{ special: 'explosion', n: 7 }], { fx: [{ special: 'explosion', n: 10 }] }, { texte: '{n} dégâts à tous, plus leur Brûlure' }),
    k('fournaise', 'Fournaise', '♨️', 'pouvoir', 'ronces', 'u', 2, 'soi', [{ buff: 'brasier', n: 3 }], { fx: [{ buff: 'brasier', n: 4 }] }),
    k('chaleur', 'Chaleur intense', '🌞', 'pouvoir', 'ronces', 'u', 1, 'soi', [{ buff: 'foyer', n: 1 }], { cout: 0 }),
    k('eruption', 'Éruption', '☄️', 'attaque', 'ronces', 'r', 3, 'tous', [{ deg: 7, x: 2, tous: true }, { etat: 'brule', n: 3, tous: true }], { fx: [{ deg: 9, x: 2, tous: true }, { etat: 'brule', n: 4, tous: true }] }),
    k('phenix', 'Plume de phénix', '🪶', 'competence', 'ronces', 'r', 2, 'joueur', [{ soin: 12 }], { fx: [{ soin: 18 }] }, { epuise: true }),

    // 💪 Carapace (panda, tortue, chèvre)
    k('grandcoup', 'Grand coup', '💥', 'attaque', 'force', 'base', 2, 'monstre', [{ deg: 12 }, { etat: 'vuln', n: 1 }], { fx: [{ deg: 15 }, { etat: 'vuln', n: 2 }] }),
    k('coupcarapace', 'Coup de carapace', '🐢', 'attaque', 'force', 'base', 1, 'monstre', [{ armure: 5 }, { special: 'armuredeg' }], { fx: [{ armure: 8 }, { special: 'armuredeg' }], texte: '+8 armure, puis autant de dégâts que ton armure' }, { texte: '+5 armure, puis autant de dégâts que ton armure' }),
    k('roc', 'Peau de roc', '🪨', 'defense', 'force', 'c', 1, 'soi', [{ armure: 7 }], { fx: [{ armure: 10 }] }),
    k('poing', 'Poing de pierre', '👊', 'attaque', 'force', 'c', 1, 'monstre', [{ deg: 7 }, { armure: 3 }], { fx: [{ deg: 9 }, { armure: 4 }] }),
    k('secousse', 'Secousse', '🫨', 'attaque', 'force', 'c', 2, 'tous', [{ deg: 7, tous: true }, { etat: 'faible', n: 1, tous: true }], { fx: [{ deg: 10, tous: true }, { etat: 'faible', n: 1, tous: true }] }),
    k('rugir', 'Rugissement', '🦁', 'competence', 'force', 'c', 1, 'tous', [{ etat: 'faible', n: 2, tous: true }], { fx: [{ etat: 'faible', n: 3, tous: true }] }, { epuise: true }),
    k('tetu', 'Têtu', '🐐', 'defense', 'force', 'c', 0, 'soi', [{ armure: 4 }], { fx: [{ armure: 6 }] }, { epuise: true }),
    k('cuirasse', 'Cuirasse', '⚙️', 'pouvoir', 'force', 'u', 1, 'soi', [{ buff: 'metal', n: 3 }], { fx: [{ buff: 'metal', n: 4 }] }),
    k('epines', 'Épines', '🌵', 'pouvoir', 'force', 'u', 1, 'soi', [{ buff: 'epines', n: 3 }], { fx: [{ buff: 'epines', n: 5 }] }),
    k('bastion', 'Bastion', '🏯', 'defense', 'force', 'u', 2, 'soi', [{ special: 'doublearmure' }], { cout: 1 }, { texte: 'Double ton armure' }),
    k('eboulement', 'Éboulement', '⛰️', 'attaque', 'force', 'u', 2, 'tous', [{ special: 'armuredeg', tous: true }], { cout: 1 }, { texte: 'Inflige autant de dégâts que ton armure à tous les monstres' }),
    k('forteresse', 'Forteresse', '🏰', 'pouvoir', 'force', 'r', 3, 'soi', [{ buff: 'carapace', n: 1 }], { cout: 2 }),
    k('colosse', 'Colosse', '🗿', 'attaque', 'force', 'r', 3, 'monstre', [{ deg: 28 }], { fx: [{ deg: 36 }] }),

    // 🦘 Vivacité (lapin, écureuil, singe)
    k('rebond', 'Rebond', '🦘', 'attaque', 'bond', 'base', 1, 'monstre', [{ deg: 4, x: 2 }, { pioche: 1 }], { fx: [{ deg: 6, x: 2 }, { pioche: 1 }] }),
    k('entrechat', 'Entrechat', '🩰', 'defense', 'bond', 'base', 0, 'soi', [{ armure: 3 }], { fx: [{ armure: 5 }] }),
    k('rafale', 'Rafale', '🎯', 'attaque', 'bond', 'c', 1, 'monstre', [{ deg: 2, x: 4 }], { fx: [{ deg: 3, x: 4 }] }),
    k('pirouette', 'Pirouette', '🌀', 'attaque', 'bond', 'c', 0, 'monstre', [{ deg: 4 }], { fx: [{ deg: 6 }] }),
    k('acrobatie', 'Acrobatie', '🤸', 'defense', 'bond', 'c', 1, 'soi', [{ armure: 5 }, { pioche: 2 }], { fx: [{ armure: 7 }, { pioche: 2 }] }),
    k('cabriole', 'Cabriole', '🐇', 'defense', 'bond', 'c', 1, 'soi', [{ armure: 6 }, { pioche: 1 }], { fx: [{ armure: 9 }, { pioche: 1 }] }),
    k('tornade', 'Tornade', '🌪️', 'attaque', 'bond', 'u', 1, 'tous', [{ deg: 3, x: 2, tous: true }], { fx: [{ deg: 4, x: 2, tous: true }] }),
    k('ricochet', 'Ricochet', '🪃', 'attaque', 'bond', 'u', 1, 'tous', [{ special: 'ricochet', n: 3, x: 4 }], { fx: [{ special: 'ricochet', n: 3, x: 5 }] }, { texte: '{x} coups de {n} sur des monstres au hasard' }),
    k('sprint', 'Sprint', '🏃', 'competence', 'bond', 'u', 0, 'soi', [{ energie: 2 }], { fx: [{ energie: 2 }, { pioche: 1 }] }, { epuise: true }),
    k('reflexes', 'Réflexes', '🎵', 'pouvoir', 'bond', 'u', 1, 'soi', [{ buff: 'rythme', n: 3 }], { fx: [{ buff: 'rythme', n: 4 }] }),
    k('danse', 'Danse des lames', '🗡️', 'attaque', 'bond', 'r', 1, 'monstre', [{ special: 'danse', n: 3 }], { fx: [{ special: 'danse', n: 4 }] }, { texte: '{n} dégâts par carte déjà jouée ce tour' }),
    k('frenesie', 'Frénésie', '⚡', 'pouvoir', 'bond', 'r', 2, 'soi', [{ buff: 'accel', n: 1 }], { cout: 1 }),

    // 👃 Ruse (chien, renard, raton laveur)
    k('pointfaible', 'Point faible', '🔍', 'competence', 'flair', 'base', 1, 'monstre', [{ etat: 'vuln', n: 2 }, { pioche: 1 }], { fx: [{ etat: 'vuln', n: 3 }, { pioche: 1 }] }),
    k('morsure', 'Morsure venimeuse', '🐍', 'attaque', 'flair', 'base', 1, 'monstre', [{ deg: 6 }, { etat: 'poison', n: 4 }], { fx: [{ deg: 8 }, { etat: 'poison', n: 5 }] }),
    k('toxine', 'Toxine', '🧪', 'competence', 'flair', 'c', 1, 'monstre', [{ etat: 'poison', n: 7 }], { fx: [{ etat: 'poison', n: 10 }] }),
    k('coupbas', 'Coup bas', '🥊', 'attaque', 'flair', 'c', 1, 'monstre', [{ deg: 5 }, { etat: 'faible', n: 1 }], { fx: [{ deg: 7 }, { etat: 'faible', n: 2 }] }),
    k('traque', 'Traque', '🐾', 'attaque', 'flair', 'c', 1, 'monstre', [{ special: 'traque', n: 8 }], { fx: [{ special: 'traque', n: 11 }] }, { texte: '{n} dégâts ; +1 ⚡ si le monstre est Vulnérable' }),
    k('piege', 'Piège', '🪤', 'defense', 'flair', 'c', 1, 'monstre', [{ armure: 6 }, { etat: 'faible', n: 2 }], { fx: [{ armure: 9 }, { etat: 'faible', n: 2 }] }),
    k('instinct', 'Instinct', '🦊', 'competence', 'flair', 'c', 0, 'soi', [{ pioche: 2 }], { fx: [{ pioche: 3 }] }, { epuise: true }),
    k('nuage', 'Nuage toxique', '☁️', 'competence', 'flair', 'u', 2, 'tous', [{ etat: 'poison', n: 5, tous: true }], { fx: [{ etat: 'poison', n: 7, tous: true }] }),
    k('embuscade', 'Embuscade', '🌑', 'attaque', 'flair', 'u', 2, 'monstre', [{ special: 'embuscade', n: 10 }], { fx: [{ special: 'embuscade', n: 13 }] }, { texte: '{n} dégâts, le double si le monstre est empoisonné' }),
    k('glandes', 'Glandes à venin', '🧪', 'pouvoir', 'flair', 'u', 1, 'soi', [{ buff: 'venin', n: 2 }], { fx: [{ buff: 'venin', n: 3 }] }),
    k('catalyse', 'Catalyse', '⚗️', 'competence', 'flair', 'r', 1, 'monstre', [{ special: 'catalyse', n: 2 }], { fx: [{ special: 'catalyse', n: 3 }] }, { epuise: true, texte: 'Multiplie par {n} le Poison du monstre' }),
    k('fleau', 'Fléau', '🦠', 'pouvoir', 'flair', 'r', 2, 'soi', [{ buff: 'fleau', n: 3 }], { fx: [{ buff: 'fleau', n: 4 }] }),

    // Malédiction (posée par des monstres ou des événements)
    k('blessure', 'Blessure', '🩹', 'malediction', null, 'x', null, 'soi', [], {}, { injouable: true, texte: 'Injouable. Encombre la main.' })
  ];
  var CARTES = {};
  L.forEach(function (c) { CARTES[c.id] = c; });

  // ---------- Fioles (une par emplacement ; 2 emplacements) ----------
  var FIOLES = {
    soin: { nom: 'Fiole de soin', ico: '💖', texte: 'Soigne 15 PV (toi ou un ami), même hors combat', cible: 'joueur', fx: [{ soin: 15 }], dehors: true },
    force: { nom: 'Fiole de force', ico: '💪', texte: '+2 Force pour ce combat', cible: 'soi', fx: [{ buff: 'force', n: 2 }] },
    feu: { nom: 'Fiole de feu', ico: '🔥', texte: '10 dégâts à tous les monstres', cible: 'tous', fx: [{ deg: 10, tous: true, fixe: true }] },
    garde: { nom: 'Fiole de pierre', ico: '🛡️', texte: '+12 armure', cible: 'soi', fx: [{ armure: 12 }] },
    energie: { nom: 'Fiole d\'énergie', ico: '⚡', texte: '+2 ⚡ ce tour', cible: 'soi', fx: [{ energie: 2 }] },
    poison: { nom: 'Fiole de poison', ico: '☠️', texte: 'Poison 7 sur un monstre', cible: 'monstre', fx: [{ etat: 'poison', n: 7 }] },
    vive: { nom: 'Fiole vive', ico: '🌀', texte: 'Pioche 3 cartes', cible: 'soi', fx: [{ pioche: 3 }] },
    faible: { nom: 'Fiole de brume', ico: '🌫️', texte: 'Faible 2 sur tous les monstres', cible: 'tous', fx: [{ etat: 'faible', n: 2, tous: true }] }
  };

  // ---------- Reliques (effets passifs, gardées tout le donjon) ----------
  var RELIQUES = {
    ancre: { nom: 'Ancre', ico: '⚓', rar: 'c', texte: '10 armure au premier tour de chaque combat' },
    lanterne: { nom: 'Lanterne', ico: '🏮', rar: 'c', texte: '+1 ⚡ au premier tour de chaque combat' },
    pomme: { nom: 'Pomme dorée', ico: '🍎', rar: 'c', texte: '+8 PV max (et 8 PV)' },
    sac: { nom: 'Sac à dos', ico: '🎒', rar: 'c', texte: 'Pioche 2 cartes de plus au premier tour' },
    gant: { nom: 'Gant de fer', ico: '🧤', rar: 'u', texte: '+1 Force au début de chaque combat' },
    bandage: { nom: 'Bandages', ico: '🩹', rar: 'c', texte: 'Soigne 4 PV après chaque combat gagné' },
    collier: { nom: 'Collier d\'épines', ico: '📿', rar: 'c', texte: 'Épines 3 au début de chaque combat' },
    piece: { nom: 'Pièce porte-bonheur', ico: '🪙', rar: 'c', texte: '+12 or après chaque combat gagné' },
    ceinture: { nom: 'Ceinture à fioles', ico: '🧰', rar: 'u', texte: 'Un emplacement de fiole de plus' },
    monocle: { nom: 'Monocle', ico: '🧐', rar: 'u', texte: 'Les monstres commencent le combat Vulnérables (1 tour)' },
    clochette: { nom: 'Clochette', ico: '🔔', rar: 'u', texte: 'Les monstres commencent le combat Faibles (1 tour)' },
    coeurpierre: { nom: 'Cœur de pierre', ico: '🪨', rar: 'u', texte: 'Fin de tour sans armure : +6 armure' },
    sablier: { nom: 'Sablier', ico: '⏳', rar: 'u', texte: 'Tous les 3 tours : +1 ⚡' },
    trefle4: { nom: 'Trèfle à quatre feuilles', ico: '☘️', rar: 'r', texte: 'Une fois : au lieu d\'être KO, revient à 30 % des PV' },
    plume: { nom: 'Plume vive', ico: '🪶', rar: 'r', texte: 'Toutes les 10 cartes jouées : +1 ⚡' },
    carte: { nom: 'Vieille carte', ico: '🗺️', rar: 'c', texte: 'Le feu de camp soigne 15 PV de plus' },
    // Reliques de boss : fortes, avec un prix
    couronne: { nom: 'Couronne d\'épines', ico: '👑', rar: 'boss', texte: '+1 ⚡ à chaque tour, mais pioche 1 carte de moins' },
    lampe: { nom: 'Lampe éternelle', ico: '🪔', rar: 'boss', texte: '+1 ⚡ à chaque tour, mais le feu de camp ne soigne plus' },
    grimoire: { nom: 'Grimoire interdit', ico: '📕', rar: 'boss', texte: '+1 ⚡ à chaque tour, mais une Blessure dans le paquet' },
    calice: { nom: 'Calice', ico: '🏆', rar: 'boss', texte: '+20 PV max et tous les PV rendus' },
    sceptre: { nom: 'Sceptre', ico: '🔱', rar: 'boss', texte: 'Pioche 1 carte de plus à chaque tour' }
  };

  // ---------- Monstres ----------
  // ia(m, ctx) renvoie l'intention du prochain tour : { nom, att, x, tous, armure, force, deb: { e, n, tous }, appel: { type, n },
  //   prep, maudit, vol, soin, divise }. ctx = { k : n° de son tour (0, 1, …), h : hasard, nb : monstres en jeu, dernier : intention d'avant }
  // m.pv / m.pvMax déjà posés ; taille 2 = gros sur la carte.
  function a(n, x) { return { att: n, x: x || 1 }; }
  function mix(o, p) { Object.keys(p).forEach(function (x) { o[x] = p[x]; }); return o; }
  var MONSTRES = {
    // Étage 1 : les Caves
    gluant: { nom: 'Gluant', dessin: 'gluant', pv: [12, 15], vitesse: 850,
      ia: function (m, c) { return c.dernier !== 'Crachat collant' && c.h() < 0.4 ? mix(a(4), { nom: 'Crachat collant', deb: { e: 'faible', n: 1 } }) : mix(a(7), { nom: 'Coup de gelée' }); } },
    chauve: { nom: 'Chauve-souris', ico: '🦇', pv: [8, 11], vitesse: 520, vole: true,
      ia: function (m, c) { return c.k % 3 === 2 ? mix(a(5), { nom: 'Morsure vampire', soin: 4 }) : mix(a(2, 2), { nom: 'Piqué' }); } },
    champi: { nom: 'Champignon', ico: '🍄', pv: [15, 18], vitesse: 1100,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(3), { nom: 'Spores', deb: { e: 'vuln', n: 2 } }) : mix(a(9), { nom: 'Coup de chapeau' }); } },
    rat: { nom: 'Rat', ico: '🐀', pv: [7, 10], vitesse: 600,
      ia: function (m, c) { return c.h() < 0.25 ? mix(a(2), { nom: 'Grignote', force: 1 }) : mix(a(4), { nom: 'Morsure' }); } },
    // Élites
    gluantgeant: { nom: 'Gluant géant', dessin: 'gluant', taille: 2, rang: 'elite', pv: [62, 66], vitesse: 900,
      ia: function (m, c) {
        if (!m.mem.divise && m.pv * 2 <= m.pvMax) return { nom: 'Va se diviser !', divise: true };
        return c.k % 2 === 0 ? mix(a(13), { nom: 'Écrasement' }) : mix(a(8), { nom: 'Gros crachat', deb: { e: 'faible', n: 2 } });
      } },
    gluantmoyen: { nom: 'Gluant moyen', dessin: 'gluant', pv: [20, 20], vitesse: 900,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(8), { nom: 'Coup de gelée' }) : mix(a(5), { nom: 'Crachat', deb: { e: 'faible', n: 1 } }); } },
    brute: { nom: 'Brute gobeline', ico: '👹', taille: 2, rang: 'elite', pv: [56, 60], vitesse: 800, chasse: true,
      ia: function (m, c) {
        if (c.k === 0) return { nom: 'Rugit (Rage 2)', buffE: 'rage', buffN: 2 };
        return c.k % 3 === 0 ? mix(a(8), { nom: 'Ruée', deb: { e: 'vuln', n: 2 } }) : mix(a(11), { nom: 'Coup de massue' });
      } },
    // Boss
    roi: { nom: 'Le Roi Gluant', dessin: 'roi', taille: 2, rang: 'boss', pv: [100, 100], vitesse: 700, chasse: true,
      ia: function (m, c) {
        var t = c.k % 5;
        if (t === 0) return mix(a(6), { nom: 'Bave royale', tous: true, deb: { e: 'faible', n: 1, tous: true } });
        if (t === 1) return c.nb < 3 ? { nom: 'Appelle un gluant', appel: { type: 'gluant', n: 1 }, armure: 6 } : mix(a(10), { nom: 'Coup de sceptre' });
        if (t === 2) return mix(a(13), { nom: 'Coup de couronne' });
        if (t === 3) return { nom: 'Il gonfle… 💥 au prochain tour', prep: true, armure: 10 };
        return mix(a(24), { nom: 'ÉCRASEMENT', tous: true });
      } },

    // Étage 2 : les Catacombes
    squelette: { nom: 'Squelette', ico: '💀', pv: [26, 30], vitesse: 760, chasse: true,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(9), { nom: 'Coup d\'os' }) : mix(a(4), { nom: 'Bouclier d\'os', armure: 7 }); } },
    araignee: { nom: 'Araignée', ico: '🕷️', pv: [18, 22], vitesse: 600,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(4), { nom: 'Morsure', deb: { e: 'poison', n: 2 } }) : mix(a(3), { nom: 'Toile', deb: { e: 'faible', n: 1 } }); } },
    araignon: { nom: 'Araignon', ico: '🕷️', pv: [7, 7], vitesse: 600,
      ia: function () { return mix(a(3), { nom: 'Petite morsure' }); } },
    gobelin: { nom: 'Gobelin voleur', ico: '👺', pv: [22, 26], vitesse: 650, chasse: true,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(7), { nom: 'Chapardage', vol: 15 }) : mix(a(4), { nom: 'Croc-en-jambe', deb: { e: 'vuln', n: 1 } }); } },
    fantome: { nom: 'Fantôme', ico: '👻', pv: [18, 21], vitesse: 700, vole: true,
      ia: function (m, c) { return c.k % 3 === 0 ? { nom: 'Frisson', deb: { e: 'fragile', n: 2 }, deb2: { e: 'faible', n: 1 } } : mix(a(9), { nom: 'Hantise' }); } },
    // Élites
    gargouille: { nom: 'Gargouille', ico: '🗿', taille: 2, rang: 'elite', pv: [80, 84], vitesse: 1000,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? { nom: 'Peau de pierre', armure: 12, force: 2 } : t === 1 ? mix(a(6, 2), { nom: 'Griffes' }) : mix(a(15), { nom: 'Plongeon' }); } },
    sorciere: { nom: 'Sorcière', ico: '🧙', taille: 2, rang: 'elite', pv: [78, 82], vitesse: 900,
      ia: function (m, c) {
        var t = c.k % 4;
        if (t === 0) return mix(a(6), { nom: 'Malédiction (2 Blessures)', maudit: 2 });
        if (t === 2) return { nom: 'Bouclier magique', armure: 16, force: 3 };
        return mix(a(15), { nom: 'Éclair' });
      } },
    // Boss
    reine: { nom: 'La Reine Araignée', ico: '🕷️', couronne: true, taille: 2, rang: 'boss', pv: [130, 130], vitesse: 700, chasse: true,
      ia: function (m, c) {
        var t = c.k % 4;
        if (t === 0) return { nom: 'Toile géante', armure: 10, deb: { e: 'faible', n: 2, tous: true } };
        if (t === 1) return c.nb < 4 ? { nom: 'Couvée', appel: { type: 'araignon', n: 2 } } : mix(a(4, 3), { nom: 'Pattes' });
        if (t === 2) return mix(a(8, 2), { nom: 'Crocs' });
        return mix(a(10), { nom: 'Venin', deb: { e: 'poison', n: 4 } });
      } },

    // Étage 3 : la Forteresse
    diablotin: { nom: 'Diablotin', ico: '😈', pv: [26, 30], vitesse: 550, chasse: true,
      ia: function (m, c) { return c.k % 3 === 2 ? { nom: 'Danse infernale', force: 2, armure: 5 } : mix(a(3, 3), { nom: 'Boules de feu' }); } },
    chevalier: { nom: 'Chevalier noir', ico: '🤺', pv: [46, 50], vitesse: 800, chasse: true,
      ia: function (m, c) {
        var t = c.k % 3;
        return t === 0 ? mix(a(7), { nom: 'Parade', armure: 10 }) : t === 1 ? { nom: 'Lève son épée… 💥', prep: true, armure: 6 } : mix(a(18), { nom: 'Taille' });
      } },
    golem: { nom: 'Golem', ico: '🪨', pv: [54, 58], vitesse: 1200,
      ia: function (m, c) {
        if (c.k === 0) return { nom: 'S\'éveille…', armure: 12 };
        return c.k % 2 === 1 ? mix(a(14), { nom: 'Poing de pierre' }) : mix(a(6), { nom: 'Séisme', tous: true, deb: { e: 'fragile', n: 1, tous: true } });
      } },
    // Élites
    minotaure: { nom: 'Minotaure', ico: '🐂', taille: 2, rang: 'elite', pv: [104, 108], vitesse: 750, chasse: true,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? { nom: 'Gratte le sol… 💥', prep: true, force: 2 } : t === 1 ? mix(a(18), { nom: 'Charge' }) : mix(a(8, 2), { nom: 'Ruade' }); } },
    ombre: { nom: 'Chevalier d\'ombre', ico: '🗡️', taille: 2, rang: 'elite', pv: [98, 102], vitesse: 800, chasse: true,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? mix(a(5, 3), { nom: 'Lames' }) : t === 1 ? { nom: 'Garde d\'ombre', armure: 12, deb: { e: 'vuln', n: 1 } } : mix(a(18), { nom: 'Exécution' }); } },
    // Boss final
    liche: { nom: 'La Liche', ico: '💀', couronne: true, taille: 2, rang: 'boss', pv: [170, 170], vitesse: 700, chasse: true,
      ia: function (m, c) {
        if (!m.mem.fureur && m.pv * 2 <= m.pvMax) return { nom: 'Fureur (+3 Force)', force: 3, armure: 12, fureur: true };
        var t = c.k % 6;
        if (t === 0) return mix(a(14), { nom: 'Rayon d\'ombre' });
        if (t === 1) return { nom: 'Malédiction', maudit: 1, tous: true, deb: { e: 'vuln', n: 1, tous: true } };
        if (t === 2) return c.nb < 3 ? { nom: 'Os dansants', appel: { type: 'squelette', n: 2 } } : mix(a(5, 3), { nom: 'Moisson' });
        if (t === 3) return mix(a(5, 3), { nom: 'Moisson' });
        if (t === 4) return { nom: 'Le néant approche… 💥', prep: true, armure: 15 };
        return mix(a(26), { nom: 'NÉANT', tous: true });
      } }
  };

  // ---------- Étages ----------
  var ETAGES = [
    { nom: 'Les Caves', ico: '🕳️', sol: ['#5d4c3e', '#65533f', '#4e3f33'], mur: ['#3a2e26', '#4b3c31', '#2c231d'],
      faciles: [['gluant'], ['chauve', 'rat'], ['rat', 'rat']],
      rencontres: [['gluant', 'chauve'], ['champi', 'rat'], ['rat', 'rat', 'rat'], ['chauve', 'chauve'], ['champi', 'gluant'], ['gluant', 'gluant']],
      elites: ['gluantgeant', 'brute'], boss: 'roi' },
    { nom: 'Les Catacombes', ico: '⚰️', sol: ['#4a4a55', '#53535f', '#3c3c46'], mur: ['#2b2b33', '#3a3a44', '#202027'],
      faciles: [['squelette'], ['araignee', 'araignee']],
      rencontres: [['gobelin', 'squelette'], ['fantome', 'araignee'], ['fantome', 'gobelin'], ['squelette', 'araignee'], ['squelette', 'fantome']],
      elites: ['gargouille', 'sorciere'], boss: 'reine' },
    { nom: 'La Forteresse', ico: '🏰', sol: ['#5a3d3d', '#634444', '#4a3232'], mur: ['#2e1f1f', '#3d2828', '#221616'],
      faciles: [['chevalier'], ['diablotin', 'diablotin']],
      rencontres: [['golem', 'diablotin'], ['chevalier', 'squelette'], ['diablotin', 'squelette'], ['golem'], ['chevalier', 'diablotin']],
      elites: ['minotaure', 'ombre'], boss: 'liche' }
  ];

  // ---------- Difficultés (3.23, demandé par l'utilisateur) : choisies avant d'entrer (seul, ou par l'hôte du salon) ----------
  // solo : PV et dégâts des monstres quand on joue seul ; groupe : renfort par joueur en plus (PV × (1 + pv × (n − 1)),
  // dégâts × (1 + deg × (joueurs du combat − 1))) ; poussieres : multiplicateur des poussières d'étoile à la fin du donjon.
  // Héroïque = la difficulté d'avant 3.23 (solo inchangé, groupe de 3.22) ; Normal = le groupe d'avant 3.22, solo un peu plus doux.
  var DIFFICULTES = {
    normal:   { nom: 'Normal',    ico: '🛡️', solo: { pv: 1, deg: 0.95 },  groupe: { pv: 0.9, deg: 0 },    poussieres: 0.7, texte: 'Pour découvrir le donjon' },
    heroique: { nom: 'Héroïque',  ico: '⚔️', solo: { pv: 1, deg: 1 },     groupe: { pv: 1.2, deg: 0.7 },  poussieres: 1,   texte: 'Le défi prévu' },
    mythique: { nom: 'Mythique',  ico: '💀', solo: { pv: 1.05, deg: 1.05 }, groupe: { pv: 1.25, deg: 0.75 }, poussieres: 1.5, texte: 'Pour les plus aguerris' }
  };
  var ORDRE_DIFFICULTES = ['normal', 'heroique', 'mythique'];

  // ---------- Périls (niveaux de difficulté débloqués en gagnant) ----------

  var PERILS = [
    'Le donjon tel quel',
    'Monstres ordinaires : +10 % de PV',
    'Élites et boss : +10 % de PV',
    'Le feu de camp soigne moins (25 % au lieu de 30 %)',
    'Tous les monstres frappent 1 de plus',
    'On part avec une Blessure et 10 % de PV en moins'
  ];

  // ---------- Événements (salle de l'autel ❓) ----------
  var EVENEMENTS = {
    fontaine: { titre: 'Fontaine claire', ico: '⛲', texte: 'Une eau pure jaillit de la roche.',
      choix: ['Boire (soigne 25 % des PV)', 'Remplir une fiole (Fiole de soin)'] },
    autel: { titre: 'Autel de sang', ico: '🩸', texte: 'Une relique repose sur un autel. Il réclame du sang…',
      choix: ['Offrir son sang (−9 PV, une relique)', 'Partir'] },
    grimoires: { titre: 'Vieux grimoires', ico: '📚', texte: 'Des livres poussiéreux enseignent des techniques oubliées.',
      choix: ['Lire (1 carte parmi 4, peu commune ou rare)', 'Méditer (retire une carte du paquet)'] },
    enclume: { titre: 'Enclume abandonnée', ico: '⚒️', texte: 'Un forgeron a laissé ses outils.',
      choix: ['Forger (améliore 2 cartes au hasard)', 'Fondre le métal (+45 or)'] },
    coffre: { titre: 'Coffre suspect', ico: '🎁', texte: 'Un coffre luisant… un peu trop luisant.',
      choix: ['L\'ouvrir (+80 or, mais une Blessure dans le paquet)', 'Passer son chemin'] },
    miroir: { titre: 'Miroir étrange', ico: '🪞', texte: 'Ton reflet tient une carte.',
      choix: ['La prendre (copie une carte du paquet)', 'Briser le miroir (+5 PV max)'] },
    des: { titre: 'Esprit joueur', ico: '🎲', texte: 'Un esprit propose une partie de dés.',
      choix: ['Parier 30 or (une chance sur deux d\'en gagner 45 de plus)', 'Refuser poliment'] },
    champignons: { titre: 'Cercle de champignons', ico: '🍄', texte: 'Des champignons phosphorescents poussent en rond.',
      choix: ['En manger (+6 PV max, −5 PV)', 'En cueillir (une fiole au hasard)'] }
  };

  // ---------- Prix chez le marchand ----------
  var PRIX = { c: 45, u: 70, r: 120, fiole: 40, relique: 150, retrait: 70 };

  return { ETATS: ETATS, CLASSES: CLASSES, CARTES: CARTES, FIOLES: FIOLES, RELIQUES: RELIQUES, MONSTRES: MONSTRES,
           ETAGES: ETAGES, PERILS: PERILS, DIFFICULTES: DIFFICULTES, ORDRE_DIFFICULTES: ORDRE_DIFFICULTES, EVENEMENTS: EVENEMENTS, PRIX: PRIX };
})();
if (typeof module !== 'undefined') module.exports = DJD;
