// app/api/admin/promo/list/route.ts
export const runtime = "nodejs";

import { listPromoCodes } from "@/lib/promo-codes";

const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "SpectrumLife2026!!";

function isAuthed(req: Request): boolean {
  const key = req.headers.get("x-admin-key") ?? "";
  return key === ADMIN_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthed(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const codes = await listPromoCodes();
    return Response.json({ codes });
  } catch (err) {
    console.error("[admin/promo/list]", err);
    return Response.json({ error: "Failed to list codes" }, { status: 500 });
  }
}
