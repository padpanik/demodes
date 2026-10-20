// ================== ÉTOILES ⭐ (monnaie de « Mon compagnon ») ==================
// Fichier à part pour être chargé par toutes les pages, y compris brilliant.html (qui a ses propres copies de la base).
// Il n'a besoin que de lireStockage / ecrireStockage (commun.js, ou leur copie dans brilliant.html).

// Gagnées en jouant, surtout à plusieurs : elles servent à acheter de quoi gâter son animal.
// Prototype : tout est gardé sur ce téléphone (pas encore de serveur).
const Etoiles = {
  BAREME: { victoirePlusieurs: 5, partiePlusieurs: 2, victoireSeul: 2 },
  PLAFOND_JOUR: 30,   // étoiles gagnées en jouant, au plus, par jour (les soins du compagnon comptent à part)
  jour: function() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
  gagneesAujourdhui: function() { var g = lireStockage('compagnon-gains-jeux'); return g && g.date === this.jour() ? g.n : 0; },
  solde: function() { return lireStockage('compagnon-etoiles') || 0; },
  // Ajoute (ou retire) des étoiles et note pourquoi
  ajouter: function(n, raison, discret) {
    if (!n) return;
    ecrireStockage('compagnon-etoiles', Math.max(0, this.solde() + n));
    var j = lireStockage('compagnon-journal') || [];
    j.push({ h: Date.now(), n: n, r: raison });
    ecrireStockage('compagnon-journal', j.slice(-80));
    if (!discret && n > 0) this.bulle('+' + n + ' ⭐', raison);
  },
  // Fin d'une partie : récompense selon victoire et nombre de joueurs (une seule fois par partie)
  // Record battu en jouant seul (meilleur que l'ancien, pas le tout premier) : bonus hors plafond du jour
  RECORD: 5,
  record: function(jeu, detail) {
    this.ajouter(this.RECORD, 'Nouveau record · ' + jeu + (detail ? ' (' + detail + ')' : ''), true);
    setTimeout(() => this.bulle('🏆 Nouveau record ! +' + this.RECORD + ' ⭐', jeu + (detail ? ' · ' + detail : '')), 3200);   // après la bulle de fin de partie
  },
  // Série de victoires d'affilée contre l'ordinateur (une par jeu et niveau) : quand elle dépasse la meilleure série,
  // un bonus, une seule fois par série (continuer à gagner ensuite ne rapporte pas plus)
  serie: function(cle, gagne, jeu, libelle) {
    var t = lireStockage('compagnon-series') || {}, s = t[cle] || { n: 0, max: 0, r: false }, nouveau = false;
    if (gagne) {
      s.n++;
      if (s.n > s.max) { if (s.max > 0 && !s.r) { s.r = true; nouveau = true; } s.max = s.n; }
    } else { s.n = 0; s.r = false; }
    t[cle] = s;
    ecrireStockage('compagnon-series', t);
    if (nouveau) this.record(jeu, s.n + ' victoires d\'affilée' + (libelle ? ', ' + libelle : ''));
    return s;
  },
  meilleureSerie: function(cle) { var s = (lireStockage('compagnon-series') || {})[cle]; return s ? s.max : 0; },
  // Journal des parties terminées (lu par les défis de la semaine du compagnon) : jeu, victoire, à plusieurs, détails
  evenement: function(jeu, gagne, aPlusieurs, info) {
    var ev = lireStockage('compagnon-evenements') || [];
    ev.push({ h: Date.now(), jeu: jeu, g: !!gagne, p: !!aPlusieurs, i: info || {} });
    ecrireStockage('compagnon-evenements', ev.slice(-150));
    // Défi réussi ? (le module du compagnon est chargé par le salon global sur toutes les pages)
    setTimeout(() => { try { if (typeof CP !== 'undefined' && CP.verifierDefis) CP.verifierDefis(true); } catch (e) {} }, 1500);
  },
  finDePartie: function(jeu, gagne, aPlusieurs, idPartie, info) {
    var cle = jeu + ':' + (idPartie || ''), vus = lireStockage('compagnon-parties') || {}, t = Date.now();
    if (idPartie ? vus[cle] : (vus[cle] && t - vus[cle] < 30000)) return;
    vus[cle] = t;
    var garder = {};
    Object.keys(vus).filter(k => t - vus[k] < 7 * 86400000).forEach(k => { garder[k] = vus[k]; });
    ecrireStockage('compagnon-parties', garder);
    this.evenement(jeu, gagne, aPlusieurs, info);
    var b = this.BAREME, n = aPlusieurs ? (gagne ? b.victoirePlusieurs : b.partiePlusieurs) : (gagne ? b.victoireSeul : 0);
    this.recompenseJeu(n, (gagne ? 'Victoire' : 'Partie') + ' · ' + jeu + (aPlusieurs ? ' entre amis' : ''));
  },
  // Étoiles gagnées en jouant, dans la limite du plafond du jour
  recompenseJeu: function(n, raison) {
    if (!n) return;
    var deja = this.gagneesAujourdhui(), reste = Math.max(0, this.PLAFOND_JOUR - deja), donne = Math.min(n, reste);
    ecrireStockage('compagnon-gains-jeux', { date: this.jour(), n: deja + donne });
    if (donne) this.ajouter(donne, raison);
    // La partie compte quand même pour les tâches du jour du compagnon
    else { var j = lireStockage('compagnon-journal') || []; j.push({ h: Date.now(), n: 0, r: raison + ' (plafond du jour atteint)' }); ecrireStockage('compagnon-journal', j.slice(-80));
           this.bulle('⭐ Plafond du jour atteint', 'Reviens demain pour gagner d\'autres étoiles'); }
  },
  // Petite bulle « +5 ⭐ » en haut de l'écran
  bulle: function(texte, sous) {
    try {
      var d = document.createElement('div');
      d.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:5000;background:#fff8dc;color:#7a5600;border-radius:16px;' +
        'padding:8px 16px;font:800 18px system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.18);text-align:center;transition:opacity .6s,transform .6s;pointer-events:none';
      d.innerHTML = texte + (sous ? '<div style="font:600 12px system-ui,sans-serif;color:#9a7a2a">' + String(sous).replace(/</g, '&lt;') + '</div>' : '');
      document.body.appendChild(d);
      setTimeout(() => { d.style.opacity = '0'; d.style.transform = 'translate(-50%,-20px)'; }, 2600);
      setTimeout(() => d.remove(), 3300);
    } catch (e) {}
  }
};
