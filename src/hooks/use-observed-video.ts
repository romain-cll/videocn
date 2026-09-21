"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { createPlayheadStore } from "@/registry/videocn/playhead-store";

/**
 * Miroir d'un élément `<video>` piloté par quelqu'un d'autre — ici, par
 * `<VideoCn>`. Il écoute et ne fait rien d'autre : aucune écriture, pas même le
 * temps d'une sonde, sans quoi le panneau qui l'utilise fausserait ce qu'il
 * prétend observer.
 *
 * Ce hook vit dans le site et n'est **pas** distribué. Le lecteur n'a pas
 * besoin d'un mode observation : lui possède son élément. Le garder ici évite
 * de faire voyager, chez tous les utilisateurs du registry, du code qui
 * n'existe que pour notre page de démo.
 *
 * La tête de lecture réutilise en revanche le vrai `player-store` du lecteur :
 * c'est justement ce qu'on veut voir bouger.
 */

export interface ObservedVideo {
  currentTime: number;
  bufferedEnd: number;
  duration: number;
  paused: boolean;
  ended: boolean;
  isBuffering: boolean;
  volume: number;
  muted: boolean;
  playbackRate: number;
  readyState: number;
  networkState: number;
  error: MediaError | null;
  isFullscreen: boolean;
  isPictureInPicture: boolean;
}

const EMPTY: ObservedVideo = {
  currentTime: 0,
  bufferedEnd: 0,
  duration: 0,
  paused: true,
  ended: false,
  isBuffering: false,
  volume: 0,
  muted: false,
  playbackRate: 1,
  readyState: 0,
  networkState: 0,
  error: null,
  isFullscreen: false,
  isPictureInPicture: false,
};

const EVENTS = [
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
  "error",
  "enterpictureinpicture",
  "leavepictureinpicture",
] as const;

export function useObservedVideo(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [playhead] = useState(createPlayheadStore);
  const [discrete, setDiscrete] = useState<ObservedVideo>(EMPTY);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    return playhead.attach(video);
  }, [playhead, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const read = () => {
      setDiscrete((previous) => ({
        ...previous,
        duration: Number.isNaN(video.duration) ? 0 : video.duration,
        paused: video.paused,
        ended: video.ended,
        isBuffering: !video.paused && video.readyState < video.HAVE_FUTURE_DATA,
        volume: video.volume,
        muted: video.muted,
        playbackRate: video.playbackRate,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error,
        isFullscreen: document.fullscreenElement?.contains(video) ?? false,
        isPictureInPicture: document.pictureInPictureElement === video,
      }));
    };

    read();
    for (const event of EVENTS) video.addEventListener(event, read);
    document.addEventListener("fullscreenchange", read);

    return () => {
      for (const event of EVENTS) video.removeEventListener(event, read);
      document.removeEventListener("fullscreenchange", read);
    };
  }, [videoRef]);

  const { currentTime, bufferedEnd } = useSyncExternalStore(
    playhead.subscribe,
    playhead.getSnapshot,
    playhead.getServerSnapshot,
  );

  return { ...discrete, currentTime, bufferedEnd };
}
