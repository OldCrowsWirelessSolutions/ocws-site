// app/api/admin/promo/deactivate/route.ts
export const runtime = "nodejs";

import { deactivatePromoCode } from "@/lib/promo-codes";

function isAuthed(req: Request): boolean {
  const key = req.headers.get("x-admin-key") ?? "";
  return key === (process.env.OCWS_ADMIN_SECRET ?? "");
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
