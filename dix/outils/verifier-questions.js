// Vérifie les questions de « Combien sur 10 ? » (non publié sur le site).
//   node dix/outils/verifier-questions.js            contrôle tout et donne les totaux
//   node dix/outils/verifier-questions.js --liste    ajoute les noms des sujets, par thème
//   node dix/outils/verifier-questions.js --cherche texte    cherche dans les noms, questions et réponses
const path = require('path');
const THEMES = ['improbable', 'plaisir', 'mature', 'scolaire'];
const CIBLE = { improbable: 130, plaisir: 100, mature: 90, scolaire: 80 };
THEMES.forEach(t => require(path.join(__dirname, '..', 'questions', t + '.js')));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const erreurs = [], ids = {}, questions = {};
let total = 0;
const parTheme = {};
THEMES.forEach(t => {
  let s = null;
  const sujets = parTheme[t] = [];
  globalThis.DX_Q[t].split('\n').forEach((x, i) => {
    x = x.trim();
    if (!x) return;
    if (x.startsWith('#')) {
      if (!x.startsWith('# ') || x.includes(' | ')) erreurs.push(`${t}, ligne ${i} : titre mal formé : ${x}`);
      s = { nom: x.slice(2), q: [] };
      sujets.push(s);
      const id = norm(s.nom);
      if (ids[id]) erreurs.push(`sujet en double : « ${s.nom} » (${t} et ${ids[id]})`);
      ids[id] = t;
      return;
    }
    if (!s) return erreurs.push(`${t}, ligne ${i} : ligne hors sujet`);
    const p = x.split(' | ');
    if (p.length !== 2 || !p[0].trim() || !p[1].trim()) erreurs.push(`« ${s.nom} » : il faut « question | réponse » : ${x}`);
    if (/[`$\\]/.test(x)) erreurs.push(`« ${s.nom} » : caractère interdit (accent grave, dollar, barre oblique inverse) : ${x}`);
    const c = norm(p[0]);
    if (c.length > 30 && questions[c]) erreurs.push(`question en double : « ${p[0]} » (${s.nom} et ${questions[c]})`);
    questions[c] = s.nom;
    s.q.push(p);
  });
  sujets.forEach(u => { if (u.q.length !== 10) erreurs.push(`« ${u.nom} » : ${u.q.length} questions au lieu de 10`); total += u.q.length; });
});
const args = process.argv.slice(2);
if (args[0] === '--cherche') {
  const m = norm(args.slice(1).join(' '));
  THEMES.forEach(t => parTheme[t].forEach(s => {
    if (norm(s.nom).includes(m)) console.log(`[${t}] # ${s.nom}`);
    s.q.forEach((q, i) => { if (norm(q.join(' ')).includes(m)) console.log(`[${t}] ${s.nom}, niveau ${i + 1} : ${q.join(' | ')}`); });
  }));
  process.exit(0);
}
THEMES.forEach(t => {
  console.log(`${t} : ${parTheme[t].length} sujets (visé : ${CIBLE[t]})`);
  if (args[0] === '--liste') console.log('  ' + parTheme[t].map(s => s.nom).join(' ; '));
});
console.log(`Total : ${total} questions`);
if (erreurs.length) { console.log(`\n${erreurs.length} erreur(s) :\n` + erreurs.join('\n')); process.exit(1); }
console.log('Aucune erreur.');
