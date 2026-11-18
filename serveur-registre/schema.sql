-- Base D1 « desdale-registre » : une fiche publique par personne (Joueur.id).
-- Les scores sont rangés en JSON dans la fiche : une publication = une seule ligne écrite,
-- et le classement se calcule sur le téléphone (quelques dizaines d'amis).
-- Plus tard, sans rien casser : tables « traces » (cairns, messages des Terres), « facades » (quartier des voisins)…
CREATE TABLE IF NOT EXISTS joueurs (
  id     TEXT PRIMARY KEY,      -- Joueur.id (la personne, suit la sauvegarde)
  jeton  TEXT NOT NULL,         -- empreinte du jeton d'écriture (le 1er envoi réserve l'identifiant)
  pseudo TEXT NOT NULL,
  profil TEXT NOT NULL,         -- JSON : couleur, émoji, résumé du compagnon
  scores TEXT NOT NULL,         -- JSON : { clé: { v, d } } (parties par jeu, records)
  vu     INTEGER NOT NULL,      -- dernière publication (ms)
  cree   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS joueurs_vu ON joueurs (vu);
