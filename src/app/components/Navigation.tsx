import { useState, useEffect } from "react";
import { motion } from "motion/react";

const SECTIONS = [
  { id: "hero",      label: "Signal"    },
  { id: "orbit",     label: "Orbit"     },
  { id: "fragments", label: "Codex" },
  { id: "frequency", label: "Lab"       },
  { id: "atlas",     label: "Atlas"     },
  { id: "afterglow", label: "Archive"   },
];

export function Navigation() {
  const [active,   setActive]   = useState("hero");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const container = document.getElementById("scroll-container");
    if (!container) return;

    const onScroll = () => {
      setScrolled(container.scrollTop > 60);
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight / 2) {
          setActive(s.id); break;
        }
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <motion.nav
      className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 4.2, ease: "easeOut" }}
      style={{
              background:scrolled ? "rgba(11,16,32,0.72)" : "transparent",
        backdropFilter:scrolled ? "blur(18px)"          : "none",
        borderBottom:scrolled ? "1px solid rgba(110,106,240,0.08)" : "none",
        transition: "background 0.6s ease, backdrop-filter 0.6s ease, border 0.6s ease",
}}
    >
      {/* Archive identifier */}
      <button
        onClick={() => scrollTo("hero")}
        style={{ background: "none", border: "none", cursor: "none", padding: 0, textAlign: "left" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 400,
            fontSize: 7,
            letterSpacing: "0.40em",
            color: "rgba(180,178,240,0.32)",
            textTransform: "uppercase",
          }}>
            23rd Orbit
          </span>
          <span style={{
            fontFamily: "'Noto Serif SC', 'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: 13,
            letterSpacing: "0.16em",
            color: "rgba(234,234,242,0.48)",
          }}>
            ∞ 无限光年
          </span>
        </div>
      </button>

      {/* Section nav */}
      <div className="hidden md:flex items-center gap-8">
        {SECTIONS.slice(1).map(s => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.22em",
              color: active === s.id ? "rgba(255,211,107,0.9)" : "rgba(234,234,242,0.28)",
              background: "none",
              border: "none",
              cursor: "none",
              transition: "color 0.4s ease",
              textTransform: "uppercase",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Live status */}
      <div className="flex items-center gap-2.5">
        <motion.div
          className="rounded-full"
          style={{ width: 4, height: 4, background: "#FFD36B", flexShrink: 0 }}
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            letterSpacing: "0.22em",
            color: "rgba(255,211,107,0.4)",
          }}
        >
          PHOSPHORUS A.H
        </span>
      </div>
    </motion.nav>
  );
}
