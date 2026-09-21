"use client";

import { memo } from "react";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useControlsOptions } from "./controls-context";
import { usePlayerActions, usePlayerState } from "./player-context";

/**
 * Indisponible, le bouton passe `disabled` — il n'est jamais démonté. C'est la
 * règle du sélecteur de qualité grisé, appliquée ici : un contrôle qui
 * disparaît déplace tous les autres et laisse croire à une panne.
 */
export const FullscreenToggle = memo(function FullscreenToggle() {
  const { fullscreen } = useControlsOptions();
  const { canFullscreen, isFullscreen } = usePlayerState();
  const { toggleFullscreen } = usePlayerActions();

  if (!fullscreen.enabled) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!canFullscreen}
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
    </Button>
  );
});
