import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { LocationStore, ANCHOR_NODES } from "./LocationStore";
import {
  formatCoordinates,
  getAnchorMood,
  getMoodNarrative,
  latLngToMapXY,
  signalToMapPoint,
} from "../lib/signalUtils";

type MapPoint = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  color: string;
  desc: string;
  memory?: string;
  mood?: string;
};

function buildMapPoints(): MapPoint[] {
  const anchors: MapPoint[] = ANCHOR_NODES.map((a) => {
    const { x, y } = latLngToMapXY(a.lat, a.lng);
    const mood = getAnchorMood(a.sub);
    return {
      id: a.id,
      label: a.label,
      sub: formatCoordinates(a.lat, a.lng),
      x,
      y,
      color: a.color,
      desc: getMoodNarrative(mood),
    };
  });
  const signals = LocationStore.getSignals().map((s) => {
    const p = signalToMapPoint(s);
    return { id: p.id, label: p.label, sub: p.sub, x: p.x, y: p.y, color: p.color, desc: p.desc, memory: p.memory, mood: p.mood };
  });
  return [...anchors, ...signals];
}

const LAND_PATHS = [
  "M 0.04 0.12 C 0.08 0.08 0.18 0.06 0.25 0.10 C 0.30 0.13 0.32 0.20 0.28 0.25 C 0.24 0.30 0.18 0.32 0.12 0.35 C 0.06 0.38 0.03 0.35 0.03 0.28 Z",
  "M 0.40 0.08 C 0.55 0.04 0.70 0.06 0.82 0.12 C 0.90 0.16 0.95 0.22 0.92 0.28 C 0.88 0.34 0.80 0.38 0.70 0.40 C 0.60 0.42 0.50 0.38 0.44 0.32 C 0.38 0.26 0.36 0.16 0.40 0.08 Z",
  "M 0.48 0.40 C 0.52 0.38 0.58 0.40 0.60 0.46 C 0.62 0.52 0.60 0.60 0.55 0.64 C 0.50 0.68 0.44 0.64 0.42 0.58 C 0.40 0.52 0.42 0.44 0.48 0.40 Z",
  "M 0.22 0.42 C 0.26 0.40 0.30 0.44 0.28 0.52 C 0.26 0.60 0.20 0.66 0.16 0.62 C 0.12 0.58 0.12 0.50 0.16 0.44 Z",
  "M 0.76 0.52 C 0.82 0.50 0.88 0.52 0.88 0.58 C 0.88 0.64 0.82 0.66 0.76 0.64 C 0.70 0.62 0.70 0.56 0.76 0.52 Z",
];

