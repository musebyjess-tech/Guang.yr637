import { useMemo } from "react";
import { motion } from "motion/react";

export type FragColor = { color: string; name: "gold" | "pink" | "violet" };

function Sparkle({ dx, dy, color, delay, size }: { dx: number; dy: number; color: string; delay: number; size: number }) {
  // 计算旋转角度：根据位移方向决定，让粒子飞散时带有螺旋感
  const rotateAngle = (Math.atan2(dy, dx) * 180) / Math.PI + (Math.random() * 180 - 90);
  return (
    <motion.div
      initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 0],
        x: dx,
        y: dy,
        scale: [0, 1.2, 0],
        rotate: [0, rotateAngle * 1.5, rotateAngle * 3],
      }}
      transition={{
        duration: 1.4,
        delay,
        ease: "easeOut",
        rotate: { duration: 1.2, delay, ease: "easeOut" },
      }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    />
  );
}

function genSparkles(isSpecial: boolean, fc: FragColor) {
  const n = isSpecial ? 36 : 18;
  const baseColors = {
    gold: ["#FFD36B", "#FFF8C0", "#ffffff"],
    pink: ["#F6B7D2", "#FFD0E6", "#ffffff"],
    violet: ["#9B8FFF", "#D0CCFF", "#ffffff"],
  }[fc.name];
  const colors = isSpecial ? ["#FFD36B", "#FFF8C0", "#F6B7D2", "#ffffff", "#9B8FFF"] : baseColors;
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const dist = isSpecial ? 70 + Math.random() * 100 : 45 + Math.random() * 70;
    // 让粒子延迟范围略微覆盖 0，但气泡会稍晚出现，实现粒子先爆发
    const delay = Math.random() * (isSpecial ? 0.7 : 0.45);
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay,
      size: isSpecial ? 4 + Math.random() * 6 : 2.5 + Math.random() * 3.5,
    };
  });
}

const BORDER = {
  gold: "rgba(255,211,107,0.42)",
  pink: "rgba(246,183,210,0.38)",
  violet: "rgba(155,143,255,0.38)",
};

const GLOW = {
  gold: "rgba(255,211,107,0.22)",
  pink: "rgba(246,183,210,0.18)",
  violet: "rgba(155,143,255,0.2)",
};

export function CosmicMessageBubble({
  message,
  isSpecial,
  fragColor,
  onClose,
}: {
  message: string;
  isSpecial: boolean;
  fragColor: FragColor;
  onClose: () => void;
}) {
  const sparkles = useMemo(() => genSparkles(isSpecial, fragColor), [isSpecial, fragColor]);
  const borderColor = isSpecial ? "rgba(255,211,107,0.45)" : BORDER[fragColor.name];
  const glowColor = isSpecial ? "rgba(255,211,107,0.28)" : GLOW[fragColor.name];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          background: "rgba(4,3,14,0.55)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 301,
          pointerEvents: "none",
        }}
      >
        {sparkles.map((s, i) => (
          <Sparkle key={i} {...s} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "calc(-50% + 14px)" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.92, x: "-50%", y: "calc(-50% + 10px)" }}
        transition={{
          duration: 0.55,
          delay: 0.12,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          zIndex: 302,
          width: isSpecial ? "min(480px, 92vw)" : "min(420px, 90vw)",
          padding: isSpecial ? "42px 36px 36px" : "34px 30px 30px",
          borderRadius: 22,
          textAlign: "center",
          pointerEvents: "auto",
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 42%, rgba(12,10,32,0.55) 100%)",
          backdropFilter: "blur(40px) saturate(1.35)",
          WebkitBackdropFilter: "blur(40px) saturate(1.35)",
          border: `1px solid ${borderColor}`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 48px ${glowColor}, 0 24px 72px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.35)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 23,
            padding: 1,
            background: `linear-gradient(135deg, ${borderColor}, transparent 55%, ${borderColor})`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
            opacity: 0.65,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: "12%",
            right: "12%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
          }}
        />

        {isSpecial && (
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.14, 1] }}
            transition={{
              rotate: { duration: 18, repeat: Infinity, ease: "linear" },
              scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              fontSize: 22,
              marginBottom: 18,
              color: "rgba(255,211,107,0.92)",
              textShadow: "0 0 24px rgba(255,211,107,0.45)",
            }}
          >
            ✦
          </motion.div>
        )}

        <div
          style={{
            fontFamily: isSpecial ? "'Noto Serif SC', serif" : "'Cormorant Garamond', serif",
            fontSize: isSpecial ? "clamp(20px, 3.4vw, 28px)" : "clamp(16px, 3vw, 16px)",
            fontStyle:  isSpecial ? "italic" : "normal",
            fontWeight: isSpecial ? 300 : 400,
            color: isSpecial ? "rgba(255,231,163,0.94)" : "rgba(234,234,242,0.86)",
            lineHeight: isSpecial ? 1.6 : 2,
            letterSpacing: "0.02em" ,
            whiteSpace: "pre-line",
            textShadow: isSpecial ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
          }}
        >
          {message}
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            letterSpacing: "0.28em",
            color: "rgba(180,178,240,0.32)",
          }}
        >
          TAP OUTSIDE TO CLOSE
        </div>
      </motion.div>
    </>
  );
}