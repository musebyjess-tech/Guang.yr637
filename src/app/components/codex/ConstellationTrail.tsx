import { motion } from "motion/react";

export function ConstellationTrail({
  char,
  bright,
  driftPhase,
}: {
  char: string;
  bright: boolean;
  driftPhase: number;
}) {
  const seed = char.charCodeAt(0);
  const pts = Array.from({ length: 4 }, (_, i) => ({
    x: 14 + ((seed * (i + 1) * 37) % 42),
    y: 10 + ((seed * (i + 1) * 23) % 38),
  }));

  const stroke = bright ? "rgba(255,231,163,0.75)" : "rgba(180,178,240,0.28)";
  const dotMain = bright ? "rgba(255,211,107,0.95)" : "rgba(255,211,107,0.55)";
  const dotSub = bright ? "rgba(234,234,242,0.7)" : "rgba(234,234,242,0.35)";

  return (
    <motion.div
      animate={{
        x: [0, Math.sin(driftPhase) * 3, 0],
        y: [0, Math.cos(driftPhase * 0.85) * 4, 0],
      }}
      transition={{ duration: 6 + (seed % 4), repeat: Infinity, ease: "easeInOut" }}
      style={{ filter: bright ? "drop-shadow(0 0 12px rgba(255,211,107,0.35))" : "none" }}
    >
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        {pts.map((p, i) =>
          i < pts.length - 1 ? (
            <line
              key={`l${i}`}
              x1={p.x}
              y1={p.y}
              x2={pts[i + 1].x}
              y2={pts[i + 1].y}
              stroke={stroke}
              strokeWidth={bright ? 1 : 0.6}
            />
          ) : null
        )}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === 0 ? 2.2 : 1.4}
            fill={i === 0 ? dotMain : dotSub}
          />
        ))}
        <text
          x="28"
          y="52"
          textAnchor="middle"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 9,
            fill: bright ? "rgba(255,231,163,0.7)" : "rgba(180,178,240,0.4)",
          }}
        >
          {char}
        </text>
      </svg>
    </motion.div>
  );
}
