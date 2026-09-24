# videoCn — périmètre du MVP

Arrêté le 19 septembre 2026. C'est la référence : tout ce qui n'est pas dans cette liste
attend, tout ce qui y est doit exister avant de parler de v1.

Amendé le 20 septembre 2026 : ajout d'un moteur de streaming optionnel, voir **Moteur vidéo**.
Les qualités et l'adaptatif, jusque-là hors périmètre, y entrent.

Amendé le 21 septembre 2026, pendant la phase 1 : les menus sont écrits à la main et non tirés du
`DropdownMenu` shadcn, la liste des vitesses devient réglable, et le clic sur l'image entre au
périmètre. Voir **Contrôles**.

Amendé le 21 septembre 2026, après la phase 1 : le curseur de volume abandonne lui aussi le
`Slider` shadcn et rejoint le curseur maison du scrubber. Voir la note sur les curseurs.

Amendé le 21 septembre 2026, pendant la phase 2 : l'horodatage entre au tableau des contrôles,
le glissement du scrubber prend le modèle de YouTube, un curseur focalisé garde ses flèches, et
`buffered` se réduit à la plage qui contient la tête de lecture. Voir **Contrôles**,
**Raccourcis clavier** et **Lecture**.

Amendé le 24 septembre 2026, pendant la phase 4 : le direct entre au périmètre avec sa fenêtre
de retour en arrière, et les règles du sélecteur de qualité sont fixées. Voir **Moteur vidéo** et
**Contrôles**.

Amendé le 24 septembre 2026, pendant la phase 5 : les chapitres arrivent par une prop racine et
non par des enfants, leur fin se déduit, ils ne s'affichent pas en direct, et la heatmap est mise
en réserve. Voir **Chapitres** et **Highlights**.

Amendé le 22 septembre 2026, pendant la phase 3 : la keymap se précise (focus au clic, chiffres de
tout clavier, règle du muet partagée avec le curseur, prop pour la couper), et la barre disparaît
dès que la souris quitte le lecteur. Voir **Raccourcis clavier** et **Contrôles**.

Amendé le 23 septembre 2026, côté site seulement : la landing présente le lecteur dans trois pages
d'exemple (plateforme vidéo, documentation, réseau social), aussi servies sous `/examples/<slug>`.
Tout y est squelette sauf le lecteur. Le lecteur lui-même ne change pas.

## Lecture

Un wrapper autour de `<video>` natif et un hook `usePlayer` exposant l'état :
`play`/`pause`, `currentTime`, `duration`, `buffered`, `volume`, `playbackRate`,
état plein écran, état Picture-in-Picture.

De `buffered`, seule la plage chargée qui contient la tête de lecture est exposée, par ses deux
bornes. C'est ce que le scrubber dessine, et le début compte : après un saut à 7:00, la plage
part de 7:00, et la dessiner depuis zéro mentirait. Les plages d'avant le saut ne disent rien de
ce qui va être lu.

## Moteur vidéo

Le lecteur ne parle jamais directement à un moteur de streaming. Une interface moteur
— `attach`, `load`, `destroy`, plus les capacités exposées — est implémentée deux fois :

- **Natif, par défaut.** `<video src>` seul. Il sert les MP4 et WebM progressifs, c'est-à-dire
  le cas le plus fréquent : aucun JavaScript de streaming, rien d'ajouté au bundle.
- **Shaka, à la demande.** Chargé par `await import("shaka-player")` uniquement quand la source
  est HLS ou DASH. Il apporte l'adaptatif, le live et le DVR, les pistes multiples, et surtout
  l'absorption des divergences MSE entre navigateurs.

Le choix du moteur est une **capacité détectée à l'exécution**, jamais une détection de marque
ou de navigateur. Safari macOS et iPadOS ont MSE, l'iPhone a Managed Media Source depuis
iOS 17.1 : ils passent par Shaka comme les autres. Là où ni l'un ni l'autre n'existe, Shaka
retombe de lui-même sur la lecture `src=` native — c'est son rôle de repli, pas une raison de
lui faire passer les fichiers progressifs.

