import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Fragment {
  id: number;
  title: string;
  signal: string;
  expanded: string;
  angle: number;
  constellation: string;
}

const FRAGMENTS: Fragment[] = [
  { id: 1,  title: "HANGZHOU-01",   signal: "The river does not know its name.",           expanded: "Born beside water that moved without asking permission. The first lesson: momentum is not the same as intention.",                    angle: 12,  constellation: "α" },
  { id: 2,  title: "ITHACA-07",     signal: "Cold is the best teacher of warmth.",          expanded: "Three winters in a valley that forgot the sun. Learned to generate heat from the inside.",                                          angle: 47,  constellation: "β" },
  { id: 3,  title: "MEMORY-03",     signal: "Distance is measured in frequencies, not miles.", expanded: "Every phone call home was a signal that refused to degrade. Love doesn't red-shift.",                                            angle: 91,  constellation: "γ" },
  { id: 4,  title: "TRANSIT-11",    signal: "Between departure and arrival: the self.",     expanded: "The airport lounge is not a no-man's land. It is where the future version of yourself arrives before the rest of you catches up.", angle: 134, constellation: "δ" },
  { id: 5,  title: "BAY-04",        signal: "Fog is just clouds that chose to stay.",        expanded: "Pacific fog does not obscure. It diffuses. Everything is still there — softer, closer, more honest.",                              angle: 178, constellation: "ε" },
  { id: 6,  title: "SCIENCE-08",    signal: "Data is the universe speaking slowly.",         expanded: "Every dataset is a love letter from reality. You just have to learn the language.",                                                angle: 213, constellation: "ζ" },
  { id: 7,  title: "HANGZHOU-14",   signal: "Grandmothers know more about time than physicists.", expanded: "She never owned a watch and was never late. Time is not a measurement. It is a relationship.",                               angle: 251, constellation: "η" },
  { id: 8,  title: "ITHACA-02",     signal: "Study is a form of devotion.",                  expanded: "Late-night laboratories are temples for the scientifically faithful. The altar is a whiteboard. The prayer is a proof.",            angle: 289, constellation: "θ" },
  { id: 9,  title: "LIGHT-09",      signal: "You can see through most things if you wait long enough.", expanded: "Transparency is not a property of glass. It is a property of patience.",                                              angle: 22,  constellation: "ι" },
  { id: 10, title: "TRANSIT-05",    signal: "The beginning never really ends.",              expanded: "Origins are not left behind when you travel. They travel with you. Hangzhou is always in the carry-on.",                           angle: 65,  constellation: "κ" },
  { id: 11, title: "BAY-16",        signal: "Technology and wonder are not opposites.",      expanded: "The best engineers are still children asking why. Silicon is just sand that learned to count.",                                    angle: 108, constellation: "λ" },
  { id: 12, title: "MEMORY-19",     signal: "Some distances close the more you travel.",     expanded: "The farther you go from home, the more precisely you can see it.",                                                                angle: 152, constellation: "μ" },
  { id: 13, title: "SCIENCE-12",    signal: "Every measurement changes what is measured.",   expanded: "Heisenberg understood something about love that he never wrote in the uncertainty principle.",                                     angle: 196, constellation: "ν" },
  { id: 14, title: "ITHACA-21",     signal: "Winter teaches you what you're made of.",       expanded: "Negative ten degrees Fahrenheit. The answer was: more than I thought.",                                                           angle: 238, constellation: "ξ" },
  { id: 15, title: "TRANSIT-17",    signal: "Every landing is also a beginning.",            expanded: "Airports have a mythology that travel guides ignore. Each gate is a portal. The departure board is a calendar of transformations.", angle: 282, constellation: "ο" },
  { id: 16, title: "LIGHT-06",      signal: "The morning star does not rush.",               expanded: "Phosphoros arrives before the sun. It does not compete. It announces. There is a kind of leadership in that.",                     angle: 320, constellation: "π" },
  { id: 17, title: "BAY-22",        signal: "Community is the original technology.",         expanded: "Before microchips: fireside. Before fiber: voice. Every network was first a gathering of people who trusted each other.",           angle: 37,  constellation: "ρ" },
  { id: 18, title: "HANGZHOU-11",   signal: "Roots do not hold you down. They make you taller.", expanded: "A tree's height is exactly proportional to its root depth. The origin is not a weight. It is a foundation.",                angle: 80,  constellation: "σ" },
  { id: 19, title: "MEMORY-27",     signal: "Language is a kind of light.",                  expanded: "To speak is to illuminate. To be understood in a second language is a small miracle that happens ten thousand times a day.",       angle: 122, constellation: "τ" },
  { id: 20, title: "SCIENCE-03",    signal: "Curiosity is a survival mechanism that became beautiful.", expanded: "We evolved to wonder. The universe arranged for a species that could look back at it and be amazed.",                  angle: 165, constellation: "υ" },
  { id: 21, title: "TRANSIT-33",    signal: "All motion is also stillness at another scale.", expanded: "From far enough away, the fastest journey looks like patience.",                                                                  angle: 207, constellation: "φ" },
  { id: 22, title: "LIGHT-18",      signal: "Some people are born already transmitting.",    expanded: "You meet them and realize the signal has been in the air the whole time. You just finally had the right receiver.",               angle: 249, constellation: "χ" },
  { id: 23, title: "CLASSIFIED",    signal: "∞",                                             expanded: "The final signal cannot be described. It can only be received, in the quiet, after all the others have been heard.",              angle: 0,   constellation: "ψ" },
];

