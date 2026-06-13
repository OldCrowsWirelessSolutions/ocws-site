// app/api/partner/ensure/route.ts
// Admin-only partner bootstrap. Onboards a partner (e.g. Cyclone 365) and
// returns their CORVUS-PARTNER-* credential. Idempotent on email.
// Auth: x-admin-key header must match OCWS_ADMIN_SECRET (same gate as
// app/api/admin/codes/generate).

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { ensurePartner } from "@/lib/partner-channel";

// No hardcoded fallback — the secret lives only in env (OCWS_ADMIN_SECRET).
// Fail closed if it isn't configured rather than embedding a real credential.
const ADMIN_SECRET = process.env.OCWS_ADMIN_SECRET || "";

export async function POST(req: NextRequest) {
  if (!ADMIN_SECRET || req.headers.get("x-admin-key") !== ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json() as { name?: string; email?: string; company?: string };
    const name    = String(body?.name    ?? "").trim();
    const email   = String(body?.email   ?? "").trim();
    const company = String(body?.company ?? "").trim();

    if (!email || !company) {
      return Response.json({ error: "email and company are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email." }, { status: 400 });
    }

    const partner = await ensurePartner({ name: name || company, email, company });
    return Response.json({ ok: true, partner });
  } catch (err) {
    console.error("[partner/ensure]", err);
    return Response.json({ error: "Bootstrap failed." }, { status: 500 });
  }
}
