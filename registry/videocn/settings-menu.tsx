"use client";

import {
  memo,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon, SettingsIcon } from "lucide-react";

import { ChapterMenuItems } from "./chapter-menu";
import { useActiveChapterIndex, useChapters } from "./chapters-context";
import { useControlsNarrow, useControlsOptions } from "./controls-context";
import { usePlayerActions, usePlayerValue } from "./player-context";
import {
  focusInitialItem,
  PlayerMenu,
  PlayerMenuContent,
  PlayerMenuItem,
  PlayerMenuRadioItem,
  PlayerMenuTrigger,
} from "./player-menu";
import type { PlayerState } from "./player-state-store";

/**
 * Le menu de réglages : un bouton, un popup à deux niveaux. La racine liste les
 * réglages avec leur valeur courante, et chaque ligne ouvre sa liste de choix.
 * Il remplace les deux boutons de vitesse et de qualité d'avant — leurs
 * libellés tenaient trop de place dans une barre étroite.
 *
 * Aucune prop : le contrôle lit ses options et son état dans les contextes.
 * `subtitles`, `playbackRate` et `quality` décident des lignes ; sans aucune, il
 * se rend `null`. La ligne « Subtitles » ouvre la liste, et reste en tête dans
 * la barre large : c'est la seule qui parle du contenu. Elle n'existe que si la
 * vidéo a des pistes.
 *
 * **Dans un lecteur étroit** (`useControlsNarrow()` vrai), la barre abandonne
 * les boutons des chapitres, des sous-titres et du Picture-in-Picture : leurs
 * lignes viennent ici, dans l'ordre Chapters, Subtitles, Speed, Quality,
 * Picture-in-Picture. Chacune suit la règle du bouton qu'elle remplace. `null`
 * (pas encore mesuré) vaut « au-dessus du seuil » : la barre large reste
 * exactement celle d'avant.
 *
 * **La ligne « Quality » reste affichée quand le moteur n'expose aucune
 * qualité**, et passe grisée — c'est le cas d'un MP4 progressif, où le
 * navigateur ne dit rien du contenu du fichier. Une ligne qui disparaît
 * déplace les autres et laisse croire à une panne ; grisée, elle dit qu'il n'y
 * a rien à choisir ici. Le moteur ne se connaît pas ici : on lit seulement ses
 * capacités.
 */

/** Les vues du popup : la racine, et la liste de choix qu'ouvre chaque ligne. */
type View = "root" | "chapters" | "subtitles" | "speed" | "quality";

/**
 * Une ligne de la racine : chaque vue, plus Picture-in-Picture, qui agit au
 * lieu d'ouvrir une liste et n'a donc pas de vue.
 */
type Row = Exclude<View, "root"> | "pictureInPicture";

/** Le libellé du choix automatique, seul ou suivi de ce qui est joué. */
const AUTO = "Auto";

/** Le libellé des sous-titres coupés, dans la ligne de la racine et dans la liste. */
const OFF = "Off";

/**
 * Point décimal et signe « × », quelle que soit la locale du navigateur : la
 * vitesse n'est pas une mesure mais une étiquette, et `0,5×` à côté de `1×`
 * dans la même liste donnerait deux écritures pour une même idée. Le `×` plutôt
 * que la lettre `x` parce qu'un lecteur d'écran le dit « times ».
 */
function formatRate(rate: number): string {
  return `${rate}×`;
}

function selectCapabilities(state: PlayerState) {
  return state.capabilities;
}

function selectTracks(state: PlayerState) {
  return state.subtitles;
}

function selectCanPictureInPicture(state: PlayerState) {
  return state.canPictureInPicture;
}

/**
 * Les lignes de la racine, dans l'ordre où elles s'affichent. Partagé par le
 * bouton, qui s'efface sans ligne, et par le panneau, qui les dessine et qui
 * s'en sert pour rendre le focus à la ligne d'où l'on revient.
 */
