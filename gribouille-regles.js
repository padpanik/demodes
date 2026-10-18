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
    'mariage anniversaire vacances orage tornade tremblement-de-terre inondation embouteillage ' +
    // ---- Encore des animaux ----
    'taureau chèvre âne lama hamster cochon-d-inde furet castor marmotte loutre phoque morse ours-polaire manchot ' +
    'mouette pélican cigogne paon dinde autruche colibri corbeau pie moineau pigeon chouette faucon vautour toucan ' +
    'cygne oie chenille limace scorpion sauterelle libellule guêpe mouche huître crevette calamar raie espadon ' +
    'poisson-rouge piranha anguille hippopotame rhinocéros gorille chimpanzé tatou paresseux gazelle bison élan cerf ' +
    'biche sanglier lièvre taupe dromadaire mammouth tyrannosaure phénix blaireau salamandre caméléon iguane lézard ' +
    'cobra orque narval oursin poulpe chiot chaton poussin agneau veau ver-luisant puce tique termite ' +
    // ---- Encore à manger ----
    'brioche pain-au-chocolat tarte gaufre muffin cookie macaron donut bretzel kebab tacos lasagnes raviolis riz ' +
    'couscous paella omelette steak saucisse jambon poulet-rôti salade chips cornichon olive avocat aubergine ' +
    'courgette poivron concombre radis betterave navet poireau oignon ail chou chou-fleur artichaut asperge ' +
    'petits-pois haricot noix noisette amande cacahuète châtaigne pêche abricot prune kiwi mangue noix-de-coco ' +
    'grenade figue myrtille framboise mûre melon orange pamplemousse clémentine yaourt beurre confiture sucre sel ' +
    'poivre ketchup moutarde mayonnaise farine pâtes nouilles tartine barbe-à-papa sucre-d-orge chewing-gum ' +
    'guimauve caramel pain-d-épices bûche-de-noël galette milkshake limonade vin bière champagne cocktail ' +
    'fondue raclette pot-au-feu quiche tartiflette croque-monsieur œuf-au-plat œufs-de-pâques ' +
    // ---- Dans la maison ----
    'armoire commode étagère bibliothèque tabouret fauteuil bureau coussin couverture oreiller rideau tapis ' +
    'paillasson radiateur cheminée ventilateur lave-linge lave-vaisselle grille-pain bouilloire cafetière mixeur ' +
    'fer-à-repasser poubelle éponge serpillière pince-à-linge cintre porte-manteau sèche-cheveux peigne rasoir ' +
    'dentifrice parfum rouge-à-lèvres vernis-à-ongles bracelet boucle-d-oreille lunettes-de-soleil sac-à-main canne ' +
    'béquilles fauteuil-roulant poussette berceau biberon tétine hochet doudou peluche poupée toupie yoyo billes ' +
    'tirelire coffre-fort trésor pièce-de-monnaie billet-de-banque carte-bancaire caddie panier boîte-de-conserve ' +
    'tire-bouchon casse-noisette passoire râpe rouleau-à-pâtisserie fouet louche spatule saladier plateau nappe ' +
    'bougeoir chandelier lanterne lustre interrupteur serrure sonnette escabeau tuyau robinet évier lavabo ' +
    'papier-toilette vase pot-de-fleurs nichoir cage aquarium niche laisse gamelle os drapeau calendrier ' +
    'journal affiche cadre sculpture tableau horloge-à-coucou sablier-de-cuisine ' +
    // ---- Outils, école, bureau ----
    'clou vis boulon perceuse pince clé-à-molette mètre pelle râteau brouette arrosoir tondeuse sécateur hache ' +
    'tronçonneuse truelle rouleau-de-peinture ruban-adhésif colle agrafeuse trombone punaise enveloppe timbre ' +
    'lettre colis boîte-aux-lettres calculatrice cartable trousse taille-crayon compas équerre craie globe ' +
    'dictionnaire tablette imprimante écran télécommande enceinte chargeur prise pile lampe-de-poche projecteur ' +
    'drone console caméra antenne parabole radar haut-parleur ' +
    // ---- Vêtements ----
    'tee-shirt pull manteau veste blouson imperméable short jupe chemise pyjama maillot-de-bain bonnet béret ' +
    'cagoule bottes sandales tongs baskets pantoufles talons-hauts nœud-papillon bretelles tablier uniforme ' +
    'costume déguisement masque cape diadème moufle chaussons-de-danse kimono ' +
    // ---- Transports et lieux ----
    'taxi métro tramway téléphérique bulldozer grue pelleteuse camion-poubelle dépanneuse limousine décapotable ' +
    'quad scooter calèche charrette traîneau kayak canoë pédalo paquebot péniche radeau yacht hydravion planeur ' +
    'deltaplane soucoupe-volante navette-spatiale wagon locomotive gare aéroport port station-service péage ' +
    'appartement immeuble gratte-ciel mairie musée prison banque supermarché boulangerie pharmacie restaurant ' +
    'hôtel stade gymnase jardin potager serre étang marais champ colline falaise canyon glacier banquise oasis ' +
    'jungle savane village ville cimetière cathédrale temple palais donjon puits fontaine statue kiosque ' +
    'cabine-téléphonique abribus lampadaire banc bac-à-sable labyrinthe ruche terrier fourmilière nid ' +
    'grande-roue montagnes-russes auto-tamponneuse chapiteau ' +
    // ---- Nature et météo ----
    'vent brouillard grêle tempête ouragan aurore-boréale coucher-de-soleil marée caillou rocher sable coquillage ' +
    'algue gland pomme-de-pin tronc racine branche rose tulipe tournesol marguerite pissenlit lavande muguet ' +
    'coquelicot bambou lierre trèfle-à-quatre-feuilles herbe buisson chêne saule-pleureur baobab bonsaï ' +
    'goutte-d-eau flaque stalactite geyser ' +
    // ---- Le corps ----
    'bras jambe genou coude épaule ventre nombril dos cou doigt pouce ongle orteil langue lèvres sourcil cil ' +
    'joue menton front poumon estomac muscle cicatrice tatouage larme empreinte-digitale ' +
    // ---- Personnages et métiers ----
    'plombier électricien mécanicien jardinier fermier pêcheur infirmier dentiste vétérinaire professeur ' +
    'juge soldat marin capitaine pilote hôtesse-de-l-air chauffeur serveur caissier coiffeur photographe peintre ' +
    'sculpteur musicien chanteur danseuse acteur journaliste écrivain scientifique inventeur détective espion ' +
    'prisonnier voleur bûcheron berger apiculteur explorateur alpiniste plongeur surfeur skieur cycliste ' +
    'footballeur arbitre jongleur acrobate dompteur fée lutin elfe nain géant ogre troll sorcier princesse ' +
    'prince samouraï viking gladiateur pharaon père-noël épouvantail super-héros chef-cuisinier mime ventriloque ' +
    'maître-nageur garde-du-corps bébé-qui-pleure grand-mère grand-père jumeaux ' +
    // ---- Actions ----
    'marcher ramper grimper glisser patiner skier surfer ramer conduire atterrir décoller tirer pousser porter ' +
    'lancer attraper frapper dribbler nager-le-crawl bronzer camper cueillir planter arroser tondre-la-pelouse ' +
    'scier clouer dessiner coudre tricoter repasser laver balayer ranger manger boire mâcher souffler siffler ' +
    'crier chuchoter téléphoner photographier filmer embrasser saluer réfléchir rêver se-réveiller s-habiller ' +
    'se-brosser-les-dents se-maquiller tousser fondre brûler geler exploser jongler méditer prier voter ' +
    'faire-du-stop faire-la-queue faire-la-sieste faire-les-courses promener-le-chien' + ' ' +
    // ---- Sports et loisirs ----
    'rugby volley handball hockey baseball ping-pong badminton escrime judo karaté yoga gymnastique équitation ' +
    'escalade parapente surf planche-à-voile aviron cyclisme marathon saut-à-la-perche haltère trampoline ' +
    'patinoire hula-hoop dominos karaoké concert festival fanfare théâtre marionnette feu-de-camp ' +
    'chasse-au-trésor cache-cache marelle corde-à-sauter bataille-de-boules-de-neige bataille-d-oreillers ' +
    'course-en-sac tir-à-la-corde château-gonflable ' +
    // ---- Fêtes, émotions, idées ----
    'noël pâques halloween carnaval saint-valentin gâteau-d-anniversaire guirlande confettis serpentin voyage ' +
    'rentrée-des-classes examen diplôme naissance amour colère peur tristesse joie surprise fatigue faim soif ' +
    'rhume fièvre hoquet cauchemar fou-rire jalousie ' +
    // ---- Musique ----
    'accordéon harpe flûte saxophone clarinette tambour xylophone harmonica banjo ukulélé contrebasse orgue ' +
    'maracas triangle cymbales note-de-musique chef-d-orchestre platine-vinyle ' +
    // ---- Espace et sciences ----
    'astéroïde galaxie trou-noir étoile-filante constellation éclipse météorite atome éprouvette laboratoire ' +
    'fossile ADN thermomètre stéthoscope seringue pansement ambulancier fusée-éclairante'
  ).split(/\s+/).filter(Boolean)
   .map(m => m.replace(/-/g, ' ').replace(/ d /g, ' d\'').replace(/ l /g, ' l\'').replace(/^s /, 's\'').replace(/ s /g, ' s\''))   // dans la liste, les tirets séparent les mots (jus-d-orange → jus d'orange)
   .filter((m, i, t) => t.indexOf(m) === i);                   // sans doublons

  // Les traits d'union significatifs sont rétablis (arc-en-ciel, cow-boy…)
  var TIRETS = ['arc en ciel', 'cow boy', 'hot dog', 'pique nique', 'micro ondes', 'chauve souris', 'sous marin', 'rond point', 'cerf volant',
                'cochon d\'inde', 'chou fleur', 'petits pois', 'chewing gum', 'pot au feu', 'croque monsieur', 'lave linge', 'lave vaisselle',
                'grille pain', 'pince à linge', 'porte manteau', 'sèche cheveux', 'coffre fort', 'tire bouchon', 'casse noisette',
                'taille crayon', 'haut parleur', 'tee shirt', 'nœud papillon', 'gratte ciel', 'téléphérique', 'auto tamponneuse',
                'saule pleureur', 'hôtesse de l\'air', 'garde du corps', 'grand mère', 'grand père', 'père noël', 'super héros',
                'maître nageur', 'ping pong', 'hula hoop', 'cache cache', 'saint valentin', 'fou rire', 'trou noir', 'clé à molette',
                'boîte aux lettres', 'chef d\'orchestre', 'station service', 'aurore boréale', 'pain au chocolat'];
  // (garde la même forme qu'avant pour les traits d'union rétablis)
  MOTS = MOTS.map(m => TIRETS.indexOf(m) !== -1 ? m.replace(/ /g, '-') : m);
  // Expressions avec trait d'union seulement à certains endroits
  var FORMES = { 'pain-au-chocolat': 'pain au chocolat', 'boîte-aux-lettres': 'boîte aux lettres', 'clé-à-molette': 'clé à molette',
                 'hôtesse-de-l\'air': 'hôtesse de l\'air', 'garde-du-corps': 'garde du corps', 'chef-d\'orchestre': 'chef d\'orchestre',
                 'station-service': 'station-service', 'pince-à-linge': 'pince à linge', 'aurore-boréale': 'aurore boréale', 'saule-pleureur': 'saule pleureur',
                 'auto-tamponneuse': 'auto-tamponneuse', 'trou-noir': 'trou noir', 'fou-rire': 'fou rire', 'cochon-d\'inde': 'cochon d\'Inde',
                 'père-noël': 'père Noël', 'tour eiffel': 'tour Eiffel', 'saint-valentin': 'Saint-Valentin', 'noël': 'Noël', 'pâques': 'Pâques',
                 'halloween': 'Halloween', 'sapin de noël': 'sapin de Noël', 'bûche de noël': 'bûche de Noël', 'œufs de pâques': 'œufs de Pâques' };
  MOTS = MOTS.map(m => FORMES[m] || m).filter((m, i, t) => t.indexOf(m) === i);

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
  // Forme affichée dans l'indice : œ → oe, æ → ae (deux lettres, comme on les tape au clavier)
  function deplier(mot) { return String(mot).replace(/œ/g, 'oe').replace(/Œ/g, 'Oe').replace(/æ/g, 'ae').replace(/Æ/g, 'Ae'); }
  // Positions des lettres (ce qui est caché au départ)
  function positionsLettres(mot) {
    mot = deplier(mot);
    var r = [];
    for (var i = 0; i < mot.length; i++) if (/[a-zàâäçéèêëîïôöùûüœæ]/i.test(mot[i])) r.push(i);
    return r;
  }
  // Mot masqué : lettres en « _ », sauf celles déjà dévoilées ; espaces et tirets visibles
  function masque(mot, devoilees) {
    mot = deplier(mot);
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
