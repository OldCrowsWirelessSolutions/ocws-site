// app/api/admin/verify/route.ts
// Validates an admin secret SERVER-SIDE so the client never has to embed it.
// The login screens send the value the admin typed (header x-admin-key, or { key }
// body); we check it against OCWS_ADMIN_SECRET via the shared helper. 200 = valid,
// 401 = not. This is what lets app/login + app/admin authenticate without baking
// the secret into the browser bundle.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!isValidAdminKey(req.headers.get("x-admin-key"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  let presented: string | null = req.headers.get("x-admin-key");
  if (!presented) {
    try {
      const body = (await req.json()) as { key?: string } | null;
      presented = body?.key ?? null;
    } catch {
      presented = null;
    }
  }
  if (!isValidAdminKey(presented)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
