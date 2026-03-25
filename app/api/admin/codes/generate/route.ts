// app/api/admin/codes/generate/route.ts
// Manually creates a new subscription record with a generated ID.
// Used for gifted/manual subscriptions outside of Stripe.

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import {
  generateSubscriptionId,
  createSubscription,
} from "@/lib/subscriptions";
import type { SubscriptionTier } from "@/lib/subscriptions";
import { sendSubscriptionConfirmation } from "@/lib/subscription-email";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "SpectrumLife2026!!";
const VALID_TIERS: SubscriptionTier[] = ["nest", "flock", "murder"];

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      tier?: string;
      email?: string;
      name?: string;
      send_email?: boolean;
    };

    const tier = String(body?.tier ?? "").toLowerCase() as SubscriptionTier;
    const email = String(body?.email ?? "").trim().toLowerCase();
    const name = String(body?.name ?? email).trim();

    if (!VALID_TIERS.includes(tier) || !email) {
      return Response.json(
        { error: "tier (nest|flock|murder) and email are required." },
        { status: 400 }
      );
    }

    const subscription_id = generateSubscriptionId(tier);
    const now = new Date();
    const period_end = new Date(now);
    period_end.setMonth(period_end.getMonth() + 1);

    await createSubscription({
      subscription_id,
      customer_email:          email,
      customer_name:           name,
      tier,
      status:                  "active",
      stripe_subscription_id:  null,
      stripe_customer_id:      null,
      current_period_start:    now.toISOString(),
      current_period_end:      period_end.toISOString(),
      verdicts_used:           0,
      reckonings_used:         { small: 0, standard: 0, commercial: 0 },
      extra_verdict_credits:   0,
    });

    if (body?.send_email !== false) {
      try {
        await sendSubscriptionConfirmation({
          to:            email,
          customer_name: name,
          subscription_id,
          tier,
          period_end:    period_end.toISOString(),
        });
      } catch (err) {
        console.error("[admin/codes/generate] Email failed (non-fatal):", err);
      }
    }

    return Response.json({ subscription_id, tier, email });
  } catch (err) {
    console.error("[admin/codes/generate]", err);
    return Response.json({ error: "Generation failed." }, { status: 500 });
  }
}
