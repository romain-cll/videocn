"use client";

import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

/**
 * `KeyboardShortcuts` lit ses pas dans `controls-options.ts`, qui est un module
 * `"use client"`. Importées depuis un composant serveur, ses constantes
 * arriveraient en références client et non en nombres : la frontière est donc
 * posée ici, et la page serveur ne rend que ce composant.
 */
export function DocsKeyboardShortcuts() {
  return <KeyboardShortcuts />;
}
