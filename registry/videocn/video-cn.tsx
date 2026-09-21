"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from "react";

/**
 * `cn` vient du paquet npm et non de l'alias `utils` : `lib/utils.ts` n'est plus
 * qu'une réexportation chez shadcn, les primitives générées importent déjà
 * depuis `"cn"`, et rien ne garantit que le fichier existe chez le consommateur
 * — vérifié en le retirant d'un projet de test, l'installation n'en dit rien.
 */
import { cn } from "cn";

import { ControlsProvider } from "./controls-context";
import { resolveControlsOptions, type ControlsOptions } from "./controls-options";
import { PlayerControls } from "./player-controls";
import { PlayerProvider, usePlayerStoreValue } from "./player-context";
import type { SourceType } from "./player-engine";
import { useControlsVisibility } from "./use-controls-visibility";
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
  /** Ce que la barre affiche et comment elle se comporte. Voir `ControlsOptions`. */
  controls?: ControlsOptions;
  className?: string;
  /** Transmis à l'élément `<video>` interne. */
  ref?: Ref<HTMLVideoElement>;
}

/**
 * Un clic bascule la lecture, un double-clic le plein écran : le premier doit
 * donc attendre de savoir s'il est seul. Ce délai est la rançon du geste — trop
 * court, le double-clic lance aussi la lecture ; trop long, le clic traîne.
 */
const DOUBLE_CLICK_WINDOW = 250;

/**
 * Le composant racine. Il détient l'état, le distribue, et rend le conteneur
 * dans lequel vivent les contrôles.
 *
 * Il n'accepte pas de `children` : la barre est toujours la nôtre, et c'est aux
 * props de la piloter. Le lecteur s'installe et fonctionne — masquer un
 * contrôle ou changer un comportement doit rester une prop, jamais une
 * modification à faire à la main dans le code livré. Le découpage en un fichier
 * par contrôle est là pour la lisibilité, pas pour sous-traiter le travail.
 */
export function VideoCn({
  src,
  type,
  poster,
  autoPlay,
  loop,
  defaultVolume,
  defaultMuted,
  controls,
  className,
  ref,
}: VideoCnProps) {
  // Le plein écran est demandé sur le conteneur, pas sur le `<video>` : sinon
  // les contrôles, qui sont à côté de la vidéo et non dedans, disparaîtraient.
  const containerRef = useRef<HTMLDivElement>(null);

  const player = usePlayer({
    src,
    type,
    defaultVolume,
    defaultMuted,
    containerRef,
  });

  const { actions } = player;
  const paused = usePlayerStoreValue(player.store, (state) => state.paused);
  const isFullscreen = usePlayerStoreValue(player.store, (state) => state.isFullscreen);
  const { togglePlay, toggleFullscreen } = actions;

  // Résolue une fois : l'objet part dans un contexte, et en fabriquer un
  // nouveau à chaque rendu re-rendrait tous les contrôles pour rien.
  const controlsOptions = useMemo(() => resolveControlsOptions(controls), [controls]);

  const { visible, holdVisible } = useControlsVisibility({
    containerRef,
    paused,
    visibility: controlsOptions.visibility,
    autoHideDelay: controlsOptions.autoHideDelay,
  });

  // La ref du consommateur passe par une ref à nous, jamais par les
  // dépendances : une callback ref écrite en ligne change à chaque rendu, et
  // React détacherait puis rattacherait l'élément à chaque changement d'état.
  const forwardedRef = useRef(ref);
  useEffect(() => {
    forwardedRef.current = ref;
  }, [ref]);

  const attachPlayerVideo = player.ref;
  const attachVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      attachPlayerVideo(node);
      const forwarded = forwardedRef.current;
      if (typeof forwarded === "function") {
        forwarded(node);
      } else if (forwarded) {
        forwarded.current = node;
      }
    },
    [attachPlayerVideo],
  );

  /**
   * Les deux gestes sur l'image. Ils sont posés sur le `<video>` et non sur le
   * conteneur : sur le conteneur, un clic dans la barre déclencherait la
   * lecture.
   *
   * Réservés à la souris. Au doigt, un appui bascule déjà la barre — la seule
   * façon de la faire disparaître sans survol — et lui faire aussi mettre la
   * vidéo en pause donnerait deux effets pour un geste.
   */
  const pointerTypeRef = useRef("mouse");
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLVideoElement>) => {
    pointerTypeRef.current = event.pointerType;
  }, []);

  const handleClick = useCallback(() => {
    if (pointerTypeRef.current !== "mouse") return;
    // Le deuxième clic d'un double-clic ne réarme rien : le minuteur en cours
    // sera annulé par le `dblclick` qui suit.
    if (clickTimerRef.current !== null) return;
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      togglePlay();
    }, DOUBLE_CLICK_WINDOW);
  }, [togglePlay]);

  const handleDoubleClick = useCallback(() => {
    if (pointerTypeRef.current !== "mouse") return;
    if (clickTimerRef.current !== null) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    toggleFullscreen();
  }, [toggleFullscreen]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current !== null) clearTimeout(clickTimerRef.current);
    };
  }, []);

  // `""` plutôt que `"true"` : seule la présence de l'attribut compte pour les
  // variantes Tailwind, et `undefined` le retire vraiment du DOM.
  const fullscreenAttribute = isFullscreen ? "" : undefined;
  const hiddenAttribute = visible ? undefined : "";

  return (
    <PlayerProvider value={player}>
      <div
        ref={containerRef}
        data-fullscreen={fullscreenAttribute}
        // Le curseur se masque avec la barre, et pour la même raison : plus
        // rien ne doit flotter au-dessus de l'image.
        data-hidden={hiddenAttribute}
        className={cn(
          // Le cadre du lecteur est noir, pas thématique : en plein écran,
          // une vidéo moins haute que l'écran laisse voir ses bandes, et du
          // blanc y serait aveuglant. Un token, jamais une couleur en dur.
          "bg-player-backdrop relative isolate overflow-hidden rounded-lg border",
          // En plein écran, le conteneur occupe l'écran entier : sans ça la
          // vidéo reste collée en haut d'un cadre arrondi et bordé.
          "data-fullscreen:flex data-fullscreen:h-full data-fullscreen:items-center data-fullscreen:justify-center data-fullscreen:rounded-none data-fullscreen:border-0",
          "data-hidden:cursor-none",
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
          data-fullscreen={fullscreenAttribute}
          // Ni `role` ni `tabIndex` : l'équivalent clavier de ces gestes passe
          // par les boutons de la barre, qui sont déjà dans l'ordre de
          // tabulation. Un second point focalisable ne ferait qu'allonger le
          // parcours sans rien apporter.
          onPointerDown={handlePointerDown}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className="block h-auto w-full data-fullscreen:h-full data-fullscreen:object-contain"
        />
        <ControlsProvider options={controlsOptions} visible={visible} holdVisible={holdVisible}>
          <PlayerControls />
        </ControlsProvider>
      </div>
    </PlayerProvider>
  );
}
