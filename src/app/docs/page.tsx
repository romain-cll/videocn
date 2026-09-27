import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { ControlsTable } from "@/components/docs/controls-table";
import { DocsKeyboardShortcuts } from "@/components/docs/docs-keyboard-shortcuts";
import {
  DocsSection,
  DocsSubheading,
  DocsText,
  InlineCode,
} from "@/components/docs/docs-section";
import { DocsToc, type DocsTocItem } from "@/components/docs/docs-toc";
import { ReferenceTable, type ReferenceRow } from "@/components/docs/reference-table";
import { bundleSize } from "@/lib/bundle";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Install videoCn with the shadcn CLI, drop in <VideoCn />, and tune it through props: controls, chapters, streaming, theming.",
};

/** Le sommaire et les ancres viennent de la même liste : un titre renommé ne casse pas un lien. */
const SECTIONS = {
  introduction: { id: "introduction", title: "Introduction" },
  installation: { id: "installation", title: "Installation" },
  usage: { id: "usage", title: "Usage" },
  props: { id: "props", title: "Props" },
  controls: { id: "controls", title: "Controls" },
  chapters: { id: "chapters", title: "Chapters" },
  sources: { id: "sources", title: "Sources & streaming" },
  keyboard: { id: "keyboard-shortcuts", title: "Keyboard shortcuts" },
  theming: { id: "theming", title: "Theming" },
  bundle: { id: "bundle-size", title: "Bundle size" },
  accessibility: { id: "accessibility", title: "Accessibility" },
} as const satisfies Record<string, DocsTocItem>;

const TOC: readonly DocsTocItem[] = Object.values(SECTIONS);

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

const CHAPTERS_EXAMPLE = `<VideoCn
  src="/talk.mp4"
  poster="/talk.jpg"
  chapters={[
    { time: 0, label: "Introduction" },
    { time: 135, label: "Setting things up" },
    { time: 450, label: "Questions" },
  ]}
/>`;

/** Repris de `src/components/player-demo.tsx` : l'exemple réglé de la démo. */
const CONTROLS_EXAMPLE = `<VideoCn
  src="/clip.mp4"
  chapters={chapters}
  controls={{
    pictureInPicture: false,
    playbackRate: { rates: [1, 1.5, 2] },
    autoHideDelay: 1000,
    keyboard: false,
    scrubber: { chapters: false },
  }}
/>`;

const TYPE_EXAMPLE = `<VideoCn
  src="https://cdn.example.com/stream?token=abc123"
  type="hls"
/>`;

const RADIUS_EXAMPLE = `:root {
  --radius: 0;
}`;

