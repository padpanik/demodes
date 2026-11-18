-- Base D1 « desdale-registre » : une fiche publique par personne (Joueur.id).
-- Les scores sont rangés en JSON dans la fiche : une publication = une seule ligne écrite,
-- et le classement se calcule sur le téléphone (quelques dizaines d'amis).
-- Plus tard, sans rien casser : table « traces » (cairns, messages des Terres), boss de la semaine…
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

-- 4.27 : la copie de chaque maison (visite quand l'ami n'est pas là), réécrite quand on range sa maison
CREATE TABLE IF NOT EXISTS maisons (
  id      TEXT PRIMARY KEY,     -- Joueur.id (même que joueurs.id)
  donnees TEXT NOT NULL,        -- JSON : compagnon (sans ses besoins), pièces et objets, coupes exposées
  vu      INTEGER NOT NULL
);
-- 4.27 : la boîte aux lettres (mot tout fait, câlin, cadeau de récolte), vidée par son propriétaire après lecture
CREATE TABLE IF NOT EXISTS lettres (
  n    INTEGER PRIMARY KEY AUTOINCREMENT,
  pour TEXT NOT NULL,           -- destinataire (joueurs.id)
  de   TEXT NOT NULL,           -- expéditeur (joueurs.id)
  quoi TEXT NOT NULL,           -- JSON : { mot, calin, cadeau: { r, n }, p }
  t    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS lettres_pour ON lettres (pour, n);
