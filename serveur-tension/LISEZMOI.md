# Worker « tension » (relevé de tension, adresse à part)

- Adresse : https://tension.desdale.workers.dev
- Rôle : servir l'appli `appli-tension/` du dépôt sur une adresse à elle. Dans le site de Désdale, l'appli
  installée « Tension » écrasait l'appli Désdale sur le téléphone (une appli installée revendique toute son adresse).
- Fonctionnement : `worker.js` lit les fichiers chez le Worker « demodes » par une **liaison de service** `DEMODES`
  (un Worker ne peut pas appeler un autre `*.workers.dev` du même compte par `fetch`). Chaque push sur `main`
  met donc l'appli à jour sans redéployer ce Worker.
- Redéployer (seulement si `worker.js` change) : API Cloudflare, `PUT /accounts/<compte>/workers/scripts/tension`
  en multipart : `metadata` = `{ main_module: "worker.js", compatibility_date, bindings: [{ type: "service", name: "DEMODES", service: "demodes" }] }`
  + le fichier `worker.js` (`application/javascript+module`) ; puis `POST …/scripts/tension/subdomain` `{ enabled: true }`.
- Ce dossier n'est pas publié (`.assetsignore`, `_redirects`).