Tout cela est invisible pour qui consomme le composant : il monte `<VideoCn src=… />` et rien
de plus, la source est auto-détectée. Une prop d'échappement `type="native" | "hls" | "dash"`
couvre les URL signées, sans extension ou trompeuses.

L'API publique ne varie pas d'un moteur à l'autre ; seules les **capacités** varient. Le moteur
natif expose une liste de qualités vide : le bouton reste affiché et passe `disabled`, comme sur
YouTube. Un contrôle qui disparaît déroute plus qu'un contrôle grisé.

Deux conséquences à tenir :

- **Les sous-titres restent gérés par `<track>` et l'API `TextTrack` dans les deux cas.** La
  gestion texte de Shaka est désactivée, sans quoi les pistes apparaîtraient en double sur HLS
  et pas sur MP4 — l'inverse exact de la transparence visée.
- **Le chargement du moteur est asynchrone.** `duration` et les pistes arrivent après le
  montage. L'état expose un « moteur en cours de chargement » distinct du buffering, et le
  poster couvre l'intervalle.

## Contrôles

Chaque contrôle est un fichier à part, construit sur les primitives shadcn. Un fichier par
responsabilité, pour la lisibilité une fois le code chez l'utilisateur — mais un seul item
publié, voir Distribution.

| Contrôle | Primitive |
| --- | --- |
| Play / pause | `Button` |
| Scrubber avec aperçu du buffer, glissement comme YouTube : pause au premier déplacement, recherche continue limitée, reprise au relâchement | maison — voir note |
| Volume + bascule muet | maison — voir note — plus `Button` |
| Horodatage `0:42 / 9:56` | aucune — du texte |
| Vitesse de lecture, 0,5× → 2× | maison — voir note sur les menus |
| Qualité | maison — `disabled` si le moteur n'en expose aucune |
| Pastille « Live » | `Button` — seulement sur un flux en direct |
| Plein écran | `Button` |
| Picture-in-Picture | `Button` |

Note sur les curseurs : le `Slider` shadcn n'expose pas sa piste, ce qui rend impossibles le
buffer, les chapitres segmentés et le survol. Et il ne laisse pas nommer l'élément qui porte le
rôle de curseur — vérifié dans les deux bases : ni un lecteur d'écran ni le contrôle vocal n'ont
alors de prise sur le volume. On écrit donc **un seul curseur maison**, et il sert les deux : le
scrubber et le volume. C'est une contrainte fonctionnelle et d'accessibilité, pas un
contournement de compatibilité.

Note sur le glissement : un simple clic cherche sans interrompre la lecture ; la vidéo ne se met
en pause qu'au premier vrai déplacement, pour que le bouton lecture ne clignote pas au geste le
plus fréquent. Pendant le glissement, elle cherche en continu, mais pas plus d'une fois toutes
les 150 ms environ : à la cadence du pointeur, aucune recherche n'aboutirait et l'image resterait
figée. Au relâchement, la lecture ne reprend que si elle tournait avant — et pas si l'on a lâché
au bout de la vidéo, où elle repartirait de zéro.

Note sur les menus : le `DropdownMenu` shadcn porte son contenu sur `document.body`, et ce qui
est porté là n'est plus rendu dès qu'un autre élément est en plein écran — or c'est le conteneur
du lecteur qui passe en plein écran, pour que la barre y survive. Les briques pour recomposer le
menu ne sont pas exportées, et leur structure interne diverge entre `radix` et `base`. Nos menus
sont donc écrits à la main, rendus **dans** le conteneur, et reprennent les classes et les tokens
du `DropdownMenu` pour hériter du thème de l'hôte. Ça vaut pour la vitesse, la qualité, les
chapitres et les sous-titres. Avec le curseur, ce sont les deux seuls composants qu'on écrit
nous-mêmes — et à chaque fois pour la même raison : la primitive ne laisse pas atteindre ce dont
on a besoin.

La liste des vitesses est réglable par prop, comme tout le reste : `<VideoCn>` s'installe et
fonctionne, on ne renvoie jamais l'utilisateur éditer le code qu'il a reçu.

