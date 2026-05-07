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
// v19: also returns `requiresAccount: true` on subscriber products
// (sub_nest / sub_flock / sub_murder) so the mobile client knows to gate
// the redemption behind an email + password prompt before activating the
// session. The actual account creation happens at /api/auth/account/create.
//
// Never exposes internal Redis data on failure. Returns only success/failure
// plus the entitlement payload on success.
export const runtime = "nodejs";

import { redeemPromoCode, validatePromoCode } from "@/lib/promo-codes";

// Products that bind to a permanent identity and therefore warrant the
// account-creation flow on first redemption. Demo products (multi-use,
// time-windowed) intentionally bypass — they're investor / event giveaways
// that shouldn't bake an email into Redis.
const ACCOUNT_REQUIRING_PRODUCTS = new Set([
  "sub_nest", "sub_flock", "sub_murder", "sub_any",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as {
      code?: string;
      usedBy?: string;
      // v19: when set to true, validate-only — do NOT consume single-use
      // codes. Lets the mobile client preview the code's tier so it can
      // route the user through the account-creation flow before final
      // consumption. The /api/auth/account/create endpoint will consume
      // the code atomically with account creation.
      dryRun?: boolean;
    } | null;

    const code = String(body?.code ?? "").trim().toUpperCase();
    const usedBy = body?.usedBy ? String(body.usedBy).trim() : undefined;
    const dryRun = body?.dryRun === true;

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

    // Mark as used unless this is a dry-run validation. For single-use codes
    // this consumes the code; for time-based codes it's a no-op (the time
    // window already gates further use). The lib function returns false if
    // the code became invalid between validate and redeem (race condition
    // with another redeemer); treat as "no longer available" without
    // disclosing why.
    if (!dryRun) {
      const ok = await redeemPromoCode(code, usedBy);
      if (!ok) {
        return Response.json({ valid: false });
      }
    }

    // Determine if this redemption requires the new account-creation flow.
    // Demo codes with murder/flock tier are multi-use and intentionally
    // don't require account creation (investor/event giveaways). Subscriber
    // products always do.
    const requiresAccount = ACCOUNT_REQUIRING_PRODUCTS.has(validation.products);

    return Response.json({
      valid: true,
      type: validation.type,
      products: validation.products,
      // For demo codes, the admin-chosen tier (nest / flock / murder).
      // Mobile redeem flow uses this to grant the right access level
      // instead of a hardcoded default.
      tier: validation.tier,
      requiresAccount,
    });
  } catch (err) {
    console.error("[promo/redeem]", err);
    return Response.json({ valid: false, error: "Service unavailable" }, { status: 503 });
  }
}
