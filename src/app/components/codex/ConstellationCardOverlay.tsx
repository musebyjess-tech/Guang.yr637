import { motion, AnimatePresence } from "motion/react";
import type { ConstellationFragment } from "./constellationFragments";

interface ConstellationCardOverlayProps {
  fragment: ConstellationFragment | null;
  onClose: () => void;
}

export function ConstellationCardOverlay({ fragment, onClose }: ConstellationCardOverlayProps) {
  if (!fragment) return null;

  return (
    <AnimatePresence>
      {fragment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-slate-950 to-slate-900 rounded-lg border"
            style={{
              borderColor: "rgba(180,178,240,0.25)",
              maxWidth: "500px",
              padding: "32px",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "rgba(180,178,240,0.55)",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {fragment.title}
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  fontStyle: "italic",
                  color: "rgba(234,234,242,0.9)",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {fragment.signal}
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 15,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "rgba(180,178,240,0.65)",
                  lineHeight: 1.8,
                }}
              >
                {fragment.expanded}
              </p>
            </div>
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 32,
                  color: "rgba(180,178,240,0.4)",
                }}
              >
                {fragment.constellation}
              </p>
            </div>
            <motion.button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(180,178,240,0.5)",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              ✕
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