function useRootRows(): Row[] {
  const {
    chapters: chapterOptions,
    subtitles: subtitlesOptions,
    playbackRate: rateOptions,
    quality: qualityOptions,
    pictureInPicture: pictureInPictureOptions,
  } = useControlsOptions();
  const narrow = useControlsNarrow() === true;
  const chapters = useChapters();
  const tracks = usePlayerValue(selectTracks);

  const rows: Row[] = [];
  // Les chapitres et le Picture-in-Picture ne sont des lignes que sous le
  // seuil : au-dessus, leurs boutons sont dans la barre. Les chapitres sont
  // vides quand la durée est inconnue, donc jamais de ligne en direct.
  if (narrow && chapterOptions.enabled && chapters.length > 0) rows.push("chapters");
  if (subtitlesOptions.enabled && tracks.length > 0) rows.push("subtitles");
  if (rateOptions.enabled) rows.push("speed");
  if (qualityOptions.enabled) rows.push("quality");
  if (narrow && pictureInPictureOptions.enabled) rows.push("pictureInPicture");
  return rows;
}

export const SettingsMenu = memo(function SettingsMenu(): ReactElement | null {
  const rows = useRootRows();
  const capabilities = usePlayerValue(selectCapabilities);
  const canPictureInPicture = usePlayerValue(selectCanPictureInPicture);

  if (rows.length === 0) return null;

  // Seules la qualité et le Picture-in-Picture peuvent être grisés. Quand toutes
  // les lignes le sont, le popup ne mènerait nulle part : c'est alors le bouton
  // qui se grise.
  const hasActionableRow = rows.some((row) => {
    if (row === "quality") return capabilities.qualities.length > 0;
    if (row === "pictureInPicture") return canPictureInPicture;
    return true;
  });

  return (
    <PlayerMenu>
      <PlayerMenuTrigger aria-label="Settings" disabled={!hasActionableRow}>
        <SettingsIcon />
      </PlayerMenuTrigger>
      {/* Plus large que le défaut : « Quality » et « Auto (720p) » sur une même
          ligne, chevron compris. */}
      <PlayerMenuContent className="min-w-48">
        <SettingsPanel />
      </PlayerMenuContent>
    </PlayerMenu>
  );
});

/**
 * Le contenu du popup. Monté seulement ouvert, donc `view` repart de la racine
 * à chaque ouverture sans qu'il y ait rien à remettre à zéro.
 */
