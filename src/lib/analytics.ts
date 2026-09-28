/**
 * Les événements Plausible du site. Le script est chargé par le layout ; sa
 * file `window.plausible.q` accepte les appels avant qu'il ne soit prêt.
 *
 * Chaque nom d'événement doit exister comme objectif (« goal ») dans Plausible
 * pour apparaître dans le tableau de bord.
 */

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

export interface AnalyticsEvent {
  name: "Copy install command";
  props?: Record<string, string>;
}

export function trackEvent({ name, props }: AnalyticsEvent) {
  window.plausible?.(name, props ? { props } : undefined);
}

/** La copie de la commande d'installation, et l'endroit d'où elle vient. */
export function copyInstallEvent(location: "hero" | "install-section" | "docs"): AnalyticsEvent {
  return { name: "Copy install command", props: { location } };
}
