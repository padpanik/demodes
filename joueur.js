// ================== IDENTITÉ DU JOUEUR : un seul endroit pour tous les jeux ==================
// Chargé avant commun.js par toutes les pages (Brilliant compris). Les jeux n'ont rien à faire de plus :
// la variable globale `clientId` de commun.js (et de Brilliant) vaut désormais Joueur.id.
//
// Deux identifiants à ne pas confondre :
//  - Joueur.id : la PERSONNE. Tiré une seule fois et gardé dans « desdale-joueur-id ». Il fait partie de la sauvegarde
//    (et du déménagement vers la nouvelle adresse) : en récupérant sa sauvegarde sur un nouveau téléphone, on récupère
//    aussi son identité. Sert à tout ce qui suit quelqu'un dans le temps : classements, scores, reconnaissance dans un salon.
//    Au premier chargement, il reprend l'ancien identifiant du téléphone : rien de ce qui y était rangé n'est perdu.
//  - Joueur.appareil : CE TÉLÉPHONE (« brillant-client-id », jamais dans la sauvegarde). Sert aux connexions
//    (salon global) : deux téléphones de la même personne restent deux connexions distinctes.
// Le pseudo n'est qu'un nom affiché : il peut changer. Joueur.nom(id) donne le dernier pseudo connu d'un joueur
// (le carnet « desdale-noms » est rempli tout seul par le salon global).

var Joueur = (function () {
  function lire(k) { try { var t = localStorage.getItem(k); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
  function ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function tirer() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10); }

  var appareil = lire('brillant-client-id');
  if (!appareil) { appareil = tirer(); ecrire('brillant-client-id', appareil); }
  var id = lire('desdale-joueur-id');
  if (!id) { id = appareil; ecrire('desdale-joueur-id', id); }

  var NOMS = 'desdale-noms', MAX_NOMS = 300;
  // Retient le dernier pseudo connu d'un joueur
  function noter(i, pseudo) {
    if (!i || !pseudo || typeof i !== 'string' || i === id || pseudo === 'Anonyme') return;   // moi : c'est mon profil qui fait foi
    var t = lire(NOMS) || {};
    if (t[i] === pseudo) return;
    delete t[i]; t[i] = pseudo;   // le plus récent à la fin
    var ks = Object.keys(t);
    while (ks.length > MAX_NOMS) delete t[ks.shift()];
    ecrire(NOMS, t);
  }
  // Nom à afficher pour un identifiant (le mien : mon pseudo actuel)
  function nom(i, defaut) {
    if (i === id) { var p = lire('desdale-profil'); if (p && p.pseudo) return p.pseudo; }
    var t = lire(NOMS) || {};
    return t[i] || defaut || '';
  }

  return {
    id: id,
    appareil: appareil,
    estMoi: function (i) { return i === id; },
    noter: noter,
    nom: nom,
    pseudo: function () { return nom(id); }
  };
})();
