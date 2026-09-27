"use client";

/**
 * Le playground : on règle les props à gauche, le lecteur change à droite, et
 * le JSX qui produit exactement ce lecteur s'écrit dessous.
 *
 * Une seule source de vérité, `state` : les props du lecteur en sont dérivées,
 * et l'extrait est écrit à partir de ces mêmes props, jamais d'une copie. Ce
 * qu'on copie est donc ce qui tourne.
 *
 * La ref de l'élément `<video>` est détenue ici, au-dessus du lecteur et du
 * panneau de debug. C'est le seul lien entre eux : le lecteur la reçoit et la
 * pose sur son `<video>`, le panneau la lit. Rien de ce que le panneau affiche
 * ne peut provoquer un rendu du lecteur.
 */

import { useMemo, useRef, useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { Frame } from "@/components/frame";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PlayerDebugPanel } from "@/components/player-debug-panel";
import { SettingsPanel } from "@/components/playground/settings-panel";
import { themeSnippet } from "@/lib/theme-snippet";
import {
  CHAPTERS_DECLARATION,
  DEFAULT_STATE,
  toControlsOptions,
  type PlaygroundState,
} from "@/components/playground/playground-state";
import { themeClassName } from "@/lib/demo-themes";
import { Button } from "@/components/ui/button";
import { BUNNY_CHAPTERS, getDemoSource } from "@/lib/demo-media";
import { videoCnSnippet } from "@/lib/snippet";
import { VideoCn } from "@/registry/videocn/video-cn";

/**
 * Le panneau de debug sert à développer le lecteur, pas au visiteur : il n'est
 * rendu qu'en `next dev`. Next remplace `process.env.NODE_ENV` par une
 * constante au build, donc en production le panneau et son import disparaissent
 * du bundle, pas seulement de l'affichage.
 */
const SHOW_DEBUG_PANEL = process.env.NODE_ENV === "development";

export function Playground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<PlaygroundState>(DEFAULT_STATE);
  const update = (patch: Partial<PlaygroundState>) =>
    setState((current) => ({ ...current, ...patch }));

  const source = getDemoSource(state.sourceId);
  const hasChapters = state.chapters && source.supportsChapters;
  // Couplés : un navigateur ne lance de lui-même qu'une vidéo muette.
  const defaultMuted = state.defaultMuted || state.autoPlay;

  // Mémoïsé : `VideoCn` résout ses options par `useMemo` sur l'identité de
  // l'objet, un littéral neuf à chaque rendu les recalculerait pour rien. On ne
  // dépend que des réglages de la barre : changer de palette ne la touche pas.
  const { toggles, visibility, autoHideDelay, scrubberChapters, ratePreset } =
    state;
  const controls = useMemo(
    () =>
      toControlsOptions({
        toggles,
        visibility,
        autoHideDelay,
        scrubberChapters,
        ratePreset,
      }),
    [toggles, visibility, autoHideDelay, scrubberChapters, ratePreset],
  );

  const code = useMemo(
    () =>
      videoCnSnippet({
        src: source.src,
        type: source.type,
        poster: source.poster,
        chapters: hasChapters ? "chapters" : undefined,
        autoPlay: state.autoPlay,
        loop: state.loop,
        defaultMuted,
        controls,
      }),
    [source, hasChapters, state.autoPlay, state.loop, defaultMuted, controls],
  );

  const themeCode = themeSnippet(state.palette, state.radius);
  const isDefault = JSON.stringify(state) === JSON.stringify(DEFAULT_STATE);

  // `autoPlay` et `defaultMuted` sont des valeurs initiales : les changer après
  // montage ne repilote pas l'élément. Ce sont les seules à remonter le lecteur,
  // par cette clé. Le panneau de debug porte la même, parce qu'il s'accroche à
  // l'élément une fois pour toutes et resterait sinon sur l'ancien.
  const mountKey = `${state.autoPlay}-${defaultMuted}`;

  return (
    // Sous `lg`, la colonne de droite passe en `contents` : ses enfants
    // deviennent ceux de la pile et s'intercalent avec le panneau par `order`
    // — lecteur, réglages, code. On règle sous les yeux du lecteur, et le code
    // se lit à la fin, une fois le réglage fait.
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <Frame
        label="VideoCnProps"
        className="order-2 lg:sticky lg:top-20 lg:order-first lg:w-72 lg:shrink-0"
        contentClassName="lg:max-h-[calc(100svh-7.5rem)] lg:overflow-y-auto"
      >
        <SettingsPanel state={state} update={update} />
      </Frame>

      <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-6">
        <Frame
          label="<VideoCn />"
          className="order-1"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(DEFAULT_STATE)}
              disabled={isDefault}
            >
              Reset
            </Button>
          }
        >
          {/* Le thème englobe le lecteur seul, comme le ferait celui d'un hôte :
              le panneau reste neutre et ne bouge pas sous le doigt. */}
          <div className={themeClassName(state.palette, state.radius)}>
            {/* Pas de `key` sur `src` : c'est le lecteur qui change de moteur
                sous la même balise, exactement comme chez un utilisateur qui
                changerait sa prop `src`. Remonter le composant masquerait ce
                chemin-là. */}
            <VideoCn
              key={mountKey}
              ref={videoRef}
              src={source.src}
              type={source.type}
              poster={source.poster}
              chapters={hasChapters ? BUNNY_CHAPTERS : undefined}
              autoPlay={state.autoPlay}
              loop={state.loop}
              defaultMuted={defaultMuted}
              controls={controls}
            />
          </div>
        </Frame>

        <div className="order-3 flex min-w-0 flex-col gap-3">
          <CodeBlock code={code} title="page.tsx" />
          {/* À part : sept lignes de données au-dessus du JSX le repousseraient hors de vue. */}
          {hasChapters && (
            <CodeBlock code={CHAPTERS_DECLARATION} title="chapters" />
          )}
          {themeCode && <CodeBlock code={themeCode} title="globals.css" />}
        </div>

        {SHOW_DEBUG_PANEL && (
          <div className="order-4 flex min-w-0 flex-col gap-3">
            <p className="text-muted-foreground text-xs text-pretty">
              The panel reads the element, not the controls: what it shows
              proves the action really reached the video.
            </p>
            <PlayerDebugPanel key={mountKey} videoRef={videoRef} />
          </div>
        )}

        <div className="order-5 min-w-0">
          <KeyboardShortcuts />
        </div>
      </div>
    </div>
  );
}
