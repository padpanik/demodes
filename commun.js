// ================== DÉSDALE : BASE COMMUNE À TOUS LES JEUX ==================
// Chargé par l'écran de choix (index.html) et par les jeux (yams/index.html…).
// Les clés de stockage gardent l'ancien préfixe "brillant-" : les réglages déjà faits sont conservés.

// Numéro de version affiché (à augmenter à chaque mise en ligne, avec brilliant/index.html et sw.js)
const VERSION = '3.80';

// ---------- Nouveautés (2.87, demandé par l'utilisateur) ----------
// Une ligne très brève par mise en ligne (la plus récente en haut) : l'accueil les montre une seule fois, dans une petite fenêtre,
// à qui n'a pas encore vu cette version. [version, jeu ou partie de l'appli, ce qui change]
const NOUVEAUTES = [
  ['3.80', 'Donjon', 'La Tour de l\'horloge à l\'étage 3 : 4 ⚡ mais 4 cartes, des monstres qui volent tes cartes ou remontent le temps.'],
  ['3.79', 'Donjon', 'Les Forges à l\'étage 3, un boss en deux phases, et un choix des reliques plus clair en fin de donjon.'],
  ['3.78', 'Donjon', 'Onglet Partie rangé : tout pour partir en haut, Ma semaine et Mon héros en tuiles.'],
  ['3.77', 'Vallée', 'Hutte et établi : « Il manque » montre les vrais dessins des ingrédients.'],
  ['3.75', 'Toute l\'appli', 'Le geste retour du téléphone propose l\'accueil au lieu de revenir en arrière et de perdre une avancée.'],
  ['3.74', 'Jeux', 'Onglet Partie : bouton « Abandonner la partie en cours » pour le jeu seul, le même partout.'],
  ['3.73', 'Yams', 'Bouton pour abandonner la partie (seul) ou quitter le salon, en haut de l\'écran de jeu.'],
  ['3.72', 'Donjon', 'Le bouton Fin du tour annonce l\'armure de la Cape de voyage et du Cœur de pierre.'],
  ['3.71', 'Les Terres', 'Sanctuaire au boss de la semaine, composants rares, et le Grimoire : cartes rares pour le Donjon.'],
  ['3.70', 'La Vallée', 'La carte entière suit quand on passe la Porte des brumes.'],
  ['3.69', 'La Vallée', 'Les Terres ont un nom à chaque saison ; le titre ne cache plus la carte.'],
  ['3.68', 'La Vallée', 'Menu : tuile « Accueil de Désdale » ; Discuter passe dans Options.'],
  ['3.67', 'La Vallée', 'Menu ☰ en tuiles dessinées ; son, croix et plein écran rangés dans Options.'],
  ['3.66', 'La Vallée', 'Mon livre des trésors (menu ☰) : tous les souvenirs trouvés, et des indices pour ceux qui restent.'],
  ['3.65', 'Expédition', 'Nouveau campement dans les Terres : l\'Île aux trésors, questions de géographie et un boss aux Dominos.'],
  ['3.64', 'Donjon', 'Nouveau lieu à l\'étage 2 : la Bibliothèque interdite, où la 3e carte du tour est gratuite.'],
  ['3.63', 'Expédition', 'Nouveau campement dans les Terres : le Château fort, questions d\'histoire et un boss à l\'Assaut.'],
  ['3.62', 'La Vallée', 'Des icônes dessinées remplacent les émojis sur la carte, dans les menus et les fenêtres.'],
  ['3.61', 'Expédition', 'Les expéditions partent maintenant des campements des Terres de la saison, dans la Vallée.'],
  ['3.60', 'La Vallée', 'Deux failles du Donjon s\'ouvrent dans les Terres à chaque saison : un étage, un boss, une récompense.'],
  ['3.59', 'La Vallée', 'Les rumeurs du lundi : 3 trésors cachés chaque semaine dans les Terres, et ton carnet de voyage (menu ☰).'],
  ['3.58', 'La Vallée', 'Dans les Terres : des feux de camp à allumer pour voyager, une tour de guet, un hameau et sa cartographe ; la carte entière d\'un toucher (🗺️).'],
  ['3.57', 'La Vallée', 'La Porte des brumes, au bord du ruisseau : un monde nouveau à explorer à chaque saison.'],
  ['3.56', 'La Vallée', 'En changeant d\'écran, ton compagnon ne glisse plus d\'un bord à l\'autre.'],
  ['3.55', 'La Vallée', 'Les coulisses de la carte se préparent à un monde bien plus grand : rien ne change pour toi.'],
  ['3.54', 'La Vallée', 'La montagne, derrière la cabane de l\'ermite : bats le Yéti au Cieljo pour ouvrir le col, puis aide Gaspard aux alpages.'],
  ['3.53', 'La Vallée', 'Un marais au bout du bosquet : Bruno répare sa passerelle, Rainette la passeuse attend tes lucioles, et un coffre dort sur l\'îlot.'],
  ['3.52', 'La Vallée', 'En fonçant dans un ami, le menu ne se choisit plus tout seul ; deux sourires de plus dans les émotions.'],
  ['3.51', 'La Vallée', 'Tes amis connectés apparaissent dans la Vallée : salue-les, visite leur maison dans le nouveau quartier, descendez ensemble au Donjon.'],
  ['3.50', 'La Vallée', 'Récolte du bois, des pierres, des plantes et des cristaux ; fabrique de la déco, des fioles pour le Donjon et des outils (quête de Bruno).'],
  ['3.49', 'La Vallée', 'Habillée comme le Donjon (lanternes, torches, pavés) ; un toucher bref sur la croix fait un pas.'],
  ['3.48', 'La Vallée', 'Nouveau : la Vallée de Désdale ! Promène-toi avec ton compagnon, aide les habitants du village, et descends au Donjon par la crypte.'],
  ['3.47', 'Donjon', 'Nouvelles cartes 💫 Assommer (le monstre perd son prochain coup) et 📌 Prévoyance (garder sa main), relique 🔖 Marque-page.'],
  ['3.46', 'Ma sauvegarde', 'Sauvegarde en ligne facultative, chiffrée sur ton téléphone avec ton code de récupération.'],
  ['3.45', 'Ma sauvegarde', '« Envoyer le fichier… » fonctionne aussi sur Android (sinon, le fichier est téléchargé).'],
  ['3.44', 'Donjon', 'Monstres de la Grotte de glace redessinés, plus détaillés.'],
  ['3.43', 'Donjon', 'Nouveau lieu au 2e étage : la Grotte de glace ❄️ (une carte de ta main gèle à chaque tour, boss le Dragon de givre).'],
  ['3.42', 'Donjon', 'Nouveau lieu au 1er étage : la Rivière souterraine 🌊 (marée haute un tour sur deux, boss la Pieuvre). Les messages importants (coffre maudit, trouvailles…) restent à l\'écran jusqu\'à « OK ».'],
  ['3.41', 'Donjon', 'Un nouveau lieu au 1er étage, tiré au hasard : la Champignonnière 🍄 (6 monstres, boss le Grand Mycélium, règle « Spores » : garde de l\'armure).'],
  ['3.40', 'Donjon', 'Choisis ton chemin : le plan montre les pièces voisines, une pièce à risque par étage (défi, trésor piégé, coffre maudit) ; 12 événements et 16 reliques de plus.'],
  ['3.39', 'Donjon', 'Journal du combat détaillé : qui fait quoi sur qui et combien, dégâts en rouge, soins en vert, le reste en violet.'],
  ['3.38', 'Donjon', 'Main de 6 cartes et plus : le descriptif de chaque carte est de nouveau visible.'],
  ['3.37', 'Donjon', 'À plusieurs : les barres de vie des amis en haut du combat et à côté de la croix ; vibrations selon la force du coup reçu.'],
  ['3.36', 'Donjon', 'Combats dans un vrai décor (mur, sol, torches selon l\'étage), monstres qui bougent, main de 6 cartes et plus lisible, marchand, autel et feu redessinés.'],
  ['3.35', 'Mon compagnon', 'Boutique : 30 nouveaux articles, cabine d\'essayage, lunettes avec un chapeau, dessins retouchés.'],
  ['3.34', 'Donjon', 'Ma semaine : le plus haut niveau tenté (meilleur étage, boss vaincus, victoires, essais) et le dernier donjon.'],
  ['3.33', 'Donjon', 'À plusieurs, une bulle sur le héros d\'un ami qui choisit (butin, marchand, feu…) ou regarde ailleurs ; « Passer » le butin se confirme d\'un 2e toucher.'],
  ['3.32', 'Donjon', 'Voyant de liaison à plusieurs (vert, orange, rouge) avec le détail au toucher, et « Relancer la liaison » dans le menu.'],
  ['3.31', 'Donjon', 'Entrée en combat : une fenêtre à toucher avant de jouer, pour ne plus finir son tour par erreur avec le doigt encore sur la croix.'],
  ['3.30', 'Donjon', 'Le héros de la semaine : paquet, reliques et PV gardés d\'un donjon à l\'autre ; Héroïque et Mythique bien plus durs.'],
  ['3.29', 'Donjon', 'Ma semaine : difficultés à ouvrir, trophées et éclats gardés jusqu\'à dimanche.'],
  ['3.28', 'Donjon', 'Reconnexion plus sûre après un passage dans une autre appli ; plus de recherche Google au doigt appuyé.'],
  ['3.27', 'Donjon', 'Les coups annoncés des monstres affichent le même chiffre sur tous les téléphones.'],
  ['3.26', 'Donjon', 'À plusieurs : coups de zone moins violents, monstres à la taille du combat, petit soin après chaque victoire.'],
  ['3.25', 'Donjon', 'La difficulté reste affichée pendant l\'exploration et les combats ; plan plus dégagé.'],
  ['3.24', 'Donjon', 'Le péril devient la clé mythique, en Mythique seulement ; la Ruse moins forte à plusieurs.'],
  ['3.23', 'Donjon', 'Trois difficultés : Normal, Héroïque, Mythique, avec plus de poussières d\'étoile quand c\'est dur.'],
  ['3.22', 'Donjon', 'À plusieurs, les monstres sont plus solides et frappent plus fort.'],
  ['3.21', 'Donjon', 'Butin, clés et portes s\'annoncent à côté de la croix, plus sur la carte.'],
  ['3.20', 'Accueil', 'Le donjon a son entrée sous ton compagnon ; l\'Expédition se range comme les autres jeux.'],
  ['3.19', 'Donjon', 'Le bouton Quitter passe dans le menu ☰.'],
  ['3.18', 'Donjon', 'Le coup annoncé du boss n\'est plus coupé en haut de l\'écran.'],
  ['3.17', 'Donjon', 'Plan de l\'étage en entier dans un cadre, croix plus compacte.'],
  ['3.16', 'Donjon', 'Fiche du compagnon plus claire, tous les objets visibles, sac détaillé.'],
  ['3.15', 'Donjon', 'Plein écran avec le plan de l\'étage, pour l\'immersion.'],
  ['3.14', 'Donjon', 'Nouveau look : monstres dessinés, cartes en parchemin, torches.'],
  ['3.13', 'Donjon', 'Nouveau donjon : 3 étages, combats de cartes à énergie, butin, marchand et périls.'],
  ['3.12', 'Cieljo', 'Fin de manche : on voit d\'abord les grilles dévoilées, puis les scores.'],
  ['3.11', 'Cieljo', 'Une colonne identique révélée en fin de manche part aussi.'],
  ['3.10', 'Cieljo', 'Nouveau jeu de cartes : le plus petit total gagne, seul ou de 2 à 8.'],
  ['3.09', 'Combien sur 10 ?', '15 nouveaux sujets : 3 390 questions.'],
  ['3.08', 'Combien sur 10 ?', '17 nouveaux sujets : 3 240 questions.'],
  ['3.07', 'Combien sur 10 ?', '20 nouveaux sujets : 3 070 questions.'],
  ['3.06', 'Combien sur 10 ?', '41 nouveaux sujets : 2 870 questions.'],
  ['3.05', 'Combien sur 10 ?', '46 nouveaux sujets : 2 460 questions, et des corrections.'],
  ['3.04', 'Combien sur 10 ?', '55 nouveaux sujets : 2 000 questions au total.'],
  ['3.03', 'Accueil', 'Les nouveaux jeux passent en haut de la liste.'],
  ['3.02', 'Accueil', 'Le badge Nouveau reste 10 jours sur chaque téléphone.'],
  ['3.01', 'Combien sur 10 ?', 'Jugement annulable, explications du vrai ou faux, mise de 3 plus piégeuse.'],
  ['3.00', 'Chinchón', 'Nouveau jeu de cartes espagnol, seul ou de 2 à 4.'],
  ['2.99', 'Appli', 'Mode avion : l\'accueil et le bouton Jeux s\'ouvrent de nouveau.'],
  ['2.98', 'Combien sur 10 ?', 'Défis : points à cocher puis validation. Le compagnon sert de pion.'],
  ['2.97', 'Combien sur 10 ?', '31 sujets réécrits, niveaux 4 et 5 parfois plus durs, erreurs corrigées.'],
  ['2.96', 'Combien sur 10 ?', 'Questions refaites dans l\'esprit du jeu, challenges jusqu\'à 10 cases.'],
  ['2.95', 'Combien sur 10 ?', 'Bouton « question douteuse », finale en niveau 6 ou 7, 24 sujets plus décalés.'],
  ['2.94', 'Combien sur 10 ?', 'Niveaux 8 à 10 bien plus durs et 18 sujets rigolos en plus.'],
  ['2.93', 'Combien sur 10 ?', 'Challenges : on avance d\'une case par bonne réponse. Plateau sans route noire.'],
  ['2.92', 'Combien sur 10 ?', 'Nouveau plateau, deux fois plus de sujets, niveaux 8 à 10 plus durs, challenges lus à voix haute.'],
  ['2.91', 'Combien sur 10 ?', 'Nouveau plateau de nuit, et l\'équipe qui joue écoute la question sans la lire.'],
  ['2.90', 'Combien sur 10 ?', 'Chacun sur son téléphone en salon, plateau en chemin de cases rondes, questions plus drôles.'],
  ['2.89', 'Nouveau jeu', '« Combien sur 10 ? » : quiz en équipes, lu à voix haute, sur un seul téléphone (premier essai).'],
  ['2.88', 'Mon compagnon', '« Quoi de neuf ? » prévient aussi quand une boutique de fête ouvre (Noël dès le 1er décembre).'],
  ['2.87', 'Désdale', 'Cette petite fenêtre : un résumé de ce qui change à chaque mise à jour.'],
  ['2.86', 'Mon compagnon', 'Il va dans son panier, sa niche, son coussin ou son château : bouton « Au panier ! » dans la pièce.'],
  ['2.85', 'Lettres croisées', 'Le dictionnaire est maintenant la liste officielle (ODS).'],
  ['2.84', 'Lettres croisées', 'Nouveau niveau Confirmé, et « Mon lexique » pour accepter ou refuser un mot.'],
  ['2.83', 'Désdale', 'L\'appli s\'ouvre même avec une connexion faible ou sans réseau.'],
  ['2.82', '7 piliers', 'Classique : cartes et merveilles du jeu d\'origine, faces A et B.']
];
// Les nouveautés pas encore vues sur ce téléphone (5 au plus). Première installation : rien à montrer.
function nouveautesAVoir() {
  var vu = lireStockage('desdale-version-vue');
  if (!vu) {
    var dejaLa = lireStockage('desdale-profil') || lireStockage('compagnon-animal') || lireStockage('desdale-stats');
    if (!dejaLa) { ecrireStockage('desdale-version-vue', VERSION); return []; }
    vu = '0';
  }
  return NOUVEAUTES.filter(n => parseFloat(n[0]) > parseFloat(vu)).slice(0, 5);
}
function nouveautesVues() { ecrireStockage('desdale-version-vue', VERSION); }

