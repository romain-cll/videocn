import {
  BellIcon,
  BookmarkIcon,
  CompassIcon,
  HeartIcon,
  HexagonIcon,
  HomeIcon,
  MailIcon,
  MessageCircleIcon,
  Repeat2Icon,
  Share2Icon,
  UserIcon,
} from "lucide-react";
import type { ComponentType } from "react";

import { ExamplePlayer } from "@/components/examples/example-player";
import { EXAMPLE_VIDEOS } from "@/components/examples/videos";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RAIL_ITEMS: { icon: ComponentType<{ className?: string }>; width: string }[] = [
  { icon: HomeIcon, width: "w-14" },
  { icon: CompassIcon, width: "w-20" },
  { icon: BellIcon, width: "w-24" },
  { icon: MailIcon, width: "w-16" },
  { icon: BookmarkIcon, width: "w-20" },
  { icon: UserIcon, width: "w-16" },
];

const TRENDS = [
  { category: "w-16", title: "w-32", meta: "w-20" },
  { category: "w-20", title: "w-28", meta: "w-16" },
  { category: "w-16", title: "w-36", meta: "w-20" },
  { category: "w-24", title: "w-24", meta: "w-16" },
];

/** Un avatar entièrement squelette : même le contenu du fallback l'est. */
function SkeletonAvatar() {
  return (
    <Avatar>
      <AvatarFallback>
        <Skeleton className="size-full rounded-full animate-none" />
      </AvatarFallback>
    </Avatar>
  );
}

/** Le second post : rien de réel, jusqu'aux icônes d'actions. */
function SkeletonPost() {
  return (
    <article aria-hidden className="flex gap-3 border-t border-border p-4">
      <SkeletonAvatar />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24 animate-none" />
          <Skeleton className="h-3 w-16 animate-none" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full animate-none" />
          <Skeleton className="h-3 w-4/5 animate-none" />
        </div>
        <div className="mt-1 flex max-w-sm items-center justify-between">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="size-4 rounded-full animate-none" />
          ))}
        </div>
      </div>
    </article>
  );
}

/** La page type réseau social : une marque inventée, façon fil chronologique. */
export function SocialExample() {
  const video = EXAMPLE_VIDEOS.bigBuckBunny;

  return (
    <div className="@container flex bg-background text-foreground">
      <nav
        aria-hidden
        className="hidden w-48 shrink-0 flex-col gap-1 border-r border-border p-4 @3xl:flex"
      >
        <HexagonIcon className="mb-4 ml-3 size-6" />
        {RAIL_ITEMS.map(({ icon: Icon, width }, index) => (
          <div key={index} className="flex items-center gap-3 rounded-full px-3 py-2.5">
            <Icon className="size-5" />
            <Skeleton className={`h-3 ${width} animate-none`} />
          </div>
        ))}
      </nav>

      <div className="min-w-0 flex-1 border-border @3xl:border-l @5xl:border-r">
        <div className="mx-auto flex w-full max-w-2xl flex-col">
          <Tabs defaultValue="for-you">
            <TabsList
              variant="line"
              className="h-12 w-full justify-start rounded-none border-b border-border px-4"
            >
              <TabsTrigger value="for-you">For you</TabsTrigger>
              <TabsTrigger value="subscriptions">Following</TabsTrigger>
            </TabsList>

            <TabsContent value="for-you" className="flex flex-col">
              <article className="flex gap-3 p-4">
                <SkeletonAvatar />
                <div className="min-w-0 flex-1">
                  <div aria-hidden className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24 animate-none" />
                    <Skeleton className="h-3 w-16 animate-none" />
                  </div>
                  <p className="mt-1.5 text-sm">
                    New short film just dropped: ten minutes of Big Buck Bunny.
                  </p>
                  <ExamplePlayer
                    video={video}
                    className="mt-3 w-full rounded-2xl"
                  />
                  <div
                    aria-hidden
                    className="mt-3 flex max-w-sm items-center justify-between text-muted-foreground"
                  >
                    <div className="flex items-center gap-1.5">
                      <MessageCircleIcon className="size-4" />
                      <Skeleton className="h-3 w-4 animate-none" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Repeat2Icon className="size-4" />
                      <Skeleton className="h-3 w-4 animate-none" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HeartIcon className="size-4" />
                      <Skeleton className="h-3 w-4 animate-none" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Share2Icon className="size-4" />
                      <Skeleton className="h-3 w-4 animate-none" />
                    </div>
                  </div>
                </div>
              </article>
              <Separator />
              <SkeletonPost />
            </TabsContent>

            <TabsContent value="subscriptions" className="flex flex-col">
              <SkeletonPost />
              <Separator />
              <SkeletonPost />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <aside
        aria-hidden
        className="hidden w-72 shrink-0 flex-col gap-4 p-4 @5xl:flex"
      >
        <p className="text-sm font-semibold">Trending</p>
        <div className="flex flex-col gap-4">
          {TRENDS.map((trend, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <Skeleton className={`h-2.5 ${trend.category} animate-none`} />
              <Skeleton className={`h-3 ${trend.title} animate-none`} />
              <Skeleton className={`h-2.5 ${trend.meta} animate-none`} />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
