// app/api/subscriptions/remove-seat/route.ts
// Removes a named seat member from a subscription and deactivates their code.
export const runtime = "nodejs";

import redis from "@/lib/redis";
import { validateSubscriptionId, removeSeatMember } from "@/lib/subscriptions";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { code?: string; memberEmail?: string };
    const code        = String(body?.code ?? "").trim().toUpperCase();
    const memberEmail = String(body?.memberEmail ?? "").trim().toLowerCase();

    if (!code)        return Response.json({ error: "Code required." }, { status: 400 });
    if (!memberEmail) return Response.json({ error: "Member email required." }, { status: 400 });

    const validation = await validateSubscriptionId(code);
    if (!validation.valid || validation.type !== "subscription") {
      return Response.json({ error: "Invalid or inactive subscription." }, { status: 403 });
    }

    // Find the member's seat code and deactivate it
    const seatCodeKey = await redis.get<string>(`email:${memberEmail}:code`);
    if (seatCodeKey) {
      const seatRecord = await redis.get<Record<string, unknown>>(`code:${seatCodeKey}`);
      if (seatRecord && seatRecord.parentCode === code) {
        // Deactivate the seat code
        await redis.set(`code:${seatCodeKey}`, { ...seatRecord, active: false });
      }
    }

    await removeSeatMember(code, memberEmail);

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[remove-seat]", err);
    return Response.json({ error: "Failed to remove member." }, { status: 500 });
  }
}
