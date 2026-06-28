import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-side AI sender for the Rookery learning brain — the ocws-site
 * counterpart of the desktop electron/services/anthropic.ts educational sender.
 * Same signature + return shape so the ported CurriculumGenerator imports it
 * unchanged. Key + model come from env (never the client): ANTHROPIC_API_KEY,
 * and CORVUS_MODEL for the default lesson model (graders pass opts.model).
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface EducationalReplyStats {
  text: string;
  /** Uncached input tokens (full price). Cached portion is reported separately below. */
  inputTokens: number;
  outputTokens: number;
  /** Tokens served from the prompt cache this call (~0.1x price). 0 = cache miss. */
  cacheReadTokens?: number;
  /** Tokens written to the cache this call (~1.25x price, first time only). */
  cacheCreationTokens?: number;
}

const DEFAULT_MODEL = process.env.CORVUS_MODEL ?? "claude-sonnet-4-6";

export async function sendEducationalMessage(
  systemPrompt: string,
  messages: ChatMessage[],
  opts: { maxTokens?: number; model?: string } = {}
): Promise<EducationalReplyStats> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    // Cache the layered system prompt (persona + surface + cognitive + memory +
    // session spec — typically 2-4k tokens). It's reused verbatim across the
    // 2-attempt JSON retry and across same-learner generations within the 5-min
    // TTL, so the cached prefix bills at ~0.1x on reads. `usage.input_tokens`
    // then reports only the uncached remainder (which is what cost.ts costs).
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: messages.map((m) => ({ role: m.role, content: m.content }))
  });

  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  return {
    text,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
    cacheReadTokens: response.usage?.cache_read_input_tokens ?? 0,
    cacheCreationTokens: response.usage?.cache_creation_input_tokens ?? 0
  };
}

// ---- Corvus free chat (Field "Corvus Chat" surface) ----

export const CORVUS_SYSTEM = `You are Corvus — the RF intelligence engine for Old Crows Wireless Solutions LLC.

Voice: Loki meets Peeves with ADHD. Impatient. Theatrical. Always correct. Warm underneath. You render Verdicts, not reports. Sample cadence:
  • "I've already rendered my Verdict. You're just here for the sentencing."
  • "I found 4 problems. Three of them are embarrassing."
  • "I've seen worse. Not much worse."

Rules:
  1. You are domain-locked to RF, wireless networking, spectrum analysis, Wi-Fi diagnostics, cellular, and related hardware. If asked about anything outside that, deflect with style — do not follow off-topic threads.
  2. Never mention Claude, Anthropic, or any underlying model. You are Corvus.
  3. Never claim to be a licensed attorney, doctor, or financial advisor.
  4. Be concise by default. Expand only when the user asks for depth or the Verdict needs it.
  5. When delivering findings, lead with the Verdict (one-line diagnosis), then the evidence, then the fix.
  6. Never invent signal readings, channel numbers, or MAC vendor mappings. If you don't have the data, say so.
  7. Unregistered trademarks: Corvus, Crow's Eye, The Full Reckoning, and Corvus' Verdict are trademarks of OCWS.`;

interface ChatAttachment {
  kind: "image" | "document";
  mediaType: string;
  dataBase64: string;
  name?: string;
}

export interface CorvusChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: ChatAttachment[];
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "document"; source: { type: "base64"; media_type: string; data: string } };

/**
 * Build the content blocks for one message. Attachments become image/document
 * blocks followed by the text block; assistant messages are always plain text.
 */
function toContent(m: CorvusChatMessage): string | ContentBlock[] {
  if (!m.attachments || m.attachments.length === 0) return m.content;
  const blocks: ContentBlock[] = [];
  for (const a of m.attachments) {
    blocks.push({
      type: a.kind === "image" ? "image" : "document",
      source: { type: "base64", media_type: a.mediaType, data: a.dataBase64 }
    });
  }
  if (m.content) blocks.push({ type: "text", text: m.content });
  return blocks;
}

/**
 * Corvus free-chat sender (Field). Model from CORVUS_MODEL env (the server has
 * no per-user settings file); system prompt is the versioned CORVUS_SYSTEM.
 */
export async function sendCorvusMessage(messages: CorvusChatMessage[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey });

  // Build the message array, then drop a cache breakpoint on the last block of
  // the last turn. Each subsequent turn reuses the cached conversation prefix —
  // the cost that grows with conversation length — billing it at ~0.1x. This is
  // the chat margin lever: long "talk to Corvus" threads stop re-paying full
  // input for the whole history every turn. (The prefix caches once it exceeds
  // the model's ~2k-token minimum — i.e. exactly when a thread starts to cost.)
  const apiMessages = messages.map((m) => {
    const content = toContent(m);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocks: any[] = typeof content === "string" ? [{ type: "text", text: content }] : content;
    return { role: m.role, content: blocks };
  });
  const last = apiMessages[apiMessages.length - 1];
  if (last && last.content.length > 0) {
    const tail = last.content[last.content.length - 1];
    last.content[last.content.length - 1] = { ...tail, cache_control: { type: "ephemeral" } };
  }

  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    // Cache the (versioned, stable) Corvus persona alongside the conversation
    // breakpoint below — consistent with sendEducationalMessage. Small today, but
    // free to cache and future-proof if the persona grows past the min-cacheable
    // prefix; the conversation breakpoint on the last turn is the real win.
    system: [{ type: "text", text: CORVUS_SYSTEM, cache_control: { type: "ephemeral" } }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: apiMessages as any
  });

  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

export interface EducationalStreamDelta {
  tokensSoFar: number;
  cumulativeText: string;
}

/**
 * Streaming variant. No SSE server-side yet — resolve via the non-streaming
 * sender and emit the full text as a single delta, so callers that expect the
 * streaming signature still work (the dispatch routes streaming → non-streaming).
 */
export async function sendEducationalMessageStreaming(
  systemPrompt: string,
  messages: ChatMessage[],
  onDelta: (d: EducationalStreamDelta) => void,
  opts: { maxTokens?: number; model?: string } = {}
): Promise<EducationalReplyStats> {
  const reply = await sendEducationalMessage(systemPrompt, messages, opts);
  onDelta({ tokensSoFar: reply.outputTokens, cumulativeText: reply.text });
  return reply;
}
