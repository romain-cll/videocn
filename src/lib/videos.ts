import type { SubtitleTrack } from "@/registry/videocn/subtitles";

/**
 * Les vidéos du site : des films libres de la Blender Foundation, servis
 * par archive.org en fichiers progressifs. Le moteur natif suffit, aucun
 * JavaScript de streaming.
 *
 * Chaque poster est tiré du fichier lui-même. Sans lui, le lecteur montre la
 * première image, souvent noire.
 *
 * Le bucket Google `gtv-videos-bucket`, longtemps la référence pour ces
 * fichiers, répond 403 : ne pas y revenir.
 */
export const EXAMPLE_VIDEOS = {
  /** 2048 × 872, 15 min. */
  sintel: {
    title: "Sintel",
    src: "https://archive.org/download/Sintel/sintel-2048-stereo.mp4",
    poster: "/examples/sintel-poster.jpg",
  },
  /** 1920 × 800, 12 min. WebM : lu par tous les navigateurs actuels. */
  tearsOfSteel: {
    title: "Tears of Steel",
    src: "https://archive.org/download/Tears-of-Steel/tears_of_steel_1080p.webm",
    poster: "/examples/tears-of-steel-poster.jpg",
  },
  /** 640 × 360, 10 min. Assez pour un lecteur de la taille d'un post. */
  bigBuckBunny: {
    title: "Big Buck Bunny",
    src: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
    poster: "/examples/big-buck-bunny-poster.jpg",
  },
} as const;

export type ExampleVideo = (typeof EXAMPLE_VIDEOS)[keyof typeof EXAMPLE_VIDEOS];

/**
 * Le découpage de Sintel, pour l'exemple des chapitres de la doc.
 *
 * À part, et non dans l'entrée du film : une seule des trois vidéos en a, et
 * la donner à une seule branche de `EXAMPLE_VIDEOS` rendrait `ExampleVideo`
 * inutilisable — le champ manquerait aux deux autres.
 */
export const SINTEL_CHAPTERS = [
  { time: 0, label: "Prologue" },
  { time: 100, label: "The village" },
  { time: 210, label: "Searching for Scales" },
  { time: 350, label: "The shaman's tale" },
  { time: 490, label: "Crossing the mountains" },
  { time: 640, label: "The lair" },
  { time: 770, label: "The duel" },
  { time: 830, label: "Credits" },
] as const;

/**
 * Les sous-titres officiels de Sintel, pour l'exemple des sous-titres de la
 * doc. Ils sont servis par le site et non par archive.org : le `<video>` ne
 * porte pas d'attribut `crossorigin`, donc un `<track>` ne se charge que depuis
 * l'origine de la page.
 *
 * Sintel © Blender Foundation | durian.blender.org, CC BY 3.0. L'attribution
 * est aussi dans l'en-tête de chaque fichier `.vtt`.
 *
 * `French` et non `Français` : le site est en anglais.
 */
export const SINTEL_SUBTITLES = [
  { src: "/examples/sintel-en.vtt", srcLang: "en", label: "English", default: true },
  { src: "/examples/sintel-fr.vtt", srcLang: "fr", label: "French" },
] as const satisfies readonly SubtitleTrack[];
