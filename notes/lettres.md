# Désdale, détail : Lettres croisées

> Note de travail pour Claude, sortie de CLAUDE.md le 22 novembre 2026. Elle fait foi pour ce chantier : la lire en entier avant d'y toucher, et y consigner le détail de chaque nouvelle version.

### Lettres croisées
- Nom maison (pas le nom de la marque). De 2 à 4 joueurs en salon, les suivants regardent ; ou seul contre 1 à 3 ordinateurs.
- Plateau 15 × 15, bonus classiques (L×2, L×3, M×2, M×3, centre M×2 avec l'étoile), 102 jetons à la répartition et aux valeurs
  françaises (2 jokers à 0). Chevalet de 7. Mots sur une ligne ou colonne, sans trou, touchant l'existant ; 1er mot sur l'étoile.
  Bonus seulement sous les lettres posées ce tour-ci ; 7 lettres d'un coup : +50. Échange possible s'il reste au moins 7 jetons ;
  passer. Fin : chevalet vidé sac vide (le joueur gagne les points restant chez les autres, qui les perdent), ou tout le monde passe
  deux fois de suite (chacun perd ce qui lui reste).
- Écran : toucher une lettre du chevalet puis une case ; toucher une lettre posée la reprend ; joker : choix de la lettre (A–Z).
  Aperçu en direct des mots et des points (ou de l'erreur). 🔀 = **ranger ses lettres** (1er appui : le chevalet s'encadre de bleu,
  les lettres frétillent, on les fait glisser ou on en touche deux pour les échanger ; plus de mélange au hasard (retiré à la demande) ; un seul bouton « ✓ Retour à la partie »
  ou 2e appui pour revenir ; le plateau ne pose rien pendant ce temps ; `rangement`, `debutRangement`). 🔍 grossit le plateau (il défile) ;
  **double toucher** sur une case : même effet, centré sur elle (le premier toucher est annulé, `poserOuReprendre` renvoie de quoi le défaire).
  On peut préparer son mot pendant le tour des autres (lettres reprises si la case est prise entre-temps).
  Loupe (bouton ou double toucher) : petite vibration en grossissant et en rétrécissant.
- **Une couleur par joueur** (`COULEURS`, dans l'ordre de la partie : orange, bleu, vert, violet) sur sa carte ; le **dernier mot de
  chacun** reste encadré et teinté de sa couleur (`e.derniers[joueur] = { cases du mot principal, n° du coup }`, le plus récent
  l'emporte sur une case partagée) ; les lettres du tout dernier coup brillent un peu plus ; « Dernier coup : … » dans sa couleur.
- Sous le score de chacun : ce qu'il a fait à son dernier tour (`e.actions[joueur]`) : son mot, ou « Passe », ou « Échange N ».
- **Définitions** : le dernier mot de chacun est écrit sous son score, et chaque mot de « Dernier coup » est un lien (`lienDef`)
  vers la recherche du **Wiktionnaire** (libre ; ses recherches retrouvent les accents et les formes conjuguées), dans un nouvel onglet.
- **Dictionnaire + vote** : l'hôte vérifie chaque mot formé dans `lettres-mots.txt`. Mot inconnu (la liste n'a pas tous les petits
  mots du jeu officiel, ex. QI, OK) : les autres joueurs présents votent 👍 / 👎 ; refusé si plus de la moitié dit 👎, sinon accepté
  (personne pour voter : accepté). Refusé : les lettres reviennent à leur place chez le joueur, qui rejoue. L'auteur peut reprendre ses lettres pendant le vote.
- Réseau : l'hôte arbitre et garde chevalets et sac ; chacun ne reçoit que son chevalet (`LC.vuePour`), tous révélés à la fin.
  Joueur du tour absent : l'hôte peut « passer son tour ». Hôte disparu : un joueur rouvre le salon, retour à la salle d'attente
  (comme les Dominos). L'hôte peut arrêter la partie depuis l'accueil du jeu. Étoiles du compagnon à la fin de la partie.
- **Ordinateurs dans un salon** : dans la salle d'attente, l'hôte ajoute ou retire des 🤖 (4 joueurs au plus, les humains passent
  avant) et choisit leur niveau (le même pour tous, `pubHote.robots` / `pubHote.niveau`). C'est le téléphone de l'hôte qui les fait
  jouer (`tourRobot`, appelé après chaque `publier`). Ils ne votent pas. La partie ne compte « à plusieurs » pour le compagnon
  que s'il y a au moins deux humains.
- **Solo** (ajouté ensuite à la demande de l'utilisateur, avec un niveau à limiter) : le dictionnaire est chargé en arbre compact
  (`LC.construireArbre`, typed arrays, ~590 000 nœuds) qui sert aussi à vérifier les mots ; l'ordinateur cherche tous ses coups par la
  méthode des ancres (`LC.coupsPossibles`) et ne joue que des mots du dictionnaire. Niveaux (`LC.NIVEAUX`, `LC.ordinateur`) :
  **Facile** mots très courants (fréquence 3) de 6 lettres au plus, sans joker, coup au hasard dans la moitié la moins payante (~80-170 pts) ;
  **Normal** mots courants (fréquence ≥ 2) de 8 lettres au plus, coup entre 55 % et 85 % du classement (~250 contre Facile) ;
  **Confirmé** (2.84, demandé par l'utilisateur : « on passe de tout à rien » entre Normal et Fort) mots connus (fréquence ≥ 1) de 12 lettres au plus, un coup qui rapporte **50 à 80 % du meilleur** (`ratio`, le classement seul laissait trop d'écart ; mesuré en Node : ~365 contre ~150 face à Normal, ~275 contre ~450 face à Fort) ;
  **Fort** tous les mots, meilleur coup (~450-700). Le mot principal suit ces limites (`opts.frequence`, `T[nœud] = 1 + fréquence`),
  pas les petits mots croisés. Liste trop permissive pour les humains (signalé par l'utilisateur, ex. CF joué) : abréviations
  retirées, et le vote affiche un lien vers le vérificateur ODS de la Fédération (https://www.ffscrabble.fr/verificateur-de-mots/).
  Sans coup : il échange ses lettres sauf jokers, E et S (sac ≥ 7), sinon passe. Seul, pas de vote : un mot hors dictionnaire
  ouvre une fenêtre (`doute`) avec le lien vers le vérificateur ODS, « ↺ Changer mon mot » ou « ✓ Il est valable » (`jouerQuandMeme`).
  Bouton **« 🔎 Vérifier »** (demandé par l'utilisateur, pour progresser en solo) dans la ligne d'aperçu dès qu'un mot est prêt, en solo comme en salon :
  ouvre le vérificateur de la Fédération et copie les mots formés (`verifierODS` / `copierMots` ; le site ne se remplit pas par un lien).
  **Mon lexique** (2.84, demandé par l'utilisateur : le dictionnaire libre « s'écarte pas mal par moment » de celui du jeu officiel) : chaque téléphone retient des mots
  **acceptés** ou **refusés** (`lettres-lexique` = { ok, non }, `motValide(lx, m)` : l'avis compte avant le dictionnaire), seul et dans les salons dont il est l'hôte (c'est lui qui vérifie) ;
  l'ordinateur ne joue jamais un mot refusé (`LC.ordinateur(…, exclus)`). On touche un mot joué (« Dernier coup », sous un score) : **fiche du mot** (`ficheMot`) avec
  Définition (Wiktionnaire), Vérifier dans l'ODS, et ✓ Accepté / Dictionnaire / ✗ Refusé. Option **« 📌 Retenir pour les prochaines parties »** (`lettres-retenir`, cochée par défaut)
  dans la fenêtre du doute (solo : « Il est valable » l'ajoute aux acceptés) et sous le vote (salon : résultat `e.decision = { n, mots, ok }` retenu par l'hôte et chaque joueur).
  Réglages : liste des mots, ajout à la main, ✕ pour retirer. Série de victoires par niveau (`Etoiles.serie('lettres-<niveau>')`).
- **Onglet Règles : les lettres du sac** (3.98, demandé par l'utilisateur) : sous la liste des règles, « Les 102 lettres du sac » en jetons (7 par ligne, `.sac-lt`), points en petit sur la lettre, nombre dessous (« ×15 ») ; lus dans `LC.LETTRES` (computed `lettresSac`, `totalJetons`), donc toujours justes si la répartition change.
