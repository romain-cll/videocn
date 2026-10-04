import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { ControlsTable } from "@/components/docs/controls-table";
import { DocsKeyboardShortcuts } from "@/components/docs/docs-keyboard-shortcuts";
import {
  DocsExample,
  DocsLink,
  DocsList,
  DocsSection,
  DocsSubheading,
  DocsText,
  InlineCode,
} from "@/components/docs/docs-section";
import { DocsToc, type DocsTocItem } from "@/components/docs/docs-toc";
import { LazyPlayer } from "@/components/docs/lazy-player";
import {
  DocsCell,
  DocsTable,
  ReferenceTable,
  type ReferenceRow,
} from "@/components/docs/reference-table";
import { EXAMPLE_VIDEOS, SINTEL_CHAPTERS } from "@/lib/videos";
import { Frame } from "@/components/frame";
import { bundleSize } from "@/lib/bundle";
import { BUNNY_CHAPTERS, getDemoSource } from "@/lib/demo-media";
import { themeSnippet } from "@/lib/theme-snippet";
import { siteConfig } from "@/lib/site-config";
import { copyInstallEvent } from "@/lib/analytics";
import { PAGE_DESCRIPTIONS, pageMetadata } from "@/lib/metadata";
import { videoCnSnippet } from "@/lib/snippet";
import type { ControlsOptions } from "@/registry/videocn/controls-options";

export const metadata: Metadata = pageMetadata({
  title: "Docs",
  description: PAGE_DESCRIPTIONS.docs,
  path: "/docs",
});

/** Le sommaire et les ancres viennent de la même liste : un titre renommé ne casse pas un lien. */
const S = {
  installation: { id: "installation", title: "Installation" },
  usage: { id: "usage", title: "Usage" },
  examples: { id: "examples", title: "Examples" },
  chapters: { id: "chapters", title: "Chapters" },
  streaming: { id: "streaming", title: "Streaming (HLS)" },
  live: { id: "live", title: "Live" },
  poster: { id: "poster", title: "Poster" },
  configured: { id: "configured-controls", title: "Configured controls" },
  square: { id: "square-corners", title: "Square corners" },
  palette: { id: "custom-palette", title: "Custom palette" },
  api: { id: "api-reference", title: "API Reference" },
  props: { id: "props", title: "Props" },
  controls: { id: "controls", title: "Controls" },
  keyboard: { id: "keyboard-shortcuts", title: "Keyboard shortcuts" },
  theming: { id: "theming", title: "Theming" },
  bundle: { id: "bundle-size", title: "Bundle size" },
  accessibility: { id: "accessibility", title: "Accessibility" },
} as const satisfies Record<string, DocsTocItem>;

const TOC: readonly DocsTocItem[] = [
  S.installation,
  S.usage,
  {
    ...S.examples,
    items: [S.chapters, S.streaming, S.live, S.poster, S.configured, S.square, S.palette],
  },
  { ...S.api, items: [S.props, S.controls] },
  S.keyboard,
  S.theming,
  S.bundle,
  S.accessibility,
];

const PLAYER_URL = siteConfig.registryUrl.replace("{name}", "player");

/**
 * Le chemin d'import suit le `target` des fichiers dans `registry.json` :
 * `@ui/video-player/…`, soit `components/ui/video-player/` avec les alias par
 * défaut.
 */
const IMPORT_LINE = `import { VideoCn } from "@/components/ui/video-player/video-cn"`;

const MINIMAL_EXAMPLE = `${IMPORT_LINE}

export function Demo() {
  return <VideoCn src="/clip.mp4" />
}`;

/** Écrit une liste de chapitres telle qu'on la taperait, pour l'extrait. */
function chaptersCode(chapters: readonly { time: number; label: string }[]) {
  const lines = chapters.map(
    (chapter) => `  { time: ${chapter.time}, label: ${JSON.stringify(chapter.label)} },`,
  );
  return `const chapters = [\n${lines.join("\n")}\n]`;
}

/*
 * Les props de chaque aperçu. Le même objet part au lecteur et à
 * `videoCnSnippet` : le code affiché est exactement ce qui est monté.
 */
