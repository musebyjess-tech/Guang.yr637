import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LocationStore, ANCHOR_NODES, type SignalEntry } from "./LocationStore";
import { MOOD_OPTIONS } from "../lib/signalUtils";
import { CosmicMessageBubble, type FragColor } from "./CosmicMessageBubble";

// ── Types ─────────────────────────────────────────────────────────────────────
type UniverseMode = "dawn" | "twilight" | "midnight";
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; r: number };
type RevealData = { message: string; isSpecial: boolean; fragColor: FragColor };

async function generateCityDesc(location: string, mood: string, memory: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[generateCityDesc] Missing VITE_ANTHROPIC_API_KEY");
      throw new Error("Missing API key");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 120,
        system: `You write poetic 2-sentence city descriptions for a cosmic travel journal.
Style reference:
- Hangzhou: "Where the light first gathered. A childhood measured in rivers and textbooks, in the warmth of those who stayed."
- Ithaca: "Cold light through laboratory windows. A mind expanding into the cold of winter and the warmth of discovery."
- San Francisco: "Pacific fog at dawn. The place where signal finally reaches the receiver, where orbits stabilize into something like home."

Rules:
- English only, exactly 2 sentences, under 40 words total
- Sentence 1: the city's atmosphere — light, weather, texture, sensation
- Sentence 2: emotional meaning or transformation
- No names, no clichés, poetic but restrained`,
        messages: [{
          role: "user",
          content: `City: ${location}\nMood: ${mood}\nMemory: ${memory}`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[generateCityDesc] API error:", response.status, err);
      throw new Error(`API ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() ?? "";
    console.log("[generateCityDesc] Got desc:", text);
    return text || `A signal from ${location}. ${memory.slice(0, 80)}`;
  } catch (e) {
    console.error("[generateCityDesc] Failed:", e);
    return `A signal from ${location}. ${memory.slice(0, 80)}`;
  }
}

// ── Message content ───────────────────────────────────────────────────────────
const REGULAR_MESSAGES = [
  "祝你保持爱的能力也无限被爱",
  "这里是20块草莓芝士蛋糕：🍰✨\n（某·c偷吃了三块）",
  "送你的礼物是加倍的幸福、勇气和金光闪闪的一切",
  "Alex只要想做就一定会做到！",
  "우린 할 수 있어요\n서로의 두 손 꼭 잡으면 되는 걸\n못할 게 없어요",
  "以后的幸福回忆只会越来越多",
  "全世界最胆小的人勇敢地迈出了第一步",
  "Embrace it.",
  "我地幾時再相見？",
  "-12h的时差最讨厌了",
  "Juno",
  "Now that I found you",
  "'Say my name and everything just stops'",
  "坚定勇敢地面对不可预知的明天吧",
  "Reach whatever is calling you.",
  "今年许了什么愿望！",
  "逛邊市區所有路燈",
  "独属于你的生命意义",
  "你的自信，天赋，使命，和你的勇敢",
  "相信自己 坚定地向前吧！",
  "幸福健康的约定",
  "好好休息哟 \nEverything is alright in dream tunes",
];
const SPECIAL_MESSAGE = "23岁 光年抵达☆.。.:・\nAlex生日快乐！\nTHIS IS YOUR TIME.";

// Fragment positions: (angle°, dist as multiple of globe radius)
const FRAG_LAYOUT = [
  { angle: 8,   dist: 1.28 }, { angle: 42,  dist: 1.52 }, { angle: 71,  dist: 1.22 },
  { angle: 103, dist: 1.68 }, { angle: 128, dist: 1.35 }, { angle: 155, dist: 1.82 },
  { angle: 178, dist: 1.24 }, { angle: 205, dist: 1.58 }, { angle: 233, dist: 1.18 },
  { angle: 258, dist: 1.45 }, { angle: 282, dist: 1.75 }, { angle: 310, dist: 1.32 },
  { angle: 335, dist: 1.62 }, { angle: 22,  dist: 1.88 }, { angle: 58,  dist: 1.42 },
  { angle: 88,  dist: 1.78 }, { angle: 118, dist: 1.55 }, { angle: 145, dist: 1.92 },
  { angle: 192, dist: 1.38 }, { angle: 225, dist: 1.72 }, { angle: 268, dist: 1.88 },
  { angle: 298, dist: 1.48 }, { angle: 318, dist: 1.95 }, // index 22 = special
];

const FRAG_PALETTE: FragColor[] = [
  { color: "#FFD36B", name: "gold" },
  { color: "#F6B7D2", name: "pink" },
  { color: "#9B8FFF", name: "violet" },
];

const GLOBE_SCALE = 0.30;
const BURST_COLORS = ["#F6B7D2", "#FFD36B", "#9B8FFF", "#ffffff"];
const DISCOVERY_STORAGE_KEY = "guang-roaming-universe-discovered-v1";

const MODE_ATMOSPHERE: Record<UniverseMode, { r: number; g: number; b: number; er: number; eg: number; eb: number }> = {
  dawn:     { r: 255, g: 195, b: 120, er: 255, eg: 230, eb: 180 },
  twilight: { r: 255, g: 150, b: 175, er: 255, eg: 200, eb: 230 },
  midnight: { r: 88,  g: 72,  b: 200, er: 168, eg: 162, eb: 255 },
};

/** Full-page CSS sky — must match canvas base fills */
const CONTAINER_BG: Record<UniverseMode, string> = {
  dawn: "linear-gradient(180deg, #FFF8E8 0%, #FFE8C4 12%, #FFD8A8 28%, #FFC8D8 48%, #E8D0F8 68%, #D8C8F0 100%)",
  twilight: "linear-gradient(180deg, #4A2878 0%, #6E3888 18%, #A04888 38%, #D06878 58%, #E88868 78%, #F0B070 100%)",
  midnight: "linear-gradient(180deg, #0C1038 0%, #08061E 45%, #030208 100%)",
};

const UI_THEME: Record<UniverseMode, {
  muted: string; text: string; accent: string; dot: string; hint: string; border: string; btn: string; btnHover: string;
}> = {
  dawn: {
    muted: "rgba(72,48,32,0.5)",
    text: "rgba(48,32,22,0.82)",
    accent: "rgba(180,100,40,0.9)",
    dot: "#E8A040",
    hint: "rgba(72,48,32,0.38)",
    border: "rgba(72,48,32,0.22)",
    btn: "rgba(48,32,22,0.45)",
    btnHover: "rgba(48,32,22,0.72)",
  },
  twilight: {
    muted: "rgba(255,220,240,0.55)",
    text: "rgba(255,240,248,0.9)",
    accent: "rgba(255,211,107,0.92)",
    dot: "#F6B7D2",
    hint: "rgba(255,220,240,0.4)",
    border: "rgba(255,220,240,0.28)",
    btn: "rgba(255,235,245,0.55)",
    btnHover: "rgba(255,245,252,0.88)",
  },
  midnight: {
    muted: "rgba(180,178,240,0.52)",
    text: "rgba(234,234,242,0.72)",
    accent: "rgba(255,211,107,0.88)",
    dot: "#9B8FFF",
    hint: "rgba(180,178,240,0.16)",
    border: "rgba(234,234,242,0.09)",
    btn: "rgba(234,234,242,0.28)",
    btnHover: "rgba(234,234,242,0.52)",
  },
};

const GLOBE_THEME: Record<UniverseMode, {
  showHaloStars: boolean;
  globeStops: [string, string, string];
  landRgb: [number, number, number];
  specular: string;
  rings: [{ color: string }, { color: string }];
  glowStrength: number;
}> = {
  dawn: {
    showHaloStars: false,
    globeStops: ["rgba(255,248,235,0.55)", "rgba(255,220,190,0.62)", "rgba(220,180,210,0.7)"],
    landRgb: [180, 140, 120],
    specular: "rgba(255,255,250,0.35)",
    rings: [{ color: "#FFD36B" }, { color: "#F6B7D2" }],
    glowStrength: 0.04,
  },
  twilight: {
    showHaloStars: false,
    globeStops: ["rgba(80,45,90,0.5)", "rgba(60,35,75,0.58)", "rgba(45,28,65,0.65)"],
    landRgb: [200, 140, 160],
    specular: "rgba(255,200,220,0.18)",
    rings: [{ color: "#E888A8" }, { color: "#C878D8" }],
    glowStrength: 0.055,
  },
  midnight: {
    showHaloStars: true,
    globeStops: ["rgba(20,13,50,0.84)", "rgba(10,9,30,0.92)", "rgba(6,5,20,0.97)"],
    landRgb: [135, 195, 175],
    specular: "rgba(220,218,255,0.12)",
    rings: [{ color: "#6E6AF0" }, { color: "#F6B7D2" }],
    glowStrength: 0.085,
  },
};

function pickUniverseMode(): UniverseMode {
  const modes: UniverseMode[] = ["dawn", "twilight", "midnight"];
  return modes[Math.floor(Math.random() * modes.length)];
}

type PersistedDiscovery = { indices: number[]; reveals: Record<string, RevealData> };

function loadPersistedDiscoveries(): { discovered: Set<number>; data: Map<number, RevealData> } {
  try {
    const raw = localStorage.getItem(DISCOVERY_STORAGE_KEY);
    if (!raw) return { discovered: new Set(), data: new Map() };
    const parsed = JSON.parse(raw) as PersistedDiscovery;
    const discovered = new Set(parsed.indices ?? []);
    const data = new Map<number, RevealData>();
    for (const [k, v] of Object.entries(parsed.reveals ?? {})) data.set(Number(k), v);
    return { discovered, data };
  } catch {
    return { discovered: new Set(), data: new Map() };
  }
}

function savePersistedDiscoveries(discovered: Set<number>, data: Map<number, RevealData>) {
  const payload: PersistedDiscovery = {
    indices: [...discovered],
    reveals: Object.fromEntries([...data.entries()].map(([k, v]) => [String(k), v])),
  };
  localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(payload));
}

// ── Pure helpers (function declarations → hoisted) ────────────────────────────
function ll2xyz(lat: number, lng: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [-Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
}

function rotXY(x: number, y: number, z: number, rX: number, rY: number): [number, number, number] {
  const cy = Math.cos(rY), sy = Math.sin(rY);
  const nx = x * cy + z * sy, nz = -x * sy + z * cy;
  const cx2 = Math.cos(rX), sx = Math.sin(rX);
  return [nx, y * cx2 - nz * sx, y * sx + nz * cx2];
}

function projLL(lat: number, lng: number, rX: number, rY: number, cx: number, cy: number, R: number) {
  const [x, y, z] = ll2xyz(lat, lng);
  const [rx, ry, rz] = rotXY(x, y, z, rX, rY);
  return { sx: cx + rx * R, sy: cy - ry * R, z: rz };
}

function fragScreenPos(idx: number, cx: number, cy: number, R: number) {
  const { angle, dist } = FRAG_LAYOUT[idx];
  const a = (angle * Math.PI) / 180;
  return { x: cx + Math.cos(a) * R * dist, y: cy + Math.sin(a) * R * dist };
}

function hex2rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha.toFixed(2)})`;
}

function getFragColor(i: number): FragColor {
  if (i === 22) return FRAG_PALETTE[0]; // special = gold
  return FRAG_PALETTE[i % 3];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build ring vertices: great circle with given normal vector
function buildRingVerts(normal: [number, number, number], steps = 72): [number, number, number][] {
  const [nx, ny, nz] = normal;
  const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
  const [unx, uny, unz] = [nx/len, ny/len, nz/len];
  const t2: [number,number,number] = Math.abs(unx) < 0.8 ? [1,0,0] : [0,1,0];
  const dot = t2[0]*unx + t2[1]*uny + t2[2]*unz;
  const ax = t2[0]-dot*unx, ay = t2[1]-dot*uny, az = t2[2]-dot*unz;
  const al = Math.sqrt(ax*ax+ay*ay+az*az);
  const [uax, uay, uaz] = [ax/al, ay/al, az/al];
  const bx = uny*uaz-unz*uay, by = unz*uax-unx*uaz, bz = unx*uay-uny*uax;
  return Array.from({length: steps}, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return [Math.cos(a)*uax+Math.sin(a)*bx, Math.cos(a)*uay+Math.sin(a)*by, Math.cos(a)*uaz+Math.sin(a)*bz];
  });
}

// ── Precomputed module-level data ─────────────────────────────────────────────
const LAND_DOTS: [number, number, number][] = (() => {
  function isLand(lat: number, lng: number): boolean {
    if (lat < -65) return true; // Antarctica
    if (lat > 63 && lat < 67 && lng > -25 && lng < -13) return true; // Iceland
    if (lat > 60 && lat < 84 && lng > -58 && lng < -16) return true; // Greenland
    // North America
    if (lat > 6 && lat < 72 && lng > -170 && lng < -50) {
      if (lat > 56 && lng < -130) return lat < 70;
      if (lat > 48 && lng > -140 && lng < -52) return lat < 65 || (lng > -105 && lat < 70);
      if (lat > 25 && lat < 50 && lng > -124 && lng < -65) return true;
      if (lat > 14 && lat < 33 && lng > -118 && lng < -86) return true;
      if (lat > 6  && lat < 20 && lng > -92  && lng < -76) return true;
      return false;
    }
    // South America
    if (lat > -56 && lat < 13 && lng > -82 && lng < -32) {
      if (lat > 5)   return lng > -80 && lng < -58;
      if (lat > -5)  return lng > -82 && lng < -48;
      if (lat > -20) return lng > -82 && lng < -36;
      if (lat > -35) return lng > -75 && lng < -38;
      if (lat > -45) return lng > -76 && lng < -56;
      return lng > -76 && lng < -66;
    }
    // Europe
    if (lat > 36 && lat < 72 && lng > -10 && lng < 32) {
      if (lat > 63) return lng > 10 && lng < 30;
      if (lat > 55) return (lng > -6 && lng < 2) || (lng > 4 && lng < 30);
      if (lat > 48) return lng > -5 && lng < 24;
      if (lat > 43) return (lng > -5 && lng < 8) || (lng > 12 && lng < 32);
      if (lat > 36) return (lng > -6 && lng < 2) || (lng > 12 && lng < 28);
      return false;
    }
    if (lat > 50 && lat < 60 && lng > -8 && lng < 2) return true; // British Isles
    if (lat > 36 && lat < 44 && lng > 26 && lng < 46) return true; // Turkey/Caucasus
    // Russia / Siberia
    if (lat > 48 && lat < 78 && lng > 28 && lng < 186) {
      if (lat > 70) return lng < 155;
      if (lat > 62) return lng < 175;
      if (lat > 55) return true;
      return lng < 138;
    }
    if (lat > 50 && lat < 62 && lng > 155 && lng < 165) return true; // Kamchatka
    // Middle East
    if (lat > 12 && lat < 42 && lng > 26 && lng < 66) {
      if (lat > 35 && lng < 44) return true;
      if (lat > 28 && lat < 42 && lng > 34 && lng < 62) return true;
      if (lat > 12 && lat < 30 && lng > 42 && lng < 60) return true;
      if (lat > 22 && lat < 30 && lng > 32 && lng < 42) return true;
      return false;
    }
    // South/Central Asia
    if (lat > 6 && lat < 40 && lng > 60 && lng < 100) {
      if (lat > 30) return lng > 62 && lng < 95;
      if (lat > 20) return lng > 66 && lng < 98;
      if (lat > 10) return lng > 76 && lng < 92;
      return lng > 80 && lng < 82;
    }
    // Africa
    if (lat > -35 && lat < 38 && lng > -18 && lng < 52) {
      if (lat > 24) return lng > -4 && lng < 40;
      if (lat > 10) return lng > -18 && lng < 50;
      if (lat > 0)  return lng > -8 && lng < 46;
      if (lat > -12) return lng > -5 && lng < 45;
      if (lat > -22) return lng > 10 && lng < 42;
      if (lat > -32) return lng > 16 && lng < 38;
      return false;
    }
    if (lat > -26 && lat < -12 && lng > 43 && lng < 51) return true; // Madagascar
    // China / Mongolia / Korea
    if (lat > 20 && lat < 54 && lng > 72 && lng < 135) {
      if (lat > 48) return lng > 84 && lng < 122;
      if (lat > 38) return lng > 72 && lng < 128;
      if (lat > 28) return lng > 98 && lng < 125;
      if (lat > 20) return lng > 106 && lng < 122;
      return false;
    }
    if (lat > 30 && lat < 46 && lng > 129 && lng < 146) return true; // Japan
    if (lat > 34 && lat < 42 && lng > 124 && lng < 132) return true; // Korea
    // Southeast Asia
    if (lat > -8 && lat < 24 && lng > 92 && lng < 142) {
      if (lat > 16) return lng > 92 && lng < 108;
      if (lat > 8)  return lng > 98 && lng < 110;
      if (lat > 0)  return (lng > 100 && lng < 110) || (lng > 116 && lng < 124);
      if (lat > -5) return (lng > 104 && lng < 116) || (lng > 118 && lng < 128) || (lng > 132 && lng < 142);
      return (lng > 106 && lng < 116) || (lng > 120 && lng < 128) || (lng > 134 && lng < 142);
    }
    // Australia
    if (lat > -44 && lat < -10 && lng > 112 && lng < 155) {
      if (lat > -22) return lng > 128 && lng < 155;
      if (lat > -30) return lng > 114 && lng < 154;
      if (lat > -38) return lng > 115 && lng < 152;
      return lng > 130 && lng < 150;
    }
    if (lat > -47 && lat < -34 && lng > 166 && lng < 178) return true; // New Zealand
    return false;
  }

  const pts: [number, number, number][] = [];
  for (let lat = -78; lat <= 78; lat += 5.5) {
    for (let lng = -180; lng < 180; lng += 6) {
      if (isLand(lat, lng)) pts.push(ll2xyz(lat, lng));
    }
  }
  return pts;
})();

const BG_STARS = Array.from({ length: 200 }, () => ({
  r: 1.12 + Math.random() * 1.25,
  angle: Math.random() * Math.PI * 2,
  size: 0.3 + Math.random() * 1.4,
  alpha: 0.06 + Math.random() * 0.3,
  twinkleSpeed: 0.0006 + Math.random() * 0.001,
}));

const SKY_STARS = Array.from({ length: 320 }, () => ({
  x: Math.random(),
  y: Math.random(),
  size: 0.25 + Math.random() * 1.6,
  alpha: 0.08 + Math.random() * 0.55,
  twinkle: 0.0004 + Math.random() * 0.0012,
  phase: Math.random() * Math.PI * 2,
}));

const DAWN_CLOUD_BANKS = [
  { x: 0.5, y: 0.52, rx: 0.52, ry: 0.2, rgb: [255, 255, 255] as const, a: 0.78, drift: 0.00014 },
  { x: 0.22, y: 0.46, rx: 0.36, ry: 0.16, rgb: [255, 248, 252] as const, a: 0.7, drift: 0.00018 },
  { x: 0.78, y: 0.44, rx: 0.34, ry: 0.15, rgb: [255, 235, 248] as const, a: 0.68, drift: 0.00016 },
  { x: 0.38, y: 0.62, rx: 0.42, ry: 0.18, rgb: [248, 220, 255] as const, a: 0.62, drift: 0.00012 },
  { x: 0.65, y: 0.58, rx: 0.38, ry: 0.17, rgb: [255, 228, 210] as const, a: 0.65, drift: 0.0002 },
  { x: 0.12, y: 0.55, rx: 0.28, ry: 0.12, rgb: [255, 245, 235] as const, a: 0.55, drift: 0.00015 },
];

const TWILIGHT_CLOUDS = [
  { x: 0.35, y: 0.62, rx: 0.45, ry: 0.14, rgb: [255, 160, 190] as const, a: 0.35, drift: 0.0001 },
  { x: 0.7, y: 0.55, rx: 0.4, ry: 0.12, rgb: [200, 140, 220] as const, a: 0.28, drift: 0.00012 },
  { x: 0.5, y: 0.7, rx: 0.55, ry: 0.16, rgb: [255, 120, 150] as const, a: 0.32, drift: 0.00008 },
];

const TWILIGHT_NEBULAE = [
  { bx: 0.25, by: 0.28, r: 0.5, rgb: [180, 100, 180] as const, drift: 0.0001 },
  { bx: 0.75, by: 0.32, r: 0.45, rgb: [140, 80, 160] as const, drift: 0.00011 },
];

const DAWN_FLOATERS = Array.from({ length: 36 }, (_, i) => ({
  x: Math.random(),
  y: Math.random(),
  r: 0.5 + Math.random() * 1.8,
  speed: 0.00006 + Math.random() * 0.0001,
  phase: i * 0.7,
}));

const ORBITAL_RING_GEOM = [
  { verts: buildRingVerts([0.35, 0.7, 0.62]), speed: 0.22, scale: 1.08 },
  { verts: buildRingVerts([-0.6, 0.55, 0.58]), speed: -0.15, scale: 1.14 },
];

// ── Particles ─────────────────────────────────────────────────────────────────
function softGlitter(x: number, y: number, color: string): Particle[] {
  return Array.from({ length: 16 }, () => {
    const a = Math.random() * Math.PI * 2;
    const s = 0.6 + Math.random() * 2.2;
    const colors = [color, "#ffffff", color];
    return { x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 1, maxLife: 60+Math.random()*35, color: colors[Math.floor(Math.random()*3)], r: 0.7+Math.random()*1.6 };
  });
}

function hardBurst(x: number, y: number, colors: string[], n: number): Particle[] {
  return Array.from({ length: n }, () => {
    const a = Math.random() * Math.PI * 2;
    const s = 1.8 + Math.random() * 5.5;
    return { x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 1, maxLife: 48+Math.random()*42, color: colors[Math.floor(Math.random()*colors.length)], r: 1+Math.random()*2.5 };
  });
}

function drawSkyStars(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  density: number,
  tint: string,
  yMax = 1,
) {
  const count = Math.floor(SKY_STARS.length * density);
  for (let i = 0; i < count; i++) {
    const s = SKY_STARS[i];
    if (s.y > yMax) continue;
    const tw = s.alpha * (0.6 + 0.4 * Math.sin(t * s.twinkle + s.phase));
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
    ctx.fillStyle = tint.replace("{{a}}", tw.toFixed(3));
    ctx.fill();
  }
}

function drawSoftCloud(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rgb: readonly [number, number, number],
  alpha: number,
  t: number,
  drift: number,
) {
  const ox = Math.sin(t * drift) * rx * W * 0.06;
  const oy = Math.cos(t * drift * 0.9) * ry * H * 0.04;
  const x = cx * W + ox;
  const y = cy * H + oy;
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx * W);
  const [r, gb, b] = rgb;
  g.addColorStop(0, `rgba(${r},${gb},${b},${alpha})`);
  g.addColorStop(0.45, `rgba(${r},${gb},${b},${alpha * 0.45})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx * W, ry * H, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawUniverseBackdrop(ctx: CanvasRenderingContext2D, W: number, H: number, mode: UniverseMode, t: number) {
  const minDim = Math.min(W, H);

  if (mode === "dawn") {
    // Full bright golden-hour sky — NOT night
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#FFF8E8");
    sky.addColorStop(0.12, "#FFE8C4");
    sky.addColorStop(0.28, "#FFD8A8");
    sky.addColorStop(0.48, "#FFC8D8");
    sky.addColorStop(0.68, "#E8D0F8");
    sky.addColorStop(1, "#D8C8F0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    const sunX = W * 0.68 + Math.sin(t * 0.00008) * W * 0.02;
    const sunY = H * 0.1;
    const sunCore = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, minDim * 0.22);
    sunCore.addColorStop(0, "rgba(255, 252, 220, 1)");
    sunCore.addColorStop(0.25, "rgba(255, 230, 160, 0.85)");
    sunCore.addColorStop(0.55, "rgba(255, 200, 120, 0.35)");
    sunCore.addColorStop(1, "rgba(255, 200, 120, 0)");
    ctx.fillStyle = sunCore;
    ctx.fillRect(0, 0, W, H);

    const sunBloom = ctx.createRadialGradient(sunX, sunY, minDim * 0.05, sunX, sunY, minDim * 0.72);
    sunBloom.addColorStop(0, "rgba(255, 220, 150, 0.55)");
    sunBloom.addColorStop(0.4, "rgba(255, 195, 130, 0.22)");
    sunBloom.addColorStop(1, "rgba(255, 195, 130, 0)");
    ctx.fillStyle = sunBloom;
    ctx.fillRect(0, 0, W, H);

    const lavenderHaze = ctx.createRadialGradient(W * 0.5, H * 0.85, 0, W * 0.5, H * 0.5, minDim * 0.9);
    lavenderHaze.addColorStop(0, "rgba(220, 200, 255, 0.35)");
    lavenderHaze.addColorStop(1, "rgba(220, 200, 255, 0)");
    ctx.fillStyle = lavenderHaze;
    ctx.fillRect(0, 0, W, H);

    for (const c of DAWN_CLOUD_BANKS) {
      drawSoftCloud(ctx, W, H, c.x, c.y, c.rx, c.ry, c.rgb, c.a, t, c.drift);
    }

    for (const p of DAWN_FLOATERS) {
      const fy = ((p.y - (t * p.speed) % 1) + 1) % 1;
      const fx = p.x + Math.sin(t * 0.0005 + p.phase) * 0.015;
      const al = 0.25 + 0.2 * Math.sin(t * 0.001 + p.phase);
      ctx.beginPath();
      ctx.arc(fx * W, fy * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 240, 200, ${al})`;
      ctx.fill();
    }
    return;
  }

  if (mode === "twilight") {
    // Romantic sunset sky — pink, purple, indigo, rose-gold
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#4A2878");
    sky.addColorStop(0.18, "#6E3888");
    sky.addColorStop(0.38, "#A04888");
    sky.addColorStop(0.58, "#D06878");
    sky.addColorStop(0.78, "#E88868");
    sky.addColorStop(1, "#F0B070");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    const horizon = ctx.createRadialGradient(W * 0.5, H * 1.05, 0, W * 0.5, H * 0.55, minDim * 0.85);
    horizon.addColorStop(0, "rgba(255, 180, 120, 0.55)");
    horizon.addColorStop(0.45, "rgba(255, 140, 150, 0.28)");
    horizon.addColorStop(1, "rgba(255, 140, 150, 0)");
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 0, W, H);

    for (const n of TWILIGHT_NEBULAE) {
      const ox = Math.sin(t * n.drift + n.bx * 10) * W * 0.04;
      const nx = n.bx * W + ox;
      const ny = n.by * H;
      const rad = n.r * minDim;
      const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, rad);
      const [r, gb, b] = n.rgb;
      g.addColorStop(0, `rgba(${r},${gb},${b},0.35)`);
      g.addColorStop(0.6, `rgba(${r},${gb},${b},0.08)`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    for (const c of TWILIGHT_CLOUDS) {
      drawSoftCloud(ctx, W, H, c.x, c.y, c.rx, c.ry, c.rgb, c.a, t, c.drift);
    }

    drawSkyStars(ctx, W, H, t, 0.22, "rgba(255, 240, 255, {{a}})", 0.42);
    return;
  }

  // Midnight — deep space only
  ctx.fillStyle = "#030208";
  ctx.fillRect(0, 0, W, H);

  const depth = ctx.createLinearGradient(0, 0, 0, H);
  depth.addColorStop(0, "#0C1038");
  depth.addColorStop(0.45, "#08061E");
  depth.addColorStop(1, "#030208");
  ctx.fillStyle = depth;
  ctx.fillRect(0, 0, W, H);

  const galCore = ctx.createRadialGradient(W * 0.55, H * 0.42, 0, W * 0.55, H * 0.42, minDim * 0.75);
  galCore.addColorStop(0, "rgba(90, 60, 180, 0.18)");
  galCore.addColorStop(0.5, "rgba(60, 40, 140, 0.08)");
  galCore.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = galCore;
  ctx.fillRect(0, 0, W, H);

  const milky = ctx.createLinearGradient(W * 0.05, H * 0.15, W * 0.95, H * 0.8);
  milky.addColorStop(0, "rgba(0,0,0,0)");
  milky.addColorStop(0.3, "rgba(140, 110, 220, 0.14)");
  milky.addColorStop(0.5, "rgba(200, 180, 255, 0.22)");
  milky.addColorStop(0.7, "rgba(120, 90, 200, 0.12)");
  milky.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.translate(W * 0.5, H * 0.5);
  ctx.rotate(-0.32);
  ctx.translate(-W * 0.5, -H * 0.5);
  ctx.fillStyle = milky;
  ctx.fillRect(-W * 0.25, -H * 0.25, W * 1.5, H * 1.5);
  ctx.restore();

  drawSkyStars(ctx, W, H, t, 1, "rgba(230, 235, 255, {{a}})");

  const vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, minDim * 0.2, W * 0.5, H * 0.5, minDim * 0.95);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

// ── Main canvas draw ──────────────────────────────────────────────────────────
function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  cx: number, cy: number, R: number,
  rX: number, rY: number,
  signals: SignalEntry[],
  particles: Particle[],
  discovered: Set<number>,
  hovered: number | null,
  universeMode: UniverseMode,
  t: number,
) {
  ctx.clearRect(0, 0, W, H);
  drawUniverseBackdrop(ctx, W, H, universeMode, t);
  const atm = MODE_ATMOSPHERE[universeMode];
  const { r: ar, g: ag, b: ab, er, eg, eb } = atm;
  const theme = GLOBE_THEME[universeMode];
  const [lr, lg, lb] = theme.landRgb;

  // 1. Halo stars around globe (midnight only)
  if (theme.showHaloStars) {
    for (const s of BG_STARS) {
      const sx = cx + Math.cos(s.angle) * s.r * R;
      const sy = cy + Math.sin(s.angle) * s.r * R;
      const tw = s.alpha * (0.65 + 0.35 * Math.sin(t * s.twinkleSpeed + s.angle * 7));
      ctx.beginPath(); ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,218,255,${tw})`; ctx.fill();
    }
  }

  // 2. Atmosphere glow around globe
  const gs = theme.glowStrength;
  for (const [mult, al] of [[1.48, gs * 0.24], [1.24, gs * 0.55], [1.08, gs]] as [number, number][]) {
    const g = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * mult);
    g.addColorStop(0, `rgba(${ar},${ag},${ab},0)`);
    g.addColorStop(1, `rgba(${ar},${ag},${ab},${al})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * mult, 0, Math.PI * 2); ctx.fill();
  }

  // 3. Globe base sphere
  const base = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.24, R * 0.04, cx, cy, R);
  base.addColorStop(0, theme.globeStops[0]);
  base.addColorStop(0.55, theme.globeStops[1]);
  base.addColorStop(1, theme.globeStops[2]);
  ctx.fillStyle = base; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

  // 4. Globe contents (clipped)
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

  // Land dots (continent tint)
  for (const [lx, ly, lz] of LAND_DOTS) {
    const [rx, ry, rz] = rotXY(lx, ly, lz, rX, rY);
    if (rz < 0.02) continue;
    const al = Math.min(0.22, rz * 0.25);
    ctx.beginPath(); ctx.arc(cx + rx*R, cy - ry*R, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${lr},${lg},${lb},${al})`; ctx.fill();
  }

  // Grid lines
  const drawGridLine = (pts: {sx:number;sy:number;z:number}[], isEq = false) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const avgZ = (pts[i].z + pts[i+1].z) / 2;
      if (avgZ < -0.08) continue;
      const al = isEq
        ? Math.max(0.1, Math.min(0.52, (avgZ+1)/2 * 0.56))
        : Math.max(0.02, Math.min(0.2, (avgZ+1)/2 * 0.22));
      ctx.beginPath(); ctx.moveTo(pts[i].sx, pts[i].sy); ctx.lineTo(pts[i+1].sx, pts[i+1].sy);
      ctx.strokeStyle = isEq ? `rgba(${er},${eg},${eb},${al})` : `rgba(${ar},${ag},${ab},${al})`;
      ctx.lineWidth = isEq ? 0.85 : 0.4; ctx.stroke();
    }
  };

  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    for (let lng = -180; lng <= 182; lng += 2.5) pts.push(projLL(lat, lng, rX, rY, cx, cy, R));
    drawGridLine(pts, lat === 0);
  }
  for (let lng = -180; lng < 180; lng += 30) {
    const pts = [];
    for (let lat = -88; lat <= 88; lat += 2.5) pts.push(projLL(lat, lng, rX, rY, cx, cy, R));
    drawGridLine(pts);
  }

  ctx.restore();

  // 5. Orbital rings (outside clip)
  const satT = t * 0.001;
  const ringColors = theme.rings;
  for (let ri = 0; ri < ORBITAL_RING_GEOM.length; ri++) {
    const ring = ORBITAL_RING_GEOM[ri];
    const ringColor = ringColors[ri].color;
    const rScale = R * ring.scale;
    const verts = ring.verts;
    for (let i = 0; i < verts.length; i++) {
      const [vx, vy, vz] = verts[i];
      const ni = (i + 1) % verts.length;
      const [rvx, rvy, rvz] = rotXY(vx, vy, vz, rX, rY);
      const [rnx, rny, rnz] = rotXY(verts[ni][0], verts[ni][1], verts[ni][2], rX, rY);
      const avgZ = (rvz + rnz) / 2;
      if (avgZ < -0.05) continue;
      ctx.beginPath();
      ctx.moveTo(cx + rvx*rScale, cy - rvy*rScale);
      ctx.lineTo(cx + rnx*rScale, cy - rny*rScale);
      ctx.strokeStyle = hex2rgba(ringColor, Math.max(0.03, avgZ * 0.22));
      ctx.lineWidth = 0.6; ctx.stroke();
    }
    // Satellite
    const si = Math.floor(((satT * ring.speed % (Math.PI*2)) / (Math.PI*2) * verts.length + verts.length * 100)) % verts.length;
    const [svx, svy, svz] = verts[si];
    const [srx, sry, srz] = rotXY(svx, svy, svz, rX, rY);
    if (srz > 0.05) {
      const sx2 = cx + srx*rScale, sy2 = cy - sry*rScale;
      ctx.beginPath(); ctx.arc(sx2, sy2, 2.5, 0, Math.PI*2);
      ctx.fillStyle = ringColor;
      ctx.shadowColor = ringColor; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
    }
  }

  // 6. Edge glow
  const edge = ctx.createRadialGradient(cx, cy, R*0.87, cx, cy, R*1.01);
  edge.addColorStop(0, `rgba(${er},${eg},${eb},0)`);
  edge.addColorStop(1, `rgba(${er},${eg},${eb},0.24)`);
  ctx.fillStyle = edge; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fill();

  // Specular
  const spec = ctx.createRadialGradient(cx - R*0.42, cy - R*0.4, 0, cx - R*0.3, cy - R*0.28, R*0.5);
  spec.addColorStop(0, theme.specular); spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fill();

  // 7. Anchor nodes
  ANCHOR_NODES.forEach(node => {
    const p = projLL(node.lat, node.lng, rX, rY, cx, cy, R);
    if (p.z < -0.06) return;
    const al = Math.min(1, Math.max(0.3, p.z + 0.4));
    ctx.beginPath(); ctx.arc(p.sx, p.sy, 12, 0, Math.PI*2);
    ctx.fillStyle = hex2rgba(node.color, al * 0.12); ctx.fill();
    ctx.beginPath(); ctx.arc(p.sx, p.sy, 4.5, 0, Math.PI*2);
    ctx.fillStyle = hex2rgba(node.color, al);
    ctx.shadowColor = node.glow; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
    if (p.z > 0.1) {
      ctx.textAlign = p.sx > cx ? "left" : "right";
      const lx = p.sx + (p.sx > cx ? 10 : -10);
      ctx.font = "400 7px 'Space Mono', monospace";
      ctx.fillStyle = hex2rgba(node.color, al * 0.8);
      ctx.fillText(node.label, lx, p.sy + 3);
      ctx.font = "400 6px 'Space Mono', monospace";
      ctx.fillStyle = hex2rgba(node.color, al * 0.42);
      ctx.fillText(node.sub, lx, p.sy + 13);
    }
  });

  // 8. User signals
  signals.forEach(sig => {
    const p = projLL(sig.lat, sig.lng, rX, rY, cx, cy, R);
    if (p.z < 0) return;
    ctx.beginPath(); ctx.arc(p.sx, p.sy, 3.5, 0, Math.PI*2);
    ctx.fillStyle = sig.moodColor;
    ctx.shadowColor = sig.moodColor; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
  });

  // 9. Fragment orbs (screen-space)
  for (let i = 0; i < 23; i++) {
    const pos = fragScreenPos(i, cx, cy, R);
    const isSpecial = i === 22;
    const isDisc = discovered.has(i);
    const isHov = hovered === i;
    const fc = getFragColor(i);
    const pulse = 0.32 + 0.34 * Math.sin(t * 0.0017 + i * 0.74);

    if (isDisc) {
      const pulseDisc = 0.5 + 0.22 * Math.sin(t * 0.0014 + i * 0.6);
      const coreRDisc = isHov ? 5.5 : 4;
      const haloDisc = coreRDisc * 3.2;
      const haloG = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, haloDisc);
      haloG.addColorStop(0, hex2rgba(fc.color, pulseDisc * 0.28));
      haloG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haloG;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, haloDisc, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, coreRDisc, 0, Math.PI * 2);
      ctx.fillStyle = hex2rgba(fc.color, isHov ? 0.72 : 0.48);
      if (isHov) { ctx.shadowColor = fc.color; ctx.shadowBlur = 14; }
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fill();
      continue;
    }

    const coreR = isHov ? 6.5 : (isSpecial ? 4.5 : 3.2);
    const haloR = coreR * (isHov ? 4.5 : 3.2);

    const halo = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, haloR);
    halo.addColorStop(0, hex2rgba(fc.color, pulse * (isSpecial ? 0.52 : 0.32)));
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(pos.x, pos.y, haloR, 0, Math.PI*2); ctx.fill();

    ctx.beginPath(); ctx.arc(pos.x, pos.y, coreR, 0, Math.PI*2);
    ctx.fillStyle = hex2rgba(fc.color, pulse * (isSpecial ? 0.95 : 0.78));
    if (isHov || isSpecial) { ctx.shadowColor = fc.color; ctx.shadowBlur = isHov ? 18 : 10; }
    ctx.fill(); ctx.shadowBlur = 0;
  }

  // 10. Particles
  for (const p of particles) {
    if (p.life <= 0) continue;
    const alphaHex = Math.round(p.life * 200).toString(16).padStart(2, "0");
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI*2);
    ctx.fillStyle = p.color + alphaHex; ctx.fill();
  }
}

// ── Transmission Terminal button ──────────────────────────────────────────────
function TransmissionTerminal({ onClick, mode }: { onClick: () => void; mode: UniverseMode }) {
  const ui = UI_THEME[mode];
  const panelBg =
    mode === "dawn"
      ? "linear-gradient(130deg, rgba(255, 255, 255, 0.2) 0%)"
      : mode === "twilight"
        ? "linear-gradient(130deg, rgba(60,30,70,0.75) 0%, rgba(40,22,55,0.82) 100%)"
        : "linear-gradient(130deg, rgba(8,6,26,0.96) 0%, rgba(16,11,40,0.96) 100%)";

  return (
    <motion.button
      onClick={onClick}
      style={{ position: "absolute", top: 18, right: 24, zIndex: 6, background: "none", border: "none", padding: 0, cursor: "none" }}
      whileHover="hov"
    >
      <motion.div variants={{ hov: { filter: `drop-shadow(0 0 16px ${ui.dot}55)` } }} transition={{ duration: 0.3 }}>
        <div style={{
          padding: "12px 24px 12px 20px",
          background: panelBg,
          clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
          boxShadow: `inset 0 0 0 1px ${ui.border}, 0 0 20px ${ui.dot}22`,
          backdropFilter: "blur(20px)", minWidth: 188, position: "relative",
        }}>
          <div style={{ position: "absolute", top: 0, left: 18, right: 18, height: 1, background: `linear-gradient(90deg, transparent, ${ui.muted}, transparent)` }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: "0.26em", color: ui.muted }}>
              TRANSMISSION TERMINAL
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <motion.div
                animate={{ opacity: [1, 0.18, 1] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 4, height: 4, borderRadius: "50%", background: ui.dot, boxShadow: `0 0 7px ${ui.dot}`, flexShrink: 0 }}
              />
              <motion.span
                variants={{ hov: { color: ui.text } }}
                style={{ fontFamily: "'Space Mono bold', monospace", fontSize: 10, letterSpacing: "0.18em", color: ui.text }}
              >
                LEAVE A SIGNAL
              </motion.span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}

// ── Signal Modal ──────────────────────────────────────────────────────────────
function SignalModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (e: Omit<SignalEntry, "id" | "ts" | "lat" | "lng" | "moodColor" | "desc">) => void }) {
  const [loc, setLoc] = useState(""), [date, setDate] = useState(""), [people, setPeople] = useState("");
  const [memory, setMemory] = useState(""), [mood, setMood] = useState<typeof MOOD_OPTIONS[number]>(MOOD_OPTIONS[0]);;
  const [photo, setPhoto] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setPhoto(ev.target?.result as string); r.readAsDataURL(f);
  };

  const inp: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.035)", border: "1px solid rgba(110,106,240,0.16)",
    borderRadius: 5, padding: "8px 12px",
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 300,
    color: "rgba(234,234,242,0.82)", outline: "none",
  };

  const lbl = (text: string) => (
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: "0.2em", color: "rgba(180,178,240,0.42)", marginBottom: 6 }}>{text}</div>
  );

  return (
    <>
      <motion.div
          initial={{ opacity: 0, scale: 0.93, x: "-50%", y: "calc(-50% + 18px)" }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
          exit={{ opacity: 0, scale: 0.93, x: "-50%", y: "calc(-50% + 18px)" }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    zIndex: 311,
    width: "min(460px, 92vw)",
    maxHeight: "88vh",
    overflowY: "auto",
    background: "rgba(7,5,22,0.98)",
    backdropFilter: "blur(36px)",
    WebkitBackdropFilter: "blur(36px)",
    border: "1px solid rgba(180,178,240,0.16)",
    borderRadius: 16,
    padding: "28px 26px 24px",
    boxShadow: "0 0 70px rgba(110,106,240,0.1), 0 28px 72px rgba(0,0,0,0.65)",
  }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: "0.25em", color: "rgba(180,178,240,0.38)", marginBottom: 7 }}>TRANSMISSION TERMINAL</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, fontStyle: "italic", color: "rgba(234,234,242,0.9)" }}>Leave a Signal</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(234,234,242,0.28)", cursor: "none", fontSize: 20, lineHeight: 1, padding: 2 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>{lbl("LOCATION *")}<input style={inp} value={loc} onChange={e => setLoc(e.target.value)} placeholder="City or place" /></div>
          <div>{lbl("DATE")}<input type="date" style={inp} value={date} onChange={e => setDate(e.target.value)} /></div>
          <div>{lbl("WITH")}<input style={inp} value={people} onChange={e => setPeople(e.target.value)} placeholder="Names" /></div>
          <div>{lbl("MEMORY *")}<textarea style={{ ...inp, height: 80, resize: "none" } as React.CSSProperties} value={memory} onChange={e => setMemory(e.target.value)} placeholder="What do you want to remember?" /></div>
          <div>
            {lbl("MOOD")}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MOOD_OPTIONS.map(m => (
                <button key={m.label} onClick={() => setMood(m)} style={{
                  background: mood.label === m.label ? m.color + "20" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${mood.label === m.label ? m.color : "rgba(234,234,242,0.09)"}`,
                  borderRadius: 5, padding: "4px 10px",
                  fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.12em",
                  color: mood.label === m.label ? m.color : "rgba(234,234,242,0.36)", cursor: "none", transition: "all 0.2s ease",
                }}>{m.label}</button>
              ))}
            </div>
          </div>
          <div>
            {lbl("PHOTO (OPTIONAL)")}
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} style={{
              background: "rgba(255,255,255,0.025)", border: "1px dashed rgba(110,106,240,0.16)",
              borderRadius: 5, padding: "8px 14px",
              fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.10em",
              color: photo ? "#7DDBA3" : "rgba(234,234,242,0.26)", cursor: "none",
            }}>{photo ? "✓ Attached" : "+ Attach photo"}</button>
          </div>
          <motion.button
            onClick={() => {
              if (!loc || !memory) return;
              onSubmit({ location: loc, date, people, memory, mood: mood.label, photo });
              onClose();
            }}
            style={{
              marginTop: 6, width: "100%", background: "rgba(180,178,240,0.07)",
              border: "1px solid rgba(180,178,240,0.2)", borderRadius: 6, padding: "11px 18px",
              fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.25em",
              color: "rgba(180,178,240,0.78)", cursor: "none",
            }}
            whileHover={{ background: "rgba(180,178,240,0.14)", color: "rgba(234,234,242,0.95)", transition: { duration: 0.25 } }}
          >
            TRANSMIT SIGNAL ♡
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function RoamingUniverse({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(window.innerWidth);
  const [H, setH] = useState(window.innerHeight);
  const rotY = useRef(0);
  const rotX = useRef(0.14);
  const autoRot = useRef(true);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const hoveredFrag = useRef<number | null>(null);
  const persisted = useMemo(() => loadPersistedDiscoveries(), []);
  const discoveredData = useRef(persisted.data);
  const fireworksFired = useRef(persisted.discovered.has(22));

  const [universeMode] = useState<UniverseMode>(pickUniverseMode);
  const [discovered, setDiscovered] = useState<Set<number>>(() => persisted.discovered);
  const [messages] = useState(() => shuffle(REGULAR_MESSAGES));
  const [revealed, setRevealed] = useState<RevealData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [signals, setSignals] = useState<SignalEntry[]>(() => LocationStore.getSignals());
  const [shootingStars, setShootingStars] = useState<{ id: number; y: number; angle: number }[]>([]);

  useEffect(() => {
    const onResize = () => { setW(window.innerWidth); setH(window.innerHeight); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
  const unsubscribe = LocationStore.subscribe(() => setSignals(LocationStore.getSignals()));
  // 返回一个清理函数，确保不返回布尔值
  return () => {
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
}, []);

  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * GLOBE_SCALE;

  const fragPositions = useMemo(
    () => FRAG_LAYOUT.map((_, i) => fragScreenPos(i, cx, cy, R)),
    [cx, cy, R]
  );

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last; last = now;
      if (autoRot.current && !dragging.current) rotY.current += 0.00030 * dt;

      if (containerRef.current) {
        containerRef.current.style.background = CONTAINER_BG[universeMode];
      }

      // Tick particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.04;
        p.vx *= 0.984; p.vy *= 0.984;
        p.life -= 1 / p.maxLife;
      });

      drawScene(ctx, W, H, cx, cy, R, rotX.current, rotY.current, signals, particlesRef.current, discovered, hoveredFrag.current, universeMode, now);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [W, H, cx, cy, R, signals, discovered, universeMode]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true; autoRot.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    let near: number | null = null;
    for (let i = 0; i < 23; i++) {
      const p = fragPositions[i];
      // Discovered frags have a smaller hit area
      const hitR = discovered.has(i) ? 22 : 20;
      if ((e.clientX - p.x) ** 2 + (e.clientY - p.y) ** 2 < hitR * hitR) { near = i; break; }
    }
    hoveredFrag.current = near;
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x, dy = e.clientY - lastMouse.current.y;
    rotY.current += dx * 0.005;
    rotX.current = Math.max(-0.55, Math.min(0.55, rotX.current - dy * 0.005));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    dragging.current = false;
    setTimeout(() => { autoRot.current = true; }, 1800);
  };

  const onCanvasClick = useCallback((e: React.MouseEvent) => {
    if (showModal) return;

    for (let i = 0; i < 23; i++) {
      const p = fragPositions[i];
      const distSq = (e.clientX - p.x) ** 2 + (e.clientY - p.y) ** 2;

      const hitR = discovered.has(i) ? 22 : 20;
      if (distSq < hitR * hitR) {
        const existing = discoveredData.current.get(i);
        if (existing) {
          setRevealed(existing);
          if (discovered.has(i)) return;
        }
      }

      if (discovered.has(i)) continue;

      // Discover new fragment
      if (distSq < 20 * 20) {
        const isSpecial = i === 22;
        const fc = getFragColor(i);
        const msg = isSpecial ? SPECIAL_MESSAGE : messages[i % messages.length];
        const data: RevealData = { message: msg, isSpecial, fragColor: fc };
        discoveredData.current.set(i, data);
        const nextDiscovered = new Set([...discovered, i]);
        setDiscovered(nextDiscovered);
        savePersistedDiscoveries(nextDiscovered, discoveredData.current);
        setRevealed(data);

        if (!isSpecial) {
          // Soft glitter only
          particlesRef.current.push(...softGlitter(p.x, p.y, fc.color));
        } else if (!fireworksFired.current) {
          fireworksFired.current = true;
          particlesRef.current.push(...hardBurst(p.x, p.y, BURST_COLORS, 55));
          for (let wave = 0; wave < 7; wave++) {
            setTimeout(() => {
              const wx = cx + (Math.random() - 0.5) * R * 2.6;
              const wy = cy + (Math.random() - 0.5) * R * 1.8;
              particlesRef.current.push(...hardBurst(wx, wy, BURST_COLORS, 40));
              setShootingStars(prev => [...prev, {
                id: Date.now() + wave,
                x: Math.random() * W * 0.35,
                y: 28 + Math.random() * H * 0.28,
                angle: -25 + Math.random() * 55,
              }]);
            }, wave * 290);
          }
        }
        return;
      }
    }
  }, [showModal, discovered, fragPositions, messages, cx, cy, R, W]);

  const handleAddSignal = useCallback(async (entry: Omit<SignalEntry, "id" | "ts" | "lat" | "lng" | "moodColor" | "desc">) => {
    const s = LocationStore.createSignal(entry);
    setShootingStars((prev) => [...prev, {
      id: Date.now() + Math.random(),
      y: Math.random() * H * 0.6 + 40,
      angle: Math.random() * 15 - 7.5,
    }]);
    particlesRef.current.push(...softGlitter(cx, cy, s.moodColor));

    const desc = await generateCityDesc(entry.location, entry.mood, entry.memory);
    LocationStore.updateDesc(s.id, desc);
  }, [cx, cy, H]);

  const total = discovered.size;
  const ui = UI_THEME[universeMode];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: CONTAINER_BG[universeMode] }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: W, height: H, cursor: "none", display: "block" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={onCanvasClick}
      />

      {/* Shooting stars */}
      <AnimatePresence>
        {shootingStars.map(s => (
          <motion.div
      key={s.id}
      initial={{ x: -300, opacity: 0.8 }}
      animate={{ x: W + 300, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "linear" }}
      onAnimationComplete={() => setShootingStars((prev) => prev.filter((p) => p.id !== s.id))}
      style={{
        position: "absolute",
        top: s.y,
        left: 0,
        width: 200,
        height: 2,
        background: "linear-gradient(90deg, rgba(255,231,163,0.9), #fff)",
        rotate: s.angle,
        pointerEvents: "none",
        zIndex: 5,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Top-left counter */}
      <div style={{ position: "absolute", top: 22, left: 26, zIndex: 6, display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          animate={{ opacity: [1, 0.22, 1] }}
          transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 4, height: 4, borderRadius: "50%", background: ui.dot, boxShadow: `0 0 8px ${ui.dot}`, flexShrink: 0 }}
        />
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.22em", color: ui.muted }}>
          SIGNALS RECOVERED
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: "0.08em", color: total === 23 ? ui.accent : ui.text }}>
          {String(total).padStart(2, "0")} / 23
        </div>
      </div>

      {/* Top-right: Transmission Terminal */}
      <TransmissionTerminal onClick={() => setShowModal(true)} mode={universeMode} />

      {/* Hint */}
      {total < 23 && !revealed && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          style={{
            position: "absolute", bottom: 62, left: "50%", transform: "translateX(-50%)",
            fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: "0.22em",
            color: ui.hint, pointerEvents: "none", whiteSpace: "nowrap", zIndex: 5,
          }}
        >
          {total === 0 ? `${23 - total} FRAGMENTS REMAINING` : "23 SIGNAL FRAGMENTS SCATTERED ACROSS THE UNIVERSE"}
        </motion.div>
      )}

      {/* Bottom-right: BACK */}
      <motion.button
        onClick={onClose}
        style={{
          position: "absolute", bottom: 24, right: 26, zIndex: 6,
          background: "none", border: `1px solid ${ui.border}`,
          borderRadius: 3, padding: "7px 18px",
          fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.28em",
          color: ui.btn, cursor: "none",
        }}
        whileHover={{ borderColor: ui.border, color: ui.btnHover, transition: { duration: 0.25 } }}
      >
        ← BACK
      </motion.button>

      {/* Central cosmic message */}
      <AnimatePresence>
        {revealed && (
          <CosmicMessageBubble
            message={revealed.message}
            isSpecial={revealed.isSpecial}
            fragColor={revealed.fragColor}
            onClose={() => setRevealed(null)}
          />
        )}
      </AnimatePresence>

      {/* Signal modal */}
      <AnimatePresence>
        {showModal && (
          <SignalModal onClose={() => setShowModal(false)} onSubmit={handleAddSignal} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
