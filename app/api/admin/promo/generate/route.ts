// app/api/admin/promo/generate/route.ts
export const runtime = "nodejs";

import { generatePromoCode, PromoType } from "@/lib/promo-codes";

const VALID_TYPES: PromoType[] = [
  "verdict",
  "reckoning_small",
  "reckoning_standard",
  "reckoning_commercial",
  "reckoning_pro",
];

function isAuthed(req: Request): boolean {
  const key = req.headers.get("x-admin-key") ?? "";
  return key === (process.env.OCWS_ADMIN_SECRET ?? "");
}

export async function POST(req: Request) {
  if (!isAuthed(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json() as { type?: string; note?: string; expiresAt?: string };
    const type = body.type as PromoType;
    if (!type || !VALID_TYPES.includes(type)) {
      return Response.json({ error: "Invalid type" }, { status: 400 });
    }
    const code = await generatePromoCode(type, body.note ?? "", body.expiresAt);
    return Response.json({ code });
  } catch (err) {
    console.error("[admin/promo/generate]", err);
    return Response.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
