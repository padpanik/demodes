# Désdale, détail : règles des jeux (choix de l'utilisateur, à ne pas changer sans lui)

> Note de travail pour Claude, sortie de CLAUDE.md le 22 novembre 2026. Elle fait foi : la lire avant de toucher à ce qu'elle décrit, et y consigner le détail de chaque nouvelle version.

## Règles des jeux (choix de l'utilisateur, à ne pas changer sans lui)

### Brilliant
- Règles du livret Ravensburger, 4 niveaux (fiches recopiées dans `NIVEAUX`). Le niveau est imposé par l'hôte (👑).
- Coups illégaux interdits. Variante solo : 44 lancers, cases Solo aux lancers 18, 24, 28, 32, 36, 40, 44
  (on voit les coups possibles, on barre un gain, puis on joue). Top 10 solo partagé par salon.
- Dés rouges quand aucun coup n'est possible ; cases jouables mises en évidence **sans délai**.
- Arrivée en cours de partie : salle d'attente (option « rejoindre automatiquement la suivante »).

### Yams (barème maison)
- 5 dés, 3 lancers, on garde les dés en les touchant. À plusieurs : chacun son tour, les autres voient en direct.
- Colonnes et coefficients, dans cet ordre : **Libre ×1, Descendante ×2, Montante ×3, Sèche ×4, Imposée ×5**.
  Sèche : seulement au 1er lancer (quand il ne reste que des cases en Sèche, pas de relance). Imposée : la case s'annonce **juste après le 1er lancer**, puis on peut relancer
  mais on doit s'y inscrire. L'annonce n'engage **qu'au 2e lancer** : sur le résultat du 1er, on peut encore changer
  d'annonce ou s'inscrire dans une autre colonne.
