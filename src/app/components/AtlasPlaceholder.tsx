import { motion } from "motion/react";
import { FrequencyLine } from "./FrequencyLine";

export function AtlasPlaceholder() {
  return (
    <motion.div
      className="fixed inset-0 z-20 flex flex-col items-center justify-center"
      style={{ background: "rgb(2, 3, 8)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, ease: "easeIn" }}
    >
      {/* Subtle deep-space radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(15, 25, 60, 0.5) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <motion.nav
        className="absolute top-8 left-0 right-0 flex justify-between items-center px-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 14,
            letterSpacing: "0.3em",
            color: "rgba(200, 220, 255, 0.5)",
          }}
        >
          LIGHT-YEAR ATLAS
        </div>
        <div className="flex gap-8">
          {["Atlas", "Transmission", "About"].map((item) => (
            <button
              key={item}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.25em",
                color: "rgba(160, 200, 255, 0.35)",
                background: "none",
                border: "none",
                cursor: "none",
              }}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.nav>

      {/* Center content — Phase 2 Three.js canvas replaces this */}
      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
      >
        {/* Pulsing center orb — placeholder for GravityWell */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="rounded-full"
            style={{ width: 4, height: 4, background: "rgba(200, 220, 255, 0.9)" }}
            animate={{
              boxShadow: [
                "0 0 8px 2px rgba(140, 180, 255, 0.3)",
                "0 0 40px 10px rgba(100, 150, 255, 0.15)",
                "0 0 8px 2px rgba(140, 180, 255, 0.3)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {[80, 140, 200, 280].map((r, i) => (
            <motion.div
              key={r}
              className="absolute rounded-full border"
              style={{
                width: r,
                height: r,
                borderColor: `rgba(120, 160, 255, ${0.06 - i * 0.01})`,
              }}
              animate={{ scale: [1, 1.015, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{
                duration: 6 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          ))}

          {/* Constellation dots — Phase 2 will populate from data */}
          {PLACEHOLDER_STARS.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full"
              style={{
                width: s.size,
                height: s.size,
                left: `calc(50% + ${s.x}px)`,
                top: `calc(50% + ${s.y}px)`,
                background: "rgba(180, 210, 255, 0.75)",
                boxShadow: `0 0 ${s.size * 3}px rgba(140, 180, 255, 0.4)`,
                transform: "translate(-50%, -50%)",
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.3em",
            color: "rgba(160, 200, 255, 0.25)",
          }}
        >
          CALIBRATING STAR MAP · PHASE II
        </div>

        <FrequencyLine width={200} color="rgba(120, 170, 255, 0.3)" />
      </motion.div>

      {/* Bottom status bar */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "rgba(160, 200, 255, 0.2)",
          }}
        >
          05h 34m 32.0s · +22° 00′ 52″
        </div>
        <Blink />
      </motion.div>
    </motion.div>
  );
}

function Blink() {
  return (
    <motion.div
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.2em",
        color: "rgba(160, 200, 255, 0.3)",
      }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    >
      ◉ LIVE
    </motion.div>
  );
}

// Scattered placeholder stars for the orbit preview
const PLACEHOLDER_STARS = [
  { id: 1,  x: -118, y: -32,  size: 2.5 },
  { id: 2,  x:  102, y: -68,  size: 2 },
  { id: 3,  x:   60, y:  110, size: 3 },
  { id: 4,  x: -80,  y:  95,  size: 1.8 },
  { id: 5,  x:  130, y:  40,  size: 2.2 },
  { id: 6,  x: -50,  y: -110, size: 1.5 },
  { id: 7,  x:  10,  y: -130, size: 2.8 },
  { id: 8,  x: -130, y:  20,  size: 1.6 },
  { id: 9,  x:  90,  y: -110, size: 2 },
  { id: 10, x: -100, y:  -70, size: 1.8 },
  { id: 11, x:  -30, y:  130, size: 2.2 },
  { id: 12, x:  115, y:  85,  size: 1.5 },
];
