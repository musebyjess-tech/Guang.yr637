// Shared pub/sub store — single source of truth for all locations and signals

import {
  getAnchorMood,
  getMoodColor,
  getMoodNarrative,
  resolveCoordinates,
  type MoodLabel,
} from "../lib/signalUtils";

export type SignalEntry = {
  id: string;
  lat: number;
  lng: number;
  location: string;
  date: string;
  people: string;
  memory: string;
  mood: string;
  moodColor: string;
  photo?: string;
  ts: number;
  desc?: string;
};

export type OrbitNode = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  color: string;
  mood: string;
  memory?: string;
  sub: string;
  desc?: string;
  isAnchor: boolean;
};

export type AnchorNode = {
  id: string;
  label: string;
  sub: string;
  lat: number;
  lng: number;
  color: string;
  glow: string;
  desc: string;
};

type Listener = () => void;

const STORAGE_KEY = "guang-location-store-signals-v1";

const listeners = new Set<Listener>();
let signals: SignalEntry[] = loadSignals();

function loadSignals(): SignalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SignalEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSignals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
}

function notify() {
  listeners.forEach((l) => l());
}

// Permanent anchor nodes (fixed story coordinates — not user-submitted)
export const ANCHOR_NODES: AnchorNode[] = [
  {
    id: "hangzhou",
    label: "HANGZHOU",
    sub: "Origin Signal",
    lat: 30.25,
    lng: 120.16,
    color: "#FFD36B",
    glow: "rgba(255,211,107,0.5)",
    desc: "Where the light first gathered. A childhood measured in rivers and textbooks, in the warmth of those who stayed.",
  },
  {
    id: "ithaca",
    label: "ITHACA",
    sub: "Expansion Signal",
    lat: 42.44,
    lng: -76.5,
    color: "#EAEAF2",
    glow: "rgba(234,234,242,0.3)",
    desc: "Cold light through laboratory windows. A mind expanding into the cold of winter and the warmth of discovery.",
  },
  {
    id: "sf",
    label: "SAN FRANCISCO",
    sub: "Current Signal",
    lat: 37.77,
    lng: -122.42,
    color: "#F6B7D2",
    glow: "rgba(246,183,210,0.5)",
    desc: "Pacific fog at dawn. The place where signal finally reaches the receiver, where orbits stabilize into something like home.",
  },
];

function anchorToOrbitNode(anchor: AnchorNode): OrbitNode {
  const mood = getAnchorMood(anchor.sub);
  return {
    id: anchor.id,
    label: anchor.label,
    lat: anchor.lat,
    lng: anchor.lng,
    color: anchor.color,
    mood,
    sub: anchor.sub,
    desc: anchor.desc,
    isAnchor: true,
  };
}

function signalToOrbitNode(signal: SignalEntry): OrbitNode {
  return {
    id: signal.id,
    label: signal.location.toUpperCase(),
    lat: signal.lat,
    lng: signal.lng,
    color: signal.moodColor,
    mood: signal.mood,
    memory: signal.memory,
    sub: `${signal.mood} Signal`,
    desc: signal.desc,
    isAnchor: false,
  };
}

export const LocationStore = {
  getSignals: () => signals,

  getSignalsSorted: () => [...signals].sort((a, b) => b.ts - a.ts),

  getOrbitNodes: (): OrbitNode[] => [
    ...ANCHOR_NODES.map(anchorToOrbitNode),
    ...signals.map(signalToOrbitNode),
  ],

  addSignal: (s: SignalEntry) => {
    signals = [...signals, s];
    persistSignals();
    notify();
  },

  updateDesc: (id: string, desc: string) => {
    signals = signals.map((s) => (s.id === id ? { ...s, desc } : s));
    persistSignals();
    notify();
  },

  createSignal: (input: Omit<SignalEntry, "id" | "ts" | "lat" | "lng" | "moodColor"> & { mood: MoodLabel | string }) => {
    const coords = resolveCoordinates(input.location);
    const signal: SignalEntry = {
      ...input,
      lat: coords.lat,
      lng: coords.lng,
      moodColor: getMoodColor(input.mood),
      id: crypto.randomUUID(),
      ts: Date.now(),
    };
    signals = [...signals, signal];
    persistSignals();
    notify();
    return signal;
  },

  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export { getMoodNarrative, resolveCoordinates };
