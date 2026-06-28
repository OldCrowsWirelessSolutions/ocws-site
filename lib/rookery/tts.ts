/**
 * Server-side ElevenLabs TTS for the Rookery cast (web/mobile WebView path).
 *
 * The desktop app speaks via electron/services/elevenlabs.ts; this is its
 * server twin, reached through the dispatch `tts:speak` channel from webBridge.
 * It calls the `with-timestamps` endpoint so the response carries per-character
 * alignment — the renderer (src/lib/lipsync.ts) turns that into word-accurate
 * beak articulation. Shapes mirror the desktop service exactly so the renderer
 * is identical on both transports.
 *
 * Per-bird voice IDs come from env (same names the desktop service uses):
 *   ELEVENLABS_API_KEY
 *   ELEVENLABS_VOICE_ID            — Corvus (legacy alias)
 *   ELEVENLABS_VOICE_ID_CORVUS / _MIRA / _PIP / _SAGE
 *   ELEVENLABS_MODEL              — optional (default eleven_multilingual_v2)
 *
 * NOTE: this is NOT app/api/elevenlabs/speak/route.ts — that's the older
 * single-voice marketing-site Corvus and returns raw audio. Leave it alone.
 */

export type MentorVoice = "corvus" | "mira" | "pip" | "sage";

export interface CharAlignment {
  characters: string[];
  startSeconds: number[];
  endSeconds: number[];
}

export interface TtsSpeakResult {
  audioBase64: string;
  bytes: number;
  alignment?: CharAlignment;
}

export interface TtsErrorPayload {
  ok: false;
  kind: "no_key" | "no_voice" | "quota_exceeded" | "http" | "unknown";
  message: string;
  status?: number;
}

export interface TtsSpeakInput {
  text: string;
  voice?: MentorVoice;
}

const DEFAULT_MODEL = "eleven_multilingual_v2";

function resolveVoiceId(voice: MentorVoice): string | null {
  const direct = process.env[`ELEVENLABS_VOICE_ID_${voice.toUpperCase()}`];
  if (direct) return direct;
  if (voice === "corvus") return process.env.ELEVENLABS_VOICE_ID ?? null;
  return null;
}

interface ElevenAlignment {
  characters?: string[];
  character_start_times_seconds?: number[];
  character_end_times_seconds?: number[];
}
interface ElevenTimestampedBody {
  audio_base64?: string;
  alignment?: ElevenAlignment;
  normalized_alignment?: ElevenAlignment;
}

function mapAlignment(a: ElevenAlignment | undefined): CharAlignment | undefined {
  if (
    !a ||
    !Array.isArray(a.characters) ||
    !Array.isArray(a.character_start_times_seconds) ||
    !Array.isArray(a.character_end_times_seconds) ||
    a.characters.length === 0
  ) {
    return undefined;
  }
  return {
    characters: a.characters,
    startSeconds: a.character_start_times_seconds,
    endSeconds: a.character_end_times_seconds
  };
}

export async function speak(
  input: TtsSpeakInput
): Promise<TtsSpeakResult | TtsErrorPayload> {
  const text = (input.text ?? "").trim();
  if (!text) {
    return { ok: false, kind: "unknown", message: "Empty text — nothing to speak." };
  }
  const voice: MentorVoice = input.voice ?? "corvus";

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { ok: false, kind: "no_key", message: "ELEVENLABS_API_KEY not set." };
  }
  const voiceId = resolveVoiceId(voice);
  if (!voiceId) {
    return {
      ok: false,
      kind: "no_voice",
      message: `${voice[0].toUpperCase() + voice.slice(1)}'s voice isn't configured yet. Set ELEVENLABS_VOICE_ID_${voice.toUpperCase()}.`
    };
  }
  const model = process.env.ELEVENLABS_MODEL ?? DEFAULT_MODEL;

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: model })
    });
  } catch (e) {
    return {
      ok: false,
      kind: "http",
      message: `Network error reaching ElevenLabs: ${(e as Error).message}`
    };
  }

  if (!res.ok) {
    let detailMessage = `ElevenLabs HTTP ${res.status}`;
    let kind: TtsErrorPayload["kind"] = "http";
    try {
      const body = (await res.json()) as {
        detail?: { status?: string; message?: string } | string;
      };
      if (typeof body.detail === "object" && body.detail) {
        if (body.detail.status === "quota_exceeded") kind = "quota_exceeded";
        if (body.detail.message) detailMessage = body.detail.message;
      } else if (typeof body.detail === "string") {
        detailMessage = body.detail;
      }
    } catch {
      /* not JSON — keep default */
    }
    return { ok: false, kind, message: detailMessage, status: res.status };
  }

  let body: ElevenTimestampedBody;
  try {
    body = (await res.json()) as ElevenTimestampedBody;
  } catch {
    return {
      ok: false,
      kind: "unknown",
      message: "ElevenLabs returned an unreadable timestamped response."
    };
  }
  const audioBase64 = body.audio_base64 ?? "";
  if (!audioBase64) {
    return { ok: false, kind: "unknown", message: "ElevenLabs returned empty audio." };
  }
  return {
    audioBase64,
    bytes: Math.floor((audioBase64.length * 3) / 4),
    alignment: mapAlignment(body.alignment)
  };
}

export interface TtsQuotaInfo {
  ok: true;
  charactersUsed: number;
  charactersLimit: number;
  charactersRemaining: number;
  tier: string | null;
}

export async function quotaProbe(): Promise<TtsQuotaInfo | TtsErrorPayload> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { ok: false, kind: "no_key", message: "ELEVENLABS_API_KEY not set." };
  }
  let res: Response;
  try {
    res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
      headers: { "xi-api-key": apiKey }
    });
  } catch (e) {
    return {
      ok: false,
      kind: "http",
      message: `Network error reaching ElevenLabs: ${(e as Error).message}`
    };
  }
  if (!res.ok) {
    return { ok: false, kind: "http", message: `ElevenLabs HTTP ${res.status}`, status: res.status };
  }
  const body = (await res.json()) as {
    tier?: string;
    character_count?: number;
    character_limit?: number;
  };
  const used = body.character_count ?? 0;
  const limit = body.character_limit ?? 0;
  return {
    ok: true,
    charactersUsed: used,
    charactersLimit: limit,
    charactersRemaining: Math.max(0, limit - used),
    tier: body.tier ?? null
  };
}
