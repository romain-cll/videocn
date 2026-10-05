# Sous-titres

## User story
En tant qu'intégrateur qui pose `<VideoCn>` sur sa page, je veux fournir les fichiers WebVTT de
sous-titres de ma vidéo, afin que mes spectateurs puissent activer les sous-titres et choisir leur
langue depuis le lecteur, comme sur YouTube.

## Critères d'acceptation

Dans ces critères, « la prop de sous-titres » désigne la nouvelle prop racine de `<VideoCn>` qui
liste les pistes. Chaque piste y porte au moins l'URL d'un fichier WebVTT, un code de langue, un
libellé, et peut être marquée « par défaut ». Le nom et la forme exacts sont proposés par
l'architect et validés par Romain au plan.

### Fournir les pistes

- [ ] CA1 — Étant donné un `<VideoCn>` sans prop de sous-titres, ou avec une liste vide, alors la
  barre n'a pas de bouton CC, le menu Settings n'a pas de ligne « Subtitles », et `c` ne fait rien.
- [ ] CA2 — Étant donné la prop de sous-titres avec deux pistes dont aucune n'est marquée par
  défaut, quand le lecteur est monté, alors les sous-titres sont coupés et aucun texte ne s'affiche
  sur l'image.
- [ ] CA3 — Étant donné une piste marquée par défaut, quand le lecteur est monté et la lecture
  lancée, alors cette piste est active et ses sous-titres s'affichent. Si plusieurs pistes sont
  marquées par défaut, seule la première de la liste est active. Une liste reçue vide au montage
  puis remplie ensuite (chargement asynchrone) applique sa piste par défaut à sa première arrivée
  non vide ; les changements suivants relèvent de CA5.
- [ ] CA4 — Étant donné la même prop de sous-titres passée successivement à une source MP4 (moteur
  natif), HLS et DASH (Shaka), alors le bouton CC, la ligne « Subtitles » et l'affichage se
  comportent à l'identique. Des sous-titres contenus dans le manifeste HLS ou DASH ne sont jamais
  proposés.
- [ ] CA5 — Étant donné un lecteur monté, quand la prop de sous-titres change, alors le bouton, le
  menu et l'affichage suivent la nouvelle liste. La piste active reste active si son URL figure
  encore dans la liste ; sinon les sous-titres sont coupés.
- [ ] CA6 — Étant donné plusieurs pistes, alors au plus une piste est affichée à la fois.

### Bouton CC

- [ ] CA7 — Étant donné une vidéo avec au moins une piste et aucune prop `controls`, alors la barre
  contient un bouton CC à icône, placé entre le bouton des chapitres (ou, sans chapitres, le début
  du groupe de droite) et le bouton Settings. Son nom accessible est « Subtitles », il annonce s'il
  est activé ou non aux lecteurs d'écran, et porte `aria-keyshortcuts="c"` quand les raccourcis sont
  actifs.
- [ ] CA8 — Étant donné les sous-titres coupés, quand on active le bouton CC, alors s'active la
  dernière piste choisie depuis le montage du lecteur ; à défaut, la piste marquée par défaut ; à
  défaut, la première de la liste.
- [ ] CA9 — Étant donné les sous-titres actifs, quand on active le bouton CC, alors ils sont coupés
  et le texte affiché disparaît.
- [ ] CA10 — Étant donné le bouton CC, alors son état activé et son état coupé se distinguent à
  l'œil (rendu calculé différent entre les deux états), sans couleur en dur.

### Ligne « Subtitles » du menu de réglages

- [ ] CA11 — Étant donné une vidéo avec au moins une piste, quand on ouvre le menu Settings, alors
  sa première ligne est « Subtitles », suivie de la valeur courante — « Off », ou le libellé de la
  piste active — et d'un chevron, au-dessus de « Speed » et « Quality ».
- [ ] CA12 — Étant donné le menu au premier niveau, quand on active la ligne « Subtitles », alors le
  popup affiche, sous une ligne de retour « Subtitles », l'entrée « Off » puis une entrée par piste
  dans l'ordre de la prop, l'état courant coché. Choisir une entrée l'applique et ferme le popup ;
  le bouton CC reflète aussitôt le nouvel état.
- [ ] CA13 — Étant donné le popup ouvert au clavier, alors la ligne « Subtitles » et sa sous-liste
  suivent les mêmes touches que « Speed » et « Quality » : `↑`/`↓`, `Entrée` ou `→` pour ouvrir
  (`←` en RTL), `←` pour revenir (`→` en RTL), `Échap` pour fermer et rendre le focus au bouton
  Settings.
- [ ] CA14 — Étant donné `controls={{ playbackRate: false, quality: false }}` et une vidéo avec au
  moins une piste, alors le bouton Settings reste dans la barre avec la seule ligne « Subtitles ».
  Sans aucune piste, avec ces mêmes `controls`, il disparaît comme aujourd'hui.

### Réglage par `controls`

- [ ] CA15 — Étant donné `controls={{ subtitles: false }}` et une vidéo avec des pistes, alors le
  bouton CC, la ligne « Subtitles » et le raccourci `c` disparaissent. Une piste marquée par défaut
  s'affiche quand même : `controls` règle ce que montre la barre, pas le contenu.

### Affichage

- [ ] CA16 — Étant donné une piste active et la barre masquée, quand la lecture atteint le temps
  d'un sous-titre, alors son texte s'affiche centré en bas du lecteur, et disparaît à son temps de
  fin. En plein écran, « en bas du lecteur » est le bas de l'écran, bande noire comprise.
