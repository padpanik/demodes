# Worker « desdale-sauvegarde » (sauvegarde en ligne facultative)

- Adresse : https://desdale-sauvegarde.desdale.workers.dev (compte Cloudflare de l'utilisateur, offre gratuite).
- Rôle : garder la dernière sauvegarde **chiffrée** de chaque joueur qui a activé l'option dans « Ma sauvegarde ».
  Le téléphone chiffre tout (AES-GCM) avec une clé tirée de son **code de récupération** (20 signes, PBKDF2-SHA256,
  sel `desdale-nuage-v1`, 150 000 itérations : 16 octets d'identifiant, 16 octets de jeton, 32 octets de clé).
  Le Worker ne voit qu'un texte illisible, ni le code, ni la clé. Code côté appli : `Nuage` dans `commun.js`.
- Stockage : espace KV `desdale-sauvegardes` (id `3fd30555ec48415eb41b0ec2e6dd388d`), liaison `SAUVEGARDES`.
  Une entrée par joueur : clé = identifiant, valeur = paquet `{ v: 1, z, iv, d }`, métadonnées `{ j: empreinte du jeton, t }`.
- API (en-tête `Authorization: Bearer <jeton>`, origines autorisées dans `ORIGINES` seulement) :
  `GET /s/<id>` (404 si absente), `PUT /s/<id>` (1 Mo au plus, au plus un envoi par minute, sinon 429),
  `DELETE /s/<id>`. Le premier envoi « réserve » l'identifiant pour ce jeton (403 avec un autre jeton).
- Quotas gratuits KV : 100 000 lectures et 1 000 écritures par jour ; au-delà, les opérations échouent (pas de facturation
  sur l'offre gratuite). L'appli n'envoie qu'au plus toutes les 15 min, et seulement si quelque chose a changé.
- Redéployer (seulement si `worker.js` change) : API Cloudflare, `PUT /accounts/<compte>/workers/scripts/desdale-sauvegarde`
  en multipart : `metadata` = `{ main_module: "worker.js", compatibility_date: "2026-11-01", bindings: [
  { type: "kv_namespace", name: "SAUVEGARDES", namespace_id: "3fd30555ec48415eb41b0ec2e6dd388d" },
  { type: "plain_text", name: "ORIGINES", text: "https://demodes.desdale.workers.dev,https://padpanik.github.io" }] }`
  + `worker.js` (`application/javascript+module`) ; puis `POST …/scripts/desdale-sauvegarde/subdomain` `{ enabled: true }`.
  Ou `npx wrangler deploy` dans ce dossier.
- Essai en local : `npx wrangler dev --port 8790` avec `ORIGINES = "http://localhost:8765"`, puis dans la page de test
  `localStorage['desdale-nuage-adresse'] = '"http://127.0.0.1:8790"'`.
- Ce dossier n'est pas publié (`.assetsignore`, `_redirects`).
