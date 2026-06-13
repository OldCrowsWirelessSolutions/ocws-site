// app/api/auth/login/route.ts
// Unified login — one credential, two ways in. The caller passes a single
// `identifier` that is EITHER an email OR a Corvus Code, plus a password. Both
// resolve to the same AccountRecord and verify against the same bcrypt hash
// (getPasswordKey), so a code bought/minted anywhere works on web and mobile.
//
// This generalizes the older split:
//   - /api/auth/account/login  (email + password only)
//   - /api/auth/verify-password (code + password, but only for the hardcoded
//                                VIP set + OCWS-NEST/FLOCK/MURDER patterns)
// Those remain in place as back-compat shims; new clients should use this.
//
// Rate-limited 5 fails / hour per identifier (shared `auth:fail:*` convention).

export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import redis from "@/lib/redis";
import {
  getAccountByCode,
  getAccountByEmail,
  getPasswordKey,
  isValidEmail,
} from "@/lib/accounts";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60 * 60;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as {
      identifier?: string;
      // Back-compat aliases so existing callers keep working.
      email?: string;
      code?: string;
      password?: string;
    } | null;

    const identifierRaw = String(
      body?.identifier ?? body?.email ?? body?.code ?? "",
    ).trim();
    const password = String(body?.password ?? "").trim();

    if (!identifierRaw || !password) {
      return Response.json({ valid: false });
    }

    const isEmail = isValidEmail(identifierRaw);
    // Normalize: emails lowercased, codes uppercased.
    const identifier = isEmail ? identifierRaw.toLowerCase() : identifierRaw.toUpperCase();

    // Rate limit by identifier (email or code).
    const attemptsKey = `auth:fail:${identifier}`;
    try {
      const attempts = await redis.get<number>(attemptsKey);
      if ((attempts ?? 0) >= MAX_ATTEMPTS) {
        return Response.json({ valid: false, rateLimited: true });
      }
    } catch { /* non-fatal */ }

    const account = isEmail
      ? await getAccountByEmail(identifier)
      : await getAccountByCode(identifier);

    if (!account) {
      // Same shape as a wrong password — don't reveal whether the id exists.
      await bumpFailures(attemptsKey);
      return Response.json({ valid: false });
    }

    const hash = await redis.get<string>(await getPasswordKey(account.code, account.source));
    if (!hash) {
      // Account exists but never set a password (legacy). Treat as not-logged-in
      // rather than silently granting access.
      return Response.json({ valid: false, noPassword: true });
    }

    const match = await bcrypt.compare(password, hash);
    if (!match) {
      await bumpFailures(attemptsKey);
      return Response.json({ valid: false });
    }

    try { await redis.del(attemptsKey); } catch { /* non-fatal */ }
    return Response.json({ valid: true, account });
  } catch (err) {
    console.error("[auth/login]", err);
    return Response.json({ valid: false, error: "Service unavailable" }, { status: 503 });
  }
}

async function bumpFailures(key: string): Promise<void> {
  try {
    await redis.incr(key);
    await redis.expire(key, LOCKOUT_SECONDS);
  } catch { /* non-fatal */ }
}
