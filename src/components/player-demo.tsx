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

import { CodeBlock } from "@/components/code-block";
import {
  ThemePicker,
  themeClassName,
  type PaletteId,
  type RadiusId,
} from "@/components/theme-picker";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PlayerDebugPanel } from "@/components/player-debug-panel";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
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
 * Big Buck Bunny découpé, pour voir les segments et le menu sur une vidéo dont
 * on connaît le déroulé. Les temps sont ceux du film ; rien ici ne vient d'une
 * API, c'est une liste écrite à la main comme celle qu'écrirait un
 * intégrateur.
 */
const BUNNY_CHAPTERS = [
  { time: 0, label: "Morning in the meadow" },
  { time: 70, label: "Big Buck Bunny wakes up" },
  { time: 150, label: "The butterfly" },
  { time: 230, label: "Frank, Rinky and Gamera" },
  { time: 330, label: "The ambush" },
  { time: 460, label: "Revenge" },
  { time: 560, label: "Credits" },
] as const;

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
    chapters: BUNNY_CHAPTERS,
    note: "Native engine. Nothing to pick: the browser says nothing about what is inside a progressive file, so the quality button stays disabled. Seven chapters, cutting the bar and filling a menu.",
  },
  {
    id: "hls",
    label: "HLS",
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    chapters: undefined,
    note: "Shaka, loaded on demand. Five qualities, from 184p to 1080p, and adaptive picks for you until you pick yourself.",
  },
  {
    id: "dash",
    label: "DASH",
    src: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
    chapters: BUNNY_CHAPTERS,
    note: "Same player, same engine, another manifest. Nothing changes in the interface.",
  },
  {
    id: "live",
    label: "Live",
    src: "https://demo.unified-streaming.com/k8s/live/stable/scte35.isml/.m3u8",
    // Volontaire, et le seul cas de cette page qui ne sert pas la vitrine :
    // une liste passée à un direct doit rester sans effet — ni segments, ni
    // bouton. Un clic sur « Live » suffit alors à le vérifier.
    chapters: BUNNY_CHAPTERS,
    note: "A live stream with about fifteen minutes of window: you can seek back inside it, and the badge brings you back to the edge. The chapters are ignored: a live window has no fixed timeline to cut.",
  },
] as const;

type SourceId = (typeof SOURCES)[number]["id"];

/**
 * Le panneau de debug sert à développer le lecteur, pas au visiteur : il n'est
 * rendu qu'en `next dev`. Next remplace `process.env.NODE_ENV` par une
 * constante au build, donc en production le panneau et son import disparaissent
 * du bundle, pas seulement de l'affichage.
 */
const SHOW_DEBUG_PANEL = process.env.NODE_ENV === "development";

/** Le réglage du second lecteur, passé tel quel et recopié dans son extrait plus bas. */
const CONFIGURED_CONTROLS = {
  pictureInPicture: false,
  playbackRate: { rates: [1, 1.5, 2] },
  autoHideDelay: 1000,
  keyboard: false,
  scrubber: { chapters: false },
} as const;

/** Les chapitres ne sont pas recopiés dans l'extrait : ils figurent déjà plus haut dans la page. */
function sourceSnippet(source: (typeof SOURCES)[number]) {
  const props = [`src="${source.src}"`];
  if (source.chapters) props.push("chapters={chapters}");
  return `<VideoCn\n  ${props.join("\n  ")}\n/>`;
}

// À tenir en phase avec `CONFIGURED_CONTROLS` : un `JSON.stringify` citerait les
// clés entre guillemets, et l'extrait ne ressemblerait plus à ce qu'on écrit.
const CONFIGURED_SNIPPET = `<VideoCn
  src="${DEMO_SRC}"
  chapters={chapters}
  controls={{
    pictureInPicture: false,
    playbackRate: { rates: [1, 1.5, 2] },
    autoHideDelay: 1000,
    keyboard: false,
    scrubber: { chapters: false },
  }}
/>`;

