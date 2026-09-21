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
        Le lecteur et sa barre de contrôles, tels qu&apos;ils arrivent chez l&apos;utilisateur. Le
        panneau affiche l&apos;état brut de l&apos;élément, qu&apos;il lit sans jamais y toucher :
        c&apos;est ce qui permet de vérifier que chaque commande atteint vraiment la vidéo.
      </p>

      <div className="mt-10">
        <PlayerDemo />
      </div>
    </main>
  );
}
