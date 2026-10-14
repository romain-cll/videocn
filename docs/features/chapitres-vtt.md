# Chapitres depuis un fichier WebVTT

## User story
En tant qu'intégrateur qui pose `<VideoCn>` sur sa page, je veux fournir les chapitres de ma vidéo
sous forme d'un fichier WebVTT plutôt que d'un tableau écrit dans mon code, afin de les modifier
sans redéployer ma page et de brancher un fichier que j'ai déjà ou qu'un outil fabrique pour moi.

## Critères d'acceptation

Dans ces critères, « un fichier de chapitres » est un fichier WebVTT servi depuis la même origine
que la page, dont chaque réplique est un chapitre. « Le tableau équivalent » est la liste
`{ time, label }[]` qui donne à chaque réplique du fichier `time` = son temps de début et
`label` = son titre (CA3).

### Fournir le fichier

- [ ] CA1 — Étant donné `chapters="<URL d'un fichier de chapitres>"` sur une vidéo à la demande,
  quand la durée de la vidéo est connue et le fichier chargé, alors les segments du scrubber, le
  menu des chapitres et, sous le seuil du lecteur étroit, la ligne « Chapters » du menu Settings
  sont ceux que donne le tableau équivalent : mêmes segments, mêmes titres dans le même ordre, même
  chapitre en cours coché, même saut au choix d'un chapitre.
- [ ] CA2 — Étant donné un fichier de chapitres, alors seuls le début et le titre de chaque
  réplique comptent ; sa fin est ignorée. Les règles du tableau s'appliquent telles quelles : la
  fin d'un chapitre est le début du suivant et la durée de la vidéo pour le dernier, le premier
  chapitre commence à 0, deux répliques au même début gardent la première, l'ordre des répliques
  dans le fichier n'importe pas, une réplique qui commence à la durée ou après est écartée. Un trou
  entre deux répliques (ex. 0:00–1:00 puis 1:30–2:00) ne laisse aucun trou sur la barre.
- [ ] CA3 — Étant donné une réplique dont le texte porte des balises WebVTT (`<b>`, `<i>`,
  `<v Nom>`, `<c.classe>`…), des entités (`&amp;`) ou plusieurs lignes, alors son titre est le texte
  affichable sans balises, entités décodées, lignes jointes par une espace, espaces de bord
  retirées. L'identifiant et les réglages de la réplique (`line`, `position`…) sont ignorés. Une
  réplique dont le titre est vide est écartée.
- [ ] CA4 — Étant donné le même fichier de chapitres passé à une source MP4 (moteur natif), HLS et
  DASH (Shaka), alors les chapitres affichés sont identiques. Seuls les chapitres de la prop sont
  proposés, jamais d'éventuels chapitres portés par la vidéo ou son manifeste.
- [ ] CA5 — Étant donné un fichier de chapitres et un lecteur monté sans lecture lancée, alors les
  chapitres apparaissent dès que la durée de la vidéo est connue et le fichier chargé, sans action
  du spectateur.
- [ ] CA6 — Étant donné un fichier de chapitres sur un flux en direct, alors ni segments, ni menu
  des chapitres, ni ligne « Chapters ».

### Changer de source

- [ ] CA7 — Étant donné un lecteur monté, quand `chapters` passe d'une URL à une autre, d'une URL à
  un tableau, d'un tableau à une URL, ou d'une URL à `undefined`, alors la barre et le menu suivent
  la nouvelle source. Tant que le nouveau fichier n'est pas chargé, la barre est d'un seul tenant et
  le menu absent : jamais les chapitres de l'ancienne source, jamais un mélange des deux.
- [ ] CA8 — Étant donné une page hôte qui rend de nouveau `<VideoCn>` avec la même URL de
  chapitres, alors le fichier n'est pas redemandé (aucune nouvelle requête réseau) et les chapitres
  ne disparaissent pas, même un instant.

### Fichier inexploitable

- [ ] CA9 — Étant donné `chapters` égal à une chaîne vide ou blanche, une URL introuvable (404), un
  fichier qui n'est pas du WebVTT, ou un fichier sans aucune réplique exploitable, alors le lecteur
  se comporte comme sans chapitres (barre d'un seul tenant, ni menu ni ligne « Chapters »), la
  vidéo se lit normalement, et aucune exception non interceptée n'apparaît dans la console.

### Cohabitation

- [ ] CA10 — Étant donné un fichier de chapitres, alors `controls={{ chapters: false }}` retire le
  menu des chapitres et la ligne « Chapters », et `controls={{ scrubber: { chapters: false } }}`
  garde la barre d'un seul tenant sans toucher au menu, comme avec le tableau.
- [ ] CA11 — Étant donné un fichier de chapitres et des pistes de sous-titres, alors la piste de
  chapitres n'apparaît jamais dans la liste « Subtitles », aucun de ses titres ne s'affiche sur
  l'image, et le bouton CC, la touche `c` et la piste par défaut se comportent comme sans fichier de
  chapitres.
- [ ] CA12 — Étant donné `chapters` passé en tableau, alors rien ne change par rapport à
  aujourd'hui : les exemples de `/docs` qui utilisent un tableau (exemple principal, Chapters,
  Configured) et le playground se comportent comme sur `master`.
