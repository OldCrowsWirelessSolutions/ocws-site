// app/api/team/list-subordinates/route.ts
// Team lead lists all their subordinate codes (open, redeemed, revoked).
// Auth: x-lead-code header.

export const runtime = "nodejs";

import {
  getTeamLeadByCode,
  listSubordinatesByLead,
} from "@/lib/team-leads";

export async function GET(req: Request) {
  try {
    const leadCode = req.headers.get("x-lead-code")?.toUpperCase().trim() ?? "";
    if (!leadCode) {
      return Response.json({ error: "x-lead-code header required" }, { status: 401 });
    }

    const lead = await getTeamLeadByCode(leadCode);
    if (!lead) {
      return Response.json({ error: "Unknown lead code" }, { status: 401 });
    }

    const subs = await listSubordinatesByLead(leadCode);
    return Response.json({ ok: true, lead, subordinates: subs });
  } catch (err) {
    console.error("[team/list-subordinates]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
