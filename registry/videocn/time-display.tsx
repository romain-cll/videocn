"use client";

import { memo } from "react";

import { useControlsOptions } from "./controls-context";
import { formatSpokenTime, formatTime } from "./format-time";
import { usePlayerValue, usePlayheadValue } from "./player-context";
import { displayedTime, type PlayheadSnapshot } from "./playhead-store";
import type { PlayerState } from "./player-state-store";

/**
 * La seconde entière et non le temps exact : c'est tout ce que l'horodatage
 * affiche, et le sélecteur ne réveille le composant que lorsqu'elle change —
 * un rendu par seconde de média, pas soixante.
 *
 * `displayedTime` fait suivre le doigt pendant un glissement plutôt que la
 * vidéo, qui ne cherche qu'à intervalles : l'horodatage reste d'accord avec la
 * poignée du scrubber.
 */
function selectDisplayedSecond(snapshot: PlayheadSnapshot): number {
  return Math.floor(displayedTime(snapshot));
}

function selectDuration(state: PlayerState): number {
  return state.duration;
}

/**
 * L'horodatage `0:42 / 9:56`. Aucune prop, comme les autres contrôles.
 *
 * Pas de région live : une annonce par seconde rendrait le lecteur d'écran
 * inutilisable. Le texte se lit quand on vient le chercher, et c'est le
 * scrubber qui annonce la position quand on la change.
 */
export const TimeDisplay = memo(function TimeDisplay() {
  const { time } = useControlsOptions();
  const current = usePlayheadValue(selectDisplayedSecond);
  const duration = usePlayerValue(selectDuration);

  if (!time.enabled) return null;

  // En direct, la durée vaut `Infinity` ; avant les métadonnées, zéro. Dans les
  // deux cas il n'y a pas de total à afficher, seulement le temps courant.
  const hasDuration = Number.isFinite(duration) && duration > 0;

  return (
    <span
      data-slot="video-player-time"
      // Des chiffres, comme le scrubber qu'il accompagne : ils se lisent de
      // gauche à droite dans toutes les langues. Sans ça, l'algorithme bidi
      // d'un projet RTL affiche `9:56 / 0:00`.
      dir="ltr"
      // `tabular-nums` : sans chiffres à chasse fixe, le texte change de
      // largeur à chaque seconde et vibre sous les yeux.
      className="mx-2 text-sm whitespace-nowrap tabular-nums"
    >
      {/* Deux écritures, une pour chaque canal. Lu tel quel, `9:56` devient
          « neuf deux-points cinquante-six », ou une heure de la journée : les
          yeux reçoivent la forme compacte, le lecteur d'écran la forme parlée.
          Aucune des deux n'est une région live, le texte se lit quand on vient
          le chercher. */}
      <span aria-hidden="true">
        {formatTime(current, duration)}
        {hasDuration && ` / ${formatTime(duration, duration)}`}
      </span>
      <span className="sr-only">
        {hasDuration
          ? `${formatSpokenTime(current)} of ${formatSpokenTime(duration)}`
          : formatSpokenTime(current)}
      </span>
    </span>
  );
});
