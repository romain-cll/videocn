/**
 * Génère `public/landing/contribution-grid.svg`, la mosaïque du hero de la
 * landing, façon graphe de contributions.
 *
 * Le SVG ne porte aucune couleur : il sert de masque. Chaque carreau n'a qu'une
 * opacité, et c'est l'élément masqué qui apporte la couleur, par un token. Les
 * cases vides n'existent pas : elles restent transparentes.
 *
 * Tirage déterministe (graine fixe) : relancer le script redonne le même
 * fichier. À relancer seulement pour changer la mosaïque :
 *   node scripts/generate-contribution-grid.mjs
 */

import { writeFileSync } from "node:fs";

const CELL = 12;
const GAP = 4;
const PITCH = CELL + GAP;
// Assez large pour couvrir le carrousel sans répétition (≈ 1150 × 640 px).
const COLUMNS = 72;
const ROWS = 40;

// Les niveaux d'un graphe de contributions : vide, puis quatre intensités.
const LEVELS = [
  { opacity: null, weight: 0.3 },
  { opacity: 0.25, weight: 0.25 },
  { opacity: 0.45, weight: 0.2 },
  { opacity: 0.7, weight: 0.15 },
  { opacity: 1, weight: 0.1 },
];

// mulberry32 : petit générateur à graine, pour un tirage reproductible.
function random(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const next = random(20260923);

function pickLevel() {
  let roll = next();
  for (const level of LEVELS) {
    roll -= level.weight;
    if (roll < 0) return level;
  }
  return LEVELS[0];
}

const width = COLUMNS * PITCH - GAP;
const height = ROWS * PITCH - GAP;
const rects = [];

for (let row = 0; row < ROWS; row++) {
  for (let column = 0; column < COLUMNS; column++) {
    const { opacity } = pickLevel();
    if (opacity === null) continue;
    const x = column * PITCH;
    const y = row * PITCH;
    const fill = opacity === 1 ? "" : ` fill-opacity="${opacity}"`;
    rects.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2"${fill}/>`);
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rects.join("")}</svg>\n`;

writeFileSync(new URL("../public/landing/contribution-grid.svg", import.meta.url), svg);
console.log(`${rects.length} carreaux, ${width} × ${height} px`);
