// app/api/mobile/corvus-chat/route.ts
// Mobile-only Anthropic proxy for the Corvus chat tab. Two responsibilities:
//
//   1. Server-side quota enforcement (5 questions per verdict, Murder
//      bypass). The mobile client could implement this locally but a user
//      could wipe SecureStore to reset their counter. Putting the counter
//      in Upstash makes it tamper-resistant.
//
//   2. Removes the bundled-key risk in mobile. Prior pattern called
//      api.anthropic.com directly with EXPO_PUBLIC_ANTHROPIC_API_KEY in
//      the APK. With this proxy, the mobile bundle only carries the
//      x-app-token, which we can rotate via Vercel env vars if abused.
//
// Auth: x-app-token must match EXPO_PUBLIC_CORVUS_APP_TOKEN. Same scheme
// as /api/mobile/verdict-analyze.
//
// Quota:
//   - Tiers that ALWAYS bypass: murder, admin, orgAdmin, teamLead,
//     subordinate. (Mirrors the unlimited-tier set used in the home
//     screen credits display.)
//   - When verdictId is present and tier is not in the bypass set, the
//     count for (userId, verdictId) is atomically read; on the 6th
//     attempt the endpoint returns 402 without consuming a question or
//     calling Anthropic.
//   - When verdictId is ABSENT (general chat from the tab without a
//     verdict context), no quota applies. Free users can chat generally;
//     the 5-question cap is specifically per-scan as the user specified.
//   - Counter TTL is 90 days. Old verdicts won't have lingering counters
//     in Redis forever.

export const runtime    = "nodejs";
export const maxDuration = 60;

import redis from "@/lib/redis";

const APP_TOKEN = process.env.EXPO_PUBLIC_CORVUS_APP_TOKEN
  ?? process.env.OCWS_MOBILE_APP_TOKEN
  ?? "";

// v28: chat moved to Haiku 4.5 for cost efficiency. Chat replies are
// short-form Q&A (system prompt caps at 60 words default), so Haiku's
// reasoning depth is sufficient and we pay ~75% less per call. Verdict
// analysis stays on Sonnet 4.6 — see /api/mobile/verdict-analyze.
// To revert: change to "claude-sonnet-4-20250514", redeploy. ~90 seconds.
const MODEL_ID = "claude-haiku-4-5-20251001";
const QUOTA_LIMIT = 5;
const QUOTA_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

const UNLIMITED_TIERS = new Set([
  "murder", "admin", "orgAdmin", "teamLead", "subordinate",
]);

function quotaKey(userId: string, verdictId: string): string {
  // Hashed: cap the verdictId in the key to a sane length so a malicious
  // client can't blow up Redis by sending a multi-MB verdictId.
  return `corvus:v1:chat_count:${userId.slice(0, 100)}:${verdictId.slice(0, 100)}`;
}

type QuotaState = {
  used:        number;
  limit:       number;
  remaining:   number;
  unlimited:   boolean;
};

function unlimitedQuota(): QuotaState {
  return { used: 0, limit: QUOTA_LIMIT, remaining: Infinity, unlimited: true };
}

