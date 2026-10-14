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

- [x] CA1 — Étant donné `chapters="<URL d'un fichier de chapitres>"` sur une vidéo à la demande,
  quand la durée de la vidéo est connue et le fichier chargé, alors les segments du scrubber, le
  menu des chapitres et, sous le seuil du lecteur étroit, la ligne « Chapters » du menu Settings
  sont ceux que donne le tableau équivalent : mêmes segments, mêmes titres dans le même ordre, même
  chapitre en cours coché, même saut au choix d'un chapitre.
- [x] CA2 — Étant donné un fichier de chapitres, alors seuls le début et le titre de chaque
  réplique comptent ; sa fin est ignorée. Les règles du tableau s'appliquent telles quelles : la
  fin d'un chapitre est le début du suivant et la durée de la vidéo pour le dernier, le premier
  chapitre commence à 0, l'ordre des répliques dans le fichier n'importe pas, une réplique qui
  commence à la durée ou après est écartée. Deux répliques au même début n'en donnent qu'une :
  celle qui finit le plus tard, et à fins égales la première du fichier (ordre des répliques
  imposé par le navigateur). Un trou
  entre deux répliques (ex. 0:00–1:00 puis 1:30–2:00) ne laisse aucun trou sur la barre.
- [x] CA3 — Étant donné une réplique dont le texte porte des balises WebVTT (`<b>`, `<i>`,
  `<v Nom>`, `<c.classe>`…), des entités (`&amp;`) ou plusieurs lignes, alors son titre est le texte
  affichable sans balises, entités décodées, lignes jointes par une espace, espaces de bord
  retirées. L'identifiant et les réglages de la réplique (`line`, `position`…) sont ignorés. Une
  réplique dont le titre est vide est écartée.
- [x] CA4 — Étant donné le même fichier de chapitres passé à une source MP4 (moteur natif), HLS et
  DASH (Shaka), alors les chapitres affichés sont identiques : mêmes titres, mêmes débuts, même
  ordre ; la largeur des segments suit la durée de chaque source. Seuls les chapitres de la prop sont
  proposés, jamais d'éventuels chapitres portés par la vidéo ou son manifeste.
- [x] CA5 — Étant donné un fichier de chapitres et un lecteur monté sans lecture lancée, alors les
  chapitres apparaissent dès que la durée de la vidéo est connue et le fichier chargé, sans action
  du spectateur.
- [x] CA6 — Étant donné un fichier de chapitres sur un flux en direct, alors ni segments, ni menu
  des chapitres, ni ligne « Chapters ».

### Changer de source

- [x] CA7 — Étant donné un lecteur monté, quand `chapters` passe d'une URL à une autre, d'une URL à
  un tableau, d'un tableau à une URL, ou d'une URL à `undefined`, alors la barre et le menu suivent
  la nouvelle source. Tant que le nouveau fichier n'est pas chargé, la barre est d'un seul tenant et
  le menu absent : jamais les chapitres de l'ancienne source, jamais un mélange des deux.
- [x] CA8 — Étant donné une page hôte qui rend de nouveau `<VideoCn>` avec la même URL de
  chapitres, alors le fichier n'est pas redemandé (aucune nouvelle requête réseau) et les chapitres
  ne disparaissent pas, même un instant.

### Fichier inexploitable

- [x] CA9 — Étant donné `chapters` égal à une chaîne vide ou blanche, une URL introuvable (404), un
  fichier qui n'est pas du WebVTT, ou un fichier sans aucune réplique exploitable, alors le lecteur
  se comporte comme sans chapitres (barre d'un seul tenant, ni menu ni ligne « Chapters »), la
  vidéo se lit normalement, et aucune exception non interceptée n'apparaît dans la console.

### Cohabitation

- [x] CA10 — Étant donné un fichier de chapitres, alors `controls={{ chapters: false }}` retire le
  menu des chapitres et la ligne « Chapters », et `controls={{ scrubber: { chapters: false } }}`
  garde la barre d'un seul tenant sans toucher au menu, comme avec le tableau.
- [x] CA11 — Étant donné un fichier de chapitres et des pistes de sous-titres, alors la piste de
  chapitres n'apparaît jamais dans la liste « Subtitles », aucun de ses titres ne s'affiche sur
  l'image, et le bouton CC, la touche `c` et la piste par défaut se comportent comme sans fichier de
  chapitres.
- [x] CA12 — Étant donné `chapters` passé en tableau, alors rien ne change par rapport à
  aujourd'hui : les exemples de `/docs` qui utilisent un tableau (exemple principal, Chapters,
  Configured) et le playground se comportent comme sur `master`.
- [x] CA13 — Étant donné un projet TypeScript qui a installé le lecteur, alors `chapters` accepte
  une `string` ou un tableau de `Chapter`, et rejette tout autre type. Le JSDoc de la prop décrit
  les deux formes et l'obligation de même origine pour le fichier.

### Site et documentation

