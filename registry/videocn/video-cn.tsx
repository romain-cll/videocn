"use client";

import { useCallback, useEffect, useRef, type Ref } from "react";

import { cn } from "@/lib/utils";

import { PlayerProvider } from "./player-context";
import type { SourceType } from "./player-engine";
import { usePlayer } from "./use-player";

export interface VideoCnProps {
  src: string;
  /**
   * Échappement pour les URL signées, sans extension ou trompeuses, que la
   * détection automatique ne saurait pas lire.
   */
  type?: SourceType;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  /**
   * Volume de départ, entre 0 et 1. Valeur *initiale* : le lecteur détient son
   * volume et le garde. Repasser une autre valeur ensuite ne le repilote pas.
   */
  defaultVolume?: number;
  defaultMuted?: boolean;
  className?: string;
  /** Transmis à l'élément `<video>` interne. */
  ref?: Ref<HTMLVideoElement>;
}

/**
 * Le composant racine. Il détient l'état, le distribue, et rend le conteneur
 * dans lequel vivront les contrôles.
 *
 * Il n'accepte pas de `children` : la barre est toujours la nôtre. Qui veut la
 * changer édite le code qu'il a reçu — c'est le modèle shadcn, et la raison
 * pour laquelle chaque contrôle est un fichier à part.
 */
export function VideoCn({
  src,
  type,
  poster,
  autoPlay,
  loop,
  defaultVolume,
  defaultMuted,
  className,
  ref,
}: VideoCnProps) {
  // Le plein écran est demandé sur le conteneur, pas sur le `<video>` : sinon
  // les contrôles, qui sont à côté de la vidéo et non dedans, disparaîtraient.
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const player = usePlayer(videoRef, {
    src,
    type,
    defaultVolume,
    defaultMuted,
    containerRef,
  });

  // La ref du consommateur passe par une ref à nous, jamais par les
  // dépendances : une callback ref écrite en ligne change à chaque rendu, et
  // React détacherait puis rattacherait l'élément à chaque changement d'état.
  const forwardedRef = useRef(ref);
  useEffect(() => {
    forwardedRef.current = ref;
  }, [ref]);

  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    const forwarded = forwardedRef.current;
    if (typeof forwarded === "function") {
      forwarded(node);
    } else if (forwarded) {
      forwarded.current = node;
    }
  }, []);

  return (
    <PlayerProvider value={player}>
      <div
        ref={containerRef}
        className={cn(
          "bg-background relative isolate overflow-hidden rounded-lg border",
          className,
        )}
      >
        <video
          ref={attachVideo}
          // `src` n'est volontairement pas posé ici : c'est le moteur qui
          // charge la source, et deux écritures concurrentes sur la même
          // propriété rechargeraient la vidéo à chaque rendu.
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          // Sans `playsInline`, l'iPhone bascule en plein écran natif dès la
          // lecture et toute notre interface disparaît.
          playsInline
          // Assez pour connaître la durée, que le scrubber exige, sans tirer la
          // vidéo entière à ceux qui ne la liront pas.
          preload="metadata"
          // Phase 0 : les contrôles natifs du navigateur tiennent la place. La
          // barre de la phase 1 les remplacera, ici même.
          controls
          className="block h-auto w-full"
        />
      </div>
    </PlayerProvider>
  );
}
