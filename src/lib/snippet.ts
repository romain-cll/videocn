/**
 * Écrit le JSX d'un `<VideoCn>` tel qu'un intégrateur l'écrirait à la main.
 *
 * C'est le seul endroit où le site fabrique un extrait de code à partir de
 * props : la landing, le playground et la doc le partagent, pour que ce qu'on
 * affiche soit toujours ce qui est réellement passé au lecteur. Un
 * `JSON.stringify` ne convient pas — il cite les clés et ne ressemble pas à
 * du code React.
 */

import type { ControlsOptions } from "@/registry/videocn/controls-options";
import type { SourceType } from "@/registry/videocn/player-engine";

export interface SnippetProps {
  src: string;
  type?: SourceType;
  poster?: string;
  /**
   * Le nom de la variable qui porte les chapitres (`"chapters"`), pas le
   * tableau : on ne recopie pas sept lignes de données dans chaque extrait.
   */
  chapters?: string;
  autoPlay?: boolean;
  loop?: boolean;
  defaultVolume?: number;
  defaultMuted?: boolean;
  controls?: ControlsOptions;
}

type Value = string | number | boolean | readonly Value[] | { readonly [key: string]: Value | undefined };

function literal(value: Value, indent: string): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.map((item) => literal(item, indent)).join(", ")}]`;

  const entries = Object.entries(value as Record<string, Value | undefined>).filter(
    (entry): entry is [string, Value] => entry[1] !== undefined,
  );
  if (entries.length === 0) return "{}";
  // Un objet sans objet imbriqué tient sur une ligne, comme on l'écrirait.
  const flat = entries.every(([, item]) => typeof item !== "object" || Array.isArray(item));
  if (flat && entries.length <= 2) {
    return `{ ${entries.map(([key, item]) => `${key}: ${literal(item, indent)}`).join(", ")} }`;
  }
  const inner = `${indent}  `;
  return `{\n${entries.map(([key, item]) => `${inner}${key}: ${literal(item, inner)},`).join("\n")}\n${indent}}`;
}

export function videoCnSnippet(props: SnippetProps): string {
  const lines: string[] = [];
  const indent = "  ";

  lines.push(`src=${JSON.stringify(props.src)}`);
  if (props.type) lines.push(`type=${JSON.stringify(props.type)}`);
  if (props.poster) lines.push(`poster=${JSON.stringify(props.poster)}`);
  if (props.chapters) lines.push(`chapters={${props.chapters}}`);
  if (props.autoPlay) lines.push("autoPlay");
  if (props.loop) lines.push("loop");
  if (props.defaultVolume !== undefined) lines.push(`defaultVolume={${props.defaultVolume}}`);
  if (props.defaultMuted) lines.push("defaultMuted");
  if (props.controls && Object.values(props.controls).some((value) => value !== undefined)) {
    lines.push(`controls={${literal(props.controls as Value, indent)}}`);
  }

  if (lines.length === 1) return `<VideoCn ${lines[0]} />`;
  return `<VideoCn\n${lines.map((line) => `${indent}${line}`).join("\n")}\n/>`;
}