// ---------- Stockage local ----------
function lireStockage(cle) {
  try { var t = localStorage.getItem(cle); return t ? JSON.parse(t) : null; } catch (e) { return null; }
}
function ecrireStockage(cle, val) {
  try { localStorage.setItem(cle, JSON.stringify(val)); } catch (e) { /* stockage indisponible */ }
}
function effacerStockage(cle) {
  try { localStorage.removeItem(cle); } catch (e) {}
}
function nouvelId() { return Math.random().toString(36).slice(2, 10); }

// Identité du joueur (joueur.js, chargé juste avant) : permet à l'hôte de reconnaître un joueur qui revient,
// et range classements et scores. Elle suit la sauvegarde d'un téléphone à l'autre (voir joueur.js).
var clientId = window.Joueur ? Joueur.id : lireStockage('brillant-client-id');
if (!clientId) { clientId = nouvelId() + nouvelId(); ecrireStockage('brillant-client-id', clientId); }

// ---------- Un seul salon à la fois ----------
// Chaque jeu garde en mémoire son salon en cours (et s'y reconnecte tout seul). Quand on entre dans un salon,
// on oublie ceux des autres jeux : sinon le téléphone peut rester accroché à une ancienne partie.
const SALONS_JEUX = { brilliant: 'brillant-sauvegarde-v1', yams: 'yams-sauvegarde', backgammon: 'bg-sauvegarde', assaut: 'assaut-sauvegarde', bataille: 'bataille-sauvegarde', gribouille: 'gribouille-sauvegarde', petitbac: 'petitbac-sauvegarde', agents: 'agents-sauvegarde', quatre: 'quatre-sauvegarde', domino: 'domino-sauvegarde', lettres: 'lettres-sauvegarde', donjon: 'donjon-sauvegarde', joyaux: 'joyaux-sauvegarde', dix: 'dix-sauvegarde', chinchon: 'chinchon-sauvegarde', cieljo: 'cieljo-sauvegarde' };
function oublierSalonDuJeu(jeu) {
  var cle = SALONS_JEUX[jeu], sv = lireStockage(cle);
  if (!sv || !sv.role) return false;
  if (jeu === 'brilliant') { ecrireStockage(cle, { pseudo: sv.pseudo }); return true; }   // Brilliant : grille de salon effacée, comme en quittant
  sv.role = null; sv.salon = ''; sv.pub = null; sv.pubHote = null; sv.salle = null; sv.jeuHote = null;
  if (!(sv.etat && sv.etat.solo)) sv.etat = null;
  ecrireStockage(cle, sv);
  return true;
}
// Salon abandonné (demandé par l'utilisateur) : laissé plus de 6 h, ou partie finie sans rien depuis 30 min, il n'est plus repris
// au retour : on retrouve le choix « À plusieurs » / « Seul ». Chaque jeu note dans sa sauvegarde t (dernière écriture) et fini.
const SALON_OUBLI = 6 * 3600000, SALON_FINI_OUBLI = 30 * 60000;
function salonPerime(sv) {
  if (!sv || !sv.role) return false;
  var age = Date.now() - (sv.t || 0);
  return age > SALON_OUBLI || (!!sv.fini && age > SALON_FINI_OUBLI);
}
function oublierSalonsPerimes() {
  Object.keys(SALONS_JEUX).forEach(j => { if (salonPerime(lireStockage(SALONS_JEUX[j]))) oublierSalonDuJeu(j); });
}
oublierSalonsPerimes();   // au chargement de chaque page, avant que l'accueil ou le jeu ne reprenne un salon
// ================== SAUVEGARDE (pour retrouver ses données sur un autre téléphone ou navigateur) ==================
// Un fichier JSON avec les données de Désdale de ce téléphone : compagnon, étoiles, maison, records, réglages, profil…
// Jamais dedans : la clé d'accès (il faut retaper le code sur le nouveau téléphone), l'identifiant propre à ce téléphone,
// le déverrouillage admin, et les parties en salon en cours (elles appartiennent à ce téléphone-ci).
// Déménagement de GitHub Pages vers Cloudflare (Worker « demodes ») : sur l'ancienne adresse, l'accueil propose d'emporter ses données
// (« ouvert » passe à true quand la nouvelle adresse est en ligne)
var DEMENAGEMENT = { ouvert: true, ancienHote: 'padpanik.github.io', nouvelle: 'https://demodes.desdale.workers.dev/' };

