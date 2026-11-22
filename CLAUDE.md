# Désdale : notes pour Claude

Application web de jeux et d'aventures entre amis (dés, plateau, cartes, lettres, compagnon virtuel, monde à explorer), jouée chacun sur son téléphone.
Tout est en français : interface, commentaires du code, messages de commit, réponses à l'utilisateur.
Sous-titre de l'accueil : « Jeux et aventures à partager entre amis » (choix de l'utilisateur).
Ce fichier ne garde que l'essentiel ; le détail est dans `notes/` (voir la fin). **Avant de toucher à un jeu ou à une partie commune, lire sa note.**

## Contexte à respecter

- **Usage strictement privé**, entre amis. Jeux du commerce (Brilliant, dont l'utilisateur a la boîte, et les autres) : **version maison**, sans nom de
  marque ni visuels officiels. `<meta name="robots" content="noindex…">` sur chaque page, pas de lien public, pas d'information personnelle dans le dépôt.
- **Code d'accès** : JAMAIS dans le dépôt, un commit ou un fichier de test. Seule son empreinte est publiée. Ne jamais le demander ni l'écrire.
  Même règle pour le mot de passe admin et les secrets des serveurs (`CLE`, clés TURN).
- **Pas de serveur de jeu** : site statique, les téléphones se parlent en WebRTC (PeerJS), mis en relation par le Worker `desdale-reseau`.
- **Hébergement Cloudflare** : Worker « demodes » à fichiers statiques relié au dépôt `padpanik/demodes` ; chaque push sur `main` est publié
  (`https://demodes.desdale.workers.dev`). `wrangler.jsonc` à la racine ; **`.assetsignore` indispensable** (sinon `.git` et tout le dépôt seraient publiés ;
  exclut `CLAUDE.md`, `notes/`, les serveurs…). `_headers` et `_redirects` lus par Cloudflare. Vérifier un déploiement par l'API Cloudflare
  (`workers/scripts/demodes/deployments`) : le site n'est pas joignable depuis l'environnement cloud. Ancienne adresse GitHub Pages et carte
  « Désdale déménage » : à retirer plus tard (détail dans `notes/commun.md`).
- Référence d'écran : Samsung S21, **360 × 800**. Tout doit tenir en portrait sans défilement sur l'onglet de jeu.
- Mise en ligne : commit et push **directement sur `main`** (accord de l'utilisateur).

## Fichiers

**Un dossier par jeu** (`yams/index.html`, `lettres/lettres-regles.js`…), à la racine seulement le commun. Chaque page en dossier commence par
`<base href="../">` : ses adresses partent de la racine (`src="lettres/lettres-regles.js"`). Lien vers un jeu : `yams/`. Tableau détaillé : `notes/fichiers.md`.

| Fichier | Rôle |
|---|---|
| `index.html` | Code d'accès, puis accueil (carte de la Vallée, fiches des jeux, sauvegarde, « Quoi de neuf ? »). |
| `commun.js` / `commun.css` | Base partagée : `VERSION`, `NOUVEAUTES`, `ACCES`, stockage, `Sauvegarde`, `Nuage`, `Registre`, sons, voix, geste retour. |
| `joueur.js` | Identité de la personne (`desdale-joueur-id`), chargé avant `commun.js`. |
| `fiche-jeu.js` | Composants communs `<fiche-jeu>`, `<reglages-base>`, `<abandon-solo>`. |
| `reseau.js`, `salon-global.js` | `creerPeer(id)` (serveur de Désdale, repli sur le public) ; salon global (présence, chat, profil). |
| `etoiles.js`, `meteo.js`, `qr.js`, `icones-jeux.js`, `compagnons-jeu.js` | Étoiles et statistiques ; météo et saison ; QR code ; icônes des jeux ; compagnons en jeu. |
| `sw.js` | Service worker, réseau d'abord, liste `FICHIERS`. |
| `serveur-cloudflare/`, `serveur-sauvegarde/`, `serveur-registre/` | Workers : mise en relation, sauvegarde chiffrée (KV), registre des joueurs (D1). Non publiés. |
| `brilliant/index.html` | Brilliant : page autonome, **sa propre copie** de `ACCES`, `Sons`, `Voix`, `VERSION`. |
| `<jeu>/index.html` + `<jeu>-regles.js` | Les autres jeux ; moteurs testables avec Node. `joyaux/` = 7 piliers, `dix/` = Combien sur 10 ?. |
| `donjon/`, `vallee/` (+ `quartier.html`), `compagnon/`, `expedition/` | Les grands chantiers (voir plus bas). |
| `appli-tension/`, `serveur-tension/`, `tension/` | **Hors Désdale** (relevé de tension), hébergé pareil. |

Vue **2.7.16** (Options API, `new Vue`) et PeerJS **1.5.4** par CDN, versions figées. Pas d'étape de construction, pas de dépendance à ajouter.

## À chaque mise en ligne

1. Augmenter `VERSION` (format `4.41`) dans **trois** fichiers : `commun.js`, `brilliant/index.html`, `sw.js`. Ajouter **une ligne très brève**
   en tête de `NOUVEAUTES` (`commun.js` : `[version, partie de l'appli, ce qui change]`), montrée une fois dans « Quoi de neuf ? ».
2. Nouveau fichier servi : l'ajouter à `FICHIERS` dans `sw.js` (avec son dossier).
3. Nouveau jeu : copier `lettres/index.html`, l'ajouter à la liste `jeux` d'`index.html` (clé de sauvegarde, `nouveau: true` pour le badge
   « Nouveau », à retirer quand il n'est plus récent ; porteurs actuels : Poker, Cieljo, Chinchón, Combien sur 10 ?).
4. `node --check` sur les scripts modifiés ; pas d'échappements doublés (`\\'`) après une modification par script.
5. Tester (capture à 360 × 800), commit + push sur `main`, puis vérifier la construction Cloudflare (1 à 2 minutes).

## Accès privé

- `ACCES` (dans `commun.js` **et** `brilliant/index.html`) : PBKDF2-SHA256, sel `demodes-acces-v1`, 150 000 itérations, 48 octets.
  Octets 0–31 : `EMPREINTE` publiée ; 32–39 : « clé de salon », jamais publiée, gardée dans `localStorage['brillant-acces']`.
- Identifiant réseau d'un salon : `'dm-' + cléSalon + '-' + [jeu + '-'] + nomSimplifié`. Préfixes : aucun pour Brilliant, `yams`, `bg`, `as`, `bn`,
  `gb`, `pb`, `ag`, `ql`, `dm`, `lc`, `dj`, `jx`, `dx`, `cc`, `cj`, `pk`.
- Changer le code = recalculer l'empreinte dans les deux fichiers ; tous les salons changent d'identifiant.

## Réseau et salons (détail et historique : `notes/commun.md`)

- **En étoile** : le premier arrivé ouvre le salon et en devient l'hôte, les suivants le rejoignent (`unavailable-id` → on rejoint).
  L'hôte est le **seul arbitre** : il vérifie chaque action et diffuse l'état. Battement toutes les 4 s, 15 s de silence = connexion perdue,
  reconnexion automatique. Chaque téléphone garde son état et se reconnecte seul après un rechargement.
- Hôte parti : selon le jeu, un joueur rouvre le salon avec sa copie, ou retour à la salle d'attente (mains gardées chez l'hôte).
  Joueur absent : attendu, ou l'hôte joue à sa place. Jeux à deux : un nouveau venu prend la place d'un absent.
- Garde-fous communs dans `commun.js` (copies dans Brilliant) : `veillerOuverture(peer)` (serveur muet 12 s = erreur, 4 essais) ;
  second « open » après `reconnect()` ignoré (`_ouvert`) ; salon oublié après 6 h ou 30 min après la fin (`oublierSalonsPerimes`) ;
  **un seul salon à la fois** (`fermerAutresSalons`). Pas d'entrée automatique : le dernier salon est prérempli.
- Même Wi-Fi isolé (hôtel, Wi-Fi invité) : passer un téléphone en 4G/5G. « Moi » du salon global : choix du serveur public en secours.

## Présentation commune des pages de jeu (demandée par l'utilisateur : « que tout le monde s'y retrouve »)

- **`<fiche-jeu>`** (`fiche-jeu.js`) : en-tête, 4 onglets à icône (Partie, Jouer, Réglages, Règles), slots `logo`, `partie`, `jouer`, `reglages`,
  `regles` (`infos` facultatif). Modifier l'en-tête ou les onglets = modifier **seulement** `fiche-jeu.js`. En-tête caché sur Jouer.
- **Onglet Partie** : bloc « À plusieurs » en haut, bloc « Seul » en bas ; options communes au-dessus. **`<abandon-solo>`** sous « Reprendre la partie » :
  tout nouveau jeu avec un solo qui se reprend l'utilise (la page écrit seulement `abandonnerSolo`). Options de règles en tête de l'onglet Règles.
- Réglages : `<reglages-base>` puis les réglages propres au jeu. **Pseudo unique choisi sur le portail** (`pseudoPortail()`, `pseudoPour()`), pas de champ pseudo dans les jeux.
- **Geste retour** géré dans `commun.js` pour toutes les pages (fenêtre « Retour à la Vallée / à l'accueil / Rester ici ») : rien à faire dans un nouveau jeu.
  Sur l'accueil, le retour ferme l'appli : **ne pas ajouter de `pushState` sur l'accueil**, les départs se font en `location.replace`.
- Toutes les pages Vue : `<div id="app" v-cloak>`. Penser **générique et commun** quand c'est possible (principe de l'utilisateur).

## Salon global (`salon-global.js`)

Salon fixe `'dm-' + cléSalon + '-global'` ouvert par chaque page à côté de celui du jeu : présence (où est chacun, bouton Rejoindre), résumé du compagnon,
mode invisible 👻, chat « Tous » et « Ce salon », état de la connexion sur la bulle 💬. Une page peut réserver une bande en bas : `SalonGlobal.reserverBas(px)`.

## Stockage local (préfixe historique `brillant-` conservé volontairement ; détail et liste des clés : `notes/stockage.md`)

- `Sauvegarde.creer()` / `restaurer` prennent toutes nos clés (préfixes dans `NOTRES`) sauf `brillant-acces`, `brillant-client-id`, `desdale-admin`
  et les parties en salon. **Nouvelle clé = l'ajouter à `NOTRES` si son préfixe est nouveau.**
- Sauvegarde en ligne facultative (`Nuage`) : chiffrée sur le téléphone, elle **ne remplace pas une sauvegarde locale** ; rester dans le gratuit.
- Registre des joueurs (`Registre`, D1) : une fiche publique par personne, activée par défaut ; la façade de la maison y est publiée.

## Les jeux (règles = choix de l'utilisateur, à ne pas changer sans lui)

**Règles complètes des jeux ci-dessous : `notes/regles.md`.** Les lire avant de toucher au jeu.
- Brilliant (règles du livret, 4 niveaux), Yams (**barème maison**), Backgammon (à deux), Assaut (pièces cachées, armée jamais envoyée en clair),
  Bataille navale (flotte gardée sur son téléphone, sons libres de droits), Gribouille, Petit bac, Agents secrets, Quatre en ligne,
  Dominos et Triominos, Chinchón, Cieljo, Combien sur 10 ? (questions maison).
- Sons fabriqués par le code (sauf la Bataille navale) ; annonce vocale du tour seulement sur le téléphone du joueur concerné.

**Les grands chantiers** (une note chacun, qui fait foi pour les règles comme pour le code) :
- **Poker** (`notes/poker.md`) : Texas Hold'em d'abord (une règle = une entrée de `PK.VARIANTES`), tournoi gratuit ou en ⭐, cash game en poussières.
- **Lettres croisées** (`notes/lettres.md`), **7 piliers** (`notes/piliers.md`), **Expédition** (`notes/expedition.md`).
- **Donjon des compagnons** (`notes/donjon.md`) : donjon à cartes en solo, lieux à règle propre. **Après toute retouche de chiffres :
  `node donjon/donjon-simulation.js 200 0`.** Idées en attente : `claude/carnet-desdale.md` (projet claude.ai).
- **Mon compagnon** (`notes/compagnon.md`) : maison en isométrique au trait du Donjon (pièces en donnée, positions en cases, caméra par viewBox, kit `CPM`),
  boutique de Pipa. Choix de l'utilisateur : `claude/maison-compagnon.md` (projet claude.ai).
- **La Vallée de Désdale** (`notes/vallee.md`) : monde ouvert, quêtes, récolte, saisons ; quartier des amis en isométrique derrière un portail
  (`vallee/quartier.html`). **Après toute retouche de la carte ou des quêtes : `node vallee/vallee-test.js`.**

**Choix pris par Claude, encore à confirmer avec l'utilisateur** : prix du quartier (`QQ.PRIX`) ; visite hors ligne d'abord et lettres en phrases
toutes faites (4.27) ; règle des Braises des Forges (1 pour toi, 3 pour les monstres, au lieu de « Brûlure 2 à tous ») ; quelques valeurs de Chinchón et Cieljo.

## Jeux envisagés et idées en attente (liste tenue à la demande de l'utilisateur ; retirer la ligne quand c'est fait)

- Jeux à ajouter (règles à voir avec l'utilisateur) : Schadenfreude, Serenity (notés le 28 octobre 2026).
- 7 piliers Duel : guildes et merveilles à deux faces, un boss d'expédition. Expédition : Conservatoire, Forêt enchantée, sorties en groupe.
- Mon compagnon : lui apprendre sa langue ; redessiner le renard et le dragon. Compagnons en jeu : à poser dans les autres jeux à plusieurs.
- Hébergement : porte Cloudflare Access ; retirer la carte « Désdale déménage » et l'origine GitHub Pages, rendre les icônes crème définitives.
- Donjon : traits de monstres (Blindé, Vampire, Enragé, Protecteur, Riposte), boss en deux phases, et la boussole du carnet du projet.
- Vallée : boss du monde de la semaine aux PV partagés, autres zones (collines, côte), découvertes, envies du compagnon ; carte du monde en vignette.
- Bulle 💬 sous les fenêtres ouvertes (proposé, pas encore demandé).

## Tester (méthode détaillée : `notes/commun.md`)

- Navigateur sans tête (Playwright + Chromium), contextes séparés à **360 × 800** pour simuler plusieurs téléphones ; site copié avec Vue et PeerJS en local,
  PeerJS vers un serveur local (`peer` de npm) ou `npx wrangler dev`. Servir avec `python3 -m http.server`.
- Sans le code d'accès : poser `brillant-acces` = `{ e: <EMPREINTE publiée>, s: 'testcle' }` dans le stockage de la page de test.
- État Vue : `document.getElementById('app').__vue__`. Moteurs : tests Node directs.
- **Toujours regarder une capture à 360 px de large avant de publier** (une seule, finale, suffit pour une petite correction).

## Tenir ces notes à jour

- **CLAUDE.md ne garde que ce qui sert à chaque conversation, et reste sous 25 Ko** : pas d'historique version par version, pas de mesures,
  pas de « signalé par… ». Une nouvelle règle commune s'y écrit en une ligne.
- **Le détail va dans `notes/`** : `commun.md` (hébergement, réseau, présentation, salon global, tests), `regles.md` (règles des jeux),
  `stockage.md`, `fichiers.md`, et une note par grand chantier. Nouveau grand chantier = nouvelle note, et une ligne ci-dessus.
- `notes/` n'est pas publié et n'est pas chargé d'office : le lire ou y chercher avec `grep` au besoin.
