// app/api/subscriptions/details/route.ts
// Returns safe subscriber record details for the dashboard.
// Requires a valid, active subscription code as a query param.

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { getSubscription } from "@/lib/subscriptions";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code) {
    return Response.json({ error: "Code required." }, { status: 400 });
  }

  const sub = await getSubscription(code);
  if (!sub || sub.status !== "active") {
    return Response.json({ error: "Invalid or inactive subscription." }, { status: 403 });
  }

  return Response.json({
    customer_email:        sub.customer_email,
    customer_name:         sub.customer_name,
    tier:                  sub.tier,
    status:                sub.status,
    current_period_start:  sub.current_period_start,
    current_period_end:    sub.current_period_end,
    created_at:            sub.created_at,
    verdicts_used:         sub.verdicts_used,
    reckonings_used:       sub.reckonings_used,
    extra_verdict_credits: sub.extra_verdict_credits,
  });
}
