// app/api/analytics/subscription/route.ts
// Returns analytics for a subscription (and its seat members if Team Lead).
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getEventsForCode, buildSummary } from "@/lib/analytics";
import { validateSubscriptionId, getSeatMembers } from "@/lib/subscriptions";
import redis from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const validation = await validateSubscriptionId(code);
    if (!validation.valid || validation.type !== "subscription") {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 403 });
    }

    const isTeamLead = validation.tier === "murder" || !!(await redis.get(`sub:${code}:team_lead`));
    const members    = isTeamLead ? await getSeatMembers(code) : [];

    const [myEvents, ...memberEventSets] = await Promise.all([
      getEventsForCode(code),
      ...members.map((m) => getEventsForCode(m.code)),
    ]);

    const mySummary = buildSummary(code, myEvents);

    const seatBreakdown = members.map((m, i) => ({
      code:       m.code,
      name:       m.name,
      totalScans: memberEventSets[i].length,
    }));

    return NextResponse.json({
      summary: mySummary,
      isTeamLead,
      seatBreakdown,
    });
  } catch (err) {
    console.error("[analytics/subscription]", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
