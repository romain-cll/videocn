"use client";

/**
 * Montage de la démo : le lecteur d'un côté, le panneau de debug de l'autre.
 *
 * La ref de l'élément `<video>` est détenue ici, au-dessus des deux. C'est le
 * seul lien entre eux : le lecteur la reçoit et la pose sur son `<video>`, le
 * panneau la lit. Aucun état ne transite par ce composant, donc rien de ce que
 * le panneau affiche ne peut provoquer un rendu du lecteur.
 */

import { useRef } from "react";

import { PlayerDebugPanel } from "@/components/player-debug-panel";
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

export function PlayerDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-5">
      {/* Trois cinquièmes pour la vidéo, deux pour le panneau : au-dessous de
          `lg`, la grille retombe sur une colonne et l'un passe sous l'autre. */}
      <div className="flex flex-col gap-3 lg:col-span-3">
        {/* Aucune classe : le lecteur possède son apparence — c'est tout
            l'intérêt de le voir ici tel qu'il arrivera chez l'utilisateur. */}
        <VideoCn ref={videoRef} src={DEMO_SRC} />
        <p className="text-muted-foreground text-xs text-pretty">
          Le panneau lit l&apos;élément, pas les contrôles : ce qu&apos;il affiche prouve que
          l&apos;action est bien allée jusqu&apos;à la vidéo.
        </p>
      </div>
      <div className="lg:col-span-2">
        <PlayerDebugPanel videoRef={videoRef} />
      </div>

      {/* Le même lecteur, réglé par la seule prop `controls` : rien n'a été
          édité dans le code livré, et c'est tout l'enjeu. */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        <h2 className="text-sm font-medium">Réglé par les props</h2>
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
          Pas de Picture-in-Picture, trois vitesses au lieu de sept, barre qui s&apos;efface après
          une seconde, pas de raccourcis clavier.
        </p>
      </div>
    </div>
  );
}
