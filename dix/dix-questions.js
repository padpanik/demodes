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
`;
if (typeof module !== 'undefined') module.exports = DX_QUESTIONS;
