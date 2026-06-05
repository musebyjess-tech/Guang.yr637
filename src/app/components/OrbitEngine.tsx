import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { LocationStore, type OrbitNode } from "./LocationStore";
import { formatCoordinates, generateSignalPresentation } from "../lib/signalUtils";

const CX = 220, CY = 220, R = 140;

function angleToXY(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

const ANCHOR_ANGLES: Record<string, number> = {
  hangzhou: -90,
  ithaca: 30,
  sf: 150,
};

type OrbitPhase = OrbitNode & { angle: number; accent: string };

function toPhases(nodes: OrbitNode[]): OrbitPhase[] {
  const anchors = nodes.filter((n) => n.isAnchor);
  const users = nodes.filter((n) => !n.isAnchor);
  const anchorPhases = anchors.map((node) => ({
    ...node,
    angle: ANCHOR_ANGLES[node.id] ?? -90,
    accent: node.color,
  }));
  const baseAngle = 210;
  const spread = users.length > 1 ? 300 / users.length : 0;
  const userPhases = users.map((node, i) => ({
    ...node,
    angle: baseAngle + i * spread,
    accent: node.color,
  }));
  return [...anchorPhases, ...userPhases];
}

export function OrbitEngine({ onOpenRoaming }: { onOpenRoaming?: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<OrbitNode[]>(() => LocationStore.getOrbitNodes());
  const [dragAngle, setDragAngle] = useState(-90);
  const [active, setActive] = useState(0);
  const dragging = useRef(false);

useEffect(() => {
  const unsubscribe = LocationStore.subscribe(() => setNodes(LocationStore.getOrbitNodes()));
  return () => { unsubscribe(); };
}, []);

  const phases = useMemo(() => toPhases(nodes), [nodes]);

  useEffect(() => {
    if (active >= phases.length) setActive(Math.max(0, phases.length - 1));
  }, [phases.length, active]);

  useEffect(() => {
    if (phases[active]) setDragAngle(phases[active].angle);
  }, [phases, active]);

  const getAngleFromMouse = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left - CX;
    const py = e.clientY - rect.top - CY;
    return (Math.atan2(py, px) * 180) / Math.PI;
  }, []);

  const snapToNearest = useCallback((angle: number) => {
    if (phases.length === 0) return;
    let best = 0, bestDist = Infinity;
    phases.forEach((p, i) => {
      const d = Math.abs(((angle - p.angle + 540) % 360) - 180);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setActive(best);
    setDragAngle(phases[best].angle);
  }, [phases]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setDragAngle(getAngleFromMouse(e));
    };
    const onUp = (e: MouseEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      snapToNearest(getAngleFromMouse(e));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [getAngleFromMouse, snapToNearest]);

  const phase = phases[active];
  const handlePos = angleToXY(dragAngle);

  const presentation = phase
    ? generateSignalPresentation({
        location: phase.label,
        lat: phase.lat,
        lng: phase.lng,
        mood: phase.mood,
        memory: phase.memory ?? "",
      })
    : null;

  return (
    <section
      id="orbit"
      className="relative flex flex-col items-center justify-center py-32"
      style={{ minHeight: "100vh" }}
    >
      <SectionLabel index="01" title="ORBIT ENGINE" />

      <div className="flex flex-col lg:flex-row items-center gap-16 mt-12 px-8 max-w-5xl w-full">
        <div className="relative flex-shrink-0">
          <svg
            ref={svgRef}
            width={440}
            height={440}
            viewBox="0 0 440 440"
            style={{ cursor: "none", overflow: "visible" }}
            onMouseDown={onMouseDown}
          >
            <circle cx={CX} cy={CY} r={R} stroke="rgba(110,106,240,0.15)" strokeWidth="1" fill="none" />
            <circle cx={CX} cy={CY} r={R - 20} stroke="rgba(110,106,240,0.05)" strokeWidth="0.5" fill="none" strokeDasharray="4 8" />
            <circle cx={CX} cy={CY} r={R + 20} stroke="rgba(234,234,242,0.04)" strokeWidth="0.5" fill="none" />

            {phases.map((p, i) => {
              const pos = angleToXY(p.angle);
              const isActive = i === active;
              return (
                <g key={p.id} style={{ cursor: "none" }} onClick={() => { setActive(i); setDragAngle(p.angle); }}>
                  <circle
                    cx={pos.x} cy={pos.y} r={isActive ? 10 : 6}
                    fill={isActive ? p.color : "rgba(234,234,242,0.15)"}
                    style={{ filter: isActive ? `drop-shadow(0 0 8px ${p.color}55)` : "none", transition: "all 0.5s ease" }}
                  />
                  <text
                    x={pos.x + (pos.x > CX ? 16 : -16)}
                    y={pos.y + 4}
                    textAnchor={pos.x > CX ? "start" : "end"}
                    style={{
                      fontFamily: "'space mono', serif",
                      fontSize: 9,
                      fill: isActive ? p.color : "rgba(234,234,242,0.3)",
                      letterSpacing: "0.15em",
                      transition: "fill 0.5s ease",
                    }}
                  >
                    {p.label.length > 14 ? `${p.label.slice(0, 12)}…` : p.label}
                  </text>
                </g>
              );
            })}

            <circle cx={CX} cy={CY} r={4} fill="rgba(255,231,163,0.8)" style={{ filter: "drop-shadow(0 0 6px rgba(255,211,107,0.6))" }} />
            <circle cx={CX} cy={CY} r={18} fill="none" stroke="rgba(255,231,163,0.1)" strokeWidth="0.5" />
            <circle cx={CX} cy={CY} r={32} fill="none" stroke="rgba(255,231,163,0.05)" strokeWidth="0.5" />

            {phase && (
              <line
                x1={CX} y1={CY}
                x2={angleToXY(phase.angle).x}
                y2={angleToXY(phase.angle).y}
                stroke={phase.color} strokeWidth="0.5" opacity="0.3"
                strokeDasharray="4 6"
              />
            )}

            <circle
              cx={handlePos.x} cy={handlePos.y} r={14}
              fill="rgba(11,16,32,0.6)"
              stroke={phase?.color ?? "rgba(234,234,242,0.3)"}
              strokeWidth="1"
              style={{ cursor: "none", filter: phase ? `drop-shadow(0 0 10px ${phase.color}55)` : "none" }}
            />
            <circle cx={handlePos.x} cy={handlePos.y} r={3} fill={phase?.color ?? "rgba(234,234,242,0.3)"} />

            <text
              x={CX} y={CY - 12}
              textAnchor="middle"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, fill: "rgba(234,234,242,0.25)", letterSpacing: "0.15em" }}
            >
              DRAG TO EXPLORE
            </text>
          </svg>
        </div>

        <div className="flex flex-col gap-5 max-w-sm">
          {presentation && phase ? (
            <motion.div
              key={phase.id}
              className="flex flex-col gap-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.3em", color: "rgba(110,106,240,0.6)" }}>
                {phase.isAnchor ? phase.sub.toUpperCase() : "SIGNAL NODE"}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 300, color: phase.color, letterSpacing: "0.05em", lineHeight: 1.2 }}>
                <span>{presentation.label}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(10px, 1.8vw, 14px)", letterSpacing: "0.04em", color: "rgba(234,234,242,0.5)" }}>
                  {formatCoordinates(phase.lat, phase.lng)}
                </span>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(14px,1.6vw,18px)", fontStyle: "italic", fontWeight: 300, color: phase.accent, lineHeight: 1.8 }}>
                {presentation.moodLine}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(13px,2.9vw,15px)", fontWeight: 300, color: "rgba(234,234,242,0.5)", lineHeight: 1.95, letterSpacing: "0.01em" }}>
                {phase.desc ?? (phase.isAnchor ? presentation.narrative : "Generating signal description…")}
              </div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 24 }, (_, i) => (
                  <motion.div
                    key={i}
                    style={{ width: 2, background: phase.color, borderRadius: 1 }}
                    animate={{ height: [4, 4 + Math.sin(i * 0.8) * 12, 4] }}
                    transition={{ duration: 1.5 + i * 0.04, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(180,178,240,0.4)", letterSpacing: "0.2em" }}>
              NO SIGNALS YET
            </div>
          )}

          <motion.button
            onClick={onOpenRoaming}
            style={{
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(110,106,240,0.08)",
              border: "1px solid rgba(110,106,240,0.22)",
              borderRadius: 4,
              padding: "10px 18px",
              cursor: "none",
              fontFamily: "'Space Mono', monospace",
              fontSize: 8,
              letterSpacing: "0.3em",
              color: "rgba(180,178,240,0.7)",
              backdropFilter: "blur(8px)",
              alignSelf: "flex-start",
            }}
            whileHover={{
              background: "rgba(110,106,240,0.15)",
              borderColor: "rgba(180,178,240,0.4)",
              color: "rgba(234,234,242,0.9)",
              transition: { duration: 0.3 },
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "#F6B7D2",
                display: "inline-block",
                flexShrink: 0,
                boxShadow: "0 0 6px rgba(246,183,210,0.9)",
              }}
            />
            ROAMING UNIVERSE
            <span style={{ opacity: 0.4 }}>→</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(110,106,240,0.5)", letterSpacing: "0.2em" }}>
        {index}
      </div>
      <div style={{ width: 40, height: 1, background: "rgba(110,106,240,0.25)" }} />
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.35em", color: "rgba(234,234,242,0.3)" }}>
        {title}
      </div>
    </div>
  );
}
