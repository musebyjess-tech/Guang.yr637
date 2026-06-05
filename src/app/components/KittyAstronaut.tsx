import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import kittyImg from "../../imports/11463fed4970251140bdbedfc5b6d018.png";

// ── Boot greeting — shown 3s after Kitty finishes its entrance ───────────────
const BOOT_MESSAGE = "Hi 小Alex ♡";

// ── Random message pool ───────────────────────────────────────────────────────
const MESSAGES = [
  "The world is your oyster and amusement park.\nMake sweet memories and have fun!",
  "How is ur day today?\n不要忘记好好休息！",
  "That brings u back to ur cherished time.",
  "Kitty Cici99 HERE ♡",
  "Signal received.\nHope today was a gentle one.",
  "Another orbit completed.\nKeep exploring.",
  "The stars look different from every city.",
  "Take your time.\nThe universe isn't going anywhere.",
  "许个愿：早点跨越时区",
];

const LATE_NIGHT_MESSAGES = [
  "Still awake?\nThe stars are too.",
  "Late night orbit.\nDon't forget to rest.",
];

// ── Message bubble ────────────────────────────────────────────────────────────
// white-space:pre on display:inline-block guarantees the element is exactly
// as wide as its longest line. \n = real line break. Zero word-wrapping.
function MessageBubble({ message }: { message: string }) {
  const [phase, setPhase] = useState<"receiving" | "typing">("receiving");
  const [typed, setTyped] = useState("");
  const tickRef           = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setPhase("receiving");
    setTyped("");
    const t = setTimeout(() => {
      setPhase("typing");
      let i = 0;
      const tick = () => {
        i++;
        setTyped(message.slice(0, i));
        if (i < message.length) tickRef.current = setTimeout(tick, 22 + Math.random() * 18);
      };
      tick();
    }, 750);
    return () => { clearTimeout(t); clearTimeout(tickRef.current); };
  }, [message]);

  const isReceiving = phase === "receiving";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ marginBottom: 10 }}
    >
      <motion.div
        animate={{ scale: [1, 1.013, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "relative",
          display: "inline-block",
          whiteSpace: "pre",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,210,225,0.28)",
          borderRadius: 14,
          padding: "8px 14px",
          fontFamily: "'Space Mono', monospace",
          fontSize: 9,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: isReceiving ? "0.06em" : "0.01em",
          fontStyle: isReceiving ? "italic" : "normal",
          color: isReceiving ? "rgba(234,234,242,0.35)" : "rgba(234,234,242,0.87)",
          boxShadow: [
            "inset 0 1px 0 rgba(255,255,255,0.10)",
            "inset 0 0 14px rgba(255,182,193,0.07)",
            "0 0 18px rgba(255,160,190,0.10)",
            "0 4px 14px rgba(0,0,0,0.16)",
          ].join(", "),
        }}
      >
        {isReceiving ? "receiving signal..." : typed}

        {/* Tail — points down toward Kitty */}
        <div style={{
          position: "absolute", top: "100%", left: 18,
          width: 0, height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: "8px solid rgba(255,210,225,0.28)",
        }} />
        <div style={{
          position: "absolute", top: "calc(100% - 1px)", left: 19,
          width: 0, height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "7px solid rgba(255,255,255,0.06)",
        }} />
      </motion.div>
    </motion.div>
  );
}

// ── Kitty avatar ──────────────────────────────────────────────────────────────
function KittyHelmet({ isHovered }: { isHovered: boolean }) {
  return (
    <motion.div
      animate={{
        filter: isHovered
          ? "drop-shadow(0 0 18px rgba(255,130,170,1.0)) drop-shadow(0 0 48px rgba(255,130,170,0.60))"
          : [
              "drop-shadow(0 0 7px rgba(255,160,190,0.60)) drop-shadow(0 0 18px rgba(255,150,185,0.28))",
              "drop-shadow(0 0 14px rgba(255,140,180,0.92)) drop-shadow(0 0 36px rgba(255,140,180,0.50))",
              "drop-shadow(0 0 7px rgba(255,160,190,0.60)) drop-shadow(0 0 18px rgba(255,150,185,0.28))",
            ],
      }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "block", lineHeight: 0 }}
    >
      <img
        src={kittyImg}
        alt="Hello Kitty Astronaut"
        style={{ width: 50, height: 50, objectFit: "contain", display: "block" }}
      />
    </motion.div>
  );
}

