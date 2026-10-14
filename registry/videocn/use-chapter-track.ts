"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import type { Chapter } from "./chapters";

/**
 * Les chapitres d'un fichier WebVTT, lus par le navigateur.
 *
 * `<VideoCn>` rend lui-même un `<track kind="chapters">` dans le `<video>` et
 * en donne la ref à ce hook, qui n'analyse rien : il passe la piste en `hidden`,
 * ce qui la fait charger, et lit ses répliques une fois qu'elles sont toutes
 * arrivées. Le même chemin sert les deux moteurs — Shaka ne charge que le
 * flux, la piste est un élément du DOM comme les sous-titres.
 *
 * Il rend un `Chapter[]` — le début de chaque réplique et son titre, sa fin est
 * ignorée — que `<VideoCn>` donne à `ChaptersProvider` à la place de la prop.
 * Le fichier passe donc par `resolveChapters`, et suit par construction les
 * mêmes règles que le tableau.
 *
 * **L'identité de la liste est l'URL.** `<VideoCn>` la donne aussi pour `key` au
 * `<track>` : une URL nouvelle est un élément neuf, donc une `TextTrack` neuve,
 * qui ne porte jamais les répliques de la précédente. Tant qu'elle n'a pas
 * chargé la liste est `undefined`, c'est-à-dire pas de chapitres, et jamais
 * ceux de l'ancienne URL. Une URL qui échoue (404, autre origine, pas du WebVTT)
 * émet `error` côté navigateur : on ne l'écoute pas, la liste reste
 * `undefined` et le lecteur se comporte comme sans chapitres.
 */

export interface UseChapterTrackResult {
  /** À poser sur le `<track>` que `<VideoCn>` rend, absent quand `src` est vide. */
  ref: RefObject<HTMLTrackElement | null>;
  /** `undefined` tant que le fichier de `src` n'est pas chargé. */
  chapters: readonly Chapter[] | undefined;
}

/** Le texte affichable d'une réplique : sans balises, entités décodées, sur une ligne. */
function cueTitle(cue: TextTrackCue): string {
  const vtt = cue as VTTCue;
  // Le parseur du navigateur fait le travail : balises en éléments, `<v Nom>`
  // en attribut, horodatages internes hors du texte, entités décodées. Même
  // repli que `readCueText` des sous-titres.
  const text =
    typeof vtt.getCueAsHTML === "function" ? (vtt.getCueAsHTML().textContent ?? "") : vtt.text;
  return text.replace(/\s*\n\s*/g, " ").trim();
}

function readChapters(track: TextTrack): readonly Chapter[] {
  const chapters: Chapter[] = [];
  const cues = track.cues;
  if (!cues) return chapters;
  for (let index = 0; index < cues.length; index += 1) {
    const cue = cues[index];
    chapters.push({ time: cue.startTime, label: cueTitle(cue) });
  }
  return chapters;
}

export function useChapterTrack(src: string): UseChapterTrackResult {
  const ref = useRef<HTMLTrackElement>(null);

  // L'état ajusté pendant le rendu, motif de `ChaptersProvider` et de
  // `useSubtitles` : dès le rendu où l'URL change, la liste de l'ancienne ne
  // sort plus, sans attendre un effet.
  const [file, setFile] = useState<{ src: string; chapters?: readonly Chapter[] }>({ src });
  if (file.src !== src) setFile({ src });

  useEffect(() => {
    // Absente quand `src` est vide : `<VideoCn>` ne rend alors pas de `<track>`.
    const element = ref.current;
    if (!element) return;
    const track = element.track;
    const textTracks = (element.parentElement as HTMLMediaElement | null)?.textTracks;

    // Les répliques se lisent au `load`, qui suit l'analyse complète du fichier.
    const handleLoad = () => {
      setFile((current) =>
        current.src === src ? { src, chapters: readChapters(track) } : current,
      );
    };

    // Safari peut repasser une piste `chapters` en `disabled` après coup (Shaka
    // le documente dans `activateChaptersTrack_`). `hidden` est le mode qui la
    // fait charger : l'élément a raison, on s'y resynchronise.
    const keepHidden = () => {
      if (track.mode === "disabled") track.mode = "hidden";
    };

    element.addEventListener("load", handleLoad);
    textTracks?.addEventListener("change", keepHidden);
    // C'est ce passage en `hidden` qui lance le chargement.
    keepHidden();

    return () => {
      element.removeEventListener("load", handleLoad);
      textTracks?.removeEventListener("change", keepHidden);
    };
  }, [src]);

  return { ref, chapters: file.src === src ? file.chapters : undefined };
}
