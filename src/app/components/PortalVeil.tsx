import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EntryText } from "./EntryText";
import { FrequencyLine } from "./FrequencyLine";
import { CoordinateStamp } from "./CoordinateStamp";

interface PortalVeilProps {
  onEnter: () => void;
}

export function PortalVeil({ onEnter }: PortalVeilProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 1600);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="portal"
          className="fixed inset-0 z-30 flex flex-col items-center justify-center"
          style={{ background: "rgb(2, 3, 8)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Radial depth glow behind title */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(30, 50, 100, 0.18) 0%, transparent 70%)",
            }}
          />

          {/* Top-left corner: frequency label */}
          <motion.div
            className="absolute top-8 left-8 flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 2.8 }}
          >
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.25em",
                color: "rgba(160, 200, 255, 0.3)",
              }}
            >
              SIGNAL RECEIVED
            </div>
            <FrequencyLine width={180} color="rgba(120, 170, 255, 0.5)" />
          </motion.div>

          {/* Top-right corner: coordinate stamp */}
          <motion.div
            className="absolute top-8 right-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.6 }}
          >
            <CoordinateStamp />
          </motion.div>

          {/* Center: main title */}
          <div className="relative flex flex-col items-center">
            <EntryText />

            {/* Frequency line under title */}
            <motion.div
              className="mt-10 flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 2.6 }}
            >
              <FrequencyLine width={260} color="rgba(140, 185, 255, 0.45)" />
            </motion.div>

            {/* CTA */}
            <motion.button
              onClick={handleEnter}
              className="relative mt-10 group"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 3.2, ease: "easeOut" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ background: "none", border: "none", cursor: "none", padding: 0 }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.4em",
                  color: "rgba(200, 220, 255, 0.55)",
                  display: "block",
                  paddingBottom: 10,
                  transition: "color 0.4s ease",
                }}
                className="group-hover:text-white"
              >
                ENTER THE ATLAS
              </span>
              {/* Underline that blooms on hover */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: "rgba(140, 185, 255, 0.25)" }}
              />
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(160, 200, 255, 0.8), transparent)",
                }}
              />
            </motion.button>
          </div>

          {/* Bottom bar */}
          <motion.div
            className="absolute bottom-8 left-0 right-0 flex justify-between items-end px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 3.6 }}
          >
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "rgba(160, 200, 255, 0.2)",
              }}
            >
              © LIGHT-YEAR ATLAS — ALL TRANSMISSIONS RESERVED
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "rgba(160, 200, 255, 0.2)",
              }}
            >
              NODE · GUANG
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
