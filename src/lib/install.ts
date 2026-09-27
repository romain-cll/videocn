import { siteConfig } from "@/lib/site-config";

/**
 * L'URL directe plutôt que `@videocn/player` : le namespace nu ne se résout
 * que si le visiteur a déclaré le registry, ou quand l'annuaire shadcn l'aura
 * accepté. D'ici là, c'est la seule commande qui marche du premier coup.
 */
export const INSTALL_COMMAND = `pnpm dlx shadcn@latest add ${siteConfig.registryUrl.replace("{name}", "player")}`;