- [ ] CA17 — Étant donné une piste active et la barre visible, alors aucun sous-titre n'est
  recouvert par les contrôles : le bas du texte reste au-dessus du haut du premier élément de la
  barre (le scrubber, ou la rangée de boutons avec `controls={{ scrubber: false }}`) ; le dégradé
  de la barre peut passer derrière. Quand la barre se masque, le texte revient en bas du lecteur.
- [ ] CA18 — Étant donné le lecteur en plein écran, alors les sous-titres s'affichent et suivent
  CA16 et CA17 comme hors plein écran.
- [ ] CA19 — Étant donné un sous-titre affiché, alors chaque ligne de texte est posée sur un fond
  opaque ou semi-opaque qui la sépare de l'image, couleurs du texte et du fond tirées des tokens du
  thème, aucune couleur en dur.
- [ ] CA20 — Étant donné un iPhone et une piste active, quand on passe en plein écran (plein écran
  natif du système), alors les sous-titres de cette piste restent affichés.

### Clavier

- [ ] CA21 — Étant donné une vidéo avec des pistes et le focus dans le lecteur, quand on presse `c`,
  alors l'effet est celui d'un clic sur le bouton CC (CA8, CA9) et la barre apparaît. Comme les
  autres bascules : sans effet avec Ctrl, Cmd ou Alt, pas de répétition si la touche reste
  enfoncée, inactif dans un `input`, un `textarea` ou un `contenteditable` de la page hôte, et coupé
  par `controls={{ keyboard: false }}`.

### Largeur

- [ ] CA22 — Étant donné un lecteur de 360 px de large, une vidéo de moins d'une heure avec
  chapitres et sous-titres, et aucune prop `controls`, alors tous les contrôles de la barre sont
  entièrement visibles, volume replié comme déplié, et aucun ne déborde du lecteur.
- [ ] CA23 — Étant donné une vidéo sans sous-titres, alors les critères CA19 et CA22 de la refonte
  de la barre (`docs/features/refonte-barre-controles.md`) restent vrais à 360 px.

### Site et documentation

- [ ] CA24 — Étant donné la page `/docs`, alors elle documente la prop de sous-titres (champs de
  chaque piste), la clé `controls.subtitles`, le raccourci `c` dans le tableau des raccourcis, et
  montre un exemple jouable : Sintel avec ses sous-titres officiels en anglais et en français,
  fichiers `.vtt` servis par le site. Elle indique que les fichiers `.vtt` doivent être servis
  depuis la même origine que la page. La chaîne `docs` de `registry.json`, affichée par le CLI à
  l'installation, montre aussi un exemple `subtitles`. Textes en anglais.
- [ ] CA25 — Étant donné `docs/mvp.md`, alors un amendement daté du jour décrit le bouton CC, la
  ligne « Subtitles », la prop et le raccourci `c` (tableau des raccourcis compris), et indique que
  la taille et la position font l'objet de la feature suivante.

## Hors scope
- Réglage de la taille et de la position des sous-titres : feature suivante (décision du
  05/10/2026).
- Chapitres chargés depuis un fichier `.vtt` : feature séparée, juste après (décision du
  05/10/2026).
- Sous-titres intégrés aux manifestes HLS ou DASH : la gestion texte de Shaka reste désactivée.
- Formats autres que WebVTT (SRT, TTML…) ; génération automatique de sous-titres.
- Mémoriser le choix de piste d'une page ou d'une visite à l'autre.
- Choisir la piste selon la langue du navigateur.
- Libellé ou code de langue affiché dans le bouton CC.
- Respect garanti des réglages de position inscrits dans le fichier (`line`, `position`, `align`)
  et des styles du fichier (balises de couleur, `::cue`).
- Sous-titres en Picture-in-Picture (dépend du navigateur).
- Comportement garanti sur un flux en direct.
- Signaler un fichier introuvable ou invalide.
- Fichiers `.vtt` servis depuis une autre origine que la page (pas d'attribut `crossorigin`, pas de
  téléchargement par le lecteur) : prop `crossOrigin` notée pour la phase 7.
- Masquer des contrôles en dessous de 360 px de large.
- Entrée dans le changelog du site.

## Contraintes
- Règles de `registry/README.md` : aucun import de framework, `"use client"`, ni `asChild` ni
  `render`, tokens sémantiques uniquement, un fichier = une responsabilité. Tout nouveau fichier
  rejoint le `files[]` de l'item unique `player`, jamais un nouvel item.
- Sous-titres par `<track>` et l'API `TextTrack`, identiquement pour les deux moteurs ; Shaka garde
  `manifest.disableText` (règle de `docs/mvp.md`, section Moteur vidéo).
- `<VideoCn>` n'accepte toujours pas de `children` : le lecteur rend les `<track>` depuis la prop.
- La sous-liste « Subtitles » vit dans le menu de réglages existant (`settings-menu.tsx`), rendu
  dans le conteneur du lecteur, sans portail.
- Ajouts d'API limités à la prop de sous-titres et à la clé `controls.subtitles`, qui suit la règle
  « `boolean | objet d'options` » de `controls-options.ts`. Tout autre besoin de prop va dans la
  liste de la phase 7.
- Le raccourci `c` suit le contrat de la keymap (`docs/mvp.md`, Raccourcis clavier).
- Fichiers `.vtt` de démonstration hébergés par le site, tirés des sous-titres officiels de Sintel
  (Blender Foundation) ; licence vérifiée et attribution donnée si elle l'exige.
- `docs/mvp.md` amendé, daté du jour.
- `pnpm lint` passe. Installation croisée vérifiée en `radix` et en `base`, avec passe RTL.
- Site en anglais ; commentaires du code en français.

