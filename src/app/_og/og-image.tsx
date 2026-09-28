/**
 * Le gabarit des images Open Graph, partagé par chaque page : 1200 × 630, le
 * cadre à rails de la landing, le logo, l'étiquette mono de la page, son titre,
 * et une barre de lecteur stylisée — ce que le site vend, reconnaissable en
 * vignette.
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

import { INSTALL_COMMAND } from "@/lib/install";

export const OG_SIZE = { width: 1200, height: 630 };

const COLORS = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  muted: "#a1a1a1",
  line: "rgba(255, 255, 255, 0.1)",
  track: "rgba(255, 255, 255, 0.2)",
  panel: "rgba(255, 255, 255, 0.04)",
};

const RAIL = 72;
const INSET = 112;

/** Des proportions de chapitres, pour que la barre se lise comme celle du lecteur. */
const SEGMENTS = [7, 8, 8, 10, 13, 10, 4];
/** La tête de lecture, en fraction de la barre. */
const PLAYHEAD = 0.31;

function font(file: string) {
  return readFile(join(process.cwd(), "src/app/_og/fonts", file));
}

export async function renderOgImage({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  const [regular, semiBold, mono] = await Promise.all([
    font("Geist-Regular.ttf"),
    font("Geist-SemiBold.ttf"),
    font("GeistMono-Regular.ttf"),
  ]);

  const total = SEGMENTS.reduce((sum, value) => sum + value, 0);
  let start = 0;
  const segments = SEGMENTS.map((value) => {
    const from = start / total;
    start += value;
    const to = start / total;
    // Remplissage de ce segment : 0, 1, ou la part avant la tête de lecture.
    const filled = Math.min(1, Math.max(0, (PLAYHEAD - from) / (to - from)));
    return { value, filled };
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COLORS.background,
          color: COLORS.foreground,
          fontFamily: "Geist",
          position: "relative",
        }}
      >
        {/* Les rails et les filets de la landing. */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: RAIL, width: 1, background: COLORS.line }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, right: RAIL, width: 1, background: COLORS.line }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, height: 1, background: COLORS.line }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 96, height: 1, background: COLORS.line }} />

        {/* En-tête : le logo, le nom, le domaine. */}
        <div
          style={{
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${INSET}px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="40" height="40" viewBox="0 0 32 32">
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
            <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.6 }}>videoCn</span>
          </div>
          <span style={{ fontFamily: "Geist Mono", fontSize: 22, color: COLORS.muted }}>videocn.dev</span>
        </div>

        {/* Le corps : étiquette, titre, phrase, puis la barre du lecteur. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: `0 ${INSET}px`,
            gap: 18,
          }}
        >
          <span style={{ fontFamily: "Geist Mono", fontSize: 22, color: COLORS.muted }}>{label}</span>
          <span style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2.8, lineHeight: 1.05 }}>{title}</span>
          <span style={{ fontSize: 28, color: COLORS.muted, lineHeight: 1.35, maxWidth: 880 }}>
            {description}
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}>
            <div style={{ display: "flex", gap: 4, height: 6 }}>
              {segments.map((segment, index) => (
                <div
                  key={index}
                  style={{
                    flex: segment.value,
                    display: "flex",
                    background: COLORS.track,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${segment.filled * 100}%`,
                      background: COLORS.foreground,
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M6 3.5v17l14-8.5z" fill={COLORS.foreground} />
              </svg>
              <span style={{ fontFamily: "Geist Mono", fontSize: 20, color: COLORS.foreground }}>
                3:05 / 9:56
              </span>
            </div>
          </div>
        </div>

        {/* Pied : la commande d'installation. */}
        <div
          style={{
            height: 96,
            display: "flex",
            alignItems: "center",
            padding: `0 ${INSET}px`,
            fontFamily: "Geist Mono",
            fontSize: 22,
            color: COLORS.muted,
          }}
        >
          <span style={{ marginRight: 14 }}>$</span>
          <span style={{ color: COLORS.foreground }}>{INSTALL_COMMAND}</span>
        </div>
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
