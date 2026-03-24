// app/api/subscriptions/seed/route.ts
// Manual subscription creation for testing without a Stripe subscription event.
// Protected by OCWS_ADMIN_SECRET — never expose publicly.
// Remove or gate behind auth before going to broad production use.

export const runtime = "nodejs";

import { createSubscription, generateSubscriptionId } from "@/lib/subscriptions";
import { sendSubscriptionConfirmation } from "@/lib/subscription-email";
import type { SubscriptionTier } from "@/lib/subscriptions";

const VALID_TIERS: SubscriptionTier[] = ["nest", "flock", "murder"];

export async function POST(req: Request) {
  const adminSecret = process.env.OCWS_ADMIN_SECRET;
  if (!adminSecret) {
    return Response.json({ error: "OCWS_ADMIN_SECRET not configured." }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => null) as {
      admin_secret?: string;
      name?: string;
      email?: string;
      tier?: string;
      send_email?: boolean;
    } | null;

    if (body?.admin_secret !== adminSecret) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const name  = String(body?.name  ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const tier  = String(body?.tier  ?? "").toLowerCase() as SubscriptionTier;

    if (!name || !email || !VALID_TIERS.includes(tier)) {
      return Response.json(
        { error: "name, email, and tier (nest|flock|murder) are required." },
        { status: 400 }
      );
    }

    const subscription_id = generateSubscriptionId(tier);
    const now = new Date();
    const period_end = new Date(now);
    period_end.setMonth(period_end.getMonth() + 1);

    const record = await createSubscription({
      subscription_id,
      customer_email:           email,
      customer_name:            name,
      tier,
      status:                   "active",
      stripe_subscription_id:   null,
      stripe_customer_id:       null,
      current_period_start:     now.toISOString(),
      current_period_end:       period_end.toISOString(),
      verdicts_used:            0,
      reckonings_used:          { small: 0, standard: 0, commercial: 0 },
      extra_verdict_credits:    0,
    });

    // Optionally send the confirmation email
    if (body?.send_email !== false) {
      try {
        await sendSubscriptionConfirmation({
          to:               email,
          customer_name:    name,
          subscription_id,
          tier,
          period_end:       period_end.toISOString(),
        });
      } catch (emailErr) {
        console.error("[seed] Email send failed (non-fatal):", emailErr);
      }
    }

    return Response.json({
      success: true,
      subscription_id: record.subscription_id,
      tier:            record.tier,
      status:          record.status,
      period_end:      record.current_period_end,
    });
  } catch (err) {
    console.error("[subscriptions/seed]", err);
    return Response.json({ error: "Seed failed." }, { status: 500 });
  }
}
