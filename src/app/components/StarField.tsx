import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  speed: number;
  phase: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildStars();
    };

    const buildStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 3000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.1,
        opacity: Math.random() * 0.7 + 0.1,
        speed: Math.random() * 0.003 + 0.001,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of starsRef.current) {
        const pulse = Math.sin(t * star.speed * 60 + star.phase);
        const o = star.opacity * (0.6 + 0.4 * pulse);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);

        // slight blue-white color variation
        const warm = Math.random() > 0.85;
        ctx.fillStyle = warm
          ? `rgba(255, 230, 200, ${o})`
          : `rgba(200, 215, 255, ${o})`;
        ctx.fill();

        // glow for larger stars
        if (star.r > 0.8) {
          const glow = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.r * 4
          );
          glow.addColorStop(0, `rgba(200, 220, 255, ${o * 0.4})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 4, 0, Math.PI * 2);
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
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