const CHAPTERS_SNIPPET = `const chapters = [
${BUNNY_CHAPTERS.map((chapter) => `  { time: ${chapter.time}, label: "${chapter.label}" },`).join("\n")}
];`;

export function PlayerDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sourceId, setSourceId] = useState<SourceId>("mp4");
  const [palette, setPalette] = useState<PaletteId>("neutral");
  const [radius, setRadius] = useState<RadiusId>("default");

  // Jamais `undefined` : le groupe ne permet pas de tout désélectionner, et on
  // ignore une valeur vide plutôt que de laisser le lecteur sans source.
  const source = SOURCES.find((candidate) => candidate.id === sourceId) ?? SOURCES[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ThemePicker
          palette={palette}
          radius={radius}
          onPaletteChange={setPalette}
          onRadiusChange={setRadius}
        />
        <p className="text-muted-foreground text-xs text-pretty">
          These only set <code className="font-mono">--primary</code>,{" "}
          <code className="font-mono">--accent</code> and{" "}
          <code className="font-mono">--radius</code> on a wrapper, the way your own theme would.
          Nothing in the player changes: open a menu, drag the bar.
        </p>
      </div>
      {/* Le thème englobe tout ce qui suit, comme le ferait celui d'un hôte :
          lecteurs, extraits et sélecteur de source. Seul le sélecteur de thème
          reste dehors, pour ne pas bouger sous le doigt. */}
      <div
        className={cn(
          themeClassName(palette, radius),
          SHOW_DEBUG_PANEL ? "grid items-start gap-6 lg:grid-cols-5" : "flex flex-col gap-6",
        )}
      >
        {/* Trois cinquièmes pour la vidéo, deux pour le panneau : au-dessous de
            `lg`, la grille retombe sur une colonne et l'un passe sous l'autre. */}
        <div className="flex min-w-0 flex-col gap-3 lg:col-span-3">
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
          {/* Pas de `key` : c'est le lecteur qui change de moteur sous la même
              balise, exactement comme chez un utilisateur qui changerait sa prop
              `src`. Remonter le composant masquerait ce chemin-là — et le panneau
              d'observation, qui s'accroche à l'élément une fois pour toutes,
              resterait sur l'ancien. */}
          <VideoCn ref={videoRef} src={source.src} chapters={source.chapters} />
          <p className="text-muted-foreground text-xs text-pretty">{source.note}</p>
          <CodeBlock code={sourceSnippet(source)} />
          {SHOW_DEBUG_PANEL && (
            <p className="text-muted-foreground text-xs text-pretty">
              The panel reads the element, not the controls: what it shows proves the action really
              reached the video.
            </p>
          )}
          <KeyboardShortcuts />
        </div>
        {SHOW_DEBUG_PANEL && (
          <div className="lg:col-span-2">
            <PlayerDebugPanel videoRef={videoRef} />
          </div>
        )}

        {/* Le même lecteur, réglé par la seule prop `controls` : rien n'a été
            édité dans le code livré, et c'est tout l'enjeu. */}
        <div className="flex min-w-0 flex-col gap-3 lg:col-span-5">
          <h2 className="text-sm font-medium">Configured through props</h2>
          <VideoCn src={DEMO_SRC} chapters={BUNNY_CHAPTERS} controls={CONFIGURED_CONTROLS} />
          <p className="text-muted-foreground text-xs text-pretty">
            No Picture-in-Picture, three speeds instead of seven, a bar that hides after one second,
            no keyboard shortcuts. Same chapters as above, but kept out of the bar: cutting it up is
            a matter of looks, not of content.
          </p>
          <CodeBlock code={CONFIGURED_SNIPPET} />
          <CodeBlock code={CHAPTERS_SNIPPET} title="The chapters used on this page" />
        </div>
      </div>
    </div>
  );
}
