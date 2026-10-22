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

  var css = [
    '.cpj{display:flex;gap:6px;justify-content:center;align-items:flex-end;margin-top:6px;min-height:64px;position:relative}',
    '.cpj-ami{position:relative;display:flex;flex-direction:column;align-items:center;width:64px}',
    '.cpj-ami.moi .cpj-des{cursor:pointer}',
    '.cpj-ami .cpj-des{border:none;padding:0;font:inherit;cursor:default;width:48px;height:48px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;overflow:hidden}',
    '.cpj-ami.moi .cpj-des{box-shadow:0 0 0 2px #7048e8,0 1px 3px rgba(0,0,0,.12)}',
    '.cpj-ami .cpj-des svg{width:46px;height:46px;margin-top:4px}',
    '.cpj-ami .cpj-ini{font-weight:900;font-size:1.2em;color:#5b6b78}',
    '.cpj-ami .cpj-nom{font-size:.7em;font-weight:800;color:#5b6b78;max-width:64px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}',
    '.cpj-ami .cpj-plus{position:absolute;right:6px;top:-2px;width:18px;height:18px;border-radius:50%;background:#7048e8;color:#fff;font-size:12px;line-height:18px;font-weight:900}',
    '.cpj-bulle{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:4px;background:#fff;border-radius:12px;padding:4px 9px;',
    'font-size:.8em;font-weight:800;color:#2c3e50;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.18);animation:cpj-bulle 2.6s ease forwards;pointer-events:none;z-index:30}',
    '.cpj-bulle:after{content:"";position:absolute;left:50%;top:100%;margin-left:-5px;border:5px solid transparent;border-top-color:#fff}',
    '@keyframes cpj-bulle{0%{opacity:0;transform:translate(-50%,6px) scale(.8)}10%{opacity:1;transform:translate(-50%,0) scale(1)}85%{opacity:1}100%{opacity:0}}',
    '.cpj-vol{position:absolute;left:50%;bottom:30px;font-size:30px;pointer-events:none;animation:cpj-vol 2.2s ease-out forwards;z-index:31}',
    '@keyframes cpj-vol{0%{opacity:0;transform:translate(-50%,0) scale(.6)}15%{opacity:1;transform:translate(-50%,-20px) scale(1.15)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),-170px) scale(1)}}',
    '.cpj-choix{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:6px;background:#fff;border-radius:16px;padding:8px;',
    'box-shadow:0 8px 26px rgba(0,0,0,.25);display:grid;grid-template-columns:repeat(5,1fr);gap:4px;width:300px;max-width:calc(100vw - 24px);z-index:40}',
    '.cpj-choix button{border:none;background:#f3f0ff;border-radius:10px;padding:5px 2px;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px}',
    '.cpj-choix button span{font-size:22px;line-height:1.1}',
    '.cpj-choix button small{font-size:.62em;font-weight:800;color:#5f3dc4;white-space:nowrap}',
    '.cpj-fond{position:fixed;inset:0;z-index:35}',
    '@media (prefers-reduced-motion: reduce){.cpj-vol{animation-duration:.01s}}'
  ].join('');
  if (typeof document !== 'undefined') { var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }

  if (typeof Vue !== 'undefined') Vue.component('compagnons-jeu', {
    data: function () { return { amis: [], choix: false, bulles: {}, vols: [], cpPret: typeof CP !== 'undefined', dernier: 0, EMOTES: EMOTES }; },
    created: function () {
      this._maj = () => this.majAmis();
      this._emote = (ev) => this.montrer(ev.detail.id, ev.detail.e);
      window.addEventListener('desdale-membres', this._maj);
      window.addEventListener('desdale-emote', this._emote);
      this._timer = setInterval(this._maj, 3000);   // au cas où (salon global pas encore prêt, compagnon-commun.js chargé après)
      this.majAmis();
    },
    beforeDestroy: function () {
      window.removeEventListener('desdale-membres', this._maj);
      window.removeEventListener('desdale-emote', this._emote);
      clearInterval(this._timer);
    },
    methods: {
      majAmis: function () {
        this.cpPret = typeof CP !== 'undefined';
        var l = (typeof SalonGlobal !== 'undefined' && SalonGlobal.membresDuSalon) ? SalonGlobal.membresDuSalon() : [];
        l.sort((a, b) => (b.moi ? 1 : 0) - (a.moi ? 1 : 0));   // moi d'abord
        var cle = JSON.stringify(l.map(m => [m.id, m.pseudo, m.cp])) + this.cpPret;
        if (cle !== this._cle) { this._cle = cle; this.amis = l.slice(0, 5); }
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
      '<div class="cpj" v-if="amis.length">' +
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
