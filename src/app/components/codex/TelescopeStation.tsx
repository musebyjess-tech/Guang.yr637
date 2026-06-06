import { motion } from "motion/react";

export function TelescopeStation({
  onClick,
  launching,
}: {
  onClick: () => void;
  launching: boolean;
}) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ bottom: "6%", zIndex: 20, width: 200, height: 160 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            bottom: 20 + i * 8,
            width: 60 + i * 40,
            height: 60 + i * 40,
            border: `1px solid rgba(180,178,240,${0.12 - i * 0.03})`,
          }}
          animate={{ scale: [1, 1.15 + i * 0.08, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 2.5 + i * 0.6, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
        />
      ))}

      <motion.button
        type="button"
        onClick={onClick}
        className="relative border-none bg-transparent w-full h-full"
        style={{ cursor: "none" }}
        animate={launching ? { y: [0, -6, 0], rotate: [0, -2, 0] } : {}}
        transition={{ duration: 0.6 }}
        whileHover={{ filter: "brightness(1.15)" }}
      >
        <svg viewBox="0 0 200 160" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9A227" />
              <stop offset="50%" stopColor="#8B6914" />
              <stop offset="100%" stopColor="#5C4510" />
            </linearGradient>
            <linearGradient id="brassShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,230,150,0.5)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
          {/* Tripod */}
          <line x1="100" y1="130" x2="55" y2="155" stroke="url(#brass)" strokeWidth="3" strokeLinecap="round" />
          <line x1="100" y1="130" x2="145" y2="155" stroke="url(#brass)" strokeWidth="3" strokeLinecap="round" />
          <line x1="100" y1="130" x2="100" y2="158" stroke="url(#brass)" strokeWidth="3" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="100" cy="95" rx="28" ry="22" fill="url(#brass)" />
          <ellipse cx="100" cy="88" rx="22" ry="14" fill="url(#brassShine)" opacity="0.6" />
          {/* Tube */}
          <rect x="118" y="72" width="62" height="18" rx="4" fill="url(#brass)" transform="rotate(-22 118 72)" />
          <rect x="168" y="48" width="22" height="14" rx="3" fill="#3a3020" transform="rotate(-22 168 48)" />
          <circle cx="178" cy="42" r="6" fill="rgba(20,20,30,0.9)" transform="rotate(-22 178 42)" />
          {/* Eyepiece */}
          <rect x="78" y="108" width="12" height="20" rx="3" fill="url(#brass)" />
        </svg>
      </motion.button>

      <div
        className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
        style={{
          bottom: -4,
          fontFamily: "'Space Mono', monospace",
          fontSize: 7,
          letterSpacing: "0.22em",
          color: "rgba(180,178,240,0.35)",
        }}
      >
        TELESCOPE SIGNAL STATION
      </div>
    </div>
  );
}
