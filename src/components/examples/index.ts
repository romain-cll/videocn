import type { ComponentType } from "react";

import { DocsExample } from "@/components/examples/docs-example";
import { SocialExample } from "@/components/examples/social-example";
import { VideoExample } from "@/components/examples/video-example";

/**
 * Les exemples : le lecteur dans une vraie page, entouré de squelettes.
 *
 * Chaque composant sert deux fois — dans un onglet de la landing, large
 * d'environ 1000 px, et en page complète sous `/examples/<slug>`. Il s'adapte
 * donc à son conteneur (`@container`), jamais au viewport.
 */
export interface Example {
  slug: "video" | "docs" | "social";
  /** L'intitulé de l'onglet et le titre de la page. */
  label: string;
  Component: ComponentType;
}

export const EXAMPLES: readonly Example[] = [
  { slug: "video", label: "Vidéo", Component: VideoExample },
  { slug: "docs", label: "Documentation", Component: DocsExample },
  { slug: "social", label: "Réseau social", Component: SocialExample },
];

export function findExample(slug: string): Example | undefined {
  return EXAMPLES.find((example) => example.slug === slug);
}
