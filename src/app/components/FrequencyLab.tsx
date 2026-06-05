import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";

interface Oscillator {
  id: string;
  label: string;
  sub: string;
  freq: number;
  min: number;
  max: number;
  color: string;
}

const OSCILLATORS: Oscillator[] = [
  { id: "alpha",  label: "α WAVE",   sub: "Amplitude",    freq: 0.35, min: 0.05, max: 1,    color: "#6E6AF0" },
  { id: "beta",   label: "β FREQ",   sub: "Frequency",    freq: 0.6,  min: 0,    max: 1,    color: "#F6B7D2" },
  { id: "gamma",  label: "γ PHASE",  sub: "Phase Shift",  freq: 0.5,  min: 0,    max: 1,    color: "#FFD36B" },
  { id: "delta",  label: "δ DRIFT",  sub: "Temporal",     freq: 0.3,  min: 0,    max: 1,    color: "#EAEAF2" },
];

export function FrequencyLab() {
  const [oscs, setOscs] = useState(OSCILLATORS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  const setFreq = useCallback((id: string, v: number) => {
    setOscs(prev => prev.map(o => o.id === id ? { ...o, freq: v } : o));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    let t = 0;

    const draw = () => {
      t += 0.025;
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(110,106,240,0.06)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y <= 4; y++) {
        ctx.beginPath();
        ctx.moveTo(0, (y / 4) * H);
        ctx.lineTo(W, (y / 4) * H);
        ctx.stroke();
      }

      // Draw each oscillator waveform
      const vals = oscs;
      vals.forEach((o, idx) => {
        ctx.beginPath();
        const hex = o.color;
        ctx.strokeStyle = hex + "60";
        ctx.lineWidth = 1;

        for (let x = 0; x < W; x++) {
          const p = x / W;
          const freq = 3 + o.freq * 18;
          const amp  = 0.15 + o.freq * 0.2;
          const phase = idx * 1.2;
          const y = H / 2 + Math.sin(p * freq * Math.PI * 2 + t + phase) * (H * amp);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Composite (summed) waveform
      ctx.beginPath();
      ctx.strokeStyle = "rgba(234,234,242,0.7)";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(110,106,240,0.5)";
      for (let x = 0; x < W; x++) {
        const p = x / W;
        let y = H / 2;
        vals.forEach((o, idx) => {
          const freq = 3 + o.freq * 18;
          const amp  = 0.08 + o.freq * 0.1;
          const phase = idx * 1.2;
          y += Math.sin(p * freq * Math.PI * 2 + t + phase) * (H * amp);
        });
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [oscs]);

  return (
    <section
      id="frequency"
      className="relative py-32 px-8"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <div className="max-w-5xl w-full mx-auto">
        <SectionLabel index="04" title="FREQUENCY LAB" />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(15px,1.6vw,18px)", fontStyle: "italic", fontWeight: 300, color: "rgba(180,178,240,0.55)", marginTop: 8, marginBottom: 48, lineHeight: 1.7 }}>
          Tune the observatory. Each frequency is a dimension of light.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Oscilloscope */}
          <div style={{ border: "1px solid rgba(110,106,240,0.12)", background: "rgba(11,16,32,0.7)", backdropFilter: "blur(12px)" }}>
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid rgba(110,106,240,0.08)" }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(110,106,240,0.4)", letterSpacing: "0.2em" }}>OSCILLOSCOPE</span>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "#FFD36B", letterSpacing: "0.15em" }}
              >
                ◉ RENDERING
              </motion.div>
            </div>
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: 200, display: "block" }}
            />
            <div className="flex justify-between px-5 py-3">
              {oscs.map(o => (
                <div key={o.id} className="flex items-center gap-1.5">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: o.color, opacity: 0.7 }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: "rgba(234,234,242,0.3)", letterSpacing: "0.1em" }}>{o.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-8">
            {oscs.map(o => (
              <OscillatorControl key={o.id} osc={o} onChange={v => setFreq(o.id, v)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OscillatorControl({ osc, onChange }: { osc: Oscillator; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-baseline">
        <div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 500, color: osc.color, letterSpacing: "0.15em" }}>
            {osc.label}
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(234,234,242,0.3)", marginLeft: 12, letterSpacing: "0.1em" }}>
            {osc.sub}
          </span>
        </div>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(234,234,242,0.4)", letterSpacing: "0.1em" }}>
          {(osc.freq * 100).toFixed(0)}%
        </span>
      </div>
      <div className="relative" style={{ height: 24, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "rgba(234,234,242,0.08)" }} />
        <div style={{ position: "absolute", left: 0, width: `${osc.freq * 100}%`, height: 1, background: osc.color, opacity: 0.5 }} />
        <input
          type="range"
          min={osc.min}
          max={osc.max}
          step={0.01}
          value={osc.freq}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute", left: 0, right: 0, width: "100%",
            appearance: "none", background: "transparent", cursor: "none", outline: "none",
          }}
        />
      </div>
      {/* Mini bars */}
      <div className="flex gap-0.5" style={{ height: 12 }}>
        {Array.from({ length: 40 }, (_, i) => {
          const active = i / 40 <= osc.freq;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: active ? 6 + (i % 3) * 2 : 2,
                background: active ? osc.color : "rgba(234,234,242,0.06)",
                borderRadius: 1,
                transition: "all 0.15s ease",
                alignSelf: "flex-end",
              }}
            />
          );
        })}
      </div>
    </div>
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
