// ================== « Combien sur 10 ? » : thèmes, questions maison, plateau et cartes spéciales ==================
// Version maison d'un jeu d'ambiance de culture générale (sans le nom, les cartes ni les visuels de la marque) :
// on tire un sujet, l'équipe annonce de 1 à 10 combien elle s'y connaît, puis répond à la question de ce niveau.
// Toutes les questions sont écrites pour Désdale. Testable avec Node : node -e "require('./dix/dix-regles.js')"

var DX = (function () {
  // Les quatre thèmes du jeu d'origine, plus les deux cases spéciales
  var THEMES = {
    improbable: { nom: 'Improbable', couleur: '#7950f2', clair: '#f0ebff', ico: '🦄', desc: 'Des sujets étonnants, insolites ou décalés.' },
    plaisir:    { nom: 'Plaisir',    couleur: '#e64980', clair: '#fdebf2', ico: '🎉', desc: 'Culture pop, loisirs, gourmandise.' },
    mature:     { nom: 'Mature',     couleur: '#f76707', clair: '#fff0e3', ico: '🍷', desc: 'La vie d\'adulte : argent, papiers, maison, apéro…' },
    scolaire:   { nom: 'Scolaire',   couleur: '#1c7ed6', clair: '#e7f3ff', ico: '🎓', desc: 'Ce qu\'on apprend (ou a oublié) à l\'école.' },
    challenge:  { nom: 'Challenge',  couleur: '#f59f00', clair: '#fff6db', ico: '⚡', desc: 'Une épreuve originale.' },
    surprise:   { nom: 'Superbe ou aïe', couleur: '#495057', clair: '#eef0f2', ico: '🎲', desc: 'Un bonus… ou un malus.' }
  };
  var ORDRE_THEMES = ['improbable', 'plaisir', 'mature', 'scolaire'];

  // Sujets : [thème, nom, [[question, réponse], … niveaux 1 à 10]]
  var SUJETS = [
    // ---------------- IMPROBABLE ----------------
    ['improbable', 'Les fromages', [
      ['Quel fromage suisse plein de trous fait le bonheur des souris de dessins animés ?', 'L\'emmental'],
      ['Quel fromage fondu fait des fils si longs sur la pizza qu\'on finit par manger avec les doigts ?', 'La mozzarella'],
      ['Quel fromage savoyard, fondu sur des pommes de terre et des lardons, oblige à une sieste de trois heures ?', 'Le reblochon (dans la tartiflette)'],
      ['Dans quelle région fabrique-t-on le camembert ?', 'La Normandie'],
      ['De quelle couleur est la pâte de la mimolette ?', 'Orange'],
      ['Dans quel massif montagneux fabrique-t-on surtout le comté ?', 'Le Jura'],
      ['Quel fromage fut sacré « roi des fromages » au congrès de Vienne en 1815 ?', 'Le brie (de Meaux)'],
      ['Dans quel éboulis rocheux de l\'Aveyron s\'affine le roquefort ?', 'Le Combalou (à Roquefort-sur-Soulzon)'],
      ['Quelles bactéries creusent les trous de l\'emmental en dégageant du gaz carbonique ?', 'Les bactéries propioniques (Propionibacterium)'],
      ['Quelle bactérie donne sa croûte orangée au munster ?', 'Brevibacterium linens (le « ferment du rouge »)']
    ]],
    ['improbable', 'Les dinosaures', [
      ['Quel dinosaure géant aux minuscules bras ne peut même pas applaudir à la fin d\'un spectacle ?', 'Le tyrannosaure (T-Rex)'],
      ['Vrai ou faux : comme dans les dessins animés, les hommes préhistoriques allaient au travail à dos de dinosaure.', 'Faux (des dizaines de millions d\'années les séparent)'],
      ['Quel dinosaure à trois cornes aurait fait un porte-manteau parfait ?', 'Le tricératops'],
      ['Quel dinosaure portait de grandes plaques sur le dos et des pointes au bout de la queue ?', 'Le stégosaure'],
      ['Quels animaux d\'aujourd\'hui descendent directement des dinosaures ?', 'Les oiseaux'],
      ['Il y a environ combien de millions d\'années les grands dinosaures ont-ils disparu ?', '66 millions d\'années'],
      ['Quelle période géologique vient juste avant le Crétacé ?', 'Le Jurassique'],
      ['Comment s\'appelle le cratère laissé au Mexique par la météorite qui a contribué à leur disparition ?', 'Chicxulub (dans le Yucatán)'],
      ['Quel savant britannique a inventé le mot « dinosaure » en 1842 ?', 'Richard Owen'],
      ['Quel élément rare, trouvé en excès dans une couche géologique par Luis et Walter Alvarez en 1980, a appuyé la thèse de la météorite ?', 'L\'iridium']
    ]],
    ['improbable', 'Les phobies', [
      ['Comment s\'appelle la peur qui fait grimper sur une chaise en hurlant pour une bestiole à huit pattes de 2 mm ?', 'L\'arachnophobie'],
      ['Votre ami refuse l\'ascenseur, l\'IRM et même le placard à balais : comment s\'appelle sa peur des espaces fermés ?', 'La claustrophobie'],
      ['Votre ami refuse la piscine, la douche et même le verre d\'eau du repas : comment s\'appelle la peur de l\'eau ?', 'L\'hydrophobie (ou aquaphobie)'],
      ['Comment appelle-t-on la peur du vide, des hauteurs ?', 'L\'acrophobie'],
      ['L\'agoraphobie, c\'est la peur de quoi ?', 'Des espaces publics, de la foule, des lieux d\'où l\'on ne peut pas sortir facilement'],
      ['La coulrophobie, c\'est la peur de quoi ?', 'Des clowns'],
      ['Comment appelle-t-on la peur des serpents ?', 'L\'ophiophobie'],
      ['Comment appelle-t-on la peur du nombre 13 ?', 'La triskaïdékaphobie'],
      ['Comment appelle-t-on la peur du vendredi 13 ?', 'La paraskevidékatriaphobie'],
      ['Comment appelle-t-on (avec humour) la peur des mots trop longs ?', 'L\'hippopotomonstrosesquippedaliophobie']
    ]],
    ['improbable', 'Les cris des animaux', [
      ['Votre voisin fait « meuh » tous les matins au réveil. Quel animal imite-t-il ?', 'La vache (elle meugle)'],
      ['Que fait le mouton, qui en a assez qu\'on le compte toutes les nuits pour s\'endormir ?', 'Il bêle'],
      ['Que fait le coq à 5 heures du matin, au grand désespoir de tout le village ?', 'Il chante (cocorico !)'],
      ['Que fait le loup ?', 'Il hurle'],
      ['Que fait la grenouille ?', 'Elle coasse'],
      ['Que fait le corbeau ?', 'Il croasse'],
      ['Que fait l\'éléphant ?', 'Il barrit'],
      ['Que fait le chameau ?', 'Il blatère'],
      ['Que fait la cigogne ?', 'Elle craquette (ou claquette)'],
      ['Que fait la perdrix ?', 'Elle cacabe']
    ]],
    ['improbable', 'Les expressions françaises', [
      ['Si quelqu\'un vous « pose un lapin », faut-il prévoir des carottes ?', 'Non : il n\'est pas venu au rendez-vous'],
      ['Si vous avez « un chat dans la gorge », faut-il appeler le vétérinaire ?', 'Non : on est enroué'],
      ['Si un pull « coûte les yeux de la tête », combien d\'yeux faut-il donner à la caisse ?', 'Aucun : il coûte très cher'],
      ['Que veut dire « tomber dans les pommes » ?', 'S\'évanouir'],
      ['Que veut dire « avoir le cafard » ?', 'Être triste, déprimé'],
      ['Que veut dire « faire chou blanc » ?', 'Échouer, ne rien obtenir'],
      ['Que veut dire « être dans de beaux draps » ?', 'Être dans une situation difficile'],
      ['Que veut dire « avoir maille à partir » avec quelqu\'un ?', 'Avoir un différend, une dispute avec lui'],
      ['Dans « avoir maille à partir », que désignait la maille ?', 'Une petite monnaie du Moyen Âge, impossible à partager (« partir » = partager)'],
      ['Dans « à la queue leu leu », que désigne le mot « leu » ?', 'Le loup (ancienne forme du mot)']
    ]],
    ['improbable', 'Les inventions', [
      ['Quelle invention en caoutchouc permet d\'effacer ses fautes… et de la mâchouiller pendant les contrôles ?', 'La gomme'],
      ['Quel objet du quotidien, inventé pour ne plus se mouiller, se retourne au premier coup de vent ?', 'Le parapluie'],
      ['Quel Américain a mis au point l\'ampoule électrique… sans doute en ayant enfin une idée lumineuse ?', 'Thomas Edison'],
      ['Dans quel pays le papier a-t-il été inventé ?', 'La Chine'],
      ['Qu\'a inventé László Bíró ?', 'Le stylo à bille'],
      ['Quel appareil Percy Spencer a-t-il inventé après qu\'une barre chocolatée a fondu dans sa poche ?', 'Le four à micro-ondes'],
      ['Quel Français a inventé une machine à calculer en 1642 ?', 'Blaise Pascal (la Pascaline)'],
      ['Quel médecin français a inventé le stéthoscope, en 1816 ?', 'René Laennec'],
      ['Quel Français a construit en 1769 le premier véhicule à vapeur, le fardier ?', 'Joseph Cugnot'],
      ['Quel ingénieur a inventé le Velcro en observant des bardanes, et de quelle nationalité était-il ?', 'George de Mestral, suisse']
    ]],
    ['improbable', 'Les créatures légendaires', [
      ['Quel cheval blanc magique a une corne sur le front et des paillettes sur tous les cahiers d\'écolier ?', 'La licorne'],
      ['Quelle créature des contes de fées, petite et ailée, laisse une pièce sous l\'oreiller contre une dent de lait ?', 'La petite souris (ou la fée des dents)'],
      ['Quel cheval ailé de la mythologie grecque n\'a jamais eu besoin de prendre l\'avion ?', 'Pégase'],
      ['Comment s\'appelle la créature mi-femme, mi-poisson ?', 'La sirène'],
      ['Quel oiseau renaît de ses cendres ?', 'Le phénix'],
      ['Quel monstre à tête de taureau était enfermé dans le labyrinthe ?', 'Le Minotaure'],
      ['Dans quel pays vivrait le monstre du Loch Ness ?', 'L\'Écosse'],
      ['Quel monstre grec a une tête de lion, un corps de chèvre et une queue de serpent ?', 'La Chimère'],
      ['Quel héros grec a vaincu la Chimère, monté sur Pégase ?', 'Bellérophon'],
      ['Quel monstre de Provence aurait été dompté par sainte Marthe ?', 'La Tarasque']
    ]],
    ['improbable', 'Les animaux étonnants', [
      ['Quel animal à longue trompe ne peut pas sauter, même s\'il le voulait très fort ?', 'L\'éléphant'],
      ['Quel animal noir et blanc passe environ 14 heures par jour à manger du bambou… et le reste à dormir ?', 'Le panda (géant)'],
      ['Quel mammifère qui pond des œufs, avec un bec de canard et une queue de castor, semble avoir été inventé un lundi matin ?', 'L\'ornithorynque'],
      ['Chez l\'hippocampe, qui porte les petits : le mâle ou la femelle ?', 'Le mâle'],
      ['Combien de cœurs a une pieuvre ?', 'Trois'],
      ['De quelle couleur est la peau de l\'ours polaire, sous sa fourrure ?', 'Noire'],
      ['Quel minuscule animal peut survivre au vide de l\'espace ?', 'Le tardigrade'],
      ['Quel animal a des empreintes digitales presque identiques aux nôtres ?', 'Le koala'],
      ['Quel requin de l\'Atlantique Nord peut vivre plusieurs siècles, un record chez les vertébrés ?', 'Le requin du Groenland'],
      ['Quelle méduse est surnommée « immortelle » parce qu\'elle peut rajeunir ?', 'Turritopsis dohrnii']
    ]],

    // ---------------- PLAISIR ----------------
    ['plaisir', 'Les dessins animés', [
      ['De quelle couleur sont les petits lutins qui vivent dans des champignons et disent « schtroumpf » à tout bout de champ ?', 'Bleus (les Schtroumpfs)'],
      ['Quel lionceau du « Roi lion » finit par manger des insectes avec un phacochère et un suricate ?', 'Simba'],
      ['Quel est le métier de Bob l\'éponge, qui vit dans un ananas sous la mer ?', 'Cuisinier (au Crabe croustillant)'],
      ['Comment s\'appelle le bonhomme de neige de « La Reine des neiges » ?', 'Olaf'],
      ['Comment s\'appelle le chat qui poursuit Titi ?', 'Grosminet'],
      ['Dans quelle ville vit la famille Simpson ?', 'Springfield'],
      ['Quel studio japonais a réalisé « Mon voisin Totoro » ?', 'Le studio Ghibli'],
      ['Dans « Il était une fois… la Vie », comment s\'appelle le vieux savant à barbe blanche ?', 'Maestro'],
      ['Qui a réalisé « Le Roi et l\'Oiseau » (1980) ?', 'Paul Grimault'],
      ['Quelle Allemande a réalisé « Les Aventures du prince Ahmed » (1926), l\'un des plus anciens longs métrages d\'animation conservés ?', 'Lotte Reiniger']
    ]],
    ['plaisir', 'Les jeux vidéo', [
      ['Quel est le métier de Mario, qui passe pourtant plus de temps à sauter sur des champignons qu\'à réparer des fuites ?', 'Plombier'],
      ['Comment s\'appelle le hérisson bleu qui court si vite qu\'il oublie toujours de s\'arrêter ?', 'Sonic'],
      ['Quel Pokémon jaune refuse obstinément de rentrer dans sa Pokéball ?', 'Pikachu'],
      ['Quel jeu consiste à empiler des blocs qui tombent pour faire des lignes ?', 'Tetris'],
      ['Comment s\'appelle la princesse que Mario doit souvent sauver ?', 'Peach'],
      ['Quel jeu de construction en blocs cubiques est le plus vendu de l\'histoire ?', 'Minecraft'],
      ['Comment s\'appelle le héros de « The Legend of Zelda » ?', 'Link'],
      ['Quel Français a créé le personnage de Rayman ?', 'Michel Ancel'],
      ['Citez les quatre fantômes de Pac-Man sous leurs noms américains.', 'Blinky, Pinky, Inky et Clyde'],
      ['Quel ingénieur a conçu « Pong » chez Atari, en 1972 ?', 'Allan Alcorn']
    ]],
    ['plaisir', 'La chanson française', [
      ['Quelle chanson d\'Édith Piaf donne l\'impression que tout est beau, même un lundi matin ?', 'La Vie en rose'],
      ['Quel chanteur belge a fait danser toute la planète en chantant « Alors on danse »… sur des paroles plutôt déprimantes ?', 'Stromae'],
      ['Quelle chanteuse québécoise a fait pleurer la planète avec la chanson de « Titanic » ?', 'Céline Dion'],
      ['Qui a écrit et chanté « Ne me quitte pas » ?', 'Jacques Brel'],
      ['Qui chante « Les Champs-Élysées » ?', 'Joe Dassin'],
      ['Quel groupe chante « L\'Aventurier » ?', 'Indochine'],
      ['Quel chanteur a sorti l\'album « Histoire de Melody Nelson » ?', 'Serge Gainsbourg'],
      ['Qui a composé « Comme d\'habitude », devenue « My Way » ?', 'Claude François et Jacques Revaux'],
      ['Qui a écrit les paroles de « La Bohème » de Charles Aznavour ?', 'Jacques Plante'],
      ['Quelle compositrice a écrit la musique de « L\'Hymne à l\'amour » d\'Édith Piaf ?', 'Marguerite Monnot']
    ]],
    ['plaisir', 'Le cinéma', [
      ['Quel petit extraterrestre au long cou passe tout le film à vouloir « téléphoner maison » ?', 'E.T.'],
      ['Dans « Titanic », sur quoi flotte Rose à la fin… alors qu\'il y avait clairement de la place pour deux ?', 'Une porte (un morceau de boiserie)'],
      ['Dans quelle saga des dinosaures sont recréés dans un parc d\'attractions… ce qui, étonnamment, tourne mal ?', 'Jurassic Park'],
      ['Dans quel film de 2011 jouent Omar Sy et François Cluzet ?', 'Intouchables'],
      ['Combien de films compte la saga Harry Potter ?', 'Huit'],
      ['Dans quel quartier de Paris vit Amélie Poulain ?', 'Montmartre'],
      ['Dans « Bienvenue chez les Ch\'tis », dans quelle ville est muté Philippe ?', 'Bergues'],
      ['Quel est le titre du premier film projeté par les frères Lumière, en 1895 ?', 'La Sortie de l\'usine Lumière à Lyon'],
      ['Quel film a remporté le premier Oscar du meilleur film, en 1929 ?', 'Les Ailes (Wings)'],
      ['Quel film américain a reçu la toute première Palme d\'or, en 1955 ?', 'Marty (de Delbert Mann)']
    ]],
    ['plaisir', 'Le chocolat et les desserts', [
      ['Quel dessert italien au café et au mascarpone signifie à peu près « remonte-moi le moral » ?', 'Le tiramisu'],
      ['À la Chandeleur, que fait-on sauter dans la poêle en tenant une pièce dans l\'autre main ?', 'Des crêpes'],
      ['Quel gâteau en forme de bûche mange-t-on à Noël, alors que personne ne la mettrait dans la cheminée ?', 'La bûche de Noël'],
      ['Quelle crêpe flambée est parfumée à l\'orange ?', 'La crêpe Suzette'],
      ['Comment s\'appelle la pyramide de choux servie aux mariages ?', 'La pièce montée (le croquembouche)'],
      ['Quel ingrédient du cacao est à la base du chocolat blanc ?', 'Le beurre de cacao'],
      ['Quel pays est le premier producteur mondial de cacao ?', 'La Côte d\'Ivoire'],
      ['Quel pâtissier a créé l\'Ispahan (rose, litchi, framboise) ?', 'Pierre Hermé'],
      ['Quel Suisse a mis au point le chocolat au lait, en 1875 ?', 'Daniel Peter'],
      ['Quel chocolatier suisse a inventé le conchage, en 1879 ?', 'Rodolphe Lindt']
    ]],
    ['plaisir', 'Le football', [
      ['Combien de joueurs d\'une équipe ont le droit de toucher le ballon avec les mains, sans recevoir de carton ?', 'Un seul : le gardien (dans sa surface)'],
      ['Quelle couleur de carton fait quitter le terrain en boudant ?', 'Le rouge'],
      ['Combien de minutes dure un match, sans compter le temps passé par les joueurs à se rouler par terre ?', '90 minutes'],
      ['Qui est surnommé « Zizou » ?', 'Zinédine Zidane'],
      ['Quel pays a gagné le plus de Coupes du monde ?', 'Le Brésil (5)'],
      ['En quelle année la France a-t-elle gagné sa première Coupe du monde ?', '1998'],
      ['Quel club joue au Parc des Princes ?', 'Le Paris Saint-Germain'],
      ['Quel est le seul gardien de but à avoir remporté le Ballon d\'or ?', 'Lev Yachine (1963)'],
      ['Quel joueur détient le record de buts sur une seule Coupe du monde, avec 13 buts ?', 'Just Fontaine (1958)'],
      ['Quel Français a marqué le tout premier but de l\'histoire de la Coupe du monde, en 1930 ?', 'Lucien Laurent']
    ]],
    ['plaisir', 'Les séries', [
      ['Dans quelle série d\'animation une famille toute jaune regarde-t-elle la télé sur un canapé depuis plus de 30 ans ?', 'Les Simpson'],
      ['Dans quelle série espagnole les braqueurs portent-ils une combinaison rouge et un masque de Dalí ?', 'La casa de papel'],
      ['Dans quelle série coréenne des joueurs endettés risquent-ils leur vie à « 1, 2, 3, soleil » ?', 'Squid Game'],
      ['Dans « Game of Thrones », comment s\'appelle le trône que tous convoitent ?', 'Le Trône de fer'],
      ['Qui a créé « Kaamelott » et y joue le roi Arthur ?', 'Alexandre Astier'],
      ['Dans « Friends », comment s\'appelle le café où se retrouvent les amis ?', 'Le Central Perk'],
      ['Quel est le prénom du professeur de chimie de « Breaking Bad » ?', 'Walter (White)'],
      ['Qui a créé la série « Breaking Bad » ?', 'Vince Gilligan'],
      ['Qui a créé la série « Les Soprano » ?', 'David Chase'],
      ['Qui a créé « Twin Peaks » avec David Lynch ?', 'Mark Frost']
    ]],
    ['plaisir', 'La cuisine du monde', [
      ['De quel pays vient la pizza ? (Indice : pas d\'ananas dessus, s\'il vous plaît)', 'L\'Italie'],
      ['Quel plat japonais de riz et de poisson cru fait paniquer ceux qui confondent wasabi et purée d\'avocat ?', 'Les sushis'],
      ['Quelle sauce mexicaine verte se fait avec de l\'avocat… et disparaît en trois minutes à l\'apéro ?', 'Le guacamole'],
      ['Quel plat espagnol se fait avec du riz et du safran ?', 'La paella'],
      ['De quelle région du monde le couscous est-il originaire ?', 'Du Maghreb (Afrique du Nord)'],
      ['Quelle soupe froide espagnole se fait à base de tomate ?', 'Le gaspacho'],
      ['De quel pays vient le kimchi ?', 'La Corée'],
      ['Comment s\'appelle la grande galette éthiopienne faite de teff ?', 'L\'injera'],
      ['Qu\'était le garum, très apprécié des Romains ?', 'Une sauce de poisson fermenté'],
      ['Quel ferment, à base du champignon Aspergillus oryzae, sert à faire le miso et la sauce soja ?', 'Le koji']
    ]],

    // ---------------- MATURE ----------------
    ['mature', 'Le vin', [
      ['Quel vin à bulles fait sauter les bouchons (et parfois les lustres) au Nouvel an ?', 'Le champagne'],
      ['Comment appelle-t-on le spécialiste du restaurant qui fait tourner le vin dans son verre avec un air très sérieux ?', 'Le sommelier'],
      ['Quel vin, attendu chaque troisième jeudi de novembre, a parfois un goût de banane ?', 'Le beaujolais nouveau'],
      ['Quel cépage rouge est roi en Bourgogne ?', 'Le pinot noir'],
      ['Dans quelle grande région viticole produit-on le sauternes ?', 'Le Bordelais (Bordeaux)'],
      ['Comment s\'appelle la science du vin ?', 'L\'œnologie'],
      ['Comment s\'appelle une bouteille de 1,5 litre ?', 'Un magnum'],
      ['Quel insecte a ravagé les vignes françaises au XIXe siècle ?', 'Le phylloxéra'],
      ['Combien de litres contient un nabuchodonosor de champagne ?', '15 litres (20 bouteilles)'],
      ['Quel château est le seul à avoir été promu « premier cru » du classement de 1855, en 1973 ?', 'Château Mouton Rothschild']
    ]],
    ['mature', 'L\'argent et les impôts', [
      ['Quelle monnaie a remplacé le franc… et fait dire à nos grands-parents « ça fait combien en francs ? »', 'L\'euro'],
      ['Quel animal en céramique, fendu sur le dos, sert à garder ses économies ?', 'Le cochon (la tirelire)'],
      ['Quelle taxe se cache dans le prix de presque tout ce qu\'on achète, et s\'écrit avec trois lettres ?', 'La TVA (taxe sur la valeur ajoutée)'],
      ['Comment s\'appelle l\'impôt payé chaque année par les propriétaires d\'un logement ?', 'La taxe foncière'],
      ['En quelle année les pièces et billets en euros sont-ils arrivés ?', '2002'],
      ['Que veut dire le sigle SMIC ?', 'Salaire minimum interprofessionnel de croissance'],
      ['Combien de francs valait un euro (au centime près) ?', '6,56 francs (6,55957)'],
      ['Quel impôt a remplacé l\'ISF en 2018 ?', 'L\'impôt sur la fortune immobilière (IFI)'],
      ['Quel économiste a donné son nom à la courbe résumée par « trop d\'impôt tue l\'impôt » ?', 'Arthur Laffer'],
      ['Quel homme politique a fait adopter l\'impôt sur le revenu en France, voté en 1914 ?', 'Joseph Caillaux']
    ]],
    ['mature', 'La voiture', [
      ['De quelle couleur est le feu où tout le monde accélère en disant « il était encore orange » ?', 'Orange (il faut s\'arrêter, sauf si c\'est dangereux)'],
      ['Quelle grande lettre rouge, collée à l\'arrière d\'une voiture, prévient qu\'il faut être patient avec le conducteur ?', 'Le « A » (jeune conducteur)'],
      ['Quelle est la vitesse maximale sur autoroute par temps sec, même quand on est très en retard ?', '130 km/h'],
      ['Quelle marque automobile a un lion pour logo ?', 'Peugeot'],
      ['Combien de points compte un permis de conduire définitif ?', '12 points'],
      ['Avec combien de points démarre un permis probatoire ?', '6 points'],
      ['Quel est le taux d\'alcool maximal pour un conducteur confirmé, en grammes par litre de sang ?', '0,5 g/l'],
      ['Quel ingénieur allemand a breveté en 1886 la première automobile à moteur à essence ?', 'Carl Benz'],
      ['Quel designer italien a dessiné la Citroën DS ?', 'Flaminio Bertoni'],
      ['Quel Français a décrit le principe du moteur à quatre temps en 1862 ?', 'Alphonse Beau de Rochas']
    ]],
    ['mature', 'La maison et le bricolage', [
      ['Avec quel outil se tape-t-on le plus souvent sur les doigts en voulant planter un clou ?', 'Un marteau'],
      ['Quel meuble suédois en kit se monte avec une petite clé hexagonale… et il reste toujours une vis à la fin ?', 'Un meuble Ikea (la clé Allen)'],
      ['Quel outil à bulle sert à vérifier qu\'un tableau est droit, avant de l\'accrocher de travers quand même ?', 'Le niveau (à bulle)'],
      ['En quelle unité mesure-t-on la puissance d\'une ampoule ?', 'En watts'],
      ['Quelle scie électrique permet de découper le bois en courbe ?', 'La scie sauteuse'],
      ['Que veut dire DPE, dans une annonce immobilière ?', 'Diagnostic de performance énergétique'],
      ['Quelle est la tension du courant électrique dans une maison en France ?', '230 volts'],
      ['Quelle section de fil faut-il pour un circuit de prises 16 A, selon la norme française ?', '2,5 mm²'],
      ['Quelle sensibilité doit avoir un différentiel qui protège les personnes dans un logement ?', '30 mA'],
      ['Comment s\'appelle la poutre horizontale qui relie le pied des arbalétriers dans une ferme de charpente ?', 'L\'entrait']
    ]],
    ['mature', 'Le mariage et la vie à deux', [
      ['Où se dit-on « oui » pour un mariage civil, devant un monsieur ou une dame avec une écharpe tricolore ?', 'À la mairie (devant le maire ou un adjoint)'],
      ['Que lance la mariée par-dessus son épaule, provoquant une mêlée digne d\'un match de rugby ?', 'Son bouquet'],
      ['À quel doigt porte-t-on l\'alliance : le pouce, l\'annulaire ou le petit doigt levé en buvant le thé ?', 'L\'annulaire (gauche, en France)'],
      ['Comment appelle-t-on les 25 ans de mariage ?', 'Les noces d\'argent'],
      ['Comment appelle-t-on les 50 ans de mariage ?', 'Les noces d\'or'],
      ['Comment appelle-t-on la première année de mariage ?', 'Les noces de coton'],
      ['En quelle année le PACS a-t-il été créé ?', '1999'],
      ['Quelle ministre a donné son nom à la loi de 2013 ouvrant le mariage aux couples de même sexe ?', 'Christiane Taubira'],
      ['Combien de jours au moins doit durer la publication des bans avant un mariage ?', 'Dix jours'],
      ['À combien d\'années de mariage correspondent les noces de vermeil ?', '45 ans']
    ]],
    ['mature', 'Le travail', [
      ['Quel jour de la semaine est le plus détesté des travailleurs, au point d\'avoir son propre « blues » ?', 'Le lundi'],
      ['Comment appelle-t-on la pause du matin où l\'on parle de tout sauf du travail autour de la machine à café ?', 'La pause-café'],
      ['Quelle est la durée légale du travail par semaine en France ? (Pas « le moins possible ».)', '35 heures'],
      ['Combien de semaines de congés payés a-t-on par an en France ?', 'Cinq'],
      ['Que veut dire RTT ?', 'Réduction du temps de travail'],
      ['Quelle fête célèbre-t-on le 1er mai ?', 'La fête du Travail'],
      ['Quel nom Pôle emploi a-t-il pris en 2024 ?', 'France Travail'],
      ['Quelle est la durée maximale de la période d\'essai d\'un cadre en CDI, sans renouvellement ?', 'Quatre mois'],
      ['En quelle année le SMIC a-t-il remplacé le SMIG ?', '1970'],
      ['En quelle année a paru le premier livre du Code du travail français ?', '1910']
    ]],
    ['mature', 'L\'apéro et les cocktails', [
      ['Quel cocktail cubain au rhum oblige le barman à écraser de la menthe avec un bâton ?', 'Le mojito'],
      ['Quelle boisson anisée devient toute trouble quand on y verse de l\'eau, à Marseille ?', 'Le pastis'],
      ['Quels petits fruits secs salés, servis à l\'apéro, finissent toujours mangés avant que les invités arrivent ?', 'Les cacahuètes'],
      ['Quel alcool mexicain est tiré de l\'agave ?', 'La tequila'],
      ['Quel apéritif orange est le plus utilisé dans le spritz ?', 'L\'Apérol'],
      ['Le Bloody Mary, c\'est de la vodka et du jus de… ?', 'Tomate'],
      ['Dans le kir royal, par quoi remplace-t-on le vin blanc ?', 'Par du champagne'],
      ['Le daïquiri porte le nom d\'un lieu de quel pays ?', 'Cuba'],
      ['Quels sont les trois ingrédients du negroni ?', 'Gin, vermouth rouge et Campari'],
      ['Quel barman français est crédité du Bloody Mary, au Harry\'s Bar de Paris ?', 'Fernand Petiot']
    ]],
    ['mature', 'Les papiers et démarches', [
      ['Sur quel papier officiel, à montrer à la douane, est-on toujours moins beau qu\'en vrai ?', 'La carte d\'identité (ou le passeport)'],
      ['Quelle carte verte, glissée dans le portefeuille, rembourse la visite chez le médecin ?', 'La carte Vitale'],
      ['Que fait-on d\'abord en arrivant au guichet d\'une administration, avant d\'attendre 45 minutes ?', 'On prend un ticket (un numéro)'],
      ['Que veut dire le sigle CAF ?', 'Caisse d\'allocations familiales'],
      ['Combien de temps est valable le passeport d\'un adulte ?', '10 ans'],
      ['Que donne le premier chiffre d\'un numéro de sécurité sociale ?', 'Le sexe (1 pour un homme, 2 pour une femme)'],
      ['À partir de quel âge le recensement citoyen est-il obligatoire ?', '16 ans'],
      ['Dans quel délai faut-il déclarer une naissance en France ?', '5 jours'],
      ['Que veut dire URSSAF ?', 'Union de recouvrement des cotisations de sécurité sociale et d\'allocations familiales'],
      ['Dans un numéro de sécurité sociale, que représentent les 6e et 7e chiffres ?', 'Le département de naissance']
    ]],

    // ---------------- SCOLAIRE ----------------
    ['scolaire', 'L\'histoire de France', [
      ['Quel roi se faisait appeler le Roi-Soleil, sans doute parce qu\'il ne manquait pas d\'éclat ?', 'Louis XIV'],
      ['De quelle couleur était le cheval blanc d\'Henri IV ?', 'Blanc'],
      ['Quel empereur, connu pour sa main glissée dans son gilet, a perdu à Waterloo ?', 'Napoléon Ier'],
      ['Qui fut le premier président de la Ve République ?', 'Charles de Gaulle'],
      ['Quel roi a été guillotiné en 1793 ?', 'Louis XVI'],
      ['Quelle héroïne a délivré Orléans en 1429 ?', 'Jeanne d\'Arc'],
      ['Quelle bataille est associée à l\'année 1515 ?', 'Marignan'],
      ['Quel traité partage l\'empire de Charlemagne en 843 ?', 'Le traité de Verdun'],
      ['En quelle année l\'ordonnance de Villers-Cotterêts a-t-elle imposé le français dans les actes officiels ?', '1539'],
      ['Quel traité de 1475 met un terme à la guerre de Cent Ans ?', 'Le traité de Picquigny']
    ]],
    ['scolaire', 'La géographie', [
      ['Quelle est la capitale de l\'Italie, où mènent tous les chemins ?', 'Rome'],
      ['Quelle grande tour de fer de Paris devait être démontée au bout de 20 ans… et est toujours là ?', 'La tour Eiffel'],
      ['Quel plus haut sommet des Alpes porte un nom de dessert, une fois avec de la crème de marrons ?', 'Le mont Blanc'],
      ['Quel est le plus long fleuve de France ?', 'La Loire'],
      ['Quel est le plus petit pays du monde ?', 'Le Vatican'],
      ['Quelle est la capitale du Canada ?', 'Ottawa'],
      ['Quelle est la capitale de l\'Australie ?', 'Canberra'],
      ['Quelle est la capitale du Kazakhstan ?', 'Astana'],
      ['Quelle est la capitale de la Birmanie ?', 'Naypyidaw'],
      ['Quelle est la plus grande île lacustre du monde, dans le lac Huron ?', 'L\'île Manitoulin']
    ]],
    ['scolaire', 'La langue française', [
      ['Combien de lettres compte l\'alphabet français ? (Les gribouillis du docteur ne comptent pas.)', '26'],
      ['Quel est le pluriel de « cheval » ? (Attention, « chevals » vous fait reculer d\'une case… presque.)', 'Chevaux'],
      ['Combien de voyelles y a-t-il dans le mot « oiseau », qui n\'a presque que ça ?', 'Cinq : o, i, e, a, u'],
      ['Quel est le féminin d\'« acteur » ?', 'Actrice'],
      ['Comment s\'appelle le petit signe sous le c de « ç » ?', 'La cédille'],
      ['Quel est le participe passé de « résoudre » ?', 'Résolu'],
      ['Comment appelle-t-on un mot qui se lit pareil dans les deux sens, comme « radar » ?', 'Un palindrome'],
      ['Conjuguez « croire » au subjonctif présent, avec « nous ».', 'Que nous croyions'],
      ['Quel est le féminin de l\'adjectif « hébreu » ?', 'Hébraïque'],
      ['Comment appelle-t-on un texte qui s\'interdit une lettre, comme « La Disparition » de Perec ?', 'Un lipogramme']
    ]],
    ['scolaire', 'Les mathématiques', [
      ['Combien font 2 + 2 ? (Oui, c\'est vraiment la question.)', '4'],
      ['Si vous avez 10 bonbons et que vous en mangez 10, combien en reste-t-il pour les autres ?', '0'],
      ['Combien de côtés a un triangle ? (Un indice se cache dans le mot.)', 'Trois'],
      ['Quelle est la racine carrée de 144 ?', '12'],
      ['Combien vaut la somme des angles d\'un triangle ?', '180 degrés'],
      ['Quel théorème dit que, dans un triangle rectangle, a² + b² = c² ?', 'Le théorème de Pythagore'],
      ['Combien vaut π, arrondi au centième ?', '3,14'],
      ['Combien vaut « factorielle zéro » (0!) ?', '1'],
      ['Combien vaut la somme de tous les entiers de 1 à 100 ?', '5 050'],
      ['Quelle est la valeur du nombre d\'or, au millième près ?', '1,618']
    ]],
    ['scolaire', 'Le corps humain', [
      ['Quel organe bat plus vite quand on croise son amoureux… ou son banquier ?', 'Le cœur'],
      ['Quel organe gargouille en pleine réunion silencieuse pour annoncer à tout le monde qu\'on a sauté le petit-déjeuner ?', 'L\'estomac (le ventre)'],
      ['Combien de dents a un adulte avec ses dents de sagesse… ce qui ne le rend pas plus sage ?', '32'],
      ['Quel est le plus grand organe du corps ?', 'La peau'],
      ['Quelles cellules du sang transportent l\'oxygène ?', 'Les globules rouges (hématies)'],
      ['Combien de litres de sang un adulte a-t-il environ ?', 'Environ 5 litres'],
      ['Quel groupe sanguin est « donneur universel » ?', 'O négatif'],
      ['Comment s\'appelle le plus petit os du corps, dans l\'oreille ?', 'L\'étrier'],
      ['Comment s\'appelle la valve entre l\'oreillette gauche et le ventricule gauche ?', 'La valve mitrale'],
      ['Comment s\'appelle le plus petit muscle du corps humain ?', 'Le muscle stapédien (ou muscle de l\'étrier)']
    ]],
    ['scolaire', 'Les sciences', [
      ['Quelle est la formule chimique de l\'eau, que les savants aiment dire pour avoir l\'air savant ?', 'H₂O'],
      ['Quelle force fait tomber les pommes sur la tête des savants, comme Newton ?', 'La gravité (la pesanteur)'],
      ['Combien de planètes compte le système solaire, depuis que Pluton s\'est fait renvoyer en 2006 ?', 'Huit'],
      ['Quelle est la plus grosse planète du système solaire ?', 'Jupiter'],
      ['Quelle est la planète la plus proche du Soleil ?', 'Mercure'],
      ['Quel est le symbole chimique de l\'or ?', 'Au'],
      ['Qui a découvert la pénicilline ?', 'Alexander Fleming'],
      ['Combien d\'éléments compte le tableau périodique aujourd\'hui ?', '118'],
      ['Quel est le symbole chimique du tungstène ?', 'W'],
      ['Que vaut environ le nombre d\'Avogadro ?', '6,02 × 10²³ par mole']
    ]],
    ['scolaire', 'La littérature', [
      ['Quel jeune sorcier à lunettes et à cicatrice dort dans un placard sous l\'escalier ?', 'Harry Potter'],
      ['Dans « Le Petit Prince », que demande le petit prince au pilote en panne dans le désert ?', 'De lui dessiner un mouton'],
      ['Dans la fable de La Fontaine, que lâche le corbeau en ouvrant son large bec pour chanter ?', 'Son fromage'],
      ['Qui a écrit « Les Misérables » ?', 'Victor Hugo'],
      ['Qui a écrit « Le Tour du monde en quatre-vingts jours » ?', 'Jules Verne'],
      ['Qui a écrit « Les Trois Mousquetaires » ?', 'Alexandre Dumas'],
      ['Quel était le vrai nom de Molière ?', 'Jean-Baptiste Poquelin'],
      ['Qui a écrit « Les Liaisons dangereuses » ?', 'Choderlos de Laclos'],
      ['Quel écrivain a reçu un second Goncourt sous le nom d\'Émile Ajar ?', 'Romain Gary'],
      ['Qui a écrit « Les Chants de Maldoror » ?', 'Lautréamont (Isidore Ducasse)']
    ]],
    ['scolaire', 'L\'anglais', [
      ['Que veut dire « hello » ? (Indice : on le dit en décrochant, même en France.)', 'Bonjour'],
      ['Comment dit-on « chat » en anglais… sans miauler ?', 'Cat'],
      ['Que veut dire « I don\'t speak English », la phrase la plus utile en vacances ?', 'Je ne parle pas anglais'],
      ['Que veut dire « yellow » ?', 'Jaune'],
      ['Comment dit-on « mercredi » en anglais ?', 'Wednesday'],
      ['Quel est le prétérit de « to go » ?', 'Went'],
      ['Que veut dire « butterfly » ?', 'Papillon'],
      ['Que veut dire « thimble » ?', 'Dé à coudre'],
      ['Que veut dire « wheelbarrow » ?', 'Brouette'],
      ['Que veut dire « kerfuffle » ?', 'Remue-ménage, agitation']
    ]],
    // ---------------- Sujets ajoutés en 2.92 (à la fin : les identifiants dépendent de la position) ----------------
    ['improbable', 'Les pirates', [
      ['Quel pirate a un crochet à la place de la main et une peur bleue des crocodiles ?', 'Le capitaine Crochet'],
      ['Quel animal bavard se perche sur l\'épaule du pirate de carte postale ?', 'Le perroquet'],
      ['Comment s\'appelle le drapeau à tête de mort, qui n\'annonce jamais une bonne nouvelle ?', 'Le Jolly Roger (ou pavillon noir)'],
      ['Quel pirate Johnny Depp joue-t-il dans « Pirates des Caraïbes » ?', 'Jack Sparrow'],
      ['Qui a écrit « L\'Île au trésor » ?', 'Robert Louis Stevenson'],
      ['Comment s\'appelle le cuisinier à la jambe de bois de « L\'Île au trésor » ?', 'Long John Silver'],
      ['Quelle île au large d\'Haïti était le repaire des flibustiers au XVIIe siècle ?', 'L\'île de la Tortue'],
      ['Quel était le vrai nom de Barbe Noire ?', 'Edward Teach (ou Thatch)'],
      ['Quel corsaire de Dunkerque a été anobli par Louis XIV ?', 'Jean Bart'],
      ['Quelle Anglaise, déguisée en homme, a navigué avec Anne Bonny sur le navire de Calico Jack ?', 'Mary Read']
    ]],
    ['improbable', 'L\'espace', [
      ['Quelle planète porte le même nom qu\'une célèbre barre chocolatée ?', 'Mars'],
      ['Quelle étoile nous réveille tous les matins sans qu\'on lui ait rien demandé ?', 'Le Soleil'],
      ['Quel Américain a été le premier à marcher sur la Lune, sans y trouver de fromage ?', 'Neil Armstrong'],
      ['Quelle planète est célèbre pour ses anneaux ?', 'Saturne'],
      ['Comment s\'appelle notre galaxie ?', 'La Voie lactée'],
      ['Qui a été le premier homme dans l\'espace, en 1961 ?', 'Youri Gagarine'],
      ['Comment s\'appelle le premier satellite artificiel, lancé en 1957 ?', 'Spoutnik 1'],
      ['Quel Français a été le premier spationaute de son pays, en 1982 ?', 'Jean-Loup Chrétien'],
      ['Quelle est la plus grande lune du système solaire ?', 'Ganymède (autour de Jupiter)'],
      ['Comment s\'appelle la frontière conventionnelle de l\'espace, à 100 km d\'altitude ?', 'La ligne de Kármán']
    ]],
    ['improbable', 'Les superstitions', [
      ['Quel animal noir est accusé de porter malheur alors qu\'il voulait juste traverser ?', 'Le chat noir'],
      ['Sous quoi vaut-il mieux ne pas passer, surtout si un peintre est perché dessus ?', 'Une échelle'],
      ['Que faut-il casser pour écoper de sept ans de malheur ?', 'Un miroir'],
      ['Combien de feuilles a le trèfle porte-bonheur ?', 'Quatre'],
      ['Qu\'est-on censé jeter par-dessus son épaule après en avoir renversé ?', 'Du sel'],
      ['Que touche-t-on pour conjurer le mauvais sort ?', 'Du bois'],
      ['Quel aliment ne faut-il pas poser à l\'envers sur la table, selon une vieille superstition ?', 'Le pain'],
      ['Quel animal ne faut-il jamais nommer sur un bateau ?', 'Le lapin'],
      ['Quel mot ne faut-il jamais prononcer dans un théâtre ?', 'Corde'],
      ['Quelle pièce de Shakespeare ne faut-il pas nommer dans un théâtre anglais ?', 'Macbeth']
    ]],
    ['improbable', 'Les abeilles et le miel', [
      ['Quel ours en peluche est prêt à tout pour un pot de miel ?', 'Winnie l\'ourson'],
      ['Qui règne sur la ruche, sans jamais tenir de conseil des ministres ?', 'La reine'],
      ['Comment s\'appelle celui qui élève les abeilles, habillé comme un cosmonaute ?', 'L\'apiculteur'],
      ['Quel liquide sucré les abeilles récoltent-elles dans les fleurs ?', 'Le nectar'],
      ['Comment s\'appelle le mâle de l\'abeille ?', 'Le faux-bourdon'],
      ['Combien de pattes a une abeille ?', 'Six'],
      ['Quelle forme ont les alvéoles d\'une ruche ?', 'Hexagonale'],
      ['Comment s\'appelle la résine récoltée par les abeilles pour colmater la ruche ?', 'La propolis'],
      ['Quel est le nom scientifique du frelon asiatique, arrivé en France vers 2004 ?', 'Vespa velutina'],
      ['Quel savant a décodé la danse des abeilles, ce qui lui a valu un prix Nobel en 1973 ?', 'Karl von Frisch']
    ]],
    ['improbable', 'Les trains', [
      ['Comment s\'appelle la petite locomotive bleue qui parle, dans les émissions pour enfants ?', 'Thomas'],
      ['Quel petit papier fallait-il composter avant de monter dans le train ?', 'Le billet'],
      ['Que veut dire TGV, pour de vrai ?', 'Train à grande vitesse'],
      ['Que veut dire SNCF ?', 'Société nationale des chemins de fer français'],
      ['En quelle année le TGV a-t-il été mis en service entre Paris et Lyon ?', '1981'],
      ['Quel train de luxe reliait Paris à Istanbul ?', 'L\'Orient-Express'],
      ['En quelle année le tunnel sous la Manche a-t-il été inauguré ?', '1994'],
      ['Quel record de vitesse a établi un TGV en 2007 ?', '574,8 km/h'],
      ['Quel est l\'écartement standard des rails ?', '1,435 m'],
      ['Quel ingénieur britannique a construit la locomotive « Rocket », en 1829 ?', 'Robert Stephenson']
    ]],
    ['improbable', 'Les records', [
      ['Quel félin est l\'animal terrestre le plus rapide, et sans baskets ?', 'Le guépard'],
      ['Quelle est la plus haute montagne du monde, où l\'on fait parfois la queue ?', 'L\'Everest'],
      ['Quel est le plus gros animal du monde, qui ne passerait pas sur une balance de salle de bains ?', 'La baleine bleue (ou rorqual bleu)'],
      ['Quel gratte-ciel de Dubaï est le plus haut du monde ?', 'La Burj Khalifa'],
      ['Quel Jamaïcain détient le record du monde du 100 m ?', 'Usain Bolt'],
      ['Quel est le plus grand océan du monde ?', 'Le Pacifique'],
      ['Quel est le record du monde masculin du 100 m ?', '9,58 secondes'],
      ['Quelle Française a vécu 122 ans, un record officiel de longévité ?', 'Jeanne Calment'],
      ['De quelle altitude, environ, Felix Baumgartner a-t-il sauté en 2012 ?', 'Environ 39 km'],
      ['Comment s\'appelle le point le plus profond connu des océans ?', 'Le Challenger Deep (fosse des Mariannes)']
    ]],
    ['improbable', 'Les chats', [
      ['Quel chat orange adore les lasagnes et déteste les lundis ?', 'Garfield'],
      ['Combien de vies a un chat, dit-on en France ?', 'Sept (neuf chez les Anglais)'],
      ['Quel petit bruit de moteur fait un chat content ?', 'Il ronronne'],
      ['Que porte le chat du conte de Perrault ?', 'Des bottes'],
      ['Comment s\'appelle la race de chat sans poils ?', 'Le sphynx'],
      ['Quelle déesse égyptienne avait une tête de chat ?', 'Bastet'],
      ['Quelle grande race de chat vient de l\'État américain du Maine ?', 'Le maine coon'],
      ['Quel physicien a imaginé un chat à la fois vivant et mort ?', 'Erwin Schrödinger'],
      ['Comment s\'appelle la chatte française envoyée dans l\'espace en 1963 ?', 'Félicette'],
      ['Quel est le nom scientifique du chat domestique ?', 'Felis catus']
    ]],
    ['improbable', 'Les marques', [
      ['Quelle marque de sport a pour logo une virgule ?', 'Nike'],
      ['Quelle pâte à tartiner disparaît mystérieusement du placard, cuillère après cuillère ?', 'Le Nutella'],
      ['Quelles briques danoises font hurler quand on marche dessus pieds nus ?', 'Lego'],
      ['Quelle marque suédoise met les couples à l\'épreuve avec une clé Allen ?', 'Ikea'],
      ['De quel pays vient Samsung ?', 'La Corée du Sud'],
      ['Quel animal figure sur le logo de Peugeot ?', 'Le lion'],
      ['Dans quelle ville le Coca-Cola a-t-il été inventé ?', 'Atlanta'],
      ['Que veut dire BMW ?', 'Bayerische Motoren Werke (Manufacture bavaroise de moteurs)'],
      ['D\'où vient le nom Adidas ?', 'De son fondateur, Adi Dassler'],
      ['Comment s\'appelait Google à ses débuts, en 1996 ?', 'BackRub']
    ]],
    ['plaisir', 'Le rock', [
      ['Quels quatre garçons de Liverpool ont fait crier toute une génération ?', 'Les Beatles'],
      ['Qui est le « King », jamais couronné mais adoré à Las Vegas ?', 'Elvis Presley'],
      ['Quel groupe a pour logo une bouche qui tire la langue ?', 'Les Rolling Stones'],
      ['Qui était le chanteur de Queen ?', 'Freddie Mercury'],
      ['Qui était le chanteur de Nirvana ?', 'Kurt Cobain'],
      ['Quel groupe a sorti l\'album « The Dark Side of the Moon » ?', 'Pink Floyd'],
      ['Quel groupe a écrit « Stairway to Heaven » ?', 'Led Zeppelin'],
      ['Quel guitariste de Queen est aussi docteur en astrophysique ?', 'Brian May'],
      ['Quel est le vrai nom de Bono, le chanteur de U2 ?', 'Paul Hewson'],
      ['Quel guitariste joue le solo, non crédité, de « While My Guitar Gently Weeps » des Beatles ?', 'Eric Clapton']
    ]],
    ['plaisir', 'Les super-héros', [
      ['Quel héros en collant rouge et bleu se déplace en lançant des toiles ?', 'Spider-Man'],
      ['Quel milliardaire range sa voiture dans une caverne ?', 'Batman'],
      ['Quel héros porte son slip par-dessus son collant ?', 'Superman'],
      ['Dans quelle ville vit Batman ?', 'Gotham City'],
      ['Quel est le vrai nom d\'Iron Man ?', 'Tony Stark'],
      ['De quelle planète vient Superman ?', 'Krypton'],
      ['En quel métal est fait le bouclier de Captain America ?', 'Le vibranium'],
      ['Quel scénariste de Marvel, célèbre pour ses apparitions dans les films, a cocréé Spider-Man ?', 'Stan Lee'],
      ['En quelle année Superman apparaît-il pour la première fois en bande dessinée ?', '1938'],
      ['Quel dessinateur a créé Spider-Man avec Stan Lee ?', 'Steve Ditko']
    ]],
    ['plaisir', 'La bande dessinée', [
      ['Quel petit Gaulois doit sa force à une potion magique ?', 'Astérix'],
      ['Quel petit chien blanc suit Tintin partout, même dans la Lune ?', 'Milou'],
      ['Quels petits bonshommes bleus habitent dans des champignons ?', 'Les Schtroumpfs'],
      ['Qui a créé Tintin ?', 'Hergé'],
      ['Quel cow-boy tire plus vite que son ombre ?', 'Lucky Luke'],
      ['Qui a écrit les premiers scénarios d\'Astérix ?', 'René Goscinny'],
      ['Quel est le vrai nom d\'Hergé ?', 'Georges Remi'],
      ['Quel auteur a créé Gaston Lagaffe ?', 'André Franquin'],
      ['Dans quel journal belge Tintin paraît-il pour la première fois, en 1929 ?', 'Le Petit Vingtième'],
      ['Comment s\'appelle l\'ancêtre du capitaine Haddock, dans « Le Secret de La Licorne » ?', 'Le chevalier François de Hadoque']
    ]],
    ['plaisir', 'Star Wars', [
      ['Quel méchant à casque noir annonce à Luke qu\'il est son père ?', 'Dark Vador'],
      ['Quel robot doré parle tout le temps et s\'inquiète de tout ?', 'C-3PO'],
      ['Quel petit maître vert met les mots à l\'envers dans ses phrases ?', 'Yoda'],
      ['Quelle arme lumineuse utilisent les Jedi ?', 'Le sabre laser'],
      ['Qui a créé Star Wars ?', 'George Lucas'],
      ['En quelle année le premier film est-il sorti ?', '1977'],
      ['Sur quelle planète désertique Luke a-t-il grandi ?', 'Tatooine'],
      ['Quel compositeur a écrit la musique de la saga ?', 'John Williams'],
      ['Quel acteur prête sa voix originale à Dark Vador ?', 'James Earl Jones'],
      ['Quel acteur britannique portait le costume de Dark Vador dans la première trilogie ?', 'David Prowse']
    ]],
    ['plaisir', 'Le tennis', [
      ['Sur quelle surface joue-t-on à Roland-Garros, au grand désespoir des chaussettes blanches ?', 'La terre battue'],
      ['Combien de joueurs y a-t-il sur le court pour un match de simple ?', 'Deux'],
      ['Comment s\'appelle la personne assise sur une grande chaise au bord du court ?', 'L\'arbitre'],
      ['De quel pays vient Rafael Nadal ?', 'L\'Espagne'],
      ['Quel tournoi impose une tenue blanche à ses joueurs ?', 'Wimbledon'],
      ['Combien y a-t-il de tournois du Grand Chelem ?', 'Quatre'],
      ['Quel est le dernier Français à avoir gagné Roland-Garros en simple messieurs ?', 'Yannick Noah (1983)'],
      ['Citez deux des quatre « Mousquetaires » du tennis français.', 'Lacoste, Borotra, Cochet, Brugnon'],
      ['Quelle est la dernière Française à avoir gagné Roland-Garros en simple dames ?', 'Mary Pierce (2000)'],
      ['Quel joueur a réussi le Grand Chelem sur une année en 1969 ?', 'Rod Laver']
    ]],
    ['plaisir', 'Le Tour de France', [
      ['De quelle couleur est le maillot du leader, aussi visible qu\'un poussin ?', 'Jaune'],
      ['Quel motif orne le maillot du meilleur grimpeur ?', 'Des pois (rouges)'],
      ['Sur quelle célèbre avenue parisienne le Tour se termine-t-il d\'habitude ?', 'Les Champs-Élysées'],
      ['Quelle couleur de maillot récompense le classement par points ?', 'Vert'],
      ['Quel sommet de Provence est surnommé le « Géant » ?', 'Le mont Ventoux'],
      ['Quel est le dernier Français à avoir gagné le Tour ?', 'Bernard Hinault (1985)'],
      ['En quelle année a eu lieu le premier Tour de France ?', '1903'],
      ['Qui a gagné le premier Tour de France ?', 'Maurice Garin'],
      ['Citez les quatre coureurs qui ont gagné cinq Tours.', 'Anquetil, Merckx, Hinault, Indurain'],
      ['Avec combien de secondes d\'écart Greg LeMond a-t-il battu Laurent Fignon en 1989 ?', '8 secondes']
    ]],
    ['plaisir', 'Les jeux de société', [
      ['Quel jeu de plateau ruine les amitiés à coups de loyers rue de la Paix ?', 'Le Monopoly'],
      ['Quels petits cubes lance-t-on pour avancer ?', 'Les dés'],
      ['Quel jeu de lettres provoque des disputes sur l\'existence du mot « kwa » ?', 'Le Scrabble'],
      ['Combien de pièces a chaque joueur aux échecs ?', '16'],
      ['Dans quel jeu cherche-t-on qui a tué, avec quelle arme et dans quelle pièce ?', 'Le Cluedo'],
      ['Quelle est la case la plus chère du Monopoly français ?', 'La rue de la Paix'],
      ['Combien de cases compte un échiquier ?', '64'],
      ['Quel champion a perdu en 1997 contre l\'ordinateur Deep Blue ?', 'Garry Kasparov'],
      ['Quel Allemand a créé « Les Colons de Catane » ?', 'Klaus Teuber'],
      ['Combien d\'intersections compte un plateau de go classique ?', '361 (19 × 19)']
    ]],
    ['plaisir', 'Harry Potter', [
      ['Quelle forme a la cicatrice de Harry, sans doute très pratique pour se faire reconnaître ?', 'Un éclair'],
      ['Comment s\'appelle l\'école de sorciers ?', 'Poudlard'],
      ['Quel méchant n\'a plus de nez et préfère qu\'on évite de dire son nom ?', 'Voldemort'],
      ['Qui a écrit la saga ?', 'J.K. Rowling'],
      ['Dans quelle maison est Harry ?', 'Gryffondor'],
      ['Comment s\'appelle la chouette de Harry ?', 'Hedwige'],
      ['De quelle voie part le train pour l\'école, à la gare de King\'s Cross ?', 'La voie 9 ¾'],
      ['Quel est le vrai nom de Voldemort en français ?', 'Tom Elvis Jedusor'],
      ['En quel bois est la baguette de Harry, et que contient-elle ?', 'En houx, avec une plume de phénix'],
      ['Qui a traduit la saga en français ?', 'Jean-François Ménard']
    ]],
    ['mature', 'Le café', [
      ['Quelle boisson empêche beaucoup de gens de mordre leurs collègues le lundi matin ?', 'Le café'],
      ['Quel café italien est coiffé d\'une mousse de lait ?', 'Le cappuccino'],
      ['Comment appelle-t-on un expresso qu\'on a noyé dans de l\'eau chaude ?', 'Un café américain (ou allongé)'],
      ['Quel pays est le premier producteur mondial de café ?', 'Le Brésil'],
      ['Quelles sont les deux grandes espèces de café ?', 'L\'arabica et le robusta'],
      ['Quelle substance du café nous tient éveillés ?', 'La caféine'],
      ['De quel pays africain le café serait-il originaire ?', 'L\'Éthiopie'],
      ['Quel est le plus ancien café de Paris encore ouvert ?', 'Le Procope'],
      ['Quel café d\'Indonésie est récolté dans les excréments de la civette ?', 'Le kopi luwak'],
      ['Quel Italien a breveté la première machine à expresso, en 1884 ?', 'Angelo Moriondo']
    ]],
    ['mature', 'La bière', [
      ['Quel papa jaune de Springfield ne jure que par sa Duff ?', 'Homer Simpson'],
      ['Quelle grande fête de la bière a lieu chaque année à Munich ?', 'L\'Oktoberfest'],
      ['Quelle céréale sert le plus souvent à faire la bière ?', 'L\'orge'],
      ['Quelle plante donne son amertume à la bière ?', 'Le houblon'],
      ['Que veut dire IPA ?', 'India Pale Ale'],
      ['Comment s\'appelle la bière brassée dans certaines abbayes de moines ?', 'La trappiste'],
      ['Quel micro-organisme transforme le sucre en alcool ?', 'La levure'],
      ['Comment s\'appelle la loi allemande de pureté de la bière de 1516 ?', 'Le Reinheitsgebot'],
      ['Quelle bière belge est obtenue par fermentation spontanée ?', 'Le lambic'],
      ['Quelle bière trappiste belge est surtout vendue à la porte de son abbaye ?', 'La Westvleteren']
    ]],
    ['mature', 'Le jardinage', [
      ['Quel petit personnage à bonnet rouge surveille les pelouses sans jamais les tondre ?', 'Le nain de jardin'],
      ['Quel objet permet d\'arroser les plantes tout en se trempant les pieds ?', 'L\'arrosoir'],
      ['Quelle bête baveuse dévore vos salades pendant la nuit ?', 'La limace'],
      ['Comment s\'appelle le tas où l\'on transforme les déchets de cuisine en engrais ?', 'Le compost'],
      ['Quel insecte à points noirs mange les pucerons ?', 'La coccinelle'],
      ['À quelle saison plante-t-on les bulbes de tulipes ?', 'L\'automne'],
      ['Comment appelle-t-on une plante qui fait tout son cycle en un an ?', 'Une plante annuelle'],
      ['De quoi est faite la bouillie bordelaise ?', 'De sulfate de cuivre et de chaux'],
      ['Comment s\'appellent les trois saints de glace ?', 'Mamert, Pancrace et Servais'],
      ['Comment appelle-t-on l\'association entre un champignon et les racines d\'une plante ?', 'Une mycorhize']
    ]],
    ['mature', 'Les voyages', [
      ['Qu\'envoie-t-on à ses proches pour montrer qu\'on s\'amuse mieux qu\'eux ?', 'Une carte postale'],
      ['Quel bagage à roulettes réveille tout un quartier sur les pavés à 6 heures du matin ?', 'La valise'],
      ['Quel document oublie-t-on sur la commode juste avant un vol international ?', 'Le passeport'],
      ['Quels sont les deux grands aéroports de Paris ?', 'Roissy-Charles-de-Gaulle et Orly'],
      ['Quel est le pays le plus visité au monde ?', 'La France'],
      ['Quelle contenance maximale peut avoir un flacon de liquide en cabine ?', '100 ml'],
      ['Quel est le code de l\'aéroport de Roissy ?', 'CDG'],
      ['Que veut dire ESTA, l\'autorisation pour les États-Unis ?', 'Electronic System for Travel Authorization'],
      ['Combien de mètres vaut un mille nautique ?', '1 852 mètres'],
      ['Quel Belge a fondé le Club Méditerranée, en 1950 ?', 'Gérard Blitz']
    ]],
    ['mature', 'L\'immobilier', [
      ['Qui vous dit « c\'est très lumineux » dans un sous-sol ?', 'L\'agent immobilier'],
      ['Comment s\'appelle la somme que le locataire verse tous les mois ?', 'Le loyer'],
      ['Dans une annonce, que veut souvent dire « à rafraîchir » ?', 'Qu\'il y a beaucoup de travaux à faire'],
      ['Qui signe et authentifie l\'acte de vente ?', 'Le notaire'],
      ['Quelle est la meilleure lettre sur un DPE ?', 'A'],
      ['Combien de mois de loyer peut atteindre le dépôt de garantie pour une location vide ?', 'Un mois, hors charges'],
      ['Quelle est la durée d\'un bail de location vide signé avec un particulier ?', 'Trois ans'],
      ['Quelles sont les dates de la trêve hivernale des expulsions ?', 'Du 1er novembre au 31 mars'],
      ['De combien de jours dispose l\'acheteur pour se rétracter après la signature d\'un compromis ?', '10 jours'],
      ['Quelle loi de 2014 a instauré l\'encadrement des loyers ?', 'La loi ALUR']
    ]],
    ['mature', 'La santé au quotidien', [
      ['Que met-on sur un bobo, surtout pour faire plaisir aux enfants ?', 'Un pansement'],
      ['Quel nombre le médecin demande-t-il de dire en auscultant ?', '33'],
      ['Quelle est la température normale du corps, à peu près ?', '37 °C'],
      ['Quel est le numéro du SAMU ?', 'Le 15'],
      ['Quel est le numéro d\'appel d\'urgence européen ?', 'Le 112'],
      ['Quelle vitamine fabrique-t-on grâce au soleil ?', 'La vitamine D'],
      ['En quelle unité mesure-t-on la tension artérielle, en France, au quotidien ?', 'En centimètres de mercure (13/8 par exemple)'],
      ['Comment calcule-t-on l\'indice de masse corporelle ?', 'Poids en kg divisé par la taille en mètres au carré'],
      ['Quelle moyenne l\'hémoglobine glyquée (HbA1c) mesure-t-elle ?', 'La glycémie moyenne des 2 à 3 derniers mois'],
      ['Quel chimiste de Bayer a mis au point l\'aspirine, en 1897 ?', 'Felix Hoffmann']
    ]],
    ['mature', 'Les institutions françaises', [
      ['Dans quel palais le président français a-t-il son bureau ?', 'L\'Élysée'],
      ['Qui s\'installe à Matignon ?', 'Le Premier ministre'],
      ['Quelle écharpe le maire porte-t-il pour les grandes occasions ?', 'Une écharpe tricolore'],
      ['Combien d\'années dure le mandat présidentiel ?', 'Cinq ans'],
      ['Dans quelle assemblée siègent les députés ?', 'L\'Assemblée nationale'],
      ['Combien y a-t-il de députés ?', '577'],
      ['Combien y a-t-il de sénateurs ?', '348'],
      ['Quel article de la Constitution permet de faire adopter un texte sans vote ?', 'L\'article 49.3 (49, alinéa 3)'],
      ['Quel président de la Ve République est mort en fonction, en 1974 ?', 'Georges Pompidou'],
      ['Qui fut le premier président de la IIIe République ?', 'Adolphe Thiers']
    ]],
    ['mature', 'La cuisine maison', [
      ['Quel légume fait pleurer tout le monde dès qu\'on sort le couteau ?', 'L\'oignon'],
      ['Quel ustensile sert à retourner une crêpe si on n\'ose pas la faire sauter ?', 'La spatule'],
      ['Combien de minutes environ faut-il pour un œuf à la coque ?', '3 minutes'],
      ['Quelle farine et quelle matière grasse forment la base d\'un roux ?', 'De la farine et du beurre'],
      ['Quelle sauce blanche contient du beurre, de la farine et du lait ?', 'La béchamel'],
      ['Que veut dire « blanchir » un légume ?', 'Le plonger brièvement dans l\'eau bouillante'],
      ['Quel genre de mélange est une mayonnaise ?', 'Une émulsion'],
      ['Comment s\'appelle la réaction qui fait dorer et brunir la viande à la cuisson ?', 'La réaction de Maillard'],
      ['Pour quelle cantatrice Escoffier a-t-il créé un célèbre dessert aux pêches ?', 'Nellie Melba (la pêche Melba)'],
      ['Citez les cinq sauces mères de la cuisine française, selon Escoffier.', 'Béchamel, velouté, espagnole, hollandaise, tomate']
    ]],
    ['scolaire', 'La mythologie grecque', [
      ['Quel roi des dieux règle ses problèmes à coups de foudre ?', 'Zeus'],
      ['Quel dieu de la mer se promène avec un trident ?', 'Poséidon'],
      ['Quel héros invincible a été trahi par son talon ?', 'Achille'],
      ['Combien de travaux a accomplis Héraclès ?', 'Douze'],
      ['Quelle est la déesse de l\'amour ?', 'Aphrodite'],
      ['Qui a eu l\'idée du cheval de Troie ?', 'Ulysse'],
      ['Quel fleuve fallait-il traverser pour atteindre les Enfers ?', 'Le Styx'],
      ['Qui est l\'épouse d\'Hadès ?', 'Perséphone'],
      ['Comment s\'appelle le passeur des Enfers ?', 'Charon'],
      ['Quelle titanide est la mère de Zeus ?', 'Rhéa']
    ]],
    ['scolaire', 'La Rome antique', [
      ['Quel général romain a dit « je suis venu, j\'ai vu, j\'ai vaincu », et pas seulement pour une salade ?', 'Jules César'],
      ['Dans quel monument les gladiateurs se battaient-ils ?', 'Le Colisée'],
      ['Quels jumeaux auraient été allaités par une louve ?', 'Romulus et Rémus'],
      ['Quel empereur aurait joué de la lyre pendant l\'incendie de Rome ?', 'Néron'],
      ['Quelle langue parlait-on à Rome ?', 'Le latin'],
      ['Qui fut le premier empereur romain ?', 'Auguste'],
      ['En quelle année Rome aurait-elle été fondée ?', '753 av. J.-C.'],
      ['À quelle date César a-t-il été assassiné ?', 'Aux ides de mars, le 15 mars 44 av. J.-C.'],
      ['Quel empereur aurait voulu nommer son cheval consul ?', 'Caligula'],
      ['Qui fut le dernier empereur romain d\'Occident, déposé en 476 ?', 'Romulus Augustule']
    ]],
    ['scolaire', 'La Seconde Guerre mondiale', [
      ['Qui a lancé l\'appel du 18 juin 1940 depuis Londres ?', 'Le général de Gaulle'],
      ['Comment appelle-t-on l\'arrivée des Alliés sur les plages, le jour J ?', 'Le Débarquement'],
      ['Dans quelle région française ont-ils débarqué ?', 'La Normandie'],
      ['En quelle année la guerre a-t-elle commencé en Europe ?', '1939'],
      ['En quelle année s\'est-elle terminée ?', '1945'],
      ['Sur quelles villes japonaises les bombes atomiques ont-elles été larguées ?', 'Hiroshima et Nagasaki'],
      ['Quel était le nom de code du débarquement en Normandie ?', 'Overlord'],
      ['Qui a unifié la Résistance intérieure française pour de Gaulle ?', 'Jean Moulin'],
      ['Citez les cinq plages du Débarquement.', 'Utah, Omaha, Gold, Juno et Sword'],
      ['Quel général allemand n\'a pas exécuté l\'ordre de détruire Paris en 1944 ?', 'Dietrich von Choltitz']
    ]],
    ['scolaire', 'La peinture', [
      ['Qui a peint la Joconde, sans jamais lui demander de vraiment sourire ?', 'Léonard de Vinci'],
      ['Dans quel musée parisien fait-on la queue pour la voir ?', 'Le Louvre'],
      ['Quel peintre s\'est coupé une partie de l\'oreille ?', 'Vincent van Gogh'],
      ['Qui a peint « Guernica » ?', 'Pablo Picasso'],
      ['Qui a peint les « Nymphéas » ?', 'Claude Monet'],
      ['Qui a peint « Le Cri » ?', 'Edvard Munch'],
      ['Qui a peint le plafond de la chapelle Sixtine ?', 'Michel-Ange'],
      ['Qui a peint « Le Radeau de la Méduse » ?', 'Théodore Géricault'],
      ['Qui a peint « Les Ménines » ?', 'Diego Velázquez'],
      ['Qui a volé la Joconde au Louvre, en 1911 ?', 'Vincenzo Peruggia']
    ]],
    ['scolaire', 'La musique classique', [
      ['Quel grand compositeur a continué d\'écrire de la musique après être devenu sourd ?', 'Ludwig van Beethoven'],
      ['Quel instrument a des touches noires et blanches ?', 'Le piano'],
      ['Quel petit bâton le chef d\'orchestre agite-t-il ?', 'La baguette'],
      ['Qui a composé « Les Quatre Saisons » ?', 'Antonio Vivaldi'],
      ['Qui a composé « La Flûte enchantée » ?', 'Wolfgang Amadeus Mozart'],
      ['Qui a composé le « Boléro » ?', 'Maurice Ravel'],
      ['Combien de symphonies Beethoven a-t-il écrites ?', 'Neuf'],
      ['Qui a composé « Pierre et le Loup » ?', 'Sergueï Prokofiev'],
      ['Quel élève a achevé le « Requiem » de Mozart ?', 'Franz Xaver Süssmayr'],
      ['Quel chef a dirigé la création du « Sacre du printemps », en 1913 ?', 'Pierre Monteux']
    ]],
    ['scolaire', 'Les drapeaux', [
      ['Quel pays a une feuille d\'érable sur son drapeau ?', 'Le Canada'],
      ['Quelles sont les trois couleurs du drapeau français ?', 'Bleu, blanc, rouge'],
      ['Quel pays a un simple rond rouge sur fond blanc ?', 'Le Japon'],
      ['Combien d\'étoiles compte le drapeau américain ?', '50'],
      ['Quel pays d\'Europe a un drapeau carré à croix blanche ?', 'La Suisse'],
      ['Quel pays a un drapeau qui n\'est ni carré ni rectangulaire ?', 'Le Népal'],
      ['Combien de bandes compte le drapeau américain ?', '13'],
      ['Quel animal, qui dévore un serpent, figure sur le drapeau du Mexique ?', 'Un aigle'],
      ['Quel monument figure sur le drapeau du Cambodge ?', 'Angkor Vat'],
      ['Quel pays a le plus ancien drapeau national encore en usage ?', 'Le Danemark (le Dannebrog)']
    ]],
    ['scolaire', 'La philosophie', [
      ['Quel philosophe français a dit « Je pense, donc je suis » ?', 'René Descartes'],
      ['Quel philosophe grec vivait dans un tonneau, sans payer de loyer ?', 'Diogène'],
      ['Que veut dire le mot « philosophie » ?', 'L\'amour de la sagesse'],
      ['Quel philosophe grec fut l\'élève de Socrate ?', 'Platon'],
      ['Quel philosophe grec fut l\'élève de Platon ?', 'Aristote'],
      ['Quel Français a incarné l\'existentialisme avec « L\'Être et le Néant » ?', 'Jean-Paul Sartre'],
      ['Qui a écrit « Ainsi parlait Zarathoustra » ?', 'Friedrich Nietzsche'],
      ['Qui a écrit la « Critique de la raison pure » ?', 'Emmanuel Kant'],
      ['Qui a écrit « Léviathan » ?', 'Thomas Hobbes'],
      ['Qui a écrit « Être et Temps » ?', 'Martin Heidegger']
    ]],
    ['scolaire', 'Fleuves et montagnes', [
      ['Quel fleuve traverse Paris, où il vaut mieux ne pas trop boire la tasse ?', 'La Seine'],
      ['Quel est le plus haut sommet des Alpes, qui ne rend pas la neige à la fin de l\'été ?', 'Le mont Blanc'],
      ['Quel fleuve traverse l\'Égypte ?', 'Le Nil'],
      ['Quel est le plus long fleuve de France ?', 'La Loire'],
      ['Quelle chaîne de montagnes sépare la France de l\'Espagne ?', 'Les Pyrénées'],
      ['Quel fleuve traverse la grande forêt d\'Amérique du Sud ?', 'L\'Amazone'],
      ['Quel est le plus haut sommet d\'Afrique ?', 'Le Kilimandjaro'],
      ['Sur quel plateau la Seine prend-elle sa source ?', 'Le plateau de Langres'],
      ['Quel est le plus haut sommet d\'Amérique du Sud ?', 'L\'Aconcagua'],
      ['Quel fleuve traverse le plus de pays au monde ?', 'Le Danube (dix pays)']
    ]]
  ].map(function (s, i) { return { id: s[0] + '-' + i, theme: s[0], nom: s[1], q: s[2] }; });

  // Challenges : épreuves originales, jugées par l'équipe qui lit. gain = cases gagnées si réussi
  // Challenge : on cite des choses, ou une série de vrai ou faux ; on avance d'autant de cases que de bonnes réponses (max au plus)
  var CHALLENGES = [
    { titre: 'Citez !', texte: 'Citez des pays d\'Afrique.', max: 6 },
    { titre: 'Citez !', texte: 'Citez des fruits rouges.', max: 6 },
    { titre: 'Citez !', texte: 'Citez des planètes du système solaire.', max: 6, reponse: 'Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune' },
    { titre: 'Citez !', texte: 'Citez des capitales européennes.', max: 6 },
    { titre: 'Citez !', texte: 'Citez des départements français avec leur numéro.', max: 6 },
    { titre: 'Citez !', texte: 'Citez des instruments à cordes.', max: 6 },
    { titre: 'Citez !', texte: 'Citez des longs métrages d\'animation Disney.', max: 6 },
    { titre: 'Citez !', texte: 'Citez des fromages français.', max: 6 },
    { titre: 'Citez !', texte: 'Citez des présidents de la Ve République.', max: 6, reponse: 'De Gaulle, Pompidou, Giscard d\'Estaing, Mitterrand, Chirac, Sarkozy, Hollande, Macron' },
    { titre: 'Citez !', texte: 'Citez des personnages d\'Astérix.', max: 6 },
    { titre: 'Citez !', texte: 'Citez des sports qui se jouent avec un ballon.', max: 6 },
    { titre: 'Citez !', texte: 'Citez les nains de Blanche-Neige.', max: 7, reponse: 'Prof, Grincheux, Joyeux, Timide, Atchoum, Dormeur, Simplet' },
    { titre: 'Citez !', texte: 'Citez les couleurs de l\'arc-en-ciel.', max: 7, reponse: 'Rouge, orange, jaune, vert, bleu, indigo, violet' },
    { titre: 'Citez !', texte: 'Citez les pièces du jeu d\'échecs.', max: 6, reponse: 'Roi, dame, tour, fou, cavalier, pion' },
    { titre: 'Citez !', texte: 'Citez des fleuves français.', max: 5, reponse: 'Par exemple : Seine, Loire, Garonne, Rhône, Charente, Adour, Somme' },
    { titre: 'Citez !', texte: 'Citez des mots qui riment avec « chapeau ».', max: 6 },
    { titre: 'Citez !', texte: 'Citez les membres des Beatles.', max: 4, reponse: 'John Lennon, Paul McCartney, George Harrison, Ringo Starr' },
    { titre: 'Citez !', texte: 'Citez des signes du zodiaque.', max: 6, reponse: 'Bélier, Taureau, Gémeaux, Cancer, Lion, Vierge, Balance, Scorpion, Sagittaire, Capricorne, Verseau, Poissons' },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['On voit la Grande Muraille de Chine depuis la Lune, à l\'œil nu.', false],
      ['La tour Eiffel est un peu plus haute en été qu\'en hiver.', true],
      ['La foudre ne frappe jamais deux fois au même endroit.', false],
      ['Pour les botanistes, la banane est une baie.', true],
      ['L\'autruche enfouit sa tête dans le sable quand elle a peur.', false]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['La pieuvre a trois cœurs.', true],
      ['Le poisson rouge a une mémoire de trois secondes.', false],
      ['Les chauves-souris sont aveugles.', false],
      ['Le dauphin est un mammifère.', true],
      ['Le koala est un ours.', false]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['Napoléon était particulièrement petit pour son époque.', false],
      ['Les Vikings portaient des casques à cornes au combat.', false],
      ['Cléopâtre a vécu plus près de nous que de la construction de la grande pyramide de Gizeh.', true],
      ['La guerre de Cent Ans a duré exactement cent ans.', false],
      ['Louis XIV a régné plus de 70 ans.', true]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['On n\'utilise que 10 % de son cerveau.', false],
      ['Les ongles continuent de pousser après la mort.', false],
      ['Le squelette d\'un adulte compte 206 os.', true],
      ['Le cœur humain a quatre cavités.', true],
      ['Le sang pauvre en oxygène est bleu dans le corps.', false]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['Sydney est la capitale de l\'Australie.', false],
      ['La Russie s\'étend sur plus de dix fuseaux horaires.', true],
      ['Le Sahara est le plus grand désert du monde, déserts froids compris.', false],
      ['Istanbul est à cheval sur deux continents.', true],
      ['La France a une frontière avec le Brésil.', true]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['Le son se propage dans le vide.', false],
      ['L\'eau bout à plus basse température en altitude.', true],
      ['Le diamant est composé de carbone.', true],
      ['La face cachée de la Lune n\'est jamais éclairée par le Soleil.', false],
      ['Les saisons viennent de la distance entre la Terre et le Soleil.', false]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['Dans la version originale, Dark Vador dit exactement « Luke, je suis ton père ».', false],
      ['« Titanic » a remporté 11 Oscars.', true],
      ['Mickey apparaît pour la première fois au public en 1928.', true],
      ['Sherlock Holmes dit « Élémentaire, mon cher Watson » dans les romans de Conan Doyle.', false],
      ['Dans le roman de Mary Shelley, Frankenstein est le nom du monstre.', false]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['La tomate est un fruit pour les botanistes.', true],
      ['Un miel bien conservé peut se garder des siècles.', true],
      ['La cacahuète est une noix, au sens botanique.', false],
      ['L\'eau est ce qui calme le mieux la brûlure du piment.', false],
      ['Le chocolat blanc contient du beurre de cacao.', true]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['Le mot « oiseau » contient les cinq voyelles a, e, i, o, u.', true],
      ['Le pluriel de « bal » est « baux ».', false],
      ['« Après que » se construit avec l\'indicatif.', true],
      ['Le mot « autoroute » est masculin.', false],
      ['Le mot « squelette » est masculin.', true]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['Un marathon mesure 42,195 km.', true],
      ['Un match de football dure 90 minutes en temps réglementaire.', true],
      ['Les premiers Jeux olympiques modernes ont eu lieu à Paris.', false],
      ['Au tennis, on compte 15, 30, 45.', false],
      ['Au rugby, un essai vaut 5 points.', true]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['Vénus est plus chaude que Mercure.', true],
      ['Sur Vénus, un jour est plus long qu\'une année.', true],
      ['Le Soleil est une étoile.', true],
      ['Pluton est toujours officiellement une planète.', false],
      ['Neil Armstrong a marché sur la Lune avec la mission Apollo 13.', false]
    ] },
    { titre: 'Vrai ou faux', texte: 'Cinq affirmations, vrai ou faux ?', max: 5, vf: [
      ['Marseille est la deuxième ville de France par sa population.', true],
      ['« La Marseillaise » a été écrite à Marseille.', false],
      ['Le Louvre a d\'abord été un palais royal.', true],
      ['La tour Eiffel a été construite pour l\'Exposition universelle de 1889.', true],
      ['Le mont Blanc est le plus haut sommet d\'Europe occidentale.', true]
    ] }
  ];

  // « Superbe ! » (bonus) et « Aïe ! » (malus) : appliqués tout seuls par l'appli
  //   avancer / reculer : n cases ; rejouer ; passer : passe son prochain tour ; rattraper : rejoint l'équipe juste devant ;
  //   echangerDernier : échange sa place avec l'équipe la plus en retard ; reculerAutre : l'équipe choisie recule de n
  // Toute carte déplace le pion de l'équipe : elle ne peut pas rester sur la case (elle retirerait une carte au tour suivant)
  var SURPRISES = [
    { bon: true, texte: 'Superbe ! Avancez de 3 cases.', effet: 'avancer', n: 3 },
    { bon: true, texte: 'Superbe ! Avancez de 2 cases.', effet: 'avancer', n: 2 },
    { bon: true, texte: 'Superbe ! Avancez d\'une case et rejouez tout de suite.', effet: 'rejouer', n: 1 },
    { bon: true, texte: 'Superbe ! Rejoignez l\'équipe juste devant vous (si vous êtes en tête : avancez de 2).', effet: 'rattraper', n: 2 },
    { bon: true, texte: 'Superbe ! Avancez d\'une case et choisissez une équipe : elle recule de 2 cases.', effet: 'reculerAutre', n: 2, moi: 1 },
    { bon: true, texte: 'Superbe ! Avancez de 4 cases.', effet: 'avancer', n: 4 },
    { bon: false, texte: 'Aïe ! Reculez de 2 cases.', effet: 'reculer', n: 2 },
    { bon: false, texte: 'Aïe ! Reculez de 3 cases.', effet: 'reculer', n: 3 },
    { bon: false, texte: 'Aïe ! Reculez d\'une case et passez votre prochain tour.', effet: 'passer', n: 1 },
    { bon: false, texte: 'Aïe ! Échangez votre place avec l\'équipe la plus en retard (si c\'est vous : reculez de 2).', effet: 'echangerDernier', n: 2 },
    { bon: false, texte: 'Aïe ! Reculez d\'une case… et parlez en chantant jusqu\'à votre prochain tour.', effet: 'reculer', n: 1 },
    { bon: false, texte: 'Aïe ! Reculez d\'une case. Vous avez eu peur pour rien.', effet: 'reculer', n: 1 }
  ];

  // Qui commence ? Un critère amusant, l'équipe qui le remplit commence
  var DEPARTS = [
    'L\'équipe dont un joueur a l\'anniversaire le plus proche commence.',
    'L\'équipe dont un joueur a le plus de frères et sœurs commence.',
    'L\'équipe dont un joueur est allé le plus loin en vacances commence.',
    'L\'équipe dont un joueur a les cheveux les plus longs commence.',
    'L\'équipe dont un joueur s\'est levé le plus tôt ce matin commence.',
    'L\'équipe dont un joueur porte le plus de couleurs commence.',
    'L\'équipe dont un joueur a mangé du fromage le plus récemment commence.',
    'L\'équipe dont un joueur est le plus grand commence.',
    'L\'équipe dont un joueur a le prénom le plus long commence.',
    'L\'équipe dont un joueur a vu un film au cinéma le plus récemment commence.',
    'L\'équipe dont un joueur habite le plus près d\'ici commence.',
    'L\'équipe qui imite le mieux une poule (jugée par les autres) commence.'
  ];

  // Plateau : une case Départ, puis un motif de cases qui se répète, et l'Arrivée
  var MOTIF = ['plaisir', 'scolaire', 'mature', 'improbable', 'challenge', 'plaisir', 'scolaire', 'surprise', 'mature', 'improbable'];
  var LONGUEURS = { court: 30, normal: 40, long: 50 };
  function plateau(n) {
    var l = ['depart'];
    for (var i = 1; i < n; i++) l.push(MOTIF[(i - 1) % MOTIF.length]);
    l.push('arrivee');
    return l;
  }
  var NIVEAU_FINAL = 7;   // question de la case Arrivée : niveau 7 d'un sujet tiré au hasard

  function melanger(t, h) { h = h || Math.random; t = t.slice(); for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(h() * (i + 1)), x = t[i]; t[i] = t[j]; t[j] = x; } return t; }
  // Un sujet du thème, pas encore vu si possible (vus : identifiants déjà tirés, les plus récents à la fin)
  function tirerSujet(theme, vus, h) {
    h = h || Math.random;
    var l = SUJETS.filter(s => !theme || s.theme === theme);
    var neufs = l.filter(s => (vus || []).indexOf(s.id) === -1);
    if (!neufs.length) {   // tout a été vu : le plus anciennement vu d'abord
      var ordre = l.slice().sort((a, b) => vus.indexOf(a.id) - vus.indexOf(b.id));
      neufs = ordre.slice(0, Math.max(1, Math.ceil(l.length / 3)));
    }
    return neufs[Math.floor(h() * neufs.length)];
  }
  function tirer(liste, h) { h = h || Math.random; return Math.floor(h() * liste.length); }
  // Un challenge pas encore sorti dans cette partie (e.chVus), et on recommence quand ils sont tous passés
  function tirerChallenge(e, h) {
    var vus = e.chVus || [], l = CHALLENGES.map((c, i) => i).filter(i => vus.indexOf(i) === -1);
    if (!l.length) { l = CHALLENGES.map((c, i) => i); vus = []; }
    var k = l[tirer(l, h)];
    e.chVus = vus.concat([k]);
    return k;
  }
  function sujet(id) { return SUJETS.find(s => s.id === id) || null; }

  // ================== LA PARTIE (même moteur sur un seul téléphone et chez l'hôte d'un salon) ==================
  // e = { id, cases, equipes: [{ nom, couleur, pos, joues, passe }], tour, phase, depart, carte, journal, derniere, chrono, gagnant, n }
  // phase : 'depart' (qui commence ?), 'theme' (tirer la carte), 'mise' (1 à 10), 'question', 'reponse' (réponse montrée, un seul téléphone),
  //         'challenge', 'surprise', 'fin'
  function nouvellePartie(equipes, nbCases, h) {
    return { id: Date.now().toString(36) + Math.floor((h || Math.random)() * 1e4).toString(36), cases: plateau(nbCases || 40),
             equipes: equipes.map(q => Object.assign({ pos: 0, joues: 0, passe: false }, q)), tour: 0,
             phase: 'depart', depart: tirer(DEPARTS, h), carte: null, journal: '', derniere: null, chrono: null, gagnant: -1, n: 0 };
  }
  // L'équipe qui lit la carte : celle qui précède l'équipe qui joue (demandé par l'utilisateur)
  function lecteur(e) { var n = e.equipes.length; return (e.tour - 1 + n) % n; }
  // Thème du tour : la case du pion (Improbable au premier tour de chaque équipe)
  function themeTour(e) {
    var q = e.equipes[e.tour], c = e.cases[q.pos];
    if (c === 'arrivee') return 'arrivee';
    return !q.joues || c === 'depart' ? 'improbable' : c;
  }
  function question(e) { var s = e.carte && sujet(e.carte.sujet); return s && e.carte.niveau ? s.q[e.carte.niveau - 1] : null; }
  // Qui peut faire quoi : 'lecteur' (tirer, autre sujet, chrono, voir la réponse, juger), 'joue' (miser, choisir la cible), 'tous'
  var QUI = { commencer: 'tous', tirer: 'lecteur', autre: 'les2', chrono: 'lecteur', voir: 'lecteur', juger: 'lecteur', challenge: 'lecteur',
              miser: 'joue', surprise: 'les2', nouvelle: 'tous' };

  function deplacer(e, i, n) { var q = e.equipes[i]; q.pos = Math.max(0, Math.min(e.cases.length - 1, q.pos + n)); }
  function cases(n) { return n + (Math.abs(n) > 1 ? ' cases' : ' case'); }
  // Équipe suivante (meme : elle rejoue) ; une équipe qui doit passer son tour est sautée
  function suivant(e, meme) {
    e.equipes[e.tour].joues++;
    e.carte = null; e.chrono = null;
    if (!meme) {
      for (var k = 0; k < e.equipes.length; k++) {
        e.tour = (e.tour + 1) % e.equipes.length;
        var q = e.equipes[e.tour];
        if (!q.passe) break;
        q.passe = false; q.joues++;
        e.journal += ' ' + q.nom + ' passe son tour.';
      }
    }
    e.phase = 'theme';
  }
  // Une action ; ctx = { vus (sujets déjà vus), h (hasard), maintenant } ; renvoie un message d'erreur ou null.
  // Le sujet tiré est rendu dans ctx.tire (à retenir comme « vu »).
  function agir(e, a, ctx) {
    ctx = ctx || {};
    var h = ctx.h || Math.random, q = e.equipes[e.tour], c = e.carte;
    switch (a.type) {
      case 'commencer':
        if (e.phase !== 'depart' || !e.equipes[a.i]) return 'Pas maintenant.';
        e.tour = a.i; e.phase = 'theme'; e.journal = e.equipes[a.i].nom + ' commence.';
        break;
      case 'tirer': {
        if (e.phase !== 'theme') return 'Pas maintenant.';
        var t = themeTour(e); e.chrono = null; e.derniere = null;
        if (t === 'arrivee') {
          var s = tirerSujet(null, ctx.vus, h); ctx.tire = s.id;
          e.carte = { theme: s.theme, sujet: s.id, niveau: NIVEAU_FINAL, finale: true }; e.phase = 'question';
        } else if (t === 'challenge') { e.carte = { theme: 'challenge', challenge: tirerChallenge(e, h) }; e.phase = 'challenge'; }
        else if (t === 'surprise') { e.carte = { theme: 'surprise', surprise: tirer(SURPRISES, h) }; e.phase = 'surprise'; }
        else { var s2 = tirerSujet(t, ctx.vus, h); ctx.tire = s2.id; e.carte = { theme: t, sujet: s2.id }; e.phase = 'mise'; }
        break;
      }
      case 'autre': {
        if (e.phase !== 'mise') return 'Pas maintenant.';
        var s3 = tirerSujet(c.theme, (ctx.vus || []).concat([c.sujet]), h); ctx.tire = s3.id; c.sujet = s3.id;
        break;
      }
      case 'miser':
        if (e.phase !== 'mise' || !(a.n >= 1 && a.n <= 10)) return 'Pas maintenant.';
        c.niveau = Math.round(a.n); e.phase = 'question'; e.chrono = null;
        e.journal = q.nom + ' se met ' + c.niveau + ' sur 10.';
        break;
      case 'chrono':
        if (['question', 'reponse', 'challenge'].indexOf(e.phase) === -1) return 'Pas maintenant.';
        e.chrono = { t: ctx.maintenant || Date.now(), n: (e.chrono && e.chrono.n || 0) + 1 };
        break;
      case 'voir':
        if (e.phase !== 'question') return 'Pas maintenant.';
        e.phase = 'reponse';
        break;
      case 'juger': {
        if (e.phase !== 'question' && e.phase !== 'reponse') return 'Pas maintenant.';
        var qr = question(e), n = c.niveau;
        e.derniere = { q: qr[0], r: qr[1], ok: !!a.ok, equipe: e.tour };
        if (c.finale) {
          if (a.ok) { e.gagnant = e.tour; e.phase = 'fin'; e.carte = null; e.chrono = null; e.journal = q.nom + ' a répondu juste à la question finale !'; break; }
          e.journal = q.nom + ' rate la question finale : on retentera au prochain tour.';
        } else if (a.ok) { e.journal = 'Bonne réponse ! ' + q.nom + ' avance de ' + cases(n) + '.'; deplacer(e, e.tour, n); }
        else e.journal = 'Raté : ' + q.nom + ' reste sur place.';
        suivant(e);
        break;
      }
      case 'challenge': {
        if (e.phase !== 'challenge') return 'Pas maintenant.';
        var ch = CHALLENGES[c.challenge], nb = Math.max(0, Math.min(ch.max || 0, Math.round(a.n) || 0));
        e.derniere = { q: ch.texte, r: ch.vf ? ch.vf.map(v => v[1] ? 'V' : 'F').join(' · ') : (ch.reponse || ''), n: nb, ok: nb > 0, equipe: e.tour, challenge: true };
        if (nb) { e.journal = 'Challenge : ' + nb + (nb > 1 ? ' bonnes réponses' : ' bonne réponse') + ', ' + q.nom + ' avance de ' + cases(nb) + '.'; deplacer(e, e.tour, nb); }
        else e.journal = 'Challenge : aucune bonne réponse pour ' + q.nom + '.';
        suivant(e);
        break;
      }
      case 'surprise': {
        if (e.phase !== 'surprise') return 'Pas maintenant.';
        var sp = SURPRISES[c.surprise], moi = e.tour, autres = e.equipes.map((x, i) => i).filter(i => i !== moi), meme = false;
        e.derniere = null;
        switch (sp.effet) {
          case 'avancer': e.journal = q.nom + ' avance de ' + cases(sp.n) + '.'; deplacer(e, moi, sp.n); break;
          case 'reculer': e.journal = q.nom + ' recule de ' + cases(sp.n) + '.'; deplacer(e, moi, -sp.n); break;
          case 'rejouer': e.journal = q.nom + ' avance de ' + cases(sp.n) + ' et rejoue !'; deplacer(e, moi, sp.n); meme = true; break;
          case 'passer': q.passe = true; e.journal = q.nom + ' recule de ' + cases(sp.n) + ' et passera son prochain tour.'; deplacer(e, moi, -sp.n); break;
          case 'rattraper': {
            var devant = autres.map(i => e.equipes[i].pos).filter(p => p > q.pos).sort((x, y) => x - y)[0];
            if (devant === undefined) { e.journal = q.nom + ' est en tête : +' + cases(sp.n) + '.'; deplacer(e, moi, sp.n); }
            else { e.journal = q.nom + ' rejoint l\'équipe juste devant.'; deplacer(e, moi, devant - q.pos); }
            break;
          }
          case 'echangerDernier': {
            var dernier = autres.slice().sort((x, y) => e.equipes[x].pos - e.equipes[y].pos)[0], d = e.equipes[dernier];
            if (d.pos >= q.pos) { e.journal = 'Personne n\'est derrière ' + q.nom + ' : ' + q.nom + ' recule de ' + cases(sp.n) + '.'; deplacer(e, moi, -sp.n); }
            else { var p = q.pos; q.pos = d.pos; d.pos = p; e.journal = q.nom + ' échange sa place avec ' + d.nom + '.'; }
            break;
          }
          case 'reculerAutre': {
            var cible = e.equipes[a.cible];
            if (!cible || a.cible === moi) return 'Choisis une autre équipe.';
            e.journal = q.nom + ' avance de ' + cases(sp.moi) + ', ' + cible.nom + ' recule de ' + cases(sp.n) + '.'; deplacer(e, moi, sp.moi); deplacer(e, a.cible, -sp.n);
            break;
          }
        }
        // Jamais sur une case dés après une carte : on continue dans le même sens (sinon on pourrait tourner en rond)
        var sens = sp.bon ? 1 : -1;
        while (e.cases[q.pos] === 'surprise') q.pos += sens;
        suivant(e, meme);
        break;
      }
      default: return 'Action inconnue.';
    }
    e.n = (e.n || 0) + 1;
    return null;
  }

  return { THEMES: THEMES, ORDRE_THEMES: ORDRE_THEMES, SUJETS: SUJETS, CHALLENGES: CHALLENGES, SURPRISES: SURPRISES, DEPARTS: DEPARTS,
           LONGUEURS: LONGUEURS, NIVEAU_FINAL: NIVEAU_FINAL, plateau: plateau, tirerSujet: tirerSujet, tirer: tirer, sujet: sujet, melanger: melanger,
           nouvellePartie: nouvellePartie, lecteur: lecteur, themeTour: themeTour, question: question, agir: agir, QUI: QUI };
})();
if (typeof module !== 'undefined') module.exports = DX;
