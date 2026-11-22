# Désdale, détail : le commun (hébergement, réseau, présentation des pages, salon global, tests)

> Note de travail pour Claude, sortie de CLAUDE.md le 22 novembre 2026. Elle fait foi : la lire avant de toucher à ce qu'elle décrit, et y consigner le détail de chaque nouvelle version.

## Contexte à respecter

- **Usage strictement privé**, entre amis. Brilliant est un jeu commercial (Ravensburger) dont
  l'utilisateur possède la boîte : l'appli doit montrer une volonté de rester privée.
  Pas de référencement (`<meta name="robots" content="noindex…">` sur chaque page), pas de visuels
  officiels, pas de lien public, pas d'information personnelle dans le dépôt (il est public).
- **Code d'accès** : il n'apparaît JAMAIS dans le dépôt, ni dans un commit, ni dans un fichier de test.
  Seule son empreinte est publiée (voir « Accès privé »). Ne jamais le demander ni l'écrire en clair.
- **Pas de serveur de jeu** : hébergement statique (dépôt `padpanik/demodes`, branche `main`), d'abord GitHub Pages, maintenant Cloudflare (voir plus bas).
  Les téléphones se parlent directement (WebRTC via PeerJS), mis en relation par le petit serveur de Désdale sur Cloudflare
  (`serveur-cloudflare/`, repli automatique sur le serveur public de PeerJS).
- **Hébergement chez Cloudflare** (décidé par l'utilisateur en 2.56, pour pouvoir passer le dépôt en privé : GitHub Pages gratuit
  ne publie que les dépôts publics) : **Worker « demodes » à fichiers statiques** (créé par l'utilisateur depuis son tableau de bord, relié au dépôt :
  chaque push sur `main` est publié, `https://demodes.desdale.workers.dev`). Configuration : `wrangler.jsonc` à la racine (nom `demodes`, dossier `.`,
  `not_found_handling: 404-page`) et **`.assetsignore`** (indispensable : sans lui, `.git` et tout le dépôt seraient publiés ; exclut aussi CLAUDE.md,
  `serveur-cloudflare/`, `netlify.toml`, `wrangler.jsonc`). Vérifier après un changement : `wrangler deploy --dry-run` sur une copie, et compter les fichiers
  gardés (~55). `_headers` (noindex, `sw.js` toujours relu) et `_redirects` lus aussi par Cloudflare. Cloudflare renvoie `index.html` vers `/` :
  `sw.js` renvoie alors la redirection au lieu de la page redirigée (refusée en navigation). Vérifier un déploiement : API Cloudflare
  (`workers/scripts/demodes/deployments`, `versions/<id>` montre les en-têtes et redirections lus) ; le site lui-même n'est pas joignable depuis l'environnement cloud.
  **Déménagement des données** (localStorage propre à chaque adresse) : `DEMENAGEMENT` dans `commun.js` (`ouvert: true` depuis 2.57) affiche sur
  l'ancienne adresse (`padpanik.github.io`) la carte « 🚚 Désdale déménage » (`demenager` : `Sauvegarde.creer()` en base64 dans `#demenagement=…`,
  jamais envoyé au serveur) ; la nouvelle adresse la lit (`lireDemenagement`) et propose « ✓ Récupérer mes données » après le code d'accès.
  Le serveur de mise en relation accepte les deux origines (`ORIGINES`). Ensuite : dépôt passé en privé par l'utilisateur (l'ancien site s'éteint).
  **Deux applis à distinguer** (demandé par l'utilisateur, 2.58) : chez Cloudflare, `_redirects` réécrit (200) `manifest.webmanifest`, `apple-touch-icon.png`
  et `favicon.png` vers `manifest-cf.webmanifest` / `*-cf.png` : même logo sur **fond crème** ; `manifest.webmanifest` (servi seulement par GitHub Pages)
  s'appelle « Ancien Désdale ». Après la fin du déménagement, on pourra rendre ces icônes définitives.
  Porte Cloudflare Access : pas tout de suite (plus tard).
- L'utilisateur teste sur téléphone (référence d'écran : Samsung S21, 360 × 800 CSS px).
  Tout doit tenir en portrait sans défilement sur l'onglet de jeu.
