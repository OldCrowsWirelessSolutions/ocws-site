// app/api/team/report/route.ts
// Generates a Team Lead activity report for a given time interval.
// Supports subscription team leads (Flock/Murder) and VIP team leads.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { isVIPCode, getActiveSubordinates } from "@/lib/vip-codes";
import { validateSubscriptionId, getSeatMembers } from "@/lib/subscriptions";
import { getReportsForSubscription } from "@/lib/reports";
import { buildTeamReportWithBriefing, getAvailableMonths, type TimeInterval } from "@/lib/team-reporting";
import redis from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; interval?: string };
    const code     = String(body?.code     ?? "").trim().toUpperCase();
    const interval = String(body?.interval ?? "30d").trim() as TimeInterval;

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    interface MemberSet { code: string; name: string }
    let memberSets: MemberSet[] = [];
    let leaderName = "";
    let companyName = "";

    if (isVIPCode(code)) {
      const subs = await getActiveSubordinates(code);
      memberSets = [
        { code, name: code },
        ...subs.map((s) => ({ code: s.code, name: `Sub-${s.code.slice(-4)}` })),
      ];
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
      memberSets = [
        { code, name: validation.customer_name ?? "Primary" },
        ...members.map((m) => ({ code: m.code, name: m.name })),
      ];
      leaderName = validation.customer_name ?? code;
    }

    // Fetch reports for each member
    const memberReportsData = await Promise.all(
      memberSets.map(async ({ code: mCode, name }) => ({
        code: mCode,
        name,
        reports: await getReportsForSubscription(mCode),
      }))
    );

    // Gather all reports for available months calculation
    const allReports = memberReportsData.flatMap((m) => m.reports);
    const availableMonths = getAvailableMonths(allReports);

    const report = await buildTeamReportWithBriefing(
      code,
      leaderName,
      companyName,
      memberReportsData,
      interval
    );

    return NextResponse.json({ report, availableMonths });
  } catch (err) {
    console.error("[team/report]", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
