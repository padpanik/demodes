# Worker « desdale-registre » (registre des joueurs)

- Adresse : https://desdale-registre.desdale.workers.dev (compte Cloudflare de l'utilisateur, offre gratuite).
- Rôle : garder la **fiche publique** de chaque joueur (pseudo, couleur, émoji, résumé du compagnon, parties par jeu, records),
  pour que chacun sache qui existe et compare les scores, même quand personne n'est connecté. Code côté appli : `Registre` dans `commun.js`,
  fenêtre « Mes amis » de l'accueil. **Activé par défaut** (choix de l'utilisateur), le joueur peut retirer sa fiche.
- Accès : en-tête `X-Desdale` = **clé de salon** (tirée du code d'accès, jamais publiée), comparée au secret `CLE`
  (le même que celui de `desdale-reseau`). Sans le code d'accès, ni lecture ni écriture. Origines autorisées dans `ORIGINES`.
- Stockage : base D1 `desdale-registre` (id `b55bb2f1-dd4d-4504-a9c7-8768f0587a8a`), liaison `DB`, table `joueurs` (voir `schema.sql`).
  Une ligne par personne (`Joueur.id`) ; scores en JSON dans la ligne : une publication = une seule ligne écrite.
- API :
  - `GET /r` : toutes les fiches vues depuis moins d'un an (500 au plus), sans les jetons.
  - `PUT /r/<id>` (`Authorization: Bearer <jeton>`, 32 hexadécimaux tirés par le téléphone, gardés dans `desdale-registre`, donc dans la sauvegarde) :
    8 Ko au plus, une fois par minute au plus (429). Le premier envoi réserve l'identifiant pour ce jeton (403 avec un autre).
  - `DELETE /r/<id>` (même jeton) : retirer sa fiche.
- Quotas gratuits D1 : 5 millions de lignes lues et 100 000 écrites par jour (au-delà : échec, pas de facture). L'appli publie au plus toutes les 2 min,
  seulement si la fiche a changé (30 s après une fin de partie, au passage en arrière-plan), et relit les fiches au plus toutes les 10 min (copie `desdale-registre-cache`).
- **Secret à poser par l'utilisateur** (jamais dans le dépôt) : `CLE`, dans le tableau de bord Cloudflare (Worker `desdale-registre`, variables et secrets)
  ou `npx wrangler secret put CLE` dans ce dossier. Sans lui, le Worker répond 401 et « Mes amis » affiche « Le registre ne reconnaît pas le code d'accès ».
- Redéployer (seulement si `worker.js` change) : API Cloudflare, `PUT /accounts/<compte>/workers/scripts/desdale-registre` en multipart :
  `metadata` = `{ main_module: "worker.js", compatibility_date: "2026-11-01", keep_bindings: ["secret_text"], bindings: [
  { type: "d1", name: "DB", id: "b55bb2f1-dd4d-4504-a9c7-8768f0587a8a" },
  { type: "plain_text", name: "ORIGINES", text: "https://demodes.desdale.workers.dev,https://padpanik.github.io" }] }`
  + `worker.js` (`application/javascript+module`). **`keep_bindings` garde le secret `CLE`.** Ou `npx wrangler deploy` dans ce dossier.
- Essai en local : `npx wrangler d1 execute desdale-registre --local --file=schema.sql`, `.dev.vars` avec `CLE=<clé de test>`,
  `ORIGINES` sur l'adresse de test, `npx wrangler dev --port 8790`, puis dans la page `localStorage['desdale-registre-adresse'] = '"http://localhost:8790"'`.
- Ce dossier n'est pas publié (`.assetsignore`, `_redirects`).
