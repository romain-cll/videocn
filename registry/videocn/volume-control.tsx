"use client";

import { Volume1Icon, Volume2Icon, VolumeXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/**
 * `Slider` n'expose pas la même signature selon que le projet est en `radix`
 * ou en `base` : le premier renvoie toujours `number[]`, le second renvoie le
 * type qu'on lui a passé. Passer un tableau et normaliser au retour rend le
 * composant identique dans les deux cas, sans code conditionnel.
 */
function firstValue(value: number | readonly number[]): number {
  return typeof value === "number" ? value : value[0];
}

export interface VolumeControlProps {
  /** Volume entre 0 et 1. */
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMutedChange: (muted: boolean) => void;
  className?: string;
}

export function VolumeControl({
  volume,
  muted,
  onVolumeChange,
  onMutedChange,
  className,
}: VolumeControlProps) {
  const effectiveVolume = muted ? 0 : volume;
  const VolumeIcon =
    effectiveVolume === 0 ? VolumeXIcon : effectiveVolume < 0.5 ? Volume1Icon : Volume2Icon;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onMutedChange(!muted)}
        aria-label={muted ? "Rétablir le son" : "Couper le son"}
      >
        <VolumeIcon />
      </Button>
      <Slider
        value={[effectiveVolume]}
        onValueChange={(value) => {
          const next = firstValue(value);
          // Bouger le curseur depuis l'état muet rétablit le son.
          if (muted && next > 0) {
            onMutedChange(false);
          }
          onVolumeChange(next);
        }}
        min={0}
        max={1}
        step={0.01}
        aria-label="Volume"
        className="w-20"
      />
    </div>
  );
}
