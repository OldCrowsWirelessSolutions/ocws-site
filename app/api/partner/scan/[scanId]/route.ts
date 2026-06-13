// app/api/partner/scan/[scanId]/route.ts
// Full report body for a single partner scan, for the portal detail page.
// Ownership-checked: the scan's leadCode must match the authenticated partner.
// Auth: x-partner-lead-code header.

export const runtime = "nodejs";

import { getPartnerByCode, getPartnerScanReport } from "@/lib/partner-channel";

export async function GET(
  req: Request,
  { params }: { params: { scanId: string } },
) {
  try {
    const leadCode = req.headers.get("x-partner-lead-code")?.toUpperCase().trim() ?? "";
    if (!leadCode) {
      return Response.json({ error: "x-partner-lead-code header required" }, { status: 401 });
    }
    const partner = await getPartnerByCode(leadCode);
    if (!partner) {
      return Response.json({ error: "Unknown partner code" }, { status: 401 });
    }

    const { scanId } = params;
    const result = await getPartnerScanReport(scanId, leadCode);
    if (!result) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ ok: true, scan: result.scan, report: result.report });
  } catch (err) {
    console.error("[partner/scan/:scanId]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
