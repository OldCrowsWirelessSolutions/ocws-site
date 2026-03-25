// app/api/admin/vip/activity/route.ts
// Returns all VIP subordinate activity for the admin dashboard.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAllVIPSubordinates } from "@/lib/vip-codes";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "SpectrumLife2026!!";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const vipData = await getAllVIPSubordinates();
    return NextResponse.json({ vips: vipData });
  } catch (err) {
    console.error("[admin/vip/activity]", err);
    return NextResponse.json({ error: "Failed to fetch VIP activity" }, { status: 500 });
  }
}
