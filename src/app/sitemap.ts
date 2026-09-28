import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site-config";

/** Les trois pages du site. Le registry (`/r/*.json`) n'y figure pas : ce n'est pas du contenu à indexer. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/docs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/playground`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
