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
`;
if (typeof module !== 'undefined') module.exports = DX_QUESTIONS;
