// app/api/subscriptions/validate/route.ts
// Validates a Subscription ID (or internal admin/founder/promo code).
// Returns entitlement data safe to expose to the client.
// The client must re-validate server-side before any bypass — do not trust
// client-side state for payment decisions.

export const runtime = "nodejs";

import { validateSubscriptionId } from "@/lib/subscriptions";
import { CREDIT_PRICING, RECKONING_PRICING } from "@/lib/price-map";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as { subscription_id?: string } | null;
    const input = String(body?.subscription_id ?? "").trim();

    if (!input) {
      return Response.json({ valid: false, error: "Subscription ID is required." }, { status: 400 });
    }

    const result = await validateSubscriptionId(input);

    // Enrich with tier-specific pricing for subscription type
    if (result.valid && result.type === "subscription" && result.tier) {
      const cp = CREDIT_PRICING[result.tier];
      const rp = RECKONING_PRICING[result.tier];
      return Response.json({
        ...result,
        credit_pricing: cp ? {
          single:          cp.single,
          singlePrice:     cp.singlePrice,
          sixPack:         cp.sixPack,
          sixPackPrice:    cp.sixPackPrice,
          twelvePack:      cp.twelvePack,
          twelvePackPrice: cp.twelvePackPrice,
        } : undefined,
        reckoning_pricing: rp ?? undefined,
      }, { status: 200 });
    }

    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error("[subscriptions/validate]", err);
    return Response.json({ valid: false, error: "Validation failed." }, { status: 500 });
  }
}
