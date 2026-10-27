// ================== MON COMPAGNON : ESPÈCES, BESOINS, BOUTIQUE ET DESSIN ==================
// Partagé par compagnon/index.html et l'accueil (qui montre le compagnon sur sa carte).

var CP = (function () {
  var ESPECES = [
    { id: 'chat', nom: 'Chat', exemple: 'Minou', couleurs: ['#f0a04b', '#7d8a94', '#3b3b3b', '#f4e6d4'] },
    { id: 'chien', nom: 'Chien', exemple: 'Biscotte', couleurs: ['#c8915a', '#f4e6d4', '#5b4636', '#e8c07a'] },
    { id: 'chevre', nom: 'Chèvre', exemple: 'Blanchette', couleurs: ['#f2efe8', '#c9a27a', '#8d8d8d'] },
    { id: 'dragon', nom: 'Dragon', exemple: 'Flammèche', couleurs: ['#5fbf8f', '#6fa8dc', '#9c7fd4', '#e5674d'] },
    { id: 'lapin', nom: 'Lapin', exemple: 'Pompon', couleurs: ['#f4f1ec', '#b9a28a', '#8d8d8d', '#e9c9a6'] },
    { id: 'renard', nom: 'Renard', exemple: 'Roussette', couleurs: ['#e8772e', '#c95a3a', '#d9cbb8'] },
    { id: 'panda', nom: 'Panda', exemple: 'Bambou', couleurs: ['#f6f4ee', '#f3e6d0', '#f6e1e8'] },
    { id: 'tortue', nom: 'Tortue', exemple: 'Pistache', couleurs: ['#8bc34a', '#4fae6a', '#b5a36a'] },
    { id: 'raton', nom: 'Raton laveur', exemple: 'Filou', couleurs: ['#9a9a9a', '#8d7f72', '#b3aca3'] },
    { id: 'singe', nom: 'Singe', exemple: 'Banjo', couleurs: ['#8d5b3a', '#a8794f', '#5d4037'] },
    { id: 'oie', nom: 'Oie', exemple: 'Capucine', couleurs: ['#f7f7f2', '#cfd4d8', '#ecdcbf'] },
    { id: 'ecureuil', nom: 'Écureuil', exemple: 'Noisette', couleurs: ['#c96a2b', '#8d6e63', '#a0522d'] }
  ];
  // ================== BESOINS (en %, ils baissent doucement avec le temps réel) ==================
  // Heures pour passer de plein à vide : on nourrit matin et soir, on donne à boire, un bain tous les deux jours…
  var BESOINS = [
    { id: 'repas', nom: 'Repas', ico: '🍖', action: 'Nourrir', heures: 14, gain: 45, effet: '😋' },
    { id: 'eau', nom: 'Eau', ico: '💧', action: 'Donner', heures: 12, gain: 60, effet: '💦' },
    { id: 'toilette', nom: 'Toilette', ico: '🛁', action: 'Laver', heures: 40, gain: 100, effet: '🫧' },
    { id: 'calin', nom: 'Câlins', ico: '❤️', action: 'Câliner', heures: 20, gain: 34, effet: '❤️' }
  ];
  var RECOMPENSE_JOUR = 3, RECOMPENSE_SEMAINE = 10;

  // ================== BOUTIQUE ==================
  // slot : où se porte ou se pose l'objet (un seul par emplacement) ; conso : se consomme (friandises)
  var RAYONS = [{ id: 'tete', nom: '🎩 Tête' }, { id: 'cou', nom: '🎀 Cou' }, { id: 'corps', nom: '🧥 Habits' },
                  { id: 'maison', nom: '🛏️ Couchage' }, { id: 'deco', nom: '🪴 Déco' }, { id: 'gourmand', nom: '🍪 Friandises' }];
  var ARTICLES = [
    { id: 'bonnet', rayon: 'tete', slot: 'tete', nom: 'Bonnet de laine', desc: 'Bien au chaud en hiver', prix: 12, couleur: '#3a8fd8' },
    { id: 'chapeau', rayon: 'tete', slot: 'tete', nom: 'Chapeau melon', desc: 'Très distingué', prix: 25, couleur: '#2b2b2b' },
    { id: 'fleur', rayon: 'tete', slot: 'tete', nom: 'Fleur', desc: 'Une jolie fleur à l\'oreille', prix: 8, couleur: '#f06292' },
    { id: 'couronne', rayon: 'tete', slot: 'tete', nom: 'Couronne', desc: 'Pour un vrai petit roi', prix: 80, couleur: '#f4c430' },
    { id: 'collier', rayon: 'cou', slot: 'cou', nom: 'Collier rouge', desc: 'Le classique', prix: 6, couleur: '#d64541' },
    { id: 'noeud', rayon: 'cou', slot: 'cou', nom: 'Nœud papillon', desc: 'Pour les grandes occasions', prix: 15, couleur: '#7e57c2' },
    { id: 'echarpe', rayon: 'cou', slot: 'cou', nom: 'Écharpe', desc: 'Douce et chaude', prix: 18, couleur: '#2e9e6b' },
    { id: 'laisse', rayon: 'cou', slot: 'cou', nom: 'Collier et laisse', desc: 'Prêt pour la promenade', prix: 14, couleur: '#c0392b' },
    { id: 'laisse-luxe', rayon: 'cou', slot: 'cou', nom: 'Laisse de grande marque', desc: 'Cuir et dorures', prix: 60, couleur: '#8b5a2b' },
    { id: 'pull', rayon: 'corps', slot: 'corps', nom: 'Petit pull', desc: 'Tricoté main', prix: 20, couleur: '#e67e22' },
    { id: 'manteau', rayon: 'corps', slot: 'corps', nom: 'Manteau d\'hiver', desc: 'Indispensable quand il neige', prix: 35, couleur: '#2c5aa0' },
    { id: 'cape', rayon: 'corps', slot: 'corps', nom: 'Cape de héros', desc: 'Pour les jours de bravoure', prix: 45, couleur: '#c0392b' },
    { id: 'coussin', rayon: 'maison', slot: 'couchage', nom: 'Coussin', desc: 'Pour la sieste', prix: 8, ico: '🟫', place: true },
    { id: 'panier', rayon: 'maison', slot: 'couchage', nom: 'Panier douillet', desc: 'Un vrai lit à soi', prix: 20, ico: '🧺', place: true },
    { id: 'niche', rayon: 'maison', slot: 'couchage', nom: 'Niche en bois', desc: 'Une petite maison', prix: 40, ico: '🛖', place: true },
    { id: 'chateau', rayon: 'maison', slot: 'couchage', nom: 'Petit château', desc: 'Le grand luxe', prix: 120, ico: '🏰', place: true },
    { id: 'plante', rayon: 'deco', slot: 'plante', nom: 'Plante verte', desc: 'Un peu de nature', prix: 10, ico: '🪴', place: true },
    { id: 'tableau', rayon: 'deco', slot: 'mur', nom: 'Tableau', desc: 'Un paysage au mur', prix: 22, ico: '🖼️', place: true },
    { id: 'horloge', rayon: 'deco', slot: 'mur2', nom: 'Horloge', desc: 'Tic, tac…', prix: 18, ico: '🕰️', place: true },
    { id: 'lampe', rayon: 'deco', slot: 'lampe', nom: 'Lampe', desc: 'Une lumière douce le soir', prix: 16, ico: '💡', place: true },
    { id: 'rideaux', rayon: 'deco', slot: 'fenetre', nom: 'Rideaux', desc: 'Pour la fenêtre', prix: 14, place: true, ico: '🪟' },
    { id: 'balle', rayon: 'deco', slot: 'jouet', nom: 'Balle', desc: 'Pour jouer', prix: 5, ico: '⚽', place: true },
    { id: 'peluche', rayon: 'deco', slot: 'jouet', nom: 'Peluche', desc: 'Son doudou', prix: 12, ico: '🧸', place: true },
    { id: 'biscuit', rayon: 'gourmand', nom: 'Biscuit', desc: 'Remplit l\'assiette et fait plaisir', prix: 3, ico: '🍪', conso: true, effets: { repas: 40, calin: 15 } },
    { id: 'gateau', rayon: 'gourmand', nom: 'Gâteau de fête', desc: 'Un vrai festin', prix: 10, ico: '🎂', conso: true, effets: { repas: 100, calin: 40 } },
    // ----- Articles de saison (fete) : achetables seulement pendant la fête, gardés ensuite ; déco de fête : un emplacement par fête -----
    { id: 'chapeau-fete', fete: 'nouvel-an', rayon: 'tete', slot: 'tete', nom: 'Chapeau de fête', desc: 'Pour le réveillon', prix: 12, couleur: '#e64980' },
    { id: 'noeud-dore', fete: 'nouvel-an', rayon: 'cou', slot: 'cou', nom: 'Nœud doré', desc: 'Très chic pour le Nouvel an', prix: 15, couleur: '#f4c430' },
    { id: 'boule-facettes', fete: 'nouvel-an', rayon: 'deco', slot: 'fete-nouvel-an', nom: 'Boule à facettes', desc: 'Ça brille de partout', prix: 18, ico: '🪩', place: true, pos: 'left:42%;top:2px', x: 48, taille: 34, phrase: 'Ça brille ! On danse ? 🪩' },
    { id: 'galette', fete: 'nouvel-an', rayon: 'gourmand', nom: 'Galette des rois', desc: 'Qui aura la fève ?', prix: 6, ico: '🥧', conso: true, effets: { repas: 70, calin: 30 } },
    { id: 'toque', fete: 'chandeleur', rayon: 'tete', slot: 'tete', nom: 'Toque de chef', desc: 'Pour faire sauter les crêpes', prix: 12, couleur: '#ffffff' },
    { id: 'poele', fete: 'chandeleur', rayon: 'deco', slot: 'fete-chandeleur', nom: 'Poêle à crêpes', desc: 'Avec une crêpe dedans', prix: 10, ico: '🍳', place: true, pos: 'left:30%;bottom:10px', x: 36, taille: 32, phrase: 'Hop ! Elle a sauté ! 🥞' },
    { id: 'crepe', fete: 'chandeleur', rayon: 'gourmand', nom: 'Crêpe au sucre', desc: 'Toute chaude', prix: 3, ico: '🥞', conso: true, effets: { repas: 45, calin: 20 } },
    { id: 'bandeau-coeurs', fete: 'saint-valentin', rayon: 'tete', slot: 'tete', nom: 'Serre-tête à cœurs', desc: 'Amoureux pour la journée', prix: 12, couleur: '#e03131' },
    { id: 'collier-coeur', fete: 'saint-valentin', rayon: 'cou', slot: 'cou', nom: 'Collier cœur', desc: 'Un petit cœur qui brille', prix: 14, couleur: '#e03131' },
    { id: 'bouquet', fete: 'saint-valentin', rayon: 'deco', slot: 'fete-saint-valentin', nom: 'Bouquet de fleurs', desc: 'Pour dire je t\'aime', prix: 14, ico: '💐', place: true, pos: 'left:34%;bottom:62px', x: 40, taille: 34, phrase: 'Elles sentent bon ! 💐' },
    { id: 'chocolats', fete: 'saint-valentin', rayon: 'gourmand', nom: 'Chocolats', desc: 'Une boîte en forme de cœur', prix: 5, ico: '🍫', conso: true, effets: { repas: 40, calin: 40 } },
    { id: 'chapeau-trefle', fete: 'saint-patrick', rayon: 'tete', slot: 'tete', nom: 'Chapeau de lutin', desc: 'Vert, avec un trèfle', prix: 14, couleur: '#2b8a3e' },
    { id: 'noeud-vert', fete: 'saint-patrick', rayon: 'cou', slot: 'cou', nom: 'Nœud vert', desc: 'Porte-bonheur', prix: 10, couleur: '#37b24d' },
    { id: 'pot-or', fete: 'saint-patrick', rayon: 'deco', slot: 'fete-saint-patrick', nom: 'Trèfle porte-bonheur', desc: 'À quatre feuilles !', prix: 12, ico: '🍀', place: true, pos: 'left:66%;bottom:6px', x: 70, taille: 30, phrase: 'Un trèfle à quatre feuilles ! 🍀' },
    { id: 'oreilles-lapin', fete: 'paques', rayon: 'tete', slot: 'tete', nom: 'Oreilles de lapin', desc: 'Pour la chasse aux œufs', prix: 12, couleur: '#f8f9fa' },
    { id: 'nid-oeufs', fete: 'paques', rayon: 'deco', slot: 'fete-paques', nom: 'Nid d\'œufs peints', desc: 'Tout doux, tout coloré', prix: 14, ico: '🪺', place: true, pos: 'left:28%;bottom:8px', x: 34, taille: 36, phrase: 'Il y a des œufs ! 🥚' },
    { id: 'oeuf-chocolat', fete: 'paques', rayon: 'gourmand', nom: 'Œuf en chocolat', desc: 'Avec une surprise dedans', prix: 5, ico: '🥚', conso: true, effets: { repas: 50, calin: 25 } },
    { id: 'casque', fete: 'musique', rayon: 'tete', slot: 'tete', nom: 'Casque audio', desc: 'Pour écouter sa musique', prix: 16, couleur: '#4c6ef5' },
    { id: 'guitare', fete: 'musique', rayon: 'deco', slot: 'fete-musique', nom: 'Guitare', desc: 'Pour un petit concert', prix: 18, ico: '🎸', place: true, pos: 'left:58%;bottom:36px', x: 64, taille: 40, phrase: 'Écoute ma chanson ! 🎶' },
    { id: 'limonade', fete: 'musique', rayon: 'gourmand', nom: 'Limonade', desc: 'Bien fraîche', prix: 3, ico: '🥤', conso: true, effets: { eau: 60, calin: 15 } },
    { id: 'chapeau-paille', fete: 'ete', rayon: 'tete', slot: 'tete', nom: 'Chapeau de paille', desc: 'Contre le soleil', prix: 14, couleur: '#e9c46a' },
    { id: 'lunettes', fete: 'ete', rayon: 'tete', slot: 'tete', nom: 'Lunettes de soleil', desc: 'La classe en vacances', prix: 16, couleur: '#1d1d24' },
    { id: 'parasol', fete: 'ete', rayon: 'deco', slot: 'fete-ete', nom: 'Parasol', desc: 'Un coin d\'ombre', prix: 16, ico: '⛱️', place: true, pos: 'left:64%;bottom:40px', x: 72, taille: 50, phrase: 'Un peu d\'ombre, ça fait du bien 😎' },
    { id: 'glace', fete: 'ete', rayon: 'gourmand', nom: 'Glace', desc: 'Deux boules, vanille et fraise', prix: 4, ico: '🍦', conso: true, effets: { repas: 30, eau: 30, calin: 15 } },
    { id: 'chapeau-sorciere', fete: 'halloween', rayon: 'tete', slot: 'tete', nom: 'Chapeau de sorcière', desc: 'Abracadabra !', prix: 14, couleur: '#7048e8' },
    { id: 'cape-vampire', fete: 'halloween', rayon: 'corps', slot: 'corps', nom: 'Cape de vampire', desc: 'Doublée de rouge', prix: 20, couleur: '#1d1d24' },
    { id: 'citrouille', fete: 'halloween', rayon: 'deco', slot: 'fete-halloween', nom: 'Citrouille lanterne', desc: 'Elle s\'allume le soir', prix: 12, ico: '🎃', place: true, pos: 'left:22%;bottom:10px', x: 28, taille: 40, phrase: 'Elle me fait un clin d\'œil ! 🎃' },
    { id: 'bonbons', fete: 'halloween', rayon: 'gourmand', nom: 'Bonbons', desc: 'Un sachet de friandises', prix: 4, ico: '🍬', conso: true, effets: { repas: 30, calin: 25 } },
    { id: 'chapeau-anniv', fete: 'anniversaire', rayon: 'tete', slot: 'tete', nom: 'Chapeau d\'anniversaire', desc: 'C\'est sa fête !', prix: 10, couleur: '#4dabf7' },
    { id: 'ballons', fete: 'anniversaire', rayon: 'deco', slot: 'fete-anniversaire', nom: 'Bouquet de ballons', desc: 'Pour faire la fête', prix: 12, ico: '🎈', place: true, pos: 'left:6%;top:24%', x: 12, taille: 40, phrase: 'Des ballons pour moi ! 🎈' },
    { id: 'gateau-anniv', fete: 'anniversaire', rayon: 'gourmand', nom: 'Gâteau d\'anniversaire', desc: 'Avec des bougies à souffler', prix: 6, ico: '🧁', conso: true, effets: { repas: 100, calin: 60 } },
    // ----- Souvenirs d'expédition (souvenir) : pas à vendre, on les trouve dans les coffres ; un emplacement « exp-… » chacun -----
    { id: 'clap', souvenir: 'cinema', rayon: 'deco', slot: 'exp-clap', nom: 'Clap de tournage', desc: 'Trouvé au Studio de cinéma', prix: 0, ico: '🎬', place: true, pos: 'left:6%;top:30%', x: 12, taille: 34, phrase: 'Silence… moteur… action ! 🎬' },
    { id: 'popcorn', souvenir: 'cinema', rayon: 'deco', slot: 'exp-popcorn', nom: 'Seau de pop-corn', desc: 'Trouvé au Studio de cinéma', prix: 0, ico: '🍿', place: true, pos: 'left:44%;bottom:8px', x: 50, taille: 30, phrase: 'Du pop-corn ! 🍿' },
    { id: 'bobine', souvenir: 'cinema', rayon: 'deco', slot: 'exp-bobine', nom: 'Bobine de film', desc: 'Trouvée au Studio de cinéma', prix: 0, ico: '🎞️', place: true, pos: 'left:66%;top:22%', x: 72, taille: 32, phrase: 'Une vieille bobine de film… 🎞️' },
    { id: 'projecteur', souvenir: 'cinema', rayon: 'deco', slot: 'exp-projecteur', nom: 'Projecteur', desc: 'Trouvé au Studio de cinéma', prix: 0, ico: '📽️', place: true, pos: 'left:24%;bottom:54px', x: 30, taille: 36, phrase: 'On se fait une séance ? 📽️' },
    { id: 'microscope', souvenir: 'sciences', rayon: 'deco', slot: 'exp-microscope', nom: 'Microscope', desc: 'Trouvé au Laboratoire', prix: 0, ico: '🔬', place: true, pos: 'left:80%;bottom:50px', x: 84, taille: 32, phrase: 'Je vois des microbes ! 🔬' },
    { id: 'eprouvettes', souvenir: 'sciences', rayon: 'deco', slot: 'exp-eprouvettes', nom: 'Éprouvettes', desc: 'Trouvées au Laboratoire', prix: 0, ico: '🧪', place: true, pos: 'left:8%;bottom:10px', x: 12, taille: 30, phrase: 'Pas touche, ça fait des bulles ! 🧪' },
    { id: 'telescope', souvenir: 'sciences', rayon: 'deco', slot: 'exp-telescope', nom: 'Télescope', desc: 'Trouvé au Laboratoire', prix: 0, ico: '🔭', place: true, pos: 'left:86%;top:30%', x: 88, taille: 34, phrase: 'On regarde les étoiles ? 🔭' },
    { id: 'cle-donjon', souvenir: 'donjon', rayon: 'deco', slot: 'exp-cle', nom: 'Grande clé du donjon', desc: 'Trouvée au Donjon des compagnons', prix: 0, ico: '🗝️', place: true, pos: 'left:58%;top:16%', x: 60, taille: 28, phrase: 'La clé du Roi Gluant ! 🗝️' },
    { id: 'coffre-tresor', souvenir: 'donjon', rayon: 'deco', slot: 'exp-coffre', nom: 'Coffre au trésor', desc: 'Trouvé au Donjon des compagnons', prix: 0, ico: '🧰', place: true, pos: 'left:70%;bottom:8px', x: 74, taille: 32, phrase: 'Mon trésor du donjon… 🧰' },
    { id: 'bouclier', souvenir: 'donjon', rayon: 'deco', slot: 'exp-bouclier', nom: 'Bouclier', desc: 'Trouvé au Donjon des compagnons', prix: 0, ico: '🛡️', place: true, pos: 'left:16%;top:18%', x: 18, taille: 30, phrase: 'Rien ne me fait peur ! 🛡️' },
    { id: 'couronne-gluant', souvenir: 'donjon', rayon: 'deco', slot: 'exp-couronne', nom: 'Couronne du Roi Gluant', desc: 'Trouvée au Donjon des compagnons', prix: 0, ico: '👑', place: true, pos: 'left:48%;top:24%', x: 50, taille: 26, phrase: 'C\'est moi le roi, maintenant ! 👑' },
    { id: 'aimant', souvenir: 'sciences', rayon: 'deco', slot: 'exp-aimant', nom: 'Gros aimant', desc: 'Trouvé au Laboratoire', prix: 0, ico: '🧲', place: true, pos: 'left:36%;top:14%', x: 38, taille: 28, phrase: 'Il attire tout ce qui est en fer ! 🧲' },
    { id: 'bonnet-noel', fete: 'noel', rayon: 'tete', slot: 'tete', nom: 'Bonnet de Père Noël', desc: 'Ho, ho, ho !', prix: 14, couleur: '#e03131' },
    { id: 'pull-noel', fete: 'noel', rayon: 'corps', slot: 'corps', nom: 'Pull de Noël', desc: 'Avec des flocons', prix: 22, couleur: '#c92a2a' },
    { id: 'sapin', fete: 'noel', rayon: 'deco', slot: 'fete-noel', nom: 'Sapin de Noël', desc: 'Avec ses boules et son étoile', prix: 20, ico: '🎄', place: true, pos: 'left:78%;bottom:58px', x: 86, taille: 56, phrase: 'Il est beau notre sapin ! 🎄' },
    { id: 'buche', fete: 'noel', rayon: 'gourmand', nom: 'Bûche de Noël', desc: 'Au chocolat', prix: 8, ico: '🍰', conso: true, effets: { repas: 90, calin: 40 } }
  ];
  // ================== FÊTES DE L'ANNÉE : boutique de saison et petites touches dans la maison ==================
  // Pendant chaque période, la boutique ouvre un rayon de saison (articles achetables seulement à ce moment-là,
  // gardés pour toujours une fois achetés) et la maison se pare de quelques rappels discrets (ambiance, par pièce).
  // ambiance[pièce] = [émoji, style CSS, classe d'animation facultative] ; guirlande = couleurs des fanions (pièces intérieures)
  function paques(y) {   // dimanche de Pâques (calcul de Meeus)
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
  }
  function jour(y, m, j) { return new Date(y, m - 1, j); }
  var FETES = [
    { id: 'nouvel-an', nom: 'Nouvel an', ico: '🎉', guirlande: ['#f4c430', '#d0d7de', '#4c6ef5'],
      periode: y => [jour(y, 12, 27), jour(y + 1, 1, 10)], jourJ: y => jour(y + 1, 1, 1), voeux: 'Bonne année ! Plein de parties ensemble 🎉',
      mots: ['Une part de galette ? Je cherche la fève ! 👑', 'Bonne année à tous les amis 🥳', 'Cette année, on gagne plein de coupes ! 🏆'],
      fenetre: '🎆', ambiance: {
        salon: [['🪩', 'left:150px;top:26px;font-size:24px', 'balance'], ['🎊', 'left:16px;bottom:96px;font-size:20px']],
        cuisine: [['🥧', 'left:172px;bottom:160px;font-size:24px'], ['👑', 'left:200px;bottom:164px;font-size:16px']],
        chambre: [['🎈', 'left:112px;top:50px;font-size:24px', 'flotte']],
        jeux: [['🎉', 'right:40px;top:100px;font-size:24px']],
        jardin: [['✨', 'left:150px;top:30px;font-size:20px', 'scintille'], ['🎆', 'left:60px;top:22px;font-size:26px', 'nuit-seule']],
        trophees: [['🎊', 'left:50%;top:6px;font-size:20px']] } },
    { id: 'chandeleur', nom: 'Chandeleur', ico: '🥞', guirlande: ['#f59f00', '#e8590c', '#ffd43b'],
      periode: y => [jour(y, 1, 26), jour(y, 2, 2)], jourJ: y => jour(y, 2, 2), voeux: 'C\'est la Chandeleur ! On fait sauter les crêpes ? 🥞',
      mots: ['Ça sent les crêpes ici… 🥞', 'Une crêpe au sucre pour moi ? 😋', 'Tu sais faire sauter les crêpes ? 🍳'],
      ambiance: {
        salon: [['🕯️', 'right:36px;top:76px;font-size:20px']],
        cuisine: [['🥞', 'left:170px;bottom:160px;font-size:24px'], ['🍯', 'left:198px;bottom:162px;font-size:18px']],
        chambre: [['🕯️', 'right:58px;bottom:30px;font-size:20px']],
        jeux: [['🥞', 'right:40px;top:102px;font-size:20px']] } },
    { id: 'saint-valentin', nom: 'Saint-Valentin', ico: '💝', guirlande: ['#e03131', '#f783ac', '#c2255c'],
      periode: y => [jour(y, 2, 3), jour(y, 2, 15)], jourJ: y => jour(y, 2, 14), voeux: 'Bonne Saint-Valentin ! Je t\'aime fort 💝',
      mots: ['Tu es mon humain préféré 💕', 'Un câlin pour la Saint-Valentin ? 🥰', 'Je t\'ai gardé un chocolat… enfin presque 🍫'],
      ambiance: {
        salon: [['💌', 'left:110px;top:40px;font-size:24px'], ['🌹', 'right:44px;top:74px;font-size:20px']],
        cuisine: [['🍫', 'left:172px;bottom:160px;font-size:22px']],
        chambre: [['💕', 'left:112px;top:56px;font-size:22px', 'flotte']],
        jeux: [['❤️', 'left:86px;top:34px;font-size:20px']],
        jardin: [['💕', 'left:150px;top:96px;font-size:18px', 'flotte']] } },
    { id: 'saint-patrick', nom: 'Saint-Patrick', ico: '☘️', guirlande: ['#2b8a3e', '#69db7c', '#f4c430'],
      periode: y => [jour(y, 3, 10), jour(y, 3, 18)], jourJ: y => jour(y, 3, 17), voeux: 'Joyeuse Saint-Patrick ! Tout le monde en vert ☘️',
      mots: ['J\'ai trouvé un trèfle à quatre feuilles ! 🍀', 'Au bout de l\'arc-en-ciel, il y a un trésor ? 🌈', 'Aujourd\'hui, on s\'habille en vert ☘️'],
      ambiance: {
        salon: [['☘️', 'right:36px;top:78px;font-size:20px'], ['🪙', 'left:20px;bottom:96px;font-size:18px']],
        cuisine: [['🍀', 'left:172px;bottom:160px;font-size:20px']],
        chambre: [['☘️', 'left:112px;top:56px;font-size:20px', 'flotte']],
        jeux: [['🪙', 'right:40px;top:102px;font-size:20px']],
        jardin: [['🌈', 'left:44%;top:14px;font-size:54px;opacity:0.8'], ['🍀', 'left:34%;bottom:64px;font-size:18px']] } },
    { id: 'paques', nom: 'Pâques', ico: '🐣', guirlande: ['#ffa94d', '#51cf66', '#9775fa', '#4dabf7', '#f783ac'],
      periode: y => { var p = paques(y); return [new Date(y, p.getMonth(), p.getDate() - 14), new Date(y, p.getMonth(), p.getDate() + 1)]; },
      jourJ: y => paques(y), voeux: 'Joyeuses Pâques ! On cherche les œufs ? 🥚',
      mots: ['J\'ai vu un œuf dans le jardin… 🥚', 'Les cloches sont passées ? 🔔', 'Un petit chocolat de Pâques ? 🍫'],
      ambiance: {
        salon: [['🐣', 'right:36px;top:78px;font-size:20px'], ['🌷', 'left:20px;bottom:96px;font-size:24px']],
        cuisine: [['🥚', 'left:176px;bottom:160px;font-size:20px'], ['🍫', 'left:200px;bottom:160px;font-size:18px']],
        chambre: [['🐇', 'right:52px;bottom:28px;font-size:24px']],
        jeux: [['🥚', 'right:40px;top:102px;font-size:20px']],
        jardin: [['🥚', 'left:32%;bottom:64px;font-size:16px'], ['🥚', 'left:70%;bottom:68px;font-size:14px'], ['🐣', 'left:52%;bottom:70px;font-size:18px'], ['🔔', 'left:200px;top:30px;font-size:20px', 'balance']] } },
    { id: 'musique', nom: 'Fête de la musique', ico: '🎵', guirlande: ['#4c6ef5', '#f03e3e', '#fcc419', '#20c997'],
      periode: y => [jour(y, 6, 14), jour(y, 6, 21)], jourJ: y => jour(y, 6, 21), voeux: 'C\'est la Fête de la musique ! On chante ? 🎶',
      mots: ['La la la… 🎶', 'Tu m\'apprends un instrument ? 🎸', 'On fait un petit concert ce soir ? 🎤'],
      ambiance: {
        salon: [['🎵', 'left:120px;top:44px;font-size:20px', 'flotte'], ['🎶', 'right:40px;top:76px;font-size:18px', 'flotte']],
        cuisine: [['📻', 'left:170px;bottom:160px;font-size:22px']],
        chambre: [['🎶', 'left:112px;top:56px;font-size:20px', 'flotte']],
        jeux: [['🥁', 'right:36px;top:98px;font-size:22px']],
        jardin: [['🎵', 'left:52%;top:40px;font-size:20px', 'flotte'], ['🎶', 'left:30%;top:70px;font-size:18px', 'flotte']] } },
    { id: 'ete', nom: 'Été', ico: '☀️', guirlande: ['#ffd43b', '#4dabf7', '#ff8787', '#69db7c'],
      periode: y => [jour(y, 6, 22), jour(y, 8, 31)],
      mots: ['Il fait chaud ! Une glace ? 🍦', 'C\'est les vacances ! ☀️', 'On joue dehors ce soir ? 🌅'],
      ambiance: {
        salon: [['🌻', 'right:38px;top:74px;font-size:22px'], ['🕶️', 'left:24px;bottom:98px;font-size:20px']],
        cuisine: [['🍉', 'left:172px;bottom:160px;font-size:24px']],
        chambre: [['🐚', 'right:52px;bottom:28px;font-size:20px']],
        jeux: [['🏖️', 'right:40px;top:100px;font-size:22px']],
        jardin: [['⛱️', 'left:56%;bottom:58px;font-size:40px'], ['🍉', 'left:34%;bottom:66px;font-size:18px']] } },
    { id: 'halloween', nom: 'Halloween', ico: '🎃', guirlande: ['#f76707', '#343a40', '#9775fa'],
      periode: y => [jour(y, 10, 15), jour(y, 11, 2)], jourJ: y => jour(y, 10, 31), voeux: 'Joyeux Halloween ! Des bonbons ou un sort ? 🎃',
      mots: ['Des bonbons ou un sort ? 🍬', 'J\'ai vu passer une chauve-souris ! 🦇', 'Bouh ! Je t\'ai fait peur ? 👻'],
      fenetre: '🦇', ambiance: {
        salon: [['🎃', 'right:34px;top:78px;font-size:20px'], ['🕸️', 'left:2px;top:26px;font-size:30px;opacity:0.55']],
        cuisine: [['🍬', 'left:172px;bottom:160px;font-size:22px'], ['🍭', 'left:196px;bottom:162px;font-size:18px']],
        chambre: [['👻', 'left:108px;top:56px;font-size:22px', 'flotte']],
        jeux: [['🕸️', 'left:84px;top:28px;font-size:30px;opacity:0.55'], ['🎃', 'right:40px;top:100px;font-size:22px']],
        jardin: [['🎃', 'left:60%;bottom:60px;font-size:26px'], ['🎃', 'left:32%;bottom:66px;font-size:18px'], ['🍂', 'left:200px;top:110px;font-size:18px', 'tombe'], ['🦇', 'left:150px;top:30px;font-size:20px', 'vole-loin']],
        trophees: [['🕯️', 'left:50%;bottom:12px;font-size:22px']] } },
    { id: 'noel', nom: 'Noël', ico: '🎄', guirlande: ['#e03131', '#2b8a3e', '#f4c430'],
      periode: y => [jour(y, 12, 1), jour(y, 12, 26)], jourJ: y => jour(y, 12, 25), voeux: 'Joyeux Noël ! Tu crois que le Père Noël est passé ? 🎁',
      mots: ['J\'ai écrit ma lettre au Père Noël 📮', 'Il neige, c\'est magique ❄️', 'On décore le sapin ensemble ? 🎄'],
      ambiance: {
        salon: [['🧦', 'left:104px;top:34px;font-size:22px', 'balance'], ['⭐', 'right:58px;top:74px;font-size:16px', 'scintille']],
        cuisine: [['🍪', 'left:172px;bottom:160px;font-size:22px'], ['🥛', 'left:198px;bottom:160px;font-size:20px']],
        chambre: [['🎁', 'right:52px;bottom:28px;font-size:24px'], ['🧦', 'left:112px;top:60px;font-size:20px', 'balance']],
        jeux: [['🎁', 'right:30px;top:100px;font-size:22px'], ['🎁', 'right:58px;top:106px;font-size:16px']],
        jardin: [['⛄', 'left:58%;bottom:58px;font-size:38px']],
        trophees: [['🎀', 'left:50%;top:6px;font-size:22px']] } }
  ];
  // Anniversaire du compagnon : chaque année à la date d'adoption (2 jours avant → lendemain), prioritaire sur les autres fêtes
  var ANNIVERSAIRE = { id: 'anniversaire', nom: 'Anniversaire', ico: '🎂', guirlande: ['#ff8787', '#74c0fc', '#ffd43b', '#b197fc'],
    mots: ['C\'est bientôt mon anniversaire ! 🎂', 'Tu as pensé à mon cadeau ? 🎁', 'On fait une fête avec les amis ? 🎈'],
    ambiance: {
      salon: [['🎈', 'left:20px;top:40px;font-size:26px', 'flotte'], ['🎈', 'left:48px;top:52px;font-size:20px', 'flotte'], ['🎁', 'right:36px;top:76px;font-size:18px']],
      cuisine: [['🎂', 'left:168px;bottom:160px;font-size:26px']],
      chambre: [['🎁', 'right:52px;bottom:28px;font-size:22px'], ['🎈', 'left:112px;top:50px;font-size:22px', 'flotte']],
      jeux: [['🎉', 'right:40px;top:100px;font-size:22px']],
      jardin: [['🎈', 'left:56%;top:30px;font-size:26px', 'flotte'], ['🎈', 'left:62%;top:44px;font-size:20px', 'flotte']],
      trophees: [['🎈', 'left:50%;top:8px;font-size:22px', 'flotte']] } };
  function anniversaireDu(t, ne) {
    if (!ne) return null;
    var n = new Date(ne), y = new Date(t).getFullYear(), r = null;
    [y - 1, y, y + 1].forEach(a => {
      if (r || a <= n.getFullYear()) return;   // pas de fête avant son premier anniversaire
      var j = new Date(a, n.getMonth(), n.getDate()), deb = new Date(a, n.getMonth(), n.getDate() - 2), fin = new Date(a, n.getMonth(), n.getDate() + 1);
      if (t >= +deb && t < +fin + 86400000) r = Object.assign({}, ANNIVERSAIRE, { debut: deb, fin: fin, annee: a, ans: a - n.getFullYear(), estJourJ: memeJour(j, t),
        voeux: 'C\'est mon anniversaire ! J\'ai ' + (a - n.getFullYear()) + ' an' + (a - n.getFullYear() > 1 ? 's' : '') + ' aujourd\'hui 🎂' });
    });
    return r;
  }
  // Fête en cours à la date t (ou null) ; ne : date d'adoption, pour l'anniversaire ; la prochaine à venir
  function bornes(f, t) {
    var y = new Date(t).getFullYear(), r = null;
    [y - 1, y, y + 1].forEach(a => { var p = f.periode(a), fin = new Date(p[1].getFullYear(), p[1].getMonth(), p[1].getDate() + 1); if (!r && t >= +p[0] && t < +fin) r = { debut: p[0], fin: p[1], annee: a }; });
    return r;
  }
  // Guirlande propre à chaque fête (motif suspendu le long d'un fil en deux arcs, 360 × 34) : citrouilles et chauves-souris,
  // guirlande lumineuse, étoiles, cœurs, œufs peints, crêpes et chandelles, trèfles, notes, lampions, ballons
  var MOTIFS = {
    'nouvel-an': 'etoiles', chandeleur: 'crepes', 'saint-valentin': 'coeurs', 'saint-patrick': 'trefles', paques: 'oeufs',
    musique: 'notes', ete: 'lampions', halloween: 'halloween', noel: 'lumieres', anniversaire: 'ballons'
  };
  function guirlande(f) {
    if (!f) return '';
    var motif = MOTIFS[f.id] || 'fanions', c = motif === 'lumieres' ? ['#ff6b6b', '#ffd43b', '#74c0fc', '#8ce99a', '#f783ac'] : f.guirlande, fil = motif === 'lumieres' ? '#2f6b3a' : motif === 'halloween' ? '#3b3b3b' : '#8a7a66';
    var s = '<path d="M0 3 Q90 20 180 3 Q270 20 360 3" stroke="' + fil + '" stroke-width="' + (motif === 'lumieres' ? 1.8 : 1.2) + '" fill="none"/>';
    var pas = motif === 'lumieres' ? 20 : 26;
    for (var k = 0, x = 12; x < 360; x += pas, k++) {
      var u = (x % 180) / 180, y = (1 - u) * (1 - u) * 3 + 2 * (1 - u) * u * 20 + u * u * 3, k2 = c[k % c.length];
      var fx = n => (+n).toFixed(1), Y = d => fx(y + d);
      var fil2 = l => '<path d="M' + x + ' ' + fx(y) + ' V' + Y(l) + '" stroke="' + fil + '" stroke-width="0.8"/>';
      if (motif === 'halloween') s += k % 2
        ? fil2(4) + '<path d="M' + x + ' ' + Y(6) + ' q-4 -4 -9 -1 q3 1 2 4 q3 -1 4 2 q1 -3 3 -3 q2 0 3 3 q1 -3 4 -2 q-1 -3 2 -4 q-5 -3 -9 1z" fill="#2b2b2b"/>'
        : fil2(4) + '<ellipse cx="' + x + '" cy="' + Y(9) + '" rx="6.5" ry="5" fill="#f76707"/><path d="M' + x + ' ' + Y(9 - 5) + ' v10" stroke="#d9480f" stroke-width="0.8"/>' +
          '<path d="M' + x + ' ' + Y(4.5) + ' l1.5 -2.5" stroke="#2b8a3e" stroke-width="1.6" stroke-linecap="round"/>';
      else if (motif === 'lumieres') s += '<rect x="' + fx(x - 1.8) + '" y="' + Y(0.5) + '" width="3.6" height="3" rx="0.8" fill="#2f6b3a"/>' +
        '<ellipse cx="' + x + '" cy="' + Y(7.5) + '" rx="3.4" ry="4.8" fill="' + k2 + '"/><ellipse cx="' + fx(x - 1) + '" cy="' + Y(6) + '" rx="1" ry="1.8" fill="#fff" opacity="0.6"/>' +
        '<ellipse cx="' + x + '" cy="' + Y(7.5) + '" rx="6" ry="7" fill="' + k2 + '" opacity="0.18"/>';
      else if (motif === 'etoiles') s += fil2(3) + etoile(x, y + 9, 5.5, k2) + (k % 2 ? '<path d="M' + fx(x + 7) + ' ' + Y(3) + ' q3 4 0 7 q-3 3 0 7" stroke="' + c[(k + 1) % c.length] + '" stroke-width="1.4" fill="none"/>' : '');
      else if (motif === 'coeurs') s += fil2(3) + coeur(x, y + 8, 5, k2);
      else if (motif === 'oeufs') s += fil2(3) + '<ellipse cx="' + x + '" cy="' + Y(9) + '" rx="4.4" ry="5.8" fill="' + k2 + '"/>' +
        '<path d="M' + fx(x - 4.2) + ' ' + Y(9) + ' l2.1 -2 l2.1 2 l2.1 -2 l2.1 2" stroke="#fff" stroke-width="1.2" fill="none"/>';
      else if (motif === 'crepes') s += k % 2
        ? fil2(2) + '<rect x="' + fx(x - 1.6) + '" y="' + Y(7) + '" width="3.2" height="8" rx="0.8" fill="#fff8e1" stroke="#e8c37a" stroke-width="0.6"/>' +
          '<ellipse cx="' + x + '" cy="' + Y(4.5) + '" rx="1.8" ry="2.8" fill="#ffa94d"/>'
        : fil2(3) + '<circle cx="' + x + '" cy="' + Y(9) + '" r="6" fill="#f2c27b"/><circle cx="' + fx(x - 2) + '" cy="' + Y(8) + '" r="1.1" fill="#c98a3a"/><circle cx="' + fx(x + 2) + '" cy="' + Y(11) + '" r="0.9" fill="#c98a3a"/><circle cx="' + fx(x + 1.5) + '" cy="' + Y(6.5) + '" r="0.8" fill="#c98a3a"/>';
      else if (motif === 'trefles') s += fil2(3) + '<path d="M' + x + ' ' + Y(9) + ' q1 4 3 6" stroke="' + k2 + '" stroke-width="1.3" fill="none"/>' +
        coeur(x, y + 6.2, 2.8, k2) + '<g transform="rotate(120 ' + x + ' ' + Y(9) + ')">' + coeur(x, y + 6.2, 2.8, k2) + '</g><g transform="rotate(240 ' + x + ' ' + Y(9) + ')">' + coeur(x, y + 6.2, 2.8, k2) + '</g>';
      else if (motif === 'notes') s += fil2(2) + '<ellipse cx="' + fx(x - 2) + '" cy="' + Y(12) + '" rx="3" ry="2.2" fill="' + k2 + '" transform="rotate(-20 ' + fx(x - 2) + ' ' + Y(12) + ')"/>' +
        '<path d="M' + fx(x + 0.8) + ' ' + Y(12) + ' V' + Y(2) + (k % 2 ? ' h5 v3 h-5' : ' q4 2 3 6') + '" stroke="' + k2 + '" stroke-width="1.4" fill="' + (k % 2 ? k2 : 'none') + '"/>';
      else if (motif === 'lampions') s += fil2(2) + '<rect x="' + fx(x - 2.5) + '" y="' + Y(2) + '" width="5" height="1.6" fill="#495057"/>' +
        '<ellipse cx="' + x + '" cy="' + Y(9) + '" rx="5.5" ry="6" fill="' + k2 + '"/><path d="M' + fx(x - 5) + ' ' + Y(7) + ' h10 M' + fx(x - 5) + ' ' + Y(11) + ' h10" stroke="#fff" stroke-width="0.7" opacity="0.6"/>' +
        '<rect x="' + fx(x - 2.5) + '" y="' + Y(14.5) + '" width="5" height="1.6" fill="#495057"/>';
      else if (motif === 'ballons') s += '<path d="M' + x + ' ' + fx(y) + ' q2 3 0 5" stroke="#868e96" stroke-width="0.7" fill="none"/>' +
        '<ellipse cx="' + x + '" cy="' + Y(10) + '" rx="4.6" ry="5.6" fill="' + k2 + '"/><path d="M' + fx(x - 1.2) + ' ' + Y(5) + ' l1.2 -1.4 l1.2 1.4z" fill="' + k2 + '"/>' +
        '<ellipse cx="' + fx(x - 1.6) + '" cy="' + Y(8.5) + '" rx="1" ry="1.7" fill="#fff" opacity="0.6"/>';
      else s += '<path d="M' + (x - 6) + ' ' + fx(y) + ' L' + (x + 6) + ' ' + fx(y) + ' L' + x + ' ' + Y(11) + ' Z" fill="' + k2 + '"/>';
    }
    return s;
  }
  function etoile(cx, cy, r, f) {
    var p = '';
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); }
    return '<path d="' + p + 'Z" fill="' + f + '"/>';
  }
  function feteDu(t, ne) {
    t = t || Date.now();
    var essai = lireV('compagnon-fete-essai');   // menu admin : voir une fête quand on veut
    if (essai) {
      var d0 = new Date(t), fin = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 6);
      if (essai === 'anniversaire') return Object.assign({}, ANNIVERSAIRE, { debut: d0, fin: fin, annee: d0.getFullYear(), ans: 1, estJourJ: true, voeux: 'C\'est mon anniversaire ! J\'ai 1 an aujourd\'hui 🎂' });
      var fe = FETES.find(f => f.id === essai);
      if (fe) return Object.assign({}, fe, { debut: d0, fin: fin, annee: d0.getFullYear(), estJourJ: !!fe.jourJ });
    }
    var an = anniversaireDu(t, ne);
    if (an) return an;
    // Deux fêtes en même temps (Saint-Patrick et un Pâques précoce) : celle dont le jour J est le plus proche
    var l = [];
    FETES.forEach(f => { var b = bornes(f, t); if (b) l.push(Object.assign({}, f, b, { estJourJ: !!f.jourJ && memeJour(f.jourJ(b.annee), t), ecart: f.jourJ ? Math.abs(f.jourJ(b.annee) - t) : 1e12 })); });
    l.sort((a, b) => a.ecart - b.ecart);
    return l[0] || null;
  }
  function memeJour(d, t) { var x = new Date(t); return d.getFullYear() === x.getFullYear() && d.getMonth() === x.getMonth() && d.getDate() === x.getDate(); }
  function prochaineFete(t, ne) {
    t = t || Date.now();
    var y = new Date(t).getFullYear(), l = [];
    FETES.forEach(f => [y - 1, y, y + 1].forEach(a => { var p = f.periode(a); if (+p[0] > t) l.push({ fete: f, debut: p[0] }); }));
    if (ne) { var n = new Date(ne); [y, y + 1].forEach(a => { var d = new Date(a, n.getMonth(), n.getDate() - 2); if (a > n.getFullYear() && +d > t) l.push({ fete: ANNIVERSAIRE, debut: d }); }); }
    l.sort((a, b) => a.debut - b.debut);
    return l[0] ? Object.assign({}, l[0].fete, { debut: l[0].debut }) : null;
  }

  // Besoins (en %) au moment t, d'après le dernier soin de chacun
  function niveaux(a, t) {
    var r = {};
    BESOINS.forEach(b => {
      var perte = ((t || Date.now()) - a.besoins[b.id].t) / 3600000 * (100 / b.heures);
      r[b.id] = Math.max(0, Math.min(100, Math.round(a.besoins[b.id].v - perte)));
    });
    return r;
  }
  function humeur(n) {
    var m = BESOINS.reduce((s, b) => s + n[b.id], 0) / BESOINS.length, min = Math.min.apply(null, BESOINS.map(b => n[b.id]));
    return min < 20 || m < 35 ? 'triste' : m > 70 ? 'content' : 'calme';
  }
  // Âge du compagnon, depuis son adoption
  function age(ne) {
    if (!ne) return '';
    var j = Math.floor((Date.now() - ne) / 86400000);
    return j < 1 ? 'adopté aujourd\'hui' : j < 60 ? j + ' jour' + (j > 1 ? 's' : '') : Math.floor(j / 30) + ' mois';
  }
  function estNuit(t) { var h = new Date(t || Date.now()).getHours(); return h >= 21 || h < 7; }

  // Ce qui se voit sur lui : faim (ventre qui gargouille), soif (langue tirée), manque de câlins (air triste),
  // besoin d'un bain (mouches qui tournent au-dessus de la tête, comme dans les dessins animés).
  // Les trois peuvent se voir en même temps. a.signes (résumé reçu d'un ami) ou calculé d'après ses besoins.
  var SEUIL_SIGNE = 30;
  function signes(a, t) {
    if (a.signes) return a.signes;
    if (!a.besoins) return null;
    var n = niveaux(a, t);
    return { faim: n.repas < SEUIL_SIGNE, soif: n.eau < SEUIL_SIGNE, calin: n.calin < SEUIL_SIGNE, toilette: n.toilette < SEUIL_SIGNE };
  }
  // dort : yeux fermés (la nuit) ; t : l'heure à laquelle lire ses besoins (maintenant par défaut)
  function dessin(a, humeur, dort, t) {
    var sg = signes(a, t);
    var c = a.couleur, fonce = nuance(c, -0.25), clair = nuance(c, 0.45), e = a.espece, p = a.porte || {};
    var noir = '#2b2b2b', creme = '#fbf3e6', pointe = nuance(c, -0.62);
    var membrane = (c === '#e5674d' || c === '#e5533d') ? '#f6c344' : '#f5893a', corne = '#4a3838', houppe = '#f3f7f5';
    if (e === 'panda') { fonce = noir; clair = nuance(c, 0.6); }
    // Air triste : seulement le manque de câlins (sinon, pour un dessin sans besoins, l'humeur demandée)
    var s = '', triste = sg ? sg.calin : humeur === 'triste';
    if (sg && humeur === 'triste' && !sg.calin) humeur = 'calme';
    // Le dessin est découpé en groupes que la page peut animer : queue, torse, tête (tete-g), regard, bâillement
    // Derrière : ailes du dragon (elles suivent le corps), puis la queue
    if (e === 'dragon') s += '<g class="ailes">' +
      '<path d="M66 128 Q40 90 4 46 Q2 76 8 96 Q18 90 22 104 Q32 96 36 112 Q46 106 50 120 Q58 116 62 134 Z" fill="' + membrane + '"/>' +
      '<path d="M66 128 Q40 90 4 46 M30 82 L22 104 M40 94 L36 112 M50 106 L50 120" stroke="' + fonce + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M66 128 Q40 90 4 46 Q2 76 8 96 Q18 90 22 104 Q32 96 36 112 Q46 106 50 120 Q58 116 62 134 Z" fill="' + membrane + '" transform="translate(200 0) scale(-1 1)"/>' +
      '<path d="M66 128 Q40 90 4 46 M30 82 L22 104 M40 94 L36 112 M50 106 L50 120" stroke="' + fonce + '" stroke-width="4" fill="none" stroke-linecap="round" transform="translate(200 0) scale(-1 1)"/>' + '</g>';
    s += '<g class="queue">';
    if (e === 'chat') s += '<path d="M150 170 Q190 150 178 105" stroke="' + c + '" stroke-width="13" fill="none" stroke-linecap="round"/>';
    if (e === 'chien') s += '<path d="M150 165 Q178 150 172 128" stroke="' + c + '" stroke-width="12" fill="none" stroke-linecap="round"/>';
    if (e === 'renard') s += '<path d="M140 186 Q204 190 202 130 Q200 96 178 78 L184 92 L174 88 Q190 116 176 136 Q164 152 138 156 Z" fill="' + c + '"/>' +
      '<path d="M178 78 Q200 94 202 128 L194 120 L196 134 L186 118 L184 130 L178 112 Q186 98 174 88 L184 92 Z" fill="' + creme + '"/>' +
      '<path d="M150 178 Q182 176 190 150" stroke="' + nuance(c, -0.18) + '" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/>';
    if (e === 'lapin') s += '<circle cx="150" cy="168" r="13" fill="#fff"/>';
    if (e === 'chevre') s += '<path d="M148 150 l12 -14 l-2 18 z" fill="' + c + '"/>';
    if (e === 'raton') s += '<path d="M146 176 Q194 166 186 112" stroke="' + c + '" stroke-width="17" fill="none" stroke-linecap="round"/>' +
                            '<path d="M146 176 Q194 166 186 112" stroke="#3a3a3a" stroke-width="17" fill="none" stroke-dasharray="9 10" stroke-dashoffset="4"/>';
    if (e === 'singe') s += '<path d="M150 174 Q198 172 190 132 Q184 108 166 116 Q156 126 170 132" stroke="' + c + '" stroke-width="9" fill="none" stroke-linecap="round"/>';
    if (e === 'ecureuil') s += '<path d="M138 182 Q204 176 198 112 Q194 56 146 62 Q178 90 164 122 Q154 142 138 152 Z" fill="' + c + '"/>' +
                               '<path d="M150 160 Q190 150 184 112 Q182 84 164 76" stroke="' + clair + '" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7"/>';
    if (e === 'tortue') s += '<path d="M150 178 l18 -4 l-16 -8 z" fill="' + c + '"/>';
    if (e === 'dragon') s += '<path d="M178 150 l6 -10 l4 10 M188 158 l10 -6 l-2 11 M186 172 l11 1 l-7 8" fill="' + fonce + '" stroke="' + fonce + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M140 184 Q196 192 196 160 Q196 138 176 140 Q166 142 168 152 Q176 148 182 154 Q186 168 166 170 Q152 170 140 166 Z" fill="' + c + '"/>';
    s += '</g>';
    // Corps
    s += '<g class="corps-anime">';
    s += '<ellipse cx="100" cy="201" rx="60" ry="9" fill="rgba(0,0,0,0.22)" filter="url(#v-flou)"/>';
    s += '<g class="torse">';
    s += '<ellipse cx="100" cy="158" rx="54" ry="42" fill="' + c + '"/>';
    if (e !== 'renard') s += '<ellipse cx="100" cy="166" rx="32" ry="28" fill="' + clair + '"/>';
    var pattes = e === 'oie' ? '#f39c12' : e === 'renard' ? pointe : fonce;
    s += '<ellipse cx="74" cy="196" rx="15" ry="8" fill="' + pattes + '"/><ellipse cx="126" cy="196" rx="15" ry="8" fill="' + pattes + '"/>';
    if (e === 'dragon') s += '<path d="M72 150 Q100 144 128 150 M70 162 Q100 156 130 162 M72 174 Q100 168 128 174 M78 185 Q100 180 122 185" stroke="' + nuance(clair, -0.12) + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="56" cy="150" r="2.6" fill="' + fonce + '" opacity="0.45"/><circle cx="50" cy="162" r="2" fill="' + fonce + '" opacity="0.45"/><circle cx="58" cy="172" r="3" fill="' + fonce + '" opacity="0.45"/>' +
      '<circle cx="144" cy="150" r="2.6" fill="' + fonce + '" opacity="0.45"/><circle cx="150" cy="162" r="2" fill="' + fonce + '" opacity="0.45"/><circle cx="142" cy="172" r="3" fill="' + fonce + '" opacity="0.45"/>' +
      '<ellipse cx="70" cy="152" rx="9" ry="16" fill="' + c + '" transform="rotate(-22 70 152)"/><ellipse cx="130" cy="152" rx="9" ry="16" fill="' + c + '" transform="rotate(22 130 152)"/>' +
      '<path d="M74 164 l2 4 M78 162 l3 4 M126 164 l-2 4 M122 162 l-3 4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>' +
      '<path d="M66 200 v-6 M74 201 v-7 M82 200 v-6 M118 200 v-6 M126 201 v-7 M134 200 v-6" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.85"/>';
    if (e === 'renard') s += '<path d="M74 118 L82 130 L76 136 L88 144 L82 152 L94 158 L100 176 L106 158 L118 152 L112 144 L124 136 L118 130 L126 118 Q100 130 74 118Z" fill="' + creme + '"/>' +
      '<path d="M78 150 Q74 172 72 194 L92 194 Q94 172 92 156 Z" fill="' + c + '"/><path d="M122 150 Q126 172 128 194 L108 194 Q106 172 108 156 Z" fill="' + c + '"/>' +
      '<path d="M72 178 Q82 173 93 178 L93 191 Q93 199 83 199 Q72 199 72 191 Z" fill="' + pointe + '"/><path d="M128 178 Q118 173 107 178 L107 191 Q107 199 117 199 Q128 199 128 191 Z" fill="' + pointe + '"/>' +
      '<path d="M79 198 v-6 M86 198 v-6 M114 198 v-6 M121 198 v-6" stroke="' + nuance(pointe, 0.35) + '" stroke-width="1.6" stroke-linecap="round"/>';
    // Tortue : la carapace sur le dos ; oie : ses ailes
    if (e === 'tortue') s += '<path d="M42 170 Q42 112 100 108 Q158 112 158 170 Q100 184 42 170Z" fill="#9b6a3a"/>' +
      '<path d="M100 120 L118 132 L114 152 L86 152 L82 132 Z" fill="#b8854c"/><path d="M100 120 L100 110 M118 132 L140 124 M114 152 L134 166 M86 152 L66 166 M82 132 L60 124" stroke="#7a4f27" stroke-width="3"/>' +
      '<path d="M42 170 Q100 186 158 170" stroke="#e3c27a" stroke-width="6" fill="none" stroke-linecap="round"/>';
    if (e === 'oie') s += '<ellipse cx="54" cy="160" rx="15" ry="28" fill="' + fonce + '" transform="rotate(18 54 160)"/><ellipse cx="146" cy="160" rx="15" ry="28" fill="' + fonce + '" transform="rotate(-18 146 160)"/>';
    if (e === 'panda') s += '<path d="M48 150 Q50 124 74 120 L78 172 Q60 176 48 150Z M152 150 Q150 124 126 120 L122 172 Q140 176 152 150Z" fill="' + noir + '"/>';
    if (p.corps) s += habit(p.corps, c);
    s += '<ellipse cx="74" cy="138" rx="14" ry="8" fill="#fff" opacity="0.18" transform="rotate(-30 74 138)"/>';
    if (sg && sg.faim) s += '<g stroke="#b5562a" stroke-width="4.5" fill="none" stroke-linecap="round">' +
      '<path d="M40 150 q-7 10 0 20 M30 145 q-10 15 0 30 M160 150 q7 10 0 20 M170 145 q10 15 0 30"/>' +
      '<animate attributeName="opacity" values="1;0.15;1;0.15;1" dur="1.6s" repeatCount="indefinite"/></g>';
    s += '</g><g class="tete-g">';
    // Oreilles (derrière la tête)
    if (e === 'chat') s += '<path d="M58 58 L60 12 L94 44 Z" fill="' + c + '"/><path d="M142 58 L140 12 L106 44 Z" fill="' + c + '"/><path d="M64 48 L65 24 L84 42 Z" fill="#f4a9b8"/><path d="M136 48 L135 24 L116 42 Z" fill="#f4a9b8"/>';
    if (e === 'renard') s += '<path d="M52 66 Q46 26 56 2 Q80 18 98 44 Z" fill="' + c + '"/><path d="M148 66 Q154 26 144 2 Q120 18 102 44 Z" fill="' + c + '"/>' +
      '<path d="M53 14 Q55 6 56 2 Q66 8 72 14 Q62 18 53 14Z" fill="' + pointe + '"/><path d="M147 14 Q145 6 144 2 Q134 8 128 14 Q138 18 147 14Z" fill="' + pointe + '"/>' +
      '<path d="M60 56 Q56 32 62 18 Q76 30 88 46 L80 44 L84 52 L74 48 L76 56 Z" fill="' + creme + '"/><path d="M140 56 Q144 32 138 18 Q124 30 112 46 L120 44 L116 52 L126 48 L124 56 Z" fill="' + creme + '"/>' +
      '<path d="M64 46 Q62 34 66 26 Q72 36 76 44Z" fill="#f4b8c0" opacity="0.6"/><path d="M136 46 Q138 34 134 26 Q128 36 124 44Z" fill="#f4b8c0" opacity="0.6"/>';
    if (e === 'lapin') s += '<ellipse cx="78" cy="22" rx="13" ry="38" fill="' + c + '" transform="rotate(-10 78 22)"/><ellipse cx="122" cy="22" rx="13" ry="38" fill="' + c + '" transform="rotate(10 122 22)"/>' +
                             '<ellipse cx="78" cy="24" rx="6" ry="28" fill="#f4a9b8" transform="rotate(-10 78 22)"/><ellipse cx="122" cy="24" rx="6" ry="28" fill="#f4a9b8" transform="rotate(10 122 22)"/>';
    if (e === 'chevre') s += '<path d="M76 42 Q62 6 88 16 Q78 24 84 42Z" fill="#cdbb9c"/><path d="M124 42 Q138 6 112 16 Q122 24 116 42Z" fill="#cdbb9c"/>' +
                              '<ellipse cx="48" cy="72" rx="20" ry="9" fill="' + c + '" transform="rotate(20 48 72)"/><ellipse cx="152" cy="72" rx="20" ry="9" fill="' + c + '" transform="rotate(-20 152 72)"/>';
    if (e === 'dragon') s += '<path d="M64 52 Q40 34 44 4 Q52 30 82 40 Z" fill="' + corne + '"/><path d="M136 52 Q160 34 156 4 Q148 30 118 40 Z" fill="' + corne + '"/>' +
      '<path d="M52 30 Q58 36 66 38 M140 38 Q148 34 152 26" stroke="#fff" stroke-width="2" opacity="0.35" fill="none" stroke-linecap="round"/>';
    if (e === 'raton') s += '<path d="M58 60 Q54 22 90 42 Z" fill="' + c + '"/><path d="M142 60 Q146 22 110 42 Z" fill="' + c + '"/><path d="M64 52 Q62 32 82 44 Z" fill="#3a3a3a"/><path d="M136 52 Q138 32 118 44 Z" fill="#3a3a3a"/>';
    if (e === 'singe') s += '<circle cx="48" cy="84" r="17" fill="' + c + '"/><circle cx="152" cy="84" r="17" fill="' + c + '"/><circle cx="48" cy="84" r="9" fill="' + nuance(c, 0.55) + '"/><circle cx="152" cy="84" r="9" fill="' + nuance(c, 0.55) + '"/>';
    if (e === 'ecureuil') s += '<path d="M64 54 L60 14 L92 42 Z" fill="' + c + '"/><path d="M136 54 L140 14 L108 42 Z" fill="' + c + '"/><path d="M60 16 Q56 4 64 8 Q62 2 68 10 Z" fill="' + c + '"/><path d="M140 16 Q144 4 136 8 Q138 2 132 10 Z" fill="' + c + '"/>' +
                               '<path d="M68 46 L66 26 L84 42 Z" fill="#f4a9b8"/><path d="M132 46 L134 26 L116 42 Z" fill="#f4a9b8"/>';
    if (e === 'oie') s += '<path d="M96 36 Q100 22 108 30 Q102 30 104 38Z" fill="' + c + '"/>';
    if (e === 'panda') s += '<circle cx="60" cy="42" r="17" fill="' + noir + '"/><circle cx="140" cy="42" r="17" fill="' + noir + '"/>';
    // Tête
    s += '<circle cx="100" cy="82" r="48" fill="' + c + '"/>';
    // Panda : taches autour des yeux, avec le blanc de l'œil pour qu'on les voie
    if (e === 'panda') s += '<ellipse cx="78" cy="82" rx="15" ry="19" fill="' + noir + '" transform="rotate(25 78 82)"/><ellipse cx="122" cy="82" rx="15" ry="19" fill="' + noir + '" transform="rotate(-25 122 82)"/>' +
                             (dort ? '' : '<circle cx="80" cy="80" r="10" fill="#fff"/><circle cx="120" cy="80" r="10" fill="#fff"/>');
    if (e === 'dragon') s += '<path d="M76 44 Q70 22 86 28 Q84 6 100 20 Q108 2 116 24 Q132 14 126 42 Q100 32 76 44 Z" fill="' + houppe + '"/>' +
      '<path d="M86 28 Q92 36 88 42 M100 20 Q104 32 100 38 M116 24 Q112 34 114 40" stroke="' + nuance(c, -0.1) + '" stroke-width="1.5" fill="none" opacity="0.5"/>' +
      '<g fill="' + fonce + '" opacity="0.5"><circle cx="92" cy="52" r="2.2"/><circle cx="100" cy="48" r="2.6"/><circle cx="108" cy="52" r="2.2"/><circle cx="96" cy="58" r="1.6"/><circle cx="104" cy="58" r="1.6"/>' +
      '<circle cx="58" cy="90" r="1.8"/><circle cx="62" cy="84" r="1.4"/><circle cx="142" cy="90" r="1.8"/><circle cx="138" cy="84" r="1.4"/></g>';
    if (e === 'chien') s += '<ellipse cx="54" cy="78" rx="15" ry="30" fill="' + fonce + '" transform="rotate(18 54 78)"/><ellipse cx="146" cy="78" rx="15" ry="30" fill="' + fonce + '" transform="rotate(-18 146 78)"/>';
    if (e === 'raton') s += '<path d="M60 64 Q80 58 100 70 Q120 58 140 64" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9"/>' +
                            '<path d="M52 78 Q76 64 100 80 Q124 64 148 78 Q150 96 128 96 Q112 92 100 94 Q88 92 72 96 Q50 96 52 78Z" fill="#3a3a3a"/>' +
                            (dort ? '' : '<circle cx="80" cy="80" r="10" fill="#fff"/><circle cx="120" cy="80" r="10" fill="#fff"/>');
    if (e === 'singe') s += '<path d="M100 70 Q84 50 68 64 Q54 80 64 104 Q78 128 100 128 Q122 128 136 104 Q146 80 132 64 Q116 50 100 70Z" fill="' + nuance(c, 0.55) + '"/>';
    if (e === 'renard') s += '<path d="M56 80 L36 94 L50 96 L38 106 L56 104 Z" fill="' + c + '"/><path d="M144 80 L164 94 L150 96 L162 106 L144 104 Z" fill="' + c + '"/>' +
      '<path d="M88 38 L92 26 L97 35 L101 22 L105 35 L111 27 L112 40 Z" fill="' + c + '"/>' +
      '<path d="M40 98 L30 104 L44 108 L34 116 L52 116 Q70 136 100 134 Q130 136 148 116 L166 116 L156 108 L170 104 L160 98 Q142 90 128 94 Q114 102 100 102 Q86 102 72 94 Q58 90 40 98Z" fill="' + creme + '"/>';
    if (e !== 'oie' && e !== 'singe' && e !== 'renard') s += '<ellipse cx="100" cy="102" rx="22" ry="15" fill="' + (e === 'raton' ? '#f4f1ec' : clair) + '"/>';
    // Yeux : ouverts, fermés (la nuit), tristes
    var paupiere = (e === 'panda' || e === 'raton') ? '#fff' : '#2b2b2b';
    var plisses = e === 'renard' && humeur === 'content' && !triste && !dort;
    if (plisses) s += '<g class="regard"><path d="M70 84 Q80 72 90 84" stroke="#2b2b2b" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M110 84 Q120 72 130 84" stroke="#2b2b2b" stroke-width="4.5" fill="none" stroke-linecap="round"/></g>';
    else if (dort) s += '<path d="M72 80 q8 6 16 0" stroke="' + paupiere + '" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M112 80 q8 6 16 0" stroke="' + paupiere + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    else if (e === 'dragon') s += '<g class="regard"><g class="yeux"><ellipse cx="80" cy="80" rx="12" ry="14" fill="#2b2b2b"/><ellipse cx="120" cy="80" rx="12" ry="14" fill="#2b2b2b"/>' +
              '<ellipse cx="80" cy="84" rx="9" ry="9" fill="#6b4fb8"/><ellipse cx="120" cy="84" rx="9" ry="9" fill="#6b4fb8"/><ellipse cx="80" cy="84" rx="5.5" ry="6" fill="#1d1630"/><ellipse cx="120" cy="84" rx="5.5" ry="6" fill="#1d1630"/>' +
              '<circle cx="85" cy="74" r="4.6" fill="#fff"/><circle cx="125" cy="74" r="4.6" fill="#fff"/><circle cx="76" cy="88" r="2.2" fill="#fff" opacity="0.85"/><circle cx="116" cy="88" r="2.2" fill="#fff" opacity="0.85"/></g></g>' +
              (triste ? '<path d="M66 64 L86 58 M134 64 L114 58" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/><ellipse cx="132" cy="96" rx="3" ry="5" fill="#7fc8f8"/>' : '');
    else s += '<g class="regard"><g class="yeux"><ellipse cx="80" cy="80" rx="8" ry="10" fill="#2b2b2b"/><ellipse cx="120" cy="80" rx="8" ry="10" fill="#2b2b2b"/>' +
              '<circle cx="83" cy="76" r="3.4" fill="#fff"/><circle cx="123" cy="76" r="3.4" fill="#fff"/><circle cx="77" cy="85" r="1.6" fill="#fff" opacity="0.7"/><circle cx="117" cy="85" r="1.6" fill="#fff" opacity="0.7"/></g></g>' +
              (triste ? '<path d="M68 68 L86 62 M132 68 L114 62" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/><ellipse cx="128" cy="94" rx="3" ry="5" fill="#7fc8f8"/>' : '');
    // Joues, nez, bouche
    s += '<ellipse cx="66" cy="98" rx="9" ry="6" fill="#f48fb1" opacity="0.55"/><ellipse cx="134" cy="98" rx="9" ry="6" fill="#f48fb1" opacity="0.55"/>';
    if (e === 'oie') s += '<path d="M82 98 Q100 84 118 98 Q100 104 82 98Z" fill="#f7a531"/><path d="M84 99 Q100 106 116 99 Q100 120 84 99Z" fill="#e8891a"/>';
    else s += e === 'dragon' || e === 'tortue' ? '<circle cx="94" cy="96" r="2.5" fill="' + fonce + '"/><circle cx="106" cy="96" r="2.5" fill="' + fonce + '"/>' : '<ellipse cx="100" cy="96" rx="6" ry="4.5" fill="#3b2a2a"/>';
    var langue = sg && sg.soif && !dort;
    if (langue) s += e === 'oie' ? '<path d="M96 104 Q96 118 100 119 Q104 118 104 104 Z" fill="#ef6f8a"/>'
      : '<path d="M88 106 Q100 114 112 106" stroke="#3b2a2a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M92 108 Q91 127 100 128 Q109 127 108 108 Q100 112 92 108Z" fill="#ef6f8a" stroke="#c94f6b" stroke-width="1.5"/><path d="M100 112 V122" stroke="#c94f6b" stroke-width="1.5" stroke-linecap="round"/>';
    else if (e !== 'oie') s += triste ? '<path class="bouche" d="M90 112 q10 -8 20 0" stroke="#3b2a2a" stroke-width="3" fill="none" stroke-linecap="round"/>'
       : humeur === 'content' && e === 'renard' ? '<path class="bouche" d="M89 105 q5.5 7 11 0 q5.5 7 11 0" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/>'
       : humeur === 'content' ? '<path class="bouche" d="M88 104 q12 14 24 0" stroke="#3b2a2a" stroke-width="3" fill="#e57373" stroke-linecap="round"/>'
       : '<path class="bouche" d="M92 106 q8 6 16 0" stroke="#3b2a2a" stroke-width="3" fill="none" stroke-linecap="round"/>';
    // Bâillement : invisible, la page l'affiche de temps en temps
    if (!langue) s += e === 'oie' ? '<ellipse class="baillement" cx="100" cy="103" rx="7" ry="6" fill="#7a2f3a" opacity="0"/>'
                                  : '<ellipse class="baillement" cx="100" cy="111" rx="8" ry="10" fill="#7a2f3a" opacity="0"/>';
    if (e === 'chevre') s += '<path d="M94 122 Q100 146 106 122 Z" fill="#e8e2d6"/>';
    if (e === 'ecureuil' && !triste) s += '<rect x="95.5" y="106" width="9" height="8" rx="2" fill="#fff" stroke="#d8cfc4" stroke-width="1"/><path d="M100 106 v8" stroke="#d8cfc4" stroke-width="1"/>';
    if (e === 'chat' || e === 'raton' || e === 'ecureuil') s += '<path d="M60 98 l-22 -4 M60 104 l-22 4 M140 98 l22 -4 M140 104 l22 4" stroke="#2b2b2b" stroke-width="1.5" opacity="0.5"/>';
    // Reflets : lumière venant d'en haut à gauche (tête et ventre), sous les accessoires
    s += '<ellipse cx="80" cy="56" rx="20" ry="12" fill="#fff" opacity="0.28" transform="rotate(-25 80 56)"/>';
    if (p.cou) s += accessoireCou(p.cou);
    if (p.tete) s += chapeau(p.tete);
    s += '</g></g>';
    if (sg && sg.toilette) s += mouches();
    return relief(s, { c: c, f: fonce, l: clair, n: noir });
  }
  // Deux mouches qui tournent en rond au-dessus de la tête, sur un petit cercle en pointillés
  function mouches() {
    var orbite = 'M50 22 a50 13 0 1 0 100 0 a50 13 0 1 0 -100 0';
    var r = '<path d="' + orbite + '" stroke="#6b5a3a" stroke-width="1.5" stroke-dasharray="3 6" fill="none" opacity="0.45"/>';
    ['0s', '-1.3s'].forEach(debut => {
      r += '<g><g transform="scale(1.7)"><ellipse cx="-3" cy="-5" rx="5" ry="3.5" fill="#dfe9f3" opacity="0.85" stroke="#9fb0bf" stroke-width="0.8">' +
           '<animate attributeName="ry" values="3.5;1;3.5" dur="0.16s" repeatCount="indefinite"/></ellipse>' +
           '<ellipse cx="4" cy="-5" rx="5" ry="3.5" fill="#dfe9f3" opacity="0.85" stroke="#9fb0bf" stroke-width="0.8">' +
           '<animate attributeName="ry" values="3.5;1;3.5" dur="0.16s" repeatCount="indefinite"/></ellipse>' +
           '<ellipse cx="0" cy="0" rx="5.5" ry="4" fill="#2b2b2b"/><circle cx="5" cy="-1" r="2.6" fill="#2b2b2b"/></g>' +
           '<animateMotion dur="2.6s" begin="' + debut + '" repeatCount="indefinite" path="' + orbite + '"/></g>';
    });
    return r;
  }
  // « Niveau 1 » de relief : chaque couleur unie devient un dégradé arrondi (clair en haut à gauche, sombre en bas à droite)
  function relief(s, couleurs) {
    var defs = '<defs><filter id="v-flou" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3.5"/></filter>';
    Object.keys(couleurs).forEach(k => {
      var c = couleurs[k], id = 'v-' + c.slice(1);
      defs += '<radialGradient id="' + id + '" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="' + nuance(c, 0.38) + '"/>' +
              '<stop offset="0.55" stop-color="' + c + '"/><stop offset="1" stop-color="' + nuance(c, -0.22) + '"/></radialGradient>';
      s = s.split('fill="' + c + '"').join('fill="url(#' + id + ')"');
    });
    return defs + '</defs>' + s;
  }
  function nuance(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var f = x => Math.round(k < 0 ? x * (1 + k) : x + (255 - x) * k);
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function art(id) { return ARTICLES.find(a => a.id === id) || {}; }
  function habit(id, c) {
    var a = art(id), k = a.couleur;
    if (id === 'cape') return '<path d="M56 132 Q100 120 144 132 L154 196 Q100 206 46 196 Z" fill="' + k + '"/><ellipse cx="100" cy="166" rx="32" ry="28" fill="' + nuance(c, 0.45) + '"/>';
    if (id === 'cape-vampire') return '<path d="M52 134 L36 92 L74 122 Z M148 134 L164 92 L126 122 Z" fill="#c92a2a"/>' +
      '<path d="M54 130 Q100 118 146 130 L156 198 Q100 208 44 198 Z" fill="' + k + '"/><path d="M54 130 L44 198 L56 197 L64 136 Z M146 130 L156 198 L144 197 L136 136 Z" fill="#c92a2a"/>' +
      '<ellipse cx="100" cy="166" rx="32" ry="28" fill="' + nuance(c, 0.45) + '"/>';
    var r = '<path d="M50 150 Q52 120 100 118 Q148 120 150 150 L148 178 Q100 192 52 178 Z" fill="' + k + '"/>';
    if (id === 'manteau') r += '<path d="M100 120 L100 186" stroke="' + nuance(k, -0.3) + '" stroke-width="3"/><circle cx="108" cy="140" r="3.5" fill="#f4c430"/><circle cx="108" cy="158" r="3.5" fill="#f4c430"/><circle cx="108" cy="176" r="3.5" fill="#f4c430"/>' +
                             '<path d="M52 176 Q100 192 148 176" stroke="#fff" stroke-width="6" fill="none" opacity="0.9"/>';
    if (id === 'pull-noel') {
      var z = 'M52 152'; for (var x = 52; x < 148; x += 8) z += ' L' + (x + 4) + ' 146 L' + (x + 8) + ' 152';
      r += '<path d="' + z + '" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/><path d="M54 164 Q100 176 146 164" stroke="#2b8a3e" stroke-width="7" fill="none"/>' +
           '<g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M76 132 v10 M71 137 h10 M72.5 133.5 l7 7 M79.5 133.5 l-7 7"/><path d="M124 132 v10 M119 137 h10 M120.5 133.5 l7 7 M127.5 133.5 l-7 7"/></g>';
    }
    if (id === 'pull') r += '<path d="M56 140 Q100 152 144 140 M54 160 Q100 172 146 160" stroke="' + nuance(k, 0.4) + '" stroke-width="5" fill="none"/>';
    return r;
  }
  function accessoireCou(id) {
    var k = art(id).couleur;
    if (id === 'noeud' || id === 'noeud-dore' || id === 'noeud-vert') return '<path d="M100 128 L78 116 L78 140 Z M100 128 L122 116 L122 140 Z" fill="' + k + '"/><circle cx="100" cy="128" r="6" fill="' + nuance(k, -0.3) + '"/>';
    if (id === 'echarpe') return '<path d="M60 118 Q100 136 140 118 L142 130 Q100 148 58 130 Z" fill="' + k + '"/><path d="M118 132 L126 172 L112 172 L108 136Z" fill="' + k + '"/>';
    if (id === 'collier-coeur') return '<path d="M62 122 Q100 140 138 122" stroke="' + k + '" stroke-width="7" fill="none" stroke-linecap="round"/>' + coeur(100, 140, 8, '#ff6b81') +
      '<circle cx="97" cy="136" r="2" fill="#fff" opacity="0.7"/>';
    var r = '<path d="M62 122 Q100 140 138 122" stroke="' + k + '" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="100" cy="134" r="5" fill="#f4c430"/>';
    if (id === 'laisse' || id === 'laisse-luxe') r += '<path d="M100 136 Q140 170 196 150" stroke="' + k + '" stroke-width="' + (id === 'laisse-luxe' ? 5 : 3.5) + '" fill="none"/>' +
                                                      (id === 'laisse-luxe' ? '<path d="M100 136 Q140 170 196 150" stroke="#f4c430" stroke-width="1.5" stroke-dasharray="4 6" fill="none"/>' : '');
    return r;
  }
  function coeur(cx, cy, s, f) {
    return '<path d="M' + cx + ' ' + (cy + s * 0.9) + ' C' + (cx - s * 1.6) + ' ' + (cy - s * 0.2) + ' ' + (cx - s * 0.6) + ' ' + (cy - s * 1.3) + ' ' + cx + ' ' + (cy - s * 0.4) +
           ' C' + (cx + s * 0.6) + ' ' + (cy - s * 1.3) + ' ' + (cx + s * 1.6) + ' ' + (cy - s * 0.2) + ' ' + cx + ' ' + (cy + s * 0.9) + 'Z" fill="' + f + '"/>';
  }
  function chapeau(id) {
    var k = art(id).couleur;
    if (id === 'bonnet') return '<path d="M58 60 Q60 18 100 16 Q140 18 142 60 Z" fill="' + k + '"/><rect x="54" y="52" width="92" height="14" rx="7" fill="#fff"/><circle cx="100" cy="14" r="10" fill="#fff"/>';
    if (id === 'chapeau') return '<ellipse cx="100" cy="42" rx="46" ry="9" fill="' + k + '"/><path d="M72 42 Q72 6 100 6 Q128 6 128 42Z" fill="' + k + '"/><rect x="72" y="30" width="56" height="7" fill="#c0392b"/>';
    if (id === 'couronne') return '<path d="M68 44 L72 14 L86 30 L100 8 L114 30 L128 14 L132 44 Z" fill="' + k + '" stroke="#c99a00" stroke-width="2"/><circle cx="100" cy="30" r="4" fill="#e53935"/>';
    if (id === 'chapeau-sorciere') {
      // Chapeau de sorcière violet : pointe molle qui retombe et s'enroule en spirale, bord ondulé, toiles d'araignée et chauve-souris
      var o = '#2a1745', fonce = nuance(k, -0.3), toile = (cx, cy, r) => {
        var s = '';
        for (var a = 0; a < 6; a++) { var g = a * Math.PI / 3 + 0.3; s += 'M' + cx + ' ' + cy + ' l' + (r * Math.cos(g)).toFixed(1) + ' ' + (r * Math.sin(g)).toFixed(1) + ' '; }
        [0.45, 0.85].forEach(f => { s += 'M'; for (var a = 0; a <= 6; a++) { var g = a * Math.PI / 3 + 0.3; s += (a ? ' L' : '') + (cx + r * f * Math.cos(g)).toFixed(1) + ' ' + (cy + r * f * Math.sin(g)).toFixed(1); } s += ' '; });
        return '<path d="' + s + '" stroke="' + o + '" stroke-width="0.9" fill="none" opacity="0.75"/>';
      };
      return '<path d="M128 15 C136 22 136 31 128 31 C122 31 121 25 126 23" stroke="' + o + '" stroke-width="7.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M128 15 C136 22 136 31 128 31 C122 31 121 25 126 23" stroke="' + k + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M76 41 C82 26 90 12 102 5 C114 0 126 4 131 13 L125 17 C120 11 114 11 112 17 C110 25 114 33 124 41 Z" fill="' + k + '" stroke="' + o + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M112 17 C110 25 114 33 124 41 L110 41 C106 31 106 22 110 14 Z" fill="' + fonce + '" opacity="0.45"/>' +
        toile(94, 26, 7) + toile(111, 7, 4.5) + toile(118, 35, 5) +
        '<path d="M38 45 Q52 36 78 38 Q100 41 122 38 Q148 36 162 45 Q150 53 100 52 Q50 53 38 45 Z" fill="' + k + '" stroke="' + o + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M50 47 Q100 55 150 47" stroke="' + fonce + '" stroke-width="2" fill="none" opacity="0.5"/>' +
        '<path d="M54 42 q5 -6 11 -3 q2 -3 4 -1 q2 -2 4 1 q6 -3 11 3 q-4 0 -6 4 q-3 -2 -5 1 q-2 -3 -4 0 q-3 -3 -5 0 q-3 -4 -10 -5 z" fill="#1d1d24"/>' +
        '<circle cx="67.5" cy="40" r="0.8" fill="#fff"/><circle cx="70.5" cy="40" r="0.8" fill="#fff"/>';
    }
    if (id === 'bonnet-noel') return '<path d="M58 56 Q60 12 104 10 Q140 12 154 50 Q136 30 122 26 Q134 40 140 56 Z" fill="' + k + '"/>' +
      '<rect x="54" y="48" width="92" height="15" rx="7.5" fill="#fff"/><circle cx="154" cy="54" r="9" fill="#fff"/>';
    if (id === 'chapeau-anniv') return '<g transform="rotate(-12 100 40)"><path d="M78 44 L100 4 L122 44 Z" fill="' + k + '"/>' +
      '<circle cx="94" cy="32" r="3" fill="#fff"/><circle cx="106" cy="22" r="3" fill="#ffd43b"/><circle cx="108" cy="38" r="3" fill="#ff8787"/><circle cx="98" cy="16" r="2.4" fill="#ff8787"/><circle cx="88" cy="40" r="2.4" fill="#ffd43b"/>' +
      '<circle cx="100" cy="5" r="6" fill="#ff8787"/><path d="M78 44 Q100 50 122 44" stroke="#fff" stroke-width="3" fill="none" opacity="0.8"/></g>';
    if (id === 'toque') return '<rect x="72" y="30" width="56" height="16" rx="3" fill="' + k + '" stroke="#dee2e6" stroke-width="1.5"/>' +
      '<path d="M72 32 Q56 26 62 12 Q66 0 82 6 Q88 -4 100 0 Q112 -4 118 6 Q134 0 138 12 Q144 26 128 32 Z" fill="' + k + '" stroke="#dee2e6" stroke-width="1.5"/>' +
      '<path d="M86 30 Q86 18 90 12 M100 30 V10 M114 30 Q114 18 110 12" stroke="#dee2e6" stroke-width="1.5" fill="none"/>';
    if (id === 'chapeau-trefle') return '<ellipse cx="100" cy="42" rx="44" ry="8" fill="' + nuance(k, -0.2) + '"/><path d="M76 42 L80 6 L120 6 L124 42 Z" fill="' + k + '"/>' +
      '<rect x="78" y="30" width="44" height="8" fill="#2b2b2b"/><rect x="94" y="29" width="12" height="10" rx="1.5" fill="none" stroke="#f4c430" stroke-width="2.5"/>' +
      '<g transform="translate(110 18)"><circle cx="-3.5" cy="-3" r="3.6" fill="#8ce99a"/><circle cx="3.5" cy="-3" r="3.6" fill="#8ce99a"/><circle cx="0" cy="3" r="3.6" fill="#8ce99a"/><path d="M0 3 l2 6" stroke="#8ce99a" stroke-width="1.5"/></g>';
    if (id === 'casque') return '<path d="M52 82 Q50 26 100 24 Q150 26 148 82" stroke="' + k + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<rect x="40" y="70" width="18" height="30" rx="8" fill="' + k + '"/><rect x="142" y="70" width="18" height="30" rx="8" fill="' + k + '"/>' +
      '<rect x="44" y="74" width="8" height="22" rx="4" fill="' + nuance(k, 0.4) + '"/><rect x="148" y="74" width="8" height="22" rx="4" fill="' + nuance(k, 0.4) + '"/>';
    if (id === 'chapeau-fete') return '<g transform="rotate(14 100 40)"><path d="M78 44 L100 4 L122 44 Z" fill="' + k + '"/>' +
      '<path d="M84 34 L110 12 M90 42 L116 22 M100 44 L119 30" stroke="#ffd43b" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle cx="100" cy="5" r="6" fill="#ffd43b"/><path d="M78 44 Q100 50 122 44" stroke="#fff" stroke-width="3" fill="none" opacity="0.8"/></g>';
    if (id === 'bandeau-coeurs') return '<path d="M56 64 Q58 34 100 32 Q142 34 144 64" stroke="' + k + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<path d="M84 34 Q78 22 76 12 M116 34 Q122 22 124 12" stroke="#495057" stroke-width="2" fill="none"/>' + coeur(76, 12, 9, '#ff6b81') + coeur(124, 12, 9, '#e03131');
    if (id === 'oreilles-lapin') return '<ellipse cx="78" cy="14" rx="10" ry="24" fill="' + k + '" stroke="#dee2e6" stroke-width="1.5" transform="rotate(-14 78 30)"/>' +
      '<ellipse cx="122" cy="14" rx="10" ry="24" fill="' + k + '" stroke="#dee2e6" stroke-width="1.5" transform="rotate(14 122 30)"/>' +
      '<ellipse cx="78" cy="16" rx="5" ry="17" fill="#fcc2d7" transform="rotate(-14 78 30)"/><ellipse cx="122" cy="16" rx="5" ry="17" fill="#fcc2d7" transform="rotate(14 122 30)"/>' +
      '<path d="M56 64 Q58 34 100 32 Q142 34 144 64" stroke="#f783ac" stroke-width="6" fill="none" stroke-linecap="round"/>';
    if (id === 'chapeau-paille') return '<ellipse cx="100" cy="42" rx="58" ry="11" fill="' + k + '"/><path d="M72 42 Q72 14 100 14 Q128 14 128 42Z" fill="' + k + '"/>' +
      '<rect x="72" y="32" width="56" height="7" fill="#e76f51"/><path d="M50 42 Q100 56 150 42 M80 22 Q100 18 120 22" stroke="' + nuance(k, -0.25) + '" stroke-width="1.5" fill="none" opacity="0.7"/>';
    if (id === 'lunettes') return '<path d="M62 76 L46 70 M138 76 L154 70" stroke="' + k + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<rect x="62" y="69" width="34" height="23" rx="10" fill="' + k + '"/><rect x="104" y="69" width="34" height="23" rx="10" fill="' + k + '"/><path d="M96 76 Q100 72 104 76" stroke="' + k + '" stroke-width="3.5" fill="none"/>' +
      '<path d="M68 74 L76 74 M110 74 L118 74" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>';
    if (id === 'fleur') return '<g transform="translate(132 42)"><circle r="7" cx="0" cy="-9" fill="' + k + '"/><circle r="7" cx="9" cy="0" fill="' + k + '"/><circle r="7" cx="0" cy="9" fill="' + k + '"/><circle r="7" cx="-9" cy="0" fill="' + k + '"/><circle r="6" fill="#ffd54f"/></g>';
    return '';
  }

  // ================== JAUGE VIDE : UNE ÉTOILE PERDUE PAR HEURE ==================
  // Dès qu'une jauge tombe à 0, il prévient (bulle ou notification) ; une heure plus tard, s'il y a toujours une jauge vide,
  // il perd 1 ⭐, puis 1 ⭐ par heure tant qu'une jauge reste vide. Pause la nuit (21 h – 8 h) : il dort, on ne compte pas.
  // Compté aussi quand l'appli était fermée (au retour). État dans compagnon-penalite : { compte, reste, alerte }.
  var HEURE = 3600000;
  function nuitPenalite(t) { var h = new Date(t).getHours(); return h >= 21 || h < 8; }
  function videA(a, b) { var s = a.besoins[b.id]; return s.t + s.v / (100 / b.heures) * HEURE; }   // moment où la jauge atteint 0
  function jaugesVides(a, t) { return a && a.besoins ? BESOINS.filter(b => videA(a, b) <= (t || Date.now())) : []; }
  function msDeJour(de, a) { var ms = 0; for (var x = de; x < a; x += 600000) if (!nuitPenalite(x)) ms += Math.min(600000, a - x); return ms; }
  var NOMS_VIDE = { repas: 'ma gamelle', eau: 'mon eau', toilette: 'ma toilette', calin: 'mes câlins' };
  function regler(a, t) {
    t = t || Date.now();
    if (!a || !a.besoins) return { perdu: 0, vides: [] };
    var st = lireV('compagnon-penalite') || {}, vides = jaugesVides(a, t);
    if (!vides.length) { if (st.compte || st.reste) ecrireV('compagnon-penalite', { alerte: st.alerte || 0 }); return { perdu: 0, vides: [] }; }
    var debut = Math.min.apply(null, vides.map(b => videA(a, b)));
    var nouveau = !st.compte || st.compte < debut;                       // nouvel épisode de jauge vide
    var total = (nouveau ? 0 : st.reste || 0) + msDeJour(Math.max(debut, st.compte || 0), t);
    var n = Math.floor(total / HEURE), perdu = 0;
    st.compte = t; st.reste = total - n * HEURE;
    if (n > 0 && typeof Etoiles !== 'undefined') {
      perdu = Math.min(n, Etoiles.solde());
      if (perdu) Etoiles.ajouter(-perdu, 'Jauge vide (' + vides.map(b => b.nom.toLowerCase()).join(', ') + ')', true);
    }
    ecrireV('compagnon-penalite', st);
    return { perdu: perdu, vides: vides, debut: debut };
  }
  // À appeler régulièrement (toutes les pages) : compte les étoiles perdues et prévient, même si les petits mots sont coupés
  function surveiller() {
    var a = lireV('compagnon-animal');
    if (!a || !a.besoins) return null;
    var t = Date.now(), res = regler(a, t), msg = null;
    if (res.perdu) msg = { texte: 'J\'ai perdu ' + res.perdu + ' ⭐… ' + NOMS_VIDE[res.vides[0].id] + (res.vides[0].id === 'calin' ? ' me manquent' : ' est vide') + ' depuis trop longtemps 😢', demande: true };
    else if (res.vides.length && !nuitPenalite(t)) {
      var st = lireV('compagnon-penalite') || {}, id = Math.round(res.debut / 60000);
      if (st.alerte !== id) {
        st.alerte = id; ecrireV('compagnon-penalite', st);
        msg = { texte: '⚠️ ' + NOMS_VIDE[res.vides[0].id].replace(/^./, c => c.toUpperCase()) + (res.vides[0].id === 'calin' ? ' sont à zéro' : ' est à zéro') +
                       ' ! Si personne ne s\'occupe de moi dans l\'heure, je perdrai une étoile ⭐ par heure.', demande: true };
      }
    }
    if (msg) annoncer(a, msg, true);
    return msg;
  }
  // ================== VEILLE : le compagnon parle de lui-même tant que l'appli est ouverte ==================
  // Une petite bulle dans l'appli, ou une notification du téléphone si l'appli est en arrière-plan (et autorisée).
  // Pas plus d'un message toutes les 20 min, rien la nuit (il dort), une même demande au plus toutes les 3 h.
  var GENTILS = ['Coucou ! Je pense à toi 💛', 'J\'aime bien quand tu es là 😊', 'Une petite partie avec les amis ? 🎲',
    'Merci de prendre soin de moi 🥰', 'Tu joues drôlement bien aujourd\'hui !', 'On fait un câlin tout à l\'heure ? 🤗',
    'Il fait bon dans ma maison ☀️', 'Je t\'ai gardé une place sur le coussin 🛋️', 'Tu me racontes ta journée ? 🙂',
    'Je suis fier de toi ! ⭐', 'Pense à boire un verre d\'eau toi aussi 💧', 'Tu m\'as manqué ! 🐾'];
  var DEMANDES = { repas: 'J\'ai un petit creux… tu me donnes à manger ? 🍖', eau: 'J\'ai soif ! Un peu d\'eau ? 💧',
                   toilette: 'Je suis tout sale… un petit bain ? 🛁', calin: 'Tu me fais un câlin ? ❤️' };
  var ESPACE_MESSAGES = 20 * 60000, ESPACE_GENTILS = 45 * 60000, ESPACE_DEMANDE = 3 * 3600000;
  function lireV(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function ecrireV(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function reglagesMessages() { return Object.assign({ messages: true, notifications: false }, lireV('compagnon-reglages') || {}); }
  var veille = null;
  function demarrerVeille(page) {
    if (veille) return;
    veille = { page: page || '' };
    setTimeout(() => { surveiller(); verifierVeille(); }, 20000);
    setInterval(() => { if (!surveiller()) verifierVeille(); }, 60000);
  }
  function verifierVeille(forcer) {
    var a = lireV('compagnon-animal'), r = reglagesMessages();
    if (!a || !a.besoins || !r.messages) return null;
    var t = Date.now(), h = new Date(t).getHours();
    if (!forcer && (h >= 21 || h < 8)) return null;                     // la nuit, il dort
    var etat = lireV('compagnon-veille') || { dernier: 0, demandes: {}, jour: '' };
    if (!forcer && t - etat.dernier < ESPACE_MESSAGES) return null;
    var nom = a.nom, prof = lireV('desdale-profil') || {}, qui = prof.pseudo ? ' ' + prof.pseudo : '';
    var d = new Date(t), jour = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
    var msg = null;
    // 1) Une demande, s'il manque quelque chose (le besoin le plus bas d'abord)
    var n = niveaux(a, t);
    var bas = BESOINS.filter(b => n[b.id] < 30 && t - (etat.demandes[b.id] || 0) > ESPACE_DEMANDE).sort((x, y) => n[x.id] - n[y.id]);
    if (bas.length && veille && veille.page !== 'compagnon') { msg = { texte: DEMANDES[bas[0].id], demande: true }; etat.demandes[bas[0].id] = t; }
    // 2) Le premier message de la journée : bonjour
    else if (etat.jour !== jour) { var fj = feteDu(t, a.ne); msg = { texte: fj && fj.estJourJ && fj.voeux ? fj.voeux : (h < 12 ? 'Bonjour' : h < 18 ? 'Coucou' : 'Bonsoir') + qui + ' ! Je suis content de te voir 🐾' }; }
    // 3) De temps en temps, un mot gentil
    else if (forcer || (t - etat.dernier > ESPACE_GENTILS && Math.random() < 0.35)) {
      var fs = feteDu(t, a.ne), l = fs ? GENTILS.concat(fs.mots, fs.mots) : GENTILS;   // pendant une fête, ses petits mots reviennent plus souvent
      msg = { texte: l[Math.floor(Math.random() * l.length)] };
    }
    if (!msg) return null;
    etat.dernier = t; etat.jour = jour;
    ecrireV('compagnon-veille', etat);
    annoncer(a, msg);
    return msg;
  }
  function annoncer(a, msg, important) {
    // Appli en arrière-plan : notification du téléphone (si autorisée ; les alertes de jauge vide passent même si les petits mots sont coupés)
    if (document.visibilityState === 'hidden') {
      if ((reglagesMessages().notifications || important) && 'Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(reg => reg.showNotification(a.nom, {
          body: msg.texte, icon: 'apple-touch-icon.png', badge: 'favicon.png', tag: 'compagnon', renotify: true,
          data: { url: 'compagnon/' }
        })).catch(() => {});
      }
      return;
    }
    bulleCompagnon(a, msg);
  }
  // Bulle dans l'appli : son petit dessin, son message, et « J'y vais » pour une demande
  function bulleCompagnon(a, msg) {
    try {
      var ancien = document.getElementById('cp-bulle'); if (ancien) ancien.remove();
      var d = document.createElement('div');
      d.id = 'cp-bulle';
      d.style.cssText = 'position:fixed;left:50%;top:10px;transform:translate(-50%,-140%);z-index:4500;width:calc(100% - 24px);max-width:420px;background:#fff8e7;' +
        'border-radius:18px;box-shadow:0 8px 26px rgba(0,0,0,.22);display:flex;align-items:center;gap:8px;padding:6px 10px 6px 4px;' +
        'font:600 15px system-ui,sans-serif;color:#3b2f1a;transition:transform .45s cubic-bezier(.2,.9,.3,1.2);cursor:pointer';
      var dessinA = '<svg viewBox="0 -6 200 216" width="58" height="62" style="flex-shrink:0">' + dessin(a, msg.demande ? 'triste' : 'content', false) + '</svg>';
      d.innerHTML = dessinA + '<div style="flex:1;min-width:0"><div style="font-weight:900;color:#7a5600">' + String(a.nom).replace(/</g, '&lt;') + '</div>' +
        '<div>' + msg.texte + '</div></div>' +
        (msg.demande ? '<a href="compagnon/" style="flex-shrink:0;background:#2c3e50;color:#fff;border-radius:12px;padding:8px 10px;text-decoration:none;font-weight:800">J\'y vais</a>' : '');
      document.body.appendChild(d);
      requestAnimationFrame(() => requestAnimationFrame(() => { d.style.transform = 'translate(-50%,0)'; }));
      var fermer = () => { d.style.transform = 'translate(-50%,-140%)'; setTimeout(() => d.remove(), 500); };
      d.addEventListener('click', e => { if (e.target.tagName !== 'A') fermer(); });
      setTimeout(fermer, msg.demande ? 12000 : 7000);
      try { if (navigator.vibrate && lireV('brillant-vibration') !== false) navigator.vibrate(30); } catch (e) {}
    } catch (e) {}
  }


  // ================== DÉFIS DE LA SEMAINE, TROPHÉES ET MAISON ==================
  // Chaque semaine (du lundi au dimanche), trois défis : facile, moyen, difficile. Les mêmes pour tout le monde
  // (tirés d'après le numéro de la semaine). Ils se lisent dans le journal des parties (Etoiles.evenement, dans commun.js).
  // Un défi réussi rapporte une coupe (bronze, argent, or) qu'on ne peut pas acheter, et des étoiles hors plafond.
  // Les trois défis de la même semaine : une clé pour agrandir la maison d'une pièce au choix.
  var NIVEAUX_DEFI = [
    { id: 'bronze', nom: 'Facile', metal: 'Bronze', coupe: 'Coupe de bronze', couleurs: ['#f6c79a', '#c98146', '#7a4220'], etoiles: 3 },
    { id: 'argent', nom: 'Moyen', metal: 'Argent', coupe: 'Coupe d\'argent', couleurs: ['#ffffff', '#c3ccd4', '#6f7c88'], etoiles: 5 },
    { id: 'or', nom: 'Difficile', metal: 'Or', coupe: 'Coupe d\'or', couleurs: ['#fff4b0', '#f0b92a', '#9a6400'], etoiles: 8 }
  ];
  function nb(f) { return evs => evs.filter(f).length; }
  var QL4 = 'Quatre en ligne';
  // Six défis par niveau : ils reviennent tous avant qu'un même défi ne repasse
  var DEFIS = [
    { id: 'ql-normal', niv: 0, ico: '🔴', but: 1, titre: 'Battre l\'ordinateur « Normal » ou « Fort » au Quatre en ligne', compte: nb(e => e.jeu === QL4 && !e.p && e.g && e.i && (e.i.niveau === 'normal' || e.i.niveau === 'fort')) },
    { id: 'yams-solo', niv: 0, ico: '🎲', but: 2, titre: 'Finir 2 parties de Yams seul', compte: nb(e => e.jeu === 'Yams' && !e.p) },
    { id: 'bn-solo', niv: 0, ico: '⚓', but: 1, titre: 'Couler la flotte de l\'ordinateur à la Bataille navale', compte: nb(e => e.jeu === 'Bataille navale' && !e.p && e.g) },
    { id: 'as-solo', niv: 0, ico: '🚩', but: 1, titre: 'Prendre le drapeau de l\'ordinateur à l\'Assaut', compte: nb(e => e.jeu === 'Assaut' && !e.p && e.g) },
    { id: 'solo-3', niv: 0, ico: '🧩', but: 3, titre: 'Terminer 3 parties seul, au jeu de ton choix', compte: nb(e => !e.p) },
    { id: 'ql-3', niv: 0, ico: '🟡', but: 3, titre: 'Gagner 3 parties de Quatre en ligne', compte: nb(e => e.jeu === QL4 && e.g) },
    { id: 'amis-3', niv: 1, ico: '🤝', but: 3, titre: 'Jouer 3 parties avec des amis', compte: nb(e => e.p) },
    { id: 'gb-2', niv: 1, ico: '✏️', but: 2, titre: 'Jouer 2 parties de Gribouille', compte: nb(e => e.jeu === 'Gribouille') },
    { id: 'pb-1', niv: 1, ico: '📝', but: 1, titre: 'Jouer une partie de Petit bac', compte: nb(e => e.jeu === 'Petit bac') },
    { id: 'jeux-3', niv: 1, ico: '🎪', but: 3, titre: 'Jouer à 3 jeux différents avec des amis', compte: evs => Object.keys(evs.filter(e => e.p).reduce((o, e) => { o[e.jeu] = 1; return o; }, {})).length },
    { id: 'yams-amis', niv: 1, ico: '🎲', but: 2, titre: 'Jouer 2 parties de Yams à plusieurs', compte: nb(e => e.jeu === 'Yams' && e.p) },
    { id: 'lc-1', niv: 1, ico: '🔤', but: 1, titre: 'Finir une partie de Lettres croisées', compte: nb(e => e.jeu === 'Lettres croisées') },
    { id: 'bg-gagne', niv: 2, ico: '🎯', but: 1, titre: 'Gagner une partie de Backgammon', compte: nb(e => e.jeu === 'Backgammon' && e.g) },
    { id: 'ql-fort', niv: 2, ico: '🧠', but: 1, titre: 'Battre l\'ordinateur « Fort » au Quatre en ligne', compte: nb(e => e.jeu === QL4 && !e.p && e.g && e.i && e.i.niveau === 'fort') },
    { id: 'dm-gagne', niv: 2, ico: '🔲', but: 1, titre: 'Gagner une partie de Dominos ou de Triominos', compte: nb(e => (e.jeu === 'Dominos' || e.jeu === 'Triominos') && e.g) },
    { id: 'amis-gagne-3', niv: 2, ico: '👑', but: 3, titre: 'Gagner 3 parties contre des amis', compte: nb(e => e.p && e.g) },
    { id: 'pb-gagne', niv: 2, ico: '📝', but: 1, titre: 'Gagner une partie de Petit bac', compte: nb(e => e.jeu === 'Petit bac' && e.g) },
    { id: 'gb-gagne', niv: 2, ico: '🖍️', but: 1, titre: 'Gagner une partie de Gribouille', compte: nb(e => e.jeu === 'Gribouille' && e.g) }
  ];
  // Les pièces de la maison : le salon au départ, la salle des trophées à la première coupe, les autres avec une clé
  var BLOCS = [
    { id: 'salon', nom: 'Salon', ico: '🛋️', desc: 'Sa pièce de tous les jours' },
    { id: 'trophees', nom: 'Salle des trophées', ico: '🏆', desc: 'S\'ouvre avec ta première coupe', auto: true },
    { id: 'jardin', nom: 'Jardin', ico: '🌳', desc: 'De l\'herbe, des fleurs et des papillons' },
    { id: 'chambre', nom: 'Chambre', ico: '🛏️', desc: 'Il y dort la nuit, bien au chaud' },
    { id: 'cuisine', nom: 'Cuisine', ico: '🍲', desc: 'Ses gamelles et le goûter' },
    { id: 'jeux', nom: 'Salle de jeux', ico: '🎲', desc: 'Pour les soirées entre amis' }
  ];
  var ETAGERE_MAX = 3;
  function lundi(t) { var d = new Date(t || Date.now()); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d; }
  function cleSemaine(t) { var d = lundi(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  // Semaines écoulées depuis le lundi 1er janvier 2024
  function numeroSemaine(t) { var d = lundi(t); return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2024, 0, 1)) / 604800000); }
  function defisDeLaSemaine(t) {
    var n = numeroSemaine(t);
    return [0, 1, 2].map(niv => { var l = DEFIS.filter(d => d.niv === niv); return l[((n * 5 + niv * 2) % l.length + l.length) % l.length]; });
  }
  function lireMaison() {
    var m = Object.assign({ blocs: ['salon'], cles: 0, piece: 'salon', etagere: [] }, lireV('compagnon-maison') || {});
    if (m.blocs.indexOf('salon') < 0) m.blocs.unshift('salon');
    return m;
  }
  function ecrireMaison(m) { ecrireV('compagnon-maison', m); }
  function trophees() { return lireV('compagnon-trophees') || []; }
  // Où en sont les défis de la semaine
  function etatDefis(t) {
    t = t || Date.now();
    var debut = lundi(t).getTime(), cle = cleSemaine(t);
    var evs = (lireV('compagnon-evenements') || []).filter(e => e.h >= debut);
    var st = lireV('compagnon-defis');
    if (!st || st.semaine !== cle) st = { semaine: cle, reussis: {}, bonus: false };
    var defis = defisDeLaSemaine(t).map(d => ({ id: d.id, niv: d.niv, ico: d.ico, titre: d.titre, but: d.but,
      n: Math.min(d.but, d.compte(evs)), fait: !!st.reussis[d.id], niveau: NIVEAUX_DEFI[d.niv] }));
    defis.forEach(d => { if (d.fait) d.n = d.but; });
    return { semaine: cle, fin: debut + 7 * 86400000, defis: defis, bonus: !!st.bonus, st: st };
  }
  // Valide les défis atteints (ou celui qu'on force, pour les essais) ; annonce : petite bulle de victoire
  function verifierDefis(annonce, forcer) {
    if (!lireV('compagnon-animal')) return [];
    var e = etatDefis(), st = e.st, nouveaux = [];
    e.defis.forEach(d => { if (!st.reussis[d.id] && (d.n >= d.but || forcer === d.id)) { st.reussis[d.id] = Date.now(); nouveaux.push(d); } });
    if (!nouveaux.length) return [];
    var tr = trophees(), m = lireMaison(), t = Date.now();
    nouveaux.forEach(d => {
      var k = e.semaine + ':' + d.id;
      tr.push({ k: k, id: d.id, niv: d.niv, ico: d.ico, titre: d.titre, h: t });
      if (m.etagere.length < ETAGERE_MAX) m.etagere.push(k);
      if (typeof Etoiles !== 'undefined') Etoiles.ajouter(d.niveau.etoiles, 'Défi réussi : ' + d.titre, true);
    });
    var salle = false, cle = false;
    if (m.blocs.indexOf('trophees') < 0) { m.blocs.push('trophees'); salle = true; }
    if (!st.bonus && e.defis.every(d => st.reussis[d.id])) { st.bonus = true; m.cles = (m.cles || 0) + 1; cle = true; }
    ecrireV('compagnon-defis', st); ecrireV('compagnon-trophees', tr); ecrireMaison(m);
    try { window.dispatchEvent(new CustomEvent('cp-defis', { detail: nouveaux })); } catch (e) {}   // la page du compagnon se met à jour
    if (annonce && typeof Etoiles !== 'undefined') {
      var a = [];
      nouveaux.forEach(d => a.push(['🏆 Défi réussi ! +' + d.niveau.etoiles + ' ⭐', d.niveau.coupe + ' · ' + d.titre]));
      if (salle) a.push(['🏆 Nouvelle pièce : la salle des trophées', 'Va voir ta coupe chez ton compagnon']);
      if (cle) a.push(['🗝️ Ta maison peut s\'agrandir !', 'Les trois défis de la semaine sont réussis']);
      a.forEach((x, i) => setTimeout(() => Etoiles.bulle(x[0], x[1]), i * 3400));
    }
    return nouveaux;
  }
  // Une coupe en SVG (viewBox 0 0 60 72) : métal du niveau, emblème du défi ; eteint : pas encore gagnée
  function coupe(niv, ico, eteint) {
    var c = eteint ? ['#eef1f3', '#d3dae0', '#aab4bd'] : NIVEAUX_DEFI[niv].couleurs, id = 'cp-m-' + (eteint ? 'gris' : NIVEAUX_DEFI[niv].id);
    var f = 'url(#' + id + ')';
    return '<defs><linearGradient id="' + id + '" x1="0" x2="1" y1="0" y2="0.3"><stop offset="0" stop-color="' + c[2] + '"/><stop offset="0.3" stop-color="' + c[0] + '"/>' +
      '<stop offset="0.55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></linearGradient></defs>' +
      '<path d="M15 12 Q3 12 5 24 Q7 34 19 37" stroke="' + f + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M45 12 Q57 12 55 24 Q53 34 41 37" stroke="' + f + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M12 7 H48 Q49 36 30 43 Q11 36 12 7Z" fill="' + f + '"/>' +
      '<ellipse cx="30" cy="7" rx="18" ry="3.6" fill="' + c[0] + '"/><ellipse cx="30" cy="7.6" rx="14.5" ry="2.2" fill="' + c[2] + '" opacity="0.45"/>' +
      '<rect x="26.5" y="42" width="7" height="9" fill="' + f + '"/><path d="M19 51 H41 L44 59 H16Z" fill="' + f + '"/>' +
      '<rect x="12" y="59" width="36" height="10" rx="2.5" fill="' + (eteint ? '#c5cdd4' : '#5a3a26') + '"/>' +
      '<rect x="20" y="62" width="20" height="4" rx="1" fill="' + (eteint ? '#e3e8ec' : c[1]) + '" opacity="0.85"/>' +
      '<circle cx="30" cy="21" r="9.5" fill="#fff" opacity="' + (eteint ? 0.6 : 0.5) + '"/>' +
      '<text x="30" y="25.2" font-size="11.5" text-anchor="middle"' + (eteint ? ' opacity="0.35"' : '') + '>' + ico + '</text>' +
      (eteint ? '' : '<path d="M17 11 Q18 28 25 37" stroke="#fff" stroke-width="2.2" fill="none" opacity="0.55" stroke-linecap="round"/>');
  }


  // ---------- Une langue pour le compagnon (réglée sur chaque téléphone) ----------
  // Il dit ses phrases de tous les jours dans sa langue (la traduction française reste écrite en petit dessous).
  // Les phrases qu'il ne connaît pas encore restent en français : il pourra en apprendre d'autres petit à petit.
  var LANGUES = {
    en: { nom: 'Anglais', ico: '🇬🇧', voix: 'en-GB', adj: 'anglais' },
    es: { nom: 'Espagnol', ico: '🇪🇸', voix: 'es-ES', adj: 'espagnol' },
    de: { nom: 'Allemand', ico: '🇩🇪', voix: 'de-DE', adj: 'allemand' },
    it: { nom: 'Italien', ico: '🇮🇹', voix: 'it-IT', adj: 'italien' }
  };
  // {n} : un nom (le sien, celui d'un ami)
  var TRADUCTIONS = [
    { fr: "Un ami m'a fait un câlin ! 🥰", en: "A friend gave me a hug! 🥰", es: "¡Un amigo me ha dado un abrazo! 🥰", de: "Ein Freund hat mich umarmt! 🥰", it: "Un amico mi ha abbracciato! 🥰" },
    { fr: "Bonjour ! Je m'appelle {n} 🥰", en: "Hello! My name is {n} 🥰", es: "¡Hola! Me llamo {n} 🥰", de: "Hallo! Ich heiße {n} 🥰", it: "Ciao! Mi chiamo {n} 🥰" },
    { fr: "Chut… je dors 😴", en: "Shh… I'm sleeping 😴", es: "Shh… estoy durmiendo 😴", de: "Pst… ich schlafe 😴", it: "Shh… sto dormendo 😴" },
    { fr: "Encore un câlin ? Avec plaisir !", en: "Another hug? With pleasure!", es: "¿Otro abrazo? ¡Con mucho gusto!", de: "Noch eine Umarmung? Sehr gern!", it: "Un altro abbraccio? Con piacere!" },
    { fr: "Merci, ça va très bien pour l'instant 😊", en: "Thanks, I'm doing fine for now 😊", es: "Gracias, por ahora estoy muy bien 😊", de: "Danke, mir geht's gerade sehr gut 😊", it: "Grazie, per ora sto benissimo 😊" },
    { fr: "Miam, merci ! 😋", en: "Yum, thank you! 😋", es: "¡Ñam, gracias! 😋", de: "Mmh, danke! 😋", it: "Gnam, grazie! 😋" },
    { fr: "Glou glou… 💧", en: "Gulp gulp… 💧", es: "Glu glu… 💧", de: "Gluck gluck… 💧", it: "Glu glu… 💧" },
    { fr: "Tout propre ! ✨", en: "All clean! ✨", es: "¡Bien limpio! ✨", de: "Ganz sauber! ✨", it: "Tutto pulito! ✨" },
    { fr: "Je t'aime 💛", en: "I love you 💛", es: "Te quiero 💛", de: "Ich hab dich lieb 💛", it: "Ti voglio bene 💛" },
    { fr: "J'ai un petit creux…", en: "I'm a little hungry…", es: "Tengo un poco de hambre…", de: "Ich habe ein bisschen Hunger…", it: "Ho un certo languorino…" },
    { fr: "J'ai soif !", en: "I'm thirsty!", es: "¡Tengo sed!", de: "Ich habe Durst!", it: "Ho sete!" },
    { fr: "Un petit bain ?", en: "A little bath?", es: "¿Un bañito?", de: "Ein kleines Bad?", it: "Un bagnetto?" },
    { fr: "Tu m'as manqué !", en: "I missed you!", es: "¡Te he echado de menos!", de: "Ich habe dich vermisst!", it: "Mi sei mancato!" },
    { fr: "Bonne nuit 🌙", en: "Good night 🌙", es: "Buenas noches 🌙", de: "Gute Nacht 🌙", it: "Buonanotte 🌙" },
    { fr: "Coucou ! 👋", en: "Hi! 👋", es: "¡Hola! 👋", de: "Hallo! 👋", it: "Ciao! 👋" },
    { fr: "Merci pour la balade ! 🧭", en: "Thanks for the walk! 🧭", es: "¡Gracias por el paseo! 🧭", de: "Danke für den Ausflug! 🧭", it: "Grazie per la passeggiata! 🧭" },
    { fr: "Merci pour ce cadeau ! 🥰", en: "Thank you for this present! 🥰", es: "¡Gracias por este regalo! 🥰", de: "Danke für das Geschenk! 🥰", it: "Grazie per questo regalo! 🥰" },
    { fr: "Merci pour ce bel accessoire ! 🥰", en: "Thank you for this lovely accessory! 🥰", es: "¡Gracias por este accesorio tan bonito! 🥰", de: "Danke für das schöne Accessoire! 🥰", it: "Grazie per questo bell'accessorio! 🥰" },
    { fr: "Un régal ! 😋", en: "A real treat! 😋", es: "¡Una delicia! 😋", de: "Ein Genuss! 😋", it: "Una delizia! 😋" },
    { fr: "Je vais voir ma gamelle 🥣", en: "I'm going to check my bowl 🥣", es: "Voy a mirar mi cuenco 🥣", de: "Ich schaue nach meinem Napf 🥣", it: "Vado a vedere la mia ciotola 🥣" },
    { fr: "Bienvenue chez {n} ! 👋", en: "Welcome to {n}'s home! 👋", es: "¡Bienvenido a casa de {n}! 👋", de: "Willkommen bei {n}! 👋", it: "Benvenuto a casa di {n}! 👋" },
    { fr: "Merci, encore un petit moment 😊", en: "Thanks, just a moment more 😊", es: "Gracias, un momentito más 😊", de: "Danke, noch einen kleinen Moment 😊", it: "Grazie, ancora un momentino 😊" },
    { fr: "Merci pour le câlin ! 🥰", en: "Thanks for the hug! 🥰", es: "¡Gracias por el abrazo! 🥰", de: "Danke für die Umarmung! 🥰", it: "Grazie per l'abbraccio! 🥰" },
    { fr: "Me voilà ! 🐾", en: "Here I am! 🐾", es: "¡Aquí estoy! 🐾", de: "Da bin ich! 🐾", it: "Eccomi! 🐾" },
    { fr: "Elles brillent, nos coupes ! ✨", en: "Our cups are shining! ✨", es: "¡Cómo brillan nuestras copas! ✨", de: "Unsere Pokale glänzen! ✨", it: "Come brillano le nostre coppe! ✨" },
    { fr: "Youpi, dehors ! 🌼", en: "Yippee, outside! 🌼", es: "¡Yupi, afuera! 🌼", de: "Juhu, nach draußen! 🌼", it: "Evviva, fuori! 🌼" },
    { fr: "Une petite sieste ? 😌", en: "A little nap? 😌", es: "¿Una siestecita? 😌", de: "Ein kleines Nickerchen? 😌", it: "Un pisolino? 😌" },
    { fr: "Ça sent bon par ici ! 😋", en: "It smells good in here! 😋", es: "¡Qué bien huele aquí! 😋", de: "Hier riecht es lecker! 😋", it: "Che buon profumo qui! 😋" },
    { fr: "On fait une partie ? 🎲", en: "Shall we play a game? 🎲", es: "¿Jugamos una partida? 🎲", de: "Spielen wir eine Runde? 🎲", it: "Facciamo una partita? 🎲" },
    { fr: "Oh ! Une nouvelle pièce ! 🤩", en: "Oh! A new room! 🤩", es: "¡Oh! ¡Una habitación nueva! 🤩", de: "Oh! Ein neues Zimmer! 🤩", it: "Oh! Una stanza nuova! 🤩" },
    { fr: "Bravo ! Une nouvelle coupe 🏆", en: "Well done! A new cup 🏆", es: "¡Bravo! Una copa nueva 🏆", de: "Bravo! Ein neuer Pokal 🏆", it: "Bravo! Una nuova coppa 🏆" },
    { fr: "Je suis aux anges ! 🥰", en: "I'm over the moon! 🥰", es: "¡Estoy en las nubes! 🥰", de: "Ich bin im siebten Himmel! 🥰", it: "Sono al settimo cielo! 🥰" },
    { fr: "Une petite sieste à l'ombre… 😌", en: "A little nap in the shade… 😌", es: "Una siestecita a la sombra… 😌", de: "Ein Nickerchen im Schatten… 😌", it: "Un pisolino all'ombra… 😌" },
    { fr: "Une petite sieste… 😴", en: "A little nap… 😴", es: "Una siestecita… 😴", de: "Ein kleines Nickerchen… 😴", it: "Un pisolino… 😴" },
    { fr: "À moi la balle ! ⚽", en: "My ball! ⚽", es: "¡La pelota es mía! ⚽", de: "Der Ball gehört mir! ⚽", it: "La palla è mia! ⚽" },
    { fr: "Mon doudou 🥰", en: "My cuddly toy 🥰", es: "Mi peluche 🥰", de: "Mein Kuscheltier 🥰", it: "Il mio pupazzo 🥰" },
    { fr: "Hmm, ça sent bon !", en: "Mmm, that smells nice!", es: "¡Mmm, qué bien huele!", de: "Mmh, das riecht gut!", it: "Mmm, che buon profumo!" },
    { fr: "Que d'étoiles ce soir ✨", en: "So many stars tonight ✨", es: "Cuántas estrellas esta noche ✨", de: "So viele Sterne heute Abend ✨", it: "Quante stelle stasera ✨" },
    { fr: "Oh, il neige ! ❄️", en: "Oh, it's snowing! ❄️", es: "¡Oh, está nevando! ❄️", de: "Oh, es schneit! ❄️", it: "Oh, nevica! ❄️" },
    { fr: "Il fait beau dehors ☀️", en: "It's sunny outside ☀️", es: "Hace sol afuera ☀️", de: "Draußen ist schönes Wetter ☀️", it: "Fuori c'è il sole ☀️" },
    { fr: "C'est la fête ! 🎉", en: "It's party time! 🎉", es: "¡Es una fiesta! 🎉", de: "Es wird gefeiert! 🎉", it: "È festa! 🎉" },
    { fr: "Nos belles coupes ! 🏆", en: "Our beautiful cups! 🏆", es: "¡Nuestras bonitas copas! 🏆", de: "Unsere schönen Pokale! 🏆", it: "Le nostre belle coppe! 🏆" },
    { fr: "Ma gamelle est vide… 🥺", en: "My bowl is empty… 🥺", es: "Mi cuenco está vacío… 🥺", de: "Mein Napf ist leer… 🥺", it: "La mia ciotola è vuota… 🥺" },
    { fr: "Un peu d'eau fraîche ? 💧", en: "A little fresh water? 💧", es: "¿Un poco de agua fresca? 💧", de: "Ein bisschen frisches Wasser? 💧", it: "Un po' d'acqua fresca? 💧" },
    { fr: "Il reste des miettes !", en: "There are crumbs left!", es: "¡Quedan migas!", de: "Da sind noch Krümel!", it: "Ci sono ancora briciole!" },
    { fr: "Il y a du bon là-dedans ? 🧀", en: "Anything tasty in there? 🧀", es: "¿Hay algo rico ahí dentro? 🧀", de: "Ist da was Leckeres drin? 🧀", it: "C'è qualcosa di buono lì dentro? 🧀" },
    { fr: "Un papillon ! 🦋", en: "A butterfly! 🦋", es: "¡Una mariposa! 🦋", de: "Ein Schmetterling! 🦋", it: "Una farfalla! 🦋" }
  ];
  var MODELES = TRADUCTIONS.map(function (p) {
    var morceaux = p.fr.split('{n}').map(function (m) { return m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    return { re: new RegExp('^' + morceaux.join('(.+?)') + '$'), p: p };
  });
  // Sa phrase dans sa langue, ou null s'il ne la connaît pas encore
  function traduire(texte, langue) {
    if (!texte || !langue || !LANGUES[langue]) return null;
    for (var k = 0; k < MODELES.length; k++) {
      var m = MODELES[k].re.exec(texte);
      if (m) return MODELES[k].p[langue].replace('{n}', m[1] || '');
    }
    return null;
  }
  // Dire la phrase avec la voix du téléphone dans la bonne langue (si elle existe)
  function direEnLangue(texte, langue) {
    try {
      if (!('speechSynthesis' in window)) return false;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(texte), code = LANGUES[langue].voix;
      u.lang = code; u.rate = 0.9;
      var v = speechSynthesis.getVoices().find(function (x) { return x.lang && x.lang.replace('_', '-').toLowerCase().indexOf(langue) === 0; });
      if (v) u.voice = v;
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  return { ESPECES: ESPECES, LANGUES: LANGUES, TRADUCTIONS: TRADUCTIONS, traduire: traduire, direEnLangue: direEnLangue, demarrerVeille: demarrerVeille, regler: regler, surveiller: surveiller, jaugesVides: jaugesVides, verifierVeille: verifierVeille, reglagesMessages: reglagesMessages, BESOINS: BESOINS, RECOMPENSE_JOUR: RECOMPENSE_JOUR, RECOMPENSE_SEMAINE: RECOMPENSE_SEMAINE, RAYONS: RAYONS, ARTICLES: ARTICLES,
           FETES: FETES, guirlande: guirlande, feteDu: feteDu, prochaineFete: prochaineFete, coeur: coeur,
           niveaux: niveaux, humeur: humeur, signes: signes, age: age, estNuit: estNuit, dessin: dessin, art: art,
           NIVEAUX_DEFI: NIVEAUX_DEFI, DEFIS: DEFIS, BLOCS: BLOCS, ETAGERE_MAX: ETAGERE_MAX, etatDefis: etatDefis, verifierDefis: verifierDefis,
           lireMaison: lireMaison, ecrireMaison: ecrireMaison, trophees: trophees, coupe: coupe, defisDeLaSemaine: defisDeLaSemaine };
})();
