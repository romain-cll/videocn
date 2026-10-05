"use client";

/**
 * Le calque des sous-titres : dessine `subtitleText` dans le conteneur du
 * lecteur, ce qui le fait vivre en plein écran du conteneur.
 *
 * Rôle final :
 * - la piste active est en `hidden` : le navigateur émet les répliques, et ce
 *   calque est seul à les dessiner ;
 * - `absolute inset-x-0 pointer-events-none`, sous la barre, `aria-hidden` ;
 * - sa position verticale suit `--player-subtitles-offset`, qu'un
 *   `ResizeObserver` écrit depuis la hauteur de la barre
 *   (`[data-slot="video-player-controls"]`) moins son `padding-top`, soit le haut
 *   du scrubber ; il redescend en bas quand la barre se masque ;
 * - chaque ligne est posée sur un fond tiré des tokens, sur un îlot `dark` comme
 *   la barre, et la taille du texte est proportionnelle à la largeur.
 *
 * Il rend `null` quand il n'y a pas de texte. Pour l'instant, un bouchon.
 */
export function SubtitleDisplay() {
  return null;
}
