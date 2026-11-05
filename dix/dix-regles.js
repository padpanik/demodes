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
      ['De quel pays vient la mozzarella ?', 'L\'Italie'],
      ['Quel fromage met-on traditionnellement dans la tartiflette ?', 'Le reblochon'],
      ['Avec le lait de quel animal fait-on le roquefort ?', 'La brebis'],
      ['Dans quelle région fabrique-t-on le camembert ?', 'La Normandie'],
      ['De quelle couleur est la pâte de la mimolette ?', 'Orange'],
      ['Dans quel massif montagneux fabrique-t-on surtout le comté ?', 'Le Jura'],
      ['Quel fromage fut sacré « roi des fromages » au congrès de Vienne en 1815 ?', 'Le brie (de Meaux)'],
      ['Quel champignon donne ses veines bleues au roquefort ?', 'Le Penicillium roqueforti'],
      ['Combien de litres de lait faut-il environ pour une meule de comté de 40 kg ?', 'Environ 450 litres (accepter de 400 à 500)'],
      ['Quelle bactérie donne sa croûte orangée au munster ?', 'Brevibacterium linens (le « ferment du rouge »)']
    ]],
    ['improbable', 'Les dinosaures', [
      ['Que signifie le « T » de T-Rex ?', 'Tyrannosaurus (tyrannosaure)'],
      ['Les dinosaures ont-ils vécu en même temps que les premiers humains ?', 'Non (des dizaines de millions d\'années les séparent)'],
      ['Quel dinosaure avait trois cornes sur la tête ?', 'Le tricératops'],
      ['Quel dinosaure portait de grandes plaques sur le dos et des pointes au bout de la queue ?', 'Le stégosaure'],
      ['Quels animaux d\'aujourd\'hui descendent directement des dinosaures ?', 'Les oiseaux'],
      ['Il y a environ combien de millions d\'années les grands dinosaures ont-ils disparu ?', '66 millions d\'années'],
      ['Quelle période géologique vient juste avant le Crétacé ?', 'Le Jurassique'],
      ['Que veut dire « dinosaure » en grec ?', '« Lézard terrible »'],
      ['Comment s\'appelle le cratère laissé au Mexique par la météorite qui a contribué à leur disparition ?', 'Chicxulub (dans le Yucatán)'],
      ['Quel savant britannique a inventé le mot « dinosaure » en 1842 ?', 'Richard Owen']
    ]],
    ['improbable', 'Les phobies', [
      ['Comment appelle-t-on la peur des araignées ?', 'L\'arachnophobie'],
      ['La claustrophobie, c\'est la peur de quoi ?', 'Des espaces clos, fermés'],
      ['Comment appelle-t-on la peur de l\'eau ?', 'L\'hydrophobie (ou aquaphobie)'],
      ['Comment appelle-t-on la peur du vide, des hauteurs ?', 'L\'acrophobie'],
      ['L\'agoraphobie, c\'est la peur de quoi ?', 'Des espaces publics, de la foule, des lieux d\'où l\'on ne peut pas sortir facilement'],
      ['La coulrophobie, c\'est la peur de quoi ?', 'Des clowns'],
      ['Comment appelle-t-on la peur des serpents ?', 'L\'ophiophobie'],
      ['La nomophobie, c\'est la peur de quoi ?', 'D\'être sans son téléphone portable'],
      ['Comment appelle-t-on la peur du nombre 13 ?', 'La triskaïdékaphobie'],
      ['Comment appelle-t-on (avec humour) la peur des mots trop longs ?', 'L\'hippopotomonstrosesquippedaliophobie']
    ]],
    ['improbable', 'Les cris des animaux', [
      ['Le chien aboie ; et le chat ?', 'Il miaule'],
      ['Que fait le cheval ?', 'Il hennit'],
      ['Que fait l\'âne ?', 'Il brait'],
      ['Que fait le loup ?', 'Il hurle'],
      ['Que fait la grenouille ?', 'Elle coasse'],
      ['Que fait le corbeau ?', 'Il croasse'],
      ['Que fait l\'éléphant ?', 'Il barrit'],
      ['Que fait le cerf ?', 'Il brame'],
      ['Que fait la chouette ?', 'Elle hulule (ou chuinte)'],
      ['Que fait le chameau ?', 'Il blatère']
    ]],
    ['improbable', 'Les expressions françaises', [
      ['Que veut dire « avoir un chat dans la gorge » ?', 'Être enroué'],
      ['Que veut dire « poser un lapin » ?', 'Ne pas venir à un rendez-vous'],
      ['Que veut dire « coûter les yeux de la tête » ?', 'Coûter très cher'],
      ['Que veut dire « tomber dans les pommes » ?', 'S\'évanouir'],
      ['Que veut dire « avoir le cafard » ?', 'Être triste, déprimé'],
      ['Que veut dire « faire chou blanc » ?', 'Échouer, ne rien obtenir'],
      ['Que veut dire « être dans de beaux draps » ?', 'Être dans une situation difficile'],
      ['Que veut dire « tirer les vers du nez » à quelqu\'un ?', 'Le faire parler, lui soutirer des informations'],
      ['Que veut dire « peigner la girafe » ?', 'Faire un travail inutile, ne rien faire d\'utile'],
      ['Que veut dire « avoir maille à partir » avec quelqu\'un ?', 'Avoir un différend, une dispute avec lui']
    ]],
    ['improbable', 'Les inventions', [
      ['Qui a mis au point l\'ampoule électrique en 1879 ?', 'Thomas Edison'],
      ['Qu\'a inventé Louis Braille ?', 'Une écriture en relief pour les aveugles'],
      ['Qu\'ont inventé les frères Lumière ?', 'Le cinématographe (le cinéma)'],
      ['Dans quel pays le papier a-t-il été inventé ?', 'La Chine'],
      ['Qu\'a inventé László Bíró ?', 'Le stylo à bille'],
      ['Quel appareil Percy Spencer a-t-il inventé après qu\'une barre chocolatée a fondu dans sa poche ?', 'Le four à micro-ondes'],
      ['Quel Français a inventé une machine à calculer en 1642 ?', 'Blaise Pascal (la Pascaline)'],
      ['Qu\'a inventé Nicéphore Niépce ?', 'La photographie'],
      ['En quelle année Graham Bell a-t-il déposé le brevet du téléphone ?', '1876'],
      ['Qui a inventé le Rubik\'s Cube, et de quelle nationalité était-il ?', 'Ernő Rubik, hongrois (1974)']
    ]],
    ['improbable', 'Les créatures légendaires', [
      ['Quelle créature a une seule corne sur le front ?', 'La licorne'],
      ['Comment s\'appelle le cheval ailé de la mythologie grecque ?', 'Pégase'],
      ['Comment s\'appelle la créature mi-homme, mi-cheval ?', 'Le centaure'],
      ['Comment s\'appelle la créature mi-femme, mi-poisson ?', 'La sirène'],
      ['Quel oiseau renaît de ses cendres ?', 'Le phénix'],
      ['Quel monstre à tête de taureau était enfermé dans le labyrinthe ?', 'Le Minotaure'],
      ['Dans quel pays vivrait le monstre du Loch Ness ?', 'L\'Écosse'],
      ['Combien de têtes avait Cerbère, le chien des Enfers ?', 'Trois'],
      ['Quel héros grec a tranché la tête de Méduse ?', 'Persée'],
      ['Comment s\'appelle la créature mi-aigle, mi-lion ?', 'Le griffon']
    ]],
    ['improbable', 'Les animaux étonnants', [
      ['Quel est le plus grand animal du monde ?', 'La baleine bleue'],
      ['Quel est l\'animal terrestre le plus rapide ?', 'Le guépard'],
      ['Quel mammifère à bec de canard pond des œufs ?', 'L\'ornithorynque'],
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
      ['De quelle couleur sont les Schtroumpfs ?', 'Bleus'],
      ['Comment s\'appelle le lionceau du « Roi lion » ?', 'Simba'],
      ['Quel est le métier de Bob l\'éponge ?', 'Cuisinier (au Crabe croustillant)'],
      ['Comment s\'appelle le bonhomme de neige de « La Reine des neiges » ?', 'Olaf'],
      ['Comment s\'appelle le chat qui poursuit Titi ?', 'Grosminet'],
      ['Dans quelle ville vit la famille Simpson ?', 'Springfield'],
      ['Quel studio japonais a réalisé « Mon voisin Totoro » ?', 'Le studio Ghibli'],
      ['Comment s\'appelle le père de Nemo ?', 'Marin'],
      ['Quel a été le premier long métrage d\'animation de Disney, en 1937 ?', 'Blanche-Neige et les Sept Nains'],
      ['Dans « Il était une fois… la Vie », comment s\'appelle le vieux savant à barbe blanche ?', 'Maestro']
    ]],
    ['plaisir', 'Les jeux vidéo', [
      ['Quel est le métier de Mario ?', 'Plombier'],
      ['Comment s\'appelle le hérisson bleu de Sega ?', 'Sonic'],
      ['Comment s\'appelle le Pokémon jaune de Sacha ?', 'Pikachu'],
      ['Quel jeu consiste à empiler des blocs qui tombent pour faire des lignes ?', 'Tetris'],
      ['Comment s\'appelle la princesse que Mario doit souvent sauver ?', 'Peach'],
      ['Quel jeu de construction en blocs cubiques est le plus vendu de l\'histoire ?', 'Minecraft'],
      ['Comment s\'appelle le héros de « The Legend of Zelda » ?', 'Link'],
      ['En quelle année la première PlayStation est-elle sortie au Japon ?', '1994'],
      ['Comment s\'appelle le fantôme rouge de Pac-Man ?', 'Blinky'],
      ['Quel Français a créé le personnage de Rayman ?', 'Michel Ancel']
    ]],
    ['plaisir', 'La chanson française', [
      ['Qui chante « La Vie en rose » ?', 'Édith Piaf'],
      ['De quel pays vient Céline Dion ?', 'Du Canada (Québec)'],
      ['Qui chante « Alors on danse » ?', 'Stromae'],
      ['Qui a écrit et chanté « Ne me quitte pas » ?', 'Jacques Brel'],
      ['Qui chante « Les Champs-Élysées » ?', 'Joe Dassin'],
      ['Quel groupe chante « L\'Aventurier » ?', 'Indochine'],
      ['Quel chanteur a sorti l\'album « Histoire de Melody Nelson » ?', 'Serge Gainsbourg'],
      ['Quel est le vrai nom de Johnny Hallyday ?', 'Jean-Philippe Smet'],
      ['Qui chante « La Bohème » (1965) ?', 'Charles Aznavour'],
      ['Qui a composé « Comme d\'habitude », devenue « My Way » ?', 'Claude François et Jacques Revaux']
    ]],
    ['plaisir', 'Le cinéma', [
      ['Quel petit extraterrestre veut « téléphoner maison » ?', 'E.T.'],
      ['Quel acteur joue Jack dans « Titanic » ?', 'Leonardo DiCaprio'],
      ['Qui a réalisé « Jurassic Park » ?', 'Steven Spielberg'],
      ['Dans quel film de 2011 jouent Omar Sy et François Cluzet ?', 'Intouchables'],
      ['Combien de films compte la saga Harry Potter ?', 'Huit'],
      ['Dans quel quartier de Paris vit Amélie Poulain ?', 'Montmartre'],
      ['Dans « Bienvenue chez les Ch\'tis », dans quelle ville est muté Philippe ?', 'Bergues'],
      ['Quel est le prénom du chef d\'orchestre joué par Louis de Funès dans « La Grande Vadrouille » ?', 'Stanislas (Lefort)'],
      ['Qui a réalisé « Les Parapluies de Cherbourg » ?', 'Jacques Demy'],
      ['Quel est le titre du premier film des frères Lumière, en 1895 ?', 'La Sortie de l\'usine Lumière à Lyon']
    ]],
    ['plaisir', 'Le chocolat et les desserts', [
      ['Avec quelle graine fait-on le chocolat ?', 'La fève de cacao'],
      ['Quel dessert italien mêle biscuits au café et mascarpone ?', 'Le tiramisu'],
      ['De quel pays vient la forêt-noire ?', 'L\'Allemagne'],
      ['Quelle crêpe flambée est parfumée à l\'orange ?', 'La crêpe Suzette'],
      ['Comment s\'appelle la pyramide de choux servie aux mariages ?', 'La pièce montée (le croquembouche)'],
      ['Quel ingrédient du cacao est à la base du chocolat blanc ?', 'Le beurre de cacao'],
      ['Quel pays est le premier producteur mondial de cacao ?', 'La Côte d\'Ivoire'],
      ['Quel peuple d\'Amérique buvait le cacao en boisson épicée, le « xocolatl » ?', 'Les Aztèques (et avant eux les Mayas)'],
      ['Dans quelle commune serait née la tarte Tatin ?', 'Lamotte-Beuvron'],
      ['Quel pâtissier a créé l\'Ispahan (rose, litchi, framboise) ?', 'Pierre Hermé']
    ]],
    ['plaisir', 'Le football', [
      ['Combien de joueurs compte une équipe sur le terrain ?', 'Onze'],
      ['Quel pays a gagné la Coupe du monde 2018 ?', 'La France'],
      ['Combien de minutes dure un match, hors prolongations ?', '90 minutes'],
      ['Qui est surnommé « Zizou » ?', 'Zinédine Zidane'],
      ['Quel pays a gagné le plus de Coupes du monde ?', 'Le Brésil (5)'],
      ['En quelle année la France a-t-elle gagné sa première Coupe du monde ?', '1998'],
      ['Quel club joue au Parc des Princes ?', 'Le Paris Saint-Germain'],
      ['Quel joueur a remporté le plus de Ballons d\'or ?', 'Lionel Messi'],
      ['Quel club français a remporté la Ligue des champions en 1993 ?', 'L\'Olympique de Marseille'],
      ['Dans quel pays s\'est jouée la toute première Coupe du monde, en 1930 ?', 'L\'Uruguay']
    ]],
    ['plaisir', 'Les séries', [
      ['Dans quelle série d\'animation suit-on une famille toute jaune ?', 'Les Simpson'],
      ['Quelle série espagnole raconte un braquage de la Fabrique nationale de la monnaie ?', 'La casa de papel'],
      ['Dans quelle série coréenne des joueurs endettés participent-ils à des jeux mortels ?', 'Squid Game'],
      ['Dans « Game of Thrones », comment s\'appelle le trône que tous convoitent ?', 'Le Trône de fer'],
      ['Qui a créé « Kaamelott » et y joue le roi Arthur ?', 'Alexandre Astier'],
      ['Dans « Friends », comment s\'appelle le café où se retrouvent les amis ?', 'Le Central Perk'],
      ['Quel est le prénom du professeur de chimie de « Breaking Bad » ?', 'Walter (White)'],
      ['Quel est le prénom du docteur House ?', 'Gregory'],
      ['Combien de saisons compte « Friends » ?', 'Dix'],
      ['Qui a créé la série « Les Soprano » ?', 'David Chase']
    ]],
    ['plaisir', 'La cuisine du monde', [
      ['De quel pays vient la pizza ?', 'L\'Italie'],
      ['Quel est l\'ingrédient principal du guacamole ?', 'L\'avocat'],
      ['De quel pays viennent les sushis ?', 'Le Japon'],
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
      ['Dans quelle région produit-on le champagne ?', 'En Champagne'],
      ['Comment appelle-t-on le spécialiste qui conseille les vins au restaurant ?', 'Le sommelier'],
      ['Quel jour sort le beaujolais nouveau ?', 'Le troisième jeudi de novembre'],
      ['Quel cépage rouge est roi en Bourgogne ?', 'Le pinot noir'],
      ['Dans quelle grande région viticole produit-on le sauternes ?', 'Le Bordelais (Bordeaux)'],
      ['Comment s\'appelle la science du vin ?', 'L\'œnologie'],
      ['Comment s\'appelle une bouteille de 1,5 litre ?', 'Un magnum'],
      ['Quel insecte a ravagé les vignes françaises au XIXe siècle ?', 'Le phylloxéra'],
      ['Combien de litres contient un jéroboam de champagne ?', '3 litres'],
      ['À quel moine bénédictin attribue-t-on (par légende) l\'invention du champagne ?', 'Dom Pérignon']
    ]],
    ['mature', 'L\'argent et les impôts', [
      ['Quelle est la monnaie de la France ?', 'L\'euro'],
      ['Que veut dire le sigle TVA ?', 'Taxe sur la valeur ajoutée'],
      ['Quel est le taux normal de la TVA en France ?', '20 %'],
      ['Comment s\'appelle l\'impôt payé chaque année par les propriétaires d\'un logement ?', 'La taxe foncière'],
      ['En quelle année les pièces et billets en euros sont-ils arrivés ?', '2002'],
      ['Que veut dire le sigle SMIC ?', 'Salaire minimum interprofessionnel de croissance'],
      ['Combien de francs valait un euro (au centime près) ?', '6,56 francs (6,55957)'],
      ['Quelle institution fixe les taux directeurs de la zone euro ?', 'La Banque centrale européenne (BCE)'],
      ['Dans quelle ville siège la Banque centrale européenne ?', 'Francfort'],
      ['Quel impôt a remplacé l\'ISF en 2018 ?', 'L\'impôt sur la fortune immobilière (IFI)']
    ]],
    ['mature', 'La voiture', [
      ['De quelle couleur est le feu qui oblige à s\'arrêter ?', 'Rouge'],
      ['Quelle est la vitesse maximale sur autoroute par temps sec en France ?', '130 km/h'],
      ['Que signale le « A » rouge à l\'arrière d\'une voiture ?', 'Un jeune conducteur (permis probatoire)'],
      ['Quelle marque automobile a un lion pour logo ?', 'Peugeot'],
      ['Combien de points compte un permis de conduire définitif ?', '12 points'],
      ['Avec combien de points démarre un permis probatoire ?', '6 points'],
      ['Quel est le taux d\'alcool maximal pour un conducteur confirmé, en grammes par litre de sang ?', '0,5 g/l'],
      ['Tous les combien doit-on passer le contrôle technique d\'une voiture de plus de 4 ans ?', 'Tous les 2 ans'],
      ['Que fait le système ABS ?', 'Il empêche les roues de se bloquer au freinage'],
      ['Quel frère a fondé Renault en 1899, avec Marcel et Fernand ?', 'Louis Renault']
    ]],
    ['mature', 'La maison et le bricolage', [
      ['Avec quel outil enfonce-t-on un clou ?', 'Un marteau'],
      ['Avec quel outil serre-t-on un écrou ?', 'Une clé (plate, à molette…)'],
      ['À quoi sert un niveau à bulle ?', 'À vérifier qu\'une surface est bien horizontale (ou verticale)'],
      ['En quelle unité mesure-t-on la puissance d\'une ampoule ?', 'En watts'],
      ['Quelle scie électrique permet de découper le bois en courbe ?', 'La scie sauteuse'],
      ['Que veut dire DPE, dans une annonce immobilière ?', 'Diagnostic de performance énergétique'],
      ['Quelle est la tension du courant électrique dans une maison en France ?', '230 volts'],
      ['À quoi sert un disjoncteur différentiel ?', 'À couper le courant en cas de fuite électrique (il protège les personnes)'],
      ['Que veut dire VMC ?', 'Ventilation mécanique contrôlée'],
      ['Comment s\'appelle l\'empreinte de vis en étoile à six branches ?', 'Torx']
    ]],
    ['mature', 'Le mariage et la vie à deux', [
      ['À quel doigt porte-t-on l\'alliance en France ?', 'À l\'annulaire (gauche)'],
      ['Où se célèbre un mariage civil en France ?', 'À la mairie'],
      ['Que veut dire PACS ?', 'Pacte civil de solidarité'],
      ['Comment appelle-t-on les 25 ans de mariage ?', 'Les noces d\'argent'],
      ['Comment appelle-t-on les 50 ans de mariage ?', 'Les noces d\'or'],
      ['Comment appelle-t-on la première année de mariage ?', 'Les noces de coton'],
      ['En quelle année le PACS a-t-il été créé ?', '1999'],
      ['Quelle ministre a donné son nom à la loi de 2013 ouvrant le mariage aux couples de même sexe ?', 'Christiane Taubira'],
      ['Combien faut-il de témoins au minimum pour un mariage civil en France ?', 'Deux (quatre au plus)'],
      ['Combien de jours au moins doit durer la publication des bans avant un mariage ?', 'Dix jours']
    ]],
    ['mature', 'Le travail', [
      ['Combien de jours dure une semaine de travail classique, du lundi au vendredi ?', 'Cinq'],
      ['Quelle est la durée légale du travail par semaine en France ?', '35 heures'],
      ['Que veut dire CDI ?', 'Contrat à durée indéterminée'],
      ['Combien de semaines de congés payés a-t-on par an en France ?', 'Cinq'],
      ['Que veut dire RTT ?', 'Réduction du temps de travail'],
      ['Quelle fête célèbre-t-on le 1er mai ?', 'La fête du Travail'],
      ['Quel nom Pôle emploi a-t-il pris en 2024 ?', 'France Travail'],
      ['Quelle ministre a donné son nom à la loi des 35 heures ?', 'Martine Aubry'],
      ['En quelle année les congés payés sont-ils apparus en France ?', '1936 (Front populaire)'],
      ['Quelle est la durée maximale de la période d\'essai d\'un cadre en CDI, sans renouvellement ?', 'Quatre mois']
    ]],
    ['mature', 'L\'apéro et les cocktails', [
      ['Quel alcool est à la base du mojito ?', 'Le rhum'],
      ['Quelle boisson anisée est typique de Marseille ?', 'Le pastis'],
      ['Le kir, c\'est du vin blanc et… ?', 'De la crème de cassis'],
      ['Quel alcool mexicain est tiré de l\'agave ?', 'La tequila'],
      ['Quel apéritif orange est le plus utilisé dans le spritz ?', 'L\'Apérol'],
      ['Le Bloody Mary, c\'est de la vodka et du jus de… ?', 'Tomate'],
      ['Dans le kir royal, par quoi remplace-t-on le vin blanc ?', 'Par du champagne'],
      ['La piña colada, c\'est du rhum, de l\'ananas et… ?', 'De la crème de coco'],
      ['Quel cocktail James Bond commande-t-il « au shaker, pas à la cuillère » ?', 'Un vodka martini'],
      ['Le daïquiri porte le nom d\'un lieu de quel pays ?', 'Cuba']
    ]],
    ['mature', 'Les papiers et démarches', [
      ['Quel document officiel prouve son identité en France ?', 'La carte d\'identité (ou le passeport)'],
      ['Où déclare-t-on une naissance ?', 'À la mairie'],
      ['De quelle couleur est la carte Vitale ?', 'Verte (et jaune)'],
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
      ['Quelle est la date de la prise de la Bastille ?', 'Le 14 juillet 1789'],
      ['Quel roi était surnommé le Roi-Soleil ?', 'Louis XIV'],
      ['Quel empereur a perdu la bataille de Waterloo ?', 'Napoléon Ier'],
      ['Qui fut le premier président de la Ve République ?', 'Charles de Gaulle'],
      ['Quel roi a été guillotiné en 1793 ?', 'Louis XVI'],
      ['Quelle héroïne a délivré Orléans en 1429 ?', 'Jeanne d\'Arc'],
      ['Quelle bataille est associée à l\'année 1515 ?', 'Marignan'],
      ['En quelle année les Françaises ont-elles voté pour la première fois ?', '1945 (droit de vote accordé en 1944)'],
      ['Quelle dynastie a succédé aux Mérovingiens ?', 'Les Carolingiens'],
      ['En quelle année l\'ordonnance de Villers-Cotterêts a-t-elle imposé le français dans les actes officiels ?', '1539']
    ]],
    ['scolaire', 'La géographie', [
      ['Quelle est la capitale de l\'Italie ?', 'Rome'],
      ['Quel est le plus grand océan du monde ?', 'L\'océan Pacifique'],
      ['Quel est le plus haut sommet des Alpes ?', 'Le mont Blanc'],
      ['Quel est le plus long fleuve de France ?', 'La Loire'],
      ['Quel est le plus petit pays du monde ?', 'Le Vatican'],
      ['Quelle est la capitale du Canada ?', 'Ottawa'],
      ['Quelle est la capitale de l\'Australie ?', 'Canberra'],
      ['Combien la France compte-t-elle de départements, outre-mer compris ?', '101'],
      ['Quel est le pays le plus peuplé du monde ?', 'L\'Inde (devant la Chine depuis 2023)'],
      ['Quelle est la capitale du Kazakhstan ?', 'Astana']
    ]],
    ['scolaire', 'La langue française', [
      ['Combien de lettres compte l\'alphabet ?', '26'],
      ['Combien de voyelles compte l\'alphabet ?', 'Six : a, e, i, o, u, y'],
      ['Quel est le pluriel de « cheval » ?', 'Chevaux'],
      ['Quel est le féminin d\'« acteur » ?', 'Actrice'],
      ['Comment s\'appelle le petit signe sous le c de « ç » ?', 'La cédille'],
      ['Quel est le participe passé de « résoudre » ?', 'Résolu'],
      ['Comment appelle-t-on un mot qui se lit pareil dans les deux sens, comme « radar » ?', 'Un palindrome'],
      ['Quelle figure de style réunit deux mots contraires, comme « cette obscure clarté » ?', 'L\'oxymore'],
      ['Conjuguez « croire » au subjonctif présent, avec « nous ».', 'Que nous croyions'],
      ['Quel est le féminin de l\'adjectif « hébreu » ?', 'Hébraïque']
    ]],
    ['scolaire', 'Les mathématiques', [
      ['Combien de côtés a un hexagone ?', 'Six'],
      ['Combien de degrés mesure un angle droit ?', '90 degrés'],
      ['Combien font 7 × 8 ?', '56'],
      ['Quelle est la racine carrée de 144 ?', '12'],
      ['Combien vaut la somme des angles d\'un triangle ?', '180 degrés'],
      ['Quel théorème dit que, dans un triangle rectangle, a² + b² = c² ?', 'Le théorème de Pythagore'],
      ['Combien vaut π, arrondi au centième ?', '3,14'],
      ['Combien de zéros compte un milliard ?', 'Neuf'],
      ['Quelle est la formule de l\'aire d\'un disque ?', 'π × r² (pi fois le rayon au carré)'],
      ['Combien vaut « factorielle zéro » (0!) ?', '1']
    ]],
    ['scolaire', 'Le corps humain', [
      ['Quel organe pompe le sang ?', 'Le cœur'],
      ['Combien de dents a un adulte (dents de sagesse comprises) ?', '32'],
      ['Comment s\'appelle l\'os de la cuisse ?', 'Le fémur'],
      ['Quel est le plus grand organe du corps ?', 'La peau'],
      ['Quelles cellules du sang transportent l\'oxygène ?', 'Les globules rouges (hématies)'],
      ['Combien de litres de sang un adulte a-t-il environ ?', 'Environ 5 litres'],
      ['Quel groupe sanguin est « donneur universel » ?', 'O négatif'],
      ['Quel organe produit l\'insuline ?', 'Le pancréas'],
      ['Combien d\'os compte le squelette d\'un adulte ?', '206'],
      ['Comment s\'appelle le plus petit os du corps, dans l\'oreille ?', 'L\'étrier']
    ]],
    ['scolaire', 'Les sciences', [
      ['Quelle est la formule chimique de l\'eau ?', 'H₂O'],
      ['À quelle température l\'eau bout-elle, au niveau de la mer ?', '100 °C'],
      ['Combien de planètes compte le système solaire ?', 'Huit'],
      ['Quelle est la plus grosse planète du système solaire ?', 'Jupiter'],
      ['Quelle est la planète la plus proche du Soleil ?', 'Mercure'],
      ['Quel est le symbole chimique de l\'or ?', 'Au'],
      ['Qui a découvert la pénicilline ?', 'Alexander Fleming'],
      ['Quel est le symbole chimique du fer ?', 'Fe'],
      ['Quelle est la vitesse de la lumière, environ ?', 'Environ 300 000 km par seconde'],
      ['Combien d\'éléments compte le tableau périodique aujourd\'hui ?', '118']
    ]],
    ['scolaire', 'La littérature', [
      ['Qui a écrit « Harry Potter » ?', 'J. K. Rowling'],
      ['Qui a écrit « Le Petit Prince » ?', 'Antoine de Saint-Exupéry'],
      ['Qui a écrit les « Fables », dont « Le Corbeau et le Renard » ?', 'Jean de La Fontaine'],
      ['Qui a écrit « Les Misérables » ?', 'Victor Hugo'],
      ['Qui a écrit « Le Tour du monde en quatre-vingts jours » ?', 'Jules Verne'],
      ['Qui a écrit « Les Trois Mousquetaires » ?', 'Alexandre Dumas'],
      ['Quel était le vrai nom de Molière ?', 'Jean-Baptiste Poquelin'],
      ['Qui a écrit « L\'Étranger » ?', 'Albert Camus'],
      ['Qui a écrit « À la recherche du temps perdu » ?', 'Marcel Proust'],
      ['Qui a écrit « Les Liaisons dangereuses » ?', 'Choderlos de Laclos']
    ]],
    ['scolaire', 'L\'anglais', [
      ['Que veut dire « hello » ?', 'Bonjour'],
      ['Comment dit-on « merci » en anglais ?', 'Thank you'],
      ['Que veut dire « dog » ?', 'Chien'],
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

  return { THEMES: THEMES, ORDRE_THEMES: ORDRE_THEMES, SUJETS: SUJETS, CHALLENGES: CHALLENGES, SURPRISES: SURPRISES, DEPARTS: DEPARTS,
           LONGUEURS: LONGUEURS, NIVEAU_FINAL: NIVEAU_FINAL, plateau: plateau, tirerSujet: tirerSujet, tirer: tirer, sujet: sujet, melanger: melanger };
})();
if (typeof module !== 'undefined') module.exports = DX;
