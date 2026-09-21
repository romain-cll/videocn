"use client";

import type { ReactNode } from "react";

/**
 * CONTRAT DE LA PHASE 2 — types définitifs, implémentation provisoire.
 *
 * Le curseur partagé par le scrubber et le volume. Un seul composant pour deux
 * plages : c'est ce qui permet au volume d'avoir enfin un nom accessible, et
 * aux chapitres de la phase 5 de se loger dans la piste sans refonte.
 *
 * La position se dessine par la propriété CSS `--player-slider-fraction`, de 0
 * à 1, écrite hors de React par une seule fonction interne. Cette clé ne doit
 * jamais apparaître dans un `style` JSX : React ne diffe que les clés qu'il
 * gère, donc il ne l'écrasera jamais tant qu'on ne la lui confie pas.
 */

/** Pourquoi la valeur change — le consommateur en déduit l'effet sur la vidéo. */
export type SliderChangeReason = "start" | "move" | "end" | "cancel" | "key";

/**
 * Une position vive, dessinée hors de React. Le scrubber y branche la tête de
 * lecture : elle bouge soixante fois par seconde, et la faire passer par une
 * prop re-rendrait le curseur autant de fois.
 */
export interface SliderPosition {
  subscribe(listener: () => void): () => void;
  getValue(): number;
}

export interface PlayerSliderProps {
  "aria-label": string;
  /** 0 par défaut. Différent de zéro pour la fenêtre DVR de la phase 4. */
  min?: number;
  /** Non fini ou inférieur à `min` : le curseur est inerte. */
  max: number;
  /**
   * La valeur annoncée aux technologies d'assistance. Dessinée aussi, quand
   * `position` est absent — c'est le cas du volume.
   */
  value: number;
  /** Si présent, c'est lui qui est dessiné, et `value` n'est plus qu'annoncée. */
  position?: SliderPosition;
  /** Le pas d'une flèche. */
  step: number;
  /** Le pas de `PageUp` / `PageDown`. */
  pageStep: number;
  /** Le texte lu à la place du nombre : « 42 seconds of 9 minutes 56 seconds ». */
  getValueText?: (value: number) => string;
  disabled?: boolean;
  onValueChange: (value: number, reason: SliderChangeReason) => void;
  className?: string;
  /** La ou les pistes, composées par l'appelant. */
  children: ReactNode;
}

export function PlayerSlider(props: PlayerSliderProps) {
  void props;
  return null;
}

export interface PlayerSliderLayerProps {
  className?: string;
  children?: ReactNode;
}

/** Le rail : la piste de fond, qui découpe ses couches aux coins arrondis. */
export function PlayerSliderTrack(props: PlayerSliderLayerProps) {
  void props;
  return null;
}

/** La partie jouée, de 0 jusqu'à la position courante. */
export function PlayerSliderRange(props: PlayerSliderLayerProps) {
  void props;
  return null;
}
