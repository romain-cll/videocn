"use client";

/**
 * La tête de lecture ne passe pas par l'état React.
 *
 * `timeupdate` n'est émis que quatre fois par seconde : la valeur est juste,
 * mais une barre qui n'avance qu'à ce rythme saute par paliers. Interpoler
 * entre deux événements reviendrait à *deviner* la position — la barre
 * continuerait d'avancer pendant que la vidéo cale pour charger, et à contre-
 * temps dès qu'on passe en 2×. On lit donc la vraie valeur à chaque frame.
 *
 * Soixante fois par seconde dans l'état d'un contexte React re-rendrait tout le
 * lecteur, bouton play et curseur de volume compris. D'où ce store : la valeur
 * vit dans une clôture, et seuls les composants qui s'y abonnent — le scrubber,
 * l'horodatage — se re-rendent. `useSyncExternalStore` s'y branche directement.
 */

export interface PlayheadSnapshot {
  readonly currentTime: number;
  /**
   * Fin de la plage chargée qui contient la tête de lecture, ce que le scrubber
   * dessine en aperçu du buffer. Les autres plages — celles d'avant un saut —
   * ne le concernent pas.
   */
  readonly bufferedEnd: number;
}

export interface PlayheadStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): PlayheadSnapshot;
  getServerSnapshot(): PlayheadSnapshot;
  /** Branche le store sur l'élément. Renvoie le débranchement. */
  attach(video: HTMLVideoElement): () => void;
}

const EMPTY_PLAYHEAD: PlayheadSnapshot = Object.freeze({
  currentTime: 0,
  bufferedEnd: 0,
});

/**
 * Tolérance de raccord : les navigateurs laissent des trous de quelques
 * millisecondes entre deux plages contiguës, qu'il ne faut pas lire comme une
 * interruption du buffer.
 */
const RANGE_TOLERANCE = 0.25;

function bufferedEndAt(video: HTMLVideoElement, time: number): number {
  const { buffered } = video;
  for (let i = 0; i < buffered.length; i += 1) {
    if (time >= buffered.start(i) - RANGE_TOLERANCE && time <= buffered.end(i)) {
      return buffered.end(i);
    }
  }
  return time;
}

export function createPlayheadStore(): PlayheadStore {
  const listeners = new Set<() => void>();
  let snapshot: PlayheadSnapshot = EMPTY_PLAYHEAD;
  let video: HTMLVideoElement | null = null;
  let frame = 0;

  /**
   * `getSnapshot` doit renvoyer la même référence tant que rien ne change,
   * sans quoi `useSyncExternalStore` re-rend en boucle. On ne reconstruit
   * l'objet que sur un vrai changement de valeur.
   */
  function read() {
    if (!video) return;
    const currentTime = video.currentTime;
    const bufferedEnd = bufferedEndAt(video, currentTime);
    if (currentTime === snapshot.currentTime && bufferedEnd === snapshot.bufferedEnd) return;
    snapshot = { currentTime, bufferedEnd };
    for (const listener of listeners) listener();
  }

  function tick() {
    read();
    frame = requestAnimationFrame(tick);
  }

  function startTicking() {
    // La boucle ne tourne qu'entre `play` et `pause` : à l'arrêt, la tête ne
    // bouge pas et une frame toutes les seize millisecondes ne servirait qu'à
    // chauffer. Elle continue pendant un calage, où la tête peut encore avancer
    // de quelques images avant de s'immobiliser ; `read()` sort tôt quand la
    // valeur n'a pas changé, donc ça ne coûte rien.
    if (frame === 0) frame = requestAnimationFrame(tick);
  }

  function stopTicking() {
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
  }

  function reset() {
    if (snapshot === EMPTY_PLAYHEAD) return;
    snapshot = EMPTY_PLAYHEAD;
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return snapshot;
    },
    // Rien à lire au rendu serveur : la tête de lecture démarre à zéro.
    getServerSnapshot() {
      return EMPTY_PLAYHEAD;
    },
    attach(element) {
      video = element;
      read();
      if (!element.paused) startTicking();

      element.addEventListener("play", startTicking);
      element.addEventListener("playing", startTicking);
      element.addEventListener("pause", stopTicking);
      element.addEventListener("ended", stopTicking);
      // Hors lecture, ces événements sont la seule source de fraîcheur — et
      // `timeupdate` prend le relais quand l'onglet passe en arrière-plan, où
      // le navigateur suspend `requestAnimationFrame`.
      element.addEventListener("timeupdate", read);
      element.addEventListener("seeking", read);
      element.addEventListener("seeked", read);
      element.addEventListener("progress", read);
      element.addEventListener("loadedmetadata", read);
      element.addEventListener("emptied", reset);

      return () => {
        stopTicking();
        element.removeEventListener("play", startTicking);
        element.removeEventListener("playing", startTicking);
        element.removeEventListener("pause", stopTicking);
        element.removeEventListener("ended", stopTicking);
        element.removeEventListener("timeupdate", read);
        element.removeEventListener("seeking", read);
        element.removeEventListener("seeked", read);
        element.removeEventListener("progress", read);
        element.removeEventListener("loadedmetadata", read);
        element.removeEventListener("emptied", reset);
        video = null;
        reset();
      };
    },
  };
}
