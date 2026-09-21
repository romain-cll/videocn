"use client";

import { createNativeEngine } from "./native-engine";
import type { PlayerEngine, SourceType } from "./player-engine";

/**
 * Le seul endroit où un moteur est choisi, et le seul qui connaisse les
 * implémentations. `player-engine.ts` reste un contrat sans aucun import :
 * c'est ce qui permet à chaque moteur de l'importer sans fermer de cycle.
 */

/**
 * Détection par l'extension. Elle se trompe sur les URL signées, sans extension
 * ou trompeuses : c'est à ça que sert la prop d'échappement `type`, qui la
 * court-circuite.
 */
export function detectSourceType(src: string): SourceType {
  const path = src.split(/[?#]/)[0].toLowerCase();
  if (path.endsWith(".m3u8")) return "hls";
  if (path.endsWith(".mpd")) return "dash";
  return "native";
}

/**
 * Phase 0 : seule l'implémentation native existe, elle sert donc tout, y
 * compris le HLS que Safari lit nativement. Shaka prendra sa place ici sans que
 * le reste du lecteur bouge.
 */
export function resolveEngine(src: string, type?: SourceType): PlayerEngine {
  return createNativeEngine(type ?? detectSourceType(src));
}
