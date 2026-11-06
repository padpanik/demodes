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

  // Lit dix-questions.js : « # thème | nom », puis « question | réponse » par ligne
  function lireSujets(texte) {
    var l = [], s = null;
    texte.split('\n').forEach(function (x) {
      x = x.trim();
      if (!x) return;
      var p = x.replace(/^# /, '').split(' | ');
      if (x.charAt(0) === '#') { s = [p[0], p[1], []]; l.push(s); }
      else if (s) s[2].push([p[0], p[1]]);
    });
    return l;
  }

  // Sujets : [thème, nom, [[question, réponse], … niveaux 1 à 10]]
  var SUJETS = [].concat(lireSujets(typeof DX_QUESTIONS !== 'undefined' ? DX_QUESTIONS : (typeof require !== 'undefined' ? require('./dix-questions.js') : '')))
   .map(function (s, i) { return { id: s[0] + '-' + i, theme: s[0], nom: s[1], q: s[2] }; });

  // Challenges : épreuves originales, jugées par l'équipe qui lit. gain = cases gagnées si réussi
  // Challenge : on cite des choses, ou une série de vrai ou faux ; on avance d'autant de cases que de bonnes réponses (max au plus)
  var CHALLENGES = [
    { titre: 'Citez !', texte: 'Citez des pays d\'Afrique.', max: 10 },
    { titre: 'Citez !', texte: 'Citez des fruits rouges.', max: 10 },
    { titre: 'Citez !', texte: 'Citez des planètes du système solaire.', max: 6, reponse: 'Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune' },
    { titre: 'Citez !', texte: 'Citez des capitales européennes.', max: 10 },
    { titre: 'Citez !', texte: 'Citez des départements français avec leur numéro.', max: 10 },
    { titre: 'Citez !', texte: 'Citez des instruments à cordes.', max: 10 },
    { titre: 'Citez !', texte: 'Citez des longs métrages d\'animation Disney.', max: 10 },
    { titre: 'Citez !', texte: 'Citez des fromages français.', max: 10 },
    { titre: 'Citez !', texte: 'Citez des présidents de la Ve République.', max: 6, reponse: 'De Gaulle, Pompidou, Giscard d\'Estaing, Mitterrand, Chirac, Sarkozy, Hollande, Macron' },
    { titre: 'Citez !', texte: 'Citez des personnages d\'Astérix.', max: 10 },
    { titre: 'Citez !', texte: 'Citez des sports qui se jouent avec un ballon.', max: 10 },
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
  var NIVEAUX_FINALE = [6, 7];   // question de la case Arrivée : niveau 6 ou 7 au hasard, d'un sujet tiré au hasard

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
  function sujet(id) { return SUJETS.find(s => s.id === id) || SUJETS[0]; }

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
          e.carte = { theme: s.theme, sujet: s.id, niveau: NIVEAUX_FINALE[tirer(NIVEAUX_FINALE, h)], finale: true }; e.phase = 'question';
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
        e.derniere = { q: qr[0], r: qr[1], ok: !!a.ok, equipe: e.tour, s: sujet(c.sujet).nom, nv: n };
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
        e.derniere = { q: ch.texte, r: ch.vf ? ch.vf.map(v => v[1] ? 'V' : 'F').join(' · ') : (ch.reponse || ''), n: nb, ok: nb > 0, equipe: e.tour, challenge: true, s: 'Challenge' };
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
           LONGUEURS: LONGUEURS, NIVEAUX_FINALE: NIVEAUX_FINALE, plateau: plateau, tirerSujet: tirerSujet, tirer: tirer, sujet: sujet, melanger: melanger,
           nouvellePartie: nouvellePartie, lecteur: lecteur, themeTour: themeTour, question: question, agir: agir, QUI: QUI };
})();
if (typeof module !== 'undefined') module.exports = DX;