- [ ] CA13 — Étant donné un projet TypeScript qui a installé le lecteur, alors `chapters` accepte
  une `string` ou un tableau de `Chapter`, et rejette tout autre type. Le JSDoc de la prop décrit
  les deux formes et l'obligation de même origine pour le fichier.

### Site et documentation

- [ ] CA14 — Étant donné la page `/docs`, alors elle documente la forme fichier de `chapters` : une
  réplique par chapitre, seuls son début et son texte comptent, fichier servi depuis la même origine
  que la page. Elle montre un exemple jouable : Sintel avec les chapitres de l'exemple actuel, sous
  forme d'un fichier `.vtt` servi par le site, l'extrait de code identique à ce qui est monté et le
  contenu du fichier affiché. La référence des props donne le type `string | Chapter[]`. La chaîne
  `docs` de `registry.json`, affichée par le CLI à l'installation, montre aussi la forme fichier.
  Textes en anglais.
- [ ] CA15 — Étant donné `docs/mvp.md`, alors un amendement daté du jour décrit la forme fichier de
  la prop `chapters` et ses règles (début et titre seulement, même origine, fichier inexploitable =
  pas de chapitres), et la section Chapitres ne la présente plus comme à venir.

## Hors scope
- Respecter les fins explicites des répliques et laisser des trous entre chapitres (décision du
  14/10/2026).
- Fichier de chapitres servi depuis une autre origine que la page : prop `crossOrigin`, déjà notée
  pour la phase 7. À savoir pour le SaaS : ses fichiers devront être servis depuis l'origine de la
  page hôte d'ici là.
- Plusieurs fichiers de chapitres (un par langue), choix selon la langue du navigateur.
- Fusion d'un fichier et d'un tableau.
- Signaler un fichier introuvable ou invalide (callback, message à l'écran).
- Chapitres embarqués dans un manifeste HLS ou DASH ou dans le conteneur MP4.
- Formats autres que WebVTT (JSON, SRT, liste d'horodatages façon YouTube).
- Données attachées à un chapitre au-delà de son titre (vignette, description, JSON dans la
  réplique).
- Recharger le fichier quand il change sur le serveur alors que la page reste ouverte.
- Chapitres dans le plein écran natif de l'iPhone (dépend du système).
- Option « fichier » dans le playground.
- Entrée dans le changelog du site.

## Contraintes
- Règles de `registry/README.md` : aucun import de framework, `"use client"`, ni `asChild` ni
  `render`, tokens sémantiques uniquement, un fichier = une responsabilité. Tout nouveau fichier
  rejoint le `files[]` de l'item unique `player`, jamais un nouvel item.
- Chargement par un `<track kind="chapters">` que le lecteur rend lui-même dans `<video>` depuis la
  prop, et par l'API `TextTrack`, identiquement pour les deux moteurs (`docs/mvp.md`, section
  Chapitres). `<VideoCn>` n'accepte toujours pas de `children`.
- Aucune nouvelle dépendance npm : c'est le navigateur qui lit le WebVTT.
- Seul ajout d'API : le type de `chapters` s'élargit à `string`. Aucune nouvelle prop, aucune
  nouvelle clé de `controls`.
- Le rendu des chapitres (scrubber, menu, ligne « Chapters ») n'est pas modifié : le fichier
  produit la même liste normalisée que le tableau (`ResolvedChapter[]`, voir `chapters.ts`).
- Fichier de démonstration hébergé par le site dans `public/examples/`, titres et débuts repris
  de `SINTEL_CHAPTERS` (`src/lib/videos.ts`).
- `docs/mvp.md` amendé, daté du jour.
- `pnpm lint` et `pnpm build` passent. Installation croisée vérifiée en `radix` et en `base`
  (`~/projects/videocn-test-radix`, `~/projects/videocn-test-base`) : un fichier de chapitres s'y
  affiche.
- Pas de runner de tests : chaque CA est vérifié dans le navigateur (voir Décisions).
- Site en anglais ; commentaires du code en français.

## Plan technique
_À compléter par l'architect._

## Décisions
- 2026-10-14 — `chapters` accepte aussi l'URL d'un fichier WebVTT : une seule prop, deux formes qui
  s'excluent d'office, aucune règle de priorité (validée par Romain)
- 2026-10-14 — Les fins des répliques sont ignorées : début et titre seulement, mêmes règles que le
  tableau (validée par Romain)
- 2026-10-14 — Pas de runner de tests ni de phase rouge, comme pour la refonte et les sous-titres :
  le dev vérifie lui-même chaque CA dans le navigateur et sur les bancs, la review se fait contre la
  spec (validée par Romain)
- 2026-10-14 — Pendant le chargement d'une nouvelle URL, les anciens chapitres disparaissent (CA7) ; un
  fichier inexploitable est silencieux (CA9) (validée par Romain)
- 2026-10-14 — Spec validée, DoR atteinte (validée par Romain)
