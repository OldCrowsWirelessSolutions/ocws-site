// app/api/partner/billing/route.ts
// Partner billing summary for a month: billable scan count and the config-driven
// revenue math. Payout is a manual invoice in v1 (no Stripe automation yet).
// Auth: x-partner-lead-code header.

export const runtime = "nodejs";

import { getPartnerByCode, getScanCount } from "@/lib/partner-channel";
import { computeBilling, PARTNER_CONFIG } from "@/lib/partner-config";

function currentMonthUTC(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

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
    const month = (url.searchParams.get("month") ?? "").trim() || currentMonthUTC();
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return Response.json({ error: "month must be YYYY-MM" }, { status: 400 });
    }

    const count = await getScanCount(leadCode, month);
    const billing = computeBilling(count);

    return Response.json({
      ok:      true,
      month,
      ...billing,
      revenueSharePct: PARTNER_CONFIG.revenueSharePct,
      payoutNote: "Payout is invoiced manually each month (query → invoice → ACH).",
    });
  } catch (err) {
    console.error("[partner/billing]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
