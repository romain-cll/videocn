"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { NO_CAPABILITIES } from "./player-engine";
import type {
  EngineCapabilities,
  EngineStatus,
  PlayerEngine,
  PlayerError,
  SourceType,
} from "./player-engine";
import { createPlayheadStore, type PlayheadStore } from "./player-store";
import { resolveEngine } from "./resolve-engine";

/**
 * Tout l'état du lecteur **sauf la tête de lecture**. `currentTime` et
 * `buffered` changent soixante fois par seconde et vivent dans le store
 * renvoyé par `playhead` ; ce qui reste ici ne bouge qu'à l'occasion d'un
 * événement utilisateur, donc un state React ordinaire suffit.
 */
export interface PlayerState {
  paused: boolean;
  ended: boolean;
  /**
   * La vidéo veut avancer et n'a pas de quoi. Distinct de
   * `engineStatus: "loading"`, qui décrit le moteur et non le flux : l'un se
   * résout une fois, l'autre peut revenir à chaque trou de réseau.
   */
  isBuffering: boolean;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  canControlVolume: boolean;
  canFullscreen: boolean;
  isFullscreen: boolean;
  canPictureInPicture: boolean;
  isPictureInPicture: boolean;
  engineStatus: EngineStatus;
  error: PlayerError | null;
  capabilities: EngineCapabilities;
}

