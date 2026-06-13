// app/api/partner/list-scans/route.ts
// Partner portal pulls its inbound scan feed, newest first. Summary records only;
// the full report body is fetched per-scan via /api/partner/scan/[scanId].
// Auth: x-partner-lead-code header.

export const runtime = "nodejs";

import { getPartnerByCode, listScans } from "@/lib/partner-channel";

export async function GET(req: Request) {
  try {
    const leadCode = req.headers.get("x-partner-lead-code")?.toUpperCase().trim() ?? "";
    if (!leadCode) {
      return Response.json({ error: "x-partner-lead-code header required" }, { status: 401 });
    }
    const partner = await getPartnerByCode(leadCode);
    if (!partner) {
      return Response.json({ error: "Unknown partner code" }, { status: 401 });
    }

    const url = new URL(req.url);
    const sinceRaw = url.searchParams.get("since");
    const since = sinceRaw ? Number(sinceRaw) : undefined;

    const scans = await listScans(leadCode, Number.isFinite(since) ? since : undefined);
    return Response.json({ ok: true, scans });
  } catch (err) {
    console.error("[partner/list-scans]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
