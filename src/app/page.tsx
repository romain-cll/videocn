import Link from "next/link";

import { BundleSize } from "@/components/landing/bundle-size";
import { CopyCommand } from "@/components/landing/copy-command";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { Roadmap } from "@/components/landing/roadmap";
import { SiteFooter } from "@/components/landing/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

// L'URL directe plutôt que `@videocn/player` : le namespace nu ne se résout
// que si le visiteur a déclaré le registry, ou quand l'annuaire shadcn l'aura
// accepté. D'ici là, c'est la seule commande qui marche du premier coup.
const INSTALL_COMMAND = `pnpm dlx shadcn@latest add ${siteConfig.registryUrl.replace("{name}", "player")}`;

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6">
          {/* Au-dessus de la mosaïque du carrousel, qui remonte derrière le texte. */}
          <section className="relative z-10 flex w-full flex-col items-center gap-6 pt-20 pb-14 text-center md:pt-28">
            <Badge variant="secondary" className="rounded-full px-3">
              Chapters are here
            </Badge>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-balance md:text-6xl">
              A video player for shadcn/ui
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg text-pretty">
              It picks up your project’s theme, installs with one command and is configured
              through props. The code is yours.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button className="rounded-full" size="lg" nativeButton={false} render={<Link href="/docs" />}>
                Get started
              </Button>
              <Button
                className="rounded-full"
                size="lg"
                variant="secondary"
                nativeButton={false}
                render={<Link href="/demo" />}
              >
                View the demo
              </Button>
            </div>
            <CopyCommand command={INSTALL_COMMAND} />
          </section>

          <section className="w-full pb-16">
            <HeroCarousel />
          </section>

          <Features />
          <BundleSize />
          <Roadmap />
          <FinalCta command={INSTALL_COMMAND} />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
