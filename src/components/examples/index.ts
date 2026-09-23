import type { ComponentType } from "react";

import { DocsExample } from "@/components/examples/docs-example";
import { SocialExample } from "@/components/examples/social-example";
import { VideoExample } from "@/components/examples/video-example";
import { EXAMPLE_VIDEOS, type ExampleVideo } from "@/components/examples/videos";

/**
 * Les exemples : le lecteur dans une vraie page, entouré de squelettes.
 *
 * Chaque composant sert deux fois — dans une fenêtre du carrousel de la
 * landing, et en page complète sous `/examples/<slug>`. Il s'adapte donc à son
 * conteneur (`@container`), jamais au viewport, et passe par `ExamplePlayer`
 * pour que seule la fenêtre du centre charge sa vidéo.
 */
export interface Example {
  slug: "video" | "docs" | "social";
  /** L'intitulé de l'onglet et le titre de la page. */
  label: string;
  /** La vidéo de l'exemple : son poster colore le halo de la landing. */
  video: ExampleVideo;
  Component: ComponentType;
}

export const EXAMPLES: readonly Example[] = [
  { slug: "video", label: "Vidéo", video: EXAMPLE_VIDEOS.sintel, Component: VideoExample },
  {
    slug: "docs",
    label: "Documentation",
    video: EXAMPLE_VIDEOS.tearsOfSteel,
    Component: DocsExample,
  },
  {
    slug: "social",
    label: "Réseau social",
    video: EXAMPLE_VIDEOS.bigBuckBunny,
    Component: SocialExample,
  },
];

export function findExample(slug: string): Example | undefined {
  return EXAMPLES.find((example) => example.slug === slug);
}
