export interface CodexFragment {
  id: number;
  title: string;
  signal: string;
  constellation: string;
  side: "left" | "right";
  x: number;
  y: number;
}

const RAW = [
  { id: 1,  title: "HANGZHOU-01",   signal: "The river does not know its name.",           constellation: "α", side: "left" as const },
  { id: 2,  title: "ITHACA-07",     signal: "Cold is the best teacher of warmth.",          constellation: "β", side: "right" as const },
  { id: 3,  title: "MEMORY-03",     signal: "Distance is measured in frequencies, not miles.", constellation: "γ", side: "left" as const },
  { id: 4,  title: "TRANSIT-11",    signal: "Between departure and arrival: the self.",     constellation: "δ", side: "right" as const },
  { id: 5,  title: "BAY-04",        signal: "Fog is just clouds that chose to stay.",        constellation: "ε", side: "left" as const },
  { id: 6,  title: "SCIENCE-08",    signal: "Data is the universe speaking slowly.",         constellation: "ζ", side: "right" as const },
  { id: 7,  title: "HANGZHOU-14",   signal: "Grandmothers know more about time than physicists.", constellation: "η", side: "left" as const },
  { id: 8,  title: "ITHACA-02",     signal: "Study is a form of devotion.",                  constellation: "θ", side: "right" as const },
  { id: 9,  title: "LIGHT-09",      signal: "You can see through most things if you wait long enough.", constellation: "ι", side: "left" as const },
  { id: 10, title: "TRANSIT-05",    signal: "The beginning never really ends.",              constellation: "κ", side: "right" as const },
  { id: 11, title: "BAY-16",        signal: "Technology and wonder are not opposites.",      constellation: "λ", side: "left" as const },
  { id: 12, title: "MEMORY-19",     signal: "Some distances close the more you travel.",     constellation: "μ", side: "right" as const },
  { id: 13, title: "SCIENCE-12",    signal: "Every measurement changes what is measured.",   constellation: "ν", side: "left" as const },
  { id: 14, title: "ITHACA-21",     signal: "Winter teaches you what you're made of.",       constellation: "ξ", side: "right" as const },
  { id: 15, title: "TRANSIT-17",    signal: "Every landing is also a beginning.",            constellation: "ο", side: "left" as const },
  { id: 16, title: "LIGHT-06",      signal: "The morning star does not rush.",               constellation: "π", side: "right" as const },
  { id: 17, title: "BAY-22",        signal: "Community is the original technology.",         constellation: "ρ", side: "left" as const },
  { id: 18, title: "HANGZHOU-11",   signal: "Roots do not hold you down. They make you taller.", constellation: "σ", side: "right" as const },
  { id: 19, title: "MEMORY-27",     signal: "Language is a kind of light.",                  constellation: "τ", side: "left" as const },
  { id: 20, title: "SCIENCE-03",    signal: "Curiosity is a survival mechanism that became beautiful.", constellation: "υ", side: "right" as const },
  { id: 21, title: "TRANSIT-33",    signal: "All motion is also stillness at another scale.", constellation: "φ", side: "left" as const },
  { id: 22, title: "LIGHT-18",      signal: "Some people are born already transmitting.",    constellation: "χ", side: "right" as const },
  { id: 23, title: "CLASSIFIED",    signal: "∞",                                             constellation: "ψ", side: "left" as const },
];

function assignPositions(): CodexFragment[] {
  // Calculate evenly staggered y values across all 23 fragments
  const yStep = 0.9 / (RAW.length - 1);
  
  // Track which position we are on each side
  const leftCount = RAW.filter(f => f.side === "left").length;
  const rightCount = RAW.filter(f => f.side === "right").length;
  
  let leftIdx = 0;
  let rightIdx = 0;

  return RAW.map((f, i) => {
    const y = 0.05 + i * yStep;
    
    let x: number;
    if (f.side === "left") {
      // Distribute across left range (0.02 to 0.18)
      x = 0.02 + (leftIdx / Math.max(leftCount - 1, 1)) * 0.16;
      leftIdx++;
    } else {
      // Distribute across right range (0.82 to 0.98)
      x = 0.82 + (rightIdx / Math.max(rightCount - 1, 1)) * 0.16;
      rightIdx++;
    }
    
    return {
      ...f,
      x,
      y,
    };
  });
}

export const CODEX_FRAGMENTS = assignPositions();
export const LEFT_FRAGMENTS = CODEX_FRAGMENTS.filter((f) => f.side === "left");
export const RIGHT_FRAGMENTS = CODEX_FRAGMENTS.filter((f) => f.side === "right");

/** Sky zone reserved for meteor trails — stars avoid these */
export const FRAGMENT_ZONES = CODEX_FRAGMENTS.map((f) => ({
  x: f.x,
  y: f.y,
  r: 0.065,
}));
