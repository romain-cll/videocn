"use client";

/**
 * Les sous-titres, de ce que l'intégrateur écrit à ce que le lecteur consomme.
 *
 * Des fonctions pures, comme `chapters.ts` : aucune ne touche au DOM, et c'est
 * ce qui les rend sûres à appeler pendant un rendu, serveur compris.
 *
 * **Une seule forme, contrairement aux chapitres.** Une piste est ici déjà ce
 * que `<track>` attend — l'URL du fichier WebVTT, sa langue, son libellé —, et
 * rien ne se calcule à partir de la durée. La normalisation se contente donc
 * d'écarter ce qui ne peut pas servir et de rendre la liste stable.
 *
 * **L'URL est l'identité d'une piste.** C'est elle qui sert de clé au `<track>`
 * rendu, et c'est elle qui dit si la piste active survit à un changement de
 * liste : même URL, même élément, même mode. D'où la règle des doublons dans
 * `resolveSubtitles`.
 */

/**
 * Ce que l'intégrateur écrit. Les attributs d'un `<track kind="subtitles">`,
 * sous leur nom React : une liste se copie depuis un `<track>` existant.
 */
export interface SubtitleTrack {
  /**
   * L'URL du fichier WebVTT. Elle doit être servie depuis la même origine que
   * la page : le `<video>` ne porte pas d'attribut `crossorigin`, et un `<track>`
   * d'une autre origine ne se charge pas.
   */
  src: string;
  /** Le code de langue BCP 47, tel que `en` ou `fr` : l'attribut `srclang`. */
  srcLang: string;
  /** Le nom montré dans le menu : « English », « Français ». */
  label: string;
  /**
   * La piste active au montage. Seule la première de la liste marquée compte.
   * Sans effet sur ce que la barre propose : c'est un contenu, pas un réglage.
   */
  default?: boolean;
}

/**
 * Une référence stable pour « pas de sous-titres ».
 *
 * Même raison que `NO_CHAPTERS` : la liste vit dans le store et sert de
 * dépendance à des mémos et à des effets. Un tableau vide fabriqué à chaque
 * appel les déclencherait tous, à chaque rendu, pour rien.
 */
export const NO_SUBTITLES: readonly SubtitleTrack[] = Object.freeze([]);

/**
 * La liste normalisée.
 *
 * L'intégrateur n'a rien à garantir : on absorbe ici les entrées inutilisables
 * — sans URL ou sans libellé, un `<track>` serait invisible dans le menu ou
 * sans fichier à lire — et les URL répétées, dont la première gagne. Deux
 * pistes de même URL auraient la même clé React et le même fichier : elles ne
 * pourraient pas être distinguées, ni par le menu ni par `activeSubtitle`.
 *
 * L'ordre de l'intégrateur est conservé : c'est celui du menu. Le résultat est
 * figé, et ses entrées aussi.
 */
export function resolveSubtitles(
  subtitles: readonly SubtitleTrack[] | undefined,
): readonly SubtitleTrack[] {
  if (!subtitles || subtitles.length === 0) return NO_SUBTITLES;

  const seen = new Set<string>();
  const resolved: SubtitleTrack[] = [];
  for (const track of subtitles) {
    const src = typeof track?.src === "string" ? track.src.trim() : "";
    const label = typeof track?.label === "string" ? track.label.trim() : "";
    if (src.length === 0 || label.length === 0) continue;
    if (seen.has(src)) continue;
    seen.add(src);
    resolved.push(
      Object.freeze({
        src,
        srcLang: typeof track.srcLang === "string" ? track.srcLang.trim() : "",
        label,
        default: track.default === true,
      }),
    );
  }
  if (resolved.length === 0) return NO_SUBTITLES;

  return Object.freeze(resolved);
}

/**
 * Ce qui identifie une liste, indépendamment de la référence du tableau.
 *
 * `<VideoCn subtitles={[…]} />` fabrique un tableau neuf à chaque rendu de la
 * page hôte : on compare le contenu, pas l'adresse, comme pour les chapitres.
 * La signature porte tout ce que `resolveSubtitles` lit — y compris `default`
 * —, sans quoi un changement de défaut passerait inaperçu.
 */
export function signSubtitles(subtitles: readonly SubtitleTrack[] | undefined): string {
  if (!subtitles || subtitles.length === 0) return "";
  // Deux séparateurs qu'un libellé ne peut pas contenir : sans eux, un titre
  // portant le séparateur pourrait imiter la signature d'une autre liste.
  return subtitles
    .map(
      (track) =>
        `${track?.src}\u0000${track?.srcLang}\u0000${track?.label}\u0000${track?.default === true ? 1 : 0}`,
    )
    .join("\u0001");
}

/**
 * L'URL de la piste marquée par défaut, ou `null`.
 *
 * Sur une liste résolue. Seule la première marquée compte, et c'est le parcours
 * dans l'ordre qui le garantit.
 */
export function findDefaultSubtitle(tracks: readonly SubtitleTrack[]): string | null {
  return tracks.find((track) => track.default === true)?.src ?? null;
}

/**
 * La piste que le bouton CC allume depuis « coupé » : la dernière choisie
 * depuis le montage, sinon la piste par défaut, sinon la première. `null`
 * quand la liste est vide.
 *
 * `last` est ignorée si elle n'est plus dans la liste : une piste retirée ne
 * peut pas être rallumée, et on retombe sur la suite de la règle.
 */
export function pickSubtitleToEnable(
  tracks: readonly SubtitleTrack[],
  last: string | null,
): string | null {
  if (tracks.length === 0) return null;
  if (last !== null && tracks.some((track) => track.src === last)) return last;
  return findDefaultSubtitle(tracks) ?? tracks[0].src;
}
