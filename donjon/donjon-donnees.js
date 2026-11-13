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
    regen: { nom: 'Régénération', ico: '🌿', texte: 'Regagne {n} PV à la fin du tour' },
    // Règle du lieu « Marée » (Rivière souterraine) : posé sur tout le monde aux tours de marée haute, retiré à marée basse (pas un état qui dure)
    maree: { nom: 'Marée haute', ico: '🌊', texte: 'Ce tour-ci, ses coups font 25 % de dégâts en moins. Tout le monde est logé à la même enseigne.' },
    // Grotte de glace (3.43) : posé par les monstres du lieu, consommé au début du tour suivant (pas un état qui dure)
    givre: { nom: 'Givre', ico: '❄️', texte: 'Au début de son prochain tour, {n} carte·s de plus gèle·nt dans sa main' },
    // Cartes et fioles des Terres (3.71) : nouvelles mécaniques
    esquive: { nom: 'Esquive', ico: '💨', texte: 'Esquive le prochain coup reçu ({n} coup·s)' },
    echo: { nom: 'Écho', ico: '🔔', texte: 'La prochaine carte jouée l\'est deux fois' },
    elan: { nom: 'Élan', ico: '✨', dure: true, texte: '+1 ⚡ au début du tour ({n} tour·s)' }
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
    // 3.47 (demandé par l'utilisateur) : interrompre un monstre, garder sa main
    k('assommer', 'Assommer', '💫', 'competence', null, 'u', 2, 'monstre', [{ special: 'assommer' }], { cout: 1 }, { epuise: true, texte: 'Le monstre perd son prochain coup (même un boss)' }),
    k('prevoyance', 'Prévoyance', '📌', 'competence', null, 'u', 1, 'soi', [{ special: 'prevoyance' }], { cout: 0 }, { texte: 'À la fin du tour, tu gardes ta main pour le tour suivant' }),
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

    // ---------- Cartes rares des Terres (3.71, rar 'l' : légendaires) ----------
    // On ne les tire jamais au butin ni chez le marchand : on les gagne contre le boss du sanctuaire et dans les failles profondes,
    // on les range dans le Grimoire des Terres (permanent) et l'on en glisse une dans son paquet au départ de chaque donjon.
    // Mécaniques (choisies avec l'utilisateur) : Esquive, Écho, Mûrir (la carte reste en main et grandit), Invocation (un allié qui reste en jeu).
    k('voile', 'Voile de brume', '🌫️', 'defense', null, 'l', 1, 'soi', [{ buff: 'esquive', n: 1 }], { fx: [{ buff: 'esquive', n: 1 }, { pioche: 1 }], texte: 'Esquive le prochain coup reçu, pioche 1' }, { terres: true, texte: 'Esquive le prochain coup reçu' }),
    k('fantome', 'Pas du fantôme', '👻', 'defense', null, 'l', 2, 'soi', [{ buff: 'esquive', n: 2 }], { cout: 1 }, { terres: true, epuise: true, texte: 'Esquive les 2 prochains coups reçus' }),
    k('echo', 'Écho des collines', '🔔', 'competence', null, 'l', 1, 'soi', [{ buff: 'echo', n: 1 }], { cout: 0 }, { terres: true, texte: 'La prochaine carte que tu joues l\'est deux fois' }),
    k('carillon', 'Carillon', '🎐', 'attaque', null, 'l', 2, 'tous', [{ deg: 6, tous: true }, { buff: 'echo', n: 1 }], { fx: [{ deg: 9, tous: true }, { buff: 'echo', n: 1 }], texte: '9 dégâts à tous ; la prochaine carte est jouée deux fois' }, { terres: true, texte: '6 dégâts à tous ; la prochaine carte est jouée deux fois' }),
    k('graine', 'Graine d\'ambre', '🌰', 'attaque', null, 'l', 1, 'monstre', [{ deg: 6 }], { fx: [{ deg: 8 }], murit: { deg: 5 }, texte: '8 dégâts. Reste en main et mûrit : +5 à chaque tour' }, { terres: true, retenue: true, murit: { deg: 4 }, texte: '6 dégâts. Reste en main et mûrit : +4 à chaque tour' }),
    k('seve', 'Sève ancienne', '🌳', 'defense', null, 'l', 1, 'soi', [{ armure: 5 }], { fx: [{ armure: 7 }], murit: { armure: 4 }, texte: '+7 armure. Reste en main et mûrit : +4 à chaque tour' }, { terres: true, retenue: true, murit: { armure: 3 }, texte: '+5 armure. Reste en main et mûrit : +3 à chaque tour' }),
    k('follet', 'Feu follet', '✨', 'competence', null, 'l', 1, 'soi', [{ special: 'invoque', inv: 'follet', n: 5, x: 3 }], { fx: [{ special: 'invoque', inv: 'follet', n: 7, x: 3 }] }, { terres: true, texte: 'Invoque un feu follet : {n} dégâts à un monstre au hasard au début de tes {x} prochains tours' }),
    k('golem', 'Golem de pierre', '🗿', 'competence', null, 'l', 2, 'soi', [{ special: 'invoque', inv: 'golem', n: 15 }], { fx: [{ special: 'invoque', inv: 'golem', n: 22 }] }, { terres: true, epuise: true, texte: 'Invoque un golem de {n} PV qui prend les coups à ta place (après l\'armure)' }),

    // Malédiction (posée par des monstres ou des événements)
    k('blessure', 'Blessure', '🩹', 'malediction', null, 'x', null, 'soi', [], {}, { injouable: true, texte: 'Injouable. Encombre la main.' }),
    // Malédictions du coffre maudit (3.40) : finMain = ce qu'elles font si elles sont encore en main à la fin du tour.
    // On peut payer 1 ⚡ pour s'en débarrasser jusqu'à la fin du combat (elles ne font rien d'autre).
    k('fardeau', 'Fardeau', '🏋️', 'malediction', null, 'x', 1, 'soi', [], {}, { epuise: true, finMain: { pv: 2 }, texte: 'Si elle reste en main : −2 PV. La jouer s\'en débarrasse' }),
    k('doute', 'Doute', '🌀', 'malediction', null, 'x', 1, 'soi', [], {}, { epuise: true, finMain: { etat: 'faible', n: 2 }, texte: 'Si elle reste en main : Faible au tour suivant. La jouer s\'en débarrasse' })
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
    faible: { nom: 'Fiole de brume', ico: '🌫️', texte: 'Faible 2 sur tous les monstres', cible: 'tous', fx: [{ etat: 'faible', n: 2, tous: true }] },
    // Fioles des Terres (3.71) : fabriquées chez Mme Sauge avec les composants rares ; jamais au butin ni chez le marchand (vallee: true)
    voile: { nom: 'Fiole de voile', ico: '🫧', texte: 'Esquive les 2 prochains coups reçus', cible: 'soi', fx: [{ buff: 'esquive', n: 2 }], vallee: true },
    orage: { nom: 'Élixir d\'orage', ico: '⛈️', texte: '8 dégâts et Vulnérable 1 à tous les monstres', cible: 'tous', fx: [{ deg: 8, tous: true, fixe: true }, { etat: 'vuln', n: 1, tous: true }], vallee: true },
    renouveau: { nom: 'Fiole de renouveau', ico: '🌱', texte: 'Tes Blessures et malédictions quittent le combat, +5 PV', cible: 'soi', fx: [{ special: 'purifier' }, { soin: 5 }], vallee: true },
    essence: { nom: 'Essence de faille', ico: '🔮', texte: '+1 ⚡ maintenant et au début de tes 2 tours suivants', cible: 'soi', fx: [{ energie: 1 }, { buff: 'elan', n: 3 }], vallee: true }
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
    // Ajoutées en 3.40 (demandé par l'utilisateur : plus de variété)
    dent: { nom: 'Dent de dragon', ico: '🦷', rar: 'c', texte: 'Ton premier coup de chaque combat fait 8 dégâts de plus' },
    braises: { nom: 'Braises éternelles', ico: '🕯️', rar: 'c', texte: 'Les monstres commencent le combat avec Brûlure 4' },
    dard: { nom: 'Dard', ico: '🦂', rar: 'c', texte: 'Les monstres commencent le combat avec Poison 3' },
    bottes: { nom: 'Bottes de marche', ico: '🥾', rar: 'c', texte: 'Soigne 2 PV à chaque pièce découverte' },
    bon: { nom: 'Bon de réduction', ico: '🏷️', rar: 'c', texte: 'Tout est 20 % moins cher chez le marchand' },
    pierre: { nom: 'Pierre à aiguiser', ico: '🔪', rar: 'c', texte: 'En la trouvant : améliore 3 cartes au hasard' },
    ecu: { nom: 'Écu', ico: '🔰', rar: 'u', texte: '2 armure au début de chacun de tes tours' },
    trophee: { nom: 'Trophée de chasse', ico: '🦌', rar: 'u', texte: 'Un monstre vaincu pendant ton tour : +1 ⚡ et pioche 1 carte' },
    cape: { nom: 'Cape de voyage', ico: '🧥', rar: 'u', texte: 'Fin de tour : +3 armure par ⚡ non dépensé' },
    de: { nom: 'Dé pipé', ico: '🎲', rar: 'u', texte: 'Butin : 4 cartes au choix au lieu de 3' },
    amulette: { nom: 'Amulette', ico: '🧿', rar: 'u', texte: 'Pare le premier état néfaste de chaque combat' },
    grigri: { nom: 'Grigri', ico: '🦴', rar: 'u', texte: '+1 PV max après chaque combat gagné' },
    gemme: { nom: 'Gemme d\'énergie', ico: '💎', rar: 'r', texte: 'Les ⚡ non dépensés (2 au plus) sont gardés pour le tour suivant' },
    marquepage: { nom: 'Marque-page', ico: '🔖', rar: 'u', texte: 'À chaque tour, garde 1 carte de ta main pour le tour suivant (touche-la puis « Garder »)' },
    marteau: { nom: 'Marteau de forgeron', ico: '🔨', rar: 'r', texte: 'Au feu de camp, se reposer permet aussi d\'améliorer une carte' },
    // Reliques de boss : fortes, avec un prix
    couronne: { nom: 'Couronne d\'épines', ico: '👑', rar: 'boss', texte: '+1 ⚡ à chaque tour, mais pioche 1 carte de moins' },
    lampe: { nom: 'Lampe éternelle', ico: '🪔', rar: 'boss', texte: '+1 ⚡ à chaque tour, mais le feu de camp ne soigne plus' },
    grimoire: { nom: 'Grimoire interdit', ico: '📕', rar: 'boss', texte: '+1 ⚡ à chaque tour, mais une Blessure dans le paquet' },
    calice: { nom: 'Calice', ico: '🏆', rar: 'boss', texte: '+20 PV max et tous les PV rendus' },
    sceptre: { nom: 'Sceptre', ico: '🔱', rar: 'boss', texte: 'Pioche 1 carte de plus à chaque tour' },
    masque: { nom: 'Masque aveugle', ico: '🎭', rar: 'boss', texte: '+1 ⚡ à chaque tour, mais tu ne vois plus ce que préparent les monstres' },
    balance: { nom: 'Balance truquée', ico: '⚖️', rar: 'boss', texte: '+1 ⚡ à chaque tour, mais les monstres commencent le combat avec 1 Force' }
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

    // Étage 1, autre lieu : la Champignonnière (3.41). Règle du lieu « Spores » : voir LIEUX plus bas.
    // mort : { deb } = ce qui arrive aux joueurs du combat quand il est vaincu ; soinPar : { type, n } = n PV rendus par monstre de ce type encore debout.
    sporion: { nom: 'Sporion', ico: '🍄', pv: [9, 12], vitesse: 800, mort: { nom: 'éclate', deb: { e: 'vuln', n: 1 } },
      ia: function (m, c) { return c.dernier !== 'Bouffée de spores' && c.h() < 0.3 ? mix(a(2), { nom: 'Bouffée de spores', deb: { e: 'poison', n: 2 } }) : mix(a(4), { nom: 'Coup de tête' }); } },
    limace: { nom: 'Limace cuirassée', ico: '🐌', pv: [16, 19], vitesse: 1300,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(4), { nom: 'Se recroqueville', armure: 7 }) : mix(a(8), { nom: 'Coup de corne', armure: 3 }); } },
    moucheron: { nom: 'Nuée de moucherons', ico: '🦟', pv: [8, 10], vitesse: 480, vole: true,
      ia: function (m, c) { return c.k % 3 === 2 ? mix(a(1, 2), { nom: 'Bourdonnement', deb: { e: 'faible', n: 1 } }) : mix(a(2, 3), { nom: 'Piqûres' }); } },
    // Élites
    ancetre: { nom: 'Champignon ancêtre', ico: '🍄', taille: 2, rang: 'elite', pv: [66, 70], vitesse: 1100,
      ia: function (m, c) {
        var t = c.k % 3;
        return t === 0 ? { nom: 'Nuage de spores', armure: 8, deb: { e: 'poison', n: 4 } } : t === 1 ? mix(a(13), { nom: 'Coup de chapeau' }) : mix(a(8), { nom: 'Racines', deb: { e: 'vuln', n: 2 } });
      } },
    crapaud: { nom: 'Crapaud-buffle', ico: '🐸', taille: 2, rang: 'elite', pv: [62, 66], vitesse: 850, chasse: true,
      ia: function (m, c) {
        var t = c.k % 3;
        return t === 0 ? { nom: 'Il se gonfle… 💥', prep: true, armure: 8 } : t === 1 ? mix(a(20), { nom: 'Bond écrasant' }) : mix(a(6), { nom: 'Coup de langue', deb: { e: 'faible', n: 2 } });
      } },
    // Boss : il fait pousser des sporions, puis reprend des forces sur ceux qu'on a laissés debout (mais un sporion qui éclate rend Vulnérable)
    mycelium: { nom: 'Le Grand Mycélium', ico: '🍄', couronne: true, taille: 2, rang: 'boss', pv: [82, 82], vitesse: 900,
      ia: function (m, c) {
        var t = c.k % 5;
        if (t === 0) return c.nb < 2 ? { nom: 'Germination', appel: { type: 'sporion', n: 2 }, armure: 6 } : mix(a(9), { nom: 'Coup de racine', armure: 6 });
        if (t === 1) return mix(a(5, 2), { nom: 'Fouet de racines' });
        if (t === 2) return mix(a(5), { nom: 'Absorbe ses sporions', soinPar: { type: 'sporion', n: 6 } });
        if (t === 3) return { nom: 'Il enfle… 💥', prep: true, armure: 7 };
        return mix(a(9), { nom: 'PLUIE DE SPORES', tous: true, deb: { e: 'poison', n: 2, tous: true } });
      } },

    // Étage 1, autre lieu : la Rivière souterraine (3.42). Règle du lieu « Marée » : voir LIEUX plus bas.
    crabe: { nom: 'Crabe', ico: '🦀', pv: [14, 17], vitesse: 1100,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(3), { nom: 'Se retranche', armure: 7 }) : mix(a(9), { nom: 'Coup de pince' }); } },
    sangsue: { nom: 'Sangsue', ico: '🪱', pv: [11, 13], vitesse: 1200,
      ia: function (m, c) { return c.k % 3 === 2 ? mix(a(3), { nom: 'S\'accroche', deb: { e: 'vuln', n: 1 } }) : mix(a(5), { nom: 'Succion', soin: 4 }); } },
    piranha: { nom: 'Piranha', ico: '🐟', pv: [8, 10], vitesse: 450, vole: true,
      ia: function (m, c) { return c.k % 3 === 1 ? mix(a(7), { nom: 'Morsure' }) : mix(a(3, 3), { nom: 'Frénésie' }); } },
    grenouille: { nom: 'Grenouille bleue', ico: '🐸', pv: [11, 13], vitesse: 700,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(5), { nom: 'Coup de langue', deb: { e: 'faible', n: 1 } }) : mix(a(8), { nom: 'Saut' }); } },
    // Élites
    tortue: { nom: 'Tortue serpentine', ico: '🐢', taille: 2, rang: 'elite', pv: [66, 70], vitesse: 1300,
      ia: function (m, c) {
        var t = c.k % 3;
        return t === 0 ? { nom: 'Rentre dans sa carapace', armure: 14 } : t === 1 ? mix(a(20), { nom: 'Morsure éclair' }) : mix(a(10), { nom: 'Coup de queue', armure: 6, deb: { e: 'fragile', n: 2 } });
      } },
    anguille: { nom: 'Anguille électrique', ico: '⚡', taille: 2, rang: 'elite', pv: [60, 64], vitesse: 600, chasse: true,
      ia: function (m, c) {
        var t = c.k % 3;
        return t === 0 ? mix(a(5, 3), { nom: 'Étincelles' }) : t === 1 ? { nom: 'Elle se charge… ⚡', prep: true, armure: 6 } : mix(a(22), { nom: 'Décharge', deb: { e: 'faible', n: 2 } });
      } },
    // Boss : ses tentacules repoussent ; plus il en a, plus il se protège et plus son étreinte serre. Les couper avant l'étreinte.
    tentacule: { nom: 'Tentacule', ico: '🦑', pv: [10, 10], vitesse: 900,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(5), { nom: 'Gifle' }) : mix(a(3), { nom: 'Enserre', deb: { e: 'faible', n: 1 } }); } },
    pieuvre: { nom: 'La Pieuvre des profondeurs', ico: '🐙', couronne: true, taille: 2, rang: 'boss', pv: [74, 74], vitesse: 900,
      ia: function (m, c) {
        var t = c.k % 4, bras = Math.max(0, c.nb - 1);
        if (t === 0) return c.nb < 3 ? { nom: 'Sort ses tentacules', appel: { type: 'tentacule', n: 2 }, armure: 4 } : mix(a(10), { nom: 'Coup de bec', armure: 4 });
        if (t === 1) return mix(a(6, 2), { nom: 'Double gifle' });
        if (t === 2) return mix(a(7), { nom: 'Jet d\'encre', armure: 2 + 3 * bras, deb: { e: 'fragile', n: 2 } });
        return mix(a(10 + 4 * bras), { nom: bras ? 'ÉTREINTE (' + bras + ' tentacule' + (bras > 1 ? 's' : '') + ')' : 'Étreinte' });
      } },

    // Étage 2, autre lieu : la Grotte de glace (3.43). Règle du lieu « Engelures » : voir LIEUX plus bas. Le Givre (❄️) gèle des cartes en plus.
    loupneige: { nom: 'Loup des neiges', ico: '🐺', pv: [24, 28], vitesse: 550, chasse: true,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? mix(a(8), { nom: 'Crocs' }) : t === 1 ? mix(a(4, 2), { nom: 'Bond' }) : { nom: 'Hurle à la lune', force: 2, armure: 4 }; } },
    glacon: { nom: 'Glaçon vivant', ico: '🧊', pv: [19, 22], vitesse: 1100, mort: { deb: { e: 'givre', n: 1 } },
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(4), { nom: 'Se fige', armure: 8 }) : mix(a(3, 3), { nom: 'Éclats' }); } },
    harfang: { nom: 'Chouette harfang', ico: '🦉', pv: [17, 20], vitesse: 650, vole: true,
      ia: function (m, c) { return c.k % 3 === 2 ? mix(a(5), { nom: 'Cri perçant', deb: { e: 'vuln', n: 1 } }) : mix(a(4, 2), { nom: 'Serres' }); } },
    lutin: { nom: 'Lutin de givre', ico: '❄️', pv: [16, 19], vitesse: 600,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? mix(a(4), { nom: 'Souffle de givre', deb: { e: 'givre', n: 1 } }) : t === 1 ? mix(a(7), { nom: 'Boule de neige' }) : { nom: 'Ricane', armure: 5, deb: { e: 'faible', n: 1 } }; } },
    // Élites
    yeti: { nom: 'Yéti', ico: '🦍', taille: 2, rang: 'elite', pv: [82, 86], vitesse: 900, chasse: true,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? { nom: 'Se frappe la poitrine', force: 3, armure: 8 } : t === 1 ? mix(a(16), { nom: 'Coup de poing' }) : mix(a(7), { nom: 'Avalanche', tous: true, deb: { e: 'givre', n: 1, tous: true } }); } },
    golemglace: { nom: 'Golem de glace', ico: '🧊', taille: 2, rang: 'elite', pv: [76, 80], vitesse: 1200,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? { nom: 'Carapace de givre', armure: 18 } : t === 1 ? mix(a(12), { nom: 'Poing glacé', deb: { e: 'givre', n: 2 } }) : mix(a(5, 3), { nom: 'Éclats' }); } },
    // Boss : il fait monter des glaçons (qui gèlent une carte en éclatant) ; son blizzard gèle tout le monde
    dragongivre: { nom: 'Le Dragon de givre', ico: '🐉', couronne: true, taille: 2, rang: 'boss', pv: [130, 130], vitesse: 800, chasse: true,
      ia: function (m, c) {
        var t = c.k % 5;
        if (t === 0) return mix(a(7), { nom: 'Souffle glacé', tous: true, deb: { e: 'givre', n: 1, tous: true } });
        if (t === 1) return mix(a(8, 2), { nom: 'Griffes' });
        if (t === 2) return c.nb < 3 ? { nom: 'Mur de glace', appel: { type: 'glacon', n: 2 }, armure: 10 } : { nom: 'Ailes déployées', armure: 12, force: 2 };
        if (t === 3) return { nom: 'Il inspire… 💥', prep: true, armure: 8 };
        return mix(a(14), { nom: 'BLIZZARD', tous: true, deb: { e: 'givre', n: 2, tous: true } });
      } },

    // Étage 2, autre lieu : la Bibliothèque interdite (3.64). Règle du lieu « Savoir » : la 3e carte de chaque tour ne coûte rien.
    // En échange, ses monstres frappent un peu plus fort, et ses gardiens punissent les longs tours (Faible, malédictions, livres appelés).
    livre: { nom: 'Livre mordeur', ico: '📕', pv: [19, 22], vitesse: 600, vole: true, chasse: true,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? mix(a(6, 2), { nom: 'Claque des pages' }) : t === 1 ? mix(a(11), { nom: 'Morsure reliée' }) : mix(a(3), { nom: 'Se referme', armure: 8 }); } },
    encrier: { nom: 'Encrier renversé', ico: '🖋️', pv: [19, 22], vitesse: 900,
      ia: function (m, c) { return c.k % 2 === 0 ? mix(a(5), { nom: 'Tache d\'encre', deb: { e: 'faible', n: 1 } }) : mix(a(5, 2), { nom: 'Éclaboussures' }); } },
    chandelier: { nom: 'Chandelier hanté', ico: '🕯️', pv: [22, 26], vitesse: 700, vole: true,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? mix(a(6), { nom: 'Cire brûlante', deb: { e: 'brule', n: 2 } }) : t === 1 ? mix(a(10), { nom: 'Flamme vive' }) : { nom: 'Se rallume', armure: 7 }; } },
    armurevide: { nom: 'Armure vide', ico: '🪖', pv: [29, 33], vitesse: 1100,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? { nom: 'Se reforme', armure: 9 } : t === 1 ? mix(a(13), { nom: 'Coup de hallebarde' }) : mix(a(7), { nom: 'Garde', armure: 7 }); } },
    // Élites
    bibliothecaire: { nom: 'Bibliothécaire spectre', ico: '👻', taille: 2, rang: 'elite', pv: [80, 84], vitesse: 800, vole: true,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? { nom: 'Chut !', armure: 8, deb: { e: 'faible', n: 2, tous: true } } : t === 1 ? mix(a(8, 2), { nom: 'Règle en fer' }) : mix(a(18), { nom: 'Rappel de retard' }); } },
    grimoire: { nom: 'Grimoire géant', ico: '📚', taille: 2, rang: 'elite', pv: [84, 88], vitesse: 1000,
      ia: function (m, c) {
        var t = c.k % 3;
        if (t === 0) return { nom: 'Page maudite (1 Blessure)', maudit: 1, armure: 10 };
        if (t === 1) return mix(a(15), { nom: 'Claque de couverture' });
        return c.nb < 3 ? { nom: 'Ouvre un chapitre', appel: { type: 'livre', n: 1 }, armure: 4 } : mix(a(5, 3), { nom: 'Tourbillon de pages' });
      } },
    // Boss : il appelle ses livres ; son ARCHIVAGE frappe plus fort pour chaque livre encore debout
    archiviste: { nom: 'L\'Archiviste', ico: '📜', couronne: true, taille: 2, rang: 'boss', pv: [140, 140], vitesse: 750, chasse: true,
      ia: function (m, c) {
        var t = c.k % 5, livres = Math.max(0, c.nb - 1);
        if (t === 0) return c.nb < 3 ? { nom: 'Ouvre les rayonnages', appel: { type: 'livre', n: 2 }, armure: 6 } : mix(a(6, 2), { nom: 'Volée de livres' });
        if (t === 1) return mix(a(8, 2), { nom: 'Coups de tampon' });
        if (t === 2) return { nom: 'SILENCE !', armure: 10, deb: { e: 'faible', n: 2, tous: true } };
        if (t === 3) return { nom: 'Il consulte l\'index… 💥', prep: true, armure: 10 };
        return mix(a(12 + 3 * livres), { nom: livres ? 'ARCHIVAGE (' + livres + ' livre' + (livres > 1 ? 's' : '') + ')' : 'Archivage', tous: true });
      } },

    // Étage 3, autre lieu : les Forges (3.79). Règle du lieu « Braises » : au début de chaque tour, tout le monde reçoit Brûlure (voir REGLES_LIEU).
    // Nouvelles mécaniques, communes à tout le donjon (moteur) : armureAllies / forceAllies (renforce tous les monstres du combat),
    // mèche (explose : le monstre saute après son coup), et le boss en deux phases (phase2 : seuil, transition, puis l'ia reçoit c.phase = 2).
    salamandre: { nom: 'Salamandre', ico: '🦎', pv: [27, 31], vitesse: 550, chasse: true,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? mix(a(6), { nom: 'Crache des flammes', deb: { e: 'brule', n: 2 } }) : t === 1 ? mix(a(11), { nom: 'Morsure ardente' }) : { nom: 'Se roule dans les braises', armure: 8, force: 1 }; } },
    // Le forgeron renforce tous les monstres du combat : à tuer en premier
    forgeron: { nom: 'Squelette forgeron', ico: '⚒️', pv: [32, 36], vitesse: 900,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? { nom: 'Martèle les armures', armureAllies: 6 } : t === 1 ? mix(a(12), { nom: 'Coup de marteau' }) : mix(a(5), { nom: 'Aiguise les lames', forceAllies: 1 }); } },
    // La braise vivante a une mèche : si on ne l'éteint pas à temps, elle explose sur tout le monde (et disparaît)
    braise: { nom: 'Braise vivante', ico: '🔥', pv: [16, 19], vitesse: 500, vole: true,
      ia: function (m, c) {
        var reste = 3 - c.k;
        if (reste > 1) return mix(a(4), { nom: '💣 Mèche : ' + reste + ' tours' });
        if (reste === 1) return mix(a(4), { nom: '💣 Va exploser ! 💥', prep: true });
        return mix(a(12), { nom: 'EXPLOSION', tous: true, deb: { e: 'brule', n: 2, tous: true }, explose: true });
      } },
    // La scorie se hérisse : la frapper fait mal (épines), surtout avec beaucoup de petits coups
    scorie: { nom: 'Scorie', ico: '🪨', pv: [36, 40], vitesse: 1100,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? { nom: 'Se hérisse de scories', armure: 9, buffE: 'epines', buffN: 2 } : t === 1 ? mix(a(13), { nom: 'Coulée' }) : mix(a(7), { nom: 'Éclats brûlants', deb: { e: 'fragile', n: 1 } }); } },
    // Élites
    cerbere: { nom: 'Cerbère', ico: '🐕', taille: 2, rang: 'elite', pv: [96, 100], vitesse: 650, chasse: true,
      ia: function (m, c) { var t = c.k % 3; return t === 0 ? mix(a(5, 3), { nom: 'Trois morsures' }) : t === 1 ? mix(a(6), { nom: 'Souffle de braise', tous: true, deb: { e: 'brule', n: 2, tous: true } }) : { nom: 'Hurlement à trois voix', force: 2, armure: 10 }; } },
    maitreforgeron: { nom: 'Maître forgeron', ico: '🔨', taille: 2, rang: 'elite', pv: [94, 98], vitesse: 900,
      ia: function (m, c) {
        var t = c.k % 3;
        if (t === 0) return c.nb < 3 ? { nom: 'Forge une braise', appel: { type: 'braise', n: 1 }, armureAllies: 8 } : { nom: 'Trempe l\'acier', armureAllies: 10 };
        if (t === 1) return mix(a(17), { nom: 'Marteau-pilon' });
        return mix(a(6, 2), { nom: 'Tenailles', deb: { e: 'vuln', n: 1 } });
      } },
    // Boss en deux phases : à la moitié de ses PV, il entre en fusion (se libère de ses états, +3 Force, armure) et change de cycle
    titan: { nom: 'Le Titan de fonte', ico: '🗿', couronne: true, taille: 2, rang: 'boss', pv: [160, 160], vitesse: 900, chasse: true,
      phase2: { seuil: 0.5, annonce: '🔥 Le Titan de fonte entre en fusion !', transition: { nom: 'ENTRE EN FUSION (+3 Force)', force: 3, armure: 18, purge: true } },
      ia: function (m, c) {
        var t;
        if (c.phase === 2) {
          t = c.k % 3;
          if (t === 0) return c.nb < 3 ? { nom: 'Appelle les braises', appel: { type: 'braise', n: 2 }, armure: 8 } : mix(a(8, 2), { nom: 'Poings en fusion' });
          if (t === 1) return mix(a(10), { nom: 'Vague de lave', tous: true, deb: { e: 'brule', n: 3, tous: true } });
          return mix(a(21), { nom: 'COULÉE DE FONTE' });
        }
        t = c.k % 4;
        if (t === 0) return mix(a(14), { nom: 'Poing de fonte' });
        if (t === 1) return mix(a(6), { nom: 'Pluie d\'étincelles', tous: true, deb: { e: 'brule', n: 3, tous: true } });
        if (t === 2) return { nom: 'Il chauffe à blanc… 💥', prep: true, armure: 14 };
        return mix(a(20), { nom: 'ÉRUPTION' });
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
    { id: 'caves', decor: 'caves', nom: 'Les Caves', ico: '🕳️', sol: ['#5d4c3e', '#65533f', '#4e3f33'], mur: ['#3a2e26', '#4b3c31', '#2c231d'],
      faciles: [['gluant'], ['chauve', 'rat'], ['rat', 'rat']],
      rencontres: [['gluant', 'chauve'], ['champi', 'rat'], ['rat', 'rat', 'rat'], ['chauve', 'chauve'], ['champi', 'gluant'], ['gluant', 'gluant']],
      elites: ['gluantgeant', 'brute'], boss: 'roi' },
    { id: 'catacombes', decor: 'catacombes', nom: 'Les Catacombes', ico: '⚰️', sol: ['#4a4a55', '#53535f', '#3c3c46'], mur: ['#2b2b33', '#3a3a44', '#202027'],
      faciles: [['squelette'], ['araignee', 'araignee']],
      rencontres: [['gobelin', 'squelette'], ['fantome', 'araignee'], ['fantome', 'gobelin'], ['squelette', 'araignee'], ['squelette', 'fantome']],
      elites: ['gargouille', 'sorciere'], boss: 'reine' },
    { id: 'forteresse', decor: 'forteresse', nom: 'La Forteresse', ico: '🏰', sol: ['#5a3d3d', '#634444', '#4a3232'], mur: ['#2e1f1f', '#3d2828', '#221616'],
      faciles: [['chevalier'], ['diablotin', 'diablotin']],
      rencontres: [['golem', 'diablotin'], ['chevalier', 'squelette'], ['diablotin', 'squelette'], ['golem'], ['chevalier', 'diablotin']],
      elites: ['minotaure', 'ombre'], boss: 'liche' }
  ];
  // ---------- Lieux (3.41, demandé par l'utilisateur : « plusieurs environnements ») ----------
  // Chaque étage est tiré parmi plusieurs lieux (DJ.nouvelle : e.lieux = un identifiant par étage). Un lieu a ses monstres, son boss, ses couleurs,
  // son décor (DJS.decor, détails des pièces) et parfois une règle qui change la façon de jouer (regle : appliquée par le moteur d'après son id).
  // Le premier lieu de chaque étage est celui d'origine (ETAGES[n], sans règle : la référence d'équilibrage).
  // Liste prévue, accord de l'utilisateur le 10 novembre 2026 : étage 1 Caves / Champignonnière / Rivière souterraine (Marée) ;
  // étage 2 Catacombes / Grotte de glace (Engelures) / Bibliothèque interdite (Savoir) ; étage 3 Forteresse / Forges (Braises) / Tour de l'horloge (Temps détraqué).
  var REGLES_LIEU = {
    spores: { nom: 'Spores', ico: '🍄', poison: 1, court: 'Finir son tour sans armure : ☠️ Poison 1',
      texte: 'L\'air est plein de spores : qui finit son tour sans armure reçoit Poison 1. Les monstres aussi. Garde toujours un peu d\'armure.' },
    maree: { nom: 'Marée', ico: '🌊', maree: 0.75, court: 'Un tour sur deux : tous les coups −25 %',
      texte: 'La rivière monte un tour sur deux (les tours pairs). À marée haute, tous les coups font 25 % de dégâts en moins, les tiens comme ceux des monstres. Frappe à marée basse ; à marée haute, protège-toi ou prépare la suite. Poison, brûlure et armure ne changent pas.' },
    savoir: { nom: 'Savoir', ico: '📖', gratuite: 3, court: 'La 3e carte de chaque tour ne coûte rien',
      texte: 'Les livres murmurent leurs secrets : chaque tour, ta 3e carte jouée ne coûte aucune énergie. Garde une carte chère pour la placer en troisième ! Mais les gardiens de la bibliothèque frappent fort et n\'aiment pas le bruit.' },
    engelures: { nom: 'Engelures', ico: '❄️', gel: 1, court: 'Chaque tour, une carte de ta main gèle',
      texte: 'Il fait si froid qu\'à chaque tour une carte de ta main gèle, au hasard : elle ne se joue pas ce tour-ci, mais tu la gardes et elle dégèle au tour suivant, en plus de ta pioche. Le ❄️ Givre des monstres de la grotte en gèle d\'autres. Les malédictions ne gèlent jamais.' },
    braises: { nom: 'Braises', ico: '🔥', brule: 1, bruleM: 3, court: 'Chaque tour : 🔥 Brûlure 1 pour toi, 3 pour chaque monstre',
      texte: 'Les forges sont brûlantes : au début de chaque tour, tu reçois Brûlure 1 et chaque monstre Brûlure 3. La brûlure fait perdre des PV au début du tour, puis baisse de moitié : la chaleur ronge les monstres plus vite que toi, alors ne traîne pas. Méfie-toi des braises vivantes : éteins-les avant que leur mèche n\'arrive au bout.' }
  };
  var AUTRES_LIEUX = [
    { id: 'champignonniere', etage: 1, decor: 'champignonniere', nom: 'La Champignonnière', ico: '🍄', regle: 'spores',
      sol: ['#3d4a3c', '#465544', '#303b30'], mur: ['#2a2238', '#3a2f4d', '#1c1727'],
      faciles: [['sporion', 'sporion'], ['limace'], ['moucheron', 'sporion']],
      rencontres: [['champi', 'sporion'], ['limace', 'moucheron'], ['sporion', 'sporion', 'sporion'], ['champi', 'moucheron'], ['limace', 'sporion'], ['moucheron', 'moucheron', 'sporion']],
      elites: ['ancetre', 'crapaud'], boss: 'mycelium' },
    { id: 'riviere', etage: 1, decor: 'riviere', nom: 'La Rivière souterraine', ico: '🌊', regle: 'maree',
      sol: ['#2f4a52', '#38575f', '#253c43'], mur: ['#1f3340', '#2a4454', '#14232d'],
      faciles: [['piranha', 'piranha'], ['crabe'], ['grenouille', 'piranha']],
      rencontres: [['crabe', 'piranha'], ['sangsue', 'grenouille'], ['piranha', 'piranha', 'piranha'], ['crabe', 'sangsue'], ['grenouille', 'grenouille'], ['sangsue', 'piranha', 'piranha']],
      elites: ['tortue', 'anguille'], boss: 'pieuvre' },
    { id: 'glace', etage: 2, decor: 'glace', nom: 'La Grotte de glace', ico: '❄️', regle: 'engelures',
      sol: ['#5b7286', '#6a8297', '#4b5f71'], mur: ['#2b3d52', '#3a5068', '#1d2a3a'],
      faciles: [['loupneige'], ['harfang', 'harfang'], ['lutin', 'glacon']],
      rencontres: [['loupneige', 'harfang'], ['glacon', 'lutin'], ['loupneige', 'glacon'], ['harfang', 'lutin'], ['loupneige', 'lutin'], ['glacon', 'glacon', 'harfang']],
      elites: ['yeti', 'golemglace'], boss: 'dragongivre' },
    { id: 'bibliotheque', etage: 2, decor: 'bibliotheque', nom: 'La Bibliothèque interdite', ico: '📚', regle: 'savoir',
      sol: ['#5a4434', '#644c3a', '#4a382b'], mur: ['#2e2233', '#3d2e44', '#201726'],
      faciles: [['livre', 'livre'], ['armurevide'], ['encrier', 'chandelier']],
      rencontres: [['livre', 'encrier'], ['armurevide', 'chandelier'], ['livre', 'livre', 'encrier'], ['chandelier', 'encrier'], ['armurevide', 'livre'], ['chandelier', 'chandelier']],
      elites: ['bibliothecaire', 'grimoire'], boss: 'archiviste' },
    { id: 'forges', etage: 3, decor: 'forges', nom: 'Les Forges', ico: '⚒️', regle: 'braises',
      sol: ['#4a3a32', '#55433a', '#3a2c25'], mur: ['#2a1d18', '#3a2820', '#1c120e'],
      faciles: [['salamandre'], ['braise', 'braise'], ['forgeron']],
      rencontres: [['salamandre', 'forgeron'], ['scorie', 'braise'], ['salamandre', 'salamandre'], ['forgeron', 'scorie'], ['braise', 'braise', 'salamandre'], ['scorie', 'salamandre']],
      elites: ['cerbere', 'maitreforgeron'], boss: 'titan' }
  ];
  var LIEUX = {};
  ETAGES.forEach(function (E, i) { E.etage = i + 1; E.lieux = [E.id]; LIEUX[E.id] = E; });
  AUTRES_LIEUX.forEach(function (L) { LIEUX[L.id] = L; ETAGES[L.etage - 1].lieux.push(L.id); });


  // ---------- Difficultés (3.23, demandé par l'utilisateur) : choisies avant d'entrer (seul, ou par l'hôte du salon) ----------
  // solo : PV et dégâts des monstres quand on joue seul ; groupe : renfort par joueur en plus (PV × (1 + pv × (n − 1)),
  // dégâts × (1 + deg × (joueurs du combat − 1))) ; poussieres : multiplicateur des poussières d'étoile à la fin du donjon.
  // Héroïque = le solo d'avant 3.23 ; Normal = le groupe d'avant 3.22, solo un peu plus doux.
  // Groupe refait en 3.26 (signalé par l'utilisateur : « à deux en Héroïque, aucune chance de passer le 1er étage, ça tape trop fort ») :
  // plus de PV, coups moins forts, coups de zone sans bonus, PV selon les joueurs du combat, soin après un combat gagné ensemble.
  var DIFFICULTES = {
    normal:   { nom: 'Normal',    ico: '🛡️', base: { pv: 1, deg: 1 }, solo: { pv: 1, deg: 0.95 },  groupe: { pv: 0.9, deg: 0 },    poussieres: 0.7, texte: 'Pour découvrir le donjon' },
    heroique: { nom: 'Héroïque',  ico: '⚔️', base: { pv: 1.3, deg: 1.25 }, solo: { pv: 1, deg: 1 },     groupe: { pv: 2.2, deg: 0.5 },  poussieres: 1,   texte: 'Le défi prévu' },
    mythique: { nom: 'Mythique',  ico: '💀', base: { pv: 1.5, deg: 1.4 }, solo: { pv: 1.05, deg: 1.05 }, groupe: { pv: 2.4, deg: 0.6 }, poussieres: 1.5, texte: 'Pour les plus aguerris' }
  };
  var ORDRE_DIFFICULTES = ['normal', 'heroique', 'mythique'];
  // À plusieurs, le poison sur les monstres est réduit (3.24, demandé par l'utilisateur : la Ruse rendait les duos bien trop faciles,
  // son poison profitant des PV gonflés et des combats longs). 1 = comme seul.
  var POISON_GROUPE = 0.4;
  // Après un combat gagné à plusieurs, chacun reprend un peu de souffle (part des PV max ; 3.26, demandé par l'utilisateur : « pas de solution de heal »).
  var SOIN_GROUPE = 0.1;

  // ---------- Clés mythiques (ex « périls », 3.24, demandé par l'utilisateur : seulement en Mythique) ----------
  // Niveaux +0 à +5 débloqués en gagnant en Mythique à sa plus haute clé ; chaque clé ajoute une épreuve (elles se cumulent).
  // Noms internes inchangés : PERILS, e.peril, donjon-peril (clé débloquée), donjon-peril-choisi (clé choisie).

  // 3.30 : le héros de la semaine grossit vite, chaque clé rend aussi tous les monstres un peu plus forts (en plus de son épreuve)
  var CLE_PAR_NIVEAU = { pv: 0.08, deg: 0.05 };
  var PERILS = [
    'Le Mythique tel quel',
    'Monstres ordinaires : +15 % de PV',
    'Élites et boss : +15 % de PV',
    'Tous les monstres frappent 1 de plus',
    'Tous les monstres +10 % de PV, le feu de camp soigne 20 % (au lieu de 30 %)',
    'Une Blessure dans le paquet, et les monstres frappent encore 1 de plus'
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
      choix: ['En manger (+6 PV max, −5 PV)', 'En cueillir (une fiole au hasard)'] },
    // Ajoutés en 3.40 (demandé par l'utilisateur : plus de variété). Le 2e choix est toujours possible.
    bivouac: { titre: 'Bivouac abandonné', ico: '⛺', texte: 'Une tente, des braises encore tièdes, un sac oublié.',
      choix: ['Dormir un peu (soigne 40 % des PV)', 'Fouiller le sac (+20 or et une fiole au hasard)'] },
    puits: { titre: 'Puits aux vœux', ico: '🪙', texte: 'Des pièces brillent tout au fond.',
      choix: ['Jeter 25 or et faire un vœu (+8 PV max)', 'Descendre chercher les pièces (+35 or, −6 PV)'] },
    colporteur: { titre: 'Colporteur louche', ico: '🕴️', texte: '« Une affaire en or, les yeux fermés ! »',
      choix: ['Acheter sans voir (55 or : une relique au hasard)', 'Refuser'] },
    sage: { titre: 'Vieux sage endormi', ico: '🦉', texte: 'Il ronfle sur ses parchemins, sa bourse à la ceinture.',
      choix: ['Le réveiller pour une leçon (améliore une carte au choix)', 'Lui prendre sa bourse (+40 or, mais une Blessure)'] },
    voyageur: { titre: 'Voyageur blessé', ico: '🤕', texte: 'Il ne peut plus avancer. Son sac déborde de parchemins.',
      choix: ['Le porter jusqu\'à l\'abri (−8 PV, 1 carte parmi 3, souvent rare)', 'Passer son chemin'] },
    idole: { titre: 'Idole dorée', ico: '🗿', texte: 'Elle est lourde, très lourde. Et elle te regarde.',
      choix: ['L\'emporter (+90 or, mais −6 PV max)', 'La laisser'] },
    roue: { titre: 'Roue du destin', ico: '🎡', texte: 'Une roue grince dans le noir : or, relique, soin… ou pire.',
      choix: ['Tourner la roue (au hasard : +60 or, une relique, tous les PV, −8 PV ou une Blessure)', 'Ne pas tenter le sort'] },
    gardien: { titre: 'Gardien assoupi', ico: '😴', texte: 'Un ogre dort contre le mur, une grosse bourse sur les genoux.',
      choix: ['Chiper la bourse (2 chances sur 3 : +70 or ; sinon il se réveille : −12 PV)', 'Passer sur la pointe des pattes'] },
    cartographe: { titre: 'Cartographe perdu', ico: '🗺️', texte: 'Il connaît l\'étage par cœur, mais plus la sortie.',
      choix: ['Acheter son plan (20 or : montre tout l\'étage)', 'Lui indiquer la sortie (+12 or)'] },
    chaudron: { titre: 'Chaudron qui bout', ico: '🫕', texte: 'Ça sent la magie et le poireau.',
      choix: ['Y jeter une carte (elle devient une autre carte, au hasard)', 'Boire un bol de soupe (+12 PV)'] },
    ratelier: { titre: 'Râtelier d\'armes', ico: '⚔️', texte: 'Tout a été pillé, ou presque.',
      choix: ['Prendre le marteau (ajoute Frappe lourde+ au paquet)', 'Prendre le pavois (ajoute Garde haute+ au paquet)'] },
    alchimiste: { titre: 'Alchimiste distrait', ico: '⚗️', texte: 'Il cherche une fiole pour finir son chef-d\'œuvre.',
      choix: ['Lui donner ta première fiole (contre une relique commune)', 'Repartir avec un échantillon (une fiole au hasard, si tu as la place)'] },
    // Le coffre maudit a sa propre pièce (hors : jamais tiré pour un autel)
    coffremaudit: { titre: 'Coffre maudit', ico: '🔮', hors: true, texte: 'Une brume violette s\'en échappe. Ce qu\'il contient a un prix.',
      choix: ['L\'ouvrir (une relique, mais une malédiction dans le paquet)', 'Le laisser fermé'] }
  };

  // ---------- Pièces à risque (3.40, demandé par l'utilisateur : un chemin qu'on choisit) ----------
  // Une par étage, toujours facultative, annoncée sur le plan ; les trois types tournent d'un étage à l'autre (ordre selon la graine).
  // defi : le second élite de l'étage (butin d'élite) ; tresor : un grand coffre piégé (embuscade, puis or, fiole et poussières) ;
  // maudit : un coffre qui donne une relique contre une malédiction.
  var RISQUES = {
    ordre: ['defi', 'tresor', 'maudit'],
    defi: { nom: 'Salle du défi', ico: '💀' },
    tresor: { nom: 'Trésor piégé', ico: '💰', or: [60, 80], poussiere: 3, vuln: 1 },
    maudit: { nom: 'Coffre maudit', ico: '🔮', maledictions: ['fardeau', 'doute'] }
  };

  // ---------- La semaine (3.29, refaite en 3.30 ; demandé par l'utilisateur : « que le personnage monte réellement en puissance en formant
  // un deck de plus en plus fort au fil de la semaine », Héroïque quasi impossible sans le paquet construit en Normal) ----------
  // Lundi : tout repart de zéro, seul Normal est ouvert. Gagner un Normal ouvre Héroïque, gagner un Héroïque ouvre Mythique,
  // gagner un Mythique à sa clé donne la suivante (+1 à +5). Le PAQUET de la fin d'un donjon (gagné ou perdu) devient le paquet de
  // départ du suivant, avec ses reliques (une seule de boss) et ses PV max gagnés : le « héros de la semaine ». Chaque boss vaincu donne des éclats,
  // qui achètent des bonus de départ ou travaillent le paquet entre deux donjons (améliorer, retirer une carte).
  var SEMAINE = {
    reliquesMax: 4,            // reliques qu'on garde d'un donjon à l'autre (on choisit lesquelles à la fin)
    bossMax: 1,                // dont une seule relique de boss
    pvMax: 20,                 // PV max gagnés en chemin qu'on garde au plus
    eclats: { normal: 1, heroique: 2, mythique: 3 },   // par boss vaincu
    forge: 2, elaguer: 2,      // prix en éclats : améliorer une carte du paquet, retirer une carte
    paquetMax: 60,
    bonus: {
      pv:      { nom: 'Robustesse',   ico: '❤️', max: 3, val: 3,  prix: [2, 3, 4], texte: '+3 PV max au départ' },
      or:      { nom: 'Bourse',       ico: '🪙', max: 2, val: 20, prix: [1, 2],    texte: '+20 or au départ' },
      fiole:   { nom: 'Provisions',   ico: '🧪', max: 1, prix: [3],       texte: 'Une fiole au hasard au départ' }
    }
  };

  // ---------- Prix chez le marchand ----------
  var PRIX = { c: 45, u: 70, r: 120, fiole: 40, relique: 150, retrait: 70 };

  // ---------- Les Terres de la Vallée (3.71) ----------
  // LEGENDAIRES : les cartes rares, dans l'ordre du Grimoire. SANCTUAIRE : le boss de la semaine, seul dans sa salle
  // (pv : ses PV, car on l'affronte sans avoir traversé un étage). BOSS_SANCTUAIRE : ceux qui tournent, une semaine chacun.
  var LEGENDAIRES = L.filter(function (c) { return c.rar === 'l'; }).map(function (c) { return c.id; });
  // pv : multiplicateur des PV de chaque boss (mesuré au joueur automatique, Normal, paquet de départ : ~65 à 75 % de victoires)
  var SANCTUAIRE = { etoiles: 5 };
  var BOSS_SANCTUAIRE = [['roi', 'caves', 1.4], ['reine', 'catacombes', 0.6], ['mycelium', 'champignonniere', 1.5], ['dragongivre', 'glace', 0.55], ['pieuvre', 'riviere', 1.4], ['archiviste', 'bibliotheque', 0.33]];

  return { ETATS: ETATS, CLASSES: CLASSES, CARTES: CARTES, FIOLES: FIOLES, RELIQUES: RELIQUES, MONSTRES: MONSTRES,
           ETAGES: ETAGES, LIEUX: LIEUX, REGLES_LIEU: REGLES_LIEU, PERILS: PERILS, DIFFICULTES: DIFFICULTES, ORDRE_DIFFICULTES: ORDRE_DIFFICULTES, POISON_GROUPE: POISON_GROUPE, SOIN_GROUPE: SOIN_GROUPE, SEMAINE: SEMAINE, CLE_PAR_NIVEAU: CLE_PAR_NIVEAU, EVENEMENTS: EVENEMENTS, RISQUES: RISQUES, PRIX: PRIX,
           LEGENDAIRES: LEGENDAIRES, SANCTUAIRE: SANCTUAIRE, BOSS_SANCTUAIRE: BOSS_SANCTUAIRE };
})();
if (typeof module !== 'undefined') module.exports = DJD;
