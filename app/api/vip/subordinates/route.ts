// app/api/vip/subordinates/route.ts
// Returns active subordinate codes for a VIP member.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { isVIPCode, getActiveSubordinates } from "@/lib/vip-codes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();

    if (!code) return NextResponse.json({ error: "VIP code required" }, { status: 400 });
    if (!isVIPCode(code)) return NextResponse.json({ error: "Invalid VIP code" }, { status: 403 });

    const subordinates = await getActiveSubordinates(code);
    return NextResponse.json({ subordinates });
  } catch (err) {
    console.error("[vip/subordinates]", err);
    return NextResponse.json({ error: "Failed to fetch subordinates" }, { status: 500 });
  }
}
