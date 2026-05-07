// app/api/auth/account/login/route.ts
// Email + password login for accounts created via /api/auth/account/create.
// Rate-limited 5 fails / hour per email.

export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import redis from "@/lib/redis";
import { getAccountByEmail, getPasswordKey, isValidEmail } from "@/lib/accounts";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60 * 60;

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string; password?: string };
    const email    = String(body.email    ?? "").trim().toLowerCase();
    const password = String(body.password ?? "").trim();

    if (!email || !password) {
      return Response.json({ valid: false });
    }
    if (!isValidEmail(email)) {
      return Response.json({ valid: false });
    }

    // Rate limit by email
    const attemptsKey = `auth:fail:email:${email}`;
    try {
      const attempts = await redis.get<number>(attemptsKey);
      if ((attempts ?? 0) >= MAX_ATTEMPTS) {
        return Response.json({ valid: false, rateLimited: true });
      }
    } catch { /* non-fatal */ }

    const account = await getAccountByEmail(email);
    if (!account) {
      return Response.json({ valid: false });
    }

    const hash = await redis.get<string>(await getPasswordKey(account.code, account.source));
    if (!hash) {
      return Response.json({ valid: false });
    }

    const match = await bcrypt.compare(password, hash);
    if (!match) {
      try {
        await redis.incr(attemptsKey);
        await redis.expire(attemptsKey, LOCKOUT_SECONDS);
      } catch { /* non-fatal */ }
      return Response.json({ valid: false });
    }

    try { await redis.del(attemptsKey); } catch { /* non-fatal */ }
    return Response.json({ valid: true, account });
  } catch (err) {
    console.error("[auth/account/login]", err);
    return Response.json({ valid: false, error: "Service unavailable" }, { status: 503 });
  }
}
