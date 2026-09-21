"use client";

import { memo, useEffect, useMemo, useRef } from "react";

import { useControlsOptions } from "./controls-context";
import { DEFAULT_SEEK_STEP } from "./controls-options";
import { formatSpokenTime } from "./format-time";
import { usePlayerValue, usePlayheadStore, usePlayheadValue } from "./player-context";
import {
  PlayerSlider,
  PlayerSliderRange,
  PlayerSliderTrack,
  type SliderPosition,
} from "./player-slider";
import { displayedTime } from "./playhead-store";
import { useScrub } from "./use-scrub";

/**
 * Le scrubber : le curseur partagé, branché sur la tête de lecture et sur
 * `useScrub`, avec l'aperçu du buffer. Aucune prop, comme les autres contrôles.
 *
 * Il ne se re-rend qu'une fois par seconde de média, pour l'ARIA. Tout ce qui
 * bouge plus vite — la position, le buffer — est écrit hors de React, en
 * propriétés CSS, chacune par un seul écrivain : le curseur pour sa fraction,
 * ce composant pour les bornes du buffer.
 */

const BUFFER_START_PROPERTY = "--player-buffer-start";
const BUFFER_END_PROPERTY = "--player-buffer-end";

/** Un instant rapporté à la durée. Durée nulle ou non finie : zéro, rien de travers. */
function toFraction(time: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  const fraction = time / duration;
  if (!Number.isFinite(fraction)) return 0;
  return Math.min(Math.max(fraction, 0), 1);
}

export const PlayerScrubber = memo(function PlayerScrubber() {
  const { scrubber } = useControlsOptions();
  // La seconde entière et non le temps exact : un rendu par seconde de média,
  // pas soixante. Elle ne sert qu'à l'annonce ; le dessin passe par `position`.
  const second = usePlayheadValue((snapshot) => Math.floor(displayedTime(snapshot)));
  const duration = usePlayerValue((state) => state.duration);
  const playhead = usePlayheadStore();
  const onValueChange = useScrub();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // `displayedTime` et non `currentTime` : pendant un glissement, le store
  // porte la position du doigt, et tout ce qui la lit la suit.
  const position = useMemo<SliderPosition>(
    () => ({
      subscribe: playhead.subscribe,
      getValue: () => displayedTime(playhead.getSnapshot()),
    }),
    [playhead],
  );

  const enabled = scrubber.enabled;

  // Le buffer, par abonnement et jamais par un rendu : la plage chargée grossit
  // au fil des `progress`, et chaque pas re-rendrait le scrubber pour rien.
  // Écrit sur l'enveloppe et non sur la racine du curseur, qui a déjà son
  // écrivain : les variables descendent par cascade, et chaque élément garde au
  // plus un écrivain impératif.
  useEffect(() => {
    if (!enabled) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // `NaN` au départ : la première comparaison échoue toujours, donc la
    // première écriture a lieu.
    let paintedStart = Number.NaN;
    let paintedEnd = Number.NaN;

    const paintBuffer = () => {
      const { bufferedStart, bufferedEnd } = playhead.getSnapshot();
      const start = toFraction(bufferedStart, duration);
      // Jamais de largeur négative, même si les deux bornes se croisent le
      // temps d'une mesure.
      const end = Math.max(toFraction(bufferedEnd, duration), start);
      if (start !== paintedStart) {
        paintedStart = start;
        wrapper.style.setProperty(BUFFER_START_PROPERTY, String(start));
      }
      if (end !== paintedEnd) {
        paintedEnd = end;
        wrapper.style.setProperty(BUFFER_END_PROPERTY, String(end));
      }
    };

    paintBuffer();
    return playhead.subscribe(paintBuffer);
  }, [duration, enabled, playhead]);

  if (!enabled) return null;

  const finite = Number.isFinite(duration) && duration > 0;

  // « 42 seconds of 9 minutes 56 seconds ». Sans durée connue — un direct —,
  // la position seule : « of 0 seconds » serait faux.
  const getValueText = (value: number) =>
    finite ? `${formatSpokenTime(value)} of ${formatSpokenTime(duration)}` : formatSpokenTime(value);

  return (
    <div ref={wrapperRef} data-slot="video-player-scrubber">
      <PlayerSlider
        aria-label="Seek"
        min={0}
        max={duration}
        value={second}
        position={position}
        step={DEFAULT_SEEK_STEP}
        // Un dixième de la vidéo, jamais moins qu'une flèche. Fini même quand
        // la durée ne l'est pas : `PageUp` ne doit pas envoyer à l'infini.
        pageStep={finite ? Math.max(duration * 0.1, DEFAULT_SEEK_STEP) : DEFAULT_SEEK_STEP}
        getValueText={getValueText}
        disabled={!finite}
        onValueChange={onValueChange}
      >
        <PlayerSliderTrack>
          {/* Avant la partie jouée, pour passer dessous. */}
          <div
            data-slot="video-player-scrubber-buffer"
            className="absolute inset-y-0 left-[calc(var(--player-buffer-start,0)*100%)] w-[calc((var(--player-buffer-end,0)_-_var(--player-buffer-start,0))*100%)] bg-foreground/40"
          />
          <PlayerSliderRange />
        </PlayerSliderTrack>
      </PlayerSlider>
    </div>
  );
});
