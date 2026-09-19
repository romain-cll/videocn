# videoCn — périmètre du MVP

Arrêté le 19 septembre 2026. C'est la référence : tout ce qui n'est pas dans cette liste
attend, tout ce qui y est doit exister avant de parler de v1.

## Lecture

Un wrapper autour de `<video>` natif et un hook `usePlayer` exposant l'état :
`play`/`pause`, `currentTime`, `duration`, `buffered`, `volume`, `playbackRate`,
état plein écran, état Picture-in-Picture.

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
volume seul n'est pas un produit. Les couches réellement optionnelles — adaptateur HLS,
storyboard — deviendront des items distincts le jour où elles existeront ; elles sont hors
périmètre ici.

Documentation minimale avec des exemples copiables tels quels.

---

## Hors périmètre, et assumé

- **Miniatures au survol du scrubber.** Absentes de ce MVP alors que c'est la feature la plus
  visible de YouTube et le principal point d'accroche du futur SaaS. Le format cible est le
  storyboard WebVTT (`#xywh=`). À rouvrir juste après le MVP.
- **Qualités et adaptatif (HLS).** Un adaptateur optionnel, pas un prérequis.
- **Toute feature serveur.** Transcodage, sous-titres IA, analytics : dépôt séparé et privé.
  Le player ne connaît que des formats standard du web et n'appelle aucune API videoCn.
