import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

// Map product keys to env var names holding the Stripe Price ID.
// Fallback prices used only if a discount is applied (requires dynamic price_data).
const PRICE_ID_ENV: Record<string, string> = {
  "verdict":              "STRIPE_PRICE_VERDICT",
  "reckoning-small":      "STRIPE_PRICE_RECKONING_SMALL",
  "reckoning-standard":   "STRIPE_PRICE_RECKONING_STANDARD",
  "reckoning-commercial": "STRIPE_PRICE_RECKONING_COMMERCIAL",
  "pro":                  "STRIPE_PRICE_PRO_CERTIFIED",
  "credit-single":        "STRIPE_PRICE_CREDIT_SINGLE",
  "credit-6pack":         "STRIPE_PRICE_CREDIT_6PACK",
  "credit-12pack":        "STRIPE_PRICE_CREDIT_12PACK",
};

const FALLBACK_PRICES: Record<string, number> = {
  "verdict": 50, "reckoning-small": 150, "reckoning-standard": 350,
  "reckoning-commercial": 750, "pro": 1500,
  "credit-single": 15, "credit-6pack": 75, "credit-12pack": 120,
};

const PRODUCT_NAMES: Record<string, string> = {
  "verdict": "Corvus\u2019 Verdict",
  "reckoning-small": "Full Reckoning \u2014 Small",
  "reckoning-standard": "Full Reckoning \u2014 Standard",
  "reckoning-commercial": "Full Reckoning \u2014 Commercial",
  "pro": "Pro Certified Reckoning",
  "credit-single": "Verdict Credit \u2014 Single",
  "credit-6pack": "Verdict Credits \u2014 6-Pack",
  "credit-12pack": "Verdict Credits \u2014 12-Pack",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      product?: string;
      amount?: number;
      discount_percent?: number;
    };

    const productKey = body.product ?? "verdict";
    const discountPct = typeof body.discount_percent === "number" ? body.discount_percent : 0;
    const origin = req.headers.get("origin") ?? "https://oldcrowswireless.com";

    const priceId = process.env[PRICE_ID_ENV[productKey] ?? ""];

    let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;

    if (priceId && discountPct === 0) {
      // Use the pre-created Stripe Price ID — no discount
      lineItem = { price: priceId, quantity: 1 };
    } else {
      // Discount applied, or price ID missing — fall back to dynamic price_data
      const basePrice = typeof body.amount === "number" && body.amount > 0
        ? body.amount
        : (FALLBACK_PRICES[productKey] ?? 50);
      const finalAmount = discountPct > 0
        ? Math.round(basePrice * (1 - discountPct / 100) * 100)
        : basePrice * 100;
      lineItem = {
        price_data: {
          currency: "usd",
          unit_amount: finalAmount,
          product_data: {
            name: PRODUCT_NAMES[productKey] ?? productKey,
            description: discountPct > 0 ? `${discountPct}% promo discount applied` : undefined,
          },
        },
        quantity: 1,
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [lineItem],
      success_url: `${origin}/crows-eye?verdict=unlocked&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/crows-eye?verdict=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}