- Mise en ligne : commit et push **directement sur `main`** (accord de l'utilisateur).

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
- **Serveur de mise en relation de Désdale** (choisi par l'utilisateur après l'étude « fiabiliser les échanges » : tout chez Cloudflare,
  gratuit, aucun port ouvert chez lui) : voir `reseau.js` et `serveur-cloudflare/`. **En service depuis 2.40** :
  `https://desdale-reseau.desdale.workers.dev` (compte Cloudflare de l'utilisateur, sous-domaine `desdale`, Worker `desdale-reseau`,
  clé TURN « desdale » dans Realtime ; déployé par le connecteur « Cloudflare API » : envoi multipart avec `body: FormData, rawBody: true`).
  Onglet « Moi » du salon global : serveur utilisé (🟢 Désdale / 🟠 secours / ⚪ public choisi) et bouton « Utiliser le serveur public »
  (`Reseau.forcerPublic`, `desdale-serveur = { public: true }`, la page se recharge) en cas de souci.
  Étude détaillée dans ses documents (option auto-hébergement Proxmox écartée pour l'instant).
- **Garde-fou « connexion… » bloquée** (`veillerOuverture(peer)` dans `commun.js`, copie dans `brilliant/index.html`, appelé après chaque
  `new Peer` des jeux et du salon global) : si le serveur de mise en relation ne répond pas en 12 s (ni « open » ni erreur), on déclenche
  une erreur `server-error` que chaque page traite comme les autres (nouvel essai, reprise, message). À l'entrée, le bouton affiche
  « Connexion au salon… essai 2/4 » (`entreeEnCours` = numéro d'essai), puis le message d'échec après le 4e essai (~50 s).
- **Salon abandonné = oublié** (demandé par l'utilisateur, harmonisé dans tous les jeux) : chaque sauvegarde de salon note `t` (dernière écriture)
  et `fini` (partie terminée) ; `salonPerime(sv)` / `oublierSalonsPerimes()` dans `commun.js` (lancé au chargement de chaque page, avant que
  l'accueil ou le jeu ne reprenne un salon ; copie dans `restaurer` de Brilliant) oublient un salon laissé **plus de 6 h**, ou dont la partie est
  **finie depuis 30 min** (sauvegarde sans `t` = ancienne, oubliée aussi). On retrouve alors le choix « À plusieurs » / « Seul ». Le Donjon, lui,
  quitte le salon dès qu'on « rentre » après un donjon fini. Une partie en cours se reconnecte toujours après un rechargement.
- **Coupure du serveur de mise en relation** (bug signalé sur le Yams en 2.48, corrigé partout en 2.49) : après `disconnected`, `peer.reconnect()`
  fait redire « open » au même peer ; l'hôte qui venait d'**ouvrir** le salon relançait alors une partie neuve (grille vide). Chaque gestionnaire
  `monPeer.on('open')` des jeux (hôte et client, Brilliant compris) et du salon global note `_ouvert` et ignore le second « open »
  (l'hôte repasse juste `connexion = 'ok'`). Vérifié : salon tenu seul, coupé 20 s, la partie continue ; salon à deux, hôte coupé, rien ne change.
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
  **Abandonner la partie solo, composant commun `<abandon-solo>`** (`fiche-jeu.js`, 3.74, demandé par l'utilisateur : « penser générique et commun quand c'est possible, pour ne pas y penser à chaque nouveau jeu ») : sous « Reprendre la partie » du bloc Seul, `<abandon-solo v-if="soloEnCours" @abandonner="abandonnerSolo">` (deux touchers : le second confirme, 4 s). La page écrit seulement `abandonnerSolo` (efface sa partie solo, sauvegarde comprise). En place dans Yams, Dominos, Chinchón, Cieljo, Lettres croisées, 7 piliers, Quatre en ligne, Assaut et Bataille navale (pour ces deux-là : en pleine partie = défaite comme « Abandonner » de l'écran de jeu, pendant le placement = annulée ; pas en mode boss). **Tout nouveau jeu avec un solo qui se reprend l'utilise.** Le salon a déjà son « Quitter » dans la carte du salon en cours. Brilliant n'a pas de partie solo à reprendre.
  Les **options de règles** (Bataille navale : navires qui se touchent, rejouer tant qu'on touche ; Assaut : garder les pièces adverses révélées)
  sont dans l'onglet **Règles**, en tête (« Options de la partie », choisies par l'hôte en salon), au-dessus du texte des règles.
- Réglages : `<reglages-base :son.sync :vibration.sync :voix.sync :ecran.sync>` (on ne passe que ceux du jeu ; chacun s'affiche
  seulement si le téléphone le permet), puis les réglages propres au jeu (apparence d'Assaut / Bataille navale) et le journal « Activité ».
- **Pseudo unique, choisi sur le portail** (profil du salon global, `desdale-profil`) : plus de champ pseudo dans les jeux, juste
  « Ton pseudo : X · ✏️ Changer » (`ouvrirProfilPortail` ouvre l'onglet « Moi » de la bulle 💬). `pseudoPortail()` / `pseudoPour(cléSauvegarde)`
  dans `commun.js` (copie dans `brilliant/index.html`) : dans un salon en cours, on garde le pseudo sous lequel on y est entré. Le salon global
  envoie l'événement `desdale-profil` quand on change de profil ; les pages le suivent tant qu'elles ne sont pas dans un salon.
  Sans pseudo, « Entrer dans le salon » ouvre le profil.
- **Geste « retour » du téléphone** (3.75, signalé par l'utilisateur : « les back via geste font rollback certains avancements ») : dans `commun.js` (copie dans `brilliant/index.html`), pour toutes les pages. (1) Une page revenue du **cache du navigateur** (`pageshow` avec `persisted`) est **rechargée** depuis le stockage, avant que ses propres écouteurs `pageshow` ne tournent (`stopImmediatePropagation`) : sinon son état en mémoire, plus ancien, pouvait réécrire des données plus récentes. (2) Sur toutes les pages sauf l'accueil (repérées par `<base href="../">`), le geste retour ouvre une petite fenêtre `.dsd-retour` : « ⛰️ Retour à la Vallée » (si l'on vient d'elle), « 🏠 Retour à l'accueil » (`location.replace`, l'historique ne s'allonge pas), « Rester ici ». L'entrée d'historique (`pushState`) n'est posée qu'au premier toucher (sinon Chrome la saute) et reposée après « Rester ici ». Un 2e retour pendant que la fenêtre est ouverte quitte vraiment la page. Rien à faire dans un nouveau jeu.
  **Sur l'accueil, le retour ferme l'appli** (4.13, demandé par l'utilisateur : « le retour sur l'accueil doit fermer l'application, pas revenir sur les états précédents ») : plus aucune page de Désdale ne s'empile dans l'historique. Dans le même bloc de `commun.js` (copie dans Brilliant), l'événement `navigate` de `window.navigation` attrape tout départ vers une autre page du site (lien, `location.href = …`) et le refait en `location.replace` (`partir`) ; sans cet outil, repli sur les clics de liens. Si l'entrée de garde est posée, `partir` la retire d'abord (`history.back`, puis `replace` au `popstate`, secours à 0,5 s), sinon elle resterait sous l'accueil. Toucher un bouton de la fenêtre `.dsd-retour` ne repose plus la garde (`poser` ignoré tant que la fenêtre est ouverte : c'était la cause du retour vers le jeu depuis l'accueil). L'accueil est donc toujours la première entrée de l'historique : le retour y quitte l'appli installée (dans un navigateur : la page d'avant Désdale). **Ne pas ajouter de `pushState` sur l'accueil.** Testé à 360 × 800 (`navigation.currentEntry.index` = 0 sur l'accueil après : lien, fenêtre de retour, bouton « Jeux » avec garde posée, Vallée → Donjon → accueil, Brilliant).
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
- **État de la connexion sur la bulle** (demandé par l'utilisateur, `etatConnexion`) : petit point vert en haut à gauche = connecté ; après 8 s sans
  connexion (pas de rôle, téléphone hors ligne, ou hôte coupé du serveur), pastille orange « ! » qui palpite et anneau orange ; le panneau dit pourquoi
  (« plus Internet », ou « nouvel essai tout seul… essaie la 4G »). Vérifié chaque seconde, événements `online` / `offline`.
- Interface injectée par le module : bulle 💬 (déplaçable le long du bord droit, pastille rouge = non lus, verte = connectés ; une page peut réserver une bande en bas avec `SalonGlobal.reserverBas(px)`, la bulle reste au-dessus),
  panneau en haut de l'écran (ajusté au clavier), carte « En ligne » sur l'accueil (`#sg-ici`). Pas de notification appli fermée.

## Tester

Les tests se font dans un navigateur sans tête (Playwright + Chromium, déjà installés dans l'environnement cloud),
en simulant plusieurs téléphones (contextes séparés, 360 × 800) :
1. Copier le site dans un dossier de test en remplaçant les URL des CDN par des copies locales de Vue et PeerJS,
   et en forçant PeerJS vers un serveur local (`peer` de npm, `127.0.0.1:9000`, chemin `/myapp`) :
   le serveur public `0.peerjs.com` n'est pas joignable depuis l'environnement cloud.
2. Servir le dossier en local (`python3 -m http.server`), saisir le code d'accès dans le test **sans l'écrire dans le dépôt**.
3. Piloter les pages (`document.getElementById('app').__vue__` donne accès à l'état Vue) : entrée en salon,
   coups, rechargement de page, fermeture d'un téléphone, reprise du salon.
4. Serveur Cloudflare : `npx wrangler dev` (wrangler installé dans le dossier de test, `.dev.vars` avec `CLE=` la clé de salon du code de test,
   `--var ORIGINES:http://127.0.0.1:8767`), puis `localStorage['desdale-serveur'] = {hote:'127.0.0.1', port:8787, secure:false}` dans les pages
   de test (`peer-local.js` laisse passer les options qui ont un `host`). Essais faits : protocole brut (WebSocket), deux téléphones en salon,
   hôte qui disparaît (repris en ~30 s), serveur coupé (repli sur le public).
5. Moteurs : tests Node directs sur `backgammon-regles.js` (positions piégeuses + parties aléatoires) et `bataille-regles.js` (flottes, ordinateur contre ordinateur, triche repérée).
   Vallée : `node vallee/vallee-test.js` après toute retouche de la carte ou des quêtes.
   Donjon : `node donjon/donjon-simulation.js 200 0` (taux de victoire par classe et lieux des défaites) après toute retouche de chiffres dans `donjon-donnees.js`.
   Navigateur : sans le code d'accès, il suffit de poser `brillant-acces` = `{ e: <EMPREINTE publiée>, s: 'testcle' }` dans le stockage de la page de test.
6. Toujours regarder une capture d'écran du rendu à 360 px de large avant de publier.

## À chaque mise en ligne

1. Augmenter `VERSION` (même numéro, format `1.23`, plus de « beta ») dans **trois** fichiers :
   `commun.js`, `brilliant/index.html`, `sw.js`.
   Ajouter **une ligne très brève** en tête de `NOUVEAUTES` (`commun.js` : `[version, jeu ou partie de l'appli, ce qui change]`) : l'accueil montre une fois
   la fenêtre « Quoi de neuf ? » (2.87, demandée par l'utilisateur ; `nouveautesAVoir` / `nouveautesVues`, clé `desdale-version-vue` ; 5 lignes au plus ;
   rien à la première installation ; un téléphone déjà utilisé sans cette clé voit les 5 dernières) ; 2.88 : la fenêtre annonce aussi, une fois par période,
   l'ouverture d'une **boutique de fête** du compagnon (`annonceFete` dans `index.html` : `CP.feteDu`, clé `desdale-fete-annoncee` = `<fête>-<année>`, seulement si l'on a un compagnon).
2. Nouveau fichier servi ? L'ajouter à `FICHIERS` dans `sw.js` (avec son dossier : `'./yams/'`, `'./lettres/lettres-regles.js'`).
3. Nouveau jeu ? Son dossier (`jeu/index.html` avec `<base href="../">`, copier `lettres/index.html`), puis l'ajouter à la liste `jeux` d'`index.html` (avec la clé de sa sauvegarde pour le badge « partie en cours », et `nouveau: true` : badge « Nouveau » pendant 10 jours après son premier affichage sur chaque téléphone, 3.02, demandé par l'utilisateur ; `estNouveau`, clé `desdale-nouveaux-vus`, gardée dans la sauvegarde ; retirer `nouveau: true` quand le jeu n'est plus récent, sinon un nouveau téléphone le verrait encore). Porteurs actuels : Poker, Cieljo, Chinchón, Combien sur 10 ?.
4. Vérifier la syntaxe des scripts (`node --check`) et l'absence d'échappements doublés (`\\'`) après une modification par script.
5. Tester (voir plus bas), puis commit + push sur `main`. Cloudflare (et GitHub Pages tant que le dépôt est public) met 1 à 2 minutes à publier.

## Jeux envisagés et idées en attente (liste tenue à la demande de l'utilisateur)

Ajouter ici chaque jeu ou idée que l'utilisateur veut garder pour plus tard ; retirer la ligne quand c'est fait.
Rappel pour un jeu du commerce : version maison, sans le nom de la marque ni ses visuels (appli privée entre amis).

**Jeux à ajouter** (règles et nombre de joueurs à voir avec l'utilisateur au moment de s'y mettre) :
- Schadenfreude (noté le 28 octobre 2026)
- Serenity (noté le 28 octobre 2026)

**Idées déjà évoquées** :
- 7 piliers, Duel : guildes et merveilles à deux faces ; un boss d'expédition sur ce jeu.
- Expédition : lieux annoncés « Bientôt » (Conservatoire, Forêt enchantée), sorties en groupe.
- Mon compagnon : lui apprendre sa langue pas à pas ; redessiner les autres animaux comme le renard et le dragon.
- Compagnons en jeu (`compagnons-jeu.js`) : seulement dans Lettres croisées pour l'instant, à poser dans les autres jeux à plusieurs.
- Hébergement : porte Cloudflare Access ; après le déménagement, retirer la carte « Désdale déménage », l'origine GitHub Pages et rendre les icônes crème définitives.
- Donjon : **boussole et idées en attente** (cartes de lieu, préparation à l'entrée, carrefour, Grimoire étendu) dans le carnet du projet claude.ai (`claude/carnet-desdale.md`, section 0, 13 novembre 2026) : un petit pas à la fois. Tous les lieux de la liste sont faits (dernier : Tour de l'horloge, 3.80). Mécaniques de monstres proposées à l'utilisateur le 13 novembre 2026 et pas encore faites : **traits** tirés sur les élites ou les rencontres (Blindé, Vampire, Enragé à mi-vie, Protecteur, Riposte) ; deux phases pour les boss existants. (Faits en 3.80 : vol de cartes, réaction au type de carte joué, remonter le temps.) **Règle des Braises des Forges** rendue asymétrique par Claude (1 pour toi, 3 pour les monstres) : à confirmer avec l'utilisateur.
- **La Vallée de Désdale** (phase 1 faite en 3.48, phase 2 récolte et fabrication en 3.50, phase 3 les amis et leur quartier en 3.51, le marais en 3.53, la montagne en 3.54, voir `notes/vallee.md`) : à venir : boss du monde de la semaine aux PV partagés (petit compteur sur le Worker de sauvegarde) ; (4) autres zones (collines, côte ; il faudra agrandir la carte) reprenant les lieux de l'Expédition et du Donjon, zones qui s'ouvrent en battant le boss voisin, découvertes (coffres cachés, panoramas, PNJ rares, carnet de collection), envies du compagnon (« j'aimerais voir la mer »).
- Bulle 💬 du salon global : la faire passer sous les fenêtres ouvertes (proposé, pas encore demandé ; dans le donjon en plein écran, elle est cachée et passe par le menu ☰).

### Autres choix déjà tranchés
- Annonce vocale du tour : **seulement sur le téléphone du joueur concerné**, après 5 s sans lancer.
- Sons fabriqués par le code (pas de fichiers audio), sauf la Bataille navale : sons enregistrés **libres de droits**
  dans `bataille/sons/` (sources dans `bataille/sons/LICENCES.txt`), choisis par l'utilisateur : plouf (à l'eau), explosion (touché),
  et pour un coulé l'explosion **puis** la sirène. Sons fabriqués par le code en secours. Sons et vibrations réglables séparément.

## Plein écran de l'appli installée (4.42)

Demandé par l'utilisateur : toute l'appli en plein écran, sans le message « faites glisser pour quitter » qui revenait sans cesse.
Cause : `requestFullscreen()` (Vallée, Quartier, Donjon, Poker) redemandé au toucher après chaque changement de page ou d'appli, et la sortie
volontaire quand les barres reviennent (Donjon 3.85) relançait le message au toucher suivant. Désormais les deux manifestes sont en
`"display": "fullscreen"` (`display_override` : fullscreen puis standalone) : Android cache lui-même ses barres pour l'appli installée.
`appliPleinEcran()` (`commun.js`) = `display-mode: fullscreen` sans plein écran du navigateur ; alors `PleinEcran.entrer`, `pleinEcranNavigateur`
(Donjon) et `pleinEcran` (Poker) ne font rien, et les options « barres du téléphone » sont masquées (`appliPlein`). Poker en paysage : verrou
d'orientation direct, ancien chemin si refusé. Accueil : `estInstallee` reconnaît aussi `fullscreen`. Dans Chrome (non installée), rien ne change.
Un téléphone qui a déjà l'appli peut mettre jusqu'à un jour à prendre le nouveau manifeste ; sinon, la désinstaller et la réinstaller.
