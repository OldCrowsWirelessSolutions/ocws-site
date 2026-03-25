// app/api/subscriptions/cancel/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { validateSubscriptionId, getSubscription, updateSubscription } from "@/lib/subscriptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();

    if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

    const validation = await validateSubscriptionId(code);
    if (!validation.valid || validation.type !== "subscription") {
      return NextResponse.json({ error: "Invalid subscription code" }, { status: 403 });
    }

    const sub = await getSubscription(code);
    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ error: "No Stripe subscription found" }, { status: 400 });
    }

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripeSubResponse = await stripe.subscriptions.retrieve(sub.stripe_subscription_id) as any;
    const accessUntil = new Date((stripeSubResponse.current_period_end ?? 0) * 1000).toISOString();

    await updateSubscription(code, {
      status: "cancelling" as never,
      cancelsAt: accessUntil,
    } as never);

    return NextResponse.json({ success: true, accessUntil });
  } catch (err) {
    console.error("[subscriptions/cancel]", err);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
