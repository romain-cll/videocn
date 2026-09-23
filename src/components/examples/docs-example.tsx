import { BookOpenIcon, ChevronRightIcon, InfoIcon, SearchIcon } from "lucide-react";

import { ExamplePlayer } from "@/components/examples/example-player";
import { EXAMPLE_VIDEOS } from "@/components/examples/videos";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Un groupe de la nav gauche. Une seule entrée de tout l'arbre est réelle —
 * la page courante — le reste n'est que des largeurs de traits.
 */
const NAV_GROUPS: { title: string; items: { width: string; label?: string }[] }[] = [
  {
    title: "w-20",
    items: [{ width: "w-28" }, { width: "w-20" }, { width: "w-32" }],
  },
  {
    title: "w-24",
    items: [
      { width: "w-24" },
      { width: "w-32", label: "Video player" },
      { width: "w-28" },
      { width: "w-20" },
    ],
  },
  {
    title: "w-16",
    items: [{ width: "w-28" }, { width: "w-20" }],
  },
];

const PARAGRAPH_ONE = ["w-full", "w-11/12", "w-full", "w-2/3"];
const PARAGRAPH_TWO = ["w-full", "w-4/5", "w-full", "w-3/4", "w-1/2"];

const CODE_LINES = ["w-2/5", "w-3/5 ml-4", "w-1/3 ml-4", "w-1/4", "w-1/2"];

const TOC_ITEMS = ["w-24", "w-20 ml-3", "w-28 ml-3", "w-20"];

/** La page type documentation technique : une marque inventée, façon GitBook. */
export function DocsExample() {
  const video = EXAMPLE_VIDEOS.tearsOfSteel;

  return (
    <div className="@container flex min-h-full flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-4 @3xl:px-6">
        <div className="flex items-center gap-2">
          <BookOpenIcon className="size-5" />
          <span className="text-sm font-semibold tracking-tight">
            Arcway <span className="font-normal text-muted-foreground">docs</span>
          </span>
        </div>
        <div
          aria-hidden
          className="ml-auto flex h-8 w-full max-w-xs items-center gap-2 rounded-lg border border-input bg-muted/40 px-2.5"
        >
          <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <Skeleton className="h-3 w-full max-w-24 animate-none" />
          <KbdGroup className="ml-auto hidden @sm:inline-flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
      </header>

      <div className="flex min-w-0 flex-1">
        <nav
          aria-hidden
          className="hidden w-56 shrink-0 flex-col gap-6 border-r border-border px-6 py-8 @3xl:flex"
        >
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-2">
              <Skeleton className={`h-3 ${group.title} animate-none`} />
              <div className="flex flex-col gap-1">
                {group.items.map((item, itemIndex) =>
                  item.label ? (
                    <div
                      key={itemIndex}
                      className="border-l-2 border-foreground py-0.5 pl-2.5 text-sm font-medium text-foreground"
                    >
                      {item.label}
                    </div>
                  ) : (
                    <div key={itemIndex} className="border-l-2 border-transparent py-1 pl-2.5">
                      <Skeleton className={`h-3 ${item.width} animate-none`} />
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>

        <div className="min-w-0 flex-1 px-4 py-10 @3xl:px-10">
          <article className="mx-auto flex w-full max-w-2xl flex-col">
            <div aria-hidden className="flex items-center gap-1.5 text-sm">
              <Skeleton className="h-3 w-20 animate-none" />
              <ChevronRightIcon className="size-3.5 text-muted-foreground" />
              <Skeleton className="h-3 w-24 animate-none" />
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
              Embed a video
            </h1>

            <div aria-hidden className="mt-6 flex flex-col gap-2.5">
              {PARAGRAPH_ONE.map((width, index) => (
                <Skeleton key={index} className={`h-3 ${width} animate-none`} />
              ))}
            </div>

            <figure className="my-8">
              <ExamplePlayer video={video} className="w-full" />
              <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                Tears of Steel, Blender Foundation. The player picks up the docs theme.
              </figcaption>
            </figure>

            <div aria-hidden className="flex flex-col gap-2.5">
              {PARAGRAPH_TWO.map((width, index) => (
                <Skeleton key={index} className={`h-3 ${width} animate-none`} />
              ))}
            </div>

            <div className="my-8 flex gap-3 rounded-lg border border-border bg-muted/40 p-4">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Note</p>
                <div aria-hidden className="mt-2 flex flex-col gap-2">
                  <Skeleton className="h-3 w-full animate-none" />
                  <Skeleton className="h-3 w-2/3 animate-none" />
                </div>
              </div>
            </div>

            <div aria-hidden className="flex flex-col gap-2.5 rounded-lg bg-muted/40 p-4">
              {CODE_LINES.map((width, index) => (
                <Skeleton key={index} className={`h-3 ${width} animate-none`} />
              ))}
            </div>
          </article>
        </div>

        <aside
          aria-hidden
          className="hidden w-56 shrink-0 flex-col gap-3 border-l border-border px-6 py-10 @5xl:flex"
        >
          <p className="text-sm font-medium">On this page</p>
          <div className="flex flex-col gap-2.5">
            {TOC_ITEMS.map((width, index) => (
              <Skeleton key={index} className={`h-3 ${width} animate-none`} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
