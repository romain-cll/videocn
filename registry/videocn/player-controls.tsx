"use client";

import { useLayoutEffect, useRef, useState, type ReactElement } from "react";

import { ChapterMenu } from "./chapter-menu";
import {
  ControlsNarrowProvider,
  useControlsOptions,
  useControlsVisible,
  useHoldControlsVisible,
} from "./controls-context";
import { FullscreenToggle } from "./fullscreen-toggle";
import { LiveBadge } from "./live-badge";
import { PictureInPictureToggle } from "./picture-in-picture-toggle";
import { PlayToggle } from "./play-toggle";
import { PlayerScrubber } from "./player-scrubber";
import { SettingsMenu } from "./settings-menu";
import { SubtitlesToggle } from "./subtitles-toggle";
import { TimeDisplay } from "./time-display";
import { VolumeControl } from "./volume-control";

/**
 * Le seuil de la barre étroite, en `rem` : une barre de moins de 30rem de
 * contenu, soit un lecteur d'environ 506 px avec la police racine par défaut.
 * C'est le `30rem` des requêtes `@max-[30rem]` de `time-display.tsx` (qui y
 * masque l'horodatage) et la valeur de la garde CSS posée sur les contrôles de
 * `chapter-menu.tsx`, `subtitles-toggle.tsx` et `picture-in-picture-toggle.tsx`.
 * Les quatre endroits doivent rester d'accord.
 */
const NARROW_THRESHOLD_REM = 30;

