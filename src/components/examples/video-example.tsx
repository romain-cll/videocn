import { ClapperboardIcon, SearchIcon } from "lucide-react";

import { ExamplePlayer } from "@/components/examples/example-player";
import { EXAMPLE_VIDEOS } from "@/components/examples/videos";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Largeurs variées pour que les six suggestions ne soient pas des clones
 * parfaits : une page figée reste crédible si ses lignes n'ont pas toutes la
 * même longueur.
 */
const SUGGESTION_LINE_WIDTHS = ["w-4/5", "w-full", "w-2/3", "w-full", "w-3/4", "w-1/2"] as const;

/**
 * Une pilule squelette par action (j'aime, partager, enregistrer…) : la
 * largeur suffit à suggérer l'icône + le libellé sans en dessiner un.
 */
const ACTION_PILL_WIDTHS = ["w-16", "w-20", "w-24", "w-20"] as const;

/**
 * Page type plateforme vidéo, avec une marque inventée (« Reelio », aucun lien
 * avec un service existant). Tout y est un squelette figé sauf le lecteur, le
 * titre réel de la vidéo, le nom de la marque et le bouton d'abonnement — le
 * reste ne fait que composer la page autour du `<VideoCn>`.
 *
 * Racine en `@container` : ce composant est rendu à la fois dans l'onglet
 * ~1050 px de la landing et en pleine page jusqu'à `max-w-screen-2xl`, donc
 * les variantes ci-dessous répondent au conteneur (`@3xl`, `@5xl`), jamais au
 * viewport.
 */
export function VideoExample() {
  const video = EXAMPLE_VIDEOS.sintel;

  return (
    <div className="@container bg-background text-foreground">
      <header className="flex items-center gap-3 border-b px-4 py-3 @3xl:gap-6 @3xl:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ClapperboardIcon className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Reelio</span>
        </div>

        <div className="relative mx-auto min-w-0 max-w-md flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            disabled
            placeholder="Search"
            aria-label="Search"
            className="rounded-full pl-9"
          />
        </div>

        <Skeleton className="size-8 shrink-0 rounded-full animate-none" />
      </header>

      <div className="flex flex-col gap-6 p-4 @3xl:p-6 @5xl:flex-row @5xl:items-start @5xl:gap-8">
        <div className="flex min-w-0 flex-col gap-4 @5xl:max-w-4xl @5xl:flex-1">
          <ExamplePlayer video={video} className="w-full" />

          <h1 className="text-lg font-semibold tracking-tight @3xl:text-xl">
            Sintel — a Blender Foundation short film
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback />
              </Avatar>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28 rounded-full animate-none" />
                <Skeleton className="h-3 w-20 rounded-full animate-none" />
              </div>
              <Button className="ml-2 rounded-full">Subscribe</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {ACTION_PILL_WIDTHS.map((width, index) => (
                <Skeleton
                  key={index}
                  className={`h-8 ${width} shrink-0 rounded-full animate-none`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-4">
            <Skeleton className="h-3 w-40 rounded-full animate-none" />
            <Skeleton className="mt-1 h-3 w-full rounded-full animate-none" />
            <Skeleton className="h-3 w-5/6 rounded-full animate-none" />
            <Skeleton className="h-3 w-2/3 rounded-full animate-none" />
          </div>
        </div>

        <aside className="flex w-full flex-col gap-4 @5xl:w-80 @5xl:shrink-0">
          <Skeleton className="h-4 w-24 rounded-full animate-none" />
          <div className="flex flex-col gap-3">
            {SUGGESTION_LINE_WIDTHS.map((width, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="aspect-video w-36 shrink-0 rounded-lg animate-none @3xl:w-40" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
                  <Skeleton className="h-3.5 w-full rounded-full animate-none" />
                  <Skeleton className={`h-3.5 ${width} rounded-full animate-none`} />
                  <Skeleton className="h-3 w-1/2 rounded-full animate-none" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
