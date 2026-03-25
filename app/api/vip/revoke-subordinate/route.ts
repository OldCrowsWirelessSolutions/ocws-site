// app/api/vip/revoke-subordinate/route.ts
// Revokes a subordinate code on behalf of a VIP member.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { isVIPCode, revokeSubordinateCode } from "@/lib/vip-codes";

export async function POST(req: NextRequest) {
  try {
    const body    = await req.json() as { code?: string; subCode?: string };
    const code    = String(body?.code    ?? "").trim().toUpperCase();
    const subCode = String(body?.subCode ?? "").trim().toUpperCase();

    if (!code)    return NextResponse.json({ error: "VIP code required" }, { status: 400 });
    if (!subCode) return NextResponse.json({ error: "Subordinate code required" }, { status: 400 });
    if (!isVIPCode(code)) return NextResponse.json({ error: "Invalid VIP code" }, { status: 403 });

    await revokeSubordinateCode(code, subCode);
    return NextResponse.json({ revoked: true });
  } catch (err) {
    console.error("[vip/revoke-subordinate]", err);
    return NextResponse.json({ error: "Failed to revoke code" }, { status: 500 });
  }
}
