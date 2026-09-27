/**
 * Les médias des démonstrations interactives — landing, playground, doc.
 * Une seule source, pour qu'un extrait de code affiché ici ou là désigne
 * toujours la même vidéo.
 *
 * Aucune n'est hébergée par nous, et c'est volontaire : le lecteur ne consomme
 * que des formats standard du web, jamais une API videoCn.
 */

import type { SourceType } from "@/registry/videocn/player-engine";
import { EXAMPLE_VIDEOS } from "@/lib/videos";

/**
 * Big Buck Bunny découpé, pour voir les segments et le menu sur une vidéo dont
 * on connaît le déroulé. Les temps sont ceux du film ; c'est une liste écrite
 * à la main, comme celle qu'écrirait un intégrateur.
 */
export const BUNNY_CHAPTERS = [
  { time: 0, label: "Morning in the meadow" },
  { time: 70, label: "Big Buck Bunny wakes up" },
  { time: 150, label: "The butterfly" },
  { time: 230, label: "Frank, Rinky and Gamera" },
  { time: 330, label: "The ambush" },
  { time: 460, label: "Revenge" },
  { time: 560, label: "Credits" },
] as const;

export interface DemoSource {
  id: "mp4" | "hls" | "dash" | "live";
  label: string;
  src: string;
  type?: SourceType;
  poster?: string;
  /** Faux sur le direct : une fenêtre glissante n'a pas de chapitres. */
  supportsChapters: boolean;
  /** Une phrase, en anglais, sur ce que cette source montre du lecteur. */
  note: string;
}

/**
 * Les quatre sources du périmètre, servies par le même `<VideoCn>` : le MP4 ne
 * charge pas une ligne de Shaka ; le HLS et le DASH le chargent à la volée ;
 * le direct ouvre une fenêtre glissante au lieu d'une durée.
 */
export const DEMO_SOURCES: readonly DemoSource[] = [
  {
    id: "mp4",
    label: "MP4",
    src: EXAMPLE_VIDEOS.bigBuckBunny.src,
    poster: EXAMPLE_VIDEOS.bigBuckBunny.poster,
    supportsChapters: true,
    note: "Native engine, no streaming JavaScript. The quality button stays disabled: a progressive file has a single quality.",
  },
  {
    id: "hls",
    label: "HLS",
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    supportsChapters: true,
    note: "Shaka Player, loaded on demand. Five qualities from 184p to 1080p; adaptive until you pick one.",
  },
  {
    id: "dash",
    label: "DASH",
    src: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
    supportsChapters: true,
    note: "Same player, same engine, another manifest. Nothing changes in the interface.",
  },
  {
    id: "live",
    label: "Live",
    src: "https://demo.unified-streaming.com/k8s/live/stable/scte35.isml/.m3u8",
    supportsChapters: false,
    note: "A live stream with about fifteen minutes of window: seek back inside it, and the badge brings you back to the edge.",
  },
];

export type DemoSourceId = DemoSource["id"];

export function getDemoSource(id: DemoSourceId): DemoSource {
  return DEMO_SOURCES.find((source) => source.id === id) ?? DEMO_SOURCES[0];
}
