// app/api/analytics/founder-stats/route.ts
// Returns live platform stats for Joshua's personalized login and dashboard greeting.
// Stores founder:last_login on each successful call so the next visit can compute newScans.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

const ADMIN_KEY       = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "SpectrumLife2026!!";
const LAST_LOGIN_KEY  = "founder:last_login";
const EVENTS_ALL_KEY  = "analytics:events";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Capture last login before updating it
    const lastLogin    = await redis.get<string>(LAST_LOGIN_KEY);
    const lastLoginTime = lastLogin ?? new Date(0).toISOString();
    const lastLoginTs   = new Date(lastLoginTime).getTime();

    // All-time scan count
    const totalScans = ((await redis.zcard(EVENTS_ALL_KEY)) as number) ?? 0;

    // Scans since last login (sorted set score = unix timestamp ms)
    const newScans = ((await redis.zcount(
      EVENTS_ALL_KEY,
      lastLoginTs,
      "+inf"
    )) as number) ?? 0;

    // Pending testimonials (Redis list)
    const pendingTestimonials = ((await redis.llen("testimonials:pending")) as number) ?? 0;

    // Active subscriber codes — scan code:* keys and count active ones
    let activeSubscribers = 0;
    try {
      // Only count real subscriber codes — CORVUS-FLEDGLING-*, CORVUS-NEST-*, CORVUS-FLOCK-*, CORVUS-MURDER-*
      const codeKeys = await redis.keys("code:CORVUS-*") as string[];
      const subKeys = codeKeys.filter(k => {
        const upper = k.toUpperCase();
        return upper.includes('FLEDGLING') || upper.includes('NEST-') || upper.includes('FLOCK-') || upper.includes('MURDER-');
      });
      if (subKeys.length > 0) {
        const records = await Promise.all(
          subKeys.map(k => redis.get<{ active?: boolean }>(k))
        );
        activeSubscribers = records.filter(r => r != null && r.active !== false).length;
      }
    } catch { /* non-fatal — returns 0 */ }

    // Record this login timestamp for next visit's newScans calculation
    await redis.set(LAST_LOGIN_KEY, new Date().toISOString());

    return NextResponse.json({
      totalScans,
      newScans,
      activeSubscribers,
      pendingTestimonials,
      lastLoginTime,
    });
  } catch (err) {
    console.error("[founder-stats]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
