# videoCn — feuille de route du MVP

Écrite le 20 septembre 2026. Elle découle de `docs/mvp.md` et ne l'élargit jamais : si une
étape ci-dessous ne sert pas une ligne du périmètre, c'est une erreur de cette feuille, pas
une extension du MVP.

## Point de départ

Un seul fichier du lecteur existe, `registry/videocn/volume-control.tsx`, et l'item `player`
ne déclare que lui. Le site a sa page d'accueil et sa page docs. Le socle — état, contexte,
composant racine — reste à écrire, et c'est lui qui impose l'ordre de tout ce qui suit.

| Phase | Contenu | Estimation |
| --- | --- | --- |
| 0 | Socle : état, contexte, composant racine, interface moteur | 2–3 sessions |
| 1 | Contrôles simples et barre de contrôles | 2 sessions |
| 2 | Scrubber | 2–3 sessions |
| 3 | Raccourcis clavier | 1 session |
| 4 | Moteur Shaka et sélecteur de qualité | 3 sessions |
| 5 | Chapitres et highlights | 1–2 sessions |
| 6 | Sous-titres | 2 sessions |
| 7 | Distribution et documentation | 2 sessions |

## Phase 0 — Le socle

Bloquant : rien d'autre ne démarre avant.

- `use-player.ts` — l'état sur `<video>` : play/pause, `currentTime`, `duration`, `buffered`,
  volume, `playbackRate`, plein écran, Picture-in-Picture.
- `player-context.tsx` — le contexte. Les contrôles lisent et rendent, ils ne détiennent
  jamais d'état.
- `video-cn.tsx` — le composant racine : le `<video>` et l'emplacement des contrôles.
- **L'interface moteur est définie ici**, avec la seule implémentation native — `load`,
  `attach`, `destroy`, capacités exposées. Pas encore Shaka, juste la forme. La repousser
  obligerait à réécrire `use-player` *et* le scrubber en phase 4.
- Une page de démo sur le site, pour voir quelque chose bouger dès le premier jour.

## Phase 1 — Les contrôles simples

- Play/pause, plein écran avec les préfixes navigateurs, Picture-in-Picture, vitesse de lecture.
- Recâbler `volume-control` sur le contexte : il prend ses props en direct aujourd'hui.
- La barre de contrôles et son auto-masquage.

C'est la partie la plus rapide du projet, et le bon moment pour le premier test d'installation
croisé (voir plus bas).

## Phase 2 — Le scrubber

Le morceau le plus dur du MVP.

- Piste, aperçu du buffer, glisser-déposer, clavier, tactile.
- Accessibilité : `role="slider"`, `aria-valuenow`, `aria-valuetext` lisible.
- **Le curseur de volume bascule sur la même primitive, dans la foulée.** Le concevoir pour deux
  plages dès le départ coûte presque rien ; l'y porter après coup, quand le buffer, les chapitres
  et la heatmap y sont encastrés, coûte une refonte. Une fois le scrubber écrit, le volume n'est
  qu'une plage de 0 à 1 sans buffer ni chapitres.

L'accessibilité et le tactile coûtent nettement plus que le rendu. Ne pas le sous-estimer
parce qu'il ressemble à une barre.

## Phase 3 — Raccourcis clavier

- La keymap du périmètre, scopée au conteneur du lecteur.
- Désactivation quand le focus est dans un `input`, un `textarea` ou un `contenteditable` de
  la page hôte.

**Le contrat de la keymap**, posé dès la phase 2 parce que le curseur en dépend. Un curseur
focalisé possède ses flèches : il les traite, appelle `preventDefault()` et `stopPropagation()`,
et la keymap ne doit plus les voir.

- **Un `onKeyDown` React sur le conteneur, pas un écouteur natif.** React délègue ses
  événements à sa racine, et sous Next App Router la racine est `document`. Un écouteur natif
  posé sur le conteneur reçoit donc la touche avant même que React ne la distribue, avant le
  `stopPropagation()` du curseur ; posé sur `document`, il la reçoit de toute façon, puisque
  `stopPropagation()` n'arrête pas les autres écouteurs du même nœud. Dans les deux cas, un `←`
  sur le scrubber reculerait deux fois. Un gestionnaire React, lui, est arrêté par le curseur.
- **La keymap vérifie aussi `event.defaultPrevented`**, et s'abstient si la touche a déjà été
  traitée : c'est le filet pour tout composant qui empêcherait l'action par défaut sans arrêter
  la propagation.

## Phase 4 — Le moteur Shaka

- L'implémentation Shaka derrière l'interface de la phase 0, avec import dynamique.
- Détection de source et prop d'échappement `type`.
- Sélecteur de qualité, grisé quand le moteur n'en expose aucune.
- Des flux HLS et DASH de démo sur le site : sans eux, rien n'est vérifiable.

Une bonne part du temps part en tests sur de vrais appareils Safari et iOS, pas en code.

## Phase 5 — Chapitres et highlights

- Segments de chapitres sur le scrubber, plus la liste cliquable.
- Overlay en aire pour la heatmap.

Dépend entièrement de la phase 2.

**Faite le 24 septembre 2026, sans la heatmap** — mise en réserve, comme le prévoit « Ce qui saute
si ça déborde » plus bas. Les chapitres ont demandé quatre fichiers et une seule idée : chaque
segment est une fenêtre d'`overflow-hidden` dans laquelle on replace la piste entière, re-cadrée.
Rien du dessin existant n'a été recalculé, et le curseur n'a pas été touché.

## Phase 6 — Sous-titres

- `<track>` et API `TextTrack`, bascule on/off, sélection de piste, réglage de la taille et
  de la position.

## Phase 7 — Distribution et documentation

- `registry.json` complet : tous les `files[]`, les `dependencies`, les `cssVars`.
- Documentation du site, avec des exemples copiables tels quels.
- **Passe d'accessibilité à la main, avant la V1** (décidé le 22 septembre 2026) : VoiceOver sur
  le scrubber, pour vérifier que la valeur, qui change chaque seconde, n'est pas annoncée en
  boucle quand il a le focus, et le contrôle vocal macOS (« Click Seek »). Ni l'un ni l'autre ne
  s'automatise.

## Deux chantiers hors de l'ordre séquentiel

- **Le test d'installation réelle, dès la phase 1.** Le `registry/README.md` est clair : le
  seul test qui compte est l'installation dans un projet tiers, en `radix` *et* en `base`. Le
  faire en phase 7 sur douze fichiers, c'est découvrir trop tard qu'une primitive diverge. Le
  faire sur trois fichiers coûte une heure et protège tout le reste.
- **Réclamer `@videocn` à l'annuaire shadcn.** Ça ne dépend d'aucune ligne de code et le délai
  est chez un tiers. Rien d'autre ne résout un `@videocn` nu. Reporté le 22 septembre 2026 : la
  demande part à la sortie de la V1.

## Durée

- **15 à 18 sessions de travail effectives.** À trois sessions par semaine, cinq à six
  semaines ; à rythme soutenu, trois semaines.
- La fourchette tient à deux inconnues : le scrubber tactile et accessible, et les tests
  Safari/iOS qui demandent de vrais appareils.

## Ce qui saute si ça déborde

Dans cet ordre : la heatmap, puis le réglage de taille et de position des sous-titres. Ce sont
les seuls éléments du périmètre dont l'absence ne se remarque pas.

Le scrubber, le moteur et le test d'installation croisé ne sont pas négociables.
