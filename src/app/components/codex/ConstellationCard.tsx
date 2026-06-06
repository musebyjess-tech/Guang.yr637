import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ConstellationFragment } from "./constellationFragments";

interface ConstellationCardProps {
  fragment: ConstellationFragment;
  position: { x: number; y: number };
  driftPhase: number;
  onClick: (fragment: ConstellationFragment) => void;
  counterRotate?: boolean;
}

function ConstellationPattern({ constellation }: { constellation: string }) {
  // Generate a small constellation dot pattern based on the Greek letter
  const patterns: Record<string, Array<[number, number]>> = {
    α: [
      [30, 20],
      [50, 25],
      [40, 45],
      [60, 50],
    ],
    β: [
      [35, 15],
      [45, 30],
      [40, 50],
      [55, 40],
    ],
    γ: [
      [25, 25],
      [45, 20],
      [50, 45],
      [35, 50],
    ],
    δ: [
      [40, 15],
      [55, 35],
      [45, 55],
      [25, 40],
    ],
    ε: [
      [30, 30],
      [50, 25],
      [60, 45],
      [35, 55],
    ],
    ζ: [
      [35, 20],
      [55, 30],
      [45, 50],
      [25, 45],
    ],
    η: [
      [50, 15],
      [40, 35],
      [60, 50],
      [30, 45],
    ],
    θ: [
      [25, 30],
      [55, 25],
      [50, 50],
      [30, 55],
    ],
    ι: [
      [45, 20],
      [35, 40],
      [55, 50],
      [25, 50],
    ],
    κ: [
      [40, 25],
      [60, 30],
      [45, 50],
      [20, 45],
    ],
    λ: [
      [30, 15],
      [50, 40],
      [60, 50],
      [35, 45],
    ],
    μ: [
      [35, 30],
      [55, 20],
      [50, 50],
      [25, 55],
    ],
  };

  const dots = patterns[constellation] || patterns.α;
  const primaryStar =
    constellation.charCodeAt(0) % dots.length;

  return (
    <svg
      width="90"
      height="70"
      viewBox="0 0 80 80"
      style={{ marginBottom: 0.1, opacity: 0.8 }}
    >
      {dots.map((dot, i) => (
  <circle
    key={i}
    cx={dot[0]}
    cy={dot[1]}
    r={i === primaryStar ? 2.2 : 1.3}
    fill={
      i === primaryStar
        ? "#FFD36B"
        : "rgba(180,178,240,0.55)"
    }
  />
))}

      {/* Connect some dots with faint lines */}
      {dots.length >= 2 && (
        <>
          <line
            x1={dots[0][0]}
            y1={dots[0][1]}
            x2={dots[1][0]}
            y2={dots[1][1]}
            stroke="rgba(180,178,240,0.2)"
            strokeWidth="0.5"
          />
          {dots.length >= 3 && (
            <line
              x1={dots[1][0]}
              y1={dots[1][1]}
              x2={dots[2][0]}
              y2={dots[2][1]}
              stroke="rgba(180,178,240,0.2)"
              strokeWidth="0.5"
            />
          )}
        </>
      )}
    </svg>
  );
}

export function ConstellationCard({
  fragment,
  position,
  driftPhase,
  onClick,
}: ConstellationCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        transform: "translate(-50%, -50%)",
        width: 100,
      }}
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 4 + driftPhase * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: driftPhase * 0.3,
      }}
    >
      <motion.button
        type="button"
        onClick={() => onClick(fragment)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full p-1 text-center transition-colors"
        style={{
          background: "rgba(219, 225, 255, 0)",
          border: `1px solid rgba(180,178,240,${hovered ? 0.25 : 0.12})`,
          borderRadius: 6,
          cursor: "pointer",
        }}
        animate={{
          borderColor: hovered
            ? "rgba(135, 162, 252, 0.35)"
            : "rgba(180, 178, 240, 0)",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ConstellationPattern constellation={fragment.constellation} />
          
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 7,
              color: "rgba(180,178,240,0.65)",
              marginBottom: 1,
            }}
          >
            {fragment.constellation}
          </p>

          <AnimatePresence>
            {hovered && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 11,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "rgba(234,234,242,0.72)",
                  lineHeight: 1.4,
                  marginTop: 6,
                }}
              >
                {fragment.signal}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </motion.div>
  );
}


