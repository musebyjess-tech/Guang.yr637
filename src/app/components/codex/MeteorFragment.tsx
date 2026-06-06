import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { CodexFragment } from "./codexFragments";
import { ConstellationTrail } from "./ConstellationTrail";

export function MeteorFragment({ fragment }: { fragment: CodexFragment }) {
  const [hovered, setHovered] = useState(false);
  const isLeft = fragment.side === "left";

  return (
    <div
      className="absolute"
      style={{
        left: isLeft ? "5%" : "auto",
        right: isLeft ? "auto" : "5%",
        top: `${fragment.y * 100}%`,
        transform: "translateY(-50%)",
        zIndex: 10,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`flex items-center gap-3 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
        <ConstellationTrail
          char={fragment.constellation}
          bright={hovered}
          driftPhase={fragment.id * 0.7}
        />
        <AnimatePresence>
          {hovered && (
            <motion.p
              initial={{ opacity: 0, x: isLeft ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLeft ? -6 : 6 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none"
              style={{
                maxWidth: 200,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(13px, 1.4vw, 16px)",
                fontStyle: "italic",
                fontWeight: 300,
                color: fragment.id === 23 ? "rgba(246,183,210,0.85)" : "rgba(234,234,242,0.72)",
                lineHeight: 1.55,
                textAlign: isLeft ? "left" : "right",
              }}
            >
              {fragment.signal === "∞" ? "The final signal cannot be described." : `"${fragment.signal}"`}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
