import redis from "../redis";

/**
 * Per-LEARNER monthly "talk to Corvus" pool for the edu surfaces (Aerie/Academy/
 * Campus). Distinct from the Field/wireless chat economy (chat-pool.ts) — that's
 * tier-based and account-keyed; this is product-based and LEARNER-keyed, because
 * an Aerie family has many kids and each gets their own pool. Pinned numbers per
 * the entitlement spec; resets monthly (UTC).
 *
 * FAILS OPEN on a Redis error — never block a learner's lesson chat on infra.
 * Throws EduChatQuotaError when the monthly pool is exhausted (→ resets on the 1st
 * / parent can upgrade). Buy-more for edu is future work.
 */

export class EduChatQuotaError extends Error {}

// Included Corvus chat turns / learner / month, by surface (entitlement spec).
const POOL_BY_SURFACE: Record<string, number> = {
  aerie: 250,
  academy: 400,
  campus_k12: 250,
  campus_higher_ed: 250
};

const MONTH_TTL_SECONDS = 60 * 60 * 24 * 40; // covers the longest month + slack

function yearMonthUTC(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function consumeEduChatTurn(learnerId: string, surface: string): Promise<void> {
  const pool = POOL_BY_SURFACE[surface] ?? 250;
  const key = `rookery:educhat:${learnerId}:${yearMonthUTC()}`;
  let count: number;
  try {
    count = await redis.incr(key);
    if (count === 1) await redis.expire(key, MONTH_TTL_SECONDS);
  } catch (e) {
    console.warn("[rookery.edupool] redis unavailable, allowing:", (e as Error).message);
    return;
  }
  if (count > pool) {
    throw new EduChatQuotaError(
      "You've used this month's Corvus chat for this learner. It resets on the 1st."
    );
  }
}

export interface EduChatStatus {
  limit: number;
  used: number;
  remaining: number;
}

/** Read-only monthly edu-chat snapshot for a learner (no consume). Fail-soft. */
export async function eduChatRemaining(learnerId: string, surface: string): Promise<EduChatStatus> {
  const pool = POOL_BY_SURFACE[surface] ?? 250;
  try {
    const used = Number((await redis.get<number>(`rookery:educhat:${learnerId}:${yearMonthUTC()}`)) ?? 0);
    return { limit: pool, used, remaining: Math.max(0, pool - used) };
  } catch {
    return { limit: pool, used: 0, remaining: pool };
  }
}
