// app/api/subscriptions/code-stats/route.ts
// Returns usage stats for a subscriber code.
// GET ?code=CORVUS-NEST-XXXXXX

export const runtime = "nodejs";

import { getCodeStats, validateSubscriptionId } from "@/lib/subscriptions";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = String(searchParams.get("code") ?? "").trim().toUpperCase();

    if (!code) {
      return Response.json({ error: "code is required" }, { status: 400 });
    }

    // Verify the code is valid before returning stats
    const validation = await validateSubscriptionId(code);
    if (!validation.valid) {
      return Response.json({ error: "Invalid code" }, { status: 403 });
    }

    const stats = await getCodeStats(code);
    if (!stats) {
      return Response.json({ usageCount: 0, lastUsed: null });
    }

    return Response.json({
      usageCount: stats.usageCount,
      lastUsed:   stats.lastUsed,
    });
  } catch (err) {
    console.error("[subscriptions/code-stats]", err);
    return Response.json({ usageCount: 0, lastUsed: null });
  }
}
