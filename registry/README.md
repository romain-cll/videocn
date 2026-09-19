# `registry/` — les sources distribuées

Tout ce qui vit ici part chez les utilisateurs, **en clair**. `shadcn build` inline le contenu
de chaque fichier dans `public/r/<item>.json`. Il n'y a pas de bundle, pas de minification :
ce dossier est publié, que le dépôt GitHub soit public ou non.

Le reste du dépôt (`src/`) est le site : il n'est jamais distribué.

## Les cinq règles

**1. Aucun import de framework.** Ni `next/*`, ni `@tanstack/*`, ni `react-router`. Les fichiers
d'ici atterrissent dans des projets Vite, Next, Astro, React Router. Seuls `react`, les primitives
shadcn et les dépendances déclarées dans `registry.json` sont autorisés.

**2. `"use client"` en première ligne de tout fichier interactif.** Sans effet en Vite, obligatoire
en Next App Router. C'est le seul moyen de servir les deux.

**3. Agnostique de la primitive sous-jacente.** `registryDependencies: ["@shadcn/button"]` résout
vers la primitive *du consommateur*, pas la nôtre. Un projet en `radix` reçoit un `Button` basé sur
`Slot` ; un projet en `base` reçoit un `Button` Base UI. Les deux n'ont pas la même API :

| | `radix` | `base` |
| --- | --- | --- |
| déléguer le rendu | `asChild` | `render` |
| `Slider`, `ToggleGroup`, `Accordion` | API Radix | API Base UI |

Vérifié en conditions réelles : un item construit ici (base/nova) s'installe sans erreur dans un
projet radix/vega, mais seules les props communes survivent. Donc : **ne jamais utiliser `asChild`
ni `render` dans un item du registry**, et préférer la composition explicite. Quand une primitive
diverge trop, l'encapsuler derrière notre propre composant plutôt que d'exposer son API.

**4. Uniquement des tokens sémantiques.** `bg-background`, `text-muted-foreground`, `border-border`.
Jamais `bg-zinc-900` ni de surcharge `dark:` manuelle. C'est ce qui fait que le lecteur prend le
thème de l'utilisateur au lieu d'imposer le nôtre. Les tokens propres au lecteur passent par
`cssVars` dans `registry.json` — ils sont injectés dans le `globals.css` du consommateur.

**5. Un item = une responsabilité.** Le socle doit être utilisable sans les extras, et chaque extra
installable seul. L'état vit dans un contexte ; les sous-composants le lisent et ne font que du
rendu.

## Ajouter un item

1. Créer `registry/videocn/<item>/`.
2. Déclarer l'entrée dans `registry.json` à la racine (`name`, `type`, `files`, `registryDependencies`,
   `dependencies`, `cssVars`).
3. `pnpm registry:build` → écrit `public/r/<item>.json`.
4. Vérifier le rendu : `pnpm dev`, puis importer depuis `@/registry/videocn/<item>` dans le site.

## Vérifier une installation réelle

Le seul test qui compte est l'installation dans un projet tiers aux alias différents :

```bash
pnpm registry:serve                     # build + sert public/ sur :4000

# dans un projet de test, components.json :
#   "registries": { "@videocn": "http://localhost:4000/r/{name}.json" }
npx shadcn@latest add @videocn/<item> --dry-run
```

Contrôler que les imports ont bien été réécrits vers les alias du projet cible.
