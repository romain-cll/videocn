"use client";

/**
 * Ce que le lecteur expose de réglable, et rien d'autre : `<VideoCn>` s'installe
 * et fonctionne. Masquer un contrôle, changer une liste de valeurs, tout passe
 * par ici — jamais par une modification du code livré.
 *
 * La forme tient sur la durée grâce à une seule règle : **chaque contrôle vaut
 * `boolean | objet d'options`**. Absent ou `true`, il est là avec ses défauts ;
 * `false`, il disparaît ; un objet, il est là et réglé. Les chapitres de la
 * phase 5 gagneront une clé dans *leur* objet, pas une prop de plus sur le
 * composant racine.
 */

export interface ControlsOptions {
  /**
   * `auto` — la barre apparaît à l'activité et s'efface pendant la lecture.
   * `always` — jamais masquée. `never` — pas de barre du tout.
   */
  visibility?: "auto" | "always" | "never";
  /** Inactivité avant masquage, en millisecondes. */
  autoHideDelay?: number;
  play?: boolean;
  /** La barre de progression. Deviendra un objet en phase 5, pour les chapitres et la heatmap. */
  scrubber?: boolean;
  /** L'horodatage `0:42 / 9:56`. */
  time?: boolean;
  volume?: boolean;
  fullscreen?: boolean;
  pictureInPicture?: boolean;
  playbackRate?: boolean | { rates?: readonly number[] };
  /**
   * Les raccourcis clavier — `Espace`, `k`, les flèches, `m`, `f`, `0`–`9` —,
   * actifs quand le focus est dans le lecteur. `false` pour un hôte qui a déjà
   * les siens.
   */
  keyboard?: boolean;
}

/**
 * Tous les contrôles sont des objets, y compris ceux qui n'ont aujourd'hui rien
 * à régler : le jour où l'un d'eux gagne une option, ce que son lecteur attend
 * ne change pas.
 */
export interface ResolvedControlsOptions {
  visibility: "auto" | "always" | "never";
  autoHideDelay: number;
  play: { enabled: boolean };
  scrubber: { enabled: boolean };
  time: { enabled: boolean };
  volume: { enabled: boolean };
  fullscreen: { enabled: boolean };
  pictureInPicture: { enabled: boolean };
  playbackRate: { enabled: boolean; rates: readonly number[] };
  keyboard: { enabled: boolean };
}

/** Les vitesses de YouTube : assez fines pour être utiles, assez peu pour tenir dans un menu. */
export const DEFAULT_PLAYBACK_RATES: readonly number[] = Object.freeze([
  0.5, 0.75, 1, 1.25, 1.5, 1.75, 2,
]);

/** Trois secondes : le temps de trouver un bouton sans que la barre s'incruste. */
export const DEFAULT_AUTO_HIDE_DELAY = 3000;

/**
 * Le pas d'une flèche, en secondes sur le scrubber et en fraction sur le
 * volume. Déclarés ici parce que deux couches s'en servent — le curseur
 * focalisé et la keymap du lecteur — et qu'elles doivent tomber d'accord :
 * `→` ne peut pas avancer de 5 s sur le curseur et de 10 s ailleurs.
 */
export const DEFAULT_SEEK_STEP = 5;
export const DEFAULT_VOLUME_STEP = 0.05;

function toggle(value: boolean | undefined): { enabled: boolean } {
  // Seul `false` masque : une clé absente doit donner un lecteur complet.
  return { enabled: value !== false };
}

function resolveRates(rates: readonly number[] | undefined): readonly number[] {
  if (!rates) return DEFAULT_PLAYBACK_RATES;
  // `playbackRate` n'accepte que des nombres finis strictement positifs ; une
  // valeur invalide ferait échouer l'écriture sur l'élément, silencieusement.
  const cleaned = Array.from(new Set(rates.filter((rate) => Number.isFinite(rate) && rate > 0)));
  if (cleaned.length === 0) return DEFAULT_PLAYBACK_RATES;
  return Object.freeze(cleaned.sort((a, b) => a - b));
}

export function resolveControlsOptions(options: ControlsOptions = {}): ResolvedControlsOptions {
  const { playbackRate } = options;
  const rateOptions = typeof playbackRate === "object" ? playbackRate : undefined;

  return {
    visibility: options.visibility ?? "auto",
    autoHideDelay: options.autoHideDelay ?? DEFAULT_AUTO_HIDE_DELAY,
    play: toggle(options.play),
    scrubber: toggle(options.scrubber),
    time: toggle(options.time),
    volume: toggle(options.volume),
    fullscreen: toggle(options.fullscreen),
    pictureInPicture: toggle(options.pictureInPicture),
    playbackRate: {
      enabled: playbackRate !== false,
      rates: resolveRates(rateOptions?.rates),
    },
    keyboard: toggle(options.keyboard),
  };
}