## Plan technique
### Approche
**Prop (décision 1).** `subtitles?: readonly SubtitleTrack[]` est une prop racine, comme `chapters`, avec `SubtitleTrack = { src: string; srcLang: string; label: string; default?: boolean }`. Ce sont les attributs de `<track>`, sous leur nom React. La liste est normalisée dans `subtitles.ts` : une entrée sans `src` ou sans libellé est écartée, et pour une URL répétée la première gagne, parce que l'URL sert d'identité à CA5. `controls.subtitles?: boolean` est résolue en `{ enabled }`, comme `chapters`.

**État : l'élément a raison.** `<VideoCn>` rend dans `<video>` un `<track kind="subtitles" data-slot="video-player-subtitle-track">` par piste, avec l'URL pour clé et **jamais l'attribut `default`** : le navigateur afficherait alors la piste lui-même, et le texte apparaîtrait en double.

Un nouveau hook, `use-subtitles.ts`, est appelé par `usePlayer` :
- `PlayerState` gagne trois champs : `subtitles` (la liste normalisée, à référence stable), `activeSubtitle` (une URL, ou `null`) et `subtitleText`.
- `PlayerActions` gagne `selectSubtitles(src | null)` et `toggleSubtitles()`.

Comme `setVolume`, les actions écrivent `track.mode`, et le store suit l'élément par une fonction `sync()`. Elle est déclenchée par `change`, `addtrack` et `removetrack` sur `video.textTracks`, par `webkitbeginfullscreen` et `webkitendfullscreen`, et à la fin de chaque action. Elle fait cinq choses :
- elle prend pour active notre piste `showing`, et à défaut notre piste `hidden` ;
- elle force à `disabled` nos autres pistes (CA6), ainsi que toute piste `subtitles` ou `captions` qui n'est pas à nous, comme les pistes embarquées du HLS natif de Safari (CA4) ;
- elle publie `activeSubtitle` ;
- elle retient la dernière piste active (CA8) ;
- elle rebranche `cuechange` vers `subtitleText` : `getCueAsHTML().textContent` pour chaque réplique, les répliques jointes par `\n`.

CA5 découle du DOM. Un `<track>` dont l'URL reste dans la liste garde son élément et donc son mode. S'il est retiré, il n'y a plus de piste active, donc les sous-titres sont coupés.

Le `default` est appliqué au premier `sync` qui voit nos pistes (décision 7). Le store est amorcé avec cette piste, si bien que le bouton CC est allumé dès la première peinture, rendu serveur compris (CA3).

Rien ne dépend du moteur. Shaka garde `manifest.disableText` (CA4). J'ai vérifié dans shaka 5.2.11 qu'en MSE son `NativeTextDisplayer` ne gère que ses propres nœuds `<track>`.

**Rendu maison (décision 2).** La piste active est en `hidden` : le navigateur charge les répliques et émet `cuechange`, mais ne dessine rien. `subtitle-display.tsx` dessine `subtitleText` dans le conteneur, ce qui le fait vivre en plein écran du conteneur (CA18). Le dessin se fait sur un îlot `dark`, comme la barre : un `span` en `bg-background/80 text-foreground rounded-sm px-1.5 box-decoration-clone whitespace-pre-line`. Chaque ligne a ainsi son fond, et le rayon suit celui de l'hôte (CA19).

Il y a une seule exception, le plein écran natif de l'iPhone, où le conteneur n'est plus affiché. Tant que `webkitDisplayingFullscreen` est vrai, `sync()` passe la piste active en `showing` : le système la rend, avec son propre style. À la sortie, elle redevient `hidden` (CA20).

Le rendu natif partout est écarté. Pour tenir CA17, il faudrait réécrire en JavaScript le `line` de chaque réplique, ou passer par `::-webkit-media-text-track-container`, qui n'existe pas dans Firefox. Et `::cue` ne lit pas l'îlot `dark`.

**Placement (CA16–CA18).** Le calque est en `absolute inset-x-0 pointer-events-none`, sous la barre (`z-10`). Il porte `aria-hidden`, parce que le rendu natif n'est pas exposé aux lecteurs d'écran non plus.

Sa position verticale est `bottom-[var(--player-subtitles-offset,0px)]`. Un `ResizeObserver` sur `[data-slot="video-player-controls"]` y écrit, par `style.setProperty` comme le fait déjà le menu, la hauteur de la barre moins son `padding-top`. Le `padding-top` est le dégradé : la valeur obtenue correspond donc au haut du scrubber (décision 3).

`group-data-hidden/player:bottom-0`, avec `group/player` posé sur le conteneur, redescend le calque quand la barre se masque. Avec `visibility: "never"`, il n'y a pas de barre, donc pas de variable, et le calque reste en bas. Le déplacement suit le fondu de la barre : `transition-[bottom] duration-200 motion-reduce:transition-none`.

La taille du texte est proportionnelle à la largeur : `@container` sur le calque, `text-[length:clamp(0.875rem,2.5cqw,2.5rem)]` sur le texte (décision 8). Les répliques sont centrées. Les réglages `line`, `position` et `align` du fichier sont ignorés (hors scope).

**`crossorigin` (décision 4).** Un `<track>` se charge en mode same-origin, sauf si le `<video>` porte l'attribut `crossorigin`. C'est donc l'origine de la **page** qui compte, pas celle de la vidéo. Les `.vtt` de la démo sont servis par le site : ils se chargent alors que Sintel vient d'archive.org.

