// app/api/subscriptions/buy-credits/route.ts
// Creates a Stripe Checkout session for additional Verdict credit packs.
// Price is tier-specific — Flock subscribers pay less than public rate.

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import Stripe from "stripe";
import { validateSubscriptionId } from "@/lib/subscriptions";
import { CREDIT_PRICING } from "@/lib/price-map";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

const CREDITS_FOR_PACK: Record<string, number> = {
  single: 1,
  "6pack": 6,
  "12pack": 12,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; pack?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();
    const pack = String(body?.pack ?? "");

    if (!code || !CREDITS_FOR_PACK[pack]) {
      return Response.json(
        { error: "code and pack (single|6pack|12pack) are required." },
        { status: 400 }
      );
    }

    // Validate subscription
    const result = await validateSubscriptionId(code);
    if (!result.valid || result.type !== "subscription") {
      return Response.json({ error: "Invalid or inactive subscription." }, { status: 403 });
    }

    const tier = result.tier!;

    if (tier === "murder") {
      return Response.json(
        { error: "Murder subscribers have unlimited credits — no purchase needed." },
        { status: 400 }
      );
    }

    const pricing = CREDIT_PRICING[tier];
    const priceId = pack === "single" ? pricing.single
                  : pack === "6pack"  ? pricing.sixPack
                  :                    pricing.twelvePack;

    if (!priceId) {
      return Response.json(
        { error: "Price not configured for this tier. Contact support." },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") ?? "https://oldcrowswireless.com";
    const credits = CREDITS_FOR_PACK[pack];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        type:           "credit_purchase",
        subscriptionId: code,
        code,
        pack,
        credits:        String(credits),
        tier,
      },
      success_url: `${origin}/dashboard?credits=added`,
      cancel_url:  `${origin}/dashboard`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[buy-credits]", err);
    return Response.json({ error: "Checkout session failed." }, { status: 500 });
  }
}
