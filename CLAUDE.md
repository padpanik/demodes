# Désdale : notes pour Claude

Application web de jeux de dés entre amis, jouée chacun sur son téléphone.
Tout est en français : interface, commentaires du code, messages de commit, réponses à l'utilisateur.

## Contexte à respecter

- **Usage strictement privé**, entre amis. Brilliant est un jeu commercial (Ravensburger) dont
  l'utilisateur possède la boîte : l'appli doit montrer une volonté de rester privée.
  Pas de référencement (`<meta name="robots" content="noindex…">` sur chaque page), pas de visuels
  officiels, pas de lien public, pas d'information personnelle dans le dépôt (il est public).
- **Code d'accès** : il n'apparaît JAMAIS dans le dépôt, ni dans un commit, ni dans un fichier de test.
  Seule son empreinte est publiée (voir « Accès privé »). Ne jamais le demander ni l'écrire en clair.
- **Pas de serveur** : hébergement statique sur GitHub Pages (`padpanik/demodes`, branche `main`).
  Les téléphones se parlent directement (WebRTC via PeerJS et son serveur public de mise en relation).
- L'utilisateur teste sur téléphone (référence d'écran : Samsung S21, 360 × 800 CSS px).
  Tout doit tenir en portrait sans défilement sur l'onglet de jeu.
