// app/api/admin/credits/add/route.ts
// Adds extra (non-expiring) Verdict credits to a subscription.

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { getSubscription, updateSubscription } from "@/lib/subscriptions";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET ?? "OCWS2026";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json() as { subscription_id?: string; credits?: number };
    const id = String(body?.subscription_id ?? "").trim().toUpperCase();
    const credits = Number(body?.credits ?? 0);

    if (!id || !Number.isInteger(credits) || credits < 1) {
      return Response.json(
        { error: "subscription_id and a positive integer credits value are required." },
        { status: 400 }
      );
    }

    const sub = await getSubscription(id);
    if (!sub) {
      return Response.json({ error: "Subscription not found." }, { status: 404 });
    }

    await updateSubscription(id, {
      extra_verdict_credits: sub.extra_verdict_credits + credits,
    });

    return Response.json({
      success: true,
      subscription_id: id,
      credits_added: credits,
      total_extra: sub.extra_verdict_credits + credits,
    });
  } catch (err) {
    console.error("[admin/credits/add]", err);
    return Response.json({ error: "Failed to add credits." }, { status: 500 });
  }
}
