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
non par des enfants, leur fin se déduit, ils ne s'affichent pas en direct, le chapitre survolé
s'épaissit, et la heatmap est mise en réserve. Voir **Chapitres** et **Highlights**.

Amendé le 22 septembre 2026, pendant la phase 3 : la keymap se précise (focus au clic, chiffres de
tout clavier, règle du muet partagée avec le curseur, prop pour la couper), et la barre disparaît
dès que la souris quitte le lecteur. Voir **Raccourcis clavier** et **Contrôles**.

Amendé le 23 septembre 2026, côté site seulement : la landing présente le lecteur dans trois pages
d'exemple (plateforme vidéo, documentation, réseau social), aussi servies sous `/examples/<slug>`.
Tout y est squelette sauf le lecteur. Le lecteur lui-même ne change pas.

Amendé le 27 septembre 2026, côté site seulement : les trois pages d'exemple et leur carrousel sont
retirés, `/examples/<slug>` avec. Le hero montre un seul `<VideoCn>` que le visiteur re-thématise
sur place — palette en onglets, `--radius` à côté, le CSS correspondant à la demande. C'est la
preuve la plus directe que le lecteur lit les tokens de l'hôte, et elle rendait redondante la
section de thème qui suivait.

Amendé le 5 octobre 2026, refonte de la barre de contrôles : le volume se replie derrière son icône
et se déplie au survol, la vitesse et la qualité quittent la barre pour un menu de réglages à deux
niveaux. Le bouton de qualité grisé devient une ligne grisée de ce menu. Voir **Contrôles** et
**Moteur vidéo**.

Amendé le 5 octobre 2026, pendant la phase 6 : les sous-titres entrent par une prop racine, avec
un bouton CC dans la barre, une ligne « Subtitles » en tête du menu de réglages et le raccourci
`c`. Leur taille et leur position sont reportées à la feature suivante, et les chapitres chargés
depuis un fichier WebVTT deviennent une feature séparée. Voir **Contrôles**, **Raccourcis clavier**,
**Chapitres** et **Sous-titres**.

Amendé le 5 octobre 2026, pendant la phase 6 : un lecteur étroit — moins de 30rem de contenu dans la
barre, soit environ 506 px de large — a sa propre barre. Chapitres, sous-titres et Picture-in-Picture
la quittent pour le menu de réglages, qui gagne les lignes « Chapters » et Picture-in-Picture. La
décision se prend sur la largeur du lecteur, pas sur le type d'appareil. Voir **Contrôles** et
**Raccourcis clavier**.

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
natif expose une liste de qualités vide : la ligne « Quality » du menu de réglages reste affichée,
grisée et non activable, comme sur YouTube. Une ligne qui disparaît déroute plus qu'une ligne
grisée.

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
| Volume + bascule muet : l'icône seule, le curseur se déplie à sa droite au survol ou au focus | maison — voir note — plus `Button` |
| Horodatage `0:42 / 9:56` | aucune — du texte |
| Sous-titres : un bouton CC, actif ou coupé — il disparaît sans piste, et dans un lecteur étroit | `Button` |
| Réglages : un bouton à roue dentée, un popup à deux niveaux — sous-titres, vitesse de lecture (0,5× → 2×) et qualité, et, dans un lecteur étroit, chapitres et Picture-in-Picture | maison — voir note sur les menus |
| Pastille « Live » | `Button` — seulement sur un flux en direct |
| Plein écran | `Button` |
| Picture-in-Picture — dans un lecteur étroit, une ligne du menu de réglages | `Button` |

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
du `DropdownMenu` pour hériter du thème de l'hôte. Ça vaut pour les réglages (sous-titres, vitesse
et qualité) et les chapitres. Le menu de réglages est à deux niveaux : la racine liste les lignes
avec leur valeur courante (`Subtitles English`, `Speed 1×`, `Quality Auto (720p)`), chacune ouvre
sa liste de choix, et choisir applique et ferme. Au-dessus du seuil, la ligne
« Subtitles » vient en tête et n'existe que si la vidéo a des pistes ; son popup propose « Off »
puis une entrée par piste, dans l'ordre de la prop. Le bouton de réglages reste dans la barre tant
qu'au moins une ligne y est : avec `playbackRate` et `quality` coupés, il ne porte plus que
« Subtitles », et disparaît sans piste. Au-dessus du seuil, les chapitres et les sous-titres gardent
chacun un bouton à part dans la barre ; en dessous, ils entrent dans ce menu, et le bouton de
réglages disparaît quand plus aucune ligne n'y reste (voir le lecteur étroit plus bas). Les
flèches `←`/`→` n'atteignent jamais la keymap tant qu'un menu a le focus, et la hauteur d'un popup
est bornée à la place qui reste dans le lecteur.

