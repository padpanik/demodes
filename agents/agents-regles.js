// ================== AGENTS SECRETS : MOTS ET RÈGLES ==================
// Deux équipes, 25 mots ; le chef de chaque équipe voit la carte secrète et fait deviner ses agents
// avec un seul mot et un nombre. Version maison du genre « jeu d'espions en mots ».
// Utilisé par agents/index.html ; testable avec Node (module.exports en bas).

var AG = (function () {
  // Mots maison, choisis pour leurs sens multiples (les doublons sont retirés plus bas)
  var MOTS = (
    'avocat carte pêche mousse bouchon lentille tour page pièce glace banque boule cafard canard chou clé code coq cœur ' +
    'corne couronne crème cuisine dragon école éclair étoile fer feu fil flèche fusée gorge grue herbe hôpital jet jumelles ' +
    'lame langue lettre livre lune marche masque mine mouche note nuit palme papillon parachute pilote pile pince pirate ' +
    'plage plante plat poêle point pompe pont poste poule prince puce queue radio rat règle reine robe roi rose sirène sol ' +
    'souris table talon tambour temps terre tigre timbre toile train trou vague verre vol zèbre ambulance ange anneau ' +
    'araignée arc ardoise argent armée atlas aube avion baguette baleine balle ballon bande banane barre bateau berger ' +
    'bête beurre biche bière bijou blanc bloc boîte bombe bord botte bouche boucher bougie bouton bras brique brosse bulle ' +
    'bureau but cabine cadre café cage caisse camembert camp canne canon capitaine carré carton casque castor centre cercle ' +
    'cerf chaîne chaise champ champion chance chapeau char charge chat château chef chemin chêne cheval chien chiffre ' +
    'chocolat cible ciel cinéma cirque citron classe clou club col colle colonne comète compte concert corde corps costume ' +
    'côte coton coup cour courant course couteau cravate crabe croix cube cygne danse dé dent désert diable diamant disque ' +
    'docteur doigt dos drapeau eau échelle écran écureuil éléphant épée épine espace espion essence fantôme farce fée ' +
    'ferme fête feuille figure file filet force forêt fort fouet four fourchette fraise front fruit fumée garde gare gâteau ' +
    'gant géant génie girafe gomme goutte grain grenade grenouille grille guerre guide hache hélicoptère héros histoire ' +
    'hiver horloge huile île jardin jeu jour journal jumeau jungle jupe kangourou kiwi laine lait lampe lapin laser lavande ' +
    'lion lit loup lumière lunettes machine magie main maison manche manège mangue marin marque marteau match médecin ' +
    'mémoire menu mer mère météo miel miroir mode moine monstre montagne montre moteur moule moulin mouton mur musée nain ' +
    'neige nez nid nœud noix nuage œil œuf oiseau olive ombre ongle opéra or orange orchestre oreille orgue os ours paille ' +
    'pain palais panneau papier paquet parc parfum partie patate patron pédale peigne peinture pelle perle phare piano pied ' +
    'piège pierre pingouin pipe piqûre piste plume poche poids poignée poisson police pomme porte pot poulet poupée presse ' +
    'prison pyramide quartier radar raisin rayon recette requin réseau restaurant rêve rhume robot roche roue rouge ruche ' +
    'rue sable sac saison salade salle sapin satellite sauce saut savon scène science scie seau sel selle serpent serveur ' +
    'siège signe singe soleil sorcière sortie soupe source spectacle stade statue stylo sucre tache taille tapis taxi ' +
    'télescope tempête tennis tente tête thé théâtre ticket tir tissu titre toit tomate tonnerre torche tortue toupie ' +
    'tracteur trésor triangle tube tuile tunnel uniforme usine vache vampire vapeur vase veste viande vin violon vis visage ' +
    'voile voiture volcan wagon zéro zone lien ligne ordre sonnette mouchoir ' +
    'Paris Rome Égypte Chine Japon Mexique Afrique Amazone Atlantide Mars Jupiter Venise Londres Berlin Olympe Sahara'
  ).split(/\s+/).filter((m, i, t) => m && t.indexOf(m) === i);

  var EQUIPES = ['R', 'B'];
  function autre(e) { return e === 'R' ? 'B' : 'R'; }
  function melanger(t) {
    t = t.slice();
    for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; }
    return t;
  }
  // Nouveau plateau : 25 mots, et la carte secrète (9 agents pour l'équipe qui commence, 8 pour l'autre,
  // 7 passants neutres « N », 1 assassin « A »)
  function nouveauPlateau(premier, exclus) {
    var libres = MOTS.filter(m => (exclus || []).indexOf(m) === -1);
    if (libres.length < 25) libres = MOTS;
    var mots = melanger(libres).slice(0, 25);
    var cle = [];
    for (var i = 0; i < 9; i++) cle.push(premier);
    for (i = 0; i < 8; i++) cle.push(autre(premier));
    for (i = 0; i < 7; i++) cle.push('N');
    cle.push('A');
    return { mots: mots, cle: melanger(cle) };
  }
  // Agents d'une équipe encore cachés
  function restants(cle, revelees, equipe) { return cle.filter((c, i) => c === equipe && !revelees[i]).length; }
  // Pour comparer l'indice aux mots du plateau
  function normaliser(t) {
    return String(t || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }
  // L'indice : un seul mot, qui n'est pas (et ne contient pas) un mot encore caché du plateau
  function indiceInvalide(mot, mots, revelees) {
    var n = normaliser(mot);
    if (!n) return 'Écris un mot.';
    if (/\s/.test(n)) return 'Un seul mot.';
    if (!/^[a-z0-9'-]+$/.test(n)) return 'Seulement des lettres.';
    for (var i = 0; i < mots.length; i++) {
      if (revelees && revelees[i]) continue;
      var m = normaliser(mots[i]);
      if (n === m || (m.length >= 4 && n.indexOf(m) !== -1) || (n.length >= 4 && m.indexOf(n) !== -1)) return '« ' + mot + ' » ressemble trop à un mot du plateau.';
    }
    return null;
  }
  // Une équipe révèle la carte i : couleur, fin du tour, éventuel gagnant
  function reveler(cle, revelees, i, equipe) {
    var c = cle[i];
    revelees[i] = c;
    var r = { couleur: c, finTour: c !== equipe, gagnant: null, raison: '' };
    if (c === 'A') { r.gagnant = autre(equipe); r.raison = 'assassin'; return r; }
    if (!restants(cle, revelees, equipe)) { r.gagnant = equipe; r.raison = 'tous'; }
    else if (!restants(cle, revelees, autre(equipe))) { r.gagnant = autre(equipe); r.raison = 'tous'; }
    return r;
  }
  // Nombre d'essais pour un indice : le nombre + 1 (illimité pour « ∞ » ou 0)
  function essais(n) { return n === '∞' || n === 0 ? 99 : (+n || 1) + 1; }

  return { MOTS: MOTS, EQUIPES: EQUIPES, autre: autre, melanger: melanger, nouveauPlateau: nouveauPlateau, restants: restants,
           normaliser: normaliser, indiceInvalide: indiceInvalide, reveler: reveler, essais: essais };
})();

if (typeof module !== 'undefined') module.exports = AG;