function ConstellationSvg({ char }: { char: string }) {
  const seed = char.charCodeAt(0);
  const pts = Array.from({ length: 4 }, (_, i) => ({
    x: 20 + ((seed * (i + 1) * 37) % 50),
    y: 20 + ((seed * (i + 1) * 23) % 50),
  }));

  return (
    <svg width="70" height="70" viewBox="0 0 80 80" fill="none" className="opacity-60">
      {pts.map((p, i) =>
        i < pts.length - 1 ? (
          <line
            key={`l${i}`}
            x1={p.x} y1={p.y}
            x2={pts[i + 1].x} y2={pts[i + 1].y}
            stroke="rgba(180,178,240,0.3)" strokeWidth="0.5"
          />
        ) : null
      )}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 2.5 : 1.5}
          fill={i === 0 ? "rgba(255,211,107,0.7)" : "rgba(234,234,242,0.4)"} />
      ))}
      <text x="40" y="76" textAnchor="middle"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, fill: "rgba(180,178,240,0.5)" }}>
        {char}
      </text>
    </svg>
  );
}

export function SignalFragments() {
  const [selected, setSelected] = useState<Fragment | null>(null);
  const [secret, setSecret] = useState(false);
  const timeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const start = Date.now();
    timerRef.current = setTimeout(() => {
      setSecret(true);
    }, 30000);

    const track = setInterval(() => {
      timeRef.current = Math.floor((Date.now() - start) / 1000);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(track);
    };
  }, []);

  const visible = FRAGMENTS.filter(f => f.id !== 23 || secret);

  return (
    <section
      id="fragments"
      className="relative py-32 px-8"
      style={{ minHeight: "100vh" }}
    >
      <div className="max-w-6xl mx-auto">
        <SectionLabel index="02" title="SIGNAL FRAGMENTS" />
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: "rgba(180,178,240,0.4)", letterSpacing: "0.15em", marginTop: 8, marginBottom: 48 }}>
          {secret ? "23 / 23 FRAGMENTS RECOVERED" : `${visible.length} / 23 FRAGMENTS RECOVERED · EXPLORE TO UNLOCK`}
        </p>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
        >
          {visible.map((f, i) => (
            <FragmentCard
              key={f.id}
              fragment={f}
              index={i}
              isSecret={f.id === 23}
              onClick={() => setSelected(f)}
            />
          ))}
        </div>
      </div>

      {/* Expanded modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backdropFilter: "blur(20px)", background: "rgba(11,16,32,0.85)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative max-w-lg w-full mx-8 p-10"
              style={{
                background: "rgba(11,16,32,0.9)",
                border: "1px solid rgba(110,106,240,0.2)",
                backdropFilter: "blur(30px)",
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(110,106,240,0.5)", letterSpacing: "0.2em", marginBottom: 6 }}>
                    FRAGMENT {String(selected.id).padStart(2, "0")} · {selected.constellation}
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 400, color: "#EAEAF2", letterSpacing: "0.1em" }}>
                    {selected.title}
                  </div>
                </div>
                <ConstellationSvg char={selected.constellation} />
              </div>

              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", fontWeight: 300, color: "#F6B7D2", lineHeight: 1.55, marginBottom: 24 }}>
                "{selected.signal}"
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 300, color: "rgba(234,234,242,0.52)", lineHeight: 1.95, letterSpacing: "0.01em" }}>
                {selected.expanded}
              </div>

              <button
                onClick={() => setSelected(null)}
                style={{
                  position: "absolute", top: 16, right: 16,
                  fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.2em",
                  color: "rgba(234,234,242,0.3)", background: "none", border: "none", cursor: "none",
                }}
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FragmentCard({ fragment: f, index, isSecret, onClick }: {
  fragment: Fragment; index: number; isSecret: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04, ease: "easeOut" }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative p-5 flex flex-col gap-3"
      style={{
        background: hovered
          ? isSecret ? "rgba(246,183,210,0.06)" : "rgba(110,106,240,0.08)"
          : "rgba(234,234,242,0.03)",
        border: `1px solid ${hovered ? (isSecret ? "rgba(246,183,210,0.3)" : "rgba(110,106,240,0.3)") : "rgba(234,234,242,0.07)"}`,
        backdropFilter: "blur(8px)",
        cursor: "none",
        transition: "all 0.4s ease",
        boxShadow: hovered ? `0 0 30px ${isSecret ? "rgba(246,183,210,0.08)" : "rgba(110,106,240,0.08)"}` : "none",
      }}
    >
      {isSecret && (
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: "absolute", top: 8, right: 8, width: 4, height: 4, borderRadius: "50%", background: "#F6B7D2" }}
        />
      )}

      <ConstellationSvg char={f.constellation} />

      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(110,106,240,0.5)", letterSpacing: "0.15em" }}>
        {String(f.id).padStart(2, "0")}
      </div>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 500, color: "rgba(234,234,242,0.6)", letterSpacing: "0.1em" }}>
        {f.title}
      </div>

      <motion.div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 12,
          fontStyle: "italic",
          color: isSecret ? "#F6B7D2" : "rgba(180,178,240,0.8)",
          lineHeight: 1.6,
          maxHeight: hovered ? 60 : 0,
          overflow: "hidden",
        }}
        animate={{ maxHeight: hovered ? 60 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {f.signal}
      </motion.div>
    </motion.div>
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
