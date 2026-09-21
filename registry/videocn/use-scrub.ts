"use client";

import { useCallback } from "react";

import type { SliderChangeReason } from "./player-slider";

/**
 * CONTRAT DE LA PHASE 2 — signature définitive, implémentation provisoire.
 *
 * Le protocole glissement → vidéo : pause au premier vrai déplacement,
 * recherches limitées pendant le geste, recherche finale exacte, reprise si la
 * vidéo tournait, et retour au point de départ sur `cancel`.
 *
 * Renvoie un gestionnaire de référence stable, à passer tel quel au
 * `onValueChange` du curseur.
 */
export function useScrub(): (value: number, reason: SliderChangeReason) => void {
  return useCallback(() => {}, []);
}
