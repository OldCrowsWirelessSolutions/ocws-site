// app/api/chat/route.ts
// Corvus AI chat endpoint. Validates code, enforces free-tier limits,
// fetches chat history, calls Anthropic, saves response.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildCorvusSystemPrompt } from "@/lib/corvus-chat";
import { getTodayHoliday, getHolidayGreeting } from "@/lib/corvus-calendar";
import {
  getChatHistory,
  saveChatMessage,
  getMessageCount,
  incrementMessageCount,
} from "@/lib/chat";
import { getReportsForCode, type ReportRecord } from "@/lib/reports";
import { validateSubscriptionId } from "@/lib/subscriptions";
import { recordChatEvent } from "@/lib/analytics";

const FREE_MESSAGE_LIMIT = 3;

function buildReportContext(reports: ReportRecord[]): string {
  return reports.map((r, i) => {
    const data = typeof r.reportData === 'string' ? JSON.parse(r.reportData) : r.reportData;
    const findings = data?.full_findings?.slice(0, 5).map((f: { title: string; severity: string }) => `  - ${f.title} (${f.severity})`).join('\n') || '';
    return `SCAN ${i + 1} — ${r.locationName || 'Unknown Location'} — ${new Date(r.createdAt).toLocaleDateString()}
Severity: ${r.severity} | Findings: ${r.findingCount}
${findings}
Summary: ${data?.corvus_summary || 'No summary'}`;
  }).join('\n\n');
}

type AccessLevel = "unlimited" | "free" | "denied";

async function getAccessLevel(code: string): Promise<AccessLevel> {
  if (!code) return "denied";
  const upper = code.toUpperCase();

  // Admin / founder / VIP / lifetime / subordinate bypass codes — all get unlimited
  const { isKnownBypassCode } = await import("@/lib/code-resolver");
  if (isKnownBypassCode(upper)) return "unlimited";
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
    const body = await req.json() as { code?: string; message?: string; comfortLevel?: number; reportContext?: string };
    const code    = String(body?.code    ?? "").trim();
    const message = String(body?.message ?? "").trim().slice(0, 2000);
    const comfortLevel = Number(body?.comfortLevel ?? 2);
    const reportContext = body?.reportContext ? String(body.reportContext).slice(0, 4000) : null;

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
    const [history, recentReports] = await Promise.all([
      getChatHistory(code),
      getReportsForCode(code),
    ]);
    const lastVerdict = recentReports.length > 0 ? buildReportContext(recentReports.slice(0, 5)) : null;

    const reportContextInjection = reportContext
      ? `\n\nACTIVE REPORT CONTEXT — USE THIS FOR ALL RESPONSES:\n${reportContext}\n\nCRITICAL: Answer all questions with specific reference to THIS scan. Never give generic Wi-Fi advice when you have specific data from this report. Reference specific findings, locations, and recommendations from the report above.`
      : "";

    const contextInjection = !reportContext && lastVerdict
      ? `\n\nUSER'S SCAN HISTORY (${recentReports.length} scan${recentReports.length !== 1 ? 's' : ''} on record — most recent first):\n${lastVerdict}\n\nReference scan history naturally when relevant. If the user asks about previous scans, comparisons, or trends — use this data. If they ask about a specific location reference the matching scan.`
      : "";

    const comfortNote = comfortLevel
      ? `\n\nUSER COMFORT LEVEL: ${comfortLevel}/5 — adapt language accordingly.`
      : "";

    const holiday = getTodayHoliday();
    const holidayGreetingLine = holiday ? getHolidayGreeting(holiday.type, false, new Date().getFullYear()) : null;
    const isSolemn = holiday?.type === 'good_friday';
    const holidayNote = holiday
      ? `\n\nTODAY IS ${holiday.name.toUpperCase()}. You are aware of this. ${isSolemn ? "This is a solemn day. No humor today — respond with appropriate weight and respect." : `If it comes up naturally in conversation, you may acknowledge it in your voice. Your holiday line: "${holidayGreetingLine ?? holiday.name}"`}`
      : "";

    const todayNote = `\n\nTODAY'S DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    const systemPromptBase = await buildCorvusSystemPrompt();
    const systemPrompt = systemPromptBase + reportContextInjection + contextInjection + comfortNote + holidayNote + todayNote;

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
    console.error("[chat]", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
