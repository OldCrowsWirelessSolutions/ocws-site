// app/api/freefix/count/route.ts
// Public, read-only counter for the "first 1,000 free fixes" launch promo.
// Powers the live countdown on the website and in the app. No auth — it
// exposes only the count, nothing sensitive. Cached briefly so a viral
// moment doesn't hammer Redis.
//
// The promo: the scan + findings are always free. The 10-minute FIX (and the
// limited Corvus chat) are free for the first 1,000 verdicts, counted from
// launch day. After that, the normal paywall applies.

export const runtime = "nodejs";

import redis from "@/lib/redis";

const COUNT_KEY = "corvus:v1:freefix:count"; // integer, INCR'd by /claim
const CAP = 1000;

export async function GET() {
  try {
    const raw = await redis.get<number>(COUNT_KEY);
    const claimed = Math.min(typeof raw === "number" ? raw : 0, CAP);
    return Response.json(
      {
        ok: true,
        claimed,
        remaining: Math.max(0, CAP - claimed),
        cap: CAP,
      },
      { headers: { "Cache-Control": "public, max-age=30" } }
    );
  } catch (err: any) {
    console.error("[freefix/count] error:", err?.message ?? err);
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 500 });
  }
}
