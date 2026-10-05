"use client";

import { useMemo } from "react";

import type { PlayerStateStore } from "./player-state-store";
import type { PlayerActions } from "./use-player";
import type { SubtitleTrack } from "./subtitles";

/**
 * Les sous-titres, entre l'élément `<video>` et le store. Appelé par
 * `usePlayer`, qui en reprend les deux actions.
 *
 * Rôle final : l'élément a raison. Les actions écrivent `track.mode` sur nos
 * `TextTrack` et s'arrêtent là ; une fonction `sync()` fait suivre le store à
 * l'élément — `change`, `addtrack` et `removetrack` sur `video.textTracks`,
 * `webkitbeginfullscreen` et `webkitendfullscreen`, et la fin de chaque action.
 * Elle :
 * - prend pour active notre piste `showing`, à défaut notre piste `hidden` ;
 * - force à `disabled` nos autres pistes (une seule affichée à la fois) et toute
 *   piste `subtitles` ou `captions` qui n'est pas à nous, comme celles que le
 *   HLS natif de Safari embarque ;
 * - publie `activeSubtitle` et retient la dernière piste active, pour que le
 *   bouton CC sache laquelle rallumer (`pickSubtitleToEnable`) ;
 * - rebranche `cuechange` vers `subtitleText` ;
 * - applique la piste `default` au premier passage qui voit nos pistes, et
 *   fait passer la piste active en `showing` pendant le plein écran natif de
 *   l'iPhone, seul cas où le rendu est celui du système.
 *
 * Il publie aussi la liste normalisée (`resolveSubtitles`, à référence stable
 * d'après `signSubtitles`) dans `PlayerState.subtitles`. Rien ne dépend du
 * moteur : Shaka garde `manifest.disableText`.
 *
 * Pour l'instant, un bouchon : les actions n'ont aucun effet.
 */

export interface UseSubtitlesOptions {
  /** L'élément `<video>`, `null` tant qu'il n'est pas monté. */
  video: HTMLVideoElement | null;
  store: PlayerStateStore;
  /** La prop de l'intégrateur, brute : c'est ce hook qui la normalise. */
  subtitles: readonly SubtitleTrack[] | undefined;
}

export type UseSubtitlesResult = Pick<PlayerActions, "selectSubtitles" | "toggleSubtitles">;

export function useSubtitles(options: UseSubtitlesOptions): UseSubtitlesResult {
  // Bouchon : les options ne servent pas encore.
  void options;

  // Stables pour la vie du composant, comme toutes les actions du lecteur.
  return useMemo(
    () => ({
      selectSubtitles: () => undefined,
      toggleSubtitles: () => undefined,
    }),
    [],
  );
}
