# Désdale, détail : 7 piliers

> Note de travail pour Claude, sortie de CLAUDE.md le 22 novembre 2026. Elle fait foi pour ce chantier : la lire en entier avant d'y toucher, et y consigner le détail de chaque nouvelle version.

### 7 piliers, ex « Les 7 joyaux » (version maison du draft de cartes et de cités, 2.51 ; renommé en 2.69)
- Nom choisi par l'utilisateur. Ils sont **souvent 2, parfois 4** : il faut 3 cités au moins, donc des 🤖 complètent la table
  (salle d'attente : l'hôte règle le nombre d'ordinateurs, 2 par défaut, un de moins à chaque ami qui arrive tant qu'on reste à 3 ; solo : 2 à 6 ordinateurs).
  Cités placées au hasard autour de la table. Ordinateurs : `ORDIS`, ils choisissent dès le début du tour (`jouerRobots`), sur le téléphone de l'hôte.
- **Règles exactes du jeu de base d'origine, 1re édition 2010** (2.82, demandé par l'utilisateur : « les règles, cartes et merveilles exactes, pour s'assurer que c'est équilibré » ;
  cercle privé ; pas les visuels). Cartes avec les **noms de la boîte** (Chantier, Cavité, Bassin argileux… Guilde des travailleurs…), coûts, effets, chaînages et nombre
  d'exemplaires par nombre de joueurs du jeu d'origine ; **identifiants internes gardés** (`coupe`, `carriere`… pour les sauvegardes). **Valeurs reprises de mémoire :
  à vérifier avec la boîte de l'utilisateur.** Merveilles **faces A et B** (`JOYAUX[clé].A / .B`, `ville`) : l'hôte (salle d'attente, message `FACES`, `pubHote.faces`)
  ou le joueur seul (`joyaux-faces`) choisit **A, B ou Au hasard** (chaque cité tire sa face) ; `SJ.nouvellePartie(joueurs, h, { faces })`, `cite.face` (absente = A).
  `SJ.etapesDe(cite)` / `SJ.faites(cite)` partout (Gizeh B : 4 étapes, Rhodes B : 2). Pouvoirs : **Mausolée** (construire gratuitement une carte de la défausse :
  phase `'pouvoir'`, `e.attente = [{ type: 'mausolee', j }]`, `SJ.pouvoir(e, j, id | null)`, message `POUVOIR`, fenêtre « Ton Mausolée », `SJ.ordinateurDefausse` pour les 🤖
  et les absents), **Babylone B** (jouer la 7e carte : `e.seuls` = les seuls participants, `SJ.participants`, « 7e carte » dans la barre), **Olympie** (A : 1 carte gratuite par âge ;
  B : matières à 1 🪙 chez les deux voisins, copier une guilde voisine au décompte), gains combinés (Rhodes B, Éphèse B) dessinés côte à côte (`DV.gainEtape`).
  `e.coupsDe = { age, tour }` (7 = 7e carte) pour le bandeau « ce qu'ils ont joué ». Simulation Node : 1 800 parties (3 à 7, faces A / B / hasard), toutes finies.
  Avant 2.82, règles maison (noms et valeurs inventés) : 3 âges, 7 cartes chacun, **tout le monde choisit en même temps** une carte (construire,
  étape suivante de son **joyau**, ou vendre 3 🪙), puis passe sa main (à gauche aux âges I et III, à droite à l'âge II) ; 6 cartes jouées, la 7e défaussée.
  3 🪙 au départ. Ressources 🪵🪨🧱⛏️ (marron) et 🔮🧵📜 (grises), le joyau en produit une dès le départ ; achat aux deux voisins 2 🪙 (1 avec comptoir / marché),
  **le jeu choisit tout seul le paiement le moins cher** (`SJ.payer`, recherche exhaustive). Chaînes : carte gratuite si l'on a une carte précise (`chaine`).
  Pas deux fois la même carte (même nom). Conflits en fin d'âge contre chaque voisin : +1/+3/+5 ou −1. Savoir : carrés + 7 par série. 1 pt pour 3 🪙.
- Cartes (`LISTE`, `n` = à partir de combien de joueurs chaque exemplaire entre) : 7 × joueurs par âge (vérifié de 3 à 7), âge III = cartes + (joueurs + 2) guildes tirées
  parmi 10. 7 **merveilles** à 3 étapes : 3 pts / pouvoir / 7 pts (2.70, harmonisé avec « 7 piliers » : ex « joyaux » maison Saphir, Rubis… ; affichées sous les noms des sept merveilles de l'Antiquité : Phare d'Alexandrie, Colosse de Rhodes, Temple d'Artémis, Grande Pyramide, Mausolée d'Halicarnasse, Jardins de Babylone, Statue de Zeus ; **clés internes inchangées** : `JOYAUX`, `cite.joyau`, action `'joyau'`, `saphir`… pour les sauvegardes). Onglet Jouer vide : le phare dessiné (`iconeJeu`).
- Ordinateur (`SJ.ordinateur`) : estime chaque coup (points, ressources utiles selon l'âge, boucliers s'il est à la traîne, savoir, pièces), un peu de hasard.
  Testé en Node : 300 parties de 3 à 7 joueurs (~45 points en moyenne). Joueur absent en salon : l'hôte peut « jouer à sa place » (un coup de l'ordinateur).
- Écran (360 px) : barre (âge, tour, sens, 🪙, 🛡️, points du moment), joueurs (✓ = a choisi, dernier coup, ◀ ▶ = mes voisins ; toucher = voir sa cité).
  **Modernisé comme le Duel** (2.76, demandé par l'utilisateur : « coller aux évolutions de Duel ») :
  **ma merveille en carte large** (`DV.plateau(clé, { faites, suivante })` dans `joyaux-visuels.js`, ~toute la largeur, hauteur en proportion, fond doré + silhouette du monument
  (`MONU_C` : clé classique → monument du Duel)) : ressource produite dès le départ (pastille « produit dès le départ »), nom, avancement N/3, puis les **3 étapes**
  côte à côte (coût en pastilles → gain en icône + légende en clair : « 3 points », « 2 boucliers », « +9 pièces », « 1 matière au choix, chaque tour », « 1 savoir au choix »,
  « matières à 1 🪙 chez mes voisins », « 1 carte gratuite par âge » ; `DV.gainEtape`) ; étape faite = coche verte et coût pâli, prochaine étape un peu éclairée.
  Toucher = ma cité (la fiche de cité montre la même carte). Ligne « ma cité » dessous : production et savoirs.
  **Ma main en cartes dessinées** (`DV.carteC(SJ.CARTES[id], 'main' | 'grand')`, `DV.effetC` : mêmes cartes que le Duel, effets du Classique en icônes,
  ◀ ▶ = voisins, ● = ma cité ; icônes Minerai `M` et Tissu `T` ajoutées à `R`), grille de 4 colonnes (`.main-cartes`, taille réglée sur la largeur),
  pastille d'état sous chaque carte (✓ / ✓ gratuit / N 🪙 à payer aux voisins / ✗). Coût de 5 ressources et plus : 3 colonnes plus petites (`dv-cout3`) ;
  nom plus petit quand un mot est long (`taillenom`, jamais coupé au milieu). Toucher une carte ouvre **une feuille qui monte du bas** (`carteSel`, fermable d'un glissement) :
  grande carte, texte clair (`texteCarte`), chaînage, Construire / Vendre / Construire gratuitement, et « la glisser sous ta merveille » avec l'étape dessinée (coût → gain).
  **2.77** (demandé par l'utilisateur) : dans chaque étape de la carte de merveille, **coût en haut à gauche sur 1/3 de la hauteur, un trait, gain sur 2/3** (plus de flèche ;
  numéro I/II/III en haut à droite, remplacé par la coche quand l'étape est faite). **Ligne « ma cité » retirée** (toucher la merveille ouvre ma cité).
  **Bandeau des joueurs vu de ma place** (`ordreTable` : voisins de gauche ◀ à gauche, moi au milieu, voisins de droite ▶ à droite ; plus de 3 joueurs : il défile, centré sur moi,
  `centrerJoueurs`) ; chaque joueur : pièces, boucliers, avancement de la merveille, **points** (`SJ.score`), **ce qu'il produit** en icônes (`prodHtml` : fixes avec nombre,
  au choix groupées, savoirs) et son dernier coup. Cartes de la main un peu plus petites (11,2 px). **Ce qu'ont joué les autres** à chaque révélation (`e.nTour` incrémenté par
  `SJ.resoudre`, `montrerTour`, `tourAff`) : bandeau en haut comme le Duel, une ligne par joueur (dans l'ordre de la table) avec l'image de la carte et un tampon Construite /
  Gratuite / Merveille (+ l'étape et son gain) / Vendue, les pièces payées aux voisins, et « Tes voisins t'ont acheté des ressources : +N » ; 2,6 s + 1,3 s par ligne (9 s au plus),
  toucher = fermer ; resserré au-delà de 3 lignes. **Achats détaillés** : `SJ.payer` rend aussi `ag` / `ad` (ressources achetées à gauche / à droite), la feuille de la carte affiche
  « ◀ Marius : 🧱 2 🪙 » (`paiementHtml`).
  **2.78 : la table + le volet** (demandé par l'utilisateur, pour dé-densifier) : plus de bandeau de petites fiches ; **une carte de merveille par joueur**
  (`DV.plateauJoueur(clé, { nom, pieces, boucliers, pts, prod, faites, moi, fait, absent })`, `.table-sj`) empilées **dans l'ordre de la table** (`ordreTable` : voisins de gauche ◀ au-dessus,
  **moi au milieu**, voisins de droite ▶ en dessous ; plus de 3 joueurs : la page défile et se centre sur moi, `centrerJoueurs`). Chaque carte : nom (◀ / ▶, ✓ vert = a choisi),
  nom de la merveille, pastille pièces / boucliers / points, **bande de production** (`prodHtml`, savoirs compris), puis les 3 étapes (faites = cochées).
  Toucher une carte = la cité de ce joueur. Barre du haut : âge, tour et sens de passage en clair (« ◀ la main passe à gauche »). **Ma main dans un volet fixé en bas**
  (`.volet-sj`, `voletOuvert`) : en-tête (« À toi : choisis une carte » / « ✓ … » + Changer, chevron) qu'on touche ou qu'on glisse (`voletDebut` / `voletFin`) pour réduire / ouvrir ;
  il remonte tout seul à chaque nouveau tour (`aMoiDeChoisir`) et se réduit après mon choix. Bulle 💬 : **`SalonGlobal.reserverBas(px)`** (nouveau, commun) garde la bulle
  au-dessus d'une bande réservée en bas ; la page la tient à jour (`cleVolet` → `majReserve` ; pas `updated` : le contenu des onglets est rendu par `<fiche-jeu>`).
  **2.79** (demandé par l'utilisateur : « que le max de joueurs tienne sur la hauteur ») : **plus de 3 joueurs = cartes basses** (`tableCompacte`, `DV.plateauJoueur(…, { compact: true })`,
  `.dv-plc`, toute la largeur, 7,05em de haut) : nom + merveille + pastille sur une ligne, bande de production, étapes **coût | gain côte à côte** (trait vertical, sans légende ;
  la légende reste sur la carte de la fiche de cité). Taille réglée sur la hauteur de l'écran (`styleTable` → `--tc`, `hEcran` : écran − onglets − barre − volet réduit, partagé
  entre les joueurs, 9,5 à 14 px) : 7 joueurs tiennent entre la barre et le volet réduit sur 360 × 800. 3 joueurs : grandes cartes comme en 2.78.
  **2.80** : la marge sous la table (`.sous-volet`) suit la **hauteur réelle du volet** (`voletH`, mesurée dans `majReserve`) : volet ouvert, on fait défiler la table
  jusqu'à voir la dernière merveille au-dessus (demandé par l'utilisateur : « ça bloque trop tôt »).
  **2.81** (demandé par l'utilisateur) : **ma carte en bleu acier** (`.dv-plj-moi` : même dessin, dégradé #9dc0e3 → #4f79a6, grandes et petites cartes) pour me repérer ;
  en-tête des cartes de la table sur une ligne en grille `nom | merveille centrée | pièces · boucliers · points` (`.dv-plj-tete`, nom de la merveille centré sur la carte).
  Bandeau « ce qu'ils ont joué » : il manquait après le **1er tour** de chaque partie (pas de `e.nTour` précédent) ; corrigé.
  Plus tard (proposé) : les cartes de la fiche de cité en petites cartes dessinées, comme dans le Duel.
  Choix fait : bandeau « ✓ … · On attend … » avec « Changer » (jusqu'à la révélation, 0,7 s après le dernier choix). Fenêtre des conflits à chaque fin d'âge,
  tableau du décompte à la fin. Hôte disparu : retour à la salle d'attente (les mains étaient chez lui). Étoiles : `finDePartie('Les 7 joyaux')` (« entre amis »
  seulement à 2 humains et plus), série de victoires solo `Etoiles.serie('joyaux')`.
- **Version Duel** (demandée par l'utilisateur, puis **refaite en 2.53 aux règles exactes du jeu d'origine** à sa demande : « reprendre les règles exactes et des visuels
  qui rappellent l'original », appli privée entre amis) : choix **⚔️ Duel / 🏛️ Classique** (Duel d'abord et **par défaut**, 2.60) **en haut de l'onglet Partie, commun au salon et au solo**
  (`modeChoisi`, `joyaux-version` ; duel seul = contre 1 🤖) : le salon s'ouvre dans cette version (`pubHote.mode`), l'hôte peut encore la changer dans la salle d'attente
  (message `MODE`, repris dans son `modeChoisi`) ; les 2 premiers présents jouent, un 🤖 si l'on est seul, les autres regardent.
  Moteur `SD` (`joyaux/joyaux-duel.js`, `VERSION_REGLES = 2`, `SD.compatible` : un duel solo de l'ancienne version est oublié) :
  - Cartes d'origine sous des noms français génériques (`LISTE` : 23 / 23 / 20 cartes + 7 guildes, `[id, nom, âge, type, coût, effet, chaîne]`), chaînages, 12 merveilles
    (`MERVEILLES` : Voie Appienne, Circus Maximus, Colosse, Grande Bibliothèque, Phare, Jardins suspendus, Mausolée, Pirée, Pyramides, Sphinx, Statue de Zeus, Temple d'Artémis),
    10 jetons Progrès (`PROGRES`). Valeurs reconstruites de mémoire : à vérifier avec la boîte de l'utilisateur (liste donnée en 2.53).
  - Choix des merveilles (`phase: 'merveilles'`) : 8 tirées, montrées par 4, ordre 1-2-1 puis inverse (`ORDRE_CHOIX`). 7 🪙 chacun. Chacun son tour.
  - Pyramides (`FORMES`), une rangée sur deux face cachée, carte **dégagée** seulement ; cartes cachées non envoyées (`SD.vuePour`).
  - Construire (ou gratuit par chaînage), défausser (2 🪙 + 1 par carte jaune), ou construire une merveille avec la carte ; **7 merveilles au plus** (la 8e est retirée).
    Merveilles « Rejouer » (`e.rejoue`), Bibliothèque (3 jetons de la boîte, `phase: 'bibliotheque'`), Mausolée (carte de la défausse), destruction d'une carte marron / grise adverse.
  - Commerce : 2 🪙 + 1 par exemplaire produit par l'adversaire (cartes marron et grises) ; dépôts à 1 🪙 ; paiement le moins cher (`SD.payer`).
  - Piste militaire (pillages 2 et 5 🪙, suprématie militaire), 7 symboles (paire = jeton Progrès au choix, six différents = suprématie scientifique).
    Âge suivant : le plus faible militairement choisit qui commence (`phase: 'debut'`). File d'attentes `e.attentes`, `SD.qui(e)`.
  - Décompte civil (`LIGNES_DUEL` : civils, science, commerce, guildes, merveilles, Progrès, pièces, militaire ; égalité : bâtiments civils).
  - Ordinateur `SD.ordinateur`. Testé en Node (500 parties : 88 % civiles, 8 % militaires, 5 % science), solo et salon à deux en navigateur, rechargement en pleine partie.
  - **Visuels** (`joyaux/joyaux-visuels.js`, `DV`, dessinés par le code, aucune illustration officielle) : cartes à la couleur du type, bandeau d'effet en icônes, coût en colonne,
    silhouette du bâtiment, nom ; dos d'âge (I, II, III) ; merveilles dorées avec la silhouette du monument ; jetons Progrès ronds verts ; piste militaire avec capitales
    et butins. **Coûts lisibles** (2.54-2.55, demandé par l'utilisateur) : chaque ressource sur une grande pastille claire (1,75em), les identiques regroupées avec un « ×2 »,
    sur deux colonnes dès 2 pastilles ; icônes à contour sombre ; icônes d'effet plus grandes quand il y en a peu. Merveilles agrandies (2.61) : `dv-mchoix` 11,5 px
    (choix et feuille de la carte), `dv-mcite` 11,6 px (détail d'une cité), deux par ligne à 360 px. Cartes du volet cité agrandies (2.62) : `.cartes-cite .dv-carte.dv-mini` 9 px (5 par ligne).
    **Trois blocs blancs** (2.63-2.64, demandés par l'utilisateur) : joueur adverse, **plateau** (`.plateau-duel` : piste, jetons, statut, pyramide), moi ; séparés de 10 px,
    ombre douce, **ni bordure de couleur ni cadre vert** (l'utilisateur les trouve peu esthétiques ; la pastille « à toi ! » / « joue… » qui palpite suffit).
    Merveille construite = **coche verte en haut à droite** (`.dv-tampon`), plus de cadre vert nulle part (2.65). Plus de consigne « À toi : touche une carte… »
    (`statutDuel` vide quand c'est à moi ; il reste « X joue… », « Partie terminée »…). Pièces et points en **pilule** (padding latéral) pour les nombres à 2 chiffres.
    Bloc joueur : ligne 1 : nom en gros, pastille, pièces et points à droite ;
    ligne 2 : ressources (icônes 1,65em, nombre en gras), ressources au choix, symboles scientifiques ; ligne 3 : les merveilles en **vignettes**
    (`DV.merveille(id, { taille: 'zone' })` : seul le monument sur fond doré ; construite = dorée bordée de vert, à faire = pâle) et les jetons Progrès à droite.
    **Coup de l'adversaire montré** (2.71, demandé par l'utilisateur : « le temps de voir quelle carte a pris l'adversaire ») : `e.dernier` porte la place `k`, l'âge et un numéro `n` (`e.nCoups`) ;
    bandeau en haut de l'écran (`coupAdv`, `coupAdvAff`, file `filesCoups` de 2 au plus, 3,6 s avec barre qui se vide, toucher = fermer, au-dessus des fenêtres) : **toujours l'image de la carte prise avec un tampon** (2.72, demandé : « unifier avec l'image de la carte ») « Construite » vert, « Défaussée » orange + pièces gagnées (carte ternie), « Merveille » doré + vignette de la merveille glissée sous la carte ; à côté, son nom et « X construit / la défausse pour de l'argent / s'en sert pour une merveille » ;
    l'emplacement vide palpite en pointillés orange dans la pyramide (`fantomeDuel`). Pas pour mes propres coups ni pour l'état retrouvé au chargement (`_charge`). L'ordinateur attend que le bandeau soit fermé pour rejouer.
    **Fenêtre de fin** (`finDuel`, `finVue`) : qui gagne et pourquoi (suprématie militaire : le pion a atteint la capitale ; scientifique : les six symboles, dessinés ; aux points : « 62 contre 49 »
    et les deux lignes qui font la différence), tableau des points avec la colonne du gagnant surlignée, « Voir le plateau » / « Nouvelle partie » ; ouverte après le dernier bandeau, rouvrable par « Voir le résultat ».
    **Panneaux du bas fermables d'un glissement vers le bas** (2.59, demandé par l'utilisateur pour jouer à une main) : voiles marqués `data-fermable`
    (carte touchée, cité, conflits), petite poignée en haut ; à partir de 80 px (ou d'un geste vif), quand le panneau est remonté en haut, on « touche le voile »
    (`v.click()`, même effet que toucher à côté). Pas sur les choix obligatoires (merveilles, jetons, premier joueur). Écran : cité adverse en haut, piste, jetons, pyramide, ma cité en bas ; toucher une carte ouvre ses actions et la liste des merveilles ; toucher une cité ouvre le détail.
- Plus tard (proposé à l'utilisateur) : guildes et joyaux à deux faces, boss d'expédition.
