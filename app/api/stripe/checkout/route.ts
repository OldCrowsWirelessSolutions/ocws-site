import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

const PRODUCTS: Record<string, { name: string; basePrice: number }> = {
  verdict:             { name: "Corvus' Verdict",               basePrice: 50 },
  reckoning_small:    { name: "Full Reckoning — Small (up to 5 locations)",   basePrice: 150 },
  reckoning_standard: { name: "Full Reckoning — Standard (6–15 locations)",   basePrice: 350 },
  reckoning_commercial:{ name: "Full Reckoning — Commercial (16+ locations)", basePrice: 750 },
  reckoning_certified: { name: "Pro Certified Reckoning",                     basePrice: 1500 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      product?: string;
      amount?: number;
      discount_percent?: number;
    };

    const productKey = body.product ?? "verdict";
    const productInfo = PRODUCTS[productKey] ?? PRODUCTS["verdict"];

    const discountPct = typeof body.discount_percent === "number" ? body.discount_percent : 0;
    const basePrice = typeof body.amount === "number" && body.amount > 0
      ? body.amount
      : productInfo.basePrice;
    const finalPrice = discountPct > 0
      ? Math.round(basePrice * (1 - discountPct / 100) * 100)
      : basePrice * 100;

    const origin = req.headers.get("origin") ?? "https://oldcrowswireless.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: finalPrice,
            product_data: {
              name: productInfo.name,
              description: discountPct > 0 ? `${discountPct}% promo discount applied` : undefined,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/crows-eye?verdict=unlocked&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/crows-eye?verdict=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}
