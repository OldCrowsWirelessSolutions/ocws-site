// app/api/admin/promo/deactivate/route.ts
export const runtime = "nodejs";

import { deactivatePromoCode } from "@/lib/promo-codes";
import { isValidAdminKey } from "@/lib/adminAuth";

function isAuthed(req: Request): boolean {
  return isValidAdminKey(req.headers.get("x-admin-key"));
}

export async function POST(req: Request) {
  if (!isAuthed(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json() as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();
    if (!code) {
      return Response.json({ error: "code is required" }, { status: 400 });
    }
    await deactivatePromoCode(code);
    return Response.json({ success: true });
  } catch (err) {
    console.error("[admin/promo/deactivate]", err);
    return Response.json({ error: "Failed to deactivate code" }, { status: 500 });
  }
}