var Sauvegarde = (function () {
  var NOTRES = /^(brillant|desdale|compagnon|expedition|yams2?|bg|assaut|bataille|gribouille|petitbac|agents|quatre|domino|lettres|donjon|joyaux|dix|chinchon|cieljo|vallee)-/;
  var EXCLUES = ['brillant-acces', 'brillant-client-id', 'desdale-admin', 'desdale-nuage'];
  function gardee(k) { return NOTRES.test(k) && EXCLUES.indexOf(k) === -1 && !/-sauvegarde(-v1)?$/.test(k) && !/-prive$/.test(k); }
  function cles() { var l = []; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (gardee(k)) l.push(k); } } catch (e) {} return l.sort(); }
  function creer() {
    var d = {};
    cles().forEach(function (k) { d[k] = localStorage.getItem(k); });
    return { app: 'desdale', format: 1, version: VERSION, date: new Date().toISOString(), donnees: d };
  }
  // Ce que contient une sauvegarde, en clair (pour la fenêtre de confirmation)
  function resume(s) {
    var d = s.donnees || {}, lire = function (k) { try { return JSON.parse(d[k]); } catch (e) { return null; } };
    var a = lire('compagnon-animal'), p = lire('desdale-profil');
    return { date: s.date, compagnon: a && a.nom ? a.nom : '', etoiles: lire('compagnon-etoiles') || 0, pseudo: p && p.pseudo ? p.pseudo : '', nb: Object.keys(d).length };
  }
  function lireFichier(texte) {
    var s = JSON.parse(texte);
    if (!s || s.app !== 'desdale' || typeof s.donnees !== 'object') throw new Error('Ce fichier n\'est pas une sauvegarde de Désdale.');
    return s;
  }
  // Remplace les données de ce téléphone par celles de la sauvegarde
  function restaurer(s) {
    cles().forEach(function (k) { localStorage.removeItem(k); });
    var n = 0;
    Object.keys(s.donnees).forEach(function (k) { if (gardee(k) && typeof s.donnees[k] === 'string') { localStorage.setItem(k, s.donnees[k]); n++; } });
    return n;
  }
  return { creer: creer, resume: resume, lireFichier: lireFichier, restaurer: restaurer, gardee: gardee };
})();

