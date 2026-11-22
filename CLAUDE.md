# Désdale : notes pour Claude

Application web de jeux entre amis (jeux de dés, de plateau, de lettres, compagnon virtuel, expéditions), jouée chacun sur son téléphone.
Sous-titre de l'accueil : « Jeux et aventures à partager entre amis » (plus seulement des jeux de dés, demandé par l'utilisateur).
Tout est en français : interface, commentaires du code, messages de commit, réponses à l'utilisateur.

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


## Fichiers

**Un dossier par jeu** (demandé par l'utilisateur, pour qu'un humain s'y retrouve) : `yams/index.html`, `lettres/index.html` + `lettres/lettres-regles.js`…
**À la racine, seulement le commun ou l'unique.** Chaque page rangée dans un dossier commence par `<base href="../">` : ses adresses relatives partent
de la racine, ses propres fichiers s'écrivent donc avec le dossier (`src="lettres/lettres-regles.js"`). Lien vers un jeu : `yams/` (pas `yams.html`).
`404.html` renvoie les anciennes adresses. Le tableau complet, avec le rôle détaillé de chaque fichier : **`notes/fichiers.md`**.

| Fichier | Rôle (en bref) |
|---|---|
| `index.html` | Code d'accès, puis accueil : carte de la Vallée en haut, fiches des jeux, sauvegarde, « Quoi de neuf ? ». |
| `commun.js` / `commun.css` | Base partagée : `VERSION`, `NOUVEAUTES`, `ACCES`, stockage, `Sauvegarde`, `Nuage`, `Registre`, sons, voix, geste retour, noms des ordinateurs. |
| `joueur.js` | Identité de la personne (`desdale-joueur-id`), chargé avant `commun.js` partout. |
| `fiche-jeu.js` | Composant commun `<fiche-jeu>`, `<reglages-base>`, `<abandon-solo>` (voir « Présentation commune »). |
| `icones-jeux.js`, `compagnons-jeu.js` | Icônes des jeux ; compagnons des joueurs en bas de l'écran de jeu. |
| `reseau.js` | `creerPeer(id)` : serveur de mise en relation de Désdale, repli sur le public. |
| `salon-global.js` | Salon global (présence, chat, profil). |
| `etoiles.js` | `Etoiles` (monnaie du compagnon) et `StatsParties`. |
| `meteo.js` | Météo de chez soi mêlée à la saison (4.33). |
| `qr.js` | QR code fait maison (bouton « Inviter »). |
| `sw.js` | Service worker : réseau d'abord, liste `FICHIERS`. |
| `serveur-cloudflare/`, `serveur-sauvegarde/`, `serveur-registre/` | Workers : mise en relation (Durable Object), sauvegarde chiffrée (KV), registre des joueurs (D1). Non publiés. |
| `brilliant/index.html` | Brilliant. Page autonome historique : **sa propre copie** de `ACCES`, `Sons`, `Voix`, `VERSION` (n'utilise pas `commun.js`). |
| `<jeu>/index.html` + `<jeu>-regles.js` | Yams, Backgammon, Assaut, Bataille navale, Gribouille, Petit bac, Agents secrets, Quatre en ligne, Dominos, Cieljo, Chinchón, Poker, Lettres croisées (+ `lettres-mots.txt`). Moteurs testables avec Node. |
| `joyaux/` | 7 piliers (dossier, clés `joyaux-*`, préfixe `jx` inchangés). |
| `dix/` (+ `questions/`, `outils/`) | Combien sur 10 ? (questions maison). |
| `expedition/` | Expédition, vue isométrique. |
| `donjon/` : `donjon-donnees.js`, `donjon-regles.js`, `donjon-dessins.js` (+ `donjon-simulation.js`, Node seulement) | Donjon des compagnons. |
| `vallee/` : `vallee-regles.js`, `vallee-pictos.js`, `vallee-dessins.js` (+ `vallee-test.js`) | La Vallée de Désdale. |
| `vallee/quartier.js` + `vallee/quartier.html` (+ `maquette-quartier.html`) | Le quartier des amis en isométrique (vraie page depuis 4.35). |
| `compagnon/` : `index.html`, `compagnon-commun.js`, `compagnon-meubles.js` (+ `maquette-maison.html`, `compagnon-3d.html` mis de côté) | Mon compagnon et sa maison isométrique (`CPM`). |
| `bataille/sons/` | Sons libres de droits (`LICENCES.txt`). |
| `appli-tension/`, `serveur-tension/`, `tension/` | **Hors Désdale** (relevé de tension), hébergé pareil. |
| `notes/` | Le détail de chaque grand chantier (non publié, voir « Tenir ces notes à jour »). |

Bibliothèques par CDN, versions figées : Vue **2.7.16** (Options API, `new Vue`), PeerJS **1.5.4**.
Pas d'étape de construction, pas de dépendance à ajouter.

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

## Accès privé

- `ACCES` (dans `commun.js` **et** dans `brilliant/index.html`) : PBKDF2-SHA256, sel `demodes-acces-v1`,
  150 000 itérations, 48 octets. Octets 0–31 : `EMPREINTE` publiée ; octets 32–39 : « clé de salon »,
  jamais publiée, gardée dans `localStorage['brillant-acces']`.
- La clé de salon entre dans l'identifiant réseau : `'dm-' + cléSalon + '-' + [jeu + '-'] + nomSimplifié`.
  Préfixes de jeu : aucun pour Brilliant, `yams`, `bg`, `as`, `bn`, `gb`, `pb`, `ag`, `ql`, `dm`, `lc`, `dj`, `jx`, `dx`, `cc`, `cj`, `pk`. Sans le bon code, impossible de joindre un salon.
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


## Stockage local (préfixe historique `brillant-` conservé volontairement)

Détail complet (sauvegarde, sauvegarde en ligne, registre, maisons et courrier, liste de toutes les clés par jeu) : **`notes/stockage.md`**.

- **Sauvegarde dans un fichier** : `Sauvegarde.creer()` / `Sauvegarde.restaurer` (`commun.js`) prennent toutes nos clés (préfixes dans `NOTRES`),
  **sauf** `brillant-acces`, `brillant-client-id`, `desdale-admin` et les parties en salon (`*-sauvegarde`, `*-prive`).
  **Nouvelle clé = l'ajouter à `NOTRES` si son préfixe est nouveau.**
- **Sauvegarde en ligne facultative** (`Nuage`, 3.46) : chiffrée sur le téléphone avec un code de récupération qui ne quitte pas le téléphone ;
  le Worker `desdale-sauvegarde` (KV) ne voit qu'un texte chiffré. Elle **ne remplace pas une sauvegarde locale** (choix de l'utilisateur, rester dans le gratuit).
- **Registre des joueurs** (`Registre`, 4.25) : une fiche publique par personne dans D1 (`desdale-registre`), activée par défaut, lue par « Mes amis »
  et le quartier ; la façade de la maison y est publiée (`profil.f`, 2 Ko au plus).
- Clés : `<jeu>-sauvegarde` (salon), `<jeu>-solo`, `<jeu>-dernier-salon`, `<jeu>-boss`… ; communes en `desdale-*` et `brillant-*` ;
  compagnon en `compagnon-*`, Vallée en `vallee-*`, Donjon en `donjon-*`.

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


### Les grands chantiers (détail dans `notes/`)

Ces jeux ont un long détail : règles choisies par l'utilisateur, structure du code, valeurs d'équilibrage, historique des versions.
**Avant de toucher à l'un d'eux, lire sa note en entier** (`notes/<jeu>.md`) : elle fait foi pour les règles comme pour le code.

- **Poker** (3.99, `poker/`, **`notes/poker.md`**) : Texas Hold'em sans limite d'abord, d'autres règles viendront (une règle = une entrée de
  `PK.VARIANTES`). Tournoi gratuit ou payant en ⭐ (mise fixée par le créateur de la table), cash game en poussières d'étoile ; ordinateurs à
  caractère et humeur ; compagnons en avatars.
