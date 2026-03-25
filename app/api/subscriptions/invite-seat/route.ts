// app/api/subscriptions/invite-seat/route.ts
// Generates a seat code for a named team member and sends a welcome email.
export const runtime = "nodejs";

import { randomBytes } from "crypto";
import redis from "@/lib/redis";
import {
  validateSubscriptionId,
  getSeatCount,
  getSeatMembers,
  addSeatMember,
} from "@/lib/subscriptions";
import { SEAT_RULES } from "@/lib/price-map";
import { sendWelcomeEmail } from "@/lib/subscription-email";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { code?: string; memberName?: string; memberEmail?: string };
    const code        = String(body?.code ?? "").trim().toUpperCase();
    const memberName  = String(body?.memberName ?? "").trim();
    const memberEmail = String(body?.memberEmail ?? "").trim().toLowerCase();

    if (!code)        return Response.json({ error: "Code required." }, { status: 400 });
    if (!memberName)  return Response.json({ error: "Member name required." }, { status: 400 });
    if (!memberEmail || !memberEmail.includes("@")) {
      return Response.json({ error: "Valid member email required." }, { status: 400 });
    }

    const validation = await validateSubscriptionId(code);
    if (!validation.valid || validation.type !== "subscription" || !validation.tier) {
      return Response.json({ error: "Invalid or inactive subscription." }, { status: 403 });
    }

    const tier  = validation.tier;
    const rules = SEAT_RULES[tier];

    // Nest cannot invite members
    if (rules.maxAdditional === 0 && rules.maxTotal <= 1) {
      return Response.json({ error: "Nest plan only supports 1 seat. Upgrade to Flock to invite team members." }, { status: 400 });
    }

    // Check capacity: total capacity = included + additional purchased
    const [additionalSeats, members] = await Promise.all([
      getSeatCount(code),
      getSeatMembers(code),
    ]);
    const totalCapacity = rules.included + additionalSeats;

    // The plan owner occupies one included seat; seat members are the rest
    if (members.length >= totalCapacity - 1) {
      return Response.json({
        error: `No seat capacity available. You have ${totalCapacity} total seat${totalCapacity !== 1 ? "s" : ""} and ${members.length} member${members.length !== 1 ? "s" : ""} invited. Add more seats to invite more members.`,
      }, { status: 400 });
    }

    // Check if email already invited
    if (members.some(m => m.email === memberEmail)) {
      return Response.json({ error: "That email already has a seat." }, { status: 409 });
    }

    // Generate a seat code: CORVUS-{TIER}-{6 hex chars}
    const suffix   = randomBytes(3).toString("hex").toUpperCase();
    const seatCode = `CORVUS-${tier.toUpperCase()}-${suffix}`;

    // Store seat code record (inherits parent subscription entitlements)
    await redis.set(`code:${seatCode}`, JSON.stringify({
      subscriptionId: code,
      tier,
      email:         memberEmail,
      createdAt:     new Date().toISOString(),
      active:        true,
      usageCount:    0,
      lastUsed:      null,
      isSeatCode:    true,
      parentCode:    code,
    }));
    await redis.set(`email:${memberEmail}:code`, seatCode);

    // Add member record to parent subscription
    await addSeatMember(code, {
      email:   memberEmail,
      name:    memberName,
      addedAt: new Date().toISOString(),
      code:    seatCode,
    });

    // Send welcome email (non-fatal)
    try {
      await sendWelcomeEmail(memberEmail, tier, seatCode, tier === "murder" ? 999999 : tier === "flock" ? 15 : 3);
    } catch (err) {
      console.error("[invite-seat] welcome email failed (non-fatal):", err);
    }

    return Response.json({ ok: true, seatCode });
  } catch (err) {
    console.error("[invite-seat]", err);
    return Response.json({ error: "Failed to invite member." }, { status: 500 });
  }
}
