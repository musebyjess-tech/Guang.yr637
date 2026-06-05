import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Dust {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const DUST_COLORS = ["#FFE7A3", "#EAEAF2", "#F6B7D2", "#B4B2F0", "#FFD36B"];
const CLICK_FREQS = [220, 330, 440, 528, 396];

export function CursorStardust() {
  const [pos, setPos]       = useState({ x: -200, y: -200 });
  const [ring, setRing]     = useState({ x: -200, y: -200 });
  const [dust, setDust]     = useState<Dust[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [hovering, setHovering] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const dustId = useRef(0);
  const rippleId = useRef(0);

  const playTone = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    const freq = CLICK_FREQS[Math.floor(Math.random() * CLICK_FREQS.length)];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  };

  useEffect(() => {
    let lastX = -200, lastY = -200;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX, y = e.clientY;
      setPos({ x, y });

      // Lag ring
      setTimeout(() => setRing({ x, y }), 60);

      // Spawn dust when moving fast enough
      const dx = x - lastX, dy = y - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 6) {
        const id = ++dustId.current;
        const color = DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];
        setDust(prev => [...prev.slice(-18), { id, x, y, color, size: Math.random() * 3 + 1 }]);
        setTimeout(() => setDust(prev => prev.filter(d => d.id !== id)), 700);
      }
      lastX = x; lastY = y;

      const el = e.target as HTMLElement;
      setHovering(!!el.closest("button, a, [role='button']"));
    };

    const onClick = (e: MouseEvent) => {
      playTone();
      const id = ++rippleId.current;
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 900);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      {/* Stardust trail */}
      <AnimatePresence>
        {dust.map(d => (
          <motion.div
            key={d.id}
            className="fixed pointer-events-none rounded-full"
            style={{ left: d.x, top: d.y, width: d.size, height: d.size, background: d.color, translateX: "-50%", translateY: "-50%", zIndex: 9999 }}
            initial={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0, scale: 0.2, y: -12 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            className="fixed pointer-events-none rounded-full border"
            style={{
              left: r.x,
              top: r.y,
              borderColor: "rgba(110,106,240,0.5)",
              translateX: "-50%",
              translateY: "-50%",
              zIndex: 9998,
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 80, height: 80, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Lagging ring */}
      <motion.div
        className="fixed pointer-events-none rounded-full border"
        animate={{ left: ring.x, top: ring.y }}
        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.5 }}
        style={{
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 10000,
          borderColor: hovering ? "rgba(110,106,240,0.6)" : "rgba(234,234,242,0.25)",
          boxShadow: hovering ? "0 0 14px rgba(110,106,240,0.3)" : "none",
        }}
      >
        <motion.div
          animate={{
            width: hovering ? 44 : 28,
            height: hovering ? 44 : 28,
          }}
          transition={{ duration: 0.3 }}
          style={{ borderRadius: "50%" }}
        />
      </motion.div>

      {/* Core dot */}
      <motion.div
        className="fixed pointer-events-none rounded-full"
        animate={{ left: pos.x, top: pos.y }}
        transition={{ type: "spring", damping: 50, stiffness: 800, mass: 0.2 }}
        style={{
          width: 5,
          height: 5,
          background: "#EAEAF2",
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 10001,
          boxShadow: "0 0 8px rgba(234,234,242,0.8)",
        }}
      />
    </>
  );
}