// ================== SAUVEGARDE EN LIGNE (facultative) ==================
// Choisie par le joueur dans « Ma sauvegarde ». Le joueur reste maître de ses données :
// - tout est chiffré sur le téléphone (AES-GCM) avec une clé tirée de son code de récupération ;
//   le serveur (Worker « desdale-sauvegarde », voir serveur-sauvegarde/) ne garde qu'un texte illisible ;
// - le code n'est gardé que sur ce téléphone (`desdale-nuage`, jamais dans le fichier de sauvegarde) ;
// - il peut tout arrêter et effacer la copie en ligne quand il veut.
// Envoi automatique à l'ouverture d'une page et quand l'appli passe en arrière-plan,
// au plus toutes les 15 min et seulement si quelque chose a changé (quota gratuit de Cloudflare : 1 000 écritures par jour).
// Ne remplace pas une sauvegarde locale (fichier) : le serveur peut perdre ses données ou fermer.
var Nuage = (function () {
  var ADRESSE = 'https://desdale-sauvegarde.desdale.workers.dev';
  var CLE = 'desdale-nuage';                       // { code, actif, dernier, emp, erreur }
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 signes, sans I, O, 0, 1 (faciles à confondre)
  var INTERVALLE = 15 * 60 * 1000;
  var derives = {}, enCours = null;

  function adresse() { var a = lireStockage('desdale-nuage-adresse'); return typeof a === 'string' && a ? a : ADRESSE; }   // essais : serveur local
  function etat() { return lireStockage(CLE) || {}; }
  function ecrire(e) { ecrireStockage(CLE, e); try { window.dispatchEvent(new CustomEvent('desdale-nuage')); } catch (x) {} }
  function possible() { return !!(window.crypto && crypto.subtle && window.fetch && window.TextEncoder); }

  // Code de récupération : 20 signes (100 bits), lus par groupes de 5
  function nouveauCode() {
    var o = crypto.getRandomValues(new Uint8Array(20)), c = '';
    for (var i = 0; i < 20; i++) c += ALPHABET[o[i] & 31];
    return formater(c);
  }
  function nettoyer(code) {
    return String(code || '').toUpperCase().split('').filter(function (x) { return ALPHABET.indexOf(x) !== -1; }).join('');
  }
  function formater(c) { c = nettoyer(c); return (c.match(/.{1,5}/g) || []).join('-'); }
  function codeValide(code) { return nettoyer(code).length === 20; }

  function hex(b) { return Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  function b64(octets) { var s = '', b = new Uint8Array(octets); for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
  function deb64(t) { var s = atob(t), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }

  // Du code : identifiant (où est rangée la sauvegarde), jeton (droit d'écrire) et clé de chiffrement
  function deriver(code) {
    var c = nettoyer(code);
    if (derives[c]) return derives[c];
    var enc = new TextEncoder();
    derives[c] = crypto.subtle.importKey('raw', enc.encode(c), 'PBKDF2', false, ['deriveBits'])
      .then(function (k) { return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('desdale-nuage-v1'), iterations: 150000 }, k, 512); })
      .then(function (bits) {
        var b = new Uint8Array(bits);
        return crypto.subtle.importKey('raw', b.slice(32, 64), 'AES-GCM', false, ['encrypt', 'decrypt']).then(function (cle) {
          return { id: hex(b.slice(0, 16)), jeton: hex(b.slice(16, 32)), cle: cle };
        });
      });
    derives[c].catch(function () { delete derives[c]; });
    return derives[c];
  }

  // Compression si le navigateur sait faire (Chrome 80+, Safari 16.4+)
  function compresser(texte) {
    if (!window.CompressionStream) return Promise.resolve({ z: 0, o: new TextEncoder().encode(texte) });
    var flux = new Blob([texte]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Response(flux).arrayBuffer().then(function (a) { return { z: 1, o: new Uint8Array(a) }; });
  }
  function decompresser(octets, z) {
    if (!z) return Promise.resolve(new TextDecoder().decode(octets));
    if (!window.DecompressionStream) return Promise.reject(new Error('Ce navigateur ne sait pas lire cette sauvegarde.'));
    var flux = new Blob([octets]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(flux).text();
  }
  function empreinte(texte) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte)).then(function (b) { return hex(new Uint8Array(b)).slice(0, 24); });
  }

  function requete(methode, d, corps) {
    return fetch(adresse() + '/s/' + d.id, {
      method: methode, cache: 'no-store',
      headers: corps ? { 'Authorization': 'Bearer ' + d.jeton, 'Content-Type': 'application/json' } : { 'Authorization': 'Bearer ' + d.jeton },
      body: corps
    }).then(function (r) {
      if (r.ok) return r.text();
      var e = new Error(r.status === 404 ? 'Aucune sauvegarde en ligne pour ce code.' : r.status === 403 ? 'Ce code ne donne pas accès à cette sauvegarde.'
        : r.status === 429 ? 'Envoi trop rapproché, nouvel essai plus tard.' : r.status === 413 ? 'Sauvegarde trop grande pour le serveur.' : 'Le serveur de sauvegarde ne répond pas (' + r.status + ').');
      e.statut = r.status; throw e;
    }, function () { throw new Error('Pas de connexion au serveur de sauvegarde.'); });
  }

  // Envoie la sauvegarde de ce téléphone. force = sans attendre les 15 min ni un changement.
  function envoyer(force) {
    var e = etat();
    if (!e.actif || !e.code || !possible()) return Promise.resolve(false);
    if (!force && e.dernier && Date.now() - e.dernier < INTERVALLE) return Promise.resolve(false);
    if (enCours) return enCours;
    var s = Sauvegarde.creer(), texte = JSON.stringify(s);
    enCours = empreinte(JSON.stringify(s.donnees)).then(function (emp) {
      if (!force && emp === e.emp) return false;          // rien n'a changé depuis le dernier envoi
      return deriver(e.code).then(function (d) {
        return compresser(texte).then(function (c) {
          var iv = crypto.getRandomValues(new Uint8Array(12));
          return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, d.cle, c.o).then(function (chiffre) {
            var paquet = JSON.stringify({ v: 1, z: c.z, iv: b64(iv), d: b64(chiffre) });
            return requete('PUT', d, paquet).then(function () {
              var e2 = etat();
              if (e2.code !== e.code) return false;           // arrêté ou changé pendant l'envoi
              e2.dernier = Date.now(); e2.emp = emp; e2.taille = paquet.length; delete e2.erreur; ecrire(e2);
              return true;
            });
          });
        });
      });
    }).catch(function (err) {
      var e2 = etat();
      if (e2.code === e.code && e2.actif && err.statut !== 429) { e2.erreur = err.message || String(err); e2.erreurT = Date.now(); ecrire(e2); }
      throw err;
    }).then(function (r) { enCours = null; return r; }, function (err) { enCours = null; throw err; });
    return enCours;
  }

  // Lit la sauvegarde rangée sous ce code (sur n'importe quel téléphone)
  function lire(code) {
    if (!possible()) return Promise.reject(new Error('Ce navigateur ne permet pas la sauvegarde en ligne.'));
    if (!codeValide(code)) return Promise.reject(new Error('Le code doit avoir 20 signes (4 groupes de 5).'));
    return deriver(code).then(function (d) {
      return requete('GET', d).then(function (texte) {
        var p = JSON.parse(texte);
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv: deb64(p.iv) }, d.cle, deb64(p.d))
          .catch(function () { throw new Error('Impossible de déchiffrer : le code ne correspond pas.'); })
          .then(function (o) { return decompresser(new Uint8Array(o), p.z); })
          .then(function (t) { return Sauvegarde.lireFichier(t); });
      });
    });
  }

  // Activer : nouveau code (ou celui d'une sauvegarde récupérée), puis premier envoi
  function activer(code) {
    var e = { code: formater(code || nouveauCode()), actif: true };
    ecrire(e);
    return envoyer(true);
  }
  function reprendre() { var e = etat(); if (!e.code) return Promise.resolve(false); e.actif = true; ecrire(e); return envoyer(true); }
  function suspendre() { var e = etat(); e.actif = false; ecrire(e); }
  // Arrêter et effacer la copie en ligne ; le code est oublié sur ce téléphone
  function effacer() {
    var e = etat();
    if (!e.code) { effacerStockage(CLE); return Promise.resolve(); }
    return deriver(e.code).then(function (d) { return requete('DELETE', d); }).then(function () { effacerStockage(CLE); ecrire0(); });
  }
  function ecrire0() { try { window.dispatchEvent(new CustomEvent('desdale-nuage')); } catch (x) {} }

  // Envoi automatique : à l'ouverture (après 20 s, pour ne pas gêner le chargement) et en arrière-plan
  function demarrer() {
    if (!possible()) return;
    setTimeout(function () { envoyer(false).catch(function () {}); }, 20000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') envoyer(false).catch(function () {});
    });
  }

  return { etat: etat, possible: possible, nouveauCode: nouveauCode, formater: formater, codeValide: codeValide,
    envoyer: envoyer, lire: lire, activer: activer, reprendre: reprendre, suspendre: suspendre, effacer: effacer, demarrer: demarrer };
})();
if (typeof document !== 'undefined') { try { Nuage.demarrer(); } catch (e) {} }

