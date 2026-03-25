// lib/subscriptions.ts
// All subscription business logic: types, ID generation, CRUD, validation,
// credit consumption. The backend is the single source of truth — the client
// only stores what is safe to display.

import redis from "./redis";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionTier = "nest" | "flock" | "murder";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "expired";
export type ProductType =
  | "verdict"
  | "reckoning_small"
  | "reckoning_standard"
  | "reckoning_commercial";

export interface SubscriptionRecord {
  subscription_id: string;           // OCWS-NEST-X7K2P9QR
  customer_email: string;
  customer_name: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;  // ISO 8601
  current_period_end: string | null;    // ISO 8601
  verdicts_used: number;
  reckonings_used: { small: number; standard: number; commercial: number };
  extra_verdict_credits: number;        // purchased add-ons, never expire
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  valid: boolean;
  type: "subscription" | "founder" | "admin" | "promo" | null;
  tier?: SubscriptionTier;
  customer_name?: string;
  verdicts_remaining?: number;       // 999 = unlimited
  verdicts_unlimited?: boolean;
  reckonings_remaining?: { small: number; standard: number; commercial: number };
  reckonings_unlimited?: { small: boolean; standard: boolean; commercial: boolean };
  discount_percent?: number;
  discount_label?: string;
  // Seat info (only for subscription type)
  seat_limit?: number;
  seats_used?: number;
  seat_token?: string;               // assigned/confirmed device token
  error?: string;
}

export interface DeviceRecord {
  token: string;        // UUID stored in client localStorage
  subscription_id: string;
  user_agent: string;
  registered_at: string;
  last_seen: string;
}

// ─── Tier entitlements ────────────────────────────────────────────────────────
// Infinity is only used internally — never serialised to JSON.

export const TIER_ENTITLEMENTS: Record<
  SubscriptionTier,
  {
    verdicts_per_month: number;
    reckonings_per_month: { small: number; standard: number; commercial: number };
    seat_limit: number;
  }
> = {
  nest: {
    verdicts_per_month: 3,
    reckonings_per_month: { small: 1, standard: 0, commercial: 0 },
    seat_limit: 1,
  },
  flock: {
    verdicts_per_month: 15,
    reckonings_per_month: { small: 3, standard: 1, commercial: 0 },
    seat_limit: 5,
  },
  murder: {
    verdicts_per_month: 999999,
    reckonings_per_month: { small: 999999, standard: 10, commercial: 3 },
    seat_limit: 15,
  },
};

// ─── Internal access codes (admin / founder / promo) ─────────────────────────
// Kept server-side only. The client never receives the full code list.

const INTERNAL_CODES: Record<
  string,
  {
    type: "admin" | "founder" | "promo";
    name?: string;
    discount?: number;
    label?: string;
    expires_at?: string; // ISO 8601 UTC — code invalid at or after this time
  }
> = {
  "OCWS2026":         { type: "admin",   name: "Joshua Turner" },
  "OCWS-ADMIN-2026":  { type: "admin",   name: "Joshua Turner" },
  "CORVUS-NEST":      { type: "founder", name: "Joshua Turner" },
  "CORVUS-TRY-9R4M":  { type: "founder", name: "Guest", expires_at: "2026-03-26T05:00:00.000Z" },
  "CORVUS-NATE-2026": { type: "founder", name: "Nathanael Farrelly" },
  "CORVUS-ERIC-2026": { type: "founder", name: "Eric Mims" },
  "CORVUS-MIKE-2026": { type: "founder", name: "Mike Arbouret" },
  "CORVUS-NATE":      { type: "founder", name: "Nathanael Farrelly" },
  "CORVUS-ERIC":      { type: "founder", name: "Eric Mims" },
  "CORVUS-MIKE":      { type: "founder", name: "Mike Arbouret" },
  "LAUNCH50":         { type: "promo",   discount: 50,  label: "50% off" },
  "PENSACOLA25":      { type: "promo",   discount: 25,  label: "25% off" },
  "FIRSTCITY20":      { type: "promo",   discount: 20,  label: "20% off \u2014 First City Internet" },
  "NATE10":           { type: "promo",   discount: 10,  label: "10% off" },
  "ERIC10":           { type: "promo",   discount: 10,  label: "10% off" },
  "MIKE10":           { type: "promo",   discount: 10,  label: "10% off" },
};