/** Une ligne par prop de `VideoCnProps`, dans `registry/videocn/video-cn.tsx`. */
const PROPS: readonly ReferenceRow[] = [
  {
    name: "src",
    type: "string",
    description: "The video URL. Required.",
  },
  {
    name: "type",
    type: '"native" | "hls" | "dash"',
    defaultValue: "detected",
    description: (
      <>
        Overrides source detection. Use it for signed URLs or URLs without an extension. See{" "}
        <a href={`#${SECTIONS.sources.id}`} className="text-foreground underline underline-offset-4">
          Sources
        </a>
        .
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
        <a href={`#${SECTIONS.chapters.id}`} className="text-foreground underline underline-offset-4">
          Chapters
        </a>
        .
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
        <a href={`#${SECTIONS.controls.id}`} className="text-foreground underline underline-offset-4">
          Controls
        </a>
        .
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

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:grid lg:grid-cols-4 lg:gap-12">
      {/* Masqué sous `lg` : sur une colonne, le sommaire pousserait tout le
          contenu sous la ligne de flottaison. */}
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <DocsToc items={TOC} />
        </div>
      </aside>

      <main className="flex min-w-0 flex-col gap-16 lg:col-span-3">
        <DocsSection {...SECTIONS.introduction}>
          <DocsText>
            videoCn is a video player for shadcn/ui, distributed as a shadcn registry. There is a
            single item, <InlineCode>{siteConfig.namespace}/player</InlineCode>. The CLI copies its
            source into your project: the code is yours.
          </DocsText>
          <DocsText>
            It is built on the native <InlineCode>{"<video>"}</InlineCode> element and your own
            shadcn tokens. Everything is tuned through props, so you never have to edit the files
            you received.
          </DocsText>
        </DocsSection>

        <DocsSection {...SECTIONS.installation}>
          <DocsSubheading>1. Declare the registry</DocsSubheading>
          <DocsText>
            In your project&apos;s <InlineCode>components.json</InlineCode>:
          </DocsText>
          <CodeBlock
            title="components.json"
            code={JSON.stringify(
              { registries: { [siteConfig.namespace]: siteConfig.registryUrl } },
              null,
              2,
            )}
          />

          <DocsSubheading>2. Install the player</DocsSubheading>
          <CodeBlock code={`pnpm dlx shadcn@latest add ${siteConfig.namespace}/player`} />

          <div className="bg-muted/40 flex flex-col gap-4 rounded-lg border p-6">
            <DocsText>Or skip step 1 and install straight from the URL:</DocsText>
            <CodeBlock code={`pnpm dlx shadcn@latest add ${PLAYER_URL}`} />
          </div>

          <DocsSubheading>What the CLI adds</DocsSubheading>
          <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-6 leading-7">
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
          </ul>
        </DocsSection>

        <DocsSection {...SECTIONS.usage}>
          <DocsText>Import the component and give it a source.</DocsText>
          <CodeBlock title="demo.tsx" code={MINIMAL_EXAMPLE} />
          <DocsText>
            Adjust the import path if your <InlineCode>ui</InlineCode> alias differs. A poster and
            chapters are two more props:
          </DocsText>
          <CodeBlock code={CHAPTERS_EXAMPLE} />
        </DocsSection>

        <DocsSection {...SECTIONS.props}>
          <DocsText>
            <InlineCode>{"<VideoCn>"}</InlineCode> takes no children. The control bar is always
            the player&apos;s own, driven by the props below.
          </DocsText>
          <ReferenceTable rows={PROPS} />
        </DocsSection>

        <DocsSection {...SECTIONS.controls}>
          <DocsText>
            The <InlineCode>controls</InlineCode> prop follows one rule: every control is{" "}
            <InlineCode>boolean | options</InlineCode>. Missing or <InlineCode>true</InlineCode>,
            it is there with its defaults. <InlineCode>false</InlineCode>, it is gone. An object,
            it is there and configured.
          </DocsText>
          <ControlsTable />
          <DocsSubheading>Configured through props</DocsSubheading>
          <DocsText>
            No Picture-in-Picture, three speeds instead of seven, a bar that hides after one
            second, no keyboard shortcuts, and chapters kept out of the progress bar.
          </DocsText>
          <CodeBlock code={CONTROLS_EXAMPLE} />
        </DocsSection>

        <DocsSection {...SECTIONS.chapters}>
          <DocsText>
            Pass a list of <InlineCode>{"{ time, label }"}</InlineCode>, with{" "}
            <InlineCode>time</InlineCode> in seconds. Chapters split the progress bar into segments
            and fill a menu.
          </DocsText>
          <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-6 leading-7">
            <li>A chapter ends where the next one starts. The last one ends with the video.</li>
            <li>The first chapter always starts at 0, whatever time you give it.</li>
            <li>
              Order does not matter. Duplicate times keep the first entry. Empty labels and times
              outside the video are dropped.
            </li>
            <li>Chapters have no effect on a live stream.</li>
          </ul>
          <DocsText>
            Without chapters, the chapter menu is not rendered at all. Two options control the
            display: <InlineCode>controls.chapters: false</InlineCode> removes the menu, and{" "}
            <InlineCode>{"controls.scrubber: { chapters: false }"}</InlineCode> keeps the bar in one
            piece while leaving the menu in place.
          </DocsText>
        </DocsSection>

        <DocsSection {...SECTIONS.sources}>
          <DocsText>
            MP4 and WebM files play on the native <InlineCode>{"<video>"}</InlineCode> element. No
            streaming JavaScript is involved.
          </DocsText>
          <DocsText>
            HLS (<InlineCode>.m3u8</InlineCode>) and DASH (<InlineCode>.mpd</InlineCode>) go
            through Shaka Player. It is loaded with a dynamic{" "}
            <InlineCode>import()</InlineCode>, only when such a source is played.
          </DocsText>
          <DocsSubheading>Source detection</DocsSubheading>
          <DocsText>
            The type is detected from the URL extension, ignoring the query string and hash.
            Anything else is treated as native. When the URL is signed or has no extension, set{" "}
            <InlineCode>type</InlineCode> yourself:
          </DocsText>
          <CodeBlock code={TYPE_EXAMPLE} />
          <DocsSubheading>Live and DVR</DocsSubheading>
          <DocsText>
            On a live stream, the progress bar covers the window the stream still serves, so you
            can seek back inside it. The time display shows how far behind the live edge you are,
            as <InlineCode>−0:42</InlineCode>. A Live badge appears: solid at the edge, dimmed when
            you are behind, and one click brings you back.
          </DocsText>
          <DocsSubheading>Quality</DocsSubheading>
          <DocsText>
            With HLS and DASH, the quality menu lists one entry per resolution. In automatic mode,
            the menu shows what is actually playing, for example{" "}
            <InlineCode>Auto (720p)</InlineCode>. On the native engine, the browser exposes no
            levels, so the button stays visible but disabled.
          </DocsText>
        </DocsSection>

        <DocsSection {...SECTIONS.keyboard}>
          <DocsText>The player listens to the keyboard once it has focus.</DocsText>
          <DocsKeyboardShortcuts />
          <DocsText>
            Shortcuts are ignored while focus is in an input, a textarea, a select or an editable
            element. If your app already has its own, turn them off with{" "}
            <InlineCode>{"controls={{ keyboard: false }}"}</InlineCode>.
          </DocsText>
        </DocsSection>

        <DocsSection {...SECTIONS.theming}>
          <DocsText>
            The player reads your shadcn tokens. It has no hard-coded colors, so light and dark
            mode work without configuration.
          </DocsText>
          <DocsText>
            The radius follows <InlineCode>--radius</InlineCode> everywhere: frame, menus, progress
            bar, volume slider and Live badge. A theme with <InlineCode>--radius: 0</InlineCode>{" "}
            gets a fully square player.
          </DocsText>
          <DocsText>
            Some shadcn styles, such as <InlineCode>lyra</InlineCode> and{" "}
            <InlineCode>sera</InlineCode>, hard-code square corners in each component instead of
            setting <InlineCode>--radius</InlineCode>. With those styles, set it yourself. The rest
            of your project does not read it, so nothing else changes.
          </DocsText>
          <CodeBlock title="globals.css" code={RADIUS_EXAMPLE} />
        </DocsSection>

        <DocsSection {...SECTIONS.bundle}>
          <DocsText>Measured, not estimated. Sizes are gzipped.</DocsText>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="px-4 py-2 font-medium">Part</th>
                  <th className="px-4 py-2 font-medium">Gzip</th>
                  <th className="px-4 py-2 font-medium">Minified</th>
                  <th className="px-4 py-2 font-medium">Loaded</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground divide-y">
                <tr>
                  <td className="text-foreground px-4 py-3">Player core</td>
                  <td className="px-4 py-3 font-mono text-xs">{bundleSize.core.gzip}</td>
                  <td className="px-4 py-3 font-mono text-xs">{bundleSize.core.minified}</td>
                  <td className="px-4 py-3">Always</td>
                </tr>
                <tr>
                  <td className="text-foreground px-4 py-3">Shaka Player</td>
                  <td className="px-4 py-3 font-mono text-xs">{bundleSize.shaka.gzip}</td>
                  <td className="px-4 py-3 font-mono text-xs">{bundleSize.shaka.minified}</td>
                  <td className="px-4 py-3">Only for HLS and DASH</td>
                </tr>
              </tbody>
            </table>
          </div>
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

        <DocsSection {...SECTIONS.accessibility}>
          <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-6 leading-7">
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
          </ul>
        </DocsSection>

        <p className="text-muted-foreground border-t pt-8 text-sm text-pretty">
          Subtitles and a most-replayed heatmap are not available yet.{" "}
          <Link href="/#roadmap" className="text-foreground underline underline-offset-4">
            See the roadmap
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
