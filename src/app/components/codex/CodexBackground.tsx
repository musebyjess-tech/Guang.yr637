import { useEffect, useRef } from "react";

export function CodexBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.3 + Math.random() * 1.2,
      a: 0.08 + Math.random() * 0.45,
      tw: 0.0003 + Math.random() * 0.0008,
      ph: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let raf = 0;

    const draw = () => {
      frame++;
      const W = canvas.width;
      const H = canvas.height;
      const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.5, W * 0.85);
      // 和其他页面统一的基础色
ctx.fillStyle = "#0B1020";
ctx.fillRect(0, 0, W, H);

// 左上角紫色星云
const g1 = ctx.createRadialGradient(W * 0.2, H * 0.25, 0, W * 0.2, H * 0.25, W * 0.45);
g1.addColorStop(0, "rgba(88,72,200,0.12)");
g1.addColorStop(0.5, "rgba(68,52,160,0.05)");
g1.addColorStop(1, "rgba(0,0,0,0)");
ctx.fillStyle = g1;
ctx.fillRect(0, 0, W, H);

// 右侧粉色星云
const g2 = ctx.createRadialGradient(W * 0.8, H * 0.4, 0, W * 0.8, H * 0.4, W * 0.38);
g2.addColorStop(0, "rgba(180,100,180,0.09)");
g2.addColorStop(0.5, "rgba(140,80,160,0.04)");
g2.addColorStop(1, "rgba(0,0,0,0)");
ctx.fillStyle = g2;
ctx.fillRect(0, 0, W, H);

// 中间银河带
const milky = ctx.createLinearGradient(0, H * 0.1, W, H * 0.55);
milky.addColorStop(0, "rgba(0,0,0,0)");
milky.addColorStop(0.45, "rgba(90,80,160,0.08)");
milky.addColorStop(0.55, "rgba(120,100,200,0.10)");
milky.addColorStop(1, "rgba(0,0,0,0)");
ctx.fillStyle = milky;
ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        const tw = s.a * (0.55 + 0.45 * Math.sin(frame * s.tw + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,215,235,${tw})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
