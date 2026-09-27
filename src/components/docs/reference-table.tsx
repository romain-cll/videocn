import type { ReactNode } from "react";

/**
 * Le tableau de référence : une ligne par prop ou par option. Le nom, le type
 * et le défaut sont du code et s'affichent comme tel ; la description reste du
 * texte, et peut contenir du code en ligne.
 *
 * `overflow-x-auto` : sur mobile, les types sont plus larges que l'écran, et
 * c'est le tableau qui défile, pas la page.
 */
export interface ReferenceRow {
  name: string;
  type: string;
  /** Absent quand il n'y a pas de défaut à dire (une prop requise). */
  defaultValue?: string;
  description: ReactNode;
}

export function ReferenceTable({
  rows,
  firstColumn = "Prop",
}: {
  rows: readonly ReferenceRow[];
  firstColumn?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/40 border-b">
          <tr>
            <th className="px-4 py-2 font-medium">{firstColumn}</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Default</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.name} className="align-top">
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{row.name}</td>
              <td className="text-muted-foreground px-4 py-3 font-mono text-xs">{row.type}</td>
              <td className="text-muted-foreground px-4 py-3 font-mono text-xs whitespace-nowrap">
                {row.defaultValue ?? "—"}
              </td>
              <td className="text-muted-foreground px-4 py-3 text-pretty">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
