// app/api/subscriptions/buy-reckoning/route.ts
// Creates a Stripe Checkout session to purchase an additional Full Reckoning.
// Enforces tier access rules: Nest can only buy Small; Murder has unlimited.

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import Stripe from "stripe";
import { validateSubscriptionId } from "@/lib/subscriptions";
import { RECKONING_PRICING } from "@/lib/price-map";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

type ReckoningType = "small" | "standard" | "commercial";
const VALID_TYPES: ReckoningType[] = ["small", "standard", "commercial"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; type?: string };
    const code          = String(body?.code ?? "").trim().toUpperCase();
    const reckoningType = String(body?.type ?? "") as ReckoningType;

    if (!code || !VALID_TYPES.includes(reckoningType)) {
      return Response.json(
        { error: "code and type (small|standard|commercial) are required." },
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
        { error: "Murder subscribers have unlimited Reckonings included — no purchase needed." },
        { status: 400 }
      );
    }

    if (tier === "nest" && (reckoningType === "standard" || reckoningType === "commercial")) {
      return Response.json(
        { error: "Upgrade to Flock for Standard and Commercial Reckonings." },
        { status: 403 }
      );
    }

    const tierPricing = RECKONING_PRICING[tier];
    const priceId = reckoningType === "small"       ? tierPricing.small
                  : reckoningType === "standard"    ? tierPricing.standard
                  :                                   tierPricing.commercial;

    if (!priceId) {
      return Response.json(
        { error: "Price not configured for this tier and reckoning type. Contact support." },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") ?? "https://oldcrowswireless.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        type:           "reckoning_purchase",
        subscriptionId: code,
        code,
        reckoningType,
        tier,
      },
      success_url: `${origin}/dashboard?reckoning=purchased&type=${reckoningType}`,
      cancel_url:  `${origin}/dashboard`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[buy-reckoning]", err);
    return Response.json({ error: "Checkout session failed." }, { status: 500 });
  }
}