export function CelestialAtlas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [points, setPoints] = useState<MapPoint[]>(() => buildMapPoints());
  const frameRef = useRef<number>(0);
  const progressRef = useRef(0);
  const pointsRef = useRef(points);

  useEffect(() => {
    return LocationStore.subscribe(() => {
      const next = buildMapPoints();
      pointsRef.current = next;
      setPoints(next);
    });
  }, []);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    };
    resize();

    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    let t = 0;

    const draw = () => {
      t += 0.008;
      progressRef.current = (progressRef.current + 0.002) % 1;
      const cities = pointsRef.current;
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "rgba(11,16,40,0.4)";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(110,106,240,0.05)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath(); ctx.moveTo((i / 8) * W, 0); ctx.lineTo((i / 8) * W, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, (i / 8) * H); ctx.lineTo(W, (i / 8) * H); ctx.stroke();
      }

      LAND_PATHS.forEach((d) => {
        const path = new Path2D();
        const parts = d.split(" ");
        let i = 0;
        while (i < parts.length) {
          const cmd = parts[i++];
          if (cmd === "M") { path.moveTo(parseFloat(parts[i]) * W, parseFloat(parts[i + 1]) * H); i += 2; }
          else if (cmd === "C") {
            path.bezierCurveTo(
              parseFloat(parts[i]) * W, parseFloat(parts[i + 1]) * H,
              parseFloat(parts[i + 2]) * W, parseFloat(parts[i + 3]) * H,
              parseFloat(parts[i + 4]) * W, parseFloat(parts[i + 5]) * H,
            ); i += 6;
          }
          else if (cmd === "Z") path.closePath();
        }
        ctx.fillStyle = "rgba(110,106,240,0.06)";
        ctx.strokeStyle = "rgba(110,106,240,0.12)";
        ctx.lineWidth = 0.5;
        ctx.fill(path);
        ctx.stroke(path);
      });

      cities.forEach((c, idx) => {
        const cx = c.x * W, cy = c.y * H;
        const isHov = hovered === c.id;
        const pulse = 0.6 + 0.4 * Math.sin(t * 2 + idx);

        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, isHov ? 40 : 24);
        glow.addColorStop(0, c.color + "40");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, isHov ? 40 : 24, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, isHov ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = pulse;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isHov) {
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.strokeStyle = c.color + "40";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      if (cities.length >= 2) {
        for (let i = 0; i < cities.length - 1; i++) {
          const a = cities[i], b = cities[i + 1];
          const fx = a.x * W, fy = a.y * H;
          const tx = b.x * W, ty = b.y * H;
          const mx = (fx + tx) / 2, my = Math.min(fy, ty) - H * 0.12;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.quadraticCurveTo(mx, my, tx, ty);
          ctx.strokeStyle = "rgba(234,234,242,0.06)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        const segCount = cities.length - 1;
        const p = progressRef.current;
        const segIdx = Math.min(Math.floor(p * segCount), segCount - 1);
        const shootP = (p * segCount) % 1;
        const sa = cities[segIdx], sb = cities[segIdx + 1];
        const sfx = sa.x * W, sfy = sa.y * H;
        const stx = sb.x * W, sty = sb.y * H;
        const smx = (sfx + stx) / 2, smy = Math.min(sfy, sty) - H * 0.12;
        const qx = (1 - shootP) ** 2 * sfx + 2 * (1 - shootP) * shootP * smx + shootP ** 2 * stx;
        const qy = (1 - shootP) ** 2 * sfy + 2 * (1 - shootP) * shootP * smy + shootP ** 2 * sty;
        const starColor = sa.color;

        const starGlow = ctx.createRadialGradient(qx, qy, 0, qx, qy, 8);
        starGlow.addColorStop(0, starColor + "cc");
        starGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(qx, qy, 8, 0, Math.PI * 2);
        ctx.fillStyle = starGlow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(qx, qy, 2, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [hovered]);

  const hoveredCity = points.find((c) => c.id === hovered);

  return (
    <section
      id="atlas"
      className="relative py-32 px-8"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <div className="max-w-5xl w-full mx-auto">
        <SectionLabel index="05" title="CELESTIAL ATLAS" />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(15px,1.6vw,18px)", fontStyle: "italic", fontWeight: 300, color: "rgba(180,178,240,0.55)", marginTop: 8, marginBottom: 36, lineHeight: 1.7 }}>
          {points.length} coordinates mapped. Light connecting impossible distances.
        </p>

        <div style={{ position: "relative", border: "1px solid rgba(110,106,240,0.12)", background: "rgba(11,16,32,0.6)", backdropFilter: "blur(12px)" }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: 360, display: "block", cursor: "none" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const mx = (e.clientX - rect.left) / rect.width;
              const my = (e.clientY - rect.top) / rect.height;
              const found = points.find((c) => Math.hypot(c.x - mx, c.y - my) < 0.06);
              setHovered(found?.id ?? null);
            }}
            onMouseLeave={() => setHovered(null)}
          />

          {hoveredCity && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-4 p-4"
              style={{
                border: `1px solid ${hoveredCity.color}30`,
                background: "rgba(11,16,32,0.9)",
                backdropFilter: "blur(12px)",
                maxWidth: 280,
              }}
            >
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 500, color: hoveredCity.color, letterSpacing: "0.12em", marginBottom: 4 }}>
                {hoveredCity.label}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(234,234,242,0.3)", letterSpacing: "0.1em", marginBottom: 8 }}>
                {hoveredCity.sub}
              </div>
              {hoveredCity.mood && (
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: hoveredCity.color, letterSpacing: "0.12em", marginBottom: 8 }}>
                  {hoveredCity.mood.toUpperCase()} SIGNAL
                </div>
              )}
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 300, color: "rgba(234,234,242,0.52)", lineHeight: 1.85, letterSpacing: "0.01em" }}>
                {hoveredCity.desc}
              </div>
              {hoveredCity.memory && (
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontStyle: "italic", color: "rgba(234,234,242,0.65)", marginTop: 10, lineHeight: 1.7 }}>
                  {hoveredCity.memory}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {points.map((c) => (
            <div key={c.id} className="flex items-center gap-2.5">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, boxShadow: `0 0 8px ${c.color}60` }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(234,234,242,0.35)", letterSpacing: "0.15em" }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
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
