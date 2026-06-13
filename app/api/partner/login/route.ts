// app/api/partner/login/route.ts
// Validates a partner lead code for the web portal. The lead code IS the
// credential (consistent with the team-leads model) — the portal stores it
// client-side and sends it as x-partner-lead-code on every subsequent call.
// Public endpoint: it only confirms a code is real and echoes safe profile
// fields; it grants nothing on its own.

export const runtime = "nodejs";

import { getPartnerByCode } from "@/lib/partner-channel";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { code?: string };
    const code = String(body?.code ?? "").trim().toUpperCase();
    if (!code) return Response.json({ valid: false, error: "code required" }, { status: 400 });

    const partner = await getPartnerByCode(code);
    if (!partner) return Response.json({ valid: false });

    return Response.json({
      valid:    true,
      leadCode: partner.leadCode,
      name:     partner.name,
      company:  partner.company,
    });
  } catch (err) {
    console.error("[partner/login]", err);
    return Response.json({ valid: false, error: "Service unavailable" }, { status: 503 });
  }
}
