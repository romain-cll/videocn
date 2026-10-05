"use client";

/**
 * Le tableau des options de `controls`. Client pour la même raison que
 * `docs-keyboard-shortcuts.tsx` : les défauts sont lus dans le code distribué
 * lui-même, module `"use client"`, et c'est ce qui empêche la doc de mentir le
 * jour où un défaut change.
 */

import { InlineCode } from "@/components/docs/docs-section";
import { ReferenceTable, type ReferenceRow } from "@/components/docs/reference-table";
import {
  DEFAULT_AUTO_HIDE_DELAY,
  DEFAULT_PLAYBACK_RATES,
} from "@/registry/videocn/controls-options";

const ROWS: readonly ReferenceRow[] = [
  {
    name: "visibility",
    type: '"auto" | "always" | "never"',
    defaultValue: '"auto"',
    description: (
      <>
        <InlineCode>auto</InlineCode> shows the bar on activity and hides it during playback.{" "}
        <InlineCode>always</InlineCode> never hides it. <InlineCode>never</InlineCode> renders no
        bar at all.
      </>
    ),
  },
  {
    name: "autoHideDelay",
    type: "number",
    defaultValue: String(DEFAULT_AUTO_HIDE_DELAY),
    description: "Idle time before the bar hides, in milliseconds.",
  },
  { name: "play", type: "boolean", defaultValue: "true", description: "The play / pause button." },
  {
    name: "scrubber",
    type: "boolean | { chapters?: boolean }",
    defaultValue: "true",
    description: (
      <>
        The progress bar. <InlineCode>{"{ chapters: false }"}</InlineCode> keeps it in one piece
        and leaves the chapter menu alone.
      </>
    ),
  },
  {
    name: "time",
    type: "boolean",
    defaultValue: "true",
    description: (
      <>
        The <InlineCode>0:42 / 9:56</InlineCode> time display.
      </>
    ),
  },
  {
    name: "volume",
    type: "boolean",
    defaultValue: "true",
    description:
      "Mute button and volume slider. The slider folds behind the icon and unfolds on hover or keyboard focus; on touch devices only the button shows.",
  },
  { name: "fullscreen", type: "boolean", defaultValue: "true", description: "The fullscreen button." },
  {
    name: "pictureInPicture",
    type: "boolean",
    defaultValue: "true",
    description:
      "The Picture-in-Picture button, or its entry in the settings menu in a narrow player.",
  },
  {
    name: "chapters",
    type: "boolean",
    defaultValue: "true",
    description:
      "The chapter menu, or its entry in the settings menu in a narrow player. It only shows when the video has chapters.",
  },
  {
    name: "subtitles",
    type: "boolean",
    defaultValue: "true",
    description:
      "The CC button, the Subtitles entry of the settings menu and the C shortcut. In a narrow player the CC button is not in the bar and the entry is the way in. They only show when the video has subtitle tracks. A track marked default still displays when this is false: controls shape the bar, not the content.",
  },
  {
    name: "playbackRate",
    type: "boolean | { rates?: number[] }",
    defaultValue: `[${DEFAULT_PLAYBACK_RATES.join(", ")}]`,
    description:
      "The Speed entry of the settings menu. Rates are sorted and deduplicated; invalid values are dropped.",
  },
  {
    name: "quality",
    type: "boolean",
    defaultValue: "true",
    description:
      "The Quality entry of the settings menu. Greyed out, not hidden, when the engine exposes no levels. With playbackRate and quality both off, the settings button stays only if the video has subtitle tracks, for the Subtitles entry; otherwise it disappears. In a narrow player the Chapters and Picture-in-Picture entries count too: the button disappears only when no entry is left.",
  },
  {
    name: "live",
    type: "boolean",
    defaultValue: "true",
    description: "The Live badge. Only shown on a live stream.",
  },
  {
    name: "keyboard",
    type: "boolean",
    defaultValue: "true",
    description: "Keyboard shortcuts, active when the player has focus.",
  },
];

export function ControlsTable() {
  return <ReferenceTable rows={ROWS} firstColumn="Option" />;
}