- [x] CA14 — Étant donné la page `/docs`, alors elle documente la forme fichier de `chapters` : une
  réplique par chapitre, seuls son début et son texte comptent, fichier servi depuis la même origine
  que la page. Elle montre un exemple jouable : Sintel avec les chapitres de l'exemple actuel, sous
  forme d'un fichier `.vtt` servi par le site, l'extrait de code identique à ce qui est monté et le
  contenu du fichier affiché. La référence des props donne l'union des deux formes,
  `string | { time: number; label: string }[]`. La chaîne
  `docs` de `registry.json`, affichée par le CLI à l'installation, montre aussi la forme fichier.
  Textes en anglais.
- [x] CA15 — Étant donné `docs/mvp.md`, alors un amendement daté du jour décrit la forme fichier de
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
- Nouvelle entrée datée dans le changelog du site. L'entrée « upcoming » « Chapters from a file »,
  devenue fausse, est retirée.

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
### Approche
Quand `chapters` est une chaîne, `<VideoCn>` rend lui-même dans `<video>` un `<track kind="chapters">` dont la clé est l'URL nettoyée, sans jamais l'attribut `default`. Un nouveau hook, `use-chapter-track.ts`, passe ce `<track>` en `hidden`, lit toutes ses répliques à l'événement `load` et en fait un `Chapter[]` : `time` = `startTime`, `label` = texte de `getCueAsHTML()`. Cette liste n'est exposée que pour l'URL courante.

Elle entre dans le `ChaptersProvider` existant à la place de la prop. `resolveChapters`, les segments, les deux menus et la ligne « Chapters » ne bougent pas : le fichier applique donc par construction les mêmes règles que le tableau (CA1, CA2, CA6, CA10).

Rien ne change dans le store, dans `usePlayer` ni dans Shaka. Le `sync()` des sous-titres ne lit que ses propres pistes et ne force que les pistes `subtitles` et `captions` : la piste `chapters` lui échappe (CA11).

### Fichiers
- créé : `registry/videocn/use-chapter-track.ts` — `useChapterTrack(src)` → `{ ref, chapters }`. Passe la piste en `hidden` et l'y maintient, lit les répliques au `load`, extrait le titre. L'état est indexé par l'URL. `"use client"`, commentaires en français.
- créé : `public/examples/sintel-chapters.vtt` — les 8 chapitres de `SINTEL_CHAPTERS`, horodatés en `mm:ss.ttt`. Chaque fin est le début suivant ; la dernière est la durée du MP4 d'archive.org, relevée.
- modifié : `registry/videocn/video-cn.tsx` :
  - le type devient `chapters?: string | readonly Chapter[]` ; la JSDoc décrit les deux formes, la fin ignorée, l'obligation de même origine et le fichier inexploitable qui ne donne pas de chapitres ;
  - `chapterSrc = typeof chapters === "string" ? chapters.trim() : ""` ;
  - appel de `useChapterTrack(chapterSrc)` ;
  - dans `<video>`, après les pistes de sous-titres : `{chapterSrc !== "" && <track key={chapterSrc} ref=… data-slot="video-player-chapter-track" kind="chapters" src={chapterSrc} />}` ;
  - `ChaptersProvider` reçoit `typeof chapters === "string" ? chapterTrack.chapters : chapters`.
- modifié : `registry/videocn/chapters.ts` — commentaire d'en-tête seulement. Le paragraphe « le jour où les chapitres arriveront d'un fichier WebVTT… » devient : le fichier produit un `Chapter[]`, ses fins sont ignorées et il passe par `resolveChapters`.
- modifié : `registry/videocn/use-subtitles.ts` — commentaire seulement, dans `sync()`. Il dit que les pistes `chapters`, dont celle que `use-chapter-track` garde en `hidden`, ne sont jamais concernées, et que CA11 en dépend.
- modifié : `registry.json` :
  - entrée `files[]` `registry/videocn/use-chapter-track.ts` → `@ui/video-player/use-chapter-track.ts`, de type `registry:ui` ;
  - chaîne `docs` : la forme fichier, ajoutée après le paragraphe des chapitres.
- modifié : `src/lib/videos.ts` — `SINTEL_CHAPTERS_FILE = "/examples/sintel-chapters.vtt"`, avec un commentaire qui le lie à `SINTEL_CHAPTERS`.
- modifié : `src/lib/snippet.ts` — `chaptersUrl?: string`, écrit `chapters="…"` en littéral. `chapters` reste le nom de variable.
- modifié : `src/app/docs/page.tsx` :
  - `S.chaptersFile` et le sommaire ;
  - l'exemple « Chapters from a file » ;
  - le contenu du `.vtt` lu au build par `readFileSync(join(process.cwd(), "public", SINTEL_CHAPTERS_FILE))`, sur le précédent de `src/app/_og/og-image.tsx` l.157 ;
  - la ligne `chapters` de la référence des props.