On n'ajoute pas `crossorigin` : la requête du MP4 deviendrait une requête CORS, et casserait chez les hébergeurs qui n'envoient pas l'en-tête. La contrainte est écrite dans `/docs`, et une prop `crossOrigin` est ajoutée à la liste de la phase 7.

**Largeur (CA22/CA23, décision 5).** À 360 px (334 px de contenu), avec chapitres et l'horodatage `59:59 / 59:59`, la barre occupe aujourd'hui environ 323 px, soit environ 11 px de marge. Le bouton CC ajoute 36 px, ce qui donne environ 359 px : débordement d'environ 25 px.

Deux changements récupèrent la place :
- **Déclencheurs de menu plus étroits** : ceux des chapitres et des réglages passent de `sm` à `icon`, soit de 36 à 32 px, avec une icône de 16 px comme les autres boutons. Gain : 8 px.
- **Plus d'espacement sous le seuil** : sous le seuil de 30rem déjà en place, `@max-[30rem]:gap-0` sur la rangée et sur le groupe de droite. Gain : 28 px.

Résultat avec sous-titres :
- volume replié : environ 323 px, soit environ 11 px de marge, celle de CA19 aujourd'hui ;
- volume déplié : environ 320 px, avec le volet à 96 px et l'horodatage en `sr-only`.

Sans sous-titres (CA23), la marge monte à environ 43 px replié et 46 px déplié. Au-dessus du seuil, les espacements ne changent pas : volet ouvert, il faut environ 454 px pour 480 disponibles.

**Bouton, menu, touche.**
- **Bouton CC** (`subtitles-toggle.tsx`) : `Button` en `ghost` et `icon`, avec `CaptionsIcon`.
  - Accessibilité : `aria-label="Subtitles"` fixe, `aria-pressed` et `aria-keyshortcuts="c"`. Contrairement à `PlayToggle`, le libellé ne change pas : c'est l'état pressé qui dit si les sous-titres sont actifs.
  - État actif : une barre `bg-primary` sous l'icône (décision 6).
  - Le bouton rend `null` sans pistes ou avec `controls.subtitles: false`.
- **Menu** (`settings-menu.tsx`) : une ligne « Subtitles » en tête.
  - Sa valeur est « Off » ou le libellé de la piste active, sans `dir="ltr"` puisque c'est un texte de l'intégrateur.
  - La vue « subtitles » contient la ligne de retour, « Off », puis un `PlayerMenuRadioItem` par piste.
- **Touche `c`** : une bascule dans la keymap, résolue seulement si `controls.subtitles` est actif et qu'il y a des pistes. Sinon, la touche est laissée à l'hôte.

Aucune dépendance n'est ajoutée : `CaptionsIcon` est déjà dans lucide-react 1.47.

### Fichiers impactés
Chemins relatifs à `/Users/romain/videoCn`.
- créé : `registry/videocn/subtitles.ts` — type public `SubtitleTrack`, `NO_SUBTITLES`, `resolveSubtitles`, `signSubtitles`, `pickSubtitleToEnable` (dernière choisie, sinon défaut, sinon première). Fonctions pures, comme `chapters.ts`.
- créé : `registry/videocn/use-subtitles.ts` — liste stable vers le store, `sync()` entre l'élément et le store, répliques, plein écran natif, les deux actions.
- créé : `registry/videocn/subtitles-toggle.tsx` — le bouton CC.
- créé : `registry/videocn/subtitle-display.tsx` — le calque des répliques et la mesure de la barre.
- créé : `public/examples/sintel-en.vtt`, `public/examples/sintel-fr.vtt` — sous-titres officiels convertis en WebVTT UTF-8, avec un bloc `NOTE` d'attribution.
- modifié : `registry/videocn/player-state-store.ts` — `subtitles`, `activeSubtitle`, `subtitleText` et leurs valeurs initiales.
- modifié : `registry/videocn/use-player.ts` — option `subtitles`, store amorcé (liste et piste par défaut), appel de `useSubtitles`, deux actions dans `PlayerActions` et dans son mémo.
- modifié : `registry/videocn/video-cn.tsx` — prop `subtitles` et sa JSDoc, `<track>` dans `<video>`, `<SubtitleDisplay />` après la vidéo, `group/player` sur le conteneur, option `subtitles` passée à la keymap.
- modifié : `registry/videocn/controls-options.ts` — `subtitles?: boolean`, résolue en `subtitles: { enabled }` ; `c` ajouté au commentaire de `keyboard`.
- modifié : `registry/videocn/use-keyboard-shortcuts.ts` — `c` vers `toggleSubtitles`, en bascule.
- modifié : `registry/videocn/player-controls.tsx` — `<SubtitlesToggle />` entre `<ChapterMenu />` et `<SettingsMenu />`, `@max-[30rem]:gap-0` sur les deux rangées, commentaire.
- modifié : `registry/videocn/settings-menu.tsx` — ligne et vue « Subtitles », conditions de `null` et de `disabled` (CA14), retour de focus calculé sur la position de la ligne parmi celles présentes.
- modifié : `registry/videocn/player-menu.tsx` — `PlayerMenuTrigger` en `size="icon"`, commentaire corrigé.
- modifié : `registry.json` — `files[]` : les quatre nouveaux fichiers (`@ui/video-player/…`) ; chaîne `docs` selon la décision 10.
- modifié : `src/lib/videos.ts` — `SINTEL_SUBTITLES`.
- modifié : `src/lib/snippet.ts` — `subtitles?: string`, le nom de la variable, comme pour `chapters`.
- modifié : `src/app/docs/page.tsx` — exemple « Subtitles » (sommaire compris), ligne `subtitles` du tableau des props, ligne accessibilité (le bouton CC annonce `c`), pied de page (« Subtitles … not available yet » devient faux).
- modifié : `src/components/docs/controls-table.tsx` — ligne `subtitles` ; la phrase de `quality` sur la disparition du bouton Settings tient compte des sous-titres.
- modifié : `src/components/keyboard-shortcuts.tsx` — `C` « Subtitles on / off », repris par la doc et le playground.
- modifié : `src/lib/bundle.ts` — `core` remesuré ; son commentaire le demande pour les sous-titres.
- modifié : `docs/mvp.md` — amendement daté du 5 octobre 2026 (CA25).

