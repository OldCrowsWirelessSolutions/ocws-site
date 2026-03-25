// app/api/subscriptions/seat-info/route.ts
// Returns seat count and member list for a subscription.
export const runtime = "nodejs";

import { validateSubscriptionId, getSeatCount, getSeatMembers } from "@/lib/subscriptions";
import { SEAT_RULES } from "@/lib/price-map";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();
    if (!code) return Response.json({ error: "Code required." }, { status: 400 });

    const validation = await validateSubscriptionId(code);
    if (!validation.valid) {
      return Response.json({ error: validation.error ?? "Invalid code." }, { status: 403 });
    }

    // Founders/admins get basic seat info at nest level
    const tier   = validation.tier ?? "nest";
    const rules  = SEAT_RULES[tier] ?? SEAT_RULES.nest;

    const [additionalSeats, members] = await Promise.all([
      getSeatCount(code),
      getSeatMembers(code),
    ]);

    return Response.json({
      tier,
      includedSeats:    rules.included,
      additionalSeats,
      totalSeats:       rules.included + additionalSeats,
      maxTotal:         rules.maxTotal,
      maxAdditional:    rules.maxAdditional,
      upgradeRequired:  rules.upgradeRequired,
      members,
    });
  } catch (err) {
    console.error("[seat-info]", err);
    return Response.json({ error: "Failed to load seat info." }, { status: 500 });
  }
}
