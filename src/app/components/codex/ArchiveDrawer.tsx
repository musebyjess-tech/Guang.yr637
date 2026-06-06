import { motion, AnimatePresence } from "motion/react";
import type { CodexMessage } from "../../lib/codexMessages";

export function ArchiveDrawer({
  open,
  onClose,
  messages,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  messages: CodexMessage[];
  onSelect: (m: CodexMessage) => void;
}) {
  const sorted = [...messages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-30"
            style={{ background: "rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed z-40 overflow-y-auto"
            style={{
              right: 0,
              top: 0,
              bottom: 0,
              width: "min(320px, 88vw)",
              background: "rgba(4,6,14,0.97)",
              borderLeft: "1px solid rgba(110,106,240,0.15)",
              padding: "24px 20px",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="flex justify-between items-center mb-5">
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.2em", color: "rgba(180,178,240,0.5)" }}>
                SIGNAL ARCHIVE · {messages.length}
              </span>
              <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "rgba(234,234,242,0.35)", cursor: "none", fontSize: 18 }}>×</button>
            </div>

            <div className="flex flex-col gap-2">
              {sorted.length === 0 ? (
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(234,234,242,0.25)", letterSpacing: "0.15em" }}>
                  NO SIGNALS YET
                </p>
              ) : (
                sorted.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { onSelect(m); onClose(); }}
                    className="text-left w-full"
                    style={{
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${m.color}22`,
                      borderRadius: 6,
                      cursor: "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: m.color, fontSize: 12 }}>✦</span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: m.color, letterSpacing: "0.08em" }}>
                        {m.sender_name}
                      </span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 6, color: "rgba(234,234,242,0.3)", marginLeft: "auto" }}>
                        {m.type.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontStyle: "italic", color: "rgba(234,234,242,0.55)", lineHeight: 1.5 }}>
                      {m.type === "text" ? m.content.slice(0, 60) + (m.content.length > 60 ? "…" : "") : `${m.type} signal`}
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 6, color: "rgba(234,234,242,0.2)", marginTop: 6 }}>
                      {new Date(m.timestamp).toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
