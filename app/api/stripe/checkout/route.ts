import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { validatePromoCode, redeemPromoCode } from "@/lib/promo-codes";
import { SEAT_PRICE_IDS, FLOCK_SEAT_PRICES, MURDER_SEAT_PRICES } from "@/lib/price-map";

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
  // Subscription plans
  "nest-monthly":    "STRIPE_PRICE_NEST_MONTHLY",
  "nest-annual":     "STRIPE_PRICE_NEST_ANNUAL",
  "flock-monthly":   "STRIPE_PRICE_FLOCK_MONTHLY",
  "flock-annual":    "STRIPE_PRICE_FLOCK_ANNUAL",
  "murder-monthly":  "STRIPE_PRICE_MURDER_MONTHLY",
  "murder-annual":   "STRIPE_PRICE_MURDER_ANNUAL",
};

// Recurring price IDs — these use mode: "subscription"
const SUBSCRIPTION_PRICE_IDS = new Set([
  "price_1TEV81PXI1fk4YpacVKKcIze", // Nest monthly
  "price_1TEV9WPXI1fk4Ypa6KioV00n", // Nest annual
  "price_1TEVBCPXI1fk4YpaUhBqj7o5", // Flock monthly
  "price_1TEVCVPXI1fk4Ypa20nY5G7y", // Flock annual
  "price_1TEVLCPXI1fk4Ypa19fYGfCK", // Murder monthly
  "price_1TEVMLPXI1fk4YpaDQMFj27E", // Murder annual
]);

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
      promoCode?: string;
      honorCode?: string;
      additionalSeats?: number;
      tier?: string;
      isAnnual?: boolean;
    };

    // Promo code bypass — validate, redeem, and return without creating a Stripe session
    if (body.promoCode) {
      const code = body.promoCode.trim().toUpperCase();
      const promoResult = await validatePromoCode(code);
      if (!promoResult) {
        return NextResponse.json({ error: "Invalid or already used promo code" }, { status: 400 });
      }
      const redeemed = await redeemPromoCode(code);
      if (!redeemed) {
        return NextResponse.json({ error: "Invalid or already used promo code" }, { status: 400 });
      }
      return NextResponse.json({ promoUnlocked: true, type: promoResult.type });
    }

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

    const isSubscription = priceId ? (SUBSCRIPTION_PRICE_IDS.has(priceId) || SEAT_PRICE_IDS.includes(priceId)) : false;
    const mode = isSubscription ? "subscription" : "payment";

    // Build seat add-on line item if additional seats requested
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [lineItem];
    const additionalSeats = typeof body.additionalSeats === "number" ? body.additionalSeats : 0;
    if (additionalSeats > 0 && isSubscription) {
      const tier = body.tier ?? "";
      const isAnnual = body.isAnnual ?? false;
      let seatPriceId: string | undefined;
      if (tier === "flock" && FLOCK_SEAT_PRICES[additionalSeats]) {
        seatPriceId = isAnnual
          ? FLOCK_SEAT_PRICES[additionalSeats].annual
          : FLOCK_SEAT_PRICES[additionalSeats].monthly;
      } else if (tier === "murder" && MURDER_SEAT_PRICES[additionalSeats]) {
        seatPriceId = isAnnual
          ? MURDER_SEAT_PRICES[additionalSeats].annual
          : MURDER_SEAT_PRICES[additionalSeats].monthly;
      }
      if (seatPriceId) {
        lineItems.push({ price: seatPriceId, quantity: 1 });
      }
    }

    // Honor discount coupon (CORVUS-HONOR)
    const honorCouponId = process.env.STRIPE_HONOR_COUPON_ID;
    const applyHonorCoupon = body.honorCode === "CORVUS-HONOR" && !!honorCouponId;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode,
      line_items: lineItems,
      success_url: isSubscription
        ? `${origin}/dashboard?subscribed=true&session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/crows-eye?verdict=unlocked&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: isSubscription
        ? `${origin}/?cancelled=true`
        : `${origin}/crows-eye?verdict=cancelled`,
      ...(applyHonorCoupon ? { discounts: [{ coupon: honorCouponId! }] } : {}),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}
