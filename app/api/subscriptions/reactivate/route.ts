// app/api/subscriptions/reactivate/route.ts
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

    // Remove both cancellation and pause
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: false,
      pause_collection: "" as never,
    });

    await updateSubscription(code, {
      status: "active",
      cancelsAt: null as never,
      pausedUntil: null as never,
    } as never);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[subscriptions/reactivate]", err);
    return NextResponse.json({ error: "Failed to reactivate subscription" }, { status: 500 });
  }
}
