"use client";

import { memo } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useControlsOptions } from "./controls-context";
import { usePlayerActions, usePlayerState } from "./player-context";

/**
 * Un seul bouton, dont le libellé change — et pas d'`aria-pressed`. « Pause »
 * décrit ce que le bouton va faire ; un état pressé décrirait ce qu'il est, et
 * les deux ensemble se contredisent à l'oreille : « Pause, activé ».
 */
export const PlayToggle = memo(function PlayToggle() {
  const { play } = useControlsOptions();
  const { paused } = usePlayerState();
  const { togglePlay } = usePlayerActions();

  if (!play.enabled) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={togglePlay}
      aria-label={paused ? "Play" : "Pause"}
    >
      {paused ? <PlayIcon /> : <PauseIcon />}
    </Button>
  );
});
