// app/api/subscriptions/upgrade-team-lead/route.ts
// Creates a Stripe Checkout session for the Flock Team Lead add-on.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { validateSubscriptionId, getSubscription } from "@/lib/subscriptions";
import { FLOCK_TEAM_LEAD_PRICING } from "@/lib/price-map";
import redis from "@/lib/redis";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body          = await req.json() as { code?: string; billingPeriod?: string };
    const code          = String(body?.code ?? "").trim().toUpperCase();
    const billingPeriod = body?.billingPeriod === "annual" ? "annual" : "monthly";

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const validation = await validateSubscriptionId(code);
    if (!validation.valid || validation.type !== "subscription") {
      return NextResponse.json({ error: "Invalid or inactive subscription code" }, { status: 403 });
    }
    if (validation.tier !== "flock") {
      return NextResponse.json({ error: "Team Lead upgrade is only available for Flock subscribers" }, { status: 400 });
    }

    // Check if already has Team Lead
    const hasTeamLead = await redis.get(`sub:${code}:team_lead`);
    if (hasTeamLead) {
      return NextResponse.json({ error: "Team Lead is already active on this subscription" }, { status: 400 });
    }

    const sub = await getSubscription(code);
    if (!sub) return NextResponse.json({ error: "Subscription record not found" }, { status: 404 });

    const pricing = FLOCK_TEAM_LEAD_PRICING[billingPeriod];
    if (!pricing.priceId) {
      return NextResponse.json({ error: "Team Lead pricing not configured" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: pricing.priceId, quantity: 1 }],
      metadata: {
        type:           "team_lead_upgrade",
        subscriptionId: code,
        billingPeriod,
      },
      customer_email: sub.customer_email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://oldcrowswireless.com"}/dashboard?teamlead=activated`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://oldcrowswireless.com"}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[subscriptions/upgrade-team-lead]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
