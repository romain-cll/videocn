"use client";

import { memo } from "react";
import { Volume1Icon, Volume2Icon, VolumeXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import { useControlsOptions } from "./controls-context";
import { usePlayerActions, usePlayerState } from "./player-context";

/**
 * `Slider` n'expose pas la même signature selon que le projet est en `radix`
 * ou en `base` : le premier renvoie toujours `number[]`, le second renvoie le
 * type qu'on lui a passé. Passer un tableau et normaliser au retour rend le
 * composant identique dans les deux cas, sans code conditionnel.
 */
function firstValue(value: number | readonly number[]): number {
  return typeof value === "number" ? value : value[0];
}

export const VolumeControl = memo(function VolumeControl() {
  const { volume: volumeOptions } = useControlsOptions();
  const { volume, muted, canControlVolume } = usePlayerState();
  const { setVolume, setMuted, toggleMuted } = usePlayerActions();

  if (!volumeOptions.enabled) return null;

  const effectiveVolume = muted ? 0 : volume;
  const VolumeIcon =
    effectiveVolume === 0 ? VolumeXIcon : effectiveVolume < 0.5 ? Volume1Icon : Volume2Icon;

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={toggleMuted} aria-label={muted ? "Unmute" : "Mute"}>
        <VolumeIcon />
      </Button>
      <Slider
        value={[effectiveVolume]}
        onValueChange={(value) => {
          const next = firstValue(value);
          // Bouger le curseur depuis l'état muet rétablit le son.
          if (muted && next > 0) {
            setMuted(false);
          }
          setVolume(next);
        }}
        min={0}
        max={1}
        step={0.01}
        // Sur iPhone, Safari ignore les écritures sur `video.volume` : le
        // curseur mentirait. Le bouton muet, lui, fonctionne — il reste actif.
        disabled={!canControlVolume}
        aria-label="Volume"
        className="w-20"
      />
    </div>
  );
});
