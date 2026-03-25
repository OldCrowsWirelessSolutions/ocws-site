// app/api/team/report/csv/route.ts
// Returns a CSV export of all scan events for a team in a given interval.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { isVIPCode, getActiveSubordinates } from "@/lib/vip-codes";
import { validateSubscriptionId, getSeatMembers } from "@/lib/subscriptions";
import { getReportsForSubscription } from "@/lib/reports";
import { filterReportsByInterval, getIntervalLabel, type TimeInterval } from "@/lib/team-reporting";
import redis from "@/lib/redis";

const REPORT_TYPE_LABELS: Record<string, string> = {
  verdict: "Verdict",
  reckoning_small: "Small Reckoning",
  reckoning_standard: "Standard Reckoning",
  reckoning_commercial: "Commercial Reckoning",
  reckoning_pro: "Pro Reckoning",
};

function escapeCSV(val: string | number | null | undefined): string {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; interval?: string };
    const code     = String(body?.code     ?? "").trim().toUpperCase();
    const interval = String(body?.interval ?? "30d").trim() as TimeInterval;

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    interface MemberSet { code: string; name: string }
    let memberSets: MemberSet[] = [];

    if (isVIPCode(code)) {
      const subs = await getActiveSubordinates(code);
      memberSets = [
        { code, name: code },
        ...subs.map((s) => ({ code: s.code, name: `Sub-${s.code.slice(-4)}` })),
      ];
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
          return NextResponse.json({ error: "Team Lead not active" }, { status: 403 });
        }
      }
      const members = await getSeatMembers(code);
      memberSets = [
        { code, name: validation.customer_name ?? "Primary" },
        ...members.map((m) => ({ code: m.code, name: m.name })),
      ];
    }

    const memberReportsData = await Promise.all(
      memberSets.map(async ({ code: mCode, name }) => ({
        code: mCode,
        name,
        reports: filterReportsByInterval(await getReportsForSubscription(mCode), interval),
      }))
    );

    const rows: string[] = [
      ["Date", "Member", "Code", "Location", "Report Type", "Severity", "Findings", "Critical", "Warning"].map(escapeCSV).join(","),
    ];

    for (const m of memberReportsData) {
      for (const s of m.reports) {
        rows.push([
          new Date(s.createdAt).toLocaleDateString("en-US"),
          m.name,
          m.code,
          s.locationName || "Unknown",
          REPORT_TYPE_LABELS[s.type] ?? s.type,
          s.severity,
          s.findingCount,
          s.severity === "critical" ? 1 : 0,
          s.severity === "warning"  ? 1 : 0,
        ].map(escapeCSV).join(","));
      }
    }

    const csv = rows.join("\n");
    const intervalLabel = getIntervalLabel(interval).replace(/\s+/g, "-").toLowerCase();
    const filename = `OCWS-Team-Report-${intervalLabel}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[team/report/csv]", err);
    return NextResponse.json({ error: "Failed to generate CSV" }, { status: 500 });
  }
}