const BUNNY = EXAMPLE_VIDEOS.bigBuckBunny;
const SINTEL = EXAMPLE_VIDEOS.sintel;
const TEARS = EXAMPLE_VIDEOS.tearsOfSteel;
const HLS = getDemoSource("hls");
const LIVE = getDemoSource("live");

const MAIN = { src: BUNNY.src, poster: BUNNY.poster, chapters: BUNNY_CHAPTERS };
const MAIN_CODE = `${chaptersCode(BUNNY_CHAPTERS)}

${videoCnSnippet({ ...MAIN, chapters: "chapters" })}`;

const CHAPTERS = {
  src: SINTEL.src,
  poster: SINTEL.poster,
  chapters: SINTEL_CHAPTERS,
};
const CHAPTERS_CODE = `${chaptersCode(SINTEL_CHAPTERS)}

${videoCnSnippet({ ...CHAPTERS, chapters: "chapters" })}`;

const STREAMING = { src: HLS.src, type: "hls" } as const;
const LIVE_PROPS = { src: LIVE.src };
const POSTER = { src: TEARS.src, poster: TEARS.poster };

/** Repris de `src/components/player-demo.tsx` : l'exemple réglé de la démo. */
const TRIMMED_CONTROLS: ControlsOptions = {
  pictureInPicture: false,
  playbackRate: { rates: [1, 1.5, 2] },
  autoHideDelay: 1000,
  keyboard: false,
  scrubber: { chapters: false },
};
const CONFIGURED = { ...MAIN, controls: TRIMMED_CONTROLS };

const TYPE_EXAMPLE = `<VideoCn
  src="https://cdn.example.com/stream?token=abc123"
  type="hls"
/>`;

const RADIUS_CSS = `:root {
  --radius: 0;
}`;

/** Les valeurs de `.demo-theme-blue`, depuis la source partagée avec la landing et le playground. */
const PALETTE_CSS = themeSnippet("blue", "default") ?? "";

const MAIN_JSX = videoCnSnippet({ ...MAIN, chapters: "chapters" });

/** Une ligne par prop de `VideoCnProps`, dans `registry/videocn/video-cn.tsx`. */
const PROPS: readonly ReferenceRow[] = [
  { name: "src", type: "string", description: "The video URL. Required." },
  {
    name: "type",
    type: '"native" | "hls" | "dash"',
    defaultValue: "detected",
    description: (
      <>
        Overrides source detection. Use it for signed URLs or URLs without an extension. See{" "}
        <DocsLink href={`#${S.streaming.id}`}>Streaming</DocsLink>.
      </>
    ),
  },
  {
    name: "poster",
    type: "string",
    description: "Image shown until playback starts.",
  },
  {
    name: "chapters",
    type: "{ time: number; label: string }[]",
    description: (
      <>
        Start time in seconds and title. See{" "}
        <DocsLink href={`#${S.chapters.id}`}>Chapters</DocsLink>.
      </>
    ),
  },
  {
    name: "autoPlay",
    type: "boolean",
    defaultValue: "false",
    description: "Passed to the video element. Browsers usually require it to be muted.",
  },
  {
    name: "loop",
    type: "boolean",
    defaultValue: "false",
    description: "Passed to the video element.",
  },
  {
    name: "defaultVolume",
    type: "number",
    defaultValue: "0.5",
    description: "Initial volume, from 0 to 1. The player owns it afterwards.",
  },
  {
    name: "defaultMuted",
    type: "boolean",
    defaultValue: "false",
    description: "Start muted. Initial value only.",
  },
  {
    name: "controls",
    type: "ControlsOptions",
    description: (
      <>
        What the control bar shows and how it behaves. See{" "}
        <DocsLink href={`#${S.controls.id}`}>Controls</DocsLink>.
      </>
    ),
  },
  {
    name: "className",
    type: "string",
    description: "Classes for the player container.",
  },
  {
    name: "ref",
    type: "Ref<HTMLVideoElement>",
    description: "Forwarded to the inner video element.",
  },
];

const PILL =
  "bg-muted text-foreground hover:bg-muted/70 inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium transition-colors";

