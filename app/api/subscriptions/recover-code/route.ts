// app/api/subscriptions/recover-code/route.ts
// Sends the subscriber's existing code to their email.
// Does NOT reissue a new code — just retrieves and emails the current one.
// Rate-limited to 3 attempts per email per hour.

export const runtime = "nodejs";

import { getSubscription, getSubscriptionByEmail, REDIS_KEYS, type SubscriptionTier } from "@/lib/subscriptions";
import { getAccountByEmail } from "@/lib/accounts";
import { sendCodeRecoveryEmail } from "@/lib/subscription-email";
import redis from "@/lib/redis";

const RATE_LIMIT  = 3;
const RATE_WINDOW = 3600; // seconds

const SAFE_RESPONSE = {
  success: true,
  message: "If an active subscription exists for that email, your code is on its way.",
};

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body  = await req.json().catch(() => null) as { email?: string } | null;
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !isEmail(email)) {
      return Response.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateKey  = REDIS_KEYS.recovery(email);
    const attempts = await redis.incr(rateKey);
    if (attempts === 1) await redis.expire(rateKey, RATE_WINDOW);
    if (attempts > RATE_LIMIT) return Response.json(SAFE_RESPONSE);

    // Fast path: look up via email→code index (set during checkout)
    const fastCode = await redis.get<string>(`email:${email}:code`);
    if (fastCode) {
      const sub = await getSubscription(fastCode);
      if (sub && sub.status === "active") {
        try {
          await sendCodeRecoveryEmail(email, fastCode, sub.tier);
        } catch (err) {
          console.error("[recover-code] email send failed (non-fatal):", err);
        }
        return Response.json(SAFE_RESPONSE);
      }
    }

    // Fallback: look up by email index (covers OCWS-format subscription IDs)
    const sub = await getSubscriptionByEmail(email);
    if (sub && sub.status === "active") {
      try {
        await sendCodeRecoveryEmail(email, sub.subscription_id, sub.tier);
      } catch (err) {
        console.error("[recover-code] email send failed (non-fatal):", err);
      }
      return Response.json(SAFE_RESPONSE);
    }

    // Final fallback: any account indexed by email — free shell codes, VIP, and
    // anything else that lives in the unified account hub but not the
    // subscription tables. This is what makes "email recovers your Corvus Code"
    // work for every account, not just paid subscribers.
    const account = await getAccountByEmail(email);
    if (account) {
      try {
        await sendCodeRecoveryEmail(email, account.code, account.tier as SubscriptionTier);
      } catch (err) {
        console.error("[recover-code] account email send failed (non-fatal):", err);
      }
    }

    return Response.json(SAFE_RESPONSE);
  } catch (err) {
    console.error("[subscriptions/recover-code]", err);
    return Response.json(SAFE_RESPONSE);
  }
}
