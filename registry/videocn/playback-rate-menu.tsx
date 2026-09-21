"use client";

import { memo, type ReactElement } from "react";
import { GaugeIcon } from "lucide-react";

import { useControlsOptions } from "./controls-context";
import { usePlayerActions, usePlayerValue } from "./player-context";
import {
  PlayerMenu,
  PlayerMenuContent,
  PlayerMenuRadioItem,
  PlayerMenuTrigger,
} from "./player-menu";

/**
 * Point décimal et signe « × », quelle que soit la locale du navigateur : la
 * vitesse n'est pas une mesure mais une étiquette, et `0,5×` à côté de `1×`
 * dans la même liste donnerait deux écritures pour une même idée. Le `×` plutôt
 * que la lettre `x` parce qu'un lecteur d'écran le dit « times ».
 */
function formatRate(rate: number): string {
  return `${rate}×`;
}

/**
 * Aucune prop : le contrôle lit ses options et son état dans les contextes, et
 * se rend `null` si la barre ne veut pas de lui. C'est ce qui permet de
 * l'ajouter à la barre sans rien avoir à lui transmettre.
 */
export const PlaybackRateMenu = memo(function PlaybackRateMenu(): ReactElement | null {
  const { playbackRate: rateOptions } = useControlsOptions();
  const playbackRate = usePlayerValue((state) => state.playbackRate);
  const { setPlaybackRate } = usePlayerActions();

  if (!rateOptions.enabled) return null;

  const label = formatRate(playbackRate);

  return (
    <PlayerMenu>
      {/* Le libellé visible est repris dans le nom accessible — et non
          remplacé : ce que l'utilisateur lit doit être ce qu'il peut dire. */}
      <PlayerMenuTrigger aria-label={`Playback speed, ${label}`}>
        <GaugeIcon />
        {/* `dir="ltr"` sur le nombre seul, comme l'horodatage : sous une page
            RTL, l'algorithme bidi afficherait `×1` au lieu de `1×`. Le bouton,
            lui, garde la direction de la page. */}
        <span dir="ltr">{label}</span>
      </PlayerMenuTrigger>
      <PlayerMenuContent>
        {rateOptions.rates.map((rate) => (
          <PlayerMenuRadioItem
            key={rate}
            // Rien n'oblige la vitesse courante à figurer dans la liste — la
            // vidéo peut arriver avec la sienne. Aucun item n'est alors coché,
            // et le menu s'ouvre sur le premier : c'est le bon repli.
            checked={rate === playbackRate}
            onSelect={() => setPlaybackRate(rate)}
          >
            <span dir="ltr">{formatRate(rate)}</span>
          </PlayerMenuRadioItem>
        ))}
      </PlayerMenuContent>
    </PlayerMenu>
  );
});
