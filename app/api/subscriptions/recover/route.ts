// app/api/subscriptions/recover/route.ts
// Subscription ID recovery by email.
// Generates a new ID, invalidates the old one, and emails the new ID.
// Always returns a safe generic response — never reveals whether an email exists.
// Rate-limited to 3 attempts per email per hour via Redis TTL counter.

export const runtime = "nodejs";

import {
  getSubscriptionByEmail,
  generateSubscriptionId,
  createSubscription,
  updateSubscription,
  REDIS_KEYS,
} from "@/lib/subscriptions";
import { sendSubscriptionRecovery } from "@/lib/subscription-email";
import redis from "@/lib/redis";

const RATE_LIMIT = 3;       // max attempts
const RATE_WINDOW = 3600;   // seconds (1 hour)

const SAFE_RESPONSE = {
  success: true,
  message: "If an active subscription exists for that email, a recovery email has been sent.",
};

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as { email?: string } | null;
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !isEmail(email)) {
      return Response.json({ success: false, error: "A valid email address is required." }, { status: 400 });
    }

    // Rate limiting — up to RATE_LIMIT attempts per email per hour
    const rateKey = REDIS_KEYS.recovery(email);
    const attempts = await redis.incr(rateKey);
    if (attempts === 1) {
      // Set expiry on first attempt within the window
      await redis.expire(rateKey, RATE_WINDOW);
    }
    if (attempts > RATE_LIMIT) {
      // Return the safe generic response — do not reveal rate limit to caller
      return Response.json(SAFE_RESPONSE);
    }

    // Look up active subscription — silently no-op if not found
    const sub = await getSubscriptionByEmail(email);
    if (!sub || sub.status !== "active") {
      return Response.json(SAFE_RESPONSE);
    }

    // Generate a new Subscription ID and retire the old one
    const new_id     = generateSubscriptionId(sub.tier);
    const old_id     = sub.subscription_id;
    const now        = new Date().toISOString();

    // Create new record (copies the existing subscription, new ID)
    await createSubscription({
      subscription_id:         new_id,
      customer_email:          sub.customer_email,
      customer_name:           sub.customer_name,
      tier:                    sub.tier,
      status:                  "active",
      stripe_subscription_id:  sub.stripe_subscription_id,
      stripe_customer_id:      sub.stripe_customer_id,
      current_period_start:    sub.current_period_start,
      current_period_end:      sub.current_period_end,
      verdicts_used:           sub.verdicts_used,
      reckonings_used:         sub.reckonings_used,
      extra_verdict_credits:   sub.extra_verdict_credits,
    });

    // Invalidate old ID
    await updateSubscription(old_id, {
      status: "expired",
      updated_at: now,
    });

    // Log the reissue event on the new record for audit trail
    console.log(`[recover] Reissued subscription. old=${old_id} new=${new_id} email=${email} at=${now}`);

    // Send recovery email — non-fatal on failure
    try {
      await sendSubscriptionRecovery({
        to:                  sub.customer_email,
        customer_name:       sub.customer_name,
        new_subscription_id: new_id,
        tier:                sub.tier,
      });
    } catch (emailErr) {
      console.error("[recover] Email send failed (non-fatal):", emailErr);
    }

    return Response.json(SAFE_RESPONSE);
  } catch (err) {
    console.error("[subscriptions/recover]", err);
    // Return safe generic response even on unexpected errors
    return Response.json(SAFE_RESPONSE);
  }
}
