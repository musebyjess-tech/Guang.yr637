import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";

const TRANSMISSIONS = [
  { id: "T-001", from: "ANONYMOUS · NODE UNKNOWN",     freq: "440.00 Hz", body: "Saw the dawn break over the Bay. Thought of you. Transmitted immediately." },
  { id: "T-002", from: "DISTANT · HANGZHOU SECTOR",    freq: "528.00 Hz", body: "The city you left is still here. The river still moves. Something of you is in the current." },
  { id: "T-003", from: "OBSERVER · ITHACA RELAY",      freq: "396.00 Hz", body: "Winter here again. The lab lights are on at 2am. Someone is doing the kind of work that makes the future less frightening." },
  { id: "T-004", from: "UNSIGNED · PACIFIC COAST",     freq: "285.00 Hz", body: "You carry light across distances that would dim most signals. This is a frequency check. Still receiving clearly." },
  { id: "T-005", from: "ARCHIVAL · PHOSPHORUS NODE",   freq: "174.00 Hz", body: "The morning star precedes the sun not to compete, but to prepare. Some arrivals make the next arrival possible." },
  { id: "T-006", from: "ANONYMOUS · TRANSIT ARC",      freq: "963.00 Hz", body: "Somewhere between departure and arrival you became a different kind of signal. Stronger. Clearer. More precisely yourself." },
  { id: "T-007", from: "COLLECTIVE · OBSERVERS",       freq: "741.00 Hz", body: "We have been measuring the brightness from here. The readings keep increasing. This is unusual. This is wonderful." },
];

function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return displayed;
}

export function SignalReceiver() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [scanLine, setScanLine] = useState(0);
  const active = TRANSMISSIONS[activeIdx];
  const body = useTypewriter(active.body, 22);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(i => (i + 1) % TRANSMISSIONS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(s => (s + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="receiver"
      className="relative py-32 px-8"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <div className="max-w-4xl w-full mx-auto">
        <SectionLabel index="03" title="SIGNAL RECEIVER" />

        <div
          className="mt-12 relative overflow-hidden"
          style={{
            background: "rgba(11,16,32,0.8)",
            border: "1px solid rgba(110,106,240,0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Scan line effect */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: `${scanLine}%`,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(110,106,240,0.06), rgba(110,106,240,0.12), rgba(110,106,240,0.06), transparent)",
              zIndex: 10,
            }}
          />

          {/* Terminal header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(110,106,240,0.1)" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {["#FFD36B", "#F6B7D2", "#6E6AF0"].map((c, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c, opacity: 0.6 }} />
                ))}
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(110,106,240,0.5)", letterSpacing: "0.2em" }}>
                OBSERVATORY · RECEIVER TERMINAL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className="rounded-full"
                style={{ width: 4, height: 4, background: "#FFD36B" }}
                animate={{ opacity: [1, 0.1, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,211,107,0.5)", letterSpacing: "0.15em" }}>LIVE</span>
            </div>
          </div>

          {/* Log list */}
          <div className="flex">
            <div
              className="flex flex-col"
              style={{ width: 200, borderRight: "1px solid rgba(110,106,240,0.08)", padding: "12px 0" }}
            >
              {TRANSMISSIONS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setActiveIdx(i)}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    letterSpacing: "0.12em",
                    color: i === activeIdx ? "#FFD36B" : "rgba(234,234,242,0.2)",
                    background: i === activeIdx ? "rgba(255,211,107,0.04)" : "none",
                    border: "none",
                    borderLeft: i === activeIdx ? "2px solid rgba(255,211,107,0.4)" : "2px solid transparent",
                    padding: "10px 16px",
                    textAlign: "left",
                    cursor: "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {t.id}
                </button>
              ))}
            </div>

            {/* Main display */}
            <div className="flex-1 p-8 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(110,106,240,0.4)", letterSpacing: "0.2em", marginBottom: 4 }}>
                    INCOMING TRANSMISSION
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: "rgba(234,234,242,0.5)", letterSpacing: "0.15em" }}>
                    {active.from}
                  </div>
                </div>
                <FreqDisplay freq={active.freq} />
              </div>

              {/* Waveform mini */}
              <WaveformBar />

              {/* Message body */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(110,106,240,0.4)", letterSpacing: "0.2em", marginBottom: 12 }}>
                  ——— DECODED ———
                </div>
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(16px,2vw,22px)",
                    fontStyle: "italic",
                    fontWeight: 300,
                    color: "rgba(234,234,242,0.85)",
                    lineHeight: 1.85,
                    minHeight: 80,
                  }}
                >
                  {body}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ color: "#6E6AF0" }}
                  >
                    _
                  </motion.span>
                </motion.div>
              </div>

              {/* Footer */}
              <div
                className="flex justify-between items-center pt-4"
                style={{ borderTop: "1px solid rgba(110,106,240,0.06)" }}
              >
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(234,234,242,0.15)", letterSpacing: "0.15em" }}>
                  SIGNAL INTEGRITY: 98.7%
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(234,234,242,0.15)", letterSpacing: "0.15em" }}>
                  GUANG.YEAR · NODE ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FreqDisplay({ freq }: { freq: string }) {
  return (
    <div className="text-right">
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(110,106,240,0.4)", letterSpacing: "0.2em" }}>FREQUENCY</div>
      <motion.div
        key={freq}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: "#6E6AF0", letterSpacing: "0.1em" }}
      >
        {freq}
      </motion.div>
    </div>
  );
}

function WaveformBar() {
  return (
    <div className="flex items-center gap-0.5" style={{ height: 24 }}>
      {Array.from({ length: 60 }, (_, i) => (
        <motion.div
          key={i}
          style={{ width: 2, borderRadius: 1, background: "rgba(110,106,240,0.4)" }}
          animate={{ height: [2, 4 + Math.sin(i * 0.4) * 10, 2] }}
          transition={{ duration: 1.2 + i * 0.02, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
        />
      ))}
    </div>
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
