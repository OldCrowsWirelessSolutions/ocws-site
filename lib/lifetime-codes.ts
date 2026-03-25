// lib/lifetime-codes.ts
// Lifetime subscriber codes — permanent access, billed never, with monthly credit limits.
// Server-side only. Never import from client components.

import redis from "./redis";

export interface LifetimeCodeRecord {
  name: string;
  title: string;
  company: string;
  tier: "flock";
  creditsMonthly: number;
  seats: number;
  isTeamLead: boolean;
  billing: "lifetime";
  email: string | null;
  note: string;
}

export const LIFETIME_CODES: Record<string, LifetimeCodeRecord> = {
  "CORVUS-KYLE": {
    name: "Kyle Pitts",
    title: "IT Technician",
    company: "U.S. Navy Veteran",
    tier: "flock",
    creditsMonthly: 15,
    seats: 1,
    isTeamLead: false,
    billing: "lifetime",
    email: null,
    note: "Lifetime Flock — granted by Joshua Turner in recognition of 15 years of friendship and support",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isLifetimeCode(code: string): boolean {
  return code.toUpperCase() in LIFETIME_CODES;
}

export function getLifetimeCode(code: string): LifetimeCodeRecord | null {
  return LIFETIME_CODES[code.toUpperCase()] ?? null;
}

// ─── Redis key schema ─────────────────────────────────────────────────────────

const CREDITS_KEY  = (code: string) => `vip:${code}:credits_remaining`;
const RESET_KEY    = (code: string) => `lifetime:${code}:last_reset`;

// ─── Monthly credit reset ─────────────────────────────────────────────────────

export async function checkAndResetMonthlyCredits(code: string): Promise<number> {
  const member = getLifetimeCode(code);
  if (!member) return 0;

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    const lastReset = await redis.get<string>(RESET_KEY(code));
    if (lastReset !== currentMonthKey) {
      await redis.set(CREDITS_KEY(code), member.creditsMonthly);
      await redis.set(RESET_KEY(code), currentMonthKey);
      return member.creditsMonthly;
    }
    const stored = await redis.get<number>(CREDITS_KEY(code));
    return stored ?? member.creditsMonthly;
  } catch {
    return member.creditsMonthly;
  }
}

// ─── Get remaining credits ────────────────────────────────────────────────────

export async function getLifetimeCreditsRemaining(code: string): Promise<number> {
  return checkAndResetMonthlyCredits(code);
}

// ─── Decrement credit ─────────────────────────────────────────────────────────

export async function decrementLifetimeCredit(code: string): Promise<{ success: boolean; error?: string }> {
  const member = getLifetimeCode(code);
  if (!member) return { success: false, error: "Not a lifetime code." };

  const remaining = await checkAndResetMonthlyCredits(code);
  if (remaining <= 0) {
    return { success: false, error: "No Verdict credits remaining this billing period." };
  }

  try {
    await redis.decr(CREDITS_KEY(code));
    return { success: true };
  } catch {
    return { success: false, error: "Failed to record credit usage." };
  }
}
