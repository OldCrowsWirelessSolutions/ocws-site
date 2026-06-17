// app/api/freefix/claim/route.ts
// Launch promo: the first 1,000 verdict fixes are free.
//
// The scan + findings are ALWAYS free. This endpoint gates the 10-minute FIX
// (and the limited Corvus chat) for FREE users only. Paid tiers never call
// this and never consume a slot — the app only claims when the user lacks
// full access.
//
// Counting model (per Josh): one slot per FIX delivered (per verdict), matching
// the "1,000 free verdicts" metric. Atomic via INCR; idempotent via a set of
// granted verdictIds so re-opening the same verdict never burns a second slot.
// Counter starts at 0 and is created on first claim (launch day) — no backfill.
//
// Auth: x-app-token header must match EXPO_PUBLIC_CORVUS_APP_TOKEN (same soft
// gate as the other /api/mobile endpoints).

export const runtime = "nodejs";

import redis from "@/lib/redis";

const APP_TOKEN =
  process.env.EXPO_PUBLIC_CORVUS_APP_TOKEN ??
  process.env.OCWS_MOBILE_APP_TOKEN ??
  "";

const COUNT_KEY = "corvus:v1:freefix:count"; // integer
const GRANTED_KEY = "corvus:v1:freefix:granted"; // set of verdictIds granted a free fix
const CAP = 1000;

export async function POST(req: Request) {
  try {
    if (APP_TOKEN) {
      const tok = req.headers.get("x-app-token") ?? "";
      if (tok !== APP_TOKEN) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({} as any));
    const verdictId = String(body?.verdictId ?? "").trim().slice(0, 200);
    if (!verdictId) {
      return Response.json(
        { ok: false, error: "Bad request: verdictId required" },
        { status: 400 }
      );
    }

    // Idempotent: a verdict already granted a free fix re-grants without
    // consuming another slot (re-opens, app restarts, retries).
    const already = await redis.sismember(GRANTED_KEY, verdictId);
    if (already) {
      const claimed = Math.min((await redis.get<number>(COUNT_KEY)) ?? 0, CAP);
      return Response.json({
        ok: true,
        granted: true,
        alreadyClaimed: true,
        claimed,
        remaining: Math.max(0, CAP - claimed),
        cap: CAP,
      });
    }

    // Atomically take a slot.
    const n = await redis.incr(COUNT_KEY);
    if (n <= CAP) {
      await redis.sadd(GRANTED_KEY, verdictId);
      return Response.json({
        ok: true,
        granted: true,
        alreadyClaimed: false,
        claimed: n,
        remaining: Math.max(0, CAP - n),
        cap: CAP,
      });
    }

    // Over the cap — hand the slot back so the counter doesn't drift above CAP,
    // and fall the user through to the normal paywall.
    await redis.decr(COUNT_KEY);
    return Response.json({
      ok: true,
      granted: false,
      alreadyClaimed: false,
      claimed: CAP,
      remaining: 0,
      cap: CAP,
    });
  } catch (err: any) {
    console.error("[freefix/claim] error:", err?.message ?? err);
    // Fail closed (not granted) so an outage never gives away fixes beyond the
    // cap. The app treats a non-granted / failed claim as "show the paywall."
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 500 });
  }
}
