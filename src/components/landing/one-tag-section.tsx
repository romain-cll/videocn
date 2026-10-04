"use client";

/**
 * La section des props, façon billingsdk : une liste de cas à gauche, le
 * lecteur vivant à droite et, dessous, le JSX exact qui le produit.
 *
 * Un seul `<VideoCn>` pour tous les cas, sans `key` : changer de cas change
 * ses props sous la même balise, comme chez un intégrateur. L'extrait sort de
 * `videoCnSnippet` avec les props passées au lecteur, jamais d'une chaîne à part.
 */

import { useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { Frame } from "@/components/frame";
import { LandingSection } from "@/components/landing/landing-section";
import { BUNNY_CHAPTERS, getDemoSource, type DemoSourceId } from "@/lib/demo-media";
import { videoCnSnippet } from "@/lib/snippet";
import { cn } from "@/lib/utils";
import type { ControlsOptions } from "@/registry/videocn/controls-options";
import { VideoCn } from "@/registry/videocn/video-cn";

interface Case {
  id: string;
  title: string;
  description: string;
  /** La prop que le cas met en avant, affichée en monospace. */
  prop: string;
  source: DemoSourceId;
  chapters?: boolean;
  controls?: ControlsOptions;
  /** Affiche la note de la source sous le lecteur : utile quand c'est elle qui change. */
  showNote?: boolean;
}

const CASES: readonly Case[] = [
  {
    id: "source",
    title: "Just a source",
    description: "An MP4 URL and nothing else. Every control is there.",
    prop: "src",
    source: "mp4",
  },
  {
    id: "chapters",
    title: "Chapters",
    description: "A list of times and labels cuts the bar and fills a menu.",
    prop: "chapters",
    source: "mp4",
    chapters: true,
  },
  {
    id: "streaming",
    title: "Streaming",
    description: "An HLS manifest loads Shaka on demand and enables the quality setting.",
    prop: "src",
    source: "hls",
    showNote: true,
  },
  {
    id: "live",
    title: "Live",
    description: "A live stream gets a seekable window and a Live badge.",
    prop: "src",
    source: "live",
    showNote: true,
  },
  {
    id: "trimmed",
    title: "Trimmed controls",
    description: "No Picture-in-Picture, three speeds, one piece bar.",
    prop: "controls",
    source: "mp4",
    chapters: true,
    controls: {
      pictureInPicture: false,
      playbackRate: { rates: [1, 1.5, 2] },
      scrubber: { chapters: false },
    },
  },
  {
    id: "visible",
    title: "Always visible",
    description: "The bar stays on screen during playback.",
    prop: "controls.visibility",
    source: "mp4",
    controls: { visibility: "always" },
  },
];

export function OneTagSection() {
  const [activeId, setActiveId] = useState(CASES[0].id);
  const active = CASES.find((candidate) => candidate.id === activeId) ?? CASES[0];
  const source = getDemoSource(active.source);
  const chapters = active.chapters ? BUNNY_CHAPTERS : undefined;

  return (
    <LandingSection
      id="props"
      label="<VideoCn />"
      title="One tag. Every control is a prop."
      description="The control bar is not yours to rebuild. Hide a button, change a list of values or swap the source through props, and keep the code you installed untouched."
    >
      <div className="grid gap-8 md:grid-cols-3">
        {/* Sous `md`, la liste se replie en pilules : titres seuls, sur une ou
            deux lignes au-dessus du lecteur. */}
        <div role="group" aria-label="Examples" className="flex flex-wrap gap-2 md:flex-col md:gap-1">
          {CASES.map((candidate) => {
            const isActive = candidate.id === active.id;
            return (
              <button
                key={candidate.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveId(candidate.id)}
                className={cn(
                  "focus-visible:ring-ring/50 flex flex-col items-start gap-1 rounded-full border px-3 py-1.5 text-left text-sm transition-colors outline-none focus-visible:ring-3 md:rounded-lg md:px-4 md:py-3",
                  isActive
                    ? "bg-muted border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent max-md:border-border",
                )}
              >
                <span className="font-medium">{candidate.title}</span>
                <span className="text-muted-foreground hidden text-pretty md:block">
                  {candidate.description}
                </span>
                <code className="text-muted-foreground hidden font-mono text-xs md:block">
                  {candidate.prop}
                </code>
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-col gap-4 md:col-span-2">
          <Frame label={active.prop}>
            <VideoCn
              src={source.src}
              poster={source.poster}
              chapters={chapters}
              controls={active.controls}
            />
          </Frame>
          {active.showNote && (
            <p className="text-muted-foreground text-xs text-pretty">{source.note}</p>
          )}
          <CodeBlock
            code={videoCnSnippet({
              src: source.src,
              poster: source.poster,
              chapters: chapters ? "chapters" : undefined,
              controls: active.controls,
            })}
          />
        </div>
      </div>
    </LandingSection>
  );
}
