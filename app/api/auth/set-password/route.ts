// app/api/auth/set-password/route.ts
// Sets a bcrypt password hash for a VIP or subscriber code on first use.

export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import redis from "@/lib/redis";

const VIP_CODES = new Set(["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC", "CORVUS-KYLE"]);

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
    return Response.json({ error: "Code and password required" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const isVip = VIP_CODES.has(code);
  const isSub = /^OCWS-(NEST|FLOCK|MURDER)-[A-Z0-9]{8}$/.test(code);

  if (!isVip && !isSub) {
    return Response.json({ error: "Code not eligible for password" }, { status: 400 });
  }

  const redisKey = isVip ? `vip:${code}:password_hash` : `sub:${code}:password_hash`;

  // Check if password already set (prevent overwrite without reset)
  try {
    const existing = await redis.get<string>(redisKey);
    if (existing) {
      return Response.json({ error: "Password already set. Contact admin to reset." }, { status: 409 });
    }
  } catch {
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    await redis.set(redisKey, hash);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed to save password" }, { status: 500 });
  }
}
