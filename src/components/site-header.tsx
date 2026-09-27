import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="font-medium tracking-tight">
          videoCn
        </Link>
        <nav className="text-muted-foreground flex items-center gap-3 text-sm sm:gap-4">
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link href="/demo" className="hover:text-foreground transition-colors">
            Demo
          </Link>
          <Link href="/#roadmap" className="hover:text-foreground transition-colors">
            Roadmap
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
