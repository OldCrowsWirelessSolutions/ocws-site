// app/api/subscriptions/pause/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { validateSubscriptionId, getSubscription, updateSubscription } from "@/lib/subscriptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; pauseDays?: number };
    const code = String(body?.code ?? "").trim().toUpperCase();
    const pauseDays = body?.pauseDays === 60 ? 60 : 30;

    if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

    const validation = await validateSubscriptionId(code);
    if (!validation.valid || validation.type !== "subscription") {
      return NextResponse.json({ error: "Invalid subscription code" }, { status: 403 });
    }

    const sub = await getSubscription(code);
    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ error: "No Stripe subscription found" }, { status: 400 });
    }

    const resumesAt = Math.floor(Date.now() / 1000) + pauseDays * 86400;

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      pause_collection: {
        behavior: "keep_as_draft",
        resumes_at: resumesAt,
      },
    } as Parameters<typeof stripe.subscriptions.update>[1]);

    await updateSubscription(code, {
      status: "paused" as never,
      pausedUntil: new Date(resumesAt * 1000).toISOString(),
    } as never);

    return NextResponse.json({
      success: true,
      resumesAt: new Date(resumesAt * 1000).toISOString(),
    });
  } catch (err) {
    console.error("[subscriptions/pause]", err);
    return NextResponse.json({ error: "Failed to pause subscription" }, { status: 500 });
  }
}
