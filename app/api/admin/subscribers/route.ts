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
    const allKeys = await redis.keys("sub:*") as string[];

    // Only keep top-level subscription keys — sub:CORVUS-XXXX-XXXXXX
    // Exclude metadata keys like sub:CODE:fledgling_verdict_used, sub:CODE:codes, etc.
    const keys = allKeys.filter(k => {
      const parts = k.split(':');
      // Valid subscription key has exactly 2 parts: sub:CORVUS-TIER-SUFFIX
      return parts.length === 2 && parts[1].startsWith('CORVUS-');
    });

    if (!keys.length) return Response.json({ subscribers: [] });

    const records = await Promise.all(
      keys.map((k) => redis.get<SubscriptionRecord>(k))
    );

    const subscribers = (records.filter(r =>
      r != null && r.subscription_id && r.customer_email
    ) as SubscriptionRecord[]).sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );

    return Response.json({ subscribers });
  } catch (err) {
    console.error("[admin/subscribers]", err);
    return Response.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }
}
