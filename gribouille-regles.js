// ================== GRIBOUILLE : MOTS ET RÈGLES ==================
// Un joueur dessine un mot, les autres le devinent ; le plus rapide marque le plus de points.
// Utilisé par gribouille.html ; testable avec Node (module.exports en bas).

var GB = (function () {
  // Mots à dessiner (liste maison), du plus simple au plus difficile, tous dessinables
  var MOTS = (
    // Animaux
    'chat chien poisson oiseau cheval vache cochon mouton lapin souris éléphant girafe lion tigre singe serpent ' +
    'tortue escargot papillon abeille araignée fourmi coccinelle grenouille crocodile requin baleine dauphin pieuvre ' +
    'crabe méduse pingouin hibou aigle canard poule coq dinosaure kangourou zèbre ours panda koala chameau ' +
    'hérisson chauve-souris écureuil renard loup licorne dragon flamant-rose perroquet moustique ver-de-terre ' +
    // Nourriture
    'pomme banane fraise cerise ananas citron poire raisin pastèque carotte tomate champignon brocoli maïs ' +
    'pizza hamburger frites sandwich gâteau croissant baguette fromage œuf glace sucette bonbon chocolat ' +
    'crêpe hot-dog sushi spaghetti soupe biscuit beignet popcorn miel café thé lait jus-d-orange ' +
    // Maison et objets
    'maison porte fenêtre lit chaise table lampe canapé télévision téléphone ordinateur clavier horloge réveil ' +
    'parapluie lunettes chapeau casquette chaussure chaussette pantalon robe écharpe gant ceinture cravate ' +
    'clé cadenas ciseaux crayon stylo livre cahier règle gomme pinceau marteau tournevis scie échelle seau ' +
    'balai aspirateur bougie ampoule miroir brosse-à-dents savon serviette baignoire douche toilettes ' +
    'fourchette couteau cuillère assiette verre bouteille tasse casserole poêle frigo four micro-ondes ' +
    'valise sac-à-dos portefeuille bague collier montre couronne trophée médaille cadeau ballon-de-baudruche ' +
    'appareil-photo guitare piano batterie trompette violon micro casque-audio radio manette robot fusée ' +
    // Transports
    'voiture vélo moto bus camion train avion hélicoptère bateau voilier sous-marin tracteur trottinette ' +
    'ambulance camion-de-pompiers tank montgolfière parachute skateboard roller ' +
    // Nature et lieux
    'soleil lune étoile nuage pluie neige éclair arc-en-ciel arbre fleur feuille cactus palmier sapin ' +
    'montagne volcan île plage vague rivière cascade lac désert forêt grotte château pyramide phare pont ' +
    'tour-eiffel moulin igloo tente cabane église école hôpital usine ferme cirque zoo parc manège ' +
    // Corps et personnes
    'œil nez bouche oreille main pied dent cœur cerveau squelette moustache barbe cheveux ' +
    'bébé roi reine pirate sorcière fantôme vampire momie zombie extraterrestre astronaute cow-boy ' +
    'clown chevalier ninja policier pompier cuisinier docteur facteur boulanger magicien sirène ange ' +
    // Sports et loisirs
    'football basket tennis golf ski natation boxe pêche cerf-volant toboggan balançoire château-de-sable ' +
    'bonhomme-de-neige sapin-de-noël citrouille feu-d-artifice cinéma bowling échecs dé carte-à-jouer puzzle ' +
    // Actions et idées
    'dormir courir nager danser chanter pleurer rire éternuer bâiller sauter voler tomber pêcher cuisiner ' +
    'lire écrire peindre bricoler jardiner plonger ronfler applaudir ' +
    // Un peu plus difficile
    'aimant boussole carte-au-trésor sablier loupe microscope télescope satellite planète comète ' +
    'éolienne panneau-solaire barrage autoroute rond-point embouteillage feu-rouge passage-piéton ' +
    'parking ascenseur escalier toboggan-aquatique piscine sauna camping pique-nique barbecue ' +
    'hamac transat parasol bouée tuba palmes requin-marteau étoile-de-mer hippocampe homard moule ' +
    'mariage anniversaire vacances orage tornade tremblement-de-terre inondation embouteillage'
  ).split(/\s+/).filter(Boolean)
   .map(m => m.replace(/-/g, ' ').replace(/ d /g, ' d\''))   // dans la liste, les tirets séparent les mots (jus-d-orange → jus d'orange)
   .filter((m, i, t) => t.indexOf(m) === i);                   // sans doublons

  // Les traits d'union significatifs sont rétablis (arc-en-ciel, cow-boy…)
  var TIRETS = ['arc en ciel', 'cow boy', 'hot dog', 'pique nique', 'micro ondes', 'chauve souris', 'sous marin', 'rond point', 'cerf volant'];
  MOTS = MOTS.map(m => TIRETS.indexOf(m) !== -1 ? m.replace(/ /g, '-') : m);

  // Forme simplifiée pour comparer une proposition au mot (sans accents, ni espaces, ni ponctuation)
  function normaliser(t) {
    return String(t || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  }
  // Distance d'édition (pour « tout près ! »)
  function distance(a, b) {
    var m = a.length, n = b.length, d = [];
    for (var i = 0; i <= m; i++) { d[i] = [i]; }
    for (var j = 0; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  // Résultat d'une proposition : 'ok', 'proche' ou 'non'
  function verifier(proposition, mot) {
    var p = normaliser(proposition), m = normaliser(mot);
    if (!p) return 'non';
    if (p === m) return 'ok';
    // Pluriel ou petite faute de frappe : tout près
    if (m.length >= 4 && distance(p, m) <= 1) return 'proche';
    if (m.length >= 8 && distance(p, m) <= 2) return 'proche';
    return 'non';
  }
  // Positions des lettres (ce qui est caché au départ)
  function positionsLettres(mot) {
    var r = [];
    for (var i = 0; i < mot.length; i++) if (/[a-zàâäçéèêëîïôöùûüœæ]/i.test(mot[i])) r.push(i);
    return r;
  }
  // Mot masqué : lettres en « _ », sauf celles déjà dévoilées ; espaces et tirets visibles
  function masque(mot, devoilees) {
    var pos = positionsLettres(mot);
    return mot.split('').map((ch, i) => pos.indexOf(i) === -1 ? ch : (devoilees.indexOf(i) !== -1 ? ch : '_')).join('');
  }
  // Nombre d'indices (lettres dévoilées) selon la longueur du mot : à mi-temps puis aux trois quarts
  function nbIndices(mot) {
    var n = positionsLettres(mot).length;
    return n >= 7 ? 2 : n >= 4 ? 1 : 0;
  }
  // Tire n mots au hasard, en évitant ceux déjà joués
  function tirerMots(n, exclus) {
    var libres = MOTS.filter(m => (exclus || []).indexOf(m) === -1);
    if (libres.length < n) libres = MOTS.slice();
    var r = [];
    while (r.length < n) {
      var m = libres[Math.floor(Math.random() * libres.length)];
      if (r.indexOf(m) === -1) r.push(m);
    }
    return r;
  }
  // Points : celui qui trouve gagne selon le temps restant, avec un bonus pour les deux premiers ;
  // le dessinateur gagne des points pour chaque joueur qui trouve.
  function pointsDevineur(resteMs, dureeMs, rang) {
    var f = Math.max(0, Math.min(1, resteMs / dureeMs));
    return Math.round(50 + 250 * f) + (rang === 0 ? 50 : rang === 1 ? 25 : 0);
  }
  var POINTS_DESSINATEUR = 60;

  return { MOTS: MOTS, normaliser: normaliser, distance: distance, verifier: verifier, positionsLettres: positionsLettres,
           masque: masque, nbIndices: nbIndices, tirerMots: tirerMots, pointsDevineur: pointsDevineur, POINTS_DESSINATEUR: POINTS_DESSINATEUR };
})();

if (typeof module !== 'undefined') module.exports = GB;
