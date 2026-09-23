import { Fragment } from "react";

import { Kbd } from "@/components/ui/kbd";
import { DEFAULT_SEEK_STEP, DEFAULT_VOLUME_STEP } from "@/registry/videocn/controls-options";

/**
 * La keymap du lecteur, écrite pour qui s'en sert. Sans prop : elle décrit le
 * lecteur tel qu'il est livré, et les pages de documentation la reprendront
 * telle quelle.
 *
 * Les pas viennent du code distribué lui-même : si le lecteur change le sien,
 * la page suit sans qu'on ait à s'en souvenir.
 */

interface Shortcut {
  keys: readonly string[];
  /**
   * Ce qui s'affiche entre deux touches. Jamais un `+` : aucune de ces touches
   * ne se combine, chacune suffit seule.
   */
  joiner?: string;
  action: string;
}

const SHORTCUTS: readonly Shortcut[] = [
  { keys: ["Space", "K"], joiner: "or", action: "Play / pause" },
  { keys: ["←", "→"], joiner: "/", action: `Seek back / forward ${DEFAULT_SEEK_STEP} s` },
  {
    keys: ["↑", "↓"],
    joiner: "/",
    action: `Volume up / down ${Math.round(DEFAULT_VOLUME_STEP * 100)}%`,
  },
  { keys: ["M"], action: "Mute / unmute" },
  { keys: ["F"], action: "Fullscreen" },
  { keys: ["0", "9"], joiner: "–", action: "Jump to 0%, 10%… 90% of the video" },
];

export function KeyboardShortcuts() {
  return (
    <section className="bg-muted/40 divide-y rounded-lg border">
      <div className="px-4 py-3">
        <h2 className="text-sm font-medium">Keyboard shortcuts</h2>
        <p className="text-muted-foreground mt-1 text-xs text-pretty">
          Active as soon as the player has focus: one click on the picture is enough. On a
          focused slider, seek or volume, the arrows drive that slider.
        </p>
      </div>
      <dl className="flex flex-col gap-2 px-4 py-3 text-xs">
        {SHORTCUTS.map(({ keys, joiner, action }) => (
          <div key={action} className="flex items-center gap-4">
            <dt className="flex w-28 shrink-0 items-center gap-1">
              {keys.map((key, index) => (
                <Fragment key={key}>
                  {index > 0 && <span className="text-muted-foreground">{joiner}</span>}
                  <Kbd>{key}</Kbd>
                </Fragment>
              ))}
            </dt>
            <dd>{action}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
