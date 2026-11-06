# Questions de « Combien sur 10 ? »

Un fichier par thème : `improbable.js`, `plaisir.js`, `mature.js`, `scolaire.js`. Répartition visée : 130, 100, 90, 80 sujets (4 000 questions).
Non publié sur le site, comme `dix/outils/`.

## Format

Un sujet tient sur 11 lignes, à placer n'importe où dans le fichier de son thème :

    # Nom du sujet
    Question de niveau 1 | Réponse
    …
    Question de niveau 10 | Réponse

L'identifiant d'un sujet vient de son nom (`DX` : minuscules, sans accents). On peut donc insérer, déplacer, corriger ou supprimer un sujet librement.
Renommer un sujet le fait seulement redevenir « jamais vu ». Interdits dans le texte : accent grave, dollar, barre oblique inverse, et « | » entouré d'espaces hors séparateur.

## Tâches courantes

- **Contrôler** : `node dix/outils/verifier-questions.js` (10 lignes par sujet, séparateurs, doublons, totaux).
- **Voir ce qui existe** : `--liste`. **Retrouver une question** (une question signalée ⚠️ par exemple) : `--cherche mots`.
- **Ajouter** : vérifier avec `--liste` et `--cherche` que le sujet n'existe pas, écrire, contrôler.
- **Nouveau thème** : son fichier, `ORDRE_THEMES` et `THEMES` dans `dix-regles.js`, les balises de `dix/index.html`, `FICHIERS` de `sw.js` et `THEMES` du vérificateur.

## Écrire un bon sujet

- Sujet **étroit**, souvent du quotidien ou absurde (les trombones, la TVA), plutôt qu'un grand domaine. Scolaire peut rester plus proche d'un quiz.
- Niveaux 1 à 3 : pour rire, évidence comique. 4 à 7 : culture courante, en durcissant. 8 : amateur éclairé. 9 : passionné. 10 : vrai spécialiste, détail obsessionnel.
- Une question à réponse courte et vérifiable, jugée à voix haute par l'équipe qui lit. Pas d'ambiguïté, pas de donnée qui se périme vite.
- Dans le doute sur un fait, changer de question. Questions maison uniquement, jamais celles de la boîte du jeu d'origine.
- Pas de contenu qui vise une personne privée.
- Écrire par lots de 15 à 20 sujets au plus, et contrôler sur le web les faits risqués avant de publier.
