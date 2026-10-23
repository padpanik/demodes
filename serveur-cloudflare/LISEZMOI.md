# Serveur de mise en relation de Désdale (Cloudflare)

**En service** : `https://desdale-reseau.desdale.workers.dev` (branché dans `reseau.js` depuis la version 2.40).
Chaque téléphone peut repasser sur le serveur public depuis l'onglet « Moi » du salon global (bouton « Utiliser le serveur public »).

Remplace le serveur public de PeerJS : les téléphones s'y retrouvent pour ouvrir ou rejoindre un salon, puis jouent
directement entre eux. Il distribue aussi les identifiants du relais Cloudflare (TURN), qui fait passer les parties
quand un réseau bloque la connexion directe (Wi-Fi d'hôtel, certaines 4G). Offre gratuite de Cloudflare.

- `worker.js` : le serveur (même protocole que le serveur officiel PeerJS, donc rien à changer dans les jeux).
- `wrangler.toml` : sa configuration. **Aucun secret dans ces fichiers** : ils se donnent avec `wrangler secret put`.

## Mise en place (une fois, depuis un ordinateur)

1. Créer un compte gratuit sur [cloudflare.com](https://dash.cloudflare.com/sign-up).
2. Installer [Node.js](https://nodejs.org) (version 20 ou plus), puis, dans ce dossier :
   ```
   npx wrangler login
   npx wrangler deploy
   ```
   L'adresse du serveur s'affiche, du genre `https://desdale-reseau.<ton-compte>.workers.dev`.
3. **La clé** (seuls ceux qui connaissent le code d'accès peuvent utiliser le serveur) : ouvrir Désdale sur l'ordinateur,
   taper le code d'accès, ouvrir la console du navigateur (F12) et taper `ACCES.cleSalon`. Puis :
   ```
   npx wrangler secret put CLE
   ```
   et coller la valeur (sans les guillemets). Ne jamais l'écrire dans le dépôt.
4. **Le relais** : dans le tableau de bord Cloudflare, rubrique *Realtime* → *TURN Server* → créer une clé.
   Garder son identifiant (*Turn Token ID*) et son jeton (*API Token*), puis :
   ```
   npx wrangler secret put TURN_KEY_ID
   npx wrangler secret put TURN_KEY_API_TOKEN
   ```
5. Vérifier dans un navigateur : `https://desdale-reseau.<ton-compte>.workers.dev/<clé>/id` renvoie un identifiant,
   et `…/<clé>/turn` une liste `iceServers` avec des adresses `turn.cloudflare.com`.

## Brancher Désdale

- **Pour tout le monde** : mettre l'adresse (sans `https://`) dans `RESEAU_DESDALE.hote` de `reseau.js`, puis publier.
- **Pour essayer sur un seul téléphone d'abord** : dans la console de ce navigateur,
  `localStorage.setItem('desdale-serveur', JSON.stringify({ hote: 'desdale-reseau.<ton-compte>.workers.dev' }))`
  (et `localStorage.removeItem('desdale-serveur')` pour revenir en arrière).

Si le serveur ne répond pas (deux échecs de suite), chaque téléphone repasse tout seul sur le serveur public pendant 5 minutes.

## Bon à savoir

- Le code d'accès change : refaire l'étape 3 (la clé change avec lui).
- Un téléphone silencieux depuis 15 s (veille, réseau perdu) libère son nom de salon : un hôte qui disparaît est
  remplacé bien plus vite qu'avec le serveur public (qui le garde environ une minute).
- Limites gratuites largement suffisantes pour un groupe d'amis : 100 000 requêtes par jour pour le serveur
  (les messages reçus comptent pour 1/20e, les battements de présence ne comptent pas), 1 000 Go par mois de relais.
- Pour le tester en local : `npx wrangler dev` avec un fichier `.dev.vars` contenant `CLE=…` (fichier à ne pas publier).