Avec le curseur, ce sont les deux seuls composants qu'on écrit nous-mêmes — et à chaque fois
pour la même raison : la primitive ne laisse pas atteindre ce dont on a besoin.

Le volume est un curseur replié : seule l'icône du son est visible, et le curseur se déplie à sa
droite au survol de l'icône, au focus clavier ou pendant un glissement, par une transition de
largeur en CSS. Sur un appareil sans survol, il n'est jamais affiché et toucher l'icône bascule le
muet. Dans un lecteur étroit (moins d'environ 506 px), l'horodatage s'efface le temps que le curseur
est déplié, faute de place pour les deux ; il reste lu par les lecteurs d'écran.

La liste des vitesses est réglable par prop, comme tout le reste : `<VideoCn>` s'installe et
fonctionne, on ne renvoie jamais l'utilisateur éditer le code qu'il a reçu.

Le sélecteur de qualité suit trois règles. **Une entrée par hauteur d'image**, la meilleure
qualité de cette hauteur ; une même hauteur au-delà de trente images par seconde fait une entrée
à part, écrite `1080p60`. **En automatique, le menu dit ce qui est réellement joué** — « Auto
(720p) » —, parce que c'est la seule façon de savoir ce qu'on regarde sans quitter l'automatique ;
la racine du menu de réglages l'affiche aussi sur sa ligne « Quality ». **Un choix
s'applique tout de suite**, quitte à vider ce qui est déjà chargé : on veut voir l'effet du clic,
comme sur YouTube.

Le direct a deux conséquences visibles. Le scrubber travaille sur la **fenêtre encore diffusée**
et non sur une durée ; il reste inerte tant que cette fenêtre est trop courte pour qu'on y
cherche. L'horodatage affiche le **retard sur le bord** (`−0:42`), et la pastille « Live » ramène
au bord d'un clic — pleine quand on y est, éteinte quand on est en arrière.

Au-dessus du seuil, le bouton CC se place entre les chapitres et les réglages. Son nom reste « Subtitles » et son état
passe par `aria-pressed` ; actif, une barre `bg-primary` se pose sous l'icône. Il disparaît, comme
le menu des chapitres, quand la vidéo n'a pas de piste.

**Le lecteur étroit** — moins de 30rem de contenu dans la barre, le seuil de l'horodatage, soit
environ 506 px de large — a sa barre : lecture, pastille « Live » sur un direct, son, horodatage,
réglages, plein écran. Les boutons des chapitres, CC et Picture-in-Picture n'y sont pas rendus :
ni visibles, ni dans la tabulation, ni exposés aux lecteurs d'écran. Ils passent dans le menu de
réglages, dont les lignes sont, dans l'ordre, « Chapters », « Subtitles », « Speed », « Quality »,
puis Picture-in-Picture. Chaque ligne suit la règle d'affichage du contrôle qu'elle remplace :
« Chapters » seulement si la vidéo a des chapitres (donc jamais en direct), « Subtitles »
seulement si elle a des pistes, la ligne Picture-in-Picture grisée quand le navigateur ne le permet
pas. Chaque clé de `controls` à `false` (`chapters`, `subtitles`, `playbackRate`, `quality`,
`pictureInPicture`) retire sa ligne, et le bouton de réglages disparaît quand il n'en reste aucune.
« Chapters » affiche le titre du chapitre en cours et ouvre la liste des chapitres, comme le menu
de la barre large ; la ligne Picture-in-Picture porte le libellé du bouton qu'elle remplace, entre
ou sort du mode, et ferme le popup. La forme se décide sur la **largeur du lecteur**, pas sur le
type d'appareil : un tactile large garde la barre large. Franchir le seuil — redimensionnement,
entrée ou sortie du plein écran — change la forme aussitôt, sans perdre la lecture, la piste, la
vitesse ni la qualité. À 360 px, la barre étroite tient en entier, volume replié comme déplié.

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
| `c` | sous-titres : activer ou couper — seulement s'il y a des pistes |
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
  `f`, `c`) ne se répète pas quand la touche reste enfoncée.
