/**
 * Ce que le lecteur coûte au bundle, mesuré et non estimé — la question
 * « est-ce que ça alourdit mon app ? » sera posée, la réponse doit tenir.
 *
 * Mesuré le 27 septembre 2026, en gzip -9 :
 * - `core` : `registry/videocn/video-cn.tsx` bundlé et minifié par esbuild,
 *   React, `lucide-react`, `cn`, `shaka-player` et le `Button` shadcn laissés
 *   dehors — l'hôte les a déjà, ou les partage avec le reste de son app.
 * - `shaka` : le chunk que `next build` isole pour `await import("shaka-player")`.
 *
 * À remesurer quand le lecteur gagne une feature (sous-titres, miniatures).
 */
export const bundleSize = {
  core: { minified: "41 kB", gzip: "14 kB" },
  shaka: { minified: "810 kB", gzip: "262 kB" },
} as const;