export interface PlayerActions {
  play(): Promise<void>;
  pause(): void;
  togglePlay(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  toggleMuted(): void;
  setPlaybackRate(rate: number): void;
  toggleFullscreen(): void;
  togglePictureInPicture(): void;
  selectQuality(id: string | null): void;
}

export interface UsePlayerOptions {
  src: string;
  type?: SourceType;
  /** 0 à 1. Défaut 0,5. */
  defaultVolume?: number;
  defaultMuted?: boolean;
  /** Cible du plein écran. À défaut, le `<video>` lui-même. */
  containerRef?: RefObject<HTMLElement | null>;
}

export interface UsePlayerResult {
  state: PlayerState;
  actions: PlayerActions;
  playhead: PlayheadStore;
}

/**
 * Assez fort pour être audible sans faire sursauter, assez bas pour qu'on
 * monte le son plutôt que de couper.
 */
const DEFAULT_VOLUME = 0.5;

/**
 * Les événements qui font bouger l'état « lent ». `timeupdate` et `progress`
 * n'y sont volontairement pas : ils appartiennent au store de la tête de
 * lecture, et les faire passer par React annulerait tout l'intérêt du store.
 */
const MEDIA_EVENTS = [
  "loadstart",
  "loadedmetadata",
  "canplay",
  "canplaythrough",
  "waiting",
  "stalled",
  "durationchange",
  "play",
  "playing",
  "pause",
  "ended",
  "seeking",
  "seeked",
  "emptied",
  "volumechange",
  "ratechange",
] as const;

/**
 * Safari n'a jamais retiré ses préfixes, et l'iPhone n'a jamais eu l'API
 * standard du tout. On teste la présence des méthodes plutôt que la marque du
 * navigateur : le jour où WebKit s'aligne, ce code n'a pas à changer.
 */
interface WebkitFullscreenElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

interface WebkitFullscreenDocument {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}

/**
 * Sur iPhone, seule la vidéo passe en plein écran, et c'est le système qui la
 * rend : notre interface disparaît le temps du plein écran. C'est un repli, pas
 * un choix — on ne l'utilise que s'il est la seule option.
 */
interface WebkitFullscreenVideo {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
}

type FullscreenMode = "element" | "webkit" | "video" | "none";

function webkitDocument(): Document & WebkitFullscreenDocument {
  return document as Document & WebkitFullscreenDocument;
}

function webkitVideo(video: HTMLVideoElement): HTMLVideoElement & WebkitFullscreenVideo {
  return video as HTMLVideoElement & WebkitFullscreenVideo;
}

function detectFullscreenMode(target: HTMLElement, video: HTMLVideoElement): FullscreenMode {
  if (typeof target.requestFullscreen === "function") return "element";
  const prefixed = target as HTMLElement & WebkitFullscreenElement;
  if (typeof prefixed.webkitRequestFullscreen === "function") return "webkit";
  if (typeof webkitVideo(video).webkitEnterFullscreen === "function") return "video";
  return "none";
}

function isFullscreenActive(target: HTMLElement, video: HTMLVideoElement): boolean {
  const doc = webkitDocument();
  const active = doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
  // Un autre élément de la page peut être en plein écran sans que ça nous
  // concerne ; on ne répond vrai que si c'est bien notre cible.
  if (active) return active === target || active.contains(target);
  // Plein écran natif iOS : le document n'en sait rien, seule la vidéo le sait.
  return webkitVideo(video).webkitDisplayingFullscreen === true;
}

/**
 * Plein écran et Picture-in-Picture rejettent quand le geste utilisateur
 * manque ou quand l'utilisateur refuse. Ce n'est pas une erreur du lecteur : le
 * `PlayerState.error` est réservé à ce qui empêche la lecture.
 */
function ignoreRejection(result: unknown): void {
  if (result instanceof Promise) void result.catch(() => undefined);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

function toPlayerError(error: MediaError | null): PlayerError {
  // Les navigateurs remplissent rarement `message`, et jamais dans la langue de
  // l'hôte : c'est le `code` qui porte l'information exploitable.
  const message = error?.message || "La lecture a échoué.";
  if (error) {
    if (error.code === error.MEDIA_ERR_ABORTED) return { code: "aborted", message };
    if (error.code === error.MEDIA_ERR_NETWORK) return { code: "network", message };
    if (error.code === error.MEDIA_ERR_DECODE) return { code: "decode", message };
  }
  // `MEDIA_ERR_SRC_NOT_SUPPORTED`, et le cas où l'élément a émis `error` sans
  // exposer de `MediaError` : dans les deux cas le navigateur ne sait pas lire
  // cette source.
  return { code: "unsupported", message };
}

function engineErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Le moteur vidéo n'a pas pu charger la source.";
}

/**
 * Renvoie l'objet précédent quand rien n'a bougé. Sans ça, un `volumechange`
 * qui réécrit la même valeur — il y en a à chaque frame sur certains
 * navigateurs — re-rendrait tous les contrôles pour rien.
 */
function mergeState(previous: PlayerState, next: Partial<PlayerState>): PlayerState {
  for (const key of Object.keys(next) as (keyof PlayerState)[]) {
    if (!Object.is(previous[key], next[key])) return { ...previous, ...next };
  }
  return previous;
}

export function usePlayer(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: UsePlayerOptions,
): UsePlayerResult {
  const { src, type, defaultVolume = DEFAULT_VOLUME, defaultMuted, containerRef } = options;

  const [state, setState] = useState<PlayerState>(() => ({
    paused: true,
    ended: false,
    isBuffering: false,
    duration: 0,
    volume: clamp01(defaultVolume),
    muted: defaultMuted ?? false,
    playbackRate: 1,
    // Optimistes jusqu'au premier effet : aucun accès au DOM pendant le rendu,
    // le fichier part dans des projets rendus côté serveur.
    canControlVolume: true,
    canFullscreen: false,
    isFullscreen: false,
    canPictureInPicture: false,
    isPictureInPicture: false,
    engineStatus: "idle",
    error: null,
    capabilities: NO_CAPABILITIES,
  }));

  const patch = useCallback((next: Partial<PlayerState>) => {
    setState((previous) => mergeState(previous, next));
  }, []);

  // Un seul store pour la vie du composant : l'initialiseur paresseux de
  // `useState` est le seul moyen que React garantisse de n'appeler qu'une fois.
  const [playhead] = useState(createPlayheadStore);

  const engineRef = useRef<PlayerEngine | null>(null);
  const fullscreenModeRef = useRef<FullscreenMode>("none");
  const defaultsAppliedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    return playhead.attach(video);
  }, [playhead, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const sync = () => {
      const next: Partial<PlayerState> = {
        paused: video.paused,
        ended: video.ended,
        // Déduit de l'élément plutôt que mémorisé sur `waiting` / `playing` :
        // un état qui se recalcule ne peut pas rester coincé sur vrai après un
        // événement manqué.
        isBuffering: !video.paused && video.readyState < video.HAVE_FUTURE_DATA,
        // `NaN` tant que les métadonnées manquent. `Infinity` en live est
        // conservé tel quel : c'est une information, pas une valeur absente.
        duration: Number.isNaN(video.duration) ? 0 : video.duration,
        volume: video.volume,
        muted: video.muted,
        playbackRate: video.playbackRate,
      };
      // `engineStatus` n'est pas ici : c'est l'effet du moteur qui le tient, et
      // il en sait plus que l'élément — notamment pendant le chargement de Shaka.
      patch(next);
    };

    const handleError = () => {
      // Un `error` sans `MediaError` est un résidu : l'élément est déjà reparti
      // sur une autre source et a effacé la précédente. Le rapporter
      // inventerait une panne.
      if (!video.error) return;
      // Libérer une source — au démontage, ou avant d'en charger une autre —
      // laisse l'élément sans candidat, ce que le navigateur signale comme un
      // format illisible. Il n'y a rien à lire, donc rien qui ait échoué.
      if (!video.currentSrc && !video.getAttribute("src")) return;
      patch({ error: toPlayerError(video.error), engineStatus: "error" });
    };

    sync();
    for (const event of MEDIA_EVENTS) video.addEventListener(event, sync);
    video.addEventListener("error", handleError);

    return () => {
      for (const event of MEDIA_EVENTS) video.removeEventListener(event, sync);
      video.removeEventListener("error", handleError);
    };
  }, [patch, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!defaultsAppliedRef.current) {
      defaultsAppliedRef.current = true;
      // Le lecteur est **non contrôlé** : ces valeurs sont un point de départ,
      // pas une source de vérité. Rien ne les réapplique ensuite.
      video.volume = clamp01(defaultVolume);
      if (defaultMuted !== undefined) video.muted = defaultMuted;
    }

