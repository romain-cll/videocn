"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

import type { PlayheadSnapshot, PlayheadStore } from "./player-store";
import type { PlayerActions, PlayerState, UsePlayerResult } from "./use-player";

/**
 * L'état est détenu une fois, par le composant racine, et distribué ici. Les
 * contrôles lisent et rendent ; aucun d'eux ne détient d'état, sans quoi deux
 * contrôles pourraient afficher deux vérités différentes.
 *
 * Deux contextes et non un seul. `useContext` s'abonne à la valeur entière : un
 * contexte unique re-rendrait le bouton plein écran à chaque cran du curseur de
 * volume, alors qu'il ne lit aucun état. Ce qui ne change jamais — les actions
 * et le store de la tête de lecture — est donc isolé de ce qui change.
 *
 * L'isolation ne porte que sur les composants mémoïsés : un contrôle rendu à
 * chaque rendu de `<VideoCn>` se re-rendra de toute façon. C'est en posant la
 * barre, avec ses contrôles, que la séparation prendra son sens.
 */

interface PlayerControls {
  actions: PlayerActions;
  playhead: PlayheadStore;
}

const PlayerStateContext = createContext<PlayerState | null>(null);
const PlayerControlsContext = createContext<PlayerControls | null>(null);

export interface PlayerProviderProps {
  value: UsePlayerResult;
  children: ReactNode;
}

export function PlayerProvider({ value, children }: PlayerProviderProps) {
  const { state, actions, playhead } = value;
  // Stable pour la vie du composant : `actions` est mémoïsé par `usePlayer` et
  // le store est créé une seule fois.
  const controls = useMemo(() => ({ actions, playhead }), [actions, playhead]);

  return (
    <PlayerControlsContext.Provider value={controls}>
      <PlayerStateContext.Provider value={state}>{children}</PlayerStateContext.Provider>
    </PlayerControlsContext.Provider>
  );
}

function useControls(): PlayerControls {
  const controls = useContext(PlayerControlsContext);
  if (!controls) {
    throw new Error("Les contrôles du lecteur doivent être rendus dans <VideoCn>.");
  }
  return controls;
}

/** L'état discret : lecture, durée, volume, plein écran, capacités, erreur. */
export function usePlayerState(): PlayerState {
  const state = useContext(PlayerStateContext);
  if (!state) {
    throw new Error("Les contrôles du lecteur doivent être rendus dans <VideoCn>.");
  }
  return state;
}

/** Les actions. Leurs références sont stables : les passer en prop ne re-rend rien. */
export function usePlayerActions(): PlayerActions {
  return useControls().actions;
}

/**
 * La tête de lecture, rafraîchie à chaque frame. Réservé à ce qui en a vraiment
 * besoin : le scrubber et l'horodatage.
 */
export function usePlayhead(): PlayheadSnapshot {
  const { playhead } = useControls();
  return useSyncExternalStore(playhead.subscribe, playhead.getSnapshot, playhead.getServerSnapshot);
}
