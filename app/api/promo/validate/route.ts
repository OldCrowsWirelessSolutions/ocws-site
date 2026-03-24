// app/api/promo/validate/route.ts
// Public endpoint — validates a one-time promo code.
// Never exposes internal Redis data. Returns only valid/type or invalid.
export const runtime = "nodejs";

import { validatePromoCode } from "@/lib/promo-codes";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as { code?: string } | null;
    const code = String(body?.code ?? "").trim().toUpperCase();
    if (!code) return Response.json({ valid: false });

    const result = await validatePromoCode(code);
    if (!result) return Response.json({ valid: false });

    return Response.json({ valid: true, type: result.type });
  } catch (err) {
    console.error("[promo/validate]", err);
    return Response.json({ valid: false });
  }
}
