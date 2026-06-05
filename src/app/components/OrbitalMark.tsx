import { useEffect, useRef } from "react";

interface OrbitalMarkProps {
  width?: number;
  height?: number;
  speed?: number;
}

/**
 * Brand mark — lemniscate of Bernoulli as an orbital figure-8.
 * Constructed entirely from parametric geometry and canvas particles.
 * No text characters are used.
 *
 * Lemniscate:  x(t) = a√2·cos(t) / (sin²t + 1)
 *              y(t) = a√2·sin(t)cos(t) / (sin²t + 1)
 *
 * Natural aspect ratio of the lemniscate is exactly 2:1 (width:height).
 * Canvas aspect ratio is set to 2.28:1, giving ~15% visual padding per side.
 *
 * Geometry at a = height × 0.60:
 *   loop width  = a√2 × 2 ≈ 1.70 × height  (74% of canvas width)
 *   loop height = a√2     ≈ 0.85 × height  (85% of canvas height)
 */
export function OrbitalMark({ width = 200, height = 88, speed = 1 }: OrbitalMarkProps) {
  const ref    = useRef<HTMLCanvasElement>(null);
  const animId = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(width  * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = width  / 2;
    const cy = height / 2;

    // a chosen so the lemniscate fills ~85% of canvas height.
    // With a = h×0.60: loop height = a√2 = h×0.848.
    const a = height * 0.60;

    // Lemniscate parametric — returns canvas coordinates
    const L = (t: number) => {
      const s = Math.sin(t), c = Math.cos(t), d = s * s + 1;
      return {
        x: cx + (a * Math.SQRT2 * c) / d,
        y: cy + (a * Math.SQRT2 * s * c) / d,
      };
    };

    // Pre-sample the two loops
    const N = 300;

    // Left loop:  t ∈ [π/2, 3π/2]
    const left  = Array.from({ length: N + 1 }, (_, i) =>
      L(Math.PI / 2 + (i / N) * Math.PI)
    );
    // Right loop: t ∈ [−π/2, π/2]  (= [3π/2, 5π/2] but normalised)
    const right = Array.from({ length: N + 1 }, (_, i) =>
      L(-Math.PI / 2 + (i / N) * Math.PI)
    );

    // Proportional sizes
    const lw     = Math.max(0.7, height * 0.009);   // main stroke
    const glowW  = Math.max(4,   height * 0.06);    // glow stroke width
    const glowB  = Math.max(3,   height * 0.05);    // blur radius
    const nodeR  = Math.max(1.6, height * 0.025);   // centre node core
    const partR  = (s: number) => Math.max(1, height * s);

    // How many samples around the crossing to erase/redraw for the
    // "right loop passes over left loop" crossing illusion.
    const CROSS_HALF = Math.round(N * 0.08);

    const erasePts = Array.from({ length: CROSS_HALF * 2 + 1 }, (_, i) => {
      const frac = (N / 2 - CROSS_HALF + i) / N;
      return L(-Math.PI / 2 + frac * Math.PI);
    });

    let frame = 0;

    const drawPath = (
      pts: { x: number; y: number }[],
      strokeColor: string,
      glowColor: string
    ) => {
      // Glow pass
      ctx.save();
      ctx.filter = `blur(${glowB}px)`;
      ctx.beginPath();
      pts.forEach(({ x, y }, i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.strokeStyle = glowColor;
      ctx.lineWidth   = glowW;
      ctx.stroke();
      ctx.restore();

      // Crisp line pass
      ctx.beginPath();
      pts.forEach(({ x, y }, i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth   = lw;
      ctx.stroke();
    };

    const tick = () => {
      frame++;
      const t = frame * 0.013 * speed;
      ctx.clearRect(0, 0, width, height);

      // ── Background aura ────────────────────────────────────────────────────
      {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, height * 0.9);
        g.addColorStop(0,   "rgba(110,106,240,0.12)");
        g.addColorStop(0.5, "rgba(110,106,240,0.04)");
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      // ── Reference ellipse (field boundary) ────────────────────────────────
      ctx.save();
      ctx.setLineDash([Math.max(1.5, height * 0.018), Math.max(5, height * 0.065)]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, width * 0.44, height * 0.40, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(110,106,240,0.08)";
      ctx.lineWidth   = 0.4;
      ctx.stroke();
      ctx.restore();

      // ── Equator / meridian (faint reference lines) ─────────────────────────
      for (const [x1, y1, x2, y2] of [
        [cx - width * 0.40, cy, cx + width * 0.40, cy],
        [cx, cy - height * 0.38, cx, cy + height * 0.38],
      ] as [number, number, number, number][]) {
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = "rgba(234,234,242,0.035)";
        ctx.lineWidth   = 0.4;
        ctx.stroke();
      }

      // ── LEFT loop — draws "under" ──────────────────────────────────────────
      drawPath(left, "rgba(152,150,232,0.55)", "rgba(110,106,240,0.22)");

      // ── RIGHT loop — draws "over" ──────────────────────────────────────────
      drawPath(right, "rgba(210,186,218,0.48)", "rgba(246,183,210,0.16)");

      // ── Crossing illusion: erase then redraw right loop at crossover ───────
      {
        // Erase strip (background fill)
        ctx.save();
        ctx.beginPath();
        erasePts.forEach(({ x, y }, i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.strokeStyle = "#0B1020";
        ctx.lineWidth   = glowW * 1.1;
        ctx.stroke();
        ctx.restore();

        // Redraw right-loop crossing segment on top
        ctx.save();
        ctx.filter = `blur(${glowB * 0.7}px)`;
        ctx.beginPath();
        erasePts.forEach(({ x, y }, i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.strokeStyle = "rgba(246,183,210,0.20)";
        ctx.lineWidth   = glowW;
        ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        erasePts.forEach(({ x, y }, i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.strokeStyle = "rgba(210,186,218,0.55)";
        ctx.lineWidth   = lw;
        ctx.stroke();
      }

      // ── Tick marks at orbital key-angles ──────────────────────────────────
      for (const ta of [0, Math.PI, Math.PI * 0.5, Math.PI * 1.5]) {
        const p = L(ta), pN = L(ta + 0.05), pP = L(ta - 0.05);
        const tx = pN.x - pP.x, ty = pN.y - pP.y;
        const len = Math.sqrt(tx * tx + ty * ty) || 1;
        const nx = -ty / len, ny = tx / len;
        const tl = height * 0.055;
        ctx.beginPath();
        ctx.moveTo(p.x + nx * tl, p.y + ny * tl);
        ctx.lineTo(p.x - nx * tl, p.y - ny * tl);
        ctx.strokeStyle = "rgba(255,231,163,0.28)";
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }

      // Apoapsis dots
      for (const ta of [0, Math.PI]) {
        const p = L(ta);
        ctx.beginPath();
        ctx.arc(p.x, p.y, partR(0.018), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,231,163,0.38)";
        ctx.fill();
      }

      // ── Centre node — gravity well ─────────────────────────────────────────
      // Layered radial glows
      for (const [r, op] of [
        [height * 0.28, 0.07],
        [height * 0.14, 0.15],
        [height * 0.07, 0.32],
      ] as [number, number][]) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(255,231,163,${op})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      // Core
      ctx.beginPath();
      ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
      ctx.fillStyle   = "rgba(255,231,163,0.95)";
      ctx.shadowColor = "rgba(255,211,107,0.9)";
      ctx.shadowBlur  = nodeR * 3;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Orbital particles ──────────────────────────────────────────────────
      // Dawn Gold: forward on the figure-8
      const pA = L(t);
      // Nebula Violet: exact antipode (opposite phase)
      const pB = L(t + Math.PI);
      // Aurora Pink: slower drift
      const pC = L(t * 0.58 + 1.6);

      const particles = [
        { p: pA, core: "#FFD36B", aura: "rgba(255,211,107,0.85)", cr: partR(0.038), ar: partR(0.11) },
        { p: pB, core: "#9896E8", aura: "rgba(152,150,232,0.75)", cr: partR(0.027), ar: partR(0.08) },
        { p: pC, core: "#F6B7D2", aura: "rgba(246,183,210,0.65)", cr: partR(0.019), ar: partR(0.06) },
      ];

      for (const { p, core, aura, cr, ar } of particles) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, ar);
        g.addColorStop(0, aura);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, ar, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, cr, 0, Math.PI * 2);
        ctx.fillStyle   = core;
        ctx.shadowColor = core;
        ctx.shadowBlur  = cr * 2.5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId.current = requestAnimationFrame(tick);
    };

    animId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId.current);
  }, [width, height, speed]);

  return (
    <canvas
      ref={ref}
      style={{ width, height, display: "block" }}
      aria-label="Orbital infinity mark — Guang Year"
    />
  );
}

// ── Lightweight static SVG for the navigation bar ────────────────────────────
export function OrbitalMarkMini({ size = 14 }: { size?: number }) {
  const w  = size * 2.3;
  const h  = size;
  const cx = w  / 2;
  const cy = h  / 2;
  const rx = w  * 0.245;
  const ry = h  * 0.415;
  const id = `om${size}`;

  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#6E6AF0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#F6B7D2" stopOpacity="0.60" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#F6B7D2" stopOpacity="0.60" />
          <stop offset="100%" stopColor="#FFD36B" stopOpacity="0.75" />
        </linearGradient>
        <filter id={`${id}f`}>
          <feGaussianBlur stdDeviation="0.7" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Left ellipse */}
      <ellipse cx={cx - rx} cy={cy} rx={rx} ry={ry}
        stroke={`url(#${id}a)`} strokeWidth="0.65"
        filter={`url(#${id}f)`} />

      {/* Right ellipse — drawn on top so it crosses over */}
      <ellipse cx={cx + rx} cy={cy} rx={rx} ry={ry}
        stroke={`url(#${id}b)`} strokeWidth="0.65"
        filter={`url(#${id}f)`} />

      {/* Apoapsis dots */}
      <circle cx={cx - rx * 2} cy={cy} r={size * 0.09} fill="#9896E8" opacity="0.65"/>
      <circle cx={cx + rx * 2} cy={cy} r={size * 0.09} fill="#F6B7D2" opacity="0.65"/>

      {/* Centre gravity node */}
      <circle cx={cx} cy={cy} r={size * 0.14}
        fill="#FFD36B" opacity="0.9"
        filter={`url(#${id}f)`} />
    </svg>
  );
}
