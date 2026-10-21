// ================== FICHE DE JEU (composant commun à toutes les pages de jeu) ==================
// Le canevas est le même partout : en-tête (logo, nom, résumé, bouton « ⇦ Jeux » en haut à droite),
// 4 onglets sur toute la largeur (🎲 Partie · ▶️ Jouer · ⚙️ Réglages · 📖 Règles), puis le contenu de l'onglet choisi.
// Chaque jeu ne fournit que ses particularités, par des « emplacements » (slots) :
//
//   <fiche-jeu jeu="yams" nom="Yams" resume="Désdale · 5 dés, 5 colonnes" :onglet.sync="onglet"
//              :son.sync="sonActif" :connexion="role ? connexion : ''">
//     <template v-slot:logo> … </template>        ancien logo (montré si l'on a choisi « Anciennes » icônes sur l'accueil)
//     <template v-slot:partie> … </template>      onglet Partie : salon, jouer seul…
//     <template v-slot:jouer> … </template>       onglet Jouer : l'écran de jeu
//     <template v-slot:reglages> … </template>    onglet Réglages (après les réglages de base, voir <reglages-base>)
//     <template v-slot:regles> … </template>      onglet Règles
//     <template v-slot:infos> … </template>       (facultatif) petits éléments à droite des onglets pendant le jeu
//   </fiche-jeu>
//
// Les onglets restent dans la page (v-show) : rien n'est détruit en changeant d'onglet.
// Dépend seulement de Vue 2 (chargé aussi par brilliant.html, qui n'utilise pas commun.js).

