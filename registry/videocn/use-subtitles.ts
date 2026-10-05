"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PlayerStateStore } from "./player-state-store";
import {
  findDefaultSubtitle,
  pickSubtitleToEnable,
  resolveSubtitles,
  signSubtitles,
  type SubtitleTrack,
} from "./subtitles";
import type { PlayerActions } from "./use-player";

/**
 * Les sous-titres, entre l'élément `<video>` et le store. Appelé par
 * `usePlayer`, qui en reprend les deux actions.
 *
 * **L'élément a raison.** Les actions écrivent `track.mode` sur nos `TextTrack`
 * et s'arrêtent là ; une fonction `sync()` fait suivre le store à l'élément —
 * `change`, `addtrack` et `removetrack` sur `video.textTracks`,
 * `webkitbeginfullscreen` et `webkitendfullscreen`, et la fin de chaque action.
 * Elle :
 * - prend pour active notre piste `showing`, à défaut notre piste `hidden` ;
 * - force à `disabled` nos autres pistes (une seule affichée à la fois) et toute
 *   piste `subtitles` ou `captions` qui n'est pas à nous, comme celles que le
 *   HLS natif de Safari embarque ;
 * - publie `activeSubtitle` et retient la dernière piste active, pour que le
 *   bouton CC sache laquelle rallumer (`pickSubtitleToEnable`) ;
 * - rebranche `cuechange` vers `subtitleText` ;
 * - applique la piste `default` au premier passage qui voit nos pistes, et
 *   fait passer la piste active en `showing` pendant le plein écran natif de
 *   l'iPhone, seul cas où le rendu est celui du système.
 *
 * `sync()` est idempotent : il écrit un mode seulement s'il diffère, donc le
 * `change` que ses propres écritures provoquent le relance sans rien changer.
 *
 * Il publie aussi la liste normalisée (`resolveSubtitles`, à référence stable
 * d'après `signSubtitles`) dans `PlayerState.subtitles`, d'où `<VideoCn>` rend
 * ses `<track>`. Rien ne dépend du moteur : Shaka garde `manifest.disableText`.
 */

export interface UseSubtitlesOptions {
  /** L'élément `<video>`, `null` tant qu'il n'est pas monté. */
  video: HTMLVideoElement | null;
  store: PlayerStateStore;
  /** La prop de l'intégrateur, brute : c'est ce hook qui la normalise. */
  subtitles: readonly SubtitleTrack[] | undefined;
}

export type UseSubtitlesResult = Pick<PlayerActions, "selectSubtitles" | "toggleSubtitles">;

/**
 * Ce que `<VideoCn>` pose sur chacun de ses `<track>` : c'est par là qu'on
 * distingue nos pistes de celles du moteur ou du système. À garder identique de
 * l'autre côté.
 */
const TRACK_SELECTOR = 'track[data-slot="video-player-subtitle-track"]';

/** Le plein écran natif de l'iPhone, où le conteneur n'est plus affiché. */
interface WebkitFullscreenVideo {
  webkitDisplayingFullscreen?: boolean;
}

interface OurTrack {
  src: string;
  track: TextTrack;
}

/** Nos pistes, dans l'ordre du DOM, c'est-à-dire celui de la liste. */
function readOurTracks(video: HTMLVideoElement): OurTrack[] {
  const ours: OurTrack[] = [];
  for (const element of video.querySelectorAll<HTMLTrackElement>(TRACK_SELECTOR)) {
    const src = element.getAttribute("src");
    if (src) ours.push({ src, track: element.track });
  }
  return ours;
}

/** Le texte des répliques en cours, jointes par `\n`, sans les balises du fichier. */
function readCueText(track: TextTrack | null): string {
  const cues = track?.activeCues;
  if (!cues || cues.length === 0) return "";
  const lines: string[] = [];
  for (let index = 0; index < cues.length; index += 1) {
    const cue = cues[index] as VTTCue;
    lines.push(
      typeof cue.getCueAsHTML === "function" ? (cue.getCueAsHTML().textContent ?? "") : cue.text,
    );
  }
  return lines.join("\n");
}

/** Ce que `sync()` retient d'un passage à l'autre, pour la vie d'un élément. */
interface SubtitlesRuntime {
  /** La dernière piste active : celle que le bouton CC rallume. */
  last: string | null;
  /** La piste dont on écoute `cuechange`. */
  listened: TextTrack | null;
  /** `default` ne s'applique qu'une fois : au premier passage qui voit nos pistes. */
  defaultApplied: boolean;
}

interface SubtitlesApi {
  select(src: string | null): void;
  toggle(): void;
}