### Tâches (ordonnées)
1. **Contrats, commités avant tout agent.**
   - `subtitles.ts` complet.
   - Les trois champs de `PlayerState`.
   - `UsePlayerOptions.subtitles` et les deux signatures de `PlayerActions`.
   - `VideoCnProps.subtitles` et `controls.subtitles`.
   - Bouchons : `use-subtitles.ts` (actions sans effet), `subtitle-display.tsx` et `subtitles-toggle.tsx` (rendent `null`).
   - Entrées `files[]` de `registry.json`.
2. **Lot A — moteur et affichage** (CA1–CA6, CA8, CA9, CA16–CA21). Fichiers : `use-subtitles.ts`, `use-player.ts`, `video-cn.tsx`, `use-keyboard-shortcuts.ts`, `subtitle-display.tsx`. Points durs :
   - `sync()` doit être idempotent : il se relance sur le `change` qu'il provoque.
   - Le cache de la liste suit le motif de `ChaptersProvider` (état ajusté pendant le rendu), amorcé par la liste du store pour éviter un second rendu au montage.
   - La mesure se fait en `useLayoutEffect` avec un `ResizeObserver`.
   - Chaque chaîne de classes s'écrit sur une ligne (piège RTL du CLI).
3. **Lot B — barre et menu** (CA7, CA10–CA15, CA22), disjoint du lot A et parallélisable avec lui. Fichiers : `subtitles-toggle.tsx`, `settings-menu.tsx`, `player-controls.tsx`, `player-menu.tsx`.
4. **Site** (CA24), disjoint des lots A et B (il ne lit que le type) et parallélisable.
   - Télécharger les SRT officiels anglais et français sur durian.blender.org et y lire la licence. CC BY 3.0 est attendu ; si c'est autre chose, on s'arrête et on demande.
   - Les convertir en WebVTT UTF-8 : en-tête `WEBVTT`, virgule remplacée par un point dans les horodatages, bloc `NOTE` d'attribution. Vérifier le calage sur le MP4 d'archive.org.
   - `videos.ts` : `English` marquée par défaut, et `French` en libellé anglais, puisque le site est en anglais.
   - `snippet.ts`, la page de doc, le tableau des contrôles, les raccourcis.
   - Textes à écrire :
     - les sous-titres embarqués dans un manifeste sont ignorés ;
     - les `.vtt` doivent être de même origine que la page ;
     - `default` : seule la première piste marquée compte ;
     - `controls.subtitles: false` laisse quand même s'afficher une piste par défaut ;
     - crédit « Sintel © Blender Foundation | durian.blender.org, CC BY 3.0 ».
5. **Intégration (moi).**
   - Chaîne `docs` de `registry.json` (décision 10).
   - `docs/mvp.md` (CA25) :
     - tableau des contrôles ;
     - note sur les menus ;
     - tableau des raccourcis et règle des bascules ;
     - section Sous-titres, qui renvoie la taille et la position à la feature suivante ;
     - la phrase des chapitres « en phase 6 » devient « feature séparée ».
   - `bundle.ts`.
6. **Barrières** : CLI Tailwind dans un dossier jetable, `pnpm lint`, `pnpm build && pnpm typecheck`.
7. **Commit, puis sondes** : page de vérification non commitée, vérification navigateur de chaque CA, retrait des sondes.
8. **Bancs `base` et `radix`**, avec passe RTL. À la main : CA20 sur iPhone, CA10 et CA19 à l'œil, plein écran système.

### Stratégie de test
Pas de runner (décision de la spec). La vérification passe par une page sonde non commitée, `src/app/sonde-sous-titres/page.tsx`, posée après le commit. Elle offre :
- **Sources** : Sintel en MP4 (archive.org), en HLS `https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8` et en DASH `https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd`. Ces deux flux portent des sous-titres embarqués ; il faut vérifier qu'ils répondent, sinon prendre les flux mux et akamai.
- **Listes** : EN par défaut et FR ; FR seule, même URL ; autres URL ; liste vide ; deux pistes `default`.
- **Réglages** : préréglages de `controls`, largeur forcée à 360 ou 640 px, chapitres de Sintel.