- Chaque raccourci fait apparaître la barre. Pas d'icône d'action au centre de l'image.
- `controls.keyboard: false` coupe les raccourcis, pour un hôte qui a déjà les siens.
- Les boutons lecture, muet, plein écran et sous-titres annoncent leur raccourci
  (`aria-keyshortcuts`) ; dans un lecteur étroit, le bouton CC n'est plus dans la barre, mais `c`
  garde son effet.
- **`c` n'agit que si le lecteur propose les sous-titres** (bouton CC, ou ligne « Subtitles » dans un lecteur étroit) : sans piste, ou avec
  `controls.subtitles: false`, la touche reste à l'hôte.

## Chapitres

Prop **racine** `chapters: { time, label }[]`. Rendu en segments sur le scrubber, plus un menu
listant les titres.

La prop est racine et non une clé de `controls` : ici on fournit **ce qu'il y a à afficher**,
`controls` règle **ce qui s'affiche**. Les deux clés d'affichage existent quand même —
`controls.chapters` coupe le menu, `controls.scrubber: { chapters: false }` garde la barre d'un
seul tenant sans rien retirer au menu.

**`<VideoCn>` n'accepte toujours pas de `children`.** Le `<track kind="chapters">` du web standard
n'y change rien : le jour où les chapitres arriveront d'un fichier WebVTT — feature séparée, juste
après les sous-titres, dont la mécanique `<track>` sert de base —, c'est le lecteur qui rendra la
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

**Le chapitre survolé s'épaissit** — quatre pixels au repos, six au survol de la barre, dix pour
celui qu'on vise. L'écart est volontairement franc : à deux pixels près, on ne voyait pas lequel
on visait. Chaque chapitre est une zone de la hauteur du curseur, invisible : une barre de
quatre pixels ne se vise pas. Les zones se touchent, l'écart n'étant pris que sur la barre, pour
que l'épaisseur ne retombe pas quand on balaie. Une vidéo sans chapitres garde ses six pixels : un
segment unique ne se distingue pas de lui-même.

Le menu **disparaît** quand la vidéo n'a pas de chapitres, là où le sélecteur de qualité reste
grisé. Les deux règles suivent la donnée : toute vidéo a une qualité, presque aucune n'a de
chapitres, et un bouton mort sur chaque lecteur serait du bruit permanent.

## Highlights — « most replayed »

Prop `heatmap: { time, value }[]`. Overlay en aire au-dessus du scrubber.

**En réserve depuis le 24 septembre 2026.** `docs/roadmap.md` la désigne comme le premier élément
à sauter si ça déborde ; elle n'a pas été faite avec les chapitres. Elle reste au périmètre, à
reprendre avant la v1 si le temps le permet.

## Sous-titres

Support des `<track>` natifs et de l'API `TextTrack`. Bascule on/off, sélection de piste.
**Pas de génération automatique** : l'utilisateur apporte son VTT. Le réglage de la taille et de la
position **n'est pas dans cette feature** : il fait l'objet de la feature suivante (décision du
5 octobre 2026).

