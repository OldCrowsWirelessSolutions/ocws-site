// app/api/admin/subscribers/route.ts
// Returns all subscription records from Redis.
// Protected by x-admin-key header.

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import redis from "@/lib/redis";
import type { SubscriptionRecord } from "@/lib/subscriptions";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET ?? "OCWS2026";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const keys = await redis.keys("sub:*");
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
