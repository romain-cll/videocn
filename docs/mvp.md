# videoCn — périmètre du MVP

Arrêté le 19 septembre 2026. C'est la référence : tout ce qui n'est pas dans cette liste
attend, tout ce qui y est doit exister avant de parler de v1.

Amendé le 20 septembre 2026 : ajout d'un moteur de streaming optionnel, voir **Moteur vidéo**.
Les qualités et l'adaptatif, jusque-là hors périmètre, y entrent.

## Lecture

Un wrapper autour de `<video>` natif et un hook `usePlayer` exposant l'état :
`play`/`pause`, `currentTime`, `duration`, `buffered`, `volume`, `playbackRate`,
état plein écran, état Picture-in-Picture.

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
| Scrubber avec aperçu du buffer | maison — voir note |
| Volume + bascule muet | `Slider` + `Button` |
| Vitesse de lecture, 0,5× → 2× | `DropdownMenu` |
| Qualité | `DropdownMenu` — `disabled` si le moteur n'en expose aucune |
| Plein écran | `Button` |
| Picture-in-Picture | `Button` |

Note sur le scrubber : le `Slider` shadcn n'expose pas sa piste, ce qui rend impossibles le
buffer, les chapitres segmentés et le survol. C'est le seul composant qu'on écrit nous-mêmes,
et c'est une contrainte fonctionnelle, pas un contournement de compatibilité. Le volume, lui,
utilise bien le `Slider` shadcn.

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

## Chapitres

Prop `chapters: { time, label }[]`. Rendu en segments sur le scrubber, plus une liste cliquable.

## Highlights — « most replayed »

Prop `heatmap: { time, value }[]`. Overlay en aire au-dessus du scrubber.

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
