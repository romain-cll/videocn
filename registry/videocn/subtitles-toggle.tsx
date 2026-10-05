"use client";

import { memo } from "react";
import { CaptionsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useControlsOptions } from "./controls-context";
import { usePlayerActions, usePlayerValue } from "./player-context";
import type { PlayerState } from "./player-state-store";

function selectSubtitles(state: PlayerState) {
  return state.subtitles;
}

function selectActiveSubtitle(state: PlayerState) {
  return state.activeSubtitle;
}

/**
 * Le bouton CC : active ou coupe les sous-titres. Le choix de la piste se fait
 * dans la ligne « Subtitles » du menu de réglages ; ici, un seul geste, dont
 * `toggleSubtitles` décide la cible (dernière piste choisie, sinon défaut,
 * sinon première).
 *
 * **Le libellé ne change pas, l'état passe par `aria-pressed`** — l'inverse de
 * `PlayToggle`. « Subtitles, activé » dit ce que le bouton est, et il n'y a pas
 * de contradiction à l'oreille : le nom ne décrit aucune action.
 *
 * Actif, une barre `bg-primary` se pose sous l'icône : `primary` est déjà la
 * couleur de « actif » dans le lecteur (le scrubber). Elle est montée seulement
 * quand les sous-titres sont actifs, pas masquée : l'état se lit dans le DOM.
 *
 * Il disparaît sans pistes, comme le menu des chapitres, et avec
 * `controls.subtitles: false`.
 */
export const SubtitlesToggle = memo(function SubtitlesToggle() {
  const { subtitles: subtitlesOptions, keyboard } = useControlsOptions();
  const tracks = usePlayerValue(selectSubtitles);
  const activeSubtitle = usePlayerValue(selectActiveSubtitle);
  const { toggleSubtitles } = usePlayerActions();

  if (!subtitlesOptions.enabled || tracks.length === 0) return null;

  const active = activeSubtitle !== null;

  return (
    <Button
      variant="ghost"
      size="icon"
      // `relative` : c'est le repère de la barre d'état posée sous l'icône.
      className="relative"
      onClick={toggleSubtitles}
      aria-label="Subtitles"
      aria-pressed={active}
      aria-keyshortcuts={keyboard.enabled ? "c" : undefined}
    >
      <CaptionsIcon />
      {active ? (
        // `inset-x-2` plutôt qu'un centrage par `left` et `translate` : la
        // propriété logique se met en miroir toute seule en RTL, et la barre,
        // symétrique, reste sous l'icône.
        <span
          data-slot="video-player-subtitles-indicator"
          className="pointer-events-none absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-primary"
        />
      ) : null}
    </Button>
  );
});
