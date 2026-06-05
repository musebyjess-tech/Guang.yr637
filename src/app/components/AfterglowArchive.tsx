import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { LocationStore, type SignalEntry } from "./LocationStore";
import { formatCoordinates, formatSignalDate, getMoodNarrative } from "../lib/signalUtils";

export function AfterglowArchive() {
  const [signals, setSignals] = useState<SignalEntry[]>(() => LocationStore.getSignalsSorted());
  const [revealed, setRevealed] = useState(3);
  const [scanning, setScanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => LocationStore.subscribe(() => {
    const sorted = LocationStore.getSignalsSorted();
    setSignals(sorted);
    setRevealed(sorted.length);
  }), []);

  useEffect(() => {
    const el = document.getElementById("scroll-container");
    if (!el) return;
    const onScroll = () => {
      const section = document.getElementById("afterglow");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.6) {
        setRevealed(signals.length);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [signals.length]);

  const scan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
    setRevealed(signals.length);
  };

  return (
    <section
      id="afterglow"
      ref={containerRef}
      className="relative py-32 px-8"
      style={{ minHeight: "100vh" }}
    >
      <div className="max-w-3xl mx-auto">
        <SectionLabel index="06" title="AFTERGLOW ARCHIVE" />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(15px,1.6vw,18px)", fontStyle: "italic", fontWeight: 300, color: "rgba(180,178,240,0.55)", marginTop: 8, marginBottom: 48, lineHeight: 1.7 }}>
          Future archaeology. Signals preserved in amber light.
        </p>

        <div style={{ border: "1px solid rgba(110,106,240,0.12)", background: "rgba(11,16,32,0.75)", backdropFilter: "blur(16px)" }}>
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(110,106,240,0.08)" }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(110,106,240,0.4)", letterSpacing: "0.2em" }}>
              AFTERGLOW ARCHIVE · {signals.length} ENTRIES
            </span>
            <button
              onClick={scan}
              style={{
                fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.15em",
                color: scanning ? "#FFD36B" : "rgba(234,234,242,0.3)",
                background: "none", border: "1px solid rgba(234,234,242,0.1)",
                padding: "4px 12px", cursor: "none",
                transition: "color 0.3s ease",
              }}
            >
              {scanning ? "SCANNING..." : "FULL SCAN"}
            </button>
          </div>

          <div className="flex flex-col">
            {signals.length === 0 ? (
              <div className="px-6 py-12 text-center" style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.2em", color: "rgba(234,234,242,0.2)" }}>
                NO SIGNALS LOGGED YET · LEAVE A SIGNAL IN ROAMING UNIVERSE
              </div>
            ) : (
              signals.slice(0, revealed).map((entry, i) => (
                <ArchiveEntry key={entry.id} entry={entry} index={i} />
              ))
            )}
          </div>

          <div
            className="px-6 py-4 flex justify-between"
            style={{ borderTop: "1px solid rgba(110,106,240,0.06)" }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(234,234,242,0.15)", letterSpacing: "0.15em" }}>
              GUANG.YEAR · MEMORY OBSERVATORY
            </span>
            <motion.span
              animate={{ opacity: [0.15, 0.5, 0.15] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(255,211,107,0.5)", letterSpacing: "0.15em" }}
            >
              ◉ ARCHIVE LIVE
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchiveEntry({ entry, index }: { entry: SignalEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const narrative = getMoodNarrative(entry.mood);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      onClick={() => setExpanded(!expanded)}
      className="relative"
      style={{ borderBottom: "1px solid rgba(110,106,240,0.05)", cursor: "none" }}
    >
      <div
        className="px-6 py-4 flex items-start gap-4"
        style={{
          background: expanded ? "rgba(110,106,240,0.04)" : "transparent",
          transition: "background 0.3s ease",
        }}
      >
        <div className="flex flex-col items-center gap-1 pt-1" style={{ flexShrink: 0 }}>
          <div style={{ width: 2, height: 32, background: "rgba(234,234,242,0.06)", borderRadius: 1, position: "relative", overflow: "hidden" }}>
            <motion.div
              style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: entry.moodColor }}
              animate={{ height: "100%" }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 500, color: entry.moodColor, letterSpacing: "0.1em" }}>
                {entry.location.toUpperCase()}
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 7,
                  letterSpacing: "0.12em",
                  color: entry.moodColor,
                  padding: "2px 6px",
                  border: `1px solid ${entry.moodColor}44`,
                }}
              >
                {entry.mood.toUpperCase()}
              </span>
            </div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(234,234,242,0.25)", letterSpacing: "0.1em" }}>
              {formatCoordinates(entry.lat, entry.lng)}
            </span>
          </div>

          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontStyle: "italic", fontWeight: 300, color: "rgba(234,234,242,0.55)", lineHeight: 1.65, marginBottom: 10 }}>
            {narrative}
          </div>

          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 300, color: "rgba(234,234,242,0.75)", lineHeight: 1.7 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: "0.15em", color: "rgba(180,178,240,0.4)", display: "block", marginBottom: 6 }}>
              MEMORY LOGGED
            </span>
            {entry.memory}
          </div>

          {entry.people && (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(234,234,242,0.3)", letterSpacing: "0.1em", marginTop: 10 }}>
              WITH · {entry.people}
            </div>
          )}

          {expanded && entry.photo && (
            <img
              src={entry.photo}
              alt=""
              style={{ marginTop: 14, maxWidth: "100%", maxHeight: 220, borderRadius: 6, border: `1px solid ${entry.moodColor}33`, objectFit: "cover" }}
            />
          )}

          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(234,234,242,0.2)", letterSpacing: "0.1em", marginTop: 10 }}>
            {formatSignalDate(entry)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-2">
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(110,106,240,0.5)", letterSpacing: "0.2em" }}>{index}</div>
      <div style={{ width: 40, height: 1, background: "rgba(110,106,240,0.25)" }} />
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.35em", color: "rgba(234,234,242,0.3)" }}>{title}</div>
    </div>
  );
}
