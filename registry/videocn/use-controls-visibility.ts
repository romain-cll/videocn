"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/**
 * Quand la barre se montre, quand elle s'efface. Tout est ici et nulle part
 * ailleurs : un seul endroit décide, et les contrôles ne font que lire.
 *
 * La règle tient en une phrase : **on montre à la moindre activité, on ne
 * masque qu'à la réunion de toutes les conditions**. Montrer est toujours sûr ;
 * masquer ne l'est jamais — une barre qui disparaît sous la souris, sous le
 * focus clavier ou sous un menu ouvert est un bug, pas une animation.
 */

export interface UseControlsVisibilityOptions {
  containerRef: RefObject<HTMLElement | null>;
  /** La vidéo est à l'arrêt : la barre ne doit alors jamais se masquer. */
  paused: boolean;
  visibility: "auto" | "always" | "never";
  autoHideDelay: number;
}

export interface ControlsVisibility {
  visible: boolean;
  /** Pose un verrou, renvoie sa libération. Référence stable. */
  holdVisible: () => () => void;
}

/**
 * Sur un écran tactile, un `pointerdown` bascule la visibilité : sans survol,
 * c'est le seul geste qui permette de faire disparaître la barre. Mais un doigt
 * qui vise un bouton *de* la barre ne demande pas à la faire disparaître — il
 * demande à appuyer dessus. D'où ce test sur la cible du geste.
 */
const CONTROLS_SELECTOR = '[data-slot="video-player-controls"]';

export function useControlsVisibility(options: UseControlsVisibilityOptions): ControlsVisibility {
  const { containerRef, paused, visibility, autoHideDelay } = options;

  const [autoVisible, setAutoVisible] = useState(true);
  /**
   * Un compteur et non un booléen : les phases suivantes ajouteront d'autres
   * menus, et deux verrous posés en même temps ne doivent pas s'écraser l'un
   * l'autre. En état plutôt qu'en ref, parce que c'est le retour à zéro qui
   * doit relancer le minuteur.
   */
  const [holds, setHolds] = useState(0);
  const [focusWithin, setFocusWithin] = useState(false);

  /**
   * Ajustement pendant le rendu, et non dans un effet : la barre doit être là
   * dans la frame où la lecture s'arrête. Un effet la ferait apparaître une
   * frame plus tard, ce qui se voit exactement au moment où l'utilisateur
   * regarde l'endroit où elle doit apparaître.
   */
  const [wasPaused, setWasPaused] = useState(paused);
  if (wasPaused !== paused) {
    setWasPaused(paused);
    if (paused) setAutoVisible(true);
  }

  const holdVisible = useCallback(() => {
    setHolds((count) => count + 1);
    setAutoVisible(true);
    let released = false;
    return () => {
      // Le nettoyage d'un effet peut être rejoué ; le compteur ne doit pas
      // passer sous zéro, sans quoi le verrou suivant ne bloquerait plus rien.
      if (released) return;
      released = true;
      setHolds((count) => count - 1);
    };
  }, []);

  useEffect(() => {
    // `always` et `never` n'installent rien : ni écouteur, ni minuteur.
    if (visibility !== "auto") return;
    const container = containerRef.current;
    if (!container) return;

    const show = () => setAutoVisible(true);

    const handlePointerMove = (event: PointerEvent) => {
      // Masquer le curseur avec la barre provoque un `pointermove` sans
      // déplacement. Sans ce filtre, réafficher le curseur relancerait le cycle
      // tout seul : la barre clignoterait indéfiniment sur une souris immobile.
      if (event.movementX === 0 && event.movementY === 0) return;
      show();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      const onControls = target instanceof Element && target.closest(CONTROLS_SELECTOR) !== null;
      if (event.pointerType !== "mouse" && !onControls) {
        setAutoVisible((current) => !current);
        return;
      }
      show();
    };

    const handlePointerLeave = (event: PointerEvent) => {
      // La souris a quitté le lecteur : il n'y a plus rien à attendre. Un doigt,
      // lui, « quitte » au relâchement — ce n'est pas un départ.
      if (event.pointerType !== "mouse") return;
      if (autoHideDelay <= 0 || paused || holds > 0 || focusWithin) return;
      if (container.contains(document.activeElement)) return;
      setAutoVisible(false);
    };

    const handleFocusIn = () => {
      setFocusWithin(true);
      show();
    };

    const handleFocusOut = (event: FocusEvent) => {
      // Un déplacement de focus d'un bouton à l'autre émet `focusout` puis
      // `focusin` : sans ce test, le minuteur repartirait à chaque tabulation.
      const next = event.relatedTarget;
      if (next instanceof Node && container.contains(next)) return;
      setFocusWithin(false);
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointerleave", handlePointerLeave);
    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerleave", handlePointerLeave);
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);
    };
  }, [autoHideDelay, containerRef, focusWithin, holds, paused, visibility]);

  useEffect(() => {
    if (visibility !== "auto") return;
    if (!autoVisible) return;
    // `autoHideDelay: 0` dit « ne masque jamais » sans renoncer au reste du
    // comportement automatique.
    if (autoHideDelay <= 0) return;
    // Une vidéo arrêtée ne cache rien derrière sa barre.
    if (paused) return;
    if (holds > 0) return;
    if (focusWithin) return;

    const timer = setTimeout(() => {
      // Dernier mot au DOM : un focus posé par le code de l'hôte n'est pas
      // passé par `focusin` ici, et masquer un élément focalisé le rendrait
      // invisible sans le rendre inatteignable — le pire des deux.
      const container = containerRef.current;
      if (container && container.contains(document.activeElement)) return;
      setAutoVisible(false);
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, [autoHideDelay, autoVisible, containerRef, focusWithin, holds, paused, visibility]);

  return {
    /**
     * `never` renvoie `true` comme `always`, et ce n'est pas une inattention :
     * il n'y a pas de barre à masquer, et le conteneur masque le curseur avec
     * elle. Renvoyer `false` cacherait le curseur pour de bon.
     */
    visible: visibility === "auto" ? autoVisible : true,
    holdVisible,
  };
}
