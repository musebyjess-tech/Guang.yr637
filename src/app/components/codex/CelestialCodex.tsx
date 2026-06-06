import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CodexBackground } from "./CodexBackground";
import { TransmissionPanel, type TransmissionPayload } from "./TransmissionPanel";
import { CodexStar } from "./CodexStar";
import { ArchiveDrawer } from "./ArchiveDrawer";
import { MessageViewer } from "./MessageViewer";
import { TelescopeImage } from "./TelescopeImage";
import { ConstellationCard } from "./ConstellationCard";
import { ConstellationCardOverlay } from "./ConstellationCardOverlay";
import { OrbitalRing } from "./OrbitalRing";
import { CONSTELLATION_FRAGMENTS, type ConstellationFragment } from "./constellationFragments";
import {
  fetchCodexMessages,
  createCodexMessage,
  generateStarPosition,
  type CodexMessage,
} from "../../lib/codexMessages";

const LAUNCH_ORIGIN = { x: 0.52, y: 0.78 };

function LaunchStar({
  target,
  color,
  onDone,
}: {
  target: { x: number; y: number };
  color: string;
  onDone: () => void;
}) {
  const midX = (LAUNCH_ORIGIN.x + target.x) / 2;
  const midY = Math.min(LAUNCH_ORIGIN.y, target.y) - 0.14;

  return (
    <motion.div
      className="absolute pointer-events-none z-30"
      style={{ fontSize: 32, color, textShadow: `0 0 24px ${color}, 0 0 48px ${color}, 0 0 72px ${color}88`}}
      initial={{ left: `${LAUNCH_ORIGIN.x * 100}%`, top: `${LAUNCH_ORIGIN.y * 100}%`, opacity: 1, scale: 0.4 }}
      animate={{
        left: [`${LAUNCH_ORIGIN.x * 100}%`, `${midX * 100}%`, `${target.x * 100}%`],
        top: [`${LAUNCH_ORIGIN.y * 100}%`, `${midY * 100}%`, `${target.y * 100}%`],
        scale: [0.4, 1.5, 1.5],
        opacity: [1, 1, 0.9],
      }}
      transition={{ duration: 1.35, ease: [0.22, 0.8, 0.36, 1] }}
      onAnimationComplete={onDone}
    >
      ✦
    </motion.div>
  );
}

export function CelestialCodex() {
  const [messages, setMessages] = useState<CodexMessage[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [viewing, setViewing] = useState<CodexMessage | null>(null);
  const [selectedCard, setSelectedCard] = useState<ConstellationFragment | null>(null);
  const [hoveredStarId, setHoveredStarId] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [sending, setSending] = useState(false);
  const [launchTarget, setLaunchTarget] = useState<{ x: number; y: number; color: string } | null>(null);
  const [pendingMessage, setPendingMessage] = useState<CodexMessage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDim, setContainerDim] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        setContainerDim({
          width: containerRef.current?.offsetWidth || 0,
          height: containerRef.current?.offsetHeight || 0,
        });
      };
      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  useEffect(() => {
    fetchCodexMessages().then(setMessages).catch(console.error);
  }, []);

  // Calculate elliptical positions for all 12 cards
  const calculateEllipticalPositions = () => {
    const centerX = 0.46;
    const centerY = 0.48;
    const rx = 0.46;
    const ry = 0.4;

    return CONSTELLATION_FRAGMENTS.map((_, i) => {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + rx * Math.cos(angle);
      const y = centerY + ry * Math.sin(angle);
      return { x, y };
    });
  };

  const positions = calculateEllipticalPositions();

  const handleSend = useCallback(async (payload: TransmissionPayload) => {
    setSending(true);
    setPanelOpen(false);
    setLaunching(true);

    const { star_x, star_y } = generateStarPosition(messages);

    try {
      const message = await createCodexMessage({
        ...payload,
        star_x,
        star_y,
      });
      setPendingMessage(message);
      setLaunchTarget({ x: star_x, y: star_y, color: payload.color });
    } catch (err) {
      console.error(err);
      setLaunching(false);
      setSending(false);
    }
  }, [messages]);

  const onLaunchDone = useCallback(() => {
    if (pendingMessage) {
      setMessages((prev) => [...prev, pendingMessage]);
      setPendingMessage(null);
    }
    setLaunchTarget(null);
    setLaunching(false);
    setSending(false);
  }, [pendingMessage]);

  return (
    <section
      id="fragments"
      className="relative overflow-hidden"
      style={{ minHeight: "100vh", isolation: "isolate" }}
    >
      <CodexBackground />

      <div className="relative z-10 px-4 md:px-8 py-16" style={{ minHeight: "100vh" }}>
        <SectionLabel index="02" title="CELESTIAL CODEX" />
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(14px, 1.5vw, 17px)",
            fontStyle: "italic",
            fontWeight: 300,
            color: "rgba(180,178,240,0.45)",
            marginTop: 8,
            marginBottom: 8,
            lineHeight: 1.7,
          }}
        >
          Fixed constellations guide the eye. Living ✦ stars hold what you send now.
        </p>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 7,
            letterSpacing: "0.2em",
            color: "rgba(180,178,240,0.28)",
            marginBottom: 16,
          }}
        >
          12 CONSTELLATIONS · {messages.length} LIVING SIGNALS
        </p>

        <div
          ref={containerRef}
          className="relative w-full"
          style={{ height: "calc(100vh - 200px)", minHeight: 520 }}
        >
        <div
         style={{
         position: "absolute",
         inset: 0,
         }}
    >
  <OrbitalRing containerWidth={containerDim.width} containerHeight={containerDim.height} />

  {CONSTELLATION_FRAGMENTS.map((fragment, i) => (
    <ConstellationCard
      key={fragment.id}
      fragment={fragment}
      position={positions[i]}
      driftPhase={i}
      onClick={setSelectedCard}
      counterRotate={true}
    />
  ))}
