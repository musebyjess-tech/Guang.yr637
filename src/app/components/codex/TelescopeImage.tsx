import { motion } from "motion/react";

interface TelescopeImageProps {
  onClick: () => void;
  launching: boolean;
}

export function TelescopeImage({ onClick, launching }: TelescopeImageProps) {
  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center"
      style={{
  position: "relative",  // ← 改成 relative，不再自己定位
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 20,
}}
      animate={{
        scale: launching ? 0.95 : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="relative"
        style={{
          width: 320,
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Dark purple blur aura */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: 0,
            background: "radial-gradient(circle, rgba(120,80,200,0.25) 0%, rgba(80,40,150,0.1) 70%, rgba(60,20,120,0) 100%)",
            filter: "blur(40px)",
            zIndex: 1,
          }}
          animate={{
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.button
          type="button"
          onClick={onClick}
          className="relative cursor-pointer group"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            zIndex: 2,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src="/天文望远镜.png"
            alt="Cosmic telescope"
            style={{
              maxWidth: "60%",
              maxHeight: "60%",
              objectFit: "contain",
              filter: "drop-shadow(0 0 15px rgba(120,80,200,0.4))",
              transition: "filter 0.3s ease",
            }}
            className="group-hover:drop-shadow-xl"
          />
        </motion.button>
      </div>

      <p
        style={{
          marginTop: 0.1,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 11,
          fontStyle: "italic",
          fontWeight: 300,
          color: "rgba(210, 209, 255, 0.98)",
          letterSpacing: "0.2em",
          textAlign: "center",
        }}
      >
        Click it to make a shooting star      </p>
    </motion.div>
  );
}
