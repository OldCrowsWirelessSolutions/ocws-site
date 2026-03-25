// app/api/chat/route.ts
// Corvus AI chat endpoint. Validates code, enforces free-tier limits,
// fetches chat history, calls Anthropic, saves response.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CORVUS_CHAT_SYSTEM_PROMPT } from "@/lib/corvus-chat";
import {
  getChatHistory,
  saveChatMessage,
  getMessageCount,
  incrementMessageCount,
  getLastVerdictForCode,
} from "@/lib/chat";
import { validateSubscriptionId } from "@/lib/subscriptions";
import { recordChatEvent } from "@/lib/analytics";

const FREE_MESSAGE_LIMIT = 3;

type AccessLevel = "unlimited" | "free" | "denied";

async function getAccessLevel(code: string): Promise<AccessLevel> {
  if (!code) return "denied";
  const upper = code.toUpperCase();

  // Admin / bypass
  if (upper === "OCWS-CORVUS-FOUNDER-JOSHUA" || upper === "CORVUS-NEST") return "unlimited";
  if (process.env.OCWS_ADMIN_SECRET && code === process.env.OCWS_ADMIN_SECRET) return "unlimited";

  try {
    const result = await validateSubscriptionId(upper);
    if (!result.valid) return "denied";

    if (result.type === "vip")          return "unlimited";
    if (result.type === "subscription") return "unlimited";
    if (result.type === "founder")      return "unlimited";
    if (result.type === "admin")        return "unlimited";
    if (result.type === "promo")        return "free";

    return "denied";
  } catch {
    return "denied";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; message?: string; comfortLevel?: number };
    const code    = String(body?.code    ?? "").trim();
    const message = String(body?.message ?? "").trim().slice(0, 2000);
    const comfortLevel = Number(body?.comfortLevel ?? 2);

    console.log("[chat] received:", { code: code ? `${code.slice(0, 8)}...` : "(empty)", messageLen: message.length });

    if (!code || !message) {
      return NextResponse.json({ error: "Missing code or message" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[chat] ANTHROPIC_API_KEY is not set");
      return NextResponse.json({ error: "Chat unavailable — API key not configured." }, { status: 500 });
    }

    // ── Access check ─────────────────────────────────────────────────────────
    const access = await getAccessLevel(code);
    if (access === "denied") {
      return NextResponse.json({ error: "Invalid or inactive code" }, { status: 401 });
    }

    if (access === "free") {
      const count = await getMessageCount(code);
      if (count >= FREE_MESSAGE_LIMIT) {
        return NextResponse.json({
          limited: true,
          message: "You've used your 3 free messages. Subscribe from $20/mo for unlimited access to Corvus.",
          messagesRemaining: 0,
        });
      }
    }

    // ── Build context ─────────────────────────────────────────────────────────
    const [history, lastVerdict] = await Promise.all([
      getChatHistory(code),
      getLastVerdictForCode(code),
    ]);

    const contextInjection = lastVerdict
      ? `\n\nUSER'S LAST VERDICT CONTEXT:\n${lastVerdict}\n\nReference this naturally if relevant to the conversation.`
      : "";

    const comfortNote = comfortLevel
      ? `\n\nUSER COMFORT LEVEL: ${comfortLevel}/5 — adapt language accordingly.`
      : "";

    const systemPrompt = CORVUS_CHAT_SYSTEM_PROMPT + contextInjection + comfortNote;

    // Last 20 messages for context window
    const contextMessages = history.slice(-20).map((m) => ({ role: m.role, content: m.content }));

    // ── Call Anthropic ────────────────────────────────────────────────────────
    const client = new Anthropic({ apiKey });
    const aiResponse = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        ...contextMessages,
        { role: "user", content: message },
      ],
    });

    const responseText = aiResponse.content
      .filter((b) => b.type === "text")
      .map((b) => b.type === "text" ? b.text : "")
      .join("");

    // ── Save history ──────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    await Promise.all([
      saveChatMessage(code, { role: "user",      content: message,      timestamp: now }),
      saveChatMessage(code, { role: "assistant", content: responseText,  timestamp: now }),
    ]);

    // ── Track + limit ─────────────────────────────────────────────────────────
    recordChatEvent(code).catch(() => {});

    let messagesRemaining: number | undefined;
    if (access === "free") {
      await incrementMessageCount(code);
      const newCount = await getMessageCount(code);
      messagesRemaining = Math.max(0, FREE_MESSAGE_LIMIT - newCount);
    }

    return NextResponse.json({ response: responseText, messagesRemaining });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chat] CRASH:", msg);
    return NextResponse.json({ error: `Chat failed: ${msg}` }, { status: 500 });
  }
}
