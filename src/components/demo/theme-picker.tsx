"use client";

/**
 * Le sélecteur de thème de la démo : une palette et un rayon, appliqués par
 * classe sur un conteneur autour des lecteurs. Rien dans le lecteur ne sait
 * qu'on le change — c'est la preuve qu'il lit les tokens de l'hôte et rien
 * d'autre.
 *
 * Les classes vivent dans `globals.css` ; ici on ne fait que les nommer.
 */

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export const PALETTES = [
  { id: "neutral", label: "Neutral", className: "" },
  { id: "blue", label: "Blue", className: "demo-theme-blue" },
  { id: "rose", label: "Rose", className: "demo-theme-rose" },
  { id: "green", label: "Green", className: "demo-theme-green" },
] as const;

export const RADII = [
  { id: "none", label: "0", className: "demo-radius-none" },
  { id: "default", label: "0.625rem", className: "" },
  { id: "large", label: "1rem", className: "demo-radius-large" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];
export type RadiusId = (typeof RADII)[number]["id"];

export function themeClassName(palette: PaletteId, radius: RadiusId) {
  return cn(
    PALETTES.find((candidate) => candidate.id === palette)?.className,
    RADII.find((candidate) => candidate.id === radius)?.className,
  );
}

export function ThemePicker({
  palette,
  radius,
  onPaletteChange,
  onRadiusChange,
}: {
  palette: PaletteId;
  radius: RadiusId;
  onPaletteChange: (palette: PaletteId) => void;
  onRadiusChange: (radius: RadiusId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Theme</span>
        <ToggleGroup
          value={[palette]}
          onValueChange={(value) => {
            const next = value[0];
            if (next) onPaletteChange(next as PaletteId);
          }}
          variant="outline"
          size="sm"
        >
          {PALETTES.map((candidate) => (
            <ToggleGroupItem key={candidate.id} value={candidate.id} aria-label={candidate.label}>
              {/* La pastille lit `--primary` à travers la classe de sa palette :
                  aucune couleur n'est écrite ici. */}
              <span className={cn(candidate.className, "bg-primary size-3 rounded-full")} />
              <span className="hidden sm:inline">{candidate.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground font-mono text-xs">--radius</span>
        <ToggleGroup
          value={[radius]}
          onValueChange={(value) => {
            const next = value[0];
            if (next) onRadiusChange(next as RadiusId);
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
  );
}
