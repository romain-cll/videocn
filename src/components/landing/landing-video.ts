/**
 * La vidéo de la page d'accueil : la même que celle de la démo, Big Buck Bunny
 * en MP4 progressif. Le moteur natif suffit, aucun JavaScript de streaming.
 *
 * Le bucket Google `gtv-videos-bucket`, longtemps la référence pour ce fichier,
 * répond 403 : ne pas y revenir.
 */
export const LANDING_VIDEO_SRC =
  "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4";

/**
 * L'image de 2:20, tirée du fichier lui-même. Sans elle le lecteur montre la
 * première image de la vidéo, qui est noire.
 */
export const LANDING_VIDEO_POSTER = "/landing/big-buck-bunny-poster.jpg";
