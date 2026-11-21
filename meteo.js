/* Désdale : la météo de chez soi, mêlée à la saison (4.33, demandé par l'utilisateur :
   « partout, position GPS, avec quelques décrochages pour un mélange avec la saison : neige près de Noël, feuilles à l'automne »).

   - Position : celle du téléphone (navigator.geolocation, précision basse), arrondie à 0,1° (~10 km), gardée seulement sur ce téléphone
     (`desdale-meteo-pos`, hors sauvegarde). On ne la demande qu'après un « oui » (Meteo.activer, depuis un bouton).
   - Temps qu'il fait : Open-Meteo (gratuit, sans clé, données CC BY 4.0 : « Météo : Open-Meteo.com » est écrit là où on l'active),
     relu au plus toutes les 30 min (`desdale-meteo`). Sans position, sans réseau ou si la lecture a plus de 3 h : le temps de la saison.
   - Meteo.ambiance(t) : ce qu'on montre, après les « décrochages » de saison (voir plus bas). Meteo.calque(a) : le HTML des effets
     (pluie, neige, feuilles, pétales, lucioles, brume, ciel gris, éclairs) à poser au-dessus d'une scène (classe `mto`, sans clic).
   - Événement `desdale-meteo` quand le temps change. Rien d'autre ne sort du téléphone que les coordonnées arrondies. */
