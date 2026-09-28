import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="font-medium tracking-tight">
          videoCn
        </Link>
        <nav className="text-muted-foreground flex items-center gap-3 text-sm sm:gap-4">
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link href="/playground" className="hover:text-foreground transition-colors">
            Playground
          </Link>
          {/* Masqué sur téléphone : la barre n'a pas la place, et le changelog
              reste à un défilement sur la landing. */}
          <Link href="/#changelog" className="hover:text-foreground hidden transition-colors sm:inline">
            Changelog
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" nativeButton={false} render={<a href={siteConfig.links.github} target="_blank" rel="noreferrer" />}>
            GitHub
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
