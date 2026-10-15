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
| `assaut.html` + `assaut-regles.js` | Assaut (stratégie à pièces cachées, version maison du genre « Stratego », sans le nom ni les visuels de la marque). Solo contre l'ordinateur ; le jeu à deux est en cours. Moteur + ordinateur dans `assaut-regles.js` (testable avec Node). |
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
  Préfixes de jeu : aucun pour Brilliant, `yams`, `bg`. Sans le bon code, impossible de joindre un salon.
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

## Stockage local (préfixe historique `brillant-` conservé volontairement)

Communs : `brillant-acces`, `brillant-client-id`, `brillant-son`, `brillant-vibration`, `brillant-voix`,
`brillant-garder-ecran`, `brillant-entree-auto`, `brillant-salons` (liste des salons, partagée), `desdale-dernier-jeu`.
Brilliant : `brillant-sauvegarde-v1`, `brillant-dernier-salon`, `brillant-records(-dates)`, `brillant-classements`, `brillant-rejoindre-auto`.
Yams : `yams-sauvegarde`, `yams-dernier-salon`, `yams2-record`, `yams2-classements` (le « 2 » : barème maison).
Assaut : `assaut-sauvegarde`, `assaut-mode`, `assaut-memoire`, `assaut-stats`, `assaut-dispositions`.
Backgammon : `bg-sauvegarde`, `bg-dernier-salon`.

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
  Sèche : seulement au 1er lancer. Imposée : la case s'annonce **juste après le 1er lancer**, puis on peut relancer
  mais on doit s'y inscrire.
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
- Numérotation moderne : Maréchal 10 … Espion 1. Règles courantes (éclaireur qui file, démineur, espion contre maréchal,
  pas plus de 3 allers-retours). Placement au hasard puis échanges ; 3 dispositions enregistrables par format.
- Option « garder à l'écran les pièces adverses révélées » : **désactivée par défaut** (retenir fait partie du jeu).
- Solo contre l'ordinateur : il ne triche pas (il ne voit que ce qu'un joueur verrait).
- À deux (à venir) : la composition de chaque joueur ne quitte jamais son téléphone ; empreinte au départ, vérification à la fin.

### Autres choix déjà tranchés
- Annonce vocale du tour : **seulement sur le téléphone du joueur concerné**, après 5 s sans lancer.
- Sons fabriqués par le code (pas de fichiers audio) ; sons et vibrations réglables séparément.

## Tester

Les tests se font dans un navigateur sans tête (Playwright + Chromium, déjà installés dans l'environnement cloud),
en simulant plusieurs téléphones (contextes séparés, 360 × 800) :
1. Copier le site dans un dossier de test en remplaçant les URL des CDN par des copies locales de Vue et PeerJS,
   et en forçant PeerJS vers un serveur local (`peer` de npm, `127.0.0.1:9000`, chemin `/myapp`) :
   le serveur public `0.peerjs.com` n'est pas joignable depuis l'environnement cloud.
2. Servir le dossier en local (`python3 -m http.server`), saisir le code d'accès dans le test **sans l'écrire dans le dépôt**.
3. Piloter les pages (`document.getElementById('app').__vue__` donne accès à l'état Vue) : entrée en salon,
   coups, rechargement de page, fermeture d'un téléphone, reprise du salon.
4. Moteur du backgammon : tests Node directs sur `backgammon-regles.js` (positions piégeuses + parties aléatoires).
5. Toujours regarder une capture d'écran du rendu à 360 px de large avant de publier.
