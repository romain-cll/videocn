import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { LandingShortcuts } from "@/components/landing/landing-shortcuts";
import { CopyCommand } from "@/components/landing/copy-command";
import { LANDING_VIDEO_POSTER, LANDING_VIDEO_SRC } from "@/components/landing/landing-video";
import { ThemedPlayer } from "@/components/landing/themed-player";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { VideoCn } from "@/registry/videocn/video-cn";

const INSTALL_COMMAND = `pnpm dlx shadcn@latest add ${siteConfig.namespace}/player`;

/**
 * Le réglage montré en exemple, et le code qui l'affiche : une seule source,
 * pour que l'extrait ne puisse pas dériver du lecteur qu'il décrit.
 */
const TUNED_CONTROLS = {
  pictureInPicture: false,
  playbackRate: { rates: [1, 1.5, 2] },
  autoHideDelay: 1000,
  keyboard: false,
};

const TUNED_SNIPPET = `<VideoCn
  src="/film.mp4"
  controls={{
    pictureInPicture: false,
    playbackRate: { rates: [1, 1.5, 2] },
    autoHideDelay: 1000,
    keyboard: false,
  }}
/>`;

const AVAILABLE = [
  {
    title: "Une barre de lecture comme celle de YouTube.",
    body: "Un clic cherche sans couper la lecture, un glissement met en pause puis reprend.",
  },
  { title: "Volume et muet.", body: "Le muet se souvient du dernier volume." },
  { title: "Vitesses, Picture-in-Picture, plein écran.", body: null },
  {
    title: "Accessible.",
    body: "De vrais curseurs pour les lecteurs d’écran et le contrôle vocal.",
  },
];

const UPCOMING = [
  {
    title: "Streaming HLS et DASH, choix de la qualité.",
    body: "Détecté tout seul à partir de la source.",
  },
  { title: "Chapitres.", body: "En segments sur la barre, et en liste cliquable." },
  { title: "Moments les plus revus.", body: "Une courbe au-dessus de la barre." },
  { title: "Sous-titres.", body: "Vos fichiers VTT : choix de la piste, taille, position." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="flex flex-col gap-6 pt-20 pb-10 md:pt-24">
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-balance md:text-6xl">
          Un lecteur vidéo pour shadcn/ui.
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg text-pretty md:text-xl">
          Il prend les couleurs, les rayons et le mode sombre de votre projet. Une commande
          l’installe, des props le règlent.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <CopyCommand command={INSTALL_COMMAND} />
          <Button size="lg" className="h-11 px-4" nativeButton={false} render={<Link href="/docs" />}>
            Lire la documentation
          </Button>
        </div>
      </section>

      <section className="pb-24">
        <ThemedPlayer />
      </section>

      <section className="flex flex-col gap-8 border-t py-16 md:py-20">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight">Tout se règle par les props.</h2>
          <p className="text-muted-foreground text-pretty">
            Masquer un bouton, changer les vitesses, couper les raccourcis : pas besoin d’ouvrir
            le code installé.
          </p>
        </div>
        <div className="grid items-start gap-6 md:grid-cols-2">
          <CodeBlock className="text-foreground px-6 py-5 leading-relaxed">{TUNED_SNIPPET}</CodeBlock>
          <div className="flex flex-col gap-3">
            <VideoCn src={LANDING_VIDEO_SRC} poster={LANDING_VIDEO_POSTER} controls={TUNED_CONTROLS} />
            <p className="text-muted-foreground text-sm text-pretty">
              Pas de Picture-in-Picture, trois vitesses au lieu de sept, une barre qui s’efface
              après une seconde, pas de raccourcis clavier.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-12 border-t py-16 md:grid-cols-2 md:gap-16 md:py-20">
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-semibold tracking-tight">Déjà dans le lecteur</h2>
          <ul className="flex flex-col gap-3">
            {AVAILABLE.map(({ title, body }) => (
              <li key={title} className="text-pretty">
                <span className="font-medium">{title}</span>
                {body && <span className="text-muted-foreground"> {body}</span>}
              </li>
            ))}
          </ul>
          <LandingShortcuts />
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-muted-foreground text-2xl font-semibold tracking-tight">Bientôt</h2>
          <ul className="text-muted-foreground flex flex-col gap-3">
            {UPCOMING.map(({ title, body }) => (
              <li key={title} className="text-pretty">
                <span className="text-foreground/80 font-medium">{title}</span> {body}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-12 border-t py-16 md:grid-cols-2 md:gap-16 md:py-20">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Des formats du web, aucun service.</h2>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Le lecteur lit ce que lit un navigateur : MP4 et WebM, HLS et DASH, sous-titres et
            chapitres en WebVTT par <code className="text-foreground font-mono text-sm">&lt;track&gt;</code>.
            Il n’appelle aucune API et ne dépend d’aucun compte. Vous hébergez vos fichiers où
            vous voulez.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Est-ce que ça alourdit mon app ?</h2>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Non, si vous servez du MP4. Le moteur de streaming, Shaka Player, est installé avec
            le lecteur, mais il n’est chargé qu’au moment où une source HLS ou DASH arrive.
            Sinon, il ne rejoint jamais votre bundle.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-6 border-t py-16 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight">Installer</h2>
        <CopyCommand command={INSTALL_COMMAND} />
        <p className="text-muted-foreground max-w-xl text-sm text-pretty">
          Le CLI copie le lecteur dans{" "}
          <code className="text-foreground font-mono text-xs">components/ui/video-player/</code> et
          ajoute les composants shadcn qui manquent.{" "}
          <Link href="/docs" className="text-foreground font-medium underline underline-offset-4">
            Lire la documentation
          </Link>
        </p>
      </section>
    </main>
  );
}