// Garde-fou réseau : si le serveur de mise en relation (PeerJS) ne répond pas, l'événement « open » n'arrive jamais
// et aucune erreur non plus : la page resterait sur « connexion… ». Passé le délai, on déclenche une erreur ;
// chaque page la traite comme les autres (nouvel essai, reprise du salon, ou message).
function veillerOuverture(p, delai) {
  setTimeout(function () {
    if (p && !p.destroyed && !p.open) { try { p.emit('error', { type: 'server-error', message: 'Le serveur de connexion ne répond pas.' }); } catch (e) {} }
  }, delai || 12000);
}

function fermerAutresSalons(jeuCourant) {
  Object.keys(SALONS_JEUX).forEach(j => { if (j !== jeuCourant) oublierSalonDuJeu(j); });
}

// ---------- Accès privé ----------
// Le code n'est écrit nulle part : seule son empreinte (PBKDF2-SHA256) permet de le vérifier.
// Le même calcul produit une "clé de salon", absente des fichiers, mélangée à l'identifiant
// réseau des salons : sans le bon code, impossible de rejoindre une partie.
// ================== ADMIN (testeurs) ==================
// Outils de mise au point réservés aux testeurs : mot de passe vérifié par son empreinte (PBKDF2), jamais écrit en clair.
// Protection légère (tout reste sur le téléphone) : elle évite surtout les fausses manœuvres.
const ADMIN = {
  SEL: 'desdale-admin-v1',
  ITERATIONS: 150000,
  EMPREINTE: '172276c71b587c60d170da5ba80aa1ab4b5fcc11bd5495f021b3e4ce92c70c0c',
  CLE_STOCKAGE: 'desdale-admin',
  actif: function() { return lireStockage(this.CLE_STOCKAGE) === this.EMPREINTE; },
  deverrouiller: function(mdp) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve(false);
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(String(mdp).trim().toLowerCase()), 'PBKDF2', false, ['deriveBits'])
      .then(cle => crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(this.SEL), iterations: this.ITERATIONS }, cle, 256))
      .then(bits => {
        var e = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
        if (e !== this.EMPREINTE) return false;
        ecrireStockage(this.CLE_STOCKAGE, e);
        return true;
      });
  },
  verrouiller: function() { try { localStorage.removeItem(this.CLE_STOCKAGE); } catch (e) {} }
};