    // Sur iPhone, Safari ignore les écritures sur `video.volume` : la propriété
    // vaut toujours 1 et le curseur de volume n'aurait aucun effet. Rien ne
    // l'annonce, il faut essayer. La valeur trouvée est restaurée aussitôt.
    const found = video.volume;
    const probe = found === 1 ? 0.5 : 1;
    video.volume = probe;
    const canControlVolume = video.volume === probe;
    video.volume = found;

    patch({ canControlVolume, volume: video.volume, muted: video.muted });
  }, [defaultMuted, defaultVolume, patch, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let active = true;
    const engine = resolveEngine(src, type);
    engineRef.current = engine;

    const syncCapabilities = () => {
      if (active) patch({ capabilities: engine.getCapabilities() });
    };
    // `ready` ne vient pas de la promesse du moteur : celle-ci dit seulement
    // que la source est prise en charge. C'est l'élément qui dit quand la
    // lecture devient possible.
    const markReady = () => {
      if (active) patch({ engineStatus: "ready" });
    };

    patch({ engineStatus: "loading", error: null, capabilities: engine.getCapabilities() });
    const unsubscribe = engine.subscribe(syncCapabilities);
    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("canplay", markReady);

    engine.attach(video);
    void engine.load(src).then(
      () => {
        if (!active) return;
        syncCapabilities();
        // Un élément qui portait déjà cette source a émis `loadedmetadata`
        // avant qu'on écoute : l'événement ne reviendra pas.
        if (video.readyState >= video.HAVE_METADATA) markReady();
      },
      (cause: unknown) => {
        if (!active) return;
        patch({
          engineStatus: "error",
          error: { code: "engine", message: engineErrorMessage(cause) },
        });
      },
    );

    return () => {
      active = false;
      unsubscribe();
      video.removeEventListener("loadedmetadata", markReady);
      video.removeEventListener("canplay", markReady);
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
      // La source vient d'être libérée : repartir de zéro plutôt que de laisser
      // l'ancien statut décrire la suivante.
      patch({ engineStatus: "idle", error: null, capabilities: NO_CAPABILITIES });
    };
  }, [patch, src, type, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const target = containerRef?.current ?? video;

    const mode = detectFullscreenMode(target, video);
    fullscreenModeRef.current = mode;

    const sync = () => {
      patch({ canFullscreen: mode !== "none", isFullscreen: isFullscreenActive(target, video) });
    };
    sync();

    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    // Le plein écran natif iOS n'émet rien sur le document : la vidéo est la
    // seule à en parler.
    video.addEventListener("webkitbeginfullscreen", sync);
    video.addEventListener("webkitendfullscreen", sync);

    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      video.removeEventListener("webkitbeginfullscreen", sync);
      video.removeEventListener("webkitendfullscreen", sync);
    };
  }, [containerRef, patch, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const sync = () => {
      patch({
        canPictureInPicture:
          Boolean(document.pictureInPictureEnabled) && !video.disablePictureInPicture,
        isPictureInPicture: document.pictureInPictureElement === video,
      });
    };
    sync();

    video.addEventListener("enterpictureinpicture", sync);
    video.addEventListener("leavepictureinpicture", sync);
    // L'attribut `disablePictureInPicture` peut arriver avec une nouvelle
    // source : on repasse dessus à chaque chargement.
    video.addEventListener("loadedmetadata", sync);

    return () => {
      video.removeEventListener("enterpictureinpicture", sync);
      video.removeEventListener("leavepictureinpicture", sync);
      video.removeEventListener("loadedmetadata", sync);
    };
  }, [patch, videoRef]);

  const play = useCallback(() => {
    const video = videoRef.current;
    return video ? video.play() : Promise.resolve();
  }, [videoRef]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // On lit l'élément plutôt que l'état : entre deux rendus, la vidéo peut
    // s'être arrêtée d'elle-même, et c'est elle qui a raison.
    if (video.paused || video.ended) ignoreRejection(video.play());
    else video.pause();
  }, [videoRef]);

  const seek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(time)) return;
      // En live, `duration` vaut `Infinity` : il n'y a pas de borne haute à
      // appliquer, le navigateur ramènera lui-même dans la fenêtre DVR.
      const upperBound = Number.isFinite(video.duration) ? video.duration : time;
      video.currentTime = Math.min(Math.max(time, 0), upperBound);
    },
    [videoRef],
  );

  const setVolume = useCallback(
    (volume: number) => {
      const video = videoRef.current;
      if (!video) return;
      // On écrit sur l'élément et on s'arrête là : l'état suivra
      // `volumechange`. L'inverse ferait mentir l'interface sur un iPhone, où
      // l'écriture n'a aucun effet.
      video.volume = clamp01(volume);
    },
    [videoRef],
  );

  const setMuted = useCallback(
    (muted: boolean) => {
      const video = videoRef.current;
      if (video) video.muted = muted;
    },
    [videoRef],
  );

  const toggleMuted = useCallback(() => {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  }, [videoRef]);

  const setPlaybackRate = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(rate) || rate <= 0) return;
      video.playbackRate = rate;
    },
    [videoRef],
  );

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const target = containerRef?.current ?? video;
    const doc = webkitDocument();
    const prefixedVideo = webkitVideo(video);

    if (isFullscreenActive(target, video)) {
      if (typeof doc.exitFullscreen === "function") ignoreRejection(doc.exitFullscreen());
      else if (typeof doc.webkitExitFullscreen === "function") doc.webkitExitFullscreen();
      else prefixedVideo.webkitExitFullscreen?.();
      return;
    }

    switch (fullscreenModeRef.current) {
      case "element":
        ignoreRejection(target.requestFullscreen());
        break;
      case "webkit":
        (target as HTMLElement & WebkitFullscreenElement).webkitRequestFullscreen?.();
        break;
      case "video":
        prefixedVideo.webkitEnterFullscreen?.();
        break;
      default:
        break;
    }
  }, [containerRef, videoRef]);

  const togglePictureInPicture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement === video) {
      ignoreRejection(document.exitPictureInPicture());
      return;
    }
    if (typeof video.requestPictureInPicture === "function") {
      ignoreRejection(video.requestPictureInPicture());
    }
  }, [videoRef]);

  const selectQuality = useCallback((id: string | null) => {
    engineRef.current?.selectQuality(id);
  }, []);

  /**
   * Les actions sont stables pour la vie du composant : les contrôles les
   * reçoivent en props et ne doivent pas se re-rendre parce que la tête de
   * lecture a avancé.
   */
  const actions = useMemo<PlayerActions>(
    () => ({
      play,
      pause,
      togglePlay,
      seek,
      setVolume,
      setMuted,
      toggleMuted,
      setPlaybackRate,
      toggleFullscreen,
      togglePictureInPicture,
      selectQuality,
    }),
    [
      play,
      pause,
      togglePlay,
      seek,
      setVolume,
      setMuted,
      toggleMuted,
      setPlaybackRate,
      toggleFullscreen,
      togglePictureInPicture,
      selectQuality,
    ],
  );

  return useMemo(() => ({ state, actions, playhead }), [state, actions, playhead]);
}
