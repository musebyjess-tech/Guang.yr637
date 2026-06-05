import { useEffect, useRef } from "react";

interface InfinityGlyphProps {
  /** Cap height of surrounding text in px — the glyph sizes itself to match */
  capHeight: number;
}

/**
 * The ∞ rendered as a living orbital system.
 * A lemniscate of Bernoulli with two particles orbiting in opposite directions.
 * The character itself is drawn on canvas so its path and the orbit are one object.
 */
export function InfinityGlyph({ capHeight }: InfinityGlyphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);

  // Geometry — the lemniscate fits inside the cap height
  const H  = capHeight;
  const W  = H * 2.1;
  const cx = W / 2;
  const cy = H / 2;
  // Lemniscate parameter: half the full height = a√2
  const a  = (H * 0.38);

  // Parametric lemniscate of Bernoulli
  // x(t) = a√2·cos(t) / (sin²(t)+1)
  // y(t) = a√2·sin(t)cos(t) / (sin²(t)+1)
  const lemniscate = (t: number) => {
    const s = Math.sin(t), c = Math.cos(t);
    const d = s * s + 1;
    return {
      x: cx + (a * Math.SQRT2 * c) / d,
      y: cy + (a * Math.SQRT2 * s * c) / d,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    // Pre-sample the path for rendering
    const STEPS = 300;
    const pathPts = Array.from({ length: STEPS + 1 }, (_, i) =>
      lemniscate((i / STEPS) * Math.PI * 2)
    );

    let frame = 0;

    const draw = () => {
      frame++;
      const t = frame * 0.018; // orbital speed
      ctx.clearRect(0, 0, W, H);

      // ── Halo glow behind the glyph ──────────────────────────────────────
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.9);
      halo.addColorStop(0, "rgba(110,106,240,0.10)");
      halo.addColorStop(0.4, "rgba(110,106,240,0.05)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);

      // ── Lemniscate stroke — drawn as gradient segments ───────────────────
      // Two passes: soft underlay then sharp line
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        pathPts.forEach(({ x, y }, i) =>
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        );
        ctx.closePath();
        if (pass === 0) {
          ctx.strokeStyle = "rgba(110,106,240,0.18)";
          ctx.lineWidth   = 4;
          ctx.filter      = "blur(3px)";
        } else {
          ctx.strokeStyle = "rgba(180,178,240,0.35)";
          ctx.lineWidth   = 0.75;
          ctx.filter      = "none";
        }
        ctx.stroke();
      }
      ctx.filter = "none";

      // ── The ∞ letterform (drawn on top of the path) ──────────────────────
      ctx.save();
      ctx.font = `300 ${H * 0.95}px 'Cormorant Garamond', serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      // Gradient fill: violet → rose → gold
      const grad = ctx.createLinearGradient(0, cy - H * 0.4, W, cy + H * 0.4);
      grad.addColorStop(0,   "rgba(110,106,240,0.9)");
      grad.addColorStop(0.45,"rgba(246,183,210,0.85)");
      grad.addColorStop(1,   "rgba(255,211,107,0.9)");
      ctx.fillStyle = grad;

      // Soft glow on the letter
      ctx.shadowColor = "rgba(110,106,240,0.55)";
      ctx.shadowBlur  = H * 0.35;
      ctx.fillText("∞", cx, cy * 1.02);
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Orbital particles ────────────────────────────────────────────────
      const p1 = lemniscate(t);
      const p2 = lemniscate(t + Math.PI); // 180° offset

      const particles: Array<{ pt: typeof p1; color: string; glow: string }> = [
        { pt: p1, color: "#FFD36B", glow: "rgba(255,211,107,0.9)" },
        { pt: p2, color: "#B4B2F0", glow: "rgba(180,178,240,0.9)" },
      ];

      for (const { pt, color, glow } of particles) {
        // Soft glow aura
        const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, H * 0.12);
        g.addColorStop(0, glow);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, H * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, H * 0.022, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      // ── Crosshair at center ──────────────────────────────────────────────
      const ch = H * 0.06;
      ctx.strokeStyle = "rgba(255,231,163,0.2)";
      ctx.lineWidth   = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - ch, cy); ctx.lineTo(cx + ch, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - ch); ctx.lineTo(cx, cy + ch); ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [H, W, cx, cy, a]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width:  W,
        height: H,
        display: "inline-block",
        verticalAlign: "middle",
        // slight upward nudge so the glyph sits on the same optical baseline as the text
        marginBottom: H * 0.05,
      }}
      aria-label="∞"
    />
  );
}
