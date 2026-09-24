"use client";

/**
 * Montage de la démo : le lecteur d'un côté, le panneau de debug de l'autre.
 *
 * La ref de l'élément `<video>` est détenue ici, au-dessus des deux. C'est le
 * seul lien entre eux : le lecteur la reçoit et la pose sur son `<video>`, le
 * panneau la lit. Aucun état ne transite par ce composant, donc rien de ce que
 * le panneau affiche ne peut provoquer un rendu du lecteur.
 */

import { useRef, useState } from "react";

import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PlayerDebugPanel } from "@/components/player-debug-panel";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { VideoCn } from "@/registry/videocn/video-cn";

/**
 * Big Buck Bunny en MP4 progressif : le moteur natif suffit, aucun JavaScript
 * de streaming. Dix minutes, assez pour voir la tête de lecture avancer et le
 * buffer grandir — un extrait de dix secondes ne montrerait ni l'un ni l'autre.
 *
 * L'URL du bucket `gtv-videos-bucket`, longtemps la référence pour ce fichier,
 * répond 403 depuis : ne pas y revenir.
 */
const DEMO_SRC =
  "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4";

/**
 * Les quatre sources du périmètre, servies par le même `<VideoCn>` : c'est tout
 * l'intérêt de l'interface moteur. Le MP4 ne charge pas une ligne de Shaka ; le
 * HLS et le DASH le chargent à la volée ; le direct ouvre une fenêtre glissante
 * au lieu d'une durée.
 *
 * Aucune n'est hébergée par nous, et c'est volontaire : le lecteur ne consomme
 * que des formats standard du web, jamais une API videoCn.
 */
const SOURCES = [
  {
    id: "mp4",
    label: "MP4",
    src: DEMO_SRC,
    note: "Native engine. Nothing to pick: the browser says nothing about what is inside a progressive file, so the quality button stays disabled.",
  },
  {
    id: "hls",
    label: "HLS",
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    note: "Shaka, loaded on demand. Five qualities, from 184p to 1080p, and adaptive picks for you until you pick yourself.",
  },
  {
    id: "dash",
    label: "DASH",
    src: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
    note: "Same player, same engine, another manifest. Nothing changes in the interface.",
  },
  {
    id: "live",
    label: "Live",
    src: "https://demo.unified-streaming.com/k8s/live/stable/scte35.isml/.m3u8",
    note: "A live stream with about fifteen minutes of window: you can seek back inside it, and the badge brings you back to the edge.",
  },
] as const;

type SourceId = (typeof SOURCES)[number]["id"];

export function PlayerDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sourceId, setSourceId] = useState<SourceId>("mp4");

  // Jamais `undefined` : le groupe ne permet pas de tout désélectionner, et on
  // ignore une valeur vide plutôt que de laisser le lecteur sans source.
  const source = SOURCES.find((candidate) => candidate.id === sourceId) ?? SOURCES[0];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-5">
      {/* Trois cinquièmes pour la vidéo, deux pour le panneau : au-dessous de
          `lg`, la grille retombe sur une colonne et l'un passe sous l'autre. */}
      <div className="flex flex-col gap-3 lg:col-span-3">
        {/* Aucune classe : le lecteur possède son apparence — c'est tout
            l'intérêt de le voir ici tel qu'il arrivera chez l'utilisateur. */}
        <ToggleGroup
          value={[source.id]}
          onValueChange={(value) => {
            const next = value[0];
            if (next) setSourceId(next as SourceId);
          }}
          variant="outline"
          size="sm"
        >
          {SOURCES.map((candidate) => (
            <ToggleGroupItem key={candidate.id} value={candidate.id}>
              {candidate.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {/* `key` sur la source : changer de moteur repart d'un élément neuf,
            plutôt que de laisser le suivant hériter d'un `<video>` qui porte
            encore l'état du précédent. */}
        <VideoCn key={source.id} ref={videoRef} src={source.src} />
        <p className="text-muted-foreground text-xs text-pretty">{source.note}</p>
        <p className="text-muted-foreground text-xs text-pretty">
          The panel reads the element, not the controls: what it shows proves the action really
          reached the video.
        </p>
        <KeyboardShortcuts />
      </div>
      <div className="lg:col-span-2">
        <PlayerDebugPanel videoRef={videoRef} />
      </div>

      {/* Le même lecteur, réglé par la seule prop `controls` : rien n'a été
          édité dans le code livré, et c'est tout l'enjeu. */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        <h2 className="text-sm font-medium">Configured through props</h2>
        <VideoCn
          src={DEMO_SRC}
          controls={{
            pictureInPicture: false,
            playbackRate: { rates: [1, 1.5, 2] },
            autoHideDelay: 1000,
            keyboard: false,
          }}
        />
        <p className="text-muted-foreground text-xs text-pretty">
          No Picture-in-Picture, three speeds instead of seven, a bar that hides after one second,
          no keyboard shortcuts.
        </p>
      </div>
    </div>
  );
}
