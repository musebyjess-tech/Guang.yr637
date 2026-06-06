import { motion } from "motion/react";

interface OrbitalRingProps {
  containerWidth: number;
  containerHeight: number;
}

export function OrbitalRing({ containerWidth, containerHeight }: OrbitalRingProps) {
  const centerX = containerWidth * 0.5;
  const centerY = containerHeight * 0.48;
  const rx = containerWidth * 0.5;
  const ry = containerHeight * 0.45;

// 计算12个碎片的坐标
  const points = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + rx * Math.cos(angle),
      y: centerY + ry * Math.sin(angle),
    };
  });

  // 首尾相连
  const polylinePoints = [...points, points[0]]
    .map(p => `${p.x},${p.y}`)
    .join(" ");

  if (!containerWidth || !containerHeight) return null;

  return (
    <motion.svg
      className="absolute pointer-events-none"
      style={{ inset: 0, width: "100%", height: "100%", zIndex: 1 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
    >
      <defs>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 椭圆轨道虚线 */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={rx}
        ry={ry}
        fill="none"
        stroke="rgba(180, 178, 240, 0.07)"
        strokeWidth="0.7"
        strokeDasharray="4 4"
      />

      {/* 每个节点上的小光点 */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={1.5}
          fill="rgba(180,178,240,0.35)"
          filter="url(#lineGlow)"
        />
      ))}
    </motion.svg>
  );
}