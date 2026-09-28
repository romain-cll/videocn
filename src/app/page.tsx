import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRightIcon } from "lucide-react";

import { ChangelogSection } from "@/components/landing/changelog-section";
import { CopyCommand } from "@/components/landing/copy-command";
import { HeroPlayer } from "@/components/landing/hero-player";
import { InstallSection } from "@/components/landing/install-section";
import { OneTagSection } from "@/components/landing/one-tag-section";
import { Button } from "@/components/ui/button";
import { INSTALL_COMMAND } from "@/lib/install";
import { PAGE_DESCRIPTIONS, pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({ description: PAGE_DESCRIPTIONS.home, path: "/" });

export default function Home() {
  return (
    // Le cadre à rails part du header et descend jusqu'au footer : hero compris,
    // les sections se succèdent entre deux filets verticaux, séparées par un
    // filet horizontal, au lieu de flotter dans des cartes.
    <main className="mx-auto w-full max-w-6xl border-x">
      <div className="flex flex-col items-center px-6">
        <section className="flex w-full flex-col items-center gap-6 pt-20 pb-12 text-center md:pt-28">
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
              render={<Link href="/playground" />}
            >
              Open the playground
            </Button>
          </div>
          <CopyCommand command={INSTALL_COMMAND} />
        </section>

        <section aria-label="Live example" className="w-full max-w-4xl pb-16">
          <HeroPlayer />
        </section>
      </div>

      <OneTagSection />
      <InstallSection />
      <ChangelogSection />
    </main>
  );
}
