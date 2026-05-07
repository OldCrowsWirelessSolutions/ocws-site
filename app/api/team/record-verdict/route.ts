// app/api/team/record-verdict/route.ts
// Subordinate (or team lead) reports a verdict summary so it shows up in
// the team lead's dashboard. Stores summary metadata only — the full
// verdict report stays on the device that ran the scan. Public endpoint
// because subordinates don't have a privileged credential beyond their
// redeemed CORVUS-ORG-* code, and the request is paired with that code
// so it can't post arbitrary verdicts to other teams.

export const runtime = "nodejs";

import {
  getTeamLeadByCode,
  recordTeamVerdict,
  updateSubordinateLastActive,
} from "@/lib/team-leads";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      leadCode?:        string;
      orgId?:           string;
      userId?:          string;
      userEmail?:       string;
      userName?:        string;
      ssid?:            string;
      scanLabel?:       string;
      findingsCount?:   number;
      severitySummary?: { critical: number; high: number; medium: number; low: number };
      // Optional — if posted from a subordinate, their accessCode lets us
      // bump their lastActive timestamp on the lead's roster.
      accessCode?:      string;
    };

    const leadCode  = String(body.leadCode  ?? "").trim().toUpperCase();
    const orgId     = String(body.orgId     ?? "").trim();
    const userId    = String(body.userId    ?? "").trim();
    const userEmail = String(body.userEmail ?? "").trim();
    const userName  = String(body.userName  ?? "").trim();
    const ssid      = String(body.ssid      ?? "").trim();
    const scanLabel = String(body.scanLabel ?? "Verdict").trim();

    if (!leadCode || !orgId || !userId) {
      return Response.json({ error: "leadCode, orgId, userId required" }, { status: 400 });
    }

    const lead = await getTeamLeadByCode(leadCode);
    if (!lead) {
      return Response.json({ error: "Unknown leadCode" }, { status: 401 });
    }
    if (lead.orgId !== orgId) {
      return Response.json({ error: "orgId mismatch" }, { status: 401 });
    }

    const verdict = await recordTeamVerdict({
      leadCode,
      orgId,
      userId,
      userEmail,
      userName,
      ssid,
      scanLabel,
      findingsCount: Number(body.findingsCount ?? 0),
      severitySummary: body.severitySummary ?? { critical: 0, high: 0, medium: 0, low: 0 },
    });

    // Bump subordinate lastActive if they sent an accessCode
    if (body.accessCode) {
      await updateSubordinateLastActive(String(body.accessCode).toUpperCase()).catch(() => {});
    }

    return Response.json({ ok: true, verdict });
  } catch (err) {
    console.error("[team/record-verdict]", err);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
