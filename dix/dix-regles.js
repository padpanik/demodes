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
      ['Quel champignon donne ses veines bleues au roquefort ?', 'Le Penicillium roqueforti'],
      ['Combien de litres de lait faut-il environ pour une meule de comté de 40 kg ?', 'Environ 450 litres (accepter de 400 à 500)'],
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
      ['Que veut dire « dinosaure » en grec ?', '« Lézard terrible »'],
      ['Comment s\'appelle le cratère laissé au Mexique par la météorite qui a contribué à leur disparition ?', 'Chicxulub (dans le Yucatán)'],
      ['Quel savant britannique a inventé le mot « dinosaure » en 1842 ?', 'Richard Owen']
    ]],
    ['improbable', 'Les phobies', [
      ['Comment s\'appelle la peur qui fait grimper sur une chaise en hurlant pour une bestiole à huit pattes de 2 mm ?', 'L\'arachnophobie'],
      ['Votre ami refuse l\'ascenseur, l\'IRM et même le placard à balais : comment s\'appelle sa peur des espaces fermés ?', 'La claustrophobie'],
      ['Votre ami refuse la piscine, la douche et même le verre d\'eau du repas : comment s\'appelle la peur de l\'eau ?', 'L\'hydrophobie (ou aquaphobie)'],
      ['Comment appelle-t-on la peur du vide, des hauteurs ?', 'L\'acrophobie'],
      ['L\'agoraphobie, c\'est la peur de quoi ?', 'Des espaces publics, de la foule, des lieux d\'où l\'on ne peut pas sortir facilement'],
      ['La coulrophobie, c\'est la peur de quoi ?', 'Des clowns'],
      ['Comment appelle-t-on la peur des serpents ?', 'L\'ophiophobie'],
      ['La nomophobie, c\'est la peur de quoi ?', 'D\'être sans son téléphone portable'],
      ['Comment appelle-t-on la peur du nombre 13 ?', 'La triskaïdékaphobie'],
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
      ['Que fait le cerf ?', 'Il brame'],
      ['Que fait la chouette ?', 'Elle hulule (ou chuinte)'],
      ['Que fait le chameau ?', 'Il blatère']
    ]],
    ['improbable', 'Les expressions françaises', [
      ['Si quelqu\'un vous « pose un lapin », faut-il prévoir des carottes ?', 'Non : il n\'est pas venu au rendez-vous'],
      ['Si vous avez « un chat dans la gorge », faut-il appeler le vétérinaire ?', 'Non : on est enroué'],
      ['Si un pull « coûte les yeux de la tête », combien d\'yeux faut-il donner à la caisse ?', 'Aucun : il coûte très cher'],
      ['Que veut dire « tomber dans les pommes » ?', 'S\'évanouir'],
      ['Que veut dire « avoir le cafard » ?', 'Être triste, déprimé'],
      ['Que veut dire « faire chou blanc » ?', 'Échouer, ne rien obtenir'],
      ['Que veut dire « être dans de beaux draps » ?', 'Être dans une situation difficile'],
      ['Que veut dire « tirer les vers du nez » à quelqu\'un ?', 'Le faire parler, lui soutirer des informations'],
      ['Que veut dire « peigner la girafe » ?', 'Faire un travail inutile, ne rien faire d\'utile'],
      ['Que veut dire « avoir maille à partir » avec quelqu\'un ?', 'Avoir un différend, une dispute avec lui']
    ]],
    ['improbable', 'Les inventions', [
      ['Quelle invention en caoutchouc permet d\'effacer ses fautes… et de la mâchouiller pendant les contrôles ?', 'La gomme'],
      ['Quel objet du quotidien, inventé pour ne plus se mouiller, se retourne au premier coup de vent ?', 'Le parapluie'],
      ['Quel Américain a mis au point l\'ampoule électrique… sans doute en ayant enfin une idée lumineuse ?', 'Thomas Edison'],
      ['Dans quel pays le papier a-t-il été inventé ?', 'La Chine'],
      ['Qu\'a inventé László Bíró ?', 'Le stylo à bille'],
      ['Quel appareil Percy Spencer a-t-il inventé après qu\'une barre chocolatée a fondu dans sa poche ?', 'Le four à micro-ondes'],
      ['Quel Français a inventé une machine à calculer en 1642 ?', 'Blaise Pascal (la Pascaline)'],
      ['Qu\'a inventé Nicéphore Niépce ?', 'La photographie'],
      ['En quelle année Graham Bell a-t-il déposé le brevet du téléphone ?', '1876'],
      ['Qui a inventé le Rubik\'s Cube, et de quelle nationalité était-il ?', 'Ernő Rubik, hongrois (1974)']
    ]],
    ['improbable', 'Les créatures légendaires', [
      ['Quel cheval blanc magique a une corne sur le front et des paillettes sur tous les cahiers d\'écolier ?', 'La licorne'],
      ['Quelle créature des contes de fées, petite et ailée, laisse une pièce sous l\'oreiller contre une dent de lait ?', 'La petite souris (ou la fée des dents)'],
      ['Quel cheval ailé de la mythologie grecque n\'a jamais eu besoin de prendre l\'avion ?', 'Pégase'],
      ['Comment s\'appelle la créature mi-femme, mi-poisson ?', 'La sirène'],
      ['Quel oiseau renaît de ses cendres ?', 'Le phénix'],
      ['Quel monstre à tête de taureau était enfermé dans le labyrinthe ?', 'Le Minotaure'],
      ['Dans quel pays vivrait le monstre du Loch Ness ?', 'L\'Écosse'],
      ['Combien de têtes avait Cerbère, le chien des Enfers ?', 'Trois'],
      ['Quel héros grec a tranché la tête de Méduse ?', 'Persée'],
      ['Comment s\'appelle la créature mi-aigle, mi-lion ?', 'Le griffon']
    ]],
    ['improbable', 'Les animaux étonnants', [
      ['Quel animal à longue trompe ne peut pas sauter, même s\'il le voulait très fort ?', 'L\'éléphant'],
      ['Quel animal noir et blanc passe environ 14 heures par jour à manger du bambou… et le reste à dormir ?', 'Le panda (géant)'],
      ['Quel mammifère qui pond des œufs, avec un bec de canard et une queue de castor, semble avoir été inventé un lundi matin ?', 'L\'ornithorynque'],
      ['Chez l\'hippocampe, qui porte les petits : le mâle ou la femelle ?', 'Le mâle'],
      ['Combien de cœurs a une pieuvre ?', 'Trois'],
      ['De quelle couleur est la peau de l\'ours polaire, sous sa fourrure ?', 'Noire'],
      ['Quel minuscule animal peut survivre au vide de l\'espace ?', 'Le tardigrade'],
      ['De quelle couleur est le sang du homard au contact de l\'air ?', 'Bleu'],
      ['En combien de poches est divisé l\'estomac d\'une vache ?', 'Quatre'],
      ['Quel animal a des empreintes digitales presque identiques aux nôtres ?', 'Le koala']
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
      ['Comment s\'appelle le père de Nemo ?', 'Marin'],
      ['Quel a été le premier long métrage d\'animation de Disney, en 1937 ?', 'Blanche-Neige et les Sept Nains'],
      ['Dans « Il était une fois… la Vie », comment s\'appelle le vieux savant à barbe blanche ?', 'Maestro']
    ]],
    ['plaisir', 'Les jeux vidéo', [
      ['Quel est le métier de Mario, qui passe pourtant plus de temps à sauter sur des champignons qu\'à réparer des fuites ?', 'Plombier'],
      ['Comment s\'appelle le hérisson bleu qui court si vite qu\'il oublie toujours de s\'arrêter ?', 'Sonic'],
      ['Quel Pokémon jaune refuse obstinément de rentrer dans sa Pokéball ?', 'Pikachu'],
      ['Quel jeu consiste à empiler des blocs qui tombent pour faire des lignes ?', 'Tetris'],
      ['Comment s\'appelle la princesse que Mario doit souvent sauver ?', 'Peach'],
      ['Quel jeu de construction en blocs cubiques est le plus vendu de l\'histoire ?', 'Minecraft'],
      ['Comment s\'appelle le héros de « The Legend of Zelda » ?', 'Link'],
      ['En quelle année la première PlayStation est-elle sortie au Japon ?', '1994'],
      ['Comment s\'appelle le fantôme rouge de Pac-Man ?', 'Blinky'],
      ['Quel Français a créé le personnage de Rayman ?', 'Michel Ancel']
    ]],
    ['plaisir', 'La chanson française', [
      ['Quelle chanson d\'Édith Piaf donne l\'impression que tout est beau, même un lundi matin ?', 'La Vie en rose'],
      ['Quel chanteur belge a fait danser toute la planète en chantant « Alors on danse »… sur des paroles plutôt déprimantes ?', 'Stromae'],
      ['Quelle chanteuse québécoise a fait pleurer la planète avec la chanson de « Titanic » ?', 'Céline Dion'],
      ['Qui a écrit et chanté « Ne me quitte pas » ?', 'Jacques Brel'],
      ['Qui chante « Les Champs-Élysées » ?', 'Joe Dassin'],
      ['Quel groupe chante « L\'Aventurier » ?', 'Indochine'],
      ['Quel chanteur a sorti l\'album « Histoire de Melody Nelson » ?', 'Serge Gainsbourg'],
      ['Quel est le vrai nom de Johnny Hallyday ?', 'Jean-Philippe Smet'],
      ['Qui chante « La Bohème » (1965) ?', 'Charles Aznavour'],
      ['Qui a composé « Comme d\'habitude », devenue « My Way » ?', 'Claude François et Jacques Revaux']
    ]],
    ['plaisir', 'Le cinéma', [
      ['Quel petit extraterrestre au long cou passe tout le film à vouloir « téléphoner maison » ?', 'E.T.'],
      ['Dans « Titanic », sur quoi flotte Rose à la fin… alors qu\'il y avait clairement de la place pour deux ?', 'Une porte (un morceau de boiserie)'],
      ['Dans quelle saga des dinosaures sont recréés dans un parc d\'attractions… ce qui, étonnamment, tourne mal ?', 'Jurassic Park'],
      ['Dans quel film de 2011 jouent Omar Sy et François Cluzet ?', 'Intouchables'],
      ['Combien de films compte la saga Harry Potter ?', 'Huit'],
      ['Dans quel quartier de Paris vit Amélie Poulain ?', 'Montmartre'],
      ['Dans « Bienvenue chez les Ch\'tis », dans quelle ville est muté Philippe ?', 'Bergues'],
      ['Quel est le prénom du chef d\'orchestre joué par Louis de Funès dans « La Grande Vadrouille » ?', 'Stanislas (Lefort)'],
      ['Qui a réalisé « Les Parapluies de Cherbourg » ?', 'Jacques Demy'],
      ['Quel est le titre du premier film des frères Lumière, en 1895 ?', 'La Sortie de l\'usine Lumière à Lyon']
    ]],
    ['plaisir', 'Le chocolat et les desserts', [
      ['Quel dessert italien au café et au mascarpone signifie à peu près « remonte-moi le moral » ?', 'Le tiramisu'],
      ['À la Chandeleur, que fait-on sauter dans la poêle en tenant une pièce dans l\'autre main ?', 'Des crêpes'],
      ['Quel gâteau en forme de bûche mange-t-on à Noël, alors que personne ne la mettrait dans la cheminée ?', 'La bûche de Noël'],
      ['Quelle crêpe flambée est parfumée à l\'orange ?', 'La crêpe Suzette'],
      ['Comment s\'appelle la pyramide de choux servie aux mariages ?', 'La pièce montée (le croquembouche)'],
      ['Quel ingrédient du cacao est à la base du chocolat blanc ?', 'Le beurre de cacao'],
      ['Quel pays est le premier producteur mondial de cacao ?', 'La Côte d\'Ivoire'],
      ['Quel peuple d\'Amérique buvait le cacao en boisson épicée, le « xocolatl » ?', 'Les Aztèques (et avant eux les Mayas)'],
      ['Dans quelle commune serait née la tarte Tatin ?', 'Lamotte-Beuvron'],
      ['Quel pâtissier a créé l\'Ispahan (rose, litchi, framboise) ?', 'Pierre Hermé']
    ]],
    ['plaisir', 'Le football', [
      ['Combien de joueurs d\'une équipe ont le droit de toucher le ballon avec les mains, sans recevoir de carton ?', 'Un seul : le gardien (dans sa surface)'],
      ['Quelle couleur de carton fait quitter le terrain en boudant ?', 'Le rouge'],
      ['Combien de minutes dure un match, sans compter le temps passé par les joueurs à se rouler par terre ?', '90 minutes'],
      ['Qui est surnommé « Zizou » ?', 'Zinédine Zidane'],
      ['Quel pays a gagné le plus de Coupes du monde ?', 'Le Brésil (5)'],
      ['En quelle année la France a-t-elle gagné sa première Coupe du monde ?', '1998'],
      ['Quel club joue au Parc des Princes ?', 'Le Paris Saint-Germain'],
      ['Quel joueur a remporté le plus de Ballons d\'or ?', 'Lionel Messi'],
      ['Quel club français a remporté la Ligue des champions en 1993 ?', 'L\'Olympique de Marseille'],
      ['Dans quel pays s\'est jouée la toute première Coupe du monde, en 1930 ?', 'L\'Uruguay']
    ]],
    ['plaisir', 'Les séries', [
      ['Dans quelle série d\'animation une famille toute jaune regarde-t-elle la télé sur un canapé depuis plus de 30 ans ?', 'Les Simpson'],
      ['Dans quelle série espagnole les braqueurs portent-ils une combinaison rouge et un masque de Dalí ?', 'La casa de papel'],
      ['Dans quelle série coréenne des joueurs endettés risquent-ils leur vie à « 1, 2, 3, soleil » ?', 'Squid Game'],
      ['Dans « Game of Thrones », comment s\'appelle le trône que tous convoitent ?', 'Le Trône de fer'],
      ['Qui a créé « Kaamelott » et y joue le roi Arthur ?', 'Alexandre Astier'],
      ['Dans « Friends », comment s\'appelle le café où se retrouvent les amis ?', 'Le Central Perk'],
      ['Quel est le prénom du professeur de chimie de « Breaking Bad » ?', 'Walter (White)'],
      ['Quel est le prénom du docteur House ?', 'Gregory'],
      ['Combien de saisons compte « Friends » ?', 'Dix'],
      ['Qui a créé la série « Les Soprano » ?', 'David Chase']
    ]],
    ['plaisir', 'La cuisine du monde', [
      ['De quel pays vient la pizza ? (Indice : pas d\'ananas dessus, s\'il vous plaît)', 'L\'Italie'],
      ['Quel plat japonais de riz et de poisson cru fait paniquer ceux qui confondent wasabi et purée d\'avocat ?', 'Les sushis'],
      ['Quelle sauce mexicaine verte se fait avec de l\'avocat… et disparaît en trois minutes à l\'apéro ?', 'Le guacamole'],
      ['Quel plat espagnol se fait avec du riz et du safran ?', 'La paella'],
      ['De quelle région du monde le couscous est-il originaire ?', 'Du Maghreb (Afrique du Nord)'],
      ['Quelle soupe froide espagnole se fait à base de tomate ?', 'Le gaspacho'],
      ['De quel pays vient le kimchi ?', 'La Corée'],
      ['Quelle épice donne sa couleur jaune au curry ?', 'Le curcuma'],
      ['De quel pays vient la soupe « pho » ?', 'Le Vietnam'],
      ['Comment s\'appelle la grande galette éthiopienne faite de teff ?', 'L\'injera']
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
      ['Combien de litres contient un jéroboam de champagne ?', '3 litres'],
      ['À quel moine bénédictin attribue-t-on (par légende) l\'invention du champagne ?', 'Dom Pérignon']
    ]],
    ['mature', 'L\'argent et les impôts', [
      ['Quelle monnaie a remplacé le franc… et fait dire à nos grands-parents « ça fait combien en francs ? »', 'L\'euro'],
      ['Quel animal en céramique, fendu sur le dos, sert à garder ses économies ?', 'Le cochon (la tirelire)'],
      ['Quelle taxe se cache dans le prix de presque tout ce qu\'on achète, et s\'écrit avec trois lettres ?', 'La TVA (taxe sur la valeur ajoutée)'],
      ['Comment s\'appelle l\'impôt payé chaque année par les propriétaires d\'un logement ?', 'La taxe foncière'],
      ['En quelle année les pièces et billets en euros sont-ils arrivés ?', '2002'],
      ['Que veut dire le sigle SMIC ?', 'Salaire minimum interprofessionnel de croissance'],
      ['Combien de francs valait un euro (au centime près) ?', '6,56 francs (6,55957)'],
      ['Quelle institution fixe les taux directeurs de la zone euro ?', 'La Banque centrale européenne (BCE)'],
      ['Dans quelle ville siège la Banque centrale européenne ?', 'Francfort'],
      ['Quel impôt a remplacé l\'ISF en 2018 ?', 'L\'impôt sur la fortune immobilière (IFI)']
    ]],
    ['mature', 'La voiture', [
      ['De quelle couleur est le feu où tout le monde accélère en disant « il était encore orange » ?', 'Orange (il faut s\'arrêter, sauf si c\'est dangereux)'],
      ['Quelle grande lettre rouge, collée à l\'arrière d\'une voiture, prévient qu\'il faut être patient avec le conducteur ?', 'Le « A » (jeune conducteur)'],
      ['Quelle est la vitesse maximale sur autoroute par temps sec, même quand on est très en retard ?', '130 km/h'],
      ['Quelle marque automobile a un lion pour logo ?', 'Peugeot'],
      ['Combien de points compte un permis de conduire définitif ?', '12 points'],
      ['Avec combien de points démarre un permis probatoire ?', '6 points'],
      ['Quel est le taux d\'alcool maximal pour un conducteur confirmé, en grammes par litre de sang ?', '0,5 g/l'],
      ['Tous les combien doit-on passer le contrôle technique d\'une voiture de plus de 4 ans ?', 'Tous les 2 ans'],
      ['Que fait le système ABS ?', 'Il empêche les roues de se bloquer au freinage'],
      ['Quel frère a fondé Renault en 1899, avec Marcel et Fernand ?', 'Louis Renault']
    ]],
    ['mature', 'La maison et le bricolage', [
      ['Avec quel outil se tape-t-on le plus souvent sur les doigts en voulant planter un clou ?', 'Un marteau'],
      ['Quel meuble suédois en kit se monte avec une petite clé hexagonale… et il reste toujours une vis à la fin ?', 'Un meuble Ikea (la clé Allen)'],
      ['Quel outil à bulle sert à vérifier qu\'un tableau est droit, avant de l\'accrocher de travers quand même ?', 'Le niveau (à bulle)'],
      ['En quelle unité mesure-t-on la puissance d\'une ampoule ?', 'En watts'],
      ['Quelle scie électrique permet de découper le bois en courbe ?', 'La scie sauteuse'],
      ['Que veut dire DPE, dans une annonce immobilière ?', 'Diagnostic de performance énergétique'],
      ['Quelle est la tension du courant électrique dans une maison en France ?', '230 volts'],
      ['À quoi sert un disjoncteur différentiel ?', 'À couper le courant en cas de fuite électrique (il protège les personnes)'],
      ['Que veut dire VMC ?', 'Ventilation mécanique contrôlée'],
      ['Comment s\'appelle l\'empreinte de vis en étoile à six branches ?', 'Torx']
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
      ['Combien faut-il de témoins au minimum pour un mariage civil en France ?', 'Deux (quatre au plus)'],
      ['Combien de jours au moins doit durer la publication des bans avant un mariage ?', 'Dix jours']
    ]],
    ['mature', 'Le travail', [
      ['Quel jour de la semaine est le plus détesté des travailleurs, au point d\'avoir son propre « blues » ?', 'Le lundi'],
      ['Comment appelle-t-on la pause du matin où l\'on parle de tout sauf du travail autour de la machine à café ?', 'La pause-café'],
      ['Quelle est la durée légale du travail par semaine en France ? (Pas « le moins possible ».)', '35 heures'],
      ['Combien de semaines de congés payés a-t-on par an en France ?', 'Cinq'],
      ['Que veut dire RTT ?', 'Réduction du temps de travail'],
      ['Quelle fête célèbre-t-on le 1er mai ?', 'La fête du Travail'],
      ['Quel nom Pôle emploi a-t-il pris en 2024 ?', 'France Travail'],
      ['Quelle ministre a donné son nom à la loi des 35 heures ?', 'Martine Aubry'],
      ['En quelle année les congés payés sont-ils apparus en France ?', '1936 (Front populaire)'],
      ['Quelle est la durée maximale de la période d\'essai d\'un cadre en CDI, sans renouvellement ?', 'Quatre mois']
    ]],
    ['mature', 'L\'apéro et les cocktails', [
      ['Quel cocktail cubain au rhum oblige le barman à écraser de la menthe avec un bâton ?', 'Le mojito'],
      ['Quelle boisson anisée devient toute trouble quand on y verse de l\'eau, à Marseille ?', 'Le pastis'],
      ['Quels petits fruits secs salés, servis à l\'apéro, finissent toujours mangés avant que les invités arrivent ?', 'Les cacahuètes'],
      ['Quel alcool mexicain est tiré de l\'agave ?', 'La tequila'],
      ['Quel apéritif orange est le plus utilisé dans le spritz ?', 'L\'Apérol'],
      ['Le Bloody Mary, c\'est de la vodka et du jus de… ?', 'Tomate'],
      ['Dans le kir royal, par quoi remplace-t-on le vin blanc ?', 'Par du champagne'],
      ['La piña colada, c\'est du rhum, de l\'ananas et… ?', 'De la crème de coco'],
      ['Quel cocktail James Bond commande-t-il « au shaker, pas à la cuillère » ?', 'Un vodka martini'],
      ['Le daïquiri porte le nom d\'un lieu de quel pays ?', 'Cuba']
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
      ['Combien de chiffres compte un numéro de sécurité sociale, sans la clé ?', '13 (15 avec la clé)']
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
      ['En quelle année les Françaises ont-elles voté pour la première fois ?', '1945 (droit de vote accordé en 1944)'],
      ['Quelle dynastie a succédé aux Mérovingiens ?', 'Les Carolingiens'],
      ['En quelle année l\'ordonnance de Villers-Cotterêts a-t-elle imposé le français dans les actes officiels ?', '1539']
    ]],
    ['scolaire', 'La géographie', [
      ['Quelle est la capitale de l\'Italie, où mènent tous les chemins ?', 'Rome'],
      ['Quelle grande tour de fer de Paris devait être démontée au bout de 20 ans… et est toujours là ?', 'La tour Eiffel'],
      ['Quel plus haut sommet des Alpes porte un nom de dessert, une fois avec de la crème de marrons ?', 'Le mont Blanc'],
      ['Quel est le plus long fleuve de France ?', 'La Loire'],
      ['Quel est le plus petit pays du monde ?', 'Le Vatican'],
      ['Quelle est la capitale du Canada ?', 'Ottawa'],
      ['Quelle est la capitale de l\'Australie ?', 'Canberra'],
      ['Combien la France compte-t-elle de départements, outre-mer compris ?', '101'],
      ['Quel est le pays le plus peuplé du monde ?', 'L\'Inde (devant la Chine depuis 2023)'],
      ['Quelle est la capitale du Kazakhstan ?', 'Astana']
    ]],
    ['scolaire', 'La langue française', [
      ['Combien de lettres compte l\'alphabet français ? (Les gribouillis du docteur ne comptent pas.)', '26'],
      ['Quel est le pluriel de « cheval » ? (Attention, « chevals » vous fait reculer d\'une case… presque.)', 'Chevaux'],
      ['Combien de voyelles y a-t-il dans le mot « oiseau », qui n\'a presque que ça ?', 'Cinq : o, i, e, a, u'],
      ['Quel est le féminin d\'« acteur » ?', 'Actrice'],
      ['Comment s\'appelle le petit signe sous le c de « ç » ?', 'La cédille'],
      ['Quel est le participe passé de « résoudre » ?', 'Résolu'],
      ['Comment appelle-t-on un mot qui se lit pareil dans les deux sens, comme « radar » ?', 'Un palindrome'],
      ['Quelle figure de style réunit deux mots contraires, comme « cette obscure clarté » ?', 'L\'oxymore'],
      ['Conjuguez « croire » au subjonctif présent, avec « nous ».', 'Que nous croyions'],
      ['Quel est le féminin de l\'adjectif « hébreu » ?', 'Hébraïque']
    ]],
    ['scolaire', 'Les mathématiques', [
      ['Combien font 2 + 2 ? (Oui, c\'est vraiment la question.)', '4'],
      ['Si vous avez 10 bonbons et que vous en mangez 10, combien en reste-t-il pour les autres ?', '0'],
      ['Combien de côtés a un triangle ? (Un indice se cache dans le mot.)', 'Trois'],
      ['Quelle est la racine carrée de 144 ?', '12'],
      ['Combien vaut la somme des angles d\'un triangle ?', '180 degrés'],
      ['Quel théorème dit que, dans un triangle rectangle, a² + b² = c² ?', 'Le théorème de Pythagore'],
      ['Combien vaut π, arrondi au centième ?', '3,14'],
      ['Combien de zéros compte un milliard ?', 'Neuf'],
      ['Quelle est la formule de l\'aire d\'un disque ?', 'π × r² (pi fois le rayon au carré)'],
      ['Combien vaut « factorielle zéro » (0!) ?', '1']
    ]],
    ['scolaire', 'Le corps humain', [
      ['Quel organe bat plus vite quand on croise son amoureux… ou son banquier ?', 'Le cœur'],
      ['Quel organe gargouille en pleine réunion silencieuse pour annoncer à tout le monde qu\'on a sauté le petit-déjeuner ?', 'L\'estomac (le ventre)'],
      ['Combien de dents a un adulte avec ses dents de sagesse… ce qui ne le rend pas plus sage ?', '32'],
      ['Quel est le plus grand organe du corps ?', 'La peau'],
      ['Quelles cellules du sang transportent l\'oxygène ?', 'Les globules rouges (hématies)'],
      ['Combien de litres de sang un adulte a-t-il environ ?', 'Environ 5 litres'],
      ['Quel groupe sanguin est « donneur universel » ?', 'O négatif'],
      ['Quel organe produit l\'insuline ?', 'Le pancréas'],
      ['Combien d\'os compte le squelette d\'un adulte ?', '206'],
      ['Comment s\'appelle le plus petit os du corps, dans l\'oreille ?', 'L\'étrier']
    ]],
    ['scolaire', 'Les sciences', [
      ['Quelle est la formule chimique de l\'eau, que les savants aiment dire pour avoir l\'air savant ?', 'H₂O'],
      ['Quelle force fait tomber les pommes sur la tête des savants, comme Newton ?', 'La gravité (la pesanteur)'],
      ['Combien de planètes compte le système solaire, depuis que Pluton s\'est fait renvoyer en 2006 ?', 'Huit'],
      ['Quelle est la plus grosse planète du système solaire ?', 'Jupiter'],
      ['Quelle est la planète la plus proche du Soleil ?', 'Mercure'],
      ['Quel est le symbole chimique de l\'or ?', 'Au'],
      ['Qui a découvert la pénicilline ?', 'Alexander Fleming'],
      ['Quel est le symbole chimique du fer ?', 'Fe'],
      ['Quelle est la vitesse de la lumière, environ ?', 'Environ 300 000 km par seconde'],
      ['Combien d\'éléments compte le tableau périodique aujourd\'hui ?', '118']
    ]],
    ['scolaire', 'La littérature', [
      ['Quel jeune sorcier à lunettes et à cicatrice dort dans un placard sous l\'escalier ?', 'Harry Potter'],
      ['Dans « Le Petit Prince », que demande le petit prince au pilote en panne dans le désert ?', 'De lui dessiner un mouton'],
      ['Dans la fable de La Fontaine, que lâche le corbeau en ouvrant son large bec pour chanter ?', 'Son fromage'],
      ['Qui a écrit « Les Misérables » ?', 'Victor Hugo'],
      ['Qui a écrit « Le Tour du monde en quatre-vingts jours » ?', 'Jules Verne'],
      ['Qui a écrit « Les Trois Mousquetaires » ?', 'Alexandre Dumas'],
      ['Quel était le vrai nom de Molière ?', 'Jean-Baptiste Poquelin'],
      ['Qui a écrit « L\'Étranger » ?', 'Albert Camus'],
      ['Qui a écrit « À la recherche du temps perdu » ?', 'Marcel Proust'],
      ['Qui a écrit « Les Liaisons dangereuses » ?', 'Choderlos de Laclos']
    ]],
    ['scolaire', 'L\'anglais', [
      ['Que veut dire « hello » ? (Indice : on le dit en décrochant, même en France.)', 'Bonjour'],
      ['Comment dit-on « chat » en anglais… sans miauler ?', 'Cat'],
      ['Que veut dire « I don\'t speak English », la phrase la plus utile en vacances ?', 'Je ne parle pas anglais'],
      ['Que veut dire « yellow » ?', 'Jaune'],
      ['Comment dit-on « mercredi » en anglais ?', 'Wednesday'],
      ['Quel est le prétérit de « to go » ?', 'Went'],
      ['Que veut dire « butterfly » ?', 'Papillon'],
      ['Quel est le participe passé de « to bring » ?', 'Brought'],
      ['Que veut dire « squirrel » ?', 'Écureuil'],
      ['Que veut dire « thimble » ?', 'Dé à coudre']
    ]]
  ].map(function (s, i) { return { id: s[0] + '-' + i, theme: s[0], nom: s[1], q: s[2] }; });

  // Challenges : épreuves originales, jugées par l'équipe qui lit. gain = cases gagnées si réussi
  var CHALLENGES = [
    { titre: 'Liste express', texte: 'Citez 5 pays d\'Afrique en 30 secondes.', gain: 4 },
    { titre: 'Liste express', texte: 'Citez 5 fruits rouges en 30 secondes.', gain: 3 },
    { titre: 'Liste express', texte: 'Citez 4 planètes du système solaire en 15 secondes.', gain: 3 },
    { titre: 'Liste express', texte: 'Donnez 3 mots qui riment avec « chapeau » en 10 secondes.', gain: 2 },
    { titre: 'À l\'envers', texte: 'Récitez les 7 jours de la semaine à l\'envers, en commençant par dimanche, en moins de 10 secondes.', gain: 3 },
    { titre: 'Calcul mental', texte: 'Comptez de 7 en 7 jusqu\'à 70, sans erreur et sans hésiter.', gain: 3 },
    { titre: 'Arc-en-ciel', texte: 'Citez les 7 couleurs de l\'arc-en-ciel dans l\'ordre.', reponse: 'Rouge, orange, jaune, vert, bleu, indigo, violet', gain: 4 },
    { titre: 'Épellation', texte: 'Épelez « anticonstitutionnellement » sans vous tromper.', reponse: 'A-N-T-I-C-O-N-S-T-I-T-U-T-I-O-N-N-E-L-L-E-M-E-N-T', gain: 4 },
    { titre: 'Mime', texte: 'Un joueur mime un métier choisi par l\'équipe qui lit ; ses coéquipiers ont 30 secondes pour trouver.', gain: 3 },
    { titre: 'Dessin', texte: 'Un joueur dessine un objet choisi par l\'équipe qui lit (sans lettres ni chiffres) ; ses coéquipiers ont 30 secondes pour trouver.', gain: 3 },
    { titre: 'Fredonne', texte: 'Un joueur fredonne (sans paroles) le générique d\'un dessin animé ; ses coéquipiers doivent le reconnaître.', gain: 3 },
    { titre: 'Vrai ou faux', texte: 'Vrai ou faux : on voit la Grande Muraille de Chine depuis la Lune, à l\'œil nu.', reponse: 'Faux', gain: 2 },
    { titre: 'Vrai ou faux', texte: 'Vrai ou faux : la tour Eiffel est un peu plus haute en été qu\'en hiver.', reponse: 'Vrai (le métal se dilate avec la chaleur, de quelques centimètres)', gain: 2 },
    { titre: 'Plus ou moins', texte: 'En quelle année la tour Eiffel a-t-elle été inaugurée ? L\'équipe propose une année, l\'équipe qui lit répond « plus » ou « moins » : 5 essais pour trouver.', reponse: '1889', gain: 4 },
    { titre: 'Le plus long', texte: 'Lequel est le plus long : le Nil, l\'équateur ou la Grande Muraille de Chine ?', reponse: 'L\'équateur (environ 40 000 km)', gain: 2 },
    { titre: 'Sans dire non', texte: 'L\'équipe qui lit pose des questions pendant 20 secondes : répondez sans jamais dire « oui » ni « non ».', gain: 3 }
  ];

  // « Superbe ! » (bonus) et « Aïe ! » (malus) : appliqués tout seuls par l'appli
  //   avancer / reculer : n cases ; rejouer ; passer : passe son prochain tour ; rattraper : rejoint l'équipe juste devant ;
  //   echangerDernier : échange sa place avec l'équipe la plus en retard ; reculerAutre : l'équipe choisie recule de n
  var SURPRISES = [
    { bon: true, texte: 'Superbe ! Avancez de 3 cases.', effet: 'avancer', n: 3 },
    { bon: true, texte: 'Superbe ! Avancez de 2 cases.', effet: 'avancer', n: 2 },
    { bon: true, texte: 'Superbe ! Rejouez tout de suite.', effet: 'rejouer' },
    { bon: true, texte: 'Superbe ! Rejoignez l\'équipe juste devant vous (si vous êtes en tête : avancez de 2).', effet: 'rattraper', n: 2 },
    { bon: true, texte: 'Superbe ! Choisissez une équipe : elle recule de 2 cases.', effet: 'reculerAutre', n: 2 },
    { bon: true, texte: 'Superbe ! Avancez de 4 cases.', effet: 'avancer', n: 4 },
    { bon: false, texte: 'Aïe ! Reculez de 2 cases.', effet: 'reculer', n: 2 },
    { bon: false, texte: 'Aïe ! Reculez de 3 cases.', effet: 'reculer', n: 3 },
    { bon: false, texte: 'Aïe ! Vous passez votre prochain tour.', effet: 'passer' },
    { bon: false, texte: 'Aïe ! Échangez votre place avec l\'équipe la plus en retard.', effet: 'echangerDernier' },
    { bon: false, texte: 'Aïe ! Reculez d\'une case… et parlez en chantant jusqu\'à votre prochain tour.', effet: 'reculer', n: 1 },
    { bon: false, texte: 'Aïe ! Rien ne se passe… mais vous avez eu peur.', effet: 'rien' }
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
        } else if (t === 'challenge') { e.carte = { theme: 'challenge', challenge: tirer(CHALLENGES, h) }; e.phase = 'challenge'; }
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
        var ch = CHALLENGES[c.challenge];
        e.derniere = { q: ch.titre, r: ch.reponse || '', ok: !!a.ok, equipe: e.tour };
        if (a.ok) { e.journal = 'Challenge réussi : ' + q.nom + ' avance de ' + cases(ch.gain) + '.'; deplacer(e, e.tour, ch.gain); }
        else e.journal = 'Challenge raté pour ' + q.nom + '.';
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
          case 'rejouer': e.journal = q.nom + ' rejoue !'; meme = true; break;
          case 'passer': q.passe = true; e.journal = q.nom + ' passera son prochain tour.'; break;
          case 'rattraper': {
            var devant = autres.map(i => e.equipes[i].pos).filter(p => p > q.pos).sort((x, y) => x - y)[0];
            if (devant === undefined) { e.journal = q.nom + ' est en tête : +' + cases(sp.n) + '.'; deplacer(e, moi, sp.n); }
            else { e.journal = q.nom + ' rejoint l\'équipe juste devant.'; deplacer(e, moi, devant - q.pos); }
            break;
          }
          case 'echangerDernier': {
            var dernier = autres.slice().sort((x, y) => e.equipes[x].pos - e.equipes[y].pos)[0], d = e.equipes[dernier];
            if (d.pos >= q.pos) e.journal = 'Personne n\'est derrière ' + q.nom + ' : rien ne change.';
            else { var p = q.pos; q.pos = d.pos; d.pos = p; e.journal = q.nom + ' échange sa place avec ' + d.nom + '.'; }
            break;
          }
          case 'reculerAutre': {
            var cible = e.equipes[a.cible];
            if (!cible || a.cible === moi) return 'Choisis une autre équipe.';
            e.journal = cible.nom + ' recule de ' + cases(sp.n) + '.'; deplacer(e, a.cible, -sp.n);
            break;
          }
          default: e.journal = 'Ouf, rien ne se passe pour ' + q.nom + '.';
        }
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