- modifié : `docs/mvp.md` — amendement du 14 octobre 2026 et section Chapitres (CA15).
- modifié (selon l'ambiguïté 2) : `src/lib/changelog.ts` — retrait de l'entrée `upcoming` « Chapters from a file ».
- modifié (selon la décision 6, seulement si la valeur arrondie bouge) : `src/lib/bundle.ts` — `core` remesuré.
- inchangés, à noter : `chapters-context.tsx`, `chapter-menu.tsx`, `chapter-segments.tsx`, `settings-menu.tsx`, `use-player.ts`, `player-state-store.ts`, `shaka-engine.ts`.
- sondes, jamais commitées :
  - `src/app/sonde-chapitres-vtt/page.tsx` ;
  - `src/app/sonde-chapitres-vtt/lent/route.ts` ;
  - `public/sonde/*.vtt`.

### Tâches (ordonnées)
0. **Référence CA12 sur l'état actuel, avant toute modification.** Script de relevé sur `/docs` (exemple principal, Chapters, Configured), `/playground` et la landing. Il relève :
   - les `--chapter-start` et `--chapter-span` de chaque `[data-slot=video-player-scrubber-chapter]` ;
   - la présence et l'`aria-label` du déclencheur Chapters ;
   - les textes des items ;
   - les `track` présents dans `<video>`.

   — prépare CA12.

1. **Contrats, commités avant tout agent.**
   - `video-cn.tsx` complet : type, JSDoc, `<track>`, branchement du `ChaptersProvider`.
   - Bouchon de `use-chapter-track.ts` : signature finale, `ref` réelle, `chapters: undefined`.
   - Entrée `files[]` de `registry.json`.

   — couvre CA13 et prépare CA1 à CA11.

2. **Lot A — lecteur.** Fichiers : `use-chapter-track.ts`, `chapters.ts` et `use-subtitles.ts` (commentaires). Couvre CA1 à CA11.
   - **Chargement**
     - L'effet dépend de `[src]` et lit `ref.current`, absent quand `src === ""`.
     - Il écoute `load` sur le `<track>`. Il écoute aussi `change` sur `(element.parentElement as HTMLMediaElement).textTracks`, avec un garde `if (track.mode === "disabled") track.mode = "hidden"` (décision 3).
     - Il appelle ce garde une fois, après avoir posé les écouteurs : c'est ce passage en `hidden` qui lance le chargement (HTML : le changement de mode démarre le traitement de la piste).
     - Les répliques se lisent au `load`, qui suit l'analyse complète. Elles arrivent indépendamment de la durée, que `ChaptersProvider` combine déjà (CA5).
     - Pas de lecture « déjà `LOADED` » dans l'effet. Un élément neuf ne peut pas l'être, puisque le chargement ne part qu'à notre `hidden`. L'état survit aux ré-exécutions d'effet (StrictMode, Fast Refresh). Et un `setState` synchrone dans un effet est une erreur de `react-hooks/set-state-in-effect` dans la config Next 16.
     - L'écriture de `track.mode` passe par la ref, comme dans `usePlayer`.
   - **Identité et stabilité (CA7, CA8)**
     - L'identité est l'URL nettoyée. Elle sert de `key` au `<track>` : une URL nouvelle donne un élément neuf, donc une `TextTrack` neuve.
     - État `file: { src: string; chapters?: readonly Chapter[] }`, ajusté pendant le rendu avec `if (file.src !== src) setFile({ src })` (motif de `ChaptersProvider` et `useSubtitles`).
     - Valeur rendue : `file.src === src ? file.chapters : undefined`. Dès le rendu où l'URL change, l'ancienne liste disparaît.
     - A→B→A avant le `load` de B : rien ne s'affiche avant le `load` du nouvel élément A.
     - Même URL : même élément, aucun attribut réécrit, donc aucune requête. Même état, même référence. La signature par contenu de `ChaptersProvider` garde aussi la même `ResolvedChapter[]`, et rien ne clignote.
   - **Coexistence avec `sync()` (CA11)** : rien à changer, la règle tient déjà.
     - `readOurTracks` ne sélectionne que `data-slot="video-player-subtitle-track"`.
     - La boucle des pistes étrangères ne force à `disabled` que les pistes `subtitles` et `captions`.
     - `toggle()` ne teste que nos pistes : la piste `chapters` en `hidden` ne compte jamais comme « sous-titres actifs ».
     - Le menu lit `state.subtitles`, pas `video.textTracks`.
     - Le `change` que provoque notre `hidden` relance `sync()`, qui est idempotent.
     - Le commentaire ajouté dans `sync()` garde cette règle visible.
   - **Titre (CA3)**
     - `readChapters(track)` parcourt `track.cues` et produit `{ time: cue.startTime, label: cueTitle(cue) }`. La fin est ignorée.
     - `cueTitle` : `getCueAsHTML().textContent`, puis `.replace(/\s*\n\s*/g, " ").trim()`.
     - Le parseur du navigateur fait le reste :
       - balises → éléments, `<v Nom>` → attribut `title` ;
       - horodatages internes → instructions de traitement, exclues de `textContent` ;
       - entités décodées ;
       - identifiant et réglages de la réplique hors du texte.
     - Repli sur `cue.text` si `getCueAsHTML` manque, comme `readCueText` des sous-titres.
     - Un titre vide est écarté par `resolveChapters`.
   - **Échec (CA9)**
     - Une chaîne vide ou blanche ne rend aucun `<track>`.
     - Un 404, un fichier qui n'est pas du WebVTT ou une autre origine émettent `error` côté navigateur. On ne l'écoute pas : `chapters` reste `undefined`, donc `NO_CHAPTERS`.
     - Un fichier sans réplique exploitable donne une liste vide, donc `NO_CHAPTERS`.
     - Aucun `throw`, aucun log. L'`error` d'un `<track>` ne remonte pas au `<video>` : le `handleError` de `usePlayer` ne le voit pas.
   - **Safari**
     - MP4 : une piste `chapters` intégrée au fichier, que WebKit peut exposer dans `textTracks`, n'est jamais lue : on ne lit que `ref.current.track` (CA4).
     - HLS sur macOS, iPadOS et iOS ≥ 17.1 : Shaka (MSE ou MMS), avec `disableText`. Shaka passe lui aussi toute piste `chapters` ajoutée en `hidden` et la re-force 500 ms plus tard (`activateChaptersTrack_`, `node_modules/shaka-player/lib/player.js` l.4056, commentaire « In Safari the initial assignment does not always work »). C'est le même mode que le nôtre, donc sans conflit ; d'où la décision 3.
     - HLS natif (iPhone < 17.1, ou `type="native"` forcé sur un `.m3u8`) : `video.load()` n'oublie que les pistes propres à la ressource, pas celles d'un `<track>`. Les pistes intégrées au flux ne sont pas lues.
     - Plein écran natif de l'iPhone : hors scope.
   - Mettre à jour le commentaire d'en-tête de `chapters.ts`.

3. **Lot B — site**, disjoint, ne dépend que du type. Couvre CA14, et CA12 en non-régression. Lire d'abord le guide Next 16 concerné dans `node_modules/next/dist/docs/` (AGENTS.md).
   - `sintel-chapters.vtt`, `SINTEL_CHAPTERS_FILE`, `snippet.ts` (`chaptersUrl`).
   - Page de doc :
     - exemple `S.chaptersFile`, cadre `label='chapters=".vtt"'` ;
     - le même objet part au lecteur et à `videoCnSnippet({ ...props, chapters: undefined, chaptersUrl })` ;
     - blocs `[{ code: <contenu lu>, title: "public/examples/sintel-chapters.vtt" }, { code: <JSX> }]` ;
     - `<LazyPlayer … ratio="sintel" />`.
   - Textes anglais :
     - each cue is a chapter ;
     - only its start time and text are used, the end time is ignored, so gaps leave no gap on the bar ;
     - tags and entities are stripped, lines are joined with a space, cue identifiers and settings are ignored, a cue without text is dropped ;
     - same rules as the array (first chapter at 0, any order, duplicates selon l'ambiguïté 1, cues at or after the end dropped) ;
     - the file must be served from the same origin as the page ;
     - a missing or invalid file, or one without a usable cue, silently gives no chapters, and the video plays as usual ;
     - while a new file loads, the bar stays in one piece ;
     - chapters embedded in the video or in an HLS/DASH manifest are ignored.
   - Ligne `chapters` des props : le type selon l'ambiguïté 3, et « Start time in seconds and title, or the URL of a WebVTT chapters file », avec des liens vers les deux exemples.

4. **Lot C — textes**, disjoint. Couvre CA14 (chaîne `docs`) et CA15.
   - `registry.json` `docs`, après « Live streams ignore them. » : « Or pass the URL of a WebVTT file, one cue per chapter. Only each cue's start time and text are used, and the file must be served from the same origin as your page: `<VideoCn src="/talk.mp4" chapters="/talk-chapters.vtt" />` ».
   - `mvp.md` :
     - ligne d'amendement datée du 14 octobre 2026 ;
     - section Chapitres : `chapters: string | { time, label }[]` ;
     - le paragraphe « le jour où les chapitres arriveront d'un fichier… » passe au présent : le lecteur rend le `<track>` depuis la prop, deux formes exclusives, début et titre seulement, même origine (`crossOrigin` en phase 7), fichier inexploitable = pas de chapitres sans signalement, barre d'un seul tenant pendant le chargement, chapitres intégrés ignorés.
   - `changelog.ts` selon l'ambiguïté 2.

5. **Barrières.**
   - `pnpm lint`.
   - `pnpm build && pnpm typecheck`.
   - `pnpm registry:build` : `public/r/player.json` doit contenir `use-chapter-track.ts` et la nouvelle chaîne `docs`.
   - Mesure du bundle (décision 6).

6. **Commit, puis sondes non commitées.** Vérifier chaque CA dans le navigateur (voir la stratégie), puis retirer les sondes.

7. **Bancs `base` et `radix`.** Couvre CA13 et la contrainte d'installation croisée.

8. **À la main.**
   - Safari macOS : MP4, HLS par Shaka, HLS `type="native"`.
   - Firefox.
   - iPhone : apparition des chapitres, sans CA associé (voir Risques).

### Stratégie de test
Pas de runner. Les vérifications se font avec Chrome piloté, sur la sonde `src/app/sonde-chapitres-vtt/page.tsx` (`"use client"`, non commitée).
- **Route lente** : `src/app/sonde-chapitres-vtt/lent/route.ts` sert `public/sonde/<f>.vtt` après `?ms=` de délai, en `text/vtt`, ou en `text/plain` avec `?type=plain`. Même origine.
- **Fichiers de sonde** (`public/sonde/`) :
  - `regles.vtt` (CA2) ;
  - `balises.vtt` (CA3) ;
  - `autre.vtt` (titres différents, CA7) ;
  - `vide.vtt` (en-tête seul) ;
  - `pas-du-vtt.vtt` (du HTML) ;
  - `inexploitables.vtt` (titres vides, débuts ≥ durée) ;
  - une URL absente (404).
- **Sélecteurs de la sonde** :
  - source : Sintel MP4, HLS `bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8`, DASH `bitmovin-a.akamaihd.net/content/sintel/sintel.mpd`, HLS en `type="native"`, direct `getDemoSource("live")` ;
  - chapitres : tableau, URL, `""`, `"   "`, `undefined` ;
  - sous-titres : `SINTEL_SUBTITLES` avec ou sans `default` ;
  - `controls` : aucun, `{ chapters: false }`, `{ scrubber: { chapters: false } }` ;
  - largeur : 640 ou 360 px ;
  - un bouton « re-rendre l'hôte », qui passe de nouveaux littéraux `subtitles` et `controls` avec la même URL ;
  - un mode côte à côte, tableau | fichier.
- **Panneau de diagnostic**, qui sert aussi aux passes à la main dans Safari et Firefox :
  - pour la piste de chapitres : `mode`, `readyState`, nombre de répliques ;
  - les libellés du menu ;
  - des compteurs `error` et `unhandledrejection` sur `window` ;
  - un échantillonneur (rAF et MutationObserver) qui journalise, depuis la dernière bascule, le nombre de `[data-slot=video-player-scrubber-chapter]` et les libellés du menu.

Par critère :
- CA1 → e2e, côte à côte sur Sintel MP4 à 640 px, `SINTEL_CHAPTERS` | `/examples/sintel-chapters.vtt` :
  - mêmes `--chapter-start` et `--chapter-span` segment par segment (±1e-9) ;
  - mêmes textes d'items, dans le même ordre ;
  - après `seek(400)` des deux côtés, même item `aria-checked="true"` et même `aria-label` du déclencheur (« Chapters, The shaman's tale ») ;
  - un clic sur le 5e item donne `currentTime` = 490 (±0,1) des deux côtés ;
  - à 360 px, la ligne « Chapters » porte le même titre et la sous-liste est identique.
- CA2 → e2e, `regles.vtt` contre son tableau équivalent écrit dans la sonde, avec la même comparaison qu'en CA1. Le fichier contient :
  - des répliques mélangées ;
  - une première réplique à 0:30, qui doit tomber à 0 ;
  - un trou 1:00→1:30 : `fraction + span` d'un segment doit égaler la `fraction` du suivant ;
  - une fin qui déborde sur le chapitre suivant ;
  - un doublon de même début et même fin : la première du fichier doit gagner ;
  - un doublon de même début et de fins différentes : résultat selon l'ambiguïté 1 ;
  - une réplique à exactement la durée relevée et une à 99:00:00, toutes deux écartées.

  Les débuts se comparent à 1e-6 près : ce sont des millisecondes devenues flottants.
- CA3 → e2e sous Chrome, puis à la main sous Firefox et Safari, avec le panneau. `balises.vtt` contient un identifiant de réplique et `line:0 position:10% align:start`. Résultats attendus :
  - `<b>Bold</b> and <i>italic</i> &amp; <u>under</u>` → « Bold and italic & under » ;
  - `<v Narrator>Spoken</v> <c.loud>classed</c> <lang fr>texte</lang>` → « Spoken classed texte » ;
  - deux lignes avec des espaces en bord → « First line second line » ;
  - `<00:03:30.000>`, `&nbsp;` en bord et `&lt;tag&gt;` → « Karaoke <tag> » ;
  - `<b> </b>` → réplique absente.

  On lit le premier `span` des items et l'`aria-label` du déclencheur.
- CA4 → e2e sous Chrome, Safari à la main.
  - Même fichier sur MP4, HLS et DASH : mêmes titres, mêmes débuts (horodatages du menu), même ordre. Les largeurs suivent la durée de chaque source (ambiguïté 4).
  - Toujours vérifier d'abord en MP4 : en HLS et en DASH, Shaka passe lui aussi la piste en `hidden` et masquerait un hook défaillant.
  - Chapitres intégrés : si `ffmpeg` est disponible, servir depuis `public/sonde/` un MP4 avec des chapitres intégrés différents. Sous Safari, `video.textTracks` y montre une piste `chapters` en plus, et le menu ne montre que le fichier. Sans `ffmpeg`, on s'en tient à la construction (lecture de `ref.current.track` seule), relue en review.
- CA5 → e2e.
  - Montage sans clic : `paused` vrai, `currentTime` à 0. Dès `loadedmetadata` et `readyState === 2` de la piste, on a 8 segments et le bouton Chapters.
  - Fichier lent (3 s) : 1 segment jusqu'au `load`, puis 8.
  - En HLS, le fichier arrive avant la durée : les chapitres apparaissent à l'arrivée de la durée.
- CA6 → e2e. Direct avec `sintel-chapters.vtt` : 1 segment, aucun `[aria-label^="Chapters"]`, pas de ligne Chapters à 360 px, même avec la piste chargée.
- CA7 → e2e. L'échantillonneur est armé avant chaque bascule, et B est servi par la route lente.
  - Bascules : A→B, A→tableau, tableau→B, A→`undefined`, et A→B→A avant le `load` de B.
  - Chaque échantillon vaut soit « 1 segment, pas de menu », soit exactement la nouvelle liste : jamais l'ancienne, jamais un mélange.
  - Au plus un `track[kind=chapters]` à tout instant.
  - Pour A→B→A, A ne réapparaît qu'après le `load` du nouvel élément.
- CA8 → e2e.
  - Une fois le fichier chargé, marquer l'élément `<track>` par une propriété JS et vider le journal réseau.
  - Après 10 clics « re-rendre l'hôte » : aucune requête `.vtt`, la marque est toujours sur l'élément, et l'échantillonneur ne contient que des échantillons à 8 segments.
  - En dev (StrictMode), une seule requête au montage.
- CA9 → e2e, sur `""`, `"   "`, le 404, `pas-du-vtt.vtt`, `vide.vtt` et `inexploitables.vtt` :
  - 1 segment, ni bouton ni ligne Chapters, à 640 et à 360 px ;
  - aucun `<track kind=chapters>` pour les deux chaînes ;
  - `play()` fait avancer `currentTime` ;
  - compteurs de `window` à 0, aucun « Uncaught » dans la console. La ligne réseau « 404 » du navigateur est attendue : ce n'est pas une exception.
- CA10 → e2e, côte à côte avec le tableau.
  - `{ chapters: false }` : ni bouton (640 px) ni ligne (360 px), 8 segments.
  - `{ scrubber: { chapters: false } }` : 1 segment, menu à 8 items.
- CA11 → e2e. Fichier avec `SINTEL_SUBTITLES`, puis sans `default`, comparé au même lecteur sans fichier :
  - la ligne Subtitles ne propose que Off, English et French ;
  - `aria-pressed` du bouton CC identique au montage ;
  - `c`, le bouton CC et la règle de la dernière piste rallumée se comportent à l'identique ;
  - après dix bascules, la piste de chapitres reste `hidden` avec ses répliques, et la barre garde 8 segments ;
  - sur un début de chapitre sans réplique de sous-titres, le calque est vide ; sous-titres actifs, il ne contient que le texte EN (`activeCues`).
- CA12 → e2e. Le script de la tâche 0 est rejoué : relevés identiques, aucun `track[kind=chapters]`, aucune requête `.vtt` hors sous-titres.
- CA13 → typecheck. Dans chaque banc, un fichier jetable :
  - acceptés : `chapters="/x.vtt"`, `chapters={[{ time: 0, label: "a" }]}` et un tableau `as const` ;
  - sous `// @ts-expect-error` : `42`, `{ time: 0, label: "a" }`, `["a"]`, `[{ time: "0", label: "a" }]`, `null`.

  `npx tsc --noEmit` doit passer au vert. Relire la JSDoc du `video-cn.tsx` installé. Dans le dépôt, `pnpm typecheck`.
- CA14 → curl et navigateur.
  - `curl -s localhost:3000/docs | grep -c sintel-chapters.vtt`.
  - `curl -sI localhost:3000/examples/sintel-chapters.vtt` : 200 et `text/vtt`.
  - Dans le navigateur, le texte du bloc `.vtt` égale `await (await fetch(url)).text()`.
  - Le bloc JSX porte `chapters="/examples/sintel-chapters.vtt"`, égal au `src` du `<track>` monté.
  - L'exemple joué montre les 8 titres.
  - La ligne des props porte `string | …`.
  - `public/r/player.json` contient la forme fichier, que le CLI affiche à l'installation au banc.
  - Relecture des textes anglais.
- CA15 → relecture du diff de `docs/mvp.md`.

Commandes :
- **Barrières** : `pnpm lint` ; `pnpm build && pnpm typecheck`.
- **Bundle** : `pnpm dlx esbuild registry/videocn/video-cn.tsx --bundle --minify --format=esm --external:react --external:react-dom --external:lucide-react --external:cn --external:shaka-player --external:@/components/ui/button | gzip -9 | wc -c`.
- **Bancs** : `pnpm registry:build && pnpm dlx serve public -p 4000 --cors`. Puis, dans `~/projects/videocn-test-base` et `~/projects/videocn-test-radix` :
  1. `npx shadcn@latest add @videocn/player -y -o`, et vérifier que `use-chapter-track.ts` est dans `components/ui/video-player/` ;
  2. copier `sintel-chapters.vtt` dans `public/` (même origine) ;
  3. `npx tsc --noEmit && npx next build` ;
  4. `npx next dev -p 3001` ou `3002`.

  On attend Sintel avec `chapters="/sintel-chapters.vtt"` : 8 segments, le menu, et la ligne Chapters à 360 px.
- **À la main** :
  - Safari macOS (MP4, HLS par Shaka, HLS `type="native"`) et Firefox : le panneau doit montrer `hidden`, `readyState 2` et N répliques ; refaire CA1, CA3 et CA9 ;
  - Firefox : le fichier servi en `text/plain` par la route lente (voir Risques).

### Décisions (validées le 14/10/2026)
1. **Où lire le fichier.**
   - A : un hook local appelé par `VideoCn`, avec un état React ; `ChaptersProvider` est inchangé.
   - B : dans `usePlayer`, avec un champ `PlayerState.chapterFile` comme pour les sous-titres.
   - **Recommandation : A.** Les chapitres vivent dans un contexte, pas dans le store, et personne d'autre n'a besoin de la liste brute. B élargirait `PlayerState`, exporté par `use-player.ts`, alors que la spec limite l'ajout d'API au type de `chapters`.
2. **Comment faire charger la piste.**
   - A : `track.mode = "hidden"` posé par le JS sur chaque nouvel élément, répliques lues au `load`.
   - B : l'attribut `default`, que le navigateur passe lui-même en `hidden` pour une piste `chapters`.
   - C : `cuechange` et `activeCues`.
   - **Recommandation : A.** Pour B, HTML ne fait la sélection automatique qu'une fois par `<video>` (drapeau « did-perform-automatic-track-selection », jamais remis à zéro) : une URL changée après le montage ne se chargerait pas (CA7). C ne donne que la réplique en cours.
3. **Re-forcer `hidden` (Safari).**
   - A : re-poser `hidden` sur `change` de `video.textTracks` si notre piste repasse en `disabled` ; idempotent, environ 5 lignes.
   - B : une seule affectation, et ne corriger que si la passe Safari échoue.
   - C : la minuterie de Shaka (re-poser après 500 ms).
   - **Recommandation : A.** Shaka documente ce défaut de Safari dans sa propre source, et A suit le principe « l'élément a raison, on se resynchronise sur `change` » déjà appliqué par `sync()`. Si la passe Safari montre que le retour en arrière n'émet pas `change`, on passe à C.
4. **Extraction du titre.**
   - A : `getCueAsHTML().textContent`, sauts de ligne remplacés par une espace (`/\s*\n\s*/g`), puis `trim`.
   - B : expressions régulières sur `cue.text`, plus un décodage d'entités maison.
   - **Recommandation : A.** C'est le parseur WebVTT du navigateur, déjà utilisé par `readCueText`. B réimplémenterait `<v Nom>`, `<c.a.b>`, les horodatages et toutes les entités nommées.
5. **Identité de la piste.**
   - A : `key` = URL nettoyée (un élément par URL), état `{ src, chapters? }` ajusté pendant le rendu.
   - B : un seul `<track>` dont on réécrit le `src`.
   - **Recommandation : A.** A tient CA7, jamais l'ancienne liste y compris pour A→B→A, et CA8, même élément et même référence, par construction. Avec B, la même `TextTrack` survit aux changements, et le motif « vide puis recharge » dépend du moteur.
6. **Taille du bundle**, qu'aucun CA ne demande.
   - A : remesurer, et ne modifier `bundle.ts` que si la valeur arrondie bouge.
   - B : ne pas y toucher.
   - **Recommandation : A.** `/docs` affiche cette valeur, son commentaire demande de la remesurer à chaque feature, et c'est déjà ce qu'on a fait pour l'amendement des sous-titres.
7. **Contenu du `.vtt` affiché dans `/docs`.**
   - A : lu au build depuis `public/` (`readFileSync`, précédent de `og-image.tsx`).
   - B : une constante texte en double du fichier.
   - **Recommandation : A.** CA14 exige le contenu du fichier servi ; B pourrait diverger sans bruit.

### Ambiguïtés de la spec
1. **CA2, « deux répliques au même début gardent la première ».** Impossible à garantir par l'API `TextTrack` quand leurs fins diffèrent. `track.cues` est trié par début, puis par fin décroissante, puis par ordre d'ajout (HTML, « text track cue order », vérifié ; Chrome, Firefox et WebKit font de même). L'ordre du fichier est perdu.
   - A : garder l'ordre du navigateur, c'est-à-dire la réplique qui finit le plus tard, et à fins égales la première du fichier ; reformuler CA2 et le texte de la doc dans ce sens.
   - B : télécharger et analyser le fichier soi-même, ce que la contrainte « c'est le navigateur qui lit le WebVTT » interdit.
   - C : un départage maison, par exemple la fin la plus courte : arbitraire, plus de code.
   - **Recommandation : A.** Zéro code, identique sur les trois moteurs, et le cas est un fichier mal formé.
2. **Changelog.** L'entrée `upcoming` « Chapters from a file » deviendrait fausse. Le hors-scope « Entrée dans le changelog » vise-t-il aussi son retrait ?
   - A : retirer cette ligne.
   - B : n'y rien changer.
   - **Recommandation : A.** Une ligne, et c'est le précédent du 05/10 pour les sous-titres. Le hors-scope s'entend comme « pas de nouvelle entrée datée ».
3. **CA14, type affiché dans la référence des props.**
   - A : `string | { time: number; label: string }[]`.
   - B : `string | Chapter[]`, au mot près.
   - **Recommandation : A.** Cohérent avec la ligne `subtitles`, et `Chapter` n'est défini nulle part sur la page. On lit alors CA14 comme « l'union des deux formes ».
4. **CA4, « chapitres identiques » sur trois sources de durées un peu différentes.** Les largeurs et la fin du dernier chapitre suivent la durée.
   - A : identiques = mêmes titres, mêmes débuts, même ordre ; les largeurs restent proportionnelles à chaque durée.
   - B : segments identiques au pixel, ce qui n'est tenable qu'avec des durées égales.
   - **Recommandation : A.**

### Risques
- **Chrome retient `readyState` sous `HAVE_FUTURE_DATA`** tant qu'une piste déjà active au démarrage de la sélection de ressource n'est pas chargée ou en échec : montage, changement de `src`, attache MSE de Shaka. Un fichier de chapitres lent retarde donc le début de lecture. Une URL qui ne répond jamais le bloque, cas que CA9 ne couvre pas. C'est déjà vrai aujourd'hui pour la piste de sous-titres par défaut. À mesurer avec la route lente.
- **Défaut de mode sous Safari**, documenté par Shaka : couvert par la décision 3, mais vérifiable seulement à la main.
- **Sauts de ligne de `getCueAsHTML`** : leur représentation dans le fragment peut varier selon le moteur (vtt.js sous Firefox, WebKit). Si l'un d'eux rendait un `<br>`, deux lignes se colleraient. CA3 est donc à refaire sous Firefox et Safari.
- **Type MIME** : un `.vtt` servi autrement qu'en `text/vtt` peut être refusé par certains moteurs, et l'échec est silencieux. À tester sous Firefox avec `?type=plain`. Si c'est refusé, le dire dans `/docs`.
- **iPhone** : iOS peut ignorer `preload="metadata"`, si bien que la durée, et donc les chapitres, n'arrivent qu'à la lecture. C'est déjà le cas avec le tableau ; à noter pour CA5 sur téléphone.
- **Faux positif en HLS et DASH** : Shaka met aussi la piste en `hidden`, ce qui masquerait un hook défaillant. Toujours valider d'abord en MP4.
- **A→B→A** : A est redemandé (cache HTTP probable). C'est voulu par CA7.
- **Ambiguïté 1 tranchée en A** : la doc ne doit pas promettre « la première du fichier » pour des doublons de début.
- **Chapitres intégrés (CA4, seconde moitié)** : sans `ffmpeg` pour fabriquer un MP4 de sonde, la vérification repose sur la construction et la review.
- **Couplage de la doc à `public/examples/sintel-chapters.vtt`** : déplacer le fichier casse le build, ce qui est bruyant donc acceptable.
- **SaaS** : les fichiers devront être servis depuis l'origine de la page hôte d'ici la phase 7. C'est déjà noté dans la spec.

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
- 2026-10-14 — Plan validé : décisions 1 à 7 de l'architect, toutes en recommandation (hook local
  `use-chapter-track.ts` ; `hidden` posé par le JS ; `hidden` reposé sur `change` ;
  `getCueAsHTML().textContent` ; `key` = URL ; bundle remesuré ; `.vtt` lu au build) (validée par
  Romain)
- 2026-10-14 — Ambiguïtés du plan : CA2 reformulé (doublons de début : la fin la plus tardive
  gagne, à fins égales la première du fichier) ; CA4 précisé (mêmes titres, débuts, ordre) ; CA14
  précisé (union des deux formes) ; entrée « upcoming » du changelog retirée (validée par Romain)
- 2026-10-14 — Vérification : CA1–CA15 OK sous Chrome, Firefox et WebKit (builds Playwright), bancs
  `base` et `radix` compris ; Safari réel (MP4, HLS par Shaka, HLS `type="native"`) et iPhone restent
  à vérifier à la main par Romain. La décision 3 (`hidden` reposé sur `change`) n'a pas pu être
  éprouvée sur le défaut Safari documenté par Shaka ; si elle échoue, passer à l'option C
- 2026-10-14 — Bundle remesuré : gzip de 17 231 o à 17 553 o, `bundle.ts` passe à 18 kB (décision 6)
- 2026-10-14 — Risque confirmé sous Chrome : un fichier de chapitres lent retarde le début de lecture
  de sa latence (3 s → 3 s), comme une piste de sous-titres par défaut ; accepté, non couvert par CA9
- 2026-10-14 — Review OK du premier coup, sans bloquant ; retouches de texte de « À noter »
  appliquées (`/docs`, `mvp.md`, `registry.json`, commentaire de `lazy-player.tsx`)
