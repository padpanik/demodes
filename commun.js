// ================== DÉSDALE : BASE COMMUNE À TOUS LES JEUX ==================
// Chargé par l'écran de choix (index.html) et par les jeux (yams.html…).
// Les clés de stockage gardent l'ancien préfixe "brillant-" : les réglages déjà faits sont conservés.

// Numéro de version affiché (à augmenter à chaque mise en ligne, avec brilliant.html et sw.js)
const VERSION = '1.88';

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

// Identifiant propre à ce téléphone : permet à l'hôte de reconnaître un joueur qui revient
var clientId = lireStockage('brillant-client-id');
if (!clientId) { clientId = nouvelId() + nouvelId(); ecrireStockage('brillant-client-id', clientId); }

// ---------- Un seul salon à la fois ----------
// Chaque jeu garde en mémoire son salon en cours (et s'y reconnecte tout seul). Quand on entre dans un salon,
// on oublie ceux des autres jeux : sinon le téléphone peut rester accroché à une ancienne partie.
const SALONS_JEUX = { brilliant: 'brillant-sauvegarde-v1', yams: 'yams-sauvegarde', backgammon: 'bg-sauvegarde', assaut: 'assaut-sauvegarde', bataille: 'bataille-sauvegarde', gribouille: 'gribouille-sauvegarde', petitbac: 'petitbac-sauvegarde', agents: 'agents-sauvegarde', quatre: 'quatre-sauvegarde' };
function oublierSalonDuJeu(jeu) {
  var cle = SALONS_JEUX[jeu], sv = lireStockage(cle);
  if (!sv || !sv.role) return false;
  if (jeu === 'brilliant') { ecrireStockage(cle, { pseudo: sv.pseudo }); return true; }   // Brilliant : grille de salon effacée, comme en quittant
  sv.role = null; sv.salon = ''; sv.pub = null; sv.pubHote = null; sv.salle = null; sv.jeuHote = null;
  if (!(sv.etat && sv.etat.solo)) sv.etat = null;
  ecrireStockage(cle, sv);
  return true;
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

// ---------- Étoiles ⭐ (monnaie de « Mon compagnon ») ----------
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

// Vibration : Android uniquement (iPhone ne la propose pas aux pages web)
function vibrer(motif) {
  try { if (navigator.vibrate) navigator.vibrate(motif); } catch (e) {}
}

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
