// app/api/subscriptions/team-activity/route.ts
// Returns reports from all seat members for a Flock/Murder Team Lead subscriber.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { validateSubscriptionId, getSeatMembers } from "@/lib/subscriptions";
import { getReportsForSubscription } from "@/lib/reports";
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
    if (validation.tier !== "flock" && validation.tier !== "murder") {
      return NextResponse.json({ error: "Team Activity is only available for Flock and Murder subscribers" }, { status: 400 });
    }

    // Flock requires Team Lead purchase; Murder always has it
    if (validation.tier === "flock") {
      const hasTeamLead = await redis.get(`sub:${code}:team_lead`);
      if (!hasTeamLead) {
        return NextResponse.json({ error: "Team Lead not active on this subscription" }, { status: 403 });
      }
    }

    // Get seat member codes
    const members = await getSeatMembers(code);
    const memberCodes = members.map((m) => m.code);

    // Fetch reports for primary code + each member code
    const allCodesReports = await Promise.all([
      getReportsForSubscription(code),
      ...memberCodes.map((mc) => getReportsForSubscription(mc)),
    ]);

    const allReports = allCodesReports
      .flat()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Usage breakdown per seat code
    const usageBreakdown: Record<string, { name: string; count: number }> = {
      [code]: { name: "Primary", count: allCodesReports[0].length },
    };
    members.forEach((m, i) => {
      usageBreakdown[m.code] = { name: m.name, count: allCodesReports[i + 1].length };
    });

    return NextResponse.json({ reports: allReports, usageBreakdown });
  } catch (err) {
    console.error("[subscriptions/team-activity]", err);
    return NextResponse.json({ error: "Failed to fetch team activity" }, { status: 500 });
  }
}
