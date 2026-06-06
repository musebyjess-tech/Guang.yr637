import { motion } from "motion/react";
import type { CodexMessage } from "../../lib/codexMessages";

export function CodexStar({
  message,
  onHover,
  onLeave,
  onClick,
  hovered,
}: {
  message: CodexMessage;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  hovered: boolean;
}) {
  const isImage = message.type === "image";
  const isVoice = message.type === "voice";
  const size = isImage ? 14 : isVoice ? 12 : 10;

  return (
    <motion.button
      type="button"
      className="absolute border-none bg-transparent p-0"
      style={{
        left: `${message.star_x * 100}%`,
        top: `${message.star_y * 100}%`,
        transform: "translate(-50%, -50%)",
        cursor: "none",
        zIndex: 15,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {isVoice ? (
        <motion.span
          animate={{ scale: [2, 2.8, 2.2], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            display: "block",
            fontSize: size,
            color: message.color,
            textShadow: `0 0 ${hovered ? 18 : 10}px ${message.color}`,
            filter: hovered ? "brightness(1.2)" : "none",
          }}
        >
          ✦
        </motion.span>
      ) : (
        <motion.span
          animate={{ opacity: [0.65, 1, 0.65], scale: isImage ? [1, 1.12, 1] : [1, 1.08, 1] }}
          transition={{ duration: isImage ? 3 : 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            display: "block",
            fontSize: size,
            color: message.color,
            textShadow: `0 0 ${hovered ? 20 : 12}px ${message.color}88`,
            filter: hovered ? "brightness(1.25)" : "none",
          }}
        >
          ✦
        </motion.span>
      )}

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
          style={{
            top: "100%",
            marginTop: 6,
            fontFamily: "'Space Mono', monospace",
            fontSize: 7,
            letterSpacing: "0.12em",
            color: "rgba(234,234,242,0.55)",
          }}
        >
          {message.sender_name} · {new Date(message.timestamp).toLocaleDateString()}
        </motion.div>
      )}
    </motion.button>
  );
}
