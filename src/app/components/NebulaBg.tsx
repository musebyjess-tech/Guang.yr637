import { useEffect, useRef } from "react";

export function NebulaBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Nebula cloud nodes
    const clouds = [
      { x: 0.15, y: 0.35, rx: 0.45, ry: 0.4,  r: 110, g: 106, b: 240, a: 0.10, speed: 0.00008 },
      { x: 0.78, y: 0.20, rx: 0.38, ry: 0.32,  r: 246, g: 183, b: 210, a: 0.08, speed: 0.00006 },
      { x: 0.55, y: 0.75, rx: 0.50, ry: 0.35,  r: 110, g: 106, b: 240, a: 0.07, speed: 0.00007 },
      { x: 0.85, y: 0.65, rx: 0.30, ry: 0.28,  r: 255, g: 211, b: 107, a: 0.04, speed: 0.00009 },
      { x: 0.25, y: 0.80, rx: 0.35, ry: 0.30,  r: 246, g: 183, b: 210, a: 0.06, speed: 0.00005 },
    ];

    let t = 0;
    const draw = () => {
      t += 1;
      const w = canvas.width;
      const h = canvas.height;

      // Base deep space
      ctx.fillStyle = "#0B1020";
      ctx.fillRect(0, 0, w, h);

      // Nebula clouds
      for (const c of clouds) {
        const px = (c.x + Math.sin(t * c.speed * 0.7) * 0.04) * w;
        const py = (c.y + Math.cos(t * c.speed * 0.9) * 0.03) * h;
        const pulse = 0.85 + 0.15 * Math.sin(t * c.speed * 3);

        const g = ctx.createRadialGradient(px, py, 0, px, py, Math.min(w, h) * c.rx * pulse);
        g.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${c.a * pulse})`);
        g.addColorStop(0.4, `rgba(${c.r},${c.g},${c.b},${c.a * 0.4 * pulse})`);
        g.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.ellipse(px, py, Math.min(w, h) * c.rx * pulse, Math.min(w, h) * c.ry * pulse, 0, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Aurora horizon band — bottom
      const auroraY = h * 0.72;
      const aurora = ctx.createLinearGradient(0, auroraY, 0, h);
      const aPhase = (Math.sin(t * 0.00015) + 1) / 2;
      aurora.addColorStop(0, "rgba(0,0,0,0)");
      aurora.addColorStop(0.3, `rgba(110, 106, 240, ${0.06 + aPhase * 0.04})`);
      aurora.addColorStop(0.7, `rgba(246, 183, 210, ${0.04 + aPhase * 0.03})`);
      aurora.addColorStop(1, `rgba(255, 231, 163, ${0.02 + aPhase * 0.02})`);
      ctx.fillStyle = aurora;
      ctx.fillRect(0, auroraY, w, h - auroraY);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