const ACCES = {
  SEL: 'demodes-acces-v1',
  ITERATIONS: 150000,
  EMPREINTE: 'bbd3d13a58946514832f78fffb2f2429d7b39475716ee09fc8ff0687543615e4',
  CLE_STOCKAGE: 'brillant-acces',
  cleSalon: null,
  hex: function(octets) { return Array.from(octets).map(b => b.toString(16).padStart(2, '0')).join(''); },
  deriver: function(code) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(code.trim().toLowerCase()), 'PBKDF2', false, ['deriveBits'])
      .then(cle => crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(this.SEL), iterations: this.ITERATIONS }, cle, 48 * 8))
      .then(bits => {
        var o = new Uint8Array(bits);
        return { empreinte: this.hex(o.slice(0, 32)), cleSalon: this.hex(o.slice(32, 40)) };
      });
  },
  memorise: function() {
    var m = lireStockage(this.CLE_STOCKAGE);
    if (m && m.e === this.EMPREINTE && m.s) { this.cleSalon = m.s; return true; }
    return false;
  },
  valider: function(code) {
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error('navigateur'));
    return this.deriver(code).then(r => {
      if (r.empreinte !== this.EMPREINTE) return false;
      this.cleSalon = r.cleSalon;
      ecrireStockage(this.CLE_STOCKAGE, { e: r.empreinte, s: r.cleSalon });
      return true;
    });
  },
  // Nom de salon simplifié (minuscules, sans accents) : « Soirée Jeux » -> « soiree-jeux »
  simplifier: function(nom) {
    return (nom || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
                      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'salon';
  },
  // Identifiant réseau d'un salon ; chaque jeu a ses propres salons (Brilliant : sans préfixe)
  idSalon: function(nom, jeu) {
    return 'dm-' + this.cleSalon + '-' + (jeu ? jeu + '-' : '') + this.simplifier(nom);
  }
};

