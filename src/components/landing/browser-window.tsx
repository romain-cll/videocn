import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

/**
 * Une fenêtre de navigateur factice : trois points, l'URL de l'exemple, un lien
 * pour l'ouvrir en grand. Le contenu remplit ce qui reste de sa hauteur.
 */
export function BrowserWindow({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  const host = new URL(siteConfig.url).host;

  return (
    <div
      className={cn(
        "bg-background flex flex-col overflow-hidden rounded-xl border shadow-xl",
        className,
      )}
    >
      <div className="bg-muted/40 flex h-11 shrink-0 items-center gap-4 border-b px-4">
        <div aria-hidden className="flex gap-1.5">
          <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/25 size-2.5 rounded-full" />
        </div>
        <div className="bg-background text-muted-foreground mx-auto h-7 w-full max-w-sm min-w-0 truncate rounded-md border px-3 text-left font-mono text-xs leading-7 sm:text-center">
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
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
