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
  { keys: ["Espace", "K"], joiner: "ou", action: "Lecture / pause" },
  { keys: ["←", "→"], joiner: "/", action: `Reculer / avancer de ${DEFAULT_SEEK_STEP} s` },
  {
    keys: ["↑", "↓"],
    joiner: "/",
    action: `Monter / baisser le volume de ${Math.round(DEFAULT_VOLUME_STEP * 100)} %`,
  },
  { keys: ["M"], action: "Couper / rétablir le son" },
  { keys: ["F"], action: "Plein écran" },
  { keys: ["0", "9"], joiner: "–", action: "Aller à 0 %, 10 %… 90 % de la vidéo" },
];

export function KeyboardShortcuts() {
  return (
    <section className="bg-muted/40 divide-y rounded-lg border">
      <div className="px-4 py-3">
        <h2 className="text-sm font-medium">Raccourcis clavier</h2>
        <p className="text-muted-foreground mt-1 text-xs text-pretty">
          Actifs dès que le lecteur a le focus : un clic sur l&apos;image suffit. Sur un curseur
          focalisé, progression ou volume, les flèches pilotent ce curseur.
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
