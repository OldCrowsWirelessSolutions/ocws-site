// app/api/analytics/chat/route.ts
// Chat usage analytics — admin only.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getChatAnalytics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-admin-key") ?? "";
  if (!key || key !== process.env.OCWS_ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getChatAnalytics();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[analytics/chat]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
