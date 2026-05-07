// app/api/team/generate-subordinate/route.ts
// Team lead generates a new CORVUS-ORG-* invite code for their team.
// Auth: x-lead-code header must be a valid lead code (the leadCode is the
// credential — anyone who has it can act as that lead).

export const runtime = "nodejs";

import {
  generateSubordinateCode,
  getTeamLeadByCode,
  listSubordinatesByLead,
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

    // Enforce maxSubordinates — count active (non-revoked) subs.
    const existing = await listSubordinatesByLead(leadCode);
    const activeCount = existing.filter((s) => !s.revoked).length;
    if (activeCount >= lead.maxSubordinates) {
      return Response.json(
        { error: `Seat limit reached (${lead.maxSubordinates}). Revoke unused codes to free a seat.` },
        { status: 403 },
      );
    }

    const sub = await generateSubordinateCode(leadCode);
    return Response.json({ ok: true, subordinate: sub });
  } catch (err) {
    console.error("[team/generate-subordinate]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
