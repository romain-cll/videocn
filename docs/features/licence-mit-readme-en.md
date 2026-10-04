# Licence MIT et README en anglais

## User story
En tant que mainteneur de videoCn, je veux publier le dépôt sous licence MIT avec un README en anglais, afin que n'importe quel développeur sache qu'il peut réutiliser le lecteur et comprenne le dépôt sans parler français.

## Critères d'acceptation
- [x] CA1 — Étant donné la racine du dépôt, quand on ouvre `LICENSE`, alors on y trouve le texte MIT standard (SPDX `MIT`, mot pour mot), avec la ligne `Copyright (c) 2026 Romain Caillé`.
- [x] CA2 — Étant donné `README.md`, quand on le lit, alors tout le texte en prose est en anglais et aucune phrase française ne subsiste.
- [x] CA3 — Étant donné `README.md`, quand on le compare à la version actuelle, alors il garde les mêmes sections dans le même ordre (intro, Structure, Commandes, Point de vigilance, Consommer le registry), avec le même contenu factuel : aucune information ajoutée ni retirée, hormis la section du CA5.
- [x] CA4 — Étant donné les blocs de code du README, quand on les compare à la version actuelle, alors les commandes, chemins, URL et JSON sont identiques ; seuls les commentaires en fin de ligne sont traduits.
- [x] CA5 — Étant donné `README.md`, quand on lit sa dernière section, alors c'est une section `## License` qui indique que le projet est sous licence MIT et renvoie vers le fichier `LICENSE` par un lien relatif.
- [x] CA6 — Étant donné `package.json`, quand on l'ouvre, alors il contient `"license": "MIT"` ; aucune autre clé n'est modifiée.

## Hors scope
- Champ `license` dans `registry.json` ou dans les items du registry.
- Modifier le contenu factuel du README (ajout de badges, captures, section « Contributing », etc.).
- Traduire `registry/README.md`, `docs/`, les commentaires du code ou les messages de commit (ils restent en français).
- En-têtes de licence dans les fichiers sources.

## Contraintes
- Fichiers touchés : `LICENSE` (nouveau), `README.md` et `package.json` uniquement.
- Aucune modification de `registry/` ni de `src/`.
- `pnpm lint` doit rester vert.

## Plan technique
Sans objet : deux fichiers texte et une clé dans `package.json`, pas de code. Pas de phase de tests (rien d'automatisable) ; la vérification des CA est faite par le reviewer.

## Décisions
- 2026-10-04 — Titulaire du copyright : Romain Caillé (validée par Romain)
- 2026-10-04 — Section `## License` en fin de README (validée par Romain)
- 2026-10-04 — `"license": "MIT"` ajouté à `package.json` (validée par Romain)
- 2026-10-04 — Spec validée, DoR atteinte (validée par Romain)
