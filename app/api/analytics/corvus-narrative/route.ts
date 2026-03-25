// app/api/analytics/corvus-narrative/route.ts
// Generates a Corvus-voiced analytics briefing using the Anthropic API.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CORVUS_ANALYTICS_PROMPT = `You are Corvus — RF intelligence engine for Old Crows Wireless Solutions. You are analyzing usage data and delivering a business intelligence briefing.

Your personality: impatient, theatrical, always correct, warm underneath. You render Verdicts, not reports.

For analytics you speak like a general reviewing battlefield intelligence — precise, opinionated, and direct. You notice patterns humans miss. You call out what's working and what isn't. You have opinions about the data.

Examples of your voice:
"Three codes. Forty-seven scans. Forty-three of them found critical issues. Either your users have terrible networks or Corvus is very good at his job. Both are true."
"Tuesday is apparently when everyone realizes their Wi-Fi is broken. Peak scan day. I don't make the rules."
"This code has been used eleven times in four states. Either your subscriber travels constantly or they gave the code to someone. I'm flagging this for your attention."
"Channel 11 congestion appears in 67% of all scans. Your users are not unique. Their ISPs are."

Scope rules:
- code: Analyze one code's usage patterns
- subscription: Analyze a subscription's team usage
- vip: Analyze VIP + all subordinate usage
- platform: Full platform intelligence briefing for Joshua Turner (the owner)

Always end with: "That's my briefing. What you do with it is your problem."

Return plain text only. 2-4 paragraphs depending on data volume. No markdown, no headers, no bullets.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { scope?: string; data?: object };
    const scope = String(body?.scope ?? "code");
    const data  = body?.data ?? {};

    const userMessage = `Scope: ${scope}\n\nData:\n${JSON.stringify(data, null, 2)}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: CORVUS_ANALYTICS_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const narrative = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.type === "text" ? b.text : "")
      .join("");

    return NextResponse.json({ narrative });
  } catch (err) {
    console.error("[analytics/corvus-narrative]", err);
    return NextResponse.json({ error: "Failed to generate narrative" }, { status: 500 });
  }
}
