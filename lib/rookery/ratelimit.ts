import redis from "../redis";

/**
 * Abuse backstop for the Rookery brain. NOT the billing economy — that's the
 * tier-based monthly pools + packs in lib/chat-quota.ts (single source of truth
 * for the wireless side) and the future per-code entitlement model. This is the
 * hard per-account hourly/daily ceiling that stops a runaway script or a "free
 * ChatGPT" abuser from robbing us blind, independent of which tier they're on.
 *
 * Set well above any genuine power-user so it never bites a real customer — it
 * only exists to cap the tail. Admins bypass. Only LLM-calling channels count;
 * cheap local repo CRUD is unlimited.
 *
 * FAILS OPEN: if Redis is unreachable (or unconfigured, e.g. in a tsx harness),
 * requests are allowed. A rate limiter must never be a single point of failure
 * for the product; losing the backstop briefly is better than losing the brain.
 */

export class RateLimitError extends Error {}

type LimitClass = "chat" | "generate" | "grade";

// Per-account ceilings. Tune here. (generate = an expensive multi-pass deliverable;
// grade = a cheap Haiku check; chat = a "talk to Corvus" turn.)
// These are ABUSE ceilings ("nobody legitimately does this"), NOT the product's
// per-tier caps — those are the monthly pools in the entitlement layer (future)
// and chat-quota.ts. Set high enough to never bite a real power-user mid-session.
const LIMITS: Record<LimitClass, { perHour: number; perDay: number }> = {
  chat: { perHour: 100, perDay: 400 },
  generate: { perHour: 60, perDay: 300 },
  grade: { perHour: 300, perDay: 2000 }
};

// Only channels that hit Anthropic are metered. Anything absent is unlimited.
const CHANNEL_CLASS: Record<string, LimitClass> = {
  "chat:send": "chat",
  "learning:chat:send": "chat",
  "learning:lesson:generate": "generate",
  "learning:lesson:generate-streaming": "generate",
  "learning:project:generate": "generate",
  "learning:assessment:generate": "generate",
  "learning:assessment:grade": "generate",
  "learning:digest:weekly": "generate",
  "learning:narrative:evaluate": "generate",
  "learning:recall:grade": "grade",
  "learning:remediate:explain": "grade"
};

async function bump(key: string, ttlSeconds: number, limit: number, label: string): Promise<void> {
  let count: number;
  try {
    count = await redis.incr(key);
    if (count === 1) await redis.expire(key, ttlSeconds);
  } catch (e) {
    // Redis unavailable/unconfigured — fail open (allow), but make it visible.
    console.warn("[rookery.ratelimit] redis unavailable, allowing:", (e as Error).message);
    return;
  }
  if (count > limit) {
    throw new RateLimitError(
      `Rate limit reached (${label}: ${limit}). Slow down and try again later, or upgrade your plan.`
    );
  }
}

/**
 * Throw RateLimitError if this account has exceeded the hourly or daily ceiling
 * for the channel's class. No-op for admins, unmetered channels, or when an
 * account code is somehow absent (auth is enforced upstream in authz.enforce).
 */
export async function checkRateLimit(
  channel: string,
  accountCode: string | null,
  isAdmin: boolean
): Promise<void> {
  if (isAdmin) return;
  const cls = CHANNEL_CLASS[channel];
  if (!cls || !accountCode) return;
  const limits = LIMITS[cls];
  await bump(`rookery:rl:h:${cls}:${accountCode}`, 3600, limits.perHour, `${cls} hourly`);
  await bump(`rookery:rl:d:${cls}:${accountCode}`, 86400, limits.perDay, `${cls} daily`);
}
