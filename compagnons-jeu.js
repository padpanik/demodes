// ================== COMPAGNONS EN JEU ==================
// Composant Vue commun aux jeux à plusieurs : <compagnons-jeu v-if="role"></compagnons-jeu>, placé en bas de l'écran de jeu.
// Il montre les compagnons des joueurs du même salon (moi compris). En touchant le mien, je choisis une émotion :
// mon compagnon la dit dans une bulle, et l'émoji s'envole vers le haut, sur tous les téléphones du salon.
// Le réseau est celui du salon global (salon-global.js : membresDuSalon, emote, événements desdale-membres / desdale-emote) :
// aucun code réseau à ajouter dans le jeu. Le dessin des compagnons vient de compagnon-commun.js (chargé par le salon global).

var CompagnonsJeu = (function () {
  var EMOTES = [
    { ico: '👍', txt: 'Bien joué !' }, { ico: '😂', txt: 'Ha ha !' }, { ico: '😮', txt: 'Oh !' }, { ico: '😅', txt: 'Oups…' },
    { ico: '🤔', txt: 'Hmm…' }, { ico: '😤', txt: 'Grrr !' }, { ico: '🎉', txt: 'Bravo !' }, { ico: '❤️', txt: 'Merci !' },
    { ico: '⏳', txt: 'À toi !' }, { ico: '😴', txt: 'Zzz…' }
  ];
  var ATTENTE = 1500;   // pas plus d'une émotion toutes les 1,5 s

  // --t : taille d'un compagnon (calculée selon la place libre : largeur partagée entre les joueurs, hauteur jusqu'au bas de l'écran)
  var css = [
    '.cpj{display:flex;gap:8px;justify-content:center;align-items:flex-end;margin-top:4px;position:relative;--t:56px}',
    '.cpj-ami{position:relative;display:flex;flex-direction:column;align-items:center;width:calc(var(--t) + 8px)}',
    '.cpj-ami .cpj-des{position:relative;border:none;padding:0;font:inherit;cursor:default;width:var(--t);height:var(--t);background:none;display:flex;align-items:flex-end;justify-content:center}',
    '.cpj-ami .cpj-des:before{content:"";position:absolute;left:12%;right:12%;bottom:2%;height:16%;border-radius:50%;background:rgba(29,43,54,.12)}',
    '.cpj-ami.moi .cpj-des{cursor:pointer}',
    '.cpj-ami.moi .cpj-des:before{background:rgba(112,72,232,.22);box-shadow:0 0 0 2px rgba(112,72,232,.35)}',
    '.cpj-ami .cpj-des svg{position:relative;width:100%;height:100%;filter:drop-shadow(0 2px 2px rgba(0,0,0,.18))}',
    '.cpj-ami .cpj-ini{position:relative;width:70%;height:70%;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:calc(var(--t) * .35);color:#5b6b78;margin-bottom:8%}',
    '.cpj-ami .cpj-nom{position:absolute;left:50%;bottom:-4px;transform:translateX(-50%);font-size:max(11px, calc(var(--t) * .14));font-weight:800;color:#3b4b57;background:rgba(255,255,255,.88);',
    'border-radius:8px;padding:0 6px;max-width:calc(var(--t) + 8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}',
    '.cpj-ami.moi .cpj-nom{color:#5f3dc4}',
    '.cpj-ami .cpj-plus{position:absolute;right:2px;top:2px;width:20px;height:20px;border-radius:50%;background:#7048e8;color:#fff;font-size:14px;line-height:20px;font-weight:900;text-align:center;pointer-events:none}',
    '.cpj-bulle{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:2px;background:#fff;border-radius:12px;padding:4px 10px;',
    'font-size:.9em;font-weight:800;color:#2c3e50;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.18);animation:cpj-bulle 2.8s ease forwards;pointer-events:none;z-index:30}',
    '.cpj-bulle:after{content:"";position:absolute;left:50%;top:100%;margin-left:-5px;border:5px solid transparent;border-top-color:#fff}',
    '@keyframes cpj-bulle{0%{opacity:0;transform:translate(-50%,6px) scale(.8)}10%{opacity:1;transform:translate(-50%,0) scale(1)}85%{opacity:1}100%{opacity:0}}',
    // L'émoji grossit en montant, jusqu'à mi-hauteur de l'écran
    '.cpj-vol{position:absolute;left:50%;bottom:40%;font-size:46px;line-height:1;pointer-events:none;animation:cpj-vol 2.8s cubic-bezier(.2,.7,.3,1) forwards;z-index:31}',
    '@keyframes cpj-vol{0%{opacity:0;transform:translate(-50%,0) scale(.5)}12%{opacity:1;transform:translate(-50%,-30px) scale(1.2)}70%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),-42vh) scale(2.2)}}',
    '.cpj-choix{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:6px;background:#fff;border-radius:16px;padding:8px;',
    'box-shadow:0 8px 26px rgba(0,0,0,.25);display:grid;grid-template-columns:repeat(5,1fr);gap:4px;width:300px;max-width:calc(100vw - 24px);z-index:40}',
    '.cpj-choix button{border:none;background:#f3f0ff;border-radius:10px;padding:5px 2px;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px}',
    '.cpj-choix button span{font-size:24px;line-height:1.1}',
    '.cpj-choix button small{font-size:.62em;font-weight:800;color:#5f3dc4;white-space:nowrap}',
    '.cpj-fond{position:fixed;inset:0;z-index:35}',
    '@media (prefers-reduced-motion: reduce){.cpj-vol{animation-duration:.01s}}'
  ].join('');
  if (typeof document !== 'undefined') { var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

  if (typeof Vue !== 'undefined') Vue.component('compagnons-jeu', {
    data: function () { return { taille: 56, amis: [], choix: false, bulles: {}, vols: [], cpPret: typeof CP !== 'undefined', dernier: 0, EMOTES: EMOTES }; },
    created: function () {
      this._maj = () => this.majAmis();
      this._emote = (ev) => this.montrer(ev.detail.id, ev.detail.e);
      window.addEventListener('desdale-membres', this._maj);
      window.addEventListener('desdale-emote', this._emote);
      this._ajuster = () => this.ajuster();
      window.addEventListener('resize', this._ajuster);
      this._timer = setInterval(() => { this.majAmis(); this.ajuster(); }, 3000);   // au cas où (salon global pas encore prêt, compagnon-commun.js chargé après)
      this.majAmis();
    },
    mounted: function () { this.$nextTick(() => this.ajuster()); },
    beforeDestroy: function () {
      window.removeEventListener('desdale-membres', this._maj);
      window.removeEventListener('desdale-emote', this._emote);
      window.removeEventListener('resize', this._ajuster);
      clearInterval(this._timer);
    },
    methods: {
      majAmis: function () {
        this.cpPret = typeof CP !== 'undefined';
        var l = (typeof SalonGlobal !== 'undefined' && SalonGlobal.membresDuSalon) ? SalonGlobal.membresDuSalon() : [];
        l.sort((a, b) => (b.moi ? 1 : 0) - (a.moi ? 1 : 0));   // moi d'abord
        var cle = JSON.stringify(l.map(m => [m.id, m.pseudo, m.cp])) + this.cpPret;
        if (cle !== this._cle) { this._cle = cle; this.amis = l.slice(0, 5); this.$nextTick(() => this.ajuster()); }
      },
      // Plus il y a de place, plus les compagnons sont grands : la largeur est partagée entre les joueurs,
      // et ils ne descendent pas sous le bas de l'écran (l'écran de jeu ne doit pas défiler)
      ajuster: function () {
        var el = this.$el;
        if (!el || !el.getBoundingClientRect || !this.amis.length) return;
        var n = this.amis.length, largeur = (el.parentNode && el.parentNode.clientWidth) || el.clientWidth || 340;
        var parLargeur = (largeur - 8 * (n - 1)) / n - 8;
        var bas = window.innerHeight - el.getBoundingClientRect().top - 10;
        var t = Math.floor(Math.max(44, Math.min(120, parLargeur, bas)));
        if (Math.abs(t - this.taille) >= 2) this.taille = t;
      },
      dessin: function (m) {
        if (!m.cp || !this.cpPret || typeof SalonGlobal === 'undefined') return '';
        return SalonGlobal.dessinCompagnon(m.cp, 46);
      },
      volsDe: function (id) { return this.vols.filter(v => v.id === id); },
      toucher: function (m) { if (m.moi) this.choix = !this.choix; },
      envoyer: function (k) {
        this.choix = false;
        var t = Date.now();
        if (t - this.dernier < ATTENTE) return;
        this.dernier = t;
        if (typeof SalonGlobal !== 'undefined' && SalonGlobal.emote) SalonGlobal.emote(k);
        else this.montrer(null, k);
      },
      // Une émotion arrive (la mienne ou celle d'un ami) : bulle au-dessus de son compagnon, émoji qui s'envole
      montrer: function (id, k) {
        var e = EMOTES[k];
        if (!e) return;
        var m = this.amis.find(a => a.id === id) || (id === null ? this.amis.find(a => a.moi) : null);
        if (!m) return;
        var cle = Date.now() + Math.random();
        this.$set(this.bulles, m.id, { cle: cle, txt: e.txt });
        setTimeout(() => { if (this.bulles[m.id] && this.bulles[m.id].cle === cle) this.$delete(this.bulles, m.id); }, 2600);
        var v = { cle: cle, id: m.id, ico: e.ico, dx: Math.round(Math.random() * 40 - 20) + 'px' };
        this.vols.push(v);
        setTimeout(() => { this.vols = this.vols.filter(x => x !== v); }, 2300);
        if (!m.moi && typeof vibrer === 'function') vibrer(15);
      }
    },
    template:
      '<div class="cpj" :style="{ \'--t\': taille + \'px\' }">' +
        '<div v-if="choix" class="cpj-fond" @click="choix = false"></div>' +
        '<div v-if="choix" class="cpj-choix">' +
          '<button v-for="(e, k) in EMOTES" :key="k" @click="envoyer(k)"><span>{{ e.ico }}</span><small>{{ e.txt }}</small></button>' +
        '</div>' +
        '<div v-for="m in amis" :key="m.id" class="cpj-ami" :class="{ moi: m.moi }">' +
          '<button class="cpj-des" @click="toucher(m)" :aria-label="m.moi ? \'Choisir une émotion\' : m.pseudo">' +
            '<span v-if="dessin(m)" v-html="dessin(m)" style="display:contents"></span><span v-else class="cpj-ini">{{ (m.pseudo || \'?\').charAt(0).toUpperCase() }}</span>' +
          '</button>' +
          '<span v-if="m.moi" class="cpj-plus">+</span>' +
          '<span class="cpj-nom">{{ m.cp && m.cp.n ? m.cp.n : m.pseudo }}</span>' +
          '<span v-if="bulles[m.id]" :key="bulles[m.id].cle" class="cpj-bulle">{{ bulles[m.id].txt }}</span>' +
          '<span v-for="v in volsDe(m.id)" :key="v.cle" class="cpj-vol" :style="{ \'--dx\': v.dx }">{{ v.ico }}</span>' +
        '</div>' +
      '</div>'
  });
  return { EMOTES: EMOTES };
})();