- Mise en ligne : commit et push **directement sur `main`** (accord de l'utilisateur).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Code d'accès, puis choix du jeu. Reprend tout seul une partie en salon en cours (sauf avec `?choix`). |
| `commun.js` / `commun.css` | Base partagée : `VERSION`, stockage local, `clientId`, `ACCES`, `Sons` (Web Audio), `Voix` (synthèse vocale), `vibrer`, enregistrement du service worker. |
| `brilliant.html` | Brilliant (roll & write). Page autonome historique : elle a **sa propre copie** de `ACCES`, `Sons`, `Voix`, `VERSION` (n'utilise pas `commun.js`). |
| `yams.html` | Yams, solo et à plusieurs (chacun son tour). Utilise `commun.js`. |
| `backgammon.html` + `backgammon-regles.js` | Backgammon à deux. Le moteur de règles est dans `backgammon-regles.js` (testable avec Node). |
| `assaut.html` + `assaut-regles.js` | Assaut (stratégie à pièces cachées, version maison du genre « Stratego », sans le nom ni les visuels de la marque). Solo contre l'ordinateur, ou à deux (salon limité à 2, armées gardées sur chaque téléphone). Moteur + ordinateur dans `assaut-regles.js` (testable avec Node). |
| `bataille.html` + `bataille-regles.js` | Bataille navale. Solo contre l'ordinateur (3 niveaux), ou à deux (salon limité à 2, flottes gardées sur chaque téléphone). Moteur + ordinateur dans `bataille-regles.js` (testable avec Node). |
| `gribouille.html` + `gribouille-regles.js` | Gribouille : un joueur dessine, les autres devinent (à partir de 2, sans limite). Liste de mots maison et règles (normalisation, « tout près », indices, points) dans `gribouille-regles.js` (testable avec Node). |
| `sons/` | Sons enregistrés de la Bataille navale (MP3 libres de droits) et leurs sources (`LICENCES.txt`). |
| `salon-global.js` | **Salon global** commun à toutes les pages (présence, chat, profil), chargé en fin de page avec `data-jeu`. Indépendant du réseau des jeux. |
| `sw.js` | Service worker (PWA) : nos fichiers en « réseau d'abord » avec `cache: 'no-cache'`, bibliothèques en cache. |
| `manifest.webmanifest`, icônes | Installation comme application. |
| `netlify.toml` | Inutilisé (essai d'hébergement abandonné). |

Bibliothèques par CDN, versions figées : Vue **2.7.16** (Options API, `new Vue`), PeerJS **1.5.4**.
Pas d'étape de construction, pas de dépendance à ajouter.

## À chaque mise en ligne

1. Augmenter `VERSION` (même numéro, format `1.23`, plus de « beta ») dans **trois** fichiers :
   `commun.js`, `brilliant.html`, `sw.js`.
2. Nouveau fichier servi ? L'ajouter à `FICHIERS` dans `sw.js`.
3. Nouveau jeu ? L'ajouter à la liste `jeux` d'`index.html` (avec la clé de sa sauvegarde pour le badge « partie en cours »).
4. Vérifier la syntaxe des scripts (`node --check`) et l'absence d'échappements doublés (`\\'`) après une modification par script.
5. Tester (voir plus bas), puis commit + push sur `main`. GitHub Pages met 1 à 2 minutes à publier.

## Accès privé

- `ACCES` (dans `commun.js` **et** dans `brilliant.html`) : PBKDF2-SHA256, sel `demodes-acces-v1`,
  150 000 itérations, 48 octets. Octets 0–31 : `EMPREINTE` publiée ; octets 32–39 : « clé de salon »,
  jamais publiée, gardée dans `localStorage['brillant-acces']`.
- La clé de salon entre dans l'identifiant réseau : `'dm-' + cléSalon + '-' + [jeu + '-'] + nomSimplifié`.
  Préfixes de jeu : aucun pour Brilliant, `yams`, `bg`, `as`, `bn`, `gb`. Sans le bon code, impossible de joindre un salon.
- Changer le code = recalculer l'empreinte dans les deux fichiers ; tous les salons changent d'identifiant.

## Réseau (identique dans les trois jeux)

- Topologie en étoile : le premier arrivé **ouvre** le salon (il devient hôte et prend l'identifiant du salon),
  les suivants le **rejoignent**. Entrée en un geste : on tente d'ouvrir, et si l'identifiant est pris
  (`unavailable-id`), on rejoint.
- L'hôte est le **seul arbitre** : il lance les dés, vérifie chaque action, puis diffuse l'état.
  Yams et Backgammon diffusent l'état complet de la partie (`ETAT`) après chaque action.
- Battement toutes les 4 s (`PING`), 15 s de silence = connexion perdue ; reconnexion automatique,
  y compris au retour au premier plan (`visibilitychange`, `pageshow`, `online`).
- Chaque téléphone sauvegarde son état dans `localStorage` et se reconnecte seul après un rechargement.
- Yams et Backgammon : si l'hôte reste injoignable (~20 s), un joueur **rouvre le salon avec sa copie**
  de la partie ; l'ancien hôte, à son retour, rejoint comme simple joueur.
- Brilliant : la reprise par un joueur ne se fait qu'avant le premier lancer.
- Un joueur momentanément absent (appel, autre appli) est **attendu** ; l'hôte peut passer son tour (Yams).
- Connexion impossible sur un **même Wi-Fi** (location, hôtel, Wi-Fi invité : isolation des appareils) : constaté par
  l'utilisateur, ça marche dès qu'un téléphone passe en 4G/5G. Le message d'échec d'entrée le conseille. PeerJS utilise
  déjà ses relais TURN par défaut (UDP 3478) ; un relais TURN plus robuste demanderait un compte (Metered, Cloudflare…).
- **Pas d'entrée automatique** dans le salon au lancement (option retirée) : le nom du dernier salon est prérempli, on touche « Entrer ».
  Une partie en cours après un rechargement se reconnecte toujours toute seule.
- Jeux à deux (Backgammon, Assaut, Bataille navale) : si le salon est complet mais que l'autre joueur est **absent**
  (déconnecté), un nouveau venu prend sa place (`retirerJoueur`) au lieu d'être refusé.
- **Un seul salon à la fois par téléphone** : entrer dans un salon (`entrerSalon`) appelle `fermerAutresSalons(jeu)`
  (`commun.js`, copie dans `brilliant.html`), qui oublie le salon en cours des autres jeux (rôle et salon effacés de leur
  sauvegarde). L'accueil affiche le salon en cours avec un bouton « ✕ Quitter » (`oublierSalonDuJeu`).

## Salon global (`salon-global.js`)

- Un salon fixe `'dm-' + cléSalon + '-global'`, auquel chaque page se connecte toute seule (deuxième connexion PeerJS,
  à côté de celle du jeu) ; même principe en étoile : le premier connecté le tient, les autres le reprennent s'il part.
- **Présence** : pseudo, couleur, émoji ou petite photo (72 px), et où est chacun (jeu affiché + salon de jeu, lu dans la
  sauvegarde du jeu toutes les 2,5 s). Bouton **Rejoindre** : ouvre `jeu.html?salon=…`, la page remplit le salon et y entre.
- **Chat** : onglet « Tous », et « Ce salon » (messages étiquetés `jeu:<jeu>:<salon>`, vus seulement par ce salon de jeu).
  Texte simple (300 caractères) + émotions rapides ; les 60 derniers messages gardés sur chaque téléphone
  (rien n'est récupéré de ce qui s'est dit pendant l'absence, sauf ce que l'hôte du salon global a gardé).
- Interface injectée par le module : bulle 💬 (déplaçable le long du bord droit, pastille rouge = non lus, verte = connectés),
  panneau en haut de l'écran (ajusté au clavier), carte « En ligne » sur l'accueil (`#sg-ici`). Pas de notification appli fermée.

## Stockage local (préfixe historique `brillant-` conservé volontairement)

Communs : `brillant-acces`, `brillant-client-id`, `brillant-son`, `brillant-vibration`, `brillant-voix`,
`brillant-garder-ecran`, `brillant-entree-auto` (plus utilisé), `brillant-salons` (liste des salons, partagée), `desdale-dernier-jeu`, `desdale-ordre-jeux` (ordre des fiches de l'accueil, trié par appui long).
Salon global : `desdale-profil` (pseudo, couleur, émoji, photo), `desdale-chat`, `desdale-chat-lus`, `desdale-bulle-y`.
Brilliant : `brillant-sauvegarde-v1`, `brillant-dernier-salon`, `brillant-records(-dates)`, `brillant-classements`, `brillant-rejoindre-auto`.
Yams : `yams-sauvegarde`, `yams-dernier-salon`, `yams2-record`, `yams2-classements` (le « 2 » : barème maison).
Assaut : `assaut-sauvegarde`, `assaut-prive` (mon armée en salon), `assaut-dernier-salon`, `assaut-mode`, `assaut-memoire`, `assaut-stats`, `assaut-dispositions`, `assaut-apparence`, `assaut-images`, `assaut-numerotation`, `assaut-couleur`.
Backgammon : `bg-sauvegarde`, `bg-dernier-salon`.
Gribouille : `gribouille-sauvegarde`, `gribouille-dernier-salon`, `gribouille-duree`, `gribouille-manches`.
Bataille navale : `bataille-sauvegarde`, `bataille-prive` (ma flotte en salon), `bataille-dernier-salon`, `bataille-stats`, `bataille-colles`, `bataille-rejouer`, `bataille-niveau`, `bataille-style`.

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
  Le premier tireur alterne à chaque partie.

### Gribouille (dessiner et deviner, chacun pour soi)
- Nom maison (pas « Pictionary » ni « Dessinez c'est gagné »). À partir de 2 joueurs, pas de limite, pas de solo.
- Chacun son tour, le dessinateur choisit **un mot parmi 3** (15 s, sinon le 1er). **80 s** par défaut (l'hôte choisit 60, 80 ou 120 s),
  1 à 3 manches (chacun dessine une fois par manche ; un joueur qui arrive en cours de partie dessine aussi dans la manche).
- Environ 1 100 mots maison (`MOTS`, par thèmes). « œ » et « æ » comptent pour deux lettres dans l'indice (comme au clavier).
- Indices : nombre de lettres (« _ _ _ »), puis une lettre dévoilée à mi-temps, une 2e aux trois quarts (mots de 7 lettres et plus).
- Points selon l'ordre et la vitesse : 50 + 250 × temps restant, +50 au 1er, +25 au 2e ; le dessinateur +60 par joueur qui trouve.
  Le tour s'arrête quand tous ont trouvé ou à la fin du chrono. Propositions sans accents ni majuscules ; « Tout près ! »
  (une lettre d'écart, deux pour les longs mots) n'est montré qu'à celui qui l'a tapé ; les mauvaises propositions sont vues de tous.
- Réseau : l'hôte arbitre et garde le mot secret (envoyé seulement au dessinateur, jamais dans l'état public) ; les traits
  (millièmes de la largeur) sont relayés tout de suite aux autres et le dessin complet est renvoyé à qui arrive ou revient.
  Dessinateur absent plus de 10 s : tour suivant. Hôte disparu : un joueur rouvre le salon et le tour en cours est annulé.

### Autres choix déjà tranchés
- Annonce vocale du tour : **seulement sur le téléphone du joueur concerné**, après 5 s sans lancer.
- Sons fabriqués par le code (pas de fichiers audio), sauf la Bataille navale : sons enregistrés **libres de droits**
  dans `sons/` (sources dans `sons/LICENCES.txt`), choisis par l'utilisateur : plouf (à l'eau), explosion (touché),
  et pour un coulé l'explosion **puis** la sirène. Sons fabriqués par le code en secours. Sons et vibrations réglables séparément.

## Tester

Les tests se font dans un navigateur sans tête (Playwright + Chromium, déjà installés dans l'environnement cloud),
en simulant plusieurs téléphones (contextes séparés, 360 × 800) :
1. Copier le site dans un dossier de test en remplaçant les URL des CDN par des copies locales de Vue et PeerJS,
   et en forçant PeerJS vers un serveur local (`peer` de npm, `127.0.0.1:9000`, chemin `/myapp`) :
   le serveur public `0.peerjs.com` n'est pas joignable depuis l'environnement cloud.
2. Servir le dossier en local (`python3 -m http.server`), saisir le code d'accès dans le test **sans l'écrire dans le dépôt**.
3. Piloter les pages (`document.getElementById('app').__vue__` donne accès à l'état Vue) : entrée en salon,
   coups, rechargement de page, fermeture d'un téléphone, reprise du salon.
4. Moteurs : tests Node directs sur `backgammon-regles.js` (positions piégeuses + parties aléatoires) et `bataille-regles.js` (flottes, ordinateur contre ordinateur, triche repérée).
5. Toujours regarder une capture d'écran du rendu à 360 px de large avant de publier.
