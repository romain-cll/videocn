import type { Metadata } from "next";

import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = {
  title: "Playground",
};

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Playground</h1>
      <p className="text-muted-foreground mt-2 text-sm text-pretty">
        Set the props, watch the player change, copy the code.
      </p>

      <div className="mt-8">
        <Playground />
      </div>
    </main>
  );
}
