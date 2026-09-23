/**
 * L'URL du registry est un contrat public : une fois qu'elle est dans le
 * components.json des utilisateurs, elle ne peut plus changer. Toute
 * modification ici casse les installations existantes.
 */
export const siteConfig = {
  name: "videoCn",
  namespace: "@videocn",
  url: "https://videocn.dev",
  registryUrl: "https://videocn.dev/r/{name}.json",
  description:
    "A complete video player built on the native <video> element and shadcn/ui components.",
  links: {
    github: "https://github.com/rcaille/videocn",
  },
} as const;
