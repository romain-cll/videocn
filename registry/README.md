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

**5. Un fichier = une responsabilité, un seul item publié.** Les deux granularités sont
distinctes. Côté distribution il n'y a qu'un item, `@videocn/player` : l'utilisateur tape
`pnpm dlx shadcn@latest add @videocn/player` et reçoit le lecteur entier. Côté fichiers, le
découpage reste fin — un fichier par contrôle, pour la lisibilité une fois le code chez lui.
Un item shadcn porte un tableau `files[]` où chaque entrée a son propre `type` et son propre
`target`, donc un item unique livre autant de fichiers qu'on veut, groupés dans
`@ui/video-player/`. Aucun contrôle n'est publié seul : un scrubber isolé n'est pas un produit.
L'état vit dans un contexte ; les sous-composants le lisent et ne font que du rendu.

## Ajouter un fichier au lecteur

1. Créer le fichier à plat dans `registry/videocn/`. Pas de sous-dossier : ce dossier est le
   miroir exact de ce que l'utilisateur reçoit dans `<ui>/video-player/`.
2. L'ajouter au tableau `files[]` de l'item `player` dans `registry.json` à la racine, avec son
   `type` et son `target` (`@ui/video-player/<fichier>`). Compléter `registryDependencies`,
   `dependencies` et `cssVars` de l'item si le fichier en introduit.
3. `pnpm registry:build` → écrit `public/r/player.json`.
4. Vérifier le rendu : `pnpm dev`, puis importer depuis `@/registry/videocn/<fichier>` dans le
   site.

Créer un nouvel item (un sous-dossier `registry/videocn/<item>/` + une entrée dans `items[]`) est
réservé aux couches réellement optionnelles, comme le storyboard — jamais à un
contrôle du lecteur.

**Entre nos fichiers, importer en relatif** (`./use-player`), jamais via un alias `@/`. Un chemin
relatif traverse `shadcn build` sans réécriture, et comme tous nos fichiers atterrissent dans le
même dossier chez le consommateur, il résout correctement chez lui. Les alias `@/registry/...` sont
réécrits par shadcn selon sa propre convention de monorepo (`@/registry/<style>/ui/...` → alias `ui`
du consommateur) : notre arborescence n'y correspond pas, ne pas s'y fier.

## Vérifier une installation réelle

Le seul test qui compte est l'installation dans un projet tiers aux alias différents :

```bash
pnpm registry:serve                     # build + sert public/ sur :4000

# dans un projet de test, components.json :
#   "registries": { "@videocn": "http://localhost:4000/r/{name}.json" }
npx shadcn@latest add @videocn/player --dry-run
```

Contrôler que les imports ont bien été réécrits vers les alias du projet cible.

**Puis lancer le projet de test dans un navigateur.** `tsc` et `next build` passent au vert sur un
contrôle devenu invisible : la première passe croisée a livré un curseur de volume à zéro pixel
dans un projet `base`, sans la moindre erreur nulle part. Le seul juge est le rendu.

Une divergence de plus à garder en tête, qui ne passe ni par les props ni par les imports :
**les classes internes des primitives diffèrent d'un style à l'autre**. Le `Slider` — que le lecteur
n'utilise plus depuis, pour d'autres raisons — contraint sa
racine en `w-full` côté radix et en `data-horizontal:w-full` côté base ; `tailwind-merge` ne voit
pas la seconde comme concurrente d'un `w-20` qu'on lui passerait, les deux survivent, la variante
l'emporte et le contrôle s'effondre. D'où la règle : **ne pas imposer de dimension par une
utilitaire sur une primitive, l'envelopper dans un conteneur dimensionné** et lui laisser ses
100 %.

## Projets RTL

Le CLI shadcn réécrit les classes directionnelles pour les projets RTL : `ml-*` devient `ms-*`,
`left-*` devient `start-*`, et ainsi de suite. Avec le `dir="rtl"` de la page, c'est ce qui met
la barre en miroir sans rien lui demander — le bouton lecture passe à droite, le plein écran à
gauche. C'est voulu.

**Le curseur fait exception : il est figé en `dir="ltr"`**, parce qu'une timeline ne se met pas
en miroir. Et `dir="ltr"` ne le protège pas de tout ce que le CLI réécrit, d'où trois familles de
classes proscrites dans ses fichiers :

- `translate-x-*` gagne une variante `rtl:` inversée. Or `rtl:` vise tout descendant d'un
  `[dir="rtl"]` : elle s'applique sous notre `dir="ltr"`, et la poignée part du mauvais côté.
- `origin-*` : `origin-left` devient `origin-start`, qui n'existe pas en Tailwind. La classe
  disparaît sans erreur.
- `scale-x-*` : un remplissage dessiné à l'échelle a besoin d'une `origin-left`, et retombe dans
  le cas précédent.

La position passe donc par `left` et `width`. Le CLI réécrit `left-*` en `start-*`, une propriété
logique : c'est là que `dir="ltr"` sert, elle se résout à gauche sous lui.

L'horodatage est figé en `dir="ltr"` pour la même raison : ce sont des chiffres, et sans ça
l'algorithme bidi d'une page RTL affiche `9:56 / 0:00`.

**Une chaîne de classes s'écrit sur une seule ligne.** La conversion RTL du CLI ajoute un `\` en fin
de chaque ligne d'un `className` multiligne, et ce caractère reste littéral dans un attribut JSX : les
classes touchées meurent. Constaté en conditions réelles sur la barre, qui perdait son voile et la
couleur de son texte dans un projet RTL — avec `tsc` et `next build` au vert, comme toujours.
