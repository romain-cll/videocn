import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Les tableaux de la doc, à la manière des « API Reference » de shadcn : pas
 * de cadre, des lignes fines, des en-têtes muted de 12 px, le code en mono.
 *
 * `overflow-x-auto` : sur mobile, les types sont plus larges que l'écran, et
 * c'est le tableau qui défile, pas la page.
 */
export function DocsTable({
  columns,
  children,
}: {
  columns: readonly string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="text-muted-foreground py-2 pr-4 text-xs font-medium last:pr-0"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}

/** Une cellule de tableau ; `code` la passe en mono, pour un nom ou un type. */
export function DocsCell({
  code = false,
  strong = false,
  wide = false,
  children,
}: {
  code?: boolean;
  strong?: boolean;
  /** Une largeur plancher : sur mobile, le tableau défile au lieu d'écraser la description. */
  wide?: boolean;
  children: ReactNode;
}) {
  if (code) {
    return (
      <td className="py-3 pr-4 align-top last:pr-0">
        <code
          className={
            strong
              ? "bg-muted text-foreground rounded-md px-1 py-0.5 font-mono text-xs whitespace-nowrap"
              : "text-muted-foreground font-mono text-xs"
          }
        >
          {children}
        </code>
      </td>
    );
  }
  return (
    <td
      className={cn(
        "py-3 pr-4 align-top last:pr-0",
        strong ? "text-foreground" : "text-muted-foreground leading-relaxed text-pretty",
        wide && "min-w-56",
      )}
    >
      {children}
    </td>
  );
}

/** Une ligne par prop ou par option. */
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
    <DocsTable columns={[firstColumn, "Type", "Default", "Description"]}>
      {rows.map((row) => (
        <tr key={row.name}>
          <DocsCell code strong>
            {row.name}
          </DocsCell>
          <DocsCell code>{row.type}</DocsCell>
          <DocsCell code>{row.defaultValue ?? "—"}</DocsCell>
          <DocsCell wide>{row.description}</DocsCell>
        </tr>
      ))}
    </DocsTable>
  );
}
