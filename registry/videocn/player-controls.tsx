"use client";

import { useState, type ReactElement } from "react";

import { useControlsOptions, useControlsVisible, useHoldControlsVisible } from "./controls-context";
import { FullscreenToggle } from "./fullscreen-toggle";
import { PictureInPictureToggle } from "./picture-in-picture-toggle";
import { PlaybackRateMenu } from "./playback-rate-menu";
import { PlayToggle } from "./play-toggle";
import { VolumeControl } from "./volume-control";

/**
 * La barre. Elle ne prend aucune prop et ne pilote aucun contrôle : chacun lit
 * le contexte et décide seul de s'afficher. Ajouter un contrôle, c'est ajouter
 * une ligne ici et un fichier à côté.
 */
export function PlayerControls(): ReactElement | null {
  const { visibility } = useControlsOptions();
  const visible = useControlsVisible();

  // La souris posée sur la barre l'empêche de disparaître. Le verrou passe par
  // un état plutôt que par deux appels directs : c'est ce que
  // `useHoldControlsVisible` attend, et le nettoyage de l'effet garantit la
  // libération même si le `pointerleave` n'arrive jamais — démontage, passage
  // en plein écran, onglet quitté.
  const [hovered, setHovered] = useState(false);
  useHoldControlsVisible(hovered);

  if (visibility === "never") return null;

  return (
    <div
      data-slot="video-player-controls"
      // `group` et non `toolbar` : un toolbar impose une navigation aux
      // flèches, qui entrerait en collision frontale avec la keymap du lecteur
      // (`←`/`→` pour se déplacer, `↑`/`↓` pour le volume).
      role="group"
      aria-label="Player controls"
      // Masquée en opacité seulement — jamais `hidden`, `inert` ni
      // `aria-hidden` : la barre doit rester atteignable à la tabulation.
      // Le masquage est conditionné à `not-focus-within` plutôt que corrigé
      // par une paire `focus-within:*` : à spécificité égale, c'est l'ordre
      // de génération qui tranche, et `data-hidden` sort après. La barre
      // revient donc dès la frame où le focus arrive, avant tout rendu React.
      data-hidden={visible ? undefined : ""}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      // `dark` est délibéré : un voile est toujours sombre, et le `ghost` du
      // `Button` donnerait sinon du texte sombre sur fond sombre en thème
      // clair. La barre est un îlot qui résout ses tokens sur la palette
      // sombre *de l'utilisateur*, sans une seule couleur en dur.
      className="dark absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-linear-to-t
             from-player-scrim to-transparent px-3 pt-10 pb-3 text-foreground
             transition-opacity duration-200 motion-reduce:transition-none
             data-hidden:not-focus-within:pointer-events-none
             data-hidden:not-focus-within:opacity-0"
    >
      {/* Phase 2 : <PlayerScrubber /> prend cette première rangée. */}
      <div className="flex items-center gap-1">
        <PlayToggle />
        <VolumeControl />
        <div className="ml-auto flex items-center gap-1">
          <PlaybackRateMenu />
          <PictureInPictureToggle />
          <FullscreenToggle />
        </div>
      </div>
    </div>
  );
}
