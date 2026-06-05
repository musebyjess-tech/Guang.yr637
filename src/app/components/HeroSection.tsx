import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { OrbitalMark } from "./OrbitalMark";

// ── Scramble engine ───────────────────────────────────────────────────────────
// Resolves each character left-to-right at ~230ms intervals.
// Unresolved chars cycle at ~18fps — deliberate, not frantic.
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";

function randChar(template: string): string {
  const pool =
    template === template.toUpperCase() && template !== template.toLowerCase()
      ? UPPER
      : LOWER;
  return pool[Math.floor(Math.random() * pool.length)];
}

function useScramble(target: string, startDelayMs: number, resolvePerCharMs: number) {
  const final = target.split("");
  const [chars, setChars] = useState<string[]>(() => final.map(c => randChar(c)));
  const [done, setDone] = useState(false);
  const raf    = useRef(0);
  const lastCycle = useRef(0);

  useEffect(() => {
    const startTime = performance.now() + startDelayMs;

    const tick = (now: number) => {
      if (now < startTime) { raf.current = requestAnimationFrame(tick); return; }

      const elapsed  = now - startTime;
      const resolved = Math.min(Math.floor(elapsed / resolvePerCharMs), final.length);
      const cycle    = now - lastCycle.current > 55; // ~18fps for scrambling chars

      if (cycle || resolved > 0) {
        lastCycle.current = now;
        setChars(final.map((ch, i) => (i < resolved ? ch : randChar(ch))));
      }

      if (resolved < final.length) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setChars([...final]);
        setDone(true);
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return { chars, done };
}

// ── Constellation atmosphere ──────────────────────────────────────────────────
function ConstellationAtmosphere() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", overflow: "visible",
      }}
      viewBox="0 0 580 160"
      preserveAspectRatio="xMidYMid meet"
    >
      <line x1="80" y1="60" x2="290" y2="46"
        stroke="rgba(180,178,240,0.06)" strokeWidth="0.6" strokeDasharray="2 10" />
      <line x1="290" y1="46" x2="500" y2="66"
        stroke="rgba(180,178,240,0.06)" strokeWidth="0.6" strokeDasharray="2 10" />
      <circle cx="185" cy="53" r="1.2" fill="rgba(180,178,240,0.22)" />
      <circle cx="395" cy="56" r="1.2" fill="rgba(180,178,240,0.22)" />
      <circle cx="148" cy="90"  r="0.8" fill="rgba(152,150,232,0.18)" />
      <circle cx="230" cy="110" r="0.6" fill="rgba(255,231,163,0.12)" />
      <circle cx="340" cy="95"  r="0.7" fill="rgba(246,183,210,0.14)" />
      <circle cx="430" cy="105" r="0.8" fill="rgba(152,150,232,0.15)" />
      <circle cx="310" cy="130" r="0.5" fill="rgba(255,231,163,0.10)" />
      <circle cx="110" cy="120" r="0.6" fill="rgba(246,183,210,0.11)" />
      <circle cx="460" cy="88"  r="0.5" fill="rgba(180,178,240,0.13)" />
      {([
        [80,  60, "rgba(152,150,232,0.18)"],
        [290, 46, "rgba(246,183,210,0.18)"],
        [500, 66, "rgba(255,211,107,0.18)"],
      ] as [number, number, string][]).map(([x, y, c], i) => (
        <g key={i}>
          <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke={c} strokeWidth="0.5" />
          <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke={c} strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

// ── Floating signal node ──────────────────────────────────────────────────────
function SignalNode({
  num, label, children, accentColor, glowColor, delay, yOffset,
}: {
  num: string; label: string; children: React.ReactNode;
  accentColor: string; glowColor: string; delay: number; yOffset: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 3.0, delay, ease: "easeOut" }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        transform: `translateY(${yOffset}px)`, width: 160,
      }}
    >
      <motion.div
        animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.3, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 6, height: 6, borderRadius: "50%", background: accentColor,
          boxShadow: `0 0 10px 3px ${glowColor}, 0 0 22px 6px ${glowColor.replace(/[\d.]+\)$/, "0.15)")}`,
          marginBottom: 14,
        }}
      />
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: 7,
        letterSpacing: "0.36em", color: "rgba(180,178,240,0.24)",
        textTransform: "uppercase", marginBottom: 10,
      }}>
        ✦ Signal {num}
      </div>
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: 7,
        letterSpacing: "0.28em", color: "rgba(180,178,240,0.28)",
        textTransform: "uppercase", marginBottom: 12,
      }}>
        {label}
      </div>
      {children}
    </motion.div>
  );
}

