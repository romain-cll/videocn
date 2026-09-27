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
 * Les valeurs posées par les classes `.demo-theme-*` de `globals.css`, recopiées
 * pour l'affichage : à tenir en phase avec elles. Seul le couple `--primary`
 * est montré — c'est lui que la barre du lecteur rend visible ; `--accent` et
 * `--ring` changent aussi, mais doubleraient la hauteur du bloc. Neutre n'a pas
 * d'entrée : c'est le thème par défaut du site, il n'y a rien à surcharger.
 */
const PALETTE_VARS: Partial<Record<PaletteId, { light: string[]; dark: string[] }>> = {
  blue: {
    light: [
      "--primary: oklch(0.488 0.243 264.376);",
      "--primary-foreground: oklch(0.97 0.014 254.604);",
    ],
    dark: [
      "--primary: oklch(0.623 0.214 259.815);",
      "--primary-foreground: oklch(0.97 0.014 254.604);",
    ],
  },
  rose: {
    light: [
      "--primary: oklch(0.586 0.253 17.585);",
      "--primary-foreground: oklch(0.969 0.015 12.422);",
    ],
    dark: [
      "--primary: oklch(0.645 0.246 16.439);",
      "--primary-foreground: oklch(0.969 0.015 12.422);",
    ],
  },
  green: {
    light: [
      "--primary: oklch(0.648 0.2 131.684);",
      "--primary-foreground: oklch(0.986 0.031 120.757);",
    ],
    dark: [
      "--primary: oklch(0.768 0.233 130.85);",
      "--primary-foreground: oklch(0.274 0.072 132.109);",
    ],
  },
};

/** `0`, `0.625rem` ou `1rem` : le libellé de `RADII` est déjà la valeur CSS. */
function cssSnippet(palette: PaletteId, radius: RadiusId) {
  const radiusValue = RADII.find((candidate) => candidate.id === radius)?.label ?? "0.625rem";
  const vars = PALETTE_VARS[palette];
  const block = (selector: string, lines: string[]) =>
    `${selector} {\n${lines.map((line) => `  ${line}`).join("\n")}\n}`;

  if (!vars) return block(":root", [`--radius: ${radiusValue};`]);
  return `${block(":root", [...vars.light, `--radius: ${radiusValue};`])}\n\n${block(".dark", vars.dark)}`;
}

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
          <CodeBlock title="globals.css" code={cssSnippet(palette, radius)} />
        </div>
      </div>
    </LandingSection>
  );
}