(function () {
  var CSS = `
  .fiche-jeu { width: 100%; }
  .fj-tete { position: relative; display: flex; align-items: center; gap: 12px; padding: 2px 72px 10px 4px; }
  .fj-tete .fj-logo { flex-shrink: 0; display: flex; align-items: center; justify-content: center; min-width: 44px; }
  .fj-tete .fj-titre { min-width: 0; }
  .fj-tete h1 { margin: 0; font-size: 1.45em; line-height: 1.15; letter-spacing: -0.5px; }
  .fj-tete p { margin: 2px 0 0; color: #6b7a86; font-size: 0.9em; line-height: 1.3; }
  .fj-retour-ico { display: inline-flex; align-items: center; margin-right: 4px; gap: 1px; line-height: 0; }
  .fj-retour { position: absolute; top: 2px; right: 0; display: inline-flex; align-items: center; font-weight: 700; font-size: 0.85em; color: #3b5568; text-decoration: none;
               background: #e3e8ec; border-radius: 10px; padding: 7px 10px; }
  .fj-barre { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .fj-onglets { flex: 1; display: flex; background: #e3e8ec; border-radius: 11px; padding: 3px; gap: 2px; }
  .fj-onglets button { flex: 1; border: none; background: transparent; font: inherit; display: flex; flex-direction: column; align-items: center; gap: 1px;
                       padding: 4px 2px; border-radius: 8px; font-weight: 600; font-size: 0.8em; color: #5b6b78; cursor: pointer; }
  .fj-onglets button.actif { background: #fff; color: #1d2b36; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
  .fj-onglets .ico { display: flex; line-height: 0; color: #8795a1; transition: color 0.15s, transform 0.15s; }
  .fj-onglets button.actif .ico { color: #1c7ed6; transform: translateY(-1px); }
  .fj-infos { display: flex; align-items: center; gap: 3px; white-space: nowrap; }
  .fj-son { border: none; background: transparent; color: #3b5568; line-height: 0; padding: 4px; border-radius: 8px; cursor: pointer; }
  .fj-son.off { color: #9aa7b1; }
  .fj-point { width: 9px; height: 9px; border-radius: 50%; background: #42b983; }
  .fj-point.attente { background: #f0a030; animation: fj-clignote 1s infinite; }
  @keyframes fj-clignote { 50% { opacity: 0.3; } }
  .pseudo-portail { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 4px 0 10px; color: #3b4b57; }
  .pseudo-portail b { color: #1d2b36; }
  .lien-profil { border: none; background: #eef4ff; color: #1c5fb0; font: inherit; font-weight: 700; font-size: 0.88em; border-radius: 9px; padding: 4px 10px; cursor: pointer; }
  .carte.regles ul { padding-left: 18px; margin: 8px 0 0; font-size: 0.92em; line-height: 1.5; color: #3b4b57; }
  .petit-titre { font-size: 0.85em; font-weight: 700; color: #5b6b78; margin: 6px 0 4px; }
  .fj-reglages-base label { display: flex; align-items: center; gap: 8px; padding: 5px 0; cursor: pointer; }
  `;
  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // Icônes dessinées au trait (SVG maison, couleur du texte : grises au repos, colorées sur l'onglet actif)
  function svg(corps) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + corps + '</svg>';
  }
  var ICONES = {
    // Partie : un dé
    config: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/>'),
    // Jouer : lecture dans un cercle
    play: svg('<circle cx="12" cy="12" r="8.75"/><path d="M10.2 8.6 L15.6 12 L10.2 15.4 Z" fill="currentColor"/>'),
    // Réglages : trois curseurs
    reglages: svg('<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>'),
    // Règles : livre ouvert
    regles: svg('<path d="M12 6.5C10.2 5 7.6 4.5 4 4.8v12.6c3.6-.3 6.2.2 8 1.7 1.8-1.5 4.4-2 8-1.7V4.8c-3.6-.3-6.2.2-8 1.7z"/><path d="M12 6.5v12.6"/>')
  };
  var RETOUR = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 6 L8.5 12 L14.5 18"/></svg>' +
               '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/></svg>';
  // Son : haut-parleur avec ondes, ou barré
  var SON = { oui: svg('<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" fill-opacity="0.15"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4"/>'),
              non: svg('<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" fill-opacity="0.15"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>') };
  var ONGLETS = [
    { cle: 'config', ico: ICONES.config, nom: 'Partie' },
    { cle: 'play', ico: ICONES.play, nom: 'Jouer' },
    { cle: 'reglages', ico: ICONES.reglages, nom: 'Réglages' },
    { cle: 'regles', ico: ICONES.regles, nom: 'Règles' }
  ];

  Vue.component('fiche-jeu', {
    props: {
      jeu: String,                                     // identifiant du jeu, pour sa nouvelle icône (icones-jeux.js)
      nom: String,
      resume: String,
      onglet: { type: String, default: 'config' },
      son: { type: Boolean, default: undefined },     // bouton 🔊 pendant le jeu (absent si non fourni)
      connexion: { type: String, default: '' }         // '' : pas de salon ; 'ok' : point vert ; autre : point orange
    },
    data: function () { return { ONGLETS: ONGLETS, RETOUR: RETOUR, SON: SON, icNeuves: typeof IconesJeux !== 'undefined' && IconesJeux.nouvelles() }; },
    computed: { iconeNeuve: function () { return this.jeu && this.icNeuves ? IconesJeux.svg(this.jeu, 52) : ''; } },
    methods: {
      choisir: function (cle) { this.$emit('update:onglet', cle); this.$emit('onglet', cle); },
      basculerSon: function () {
        var v = !this.son;
        this.$emit('update:son', v);
        try { if (v && typeof Sons !== 'undefined') Sons.jouer('toc'); } catch (e) {}
      }
    },
    template: `
      <div class="fiche-jeu">
        <header class="fj-tete" v-show="onglet !== 'play'">
          <div class="fj-logo" v-if="iconeNeuve" v-html="iconeNeuve"></div><div class="fj-logo" v-else><slot name="logo"></slot></div>
          <div class="fj-titre"><h1>{{ nom }}</h1><p>{{ resume }}</p></div>
          <a class="fj-retour" href="index.html?choix" title="Retour à la liste des jeux"><span class="fj-retour-ico" v-html="RETOUR"></span>Jeux</a>
        </header>
        <div class="fj-barre">
          <nav class="fj-onglets">
            <button v-for="o in ONGLETS" :key="o.cle" :class="{ actif: onglet === o.cle }" @click="choisir(o.cle)"><span class="ico" v-html="o.ico"></span>{{ o.nom }}</button>
          </nav>
          <div class="fj-infos" v-if="onglet === 'play'">
            <slot name="infos"></slot>
            <button v-if="son !== undefined" class="fj-son" :class="{ off: !son }" @click="basculerSon" :title="son ? 'Couper le son' : 'Remettre le son'" v-html="son ? SON.oui : SON.non"></button>
            <span v-if="connexion" class="fj-point" :class="{ attente: connexion !== 'ok' }"></span>
          </div>
        </div>
        <div v-show="onglet === 'config'"><slot name="partie"></slot></div>
        <div v-show="onglet === 'play'"><slot name="jouer"></slot></div>
        <div v-show="onglet === 'reglages'"><slot name="reglages"></slot></div>
        <div v-show="onglet === 'regles'"><slot name="regles"></slot></div>
      </div>`
  });

  // Réglages de base, les mêmes dans tous les jeux : on ne passe que ceux que le jeu utilise (.sync)
  //   <reglages-base :son.sync="sonActif" :vibration.sync="vibrationActive" :voix.sync="voixActive" :ecran.sync="garderEcran"></reglages-base>
  Vue.component('reglages-base', {
    props: { son: { type: Boolean, default: undefined }, vibration: { type: Boolean, default: undefined },
             voix: { type: Boolean, default: undefined }, ecran: { type: Boolean, default: undefined } },
    computed: {
      lignes: function () {
        var l = [];
        if (this.son !== undefined) l.push({ cle: 'son', txt: '🔊 Sons' });
        if (this.vibration !== undefined && typeof navigator.vibrate === 'function') l.push({ cle: 'vibration', txt: '📳 Vibrations' });
        if (this.voix !== undefined && 'speechSynthesis' in window) l.push({ cle: 'voix', txt: '🗣️ Annoncer mon tour' });
        if (this.ecran !== undefined && 'wakeLock' in navigator) l.push({ cle: 'ecran', txt: '☀️ Garder l\'écran allumé' });
        return l;
      }
    },
    template: `
      <div class="fj-reglages-base">
        <label v-for="r in lignes" :key="r.cle" class="case-a-cocher">
          <input type="checkbox" :checked="$props[r.cle]" @change="$emit('update:' + r.cle, $event.target.checked)"> {{ r.txt }}
        </label>
      </div>`
  });
})();
