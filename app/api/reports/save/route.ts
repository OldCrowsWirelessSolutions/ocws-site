// app/api/reports/save/route.ts
// Called silently from CrowsEyeClient after each Verdict/Reckoning generation.
// Validates the code, then saves the report to Redis.

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { saveReport, ReportRecord, ReportType, ReportSeverity } from "@/lib/reports";
import { validateSubscriptionId } from "@/lib/subscriptions";
import { validatePromoCode } from "@/lib/promo-codes";

const FOUNDING_CODES = new Set(["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC"]);

async function isValidCode(code: string): Promise<boolean> {
  if (!code) return false;
  const upper = code.toUpperCase();

  // Admin / founding codes
  if (upper === "OCWS2026" || FOUNDING_CODES.has(upper)) return true;
  if (code === (process.env.OCWS_ADMIN_SECRET ?? "")) return true;

  // Subscriber subscription ID
  try {
    const result = await validateSubscriptionId(upper);
    if (result.valid) return true;
  } catch { /* */ }

  // Promo code (may already be used — that's OK, report still gets saved)
  try {
    const record = await import("@/lib/redis").then(m => m.default.get<{ used?: boolean }>(`promo:${upper}`));
    if (record) return true;
  } catch { /* */ }

  // Unused promo validation
  const promo = await validatePromoCode(upper).catch(() => null);
  if (promo) return true;

  return false;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<ReportRecord> & { codeUsed?: string };
    const code = String(body?.codeUsed ?? "").trim();

    // Silently validate — don't block report saving for expired/used promo codes
    // (the report generation already happened; just save it)
    const valid = await isValidCode(code);
    if (!valid) {
      return NextResponse.json({ saved: false, error: "Invalid code" }, { status: 401 });
    }

    const reportId = body.reportId ?? `OCWS-RPT-${Date.now()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

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

    await saveReport(reportId, record);
    return NextResponse.json({ saved: true, reportId });
  } catch (err) {
    console.error("[reports/save]", err);
    return NextResponse.json({ saved: false, error: "Save failed" }, { status: 500 });
  }
}
