import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/demo", label: "Demo" },
  { href: "/#roadmap", label: "Roadmap" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium">{siteConfig.name}</span>
        <nav className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
