"use client";

/** Bouchon : remplacé par le carrousel de trois fenêtres et son halo. */

import { EXAMPLES } from "@/components/examples";
import { BrowserWindow } from "@/components/landing/browser-window";
import { ScaledFrame } from "@/components/landing/scaled-frame";

export function HeroCarousel() {
  const { slug, Component } = EXAMPLES[0];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <BrowserWindow slug={slug} className="h-[560px] mask-b-from-80%">
        <ScaledFrame>
          <Component />
        </ScaledFrame>
      </BrowserWindow>
    </div>
  );
}
