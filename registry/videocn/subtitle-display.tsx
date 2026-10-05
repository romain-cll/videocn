"use client";

import { useLayoutEffect, useRef } from "react";

import { useControlsOptions } from "./controls-context";
import { usePlayerValue } from "./player-context";

/**
 * Le calque des sous-titres : dessine `subtitleText` dans le conteneur du
 * lecteur, ce qui le fait vivre en plein écran du conteneur.
 *
 * La piste active est en `hidden` : le navigateur émet les répliques, et ce
 * calque est seul à les dessiner. Le seul cas où le rendu est celui du système
 * est le plein écran natif de l'iPhone, où le conteneur n'est plus affiché.
 *
 * **Placement.** Posé sous la barre, en bas du conteneur, il remonte de la
 * hauteur de la barre moins son `padding-top` — le dégradé — quand elle est
 * visible : le texte reste au-dessus du haut du scrubber, et le dégradé passe
 * derrière. Un `ResizeObserver` écrit cette hauteur dans
 * `--player-subtitles-offset`. Quand la barre se masque (`data-hidden` sur le
 * conteneur, repère `group/player`), il redescend en bas, au rythme du fondu de
 * la barre. Sans barre (`visibility: "never"`), il n'y a rien à mesurer et il
 * reste en bas.
 *
 * Le couplage avec `player-controls.tsx` est réel : on suppose son `data-slot`,
 * et que son `padding-top` soit le dégradé. Restructurer la barre casserait le
 * placement sans une erreur. Le commentaire correspondant est de l'autre côté.
 *
 * **Apparence.** Sur un îlot `dark` comme la barre, chaque ligne est posée sur
 * un fond tiré des tokens du thème, et le rayon suit celui de l'hôte. La taille
 * du texte est proportionnelle à la largeur du calque. Les réglages `line`,
 * `position` et `align` du fichier sont ignorés : les répliques sont centrées.
 *
 * `aria-hidden` : le rendu natif n'est pas exposé aux lecteurs d'écran non plus.
 */
export function SubtitleDisplay() {
  const text = usePlayerValue((state) => state.subtitleText);
  const { visibility } = useControlsOptions();
  const layerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const controls = layer.parentElement?.querySelector<HTMLElement>(
      '[data-slot="video-player-controls"]',
    );
    // Pas de barre : le calque reste en bas, la variable n'est jamais écrite.
    if (!controls) return;

    const measure = () => {
      // Le `padding-top` de la barre est son dégradé : ce qui reste, c'est la
      // hauteur du contenu, dont le premier élément est le scrubber.
      const gradient = parseFloat(getComputedStyle(controls).paddingTop) || 0;
      layer.style.setProperty(
        "--player-subtitles-offset",
        `${Math.max(controls.offsetHeight - gradient, 0)}px`,
      );
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(controls);
    return () => {
      observer.disconnect();
      layer.style.removeProperty("--player-subtitles-offset");
    };
  }, [visibility]);

  return (
    <div
      ref={layerRef}
      data-slot="video-player-subtitles"
      aria-hidden="true"
      // Sur une seule ligne : la conversion RTL du CLI shadcn ajoute un `\` en
      // fin de chaque ligne d'une chaîne de classes, et les classes touchées
      // meurent. `@container` : c'est le repère des `cqw` du texte. Pas de
      // `z-index` : positionné après la vidéo, il passe dessus, et la barre
      // (`z-10`) passe dessus.
      className="@container dark pointer-events-none absolute inset-x-0 bottom-[var(--player-subtitles-offset,0px)] px-4 pb-3 text-center transition-[bottom] duration-200 group-data-hidden/player:bottom-0 motion-reduce:transition-none"
    >
      {text ? (
        // `span` en ligne et `box-decoration-clone` : chaque ligne, y compris
        // celles qu'un retour à la ligne automatique crée, a son fond, ses
        // marges et ses coins arrondis. `whitespace-pre-line` honore les `\n`
        // entre répliques.
        <span className="rounded-sm bg-background/80 px-1.5 text-[length:clamp(0.875rem,2.5cqw,2.5rem)] leading-normal whitespace-pre-line text-foreground box-decoration-clone">
          {text}
        </span>
      ) : null}
    </div>
  );
}
