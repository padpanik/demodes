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
      boss: { nom: 'Le Fantôme du studio', ico: '👻', jeu: 'quatre', nomJeu: 'Quatre en ligne',
              defi: 'Bouh ! Personne ne quitte mon studio sans m\'avoir battu au Quatre en ligne !',
              victoire: 'Nooon… Tu m\'as battu ! Le studio est à toi.', defaite: 'Hé hé ! Le studio reste hanté… Une revanche ?' },
      souvenirs: ['clap', 'popcorn', 'bobine', 'projecteur'] },
    { id: 'sciences', nom: 'Laboratoire', ico: '🔬', theme: 'Sciences', pret: false, desc: 'Éprouvettes, étoiles et grandes découvertes.', bossJeu: 'Bataille navale' },
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

  // ---------- Carte : 7 rangs, départ en bas, boss en haut, fourches entre les deux ----------
  // Un nœud : { id, rang, voie (position latérale : -2 … 2), type: depart | gardien | coffre | repos | boss }
  var LARGEURS = [1, 2, 3, 2, 3, 2, 1];
  var VOIES = { 1: [0], 2: [-1, 1], 3: [-2, 0, 2] };
  function genererCarte(graine) {
    var h = hasard(graine), noeuds = [], liens = [], rangs = [];
    LARGEURS.forEach((n, r) => {
      var rang = [];
      VOIES[n].forEach(v => {
        var type = r === 0 ? 'depart' : r === LARGEURS.length - 1 ? 'boss' : null;
        var nd = { id: noeuds.length, rang: r, voie: v, type: type };
        noeuds.push(nd); rang.push(nd);
      });
      rangs.push(rang);
    });
    // Types des étapes intermédiaires : surtout des gardiens, des coffres, une buvette de temps en temps
    for (var r = 1; r < LARGEURS.length - 1; r++) {
      var types = rangs[r].map(() => { var x = h(); return x < 0.58 ? 'gardien' : x < 0.84 ? 'coffre' : 'repos'; });
      if (r === 1) types = types.map(t => t === 'repos' ? 'gardien' : t);   // pas de buvette dès le début
      if (!types.includes('gardien')) types[Math.floor(h() * types.length)] = 'gardien';
      rangs[r].forEach((nd, i) => { nd.type = types[i]; });
    }
    // Chemins : chaque étape mène à la (ou les) plus proche(s) du rang suivant ; tout le monde est relié
    for (var r = 0; r < LARGEURS.length - 1; r++) {
      var a = rangs[r], b = rangs[r + 1];
      a.forEach(nd => {
        var proches = b.slice().sort((x, y) => Math.abs(x.voie - nd.voie) - Math.abs(y.voie - nd.voie));
        liens.push([nd.id, proches[0].id]);
        if (proches[1] && Math.abs(proches[1].voie - nd.voie) <= 2 && (a.length === 1 || h() < 0.55)) liens.push([nd.id, proches[1].id]);
      });
      b.forEach(nd => {
        if (!liens.some(l => l[1] === nd.id)) {
          var proche = a.slice().sort((x, y) => Math.abs(x.voie - nd.voie) - Math.abs(y.voie - nd.voie))[0];
          liens.push([proche.id, nd.id]);
        }
      });
    }
    return { noeuds: noeuds, liens: liens };
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
  function nouvelle(lieuId, difficulte, graine) {
    graine = graine || Math.floor(Math.random() * 1e9);
    return { lieu: lieuId, difficulte: difficulte, graine: graine, carte: genererCarte(graine), pos: 0, visites: [0], trajet: [0],
             coeurs: COEURS, sac: 0, poussiere: 0, souvenirs: [], tentative: 0, aide: false, rencontre: null, fin: null, debut: Date.now(), tirage: 0, bonnes: 0, questions: 0 };
  }
  // Un nombre au hasard propre à l'étape (reproductible pour une même expédition)
  function hasardEtape(e, extra) { return hasard((e.graine ^ (e.pos * 7919) ^ ((extra || 0) * 104729)) >>> 0); }

  // Fin : étoiles gardées (tout si le boss est vaincu, la moitié sinon)
  function gainFinal(e, gagne) { return gagne ? e.sac : Math.floor(e.sac / 2); }

  return { POUSSIERES_PAR_ETOILE: POUSSIERES_PAR_ETOILE, REPOS: REPOS, LIEUX: LIEUX, lieu: lieu, DIFFICULTES: DIFFICULTES, COEURS: COEURS, GAIN_BOSS: GAIN_BOSS, QUESTIONS: QUESTIONS, LARGEURS: LARGEURS,
           hasard: hasard, melanger: melanger, convertirPoussiere: convertirPoussiere, genererCarte: genererCarte, suivants: suivants, tirerQuestion: tirerQuestion,
           nouvelle: nouvelle, hasardEtape: hasardEtape, gainFinal: gainFinal };
})();

if (typeof module !== 'undefined') module.exports = EX;