Le sélecteur de qualité suit trois règles. **Une entrée par hauteur d'image**, la meilleure
qualité de cette hauteur ; une même hauteur au-delà de trente images par seconde fait une entrée
à part, écrite `1080p60`. **En automatique, le menu dit ce qui est réellement joué** — « Auto
(720p) » —, parce que c'est la seule façon de savoir ce qu'on regarde sans quitter l'automatique ;
le bouton, lui, affiche « Auto » sans la hauteur, qui changerait sous les yeux. **Un choix
s'applique tout de suite**, quitte à vider ce qui est déjà chargé : on veut voir l'effet du clic,
comme sur YouTube.

Le direct a deux conséquences visibles. Le scrubber travaille sur la **fenêtre encore diffusée**
et non sur une durée ; il reste inerte tant que cette fenêtre est trop courte pour qu'on y
cherche. L'horodatage affiche le **retard sur le bord** (`−0:42`), et la pastille « Live » ramène
au bord d'un clic — pleine quand on y est, éteinte quand on est en arrière.

Deux gestes sur l'image, hors tableau parce qu'ils n'ont pas de bouton : un clic bascule la
lecture, un double-clic bascule le plein écran.

Pendant la lecture, la barre s'efface après quelques secondes d'inactivité, et **tout de suite
quand la souris quitte le lecteur**. En pause, ou tant qu'un menu est ouvert, elle reste.

## Raccourcis clavier

Robustes et cross-browser.

| Touche | Action |
| --- | --- |
| `Espace` / `k` | play-pause |
| `←` / `→` | reculer / avancer de 5 s |
| `↑` / `↓` | volume |
| `f` | plein écran, avec gestion des préfixes navigateurs |
| `m` | muet |
| `0`–`9` | saut à X0 % de la vidéo |

Désactivation automatique quand le focus est dans un `input`, un `textarea` ou un élément
`contenteditable` de la page hôte.

Un curseur focalisé possède ses flèches : `↑` sur le scrubber cherche, il ne monte pas le
volume. C'est le motif APG du slider, et c'est ce qu'annonce le lecteur d'écran — une flèche qui
agirait sur un autre contrôle que celui qu'il vient de nommer le contredirait. Le tableau
ci-dessus vaut donc partout ailleurs dans le lecteur, pas sur un curseur qui a le focus.

Le lecteur prend le focus au clic sur l'image : sans ça, rien ne serait focalisé et aucune touche
ne lui parviendrait. Il ne s'ajoute pas à l'ordre de tabulation et ne s'entoure d'aucun contour.

- **`↑` depuis le muet rétablit le dernier volume connu, sans l'augmenter** : 65 % coupé redonne
  65 %, et si l'on était descendu à 0, le son revient à 5 %. `↓` en muet ne fait rien. Le curseur
  de volume focalisé suit la même règle.
- **Les chiffres marchent sur tout clavier** : par leur valeur (pavé numérique, QWERTY), sinon par
  leur position sur la rangée du haut — en AZERTY, sans Maj.
- **`Espace` sur un bouton focalisé déclenche ce bouton** ; `k` reste lecture-pause partout.
- Les combinaisons avec Ctrl, Cmd ou Alt restent au navigateur. Une bascule (`Espace`, `k`, `m`,
  `f`) ne se répète pas quand la touche reste enfoncée.
- Chaque raccourci fait apparaître la barre. Pas d'icône d'action au centre de l'image.
- `controls.keyboard: false` coupe les raccourcis, pour un hôte qui a déjà les siens.
- Les boutons lecture, muet et plein écran annoncent leur raccourci (`aria-keyshortcuts`).

## Chapitres

Prop **racine** `chapters: { time, label }[]`. Rendu en segments sur le scrubber, plus un menu
listant les titres.

La prop est racine et non une clé de `controls` : ici on fournit **ce qu'il y a à afficher**,
`controls` règle **ce qui s'affiche**. Les deux clés d'affichage existent quand même —
`controls.chapters` coupe le menu, `controls.scrubber: { chapters: false }` garde la barre d'un
seul tenant sans rien retirer au menu.

