"use client";

/**
 * Le carrousel du hero : trois fenêtres empilées, un exemple par fenêtre.
 *
 * Les trois cartes restent montées en permanence ; seule leur position change.
 * Changer d'exemple ne démonte donc rien, sauf le lecteur : seule la carte du
 * centre passe `ExampleLiveContext` à `true`, les deux autres n'affichent que
 * un cadre figé. Il n'y a jamais qu'un `<video>` dans la page.
 *
 * La rotation automatique s'arrête pour de bon à la première interaction
 * (pointeur ou clavier) dans la région : on n'arrache jamais une vidéo à
 * quelqu'un qui la regarde.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { EXAMPLES } from "@/components/examples";
import { ExampleLiveContext } from "@/components/examples/example-player";
import { BrowserWindow } from "@/components/landing/browser-window";
import { ScaledFrame } from "@/components/landing/scaled-frame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROTATION_DELAY = 6000;

type Role = "center" | "right" | "left";

/** `(index − actif + n) % n` : 0 au centre, 1 à droite, 2 à gauche. */
const ROLES: readonly Role[] = ["center", "right", "left"];

// Tailwind v4 pose `translate` et `scale` en propriétés CSS distinctes, pas
// dans `transform` : c'est elles que la transition doit suivre.
const CARD_BASE =
  "absolute top-0 -bottom-16 left-0 w-full transition-[translate,scale] duration-700 ease-out motion-reduce:transition-none md:left-[14%] md:w-[72%]";

// Les cartes latérales disparaissent sous `md` : il n'y a pas la place de les
// montrer, et une fenêtre réduite de moitié ne se lirait plus.
const ROLE_CLASSES: Record<Role, string> = {
  center: "z-20",
  right: "z-10 translate-x-[22%] translate-y-6 scale-[0.86] max-md:hidden",
  left: "z-10 -translate-x-[22%] translate-y-6 scale-[0.86] max-md:hidden",
};

// `prefers-reduced-motion` lu comme un store externe : la valeur suit les
// changements de réglage sans effet ni état en double.
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reducedMotion = useReducedMotion();
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const rotating = !stopped && !hovered && !focused && !reducedMotion;

  // Un délai par exemple affiché plutôt qu'un intervalle : chaque changement,
  // automatique ou non, redonne six secondes pleines à la carte qui arrive.
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % EXAMPLES.length),
      ROTATION_DELAY,
    );
    return () => window.clearTimeout(timer);
  }, [rotating, active]);

  // Le bouton d'une carte latérale disparaît quand elle arrive au centre : le
  // focus suit la carte plutôt que de retomber sur `<body>`.
  function bringToCenter(index: number) {
    setActive(index);
    slideRefs.current[index]?.focus({ preventScroll: true });
  }

  return (
    // Les cartes latérales et le halo débordent de la scène. La région s'étend
    // sur la marge intérieure du hero (`px-6`) et coupe là horizontalement :
    // aucun défilement latéral de la page, quelle que soit sa largeur.
    <section
      aria-roledescription="carousel"
      aria-label="Player examples"
      className="isolate -mx-6 overflow-x-clip px-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onPointerDownCapture={() => setStopped(true)}
      onKeyDownCapture={() => setStopped(true)}
    >
      <div className="relative">
        {/* Le halo : une mosaïque façon graphe de contributions, pleine en
            bas, qui s'efface en montant jusqu'à un arc : haut sur les côtés, à
            hauteur du titre, bas au centre, où il effleure la commande. Il vit
            hors de la scène, sinon celle-ci le rognerait en haut.

            Deux masques empilés : le parent porte le fondu en arc — l'ellipse
            transparente creuse le haut, et le dégradé radial en fait le
            bord —, l'enfant découpe les carreaux dans `bg-hero-glow`. Le SVG ne
            donne que des opacités : la couleur reste un token et suit le mode
            sombre. Voir `scripts/generate-contribution-grid.mjs`. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-96 bottom-0 -z-10 mask-[radial-gradient(ellipse_50.2%_33.3%_at_50%_0,transparent_100%,var(--hero-glow)_200%)]"
        >
          <div className="bg-hero-glow size-full mask-[url(/landing/contribution-grid.svg)] mask-bottom mask-no-repeat" />
        </div>

        {/* Coupure nette en bas de la scène, sur toute la largeur : les fenêtres
            s'arrêtent sur une même ligne. `overflow-y-clip` coupe verticalement
            sans toucher au débordement latéral des cartes. */}
        <div className="relative h-[460px] overflow-y-clip md:h-[560px]">
          <div aria-live={rotating ? "off" : "polite"}>
            {EXAMPLES.map(({ slug, label, Component }, index) => {
              const role = ROLES[(index - active + EXAMPLES.length) % EXAMPLES.length];
              const isCenter = role === "center";

              return (
                <div
                  key={slug}
                  ref={(node) => {
                    slideRefs.current[index] = node;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${label}, ${index + 1} of ${EXAMPLES.length}`}
                  tabIndex={-1}
                  className={cn(CARD_BASE, ROLE_CLASSES[role], "outline-none")}
                >
                  <div inert={!isCenter} aria-hidden={!isCenter} className="size-full">
                    <ExampleLiveContext value={isCenter}>
                      <BrowserWindow slug={slug} className="h-full">
                        <ScaledFrame>
                          <Component />
                        </ScaledFrame>
                      </BrowserWindow>
                    </ExampleLiveContext>
                  </div>
                  {!isCenter && (
                    <button
                      type="button"
                      aria-label={`Show the ${label} example`}
                      className="focus-visible:ring-ring/50 absolute inset-0 cursor-pointer rounded-xl outline-none focus-visible:ring-3"
                      onClick={() => bringToCenter(index)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map(({ slug, label }, index) => (
          <Button
            key={slug}
            size="sm"
            variant={index === active ? "secondary" : "ghost"}
            className="rounded-full"
            aria-pressed={index === active}
            onClick={() => setActive(index)}
          >
            {label}
          </Button>
        ))}
      </div>
    </section>
  );
}