/** La police racine, relue à chaque mesure : c'est l'unité des requêtes CSS. */
function rootFontSize(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/**
 * La barre. Elle ne prend aucune prop et ne pilote aucun contrôle : chacun lit
 * le contexte et décide seul de s'afficher. Ajouter un contrôle, c'est ajouter
 * une ligne ici et un fichier à côté.
 *
 * **Elle mesure sa propre largeur** pour dire à ses contrôles s'ils sont sous
 * le seuil de 30rem (`useControlsNarrow`). Sous le seuil, les chapitres, les
 * sous-titres et le Picture-in-Picture quittent la barre pour le menu de
 * réglages. La mesure porte sur la boîte de contenu, celle que lit la requête
 * `@container` : d'abord dans un `useLayoutEffect`, avant la peinture, puis par
 * un `ResizeObserver`. Franchir le seuil ne fait que re-rendre la barre : la
 * lecture, la piste, la vitesse et la qualité vivent dans l'élément, le moteur
 * et le store, que rien ne démonte.
 */
export function PlayerControls(): ReactElement | null {
  const { visibility } = useControlsOptions();
  const visible = useControlsVisible();
  const barRef = useRef<HTMLDivElement>(null);
  // `null` jusqu'à la première mesure, donc au rendu serveur et à l'hydratation,
  // que aucun navigateur ne peint : la mesure suivante est synchrone.
  const [narrow, setNarrow] = useState<boolean | null>(null);

  // Dépend de `visibility`, comme `SubtitleDisplay` : la barre n'existe pas avec
  // `"never"`, et il n'y a alors rien à mesurer.
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const update = (contentWidth: number) =>
      setNarrow(contentWidth < NARROW_THRESHOLD_REM * rootFontSize());

    // Première mesure : la largeur de la boîte de bordure moins les deux
    // `padding`, et non `clientWidth`, qui arrondit à l'entier alors que la
    // requête compare une largeur fractionnaire.
    const style = getComputedStyle(bar);
    update(
      bar.getBoundingClientRect().width -
        (parseFloat(style.paddingLeft) || 0) -
        (parseFloat(style.paddingRight) || 0),
    );

    // `contentRect` est la boîte de contenu, fractionnaire elle aussi.
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, [visibility]);

  // La souris posée sur la barre l'empêche de disparaître. Le verrou passe par
  // un état plutôt que par deux appels directs : c'est ce que
  // `useHoldControlsVisible` attend, et le nettoyage de l'effet garantit la
  // libération même si le `pointerleave` n'arrive jamais — démontage, passage
  // en plein écran, onglet quitté.
  const [hovered, setHovered] = useState(false);
  useHoldControlsVisible(hovered);

  if (visibility === "never") return null;

  return (
    <div
      ref={barRef}
      data-slot="video-player-controls"
      // `group` et non `toolbar` : un toolbar impose une navigation aux
      // flèches, qui entrerait en collision frontale avec la keymap du lecteur
      // (`←`/`→` pour se déplacer, `↑`/`↓` pour le volume).
      role="group"
      aria-label="Player controls"
      // Masquée en opacité seulement — jamais `hidden`, `inert` ni
      // `aria-hidden` : la barre doit rester atteignable à la tabulation.
      // Le masquage est conditionné plutôt que corrigé par une paire de
      // classes inverses : à spécificité égale, c'est l'ordre de génération
      // qui tranche, et `data-hidden` sort après. La barre revient donc dès la
      // frame où le focus arrive, avant tout rendu React.
      //
      // Seul le focus **clavier** compte (`focus-visible`). Un clic souris
      // donne aussi le focus au bouton cliqué, et la barre ne se serait plus
      // jamais masquée après une recherche dans le scrubber.
      data-hidden={visible ? undefined : ""}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      // `dark` est délibéré : un voile est toujours sombre, et le `ghost` du
      // `Button` donnerait sinon du texte sombre sur fond sombre en thème
      // clair. La barre est un îlot qui résout ses tokens sur la palette
      // sombre *de l'utilisateur*, sans une seule couleur en dur.
      //
      // Sur une seule ligne, et ce n'est pas du laisser-aller : la conversion
      // RTL du CLI shadcn ajoute un `\` en fin de chaque ligne d'une chaîne de
      // classes, caractère qui reste littéral dans un attribut JSX. Écrite sur
      // plusieurs lignes, cette chaîne perdait quatre classes dans un projet
      // RTL — le voile et la couleur du texte avec — et les icônes devenaient
      // presque invisibles sur la vidéo.
      //
      // `@container` : la barre est le contexte des requêtes de largeur de ses
      // contrôles (l'horodatage, qui s'efface sous 30rem quand le volume se
      // déplie ; la garde CSS des trois boutons de la barre large). Elle et non
      // la racine du lecteur, où `container-type` annulerait la largeur
      // intrinsèque d'un lecteur en `w-fit`.
      //
      // Couplage avec `subtitle-display.tsx` : il mesure cette barre, par son
      // `data-slot`, et suppose que son `padding-top` est le dégradé.
      className="@container dark absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-linear-to-t from-player-scrim to-transparent px-3 pt-10 pb-3 text-foreground transition-opacity duration-200 motion-reduce:transition-none data-hidden:not-has-focus-visible:pointer-events-none data-hidden:not-has-focus-visible:opacity-0"
    >
      <ControlsNarrowProvider narrow={narrow}>
        <PlayerScrubber />
        <div className="flex items-center gap-1">
          <PlayToggle />
          {/* Juste après la lecture : sur un direct, savoir si l'on est au bord
              vaut autant que savoir si ça joue. Rendue `null` ailleurs. */}
          <LiveBadge />
          <VolumeControl />
          {/* Après le volume et non avant : la largeur du texte change au fil de
              la lecture, et elle ne doit jamais déplacer une cible cliquable. */}
          <TimeDisplay />
          <div className="ml-auto flex items-center gap-1">
            {/* Avant les réglages : c'est le seul menu qui parle du contenu et
                non du rendu, et c'est celui qu'on vient chercher le plus
                souvent. Rendu `null` quand la vidéo n'a pas de chapitres, et
                sous le seuil, où ses chapitres passent par le menu de réglages
                (comme les sous-titres et le Picture-in-Picture plus bas). */}
            <ChapterMenu />
            {/* Entre les chapitres et les réglages : il parle du contenu comme les
                chapitres, et le menu de réglages, lui, du rendu. Rendu `null`
                sans pistes de sous-titres. */}
            <SubtitlesToggle />
            {/* Vitesse et qualité, rangées derrière un seul bouton : deux
                boutons à libellé ne tenaient pas dans un lecteur étroit. */}
            <SettingsMenu />
            <PictureInPictureToggle />
            <FullscreenToggle />
          </div>
        </div>
      </ControlsNarrowProvider>
    </div>
  );
}
