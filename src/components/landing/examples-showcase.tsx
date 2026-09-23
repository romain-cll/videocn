"use client";

/**
 * La vitrine de la landing : les exemples dans une fenêtre de navigateur, un
 * onglet par exemple.
 *
 * Un onglet inactif est démonté (comportement par défaut de `Tabs`) : une seule
 * vidéo se charge à la fois, et quitter l'exemple social arrête sa lecture
 * automatique.
 */

import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EXAMPLES, type Example } from "@/components/examples";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/lib/site-config";

export function ExamplesShowcase() {
  const [slug, setSlug] = useState<Example["slug"]>(EXAMPLES[0].slug);
  const host = new URL(siteConfig.url).host;

  return (
    <Tabs
      value={slug}
      onValueChange={(value) => setSlug(value as Example["slug"])}
      className="items-center gap-6"
    >
      <TabsList>
        {EXAMPLES.map(({ slug, label }) => (
          <TabsTrigger key={slug} value={slug} className="px-3">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="bg-background w-full overflow-hidden rounded-xl border shadow-sm">
        <div className="bg-muted/40 flex h-11 items-center gap-4 border-b px-4">
          <div aria-hidden className="flex gap-1.5">
            <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
            <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
            <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
          </div>
          <div className="bg-background text-muted-foreground mx-auto h-7 w-full max-w-sm min-w-0 truncate text-left leading-7 sm:text-center rounded-md border px-3 font-mono text-xs">
            {host}/examples/{slug}
          </div>
          <Link
            href={`/examples/${slug}`}
            className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-xs font-medium transition-colors"
          >
            Ouvrir
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        </div>

        {EXAMPLES.map(({ slug, Component }) => (
          <TabsContent
            key={slug}
            value={slug}
            // Hauteur fixe et fondu en bas : la fenêtre montre le haut de la
            // page, l'exemple complet est à un clic.
            className="h-[640px] overflow-hidden mask-b-from-80% text-base"
          >
            <Component />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
