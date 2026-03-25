// app/api/auth/verify-password/route.ts
// Verifies a bcrypt password for a VIP or subscriber code.
// Rate limits to 5 failed attempts per hour per code.

export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import redis from "@/lib/redis";

const VIP_CODES = new Set(["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC", "CORVUS-KYLE"]);
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60 * 60; // 1 hour

export async function POST(req: Request) {
  let code: string, password: string;
  try {
    const body = await req.json() as { code?: string; password?: string };
    code = String(body.code ?? "").trim().toUpperCase();
    password = String(body.password ?? "").trim();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  if (!code || !password) {
    return Response.json({ valid: false });
  }

  const isVip = VIP_CODES.has(code);
  const isSub = /^OCWS-(NEST|FLOCK|MURDER)-[A-Z0-9]{8}$/.test(code);

  if (!isVip && !isSub) {
    return Response.json({ valid: false });
  }

  const attemptsKey = `auth:fail:${code}`;

  // Check rate limit
  try {
    const attempts = await redis.get<number>(attemptsKey);
    if ((attempts ?? 0) >= MAX_ATTEMPTS) {
      return Response.json({ valid: false, rateLimited: true });
    }
  } catch { /* non-fatal — proceed */ }

  const redisKey = isVip ? `vip:${code}:password_hash` : `sub:${code}:password_hash`;

  try {
    const hash = await redis.get<string>(redisKey);
    if (!hash) {
      // No password set — allow through (shouldn't normally reach here)
      return Response.json({ valid: true, noPassword: true });
    }
    const match = await bcrypt.compare(password, hash);

    if (match) {
      // Reset failed attempts on success
      try { await redis.del(attemptsKey); } catch { /* non-fatal */ }
      return Response.json({ valid: true });
    } else {
      // Increment failed attempts
      try {
        await redis.incr(attemptsKey);
        await redis.expire(attemptsKey, LOCKOUT_SECONDS);
      } catch { /* non-fatal */ }
      return Response.json({ valid: false });
    }
  } catch {
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
