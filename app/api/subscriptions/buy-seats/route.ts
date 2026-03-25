// app/api/subscriptions/buy-seats/route.ts
// Creates a Stripe Checkout Session to purchase additional seats for a subscription.
export const runtime = "nodejs";

import Stripe from "stripe";
import { validateSubscriptionId, getSeatCount } from "@/lib/subscriptions";
import { FLOCK_SEAT_PRICES, MURDER_SEAT_PRICES, SEAT_RULES } from "@/lib/price-map";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      code?: string;
      additionalSeats?: number;
      billingPeriod?: "monthly" | "annual";
    };

    const code           = String(body?.code ?? "").trim().toUpperCase();
    const additionalSeats = Number(body?.additionalSeats ?? 0);
    const billingPeriod  = body?.billingPeriod === "annual" ? "annual" : "monthly";

    if (!code) return Response.json({ error: "Subscription code required." }, { status: 400 });
    if (additionalSeats < 1) return Response.json({ error: "Must add at least 1 seat." }, { status: 400 });

    // Validate code and get tier
    const validation = await validateSubscriptionId(code);
    if (!validation.valid || validation.type !== "subscription" || !validation.tier) {
      return Response.json({ error: "Invalid or inactive subscription." }, { status: 403 });
    }

    const tier  = validation.tier;
    const rules = SEAT_RULES[tier];

    // Nest cannot add seats
    if (rules.maxAdditional === 0) {
      return Response.json({ error: "Nest subscribers cannot add seats. Upgrade to Flock." }, { status: 400 });
    }

    // Check seat limits
    if (additionalSeats > rules.maxAdditional) {
      if (tier === "flock") {
        return Response.json({
          error: `Flock maximum is 5 total seats. 6 or more requires a Murder subscription.`,
        }, { status: 400 });
      }
      return Response.json({
        error: `Murder maximum is 15 total seats.`,
      }, { status: 400 });
    }

    // Check current purchased seats won't exceed limit
    const currentAdditional = await getSeatCount(code);
    if (currentAdditional + additionalSeats > rules.maxAdditional) {
      const remaining = rules.maxAdditional - currentAdditional;
      return Response.json({
        error: `You can only add ${remaining} more seat${remaining !== 1 ? "s" : ""} (${rules.maxTotal} total maximum).`,
      }, { status: 400 });
    }

    // Look up Stripe price ID
    const priceTable = tier === "flock" ? FLOCK_SEAT_PRICES : MURDER_SEAT_PRICES;
    const priceEntry = priceTable[additionalSeats];
    if (!priceEntry) {
      return Response.json({ error: "No price configured for that seat count." }, { status: 400 });
    }
    const priceId = billingPeriod === "annual" ? priceEntry.annual : priceEntry.monthly;
    if (!priceId) {
      return Response.json({ error: "Seat price not yet configured. Contact support." }, { status: 503 });
    }

    const origin = req.headers.get("origin") ?? "https://oldcrowswireless.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        type:            "seat_purchase",
        subscriptionId:  code,
        code,
        additionalSeats: String(additionalSeats),
        billingPeriod,
        tier,
      },
      success_url: `${origin}/dashboard?seats=added`,
      cancel_url:  `${origin}/dashboard`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[buy-seats]", err);
    return Response.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
