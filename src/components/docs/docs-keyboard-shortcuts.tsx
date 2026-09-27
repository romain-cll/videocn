"use client";

/**
 * Le tableau des raccourcis de la doc. Client : les pas sont lus dans
 * `controls-options.ts`, module `"use client"` ; importées depuis un composant
 * serveur, ses constantes arriveraient en références client et non en nombres.
 *
 * Les lignes de `KeyboardShortcuts`, importées et non recopiées, mais en
 * tableau et sans son titre : ici, c'est le H2 de la section qui nomme le bloc.
 */

import { Fragment } from "react";

import { DocsTable } from "@/components/docs/reference-table";
import { Kbd } from "@/components/ui/kbd";
import { SHORTCUTS } from "@/components/keyboard-shortcuts";

export function DocsKeyboardShortcuts() {
  return (
    <DocsTable columns={["Keys", "Action"]}>
      {SHORTCUTS.map(({ keys, joiner, action }) => (
        <tr key={action}>
          <td className="py-2.5 pr-4 align-middle">
            <span className="flex items-center gap-1 whitespace-nowrap">
              {keys.map((key, index) => (
                <Fragment key={key}>
                  {index > 0 && <span className="text-muted-foreground text-xs">{joiner}</span>}
                  <Kbd>{key}</Kbd>
                </Fragment>
              ))}
            </span>
          </td>
          <td className="text-muted-foreground py-2.5 align-middle">{action}</td>
        </tr>
      ))}
    </DocsTable>
  );
}
