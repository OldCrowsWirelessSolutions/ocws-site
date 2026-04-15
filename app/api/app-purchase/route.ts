// app/api/app-purchase/route.ts
// Creates a Stripe Checkout session for in-app purchases originating from
// the Crow's Eye mobile app. The webhook at /api/stripe/webhook handles
// credit grant after payment completes.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSubscription } from "@/lib/subscriptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

const PRICE_ENV: Record<string, string> = {
  verdict:              "STRIPE_PRICE_VERDICT",
  "reckoning-small":    "STRIPE_PRICE_RECKONING_SMALL",
  "reckoning-standard": "STRIPE_PRICE_RECKONING_STANDARD",
  "reckoning-commercial": "STRIPE_PRICE_RECKONING_COMMERCIAL",
};

const FALLBACK_AMOUNTS: Record<string, number> = {
  verdict:                5000,
  "reckoning-small":     15000,
  "reckoning-standard":  35000,
  "reckoning-commercial": 75000,
};

const PRODUCT_NAMES: Record<string, string> = {
  verdict:               "Corvus\u2019 Verdict",
  "reckoning-small":    "Full Reckoning \u2014 Small",
  "reckoning-standard": "Full Reckoning \u2014 Standard",
  "reckoning-commercial": "Full Reckoning \u2014 Commercial",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      subscriptionId?: string;
      product?: string;
      returnUrl?: string;
    };

    const subscriptionId = String(body.subscriptionId ?? "").trim().toUpperCase();
    const product = String(body.product ?? "verdict").trim();
    const returnUrl = String(body.returnUrl ?? "").trim();

    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId required." }, { status: 400 });
    }
    if (!PRICE_ENV[product]) {
      return NextResponse.json({ error: `Unknown product: ${product}` }, { status: 400 });
    }

    // Validate subscription exists and is active
    const sub = await getSubscription(subscriptionId);
    if (!sub) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }
    if (sub.status !== "active") {
      return NextResponse.json({ error: "Subscription is not active." }, { status: 403 });
    }

    const origin = req.headers.get("origin") ?? "https://oldcrowswireless.com";
    const priceId = process.env[PRICE_ENV[product]];

    let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;
    if (priceId) {
      lineItem = { price: priceId, quantity: 1 };
    } else {
      lineItem = {
        price_data: {
          currency: "usd",
          unit_amount: FALLBACK_AMOUNTS[product] ?? 5000,
          product_data: { name: PRODUCT_NAMES[product] ?? product },
        },
        quantity: 1,
      };
    }

    // Build success URL — encode returnUrl as query param so success page can deep-link back
    const successParams = new URLSearchParams({
      userId: subscriptionId,
      product,
      session_id: "{CHECKOUT_SESSION_ID}",
    });
    if (returnUrl) successParams.set("returnUrl", returnUrl);

    const cancelParams = new URLSearchParams({ product, userId: subscriptionId });
    if (returnUrl) cancelParams.set("returnUrl", returnUrl);
    cancelParams.set("cancelled", "true");

    // Determine metadata type for webhook
    const isReckoning = product.startsWith("reckoning-");
    const reckoningType = isReckoning ? product.replace("reckoning-", "") : undefined;

    const metadata: Record<string, string> = {
      subscriptionId,
      source: "mobile_app",
    };
    if (isReckoning) {
      metadata.type = "reckoning_purchase";
      metadata.reckoningType = reckoningType!;
    } else {
      metadata.type = "credit_purchase";
      metadata.credits = "1";
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [lineItem],
      metadata,
      success_url: `${origin}/get-credits/success?${successParams.toString()}`,
      cancel_url: `${origin}/get-credits?${cancelParams.toString()}`,
      customer_email: sub.customer_email || undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[app-purchase]", err);
    return NextResponse.json({ error: "Checkout session failed." }, { status: 500 });
  }
}
