// Ajoute un lot de sujets à la fin des fichiers de thèmes (non publié sur le site).
//   node dix/outils/ajouter-lot.js lot.txt
// Le lot : « @thème » sur une ligne, puis des sujets au format de dix/questions/LISEZMOI.md
const fs = require('fs'), path = require('path');
const lot = fs.readFileSync(process.argv[2], 'utf8').split('\n');
const ajouts = {};
let t = null;
lot.forEach(l => {
  if (l.startsWith('@')) { t = l.slice(1).trim(); ajouts[t] = ajouts[t] || []; }
  else if (l.trim() && t) ajouts[t].push(l.trim());
});
for (const th in ajouts) {
  const f = path.join(__dirname, '..', 'questions', th + '.js');
  const s = fs.readFileSync(f, 'utf8');
  const fin = s.lastIndexOf('`;');
  if (fin < 0) throw new Error('fin introuvable dans ' + f);
  fs.writeFileSync(f, s.slice(0, fin) + ajouts[th].join('\n') + '\n' + s.slice(fin));
  console.log(th + ' : ' + ajouts[th].filter(l => l.startsWith('# ')).length + ' sujets ajoutés');
}