Par critère :
- CA1 → e2e — sans prop, puis avec `[]` : le snapshot a11y n'a pas de « Subtitles », le menu n'a pas la ligne. `c` envoyé au conteneur : `defaultPrevented` reste faux et rien ne change.
- CA2 → e2e — deux pistes sans défaut, lecture lancée : toutes nos pistes sont `disabled`, le calque est vide, `aria-pressed="false"`.
- CA3 → e2e — exemple de `/docs` : la piste EN est `hidden` et `aria-pressed="true"`. Après un saut sur une réplique connue, le texte du calque égale `activeCues`. Liste à deux `default` : seule la première n'est pas `disabled`.
- CA4 → e2e — même liste sur MP4, HLS et DASH : même bouton, mêmes entrées de menu, mêmes `aria-checked`. `video.textTracks` ne contient aucune piste `subtitles` ou `captions` non `disabled` en dehors des nôtres. Le texte s'affiche dans les trois cas.
- CA5 → e2e — liste changée en gardant l'URL active : la piste reste `hidden` et le CC pressé. Liste sans cette URL : sous-titres coupés, calque vide. Le menu suit la nouvelle liste.
- CA6 → e2e — après chaque action, au plus une de nos pistes n'est pas `disabled`. Un `mode = "showing"` forcé par script sur une seconde piste : après `change`, une seule reste active, en `hidden`.
- CA7 → e2e (snapshot a11y) — ordre Chapters, Subtitles, Settings ; sans chapitres, Subtitles est le premier du groupe de droite. `aria-pressed` présent, `aria-keyshortcuts="c"`, absent avec `keyboard: false`.
- CA8 → e2e — FR choisie, CC coupé puis rallumé : FR. Montage sans défaut, CC : la première. Défaut EN, coupé puis rallumé : EN. FR retirée de la liste, puis CC : la piste par défaut.
- CA9 → e2e — CC coupé : toutes les pistes `disabled`, calque vide dès la frame suivante.
- CA10 → e2e (CSSOM) — la barre sous l'icône n'existe que si `aria-pressed="true"`, et sa couleur calculée est le `--primary` de l'îlot. Captures des deux états.
- CA11–CA13 → e2e (`press_key`) — la séquence de la refonte (↑ ↓ Entrée → ← Échap) sur « Subtitles » : focus rendu à Settings, `currentTime` et `volume` immobiles. Choisir « French » ferme le popup et presse le CC. Séquence refaite en `dir="rtl"`.
- CA14 → e2e — `playbackRate: false, quality: false` : Settings actif avec une seule ligne. Sans pistes : bouton absent.
- CA15 → e2e — `subtitles: false` avec une piste par défaut : ni bouton ni ligne, `c` non consommé, texte affiché.
- CA16 → e2e — lecture, souris sortie avec `hover` hors du lecteur, puis attente : centre du texte à ±1 px du centre du conteneur, bas du calque au bas du conteneur. À `endTime`, le calque est vide.
- CA17 → e2e (mesure) — en pause, barre visible : le bas du texte est au-dessus du haut du premier enfant de la barre, à 640 et à 360 px, et avec `scrubber: false`. Barre masquée : retour en bas, mesuré après 250 ms à cause de la transition. Avec `visibility: "never"` : en bas.
- CA18 → e2e (vrai `click` sur le bouton plein écran) — `document.fullscreenElement` est le conteneur, et les mesures de CA16 et CA17 tiennent. Le plein écran système se vérifie à la main (webdriver).
- CA19 → CSSOM — `background-color` et `color` du `span` égaux à ceux d'une sonde `dark bg-background/80 text-foreground`, `box-decoration-break: clone`. Une réplique de deux lignes donne deux rectangles de fond. Refait sous `.demo-theme-blue` et en mode sombre. `no-raw-colors` est couvert par le lint.
- CA20 → à la main, par Romain, sur un iPhone : plein écran natif, répliques visibles, et le choix fait dans le menu du système retrouvé à la sortie.
- CA21 → e2e (`dispatchEvent` sur le conteneur) — `c` bascule et retire `data-hidden`. Sans effet avec Ctrl, Cmd ou Alt, avec `repeat: true`, depuis une cible `input` ou `contenteditable`, et avec `keyboard: false`.
- CA22 → e2e (mesure) — 360 px, chapitres et sous-titres, texte forcé à `59:59 / 59:59` : chaque contrôle est dans la barre, `scrollWidth ≤ clientWidth`, marge relevée. Déplié (survol du muet, Tab, glissement avec `pointerId: 1`) : volet à 96 px, horodatage en `sr-only`, rien ne déborde. Même script dans les deux bancs.
- CA23 → e2e — les scripts de CA19 et CA22 de la refonte, sur une vidéo sans sous-titres à 360 px.
- CA24 → `curl -s localhost:3000/docs | grep -E 'subtitles|controls.subtitles'` ; `curl -sI localhost:3000/examples/sintel-fr.vtt` doit renvoyer 200 et `text/vtt`. Lecture de l'exemple en EN puis en FR, relecture des textes anglais.
- CA25 → relecture du diff de `docs/mvp.md`.

Commandes :
- **Barrières** : `pnpm lint` ; `pnpm build && pnpm typecheck`.
- **Classes Tailwind** : `npx @tailwindcss/cli`, lancé depuis le dépôt, sur un dossier jetable (`@import "tailwindcss" source(none); @source "./candidats.html";`). Les candidats `bottom-[var(--player-subtitles-offset,0px)]`, `group-data-hidden/player:bottom-0`, `text-[length:clamp(…cqw…)]`, `box-decoration-clone` (préfixe `-webkit-` attendu) et `@max-[30rem]:gap-0` doivent être générés.
- **Taille du bundle** : `pnpm dlx esbuild registry/videocn/video-cn.tsx --bundle --minify --format=esm --external:react --external:react-dom --external:lucide-react --external:cn --external:shaka-player --external:@/components/ui/button | gzip -9 | wc -c`.
- **Bancs** : dans le dépôt, `pnpm registry:build && pnpm dlx serve public -p 4000 --cors`. Puis dans `~/projects/videocn-test-base` et `~/projects/videocn-test-radix` :
  1. `npx shadcn@latest add @videocn/player -y -o` ;
  2. `npx tsc --noEmit && npx next build` ;
  3. copier les deux `.vtt` dans le `public/` du banc (même origine, décision 4) ;
  4. `npx next dev -p 3001` ou `3002`.
  Passe RTL : `"rtl": true` dans `components.json`, `<html dir="rtl">`, réinstallation avec `-y -o`.
