// app/api/reports/save/route.ts
// Called silently from CrowsEyeClient after each Verdict/Reckoning generation.
// Validates the code, determines tier-based retention, then saves (or skips).

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { saveReport, ReportRecord, ReportType, ReportSeverity } from "@/lib/reports";
import { validateSubscriptionId } from "@/lib/subscriptions";

const RETENTION_BY_TIER: Record<string, number> = {
  nest:   0,
  flock:  180,
  murder: 365,
};

/**
 * Returns retention days for the code, or null if the code is invalid.
 *   0    → valid code, but no storage (Nest / promo / bypass)
 *   >0   → valid code, save with this TTL in days
 *   null → unrecognised / invalid code
 */
async function getRetentionDays(code: string): Promise<number | null> {
  if (!code) return null;
  const upper = code.toUpperCase();

  // Bypass codes (admin secret, founding NEST code) — valid but no storage
  if (upper === "OCWS2026" || upper === "CORVUS-NEST") return 0;
  if (process.env.OCWS_ADMIN_SECRET && code === process.env.OCWS_ADMIN_SECRET) return 0;

  try {
    const result = await validateSubscriptionId(upper);

    if (!result.valid) {
      // Already-used promo codes won't validate but the scan already happened.
      // Check Redis directly; if the promo record exists, allow save with no retention.
      try {
        const redis = (await import("@/lib/redis")).default;
        const record = await redis.get<{ used?: boolean }>(`promo:${upper}`);
        if (record) return 0;
      } catch { /* */ }
      return null;
    }

    if (result.type === "vip")          return 365;
    if (result.type === "subscription") return RETENTION_BY_TIER[result.tier ?? ""] ?? 0;
    // promo, admin, founder → valid but no long-term storage
    return 0;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<ReportRecord> & { codeUsed?: string };
    const code = String(body?.codeUsed ?? "").trim();

    const retentionDays = await getRetentionDays(code);
    if (retentionDays === null) {
      return NextResponse.json({ saved: false, error: "Invalid code" }, { status: 401 });
    }

    const reportId = body.reportId ?? `OCWS-RPT-${Date.now()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

    // Nest / promo / bypass — no storage, but return reportId for analytics
    if (retentionDays === 0) {
      return NextResponse.json({ saved: false, skipped: true, reportId });
    }

    const record: ReportRecord = {
      reportId,
      type: (body.type ?? "verdict") as ReportType,
      subscriptionId: body.subscriptionId ?? null,
      email: body.email ?? null,
      codeUsed: code,
      createdAt: body.createdAt ?? new Date().toISOString(),
      locationName: String(body.locationName ?? "Unknown").slice(0, 200),
      findingCount: Number(body.findingCount ?? 0),
      severity: (body.severity ?? "info") as ReportSeverity,
      reportData: body.reportData ?? "{}",
      pdfAvailable: body.pdfAvailable ?? false,
    };

    await saveReport(reportId, record, retentionDays);
    return NextResponse.json({ saved: true, reportId });
  } catch (err) {
    console.error("[reports/save]", err);
    return NextResponse.json({ saved: false, error: "Save failed" }, { status: 500 });
  }
}
