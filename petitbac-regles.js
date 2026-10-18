// ================== PETIT BAC : CATÉGORIES ET RÈGLES ==================
// Une lettre, des catégories : chacun trouve un mot par catégorie commençant par la lettre.
// Utilisé par petitbac.html ; testable avec Node (module.exports en bas).

var PB = (function () {
  // Catégories proposées (les plus courantes d'abord) ; l'hôte en choisit quelques-unes
  var CATEGORIES = [
    'Prénom', 'Pays', 'Ville', 'Animal', 'Fruit ou légume', 'Métier', 'Objet', 'Couleur',
    'Marque', 'Célébrité', 'Sport', 'Plat ou boisson', 'Film ou série', 'Vêtement', 'Partie du corps',
    'Plante ou fleur', 'Instrument de musique', 'Moyen de transport', 'Personnage de fiction',
    'Chanteur ou groupe', 'Dans une cuisine', 'Insulte gentille', 'Loisir', 'Mot de plus de 8 lettres'
  ];
  var PAR_DEFAUT = ['Prénom', 'Pays', 'Ville', 'Animal', 'Fruit ou légume', 'Métier', 'Objet', 'Marque'];
  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var DIFFICILES = ['K', 'Q', 'W', 'X', 'Y', 'Z'];   // retirées par défaut, comme souvent
  var POINTS = { unique: 10, partage: 5, seul: 20 };

  // Pour comparer : minuscules, sans accents ni ponctuation, œ → oe
  function normaliser(t) {
    return String(t || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  // Sans l'article du début (« le », « la », « l' », « un »…), qui ne compte pas pour la lettre
  function sansArticle(t) {
    var n = normaliser(t);
    var m = /^(le|la|les|l|un|une|des|du|de|d)\s+(.+)$/.exec(n);
    return m ? m[2] : n;
  }
  // Forme utilisée pour repérer les réponses identiques (articles, espaces et pluriel simple ignorés)
  function cle(t) {
    var n = sansArticle(t).replace(/\s+/g, '');
    if (n.length > 3) n = n.replace(/[sx]$/, '');
    return n;
  }
  // La réponse commence-t-elle par la lettre ?
  function commencePar(t, lettre) {
    var n = sansArticle(t);
    return !!n && n[0] === String(lettre).toLowerCase();
  }
  // Tire une lettre parmi celles permises et pas encore jouées
  function tirerLettre(dejaJouees, avecDifficiles) {
    var permises = ALPHABET.filter(l => avecDifficiles || DIFFICILES.indexOf(l) === -1);
    var libres = permises.filter(l => (dejaJouees || []).indexOf(l) === -1);
    if (!libres.length) libres = permises;
    return libres[Math.floor(Math.random() * libres.length)];
  }
  // Une réponse est refusée si elle ne commence pas par la lettre, ou si plus de la moitié des autres votants la refusent
  // reponses : { joueur: [texte par catégorie] } ; votes : { 'joueur|k': [votants contre] } ; votants : joueurs qui votent
  function valide(reponses, votes, votants, lettre, joueur, k) {
    var t = (reponses[joueur] || [])[k] || '';
    if (!t.trim() || !commencePar(t, lettre)) return false;
    var contre = (votes[joueur + '|' + k] || []).filter(v => v !== joueur && votants.indexOf(v) !== -1).length;
    var juges = votants.filter(v => v !== joueur).length;
    return !(juges > 0 && contre * 2 > juges);
  }
  // Points de la manche : 10 si personne d'autre n'a la même réponse, 5 si elle est partagée,
  // 20 si on est le seul à avoir une réponse valable dans la catégorie
  function compter(joueurs, nbCategories, reponses, votes, votants, lettre) {
    var pts = {}, detail = {};
    joueurs.forEach(j => { pts[j] = 0; detail[j] = []; });
    for (var k = 0; k < nbCategories; k++) {
      var ok = joueurs.filter(j => valide(reponses, votes, votants, lettre, j, k));
      joueurs.forEach(j => {
        var p = 0;
        if (ok.indexOf(j) !== -1) {
          var c = cle(reponses[j][k]);
          var memes = ok.filter(x => x !== j && cle(reponses[x][k]) === c).length;
          p = ok.length === 1 ? POINTS.seul : memes ? POINTS.partage : POINTS.unique;
        }
        detail[j].push(p);
        pts[j] += p;
      });
    }
    return { points: pts, detail: detail };
  }

  return { CATEGORIES: CATEGORIES, PAR_DEFAUT: PAR_DEFAUT, ALPHABET: ALPHABET, DIFFICILES: DIFFICILES, POINTS: POINTS,
           normaliser: normaliser, sansArticle: sansArticle, cle: cle, commencePar: commencePar,
           tirerLettre: tirerLettre, valide: valide, compter: compter };
})();

if (typeof module !== 'undefined') module.exports = PB;
