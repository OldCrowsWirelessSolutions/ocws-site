// lib/chat-quota.ts
// Server-authoritative chat economy for the Corvus web chat.
//
// Three things layered on top of each other, consumed in this order:
//   1. Time pass   — "unlimited" within a window, with a daily fair-use ceiling
//                    so a $9 day pass can't turn into a $40 loss.
//   2. Monthly pool — the allotment included with each subscription tier.
//                    Resets on the 1st (calendar month, UTC).
//   3. Purchased balance — question packs the user bought. Drawn down only after
//                    the monthly pool is empty. Persists across months (rolls
//                    over). The user always spends what their plan includes
//                    before dipping into something they paid extra for.
//
// Murder (and all admin/founder/vip/subordinate bypass codes) never touch this
// — they're unlimited and short-circuit before reaching here.
//
// This file is the SINGLE SOURCE OF TRUTH for the numbers. Retune the economy
// by editing MONTHLY_CHAT_ALLOWANCE / CHAT_PACKS / CHAT_PASSES below; the chat
// route, the purchase route, the webhook, and the pricing page all read from
// here.

import redis from "@/lib/redis";
import type { SubscriptionTier } from "@/lib/subscriptions";

// ─── Tunables ────────────────────────────────────────────────────────────────

// Monthly included Corvus questions per tier. Murder is unlimited.
// Worst case (every question a cold cache miss at ~$0.047): fledgling ~$4.70,
// nest ~$11.75, flock ~$47 — all comfortably under each tier's net margin.
export const MONTHLY_CHAT_ALLOWANCE: Record<SubscriptionTier, number> = {
  fledgling: 100,
  nest:      250,
  flock:     1000,
  murder:    Infinity,
};

// Daily fair-use ceiling on time passes. Invisible to ~99.9% of buyers — it
// exists only so a determined abuser can't binge a $9 pass into a real loss.
export const PASS_DAILY_CEILING = 100;

export interface ChatPack {
  product:  string;   // Stripe metadata key + ?product= query value
  questions: number;
  priceUSD:  number;
  label:     string;
}

export interface ChatPass {
  product:  string;
  hours:    number;
  priceUSD: number;
  label:    string;
}

// Question packs — one-time, credited to the purchased balance, roll over.
export const CHAT_PACKS: Record<string, ChatPack> = {
  "chat-pack-25":  { product: "chat-pack-25",  questions: 25,  priceUSD: 4,  label: "25 Questions" },
  "chat-pack-100": { product: "chat-pack-100", questions: 100, priceUSD: 12, label: "100 Questions" },
  "chat-pack-300": { product: "chat-pack-300", questions: 300, priceUSD: 25, label: "300 Questions" },
};

// Time passes — "unlimited" within the window (subject to PASS_DAILY_CEILING).
export const CHAT_PASSES: Record<string, ChatPass> = {
  "chat-pass-day":  { product: "chat-pass-day",  hours: 24,  priceUSD: 9,  label: "Day Pass" },
  "chat-pass-week": { product: "chat-pass-week", hours: 168, priceUSD: 35, label: "Week Pass" },
};

export function isChatProduct(product: string): boolean {
  return product in CHAT_PACKS || product in CHAT_PASSES;
}

// ─── Free (non-subscriber) chat economy ──────────────────────────────────────
// Free accounts get this many INCLUDED Corvus questions per "bucket" (a report,
// or the "general" bucket for chat not tied to a report), then draw on purchased
// packs/passes. This single constant + the consume/peek helpers below are shared
// by web (/api/chat) and mobile (/api/mobile/corvus-chat) so the two surfaces
// behave IDENTICALLY for free users — change the number here to change both.
export const FREE_CHAT_QUESTIONS_PER_BUCKET = 5;

// Bucket key for general (non-report) free chat. Per-report buckets use the
// reportId/verdictId directly.
export const FREE_CHAT_GENERAL_BUCKET = "__general__";

const FREE_CHAT_TTL_SECONDS = 60 * 60 * 24 * 90; // 90d, matches the mobile counter

function freeChatKey(accountId: string, bucket: string): string {
  // Same namespace the mobile per-verdict counter already uses, so a free user's
  // count for a given report is consistent across web and mobile.
  return `corvus:v1:chat_count:${accountId.slice(0, 100)}:${bucket.slice(0, 100)}`;
}

export interface FreeChatState {
  allowed:   boolean;
  source:    "included" | "pass" | "balance" | "none";
  used:      number; // included questions used in this bucket
  remaining: number; // included questions left in this bucket (0 once on top-ups)
  limit:     number; // FREE_CHAT_QUESTIONS_PER_BUCKET
}

