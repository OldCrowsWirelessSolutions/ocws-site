// app/api/admin/vip/reset-password/route.ts
// Admin: clear a VIP or subscriber password hash from Redis.

export const runtime = "nodejs";

import redis from "@/lib/redis";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "SpectrumLife2026!!";
const VIP_CODES = new Set(["CORVUS-NEST", "CORVUS-NATE", "CORVUS-MIKE", "CORVUS-ERIC"]);

export async function POST(req: Request) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (adminKey !== ADMIN_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let code: string;
  try {
    const body = await req.json() as { code?: string };
    code = String(body.code ?? "").trim().toUpperCase();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  if (!code) {
    return Response.json({ error: "Code required" }, { status: 400 });
  }

  const isVip = VIP_CODES.has(code);
  const isSub = /^OCWS-(NEST|FLOCK|MURDER)-[A-Z0-9]{8}$/.test(code);

  if (!isVip && !isSub) {
    return Response.json({ error: "Code not eligible" }, { status: 400 });
  }

  const redisKey = isVip ? `vip:${code}:password_hash` : `sub:${code}:password_hash`;

  try {
    await redis.del(redisKey);
    return Response.json({ ok: true, reset: code });
  } catch {
    return Response.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
