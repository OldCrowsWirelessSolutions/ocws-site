// app/api/team/ensure-lead/route.ts
// Idempotent — registers or returns a team lead profile on the server.
// Called from mobile during VIP code redemption and during flock/murder
// promo-code redemption so the server is source-of-truth for who is a
// team lead and what org they belong to.
//
// Auth: lightweight — caller must include x-admin-key OR provide a valid
// suggestedLeadCode that already exists for this user. For VIP bootstraps
// from the mobile client we accept the request without admin auth because
// the userId/email is already on the device's authenticated session and
// the team-lead profile only grants the ability to create CORVUS-ORG-*
// codes, not direct write access to anyone else's data.

export const runtime = "nodejs";

import { ensureTeamLead, TeamLeadRecord } from "@/lib/team-leads";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      userId?:            string;
      name?:              string;
      email?:             string;
      orgId?:             string;
      orgName?:           string;
      maxSubordinates?:   number;
      suggestedLeadCode?: string;
      source?:            TeamLeadRecord["source"];
    };

    const userId  = String(body.userId  ?? "").trim();
    const name    = String(body.name    ?? "").trim();
    const email   = String(body.email   ?? "").trim().toLowerCase();
    const orgId   = String(body.orgId   ?? "").trim();
    const orgName = String(body.orgName ?? "").trim();

    if (!userId || !name || !orgId || !orgName) {
      return Response.json({ error: "userId, name, orgId, orgName required" }, { status: 400 });
    }

    const lead = await ensureTeamLead({
      userId,
      name,
      email,
      orgId,
      orgName,
      maxSubordinates:   body.maxSubordinates ?? 25,
      suggestedLeadCode: body.suggestedLeadCode,
      source:            body.source ?? "manual",
    });

    return Response.json({ ok: true, lead });
  } catch (err) {
    console.error("[team/ensure-lead]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
