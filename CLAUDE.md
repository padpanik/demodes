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

**Un dossier par jeu** (demandé par l'utilisateur, pour qu'un humain s'y retrouve) : `yams/index.html`, `lettres/index.html` + `lettres/lettres-regles.js`…
(adresse en ligne : `…/demodes/yams/`). **À la racine, seulement le commun ou l'unique** : `index.html` (accueil), `404.html`, `commun.js`, `qr.js`, `commun.css`,
`fiche-jeu.js`, `icones-jeux.js`, `etoiles.js`, `salon-global.js`, `sw.js`, manifest et icônes. Chaque page rangée dans un dossier commence par
`<base href="../">` : toutes ses adresses relatives (scripts communs, `index.html?choix`, `compagnon/`, `fetch`, liens) partent de la racine ;
ses propres fichiers s'écrivent donc avec le dossier (`src="lettres/lettres-regles.js"`, `fetch('lettres/lettres-mots.txt')`, `bataille/sons/…`).
Lien vers un jeu : `yams/` (pas `yams.html`). `404.html` renvoie les anciennes adresses (`yams.html?salon=…` → `yams/?salon=…`).

| Fichier | Rôle |
|---|---|
| `index.html` | Code d'accès, puis choix du jeu. Reprend tout seul une partie en salon en cours (sauf avec `?choix`). Bouton « Inviter » en haut à droite : fenêtre avec le QR code de l'adresse du site, « Partager le lien… » (menu de partage du téléphone, `navigator.share`, seulement s'il existe) et « Copier le lien » ; rappel que le code d'accès n'est pas dans le lien. |
| `commun.js` / `commun.css` | Base partagée : `VERSION`, stockage local, `clientId`, `ACCES`, `Sons` (Web Audio), `Voix` (synthèse vocale), `vibrer`, enregistrement du service worker. |
| `fiche-jeu.js` | **Composant commun des pages de jeu** (Vue 2, chargé par tous les jeux, Brilliant compris, avant le code de la page) : `<fiche-jeu>` (en-tête logo / nom / résumé, « ⇦ Jeux » en haut à droite, 4 onglets à logo, bouton 🔊 et point de connexion pendant le jeu) et `<reglages-base>` (sons, vibrations, voix, écran allumé). Ses styles sont injectés par le fichier. |
| `icones-jeux.js` | **Icônes des jeux** (`IconesJeux.svg(jeu, taille)`) : même canevas épuré pour tous (version « claire » choisie par l'utilisateur : tuile arrondie à plat, teinte pâle de la couleur du jeu, dessin du jeu dans sa couleur ; ni dégradé, ni reflet, ni ombre), avec la marque de chaque jeu. Accueil (68 px) et en-tête de `<fiche-jeu>` (propriété `jeu`, 64 px ; le slot `logo` n'est plus qu'un secours). Anciennes icônes retirées de l'accueil. |
| `qr.js` | **QR code fait maison** (`QR.svg(texte, taille)`, `QR.matrice`) : octets UTF-8, correction M, versions 1 à 10, masque choisi par pénalité ; testable avec Node (vérifié en relisant les codes avec OpenCV). Sert au bouton « Inviter » de l'accueil. |
| `etoiles.js` | `Etoiles` (monnaie de « Mon compagnon ») : chargé juste après `commun.js` par toutes les pages, **et par `brilliant/index.html`** (il n'a besoin que de `lireStockage` / `ecrireStockage`). |
| `brilliant/index.html` | Brilliant (roll & write). Page autonome historique : elle a **sa propre copie** de `ACCES`, `Sons`, `Voix`, `VERSION` (n'utilise pas `commun.js`). |
| `yams/index.html` | Yams, solo et à plusieurs (chacun son tour). Utilise `commun.js`. |
| `backgammon/` : `index.html` + `backgammon-regles.js` | Backgammon à deux. Le moteur de règles est dans `backgammon-regles.js` (testable avec Node). |
| `assaut/` : `index.html` + `assaut-regles.js` | Assaut (stratégie à pièces cachées, version maison du genre « Stratego », sans le nom ni les visuels de la marque). Solo contre l'ordinateur, ou à deux (salon limité à 2, armées gardées sur chaque téléphone). Moteur + ordinateur dans `assaut-regles.js` (testable avec Node). |
| `bataille/` : `index.html` + `bataille-regles.js` | Bataille navale. Solo contre l'ordinateur (3 niveaux), ou à deux (salon limité à 2, flottes gardées sur chaque téléphone). Moteur + ordinateur dans `bataille-regles.js` (testable avec Node). |
| `gribouille/` : `index.html` + `gribouille-regles.js` | Gribouille : un joueur dessine, les autres devinent (à partir de 2, sans limite). Liste de mots maison et règles (normalisation, « tout près », indices, points) dans `gribouille-regles.js` (testable avec Node). |
| `petitbac/` : `index.html` + `petitbac-regles.js` | Petit bac : une lettre, un mot par catégorie (à partir de 2, sans limite). Catégories, normalisation, validité et points dans `petitbac-regles.js` (testable avec Node). |
| `agents/` : `index.html` + `agents-regles.js` | Agents secrets (version maison du jeu d'espions en mots, sans le nom ni les visuels de la marque) : deux équipes, un chef par équipe voit la carte secrète. Mots et règles dans `agents-regles.js` (testable avec Node). |
| `quatre/` : `index.html` + `quatre-regles.js` | Quatre en ligne (version maison du classique « aligner 4 jetons », sans le nom de la marque). Solo contre l'ordinateur (3 niveaux) ou à deux en salon. Moteur + ordinateur (minimax) dans `quatre-regles.js` (testable avec Node). |
| `domino/` : `index.html` + `domino-regles.js` | Dominos (double-six) avec l'option **Triominos**. Solo contre 1 à 3 ordinateurs, ou salon de 2 à 4 (mains gardées par l'hôte, chacun ne reçoit que la sienne). Moteur + ordinateur + géométrie triangulaire dans `domino-regles.js` (testable avec Node). |
| `lettres/` : `index.html` + `lettres-regles.js` + `lettres-mots.txt` | **Lettres croisées** (version maison du jeu de lettres sur grille, sans le nom ni les visuels de la marque). Solo contre 1 à 3 ordinateurs (3 niveaux), ou salon de 2 à 4 (chevalets et sac gardés par l'hôte). Plateau, bonus, points, arbre de mots et ordinateur dans `lettres-regles.js` (testable avec Node). Dictionnaire libre `lettres-mots.txt` (~311 000 mots, licence MIT, voir `lettres-mots-licence.txt`), une ligne par mot codée « préfixe commun » (1er caractère = longueur reprise du mot précédent, en hexadécimal), suivie d'un chiffre de fréquence (3 très courant, 2 courant, 1 connu, rien = rare ; d'après wordfreq, CC BY-SA 4.0). Abréviations retirées (CF, KM…). Pas d'ODS (liste officielle sous droits). |
| `expedition/` : `index.html` + `expedition-regles.js` | **Expédition** (balade du compagnon, culture générale) : chemin à embranchements en **vue 3D isométrique** (SVG dessiné par le code), gardiens qui posent une question, coffres, buvette, boss sur un jeu de la collection contre l'ordinateur. Solo pour l'instant (sorties en groupe prévues). Lieux, questions maison, génération de la carte et récompenses dans `expedition-regles.js` (testable avec Node). |
| `compagnon/` : `index.html` + `compagnon-commun.js` | **Mon compagnon** (prototype, façon « animal virtuel ») : on adopte un animal dessiné en SVG, on en prend soin chaque jour, et les ⭐ gagnées en jouant (`Etoiles` dans `commun.js`) achètent accessoires et déco. Espèces, besoins, boutique et dessin SVG dans `compagnon-commun.js` (aussi utilisé par l'accueil). Pas de réseau propre. |
| `compagnon/compagnon-3d.html` | Maquette « niveau 2 » : le chien en vraie 3D (Three.js **r128** par CDN, uniquement sur cette page). **Mise de côté** par l'utilisateur (plus de lien dans le jeu, page gardée pour plus tard). |
| `bataille/sons/` | Sons enregistrés de la Bataille navale (MP3 libres de droits) et leurs sources (`LICENCES.txt`). |
| `salon-global.js` | **Salon global** commun à toutes les pages (présence, chat, profil), chargé en fin de page avec `data-jeu`. Indépendant du réseau des jeux. |
| `sw.js` | Service worker (PWA) : nos fichiers en « réseau d'abord » avec `cache: 'no-cache'`, bibliothèques en cache. |
| `manifest.webmanifest`, icônes | Installation comme application. |
| `netlify.toml` | Inutilisé (essai d'hébergement abandonné). |

Bibliothèques par CDN, versions figées : Vue **2.7.16** (Options API, `new Vue`), PeerJS **1.5.4**.
Pas d'étape de construction, pas de dépendance à ajouter.

## À chaque mise en ligne

1. Augmenter `VERSION` (même numéro, format `1.23`, plus de « beta ») dans **trois** fichiers :
   `commun.js`, `brilliant/index.html`, `sw.js`.
2. Nouveau fichier servi ? L'ajouter à `FICHIERS` dans `sw.js` (avec son dossier : `'./yams/'`, `'./lettres/lettres-regles.js'`).
3. Nouveau jeu ? Son dossier (`jeu/index.html` avec `<base href="../">`, copier `lettres/index.html`), puis l'ajouter à la liste `jeux` d'`index.html` (avec la clé de sa sauvegarde pour le badge « partie en cours »).
4. Vérifier la syntaxe des scripts (`node --check`) et l'absence d'échappements doublés (`\\'`) après une modification par script.
5. Tester (voir plus bas), puis commit + push sur `main`. GitHub Pages met 1 à 2 minutes à publier.

## Accès privé

- `ACCES` (dans `commun.js` **et** dans `brilliant/index.html`) : PBKDF2-SHA256, sel `demodes-acces-v1`,
  150 000 itérations, 48 octets. Octets 0–31 : `EMPREINTE` publiée ; octets 32–39 : « clé de salon »,
  jamais publiée, gardée dans `localStorage['brillant-acces']`.
- La clé de salon entre dans l'identifiant réseau : `'dm-' + cléSalon + '-' + [jeu + '-'] + nomSimplifié`.
  Préfixes de jeu : aucun pour Brilliant, `yams`, `bg`, `as`, `bn`, `gb`, `pb`, `ag`, `ql`, `dm`, `lc`. Sans le bon code, impossible de joindre un salon.
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
  (`commun.js`, copie dans `brilliant/index.html`), qui oublie le salon en cours des autres jeux (rôle et salon effacés de leur
  sauvegarde). L'accueil affiche le salon en cours avec un bouton « ✕ Quitter » (`oublierSalonDuJeu`).

## Présentation commune des pages de jeu (demandée par l'utilisateur : « que tout le monde s'y retrouve »)

- **Composant `<fiche-jeu>` (`fiche-jeu.js`)** : le canevas est commun, chaque jeu ne passe que ses particularités :
  `<fiche-jeu jeu="yams" nom="…" resume="Désdale · …" :onglet.sync="onglet" :son.sync="sonActif" :connexion="role ? connexion : ''">`
  puis `<template v-slot:logo>`, `v-slot:partie`, `v-slot:jouer`, `v-slot:reglages`, `v-slot:regles` (et `v-slot:infos`, facultatif).
  Le contenu des slots reste écrit dans la page (mêmes données, mêmes `ref`). Onglets en `v-show` : rien n'est détruit.
  Modifier l'en-tête, les onglets ou leur style = modifier **seulement** `fiche-jeu.js`. Brilliant : `:onglet.sync="actif_tab"`.
- En-tête (logo, nom, résumé + bouton « ⇦ Jeux » en haut à droite) visible sur Partie, Réglages et Règles ; **caché sur Jouer**
  (l'écran de jeu doit tenir sans défilement). Onglets sur toute la largeur, une icône au trait par onglet (SVG maison dans
  `ICONES`, grises au repos, bleues sur l'onglet actif) : dé = Partie (`'config'`), lecture = Jouer (`'play'`), curseurs = Réglages
  (`'reglages'`), livre ouvert = Règles (`'regles'`, règles en clair, sans repli). Bouton « ‹ ▦ Jeux » (chevron + grille, `RETOUR`).
  Pendant le jeu, à droite des onglets : haut-parleur (`SON`, barré si coupé) et le point de connexion (écran allumé : dans Réglages ; Brilliant : niveau et 🎯 dans la ligne des scores).
- **Onglet Partie des jeux solo + salon** (Yams, Brilliant, Assaut, Bataille navale, Quatre en ligne, Dominos, Lettres croisées) :
  toujours **deux blocs**, « À plusieurs / À deux, chacun sur son téléphone » (pseudo, nom du salon, bouton « Entrer dans le salon »)
  **en haut**, puis « Seul » / « Seul contre l'ordinateur » (ses options et le bouton « Jouer seul ») **en bas**. Les options qui servent
  aux deux (niveau de Brilliant, format d'Assaut, jeu Dominos / Triominos et points des Dominos) restent au-dessus des deux blocs.
  Les **options de règles** (Bataille navale : navires qui se touchent, rejouer tant qu'on touche ; Assaut : garder les pièces adverses révélées)
  sont dans l'onglet **Règles**, en tête (« Options de la partie », choisies par l'hôte en salon), au-dessus du texte des règles.
- Réglages : `<reglages-base :son.sync :vibration.sync :voix.sync :ecran.sync>` (on ne passe que ceux du jeu ; chacun s'affiche
  seulement si le téléphone le permet), puis les réglages propres au jeu (apparence d'Assaut / Bataille navale) et le journal « Activité ».
- **Pseudo unique, choisi sur le portail** (profil du salon global, `desdale-profil`) : plus de champ pseudo dans les jeux, juste
  « Ton pseudo : X · ✏️ Changer » (`ouvrirProfilPortail` ouvre l'onglet « Moi » de la bulle 💬). `pseudoPortail()` / `pseudoPour(cléSauvegarde)`
  dans `commun.js` (copie dans `brilliant/index.html`) : dans un salon en cours, on garde le pseudo sous lequel on y est entré. Le salon global
  envoie l'événement `desdale-profil` quand on change de profil ; les pages le suivent tant qu'elles ne sont pas dans un salon.
  Sans pseudo, « Entrer dans le salon » ouvre le profil.
- Nouveau jeu : charger `fiche-jeu.js` avant le code de la page et remplir les slots (copier `lettres.html` par exemple).
- Toutes les pages Vue : `<div id="app" v-cloak …>` et `[v-cloak] { display: none }` (dans `commun.css`, copie dans `brilliant/index.html`) :
  rien ne s'affiche avant la fin du rendu (plus de trame brute avec les `{{ … }}` une fraction de seconde).

## Salon global (`salon-global.js`)

- Un salon fixe `'dm-' + cléSalon + '-global'`, auquel chaque page se connecte toute seule (deuxième connexion PeerJS,
  à côté de celle du jeu) ; même principe en étoile : le premier connecté le tient, les autres le reprennent s'il part.
- **Présence** : pseudo, couleur, émoji ou petite photo (72 px), et où est chacun (jeu affiché + salon de jeu, lu dans la
  sauvegarde du jeu toutes les 2,5 s). Bouton **Rejoindre** : ouvre `jeu.html?salon=…`, la page remplit le salon et y entre.
- **Compagnon** : le profil envoyé contient un résumé de « Mon compagnon » (`cp` : espèce, couleur, nom, objets portés, date d'adoption,
  humeur) ; la liste des présents montre son petit dessin, son nom et son âge (`compagnon-commun.js` chargé au besoin).
- **Invisible** (interrupteur 👻 dans « Présents » et « Moi », gardé dans `desdale-profil`) : l'hôte n'envoie un membre invisible
  qu'à lui-même, les autres ne le voient pas ; il lit le chat, ses messages restent signés s'il écrit ; pas de son ni de vibration de chat.
- **Chat** : onglet « Tous », et « Ce salon » (messages étiquetés `jeu:<jeu>:<salon>`, vus seulement par ce salon de jeu).
  Texte simple (300 caractères) + émotions rapides ; les 60 derniers messages gardés sur chaque téléphone
  (rien n'est récupéré de ce qui s'est dit pendant l'absence, sauf ce que l'hôte du salon global a gardé).
- Interface injectée par le module : bulle 💬 (déplaçable le long du bord droit, pastille rouge = non lus, verte = connectés),
  panneau en haut de l'écran (ajusté au clavier), carte « En ligne » sur l'accueil (`#sg-ici`). Pas de notification appli fermée.

## Stockage local (préfixe historique `brillant-` conservé volontairement)

Communs : `brillant-acces`, `brillant-client-id`, `brillant-son`, `brillant-vibration`, `brillant-voix`,
`brillant-garder-ecran`, `brillant-entree-auto` (plus utilisé), `brillant-salons` (liste des salons, partagée), `desdale-dernier-jeu`, `desdale-ordre-jeux` (ordre des fiches de l'accueil, trié par appui long), `desdale-favoris` (jeux marqués d'une étoile sur leur fiche, affichés en tête de liste).
Salon global : `desdale-profil` (pseudo, couleur, émoji, photo), `desdale-chat`, `desdale-chat-lus`, `desdale-bulle-y`.
Brilliant : `brillant-sauvegarde-v1`, `brillant-dernier-salon`, `brillant-records(-dates)`, `brillant-classements`, `brillant-rejoindre-auto`.
Yams : `yams-sauvegarde`, `yams-dernier-salon`, `yams2-record`, `yams2-classements` (le « 2 » : barème maison).
Assaut : `assaut-sauvegarde`, `assaut-prive` (mon armée en salon), `assaut-dernier-salon`, `assaut-mode`, `assaut-memoire`, `assaut-stats`, `assaut-dispositions`, `assaut-apparence`, `assaut-images`, `assaut-numerotation`, `assaut-couleur`.
Backgammon : `bg-sauvegarde`, `bg-dernier-salon`.
Gribouille : `gribouille-sauvegarde`, `gribouille-dernier-salon`, `gribouille-duree`, `gribouille-manches`.
Petit bac : `petitbac-sauvegarde`, `petitbac-dernier-salon`, `petitbac-reglages` (catégories, durée, manches, lettres de l'hôte).
Agents secrets : `agents-sauvegarde` (dont `maCle`, la carte secrète si on est chef), `agents-dernier-salon`.
Quatre en ligne : `quatre-sauvegarde` (salon), `quatre-solo` (partie contre l'ordinateur), `quatre-boss` (partie contre un boss d'expédition), `quatre-niveau`, `quatre-stats`, `quatre-dernier-salon`.
Dominos : `domino-sauvegarde` (salon ; chez l'hôte, l'état complet avec toutes les mains), `domino-solo` (partie contre l'ordinateur), `domino-jeu`, `domino-ordis`, `domino-buts`, `domino-dernier-salon`.
Lettres croisées : `lettres-sauvegarde` (salon ; chez l'hôte, l'état complet avec chevalets et sac), `lettres-solo` (partie contre l'ordinateur), `lettres-niveau`, `lettres-ordis`, `lettres-dernier-salon`.
Mon compagnon : `compagnon-animal` (espèce, nom, couleur, besoins, objets possédés et portés, série de jours), `compagnon-etoiles` (solde),
`compagnon-journal` (dernières étoiles gagnées ou dépensées), `compagnon-parties` (parties déjà récompensées), `compagnon-jour` (tâches du jour),
`compagnon-cadeau` (bonus de bienvenue donné), `compagnon-ancien`, `compagnon-gains-jeux` (étoiles gagnées en jouant aujourd'hui),
`compagnon-reglages`, `compagnon-veille`, `compagnon-series` (séries de victoires solo), `compagnon-evenements` (parties terminées), `compagnon-defis`, `compagnon-trophees`, `compagnon-maison`, `compagnon-anniv` (année du dernier cadeau d'anniversaire), `compagnon-penalite` (jauge vide), `compagnon-fete-essai` (admin).
Expédition : `expedition-partie` (expédition en cours), `expedition-depart` (heure du dernier départ), `expedition-poussiere` (réserve),
`expedition-boss` / `expedition-boss-resultat` (défi envoyé au jeu du boss et son issue), `expedition-retour` (résumé pour le compagnon), `expedition-vues` (40 dernières questions posées), `expedition-stats`, `expedition-lieu`, `expedition-difficulte`.
Bataille navale : `bataille-boss` (partie contre un boss d'expédition), `bataille-sauvegarde`, `bataille-prive` (ma flotte en salon), `bataille-dernier-salon`, `bataille-stats`, `bataille-colles`, `bataille-rejouer`, `bataille-niveau`, `bataille-style`.

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
  **Fort** tous les mots, meilleur coup (~450-700). Le mot principal suit ces limites (`opts.frequence`, `T[nœud] = 1 + fréquence`),
  pas les petits mots croisés. Liste trop permissive pour les humains (signalé par l'utilisateur, ex. CF joué) : abréviations
  retirées, et le vote affiche un lien vers le vérificateur ODS de la Fédération (https://www.ffscrabble.fr/verificateur-de-mots/).
  Sans coup : il échange ses lettres sauf jokers, E et S (sac ≥ 7), sinon passe. Seul, pas de vote : un mot hors dictionnaire
  demande une confirmation au joueur. Série de victoires par niveau (`Etoiles.serie('lettres-<niveau>')`).

### Expédition (demandée par l'utilisateur : emmener le compagnon en balade, thèmes de culture générale)
- **Lieux** (`EX.LIEUX`) : un lieu = un thème, ses couleurs, son décor, ses gardiens, sa buvette, son boss (avec `consigne` affichée avant le défi)
  et ses souvenirs. Prêts : **Studio de cinéma** (boss : le Fantôme du studio, au Quatre en ligne) et **Laboratoire** (sciences, ouvert en 2.30 ;
  boss : le Savant fou, à la Bataille navale ; 56 questions : 30 faciles, 26 moyennes ; souvenirs microscope, éprouvettes, télescope, aimant).
  Annoncés « Bientôt » : Château fort (histoire),
  Île aux trésors (géographie), Conservatoire (musique), Forêt enchantée (nature) — chacun prévu avec un boss d'un autre jeu.
- **Onglet Partie** (ordre voulu par l'utilisateur) : compagnon, Difficulté avec le rappel des 3 cœurs et « Partir en expédition », puis « Où aller ? ».
  Aucun lieu choisi d'office (`lieuChoisi: null`) : bouton grisé « 👇 Choisis d'abord où aller » tant qu'on n'a pas touché un lieu, puis « 🧭 Partir : <lieu> ».
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
- **Abandon à tout moment** (demandé par l'utilisateur) : bouton « 🏳️ Quitter » dans la barre de l'écran de jeu, même pendant une rencontre ;
  fenêtre de confirmation (moitié du sac), puis `quitter` : bilan compté (`finir(false, true)`), résumé laissé au compagnon, retour à `index.html?choix`.
- **Fin** : boss vaincu = tout le sac ; plus de cœurs ou « Rentrer » = la moitié. Bouton « 🏠 Rentrer à la maison » : on revient sur
  `compagnon/`, au salon, où il raconte l'aventure (fenêtre « Retour d'expédition » : lieu, bonnes réponses, poussières, étoiles, souvenirs ;
  `expedition-retour`), avec un bouton OK. Étoiles par `Etoiles.recompenseJeu` (plafond du jour),
  `Etoiles.evenement('Expédition', …)` pour les défis ; la balade fait baisser Repas et Eau de 15. Difficultés : Balade / Aventure.
- Accueil : l'Expédition est **tout en haut de la liste, même devant les favoris**, avec un badge « Nouveau » (`tete`, `nouveau` dans `jeux`) ;
  badge « Expédition en cours » (sans bouton Quitter, et la page ne se rouvre pas toute seule : `solo: true`).

### Mon compagnon (prototype : piste d'un futur Désdale « centre de loisirs pour personnes âgées »)
- But : petites obligations quotidiennes douces et envie de jouer **ensemble** pour gâter son animal. Grand texte, gros boutons.
- Animaux (SVG dessinés par le code) : chat, chien, chèvre, dragon, lapin, renard, panda, tortue, raton laveur, singe, oie, écureuil ; une couleur au choix (aperçu en grand), un nom.
- **Renard redessiné** (premier animal « personnalisé », d'après des images d'inspiration de l'utilisateur, sans les recopier) :
  grandes oreilles à pointes sombres et intérieur crème, touffes de joues, mèche sur le front, masque et plastron crème en dents de scie,
  pattes avant en chaussettes sombres, grosse queue touffue au bout crème, yeux plissés de bonheur et bouche « ω » quand il est content.
  **Dragon redessiné** de la même façon : grandes ailes de chauve-souris à membrane chaude (orange, jaune pour le dragon rouge),
  cornes recourbées sombres, houppette claire, taches de rousseur, grands yeux à iris violet, ventre clair à bandes, petites pattes
  posées sur le ventre, griffes, queue enroulée à piquants.
  Même squelette que les autres : accessoires, signes et postures inchangés. Les autres animaux pourront suivre de la même façon.
- Rendu « niveau 1 » : dégradés arrondis (`relief` dans `compagnon-commun.js`), reflets sur la tête et le ventre, ombre douce au sol.
- **Menu admin** (testeurs, lien « 🔒 Admin » en bas de l'onglet ⚙️ Réglages) : protégé par un mot de passe dont seule l'empreinte est publiée
  (`ADMIN` dans `commun.js` : PBKDF2-SHA256, sel `desdale-admin-v1`, 150 000 itérations ; déverrouillage gardé dans `desdale-admin`).
  Comme le code d'accès, le mot de passe n'apparaît **jamais** dans le dépôt. Contient : réussir un défi, recevoir une clé, +50 ⭐,
  remplir les besoins, effacer défis/coupes/pièces, « Tout remettre à zéro »
  (efface toutes les clés `compagnon-*`), Verrouiller. « Adopter un autre compagnon » (étoiles, objets, coupes et maison gardés)
  reste pour tous, dans l'onglet ⚙️ Réglages (ex-onglet ⭐ : gains d'étoiles, journal) au-dessus du lien Admin.
- **Petits mots** (`CP.demarrerVeille`, lancé par `salon-global.js` sur toutes les pages) : tant que l'appli est ouverte, une bulle
  avec son dessin (bonjour du jour, mot gentil ~toutes les 45 min, ou demande « j'ai faim / soif / un bain / un câlin » si un besoin
  est sous 30 %, avec « J'y vais »). Au plus 1 message / 20 min, une même demande / 3 h, rien de 21 h à 8 h. Appli en arrière-plan :
  notification du téléphone si autorisée (`notificationclick` dans `sw.js` rouvre `compagnon.html`). Réglages (onglet ⚙️) `compagnon-reglages`,
  état `compagnon-veille`. Pas de notification appli fermée (il faudrait un serveur de notifications).
- Achat : fenêtre de confirmation (solde, prix, reste) ; bouton grisé si le solde ne suffit pas.
- Besoins Repas, Eau, Toilette, Câlins (en %, baissent avec le temps réel : vides en 14 h, 12 h, 40 h, 20 h). **Il ne meurt jamais** :
  il devient triste et le dit. **Signes sur le dessin, combinables** (besoin sous 30 %, `CP.signes`) : air triste = manque de câlins
  seulement, langue tirée = soif, traits qui gargouillent de chaque côté du ventre = faim ; deux mouches qui tournent au-dessus de la tête = besoin d'un bain ; envoyés aux amis dans le résumé (`cp.s`). La nuit (21 h – 7 h) il dort ; neige à la fenêtre en hiver (décembre à février).
- **Jauge vide = étoiles perdues** (demandé par l'utilisateur, « un peu de piquant » ; `regler` / `surveiller` dans `compagnon-commun.js`) :
  dès qu'une jauge tombe à 0, alerte préalable (bulle avec « J'y vais », ou notification si l'appli est en arrière-plan, même si les petits mots
  sont coupés) ; une heure plus tard, s'il y a toujours une jauge vide, −1 ⭐, puis −1 ⭐ par heure tant qu'une jauge reste vide.
  Pause la nuit (21 h – 8 h). Compté aussi pendant que l'appli était fermée (au retour) et avant chaque soin ; jamais sous 0 ⭐.
  `surveiller` tourne toutes les minutes sur toutes les pages (`demarrerVeille`). État `compagnon-penalite` ({ compte, reste, alerte }).
  Onglet Soins : « −1 ⭐ par heure » sous une jauge vide, et la règle rappelée sous les jauges.
- Tâches du jour : nourrir 2 fois, eau, 3 câlins, une partie avec des amis → +3 ⭐ ; +10 ⭐ tous les 7 jours de suite. 10 ⭐ offertes à l'adoption.
- Étoiles des jeux (`Etoiles.finDePartie`, une fois par partie) : à plusieurs +5 victoire / +2 partie ; seul +2 victoire ; Yams solo +2.
  **Plafond : 30 ⭐ par jour en jouant** (`compagnon-gains-jeux`) ; au-delà la partie compte pour les tâches mais ne rapporte rien.
  Branché dans **tous** les jeux, Brilliant compris (`recompenserFin`, partie solo +2 comme le Yams). Une partie à plusieurs compte pour la tâche
  du jour et les défis **gagnée ou perdue** (seule la fin de la *partie* compte, pas une manche). Tout est local au téléphone (prototype, sans serveur).
- **Record battu en solo** : +5 ⭐ (`Etoiles.record`, hors plafond), seulement s'il bat un record existant (pas le premier).
  Yams : meilleur score ; Bataille navale : flotte coulée en moins de tirs ; Brilliant : meilleur score du niveau ; Quatre en ligne (par niveau), Assaut (par format), Dominos/Triominos : **série de victoires d'affilée**
  contre l'ordinateur (`Etoiles.serie`, `compagnon-series`), récompensée une seule fois par série quand elle dépasse la meilleure.
- **Défis de la semaine** (`DEFIS` dans `compagnon-commun.js`) : chaque semaine (lundi → dimanche) un défi Facile, Moyen, Difficile,
  **les mêmes pour tout le monde** (tirés d'après le numéro de semaine, 6 par niveau, pas de répétition avant 6 semaines). Ils se lisent dans
  le journal des parties `compagnon-evenements` (`Etoiles.evenement`, appelé par `finDePartie` ; Yams solo et Quatre en ligne solo
  ajoutent le score / le niveau de l'ordinateur). Réussite : une **coupe** bronze / argent / or (non achetable, SVG `CP.coupe`) et
  +3 / +5 / +8 ⭐ hors plafond ; les trois de la semaine : une **clé** pour construire une pièce. `compagnon-defis` (semaine en cours),
  `compagnon-trophees` (coupes). Valider un défi ou recevoir une clé : menu admin.
- **Maison qui s'agrandit** (`compagnon-maison` : pièces, clés, pièce où il est, coupes sur l'étagère) : les pièces défilent de gauche à droite
  (glisser ou flèches). Salon (étagère de 3 coupes sous la fenêtre), Salle des trophées (offerte à la 1re coupe, deux vitrines),
  puis au choix avec une clé : Jardin, Chambre (il y dort la nuit), Cuisine, Salle de jeux. « Appeler » le fait venir dans la pièce affichée.
- **Vie dans la pièce** (`demarrerVie` / `agir` dans `compagnon.html`, toutes les 2,5 à 7 s, rien si l'appli n'est pas à l'écran) :
  il trottine d'un endroit à l'autre (entre 30 % et 70 % de la largeur, tourné dans le sens de la marche), regarde à gauche et à droite,
  remue la queue, penche la tête, bâille, ou se **couche** un moment (corps aplati, tête posée). Il dort couché. Une caresse le relève.
  Le dessin est découpé en groupes animés par la page : `queue`, `ailes` (dragon), `torse`, `tete-g`, `regard`, `baillement`
  (ailleurs, sur l'accueil ou chez les amis, il reste assis). Mouvements coupés si le téléphone demande moins d'animations.
- **Il se sert des objets** (`objetsDeLaPiece` / `faireAvec`) : il va jusqu'à l'objet, se tourne vers lui et dit une petite phrase (5 s).
  Salon : sieste dans son couchage (s'il en a un, yeux fermés + « z », une caresse le réveille), pousse sa balle, serre sa peluche,
  renifle la plante, regarde par la fenêtre (soleil, neige, étoiles), admire ses coupes. Cuisine : gamelle (« vide » s'il a faim),
  frigo. Jardin : sieste sous l'arbre, fleurs, papillon. Chambre : sieste sur le lit, nounours. Salle de jeux : lance les dés, regarde
  la grille. Trophées : admire. S'il a faim et qu'il y a une cuisine, il y part tout seul attendre près de sa gamelle.
- **Arranger la déco** (lien « ✏️ Arranger la déco » sous la maison) : on fait glisser chaque objet de déco acheté (couchage, plante,
  tableau, horloge, lampe, jouet) où l'on veut, et on le change de pièce (puces des pièces construites) ou on le range (désinstallé).
  Gardé dans `animal.deco[slot] = { piece, x, y }` (centre en % de la pièce) ; sans entrée : au salon, à sa place d'origine (`PLACES`).
  Le compagnon se sert des objets là où ils sont (sieste, balle qui roule du bon côté, peluche, plante). Les rideaux restent à la fenêtre.
  En visite, la déco de l'ami est montrée à ses places.
- **Visite chez un ami connecté** : bouton « 🏠 Visiter » dans la liste des présents du salon global (si l'ami a un compagnon) →
  `compagnon.html?visite=<id>`. Le salon global relaie un message à un seul membre (`RELAIS`, via l'hôte) : `MAISON?` → l'ami
  répond un instantané (animal, pièces, étagère, 12 dernières coupes ; `instantaneMaison`) et voit « 👀 X visite ta maison ».
  En visite : sa maison en lecture seule (pièces, vie, objets), pas d'onglets, **rien n'est enregistré** chez le visiteur
  (`sauver` / `ecrireMaison` / `majDefis` coupés). Câlin (bouton ou toucher l'animal) : `CALIN` → +20 % de câlins chez l'ami,
  au plus un toutes les 15 s par visiteur, bulle « ❤️ X a fait un câlin à … » (événement `cp-exterieur` pour mettre sa page à jour).
  Ami parti ou sans compagnon : « Personne n'ouvre… » (attente 12 s). API : `SalonGlobal.pret / membre / demander / envoyerA`.
- En-tête de la page : bouton « ‹ ▦ Jeux » comme dans les jeux, compteur d'étoiles avec une étoile dorée dessinée ; onglets Soins /
  Boutique / Défis / Réglages en icônes au trait **colorées** (cœur rose, sac bleu, coupe dorée, curseurs violets) sur une pastille
  teintée, plus vive sur l'onglet choisi (`ICONES_CP` dans `compagnon.html`).
- **Fêtes de l'année** (`FETES`, `CP.feteDu(t)`, `CP.prochaineFete(t)` dans `compagnon-commun.js`) : Nouvel an (27 déc. → 10 janv.),
  Chandeleur (26 janv. → 2 févr.), Saint-Valentin (3 → 15 févr.), Saint-Patrick (10 → 18 mars), Pâques (2 semaines avant → lundi, date calculée),
  Fête de la musique (14 → 21 juin), Été (22 juin → 31 août, sans jour J : pas de 14 juillet, jugé trop franco-français), Halloween (15 oct. → 2 nov.),
  Noël (1er → 26 déc.). Deux fêtes en même temps : celle dont le jour J est le plus proche. **Anniversaire du compagnon** (`ANNIVERSAIRE`,
  `CP.feteDu(t, ne)` avec la date d'adoption) : chaque année dès la 1re (2 jours avant → lendemain), prioritaire sur les autres fêtes,
  sa boutique (chapeau, ballons, gâteau), « J'ai N ans » le jour J et un cadeau de 10 ⭐ une fois par an (`compagnon-anniv`).
  Menu admin : « Voir une fête (essai) » (`compagnon-fete-essai`, sur ce téléphone). Pendant la période : rayon de saison en tête de la boutique (bannière avec la date de fin), articles marqués `fete`
  achetables **seulement à ce moment-là** et gardés ensuite (on les retrouve dans leur rayon habituel si on les possède) ; hors période,
  « Prochaine boutique de fête : … dès le … ». Chaque fête : chapeau / habit / collier dessinés en SVG, une déco (emplacement `fete-<id>`,
  place par défaut `pos` / `x` / `taille`, déplaçable avec « Arranger la déco », il s'en sert avec sa `phrase`) et une friandise.
  **Rappels discrets dans la maison** sans rien acheter : une guirlande propre à chaque fête dans les pièces intérieures (`CP.guirlande`, `MOTIFS` :
  étoiles et serpentins, crêpes et chandelles, cœurs, trèfles, œufs peints, notes, lampions, citrouilles et chauves-souris, guirlande lumineuse, ballons),
  quelques émojis par pièce (`ambiance`, animés doucement : flotte, balance, scintille…), un passage à la fenêtre (chauve-souris, feu
  d'artifice la nuit du Nouvel an), jardin enneigé avec bonhomme de neige à Noël. Petits mots de saison plus fréquents, vœux le jour J
  (2 févr., 14 févr., 17 mars, dimanche de Pâques, 21 juin, 31 oct., 25 déc., 1er janv., anniversaire) au premier message du jour.
- Accueil : carte « Mon compagnon » (son dessin, son humeur, les étoiles) fixée en haut avec « En ligne », au-dessus de la liste des jeux qui défile.
- Boutique : tête, cou (dont laisse et laisse de grande marque), habits (manteau d'hiver…), couchage (coussin → château), déco, friandises.

### Autres choix déjà tranchés
- Annonce vocale du tour : **seulement sur le téléphone du joueur concerné**, après 5 s sans lancer.
- Sons fabriqués par le code (pas de fichiers audio), sauf la Bataille navale : sons enregistrés **libres de droits**
  dans `bataille/sons/` (sources dans `bataille/sons/LICENCES.txt`), choisis par l'utilisateur : plouf (à l'eau), explosion (touché),
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
