// app/api/vip/generate-subordinate/route.ts
// Generates a subordinate access code for a VIP member.
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { isVIPCode, generateSubordinateCode, getSubordinateCount, getVIPCode } from "@/lib/vip-codes";
import type { SubExpiryType } from "@/lib/vip-codes";

const VALID_EXPIRY_TYPES: SubExpiryType[] = ["1_use", "24h", "48h", "72h", "7d", "14d", "30d"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; expiryType?: string };
    const code       = String(body?.code ?? "").trim().toUpperCase();
    const expiryType = String(body?.expiryType ?? "").trim() as SubExpiryType;

    if (!code) return NextResponse.json({ error: "VIP code required" }, { status: 400 });
    if (!isVIPCode(code)) return NextResponse.json({ error: "Invalid VIP code" }, { status: 403 });
    if (!VALID_EXPIRY_TYPES.includes(expiryType)) {
      return NextResponse.json({ error: "Invalid expiry type" }, { status: 400 });
    }

    const vip   = getVIPCode(code)!;
    const count = await getSubordinateCount(code);

    if (count >= vip.maxSubordinates) {
      return NextResponse.json({
        error: `Maximum ${vip.maxSubordinates} active subordinate codes reached. Revoke one to generate another.`,
      }, { status: 400 });
    }

    const subCode = await generateSubordinateCode(code, expiryType);
    return NextResponse.json({ code: subCode });
  } catch (err) {
    console.error("[vip/generate-subordinate]", err);
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
