// app/api/auth/verify-password/route.ts
// Verifies a bcrypt password for a VIP or subscriber code.

export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import redis from "@/lib/redis";

const VIP_CODES = new Set(["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC"]);

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

  const redisKey = isVip ? `vip:${code}:password_hash` : `sub:${code}:password_hash`;

  try {
    const hash = await redis.get<string>(redisKey);
    if (!hash) {
      // No password set — allow through (shouldn't normally reach here)
      return Response.json({ valid: true, noPassword: true });
    }
    const match = await bcrypt.compare(password, hash);
    return Response.json({ valid: match });
  } catch {
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
