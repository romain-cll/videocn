import Link from "next/link";

import { ArrowRightIcon } from "lucide-react";

import { ChangelogSection } from "@/components/landing/changelog-section";
import { CopyCommand } from "@/components/landing/copy-command";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { InstallSection } from "@/components/landing/install-section";
import { OneTagSection } from "@/components/landing/one-tag-section";
import { ThemeSection } from "@/components/landing/theme-section";
import { Button } from "@/components/ui/button";
import { INSTALL_COMMAND } from "@/lib/install";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6">
        {/* Au-dessus de la mosaïque du carrousel, qui remonte derrière le texte. */}
        <section className="relative z-10 flex w-full flex-col items-center gap-6 pt-20 pb-14 text-center md:pt-28">
          {/* Le badge-lien de shadcn : la dernière sortie, qui mène au changelog. */}
          <Link
            href="/#changelog"
            className="bg-muted hover:bg-muted/70 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
          >
            Chapters are here
            <ArrowRightIcon className="size-3" />
          </Link>
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
      </div>

      {/* Le cadre à rails : les sections se succèdent entre deux filets
          verticaux, séparées par un filet horizontal, au lieu de flotter
          dans des cartes. */}
      <div className="mx-auto w-full max-w-6xl border-x">
        <ThemeSection />
        <OneTagSection />
        <InstallSection />
        <ChangelogSection />
      </div>
    </main>
  );
}
