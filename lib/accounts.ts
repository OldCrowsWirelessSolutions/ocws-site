// lib/accounts.ts
// Email-indexed account profiles for the Crow's Eye mobile app.
//
// Pre-v19 the mobile app had no account concept for VIP/promo code redemptions —
// you typed CORVUS-NATE on a phone and got an unauthenticated "Nathanael Farrelly"
// session forever. Anyone who guessed the code got the same account on their
// own phone. v19 fixes this by requiring email + password creation on first
// VIP redemption and providing email-based login from then on.
//
// Storage layout in Redis:
//   account:{code}                 — AccountRecord (name, email, tier, leadCode, ...)
//   account:by-email:{emailLower}  — code (so login by email works)
//   account:index                  — set of all codes that have an account
//   vip:{code}:password_hash       — bcrypt hash (existing infra, unchanged)
//   sub:{code}:password_hash       — bcrypt hash (existing infra, unchanged)
//
// The password hash storage already exists (lib/redis-key style: vip:{code}:password_hash)
// and is used by the existing /api/auth/set-password and /api/auth/verify-password
// endpoints. This file adds a parallel "account profile" layer keyed by the
// same code, plus an email index for email-based login.

import redis from "@/lib/redis";

export interface AccountRecord {
  code:        string;          // canonical code that bootstrapped the account (e.g. CORVUS-NATE, OCWS-FLOCK-PROMO-XYZ)
  email:       string;          // lowercased
  name:        string;
  tier:        AccountTier;
  unlimited:   boolean;
  credits:     number | null;
  // Team-lead linkage — optional, present for VIP/flock/murder accounts.
  leadCode?:   string;          // CORVUS-LEAD-XXXXXX
  userId?:     string;          // lead_<rand> (matches team-leads.ts userId)
  orgId?:      string;
  orgName?:    string;
  createdAt:   string;
  source:      "vip" | "founder" | "subscriber" | "subordinate" | "demo";
}

export type AccountTier =
  | "fledgling" | "nest" | "flock" | "murder"
  | "subordinate" | "teamLead" | "orgAdmin" | "admin";

function emailKey(email: string): string {
  return `account:by-email:${email.trim().toLowerCase()}`;
}

function passwordKey(code: string, source: AccountRecord["source"]): string {
  // Match the existing /api/auth/set-password key naming so old endpoints
  // and new account-create endpoint share the same storage.
  if (source === "subscriber" || source === "subordinate") {
    return `sub:${code.toUpperCase()}:password_hash`;
  }
  return `vip:${code.toUpperCase()}:password_hash`;
}

export async function getAccountByCode(code: string): Promise<AccountRecord | null> {
  return redis.get<AccountRecord>(`account:${code.toUpperCase()}`);
}

export async function getAccountByEmail(email: string): Promise<AccountRecord | null> {
  const code = await redis.get<string>(emailKey(email));
  if (!code) return null;
  return getAccountByCode(code);
}

export async function saveAccount(account: AccountRecord): Promise<void> {
  const code = account.code.toUpperCase();
  const normalized: AccountRecord = {
    ...account,
    code,
    email: account.email.trim().toLowerCase(),
  };

  // Detect email change — clean up the old index entry if so.
  const existing = await redis.get<AccountRecord>(`account:${code}`);
  if (existing && existing.email !== normalized.email) {
    await redis.del(emailKey(existing.email));
  }

  await Promise.all([
    redis.set(`account:${code}`, normalized),
    redis.set(emailKey(normalized.email), code),
    redis.sadd("account:index", code),
  ]);
}

export async function listAccounts(): Promise<AccountRecord[]> {
  const codes = (await redis.smembers("account:index")) as string[];
  if (!codes.length) return [];
  const records = await Promise.all(
    codes.map((c) => redis.get<AccountRecord>(`account:${c}`)),
  );
  return records
    .filter((r): r is AccountRecord => r !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPasswordKey(code: string, source: AccountRecord["source"]): Promise<string> {
  return passwordKey(code, source);
}

/** Email format validator — matches /api/app-account/create. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Guard for password strength. Mirrors /api/auth/set-password. */
export function isStrongEnough(password: string): boolean {
  return typeof password === "string" && password.length >= 8;
}