// ── Observatory label ─────────────────────────────────────────────────────────
function CompanionLabel() {
  return (
    <div style={{
      marginTop: 5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    }}>
      <motion.div
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 3, height: 3,
          borderRadius: "50%",
          background: "#F6B7D2",
          boxShadow: "0 0 5px rgba(246,183,210,0.9)",
          flexShrink: 0,
        }}
      />
      <span style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 7,
        letterSpacing: "0.22em",
        color: "rgba(246,183,210,0.55)",
        textTransform: "uppercase",
      }}>
        KITTY-C99
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// Sequence (aligned with HeroSection reveal):
//   T≈4.6s  archiveVisible fires in HeroSection → Kitty begins fading in
//   T≈7.0s  Kitty entrance animation complete → floating mode begins
//   T=10s   Boot greeting "Hi 小Alex ♡" (3s after floating mode)
//   T≈16s   Boot disappears → random cycle begins (10–15s intervals)
export function KittyAstronaut() {
  const [kittyVisible, setKittyVisible] = useState(false);
  const [isHovered,    setIsHovered]    = useState(false);
  const [showBubble,   setShowBubble]   = useState(false);
  const [currentMsg,   setCurrentMsg]   = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const nextTimer = useRef<ReturnType<typeof setTimeout>>();

  const pickMessage = () => {
    const hour = new Date().getHours();
    const pool  = [...MESSAGES];
    if (hour >= 2 && hour < 5) pool.push(...LATE_NIGHT_MESSAGES);
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Display a message; calls onHide() after the bubble disappears
  const displayMessage = (msg: string, onHide?: () => void) => {
    setCurrentMsg(msg);
    setShowBubble(true);
    clearTimeout(hideTimer.current);
    const duration = Math.max(5000, 750 + msg.length * 31 + 2500);
    hideTimer.current = setTimeout(() => {
      setShowBubble(false);
      if (onHide) setTimeout(onHide, 600); // brief breath before next
    }, duration);
  };

  const scheduleNext = (delayMs: number) => {
    clearTimeout(nextTimer.current);
    nextTimer.current = setTimeout(() => {
      displayMessage(pickMessage(), () => scheduleNext(10000 + Math.random() * 5000));
    }, delayMs);
  };

  useEffect(() => {
    // Archive section fires at ~4.6s in HeroSection — Kitty arrives together
    const KITTY_DELAY    = 4600;
    // Entrance animation is 2.9s → floating mode at ~7.5s → boot at ~10.5s
    const BOOT_DELAY     = KITTY_DELAY + 2900 + 3000;

    // 1. Kitty drifts in alongside the archive reveal
    const entranceTimer = setTimeout(() => setKittyVisible(true), KITTY_DELAY);

    // 2. Boot greeting 3s after Kitty finishes entering
    const bootTimer = setTimeout(() => {
      displayMessage(BOOT_MESSAGE, () => {
        // 3. Random cycle starts only after boot greeting disappears
        scheduleNext(10000 + Math.random() * 5000);
      });
    }, BOOT_DELAY);

    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(bootTimer);
      clearTimeout(hideTimer.current);
      clearTimeout(nextTimer.current);
    };
  }, []);

  return (
    <div style={{
      position: "fixed",
      bottom: 36,
      left: 36,
      zIndex: 50,
      userSelect: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    }}>
      {/* Bubble floats above Kitty in normal flex flow */}
      <AnimatePresence mode="wait">
        {showBubble && currentMsg && (
          <MessageBubble key={currentMsg + String(Date.now())} message={currentMsg} />
        )}
      </AnimatePresence>

      {/* Kitty — soft fade-in + upward drift, then continuous float */}
      <AnimatePresence>
        {kittyVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.9, ease: "easeOut" }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.06, transition: { duration: 0.4, ease: "easeOut" } }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              style={{ cursor: "none" }}
            >
              <KittyHelmet isHovered={isHovered} />
              <CompanionLabel />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
