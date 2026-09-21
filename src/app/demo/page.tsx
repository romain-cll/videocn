import type { Metadata } from "next";

import { PlayerDemo } from "@/components/player-demo";

export const metadata: Metadata = {
  title: "Démo",
};

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Démo</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-pretty">
        Le socle du lecteur, sans habillage : le composant, le hook d&apos;état et le store de tête
        de lecture. Les contrôles videoCn arrivent en phase 1 — en attendant, ce sont ceux du
        navigateur qui pilotent la vidéo, et le panneau lit l&apos;élément sans jamais y toucher.
      </p>

      <div className="mt-10">
        <PlayerDemo />
      </div>
    </main>
  );
}