export async function POST(req: Request) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    if (APP_TOKEN) {
      const tok = req.headers.get("x-app-token") ?? "";
      if (tok !== APP_TOKEN) {
        return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[mobile/corvus-chat] ANTHROPIC_API_KEY not configured");
      return Response.json({ ok: false, error: "Service not configured" }, { status: 500 });
    }

    const body = await req.json().catch(() => null) as {
      system?:     string | Array<{ type: string; text: string; cache_control?: any }>;
      messages?:   Array<{ role: string; content: any }>;
      max_tokens?: number;
      model?:      string;
      userId?:     string;
      userTier?:   string;
      verdictId?:  string;
    } | null;

    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ ok: false, error: "Bad request: messages required" }, { status: 400 });
    }
    if (!body.system) {
      return Response.json({ ok: false, error: "Bad request: system required" }, { status: 400 });
    }
    if (!body.userId || typeof body.userId !== "string") {
      return Response.json({ ok: false, error: "Bad request: userId required" }, { status: 400 });
    }

    const userId    = body.userId;
    const userTier  = (body.userTier ?? "guest").trim();
    const verdictId = (body.verdictId ?? "").trim();
    const unlimited = UNLIMITED_TIERS.has(userTier);
    const maxTokens = typeof body.max_tokens === "number" && body.max_tokens > 0
      ? Math.min(body.max_tokens, 4000)
      : 2000;
    // v28: server pins the model — ignore any model override from mobile.
    // This lets us swap chat models via Vercel env redeploy (~90s) without
    // requiring an APK rebuild + Play Store review cycle.
    const modelId = MODEL_ID;
    void body.model;

    // ── Quota check (pre-Anthropic) ───────────────────────────────────────
    // Only applies when verdictId is present AND tier is not in bypass set.
    let quotaBeforeCall: QuotaState = unlimitedQuota();
    if (verdictId && !unlimited) {
      let used = 0;
      try {
        const v = await redis.get<number>(quotaKey(userId, verdictId));
        used = typeof v === "number" ? v : 0;
      } catch (err) {
        console.error("[mobile/corvus-chat] quota read failed:", err);
        // Fail-open on Redis read errors — better to let the user chat than
        // to block them on infrastructure. We'll still try to increment
        // after the successful Anthropic call.
      }
      const remaining = Math.max(0, QUOTA_LIMIT - used);
      quotaBeforeCall = { used, limit: QUOTA_LIMIT, remaining, unlimited: false };

      if (remaining <= 0) {
        return Response.json(
          {
            ok:    false,
            error: "quota_exceeded",
            quota: quotaBeforeCall,
          },
          { status: 402 },
        );
      }
    }

    // ── Call Anthropic ────────────────────────────────────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45_000); // 45s

    let upstream: Response;
    try {
      upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method:  "POST",
        signal:  controller.signal,
        headers: {
          "Content-Type":      "application/json",
          "x-api-key":         apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model:      modelId,
          max_tokens: maxTokens,
          system:     body.system,
          messages:   body.messages,
        }),
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === "AbortError") {
        console.error("[mobile/corvus-chat] timeout");
        return Response.json({ ok: false, error: "Corvus is taking longer than usual." }, { status: 504 });
      }
      console.error("[mobile/corvus-chat] fetch failed:", err?.message ?? err);
      return Response.json({ ok: false, error: "Upstream unavailable" }, { status: 502 });
    }
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => "");
      console.error("[mobile/corvus-chat] upstream non-ok:", upstream.status, errBody.slice(0, 500));
      return Response.json(
        { ok: false, error: `Upstream returned ${upstream.status}` },
        { status: upstream.status >= 500 ? 502 : upstream.status },
      );
    }

    const data = await upstream.json().catch(() => null) as {
      content?:     Array<{ type?: string; text?: string }>;
      stop_reason?: string;
    } | null;

    if (!data || !Array.isArray(data.content)) {
      console.error("[mobile/corvus-chat] malformed response");
      return Response.json({ ok: false, error: "Malformed upstream response" }, { status: 502 });
    }

    const text = data.content.map(c => c?.text ?? "").join("");

    // ── Increment quota (post-success) ────────────────────────────────────
    // Only count consumed questions when we actually got a response back.
    // Failed Anthropic calls don't count against the user's quota.
    let quotaAfterCall: QuotaState = quotaBeforeCall;
    if (verdictId && !unlimited) {
      try {
        const newCount = await redis.incr(quotaKey(userId, verdictId));
        await redis.expire(quotaKey(userId, verdictId), QUOTA_TTL_SECONDS);
        const used = typeof newCount === "number" ? newCount : quotaBeforeCall.used + 1;
        const remaining = Math.max(0, QUOTA_LIMIT - used);
        quotaAfterCall = { used, limit: QUOTA_LIMIT, remaining, unlimited: false };
      } catch (err) {
        console.error("[mobile/corvus-chat] quota incr failed:", err);
        // Best-effort: bump the local view of remaining by 1 anyway.
        quotaAfterCall = {
          used:      quotaBeforeCall.used + 1,
          limit:     QUOTA_LIMIT,
          remaining: Math.max(0, QUOTA_LIMIT - (quotaBeforeCall.used + 1)),
          unlimited: false,
        };
      }
    }

    return Response.json({
      ok:    true,
      text,
      quota: quotaAfterCall,
      model: modelId,
    });
  } catch (err: any) {
    console.error("[mobile/corvus-chat] route error:", err?.message ?? err);
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 500 });
  }
}
