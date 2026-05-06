// app/api/promo/redeem/route.ts
// Public endpoint — atomically redeems a one-time promo code.
// Validates the code, marks it used (single-use codes only), and returns
// the tier/products mapping so the caller can apply the entitlement.
// Multi-use codes (24h/48h/72h/7d/14d/30d windows) are validated but never
// marked "used" — the time window itself is the consumption gate.
//
// This endpoint exists so mobile clients can complete the redemption flow
// in one round-trip — validate-then-mark — without two separate calls and
// without race conditions if the code is shared between testers.
//
// Never exposes internal Redis data on failure. Returns only success/failure
// plus the entitlement payload on success.
export const runtime = "nodejs";

import { redeemPromoCode, validatePromoCode } from "@/lib/promo-codes";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as {
      code?: string;
      usedBy?: string;
    } | null;

    const code = String(body?.code ?? "").trim().toUpperCase();
    const usedBy = body?.usedBy ? String(body.usedBy).trim() : undefined;

    if (!code) {
      return Response.json({ valid: false, error: "Code required" });
    }

    // Validate first to get the tier/product info we need to return on success.
    // validatePromoCode returns null for any failure mode (not found, expired,
    // deactivated, single-use already consumed). We don't disclose which one.
    const validation = await validatePromoCode(code);
    if (!validation) {
      return Response.json({ valid: false });
    }

    // Mark as used. For single-use codes this consumes the code; for time-based
    // codes it's a no-op (the time window already gates further use). The lib
    // function returns false if the code became invalid between validate and
    // redeem (race condition with another redeemer); treat as "no longer
    // available" without disclosing why.
    const ok = await redeemPromoCode(code, usedBy);
    if (!ok) {
      return Response.json({ valid: false });
    }

    return Response.json({
      valid: true,
      type: validation.type,
      products: validation.products,
    });
  } catch (err) {
    console.error("[promo/redeem]", err);
    return Response.json({ valid: false, error: "Service unavailable" }, { status: 503 });
  }
}
