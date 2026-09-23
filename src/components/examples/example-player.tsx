"use client";

/**
 * Le lecteur d'un exemple, vivant ou figé.
 *
 * Sur la landing, les trois exemples sont montés à la fois, mais seul celui du
 * centre doit charger sa vidéo. Les deux autres lisent `ExampleLiveContext` à
 * `false` et n'affichent que le poster, dans le même cadre que le lecteur :
 * aucun `<video>`, donc aucune requête.
 *
 * Hors du carrousel — les pages `/examples/<slug>` — le contexte vaut `true`
 * par défaut et le lecteur est toujours vivant.
 */

import Image from "next/image";
import { createContext, useContext } from "react";

import type { ExampleVideo } from "@/components/examples/videos";
import { cn } from "@/lib/utils";
import { VideoCn, type VideoCnProps } from "@/registry/videocn/video-cn";

export const ExampleLiveContext = createContext(true);

interface ExamplePlayerProps extends Omit<VideoCnProps, "src" | "poster" | "ref"> {
  video: ExampleVideo;
}

export function ExamplePlayer({ video, className, ...props }: ExamplePlayerProps) {
  const live = useContext(ExampleLiveContext);

  if (live) {
    return <VideoCn src={video.src} poster={video.poster} className={className} {...props} />;
  }

  // Le même cadre que le conteneur de `VideoCn` : la fenêtre ne change pas de
  // forme quand elle passe au centre et que le vrai lecteur prend la place.
  return (
    <div
      className={cn(
        "bg-player-backdrop relative overflow-hidden rounded-lg border",
        video.aspectClassName,
        className,
      )}
    >
      <Image src={video.poster} alt="" fill sizes="50vw" className="object-cover" />
    </div>
  );
}