/** Non-mutating snapshot of a free account's per-bucket chat allowance. */
export async function peekFreeChat(accountId: string, bucket: string): Promise<FreeChatState> {
  const used = Number((await redis.get<number>(freeChatKey(accountId, bucket))) ?? 0);
  const remaining = Math.max(0, FREE_CHAT_QUESTIONS_PER_BUCKET - used);
  return {
    allowed: remaining > 0,
    source: remaining > 0 ? "included" : "none",
    used,
    remaining,
    limit: FREE_CHAT_QUESTIONS_PER_BUCKET,
  };
}

/**
 * Consume one free-account chat message for a bucket (reportId or "general").
 * Order: included per-bucket allowance → active pass → purchased balance.
 * `accountId` is the canonical account key (lowercased email via chatAccountKey).
 */
export async function consumeFreeChat(accountId: string, bucket: string): Promise<FreeChatState> {
  const key = freeChatKey(accountId, bucket);
  const used = Number((await redis.get<number>(key)) ?? 0);

  if (used < FREE_CHAT_QUESTIONS_PER_BUCKET) {
    const n = await redis.incr(key);
    await redis.expire(key, FREE_CHAT_TTL_SECONDS);
    return {
      allowed: true,
      source: "included",
      used: n,
      remaining: Math.max(0, FREE_CHAT_QUESTIONS_PER_BUCKET - n),
      limit: FREE_CHAT_QUESTIONS_PER_BUCKET,
    };
  }

  // Included allowance spent — fall through to purchased packs/passes (account-wide).
  const topup = await consumePurchasedChat(accountId);
  return {
    allowed: topup.allowed,
    source: topup.allowed ? topup.source : "none",
    used,
    remaining: 0,
    limit: FREE_CHAT_QUESTIONS_PER_BUCKET,
  };
}

/**
 * Canonical cross-surface account key for chat top-ups. The same human keys to
 * the same bucket on web (subscription email) and mobile (login email), so a
 * pack or pass bought on one surface works on the other. Normalizes case/space
 * so the two surfaces converge. Falls back to the raw code when no email is
 * available — never relevant for demo tokens, which are unlimited and never
 * key top-ups at all.
 */
export function chatAccountKey(email: string | undefined | null, fallback: string): string {
  const e = (email ?? "").trim().toLowerCase();
  return e || fallback.trim();
}

// ─── Redis keys (side keys — nothing added to SubscriptionRecord) ────────────

const usedKey     = (id: string, ym: string)  => `chat:used:${id}:${ym}`;        // monthly counter
const balanceKey  = (id: string)               => `chat:balance:${id}`;          // purchased questions
const passKey     = (id: string)               => `chat:pass:${id}`;             // pass expiry (epoch ms)
const passUsedKey = (id: string, ymd: string)  => `chat:passused:${id}:${ymd}`;  // daily pass counter

const MONTH_TTL_SECONDS = 60 * 60 * 24 * 40; // 40d — covers the longest month + slack
const DAY_TTL_SECONDS   = 60 * 60 * 48;      // 48h

