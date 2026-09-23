"use client";

/**
 * Panneau de debug du socle — outil de développement du site, **jamais
 * distribué** : il vit dans `src/`, aucun item du registry ne le référence.
 *
 * Il sert à voir bouger pour de vrai ce que le lecteur produit, tant qu'aucun
 * contrôle n'existe pour le montrer.
 *
 * Il lit l'élément `<video>` directement, par `useObservedVideo`, et n'écrit
 * jamais rien : monter le panneau ne peut pas changer le comportement du
 * lecteur qu'il inspecte, ce qui est la condition pour lui faire confiance
 * quand on debug. Ce que seul le lecteur sait — l'état de son moteur, ses
 * qualités — n'apparaît donc pas ici : ce sont ses contrôles, en phase 1, qui
 * le montreront.
 */

import { cn } from "@/lib/utils";
import { useObservedVideo } from "@/hooks/use-observed-video";

/** `duration` vaut NaN avant les métadonnées et Infinity en live. */
function formatSeconds(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(2)} s` : "—";
}

function formatBoolean(value: boolean) {
  return value ? "yes" : "no";
}

const READY_STATES = [
  "HAVE_NOTHING",
  "HAVE_METADATA",
  "HAVE_CURRENT_DATA",
  "HAVE_FUTURE_DATA",
  "HAVE_ENOUGH_DATA",
];

const NETWORK_STATES = ["EMPTY", "IDLE", "LOADING", "NO_SOURCE"];

function formatError(error: MediaError | null) {
  if (!error) return "—";
  return `${error.code} — ${error.message || "no message"}`;
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
  const video = useObservedVideo(videoRef);

  return (
    <div className="bg-muted/40 divide-y rounded-lg border">
      <div className="px-4 py-3">
        <h2 className="text-sm font-medium">Element state</h2>
        <p className="text-muted-foreground mt-1 text-xs text-pretty">
          Read-only. Play, pause, change the speed from the bar: everything here should move.
        </p>
      </div>

      <Section title="Playhead">
        {/* Les seules valeurs qui passent par le store du lecteur, donc par
            sa boucle `requestAnimationFrame` : elles doivent défiler finement,
            pas par paliers de 250 ms. Les bornes du buffer sont celles de la
            plage qui contient la tête : après un saut, `bufferedStart` doit
            suivre, et non rester à zéro. */}
        <Row label="currentTime" value={formatSeconds(video.currentTime)} />
        <Row label="bufferedStart" value={formatSeconds(video.bufferedStart)} />
        <Row label="bufferedEnd" value={formatSeconds(video.bufferedEnd)} />
      </Section>

      <Section title="Playback">
        <Row label="duration" value={formatSeconds(video.duration)} />
        <Row label="paused" value={formatBoolean(video.paused)} />
        <Row label="ended" value={formatBoolean(video.ended)} />
        <Row label="isBuffering" value={formatBoolean(video.isBuffering)} />
        <Row label="volume" value={video.volume.toFixed(2)} />
        <Row label="muted" value={formatBoolean(video.muted)} />
        <Row label="playbackRate" value={`${video.playbackRate.toFixed(2)}×`} />
      </Section>

      <Section title="Loading">
        <Row
          label="readyState"
          value={`${video.readyState} — ${READY_STATES[video.readyState] ?? "?"}`}
        />
        <Row
          label="networkState"
          value={`${video.networkState} — ${NETWORK_STATES[video.networkState] ?? "?"}`}
        />
        <Row label="error" value={formatError(video.error)} alert={video.error !== null} />
      </Section>

      <Section title="Display">
        <Row label="isFullscreen" value={formatBoolean(video.isFullscreen)} />
        <Row label="isPictureInPicture" value={formatBoolean(video.isPictureInPicture)} />
      </Section>
    </div>
  );
}
