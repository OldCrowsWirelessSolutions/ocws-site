// app/api/team/list-verdicts/route.ts
// Team lead pulls the cross-device feed of verdict summaries from all
// subordinates (and themselves). Newest first.
// Auth: x-lead-code header.

export const runtime = "nodejs";

import {
  getTeamLeadByCode,
  listVerdictsByLead,
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

    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(500, Number(url.searchParams.get("limit") ?? 200)));
    const verdicts = await listVerdictsByLead(leadCode, limit);
    return Response.json({ ok: true, verdicts });
  } catch (err) {
    console.error("[team/list-verdicts]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