</div>



          {messages.map((m) => (
            <CodexStar
              key={m.id}
              message={m}
              hovered={hoveredStarId === m.id}
              onHover={() => setHoveredStarId(m.id)}
              onLeave={() => setHoveredStarId(null)}
              onClick={() => setViewing(m)}
            />
          ))}

          {launchTarget && (
            <LaunchStar target={launchTarget} color={launchTarget.color} onDone={onLaunchDone} />
          )}

          {/* 望远镜 + archive 统一居中容器 */}
<div
  style={{
    position: "absolute",
    left: "50%",
    bottom: "4%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 50,
    zIndex: 1,
  }}
>
  <TelescopeImage onClick={() => setPanelOpen(true)} launching={launching} />

  <motion.button
    type="button"
    onClick={() => setArchiveOpen(true)}
    style={{
      background: "rgba(6,8,18,0.85)",
      border: "1px solid rgba(180,178,240,0.2)",
      borderRadius: 4,
      padding: "8px 14px",
      fontFamily: "'Space Mono', monospace",
      fontSize: 7,
      letterSpacing: "0.18em",
      color: "rgba(180,178,240,0.55)",
      cursor: "none",
      whiteSpace: "nowrap",
    }}
    whileHover={{
      borderColor: "rgba(180,178,240,0.35)",
      color: "rgba(180,178,240,0.75)",
    }}
    animate={{ opacity: [0.7, 1, 0.7] }}
    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
  >
    <span style={{ display: "inline-block", marginRight: 6 }}>✦</span>
    ARCHIVE ({messages.length})
  </motion.button>
</div>
        </div>
      </div>

      <AnimatePresence>
        {panelOpen && (
          <TransmissionPanel
            onClose={() => setPanelOpen(false)}
            onSend={handleSend}
            sending={sending}
          />
        )}
      </AnimatePresence>

      <ConstellationCardOverlay
        fragment={selectedCard}
        onClose={() => setSelectedCard(null)}
      />

      <ArchiveDrawer
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        messages={messages}
        onSelect={setViewing}
      />

      <AnimatePresence>
        {viewing && <MessageViewer message={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </section>
  );
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-2">
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(110,106,240,0.5)", letterSpacing: "0.2em" }}>{index}</div>
      <div style={{ width: 40, height: 1, background: "rgba(110,106,240,0.25)" }} />
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.35em", color: "rgba(234,234,242,0.3)" }}>{title}</div>
    </div>
  );
}