export function useSubtitles(options: UseSubtitlesOptions): UseSubtitlesResult {
  const { video, store, subtitles } = options;

  const signature = signSubtitles(subtitles);

  // L'état ajusté pendant le rendu, motif de `ChaptersProvider` : une référence
  // stable entre deux rendus de l'hôte, dont la prop est un tableau neuf à
  // chaque fois. Amorcé par la liste du store, que `usePlayer` a déjà
  // normalisée : le montage ne provoque aucun second rendu.
  const [cache, setCache] = useState(() => ({
    signature,
    resolved: store.getSnapshot().subtitles,
  }));
  let resolved = cache.resolved;
  if (cache.signature !== signature) {
    resolved = resolveSubtitles(subtitles);
    setCache({ signature, resolved });
  }

  // Le store ne change qu'avec le contenu de la liste : au montage, c'est la même
  // référence, et `patch` ne prévient personne.
  useEffect(() => {
    store.patch({ subtitles: resolved });
  }, [resolved, store]);

  // Les actions sont stables et passent par ce que l'effet suivant publie : il
  // possède l'élément, et il est seul à savoir où en est `sync()`.
  const apiRef = useRef<SubtitlesApi | null>(null);

  // Le nœud repasse par une ref pour être **écrit** (`track.mode`), comme dans
  // `usePlayer` : c'est le même élément, l'état déclenche l'effet et la ref
  // l'autorise à agir. Muter `video`, qui vient de l'état, reviendrait à
  // modifier une valeur issue du rendu. Posée avant l'effet qui la lit : les
  // effets d'un composant s'exécutent dans l'ordre.
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    videoRef.current = video;
  }, [video]);

  useEffect(() => {
    if (!video) return;
    const element = videoRef.current;
    if (!element) return;

    const textTracks = element.textTracks;
    const runtime: SubtitlesRuntime = { last: null, listened: null, defaultApplied: false };

    const isNativeFullscreen = () =>
      (element as HTMLVideoElement & WebkitFullscreenVideo).webkitDisplayingFullscreen === true;

    const updateText = () => {
      store.patch({ subtitleText: readCueText(runtime.listened) });
    };

    /**
     * Fait de `src` la seule piste affichée : elle seule n'est pas `disabled`.
     * `hidden` hors plein écran natif — le navigateur charge et émet les
     * répliques, notre calque les dessine —, `showing` dedans, où le système
     * rend la piste lui-même.
     */
    const activate = (ours: readonly OurTrack[], src: string | null) => {
      const wanted: TextTrackMode = isNativeFullscreen() ? "showing" : "hidden";
      for (const { src: candidate, track } of ours) {
        const mode = candidate === src ? wanted : "disabled";
        if (track.mode !== mode) track.mode = mode;
      }
    };

    const sync = () => {
      const ours = readOurTracks(element);

      // Les pistes du moteur ou du système : jamais affichées, nous seuls
      // décidons de ce que montre le lecteur.
      const mine = new Set(ours.map((entry) => entry.track));
      for (let index = 0; index < textTracks.length; index += 1) {
        const track = textTracks[index];
        if (mine.has(track)) continue;
        if (track.kind !== "subtitles" && track.kind !== "captions") continue;
        if (track.mode !== "disabled") track.mode = "disabled";
      }

      let active: string | null = null;
      if (ours.length > 0 && !runtime.defaultApplied) {
        runtime.defaultApplied = true;
        const wantedDefault = findDefaultSubtitle(store.getSnapshot().subtitles);
        if (ours.some((entry) => entry.src === wantedDefault)) active = wantedDefault;
      }
      active ??=
        (
          ours.find((entry) => entry.track.mode === "showing") ??
          ours.find((entry) => entry.track.mode === "hidden")
        )?.src ?? null;

      activate(ours, active);
      if (active !== null) runtime.last = active;

      const activeTrack = ours.find((entry) => entry.src === active)?.track ?? null;
      if (activeTrack !== runtime.listened) {
        runtime.listened?.removeEventListener("cuechange", updateText);
        activeTrack?.addEventListener("cuechange", updateText);
        runtime.listened = activeTrack;
      }
      store.patch({ activeSubtitle: active, subtitleText: readCueText(activeTrack) });
    };

    const select = (src: string | null) => {
      const ours = readOurTracks(element);
      // Une URL absente de la liste est ignorée.
      if (src !== null && !ours.some((entry) => entry.src === src)) return;
      activate(ours, src);
      sync();
    };

    const toggle = () => {
      const ours = readOurTracks(element);
      const isActive = ours.some(
        (entry) => entry.track.mode === "showing" || entry.track.mode === "hidden",
      );
      select(isActive ? null : pickSubtitleToEnable(store.getSnapshot().subtitles, runtime.last));
    };

    apiRef.current = { select, toggle };

    sync();
    textTracks.addEventListener("change", sync);
    textTracks.addEventListener("addtrack", sync);
    textTracks.addEventListener("removetrack", sync);
    element.addEventListener("webkitbeginfullscreen", sync);
    element.addEventListener("webkitendfullscreen", sync);

    return () => {
      textTracks.removeEventListener("change", sync);
      textTracks.removeEventListener("addtrack", sync);
      textTracks.removeEventListener("removetrack", sync);
      element.removeEventListener("webkitbeginfullscreen", sync);
      element.removeEventListener("webkitendfullscreen", sync);
      runtime.listened?.removeEventListener("cuechange", updateText);
      apiRef.current = null;
    };
  }, [store, video]);

  // Stables pour la vie du composant, comme toutes les actions du lecteur.
  return useMemo(
    () => ({
      selectSubtitles: (src: string | null) => apiRef.current?.select(src),
      toggleSubtitles: () => apiRef.current?.toggle(),
    }),
    [],
  );
}
