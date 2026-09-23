"use client";

/**
 * Le lecteur de la page d'accueil et ses thèmes d'essai.
 *
 * Changer de thème ne touche qu'un attribut sur le conteneur : les tokens sont
 * redéfinis dans `globals.css`, et le lecteur les hérite comme il hériterait de
 * ceux d'un projet hôte. Aucune prop ne change, aucune classe du lecteur non
 * plus.
 */

import { useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LANDING_VIDEO_POSTER, LANDING_VIDEO_SRC } from "@/components/landing/landing-video";
import { VideoCn } from "@/registry/videocn/video-cn";

const THEMES = [
  { id: "neutre", label: "Neutre" },
  { id: "violet", label: "Violet" },
  { id: "rose", label: "Rose, arrondi" },
  { id: "vert", label: "Vert, anguleux" },
  { id: "ambre", label: "Ambre" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

export function ThemedPlayer() {
  const [theme, setTheme] = useState<ThemeId>("violet");

  return (
    <div className="flex flex-col gap-5">
      <div data-player-theme={theme}>
        <VideoCn src={LANDING_VIDEO_SRC} poster={LANDING_VIDEO_POSTER} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span id="player-theme-label" className="text-muted-foreground text-sm">
          Essayez un thème
        </span>
        <ToggleGroup
          aria-labelledby="player-theme-label"
          variant="outline"
          className="flex-wrap"
          value={[theme]}
          // Un groupe à choix unique se vide quand on reclique l'élément actif :
          // on garde alors le thème courant plutôt que de n'en avoir aucun.
          onValueChange={(value) => {
            const next = value[0] as ThemeId | undefined;
            if (next) setTheme(next);
          }}
        >
          {THEMES.map(({ id, label }) => (
            <ToggleGroupItem key={id} value={id} className="rounded-full pl-2">
              {/* La pastille porte le même attribut que le lecteur : elle
                  prend la couleur du thème par le même chemin que lui. */}
              <span
                data-player-theme={id}
                aria-hidden
                className="bg-primary ring-foreground/15 size-3.5 rounded-full ring-1"
              />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <p className="text-muted-foreground text-sm text-pretty">
        Seuls les tokens CSS changent : <code className="text-foreground font-mono text-xs">--primary</code>{" "}
        et <code className="text-foreground font-mono text-xs">--radius</code>. Le code du lecteur
        reste le même.
      </p>
    </div>
  );
}