// ── Archive panel ─────────────────────────────────────────────────────────────
function ArchivePanel() {
  return (
    <div style={{ marginTop: 80, width: "100%", maxWidth: 580, position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 20, marginBottom: 36,
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 9,
          letterSpacing: "0.30em", color: "rgba(236, 235, 249, 0.22)", textTransform: "uppercase",
        }}>
          Archive Entry #023
        </div>
        <div style={{ width: 1, height: 10, background: "rgba(180,178,240,0.12)" }} />
        <div style={{
          fontFamily: "'Cormorant Garamond bold', serif", fontSize: 11, fontWeight: 300,
          letterSpacing: "0.22em", color: "rgba(168,184,255,0.72)",
        }}>
          Signal Detected
        </div>
      </div>

      <div style={{ position: "relative", height: 160 }}>
        <ConstellationAtmosphere />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <SignalNode num="01" label="Source"
            accentColor="rgba(152,150,232,0.9)" glowColor="rgba(110,106,240,0.45)"
            delay={0.2} yOffset={0}>
            <motion.div
              animate={{ opacity: [0.75, 0.95, 0.75] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: 25, fontWeight: 300,
                color: "rgba(234,234,242,0.88)", lineHeight: 1,
                textShadow: "0 0 24px rgba(152,150,232,0.50), 0 0 48px rgba(110,106,240,0.22)",
              }}
            >光</motion.div>
          </SignalNode>

          <SignalNode num="02" label="Classification"
            accentColor="rgba(246,183,210,0.85)" glowColor="rgba(246,183,210,0.35)"
            delay={0.5} yOffset={-14}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 15, fontWeight: 300,
              letterSpacing: "0.2em", color: "rgba(246,183,210,0.75)",
              paddingLeft: "0.36em", lineHeight: 1.3,
            }}>
              Phosphorus
            </div>
          </SignalNode>

          <SignalNode num="03" label="Status"
            accentColor="rgba(255,211,107,0.80)" glowColor="rgba(255,211,107,0.32)"
            delay={0.8} yOffset={8}>
            <motion.div
              animate={{ opacity: [0.55, 0.78, 0.55] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 15, fontWeight: 300, fontStyle: "italic",
                letterSpacing: "0.1em", color: "rgba(255,231,163,0.80)", lineHeight: 1.5,
              }}
            >
              Still Becoming
            </motion.div>
          </SignalNode>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
// Sequence:
//   T=0      Title occupies its space — characters scrambling
//   T=0.4s   Scramble begins resolving left-to-right (9 chars × 230ms ≈ 2.5s total)
//   T=2.5s   Title locked → OrbitalMark begins materialising
//   T=3.7s   Phosphorus A.H fades in
//   T=4.5s   Archive panel emerges
//   T=8.5s   Explore indicator appears
export function HeroSection() {
  const [mark, setMark] = useState({ w: 340, h: 149 });

  // Scramble "GUANGYear" — 9 characters, no period
  const { chars, done: titleDone } = useScramble("GUANGYear", 400, 230);
  const guangStr = chars.slice(0, 5).join("");
  const yearStr  = chars.slice(5).join("");

  // Sequential reveals triggered when title locks
  const [markVisible,     setMarkVisible]     = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [archiveVisible,  setArchiveVisible]  = useState(false);

  useEffect(() => {
    if (!titleDone) return;
    setMarkVisible(true);
    const t1 = setTimeout(() => setSubtitleVisible(true), 1300);
    const t2 = setTimeout(() => setArchiveVisible(true),  2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [titleDone]);

  useEffect(() => {
    const calc = () => {
      const w = Math.max(198, Math.min(378, window.innerWidth * 0.288));
      setMark({ w: Math.round(w), h: Math.round(w / 2.28) });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const titleBase = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize:   "clamp(47px, 7.3vw, 99px)" as const,
    fontWeight: 300 as const,
    lineHeight: 1 as const,
    color:      "#EAEAF2",
    transition: "letter-spacing 0.7s ease",
  };

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center text-center"
      style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80 }}
    >
      {/* ── Eyebrow ─────────────────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.24 }}
        transition={{ duration: 2.0, delay: 0.2, ease: "easeOut" }}
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 400, fontSize: 9,
          letterSpacing: "0.48em", paddingLeft: "0.48em",
          color: "#B4B2F0", marginBottom: 32, textTransform: "uppercase",
        }}
      >
        A Living Celestial Archive
      </motion.p>

      {/* ── OrbitalMark — space always reserved; materialises after title locks ─ */}
      <motion.div
        animate={
          markVisible
            ? { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }
            : { opacity: 0, filter: "blur(28px)", scale: 0.94, y: 12 }
        }
        transition={{ duration: 3.2, ease: "easeOut" }}
        style={{ marginBottom: 24 }}
      >
        <motion.div
          animate={markVisible ? {
            filter: [
              "drop-shadow(0 0 18px rgba(110,106,240,0.14))",
              "drop-shadow(0 0 36px rgba(110,106,240,0.34))",
              "drop-shadow(0 0 18px rgba(110,106,240,0.14))",
            ],
          } : {}}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <OrbitalMark width={mark.w} height={mark.h} />
        </motion.div>
      </motion.div>

      {/* ── Title — always in position; characters scramble into GUANG.Year ──── */}
      <div className="flex items-baseline justify-center" style={{ gap: 0, lineHeight: 1 }}>
        <span style={{
          ...titleBase,
          letterSpacing: titleDone ? "0.14em" : "0.18em",
        }}>
          {guangStr}
        </span>

        <span style={{ ...titleBase, color: "#FFD36B", opacity: 0.50, letterSpacing: 0 }}>
          .
        </span>

        <span style={{
          ...titleBase,
          letterSpacing: titleDone ? "0.10em" : "0.16em",
        }}>
          {yearStr}
        </span>
      </div>

      {/* ── Subtitle — Cormorant Garamond italic, after title resolves ─────────── */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={subtitleVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 2.0, ease: "easeOut" }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300, fontStyle: "italic",
          fontSize: "clamp(12px, 1.4vw, 15px)",
          letterSpacing: "0.46em", paddingLeft: "0.46em",
          color: "rgba(246,183,210,0.65)",
          marginTop: 20,
        }}
      >
        Phosphorus A.H
      </motion.p>

      {/* ── Archive panel — three signal nodes, emerges last ────────────────── */}
      {archiveVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <ArchivePanel />
        </motion.div>
      )}

      {/* ── Scroll indicator ────────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 8.5, ease: "easeOut" }}
      >
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 8, letterSpacing: "0.35em",
          color: "rgba(234,234,242,0.14)",
        }}>
          EXPLORE
        </span>
        <motion.div
          style={{
            width: 1, height: 44,
            background: "linear-gradient(to bottom, rgba(110,106,240,0.5), rgba(110,106,240,0))",
          }}
          animate={{ opacity: [0.6, 0.12, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