- **À la main seulement** : CA20, plein écran système, rendu des bancs et du RTL, CA10 et CA19 à l'œil.

### Décisions à valider
1. **Nom et forme de la prop.**
   - A : `subtitles: { src, srcLang, label, default? }[]`.
   - B : `subtitles: { src, lang, label, default? }[]`.
   - C : une prop générique `tracks: { kind?, src, … }[]`.
   - **Reco A** : se copie depuis un `<track>` existant, et `srcLang` est le nom React. Le nom `subtitles` fait la paire avec `controls.subtitles` et la ligne du menu, comme `chapters` et `controls.chapters`. C préparerait les chapitres en `.vtt`, qui sont une feature à part.
2. **Mode de rendu.**
   - A : rendu maison (piste en `hidden`, calque dans le conteneur), et rendu du système seulement en plein écran natif de l'iPhone.
   - B : rendu natif partout (`showing`, `::cue`).
   - **Reco A** : B ne tient pas CA17 sans réécrire les répliques en JavaScript ou sans un pseudo-élément absent de Firefox, et `::cue` ne lit pas l'îlot `dark`.
3. **[Ambiguïté] CA17, « le haut de la barre ».** La barre commence par 40 px de dégradé (`pt-10`).
   - A : le haut du scrubber.
   - B : le haut de l'élément barre, dégradé compris.
   - **Reco A** : c'est le cas de YouTube. Avec B, dans un lecteur de 360 × 202 px, le bas du texte serait à environ 86 px du haut, au milieu de l'image.
4. **[Ambiguïté] `.vtt` servis depuis une autre origine que la page.**
   - A : pas de `crossorigin` ; même origine exigée, documentée, et `crossOrigin` noté pour la phase 7.
   - B : le lecteur télécharge lui-même le `.vtt` (`fetch` CORS) et le pose en blob URL dans le `<track>`. Aucune API à ajouter, mais une trentaine de lignes : annulation, révocation, piste sans `src` le temps du chargement.
   - C : `crossorigin` toujours posé sur `<video>`. Les MP4 servis sans en-tête CORS ne se chargeraient plus.
   - **Reco A** : tous les CA tiennent, la démo est de même origine. Le vrai besoin arrivera avec les `.vtt` hébergés par le SaaS ; il se tranchera alors avec le storyboard, qui demandera de toute façon de télécharger et de lire un `.vtt`.
5. **Largeur à 360 px.**
   - A : déclencheurs de menu en `icon`, et `@max-[30rem]:gap-0`.
   - B : A, plus `@max-[30rem]:size-8` sur chaque bouton à icône de la barre (6 fichiers), pour que les styles à boutons de 36 px tiennent aussi.
   - C : sous 30rem, l'horodatage perd sa durée (toujours lue par les lecteurs d'écran).
   - **Reco A** : le site et le banc base gardent environ 11 px de marge. Le banc radix-vega est estimé à −17 px ; il serait déjà à environ −9 px aujourd'hui sur CA19, mais ce cas n'a jamais été mesuré. B corrige radix-vega, mais impose une dimension à la primitive de l'hôte, en exception à la règle du README : à décider après la mesure au banc. C retire une information à tous les lecteurs de moins de 506 px.
6. **Aspect du bouton CC actif.**
   - A : même icône, avec une barre de 2 px en `bg-primary` dessous.
   - B : `CaptionsIcon` remplacée par `CaptionsOffIcon` quand c'est coupé.
   - **Reco A** : c'est le geste de YouTube, et `primary` est déjà la couleur de « actif » dans le lecteur (le scrubber).
