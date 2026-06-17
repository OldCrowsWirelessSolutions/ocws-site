// app/api/admin/vip/activity/route.ts
// Returns all VIP subordinate activity for the admin dashboard.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAllVIPSubordinates } from "@/lib/vip-codes";
import { isValidAdminKey } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (!isValidAdminKey(adminKey)) {
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
