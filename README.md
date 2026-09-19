# videoCn

Un lecteur vidéo complet, construit sur la balise `<video>` native et les composants shadcn/ui,
distribué comme registry shadcn. Il hérite du thème du projet qui l'installe.

Ce dépôt contient **le lecteur et son site**. Le SaaS d'hébergement vidéo (transcodage, sprites de
miniatures, sous-titres IA) vit dans un dépôt séparé et privé : le lecteur ne le connaît pas et ne
doit jamais le connaître. Il consomme des formats standard du web — WebVTT, `<track>`, HLS — que
l'utilisateur produit lui-même ou délègue.

## Structure

```
registry.json          le manifeste : l'item `player` et la liste de ses fichiers
registry/videocn/      les sources distribuées, à plat : miroir de ce que reçoit l'utilisateur
                       dans <ui>/video-player/ → lire registry/README.md avant d'y toucher
src/                   le site (Next.js) : landing, docs, démos — jamais distribué
public/r/              sortie de `shadcn build`, régénérée, non versionnée
```

## Commandes

```bash
pnpm dev               # le site en local
pnpm registry:build    # registry.json → public/r/*.json
pnpm registry:serve    # build + sert public/ sur :4000, pour tester une install
pnpm build             # registry:build puis next build
pnpm typecheck         # nécessite un `next build` préalable (types générés)
```

## Point de vigilance

L'URL du registry est un contrat public. Dès qu'elle figure dans le `components.json` de quelqu'un,
elle ne peut plus changer sans casser son projet. Elle est définie à un seul endroit,
`src/lib/site-config.ts`, et vaut `https://videocn.dev/r/{name}.json`.

## Consommer le registry

```json
{
  "registries": {
    "@videocn": "https://videocn.dev/r/{name}.json"
  }
}
```

```bash
pnpm dlx shadcn@latest add @videocn/player
```

Un seul item est publié. Cette commande installe le lecteur entier — tous les fichiers
nécessaires, groupés dans `<ui>/video-player/` — et les primitives shadcn manquantes du
projet hôte. Aucun contrôle n'est distribué séparément.
