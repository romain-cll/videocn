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
