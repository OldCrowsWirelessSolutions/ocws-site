// app/api/admin/codes/revoke/route.ts
// Immediately revokes any subscriber, subordinate, or promo code.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { revokeSubordinateByCode } from "@/lib/vip-codes";
import { deactivatePromoCode } from "@/lib/promo-codes";
import { getSubscription, updateSubscription } from "@/lib/subscriptions";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "SpectrumLife2026!!";

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const now = new Date().toISOString();

    // 1. Subordinate code (CORVUS-SUB-XXXXXX)?
    if (code.startsWith("CORVUS-SUB-")) {
      const result = await revokeSubordinateByCode(code);
      if (result) {
        await redis.lpush("admin:revoke_log", JSON.stringify({ code, codeType: "subordinate", wasIssuedBy: result.wasIssuedBy, revokedAt: now }));
        return NextResponse.json({ revoked: true, codeType: "subordinate", wasIssuedBy: result.wasIssuedBy });
      }
      return NextResponse.json({ revoked: false, error: "Code not found" }, { status: 404 });
    }

    // 2. Promo code (OCWS-VERDICT-*, OCWS-RECKONING-*, OCWS-MULTI-*)?
    const promoRecord = await redis.get<{ deactivated?: boolean }>(`promo:${code}`);
    if (promoRecord) {
      await deactivatePromoCode(code);
      await redis.lpush("admin:revoke_log", JSON.stringify({ code, codeType: "promo", revokedAt: now }));
      return NextResponse.json({ revoked: true, codeType: "promo" });
    }

    // 3. Subscription code?
    const sub = await getSubscription(code);
    if (sub) {
      await updateSubscription(code, { status: "cancelled" });
      // Also mark code record as inactive
      const codeRecord = await redis.get<object>(`code:${code}`);
      if (codeRecord) {
        await redis.set(`code:${code}`, { ...codeRecord, active: false });
      }
      await redis.lpush("admin:revoke_log", JSON.stringify({ code, codeType: "subscription", revokedAt: now }));
      return NextResponse.json({ revoked: true, codeType: "subscription" });
    }

    // 4. Generic code record?
    const codeRecord = await redis.get<{ active?: boolean }>(`code:${code}`);
    if (codeRecord) {
      await redis.set(`code:${code}`, { ...codeRecord, active: false });
      await redis.lpush("admin:revoke_log", JSON.stringify({ code, codeType: "code", revokedAt: now }));
      return NextResponse.json({ revoked: true, codeType: "code" });
    }

    return NextResponse.json({ revoked: false, error: "Code not found in system" }, { status: 404 });
  } catch (err) {
    console.error("[admin/codes/revoke]", err);
    return NextResponse.json({ error: "Failed to revoke code" }, { status: 500 });
  }
}
