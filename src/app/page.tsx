import Link from "next/link";

import { CopyCommand } from "@/components/landing/copy-command";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

const INSTALL_COMMAND = `pnpm dlx shadcn@latest add ${siteConfig.namespace}/player`;

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6">
          <section className="flex w-full flex-col items-center gap-6 pt-20 pb-14 text-center md:pt-28">
            <Badge variant="secondary" className="rounded-full px-3">
              Raccourcis clavier disponibles
            </Badge>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-balance md:text-6xl">
              Un lecteur vidéo pour shadcn/ui
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg text-pretty">
              Il prend le thème de votre projet, s’installe en une commande et se règle par les
              props. Le code est à vous.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button className="rounded-full" size="lg" nativeButton={false} render={<Link href="/docs" />}>
                Commencer
              </Button>
              <Button
                className="rounded-full"
                size="lg"
                variant="secondary"
                nativeButton={false}
                render={<Link href="/demo" />}
              >
                Voir la démo
              </Button>
            </div>
            <CopyCommand command={INSTALL_COMMAND} />
          </section>

          <section className="w-full pb-16">
            <HeroCarousel />
          </section>
        </div>

        <p className="text-muted-foreground max-w-2xl px-6 py-16 text-center text-sm text-pretty">
          Des formats du web, aucune API : MP4, WebM, HLS et DASH. Le moteur de streaming n’est
          chargé que pour une source HLS ou DASH, jamais pour un MP4.
        </p>
      </main>

      <footer className="text-muted-foreground border-t py-6 text-center text-sm">
        videoCn, un lecteur vidéo pour shadcn/ui. Le code source est sur{" "}
        <a href={siteConfig.links.github} className="text-foreground underline underline-offset-4">
          GitHub
        </a>
        .
      </footer>
    </>
  );
}
