// ================== « Combien sur 10 ? » : sujets supplémentaires, en texte simple ==================
// Un sujet : « # thème | nom », puis 10 lignes « question | réponse », du niveau 1 au niveau 10.
// Barème : 1-3 pour rire, 4-7 culture courante, 8 amateur éclairé, 9 passionné, 10 vrai spécialiste.
// Toujours ajouter à la fin : l'identifiant d'un sujet dépend de sa position.
var DX_QUESTIONS = `
# improbable | Le petit coin
Que cherche-t-on désespérément quand le rouleau est vide ? | Du papier toilette
Dans quelle pièce peut-on lire tranquille tant que personne ne frappe à la porte ? | Les toilettes
Que tire-t-on (normalement) avant de sortir ? | La chasse d'eau
Que veut dire WC ? | Water closet
Quel pays est célèbre pour ses toilettes chauffantes à télécommande ? | Le Japon
Comment appelle-t-on les anciens urinoirs publics, du nom d'un empereur romain ? | Les vespasiennes
Quel empereur romain aurait dit « l'argent n'a pas d'odeur » à propos d'une taxe sur l'urine ? | Vespasien
Quel plombier anglais, au nom prédestiné, a popularisé la chasse d'eau au XIXe siècle ? | Thomas Crapper
Quel filleul d'Élisabeth Ire a conçu une chasse d'eau dès 1596 ? | John Harington
Quel préfet a donné son nom aux colonnes-urinoirs installées à Paris dans les années 1830 ? | Le comte de Rambuteau
# improbable | Les morts insolites
Quel objet tombe toujours sur la tête de Vil Coyote ? | Une enclume
Quel fruit empoisonné envoie Blanche-Neige au tapis ? | Une pomme
Quel chanteur français a voulu redresser une applique sous sa douche, en 1978 ? | Claude François
Quel roi de France a été mortellement blessé lors d'un tournoi, en 1559 ? | Henri II
Sur quelle scène Molière a-t-il eu son dernier malaise, le soir de sa mort ? | Au théâtre, en jouant « Le Malade imaginaire »
Quel président français est mort à l'Élysée en 1899, en galante compagnie ? | Félix Faure
Quelle danseuse a été étranglée par son écharpe prise dans une roue de voiture, à Nice ? | Isadora Duncan
Quel dramaturge grec aurait été tué par une tortue lâchée par un aigle ? | Eschyle
Quel savant aurait pris froid en farcissant un poulet de neige pour le conserver ? | Francis Bacon
Quel astronome danois serait mort d'une vessie éclatée, par politesse à un banquet ? | Tycho Brahe
# improbable | Les jurons du capitaine Haddock
Quelle boisson le capitaine préfère-t-il nettement à l'eau ? | Le whisky
« Tonnerre de… » quoi ? | Brest
« Mille… » quoi ? | Sabords
« Ectoplasme à… » quoi ? | Roulettes
Dans quel château le capitaine finit-il par s'installer ? | Moulinsart
Quelle est sa marque de whisky préférée ? | Loch Lomond
Qu'était à l'origine un bachi-bouzouk ? | Un soldat irrégulier de l'Empire ottoman
Qu'est-ce qu'un sabord, exactement ? | Une ouverture dans le flanc d'un navire, pour les canons
Qu'est-ce qu'une anacoluthe, que le capitaine prend pour une injure ? | Une rupture de construction dans une phrase
Quelle dispute de marché, avec l'injure « espèce de… », aurait donné à Hergé l'idée de ces jurons ? | « Espèce de Pacte à quatre ! »
# improbable | Les communes au drôle de nom
Quelle commune de la Somme tient en une seule lettre ? | Y
Quelle ancienne commune du Loir-et-Cher promet une fin de soirée difficile ? | Bourré
Quelle ville du Nord a servi de décor à « Bienvenue chez les Ch'tis » ? | Bergues
Quelle ville est connue pour sa moutarde ? | Dijon
Quelle ville du Gers a un nom qui fait sourire les Anglais ? | Condom
Dans quel département se trouve Sexey-les-Bois ? | La Meurthe-et-Moselle
Quelle commune de Haute-Marne, composée, a l'un des plus longs noms de France ? | Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson
Quelle commune de la Drôme est souvent citée comme la moins peuplée de France ? | Rochefourchat
Quelle commune de la Meuse, détruite en 1916, n'a plus d'habitants mais garde un maire ? | Fleury-devant-Douaumont
Quel département compte le plus de communes en France ? | Le Pas-de-Calais
# improbable | Les bêtes moches
Quel animal verdâtre attend un baiser de princesse ? | Le crapaud
Quel poisson gélatineux a été élu animal le plus moche du monde ? | Le blobfish
Quel petit mammifère aveugle creuse des galeries sous votre pelouse ? | La taupe
Quel oiseau charognard a le cou déplumé ? | Le vautour
Quel animal a un nez en forme de petite trompe et vit en Amazonie ? | Le tapir
Quel singe d'Asie a un énorme nez pendant ? | Le nasique
Sur quelle île vit l'aye-aye ? | Madagascar
À quoi sert le long doigt majeur de l'aye-aye ? | À sonder et extraire les larves dans le bois
Quel rongeur africain, presque sans poils, vit en colonie autour d'une seule reine ? | Le rat-taupe nu
Quel est le nom scientifique du blobfish ? | Psychrolutes marcidus
# improbable | Les sports bizarres
Quel sport fait balayer de la glace avec acharnement ? | Le curling
Dans quel sport des géants en petite tenue se poussent-ils hors d'un cercle ? | Le sumo
Quel sport de Harry Potter se joue pour de vrai, un balai entre les jambes ? | Le quidditch
Quel sport alterne rounds d'échecs et rounds de boxe ? | Le chess-boxing (ou échecs-boxe)
Quel produit laitier poursuit-on en dévalant une colline à Gloucester ? | Un fromage (le double gloucester)
Quel pays organise le championnat du monde de porter de femme ? | La Finlande
Quelle épreuve de force par équipes a été olympique jusqu'en 1920 ? | Le tir à la corde
Quel sport d'Asie du Sud-Est ressemble à du volley joué avec les pieds ? | Le sepak takraw
Dans quel pays le hurling est-il un sport national ? | L'Irlande
Dans quelle ville de l'Hérault la joute nautique est-elle une tradition depuis 1666 ? | Sète
# improbable | La nourriture douteuse
Quel animal français mange-t-on au beurre persillé, coquille comprise dans l'assiette ? | L'escargot
Quelles cuisses les Anglais nous reprochent-ils de manger ? | Les cuisses de grenouille
Quelle charcuterie à l'odeur intense est faite de tripes ? | L'andouillette
Quelle pâte à tartiner salée divise tous les Britanniques ? | La Marmite
Quelle panse de brebis farcie est le plat national écossais ? | Le haggis
De quel pays viennent les graines de soja fermentées et gluantes, le natto ? | Le Japon
Dans quel pays mange-t-on le balut, un œuf de cane couvé ? | Les Philippines
De quelle île vient le casu marzu, fromage aux asticots vivants ? | La Sardaigne
Quel animal de compagnie chez nous est un plat traditionnel au Pérou, sous le nom de cuy ? | Le cochon d'Inde
Quel poison rend le fugu mortel s'il est mal préparé ? | La tétrodotoxine
# plaisir | Kaamelott
Quel roi cherche le Graal, entouré d'incapables ? | Arthur
Quel chevalier répond « c'est pas faux » quand il n'a rien compris ? | Perceval
Quel objet sacré doivent-ils trouver ? | Le Graal
Qui a créé la série ? | Alexandre Astier
Sur quelle chaîne a-t-elle été diffusée ? | M6
Quel chevalier ne pense qu'à manger ? | Karadoc
Comment s'appelle la reine, épouse d'Arthur ? | Guenièvre
Quel acteur joue Perceval ? | Franck Pitiot
Quel acteur joue Léodagan ? | Lionnel Astier
Quel acteur joue Karadoc ? | Jean-Christophe Hembert
# plaisir | Les Bronzés
Quel séducteur raté croit pouvoir conclure « sur un malentendu » ? | Jean-Claude Dusse
À quel sport se rendent-ils dans le deuxième film ? | Le ski
Quelle liqueur maison, à base de légume, le vieux montagnard fait-il goûter dans le film au ski ? | Une liqueur d'échalote
De quelle troupe viennent les acteurs ? | Le Splendid
Qui a réalisé les films ? | Patrice Leconte
Quel acteur joue Jérôme, le médecin ? | Christian Clavier
Quel acteur joue Bernard Morin ? | Gérard Jugnot
En quelle année est sorti le premier film ? | 1978
Dans quelle station a été tourné « Les Bronzés font du ski » ? | Val d'Isère
Dans quel pays se déroule le premier film ? | La Côte d'Ivoire
# plaisir | Louis de Funès
Quel métier exerce-t-il à Saint-Tropez ? | Gendarme
Quelle soupe attire un extraterrestre chez lui ? | La soupe aux choux
Avec quel acteur partage-t-il « La Soupe aux choux » et ses concours de pets ? | Jean Carmet
Sous quel nom de rabbin se déguise-t-il ? | Rabbi Jacob
Avec quel acteur partage-t-il « La Grande Vadrouille » ? | Bourvil
Comment s'appelle son gendarme ? | Ludovic Cruchot
Avec quel humoriste tourne-t-il « L'Aile ou la Cuisse » ? | Coluche
Quel acteur joue Fantômas face à lui ? | Jean Marais
Qui a réalisé « La Grande Vadrouille » ? | Gérard Oury
Quelle fleur cultivait-il avec passion dans son château de Clermont ? | La rose
# plaisir | OSS 117
Quel acteur français joue l'espion ? | Jean Dujardin
Quel plat demande-t-il à goûter : « Comment est votre… » ? | Blanquette
Quel est le nom complet de l'espion ? | Hubert Bonisseur de La Bath
Dans quelle ville se déroule le premier film ? | Le Caire
Dans quelle ville se déroule le deuxième film ? | Rio de Janeiro
Qui a réalisé les deux premiers films ? | Michel Hazanavicius
Quelle actrice joue Larmina dans le premier film ? | Bérénice Bejo
Quel romancier a créé le personnage ? | Jean Bruce
En quelle année est sorti « Le Caire, nid d'espions » ? | 2006
Quelle société sert de couverture à l'espion au Caire ? | La Société cairote d'élevage de poulets (SCEP)
# plaisir | Les Simpson
De quelle couleur est la peau de la famille ? | Jaune
Quel garnement écrit des punitions sur le tableau noir ? | Bart
Quelle pâtisserie fait baver Homer ? | Le donut
Dans quelle ville vivent-ils ? | Springfield
Qui a créé la série ? | Matt Groening
Quel milliardaire dirige la centrale nucléaire ? | Monsieur Burns
Qui tient le Kwik-E-Mart ? | Apu
Quel comédien double Homer en français ? | Philippe Peythieu
Quelle comédienne double Marge en français ? | Véronique Augereau
Dans quelle émission les Simpson sont-ils apparus d'abord, en 1987 ? | The Tracey Ullman Show
# plaisir | Les slogans de pub
Qu'est-ce que la marque Haribo rend beau, pour les grands et les petits ? | La vie
Quelle marque répète « Just do it » ? | Nike
Quelle marque dit « parce que je le vaux bien » ? | L'Oréal
Quelle marque disait « Think different » ? | Apple
Quelle boisson « donne des ailes » ? | Red Bull
Quelle boisson disait « Quand c'est trop, c'est… » ? | Tropico
Quelle cause répétait « Un verre ça va, trois verres, bonjour les dégâts » ? | La sécurité routière
Quel publicitaire a dit que si à 50 ans on n'a pas de Rolex, on a raté sa vie ? | Jacques Séguéla
Quel affichiste a signé la campagne « Dubo, Dubon, Dubonnet » ? | Cassandre
Quel dessinateur a créé Bibendum, le bonhomme Michelin ? | O'Galop (Marius Rossillon)
# plaisir | Les tubes de l'été
Quelle danse espagnole de 1996 oblige à poser les mains sur ses hanches ? | La Macarena
Quel Sud-Coréen a fait danser la planète à cheval, en 2012 ? | Psy (« Gangnam Style »)
Quel groupe espagnol a chanté « The Ketchup Song » ? | Las Ketchup
Quel groupe a fait danser la lambada en 1989 ? | Kaoma
Qui chante « Despacito » avec Daddy Yankee ? | Luis Fonsi
Quel groupe français de rap celtique a chanté « La Tribu de Dana » ? | Manau
Quel groupe antillais a chanté « Maldòn » ? | Zouk Machine
De quel pays vient le groupe Los Kjarkas, auteur de la mélodie originale de la lambada ? | La Bolivie
Comment s'appelle la chanson originale de Los Kjarkas devenue la lambada ? | Llorando se fue
Quel duo espagnol a chanté la Macarena ? | Los del Río
# plaisir | Pokémon
Quelle souris jaune fait des étincelles ? | Pikachu
Quel jeune dresseur veut devenir maître Pokémon ? | Sacha
Dans quoi capture-t-on un Pokémon ? | Une Poké Ball
Quel Pokémon de feu est un des trois de départ de la première génération ? | Salamèche
Comment s'appelle l'équipe de Jessie et James ? | La Team Rocket
Combien de Pokémon compte la première génération ? | 151
Sur quelle console sont sortis les premiers jeux ? | La Game Boy
Qui a créé Pokémon ? | Satoshi Tajiri
Quel programmeur a ajouté Mew en secret dans les premiers jeux ? | Shigeki Morimoto
Quelle collection d'enfance a inspiré Pokémon à son créateur ? | La chasse aux insectes
# plaisir | Les jeux télé
Quel animateur disait « Top ! » dans « Questions pour un champion » ? | Julien Lepers
Sur quel fort cherche-t-on des clés avec le père Fouras ? | Fort Boyard
Qui présente « N'oubliez pas les paroles » ? | Nagui
Qui présente « Les 12 coups de midi » ? | Jean-Luc Reichmann
Quelle émission fait trouver un compte et un mot ? | Des chiffres et des lettres
Quel animateur faisait hurler « Intervilles » ? | Guy Lux
Quel arbitre des chiffres a marqué « Des chiffres et des lettres » ? | Bertrand Renard
Qui a créé « Des chiffres et des lettres » ? | Armand Jammot
Quel cruciverbiste a été l'arbitre historique des lettres ? | Max Favalelli
En quelle année « Intervilles » a-t-elle été diffusée pour la première fois ? | 1962
# mature | Les années 80
Quel petit cube coloré a rendu fou tout le monde ? | Le Rubik's Cube
Quel baladeur Sony permet d'écouter des cassettes dans la rue ? | Le Walkman
Quel service français faisait « 3615 » sur un petit écran ? | Le Minitel
Quel classement des ventes est lancé par Canal+ en 1984 ? | Le Top 50
Quel album de Michael Jackson sort fin 1982 ? | Thriller
Quel mur tombe en 1989 ? | Le mur de Berlin
Quelle animatrice a donné son nom à un club pour enfants sur TF1 ? | Dorothée
Quelle « Ulla » hantait les publicités du Minitel rose ? | 3615 Ulla
Quel réalisateur a tourné la pub « 1984 » du Macintosh ? | Ridley Scott
Quel chanteur est mort dans un accident d'hélicoptère en 1986, avec Thierry Sabine ? | Daniel Balavoine
# mature | Noël en famille
Sur quel véhicule voyage le père Noël ? | Un traîneau
Comment s'appelle le renne au nez rouge ? | Rudolph
Quel gâteau roulé imite un morceau de bois ? | La bûche
Quel oiseau finit traditionnellement aux marrons ? | La dinde
Qui a popularisé « Petit Papa Noël » ? | Tino Rossi
Quelle marque de soda a popularisé le père Noël en rouge ? | Coca-Cola
Quel saint a inspiré le personnage ? | Saint Nicolas
De quelle troupe vient « Le père Noël est une ordure » ? | Le Splendid
De quel pays vient le chant dont « Mon beau sapin » est l'adaptation ? | L'Allemagne (« O Tannenbaum »)
Quelle ville suédoise dresse chaque année un bouc de paille géant, souvent incendié ? | Gävle
# improbable | Les trombones de bureau
Un trombone de bureau sert-il surtout à jouer dans une fanfare ? | Non, à tenir des feuilles
Quel instrument à coulisse porte le même nom ? | Le trombone
Quelle petite trappe de téléphone ouvre-t-on avec un trombone déplié ? | Le tiroir de la carte SIM
En quel métal est fait un trombone classique ? | L'acier
Comment s'appelait le trombone à gros yeux qui proposait son aide dans Word ? | Clippy
Dans quelle suite de logiciels sévissait-il ? | Microsoft Office
Dans quel pays des gens ont-ils porté un trombone au revers de leur veste pour narguer l'occupant, en 1940 ? | La Norvège
Quel Norvégien est souvent présenté, à tort, comme l'inventeur du trombone ? | Johan Vaaler
Quel Canadien a échangé un trombone rouge, de troc en troc, jusqu'à obtenir une maison ? | Kyle MacDonald
Quelle entreprise britannique a donné son nom au modèle classique à double boucle ? | Gem
# improbable | Les chaussettes
Combien de chaussettes met-on en général à chaque pied ? | Une
Quel appareil ménager est soupçonné d'en manger une sur deux ? | Le lave-linge
Avec quelles chaussures le port de chaussettes déclenche-t-il des moqueries ? | Les sandales
Où les enfants suspendent-ils de grandes chaussettes à Noël, dans les films américains ? | À la cheminée
Quel elfe de maison est libéré grâce à une chaussette ? | Dobby
Que veut dire « laisser tomber comme une vieille chaussette » ? | Abandonner sans égards
Quelle ville française est la capitale historique de la bonneterie ? | Troyes
Quelle fibre synthétique lancée par DuPont a fait fureur dans les bas à partir de 1939 ? | Le nylon
Quel pasteur anglais a inventé le métier à tricoter les bas, en 1589 ? | William Lee
Combien mesure un point de pointure française ? | Deux tiers de centimètre (6,67 mm)
# improbable | Le ruban adhésif
Peut-on réparer un avion de ligne uniquement avec du scotch de bureau ? | Non
Comment appelle-t-on familièrement le ruban adhésif transparent en France ? | Le scotch
Que cherche-t-on à l'ongle pendant dix minutes sur un rouleau neuf ? | Le début du ruban
Quel ruban gris répare tout selon les bricoleurs ? | Le duct tape (ou ruban gris)
Quelle entreprise américaine fabrique le Scotch ? | 3M
Quel autre petit papier collant célèbre vient de la même entreprise ? | Le Post-it
Pour quelle mission Apollo un garde-boue de rover lunaire a-t-il été réparé au ruban adhésif ? | Apollo 17
Quel ingénieur de 3M a inventé le ruban adhésif de masquage, en 1925 ? | Richard Drew
Quel chimiste de 3M a mis au point par accident la colle du Post-it ? | Spencer Silver
Quel collègue a eu l'idée de s'en servir comme marque-page dans son livre de chant ? | Art Fry
# improbable | Les bouchons de liège
Trouve-t-on des bouchons de liège dans les canalisations de vin de Bordeaux ? | Non, dans les bouteilles
Avec quel objet retire-t-on le bouchon ? | Un tire-bouchon
Quel défaut donne un goût de moisi au vin ? | Le goût de bouchon
Sur quel arbre récolte-t-on le liège ? | Le chêne-liège
Quel pays est le premier producteur mondial de liège ? | Le Portugal
Comment s'appelle l'opération de récolte de l'écorce ? | Le démasclage
Tous les combien d'années environ récolte-t-on l'écorce d'un chêne-liège ? | Tous les 9 ans
Quelle molécule est responsable du goût de bouchon ? | Le TCA (trichloroanisole)
Comment appelle-t-on la première récolte de liège, de mauvaise qualité ? | Le liège mâle
Quel est le nom scientifique du chêne-liège ? | Quercus suber
# improbable | Les ronds-points
Un rond-point sert-il à jouer aux billes ? | Non, à gérer la circulation
Dans quel sens tourne-t-on sur un rond-point français ? | Dans le sens inverse des aiguilles d'une montre
Quel ornement absurde trône souvent au milieu d'un rond-point français ? | Une sculpture (ou tout objet local)
Qui est prioritaire dans un carrefour à sens giratoire ? | Celui qui circule déjà sur l'anneau
Quel célèbre rond-point parisien entoure l'Arc de triomphe ? | La place de l'Étoile (Charles-de-Gaulle)
Quel pays compte le plus de ronds-points d'Europe, souvent cité avec plus de 30 000 ? | La France
Dans quel sens tourne-t-on sur un rond-point britannique ? | Dans le sens des aiguilles d'une montre
Dans quelle ville anglaise se trouve le rond-point géant à cinq petits ronds-points ? | Swindon (le Magic Roundabout)
Quel architecte français a théorisé le carrefour giratoire vers 1906 ? | Eugène Hénard
Sur combien d'avenues donne la place de l'Étoile ? | 12
# improbable | La poule et l'œuf
Une poule peut-elle pondre un œuf au plat directement ? | Non
Quel est le mâle de la poule ? | Le coq
Comment s'appelle le petit de la poule ? | Le poussin
Combien de temps cuit un œuf dur, environ ? | 9 à 10 minutes
Que veut dire le code 0 imprimé sur un œuf ? | Poule élevée en bio
Que veut dire le code 3 ? | Poule élevée en cage
Combien de jours faut-il pour couver un œuf de poule ? | 21 jours
Quelle partie de l'œuf contient le plus de protéines par rapport au gras ? | Le blanc
Comment s'appelle le cordon qui maintient le jaune au centre de l'œuf ? | Les chalazes
Quel est l'ancêtre sauvage principal de la poule, en Asie ? | Le coq bankiva
# improbable | Les aspirateurs
L'aspirateur sert-il à souffler les bougies ? | Non
Que faut-il changer ou vider quand il est plein ? | Le sac (ou le bac)
Quel robot aspirateur américain rond porte un nom de maison ? | Roomba
Quelle marque britannique a popularisé l'aspirateur sans sac ? | Dyson
Que veut dire le mot anglais « to hoover » ? | Passer l'aspirateur
Dans quel pays le mot « hoover » désigne-t-il l'aspirateur ? | Au Royaume-Uni
De quelle société vient le Roomba ? | iRobot
Combien de prototypes James Dyson dit-il avoir construits ? | 5 127
Quel Anglais a inventé en 1901 un grand aspirateur à moteur tiré par des chevaux ? | Hubert Cecil Booth
Quel concierge américain asthmatique a inventé le modèle vendu ensuite à Hoover ? | James Murray Spangler
# improbable | Les petits suisses et yaourts
Un petit-suisse est-il un habitant de Genève de moins d'un mètre ? | Non, un fromage frais
Combien de pots de yaourt y a-t-il souvent dans un pack ? | 4 (ou 8, 12, 16 selon l'emballage)
Avec quel ustensile mange-t-on un yaourt ? | Une petite cuillère
Quelle marque de yaourts porte le diminutif catalan du prénom Daniel ? | Danone
Quel sucre du lait les bactéries transforment-elles ? | Le lactose
Quel pays est associé au bacille du yaourt ? | La Bulgarie
Quel acide donne son goût au yaourt ? | L'acide lactique
Quelle bactérie vient s'associer au Lactobacillus bulgaricus dans le yaourt ? | Streptococcus thermophilus
Dans quelle ville Danone a-t-il été créé, en 1919 ? | Barcelone
Quel savant russe de l'Institut Pasteur a popularisé le yaourt pour sa longévité ? | Élie Metchnikoff
# improbable | Le camping
Faut-il planter des pommes de terre pour tenir sa tente ? | Non, des sardines
Quel film a rendu célèbre Patrick Chirac ? | Camping
Quel acteur joue Patrick Chirac ? | Franck Dubosc
Quel petit piquet sert à fixer la tente ? | La sardine
En quelle année est sorti le film « Camping » ? | 2006
Quelle loi de 1936 a lancé les vacances en tente et à vélo ? | Celle des congés payés
Combien d'étoiles peut avoir un camping au maximum en France ? | 5
Comment s'appelle le camping du film ? | Les Flots bleus
Dans quelle commune se trouve-t-il dans le film ? | Arcachon (Pyla-sur-Mer)
Quel Britannique, tailleur, a fondé le premier club de camping en 1901 ? | Thomas Hiram Holding
# improbable | Les éternuements
Sort-il de la lave quand on éternue ? | Non
Que dit-on poliment à quelqu'un qui éternue ? | À tes souhaits (ou À vos souhaits)
Dans quoi éternue-t-on de préférence, selon les affiches ? | Dans son coude
Que dit-on au deuxième éternuement, selon la blague ? | « À tes amours »
Quelle saison fait éternuer les allergiques aux pollens ? | Le printemps
Qu'est-ce que le rhume des foins ? | Une allergie aux pollens
Comment s'appelle le réflexe d'éternuer en regardant le soleil ? | Le réflexe photique (ou ACHOO)
Quel est le mot savant pour désigner l'éternuement ? | La sternutation
Quelle Anglaise détient le record d'éternuements, 978 jours d'affilée ? | Donna Griffiths
Quel nerf crânien déclenche le réflexe ? | Le nerf trijumeau
# plaisir | La raclette
La raclette se mange-t-elle au petit déjeuner avec du Nutella ? | Non
Que fait-on fondre ? | Du fromage
Quels légumes l'accompagnent ? | Les pommes de terre
Comment s'appelle le petit plat où l'on glisse le fromage ? | Le poêlon
Dans quel pays et quel canton trouve-t-on sa version d'origine ? | La Suisse, le Valais
Quels petits légumes au vinaigre l'accompagnent ? | Les cornichons
Que veut dire « racler » dans cette recette ? | Gratter le fromage fondu de la meule
Comment s'appelle l'appareil qui fait fondre la demi-meule ? | Le four à raclette
Quel signe européen protège le Raclette du Valais ? | L'AOP
Quel signe de qualité protège le Raclette de Savoie depuis 2017 ? | L'IGP
# plaisir | Les pizzas
L'ananas sur une pizza est-il une religion officielle ? | Non, mais ça se discute
Quel pays a inventé la pizza ? | L'Italie
Quelle pizza ne contient que tomate, mozzarella et basilic ? | La Margherita
Quelle ville est son berceau ? | Naples
Que garnit une pizza Reine ? | Jambon et champignons
Quelle est la pizza aux quatre fromages en italien ? | Quattro formaggi
Quels héros mutants raffolent de pizza en égouts ? | Les Tortues Ninja
Quel pizzaïolo a créé la Margherita en 1889 ? | Raffaele Esposito
Quel ingrédient caractérise une pizza hawaïenne, inventée au Canada ? | L'ananas
Quel Canadien d'origine grecque l'a inventée, en 1962 ? | Sam Panopoulos
# plaisir | Les Playmobil et Lego
Peut-on manger une brique Lego ? | Non
De quel pays vient Lego ? | Le Danemark
Quel pays produit Playmobil ? | L'Allemagne
Combien de tenons a une brique classique 2 × 4 ? | 8
Que veut dire Lego en danois ? | « Leg godt », bien jouer
En quelle année apparaissent les figurines Playmobil ? | 1974
Quel menuisier a créé Lego ? | Ole Kirk Christiansen
Qui a dessiné le personnage Playmobil ? | Hans Beck
Combien de combinaisons existe-t-il avec 6 briques 2 × 4 ? | 915 103 765
Dans quelle ville allemande se trouve le siège de Playmobil ? | Zirndorf
# plaisir | Disney à la loupe
Bambi est-il un tigre ? | Non, un faon
Quel animal est Mickey ? | Une souris
Combien de nains vivent avec Blanche-Neige ? | Sept
Combien de dalmatiens dans le titre ? | 101
Comment s'appelle le lionceau du « Roi Lion » ? | Simba
Comment s'appelle l'oncle méchant de Simba ? | Scar
Quel film Disney a la chanson « Hakuna Matata » ? | Le Roi Lion
Comment s'appelait Mickey dans sa première version ? | Mortimer
Quel est le premier court-métrage sonore de Mickey ? | Steamboat Willie
Quel lapin de Walt Disney a précédé Mickey ? | Oswald le lapin chanceux
# plaisir | Les Monopoly et la bonne foi
Dans la version classique, gagne-t-on en ruinant son beau-frère ? | Oui
Combien de cases compte le plateau ? | 40
Quelle case envoie directement en prison ? | « Allez en prison »
Combien touche-t-on en passant par la case Départ dans la version française en francs ? | 20 000 F
Comment s'appelle le bonhomme à moustache, en anglais ? | Rich Uncle Pennybags
Quelle couleur sont les rues les plus chères, en France ? | Bleu foncé
Quelle est la moins chère ? | Le boulevard de Belleville
Quelle gare n'est pas sur le plateau parisien : Lyon, Nord, Montparnasse ou Austerlitz ? | Austerlitz
Quelle est la deuxième rue la plus chère du plateau français ? | L'avenue des Champs-Élysées
Quel chômeur américain a vendu le jeu à Parker Brothers en 1935 ? | Charles Darrow
# plaisir | Les génériques de dessins animés
Ulysse 31 voyage-t-il en trottinette ? | Non, en vaisseau spatial
Quel chat poursuit Jerry ? | Tom
Quel marin mange des épinards ? | Popeye
Quelle émission diffusait Dragon Ball et Les Chevaliers du Zodiaque ? | Le Club Dorothée
Quel dessin animé a pour héros une abeille appelée Maya ? | Maya l'abeille
Quel robot géant venu de loin est piloté par Actarus ? | Goldorak
De quelle émission Goldorak a-t-il été la vedette en 1978 ? | Récré A2
Qui a chanté le générique français de Goldorak ? | Noam Kaniel
Quel groupe de l'émission Dorothée mené par Bernard Minet a chanté de nombreux génériques ? | Les Musclés
Qui est le créateur japonais de Goldorak ? | Go Nagai
# mature | La machine à laver
Peut-on y laver son chat ? | Non
Quel produit met-on dans le bac ? | De la lessive
Que perd-on mystérieusement dans le tambour ? | Une chaussette
Quelle température à 30, 40 ou 90 °C est dite « économique » la plupart du temps ? | 30 °C
Que retient le filtre de vidange ? | Peluches et petits objets
Que combat-on avec du vinaigre blanc dans la machine ? | Le calcaire
Que signifie le chiffre de tours/minute indiqué ? | La vitesse d'essorage
Quel symbole d'étiquette dit « lavage à la main » ? | Une main dans une cuvette
Quelle énergie mesure le label en kWh pour 100 cycles ? | La consommation d'électricité
Quelle unité mesure la dureté de l'eau en France ? | Le degré français (°f)
# mature | La TVA
La TVA est-elle une chaîne de télé ? | Non, un impôt
Qui la paye au final ? | Le consommateur
Que veut dire TVA ? | Taxe sur la valeur ajoutée
Quel est le taux normal en France ? | 20 %
Quel est le taux sur la plupart des produits alimentaires ? | 5,5 %
Quel est le taux réduit en restauration sur place ? | 10 %
Quel taux de 2,1 % s'applique notamment aux médicaments remboursés ? | Le taux super-réduit
Quel haut fonctionnaire français a inventé la TVA ? | Maurice Lauré
En quelle année a-t-elle été créée ? | 1954
Quel pays de l'Union européenne a le taux normal le plus élevé ? | La Hongrie (27 %)
# mature | Le barbecue
Allume-t-on le barbecue avec une bombe d'insecticide ? | Non
Quelle pince sert à retourner les saucisses sans se brûler ? | La pince à barbecue
Quel combustible noir met-on dans le barbecue ? | Le charbon de bois
Quelle petite saucisse rouge épicée finit souvent sur la grille ? | La merguez
Quel gaz alimente les modèles sans charbon ? | Le propane (ou le butane)
Quelle marque américaine ronde a un couvercle en dôme ? | Weber
De quel pays vient le braai, un barbecue traditionnel ? | L'Afrique du Sud
Comment s'appelle le barbecue argentin ? | L'asado
Quel soudeur a créé le barbecue à couvercle Weber, en 1952 ? | George Stephen
Quelle réaction chimique donne sa croûte à la viande grillée ? | La réaction de Maillard
# mature | La déclaration d'impôts
La déclaration se fait-elle en remplissant un formulaire sur un coussin ? | Non, sur le site des impôts
Quel service encaisse l'impôt ? | Les finances publiques (le fisc)
Quel est le numéro du formulaire principal ? | Le 2042
Combien de parts fiscales compte un couple marié sans enfant ? | 2 parts
Qu'est-ce qu'une niche fiscale ? | Un avantage qui réduit l'impôt
Que veut dire « prélèvement à la source » ? | L'impôt est retenu directement sur le revenu
En quelle année le prélèvement à la source a-t-il été mis en place ? | 2019
Combien de tranches compte le barème de l'impôt sur le revenu ? | 5
Quel est le taux de la tranche la plus haute ? | 45 %
Quel article du Code général des impôts institue le quotient familial ? | L'article 194
# scolaire | Les fables de La Fontaine
Le Corbeau tient-il une baguette dans son bec ? | Non, un fromage
Qui flatte le corbeau ? | Le renard
Qui gagne, de la tortue ou du lièvre ? | La tortue
Que fait la cigale tout l'été ? | Elle chante
À qui s'adresse-t-elle pour demander à manger ? | La fourmi
Quel animal veut se faire aussi gros que le bœuf ? | La grenouille
À qui La Fontaine dédie-t-il ses premières fables ? | Au Dauphin, fils de Louis XIV
Quel auteur grec a-t-il principalement repris ? | Ésope
Quel surintendant a soutenu La Fontaine avant sa chute ? | Nicolas Fouquet
Combien de livres comptent les Fables ? | 12
# scolaire | Le théorème de Pythagore
Pythagore est-il un joueur de foot ? | Non, un savant grec
Dans quel type de triangle s'applique-t-il ? | Le triangle rectangle
Comment s'appelle le plus grand côté ? | L'hypoténuse
Combien vaut l'hypoténuse d'un triangle de côtés 3 et 4 ? | 5
Combien vaut-elle pour les côtés 5 et 12 ? | 13
De quelle île grecque Pythagore est-il originaire ? | Samos
Comment s'appelle la réciproque utilisée sur les chantiers avec une corde à 12 nœuds ? | Le triangle 3-4-5
Quel nombre irrationnel est l'hypoténuse d'un triangle de côtés 1 et 1 ? | Racine de 2
Quelle tablette babylonienne contient des triplets pythagoriciens ? | Plimpton 322
Quel théorème généralise celui-ci à tout triangle ? | Le théorème d'Al-Kashi (loi des cosinus)
# scolaire | Les accords qui piquent
Écrit-on « des chevals » ? | Non, des chevaux
Quel est le pluriel de « œil » ? | Des yeux
Quel est le féminin de « blanc » ? | Blanche
Quels sept noms en -ou prennent un x au pluriel : citez-en trois ? | Bijou, caillou, chou, genou, hibou, joujou, pou
Quel est le pluriel de « festival » ? | Festivals
Écrit-on « ils se sont lavé les mains » ou « lavés » ? | Lavé
Quel mot est masculin au singulier et féminin au pluriel, avec « orgue » et « délice » ? | Amour
Écrit-on « cent » ou « cents » dans « deux cent trois » ? | Cent, sans s
Pourquoi écrit-on « une demi-heure » mais « une heure et demie » ? | Invariable avant le nom, accordé après
Quelle est la règle pour « vingt » dans « quatre-vingt-trois » ? | Sans s, car suivi d'un autre nombre
# scolaire | La Révolution à la loupe
Louis XVI a-t-il perdu la tête en jouant aux cartes ? | Non, guillotiné
Quelle prison tombe le 14 juillet 1789 ? | La Bastille
Quelle reine aurait parlé de brioche au peuple affamé ? | Marie-Antoinette
Quelle machine porte le nom d'un médecin ? | La guillotine
Comment s'appelle la déclaration d'août 1789 ? | La Déclaration des droits de l'homme et du citoyen
Quel chant de marche est devenu l'hymne national ? | La Marseillaise
Qui a écrit la Marseillaise ? | Rouget de Lisle
Quelle jeune femme a poignardé Marat dans sa baignoire ? | Charlotte Corday
Dans quelle ville a été arrêté Louis XVI en fuite ? | Varennes
Quel mois du calendrier révolutionnaire voit la chute de Robespierre ? | Thermidor
# improbable | Les parapluies
Un parapluie protège-t-il du soleil de minuit en plein salon ? | Pas vraiment, il protège de la pluie
Que fait-il au premier coup de vent ? | Il se retourne
Quelle superstition interdit de l'ouvrir où ? | Dans une maison
Quelle nounou anglaise vole avec le sien ? | Mary Poppins
Quel film de Jacques Demy se passe à Cherbourg ? | Les Parapluies de Cherbourg
Quelle ville d'Auvergne est sa capitale historique en France ? | Aurillac
Comment s'appelle un parapluie contre le soleil ? | Une ombrelle
Quel Anglais a été moqué pour avoir osé en porter un à Londres au XVIIIe siècle ? | Jonas Hanway
Quel marque britannique fabrique des parapluies pour la reine ? | Fulton
Quel dissident bulgare a été assassiné par un parapluie empoisonné à Londres, en 1978 ? | Gueorgui Markov
# improbable | Les moustaches
Une moustache pousse-t-elle sur le front ? | Non
Quel plombier à moustache sauve la princesse ? | Mario
Quel détective belge est fier de la sienne ? | Hercule Poirot
Quel Gaulois moustachu a un gros casque ailé ? | Astérix
Quel peintre espagnol a une moustache en crocs ? | Salvador Dalí
Quel mois de novembre fait pousser la moustache pour la santé masculine ? | Movember
Quel acteur américain à moustache joue dans « Magnum » ? | Tom Selleck
Quel chanteur à moustache mène Queen ? | Freddie Mercury
Comment s'appelle la moustache qui descend de chaque côté de la bouche ? | La moustache en fer à cheval
Quel Allemand a créé le championnat du monde de barbe et moustache en 1990 ? | Le Belzer Bart- und Schnauzerclub (à Höfen-Enz)
# improbable | Les pingouins et manchots
Un manchot peut-il voler ? | Non
Sur quel continent vit surtout le manchot empereur ? | L'Antarctique
Quel film de Luc Jacquet les suit ? | La Marche de l'empereur
Le pingouin vole-t-il ? | Oui, le petit pingouin vole
Quel manchot prend-on pour logo de Linux ? | Tux
Quel oscar a reçu « La Marche de l'empereur » ? | L'Oscar du meilleur documentaire
Qui couve l'œuf chez le manchot empereur ? | Le mâle
Combien mesure un manchot empereur, environ ? | 1,20 m
Quel oiseau nordique est le seul pingouin vivant ? | Le petit pingouin (Alca torda)
Quelle espèce est disparue au XIXe siècle ? | Le grand pingouin
# improbable | Les vampires
Un vampire se nourrit-il de tofu ? | Non, de sang
Que déteste-t-il dans la cuisine ? | L'ail
Quel pieu le tue ? | Un pieu dans le cœur
Quel comte est le plus célèbre ? | Dracula
Qui a écrit le roman Dracula ? | Bram Stoker
De quelle région vient-il ? | La Transylvanie
Quel prince inspire le personnage ? | Vlad III l'Empaleur
Quelle chauve-souris boit du sang ? | Le vampire commun (Desmodus rotundus)
Quel film muet allemand de 1922 ? | Nosferatu
Quel réalisateur a fait Nosferatu ? | Friedrich Wilhelm Murnau
# improbable | Les zombies
Un zombie travaille-t-il à la banque ? | Non, même s'il en a l'air
Que mange-t-il ? | Des cerveaux
Comment le tue-t-on, selon la plupart des films ? | En lui détruisant le cerveau
Quelle île des Caraïbes est à l'origine du mythe ? | Haïti
Quel film de George Romero, 1968 ? | La Nuit des morts-vivants
Quelle série AMC suit Rick Grimes ? | The Walking Dead
Quel acteur joue Rick Grimes ? | Andrew Lincoln
Quel film britannique de 2004 avec Simon Pegg ? | Shaun of the Dead
Quelle chanson a un clip de zombies, en 1983 ? | Thriller
Quel réalisateur de Thriller a fait « Le Loup-garou de Londres » ? | John Landis
# improbable | Les ovnis
Un ovni a-t-il un permis de conduire ? | Pas à notre connaissance
Que veut dire ovni ? | Objet volant non identifié
Quelle zone américaine fait fantasmer ? | La Zone 51
Quelle ville américaine, en 1947, est célèbre pour un crash ? | Roswell
Quel agent ne croit pas, face à Mulder ? | Dana Scully
Quel service français étudie les ovnis ? | Le GEIPAN
Quel réalisateur français joue dans « Rencontres du troisième type » ? | François Truffaut
Quel pilote américain a vu des « soucoupes » en 1947 ? | Kenneth Arnold
Quel organisme français abrite le GEIPAN ? | Le CNES
Quel programme de l'US Air Force s'est terminé en 1969 ? | Blue Book
# improbable | Les saints bizarres
Saint Éloi a-t-il remis sa culotte à l'endroit ? | Non, c'est le roi Dagobert
Qui garde les clés du paradis ? | Saint Pierre
Quel saint est fêté le 26 décembre ? | Saint Étienne
Quel patron est invoqué pour retrouver un objet ? | Saint Antoine de Padoue
Quel saint a vu un cerf à croix ? | Saint Hubert
Quelle sainte est la patronne des pompiers et des mineurs ? | Sainte Barbe
Quel saint de glace est fêté le 12 mai ? | Saint Pancrace
Quel saint céphalophore a marché sa tête à la main jusqu'à Paris ? | Saint Denis
Quel saint protège les voyageurs ? | Saint Christophe
Quel saint a été martyrisé sur une grille ? | Saint Laurent
# improbable | Les pommes de terre
Une patate se plante-t-elle dans un smartphone ? | Non
Comment s'appelle celle des McDonald's ? | La frite
Quel pays défend ses frites contre la France ? | La Belgique
Quel continent est son origine ? | L'Amérique du Sud
Quel pharmacien l'a popularisée en France ? | Antoine Parmentier
Quelle grande famine a touché l'Irlande en 1845 ? | La Grande Famine
Quelle maladie a causé cette famine ? | Le mildiou
Quel pays en produit le plus au monde ? | La Chine
Quel est le plat de Parmentier ? | Le hachis Parmentier
Quelle variété française est labellisée sur l'île de Ré ? | La pomme de terre de l'île de Ré (AOP)
# plaisir | Astérix en détail
Astérix est-il romain ? | Non, gaulois
Qui est tombé dans la marmite ? | Obélix
Quel petit chien l'accompagne ? | Idéfix
Quel druide prépare la potion ? | Panoramix
Comment s'appelle le chef du village ? | Abraracourcix
Quel barde chante trop faux ? | Assurancetourix
Comment s'appelle le poissonnier ? | Ordralfabétix
Qui a dessiné les premiers albums ? | Albert Uderzo
Dans quel magazine sont-ils apparus en 1959 ? | Pilote
Quel camp romain entoure le village ? | Babaorum, Laudanum, Aquarium, Petibonum
# plaisir | Tintin en détail
Tintin est-il plombier ? | Non, reporter
Quelle coiffure porte-t-il ? | Une houppe
Comment s'appelle le professeur sourd ? | Tournesol
Quels policiers se ressemblent ? | Dupond et Dupont
Quelle cantatrice chante l'air des bijoux ? | Bianca Castafiore
Dans quel album va-t-il sur la Lune la première fois ? | Objectif Lune
Comment s'appelle l'ennemi aux lunettes ? | Rastapopoulos
Quel ami chinois rencontre-t-il ? | Tchang
Quel est le dernier album achevé ? | Tintin et les Picaros
Quel est l'album inachevé d'Hergé ? | Tintin et l'Alph-Art
# plaisir | Friends
Les héros de Friends vivent-ils à Marseille ? | Non, à New York
Combien sont-ils ? | 6
Comment s'appelle le café ? | Central Perk
Quel personnage est paléontologue ? | Ross
Quelle chanson chante Phoebe ? | Smelly Cat
Quel métier exerce Monica ? | Cuisinière
Quel est l'acteur de Chandler ? | Matthew Perry
Quel est le nom de famille de Joey ? | Tribbiani
Comment s'appelle le singe de Ross ? | Marcel
Quel est le nom de famille de Rachel ? | Green
# plaisir | Game of Thrones
Un Lannister paie-t-il toujours ses dettes ? | Oui, c'est sa devise officieuse
Quel est le siège convoité ? | Le Trône de fer
Comment s'appelle la mère des dragons ? | Daenerys Targaryen
Quel Stark dit « winter is coming » ? | Ned Stark
Qui a écrit les livres ? | George R.R. Martin
Quelle maison a pour emblème un loup ? | Les Stark
Quel est le mari de Cersei ? | Robert Baratheon
Comment s'appelle l'épée d'Arya ? | Aiguille
Quel épisode voit le mariage rouge ? | Les Pluies de Castamere
Quel est le prénom complet de Jon Snow à sa naissance ? | Aegon Targaryen
# plaisir | Le Seigneur des anneaux
Frodon cherche-t-il à vendre l'anneau ? | Non, à le détruire
Comment s'appelle le magicien gris ? | Gandalf
Dans quelle ville du feu détruit-on l'anneau ? | La montagne du Destin
Quel personnage dit « mon précieux » ? | Gollum
Qui a écrit le livre ? | J.R.R. Tolkien
Quel réalisateur néo-zélandais a fait les films ? | Peter Jackson
Quel est le vrai nom de Gollum ? | Sméagol
Combien de membres compte la Communauté ? | 9
Quelle est la langue des elfes Noldor ? | Le quenya
Comment s'appelle le poney de Sam ? | Bill
# plaisir | Les fêtes foraines
Peut-on y garer sa voiture dans le manège ? | Pas vraiment
Quel nom donne-t-on à la barbe sucrée ? | La barbe à papa
Quel attraction fait tourner sur des chevaux ? | Le carrousel
Où gagne-t-on une peluche ? | Au tir à la carabine
Quel fameux grand parc français est au nord de Paris ? | Le parc Astérix
Quel est le parc près de Poitiers ? | Le Futuroscope
Quel est le parc à l'histoire en Vendée ? | Le Puy du Fou
Quelle grande roue de Londres ? | London Eye
En quelle année a ouvert Disneyland Paris ? | 1992
Quelle est la plus grande fête foraine de France, à Paris ? | La Foire du Trône
# plaisir | Le karaoké
Le karaoké est-il un plat japonais ? | Non, un loisir chanté
D'où vient-il ? | Le Japon
Quelle chanson de Queen massacre-t-on ? | Bohemian Rhapsody
Quelle chanson de Gloria Gaynor ? | I Will Survive
Que veut dire karaoké ? | Orchestre vide
Quelle chanson de Céline Dion dans Titanic ? | My Heart Will Go On
Quel Canadien a écrit My Way ? | Paul Anka (paroles anglaises)
Quelle chanson tourne dans le film Grease ? | You're the One That I Want
Quel Japonais a inventé la machine à karaoké ? | Daisuke Inoue
Quelle récompense a-t-il reçue en 2004 ? | Un prix Ig Nobel de la paix
# plaisir | Le poker
Se joue-t-il avec des dominos ? | Non, des cartes
Quel est le mot pour dire qu'on suit ? | Suivre (call)
Quelle est la meilleure main ? | La quinte flush royale
Combien de cartes reçoit-on au Texas Hold'em ? | 2
Combien de cartes en tout sur la table ? | 5
Comment s'appelle la mise forcée ? | La blinde
Bat-on un full avec une couleur ? | Non, le full gagne
Quel film avec Daniel Craig a un poker ? | Casino Royale
Dans quelle ville se jouent les WSOP ? | Las Vegas
Quel amateur a gagné le WSOP de 2003 ? | Chris Moneymaker
# plaisir | Le Rubik's Cube
Se mange-t-il ? | Non
Combien de faces ? | 6
Combien de cases par face ? | 9
Combien de couleurs ? | 6
De quel pays vient-il ? | La Hongrie
En quelle année l'a-t-il inventé ? | 1974
Qui l'a inventé ? | Ernő Rubik
Quel est le nombre de Dieu, coups maximum ? | 20
Combien de positions possibles ? | Environ 43 milliards de milliards
Quel temps est le record humain d'environ ? | Environ 3 secondes
# plaisir | La Coupe du monde 1998
Les Bleus l'ont-ils gagnée à pied ? | Oui, évidemment
Qui a marqué deux têtes en finale ? | Zinédine Zidane
Quel était l'adversaire ? | Le Brésil
Quel score ? | 3-0
Où a eu lieu la finale ? | Le Stade de France
Qui était le sélectionneur ? | Aimé Jacquet
Qui a inscrit le 3e but ? | Emmanuel Petit
Quel défenseur a marqué un doublé en demi-finale ? | Lilian Thuram
Qui était le gardien, souvent embrassé sur le crâne ? | Fabien Barthez
Quelle chanson de Gloria Gaynor était devenue l'hymne de l'équipe ? | I Will Survive
# plaisir | Le rugby
Le rugby se joue-t-il sur glace ? | Non
Combien de joueurs par équipe ? | 15
Quelle est la danse des All Blacks ? | Le haka
Combien vaut un essai ? | 5 points
Quel tournoi réunit six nations d'Europe ? | Le Tournoi des Six Nations
Quelle école a donné son nom au sport ? | Rugby School
Quel est le nom de la légende de ce sport ? | William Webb Ellis
Quel est le trophée de la Coupe du monde ? | La coupe Webb-Ellis
Combien de points vaut une transformation ? | 2
Quel pays a remporté le plus de Coupes du monde, à 2023 ? | L'Afrique du Sud (4)
# plaisir | La pétanque
Se joue-t-elle avec des melons ? | Non, des boules
Quelle est la petite boule ? | Le cochonnet
Quelle région est sa patrie ? | La Provence
Dans quelle ville a-t-elle été inventée ? | La Ciotat
En quelle année ? | 1907
Que veut dire « pétanque » ? | Pieds tanqués
Que doit-on faire si on perd 13 à 0 ? | Embrasser Fanny
Combien de joueurs dans une doublette ? | 2
Quel Français est célèbre tireur, Marco ? | Marco Foyot
Quel joueur a initié la pétanque à La Ciotat ? | Jules Lenoir
# plaisir | La Formule 1
Un tracteur y gagne-t-il ? | Non
Quelle écurie est rouge ? | Ferrari
Quel est le célèbre circuit de ville ? | Monaco
Quel Allemand a sept titres ? | Michael Schumacher
Quel Britannique a sept titres aussi ? | Lewis Hamilton
Quel Français a quatre titres ? | Alain Prost
Quel Brésilien est mort à Imola ? | Ayrton Senna
Quel Français courait pour Alpine en 2023 ? | Esteban Ocon (ou Pierre Gasly)
Sur quel circuit court-on au Castellet ? | Paul Ricard
Quel est le célèbre virage de Spa ? | Eau Rouge
# plaisir | Les Rolling Stones et les Beatles
Sont-ils des groupes de polka ? | Non
Qui chante chez les Stones ? | Mick Jagger
Quel guitariste a une tête de pirate ? | Keith Richards
Qui a écrit Imagine ? | John Lennon
Sur quelle route marchent les Beatles ? | Abbey Road
Quel album a une pochette avec beaucoup de gens ? | Sgt. Pepper's
Quel Beatles est mort en 2001 ? | George Harrison
Quel batteur des Stones est mort en 2021 ? | Charlie Watts
Quelle chanteuse a épousé Lennon ? | Yoko Ono
Quel Stone a été retrouvé noyé en 1969 ? | Brian Jones
# plaisir | Michael Jackson
Marche-t-il en avant, dans le moonwalk ? | Non, en arrière
De quelle couleur était son gant célèbre ? | Blanc
Quel album a battu tous les records ? | Thriller
Quelle chanson avec des zombies ? | Thriller
Quel était son groupe d'enfance ? | The Jackson Five
Comment s'appelle sa propriété ? | Neverland
En quelle année est-il mort ? | 2009
Quel réalisateur a fait le clip « Thriller » ? | John Landis
Quel producteur a fait Thriller ? | Quincy Jones
Quel singe était son compagnon ? | Bubbles
# plaisir | Bienvenue chez les Ch'tis
Le film se passe-t-il en Bretagne ? | Non, dans le Nord
Quel acteur joue le postier du Sud ? | Kad Merad
Quel acteur joue Antoine, le facteur ? | Dany Boon
Qui réalise le film ? | Dany Boon
Quelle est la langue régionale ? | Le ch'ti
Dans quelle ville se déroule-t-il ? | Bergues
Quel fromage est célèbre dans le film ? | Le maroilles
Combien d'entrées environ en France ? | 20 millions
Quel film de 1966 a été battu ? | La Grande Vadrouille
En quelle année est-il sorti ? | 2008
# plaisir | Les Visiteurs
Godefroy de Montmirail est-il plombier ? | Non, chevalier
Comment s'appelle son écuyer ? | Jacquouille la Fripouille
Qui joue Godefroy ? | Jean Reno
Qui joue Jacquouille ? | Christian Clavier
Que répète-t-il sans cesse ? | Okay ! (Jacquouille)
Quel acteur joue le rôle du clochard Jacquart, descendant de Jacquouille ? | Christian Clavier
Qui réalise le film ? | Jean-Marie Poiré
Quelle actrice joue Béatrice ? | Valérie Lemercier
En quelle année ? | 1993
En quelle année se passe la scène d'origine ? | 1123
# plaisir | Le Dîner de cons
Dîne-t-on chez un président ? | Non
Qui joue François Pignon ? | Jacques Villeret
Quelle passion a Pignon ? | Les constructions en allumettes
Qui joue l'éditeur ? | Thierry Lhermitte
Qui a écrit et réalisé le film ? | Francis Veber
En quelle année ? | 1998
De quelle pièce est-il adapté ? | Du Dîner de cons de Veber
Quel est le nom de l'éditeur, qui organise le dîner ? | Pierre Brochant
Quel contrôleur fiscal vient chez lui ? | Lucien Cheval
Quel acteur joue Cheval ? | Daniel Prévost
# plaisir | Les Tuche
Sont-ils d'une famille royale ? | Non
Que fait Jeff Tuche pour se faire de l'argent ? | Il gagne au loto
Qui joue Jeff ? | Jean-Paul Rouve
Qui joue Cathy ? | Isabelle Nanty
Quel est le prénom de la fille ? | Stéphanie
Dans quel pays vont-ils ? | À Monaco (dans le premier film)
Quel plat est sa passion ? | Les frites
Quelle ville fictive du Nord ? | Bouzolles
Comment s'appelle le fils ? | Wilfried
Quel est le prénom du plus jeune, Donald ? | Coin-Coin
# mature | La ceinture de sécurité
Se met-elle autour du cou ? | Non
Où la boucle-t-on, en voiture ? | Autour du buste et du bassin
Quel petit signal sonore insiste tant qu'elle n'est pas bouclée ? | Le bip (l'alarme de ceinture)
Combien de points de permis coûte son oubli au volant ? | 3 points
Quelle amende forfaitaire risque-t-on en France ? | 135 euros
Depuis quelle année est-elle obligatoire à l'arrière en France ? | 1990
Quel constructeur a popularisé la ceinture à trois points ? | Volvo
Quel ingénieur a inventé cette ceinture à trois points, en 1959 ? | Nils Bohlin
Volvo a-t-il gardé le brevet pour lui seul ? | Non, il l'a laissé libre pour tous
Quel organe ou dispositif resserre la ceinture lors d'un choc ? | Le prétensionneur
# mature | Le contrôle technique
Sert-il à vérifier si le conducteur est gentil ? | Non, l'état du véhicule
À quel âge du véhicule a lieu le premier contrôle ? | 4 ans
Quelle est la fréquence ensuite ? | Tous les 2 ans
Qu'appose-t-on sur le pare-brise après le contrôle ? | Une vignette
Combien de temps laisse-t-on pour une contre-visite ? | 2 mois
Combien de points de contrôle compte environ l'examen ? | 133
Comment s'appelle une défaillance imposant de ne plus rouler dès le jour même ? | Une défaillance critique
En quelle année le contrôle technique devient-il obligatoire pour les voitures en France ? | 1992
Quel type de défaillance a été ajouté par la réforme de 2018, avec la critique ? | Les défaillances majeures et mineures
Quelle directive européenne de 2014 a inspiré cette réforme ? | La directive 2014/45/UE
# mature | Les rendez-vous chez le dentiste
Le dentiste soigne-t-il les genoux ? | Non, les dents
Quelle dent pousse tard et peut poser problème ? | La dent de sagesse
Que recommande-t-on de faire deux fois par jour ? | Se brosser les dents
Combien de dents a un adulte, sagesse comprises ? | 32
Combien de dents de lait a un enfant ? | 20
Comment s'appelle la matière la plus dure du corps humain ? | L'émail
Quel nom porte le soin qui consiste à enlever le tartre ? | Le détartrage
Comment s'appelle le spécialiste qui redresse les dents ? | L'orthodontiste
Quel Français est considéré comme le père de la dentisterie moderne ? | Pierre Fauchard
Quel est le nom du tissu sous l'émail ? | La dentine
# mature | Le rond de serviette et les bonnes manières
Peut-on essuyer son couteau sur la nappe ? | Non
De quel côté pose-t-on la fourchette, à la française ? | À gauche
Faut-il couper sa salade au couteau, selon la tradition ? | Non, on la plie
Dans quel sens repose la fourchette en France, dents vers le haut ou le bas ? | Vers le bas (vers la nappe)
À quel doigt porte-t-on une chevalière, traditionnellement ? | L'auriculaire
Quel mot désigne l'art de bien se tenir à table ? | L'étiquette
Quel petit objet de table garde sa serviette en famille ? | Le rond de serviette
Quelle baronne a publié un célèbre guide des bonnes manières ? | Nadine de Rothschild
Quel roi a imposé l'étiquette à la cour de Versailles ? | Louis XIV
Quel prélat italien a écrit le « Galatée », traité de savoir-vivre ? | Giovanni Della Casa
# mature | Le pastis
Boit-on le pastis avec du lait ? | Non, avec de l'eau
De quelle ville est-il l'emblème ? | Marseille
Quelle couleur prend-il quand on ajoute de l'eau ? | Il se trouble (jaune laiteux)
Quelle plante lui donne son goût principal ? | L'anis
Quel homme a lancé la marque à son nom en 1932 ? | Paul Ricard
Quel est le nom du pastis de la marque concurrente, à la bouteille verte ? | Pernod
Combien de volumes d'eau pour un volume de pastis, en général ? | 5
Quel degré d'alcool minimal doit avoir un pastis ? | 40 %
Comment s'appelle la molécule anisée responsable du trouble ? | L'anéthol
Quel nom porte le pastis mêlé de sirop d'orgeat ? | La mauresque
# mature | La tondeuse et le jardin du dimanche
Tond-on une pelouse avec des ciseaux à ongles ? | Non
Quel jour la tondeuse réveille-t-elle souvent le voisin ? | Le dimanche
Que fait le bac de la tondeuse ? | Il ramasse l'herbe
Comment s'appelle la tonte qui laisse l'herbe broyée sur place ? | Le mulching
Quel appareil robotisé fait la tonte tout seul ? | Le robot-tondeuse
À quelle hauteur conseille-t-on de ne pas descendre en été ? | Environ 5 à 6 cm
Quel petit moteur alimente la plupart des tondeuses thermiques ? | Un moteur à essence
Quel Anglais a inventé la tondeuse à gazon, en 1830 ? | Edwin Beard Budding
Dans quel secteur industriel Budding s'était-il inspiré ? | Le textile
Quelle est la marque suédoise leader des robots tondeuses ? | Husqvarna
# mature | Les poubelles
Trie-t-on les épluchures dans la boîte aux lettres ? | Non
De quelle couleur est le plus souvent la poubelle de recyclage ? | Jaune
Où jette-t-on le verre ? | Dans la colonne à verre
Quel préfet de la Seine a imposé les boîtes à ordures en 1884 ? | Eugène Poubelle
Que devient-on obligé de trier depuis janvier 2024 ? | Les biodéchets
Qu'est-ce qu'un éco-organisme comme Citeo ? | Une société qui organise le recyclage des emballages
Le logo Triman, à quoi sert-il ? | Il indique qu'un produit se trie
Combien de fois le verre peut-il être recyclé ? | À l'infini
Dans quelle ville Poubelle était-il préfet ? | Paris
Quelle couleur de sac désigne en général les déchets médicaux à risque ? | Le jaune (DASRI)
# mature | Le thermostat
Le thermostat sert-il à mesurer la fièvre du chat ? | Non
Où le règle-t-on souvent dans un couple, source de dispute ? | Sur le chauffage
Quelle température l'ADEME conseille-t-elle dans un salon ? | 19 °C
Et dans une chambre ? | 16 à 17 °C
Combien économise-t-on à peu près par degré baissé ? | Environ 7 %
Quel thermostat américain connecté a été racheté par Google ? | Nest
Quel métal bilame était utilisé dans les thermostats mécaniques ? | Deux métaux soudés (bilame)
Quel Américain a déposé le brevet du thermostat électrique de pièce en 1883 ? | Warren Johnson
Quel chimiste écossais a inventé un thermostat vers 1830 ? | Andrew Ure
Quel Néerlandais construit un thermostat pour un four au début du XVIIe siècle ? | Cornelis Drebbel
# mature | La mutuelle santé
La mutuelle rembourse-t-elle un week-end à Rome ? | Non
Que rembourse-t-elle ? | Une partie des frais de santé non couverts
Quelle carte présente-t-on avec elle chez le médecin ? | La carte Vitale
Quelle réforme a mis en place le « 100 % santé » ? | La réforme du reste à charge zéro
Depuis 2016, qui doit proposer une mutuelle à ses salariés ? | L'employeur
Quelle part minimale l'employeur doit-il payer ? | 50 %
Quels sont les trois domaines du 100 % santé ? | Optique, dentaire, audiologie
Que veut dire « ticket modérateur » ? | La part restant à charge après l'Assurance maladie
Quelle aide remplace la CMU-C et l'ACS depuis 2019 ? | La Complémentaire santé solidaire
Quelle année a vu la création de la Sécurité sociale ? | 1945
# mature | Les ampoules
Une ampoule s'allume-t-elle si on lui parle gentiment ? | Non
Quelle lampe consomme le moins : LED ou halogène ? | La LED
Quel Américain a commercialisé l'ampoule à incandescence ? | Thomas Edison
Quelle unité mesure la lumière émise ? | Le lumen
Quelle unité mesure la puissance électrique ? | Le watt
Que veulent dire E27 et E14 ? | Le type de culot à vis
Quel Britannique a précédé Edison sur l'ampoule ? | Joseph Swan
En quel métal est le filament d'une ampoule classique ? | Le tungstène
Dans quelle ville américaine brille une ampoule depuis 1901 ? | Livermore (Californie)
Comment s'appelle l'entente d'industriels qui limita la durée de vie à 1 000 heures ? | Le cartel de Phœbus
# mature | Le code de la route
Peut-on klaxonner pour saluer un mouton ? | Mieux vaut éviter
Quelle couleur est le feu pour s'arrêter ? | Rouge
Que veut dire un panneau triangulaire ? | Un danger
Combien de points compte un permis complet ? | 12
Combien en a un jeune conducteur au départ ? | 6
Quelle vitesse maximale sur autoroute par temps de pluie ? | 110 km/h
Quelle limite d'alcoolémie au volant pour un conducteur expérimenté ? | 0,5 g par litre de sang
Combien de temps dure le permis probatoire avec conduite accompagnée ? | 2 ans
En quelle année a été instauré le premier Code de la route français ? | 1921
Depuis quelle année existe le permis à points en France ? | 1992
# mature | La machine à café au bureau
Fait-elle du vin blanc ? | Non, normalement
Que met-on dans la machine pour payer ? | Une pièce ou un badge
Que renverse-t-on souvent sur son clavier ? | Du café
Comment appelle-t-on les ragots échangés près d'elle ? | Les potins (les bruits de couloir)
Que veut dire « petit noir » ? | Un expresso
Quelle marque a Clooney pour égérie ? | Nespresso
Quel pays a inventé l'expresso ? | L'Italie
Quelle pression exerce une bonne machine à expresso ? | 9 bars
Quel Italien a donné son nom à la machine à piston de 1947 ? | Achille Gaggia
Quelle est la température idéale de l'eau pour un expresso ? | 90 à 96 °C
# mature | Le permis de conduire
Peut-on le passer à 8 ans ? | Non
Comment s'appelle le test théorique ? | Le code
Combien de fautes au maximum à l'épreuve du code ? | 5 fautes
Combien de questions compte l'examen du code ? | 40
Combien de temps dure l'épreuve de conduite ? | 32 minutes
Depuis 2024, à quel âge peut-on passer le permis B ? | 17 ans
Sur combien de points est notée l'épreuve pratique ? | 31 points
Quel score minimal faut-il pour obtenir le permis ? | 20 points
Quel est le plus ancien document de type « permis » français, 1893 ? | Le « certificat de capacité »
Dans quelle ville française a été délivré ce premier permis ? | Paris (préfecture de police)
# mature | Les huissiers et petits papiers
Un huissier joue-t-il du hautbois ? | Non, pas professionnellement
Quel officier public signe un acte de vente de maison ? | Le notaire
Que délivre la mairie pour se marier ? | Un acte de mariage (livret de famille)
Quelle nouvelle profession a remplacé huissier en 2022 ? | Commissaire de justice
Que signifie LRAR ? | Lettre recommandée avec accusé de réception
Combien de temps garder une facture d'électricité, en général ? | 5 ans
Que délivre le greffe du tribunal ? | Un extrait Kbis (ou de casier judiciaire)
Combien de temps conserver un avis d'imposition ? | 3 ans
Quel bulletin est demandé pour certains emplois ? | Le bulletin n° 3
Quel est le délai de prescription de droit commun en matière civile ? | 5 ans
# mature | Le vin rosé en été
Le rosé se boit-il avec une paille ? | Non, en principe
Quelle région française est sa grande productrice ? | La Provence
Le rosé est-il un mélange de rouge et de blanc en France ? | Non, sauf en Champagne
Quelle exception autorise ce mélange ? | Le champagne rosé
Comment appelle-t-on un verre de rosé servi avec des glaçons ? | Une piscine
Quelle appellation du Var, au bord de la mer, est réputée pour ses rosés ? | Bandol
Comment s'appelle la méthode de macération courte pour obtenir un rosé ? | La saignée
Quel couple d'acteurs a vendu du Miraval ? | Brad Pitt et Angelina Jolie
Quelle appellation rhodanienne n'élabore que du rosé ? | Tavel
Quel est le cépage principal du rosé de Tavel ? | Le grenache
# mature | Les chiffres de la feuille de paie
Y lit-on son horoscope ? | Non
Que veut dire « brut » ? | Avant les cotisations
Et « net » ? | Ce qui arrive sur le compte (après cotisations)
Quel est le pourcentage approximatif de cotisations salariales ? | Environ 22 %
Que veut dire CSG ? | Contribution sociale généralisée
Que signifie RTT ? | Réduction du temps de travail
Que veut dire CRDS ? | Contribution au remboursement de la dette sociale
Quelle est la durée légale du travail hebdomadaire ? | 35 heures
Combien d'années doit-on garder une fiche de paie, selon les conseils de l'État ? | À vie (jusqu'à la retraite)
Combien de temps l'employeur doit-il conserver les doubles ? | 5 ans
# mature | Le sommeil
Dort-on mieux avec un marteau-piqueur ? | Non
Combien d'heures par nuit conseille-t-on à un adulte ? | 7 à 9 heures
Quel animal compte-t-on pour s'endormir ? | Les moutons
Comment s'appelle le sommeil des rêves ? | Le sommeil paradoxal
Combien de minutes dure à peu près un cycle ? | 90 minutes
Quelle hormone favorise l'endormissement ? | La mélatonine
Quel nom porte l'arrêt de la respiration pendant la nuit ? | L'apnée du sommeil
Quel Français a nommé le sommeil paradoxal ? | Michel Jouvet
Comment s'appelle le rêve où l'on se sait en train de rêver ? | Le rêve lucide
Quelle est la protéine dont le manque cause la narcolepsie ? | L'hypocrétine (ou orexine)
# mature | La lunette de vue
Porte-t-on ses lunettes sur le coude ? | Non
Quel professionnel les vend ? | L'opticien
Quel médecin prescrit des lunettes ? | L'ophtalmologue
Que corrigent des verres progressifs ? | La presbytie (et la vue de loin)
Comment appelle-t-on le fait de voir flou de loin ? | La myopie
Et voir mal de près avec l'âge ? | La presbytie
Quel Américain aurait inventé les verres à double foyer ? | Benjamin Franklin
Dans quel pays seraient apparues les premières lunettes, vers 1290 ? | L'Italie
Quelle ville du Jura est la capitale française de la lunette ? | Morez (Oyonnax accepté)
Quelle est l'unité des corrections optiques ? | La dioptrie
# mature | Les assurances auto
L'assurance couvre-t-elle le mauvais goût ? | Non
Qu'est-ce qu'un « tiers » ? | Une autre personne que l'assuré
Quel papier remplit-on à deux après un accident ? | Le constat amiable
Quel est l'assurance minimale obligatoire ? | La responsabilité civile
Comment s'appelle le système de récompense pour bon conducteur ? | Le bonus-malus
Le bonus maximal correspond à quel coefficient ? | 0,50
Combien d'années sans accident faut-il pour atteindre ce bonus ? | 13 ans
Comment s'appelle la somme laissée à ma charge lors d'un sinistre ? | La franchise
Quel est le délai légal pour déclarer un accident ? | 5 jours
Quel est le délai pour un vol ? | 2 jours
# mature | La retraite des autres
Le père Noël part-il à la retraite ? | Non, toujours pas
Comment dit-on d'une personne en retraite qui garde les petits-enfants ? | Papi ou mamie
Quel mot pour un ancien travailleur ? | Retraité
Quel âge légal a été fixé en 2023, avant la suspension ? | 64 ans
Quel âge pour le taux plein automatique ? | 67 ans
Quelle année a vu l'abaissement de l'âge à 60 ans ? | 1982
Sous quel président ? | François Mitterrand
Combien de trimestres pour un taux plein, génération 1973 ? | 172
Quel chancelier allemand a mis en place les premières retraites, en 1889 ? | Otto von Bismarck
Quel caisse de complément de retraite regroupe les salariés du privé ? | L'Agirc-Arrco
# mature | La facture d'électricité
Se paye-t-elle en coquillages ? | Non
Quelle entreprise a longtemps eu le monopole ? | EDF
Quelle unité sert à la facturation ? | Le kilowattheure
Quel compteur jaune communicant a remplacé l'ancien ? | Linky
Que veut dire « heures creuses » ? | Heures où l'électricité est moins chère
Qui gère le réseau de distribution ? | Enedis
Que veut dire TURPE ? | Tarif d'utilisation des réseaux publics d'électricité
Quelle réaction fournit la majorité de l'électricité française ? | La fission nucléaire
En quelle année EDF a-t-il été créé ? | 1946
Quel réseau gère les lignes à très haute tension ? | RTE
# mature | Les crédits immobiliers
Un crédit se rembourse-t-il en sourires ? | Non
Qui prête l'argent en général ? | La banque
Qu'est-ce qu'une mensualité ? | Une somme payée chaque mois
Qu'est-ce qu'un apport ? | L'argent mis de sa poche au départ
Que veut dire TAEG ? | Taux annuel effectif global
Quel taux maximal d'endettement recommande le HCSF ? | 35 %
Quelle durée maximale de prêt recommande-t-il ? | 25 ans (27 dans le neuf)
Quel prêt aidé par l'État concerne les primo-accédants ? | Le PTZ (prêt à taux zéro)
Quel tableau détaille intérêts et capital ? | Le tableau d'amortissement
Comment s'appelle l'indemnité payée en cas de remboursement anticipé ? | IRA, indemnité de remboursement anticipé
# mature | Le barème des pourboires
Laisse-t-on un pourboire à son chat ? | Non
Où en laisse-t-on souvent ? | Au restaurant
Quel pays attend environ 20 % de pourboire ? | Les États-Unis
Le service est-il compris en France ? | Oui, depuis 1987
Dans quel pays le pourboire peut-il vexer ? | Le Japon
Quel pays a un « Trinkgeld » ? | L'Allemagne
Que veut dire « Trinkgeld » ? | L'argent pour boire
Quel mot américain désigne le pourboire ? | Le tip
Que signifie « pourboire » à l'origine ? | Pour que le serveur aille boire
Quelle loi de 1987 inclut le service ? | L'arrêté de 1987 sur le prix net
# mature | Le divorce
Peut-on divorcer de son chat ? | Non
Comment se fait-on signifier son divorce gentiment ? | Par consentement mutuel
Quel professionnel accompagne chacun ? | L'avocat
Depuis 2017, le juge est-il nécessaire pour un divorce amiable ? | Non, un notaire enregistre
Qu'est-ce qu'une garde alternée ? | Enfants chez chaque parent à tour de rôle
Quelle somme verse-t-on parfois pour l'enfant ? | La pension alimentaire
Quelle somme compense la chute de niveau de vie ? | La prestation compensatoire
Quelle loi de 1975 a instauré le divorce par consentement mutuel ? | La loi Giscard (du 11 juillet 1975)
En quelle année le divorce a-t-il été rétabli en France ? | 1884
Quel député a donné son nom à cette loi de 1884 ? | Alfred Naquet
# mature | Les plombiers
Les plombiers sauvent-ils des princesses ? | Oui, s'ils s'appellent Mario
Comment s'appelle le frère de Mario ? | Luigi
Que répare le plombier ? | Les fuites
Quelle pince utilise-t-on sur un tuyau ? | La pince multiprise
Que dévisse-t-on sous l'évier pour déboucher ? | Le siphon
Quel produit chimique déconseillé bouche les tuyaux ? | La soude caustique
À quoi sert un joint de PTFE, ou téflon ? | À étanchéifier un raccord fileté
De quel métal étaient les anciennes canalisations, d'où le nom de plombier ? | Le plomb
Quel est le nom du symbole chimique de ce métal ? | Pb
D'où vient-il ? | Du latin plumbum
# mature | L'aspirine et l'armoire à pharmacie
Une aspirine se met-elle dans le réservoir de la voiture ? | Non
Où conserve-t-on ses médicaments ? | Dans l'armoire à pharmacie
Quel produit désinfecte une plaie ? | L'antiseptique
Que soigne le paracétamol ? | La douleur et la fièvre
Quelle marque a rendu célèbre le paracétamol français ? | Doliprane
Quel est le maximum quotidien sur la notice pour un adulte, sans avis médical ? | 3 g (selon la notice)
Quel laboratoire allemand a déposé la marque Aspirin ? | Bayer
De quel arbre vient le principe actif de l'aspirine ? | Le saule
Quel Français a synthétisé l'acide acétylsalicylique pour la première fois en 1853 ? | Charles Gerhardt
Quelle molécule n'est-elle pas un AINS : ibuprofène, aspirine ou paracétamol ? | Le paracétamol
# mature | Les voisins
Le voisin a-t-il le droit de tondre la nuit ? | Non
Quel objet emprunte-t-on classiquement au voisin ? | Du sel (ou du sucre, une échelle)
Quelle fête nationale célèbre les voisins ? | La fête des voisins
Qui a lancé cette fête en 1999 ? | Atanase Périfan
Qui gère les parties communes d'un immeuble ? | Le syndic
Quel article du Code civil donne le droit de propriété ? | L'article 544
Quelle distance minimale pour planter un arbre de plus de 2 m, en limite ? | 2 mètres
Et un arbre de moins de 2 m ? | 50 cm
Quel est le nom du mur commun à deux propriétés ? | Le mur mitoyen
Quel est le tapage interdit de nuit ? | Le tapage nocturne
# mature | Le chauffe-eau
Fait-il du café ? | Non
Où stocke-t-il l'eau ? | Dans un ballon (cuve)
Pourquoi prend-on une douche froide ? | Le ballon est vide
Quel dépôt encrasse sa résistance ? | Le calcaire
Quelle pièce le protège de la corrosion ? | L'anode (en magnésium)
Quelle température limite les légionelles ? | Au moins 55 °C
Quelle bactérie redoute-t-on dans un ballon trop froid ? | La légionelle
Quelle maladie cause-t-elle ? | La légionellose
Quel type de chauffe-eau utilise une pompe à chaleur ? | Le thermodynamique
Quel Norvégien a inventé le chauffe-eau électrique à accumulation ? | Edwin Ruud
# mature | Le chien au quotidien
Le chien vote-t-il ? | Non
Que ramasse-t-on derrière lui ? | Ses crottes
Qu'est-ce qu'il rapporte à son maître ? | La balle
Quel vaccin était obligatoire pour voyager ? | La rage
Que contient la puce d'identification ? | Un numéro
Qu'est-ce qu'un chien de catégorie 1 ? | Un chien d'attaque
Quel est l'âge adulte d'un chien, à peu près ? | 1 à 2 ans
Quelle est la plus petite race ? | Le chihuahua
Comment s'appelle le chien de Tintin ? | Milou
Comment s'appelle la chienne de l'espace ? | Laïka
# mature | L'apéro du voisin
Sert-on des radis avec du ciment ? | Non
Quel gâteau salé apporte-t-on à l'apéro ? | Le cake salé
Quelles petites choses sont apportées à l'apéro ? | Les cacahuètes
Quel nom d'origine espagnole pour ces petits plats ? | Les tapas
Quel apéritif anisé boit-on à Marseille ? | Le pastis
Quelle ville est celle du kir ? | Dijon
Quel maire a donné son nom au kir ? | Félix Kir
Quelle est la crème du kir ? | Le cassis
Comment s'appelle le kir au champagne ? | Le kir royal
Quel métier était celui de Félix Kir ? | Chanoine
# mature | Les expressions au téléphone
Dit-on « allô » au poisson ? | Non
Que répond-on si on se trompe de numéro ? | Pardon
Combien de chiffres a un numéro français ? | 10
Quel indicatif est celui de la France ? | +33
Quel est l'indicatif de la Belgique ? | +32
Quel est celui de la Suisse ? | +41
Quel inventeur a popularisé le mot « allô » ? | Thomas Edison
Quelle marque finlandaise a vendu le 3310 ? | Nokia
En quelle année est sorti le Nokia 3310 ? | 2000
Quel opérateur français a lancé la marque Free Mobile en 2012 ? | Free (Iliad)
# mature | La météo du dimanche
Le soleil se couche-t-il à l'ouest ? | Oui
Que porte-t-on sous la pluie ? | Un parapluie
Quel signe de la météo annonce la pluie ? | Des nuages gris
Que mesure l'hygromètre ? | L'humidité de l'air
Que mesure l'anémomètre ? | La vitesse du vent
Quelle échelle mesure le vent en mer ? | L'échelle de Beaufort
Quel établissement public fait les prévisions en France ? | Météo-France
Quelle présentatrice est connue pour sa longue carrière à TF1 ? | Évelyne Dhéliat
Quelle unité mesure la pression atmosphérique ? | L'hectopascal
Quel nom porte un nuage en forme de champignon lors d'un orage ? | Le cumulonimbus
# mature | Les couches et les bébés
Un bébé boit-il un expresso ? | Non
Que change-t-on souvent ? | La couche
Quelle est la boisson du nourrisson ? | Le lait
Qu'est-ce qu'une tétine ? | Un objet pour apaiser le bébé
À quel âge marche-t-il environ ? | Vers 12 à 15 mois
Quelle marque américaine de couches ? | Pampers
Quel est le poids moyen à la naissance ? | Environ 3,3 kg
Quelle note évalue un nouveau-né à la naissance ? | Le score d'Apgar
Quelle médecin américaine a créé ce score ? | Virginia Apgar
Comment s'appelle le fin duvet du nouveau-né ? | Le lanugo
# scolaire | La table de 7
Combien font 7 × 1 ? | 7
Combien font 7 × 2 ? | 14
Combien font 7 × 5 ? | 35
Combien font 7 × 8 ? | 56
Combien font 7 × 13 ? | 91
Combien font 7 × 17 ? | 119
Combien font 7 au carré, moins 7 ? | 42
Combien font 7 au cube ? | 343
Combien font 7 puissance 4 ? | 2 401
Quelle est la période du développement décimal de 1/7 ? | 142857
# scolaire | Le compas et l'équerre
Un compas sert-il à manger la soupe ? | Non, à tracer des cercles
Quel instrument trace un angle droit ? | L'équerre
Combien de degrés a un angle droit ? | 90
Combien vaut la somme des angles d'un triangle ? | 180 degrés
Quel instrument mesure un angle ? | Le rapporteur
Comment s'appelle un polygone à 8 côtés ? | Un octogone
Et à 12 côtés ? | Un dodécagone
Quel Grec a écrit les « Éléments » ? | Euclide
Quel polygone régulier Gauss a-t-il construit à 19 ans ? | L'heptadécagone (17 côtés)
Quel problème antique, impossible au compas et à la règle, est prouvé en 1882 ? | La quadrature du cercle
# scolaire | Les fractions
Une demi-pizza, c'est combien de pizza ? | La moitié
Combien de quarts dans une unité ? | 4
Combien font 1/2 + 1/2 ? | 1
Combien font 1/2 + 1/3 ? | 5/6
Quelle fraction simplifiée vaut 12/18 ? | 2/3
Combien fait 3/4 divisé par 3/8 ? | 2
Comment appelle-t-on le nombre du dessous ? | Le dénominateur
Quel est le plus petit dénominateur commun de 4, 6 et 10 ? | 60
Comment appelle-t-on une fraction de numérateur 1 ? | Une fraction égyptienne (unitaire)
Quel papyrus égyptien contient une table de fractions ? | Le papyrus Rhind
# scolaire | Les chiffres romains
Combien vaut V ? | 5
Combien vaut X ? | 10
Combien vaut L ? | 50
Combien vaut C ? | 100
Combien vaut D ? | 500
Comment écrit-on 4 sur la plupart des textes ? | IV
Comment écrit-on 2026 ? | MMXXVI
Sur les cadrans de montres, comment écrit-on souvent 4 ? | IIII
Quel est le nombre romain le plus long jusqu'à 3999 ? | 3888 (MMMDCCCLXXXVIII)
Que signifie un trait au-dessus d'une lettre romaine ? | Multiplier par 1 000
# scolaire | Le théorème de Thalès
Thalès a-t-il inventé le TGV ? | Non
De quel pays était Thalès ? | La Grèce antique (Milet)
Sur quel monument aurait-il mesuré la hauteur ? | La grande pyramide
Dans quelle figure s'applique le théorème ? | Deux droites parallèles coupant deux sécantes
Grâce à quoi aurait-il mesuré la hauteur ? | L'ombre
Quelle éclipse Thalès aurait-il prédite ? | Celle de 585 av. J.-C.
De quelle cité d'Ionie vient-il ? | Milet
Combien de sages comptaient les Grecs ? | 7
Comment dit-on « théorème de Thalès » en Allemagne ? | Théorème des rayons (Strahlensatz)
Quelle autre propriété porte son nom dans le monde, sur un demi-cercle ? | Tout angle inscrit dans un demi-cercle est droit
# scolaire | Les conjugaisons au passé simple
Dit-on « je mangeai » ? | Oui
Que devient « aller » à « il » au passé simple ? | Il alla
Et « être » à « je » ? | Je fus
Et « avoir » à « nous » ? | Nous eûmes
Et « venir » à « ils » ? | Ils vinrent
Et « croître » à « il » ? | Il crût
Et « coudre » à « je » ? | Je cousis
Et « moudre » à « je » ? | Je moulus
Et « résoudre » à « il » ? | Il résolut
Et « vêtir » à « ils » ? | Ils vêtirent
# scolaire | Les pluriels bizarres
Quel est le pluriel de « cheval » ? | Chevaux
Et de « journal » ? | Journaux
Et de « carnaval » ? | Carnavals
Et de « œil » ? | Yeux
Et de « bal » ? | Bals
Et de « travail » ? | Travaux
Et de « vitrail » ? | Vitraux
Et de « ail » ? | Aulx (ou ails)
Et de « bétail » ? | Il n'a pas de pluriel
Et de « monsieur » ? | Messieurs
# scolaire | Les mots invariables et pièges
Écrit-on « parmis » avec un s ? | Non, parmi
Écrit-on « malgré que » dans un bon français ? | À éviter
Quel mot : « quand même » ou « quand-même » ? | Quand même
« Tout de suite » s'écrit-il avec un trait d'union ? | Non
Écrit-on « autant pour moi » ou « au temps pour moi » ? | Au temps pour moi
Combien de « r » dans « courrier » ? | 2
Combien de « l » dans « appeler » ? | 1 (appeler)
Combien de « p » dans « apercevoir » ? | 1
Quel est le féminin de « favori » ? | Favorite
Combien de « n » dans « honneur », puis « honorable » ? | 2, puis 1
# scolaire | Les figures de style
Dit-on « Paris est une ville lumière » ? Une comparaison ou une métaphore ? | Une métaphore
Si je dis « rouge comme une tomate » ? | Une comparaison
Comment appelle-t-on une exagération ? | Une hyperbole
Comment appelle-t-on le fait de dire moins pour dire plus ? | Une litote
Quel exemple classique : « Va, je ne te hais point » ? | Une litote
Quelle figure donne une personnalité à un objet ? | La personnification
Comment appelle-t-on la répétition d'une même consonne ? | Une allitération
Quelle figure unit deux mots contraires ? | Un oxymore
Comment s'appelle la répétition d'un mot en tête de phrases ? | Une anaphore
Comment s'appelle la partie pour le tout, comme « une voile » pour un bateau ? | Une synecdoque
# scolaire | L'alexandrin et la poésie
Un alexandrin est-il un habitant d'Égypte seulement ? | Non, aussi un vers de 12 syllabes
Combien de syllabes dans un alexandrin ? | 12
Comment s'appelle un poème de quatorze vers ? | Un sonnet
Comment s'appelle une strophe de 4 vers ? | Un quatrain
De 3 vers ? | Un tercet
Comment s'appelle la pause au milieu de l'alexandrin ? | La césure
Quel poème de Baudelaire commence par « Sois sage, ô ma douleur » ? | Recueillement
Qui a écrit le « Dormeur du val » ? | Arthur Rimbaud
Comment appelle-t-on une rime qui alterne ABAB ? | Une rime croisée
Quel nom pour une syllabe finale muette en -e, en poésie ? | Le e muet (ou caduc)
# scolaire | Les conjonctions de coordination
Quelle phrase les retient en français ? | « Mais où est donc Ornicar ? »
Combien sont-elles ? | 7
Citez la première. | Mais
Citez la dernière. | Car
Quel est le mot qui est en fait un adverbe ? | Donc
Quelle est la nature de « parce que » ? | Une conjonction de subordination
Et « lorsque » ? | Une conjonction de subordination
Dans « que je sache », quel mode ? | Le subjonctif
Quel est le mode après « après que » ? | L'indicatif
Quel est le mode après « avant que » ? | Le subjonctif
# scolaire | Le Moyen Âge à la loupe
Un chevalier part-il en mission à vélo ? | Non, à cheval
Où vit le seigneur ? | Dans un château fort
Comment s'appelle le fossé plein d'eau ? | Les douves
Quelle tour est la plus haute du château ? | Le donjon
Quel pont se relève ? | Le pont-levis
Quel impôt payait-on à l'Église ? | La dîme
Quelle est la bataille de 1066 ? | Hastings
Quel duc a gagné cette bataille ? | Guillaume le Conquérant
Quelle broderie raconte cette conquête ? | La tapisserie de Bayeux
Quel droit obligeait les paysans à utiliser le four du seigneur ? | La banalité
# scolaire | Louis XIV en détail
Louis XIV vivait-il à la Maison-Blanche ? | Non, à Versailles
Quel surnom portait-il ? | Le Roi-Soleil
Quel âge avait-il à son avènement ? | 4 ans
Quel cardinal a dirigé pendant sa minorité ? | Mazarin
Qui était la régente ? | Anne d'Autriche
Quel ministre finances ? | Colbert
Quel était l'architecte de Versailles ? | Jules Hardouin-Mansart
Quel jardinier a dessiné les jardins ? | André Le Nôtre
Quel édit révoque-t-il en 1685 ? | L'édit de Nantes (par l'édit de Fontainebleau)
Quel est le nom de l'épouse secrète ? | Madame de Maintenon
# scolaire | Napoléon à la loupe
Napoléon est-il né à Paris ? | Non, à Ajaccio
De quelle île vient-il ? | La Corse
Quelle bataille perd-il en 1815 ? | Waterloo
Sur quelle île meurt-il ? | Sainte-Hélène
Comment s'appelle son code de lois ? | Le Code civil
Quelle bataille gagne-t-il le 2 décembre 1805 ? | Austerlitz
En quelle année est-il sacré empereur ? | 1804
Quel surnom donnait-on à son fils ? | L'Aiglon
Quelle fut sa première épouse ? | Joséphine de Beauharnais
Sur quelle île s'est-il exilé d'abord ? | L'île d'Elbe
# scolaire | La Première Guerre mondiale
Les soldats y allaient-ils à trottinette ? | Non
Comment s'appelle le surnom des soldats français ? | Les poilus
Où vivaient-ils ? | Dans les tranchées
En quelle année a-t-elle commencé ? | 1914
Quel jour de novembre marque l'armistice ? | Le 11 novembre
Quelle bataille de 1916 dure dix mois ? | Verdun
Dans quelle ville est assassiné l'archiduc François-Ferdinand ? | Sarajevo
Quel traité de 1919 met fin à la guerre ? | Le traité de Versailles
Dans quel wagon est signé l'armistice ? | À Rethondes (forêt de Compiègne)
Quel général français dit « Ils ne passeront pas » ? | Robert Nivelle
# scolaire | La Ve République
Combien de Républiques a connues la France ? | 5
Qui fonde la Ve ? | Charles de Gaulle
En quelle année ? | 1958
Quel symbole représente la République ? | Marianne
Combien de présidents a-t-elle eus à 2024 ? | 8
Qui succède à de Gaulle ? | Georges Pompidou
Quel président a réduit le mandat à 5 ans ? | Jacques Chirac
Quel est le nombre de membres du Conseil constitutionnel ? | 9
Qui en était président en 2022 ? | Laurent Fabius
En quelle année a lieu le référendum sur l'élection directe ? | 1962
# scolaire | Les capitales d'Europe de l'Est
Quelle est la capitale de la Pologne ? | Varsovie
De la Hongrie ? | Budapest
De la Roumanie ? | Bucarest
De la Bulgarie ? | Sofia
De la Slovaquie ? | Bratislava
De la Moldavie ? | Chișinău
De la Slovénie ? | Ljubljana
De la Lettonie ? | Riga
De la Biélorussie ? | Minsk
De la Macédoine du Nord ? | Skopje
# scolaire | Les pays d'Amérique du Sud
Quel pays a la forme longue et étroite ? | Le Chili
Quel pays est le plus grand ? | Le Brésil
Quelle est la capitale du Brésil ? | Brasília
Quelle est celle de l'Argentine ? | Buenos Aires
Celle du Pérou ? | Lima
Celle de la Colombie ? | Bogota
Quelle ville a deux capitales pour la Bolivie ? | La Paz et Sucre
Celle de l'Uruguay ? | Montevideo
Celle du Paraguay ? | Asuncion
Quelle est la capitale du Suriname ? | Paramaribo
# scolaire | Les départements français
Quel numéro a Paris ? | 75
Quel numéro a le Nord ? | 59
Quel numéro a la Corse-du-Sud ? | 2A
Quel est le numéro de la Haute-Garonne ? | 31
Quel est le chef-lieu de la Gironde ? | Bordeaux
Quel est le numéro de la Lozère ? | 48
Quel est le chef-lieu de l'Ain ? | Bourg-en-Bresse
Quel est le chef-lieu de la Meuse ? | Bar-le-Duc
Quel est le chef-lieu de la Creuse ? | Guéret
Quel est le numéro du Tarn-et-Garonne ? | 82
# scolaire | Les fleuves du monde
Quel fleuve traverse Londres ? | La Tamise
Et Le Caire ? | Le Nil
Et Rome ? | Le Tibre
Et Lisbonne ? | Le Tage
Quel fleuve traverse New York ? | L'Hudson
Quel est le fleuve le plus long d'Asie ? | Le Yangzi Jiang
Quel fleuve sépare les États-Unis et le Mexique ? | Le Rio Grande
Dans quelle mer se jette la Volga ? | La mer Caspienne
Quel fleuve africain a les chutes Victoria ? | Le Zambèze
Quel fleuve d'Afrique est le seul à franchir deux fois l'équateur ? | Le Congo
# scolaire | Les îles
Dans quel océan est la Réunion ? | L'océan Indien
Quelle île française est surnommée « Île de Beauté » ? | La Corse
Quelle est la plus grande île du monde ? | Le Groenland
Quelle est la plus grande de la Méditerranée ? | La Sicile
Quelle est la plus grande île de France métropolitaine ? | La Corse
Combien d'îles principales au Japon ? | 4
Quelle île de l'Atlantique sud est un territoire britannique, malouines ? | Les Malouines
Quelle est la capitale de la Nouvelle-Calédonie ? | Nouméa
Quelle est l'île française la plus proche de Madagascar ? | Mayotte
Quel archipel français est au large de Terre-Neuve ? | Saint-Pierre-et-Miquelon
# scolaire | Le tableau périodique
Quel est le symbole de l'oxygène ? | O
Et de l'hydrogène ? | H
Et de l'or ? | Au
Et de l'argent ? | Ag
Et du sodium ? | Na
Et du potassium ? | K
Quel est le numéro atomique du carbone ? | 6
Quel Russe a créé le tableau ? | Dmitri Mendeleïev
Quel est l'élément le plus abondant de l'univers ? | L'hydrogène
Quel est le seul métal liquide à température ambiante ? | Le mercure
# scolaire | La photosynthèse
Une plante mange-t-elle des pizzas ? | Non
Quelle lumière lui sert ? | La lumière du soleil
Quel gaz absorbe-t-elle ? | Le dioxyde de carbone
Quel gaz rejette-t-elle ? | L'oxygène
Quel pigment vert capte la lumière ? | La chlorophylle
Dans quels organites a lieu la photosynthèse ? | Les chloroplastes
Quel sucre produit-elle ? | Le glucose
Quels sont les petits trous des feuilles ? | Les stomates
Quel cycle porte le nom d'un chimiste américain ? | Le cycle de Calvin
Quelle enzyme, la plus abondante sur Terre, fixe le CO2 ? | La RuBisCO
# scolaire | Les états de l'eau
L'eau a-t-elle le goût de fraise, naturellement ? | Non
Quel est l'état de la glace ? | Solide
À quelle température gèle-t-elle ? | 0 °C
À quelle température bout-elle ? | 100 °C
Comment appelle-t-on le passage de liquide à gaz ? | La vaporisation
Et de solide à gaz ? | La sublimation
Et de gaz à solide ? | La condensation solide
Quelle formule a-t-elle ? | H2O
À quelle température l'eau est-elle la plus dense ? | 4 °C
Quel est le point triple de l'eau ? | 0,01 °C
# scolaire | La cellule et l'ADN
Peut-on voir une cellule à l'œil nu ? | La plupart du temps, non
Avec quoi l'observe-t-on ? | Un microscope
Que contient le noyau ? | L'ADN
Que veut dire ADN ? | Acide désoxyribonucléique
Quelle est sa forme ? | Une double hélice
Combien de chromosomes a un humain ? | 46
Quels sont les quatre bases ? | A, T, C, G
Quels savants ont décrit sa structure en 1953 ? | Watson et Crick
Quelle chercheuse a pris la photo 51 ? | Rosalind Franklin
Quel moine a établi les lois de l'hérédité ? | Gregor Mendel
# scolaire | Le squelette
Un squelette joue-t-il du xylophone sur ses côtes, sauf dans les dessins animés ? | Non
Comment s'appelle l'os de la cuisse ? | Le fémur
L'os de la tête ? | Le crâne
Celui de l'épaule, en triangle ? | L'omoplate (la scapula)
Combien de côtes a un humain, par paires ? | 12
Où est la rotule ? | Au genou
Comment s'appelle le petit os de la cheville qui saille ? | La malléole
Combien de vertèbres cervicales a un humain ? | 7
Comment s'appelle la première ? | L'atlas
Et la deuxième ? | L'axis
# scolaire | Le verbe anglais
Comment dit-on « bonjour » en anglais ? | Hello
Que veut dire « cat » ? | Chat
Quel est le passé de « go » ? | Went
Celui de « be » à la première personne ? | Was
Celui de « eat » ? | Ate
Que veut dire « a pair of trousers » ? | Un pantalon
Quel est le participe de « swim » ? | Swum
Et celui de « drink » ? | Drunk
Et celui de « lie » (s'allonger) ? | Lain
Quel est le passé de « wring » ? | Wrung
# scolaire | Les faux amis anglais
« Library » veut-il dire « librairie » ? | Non, bibliothèque
« Pain » en anglais, ça veut dire ? | Douleur
« Coin » en anglais ? | Une pièce de monnaie
« Actually » ? | En fait
« Sensible » ? | Raisonnable
« Eventually » ? | Finalement
« Chair » ? | Une chaise
« Blesser » se dit-il « bless » ? | Non, « bless » veut dire bénir
« Deception » ? | Une tromperie
« Sympathetic » ? | Compatissant
# scolaire | L'allemand et l'espagnol du collège
Comment dit-on « merci » en allemand ? | Danke
En espagnol ? | Gracias
« Bonjour » en espagnol ? | Hola (ou buenos días)
« Au revoir » en allemand ? | Auf Wiedersehen
Combien de genres a l'allemand ? | 3
Combien de cas a-t-il ? | 4
Que veut dire « Schmetterling » ? | Papillon
Que veut dire « Handschuh » ? | Un gant
Que veut dire « mariposa » en espagnol ? | Papillon
Comment s'appelle la lettre allemande ß ? | Eszett
# scolaire | Le latin qui reste
Le latin se parle-t-il au supermarché ? | Non
Que veut dire « et cetera » ? | Et le reste
Que veut dire « ad vitam aeternam » ? | Pour toujours
Que veut dire « carpe diem » ? | Cueille le jour
Que veut dire « in vino veritas » ? | La vérité est dans le vin
Que veut dire « alea jacta est » ? | Le sort en est jeté
Que veut dire « mea culpa » ? | C'est ma faute
Que veut dire « vade retro » ? | Recule
Qui a dit « Cogito ergo sum » ? | René Descartes
Comment décliner « rosa » au génitif ? | Rosae
# scolaire | Les classiques du bac français
Qui a écrit « Le Cid » ? | Pierre Corneille
Qui a écrit « Phèdre » ? | Jean Racine
Qui a écrit « Le Bourgeois gentilhomme » ? | Molière
Qui a écrit « Candide » ? | Voltaire
Qui a écrit « Madame Bovary » ? | Gustave Flaubert
Qui a écrit « Germinal » ? | Émile Zola
Qui a écrit « Le Rouge et le Noir » ? | Stendhal
Qui a écrit « Bel-Ami » ? | Guy de Maupassant
Qui a écrit « Les Fleurs du mal » ? | Charles Baudelaire
Qui a écrit « Thérèse Desqueyroux » ? | François Mauriac
# scolaire | Les Misérables
Jean Valjean a-t-il volé un yacht ? | Non, un pain
Qui a écrit « Les Misérables » ? | Victor Hugo
Quel policier poursuit Valjean ? | Javert
Quelle enfant adopte-t-il ? | Cosette
Quel gamin de Paris meurt sur la barricade ? | Gavroche
Combien d'années de bagne en tout ? | 19
Quel couple exploite Cosette ? | Les Thénardier
Quel évêque le sauve ? | Monseigneur Myriel
Quel est le matricule de Valjean ? | 24601
En quelle année est paru le roman ? | 1862
# scolaire | Les pièces de Molière
Molière écrivait-il des romans policiers ? | Non, du théâtre
Quel avare cherche sa cassette ? | Harpagon
Quel malade a des médecins ? | Argan
Quelle est la vraie identité de Molière ? | Jean-Baptiste Poquelin
Dans quelle pièce est « Couvrez ce sein » ? | Tartuffe
Quel est le nom du « Misanthrope » ? | Alceste
Quelle pièce est interdite en 1664 ? | Tartuffe
Quel valet rusé a des « fourberies » ? | Scapin
Quelle compagnie a-t-il fondée en 1643 ? | L'Illustre Théâtre
Quelle année meurt-il ? | 1673
# scolaire | Les planètes à la loupe
La Lune est-elle en fromage ? | Non
Quelle est la planète rouge ? | Mars
Quelle est la plus grosse ? | Jupiter
La plus proche du Soleil ? | Mercure
Combien de planètes dans le système solaire ? | 8
Quelle planète tourne sur le côté ? | Uranus
Comment s'appelle la plus grosse tache de Jupiter ? | La Grande Tache rouge
Combien de temps met la lumière du Soleil pour arriver à la Terre ? | Environ 8 minutes
Quel astronome a montré que les planètes ont des orbites elliptiques ? | Johannes Kepler
Qui a découvert Neptune par le calcul ? | Urbain Le Verrier
# scolaire | L'électricité du collège
Une pile se mange-t-elle ? | Non
Quelle unité mesure la tension ? | Le volt
Et l'intensité ? | L'ampère
Et la résistance ? | L'ohm
Quelle loi relie U, R et I ? | La loi d'Ohm
Comment est un montage en série si une ampoule grille ? | Toutes s'éteignent
Que protège un fusible ? | Le circuit
Quel Italien a inventé la pile ? | Alessandro Volta
Quel Américain a fait l'expérience du cerf-volant ? | Benjamin Franklin
Quelle tension sort d'une prise française ? | 230 V
# scolaire | Les poids et mesures
Combien de grammes dans un kilo ? | 1 000
Combien de centimètres dans un mètre ? | 100
Combien de litres dans un mètre cube ? | 1 000
Combien de mètres dans un kilomètre ? | 1 000
Combien vaut un hectare ? | 10 000 m²
Combien vaut un pouce ? | 2,54 cm
Combien vaut un mile ? | Environ 1,6 km
Combien vaut une livre britannique ? | Environ 454 g
Quelle ville conservait le mètre étalon ? | Sèvres
En quelle année a-t-on défini le mètre avec la lumière ? | 1983
# scolaire | L'Égypte antique
Les pyramides sont-elles des résidences secondaires ? | Non, des tombeaux
Quel fleuve traverse le pays ? | Le Nil
Comment s'appellent les rois ? | Les pharaons
Quel Français a déchiffré les hiéroglyphes ? | Champollion
Quelle pierre a permis ce déchiffrement ? | La pierre de Rosette
Dieu à tête de chacal ? | Anubis
Quel pharaon a une tombe découverte en 1922 ? | Toutânkhamon
Qui a découvert cette tombe ? | Howard Carter
Quelle reine a régné en pharaon, à Deir el-Bahari ? | Hatchepsout
Quel pharaon bâtit la plus grande pyramide ? | Khéops
# scolaire | La géologie du dimanche
Un caillou peut-il pondre ? | Non
Comment s'appelle la croûte qui bouge ? | Les plaques tectoniques
Que mesure-t-on avec Richter ? | La magnitude des séismes
Quelle roche fait le sable à plage ? | Le quartz
Quel Allemand a proposé la dérive des continents ? | Alfred Wegener
Quel supercontinent a existé il y a 300 millions d'années ? | La Pangée
Quelle roche forme les falaises d'Étretat ? | La craie
Quelle est la dureté maximale de Mohs ? | 10 (le diamant)
Quelle roche volcanique flotte ? | La pierre ponce
Quel est le minéral de dureté 1 ? | Le talc
# scolaire | L'hymne et les symboles français
La devise de la France est-elle « Fromage, Vin, Baguette » ? | Non
Quelle est la devise ? | Liberté, Égalité, Fraternité
Quel animal est un symbole du pays ? | Le coq
Quelle est la fête nationale ? | Le 14 juillet
Quelle plante est le symbole des rois ? | Le lys
Dans quelle ville a été composée la Marseillaise ? | Strasbourg
Quel est le nom original de la Marseillaise ? | Chant de guerre pour l'armée du Rhin
Depuis quelle année est-elle l'hymne officiel ? | 1879 (d'abord 1795)
Quelle actrice a servi de modèle à Marianne en 1985 ? | Catherine Deneuve (1985)
Quelle était la Marianne de 1969 ? | Brigitte Bardot
# scolaire | L'orthographe des villes
Bordeaux s'écrit-il « Bordo » ? | Non
Comment écrit-on Reims avec un s ? | Oui, Reims
Combien de L dans Lille ? | 2
Comment s'écrit la ville de Metz ? | Avec un z
Comment prononce-t-on Laon ? | Lan
Comment prononce-t-on Auxerre ? | Ausserre
Comment s'écrit le mot pour habitants de Reims ? | Les Rémois
Et pour les habitants de Saint-Étienne ? | Les Stéphanois
Et pour ceux de Bourg-en-Bresse ? | Les Burgiens (ou Bressans)
Et pour ceux de Charleville-Mézières ? | Les Carolomacériens
# scolaire | Les grands explorateurs
Christophe Colomb cherchait-il le Mont-Saint-Michel ? | Non, les Indes
En quelle année arrive-t-il en Amérique ? | 1492
Quel Portugais fait le premier tour du monde (achevé par son équipage) ? | Magellan
Quel Vénitien va en Chine ? | Marco Polo
Quel Français explore le Canada ? | Jacques Cartier
Quel Italien donne son nom à l'Amérique ? | Amerigo Vespucci
Quel navigateur portugais rejoint l'Inde en 1498 ? | Vasco de Gama
Quel Anglais a cartographié le Pacifique ? | James Cook
Qui a atteint le pôle Sud le premier ? | Roald Amundsen
Quel capitaine français a fait le tour du monde au XVIIIe ? | Bougainville
# scolaire | Le calendrier
Combien de jours en février les années bissextiles ? | 29
Combien de mois ? | 12
Quel mois vient après mars ? | Avril
Combien de jours dans une année ordinaire ? | 365
Quel pape a réformé le calendrier en 1582 ? | Grégoire XIII
Quel empereur a donné son nom à juillet ? | Jules César
Et août ? | Auguste
Pourquoi 2100 ne sera-t-elle pas bissextile ? | Les siècles non divisibles par 400 ne le sont pas
Combien de jours ont été sautés en 1582 ? | 10
Comment s'appelle le premier mois du calendrier révolutionnaire ? | Vendémiaire
# scolaire | L'imparfait du subjonctif
Dit-on « qu'il mangeât » ? | Oui
Comment dit-on « que je vienne » à l'imparfait ? | Que je vinsse
Que devient « que tu sois » ? | Que tu fusses
« Que nous ayons » ? | Que nous eussions
« Que je voie » ? | Que je visse
« Qu'il prenne » ? | Qu'il prît
« Que nous allions » ? | Que nous allassions
« Que vous fassiez » ? | Que vous fissiez
« Que je sache » ? | Que je susse
« Qu'ils naissent » ? | Qu'ils naquissent
`;
if (typeof module !== 'undefined') module.exports = DX_QUESTIONS;
