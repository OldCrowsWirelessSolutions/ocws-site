// app/api/partner/monitor/route.ts
// Help-desk read-out for the Team Lead / Owner: this month's completed scans
// (with the issuing agent + type, for the per-agent breakdown) plus the itemized
// per-type billing readout. Auth: x-partner-lead-code (the account credential).
// Read-only — issuing happens via /api/partner/issue-scan-token.

export const runtime = "nodejs";

import { getPartnerByCode, getScanCountsByType, listScans } from "@/lib/partner-channel";
import { computeHelpDeskBill } from "@/lib/partner-config";

export async function GET(req: Request) {
  try {
    const leadCode = req.headers.get("x-partner-lead-code")?.toUpperCase().trim() ?? "";
    if (!leadCode) {
      return Response.json({ ok: false, error: "x-partner-lead-code header required" }, { status: 401 });
    }
    const partner = await getPartnerByCode(leadCode);
    if (!partner) {
      return Response.json({ ok: false, error: "Unknown partner code" }, { status: 401 });
    }

    const now = new Date();
    const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const startOfMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

    const [counts, scans] = await Promise.all([
      getScanCountsByType(leadCode, ym),  // authoritative billing counts
      listScans(leadCode, startOfMonth),   // month's scans, for per-agent breakdown
    ]);

    return Response.json({
      ok: true,
      month: ym,
      bill: computeHelpDeskBill(ym, counts),
      scans,
    });
  } catch (err) {
    console.error("[partner/monitor]", err);
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 503 });
  }
}
