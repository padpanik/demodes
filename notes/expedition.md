# Désdale, détail : Expédition

> Note de travail pour Claude, sortie de CLAUDE.md le 22 novembre 2026. Elle fait foi pour ce chantier : la lire en entier avant d'y toucher, et y consigner le détail de chaque nouvelle version.

### Expédition (demandée par l'utilisateur : emmener le compagnon en balade, thèmes de culture générale)
- **Lieux** (`EX.LIEUX`) : un lieu = un thème, ses couleurs, son décor, ses gardiens, sa buvette, son boss (avec `consigne` affichée avant le défi)
  et ses souvenirs. Prêts : **Studio de cinéma** (boss : le Fantôme du studio, au Quatre en ligne) et **Laboratoire** (sciences, ouvert en 2.30 ;
  boss : le Savant fou, à la Bataille navale ; 56 questions : 30 faciles, 26 moyennes ; souvenirs microscope, éprouvettes, télescope, aimant) et **Château fort**
  (histoire, ouvert en 3.63, « Go pour remplir les Terres » de l'utilisateur ; 55 questions : 30 faciles, 25 moyennes ; gardiens héraut, dame du château, forgeron, archer, moine copiste, fou du roi, sentinelle ;
  cuisines du château ; boss **le Chevalier noir, à l'Assaut** ; souvenirs `blason`, `etendard`, `chandelier`, `heaume`) et **Île aux trésors** (géographie, ouverte en 3.65 ; 55 questions : 30 faciles, 25 moyennes ; gardiens perroquet, navigatrice, pêcheur, cartographe, vieux loup de mer, plongeuse, mousse ; paillote de la plage ; boss **le Capitaine Barbe-Sel, aux Dominos** ; souvenirs `mappemonde`, `boussole`, `coquillage`, `ancre`). Annoncés « Bientôt » :
  Conservatoire (musique), Forêt enchantée (nature) — chacun prévu avec un boss d'un autre jeu. **Un lieu qui devient prêt** = aussi l'ajouter à `LIEUX_EXPEDITION` de `vallee-regles.js` (son campement dans les Terres) et son icône à `vallee-pictos.js`.
- **Onglet Partie** : depuis 3.61 (demandé par l'utilisateur : « déplacer les expéditions dans le monde à explorer », dans les Terres, et retirées complètement de l'accueil),
  le lieu vient de l'adresse (`?lieu=cinema`, lu au chargement dans `lieuChoisi`) : carte « Ton expédition » (lieu, thème, boss), compagnon, Difficulté avec le rappel des 3 cœurs et « 🧭 Partir : <lieu> ».
  Sans lieu dans l'adresse : carte « Où partir en expédition ? » qui renvoie vers la Vallée (bouton « ⛰️ Aller dans la Vallée »). Plus de choix « Où aller ? » dans la page.
- **Une expédition par heure** (le compagnon est fatigué : `EX.REPOS`, départ noté dans `expedition-depart`) : carte « 😴 … trop fatigué » en haut
  de l'onglet Partie et bouton « Encore N min de repos ».
- **Carte procédurale** (`EX.genererCarte(graine)`, reproductible, demandée par l'utilisateur) : 7 rangs, départ en bas, boss en haut ;
  2 ou 3 étapes par rang intermédiaire, placées au hasard (cases `k, d` de la grille iso, `k + d` pair, `|d| ≤ 5`), rangs espacés de 4 ou 6 cases ;
  chaque étape mène à la ou aux plus proches du rang suivant (fourches), aucune impasse. Tapis tracé case par case par une marche au hasard
  (`carte.chemins['a-b']`, `tracerChemins`) qui serpente mais arrive toujours. Étapes : gardien (~55 %, au moins un par rang), coffre (~29 %),
  buvette (pas au 1er rang). Ancienne carte (expédition commencée avant 2.26) : complétée par `EX.completerCarte`.
  La carte est plus haute que l'écran : fenêtre de 590 (`FENETRE`, `cadre`) qui défile (`camera`) pour garder le compagnon vers le bas.
- **Vue isométrique** (`carteSvg`), **chemin caché** (demandé par l'utilisateur) : on ne voit que les étapes déjà faites, l'étape actuelle et le
  prochain choix (tapis compris) ; tout le reste est caché, boss compris. Dallage en damier, tapis entre les étapes, étapes en pavés
  avec leur icône (❓ gardien, coffre dessiné, buvette, boss sur pavé violet), anneau doré qui clignote sur les étapes possibles, décor du lieu
  sur les bords (jamais contre une étape). Le compagnon (`CP.dessin`) est posé sur l'étape et marche jusqu'à la suivante (sinon 🐾).
- **Cœurs** : 3 dessinés en SVG dans la barre dès le départ (et « Tu pars avec 3 cœurs » dans l'onglet Partie) ; celui qu'on perd tremble (`coeurPerdu`). Plus de cœur = fin.
- **Gardien** : une question (4 réponses mélangées), bonne = +1 ⭐ au sac (+2 pour une question moyenne en Aventure), mauvaise = −1 cœur ;
  l'explication s'affiche ensuite. **Aide du compagnon** une fois par expédition (retire deux mauvaises réponses). Questions maison
  (`EX.QUESTIONS`, 55 pour le cinéma : 30 faciles, 25 moyennes, avec une petite explication) ; pas de répétition des 40 dernières.
- **Coffre risqué** (« qu'on hésite à y aller ») : **1 fois sur 5** une bestiole (rat, chauve-souris, araignée, serpent ; `EX.BESTIOLES`,
  `EX.tirerCoffre`) vole un cœur ; l'avertissement est affiché et on peut « Passer mon chemin » sans ouvrir. Sinon : souvenir (30 %), ou 2 à 4
  **poussières d'étoile** ✨, parfois le gros lot de 6 (12 %). Poussières plutôt qu'étoiles (trop d'étoiles sinon, d'après l'utilisateur) : 5 poussières = 1 ⭐, converties à la fin
  de l'expédition, le reste gardé (`expedition-poussiere`) ; le **souvenir** (si on a un compagnon) est un objet du lieu pas encore trouvé, installé tout de suite au salon
  (articles `souvenir` de `compagnon-commun.js` : clap, pop-corn, bobine, projecteur ; emplacements `exp-…`, invendables, visibles en boutique
  seulement une fois trouvés, déplaçables avec « Arranger la déco »). **Buvette** : +1 cœur (3 au plus).
- **Boss** : la partie se joue **sur la vraie page du jeu** (pas de copie) : l'expédition écrit `expedition-boss` (id, nom, icône, défi, niveau)
  et ouvre `quatre/?boss` ; Quatre en ligne passe en « mode boss » (bandeau du boss, le joueur commence, pas d'étoiles ni de stats du jeu,
  sauvegarde à part `quatre-boss`, boutons « Retour à l'expédition » / « Plus tard ») et rend l'issue dans `expedition-boss-resultat`
  (lue au retour, `lireResultatBoss`). Balade : ordinateur facile, Aventure : normal. Gagné : +5 ⭐ et fin ; perdu : −1 cœur et revanche ;
  nul : revanche gratuite. Un futur boss sur un autre jeu demande le même « mode boss » dans ce jeu.
  **Mode boss de la Bataille navale** (`bataille/?boss`, `demarrerBoss`) : partie solo contre l'ordinateur au niveau du boss (`niveauOrdi`),
  bandeau du boss pendant le placement, « Mer ennemie » / « Flotte ennemie », sauvegarde à part `bataille-boss`, ni étoiles ni stats ni records,
  boutons « ↩ Plus tard » / « 🧭 Retour à l'expédition » (`retourExpedition`), issue `gagne` / `perdu` dans `expedition-boss-resultat`.
  **Mode boss des Dominos** (3.65, Île aux trésors ; `domino/?boss`, `demarrerBoss`) : dominos classiques à deux contre « 🏴‍☠️ Barbe-Sel » (`nomBoss` = icône + `boss.court`, reconnu par `estOrdi`), **une seule manche** (`DM.nouvellePartie(…, { uneManche: true })` : `e.uneManche`, le gagnant de la manche gagne la partie), bandeau du boss, sauvegarde à part `domino-boss` (la partie solo `domino-solo` n'est pas touchée), ni étoiles ni série ; « ↩ Plus tard » / « 🧭 Retour à l'expédition » ; Balade : `DM.ordinateur(…, 'facile')` (6 fois sur 10 un coup permis au hasard), Aventure : l'ordinateur habituel. L'expédition passe aussi `court` (nom court du boss) dans `expedition-boss`.
  **Mode boss de l'Assaut** (3.63, Château fort ; `assaut/?boss`, `demarrerBoss`) : partie solo en **format rapide** (10 pièces, quel que soit le format choisi par le joueur, sans toucher à son réglage), le joueur commence, bandeau du boss,
  sauvegarde à part `assaut-boss` (la partie solo `assaut-sauvegarde` n'est pas touchée), ni étoiles ni statistiques ni série ; « ↩ Plus tard » / « 🧭 Retour à l'expédition » ; Balade : ordinateur `facile`
  (`AS.choisirCoup(…, niveau)` : 45 % de coups au hasard parmi les 6 meilleurs, au lieu de 12 % parmi les 3 meilleurs), Aventure : l'ordinateur habituel.
- **Abandon à tout moment** (demandé par l'utilisateur) : bouton « 🏳️ Quitter » dans la barre de l'écran de jeu, même pendant une rencontre,
  et « 🏳️ Arrêter » sur la carte « Expédition en cours » de l'onglet Partie (ouvre la même fenêtre). Deux choix : « 🏠 Rentrer avec la moitié du sac »
  (`quitter` : bilan compté `finir(false, true)`, résumé laissé au compagnon, repos d'une heure, retour à `index.html?choix`) ou **« 🔄 Repartir de zéro »**
  (`recommencer`, demandé par l'utilisateur : sac et poussières perdus, pas de repos — `expedition-depart` effacé —, retour au choix du lieu).
- **Fin** : boss vaincu = tout le sac ; plus de cœurs ou « Rentrer » = la moitié. Bouton « 🏠 Rentrer à la maison » : on revient sur
  `compagnon/`, au salon, où il raconte l'aventure (fenêtre « Retour d'expédition » : lieu, bonnes réponses, poussières, étoiles, souvenirs ;
  `expedition-retour`), avec un bouton OK. Étoiles par `Etoiles.recompenseJeu` (plafond du jour),
  `Etoiles.evenement('Expédition', …)` pour les défis ; la balade fait baisser Repas et Eau de 15. Difficultés : Balade / Aventure.
- Accueil : **depuis 3.61, l'Expédition n'est plus dans la liste des jeux** (de 3.20 à 3.60 elle y était, comme un jeu) : on y entre seulement par un campement des Terres. **Ordre de la liste des jeux** : jeux au badge « Nouveau » tant qu'il dure (3.03, demandé), puis favoris, puis l'ordre choisi.
  « 🏳️ Quitter » ramène dans la Vallée (`adresseRetour()`), la fin normale chez le compagnon (`compagnon/`, qui ramène ensuite dans la Vallée).
