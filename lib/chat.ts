// lib/chat.ts
// Redis-backed chat history and state for Corvus AI chat sessions.

import redis from "@/lib/redis";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const CHAT_KEY   = (code: string) => `chat:${code}:messages`;
const COUNT_KEY  = (code: string) => `chat:${code}:message_count`;
const ACTIVE_KEY = (code: string) => `chat:${code}:last_active`;
const MAX_HISTORY = 50;

// ─── History ─────────────────────────────────────────────────────────────────

export async function getChatHistory(code: string): Promise<ChatMessage[]> {
  const items = await redis.lrange(CHAT_KEY(code), 0, -1);
  return (items as (string | ChatMessage)[]).map((item) => {
    if (typeof item === "string") {
      try { return JSON.parse(item) as ChatMessage; } catch { return null; }
    }
    return item as ChatMessage;
  }).filter((m): m is ChatMessage => m !== null);
}

export async function saveChatMessage(code: string, message: ChatMessage): Promise<void> {
  const key = CHAT_KEY(code);
  await redis.rpush(key, JSON.stringify(message));
  const len = await redis.llen(key);
  if (len > MAX_HISTORY) {
    await redis.ltrim(key, len - MAX_HISTORY, -1);
  }
  await redis.set(ACTIVE_KEY(code), new Date().toISOString());
}

export async function clearChatHistory(code: string): Promise<void> {
  await Promise.all([
    redis.del(CHAT_KEY(code)),
    redis.del(COUNT_KEY(code)),
    redis.del(ACTIVE_KEY(code)),
  ]);
}

// ─── Free tier counting ───────────────────────────────────────────────────────

export async function getMessageCount(code: string): Promise<number> {
  const count = await redis.get<number>(COUNT_KEY(code));
  return typeof count === "number" ? count : 0;
}

export async function incrementMessageCount(code: string): Promise<void> {
  await redis.incr(COUNT_KEY(code));
}

// ─── Verdict context ──────────────────────────────────────────────────────────

export async function getLastVerdictForCode(code: string): Promise<string | null> {
  try {
    const ids = (await redis.zrange(`sub:${code}:reports`, 0, 0, { rev: true })) as string[];
    if (!ids.length) return null;

    const report = await redis.get<{
      locationName: string;
      severity: string;
      findingCount: number;
      reportData: string;
    }>(`report:${ids[0]}`);
    if (!report) return null;

    let context = `Location: ${report.locationName}\nSeverity: ${report.severity}\nTotal findings: ${report.findingCount}`;

    try {
      const data = JSON.parse(report.reportData) as {
        full_findings?: Array<{ severity: string; title: string; description: string }>;
        corvus_summary?: string;
      };
      const top = (data.full_findings ?? []).slice(0, 5);
      if (top.length) {
        context += "\n\nTop findings:\n" + top.map((f) => `- [${f.severity}] ${f.title}: ${f.description}`).join("\n");
      }
      if (data.corvus_summary) {
        context += `\n\nCorvus summary: ${data.corvus_summary}`;
      }
    } catch { /* non-fatal */ }

    return context;
  } catch {
    return null;
  }
}
