import { useEffect, useRef } from "react";

interface FrequencyLineProps {
  width?: number;
  color?: string;
  opacity?: number;
}

export function FrequencyLine({
  width = 320,
  color = "rgba(160, 200, 255, 0.7)",
  opacity = 1,
}: FrequencyLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const h = 48;
    canvas.width = width;
    canvas.height = h;

    let t = 0;

    const draw = () => {
      t += 0.018;
      ctx.clearRect(0, 0, width, h);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = opacity;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(140, 190, 255, 0.5)";

      for (let x = 0; x < width; x++) {
        const progress = x / width;

        // composite waveform — multiple harmonics
        const y =
          h / 2 +
          Math.sin(progress * 18 + t * 2.2) * 6 * Math.sin(progress * Math.PI) +
          Math.sin(progress * 34 + t * 3.1) * 2.5 * Math.sin(progress * Math.PI) +
          Math.sin(progress * 7  + t * 1.1) * 4 * Math.sin(progress * Math.PI) +
          // random-ish micro-jitter for signal texture
          Math.sin(progress * 80 + t * 5) * 0.8;

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.stroke();
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [width, color, opacity]);

  return <canvas ref={canvasRef} style={{ width, height: 48, display: "block" }} />;
}
