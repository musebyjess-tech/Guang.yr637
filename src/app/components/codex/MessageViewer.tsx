import { motion } from "motion/react";
import type { CodexMessage } from "../../lib/codexMessages";

export function MessageViewer({ message, onClose }: { message: CodexMessage; onClose: () => void }) {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(2,4,10,0.75)", backdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed z-50"
        style={{
          left: "50%",
          top: "50%",
          width: "min(440px, 90vw)",
          maxHeight: "80vh",
          overflowY: "auto",
          background: "rgba(6,8,18,0.97)",
          border: `1px solid ${message.color}44`,
          borderRadius: 14,
          padding: "28px 24px",
          boxShadow: `0 0 48px ${message.color}22`,
        }}
        initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "-48%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.94, x: "-50%", y: "-48%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ color: message.color, fontSize: 20, marginBottom: 12 }}>✦</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: message.color, letterSpacing: "0.1em", marginBottom: 4 }}>
          {message.sender_name}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(234,234,242,0.35)", letterSpacing: "0.12em", marginBottom: 20 }}>
          {new Date(message.timestamp).toLocaleString()} · {message.type.toUpperCase()}
        </div>

        {message.type === "text" && (
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: "italic", color: "rgba(234,234,242,0.8)", lineHeight: 1.75 }}>
            {message.content}
          </p>
        )}
        {message.type === "image" && (
          <img src={message.content} alt="" style={{ width: "100%", borderRadius: 8, border: `1px solid ${message.color}33` }} />
        )}
        {message.type === "voice" && (
          <audio controls src={message.content} style={{ width: "100%" }} />
        )}
      </motion.div>
    </>
  );
}
