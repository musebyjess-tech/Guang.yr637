import { useEffect, useState } from "react";
import { motion } from "motion/react";

const FIXED = {
  ra:  "05h 34m 32.0s",
  dec: "+22° 00′ 52″",
  freq: "14.204 GHz",
  label: "GUANG / ORIGIN NODE",
};

export function CoordinateStamp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "easeIn" }}
      className="flex flex-col gap-1"
      style={{ fontFamily: "'Space Mono', monospace", fontSize: 10 }}
    >
      <Row label="RA"   value={FIXED.ra}    delay={0} />
      <Row label="DEC"  value={FIXED.dec}   delay={0.15} />
      <Row label="FREQ" value={FIXED.freq}  delay={0.3} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 1, 0.7, 1] }}
        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
        className="mt-1 tracking-[0.25em]"
        style={{ color: "rgba(160, 200, 255, 0.5)", fontSize: 9 }}
      >
        {FIXED.label}
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="flex gap-3"
    >
      <span style={{ color: "rgba(160, 200, 255, 0.35)", width: 30, letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span style={{ color: "rgba(220, 235, 255, 0.65)", letterSpacing: "0.05em" }}>
        {value}
      </span>
    </motion.div>
  );
}
