import { useEffect, useState } from "react";
import { motion } from "motion/react";

const TITLE_TOP = "LIGHT — YEAR";
const TITLE_BOT = "ATLAS";
const SUBTITLE   = "A living observatory";

// Scramble effect: random chars resolve to real ones
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789—·";

function useScramble(target: string, startDelay = 0, duration = 1400) {
  const [display, setDisplay] = useState(() => target.replace(/[^ ]/g, "·"));

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    timeout = setTimeout(() => {
      const total = duration;
      const steps = 28;
      const interval = total / steps;
      let step = 0;

      const tick = setInterval(() => {
        step++;
        const progress = step / steps;
        setDisplay(
          target
            .split("")
            .map((char, i) => {
              if (char === " " || char === "—") return char;
              const charProgress = progress - i * (0.6 / target.length);
              if (charProgress >= 1) return char;
              if (charProgress <= 0) return "·";
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );
        if (step >= steps) clearInterval(tick);
      }, interval);

      return () => clearInterval(tick);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [target, startDelay, duration]);

  return display;
}

export function EntryText() {
  const top = useScramble(TITLE_TOP, 400,  1200);
  const bot = useScramble(TITLE_BOT, 900,  900);

  return (
    <div className="flex flex-col items-center select-none">
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, letterSpacing: "0.6em" }}
        animate={{ opacity: 0.35, letterSpacing: "0.45em" }}
        transition={{ duration: 2.5, delay: 0.2, ease: "easeOut" }}
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "rgba(160, 200, 255, 0.9)",
          marginBottom: 20,
        }}
      >
        OBSERVATORY · EST. ∞
      </motion.div>

      {/* Main title — top line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(38px, 8vw, 96px)",
          fontWeight: 300,
          letterSpacing: "0.22em",
          color: "rgba(230, 238, 255, 0.95)",
          lineHeight: 1,
          textShadow: "0 0 60px rgba(140, 180, 255, 0.25)",
        }}
      >
        {top}
      </motion.div>

      {/* Main title — bottom line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.88 }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(52px, 11vw, 136px)",
          fontWeight: 300,
          letterSpacing: "0.55em",
          color: "rgba(230, 238, 255, 0.95)",
          lineHeight: 1,
          marginTop: 4,
          textShadow: "0 0 80px rgba(140, 180, 255, 0.3)",
        }}
      >
        {bot}
      </motion.div>

      {/* Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.42, y: 0 }}
        transition={{ duration: 2, delay: 2.2, ease: "easeOut" }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(14px, 2vw, 20px)",
          fontStyle: "italic",
          fontWeight: 300,
          letterSpacing: "0.18em",
          color: "rgba(200, 220, 255, 0.9)",
          marginTop: 24,
        }}
      >
        {SUBTITLE}
      </motion.div>
    </div>
  );
}
