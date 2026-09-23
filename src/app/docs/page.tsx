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
        videoCn ships as a shadcn registry. Declare it once, then install the player like any
        other component.
      </p>

      <h2 className="mt-12 text-xl font-medium tracking-tight">1. Declare the registry</h2>
      <p className="text-muted-foreground mt-2 text-sm text-pretty">
        In your project&apos;s{" "}
        <code className="text-foreground font-mono text-xs">components.json</code>:
      </p>
      <CodeBlock className="mt-4">
        {JSON.stringify({ registries: { [siteConfig.namespace]: siteConfig.registryUrl } }, null, 2)}
      </CodeBlock>

      <h2 className="mt-12 text-xl font-medium tracking-tight">2. Install the player</h2>
      <CodeBlock className="mt-4">
        npx shadcn@latest add {siteConfig.namespace}/player
      </CodeBlock>
      <p className="text-muted-foreground mt-4 text-sm text-pretty">
        The CLI copies the source into your project and adds any missing shadcn primitives along
        the way. The code is yours: change it as you like.
      </p>

      <div className="bg-muted/40 mt-12 rounded-lg border p-6">
        <p className="text-muted-foreground text-sm text-pretty">
          The player is not published yet. This page describes the target; the registry is live
          and already serves its catalog at{" "}
          <code className="text-foreground font-mono text-xs">/r/registry.json</code>.
        </p>
      </div>
    </main>
  );
}
