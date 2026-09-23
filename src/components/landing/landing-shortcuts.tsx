"use client";

/**
 * `KeyboardShortcuts` lit ses pas dans `controls-options`, un module client :
 * rendu depuis une page serveur, il recevrait des références client au lieu
 * de nombres. Cette frontière le rend côté client, sans toucher au composant
 * que partage la démo.
 */

import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

export function LandingShortcuts() {
  return <KeyboardShortcuts />;
}
