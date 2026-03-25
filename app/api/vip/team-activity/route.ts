// app/api/vip/team-activity/route.ts
// Returns all reports from subordinate codes + linked subscriptions for a VIP.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { isVIPCode, getActiveSubordinates, getLinkedSubscriptions } from "@/lib/vip-codes";
import { getReportsForSubscription } from "@/lib/reports";
import redis from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();

    if (!code) return NextResponse.json({ error: "VIP code required" }, { status: 400 });
    if (!isVIPCode(code)) return NextResponse.json({ error: "Invalid VIP code" }, { status: 403 });

    const [subordinates, linkedSubs] = await Promise.all([
      getActiveSubordinates(code),
      getLinkedSubscriptions(code),
    ]);

    // Collect reports from each subordinate code
    const subReportPromises = subordinates.map(async (sub) => {
      const subReportsKey = `sub:${sub.code}:reports`;
      const ids = (await redis.zrange(subReportsKey, 0, -1, { rev: true })) as string[];
      if (!ids.length) return [];
      const records = await Promise.all(
        ids.map((id) => redis.get(`report:${id}`))
      );
      return records.filter(Boolean);
    });

    // Collect reports from linked subscriptions
    const linkedReportPromises = linkedSubs.map((subId) =>
      getReportsForSubscription(subId)
    );

    const [subReportResults, linkedReportResults] = await Promise.all([
      Promise.all(subReportPromises),
      Promise.all(linkedReportPromises),
    ]);

    const allReports = [
      ...subReportResults.flat(),
      ...linkedReportResults.flat(),
    ].sort((a, b) => {
      const aDate = (a as { createdAt?: string })?.createdAt ?? "";
      const bDate = (b as { createdAt?: string })?.createdAt ?? "";
      return bDate.localeCompare(aDate);
    });

    return NextResponse.json({ reports: allReports });
  } catch (err) {
    console.error("[vip/team-activity]", err);
    return NextResponse.json({ error: "Failed to fetch team activity" }, { status: 500 });
  }
}
