import { siteConfig } from "@/lib/site-config";

/** Le footer d'une ligne, comme celui de shadcn : rien à y chercher qui ne soit déjà dans le header. */
export function SiteFooter() {
  return (
    <footer className="border-t">
      <p className="text-muted-foreground mx-auto max-w-6xl px-6 py-6 text-sm text-balance">
        {siteConfig.name}, a video player for shadcn/ui. The source code is available on{" "}
        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer"
          className="text-foreground font-medium underline underline-offset-4"
        >
          GitHub
        </a>
        .
      </p>
    </footer>
  );
}