// ---------- Sons (fabriqués par le code, aucun fichier) ----------
const Sons = {
  ctx: null,
  tamponBruit: null,
  obtenir: function() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(function () {});
    return this.ctx;
  },
  bruit: function(ctx) {
    if (!this.tamponBruit || this.tamponBruit.sampleRate !== ctx.sampleRate) {
      var b = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.tamponBruit = b;
    }
    return this.tamponBruit;
  },
  choc: function(ctx, dest, t, force) {
    var src = ctx.createBufferSource(); src.buffer = this.bruit(ctx);
    var filtre = ctx.createBiquadFilter(); filtre.type = 'bandpass';
    filtre.frequency.value = 1800 + Math.random() * 1600; filtre.Q.value = 2.5;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9 * force, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(filtre); filtre.connect(g); g.connect(dest);
    src.start(t, Math.random() * 0.4); src.stop(t + 0.06);
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(260 + Math.random() * 80, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.06);
    var g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.5 * force, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g2); g2.connect(dest); o.start(t); o.stop(t + 0.08);
  },
  // Dés qui roulent (nb = nombre de dés : plus de chocs quand il y en a plus)
  des: function(ctx, dest, t0, nb) {
    var t = t0, extra = Math.max(0, (nb || 2) - 2);
    for (var i = 0; i < 9; i++) {
      this.choc(ctx, dest, t, Math.max(0.25, 1 - i * 0.08));
      if (i % 2 === 0) this.choc(ctx, dest, t + 0.012 + Math.random() * 0.02, 0.6 - i * 0.04);
      for (var k = 0; k < extra && i < 5; k++) this.choc(ctx, dest, t + 0.02 + Math.random() * 0.04, 0.4);
      t += 0.045 + i * 0.022 + Math.random() * 0.02;
    }
  },
  note: function(ctx, dest, t, freq, duree, volume, type) {
    var o = ctx.createOscillator(); o.type = type || 'triangle'; o.frequency.value = freq;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + duree + 0.02);
  },
  zone: function(ctx, dest, t0, moi) {
    var notes = moi ? [1046.5, 1318.5, 1568, 2093] : [784, 987.8];
    var vol = moi ? 0.35 : 0.18;
    notes.forEach((f, i) => {
      this.note(ctx, dest, t0 + i * 0.08, f, 0.5, vol, 'triangle');
      this.note(ctx, dest, t0 + i * 0.08, f * 2, 0.25, vol * 0.25, 'sine');
    });
  },
  // Petit "toc" discret (dé gardé, case inscrite)
  toc: function(ctx, dest, t0) { this.note(ctx, dest, t0, 660, 0.08, 0.15, 'sine'); },
  victoire: function(ctx, dest, t0) {
    [523.3, 659.3, 784, 1046.5].forEach((f, i) => this.note(ctx, dest, t0 + i * 0.12, f, 0.35, 0.3, 'square'));
    this.note(ctx, dest, t0 + 0.5, 1046.5, 0.9, 0.3, 'triangle');
    this.note(ctx, dest, t0 + 0.5, 1318.5, 0.9, 0.22, 'triangle');
    this.note(ctx, dest, t0 + 0.5, 1568, 0.9, 0.18, 'triangle');
  },
  jouer: function(nom, arg) {
    var ctx = this.obtenir();
    if (!ctx || ctx.state !== 'running') return;
    var master = ctx.createGain(); master.gain.value = 1.4; master.connect(ctx.destination);
    this[nom](ctx, master, ctx.currentTime + 0.02, arg);
  }
};

// ---------- Annonce vocale ----------
const Voix = {
  supportee: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  debloquee: false,
  debloquer: function() {
    if (!this.supportee || this.debloquee) return;
    try { speechSynthesis.speak(new SpeechSynthesisUtterance('')); this.debloquee = true; } catch (e) {}
  },
  dire: function(texte) {
    if (!this.supportee) return;
    try {
      speechSynthesis.cancel();
      var phrase = new SpeechSynthesisUtterance(texte);
      phrase.lang = 'fr-FR';
      var fr = speechSynthesis.getVoices().find(v => /^fr(-|_|$)/i.test(v.lang));
      if (fr) phrase.voice = fr;
      phrase.rate = 1.05;
      speechSynthesis.speak(phrase);
    } catch (e) {}
  }
};

// Étoiles ⭐ de « Mon compagnon » : dans etoiles.js (aussi chargé par brilliant/index.html, qui n'utilise pas ce fichier)

// ---------- Pseudo : choisi une fois sur le portail (profil du salon global), le même dans tous les jeux ----------
// Ordinateurs autour de la table : « 🤖 » + un prénom tiré au hasard (demandé par l'utilisateur, à la place de « Ordi », « Ordi 2 »…).
// Le « 🤖 » au début du nom suffit à reconnaître un ordinateur (anciennes parties « 🤖 Ordi » comprises).
const PRENOMS_ORDIS = ['Léon', 'Margot', 'Basile', 'Rosalie', 'Gaston', 'Suzanne', 'Félix', 'Odette', 'Achille', 'Colette', 'Marius', 'Lucienne',
  'Firmin', 'Agathe', 'Hector', 'Mireille', 'Anatole', 'Germaine', 'Barnabé', 'Josette', 'Eugène', 'Paulette', 'Octave', 'Simone',
  'Ernest', 'Huguette', 'Jules', 'Yvette', 'Gustave', 'Odile', 'Lucien', 'Ginette'];
