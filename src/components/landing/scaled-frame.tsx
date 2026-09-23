"use client";

/**
 * Rend son contenu à une largeur de bureau, puis le réduit à la taille de la
 * carte, comme une capture d'écran.
 *
 * Les exemples s'adaptent à leur conteneur : dans une carte de 800 px, la page
 * vidéo empilerait ses suggestions sous le lecteur. Rendue à 1120 px puis
 * réduite, elle garde sa mise en page de bureau.
 *
 * L'échelle passe par une variable CSS posée depuis l'effet, jamais par un
 * style inline en JSX. Sous `MIN_SCALED_WIDTH`, réduire rendrait tout
 * illisible : le contenu est alors rendu tel quel, en mise en page étroite.
 */

import { useLayoutEffect, useRef } from "react";

const VIRTUAL_WIDTH = 1120;
const MIN_SCALED_WIDTH = 640;

export function ScaledFrame({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const scaled = width >= MIN_SCALED_WIDTH && width < VIRTUAL_WIDTH;
      frame.toggleAttribute("data-scaled", scaled);
      frame.style.setProperty("--frame-scale", scaled ? String(width / VIRTUAL_WIDTH) : "1");
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="group/frame size-full overflow-hidden">
      <div className="origin-top-left group-data-scaled/frame:w-[1120px] group-data-scaled/frame:scale-(--frame-scale)">
        {children}
      </div>
    </div>
  );
}
