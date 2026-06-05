import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  color: string;
  phase: number;
}

const COLORS = [
  "rgba(234,234,242,",  // moon silver
  "rgba(255,231,163,",  // starlight gold
  "rgba(247,244,239,",  // marble white
  "rgba(180,178,240,",  // soft violet
];

export function StarParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      build();
    };

    const build = () => {
      const count = Math.floor((canvas.width * canvas.height) / 4000);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.05,
        r: Math.random() * 1.4 + 0.2,
        opacity: Math.random() * 0.7 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const twinkle = p.opacity * (0.5 + 0.5 * Math.sin(t * 0.8 + p.phase));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${twinkle})`;
        ctx.fill();

        if (p.r > 0.9) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          glow.addColorStop(0, `${p.color}${twinkle * 0.3})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
      }

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
      className="fixed inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
}
