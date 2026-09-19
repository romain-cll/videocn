<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# videoCn

Registry shadcn distribuant un lecteur vidéo. Deux zones aux règles opposées :

- **`registry/`** — code distribué chez les utilisateurs, inliné en clair dans les JSON.
  Les contraintes sont strictes et non négociables : lire `registry/README.md` avant toute
  modification. En résumé : aucun import de framework, `"use client"` partout, pas de `asChild`
  ni de `render` (l'API des primitives diffère selon que le consommateur est en `radix` ou `base`),
  tokens sémantiques uniquement, un fichier = une responsabilité. Un seul item est publié,
  `@videocn/player` : il porte tous les fichiers du lecteur dans son `files[]`. Ajouter un
  contrôle = ajouter un fichier à cet item, jamais créer un nouvel item.
- **`src/`** — le site Next.js. Jamais distribué, aucune de ces contraintes.

Le lecteur ne doit jamais dépendre d'une API videoCn. Il consomme des formats standard du web
(WebVTT storyboard, `<track>` sous-titres et chapitres, HLS). Le SaaS payant fabrique ces fichiers
depuis un dépôt privé distinct ; c'est ce qui garantit que le lecteur reste gratuit et complet.

`pnpm typecheck` échoue tant que `next build` n'a pas généré les types de routes (`LayoutProps`,
`PageProps`). Lancer `pnpm build` d'abord.

Le périmètre du MVP est figé dans `docs/mvp.md`. S'y tenir : ne pas ajouter de feature qui
n'y figure pas sans le demander.

Après toute modification, lancer `pnpm lint` et corriger les erreurs. `@shadcn/lint` y applique
cinq règles en erreur : `no-raw-colors`, `no-arbitrary-values`, `no-inline-styles`,
`no-unknown-classes`, `require-static-classes`. `no-restyle` n'est pas activée.

Dans `src/components/ui/**` et `registry/**`, `no-arbitrary-values` et `require-static-classes`
sont désactivées : ces fichiers possèdent leur apparence et ont besoin de valeurs structurelles.
`no-raw-colors` y reste active — c'est elle qui garantit que le player hérite du thème de l'hôte.
