// app/api/promo/validate/route.ts
// Public endpoint — validates a one-time promo code.
// Never exposes internal Redis data. Returns only valid/type or invalid.
export const runtime = "nodejs";

import { validatePromoCode } from "@/lib/promo-codes";

// Permanent discount codes — hardcoded, never expire, unlimited uses
const PERMANENT_DISCOUNT_CODES: Record<string, { discountPercent: number; label: string }> = {
  "CORVUS-HONOR": { discountPercent: 20, label: "Military & First Responder 20% Discount" },
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as { code?: string } | null;
    const code = String(body?.code ?? "").trim().toUpperCase();
    if (!code) return Response.json({ valid: false });

    // Check permanent discount codes first
    if (PERMANENT_DISCOUNT_CODES[code]) {
      const { discountPercent, label } = PERMANENT_DISCOUNT_CODES[code];
      return Response.json({ valid: true, type: "discount", discountPercent, label });
    }

    const result = await validatePromoCode(code);
    if (!result) return Response.json({ valid: false });

    return Response.json({ valid: true, type: result.type, products: result.products });
  } catch (err) {
    console.error("[promo/validate]", err);
    return Response.json({ valid: false });
  }
}