export default function DocsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 md:py-14">
      <article className="mx-auto flex w-full max-w-160 min-w-0 flex-col gap-12">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">Video Player</h1>
            <p className="text-muted-foreground text-base text-pretty">
              A video player for shadcn/ui, built on the native <InlineCode>{"<video>"}</InlineCode>{" "}
              element and your own tokens.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link href="/playground" className={PILL}>
                Playground
              </Link>
              <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className={PILL}>
                GitHub
              </a>
            </div>
          </header>

          <div className="flex flex-col gap-3">
            <Frame label="chapters" contentClassName="p-4 sm:p-6">
              <LazyPlayer {...MAIN} />
            </Frame>
            <CodeBlock code={MAIN_CODE} />
          </div>
        </div>

        <DocsSection {...S.installation}>
          <DocsText>
            There is a single registry item, <InlineCode>{siteConfig.namespace}/player</InlineCode>.
            The CLI copies its source into your project: the code is yours.
          </DocsText>
          <DocsSubheading>1. Declare the registry</DocsSubheading>
          <DocsText>
            In your project&apos;s <InlineCode>components.json</InlineCode>:
          </DocsText>
          <CodeBlock
            title="components.json"
            code={JSON.stringify(
              {
                registries: { [siteConfig.namespace]: siteConfig.registryUrl },
              },
              null,
              2,
            )}
          />
          <DocsSubheading>2. Install the player</DocsSubheading>
          <CodeBlock
            code={`pnpm dlx shadcn@latest add ${siteConfig.namespace}/player`}
            event={copyInstallEvent("docs")}
          />
          <DocsText>Or skip step 1 and install straight from the URL:</DocsText>
          <CodeBlock code={`pnpm dlx shadcn@latest add ${PLAYER_URL}`} event={copyInstallEvent("docs")} />

          <DocsSubheading>What the CLI adds</DocsSubheading>
          <DocsList>
            <li>
              The player files, in <InlineCode>components/ui/video-player/</InlineCode> (your{" "}
              <InlineCode>ui</InlineCode> alias).
            </li>
            <li>
              The npm dependencies <InlineCode>shaka-player</InlineCode>,{" "}
              <InlineCode>cn</InlineCode> and <InlineCode>lucide-react</InlineCode>.
            </li>
            <li>
              The shadcn <InlineCode>button</InlineCode> component, if you don&apos;t have it yet.
            </li>
            <li>
              Two CSS variables, <InlineCode>--player-scrim</InlineCode> and{" "}
              <InlineCode>--player-backdrop</InlineCode>, for the gradient under the controls and
              the frame around the video.
            </li>
          </DocsList>
        </DocsSection>

        <DocsSection {...S.usage}>
          <DocsText>Import the component and give it a source.</DocsText>
          <CodeBlock title="demo.tsx" code={MINIMAL_EXAMPLE} />
          <DocsText>
            Adjust the import path if your <InlineCode>ui</InlineCode> alias differs. Everything
            else is a prop: you never have to edit the files you received.
          </DocsText>
        </DocsSection>

        <DocsSection {...S.examples}>
          <DocsExample
            {...S.chapters}
            label="chapters"
            description={
              <>
                Pass a list of <InlineCode>{"{ time, label }"}</InlineCode>, with{" "}
                <InlineCode>time</InlineCode> in seconds. Chapters split the progress bar into
                segments and fill a menu.
              </>
            }
            code={[{ code: CHAPTERS_CODE }]}
            extra={
              <>
                <DocsList>
                  <li>
                    A chapter ends where the next one starts. The last one ends with the video.
                  </li>
                  <li>The first chapter always starts at 0, whatever time you give it.</li>
                  <li>
                    Order does not matter. Duplicate times keep the first entry. Empty labels and
                    times outside the video are dropped.
                  </li>
                  <li>Chapters have no effect on a live stream.</li>
                </DocsList>
                <DocsText>
                  Without chapters, the chapter menu is not rendered at all.{" "}
                  <InlineCode>controls.chapters: false</InlineCode> removes the menu, and{" "}
                  <InlineCode>{"controls.scrubber: { chapters: false }"}</InlineCode> keeps the bar
                  in one piece while leaving the menu in place.
                </DocsText>
              </>
            }
          >
            <LazyPlayer {...CHAPTERS} ratio="sintel" />
          </DocsExample>

          <DocsExample
            {...S.streaming}
            label='type="hls"'
            description={
              <>
                HLS (<InlineCode>.m3u8</InlineCode>) and DASH (<InlineCode>.mpd</InlineCode>) go
                through Shaka Player, loaded with a dynamic <InlineCode>import()</InlineCode> only
                when such a source is played. MP4 and WebM stay on the native element.
              </>
            }
            code={[{ code: videoCnSnippet(STREAMING) }]}
            extra={
              <>
                <DocsText>
                  The type is detected from the URL extension, ignoring the query string and hash;
                  anything else is treated as native. It is set explicitly above for the sake of the
                  example. You only need <InlineCode>type</InlineCode> when the URL is signed or has
                  no extension:
                </DocsText>
                <CodeBlock code={TYPE_EXAMPLE} />
                <DocsText>
                  The Quality entry of the settings menu lists one choice per resolution. In
                  automatic mode, it shows what is actually playing, for example{" "}
                  <InlineCode>Auto (720p)</InlineCode>. On the native engine, the browser exposes no
                  levels, so the entry stays visible but greyed out.
                </DocsText>
              </>
            }
          >
            <LazyPlayer {...STREAMING} load="click" />
          </DocsExample>

          <DocsExample
            {...S.live}
            label="controls.live"
            description={
              <>
                On a live stream, the progress bar covers the window the stream still serves, so you
                can seek back inside it. The time display shows how far behind the live edge you
                are, as <InlineCode>−0:42</InlineCode>. The Live badge is solid at the edge, dimmed
                when you are behind, and one click brings you back.
              </>
            }
            code={[{ code: videoCnSnippet(LIVE_PROPS) }]}
          >
            <LazyPlayer {...LIVE_PROPS} load="click" />
          </DocsExample>

          <DocsExample
            {...S.poster}
            label="poster"
            description="An image shown until playback starts. Without one, the player shows the first frame, often black."
            code={[{ code: videoCnSnippet(POSTER) }]}
          >
            <LazyPlayer {...POSTER} ratio="tearsOfSteel" />
          </DocsExample>

          <DocsExample
            {...S.configured}
            label="controls"
            description="No Picture-in-Picture, three speeds instead of seven, a bar that hides after one second, no keyboard shortcuts, and chapters kept out of the progress bar."
            code={[{ code: videoCnSnippet({ ...CONFIGURED, chapters: "chapters" }) }]}
          >
            <LazyPlayer {...CONFIGURED} />
          </DocsExample>

          <DocsExample
            {...S.square}
            label="--radius: 0"
            description={
              <>
                The radius follows <InlineCode>--radius</InlineCode> everywhere: frame, menus,
                progress bar, volume slider and Live badge. Here it is set on a wrapper; in your
                app, set it on <InlineCode>:root</InlineCode>.
              </>
            }
            code={[{ code: RADIUS_CSS, title: "globals.css" }, { code: MAIN_JSX }]}
            extra={
              <DocsText>
                Some shadcn styles, such as <InlineCode>lyra</InlineCode> and{" "}
                <InlineCode>sera</InlineCode>, hard-code square corners in each component instead of
                setting <InlineCode>--radius</InlineCode>. With those styles, set it yourself. The
                rest of your project does not read it, so nothing else changes.
              </DocsText>
            }
          >
            <div className="demo-radius-none">
              <LazyPlayer {...MAIN} />
            </div>
          </DocsExample>

          <DocsExample
            {...S.palette}
            label="--primary"
            description="The player has no colors of its own: these are your theme tokens. Change them and the progress bar, focus rings and menus follow, in light and dark mode."
            code={[{ code: PALETTE_CSS, title: "globals.css" }, { code: MAIN_JSX }]}
          >
            <div className="demo-theme-blue">
              <LazyPlayer {...MAIN} />
            </div>
          </DocsExample>
        </DocsSection>

        <DocsSection {...S.api}>
          <DocsSubheading id={S.props.id}>{S.props.title}</DocsSubheading>
          <DocsText>
            <InlineCode>{"<VideoCn>"}</InlineCode> takes no children. The control bar is always the
            player&apos;s own, driven by the props below.
          </DocsText>
          <ReferenceTable rows={PROPS} />

          <DocsSubheading id={S.controls.id}>{S.controls.title}</DocsSubheading>
          <DocsText>
            Every option of <InlineCode>controls</InlineCode> is{" "}
            <InlineCode>boolean | options</InlineCode>. Missing or <InlineCode>true</InlineCode>,
            the control is there with its defaults. <InlineCode>false</InlineCode>, it is gone. An
            object, it is there and configured.
          </DocsText>
          <ControlsTable />
        </DocsSection>

        <DocsSection {...S.keyboard}>
          <DocsText>
            Active once the player has focus: one click on the picture is enough. On a focused
            slider, seek or volume, the arrows drive that slider.
          </DocsText>
          <DocsKeyboardShortcuts />
          <DocsText>
            Shortcuts are ignored while focus is in an input, a textarea, a select or an editable
            element. If your app already has its own, turn them off with{" "}
            <InlineCode>{"controls={{ keyboard: false }}"}</InlineCode>.
          </DocsText>
        </DocsSection>

        <DocsSection {...S.theming}>
          <DocsText>
            The player reads your shadcn tokens. It has no hard-coded colors, so light and dark mode
            work without configuration. See{" "}
            <DocsLink href={`#${S.square.id}`}>Square corners</DocsLink> and{" "}
            <DocsLink href={`#${S.palette.id}`}>Custom palette</DocsLink>.
          </DocsText>
          <DocsText>
            Two variables are the player&apos;s own, added by the CLI:{" "}
            <InlineCode>--player-scrim</InlineCode> for the gradient under the controls and{" "}
            <InlineCode>--player-backdrop</InlineCode> for the frame around the video.
          </DocsText>
        </DocsSection>

        <DocsSection {...S.bundle}>
          <DocsText>Measured, not estimated.</DocsText>
          <DocsTable columns={["Part", "Gzip", "Minified", "Loaded"]}>
            <tr>
              <DocsCell strong>Player core</DocsCell>
              <DocsCell code>{bundleSize.core.gzip}</DocsCell>
              <DocsCell code>{bundleSize.core.minified}</DocsCell>
              <DocsCell>Always</DocsCell>
            </tr>
            <tr>
              <DocsCell strong>Shaka Player</DocsCell>
              <DocsCell code>{bundleSize.shaka.gzip}</DocsCell>
              <DocsCell code>{bundleSize.shaka.minified}</DocsCell>
              <DocsCell>Only for HLS and DASH</DocsCell>
            </tr>
          </DocsTable>
          <DocsText>
            The core excludes React, <InlineCode>lucide-react</InlineCode>,{" "}
            <InlineCode>cn</InlineCode> and the shadcn button, which your app already ships. Shaka
            is a separate chunk, never downloaded for an MP4.
          </DocsText>
          <DocsText>
            <InlineCode>shaka-player</InlineCode> is still listed in the dependencies, so it is
            installed in every project. This is deliberate: a dynamic import of a missing package
            breaks the build, not just the runtime. It sits in <InlineCode>node_modules</InlineCode>
            , not in your bundle.
          </DocsText>
        </DocsSection>

        <DocsSection {...S.accessibility}>
          <DocsList>
            <li>
              The progress bar and volume are <InlineCode>role=&quot;slider&quot;</InlineCode>{" "}
              elements with a label and a readable value, such as a time or a percentage.
            </li>
            <li>
              Every button has a label. Play, mute and fullscreen announce their shortcut with{" "}
              <InlineCode>aria-keyshortcuts</InlineCode>.
            </li>
            <li>
              A click on the video gives the player focus without adding it to the tab order, and
              without drawing an outline. Keyboard focus inside the bar keeps its focus ring.
            </li>
          </DocsList>
        </DocsSection>

        <p className="text-muted-foreground border-t pt-6 text-sm text-pretty">
          Subtitles and a most-replayed heatmap are not available yet.{" "}
          <Link
            href="/#changelog"
            className="text-foreground font-medium underline underline-offset-4"
          >
            See what&apos;s coming in the changelog
          </Link>
          .
        </p>
      </article>

      {/* Masqué sous `xl` : à côté d'un article de 640 px, le sommaire n'a sa
          place que sur un écran large. */}
      <aside className="hidden w-64 shrink-0 xl:block">
        <div className="sticky top-20">
          <DocsToc items={TOC} />
        </div>
      </aside>
    </div>
  );
}
