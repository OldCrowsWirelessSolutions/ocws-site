// app/api/analytics/vip/route.ts
// Returns VIP analytics including all subordinate activity.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getEventsForVIP, buildSummary } from "@/lib/analytics";
import { isVIPCode, getActiveSubordinates } from "@/lib/vip-codes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();

    if (!code) return NextResponse.json({ error: "VIP code required" }, { status: 400 });
    if (!isVIPCode(code)) return NextResponse.json({ error: "Invalid VIP code" }, { status: 403 });

    const [events, subordinates] = await Promise.all([
      getEventsForVIP(code),
      getActiveSubordinates(code),
    ]);

    const summary = buildSummary(code, events);

    const subBreakdown = await Promise.all(
      subordinates.map(async (s) => {
        const { getEventsForCode, buildSummary: bs } = await import("@/lib/analytics");
        const subEvents = await getEventsForCode(s.code);
        const subSummary = bs(s.code, subEvents);
        return { code: s.code, issuedAt: s.issuedAt, expiryType: s.expiryType, totalScans: subSummary.totalScans };
      })
    );

    return NextResponse.json({ summary, subBreakdown });
  } catch (err) {
    console.error("[analytics/vip]", err);
    return NextResponse.json({ error: "Failed to fetch VIP analytics" }, { status: 500 });
  }
}
