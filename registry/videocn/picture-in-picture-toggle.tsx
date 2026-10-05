"use client";

import { memo } from "react";
import { PictureInPicture2Icon, PictureInPictureIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useControlsNarrow, useControlsOptions } from "./controls-context";
import { usePlayerActions, usePlayerValue } from "./player-context";

/**
 * Firefox n'implémente pas l'API standard et l'iPhone n'a pas de
 * Picture-in-Picture du tout : `canPictureInPicture` est faux plus souvent
 * qu'ailleurs. Le bouton reste là, grisé, comme les autres.
 *
 * Sous le seuil de 30rem (`useControlsNarrow`), il quitte la barre : une ligne
 * du menu de réglages le remplace, grisée dans les mêmes cas.
 */
export const PictureInPictureToggle = memo(function PictureInPictureToggle() {
  const { pictureInPicture } = useControlsOptions();
  const canPictureInPicture = usePlayerValue((state) => state.canPictureInPicture);
  const isPictureInPicture = usePlayerValue((state) => state.isPictureInPicture);
  const { togglePictureInPicture } = usePlayerActions();
  const narrow = useControlsNarrow();

  // Hors du DOM sous le seuil : ni visible, ni tabulable, ni annoncé.
  if (narrow || !pictureInPicture.enabled) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      // La garde CSS tient tant que la largeur n'est pas mesurée (rendu serveur,
      // hydratation). Même seuil que `time-display.tsx`, voir `player-controls.tsx`.
      className={narrow === null ? "@max-[30rem]:hidden" : undefined}
      disabled={!canPictureInPicture}
      onClick={togglePictureInPicture}
      aria-label={
        isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"
      }
    >
      {isPictureInPicture ? <PictureInPictureIcon /> : <PictureInPicture2Icon />}
    </Button>
  );
});