- **Lettres croisées** (`lettres/`, **`notes/lettres.md`**) : version maison du jeu de lettres sur grille, 2 à 4 en salon ou seul contre 1 à 3 ordinateurs ;
  dictionnaire maison et vote des joueurs pour un mot inconnu.
- **7 piliers** (ex « Les 7 joyaux », `joyaux/`, **`notes/piliers.md`**) : version maison du draft de cartes et de cités ; souvent à 2, parfois à 4,
  des 🤖 complètent la table (3 cités au moins) ; version Duel.
- **Expédition** (`expedition/`, **`notes/expedition.md`**) : balade du compagnon en culture générale, lieux à thème (`EX.LIEUX`), gardiens,
  coffres, buvette, boss joués dans un autre jeu (Assaut, Bataille navale, Quatre en ligne…).
- **Donjon des compagnons** (`donjon/`, **`notes/donjon.md`**) : donjon à cartes en solo, 3 étages, plusieurs lieux à règle propre (dernier : Tour de l'horloge, 3.80),
  Grimoire, clé mythique, semaine. **Après toute retouche de chiffres : `node donjon/donjon-simulation.js 200 0`.**
  Boussole et idées en attente : carnet du projet claude.ai (`claude/carnet-desdale.md`).
- **Mon compagnon** (`compagnon/`, **`notes/compagnon.md`**) : animal virtuel, besoins, ⭐ gagnées en jouant ; maison en **isométrique au trait du Donjon**
  (pièces 6 × 6 en donnée, positions en cases, caméra par viewBox, kit `CPM` / `CP.MEUBLES`), panneau Arranger, boutique de Pipa (la maison seulement).
  Choix de l'utilisateur : document du projet `claude/maison-compagnon.md`.
- **La Vallée de Désdale** (3.48, `vallee/`, **`notes/vallee.md`**) : monde à explorer (village, forêt, marais, montagne, Terres générées), quêtes,
  récolte et fabrication, brouillard, saisons ; **quartier des amis** en isométrique derrière un portail (`vallee/quartier.html`, 4.35 : vrais amis
  du registre, façade publiée, Entrer / Lettre / Arranger). **Après toute retouche de la carte ou des quêtes : `node vallee/vallee-test.js`.**

**Choix encore à confirmer avec l'utilisateur** (pris par Claude) : prix du quartier (`QQ.PRIX`) ; visite hors ligne d'abord et lettres en phrases
toutes faites (4.27) ; règle des Braises des Forges (1 pour toi, 3 pour les monstres, au lieu de « Brûlure 2 à tous ») ; quelques valeurs par
défaut de Chinchón et Cieljo (voir leurs règles ci-dessus).

### Autres choix déjà tranchés
- Annonce vocale du tour : **seulement sur le téléphone du joueur concerné**, après 5 s sans lancer.
- Sons fabriqués par le code (pas de fichiers audio), sauf la Bataille navale : sons enregistrés **libres de droits**
  dans `bataille/sons/` (sources dans `bataille/sons/LICENCES.txt`), choisis par l'utilisateur : plouf (à l'eau), explosion (touché),
  et pour un coulé l'explosion **puis** la sirène. Sons fabriqués par le code en secours. Sons et vibrations réglables séparément.

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

## Tenir ces notes à jour (allégé le 22 novembre 2026, demandé par l'utilisateur : le fichier rechargé à chaque message coûtait trop cher)

- **CLAUDE.md ne garde que ce qui sert à chaque conversation** : contexte, conventions communes, mise en ligne, réseau, règles courtes des jeux,
  choix à respecter. Le garder **sous 60 Ko** : pas d'historique version par version ici, pas de mesures de simulation, pas de « signalé par… ».
- **Le détail d'un chantier va dans sa note** (`notes/<jeu>.md`) : structure du code, valeurs, historique des versions. Nouveau grand chantier =
  nouvelle note, et une ligne dans « Les grands chantiers ».
- `notes/` n'est pas publié (`.assetsignore`) ; ces notes ne sont pas chargées d'office : les lire (ou y chercher avec `grep`) au besoin.