// ─── Redis key schema ─────────────────────────────────────────────────────────

export const REDIS_KEYS = {
  sub:      (id: string)    => `sub:${id}`,
  email:    (email: string) => `email_idx:${email.toLowerCase().trim()}`,
  stripeSub:(stripeSubId: string) => `stripe_sub_idx:${stripeSubId}`,
  // Rate-limiting for recovery endpoint
  recovery: (email: string) => `recovery_rate:${email.toLowerCase().trim()}`,
  // Device seat tracking: set of registered device tokens per subscription
  deviceSet:(subId: string) => `devices:${subId}`,
  device:   (token: string) => `device:${token}`,
};

// ─── Subscription ID generation ───────────────────────────────────────────────
// Excludes visually ambiguous characters (O, I, 0, 1).

const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateSubscriptionId(tier: SubscriptionTier): string {
  const random = Array.from(
    { length: 8 },
    () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]
  ).join("");
  return `OCWS-${tier.toUpperCase()}-${random}`;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createSubscription(
  data: Omit<SubscriptionRecord, "created_at" | "updated_at">
): Promise<SubscriptionRecord> {
  const now = new Date().toISOString();
  const record: SubscriptionRecord = { ...data, created_at: now, updated_at: now };

  await redis.set(REDIS_KEYS.sub(record.subscription_id), record);

  // Secondary indexes for webhook lookups
  if (record.customer_email) {
    await redis.set(REDIS_KEYS.email(record.customer_email), record.subscription_id);
  }
  if (record.stripe_subscription_id) {
    await redis.set(REDIS_KEYS.stripeSub(record.stripe_subscription_id), record.subscription_id);
  }

  return record;
}

export async function getSubscription(
  subscription_id: string
): Promise<SubscriptionRecord | null> {
  return redis.get<SubscriptionRecord>(REDIS_KEYS.sub(subscription_id));
}

export async function getSubscriptionByEmail(
  email: string
): Promise<SubscriptionRecord | null> {
  const subId = await redis.get<string>(REDIS_KEYS.email(email));
  if (!subId) return null;
  return getSubscription(subId);
}

export async function getSubscriptionByStripeId(
  stripeSubId: string
): Promise<SubscriptionRecord | null> {
  const subId = await redis.get<string>(REDIS_KEYS.stripeSub(stripeSubId));
  if (!subId) return null;
  return getSubscription(subId);
}

