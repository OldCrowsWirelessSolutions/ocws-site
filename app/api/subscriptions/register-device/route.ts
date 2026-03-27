// app/api/subscriptions/register-device/route.ts
// Best-effort device seat registration.
// Receives the subscription_id + a client-generated device token.
// Checks seat availability, registers the device, and returns seat counts.
// Bypass codes (VIP, admin, founder, promo, subordinate) skip seat tracking.
// NOTE: This is honest seat tracking, not tamper-proof hardware locking.
// A user who clears localStorage can re-register as a new device.

export const runtime = "nodejs";

import { registerDevice, validateSubscriptionId } from "@/lib/subscriptions";
import { resolveCode } from "@/lib/code-resolver";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as {
      subscription_id?: string;
      device_token?: string;
    } | null;

    const subscription_id = String(body?.subscription_id ?? "").trim().toUpperCase();
    const device_token    = String(body?.device_token    ?? "").trim();

    if (!subscription_id || !device_token) {
      return Response.json(
        { success: false, error: "subscription_id and device_token are required." },
        { status: 400 }
      );
    }

    // Resolve code type — bypass codes don't need seat registration
    const resolved = await resolveCode(subscription_id);

    if (resolved.kind === "unknown") {
      return Response.json(
        { success: false, error: "Invalid or unrecognized code." },
        { status: 403 }
      );
    }

    if (resolved.isBypass) {
      // VIP, founder, admin, subordinate, promo — no seat tracking needed
      return Response.json({ success: true, seats_used: 0, seat_limit: -1 });
    }

    // Subscriber code — validate and register device seat
    const validation = await validateSubscriptionId(subscription_id);
    if (!validation.valid || validation.type !== "subscription") {
      return Response.json(
        { success: false, error: "Subscription is not valid or not active." },
        { status: 403 }
      );
    }

    const user_agent = req.headers.get("user-agent") ?? "unknown";
    const result = await registerDevice(subscription_id, device_token, user_agent);

    return Response.json(result, { status: result.success ? 200 : 403 });
  } catch (err) {
    console.error("[subscriptions/register-device]", err);
    return Response.json({ success: false, error: "Device registration failed." }, { status: 500 });
  }
}
