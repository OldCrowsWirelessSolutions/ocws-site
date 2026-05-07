// app/api/team/redeem-subordinate/route.ts
// Public endpoint — a subordinate redeems a CORVUS-ORG-* code from their
// own device. Returns the org/lead context plus the assigned subordinate
// userId so the mobile client can stamp it into local userData and start
// posting verdicts to the server-side team verdict log.

export const runtime = "nodejs";

import {
  getTeamLeadByCode,
  redeemSubordinateCode,
} from "@/lib/team-leads";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      code?:  string;
      name?:  string;
      email?: string;
    };

    const code  = String(body.code  ?? "").trim().toUpperCase();
    const name  = String(body.name  ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!code || !name || !email) {
      return Response.json({ valid: false, error: "code, name, email required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ valid: false, error: "Invalid email" }, { status: 400 });
    }

    const sub = await redeemSubordinateCode({ accessCode: code, name, email });
    if (!sub) {
      return Response.json({ valid: false });
    }

    // Look up lead context to return to the client. The lead's leadCode is
    // safe to return — the subordinate already redeemed under it, and the
    // mobile client uses it solely for posting verdicts back to the team.
    const lead = await getTeamLeadByCode(sub.leadCode);

    return Response.json({
      valid:       true,
      subordinate: sub,
      orgId:       sub.orgId,
      orgName:     sub.orgName,
      leadCode:    sub.leadCode,
      leadName:    sub.leadName,
      maxSubs:     lead?.maxSubordinates ?? null,
    });
  } catch (err) {
    console.error("[team/redeem-subordinate]", err);
    return Response.json({ valid: false, error: "Service unavailable" }, { status: 503 });
  }
}