export async function updateSubscription(
  subscription_id: string,
  updates: Partial<SubscriptionRecord>
): Promise<SubscriptionRecord | null> {
  const existing = await getSubscription(subscription_id);
  if (!existing) return null;

  const updated: SubscriptionRecord = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await redis.set(REDIS_KEYS.sub(subscription_id), updated);

  // Keep email index current if email changed
  if (updates.customer_email && updates.customer_email !== existing.customer_email) {
    await redis.set(REDIS_KEYS.email(updates.customer_email), subscription_id);
  }

  return updated;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export async function validateSubscriptionId(
  input: string
): Promise<ValidationResult> {
  const code = input.trim().toUpperCase();

  // 1. Internal codes (admin, founder, promo) — checked first
  const internal = INTERNAL_CODES[code];
  if (internal) {
    if (internal.expires_at && new Date() >= new Date(internal.expires_at)) {
      return { valid: false, type: null, error: "This code has expired." };
    }
    if (internal.type === "promo") {
      return {
        valid: true,
        type: "promo",
        discount_percent: internal.discount,
        discount_label: internal.label,
      };
    }
    return {
      valid: true,
      type: internal.type,
      customer_name: internal.name,
    };
  }

  // 2. Live subscription record
  const sub = await getSubscription(code);
  if (!sub) {
    return { valid: false, type: null, error: "Subscription ID not found." };
  }

  if (sub.status !== "active") {
    return { valid: false, type: null, error: `Subscription is ${sub.status}.` };
  }

  if (sub.current_period_end && new Date(sub.current_period_end) < new Date()) {
    return { valid: false, type: null, error: "Subscription period has expired." };
  }

  const ent = TIER_ENTITLEMENTS[sub.tier];

  const UNLIMITED = 999999;

  const verdicts_unlimited = ent.verdicts_per_month >= UNLIMITED;
  const verdicts_remaining = verdicts_unlimited
    ? UNLIMITED
    : Math.max(0, ent.verdicts_per_month - sub.verdicts_used) + sub.extra_verdict_credits;

  const reckonings_remaining = {
    small:
      ent.reckonings_per_month.small >= UNLIMITED
        ? UNLIMITED
        : Math.max(0, ent.reckonings_per_month.small - sub.reckonings_used.small),
    standard:
      ent.reckonings_per_month.standard >= UNLIMITED
        ? UNLIMITED
        : Math.max(0, ent.reckonings_per_month.standard - sub.reckonings_used.standard),
    commercial:
      ent.reckonings_per_month.commercial >= UNLIMITED
        ? UNLIMITED
        : Math.max(0, ent.reckonings_per_month.commercial - sub.reckonings_used.commercial),
  };

  const reckonings_unlimited = {
    small:      ent.reckonings_per_month.small >= UNLIMITED,
    standard:   ent.reckonings_per_month.standard >= UNLIMITED,
    commercial: ent.reckonings_per_month.commercial >= UNLIMITED,
  };

  const ent2 = TIER_ENTITLEMENTS[sub.tier];
  const deviceTokens = await getDeviceTokens(code);

  return {
    valid: true,
    type: "subscription",
    tier: sub.tier,
    customer_name: sub.customer_name,
    verdicts_remaining,
    verdicts_unlimited,
    reckonings_remaining,
    reckonings_unlimited,
    seat_limit: ent2.seat_limit,
    seats_used: deviceTokens.length,
  };
}

// ─── Credit consumption ───────────────────────────────────────────────────────

export async function consumeCredit(
  subscription_id: string,
  product: ProductType
): Promise<{ success: boolean; error?: string }> {
  const sub = await getSubscription(subscription_id);
  if (!sub) return { success: false, error: "Subscription not found." };
  if (sub.status !== "active") return { success: false, error: "Subscription is not active." };

  const ent = TIER_ENTITLEMENTS[sub.tier];

  if (product === "verdict") {
    const unlimited = ent.verdicts_per_month >= 999999;
    if (!unlimited) {
      const monthly_remaining = ent.verdicts_per_month - sub.verdicts_used;
      if (monthly_remaining <= 0 && sub.extra_verdict_credits <= 0) {
        return { success: false, error: "No Verdict credits remaining this billing period." };
      }
      // Extra credits deplete first; monthly allotment is the fallback
      if (sub.extra_verdict_credits > 0) {
        await updateSubscription(subscription_id, {
          extra_verdict_credits: sub.extra_verdict_credits - 1,
        });
      } else {
        await updateSubscription(subscription_id, {
          verdicts_used: sub.verdicts_used + 1,
        });
      }
    }
    // Murder tier: unlimited — no write needed
  } else {
    const recType = product.replace("reckoning_", "") as "small" | "standard" | "commercial";
    const limit = ent.reckonings_per_month[recType];
    const used = sub.reckonings_used[recType];

    if (limit < 999999 && used >= limit) {
      return {
        success: false,
        error: `No ${recType} Reckoning credits remaining this billing period.`,
      };
    }
    if (limit !== Infinity) {
      await updateSubscription(subscription_id, {
        reckonings_used: { ...sub.reckonings_used, [recType]: used + 1 },
      });
    }
  }

  return { success: true };
}

// ─── Period reset (called on invoice.paid) ────────────────────────────────────

export async function resetPeriodCredits(
  subscription_id: string,
  new_period_start: string,
  new_period_end: string
): Promise<void> {
  await updateSubscription(subscription_id, {
    verdicts_used: 0,
    reckonings_used: { small: 0, standard: 0, commercial: 0 },
    current_period_start: new_period_start,
    current_period_end: new_period_end,
  });
}

// ─── Code tracking ────────────────────────────────────────────────────────────
// Tracks per-code usage stats in a Redis hash at code:{code}:stats

export async function trackCodeUsage(code: string): Promise<void> {
  const key = `code:${code}:stats`;
  await redis.hincrby(key, "usageCount", 1);
  await redis.hset(key, { lastUsed: new Date().toISOString() });
}

export interface CodeStats {
  usageCount: number;
  lastUsed: string | null;
  active: boolean;
  tier: string | null;
  email: string | null;
  createdAt: string | null;
}

export async function getCodeStats(code: string): Promise<CodeStats | null> {
  const [record, stats] = await Promise.all([
    redis.get<{
      subscriptionId?: string;
      tier?: string;
      email?: string;
      createdAt?: string;
      active?: boolean;
    }>(`code:${code}`),
    redis.hgetall(`code:${code}:stats`),
  ]);

  if (!record && !stats) return null;

  return {
    usageCount: stats ? Number((stats as Record<string, string>).usageCount ?? 0) : 0,
    lastUsed:   stats ? ((stats as Record<string, string>).lastUsed ?? null) : null,
    active:     record?.active ?? true,
    tier:       record?.tier   ?? null,
    email:      record?.email  ?? null,
    createdAt:  record?.createdAt ?? null,
  };
}

export interface CodeRecord {
  code: string;
  subscriptionId: string | null;
  tier: string | null;
  email: string | null;
  createdAt: string | null;
  active: boolean;
  usageCount: number;
  lastUsed: string | null;
}

export async function listAllCodes(): Promise<CodeRecord[]> {
  const keys = await redis.keys("code:CORVUS-*");
  // Exclude stats keys
  const codeKeys = (keys as string[]).filter((k) => !k.endsWith(":stats"));
  if (codeKeys.length === 0) return [];

  const records = await Promise.all(
    codeKeys.map(async (key) => {
      const code = key.replace(/^code:/, "");
      const [record, stats] = await Promise.all([
        redis.get<{
          subscriptionId?: string;
          tier?: string;
          email?: string;
          createdAt?: string;
          active?: boolean;
        }>(key),
        redis.hgetall(`${key}:stats`),
      ]);
      return {
        code,
        subscriptionId: record?.subscriptionId ?? null,
        tier:           record?.tier            ?? null,
        email:          record?.email           ?? null,
        createdAt:      record?.createdAt       ?? null,
        active:         record?.active          ?? true,
        usageCount:     stats ? Number((stats as Record<string, string>).usageCount ?? 0) : 0,
        lastUsed:       stats ? ((stats as Record<string, string>).lastUsed ?? null) : null,
      };
    })
  );

  return records.sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
  );
}

