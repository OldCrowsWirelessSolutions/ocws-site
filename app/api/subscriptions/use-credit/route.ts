// app/api/subscriptions/use-credit/route.ts
// Records consumption of a subscription credit after a covered product is delivered.
// Called server-side when the client bypasses Stripe checkout.
// Re-validates the subscription before decrementing — never trusts client state.

export const runtime = "nodejs";

import { consumeCredit, validateSubscriptionId } from "@/lib/subscriptions";
import type { ProductType } from "@/lib/subscriptions";
import { decrementLifetimeCredit, isLifetimeCode } from "@/lib/lifetime-codes";

const VALID_PRODUCT_TYPES: ProductType[] = [
  "verdict",
  "reckoning_small",
  "reckoning_standard",
  "reckoning_commercial",
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as {
      subscription_id?: string;
      product_type?: string;
    } | null;

    const subscription_id = String(body?.subscription_id ?? "").trim().toUpperCase();
    const product_type    = String(body?.product_type ?? "").trim() as ProductType;

    if (!subscription_id) {
      return Response.json({ success: false, error: "subscription_id required." }, { status: 400 });
    }
    if (!VALID_PRODUCT_TYPES.includes(product_type)) {
      return Response.json({ success: false, error: "Invalid product_type." }, { status: 400 });
    }

    // Lifetime Flock codes (CORVUS-KYLE) — limited monthly credits
    if (isLifetimeCode(subscription_id) && product_type === "verdict") {
      const result = await decrementLifetimeCredit(subscription_id);
      return Response.json(result, { status: result.success ? 200 : 403 });
    }

    // Re-validate subscription status before consuming any credit
    const validation = await validateSubscriptionId(subscription_id);

    // Unlimited VIP codes (CORVUS-ERIC, CORVUS-MIKE, CORVUS-NATE) — no decrement needed
    if (validation.valid && validation.type === "vip" && validation.verdicts_unlimited) {
      return Response.json({ success: true });
    }

    if (!validation.valid || validation.type !== "subscription") {
      return Response.json(
        { success: false, error: "Subscription is not valid or not active." },
        { status: 403 }
      );
    }

    const result = await consumeCredit(subscription_id, product_type);
    return Response.json(result, { status: result.success ? 200 : 403 });
  } catch (err) {
    console.error("[subscriptions/use-credit]", err);
    return Response.json({ success: false, error: "Failed to record credit usage." }, { status: 500 });
  }
}