Prop **racine** `subtitles: { src, srcLang, label, default? }[]`, les attributs d'un `<track>` sous
leur nom React, comme `chapters` pour les chapitres : on fournit ce qu'il y a à afficher,
`controls` règle ce qui s'affiche. `controls.subtitles: false` retire le bouton CC, la ligne du menu
et le raccourci `c` ; une piste marquée `default` s'affiche quand même, `controls` ne réglant pas le
contenu. `<VideoCn>` n'accepte toujours pas de `children` : le lecteur rend lui-même les `<track>`
depuis la prop.

- **Pas de piste, pas de contrôle.** Sans prop ou avec une liste vide, ni bouton CC, ni ligne
  « Subtitles », et `c` ne fait rien.
- **L'URL est l'identité d'une piste.** Une entrée sans `src` ou sans libellé est écartée, et pour
  une URL répétée la première gagne. Quand la liste change, la piste active reste active si son
  URL y figure encore ; sinon les sous-titres sont coupés.
- **`default`** : seule la première piste marquée compte, appliquée au montage — ou à la première
  arrivée d'une liste non vide, pour qui charge ses pistes de façon asynchrone. Sans piste marquée,
  les sous-titres démarrent coupés.
- **Une seule piste affichée à la fois.** Le bouton CC rallume la dernière piste choisie depuis le
  montage, à défaut la piste marquée par défaut, à défaut la première.
- **Identique sur les deux moteurs.** Les sous-titres contenus dans un manifeste HLS ou DASH ne sont
  jamais proposés : seules les pistes de la prop le sont. Shaka garde sa gestion texte désactivée.
- **Rendu maison.** La piste active est chargée par le navigateur mais ne s'y dessine pas : le
  lecteur affiche les répliques dans son conteneur, donc aussi en plein écran, centrées en bas, chaque
  ligne sur un fond tiré des tokens du thème. Quand la barre est visible, le texte remonte
  au-dessus du scrubber, et redescend quand elle se masque. Taille proportionnelle à la largeur du
  lecteur. Les réglages de position et de style inscrits dans le fichier (`line`, `position`,
  `align`, `::cue`) sont ignorés. Seule exception, le plein écran natif de l'iPhone, où le conteneur
  n'est plus affiché : le système dessine alors la piste lui-même.
- **Même origine.** Les fichiers `.vtt` doivent être servis depuis l'origine de la page : le lecteur
  n'ajoute pas `crossorigin`, qui casserait les vidéos servies sans en-tête CORS. Une prop
  `crossOrigin` est notée pour la phase 7.
- **Hors périmètre ici** : la mémorisation du choix d'une visite à l'autre, le choix selon la
  langue du navigateur, les formats autres que WebVTT, le signalement d'un fichier introuvable.

## Theming

100 % tokens CSS de shadcn hérités du projet hôte. Aucune couleur en dur. Clair et sombre
fonctionnent sans configuration.

**Le rayon suit `--radius`, partout, y compris les pilules.** Pas de `rounded-full` dans le
lecteur : sur une piste de quatre pixels ou une pastille de quatorze, le navigateur écrête le
rayon à la moitié de la dimension, et `var(--radius)` y dessine exactement la même pilule. La
différence n'apparaît qu'au bout de l'échelle — un thème à `--radius: 0` rend un lecteur
entièrement anguleux, cadre, menus, scrubber, barre de volume et pastille compris.

Un point qu'on ne peut pas couvrir, et il faut le savoir : certains styles shadcn — `sera` par
exemple — codent `rounded-none` **en dur dans la source de chaque composant** au lieu de toucher
`--radius`, qui y garde sa valeur par défaut. Aucun token ne permet de le détecter, et un item de
registry ne livre qu'une source. L'utilisateur d'un tel style pose `--radius: 0` et le lecteur
suit ; c'est la seule voie, et elle est sans effet sur le reste de son projet, qui ne lit pas ce
token.

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
