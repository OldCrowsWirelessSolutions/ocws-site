// app/api/subscriptions/partner-leadcode/route.ts
// Bridges a Murder subscription to its help-desk partner leadCode. The dashboard
// calls this once with the subscriber's own code, gets back a CORVUS-PARTNER-*
// leadCode, and then uses that as the x-partner-lead-code credential for the
// partner endpoints (issue-scan-token / list-scans / scan/[scanId]). Gated to
// active Murder-tier subscriptions only.

export const runtime = "nodejs";

import { validateSubscriptionId, getPartnerLeadCode } from "@/lib/subscriptions";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();
    if (!code) {
      return Response.json({ ok: false, error: "code required" }, { status: 400 });
    }

    const result = await validateSubscriptionId(code);
    if (!result.valid || result.type !== "subscription" || result.tier !== "murder") {
      return Response.json(
        { ok: false, error: "Help Desk is available on the Murder tier." },
        { status: 403 },
      );
    }

    const leadCode = await getPartnerLeadCode(code);
    if (!leadCode) {
      return Response.json(
        { ok: false, error: "Could not provision help-desk access." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, leadCode });
  } catch (err) {
    console.error("[subscriptions/partner-leadcode]", err);
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 503 });
  }
}
