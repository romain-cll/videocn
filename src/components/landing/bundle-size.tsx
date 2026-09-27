import { SectionHeading } from "@/components/landing/section-heading";
import { bundleSize } from "@/lib/bundle";

// Les chiffres viennent de `bundleSize`, jamais recopiés à la main : quand la
// mesure change, la landing suit.
const BLOCKS = [
  {
    label: "Player",
    value: bundleSize.core.gzip,
    note: "gzip, in your bundle",
  },
  {
    label: "Shaka Player",
    value: bundleSize.shaka.gzip,
    note: "gzip, loaded apart, only for HLS or DASH",
  },
] as const;

export function BundleSize() {
  return (
    <section className="flex w-full flex-col gap-10 py-16 md:py-24">
      <SectionHeading
        title="Will it weigh down your app?"
        description="Measured, not estimated. React, lucide-react and your shadcn components are shared with the rest of your app."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {BLOCKS.map((block) => (
          <div key={block.label} className="flex flex-col gap-1 rounded-xl border p-6">
            <span className="text-muted-foreground text-sm">{block.label}</span>
            <span className="text-4xl font-semibold tracking-tight tabular-nums">{block.value}</span>
            <span className="text-muted-foreground text-sm">{block.note}</span>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground flex max-w-2xl flex-col gap-2 text-sm text-pretty">
        <p>
          An MP4 or WebM plays on the native video element and never loads the streaming engine.
          Shaka Player is only fetched when the source is HLS or DASH.
        </p>
        <p>Web formats, no API: the player reads standard files and never calls a videoCn service.</p>
      </div>
    </section>
  );
}
