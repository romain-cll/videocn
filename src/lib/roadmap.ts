/**
 * La roadmap affichée sur la landing. Elle découle de `docs/mvp.md` et de
 * `docs/roadmap.md` et ne les élargit jamais : ce qui n'est pas au périmètre
 * n'est pas promis ici. Pas de dates, volontairement.
 */

export interface RoadmapItem {
  title: string;
  description: string;
}

export interface RoadmapColumn {
  id: "shipped" | "next" | "later";
  label: string;
  items: readonly RoadmapItem[];
}

export const roadmap: readonly RoadmapColumn[] = [
  {
    id: "shipped",
    label: "Shipped",
    items: [
      {
        title: "Native engine",
        description: "MP4 and WebM on the plain <video> element, with no streaming JavaScript.",
      },
      {
        title: "HLS and DASH",
        description: "Shaka Player, loaded on demand and only for a streaming source.",
      },
      {
        title: "Quality selector",
        description: "Adaptive by default, with the playing quality shown in the menu.",
      },
      {
        title: "Live and DVR",
        description: "Seek back inside the live window, and jump to the edge in one click.",
      },
      {
        title: "Chapters",
        description: "Segments on the progress bar and a menu to jump between them.",
      },
      {
        title: "Keyboard shortcuts",
        description: "The YouTube keymap, scoped to the player and out of your inputs.",
      },
      {
        title: "Theme-aware",
        description: "Your shadcn tokens and your --radius, down to the slider thumb.",
      },
    ],
  },
  {
    id: "next",
    label: "Next",
    items: [
      {
        title: "Subtitles",
        description: "Your WebVTT tracks, with a toggle, a track picker, and size and position.",
      },
      {
        title: "Chapters from a file",
        description: "A WebVTT chapters file, next to the array you can already pass.",
      },
    ],
  },
  {
    id: "later",
    label: "Later",
    items: [
      {
        title: "Hover thumbnails",
        description: "Frame previews over the progress bar, from a WebVTT storyboard.",
      },
      {
        title: "Most replayed",
        description: "A heatmap above the progress bar showing where viewers rewatch.",
      },
    ],
  },
];
