/**
 * Le changelog de la landing : une ligne datée par sortie, tirée de
 * l'historique git, puis ce qui vient, sans date. Il découle de `docs/mvp.md`
 * et de `docs/roadmap.md` et ne les élargit jamais.
 *
 * Ajouter une entrée en tête à chaque sortie.
 */

export interface ChangelogEntry {
  /** ISO, pour `<time dateTime>`. */
  date: string;
  title: string;
  description: string;
  /** Les props ou clés que la sortie a apportées, affichées en monospace. */
  api?: readonly string[];
}

export const changelog: readonly ChangelogEntry[] = [
  {
    date: "2026-09-24",
    title: "Chapters",
    description:
      "Segments on the progress bar, a menu to jump between them, and a thicker segment under the pointer.",
    api: ["chapters", "controls.chapters", "controls.scrubber.chapters"],
  },
  {
    date: "2026-09-24",
    title: "HLS, DASH and live",
    description:
      "Shaka Player, loaded only for streaming sources. Quality selector, live window with DVR and a badge back to the edge.",
    api: ["type", "controls.quality", "controls.live"],
  },
  {
    date: "2026-09-22",
    title: "Keyboard shortcuts",
    description: "The YouTube keymap, scoped to the player and ignored in your inputs.",
    api: ["controls.keyboard"],
  },
  {
    date: "2026-09-21",
    title: "First release",
    description:
      "Native engine, control bar, an accessible progress bar and volume slider shared by both, speed menu, fullscreen and Picture-in-Picture.",
    api: ["src", "poster", "controls"],
  },
];

export interface UpcomingEntry {
  title: string;
  description: string;
}

export const upcoming: readonly UpcomingEntry[] = [
  { title: "Subtitles", description: "Size and position of the subtitles." },
  { title: "Chapters from a file", description: "A WebVTT chapters file, next to the array." },
  { title: "Hover thumbnails", description: "Frame previews from a WebVTT storyboard." },
  { title: "Most replayed", description: "A heatmap above the progress bar." },
];
