/**
 * Le gabarit des images Open Graph, partagé par chaque page : 1200 × 630.
 * À gauche le logo, le titre et un appel à l'action ; à droite, le lecteur
 * lui-même — une vraie image de film sous sa barre de contrôles. Rien d'autre :
 * en vignette, c'est le lecteur qui doit se reconnaître.
 *
 * Rendu par `ImageResponse` (Satori) : styles inline uniquement, et tout
 * élément à plusieurs enfants doit être en `display: flex`. Les couleurs sont
 * celles du thème sombre du site, écrites en dur : une image partagée n'a pas
 * de thème à suivre.
 *
 * Le dossier commence par `_` : Next ne le route pas.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const COLORS = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  muted: "#a1a1a1",
  line: "rgba(255, 255, 255, 0.12)",
  track: "rgba(255, 255, 255, 0.28)",
};

const PADDING = 64;
const TEXT_WIDTH = 420;
const GAP = 48;
const PLAYER_WIDTH = OG_SIZE.width - PADDING * 2 - TEXT_WIDTH - GAP;
const PLAYER_HEIGHT = Math.round((PLAYER_WIDTH * 9) / 16);

/** Des proportions de chapitres, pour que la barre se lise comme celle du lecteur. */
const SEGMENTS = [7, 8, 8, 10, 13, 10, 4];
/** La tête de lecture, en fraction de la barre. */
const PLAYHEAD = 0.31;

/** Chaque segment et sa part remplie : 0, 1, ou ce qui précède la tête de lecture. */
const SEGMENT_FILLS = (() => {
  const total = SEGMENTS.reduce((sum, value) => sum + value, 0);
  let start = 0;
  return SEGMENTS.map((value) => {
    const from = start / total;
    start += value;
    const to = start / total;
    return { value, filled: Math.min(1, Math.max(0, (PLAYHEAD - from) / (to - from))) };
  });
})();


/** Les icônes de la barre, reprises de lucide comme dans le lecteur. */
function Icon({ children, size = 22 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.foreground}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function PlayerPreview({ poster }: { poster: string }) {
  return (
    <div
      style={{
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        display: "flex",
        position: "relative",
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${COLORS.line}`,
        background: "#000",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori ne connaît que <img>. */}
      <img src={poster} width={PLAYER_WIDTH} height={PLAYER_HEIGHT} alt="" style={{ objectFit: "cover" }} />

      {/* La barre, sur son voile comme dans le lecteur. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "56px 20px 16px",
          backgroundImage: "linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
        }}
      >
        <div style={{ display: "flex", gap: 3, height: 5 }}>
          {SEGMENT_FILLS.map((segment, index) => (
            <div
              key={index}
              style={{ flex: segment.value, display: "flex", background: COLORS.track, borderRadius: 3, overflow: "hidden" }}
            >
              <div style={{ width: `${segment.filled * 100}%`, background: COLORS.foreground }} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M6 3.5v17l14-8.5z" fill={COLORS.foreground} />
          </svg>
          <Icon>
            <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
            <path d="M16 9a5 5 0 0 1 0 6" />
            <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
          </Icon>
          <div style={{ display: "flex", width: 64, height: 4, background: COLORS.track, borderRadius: 2 }}>
            <div style={{ width: 40, background: COLORS.foreground, borderRadius: 2 }} />
          </div>
          <span style={{ fontFamily: "Geist Mono", fontSize: 17, color: COLORS.foreground }}>3:05 / 9:56</span>

          <div style={{ flex: 1 }} />

          <Icon>
            <path d="M3 5h.01M3 12h.01M3 19h.01M8 5h13M8 12h13M8 19h13" />
          </Icon>
          <Icon>
            <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
            <circle cx="12" cy="12" r="3" />
          </Icon>
          <Icon>
            <path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4" />
            <rect x="12" y="13" width="10" height="7" rx="2" />
          </Icon>
          <Icon>
            <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
          </Icon>
        </div>
      </div>
    </div>
  );
}

export async function renderOgImage({ title, cta }: { title: string; cta: string }) {
  const [regular, semiBold, mono, poster] = await Promise.all([
    // Chemins écrits en entier : un chemin calculé ferait tracer tout le projet
    // dans le code serveur au build.
    readFile(join(process.cwd(), "src/app/_og/fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "src/app/_og/fonts/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "src/app/_og/fonts/GeistMono-Regular.ttf")),
    readFile(join(process.cwd(), "public/examples/big-buck-bunny-poster.jpg")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: GAP,
          padding: PADDING,
          background: COLORS.background,
          color: COLORS.foreground,
          fontFamily: "Geist",
        }}
      >
        <div style={{ width: TEXT_WIDTH, display: "flex", flexDirection: "column", gap: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="36" height="36" viewBox="0 0 32 32">
              <clipPath id="logo">
                <rect width="32" height="32" rx="7" />
              </clipPath>
              <rect width="32" height="32" rx="7" fill={COLORS.foreground} />
              <path
                clipPath="url(#logo)"
                d="M12 -2V34M-2 0.83 34 21.83M-2 31.17 34 10.17"
                stroke={COLORS.background}
                strokeWidth="1.6"
              />
            </svg>
            <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6 }}>videoCn</span>
          </div>

          <span style={{ fontSize: 62, fontWeight: 600, letterSpacing: -2.6, lineHeight: 1.05 }}>{title}</span>

          {/* L'appel à l'action, en pilule comme les boutons du site. */}
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 28px",
                borderRadius: 999,
                background: COLORS.foreground,
                color: COLORS.background,
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              {cta}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.background} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <PlayerPreview poster={`data:image/jpeg;base64,${poster.toString("base64")}`} />
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semiBold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
