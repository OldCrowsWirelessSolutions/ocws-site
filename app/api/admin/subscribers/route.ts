// app/api/admin/subscribers/route.ts
// Returns all subscription records from Redis.
// Protected by x-admin-key header.

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import redis from "@/lib/redis";
import type { SubscriptionRecord } from "@/lib/subscriptions";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || process.env.NEXT_PUBLIC_ADMIN_KEY || "SpectrumLife2026!!";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const allKeys = await redis.keys("sub:*");
    const keys = (allKeys as string[]).filter(k =>
      !k.includes(':fledgling_verdict_used') &&
      !k.includes(':codes') &&
      !k.includes(':seat_') &&
      !k.includes(':team_lead') &&
      !k.includes(':seat_history') &&
      !k.includes(':seat_members') &&
      !k.includes(':seat_count')
    );
    if (!keys.length) return Response.json({ subscribers: [] });

    const records = await Promise.all(
      keys.map((k) => redis.get<SubscriptionRecord>(k))
    );

    const subscribers = (records.filter(Boolean) as SubscriptionRecord[]).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return Response.json({ subscribers });
  } catch (err) {
    console.error("[admin/subscribers]", err);
    return Response.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }
}
