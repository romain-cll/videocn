"use client";

/**
 * Le lecteur du hero : un seul `<VideoCn>`, et de quoi le re-thématiser sur
 * place. C'est la promesse de la landing tenue dès le premier écran — le
 * lecteur n'a aucune couleur à lui, il lit les tokens de l'hôte.
 *
 * La palette passe par des onglets, le rayon par un petit sélecteur à part :
 * deux dimensions dans une même rangée d'onglets se liraient mal. Les deux
 * restent hors du conteneur thématisé, pour ne pas bouger sous le doigt.
 */

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BUNNY_CHAPTERS, getDemoSource } from "@/lib/demo-media";
import {
  PALETTES,
  RADII,
  themeClassName,
  type PaletteId,
  type RadiusId,
} from "@/lib/demo-themes";
import { themeSnippet } from "@/lib/theme-snippet";
import { cn } from "@/lib/utils";
import { VideoCn } from "@/registry/videocn/video-cn";

const SOURCE = getDemoSource("mp4");

/**
 * Seul le couple `--primary` est montré : c'est lui que la barre du lecteur
 * rend visible. `--accent` et `--ring` changent aussi, mais doubleraient la
 * hauteur du bloc.
 */
const SNIPPET_OPTIONS = { only: ["--primary", "--primary-foreground"], alwaysRadius: true } as const;

export function HeroPlayer() {
  const [palette, setPalette] = useState<PaletteId>("neutral");
  const [radius, setRadius] = useState<RadiusId>("default");
  const [showCss, setShowCss] = useState(false);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={palette} onValueChange={(value) => setPalette(value as PaletteId)}>
          <TabsList>
            {PALETTES.map((candidate) => (
              <TabsTrigger key={candidate.id} value={candidate.id}>
                {/* La pastille lit `--primary` à travers la classe de sa
                    palette : aucune couleur n'est écrite ici. */}
                <span className={cn(candidate.className, "bg-primary size-2.5 rounded-full")} />
                {candidate.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
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
              <ToggleGroupItem key={candidate.id} value={candidate.id}>
                {candidate.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {/* Le thème englobe le lecteur et son CSS, comme le ferait celui d'un
          hôte. Des chapitres, pour que la barre segmentée montre la couleur
          primaire dès l'arrivée. */}
      <div className={cn(themeClassName(palette, radius), "flex flex-col gap-3")}>
        <VideoCn src={SOURCE.src} poster={SOURCE.poster} chapters={BUNNY_CHAPTERS} />
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showCss}
            onClick={() => setShowCss((shown) => !shown)}
          >
            {showCss ? "Hide CSS" : "View CSS"}
            <ChevronDownIcon className={cn("transition-transform", showCss && "rotate-180")} />
          </Button>
        </div>
        {showCss && (
          <CodeBlock title="globals.css" code={themeSnippet(palette, radius, SNIPPET_OPTIONS) ?? ""} />
        )}
      </div>
    </div>
  );
}
