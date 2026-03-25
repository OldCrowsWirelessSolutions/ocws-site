// app/api/analytics/platform/route.ts
// Returns platform-wide analytics (admin only).
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getPlatformAnalytics } from "@/lib/analytics";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "SpectrumLife2026!!";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const analytics = await getPlatformAnalytics(30);
    return NextResponse.json({ analytics });
  } catch (err) {
    console.error("[analytics/platform]", err);
    return NextResponse.json({ error: "Failed to fetch platform analytics" }, { status: 500 });
  }
}
