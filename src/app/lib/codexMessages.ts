import { supabase, isSupabaseConfigured } from "./supabase";
import { FRAGMENT_ZONES } from "../components/codex/codexFragments";

export type CodexMessageType = "text" | "image" | "voice";

export type CodexMessage = {
  id: string;
  type: CodexMessageType;
  content: string;
  color: string;
  sender_name: string;
  timestamp: string;
  star_x: number;
  star_y: number;
};

const LOCAL_KEY = "guang-codex-messages-v1";
const BUCKET = "codex-media";

function loadLocal(): CodexMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CodexMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(messages: CodexMessage[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(messages));
}

function overlapsZone(x: number, y: number, r = 0.04): boolean {
  for (const z of FRAGMENT_ZONES) {
    const dx = x - z.x;
    const dy = y - z.y;
    if (Math.sqrt(dx * dx + dy * dy) < z.r + r) return true;
  }
  if (y > 0.72) return true;
  if (x < 0.18 || x > 0.82) return true;
  return false;
}

export function generateStarPosition(existing: CodexMessage[]): { star_x: number; star_y: number } {
  for (let i = 0; i < 80; i++) {
    const star_x = 0.22 + Math.random() * 0.56;
    const star_y = 0.08 + Math.random() * 0.55;
    if (overlapsZone(star_x, star_y)) continue;
    const tooClose = existing.some((m) => {
      const dx = m.star_x - star_x;
      const dy = m.star_y - star_y;
      return Math.sqrt(dx * dx + dy * dy) < 0.045;
    });
    if (!tooClose) return { star_x, star_y };
  }
  return { star_x: 0.35 + Math.random() * 0.3, star_y: 0.15 + Math.random() * 0.35 };
}

async function uploadMedia(file: File, folder: string): Promise<string> {
  if (!supabase) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function fetchCodexMessages(): Promise<CodexMessage[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("timestamp", { ascending: true });
    if (error) {
      console.warn("Supabase fetch failed, using local:", error.message);
      return loadLocal();
    }
    return (data ?? []) as CodexMessage[];
  }
  return loadLocal();
}

export type CreateCodexMessageInput = {
  type: CodexMessageType;
  textContent?: string;
  imageFile?: File;
  voiceBlob?: Blob;
  voiceFile?: File;
  color: string;
  sender_name: string;
  star_x: number;
  star_y: number;
};

export async function createCodexMessage(input: CreateCodexMessageInput): Promise<CodexMessage> {
  let content = input.textContent ?? "";

  if (input.type === "image" && input.imageFile) {
    content = await uploadMedia(input.imageFile, "images");
  } else if (input.type === "voice") {
    const file = input.voiceFile ?? (input.voiceBlob ? new File([input.voiceBlob], "voice.webm", { type: input.voiceBlob.type }) : null);
    if (file) content = await uploadMedia(file, "voice");
  }

  const message: CodexMessage = {
    id: crypto.randomUUID(),
    type: input.type,
    content,
    color: input.color,
    sender_name: input.sender_name,
    timestamp: new Date().toISOString(),
    star_x: input.star_x,
    star_y: input.star_y,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("messages").insert(message).select().single();
    if (error) throw error;
    return data as CodexMessage;
  }

  const all = [...loadLocal(), message];
  saveLocal(all);
  return message;
}
