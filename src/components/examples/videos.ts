/**
 * Les vidéos des exemples : des films libres de la Blender Foundation, servis
 * par archive.org en fichiers progressifs. Le moteur natif suffit, aucun
 * JavaScript de streaming.
 *
 * Chaque poster est tiré du fichier lui-même. Sans lui, le lecteur montre la
 * première image, souvent noire.
 *
 * `aspectClassName` donne les proportions du film au poster figé des fenêtres
 * de la landing, qui n'ont pas de `<video>` pour les connaître.
 *
 * Le bucket Google `gtv-videos-bucket`, longtemps la référence pour ces
 * fichiers, répond 403 : ne pas y revenir.
 */
export const EXAMPLE_VIDEOS = {
  /** 2048 × 872, 15 min. */
  sintel: {
    title: "Sintel",
    src: "https://archive.org/download/Sintel/sintel-2048-stereo.mp4",
    poster: "/examples/sintel-poster.jpg",
    aspectClassName: "aspect-[2048/872]",
  },
  /** 1920 × 800, 12 min. WebM : lu par tous les navigateurs actuels. */
  tearsOfSteel: {
    title: "Tears of Steel",
    src: "https://archive.org/download/Tears-of-Steel/tears_of_steel_1080p.webm",
    poster: "/examples/tears-of-steel-poster.jpg",
    aspectClassName: "aspect-[1920/800]",
  },
  /** 640 × 360, 10 min. Assez pour un lecteur de la taille d'un post. */
  bigBuckBunny: {
    title: "Big Buck Bunny",
    src: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4",
    poster: "/examples/big-buck-bunny-poster.jpg",
    aspectClassName: "aspect-video",
  },
} as const;

export type ExampleVideo = (typeof EXAMPLE_VIDEOS)[keyof typeof EXAMPLE_VIDEOS];

/**
 * Le découpage de Sintel, pour la page type plateforme vidéo.
 *
 * À part, et non dans l'entrée du film : une seule des trois vidéos en a, et
 * la donner à une seule branche de `EXAMPLE_VIDEOS` rendrait `ExampleVideo`
 * inutilisable — le champ manquerait aux deux autres.
 */
export const SINTEL_CHAPTERS = [
  { time: 0, label: "Prologue" },
  { time: 100, label: "The village" },
  { time: 210, label: "Searching for Scales" },
  { time: 350, label: "The shaman's tale" },
  { time: 490, label: "Crossing the mountains" },
  { time: 640, label: "The lair" },
  { time: 770, label: "The duel" },
  { time: 830, label: "Credits" },
] as const;
