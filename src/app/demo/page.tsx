import type { Metadata } from "next";

import { PlayerDemo } from "@/components/player-demo";

export const metadata: Metadata = {
  title: "Demo",
};

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Demo</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-pretty">
        The player and its control bar, exactly as they reach your project. Switch sources to see
        the same component play an MP4, HLS, DASH and a live stream.
      </p>

      <div className="mt-10">
        <PlayerDemo />
      </div>
    </main>
  );
}
