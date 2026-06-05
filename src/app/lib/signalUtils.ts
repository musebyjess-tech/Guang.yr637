import type { SignalEntry } from "../components/LocationStore";

export const MOOD_OPTIONS = [
  { label: "Wonder",      color: "#9B8FFF" },
  { label: "Joy",         color: "#FFD36B" },
  { label: "Adventure",   color: "#FF8C61" },
  { label: "Home",        color: "#F6B7D2" },
  { label: "Growth",      color: "#7DDBA3" },
  { label: "Friendship",  color: "#61C4FF" },
  { label: "Love",        color: "#FF6B95" },
  { label: "Music",       color: "#C28AFF" },
  { label: "Serendipity", color: "#FFB347" },
] as const;

export type MoodLabel = (typeof MOOD_OPTIONS)[number]["label"];

/** Known city → coordinates (single canonical map) */
export const KNOWN_CITIES: Record<string, { lat: number; lng: number }> = {
  hangzhou:        { lat: 30.25,  lng: 120.16 },
  ithaca:          { lat: 42.44,  lng: -76.5  },
  "san francisco": { lat: 37.77,  lng: -122.42 },
  "bay area":      { lat: 37.77,  lng: -122.42 },
  sf:              { lat: 37.77,  lng: -122.42 },
  denver:          { lat: 39.7392, lng: -104.9903 },
  "new york":      { lat: 40.71,  lng: -74.01 },
  tokyo:           { lat: 35.69,  lng: 139.69 },
  london:          { lat: 51.5,   lng: -0.12  },
  paris:           { lat: 48.86,  lng: 2.35   },
  seoul:           { lat: 37.57,  lng: 126.98 },
  beijing:         { lat: 39.9,   lng: 116.4  },
  shanghai:        { lat: 31.23,  lng: 121.47 },
  "hong kong":     { lat: 22.33,  lng: 114.17 },
  taipei:          { lat: 25.04,  lng: 121.56 },
  singapore:       { lat: 1.35,   lng: 103.82 },
  sydney:          { lat: -33.87, lng: 151.21 },
  "los angeles":   { lat: 34.05,  lng: -118.24 },
  seattle:         { lat: 47.61,  lng: -122.33 },
  toronto:         { lat: 43.65,  lng: -79.38 },
};

const MOOD_NARRATIVES: Record<string, string> = {
  Wonder:      "A place where curiosity opens and the horizon feels wider than before.",
  Joy:         "A place lit from within — warmth, laughter, and light collected in one coordinate.",
  Adventure:   "A place marked by departure, discovery, and the courage to keep moving.",
  Home:        "A place that holds you steady — familiar, grounding, and quietly essential.",
  Growth:      "A place marked by becoming, movement, and change.",
  Friendship:  "A place shaped by shared presence — connection written into the map.",
  Love:        "A place where tenderness gathers and distance feels briefly impossible.",
  Music:       "A place tuned to rhythm and resonance — memory carried in melody.",
  Serendipity: "A place found by accident, kept by meaning — the universe aligning for a moment.",
};

const ANCHOR_MOOD_BY_SUB: Record<string, MoodLabel> = {
  "Origin Signal":    "Wonder",
  "Expansion Signal": "Growth",
  "Current Signal":   "Home",
};

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Unknown cities: deterministic coords biased toward the globe's front-facing band */
export function randomVisibleCoords(location: string): { lat: number; lng: number } {
  const h = hashString(location.toLowerCase().trim());
  const lat = -22 + (h % 6200) / 100;
  const lng = -35 + ((h >> 10) % 11000) / 100;
  return { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 };
}

export function resolveCoordinates(location: string): { lat: number; lng: number } {
  const key = location.toLowerCase().trim();
  for (const [name, coords] of Object.entries(KNOWN_CITIES)) {
    if (key.includes(name)) return coords;
  }
  return randomVisibleCoords(location);
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latDir} · ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

export function getMoodColor(mood: string): string {
  return MOOD_OPTIONS.find((m) => m.label === mood)?.color ?? "#9B8FFF";
}

export function getMoodNarrative(mood: string): string {
  return MOOD_NARRATIVES[mood] ?? MOOD_NARRATIVES.Wonder;
}

export function getAnchorMood(sub: string): MoodLabel {
  return ANCHOR_MOOD_BY_SUB[sub] ?? "Wonder";
}

export function generateSignalPresentation(signal: {
  location: string;
  lat: number;
  lng: number;
  mood: string;
  memory: string;
  date?: string;
  people?: string;
}) {
  return {
    label: signal.location.toUpperCase(),
    coords: formatCoordinates(signal.lat, signal.lng),
    moodLine: `${signal.mood} Signal`,
    narrative: getMoodNarrative(signal.mood),
    memory: signal.memory,
    date: signal.date,
    people: signal.people,
  };
}

export function latLngToMapXY(lat: number, lng: number): { x: number; y: number } {
  return {
    x: (lng + 180) / 360,
    y: (90 - lat) / 180,
  };
}

export function signalToMapPoint(signal: SignalEntry) {
  const { x, y } = latLngToMapXY(signal.lat, signal.lng);
  return {
    id: signal.id,
    label: signal.location.toUpperCase(),
    sub: formatCoordinates(signal.lat, signal.lng),
    x,
    y,
    color: signal.moodColor,
    desc: getMoodNarrative(signal.mood),
    memory: signal.memory,
    mood: signal.mood,
    date: signal.date,
    photo: signal.photo,
  };
}

export function formatSignalDate(signal: SignalEntry): string {
  if (signal.date) return signal.date;
  return new Date(signal.ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
