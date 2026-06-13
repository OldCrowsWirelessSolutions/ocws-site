// app/api/mobile/corvus-chat-quota/route.ts
// Read-only quota lookup for the Corvus chat tab. Mobile calls this on
// chat-screen mount when a verdict context is present so the UI can show
// "X questions left on this scan" without consuming a question.
//
// Auth: x-app-token (same as corvus-chat).
// Method: GET ?userId=...&verdictId=...&userTier=...

export const runtime = "nodejs";

import redis from "@/lib/redis";

const APP_TOKEN = process.env.EXPO_PUBLIC_CORVUS_APP_TOKEN
  ?? process.env.OCWS_MOBILE_APP_TOKEN
  ?? "";

const QUOTA_LIMIT = 5;

const UNLIMITED_TIERS = new Set([
  "murder", "admin", "orgAdmin", "teamLead", "subordinate", "vip", "founder",
]);

function quotaKey(userId: string, verdictId: string): string {
  return `corvus:v1:chat_count:${userId.slice(0, 100)}:${verdictId.slice(0, 100)}`;
}

export async function GET(req: Request) {
  try {
    if (APP_TOKEN) {
      const tok = req.headers.get("x-app-token") ?? "";
      if (tok !== APP_TOKEN) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const url = new URL(req.url);
    const userId    = (url.searchParams.get("userId") ?? "").trim();
    const verdictId = (url.searchParams.get("verdictId") ?? "").trim();
    const userTier  = (url.searchParams.get("userTier") ?? "guest").trim();
    // VIPs/founders carry an `unlimited` flag rather than a metered tier string.
    const clientUnlimited = url.searchParams.get("unlimited") === "1";

    if (!userId) {
      return Response.json({ ok: false, error: "Bad request: userId required" }, { status: 400 });
    }
    if (!verdictId) {
      // Without a verdict context, no quota applies — return unlimited.
      return Response.json({
        ok: true,
        quota: { used: 0, limit: QUOTA_LIMIT, remaining: QUOTA_LIMIT, unlimited: true },
      });
    }

    if (UNLIMITED_TIERS.has(userTier) || clientUnlimited) {
      return Response.json({
        ok: true,
        quota: { used: 0, limit: QUOTA_LIMIT, remaining: QUOTA_LIMIT, unlimited: true },
      });
    }

    let used = 0;
    try {
      const v = await redis.get<number>(quotaKey(userId, verdictId));
      used = typeof v === "number" ? v : 0;
    } catch (err) {
      console.error("[mobile/corvus-chat-quota] redis read failed:", err);
      // Fail-open: show full quota so user can try; the POST endpoint
      // will re-check before consuming.
      return Response.json({
        ok: true,
        quota: { used: 0, limit: QUOTA_LIMIT, remaining: QUOTA_LIMIT, unlimited: false },
      });
    }

    const remaining = Math.max(0, QUOTA_LIMIT - used);
    return Response.json({
      ok: true,
      quota: { used, limit: QUOTA_LIMIT, remaining, unlimited: false },
    });
  } catch (err: any) {
    console.error("[mobile/corvus-chat-quota] route error:", err?.message ?? err);
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 500 });
  }
}