7. **[Ambiguïté, CA3 contre CA5] Liste arrivée après le montage** (chargée en asynchrone, ou d'abord vide).
   - A : `default` n'est lu qu'au montage.
   - B : la première liste non vide compte comme le montage ; les changements suivants suivent CA5.
   - **Reco B** : sinon, un intégrateur qui charge ses pistes de façon asynchrone voit `default` ignoré sans comprendre. Il n'y a alors aucune piste active à garder, donc B ne contredit pas CA5. Coût : une ref.
8. **[Ambiguïté] Taille du texte par défaut.** Le réglage de la taille est hors scope, pas sa valeur de départ.
   - A : proportionnelle à la largeur, `clamp(0.875rem, 2.5cqw, 2.5rem)` : 14 px à 360 px, 16 px à 640 px, 40 px en plein écran 1920 px.
   - B : fixe, `text-base`.
   - **Reco A** : avec B, 16 px sur un écran de 1920 px sont illisibles, alors que CA18 demande que le plein écran fonctionne.
9. **[Ambiguïté] CA16, « en bas de l'image » en plein écran.** Un film en 2,35:1 laisse des bandes noires sur un écran 16:9.
   - A : en bas du lecteur, c'est-à-dire de l'écran ; le texte tombe dans la bande noire.
   - B : en bas de l'image affichée, rectangle recalculé en JavaScript.
   - **Reco A** : du CSS seul, et le texte sur une bande noire ne cache rien. La position fait de toute façon l'objet de la feature suivante.
10. **[Ambiguïté, périmètre de CA24] Chaîne `docs` de `registry.json`**, celle que le CLI affiche à l'installation.
    - A : y ajouter un exemple `subtitles`, avec la contrainte de même origine.
    - B : ne pas y toucher.
    - **Reco A** : sinon, le CLI présente le lecteur sans la nouvelle prop.

### Risques
- **CA22 tient de justesse** : environ 11 px de marge sur le site, selon la police de l'hôte. Il faut mesurer la marge, pas seulement constater que « ça rentre ». Le banc radix-vega, avec ses boutons de 36 px, déborde sans la décision 5 = B.
- **Vidéo de plus d'une heure, à 360 px, avec chapitres et sous-titres** : débordement d'environ 13 px. C'est hors de CA22, et déjà le cas sur CA19. Juste au-dessus de 30rem, le volet déplié se comprime d'environ 1 px.
- **Couplage du calque et de la barre** : la mesure suppose le `data-slot` de la barre, et que son `padding-top` soit le dégradé. Restructurer la barre casserait CA17 sans erreur : à commenter des deux côtés.
- **Safari et les préférences de sous-titres du système** : Safari peut activer une piste de lui-même. Le lecteur l'adopte (CC allumé), donc CA2 n'est pas strictement garanti sur ces systèmes.
- **Fiabilité de `webkitDisplayingFullscreen`** :
  - à vérifier qu'il vaut déjà vrai au moment de `webkitbeginfullscreen` (CA20, vérifiable à la main seulement) ;
  - à vérifier qu'il reste faux pendant le plein écran du conteneur sous Safari macOS. Sinon, la piste passe en `showing` et le texte apparaît en double.
- **Shaka en mode `src=`** : son `NativeTextDisplayer` agirait alors sur toutes les pistes `subtitles`. Ce chemin est inatteignable aujourd'hui (MSE est préféré, et le repli natif est le nôtre), mais il casserait le rendu natif de l'iPhone si Shaka le prenait.
- **Sous-titres embarqués du HLS natif** (iPhone antérieur à iOS 17.1) : en les forçant à `disabled`, on coupe aussi les sous-titres « forcés » qu'ils portent.
- **`.vtt` d'une autre origine** (décision 4 = A) : ils échouent sans bruit, et signaler l'erreur est hors scope. Les intégrateurs y tomberont : la documentation doit le dire nettement.
- **Fichiers Sintel** :
  - encodage du SRT d'origine, peut-être Latin-1 : à convertir ;
  - calage sur la version d'archive.org à vérifier ;
  - licence des fichiers de sous-titres à confirmer.

  Le film lui-même est déjà affiché ailleurs sur le site sans crédit ; c'est hors périmètre, mais à signaler.
- **En-tête des `.vtt`** : il faut `text/vtt` servi par `next start` et en production (Railpack). À vérifier par `curl -I`.
- **Changement visible partout** : les déclencheurs des chapitres et des réglages passent de 36 à 32 px, et leur icône de 14 à 16 px, avec ou sans sous-titres.
- **Taille du bundle** : la valeur affichée dans `/docs` (14 kB gzip) va bouger ; elle est remesurée à la tâche 5.

## Décisions
- 2026-10-05 — Un bouton CC dans la barre active ou coupe les sous-titres ; une ligne « Subtitles » du menu de réglages choisit la piste (validée par Romain)
- 2026-10-05 — Taille et position des sous-titres reportées à la feature suivante (validée par Romain)
- 2026-10-05 — Chapitres depuis un fichier `.vtt` : feature séparée (validée par Romain)
- 2026-10-05 — Raccourci `c` ajouté à la keymap (validée par Romain)
- 2026-10-05 — Démo dans `/docs` avec Sintel et ses sous-titres officiels anglais et français (validée par Romain)
- 2026-10-05 — Avec `controls={{ subtitles: false }}`, une piste marquée par défaut s'affiche quand même : `controls` règle la barre, pas le contenu (CA15) (validée par Romain)
- 2026-10-05 — Pas de runner de tests ni de phase rouge, comme pour la refonte : le dev implémente et vérifie lui-même chaque CA dans le navigateur ; la review se fait contre la spec (validée par Romain)
- 2026-10-05 — Spec validée, DoR atteinte (validée par Romain)
- 2026-10-05 — Décision 1 = A : prop `subtitles: { src, srcLang, label, default? }[]` (validée par Romain)
- 2026-10-05 — Décision 2 = A : rendu maison dans le conteneur, rendu système seulement en plein écran natif iPhone (validée par Romain)
- 2026-10-05 — Décision 3 = A : les sous-titres remontent au-dessus du scrubber, pas du dégradé ; CA17 précisé (validée par Romain)
- 2026-10-05 — Décision 4 = A : `.vtt` de même origine que la page, documenté ; `crossOrigin` reporté en phase 7 (validée par Romain)
- 2026-10-05 — Décision 5 = A : déclencheurs de menu en `icon` et `@max-[30rem]:gap-0` ; B (`size-8` sous le seuil) tranché après mesure au banc radix (validée par Romain)
- 2026-10-05 — Décision 6 = A : bouton CC actif marqué d'une barre `bg-primary` sous l'icône (validée par Romain)
- 2026-10-05 — Décision 7 = B : la première liste non vide compte comme le montage pour `default` ; CA3 précisé (validée par Romain)
- 2026-10-05 — Décision 8 = A : taille du texte proportionnelle, `clamp(0.875rem, 2.5cqw, 2.5rem)` (validée par Romain)
- 2026-10-05 — Décision 9 = A : en plein écran, texte en bas de l'écran, bande noire comprise ; CA16 précisé (validée par Romain)
- 2026-10-05 — Décision 10 = A : exemple `subtitles` dans la chaîne `docs` de `registry.json` ; CA24 précisé (validée par Romain)
