import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

/**
 * Les métadonnées d'une page : titre, description, URL canonique, et les
 * champs Open Graph qui vont avec.
 *
 * Un `openGraph` déclaré par une page remplace celui du layout au lieu de s'y
 * fusionner : sans ce helper, chaque page devrait répéter `siteName`, `type`
 * et `locale`, ou partager le titre du site. L'image vient à part, du fichier
 * `opengraph-image.tsx` de chaque route.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  /** `undefined` pour l'accueil, qui garde le titre par défaut du layout. */
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const ogTitle = title ? `${title} — ${siteConfig.name}` : `${siteConfig.name} — a video player for shadcn/ui`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

export const PAGE_DESCRIPTIONS = {
  home: "A complete video player for shadcn/ui. One command, one tag: it reads your theme tokens, plays MP4, HLS, DASH and live streams, and is configured through props.",
  docs: "Install videoCn with the shadcn CLI, drop in <VideoCn />, and tune it through props: controls, chapters, streaming, theming.",
  demo: "Set the props of the videoCn player, watch it change, and copy the JSX.",
} as const;
