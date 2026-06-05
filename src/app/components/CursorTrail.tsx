import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface TrailDot {
  id: number;
  x: number;
  y: number;
}

export function CursorTrail() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setPos({ x, y });

      idRef.current += 1;
      const id = idRef.current;
      setTrail((prev) => [...prev.slice(-10), { id, x, y }]);
      setTimeout(() => {
        setTrail((prev) => prev.filter((d) => d.id !== id));
      }, 600);
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setIsHovering(
        el.tagName === "BUTTON" || el.tagName === "A" || el.closest("button") !== null
      );
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      {/* Trail dots */}
      <AnimatePresence>
        {trail.map((dot, i) => (
          <motion.div
            key={dot.id}
            className="fixed pointer-events-none z-[60] rounded-full"
            style={{
              left: dot.x,
              top: dot.y,
              width: 4 + i * 0.3,
              height: 4 + i * 0.3,
              background: `rgba(180, 210, 255, ${0.08 + i * 0.04})`,
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 ${4 + i}px rgba(140, 180, 255, 0.3)`,
            }}
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-[61]"
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.3 }}
        style={{ translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          className="rounded-full border border-white/30 flex items-center justify-center"
          animate={{
            width: isHovering ? 40 : 12,
            height: isHovering ? 40 : 12,
            borderColor: isHovering ? "rgba(180,210,255,0.6)" : "rgba(255,255,255,0.3)",
            boxShadow: isHovering
              ? "0 0 16px rgba(140,180,255,0.4)"
              : "0 0 6px rgba(255,255,255,0.15)",
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <motion.div
            className="rounded-full bg-white"
            animate={{ width: isHovering ? 4 : 3, height: isHovering ? 4 : 3, opacity: isHovering ? 0.6 : 1 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