function SettingsPanel(): ReactElement {
  const { playbackRate: rateOptions } = useControlsOptions();
  const rows = useRootRows();
  const chapters = useChapters();
  const activeChapterIndex = useActiveChapterIndex();
  const tracks = usePlayerValue(selectTracks);
  const activeSubtitle = usePlayerValue((state) => state.activeSubtitle);
  const playbackRate = usePlayerValue((state) => state.playbackRate);
  const capabilities = usePlayerValue(selectCapabilities);
  const canPictureInPicture = usePlayerValue(selectCanPictureInPicture);
  const isPictureInPicture = usePlayerValue((state) => state.isPictureInPicture);
  const { selectSubtitles, setPlaybackRate, selectQuality, togglePictureInPicture } =
    usePlayerActions();
  const [view, setView] = useState<View>("root");
  const panelRef = useRef<HTMLDivElement>(null);
  const previousViewRef = useRef<View>("root");
  // Une chaîne et non le tableau : `useRootRows` en fabrique un à chaque rendu,
  // et l'effet ne doit se relancer que si les lignes changent vraiment.
  const rowsKey = rows.join();

  // Le focus était sur l'item de la vue précédente, que React vient de
  // démonter : il est retombé sur le `body`. On le repose avant la peinture.
  useLayoutEffect(() => {
    const previous = previousViewRef.current;
    previousViewRef.current = view;
    // Au montage, c'est le popup qui pose le focus.
    if (previous === view) return;

    const panel = panelRef.current;
    if (!panel) return;
    if (view === "root") {
      // On revient sur la ligne d'où l'on est parti, retrouvée par sa position
      // parmi les lignes présentes : elle change avec les options et les pistes.
      const items = panel.querySelectorAll<HTMLElement>('[role="menuitem"]');
      items[Math.max(rowsKey.split(",").indexOf(previous), 0)]?.focus();
      return;
    }
    focusInitialItem(panel, "checked");
  }, [rowsKey, view]);

  const { qualities, activeQualityId, playingQualityId } = capabilities;
  const playing = qualities.find((level) => level.id === playingQualityId);
  const selected = qualities.find((level) => level.id === activeQualityId);
  const activeTrack = tracks.find((track) => track.src === activeSubtitle);
  // `-1` avant les premières métadonnées : la ligne s'affiche alors sans valeur.
  const activeChapter = activeChapterIndex === -1 ? undefined : chapters[activeChapterIndex];

  // `←`/`→` sont arrêtés par le popup pour que la vidéo n'avance pas ; ici on
  // leur donne un sens, celui des chevrons : en RTL, ils sont retournés et les
  // touches avec eux. La direction se lit à chaque touche, sans état, pour
  // suivre un `dir` changé en cours de route (`:dir()` lève avant Chrome 120).
  // Le popup les arrête encore après nous.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const openKey = rtl ? "ArrowLeft" : "ArrowRight";
    const backKey = rtl ? "ArrowRight" : "ArrowLeft";
    if (event.key === openKey && view === "root") {
      const active = document.activeElement;
      const panel = panelRef.current;
      if (active instanceof HTMLElement && panel?.contains(active)) {
        // Un clic : la ligne focalisée sait elle-même quelle vue ouvrir. Mais
        // la ligne Picture-in-Picture n'en ouvre aucune, et `→` ne doit pas
        // l'activer : on la reconnaît à sa position parmi les lignes, comme
        // pour le retour de focus.
        const items = Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]'));
        const row = rows[items.indexOf(active)];
        if (row !== undefined && row !== "pictureInPicture") active.click();
      }
    } else if (event.key === backKey && view !== "root") {
      setView("root");
    }
  };

  return (
    // `role="none"` : cette enveloppe n'existe que pour porter la ref et les
    // touches, le menu doit continuer à contenir directement ses items.
    <div ref={panelRef} role="none" onKeyDown={handleKeyDown}>
      {view === "root" ? (
        <>
          {rows.includes("chapters") ? (
            <PlayerMenuItem onSelect={() => setView("chapters")}>
              <span>Chapters</span>
              {/* Sans `dir="ltr"` : le titre vient de l'intégrateur et garde la
                  direction de la page. `min-w-0 truncate` : un titre long
                  s'abrège au lieu d'élargir le popup. */}
              <span className="ml-auto min-w-0 truncate text-muted-foreground">
                {activeChapter?.label}
              </span>
              <RowChevron />
            </PlayerMenuItem>
          ) : null}
          {rows.includes("subtitles") ? (
            <PlayerMenuItem onSelect={() => setView("subtitles")}>
              <span>Subtitles</span>
              {/* Sans `dir="ltr"` : le libellé vient de l'intégrateur et garde la
                  direction de la page, comme le titre d'un chapitre. */}
              <span className="ml-auto min-w-0 truncate text-muted-foreground">
                {activeTrack ? activeTrack.label : OFF}
              </span>
              <RowChevron />
            </PlayerMenuItem>
          ) : null}
          {rateOptions.enabled ? (
            <PlayerMenuItem onSelect={() => setView("speed")}>
              <span>Speed</span>
              <span dir="ltr" className="ml-auto text-muted-foreground">
                {formatRate(playbackRate)}
              </span>
              <RowChevron />
            </PlayerMenuItem>
          ) : null}
          {rows.includes("quality") ? (
            <PlayerMenuItem disabled={qualities.length === 0} onSelect={() => setView("quality")}>
              <span>Quality</span>
              {/* En automatique, la hauteur jouée : c'est la seule façon de
                  savoir ce qu'on regarde sans quitter l'auto. */}
              <span dir="ltr" className="ml-auto text-muted-foreground">
                {selected ? selected.label : playing ? `${AUTO} (${playing.label})` : AUTO}
              </span>
              <RowChevron />
            </PlayerMenuItem>
          ) : null}
          {rows.includes("pictureInPicture") ? (
            // `closeOnSelect` : la ligne agit au lieu d'ouvrir une liste. Pas de
            // chevron, et grisée quand le navigateur ne le permet pas. Le geste
            // utilisateur que `requestPictureInPicture` exige tient parce que
            // tout reste synchrone : l'action part dans le `click` (souris) ou
            // dans le `keydown` qui déclenche `.click()` (`Entrée`, `Espace`), et
            // passe avant la fermeture. Un `await` ou un report ici le casserait
            // sans erreur, la promesse rejetée étant avalée par le moteur.
            <PlayerMenuItem
              closeOnSelect
              disabled={!canPictureInPicture}
              onSelect={() => togglePictureInPicture()}
            >
              <span>
                {isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"}
              </span>
            </PlayerMenuItem>
          ) : null}
        </>
      ) : null}
      {view === "chapters" ? (
        <>
          <BackItem title="Chapters" onSelect={() => setView("root")} />
          <ChapterMenuItems />
        </>
      ) : null}
      {view === "subtitles" ? (
        <>
          <BackItem title="Subtitles" onSelect={() => setView("root")} />
          <PlayerMenuRadioItem
            checked={activeTrack === undefined}
            onSelect={() => selectSubtitles(null)}
          >
            <span>{OFF}</span>
          </PlayerMenuRadioItem>
          {tracks.map((track) => (
            <PlayerMenuRadioItem
              key={track.src}
              checked={track.src === activeSubtitle}
              onSelect={() => selectSubtitles(track.src)}
            >
              <span>{track.label}</span>
            </PlayerMenuRadioItem>
          ))}
        </>
      ) : null}
      {view === "speed" ? (
        <>
          <BackItem title="Speed" onSelect={() => setView("root")} />
          {rateOptions.rates.map((rate) => (
            <PlayerMenuRadioItem
              key={rate}
              // Rien n'oblige la vitesse courante à figurer dans la liste — la
              // vidéo peut arriver avec la sienne. Aucun item n'est alors coché,
              // et la liste s'ouvre sur la ligne de retour.
              checked={rate === playbackRate}
              onSelect={() => setPlaybackRate(rate)}
            >
              {/* `dir="ltr"` : sous une page RTL, l'algorithme bidi afficherait
                  `×1` au lieu de `1×`. */}
              <span dir="ltr">{formatRate(rate)}</span>
            </PlayerMenuRadioItem>
          ))}
        </>
      ) : null}
      {view === "quality" ? (
        <>
          <BackItem title="Quality" onSelect={() => setView("root")} />
          <PlayerMenuRadioItem
            checked={activeQualityId === null}
            onSelect={() => selectQuality(null)}
          >
            <span dir="ltr">{playing ? `${AUTO} (${playing.label})` : AUTO}</span>
          </PlayerMenuRadioItem>
          {qualities.map((level) => (
            <PlayerMenuRadioItem
              key={level.id}
              checked={level.id === activeQualityId}
              onSelect={() => selectQuality(level.id)}
            >
              <span dir="ltr">{level.label}</span>
            </PlayerMenuRadioItem>
          ))}
        </>
      ) : null}
    </div>
  );
}

/** Le chevron de fin de ligne, dans la place que `pe-8` réserve à l'item. */
function RowChevron(): ReactElement {
  return (
    <span className="pointer-events-none absolute right-2 flex items-center justify-center">
      {/* Retourné en RTL : la ligne s'ouvre alors vers l'autre bord. */}
      <ChevronRightIcon className="rtl:rotate-180" />
    </span>
  );
}

/** La première ligne d'une liste : son titre, et le retour à la racine. */
function BackItem({ title, onSelect }: { title: string; onSelect: () => void }): ReactElement {
  return (
    <PlayerMenuItem className="font-medium" onSelect={onSelect}>
      <ChevronLeftIcon className="rtl:rotate-180" />
      <span>{title}</span>
    </PlayerMenuItem>
  );
}
