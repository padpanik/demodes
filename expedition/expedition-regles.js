// ================== EXPÉDITION : LIEUX, QUESTIONS, CARTE À EMBRANCHEMENTS ==================
// On part en balade avec son compagnon dans un lieu à thème (culture générale) : un chemin qui monte, avec des fourches.
// Étapes : gardiens (une question), coffres (étoiles ou souvenir pour la maison), buvette (+1 cœur), et un boss final
// qui défie le joueur sur un jeu de la collection contre l'ordinateur. 3 cœurs : une mauvaise réponse en coûte un.
// Utilisé par expedition/index.html ; testable avec Node (module.exports en bas).

var EX = (function () {
  // ---------- Lieux ----------
  // Un seul lieu prêt pour l'instant ; les autres sont annoncés (thème, boss prévu).
  var LIEUX = [
    { id: 'cinema', nom: 'Studio de cinéma', ico: '🎬', theme: 'Cinéma', pret: true,
      desc: 'Plateaux de tournage, tapis rouge et projecteurs.',
      couleurs: { fond: '#1d1630', sol1: '#3a2f52', sol2: '#443862', bord: '#2a2140', chemin: '#c92a2a', cheminBord: '#f4c430',
                  dessus: '#f3e6c8', gauche: '#b99a68', droite: '#9c7f52' },
      decor: ['🎥', '📽️', '🎞️', '💡', '🍿', '🎟️', '🪑', '🎬'],
      gardiens: [{ nom: 'La projectionniste', ico: '📽️' }, { nom: 'Le cascadeur', ico: '🤸' }, { nom: 'La scénariste', ico: '✍️' },
                 { nom: 'Le maquilleur', ico: '💄' }, { nom: 'La costumière', ico: '🧵' }, { nom: 'Le perchman', ico: '🎙️' }, { nom: 'L\'ouvreuse', ico: '🔦' }],
      repos: { nom: 'La buvette du studio', ico: '🥤', texte: 'Un verre de limonade et un peu de pop-corn : tu reprends des forces.' },
      boss: { nom: 'Le Fantôme du studio', ico: '👻', jeu: 'quatre', nomJeu: 'Quatre en ligne', consigne: 'tu as les jetons rouges et tu commences.',
              defi: 'Bouh ! Personne ne quitte mon studio sans m\'avoir battu au Quatre en ligne !',
              victoire: 'Nooon… Tu m\'as battu ! Le studio est à toi.', defaite: 'Hé hé ! Le studio reste hanté… Une revanche ?' },
      souvenirs: ['clap', 'popcorn', 'bobine', 'projecteur'] },
    { id: 'sciences', nom: 'Laboratoire', ico: '🔬', theme: 'Sciences', pret: true,
      desc: 'Éprouvettes, étoiles et grandes découvertes.',
      couleurs: { fond: '#0d2b33', sol1: '#1f4f5a', sol2: '#265d69', bord: '#173c45', chemin: '#1c7ed6', cheminBord: '#66d9e8',
                  dessus: '#e3f4f1', gauche: '#9cc4bf', droite: '#7aa7a1' },
      decor: ['🧪', '⚗️', '🔭', '🧲', '🧬', '💡', '🦠', '🔋'],
      gardiens: [{ nom: 'La chimiste', ico: '⚗️' }, { nom: 'L\'astronome', ico: '🔭' }, { nom: 'Le botaniste', ico: '🌱' }, { nom: 'La biologiste', ico: '🧬' },
                 { nom: 'Le robot assistant', ico: '🤖' }, { nom: 'L\'inventeur', ico: '💡' }, { nom: 'La géologue', ico: '🪨' }],
      repos: { nom: 'La cafétéria du labo', ico: '☕', texte: 'Un chocolat chaud et un biscuit, loin des éprouvettes : tu reprends des forces.' },
      boss: { nom: 'Le Savant fou', ico: '🧑‍🔬', jeu: 'bataille', nomJeu: 'Bataille navale', consigne: 'place ta flotte, puis tire le premier.',
              defi: 'Ha ha ha ! Ma flotte expérimentale est invincible ! Ose donc m\'affronter à la Bataille navale !',
              victoire: 'Impossible… Mes calculs étaient parfaits ! Le laboratoire est à toi.', defaite: 'Ha ha ! La science triomphe ! Une revanche ?' },
      souvenirs: ['microscope', 'eprouvettes', 'telescope', 'aimant'] },
    { id: 'histoire', nom: 'Château fort', ico: '🏰', theme: 'Histoire', pret: false, desc: 'Chevaliers, rois et grandes dates.', bossJeu: 'Assaut' },
    { id: 'geo', nom: 'Île aux trésors', ico: '🏝️', theme: 'Géographie', pret: false, desc: 'Pays, capitales, fleuves et montagnes.', bossJeu: 'Dominos' },
    { id: 'musique', nom: 'Conservatoire', ico: '🎼', theme: 'Musique', pret: false, desc: 'Instruments, chansons et compositeurs.', bossJeu: 'Yams' },
    { id: 'nature', nom: 'Forêt enchantée', ico: '🌳', theme: 'Nature et animaux', pret: false, desc: 'Bêtes, plantes et saisons.', bossJeu: 'Quatre en ligne' }
  ];
  function lieu(id) { return LIEUX.find(l => l.id === id); }

  // Difficulté : questions (niveau 1 facile, 2 moyen) et niveau de l'ordinateur pour le boss
  var DIFFICULTES = {
    balade: { nom: 'Balade', desc: 'Questions faciles, boss gentil', moyennes: 0, boss: 'facile', gainQuestion: 1 },
    aventure: { nom: 'Aventure', desc: 'Questions plus dures, boss coriace', moyennes: 0.6, boss: 'normal', gainQuestion: 2 }
  };
  var COEURS = 3, GAIN_BOSS = 5;
  // Coffres : des poussières d'étoile (5 poussières = 1 étoile, le reste est gardé pour la prochaine fois)
  var POUSSIERES_PAR_ETOILE = 5;
  // Le compagnon a besoin de se reposer : une expédition par heure
  var REPOS = 3600000;

  // ---------- Questions (maison) : q, r = [bonne réponse, 3 mauvaises], n = niveau (1 facile, 2 moyen), x = petite explication ----------
  var QUESTIONS = {
    cinema: [
      { q: 'Qui a réalisé « Les Dents de la mer » (1975) ?', r: ['Steven Spielberg', 'George Lucas', 'Martin Scorsese', 'Francis Ford Coppola'], n: 1, x: 'Spielberg avait 28 ans : le requin mécanique tombait si souvent en panne qu\'on le voit très peu !' },
      { q: 'Dans quelle saga entend-on « Que la Force soit avec toi » ?', r: ['Star Wars (La Guerre des étoiles)', 'Star Trek', 'Dune', 'Avatar'], n: 1, x: 'La première « Guerre des étoiles » de George Lucas est sortie en 1977.' },
      { q: 'Quel acteur joue Jack dans « Titanic » (1997) ?', r: ['Leonardo DiCaprio', 'Brad Pitt', 'Matt Damon', 'Johnny Depp'], n: 1, x: 'Face à lui, Kate Winslet joue Rose.' },
      { q: 'Dans « Le Magicien d\'Oz », comment s\'appelle le petit chien de Dorothy ?', r: ['Toto', 'Milou', 'Pluto', 'Rantanplan'], n: 1, x: 'Toto était joué par une chienne cairn terrier nommée Terry.' },
      { q: 'Quel personnage de Disney porte un short rouge et de grandes oreilles rondes ?', r: ['Mickey', 'Donald', 'Dingo', 'Pluto'], n: 1, x: 'Mickey est né en 1928 dans le dessin animé « Steamboat Willie ».' },
      { q: 'Qui joue le commissaire Juve dans les « Fantômas » des années 1960 ?', r: ['Louis de Funès', 'Bourvil', 'Jean Gabin', 'Fernandel'], n: 1, x: 'Jean Marais y joue à la fois Fantômas et le journaliste Fandor.' },
      { q: 'Quel grand festival de cinéma a lieu chaque printemps sur la Croisette ?', r: ['Le festival de Cannes', 'La Mostra de Venise', 'La Berlinale', 'Le festival de Deauville'], n: 1, x: 'La Croisette est la promenade du bord de mer de Cannes.' },
      { q: 'Dans « La Grande Vadrouille » (1966), qui fait équipe avec Louis de Funès ?', r: ['Bourvil', 'Jean Marais', 'Lino Ventura', 'Jean-Paul Belmondo'], n: 1, x: 'Le film de Gérard Oury a longtemps été le plus grand succès du cinéma français.' },
      { q: 'Dans « Le Roi lion », comment s\'appelle le père de Simba ?', r: ['Mufasa', 'Scar', 'Rafiki', 'Timon'], n: 1, x: 'Scar est l\'oncle de Simba, Rafiki le vieux singe sage.' },
      { q: 'Quel extraterrestre de Spielberg veut « téléphoner maison » ?', r: ['E.T.', 'Alf', 'Yoda', 'Stitch'], n: 1, x: '« E.T. l\'extra-terrestre » est sorti en 1982.' },
      { q: 'Quel film de 1939 raconte l\'histoire de Scarlett O\'Hara ?', r: ['Autant en emporte le vent', 'Casablanca', 'Rebecca', 'Les Hauts de Hurlevent'], n: 1, x: 'Vivien Leigh y joue Scarlett, et Clark Gable Rhett Butler.' },
      { q: 'Quel agent secret porte le matricule 007 ?', r: ['James Bond', 'Jason Bourne', 'Ethan Hunt', 'OSS 117'], n: 1, x: 'Le premier film, « James Bond 007 contre Dr No », date de 1962, avec Sean Connery.' },
      { q: 'Où se passe l\'action des « Bronzés font du ski » ?', r: ['À la montagne', 'À la plage', 'À Paris', 'En Afrique'], n: 1, x: 'Après le Club de vacances en Côte d\'Ivoire, la bande part aux sports d\'hiver (1979).' },
      { q: 'Quel acteur surnommé « Bébel » joue dans « À bout de souffle » ?', r: ['Jean-Paul Belmondo', 'Alain Delon', 'Jean Gabin', 'Gérard Depardieu'], n: 1, x: 'Le film de Jean-Luc Godard (1960) est un symbole de la Nouvelle Vague.' },
      { q: 'Quels frères français ont inventé le cinématographe ?', r: ['Les frères Lumière', 'Les frères Montgolfier', 'Les frères Goncourt', 'Les frères Dupont'], n: 1, x: 'Auguste et Louis Lumière, à Lyon, en 1895.' },
      { q: 'Dans « Harry Potter », comment s\'appelle l\'école de sorcellerie ?', r: ['Poudlard', 'Beauxbâtons', 'Durmstrang', 'Brocéliande'], n: 1, x: 'Beauxbâtons et Durmstrang sont deux autres écoles de magie de la saga.' },
      { q: 'Quelle actrice joue Amélie Poulain ?', r: ['Audrey Tautou', 'Marion Cotillard', 'Juliette Binoche', 'Sophie Marceau'], n: 1, x: '« Le Fabuleux Destin d\'Amélie Poulain » est sorti en 2001.' },
      { q: 'Qui lance « Hasta la vista, baby » dans « Terminator 2 » ?', r: ['Le Terminator', 'Rambo', 'Rocky', 'RoboCop'], n: 1, x: 'Le Terminator est joué par Arnold Schwarzenegger.' },
      { q: 'Dans « Le Seigneur des anneaux », que doit détruire Frodon ?', r: ['Un anneau', 'Une épée', 'Une couronne', 'Un livre'], n: 1, x: 'L\'Anneau unique doit être jeté dans les flammes de la Montagne du Destin.' },
      { q: 'Quel acteur a créé le personnage de Charlot ?', r: ['Charlie Chaplin', 'Buster Keaton', 'Harold Lloyd', 'Stan Laurel'], n: 1, x: 'Chapeau melon, canne et moustache : Charlot apparaît dès 1914.' },
      { q: 'Quel dessin animé met en scène les jouets Woody et Buzz l\'Éclair ?', r: ['Toy Story', 'Cars', 'Shrek', 'L\'Âge de glace'], n: 1, x: 'Sorti en 1995, c\'est le premier long métrage entièrement en images de synthèse.' },
      { q: 'Comment s\'appelle l\'ogre vert qui vit dans un marais ?', r: ['Shrek', 'Hulk', 'Le Grinch', 'Yoda'], n: 1, x: 'Shrek est sorti en 2001 ; son meilleur ami est un âne bavard.' },
      { q: 'Dans « Bienvenue chez les Ch\'tis », dans quelle région le héros est-il muté ?', r: ['Le Nord', 'La Bretagne', 'La Provence', 'L\'Alsace'], n: 1, x: 'Le directeur de la poste arrive à Bergues, près de Dunkerque.' },
      { q: 'Quel est le premier long métrage d\'animation de Disney (1937) ?', r: ['Blanche-Neige et les Sept Nains', 'Pinocchio', 'Bambi', 'Cendrillon'], n: 1, x: 'On l\'avait surnommé « la folie de Disney » : tout le monde pensait que ce serait un échec.' },
      { q: 'Quel réalisateur est célèbre pour « Psychose » et « Les Oiseaux » ?', r: ['Alfred Hitchcock', 'Stanley Kubrick', 'Orson Welles', 'Billy Wilder'], n: 1, x: 'Le « maître du suspense » apparaissait toujours quelques secondes dans ses films.' },
      { q: 'Quel film de Spielberg (1993) ramène des dinosaures à la vie ?', r: ['Jurassic Park', 'King Kong', 'Godzilla', 'Le Monde perdu de Conan'], n: 1, x: 'Les dinosaures y sont recréés grâce à de l\'ADN conservé dans de l\'ambre.' },
      { q: 'Quel acteur incarne l\'archéologue Indiana Jones ?', r: ['Harrison Ford', 'Kevin Costner', 'Mel Gibson', 'Tom Selleck'], n: 1, x: 'Harrison Ford jouait déjà Han Solo dans « La Guerre des étoiles ».' },
      { q: 'Dans « Retour vers le futur », quelle voiture sert de machine à voyager dans le temps ?', r: ['Une DeLorean', 'Une Ford Mustang', 'Une Cadillac', 'Une Coccinelle'], n: 1, x: 'Elle doit atteindre 88 miles à l\'heure pour voyager dans le temps.' },
      { q: 'Avec qui François Cluzet partage-t-il l\'affiche d\'« Intouchables » (2011) ?', r: ['Omar Sy', 'Jamel Debbouze', 'Dany Boon', 'Kad Merad'], n: 1, x: 'Omar Sy a reçu le César du meilleur acteur pour ce rôle.' },
      { q: 'Quel robot doré et bavard accompagne R2-D2 dans « Star Wars » ?', r: ['C-3PO', 'BB-8', 'WALL-E', 'Robby'], n: 1, x: 'C-3PO parle « plus de six millions de formes de communication ».' },
      { q: 'En quelle année les frères Lumière font-ils leur première projection publique payante à Paris ?', r: ['1895', '1875', '1910', '1925'], n: 2, x: 'Le 28 décembre 1895, au Salon indien du Grand Café, boulevard des Capucines.' },
      { q: 'Quel film de Georges Méliès (1902) montre une fusée plantée dans l\'œil de la Lune ?', r: ['Le Voyage dans la Lune', 'Metropolis', 'Nosferatu', 'L\'Arrivée d\'un train'], n: 2, x: 'Méliès, ancien magicien, a inventé de nombreux trucages du cinéma.' },
      { q: 'Qui a réalisé « Le Fabuleux Destin d\'Amélie Poulain » ?', r: ['Jean-Pierre Jeunet', 'Luc Besson', 'Jacques Audiard', 'Claude Lelouch'], n: 2, x: 'Jeunet avait déjà réalisé « Delicatessen » avec Marc Caro.' },
      { q: 'Quel film de 1927 est considéré comme le premier long métrage parlant ?', r: ['Le Chanteur de jazz', 'Metropolis', 'Les Temps modernes', 'Chantons sous la pluie'], n: 2, x: 'Al Jolson y lance : « Vous n\'avez encore rien entendu ! »' },
      { q: 'Qui joue Rick, le patron du café, dans « Casablanca » (1942) ?', r: ['Humphrey Bogart', 'Cary Grant', 'Clark Gable', 'James Stewart'], n: 2, x: 'Il y donne la réplique à Ingrid Bergman.' },
      { q: 'Quel film de Jacques Demy est entièrement chanté ?', r: ['Les Parapluies de Cherbourg', 'Jules et Jim', 'Le Mépris', 'Hôtel du Nord'], n: 2, x: 'Musique de Michel Legrand, avec Catherine Deneuve (1964).' },
      { q: 'Qui a réalisé « Le Grand Bleu » (1988) ?', r: ['Luc Besson', 'Jean-Jacques Annaud', 'Claude Berri', 'Patrice Leconte'], n: 2, x: 'Le film raconte la rivalité de deux plongeurs en apnée.' },
      { q: 'Qui joue Obélix dans les films « Astérix » à partir de 1999 ?', r: ['Gérard Depardieu', 'Christian Clavier', 'Jean Reno', 'Gérard Jugnot'], n: 2, x: 'Christian Clavier jouait Astérix dans les deux premiers films.' },
      { q: 'Dans « Le Parrain » (1972), qui joue Vito Corleone ?', r: ['Marlon Brando', 'Al Pacino', 'Jack Nicholson', 'Dustin Hoffman'], n: 2, x: 'Al Pacino y joue son fils Michael.' },
      { q: 'Combien d\'images par seconde défilent dans un film de cinéma classique ?', r: ['24', '12', '50', '100'], n: 2, x: 'C\'est la norme depuis l\'arrivée du cinéma parlant, à la fin des années 1920.' },
      { q: 'Quel film de Chaplin (1936) montre un ouvrier pris dans les engrenages d\'une usine ?', r: ['Les Temps modernes', 'Le Kid', 'La Ruée vers l\'or', 'Le Dictateur'], n: 2, x: 'C\'est le dernier film où apparaît Charlot.' },
      { q: 'Quelle actrice française a reçu l\'Oscar de la meilleure actrice pour « La Môme » ?', r: ['Marion Cotillard', 'Isabelle Huppert', 'Catherine Deneuve', 'Sophie Marceau'], n: 2, x: 'Elle y incarne Édith Piaf ; l\'Oscar lui a été remis en 2008.' },
      { q: 'Qui a réalisé « Les Quatre Cents Coups » (1959) ?', r: ['François Truffaut', 'Jean-Luc Godard', 'Éric Rohmer', 'Claude Chabrol'], n: 2, x: 'Le jeune Antoine Doinel y est joué par Jean-Pierre Léaud.' },
      { q: 'Dans « Le Dîner de cons », comment s\'appelle le personnage de Jacques Villeret ?', r: ['François Pignon', 'Pierre Brochant', 'Juste Leblanc', 'Lucien Cheval'], n: 2, x: 'Pierre Brochant est joué par Thierry Lhermitte.' },
      { q: 'Qui a écrit les dialogues des « Tontons flingueurs » (1963) ?', r: ['Michel Audiard', 'Jacques Prévert', 'Marcel Pagnol', 'Sacha Guitry'], n: 2, x: '« Les cons, ça ose tout. C\'est même à ça qu\'on les reconnaît. »' },
      { q: 'Qui a composé la musique de « La Guerre des étoiles » et des « Dents de la mer » ?', r: ['John Williams', 'Hans Zimmer', 'Ennio Morricone', 'Vladimir Cosma'], n: 2, x: 'Il a aussi signé les musiques d\'« E.T. », d\'« Indiana Jones » et des premiers « Harry Potter ».' },
      { q: 'Quel compositeur italien a signé la musique du « Bon, la Brute et le Truand » ?', r: ['Ennio Morricone', 'Nino Rota', 'John Williams', 'Michel Legrand'], n: 2, x: 'Il a composé la musique de nombreux westerns de Sergio Leone.' },
      { q: 'Qui a réalisé « Le Voyage de Chihiro » ?', r: ['Hayao Miyazaki', 'Isao Takahata', 'Makoto Shinkai', 'Akira Kurosawa'], n: 2, x: 'Le film du studio Ghibli a reçu l\'Ours d\'or à Berlin en 2002.' },
      { q: 'Dans « Les Visiteurs » (1993), comment s\'appelle le chevalier joué par Jean Reno ?', r: ['Godefroy de Montmirail', 'Jacquouille la Fripouille', 'Perceval le Gallois', 'Lancelot du Lac'], n: 2, x: 'Jacquouille, son écuyer, est joué par Christian Clavier.' },
      { q: 'Quelle ville accueille la Mostra, le plus ancien festival de cinéma du monde ?', r: ['Venise', 'Rome', 'Cannes', 'Berlin'], n: 2, x: 'La première Mostra a eu lieu en 1932.' },
      { q: 'Quelle récompense reçoit le meilleur film du festival de Cannes ?', r: ['La Palme d\'or', 'Le Lion d\'or', 'L\'Ours d\'or', 'Le César'], n: 2, x: 'Le Lion d\'or est remis à Venise, l\'Ours d\'or à Berlin.' },
      { q: 'Dans quel film d\'Hitchcock le héros, la jambe dans le plâtre, espionne ses voisins ?', r: ['Fenêtre sur cour', 'Sueurs froides', 'La Mort aux trousses', 'Rebecca'], n: 2, x: 'James Stewart et Grace Kelly en sont les vedettes (1954).' },
      { q: 'Quelle chanson Dorothy chante-t-elle dans « Le Magicien d\'Oz » ?', r: ['Over the Rainbow', 'Singin\' in the Rain', 'Moon River', 'As Time Goes By'], n: 2, x: 'Judy Garland avait 16 ans au tournage.' },
      { q: 'En quelle année ont été remis les premiers César du cinéma français ?', r: ['1976', '1946', '1959', '1990'], n: 2, x: 'La première cérémonie était présidée par Jean Gabin.' },
      { q: 'Dans quel film de Fellini Anita Ekberg se baigne-t-elle dans la fontaine de Trevi ?', r: ['La dolce vita', 'Huit et demi', 'Amarcord', 'La Strada'], n: 2, x: 'Le film a reçu la Palme d\'or à Cannes en 1960.' }
    ],
    sciences: [
      { q: "Quelle planète est surnommée la « planète rouge » ?", r: ["Mars", "Jupiter", "Vénus", "Saturne"], n: 1, x: "Son sol est riche en oxyde de fer : c'est de la rouille qui lui donne sa couleur." },
      { q: "Quelle est la formule chimique de l'eau ?", r: ["H₂O", "CO₂", "O₂", "NaCl"], n: 1, x: "Deux atomes d'hydrogène et un atome d'oxygène. NaCl, c'est le sel de cuisine." },
      { q: "Quel gaz les plantes rejettent-elles à la lumière (photosynthèse) ?", r: ["L'oxygène", "Le dioxyde de carbone", "L'azote", "L'hélium"], n: 1, x: "Elles absorbent le dioxyde de carbone de l'air et rejettent de l'oxygène." },
      { q: "À quelle température l'eau bout-elle au niveau de la mer ?", r: ["100 °C", "90 °C", "120 °C", "80 °C"], n: 1, x: "En montagne, l'air est moins dense : l'eau y bout un peu avant 100 °C." },
      { q: "Quelle est l'étoile la plus proche de la Terre ?", r: ["Le Soleil", "Proxima du Centaure", "Sirius", "L'étoile Polaire"], n: 1, x: "Juste après le Soleil vient Proxima du Centaure, à environ 4,2 années-lumière." },
      { q: "Combien de pattes a une araignée ?", r: ["8", "6", "10", "4"], n: 1, x: "Les insectes en ont 6 ; l'araignée n'est pas un insecte mais un arachnide." },
      { q: "Quel savant est célèbre pour la pomme qui lui serait tombée dessus ?", r: ["Isaac Newton", "Galilée", "Albert Einstein", "Louis Pasteur"], n: 1, x: "L'anecdote illustre sa réflexion sur la gravitation universelle (fin du XVIIe siècle)." },
      { q: "Quel organe pompe le sang dans tout le corps ?", r: ["Le cœur", "Le foie", "Les poumons", "L'estomac"], n: 1, x: "Il bat environ 100 000 fois par jour." },
      { q: "Quelle est la plus grosse planète du système solaire ?", r: ["Jupiter", "Saturne", "Neptune", "La Terre"], n: 1, x: "On pourrait loger plus de 1 300 Terres à l'intérieur." },
      { q: "Qui a mis au point le premier vaccin contre la rage, en 1885 ?", r: ["Louis Pasteur", "Marie Curie", "Robert Koch", "Edward Jenner"], n: 1, x: "Le jeune Joseph Meister, mordu par un chien enragé, fut le premier sauvé." },
      { q: "Quel est le plus grand animal du monde ?", r: ["La baleine bleue", "L'éléphant d'Afrique", "La girafe", "Le requin-baleine"], n: 1, x: "Elle peut dépasser 25 mètres de long : plus grande que tous les dinosaures connus." },
      { q: "Combien de planètes compte le système solaire ?", r: ["8", "9", "7", "10"], n: 1, x: "Pluton a été rangée parmi les « planètes naines » en 2006." },
      { q: "Quel est le symbole chimique de l'or ?", r: ["Au", "Or", "Ag", "Fe"], n: 1, x: "Au vient du latin aurum. Ag, c'est l'argent." },
      { q: "Que mesure un thermomètre ?", r: ["La température", "La pression de l'air", "Le poids", "La vitesse du vent"], n: 1, x: "La pression de l'air se mesure avec un baromètre, le vent avec un anémomètre." },
      { q: "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?", r: ["1969", "1959", "1975", "1981"], n: 1, x: "Neil Armstrong et Buzz Aldrin, mission Apollo 11, le 21 juillet 1969 (heure française)." },
      { q: "Quel est l'os le plus long du corps humain ?", r: ["Le fémur", "Le tibia", "L'humérus", "Le péroné"], n: 1, x: "C'est l'os de la cuisse." },
      { q: "Quel scientifique est l'auteur de la formule E = mc² ?", r: ["Albert Einstein", "Isaac Newton", "Stephen Hawking", "Niels Bohr"], n: 1, x: "Elle date de 1905 : la masse est une forme d'énergie." },
      { q: "Quelle savante a reçu deux prix Nobel, en physique puis en chimie ?", r: ["Marie Curie", "Rosalind Franklin", "Ada Lovelace", "Irène Joliot-Curie"], n: 1, x: "En 1903 (physique) et en 1911 (chimie). Sa fille Irène a aussi eu le prix Nobel, une fois." },
      { q: "Dans quel état est l'eau quand elle gèle ?", r: ["Solide", "Liquide", "Gazeux", "Elle disparaît"], n: 1, x: "La glace prend un peu plus de place que l'eau liquide : c'est pour ça qu'elle flotte." },
      { q: "Combien de temps met la Terre pour faire le tour du Soleil ?", r: ["Environ un an", "Un jour", "Un mois", "Dix ans"], n: 1, x: "Un peu plus de 365 jours : d'où le 29 février tous les quatre ans." },
      { q: "Quel instrument sert à observer les étoiles ?", r: ["Le télescope", "Le microscope", "Le stéthoscope", "Le baromètre"], n: 1, x: "Le microscope, lui, grossit ce qui est tout petit et tout proche." },
      { q: "Qu'est-ce qui attire les objets en fer ?", r: ["Un aimant", "Un élastique", "Du verre", "Du bois"], n: 1, x: "La Terre elle-même est un énorme aimant : c'est ce qui fait tourner l'aiguille des boussoles." },
      { q: "Comment appelle-t-on le petit de la grenouille ?", r: ["Le têtard", "L'alevin", "Le faon", "La chenille"], n: 1, x: "Il vit dans l'eau, respire avec des branchies, puis perd sa queue en devenant grenouille." },
      { q: "Combien de dents a un adulte, dents de sagesse comprises ?", r: ["32", "28", "24", "36"], n: 1, x: "Sans les quatre dents de sagesse, il en reste 28." },
      { q: "Quel organe nous sert à respirer ?", r: ["Les poumons", "Le cœur", "Les reins", "Le foie"], n: 1, x: "Ils font passer l'oxygène de l'air dans le sang." },
      { q: "Qui a mis au point une ampoule électrique durable en 1879 ?", r: ["Thomas Edison", "Nikola Tesla", "Graham Bell", "Alessandro Volta"], n: 1, x: "Il n'était pas seul : l'Anglais Joseph Swan y travaillait en même temps." },
      { q: "Quelle planète a de grands anneaux bien visibles ?", r: ["Saturne", "Mars", "Mercure", "Vénus"], n: 1, x: "Ils sont faits de glace et de poussières. Jupiter, Uranus et Neptune en ont aussi, bien plus discrets." },
      { q: "Le dauphin est…", r: ["Un mammifère", "Un poisson", "Un reptile", "Un amphibien"], n: 1, x: "Il respire de l'air par l'évent sur sa tête et allaite ses petits." },
      { q: "Quel est le satellite naturel de la Terre ?", r: ["La Lune", "Phobos", "Vénus", "Titan"], n: 1, x: "Phobos tourne autour de Mars, Titan autour de Saturne." },
      { q: "Quelle force nous fait retomber quand on saute ?", r: ["La pesanteur (gravité)", "Le magnétisme", "Le frottement de l'air", "L'électricité"], n: 1, x: "La Terre attire tout ce qui a une masse ; sur la Lune, elle est six fois plus faible." },
      { q: "Quel est le gaz le plus abondant dans l'air que nous respirons ?", r: ["L'azote", "L'oxygène", "Le dioxyde de carbone", "L'argon"], n: 2, x: "Environ 78 % d'azote, 21 % d'oxygène, et un peu d'argon et de dioxyde de carbone." },
      { q: "Quel est le symbole chimique du fer ?", r: ["Fe", "Fr", "Ir", "F"], n: 2, x: "Fe vient du latin ferrum. F est le fluor, Ir l'iridium." },
      { q: "Combien d'os compte le squelette d'un adulte ?", r: ["206", "180", "256", "312"], n: 2, x: "Un bébé en a environ 300 : certains se soudent en grandissant." },
      { q: "Quelle est, environ, la vitesse de la lumière ?", r: ["300 000 km par seconde", "30 000 km par seconde", "3 000 km par seconde", "3 millions de km par seconde"], n: 2, x: "Elle ferait plus de sept fois le tour de la Terre en une seconde." },
      { q: "Quelle planète est la plus proche du Soleil ?", r: ["Mercure", "Vénus", "Mars", "La Terre"], n: 2, x: "Une année sur Mercure ne dure que 88 jours terrestres." },
      { q: "Quelle est la planète la plus chaude du système solaire ?", r: ["Vénus", "Mercure", "Mars", "Jupiter"], n: 2, x: "Son épaisse atmosphère de dioxyde de carbone retient la chaleur : environ 460 °C au sol." },
      { q: "Qui a découvert la pénicilline, en 1928 ?", r: ["Alexander Fleming", "Louis Pasteur", "Robert Koch", "Edward Jenner"], n: 2, x: "Une moisissure avait poussé par hasard dans une de ses boîtes de culture… et tuait les bactéries." },
      { q: "Qui a publié « De l'origine des espèces » en 1859 ?", r: ["Charles Darwin", "Jean-Baptiste Lamarck", "Gregor Mendel", "Buffon"], n: 2, x: "Il y explique l'évolution des espèces par la sélection naturelle." },
      { q: "Quel moine a découvert les lois de l'hérédité en étudiant des petits pois ?", r: ["Gregor Mendel", "Charles Darwin", "Lamarck", "Dmitri Mendeleïev"], n: 2, x: "Ses travaux (1865) sont restés presque ignorés pendant 35 ans." },
      { q: "Qui a rangé les éléments chimiques dans un tableau, en 1869 ?", r: ["Dmitri Mendeleïev", "Antoine Lavoisier", "Gregor Mendel", "Niels Bohr"], n: 2, x: "Il avait laissé des cases vides pour des éléments qu'on a découverts ensuite." },
      { q: "Quelle phrase résume la découverte de Lavoisier ?", r: ["« Rien ne se perd, rien ne se crée, tout se transforme »", "« Je pense, donc je suis »", "« Eurêka ! »", "« Et pourtant, elle tourne »"], n: 2, x: "C'est la conservation de la masse lors des réactions chimiques, en version populaire." },
      { q: "Qui aurait crié « Eurêka ! » en sortant de son bain ?", r: ["Archimède", "Pythagore", "Euclide", "Aristote"], n: 2, x: "Il venait de comprendre la poussée qu'un liquide exerce sur un objet plongé dedans." },
      { q: "Quelle est l'unité de la résistance électrique ?", r: ["L'ohm", "Le volt", "L'ampère", "Le watt"], n: 2, x: "Le volt mesure la tension, l'ampère l'intensité du courant, le watt la puissance." },
      { q: "Quelle molécule porte l'information génétique ?", r: ["L'ADN", "L'hémoglobine", "L'insuline", "La caféine"], n: 2, x: "Sa forme en double hélice a été décrite en 1953, grâce notamment aux clichés de Rosalind Franklin." },
      { q: "Combien de chromosomes compte une cellule humaine ?", r: ["46", "23", "48", "64"], n: 2, x: "23 paires : une moitié vient de la mère, l'autre du père." },
      { q: "Quel est le plus grand organe du corps humain ?", r: ["La peau", "Le foie", "Les intestins", "Le cerveau"], n: 2, x: "Elle couvre près de 2 m² chez un adulte." },
      { q: "À quelle température correspond le « zéro absolu » ?", r: ["−273,15 °C", "−100 °C", "−459 °C", "0 °C"], n: 2, x: "C'est la température la plus basse possible : 0 kelvin." },
      { q: "Qui a découvert des lunes autour de Jupiter avec sa lunette, en 1610 ?", r: ["Galilée", "Copernic", "Kepler", "Newton"], n: 2, x: "Io, Europe, Ganymède et Callisto : on les appelle encore les satellites galiléens." },
      { q: "Quel métal est liquide à température ambiante ?", r: ["Le mercure", "Le plomb", "L'étain", "Le zinc"], n: 2, x: "On l'a longtemps utilisé dans les thermomètres, avant de l'interdire car il est toxique." },
      { q: "Combien de temps met la lumière du Soleil pour arriver jusqu'à nous ?", r: ["Environ 8 minutes", "Environ 8 secondes", "Environ 8 heures", "Environ un jour"], n: 2, x: "Elle parcourt les 150 millions de kilomètres qui nous séparent du Soleil." },
      { q: "Comment s'appelle notre galaxie ?", r: ["La Voie lactée", "Andromède", "Le Grand Nuage de Magellan", "Orion"], n: 2, x: "Andromède est la grande galaxie voisine ; Orion est une constellation." },
      { q: "Comment s'appelait le premier satellite artificiel, lancé en 1957 ?", r: ["Spoutnik", "Apollo", "Hubble", "Vostok"], n: 2, x: "Une petite sphère soviétique qui envoyait un « bip-bip » capté par les radios du monde entier." },
      { q: "Quel groupe sanguin est appelé « donneur universel » ?", r: ["O négatif", "AB positif", "A positif", "B négatif"], n: 2, x: "Ses globules rouges peuvent être donnés à presque tout le monde, d'où son importance en urgence." },
      { q: "Où se trouve l'essentiel de l'ADN d'une cellule humaine ?", r: ["Dans le noyau", "Dans la membrane", "Dans les ribosomes", "Dans les vacuoles"], n: 2, x: "Les mitochondries en ont aussi un tout petit peu, transmis par la mère." },
      { q: "Qui a découvert la radioactivité en 1896 ?", r: ["Henri Becquerel", "Pierre Curie", "André-Marie Ampère", "Augustin Fresnel"], n: 2, x: "En étudiant des sels d'uranium ; il a partagé le prix Nobel 1903 avec Pierre et Marie Curie." },
      { q: "Qui fut le premier homme envoyé dans l'espace, en 1961 ?", r: ["Youri Gagarine", "Neil Armstrong", "John Glenn", "Alexeï Leonov"], n: 2, x: "Son vol autour de la Terre, à bord de Vostok 1, a duré 108 minutes." }
    ]
  };

  // ---------- Hasard reproductible (la même graine donne la même carte) ----------
  function hasard(graine) {
    var a = graine >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function melanger(l, h) { l = l.slice(); for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(h() * (i + 1)); var x = l[i]; l[i] = l[j]; l[j] = x; } return l; }

  // Poussières : celles en réserve + celles de l'expédition → étoiles entières et reste
  function convertirPoussiere(reserve, gagnees) { var tout = (reserve || 0) + (gagnees || 0); return { etoiles: Math.floor(tout / POUSSIERES_PAR_ETOILE), reste: tout % POUSSIERES_PAR_ETOILE }; }

  // ---------- Carte procédurale : 7 rangs, départ en bas, boss en haut, fourches entre les deux ----------
  // Grille isométrique en losanges : une case (k, d) existe si k + d est pair ; k grandit vers le bas, d va de -DMAX à DMAX.
  // Chaque carte est différente : nombre d'étapes par rang, place des étapes, écart entre les rangs et tracé des chemins
  // (une marche au hasard case par case, qui serpente mais arrive toujours à l'étape suivante).
  // Un nœud : { id, rang, k, d, type: depart | gardien | coffre | repos | boss } ; chemins['a-b'] = cases du tapis entre a et b.
  var RANGS = 7, DMAX = 5;
  var PAIRES = [[-4, 0], [-4, 2], [-2, 2], [0, 4], [-2, 4], [-4, 4]];
  function genererCarte(graine) {
    var h = hasard(graine), noeuds = [], liens = [], rangs = [], choix = l => l[Math.floor(h() * l.length)];
    for (var r = 0; r < RANGS; r++) {
      var largeur = r === 0 || r === RANGS - 1 ? 1 : (h() < 0.55 ? 2 : 3);
      var ds = largeur === 1 ? [choix([-2, 0, 2])] : largeur === 2 ? choix(PAIRES).slice() : [-4, 0, 4];
      var rang = ds.map(d => {
        var nd = { id: noeuds.length, rang: r, k: 0, d: d, type: r === 0 ? 'depart' : r === RANGS - 1 ? 'boss' : null };
        noeuds.push(nd); return nd;
      });
      rangs.push(rang);
    }
    // Types des étapes intermédiaires : surtout des gardiens, des coffres, une buvette de temps en temps
    for (var r = 1; r < RANGS - 1; r++) {
      var types = rangs[r].map(() => { var x = h(); return x < 0.55 ? 'gardien' : x < 0.84 ? 'coffre' : 'repos'; });
      if (r === 1) types = types.map(t => t === 'repos' ? 'gardien' : t);   // pas de buvette dès le début
      if (!types.includes('gardien')) types[Math.floor(h() * types.length)] = 'gardien';
      rangs[r].forEach((nd, i) => { nd.type = types[i]; });
    }
    // Chemins : chaque étape mène à la (ou les) plus proche(s) du rang suivant ; tout le monde est relié
    for (var r = 0; r < RANGS - 1; r++) {
      var a = rangs[r], b = rangs[r + 1], ecart = (x, y) => Math.abs(x.d - y.d);
      a.forEach(nd => {
        var proches = b.slice().sort((x, y) => ecart(x, nd) - ecart(y, nd));
        liens.push([nd.id, proches[0].id]);
        if (proches[1] && ecart(proches[1], nd) <= 4 && (a.length === 1 || h() < 0.55)) liens.push([nd.id, proches[1].id]);
      });
      b.forEach(nd => {
        if (!liens.some(l => l[1] === nd.id)) liens.push([a.slice().sort((x, y) => ecart(x, nd) - ecart(y, nd))[0].id, nd.id]);
      });
    }
    // Hauteur de chaque rang : 4 ou 6 cases (paires), et assez pour que les chemins puissent aller d'une étape à l'autre
    var k = 2;
    for (var r = RANGS - 1; r >= 0; r--) {
      rangs[r].forEach(nd => { nd.k = k; });
      if (r > 0) {
        var besoin = Math.max.apply(null, liens.filter(l => noeuds[l[1]].rang === r).map(l => Math.abs(noeuds[l[0]].d - noeuds[l[1]].d)));
        var pas = Math.max(h() < 0.5 ? 4 : 6, besoin + (besoin % 2));
        k += pas;
      }
    }
    var carte = { noeuds: noeuds, liens: liens, chemins: {}, kHaut: 2, kBas: k - 0 };
    carte.kBas = rangs[0][0].k;
    tracerChemins(carte, h);
    return carte;
  }
  // Tapis entre deux étapes : on monte d'une case à chaque pas (k - 1) en allant à gauche ou à droite (d ± 1), au hasard,
  // sans jamais s'écarter au point de ne plus pouvoir rejoindre l'arrivée
  function tracerChemins(carte, h) {
    carte.chemins = {};
    carte.liens.forEach(l => {
      var a = carte.noeuds[l[0]], b = carte.noeuds[l[1]], n = a.k - b.k, d = a.d, cases = [];
      for (var t = 1; t < n; t++) {
        var reste = n - t, options = [-1, 1].filter(s => Math.abs(b.d - (d + s)) <= reste && Math.abs(d + s) <= DMAX);
        var s = options.length > 1 ? (h() < 0.5 ? -1 : 1) : options[0];
        d += s; cases.push([a.k - t, d]);
      }
      carte.chemins[l[0] + '-' + l[1]] = cases;
    });
  }
  // Ancienne carte (avant les chemins procéduraux) : on la complète pour pouvoir finir l'expédition en cours
  function completerCarte(carte, graine) {
    if (carte.chemins) return carte;
    carte.noeuds.forEach(nd => { nd.k = 26 - 4 * nd.rang; nd.d = 2 * nd.voie; });
    carte.kHaut = 2; carte.kBas = 26;
    tracerChemins(carte, hasard(graine || 1));
    return carte;
  }
  function suivants(carte, id) { return carte.liens.filter(l => l[0] === id).map(l => l[1]); }

  // ---------- Questions : tirage sans répétition (on évite les questions déjà vues récemment) ----------
  function tirerQuestion(lieuId, difficulte, dejaVues, h) {
    var liste = QUESTIONS[lieuId] || [], d = DIFFICULTES[difficulte] || DIFFICULTES.balade;
    var niveau = h() < d.moyennes ? 2 : 1;
    var idx = liste.map((q, i) => i).filter(i => liste[i].n === niveau);
    var neuves = idx.filter(i => dejaVues.indexOf(lieuId + ':' + i) < 0);
    if (!neuves.length) neuves = liste.map((q, i) => i).filter(i => dejaVues.indexOf(lieuId + ':' + i) < 0);
    if (!neuves.length) neuves = idx.length ? idx : liste.map((q, i) => i);
    var i = neuves[Math.floor(h() * neuves.length)], q = liste[i];
    var ordre = melanger([0, 1, 2, 3], h);
    return { id: lieuId + ':' + i, texte: q.q, choix: ordre.map(k => q.r[k]), bonne: ordre.indexOf(0), niveau: q.n, explication: q.x };
  }

  // ---------- Nouvelle expédition ----------
  // ---------- Coffres : on hésite à les ouvrir ----------
  // 1 fois sur 5, une bestiole s'y cache et vole un cœur ; sinon un souvenir (s'il en reste à trouver) ou des poussières,
  // parfois un gros lot
  var RISQUE_COFFRE = 0.2;
  var BESTIOLES = [
    { ico: '🐀', nom: 'Un rat', texte: 'Un rat bondit du coffre et file avec un de tes cœurs !' },
    { ico: '🦇', nom: 'Une chauve-souris', texte: 'Une chauve-souris s\'envole du coffre en emportant un cœur !' },
    { ico: '🕷️', nom: 'Une araignée', texte: 'Une grosse araignée t\'attendait… elle te pique un cœur !' },
    { ico: '🐍', nom: 'Un serpent', texte: 'Un serpent dormait dans le coffre. Il siffle et te vole un cœur !' }
  ];
  function tirerCoffre(h, souvenirPossible) {
    var x = h();
    if (x < RISQUE_COFFRE) return { type: 'bestiole', bestiole: BESTIOLES[Math.floor(h() * BESTIOLES.length)] };
    if (souvenirPossible && x < RISQUE_COFFRE + 0.3) return { type: 'souvenir' };
    if (h() < 0.12) return { type: 'poussiere', n: 6, gros: true };
    return { type: 'poussiere', n: 2 + Math.floor(h() * 3) };
  }
  function nouvelle(lieuId, difficulte, graine) {
    graine = graine || Math.floor(Math.random() * 1e9);
    return { lieu: lieuId, difficulte: difficulte, graine: graine, carte: genererCarte(graine), pos: 0, visites: [0], trajet: [0],
             coeurs: COEURS, sac: 0, poussiere: 0, souvenirs: [], tentative: 0, aide: false, rencontre: null, fin: null, debut: Date.now(), tirage: 0, bonnes: 0, questions: 0 };
  }
  // Un nombre au hasard propre à l'étape (reproductible pour une même expédition)
  function hasardEtape(e, extra) { return hasard((e.graine ^ (e.pos * 7919) ^ ((extra || 0) * 104729)) >>> 0); }

  // Fin : étoiles gardées (tout si le boss est vaincu, la moitié sinon)
  function gainFinal(e, gagne) { return gagne ? e.sac : Math.floor(e.sac / 2); }

  return { POUSSIERES_PAR_ETOILE: POUSSIERES_PAR_ETOILE, REPOS: REPOS, LIEUX: LIEUX, lieu: lieu, DIFFICULTES: DIFFICULTES, COEURS: COEURS, GAIN_BOSS: GAIN_BOSS, RISQUE_COFFRE: RISQUE_COFFRE, BESTIOLES: BESTIOLES, tirerCoffre: tirerCoffre, QUESTIONS: QUESTIONS, RANGS: RANGS, DMAX: DMAX, completerCarte: completerCarte,
           hasard: hasard, melanger: melanger, convertirPoussiere: convertirPoussiere, genererCarte: genererCarte, suivants: suivants, tirerQuestion: tirerQuestion,
           nouvelle: nouvelle, hasardEtape: hasardEtape, gainFinal: gainFinal };
})();

if (typeof module !== 'undefined') module.exports = EX;
