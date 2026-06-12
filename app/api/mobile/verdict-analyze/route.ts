// app/api/mobile/verdict-analyze/route.ts
// Mobile-specific Anthropic proxy for the Crow's Eye verdict / reckoning
// flow. Replaces the prior pattern of mobile calling api.anthropic.com
// directly with EXPO_PUBLIC_ANTHROPIC_API_KEY bundled in the APK.
//
// Why this exists:
//   1. Reliability — server-side model swaps fix bugs (e.g. the v20 Sonnet
//      4.0 deprecation surge) without requiring an app update + Play
//      Store review cycle. Real-user failures at Panera Bread + a Trail
//      Life event surfaced the cost of mobile-bundled model strings.
//   2. Security — the mobile client no longer needs an Anthropic API key
//      bundled in its APK (long-flagged TODO from V10).
//   3. Observability — Vercel logs every analysis request, which is far
//      better than guessing at mobile-side failures from logcat snippets.
//
// Request shape: mobile builds the full system prompt + user content
// itself (it knows the verdict / reckoning context, language level,
// network payload, photos, etc.) and sends it here as opaque content.
// We just relay to Anthropic with the canonical model and return the
// raw text response. Mobile parses JSON from the text the way it
// always has, so the contract on the mobile side is a 1-line URL swap.
//
// Auth: x-app-token header must match EXPO_PUBLIC_CORVUS_APP_TOKEN. This
// is a soft gate — the token IS bundled in the mobile app and would be
// extractable, but it stops opportunistic third-party abuse of the
// endpoint and lets us rotate via Vercel env vars if needed.

export const runtime    = "nodejs";
export const maxDuration = 300;

const APP_TOKEN = process.env.EXPO_PUBLIC_CORVUS_APP_TOKEN
  ?? process.env.OCWS_MOBILE_APP_TOKEN
  ?? "";

// Single source of truth for which Sonnet model the mobile app uses.
// Bumping this here ships a fix to every running app instantly.
const MODEL_ID  = "claude-sonnet-4-6";

type ImageEntry = {
  type: "image";
  source: { type: "base64"; media_type: string; data: string };
};
type TextEntry  = { type: "text"; text: string };
type Content    = ImageEntry | TextEntry;

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
      console.error("[mobile/verdict-analyze] ANTHROPIC_API_KEY not configured");
      return Response.json({ ok: false, error: "Service not configured" }, { status: 500 });
    }

    // v28: hard cap on request body size. Pathological inputs (e.g. dozens
    // of photos, runaway per-location data) can't burn Anthropic API quota
    // on guaranteed-to-fail calls. The mobile-side 30-network cap (v23 for
    // verdict, v28 for reckoning) keeps real flows well under this — at
    // 4 photos × ~2MB each + JSON it caps around 9MB.
    const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
    const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10 MB
    if (contentLength > MAX_BODY_BYTES) {
      console.warn("[mobile/verdict-analyze] oversized request rejected:", contentLength);
      return Response.json(
        { ok: false, error: "Scan payload too large. Reduce photos or scan a less dense environment." },
        { status: 413 },
      );
    }

    const body = await req.json().catch(() => null) as {
      prompt?:        string;
      panoramaPhotos?: string[]; // base64 JPEGs, no data: prefix
      isReckoning?:   boolean;
    } | null;

    if (!body || typeof body.prompt !== "string" || body.prompt.length < 16) {
      return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
    }

    // ── Build content array ────────────────────────────────────────────────
    // Mirror the mobile client's exact pattern — images first (capped at 4
    // for API-side image limits), then the text prompt.
    const content: Content[] = [];
    const photos = Array.isArray(body.panoramaPhotos) ? body.panoramaPhotos.slice(0, 4) : [];
    for (const photo of photos) {
      if (typeof photo === "string" && photo.length > 0) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: "image/jpeg", data: photo },
        });
      }
    }
    content.push({ type: "text", text: body.prompt });

    const isReckoning = body.isReckoning === true;
    // 2026-05-08: pinned to Sonnet 4.6's full 64K output ceiling per
    // user request — "bump the cap to something ridiculous, that there
    // is no way any scan or reckoning is going to hit." Real-user
    // [ETRUNC] failures from Nate's tablet were caused by the original
    // 2000/4000 caps being too tight for Sonnet's prose + the v22
    // router-vendor mandate + IT Pro language verbosity. Typical
    // responses are 2-4K tokens; even the most pathological reckoning
    // (16 locations + IT Pro language + many findings each location)
    // tops out around 30-40K. Pinning at 64K removes truncation as a
    // failure mode entirely. max_tokens is a ceiling not a target so
    // typical responses cost the same as before; only the rare
    // pathological case actually consumes the new headroom.
    const maxTokens = 64000;

    // ── Call Anthropic ─────────────────────────────────────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240_000); // 240s

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
          model:      MODEL_ID,
          max_tokens: maxTokens,
          messages:   [{ role: "user", content }],
        }),
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === "AbortError") {
        console.error("[mobile/verdict-analyze] timeout");
        return Response.json({ ok: false, error: "Analysis timed out" }, { status: 504 });
      }
      console.error("[mobile/verdict-analyze] fetch failed:", err?.message ?? err);
      return Response.json({ ok: false, error: "Upstream unavailable" }, { status: 502 });
    }
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => "");
      console.error(
        "[mobile/verdict-analyze] upstream non-ok:",
        upstream.status,
        errBody.slice(0, 500),
      );
      // Translate 4xx (oversized payload, deprecated model, bad image, etc.)
      // into a tester-friendly message; pass through the status so the
      // mobile retry policy can distinguish 4xx (don't retry) from 5xx.
      if (upstream.status === 400) {
        return Response.json(
          {
            ok: false,
            error:
              "Corvus couldn't process this scan — likely an oversized payload " +
              "from a dense RF environment. Try again with fewer photos attached.",
          },
          { status: 400 },
        );
      }
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
      console.error("[mobile/verdict-analyze] malformed response:", JSON.stringify(data).slice(0, 300));
      return Response.json({ ok: false, error: "Malformed upstream response" }, { status: 502 });
    }

    if (data.stop_reason === "max_tokens") {
      // Mobile already surfaces a clear retry hint for this case; pass
      // it back distinctly so the client doesn't waste its retry budget.
      return Response.json(
        {
          ok: false,
          error:
            "Analysis exceeded the response budget at this language level. " +
            "Try the scan again at Balanced or Simple.",
          truncated: true,
        },
        { status: 200 },
      );
    }

    const rawText = data.content.map(c => c?.text ?? "").join("");

    // We deliberately don't parse the inner JSON server-side — mobile has
    // its own JSON parsing + healing logic and we want to keep this
    // endpoint a thin relay. Return the raw text and let the client do
    // what it already does.
    return Response.json({ ok: true, rawText, model: MODEL_ID });
  } catch (err: any) {
    console.error("[mobile/verdict-analyze] route error:", err?.message ?? err);
    return Response.json({ ok: false, error: "Service unavailable" }, { status: 500 });
  }
}
