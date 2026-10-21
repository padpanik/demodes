// ================== FICHE DE JEU (composant commun à toutes les pages de jeu) ==================
// Le canevas est le même partout : en-tête (logo, nom, résumé, bouton « ⇦ Jeux » en haut à droite),
// 4 onglets sur toute la largeur (🎲 Partie · ▶️ Jouer · ⚙️ Réglages · 📖 Règles), puis le contenu de l'onglet choisi.
// Chaque jeu ne fournit que ses particularités, par des « emplacements » (slots) :
//
//   <fiche-jeu nom="Yams" resume="Désdale · 5 dés, 5 colonnes" :onglet.sync="onglet"
//              :son.sync="sonActif" :connexion="role ? connexion : ''">
//     <template v-slot:logo> … </template>        logo (dessin du jeu)
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
  .fj-retour { position: absolute; top: 2px; right: 0; font-weight: 700; font-size: 0.85em; color: #3b5568; text-decoration: none;
               background: #e3e8ec; border-radius: 10px; padding: 7px 10px; }
  .fj-barre { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .fj-onglets { flex: 1; display: flex; background: #e3e8ec; border-radius: 11px; padding: 3px; gap: 2px; }
  .fj-onglets button { flex: 1; border: none; background: transparent; font: inherit; display: flex; flex-direction: column; align-items: center; gap: 1px;
                       padding: 4px 2px; border-radius: 8px; font-weight: 600; font-size: 0.8em; color: #5b6b78; cursor: pointer; }
  .fj-onglets button.actif { background: #fff; color: #1d2b36; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
  .fj-onglets .ico { font-size: 1.2em; line-height: 1.15; }
  .fj-infos { display: flex; align-items: center; gap: 3px; white-space: nowrap; }
  .fj-son { border: none; background: transparent; font-size: 1.05em; line-height: 1; padding: 3px 2px; border-radius: 8px; cursor: pointer; }
  .fj-son.off { opacity: 0.45; }
  .fj-point { width: 9px; height: 9px; border-radius: 50%; background: #42b983; }
  .fj-point.attente { background: #f0a030; animation: fj-clignote 1s infinite; }
  @keyframes fj-clignote { 50% { opacity: 0.3; } }
  .pseudo-portail { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 4px 0 10px; color: #3b4b57; }
  .pseudo-portail b { color: #1d2b36; }
  .lien-profil { border: none; background: #eef4ff; color: #1c5fb0; font: inherit; font-weight: 700; font-size: 0.88em; border-radius: 9px; padding: 4px 10px; cursor: pointer; }
  .carte.regles ul { padding-left: 18px; margin: 8px 0 0; font-size: 0.92em; line-height: 1.5; color: #3b4b57; }
  .fj-reglages-base label { display: flex; align-items: center; gap: 8px; padding: 5px 0; cursor: pointer; }
  `;
  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var ONGLETS = [
    { cle: 'config', ico: '🎲', nom: 'Partie' },
    { cle: 'play', ico: '▶️', nom: 'Jouer' },
    { cle: 'reglages', ico: '⚙️', nom: 'Réglages' },
    { cle: 'regles', ico: '📖', nom: 'Règles' }
  ];

  Vue.component('fiche-jeu', {
    props: {
      nom: String,
      resume: String,
      onglet: { type: String, default: 'config' },
      son: { type: Boolean, default: undefined },     // bouton 🔊 pendant le jeu (absent si non fourni)
      connexion: { type: String, default: '' }         // '' : pas de salon ; 'ok' : point vert ; autre : point orange
    },
    data: function () { return { ONGLETS: ONGLETS }; },
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
          <div class="fj-logo"><slot name="logo"></slot></div>
          <div class="fj-titre"><h1>{{ nom }}</h1><p>{{ resume }}</p></div>
          <a class="fj-retour" href="index.html?choix" title="Retour à la liste des jeux">⇦ Jeux</a>
        </header>
        <div class="fj-barre">
          <nav class="fj-onglets">
            <button v-for="o in ONGLETS" :key="o.cle" :class="{ actif: onglet === o.cle }" @click="choisir(o.cle)"><span class="ico">{{ o.ico }}</span>{{ o.nom }}</button>
          </nav>
          <div class="fj-infos" v-if="onglet === 'play'">
            <slot name="infos"></slot>
            <button v-if="son !== undefined" class="fj-son" :class="{ off: !son }" @click="basculerSon">{{ son ? '🔊' : '🔇' }}</button>
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
