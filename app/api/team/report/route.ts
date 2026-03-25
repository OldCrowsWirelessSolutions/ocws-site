// app/api/team/report/route.ts
// Generates a Team Lead activity report for a given time interval.
// Works for both VIP team leads and Flock/Murder subscription team leads.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isVIPCode, getActiveSubordinates } from "@/lib/vip-codes";
import { validateSubscriptionId, getSeatMembers } from "@/lib/subscriptions";
import { getReportsForSubscription } from "@/lib/reports";
import { buildTeamReport, type TimeInterval } from "@/lib/team-reporting";
import redis from "@/lib/redis";

const REPORT_TYPE_LABELS: Record<string, string> = {
  verdict: "Verdict",
  reckoning_small: "Small Reckoning",
  reckoning_standard: "Standard Reckoning",
  reckoning_commercial: "Commercial Reckoning",
  reckoning_pro: "Pro Reckoning",
};

async function generateCorvusBriefing(report: ReturnType<typeof buildTeamReport>): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "";

  const productSummary = report.members
    .flatMap((m) =>
      Object.entries(m.productBreakdown).map(([p, count]) => `${REPORT_TYPE_LABELS[p] ?? p}: ${count}`)
    )
    .join(", ");

  const memberSummaryLines = report.members
    .filter((m) => m.totalScans > 0)
    .map((m) => `  - ${m.name} (${m.code}): ${m.totalScans} scan${m.totalScans !== 1 ? "s" : ""}, ${m.criticalFindings} critical`)
    .join("\n");

  const prompt = `You are Corvus, an AI security intelligence assistant. Generate a concise team activity briefing (3-4 sentences) for this team lead's security scan report.

REPORT PERIOD: ${report.intervalLabel}
TOTAL SCANS: ${report.totalScans}
ACTIVE MEMBERS: ${report.activeMembers} of ${report.members.length}
CRITICAL FINDINGS: ${report.criticalFindings}
AVG FINDINGS/SCAN: ${report.avgFindingsPerScan}
PRODUCT MIX: ${productSummary || "none"}
MEMBER BREAKDOWN:
${memberSummaryLines || "  No activity this period"}

Write a direct, professional briefing that:
- Opens with a summary of team activity level
- Notes any critical finding concerns if present
- Calls out any inactive members if applicable
- Ends with a forward-looking recommendation
Keep it under 100 words. No bullet points. Write as Corvus would speak — precise, slightly terse.`;

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    return res.content.filter((b) => b.type === "text").map((b) => b.type === "text" ? b.text : "").join("").trim();
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; interval?: string; withBriefing?: boolean };
    const code     = String(body?.code     ?? "").trim().toUpperCase();
    const interval = String(body?.interval ?? "30d").trim() as TimeInterval;
    const withBriefing = body?.withBriefing !== false;

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    // ── Determine if VIP or subscription team lead ────────────────────────────
    interface MemberSet { code: string; name: string }
    let memberSets: MemberSet[] = [];
    let leaderName = "";

    if (isVIPCode(code)) {
      const subs = await getActiveSubordinates(code);
      memberSets = subs.map((s) => ({ code: s.code, name: s.issuedByName ? `Sub-${s.code.slice(-4)}` : `Sub-${s.code.slice(-4)}` }));
      leaderName = code;
    } else {
      const validation = await validateSubscriptionId(code);
      if (!validation.valid || validation.type !== "subscription") {
        return NextResponse.json({ error: "Invalid subscription" }, { status: 403 });
      }
      if (validation.tier !== "flock" && validation.tier !== "murder") {
        return NextResponse.json({ error: "Team reports require Flock or Murder tier" }, { status: 400 });
      }
      if (validation.tier === "flock") {
        const hasTeamLead = await redis.get(`sub:${code}:team_lead`);
        if (!hasTeamLead) {
          return NextResponse.json({ error: "Team Lead not active on this subscription" }, { status: 403 });
        }
      }
      const members = await getSeatMembers(code);
      // Include primary code as "You"
      memberSets = [
        { code, name: validation.customer_name ?? "Primary" },
        ...members.map((m) => ({ code: m.code, name: m.name })),
      ];
      leaderName = validation.customer_name ?? code;
    }

    // ── Fetch reports for each member ─────────────────────────────────────────
    const memberReports = await Promise.all(
      memberSets.map(async ({ code: mCode, name }) => ({
        code: mCode,
        name,
        reports: await getReportsForSubscription(mCode),
      }))
    );

    // ── Build report ──────────────────────────────────────────────────────────
    const report = buildTeamReport(code, memberReports, interval);

    // ── Corvus briefing ───────────────────────────────────────────────────────
    let briefing = "";
    if (withBriefing) {
      briefing = await generateCorvusBriefing(report);
    }

    return NextResponse.json({ report, briefing, leaderName });
  } catch (err) {
    console.error("[team/report]", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
