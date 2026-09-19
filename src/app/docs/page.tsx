import type { Metadata } from "next";

import { CodeBlock } from "@/components/code-block";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Installation",
};

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Installation</h1>
      <p className="text-muted-foreground mt-3 text-pretty">
        videoCn se distribue comme un registry shadcn. Déclarez-le une fois, puis installez les
        morceaux du lecteur comme n&apos;importe quel composant.
      </p>

      <h2 className="mt-12 text-xl font-medium tracking-tight">1. Déclarer le registry</h2>
      <p className="text-muted-foreground mt-2 text-sm text-pretty">
        Dans le <code className="text-foreground font-mono text-xs">components.json</code> de votre
        projet :
      </p>
      <CodeBlock className="mt-4">
        {JSON.stringify({ registries: { [siteConfig.namespace]: siteConfig.registryUrl } }, null, 2)}
      </CodeBlock>

      <h2 className="mt-12 text-xl font-medium tracking-tight">2. Installer le lecteur</h2>
      <CodeBlock className="mt-4">
        npx shadcn@latest add {siteConfig.namespace}/video-player
      </CodeBlock>
      <p className="text-muted-foreground mt-4 text-sm text-pretty">
        Le CLI copie les sources dans votre projet et installe au passage les primitives shadcn
        manquantes. Le code vous appartient : vous pouvez le modifier librement.
      </p>

      <div className="bg-muted/40 mt-12 rounded-lg border p-6">
        <p className="text-muted-foreground text-sm text-pretty">
          Le lecteur n&apos;est pas encore publié. Cette page décrit la cible ; le registry est en
          place et sert déjà son catalogue sur{" "}
          <code className="text-foreground font-mono text-xs">/r/registry.json</code>.
        </p>
      </div>
    </main>
  );
}
