import { useRef, useState } from "react";
import { motion } from "motion/react";
import type { CodexMessageType } from "../../lib/codexMessages";

export const STAR_COLORS = [
  { label: "Gold",   value: "#FFD36B" },
  { label: "Pink",   value: "#F6B7D2" },
  { label: "Violet", value: "#9B8FFF" },
  { label: "Green",  value: "#7DDBA3" },
  { label: "Blue",   value: "#61C4FF" },
];

export type TransmissionPayload = {
  type: CodexMessageType;
  sender_name: string;
  color: string;
  textContent?: string;
  imageFile?: File;
  voiceBlob?: Blob;
  voiceFile?: File;
};

export function TransmissionPanel({
  onClose,
  onSend,
  sending,
}: {
  onClose: () => void;
  onSend: (payload: TransmissionPayload) => void;
  sending: boolean;
}) {
  const [sender, setSender] = useState("");
  const [text, setText] = useState("");
  const [color, setColor] = useState(STAR_COLORS[0].value);
  const [mode, setMode] = useState<CodexMessageType>("text");
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [voiceFile, setVoiceFile] = useState<File | undefined>();
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | undefined>();
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
      setMode("voice");
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const handleSend = () => {
    if (!sender.trim()) return;
    if (mode === "text" && !text.trim()) return;
    if (mode === "image" && !imageFile) return;
    if (mode === "voice" && !recordedBlob && !voiceFile) return;

    onSend({
      type: mode,
      sender_name: sender.trim(),
      color,
      textContent: mode === "text" ? text.trim() : undefined,
      imageFile: mode === "image" ? imageFile : undefined,
      voiceBlob: mode === "voice" ? recordedBlob : undefined,
      voiceFile: mode === "voice" ? voiceFile : undefined,
    });
  };

  const inp: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(110,106,240,0.2)",
    borderRadius: 5,
    padding: "9px 12px",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13,
    fontWeight: 300,
    color: "rgba(234,234,242,0.85)",
    outline: "none",
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(2,4,12,0.72)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed z-50"
        style={{
          left: "50%",
          bottom: "18%",
          width: "min(420px, 92vw)",
          background: "rgba(6,8,18,0.96)",
          border: "1px solid rgba(180,178,240,0.18)",
          borderRadius: 14,
          padding: "24px 22px",
          boxShadow: "0 0 60px rgba(110,106,240,0.12)",
        }}
        initial={{ opacity: 0,x: "-50%", y: 24 }}
        animate={{ opacity: 1, x: "-50%",y: 0 }}
        exit={{ opacity: 0,x: "-50%", y: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: "0.25em", color: "rgba(180,178,240,0.45)", marginBottom: 6 }}>
          TRANSMISSION PANEL
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", color: "rgba(234,234,242,0.9)", marginBottom: 18 }}>
          Send a signal to the sky
        </div>

        <div className="flex flex-col gap-3">
          <input style={inp} placeholder="Your name" value={sender} onChange={(e) => setSender(e.target.value)} />

          <div className="flex gap-2 flex-wrap">
            {(["text", "image", "voice"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 4,
                  border: `1px solid ${mode === m ? "rgba(180,178,240,0.5)" : "rgba(234,234,242,0.1)"}`,
                  background: mode === m ? "rgba(110,106,240,0.15)" : "transparent",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 7,
                  letterSpacing: "0.15em",
                  color: mode === m ? "rgba(234,234,242,0.85)" : "rgba(234,234,242,0.35)",
                  cursor: "none",
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {mode === "text" && (
            <textarea
              style={{ ...inp, height: 88, resize: "none" }}
              placeholder="Your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}

          {mode === "image" && (
            <>
              <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files?.[0])} />
              <button type="button" onClick={() => imageInputRef.current?.click()} style={{ ...inp, textAlign: "left", cursor: "none" }}>
                {imageFile ? `✓ ${imageFile.name}` : "+ Upload image"}
              </button>
            </>
          )}

          {mode === "voice" && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                style={{
                  ...inp,
                  cursor: "none",
                  color: recording ? "#F6B7D2" : "rgba(234,234,242,0.7)",
                  borderColor: recording ? "rgba(246,183,210,0.4)" : "rgba(110,106,240,0.2)",
                }}
              >
                {recording ? "● STOP RECORDING" : "● RECORD VOICE"}
              </button>
              <input ref={voiceInputRef} type="file" accept="audio/*" hidden onChange={(e) => setVoiceFile(e.target.files?.[0])} />
              <button type="button" onClick={() => voiceInputRef.current?.click()} style={{ ...inp, textAlign: "left", cursor: "none" }}>
                {voiceFile ? `✓ ${voiceFile.name}` : recordedBlob ? "✓ Voice recorded" : "+ Or upload audio file"}
              </button>
            </div>
          )}

          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: "0.18em", color: "rgba(180,178,240,0.4)", marginBottom: 8 }}>
              STAR COLOR
            </div>
            <div className="flex gap-2">
              {STAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: color === c.value ? "2px solid rgba(255,255,255,0.7)" : "2px solid transparent",
                    background: c.value,
                    cursor: "none",
                    boxShadow: color === c.value ? `0 0 12px ${c.value}` : "none",
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <motion.button
            type="button"
            disabled={sending}
            onClick={handleSend}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "11px",
              background: "rgba(180,178,240,0.1)",
              border: "1px solid rgba(180,178,240,0.28)",
              borderRadius: 6,
              fontFamily: "'Space Mono', monospace",
              fontSize: 8,
              letterSpacing: "0.25em",
              color: "rgba(234,234,242,0.8)",
              cursor: sending ? "wait" : "none",
              opacity: sending ? 0.6 : 1,
            }}
            whileHover={{ background: "rgba(180,178,240,0.18)" }}
          >
            {sending ? "TRANSMITTING…" : "TRANSMIT ✦"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
