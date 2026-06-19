// app/api/partner/issue-scan-token/route.ts
// Partner help-desk generates a one-time CORVUS-SCAN-* token to hand to a
// customer. Auth: x-partner-lead-code header (the lead code is the credential).
// Mirrors app/api/team/generate-subordinate/route.ts.

export const runtime = "nodejs";

import { getPartnerByCode, issueScanToken, PartnerCapError } from "@/lib/partner-channel";
import type { ReportType } from "@/lib/reports";

const VALID_REPORT_TYPES: ReportType[] = [
  "verdict",
  "reckoning_small",
  "reckoning_standard",
  "reckoning_commercial",
  "reckoning_pro",
];

export async function POST(req: Request) {
  try {
    const leadCode = req.headers.get("x-partner-lead-code")?.toUpperCase().trim() ?? "";
    if (!leadCode) {
      return Response.json({ error: "x-partner-lead-code header required" }, { status: 401 });
    }

    const partner = await getPartnerByCode(leadCode);
    if (!partner) {
      return Response.json({ error: "Unknown partner code" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({})) as {
      expiresInHours?: number;
      customerName?:   string;
      customerNotes?:  string;
      reportType?:     string;
    };

    // Whitelist the requested scan type; anything unknown falls back to a Verdict.
    const reportType: ReportType =
      VALID_REPORT_TYPES.includes(body?.reportType as ReportType)
        ? (body!.reportType as ReportType)
        : "verdict";

    const token = await issueScanToken(leadCode, {
      expiresInHours: body?.expiresInHours,
      customerName:   body?.customerName,
      customerNotes:  body?.customerNotes,
      reportType,
    });

    return Response.json({
      ok:           true,
      token:        token.token,
      expiresAt:    token.expiresAt,
      customerName: token.customerName,
      reportType:   token.reportType,
    });
  } catch (err) {
    if (err instanceof PartnerCapError) {
      return Response.json({ error: err.message }, { status: 429 });
    }
    console.error("[partner/issue-scan-token]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