// ─── Device seat management ───────────────────────────────────────────────────
// Best-effort seat tracking. NOT tamper-proof. Designed for honest web seat
// registration — a willing user can clear localStorage to re-register.
// Admin/founder codes bypass seat limits entirely.

export async function getDeviceTokens(subscription_id: string): Promise<string[]> {
  const tokens = await redis.smembers(REDIS_KEYS.deviceSet(subscription_id));
  return tokens as string[];
}

export async function registerDevice(
  subscription_id: string,
  token: string,
  user_agent: string
): Promise<{ success: boolean; seats_used: number; seat_limit: number; error?: string }> {
  const sub = await getSubscription(subscription_id);
  if (!sub) return { success: false, seats_used: 0, seat_limit: 0, error: "Subscription not found." };
  if (sub.status !== "active") return { success: false, seats_used: 0, seat_limit: 0, error: "Subscription not active." };

  const ent = TIER_ENTITLEMENTS[sub.tier];
  const existing = await redis.smembers(REDIS_KEYS.deviceSet(subscription_id)) as string[];

  // Already registered for this subscription
  if (existing.includes(token)) {
    // Update last_seen
    const rec = await redis.get<DeviceRecord>(REDIS_KEYS.device(token));
    if (rec) {
      await redis.set(REDIS_KEYS.device(token), { ...rec, last_seen: new Date().toISOString() });
    }
    return { success: true, seats_used: existing.length, seat_limit: ent.seat_limit };
  }

  // Seat limit check
  if (existing.length >= ent.seat_limit) {
    return {
      success: false,
      seats_used: existing.length,
      seat_limit: ent.seat_limit,
      error: `Seat limit reached (${ent.seat_limit} device${ent.seat_limit !== 1 ? "s" : ""} already registered).`,
    };
  }

  // Register new device
  const now = new Date().toISOString();
  const record: DeviceRecord = { token, subscription_id, user_agent, registered_at: now, last_seen: now };
  await redis.sadd(REDIS_KEYS.deviceSet(subscription_id), token);
  await redis.set(REDIS_KEYS.device(token), record);

  return { success: true, seats_used: existing.length + 1, seat_limit: ent.seat_limit };
}

