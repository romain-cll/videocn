"use client";

import { memo } from "react";

/**
 * Le bouton CC de la barre : active ou coupe les sous-titres.
 *
 * Rôle final :
 * - un `Button` en `ghost` et `icon`, avec `CaptionsIcon` ;
 * - `aria-label="Subtitles"` fixe, `aria-pressed` pour l'état et
 *   `aria-keyshortcuts="c"` quand les raccourcis sont actifs : le libellé ne
 *   change pas, c'est l'état pressé qui dit si les sous-titres sont actifs ;
 * - actif, une barre `bg-primary` sous l'icône ;
 * - il allume la piste de `pickSubtitleToEnable`, et rend `null` sans pistes ou
 *   avec `controls.subtitles: false`.
 *
 * Pour l'instant, un bouchon.
 */
export const SubtitlesToggle = memo(function SubtitlesToggle() {
  return null;
});
