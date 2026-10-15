// ================== DÉSDALE : BASE COMMUNE À TOUS LES JEUX ==================
// Chargé par l'écran de choix (index.html) et par les jeux (yams.html…).
// Les clés de stockage gardent l'ancien préfixe "brillant-" : les réglages déjà faits sont conservés.

// Numéro de version affiché (à augmenter à chaque mise en ligne, avec brilliant.html et sw.js)
const VERSION = '1.38';

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

// ---------- Accès privé ----------
// Le code n'est écrit nulle part : seule son empreinte (PBKDF2-SHA256) permet de le vérifier.
// Le même calcul produit une "clé de salon", absente des fichiers, mélangée à l'identifiant
// réseau des salons : sans le bon code, impossible de rejoindre une partie.
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
