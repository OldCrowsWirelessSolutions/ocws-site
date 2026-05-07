// app/api/team/revoke-subordinate/route.ts
// Team lead revokes a subordinate's access. Idempotent.
// Auth: x-lead-code header — must own the subordinate being revoked.

export const runtime = "nodejs";

import {
  getTeamLeadByCode,
  revokeSubordinate,
} from "@/lib/team-leads";

export async function POST(req: Request) {
  try {
    const leadCode = req.headers.get("x-lead-code")?.toUpperCase().trim() ?? "";
    if (!leadCode) {
      return Response.json({ error: "x-lead-code header required" }, { status: 401 });
    }

    const lead = await getTeamLeadByCode(leadCode);
    if (!lead) {
      return Response.json({ error: "Unknown lead code" }, { status: 401 });
    }

    const body = await req.json() as { accessCode?: string };
    const accessCode = String(body.accessCode ?? "").trim().toUpperCase();
    if (!accessCode) {
      return Response.json({ error: "accessCode required" }, { status: 400 });
    }

    const ok = await revokeSubordinate(leadCode, accessCode);
    return Response.json({ ok });
  } catch (err) {
    console.error("[team/revoke-subordinate]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
