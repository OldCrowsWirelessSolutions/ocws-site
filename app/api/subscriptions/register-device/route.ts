// app/api/subscriptions/register-device/route.ts
// Best-effort device seat registration.
// Receives the subscription_id + a client-generated device token.
// Checks seat availability, registers the device, and returns seat counts.
// Admin/founder codes bypass this endpoint entirely (no seats needed).
// NOTE: This is honest seat tracking, not tamper-proof hardware locking.
// A user who clears localStorage can re-register as a new device.

export const runtime = "nodejs";

import { registerDevice, validateSubscriptionId } from "@/lib/subscriptions";

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

    // Validate format — must be an OCWS subscription ID (not admin/founder/promo)
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