- Lignes, dans cet ordre : 1 à 6 ; puis **Full, Carré, Grande suite, Petite suite, Chance +, Chance −, Yams**.
- Bonus +35 si le haut d'une colonne atteint **61**. Pas de brelan.
- Full (3 + 2) : total des dés + 30. Carré : total + 20. Petite suite **1-2-3-4-5** : 45. Grande suite **2-3-4-5-6** : 50.
  Yams : total + 50. Chance + et Chance − : total des dés, la Chance − strictement inférieure à la Chance + de la
  même colonne, sinon la case inscrite en second vaut 0 (pas de contrainte si l'une des deux est barrée).
- Un Yams compte comme carré mais pas comme full (confirmé par l'utilisateur).
- **Abandonner** : seulement dans l'onglet Partie (`<abandon-solo>`, 3.74) ; la pastille en haut de l'écran de jeu ajoutée en 3.73 a été retirée en 3.76 (demandé par l'utilisateur).

### Backgammon
- À deux uniquement (un 3e est refusé), pas de solo. Règles courantes : videau, gammon ×2, backgammon ×3,
  scores cumulés entre les deux mêmes joueurs. Pas de matchs en N points ni de règle de Crawford.
- Obligation de jouer le plus de dés possible, sinon le plus fort ; tour passé automatiquement si aucun coup.

### Assaut
- Deux formats : **complet** (40 pièces : 10, 9, 8×2, 7×3, 6×4, 5×4, 4×4, 3×5, 2×8, 1, 6 bombes, drapeau)
  et **rapide** (10 pièces : 10, 9, 3×2, 2×2, 1, 2 bombes, drapeau), plateau 10×10 avec deux lacs.
- Numérotation : les règles utilisent toujours Maréchal 10 … Espion 1 ; option d'affichage par téléphone
  « ancienne » (Maréchal 1 … Éclaireur 9, Espion « E »). Règles courantes (éclaireur qui file, démineur, espion contre maréchal,
  pas plus de 3 allers-retours). Placement au hasard puis échanges, ou plateau vidé et pose pièce par pièce depuis une réserve (« Compléter » remplit
  le reste au hasard) ; 3 dispositions enregistrables par format.
- Option « garder à l'écran les pièces adverses révélées » : **désactivée par défaut** (retenir fait partie du jeu).
- Apparence des pièces (par téléphone) : Symboles (émojis), Chiffres, ou **Mes images** : le joueur choisit lui-même une image
  par grade (photo de ses propres pièces), gardée seulement dans `assaut-images` sur son téléphone. Ne jamais mettre
  d'illustrations officielles dans le dépôt. Couleur de ses pièces au choix (par téléphone) : bleu ou rouge,
  l'adversaire est affiché dans l'autre couleur.
- Solo contre l'ordinateur : il ne triche pas (il ne voit que ce qu'un joueur verrait).
- À deux : la composition de chaque joueur ne quitte jamais son téléphone (`assaut-prive`). L'état public relayé par l'hôte
  ne contient que les positions, les grades révélés et le journal des coups. Au départ, chacun envoie une empreinte
  SHA-256 (disposition + sel secret) ; en combat, l'attaquant annonce son grade et le téléphone du défenseur répond
  tout seul ; à la fin, chacun dévoile son armée et l'autre vérifie l'empreinte et rejoue tous les coups.
  L'hôte choisit le format ; les couleurs alternent à chaque partie (A, en bleu, commence).

### Bataille navale
- Mer 10 × 10 (A–J, 1–10), flotte : porte-avions 5, croiseur 4, contre-torpilleur 3, sous-marin 3, torpilleur 2.
  Annonces : à l'eau, touché, coulé (avec le nom du navire).
- Règles par défaut : navires séparés d'au moins une case (même en diagonale), un tir chacun son tour.
  Options de l'hôte (ou du joueur seul) : « les navires peuvent se toucher », « rejouer tant qu'on touche ».
- Placement **libre** : on part d'une mer vide, réserve de navires sous la mer, Hasard / Compléter, Vider.
  Toucher un navire de la réserve le pose **au milieu de la mer**, choisi, avec un bouton ↻ (pivoter) devant sa proue.
  On ne le déplace **qu'en le faisant glisser** au doigt ; toucher ailleurs tente de le valider et, si c'est bon, le
  désélectionne. Glisser un navire déjà validé le reprend. Pas de blocage pendant la pose, mais les navires qui se gênent
  (chevauchement, ou contact si interdit) sont **en rouge en permanence** ; « Prêt » vérifie toute la flotte. Pour tirer : toucher une case pour viser, la retoucher pour faire feu.
- Apparence (par téléphone, `bataille-style`) : **Réaliste** (navires d'acier vus du dessus, mer profonde avec reflets,
  brume sur la mer adverse, feu et fumée) ou **Jeu de société** (couleurs franches, contours nets, fiches blanches et rouges ;
  pas de rond rouge sur les navires, pour ne pas confondre avec un touché). La petite mer est alignée sur la grande.
  Navires dessinés en SVG par le code (`DESSINS`), une silhouette par type, proue à droite (en haut si vertical).
- Solo : l'ordinateur ne voit que ses propres tirs (comptage des placements possibles), niveaux Facile / Normal / Fort.
- À deux : la flotte ne quitte jamais le téléphone (`bataille-prive`) ; empreinte SHA-256 (flotte + sel) au départ,
  le téléphone visé répond seul à chaque tir, à la fin chacun dévoile sa flotte et l'autre vérifie l'empreinte et toutes les réponses
  (message affiché **seulement en cas d'incohérence**, comme dans Assaut). La musique de victoire attend la fin de la sirène du dernier coulé.
  La partie compte **tout de suite** pour le compagnon (`compterFin`), sans attendre la fin des sons (on peut quitter la page aussitôt).
  Le premier tireur alterne à chaque partie.

### Gribouille (dessiner et deviner, chacun pour soi)
- Nom maison (pas « Pictionary » ni « Dessinez c'est gagné »). À partir de 2 joueurs, pas de limite, pas de solo.
- Chacun son tour, le dessinateur choisit **un mot parmi 3** (15 s, sinon le 1er). **80 s** par défaut (l'hôte choisit 60, 80 ou 120 s),
  1 à 3 manches (chacun dessine une fois par manche ; un joueur qui arrive en cours de partie dessine aussi dans la manche).
- Environ 1 100 mots maison (`MOTS`, par thèmes). « œ » et « æ » comptent pour deux lettres dans l'indice (comme au clavier).
- Aux trois quarts du temps (avec la 2e lettre, pas avant, pour ne pas trop aider), ceux qui devinent voient si le mot est une **Action** ou un **Nom**.
  Les mots sont rangés par thème avec des repères `#Thème` dans la liste `MOTS` (`GB.categorie`, « Action » pour les verbes).
- Indices : nombre de lettres (« _ _ _ »), puis une lettre dévoilée à mi-temps, une 2e aux trois quarts (mots de 7 lettres et plus).
- Points selon l'ordre et la vitesse : 50 + 250 × temps restant, +50 au 1er, +25 au 2e ; le dessinateur +60 par joueur qui trouve.
  Le tour s'arrête quand tous ont trouvé ou à la fin du chrono. Propositions sans accents ni majuscules ; « Tout près ! »
  (une lettre d'écart, deux pour les longs mots) n'est montré qu'à celui qui l'a tapé ; les mauvaises propositions sont vues de tous.
- Réseau : l'hôte arbitre et garde le mot secret (envoyé seulement au dessinateur, jamais dans l'état public) ; les traits
  (millièmes de la largeur) sont relayés tout de suite aux autres et le dessin complet est renvoyé à qui arrive ou revient.
  Dessinateur absent plus de 10 s : tour suivant. Hôte disparu : un joueur rouvre le salon et le tour en cours est annulé.

### Petit bac (première version, pratiques les plus courantes)
- À partir de 2 joueurs, pas de solo. L'hôte choisit les catégories (3 à 12 parmi 24 ; par défaut Prénom, Pays, Ville, Animal,
  Fruit ou légume, Métier, Objet, Marque), le temps (60 s à 3 min, 2 min par défaut), 3, 5 ou 8 manches, et les lettres
  (sans K Q W X Y Z par défaut). Une lettre par manche, jamais deux fois la même dans une partie.
- L'article du début (« le », « la », « l' », « un »…) ne compte pas pour la lettre. « STOP ! » seulement avec une grille
  complète et juste ; les autres ont encore 3 s. Sinon fin au chrono.
- Pendant l'écriture, les réponses ne vont qu'à l'hôte (seul le nombre de cases remplies est public) ; chacune est aussi gardée
  sur son téléphone et renvoyée à la reconnexion (rien n'est perdu si l'hôte change).
- Vérification : une catégorie à la fois ; une réponse qui ne commence pas par la lettre est refusée d'office ; sinon elle est
  refusée si plus de la moitié des autres joueurs présents votent 👎. Points quand tous sont « prêts » (ou l'hôte décide).
- Points : 10 réponse unique, 5 réponse partagée (articles, accents et pluriel simple ignorés), 20 si seul à avoir une réponse
  valable dans la catégorie, 0 sinon.

### Agents secrets (version maison du jeu d'espions en mots)
- Nom maison, pas le nom ni les visuels de la marque. À partir de 4 joueurs : deux équipes (Rouges, Bleus) d'au moins 2,
  un chef par équipe. Chacun choisit son équipe et peut se proposer chef ; l'hôte peut tirer équipes et chefs au hasard.
- 25 mots (environ 480 mots maison à double sens, pas deux fois le même mot dans les 200 derniers), carte secrète :
  9 agents pour l'équipe qui commence (elle alterne à chaque partie), 8 pour l'autre, 7 passants, 1 assassin.
- Le chef donne **un mot + un nombre** (1 à 9 ou ∞) ; le mot ne doit pas être (ni contenir) un mot encore caché du plateau.
  Les coéquipiers touchent un mot pour le proposer (visible de tous), le retouchent pour le révéler ; nombre + 1 essais.
  Passant ou agent adverse : fin du tour ; assassin : défaite immédiate. « Fin du tour » possible après un essai.
- Réseau : l'hôte garde la carte (jamais dans l'état public avant la fin) et l'envoie aux deux chefs seulement ; chaque chef
  la garde sur son téléphone et la renvoie en se reconnectant (utile si un joueur reprend le salon). Chef absent : un coéquipier
  peut devenir chef en cours de partie. Un joueur sans équipe peut en rejoindre une en cours de partie (comme agent).

### Quatre en ligne
- Grille 7 × 6, jetons rouges (joueur 1) et jaunes (joueur 2) ; on touche une colonne, le jeton tombe. 4 alignés gagne, grille pleine = nul.
  Celui qui commence alterne à chaque partie ; victoires cumulées par pseudo.
- Solo : ordinateur Facile (gagne ou bloque parfois, sinon au hasard), Normal (minimax 4 coups), Fort (minimax 8 coups,
  élagage alpha-bêta, centre d'abord) ; « Annuler mon coup » possible en solo.
- Salon : les deux premiers présents jouent, les autres regardent ; un joueur parti laisse sa place (nouvelle partie).

### Dominos et Triominos
- **Dominos** (jeu « à la pioche », double-six, 28 pièces) : 7 chacun à deux, 6 à trois ou quatre. Le plus gros double commence
  (ensuite le gagnant de la manche précédente). Pas de pièce qui va : on pioche jusqu'à pouvoir jouer ; pioche vide : on passe.
  Dernier domino posé : on marque les points des mains adverses ; bloqué : le moins chargé marque ceux des autres. Partie en 50, 100 ou 150 points.
- **Triominos** (56 pièces, 0 à 5 dans les coins, sens horaire croissant ; on tourne, on ne retourne pas) : 9 chacun à deux, 7 à trois ou quatre.
  Pose contre au moins un côté, **tous les coins qui se touchent identiques**. Points = somme des chiffres ; hexagone complété +50 ;
  première pièce triple +10 (0-0-0 : +40). Sans coup : pioche −5 (3 au plus) puis passe −10. Fin : +25 + mains adverses ; bloqué : le moins
  chargé marque la différence. Partie en 200 ou 400 points. Pas de « pont » (règle trop rare, laissée de côté).
- Écran : dominos en chaîne qui se replie (doubles en travers) ; on touche une pièce verte puis « ici » au bout voulu (posée directement
  s'il n'y a qu'un bout possible). Triominos : plateau triangulaire SVG qui défile, emplacements possibles en jaune, aperçu, ↻ Tourner, ✓ Poser.
- Salon : l'hôte choisit le jeu et les points dans la salle d'attente et lance la partie (2 à 4, les suivants regardent). Joueur absent :
  l'hôte peut « jouer à sa place » (un coup de l'ordinateur). Hôte disparu : un joueur rouvre le salon, mais les mains étaient chez
  l'hôte, donc retour à la salle d'attente. Étoiles du compagnon à la fin de la **partie**.

### Chinchón
- **Choisi par l'utilisateur** : variantes en option de jeu (40 ou 48 cartes, sans joker ou 2 jokers ; `pubHote.opts`, réglées par l'hôte en salon) ; fermeture à **3 points ou moins** hors combinaisons ; **éliminé au-delà de 100 points**, le dernier en jeu gagne ; **chinchón** (7 cartes qui se suivent, même couleur, sans joker) = partie gagnée aussitôt ; solo et salon de 2 à 4.
- **Valeurs par défaut prises par Claude, à confirmer avec l'utilisateur si besoin** : figures 10 points, joker seul 25 ; fermer sans carte seule −10 ; les autres posent automatiquement leurs cartes seules sur les combinaisons de celui qui ferme (`bilanAutre`, au mieux) ; interdit de rejeter la carte qu'on vient de prendre à la défausse ; une combinaison garde au moins 2 vraies cartes ; l'as ne suit pas le roi ; à 40 cartes le 7 est suivi du valet. Pioche épuisée trois fois : manche nulle.
- Écran : main triable (Combinaisons, Couleur, Valeur ; barre de couleur sous les combinaisons), carte prise cerclée de bleu, cartes qui permettent de fermer cerclées de vert. Joueur absent : l'hôte peut jouer son tour. Hôte disparu : retour à la salle d'attente (les mains étaient chez lui). Ordinateur à un seul niveau (`CC.ordinateur`, il ne voit que sa main et la défausse). Testé en Node : 180 parties, toutes les variantes, 2 à 4 joueurs.

### Cieljo
- **Règles courantes du jeu d'origine, prises par Claude (3.10), à confirmer avec l'utilisateur** : 150 cartes (−2 ×5, −1 ×10, 0 ×15, 1 à 12 ×10) ; grille de 3 lignes × 4 colonnes, 2 cartes retournées au départ, le plus gros total commence la 1re manche, ensuite celui qui a fini la manche d'avant ; prendre la défausse oblige à échanger ; carte piochée échangée, ou jetée puis une carte cachée retournée ; 3 cartes visibles identiques dans une colonne partent à la défausse ; plus de carte cachée = un dernier tour pour les autres ; celui qui a fini double ses points s'ils sont positifs et qu'il n'a pas strictement le total le plus bas ; partie finie dès 100 points en fin de manche, le plus petit total gagne (égalité : plusieurs gagnants).
- **Colonne identique révélée au dévoilement final : retirée avant le calcul** (3.11, livret vérifié et confirmé par l'utilisateur). **Confirmé par l'utilisateur** : la carte tirée est visible de tous ; pose sans confirmation (toucher une case joue). **Choix de Claude, à confirmer** : pioche vide = défausse remélangée sauf son dessus.
- **Fin de manche en deux temps** (3.12, demandé par l'utilisateur : voir ce qui a été retourné avant le score) : d'abord « Manche N : tout est dévoilé » (`devoilement`, toutes les grilles, 2 colonnes, 3 au-delà de 4 joueurs ; cartes qui étaient cachées cerclées d'or et retournées une à une, colonne partie au dévoilement barrée, celui qui a fini sur fond doré ; données `resultat.details[j].reveles / avant / parties` du moteur), puis « Voir les scores → » (`finVue` = `cleFin`, propre à chaque téléphone) ; « ← Revoir les grilles dévoilées » sous les scores.
- Écran : grilles miniatures des autres (une ligne jusqu'à 4, deux au-delà), tapis pioche / défausse / carte en main, ma grille. Toucher la défausse après avoir pioché = jeter. Joueur absent : l'hôte peut jouer à sa place (`REMPLACER`, départ ou tour). Hôte disparu : retour à la salle d'attente. Ordinateur à un seul niveau (`CJ.ordinateur`, il ne voit pas les cartes cachées). Testé : 400 parties en Node de 2 à 8 joueurs ; navigateur : solo à 7 ordinateurs sans défilement à 360 × 800, salon à 2 + 1 ordinateur, rechargement, absent.

### Autres choix déjà tranchés
- Annonce vocale du tour : **seulement sur le téléphone du joueur concerné**, après 5 s sans lancer.
- Sons fabriqués par le code (pas de fichiers audio), sauf la Bataille navale : sons enregistrés **libres de droits**
  dans `bataille/sons/` (sources dans `bataille/sons/LICENCES.txt`), choisis par l'utilisateur : plouf (à l'eau), explosion (touché),
  et pour un coulé l'explosion **puis** la sirène. Sons fabriqués par le code en secours. Sons et vibrations réglables séparément.
