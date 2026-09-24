"use client";

import { memo, type ReactElement } from "react";
import { SettingsIcon } from "lucide-react";

import { useControlsOptions } from "./controls-context";
import { usePlayerActions, usePlayerValue } from "./player-context";
import {
  PlayerMenu,
  PlayerMenuContent,
  PlayerMenuRadioItem,
  PlayerMenuTrigger,
} from "./player-menu";
import type { PlayerState } from "./player-state-store";

/**
 * Le sélecteur de qualité. Il ne connaît pas Shaka : il lit les capacités du
 * moteur, quel qu'il soit, et n'affiche que ce qu'elles contiennent.
 *
 * **Le bouton reste affiché quand le moteur n'expose aucune qualité**, et passe
 * `disabled` — c'est le cas d'un MP4 progressif, où le navigateur ne dit rien
 * du contenu du fichier. Un contrôle qui disparaît déplace tous les autres et
 * laisse croire à une panne ; grisé, il dit qu'il n'y a rien à choisir ici.
 */

/** Le libellé du choix automatique, seul ou suivi de ce qui est joué. */
const AUTO = "Auto";

function selectCapabilities(state: PlayerState) {
  return state.capabilities;
}

export const QualityMenu = memo(function QualityMenu(): ReactElement | null {
  const { quality: qualityOptions } = useControlsOptions();
  const capabilities = usePlayerValue(selectCapabilities);
  const { selectQuality } = usePlayerActions();

  if (!qualityOptions.enabled) return null;

  const { qualities, activeQualityId, playingQualityId } = capabilities;
  const playing = qualities.find((level) => level.id === playingQualityId);
  const selected = qualities.find((level) => level.id === activeQualityId);

  // En automatique, le bouton dit « Auto » et pas la hauteur jouée : elle
  // change toute seule, et un bouton dont le libellé bouge pendant qu'on le
  // regarde donne l'impression d'avoir cliqué. La hauteur est dans le menu.
  const label = selected?.label ?? AUTO;

  return (
    <PlayerMenu>
      <PlayerMenuTrigger
        aria-label={`Quality, ${label}`}
        // Vide, il n'y a rien à choisir : le moteur natif n'expose aucune piste.
        disabled={qualities.length === 0}
      >
        <SettingsIcon />
        <span dir="ltr">{label}</span>
      </PlayerMenuTrigger>
      <PlayerMenuContent>
        <PlayerMenuRadioItem
          checked={activeQualityId === null}
          onSelect={() => selectQuality(null)}
        >
          {/* « Auto (720p) » : ce que l'adaptatif a choisi en ce moment. C'est
              la seule façon de savoir ce qu'on regarde sans quitter l'auto. */}
          <span dir="ltr">{playing ? `${AUTO} (${playing.label})` : AUTO}</span>
        </PlayerMenuRadioItem>
        {qualities.map((level) => (
          <PlayerMenuRadioItem
            key={level.id}
            checked={level.id === activeQualityId}
            onSelect={() => selectQuality(level.id)}
          >
            <span dir="ltr">{level.label}</span>
          </PlayerMenuRadioItem>
        ))}
      </PlayerMenuContent>
    </PlayerMenu>
  );
});
