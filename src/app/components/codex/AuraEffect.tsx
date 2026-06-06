import { motion } from "motion/react";

export function AuraEffect() {
  // Create 12 glowing particles around the center
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * Math.PI * 2,
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Radial pulse layers */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          border: "1px solid rgba(180,178,240,0.3)",
          boxShadow: "0 0 20px rgba(180,178,240,0.2)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          border: "1px solid rgba(180,178,240,0.15)",
          boxShadow: "0 0 30px rgba(180,178,240,0.1)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.15, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Orbiting particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: "rgba(180,178,240,0.6)",
            boxShadow: "0 0 8px rgba(180,178,240,0.8)",
            x: Math.cos(p.angle) * 140,
            y: Math.sin(p.angle) * 140,
          }}
          animate={{
            y: [
              Math.sin(p.angle) * 140,
              Math.sin(p.angle) * 155,
              Math.sin(p.angle) * 140,
            ],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (p.id / 12) * 0.5,
          }}
        />
      ))}

      {/* Central glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: "radial-gradient(circle, rgba(180,178,240,0.15) 0%, rgba(180,178,240,0) 70%)",
          filter: "blur(20px)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
