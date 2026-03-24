// app/api/subscriptions/validate/route.ts
// Validates a Subscription ID (or internal admin/founder/promo code).
// Returns entitlement data safe to expose to the client.
// The client must re-validate server-side before any bypass — do not trust
// client-side state for payment decisions.

export const runtime = "nodejs";

import { validateSubscriptionId } from "@/lib/subscriptions";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as { subscription_id?: string } | null;
    const input = String(body?.subscription_id ?? "").trim();

    if (!input) {
      return Response.json({ valid: false, error: "Subscription ID is required." }, { status: 400 });
    }

    const result = await validateSubscriptionId(input);
    return Response.json(result, { status: 200 });
  } catch (err) {
    console.error("[subscriptions/validate]", err);
    return Response.json({ valid: false, error: "Validation failed." }, { status: 500 });
  }
}
