import {
  KeyboardIcon,
  ListVideoIcon,
  PaletteIcon,
  RadioTowerIcon,
  SlidersHorizontalIcon,
  TerminalIcon,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "@/components/landing/section-heading";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Chaque phrase doit se vérifier dans `registry/videocn/` : rien de promis ici
// qui ne soit déjà livré.
const FEATURES: readonly Feature[] = [
  {
    icon: PaletteIcon,
    title: "Your theme",
    description: "Built on your shadcn color tokens and your radius. Light and dark work with no config.",
  },
  {
    icon: TerminalIcon,
    title: "One command",
    description: "Installed from a shadcn registry. The code lands in your project and is yours.",
  },
  {
    icon: SlidersHorizontalIcon,
    title: "Driven by props",
    description: "Pick the controls with the controls prop. Nothing to edit in the installed code.",
  },
  {
    icon: RadioTowerIcon,
    title: "HLS, DASH and live",
    description: "Shaka Player loads on demand for streaming sources, with DVR on live streams.",
  },
  {
    icon: ListVideoIcon,
    title: "Chapters",
    description: "Segments on the progress bar and a menu to jump between them.",
  },
  {
    icon: KeyboardIcon,
    title: "Keyboard and accessibility",
    description: "The YouTube keymap, and sliders that screen readers can use.",
  },
];

export function Features() {
  return (
    <section className="flex w-full flex-col gap-10 py-16 md:py-24">
      <SectionHeading
        title="Everything a player needs"
        description="The features you expect from a video player, styled like the rest of your app."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-card text-card-foreground flex flex-col gap-3 rounded-xl border p-6">
            <div className="bg-muted flex size-9 items-center justify-center rounded-lg">
              <Icon className="size-4" aria-hidden />
            </div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-muted-foreground text-sm text-pretty">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