// ─── Named seat management ────────────────────────────────────────────────────
// Tracks purchased additional seats and named seat members separately from
// the device-token system above. Redis keys:
//   sub:{subId}:seat_count   → number of additional purchased seats
//   sub:{subId}:seat_members → JSON array of SeatMember

export interface SeatMember {
  email: string;
  name: string;
  addedAt: string;
  code: string; // subscriber code generated for this seat
}

const SEAT_COUNT_KEY   = (subId: string) => `sub:${subId}:seat_count`;
const SEAT_MEMBERS_KEY = (subId: string) => `sub:${subId}:seat_members`;

/** Returns the number of additional purchased seats (0 if none bought yet). */
export async function getSeatCount(subscriptionId: string): Promise<number> {
  const val = await redis.get<number>(SEAT_COUNT_KEY(subscriptionId));
  return val ?? 0;
}

/** Increments purchased seat count. Returns the new total additional seats. */
export async function addSeats(subscriptionId: string, count: number): Promise<number> {
  const current = await getSeatCount(subscriptionId);
  const next = current + count;
  await redis.set(SEAT_COUNT_KEY(subscriptionId), next);
  return next;
}

/** Decrements purchased seat count (floors at 0). Returns new total. */
export async function removeSeats(subscriptionId: string, count: number): Promise<number> {
  const current = await getSeatCount(subscriptionId);
  const next = Math.max(0, current - count);
  await redis.set(SEAT_COUNT_KEY(subscriptionId), next);
  return next;
}

/** Returns all named seat members for a subscription. */
export async function getSeatMembers(subscriptionId: string): Promise<SeatMember[]> {
  const raw = await redis.get<SeatMember[]>(SEAT_MEMBERS_KEY(subscriptionId));
  return raw ?? [];
}

/** Adds a named seat member. */
export async function addSeatMember(
  subscriptionId: string,
  member: SeatMember
): Promise<void> {
  const current = await getSeatMembers(subscriptionId);
  // Prevent duplicate email
  const filtered = current.filter(m => m.email.toLowerCase() !== member.email.toLowerCase());
  await redis.set(SEAT_MEMBERS_KEY(subscriptionId), [...filtered, member]);
}

/** Removes a seat member by email. */
export async function removeSeatMember(
  subscriptionId: string,
  email: string
): Promise<void> {
  const current = await getSeatMembers(subscriptionId);
  const filtered = current.filter(m => m.email.toLowerCase() !== email.toLowerCase());
  await redis.set(SEAT_MEMBERS_KEY(subscriptionId), filtered);
}
