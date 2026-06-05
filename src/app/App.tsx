import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { NebulaBg }         from "./components/NebulaBg";
import { StarParticles }    from "./components/StarParticles";
import { GrainOverlay }     from "./components/GrainOverlay";
import { CursorStardust }   from "./components/CursorStardust";
import { Navigation }       from "./components/Navigation";
import { HeroSection }      from "./components/HeroSection";
import { OrbitEngine }      from "./components/OrbitEngine";
import { SignalFragments }  from "./components/SignalFragments";
import { SignalReceiver }   from "./components/SignalReceiver";
import { FrequencyLab }     from "./components/FrequencyLab";
import { CelestialAtlas }   from "./components/CelestialAtlas";
import { AfterglowArchive } from "./components/AfterglowArchive";
import { KittyAstronaut }  from "./components/KittyAstronaut";
import { RoamingUniverse } from "./components/RoamingUniverse";

export default function App() {
  const [showRoaming, setShowRoaming] = useState(false);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "#0B1020", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Fixed background layers */}
      <NebulaBg />
      <StarParticles />
      <GrainOverlay />

      {/* Fixed UI layers */}
      <CursorStardust />
      <Navigation />
      <KittyAstronaut />

      {/* Roaming Universe overlay */}
      <AnimatePresence>
        {showRoaming && <RoamingUniverse onClose={() => setShowRoaming(false)} />}
      </AnimatePresence>

      {/* Scrollable content */}
      <div
        id="scroll-container"
        className="absolute inset-0 overflow-y-auto overflow-x-hidden"
        style={{ scrollBehavior: "smooth" }}
      >
        <HeroSection />

        {/* Section divider */}
        <Divider />
        <OrbitEngine onOpenRoaming={() => setShowRoaming(true)} />

        <Divider />
        <SignalFragments />

        <Divider />
        <SignalReceiver />

        <Divider />
        <FrequencyLab />

        <Divider />
        <CelestialAtlas />

        <Divider />
        <AfterglowArchive />

        {/* Footer */}
        <footer
          className="py-20 px-8 text-center"
          style={{ borderTop: "1px solid rgba(110,106,240,0.08)" }}
        >
          {/* Footer wordmark */}
          <div className="flex items-baseline justify-center gap-0 mb-5">
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 32, letterSpacing: "0.08em", color: "rgba(234,234,242,0.1)" }}>Guang.</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 34, background: "linear-gradient(135deg,#6E6AF0,#F6B7D2,#FFD36B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", opacity: 0.4 }}>∞</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 32, letterSpacing: "0.08em", color: "rgba(234,234,242,0.1)" }}>Year</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 300, color: "rgba(180,178,240,0.25)", letterSpacing: "0.05em", lineHeight: 1.8 }}>
            A living celestial archive. All transmissions received.
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(234,234,242,0.1)", letterSpacing: "0.25em", marginTop: 20 }}>
            PHOSPHORUS A.H · NODE ACTIVE · ∞
          </div>
        </footer>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="mx-8 my-0"
      style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(110,106,240,0.12), transparent)" }}
    />
  );
}