function estNomOrdi(n) { return typeof n === 'string' && n.indexOf('🤖') === 0; }
function nomsOrdis(n, exclus) {
  var pris = (exclus || []).map(x => String(x).replace(/^🤖\s*/, '').toLowerCase());
  var l = PRENOMS_ORDIS.filter(p => pris.indexOf(p.toLowerCase()) === -1);
  for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = l[i]; l[i] = l[j]; l[j] = x; }
  return l.slice(0, n).map(p => '🤖 ' + p);
}

function pseudoPortail() {
  var p = lireStockage('desdale-profil');
  if (p && p.pseudo) return p.pseudo;
  // Pas encore de profil : le pseudo d'une ancienne partie, s'il y en a un
  for (var j in SALONS_JEUX) { var s = lireStockage(SALONS_JEUX[j]); if (s && s.pseudo) return s.pseudo; }
  return '';
}
// Dans un salon en cours, on garde le pseudo sous lequel on y est entré (sinon les autres ne nous reconnaîtraient plus)
function pseudoPour(cleSauvegarde) {
  var s = lireStockage(cleSauvegarde);
  return s && s.role && s.salon && s.pseudo ? s.pseudo : pseudoPortail();
}
// Ouvre le profil du salon global (bulle 💬) pour choisir son pseudo
function ouvrirProfilPortail(manquant) {
  if (manquant) vibrer([40, 40, 40]);
  if (window.SalonGlobal) SalonGlobal.ouvrir('profil');
  else alert('Choisis ton pseudo sur l\'accueil de Désdale.');
}

// Vibration : Android uniquement (iPhone ne la propose pas aux pages web)
// La Vallée de Désdale (3.48) : une page ouverte depuis la Vallée (ma maison, la crypte du Donjon, la boutique) y ramène au lieu de l'accueil.
// La Vallée pose `desdale-vallee` dans sessionStorage en y entrant ; l'accueil l'efface.
function depuisVallee() { try { return sessionStorage.getItem('desdale-vallee') === '1'; } catch (e) { return false; } }
function adresseRetour() { return depuisVallee() ? 'vallee/' : 'index.html?choix'; }

function vibrer(motif) {
  try { if (navigator.vibrate) navigator.vibrate(motif); } catch (e) {}
}

// ---------- Geste « retour » du téléphone (3.75, signalé par l'utilisateur : « les back via geste font rollback certains avancements ») ----------
// 1) Une page revenue du cache du navigateur (bfcache) reprendrait son état d'avant en mémoire et pourrait réécrire des
//    données plus anciennes par-dessus les nouvelles : on la recharge depuis le stockage, avant que la page ne réagisse
//    (écouteur posé avant ceux de la page, qui ne sont pas appelés).
// 2) Sur les pages autres que l'accueil, le geste retour ne quitte plus la page sans prévenir : une petite fenêtre propose
//    l'accueil (ou la Vallée si l'on vient d'elle), ou de rester. L'entrée d'historique n'est posée qu'au premier toucher
//    (sans geste, Chrome saute ces entrées).
(function () {
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) { ev.stopImmediatePropagation(); location.reload(); }
  });
  var base = document.querySelector('base');
  if (!base || base.getAttribute('href') !== '../') return;   // l'accueil : le retour garde son sens habituel
  var garde = false, ouverte = null;
  function poser() {
    if (garde) return;
    try { history.pushState({ desdaleRetour: 1 }, '', location.href); garde = true; } catch (e) {}
  }
  document.addEventListener('pointerdown', poser, true);
  function vallee() { try { return sessionStorage.getItem('desdale-vallee') === '1'; } catch (e) { return false; } }
  function fermer() { if (ouverte) { ouverte.remove(); ouverte = null; } }
  function aller(adr) { fermer(); location.replace(new URL(adr, document.baseURI).href); }
  window.addEventListener('popstate', function () {
    if (!garde) return;
    garde = false;
    if (ouverte) return;
    var st = document.createElement('style');
    st.textContent = '.dsd-retour{position:fixed;inset:0;z-index:100000;background:rgba(15,20,30,.55);display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,sans-serif}' +
      '.dsd-retour>div{background:#fff;color:#1f2937;border-radius:16px;padding:18px 16px 14px;width:100%;max-width:330px;box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:center}' +
      '.dsd-retour b{display:block;font-size:1.1em;margin-bottom:4px}.dsd-retour p{margin:0 0 14px;color:#6b7280;font-size:.92em}' +
      '.dsd-retour button{display:block;width:100%;margin-top:8px;padding:12px;border-radius:12px;border:1px solid #d1d5db;background:#f3f4f6;font:inherit;font-weight:700;color:#1f2937;cursor:pointer}' +
      '.dsd-retour button.p{background:#2d3a4b;color:#fff;border-color:#2d3a4b}';
    var d = document.createElement('div');
    d.className = 'dsd-retour';
    var v = vallee();
    d.innerHTML = '<div><b>Quitter cette page ?</b><p>Ta partie est gardée : tu la retrouveras en revenant.</p>' +
      (v ? '<button class="p" data-a="vallee/">⛰️ Retour à la Vallée</button>' : '') +
      '<button class="' + (v ? '' : 'p') + '" data-a="index.html?choix">🏠 Retour à l\'accueil</button>' +
      '<button data-a="">Rester ici</button></div>';
    d.appendChild(st);
    d.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b && ev.target !== d) return;
      var a = b ? b.getAttribute('data-a') : '';
      if (a) return aller(a);
      fermer(); poser();
    });
    document.body.appendChild(d);
    ouverte = d;
  });
})();

// L'audio et la voix ne démarrent qu'après un geste : chaque toucher les (re)débloque
document.addEventListener('pointerdown', function () {
  if (Sons.ctx === null || Sons.ctx.state !== 'running') Sons.obtenir();
  Voix.debloquer();
}, true);

// Service worker : mise en cache pour l'application installée
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('Service worker :', e); });
  });
}