var Meteo = (function () {
  var CLE = 'desdale-meteo', CLE_POS = 'desdale-meteo-pos', VIE = 30 * 60000, PERIME = 3 * 3600000;
  function lireV(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function ecrireV(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function annoncer() { try { window.dispatchEvent(new CustomEvent('desdale-meteo')); } catch (e) {} }

  // ---------- Position et lecture ----------
  function etat() {
    var p = lireV(CLE_POS) || {}, d = lireV(CLE) || {};
    return { actif: !!p.actif, refus: !!p.refus, demande: !!p.demande, pos: p.lat != null ? { lat: p.lat, lon: p.lon } : null, donnees: d.t ? d : null };
  }
  function position(rendre) {
    if (!navigator.geolocation) { rendre(null, 'indisponible'); return; }
    navigator.geolocation.getCurrentPosition(function (g) {
      rendre({ lat: Math.round(g.coords.latitude * 10) / 10, lon: Math.round(g.coords.longitude * 10) / 10 });
    }, function (e) { rendre(null, e && e.code === 1 ? 'refus' : 'erreur'); }, { enableHighAccuracy: false, maximumAge: 6 * 3600000, timeout: 20000 });
  }
  // Le « oui » de la personne : demande la position, puis le temps qu'il fait. rendre(ok, raison)
  function activer(rendre) {
    var p = lireV(CLE_POS) || {}; p.demande = true; ecrireV(CLE_POS, p);
    position(function (pos, raison) {
      var q = lireV(CLE_POS) || {}; q.demande = true;
      if (!pos) { q.actif = false; q.refus = raison === 'refus'; ecrireV(CLE_POS, q); annoncer(); if (rendre) rendre(false, raison); return; }
      q.actif = true; q.refus = false; q.lat = pos.lat; q.lon = pos.lon; q.t = Date.now(); ecrireV(CLE_POS, q);
      rafraichir(true).then(function (ok) { if (rendre) rendre(ok, ok ? '' : 'reseau'); });
    });
  }
  function desactiver() { ecrireV(CLE_POS, { demande: true, actif: false }); ecrireV(CLE, null); annoncer(); }
  // « Non merci » : on ne redemande plus (on peut toujours l'activer dans les options)
  function refuser() { var p = lireV(CLE_POS) || {}; p.demande = true; p.actif = false; ecrireV(CLE_POS, p); }
  var _encours = null;
  function rafraichir(force) {
    var p = lireV(CLE_POS) || {}, d = lireV(CLE) || {};
    if (!p.actif || p.lat == null) return Promise.resolve(false);
    if (!force && d.t && Date.now() - d.t < VIE && d.lat === p.lat && d.lon === p.lon) return Promise.resolve(true);
    if (_encours) return _encours;
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + p.lat + '&longitude=' + p.lon +
      '&current=temperature_2m,weather_code,cloud_cover,wind_speed_10m,is_day&daily=sunrise,sunset&timezone=auto&forecast_days=1';
    _encours = fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      _encours = null;
      if (!j || !j.current) return false;
      var c = j.current, dl = j.daily || {};
      var heure = function (s) { if (!s) return null; var m = /T(\d\d):(\d\d)/.exec(s); return m ? +m[1] * 60 + +m[2] : null; };
      ecrireV(CLE, { t: Date.now(), lat: p.lat, lon: p.lon, code: c.weather_code, temp: c.temperature_2m, nuages: c.cloud_cover, vent: c.wind_speed_10m,
                     jour: c.is_day, lever: heure((dl.sunrise || [])[0]), coucher: heure((dl.sunset || [])[0]) });
      annoncer();
      return true;
    }).catch(function () { _encours = null; return false; });
    return _encours;
  }
  // Sur chaque page qui le charge : relire tant que la page est ouverte, et au retour au premier plan
  var _parti = false;
  function demarrer() {
    if (_parti) return; _parti = true;
    rafraichir(false);
    setInterval(function () { rafraichir(false); }, 5 * 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) rafraichir(false); });
    // La position change rarement : on la relit en silence toutes les 6 h si l'autorisation est déjà donnée
    var p = lireV(CLE_POS) || {};
    if (p.actif && (!p.t || Date.now() - p.t > 6 * 3600000) && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(function (r) {
        if (r.state !== 'granted') return;
        position(function (pos) { if (!pos) return; var q = lireV(CLE_POS) || {}; q.lat = pos.lat; q.lon = pos.lon; q.t = Date.now(); ecrireV(CLE_POS, q); rafraichir(true); });
      }).catch(function () {});
    }
  }

  // ---------- Saison et décrochages ----------
  function jourAn(d) { return (d.getMonth() + 1) * 100 + d.getDate(); }   // 1221 = 21 décembre
  function saisonDe(d) { var j = jourAn(d); return j >= 1221 || j < 320 ? 'hiver' : j < 621 ? 'printemps' : j < 922 ? 'ete' : 'automne'; }
  function graine(n) { var x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }
  // Ce que montre la scène : { saison, pluie, neige, solNeige, feuilles, petales, lucioles, brouillard, couvert, orage, vent, nuit, temp, source, texte }
  // `force` (essais de la maquette) : 'pluie' | 'neige' | 'brume' | 'orage' | 'vent' | 'beau'
  function ambiance(t, force) {
    t = t || Date.now();
    var d = new Date(t), j = jourAn(d), s = saisonDe(d), D = (lireV(CLE) || {}), P = lireV(CLE_POS) || {};
    var reel = !!(P.actif && D.t && t - D.t < PERIME), min = d.getHours() * 60 + d.getMinutes(), jourN = Math.floor(t / 86400000);
    var a = { saison: s, pluie: 0, neige: 0, solNeige: 0, feuilles: 0, petales: 0, lucioles: 0, brouillard: 0, couvert: 0, orage: false, vent: 0.15, temp: null, source: reel ? 'locale' : 'saison', texte: '' };
    var noel = j >= 1218 || j <= 103;
    if (reel) {
      var c = D.code, f = 0;
      a.temp = D.temp; a.vent = Math.min(1, (D.vent || 0) / 45); a.couvert = Math.min(1, (D.nuages || 0) / 100);
      if (c === 45 || c === 48) a.brouillard = 1;
      if (c >= 51 && c <= 57) f = 0.3; else if (c === 61 || c === 80) f = 0.45; else if (c === 63 || c === 81 || c === 66) f = 0.7; else if (c === 65 || c === 82 || c === 67) f = 1;
      else if (c >= 95) { f = 0.85; a.orage = true; }
      if (c >= 71 && c <= 77) a.neige = c === 75 ? 1 : c === 73 ? 0.7 : 0.4; else if (c === 85 || c === 86) a.neige = c === 86 ? 1 : 0.6;
      // Décrochage : près de Noël, la pluie froide tombe en neige ; partout, sous 1,5 °C aussi
      if (f && (D.temp <= 1.5 || (noel && D.temp <= 8))) a.neige = Math.max(a.neige, f); else a.pluie = f;
      if (D.lever != null && D.coucher != null) a.nuit = min < D.lever || min > D.coucher;
    } else {
      // Sans météo : un temps de saison, le même toute la journée (tiré du jour)
      var r = graine(jourN);
      if (s === 'automne') { a.couvert = 0.5; a.vent = 0.35; if (r < 0.3) a.pluie = 0.4; if (min > 360 && min < 600 && r > 0.6) a.brouillard = 0.5; }
      else if (s === 'hiver') { a.couvert = 0.55; if (r < 0.35) a.neige = 0.35; }
      else if (s === 'printemps') { a.couvert = 0.25; a.vent = 0.3; if (r < 0.2) a.pluie = 0.3; }
      else { a.couvert = 0.05; }
    }
    if (a.nuit == null) { var h = d.getHours(); a.nuit = h >= 21 || h < 7; }
    // Décrochages de saison, même s'il fait sec dehors
    if (noel) { a.solNeige = 1; if (!a.pluie && !a.neige && (a.couvert > 0.4 || a.nuit)) a.neige = 0.25; }   // un Noël blanc
    else if (s === 'hiver' && a.neige >= 0.4) a.solNeige = 0.6;
    if (s === 'automne') a.feuilles = Math.min(1, 0.35 + a.vent * 0.9);
    if (s === 'printemps' && !a.pluie) a.petales = Math.min(1, 0.2 + a.vent * 0.8);
    if (s === 'ete' && a.nuit && !a.pluie) a.lucioles = 0.8;
    if (force) {
      a = Object.assign(a, { pluie: 0, neige: 0, brouillard: 0, orage: false, source: 'essai' });
      if (force === 'pluie') { a.pluie = 0.8; a.couvert = 0.9; a.vent = 0.3; }
      else if (force === 'neige') { a.neige = 0.8; a.solNeige = 1; a.couvert = 0.6; }
      else if (force === 'brume') { a.brouillard = 1; a.couvert = 0.5; }
      else if (force === 'orage') { a.pluie = 1; a.orage = true; a.couvert = 1; a.vent = 0.7; }
      else if (force === 'vent') { a.vent = 1; a.feuilles = 1; a.couvert = 0.4; }
      else if (force === 'beau') { a.couvert = 0; a.vent = 0.1; a.feuilles = 0; a.petales = 0; a.solNeige = 0; }
    }
    a.texte = (a.orage ? 'Orage' : a.neige >= 0.6 ? 'Neige' : a.neige ? 'Quelques flocons' : a.pluie >= 0.6 ? 'Pluie' : a.pluie ? 'Petite pluie' :
               a.brouillard >= 0.8 ? 'Brouillard' : a.couvert > 0.7 ? 'Ciel couvert' : a.couvert > 0.3 ? 'Quelques nuages' : a.nuit ? 'Nuit claire' : 'Beau temps') +
              (a.temp != null ? ', ' + Math.round(a.temp) + ' °C' : '');
    return a;
  }

  // ---------- Les effets à l'écran ----------
  var CSS = '.mto{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3}.mto i{position:absolute;display:block;top:-12%}' +
    '.mto .gris{position:absolute;inset:0;background:#4d5866;mix-blend-mode:multiply}' +
    '.mto .brume{position:absolute;left:-30%;width:160%;height:45%;background:radial-gradient(ellipse at center,rgba(235,240,244,.85),rgba(235,240,244,0) 70%);animation:mto-brume 26s ease-in-out infinite alternate}' +
    '.mto .eclair{position:absolute;inset:0;background:#fff;opacity:0;animation:mto-eclair 9s infinite}' +
    '.mto .goutte{width:2px;height:26px;border-radius:1px;background:linear-gradient(rgba(70,100,140,0),rgba(70,100,140,.9));animation:mto-pluie linear infinite}' +
    '.mto .flocon{width:5px;height:5px;border-radius:50%;background:#fff;box-shadow:0 0 0 .6px rgba(120,140,160,.5),0 0 3px rgba(255,255,255,.9);animation:mto-neige linear infinite}' +
    '.mto .feuille{width:10px;height:7px;border-radius:0 80% 0 80%;animation:mto-feuille linear infinite}' +
    '.mto .petale{width:6px;height:5px;border-radius:60% 0 60% 0;background:#ffd6e4;animation:mto-feuille linear infinite}' +
    '.mto .luciole{width:4px;height:4px;border-radius:50%;background:#e6ff7a;box-shadow:0 0 6px 2px rgba(220,255,120,.7);top:auto;animation:mto-luciole ease-in-out infinite alternate}' +
    '@keyframes mto-pluie{to{transform:translate(var(--dx),125vh)}}' +
    '@keyframes mto-neige{0%{transform:translate(0,0)}50%{transform:translate(calc(var(--dx) * .5 + 12px),62vh)}100%{transform:translate(var(--dx),125vh)}}' +
    '@keyframes mto-feuille{0%{transform:translate(0,0) rotate(0)}25%{transform:translate(calc(var(--dx) * .25 + 18px),30vh) rotate(160deg)}50%{transform:translate(calc(var(--dx) * .5 - 10px),60vh) rotate(320deg)}100%{transform:translate(var(--dx),125vh) rotate(700deg)}}' +
    '@keyframes mto-luciole{0%{transform:translate(0,0);opacity:.2}50%{opacity:1}100%{transform:translate(18px,-26px);opacity:.3}}' +
    '@keyframes mto-brume{to{transform:translateX(18%)}}' +
    '@keyframes mto-eclair{0%,93%,100%{opacity:0}94%{opacity:.75}95%{opacity:.1}96.5%{opacity:.55}}' +
    '@media (prefers-reduced-motion:reduce){.mto i{animation:none!important;display:none}.mto .eclair{display:none}}';
  function styles() {
    if (typeof document === 'undefined' || document.getElementById('mto-css')) return;
    var st = document.createElement('style'); st.id = 'mto-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  // HTML des effets (le même à chaque appel pour une même ambiance : rien ne saute quand la page se redessine)
  // op.n = densité (1 par défaut), op.sansCiel = pas de voile gris (scène déjà sombre)
  function calque(a, op) {
    styles(); op = op || {};
    var n = op.n || 1, s = '', k = 0, dx = Math.round(a.vent * 90);
    function r() { return graine(++k * 7.31 + 3); }
    if (!op.sansCiel) {
      var g = a.couvert * 0.22 + (a.pluie ? 0.1 : 0) + (a.orage ? 0.18 : 0) + (a.neige ? 0.04 : 0);
      if (g > 0.02) s += '<div class="gris" style="opacity:' + g.toFixed(2) + '"></div>';
      if (a.pluie) s += '<div class="gris" style="background:#2b5c8a;opacity:' + (a.pluie * 0.12).toFixed(2) + '"></div>';
      if (a.solNeige) s += '<div class="gris" style="background:#fff;mix-blend-mode:soft-light;opacity:' + (a.solNeige * 0.5).toFixed(2) + '"></div>';
    }
    if (a.brouillard) for (var b = 0; b < 3; b++) s += '<div class="brume" style="top:' + (b * 30 - 5) + '%;opacity:' + (a.brouillard * (0.55 + b * 0.12)).toFixed(2) + ';animation-delay:-' + (b * 7) + 's"></div>';
    var goutte = Math.round(a.pluie * 95 * n);
    for (var q = 0; q < goutte; q++) s += '<i class="goutte" style="left:' + (r() * 110 - 10).toFixed(1) + '%;--dx:' + (dx * 0.6) + 'px;transform:rotate(' + (-dx / 9).toFixed(1) + 'deg);animation-duration:' + (0.55 + r() * 0.35).toFixed(2) + 's;animation-delay:-' + (r() * 2).toFixed(2) + 's"></i>';
    var fl = Math.round(a.neige * 75 * n);
    for (q = 0; q < fl; q++) { var t = (3 + r() * 5).toFixed(1); s += '<i class="flocon" style="left:' + (r() * 110 - 10).toFixed(1) + '%;--dx:' + (dx + r() * 30 - 15).toFixed(0) + 'px;width:' + t + 'px;height:' + t + 'px;animation-duration:' + (5 + r() * 5).toFixed(1) + 's;animation-delay:-' + (r() * 10).toFixed(1) + 's"></i>'; }
    var fe = Math.round(a.feuilles * 22 * n), C = ['#d9480f', '#e8590c', '#f08c00', '#c92a2a', '#a0522d'];
    for (q = 0; q < fe; q++) s += '<i class="feuille" style="left:' + (r() * 100).toFixed(1) + '%;background:' + C[q % C.length] + ';--dx:' + (40 + dx * 1.6).toFixed(0) + 'px;animation-duration:' + (7 + r() * 6 - a.vent * 3).toFixed(1) + 's;animation-delay:-' + (r() * 12).toFixed(1) + 's"></i>';
    var pe = Math.round(a.petales * 12 * n);
    for (q = 0; q < pe; q++) s += '<i class="petale" style="left:' + (r() * 100).toFixed(1) + '%;--dx:' + (30 + dx).toFixed(0) + 'px;animation-duration:' + (8 + r() * 5).toFixed(1) + 's;animation-delay:-' + (r() * 12).toFixed(1) + 's"></i>';
    var lu = Math.round(a.lucioles * 12 * n);
    for (q = 0; q < lu; q++) s += '<i class="luciole" style="left:' + (r() * 95).toFixed(1) + '%;bottom:' + (5 + r() * 55).toFixed(1) + '%;animation-duration:' + (2 + r() * 3).toFixed(1) + 's;animation-delay:-' + (r() * 4).toFixed(1) + 's"></i>';
    if (a.orage) s += '<div class="eclair"></div>';
    return s;
  }
  // Pour la vue d'une fenêtre (maison) : un mot suffit
  function fenetre(a) {
    if (!a) return null;
    return { pluie: a.pluie, neige: a.neige, sol: a.solNeige, brume: a.brouillard, gris: a.couvert, orage: a.orage };
  }

  return { etat: etat, activer: activer, desactiver: desactiver, refuser: refuser, rafraichir: rafraichir, demarrer: demarrer,
           ambiance: ambiance, calque: calque, fenetre: fenetre, saisonDe: saisonDe };
})();
if (typeof module !== 'undefined') module.exports = Meteo;
