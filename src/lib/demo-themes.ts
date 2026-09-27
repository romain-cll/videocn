/**
 * Les thèmes de démonstration : une palette et un rayon, appliqués par classe
 * sur un conteneur autour d'un lecteur (hero, playground, doc). Rien dans le
 * lecteur ne sait qu'on le change — c'est la preuve qu'il lit les tokens de
 * l'hôte et rien d'autre.
 *
 * Les classes vivent dans `globals.css` ; ici on ne fait que les nommer.
 */

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
