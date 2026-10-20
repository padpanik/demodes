// ================== MON COMPAGNON : ESPÈCES, BESOINS, BOUTIQUE ET DESSIN ==================
// Partagé par compagnon.html et l'accueil (qui montre le compagnon sur sa carte).

var CP = (function () {
  var ESPECES = [
    { id: 'chat', nom: 'Chat', exemple: 'Minou', couleurs: ['#f0a04b', '#7d8a94', '#3b3b3b', '#f4e6d4'] },
    { id: 'chien', nom: 'Chien', exemple: 'Biscotte', couleurs: ['#c8915a', '#f4e6d4', '#5b4636', '#e8c07a'] },
    { id: 'chevre', nom: 'Chèvre', exemple: 'Blanchette', couleurs: ['#f2efe8', '#c9a27a', '#8d8d8d'] },
    { id: 'dragon', nom: 'Dragon', exemple: 'Flammèche', couleurs: ['#4caf7a', '#7e57c2', '#e5533d', '#3a8fd8'] },
    { id: 'lapin', nom: 'Lapin', exemple: 'Pompon', couleurs: ['#f4f1ec', '#b9a28a', '#8d8d8d', '#e9c9a6'] },
    { id: 'renard', nom: 'Renard', exemple: 'Roussette', couleurs: ['#e8772e', '#c95a3a', '#d9cbb8'] },
    { id: 'panda', nom: 'Panda', exemple: 'Bambou', couleurs: ['#f6f4ee', '#f3e6d0', '#f6e1e8'] },
    { id: 'tortue', nom: 'Tortue', exemple: 'Pistache', couleurs: ['#8bc34a', '#4fae6a', '#b5a36a'] },
    { id: 'raton', nom: 'Raton laveur', exemple: 'Filou', couleurs: ['#9a9a9a', '#8d7f72', '#b3aca3'] },
    { id: 'singe', nom: 'Singe', exemple: 'Banjo', couleurs: ['#8d5b3a', '#a8794f', '#5d4037'] },
    { id: 'oie', nom: 'Oie', exemple: 'Capucine', couleurs: ['#f7f7f2', '#cfd4d8', '#ecdcbf'] },
    { id: 'ecureuil', nom: 'Écureuil', exemple: 'Noisette', couleurs: ['#c96a2b', '#8d6e63', '#a0522d'] }
  ];
  // ================== BESOINS (en %, ils baissent doucement avec le temps réel) ==================
  // Heures pour passer de plein à vide : on nourrit matin et soir, on donne à boire, un bain tous les deux jours…
  var BESOINS = [
    { id: 'repas', nom: 'Repas', ico: '🍖', action: 'Nourrir', heures: 14, gain: 45, effet: '😋' },
    { id: 'eau', nom: 'Eau', ico: '💧', action: 'Donner', heures: 12, gain: 60, effet: '💦' },
    { id: 'toilette', nom: 'Toilette', ico: '🛁', action: 'Laver', heures: 40, gain: 100, effet: '🫧' },
    { id: 'calin', nom: 'Câlins', ico: '❤️', action: 'Câliner', heures: 20, gain: 34, effet: '❤️' }
  ];
  var RECOMPENSE_JOUR = 3, RECOMPENSE_SEMAINE = 10;

  // ================== BOUTIQUE ==================
  // slot : où se porte ou se pose l'objet (un seul par emplacement) ; conso : se consomme (friandises)
  var RAYONS = [{ id: 'tete', nom: '🎩 Tête' }, { id: 'cou', nom: '🎀 Cou' }, { id: 'corps', nom: '🧥 Habits' },
                  { id: 'maison', nom: '🛏️ Couchage' }, { id: 'deco', nom: '🪴 Déco' }, { id: 'gourmand', nom: '🍪 Friandises' }];
  var ARTICLES = [
    { id: 'bonnet', rayon: 'tete', slot: 'tete', nom: 'Bonnet de laine', desc: 'Bien au chaud en hiver', prix: 12, couleur: '#3a8fd8' },
    { id: 'chapeau', rayon: 'tete', slot: 'tete', nom: 'Chapeau melon', desc: 'Très distingué', prix: 25, couleur: '#2b2b2b' },
    { id: 'fleur', rayon: 'tete', slot: 'tete', nom: 'Fleur', desc: 'Une jolie fleur à l\'oreille', prix: 8, couleur: '#f06292' },
    { id: 'couronne', rayon: 'tete', slot: 'tete', nom: 'Couronne', desc: 'Pour un vrai petit roi', prix: 80, couleur: '#f4c430' },
    { id: 'collier', rayon: 'cou', slot: 'cou', nom: 'Collier rouge', desc: 'Le classique', prix: 6, couleur: '#d64541' },
    { id: 'noeud', rayon: 'cou', slot: 'cou', nom: 'Nœud papillon', desc: 'Pour les grandes occasions', prix: 15, couleur: '#7e57c2' },
    { id: 'echarpe', rayon: 'cou', slot: 'cou', nom: 'Écharpe', desc: 'Douce et chaude', prix: 18, couleur: '#2e9e6b' },
    { id: 'laisse', rayon: 'cou', slot: 'cou', nom: 'Collier et laisse', desc: 'Prêt pour la promenade', prix: 14, couleur: '#c0392b' },
    { id: 'laisse-luxe', rayon: 'cou', slot: 'cou', nom: 'Laisse de grande marque', desc: 'Cuir et dorures', prix: 60, couleur: '#8b5a2b' },
    { id: 'pull', rayon: 'corps', slot: 'corps', nom: 'Petit pull', desc: 'Tricoté main', prix: 20, couleur: '#e67e22' },
    { id: 'manteau', rayon: 'corps', slot: 'corps', nom: 'Manteau d\'hiver', desc: 'Indispensable quand il neige', prix: 35, couleur: '#2c5aa0' },
    { id: 'cape', rayon: 'corps', slot: 'corps', nom: 'Cape de héros', desc: 'Pour les jours de bravoure', prix: 45, couleur: '#c0392b' },
    { id: 'coussin', rayon: 'maison', slot: 'couchage', nom: 'Coussin', desc: 'Pour la sieste', prix: 8, ico: '🟫', place: true },
    { id: 'panier', rayon: 'maison', slot: 'couchage', nom: 'Panier douillet', desc: 'Un vrai lit à soi', prix: 20, ico: '🧺', place: true },
    { id: 'niche', rayon: 'maison', slot: 'couchage', nom: 'Niche en bois', desc: 'Une petite maison', prix: 40, ico: '🛖', place: true },
    { id: 'chateau', rayon: 'maison', slot: 'couchage', nom: 'Petit château', desc: 'Le grand luxe', prix: 120, ico: '🏰', place: true },
    { id: 'plante', rayon: 'deco', slot: 'plante', nom: 'Plante verte', desc: 'Un peu de nature', prix: 10, ico: '🪴', place: true },
    { id: 'tableau', rayon: 'deco', slot: 'mur', nom: 'Tableau', desc: 'Un paysage au mur', prix: 22, ico: '🖼️', place: true },
    { id: 'horloge', rayon: 'deco', slot: 'mur2', nom: 'Horloge', desc: 'Tic, tac…', prix: 18, ico: '🕰️', place: true },
    { id: 'lampe', rayon: 'deco', slot: 'lampe', nom: 'Lampe', desc: 'Une lumière douce le soir', prix: 16, ico: '💡', place: true },
    { id: 'rideaux', rayon: 'deco', slot: 'fenetre', nom: 'Rideaux', desc: 'Pour la fenêtre', prix: 14, place: true, ico: '🪟' },
    { id: 'balle', rayon: 'deco', slot: 'jouet', nom: 'Balle', desc: 'Pour jouer', prix: 5, ico: '⚽', place: true },
    { id: 'peluche', rayon: 'deco', slot: 'jouet', nom: 'Peluche', desc: 'Son doudou', prix: 12, ico: '🧸', place: true },
    { id: 'biscuit', rayon: 'gourmand', nom: 'Biscuit', desc: 'Remplit l\'assiette et fait plaisir', prix: 3, ico: '🍪', conso: true, effets: { repas: 40, calin: 15 } },
    { id: 'gateau', rayon: 'gourmand', nom: 'Gâteau de fête', desc: 'Un vrai festin', prix: 10, ico: '🎂', conso: true, effets: { repas: 100, calin: 40 } }
  ];
  // Où se posent les objets de la pièce

  // Besoins (en %) au moment t, d'après le dernier soin de chacun
  function niveaux(a, t) {
    var r = {};
    BESOINS.forEach(b => {
      var perte = ((t || Date.now()) - a.besoins[b.id].t) / 3600000 * (100 / b.heures);
      r[b.id] = Math.max(0, Math.min(100, Math.round(a.besoins[b.id].v - perte)));
    });
    return r;
  }
  function humeur(n) {
    var m = BESOINS.reduce((s, b) => s + n[b.id], 0) / BESOINS.length, min = Math.min.apply(null, BESOINS.map(b => n[b.id]));
    return min < 20 || m < 35 ? 'triste' : m > 70 ? 'content' : 'calme';
  }
  // Âge du compagnon, depuis son adoption
  function age(ne) {
    if (!ne) return '';
    var j = Math.floor((Date.now() - ne) / 86400000);
    return j < 1 ? 'adopté aujourd\'hui' : j < 60 ? j + ' jour' + (j > 1 ? 's' : '') : Math.floor(j / 30) + ' mois';
  }
  function estNuit(t) { var h = new Date(t || Date.now()).getHours(); return h >= 21 || h < 7; }

  // dort : yeux fermés (la nuit)
  function dessin(a, humeur, dort) {
    var c = a.couleur, fonce = nuance(c, -0.25), clair = nuance(c, 0.45), e = a.espece, p = a.porte || {};
    var noir = '#2b2b2b';
    if (e === 'panda') { fonce = noir; clair = nuance(c, 0.6); }
    var s = '', triste = humeur === 'triste';
    // Derrière : queue, ailes
    if (e === 'chat') s += '<path d="M150 170 Q190 150 178 105" stroke="' + c + '" stroke-width="13" fill="none" stroke-linecap="round"/>';
    if (e === 'chien') s += '<path d="M150 165 Q178 150 172 128" stroke="' + c + '" stroke-width="12" fill="none" stroke-linecap="round"/>';
    if (e === 'renard') s += '<path d="M146 175 Q200 168 186 112 Q172 140 146 150 Z" fill="' + c + '"/><path d="M186 112 Q190 128 178 136 Q182 120 186 112Z" fill="#fff"/>';
    if (e === 'lapin') s += '<circle cx="150" cy="168" r="13" fill="#fff"/>';
    if (e === 'chevre') s += '<path d="M148 150 l12 -14 l-2 18 z" fill="' + c + '"/>';
    if (e === 'raton') s += '<path d="M146 176 Q194 166 186 112" stroke="' + c + '" stroke-width="17" fill="none" stroke-linecap="round"/>' +
                            '<path d="M146 176 Q194 166 186 112" stroke="#3a3a3a" stroke-width="17" fill="none" stroke-dasharray="9 10" stroke-dashoffset="4"/>';
    if (e === 'singe') s += '<path d="M150 174 Q198 172 190 132 Q184 108 166 116 Q156 126 170 132" stroke="' + c + '" stroke-width="9" fill="none" stroke-linecap="round"/>';
    if (e === 'ecureuil') s += '<path d="M138 182 Q204 176 198 112 Q194 56 146 62 Q178 90 164 122 Q154 142 138 152 Z" fill="' + c + '"/>' +
                               '<path d="M150 160 Q190 150 184 112 Q182 84 164 76" stroke="' + clair + '" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7"/>';
    if (e === 'tortue') s += '<path d="M150 178 l18 -4 l-16 -8 z" fill="' + c + '"/>';
    if (e === 'dragon') s += '<path d="M60 128 Q20 92 34 70 Q44 96 66 108 Z" fill="' + fonce + '"/><path d="M140 128 Q180 92 166 70 Q156 96 134 108 Z" fill="' + fonce + '"/>' +
                              '<path d="M146 172 Q196 172 190 140 l10 -6 l-14 -2 Q182 160 146 158 Z" fill="' + c + '"/>';
    // Corps
    s += '<g class="corps-anime">';
    s += '<ellipse cx="100" cy="201" rx="60" ry="9" fill="rgba(0,0,0,0.22)" filter="url(#v-flou)"/>';
    s += '<ellipse cx="100" cy="158" rx="54" ry="42" fill="' + c + '"/>';
    s += '<ellipse cx="100" cy="166" rx="32" ry="28" fill="' + clair + '"/>';
    var pattes = e === 'oie' ? '#f39c12' : fonce;
    s += '<ellipse cx="74" cy="196" rx="15" ry="8" fill="' + pattes + '"/><ellipse cx="126" cy="196" rx="15" ry="8" fill="' + pattes + '"/>';
    // Tortue : la carapace sur le dos ; oie : ses ailes
    if (e === 'tortue') s += '<path d="M42 170 Q42 112 100 108 Q158 112 158 170 Q100 184 42 170Z" fill="#9b6a3a"/>' +
      '<path d="M100 120 L118 132 L114 152 L86 152 L82 132 Z" fill="#b8854c"/><path d="M100 120 L100 110 M118 132 L140 124 M114 152 L134 166 M86 152 L66 166 M82 132 L60 124" stroke="#7a4f27" stroke-width="3"/>' +
      '<path d="M42 170 Q100 186 158 170" stroke="#e3c27a" stroke-width="6" fill="none" stroke-linecap="round"/>';
    if (e === 'oie') s += '<ellipse cx="54" cy="160" rx="15" ry="28" fill="' + fonce + '" transform="rotate(18 54 160)"/><ellipse cx="146" cy="160" rx="15" ry="28" fill="' + fonce + '" transform="rotate(-18 146 160)"/>';
    if (e === 'panda') s += '<path d="M48 150 Q50 124 74 120 L78 172 Q60 176 48 150Z M152 150 Q150 124 126 120 L122 172 Q140 176 152 150Z" fill="' + noir + '"/>';
    if (p.corps) s += habit(p.corps, c);
    // Oreilles (derrière la tête)
    if (e === 'chat') s += '<path d="M58 58 L60 12 L94 44 Z" fill="' + c + '"/><path d="M142 58 L140 12 L106 44 Z" fill="' + c + '"/><path d="M64 48 L65 24 L84 42 Z" fill="#f4a9b8"/><path d="M136 48 L135 24 L116 42 Z" fill="#f4a9b8"/>';
    if (e === 'renard') s += '<path d="M56 60 L58 8 L96 44 Z" fill="' + c + '"/><path d="M144 60 L142 8 L104 44 Z" fill="' + c + '"/><path d="M62 50 L63 22 L84 42 Z" fill="#3b2a20"/><path d="M138 50 L137 22 L116 42 Z" fill="#3b2a20"/>';
    if (e === 'lapin') s += '<ellipse cx="78" cy="22" rx="13" ry="38" fill="' + c + '" transform="rotate(-10 78 22)"/><ellipse cx="122" cy="22" rx="13" ry="38" fill="' + c + '" transform="rotate(10 122 22)"/>' +
                             '<ellipse cx="78" cy="24" rx="6" ry="28" fill="#f4a9b8" transform="rotate(-10 78 22)"/><ellipse cx="122" cy="24" rx="6" ry="28" fill="#f4a9b8" transform="rotate(10 122 22)"/>';
    if (e === 'chevre') s += '<path d="M76 42 Q62 6 88 16 Q78 24 84 42Z" fill="#cdbb9c"/><path d="M124 42 Q138 6 112 16 Q122 24 116 42Z" fill="#cdbb9c"/>' +
                              '<ellipse cx="48" cy="72" rx="20" ry="9" fill="' + c + '" transform="rotate(20 48 72)"/><ellipse cx="152" cy="72" rx="20" ry="9" fill="' + c + '" transform="rotate(-20 152 72)"/>';
    if (e === 'dragon') s += '<path d="M72 44 L66 6 L88 36 Z" fill="#f4d58d"/><path d="M128 44 L134 6 L112 36 Z" fill="#f4d58d"/><path d="M92 36 L100 22 L108 36Z" fill="' + fonce + '"/>';
    if (e === 'raton') s += '<path d="M58 60 Q54 22 90 42 Z" fill="' + c + '"/><path d="M142 60 Q146 22 110 42 Z" fill="' + c + '"/><path d="M64 52 Q62 32 82 44 Z" fill="#3a3a3a"/><path d="M136 52 Q138 32 118 44 Z" fill="#3a3a3a"/>';
    if (e === 'singe') s += '<circle cx="48" cy="84" r="17" fill="' + c + '"/><circle cx="152" cy="84" r="17" fill="' + c + '"/><circle cx="48" cy="84" r="9" fill="' + nuance(c, 0.55) + '"/><circle cx="152" cy="84" r="9" fill="' + nuance(c, 0.55) + '"/>';
    if (e === 'ecureuil') s += '<path d="M64 54 L60 14 L92 42 Z" fill="' + c + '"/><path d="M136 54 L140 14 L108 42 Z" fill="' + c + '"/><path d="M60 16 Q56 4 64 8 Q62 2 68 10 Z" fill="' + c + '"/><path d="M140 16 Q144 4 136 8 Q138 2 132 10 Z" fill="' + c + '"/>' +
                               '<path d="M68 46 L66 26 L84 42 Z" fill="#f4a9b8"/><path d="M132 46 L134 26 L116 42 Z" fill="#f4a9b8"/>';
    if (e === 'oie') s += '<path d="M96 36 Q100 22 108 30 Q102 30 104 38Z" fill="' + c + '"/>';
    if (e === 'panda') s += '<circle cx="60" cy="42" r="17" fill="' + noir + '"/><circle cx="140" cy="42" r="17" fill="' + noir + '"/>';
    // Tête
    s += '<circle cx="100" cy="82" r="48" fill="' + c + '"/>';
    // Panda : taches autour des yeux, avec le blanc de l'œil pour qu'on les voie
    if (e === 'panda') s += '<ellipse cx="78" cy="82" rx="15" ry="19" fill="' + noir + '" transform="rotate(25 78 82)"/><ellipse cx="122" cy="82" rx="15" ry="19" fill="' + noir + '" transform="rotate(-25 122 82)"/>' +
                             (dort ? '' : '<circle cx="80" cy="80" r="10" fill="#fff"/><circle cx="120" cy="80" r="10" fill="#fff"/>');
    if (e === 'chien') s += '<ellipse cx="54" cy="78" rx="15" ry="30" fill="' + fonce + '" transform="rotate(18 54 78)"/><ellipse cx="146" cy="78" rx="15" ry="30" fill="' + fonce + '" transform="rotate(-18 146 78)"/>';
    if (e === 'raton') s += '<path d="M60 64 Q80 58 100 70 Q120 58 140 64" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9"/>' +
                            '<path d="M52 78 Q76 64 100 80 Q124 64 148 78 Q150 96 128 96 Q112 92 100 94 Q88 92 72 96 Q50 96 52 78Z" fill="#3a3a3a"/>' +
                            (dort ? '' : '<circle cx="80" cy="80" r="10" fill="#fff"/><circle cx="120" cy="80" r="10" fill="#fff"/>');
    if (e === 'singe') s += '<path d="M100 70 Q84 50 68 64 Q54 80 64 104 Q78 128 100 128 Q122 128 136 104 Q146 80 132 64 Q116 50 100 70Z" fill="' + nuance(c, 0.55) + '"/>';
    if (e === 'renard') s += '<path d="M60 92 Q100 140 140 92 Q130 120 100 124 Q70 120 60 92Z" fill="#fff"/>';
    if (e !== 'oie' && e !== 'singe') s += '<ellipse cx="100" cy="102" rx="22" ry="15" fill="' + (e === 'raton' ? '#f4f1ec' : clair) + '"/>';
    // Yeux : ouverts, fermés (la nuit), tristes
    var paupiere = (e === 'panda' || e === 'raton') ? '#fff' : '#2b2b2b';
    if (dort) s += '<path d="M72 80 q8 6 16 0" stroke="' + paupiere + '" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M112 80 q8 6 16 0" stroke="' + paupiere + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    else s += '<g class="yeux"><ellipse cx="80" cy="80" rx="8" ry="10" fill="#2b2b2b"/><ellipse cx="120" cy="80" rx="8" ry="10" fill="#2b2b2b"/>' +
              '<circle cx="83" cy="76" r="3.4" fill="#fff"/><circle cx="123" cy="76" r="3.4" fill="#fff"/><circle cx="77" cy="85" r="1.6" fill="#fff" opacity="0.7"/><circle cx="117" cy="85" r="1.6" fill="#fff" opacity="0.7"/></g>' +
              (triste ? '<path d="M68 68 L86 62 M132 68 L114 62" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round"/><ellipse cx="128" cy="94" rx="3" ry="5" fill="#7fc8f8"/>' : '');
    // Joues, nez, bouche
    s += '<ellipse cx="66" cy="98" rx="9" ry="6" fill="#f48fb1" opacity="0.55"/><ellipse cx="134" cy="98" rx="9" ry="6" fill="#f48fb1" opacity="0.55"/>';
    if (e === 'oie') s += '<path d="M82 98 Q100 84 118 98 Q100 104 82 98Z" fill="#f7a531"/><path d="M84 99 Q100 106 116 99 Q100 120 84 99Z" fill="#e8891a"/>';
    else s += e === 'dragon' || e === 'tortue' ? '<circle cx="94" cy="96" r="2.5" fill="' + fonce + '"/><circle cx="106" cy="96" r="2.5" fill="' + fonce + '"/>' : '<ellipse cx="100" cy="96" rx="6" ry="4.5" fill="#3b2a2a"/>';
    if (e !== 'oie') s += triste ? '<path d="M90 112 q10 -8 20 0" stroke="#3b2a2a" stroke-width="3" fill="none" stroke-linecap="round"/>'
       : humeur === 'content' ? '<path d="M88 104 q12 14 24 0" stroke="#3b2a2a" stroke-width="3" fill="#e57373" stroke-linecap="round"/>'
       : '<path d="M92 106 q8 6 16 0" stroke="#3b2a2a" stroke-width="3" fill="none" stroke-linecap="round"/>';
    if (e === 'chevre') s += '<path d="M94 122 Q100 146 106 122 Z" fill="#e8e2d6"/>';
    if (e === 'ecureuil' && !triste) s += '<rect x="95.5" y="106" width="9" height="8" rx="2" fill="#fff" stroke="#d8cfc4" stroke-width="1"/><path d="M100 106 v8" stroke="#d8cfc4" stroke-width="1"/>';
    if (e === 'chat' || e === 'renard' || e === 'raton' || e === 'ecureuil') s += '<path d="M60 98 l-22 -4 M60 104 l-22 4 M140 98 l22 -4 M140 104 l22 4" stroke="#2b2b2b" stroke-width="1.5" opacity="0.5"/>';
    if (p.cou) s += accessoireCou(p.cou);
    if (p.tete) s += chapeau(p.tete);
    // Reflets : lumière venant d'en haut à gauche (tête et ventre)
    s += '<ellipse cx="80" cy="56" rx="20" ry="12" fill="#fff" opacity="0.28" transform="rotate(-25 80 56)"/>';
    s += '<ellipse cx="74" cy="138" rx="14" ry="8" fill="#fff" opacity="0.18" transform="rotate(-30 74 138)"/>';
    s += '</g>';
    return relief(s, { c: c, f: fonce, l: clair, n: noir });
  }
  // « Niveau 1 » de relief : chaque couleur unie devient un dégradé arrondi (clair en haut à gauche, sombre en bas à droite)
  function relief(s, couleurs) {
    var defs = '<defs><filter id="v-flou" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3.5"/></filter>';
    Object.keys(couleurs).forEach(k => {
      var c = couleurs[k], id = 'v-' + c.slice(1);
      defs += '<radialGradient id="' + id + '" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="' + nuance(c, 0.38) + '"/>' +
              '<stop offset="0.55" stop-color="' + c + '"/><stop offset="1" stop-color="' + nuance(c, -0.22) + '"/></radialGradient>';
      s = s.split('fill="' + c + '"').join('fill="url(#' + id + ')"');
    });
    return defs + '</defs>' + s;
  }
  function nuance(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var f = x => Math.round(k < 0 ? x * (1 + k) : x + (255 - x) * k);
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function art(id) { return ARTICLES.find(a => a.id === id) || {}; }
  function habit(id, c) {
    var a = art(id), k = a.couleur;
    if (id === 'cape') return '<path d="M56 132 Q100 120 144 132 L154 196 Q100 206 46 196 Z" fill="' + k + '"/><ellipse cx="100" cy="166" rx="32" ry="28" fill="' + nuance(c, 0.45) + '"/>';
    var r = '<path d="M50 150 Q52 120 100 118 Q148 120 150 150 L148 178 Q100 192 52 178 Z" fill="' + k + '"/>';
    if (id === 'manteau') r += '<path d="M100 120 L100 186" stroke="' + nuance(k, -0.3) + '" stroke-width="3"/><circle cx="108" cy="140" r="3.5" fill="#f4c430"/><circle cx="108" cy="158" r="3.5" fill="#f4c430"/><circle cx="108" cy="176" r="3.5" fill="#f4c430"/>' +
                             '<path d="M52 176 Q100 192 148 176" stroke="#fff" stroke-width="6" fill="none" opacity="0.9"/>';
    if (id === 'pull') r += '<path d="M56 140 Q100 152 144 140 M54 160 Q100 172 146 160" stroke="' + nuance(k, 0.4) + '" stroke-width="5" fill="none"/>';
    return r;
  }
  function accessoireCou(id) {
    var k = art(id).couleur;
    if (id === 'noeud') return '<path d="M100 128 L78 116 L78 140 Z M100 128 L122 116 L122 140 Z" fill="' + k + '"/><circle cx="100" cy="128" r="6" fill="' + nuance(k, -0.3) + '"/>';
    if (id === 'echarpe') return '<path d="M60 118 Q100 136 140 118 L142 130 Q100 148 58 130 Z" fill="' + k + '"/><path d="M118 132 L126 172 L112 172 L108 136Z" fill="' + k + '"/>';
    var r = '<path d="M62 122 Q100 140 138 122" stroke="' + k + '" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="100" cy="134" r="5" fill="#f4c430"/>';
    if (id === 'laisse' || id === 'laisse-luxe') r += '<path d="M100 136 Q140 170 196 150" stroke="' + k + '" stroke-width="' + (id === 'laisse-luxe' ? 5 : 3.5) + '" fill="none"/>' +
                                                      (id === 'laisse-luxe' ? '<path d="M100 136 Q140 170 196 150" stroke="#f4c430" stroke-width="1.5" stroke-dasharray="4 6" fill="none"/>' : '');
    return r;
  }
  function chapeau(id) {
    var k = art(id).couleur;
    if (id === 'bonnet') return '<path d="M58 60 Q60 18 100 16 Q140 18 142 60 Z" fill="' + k + '"/><rect x="54" y="52" width="92" height="14" rx="7" fill="#fff"/><circle cx="100" cy="14" r="10" fill="#fff"/>';
    if (id === 'chapeau') return '<ellipse cx="100" cy="42" rx="46" ry="9" fill="' + k + '"/><path d="M72 42 Q72 6 100 6 Q128 6 128 42Z" fill="' + k + '"/><rect x="72" y="30" width="56" height="7" fill="#c0392b"/>';
    if (id === 'couronne') return '<path d="M68 44 L72 14 L86 30 L100 8 L114 30 L128 14 L132 44 Z" fill="' + k + '" stroke="#c99a00" stroke-width="2"/><circle cx="100" cy="30" r="4" fill="#e53935"/>';
    if (id === 'fleur') return '<g transform="translate(132 42)"><circle r="7" cx="0" cy="-9" fill="' + k + '"/><circle r="7" cx="9" cy="0" fill="' + k + '"/><circle r="7" cx="0" cy="9" fill="' + k + '"/><circle r="7" cx="-9" cy="0" fill="' + k + '"/><circle r="6" fill="#ffd54f"/></g>';
    return '';
  }

  // ================== VEILLE : le compagnon parle de lui-même tant que l'appli est ouverte ==================
  // Une petite bulle dans l'appli, ou une notification du téléphone si l'appli est en arrière-plan (et autorisée).
  // Pas plus d'un message toutes les 20 min, rien la nuit (il dort), une même demande au plus toutes les 3 h.
  var GENTILS = ['Coucou ! Je pense à toi 💛', 'J\'aime bien quand tu es là 😊', 'Une petite partie avec les amis ? 🎲',
    'Merci de prendre soin de moi 🥰', 'Tu joues drôlement bien aujourd\'hui !', 'On fait un câlin tout à l\'heure ? 🤗',
    'Il fait bon dans ma maison ☀️', 'Je t\'ai gardé une place sur le coussin 🛋️', 'Tu me racontes ta journée ? 🙂',
    'Je suis fier de toi ! ⭐', 'Pense à boire un verre d\'eau toi aussi 💧', 'Tu m\'as manqué ! 🐾'];
  var DEMANDES = { repas: 'J\'ai un petit creux… tu me donnes à manger ? 🍖', eau: 'J\'ai soif ! Un peu d\'eau ? 💧',
                   toilette: 'Je suis tout sale… un petit bain ? 🛁', calin: 'Tu me fais un câlin ? ❤️' };
  var ESPACE_MESSAGES = 20 * 60000, ESPACE_GENTILS = 45 * 60000, ESPACE_DEMANDE = 3 * 3600000;
  function lireV(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function ecrireV(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function reglagesMessages() { return Object.assign({ messages: true, notifications: false }, lireV('compagnon-reglages') || {}); }
  var veille = null;
  function demarrerVeille(page) {
    if (veille) return;
    veille = { page: page || '' };
    setTimeout(verifierVeille, 20000);
    setInterval(verifierVeille, 60000);
  }
  function verifierVeille(forcer) {
    var a = lireV('compagnon-animal'), r = reglagesMessages();
    if (!a || !a.besoins || !r.messages) return null;
    var t = Date.now(), h = new Date(t).getHours();
    if (!forcer && (h >= 21 || h < 8)) return null;                     // la nuit, il dort
    var etat = lireV('compagnon-veille') || { dernier: 0, demandes: {}, jour: '' };
    if (!forcer && t - etat.dernier < ESPACE_MESSAGES) return null;
    var nom = a.nom, prof = lireV('desdale-profil') || {}, qui = prof.pseudo ? ' ' + prof.pseudo : '';
    var d = new Date(t), jour = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
    var msg = null;
    // 1) Une demande, s'il manque quelque chose (le besoin le plus bas d'abord)
    var n = niveaux(a, t);
    var bas = BESOINS.filter(b => n[b.id] < 30 && t - (etat.demandes[b.id] || 0) > ESPACE_DEMANDE).sort((x, y) => n[x.id] - n[y.id]);
    if (bas.length && veille && veille.page !== 'compagnon') { msg = { texte: DEMANDES[bas[0].id], demande: true }; etat.demandes[bas[0].id] = t; }
    // 2) Le premier message de la journée : bonjour
    else if (etat.jour !== jour) msg = { texte: (h < 12 ? 'Bonjour' : h < 18 ? 'Coucou' : 'Bonsoir') + qui + ' ! Je suis content de te voir 🐾' };
    // 3) De temps en temps, un mot gentil
    else if (forcer || (t - etat.dernier > ESPACE_GENTILS && Math.random() < 0.35)) msg = { texte: GENTILS[Math.floor(Math.random() * GENTILS.length)] };
    if (!msg) return null;
    etat.dernier = t; etat.jour = jour;
    ecrireV('compagnon-veille', etat);
    annoncer(a, msg);
    return msg;
  }
  function annoncer(a, msg) {
    // Appli en arrière-plan : notification du téléphone (si autorisée)
    if (document.visibilityState === 'hidden') {
      if (reglagesMessages().notifications && 'Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(reg => reg.showNotification(a.nom, {
          body: msg.texte, icon: 'apple-touch-icon.png', badge: 'favicon.png', tag: 'compagnon', renotify: true,
          data: { url: 'compagnon.html' }
        })).catch(() => {});
      }
      return;
    }
    bulleCompagnon(a, msg);
  }
  // Bulle dans l'appli : son petit dessin, son message, et « J'y vais » pour une demande
  function bulleCompagnon(a, msg) {
    try {
      var ancien = document.getElementById('cp-bulle'); if (ancien) ancien.remove();
      var d = document.createElement('div');
      d.id = 'cp-bulle';
      d.style.cssText = 'position:fixed;left:50%;top:10px;transform:translate(-50%,-140%);z-index:4500;width:calc(100% - 24px);max-width:420px;background:#fff8e7;' +
        'border-radius:18px;box-shadow:0 8px 26px rgba(0,0,0,.22);display:flex;align-items:center;gap:8px;padding:6px 10px 6px 4px;' +
        'font:600 15px system-ui,sans-serif;color:#3b2f1a;transition:transform .45s cubic-bezier(.2,.9,.3,1.2);cursor:pointer';
      var dessinA = '<svg viewBox="0 -6 200 216" width="58" height="62" style="flex-shrink:0">' + dessin(a, msg.demande ? 'triste' : 'content', false) + '</svg>';
      d.innerHTML = dessinA + '<div style="flex:1;min-width:0"><div style="font-weight:900;color:#7a5600">' + String(a.nom).replace(/</g, '&lt;') + '</div>' +
        '<div>' + msg.texte + '</div></div>' +
        (msg.demande ? '<a href="compagnon.html" style="flex-shrink:0;background:#2c3e50;color:#fff;border-radius:12px;padding:8px 10px;text-decoration:none;font-weight:800">J\'y vais</a>' : '');
      document.body.appendChild(d);
      requestAnimationFrame(() => requestAnimationFrame(() => { d.style.transform = 'translate(-50%,0)'; }));
      var fermer = () => { d.style.transform = 'translate(-50%,-140%)'; setTimeout(() => d.remove(), 500); };
      d.addEventListener('click', e => { if (e.target.tagName !== 'A') fermer(); });
      setTimeout(fermer, msg.demande ? 12000 : 7000);
      try { if (navigator.vibrate && lireV('brillant-vibration') !== false) navigator.vibrate(30); } catch (e) {}
    } catch (e) {}
  }


  // ================== DÉFIS DE LA SEMAINE, TROPHÉES ET MAISON ==================
  // Chaque semaine (du lundi au dimanche), trois défis : facile, moyen, difficile. Les mêmes pour tout le monde
  // (tirés d'après le numéro de la semaine). Ils se lisent dans le journal des parties (Etoiles.evenement, dans commun.js).
  // Un défi réussi rapporte une coupe (bronze, argent, or) qu'on ne peut pas acheter, et des étoiles hors plafond.
  // Les trois défis de la même semaine : une clé pour agrandir la maison d'une pièce au choix.
  var NIVEAUX_DEFI = [
    { id: 'bronze', nom: 'Facile', metal: 'Bronze', coupe: 'Coupe de bronze', couleurs: ['#f6c79a', '#c98146', '#7a4220'], etoiles: 3 },
    { id: 'argent', nom: 'Moyen', metal: 'Argent', coupe: 'Coupe d\'argent', couleurs: ['#ffffff', '#c3ccd4', '#6f7c88'], etoiles: 5 },
    { id: 'or', nom: 'Difficile', metal: 'Or', coupe: 'Coupe d\'or', couleurs: ['#fff4b0', '#f0b92a', '#9a6400'], etoiles: 8 }
  ];
  function nb(f) { return evs => evs.filter(f).length; }
  var QL4 = 'Quatre en ligne';
  // Six défis par niveau : ils reviennent tous avant qu'un même défi ne repasse
  var DEFIS = [
    { id: 'ql-normal', niv: 0, ico: '🔴', but: 1, titre: 'Battre l\'ordinateur « Normal » ou « Fort » au Quatre en ligne', compte: nb(e => e.jeu === QL4 && !e.p && e.g && e.i && (e.i.niveau === 'normal' || e.i.niveau === 'fort')) },
    { id: 'yams-solo', niv: 0, ico: '🎲', but: 2, titre: 'Finir 2 parties de Yams seul', compte: nb(e => e.jeu === 'Yams' && !e.p) },
    { id: 'bn-solo', niv: 0, ico: '⚓', but: 1, titre: 'Couler la flotte de l\'ordinateur à la Bataille navale', compte: nb(e => e.jeu === 'Bataille navale' && !e.p && e.g) },
    { id: 'as-solo', niv: 0, ico: '🚩', but: 1, titre: 'Prendre le drapeau de l\'ordinateur à l\'Assaut', compte: nb(e => e.jeu === 'Assaut' && !e.p && e.g) },
    { id: 'solo-3', niv: 0, ico: '🧩', but: 3, titre: 'Terminer 3 parties seul, au jeu de ton choix', compte: nb(e => !e.p) },
    { id: 'ql-3', niv: 0, ico: '🟡', but: 3, titre: 'Gagner 3 parties de Quatre en ligne', compte: nb(e => e.jeu === QL4 && e.g) },
    { id: 'amis-3', niv: 1, ico: '🤝', but: 3, titre: 'Jouer 3 parties avec des amis', compte: nb(e => e.p) },
    { id: 'gb-2', niv: 1, ico: '✏️', but: 2, titre: 'Jouer 2 parties de Gribouille', compte: nb(e => e.jeu === 'Gribouille') },
    { id: 'pb-1', niv: 1, ico: '📝', but: 1, titre: 'Jouer une partie de Petit bac', compte: nb(e => e.jeu === 'Petit bac') },
    { id: 'jeux-3', niv: 1, ico: '🎪', but: 3, titre: 'Jouer à 3 jeux différents avec des amis', compte: evs => Object.keys(evs.filter(e => e.p).reduce((o, e) => { o[e.jeu] = 1; return o; }, {})).length },
    { id: 'yams-amis', niv: 1, ico: '🎲', but: 2, titre: 'Jouer 2 parties de Yams à plusieurs', compte: nb(e => e.jeu === 'Yams' && e.p) },
    { id: 'ag-1', niv: 1, ico: '🕵️', but: 1, titre: 'Jouer une partie d\'Agents secrets', compte: nb(e => e.jeu === 'Agents secrets') },
    { id: 'bg-gagne', niv: 2, ico: '🎯', but: 1, titre: 'Gagner une partie de Backgammon', compte: nb(e => e.jeu === 'Backgammon' && e.g) },
    { id: 'ql-fort', niv: 2, ico: '🧠', but: 1, titre: 'Battre l\'ordinateur « Fort » au Quatre en ligne', compte: nb(e => e.jeu === QL4 && !e.p && e.g && e.i && e.i.niveau === 'fort') },
    { id: 'ag-gagne', niv: 2, ico: '🕵️', but: 1, titre: 'Gagner une partie d\'Agents secrets', compte: nb(e => e.jeu === 'Agents secrets' && e.g) },
    { id: 'amis-gagne-3', niv: 2, ico: '👑', but: 3, titre: 'Gagner 3 parties contre des amis', compte: nb(e => e.p && e.g) },
    { id: 'pb-gagne', niv: 2, ico: '📝', but: 1, titre: 'Gagner une partie de Petit bac', compte: nb(e => e.jeu === 'Petit bac' && e.g) },
    { id: 'gb-gagne', niv: 2, ico: '🖍️', but: 1, titre: 'Gagner une partie de Gribouille', compte: nb(e => e.jeu === 'Gribouille' && e.g) }
  ];
  // Les pièces de la maison : le salon au départ, la salle des trophées à la première coupe, les autres avec une clé
  var BLOCS = [
    { id: 'salon', nom: 'Salon', ico: '🛋️', desc: 'Sa pièce de tous les jours' },
    { id: 'trophees', nom: 'Salle des trophées', ico: '🏆', desc: 'S\'ouvre avec ta première coupe', auto: true },
    { id: 'jardin', nom: 'Jardin', ico: '🌳', desc: 'De l\'herbe, des fleurs et des papillons' },
    { id: 'chambre', nom: 'Chambre', ico: '🛏️', desc: 'Il y dort la nuit, bien au chaud' },
    { id: 'cuisine', nom: 'Cuisine', ico: '🍲', desc: 'Ses gamelles et le goûter' },
    { id: 'jeux', nom: 'Salle de jeux', ico: '🎲', desc: 'Pour les soirées entre amis' }
  ];
  var ETAGERE_MAX = 3;
  function lundi(t) { var d = new Date(t || Date.now()); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d; }
  function cleSemaine(t) { var d = lundi(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  // Semaines écoulées depuis le lundi 1er janvier 2024
  function numeroSemaine(t) { var d = lundi(t); return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2024, 0, 1)) / 604800000); }
  function defisDeLaSemaine(t) {
    var n = numeroSemaine(t);
    return [0, 1, 2].map(niv => { var l = DEFIS.filter(d => d.niv === niv); return l[((n * 5 + niv * 2) % l.length + l.length) % l.length]; });
  }
  function lireMaison() {
    var m = Object.assign({ blocs: ['salon'], cles: 0, piece: 'salon', etagere: [] }, lireV('compagnon-maison') || {});
    if (m.blocs.indexOf('salon') < 0) m.blocs.unshift('salon');
    return m;
  }
  function ecrireMaison(m) { ecrireV('compagnon-maison', m); }
  function trophees() { return lireV('compagnon-trophees') || []; }
  // Où en sont les défis de la semaine
  function etatDefis(t) {
    t = t || Date.now();
    var debut = lundi(t).getTime(), cle = cleSemaine(t);
    var evs = (lireV('compagnon-evenements') || []).filter(e => e.h >= debut);
    var st = lireV('compagnon-defis');
    if (!st || st.semaine !== cle) st = { semaine: cle, reussis: {}, bonus: false };
    var defis = defisDeLaSemaine(t).map(d => ({ id: d.id, niv: d.niv, ico: d.ico, titre: d.titre, but: d.but,
      n: Math.min(d.but, d.compte(evs)), fait: !!st.reussis[d.id], niveau: NIVEAUX_DEFI[d.niv] }));
    defis.forEach(d => { if (d.fait) d.n = d.but; });
    return { semaine: cle, fin: debut + 7 * 86400000, defis: defis, bonus: !!st.bonus, st: st };
  }
  // Valide les défis atteints (ou celui qu'on force, pour les essais) ; annonce : petite bulle de victoire
  function verifierDefis(annonce, forcer) {
    if (!lireV('compagnon-animal')) return [];
    var e = etatDefis(), st = e.st, nouveaux = [];
    e.defis.forEach(d => { if (!st.reussis[d.id] && (d.n >= d.but || forcer === d.id)) { st.reussis[d.id] = Date.now(); nouveaux.push(d); } });
    if (!nouveaux.length) return [];
    var tr = trophees(), m = lireMaison(), t = Date.now();
    nouveaux.forEach(d => {
      var k = e.semaine + ':' + d.id;
      tr.push({ k: k, id: d.id, niv: d.niv, ico: d.ico, titre: d.titre, h: t });
      if (m.etagere.length < ETAGERE_MAX) m.etagere.push(k);
      if (typeof Etoiles !== 'undefined') Etoiles.ajouter(d.niveau.etoiles, 'Défi réussi : ' + d.titre, true);
    });
    var salle = false, cle = false;
    if (m.blocs.indexOf('trophees') < 0) { m.blocs.push('trophees'); salle = true; }
    if (!st.bonus && e.defis.every(d => st.reussis[d.id])) { st.bonus = true; m.cles = (m.cles || 0) + 1; cle = true; }
    ecrireV('compagnon-defis', st); ecrireV('compagnon-trophees', tr); ecrireMaison(m);
    try { window.dispatchEvent(new CustomEvent('cp-defis', { detail: nouveaux })); } catch (e) {}   // la page du compagnon se met à jour
    if (annonce && typeof Etoiles !== 'undefined') {
      var a = [];
      nouveaux.forEach(d => a.push(['🏆 Défi réussi ! +' + d.niveau.etoiles + ' ⭐', d.niveau.coupe + ' · ' + d.titre]));
      if (salle) a.push(['🏆 Nouvelle pièce : la salle des trophées', 'Va voir ta coupe chez ton compagnon']);
      if (cle) a.push(['🗝️ Ta maison peut s\'agrandir !', 'Les trois défis de la semaine sont réussis']);
      a.forEach((x, i) => setTimeout(() => Etoiles.bulle(x[0], x[1]), i * 3400));
    }
    return nouveaux;
  }
  // Une coupe en SVG (viewBox 0 0 60 72) : métal du niveau, emblème du défi ; eteint : pas encore gagnée
  function coupe(niv, ico, eteint) {
    var c = eteint ? ['#eef1f3', '#d3dae0', '#aab4bd'] : NIVEAUX_DEFI[niv].couleurs, id = 'cp-m-' + (eteint ? 'gris' : NIVEAUX_DEFI[niv].id);
    var f = 'url(#' + id + ')';
    return '<defs><linearGradient id="' + id + '" x1="0" x2="1" y1="0" y2="0.3"><stop offset="0" stop-color="' + c[2] + '"/><stop offset="0.3" stop-color="' + c[0] + '"/>' +
      '<stop offset="0.55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></linearGradient></defs>' +
      '<path d="M15 12 Q3 12 5 24 Q7 34 19 37" stroke="' + f + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M45 12 Q57 12 55 24 Q53 34 41 37" stroke="' + f + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M12 7 H48 Q49 36 30 43 Q11 36 12 7Z" fill="' + f + '"/>' +
      '<ellipse cx="30" cy="7" rx="18" ry="3.6" fill="' + c[0] + '"/><ellipse cx="30" cy="7.6" rx="14.5" ry="2.2" fill="' + c[2] + '" opacity="0.45"/>' +
      '<rect x="26.5" y="42" width="7" height="9" fill="' + f + '"/><path d="M19 51 H41 L44 59 H16Z" fill="' + f + '"/>' +
      '<rect x="12" y="59" width="36" height="10" rx="2.5" fill="' + (eteint ? '#c5cdd4' : '#5a3a26') + '"/>' +
      '<rect x="20" y="62" width="20" height="4" rx="1" fill="' + (eteint ? '#e3e8ec' : c[1]) + '" opacity="0.85"/>' +
      '<circle cx="30" cy="21" r="9.5" fill="#fff" opacity="' + (eteint ? 0.6 : 0.5) + '"/>' +
      '<text x="30" y="25.2" font-size="11.5" text-anchor="middle"' + (eteint ? ' opacity="0.35"' : '') + '>' + ico + '</text>' +
      (eteint ? '' : '<path d="M17 11 Q18 28 25 37" stroke="#fff" stroke-width="2.2" fill="none" opacity="0.55" stroke-linecap="round"/>');
  }

  return { ESPECES: ESPECES, demarrerVeille: demarrerVeille, verifierVeille: verifierVeille, reglagesMessages: reglagesMessages, BESOINS: BESOINS, RECOMPENSE_JOUR: RECOMPENSE_JOUR, RECOMPENSE_SEMAINE: RECOMPENSE_SEMAINE, RAYONS: RAYONS, ARTICLES: ARTICLES,
           niveaux: niveaux, humeur: humeur, age: age, estNuit: estNuit, dessin: dessin, art: art,
           NIVEAUX_DEFI: NIVEAUX_DEFI, DEFIS: DEFIS, BLOCS: BLOCS, ETAGERE_MAX: ETAGERE_MAX, etatDefis: etatDefis, verifierDefis: verifierDefis,
           lireMaison: lireMaison, ecrireMaison: ecrireMaison, trophees: trophees, coupe: coupe, defisDeLaSemaine: defisDeLaSemaine };
})();