**`<VideoCn>` n'accepte toujours pas de `children`.** Le `<track kind="chapters">` du web standard
n'y change rien : le jour où les chapitres arriveront d'un fichier WebVTT — en phase 6, avec les
sous-titres, où la mécanique `<track>` s'écrit de toute façon —, c'est le lecteur qui rendra la
balise depuis une prop. Le composant reste fermé, et les deux formes coexisteront : un tableau en
dur pour la petite vidéo, un fichier pour qui en a un. C'est le fichier qui compte pour le SaaS,
parce qu'il change sans redéploiement de la page hôte.

Trois règles de normalisation, appliquées une fois pour toutes :

- **La fin d'un chapitre est le début du suivant**, et la durée pour le dernier. Rien à écrire de
  plus que ce que l'intégrateur sait déjà.
- **Le premier chapitre commence à zéro**, quoi qu'on nous donne. Un premier chapitre à 0:30
  laisserait la barre nue sur son premier vingtième — un trou que personne ne saurait interpréter.
- **Aucun chapitre en direct.** Sans durée, un chapitre n'a pas de fin, et une fenêtre qui glisse
  ne se découpe pas. Une liste passée à un flux en direct reste donc sans effet.

Le menu **disparaît** quand la vidéo n'a pas de chapitres, là où le sélecteur de qualité reste
grisé. Les deux règles suivent la donnée : toute vidéo a une qualité, presque aucune n'a de
chapitres, et un bouton mort sur chaque lecteur serait du bruit permanent.

## Highlights — « most replayed »

Prop `heatmap: { time, value }[]`. Overlay en aire au-dessus du scrubber.

**En réserve depuis le 24 septembre 2026.** `docs/roadmap.md` la désigne comme le premier élément
à sauter si ça déborde ; elle n'a pas été faite avec les chapitres. Elle reste au périmètre, à
reprendre avant la v1 si le temps le permet.

## Sous-titres

Support des `<track>` natifs et de l'API `TextTrack`. Bascule on/off, sélection de piste,
réglage de la taille et de la position. **Pas de génération automatique** : l'utilisateur
apporte son VTT.

## Theming

100 % tokens CSS de shadcn hérités du projet hôte. Aucune couleur en dur. Clair et sombre
fonctionnent sans configuration.

## Distribution

**Un seul item publié : `@videocn/player`.** L'utilisateur tape une commande et reçoit le
lecteur entier, tous les fichiers nécessaires compris :

```bash
pnpm dlx shadcn@latest add @videocn/player
```

Les fichiers restent découpés un par responsabilité et atterrissent groupés dans
`<ui>/video-player/`. Aucun contrôle n'est publié séparément : un scrubber ou un curseur de
volume seul n'est pas un produit. Le storyboard, couche réellement optionnelle, deviendra un
item distinct le jour où il existera ; il est hors périmètre ici.

`shaka-player` figure dans les `dependencies` de l'item, donc s'installe chez tout le monde.
C'est le prix de la transparence, et il est assumé : un `await import()` visant un paquet absent
casse le **build** du consommateur, pas seulement l'exécution, donc une dépendance optionnelle
discrète n'existe pas. En contrepartie l'import dynamique le maintient **hors du bundle** de qui
ne sert que du MP4. À dire explicitement dans la documentation et sur la landing page : la
question « est-ce que ça alourdit mon app ? » sera posée.

Documentation minimale avec des exemples copiables tels quels.

---

## Hors périmètre, et assumé

- **Miniatures au survol du scrubber.** Absentes de ce MVP alors que c'est la feature la plus
  visible de YouTube et le principal point d'accroche du futur SaaS. Le format cible est le
  storyboard WebVTT (`#xywh=`). À rouvrir juste après le MVP.
- **DRM et contenus protégés (EME).** Shaka sait le faire, on ne l'expose pas ici.
- **Sélection de piste audio.** Shaka la connaît, le MVP ne l'expose pas : un seul sélecteur de
  piste au départ, celui des qualités.
- **Toute feature serveur.** Transcodage, sous-titres IA, analytics : dépôt séparé et privé.
  Le player ne connaît que des formats standard du web et n'appelle aucune API videoCn.
