// app/api/admin/promo/generate/route.ts
export const runtime = "nodejs";

import { generatePromoCode, PromoType, PromoProduct, ExpiryType } from "@/lib/promo-codes";

const VALID_TYPES: PromoType[] = [
  "verdict",
  "reckoning_small",
  "reckoning_standard",
  "reckoning_commercial",
  "reckoning_pro",
];

const VALID_EXPIRY_TYPES: ExpiryType[] = [
  "single_use", "24h", "48h", "72h", "7d", "14d", "30d",
];

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "SpectrumLife2026!!";

function isAuthed(req: Request): boolean {
  const key = req.headers.get("x-admin-key") ?? "";
  return key === ADMIN_SECRET;
}

export async function POST(req: Request) {
  if (!isAuthed(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json() as {
      type?: string;
      products?: string;
      expiryType?: string;
      note?: string;
      expiresAt?: string;
    };

    const type = (body.type as PromoType) ?? "verdict";
    if (!VALID_TYPES.includes(type)) {
      return Response.json({ error: "Invalid type" }, { status: 400 });
    }

    const products = (body.products as PromoProduct) ?? (type as PromoProduct);
    const expiryType = VALID_EXPIRY_TYPES.includes(body.expiryType as ExpiryType)
      ? (body.expiryType as ExpiryType)
      : "single_use";

    const code = await generatePromoCode(type, body.note ?? "", body.expiresAt, products, expiryType);
    return Response.json({ code });
  } catch (err) {
    console.error("[admin/promo/generate]", err);
    return Response.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
