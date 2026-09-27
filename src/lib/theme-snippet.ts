/**
 * Les variables que chaque palette de la démo surcharge, pour les extraits
 * `globals.css` de la landing et du playground — une seule copie des valeurs.
 *
 * À tenir en phase avec les classes `.demo-theme-*` et `.demo-radius-*` de
 * `src/app/globals.css`. On ne peut pas les relire sur la page : le CSS compilé
 * a converti les `oklch()` en `lab()` et en hexadécimal, et l'extrait ne
 * ressemblerait plus à ce qu'un thème shadcn écrit.
 */

import type { PaletteId, RadiusId } from "@/components/theme-picker";

type Variables = Readonly<Record<string, string>>;

const PALETTE_VARIABLES: Record<
  Exclude<PaletteId, "neutral">,
  { light: Variables; dark: Variables }
> = {
  blue: {
    light: {
      "--primary": "oklch(0.488 0.243 264.376)",
      "--primary-foreground": "oklch(0.97 0.014 254.604)",
      "--accent": "oklch(0.932 0.032 255.585)",
      "--accent-foreground": "oklch(0.379 0.146 265.522)",
      "--ring": "oklch(0.623 0.214 259.815)",
    },
    dark: {
      "--primary": "oklch(0.623 0.214 259.815)",
      "--primary-foreground": "oklch(0.97 0.014 254.604)",
      "--accent": "oklch(0.379 0.146 265.522)",
      "--accent-foreground": "oklch(0.97 0.014 254.604)",
      "--ring": "oklch(0.488 0.243 264.376)",
    },
  },
  rose: {
    light: {
      "--primary": "oklch(0.586 0.253 17.585)",
      "--primary-foreground": "oklch(0.969 0.015 12.422)",
      "--accent": "oklch(0.941 0.03 12.58)",
      "--accent-foreground": "oklch(0.455 0.188 13.697)",
      "--ring": "oklch(0.712 0.194 13.428)",
    },
    dark: {
      "--primary": "oklch(0.645 0.246 16.439)",
      "--primary-foreground": "oklch(0.969 0.015 12.422)",
      "--accent": "oklch(0.41 0.159 10.272)",
      "--accent-foreground": "oklch(0.969 0.015 12.422)",
      "--ring": "oklch(0.586 0.253 17.585)",
    },
  },
  green: {
    light: {
      "--primary": "oklch(0.648 0.2 131.684)",
      "--primary-foreground": "oklch(0.986 0.031 120.757)",
      "--accent": "oklch(0.967 0.067 122.328)",
      "--accent-foreground": "oklch(0.453 0.124 130.933)",
      "--ring": "oklch(0.768 0.233 130.85)",
    },
    dark: {
      "--primary": "oklch(0.768 0.233 130.85)",
      "--primary-foreground": "oklch(0.274 0.072 132.109)",
      "--accent": "oklch(0.405 0.101 131.063)",
      "--accent-foreground": "oklch(0.986 0.031 120.757)",
      "--ring": "oklch(0.648 0.2 131.684)",
    },
  },
};

const RADIUS_VALUES: Record<Exclude<RadiusId, "default">, string> = {
  none: "0",
  large: "1rem",
};

function rule(selector: string, variables: Variables) {
  const lines = Object.entries(variables).map(
    ([name, value]) => `  ${name}: ${value};`,
  );
  return `${selector} {\n${lines.join("\n")}\n}`;
}

const DEFAULT_RADIUS = "0.625rem";

export interface ThemeSnippetOptions {
  /** Ne montrer que ces variables — la landing garde le seul couple `--primary`. */
  only?: readonly string[];
  /** Écrire `--radius` même à sa valeur par défaut, pour que le bloc ne soit jamais vide. */
  alwaysRadius?: boolean;
}

function pick(variables: Variables, only?: readonly string[]): Variables {
  if (!only) return variables;
  return Object.fromEntries(Object.entries(variables).filter(([name]) => only.includes(name)));
}

/** `null` quand rien n'est surchargé : le thème de l'hôte suffit. */
export function themeSnippet(
  palette: PaletteId,
  radius: RadiusId,
  { only, alwaysRadius = false }: ThemeSnippetOptions = {},
): string | null {
  const colors = palette === "neutral" ? undefined : PALETTE_VARIABLES[palette];
  const radiusValue =
    radius === "default" ? (alwaysRadius ? DEFAULT_RADIUS : undefined) : RADIUS_VALUES[radius];
  if (!colors && !radiusValue) return null;

  const root = {
    ...(colors ? pick(colors.light, only) : {}),
    ...(radiusValue ? { "--radius": radiusValue } : {}),
  };
  const rules = [rule(":root", root)];
  if (colors) rules.push(rule(".dark", pick(colors.dark, only)));
  return rules.join("\n\n");
}
