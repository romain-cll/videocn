import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

const principles = [
  {
    title: "Votre thème, pas le nôtre",
    body: "Le lecteur est composé de primitives shadcn et n'utilise que des tokens sémantiques. Il hérite du thème de votre projet — couleurs, rayons, typographie, mode sombre — sans une ligne de configuration.",
  },
  {
    title: "À la carte",
    body: "Un socle et des morceaux indépendants : timeline, réglages, sous-titres, PiP, raccourcis clavier. Vous n'installez que ce dont vous avez besoin, et le code vous appartient.",
  },
  {
    title: "Des formats standard, pas une API",
    body: "Miniatures de timeline en WebVTT, sous-titres et chapitres en <track>, adaptatif en HLS. Le lecteur ne connaît aucun service : ce qui l'alimente reste votre choix.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="flex flex-col items-start gap-6 py-20 md:py-28">
        <Badge variant="secondary">En construction</Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Un lecteur vidéo qui parle déjà la langue de votre design system.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg text-pretty">
          {siteConfig.description} Installez-le avec le CLI shadcn, gardez le code source, et
          branchez-y ce que vous voulez.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button nativeButton={false} render={<Link href="/docs" />}>Commencer</Button>
          <Button variant="outline" nativeButton={false} render={<a href={siteConfig.links.github} />}>
            GitHub
          </Button>
        </div>
        <CodeBlock className="mt-4 w-full max-w-2xl">
          npx shadcn@latest add {siteConfig.namespace}/video-player
        </CodeBlock>
      </section>

      <section className="grid gap-8 border-t py-16 md:grid-cols-3">
        {principles.map((principle) => (
          <div key={principle.title} className="flex flex-col gap-2">
            <h2 className="font-medium">{principle.title}</h2>
            <p className="text-muted-foreground text-sm text-pretty">{principle.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
