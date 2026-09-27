/**
 * L'état du playground et sa traduction en props de `<VideoCn>`.
 *
 * L'état est à plat — un interrupteur par clé, une valeur par réglage — parce
 * que c'est ce que le panneau manipule. La traduction, elle, n'émet que ce qui
 * s'écarte des défauts de `resolveControlsOptions` : c'est ce qu'on passe au
 * lecteur, donc ce que l'extrait affiche, et un extrait qui recopierait les
 * treize clés ne dirait plus ce qui a été réglé.
 */

import { BUNNY_CHAPTERS, type DemoSourceId } from "@/lib/demo-media";
import type { PaletteId, RadiusId } from "@/components/theme-picker";
import {
  DEFAULT_AUTO_HIDE_DELAY,
  type ControlsOptions,
} from "@/registry/videocn/controls-options";

/** Les clés booléennes de `ControlsOptions`, dans l'ordre de l'interface. */
export const CONTROL_TOGGLES = [
  "play",
  "scrubber",
  "time",
  "volume",
  "fullscreen",
  "pictureInPicture",
  "chapters",
  "playbackRate",
  "quality",
  "live",
  "keyboard",
] as const;

export type ControlToggle = (typeof CONTROL_TOGGLES)[number];

export const VISIBILITIES = ["auto", "always", "never"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

/** Quelques délais, dont le défaut : un champ libre n'apprendrait rien de plus. */
export const AUTO_HIDE_DELAYS = [1000, DEFAULT_AUTO_HIDE_DELAY, 5000] as const;

/** `default` laisse les vitesses du lecteur ; `short` en montre une liste réglée. */
export const RATE_PRESETS = {
  default: undefined,
  short: [1, 1.5, 2],
} as const;
export type RatePreset = keyof typeof RATE_PRESETS;

export interface PlaygroundState {
  sourceId: DemoSourceId;
  chapters: boolean;
  toggles: Record<ControlToggle, boolean>;
  visibility: Visibility;
  autoHideDelay: number;
  scrubberChapters: boolean;
  ratePreset: RatePreset;
  autoPlay: boolean;
  loop: boolean;
  defaultMuted: boolean;
  palette: PaletteId;
  radius: RadiusId;
}

/** L'état initial : les défauts du lecteur, plus les chapitres pour qu'il y ait quelque chose à voir. */
export const DEFAULT_STATE: PlaygroundState = {
  sourceId: "mp4",
  chapters: true,
  toggles: Object.fromEntries(
    CONTROL_TOGGLES.map((key) => [key, true]),
  ) as Record<ControlToggle, boolean>,
  visibility: "auto",
  autoHideDelay: DEFAULT_AUTO_HIDE_DELAY,
  scrubberChapters: true,
  ratePreset: "default",
  autoPlay: false,
  loop: false,
  defaultMuted: false,
  palette: "neutral",
  radius: "default",
};

/**
 * `undefined` quand rien ne s'écarte des défauts : le lecteur reçoit alors
 * exactement ce qu'il recevrait d'un intégrateur qui n'a rien réglé.
 */
export function toControlsOptions(
  state: Pick<
    PlaygroundState,
    | "toggles"
    | "visibility"
    | "autoHideDelay"
    | "scrubberChapters"
    | "ratePreset"
  >,
): ControlsOptions | undefined {
  const options: ControlsOptions = {};

  if (state.visibility !== "auto") options.visibility = state.visibility;
  // Le délai ne vaut que pour une barre qui se masque : on ne l'émet pas ailleurs.
  if (
    state.visibility === "auto" &&
    state.autoHideDelay !== DEFAULT_AUTO_HIDE_DELAY
  ) {
    options.autoHideDelay = state.autoHideDelay;
  }

  for (const key of CONTROL_TOGGLES) {
    if (!state.toggles[key]) {
      options[key] = false;
      continue;
    }
    if (key === "scrubber" && !state.scrubberChapters)
      options.scrubber = { chapters: false };
    const rates = RATE_PRESETS[state.ratePreset];
    if (key === "playbackRate" && rates) options.playbackRate = { rates };
  }

  return Object.keys(options).length > 0 ? options : undefined;
}

/** La déclaration des chapitres, pour que l'extrait se copie et tourne tel quel. */
export const CHAPTERS_DECLARATION = `const chapters = [
${BUNNY_CHAPTERS.map((chapter) => `  { time: ${chapter.time}, label: ${JSON.stringify(chapter.label)} },`).join("\n")}
];`;
