"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

import type { ResolvedControlsOptions } from "./controls-options";

/**
 * Ce que la barre distribue à ses contrôles. Conséquence directe : **aucun
 * contrôle ne reçoit de prop**. Chacun lit ce dont il a besoin et se rend
 * `null` si son option est désactivée — ce qui les rend mémoïsables, et ce qui
 * permet d'en écrire plusieurs en parallèle sans contrat entre eux.
 *
 * Quatre contextes et non un seul, pour la même raison que dans
 * `player-context.tsx` : ils ne changent pas au même rythme. Les options ne
 * changent jamais, le verrou non plus, la visibilité bascule souvent, la
 * largeur seulement quand le lecteur franchit son seuil. Un menu qui pose un
 * verrou n'a aucune raison de se re-rendre parce que la barre vient
 * d'apparaître.
 */

const ControlsOptionsContext = createContext<ResolvedControlsOptions | null>(null);
const ControlsVisibleContext = createContext<boolean | null>(null);
const ControlsHoldContext = createContext<(() => () => void) | null>(null);
// `null` est une valeur légitime ici (« pas encore mesurée »), donc le défaut
// est `null` et `useControlsNarrow` ne lève jamais d'erreur hors fournisseur.
const ControlsNarrowContext = createContext<boolean | null>(null);

export interface ControlsProviderProps {
  options: ResolvedControlsOptions;
  visible: boolean;
  /** Pose un verrou et renvoie sa libération. Référence stable. */
  holdVisible: () => () => void;
  children: ReactNode;
}

export function ControlsProvider({
  options,
  visible,
  holdVisible,
  children,
}: ControlsProviderProps) {
  return (
    <ControlsOptionsContext.Provider value={options}>
      <ControlsHoldContext.Provider value={holdVisible}>
        <ControlsVisibleContext.Provider value={visible}>
          {children}
        </ControlsVisibleContext.Provider>
      </ControlsHoldContext.Provider>
    </ControlsOptionsContext.Provider>
  );
}

export interface ControlsNarrowProviderProps {
  /**
   * Vrai quand la boîte de contenu de la barre est sous le seuil de 30rem,
   * faux au-dessus, `null` tant que la première mesure n'a pas eu lieu (rendu
   * serveur et rendu d'hydratation compris).
   */
  narrow: boolean | null;
  children: ReactNode;
}

/**
 * Fournit la largeur de la barre, mesurée par `PlayerControls`. Un fournisseur
 * à part : la valeur ne change qu'au franchissement du seuil, et elle ne doit
 * pas re-rendre les contrôles qui ne lisent que la visibilité ou les options.
 */
export function ControlsNarrowProvider({ narrow, children }: ControlsNarrowProviderProps) {
  return <ControlsNarrowContext.Provider value={narrow}>{children}</ControlsNarrowContext.Provider>;
}

function missing(): never {
  throw new Error("The player controls must be rendered inside <VideoCn>.");
}

export function useControlsOptions(): ResolvedControlsOptions {
  return useContext(ControlsOptionsContext) ?? missing();
}

export function useControlsVisible(): boolean {
  const visible = useContext(ControlsVisibleContext);
  if (visible === null) missing();
  return visible;
}

/**
 * La barre est-elle sous le seuil de 30rem (un lecteur d'environ 506 px) ?
 * `true` : les contrôles de la barre large (chapitres, sous-titres,
 * Picture-in-Picture) se rendent `null` et passent par le menu de réglages.
 * `null` : pas encore mesurée, c'est à la garde CSS de décider le temps d'un
 * rendu que personne ne peint.
 */
export function useControlsNarrow(): boolean | null {
  return useContext(ControlsNarrowContext);
}

/**
 * Empêche l'auto-masquage tant que `active` est vrai — un menu ouvert ne peut
 * pas voir sa barre disparaître sous lui. Un compteur plutôt qu'un booléen
 * partagé : les phases 4 à 6 ajouteront d'autres menus, et deux verrous posés
 * en même temps ne doivent pas s'écraser l'un l'autre.
 */
export function useHoldControlsVisible(active: boolean): void {
  const holdVisible = useContext(ControlsHoldContext) ?? missing();

  useEffect(() => {
    if (!active) return;
    return holdVisible();
  }, [active, holdVisible]);
}
