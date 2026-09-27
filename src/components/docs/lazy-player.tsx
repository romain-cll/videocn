"use client";

/**
 * Le lecteur des aperçus de la doc, monté seulement quand il sert.
 *
 * La page porte sept aperçus : les monter tous au chargement tirerait sept
 * `<video>` et leurs métadonnées pour un visiteur qui n'en regardera qu'un.
 * Deux modes :
 *
 * - `load="visible"` (MP4) : le vrai lecteur remplace le poster dès que
 *   l'aperçu entre dans le viewport, et reste monté ensuite — un lecteur qui
 *   disparaîtrait au scroll couperait la lecture.
 * - `load="click"` (HLS, direct) : rien ne se charge avant un clic. Un flux
 *   tire Shaka Player (≈ 260 kB gzip), un manifeste et des segments en continu ;
 *   le déclencher au simple passage du scroll ferait payer tout ça à qui ne
 *   fait que traverser la page. Un seul flux est monté à la fois : en charger
 *   un rend l'autre à son cadre vide.
 */

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { bundleSize } from "@/lib/bundle";
import { cn } from "@/lib/utils";
import { VideoCn, type VideoCnProps } from "@/registry/videocn/video-cn";

/**
 * Les proportions du cadre d'attente, calées sur les films : le cadre ne
 * change pas de hauteur quand le vrai lecteur prend sa place.
 */
const RATIOS = {
  video: "aspect-video",
  sintel: "aspect-256/109",
  tearsOfSteel: "aspect-12/5",
} as const;

export type LazyPlayerRatio = keyof typeof RATIOS;

// Le flux actuellement monté, partagé par tous les aperçus de la page.
let activeStream: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setActiveStream(id: string) {
  activeStream = id;
  for (const listener of listeners) listener();
}

const getActiveStream = () => activeStream;
const getServerActiveStream = () => null;

interface LazyPlayerProps extends Omit<VideoCnProps, "ref" | "className"> {
  load?: "visible" | "click";
  ratio?: LazyPlayerRatio;
}

export function LazyPlayer({ load = "visible", ratio = "video", ...props }: LazyPlayerProps) {
  const id = useId();
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const stream = useSyncExternalStore(subscribe, getActiveStream, getServerActiveStream);

  useEffect(() => {
    if (load !== "visible" || visible) return;
    const element = placeholderRef.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [load, visible]);

  const mounted = load === "visible" ? visible : stream === id;
  const aspect = RATIOS[ratio];

  if (mounted) return <VideoCn className={aspect} {...props} />;

  return (
    <div
      ref={placeholderRef}
      className={cn("bg-muted relative overflow-hidden rounded-lg border", aspect)}
    >
      {props.poster && (
        // eslint-disable-next-line @next/next/no-img-element -- le poster tel que le lecteur l'affichera, sans passer par l'optimiseur d'images.
        <img
          src={props.poster}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      )}
      {load === "click" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
          <Button variant="outline" size="sm" onClick={() => setActiveStream(id)}>
            Load stream
          </Button>
          <p className="text-muted-foreground text-xs">
            Loads Shaka Player, {bundleSize.shaka.gzip} gzipped
          </p>
        </div>
      )}
    </div>
  );
}
