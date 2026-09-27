"use client";

/**
 * La section du thème, façon ui.shadcn.com/create : un panneau de réglages à
 * gauche, un seul lecteur à droite. Les réglages ne touchent jamais le
 * lecteur : ils posent une classe sur son conteneur, qui redéfinit les tokens
 * comme le ferait le `globals.css` de l'hôte. Le bloc de code sous le lecteur
 * montre ces variables, et rien d'autre.
 */

import { useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { Frame } from "@/components/frame";
import { themeSnippet } from "@/lib/theme-snippet";
import { LandingSection } from "@/components/landing/landing-section";
import {
  PALETTES,
  RADII,
  themeClassName,
  type PaletteId,
  type RadiusId,
} from "@/components/theme-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BUNNY_CHAPTERS, getDemoSource } from "@/lib/demo-media";
import { cn } from "@/lib/utils";
import { VideoCn } from "@/registry/videocn/video-cn";

const SOURCE = getDemoSource("mp4");

/**
 * Seul le couple `--primary` est montré : c'est lui que la barre du lecteur rend
 * visible. `--accent` et `--ring` changent aussi, mais doubleraient la hauteur
 * du bloc.
 */
const SNIPPET_OPTIONS = { only: ["--primary", "--primary-foreground"], alwaysRadius: true } as const;

export function ThemeSection() {
  const [palette, setPalette] = useState<PaletteId>("blue");
  const [radius, setRadius] = useState<RadiusId>("default");

  return (
    <LandingSection
      id="theme"
      label="--radius"
      title="Your theme, not ours."
      description="The player ships without a single color of its own. It reads the tokens of your app: change them, and it follows."
    >
      <div className="grid gap-8 md:grid-cols-4">
        {/* Le panneau reste hors de la classe de thème : il ne bouge pas sous le doigt. Le
            retrait du haut l'aligne sur l'étiquette du cadre voisin. */}
        <div className="flex flex-col gap-6 md:pt-2">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-xs">--primary</span>
            <ToggleGroup
              value={[palette]}
              onValueChange={(value) => {
                const next = value[0];
                if (next) setPalette(next as PaletteId);
              }}
              spacing={1}
              className="w-full flex-wrap md:flex-col md:items-stretch"
            >
              {PALETTES.map((candidate) => (
                <ToggleGroupItem
                  key={candidate.id}
                  value={candidate.id}
                  className="justify-start gap-2 md:w-full"
                >
                  {/* La pastille lit `--primary` à travers la classe de sa
                      palette : aucune couleur n'est écrite ici. */}
                  <span className={cn(candidate.className, "bg-primary size-3 rounded-full")} />
                  {candidate.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-xs">--radius</span>
            <ToggleGroup
              value={[radius]}
              onValueChange={(value) => {
                const next = value[0];
                if (next) setRadius(next as RadiusId);
              }}
              variant="outline"
              size="sm"
            >
              {RADII.map((candidate) => (
                <ToggleGroupItem key={candidate.id} value={candidate.id} className="font-mono">
                  {candidate.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Le thème englobe le cadre, le lecteur et le code, comme celui d'un
            hôte englobe toute sa page. */}
        <div className={cn(themeClassName(palette, radius), "flex min-w-0 flex-col gap-4 md:col-span-3")}>
          <Frame label="<VideoCn chapters={chapters} />">
            <VideoCn src={SOURCE.src} poster={SOURCE.poster} chapters={BUNNY_CHAPTERS} />
          </Frame>
          <CodeBlock title="globals.css" code={themeSnippet(palette, radius, SNIPPET_OPTIONS) ?? ""} />
        </div>
      </div>
    </LandingSection>
  );
}
