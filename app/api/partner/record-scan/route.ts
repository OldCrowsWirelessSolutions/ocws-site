// app/api/partner/record-scan/route.ts
// Mobile posts here when a scan run under a partner grant completes. This is the
// billable event: it persists the full report (so the partner portal can show
// it) and atomically increments the partner's monthly scan counter.
// Auth: x-app-token (same soft gate as app/api/mobile/verdict-analyze) — the
// scan was already authorized at redeem time; the leadCode comes from that grant.

export const runtime = "nodejs";

import { getPartnerByCode, recordPartnerScan } from "@/lib/partner-channel";
import type { ReportSeverity, ReportType } from "@/lib/reports";

const APP_TOKEN = process.env.EXPO_PUBLIC_CORVUS_APP_TOKEN
  ?? process.env.OCWS_MOBILE_APP_TOKEN
  ?? "";

const SEVERITIES: ReportSeverity[] = ["critical", "warning", "info"];
const REPORT_TYPES: ReportType[] = [
  "verdict",
  "reckoning_small",
  "reckoning_standard",
  "reckoning_commercial",
  "reckoning_pro",
];

export async function POST(req: Request) {
  try {
    if (APP_TOKEN) {
      const tok = req.headers.get("x-app-token") ?? "";
      if (tok !== APP_TOKEN) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json() as {
      leadCode?:     string;
      token?:        string;
      reportData?:   string | object;
      ssid?:         string;
      locationName?: string;
      findingCount?: number;
      severity?:     string;
      customerName?: string;
      reportType?:   string;
    };

    const leadCode = String(body?.leadCode ?? "").trim().toUpperCase();
    if (!leadCode) {
      return Response.json({ ok: false, error: "leadCode required" }, { status: 400 });
    }
    const partner = await getPartnerByCode(leadCode);
    if (!partner) {
      return Response.json({ ok: false, error: "Unknown partner code" }, { status: 401 });
    }

    if (body?.reportData === undefined || body?.reportData === null) {
      return Response.json({ ok: false, error: "reportData required" }, { status: 400 });
    }
    // Store the report body as a JSON string regardless of how it arrived.
    const reportData = typeof body.reportData === "string"
      ? body.reportData
      : JSON.stringify(body.reportData);

    const severity = SEVERITIES.includes(body?.severity as ReportSeverity)
      ? (body!.severity as ReportSeverity)
      : "info";

    const reportType: ReportType = REPORT_TYPES.includes(body?.reportType as ReportType)
      ? (body!.reportType as ReportType)
      : "verdict";

    const scan = await recordPartnerScan({
      leadCode,
      token:        body?.token ?? null,
      reportData,
      ssid:         body?.ssid,
      locationName: body?.locationName,
      findingCount: Number(body?.findingCount ?? 0),
      severity,
      customerName: body?.customerName ?? null,
      reportType,
    });

    return Response.json({ ok: true, scanId: scan.scanId });
  } catch (err) {
    console.error("[partner/record-scan]", err);
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 503 });
  }
}