function ymOf(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function ymdOf(d: Date): string {
  return `${ymOf(d)}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function nextMonthStartISO(d: Date): string {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString();
}

// ─── Consumption ─────────────────────────────────────────────────────────────

export type ChatSource = "pass" | "monthly" | "balance" | "none";

export interface ChatConsumeResult {
  allowed: boolean;
  source: ChatSource;
  monthlyRemaining: number; // remaining in the monthly pool after this message (0 if drained / on pass/balance)
  resetsOn: string;         // ISO date the monthly pool refills
}

/**
 * Atomically consume one chat message for a metered subscriber. Consumes BEFORE
 * the Anthropic call (cheapest, race-free); a rare downstream API failure burns
 * one question, which is invisible against a 100–1000 monthly pool.
 *
 * Order: active pass (within daily ceiling) → monthly pool → purchased balance.
 */
export async function consumeChatMessage(
  subId: string,
  tier: SubscriptionTier,
): Promise<ChatConsumeResult> {
  const now      = new Date();
  const resetsOn = nextMonthStartISO(now);
  const allowance = MONTHLY_CHAT_ALLOWANCE[tier] ?? 0;

  if (allowance === Infinity) {
    return { allowed: true, source: "monthly", monthlyRemaining: -1, resetsOn };
  }

  // 1. Active time pass?
  const passUntil = Number((await redis.get<string | number>(passKey(subId))) ?? 0);
  if (passUntil > now.getTime()) {
    const pk   = passUsedKey(subId, ymdOf(now));
    const used = Number((await redis.get<number>(pk)) ?? 0);
    if (used < PASS_DAILY_CEILING) {
      await redis.incr(pk);
      await redis.expire(pk, DAY_TTL_SECONDS);
      return { allowed: true, source: "pass", monthlyRemaining: 0, resetsOn };
    }
    // Daily ceiling hit — fall through to pool/balance rather than hard-stop.
  }

  // 2. Monthly included pool.
  const mk   = usedKey(subId, ymOf(now));
  const used = Number((await redis.get<number>(mk)) ?? 0);
  if (used < allowance) {
    const n = await redis.incr(mk);
    await redis.expire(mk, MONTH_TTL_SECONDS);
    return { allowed: true, source: "monthly", monthlyRemaining: Math.max(0, allowance - n), resetsOn };
  }

  // 3. Purchased pack balance.
  const balance = Number((await redis.get<number>(balanceKey(subId))) ?? 0);
  if (balance > 0) {
    await redis.decr(balanceKey(subId));
    return { allowed: true, source: "balance", monthlyRemaining: 0, resetsOn };
  }

  return { allowed: false, source: "none", monthlyRemaining: 0, resetsOn };
}

/**
 * Top-up-only consume: pass → purchased balance, with NO monthly pool.
 *
 * The mobile app's included allowance is a separate per-scan counter (5
 * questions per report), not a monthly pool — so on mobile we only fall back to
 * purchased top-ups once that per-scan quota is spent. `accountId` is whatever
 * stable identity the surface uses (mobile passes the user's email).
 */
export async function consumePurchasedChat(
  accountId: string,
): Promise<{ allowed: boolean; source: "pass" | "balance" | "none" }> {
  const now = new Date();

  const passUntil = Number((await redis.get<string | number>(passKey(accountId))) ?? 0);
  if (passUntil > now.getTime()) {
    const pk   = passUsedKey(accountId, ymdOf(now));
    const used = Number((await redis.get<number>(pk)) ?? 0);
    if (used < PASS_DAILY_CEILING) {
      await redis.incr(pk);
      await redis.expire(pk, DAY_TTL_SECONDS);
      return { allowed: true, source: "pass" };
    }
  }

  const balance = Number((await redis.get<number>(balanceKey(accountId))) ?? 0);
  if (balance > 0) {
    await redis.decr(balanceKey(accountId));
    return { allowed: true, source: "balance" };
  }

  return { allowed: false, source: "none" };
}

/** Read-only top-up snapshot for an account (no mutation). */
export async function getPurchasedChat(
  accountId: string,
): Promise<{ passActive: boolean; balance: number }> {
  const now = Date.now();
  const [passRaw, balRaw] = await Promise.all([
    redis.get<string | number>(passKey(accountId)),
    redis.get<number>(balanceKey(accountId)),
  ]);
  return { passActive: Number(passRaw ?? 0) > now, balance: Number(balRaw ?? 0) };
}

// ─── Fulfillment (called from the Stripe webhook) ────────────────────────────

/** Credit purchased questions to the rolling balance. Returns the new balance. */
export async function creditChatPack(subId: string, questions: number): Promise<number> {
  return redis.incrby(balanceKey(subId), questions);
}

/**
 * Grant / extend a time pass. Stacks: a new pass extends from the later of
 * "now" or the current expiry, so buying a Week Pass while a Day Pass is live
 * adds the full week. Returns the new expiry (epoch ms).
 */
export async function grantChatPass(subId: string, hours: number): Promise<number> {
  const now      = Date.now();
  const existing = Number((await redis.get<string | number>(passKey(subId))) ?? 0);
  const base     = existing > now ? existing : now;
  const expiry   = base + hours * 60 * 60 * 1000;
  await redis.set(passKey(subId), String(expiry));
  // Self-clean shortly after the pass ends.
  await redis.expire(passKey(subId), Math.ceil((expiry - now) / 1000) + 86400);
  return expiry;
}

// ─── Read-only snapshot (for dashboards / debugging) ─────────────────────────

export async function getChatQuota(subId: string, tier: SubscriptionTier) {
  const now       = new Date();
  const allowance = MONTHLY_CHAT_ALLOWANCE[tier] ?? 0;
  const [usedRaw, balanceRaw, passRaw] = await Promise.all([
    redis.get<number>(usedKey(subId, ymOf(now))),
    redis.get<number>(balanceKey(subId)),
    redis.get<string | number>(passKey(subId)),
  ]);
  const used      = Number(usedRaw ?? 0);
  const passUntil = Number(passRaw ?? 0);
  return {
    tier,
    unlimited:        allowance === Infinity,
    monthlyAllowance: allowance === Infinity ? -1 : allowance,
    monthlyUsed:      used,
    monthlyRemaining: allowance === Infinity ? -1 : Math.max(0, allowance - used),
    purchasedBalance: Number(balanceRaw ?? 0),
    passActiveUntil:  passUntil > now.getTime() ? passUntil : null,
    resetsOn:         nextMonthStartISO(now),
  };
}
