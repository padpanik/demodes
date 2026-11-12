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
    { id: 'histoire', nom: 'Château fort', ico: '🏰', theme: 'Histoire', pret: true,
      desc: 'Chevaliers, rois et grandes dates.',
      couleurs: { fond: '#1e2733', sol1: '#5b6670', sol2: '#66717b', bord: '#3e4852', chemin: '#8b1e24', cheminBord: '#e0b13f',
                  dessus: '#e9e0cc', gauche: '#b3a68a', droite: '#958868' },
      decor: ['🏰', '⚔️', '🛡️', '🐴', '🏹', '👑', '🕯️', '🚩'],
      gardiens: [{ nom: 'Le héraut', ico: '📯' }, { nom: 'La dame du château', ico: '👸' }, { nom: 'Le forgeron', ico: '⚒️' }, { nom: 'L\'archer', ico: '🏹' },
                 { nom: 'Le moine copiste', ico: '📜' }, { nom: 'Le fou du roi', ico: '🃏' }, { nom: 'La sentinelle', ico: '🛡️' }],
      repos: { nom: 'Les cuisines du château', ico: '🍲', texte: 'Une soupe bien chaude et une tranche de pain de seigle : tu reprends des forces.' },
      boss: { nom: 'Le Chevalier noir', ico: '⚔️', jeu: 'assaut', nomJeu: 'Assaut', consigne: 'partie rapide (10 pièces) : place ton armée, puis prends son drapeau. Tu commences.',
              defi: 'Halte-là ! Nul ne franchit mon pont-levis sans m\'avoir vaincu à l\'Assaut !',
              victoire: 'Je rends les armes… Le château est à toi, vaillant voyageur.', defaite: 'Ton drapeau est à moi ! Une revanche, messire ?' },
      souvenirs: ['blason', 'etendard', 'chandelier', 'heaume'] },
    { id: 'geo', nom: 'Île aux trésors', ico: '🏝️', theme: 'Géographie', pret: true,
      desc: 'Pays, capitales, fleuves et montagnes.',
      couleurs: { fond: '#0b3a4a', sol1: '#e3c98f', sol2: '#ecd49c', bord: '#b8995c', chemin: '#2b8a9e', cheminBord: '#ffe08a',
                  dessus: '#fff4dc', gauche: '#c9a66b', droite: '#a8864e' },
      decor: ['🌴', '🐚', '⚓', '🦀', '🧭', '🗺️', '🥥', '🦜'],
      gardiens: [{ nom: 'Le perroquet bavard', ico: '🦜' }, { nom: 'La navigatrice', ico: '🧭' }, { nom: 'Le pêcheur', ico: '🎣' }, { nom: 'La cartographe', ico: '🗺️' },
                 { nom: 'Le vieux loup de mer', ico: '⚓' }, { nom: 'La plongeuse', ico: '🤿' }, { nom: 'Le mousse', ico: '🪣' }],
      repos: { nom: 'La paillote de la plage', ico: '🥥', texte: 'Un lait de coco bien frais à l\'ombre des palmiers : tu reprends des forces.' },
      boss: { nom: 'Le Capitaine Barbe-Sel', court: 'Barbe-Sel', ico: '🏴‍☠️', jeu: 'domino', nomJeu: 'Dominos', consigne: 'une seule manche de dominos : le premier qui pose sa dernière pièce gagne.',
              defi: 'Arrr ! Mon trésor, il faudra me le gagner aux dominos, moussaillon !',
              victoire: 'Mille sabords… Battu à mon propre jeu ! Le trésor est à toi.', defaite: 'Arrr ! Le trésor reste dans ma cale ! Une revanche ?' },
      souvenirs: ['mappemonde', 'boussole', 'coquillage', 'ancre'] },
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
    geo: [
      { q: "Quelle est la capitale de l'Italie ?", r: ["Rome", "Milan", "Naples", "Venise"], n: 1, x: "Rome est traversée par le Tibre." },
      { q: "Quel est le plus long fleuve de France ?", r: ["La Loire", "La Seine", "Le Rhône", "La Garonne"], n: 1, x: "Environ 1 000 km, du mont Gerbier-de-Jonc (Ardèche) jusqu'à l'Atlantique." },
      { q: "Quel est le plus haut sommet des Alpes ?", r: ["Le mont Blanc", "Le Cervin", "Le mont Rose", "L'Eiger"], n: 1, x: "Il dépasse 4 800 m, à la frontière entre la France et l'Italie." },
      { q: "Sur quel continent se trouve l'Égypte ?", r: ["L'Afrique", "L'Asie", "L'Europe", "L'Océanie"], n: 1, x: "Seule la presqu'île du Sinaï déborde sur l'Asie." },
      { q: "Quelle est la capitale de l'Espagne ?", r: ["Madrid", "Barcelone", "Séville", "Valence"], n: 1, x: "Madrid est presque au centre exact de la péninsule." },
      { q: "Quel est le plus grand océan du monde ?", r: ["L'océan Pacifique", "L'océan Atlantique", "L'océan Indien", "L'océan Arctique"], n: 1, x: "Il couvre à lui seul près d'un tiers de la surface de la Terre." },
      { q: "Quel pays a la forme d'une botte ?", r: ["L'Italie", "La Grèce", "Le Portugal", "La Croatie"], n: 1, x: "La Sicile est le ballon que la botte s'apprête à frapper !" },
      { q: "Quel fleuve traverse Paris ?", r: ["La Seine", "La Loire", "La Marne", "Le Rhône"], n: 1, x: "La Marne s'y jette juste avant Paris, à Charenton." },
      { q: "Quelle est la capitale du Japon ?", r: ["Tokyo", "Kyoto", "Osaka", "Pékin"], n: 1, x: "Kyoto a été la capitale impériale pendant plus de mille ans avant Tokyo." },
      { q: "Quel est le plus grand désert chaud du monde ?", r: ["Le Sahara", "Le désert de Gobi", "Le Kalahari", "L'Atacama"], n: 1, x: "Seul l'Antarctique, un désert froid, est plus grand." },
      { q: "Dans quel pays se trouve la tour penchée de Pise ?", r: ["L'Italie", "L'Espagne", "La France", "La Grèce"], n: 1, x: "Elle penche depuis sa construction, à cause d'un sol trop mou." },
      { q: "Quelle est la capitale du Royaume-Uni ?", r: ["Londres", "Édimbourg", "Manchester", "Dublin"], n: 1, x: "Dublin est la capitale de l'Irlande, un autre pays." },
      { q: "Quel pays a une feuille d'érable sur son drapeau ?", r: ["Le Canada", "Les États-Unis", "La Suisse", "Le Japon"], n: 1, x: "Le sirop d'érable est une fierté du pays." },
      { q: "Quelle mer sépare l'Europe de l'Afrique ?", r: ["La Méditerranée", "La mer du Nord", "La mer Baltique", "La mer Rouge"], n: 1, x: "Son nom veut dire « au milieu des terres »." },
      { q: "Quelle est la plus haute montagne du monde ?", r: ["L'Everest", "Le K2", "Le Kilimandjaro", "Le mont Blanc"], n: 1, x: "Environ 8 849 m, à la frontière entre le Népal et la Chine." },
      { q: "Quelle est la capitale de l'Allemagne ?", r: ["Berlin", "Munich", "Francfort", "Hambourg"], n: 1, x: "Berlin a été coupée en deux par un mur de 1961 à 1989." },
      { q: "Quel est le plus grand pays du monde ?", r: ["La Russie", "Le Canada", "La Chine", "Les États-Unis"], n: 1, x: "Il s'étend de l'Europe jusqu'au Pacifique, sur 11 fuseaux horaires." },
      { q: "Quelle île française est surnommée « l'île de Beauté » ?", r: ["La Corse", "La Réunion", "Belle-Île", "L'île de Ré"], n: 1, x: "Ses montagnes plongent directement dans la Méditerranée." },
      { q: "Dans quel pays vivent les kangourous à l'état sauvage ?", r: ["L'Australie", "La Nouvelle-Zélande", "L'Afrique du Sud", "L'Argentine"], n: 1, x: "Il y en a plus que d'habitants !" },
      { q: "Quelle est la capitale de la Belgique ?", r: ["Bruxelles", "Anvers", "Liège", "Bruges"], n: 1, x: "Elle accueille aussi de nombreuses institutions européennes." },
      { q: "Quel est le plus long fleuve d'Afrique ?", r: ["Le Nil", "Le Congo", "Le Niger", "Le Zambèze"], n: 1, x: "Il traverse l'Égypte et se jette dans la Méditerranée." },
      { q: "Quelle chaîne de montagnes sépare la France de l'Espagne ?", r: ["Les Pyrénées", "Les Alpes", "Les Vosges", "Le Jura"], n: 1, x: "Le petit pays d'Andorre est niché en plein milieu." },
      { q: "Quelle ville italienne est célèbre pour ses canaux et ses gondoles ?", r: ["Venise", "Florence", "Naples", "Turin"], n: 1, x: "Elle est bâtie sur plus d'une centaine de petites îles." },
      { q: "Quelle ville américaine est surnommée « la Grosse Pomme » ?", r: ["New York", "Chicago", "Los Angeles", "Boston"], n: 1, x: "Le surnom vient du monde des courses de chevaux des années 1920." },
      { q: "Quelle est la capitale du Portugal ?", r: ["Lisbonne", "Porto", "Coimbra", "Faro"], n: 1, x: "Elle est construite sur sept collines, au bord du Tage." },
      { q: "Dans quel océan se trouve l'île de La Réunion ?", r: ["L'océan Indien", "L'océan Atlantique", "L'océan Pacifique", "L'océan Arctique"], n: 1, x: "Elle est à l'est de Madagascar, près de l'île Maurice." },
      { q: "Quel pays est surnommé « le pays du Soleil-Levant » ?", r: ["Le Japon", "La Chine", "La Corée du Sud", "La Thaïlande"], n: 1, x: "Vu de la Chine, le Japon est du côté où le soleil se lève." },
      { q: "Quelle est la capitale de la Grèce ?", r: ["Athènes", "Sparte", "Thessalonique", "Rhodes"], n: 1, x: "L'Acropole et le Parthénon dominent la ville." },
      { q: "Sur quel continent se trouve le pôle Sud ?", r: ["L'Antarctique", "L'Arctique", "L'Océanie", "L'Amérique du Sud"], n: 1, x: "L'Arctique, autour du pôle Nord, est un océan gelé, pas un continent." },
      { q: "Quel pays est célèbre pour ses fjords ?", r: ["La Norvège", "Les Pays-Bas", "La Belgique", "Le Portugal"], n: 1, x: "Ce sont d'anciennes vallées creusées par les glaciers, envahies par la mer." },
      { q: "Quelle est la capitale de l'Australie ?", r: ["Canberra", "Sydney", "Melbourne", "Perth"], n: 2, x: "Une ville construite exprès, pour ne choisir ni Sydney ni Melbourne." },
      { q: "Quelle est la capitale du Canada ?", r: ["Ottawa", "Toronto", "Montréal", "Vancouver"], n: 2, x: "Elle est en Ontario, juste à la frontière avec le Québec." },
      { q: "Quel est le plus long fleuve d'Europe ?", r: ["La Volga", "Le Danube", "Le Rhin", "Le Dniepr"], n: 2, x: "Environ 3 500 km en Russie, jusqu'à la mer Caspienne." },
      { q: "Quel est le plus grand lac d'Afrique ?", r: ["Le lac Victoria", "Le lac Tanganyika", "Le lac Malawi", "Le lac Tchad"], n: 2, x: "Il est partagé entre l'Ouganda, le Kenya et la Tanzanie." },
      { q: "Quelle est la capitale du Brésil ?", r: ["Brasilia", "Rio de Janeiro", "São Paulo", "Salvador"], n: 2, x: "Une ville nouvelle, inaugurée en 1960 au milieu du pays." },
      { q: "Quel est le plus petit pays du monde ?", r: ["Le Vatican", "Monaco", "Saint-Marin", "Le Liechtenstein"], n: 2, x: "Moins d'un demi-kilomètre carré, en plein cœur de Rome." },
      { q: "Quel détroit sépare l'Espagne du Maroc ?", r: ["Le détroit de Gibraltar", "Le Bosphore", "Le détroit de Messine", "Le détroit de Béring"], n: 2, x: "Il ne fait qu'une quinzaine de kilomètres au plus étroit." },
      { q: "Quel est le plus long fleuve d'Asie ?", r: ["Le Yangzi Jiang", "Le Gange", "Le Mékong", "L'Indus"], n: 2, x: "Le « fleuve Bleu » coule sur environ 6 300 km en Chine." },
      { q: "Grâce à ses territoires d'outre-mer, quel pays compte le plus de fuseaux horaires ?", r: ["La France", "La Russie", "Les États-Unis", "La Chine"], n: 2, x: "12 fuseaux horaires, et même 13 avec la terre Adélie en Antarctique." },
      { q: "Quel est le plus haut sommet d'Afrique ?", r: ["Le Kilimandjaro", "Le mont Kenya", "Le Ruwenzori", "Le Toubkal"], n: 2, x: "Un volcan de près de 5 900 m, en Tanzanie." },
      { q: "Quel est le lac le plus profond du monde ?", r: ["Le lac Baïkal", "Le lac Tanganyika", "Le lac Supérieur", "Le lac Titicaca"], n: 2, x: "Plus de 1 600 m de fond, en Sibérie." },
      { q: "Quelle est la capitale de la Turquie ?", r: ["Ankara", "Istanbul", "Izmir", "Antalya"], n: 2, x: "Istanbul est la plus grande ville, mais Ankara est la capitale depuis 1923." },
      { q: "Quel fleuve d'Europe traverse dix pays ?", r: ["Le Danube", "Le Rhin", "L'Elbe", "Le Rhône"], n: 2, x: "De la Forêt-Noire en Allemagne jusqu'à la mer Noire." },
      { q: "Quel est le point le plus bas des terres émergées ?", r: ["Les rives de la mer Morte", "La vallée de la Mort", "La dépression de Qattara", "Les rives de la mer Caspienne"], n: 2, x: "Environ 430 m sous le niveau de la mer, entre la Jordanie et Israël." },
      { q: "Quelle est la capitale de la Suisse ?", r: ["Berne", "Zurich", "Genève", "Lausanne"], n: 2, x: "On dit officiellement « ville fédérale »." },
      { q: "Dans quel pays se trouve le désert d'Atacama, l'un des plus secs du monde ?", r: ["Le Chili", "Le Pérou", "Le Mexique", "L'Égypte"], n: 2, x: "Par endroits, il n'y a pas plu depuis des années." },
      { q: "Quelle mer sépare la péninsule arabique de l'Afrique ?", r: ["La mer Rouge", "La mer Noire", "La mer Caspienne", "La mer d'Aral"], n: 2, x: "Le canal de Suez la relie à la Méditerranée." },
      { q: "Quel pays est traversé à la fois par l'équateur et par le tropique du Capricorne ?", r: ["Le Brésil", "L'Australie", "L'Inde", "Le Mexique"], n: 2, x: "C'est même le seul pays au monde dans ce cas." },
      { q: "Quelle est la capitale de la Nouvelle-Zélande ?", r: ["Wellington", "Auckland", "Christchurch", "Canberra"], n: 2, x: "Auckland est plus grande, mais Wellington est la capitale." },
      { q: "Quelles chutes se trouvent à la frontière entre l'Argentine et le Brésil ?", r: ["Les chutes d'Iguaçu", "Les chutes Victoria", "Les chutes du Niagara", "Le Salto Ángel"], n: 2, x: "Près de 300 cascades sur presque 3 km de large." },
      { q: "Quelle est la plus grande île du monde ?", r: ["Le Groenland", "Madagascar", "Bornéo", "La Nouvelle-Guinée"], n: 2, x: "L'Australie, plus grande, compte comme un continent." },
      { q: "Quel est le plus haut sommet d'Amérique du Sud ?", r: ["L'Aconcagua", "Le Chimborazo", "Le Huascarán", "Le Fitz Roy"], n: 2, x: "Près de 7 000 m, dans les Andes argentines." },
      { q: "Quelle est la capitale du Maroc ?", r: ["Rabat", "Casablanca", "Marrakech", "Fès"], n: 2, x: "Casablanca est plus grande, mais le roi siège à Rabat." },
      { q: "Combien d'États composent les États-Unis ?", r: ["50", "48", "51", "52"], n: 2, x: "Les deux derniers, l'Alaska et Hawaï, sont entrés en 1959." },
      { q: "Quel estuaire naît de la rencontre de la Garonne et de la Dordogne ?", r: ["La Gironde", "La Charente", "L'Adour", "La Rance"], n: 2, x: "C'est le plus grand estuaire d'Europe occidentale." }
    ],
    histoire: [
      { q: "Qui a été sacré empereur des Français en 1804 ?", r: ["Napoléon Bonaparte", "Louis XIV", "Charlemagne", "Henri IV"], n: 1, x: "Le sacre a eu lieu à Notre-Dame de Paris, le 2 décembre 1804." },
      { q: "Quel roi était surnommé le « Roi-Soleil » ?", r: ["Louis XIV", "Louis XVI", "François Ier", "Henri IV"], n: 1, x: "Il a fait de Versailles le cœur du pouvoir royal." },
      { q: "En quelle année la Bastille a-t-elle été prise ?", r: ["1789", "1715", "1815", "1848"], n: 1, x: "Le 14 juillet 1789 ; ce jour est devenu la fête nationale." },
      { q: "Quelle jeune femme a délivré Orléans, assiégée par les Anglais, en 1429 ?", r: ["Jeanne d'Arc", "Catherine de Médicis", "Marie-Antoinette", "Aliénor d'Aquitaine"], n: 1, x: "On la surnomme depuis « la Pucelle d'Orléans »." },
      { q: "Quelle guerre a opposé la France et l'Angleterre de 1337 à 1453 ?", r: ["La guerre de Cent Ans", "La guerre de Trente Ans", "La guerre de Sept Ans", "Les guerres de Religion"], n: 1, x: "Elle a en réalité duré 116 ans, entrecoupés de longues trêves." },
      { q: "Dans quel château Louis XIV installe-t-il sa cour en 1682 ?", r: ["Versailles", "Chambord", "Fontainebleau", "Vincennes"], n: 1, x: "Son père y avait seulement un pavillon de chasse." },
      { q: "Quel peuple a bâti les grandes pyramides de Gizeh ?", r: ["Les Égyptiens", "Les Romains", "Les Grecs", "Les Mayas"], n: 1, x: "La plus grande, celle de Khéops, a plus de 4 500 ans." },
      { q: "Quel chef gaulois s'est rendu à Jules César après le siège d'Alésia ?", r: ["Vercingétorix", "Astérix", "Brennus", "Ambiorix"], n: 1, x: "C'était en 52 avant Jésus-Christ." },
      { q: "Quel roi des Francs a été couronné empereur à Rome le jour de Noël de l'an 800 ?", r: ["Charlemagne", "Clovis", "Pépin le Bref", "Hugues Capet"], n: 1, x: "La Chanson de Roland en fait « l'empereur à la barbe fleurie »." },
      { q: "Comment appelle-t-on le fossé, souvent rempli d'eau, qui entoure un château fort ?", r: ["Les douves", "Les remparts", "Le donjon", "La herse"], n: 1, x: "On le franchissait par le pont-levis." },
      { q: "Quelle est la tour principale, la plus solide, d'un château fort ?", r: ["Le donjon", "Le beffroi", "La barbacane", "La poterne"], n: 1, x: "C'était le dernier refuge du seigneur pendant un siège." },
      { q: "Quel navigateur a atteint l'Amérique en 1492 ?", r: ["Christophe Colomb", "Magellan", "Vasco de Gama", "Marco Polo"], n: 1, x: "Il croyait être arrivé aux Indes, d'où le nom d'« Indiens »." },
      { q: "Quelle reine de France a été guillotinée en 1793 ?", r: ["Marie-Antoinette", "Catherine de Médicis", "Anne d'Autriche", "Joséphine de Beauharnais"], n: 1, x: "Épouse de Louis XVI, exécuté quelques mois avant elle." },
      { q: "Dans quelle ville se dresse le Colisée ?", r: ["Rome", "Athènes", "Naples", "Venise"], n: 1, x: "On y organisait des combats de gladiateurs devant des dizaines de milliers de spectateurs." },
      { q: "Qui a été le premier homme à marcher sur la Lune, en 1969 ?", r: ["Neil Armstrong", "Youri Gagarine", "Buzz Aldrin", "John Glenn"], n: 1, x: "Buzz Aldrin l'a rejoint quelques minutes plus tard." },
      { q: "En quelle année la Seconde Guerre mondiale s'est-elle terminée en Europe ?", r: ["1945", "1918", "1939", "1950"], n: 1, x: "L'Allemagne a capitulé le 8 mai 1945." },
      { q: "Quel mur est tombé en 1989 ?", r: ["Le mur de Berlin", "La Grande Muraille", "Le mur d'Hadrien", "Le mur des Lamentations"], n: 1, x: "Il coupait la ville en deux depuis 1961." },
      { q: "Quel hors-la-loi de légende volait les riches pour donner aux pauvres, dans la forêt de Sherwood ?", r: ["Robin des Bois", "Guillaume Tell", "Lancelot", "Ivanhoé"], n: 1, x: "Son ennemi juré était le shérif de Nottingham." },
      { q: "Autour de quelle table s'asseyaient les chevaliers du roi Arthur ?", r: ["La Table ronde", "La Table carrée", "La Grande Table", "La Table d'honneur"], n: 1, x: "Ronde, pour qu'aucun chevalier ne siège au-dessus des autres." },
      { q: "À quel roi prête-t-on le vœu que chaque paysan ait « la poule au pot » le dimanche ?", r: ["Henri IV", "Louis XIII", "François Ier", "Philippe le Bel"], n: 1, x: "On l'appelait aussi « le bon roi Henri »." },
      { q: "Comment s'appelle la grille qu'on abaissait pour fermer l'entrée d'un château ?", r: ["La herse", "Le pont-levis", "La meurtrière", "Le créneau"], n: 1, x: "Elle descendait d'un coup dans des rainures creusées dans la pierre." },
      { q: "Comment s'appelle la chemise faite de petits anneaux de fer que portaient les chevaliers ?", r: ["La cotte de mailles", "Le pourpoint", "La toge", "Le hennin"], n: 1, x: "Le hennin, lui, était un grand chapeau pointu porté par les dames." },
      { q: "Qui a mis au point l'imprimerie à caractères mobiles en Europe, vers 1450 ?", r: ["Gutenberg", "Léonard de Vinci", "Galilée", "Copernic"], n: 1, x: "Son premier grand livre imprimé est une Bible." },
      { q: "Quel peintre italien a peint « La Joconde » ?", r: ["Léonard de Vinci", "Michel-Ange", "Raphaël", "Botticelli"], n: 1, x: "Il l'a emportée en France, à la cour de François Ier ; elle est aujourd'hui au Louvre." },
      { q: "En quelle année a commencé la Première Guerre mondiale ?", r: ["1914", "1870", "1939", "1905"], n: 1, x: "L'armistice a été signé le 11 novembre 1918." },
      { q: "Quel jour fête-t-on la fête nationale française ?", r: ["Le 14 juillet", "Le 11 novembre", "Le 8 mai", "Le 1er mai"], n: 1, x: "Elle rappelle la prise de la Bastille et la fête de la Fédération de 1790." },
      { q: "Quels guerriers venus du Nord naviguaient sur des drakkars ?", r: ["Les Vikings", "Les Huns", "Les Celtes", "Les Romains"], n: 1, x: "La proue de leurs bateaux portait souvent une tête de dragon." },
      { q: "Quelle immense muraille protégeait le nord de la Chine ?", r: ["La Grande Muraille", "Le mur d'Hadrien", "La ligne Maginot", "Le limes"], n: 1, x: "Elle a été construite et reconstruite pendant plus de deux mille ans." },
      { q: "Qui était le roi des dieux chez les Grecs ?", r: ["Zeus", "Poséidon", "Odin", "Râ"], n: 1, x: "Il régnait depuis le mont Olympe ; Poséidon était son frère, dieu de la mer." },
      { q: "Quel roi des Francs a été baptisé à Reims au tournant de l'an 500 ?", r: ["Clovis", "Charlemagne", "Pépin le Bref", "Dagobert"], n: 1, x: "Il a été baptisé par l'évêque Remi ; la date exacte est encore discutée." },
      { q: "Quelle bataille de 1515 est restée célèbre grâce à François Ier ?", r: ["Marignan", "Azincourt", "Austerlitz", "Waterloo"], n: 2, x: "« 1515, Marignan » : une des dates les plus connues des écoliers." },
      { q: "Lors de quelle bataille de 1415 les archers anglais ont-ils écrasé la chevalerie française ?", r: ["Azincourt", "Marignan", "Bouvines", "Castillon"], n: 2, x: "Les arcs longs anglais firent des ravages parmi les chevaliers enlisés dans la boue." },
      { q: "Dans quelle ville Jeanne d'Arc a-t-elle été brûlée en 1431 ?", r: ["Rouen", "Reims", "Orléans", "Paris"], n: 2, x: "Elle avait été livrée aux Anglais, qui tenaient alors la Normandie." },
      { q: "Quel roi a fait construire le château de Chambord ?", r: ["François Ier", "Louis XIV", "Henri II", "Louis XII"], n: 2, x: "Son grand escalier à double révolution est parfois attribué à une idée de Léonard de Vinci." },
      { q: "Quel traité, signé en 1919 dans la galerie des Glaces, a mis fin à la guerre avec l'Allemagne ?", r: ["Le traité de Versailles", "Le traité de Paris", "Le traité de Vienne", "Le traité de Rome"], n: 2, x: "L'Allemagne y perdait notamment l'Alsace et la Moselle." },
      { q: "En quelle année Napoléon a-t-il perdu la bataille de Waterloo ?", r: ["1815", "1805", "1812", "1821"], n: 2, x: "Le 18 juin 1815, dans l'actuelle Belgique." },
      { q: "Quel ministre de Louis XIII était surnommé l'« Éminence rouge » ?", r: ["Le cardinal de Richelieu", "Le cardinal Mazarin", "Colbert", "Sully"], n: 2, x: "Rouge comme sa robe de cardinal ; son conseiller, le père Joseph, était l'« Éminence grise »." },
      { q: "Quelle broderie médiévale raconte la conquête de l'Angleterre par Guillaume le Conquérant ?", r: ["La tapisserie de Bayeux", "La tenture de l'Apocalypse", "La Dame à la licorne", "La tapisserie de Beauvais"], n: 2, x: "Longue d'environ 70 mètres, elle date du XIe siècle." },
      { q: "En quelle année Guillaume le Conquérant a-t-il remporté la bataille d'Hastings ?", r: ["1066", "1215", "987", "1180"], n: 2, x: "Le duc de Normandie devient alors roi d'Angleterre." },
      { q: "Quel roi a été élu en 987, fondant la dynastie des Capétiens ?", r: ["Hugues Capet", "Robert le Pieux", "Louis VI le Gros", "Philippe Auguste"], n: 2, x: "Ses descendants ont régné sur la France pendant plus de huit siècles." },
      { q: "Comment appelle-t-on la fente étroite dans un mur, par laquelle on tirait à l'arc ?", r: ["Une meurtrière", "Un mâchicoulis", "Un créneau", "Une échauguette"], n: 2, x: "Les mâchicoulis, eux, servaient à lâcher des projectiles vers le bas." },
      { q: "Comment s'appelait la grande machine de siège à contrepoids qui lançait de lourdes pierres ?", r: ["Le trébuchet", "Le bélier", "La baliste", "La tour de siège"], n: 2, x: "Le bélier, lui, servait à enfoncer les portes." },
      { q: "Quel roi a signé l'édit de Nantes, qui accordait des droits aux protestants, en 1598 ?", r: ["Henri IV", "Louis XIV", "Henri III", "Charles IX"], n: 2, x: "Louis XIV l'a révoqué en 1685." },
      { q: "Quel massacre de protestants a eu lieu à Paris en août 1572 ?", r: ["La Saint-Barthélemy", "Les Vêpres siciliennes", "La Saint-Valentin", "La Saint-Jean"], n: 2, x: "Il a commencé dans la nuit du 23 au 24 août 1572." },
      { q: "Quelle reine d'Égypte fut l'alliée de Jules César, puis de Marc Antoine ?", r: ["Cléopâtre", "Néfertiti", "Hatchepsout", "Didon"], n: 2, x: "Elle fut la dernière reine de l'Égypte ancienne." },
      { q: "Quelle cité grecque a affronté Athènes pendant la guerre du Péloponnèse ?", r: ["Sparte", "Troie", "Rome", "Carthage"], n: 2, x: "Les Spartiates étaient réputés pour leur dure éducation militaire." },
      { q: "Quel général carthaginois a franchi les Alpes avec des éléphants ?", r: ["Hannibal", "Scipion", "Spartacus", "Attila"], n: 2, x: "C'était en 218 avant Jésus-Christ, pour attaquer Rome." },
      { q: "Quel chef des Huns était surnommé le « fléau de Dieu » ?", r: ["Attila", "Gengis Khan", "Alaric", "Genséric"], n: 2, x: "Il a ravagé une partie de l'Europe au Ve siècle." },
      { q: "Quelle ordonnance de François Ier, en 1539, impose le français dans les actes officiels ?", r: ["L'ordonnance de Villers-Cotterêts", "L'édit de Nantes", "L'ordonnance de Moulins", "La Pragmatique Sanction"], n: 2, x: "Avant, ces actes étaient souvent rédigés en latin." },
      { q: "Comment appelait-on le jeune noble qui portait l'écu du chevalier et soignait son cheval ?", r: ["L'écuyer", "Le chambellan", "Le sénéchal", "Le bailli"], n: 2, x: "Son nom vient justement de l'écu, le bouclier." },
      { q: "Comment s'appelle la cérémonie où un écuyer devient chevalier ?", r: ["L'adoubement", "Le sacre", "L'hommage", "Le tournoi"], n: 2, x: "On lui remettait ses armes, et souvent l'épée touchait son épaule." },
      { q: "Quelle épidémie a tué entre un tiers et la moitié des Européens au milieu du XIVe siècle ?", r: ["La peste noire", "La variole", "Le choléra", "La grippe espagnole"], n: 2, x: "Elle a frappé l'Europe à partir de 1347." },
      { q: "Quel roi de France est mort en 1559, blessé à l'œil par une lance lors d'un tournoi ?", r: ["Henri II", "François II", "Henri IV", "Louis XI"], n: 2, x: "Le coup lui fut porté par le capitaine de sa garde, Montgomery." },
      { q: "Quel marchand vénitien a raconté son voyage jusqu'en Chine au XIIIe siècle ?", r: ["Marco Polo", "Christophe Colomb", "Ibn Battuta", "Vasco de Gama"], n: 2, x: "Son récit s'intitule « Le Devisement du monde »." },
      { q: "Comment s'appelle la petite tourelle de guet accrochée en hauteur à l'angle d'un rempart ?", r: ["Une échauguette", "Un donjon", "Une barbacane", "Un chemin de ronde"], n: 2, x: "Le guetteur y surveillait les environs à l'abri." }
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
