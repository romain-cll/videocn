"use client";

/**
 * Panneau de debug du socle — outil de développement du site, **jamais
 * distribué** : il vit dans `src/`, aucun item du registry ne le référence.
 *
 * Il sert à voir bouger pour de vrai ce que le lecteur expose, tant qu'aucun
 * contrôle n'existe pour le montrer. Il est prévu pour durer jusqu'à la phase 4,
 * où c'est lui qui dira ce que le moteur Shaka remonte comme qualités, comme
 * état live et comme erreurs.
 *
 * Il observe et ne pilote rien : `usePlayer` est appelé sans `options.src`,
 * donc en mode observation pure. Monter le panneau ne peut pas changer le
 * comportement du lecteur qu'il inspecte — c'est la condition pour lui faire
 * confiance quand on debug.
 */

import { useSyncExternalStore } from "react";

import { usePlayer } from "@/registry/videocn/use-player";
import { cn } from "@/lib/utils";

/** `duration` vaut NaN avant les métadonnées et Infinity en live. */
function formatSeconds(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(2)} s` : "—";
}

function formatBoolean(value: boolean) {
  return value ? "oui" : "non";
}

function Row({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  // Fragment : `dt` et `dd` doivent rester enfants directs de la grille du `dl`.
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("truncate font-mono tabular-nums", alert && "text-destructive")}>
        {value}
      </dd>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-4 py-3">
      <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
        {title}
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">{children}</dl>
    </section>
  );
}

export function PlayerDebugPanel({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const { state, playhead } = usePlayer(videoRef);

  // La tête de lecture ne transite pas par `state` : elle avance à chaque frame
  // et re-rendrait tout le lecteur. Seul ce panneau s'abonne au store, donc seul
  // ce panneau se re-rend à 60 Hz — c'est exactement ce qu'on vient vérifier ici.
  const { currentTime, bufferedEnd } = useSyncExternalStore(
    playhead.subscribe,
    playhead.getSnapshot,
    playhead.getServerSnapshot,
  );

  return (
    <div className="bg-muted/40 divide-y rounded-lg border">
      <div className="px-4 py-3">
        <h2 className="text-sm font-medium">État du socle</h2>
        <p className="text-muted-foreground mt-1 text-xs text-pretty">
          Lecture seule. Jouez, mettez en pause, déplacez la tête de lecture avec les contrôles
          natifs : tout doit bouger ici.
        </p>
      </div>

      <Section title="Tête de lecture">
        <Row label="currentTime" value={formatSeconds(currentTime)} />
        <Row label="bufferedEnd" value={formatSeconds(bufferedEnd)} />
      </Section>

      <Section title="Lecture">
        <Row label="duration" value={formatSeconds(state.duration)} />
        <Row label="paused" value={formatBoolean(state.paused)} />
        <Row label="ended" value={formatBoolean(state.ended)} />
        {/* `isBuffering` décrit le flux, `engineStatus` le moteur : le MVP
            exige qu'on puisse les distinguer, c'est ici qu'on le vérifie. */}
        <Row label="isBuffering" value={formatBoolean(state.isBuffering)} />
        <Row label="volume" value={state.volume.toFixed(2)} />
        <Row label="muted" value={formatBoolean(state.muted)} />
        <Row label="playbackRate" value={`${state.playbackRate.toFixed(2)}×`} />
      </Section>

      <Section title="Moteur">
        <Row label="engineStatus" value={state.engineStatus} />
        <Row
          label="error"
          value={state.error ? `${state.error.code} — ${state.error.message}` : "—"}
          alert={state.error !== null}
        />
        <Row label="qualities" value={String(state.capabilities.qualities.length)} />
        <Row label="isLive" value={formatBoolean(state.capabilities.isLive)} />
      </Section>

      <Section title="Capacités">
        {/* Réserve : en observation le hook n'écrit rien, donc il ne sonde pas
            `video.volume` et `canControlVolume` reste à sa valeur optimiste.
            C'est le lecteur, lui, qui sonde — et qui trouvera `false` sur
            iPhone, où Safari ignore les écritures de volume. */}
        <Row label="canControlVolume" value={formatBoolean(state.canControlVolume)} />
        <Row label="canFullscreen" value={formatBoolean(state.canFullscreen)} />
        <Row label="isFullscreen" value={formatBoolean(state.isFullscreen)} />
        <Row label="canPictureInPicture" value={formatBoolean(state.canPictureInPicture)} />
        <Row label="isPictureInPicture" value={formatBoolean(state.isPictureInPicture)} />
      </Section>
    </div>
  );
}
